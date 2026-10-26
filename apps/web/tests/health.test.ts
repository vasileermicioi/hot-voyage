import { describe, expect, test } from "bun:test";
import { probeBindings } from "@hot-voyage/lib";

describe("health response shape", () => {
  test("returns ok with D1/R2 flags and no secrets", () => {
    const status = probeBindings({ DB: {} as never, IMAGES: {} as never });
    const body = JSON.stringify({ ok: true, ...status });
    const parsed = JSON.parse(body) as Record<string, unknown>;
    expect(parsed).toEqual({ ok: true, hasD1: true, hasR2: true });
    expect(JSON.stringify(parsed)).not.toMatch(/secret|token|key/i);
  });

  test("flags missing bindings without throwing", () => {
    const body = { ok: true, ...probeBindings({}) };
    expect(body).toEqual({ ok: true, hasD1: false, hasR2: false });
  });
});
