import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { buildCatalog } from "../src/core/catalog.js";
import { openBrowserDeck } from "../src/core/browser.js";
import { inspectDeckFile } from "../src/core/inspect.js";
import { renderDeck } from "../src/core/render.js";

const example = resolve("examples/aurora/deck.html");

describe("Chromium artifact smoke test", () => {
  it("renders PNG, PDF, PPTX, and catalog outputs", async () => {
    const root = await mkdtemp(join(tmpdir(), "presentlab-render-"));
    const renderDir = join(root, "render");
    const result = await renderDeck({
      inputPath: example,
      outputDir: renderDir,
      formats: ["png", "pdf", "pptx"],
    });

    expect(result.inspection.slides).toHaveLength(3);
    expect(result.artifacts.filter((artifact) => artifact.format === "png")).toHaveLength(3);
    for (const artifact of result.artifacts) {
      expect((await stat(artifact.path)).size).toBeGreaterThan(100);
    }
    expect((await readFile(join(renderDir, "deck.pdf"))).subarray(0, 4).toString()).toBe("%PDF");
    expect((await readFile(join(renderDir, "deck.pptx"))).subarray(0, 2).toString()).toBe("PK");

    const catalog = await buildCatalog({
      inputPath: example,
      outputDir: join(root, "catalog"),
      formats: ["html", "pdf"],
    });
    expect(catalog.files.map((file) => file.format)).toEqual(["html", "pdf"]);
    expect((await stat(join(root, "catalog", "catalog.pdf"))).size).toBeGreaterThan(100);
  }, 120_000);

  it("blocks local file assets outside the workspace root", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "presentlab-workspace-"));
    const outside = await mkdtemp(join(tmpdir(), "presentlab-outside-"));
    const outsideImage = join(outside, "outside.png");
    const inputPath = join(workspace, "deck.html");
    const onePixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    await writeFile(outsideImage, onePixelPng);
    await writeFile(
      inputPath,
      `<!doctype html><html data-pl-title="Safe" data-pl-format="16:9"><body><section class="pl-slide" data-slide-id="safe"><h1>Safe</h1><img alt="outside" src="${pathToFileURL(outsideImage).href}"></section></body></html>`,
      "utf8",
    );

    const { inspection } = await inspectDeckFile(inputPath);
    const deck = await openBrowserDeck(inputPath, inspection, { workspaceRoot: workspace });
    try {
      const imageState = await deck.page.locator("img").evaluate((image) => ({
        complete: image.complete,
        naturalWidth: image.naturalWidth,
      }));
      expect(imageState.complete).toBe(true);
      expect(imageState.naturalWidth).toBe(0);
    } finally {
      await deck.close();
    }
  }, 120_000);
});
