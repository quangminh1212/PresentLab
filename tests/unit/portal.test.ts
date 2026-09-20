import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve("web", "portal");

describe("client request portal", () => {
  it("ships the customer selection and brief handoff surface", async () => {
    const html = await readFile(join(root, "index.html"), "utf8");
    const app = await readFile(join(root, "app.js"), "utf8");
    const styles = await readFile(join(root, "styles.css"), "utf8");

    expect(html).toContain("data-template-grid");
    expect(html).toContain("data-request-form");
    expect(html).toContain('data-request-endpoint="/api/slide-requests"');
    expect(html).toContain("data-handoff-email");
    expect(html).toContain('name="slideCount"');
    expect(html).toContain('type="number"');
    expect(html).toContain('sandbox="allow-same-origin"');
    expect(html).toContain("Content-Security-Policy");
    expect(app).toContain("const MAX_SELECTIONS = 3;");
    expect(app).toContain("const MAX_ATTACHMENT_FILES = 10;");
    expect(app).toContain('const TEMPLATE_INDEX_URL = "/resources/templates/index.json";');
    expect(app).toContain("function previewDocument(template)");
    expect(app).toContain('source: "presentlab-client-request-portal"');
    expect(app).toContain('slideCount: Number(data.get("slideCount") || 0)');
    expect(app).toContain("async function sendRequest(payload, form)");
    expect(app).toContain('multipart.append("request", JSON.stringify(payload));');
    expect(styles).toContain(".selection-tray");
    expect(styles).toContain("@media (max-width: 760px)");
  });

  it("has a template index available to hydrate the gallery", async () => {
    const templateIndex = JSON.parse(
      await readFile(resolve("resources", "templates", "index.json"), "utf8"),
    ) as unknown[];
    expect(templateIndex.length).toBeGreaterThanOrEqual(8);
    expect((await stat(join(root, "index.html"))).size).toBeGreaterThan(1000);
  });
});
