import { env } from "cloudflare:workers";
import { randomUUID } from "node:crypto";
import { inquiries } from "@hot-voyage/db";
import { createD1Client } from "@hot-voyage/db/client";
import { type Env, getDb, validateInquiry } from "@hot-voyage/lib";
import type { APIRoute } from "astro";
import { errorJson, logApi } from "../../lib/api-error";
import { checkRateLimit } from "../../lib/rate-limit";

// Static output prerenders routes by default; opt out so mutations run on Workers.
export const prerender = false;

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown"
  );
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    logApi("POST /api/inquiries", 400, "Invalid JSON body");
    return errorJson(400, { error: "Invalid JSON body." });
  }

  const input = (body ?? {}) as Record<string, unknown>;
  const check = validateInquiry({
    tourId: typeof input.tourId === "string" ? input.tourId : "",
    name: typeof input.name === "string" ? input.name : "",
    contact: typeof input.contact === "string" ? input.contact : "",
    partySize:
      typeof input.partySize === "number"
        ? input.partySize
        : Number(input.partySize),
    message: typeof input.message === "string" ? input.message : "",
    honeypot: typeof input.honeypot === "string" ? input.honeypot : "",
  });
  if (!check.ok) {
    logApi("POST /api/inquiries", 400, "Validation failed");
    return errorJson(400, { error: "Invalid inquiry.", fields: check.fields });
  }

  const ip = clientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    logApi("POST /api/inquiries", 429, `Rate limited: ${ip}`);
    return errorJson(429, { error: "Too many inquiries. Try again soon." });
  }

  try {
    const binding = getDb((env ?? {}) as Env);
    const db = createD1Client(binding);
    const id = randomUUID();
    await db.insert(inquiries).values({
      id,
      tourId: (input.tourId ?? "") as string,
      name: (input.name ?? "") as string,
      contact: (input.contact ?? "") as string,
      partySize: Number(input.partySize),
      message: (typeof input.message === "string"
        ? input.message
        : "") as string,
      honeypot: "",
      status: "new",
      createdAt: Date.now(),
    });
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save inquiry";
    logApi("POST /api/inquiries", 500, message);
    return errorJson(500, { error: message });
  }
};
