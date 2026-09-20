import { parseHTML } from "linkedom";

import { getErrorMessage } from "./errors.js";
import { readUtf8File, sha256 } from "./files.js";
import { DeckManifestSchema } from "./schema.js";
import type { DeckInspection, DeckManifest, SlideInspection } from "./schema.js";

function firstAttribute(element: Element | null, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = element?.getAttribute(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function safeIdentifier(value: string, fallback: string): string {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function manifestCandidate(document: Document): Record<string, unknown> {
  const html = document.documentElement;
  const body = document.body;
  const title =
    firstAttribute(html, "data-pl-title") ??
    firstAttribute(body, "data-pl-title") ??
    (cleanText(document.querySelector("title")?.textContent) ||
      cleanText(document.querySelector("h1")?.textContent) ||
      "Untitled deck");
  const format = firstAttribute(html, "data-pl-format") ?? firstAttribute(body, "data-pl-format");
  const language =
    firstAttribute(html, "lang", "data-pl-language") ??
    firstAttribute(body, "lang", "data-pl-language") ??
    "en";
  const author = firstAttribute(html, "data-pl-author") ?? firstAttribute(body, "data-pl-author");
  const theme = firstAttribute(html, "data-pl-theme") ?? firstAttribute(body, "data-pl-theme");

  return {
    title,
    ...(format ? { format } : {}),
    language,
    ...(author ? { author } : {}),
    ...(theme ? { theme } : {}),
  };
}

function parseManifest(document: Document, errors: string[]): DeckManifest {
  const parsed = DeckManifestSchema.safeParse(manifestCandidate(document));
  if (parsed.success) return parsed.data;

  for (const issue of parsed.error.issues) {
    errors.push(`Manifest ${issue.path.join(".") || "value"}: ${issue.message}`);
  }

  const fallback = DeckManifestSchema.safeParse({ title: "Untitled deck", format: "16:9" });
  if (!fallback.success) {
    throw new Error("Internal error: default deck manifest is invalid.");
  }
  return fallback.data;
}

export function inspectDeckHtml(html: string, maxSlides?: number): DeckInspection {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { document } = parseHTML(html);
  const manifest = parseManifest(document, errors);
  const nodes = Array.from(document.querySelectorAll("[data-pl-slide], .pl-slide"));

  if (nodes.length === 0) {
    errors.push("No slides found. Add at least one [data-pl-slide] or .pl-slide element.");
  }
  if (maxSlides !== undefined && nodes.length > maxSlides) {
    errors.push(`Deck has ${nodes.length} slides; the configured limit is ${maxSlides}.`);
  }

  const seenIds = new Set<string>();
  const slides: SlideInspection[] = (
    maxSlides === undefined ? nodes : nodes.slice(0, maxSlides)
  ).map((node, index) => {
    const rawId = firstAttribute(node, "data-slide-id", "id");
    const id = safeIdentifier(rawId ?? `slide-${index + 1}`, `slide-${index + 1}`);
    if (!rawId) warnings.push(`Slide ${index + 1} has no data-slide-id; generated id '${id}'.`);
    if (seenIds.has(id)) errors.push(`Duplicate slide id '${id}'.`);
    seenIds.add(id);

    const title = cleanText(
      node.querySelector("[data-slide-title], h1, h2, h3")?.textContent ?? `Slide ${index + 1}`,
    );
    if (!title) warnings.push(`Slide ${index + 1} has no accessible title.`);

    const images = Array.from(node.querySelectorAll("img"));
    const hasAccessibleImages = images.every((image) => {
      const alt = image.getAttribute("alt");
      return alt !== null && alt.trim().length > 0;
    });
    if (!hasAccessibleImages) {
      warnings.push(`Slide ${index + 1} contains an image without non-empty alt text.`);
    }

    if (cleanText(node.textContent).length === 0 && images.length === 0) {
      warnings.push(`Slide ${index + 1} appears to be empty.`);
    }

    return { index: index + 1, id, title, hasAccessibleImages };
  });

  if (!document.body) errors.push("Document must contain a body element.");

  return { manifest, slides, errors, warnings };
}

export async function inspectDeckFile(
  filePath: string,
  maxSlides?: number,
): Promise<{ html: string; inspection: DeckInspection; sourceHash: string }> {
  const html = await readUtf8File(filePath);
  try {
    const inspection = inspectDeckHtml(html, maxSlides);
    return { html, inspection, sourceHash: sha256(html) };
  } catch (error) {
    throw new Error(`Could not inspect HTML deck: ${getErrorMessage(error)}`, { cause: error });
  }
}

export function toValidationResult(inspection: DeckInspection) {
  return {
    valid: inspection.errors.length === 0,
    title: inspection.manifest.title,
    format: inspection.manifest.format,
    slideCount: inspection.slides.length,
    errors: inspection.errors,
    warnings: inspection.warnings,
  };
}
