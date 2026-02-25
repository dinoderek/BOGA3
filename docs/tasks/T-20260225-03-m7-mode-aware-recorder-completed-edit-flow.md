# Task Card

## Task metadata

- Task ID: `T-20260225-03`
- Title: M7 mode-aware recorder refactor for completed-session edit with continuous autosave and time editing
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
- Dependency task contracts:
  - `docs/tasks/T-20260225-01-m7-completed-session-detail-route-and-read-only-ui.md`
  - `docs/tasks/T-20260225-02-m7-completed-session-data-contracts-edit-and-reopen.md`

## Objective

Refactor the current session recorder into a mode-aware screen/controller that reuses shared presentation and editing logic for active recording and completed-session editing, while adding completed-edit continuous autosave, start/end time editing, and save-return-to-list behavior without regressing the existing active recorder flow.

## Scope

### In scope

- Introduce explicit screen/controller modes (naming may vary) covering at least:
  - active create/resume recorder
  - completed read-only (if shared screen route consumes the same core component)
  - completed edit
- Separate shared presentation logic from mode-specific behavior:
  - shared metadata/exercise/set rendering and interaction components
  - capability flags / action handlers by mode
  - route wrappers remain thin
- Completed edit load path uses session ID from route/params and new load-by-id repository contract (not `loadLatestSessionDraftSnapshot()`).
- Completed edit supports continuous autosave with lifecycle flush behavior comparable to current active recorder resilience.
- Add editable start and end time controls for completed edit with clear validation feedback.
- Keep cleanup prompts for incomplete sets / empty exercises on completed edit save path.
- Save/finish completed edit returns user to session list route.
- Wire `Reopen session` button from detail to repository reopen action and list refresh/nav behavior (disabled-state explanation behavior may be split with Task 01 if needed, but final behavior lands by end of this task).
- Preserve active-recorder existing behavior and autosave SLA semantics.

### Out of scope

- New date/time picker dependency adoption beyond what is needed for MVP-quality time editing in this flow.
- Sync/outbox behavior for edit/reopen events.
- New analytics features derived from edit history.
- Major visual redesign of the recorder screen.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Edit a completed session and save changes
   - Trigger: User opens completed-session detail and taps `Edit session`.
   - Steps: Detail opens completed edit mode -> user changes gym/exercises/sets and/or start/end times -> autosave runs in background while editing -> user taps save/finish.
   - Success outcome: Session remains completed, updated duration/timestamps persist, and app returns to session list reflecting changes.
   - Failure/edge outcome: Invalid start/end times block final save with clear feedback; in-progress edits are not lost during lifecycle interruptions because autosave persists them.
2. Flow name: Reopen completed session with no active conflict
   - Trigger: User opens completed-session detail and taps `Reopen session` when no active session exists.
   - Steps: UI invokes reopen -> repository mutates same session to active -> app returns/list refreshes.
   - Success outcome: Same session ID appears in active section and is no longer shown as completed until completed again.
   - Failure/edge outcome: If repository rejects reopen unexpectedly, UI remains stable and shows non-destructive error feedback.
3. Flow name: Reopen blocked by existing active session
   - Trigger: User opens completed-session detail while another active session exists.
   - Steps: Detail renders disabled `Reopen session` action with explanatory text.
   - Success outcome: User understands why the action is unavailable and can return to list/active session path.
   - Failure/edge outcome: Action does not become silently tappable due to stale UI state without backend/repository validation.
4. Flow name: Resume active recorder behavior unchanged
   - Trigger: User starts/resumes an active session from session list.
   - Steps: Existing recorder flow opens -> edits autosave and submit as before.
   - Success outcome: No regression in active recorder flow after mode-aware refactor.
   - Failure/edge outcome: Tests catch accidental cross-mode loading or wrong submit behavior.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Prioritize structural reuse: shared screen sections/components should render across read-only and edit modes with mode-specific affordances layered in.
- Time editing controls should be split into explicit `Start` and `End` inputs/controls with format hints and inline validation; avoid overloading the existing single read-only datetime field.
- Completed edit should visually indicate “editing a completed session” to reduce confusion with active logging.
- Autosave should remain invisible by default; if status text is added, keep it subtle and non-blocking.
- Save action label should differentiate completed-edit finalization from active session submit (e.g., `Save Changes` vs `Submit Session`).

## Acceptance criteria

1. Recorder/detail implementation supports explicit mode-aware behavior and does not rely on implicit “latest active draft” restoration for completed edit/view.
2. Shared presentation logic is used across active recorder and completed view/edit flows, reducing duplicated content-tree JSX and formatter logic.
3. Completed edit loads and edits the selected session by ID and persists ongoing edits with continuous autosave + lifecycle flush semantics.
4. Completed edit exposes separate start/end time controls and validates invalid time ranges with clear feedback.
5. Completed edit save preserves `status = completed`, runs cleanup prompts for incomplete sets/empty exercises, and returns to session list.
6. Detail `Reopen session` action is disabled with explanation when an active session exists and performs in-place reopen when no active session exists.
7. Active recorder create/resume and submit flows continue to work without behavioral regression.
8. Targeted UI tests cover completed edit autosave/time validation/reopen gating and active-flow regression.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted recorder/detail mode tests (RNTL + fake timers)
  - targeted route tests for edit/reopen flows and disabled reopen explanation
  - targeted regression tests for active recorder submit/autosave
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - UI integration tests (mode + route behavior)
  - UI interaction/state tests (autosave timing, validation, disabled actions)
  - Regression tests for existing recorder/list flows
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always` for targeted mode/edit/reopen and active-regression tests during refactor
  - milestone closeout via full `npm run test`
- CI/manual posture note (required when CI is absent or partial):
  - No CI pipeline is available; this task requires local targeted tests plus full local verify gates, with manual UX checks documented in evidence.
- Notes:
  - Add explicit test fixtures for mode + route params to prevent hidden coupling to “latest draft” behavior.
  - Prefer capability-flag assertions (visible/disabled actions, input editability) over brittle implementation inspection.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/app/**` (completed detail/edit route wrappers if split)
  - `apps/mobile/components/session-recorder/**`
  - `apps/mobile/src/session-recorder/**`
  - `apps/mobile/src/data/index.ts` (consumer wiring only; primary contracts from Task 02)
  - `apps/mobile/app/__tests__/**`
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - May introduce/refine shared session screen/controller modules within existing `apps/mobile/components/session-recorder` or `apps/mobile/src/session-recorder` paths; no top-level structure changes expected.
- Constraints/assumptions:
  - Reuse the existing autosave controller/lifecycle helper pattern; do not introduce a second autosave scheduler.
  - Keep route wrappers thin and push mode-specific branching into controller/config layers to minimize duplication.
  - Favor a single shared “session content” tree with mode capability props over separate `ViewSession` and `EditSession` component copies.
  - Preserve existing accessibility labels where possible; add new labels for time controls and disabled reopen explanation.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted completed-edit/reopen and active-regression tests

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Screenshots/captures for:
  - completed detail read-only
  - completed edit with time controls
  - invalid time feedback
  - disabled reopen explanation state
- Test evidence for autosave persistence in completed edit and active-recorder regression coverage.
- Contract traceability notes mapping mode behaviors to acceptance criteria.
- If a new reusable pattern is formalized (mode-capability screen pattern), update `docs/specs/08-ux-delivery-standard.md`.
- Manual verification summary (required when CI is absent/partial):
  - Summarize local manual checks for completed edit autosave resilience (navigation/background), time validation UX, and reopen disabled/enabled states.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
