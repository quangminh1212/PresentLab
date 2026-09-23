import { chromium } from "playwright";
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";

const ROOT = resolve("/tmp/pl");
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".css": "text/css",
  ".webm": "video/webm",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  try {
    const file = resolve(ROOT, "." + p);
    const s = await stat(file);
    if (!s.isFile()) throw new Error("dir");
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end("nope");
  }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--use-gl=angle", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const msgs = [];
page.on("console", (m) => msgs.push(`${m.type()}: ${m.text()}`.slice(0, 300)));
page.on("pageerror", (e) => msgs.push(`PAGEERROR: ${e.message}`.slice(0, 300)));

await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);

const info = await page.evaluate(() => {
  const st = document.querySelector("[data-xlab-world]");
  const cv = document.querySelector("[data-xlab-world-canvas]");
  return {
    renderMode: st?.dataset.worldRenderMode ?? null,
    rippleShader: st?.dataset.worldRippleShader ?? null,
    surfaceProfile: st?.dataset.worldSurfaceProfile ?? null,
    waterTexture: st?.dataset.worldWaterTexture ?? null,
    skyProvider: st?.dataset.worldSkyProvider ?? null,
    videoState: st?.dataset.worldVideoState ?? null,
    gpuRender: st?.dataset.worldGpuRender ?? null,
    canvas: cv ? [cv.width, cv.height, cv.clientWidth, cv.clientHeight] : null,
    stageRect: st ? [Math.round(st.getBoundingClientRect().width), Math.round(st.getBoundingClientRect().height)] : null,
  };
});
console.log("INFO " + JSON.stringify(info));

const box = await page.locator("[data-xlab-world]").boundingBox();
const cx = box.x + box.width * 0.5;
const cy = box.y + box.height * 0.62;

await page.screenshot({ path: "/tmp/pl/r0-idle.png" });
console.log("shot r0");

for (let i = 0; i <= 18; i++) {
  await page.mouse.move(cx - 280 + i * 32, cy - 70 + i * 8);
  await page.waitForTimeout(40);
}
await page.screenshot({ path: "/tmp/pl/r1-hover.png" });
console.log("shot r1");

await page.mouse.click(cx, cy);
await page.waitForTimeout(260);
await page.screenshot({ path: "/tmp/pl/r2-click.png" });
console.log("shot r2");

const after = await page.evaluate(() => {
  const st = document.querySelector("[data-xlab-world]");
  return {
    rippleCount: st?.dataset.worldRippleCount ?? null,
    rippleQueued: st?.dataset.worldRippleQueued ?? null,
    rippleState: st?.dataset.worldRippleState ?? null,
    rippleInput: st?.dataset.worldRippleInput ?? null,
    rippleSteps: st?.dataset.worldRippleSteps ?? null,
    ripplePeak: st?.dataset.worldRipplePeak ?? null,
    lastType: st?.dataset.worldRippleLastType ?? null,
  };
});
console.log("AFTER " + JSON.stringify(after));

// how many pixels actually differ between idle and hover
console.log("CONSOLE:\n" + msgs.slice(0, 25).join("\n"));

await browser.close();
server.close();
