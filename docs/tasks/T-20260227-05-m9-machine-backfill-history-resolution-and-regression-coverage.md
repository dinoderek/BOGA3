---
task_id: T-20260227-05
milestone_id: "M9"
status: planned
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "node,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/ui/screen-map.md,docs/specs/ui/ux-rules.md,docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260227-05`
- Title: M9 machine backfill, retroactive history resolution, and regression coverage
- Status: `planned`
- Session date: `2026-02-27`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/ui/README.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/ux-rules.md`
- Code/docs inventory freshness checks run:
  - completed-session and session-list UI read-path inventory
  - migration/backfill helper inventory
- Known stale references or assumptions:
  - assumes Tasks 02-04 landed first
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260227-05-m9-machine-backfill-history-resolution-and-regression-coverage.md`

## Objective

Finalize legacy-machine backfill behavior and ensure history/detail screens resolve exercise/variation metadata retroactively, with strong regression coverage for both deterministic and fallback cases.

## Scope

### In scope

- Implement/confirm best-effort backfill from legacy `machineName` into structured variation metadata where deterministic mapping exists.
- Ensure unresolved legacy cases have stable fallback display behavior.
- Ensure session list and completed-session detail resolve labels using current (retroactive) exercise/variation metadata.
- Add regression tests for:
  - deterministic backfill,
  - fallback unresolved cases,
  - retroactive rename effects on history views.
- Update milestone/UI docs to reflect final behavior.

### Out of scope

- Analytics UI or analytics materialization implementation.
- Backend sync/API implementation.

## UI Impact (required checkpoint)

- UI Impact?: `yes`
- If `yes`:
  - keep UI/UX parent references.
  - keep the `UX Contract` section and fill it before implementation.
  - include tokens/primitives compliance statement in `Docs touched` / implementation notes.
  - include a UI docs update plan in `Docs touched`.
  - include screenshots/artifacts expectations in `Evidence`.

## UX Contract (UI/UX tasks only)

### Key user flows (minimal template)

1. Flow name: History reflects renamed metadata retroactively
   - Trigger: User edits exercise/variation names in catalog and opens history views.
   - Steps: Rename metadata -> open session list/completed detail -> inspect labels.
   - Success outcome: History displays latest names/labels consistently.
   - Failure/edge outcome: If reference is unresolved, UI shows deterministic fallback label and does not crash.

2. Flow name: Legacy machine fallback readability
   - Trigger: User views sessions created before M9 migration.
   - Steps: Open old session after migration/backfill -> inspect exercise metadata label.
   - Success outcome: Structured metadata appears when mapped; fallback text appears when not mapped.
   - Failure/edge outcome: Missing mapping never blocks session rendering.

### Interaction + appearance notes (lightweight)

- Preserve current list/detail information density and readability.
- Keep fallback labels explicit but compact.
- Avoid introducing new complex controls in history screens.

## Acceptance criteria

1. Backfill handles deterministic legacy `machineName` cases into structured variation metadata.
2. Ambiguous/unmapped legacy cases render with stable fallback semantics.
3. History/detail screens resolve metadata via current exercise/variation definitions (retroactive behavior).
4. Regression tests cover rename-retroactivity and legacy fallback paths.
5. UI docs and milestone docs reflect the finalized behavior.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - closeout behavior details
  - `docs/specs/ui/screen-map.md` - history/detail state notes if changed
  - `docs/specs/ui/ux-rules.md` - fallback label semantics and retroactive display rule
- UI docs update required?: `yes`
- Tokens/primitives compliance statement:
  - Reuse plan: reuse existing session-list/detail typography and row primitives
  - Exceptions: `TBD during implementation; document file + rationale if introduced`
- UI artifacts/screenshots expectation:
  - Required by UX/task scope?: `yes`
  - Planned captures: retroactive rename on history, legacy fallback rendering example

## Testing and verification approach

- Planned checks/commands:
  - targeted history/detail integration tests
  - migration/backfill-focused tests
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required due UI + migration-sensitive behavior)
- Test layers covered:
  - data migration/backfill tests
  - history/detail route behavior tests
  - iOS smoke checks via slow gate
- Execution triggers:
  - always for fast gate
  - slow gate required due migration + user-facing rendering changes
- Slow-gate triggers:
  - changes to migration/backfill logic or history/detail route rendering
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: CI absent; local + artifact evidence required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**` (backfill/resolution logic)
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/completed-session/[sessionId].tsx`
  - related tests under `apps/mobile/app/__tests__/**`
  - `docs/specs/ui/**`
- Project structure impact: no structure changes expected
- Constraints/assumptions:
  - retroactive display semantics are mandatory for this milestone

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260227-05-m9-machine-backfill-history-resolution-and-regression-coverage.md`

## Evidence

- Migration/backfill test summary including deterministic + fallback paths.
- History/detail retroactive-label test summary.
- UI/UX artifacts for required flows.
- Manual verification summary (CI absent).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- For UI/UX tasks, update relevant `docs/specs/ui/*.md` files (or record explicit no-update rationale).
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260227-05-m9-machine-backfill-history-resolution-and-regression-coverage.md` (or document why `N/A`) before handoff.
