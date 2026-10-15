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
const editorialPath = resolve(ROOT, "scripts/specs", "renaissance-editorial.json");
const editorialSet = JSON.parse(readFileSync(editorialPath, "utf-8"));
const editorial = editorialSet[slug] || {};
Object.assign(spec, editorial);
spec.works = spec.works.map((work, index) => ({
  ...work,
  note: editorial.notes?.[index] || work.note || "",
}));
const showcaseStyle = readFileSync(resolve(ROOT, "examples/renaissance-showcase.css"), "utf-8");

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
  const { rounded = false, shadow = false, filter = "", fit = "contain" } = opts;
  const classes = ["plate", rounded ? "plate--rounded" : "", shadow ? "plate--shadow" : ""]
    .filter(Boolean).join(" ");
  const style = [`object-fit:${fit};width:100%;height:100%;display:block`, filter]
    .filter(Boolean).join(";");
  return `<img class="${classes}" src="${src}" alt="${(im.alt || "").replace(/"/g, "&quot;")}" loading="lazy" style="${style}">`;
}

function artFrame(im, classes = "", opts = {}) {
  const width = Number(im?.width);
  const height = Number(im?.height);
  const ratio = Number(im?.aspect) || (width > 0 && height > 0 ? width / height : 1.5);
  const safeRatio = Number(ratio.toFixed(5));
  const inverse = Number((1 / safeRatio).toFixed(5));
  return `<figure class="art-frame ${classes}" data-art-ratio="${safeRatio}" style="--art-ratio:${safeRatio};--art-inverse:${inverse}">${artPanel(im, opts)}</figure>`;
}

function footer(n, meta) {
  return `<footer class="footer"><span class="folio">${String(n).padStart(2, "0")} / 20</span><span class="work-meta">${meta || ""}</span></footer>`;
}

function esc(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

const slides = [];

/* 1 — Cover (hero) */
slides.push({ cls: "slide--cover", hero: true, anim: "fade", html: `
  <div class="cover-copy">
    <p class="eyebrow reveal" style="--i:0">PHỤC HƯNG · ${esc(spec.subtitle || "")}</p>
    <h1 class="slide-title reveal" style="--i:1">${esc(spec.title)}</h1>
    <p class="slide-body reveal" style="--i:2">${esc((spec.intro || "Một hành trình qua những kiệt tác của thời Phục hưng — mỗi trang là một tác phẩm, mỗi tác phẩm là một câu chuyện về ánh sáng, hình thể và con người."))}</p>
  </div>
  ${footer(1, esc(spec.title))}
` });

/* 2 — Opening statement / context */
slides.push({ cls: "slide--statement", anim: "rise", html: `
  ${artFrame(hero || images[0], "statement-art", { rounded: false })}
  <div class="copy">
    <p class="eyebrow reveal" style="--i:0">BỐI CẢNH</p>
    <h1 class="slide-title reveal" style="--i:1">${esc(spec.openingTitle || "Ai là người nghệ sĩ này?")}</h1>
    <p class="slide-body reveal" style="--i:2">${esc(spec.openingBody || `Bộ sưu tập gồm 20 tác phẩm tiêu biểu của ${spec.title}, chọn lọc từ các bảo tàng và bộ sưu tập công cộng trên toàn thế giới.`)}</p>
    <ul class="points">
      ${(spec.openingPoints || ["Hình ảnh thật, độ phân giải cao từ Wikimedia Commons.", "Mỗi tác phẩm đi kèm năm sáng tác và nơi lưu giữ.", "Tựu chung lại: một cách nhìn trọn vẹn về phong cách của ông."]).map((p, i) => `<li class="reveal" style="--i:${i + 3}">${esc(p)}</li>`).join("")}
    </ul>
  </div>
  ${footer(2, esc(spec.title))}
` });

/* 3..18 — 16 works, each with a varied layout + a distinct entrance motion */
const LAYOUTS = ["split","reverse","spotlight","fullbleed","split","reverse","fullbleed","dual","split","spotlight","reverse","fullbleed","split","dual","reverse","spotlight"];
const ANIMS   = ["fade","rise","left","fade","right","rise","blur","wipe","drift","right","curtain","rise","flip","blur","left","fade"];
const MOTION_OFFSETS = {
  botticelli: 0,
  duerer: 3,
  "leonardo-da-vinci": 6,
  michelangelo: 9,
  raphael: 12,
  titian: 15,
};
const WORK_LABELS = {
  botticelli: "ĐƯỜNG NÉT",
  duerer: "QUAN SÁT",
  "leonardo-da-vinci": "NGHIÊN CỨU",
  michelangelo: "HÌNH THỂ",
  raphael: "BỐ CỤC",
  titian: "SẮC ĐỘ",
};
// Deliberately vary the image side across artists while preserving every original work slide.
const COMPOSITION_PATTERNS = {
  botticelli: "LRRLRLLRLRLLRLRR",
  duerer: "RLRLRLLRRLRLRLLR",
  "leonardo-da-vinci": "RRLLRLRLRRLLRLRR",
  michelangelo: "LRRLLRLRRLRLLRRL",
  raphael: "LRLRLLRLRLRRLLRL",
  titian: "RLRLLRRLRLRLLRLR",
};
function workCopy(w, n, meta, extra = "") {
  const idx = String(n - 2).padStart(2, "0");
  return `
        <p class="eyebrow reveal" style="--i:0">${esc(WORK_LABELS[slug] || "TÁC PHẨM")} · ${idx}${extra}</p>
        <h1 class="slide-title reveal" style="--i:1">${esc(w.title)}</h1>
        <p class="slide-body reveal" style="--i:2">${w.note ? esc(w.note) : ""}</p>
        <p class="work-line reveal" style="--i:3">${meta ? esc(meta) : ""}</p>`;
}
for (let i = 0; i < 16; i++) {
  const w = works[i];
  const im = images[i];
  const n = i + 3;
  const meta = [w.year, w.where].filter(Boolean).join(" · ");
  const layout = LAYOUTS[i];
  const anim = ANIMS[(i + (MOTION_OFFSETS[slug] || 0)) % ANIMS.length];
  const composition = COMPOSITION_PATTERNS[slug]?.[i] === "R" ? "right" : "left";
  let inner;
  if (layout === "reverse") {
    inner = `
    <div class="inner reverse">
      ${artFrame(im, "reveal")}
      <div class="copy">${workCopy(w, n, meta)}</div>
    </div>`;
  } else if (layout === "spotlight") {
    inner = `
    <div class="inner spotlight">
      ${artFrame(im, "spotlight-art reveal")}
      <div class="copy center">${workCopy(w, n, meta)}</div>
    </div>`;
  } else if (layout === "fullbleed") {
    inner = `
    <div class="inner fullbleed">
      ${artFrame(im, "fullbleed-art")}
      <div class="copy fullbleed-copy">${workCopy(w, n, meta)}</div>
    </div>`;
  } else if (layout === "dual") {
    const im2 = images[(i + 5) % 16];
    inner = `
    <div class="inner dual">
      <div class="dual-pair">
        ${artFrame(im, "dual-main reveal")}
        ${artFrame(im2, "dual-side reveal")}
      </div>
      <div class="copy">${workCopy(w, n, meta, " · CÙNG TÁC GIẢ")}</div>
    </div>`;
  } else {
    inner = `
    <div class="inner">
      ${artFrame(im, "reveal")}
      <div class="copy">${workCopy(w, n, meta)}</div>
    </div>`;
  }
  slides.push({
    cls: `slide--${layout}`,
    anim,
    composition,
    artBg: layout === "fullbleed" ? im : null,
    html: inner + footer(n, ""),
  });
}

/* 19 — Gallery (4-up grid of remaining emphasis works) */
{
  const picks = images.slice(16, 20).filter(Boolean);
  slides.push({ cls: "slide--gallery", anim: "left", html: `
    <div class="copy wide">
      <p class="eyebrow reveal" style="--i:0">BỨC TRANH TOÀN CẢNH</p>
      <h1 class="slide-title reveal" style="--i:1">${esc(spec.galleryTitle || `Bốn nhịp điệu trong tay ${spec.title.split(" ").slice(0, 2).join(" ")}`)}</h1>
      <div class="gallery-grid reveal" style="--i:2">
        ${picks.map((im) => `<figure class="g-thumb">${artPanel(im, { rounded: true, fit: "cover" })}<figcaption>${esc(im.alt || "")}</figcaption></figure>`).join("")}
      </div>
    </div>
    ${footer(19, esc(spec.title))}
  ` });
}

/* 20 — Closing / legacy */
slides.push({ cls: "slide--closing", hero: !!hero, anim: "blur", html: `
  <div class="copy">
    <p class="eyebrow reveal" style="--i:0">DI SẢN</p>
    <h1 class="slide-title reveal" style="--i:1">${esc(spec.closingTitle || "Điều còn lại sau năm thế kỷ")}</h1>
    <p class="slide-body reveal" style="--i:2">${esc(spec.closingBody || `${spec.title} để lại một ngôn ngữ hình ảnh vẫn còn vang vọng — trong ánh sáng, trong hình thể người, và trong cách chúng ta nhìn thế giới.`)}</p>
    <p class="credit reveal" style="--i:3">Nguồn hình ảnh: Wikimedia Commons · Thiết kế trình chiếu: PresentLab</p>
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
<section class="pl-slide ${s.cls}"${s.artBg ? ` style="--slide-art-bg:url('${b64(s.artBg)}')"` : ""} data-pl-slide${s.composition ? ` data-composition="${s.composition}"` : ""} data-anim="${s.anim || "rise"}" data-slide-id="${String(idx + 1).padStart(2, "0")}-${slug}" aria-label="${esc(s.aria || `${spec.title}, slide ${idx + 1} of ${slides.length}`)}">
  ${s.html}
</section>`).join("\n");

const style = `
*{box-sizing:border-box;margin:0;padding:0}
:root{${cssVars}}
html,body{height:100%}
body{background:var(--deep);font-family:var(--sans);color:var(--ink);overflow:hidden}
.stage{position:fixed;inset:0;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--accent) 14%,transparent),transparent 60%),var(--deep)}
.deck{position:relative;width:min(100vw,177.77777778vh);height:min(56.25vw,100vh);aspect-ratio:16/9;container-type:size;background:var(--paper);overflow:hidden;box-shadow:0 40px 120px rgb(0 0 0 / 45%)}
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
.art-frame{position:relative;flex:0 0 auto;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;padding:0}
 .art-frame .plate{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;border-radius:0;box-shadow:none;filter:saturate(1.04) contrast(1.03)}
.slide--split .inner{flex-direction:row;align-items:center;gap:clamp(24px,3vw,60px)}
.slide--split .copy{width:min(34vw,640px)}
.slide--reverse .inner{flex-direction:row-reverse;align-items:center;gap:clamp(24px,3vw,60px)}
.slide--reverse .copy{width:min(34vw,640px)}
.slide--spotlight .inner{flex-direction:row;align-items:center;justify-content:center;text-align:center;gap:clamp(16px,2.2vw,38px)}
.slide--spotlight .spotlight-art{padding:clamp(14px,2vw,34px)}
.slide--spotlight .copy.center{width:min(64vw,1100px);margin-inline:auto}
.slide--spotlight .slide-title{max-width:18ch;margin-inline:auto}
.slide--fullbleed .inner{position:absolute;inset:0;padding:0;display:block}
.slide--fullbleed .fullbleed-art{position:absolute;inset:0;width:100%;height:100%;padding:0}
.slide--fullbleed .fullbleed-art .plate{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;border-radius:0;box-shadow:none;filter:saturate(1.08) contrast(1.04) brightness(.82)}
.slide--fullbleed .fullbleed-copy{position:absolute;left:clamp(40px,6vw,108px);right:clamp(40px,6vw,108px);bottom:clamp(58px,9vh,118px);width:auto;max-width:min(70vw,1000px);z-index:3;color:#f3ead8}
.slide--fullbleed .fullbleed-copy .eyebrow,.slide--fullbleed .fullbleed-copy .slide-title{color:#f4ecda;text-shadow:0 2px 22px rgba(0,0,0,.55)}
.slide--fullbleed .fullbleed-copy .slide-body{color:#e7ddc7}
.slide--fullbleed .fullbleed-copy .work-line{color:var(--accent2)}
.slide--dual .inner{flex-direction:column;justify-content:center;align-items:center;gap:clamp(18px,2.4vw,42px)}
.slide--dual .dual-pair{display:flex;align-items:center;justify-content:center;gap:clamp(16px,2vw,36px);width:min(84vw,1520px);height:min(60vh,880px)}
.slide--dual .dual-main{width:min(58vw,1040px);height:100%}
.slide--dual .dual-side{width:min(30vw,540px);height:100%}
.slide--dual .dual-main .plate,.slide--dual .dual-side .plate{max-height:100%}
.slide--dual .copy{width:min(72vw,1120px);text-align:center}
.slide--dual .slide-title{max-width:18ch;margin-inline:auto}
@media (max-width:780px){.slide--reverse .inner{flex-direction:column-reverse}.slide--dual .dual-pair{flex-direction:column;height:auto}.slide--dual .dual-main,.slide--dual .dual-side{width:min(88vw,560px);height:auto}}
.slide--cover::before{content:"";position:absolute;inset:0;z-index:0;background-image:var(--hero-art);background-size:cover;background-position:center 30%;filter:saturate(1.08) contrast(1.05) brightness(.62)}
.slide--cover::after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(10,8,6,.86) 0%,rgba(10,8,6,.5) 42%,rgba(10,8,6,.12) 70%,transparent 100%)}
.slide--cover .cover-copy{position:relative;z-index:2;width:min(60vw,900px);padding:clamp(40px,6vw,108px)}
.slide--cover .slide-title{color:#f4ecda;max-width:16ch}
.slide--cover .slide-body{color:#d9cfba;max-width:40ch}
.slide--cover .eyebrow{color:var(--accent2)}
.slide--statement .copy{max-width:min(70vw,1100px)}
.slide--gallery .gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:30px}
.g-thumb{position:relative;aspect-ratio:1/1;overflow:hidden;border-radius:12px;background:color-mix(in srgb,var(--ink) 8%,var(--paper))}
.g-thumb .plate{width:100%;height:100%;object-fit:contain}
.g-thumb figcaption{position:absolute;left:0;right:0;bottom:0;padding:10px 12px;font:600 11px/1.25 var(--sans);color:#f3ead8;background:linear-gradient(0deg,rgba(8,6,4,.82),transparent);letter-spacing:.02em}
.slide--closing::before{content:"";position:absolute;inset:0;z-index:0;opacity:.22;background-image:var(--hero-art);background-size:cover;background-position:center;filter:grayscale(.3) contrast(1.1)}
.slide--closing .copy{position:relative;z-index:2}
.slide--closing .slide-title{color:var(--deep)}
@media (max-width:780px){.slide--split .inner{flex-direction:row;justify-content:center;gap:2vw;padding:5vw}.slide--reverse .inner{flex-direction:row-reverse;justify-content:center;gap:2vw;padding:5vw}.slide--dual .dual-pair{flex-direction:row}.gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* reveal animations — varied entrance per slide, staggered within */
.reveal{opacity:0;will-change:transform,opacity,filter}
.active .reveal{transform:translateY(22px);filter:blur(4px);animation:rise .82s cubic-bezier(.2,.75,.2,1) forwards;animation-delay:calc(var(--i,0) * .09s)}
[data-anim="fade"] .reveal{animation-name:fade;transform:none;filter:none}
[data-anim="blur"] .reveal{animation-name:blurIn}
[data-anim="left"] .reveal{animation-name:fromLeft;transform:translateX(-46px);filter:none}
[data-anim="right"] .reveal{animation-name:fromRight;transform:translateX(46px);filter:none}
[data-anim="zoom"] .reveal{animation-name:fade;transform:none;filter:none}
[data-anim="wipe"] .reveal{animation-name:wipeIn;clip-path:inset(0 100% 0 0);transform:none;filter:none}
[data-anim="drift"] .reveal{animation-name:driftIn;transform:translateX(42px) rotate(1.5deg);filter:blur(3px)}
[data-anim="curtain"] .reveal{animation-name:curtainIn;clip-path:inset(0 0 100% 0);transform:translateY(18px);filter:blur(2px)}
[data-anim="flip"] .reveal{animation-name:flipIn;transform:perspective(900px) rotateY(-34deg);transform-origin:left center;filter:blur(2px)}
[data-anim="rise"] .reveal{animation-name:rise;transform:translateY(22px);filter:blur(4px)}
@keyframes rise{to{opacity:1;transform:translateY(0);filter:blur(0)}}
@keyframes fade{from{opacity:0}to{opacity:1;transform:none;filter:none}}
@keyframes blurIn{from{opacity:0}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes fromLeft{to{opacity:1;transform:translateX(0);filter:none}}
@keyframes fromRight{to{opacity:1;transform:translateX(0);filter:none}}
@keyframes wipeIn{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0);transform:none;filter:none}}
@keyframes driftIn{from{opacity:0;transform:translateX(42px) rotate(1.5deg);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes curtainIn{from{opacity:0;clip-path:inset(0 0 100% 0);transform:translateY(18px);filter:blur(2px)}to{opacity:1;clip-path:inset(0);transform:none;filter:none}}
@keyframes flipIn{from{opacity:0;transform:perspective(900px) rotateY(-34deg)}to{opacity:1;transform:none;filter:none}}
/* controls */
.controls{position:absolute;z-index:20;right:clamp(22px,3vw,44px);bottom:clamp(16px,2.8vh,30px);display:flex;align-items:center;gap:12px;color:#f3ead8;font:700 12px/1 var(--sans);letter-spacing:.12em}
.progress{width:160px;height:2px;background:rgba(255,255,255,.22);overflow:hidden}
.progress-fill{height:100%;background:var(--accent2);transform:scaleX(0);transform-origin:left;transition:transform .4s ease}
.control-button{border:0;background:transparent;color:inherit;cursor:pointer;padding:6px;font:700 18px/1 var(--sans)}
.control-button:hover{color:var(--accent2)}
@media(max-width:520px){.controls{right:12px;bottom:10px;gap:8px}.progress{width:clamp(72px,22vw,96px)}.control-button{padding:3px;font-size:15px}.counter{font-size:10px}}
`;

const html = `<!doctype html>
<html lang="vi" data-pl-format="16:9" data-pl-title="${esc(spec.title)}" data-pl-author="PresentLab" data-pl-theme="${slug}" data-style="${slug}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(spec.title)} · PresentLab</title>
<style>${style}</style>
<style>${showcaseStyle}</style>
</head>
<body>
<div class="stage"><div class="deck" id="deck">
${sections}
<div class="controls">
  <button class="control-button" id="prev" aria-label="Trước">‹</button>
  <div class="progress"><div class="progress-fill" id="bar"></div></div>
  <button class="control-button" id="next" aria-label="Sau">›</button>
  <span id="count" class="counter"></span>
</div>
</div></div>
<script>
(function(){
  var slides=[].slice.call(document.querySelectorAll('[data-pl-slide]'));
  var i=0;
  function show(n){n=Math.max(0,Math.min(slides.length-1,n));slides.forEach(function(s,k){s.classList.toggle('active',k===n)});i=n;var f=(n+1)/slides.length;document.getElementById('bar').style.transform='scaleX('+f+')';document.getElementById('count').textContent=(n+1)+' / '+slides.length;}
  function next(){show(i+1);}function prev(){show(i-1);}
  document.getElementById('next').addEventListener('click',next);
  document.getElementById('prev').addEventListener('click',prev);
  document.querySelector('.deck').addEventListener('click',function(e){if(e.target.closest('.controls'))return;next();});
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
const cleanHtml = html.replace(/[ \t]+$/gm, "");
writeFileSync(outPath, cleanHtml, "utf-8");
const sizeKB = Buffer.byteLength(cleanHtml) / 1024;
console.log(`Wrote ${outPath} (${sizeKB.toFixed(0)} KB) with ${slides.length} slides.`);
