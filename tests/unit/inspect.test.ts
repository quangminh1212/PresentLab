import { describe, expect, it } from "vitest";

import { inspectDeckHtml, toValidationResult } from "../../src/core/inspect.js";

describe("PresentLab HTML contract", () => {
  it("accepts unique slides and extracts metadata", () => {
    const result = inspectDeckHtml(`
      <!doctype html>
      <html lang="vi" data-pl-format="4:3" data-pl-title="Báo cáo quý">
        <body>
          <section data-pl-slide data-slide-id="intro"><h1>Giới thiệu</h1></section>
          <section class="pl-slide" data-slide-id="result"><h2>Kết quả</h2></section>
        </body>
      </html>
    `);

    expect(result.errors).toEqual([]);
    expect(result.manifest.title).toBe("Báo cáo quý");
    expect(result.manifest.format).toBe("4:3");
    expect(result.manifest.language).toBe("vi");
    expect(result.slides.map((slide) => slide.id)).toEqual(["intro", "result"]);
  });

  it("reports missing slides, invalid format, and duplicate ids", () => {
    const result = inspectDeckHtml(`
      <html data-pl-format="wide"><body>
        <section class="pl-slide" data-slide-id="same"><h1>One</h1></section>
        <section class="pl-slide" data-slide-id="same"><h1>Two</h1></section>
      </body></html>
    `);

    expect(result.errors.some((error) => error.includes("Manifest format"))).toBe(true);
    expect(result.errors.some((error) => error.includes("Duplicate slide id 'same'"))).toBe(true);
  });

  it("accepts arbitrary slide counts unless a caller sets a limit", () => {
    const unrestricted = inspectDeckHtml(
      `<html><body>${Array.from(
        { length: 125 },
        (_, index) => `<section class="pl-slide"><h1>${index + 1}</h1></section>`,
      ).join("")}</body></html>`,
    );
    expect(unrestricted.errors).toEqual([]);
    expect(unrestricted.slides).toHaveLength(125);

    const result = inspectDeckHtml(
      `<html><body>${Array.from(
        { length: 3 },
        (_, index) => `<section class="pl-slide"><h1>${index + 1}</h1></section>`,
      ).join("")}</body></html>`,
      2,
    );

    expect(result.errors).toContain("Deck has 3 slides; the configured limit is 2.");
    expect(result.slides).toHaveLength(2);
    expect(toValidationResult(result).valid).toBe(false);
  });

  it("warns about images without alt text", () => {
    const result = inspectDeckHtml(
      `<html><body><section class="pl-slide" data-slide-id="image"><h1>Image</h1><img src="local.png"></section></body></html>`,
    );

    expect(result.errors).toEqual([]);
    expect(result.warnings.some((warning) => warning.includes("alt text"))).toBe(true);
  });
});
