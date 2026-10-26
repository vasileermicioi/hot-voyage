/**
 * Local dev bootstrap (Bun-only, cross-platform).
 *
 * Creates the local D1 database state + R2 dev directory and applies the
 * empty baseline migration. Idempotent — safe to re-run.
 *
 * Usage: `bun scripts/bootstrap-dev.ts` (from repo root).
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "bun";

const root = join(import.meta.dir, "..");

await mkdir(join(root, ".dev-data", "r2"), { recursive: true });

console.log("Applying local D1 migrations (hot-voyage-dev)...");
await $`bunx wrangler d1 migrations apply hot-voyage-dev --local --config apps/web/wrangler.jsonc`.cwd(
  root,
);

console.log("Local bootstrap complete: D1 migrated, .dev-data/r2 ready.");
