# Release checklist

Run from a clean checkout with Chromium available. Clone the private template submodule recursively:

```powershell
git clone --recurse-submodules https://github.com/quangminh1212/PresentLab.git
cd PresentLab
npm ci
npx playwright install chromium
npm run verify:all
npm run gallery:build
node scripts/verify-gallery.mjs
python C:\Users\GHC\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py plugins\presentlab-ai
python C:\Users\GHC\.codex\skills\.system\skill-creator\scripts\quick_validate.py plugins\presentlab-ai\skills\presentlab-design
npm pack --dry-run
```

The release gates cover formatting, ESLint, TypeScript declarations, unit tests, browser artifact tests, MCP stdio handshake/tool/resource/prompt tests, template-gallery contracts, and high-severity dependency audit. The integration suite also checks PDF page/text output, PPTX ZIP structure, and catalog artifacts.

Before publishing a new version:

- Update `package.json`, plugin manifest, and `CHANGELOG.md` together.
- Inspect PNGs and at least one rendered page from each PDF output.
- Confirm `render-manifest.json` contains the expected source hash and artifact list.
- Confirm `npm pack --dry-run` includes `dist/`, `web/`, `resources/`, `schemas/`, `templates/`, and `plugins/` without generated artifacts.
- Confirm Vercel has `REQUEST_WEBHOOK_URL` configured and `REQUEST_WEBHOOK_TOKEN` set when the receiving workflow requires authentication.
- Confirm CI has `PRESENTTEMPLATE_TOKEN` configured with read access to `quangminh1212/PresentTemplate` before relying on the private submodule checkout.
- Confirm `git diff --check`, `git status`, and the intended remote/branch before pushing.
