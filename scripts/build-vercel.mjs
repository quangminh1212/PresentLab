import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "public");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const assets = [
  ["web/portal/app.js", "web/portal/app.js"],
  ["web/portal/index.html", "web/portal/index.html"],
  ["web/portal/styles.css", "web/portal/styles.css"],
  ["web/portal/world.css", "web/portal/world.css"],
  ["web/portal/world.js", "web/portal/world.js"],
  ["web/portal/xlab-logo.png", "web/portal/xlab-logo.png"],
  ["web/vendor/three/three.module.js", "web/vendor/three/three.module.js"],
  ["web/vendor/three/three.core.js", "web/vendor/three/three.core.js"],
  ["web/vendor/three/textures/waternormals.jpg", "web/vendor/three/textures/waternormals.jpg"],
  ["web/portal/index.html", "index.html"],
  ["web/portal/index.html", "portal/index.html"],
  ["resources/templates/index.json", "resources/templates/index.json"],
  ["resources/palettes/index.json", "resources/palettes/index.json"],
  ["resources/palettes/catalog.html", "resources/palettes/catalog.html"],
];

for (const [source, destination] of assets) {
  const target = join(output, destination);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, source), target, { recursive: true, force: true });
}

console.log(`Vercel static output prepared: ${output}`);
