import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { renderDeck } from "../src/core/render.js";

const root = resolve(".");

describe("template gallery browser render", () => {
  it("renders every gallery source to seven PNG pages, a PDF, and a PPTX", async () => {
    const index = JSON.parse(
      await readFile(join(root, "templates", "index.json"), "utf8"),
    ) as Array<{ name: string }>;

    for (const entry of index) {
      const outputDir = join(root, ".artifacts", "template-gallery-integration", entry.name);
      const result = await renderDeck({
        inputPath: join(root, "templates", entry.name, "deck.html"),
        outputDir,
        formats: ["png", "pdf", "pptx"],
        workspaceRoot: root,
      });

      expect(result.inspection.errors).toEqual([]);
      expect(result.inspection.slides).toHaveLength(7);
      expect(result.artifacts.filter((artifact) => artifact.format === "png")).toHaveLength(7);
      for (const artifact of result.artifacts) {
        expect((await stat(artifact.path)).size).toBeGreaterThan(100);
      }
    }
  }, 900_000);
});
