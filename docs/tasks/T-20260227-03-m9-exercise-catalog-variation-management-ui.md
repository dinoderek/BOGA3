---
task_id: T-20260227-03
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

- Task ID: `T-20260227-03`
- Title: M9 exercise catalog variation management UI
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
  - route + component inventory for `apps/mobile/app/exercise-catalog.tsx`
- Known stale references or assumptions:
  - assumes variation schema/repository contract from Task 02 is available
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260227-03-m9-exercise-catalog-variation-management-ui.md`

## Objective

Add catalog-first UI to create and manage per-exercise key/value variations, including user-defined keys and values, while preserving a fast and clear management workflow.

## Scope

### In scope

- Extend exercise catalog screen behavior to manage variation entities for each exercise.
- Add UI affordances to:
  - create/edit/remove exercise variations,
  - assign/remove key/value attributes on a variation,
  - create custom keys and values.
- Add validation and error feedback for invalid or duplicate key/value assignments.
- Add test coverage for new variation management interactions.
- Update relevant UI docs in the same session.

### Out of scope

- Recorder flow updates.
- Analytics implementation.
- Backend sync/API.

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

1. Flow name: Manage variations for an exercise
   - Trigger: User opens an exercise from catalog management.
   - Steps: Open exercise editor -> view variation list -> add/edit/remove variation -> save.
   - Success outcome: Variation list updates and persists for that exercise.
   - Failure/edge outcome: Invalid/duplicate key-value assignments are blocked with clear inline error.

2. Flow name: Add custom key/value metadata
   - Trigger: User needs a variation key/value not present in seeded options.
   - Steps: Open variation editor -> add new key and/or value -> assign it -> save.
   - Success outcome: New key/value is available for future variation assignments.
   - Failure/edge outcome: Duplicate/conflicting key/value definitions are rejected with actionable feedback.

### Interaction + appearance notes (lightweight)

- Preserve current catalog screen hierarchy and modal conventions where possible.
- Keep common edit path low-friction; avoid forcing full-screen detours for simple variation edits.
- Emphasize readable variation summary chips/rows over verbose forms.
- Keep destructive actions clearly styled and confirm where data loss risk is meaningful.

## Acceptance criteria

1. Catalog UI supports create/edit/remove for exercise-owned variations.
2. Each variation can store one or more key/value attributes.
3. Users can add custom keys and values from catalog flows.
4. Validation blocks duplicate key assignment within one variation and invalid empty key/value entries.
5. Existing tokens/primitives are reused for buttons/inputs/layout unless a documented exception is needed.
6. Relevant `docs/specs/ui/*.md` docs are updated in the same task.
7. Route/params/transitions docs are updated if navigation behavior changes.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - progress/status update
  - `docs/specs/ui/screen-map.md` - update screen state summary for variation management sections
  - `docs/specs/ui/navigation-contract.md` - update if new query params/flows appear
  - `docs/specs/ui/components-catalog.md` - document any added reusable variation UI primitives
  - `docs/specs/ui/ux-rules.md` - document any new variation-management interaction rules
- UI docs update required?: `yes`
- Tokens/primitives compliance statement:
  - Reuse plan: use existing `apps/mobile/components/ui/**` tokens/primitives for inputs, buttons, cards, section rows
  - Exceptions: `TBD during implementation; must be documented with file + rationale`
- UI artifacts/screenshots expectation:
  - Required by UX/task scope?: `yes`
  - Planned captures: catalog variation list, variation editor, validation/error state

## Testing and verification approach

- Planned checks/commands:
  - targeted RNTL tests for catalog variation flows
  - full mobile test suite via fast gate
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required due user-facing UI changes)
- Test layers covered:
  - component/integration tests for catalog route behavior
  - iOS smoke checks via slow gate
- Execution triggers:
  - always for fast gate
  - slow gate required for UI-affecting changes
- Slow-gate triggers:
  - route/component UI changes in `apps/mobile/app/exercise-catalog.tsx` and related components
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: CI absent; local + artifact evidence required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/exercise-catalog.tsx`
  - `apps/mobile/src/data/**` (catalog repository wiring)
  - `apps/mobile/components/**` (if shared primitives needed)
  - tests under `apps/mobile/app/__tests__/**`
  - `docs/specs/ui/**`
- Project structure impact: no structure changes expected
- Constraints/assumptions:
  - Catalog remains primary variation authoring surface.

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260227-03-m9-exercise-catalog-variation-management-ui.md`

## Evidence

- Test evidence summary for happy-path and error-path variation management.
- UI/UX visual artifacts for required flows.
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
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260227-03-m9-exercise-catalog-variation-management-ui.md` (or document why `N/A`) before handoff.
