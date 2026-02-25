# Task Card

## Task metadata

- Task ID: `T-20260225-04`
- Title: M7 completed-session view/edit/reopen integration tests and UX evidence closeout
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-25`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M7-completed-session-detail-reopen-and-edit.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md` (always load for context; update only when task changes paths/layout/conventions)
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`
- Dependency task cards:
  - `docs/tasks/T-20260225-01-m7-completed-session-detail-route-and-read-only-ui.md`
  - `docs/tasks/T-20260225-02-m7-completed-session-data-contracts-edit-and-reopen.md`
  - `docs/tasks/T-20260225-03-m7-mode-aware-recorder-completed-edit-flow.md`

## Objective

Close out M7 with Jest/React Native Testing Library integration-focused test coverage (not Maestro E2E) and UX evidence, validating end-to-end app-screen behavior across session list, completed detail, completed edit, and reopen flows while guarding against regressions in M4/M3 session-list and recorder behaviors.

## Scope

### In scope

- Add or extend Jest/React Native Testing Library integration tests that exercise the core M7 user journeys end to end at app-screen level (mocked repository as needed).
- Validate list refresh/navigation correctness after:
  - completed edit save (return to list)
  - in-place reopen
- Add edge-path coverage for:
  - disabled reopen when active session exists
  - invalid time edits
  - delete/undelete still working after row navigation was added
- Review and update existing session-list/session-recorder tests for changed assumptions or identifiers.
- Produce required UX evidence artifacts for M7 UI tasks and traceability notes.
- Update milestone/task statuses and completion notes if M7 is completed in the same session.

### Out of scope

- New feature behavior beyond what prior M7 tasks define.
- Backend/sync verification.
- Large visual polish redesigns not tied to failing UX evidence review.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Completed session view -> edit -> save -> list refresh
   - Trigger: User opens a completed session and edits it.
   - Steps: Tap completed row -> detail -> edit -> modify content/time -> save -> return to list.
   - Success outcome: List reflects updated duration/date ordering/summary data and session remains completed.
   - Failure/edge outcome: Invalid time edit path is blocked and user receives clear feedback before save.
2. Flow name: Completed session reopen with and without active conflict
   - Trigger: User taps `Reopen session` from completed detail.
   - Steps: Case A no active session -> reopen succeeds; Case B active session exists -> action disabled with explanation.
   - Success outcome: Case A moves same record to active section; Case B prevents action and communicates why.
   - Failure/edge outcome: No duplicate active sessions are surfaced in UI state after retries/refresh.
3. Flow name: History row actions remain correct after row-open is added
   - Trigger: User interacts with completed row body and kebab menu in history.
   - Steps: Tap row body (open detail) and tap kebab menu (delete/undelete modal) in separate interactions.
   - Success outcome: Interactions remain distinct and predictable.
   - Failure/edge outcome: No accidental navigation on menu taps.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Evidence capture should include at least one long-content detail/edit state to verify scroll usability.
- Validate action hierarchy clarity (`Edit`, `Reopen`, save/cancel) in screenshots, not just tests.
- Ensure disabled `Reopen` explanation is readable without relying only on button disabled styling.
- Confirm completed row interactivity remains discoverable after final styling tweaks.

## Acceptance criteria

1. Integration tests cover `completed row -> detail -> edit -> save -> list refresh` happy path.
2. Integration tests cover `completed row -> detail -> reopen` happy path with same-record active result.
3. Integration tests cover disabled reopen explanation when an active session exists.
4. Integration tests cover invalid completed-edit time validation path.
5. Integration/regression tests confirm completed-row menu delete/undelete still works and does not trigger row navigation.
6. M3/M4 core behaviors (active recorder autosave/submit and session-list active gating) remain covered by passing tests after M7 changes.
7. UX evidence artifacts satisfy `docs/specs/08-ux-delivery-standard.md` requirements for key happy-path and edge-path flows.
8. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted integration tests for M7 cross-screen journeys
  - targeted regression tests for session-list and session-recorder
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - UI integration journey tests
  - Regression test suites for session-list/session-recorder
  - UX evidence/manual verification artifacts (non-automated)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - milestone closeout (primary)
  - file-change-triggered if earlier M7 tasks alter route/test IDs and this task is updated incrementally
- CI/manual posture note (required when CI is absent or partial):
  - No CI pipeline exists; this task is responsible for documenting local verify-gate runs and manual UX evidence as closeout proof.
- Notes:
  - Prefer deterministic fake-clock inputs for duration/time assertions after edits.
  - If E2E/maestro coverage is added later, document separately; not required in this task unless M7 implementation changes existing smoke flows.

## Implementation notes

- Planned files/areas allowed to change:
- `apps/mobile/app/__tests__/**` (Jest + React Native Testing Library)
  - `docs/tasks/T-20260225-0{1,2,3,4}-*.md` (status/evidence/closeout updates)
  - `docs/specs/milestones/M7-completed-session-detail-reopen-and-edit.md` (task status updates / completion note)
  - screenshot/evidence artifact paths used by the team workflow
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - No project-structure change expected; this task updates tests/docs/evidence only unless a test-discovered regression fix requires localized code changes.
- Constraints/assumptions:
  - This task is primarily verification and closeout; avoid opportunistic feature changes unless fixing test-discovered regressions.
  - "Integration tests" in this task means Jest/RNTL app-screen integration tests in the current test stack, not Maestro E2E flows.
  - If new UX patterns were introduced in prior tasks and not yet documented, this task must ensure `docs/specs/08-ux-delivery-standard.md` is updated before closeout.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted M7 integration journey tests

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Test evidence for each M7 key flow and edge path listed in this task’s UX contract.
- Visual evidence (screenshots/captures) for happy-path and failure/edge states.
- Contract traceability mapping of M7 UX contract flows to tests/screenshots.
- Pattern maintenance evidence (if `docs/specs/08-ux-delivery-standard.md` changed).
- Manual verification summary (required when CI is absent/partial):
  - Summarize local manual UX walkthrough outcomes and any limitations/deferred checks due to absent CI or device constraints.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
