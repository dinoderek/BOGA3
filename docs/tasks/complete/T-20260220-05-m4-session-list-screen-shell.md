# Task Card

## Task metadata

- Task ID: `T-20260220-05`
- Title: M4 session list screen shell with active-session gating
- Status: `outdated`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M4-session-list-screen-and-data-wiring.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`

## Objective

Create the session list screen UI shell as the app home route with active/completed sections, active-session gating (`Start` vs `Resume/Close`), deleted-session visibility option, and compact duration display.

## Scope

### In scope

- Add a new `session-list` screen route.
- Make session list the primary app landing route.
- Build UI shell sections for:
  - Active (single-slot surface)
  - Completed history
- Add active-session action gating:
  - show `Start Session` only when there is no active session
  - when active exists, show only `Resume Active` and `Close Active`
- Render completed-session rows as explicitly disabled/non-interactive.
- Add control to toggle deleted-session visibility in history.
- Use compact duration display format for completed rows.
- Add empty-state presentation (`No sessions yet`) when all sections are empty.

### Out of scope

- Real local-DB data loading.
- Session row detail navigation.
- Delete/archive actions.
- Any schema or migration changes.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Open app with no active session
   - Trigger: User launches app.
   - Steps: Home route opens -> user sees `Start Session` and completed history.
   - Success outcome: Active and completed areas are visually distinct and understandable within first scan.
   - Failure/edge outcome: With no data, user sees clear empty state and still has `Start Session` action.
2. Flow name: Open app with active session
   - Trigger: User lands on session list while an active session exists.
   - Steps: Home route opens -> `Start Session` is hidden -> `Resume Active` and `Close Active` are shown.
   - Success outcome: User can only resume or close the current active session.
   - Failure/edge outcome: `Start Session` is never shown concurrently with active-session actions.
3. Flow name: Attempt to open completed row
   - Trigger: User taps a completed-session row.
   - Steps: Tap row UI.
   - Success outcome: Row is visually disabled and does not navigate.
   - Failure/edge outcome: No accidental route transition occurs.
4. Flow name: Toggle deleted-session visibility
   - Trigger: User enables/disables deleted-session visibility option.
   - Steps: Toggle control -> list presentation changes.
   - Success outcome: Deleted rows are shown/hidden according to the toggle state.
   - Failure/edge outcome: Active-session controls remain unaffected by deleted visibility state.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Use section headers that clearly separate active and completed buckets.
- Keep the primary action area stable while switching between `Start Session` and `Resume Active`/`Close Active`.
- Completed rows must communicate disabled state (style + accessibility).
- Show compact duration tokens in completed rows for quick scanning.
- Maintain thumb-friendly spacing for row scanning and action tapping.

## Acceptance criteria

1. App home route renders the session list shell instead of the temporary foundation landing content.
2. When no active session exists, `Start Session` is visible and navigates to `/session-recorder`.
3. When active session exists, `Start Session` is hidden and only `Resume Active`/`Close Active` actions are visible.
4. Completed rows are disabled (no navigation on press).
5. Deleted-session visibility toggle is present and updates list presentation.
6. Completed rows display compact duration formatting.
7. Empty state appears when all sections have no items.
8. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted screen tests for active-session gating (`Start` vs `Resume/Close`), deleted-visibility toggle, compact duration display, and disabled completed-row behavior
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e:ios:smoke`
- Notes:
  - Include at least one happy-path assertion and one edge assertion for disabled-row behavior.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/index.tsx`
  - `apps/mobile/app/session-list.tsx` (new)
  - `apps/mobile/app/_layout.tsx` (if route-title updates are needed)
  - `apps/mobile/app/__tests__/**`
- Constraints/assumptions:
  - Use temporary in-memory/mock list data for shell rendering until data wiring task.
  - Mock states must include active, completed, and deleted variants.
  - Keep completed-row onPress intentionally absent for this phase.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- `npm run test:e2e:ios:smoke` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Test evidence summary for happy-path + edge-path assertions.
  - Happy path: `apps/mobile/app/__tests__/session-list-screen.test.tsx` verifies `Start Session` (no active) and `Resume Active` (active exists) gating plus navigation to `/session-recorder`.
  - Edge path: same test verifies completed rows are disabled and `fireEvent.press` does not trigger navigation.
  - Deleted visibility + compact duration: same test verifies hidden/deleted history toggle and compact duration tokens (`58m`, `1h 5m`).
- Screenshot paths for session-list empty/happy-path states.
  - Happy-path launch (session list visible): `/Users/dinohughes/Projects/scaffolding2/apps/mobile/artifacts/maestro/T-20260220-05/20260223-143137-62605/maestro-output/01-app-launch.png`
  - Empty-state screenshot: pending (not captured in this session).
- UX-contract traceability notes.
  - Flow 1 (`no active`) mapped to `SessionListScreenShell` conditional action panel and `start-session-button` test assertions.
  - Flow 2 (`active exists`) mapped to `Resume Active`/`Close Active` gating and home-route shell render in `app/__tests__/index.test.tsx`.
  - Flow 3 (completed row tap) mapped to disabled completed row rendering with absent `onPress` and disabled accessibility state assertions.
  - Flow 4 (deleted visibility) mapped to `toggle-deleted-sessions-button` state toggle and filtered completed-history rendering.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Added `apps/mobile/app/session-list.tsx` session-list home shell with mock active/completed/deleted variants, active-session action gating (`Start` vs `Resume/Close`), deleted-history visibility toggle, compact duration formatting, disabled completed rows, and empty-state UI.
  - Changed `apps/mobile/app/index.tsx` to render the session-list shell as the home route and updated `apps/mobile/app/_layout.tsx` route titles for `index` and `session-list`.
  - Added targeted route tests in `apps/mobile/app/__tests__/session-list-screen.test.tsx` and updated `apps/mobile/app/__tests__/index.test.tsx`.
  - Updated `apps/mobile/.maestro/flows/smoke-launch.yaml` to assert the new home route and open the recorder via `Resume Active` or `Start Session`.
- What tests ran:
  - `npm run test -- app/__tests__/session-list-screen.test.tsx`
  - `npm run test -- app/__tests__/index.test.tsx`
  - `HOME=/tmp EXPO_NO_TELEMETRY=1 npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `TASK_ID=T-20260220-05 npm run test:e2e:ios:smoke`
- What remains:
  - None for this card. The task is being archived as `outdated` because later session-list work changed the route contract beyond the original shell-only scope.

## Outdated note

- Why outdated:
  - Later M4/M7 work added DB-backed list wiring, completed-session detail navigation, and interactive completed-session actions, so this card's original disabled-row shell contract is no longer the authoritative description of the shipped behavior.
- Archive reason:
  - Keep the implementation history, but stop tracking this card as an active/incomplete task.
