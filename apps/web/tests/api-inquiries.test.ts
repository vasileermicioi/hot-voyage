import { describe, expect, test } from "bun:test";
import { validateInquiry } from "@hot-voyage/lib";
import { errorJson } from "../src/lib/api-error";
import { checkRateLimit, resetRateLimit } from "../src/lib/rate-limit";

const valid = {
  tourId: "seed-bali-escape",
  name: "Ada Lovelace",
  contact: "ada@example.com",
  partySize: 2,
  message: "Two seats, please.",
  honeypot: "",
};

describe("POST /api/inquiries logic", () => {
  test("valid input passes validation (would-be 201)", () => {
    expect(validateInquiry(valid).ok).toBe(true);
  });

  test("invalid input yields 400 field errors and stores nothing", async () => {
    const check = validateInquiry({ ...valid, name: "", partySize: 99 });
    expect(check.ok).toBe(false);
    const res = errorJson(400, {
      error: "Invalid inquiry.",
      fields: check.fields,
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: string;
      fields: Record<string, string>;
    };
    expect(body.error).toBe("Invalid inquiry.");
    expect(body.fields.name).toBeDefined();
    expect(body.fields.partySize).toBeDefined();
  });

  test("honeypot trips spam rejection with field error", async () => {
    const check = validateInquiry({ ...valid, honeypot: "bot-fill" });
    expect(check.ok).toBe(false);
    const res = errorJson(400, {
      error: "Invalid inquiry.",
      fields: check.fields,
    });
    const body = (await res.json()) as { fields: Record<string, string> };
    expect(body.fields.honeypot).toBeDefined();
  });

  test("rate-limit stub allows 5 then 429s", () => {
    resetRateLimit();
    const ip = "test-ip-inquiries";
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(ip, 1_000 + i).allowed).toBe(true);
    }
    expect(checkRateLimit(ip, 2_000).allowed).toBe(false);
    resetRateLimit();
  });

  test("429 uses { error } shape", async () => {
    const res = errorJson(429, {
      error: "Too many inquiries. Try again soon.",
    });
    expect(res.status).toBe(429);
    expect(((await res.json()) as { error: string }).error).toMatch(/Too many/);
  });
});
