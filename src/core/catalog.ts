import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { writeFile } from "node:fs/promises";

import { chromium } from "playwright";

import { ensureDirectory, relativeArtifactPath } from "./files.js";
import { inspectDeckFile } from "./inspect.js";
import { renderDeck, type RenderResult } from "./render.js";
import type { CatalogFormat } from "./schema.js";

export interface CatalogOptions {
  readonly inputPath: string;
  readonly outputDir: string;
  readonly formats: readonly CatalogFormat[];
  readonly maxSlides?: number;
  readonly allowExternalAssets?: boolean;
  readonly workspaceRoot?: string;
}

export interface CatalogResult {
  readonly outputDir: string;
  readonly render: RenderResult;
  readonly files: readonly { format: CatalogFormat; path: string; relativePath: string }[];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function catalogHtml(render: RenderResult): string {
  const slides = render.inspection.slides
    .map((slide) => {
      const image = render.artifacts.find(
        (artifact) =>
          artifact.format === "png" && artifact.relativePath.includes(`-${slide.id}.png`),
      );
      if (!image) throw new Error(`Missing thumbnail for slide '${slide.id}'.`);
      const imagePath = relative(render.outputDir, image.path).split("\\").join("/");
      return `
        <article class="card" aria-labelledby="slide-${slide.index}-title">
          <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(slide.title)}" loading="lazy">
          <div class="card-meta">
            <span class="number">${String(slide.index).padStart(2, "0")}</span>
            <h2 id="slide-${slide.index}-title">${escapeHtml(slide.title)}</h2>
            <code>${escapeHtml(slide.id)}</code>
          </div>
        </article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="${escapeHtml(render.inspection.manifest.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(render.inspection.manifest.title)} - PresentLab catalog</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172033; background: #f4f6fa; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 40px; }
    header { max-width: 1400px; margin: 0 auto 28px; display: flex; justify-content: space-between; gap: 24px; align-items: end; }
    h1 { margin: 0; font-size: clamp(28px, 4vw, 56px); letter-spacing: -0.04em; }
    p { margin: 8px 0 0; color: #5b6475; }
    .grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .card { overflow: hidden; background: #fff; border: 1px solid #dfe4ed; border-radius: 18px; box-shadow: 0 14px 34px rgb(23 32 51 / 8%); break-inside: avoid; }
    .card img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: #e8ecf3; }
    .card-meta { padding: 15px 17px 18px; display: grid; grid-template-columns: auto 1fr; column-gap: 12px; align-items: baseline; }
    .number { color: #5b6cf2; font-weight: 800; font-variant-numeric: tabular-nums; }
    h2 { margin: 0; font-size: 17px; }
    code { grid-column: 2; color: #7a8496; font-size: 12px; }
    @media print { body { padding: 12mm; } .grid { grid-template-columns: repeat(2, 1fr); gap: 10mm; } .card { box-shadow: none; } }
  </style>
</head>
<body>
  <header>
    <div><h1>${escapeHtml(render.inspection.manifest.title)}</h1><p>${render.inspection.slides.length} slides · PresentLab catalog</p></div>
    <p>${escapeHtml(render.inspection.manifest.format)}</p>
  </header>
  <main class="grid">${slides}</main>
</body>
</html>
`;
}

async function writeCatalogPdf(htmlPath: string, pdfPath: string): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load", timeout: 15_000 });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      tagged: true,
      outline: true,
    });
  } finally {
    await browser.close();
  }
}

export async function buildCatalog(options: CatalogOptions): Promise<CatalogResult> {
  const formats = [...new Set(options.formats)];
  const { inspection } = await inspectDeckFile(options.inputPath, options.maxSlides);
  if (inspection.errors.length > 0) {
    throw new Error(`Deck validation failed:\n${inspection.errors.join("\n")}`);
  }
  await ensureDirectory(options.outputDir);
  const renderOptions = {
    inputPath: options.inputPath,
    outputDir: options.outputDir,
    formats: ["png"],
    ...(options.maxSlides === undefined ? {} : { maxSlides: options.maxSlides }),
    ...(options.allowExternalAssets === undefined
      ? {}
      : { allowExternalAssets: options.allowExternalAssets }),
    ...(options.workspaceRoot === undefined ? {} : { workspaceRoot: options.workspaceRoot }),
  } as const;
  const render = await renderDeck(renderOptions);

  const files: { format: CatalogFormat; path: string; relativePath: string }[] = [];
  if (formats.includes("html")) {
    const htmlPath = join(options.outputDir, "catalog.html");
    await writeFile(htmlPath, catalogHtml(render), "utf8");
    files.push({
      format: "html",
      path: htmlPath,
      relativePath: relativeArtifactPath(options.outputDir, htmlPath),
    });
  }
  if (formats.includes("pdf")) {
    const htmlPath = join(options.outputDir, "catalog.html");
    if (!files.some((file) => file.format === "html")) {
      await writeFile(htmlPath, catalogHtml(render), "utf8");
    }
    const pdfPath = join(options.outputDir, "catalog.pdf");
    await writeCatalogPdf(htmlPath, pdfPath);
    files.push({
      format: "pdf",
      path: pdfPath,
      relativePath: relativeArtifactPath(options.outputDir, pdfPath),
    });
  }

  return { outputDir: options.outputDir, render, files };
}
