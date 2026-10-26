import { describe, expect, test } from "bun:test";
import {
  buildSrcset,
  IMAGE_WIDTHS,
  r2KeyFor,
  r2PublicUrl,
  sizesFor,
} from "../src/images";

describe("images", () => {
  test("widths are locked to 480/800/1200", () => {
    expect([...IMAGE_WIDTHS]).toEqual([480, 800, 1200]);
  });

  test("r2KeyFor follows tours/<slug>/<width>w.webp", () => {
    expect(r2KeyFor("bali-escape", 800)).toBe("tours/bali-escape/800w.webp");
  });

  test("srcset contains webp + all widths", () => {
    const srcset = buildSrcset("bali-escape", "https://images.example.test");
    for (const w of IMAGE_WIDTHS) {
      expect(srcset).toContain(`${w}w`);
    }
    expect(srcset).toContain(".webp");
  });

  test("srcset rewrites a full key across widths", () => {
    const srcset = buildSrcset(
      "tours/bali-escape/800w.webp",
      "https://images.example.test",
    );
    expect(srcset).toContain("480w.webp");
    expect(srcset).toContain("1200w.webp");
  });

  test("public URL joins host and key", () => {
    expect(r2PublicUrl("tours/a/800w.webp", "https://img.test/")).toBe(
      "https://img.test/tours/a/800w.webp",
    );
  });

  test("sizesFor covers card and gallery", () => {
    expect(sizesFor("card")).toContain("400px");
    expect(sizesFor("gallery")).toContain("800px");
  });
});
