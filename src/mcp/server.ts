import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { buildCatalog } from "../core/catalog.js";
import { getErrorMessage } from "../core/errors.js";
import { getWorkspaceRoot, relativeArtifactPath, resolveWorkspacePath } from "../core/files.js";
import { inspectDeckFile, toValidationResult } from "../core/inspect.js";
import { renderDeck } from "../core/render.js";
import { CatalogFormatSchema, OutputFormatSchema, PageFormatSchema } from "../core/schema.js";
import type { CatalogFormat, OutputFormat } from "../core/schema.js";

const MAX_SLIDES = 100;

const ValidationOutputSchema = z.object({
  valid: z.boolean(),
  title: z.string(),
  format: PageFormatSchema,
  slideCount: z.number().int(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

const ArtifactOutputSchema = z.object({
  format: z.string(),
  path: z.string(),
});

const RenderOutputSchema = z.object({
  outputDir: z.string(),
  sourceHash: z.string(),
  slideCount: z.number().int(),
  artifacts: z.array(ArtifactOutputSchema),
  warnings: z.array(z.string()),
});

const CatalogOutputSchema = z.object({
  outputDir: z.string(),
  slideCount: z.number().int(),
  files: z.array(ArtifactOutputSchema),
});

const TemplateSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  path: z.string(),
});

const TemplatesOutputSchema = z.object({ templates: z.array(TemplateSchema) });

type Template = z.infer<typeof TemplateSchema>;

async function loadTemplates(root: string): Promise<Template[]> {
  const indexPath = join(root, "resources", "templates", "index.json");
  const raw = JSON.parse(await readFile(indexPath, "utf8")) as unknown;
  return z.array(TemplateSchema).parse(raw);
}

function pathForTool(root: string, candidate: string, label: string): string {
  return resolveWorkspacePath(root, candidate, label);
}

function toolText(value: unknown): {
  content: [{ type: "text"; text: string }];
  structuredContent: unknown;
} {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  };
}

export function createPresentLabServer(requestedRoot?: string): McpServer {
  const root = getWorkspaceRoot(requestedRoot);
  const server = new McpServer(
    { name: "presentlab", version: "0.1.0" },
    {
      instructions:
        "PresentLab turns trusted HTML decks into validated PNG, PDF, PPTX, and catalog artifacts. Start with presentlab_validate_deck, then render only a valid deck. Paths are relative to the configured workspace and external network assets are blocked unless explicitly enabled.",
    },
  );

  server.registerTool(
    "presentlab_validate_deck",
    {
      title: "Validate an HTML deck",
      description:
        "Validate the PresentLab HTML deck contract, slide ids, slide count, metadata, and basic image accessibility before rendering.",
      inputSchema: z.object({
        input: z.string().min(1).describe("HTML file path relative to the PresentLab workspace."),
        maxSlides: z.number().int().min(1).max(MAX_SLIDES).optional(),
      }),
      outputSchema: ValidationOutputSchema,
    },
    async ({ input, maxSlides }) => {
      const inputPath = pathForTool(root, input, "input");
      const { inspection } = await inspectDeckFile(inputPath, maxSlides ?? MAX_SLIDES);
      const output = toValidationResult(inspection);
      return toolText(output);
    },
  );

  server.registerTool(
    "presentlab_render_deck",
    {
      title: "Render an HTML deck",
      description:
        "Render a valid PresentLab HTML deck to PNG slide images, print PDF, and/or fidelity-first PPTX. The output directory stays inside the configured workspace.",
      inputSchema: z.object({
        input: z.string().min(1),
        outputDir: z.string().min(1),
        formats: z.array(OutputFormatSchema).min(1).max(3).optional(),
        maxSlides: z.number().int().min(1).max(MAX_SLIDES).optional(),
        allowExternalAssets: z.boolean().optional(),
      }),
      outputSchema: RenderOutputSchema,
    },
    async ({ input, outputDir, formats, maxSlides, allowExternalAssets }) => {
      const inputPath = pathForTool(root, input, "input");
      const resolvedOutputDir = pathForTool(root, outputDir, "outputDir");
      const renderOptions = {
        inputPath,
        outputDir: resolvedOutputDir,
        formats: (formats ?? ["png", "pdf", "pptx"]) as OutputFormat[],
        maxSlides: maxSlides ?? MAX_SLIDES,
        ...(allowExternalAssets === undefined ? {} : { allowExternalAssets }),
      } as const;
      const result = await renderDeck(renderOptions);
      const output = {
        outputDir: relativeArtifactPath(root, result.outputDir),
        sourceHash: result.sourceHash,
        slideCount: result.inspection.slides.length,
        artifacts: result.artifacts.map((artifact) => ({
          format: artifact.format,
          path: relativeArtifactPath(root, artifact.path),
        })),
        warnings: result.inspection.warnings,
      };
      return toolText(output);
    },
  );

  server.registerTool(
    "presentlab_build_catalog",
    {
      title: "Build a slide catalog",
      description:
        "Render a deck's thumbnails and create a browsable HTML catalog and/or A4 landscape PDF contact sheet.",
      inputSchema: z.object({
        input: z.string().min(1),
        outputDir: z.string().min(1),
        formats: z.array(CatalogFormatSchema).min(1).max(2).optional(),
        maxSlides: z.number().int().min(1).max(MAX_SLIDES).optional(),
        allowExternalAssets: z.boolean().optional(),
      }),
      outputSchema: CatalogOutputSchema,
    },
    async ({ input, outputDir, formats, maxSlides, allowExternalAssets }) => {
      const catalogOptions = {
        inputPath: pathForTool(root, input, "input"),
        outputDir: pathForTool(root, outputDir, "outputDir"),
        formats: (formats ?? ["html", "pdf"]) as CatalogFormat[],
        maxSlides: maxSlides ?? MAX_SLIDES,
        ...(allowExternalAssets === undefined ? {} : { allowExternalAssets }),
      } as const;
      const result = await buildCatalog(catalogOptions);
      const output = {
        outputDir: relativeArtifactPath(root, result.outputDir),
        slideCount: result.render.inspection.slides.length,
        files: result.files.map((file) => ({
          format: file.format,
          path: relativeArtifactPath(root, file.path),
        })),
      };
      return toolText(output);
    },
  );

  server.registerTool(
    "presentlab_list_templates",
    {
      title: "List PresentLab templates",
      description: "List local HTML design templates and their intended use.",
      inputSchema: z.object({}),
      outputSchema: TemplatesOutputSchema,
    },
    async () => toolText({ templates: await loadTemplates(root) }),
  );

  server.registerResource(
    "presentlab-deck-schema",
    "presentlab://schema/deck",
    {
      title: "PresentLab deck schema",
      description: "JSON Schema for the normalized deck inspection result.",
      mimeType: "application/schema+json",
      cacheHint: { ttlMs: 60_000, cacheScope: "public" },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/schema+json",
          text: await readFile(join(root, "schemas", "deck.schema.json"), "utf8"),
        },
      ],
    }),
  );

  server.registerResource(
    "presentlab-templates",
    "presentlab://templates",
    {
      title: "PresentLab template index",
      description: "Reusable local design templates for AI-generated HTML decks.",
      mimeType: "application/json",
      cacheHint: { ttlMs: 60_000, cacheScope: "public" },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(await loadTemplates(root), null, 2),
        },
      ],
    }),
  );

  server.registerPrompt(
    "presentlab_design_deck",
    {
      title: "Design a PresentLab HTML deck",
      description: "Give an AI agent a precise brief for generating a valid, accessible HTML deck.",
      argsSchema: z.object({
        brief: z.string().min(10),
        format: PageFormatSchema.optional(),
      }),
    },
    ({ brief, format }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "Create a PresentLab HTML deck from this brief:",
              brief,
              "",
              `Use format ${format ?? "16:9"}. Include <html data-pl-format="${format ?? "16:9"}" data-pl-title="..."> and one unique [data-pl-slide] element per page.`,
              "Give every slide a data-slide-id, a meaningful heading, and alt text for every image.",
              "Prefer local resources and deterministic CSS. Do not fetch external assets unless explicitly requested.",
              "After writing the HTML, call presentlab_validate_deck, fix all errors, then call presentlab_render_deck.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  return server;
}

export async function runMcpServer(requestedRoot?: string): Promise<void> {
  const root = getWorkspaceRoot(requestedRoot);
  const handle = serveStdio(() => createPresentLabServer(root), {
    onerror: (error) => console.error(`PresentLab MCP error: ${getErrorMessage(error)}`),
  });
  console.error(`PresentLab MCP server running on stdio (root: ${root})`);

  await new Promise<void>((resolve) => {
    let finished = false;
    const finish = (): void => {
      if (finished) return;
      finished = true;
      void handle.close().finally(resolve);
    };
    process.once("SIGINT", finish);
    process.once("SIGTERM", finish);
    process.stdin.once("end", finish);
    process.stdin.once("close", finish);
  });
}
