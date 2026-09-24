import { cp, mkdir, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "public");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const assets = [
  ["web/portal", "web/portal"],
  ["web/vendor/three", "web/vendor/three"],
  ["web/portal/index.html", "index.html"],
  ["web/portal/index.html", "portal/index.html"],
  ["resources/templates/index.json", "resources/templates/index.json"],
  ["resources/palettes/index.json", "resources/palettes/index.json"],
  ["resources/palettes/catalog.html", "resources/palettes/catalog.html"],
  ["web/lusion/assets", "assets"],
  ["web/lusion/_astro", "_astro"],
  ["web/lusion/about", "about"],
  ["web/lusion/projects", "projects"],
  ["web/lusion/home-scroll.css", "home-scroll.css"],
  ["web/lusion/index.html", "lusion/index.html"],
];

for (const [source, destination] of assets) {
  const target = join(output, destination);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, source), target, { recursive: true, force: true });
}

const lusionPageRoots = [join(output, "lusion"), join(output, "about"), join(output, "projects")];
const findHtmlFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findHtmlFiles(entryPath)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(entryPath);
  }
  return files;
};
const replaceBrandText = (text) =>
  text
    .replace(/hello@lusion\.co/gi, "Contact XLab")
    .replace(/business@lusion\.co/gi, "Business inquiries")
    .replace(/R&D:\s*labs\.lusion\.co/gi, "XLab R&D")
    .replace(
      "We create 3D visual storytelling and interactive web experiences that help brands stand out",
      "We create bold presentation slides and visual stories that help ideas stand out",
    )
    .replace(/\bLusion\b/gi, "XLab");
const headerLogoPattern =
  /(<a\b[^>]*id="header-logo"[^>]*>\s*<svg\b[^>]*>)[\s\S]*?(<\/svg>\s*<\/a>)/gi;
const headerLogo =
  '$1<g><text x="0" y="23" fill="currentColor" font-family="Aeonik, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="0.2">XLab</text><path fill="#238f8f" d="M13 15h3.5l4.8 8h-3.5z"/></g>$2';
const projectCardLinkPattern =
  /<a\b(?=[^>]*\bclass="[^"]*\bproject-item\b[^"]*")([^>]*)>([\s\S]*?)<\/a>/gi;
const labsMenuLinkPattern = /<a\b(?=[^>]*\bid="header-menu-labs")[^>]*>[\s\S]*?<\/a>/i;
for (const pagePath of (await Promise.all(lusionPageRoots.map(findHtmlFiles))).flat()) {
  let html = await readFile(pagePath, "utf8");
  const logos = html.match(headerLogoPattern);
  if (!logos || logos.length !== 1) {
    throw new Error(`Expected one Lusion header logo in ${pagePath}.`);
  }
  if (!labsMenuLinkPattern.test(html)) {
    throw new Error(`Expected one Labs menu link in ${pagePath}.`);
  }
  html = html.replace(labsMenuLinkPattern, "");
  html = html.replace(headerLogoPattern, headerLogo);
  html = html.replace(projectCardLinkPattern, (_match, attributes, content) => {
    const nonLinkAttributes = attributes.replace(/\s+href=(?:"[^"]*"|'[^']*')/i, "");
    return `<div${nonLinkAttributes}>${content}</div>`;
  });
  html = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const content = tag.match(/\bcontent=(["'])(.*?)\1/i);
    if (!content) return tag;
    if (/^(?:https?:\/\/|mailto:)/i.test(content[2])) return tag;
    const updated = replaceBrandText(content[2]).replaceAll(
      "/assets/meta/social_sharing.jpg",
      "/assets/meta/social_sharing_xlab.png",
    );
    return tag.replace(content[0], `content=${content[1]}${updated}${content[1]}`);
  });
  html = html.replace(
    /\b(aria-label|alt|title)=("|')(.*?)\2/gi,
    (_match, name, quote, value) => `${name}=${quote}${replaceBrandText(value)}${quote}`,
  );
  html = html.replace(/>([^<>]*)</g, (_match, text) => `>${replaceBrandText(text)}<`);
  await writeFile(pagePath, html);
}

const retiredShareImage = join(output, "assets", "meta", "social_sharing.jpg");
await unlink(retiredShareImage);
const localOnlyPath = join(output, "_astro", "local-only.js");
const localOnly = await readFile(localOnlyPath, "utf8");
await writeFile(localOnlyPath, localOnly.replaceAll("Lusion Reel", "XLab Reel"));

const lusionBundlePath = join(output, "_astro", "hoisted.CUO_IjfL.js");
let lusionBundle = await readFile(lusionBundlePath, "utf8");
for (const [source, replacement] of [
  [
    'const settings=new Settings;var commonjsGlobal$1',
    'const settings=new Settings;settings.USE_AUDIO=!1;var commonjsGlobal$1',
  ],
  [
    'this.containers.forEach((e,t)=>{e.style.setProperty("--open-delay",t/50+"s"),e.style.setProperty("--close-delay",Math.abs(t-this.containers.length)/50+"s")})',
    'this.containers.filter(Boolean).forEach((e,t)=>{e.style.setProperty("--open-delay",t/50+"s"),e.style.setProperty("--close-delay",Math.abs(t-this.containers.length)/50+"s")})',
  ],
  [
    'parsePath(e){return e=e.replace(/^\\/|\\/$/g,""),e}',
    'parsePath(e){return e=e.replace(/^\\/|\\/$/g,""),e==="lusion"?"":e.startsWith("lusion/")?e.slice(7):e}',
  ],
  [
    'history.pushState(null,null,(e||"/")+(this.queryStr?"?"+this.queryStr:""))',
    'history.pushState(null,null,(e||"/lusion/")+(this.queryStr?"?"+this.queryStr:""))',
  ],
  [
    'properties.loader.load("/"+e,{type:"text",onLoad:this._initDom.bind(this,this._createRoute(e))})',
    'properties.loader.load(e?"/"+e:"/lusion/",{type:"text",onLoad:this._initDom.bind(this,this._createRoute(e))})',
  ],
]) {
  if (!lusionBundle.includes(source)) {
    throw new Error("The copied Lusion bundle no longer matches the subpath routing patch.");
  }
  lusionBundle = lusionBundle.replace(source, replacement);
}
const astronautRevealSource =
  "v.position.y-=(properties.useMobileLayout?0:.4)*ease.backInOut(p),v.updateMatrix();";
// Pull the astronaut back into the viewport during the heading, then release it into the tunnel.
const astronautRevealReplacement =
  "v.position.y-=(properties.useMobileLayout?0:.4)*ease.backInOut(p),v.position.z-=(properties.useMobileLayout?1.2:1.6)*math.smoothstep(.25,.45,a)*math.fit(a,.82,1,1,0),v.position.y+=(properties.useMobileLayout?.35:.55)*math.smoothstep(.25,.45,a)*math.fit(a,.82,1,1,0),v.updateMatrix();";
if (lusionBundle.split(astronautRevealSource).length - 1 !== 1) {
  throw new Error("The copied Lusion astronaut transform no longer matches the reveal patch.");
}
lusionBundle = lusionBundle.replace(astronautRevealSource, astronautRevealReplacement);

// Keep the Home scroll manual once its About intro reaches the viewport.
const homeScrollBoundarySource =
  "window.__AUTO_SCROLL__&&(scrollManager.autoScrollSpeed=window.__AUTO_SCROLL__),taskManager.update()";
const homeScrollBoundaryReplacement =
  'window.__AUTO_SCROLL__&&(scrollManager.autoScrollSpeed=window.__AUTO_SCROLL__),routeManager.currRoute.target===homePage&&(window.__XLAB_HOME_SCROLL_STOPPED__||document.getElementById("about-who-subsection-details")&&scrollManager.scrollPixel>=scrollManager.getDomRange(document.getElementById("about-who-subsection-details")).top)&&(window.__XLAB_HOME_SCROLL_STOPPED__=!0,scrollManager.autoScrollSpeed=0),taskManager.update()';
if (lusionBundle.split(homeScrollBoundarySource).length - 1 !== 1) {
  throw new Error("The copied Lusion scroll manager no longer matches the Home intro boundary patch.");
}
lusionBundle = lusionBundle.replace(homeScrollBoundarySource, homeScrollBoundaryReplacement);
await writeFile(lusionBundlePath, lusionBundle);

console.log(`Vercel static output prepared: ${output}`);
