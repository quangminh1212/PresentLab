import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { inspectDeckFile } from "../dist/core/inspect.js";

const root = resolve(import.meta.dirname, "..");
const templatesRoot = join(root, "templates");
const palettesRoot = join(root, "resources", "palettes");
const expectedTemplateCount = 770;
const expectedStylePresetCount = 670;
const index = JSON.parse(await readFile(join(templatesRoot, "index.json"), "utf8"));
const templateEntries = Array.isArray(index) ? index : [];
const categoryForEntry = (entry) => entry.styleGroup ?? entry.family;
const sourceNameForEntry = (entry) => {
  const category = categoryForEntry(entry);
  const name =
    entry.name === category || entry.name.startsWith(`${category}-`)
      ? entry.name
      : `${category}-${entry.name}`;
  return `${name}.html`;
};

if (!Array.isArray(index) || index.length !== expectedTemplateCount) {
  throw new Error(
    `Expected ${expectedTemplateCount} gallery templates, found ${Array.isArray(index) ? index.length : "invalid index"}.`,
  );
}
if (new Set(index.map((entry) => entry.name)).size !== expectedTemplateCount) {
  throw new Error("Template index contains duplicate names.");
}

const expectedCategoryNames = new Set(templateEntries.map(categoryForEntry));
const templateChildren = await readdir(templatesRoot, { withFileTypes: true });
const categoryDirectories = templateChildren.filter(
  (entry) => entry.isDirectory() && entry.name !== "palettes",
);
const actualCategoryNames = new Set(categoryDirectories.map((entry) => entry.name));
const missingCategories = [...expectedCategoryNames].filter(
  (name) => !actualCategoryNames.has(name),
);
const unexpectedCategories = [...actualCategoryNames].filter(
  (name) => !expectedCategoryNames.has(name),
);
const rootTemplateHtml = templateChildren
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => entry.name);

if (missingCategories.length > 0) {
  throw new Error(`Missing indexed design-style directories: ${missingCategories.join(", ")}.`);
}
if (unexpectedCategories.length > 0) {
  throw new Error(
    `Unexpected design-style directories under the template repository: ${unexpectedCategories.join(", ")}.`,
  );
}
if (rootTemplateHtml.length > 0) {
  throw new Error(
    `Template HTML must live inside design-style directories: ${rootTemplateHtml.join(", ")}.`,
  );
}

for (const category of expectedCategoryNames) {
  const categoryPath = join(templatesRoot, category);
  const expectedNames = templateEntries
    .filter((entry) => categoryForEntry(entry) === category)
    .map(sourceNameForEntry)
    .sort();
  const children = await readdir(categoryPath, { withFileTypes: true });
  const unexpectedNestedDirectories = children.filter((entry) => entry.isDirectory());
  if (unexpectedNestedDirectories.length > 0) {
    throw new Error(`${category} must contain template files directly, not nested directories.`);
  }
  const actualNames = children
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort();
  if (actualNames.join("|") !== expectedNames.join("|")) {
    throw new Error(
      `${category} contains ${actualNames.length} HTML sources; expected ${expectedNames.length}.`,
    );
  }
}

const styleEntries = index.filter((entry) => entry.styleCategory);
if (styleEntries.length !== expectedStylePresetCount) {
  throw new Error(
    `Expected ${expectedStylePresetCount} researched style presets, found ${styleEntries.length}.`,
  );
}
const styleCatalog = JSON.parse(await readFile(join(templatesRoot, "style-catalog.json"), "utf8"));
if (
  styleCatalog.count !== expectedStylePresetCount ||
  !Array.isArray(styleCatalog.styles) ||
  styleCatalog.styles.length !== expectedStylePresetCount
) {
  throw new Error("The style catalog does not contain the expected 670 style presets.");
}
for (const style of styleCatalog.styles) {
  const entry = templateEntries.find((candidate) => candidate.name === style.name);
  if (!entry || style.path !== `${style.styleGroup}/${sourceNameForEntry(entry)}`) {
    throw new Error(`${style.name} must expose a categorized HTML source path.`);
  }
}

const themeIndex = JSON.parse(
  await readFile(join(root, "resources", "themes", "index.json"), "utf8"),
);
if (!Array.isArray(themeIndex) || themeIndex.length !== expectedTemplateCount) {
  throw new Error(
    `Expected ${expectedTemplateCount} theme entries, found ${Array.isArray(themeIndex) ? themeIndex.length : "invalid"}.`,
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
    `Expected ${expectedPaletteCount} palette entries, found ${Array.isArray(paletteIndex.palettes) ? paletteIndex.palettes.length : "invalid"}.`,
  );
}
if (paletteIndex.catalog?.slideCount !== expectedPaletteCatalogSlideCount) {
  throw new Error(
    `Expected the palette catalog to contain ${expectedPaletteCatalogSlideCount} slides, found ${paletteIndex.catalog?.slideCount ?? "invalid metadata"}.`,
  );
}
if (paletteIndex.catalog?.html !== "resources/palettes/catalog.html") {
  throw new Error("Palette catalog metadata must expose HTML only.");
}
const paletteCatalogPath = join(palettesRoot, "catalog.html");
const { inspection: paletteCatalogInspection } = await inspectDeckFile(paletteCatalogPath);
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

async function findForbiddenArtifacts(directory) {
  const found = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return found;
    throw error;
  }
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await findForbiddenArtifacts(entryPath)));
    } else if (/\.(?:pdf|pptx)$/i.test(entry.name)) {
      found.push(entryPath);
    }
  }
  return found;
}

const forbiddenArtifacts = [
  ...(await findForbiddenArtifacts(templatesRoot)),
  ...(await findForbiddenArtifacts(palettesRoot)),
];
if (forbiddenArtifacts.length > 0) {
  throw new Error(`Cached PDF/PPTX artifacts must not exist: ${forbiddenArtifacts.join(", ")}.`);
}

for (const entry of index) {
  const expectedPath = `${categoryForEntry(entry)}/${sourceNameForEntry(entry)}`;
  if (entry.path !== expectedPath) {
    throw new Error(`${entry.name} must expose the categorized HTML path ${expectedPath}.`);
  }
  const htmlPath = join(templatesRoot, entry.path);
  const { inspection } = await inspectDeckFile(htmlPath);
  if (inspection.errors.length > 0 || inspection.slides.length === 0) {
    throw new Error(
      `${entry.name} HTML is invalid or has the wrong slide count: ${inspection.errors.join("; ")}`,
    );
  }
  const html = await readFile(htmlPath, "utf8");
  const layoutMarkers = [...html.matchAll(/data-template-layout="([^"]+)"/g)].map(
    (match) => match[1],
  );
  if (layoutMarkers.length !== 20 || new Set(layoutMarkers).size !== layoutMarkers.length) {
    throw new Error(`${entry.name} must expose 20 unique named layout markers.`);
  }
  const diversityTokens = [...html.matchAll(/data-diversity-token="([^"]+)"/g)].map(
    (match) => match[1],
  );
  if (
    diversityTokens.length !== inspection.slides.length ||
    new Set(diversityTokens).size !== diversityTokens.length
  ) {
    throw new Error(
      `${entry.name} must expose one unique diversity token for each of its ${inspection.slides.length} slides.`,
    );
  }
  if (!html.includes('data-pl-profile="') || !html.includes('data-pl-diversity-signature="')) {
    throw new Error(`${entry.name} must expose a deterministic diversity profile.`);
  }
  console.log(`OK ${entry.name}: ${inspection.slides.length} slides, categorized HTML source`);
}

console.log("Template gallery verification passed.");
