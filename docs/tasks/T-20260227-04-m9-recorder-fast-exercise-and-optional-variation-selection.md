---
task_id: T-20260227-04
milestone_id: "M9"
status: planned
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "node,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/ui/screen-map.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/components-catalog.md,docs/specs/ui/ux-rules.md,docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260227-04`
- Title: M9 recorder fast exercise add and optional variation selection
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
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`
  - `docs/specs/ui/ux-rules.md`
- Code/docs inventory freshness checks run:
  - recorder route inventory in `apps/mobile/app/session-recorder.tsx`
- Known stale references or assumptions:
  - this task should absorb/replace remaining M6 recorder-catalog integration gaps if still open
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260227-04-m9-recorder-fast-exercise-and-optional-variation-selection.md`

## Objective

Implement a recorder flow where adding an exercise remains fast by default and selecting/changing variation is optional, using catalog-backed exercise definitions and variation references.

## Scope

### In scope

- Replace legacy recorder exercise preset flow with catalog-backed exercise source and identity references.
- Ensure one fast path exists to add exercise without selecting variation.
- Add optional variation selection/change flow per logged exercise.
- Persist exercise + optional variation references through autosave/submit/edit flows.
- Ensure completed-edit mode supports the same variation behavior constraints.
- Add/adjust recorder tests to cover both no-variation and variation-selected flows.

### Out of scope

- Catalog variation authoring changes (owned by Task 03).
- Analytics implementation.
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

1. Flow name: Fast add exercise without variation
   - Trigger: User taps `Log new exercise`.
   - Steps: Open picker -> select exercise -> exercise is added immediately with no variation.
   - Success outcome: Exercise row appears with sets editable and no extra required modal step.
   - Failure/edge outcome: If exercise source cannot load, user sees actionable error and can retry.

2. Flow name: Optional variation selection/change
   - Trigger: User wants to specify or modify variation for a logged exercise.
   - Steps: Open exercise action -> choose variation picker -> select or clear variation.
   - Success outcome: Exercise row reflects selected variation and persists across autosave/reload.
   - Failure/edge outcome: Invalid/deleted variation reference is handled gracefully (clear/fallback with user-visible state).

### Interaction + appearance notes (lightweight)

- Keep default logging path minimal; avoid forcing variation picker on every add.
- Variation state should be visible but compact in each exercise row.
- Variation change affordance should be discoverable from existing exercise action patterns.
- Preserve destructive-action safety and existing recorder interaction expectations.

## Acceptance criteria

1. Recorder uses catalog exercise definitions as source for exercise selection.
2. User can add exercise with no variation in the default flow.
3. User can optionally assign/change/clear variation after exercise insertion.
4. Session persistence stores and restores exercise reference + optional variation reference correctly.
5. Completed-session edit path preserves the same persistence semantics and validation behavior.
6. Existing tokens/primitives/shared components are reused or exceptions are documented.
7. Relevant `docs/specs/ui/*.md` docs are updated in the same task.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - progress/status update
  - `docs/specs/ui/screen-map.md` - recorder state/flow updates
  - `docs/specs/ui/navigation-contract.md` - route/query behavior changes if any
  - `docs/specs/ui/components-catalog.md` - reusable variation selector/row component updates
  - `docs/specs/ui/ux-rules.md` - recorder variation interaction guardrails
- UI docs update required?: `yes`
- Tokens/primitives compliance statement:
  - Reuse plan: existing recorder layout components + shared UI primitives from `apps/mobile/components/ui/**`
  - Exceptions: `TBD during implementation; document file + rationale if introduced`
- UI artifacts/screenshots expectation:
  - Required by UX/task scope?: `yes`
  - Planned captures: add exercise no-variation path, select variation path, completed-edit variation persistence

## Testing and verification approach

- Planned checks/commands:
  - targeted recorder journey tests (no-variation + with-variation)
  - completed-session edit integration tests for variation refs
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required due user-facing recorder changes)
- Test layers covered:
  - route-level integration tests
  - autosave/persistence behavior checks
  - iOS smoke checks via slow gate
- Execution triggers:
  - always for fast gate
  - slow gate required for recorder UI behavior changes
- Slow-gate triggers:
  - changes to `apps/mobile/app/session-recorder.tsx`, related recorder components, or recorder persistence contracts
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: CI absent; local + artifact evidence required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - recorder shared components in `apps/mobile/components/session-recorder/**`
  - data contracts under `apps/mobile/src/data/**`
  - tests under `apps/mobile/app/__tests__/**`
  - `docs/specs/ui/**`
- Project structure impact: no structure changes expected
- Constraints/assumptions:
  - no inline variation creation in recorder for M9
  - default path must remain low-friction

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260227-04-m9-recorder-fast-exercise-and-optional-variation-selection.md`

## Evidence

- Targeted recorder/completed-edit test results for no-variation and with-variation flows.
- UI/UX visual artifacts for key flows.
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
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260227-04-m9-recorder-fast-exercise-and-optional-variation-selection.md` (or document why `N/A`) before handoff.
