# Template gallery

PresentLab consumes a visual gallery from the private [`PresentTemplate`](https://github.com/quangminh1212/PresentTemplate) repository through the [`templates/`](../templates/) Git submodule. The gallery is deliberately HTML-first: the HTML file is the editable source, while the PDF and PPTX files are rendered handoff examples.

## Folder contract

Every indexed template directory under [`templates/`](../templates/) contains exactly:

| File        | Role                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| `deck.html` | At-least-forty-five-slide source deck that follows the PresentLab HTML contract |
| `deck.pdf`  | Print-oriented PDF rendered from the HTML source                                |
| `deck.pptx` | Fidelity-first PowerPoint export with one full-slide image per page             |

The current gallery has 770 templates and 34,650 sample slides: 8 core family systems, 92 nested palette variants, and 670 researched style presets. Each core family keeps its base deck at the family root and places palette variants in named child folders. Each researched style preset gets its own top-level folder, so it can be selected and opened without being confused with another style. The core structural directions are:

- Aurora: light editorial and spacious cards
- Midnight: dark cinematic contrast and luminous accents
- Swiss: strict grid, red signal color, and hard edges
- Brutalist: yellow canvas, ink borders, and offset shadows
- Organic: earthy palette, serif headlines, and soft geometry
- Data Noir: terminal-inspired product and operations language
- Luxury: ivory paper, hairline rules, and restrained gold
- Retro Future: synthwave gradients, grid lines, and neon accents

The generated variants use the family names above with palettes including Cobalt, Coral, Forest, Saffron, Plum, Ocean, Sand, Mono, Mint, Copper, Violet, and Ice. The client-facing palette catalog adds Cinematic, a deep-navy, teal, and ember system intended for film-led stories, premium launches, and keynote moments. Each template index entry exposes `family`, `palette`, and `modifier` metadata for programmatic selection by an AI agent.

The 670 style presets are organized into 67 researched movement and presentation groups: Bauhaus, Swiss/International Typographic, Constructivist, De Stijl, Art Deco, Art Nouveau/Jugendstil, Arts & Crafts, Mid-century Modern, Pop Art, Psychedelic, Memphis/Postmodern Play, Postmodern Deconstruction, Editorial/Publishing, Fashion/Couture, Japanese-inspired Minimal, Scandinavian/Nordic, Mediterranean/Riviera, Afrofuturist-inspired, Scientific/Field Note, Cyberpunk/Neon Systems, Material/Digital Surface, Cinematic/Film, Dada/Anti-Design, Futurism/Machine Age, Suprematist/Abstract Geometry, Art Brut/Naive, Gothic/Medieval, Baroque/Theatrical, Rococo/Playful Ornament, Classical/Neoclassical, Victorian/Industrial Heritage, Architectural Modernism, Industrial/Factory, Tropical Modernism, Wabi-sabi/Imperfection, Islamic Geometric/Moorish, Indian Craft/Block Print, Latin Modernism/Color Field, Solarpunk/Eco-futurism, Dark Academia, Light Academia, Vaporwave/Y2K, Webcore/Internet Nostalgia, Skeuomorphic/Object-based, Neo-Brutalist/Digital Utility, Corporate Memphis/Friendly Systems, Data Visualization/Analytical, Abstract Expressionism, Surrealism/Dream Logic, Cubism/Faceted Planes, Impressionism/Light Study, Maximalism/Layered Ornament, Minimalism/Essential Space, Synthwave/Night Drive, Glitchcore/Signal Error, Low-poly/Faceted Render, Biophilic/Living Systems, Biomorphic/Organic Form, Cartographic/Atlas Systems, Editorial Botanical/Herbarium, Documentary/Observational, Quiet Luxury/Tailored Editorial, Neo-folk/Handcrafted Future, Modern Collage/Cut and Paste, Techno-organic/Hybrid Network, Kinetic Type/Moving Letter, and Paper Cut/Layered Relief. These presets change composition profiles, layout geometry, typography, spacing, shape language, texture, and hierarchy in addition to color. The machine-readable catalog is [`templates/style-catalog.json`](../templates/style-catalog.json), mirrored for MCP consumers at [`resources/styles/index.json`](../resources/styles/index.json).

The palette catalog lives in [`resources/palettes/`](../resources/palettes/) and [`templates/palettes/`](../templates/palettes/). It contains one JSON record per palette plus `catalog.html`, `catalog.pdf`, and `catalog.pptx`. The catalog names seven practical roles for every palette: canvas, text, signal, depth, soft surface, visual A, and visual B.

## Rebuild and verify

From a checkout with the private submodule initialized:

```powershell
git submodule update --init --recursive
npm run gallery:build
node scripts/verify-gallery.mjs
node scripts/verify-similarity.mjs
```

The build renders temporary PNG, PDF, PPTX, and manifest artifacts under `.artifacts/template-gallery/`. Only the HTML, PDF, and PPTX handoff files are copied into each template folder in the `PresentTemplate` submodule. The temporary directory is ignored by Git.

The generator refreshes `templates/index.json` in the submodule, the MCP template index at `resources/templates/index.json`, the theme index under `resources/themes/`, and the palette index/artifacts under `resources/palettes/` and `templates/palettes/`.

When a gallery source changes, commit it in two repository steps: first commit and push the updated files from `C:\Dev\PresentTemplate`, then commit the updated `templates` gitlink and generated parent indexes in PresentLab. CI needs the `PRESENTTEMPLATE_TOKEN` secret with read access to the private template repository.

## Authoring rules

Keep each source deck deterministic and local. Declare `data-pl-format`, `data-pl-title`, and `data-pl-theme` on `<html>`. Give every slide a unique `data-slide-id`, one accessible heading, and a clear purpose. PresentLab accepts any positive slide count. The current gallery generator emits 45 distinct sample layout slides per template, but that sample size is not a renderer or portal limit. Each expanded layout also exposes a unique `data-template-layout` marker.

Run `npm run verify:all` before release. It includes the gallery contract check in addition to the unit, integration, MCP, formatting, type, lint, and audit gates.
