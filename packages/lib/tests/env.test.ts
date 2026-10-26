import { describe, expect, test } from "bun:test";
import { getBucket, getDb, probeBindings } from "../src/env";

describe("probeBindings", () => {
  test("reports both bindings present", () => {
    expect(probeBindings({ DB: {} as never, IMAGES: {} as never })).toEqual({
      hasD1: true,
      hasR2: true,
    });
  });

  test("reports both bindings missing", () => {
    expect(probeBindings({})).toEqual({ hasD1: false, hasR2: false });
  });
});

describe("getDb", () => {
  test("throws an actionable error when DB is missing", () => {
    expect(() => getDb({})).toThrow(/Missing D1 binding `DB`/);
  });

  test("mentions how to configure the binding", () => {
    expect(() => getDb({})).toThrow(/wrangler\.jsonc/);
  });

  test("returns the binding when present", () => {
    const db = {} as never;
    expect(getDb({ DB: db })).toBe(db);
  });
});

describe("getBucket", () => {
  test("throws an actionable error when IMAGES is missing", () => {
    expect(() => getBucket({})).toThrow(/Missing R2 binding `IMAGES`/);
  });

  test("returns the binding when present", () => {
    const bucket = {} as never;
    expect(getBucket({ IMAGES: bucket })).toBe(bucket);
  });
});
