import { Database as BunDatabase } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { drizzle as drizzleBunSqlite } from "drizzle-orm/bun-sqlite";
import {
  getTourBySlug,
  listHotOffers,
  listRelated,
  listTours,
} from "../src/queries";
import * as schema from "../src/schema";
import { seedDatabase } from "../src/seed";

function setupDb() {
  const sqlite = new BunDatabase(":memory:", { create: true });
  const dir = join(import.meta.dir, "..", "drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    // Strip leading comment header lines; split on drizzle breakpoints.
    const statements = sql.split("--> statement-breakpoint");
    for (let stmt of statements) {
      stmt = stmt
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("--"))
        .join("\n")
        .trim();
      if (!stmt) continue;
      sqlite.exec(stmt.endsWith(";") ? stmt : `${stmt};`);
    }
  }
  const db = drizzleBunSqlite(sqlite, { schema });
  return db;
}

async function seededDb() {
  const db = setupDb();
  await seedDatabase(db);
  return db;
}

describe("catalog queries", () => {
  test("seed produces 10 tours", async () => {
    const db = await seededDb();
    const all = await listTours(db, { pageSize: 50 });
    // 8 published (draft + archived excluded)
    expect(all.total).toBe(8);
  });

  test("hotOnly returns only active hot offers", async () => {
    const db = await seededDb();
    const hot = await listTours(db, { hotOnly: true, pageSize: 50 });
    // 4 active hot: santorini, bali, amalfi, kyoto (iceland expired, patagonia sold out)
    expect(hot.total).toBe(4);
    expect(hot.tours.every((t) => t.offer !== null)).toBe(true);
  });

  test("hotOnly ordered by soonest ending by default", async () => {
    const db = await seededDb();
    const hot = await listHotOffers(db);
    expect(hot.length).toBe(4);
    const ends = hot.map((t) => t.offer?.endsAt ?? 0);
    const sorted = [...ends].sort((a, b) => a - b);
    expect(ends).toEqual(sorted);
    // amalfi ends soonest (1 day)
    expect(hot[0]?.tour.slug).toBe("amalfi-drive");
  });

  test("filters by destination and max price", async () => {
    const db = await seededDb();
    const byDest = await listTours(db, { destination: "Bali" });
    expect(byDest.total).toBe(1);
    expect(byDest.tours[0]?.tour.slug).toBe("bali-escape");
    const cheap = await listTours(db, { maxPriceCents: 100000, pageSize: 50 });
    expect(cheap.tours.every((t) => t.tour.basePriceCents <= 100000)).toBe(
      true,
    );
  });

  test("search matches title or destination", async () => {
    const db = await seededDb();
    const r = await listTours(db, { search: "Kyoto" });
    expect(r.total).toBe(1);
  });

  test("pagination slices with total", async () => {
    const db = await seededDb();
    const p1 = await listTours(db, { page: 1, pageSize: 3, sort: "price-asc" });
    const p2 = await listTours(db, { page: 2, pageSize: 3, sort: "price-asc" });
    expect(p1.total).toBe(8);
    expect(p1.tours).toHaveLength(3);
    expect(p2.tours).toHaveLength(3);
    expect(p1.tours[0]?.tour.id).not.toBe(p2.tours[0]?.tour.id);
  });

  test("page size is capped", async () => {
    const db = await seededDb();
    const r = await listTours(db, { pageSize: 1000 });
    expect(r.pageSize).toBe(24);
  });

  test("getTourBySlug joins offer + images", async () => {
    const db = await seededDb();
    const detail = await getTourBySlug(db, "bali-escape");
    expect(detail?.tour.slug).toBe("bali-escape");
    expect(detail?.offer?.discountPct).toBe(30);
    expect(detail?.images.length).toBe(3);
    expect(detail?.images[0]?.r2Key).toContain(".webp");
  });

  test("getTourBySlug returns null for unknown", async () => {
    const db = await seededDb();
    expect(await getTourBySlug(db, "nope")).toBeNull();
  });

  test("related excludes self", async () => {
    const db = await seededDb();
    const detail = await getTourBySlug(db, "bali-escape");
    const related = await listRelated(db, detail?.tour.id ?? "", 3);
    expect(related.length).toBe(3);
    expect(related.every((r) => r.tour.id !== detail?.tour.id)).toBe(true);
  });
});
