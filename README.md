# PresentLab

PresentLab is a production-oriented design resource kit and rendering bridge for AI agents. An agent writes a standards-based HTML deck once; PresentLab validates it and exports deterministic slide images, PDF, PPTX, and a catalog.

The repository also ships an MCP server, a Codex-compatible skill/plugin, reusable design resources, and CI checks so an AI host can discover the contract and run the same renderer locally.

## What is included

- HTML-first deck contract using `[data-pl-slide]` or `.pl-slide` elements.
- Chromium rendering for pixel-faithful PNG and print-quality PDF output.
- PPTX export that places each rendered slide as a full-bleed image, preserving HTML fidelity across PowerPoint viewers.
- Catalog generation as HTML and PDF.
- A 100-template gallery with 700 sample slides. Each folder contains `deck.html`, `deck.pdf`, and `deck.pptx`.
- MCP tools, resources, and prompts for validation, rendering, catalogs, templates, and deck design guidance.
- A repo-local `presentlab-ai` plugin with a reusable design skill.
- Strict TypeScript, unit tests, integration smoke tests, formatting, linting, security boundaries, and GitHub Actions CI.

## Quick start

Requirements: Node.js 22 or newer and npm 10.9 or newer.

```powershell
npm ci
npx playwright install chromium
npm run verify:all
npm run gallery:build
npm run build
node dist/cli.js render --input examples/aurora/deck.html --output .artifacts/aurora --format png,pdf,pptx
node dist/cli.js catalog --input examples/aurora/deck.html --output .artifacts/aurora-catalog --format html,pdf
```

The generated artifact directories are intentionally ignored by Git.

## Template gallery

The checked-in gallery lives under [`templates/`](templates/). It contains eight structural families and 92 palette/layout variants:

| Folder        | Style                |
| ------------- | -------------------- |
| `aurora`      | Light editorial      |
| `midnight`    | Dark cinematic       |
| `swiss`       | Swiss grid           |
| `brutalist`   | Neo-brutalist        |
| `organic`     | Organic studio       |
| `datanoir`    | Terminal / data noir |
| `luxury`      | Quiet luxury         |
| `retrofuture` | Neon retro-future    |

Variant folders combine these structural families with curated palettes such as Cobalt, Coral, Forest, Saffron, Plum, Ocean, Sand, Mono, Mint, Copper, Violet, and Ice. The generated index records each template's `family`, `palette`, and `modifier` so an AI agent can select by visual intent.

Each folder is a portable handoff unit. Edit `deck.html`, then regenerate its PDF/PPTX outputs with `npm run gallery:build`. The generator is deterministic and the gallery checker enforces seven slides plus the exact three-file folder contract across all 100 folders. See [docs/template-gallery.md](docs/template-gallery.md) for the authoring rules.

## HTML contract

The document may declare metadata on `<html>` or `<body>`:

```html
<html data-pl-format="16:9" data-pl-title="Quarterly story" lang="en">
  <body>
    <section class="pl-slide" data-slide-id="cover">
      <h1>Quarterly story</h1>
    </section>
  </body>
</html>
```

PresentLab treats each `[data-pl-slide]` or `.pl-slide` element as one page. The shared resource stylesheet in `resources/styles/presentlab.css` contains the baseline layout, typography, print breaks, and accessibility defaults.

## CLI

```text
presentlab validate --input <deck.html> [--max-slides 100] [--allow-external-assets]
presentlab render --input <deck.html> --output <directory> --format png,pdf,pptx [--allow-external-assets]
presentlab catalog --input <deck.html> --output <directory> --format html,pdf [--allow-external-assets]
presentlab templates
presentlab mcp
```

External network assets are blocked by default. Enable them only for trusted source HTML with `--allow-external-assets` or the equivalent MCP argument.

## MCP

Build first, then run the stdio server from the repository root:

```powershell
npm run build
npm run mcp
```

The server exposes validation, rendering, catalog, template/theme discovery and read tools, static and dynamic design resources, and a `presentlab_design_deck` prompt. Logs go to stderr because stdout is reserved for JSON-RPC.

The repo-local plugin lives at `plugins/presentlab-ai`. Host-specific examples are available in `.vscode/mcp.json` and `.cursor/mcp.json`.

## Production notes

The default PPTX mode is fidelity-first: slide text remains selectable in the source HTML/PDF, while the PPTX contains a full-slide image. This is deliberate because arbitrary HTML/CSS cannot be losslessly translated into editable PowerPoint shapes. The artifact manifest records the renderer inputs and output files for reproducibility.

See [docs/architecture.md](docs/architecture.md), [docs/html-contract.md](docs/html-contract.md), [docs/template-gallery.md](docs/template-gallery.md), [docs/mcp.md](docs/mcp.md), [docs/release.md](docs/release.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md) for release and threat-model guidance.
