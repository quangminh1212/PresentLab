# Template gallery

PresentLab ships a checked-in visual gallery for AI agents and human authors. The gallery is deliberately HTML-first: the HTML file is the editable source, while the PDF and PPTX files are rendered handoff examples.

## Folder contract

Every folder under [`templates/`](../templates/) contains exactly:

| File        | Role                                                                |
| ----------- | ------------------------------------------------------------------- |
| `deck.html` | Seven-slide source deck that follows the PresentLab HTML contract   |
| `deck.pdf`  | Print-oriented PDF rendered from the HTML source                    |
| `deck.pptx` | Fidelity-first PowerPoint export with one full-slide image per page |

The current gallery has 100 template folders and 700 sample slides. Eight structural directions are combined with curated palette and layout variants:

- Aurora: light editorial and spacious cards
- Midnight: dark cinematic contrast and luminous accents
- Swiss: strict grid, red signal color, and hard edges
- Brutalist: yellow canvas, ink borders, and offset shadows
- Organic: earthy palette, serif headlines, and soft geometry
- Data Noir: terminal-inspired product and operations language
- Luxury: ivory paper, hairline rules, and restrained gold
- Retro Future: synthwave gradients, grid lines, and neon accents

The generated variants use the family names above with palettes including Cobalt, Coral, Forest, Saffron, Plum, Ocean, Sand, Mono, Mint, Copper, Violet, and Ice. Each index entry also exposes `family`, `palette`, and `modifier` metadata for programmatic selection by an AI agent.

## Rebuild and verify

From the repository root:

```powershell
npm run gallery:build
node scripts/verify-template-gallery.mjs
```

The build renders temporary PNG, PDF, PPTX, and manifest artifacts under `.artifacts/template-gallery/`. Only the HTML, PDF, and PPTX handoff files are copied into each template folder. The temporary directory is ignored by Git.

The generator also refreshes `templates/index.json`, the MCP template index at `resources/templates/index.json`, and the theme index under `resources/themes/`.

## Authoring rules

Keep each source deck deterministic and local. Declare `data-pl-format`, `data-pl-title`, and `data-pl-theme` on `<html>`. Give every slide a unique `data-slide-id`, one accessible heading, and a clear purpose. Keep the source to seven slides unless the gallery contract and tests are updated together.

Run `npm run verify:all` before release. It includes the gallery contract check in addition to the unit, integration, MCP, formatting, type, lint, and audit gates.
