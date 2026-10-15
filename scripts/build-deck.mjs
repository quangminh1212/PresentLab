#!/usr/bin/env node
/**
 * build-deck.mjs — render a self-contained, image-rich HTML slide deck for a
 * Renaissance painter (or painting style), from a spec + a fetched asset manifest.
 *
 * Inputs:
 *   scripts/specs/<slug>.json              (authored by hand)
 *   assets/slide-artwork2/<slug>.json      (produced by fetch-artwork.py)
 *
 * Output:
 *   examples/<slug>.html                   (20 slides, base64-embedded, offline)
 *
 * The deck is fully self-contained: every image is a base64 data URI, there are
 * no external URLs, and the presentation runtime (keyboard / click / progress)
 * ships inline with the file.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/build-deck.mjs <slug>");
  process.exit(1);
}

const specPath = resolve(ROOT, "scripts/specs", `${slug}.json`);
const manifestPath = resolve(ROOT, "assets/slide-artwork2", `${slug}.json`);
const spec = JSON.parse(readFileSync(specPath, "utf-8"));
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

const pal = { paper: "#efe7d6", ink: "#2b2722", muted: "#7a6f5f", accent: "#8a6a3b", accent2: "#37566e", deep: "#23323f", ...(spec.palette || {}) };
const works = spec.works || [];
const images = manifest.images || [];
const hero = manifest.hero || images[0] || null;

if (works.length !== 20) {
  console.error(`Expected 20 works in spec, found ${works.length}.`);
  process.exit(1);
}

const b64 = (im) => (im && im.data ? `data:${im.mime};base64,${im.data}` : "");

/* ---------- slide builders ---------- */

function artPanel(im, opts = {}) {
  const src = b64(im);
  if (!src) return "";
  const { rounded = true, shadow = true, filter = "" } = opts;
  const style = [
    rounded ? "border-radius:14px" : "",
    shadow ? "box-shadow:0 30px 80px rgb(20 18 16 / 28%)" : "",
    filter,
    "object-fit:cover;width:100%;height:100%;display:block",
  ].filter(Boolean).join(";");
  return `<img class="plate" src="${src}" alt="${(im.alt || "").replace(/"/g, "&quot;")}" loading="lazy" style="${style}">`;
}

function footer(n, meta) {
  return `<footer class="footer"><span class="folio">${String(n).padStart(2, "0")} / 20</span><span class="work-meta">${meta || ""}</span></footer>`;
}

function esc(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

const slides = [];

/* 1 — Cover (hero) */
slides.push({ cls: "slide--cover", hero: true, html: `
  <div class="cover-copy">
    <p class="eyebrow reveal">PHỤC HƯNG · ${esc(spec.subtitle || "")}</p>
    <h1 class="slide-title reveal">${esc(spec.title)}</h1>
    <p class="slide-body reveal">${esc((spec.intro || "Một hành trình qua những kiệt tác của thời Phục hưng — mỗi trang là một tác phẩm, mỗi tác phẩm là một câu chuyện về ánh sáng, hình thể và con người."))}</p>
  </div>
  ${footer(1, esc(spec.title))}
` });

/* 2 — Opening statement / context */
slides.push({ cls: "slide--statement", html: `
  <div class="copy">
    <p class="eyebrow reveal">BỐI CẢNH</p>
    <h1 class="slide-title reveal">${esc(spec.openingTitle || "Ai là người nghệ sĩ này?")}</h1>
    <p class="slide-body reveal">${esc(spec.openingBody || `Bộ sưu tập gồm 20 tác phẩm tiêu biểu của ${spec.title}, chọn lọc từ các bảo tàng và bộ sưu tập công cộng trên toàn thế giới.`)}</p>
    <ul class="points">
      ${(spec.openingPoints || ["Hình ảnh thật, độ phân giải cao từ Wikimedia Commons.", "Mỗi tác phẩm đi kèm năm sáng tác và nơi lưu giữ.", "Tựu chung lại: một cách nhìn trọn vẹn về phong cách của ông."]).map((p, i) => `<li class="reveal" style="--point-index:${i}">${esc(p)}</li>`).join("")}
    </ul>
  </div>
  ${footer(2, esc(spec.title))}
` });

/* 3..18 — one work per slide (the 16 central works) */
for (let i = 0; i < 16; i++) {
  const w = works[i];
  const im = images[i];
  const n = i + 3;
  const meta = [w.year, w.where].filter(Boolean).join(" · ");
  slides.push({ cls: "slide--split", images: [im], html: `
    <div class="inner">
      <figure class="art-frame reveal">${artPanel(im)}</figure>
      <div class="copy">
        <p class="eyebrow reveal">TÁC PHẨM ${String(n - 2).padStart(2, "0")}</p>
        <h1 class="slide-title reveal">${esc(w.title)}</h1>
        <p class="slide-body reveal">${w.note ? esc(w.note) : ""}</p>
        <p class="work-line reveal">${meta ? esc(meta) : ""}</p>
      </div>
    </div>
    ${footer(n, esc(meta))}
  ` });
}

/* 19 — Gallery (4-up grid of remaining emphasis works) */
{
  const picks = [0, 4, 9, 14].map((idx) => images[idx]).filter(Boolean);
  slides.push({ cls: "slide--gallery", html: `
    <div class="copy wide">
      <p class="eyebrow reveal">BỨC TRANH TOÀN CẢNH</p>
      <h1 class="slide-title reveal">Bốn nhịp điệu trong tay ${esc(spec.title.split(" ").slice(0, 2).join(" "))}</h1>
      <div class="gallery-grid reveal">
        ${picks.map((im) => `<figure class="g-thumb">${artPanel(im, { rounded: true, shadow: false })}<figcaption>${esc(im.alt || "")}</figcaption></figure>`).join("")}
      </div>
    </div>
    ${footer(19, esc(spec.title))}
  ` });
}

/* 20 — Closing / legacy */
slides.push({ cls: "slide--closing", hero: !!hero, html: `
  <div class="copy">
    <p class="eyebrow reveal">DI SẢN</p>
    <h1 class="slide-title reveal">${esc(spec.closingTitle || "Điều còn lại sau năm thế kỷ")}</h1>
    <p class="slide-body reveal">${esc(spec.closingBody || `${spec.title} để lại một ngôn ngữ hình ảnh vẫn còn vang vọng — trong ánh sáng, trong hình thể người, và trong cách chúng ta nhìn thế giới.`)}</p>
    <p class="credit reveal">Hình ảnh: Wikimedia Commons (phạm vi công cộng) · Thiết kế trình chiếu: PresentLab</p>
  </div>
  ${footer(20, esc(spec.title))}
` });

if (slides.length !== 20) {
  console.error(`Builder produced ${slides.length} slides, expected 20.`);
  process.exit(1);
}

/* ---------- HTML assembly ---------- */

const heroStyle = hero ? `--hero-art:url('${b64(hero)}')` : "";

const cssVars = [
  `--paper:${pal.paper}`, `--ink:${pal.ink}`, `--muted:${pal.muted}`,
  `--accent:${pal.accent}`, `--accent2:${pal.accent2}`, `--deep:${pal.deep}`,
  `--veil:${pal.veil || "rgba(238,225,213,.72)"}`,
  `--serif:Georgia,'Palatino Linotype',serif`,
  `--sans:'Segoe UI',Arial,sans-serif`,
  heroStyle,
].filter(Boolean).join(";");

const sections = slides.map((s, idx) => `
<section class="pl-slide ${s.cls}" data-pl-slide data-slide-id="${String(idx + 1).padStart(2, "0")}-${slug}" aria-label="${esc((s.aria || ""))}">
  ${s.html}
</section>`).join("\n");

const style = `
*{box-sizing:border-box;margin:0;padding:0}
:root{${cssVars}}
html,body{height:100%}
body{background:var(--deep);font-family:var(--sans);color:var(--ink);overflow:hidden}
.stage{position:fixed;inset:0;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--accent) 14%,transparent),transparent 60%),var(--deep)}
.deck{position:relative;width:min(100vw,177.78vh);height:min(56.25vw,100vh);background:var(--paper);overflow:hidden;box-shadow:0 40px 120px rgb(0 0 0 / 45%)}
.pl-slide{position:absolute;inset:0;display:none;background:radial-gradient(ellipse at 88% 46%,color-mix(in srgb,var(--accent) 12%,transparent),transparent 38%),var(--paper)}
.pl-slide.active{display:block}
.inner{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:clamp(40px,6vw,108px)}
.copy{width:min(44vw,820px);max-width:100%}
.copy.wide{width:min(80vw,1500px)}
.eyebrow{color:var(--accent);font:800 13px/1 var(--sans);letter-spacing:.22em;text-transform:uppercase;margin-bottom:18px}
.slide-title{font:500 clamp(40px,5vw,86px)/1.02 var(--serif);letter-spacing:-.02em;max-width:14ch}
.slide-body{margin-top:22px;font-size:clamp(17px,1.5vw,24px);line-height:1.5;color:color-mix(in srgb,var(--ink) 86%,var(--muted));max-width:46ch}
.points{list-style:none;margin-top:26px;display:flex;flex-direction:column;gap:14px}
.points li{position:relative;padding-left:26px;font-size:clamp(15px,1.15vw,19px);line-height:1.4;color:var(--muted)}
.points li::before{content:"";position:absolute;left:0;top:.6em;width:9px;height:9px;border-radius:50%;background:var(--accent2)}
.work-line{margin-top:18px;font:600 14px/1.3 var(--sans);letter-spacing:.04em;color:var(--accent)}
.credit{margin-top:24px;font-size:13px;color:var(--muted);letter-spacing:.02em}
.footer{position:absolute;left:clamp(40px,6vw,108px);bottom:clamp(26px,4vh,44px);z-index:3;display:flex;gap:18px;align-items:baseline;font:600 12px/1 var(--sans);letter-spacing:.14em;color:var(--muted)}
.folio{color:var(--accent)}
.work-meta{color:var(--muted)}
.art-frame{position:relative;flex:0 0 auto;width:min(50vw,940px);height:100%;display:flex;align-items:center;justify-content:center;padding:clamp(30px,4vw,72px)}
.art-frame .plate{max-width:100%;max-height:84%;aspect-ratio:attr(data-ar);border-radius:14px;box-shadow:0 30px 80px rgb(20 18 16 / 30%);filter:saturate(1.1) contrast(1.06)}
.slide--split .inner{flex-direction:row;align-items:center;gap:clamp(24px,3vw,60px)}
.slide--split .copy{width:min(34vw,640px)}
.slide--cover::before{content:"";position:absolute;inset:0;z-index:0;background-image:var(--hero-art);background-size:cover;background-position:center 30%;filter:saturate(1.08) contrast(1.05) brightness(.62)}
.slide--cover::after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(10,8,6,.86) 0%,rgba(10,8,6,.5) 42%,rgba(10,8,6,.12) 70%,transparent 100%)}
.slide--cover .cover-copy{position:relative;z-index:2;width:min(60vw,900px);padding:clamp(40px,6vw,108px)}
.slide--cover .slide-title{color:#f4ecda;max-width:16ch}
.slide--cover .slide-body{color:#d9cfba;max-width:40ch}
.slide--cover .eyebrow{color:var(--accent2)}
.slide--statement .copy{max-width:min(70vw,1100px)}
.slide--gallery .gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:30px}
.g-thumb{position:relative;aspect-ratio:1/1;overflow:hidden;border-radius:12px;background:color-mix(in srgb,var(--ink) 8%,var(--paper))}
.g-thumb .plate{width:100%;height:100%;object-fit:cover}
.g-thumb figcaption{position:absolute;left:0;right:0;bottom:0;padding:10px 12px;font:600 11px/1.25 var(--sans);color:#f3ead8;background:linear-gradient(0deg,rgba(8,6,4,.82),transparent);letter-spacing:.02em}
.slide--closing::before{content:"";position:absolute;inset:0;z-index:0;opacity:.22;background-image:var(--hero-art);background-size:cover;background-position:center;filter:grayscale(.3) contrast(1.1)}
.slide--closing .copy{position:relative;z-index:2}
.slide--closing .slide-title{color:var(--deep)}
@media (max-width:780px){.slide--split .inner{flex-direction:column;justify-content:flex-start;gap:18px}.art-frame{width:100%;height:42%}.copy{width:100%}.gallery-grid{grid-template-columns:repeat(2,1fr)}}
/* reveal animations */
.reveal{opacity:0;transform:translateY(22px);filter:blur(4px)}
.active .reveal{animation:rise .82s cubic-bezier(.2,.75,.2,1) forwards}
.active .reveal:nth-child(2){animation-delay:.09s}
.active .reveal:nth-child(3){animation-delay:.18s}
.active .reveal:nth-child(4){animation-delay:.27s}
.active .reveal:nth-child(5){animation-delay:.36s}
@keyframes rise{to{opacity:1;transform:none;filter:blur(0)}}
/* controls */
.controls{position:fixed;z-index:20;right:30px;bottom:24px;display:flex;align-items:center;gap:12px;color:#f3ead8;font:700 12px/1 var(--sans);letter-spacing:.12em}
.progress{width:160px;height:2px;background:rgba(255,255,255,.22);overflow:hidden}
.progress-fill{height:100%;background:var(--accent2);transform:scaleX(0);transform-origin:left;transition:transform .4s ease}
.control-button{border:0;background:transparent;color:inherit;Claude-Fable:pointer;padding:6px;font:700 18px/1 var(--sans)}
.control-button:hover{color:var(--accent2)}
`;

const html = `<!doctype html>
<html lang="vi" data-pl-format="16:9" data-pl-title="${esc(spec.title)}" data-pl-author="PresentLab" data-pl-theme="${slug}" data-style="${slug}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(spec.title)} · PresentLab</title>
<style>${style}</style>
</head>
<body>
<div class="stage"><div class="deck" id="deck">
${sections}
</div></div>
<div class="controls">
  <button class="control-button" id="prev" aria-label="Trước">‹</button>
  <div class="progress"><div class="progress-fill" id="bar"></div></div>
  <button class="control-button" id="next" aria-label="Sau">›</button>
  <span id="count" class="counter"></span>
</div>
<script>
(function(){
  var slides=[].slice.call(document.querySelectorAll('[data-pl-slide]'));
  var i=0;
  function show(n){n=Math.max(0,Math.min(slides.length-1,n));slides.forEach(function(s,k){s.classList.toggle('active',k===n)});i=n;var f=(n+1)/slides.length;document.getElementById('bar').style.transform='scaleX('+f+')';document.getElementById('count').textContent=(n+1)+' / '+slides.length;}
  function next(){show(i+1);}function prev(){show(i-1);}
  document.getElementById('next').addEventListener('click',next);
  document.getElementById('prev').addEventListener('click',prev);
  document.querySelector('.deck').addEventListener('click',function(e){if(e.target.closest('.control-button'))return;next();});
  document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();next();}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev();}else if(e.key==='Home'){show(0);}else if(e.key==='End'){show(slides.length-1);}});
  document.addEventListener('touchstart',function(e){var x=e.touches[0].clientX;document.addEventListener('touchend',function handler(ev){var dx=ev.changedTouches[0].clientX-x;if(Math.abs(dx)>40){dx<0?next():prev();}document.removeEventListener('touchend',handler);},{once:true});});
  show(0);
})();
</script>
</body>
</html>`;

const outDir = resolve(ROOT, "examples");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, `${slug}.html`);
writeFileSync(outPath, html, "utf-8");
const sizeKB = Buffer.byteLength(html) / 1024;
console.log(`Wrote ${outPath} (${sizeKB.toFixed(0)} KB) with ${slides.length} slides.`);
