---

id: hot-voyage-03-admin
title: Admin studio and image pipeline
---

# 03 - Admin studio and image pipeline

## Context & Goal

Third slice. Catalog (02) is read-only with seeded data; no way to publish or upload. This step ships the full admin capability end to end: auth-gated dashboard, tour/offer CRUD + publish flow, and the required client-side image pipeline (browser resize -> WebP -> R2) with validation and e2e. Outcome in one sentence: an admin can create/edit/publish a hot offer and upload resized WebP images from the browser that immediately appear in the public catalog.

## Prerequisites & Inputs

- Steps `hot-voyage-01-foundation` and `hot-voyage-02-catalog` merged and marked done.
- Artifacts that must exist: `packages/db/src/schema.ts` + `queries.ts`, `packages/lib/src/validation.ts`, `packages/lib/src/images.ts`, `apps/web/wrangler.jsonc` R2 binding, `AGENTS.md` auth/image conventions (provisional decisions from 01/02 now locked here).
- Concrete inputs: admin auth decision (default: Cloudflare Access in prod + env-secret session in dev), R2 key layout `tours/<slug>/<width>w.webp`, target widths (default 480/800/1200w), WebP quality default.

## Scope & Conventions

- Scope:
  - Data:
    - Migrations only if needed (`packages/db/drizzle/0003_*.sql`): admin users/sessions or `publishedBy/publishedAt` audit columns, image metadata (`width,height,bytes,format`), status transitions; no redesign of 02 tables.
    - `packages/db/src/admin-queries.ts` (paginated admin list with drafts, audit trail helpers, inquiry inbox list).
  - Domain:
    - `packages/lib/src/admin-auth.ts` (session/Access verification, role gate `admin`, dev bypass guarded by env), `packages/lib/src/admin-validation.ts` (tour/offer create/update schemas reusing 02 validation + publish rules: hot requires discount+window+featured+cover image).
    - `packages/lib/src/image-pipeline.ts` shared constants (widths, quality, max source MB, allowed MIME) used by both browser resizer and server verifier.
  - API/server:
    - `apps/web/src/pages/api/admin/tours.ts` (POST create, PATCH update, POST publish/unpublish/archive), `apps/web/src/pages/api/admin/uploads.ts` (presigned/direct-upload init + complete with server-side WebP/size verification + R2 put), `apps/web/src/pages/api/admin/inquiries.ts` (GET inbox, PATCH mark read).
    - Auth middleware `apps/web/src/middleware.ts` or `packages/lib/src/admin-guard.ts` protecting `/admin/*` + `/api/admin/*` (401/403 JSON + redirect for pages).
  - UI:
    - `apps/web/src/pages/admin/login.astro`, `apps/web/src/pages/admin/index.astro` (dashboard: drafts/pending-hot/inquiries), `apps/web/src/pages/admin/tours/[id].astro` (edit form: pricing, hot window, seats, itinerary, SEO slug), `apps/web/src/pages/admin/tours/new.astro`.
    - Islands: `AdminTourForm.tsx` (draft autosave, publish checklist), `ImageUploader.tsx` (file pick -> `createImageBitmap`/canvas resize -> `canvas.toBlob('image/webp')` -> multi-width -> progress -> preview -> upload; rejects oversized/non-image with message; JPEG fallback path when WebP encode unavailable and flagged to server).
    - `apps/web/src/components/admin/*`: `StatusPill`, `PublishChecklist`, `InquiryInbox` (read/unread).
  - Tests and docs:
    - `packages/lib/tests/admin-validation.test.ts`, `packages/lib/tests/admin-auth.test.ts`, `apps/web/tests/admin-api.test.ts` (authz matrix: anon/user/admin; publish-rule rejections), `packages/lib/tests/image-pipeline.test.ts` (server verifier: format/dims/bytes).
    - `e2e/admin.ts` (bun e2e: login -> create draft -> upload image client-resized WebP -> publish -> visible on public detail; invalid publish blocked with messages).
    - Update `AGENTS.md` (lock auth + image decisions), `docs/design.md` (admin form patterns if new), LikeC4 (admin actor + upload flow), `README.md` (admin URLs + R2 CORS notes).
- Conventions:
  - Bun workspaces; strict TS; data via `packages/db/src/*`; domain via `packages/lib/src/*`; mutations only in `apps/web/src/pages/api/admin/*` + actions, never in render.
  - Client-side resizing mandatory for new uploads (originals never uploaded); server re-verifies MIME/dims/bytes and rejects non-WebP except documented fallback.
  - R2 keys immutable per width (`.../<width>w.webp` + content-hash or version); public catalog reads via `packages/lib/src/images.ts` builder from 02.
  - No secrets in client bundle; upload init returns short-lived scoped token/URL only after auth.
- Out of scope:
  - Public catalog redesign, pricing engine changes beyond publish rules (that was 02).
  - SEO/perf budgets, prod bucket provisioning, observability dashboards (04).
  - Bulk import, rich-text editor beyond textarea/markdown-lite, multi-admin roles.

## Deliverables & Verification

- Deliverables:
  - Auth gate + admin pages + components/islands above.
  - Admin APIs + image pipeline (browser resizer + server verifier + R2 put).
  - Tests + e2e + doc updates (AGENTS/design/LikeC4/README).
- Verification:
  1. `bun run lint` — exits 0
  2. `bun run typecheck` — exits 0
  3. `bun test` — all pass including admin + image tests
  4. `bun run build` — exits 0
  5. `bun run e2e -- admin` — login, create, WebP-resized upload (assert output MIME `image/webp` + widths), publish, public visibility, invalid-publish blocked

## Cross-references

- Depends on: `hot-voyage-02-catalog` (and transitively `01-foundation`).
- Consumed by: `hot-voyage-04-launch` (hardens admin + public paths, ships prod with R2/CORS/caching verified).
- Parent guide: `.dev-plan/current-iteration/hot-voyage-parent-guide.md`

## Tasks

### Setup

- [ ] Read this step plan end-to-end plus parent guide non-goals.
- [ ] Confirm 02 artifacts exist (schema, queries, validation, image URL builder, catalog pages).
- [ ] Lock auth + image constants (widths, quality, limits, key layout); record in AGENTS.md before coding UI.

### Implementation

Work top to bottom. These groups are one proposal. Do not stop after a group and open a new step file.

#### Data

- [ ] Add `packages/db/drizzle/0003_*.sql` only if audit/session columns needed; otherwise document "no migration" with reason.
- [ ] Add `packages/db/src/admin-queries.ts` (admin list incl. drafts, `getAdminTour`, inquiry inbox queries, publish audit writer).
- [ ] Add R2 CORS/dev notes (`scripts/r2-cors.local.json` + README snippet) without committing secrets.

#### Domain

- [ ] Add `packages/lib/src/admin-auth.ts` (verify Access JWT in prod / signed session cookie in dev, `requireAdmin`, dev-guard that refuses prod bypass).
- [ ] Add `packages/lib/src/admin-validation.ts` (create/update/publish schemas; hot-publish requires: discount>0, valid window future-dated, seats>0, cover image WebP key, slug unique).
- [ ] Add `packages/lib/src/image-pipeline.ts` constants + server verifier (`assertWebPUpload`: magic bytes, dims via decoder, byte cap).

#### API

- [ ] Add `apps/web/src/middleware.ts` or `packages/lib/src/admin-guard.ts` enforcing auth on `/admin/*` + `/api/admin/*`.
- [ ] Add `POST/PATCH apps/web/src/pages/api/admin/tours.ts` (create/update with validation, slug collision 409, audit write).
- [ ] Add `POST apps/web/src/pages/api/admin/tours/publish.ts` (or action param): state machine draft->published->archived with rule checks + 422 + field errors.
- [ ] Add `apps/web/src/pages/api/admin/uploads.ts` init + complete: authed init returns upload URL/token + expected keys; complete verifies WebP/dims then R2 put + writes `tour_images` rows.
- [ ] Add `GET/PATCH apps/web/src/pages/api/admin/inquiries.ts` inbox (auth required, pagination).

#### UI

- [ ] Add `apps/web/src/pages/admin/login.astro` (Access hint in prod + dev form; error states; no signup link).
- [ ] Add `apps/web/src/pages/admin/index.astro` dashboard (counts, drafts needing cover, hot ending soon, unread inquiries; links to new/edit).
- [ ] Add `apps/web/src/pages/admin/tours/new.astro` + `apps/web/src/pages/admin/tours/[id].astro` hosting `AdminTourForm` island (sections: basics, pricing/hot window, inventory, itinerary, images, SEO; inline errors; publish checklist blocking publish until green).
- [ ] Add `ImageUploader.tsx` island: drag/drop+pick, client resize via `createImageBitmap` + canvas to widths, `toBlob('image/webp', quality)`, per-file progress, previews, retry; shows "resized in browser → WebP" proof (dims/bytes before/after); JPEG fallback with server flag when WebP unsupported.
- [ ] Add admin components (`StatusPill`, `PublishChecklist`, `InquiryInbox`) styled per design.md; ensure keyboard + focus + labels.
- [ ] Wire post-publish link ("view public tour") proving catalog visibility without manual DB check.

#### Tests and docs

- [ ] Add `packages/lib/tests/admin-validation.test.ts` (publish-rule matrix: missing discount/window/image/slug).
- [ ] Add `packages/lib/tests/admin-auth.test.ts` (anon->401/redirect, non-admin->403, admin->pass, dev bypass refused in prod env).
- [ ] Add `apps/web/tests/admin-api.test.ts` (CRUD + publish transitions + inquiry inbox authz).
- [ ] Add `packages/lib/tests/image-pipeline.test.ts` (accept valid WebP set, reject PNG-as-webp/oversize/wrong dims).
- [ ] Add `e2e/admin.ts` bun e2e covering login->draft->resized WebP upload->publish->public detail shows new image + badge.
- [ ] Update `AGENTS.md` (final auth + image rules), `docs/design.md` only if new admin patterns, LikeC4 upload sequence, `README.md` admin runbook snippet.
- [ ] Run `bun test` after each major area.

### Validation

- [ ] Run every verification command in Deliverables & Verification.
- [ ] Walk admin path manually: invalid publish shows checklist errors; valid publish appears in `/tours?hotOnly=1` and detail gallery as WebP srcset.
- [ ] Confirm originals never hit R2 (network tab shows only `*w.webp` uploads), no secret leaked to client bundle.
- [ ] Prepare PR/handoff linking `hot-voyage-03-admin` and parent guide.

### Cleanup

- [ ] Mark 03 done in parent guide.
- [ ] Update canonical spec from delta below if behavior diverged.
- [ ] List launch risks found (CORS, cache, Access config) as inputs to 04.

## Spec Delta: admin-studio

```markdown
# admin-studio - Spec Delta

## ADDED Requirements

### Requirement: Auth-gated admin

The system SHALL restrict `/admin/*` and `/api/admin/*` to admins, redirecting/401 anon and 403 non-admin, with prod Cloudflare Access and env-guarded dev session.

#### Scenario: Anonymous blocked

- **WHEN** an anonymous client requests an admin page or API
- **THEN** they are redirected to login or receive 401/403 without data leakage

### Requirement: Tour publishing workflow

The system SHALL allow admins to create, edit, publish, unpublish, and archive tours, enforcing hot-publish rules (discount, future window, seats, WebP cover, unique slug).

#### Scenario: Invalid hot publish blocked

- **WHEN** an admin publishes a hot offer missing discount, window, or cover
- **THEN** the system rejects with field errors and the tour stays draft

### Requirement: Client-side WebP image pipeline

The system SHALL resize images in the browser and upload WebP multi-width renditions to R2 under `tours/<slug>/<width>w.webp`, with server-side format/size verification.

#### Scenario: Resized upload appears publicly

- **WHEN** an admin uploads a JPEG source via the uploader
- **THEN** only resized WebP renditions are stored and the public detail gallery serves them via srcset

#### Scenario: Invalid upload rejected

- **WHEN** a non-image or oversized file is submitted
- **THEN** the system rejects with a clear message and stores nothing
```
