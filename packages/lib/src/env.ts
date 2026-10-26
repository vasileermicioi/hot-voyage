import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

/** Subset of the Workers env this slice reads. Extra bindings are ignored. */
export interface Env {
  DB?: D1Database;
  IMAGES?: R2Bucket;
}

export interface BindingStatus {
  hasD1: boolean;
  hasR2: boolean;
}

/** Non-throwing availability probe for `/api/health`. Never leaks secrets. */
export function probeBindings(env: Env): BindingStatus {
  return {
    hasD1: env.DB !== undefined,
    hasR2: env.IMAGES !== undefined,
  };
}

/** Throwing accessor for query paths: fails fast with an actionable message. */
export function getDb(env: Env): D1Database {
  if (!env.DB) {
    throw new Error(
      "Missing D1 binding `DB`. Declare it in apps/web/wrangler.jsonc under d1_databases, " +
        "copy .dev.vars.example to .dev.vars for local dev, then run `bun scripts/bootstrap-dev.ts`.",
    );
  }
  return env.DB;
}

/** Throwing accessor for object-storage paths. */
export function getBucket(env: Env): R2Bucket {
  if (!env.IMAGES) {
    throw new Error(
      "Missing R2 binding `IMAGES`. Declare it in apps/web/wrangler.jsonc under r2_buckets, " +
        "then run `bun scripts/bootstrap-dev.ts` to create the local dev bucket directory.",
    );
  }
  return env.IMAGES;
}
