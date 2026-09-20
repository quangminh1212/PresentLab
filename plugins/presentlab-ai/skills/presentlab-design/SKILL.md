---
name: presentlab-design
description: Create, validate, and export HTML-first slide decks, catalogs, and PDF artifacts with PresentLab resources and MCP tools.
metadata:
  short-description: Design PresentLab HTML decks
---

# PresentLab design skill

Use this skill when an agent needs to turn a brief into a reusable HTML design source and then deliver slides, a catalog, PDF, or fidelity-first PPTX.

## Contract

- Start from a local template or theme exposed by `presentlab_list_templates`, `presentlab_list_themes`, or the `presentlab://templates` / `presentlab://themes` resources. Read the actual template with `presentlab_get_template` or its dynamic resource before writing.
- The built-in gallery offers 770 template folders under `templates/`, combining eight structural families with curated palette/layout variants; each template has an editable HTML source plus checked-in PDF and PPTX examples. The current generated gallery sample uses 45 slides per template, but the renderer accepts any positive slide count.
- Put `data-pl-format` and `data-pl-title` on `<html>` or `<body>`; supported formats are `16:9`, `4:3`, `A4-landscape`, and `A4-portrait`.
- Make every page one `[data-pl-slide]` or `.pl-slide` element with a unique, lowercase `data-slide-id`.
- Give every slide a meaningful heading and every `<img>` a non-empty `alt` attribute.
- Keep the source deterministic. Prefer local assets and block external network assets unless the user explicitly requests trusted remote assets.

## Workflow

1. Inspect the available template/theme resources and choose a visual system that fits the brief.
2. Write the HTML deck and keep the narrative to one dominant claim per slide.
3. Call `presentlab_validate_deck` and fix every error; warnings should be reviewed before delivery.
4. Call `presentlab_render_deck` with only the requested formats. Use `png` for visual QA, `pdf` for print/share, and `pptx` when a PowerPoint container is required.
5. Call `presentlab_build_catalog` when the user needs a contact sheet or browsable asset index.
6. Report the output paths and the validation/render result. Do not claim visual success without opening or inspecting the generated PNG/PDF artifacts.

## Output semantics

PDF is rendered by Chromium with print CSS and keeps HTML text/vector semantics where Chromium supports them. PPTX is deliberately a full-slide image deck: this preserves arbitrary HTML/CSS fidelity, but the slide text is not editable PowerPoint text. Mention that trade-off when it matters.

## Safety and reproducibility

Use workspace-relative input/output paths. Do not write outside the configured workspace. Do not delete an existing artifact directory without explicit user instruction. Keep external assets disabled by default and avoid secrets in HTML, logs, or generated artifacts.
