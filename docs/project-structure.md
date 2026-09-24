# Project structure and naming

PresentLab uses a small, repository-first layout so a new contributor can find the
runtime code, customer interface, data, checks, and operating documentation without
guessing. The product name remains `PresentLab`; technical identifiers use lowercase
names and stable public contracts.

## Directory map

| Path                  | Responsibility                                                                | Naming rule                                           |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| `src/`                | TypeScript renderer, CLI, and MCP adapter                                     | `camelCase` functions, PascalCase types/classes       |
| `src/core/`           | Pure deck inspection, rendering orchestration, filesystem and format adapters | one focused module per capability                     |
| `src/mcp/`            | MCP protocol boundary                                                         | keep MCP tool/resource identifiers stable             |
| `api/`                | Vercel serverless request boundary                                            | validate and relay; never persist to local disk       |
| `web/portal/`         | Static customer-facing template selection and request handoff UI              | `index.html`, `app.js`, `styles.css`                  |
| `resources/`          | Reusable themes, palettes, indexes, and shared CSS                            | data grouped by domain, lowercase filenames           |
| `templates/`          | Private `PresentTemplate` Git submodule                                       | Categorized HTML sources; handoff artifacts on demand |
| `scripts/`            | Build and verification entrypoints                                            | lowercase kebab-case `.mjs` names                     |
| `tests/unit/`         | Fast isolated tests                                                           | `<capability>.test.ts`                                |
| `tests/integration/`  | Browser, artifact, and MCP tests                                              | `<capability>.test.ts`                                |
| `docs/`               | Contracts, architecture, operations, and release guidance                     | lowercase kebab-case Markdown                         |
| `schemas/`            | Versioned machine-readable contracts                                          | descriptive lowercase filenames                       |
| `plugins/`            | Host integrations and reusable agent skills                                   | keep plugin IDs stable once published                 |
| `web/lusion/`         | Static showcase microsite and its local media                                 | Keep custom scripts outside generated bundles         |
| `web/lusion/scripts/` | First-party localization and local-site overrides                             | Lowercase kebab-case `.js` names                      |
| `web/lusion/_astro/`  | Generated, versioned frontend bundles                                         | Treat as build output                                 |
| `web/vendor/`         | Vendored browser libraries                                                    | Preserve upstream licenses and versions               |
| `dist/`, `public/`    | Generated package and Vercel deployment output                                | Rebuild; do not edit by hand                          |
| `.artifacts/`         | Generated deck and catalog deliverables                                       | Keep generated output out of source directories       |

## Ownership boundaries

The dependency direction is intentionally one-way:

```text
web / CLI / MCP adapters
          |
          v
      src/core
          |
          v
  local files + Chromium + PPTX
```

`web/portal` may read published indexes and call a configured request endpoint, but
it does not own rendering logic. The CLI and MCP server call the same `src/core`
functions. `web/lusion/_astro/` is generated frontend output; PresentLab-specific
fallbacks and localization live in `web/lusion/scripts/`. Generated gallery
artifacts belong to the `templates` submodule or `.artifacts/`; they are never
treated as application source.

## Compatibility rules

- Keep `presentlab_*` MCP tool names, `presentlab://` resource URIs, `data-pl-*`
  HTML attributes, and the `presentlab` CLI command stable for existing clients.
- Add a new public identifier before removing an old one, and document a deprecation
  period in `CHANGELOG.md`.
- Do not encode counts such as a default number of slides in directory names, schemas,
  or UI copy. The deck contract accepts any positive slide count.
- Run `npm run verify:all` after a structural move. It covers formatting, lint,
  TypeScript, unit/integration tests, gallery contracts, similarity, and dependency
  audit.
