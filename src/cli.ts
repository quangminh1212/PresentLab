#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { buildCatalog } from "./core/catalog.js";
import { getErrorMessage } from "./core/errors.js";
import { getWorkspaceRoot, resolveWorkspacePath } from "./core/files.js";
import { inspectDeckFile, toValidationResult } from "./core/inspect.js";
import { artifactSummary, renderDeck } from "./core/render.js";
import { CatalogFormatSchema, OutputFormatSchema } from "./core/schema.js";
import type { CatalogFormat, OutputFormat } from "./core/schema.js";
import { runMcpServer } from "./mcp/server.js";

const HELP = `PresentLab HTML-first renderer

Usage:
  presentlab validate --input <deck.html> [--max-slides 100] [--json]
  presentlab render --input <deck.html> --output <dir> [--format png,pdf,pptx]
  presentlab catalog --input <deck.html> --output <dir> [--format html,pdf]
  presentlab templates
  presentlab mcp

Options:
  --allow-external-assets  Allow trusted HTML to load http(s) assets.
  --json                   Print machine-readable JSON.
  --help                   Show this help.
`;

type CliValues = Record<string, unknown>;

function stringOption(values: CliValues, name: string, required = true): string | undefined {
  const value = values[name];
  if (typeof value === "string" && value.trim()) return value;
  if (!required) return undefined;
  throw new Error(`Missing required option --${name}.`);
}

function numberOption(values: CliValues, name: string, fallback: number): number {
  const raw = values[name];
  if (raw === undefined) return fallback;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) {
    throw new Error(`Option --${name} must be a positive integer.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`Option --${name} must be a positive integer.`);
  }
  return value;
}

function booleanOption(values: CliValues, name: string): boolean {
  return values[name] === true;
}

function parseOutputFormats<T extends string>(
  raw: string | undefined,
  schema: { safeParse(value: unknown): { success: boolean; data?: T } },
  fallback: readonly T[],
): T[] {
  if (!raw) return [...fallback];
  const formats = [
    ...new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
  if (formats.length === 0 || formats.some((format) => !schema.safeParse(format).success)) {
    throw new Error(`Unsupported format list: ${raw}`);
  }
  return formats as T[];
}

function parseCli(args: readonly string[]) {
  return parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      input: { type: "string", short: "i" },
      output: { type: "string", short: "o" },
      format: { type: "string", short: "f" },
      "max-slides": { type: "string" },
      "allow-external-assets": { type: "boolean" },
      json: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
}

async function commandValidate(values: CliValues, root: string): Promise<number> {
  const inputPath = resolveWorkspacePath(root, stringOption(values, "input")!, "input");
  const maxSlides = numberOption(values, "max-slides", 100);
  const { inspection } = await inspectDeckFile(inputPath, maxSlides);
  const result = toValidationResult(inspection);
  if (booleanOption(values, "json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${result.valid ? "VALID" : "INVALID"}: ${result.title}`);
    console.log(`format=${result.format} slides=${result.slideCount}`);
    for (const warning of result.warnings) console.log(`warning: ${warning}`);
    for (const error of result.errors) console.log(`error: ${error}`);
  }
  return result.valid ? 0 : 1;
}

async function commandRender(values: CliValues, root: string): Promise<number> {
  const inputPath = resolveWorkspacePath(root, stringOption(values, "input")!, "input");
  const outputDir = resolveWorkspacePath(root, stringOption(values, "output")!, "output");
  const formats = parseOutputFormats<OutputFormat>(
    stringOption(values, "format", false),
    OutputFormatSchema,
    ["png", "pdf", "pptx"],
  );
  const result = await renderDeck({
    inputPath,
    outputDir,
    formats,
    maxSlides: numberOption(values, "max-slides", 100),
    allowExternalAssets: booleanOption(values, "allow-external-assets"),
    workspaceRoot: root,
  });
  if (booleanOption(values, "json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Rendered ${result.inspection.slides.length} slides to ${result.outputDir}`);
    console.log(artifactSummary(result));
  }
  return 0;
}

async function commandCatalog(values: CliValues, root: string): Promise<number> {
  const inputPath = resolveWorkspacePath(root, stringOption(values, "input")!, "input");
  const outputDir = resolveWorkspacePath(root, stringOption(values, "output")!, "output");
  const formats = parseOutputFormats<CatalogFormat>(
    stringOption(values, "format", false),
    CatalogFormatSchema,
    ["html", "pdf"],
  );
  const result = await buildCatalog({
    inputPath,
    outputDir,
    formats,
    maxSlides: numberOption(values, "max-slides", 100),
    allowExternalAssets: booleanOption(values, "allow-external-assets"),
    workspaceRoot: root,
  });
  if (booleanOption(values, "json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `Cataloged ${result.render.inspection.slides.length} slides to ${result.outputDir}`,
    );
    console.log(result.files.map((file) => `${file.format}: ${file.relativePath}`).join(", "));
  }
  return 0;
}

async function commandTemplates(root: string): Promise<number> {
  const indexPath = join(root, "resources", "templates", "index.json");
  const content = await readFile(indexPath, "utf8");
  console.log(content.trim());
  return 0;
}

export async function main(args = process.argv.slice(2)): Promise<number> {
  const parsed = parseCli(args);
  const command = parsed.positionals[0] ?? "help";
  const values = parsed.values as CliValues;
  if (booleanOption(values, "help") || command === "help") {
    console.log(HELP);
    return 0;
  }

  const root = getWorkspaceRoot();
  switch (command) {
    case "validate":
      return commandValidate(values, root);
    case "render":
      return commandRender(values, root);
    case "catalog":
      return commandCatalog(values, root);
    case "templates":
      return commandTemplates(root);
    case "mcp":
      await runMcpServer(root);
      return 0;
    default:
      throw new Error(`Unknown command '${command}'.\n\n${HELP}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error: unknown) => {
      console.error(`PresentLab error: ${getErrorMessage(error)}`);
      process.exitCode = 1;
    });
}
