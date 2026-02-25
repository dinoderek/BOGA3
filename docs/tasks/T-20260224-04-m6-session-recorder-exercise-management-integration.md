# Task Card

## Task metadata

- Task ID: `T-20260224-04`
- Title: M6 connect session-recorder exercise manage/add flows to exercise catalog editor
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-25`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#explicitly-deferred-after-mvp`
- Milestone spec: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`

## Objective

Integrate the M6 exercise catalog management/editing experience into the existing session recorder `Log new exercise -> Manage / Add new` flows so users can reach the persistent muscle-linking editor from the recorder and return without breaking recorder behavior.

## Scope

### In scope

- Link the session recorder exercise picker/manage/add flows to the persistent exercise catalog editor introduced in `T-20260224-03`.
- Define and implement a clear navigation/return path between:
  - session recorder exercise picker/manage UI
  - exercise catalog editor route/screen
- Ensure changes made in the exercise catalog editor are reflected when returning to the recorder exercise selection flow.
- Preserve existing recorder behaviors for selecting/changing exercises and managing sets.
- Add UI interaction coverage for the integration path (open from recorder -> edit/create -> return -> select/use updated exercise).

### Out of scope

- Redesigning the entire session recorder exercise modal UX.
- Replacing all in-memory recorder exercise preset management with the full repository model if a smaller integration shim is sufficient.
- Historical mapping/versioning behavior for completed sessions.
- Backend sync/API integration for exercise definitions/mappings.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Open persistent exercise editor from recorder add/manage flow
   - Trigger: User is in the session recorder exercise picker and needs to add or edit an exercise definition with muscle links.
   - Steps: Open `Log new exercise` -> tap manage/add affordance -> navigate to exercise catalog editor -> save changes -> return to recorder.
   - Success outcome: User returns to the recorder flow and can continue logging without losing recorder context.
   - Failure/edge outcome: If load/save fails, the recorder remains usable and the user gets clear feedback.
2. Flow name: Use newly created or updated exercise in recorder
   - Trigger: User creates/updates an exercise in the catalog editor while entering a session.
   - Steps: Create/update exercise -> return to recorder picker -> select the new/updated exercise.
   - Success outcome: Recorder picker shows the updated list and selection works normally.
   - Failure/edge outcome: If the catalog refresh fails, the user sees a recoverable message and can retry or continue with existing entries.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Recorder should preserve the current draft session state while navigating out to the catalog editor.
- The path to the persistent editor should be explicit from both `Manage` and `Add new` entry points, or a single clear unified action if simplifying.
- Return behavior should feel predictable (no dead-end navigation or duplicated modals).
- Avoid introducing a second conflicting “edit exercise” model in the recorder once integration is added.

## Acceptance criteria

1. Session recorder exercise add/manage flow provides access to the persistent exercise catalog editor introduced in `T-20260224-03`.
2. User can create or edit an exercise in the catalog editor and return to the recorder flow.
3. Recorder exercise picker reflects the newly created/updated exercise after return (without requiring app restart).
4. Existing recorder exercise selection/change flow continues to work after integration.
5. UI tests cover the integration path and at least one successful return-and-use flow.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted recorder/catalog integration UI interaction tests
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
- Notes:
  - Prefer keeping integration tests deterministic with mocked data-layer calls and route navigation.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/app/exercise-catalog.tsx`
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/src/data/**` (only if integration refresh hooks/contracts require it)
  - `apps/mobile/app/__tests__/**` for recorder/catalog flow tests
- Constraints/assumptions:
  - M6 taxonomy remains system-defined and non-editable.
  - Reuse the persistent editor route/UI from `T-20260224-03` rather than duplicating muscle-link editing controls in recorder modal state.
  - Preserve recorder autosave/session draft behavior while adding navigation.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted recorder/catalog integration UI tests

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- UI flow evidence (test trace summary) for recorder -> catalog -> recorder return path.
- Evidence that updated/new exercise is selectable in recorder after return.
- Test/gate results summary.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update parent milestone task breakdown/status in the same session.
