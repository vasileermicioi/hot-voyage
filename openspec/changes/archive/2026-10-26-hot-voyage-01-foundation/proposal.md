# Proposal

## Why

No runnable project exists yet (greenfield — `openspec/specs/` is empty). Every later Hot Voyage slice (catalog, admin, launch) needs a buildable, deployable platform to build on. This change creates that foundation now so `bun install && bun test && bun run build && wrangler deploy --dry-run` succeeds and serves a themed hello shell from Workers.

## What Changes

- Bun workspaces monorepo (`apps/web` Astro app + `packages/db` Drizzle + `packages/lib` shared domain) with root and per-workspace `package.json`, strict `tsconfig.json` project references, and Bun-only scripts (`dev`, `build`, `preview`, `lint`, `typecheck`, `format`, `test`, `e2e`, `db:generate`, `db:migrate:local`, `cf:deploy:dry`).
- Cloudflare Workers wiring: `apps/web/wrangler.jsonc` (Workers + D1 + R2 bindings, local vs preview vs prod names), `.dev.vars.example`, local D1/R2 bootstrap script, Drizzle config + client + placeholder schema (no tours tables — those are step 02).
- Runtime proof: `apps/web/src/pages/index.astro` hello shell + `apps/web/src/pages/api/health.ts` returning `{ ok, env }` without secrets, via validated env helper `packages/lib/src/env.ts`.
- UI/docs baseline: `BaseLayout.astro` + `HelloCard.astro` on touristic neobrutalist tokens, `AGENTS.md`, `docs/design.md` (neobrutalism.dev adaptation), LikeC4 workspace + `docs/architecture.md`, `README.md`.
- Tests: `packages/lib/tests/env.test.ts`, `apps/web/tests/health.test.ts` (`bun:test`), root `e2e/smoke.ts` placeholder asserting home + health reachable.

## Capabilities

### New Capabilities

- `project-foundation`: Buildable, deployable platform — Bun-only toolchain, Workers+D1+R2 bindings with health proof, critical-decision docs, and touristic neobrutalist theme baseline that later slices build on.

### Modified Capabilities

None — greenfield, no existing specs to modify.

## Impact

- Affected code: all new files under `apps/web/`, `packages/db/`, `packages/lib/`, `e2e/`, `docs/`, plus root `package.json`, `AGENTS.md`, `README.md`. No existing code to migrate.
- APIs: new `GET /api/health` (non-breaking, additive); `GET /` hello shell only.
- Dependencies: pins Bun + Astro + `@astrojs/cloudflare` + Drizzle + Wrangler; no npm/pnpm/yarn, no vitest/jest/eslint.
- Systems: Cloudflare Workers + D1 + R2 (local, preview, prod bindings declared; no prod data provisioned in this slice).
