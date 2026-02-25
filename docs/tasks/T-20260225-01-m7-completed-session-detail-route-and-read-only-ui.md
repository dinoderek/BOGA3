# Task Card

## Task metadata

- Task ID: `T-20260225-01`
- Title: M7 completed-session detail route and recorder-like read-only UI (reuse-first shell)
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
- Existing UI references:
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/session-recorder.tsx`

## Objective

Add a completed-session detail route reachable from completed session rows and implement a recorder-like read-only detail UI by extracting/reusing presentation structure from the current recorder screen rather than duplicating a parallel screen layout.

## Scope

### In scope

- Add completed-session row tap navigation from `session-list` to a new detail route.
- Expand completed-row kebab menu to include `Edit`, `Reopen`, and `Delete`/`Undelete` actions while making row-body tap open detail.
- Create a completed-session detail route shell that loads the target session by ID via injected/mockable data client seam (real repository wiring may be temporary/minimal until Task 02 completes).
- Implement recorder-like read-only rendering for:
  - session metadata summary
  - gym display
  - exercise cards
  - set rows
- Establish shared presentation seam(s) to minimize duplication with `session-recorder`:
  - extract reusable display components/layout blocks from recorder where practical
  - or define shared `SessionContent` rendering primitives consumed by both screens
- Add detail screen actions UI shell:
  - `Edit session`
  - `Reopen session` (enabled/disabled behavior can be stubbed visually if repository wiring is pending)
  - `Delete session` / `Undelete session` (final persistence wiring may be shared with existing list action behavior)
- Add route-level tests for list-row navigation + read-only detail rendering.

### Out of scope

- Final repository implementation for completed-session load/edit/reopen (Task 02).
- Completed-session edit interactions or autosave wiring (Task 03).
- Time editing controls and validation.
- Final reopen mutation behavior.
- Full integration flow coverage (Task 04).

## UX Contract

### Key user flows (minimal template)

1. Flow name: Open completed session from history
   - Trigger: User taps the main body of a completed history row in session list.
   - Steps: List row press navigates to completed-session detail route -> detail screen loads and renders session content.
   - Success outcome: User sees a recorder-like read-only representation of the selected completed session.
   - Failure/edge outcome: If the session cannot be loaded, detail screen shows a stable error/empty state without crashing and preserves back navigation.
2. Flow name: Use row menu without accidental navigation
   - Trigger: User taps the completed-row kebab menu button.
   - Steps: Menu press opens actions (`Edit`, `Reopen`, `Delete`/`Undelete`) -> selecting a menu action performs the intended action path -> row body navigation is not triggered by the menu tap itself.
   - Success outcome: Menu actions remain discoverable and operate independently from row-open behavior.
   - Failure/edge outcome: No mixed interaction where both modal and detail navigation happen from one tap.
3. Flow name: Scan read-only completed session detail
   - Trigger: User lands on a completed-session detail screen.
   - Steps: User views metadata + exercises/sets -> sees explicit read-only/completed status -> sees `Edit session` and `Reopen session` action affordances.
   - Success outcome: Primary available actions are obvious within 3 seconds and the content looks familiar to the recorder screen.
   - Failure/edge outcome: If content is long, scrolling remains usable and layout stays readable on small phones.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Reuse recorder information hierarchy and styling tokens where possible; avoid introducing a visually separate “detail page” design language.
- Read-only state should be explicit (status label and non-editable presentation) so users do not expect inline edits.
- Row-body tap affordance in history should be visible enough to signal interactivity without adding clutter.
- Menu button tap target remains distinct from row-body press target to avoid accidental opens.
- Keep route-level screen logic thin; move shared rendering into reusable components/helpers for Task 03 reuse.

## Acceptance criteria

1. Completed history row body taps navigate to a completed-session detail route with the tapped session ID.
2. Completed history row menu button opens `Edit`, `Reopen`, and `Delete`/`Undelete` actions without triggering row navigation from the menu tap.
3. Completed-session detail renders session metadata and exercises/sets in a read-only presentation using shared/reusable rendering structure with the recorder screen (not duplicated markup blocks for the full content tree).
4. Detail screen includes visible `Edit session`, `Reopen session`, and `Delete`/`Undelete session` action affordances (behavior may be stubbed pending Task 02/03 wiring, but labels and placement are finalizable).
5. Detail screen supports loading/error/empty states with non-crashing behavior.
6. Targeted tests cover row-tap navigation, menu-vs-row interaction separation, and read-only detail rendering.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted `session-list` screen tests for completed row navigation + menu separation
  - targeted detail-screen render tests (loading, success, error)
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - UI integration (session-list row interactions and route navigation)
  - UI render/state tests (detail loading/success/error)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always` for targeted tests touching list/detail route behavior in this task
  - milestone closeout via full `npm run test`
- CI/manual posture note (required when CI is absent or partial):
  - Repo currently has no CI pipeline configured; all verification for this task is local/manual via Jest + local gates.
- Notes:
  - Prefer a mockable data-client prop or route-param-driven loader seam to keep tests deterministic before Task 02 repository wiring is complete.
  - Explicitly assert shared component usage through behavior/output contracts (not fragile implementation internals).

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/session-recorder.tsx` (only for extracting shared presentation primitives; no behavior changes unless required)
  - `apps/mobile/app/**` (new completed-session detail route)
  - `apps/mobile/components/**` or `apps/mobile/src/session-recorder/**` (shared presentation extraction)
  - `apps/mobile/app/__tests__/**`
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - Expected to add new app route file(s) and possibly shared UI component files under existing `apps/mobile/app` / `apps/mobile/components` or `apps/mobile/src/session-recorder` conventions; no top-level or cross-workspace structure changes expected.
- Constraints/assumptions:
  - Minimize duplication by extracting shared presentational blocks early in this task (metadata/exercise/set rendering) rather than cloning recorder JSX.
  - Do not force completed-edit autosave/persistence behavior into this task; keep route and shared UI extraction the focus.
  - Preserve M4 list behaviors (active-session gating, delete/undelete, sorting) except for enabling completed row open.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted session-list/detail tests added in this task

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Screenshots of:
  - session list with interactive completed rows
  - completed-session detail read-only happy path
  - detail error or empty state
- Test evidence for row-body navigation vs kebab-menu action separation, including menu action list contents.
- Contract traceability notes mapping read-only detail UX to reused recorder presentation sections.
- If a new reusable UI pattern is introduced, update `docs/specs/08-ux-delivery-standard.md`.
- Manual verification summary (required when CI is absent/partial):
  - Summarize local manual checks for row tap vs menu tap behavior and detail screen readability on at least one small-phone viewport.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
