import { MAX_PAGE_SIZE, type TourSort } from "@hot-voyage/db";

export interface ToursQuery {
  search?: string;
  destination?: string;
  maxPriceCents?: number;
  hotOnly: boolean;
  sort: TourSort;
  page: number;
  pageSize: number;
}

const SORTS: TourSort[] = ["hot", "price-asc", "price-desc", "ending"];

/** Pure query parser for GET /api/tours. Caps pageSize; never throws. */
export function parseToursQuery(search: URLSearchParams): ToursQuery {
  const sortRaw = search.get("sort") ?? "hot";
  const sort: TourSort = (SORTS as string[]).includes(sortRaw)
    ? (sortRaw as TourSort)
    : "hot";
  const page = Math.max(1, Math.floor(Number(search.get("page") ?? 1) || 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(Number(search.get("pageSize") ?? 12) || 12)),
  );
  const maxRaw = search.get("maxPrice");
  const maxCents = search.get("maxPriceCents");
  const maxPriceCents =
    maxCents != null && maxCents !== ""
      ? Math.max(0, Math.floor(Number(maxCents)))
      : maxRaw != null && maxRaw !== ""
        ? Math.max(0, Math.round(Number(maxRaw) * 100))
        : undefined;
  return {
    search: search.get("search")?.trim() || undefined,
    destination: search.get("destination")?.trim() || undefined,
    maxPriceCents: Number.isFinite(maxPriceCents) ? maxPriceCents : undefined,
    hotOnly: search.get("hotOnly") === "1" || search.get("hotOnly") === "true",
    sort,
    page,
    pageSize,
  };
}
