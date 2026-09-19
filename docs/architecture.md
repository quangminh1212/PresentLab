# PresentLab architecture

PresentLab has one source of truth: an HTML document whose slide boundaries are explicit DOM elements. The renderer keeps the boundary stable while adapting the same source to different delivery formats.

```text
HTML + local resources
        |
        v
  static contract inspection ----> MCP resource/prompt discovery
        |
        v
   Chromium render session
      /       |        \
     v        v         v
  PNG       PDF       PPTX
     \        |        /
      \       v       /
       catalog + manifest
```

## Layers

- `src/core/schema.ts` defines page formats and public output types.
- `src/core/inspect.ts` parses metadata and slide boundaries without executing source JavaScript.
- `src/core/browser.ts` owns the fixed Chromium viewport, print CSS, and asset/network policy.
- `src/core/render.ts` creates slide images, PDF, PPTX, and a reproducibility manifest.
- `src/core/catalog.ts` creates a browsable HTML contact sheet and A4 landscape PDF.
- `src/mcp/server.ts` exposes the same core operations through MCP tools, resources, and prompts.
- `resources/` contains reusable design tokens, themes, and MCP indexes; the 100-template gallery is consumed from the private `PresentTemplate` Git submodule at `templates/`.
- `plugins/presentlab-ai/` packages the MCP registration and agent workflow as a Codex plugin/skill.

## Deliberate format trade-off

PDF is rendered directly from HTML with Chromium print CSS. PPTX uses one full-slide PNG per PowerPoint slide. This is the only reliable fidelity-first conversion for arbitrary HTML/CSS; it avoids pretending that every CSS effect can become editable PowerPoint shapes. The source HTML and PDF remain the editable/semantic representation.

## Trust boundary

The CLI and MCP layer resolve caller paths inside a workspace root. Chromium blocks HTTP(S), WebSocket, and local file assets outside that root by default. External assets are an explicit opt-in for trusted source files and are recorded by the caller's invocation, not silently enabled.
