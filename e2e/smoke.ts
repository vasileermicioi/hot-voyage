/**
 * Preview smoke test (Bun-only, no test runner needed).
 *
 * Asserts `/` serves the Hot Voyage hello shell and `/api/health` returns ok.
 * Skips gracefully with a clear message when the preview/dev server is down.
 *
 * Usage: `bun run e2e` (start `bun run preview` or `bun run dev` first).
 */
const base = process.env.E2E_BASE_URL ?? "http://localhost:4321";

async function fetchText(
  path: string,
): Promise<{ status: number; text: string }> {
  const res = await fetch(new URL(path, base));
  return { status: res.status, text: await res.text() };
}

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};

try {
  const home = await fetchText("/");
  check("home reachable", home.status === 200, `status ${home.status}`);
  check("home shows Hot Voyage", home.text.includes("Hot Voyage"));

  const health = await fetchText("/api/health");
  check("health reachable", health.status === 200, `status ${health.status}`);
  let body: unknown = null;
  try {
    body = JSON.parse(health.text);
  } catch {
    body = null;
  }
  check(
    "health returns ok",
    typeof body === "object" &&
      body !== null &&
      (body as { ok?: unknown }).ok === true,
    health.text.slice(0, 120),
  );
} catch (error) {
  console.log(
    `SKIP e2e smoke: no server at ${base}. Start it with \`bun run preview\` (after \`bun run build\`) or \`bun run dev\`, then re-run \`bun run e2e\`.`,
  );
  console.log(
    `Detail: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(0);
}

if (failures > 0) {
  console.error(`${failures} smoke check(s) failed.`);
  process.exit(1);
}
console.log("Smoke OK.");
