---

id: hot-voyage-04-launch
title: Release hardening and launch
---

# 04 - Release hardening and launch

## Context & Goal

Final slice, closes the parent. After 01-03 the product works locally (themed scaffold, public catalog, admin + WebP pipeline) but is not shippable: no SEO, no perf/caching story, no prod D1/R2 provisioning, no observability/runbook. This step hardens and releases: SEO/sitemap, perf + image delivery, a11y, production deploy to Cloudflare Workers, and docs close. Outcome in one sentence: Hot Voyage is live on Workers with seeded/prod content, WebP via R2 cached at edge, green lint/typecheck/tests/build, and a runbook for ops.

## Prerequisites & Inputs

- Steps `hot-voyage-01-foundation`, `hot-voyage-02-catalog`, `hot-voyage-03-admin` merged and marked done.
- Artifacts that must exist: all pages/APIs from 02-03, `apps/web/wrangler.jsonc`, `packages/db/drizzle/` migrations, `packages/lib/src/images.ts` + pipeline constants, `e2e/catalog.ts` + `e2e/admin.ts`, `AGENTS.md`, `docs/design.md`, LikeC4.
- Concrete inputs: production domain/host, R2 public/cache config, D1 prod DB name/id, Cloudflare Access prod settings, Lighthouse/perf budget targets (decided here if missing).

## Scope & Conventions

- Scope:
  - Data:
    - Prod D1 provisioning docs + `scripts/db-apply-prod.sh` (guarded, confirms target, runs `wrangler d1 migrations apply --remote`), prod seed/min-content decision (no auto-seed prod with demo data unless explicitly flagged).
    - R2 prod bucket + public/custom-domain + cache rules (`Cache-Control: public, max-age=31536000, immutable` for versioned `*w.webp`), CORS finalization for admin uploads only.
  - Domain:
    - Perf budgets (`budgets.json` or README table: LCP/CLS/JS KB/image KB), `packages/lib/src/seo.ts` (canonical, OG/Twitter, JSON-LD Tour/Trip), robots/sitemap generation.
  - API/server:
    - `apps/web/src/pages/sitemap.xml.ts`, `apps/web/src/pages/robots.txt.ts`, `apps/web/src/pages/rss.xml.ts` or `og/` routes; security headers in `apps/web/src/middleware.ts` (CSP for R2 host, `Referrer-Policy`, `X-Content-Type-Options`); edge caching headers for catalog vs admin (public `s-maxage` vs `no-store` admin).
    - Health/readiness extension (`apps/web/src/pages/api/health.ts` adds version + D1 latency probe without secrets) + structured error logging hook (console/Workers Logs; no new vendor unless documented).
  - UI:
    - SEO pass on all public pages (titles/meta/OG images from R2 WebP, JSON-LD, canonical), favicon/manifest touristic icons, 404/500 neobrutalist pages.
    - Perf pass: image `loading=lazy` below fold, `fetchpriority=high` hero, srcset/sizes audit, island hydration audit (filters/countdown/form only), font subset/display-swap.
    - A11y pass: contrast/focus/keyboard/labels per design.md, `alt` for all gallery images, reduced-motion for countdown/marquee.
  - Tests and docs:
    - `apps/web/tests/seo.test.ts`, `apps/web/tests/headers.test.ts`, `apps/web/tests/perf-budget.test.ts` (asserts budgets + image srcset rules without network where possible), `e2e/launch.ts` (prod-preview: home->tours->detail->admin login gate reachable, no 404 assets).
    - `docs/runbook.md` (deploy, rollback, D1 migrate/seed, R2 purge, Access rotation, incident triage), final `README.md` + `AGENTS.md` prod sections, LikeC4 deployment view + `docs/architecture.md` release notes.
- Conventions:
  - Bun workspaces commands preserved; add `bun run preview:prod`, `bun run cf:deploy`, `bun run db:migrate:prod` (guarded, via `--filter`) — all documented in AGENTS.md/README.
  - No behavior change to catalog/admin pricing or publish rules; only hardening + config + copy. Any fix found loops back to owning step's file before closing here.
  - Architecture docs move with code: LikeC4 deployment + runbook updated in same change.
- Out of scope (later parent features, not residual of this slice):
  - Payments/booking transactions, i18n/currency, accounts/reviews, full-text search, PWA/offline, bulk import.

## Deliverables & Verification

- Deliverables:
  - SEO routes + headers + error pages + perf/a11y fixes.
  - Prod D1/R2 wiring + guarded scripts + R2 cache/CORS config.
  - Runbook + final README/AGENTS/LikeC4 + release tests/e2e.
  - Live production deployment URL verified.
- Verification:
  1. `bun run lint` — exits 0
  2. `bun run typecheck` — exits 0
  3. `bun test` — all pass including seo/headers/perf-budget
  4. `bun run build && bun run preview:prod` — serves without 404 assets; `bun run e2e -- launch` passes
  5. `bunx wrangler deploy` — exits 0; live `/api/health` ok; live home/detail render hot offers with R2 WebP + immutable cache headers; `sitemap.xml`/`robots.txt` reachable
  6. Lighthouse (documented command/output in runbook): LCP/CLS meet stated budgets or waivers recorded

## Cross-references

- Depends on: `hot-voyage-03-admin` (and transitively `01-foundation`, `02-catalog`).
- Consumed by: closes the feature (no further child; next parent e.g. bookings/payments deferred).
- Parent guide: `.dev-plan/current-iteration/hot-voyage-parent-guide.md`

## Tasks

### Setup

- [ ] Read this step plan end-to-end plus parent guide release criteria.
- [ ] Confirm 01-03 done and staging/preview reproducible locally (`build` + `preview` + catalog/admin e2e green).
- [ ] Record perf budgets + prod hostnames + R2 cache decisions before editing (put in runbook draft).

### Implementation

Work top to bottom. These groups are one proposal. Do not stop after a group and open a new step file.

#### Data

- [ ] Document prod D1 creation/binding (`wrangler d1 create hot-voyage-prod` from `apps/web`, id into `apps/web/wrangler.jsonc` prod env) + guarded `scripts/db-apply-prod.sh` (requires explicit confirm, never runs on dev by default).
- [ ] Decide + document prod content (migrate + curated seed vs manual admin entry via 03 UI); execute chosen path and log counts.
- [ ] Finalize R2 prod bucket + public hostname, `Cache-Control immutable` for versioned WebP, admin-upload CORS allowlist only; store non-secret config in `apps/web/wrangler.jsonc`, secrets via `wrangler secret`/Access.

#### Domain

- [ ] Add `packages/lib/src/seo.ts` (title/meta builder, canonical, OG/Twitter cards, JSON-LD `TouristTrip` with price/availability window).
- [ ] Add perf budget file/table + `apps/web/tests/perf-budget.test.ts` (fails on oversized hero, missing srcset, sync-heavy islands).
- [ ] Add security/caching header policy table (public vs admin) implemented in middleware, tested in `apps/web/tests/headers.test.ts`.

#### API

- [ ] Add `apps/web/src/pages/sitemap.xml.ts` (tours from D1 published only), `apps/web/src/pages/robots.txt.ts`, `apps/web/src/pages/rss.xml.ts` or hot-offers feed.
- [ ] Extend `apps/web/src/middleware.ts` with headers (CSP incl. R2 host, `X-Content-Type-Options`, `Referrer-Policy`, cache split public/admin).
- [ ] Extend `apps/web/src/pages/api/health.ts` with `version` + D1 ping timing (no secrets); wire structured error log helper used by admin/public APIs.

#### UI

- [ ] Apply SEO to `apps/web/src/pages/index` + `tours/index` + `tours/[slug]` (unique titles/descriptions, canonical, OG image = R2 WebP 1200w, JSON-LD injected, alt text audit).
- [ ] Add `apps/web/src/pages/404.astro` + `apps/web/src/pages/500.astro` neobrutalist touristic pages with search/home CTA.
- [ ] Add favicon/manifest (`apps/web/public/favicon.svg`, `apps/web/public/site.webmanifest`) touristic mark per design.md.
- [ ] Perf pass: hero `fetchpriority`, gallery lazy + sizes, fonts `display=swap` + subset, islands audit (no full-page hydration), R2 srcset widths verified 480/800/1200.
- [ ] A11y pass: contrast fixes, focus-visible, form labels/errors announced, countdown `aria-live` polite + `prefers-reduced-motion` disables animation.

#### Tests and docs

- [ ] Add `apps/web/tests/seo.test.ts` (canonical/OG/JSON-LD present on home + detail fixtures).
- [ ] Add `apps/web/tests/headers.test.ts` (CSP/Cache split, admin no-store).
- [ ] Add `apps/web/tests/perf-budget.test.ts` + `e2e/launch.ts` (preview-prod walk: no 404s, WebP + cache headers, admin gate intact).
- [ ] Add `docs/runbook.md` (first deploy, env vars/secrets, migrate/seed prod, R2 cache purge, Access setup, rollback via `wrangler rollback`/`deploy` prev, log tail, incident checklist).
- [ ] Update `AGENTS.md` (prod commands + what never to do: no prod seed overwrite, no R2 delete without backup), `README.md` (live URL + status), LikeC4 deployment view + `docs/architecture.md` release entry.
- [ ] Run `bun test` + `bun run build` after each major area.

### Validation

- [ ] Run every verification command in Deliverables & Verification; save outputs/links in runbook.
- [ ] Walk prod paths: `/`, `/tours`, `/tours/<hot-slug>`, `/sitemap.xml`, `/robots.txt`, `/api/health`, `/admin` gate; confirm WebP + immutable cache on images, no mixed-content.
- [ ] Record Lighthouse run (or documented waiver) + manual keyboard/screen-reader spot check.
- [ ] Prepare release PR/handoff linking `hot-voyage-04-launch` and parent guide with live URL.

### Cleanup

- [ ] Mark 04 done and close parent guide (all release criteria checked).
- [ ] Update canonical spec (`openspec/specs/`) to match shipped behavior; archive change folders if used (mirror step IDs one-for-one, no extra folders).
- [ ] File deferred follow-ups (payments, i18n, search) as next-parent candidates, not as 05/06 in this parent.

## Spec Delta: site-release

```markdown
# site-release - Spec Delta

## ADDED Requirements

### Requirement: Discoverable SEO

The system SHALL expose SEO metadata, sitemap, robots, and feed covering all published tours with canonical URLs and structured data.

#### Scenario: Crawlable hot offer

- **WHEN** a crawler requests `/sitemap.xml` or a hot tour detail
- **THEN** it receives published URLs only plus valid title, description, canonical, OG image, and JSON-LD

### Requirement: Production edge delivery

The system SHALL serve the site from Cloudflare Workers with D1 reads and R2 WebP images cached at the edge with immutable versioned cache headers and correct admin no-store behavior.

#### Scenario: Cached image

- **WHEN** a visitor loads a tour gallery image twice
- **THEN** the second load is served from edge cache with `Cache-Control: immutable` and no admin responses are cached publicly

### Requirement: Release operability

The system SHALL provide a runbook for deploy, D1 migration, R2 purge, auth rotation, and rollback, with health probe including version and DB latency.

#### Scenario: Incident triage

- **WHEN** an operator follows the runbook health + log steps
- **THEN** they can confirm deploy version, DB reachability, and rollback target without code inspection
```
