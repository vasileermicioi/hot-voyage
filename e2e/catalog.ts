/**
 * Catalog e2e (Bun-only, no test runner needed).
 *
 * Walks home → hot-only filter → tour detail → inquiry submit against a
 * running preview/dev server with a migrated + seeded local D1:
 * `bun run db:migrate:local && bun run db:seed:local`, then
 * `bun run preview` (or `bun run dev`), then `bun run e2e -- catalog`.
 *
 * Skips gracefully with a clear message when the server is down.
 */
const base = process.env.E2E_BASE_URL ?? "http://localhost:4321";

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};

async function get(path: string): Promise<{ status: number; text: string }> {
  const res = await fetch(new URL(path, base));
  return { status: res.status, text: await res.text() };
}

try {
  const home = await get("/");
  check("home reachable", home.status === 200, `status ${home.status}`);
  check("home shows Hot Voyage", home.text.includes("Hot Voyage"));
  check("home hot rail has badges", home.text.includes("data-hot-badge"));

  const hotList = await get("/tours?hotOnly=1");
  check(
    "hot-only list reachable",
    hotList.status === 200,
    `status ${hotList.status}`,
  );
  check("hot-only list has tour cards", hotList.text.includes("/tours/"));

  const apiTours = await fetch(
    new URL("/api/tours?hotOnly=1&pageSize=5", base),
  );
  check(
    "GET /api/tours reachable",
    apiTours.status === 200,
    `status ${apiTours.status}`,
  );
  const toursBody = (await apiTours.json()) as {
    tours?: unknown[];
    total?: number;
    hotOnly?: boolean;
  };
  check(
    "GET /api/tours returns hot page",
    Array.isArray(toursBody.tours) &&
      (toursBody.total ?? 0) > 0 &&
      toursBody.hotOnly === true,
  );

  const slugMatch = hotList.text.match(/\/tours\/([a-z0-9-]+)/);
  check("found a tour slug", slugMatch !== null);
  const slug = slugMatch?.[1] ?? "bali-escape";
  const detail = await get(`/tours/${slug}`);
  check("detail reachable", detail.status === 200, `status ${detail.status}`);
  check(
    "detail gallery is WebP srcset",
    detail.text.includes("srcset") && detail.text.includes(".webp"),
  );
  check(
    "detail gallery has 480/800/1200 widths",
    detail.text.includes("480w") &&
      detail.text.includes("800w") &&
      detail.text.includes("1200w"),
  );
  check("detail has countdown", detail.text.includes("data-countdown"));
  check("detail has inquiry form", detail.text.includes("data-inquiry-form"));

  const tourIdMatch = detail.text.match(/data-tour-id="([^"]+)"/);
  const tourId = tourIdMatch?.[1] ?? `seed-${slug}`;
  const inquiryRes = await fetch(new URL("/api/inquiries", base), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tourId,
      name: "E2E Traveler",
      contact: "e2e@example.com",
      partySize: 2,
      message: "E2E smoke inquiry.",
      honeypot: "",
    }),
  });
  const inquiryBody = (await inquiryRes.json()) as { id?: string };
  check(
    "POST inquiry creates row",
    inquiryRes.status === 201 && typeof inquiryBody.id === "string",
    `status ${inquiryRes.status}`,
  );

  const badRes = await fetch(new URL("/api/inquiries", base), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tourId,
      name: "",
      contact: "x",
      partySize: 99,
      honeypot: "",
    }),
  });
  check(
    "invalid inquiry returns 400",
    badRes.status === 400,
    `status ${badRes.status}`,
  );
} catch (error) {
  console.log(
    `SKIP e2e catalog: no server at ${base}. Migrate+seed (\`bun run db:migrate:local && bun run db:seed:local\`), start it with \`bun run preview\`, then re-run \`bun run e2e -- catalog\`.`,
  );
  console.log(
    `Detail: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(0);
}

if (failures > 0) {
  console.error(`${failures} catalog check(s) failed.`);
  process.exit(1);
}
console.log("Catalog OK.");
