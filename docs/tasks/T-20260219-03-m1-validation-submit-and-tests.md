# Task Card

## Task metadata

- Task ID: `T-20260219-03`
- Title: M1 validation, submit UX, and closeout tests
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

Finalize the UI-only session recorder by adding client-side validation, non-persistent submit confirmation, and full milestone-closeout test coverage.

## Scope

### In scope

- Required-field validation for session metadata (including location selection) and minimum logging shape.
- Validation messages for missing/invalid inputs.
- Submit action that shows confirmation/summary and explicit non-persistence notice.
- Optional reset action after successful submit.
- Final test coverage for happy path and validation failures, including preset-backed location/exercise selections.

### Out of scope

- Writing any data to local DB or remote backend.
- Offline sync behavior.
- Authentication/authorization.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Invalid submit and correction
   - Trigger: User taps submit with incomplete or invalid data.
   - Steps: Tap submit -> read validation feedback -> correct fields -> resubmit.
   - Success outcome: Validation errors clear after fixes and submit can proceed.
   - Failure/edge outcome: Remaining invalid fields keep submit blocked with actionable feedback.
2. Flow name: Successful submit and new entry
   - Trigger: User submits with valid seeded location/exercise data.
   - Steps: Submit valid form -> review confirmation and non-persistence notice -> trigger reset/new entry.
   - Success outcome: Success summary is shown, then reset returns flow to clean start state.
   - Failure/edge outcome: If reset is cancelled/unavailable, existing valid data remains visible.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Validation feedback is visually tied to related fields.
- Success message is visually distinct from validation messaging.
- Non-persistence notice is explicit in the success state.
- Reset/new-entry affordance is clear after successful submit.

## Acceptance criteria

1. Submit is blocked until required fields are valid, including a selected location.
2. Validation feedback is visible and actionable.
3. Successful submit shows session summary and clearly states data is not saved.
4. User can start a fresh entry after successful submit.
5. Full quality gates pass for `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - `npm run test -- app/__tests__/session-recorder-submit.test.tsx`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - Cover invalid submit, correction/resubmit, success confirmation, and new-entry reset flows.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/app/**`, `apps/mobile/components/**`, `apps/mobile/app/__tests__/**`
- Constraints/assumptions:
  - Keep submit behavior UI-only and explicit about no persistence.
  - Ensure messaging is clear enough to avoid user confusion.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- 

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
