# Milestone Spec

## Milestone metadata

- Milestone ID: `M4`
- Title: Session list home screen and local data wiring
- Status: `in_progress`
- Owner: `AI + human reviewer`
- Target window: `2026-02`

## Parent references

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Milestone objective

Ship a session list home screen that presents active and completed sessions from local SQLite/Drizzle data, enforces single-active-session UX gating, and supports soft-delete-safe history visibility.

## In scope

- Add a dedicated session list route and make it the primary landing screen.
- Add session-list UI sections:
  - separate `Active` section
  - `Completed` history section
  - option to show deleted sessions
- Enforce active-session gating:
  - when no active session exists, show `Start Session`
  - when an active session exists, hide `Start Session` and allow only `Resume Active` or `Close Active`
- Keep completed-row tap target disabled for this milestone.
- Wire list content to local data-layer query contracts.
- Enforce/guard one-active behavior in list/query contract.
- Implement soft-delete-aware behavior for session records used by list queries.
- Use compact duration display format for completed rows.

## Out of scope

- Completed-session detail screen.
- Reopening completed sessions for edit.
- Cloud sync/outbox propagation.
- Group/social ranking features.

## Deliverables

1. Session list screen implemented as the app home route with required sections and states.
2. Local data query/repository contract for session-list summaries (`active`, `completed`, and soft-deleted visibility toggle).
3. Active-session action gating (`Start Session` vs `Resume Active`/`Close Active`).
4. Compact duration formatting for completed rows.
5. Soft-delete-safe list behavior (and schema/migration updates if required by implementation).
6. Tests for happy-path and edge-path list behavior plus standard verify gates, including E2E flow:
   - `session list -> start session -> add exercise -> log set -> save session`

## Acceptance criteria

1. Session list is the default app landing route.
2. At most one active session is surfaced by the list contract and rendered in a dedicated active section.
3. When no active session exists, `Start Session` is visible; when an active session exists, `Start Session` is hidden and only `Resume Active` and `Close Active` actions are available.
4. Completed sessions are rendered in descending `completedAt` order with compact duration formatting.
5. Completed-session rows are visibly non-interactive (tap disabled) in this phase.
6. List behavior supports toggling deleted-session visibility while preserving soft-delete-only semantics (no hard delete dependency).
7. E2E flow passes: `session list -> start session -> add exercise -> log set -> save session`.
8. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Task breakdown

1. `docs/tasks/T-20260220-05-m4-session-list-screen-shell.md` - `in_progress` (implementation + verify gates complete; pending empty-state screenshot evidence and final task closeout).
2. `docs/tasks/T-20260220-06-m4-session-list-data-wiring-and-soft-delete.md` - `completed`.

## Risks / dependencies

- Depends on M3 active/completed persistence behavior to provide meaningful session-list data.
- If one-active enforcement requires schema constraints, migration compatibility for existing local data must be handled explicitly.
- Soft-delete policy must remain consistent across future session-detail and sync milestones.
- `apps/mobile/.maestro/flows/data-runtime-smoke.yaml` is stale after the M4 home-route change (still asserts `home-foundation-ready`), so native runtime data-smoke evidence needs a flow update before reuse.

## Decision log

- Date: 2026-02-20
- Decision: Treat session list as new home route with explicit active/completed separation.
- Reason: Keep the primary workflow focused on current in-progress work plus history.
- Impact: Home navigation and query contracts now require bucketed session summaries.

- Date: 2026-02-20
- Decision: Enforce one active session contract with action gating (`Start Session` only when no active; otherwise `Resume Active`/`Close Active`), with completed-row taps disabled for this phase.
- Reason: Reduce UX ambiguity while detail/read-only flows are not yet scheduled and prevent parallel in-progress sessions.
- Impact: Data contract and UI both need explicit guards for single active state and conditional action rendering.

- Date: 2026-02-20
- Decision: Standardize session deletion on soft delete only.
- Reason: Preserve recoverability and future sync/audit compatibility.
- Impact: List/repository logic must filter soft-deleted rows by default and support an explicit deleted-visibility toggle.

- Date: 2026-02-20
- Decision: Use compact duration formatting in completed history rows.
- Reason: Improve list scanability on mobile without losing duration signal.
- Impact: Session summary mapping must include deterministic compact duration formatting for UI and tests.
