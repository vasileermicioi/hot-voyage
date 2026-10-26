import { env } from "cloudflare:workers";
import { type Env, probeBindings } from "@hot-voyage/lib";
import type { APIRoute } from "astro";

// Static output prerenders this route at build time by default; opt out so
// Workers evaluates bindings on every request.
export const prerender = false;

export const GET: APIRoute = () => {
  const status = probeBindings((env ?? {}) as Env);
  return Response.json({ ok: true, ...status });
};
