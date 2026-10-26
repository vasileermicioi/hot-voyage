# AGENTS.md — Hot Voyage

Critical decisions for agents working in this repo. Read this before changing code.

## Stack (pinned)

- Runtime/toolchain: **Bun 1.4.x** — install, dev, build, format, test, e2e all run with `bun`. Never use `npm`/`pnpm`/`yarn`, `vitest`/`jest`, or `eslint`.
- Site: **Astro 7.4.2** + `@astrojs/cloudflare 14.4.2` (`output: "hybrid"`), TypeScript 5.9 strict.
- Data: **Drizzle ORM 0.45.4** (+ `drizzle-kit 0.31.11`) on Cloudflare **D1**; objects in Cloudflare **R2**.
- Deploy: **Wrangler 4.153.0** (`apps/web/wrangler.jsonc`). Lint/format: **Biome 2.6.3** (`bunx @biomejs/biome`).
- Why Biome: single binary covering format+lint, Bun-runnable, no npm-plugin ecosystem needed. (Prettier+eslint rejected: two tools, npm-centric, slower.)

## Workspace layout + import rules

- Bun workspaces: `apps/web` (Astro app, package `hot-voyage-web`), `packages/db` (`@hot-voyage/db`), `packages/lib` (`@hot-voyage/lib`).
- Cross-workspace imports **only** via workspace names (`@hot-voyage/db`, `@hot-voyage/lib`). Never relative `../../packages/*`.
- Astro components live in `apps/web`; islands only where interactive (admin image tool, filters, countdowns).
- Root orchestrates via `bun --filter <package> <script>`.

## Commands

| Task              | Command                                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| Install           | `bun install`                                                                  |
| Dev               | `bun run dev`                                                                  |
| Typecheck         | `bun run typecheck`                                                            |
| Lint              | `bun run lint`                                                                 |
| Format            | `bun run format`                                                               |
| Tests             | `bun test`                                                                     |
| E2E smoke         | `bun run e2e` (needs preview up)                                               |
| Build             | `bun run build`                                                                |
| Build (remote DB) | `bun run build:remote` (migrates remote D1, then builds; needs wrangler login) |
| Preview           | `bun run preview`                                                              |
| DB generate       | `bun run db:generate`                                                          |
| DB migrate local  | `bun run db:migrate:local`                                                     |
| Deploy dry-run    | `bun run cf:deploy:dry`                                                        |
| Bootstrap local   | `bun scripts/bootstrap-dev.ts`                                                 |

Copy `.dev.vars.example` to `.dev.vars` (gitignored) for local secrets. Never commit `.dev.vars`, `package-lock.json`, or `node_modules`.

## Architecture-doc rule

Architecture docs move with code: LikeC4 (`docs/likec4/`) + `docs/architecture.md` + `docs/design.md` update in the **same change** as the behavior change. New behavior without doc updates is incomplete.

## Data-access / mutation rule

- Data access only via `packages/db/src/*` + `packages/lib/src/*` query helpers. No raw D1 calls in `.astro` pages.
- Mutations only in server endpoints/actions (admin), never in render path.
- Env bindings only via `packages/lib/src/env.ts` (`getDb`/`getBucket`); fails fast with an actionable message when a binding is missing.

## Image / R2 rule

- **WebP-only** for new uploads (enforced from step 03; decided here).
- R2 key layout reserved: `tours/<slug>/<width>w.<ext>`.
- R2 public host wired via Astro `image.remotePatterns`; verify CORS/caching per environment in 03/04.

## Cloudflare deploy rule

- Bindings declared in `apps/web/wrangler.jsonc` for local / preview / prod (`hot-voyage-dev`, `hot-voyage-preview`, `hot-voyage-prod` DBs; dev/prod R2 buckets).
- Local: `wrangler d1 migrations apply --local`. Remote: `bun run build:remote` migrates the remote D1 before every build (dashboard build command); one-time `wrangler d1 create` + id paste stays manual. Dry-run gate: `bun run cf:deploy:dry` must show workers + d1 + r2 bindings.

## Definition of done

`bun run lint`, `bun run typecheck`, `bun test`, `bun run build`, `bun run cf:deploy:dry` all exit 0; home renders the themed card; `/api/health` returns ok; no secrets in repo.

## Provisional decisions (locked by later steps)

- **OQ1 admin auth** (default, confirm in 03): Cloudflare Access in prod + env-gated basic session in dev.
- **OQ2 image widths** (default, locked in 04 perf pass): key layout reserved now, exact breakpoints later.
