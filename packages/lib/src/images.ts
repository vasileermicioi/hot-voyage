/** R2 public URL + srcset builder. Widths locked here (closes OQ2 for this slice). */

export const IMAGE_WIDTHS = [480, 800, 1200] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

/** Key layout reserved in 01: `tours/<slug>/<width>w.<ext>`. WebP-only. */
export function r2KeyFor(slug: string, width: number): string {
  return `tours/${slug}/${width}w.webp`;
}

function trimTrailingSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** Public URL for an R2 key. Host comes from env so dev/prod never hardcode. */
export function r2PublicUrl(r2Key: string, publicHost: string): string {
  return `${trimTrailingSlash(publicHost)}/${r2Key}`;
}

/** `srcset` for a WebP gallery/card image across locked widths. */
export function buildSrcset(
  r2KeyOrSlug: string,
  publicHost: string,
  widths: readonly number[] = IMAGE_WIDTHS,
): string {
  const isKey = r2KeyOrSlug.includes("/");
  return widths
    .map((w) => {
      const key = isKey
        ? r2KeyOrSlug.replace(/\d+w\.webp$/, `${w}w.webp`)
        : r2KeyFor(r2KeyOrSlug, w);
      return `${r2PublicUrl(key, publicHost)} ${w}w`;
    })
    .join(", ");
}

/** `sizes` guidance: rail cards vs full gallery. */
export function sizesFor(variant: "card" | "gallery" = "card"): string {
  return variant === "gallery"
    ? "(max-width: 720px) 100vw, 800px"
    : "(max-width: 720px) 80vw, 400px";
}
