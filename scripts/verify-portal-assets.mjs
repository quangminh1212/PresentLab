import { readdir, readFile, stat } from "node:fs/promises";
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
  "public/lusion/index.html",
  "public/home-scroll.css",
  "public/_astro/hoisted.CUO_IjfL.js",
  "public/_astro/about.CNa9RfUh.css",
  "public/_astro/local-only.js",
  "public/assets/meta/favicon.ico",
  "public/assets/fonts/Aeonik-Regular.woff2",
  "public/assets/models/home/cross.buf",
  "public/assets/projects/lusion_labs/home.webp",
  "public/assets/projects/porsche_dream_machine/video0.mp4",
  "public/about/index.html",
  "public/projects/index.html",
  "public/projects/porsche_dream_machine/index.html",
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
const lusionHtml = await readFile(resolve(root, "public/lusion/index.html"), "utf8");
const lusionBundle = await readFile(resolve(root, "public/_astro/hoisted.CUO_IjfL.js"), "utf8");
const portalStyles = await readFile(resolve(root, "public/web/portal/world.css"), "utf8");
for (const [source, reference] of [
  [worldSource, "../vendor/three/three.module.js"],
  [worldSource, "../vendor/three/addons/objects/Water.js"],
  [worldSource, "../vendor/three/addons/objects/Sky.js"],
  [worldSource, "threejs-water-addon-over-open-ocean-horizon"],
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

for (const [source, reference] of [
  [portalHtml, 'class="lusion-home-frame"'],
  [portalHtml, 'src="/lusion/"'],
  [portalStyles, ".lusion-home-frame"],
  [lusionHtml, 'id="home-hero"'],
  [lusionHtml, 'id="projects-main"'],
  [lusionHtml, 'id="footer-section"'],
  [lusionBundle, 'e==="lusion"?"":e.startsWith("lusion/")?e.slice(7):e'],
  [lusionBundle, 'e||"/lusion/"'],
  [lusionBundle, 'e?"/"+e:"/lusion/"'],
]) {
  if (!source.includes(reference)) {
    throw new Error(`Built portal is missing the Lusion home reference: ${reference}`);
  }
}

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath)));
    else if (entry.isFile())
      files.push(entryPath.slice(directory.length + 1).replaceAll("\\", "/"));
  }
  return files.sort();
};

const sourceProjectAssets = await listFiles(resolve(root, "web/lusion/assets"));
const deployedProjectAssets = await listFiles(resolve(root, "public/assets"));
if (
  sourceProjectAssets.length !== deployedProjectAssets.length ||
  sourceProjectAssets.some((asset, index) => asset !== deployedProjectAssets[index])
) {
  throw new Error("The deployed Lusion asset tree does not match the source asset tree.");
}

console.log(
  `Portal and Lusion runtime assets verified: ${requiredAssets.length} required files, ${deployedProjectAssets.length} Lusion assets.`,
);
