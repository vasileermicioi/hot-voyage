# Proposal

## Why

Foundation (01) gives a buildable, deployable shell with D1+R2 bindings and theme tokens but no domain value — a visitor cannot find, evaluate, or inquire about any tour. This change ships the first user-visible slice so a visitor can discover a hot offer, open its detail with urgency context, and inquire, all from local D1+R2 with green checks.

## What Changes

- D1 domain tables (`tours`, `hot_offers`/`offers`, `tour_images`, `inquiries`) with slugs, cents prices, discount, `startsAt/endsAt`, `seatsTotal/seatsLeft`, `featured`, `status`, timestamps, and indexes on slug / status+endsAt / featured; idempotent seed of 8–12 tours (3–5 hot) with placeholder-licensed content and WebP R2 keys.
- Drizzle query layer (`listTours` with filters/sort/pagination, `getTourBySlug`, `listHotOffers` expiry-aware, `listRelated`) plus domain helpers (`isHot`, discount math, `timeLeft`, seats urgency, sorting) and shared formatting/validation (`price/date/duration`, inquiry schema).
- Public API: `GET /api/tours` (search/destination/maxPrice/hotOnly/sort/page) and `POST /api/inquiries` (validated insert, honeypot + rate-limit stub, no payment), with JSON error shapes.
- Public UI: home hero + hot-offers rail, `/tours` filterable/sortable list with empty state, `/tours/[slug]` detail (WebP `srcset` gallery, itinerary, includes, price box with countdown + seats-left, inquiry form, related); islands only for filters/countdown/form (`TourCard`, `HotBadge`, `Countdown`, `Filters`, `PriceBox`, `Gallery`, `InquiryForm`) on existing neobrutalist tokens.
- Tests + docs: unit/integration/API/e2e coverage for hot logic, queries, endpoints, and the home → filter → detail → inquiry path; LikeC4 + `architecture.md` + `README.md` updated in the same change.

## Capabilities

### New Capabilities

- `tours-catalog`: Public tour browsing and hot-offer merchandising — filtered/sorted/paginated listing, expiry- and seats-aware hot badging with countdown, WebP gallery detail with price box and related tours, and payment-free inquiry creation.

### Modified Capabilities

None — `project-foundation` is untouched; this slice adds domain behavior on top of it.

## Impact

- Affected code: `packages/db/src/schema.ts`, `packages/db/drizzle/0002_*.sql`, `packages/db/src/seed.ts`, `packages/db/src/queries.ts`; `packages/lib/src/offers.ts`, `format.ts`, `validation.ts`, `images.ts`; `apps/web/src/pages/index.astro`, `tours/index.astro`, `tours/[slug].astro`, `api/tours.ts`, `api/inquiries.ts`, `components/*`; `docs/`, `README.md`, `e2e/catalog.ts`.
- APIs: new `GET /api/tours` and `POST /api/inquiries` (additive, non-breaking); reads in Astro frontmatter via `@hot-voyage/db`, mutations only in endpoints.
- Dependencies: no new runtime pins beyond 01 (Astro, Drizzle, Cloudflare bindings); R2 key layout `tours/<slug>/<width>w.<ext>` reused, widths finalized here (default 480/800/1200w).
- Systems: local D1+R2 only; remote seed documented but never auto-run; no admin UI, no SEO/perf/observability beyond logging hooks for 04.
