# Guide to Thick Multi-Step Proposals (At Most 5 Steps)

> Planning pattern for features that are too large for a single casual edit, finished in **at most 5 proposal files**. Each step is a **thick** increment: one coherent slice, a long task list, and enough implementation that a smaller, older split would have been several proposals.

Use this guide when you want independently mergeable increments without an open-ended step count. The 5-section brief stays fixed so planning does not become its own project. The **task list** inside each step is where the work lives, and it is expected to be long.

**Planning assumption.** The implementer is an agent that can hold one step file and carry schema, domain, API, UI, tests, and docs in a single change when they belong to one capability. Proposal boundaries follow merge, rollback, and release boundaries. They do not follow layers, files, or how long the checklist is.

**Compression rule.** Draft the split you would have used when each step was a thin layer, then collapse adjacent steps that serve the same capability. Aim for **half the proposal files or fewer** — often **one** file where there used to be three to five. Turn the old step boundaries into task groups inside the surviving proposal. An equivalent feature should ship in fewer step files and fewer OpenSpec change folders.

If, while planning, the feature needs more than 5 **thick** steps, stop. Do not stretch this template, and do not thin the steps to squeeze in a sixth file. Split into a second parent feature, defer work to the host repo’s longer-lived roadmap, or keep a longer ordered list under a new parent guide that is explicitly outside this pattern. See [When The Feature Outgrows 5 Steps](#when-the-feature-outgrows-5-steps).

### Host repo (fill in; do not hardcode a stack)

This guide is portable. Before writing steps, take these from the host project’s agent docs and record the ones that apply in each step’s **Scope & Conventions**:

- Where canonical product behavior lives (feature docs, specs, or both — follow the host; do not invent a second spec tree).
- Lint, typecheck, test, and build commands.
- UI, routing, data-access, and architecture rules (component library, where mutations live, which diagrams or docs must move with the code).

Default planning home for this guide, unless the host already has another plans directory:

```text
.dev-plan/current-iteration/<feature>-parent-guide.md
.dev-plan/current-iteration/<feature>-NN-<step>.md
```

`openspec/changes/` is optional and secondary. One thick step means one change folder at most, matching the step file. Do not create a change folder per layer. Archived change folders are history, not the template for new work.

---

## When To Use This Pattern

Use the **thick multi-step** pattern when the feature is:

- **Larger than one atomic change** but finishable in 5 or fewer coherent increments.
- **Decomposable by capability or release slice**, where each slice can include its own data model, logic, interface, and tests.
- **Cheaper to plan as a few long checklists** than as many short proposals.

Do **not** use it for:

- A small bug fix or refactor — make the change directly.
- A feature that is one capability an agent can land in a single change — write **one** step file, or skip the parent guide and just implement it.
- A feature that needs more than 5 thick, independently mergeable slices — split or defer. Do not thin the slices to stay under the cap.

Rule of thumb: start at **one** proposal. Add another only when you can name a separate merge or release. Five files means five thick slices, each large enough that it would previously have been its own small feature. Reaching five should be uncommon.

---

## Core Pattern

Model the work as one parent feature broken into at most 5 ordered child steps:

```text
.dev-plan/current-iteration/
├── <feature>-parent-guide.md
├── <feature>-01-<step-slug>.md
├── <feature>-02-<step-slug>.md
└── ...
```

The **`NN` prefix** is always two digits, `01` through `05`. There is no `06`. A missing number is normal: a one-step feature has only `01`. A two-step feature has `01` and `02`.

### Why 5 Is A Ceiling, Not A Target

- **Fewer files, more work in each.** Planning and review overhead tracks proposal count. A long task list inside one file is cheaper than five short proposals that restate the same feature.
- **Each step is a slice, not a layer.** Schema, use cases, routes, UI, and tests for one capability belong in the same proposal unless a real rollout boundary splits them.
- **The whole feature stays readable.** One to three thick step files can be read end to end. A chain of layer-sized files cannot, and it multiplies handoffs.
- **Each increment stays reviewable, rollbackable, and testable.** Thickness stops where reverting the change would mix unrelated capabilities, or where the tree cannot be green at the end of the step.

---

## The 5-Section Proposal Template

Each step plan’s proposal half uses these 5 sections, in this order. Keep them short. Put the bulk of the work in **Scope & Conventions** and in **Tasks**.

| #   | Section                         | Combines               | Purpose                                                                                                        |
| --- | ------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | **Context & Goal**              | Why + outcome          | Why this step exists, where it sits in the parent feature, and the one-sentence intended outcome               |
| 2   | **Prerequisites & Inputs**      | Deps + starting points | What must already exist, and the concrete files, paths, APIs, or decisions to start from                       |
| 3   | **Scope & Conventions**         | In / rules / out       | What to create or modify (expect a long path list), the host rules to follow, and what belongs in another step |
| 4   | **Deliverables & Verification** | Artifacts + checks     | The file list and public artifacts, plus the commands to run and expected output                               |
| 5   | **Cross-references**            | Upstream / downstream  | Which earlier step this depends on and which later step consumes this output                                   |

The 5-section structure is the contract between the author and the implementer. **An implementer should pick up one step file, read it once, and finish that slice — including every task group — without a follow-up proposal for “the rest” of the same capability.**

A thick step file may run to several pages. Length from a long checklist is expected. Length from mixing two capabilities is a signal to split.

Keep these sections and this order in every step plan file.

### What a thick Scope section contains

- Every area the slice needs: data, domain, API or server actions, UI, tests, and product docs when behavior changes.
- Exact paths, grouped by area, not a one-line summary that hides a second proposal.
- Host-repo conventions that apply to this step (from the host’s agent docs).
- Out of scope limited to **other capabilities or later releases**, not the next layer of this same slice.

### Verification baseline

Unless a step explicitly says otherwise, run the host repo’s lint, typecheck, and the unit or integration tests that cover the slice. Add an end-to-end or scripted check when the step ships a user-visible path. Prefer at least one check that does not require external cloud services.

---

## How To Split A Feature Into Up To 5 Steps

A good split has all of these properties:

1. **Each step is independently mergeable.** The build stays green. The slice works at the depth it claims; it does not leave a schema or route that no caller can use yet unless that isolation is the rollout boundary you named.
2. **Each step has one coherent capability or release slice.** It is not a single package layer, and it is not a grab bag of unrelated features.
3. **Steps have a clear dependency order.** Step `k` may only depend on steps `1..k-1`.
4. **Each step adds observable value.** A reader can see a working behavior, a shipped internal platform surface, or a closed release gap — not a file that only the next proposal uses.
5. **The last step closes whatever this parent still owes.** Residual tests, docs, legacy removal, and polish live in the last file when they were not already inside earlier slices.
6. **The whole feature fits in 5 or fewer thick steps.** If it does not, this is the wrong guide. Folding layers together is how you stay under the cap; folding unrelated capabilities together is not.

### Common Shapes

Pick the smallest shape that still has a real merge boundary between steps. Then collapse again if two steps would always ship together.

#### 1 Step: Full Slice (Default)

```text
01 - one capability end to end
    task groups: data, domain, API, UI, tests, docs
```

**Use when** there is one user-visible outcome, or one internal surface, and an agent can land it in one change. This replaces the old “backend step + UI step + hardening step” chain for small and medium features.

A waitlist signup (table, validation, create/list API, form, confirmation, admin list, tests, docs) is **one** step file. The checklist is long. The proposal count is one.

#### 2 Steps: Ship The Loop, Then Close The Gaps

```text
01 - capability end to end (happy path, data through UI, core tests)
02 - edge states, legacy removal, observability, remaining docs
```

**Use when** the first slice is already releasable and the second step is residual risk, not the other half of the same feature. If step 02 is “now build the UI for step 01,” merge them.

#### 3 Steps: Three Capabilities

```text
01 - capability A, end to end (data, API, UI, tests)
02 - capability B, end to end
03 - capability C, end to end
```

**Use when** each capability can merge and be demonstrated on its own. Example: member signup, organizer review, notification emails — each file contains that capability’s full stack. Shared groundwork lives in the earliest capability that needs it, with tasks called out there, not in a prelude proposal that only adds types.

#### 4–5 Steps: Several Releases Under One Parent

```text
01 - first releasable capability, full stack
02 - second releasable capability, full stack
03 - third
04 - fourth
05 - fifth, or cross-cutting release close (legacy removal, rollout flags, docs) when that close is large enough to revert on its own
```

**Use when** each number is a thick increment you might ship or revert separately. Five thin layers (schema, domain, API, UI, e2e) are **one** step, not this shape. If step 5 is only “write the tests for step 4,” fold it back.

### Avoid: One Layer Per Proposal

```text
01 - schema and migrations
02 - domain use cases
03 - API routes
04 - UI
05 - e2e and docs
```

That list is a single capability split along the stack. Write **one** proposal (or two, when a migration must merge and settle before application code) and use those lines as `###` task groups.

### Avoid: One File Per Proposal

```text
01 - add a column
02 - add a type
03 - add a route stub
04 - wire the route
05 - add the page
```

That is one implementation checklist. Put it in a single step file.

### Avoid: Unrelated Capabilities In One Proposal

```text
01 - billing schema + a redesign of search + a new admin role model
```

Thickness follows **one** slice. Two capabilities you might release or revert separately stay in separate step files, even though each file then contains a lot of tasks. If the combined diff is not one rollback unit, it is two proposals.

### Migration Boundary (The Split That Still Earns A Step)

Keep a separate earlier step when later work is unsafe until the first change has merged and run, for example a destructive migration, a backfill, or a contract other services must already be calling. The follow-up step still includes everything else for that capability (call sites, UI, tests), not a single layer.

---

## Sizing Rules

- **A step is the right size when it is one capability (or one named release slice) and the task list covers that slice through tests and docs.**
- **A step is the right size when collapsing three to five older layer-steps into it still leaves one rollback unit.**
- **A step is the right size when the checklist is long.** Many files and many checkboxes are the point. Do not open another proposal because the task section grew.
- **A step is too big when it binds capabilities that have different rollout or rollback, or when it cannot end with a green verification run.**
- **A step is too small when the next proposal only continues the same outcome** — wiring the API this step added, building the page for this step’s endpoint, or adding the tests for this step’s behavior. Fold that work in.
- **File count is not a split signal.** A thick step may add or edit dozens of files when they belong to one slice.

When in doubt, **start with one step**. Split only after you can name the merge boundary in a sentence that is not “this part is the UI” or “this part is the tests.”

---

## Naming Convention

### Step plan filenames

```text
<feature-slug>-NN-<step-slug>.md
```

- `<feature-slug>` is kebab-case and stable across all steps, such as `waitlist`, `billing`, or `discovery`.
- `NN` is a zero-padded step number, `01` through `05` only.
- `<step-slug>` names the **capability or slice**, such as `signup`, `member-signup`, or `signup-and-admin`. Avoid layer names (`schema`, `api`, `ui`) unless the step is genuinely only that layer because of a migration boundary.

Examples (under `.dev-plan/current-iteration/`):

- `waitlist-parent-guide.md`
- `waitlist-01-signup.md`
- `billing-01-checkout.md`
- `billing-02-invoices.md`

### Spec capability names

Each step's `## Spec Delta: <capability>` section names a planning contract. Point it at the host repo’s real spec home (product docs, `openspec/specs/`, or whatever that repo already uses). One thick step usually carries **one capability with many requirements**, covering the whole slice. A step may include several `## Spec Delta:` sections when it touches several existing capabilities. Do not split one requirement across proposal files to keep each delta short.

When a delta extends existing behavior, prefer **`## MODIFIED Requirements`** with the full updated requirement body.

### Change IDs

In each step plan’s front matter, the change ID matches the filename (without `.md`):

```yaml
---
id: waitlist-01-signup
title: Waitlist signup
---
```

---

## Per-Step File Layout

Each step is a **single** markdown file. There is no separate `proposal.md` / `tasks.md` / `specs/` set for new work unless you also opt into the OpenSpec CLI layout below. Combine proposal sections, tasks, and spec deltas in this order:

```markdown
---

id: <feature>-NN-<step>
title: <Short title for the step>
---

# <NN> - <Title>

## Context & Goal

<Why this step exists, where it sits in the parent feature, what came before it, and one sentence describing the intended outcome. One capability.>

## Prerequisites & Inputs

- The step `<feature>-0X-<prev-step>` must be merged and marked done in the parent guide.
- Artifacts that must already exist: `<path/to/file>`.
- Concrete inputs: `<files, paths, APIs, docs, or decisions the implementer starts from>`.

## Scope & Conventions

- Scope:
  - Data: `<paths and changes>`.
  - Domain: `<paths and changes>`.
  - API / server: `<paths and changes>`.
  - UI: `<paths and changes>`.
  - Tests and docs: `<paths and changes>`.
- Conventions: `<host-repo rules for this step — naming, ownership, UI, data access, architecture docs>`.
- Out of scope: `<other capabilities or later releases — not the next layer of this slice>`.

## Deliverables & Verification

- Deliverables: `<file list with one-line descriptions, public exports, or "none">`.
- Verification:
  1. `<host lint command>` — exits 0
  2. `<host typecheck command>` — exits 0
  3. `<host test command plus expected output>`

## Cross-references

- Depends on: `<feature>-0X-<prev-step>` (or "none" if step 1).
- Consumed by: `<feature>-0Y-<next-step>` (or "closes the feature" if the final step).
- Parent guide: `.dev-plan/current-iteration/<feature>-parent-guide.md`

## Tasks

### Setup

- [ ] Read this step plan end-to-end (all 5 proposal sections and every task group).
- [ ] Confirm every prerequisite exists.
- [ ] Skim the parent guide for release criteria and non-goals.

### Implementation

Work top to bottom. These groups are one proposal. Do not stop after a group and open a new step file.

#### Data

- [ ] <Migration, schema, types — one checkbox per file or behavior.>

#### Domain

- [ ] <Use cases, validation, policies.>

#### API

- [ ] <Routes, server actions, or service entry points, including auth and error paths.>

#### UI

- [ ] <Pages, forms, and states that exercise the API above.>

#### Tests and docs

- [ ] <Unit, integration, and end-to-end coverage for this slice.>
- [ ] <Product or architecture docs this slice changes.>
- [ ] Run the relevant test command after each major area, not only at the end.

### Validation

- [ ] Run every verification command in **Deliverables & Verification**.
- [ ] Confirm the output matches the expected result.
- [ ] Walk the user-visible path this step claims to ship.
- [ ] Prepare a PR or handoff that links the change ID and parent guide.

### Cleanup

- [ ] Update the parent feature guide to mark this step as done.
- [ ] Update the host’s canonical product spec if behavior changed and is not already captured there.
- [ ] Update project guidance if a new convention was introduced.

## Spec Delta: <capability>

\`\`\`markdown
# <Capability> - Spec Delta

## ADDED Requirements

### Requirement: <Name>

The system SHALL <observable behavior>.

#### Scenario: <Name>

- **WHEN** <condition>
- **THEN** <expected outcome>

## MODIFIED Requirements

### Requirement: <Existing name>

The system SHALL <new behavior>.

(Include the full updated requirement body, not just a diff.)

## REMOVED Requirements

### Requirement: <Name that no longer applies>

(Include for traceability.)
\`\`\`
```

Rules for this layout:

- The 5 proposal sections keep their own heading level (`##`) and order.
- `## Tasks` follows immediately after `## Cross-references`.
- **Implementation is a long checklist grouped by area.** One checkbox per file or testable behavior. A thick step often has dozens of checkboxes. That is one proposal.
- Each spec delta gets its own `## Spec Delta: <capability>` section, with the delta body fenced in a \`\`\`markdown code block so it stays visually distinct from the plan prose.
- **A step may need more than one `## Spec Delta: <capability>` section.** List one per capability touched. A single capability’s delta should list every requirement this slice adds or changes, not a stub that later proposals fill in.
- Write deltas in the plan. When behavior ships, update the host’s canonical spec as well — one home, the one that repo already uses.

> **Convention: keep source-control actions out of Tasks.** The task list describes implementation and validation only. Committing, pushing, and merging are owned by the person or system responsible for the repository workflow.

### Choosing A Capability Name For A Step's Spec Delta

Before writing a `## Spec Delta: <capability>` section, decide the capability name with this order of preference:

1. **Reuse a domain the host spec already covers** if the step extends it. Use `## MODIFIED Requirements` with the full updated body.
2. **Introduce one new capability name per parent feature** when the step defines a new domain contract. Share that name across steps of the feature. Do not invent one name per step, and do not invent one name per layer.
3. **Keep one coherent requirement in one capability.** A thick step writes the whole requirement into its delta, scenarios included.

### Optional: OpenSpec change folders

Only if you explicitly need the OpenSpec CLI folder workflow, you may also create **one** folder per thick step:

```text
openspec/changes/<feature>-NN-<step>/
├── proposal.md
├── tasks.md
└── specs/
    └── <capability>/
        └── spec.md
```

That layout is **optional and secondary**. The `.dev-plan/current-iteration/<feature>-NN-<step>.md` file remains the implementer’s source of truth. The folder mirrors the thick step; it is not a way to split the step into smaller changes. Do not invent work only under `openspec/changes/` without a matching current-iteration plan.

---

## The Parent Feature Guide

When you start a thick multi-step feature, write a brief parent guide that:

1. States the feature's user-visible value in one paragraph.
2. Lists the child changes in order (usually 1–3, never more than 5) with a one-line description of each **capability**, not each layer.
3. States the dependency graph.
4. States the release criteria.
5. Lists non-goals, risks, and open questions.
6. Notes the compression: which older thin steps were folded into each child, so later planning does not re-split them.

### Parent Guide Skeleton

```markdown
# Feature: Waitlist

## User-Visible Value

<One paragraph describing what users can do after this feature ships.>

## Child Changes

1. `waitlist-01-signup` - signup through confirmation and admin list: schema, API, UI, tests, and docs.

## Dependency Graph

01

## Release Criteria

- All child steps are merged and marked done in this parent guide.
- Required lint, typecheck, and tests for the slice pass (host commands).
- The host’s canonical product spec matches the behavior this feature shipped.

## Non-Goals

- <Explicitly deferred behavior.>

## Risks And Open Questions

- <Known uncertainty or decision still needed.>

## Folded Work

- Older thin split (schema+API, UI, hardening) is entirely inside step 01.
```

---

## Worked Example: Feature Split

Waitlist signup, including persistence, create and list APIs, the public form, confirmation, the admin list, empty and error states, and docs:

| Step | Change               | What It Ships                                                                                                             |
| ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 01   | `waitlist-01-signup` | The whole signup capability: table, migration, types, validation, routes, form, confirmation, admin list, tests, and docs |

One proposal. Task groups inside the file cover data, domain, API, UI, and tests. Add `waitlist-02-moderation` only if approve/reject is a separate release, and give that second file its own data changes, API, UI, and tests.

A feature that used to be five layer files (schema, domain, API, UI, hardening) uses this same one-row table unless a migration boundary forces a second step.

---

## Checklist For The Author

Before opening the first step:

- [ ] I started from one step and added another only where I can name a separate merge or release.
- [ ] I collapsed layer-sized and file-sized steps into task groups. Proposal count is about half (or less) of the thin split for the same feature.
- [ ] I have written a parent guide at `.dev-plan/current-iteration/<feature>-parent-guide.md` with the feature brief, step list (5 or fewer), dependency graph, release criteria, non-goals, and folded work.
- [ ] The feature fits in 5 or fewer **thick** steps — if not, I am splitting or deferring per [When The Feature Outgrows 5 Steps](#when-the-feature-outgrows-5-steps).
- [ ] Each step is one capability or one named release slice, with a long task list.
- [ ] No step is a single layer, a single file, or a pile of unrelated capabilities.
- [ ] Each change ID follows `<feature>-NN-<step>` with `NN` in `01`-`05`.
- [ ] Host lint, typecheck, test commands, and stack rules are copied from the host’s agent docs, not from another project.

Before opening each step:

- [ ] The step plan `.dev-plan/current-iteration/<feature>-NN-<step>.md` has all 5 proposal sections in the same order as this guide.
- [ ] `## Tasks` groups implementation by area and has a checkbox for every path and behavior in `Scope & Conventions`.
- [ ] The task list finishes the slice (through tests and docs). It does not leave the next layer for a later proposal.
- [ ] Each `## Spec Delta: <capability>` uses `## ADDED Requirements`, `## MODIFIED Requirements`, or `## REMOVED Requirements`, and capability names follow [Choosing A Capability Name](#choosing-a-capability-name-for-a-steps-spec-delta).
- [ ] `Prerequisites & Inputs` names required previous steps and artifacts.
- [ ] `Cross-references` names the next known step (or states it closes the feature) and links the parent guide.
- [ ] `Deliverables & Verification` includes the host lint and typecheck commands (or documents why not) and at least one command an implementer can run without external services when possible.

After each step is merged:

- [ ] Mark the step done in the parent feature guide (`.dev-plan/current-iteration/<feature>-parent-guide.md`).
- [ ] Update the host’s canonical spec if the step changed behavior not already captured there.
- [ ] Start the next step only after prerequisites are actually satisfied.

---

## Checklist For The Implementer

Before starting:

- [ ] I have read the step plan (`.dev-plan/current-iteration/<feature>-NN-<step>.md`) end-to-end, including every task group.
- [ ] I have confirmed the `Prerequisites & Inputs` section is true.
- [ ] I have read the parent guide linked from `Cross-references`.

During implementation:

- [ ] I work through the full task list in this file, area by area, until the slice is complete.
- [ ] I follow `Scope & Conventions`, including the host-repo rules written there.
- [ ] I do not implement anything called out as out of scope.
- [ ] I do not stop at a task-group boundary to propose a follow-up change for the rest of this slice.
- [ ] I update the step plan’s `## Tasks` checkboxes as work is completed.

Before opening or handing off the change:

- [ ] I have run every verification command and the output matches.
- [ ] Required typecheck, lint, test, and build commands pass.
- [ ] The user-visible path this step claims is actually reachable.
- [ ] The PR or handoff description links the change ID and the parent guide.
- [ ] Any skipped verification is documented with the reason and the follow-up owner.

---

## When The Feature Outgrows 5 Steps

Stop using this pattern mid-planning if:

- You already have 5 thick, independently mergeable capabilities and a sixth capability remains.
- The feature maps to multiple phases on the host repo’s longer-lived roadmap.

A long task list, a long spec delta, or a large file count is **not** a reason to leave the pattern or to add a step. Keep that work in the capability’s proposal.

What to do instead:

1. **Split into two parent features** along a capability boundary (e.g. `waitlist` + `waitlist-admin`), each with its own parent guide and at most 5 thick steps.
2. **Defer** later capabilities to the next roadmap phase.
3. **Renumber cleanly** before anyone implements against step IDs that will change.

Outgrowing 5 thick steps means the parent was more than one feature.

---

## Summary

The thick multi-step pattern keeps a hard cap of 5 proposal files and puts more work in each file. The key artifacts are:

1. **A parent guide** — the entry point, usually listing 1–3 child capabilities, never more than 5 (`.dev-plan/current-iteration/<feature>-parent-guide.md`).
2. **Up to 5 step plans** — each a combined markdown file whose task list covers a full slice, not a layer (`.dev-plan/current-iteration/<feature>-NN-<step>.md`).
3. **The host’s canonical spec** — update it when shipped behavior diverges. Optional `openspec/changes/<id>/` folders, if used, mirror those same thick steps one-for-one.

The contract between the author and the implementer is still the 5-section proposal, plus a long grouped task list. Equivalent work that used to be several thin proposals is one step file, one review, and one change.
