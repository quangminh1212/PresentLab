import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { buildCatalog } from "../core/catalog.js";
import { getErrorMessage } from "../core/errors.js";
import { getWorkspaceRoot, relativeArtifactPath, resolveWorkspacePath } from "../core/files.js";
import { inspectDeckFile, toValidationResult } from "../core/inspect.js";
import { renderDeck } from "../core/render.js";
import { CatalogFormatSchema, OutputFormatSchema, PageFormatSchema } from "../core/schema.js";
import type { CatalogFormat, OutputFormat } from "../core/schema.js";

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
  family: z.string(),
  palette: z.string(),
  modifier: z.string(),
  path: z.string(),
});

const TemplatesOutputSchema = z.object({ templates: z.array(TemplateSchema) });

const TemplateContentOutputSchema = z.object({
  name: z.string(),
  path: z.string(),
  html: z.string(),
});

const ThemeSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  family: z.string(),
  palette: z.string(),
  modifier: z.string(),
  path: z.string(),
});

const ThemesOutputSchema = z.object({ themes: z.array(ThemeSchema) });

const PaletteSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  mood: z.string(),
  recommendedFor: z.string(),
  catalogSlide: z.number().int().positive(),
  swatches: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      hex: z.string(),
    }),
  ),
  tokens: z.record(z.string(), z.string()),
  path: z.string(),
});

const PaletteCatalogSchema = z.object({
  title: z.string(),
  description: z.string(),
  slideCount: z.number().int().positive(),
  html: z.string(),
  pdf: z.string(),
  pptx: z.string(),
});

const PalettesOutputSchema = z.object({
  catalog: PaletteCatalogSchema,
  palettes: z.array(PaletteSchema),
});
const PaletteOutputSchema = z.object({ palette: PaletteSchema });

type Template = z.infer<typeof TemplateSchema>;
type Theme = z.infer<typeof ThemeSchema>;
type Palette = z.infer<typeof PaletteSchema>;

async function loadTemplates(root: string): Promise<Template[]> {
  const indexPath = join(root, "resources", "templates", "index.json");
  const raw = JSON.parse(await readFile(indexPath, "utf8")) as unknown;
  return z.array(TemplateSchema).parse(raw);
}

async function loadThemes(root: string): Promise<Theme[]> {
  const indexPath = join(root, "resources", "themes", "index.json");
  const raw = JSON.parse(await readFile(indexPath, "utf8")) as unknown;
  return z.array(ThemeSchema).parse(raw);
}

async function loadPalettes(root: string): Promise<z.infer<typeof PalettesOutputSchema>> {
  const indexPath = join(root, "resources", "palettes", "index.json");
  const raw = JSON.parse(await readFile(indexPath, "utf8")) as unknown;
  return PalettesOutputSchema.parse(raw);
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
        maxSlides: z.number().int().min(1).optional(),
      }),
      outputSchema: ValidationOutputSchema,
    },
    async ({ input, maxSlides }) => {
      const inputPath = pathForTool(root, input, "input");
      const { inspection } = await inspectDeckFile(inputPath, maxSlides);
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
        maxSlides: z.number().int().min(1).optional(),
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
        ...(maxSlides === undefined ? {} : { maxSlides }),
        ...(allowExternalAssets === undefined ? {} : { allowExternalAssets }),
        workspaceRoot: root,
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
        maxSlides: z.number().int().min(1).optional(),
        allowExternalAssets: z.boolean().optional(),
      }),
      outputSchema: CatalogOutputSchema,
    },
    async ({ input, outputDir, formats, maxSlides, allowExternalAssets }) => {
      const catalogOptions = {
        inputPath: pathForTool(root, input, "input"),
        outputDir: pathForTool(root, outputDir, "outputDir"),
        formats: (formats ?? ["html", "pdf"]) as CatalogFormat[],
        ...(maxSlides === undefined ? {} : { maxSlides }),
        ...(allowExternalAssets === undefined ? {} : { allowExternalAssets }),
        workspaceRoot: root,
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

  server.registerTool(
    "presentlab_get_template",
    {
      title: "Read a PresentLab template",
      description:
        "Read the HTML source of a named local template after discovering it with presentlab_list_templates.",
      inputSchema: z.object({ name: z.string().min(1) }),
      outputSchema: TemplateContentOutputSchema,
    },
    async ({ name }) => {
      const template = (await loadTemplates(root)).find((candidate) => candidate.name === name);
      if (!template) throw new Error(`Unknown PresentLab template '${name}'.`);
      const templatePath = pathForTool(root, template.path, "template");
      return toolText({
        name: template.name,
        path: relativeArtifactPath(root, templatePath),
        html: await readFile(templatePath, "utf8"),
      });
    },
  );

  server.registerTool(
    "presentlab_list_themes",
    {
      title: "List PresentLab themes",
      description: "List local design themes and token metadata for an AI deck authoring workflow.",
      inputSchema: z.object({}),
      outputSchema: ThemesOutputSchema,
    },
    async () => toolText({ themes: await loadThemes(root) }),
  );

  server.registerTool(
    "presentlab_list_palettes",
    {
      title: "List PresentLab color palettes",
      description:
        "List curated slide color palettes, named swatch roles, recommended uses, and the visual catalog paths for client selection.",
      inputSchema: z.object({}),
      outputSchema: PalettesOutputSchema,
    },
    async () => toolText(await loadPalettes(root)),
  );

  server.registerTool(
    "presentlab_get_palette",
    {
      title: "Read a PresentLab color palette",
      description:
        "Read one named slide color palette after discovering it with presentlab_list_palettes.",
      inputSchema: z.object({ name: z.string().min(1) }),
      outputSchema: PaletteOutputSchema,
    },
    async ({ name }) => {
      const { palettes } = await loadPalettes(root);
      const palette: Palette | undefined = palettes.find((candidate) => candidate.name === name);
      if (!palette) throw new Error(`Unknown PresentLab palette '${name}'.`);
      return toolText({ palette });
    },
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

  server.registerResource(
    "presentlab-palettes",
    "presentlab://palettes",
    {
      title: "PresentLab color palette index",
      description: "Curated slide color palettes for client selection and AI deck authoring.",
      mimeType: "application/json",
      cacheHint: { ttlMs: 60_000, cacheScope: "public" },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(await loadPalettes(root), null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "presentlab-palette-catalog",
    "presentlab://palettes/catalog",
    {
      title: "PresentLab color palette catalog",
      description: "HTML visual catalog for choosing a slide color direction.",
      mimeType: "text/html",
      cacheHint: { ttlMs: 60_000, cacheScope: "public" },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html",
          text: await readFile(join(root, "resources", "palettes", "catalog.html"), "utf8"),
        },
      ],
    }),
  );

  server.registerResource(
    "presentlab-palette-content",
    new ResourceTemplate("presentlab://palettes/{name}", {
      list: async () => ({
        resources: (await loadPalettes(root)).palettes.map((palette) => ({
          uri: `presentlab://palettes/${encodeURIComponent(palette.name)}`,
          name: palette.name,
          title: palette.title,
          description: palette.description,
          mimeType: "application/json",
        })),
      }),
    }),
    {
      title: "PresentLab palette tokens",
      description: "Read one reusable slide color palette and its named swatch roles.",
      mimeType: "application/json",
      cacheHint: { ttlMs: 60_000, cacheScope: "public" },
    },
    async (uri, variables) => {
      const palette = (await loadPalettes(root)).palettes.find(
        (candidate) => candidate.name === variables.name,
      );
      if (!palette) throw new Error(`Unknown PresentLab palette '${variables.name}'.`);
      const palettePath = pathForTool(root, palette.path, "palette");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: await readFile(palettePath, "utf8"),
          },
        ],
      };
    },
  );

  server.registerResource(
    "presentlab-template-content",
    new ResourceTemplate("presentlab://templates/{name}", {
      list: async () => ({
        resources: (await loadTemplates(root)).map((template) => ({
          uri: `presentlab://templates/${encodeURIComponent(template.name)}`,
          name: template.name,
          title: template.title,
          description: template.description,
          mimeType: "text/html",
        })),
      }),
    }),
    {
      title: "PresentLab template source",
      description: "Read one reusable local HTML template.",
      mimeType: "text/html",
      cacheHint: { ttlMs: 60_000, cacheScope: "public" },
    },
    async (uri, variables) => {
      const template = (await loadTemplates(root)).find(
        (candidate) => candidate.name === variables.name,
      );
      if (!template) throw new Error(`Unknown PresentLab template '${variables.name}'.`);
      const templatePath = pathForTool(root, template.path, "template");
      return {
        contents: [
          { uri: uri.href, mimeType: "text/html", text: await readFile(templatePath, "utf8") },
        ],
      };
    },
  );

  server.registerResource(
    "presentlab-theme-content",
    new ResourceTemplate("presentlab://themes/{name}", {
      list: async () => ({
        resources: (await loadThemes(root)).map((theme) => ({
          uri: `presentlab://themes/${encodeURIComponent(theme.name)}`,
          name: theme.name,
          title: theme.title,
          description: theme.description,
          mimeType: "application/json",
        })),
      }),
    }),
    {
      title: "PresentLab theme tokens",
      description: "Read one reusable local theme token file.",
      mimeType: "application/json",
      cacheHint: { ttlMs: 60_000, cacheScope: "public" },
    },
    async (uri, variables) => {
      const theme = (await loadThemes(root)).find((candidate) => candidate.name === variables.name);
      if (!theme) throw new Error(`Unknown PresentLab theme '${variables.name}'.`);
      const themePath = pathForTool(root, theme.path, "theme");
      return {
        contents: [
          { uri: uri.href, mimeType: "application/json", text: await readFile(themePath, "utf8") },
        ],
      };
    },
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
              "Before composing, call presentlab_list_palettes and choose a named palette that matches the audience and story.",
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
