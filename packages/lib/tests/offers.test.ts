import { describe, expect, test } from "bun:test";
import {
  discountPct,
  effectivePrice,
  isHotOffer,
  seatsUrgencyLevel,
  sortHotFirst,
  timeRemaining,
} from "../src/offers";

const NOW = 1_700_000_000_000;
const DAY = 86_400_000;

function hot(over: Record<string, unknown> = {}) {
  return {
    status: "published",
    featured: 1,
    discountPct: 20,
    startsAt: NOW - DAY,
    endsAt: NOW + DAY,
    seatsLeft: 5,
    ...over,
  };
}

describe("isHotOffer", () => {
  test("active featured offer is hot", () => {
    expect(isHotOffer(hot(), NOW)).toBe(true);
  });

  test("discount-only (not featured) is hot", () => {
    expect(isHotOffer(hot({ featured: 0 }), NOW)).toBe(true);
  });

  test("expired offer is not hot", () => {
    expect(isHotOffer(hot({ endsAt: NOW - 1 }), NOW)).toBe(false);
  });

  test("not-yet-started offer is not hot", () => {
    expect(isHotOffer(hot({ startsAt: NOW + DAY }), NOW)).toBe(false);
  });

  test("sold-out is not hot", () => {
    expect(isHotOffer(hot({ seatsLeft: 0 }), NOW)).toBe(false);
  });

  test("archived status is not hot", () => {
    expect(isHotOffer(hot({ status: "archived" }), NOW)).toBe(false);
  });

  test("draft status is not hot", () => {
    expect(isHotOffer(hot({ status: "draft" }), NOW)).toBe(false);
  });

  test("boundary endsAt == now is still hot", () => {
    expect(isHotOffer(hot({ endsAt: NOW }), NOW)).toBe(true);
  });

  test("missing window is not hot", () => {
    expect(isHotOffer(hot({ startsAt: null, endsAt: null }), NOW)).toBe(false);
  });

  test("neither featured nor discounted is not hot", () => {
    expect(isHotOffer(hot({ featured: 0, discountPct: 0 }), NOW)).toBe(false);
  });
});

describe("effectivePrice / discountPct", () => {
  test("applies 25% discount", () => {
    expect(effectivePrice(10000, 25)).toBe(7500);
  });

  test("rounds to nearest cent", () => {
    expect(effectivePrice(999, 15)).toBe(849);
  });

  test("clamps discount to 0–90", () => {
    expect(effectivePrice(10000, 150)).toBe(1000);
    expect(effectivePrice(10000, -5)).toBe(10000);
    expect(discountPct({ discountPct: 200 })).toBe(90);
    expect(discountPct(null)).toBe(0);
  });
});

describe("timeRemaining", () => {
  test("splits days/hours/minutes", () => {
    const r = timeRemaining(NOW + 2 * DAY + 3 * 3_600_000 + 5 * 60_000, NOW);
    expect(r).toMatchObject({ days: 2, hours: 3, minutes: 5, ended: false });
  });

  test("past end is ended", () => {
    expect(timeRemaining(NOW - 1, NOW).ended).toBe(true);
  });
});

describe("seatsUrgencyLevel", () => {
  test("zero is full", () => {
    expect(seatsUrgencyLevel(0, 20)).toBe("full");
  });

  test("few left is urgent", () => {
    expect(seatsUrgencyLevel(2, 20)).toBe("urgent");
    expect(seatsUrgencyLevel(3, 100)).toBe("urgent");
  });

  test("low fraction is low", () => {
    expect(seatsUrgencyLevel(5, 20)).toBe("low");
  });

  test("plenty otherwise", () => {
    expect(seatsUrgencyLevel(10, 20)).toBe("plenty");
  });
});

describe("sortHotFirst", () => {
  test("hot before non-hot, soonest ending, biggest discount", () => {
    const a = hot({ endsAt: NOW + 5 * DAY, discountPct: 10 });
    const b = hot({ endsAt: NOW + DAY, discountPct: 15 });
    const c = hot({ status: "archived" });
    const sorted = sortHotFirst([a, c, b], NOW);
    expect(sorted[0]).toBe(b);
    expect(sorted[1]).toBe(a);
    expect(sorted[2]).toBe(c);
  });
});
