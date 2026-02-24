# Task Card

## Task metadata

- Task ID: `T-20260224-01`
- Title: M4 session recorder UI persistence wiring with M3 autosave SLA and lifecycle flush integration
- Status: `in_progress`
- Owner: `AI + human reviewer`
- Session date: `2026-02-24`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M4-session-list-screen-and-data-wiring.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`
- Supporting contract reference (autosave SLA + deferred UI hookup): `docs/specs/milestones/M3-session-domain-local-autosave.md`

## Objective

Integrate `apps/mobile/app/session-recorder.tsx` with the existing local draft persistence/autosave primitives so recorder edits persist under the existing M3 autosave SLA, lifecycle flushes happen on navigation/background/unmount (best effort for app exit), and the session list shows correct active-session summary data (including live elapsed duration).

## Scope

### In scope

- Wire session recorder UI state to local draft persistence APIs:
  - load latest draft/active snapshot on entry (deterministic resume behavior)
  - persist edits with existing M3 autosave SLA (`3s` text debounce, immediate structural writes, `10s` dirty cap)
  - keep stable persisted `sessionId` while editing/resuming
- Hook recorder lifecycle flushes using existing helper contracts / React Native events:
  - navigation out / screen blur
  - route change (if applicable in current routing setup)
  - app moves to background/inactive
  - screen unmount/dispose as best-effort exit flush
- Ensure `Start Session` + recorder edits produce correct session-list active summary metrics from local DB:
  - exercise count
  - set count
  - gym name (when selected)
- Add live elapsed duration rendering for active session rows in session list (computed from `startedAt` when `status === 'active'`, not from `durationSec`)
- Add targeted tests for the reported journey:
  - open app -> start session -> add exercise -> log set -> navigate back -> active row shows correct summary data
- Update task/milestone docs touched by this work at closeout.

### Out of scope

- Changing the M3 autosave timing policy constants/SLA semantics.
- Completed-session detail/read-only navigation.
- Backend sync/outbox propagation.
- Hard app-process-kill durability guarantees beyond best-effort lifecycle flushes.
- Schema changes unless a blocker is discovered.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Start a new session and return to list
   - Trigger: User opens session list and taps `Start Session`.
   - Steps: List creates/resumes active local record -> recorder opens -> user adds exercise/set -> user navigates back to list.
   - Success outcome: List shows the same active session with updated summary data (live duration, exercise count, set count, gym if selected).
   - Failure/edge outcome: If a flush is still in-flight while navigating back, UI remains stable and converges to persisted values after reload.
2. Flow name: Resume editing and preserve draft across lifecycle transitions
   - Trigger: User edits recorder fields, then backgrounds app or navigates away.
   - Steps: Edits mark draft dirty -> autosave policy schedules/writes -> lifecycle flush fires on blur/background/unmount -> user returns later.
   - Success outcome: Recorder restores the latest persisted draft/active session with minimal data loss window per M3 SLA.
   - Failure/edge outcome: If a write fails, UI remains usable and failure is surfaced in a test-covered non-crashing path.
3. Flow name: Active duration on list remains meaningful before completion
   - Trigger: User views session list while a session is active.
   - Steps: List reads active session summary -> duration token renders from elapsed time since `startedAt`.
   - Success outcome: Active row does not misleadingly show `0m` solely because `durationSec` is materialized only on completion.
   - Failure/edge outcome: Invalid/missing timestamps degrade safely to compact fallback display.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Preserve existing session-recorder UI structure; this task primarily changes persistence behavior and lifecycle integration.
- Recorder interactions should remain responsive while autosave runs in the background.
- Session-list active row should continue using compact summary tokens with no new navigation affordances.
- Avoid flicker between `Start Session` and active-row states during immediate post-start persistence/load transitions.

## Acceptance criteria

1. `apps/mobile/app/session-recorder.tsx` persists recorder state to local DB using the existing M3 autosave SLA (no policy regression).
2. Recorder performs best-effort flush on screen blur/navigation out, app background/inactive, and unmount/dispose.
3. `Start Session -> add exercise -> log set -> back to list` shows an active session row with correct persisted `exerciseCount` and `setCount`.
4. Active session row duration is rendered as live elapsed time from `startedAt` while active (not solely from `durationSec`).
5. Returning to the recorder restores the same active draft/session (stable `sessionId`) rather than creating duplicate active records.
6. Existing session-list active-session gating (`Start` hidden while active exists) remains intact.
7. Targeted tests cover autosave/lifecycle integration and the reported start/edit/back-to-list journey.
8. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.
9. `npm run test:e2e:ios:smoke` passes in `apps/mobile` (flow may need update if assertions change).

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted recorder integration tests (React Native Testing Library + fake timers where needed) for autosave scheduling and lifecycle flush behavior at the screen level
  - targeted session-list/route regression test for `start -> edit -> back` active summary correctness
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run test:e2e:ios:smoke`
- Notes:
  - Prefer explicit test seams for time (`Date.now` / injected clock where practical) to make active-duration assertions deterministic.
  - If lifecycle event hooks require platform APIs in tests, mock app-state/navigation listeners rather than weakening behavior coverage.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/__tests__/**`
  - `apps/mobile/src/session-recorder/**`
  - `apps/mobile/src/data/**` (only if required for integration seams; avoid unnecessary schema changes)
  - `apps/mobile/.maestro/flows/smoke-launch.yaml` (if E2E flow assertions/steps require updates)
- Constraints/assumptions:
  - Reuse existing M3 autosave controller + lifecycle helper contracts rather than introducing a second autosave scheduler.
  - "Application exit" is implemented as best effort through background/inactive + unmount/dispose flush; no guaranteed kill callback exists on mobile.
  - Do not introduce hard-delete semantics or alter session-list soft-delete behavior from `T-20260220-06`.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- `npm run test:e2e:ios:smoke` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Targeted test evidence for recorder autosave/lifecycle integration and `start -> edit -> back` list summary correctness.
- Brief mapping from lifecycle triggers to implemented flush hooks (`blur`, `route`, `background/inactive`, `dispose`).
- Maestro smoke output summary and screenshot paths.
- Any deviations/limitations (especially best-effort exit semantics) called out explicitly.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update parent milestone task breakdown/status in the same session.
