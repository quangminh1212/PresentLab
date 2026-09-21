import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { inspectDeckHtml } from "../../src/core/inspect.js";

const root = resolve("templates");
const workspaceRoot = resolve(".");

describe("template gallery", () => {
  it("contains 770 templates with 670 researched style presets and HTML-first sources", async () => {
    const index = JSON.parse(await readFile(join(root, "index.json"), "utf8")) as Array<{
      name: string;
      path: string;
      family: string;
      styleCategory?: string;
    }>;
    expect(index).toHaveLength(770);
    expect(new Set(index.map((entry) => entry.name)).size).toBe(770);
    expect(index.filter((entry) => entry.styleCategory)).toHaveLength(670);

    const styleCatalog = JSON.parse(await readFile(join(root, "style-catalog.json"), "utf8")) as {
      count: number;
      styles: unknown[];
    };
    expect(styleCatalog.count).toBe(670);
    expect(styleCatalog.styles).toHaveLength(670);

    for (const entry of index) {
      const folder = dirname(join(root, entry.path));
      const files = (await readdir(folder, { withFileTypes: true }))
        .filter((child) => child.isFile())
        .map((child) => child.name)
        .sort();
      const sourceOnly = Boolean(entry.styleCategory) || entry.name !== entry.family;
      expect(files).toContain("deck.html");
      if (!sourceOnly) {
        expect(files).toEqual(["deck.html", "deck.pptx"]);
      }

      const html = await readFile(join(folder, "deck.html"), "utf8");
      const inspection = inspectDeckHtml(html);
      expect(inspection.errors).toEqual([]);
      expect(inspection.slides.length).toBeGreaterThan(0);
      expect(new Set(inspection.slides.map((slide) => slide.id)).size).toBe(
        inspection.slides.length,
      );
      const layoutMarkers = [...html.matchAll(/data-template-layout="([^"]+)"/g)].map(
        (match) => match[1],
      );
      expect(layoutMarkers).toHaveLength(20);
      expect(new Set(layoutMarkers).size).toBe(20);
      const diversityTokens = [...html.matchAll(/data-diversity-token="([^"]+)"/g)].map(
        (match) => match[1],
      );
      expect(diversityTokens).toHaveLength(inspection.slides.length);
      expect(new Set(diversityTokens).size).toBe(inspection.slides.length);
      expect(html).toContain('data-pl-profile="');
      expect(html).toContain('data-pl-diversity-signature="');

      if (!sourceOnly) {
        expect((await stat(join(folder, "deck.pptx"))).size).toBeGreaterThan(10_000);
      }
    }
  }, 120_000);

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
    const inspection = inspectDeckHtml(catalogHtml);
    expect(inspection.errors).toEqual([]);
    expect(inspection.slides).toHaveLength(15);
    for (const palette of index.palettes) {
      expect((await stat(join(workspaceRoot, palette.path))).size).toBeGreaterThan(100);
      expect(palette.swatches).toHaveLength(7);
    }
    expect(
      (await stat(join(workspaceRoot, "resources", "palettes", "catalog.pptx"))).size,
    ).toBeGreaterThan(10_000);
  }, 30_000);
});
