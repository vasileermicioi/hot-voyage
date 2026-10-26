import { describe, expect, test } from "bun:test";
import { validateInquiry } from "../src/validation";

describe("validateInquiry", () => {
  const valid = {
    tourId: "seed-bali-escape",
    name: "Ada Lovelace",
    contact: "ada@example.com",
    partySize: 2,
    message: "Two window seats, please.",
    honeypot: "",
  };

  test("accepts valid input", () => {
    expect(validateInquiry(valid)).toEqual({ ok: true, fields: {} });
  });

  test("rejects short name, bad contact, bad party size", () => {
    const r = validateInquiry({
      ...valid,
      name: "A",
      contact: "x",
      partySize: 0,
    });
    expect(r.ok).toBe(false);
    expect(r.fields.name).toBeDefined();
    expect(r.fields.contact).toBeDefined();
    expect(r.fields.partySize).toBeDefined();
  });

  test("rejects oversized message", () => {
    const r = validateInquiry({ ...valid, message: "x".repeat(2001) });
    expect(r.ok).toBe(false);
    expect(r.fields.message).toBeDefined();
  });

  test("honeypot trips spam rejection", () => {
    const r = validateInquiry({ ...valid, honeypot: "bot" });
    expect(r.ok).toBe(false);
    expect(r.fields.honeypot).toBeDefined();
  });

  test("missing tourId fails without DB writes", () => {
    const r = validateInquiry({ ...valid, tourId: "" });
    expect(r.ok).toBe(false);
    expect(r.fields.tourId).toBeDefined();
  });
});
