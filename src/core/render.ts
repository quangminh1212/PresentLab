import { basename, join } from "node:path";

import { ensureDirectory, relativeArtifactPath } from "./files.js";
import { inspectDeckFile } from "./inspect.js";
import { openBrowserDeck, type BrowserDeckOptions } from "./browser.js";
import { writePptx } from "./pptx.js";
import { pageDimensions } from "./schema.js";
import type { DeckInspection, OutputFormat } from "./schema.js";

export interface RenderDeckOptions extends BrowserDeckOptions {
  readonly inputPath: string;
  readonly outputDir: string;
  readonly formats: readonly OutputFormat[];
  readonly maxSlides?: number;
}

export interface RenderArtifact {
  readonly format: OutputFormat;
  readonly path: string;
  readonly relativePath: string;
}

export interface RenderResult {
  readonly inputPath: string;
  readonly outputDir: string;
  readonly sourceHash: string;
  readonly inspection: DeckInspection;
  readonly artifacts: readonly RenderArtifact[];
}

function outputSegment(value: string): string {
  return (
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "slide"
  );
}

function uniqueFormats(formats: readonly OutputFormat[]): OutputFormat[] {
  return [...new Set(formats)];
}

function renderManifest(
  inspection: DeckInspection,
  sourceHash: string,
  artifacts: readonly RenderArtifact[],
): Record<string, unknown> {
  return {
    renderer: "presentlab",
    rendererVersion: "0.1.0",
    sourceHash,
    title: inspection.manifest.title,
    format: inspection.manifest.format,
    slideCount: inspection.slides.length,
    slides: inspection.slides,
    artifacts: artifacts.map(({ format, relativePath }) => ({ format, path: relativePath })),
  };
}

async function writePdf(
  deck: Awaited<ReturnType<typeof openBrowserDeck>>,
  outputPath: string,
): Promise<void> {
  const dimensions = pageDimensions(deck.inspection.manifest.format);
  await deck.page.emulateMedia({ media: "print" });
  await deck.page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    width: `${dimensions.widthIn}in`,
    height: `${dimensions.heightIn}in`,
    tagged: true,
    outline: true,
  });
  await deck.page.emulateMedia({ media: "screen" });
}

export async function renderDeck(options: RenderDeckOptions): Promise<RenderResult> {
  const formats = uniqueFormats(options.formats);
  if (formats.length === 0) {
    throw new Error("At least one output format is required.");
  }
  const { inspection, sourceHash } = await inspectDeckFile(options.inputPath, options.maxSlides);
  if (inspection.errors.length > 0) {
    throw new Error(`Deck validation failed:\n${inspection.errors.join("\n")}`);
  }
  await ensureDirectory(options.outputDir);

  const deck = await openBrowserDeck(options.inputPath, inspection, options);
  const artifacts: RenderArtifact[] = [];
  const slideFiles: string[] = [];
  try {
    if (formats.includes("png") || formats.includes("pptx")) {
      const slidesDir = join(options.outputDir, "slides");
      await ensureDirectory(slidesDir);
      for (const slide of inspection.slides) {
        const filePath = join(
          slidesDir,
          `${String(slide.index).padStart(3, "0")}-${outputSegment(slide.id)}.png`,
        );
        await deck.slides.nth(slide.index - 1).screenshot({
          path: filePath,
          animations: "disabled",
          scale: "css",
        });
        slideFiles.push(filePath);
        artifacts.push({
          format: "png",
          path: filePath,
          relativePath: relativeArtifactPath(options.outputDir, filePath),
        });
      }
    }

    if (formats.includes("pdf")) {
      const filePath = join(options.outputDir, "deck.pdf");
      await writePdf(deck, filePath);
      artifacts.push({
        format: "pdf",
        path: filePath,
        relativePath: relativeArtifactPath(options.outputDir, filePath),
      });
    }

    if (formats.includes("pptx")) {
      const filePath = join(options.outputDir, "deck.pptx");
      await writePptx({ outputPath: filePath, manifest: inspection.manifest, slideFiles });
      artifacts.push({
        format: "pptx",
        path: filePath,
        relativePath: relativeArtifactPath(options.outputDir, filePath),
      });
    }

    const manifestPath = join(options.outputDir, "render-manifest.json");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(
      manifestPath,
      `${JSON.stringify(renderManifest(inspection, sourceHash, artifacts), null, 2)}\n`,
      "utf8",
    );

    return {
      inputPath: options.inputPath,
      outputDir: options.outputDir,
      sourceHash,
      inspection,
      artifacts,
    };
  } finally {
    await deck.close();
  }
}

export function artifactSummary(result: RenderResult): string {
  return result.artifacts
    .map((artifact) => `${artifact.format}: ${basename(artifact.path)}`)
    .join(", ");
}
