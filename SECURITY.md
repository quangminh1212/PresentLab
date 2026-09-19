# Security policy

## Scope

PresentLab renders HTML supplied by a caller. The CLI and MCP server treat the configured workspace as a trust boundary.

## Defaults

- Input and output paths must remain inside the configured workspace root.
- Network assets are blocked by default during Chromium rendering.
- Local file assets outside the workspace root are blocked during Chromium rendering.
- MCP uses stdio by default; stdout is reserved for JSON-RPC and logs go to stderr.
- Generated artifacts are written to an explicit output directory and are not deleted automatically.

## Trusted rendering

Use `--allow-external-assets` only for trusted HTML. External assets can reveal source content or metadata to third parties and can make builds non-reproducible.

## Reporting

Please report security issues privately to the repository owner before opening a public issue. Include a minimal reproduction, affected version, and impact. Do not include secrets or private source material.
