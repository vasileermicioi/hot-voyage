/** Hot-offer domain rules. Single source of truth for server + UI. */

export interface HotInput {
  status: string;
  featured?: number | boolean | null;
  discountPct?: number | null;
  startsAt?: number | null;
  endsAt?: number | null;
  seatsLeft?: number | null;
}

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  ended: boolean;
}

function toFeaturedFlag(featured: HotInput["featured"]): boolean {
  return featured === 1 || featured === true;
}

/**
 * Hot = published + seatsLeft > 0 + now in [startsAt, endsAt] +
 * (featured OR discountPct > 0). Expired, archived, sold-out, or
 * windowless tours are never hot.
 */
export function isHotOffer(t: HotInput, now = Date.now()): boolean {
  if (t.status !== "published") return false;
  if (t.startsAt == null || t.endsAt == null) return false;
  if (now < t.startsAt || now > t.endsAt) return false;
  if ((t.seatsLeft ?? 0) <= 0) return false;
  const discount = t.discountPct ?? 0;
  if (!toFeaturedFlag(t.featured) && discount <= 0) return false;
  return true;
}

/** Price after discount, in cents. Clamps discount to 0–90. */
export function effectivePrice(
  basePriceCents: number,
  discountPct: number | null | undefined,
): number {
  const d = Math.min(90, Math.max(0, discountPct ?? 0));
  return Math.round(basePriceCents * (1 - d / 100));
}

export function discountPct(
  offer: { discountPct?: number | null } | null | undefined,
): number {
  return Math.min(90, Math.max(0, offer?.discountPct ?? 0));
}

export function timeRemaining(endsAt: number, now = Date.now()): TimeRemaining {
  const totalMs = endsAt - now;
  if (totalMs <= 0)
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, ended: true };
  const minutes = Math.floor(totalMs / 60_000);
  return {
    totalMs,
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
    ended: false,
  };
}

export type SeatsUrgency = "full" | "urgent" | "low" | "plenty";

/** sold-out → full; ≤3 → urgent; ≤30% left → low; else plenty. */
export function seatsUrgencyLevel(
  seatsLeft: number,
  seatsTotal: number,
): SeatsUrgency {
  if (seatsLeft <= 0) return "full";
  if (seatsLeft <= 3) return "urgent";
  if (seatsTotal > 0 && seatsLeft / seatsTotal <= 0.3) return "low";
  return "plenty";
}

/** Hot first, then soonest-ending, then biggest discount. Stable. */
export function sortHotFirst<T extends HotInput>(
  items: T[],
  now = Date.now(),
): T[] {
  return [...items].sort((a, b) => {
    const ha = isHotOffer(a, now) ? 0 : 1;
    const hb = isHotOffer(b, now) ? 0 : 1;
    if (ha !== hb) return ha - hb;
    const ea = a.endsAt ?? Number.POSITIVE_INFINITY;
    const eb = b.endsAt ?? Number.POSITIVE_INFINITY;
    if (ea !== eb) return ea - eb;
    return (b.discountPct ?? 0) - (a.discountPct ?? 0);
  });
}
