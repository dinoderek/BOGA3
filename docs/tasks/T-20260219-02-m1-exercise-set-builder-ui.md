# Task Card

## Task metadata

- Task ID: `T-20260219-02`
- Title: M1 dynamic exercise and set builder UI
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-19`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M1-ui-session-recorder.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`

## Objective

Implement dynamic UI behavior to add/edit/remove exercises and sets, including quick-add from a pre-seeded static exercise list, while keeping session data entirely in local screen state.

## Scope

### In scope

- Add a small static exercise preset list for quick-add.
  - Seed values: `Barbell Squat`, `Bench Press`, `Deadlift`, `Overhead Press`, `Lat Pulldown`, `Leg Press`.
- Add exercise action with editable exercise name and machine context.
- Add/remove set rows within each exercise.
- Editable set fields for reps and weight.
- Remove exercise action.
- Derived UI summary for total exercises and total sets.

### Out of scope

- Final submit validation and confirmation UX.
- Persistence to SQLite or backend.
- Advanced metrics/analytics.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Add exercise from preset and complete first set
   - Trigger: User wants a fast start for a common exercise.
   - Steps: Open preset list -> select exercise -> add set row -> enter reps/weight.
   - Success outcome: Exercise row and set row appear with entered values; totals update.
   - Failure/edge outcome: Incomplete value keeps row editable and preserves existing inputs.
2. Flow name: Build and prune exercise structure
   - Trigger: User adjusts workout plan while logging.
   - Steps: Add manual exercise -> edit machine context -> add/remove sets -> remove exercise if needed.
   - Success outcome: UI reflects all add/edit/remove actions and totals stay accurate.
   - Failure/edge outcome: Removing exercise deletes nested sets and immediately updates totals.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Preset selection creates an exercise row immediately.
- Manual add creates an editable exercise row with stable identity.
- Exercise rows are visually grouped from set rows.
- Add actions and destructive actions are clearly distinct.

## Acceptance criteria

1. User can add multiple exercises in one session.
2. User can add at least one exercise directly from the seeded static preset list.
3. Each exercise supports machine context editing.
4. User can add and remove sets per exercise with reps/weight inputs.
5. Removing an exercise removes its sets and updates summaries.
6. Interaction tests cover preset add, manual add, remove, and update paths.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - `npm run test -- app/__tests__/session-recorder-interactions.test.tsx`
  - `npm run lint`
  - `npm run typecheck`
- Notes:
  - Cover preset add, manual add, set add/remove, and exercise remove flows.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/app/**`, `apps/mobile/components/**`, `apps/mobile/app/__tests__/**`
- Constraints/assumptions:
  - Use stable IDs in local state for exercise/set row identity.
  - Exercise preset list is a local constant and not fetched.
  - Maintain mobile-friendly tap targets and spacing.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- 

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
