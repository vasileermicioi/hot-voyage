import { env } from "cloudflare:workers";
import { listTours } from "@hot-voyage/db";
import { createD1Client } from "@hot-voyage/db/client";
import { type Env, getDb } from "@hot-voyage/lib";
import type { APIRoute } from "astro";
import { errorJson, logApi } from "../../lib/api-error";
import { parseToursQuery } from "../../lib/catalog-params";

// Static output prerenders routes by default; opt out so Workers evaluates
// bindings and query params on every request.
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const binding = getDb((env ?? {}) as Env);
    const db = createD1Client(binding);
    const query = parseToursQuery(new URL(request.url).searchParams);
    const result = await listTours(db, query);
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list tours";
    logApi("GET /api/tours", 500, message);
    return errorJson(500, { error: message });
  }
};
