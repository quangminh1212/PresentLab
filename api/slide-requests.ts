const MAX_BODY_BYTES = 4 * 1024 * 1024;
const MAX_TEMPLATE_COUNT = 3;
const MAX_TEXT_LENGTH = 2000;

type JsonObject = Record<string, unknown>;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, label: string, maxLength = MAX_TEXT_LENGTH): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${label} is required.`);
  }
  const result = value.trim();
  if (result.length > maxLength) {
    throw new HttpError(400, `${label} is too long.`);
  }
  return result;
}

function validatePayload(payload: JsonObject): void {
  readString(payload.id, "Request id", 64);

  const customer = payload.customer;
  if (!isRecord(customer)) throw new HttpError(400, "Customer details are required.");
  readString(customer.name, "Customer name", 120);
  const email = readString(customer.email, "Customer email", 254);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new HttpError(400, "Customer email is invalid.");
  }

  const project = payload.project;
  if (!isRecord(project)) throw new HttpError(400, "Project details are required.");
  readString(project.name, "Project name", 200);
  const slideCount = project.slideCount;
  if (typeof slideCount !== "number" || !Number.isSafeInteger(slideCount) || slideCount < 1) {
    throw new HttpError(400, "Slide count must be a positive integer.");
  }

  if (!Array.isArray(payload.templates) || payload.templates.length < 1) {
    throw new HttpError(400, "At least one template is required.");
  }
  if (payload.templates.length > MAX_TEMPLATE_COUNT) {
    throw new HttpError(400, `A request can contain at most ${MAX_TEMPLATE_COUNT} templates.`);
  }
  for (const template of payload.templates) {
    if (!isRecord(template)) throw new HttpError(400, "Template selection is invalid.");
    readString(template.name, "Template name", 160);
    readString(template.path, "Template path", 300);
  }
}

function responseHeaders(request: Request): Headers {
  const headers = new Headers({
    "Cache-Control": "no-store",
    Vary: "Origin",
  });
  const origin = request.headers.get("origin");
  if (origin && origin === new URL(request.url).origin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return headers;
}

function jsonResponse(request: Request, status: number, body: JsonObject): Response {
  return Response.json(body, { status, headers: responseHeaders(request) });
}

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new HttpError(403, "Cross-origin requests are not allowed.");
  }
}

async function parseSubmission(request: Request): Promise<{
  payload: JsonObject;
  attachments: File[];
}> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new HttpError(413, "Request payload is larger than 4 MB.");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.startsWith("application/json")) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, "Request JSON is invalid.");
    }
    if (!isRecord(body)) throw new HttpError(400, "Request body must be an object.");
    return { payload: body, attachments: [] };
  }

  if (contentType.startsWith("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new HttpError(400, "Multipart request is invalid.");
    }
    const rawRequest = form.get("request");
    if (typeof rawRequest !== "string") {
      throw new HttpError(400, "Multipart request is missing its request field.");
    }
    let body: unknown;
    try {
      body = JSON.parse(rawRequest);
    } catch {
      throw new HttpError(400, "Request JSON is invalid.");
    }
    if (!isRecord(body)) throw new HttpError(400, "Request body must be an object.");
    const attachments = form
      .getAll("attachments")
      .filter((value): value is File => typeof File !== "undefined" && value instanceof File);
    const attachmentBytes = attachments.reduce((total, file) => total + file.size, 0);
    if (attachmentBytes > MAX_BODY_BYTES) {
      throw new HttpError(413, "Attachments are larger than 4 MB.");
    }
    return { payload: body, attachments };
  }

  throw new HttpError(415, "Use application/json or multipart/form-data.");
}

async function relaySubmission(payload: JsonObject, attachments: File[]): Promise<void> {
  const webhookUrl = process.env.REQUEST_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    throw new HttpError(503, "Request delivery is not configured yet.");
  }

  const headers = new Headers();
  const token = process.env.REQUEST_WEBHOOK_TOKEN?.trim();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: BodyInit = JSON.stringify(payload);
  if (attachments.length > 0) {
    const form = new FormData();
    form.append("request", JSON.stringify(payload));
    attachments.forEach((file) => form.append("attachments", file, file.name));
    body = form;
  } else {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new HttpError(502, "Request delivery service is unavailable.");
  }
  if (!response.ok) throw new HttpError(502, "Request delivery service rejected the request.");
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      assertSameOrigin(request);
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: responseHeaders(request) });
      }
      if (request.method !== "POST") {
        return jsonResponse(request, 405, { error: "Method not allowed." });
      }

      const submission = await parseSubmission(request);
      validatePayload(submission.payload);
      await relaySubmission(submission.payload, submission.attachments);
      return jsonResponse(request, 202, {
        ok: true,
        id: submission.payload.id,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonResponse(request, error.status, { error: error.message });
      }
      console.error("Unable to process slide request.");
      return jsonResponse(request, 500, { error: "Unable to process the request." });
    }
  },
};
