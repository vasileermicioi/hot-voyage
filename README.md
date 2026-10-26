# Hot Voyage

Touristic tours website for "hot offers" — time-boxed, discounted tours with
bold neobrutalist cards. Runs on Cloudflare Workers + D1 + R2 with
Astro + TypeScript + Drizzle, managed with Bun.

## Prerequisites

- [Bun](https://bun.sh) 1.4.x
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 4.x
  (`bunx wrangler` works without a global install)

## Quickstart

```sh
bun install
cp apps/web/.dev.vars.example apps/web/.dev.vars   # local-only secrets
bun scripts/bootstrap-dev.ts                        # local D1 + R2 stub
bun run dev                                         # http://localhost:4321
```

## Commands

| Task              | Command                          |
| ----------------- | -------------------------------- |
| Dev               | `bun run dev`                    |
| Typecheck         | `bun run typecheck`              |
| Lint              | `bun run lint`                   |
| Format            | `bun run format`                 |
| Tests             | `bun test`                       |
| E2E smoke         | `bun run e2e` (needs preview up) |
| Build             | `bun run build`                  |
| Build (remote DB) | `bun run build:remote`           |
| Preview           | `bun run preview`                |
| DB generate       | `bun run db:generate`            |
| DB migrate local  | `bun run db:migrate:local`       |
| DB migrate remote | `bun run db:migrate:remote`      |
| Deploy dry-run    | `bun run cf:deploy:dry`          |

## Env setup

- Local bindings are declared in `apps/web/wrangler.jsonc`
  (`hot-voyage-dev` D1, `hot-voyage-images-dev` R2).
- Copy `.dev.vars.example` to `.dev.vars` for local secrets (gitignored).
- Preview/prod bindings use the `preview` / `production` envs in the same file.
  Prod D1/R2 ids are provisioned in step 04.

## Catalog data (D1)

```sh
bun run db:generate        # after editing packages/db/src/schema.ts
bun run db:migrate:local   # apply to local D1 (wrangler --local)
bun run db:seed:local      # idempotent seed: 10 tours, 4 active hot offers
```

- Seed is **local-only and idempotent** (upsert by slug; safe to re-run).
- **Never auto-seed prod.** Remote seed is a manual, reviewed command owned by
  step 04 (launch): apply migrations with
  `wrangler d1 migrations apply hot-voyage-prod --remote`, then run a reviewed
  seed explicitly — CI never seeds prod.
- Browse: `/` (hot rail) → `/tours` (filters) → `/tours/<slug>` (detail + inquiry).
- APIs: `GET /api/tours`, `POST /api/inquiries`, `GET /api/health`.

## First remote deploy (one-time, manual)

Wrangler auto-provisions KV/R2 on deploy, but **not D1**. The deploy fails
with `D1 binding 'DB' references database '0000…' which was not found` until
the database exists. Run once from a machine logged into the right account
(`bunx wrangler login`):

```sh
cd apps/web && bunx wrangler d1 create hot-voyage-dev   # copy database_id
# paste database_id into the top-level d1_databases entry in apps/web/wrangler.jsonc
git add apps/web/wrangler.jsonc && git commit -m "chore: set remote hot-voyage-dev D1 id" && git push
```

Schema migration runs automatically from then on: the dashboard **build
command** is `bun run build:remote`, which applies `db:migrate:remote`
(remote D1) before `bun run build`, on every deploy. Local `bun run build`
stays credential-free.

The dashboard build then redeploys green. The remote catalog starts empty
(local seed never touches prod) — content arrives via the step-03 admin.

## Project layout

```text
apps/web/       Astro site (pages, api/*, layouts, components, styles)
packages/db/    Drizzle client, schema, migrations (D1)
packages/lib/   Shared domain: env/binding helpers
scripts/        Local bootstrap (bun-runnable)
e2e/            Preview smoke test
docs/           design.md, architecture.md, likec4/
openspec/       Specs and change proposals
```

Cross-workspace imports only via `@hot-voyage/db` / `@hot-voyage/lib`.
See `AGENTS.md` for the full rule set.
