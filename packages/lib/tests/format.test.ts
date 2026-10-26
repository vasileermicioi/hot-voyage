import { describe, expect, test } from "bun:test";
import {
  formatCountdown,
  formatDate,
  formatDuration,
  formatPrice,
  formatSeatsLeft,
} from "../src/format";

describe("formatPrice", () => {
  test("formats cents as dollars", () => {
    expect(formatPrice(129900)).toBe("$1,299.00");
  });

  test("falls back to USD on bad currency", () => {
    expect(formatPrice(1000, "NOPE")).toBe("$10.00");
  });
});

describe("formatDate / formatDuration", () => {
  test("formats a date", () => {
    expect(formatDate(1_700_000_000_000).length).toBeGreaterThan(0);
  });

  test("formats durations", () => {
    expect(formatDuration(1)).toBe("1 day");
    expect(formatDuration(5)).toBe("5 days");
  });
});

describe("formatSeatsLeft", () => {
  test("sold out copy", () => {
    expect(formatSeatsLeft(0)).toMatch(/Sold out/i);
  });

  test("urgent copy", () => {
    expect(formatSeatsLeft(2)).toMatch(/Only 2 seats left/i);
  });
});

describe("formatCountdown", () => {
  test("ended copy", () => {
    expect(formatCountdown(Date.now() - 1000)).toBe("Offer ended");
  });

  test("future copy mentions ending", () => {
    expect(formatCountdown(Date.now() + 86_400_000)).toMatch(/Ends/i);
  });
});
