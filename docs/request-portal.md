# Client request portal

PresentLab includes a static customer-facing portal at
[`web/portal/index.html`](../web/portal/index.html). It turns the
template library into a brief handoff flow:

1. Filter the 770-template gallery by family, visual movement, or palette.
2. Select up to three directions and open a deck preview.
3. Fill in the project brief, contact details, deadline, and input files.
4. Send the request to a configured endpoint or hand it off through email.

The page loads the tracked `resources/templates/index.json` and
`resources/palettes/index.json` at runtime. This keeps the catalogue available on Vercel even
when the private `templates/` submodule cannot be fetched. If the matching deck HTML is available,
the preview opens the full deck; otherwise it shows the built-in static preview so selection still
works.

## Configure delivery

Set one of these attributes on the `<html>` element in `web/portal/index.html`:

```html
<html
  lang="vi"
  data-request-endpoint="/api/slide-requests"
  data-handoff-email="studio@example.com"
></html>
```

An endpoint takes precedence over email. The Vercel deployment uses `/api/slide-requests`
by default and receives a JSON `POST` with this shape:

```json
{
  "id": "PL-20260920-AB12",
  "createdAt": "2026-09-20T09:00:00.000Z",
  "status": "new",
  "source": "presentlab-client-request-portal",
  "customer": { "name": "...", "email": "...", "phone": "..." },
  "project": {
    "name": "...",
    "slideCount": 137,
    "deadline": "2026-09-30",
    "service": "customize",
    "notes": "..."
  },
  "templates": [
    {
      "name": "aurora",
      "title": "Aurora",
      "path": "aurora/aurora.html",
      "family": "aurora",
      "palette": "base",
      "category": "Core systems",
      "modifier": "base"
    }
  ],
  "attachments": [{ "name": "brief.pdf", "size": 12000, "type": "application/pdf" }]
}
```

When an endpoint is configured, a request without files is sent as `application/json`. If the
customer attaches files, the browser sends `multipart/form-data` with the JSON payload in a
`request` part and each file in an `attachments` part. The Vercel function relays both forms to
`REQUEST_WEBHOOK_URL` and optionally sends `REQUEST_WEBHOOK_TOKEN` as a bearer token. The UI
limits a Vercel request to ten files and 4 MB total (3 MB per file), leaving room below Vercel's
function payload limit. For larger files, use direct client-side object storage such as Vercel
Blob or another upload service instead of sending the file through the function.

The webhook, CRM, or workflow service must enforce its own authentication, rate limit, malware
scanning, file-size, and retention policies. The Vercel function does not persist submissions in
its filesystem.

The `slideCount` field is a positive integer supplied directly by the customer; there is no product
maximum in the portal. The email fallback cannot attach local files; the customer must attach them manually after the mail
composer opens. Without either delivery attribute, the portal stores the JSON brief locally for up
to 30 days and downloads a copy so a customer can forward it manually instead of losing the request.

The page includes a browser CSP for same-origin assets and API calls. If the request endpoint is
hosted on another origin, update both the CSP `connect-src` policy and the server's CORS policy.
