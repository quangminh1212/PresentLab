import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.env.PRESENTLAB_PORTAL_VERIFY_ROOT ?? ".");
const requiredAssets = [
  "public/index.html",
  "public/web/portal/xlab-logo.webp",
  "public/home-scroll.css",
  "public/_astro/hoisted.CUO_IjfL.js",
  "public/_astro/about.CNa9RfUh.css",
  "public/_astro/local-only.js",
  "public/assets/meta/favicon.ico",
  "public/assets/meta/social_sharing_xlab.png",
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
    throw new Error(`Lusion root asset is missing or empty: ${relativePath}`);
  }
}

const lusionHtml = await readFile(resolve(root, "public/index.html"), "utf8");
const lusionBundle = await readFile(resolve(root, "public/_astro/hoisted.CUO_IjfL.js"), "utf8");
const lusionStyles = await readFile(resolve(root, "public/_astro/about.CNa9RfUh.css"), "utf8");
for (const [source, reference] of [
  [lusionHtml, 'id="home-hero"'],
  [lusionHtml, 'id="projects-main"'],
  [lusionHtml, 'id="footer-section"'],
  [lusionHtml, 'href="/_astro/about.CNa9RfUh.css"'],
  [lusionHtml, 'href="/home-scroll.css"'],
  [lusionHtml, 'src="/_astro/local-only.js"'],
  [lusionHtml, 'src="/_astro/hoisted.CUO_IjfL.js"'],
  [lusionHtml, "/web/portal/xlab-logo.webp"],
]) {
  if (!source.includes(reference)) {
    throw new Error(`Built Lusion root is missing a required reference: ${reference}`);
  }
}

if (/<iframe\b|<frame\b|\bsrcdoc=/i.test(lusionHtml)) {
  throw new Error("The root page still embeds another document.");
}
if (/\/lusion\//i.test(lusionHtml) || /\/lusion\//i.test(lusionBundle)) {
  throw new Error("The root page or Lusion bundle still references /lusion/.");
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
if (!rootRewrite) throw new Error("Vercel does not route / to the Lusion root page.");
const obsoleteRoute = routeConfig.rewrites.some(({ source }) =>
  ["/portal", "/lusion"].some((prefix) => source === prefix || source.startsWith(`${prefix}/`)),
);
if (obsoleteRoute) throw new Error("An obsolete Portal or Lusion subpath rewrite remains.");

const logoMatch = lusionHtml.match(/<a\b(?=[^>]*id="header-logo")[^>]*>[\s\S]*?<\/a>/i);
if (
  !logoMatch ||
  !/<span\b[^>]*class="xlab-logo-crop"[^>]*>[\s\S]*?<img\b[^>]*src="\/web\/portal\/xlab-logo\.webp"/i.test(
    logoMatch[0],
  )
) {
  throw new Error("The XLab wordmark is missing from the Lusion root page.");
}

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

const lusionPageRoots = ["about", "projects"];
const lusionContentPages = (
  await Promise.all(
    lusionPageRoots.map(async (pageRoot) =>
      (await listFiles(resolve(root, "public", pageRoot)))
        .filter((file) => file.endsWith(".html"))
        .map((file) => resolve(root, "public", pageRoot, file)),
    ),
  )
).flat();
const lusionPages = [resolve(root, "public/index.html"), ...lusionContentPages];
for (const pagePath of lusionPages) {
  const html = await readFile(pagePath, "utf8");
  if (/<a\b[^>]*\bclass="[^"]*\bproject-item\b[^"]*"/i.test(html)) {
    throw new Error(`A project card still links to a detail page: ${pagePath}`);
  }
  const visibleMarkup = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const staleTextNode = />[^<>]*\bLusion\b[^<>]*</i.test(visibleMarkup);
  const staleAttribute = [...visibleMarkup.matchAll(/<[^>]+>/g)].some((match) =>
    /\b(?:aria-label|alt|title)=("|')[^"']*\bLusion\b[^"']*\1/i.test(match[0]),
  );
  const staleMetadata = [...html.matchAll(/<meta\b[^>]*>/gi)].some((match) => {
    const content = match[0].match(/\bcontent=("|')(.*?)\1/i)?.[2];
    return content && !/^(?:https?:\/\/|mailto:)/i.test(content) && /\bLusion\b/i.test(content);
  });
  if (
    staleTextNode ||
    staleAttribute ||
    staleMetadata ||
    html.includes("/assets/meta/social_sharing.jpg")
  ) {
    throw new Error(`The Lusion brand remains in visible XLab page content: ${pagePath}`);
  }
}
const localOnlySource = await readFile(resolve(root, "public/_astro/local-only.js"), "utf8");
if (localOnlySource.includes("Lusion Reel") || !localOnlySource.includes("XLab Reel")) {
  throw new Error("The offline reel message is missing its XLab branding.");
}
const homeScrollSource = await readFile(resolve(root, "public/home-scroll.css"), "utf8");
if (!/#home-reel\s*\{\s*display:\s*none\s*!important\s*;/i.test(homeScrollSource)) {
  throw new Error("The broken full-screen reel section is still visible on the XLab homepage.");
}
if (!/\.about-award-category\.award-category-talks\{display:none!important\}/i.test(lusionStyles)) {
  throw new Error("The Talks category is still visible on the XLab site.");
}
if (!/\.project-item\{cursor:default\}/i.test(lusionStyles)) {
  throw new Error("XLab project cards still look clickable.");
}
if ((lusionStyles.match(/font-display:swap/g) || []).length !== 6) {
  throw new Error("XLab fonts are not configured to render fallback text while loading.");
}
const homePageSource = lusionHtml;
if (
  !homePageSource.includes(
    "We create bold presentation slides and visual stories that help ideas stand out",
  ) ||
  homePageSource.includes("We create 3D visual storytelling and interactive web experiences")
) {
  throw new Error("The XLab homepage opening text has not been updated for slide design.");
}

const sourceProjectAssets = (await listFiles(resolve(root, "web/lusion/assets"))).filter(
  (asset) => asset !== "meta/social_sharing.jpg",
);
const deployedProjectAssets = await listFiles(resolve(root, "public/assets"));
if (
  sourceProjectAssets.length !== deployedProjectAssets.length ||
  sourceProjectAssets.some((asset, index) => asset !== deployedProjectAssets[index])
) {
  throw new Error("The deployed asset tree does not match the XLab source asset tree.");
}

console.log(
  `Lusion root and XLab assets verified: ${requiredAssets.length} required files, ${deployedProjectAssets.length} project assets.`,
);
