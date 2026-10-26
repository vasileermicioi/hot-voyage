/**
 * E2E dispatcher (Bun-only).
 *
 * Usage:
 * - `bun run e2e` → smoke (`e2e/smoke.ts`)
 * - `bun run e2e -- catalog` → catalog walk (`e2e/catalog.ts`)
 */
const target = process.argv[2] ?? "smoke";

if (target === "catalog") {
  await import("./catalog.ts");
} else if (target === "smoke" || target === undefined) {
  await import("./smoke.ts");
} else {
  console.error(`Unknown e2e target "${target}". Use "smoke" or "catalog".`);
  process.exit(1);
}
