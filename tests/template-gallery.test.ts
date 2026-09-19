import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { inspectDeckHtml } from "../src/core/inspect.js";

const root = resolve("templates");
const workspaceRoot = resolve(".");

describe("template gallery", () => {
  it("contains 100 independent template folders with three handoff artifacts", async () => {
    const index = JSON.parse(await readFile(join(root, "index.json"), "utf8")) as Array<{
      name: string;
      path: string;
    }>;
    expect(index).toHaveLength(100);
    expect(new Set(index.map((entry) => entry.name)).size).toBe(100);

    for (const entry of index) {
      const folder = join(root, entry.name);
      expect((await readdir(folder)).sort()).toEqual(["deck.html", "deck.pdf", "deck.pptx"]);

      const html = await readFile(join(folder, "deck.html"), "utf8");
      const inspection = inspectDeckHtml(html, 100);
      expect(inspection.errors).toEqual([]);
      expect(inspection.slides.length).toBeGreaterThanOrEqual(25);
      expect(new Set(inspection.slides.map((slide) => slide.id)).size).toBe(
        inspection.slides.length,
      );

      expect((await stat(join(folder, "deck.pdf"))).size).toBeGreaterThan(10_000);
      expect((await stat(join(folder, "deck.pptx"))).size).toBeGreaterThan(10_000);
    }
  }, 30_000);

  it("contains a client-facing 13-palette catalog with a cinematic option", async () => {
    const index = JSON.parse(
      await readFile(join(workspaceRoot, "resources", "palettes", "index.json"), "utf8"),
    ) as {
      catalog: { slideCount: number };
      palettes: Array<{ name: string; path: string; swatches: unknown[] }>;
    };
    expect(index.catalog.slideCount).toBe(15);
    expect(index.palettes).toHaveLength(13);
    expect(index.palettes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "cinematic", swatches: expect.any(Array) }),
      ]),
    );

    const catalogHtml = await readFile(
      join(workspaceRoot, "resources", "palettes", "catalog.html"),
      "utf8",
    );
    const inspection = inspectDeckHtml(catalogHtml, 100);
    expect(inspection.errors).toEqual([]);
    expect(inspection.slides).toHaveLength(15);
    for (const palette of index.palettes) {
      expect((await stat(join(workspaceRoot, palette.path))).size).toBeGreaterThan(100);
      expect(palette.swatches).toHaveLength(7);
    }
    expect(
      (await stat(join(workspaceRoot, "resources", "palettes", "catalog.pdf"))).size,
    ).toBeGreaterThan(10_000);
    expect(
      (await stat(join(workspaceRoot, "resources", "palettes", "catalog.pptx"))).size,
    ).toBeGreaterThan(10_000);
  }, 30_000);
});
