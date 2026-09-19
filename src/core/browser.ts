import { pathToFileURL } from "node:url";

import { chromium, type Browser, type BrowserContext, type Locator, type Page } from "playwright";

import { PresentLabError, getErrorMessage } from "./errors.js";
import { pageDimensions } from "./schema.js";
import type { DeckInspection } from "./schema.js";

export interface BrowserDeckOptions {
  readonly allowExternalAssets?: boolean;
}

export interface BrowserDeck {
  readonly browser: Browser;
  readonly context: BrowserContext;
  readonly page: Page;
  readonly slides: Locator;
  readonly inspection: DeckInspection;
  close(): Promise<void>;
}

function deckStyle(inspection: DeckInspection): string {
  const dimensions = pageDimensions(inspection.manifest.format);
  return `
    :root { color-scheme: light; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: ${dimensions.widthPx}px !important;
      min-height: ${dimensions.heightPx}px !important;
      background: #ffffff;
    }
    body { overflow: visible !important; }
    [data-pl-slide], .pl-slide {
      box-sizing: border-box !important;
      width: ${dimensions.widthPx}px !important;
      height: ${dimensions.heightPx}px !important;
      min-height: ${dimensions.heightPx}px !important;
      overflow: hidden !important;
      position: relative;
      break-after: page;
      page-break-after: always;
    }
    [data-pl-slide]:last-of-type, .pl-slide:last-of-type {
      break-after: auto;
      page-break-after: auto;
    }
    @media print {
      @page { size: ${dimensions.widthIn}in ${dimensions.heightIn}in; margin: 0; }
      html, body { width: ${dimensions.widthIn}in !important; }
      [data-pl-slide], .pl-slide { break-after: page; page-break-after: always; }
      [data-pl-slide]:last-of-type, .pl-slide:last-of-type { break-after: auto; page-break-after: auto; }
    }
  `;
}

async function waitForDocumentAssets(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
  });
}

export async function openBrowserDeck(
  inputPath: string,
  inspection: DeckInspection,
  options: BrowserDeckOptions = {},
): Promise<BrowserDeck> {
  const dimensions = pageDimensions(inspection.manifest.format);
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: dimensions.widthPx, height: dimensions.heightPx },
      deviceScaleFactor: 1,
      colorScheme: "light",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (!options.allowExternalAssets && /^(https?:|ws:|wss:)/i.test(url)) {
        await route.abort("blockedbyclient");
        return;
      }
      await route.continue();
    });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: "load", timeout: 15_000 });
    await page.emulateMedia({ media: "screen" });
    await page.addStyleTag({ content: deckStyle(inspection) });
    await waitForDocumentAssets(page);

    const slides = page.locator("[data-pl-slide], .pl-slide");
    const slideCount = await slides.count();
    if (slideCount !== inspection.slides.length) {
      throw new PresentLabError(
        "RENDER_SLIDE_COUNT_CHANGED",
        `HTML changed during rendering: validation found ${inspection.slides.length} slides but Chromium found ${slideCount}.`,
      );
    }

    return {
      browser,
      context,
      page,
      slides,
      inspection,
      async close() {
        await context?.close();
        await browser?.close();
      },
    };
  } catch (error) {
    await context?.close().catch(() => undefined);
    await browser?.close().catch(() => undefined);
    if (error instanceof PresentLabError) throw error;
    throw new PresentLabError(
      "BROWSER_RENDER_FAILED",
      `Chromium could not render the deck: ${getErrorMessage(error)}. Run 'npx playwright install chromium' if the browser is missing.`,
      { cause: error },
    );
  }
}
