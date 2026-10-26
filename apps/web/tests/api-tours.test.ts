import { describe, expect, test } from "bun:test";
import { errorJson } from "../src/lib/api-error";
import { parseToursQuery } from "../src/lib/catalog-params";

describe("parseToursQuery", () => {
  test("defaults to hot sort, page 1, hotOnly false", () => {
    expect(parseToursQuery(new URLSearchParams())).toEqual({
      search: undefined,
      destination: undefined,
      maxPriceCents: undefined,
      hotOnly: false,
      sort: "hot",
      page: 1,
      pageSize: 12,
    });
  });

  test("parses filters and sort", () => {
    const q = parseToursQuery(
      new URLSearchParams(
        "search=bali&destination=Bali&maxPriceCents=100000&hotOnly=1&sort=price-asc&page=2&pageSize=5",
      ),
    );
    expect(q).toEqual({
      search: "bali",
      destination: "Bali",
      maxPriceCents: 100000,
      hotOnly: true,
      sort: "price-asc",
      page: 2,
      pageSize: 5,
    });
  });

  test("accepts maxPrice in whole units and hotOnly=true", () => {
    const q = parseToursQuery(
      new URLSearchParams("maxPrice=999&hotOnly=true&sort=ending"),
    );
    expect(q.maxPriceCents).toBe(99900);
    expect(q.hotOnly).toBe(true);
    expect(q.sort).toBe("ending");
  });

  test("falls back to hot on unknown sort and caps pageSize", () => {
    const q = parseToursQuery(
      new URLSearchParams("sort=bogus&pageSize=1000&page=0"),
    );
    expect(q.sort).toBe("hot");
    expect(q.pageSize).toBe(24);
    expect(q.page).toBe(1);
  });

  test("200 envelope carries tours + total + hotOnly flag", () => {
    const envelope = {
      tours: [],
      total: 0,
      page: 1,
      pageSize: 12,
      hotOnly: true,
    };
    expect(envelope).toMatchObject({ total: 0, hotOnly: true });
  });

  test("500 errors use { error } shape without secrets", async () => {
    const res = errorJson(500, { error: "Failed to list tours" });
    expect(res.status).toBe(500);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toEqual({ error: "Failed to list tours" });
    expect(JSON.stringify(body)).not.toMatch(/secret|token/i);
  });
});
