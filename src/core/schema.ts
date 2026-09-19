import { z } from "zod";

export const PageFormatSchema = z.enum(["16:9", "4:3", "A4-landscape", "A4-portrait"]);
export type PageFormat = z.infer<typeof PageFormatSchema>;

export const OutputFormatSchema = z.enum(["png", "pdf", "pptx"]);
export type OutputFormat = z.infer<typeof OutputFormatSchema>;

export const CatalogFormatSchema = z.enum(["html", "pdf"]);
export type CatalogFormat = z.infer<typeof CatalogFormatSchema>;

export const DeckManifestSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    format: PageFormatSchema.default("16:9"),
    language: z.string().trim().min(2).max(16).default("en"),
    author: z.string().trim().min(1).max(200).optional(),
    theme: z.string().trim().min(1).max(100).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  })
  .strict();

export type DeckManifest = z.infer<typeof DeckManifestSchema>;

export interface PageDimensions {
  readonly widthIn: number;
  readonly heightIn: number;
  readonly widthPx: number;
  readonly heightPx: number;
}

export const PAGE_DIMENSIONS: Readonly<Record<PageFormat, PageDimensions>> = {
  "16:9": { widthIn: 13.333333, heightIn: 7.5, widthPx: 1600, heightPx: 900 },
  "4:3": { widthIn: 10, heightIn: 7.5, widthPx: 1600, heightPx: 1200 },
  "A4-landscape": { widthIn: 11.692913, heightIn: 8.267717, widthPx: 1600, heightPx: 1131 },
  "A4-portrait": { widthIn: 8.267717, heightIn: 11.692913, widthPx: 1131, heightPx: 1600 },
};

export interface SlideInspection {
  readonly index: number;
  readonly id: string;
  readonly title: string;
  readonly hasAccessibleImages: boolean;
}

export interface DeckInspection {
  readonly manifest: DeckManifest;
  readonly slides: readonly SlideInspection[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly title: string;
  readonly format: PageFormat;
  readonly slideCount: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export function pageDimensions(format: PageFormat): PageDimensions {
  return PAGE_DIMENSIONS[format];
}
