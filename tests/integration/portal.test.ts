import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";

import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

const root = resolve(".");
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webm": "video/webm",
};

async function startPortalServer() {
  let capturedRequest: { body: string; contentType: string | undefined } | undefined;

  const handleRequest = async (request: IncomingMessage, response: ServerResponse) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    if (request.method === "POST" && requestUrl.pathname === "/api/slide-requests") {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      capturedRequest = {
        body: Buffer.concat(chunks).toString("utf8"),
        contentType: request.headers["content-type"],
      };
      response.writeHead(202).end();
      return;
    }

    try {
      const requestedPath = requestUrl.pathname.endsWith("/")
        ? `${requestUrl.pathname}index.html`
        : requestUrl.pathname;
      const filePath = resolve(root, `.${decodeURIComponent(requestedPath)}`);
      const relativePath = relative(root, filePath);
      if (
        relativePath === ".." ||
        relativePath.startsWith(`..${sep}`) ||
        isAbsolute(relativePath)
      ) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(filePath);
      const headers: Record<string, string> = {
        "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
        "Content-Length": body.byteLength.toString(),
      };
      if (extname(filePath) === ".webm") headers.Connection = "close";
      response.writeHead(200, headers).end(body);
    } catch {
      response.writeHead(404).end();
    }
  };

  const server = createServer((request, response) => {
    void handleRequest(request, response);
  });
  await new Promise<void>((resolveServer) => server.listen(0, "127.0.0.1", resolveServer));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Portal test server did not start.");

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
    getCapturedRequest: () => capturedRequest,
  };
}

describe("client request portal browser flow", () => {
  it("filters the full library, caps selections, previews a deck, and posts multipart briefs", async () => {
    const portalServer = await startPortalServer();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const pageErrors: string[] = [];
    const webglErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /(THREE\.WebGLProgram|Shader Error|MirrorShader|WebGL)/i.test(message.text())
      ) {
        webglErrors.push(message.text());
      }
    });

    try {
      await page.goto(`${portalServer.baseUrl}/web/portal/`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator("[data-results-count]").waitFor();
      expect(await page.locator("[data-results-count]").innerText()).toBe("770 mẫu");
      expect(await page.locator("[data-template-card]").count()).toBe(24);

      await page.locator("[data-search]").fill("Bauhaus");
      await page.waitForFunction(
        () => document.querySelector("[data-results-count]")?.textContent === "10 mẫu",
      );
      expect(await page.locator("[data-template-card]").count()).toBe(10);
      await page.locator("[data-clear-filters]").first().click();
      await page.waitForFunction(
        () => document.querySelector("[data-results-count]")?.textContent === "770 mẫu",
      );

      for (let index = 0; index < 4; index += 1) {
        await page.locator("[data-select-template]").nth(index).click();
      }
      expect(await page.locator("[data-selection-count]").first().innerText()).toBe("3");
      expect(await page.locator("[data-toast].is-visible").innerText()).toContain("tối đa 3 mẫu");

      await page.locator("[data-preview-template]").first().click();
      await page.locator("[data-preview-modal]:not([hidden])").waitFor();
      await page.waitForFunction(() => {
        const frame = document.querySelector("[data-preview-frame]");
        return Boolean(frame?.getAttribute("src") || frame?.getAttribute("srcdoc"));
      });
      expect(await page.locator("[data-preview-frame]").getAttribute("sandbox")).toBe(
        "allow-same-origin",
      );
      const previewFrame = page.locator("[data-preview-frame]");
      const previewSrc = await previewFrame.getAttribute("src");
      const previewSrcdoc = await previewFrame.getAttribute("srcdoc");
      expect(previewSrc?.includes("/templates/") || Boolean(previewSrcdoc)).toBe(true);
      await page.locator("[data-close-preview]").click();

      await page.locator(".selection-tray [data-open-request]").click();
      expect(await page.locator("[data-request-drawer].is-open").count()).toBe(1);
      expect(await page.locator("[data-drawer-selections] .selected-template").count()).toBe(3);
      await page.evaluate((endpoint) => {
        document.documentElement.dataset.requestEndpoint = endpoint;
      }, `${portalServer.baseUrl}/api/slide-requests`);
      await page.locator("[name=projectName]").fill("Pitch deck Q4");
      await page.locator("[name=slideCount]").fill("137");
      await page.locator("[name=service][value=customize]").check();
      await page.locator("[name=contactName]").fill("Nguyen Van A");
      await page.locator("[name=email]").fill("a@example.com");
      await page.locator("[name=consent]").check();
      await page.locator("[data-attachments]").setInputFiles({
        name: "brief.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("production portal smoke test"),
      });
      await page.locator("[data-submit-request]").click();
      await page.locator("[data-success-view]:not([hidden])").waitFor();

      const captured = portalServer.getCapturedRequest();
      expect(captured?.contentType).toContain("multipart/form-data");
      expect(captured?.body).toContain('name="request"');
      expect(captured?.body).toContain('filename="brief.txt"');
      expect(captured?.body).toContain('"presentlab-client-request-portal"');
      expect(captured?.body).toContain('"slideCount":137');
      expect(pageErrors).toEqual([]);
      expect(webglErrors).toEqual([]);
    } finally {
      await browser.close();
      portalServer.server.closeAllConnections();
      await new Promise<void>((resolveServer, rejectServer) =>
        portalServer.server.close((error) => (error ? rejectServer(error) : resolveServer())),
      );
    }
  }, 120_000);

  it("keeps the mobile shell within the viewport and exposes the menu", async () => {
    const portalServer = await startPortalServer();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    try {
      await page.goto(`${portalServer.baseUrl}/web/portal/`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator("[data-menu-toggle]").click();
      expect(await page.locator(".topnav.is-open").count()).toBe(1);
      const viewportOverflow = await page.evaluate(
        () =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
          window.innerWidth,
      );
      expect(viewportOverflow).toBeLessThanOrEqual(1);
      await page.locator("[data-menu-toggle]").click();
      await page.evaluate(() => {
        document.querySelector("#templates")?.scrollIntoView({ behavior: "auto", block: "start" });
      });
      await page.waitForFunction(() =>
        document.querySelector("[data-scene-transition]")?.classList.contains("is-active"),
      );
      await page.waitForFunction(
        () => !document.querySelector("[data-scene-transition]")?.classList.contains("is-active"),
        undefined,
        { timeout: 3_000 },
      );
    } finally {
      await browser.close();
      portalServer.server.closeAllConnections();
      await new Promise<void>((resolveServer, rejectServer) =>
        portalServer.server.close((error) => (error ? rejectServer(error) : resolveServer())),
      );
    }
  }, 120_000);

  it("covers preferences, library controls, preview navigation, and local handoff", async () => {
    const portalServer = await startPortalServer();
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const pageErrors: string[] = [];
    const webglErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /(THREE\.WebGLProgram|Shader Error|MirrorShader|WebGL)/i.test(message.text())
      ) {
        webglErrors.push(message.text());
      }
    });

    try {
      await page.goto(`${portalServer.baseUrl}/web/portal/`, { waitUntil: "domcontentloaded" });
      await page.locator("[data-results-count]").waitFor();
      expect(await page.locator(".brand-logo").first().getAttribute("src")).toBe(
        "/web/portal/xlab-logo.png",
      );
      expect(
        await page
          .locator(".brand-logo")
          .first()
          .evaluate((image) => image.naturalWidth),
      ).toBeGreaterThan(0);
      expect(
        await page
          .locator(".brand-logo-frame")
          .first()
          .evaluate((frame) => ({
            borderWidth: getComputedStyle(frame).borderWidth,
            boxShadow: getComputedStyle(frame).boxShadow,
          })),
      ).toEqual({ borderWidth: "0px", boxShadow: "none" });
      expect(await page.locator(".topnav [data-open-request]").count()).toBe(0);
      expect(await page.locator(".world-stage.world-ready").count()).toBe(1);
      expect(await page.locator(".world-location").count()).toBe(3);
      expect(await page.locator(".world-location strong").count()).toBe(3);
      expect(await page.locator("[data-world-start]").count()).toBe(1);
      expect(await page.locator(".world-space-image").count()).toBe(1);
      expect(await page.locator("[data-world-water-video]").count()).toBe(1);
      expect(await page.locator("[data-world-water-video] source").getAttribute("src")).toBe(
        "/web/portal/water-surface.webm",
      );
      await page.waitForFunction(
        () => {
          const stage = document.querySelector(".world-stage");
          return (
            stage?.dataset.worldRenderMode === "webgl-water-3d" &&
            stage.dataset.worldShading === "threejs-water-addon" &&
            stage.dataset.worldWaterTexture === "ready"
          );
        },
        undefined,
        { timeout: 10_000 },
      );
      await page.waitForFunction(
        () => {
          const [calls, triangles] = (
            document.querySelector(".world-stage")?.dataset.worldGpuRender ?? "0|0"
          )
            .split("|")
            .map(Number);
          return calls > 0 && triangles > 0;
        },
        undefined,
        { timeout: 3_000 },
      );
      const gpuRenderState = (
        await page.locator(".world-stage").getAttribute("data-world-gpu-render")
      )
        ?.split("|")
        .map(Number);
      expect(gpuRenderState?.[0]).toBeGreaterThan(0);
      expect(gpuRenderState?.[1]).toBeGreaterThan(0);
      expect(await page.locator(".world-stage").getAttribute("data-world-render-mode")).toBe(
        "webgl-water-3d",
      );
      expect(await page.locator(".world-stage").getAttribute("data-world-shading")).toBe(
        "threejs-water-addon",
      );
      expect(await page.locator(".world-stage").getAttribute("data-world-surface")).toBe(
        "official-water-module",
      );
      expect(await page.locator(".world-stage").getAttribute("data-world-interaction")).toBe(
        "pointer-camera-ripple",
      );
      expect(await page.locator(".world-stage").getAttribute("data-world-water-provider")).toBe(
        "threejs-official-water",
      );
      expect(await page.locator(".world-stage").getAttribute("data-world-ripple-provider")).toBe(
        "threejs-water-shader",
      );
      expect(await page.locator(".world-stage").getAttribute("data-world-ripple-mode")).toBe(
        "four-slot-heightfield",
      );
      expect(
        Number(await page.locator(".world-stage").getAttribute("data-world-ripple-count")),
      ).toBe(0);
      expect(await page.locator(".world-stage").getAttribute("data-world-video-state")).toBe(
        "standby",
      );
      expect(
        await page.locator(".world-canvas").evaluate((canvas) => ({
          opacity: getComputedStyle(canvas).opacity,
          zIndex: getComputedStyle(canvas).zIndex,
        })),
      ).toEqual({ opacity: "1", zIndex: "2" });
      expect(
        await page
          .locator("[data-world-water-video]")
          .evaluate((video) => getComputedStyle(video).opacity),
      ).toBe("0");
      expect(
        await page
          .locator(".world-stage")
          .evaluate((element) => element.classList.contains("is-video-water")),
      ).toBe(false);
      expect(
        await page
          .locator(".world-space-image")
          .evaluate(
            (element) => !getComputedStyle(element).backgroundImage.includes("space-cosmos.png"),
          ),
      ).toBe(true);
      expect(await page.locator(".world-controls, [data-world-command]").count()).toBe(0);
      const worldCanvasSize = await page.locator(".world-canvas").evaluate((canvas) => ({
        width: canvas.width,
        height: canvas.height,
      }));
      expect(worldCanvasSize.width).toBeGreaterThan(0);
      expect(worldCanvasSize.height).toBeGreaterThan(0);
      expect(
        await page
          .locator(".world-stage")
          .evaluate((element) => getComputedStyle(element).borderRadius),
      ).toBe("0px");
      const worldBounds = await page.locator(".world-stage").boundingBox();
      if (!worldBounds) throw new Error("World stage did not expose a bounding box.");
      await page.mouse.move(
        worldBounds.x + worldBounds.width * 0.12,
        worldBounds.y + worldBounds.height * 0.5,
      );
      await page.waitForTimeout(120);
      const leftCosmicTransform = await page
        .locator(".world-space-image")
        .evaluate((element) => getComputedStyle(element).transform);
      await page.mouse.move(
        worldBounds.x + worldBounds.width * 0.88,
        worldBounds.y + worldBounds.height * 0.5,
      );
      await page.waitForTimeout(120);
      const rightCosmicTransform = await page
        .locator(".world-space-image")
        .evaluate((element) => getComputedStyle(element).transform);
      expect(leftCosmicTransform).not.toBe(rightCosmicTransform);
      const leftVideoTransform = await page
        .locator("[data-world-water-video]")
        .evaluate((element) => getComputedStyle(element).transform);
      await page.mouse.move(
        worldBounds.x + worldBounds.width * 0.16,
        worldBounds.y + worldBounds.height * 0.5,
      );
      await page.waitForTimeout(120);
      const rightVideoTransform = await page
        .locator("[data-world-water-video]")
        .evaluate((element) => getComputedStyle(element).transform);
      expect(leftVideoTransform).not.toBe(rightVideoTransform);
      const imageMotion = await page.locator(".world-space-image").evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          animationName: styles.animationName,
          backgroundSize: styles.backgroundSize,
          imageShiftX: element.parentElement?.style.getPropertyValue("--world-image-shift-x"),
          pointerIntensity: element.parentElement?.style.getPropertyValue(
            "--world-pointer-intensity",
          ),
        };
      });
      expect(imageMotion.animationName).toContain("world-water-drift");
      expect(imageMotion.backgroundSize).not.toBe("cover");
      expect(imageMotion.imageShiftX).toMatch(/px$/);
      expect(Number.parseFloat(imageMotion.pointerIntensity || "0")).toBeGreaterThan(0);

      const firstWaterState = await page
        .locator(".world-stage")
        .getAttribute("data-world-water-state");
      const firstImageShift = await page
        .locator(".world-stage")
        .evaluate((element) => element.style.getPropertyValue("--world-image-shift-x"));
      const firstImageMotion = await page.locator(".world-space-image").evaluate((element) => ({
        backgroundPosition: getComputedStyle(element).backgroundPosition,
        transform: getComputedStyle(element).transform,
      }));
      const reducedMotion = await page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      if (!reducedMotion) {
        await page.waitForFunction(
          ({ initialWaterState, initialImageShift }) => {
            const stage = document.querySelector(".world-stage");
            const imageShift = stage?.style.getPropertyValue("--world-image-shift-x");
            return (
              stage?.dataset.worldWaterState !== initialWaterState ||
              imageShift !== initialImageShift
            );
          },
          { initialWaterState: firstWaterState, initialImageShift: firstImageShift },
          { timeout: 3_000 },
        );
      }
      const nextWaterState = await page
        .locator(".world-stage")
        .getAttribute("data-world-water-state");
      const nextImageMotion = await page.locator(".world-space-image").evaluate((element) => ({
        backgroundPosition: getComputedStyle(element).backgroundPosition,
        transform: getComputedStyle(element).transform,
      }));
      if (!reducedMotion) {
        expect(nextWaterState).not.toBe(firstWaterState);
        expect(nextImageMotion.backgroundPosition).not.toBe(firstImageMotion.backgroundPosition);
        expect(nextImageMotion.transform).not.toBe(firstImageMotion.transform);
      }
      expect(await page.locator(".world-stage").getAttribute("data-world-water-phase")).toMatch(
        /^\d+\.\d+$/,
      );

      const initialRippleCount = Number(
        await page.locator(".world-stage").getAttribute("data-world-ripple-count"),
      );
      await page.locator(".world-stage").dispatchEvent("pointerdown", {
        clientX: worldBounds.x + worldBounds.width * 0.62,
        clientY: worldBounds.y + worldBounds.height * 0.62,
        bubbles: true,
      });
      await page.waitForFunction(
        (count) => Number(document.querySelector(".world-stage")?.dataset.worldRippleCount) > count,
        initialRippleCount,
        { timeout: 3_000 },
      );
      const rippleState = await page.locator(".world-stage").evaluate((element) => ({
        state: element.dataset.worldRippleState,
        radius: Number(element.dataset.worldRippleRadius),
        peak: Number(element.dataset.worldRipplePeak),
      }));
      expect(rippleState.state).toMatch(/^\d+\|\d+\|-?\d+\.\d+\|-?\d+\.\d+,-?\d+\.\d+$/);
      expect(rippleState.radius).toBeGreaterThanOrEqual(0);
      const reducedRippleMotion = await page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      if (!reducedRippleMotion) {
        expect(rippleState.peak).toBeGreaterThan(0);
        await page.waitForFunction(
          (initialRadius) =>
            Number(document.querySelector(".world-stage")?.dataset.worldRippleRadius) >
            initialRadius + 0.1,
          rippleState.radius,
          { timeout: 3_000 },
        );
      }
      expect(
        await page
          .locator(".world-stage")
          .evaluate((element) => element.classList.contains("is-world-pulsing")),
      ).toBe(true);
      const firstRippleCount = Number(
        await page.locator(".world-stage").getAttribute("data-world-ripple-count"),
      );
      await page.locator(".world-stage").dispatchEvent("pointerdown", {
        clientX: worldBounds.x + worldBounds.width * 0.76,
        clientY: worldBounds.y + worldBounds.height * 0.68,
        bubbles: true,
      });
      await page.waitForFunction(
        (count) => Number(document.querySelector(".world-stage")?.dataset.worldRippleCount) > count,
        firstRippleCount,
        { timeout: 3_000 },
      );
      expect(
        Number(await page.locator(".world-stage").getAttribute("data-world-ripple-count")),
      ).toBe(firstRippleCount + 1);

      const initialTheme = (await page.locator("html").getAttribute("data-theme")) || "dark";
      const toggledTheme = initialTheme === "dark" ? "light" : "dark";
      await page.locator("[data-theme-toggle]").click();
      await page.waitForFunction(
        (expected) => document.documentElement.dataset.theme === expected,
        toggledTheme,
      );
      expect(await page.locator("html").getAttribute("data-theme")).toBe(toggledTheme);
      const toggledPressed = toggledTheme === "light" ? "true" : "false";
      await page.waitForFunction(
        (expected) =>
          document.querySelector("[data-theme-toggle]")?.getAttribute("aria-pressed") === expected,
        toggledPressed,
      );
      expect(await page.locator("[data-theme-toggle]").getAttribute("aria-pressed")).toBe(
        toggledPressed,
      );
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("theme-switching"),
      );
      await page.locator("[data-theme-toggle]").click();
      await page.waitForFunction(
        (expected) => document.documentElement.dataset.theme === expected,
        initialTheme,
      );
      await page.waitForFunction(
        (expected) =>
          document.querySelector("[data-theme-toggle]")?.getAttribute("aria-pressed") === expected,
        initialTheme === "light" ? "true" : "false",
      );
      expect(await page.locator("html").getAttribute("data-theme")).toBe(initialTheme);

      await page.locator("select[data-locale]").selectOption("en");
      expect(await page.locator("html").getAttribute("lang")).toBe("en");
      await page.locator("select[data-locale]").selectOption("zh");
      expect(await page.locator("html").getAttribute("lang")).toBe("zh-CN");
      await page.locator("select[data-locale]").selectOption("vi");

      const family = page.locator("[data-family-filter] option").nth(1);
      const category = page.locator("[data-category-filter] option").nth(1);
      const palette = page.locator("[data-palette-filter] option").nth(1);
      await page.locator("[data-family-filter]").selectOption(await family.getAttribute("value"));
      expect(await page.locator("[data-template-card]").count()).toBeGreaterThan(0);
      await page.locator("[data-clear-filters]").first().click();
      await page
        .locator("[data-category-filter]")
        .selectOption(await category.getAttribute("value"));
      expect(await page.locator("[data-template-card]").count()).toBeGreaterThan(0);
      await page.locator("[data-clear-filters]").first().click();
      await page.locator("[data-palette-filter]").selectOption(await palette.getAttribute("value"));
      expect(await page.locator("[data-template-card]").count()).toBeGreaterThan(0);
      await page.locator("[data-clear-filters]").first().click();
      await page.waitForFunction(
        () => document.querySelector("[data-results-count]")?.textContent === "770 mẫu",
      );

      await page.locator("[data-sort]").selectOption("name");
      await page.locator("[data-template-card]").first().waitFor({ state: "visible" });
      await page.locator("[data-load-more]").click();
      expect(await page.locator("[data-template-card]").count()).toBe(48);

      await page.locator("[data-search]").fill("Bauhaus");
      await page.waitForFunction(
        () => document.querySelector("[data-results-count]")?.textContent === "10 mẫu",
      );
      await page.locator("[data-preview-template]").first().click();
      await page.locator("[data-preview-modal]").waitFor({ state: "visible" });
      await page.waitForFunction(() => {
        const frame = document.querySelector("[data-preview-frame]");
        return Boolean(frame?.getAttribute("src") || frame?.getAttribute("srcdoc"));
      });
      const firstPosition = await page.locator("[data-preview-position]").innerText();
      await page.locator("[data-preview-next]").click();
      await page.waitForFunction(
        (previous) => document.querySelector("[data-preview-position]")?.textContent !== previous,
        firstPosition,
      );
      await page.keyboard.press("ArrowLeft");
      await page.locator("[data-preview-select]").click();
      expect(await page.locator("[data-selection-count]").first().innerText()).toBe("1");
      await page.keyboard.press("Escape");
      await page.locator("[data-preview-modal]").waitFor({ state: "hidden" });
      await page.locator("[data-clear-filters]").first().click();

      for (let index = 0; index < 3; index += 1) {
        await page.locator("[data-select-template]").nth(index).click();
      }
      expect(await page.locator("[data-selection-count]").first().innerText()).toBe("3");
      await page.locator("[data-select-template]").nth(3).click();
      await page.waitForFunction(() =>
        document.querySelector("[data-toast].is-visible")?.textContent?.includes("tối đa 3 mẫu"),
      );
      await page.locator("[data-tray-selections] [data-remove-selected]").first().click();
      expect(await page.locator("[data-selection-count]").first().innerText()).toBe("2");

      await page.locator(".selection-tray [data-open-request]").click();
      await page.waitForFunction(() =>
        document.querySelector("[data-request-drawer]")?.classList.contains("is-open"),
      );
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () => !document.querySelector("[data-request-drawer]")?.classList.contains("is-open"),
      );
      await page.locator(".selection-tray [data-open-request]").click();

      await page.evaluate(() => {
        document.documentElement.dataset.requestEndpoint = "";
        document.documentElement.dataset.handoffEmail = "";
      });
      await page.locator("[name=projectName]").fill("Local handoff audit");
      await page.locator("[name=slideCount]").fill("12");
      await page.locator("[name=service][value=customize]").check();
      await page.locator("[name=contactName]").fill("Portal QA");
      await page.locator("[name=email]").fill("qa@example.com");
      await page.locator("[name=consent]").check();
      await page.locator("[data-attachments]").setInputFiles({
        name: "brief.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("local handoff audit"),
      });
      await page.locator("[data-file-list]").waitFor({ state: "visible" });
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("[data-submit-request]").click(),
      ]);
      await page.locator("[data-success-view]").waitFor({ state: "visible" });
      expect(download.suggestedFilename()).toMatch(/^pl-\d{8}-[a-z0-9]{4}\.json$/);
      expect(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("presentlab.slide-requests") || "[]").length,
        ),
      ).toBe(1);
      await page.locator("[data-download-request]").click();
      await page.locator("[data-new-request]").click();
      await page.locator("[data-form-view]").waitFor({ state: "visible" });

      await page.locator("[name=projectName]").fill("Attachment validation audit");
      await page.locator("[name=slideCount]").fill("8");
      await page.locator("[name=service][value=customize]").check();
      await page.locator("[name=contactName]").fill("Portal QA");
      await page.locator("[name=email]").fill("qa@example.com");
      await page.locator("[name=consent]").check();
      await page.locator("[data-attachments]").setInputFiles({
        name: "too-large.txt",
        mimeType: "text/plain",
        buffer: Buffer.alloc(3 * 1024 * 1024 + 1),
      });
      await page.locator("[data-submit-request]").click();
      await page.waitForFunction(() =>
        document.querySelector("[data-toast].is-visible")?.textContent?.includes("too-large.txt"),
      );
      expect(pageErrors).toEqual([]);
      expect(webglErrors).toEqual([]);
    } finally {
      await browser.close();
      portalServer.server.closeAllConnections();
      await new Promise<void>((resolveServer, rejectServer) =>
        portalServer.server.close((error) => (error ? rejectServer(error) : resolveServer())),
      );
    }
  }, 120_000);
});
