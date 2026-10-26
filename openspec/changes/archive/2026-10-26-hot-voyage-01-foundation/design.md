# Design

## Context

Greenfield repo: only `.dev-plan/`, `.opencode/`, `openspec/` (config + `.gitkeep`) exist. Parent guide (`hot-voyage-parent-guide.md`) fixes the stack (Astro + TS + Bun + Cloudflare Workers/D1/R2 + Drizzle + WebP + client-side resize) and the 4-slice dependency chain (01 → 02 → 03 → 04). Step 02 needs D1 schema tooling, workspace imports, and layout tokens to exist; step 03 needs the R2 key layout and env-helper pattern. See `proposal.md` for motivation.

Constraints: Bun-only (no npm/vitest/jest/eslint); cross-workspace imports only via `@hot-voyage/db`, `@hot-voyage/lib`; data access only via `packages/db` + `packages/lib`; mutations only in server endpoints; WebP-only for new uploads with R2 key layout `tours/<slug>/<width>w.<ext>` reserved now, enforced in 03.

## Goals / Non-Goals

**Goals:**

- One-command verifiable platform: `bun install && bun test && bun run build && wrangler deploy --dry-run` all exit 0.
- Local-first edge parity: health endpoint proves D1/R2 bindings load locally without cloud credentials.
- Decision durability: `AGENTS.md` + `docs/design.md` + LikeC4 capture every host rule once so slices 02–04 reference instead of re-deciding.

**Non-Goals:**

- No tours/offers schema, catalog UI, or hot-deal logic (02).
- No admin auth/CRUD/image pipeline (03).
- No SEO/sitemap, perf tuning, prod bucket provisioning, or observability (04).
- No design-system expansion beyond the neobrutalism.dev adaptation tokens.

## Decisions

### 1. Bun workspaces layout (`apps/web`, `packages/db`, `packages/lib`)

Use Bun workspaces with `workspaces: ["apps/*", "packages/*"]`, packages `@hot-voyage/db` and `@hot-voyage/lib`, app `hot-voyage-web`. Root scripts orchestrate via `bun --filter`. Cross-workspace imports only via workspace names, never relative `../../packages/*`.

- Alternative considered: single-package Astro app with colocated `src/db`. Rejected — slices 02/03 need a shared query layer importable from pages, endpoints, tests, and scripts without path coupling.
- Alternative considered: pnpm/turborepo. Rejected — parent mandates Bun-only; extra orchestrator adds install friction.

### 2. Astro with `@astrojs/cloudflare`, hybrid output

`apps/web/astro.config.mjs` uses the Cloudflare adapter with hybrid output (static shell + server `/api/*` routes). Image config targets WebP; R2 public host wired via `image.remotePatterns`.

- Alternative considered: full `output: "server"`. Rejected — hello shell and later catalog pages benefit from prerendering; hybrid keeps API routes server-rendered while allowing static pages.
- Alternative considered: `wrangler.toml` over `wrangler.jsonc`. Chose `jsonc` — matches current Wrangler default, allows comments for local vs preview vs prod binding names.

### 3. Drizzle D1 client with local fallback

`packages/db/drizzle.config.ts` points at `packages/db/src/schema.ts` with out dir `packages/db/drizzle/`. `packages/db/src/client.ts` builds the Drizzle client from the Workers D1 binding, with a local-file/minimal fallback for `bun run dev` / `bun test`. `schema.ts` holds only a placeholder/probe (no tours tables — 02 owns them).

- Alternative considered: full schema now. Rejected — domain tables belong to 02 with seed/queries; a placeholder keeps the migration journal valid without speculative columns.

### 4. Validated env helper in `packages/lib/src/env.ts`

Single typed `getDb()` / `getBucket()` accessor that throws an actionable missing-binding error. `health.ts` and all later endpoints go through it; no raw `env.DB` access in `.astro` pages.

- Alternative considered: per-route env checks. Rejected — duplicates error text and leaks binding-name drift across routes.

### 5. Biome for format + lint via Bun

Use Biome (single binary, `bunx @biomejs/biome`) for `lint`, `format`, `format:check`; record the choice and why in `AGENTS.md`. No eslint, no Prettier, no npm scripts.

- Alternative considered: Prettier + eslint. Rejected — two tools, npm-centric plugins, slower; Biome covers format+lint in one Bun-runnable binary.

### 6. Tokens in CSS vars + LikeC4 alongside code

`apps/web/src/styles/tokens.css` holds the touristic neobrutalist tokens (3px borders, 6px hard shadows, small radius, sea/sun/sand + ink, focus-visible styles). `docs/likec4/workspace.likec4` models persons, Astro edge, D1, R2, admin browser; `docs/architecture.md` renders the C4 views. Docs live in-repo and update in the same change as behavior.

- Alternative considered: Tailwind theme extension only. Rejected — raw CSS vars make the token table in `docs/design.md` auditable without framework indirection for the a11y contrast pass in 04.

### 7. Bootstrap as `bun`-runnable TypeScript

`scripts/bootstrap-dev.ts` (not `.sh`) creates the local D1 DB + R2 dir and applies the empty baseline, so Windows/macOS/Linux all run `bun scripts/bootstrap-dev.ts`.

## Risks / Trade-offs

- [Risk] D1 local vs remote drift → Mitigation: `db:migrate:local` uses `wrangler d1 migrations apply --local`; remote apply documented for 04; CI runs the same journal.
- [Risk] R2 public dev vs prod CORS/caching mismatch → Mitigation: binding names per environment in `wrangler.jsonc`; CORS/caching verified in 03/04, not assumed here.
- [Risk] Neobrutalism a11y (heavy borders, hard shadows, contrast) → Mitigation: tokens include focus-visible + contrast notes; full audit deferred to 04 where tokens are already centralized.
- [Risk] `@astrojs/cloudflare` / Wrangler version drift → Mitigation: pin versions in `apps/web/package.json`, record pin in `AGENTS.md` on first install.
- [Risk] Hybrid-output misconfiguration serves API as static → Mitigation: `e2e/smoke.ts` asserts `/api/health` over preview; prerender flags explicit per page.

## Migration Plan

No migration — greenfield, additive only. Deploy path: `bun run build` then `bunx wrangler deploy --dry-run` (no real deploy in this slice). Rollback: delete scaffolded files; no data to migrate. Prod D1/R2 provisioning happens in 04.

## Open Questions

- OQ1 (deferrable to 03): Admin auth method — default is Cloudflare Access in prod + env-gated basic session in dev; recorded as provisional in `AGENTS.md`, implemented in 03.
- OQ2 (deferrable to 03/04): Exact image widths/breakpoints — R2 key layout reserved now, sizes locked in the 04 perf pass.
