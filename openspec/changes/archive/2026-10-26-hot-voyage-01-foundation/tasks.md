# Tasks

## 1. Workspace scaffold and toolchain

- [x] 1.1 Add root `package.json` (workspaces `apps/*`, `packages/*`) plus `apps/web`, `packages/db` (`@hot-voyage/db`), `packages/lib` (`@hot-voyage/lib`) manifests with Bun-only scripts (`dev`, `build`, `preview`, `lint`, `typecheck`, `format`, `format:check`, `test`, `e2e`, `db:generate`, `db:migrate:local`, `cf:deploy:dry`) and verify `bun install` exits 0 with no npm lockfile
- [x] 1.2 Add root + per-workspace strict `tsconfig.json` (project references), `bunfig.toml` if needed, and Biome config, and verify `bun run lint` and `bun run typecheck` exit 0 on the empty scaffold
- [x] 1.3 Add `apps/web/astro.config.mjs` (`@astrojs/cloudflare`, hybrid output, WebP image config, workspace aliases) and verify `bun run build` emits `dist/` with exit 0
- [x] 1.4 Document toolchain choice (Biome + why, Bun-only rules, workspace import rule) in `AGENTS.md` and verify a fresh reader can run install/build from the doc alone

## 2. Data and edge bindings

- [x] 2.1 Add `packages/db/drizzle.config.ts`, `packages/db/src/client.ts` (D1 binding + local fallback), `packages/db/src/schema.ts` placeholder/probe only, and `packages/db/drizzle/` journal, and verify `bun run db:generate && bun run db:migrate:local` exit 0
- [x] 2.2 Add `apps/web/wrangler.jsonc` (Workers + D1 + R2 bindings for local/preview/prod, compat date), `.dev.vars.example` (gitignored `.dev.vars`), and verify `bun run cf:deploy:dry` shows workers + d1 + r2 bindings with exit 0
- [x] 2.3 Add `scripts/bootstrap-dev.ts` (creates local D1 + R2 dir + applies baseline) and `packages/lib/src/env.ts` (`getDb`/`getBucket`, actionable missing-binding error), and verify `bun scripts/bootstrap-dev.ts` then `bun test packages/lib/tests/env.test.ts` pass
- [x] 2.4 Add `packages/lib/tests/env.test.ts` (missing-binding error text, valid-binding stub path) and verify `bun test` passes for the lib workspace

## 3. Health API

- [x] 3.1 Add `apps/web/src/pages/api/health.ts` returning `{ ok: true, hasD1, hasR2 }` via `env.ts` with no secrets, plus `apps/web/src/env.d.ts`, and verify response shape with `bun test apps/web/tests/health.test.ts`
- [x] 3.2 Wire local preview (`bun run preview` / wrangler dev path from `apps/web`) so health works with local bindings, and verify `curl localhost:<preview-port>/api/health` returns ok
- [x] 3.3 Add `apps/web/tests/health.test.ts` (`bun:test`, no network/cloud) and verify `bun test` passes across workspaces

## 4. Hello shell UI and docs baseline

- [x] 4.1 Add `apps/web/src/styles/tokens.css` (touristic neobrutalist: 3px borders, 6px hard shadows, small radius, sea/sun/sand + ink, focus-visible) + `BaseLayout.astro` shell, and verify `bun run build` still exits 0 with tokens applied
- [x] 4.2 Add `index.astro` hello shell + `HelloCard.astro` (Hot Voyage name, stack list, links to health + docs; no catalog cards) and verify `bun run dev` renders the card with no console errors
- [x] 4.3 Write `docs/design.md` (neobrutalism.dev delta: kept/changed, token table, type scale, button/card/badge patterns, touristic examples, a11y contrast notes, what NOT to copy) and verify token values match `tokens.css`
- [x] 4.4 Write `docs/likec4/workspace.likec4` (persons, Astro edge, D1, R2, admin browser) + `docs/architecture.md` (C4 context/container/component) and verify LikeC4 file parses/renders without errors
- [x] 4.5 Write `README.md` (prereqs bun+wrangler, install, env copy, bootstrap, dev/build/test/deploy commands) and finish `AGENTS.md` (stack pins, commands, data-access/mutation, image/WebP + R2 key layout reserved, CF deploy, DoD, provisional OQ1/OQ2 notes), and verify every documented command runs as written

## 5. Smoke test and release verification

- [x] 5.1 Add `e2e/smoke.ts` (hits `/` for Hot Voyage text + `/api/health` ok over preview/dev URL, graceful skip with clear message when server not running) and verify `bun run e2e` passes with preview up and skips cleanly with it down
- [x] 5.2 Run full gate `bun install`, `bun run lint`, `bun run typecheck`, `bun test`, `bun run build`, `bun run cf:deploy:dry` and verify each exits 0, capturing outputs
- [x] 5.3 Walk user-visible path (home themed card, `/api/health` ok, no console errors), confirm no `package-lock.json`/`node_modules`/secrets committed and `.dev.vars` gitignored, and verify handoff notes change ID `hot-voyage-01-foundation` plus parent guide link
