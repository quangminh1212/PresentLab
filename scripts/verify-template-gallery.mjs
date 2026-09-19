import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { inspectDeckFile } from "../dist/core/inspect.js";

const root = resolve(import.meta.dirname, "..");
const templatesRoot = join(root, "templates");
const palettesRoot = join(root, "resources", "palettes");
const index = JSON.parse(await readFile(join(templatesRoot, "index.json"), "utf8"));
const expectedTemplateCount = 100;
const expectedMinimumSlideCount = 25;
const templateEntries = Array.isArray(index) ? index : [];
const templateNames = new Set(templateEntries.map((entry) => entry.name));
const allTemplateDirectories = (await readdir(templatesRoot, { withFileTypes: true })).filter(
  (entry) => entry.isDirectory(),
);
const templateDirectories = allTemplateDirectories.filter((entry) => templateNames.has(entry.name));
const unexpectedTemplateDirectories = allTemplateDirectories.filter(
  (entry) => !templateNames.has(entry.name) && entry.name !== "palettes",
);

if (!Array.isArray(index) || index.length !== expectedTemplateCount) {
  throw new Error(
    `Expected ${expectedTemplateCount} gallery templates, found ${Array.isArray(index) ? index.length : "invalid index"}.`,
  );
}
if (templateDirectories.length !== expectedTemplateCount) {
  throw new Error(
    `Expected ${expectedTemplateCount} template directories, found ${templateDirectories.length}.`,
  );
}
if (unexpectedTemplateDirectories.length > 0) {
  throw new Error(
    `Unexpected directories under the template repository: ${unexpectedTemplateDirectories.map((entry) => entry.name).join(", ")}.`,
  );
}
if (new Set(index.map((entry) => entry.name)).size !== expectedTemplateCount) {
  throw new Error("Template index contains duplicate names.");
}

const themeIndex = JSON.parse(
  await readFile(join(root, "resources", "themes", "index.json"), "utf8"),
);
if (!Array.isArray(themeIndex) || themeIndex.length !== expectedTemplateCount) {
  throw new Error(
    `Expected ${expectedTemplateCount} theme entries, found ${Array.isArray(themeIndex) ? themeIndex.length : "invalid index"}.`,
  );
}

const paletteIndex = JSON.parse(await readFile(join(palettesRoot, "index.json"), "utf8"));
const expectedPaletteCount = 13;
const expectedPaletteCatalogSlideCount = expectedPaletteCount + 2;
if (
  !Array.isArray(paletteIndex.palettes) ||
  paletteIndex.palettes.length !== expectedPaletteCount
) {
  throw new Error(
    `Expected ${expectedPaletteCount} palette entries, found ${Array.isArray(paletteIndex.palettes) ? paletteIndex.palettes.length : "invalid index"}.`,
  );
}
if (paletteIndex.catalog?.slideCount !== expectedPaletteCatalogSlideCount) {
  throw new Error(
    `Expected the palette catalog to contain ${expectedPaletteCatalogSlideCount} slides, found ${paletteIndex.catalog?.slideCount ?? "invalid metadata"}.`,
  );
}
const paletteCatalogPath = join(palettesRoot, "catalog.html");
const { inspection: paletteCatalogInspection } = await inspectDeckFile(paletteCatalogPath, 100);
if (
  paletteCatalogInspection.errors.length > 0 ||
  paletteCatalogInspection.slides.length !== expectedPaletteCatalogSlideCount
) {
  throw new Error(
    `Palette catalog HTML is invalid or has the wrong slide count: ${paletteCatalogInspection.errors.join("; ")}`,
  );
}
for (const palette of paletteIndex.palettes) {
  const paletteJsonPath = join(root, palette.path);
  const paletteJson = JSON.parse(await readFile(paletteJsonPath, "utf8"));
  if (
    paletteJson.name !== palette.name ||
    !Array.isArray(paletteJson.swatches) ||
    paletteJson.swatches.length !== 7
  ) {
    throw new Error(`${palette.name} palette metadata is incomplete.`);
  }
}
for (const artifact of ["catalog.pdf", "catalog.pptx"]) {
  const artifactPath = join(palettesRoot, artifact);
  const bytes = await readFile(artifactPath);
  const signature = artifact.endsWith(".pdf") ? "%PDF" : "PK";
  if (bytes.subarray(0, signature.length).toString() !== signature) {
    throw new Error(`Palette catalog ${artifact} does not have the expected signature.`);
  }
  if ((await stat(artifactPath)).size < 10_000) {
    throw new Error(`Palette catalog ${artifact} is unexpectedly small.`);
  }
}

for (const entry of index) {
  if (entry.path !== `${entry.name}/deck.html`) {
    throw new Error(`${entry.name} must expose a repository-relative deck.html path.`);
  }
  const templateDir = join(templatesRoot, entry.name);
  const names = (await readdir(templateDir)).sort();
  const expectedNames = ["deck.html", "deck.pdf", "deck.pptx"];
  if (names.join("|") !== expectedNames.join("|")) {
    throw new Error(`${entry.name} must contain exactly deck.html, deck.pdf, and deck.pptx.`);
  }

  const htmlPath = join(templateDir, "deck.html");
  const { inspection } = await inspectDeckFile(htmlPath, 100);
  if (inspection.errors.length > 0 || inspection.slides.length < expectedMinimumSlideCount) {
    throw new Error(
      `${entry.name} HTML is invalid or has the wrong slide count: ${inspection.errors.join("; ")}`,
    );
  }

  const pdf = await readFile(join(templateDir, "deck.pdf"));
  const pptx = await readFile(join(templateDir, "deck.pptx"));
  if (pdf.subarray(0, 4).toString() !== "%PDF") {
    throw new Error(`${entry.name} PDF does not have a PDF signature.`);
  }
  if (pptx.subarray(0, 2).toString() !== "PK") {
    throw new Error(`${entry.name} PPTX does not have a ZIP signature.`);
  }
  if ((await stat(join(templateDir, "deck.pdf"))).size < 10_000) {
    throw new Error(`${entry.name} PDF is unexpectedly small.`);
  }
  if ((await stat(join(templateDir, "deck.pptx"))).size < 10_000) {
    throw new Error(`${entry.name} PPTX is unexpectedly small.`);
  }
  console.log(`OK ${entry.name}: ${inspection.slides.length} slides, HTML/PDF/PPTX present`);
}

console.log("Template gallery verification passed.");
