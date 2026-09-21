/* global document, getComputedStyle */

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const templatesRoot = join(root, "templates");
const index = JSON.parse(await readFile(join(templatesRoot, "index.json"), "utf8"));
const viewport = { width: 1600, height: 900 };
const tolerance = 2;
const workerCount = Math.min(
  4,
  Math.max(1, Number(process.env.PRESENTLAB_LAYOUT_CONCURRENCY ?? 4)),
);
const failures = [];
let nextIndex = 0;

async function inspectTemplate(page, entry) {
  const htmlPath = join(templatesRoot, entry.path);
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(
    ({ tolerance: limit }) => {
      const slides = [...document.querySelectorAll("[data-pl-slide]")];
      const rectOfElement = (element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: Number(rect.left.toFixed(2)),
          top: Number(rect.top.toFixed(2)),
          right: Number(rect.right.toFixed(2)),
          bottom: Number(rect.bottom.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
        };
      };
      const visible = (element) => {
        const styles = getComputedStyle(element);
        return (
          styles.display !== "none" && styles.visibility !== "hidden" && Number(styles.opacity) > 0
        );
      };

      return slides.map((slide) => {
        const slideRect = slide.getBoundingClientRect();
        const overflow = [];
        for (const element of slide.querySelectorAll("*")) {
          if (!visible(element) || element.classList.contains("composition-mark")) continue;
          const rect = element.getBoundingClientRect();
          if (
            rect.left < slideRect.left - limit ||
            rect.top < slideRect.top - limit ||
            rect.right > slideRect.right + limit ||
            rect.bottom > slideRect.bottom + limit
          ) {
            overflow.push({
              tag: element.tagName,
              className: String(element.className),
              rect: rectOfElement(element),
            });
            if (overflow.length >= 4) break;
          }
        }
        const footer = slide.querySelector(":scope > .footer, :scope > .story-footer");
        const footerStyles = footer ? getComputedStyle(footer) : null;
        const footerRect = footer ? footer.getBoundingClientRect() : null;
        const footerIssue = Boolean(
          footer &&
          (footerStyles.position !== "absolute" ||
            footerRect.left < slideRect.left - limit ||
            footerRect.right > slideRect.right + limit ||
            footerRect.bottom > slideRect.bottom + limit),
        );
        return {
          id: slide.dataset.slideId ?? "unknown",
          rect: rectOfElement(slide),
          overflow,
          scrollWidth: slide.scrollWidth,
          scrollHeight: slide.scrollHeight,
          footerIssue,
        };
      });
    },
    { tolerance },
  );

  const templateFailures = [];
  if (result.length !== 45) {
    templateFailures.push(`expected 45 slides, found ${result.length}`);
  }
  result.forEach((slide) => {
    if (slide.rect.width !== viewport.width || slide.rect.height !== viewport.height) {
      templateFailures.push(`${slide.id} canvas ${slide.rect.width}x${slide.rect.height}`);
    }
    if (slide.overflow.length > 0) {
      templateFailures.push(`${slide.id} overflow ${JSON.stringify(slide.overflow)}`);
    }
    if (slide.footerIssue) {
      templateFailures.push(`${slide.id} footer is missing, flowing, or outside the canvas`);
    }
  });
  return templateFailures;
}

async function worker(browser) {
  const page = await browser.newPage({ viewport });
  while (true) {
    const current = nextIndex++;
    if (current >= index.length) break;
    const entry = index[current];
    try {
      const templateFailures = await inspectTemplate(page, entry);
      if (templateFailures.length > 0) {
        failures.push({ name: entry.name, errors: templateFailures.slice(0, 8) });
      }
    } catch (error) {
      failures.push({
        name: entry.name,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }
  await page.close();
}

const browser = await chromium.launch({ headless: true });
await Promise.all(Array.from({ length: workerCount }, () => worker(browser)));
await browser.close();

if (failures.length > 0) {
  console.error(
    `Slide layout verification failed for ${failures.length}/${index.length} templates.`,
  );
  for (const failure of failures.slice(0, 20)) {
    console.error(`${failure.name}: ${failure.errors.join("; ")}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Slide layout verification passed: ${index.length} templates x 45 slides, 1600x900 canvas, in-bounds footers.`,
  );
}
