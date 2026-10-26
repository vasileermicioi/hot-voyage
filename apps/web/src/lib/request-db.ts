import { env } from "cloudflare:workers";
import { createD1Client } from "@hot-voyage/db/client";
import { type Env, getDb } from "@hot-voyage/lib";

/**
 * D1 client for server-rendered `.astro` pages and API routes.
 *
 * Uses `cloudflare:workers` env (`Astro.locals.runtime.env` was removed in
 * the Astro v6 runtime paired with this adapter).
 */
export function dbFromWorkerEnv() {
  return createD1Client(getDb((env ?? {}) as Env));
}

/** R2 public host for image URLs. Env-overridable, documented fallback. */
export function publicHostFromWorkerEnv(): string {
  const host = ((env ?? {}) as Record<string, string | undefined>)
    .IMAGES_PUBLIC_HOST;
  return host ?? "https://images.hot-voyage.local";
}
