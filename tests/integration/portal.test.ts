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
      response
        .writeHead(200, {
          "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
        })
        .end(body);
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
    page.on("pageerror", (error) => pageErrors.push(error.message));

    try {
      await page.goto(`${portalServer.baseUrl}/web/portal/`, {
        waitUntil: "networkidle",
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

      await page.locator("[data-open-request]").first().click();
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
    } finally {
      await browser.close();
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
        waitUntil: "networkidle",
      });
      await page.locator("[data-menu-toggle]").click();
      expect(await page.locator(".topnav.is-open").count()).toBe(1);
      const viewportOverflow = await page.evaluate(
        () =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
          window.innerWidth,
      );
      expect(viewportOverflow).toBeLessThanOrEqual(1);
    } finally {
      await browser.close();
      await new Promise<void>((resolveServer, rejectServer) =>
        portalServer.server.close((error) => (error ? rejectServer(error) : resolveServer())),
      );
    }
  }, 120_000);
});
