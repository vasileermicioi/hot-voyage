import { isHotOffer, sortHotFirst } from "@hot-voyage/lib";
import { and, asc, eq, like, lte, or } from "drizzle-orm";
import type { RemoteDatabase } from "./client";
import type { LocalDatabase } from "./local";
import {
  type HotOffer,
  hotOffers,
  type Tour,
  type TourImage,
  tourImages,
  tours,
} from "./schema";

/** Query client: Workers D1 in prod, bun:sqlite locally/in tests. */
export type Database = RemoteDatabase | LocalDatabase;

export const MAX_PAGE_SIZE = 24;

export type TourSort = "hot" | "price-asc" | "price-desc" | "ending";

export interface ListToursOptions {
  search?: string;
  destination?: string;
  maxPriceCents?: number;
  hotOnly?: boolean;
  sort?: TourSort;
  page?: number;
  pageSize?: number;
  now?: number;
}

export interface TourWithOffer {
  tour: Tour;
  offer: HotOffer | null;
}

export interface TourDetail extends TourWithOffer {
  images: TourImage[];
}

export interface ListToursResult {
  tours: TourWithOffer[];
  total: number;
  page: number;
  pageSize: number;
  hotOnly: boolean;
}

function toHotInput(t: Tour, o: HotOffer | null) {
  return {
    status: t.status,
    featured: t.featured,
    discountPct: o?.discountPct ?? null,
    startsAt: o?.startsAt ?? null,
    endsAt: o?.endsAt ?? null,
    seatsLeft: o?.seatsLeft ?? null,
  };
}

/** SQL prefilter (status/destination/price/search). Hot + sort finish in JS. */
export async function listTours(
  db: Database,
  opts: ListToursOptions = {},
): Promise<ListToursResult> {
  const now = opts.now ?? Date.now();
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(opts.pageSize ?? 12)),
  );
  const sort: TourSort = opts.sort ?? "hot";
  const hotOnly = opts.hotOnly ?? false;

  const searchFilter =
    opts.search && opts.search.length > 0
      ? or(
          like(tours.title, `%${opts.search.replace(/[%_]/g, "")}%`),
          like(tours.destination, `%${opts.search.replace(/[%_]/g, "")}%`),
        )
      : undefined;

  const rows = await db
    .select()
    .from(tours)
    .leftJoin(hotOffers, eq(hotOffers.tourId, tours.id))
    .where(
      and(
        eq(tours.status, "published"),
        opts.destination ? eq(tours.destination, opts.destination) : undefined,
        opts.maxPriceCents != null
          ? lte(tours.basePriceCents, opts.maxPriceCents)
          : undefined,
        searchFilter,
      ),
    )
    // Cap prefilter scan; catalog-scale. JS does the hot/sort/page step.
    .limit(500);

  let items: TourWithOffer[] = rows.map((r) => ({
    tour: r.tours,
    offer: r.hot_offers,
  }));
  if (hotOnly)
    items = items.filter((i) => isHotOffer(toHotInput(i.tour, i.offer), now));

  const effective = (i: TourWithOffer) =>
    i.tour.basePriceCents * (1 - (i.offer?.discountPct ?? 0) / 100);
  const hotRank = (i: TourWithOffer) =>
    isHotOffer(toHotInput(i.tour, i.offer), now) ? 0 : 1;
  switch (sort) {
    case "price-asc":
      items.sort((a, b) => effective(a) - effective(b));
      break;
    case "price-desc":
      items.sort((a, b) => effective(b) - effective(a));
      break;
    case "ending":
      items.sort(
        (a, b) =>
          (a.offer?.endsAt ?? Number.POSITIVE_INFINITY) -
          (b.offer?.endsAt ?? Number.POSITIVE_INFINITY),
      );
      break;
    default:
      items.sort((a, b) => {
        const ha = hotRank(a);
        const hb = hotRank(b);
        if (ha !== hb) return ha - hb;
        const ea = a.offer?.endsAt ?? Number.POSITIVE_INFINITY;
        const eb = b.offer?.endsAt ?? Number.POSITIVE_INFINITY;
        if (ea !== eb) return ea - eb;
        return (b.offer?.discountPct ?? 0) - (a.offer?.discountPct ?? 0);
      });
      break;
  }
  // Keep the shared helper as the documented sort contract (same comparator).
  void sortHotFirst;

  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    tours: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    hotOnly,
  };
}

export async function getTourBySlug(
  db: Database,
  slug: string,
): Promise<TourDetail | null> {
  const rows = await db
    .select()
    .from(tours)
    .where(eq(tours.slug, slug))
    .limit(1);
  const tour = rows[0];
  if (!tour) return null;
  const offers = await db
    .select()
    .from(hotOffers)
    .where(eq(hotOffers.tourId, tour.id))
    .limit(1);
  const images = await db
    .select()
    .from(tourImages)
    .where(eq(tourImages.tourId, tour.id))
    .orderBy(asc(tourImages.sortOrder));
  return { tour, offer: offers[0] ?? null, images };
}

export async function listHotOffers(
  db: Database,
  now = Date.now(),
  limit = 8,
): Promise<TourWithOffer[]> {
  const result = await listTours(db, {
    hotOnly: true,
    sort: "ending",
    page: 1,
    pageSize: limit,
    now,
  });
  return result.tours;
}

export async function listRelated(
  db: Database,
  tourId: string,
  limit = 3,
): Promise<TourWithOffer[]> {
  const current = await db
    .select()
    .from(tours)
    .where(eq(tours.id, tourId))
    .limit(1);
  const dest = current[0]?.destination;
  const published = await db
    .select()
    .from(tours)
    .where(eq(tours.status, "published"))
    .limit(100);
  const others = published.filter((t) => t.id !== tourId);
  others.sort((a, b) => {
    const ad = dest && a.destination === dest ? 0 : 1;
    const bd = dest && b.destination === dest ? 0 : 1;
    return ad - bd;
  });
  const picked = others.slice(0, Math.max(0, limit));
  const out: TourWithOffer[] = [];
  for (const t of picked) {
    const offers = await db
      .select()
      .from(hotOffers)
      .where(eq(hotOffers.tourId, t.id))
      .limit(1);
    out.push({ tour: t, offer: offers[0] ?? null });
  }
  return out;
}

// Re-exported for API/UI layers that sort client-side.
export { sortHotFirst };
