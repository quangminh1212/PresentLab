import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { inspectDeckHtml } from "../src/core/inspect.js";

const root = resolve("templates");

describe("template gallery", () => {
  it("contains eight independent template folders with three handoff artifacts", async () => {
    const index = JSON.parse(await readFile(join(root, "index.json"), "utf8")) as Array<{
      name: string;
      path: string;
    }>;
    expect(index).toHaveLength(8);

    for (const entry of index) {
      const folder = join(root, entry.name);
      expect((await readdir(folder)).sort()).toEqual(["deck.html", "deck.pdf", "deck.pptx"]);

      const html = await readFile(join(folder, "deck.html"), "utf8");
      const inspection = inspectDeckHtml(html, 10);
      expect(inspection.errors).toEqual([]);
      expect(inspection.slides).toHaveLength(7);
      expect(new Set(inspection.slides.map((slide) => slide.id)).size).toBe(7);

      expect((await stat(join(folder, "deck.pdf"))).size).toBeGreaterThan(10_000);
      expect((await stat(join(folder, "deck.pptx"))).size).toBeGreaterThan(10_000);
    }
  });
});
