# Task Card

## Task metadata

- Task ID: `T-20260224-03`
- Title: M6 exercise editing UI for linking muscle groups and weights
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-24`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#explicitly-deferred-after-mvp`
- Milestone spec: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`

## Objective

Implement exercise editing support that allows user-editable exercises to link one or more existing muscle groups and assign non-normalized weights.

## Scope

### In scope

- Add/edit UX for managing muscle links on user-editable exercises.
- Allow selecting from the system-defined muscle taxonomy (non-editable list).
- Allow setting/updating/removing per-link weights.
- Enforce basic validation in the editor:
  - at least one linked muscle group
  - no duplicate muscle links on the same exercise
  - valid weight input format/range
- Persist edited links through the local data/repository layer used by the feature.
- Add UI interaction tests for core add/edit/remove/validation flows.

### Out of scope

- Editing or creating muscle-group taxonomy entries.
- Analytics visualizations or rollups.
- Historical mapping/versioning behavior for completed sessions.
- Backend sync/API integration for exercise definitions/mappings.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Add muscle links to a custom exercise
   - Trigger: User creates or edits a user-defined exercise and wants to define trained muscles.
   - Steps: Open exercise editor -> add muscle link -> select muscle group -> enter weight -> save.
   - Success outcome: Exercise saves with the selected muscle link(s) and weights persisted.
   - Failure/edge outcome: Invalid or incomplete links are highlighted and save is blocked with a clear message.
2. Flow name: Edit and remove existing muscle links
   - Trigger: User adjusts an existing custom exercise mapping.
   - Steps: Open exercise editor -> change weight and/or remove a linked muscle -> save.
   - Success outcome: Updated links replace prior values without duplicates.
   - Failure/edge outcome: Duplicate muscle selection is prevented or flagged before save.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Muscle selection uses the system taxonomy labels; users cannot edit taxonomy names here.
- Weight input should support quick entry for decimals without awkward keyboard switching if feasible.
- Existing links should be easy to scan and edit in-place.
- Validation errors should point to the specific invalid row/link.

## Acceptance criteria

1. User-editable exercise flows support adding one or more muscle links from the system taxonomy.
2. User can set and edit non-normalized weights for each linked muscle.
3. User can remove linked muscles from an exercise.
4. Editor prevents duplicate muscle links on the same exercise.
5. Editor requires at least one linked muscle before save (for exercises using this feature).
6. UI tests cover add, edit, remove, and validation edge cases for muscle links.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted UI interaction tests for exercise muscle-link editing flows
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
- Notes:
  - Capture at least one validation failure path and one successful save path in tests.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/**` and/or `apps/mobile/src/**` for exercise editing UI
  - `apps/mobile/components/**`
  - `apps/mobile/src/data/**` (repository integration only as needed)
  - `apps/mobile/app/__tests__/**` or relevant UI test locations
- Constraints/assumptions:
  - M6 taxonomy is system-defined and non-editable.
  - Reuse existing UI patterns where possible; avoid introducing a heavy admin-only flow.
  - Final historical mapping behavior remains `TBD` and should not block local editing UX in this task.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted UI interaction tests for exercise muscle-link editor

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- UI flow evidence (screenshots/test trace summary) for add/edit/remove muscle links.
- Validation behavior evidence (duplicate link and missing-link cases).
- Test/gate results summary.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update parent milestone task breakdown/status in the same session.
