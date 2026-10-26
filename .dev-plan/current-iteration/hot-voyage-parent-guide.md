# Feature: Hot Voyage

## User-Visible Value

Hot Voyage is a touristic tours website for "hot offers" — time-boxed, discounted tours with bold neobrutalist cards, fast browsing, and trustworthy detail pages. After this feature ships, visitors can browse tours, spot hot deals with expiry/availability urgency, open a tour detail with images and itinerary, and inquire/book; admins can publish offers and upload optimized WebP images from the browser to R2; the site runs on Cloudflare Workers + D1 + R2 with Astro + TypeScript + Drizzle, managed with Bun.

## Child Changes

1. `hot-voyage-01-foundation` - project scaffold and platform: Bun workspaces (`apps/web` + `packages/db`, `packages/lib`) with Astro+TS+Bun+Cloudflare Workers/D1/R2 wiring, Drizzle config, AGENTS.md, design.md (neobrutalist touristic theme), LikeC4 architecture, deployable shell.
2. `hot-voyage-02-catalog` - public tours + hot-offers catalog end to end: D1 schema/migrations/seed, queries, listing/detail pages, filters, hot badges/countdowns, tests, docs.
3. `hot-voyage-03-admin` - admin studio end to end: auth-gated CRUD, publish flow, client-side resize to WebP + R2 upload, validation, e2e.
4. `hot-voyage-04-launch` - release close: SEO/sitemap/RSS, perf/image delivery, a11y, observability, production deploy + runbook.

## Dependency Graph

```text
01-foundation
  -> 02-catalog
    -> 03-admin
      -> 04-launch
```

02 needs 01 tooling/bindings. 03 needs 02 schema/queries to edit. 04 needs all user paths to harden and ship. No backward edges. `k` depends only on `1..k-1`.

## Release Criteria

- All 4 child steps merged, checkboxes complete, marked done here.
- `bun run lint`, `bun run typecheck`, `bun test` pass; `bun run build` + `wrangler deploy --dry-run` succeed.
- Public loop verified without cloud mocks where possible: home -> listing -> detail -> inquiry renders from D1 (local D1 in dev/test).
- Admin loop verified: create -> resize-to-WebP client-side -> upload R2 -> publish -> visible in catalog.
- `openspec/specs/` (or host canonical spec) matches shipped behavior; `AGENTS.md`, `docs/design.md`, LikeC4 docs current.
- Production deployment on Cloudflare Workers serves WebP images from R2 with acceptable Lighthouse performance (documented in 04).

## Non-Goals

- Payments, checkout, real booking transactions — inquiry/CTAs only (defer to next parent feature).
- Multi-language/i18n, multi-currency conversion, user accounts/reviews.
- Native apps, offline PWA, advanced search (full-text/vector).
- Migration of legacy data; no destructive migration in this parent.
- Custom design system beyond neobrutalism.dev adaptation documented in `design.md`.

## Risks And Open Questions

- R1: Cloudflare D1 local vs remote drift — mitigate with `wrangler d1 migrations apply --local` in tests + documented remote apply in 04.
- R2: R2 public dev vs production bucket CORS/caching — decided in 01, verified in 03/04.
- R3: Client-side WebP/encode support variance (Safari older) — fallback to JPEG + server-side accept check; decided in 03.
- R4: Neobrutalism accessibility (heavy borders/shadows, contrast) — tokens + a11y audit in 04.
- OQ1: Admin auth method (Cloudflare Access vs simple session + env secret)? Default: Access in prod + env-gated basic session in dev; confirm in 01, implement in 03.
- OQ2: Image sizes/breakpoints and R2 key layout? Default proposed in 03, locked by 04 perf pass.
- OQ3: Seed content license (demo tour images/text)? Use generated/placeholder with clear license note.

## Folded Work

- Old thin split (scaffold, schema, domain, API, UI, admin UI, images, SEO, deploy as 8-10 proposals) collapsed to 4 thick slices.
- 01 folds: Bun workspaces toolchain + CF bindings + docs (AGENTS/design/LikeC4) + hello shell.
- 02 folds: schema+migrations+seed+queries+public UI+tests+docs for catalog+hot-offers.
- 03 folds: admin auth+CRUD+image pipeline+R2+validation+e2e.
- 04 folds: SEO+perf+a11y+observability+prod deploy+runbook.
