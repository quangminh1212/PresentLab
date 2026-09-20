import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const templatesRoot = join(root, "templates");
const expectedTemplateCount = 770;
const similarityThreshold = 0.5;

function attribute(html, name) {
  return html.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? "";
}

function hashString(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function signatureFor(entry, html) {
  const profileSignature = attribute(html, "data-pl-diversity-signature");
  const profileParts = profileSignature.split("|");
  const visibleText = html
    .replaceAll(/<style[\s\S]*?<\/style>/g, "")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  const features = new Set([
    `base:${entry.baseFamily ?? entry.family}`,
    `palette:${entry.palette ?? "base"}`,
    `group:${entry.styleGroup ?? "core"}`,
    `treatment:${entry.styleTreatment ?? entry.modifier}`,
    `mode:${attribute(html, "data-pl-composition")}`,
    `variant:${profileParts[1] ?? ""}`,
    `pad:${profileParts[2] ?? ""}`,
    `gap:${profileParts[3] ?? ""}`,
    `lift:${profileParts[4] ?? ""}`,
    `title:${profileParts[5] ?? ""}`,
    `split:${profileParts[6] ?? ""}`,
    `radius:${profileParts[7] ?? ""}`,
    `grid:${profileParts[8] ?? ""}`,
    `copy:${hashString(visibleText.slice(0, 2400))}`,
  ]);
  return features;
}

const index = JSON.parse(await readFile(join(templatesRoot, "index.json"), "utf8"));
if (!Array.isArray(index) || index.length !== expectedTemplateCount) {
  throw new Error(
    `Expected ${expectedTemplateCount} templates before similarity verification, found ${Array.isArray(index) ? index.length : "invalid index"}.`,
  );
}

const signatures = [];
for (const entry of index) {
  const html = await readFile(join(templatesRoot, entry.path), "utf8");
  const signature = signatureFor(entry, html);
  if (signature.size < 14) {
    throw new Error(`${entry.name} has an unexpectedly small diversity signature.`);
  }
  signatures.push({ name: entry.name, signature });
}

let maxSimilarity = 0;
let mostSimilar = null;
for (let left = 0; left < signatures.length; left += 1) {
  const leftSignature = signatures[left].signature;
  for (let right = left + 1; right < signatures.length; right += 1) {
    const rightSignature = signatures[right].signature;
    let intersection = 0;
    for (const feature of leftSignature) {
      if (rightSignature.has(feature)) {
        intersection += 1;
      }
    }
    const similarity = intersection / (leftSignature.size + rightSignature.size - intersection);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilar = [signatures[left].name, signatures[right].name, intersection];
    }
  }
}

if (maxSimilarity >= similarityThreshold) {
  throw new Error(
    `Template similarity threshold exceeded: ${mostSimilar?.[0]} vs ${mostSimilar?.[1]} = ${(maxSimilarity * 100).toFixed(2)}% (${mostSimilar?.[2]} shared signature features).`,
  );
}

console.log(
  `SIMILARITY_OK templates=${signatures.length} max=${(maxSimilarity * 100).toFixed(2)}% threshold=${similarityThreshold * 100}% pair=${mostSimilar?.[0] ?? "none"}<>${mostSimilar?.[1] ?? "none"}`,
);
