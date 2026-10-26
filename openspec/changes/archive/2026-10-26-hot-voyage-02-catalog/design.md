# Design

## Context

See `proposal.md` for motivation. Current state (01, archived as `2026-10-26-hot-voyage-01-foundation`): Bun workspaces (`apps/web` Astro static-output + `output:"static"` with `src/pages/api/*` opting into server via `export const prerender = false`, `packages/db` Drizzle sqlite, `packages/lib` env helper), `wrangler.jsonc` with `DB`/`IMAGES` bindings (local/preview/prod), `createD1Client`/`createLocalClient` in `packages/db/src/client.ts`, `probeBindings`/`getDb`/`getBucket` in `packages/lib/src/env.ts`, neobrutalist tokens in `tokens.css`, LikeC4 workspace. `schema.ts` holds only `schema_probe` — no domain tables. R2 key layout `tours/<slug>/<width>w.<ext>` is reserved; widths provisional (OQ2). Constraints: data access only via `packages/db` + `packages/lib` as `@hot-voyage/db` / `@hot-voyage/lib`; mutations only in endpoints/actions; no raw D1 in `.astro`; WebP-first; docs move with code.

## Goals / Non-Goals

**Goals:**

- End-to-end local catalog: migrate → seed → browse → detail → inquiry with `bun run db:migrate:local && bun run db:seed:local`, green `lint/typecheck/test/build/e2e`.
- Expiry- and seats-correct hot merchandising shared between server queries and UI (single `isHot` truth).
- Lock R2 image widths (default 480/800/1200w) and public-URL/`srcset` builder so 03 uploads conform without rework.

**Non-Goals:**

- No admin auth/CRUD/R2 upload pipeline (03 owns it; seed + static fixtures stand in).
- No SEO sitemap/RSS, perf budgets, prod provisioning, observability dashboards (04).
- No design-token expansion beyond applying existing tokens to catalog components.

## Decisions

### 1. Schema: `tours` + `hot_offers` + `tour_images` + `inquiries`, keep `schema_probe`

Extend `packages/db/src/schema.ts` with four tables (Drizzle `sqliteTable`, `text` ids as `crypto.randomUUID()` at insert, integer cents, integer unix-ms timestamps). `tours`: `id/slug(unique)/title/destination/durationDays/basePriceCents/currency/featured/status/publishedAt/createdAt/updatedAt`. `hot_offers`: `id/tourId(FK→tours, unique, cascade)/discountPct/startsAt/endsAt/seatsTotal/seatsLeft/createdAt` — separate table so hot windows are queryable/joinable without nullable sprawl on `tours`. `tour_images`: `id/tourId(FK,cascade)/r2Key/width/alt/sortOrder`. `inquiries`: `id/tourId(FK)/name/contact/partySize/message/honeypot/status/createdAt`. Indexes: `tours.slug` unique, `(tours.status, tours.featured)`, `hot_offers.endsAt`, `inquiries.tourId`. Keep `schema_probe` untouched so the 01 baseline migration stays valid; new migration `0002_*.sql` via `drizzle-kit generate` + hand review.

- Alternative: nullable hot columns on `tours`. Rejected — optional-window queries get messy and 03 admin edits to windows would touch the core tours row.
- Alternative: float prices. Rejected — cents integers avoid rounding drift; display localized in `format.ts`.

### 2. Queries push down what D1 allows, finish in JS

`packages/db/src/queries.ts` exports `listTours({search,destination,maxPriceCents,hotOnly,sort,page,pageSize})`, `getTourBySlug`, `listHotOffers`, `listRelated(tourId, limit)`. D1 pushdown: `status='published'` predicate, `destination`/`price` range, `LIMIT/OFFSET`, pageSize cap (e.g., 24). Hot-expiry/seats and `sortHotFirst` finish in JS via `packages/lib/src/offers.ts` (`isHotOffer(tour,now)`, `effectivePrice`, `discountPct`, `timeRemaining`, `seatsUrgencyLevel`) because D1 sqlite date/join expressiveness is limited and the same function must run on both server and island. `getTourBySlug` joins tour+offer+images ordered by `sortOrder`.

- Alternative: pure-SQL hot filtering. Rejected — duplicates hot semantics in SQL and JS, guaranteeing drift.

### 3. Domain split: `offers.ts` / `format.ts` / `validation.ts` / `images.ts`

`offers.ts`: hot = `status==='published' && seatsLeft>0 && now∈[startsAt,endsAt] && (featured||discountPct>0)`; expired/archived/sold-out never hot; `endsAt` past → "ended". `format.ts`: `Intl.NumberFormat` price from cents + currency fallback (document USD fallback), date/duration/seats strings. `validation.ts`: inquiry schema (name, contact, partySize 1–20, message ≤2000, tourId, honeypot must be empty) shared by web endpoint and later admin — dependency-free or zod-style already in repo, no new validator lib. `images.ts`: `r2PublicUrl(key)` + `srcset(key, widths=[480,800,1200])` builder using R2 public host env; WebP-only output, `sizes` tuned for card (rail) vs gallery.

- Alternative: colocate helpers in `apps/web`. Rejected — violates data/domain-via-packages rule and blocks reuse in db tests and 03.

### 4. API: server-only `GET /api/tours` + `POST /api/inquiries` with `prerender=false`

`apps/web/src/pages/api/tours.ts` (`export const prerender=false`): parses query, caps pageSize, calls `listTours` via `getDb(Astro.locals.runtime.env)`, returns `{ tours, total, page, pageSize, hotOnly }`. `apps/web/src/pages/api/inquiries.ts`: validates via shared schema → 400 `{ error, fields }` on invalid/honeypot; inserts via Drizzle → 201 `{ id }`; naive in-memory per-IP rate-limit stub (Map + window, documented as stub for 04) → 429. Reads in `.astro` frontmatter call `queries.ts` directly (no fetch-to-self). Error shape and a `console`-level log hook kept stable for 04 observability.

- Alternative: Astro Actions. Either acceptable; endpoints chosen to match 01 `health.ts` pattern and keep `e2e` curl-able.

### 5. UI: static pages + three islands, strict tokens

`index.astro` (prerendered): hero + hot-offers rail (server-filtered `listHotOffers`, `HotBadge` + `Countdown` island per card) + CTA to `/tours`. `tours/index.astro`: server-rendered list + `Filters.tsx` island (search/destination/price/hotOnly/sort, URL-synced) + pagination + empty state. `tours/[slug].astro`: `getStaticPaths` from published slugs with `prerender=true` fallback documented (revalidate on 03 edits), `Gallery` (srcset/sizes WebP), itinerary timeline, `PriceBox` (discount+countdown+seats), `InquiryForm.tsx` (progressive enhancement, inline field errors, success state), related rail. Components: `TourCard.astro`, `HotBadge.astro`, `PriceBox.astro`, `Gallery.astro`; islands: `Countdown`, `Filters`, `InquiryForm`. No admin UI; focus-visible + contrast per `design.md`.

- Alternative: full-page hydration. Rejected — static shell + islands keeps 04 perf budget reachable.

### 6. Seed idempotent, local-only; fixtures WebP

`packages/db/src/seed.ts`: upsert by slug (8–12 tours, 3–5 hot with windows relative to `Date.now()` so hot rail is live on any checkout), R2 keys `tours/<slug>/800w.webp` + 480/1200 variants pointing at committed WebP fixtures (placeholder-licensed, documented). Root script `db:seed:local` delegates via `bun --filter`. Never auto-seed prod; remote seed is a documented manual command for 04.

## Risks / Trade-offs

- [Risk] D1 local vs remote type drift (unix-ms vs text dates) → Mitigation: integers everywhere, seed asserts round-trip; remote apply notes in migration header.
- [Risk] Hot semantics drift between SQL prefilter and JS `isHot` → Mitigation: SQL only prefilters `published`; JS is the single decider; `offers.test.ts` pins boundaries (exact `endsAt`, `seatsLeft=0/1`, archived).
- [Risk] R2 public host differs dev/prod → Mitigation: host from env, builder centralized in `images.ts`; e2e asserts `srcset` contains `.webp` + widths, not a hardcoded host.
- [Risk] `getStaticPaths` staleness after 03 edits → Mitigation: document prerender choice in `[slug].astro` header; 03 adds revalidation without changing specs.
- [Risk] Rate-limit stub bypassed behind Workers → Mitigation: documented stub; real durable limiter is 04 scope; honeypot already blocks naive bots.

## Migration Plan

Additive only, no rollback of 01. Deploy: `bun run db:generate && bun run db:migrate:local && bun run db:seed:local && bun test && bun run build`. Rollback: drop new tables via down-migration note or re-seed; no 01 files removed. Remote D1 apply is manual + documented (04 provisions prod ids).

## Open Questions

- Image widths: default 480/800/1200w unless the 04 perf pass proves otherwise — recorded here to close OQ2 for this slice.
- `getStaticPaths` vs full-server detail: default prerender published slugs at build; revisit to server-render in 03 if admin edits demand freshness — does not change specs or tasks.
