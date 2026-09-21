import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { renderDeck } from "../../src/core/render.js";

const root = resolve(".");

describe("template gallery browser render", () => {
  it("renders representative core, variant, and style sources to every PNG page", async () => {
    const index = JSON.parse(
      await readFile(join(root, "templates", "index.json"), "utf8"),
    ) as Array<{
      name: string;
      path: string;
      family: string;
      styleCategory?: string;
    }>;

    const coreEntries = index.filter(
      (entry) => !entry.styleCategory && entry.name === entry.family,
    );
    const variantEntries = index.filter(
      (entry) => !entry.styleCategory && entry.name !== entry.family,
    );
    const styleEntries = index.filter((entry) => entry.styleCategory);
    const sampleIndexes = [
      0,
      Math.floor(styleEntries.length / 3),
      Math.floor((styleEntries.length * 2) / 3),
      styleEntries.length - 1,
    ];
    const entries = [
      ...coreEntries,
      ...[0, Math.floor(variantEntries.length / 2), variantEntries.length - 1].map(
        (entryIndex) => variantEntries[entryIndex],
      ),
      ...sampleIndexes.map((entryIndex) => styleEntries[entryIndex]),
    ].filter((entry, entryIndex, allEntries) => entry && allEntries.indexOf(entry) === entryIndex);

    expect(index).toHaveLength(770);
    expect(coreEntries).toHaveLength(8);
    expect(entries.length).toBeGreaterThanOrEqual(12);

    let completed = 0;
    for (const entry of entries) {
      const outputDir = join(root, ".artifacts", "template-gallery-integration", entry.name);
      const result = await renderDeck({
        inputPath: join(root, "templates", entry.path),
        outputDir,
        formats: ["png"],
        workspaceRoot: root,
      });

      expect(result.inspection.errors).toEqual([]);
      expect(result.inspection.slides.length).toBeGreaterThan(0);
      expect(result.artifacts.filter((artifact) => artifact.format === "png").length).toBe(
        result.inspection.slides.length,
      );
      for (const artifact of result.artifacts) {
        expect((await stat(artifact.path)).size).toBeGreaterThan(100);
      }
      completed += 1;
      if (completed % 5 === 0 || completed === entries.length) {
        console.log(`Rendered ${completed}/${entries.length} representative gallery sources`);
      }
    }
  }, 900_000);
});
