# Task Card

## Task metadata

- Task ID: `T-20260219-01`
- Title: M1 session recorder screen shell and state model
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

Create the first routable screen shell for gym session recording with typed in-memory state for session-level inputs, including location add/select/delete controls and empty exercise list scaffolding.

## Scope

### In scope

- Add/route a dedicated session recorder screen in `apps/mobile/app`.
- Build initial screen layout sections: header, session metadata form, exercise list placeholder, submit CTA placeholder.
- Define TypeScript UI-state types for `Session`, `Exercise`, and `Set` entities.
- Add a static mock location list and wire a location picker/select control.
  - Seed values: `Downtown Iron Temple`, `Westside Barbell Club`, `North End Strength Lab`.
- Add location management actions in UI state: add location and delete location.
- Wire controlled inputs for session metadata (date/time, location, and gym name).

### Out of scope

- Exercise/set add/remove behaviors.
- Validation rules.
- Final submit behavior.
- Any persistence or backend integration.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Select seeded location and edit session metadata
   - Trigger: User opens session recorder and wants to start a session.
   - Steps: Open route -> select seeded location -> enter date/time and gym name.
   - Success outcome: Selected location and metadata values are reflected in local UI state.
   - Failure/edge outcome: Missing/invalid value remains editable without losing prior inputs.
2. Flow name: Add and delete location option
   - Trigger: User needs a location not in the seeded list.
   - Steps: Tap add location -> enter new location -> save -> optionally delete location.
   - Success outcome: New location appears in options and can be selected; delete removes chosen option.
   - Failure/edge outcome: Deleting the active location clears selection and requires reselection.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Selecting a location updates the selected value immediately.
- Add/delete location controls are grouped with the location selector.
- Metadata fields are placed above exercise area to match data-entry order.
- Destructive location action is visually distinct from non-destructive actions.

## Acceptance criteria

1. Session recorder route is reachable from app navigation.
2. Session metadata inputs (including location picker) render and update in-memory state.
3. Typed UI-state model exists for `Session -> Exercise -> Set`.
4. Seeded mock location options are visible/selectable from the picker.
5. User can add and delete locations in local UI state.
6. Baseline screen render test passes.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - `npm run test -- app/__tests__/session-recorder-screen.test.tsx`
  - `npm run lint`
  - `npm run typecheck`
- Notes:
  - Cover seeded location selection, add location, and delete location flows.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/app/**`, `apps/mobile/components/**`, `apps/mobile/app/__tests__/**`
- Constraints/assumptions:
  - Keep state local to the screen.
  - Mock location options are static constants and not fetched.
  - Do not introduce storage dependencies.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- 

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
