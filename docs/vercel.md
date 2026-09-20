# Vercel deployment

PresentLab is a static Vercel deployment with one Node.js Function for request
handoff. The checked-in [`vercel.json`](../vercel.json) maps `/` and `/portal` to
the generated `public/index.html` entry and keeps `/api/slide-requests` same-origin.

## Deploy

1. Import the repository into Vercel with the repository root as the project root.
2. Keep the framework as **Other**. The checked-in build command is
   `npm run vercel:build`, and the output directory is `public`. Do not override it
   with `public` in Project Settings unless it matches the repository configuration.
3. Add `REQUEST_WEBHOOK_URL` in the Vercel Project Environment Variables. This can
   point to an n8n, Make, CRM, queue, or private intake service.
4. Add `REQUEST_WEBHOOK_TOKEN` when that service expects a bearer token.
5. Deploy and check `/`, `/portal`, `/resources/templates/index.json`, and
   `/api/slide-requests` with an `OPTIONS` request.

The Vercel build copies only the portal and tracked catalogue assets into `public/`.
It does not require the private `templates/` submodule, so the Vercel warning about
an unavailable submodule is non-blocking for the customer portal. Vercel uses the
built-in static preview; a local server with the submodule initialized can still
open the full deck HTML.

The function returns `202` only after the configured webhook accepts the request. If
the webhook variable is missing, it returns `503` instead of pretending that a brief
was delivered. It accepts JSON without files and multipart form data with the JSON
brief in the `request` field and files in `attachments` fields.

Vercel Functions have a request payload limit of 4.5 MB. The portal intentionally caps
Vercel submissions at 4 MB total and 3 MB per file. Larger assets should be uploaded
directly to object storage (for example Vercel Blob) and only their metadata or URLs
sent through this function. Do not commit real webhook URLs or tokens; use
[`.env.example`](../.env.example) as the local variable template.

For a local Vercel-shaped run:

```powershell
npx vercel dev
```

Set the two environment variables in `.env.local` or through the Vercel dashboard
before testing a real handoff. The function does not write to the local filesystem,
because Vercel Function instances are ephemeral.
