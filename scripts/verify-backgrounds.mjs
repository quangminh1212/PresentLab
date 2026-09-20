import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { backgroundModes } from "./background-system.mjs";

const root = resolve(import.meta.dirname, "..");
const templatesRoot = join(root, "templates");
const expectedTemplateCount = 770;
const similarityThreshold = 0.1;
const signatureFields = [
  "serial",
  "mode",
  "angle",
  "angle2",
  "band",
  "blend",
  "contrast",
  "density",
  "focus",
  "layers",
  "opacity",
  "period",
  "period2",
  "phase",
  "scale",
  "texture",
  "x",
  "x2",
  "y",
  "y2",
];

function attribute(html, name) {
  return html.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? "";
}

function featureSet(html) {
  const signature = attribute(html, "data-pl-background-signature");
  const values = signature.split("|");
  if (values.length !== signatureFields.length) {
    throw new Error(
      `Background signature has ${values.length} fields; expected ${signatureFields.length}.`,
    );
  }
  const [
    ,
    mode,
    angle,
    angle2,
    band,
    blend,
    contrast,
    density,
    focus,
    layers,
    opacity,
    period,
    period2,
    phase,
    scale,
    texture,
    x,
    x2,
    y,
    y2,
  ] = values;
  return {
    mode: attribute(html, "data-pl-background-mode"),
    id: attribute(html, "data-pl-background-id"),
    signature,
    // Compare complete geometry/rhythm/placement tokens instead of treating one shared scalar
    // (for example the same angle) as evidence that two backgrounds are visually alike.
    features: new Set([
      `background:mode=${mode}`,
      `background:blend=${blend}`,
      `background:geometry=${mode}:${angle}:${angle2}:${band}`,
      `background:rhythm=${period}:${period2}:${phase}`,
      `background:focal=${focus}:${x}:${y}`,
      `background:secondary=${x2}:${y2}:${scale}`,
      `background:surface=${contrast}:${density}:${layers}:${opacity}`,
      `background:texture=${texture}:${phase}:${angle}`,
      `background:mode-rhythm=${mode}:${period}:${scale}`,
      `background:blend-band-focus=${blend}:${band}:${focus}`,
      `background:angle-period=${angle}:${period}`,
      `background:angle2-period2=${angle2}:${period2}`,
      `background:position=${x}:${y}`,
      `background:secondary-position=${x2}:${y2}`,
      `background:focal-scale=${focus}:${scale}`,
      `background:band-phase=${band}:${phase}`,
      `background:density-opacity=${density}:${opacity}`,
      `background:texture-mode=${texture}:${mode}`,
    ]),
  };
}

const index = JSON.parse(await readFile(join(templatesRoot, "index.json"), "utf8"));
if (!Array.isArray(index) || index.length !== expectedTemplateCount) {
  throw new Error(
    `Expected ${expectedTemplateCount} templates before background verification, found ${Array.isArray(index) ? index.length : "invalid index"}.`,
  );
}

const knownModes = new Set(backgroundModes);
const seenIds = new Set();
const seenSignatures = new Set();
const backgrounds = [];
for (const entry of index) {
  const html = await readFile(join(templatesRoot, entry.path), "utf8");
  const background = featureSet(html);
  if (!knownModes.has(background.mode)) {
    throw new Error(`${entry.name} uses unknown background mode: ${background.mode || "missing"}.`);
  }
  if (!background.id || seenIds.has(background.id)) {
    throw new Error(`${entry.name} has a missing or duplicate background id: ${background.id}.`);
  }
  if (seenSignatures.has(background.signature)) {
    throw new Error(`${entry.name} has a duplicate background signature.`);
  }
  seenIds.add(background.id);
  seenSignatures.add(background.signature);
  backgrounds.push({ name: entry.name, ...background });
}

let maxSimilarity = 0;
let mostSimilar = null;
for (let left = 0; left < backgrounds.length; left += 1) {
  const leftFeatures = backgrounds[left].features;
  for (let right = left + 1; right < backgrounds.length; right += 1) {
    const rightFeatures = backgrounds[right].features;
    let intersection = 0;
    for (const feature of leftFeatures) {
      if (rightFeatures.has(feature)) {
        intersection += 1;
      }
    }
    const similarity = intersection / (leftFeatures.size + rightFeatures.size - intersection);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilar = [backgrounds[left].name, backgrounds[right].name, intersection];
    }
  }
}

if (maxSimilarity >= similarityThreshold) {
  throw new Error(
    `Background similarity threshold exceeded: ${mostSimilar?.[0]} vs ${mostSimilar?.[1]} = ${(maxSimilarity * 100).toFixed(2)}% (${mostSimilar?.[2]} shared parameters).`,
  );
}

console.log(
  `BACKGROUND_SIMILARITY_OK templates=${backgrounds.length} modes=${knownModes.size} max=${(maxSimilarity * 100).toFixed(2)}% threshold=${similarityThreshold * 100}% pair=${mostSimilar?.[0] ?? "none"}<>${mostSimilar?.[1] ?? "none"}`,
);
