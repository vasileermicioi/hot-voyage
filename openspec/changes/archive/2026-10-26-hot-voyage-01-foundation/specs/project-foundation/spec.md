# Spec Delta

## Purpose

Establishes the buildable, deployable Hot Voyage platform — toolchain, edge bindings, decision docs, and theme baseline — that all later catalog, admin, and launch work builds on.

## ADDED Requirements

### Requirement: Bun-only toolchain

The system SHALL provide a Bun-only workspaces workflow (`apps/web`, `packages/db`, `packages/lib`) for install, dev, build, format, test, and e2e without requiring npm, pnpm, yarn, vitest, or jest.

#### Scenario: Fresh clone builds

- **WHEN** a developer runs `bun install` then `bun run build` on a clean checkout
- **THEN** workspaces link (`@hot-voyage/db`, `@hot-voyage/lib`) with no npm lockfile and the Astro site builds to `dist/` with exit 0

#### Scenario: Bun-only test run

- **WHEN** a developer runs `bun test`
- **THEN** all workspace unit tests execute via `bun:test` with exit 0 and no vitest/jest dependency present

### Requirement: Edge hosting bindings

The system SHALL run on Cloudflare Workers with declared D1 and R2 bindings for local, preview, and production environments, provable without cloud access.

#### Scenario: Health proves bindings

- **WHEN** a client requests `/api/health` with bindings configured
- **THEN** the response is `{ ok: true }` with D1/R2 availability flags and exposes no secrets

#### Scenario: Missing binding fails fast

- **WHEN** a server path requires a D1 or R2 binding that is not configured
- **THEN** it throws an actionable error naming the missing binding and how to configure it

### Requirement: Documented critical decisions

The system SHALL maintain `AGENTS.md` with stack, commands, data-access, image, and deploy rules, updated alongside code changes.

#### Scenario: Agent onboarding

- **WHEN** a new agent reads `AGENTS.md` and `README.md`
- **THEN** they can run dev, typecheck, tests, and dry-run deploy without asking for missing commands

#### Scenario: Docs move with code

- **WHEN** a behavior change lands that alters architecture, data access, images, or deploy
- **THEN** the same change updates `AGENTS.md`, `docs/design.md`, or LikeC4 docs as applicable

### Requirement: Touristic neobrutalist theme baseline

The system SHALL define touristic design tokens and LikeC4 architecture docs as the baseline for all later UI and data work.

#### Scenario: Themed shell

- **WHEN** a visitor opens `/`
- **THEN** they see a Hot Voyage card using the touristic neobrutalist tokens and layout documented in `docs/design.md`

#### Scenario: Architecture traceability

- **WHEN** a developer reads `docs/architecture.md` and `docs/likec4/workspace.likec4`
- **THEN** they can identify the Astro edge app, D1, R2, and admin browser roles and how requests flow between them
