import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { parseHTML } from "linkedom";

const root = resolve(process.env.PRESENTLAB_PORTAL_VERIFY_ROOT ?? ".");
const requiredAssets = [
  "public/index.html",
  "public/portal/index.html",
  "public/web/portal/index.html",
  "public/web/portal/app.js",
  "public/web/portal/world.css",
  "public/web/portal/world.js",
  "public/web/portal/xlab-logo.webp",
  "public/web/vendor/three/three.module.js",
  "public/web/vendor/three/addons/objects/Water.js",
  "public/_astro/lusion-section.css",
  "public/_astro/hoisted.CUO_IjfL.js",
  "public/_astro/about.CNa9RfUh.css",
  "public/_astro/local-only.js",
  "public/home-scroll.css",
  "public/assets/meta/favicon.ico",
  "public/assets/meta/social_sharing_xlab.png",
  "public/assets/fonts/Aeonik-Regular.woff2",
  "public/assets/models/home/cross.buf",
  "public/assets/projects/lusion_labs/home.webp",
  "public/about/index.html",
  "public/projects/index.html",
  "public/projects/porsche_dream_machine/index.html",
];

for (const relativePath of requiredAssets) {
  const metadata = await stat(resolve(root, relativePath));
  if (!metadata.isFile() || metadata.size === 0) {
    throw new Error(`Portal runtime asset is missing or empty: ${relativePath}`);
  }
}

const portalHtml = await readFile(resolve(root, "public/index.html"), "utf8");
const portalAliasHtml = await readFile(
  resolve(root, "public/portal/index.html"),
  "utf8",
);
const portalApp = await readFile(resolve(root, "public/web/portal/app.js"), "utf8");
const lusionBundle = await readFile(
  resolve(root, "public/_astro/hoisted.CUO_IjfL.js"),
  "utf8",
);
const lusionStyles = await readFile(
  resolve(root, "public/_astro/lusion-section.css"),
  "utf8",
);
const { document } = parseHTML(portalHtml);
const lusionSection = document.querySelector(
  "section#templates .lusion-home-content[data-lusion-home-content]",
);
if (!lusionSection) {
  throw new Error("The root Portal page has no native Lusion content in #templates.");
}
for (const selector of [
  "#home-hero",
  "#page-container",
  "#projects-main",
  "#footer-section",
  "#canvas",
  "#preloader",
]) {
  if (!lusionSection.querySelector(selector)) {
    throw new Error(`The native Lusion section is missing ${selector}.`);
  }
}
if (lusionSection.querySelector("iframe, frame, object, embed")) {
  throw new Error("The Lusion section still contains an embedded document.");
}
if (
  !portalAliasHtml.includes('id="home-hero"') ||
  !portalAliasHtml.includes('class="lusion-home-content"')
) {
  throw new Error("The /portal alias does not use the same native Portal page.");
}
if (!portalHtml.includes('href="/_astro/lusion-section.css"')) {
  throw new Error("The root Portal page is missing its scoped Lusion styles.");
}
for (const reference of [
  ".lusion-home-content #canvas",
  "html.is-ready .lusion-home-content #canvas",
  ".lusion-home-content #page-container",
]) {
  if (!lusionStyles.includes(reference)) {
    throw new Error(`Scoped Lusion styles are missing ${reference}.`);
  }
}
if (/<iframe\b[^>]*class="lusion-home-frame"|water-page-embed|\/lusion\//i.test(
  `${portalHtml}\n${portalApp}\n${lusionBundle}`,
)) {
  throw new Error("The Portal output still creates or references a /lusion/ embed route.");
}

try {
  await stat(resolve(root, "public/lusion"));
  throw new Error("The legacy /lusion/ output still exists.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const routeConfig = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
const rootRewrite = routeConfig.rewrites.some(
  ({ source, destination }) => source === "/" && destination === "/index.html",
);
if (!rootRewrite) throw new Error("Vercel does not route / to the Portal page.");
const lusionRoute = routeConfig.rewrites.some(({ source }) =>
  source === "/lusion" || source.startsWith("/lusion/"),
);
if (lusionRoute) throw new Error("Vercel still declares a /lusion route.");

const listFiles = async (directory, baseDirectory = directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath, baseDirectory)));
    else if (entry.isFile())
      files.push(entryPath.slice(baseDirectory.length + 1).replaceAll("\\", "/"));
  }
  return files.sort();
};

const projectFiles = await listFiles(resolve(root, "public", "projects"));
for (const relativePath of projectFiles.filter((file) => file.endsWith(".html"))) {
  const html = await readFile(resolve(root, "public", "projects", relativePath), "utf8");
  if (/<a\b[^>]*\bclass="[^\"]*\bproject-item\b[^\"]*"/i.test(html)) {
    throw new Error(`A project card still links to a detail page: ${relativePath}`);
  }
  const visibleMarkup = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const staleText = />[^<>]*\bLusion\b[^<>]*</i.test(visibleMarkup);
  const staleAttribute = [...visibleMarkup.matchAll(/<[^>]+>/g)].some((match) =>
    /\b(?:aria-label|alt|title)=("|')[^"']*\bLusion\b[^"']*\1/i.test(match[0]),
  );
  if (staleText || staleAttribute) {
    throw new Error(`A project page still shows the Lusion name: ${relativePath}`);
  }
}

console.log(
  `Portal and native Lusion section verified: ${requiredAssets.length} required assets.`,
);
