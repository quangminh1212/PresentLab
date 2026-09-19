# PresentLab

PresentLab is a production-oriented design resource kit and rendering bridge for AI agents. An agent writes a standards-based HTML deck once; PresentLab validates it and exports deterministic slide images, PDF, PPTX, and a catalog.

The repository also ships an MCP server, a Codex-compatible skill/plugin, reusable design resources, and CI checks so an AI host can discover the contract and run the same renderer locally.

## What is included

- HTML-first deck contract using `[data-pl-slide]` or `.pl-slide` elements.
- Chromium rendering for pixel-faithful PNG and print-quality PDF output.
- PPTX export that places each rendered slide as a full-bleed image, preserving HTML fidelity across PowerPoint viewers.
- Catalog generation as HTML and PDF.
- MCP tools, resources, and prompts for validation, rendering, catalogs, templates, and deck design guidance.
- A repo-local `presentlab-ai` plugin with a reusable design skill.
- Strict TypeScript, unit tests, integration smoke tests, formatting, linting, security boundaries, and GitHub Actions CI.

## Quick start

Requirements: Node.js 22 or newer and npm 10.9 or newer.

```powershell
npm ci
npx playwright install chromium
npm run verify:all
npm run build
node dist/cli.js render --input examples/aurora/deck.html --output .artifacts/aurora --format png,pdf,pptx
node dist/cli.js catalog --input examples/aurora/deck.html --output .artifacts/aurora-catalog --format html,pdf
```

The generated artifact directories are intentionally ignored by Git.

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

The server exposes `presentlab_validate_deck`, `presentlab_render_deck`, `presentlab_build_catalog`, `presentlab_list_templates`, a deck schema resource, a templates resource, and a `presentlab_design_deck` prompt. Logs go to stderr because stdout is reserved for JSON-RPC.

The repo-local plugin lives at `plugins/presentlab-ai`. Host-specific examples are available in `.vscode/mcp.json` and `.cursor/mcp.json`.

## Production notes

The default PPTX mode is fidelity-first: slide text remains selectable in the source HTML/PDF, while the PPTX contains a full-slide image. This is deliberate because arbitrary HTML/CSS cannot be losslessly translated into editable PowerPoint shapes. The artifact manifest records the renderer inputs and output files for reproducibility.

See [docs/architecture.md](docs/architecture.md), [docs/html-contract.md](docs/html-contract.md), [docs/mcp.md](docs/mcp.md), [docs/release.md](docs/release.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md) for release and threat-model guidance.
