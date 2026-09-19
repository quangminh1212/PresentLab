# Contributing

## Development

```powershell
npm ci
npx playwright install chromium
npm run verify:all
```

Use `npm run build` before running the MCP server. Keep public API changes documented in `CHANGELOG.md` and add a regression test for behavior changes.

## Rendering contract

Keep examples deterministic and local. Use `[data-pl-slide]` or `.pl-slide`, unique `data-slide-id` values, and the shared stylesheet. Do not add external network assets to examples.

## Pull requests

Describe the user-visible behavior, test commands, generated artifact formats, and any compatibility or security trade-off. Commits should be small enough to review independently.
