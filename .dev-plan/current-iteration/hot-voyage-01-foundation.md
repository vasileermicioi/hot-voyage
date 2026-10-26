---

id: hot-voyage-01-foundation
title: Foundation scaffold and platform
---

# 01 - Foundation scaffold and platform

## Context & Goal

First slice of Hot Voyage parent. No runnable project exists yet (greenfield, `openspec/specs/` empty). This step creates the buildable, deployable platform every later slice builds on: Bun workspaces modular monorepo (`apps/web` Astro app + `packages/db` Drizzle + `packages/lib` shared domain), Astro + TypeScript + Bun toolchain, Cloudflare Workers + D1 + R2 bindings, Drizzle ORM config, and the three required docs (`AGENTS.md`, `design.md` neobrutalist touristic adaptation, LikeC4 architecture). Outcome in one sentence: `bun install && bun test && bun run build && wrangler deploy --dry-run` succeeds and serves a themed hello shell from Workers.

## Prerequisites & Inputs

- Parent guide: `.dev-plan/current-iteration/hot-voyage-parent-guide.md`.
- Guide: `.dev-plan/openspec_5step_proposals_guide.v3.md` (5-section + Tasks + Spec Delta layout).
- Starting point: empty repo except `.dev-plan/`, `.opencode/`, `openspec/` (config + `.gitkeep`).
- Concrete inputs:
  - Design reference: https://www.neobrutalism.dev/ (adapt, do not copy verbatim).
  - Stack decisions from `.dev-plan/prompt.txt`: astro, typescript, drizzle orm, bun for bundling/formatting/testing/e2e, cloudflare workers + d1 + r2, webp + client-side resize from admin, plus Bun workspaces modular monorepo (`apps/*`, `packages/*`).
  - LikeC4 DSL for architecture docs.
- No prior step; no domain schema yet (domain tables belong to step 02).

## Scope & Conventions

- Scope:
  - Data/infra config:
    - Root `package.json` with Bun workspaces (`workspaces: ["apps/*", "packages/*"]`, packages `@hot-voyage/db`, `@hot-voyage/lib`, app `hot-voyage-web`), `bunfig.toml` if needed for install/link behavior.
    - `packages/db/drizzle.config.ts`, `packages/db/src/client.ts`, `packages/db/src/schema.ts` (placeholder + connection helper only, no tours tables — those are 02), `packages/db/drizzle/` migrations dir + journal check-in.
    - `apps/web/wrangler.jsonc` (workers + `d1` + `r2` bindings, compat date, local vs preview vs prod names), `.dev.vars.example`, local D1/R2 dev bootstrap script.
  - Domain/toolchain:
    - `apps/web/astro.config.mjs` (`@astrojs/cloudflare` adapter, output hybrid/server as decided, image config for webp), root + per-workspace `tsconfig.json` (strict, project references), root + `apps/web/package.json` + `packages/*/package.json` bun scripts, `bunfig.toml` if needed.
    - `bun run` scripts (root orchestrates via workspaces `--filter`): `dev`, `build`, `preview`, `lint`, `typecheck` (`astro check` + `tsc --noEmit`), `format:check`/`format`, `test` (`bun test`), `e2e`, `db:generate`, `db:migrate:local`, `cf:deploy:dry`.
    - Formatting/lint baseline via Bun (Prettier or Biome + ultracite-style — record choice in AGENTS.md; no eslint+npm).
  - API/server:
    - `apps/web/src/pages/index.astro` hello shell + `apps/web/src/pages/api/health.ts` (returns `{ ok, env }` without secrets) proving Workers+D1+R2 bindings load.
    - `apps/web/src/env.d.ts`, shared runtime env helper `packages/lib/src/env.ts` (validated access to D1/R2 bindings, fails fast with helpful message).
  - UI/docs shell:
    - `apps/web/src/layouts/BaseLayout.astro`, `apps/web/src/components/HelloCard.astro` using neobrutalist tokens (thick borders, hard shadows) but touristic palette (sea/sun/sand — locked in design.md).
    - `AGENTS.md` (critical decisions: stack, commands, where mutations live, image rules, CF deploy rules).
    - `docs/design.md` (neobrutalism.dev adaptation: palette, type, spacing, components, touristic theming, a11y notes, what NOT to copy).
    - `docs/likec4/workspace.likec4` + `docs/architecture.md` (C4: context/container/component for Astro edge + D1 + R2 + admin browser; kept alongside code per host rule).
    - `README.md` (prereqs: bun + wrangler, quickstart, env setup, common commands).
  - Tests and docs:
    - `packages/lib/tests/env.test.ts` for binding validation + `apps/web/tests/health.test.ts` (`bun:test` hitting health util without cloud).
    - `e2e/smoke.ts` at root placeholder asserting home + health reachable via `bun run preview` (full e2e scenarios are 03/04).
- Conventions (host rules established here, reused by 02-04):
  - Bun-only workspaces: no `npm`/`pnpm`/`yarn`, no `vitest`/`jest`; tests `bun:test`, e2e scripts run with `bun`; root orchestrates with `bun --filter`; cross-workspace imports only via workspace names (`@hot-voyage/db`, `@hot-voyage/lib`), never relative `../../packages/*`.
  - TypeScript strict; Astro components `.astro` in `apps/web`, islands only where interactive (admin image tool, filters, countdown).
  - Data access only via `packages/db/src/*` + `packages/lib/src/*` query helpers; no raw D1 calls in `.astro` pages; mutations only in server endpoints/actions (admin), never in render path.
  - Images: WebP-only for new uploads (decided here, enforced in 03); R2 key layout reserved: `tours/<slug>/<width>w.<ext>`.
  - Architecture docs move with code: LikeC4 + `AGENTS.md` + `design.md` updated in same PR as behavior change.
- Out of scope (belongs to later steps, not next layer of this slice):
  - Tours/offers tables, catalog UI, hot-deal logic (02).
  - Admin auth/CRUD/image pipeline (03).
  - SEO/sitemap, perf tuning, prod data/bucket provisioning, observability (04).

## Deliverables & Verification

- Deliverables:
  - Runnable scaffold: `package.json` (workspaces), `apps/web/astro.config.mjs`, `apps/web/wrangler.jsonc`, `packages/db/drizzle.config.ts`, `packages/db/src/*`, `apps/web/src/pages/*`, `apps/web/src/layouts/*`, `packages/lib/src/env.ts`.
  - Docs: `AGENTS.md`, `docs/design.md`, `docs/likec4/*`, `docs/architecture.md`, `README.md`.
  - Scripts + tests: root + per-workspace `package.json` bun scripts, `apps/web/tests/*`, `packages/*/tests/*`, `e2e/smoke.ts`.
- Verification:
  1. `bun install` — exits 0, no npm lockfile created.
  2. `bun run lint` — exits 0.
  3. `bun run typecheck` (`astro check` + `tsc --noEmit`) — exits 0.
  4. `bun test` — all pass (health + env tests).
  5. `bun run build` — exits 0, outputs to `dist/`.
  6. `bunx wrangler deploy --dry-run` (or `bun run cf:deploy:dry`) — exits 0, shows workers + d1 + r2 bindings.
  7. Manual: `bun run dev` serves hello shell with touristic neobrutalist card; `/api/health` returns ok.

## Cross-references

- Depends on: none (first step).
- Consumed by: `hot-voyage-02-catalog` (uses toolchain, bindings, docs, layout tokens to build catalog).
- Parent guide: `.dev-plan/current-iteration/hot-voyage-parent-guide.md`

## Tasks

### Setup

- [ ] Read this step plan end-to-end plus parent guide release criteria/non-goals.
- [ ] Confirm greenfield state (`openspec/specs/` only `.gitkeep`, no scaffold yet).
- [ ] Record open decisions (admin auth default, R2 key layout, image widths) as provisional in AGENTS.md.

### Implementation

Work top to bottom. These groups are one proposal. Do not stop after a group and open a new step file.

#### Data

- [ ] Add root `package.json` with `workspaces: ["apps/*", "packages/*"]`, `packages/db/package.json` (`@hot-voyage/db`), `packages/lib/package.json` (`@hot-voyage/lib`), `apps/web/package.json`.
- [ ] Add `packages/db/drizzle.config.ts` (D1 driver, schema path `packages/db/src/schema.ts`, out `packages/db/drizzle/`).
- [ ] Add `packages/db/src/client.ts` (creates Drizzle client from Workers D1 binding + local fallback for `bun run dev`/`bun test`).
- [ ] Add `packages/db/src/schema.ts` placeholder with health-check helper table or `SELECT 1` probe only; document that tours tables are 02.
- [ ] Add `apps/web/wrangler.jsonc` with `name: hot-voyage`, `compatibility_date`, `d1_databases` (dev/preview/prod), `r2_buckets` (dev/prod + images), `assets`/adapter binding; add `.dev.vars.example`.
- [ ] Add `scripts/bootstrap-dev.sh` or `scripts/bootstrap-dev.ts` (`bun`-runnable) creating local D1 DB + R2 dir + applying empty baseline.

#### Domain

- [ ] Add `apps/web/astro.config.mjs` with `@astrojs/cloudflare`, `output` decision documented, `image.domains`/`remotePatterns` for R2 public host; wire workspace imports (`@hot-voyage/db`, `@hot-voyage/lib`).
- [ ] Add root + per-workspace `tsconfig.json` strict + `apps/web/src/env.d.ts` + `packages/lib/src/env.ts` (typed `getDb`/`getBucket`, throws actionable error when binding missing).
- [ ] Add root `package.json` with bun-only workspace scripts: `dev, build, preview, lint, typecheck, format, format:check, test, e2e, db:generate, db:migrate:local, cf:deploy:dry` delegating via `bun --filter`.
- [ ] Add formatter/linter config (Prettier or Biome) runnable via `bun run format`; document choice + why in AGENTS.md.
- [ ] Add `AGENTS.md` covering: stack pins, workspace layout + import rules, every command, architecture-doc rule, data-access/mutation rule, image/WebP rule, CF deploy rule, definition of done.

#### API

- [ ] Add `apps/web/src/pages/api/health.ts` returning `{ ok: true, hasD1, hasR2 }` without leaking secrets; uses `packages/lib/src/env.ts`.
- [ ] Wire local preview (`bun run preview` + `wrangler dev` path from `apps/web`) so health works with local bindings.

#### UI

- [ ] Add `apps/web/src/layouts/BaseLayout.astro` (html shell, fonts, CSS vars import, slot).
- [ ] Add global CSS/tokens `apps/web/src/styles/tokens.css` (touristic neobrutalist: border 3px, hard shadow 6px, radius small, palette sea/sun/sand + ink; focus-visible styles).
- [ ] Add `apps/web/src/pages/index.astro` hello shell (`HelloCard` with Hot Voyage name, stack list, links to health + docs).
- [ ] Add `apps/web/src/components/HelloCard.astro` demonstrating tokens (do not build catalog cards here).
- [ ] Add `docs/design.md` (neobrutalism.dev delta: what kept/changed, full token table, type scale, button/card/badge patterns, touristic examples, a11y contrast notes).
- [ ] Add `docs/likec4/workspace.likec4` (persons, Astro edge, D1, R2, admin browser) + `docs/architecture.md` (C4 diagrams rendered/linked, ADRs pointer to AGENTS.md).
- [ ] Add `README.md` (prereqs bun+wrangler, `bun install`, env copy, bootstrap, dev/build/test/deploy commands).

#### Tests and docs

- [ ] Add `apps/web/tests/health.test.ts` (bun:test, health shape without network/cloud).
- [ ] Add `packages/lib/tests/env.test.ts` (missing-binding error message, valid-binding path with stub).
- [ ] Add `e2e/smoke.ts` (starts preview or hits dev URL, asserts `/` contains Hot Voyage and `/api/health` ok; skips gracefully when server not running with clear message).
- [ ] Run `bun test` after Data+Domain, again after UI; fix before proceeding.
- [ ] Update `openspec/specs/` or host canonical spec index if host requires a foundation entry (otherwise note "no behavior spec yet" in README).

### Validation

- [ ] Run every verification command in Deliverables & Verification; capture outputs.
- [ ] Walk user-visible path: home renders themed card, health endpoint ok, no console errors.
- [ ] Confirm no `package-lock.json`/`node_modules` committed, no secrets in repo, `.dev.vars` gitignored.
- [ ] Prepare PR/handoff linking change ID `hot-voyage-01-foundation` and parent guide.

### Cleanup

- [ ] Update parent guide to mark 01 done (or note in PR).
- [ ] Update canonical spec index if foundation behavior added.
- [ ] Record any new convention discovered (e.g., wrangler version pin) back into AGENTS.md.

## Spec Delta: project-foundation

```markdown
# project-foundation - Spec Delta

## ADDED Requirements

### Requirement: Bun-only toolchain

The system SHALL provide a Bun-only workspaces local workflow (`apps/web`, `packages/db`, `packages/lib`) for install, dev, build, format, test, and e2e without requiring npm/vitest/jest.

#### Scenario: Fresh clone builds

- **WHEN** a developer runs `bun install` then `bun run build` on a clean checkout
- **THEN** workspaces link (`@hot-voyage/db`, `@hot-voyage/lib`) with no npm lockfile and the Astro site builds to `dist/` with exit 0

### Requirement: Edge hosting bindings

The system SHALL run on Cloudflare Workers with declared D1 and R2 bindings for local, preview, and production environments.

#### Scenario: Health proves bindings

- **WHEN** a client requests `/api/health` with bindings configured
- **THEN** the response is `{ ok: true }` and indicates D1/R2 availability without exposing secrets

### Requirement: Documented critical decisions

The system SHALL maintain `AGENTS.md` with stack, commands, data-access, image, and deploy rules updated alongside code changes.

#### Scenario: Agent onboarding

- **WHEN** a new agent reads `AGENTS.md` and `README.md`
- **THEN** they can run dev, typecheck, tests, and dry-run deploy without asking for missing commands

### Requirement: Touristic neobrutalist theme baseline

The system SHALL define touristic design tokens and LikeC4 architecture docs as the baseline for all later UI and data work.

#### Scenario: Themed shell

- **WHEN** a visitor opens `/`
- **THEN** they see a Hot Voyage card using the touristic neobrutalist tokens and layout documented in `docs/design.md`
```
