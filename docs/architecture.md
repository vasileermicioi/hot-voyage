# Hot Voyage — Architecture

LikeC4 source: `docs/likec4/workspace.likec4`. Update both files in the same
change as any behavior change (see `AGENTS.md`).

## Context (C1)

Visitors browse tours and hot offers on the public site. Site admins publish
offers and upload WebP images from the browser. The system runs on Cloudflare
Workers + D1 + R2 with Astro + TypeScript + Drizzle, managed with Bun.

## Container (C2)

- **Astro edge app** (`apps/web`, `hot-voyage-web`): hybrid output on
  `@astrojs/cloudflare` — static pages + server `/api/*` routes
  (`prerender = false`). Data access only via workspace packages; mutations
  only in server endpoints.
- **D1 database** (`DB` binding): relational store via `packages/db`
  (Drizzle client + migrations in `packages/db/drizzle/`).
- **R2 image store** (`IMAGES` binding): WebP-only tour images at
  `tours/<slug>/<width>w.<ext>`.
- **Admin browser**: auth-gated studio (step 03) — CRUD forms, client-side
  resize to WebP, R2 upload. Islands only where interactive.

Request flow: browser → Workers (Astro) → `packages/lib` env/validation →
`packages/db` queries → D1; images served from R2 via public host.

## Component (C3, catalog slice)

- `apps/web/src/pages/index.astro` (server-rendered): hero + hot-offers rail
  (`listHotOffers`) + featured + destinations, via `TourCard` (`HotBadge` +
  `Countdown` island) on `styles/tokens.css`.
- `apps/web/src/pages/tours/index.astro` (server-rendered): `Filters` form
  (GET, URL-synced) + server `listTours` + pagination + hot-only empty state.
- `apps/web/src/pages/tours/[slug].astro` (server-rendered — freshness over
  rebuild; see file header): `Gallery` (R2 `srcset` 480/800/1200w WebP),
  itinerary timeline, includes/excludes, `PriceBox`, `InquiryForm`, related rail.
- `apps/web/src/pages/api/tours.ts` → `parseToursQuery` + `listTours` via
  `getDb()` → `{ tours, total, page, pageSize, hotOnly }`.
- `apps/web/src/pages/api/inquiries.ts` → shared `validateInquiry` + honeypot +
  rate-limit stub → 201 `{ id }` / 400 `{ error, fields }` / 429.
- `packages/lib/src/`: `offers.ts` (single `isHot` truth), `format.ts`,
  `validation.ts` (shared inquiry schema), `images.ts` (R2 URL + `srcset`,
  widths 480/800/1200 locked), `api-error.ts` + `rate-limit.ts` + `catalog-params.ts`.
- `packages/db/src/`: `client.ts` (Workers D1) + `local.ts` (Bun-only sqlite),
  `schema.ts` (`tours`, `hot_offers`, `tour_images`, `inquiries` + probe),
  `queries.ts` (`listTours`, `getTourBySlug`, `listHotOffers`, `listRelated`),
  `seed.ts` (idempotent local seed, never prod).

Foundation (01) pieces kept: `api/health.ts` → `{ ok, hasD1, hasR2 }`,
`layouts/BaseLayout.astro`, tokens, LikeC4 shell. Home no longer renders
`HelloCard` — it renders the catalog hero + hot rail (`HelloCard.astro` file
retained but unused by routes).

ADRs live in `AGENTS.md` (stack pins, data-access/mutation rule, image/WebP
rule, CF deploy rule). Design tokens live in `docs/design.md`.
