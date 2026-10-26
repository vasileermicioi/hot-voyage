# Tasks

## 1. Data schema, migration, seed, queries

- [x] 1.1 Extend `packages/db/src/schema.ts` with `tours`, `hot_offers`, `tour_images`, `inquiries` tables + indexes + relations (keep `schema_probe`) and verify `bun run db:generate` exits 0 with a reviewed `0002_*.sql`
- [x] 1.2 Hand-review `packages/db/drizzle/0002_*.sql` (FKs, cascade, unique slug, index names, remote-apply notes in header) and verify `bun run db:migrate:local` exits 0 clean
- [x] 1.3 Add idempotent `packages/db/src/seed.ts` (upsert by slug, 8–12 tours with 3–5 hot windows relative to now, WebP R2 keys `tours/<slug>/<width>w.webp`) plus root `db:seed:local` script delegating via `--filter`, and verify `bun run db:seed:local` exits 0 and logs tour count, re-running changes nothing
- [x] 1.4 Add `packages/db/src/queries.ts` (`listTours` with search/destination/maxPrice/hotOnly/sort/page + pageSize cap, `getTourBySlug`, `listHotOffers`, `listRelated`) with no raw SQL in pages, and verify `packages/db/tests/queries.test.ts` passes on seeded local D1 covering filters, hotOnly, pagination, slug lookup, and related
- [x] 1.5 Document seed guardrails (never auto-seed prod, manual remote command) in `README.md` and verify the documented migrate/seed commands run as written

## 2. Domain helpers and shared validation

- [x] 2.1 Add `packages/lib/src/offers.ts` (`isHotOffer`, `effectivePrice`, `discountPct`, `timeRemaining`, `seatsUrgencyLevel`, `sortHotFirst` with expired/archived/sold-out never hot) and verify `packages/lib/tests/offers.test.ts` passes including expiry boundaries, sold-out, discount math, and sorting
- [x] 2.2 Add `packages/lib/src/format.ts` (Intl price from cents + currency fallback, date/duration/seats messaging) and verify unit assertions for cents→display, fallback currency, and seats copy pass under `bun test`
- [x] 2.3 Add `packages/lib/src/validation.ts` (inquiry schema: name, contact, partySize, message, tourId, honeypot) shared with future admin, and verify invalid inputs produce field errors in `bun test` without DB writes
- [x] 2.4 Add `packages/lib/src/images.ts` (R2 public URL + `srcset` builder for 480/800/1200w WebP, `sizes` guidance) and verify builder output contains `.webp` + all widths in `bun test`

## 3. Catalog and inquiry API

- [x] 3.1 Add `GET apps/web/src/pages/api/tours.ts` (`prerender=false`, query parsing, pageSize cap, `{ tours, total, page, pageSize, hotOnly }` via `getDb`) and verify `apps/web/tests/api-tours.test.ts` passes for 200 filter/sort/page paths
- [x] 3.2 Add `POST apps/web/src/pages/api/inquiries.ts` (shared-schema validation, honeypot reject, rate-limit stub → 429, insert → 201 `{ id }`, 400 `{ error, fields }`) and verify `apps/web/tests/api-inquiries.test.ts` passes for 201/400/honeypot paths with no row stored on reject
- [x] 3.3 Add stable JSON error shapes + logging hook for 04 observability in both endpoints and verify error responses match `{ error, fields? }` in tests

## 4. Public UI pages, components, islands

- [x] 4.1 Rebuild `apps/web/src/pages/index.astro` (hero, hot-offers rail with `HotBadge` + `Countdown` island, featured destinations, CTA to `/tours`) on existing tokens and verify `bun run build` exits 0 and home renders hot badges with no console errors
- [x] 4.2 Add `apps/web/src/pages/tours/index.astro` + `Filters.tsx` island (search/destination/price/hotOnly/sort URL-synced, pagination, empty state "no hot offers right now — browse all") and verify hot-only filter narrows the list and empty state shows with zero hot offers
- [x] 4.3 Add `apps/web/src/pages/tours/[slug].astro` (documented `getStaticPaths` prerender choice, `Gallery` WebP srcset/sizes, itinerary timeline, includes/excludes, `PriceBox` with discount + countdown + seats-left, `InquiryForm`, related rail) and verify expired tour shows "ended" and sold-out shows "full" with no hot badge
- [x] 4.4 Add components `TourCard.astro`, `HotBadge.astro`, `PriceBox.astro`, `Gallery.astro` plus islands `Countdown`, `Filters`, `InquiryForm.tsx` (progressive enhancement, error/success states, focus-visible + contrast per `design.md`) and verify detail gallery requests are WebP `srcset` with 480/800/1200w and no a11y blocking errors

## 5. Docs, e2e, and release verification

- [x] 5.1 Update `docs/likec4/workspace.likec4` + `docs/architecture.md` for catalog containers/components + D1/R2 data flow and verify LikeC4 parses/renders without errors
- [x] 5.2 Add `e2e/catalog.ts` (home → filter hot-only → open detail → submit inquiry; assert WebP srcset, countdown, inquiry success) and verify `bun run e2e -- catalog` passes with preview up
- [x] 5.3 Run full gate `bun run lint`, `bun run typecheck`, `bun test`, `bun run db:migrate:local && bun run db:seed:local`, `bun run build`, `bun run e2e -- catalog` and verify each exits 0, then walk `/` → `/tours?hotOnly=1` → `/tours/<slug>` → inquiry success capturing outputs for handoff
