import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.env.PRESENTLAB_PORTAL_VERIFY_ROOT ?? ".");
const requiredAssets = [
  "public/web/portal/index.html",
  "public/web/portal/app.js",
  "public/web/portal/world.css",
  "public/web/portal/world.js",
  "public/web/vendor/three/three.module.js",
  "public/web/vendor/three/three.core.js",
  "public/web/vendor/three/addons/objects/Water.js",
  "public/web/vendor/three/addons/objects/Sky.js",
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
const portalHtml = await readFile(resolve(root, "public/web/portal/index.html"), "utf8");
const appSource = await readFile(resolve(root, "public/web/portal/app.js"), "utf8");
for (const [source, reference] of [
  [worldSource, "../vendor/three/three.module.js"],
  [worldSource, "../vendor/three/addons/objects/Water.js"],
  [worldSource, "../vendor/three/addons/objects/Sky.js"],
  [worldSource, "threejs-water-addon-over-studio-backdrop"],
  [worldSource, "/web/vendor/three/textures/waternormals.jpg"],
  [portalHtml, "/web/portal/world.css"],
  [portalHtml, "data-xlab-world-canvas"],
  [appSource, "./world.js"],
]) {
  if (!source.includes(reference)) {
    throw new Error(`Built portal is missing the expected water runtime reference: ${reference}`);
  }
}

if (portalHtml.includes("data-world-water-video") || portalHtml.includes("water-surface.webm")) {
  throw new Error("Portal hero still references the removed ocean footage.");
}

console.log(`Portal runtime assets verified: ${requiredAssets.length} files.`);
