---
task_id: T-20260227-01
milestone_id: "M9"
status: planned
ui_impact: "no"
areas: "docs"
runtimes: "docs"
gates_fast: "N/A"
gates_slow: "N/A"
docs_touched: "docs/specs/00-product.md,docs/specs/03-technical-architecture.md,docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md,docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260227-01`
- Title: M9 retroactive semantics decision realignment
- Status: `planned`
- Session date: `2026-02-27`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session (list exact files actually reviewed):
  - `docs/specs/00-product.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Code/docs inventory freshness checks run:
  - docs link/path sanity for touched specs (`TBD at execution start`)
- Known stale references or assumptions:
  - none expected
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260227-01-m9-retroactive-semantics-decision-realignment.md`

## Objective

Align source-of-truth product and architecture docs to the newly locked M9 decision that exercise/variation metadata semantics are fully retroactive, and explicitly supersede conflicting historical wording from M6.

## Scope

### In scope

- Update `00-product.md` with product-level variation + retroactive behavior decisions.
- Update `03-technical-architecture.md` with technical decision register entries for M9 variation model + retroactive semantics.
- Update M6 milestone wording to explicitly mark prior snapshot-target historical decision as superseded.
- Ensure M9 milestone wording remains consistent with updated parent docs.

### Out of scope

- Schema or code implementation.
- UI implementation.
- Analytics feature implementation.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Product and architecture docs both state retroactive exercise/variation metadata semantics with no contradictory wording.
2. M6 milestone doc contains explicit supersession note for prior snapshot-target historical-direction language.
3. M9 milestone doc and parent specs are internally consistent and can be used without reopening the semantics decision.
4. All touched docs keep links/path references valid.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/00-product.md` - lock product-facing variation/retroactive behavior decisions
  - `docs/specs/03-technical-architecture.md` - lock technical architecture decisions for variation model semantics
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md` - record supersession note
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - consistency pass

## Testing and verification approach

- Planned checks/commands:
  - editorial consistency pass across touched docs
  - `rg` sanity checks for obsolete contradictory phrases (`snapshot at session completion`, `reproducible canonical analytics`) in touched files
- Standard local gate usage:
  - `./scripts/quality-fast.sh`: `N/A (docs-only task)`
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A (docs-only task)`
- Test layers covered: docs consistency + reference sanity
- Execution triggers: always (docs-only)
- Slow-gate triggers: `N/A`
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI configured; docs verification is manual in-task

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/00-product.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Project structure impact: no structure changes expected
- Constraints/assumptions:
  - Do not introduce implementation-level details beyond decision clarity.

## Mandatory verify gates

- Standard local fast gate: `N/A (docs-only)`
- Standard local slow gate: `N/A (docs-only)`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260227-01-m9-retroactive-semantics-decision-realignment.md`

## Evidence

- Updated decision wording snippets from all touched source-of-truth docs.
- `rg` output summary showing superseded wording handled in touched docs.
- Manual verification summary (CI absent): docs consistency + link/path sanity completed.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260227-01-m9-retroactive-semantics-decision-realignment.md` (or document why `N/A`) before handoff.
