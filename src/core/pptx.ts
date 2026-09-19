import { basename } from "node:path";

import PptxGenJS from "pptxgenjs";

import { PresentLabError } from "./errors.js";
import { pageDimensions } from "./schema.js";
import type { DeckManifest } from "./schema.js";

interface PptxSlide {
  background: { color: string };
  addImage(options: {
    path: string;
    x: number;
    y: number;
    w: number;
    h: number;
    altText: string;
  }): void;
}

interface PptxPresentation {
  layout: string;
  author: string;
  company: string;
  subject: string;
  title: string;
  lang: string;
  theme: { headFontFace: string; bodyFontFace: string; lang: string };
  defineLayout(layout: { name: string; width: number; height: number }): void;
  addSlide(): PptxSlide;
  writeFile(options: { fileName: string }): Promise<string>;
}

export interface PptxInput {
  readonly outputPath: string;
  readonly manifest: DeckManifest;
  readonly slideFiles: readonly string[];
}

export async function writePptx(input: PptxInput): Promise<void> {
  if (input.slideFiles.length === 0) {
    throw new PresentLabError(
      "PPTX_NO_SLIDES",
      "Cannot create a PPTX without rendered slide images.",
    );
  }

  const dimensions = pageDimensions(input.manifest.format);
  // PptxGenJS 4 publishes an `export default` runtime but its NodeNext declaration
  // exposes the default as a namespace. Keep the adapter narrow and type-safe here.
  const PptxConstructor = PptxGenJS as unknown as new () => PptxPresentation;
  const presentation = new PptxConstructor();
  const layoutName = "PRESENTLAB_CUSTOM";
  presentation.defineLayout({
    name: layoutName,
    width: dimensions.widthIn,
    height: dimensions.heightIn,
  });
  presentation.layout = layoutName;
  presentation.author = input.manifest.author ?? "PresentLab";
  presentation.company = "PresentLab";
  presentation.subject = "HTML-first rendered presentation";
  presentation.title = input.manifest.title;
  presentation.lang = input.manifest.language;
  presentation.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: input.manifest.language,
  };

  for (const file of input.slideFiles) {
    const slide = presentation.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({
      path: file,
      x: 0,
      y: 0,
      w: dimensions.widthIn,
      h: dimensions.heightIn,
      altText: basename(file),
    });
  }

  await presentation.writeFile({ fileName: input.outputPath });
}
