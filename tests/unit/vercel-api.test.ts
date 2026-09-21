import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import handler from "../../api/slide-requests.js";

const payload = {
  id: "PL-20260920-AB12",
  customer: { name: "Nguyen Van A", email: "a@example.com" },
  project: { name: "Q4 pitch", slideCount: 137 },
  templates: [{ name: "aurora", path: "templates/aurora/aurora.html" }],
};

afterEach(() => {
  delete process.env.REQUEST_WEBHOOK_URL;
  delete process.env.REQUEST_WEBHOOK_TOKEN;
  vi.restoreAllMocks();
});

describe("Vercel request function", () => {
  it("wires the static portal to a webhook for JSON briefs", async () => {
    process.env.REQUEST_WEBHOOK_URL = "https://hooks.example.test/slide-requests";
    process.env.REQUEST_WEBHOOK_TOKEN = "test-token";
    const relay = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 202 }));

    const response = await handler.fetch(
      new Request("https://slides.example.test/api/slide-requests", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://slides.example.test" },
        body: JSON.stringify(payload),
      }),
    );

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ ok: true, id: payload.id });
    expect(relay).toHaveBeenCalledWith(
      "https://hooks.example.test/slide-requests",
      expect.anything(),
    );
    const relayOptions = relay.mock.calls[0]?.[1];
    expect(relayOptions?.method).toBe("POST");
    const relayHeaders = new Headers(relayOptions?.headers);
    expect(relayHeaders.get("authorization")).toBe("Bearer test-token");
    expect(relayHeaders.get("content-type")).toBe("application/json");
  });

  it("accepts small multipart briefs and forwards their files", async () => {
    process.env.REQUEST_WEBHOOK_URL = "https://hooks.example.test/slide-requests";
    const relay = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 202 }));
    const form = new FormData();
    form.append("request", JSON.stringify(payload));
    form.append("attachments", new File(["brief"], "brief.txt", { type: "text/plain" }));

    const response = await handler.fetch(
      new Request("https://slides.example.test/api/slide-requests", {
        method: "POST",
        headers: { origin: "https://slides.example.test" },
        body: form,
      }),
    );

    expect(response.status).toBe(202);
    const relayOptions = relay.mock.calls[0]?.[1];
    expect(relayOptions?.body).toBeInstanceOf(FormData);
  });

  it("rejects invalid slide counts before calling the webhook", async () => {
    process.env.REQUEST_WEBHOOK_URL = "https://hooks.example.test/slide-requests";
    const relay = vi.spyOn(globalThis, "fetch");
    const invalidPayload = {
      ...payload,
      project: { ...payload.project, slideCount: 0 },
    };

    const response = await handler.fetch(
      new Request("https://slides.example.test/api/slide-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(invalidPayload),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Slide count must be a positive integer." });
    expect(relay).not.toHaveBeenCalled();
  });

  it("returns a clear configuration error when delivery is not configured", async () => {
    const response = await handler.fetch(
      new Request("https://slides.example.test/api/slide-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Request delivery is not configured yet." });
  });

  it("keeps the Vercel deployment wiring explicit", async () => {
    const config = JSON.parse(await readFile(resolve("vercel.json"), "utf8")) as {
      buildCommand: string;
      outputDirectory: string;
      rewrites: Array<{ source: string; destination: string }>;
      functions: Record<string, { maxDuration: number }>;
    };
    expect(config.buildCommand).toBe("npm run vercel:build");
    expect(config.outputDirectory).toBe("public");
    expect(config.rewrites).toContainEqual({
      source: "/",
      destination: "/index.html",
    });
    expect(config.functions["api/slide-requests.ts"]?.maxDuration).toBe(10);
  });
});
