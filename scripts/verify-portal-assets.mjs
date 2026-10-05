import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { parseHTML } from "linkedom";

const root = resolve(process.env.PRESENTLAB_PORTAL_VERIFY_ROOT ?? ".");
const requiredAssets = [
  "public/index.html",
  "public/portal/index.html",
  "public/web/portal/index.html",
  "public/web/portal/app.js",
  "public/web/portal/styles.css",
  "public/web/portal/world.css",
  "public/web/portal/world.js",
  "public/web/portal/xlab-logo.webp",
  "public/web/vendor/three/three.module.js",
  "public/web/vendor/three/addons/objects/Water.js",
  "public/_astro/hoisted.CUO_IjfL.js",
  "public/_astro/about.CNa9RfUh.css",
  "public/_astro/local-only.js",
  "public/home-scroll.css",
  "public/lusion/index.html",
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

const [portalHtml, portalAliasHtml, lusionHtml, portalStyles, portalWorldStyles, lusionOverrides] =
  await Promise.all([
    readFile(resolve(root, "public/index.html"), "utf8"),
    readFile(resolve(root, "public/portal/index.html"), "utf8"),
    readFile(resolve(root, "public/lusion/index.html"), "utf8"),
    readFile(resolve(root, "public/web/portal/styles.css"), "utf8"),
    readFile(resolve(root, "public/web/portal/world.css"), "utf8"),
    readFile(resolve(root, "public/_astro/local-only.js"), "utf8"),
  ]);

const portalDocument = parseHTML(portalHtml).document;
const portalAliasDocument = parseHTML(portalAliasHtml).document;
const lusionDocument = parseHTML(lusionHtml).document;

const verifyPortalRoute = (document, routeLabel) => {
  if (
    !document.querySelector(
      '.portal-header .portal-header-brand img[src="/web/portal/xlab-logo.webp"]',
    )
  ) {
    throw new Error(`${routeLabel} is missing the XLab header logo.`);
  }
  if (!document.querySelector(".portal-header select[data-locale]")) {
    throw new Error(`${routeLabel} is missing the header language control.`);
  }
  if (!document.querySelector(".portal-header .portal-category-menu .portal-category-trigger")) {
    throw new Error(`${routeLabel} is missing the category menu control.`);
  }
  // The panel must stay a sibling of the trigger in a plain container: a
  // closing <details> hides its content in the same frame the open state drops,
  // which cancels the panel's exit transition.
  if (
    !document.querySelector(
      ".portal-header .portal-category-menu button.portal-category-trigger[aria-expanded] + .portal-category-panel",
    )
  ) {
    throw new Error(
      `${routeLabel} must pair the category trigger with a sibling panel outside <details>.`,
    );
  }

  const lusionSection = document.querySelector(
    "section#templates .lusion-home-content[data-lusion-home-content]",
  );
  if (!lusionSection) {
    throw new Error(`${routeLabel} is missing the embedded Lusion home section.`);
  }
  const frame = lusionSection.querySelector("iframe.lusion-home-frame[data-lusion-home-frame]");
  if (!frame || frame.getAttribute("src") !== "/lusion/?water-page-embed") {
    throw new Error(`${routeLabel} has an invalid embedded Lusion frame.`);
  }
};

verifyPortalRoute(portalDocument, "The root Portal page");
verifyPortalRoute(portalAliasDocument, "The /portal alias");

for (const selector of [
  "#canvas",
  "#page-container",
  "#preloader",
  "#home-hero",
  "#projects-main",
  "#footer-section",
  "#header-logo",
  "#header-right-menu-btn",
]) {
  if (!lusionDocument.querySelector(selector)) {
    throw new Error(`The standalone Lusion page is missing ${selector}.`);
  }
}
if (!lusionOverrides.includes('trigger.id = "lusion-language-trigger"')) {
  throw new Error("The standalone Lusion page does not create its language control.");
}

if (!/\.page-curtain\s*\{[^}]*z-index:\s*101;/s.test(portalStyles)) {
  throw new Error("The Portal loading curtain layer is missing or changed.");
}
if (!/html:not\(\.is-ready\)\s*\.portal-header\s*\{\s*z-index:\s*102;/s.test(portalWorldStyles)) {
  throw new Error("The Portal header is not raised above the initial loading curtain.");
}
if (
  !lusionOverrides.includes(
    "html:not(.is-ready) #ui,html.is-lusion-preloading #ui{z-index:202!important}",
  ) ||
  !lusionOverrides.includes("html:not(.is-ready) #header #header-logo .xlab-logo-crop img") ||
  !lusionOverrides.includes("html:not(.is-ready) #header-right-menu-btn") ||
  !lusionOverrides.includes("html:not(.is-ready) #lusion-language-trigger")
) {
  throw new Error("Lusion loading styles do not keep its logo and header controls visible.");
}

const routeConfig = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
const hasRewrite = (source, destination) =>
  routeConfig.rewrites.some(
    (rewrite) => rewrite.source === source && rewrite.destination === destination,
  );
if (!hasRewrite("/", "/index.html")) {
  throw new Error("Vercel does not route / to the Portal page.");
}
if (!hasRewrite("/portal", "/index.html")) {
  throw new Error("Vercel does not route /portal to the Portal page.");
}
if (!hasRewrite("/portal/:path*", "/web/portal/:path*")) {
  throw new Error("Vercel does not preserve the /portal asset route.");
}
if (
  routeConfig.rewrites.some(({ source }) => source === "/lusion" || source.startsWith("/lusion/"))
) {
  throw new Error("Vercel should serve /lusion/ from its static output directory.");
}

const listFiles = async (directory, baseDirectory = directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath, baseDirectory)));
    } else if (entry.isFile()) {
      files.push(entryPath.slice(baseDirectory.length + 1).replaceAll("\\", "/"));
    }
  }
  return files.sort();
};

const projectFiles = await listFiles(resolve(root, "public", "projects"));
for (const relativePath of projectFiles.filter((file) => file.endsWith(".html"))) {
  const html = await readFile(resolve(root, "public", "projects", relativePath), "utf8");
  if (/<a\b[^>]*\bclass="[^"]*\bproject-item\b[^"]*"/i.test(html)) {
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
  `Portal routes, loading headers, and ${projectFiles.length} project assets verified: ${requiredAssets.length} required assets.`,
);
