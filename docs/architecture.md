# Hot Voyage — Architecture

LikeC4 source: `docs/likec4/workspace.likec4`. Update both files in the same
change as any behavior change (see `AGENTS.md`).

## Context (C1)

Visitors browse tours and hot offers on the public site. Site admins publish
offers and upload WebP images from the browser. The system runs on Cloudflare
Workers + D1 + R2 with Astro + TypeScript + Drizzle, managed with Bun.

## Container (C2)

- **Astro edge app** (`apps/web`, `hot-voyage-web`): hybrid output on
  `@astrojs/cloudflare` — static pages + server `/api/*` routes
  (`prerender = false`). Data access only via workspace packages; mutations
  only in server endpoints.
- **D1 database** (`DB` binding): relational store via `packages/db`
  (Drizzle client + migrations in `packages/db/drizzle/`).
- **R2 image store** (`IMAGES` binding): WebP-only tour images at
  `tours/<slug>/<width>w.<ext>`.
- **Admin browser**: auth-gated studio (step 03) — CRUD forms, client-side
  resize to WebP, R2 upload. Islands only where interactive.

Request flow: browser → Workers (Astro) → `packages/lib` env/validation →
`packages/db` queries → D1; images served from R2 via public host.

## Component (C3, foundation slice)

- `apps/web/src/pages/index.astro` → `layouts/BaseLayout.astro` →
  `components/HelloCard.astro` on `styles/tokens.css`.
- `apps/web/src/pages/api/health.ts` → `probeBindings()` from
  `@hot-voyage/lib` → `{ ok, hasD1, hasR2 }`, no secrets.
- `packages/lib/src/env.ts`: `probeBindings()` (non-throwing) plus throwing
  `getDb()`/`getBucket()` for query/mutation paths.
- `packages/db/src/`: `client.ts` (`createD1Client` + `createLocalClient`
  over `bun:sqlite`), `schema.ts` (probe table; tours tables land in step 02).

ADRs live in `AGENTS.md` (stack pins, data-access/mutation rule, image/WebP
rule, CF deploy rule). Design tokens live in `docs/design.md`.
