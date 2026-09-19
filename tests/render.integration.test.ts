import { readFile, stat } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { buildCatalog } from "../src/core/catalog.js";
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
});
