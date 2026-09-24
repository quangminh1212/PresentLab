import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

const lusionBundlePath = join(output, "_astro", "hoisted.CUO_IjfL.js");
let lusionBundle = await readFile(lusionBundlePath, "utf8");
for (const [source, replacement] of [
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
await writeFile(lusionBundlePath, lusionBundle);

console.log(`Vercel static output prepared: ${output}`);
