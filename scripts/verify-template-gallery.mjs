import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { inspectDeckFile } from "../dist/core/inspect.js";

const root = resolve(import.meta.dirname, "..");
const templatesRoot = join(root, "templates");
const index = JSON.parse(await readFile(join(templatesRoot, "index.json"), "utf8"));
const expectedTemplateCount = 100;
const expectedMinimumSlideCount = 25;
const templateDirectories = (await readdir(templatesRoot, { withFileTypes: true })).filter(
  (entry) => entry.isDirectory(),
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
