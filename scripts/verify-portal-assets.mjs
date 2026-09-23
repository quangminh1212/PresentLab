import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.env.PRESENTLAB_PORTAL_VERIFY_ROOT ?? ".");
const requiredAssets = [
  "public/index.html",
  "public/portal/index.html",
  "public/web/portal/index.html",
  "public/web/portal/app.js",
  "public/web/portal/styles.css",
  "public/web/portal/world.css",
  "public/web/portal/world.js",
  "public/web/portal/xlab-logo.png",
  "public/web/vendor/three/three.module.js",
  "public/web/vendor/three/three.core.js",
  "public/web/vendor/three/textures/waternormals.jpg",
  "public/resources/templates/index.json",
  "public/resources/palettes/index.json",
  "public/resources/palettes/catalog.html",
];

for (const relativePath of requiredAssets) {
  const filePath = resolve(root, relativePath);
  const metadata = await stat(filePath);
  if (!metadata.isFile() || metadata.size === 0) {
    throw new Error(`Built portal asset is missing or empty: ${relativePath}`);
  }
}

const worldSource = await readFile(resolve(root, "public/web/portal/world.js"), "utf8");
const portalHtml = await readFile(resolve(root, "public/web/portal/index.html"), "utf8");
const appSource = await readFile(resolve(root, "public/web/portal/app.js"), "utf8");
for (const [source, reference] of [
  [worldSource, "../vendor/three/three.module.js"],
  [worldSource, "/web/vendor/three/textures/waternormals.jpg"],
  [worldSource, "new THREE.ShaderMaterial"],
  [worldSource, "seamless-close-up-water"],
  [worldSource, "screen-space-water-ripple"],
  [portalHtml, "/web/portal/styles.css"],
  [portalHtml, "/web/portal/world.css"],
  [portalHtml, "data-xlab-world-canvas"],
  [appSource, "./world.js"],
]) {
  if (!source.includes(reference)) {
    throw new Error(`Built portal is missing the expected runtime reference: ${reference}`);
  }
}

if (
  portalHtml.includes("water-surface.webm") ||
  portalHtml.includes("data-world-water-video") ||
  worldSource.includes("water-surface.webm") ||
  worldSource.includes("addons/objects/Water.js")
) {
  throw new Error("Built portal still references the retired water footage or Three.js addon.");
}

for (const retiredAsset of [
  "public/web/portal/water-surface.webm",
  "public/web/vendor/three/addons/objects/Water.js",
  "public/web/vendor/three/addons/objects/Sky.js",
]) {
  let exists = false;
  try {
    await stat(resolve(root, retiredAsset));
    exists = true;
  } catch (error) {
    if (!(error instanceof Error) || !(error.code === "ENOENT")) throw error;
  }
  if (exists)
    throw new Error(`Retired water asset was included in the deploy output: ${retiredAsset}`);
}

console.log(`Portal runtime assets verified: ${requiredAssets.length} files.`);
