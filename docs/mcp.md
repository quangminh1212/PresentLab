# MCP integration

PresentLab uses the v2 TypeScript MCP packages and serves local hosts over stdio. Build before starting the server so the host launches `dist/cli.js`.

```powershell
npm ci
npx playwright install chromium
npm run build
npm run mcp
```

## Tools

| Tool                        | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `presentlab_validate_deck`  | Static contract validation and accessibility warnings |
| `presentlab_render_deck`    | PNG, PDF, and fidelity-first PPTX output              |
| `presentlab_build_catalog`  | HTML and A4 landscape PDF contact sheet               |
| `presentlab_list_templates` | Discover local template metadata                      |

Tool paths are workspace-relative. The server uses `PRESENTLAB_ROOT` when set, otherwise its current working directory. The default network policy blocks HTTP(S) and WebSocket assets. Set `allowExternalAssets: true` only for trusted HTML.

## Resources and prompt

- `presentlab://schema/deck` returns the JSON Schema for normalized deck metadata.
- `presentlab://templates` returns the local design-template index.
- `presentlab_design_deck` provides a structured design brief prompt and tells the agent to validate before rendering.

## Host registration

The repository includes `.vscode/mcp.json`, `.cursor/mcp.json`, and the Codex plugin manifest. Hosts should launch from the repository root after `npm run build` so `dist/cli.js` and `resources/` resolve together.

Never write logs to stdout in an MCP server. PresentLab writes operational messages to stderr and reserves stdout for protocol frames.
