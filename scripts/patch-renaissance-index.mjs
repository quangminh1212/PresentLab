#!/usr/bin/env node
/**
 * patch-renaissance-index.mjs — embed each painter's real hero artwork into the
 * card thumbnails of examples/renaissance-index.html.
 *
 * The index was originally generated with placeholder thumbnails (the same tiny
 * base64 image repeated on every card). This rewrites each <div class="thumb">
 * with the hero image from assets/slide-artwork2/<slug>.json so the landing page
 * shows actual artwork instead of a blank gradient.
 *
 * Order of cards in the HTML matches the slugs below.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const INDEX = resolve(ROOT, "examples", "renaissance-index.html");
const ART = resolve(ROOT, "assets", "slide-artwork2");

// Card order as it appears in the index.
const slugs = [
  "leonardo-da-vinci",
  "michelangelo",
  "raphael",
  "botticelli",
  "titian",
  "duerer",
];

let html = readFileSync(INDEX, "utf-8");
let replaced = 0;

for (const slug of slugs) {
  const manifest = JSON.parse(readFileSync(resolve(ART, `${slug}.json`), "utf-8"));
  const hero = (manifest.hero && manifest.hero.data) || (manifest.images[0] && manifest.images[0].data);
  if (!hero) {
    console.warn(`! no hero art for ${slug}, skipping`);
    continue;
  }
  const dataUri = `data:${manifest.hero?.mime || "image/webp"};base64,${hero}`;

  // Replace the first <div class="thumb" ...> after this slug's card anchor.
  const anchor = new RegExp(`(<a class="card" href="${slug}\\.html">\\s*<div class="thumb")[^>]*>`, "m");
  const m = anchor.exec(html);
  if (!m) {
    console.warn(`! could not locate thumb for ${slug}`);
    continue;
  }
  html = html.replace(m[0], `${m[1]} style="background-image:url('${dataUri}')"`);
  replaced++;
  console.log(`  ok ${slug} hero -> thumb`);
}

writeFileSync(INDEX, html, "utf-8");
console.log(`Wrote ${INDEX} (${Math.round(Buffer.byteLength(html) / 1024)} KB); ${replaced}/${slugs.length} thumbs embedded.`);
