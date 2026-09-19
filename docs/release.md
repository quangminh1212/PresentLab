# Release checklist

Run from a clean checkout with Chromium available:

```powershell
npm ci
npx playwright install chromium
npm run verify:all
python C:\Users\GHC\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\presentlab-ai
python C:\Users\GHC\.codex\skills\.system\skill-creator\scripts\quick_validate.py plugins\presentlab-ai\skills\presentlab-design
npm pack --dry-run
```

The release gates cover formatting, ESLint, TypeScript declarations, unit tests, browser artifact tests, MCP stdio handshake/tool/resource/prompt tests, and high-severity dependency audit. The integration suite also checks PDF page/text output, PPTX ZIP structure, and catalog artifacts.

Before publishing a new version:

- Update `package.json`, plugin manifest, and `CHANGELOG.md` together.
- Inspect PNGs and at least one rendered page from each PDF output.
- Confirm `render-manifest.json` contains the expected source hash and artifact list.
- Confirm `npm pack --dry-run` includes `dist/`, `resources/`, `schemas/`, and `plugins/` without generated artifacts.
- Confirm `git diff --check`, `git status`, and the intended remote/branch before pushing.
