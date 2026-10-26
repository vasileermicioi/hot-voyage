---

id: hot-voyage-02-catalog
title: Public tours and hot-offers catalog
---

# 02 - Public tours and hot-offers catalog

## Context & Goal

Second slice, first user value. Foundation (01) gives toolchain + bindings + themed shell but no domain. This step ships the whole public browsing capability end to end: D1 schema/migrations/seed for tours + offers, Drizzle queries, Astro listing/detail pages with hot-deal urgency, filters, and tests. Outcome in one sentence: a visitor can find a hot offer (badge, discount, expiry), open its detail with WebP images from R2, and inquire — all from local D1+R2 with green checks.

## Prerequisites & Inputs

- Step `hot-voyage-01-foundation` merged and marked done in parent guide.
- Artifacts that must exist: `apps/web/astro.config.mjs`, `apps/web/wrangler.jsonc` with d1+r2 bindings, `packages/db/drizzle.config.ts`, `packages/db/src/client.ts`, `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/styles/tokens.css`, `AGENTS.md`, `docs/design.md`, `docs/likec4/workspace.likec4`.
- Concrete inputs:
  - R2 key layout reserved in 01: `tours/<slug>/<width>w.<ext>`; image widths finalized here if 01 left provisional.
  - Seed content (titles, itineraries, prices, hot windows) — placeholder-licensed, documented.
  - Health endpoint pattern from 01 for new API routes.

## Scope & Conventions

- Scope:
  - Data:
    - `packages/db/src/schema.ts` (tours, offers/hot_offers, images, inquiries): ids (sqlite text/uuid), slugs unique, prices (integer cents + currency), discount pct, `startsAt/endsAt`, `seatsTotal/seatsLeft`, `featured`, `status` (draft/published/archived), timestamps; indexes on slug, status+endsAt, featured.
    - `packages/db/drizzle/0002_*.sql` migration(s) + `packages/db/src/seed.ts` (idempotent, 8-12 tours with 3-5 hot, uses local D1; remote seed documented, not auto-run in CI).
    - `packages/db/src/queries.ts` (listTours with filters/sort/pagination, getTourBySlug, listHotOffers with expiry-aware ordering, related tours).
  - Domain:
    - `packages/lib/src/offers.ts` (isHot, discountCalc, timeLeft, seatsUrgency, sorting), `packages/lib/src/format.ts` (price/date/duration), `packages/lib/src/validation.ts` (inquiry input zod-style, shared with 03).
    - Business rules: hot = published + featured/discount + within window + seatsLeft>0; expired/sold-out never badged hot; prices in cents, display localized.
  - API/server:
    - `apps/web/src/pages/api/tours.ts` (GET list JSON, query: search/destination/maxPrice/hotOnly/sort/page), `apps/web/src/pages/api/inquiries.ts` (POST creates inquiry row, honeypot + rate-limit stub, no payment).
    - `apps/web/src/actions/*` or endpoint handlers only for mutations; reads via `queries.ts` (`@hot-voyage/db`) directly in Astro frontmatter.
  - UI:
    - `apps/web/src/pages/index.astro` (hero + hot-offers rail + value props), `apps/web/src/pages/tours/index.astro` (filters: destination, dates, price, hot-only; sort: hotness/price/soonest-ending; empty state), `apps/web/src/pages/tours/[slug].astro` (gallery, itinerary, includes, price box with countdown + seats-left, inquiry form, related).
    - `apps/web/src/components/*`: `TourCard.astro`, `HotBadge.astro`, `Countdown.(astro|tsx)` island, `Filters.tsx` island, `PriceBox.astro`, `Gallery.astro` (responsive `srcset` WebP from R2), `InquiryForm.tsx` island.
    - Responsive + focus states per `design.md`; no admin UI here.
  - Tests and docs:
    - `packages/lib/tests/offers.test.ts`, `packages/db/tests/queries.test.ts` (bun:test against in-memory/local D1), `apps/web/tests/api-tours.test.ts`, `e2e/catalog.ts` (home -> filter hot-only -> open detail -> submit inquiry; image srcset is WebP).
    - Update `docs/architecture.md` + LikeC4 (add tours container/component), `README.md` (seed + catalog commands), canonical spec via Spec Delta below.
- Conventions:
  - Follow 01 host rules: Bun workspaces, strict TS, data via `packages/db/*`, domain via `packages/lib/*` imported as `@hot-voyage/db` / `@hot-voyage/lib`, mutations only in endpoints/actions, WebP-first images, docs move with code.
  - Astro routing in `apps/web/src/pages/`; interactive (filters/countdown/form) as islands, static shell stays `.astro`.
  - No raw SQL in pages; all D1 access through Drizzle + `queries.ts` in `packages/db`.
- Out of scope (not next layer, separate capabilities):
  - Admin auth/CRUD/R2 upload pipeline (03) — seed + static R2 fixtures stand in here.
  - SEO sitemap/RSS polish, perf budgets, prod deploy, observability (04).

## Deliverables & Verification

- Deliverables:
  - Schema + migration + seed + queries (`packages/db/src/*`, `packages/db/drizzle/*`).
  - Domain libs (`packages/lib/src/offers.ts`, `format.ts`, `validation.ts`).
  - Public pages + components + islands listed above; inquiry API.
  - Tests: unit/integration/e2e for catalog slice; updated LikeC4 + README.
- Verification:
  1. `bun run lint` — exits 0
  2. `bun run typecheck` — exits 0
  3. `bun test` — all pass including new offers/queries/api tests
  4. `bun run db:migrate:local && bun run db:seed:local` — exits 0, tour count logged
  5. `bun run build` — exits 0
  6. `bun run e2e -- catalog` (bun e2e: home lists hot badges, detail shows countdown/gallery/inquiry, inquiry POST creates row; images served as WebP srcset)

## Cross-references

- Depends on: `hot-voyage-01-foundation`.
- Consumed by: `hot-voyage-03-admin` (edits the schema/queries/pages built here; reuses validation + R2 layout).
- Parent guide: `.dev-plan/current-iteration/hot-voyage-parent-guide.md`

## Tasks

### Setup

- [ ] Read this step plan end-to-end plus parent guide release criteria.
- [ ] Confirm 01 artifacts exist (bindings, tokens, AGENTS.md, LikeC4).
- [ ] Decide provisional image widths (e.g., 480/800/1200w) and R2 public host; record in design.md if changed.

### Implementation

Work top to bottom. These groups are one proposal. Do not stop after a group and open a new step file.

#### Data

- [ ] Extend `packages/db/src/schema.ts` with `tours`, `offers` (or `hot_offers`), `tour_images`, `inquiries` tables + indexes + relations.
- [ ] Generate + hand-review `packages/db/drizzle/0002_*.sql` migration; ensure local apply clean and remote-apply notes included.
- [ ] Add `packages/db/src/seed.ts` idempotent seed (destinations, durations, prices, hot windows relative to now, R2 image keys or placeholder WebP fixtures).
- [ ] Add root `package.json` scripts `db:seed:local` (delegating to `packages/db` via `--filter`) if missing; document prod seed guardrails (never auto-seed prod).
- [ ] Add `packages/db/src/queries.ts`: `listTours`, `getTourBySlug`, `listHotOffers`, `listRelated`, pagination + filter/sort pushdown where D1 allows.

#### Domain

- [ ] Add `packages/lib/src/offers.ts`: `isHotOffer(tour, now)`, `effectivePrice`, `discountPct`, `timeRemaining`, `seatsUrgencyLevel`, `sortHotFirst`.
- [ ] Add `packages/lib/src/format.ts`: price (Intl), date/duration, seats messaging.
- [ ] Add `packages/lib/src/validation.ts`: inquiry schema (name, contact, party size, message, tourId, honeypot) shared with admin later.
- [ ] Handle edge rules: expired/archived/sold-out excluded from hot rail; `endsAt` in past shows "ended" not countdown; currency fallback documented.

#### API

- [ ] Add `GET apps/web/src/pages/api/tours.ts` (filters/sort/page, caps pageSize, returns tours + total + hotOnly flag).
- [ ] Add `POST apps/web/src/pages/api/inquiries.ts` (validates via shared schema, inserts row, returns 201 + id; 400 on invalid, basic IP rate-limit stub + honeypot reject).
- [ ] Add error shapes (JSON `{ error, fields? }`) and logging hook for 04 observability.

#### UI

- [ ] Rebuild `apps/web/src/pages/index.astro`: hero (touristic neobrutalist), hot-offers rail (horizontal cards with badge+countdown), featured destinations, CTA to `/tours`.
- [ ] Add `apps/web/src/pages/tours/index.astro`: server-rendered list + `Filters` island (search/destination/price/hotOnly/sort), empty state ("no hot offers right now — browse all"), pagination.
- [ ] Add `apps/web/src/pages/tours/[slug].astro`: `getStaticPaths` or server prerender decision documented; gallery with WebP srcset/sizes, itinerary timeline, includes/excludes, PriceBox with discount + countdown + seats-left, InquiryForm, related tours.
- [ ] Add components: `TourCard`, `HotBadge`, `Countdown` island (ticks without hydration of whole page), `Gallery` (R2 URL builder `packages/lib/src/images.ts`), `PriceBox`, `InquiryForm` (progressive enhancement, error/success states).
- [ ] Add `packages/lib/src/images.ts`: R2 public URL + srcset builder (widths from setup, `format=webp`, fallback note for 03 uploads).
- [ ] Apply `design.md` tokens strictly; add touristic illustrations/emoji-free icons; verify focus-visible + contrast.

#### Tests and docs

- [ ] Add `packages/lib/tests/offers.test.ts` (hot logic, expiry boundaries, sold-out, discount math, sorting).
- [ ] Add `packages/db/tests/queries.test.ts` (seeded local D1: filters, hotOnly, pagination, slug lookup, related).
- [ ] Add `apps/web/tests/api-tours.test.ts` + `apps/web/tests/api-inquiries.test.ts` (200/400/201 paths, validation messages).
- [ ] Add `e2e/catalog.ts` (bun e2e: home hot rail visible, filter hot-only narrows, detail gallery WebP, inquiry submit success).
- [ ] Update `docs/likec4/workspace.likec4` + `docs/architecture.md` for catalog containers/components + data flow.
- [ ] Update `README.md` (migrate/seed/catalog URLs) and canonical spec (Spec Delta below).
- [ ] Run `bun test` after each major area, not only at end.

### Validation

- [ ] Run every verification command in Deliverables & Verification.
- [ ] Walk user-visible path: `/` -> `/tours?hotOnly=1` -> `/tours/<slug>` -> inquiry success; expired tour shows ended, sold-out shows full.
- [ ] Confirm gallery requests are WebP with srcset widths; no console/a11y blocking errors.
- [ ] Prepare PR/handoff linking `hot-voyage-02-catalog` and parent guide.

### Cleanup

- [ ] Mark 02 done in parent guide.
- [ ] Update canonical product spec if behavior diverged from delta.
- [ ] Note admin-needed gaps (auth, edit UI, upload) for 03 without implementing them.

## Spec Delta: tours-catalog

```markdown
# tours-catalog - Spec Delta

## ADDED Requirements

### Requirement: Browse tours

The system SHALL list published tours with search, destination, price, and hot-only filters plus sorting and pagination.

#### Scenario: Filter hot only

- **WHEN** a visitor selects hot-only on `/tours`
- **THEN** only published hot offers appear ordered by soonest-ending or biggest discount per documented sort

#### Scenario: Empty hot window

- **WHEN** no hot offers are active
- **THEN** the page shows an empty state and offers browsing all tours

### Requirement: Hot offer urgency

The system SHALL badge active hot offers with discount, countdown to `endsAt`, and seats-left urgency, and SHALL NOT badge expired, archived, or sold-out tours as hot.

#### Scenario: Countdown visible

- **WHEN** a visitor opens a hot tour detail
- **THEN** they see discount pct, time remaining, and seats-left messaging consistent with server data

### Requirement: Tour detail and inquiry

The system SHALL provide a tour detail with WebP gallery, itinerary, price box, related tours, and an inquiry form that creates an inquiry without payment.

#### Scenario: Submit inquiry

- **WHEN** a visitor submits a valid inquiry
- **THEN** the system stores it and shows confirmation; invalid input returns field errors without storing
```
