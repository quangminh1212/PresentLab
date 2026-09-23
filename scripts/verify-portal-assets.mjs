import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const requiredAssets = [
  "public/web/portal/world.js",
  "public/web/vendor/three/three.module.js",
  "public/web/vendor/three/three.core.js",
  "public/web/vendor/three/addons/objects/Water.js",
  "public/web/vendor/three/textures/waternormals.jpg",
];

for (const relativePath of requiredAssets) {
  const filePath = resolve(root, relativePath);
  const metadata = await stat(filePath);
  if (!metadata.isFile() || metadata.size === 0) {
    throw new Error(`Portal runtime asset is missing or empty: ${relativePath}`);
  }
}

const worldSource = await readFile(resolve(root, "public/web/portal/world.js"), "utf8");
for (const importPath of [
  "../vendor/three/three.module.js",
  "../vendor/three/addons/objects/Water.js",
  "/web/vendor/three/textures/waternormals.jpg",
]) {
  if (!worldSource.includes(importPath)) {
    throw new Error(`Built portal world is missing the expected Three.js reference: ${importPath}`);
  }
}

console.log(`Portal runtime assets verified: ${requiredAssets.length} files.`);
