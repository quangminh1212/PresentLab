# PresentLab

PresentLab is a production-oriented design resource kit and rendering bridge for AI agents. An agent writes a standards-based HTML deck once; PresentLab validates it and exports deterministic slide images, PDF, PPTX, and a catalog.

The repository also ships an MCP server, a Codex-compatible skill/plugin, reusable design resources, and CI checks so an AI host can discover the contract and run the same renderer locally.

## What is included

- HTML-first deck contract using `[data-pl-slide]` or `.pl-slide` elements.
- Chromium rendering for pixel-faithful PNG and print-quality PDF output.
- PPTX export that places each rendered slide as a full-bleed image, preserving HTML fidelity across PowerPoint viewers.
- Catalog generation as HTML and PDF.
- A 770-template gallery with 34,650 sample slides. Every published folder contains `deck.html`; core examples may retain `deck.pptx`, while selected variants render handoff files on demand.
- A customer request portal at [`web/portal/`](web/portal/) for choosing templates and handing a brief to a production team.
- MCP tools, resources, and prompts for validation, rendering, catalogs, templates, and deck design guidance.
- A repo-local `presentlab-ai` plugin with a reusable design skill.
- Strict TypeScript, unit tests, integration smoke tests, formatting, linting, security boundaries, and GitHub Actions CI.

## Quick start

Requirements: Node.js 22 or newer and npm 10.9 or newer. The template gallery is stored in the private `PresentTemplate` repository and is consumed here as the `templates/` submodule. Use a GitHub identity/token with read access to that repository.

```powershell
git clone --recurse-submodules https://github.com/quangminh1212/PresentLab.git
cd PresentLab
npm ci
npx playwright install chromium
npm run verify:all
npm run gallery:build
npm run build
node dist/cli.js render --input examples/aurora/deck.html --output .artifacts/aurora --format png,pdf,pptx
node dist/cli.js catalog --input examples/aurora/deck.html --output .artifacts/aurora-catalog --format html,pdf
```

The generated artifact directories are intentionally ignored by Git.

If the repository was cloned without submodules, initialize the private gallery before running the checks:

```powershell
git submodule update --init --recursive
```

## Template gallery

The gallery is mounted at [`templates/`](templates/) from the private [`PresentTemplate`](https://github.com/quangminh1212/PresentTemplate) repository. It contains 770 templates: eight structural families, 92 palette/layout variants, and 670 researched style presets across 67 groups. Every template has a deterministic composition profile so the gallery varies structure, rhythm, typography, and surface treatment in addition to color. A separate background engine assigns 44 structural background modes with independent geometry, repetition, position, blend, and texture parameters; `npm run gallery:backgrounds` audits all pairs and currently keeps the maximum structural similarity at 9.09%, below the 10% threshold.

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

Variant folders combine these structural families with curated palettes such as Cobalt, Coral, Forest, Saffron, Plum, Ocean, Sand, Mono, Mint, Copper, Violet, and Ice. The standalone Cinematic palette uses deep navy, teal signal light, and ember orange for film-led storytelling, premium launches, and keynote moments. The generated index records each template's `family`, `palette`, and `modifier` so an AI agent can select by visual intent.

The color selection catalog is available at [`resources/palettes/`](resources/palettes/) and in the private submodule at [`templates/palettes/`](templates/palettes/). It includes machine-readable palette tokens plus `catalog.html` and `catalog.pptx` for client review. MCP clients can call `presentlab_list_palettes` or read `presentlab://palettes/catalog`.

The client-facing template selection and brief handoff flow is documented in [docs/request-portal.md](docs/request-portal.md). It can post to a configured request endpoint, open a configured handoff email, or preserve a local JSON brief when no delivery target is configured.

The portal is deployable as a Vercel static site with a same-origin `/api/slide-requests` function. See [docs/vercel.md](docs/vercel.md) for the required webhook environment variables and deployment steps.

The repository follows a small, predictable layout: `src/` is the rendering engine, `web/` is the customer UI, `resources/` is reusable data, `scripts/` contains build and verification commands, and `tests/` is split into `unit/` and `integration/`. See [docs/project-structure.md](docs/project-structure.md).

Each folder is an HTML-first source unit. Edit `deck.html`, then render PDF/PPTX on demand for the selected template. The generator is deterministic and the gallery checker validates every source's actual positive slide count plus the source-only/core handoff contract across all 770 folders; the current generated sample uses 45 slides per template. The similarity checker rejects pairs at or above 50% shared signature features. Template changes are committed and pushed in `PresentTemplate`; the resulting submodule pointer is then committed in this repository. See [docs/template-gallery.md](docs/template-gallery.md) for the authoring rules.

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
presentlab validate --input <deck.html> [--max-slides <n>] [--allow-external-assets]
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

See [docs/architecture.md](docs/architecture.md), [docs/html-contract.md](docs/html-contract.md), [docs/template-gallery.md](docs/template-gallery.md), [docs/mcp.md](docs/mcp.md), [docs/vercel.md](docs/vercel.md), [docs/release.md](docs/release.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CHANGELOG.md](CHANGELOG.md) for release and threat-model guidance.
