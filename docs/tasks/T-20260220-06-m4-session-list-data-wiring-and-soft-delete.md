# Task Card

## Task metadata

- Task ID: `T-20260220-06`
- Title: M4 session list local DB wiring with single-active and soft-delete visibility contract
- Status: `completed`
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

Wire session-list UI to local SQLite/Drizzle data and implement query behavior that surfaces one active session and completed history, with soft-delete-only policy and deleted-session visibility toggle.

## Scope

### In scope

- Add local data-layer query contract for session-list buckets:
  - single active summary
  - completed summaries sorted by `completedAt DESC`
  - optional deleted-session visibility view
- Add session summary projection fields required by list rows:
  - session timing
  - gym name
  - exercise count
  - set count
  - compact duration display value
- Integrate session-list screen with repository/query layer.
- Implement soft-delete-aware filtering for session-list queries.
- Add schema/migration updates if needed to support soft delete and contract enforcement.
- Add contract tests for bucket selection, ordering, soft-delete filtering, and deleted visibility toggle behavior.

### Out of scope

- Completed-session detail/read-only screen.
- Undo/restore UI for soft-deleted sessions.
- Cloud sync or backend list hydration.

## UX Contract

### Key user flows (minimal template)

1. Flow name: View live session list from local data
   - Trigger: User opens session list after creating/editing sessions.
   - Steps: Screen loads -> query returns active/completed buckets -> UI renders bucketed summaries.
   - Success outcome: User sees up-to-date local sessions in the correct sections.
   - Failure/edge outcome: If no records are available, empty state remains stable and actionable.
2. Flow name: Data contract enforces single active surface
   - Trigger: Local dataset includes candidate active records.
   - Steps: Query layer resolves list buckets.
   - Success outcome: Exactly one active summary is surfaced to UI at most.
   - Failure/edge outcome: If dataset is inconsistent, deterministic fallback keeps UI stable and test-covered.
3. Flow name: Soft-deleted sessions are excluded
   - Trigger: Session records are marked soft-deleted.
   - Steps: User opens or refreshes session list with deleted visibility disabled.
   - Success outcome: Soft-deleted sessions do not appear in default sections.
   - Failure/edge outcome: No hard-delete requirement exists for list correctness.
4. Flow name: Show deleted sessions on demand
   - Trigger: User enables deleted-session visibility toggle.
   - Steps: Toggle enabled -> query includes soft-deleted rows in deleted view.
   - Success outcome: Deleted sessions become visible without affecting active-session gating rules.
   - Failure/edge outcome: Disabling toggle returns to default non-deleted list.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Preserve Task 1 visual structure; this task changes data source, not UX model.
- Keep completed rows disabled even after real data is wired.
- Keep summary values stable and readable (especially counts/compact duration).
- Ensure empty state remains visible when data queries return no non-deleted rows.

## Acceptance criteria

1. Session list buckets are sourced from local DB queries (not static mock data).
2. Query contract surfaces at most one active session summary.
3. Completed sessions are sorted by `completedAt DESC`.
4. Soft-deleted sessions are excluded by default and become visible only when deleted visibility toggle is enabled.
5. Completed summaries include compact duration display value.
6. Completed rows remain disabled/non-navigable after data wiring.
7. E2E flow passes: `session list -> start session -> add exercise -> log set -> save session`.
8. `npm run lint`, `npm run typecheck`, `npm run test` pass in `apps/mobile`.
9. If migrations/schema artifacts change, `npm run db:generate:canary` also passes.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted data-layer contract tests for single active, completed sorting, soft-delete filtering, deleted visibility toggle, and compact duration mapping
  - targeted screen tests proving session-list renders DB-backed summaries
  - `npm run test:e2e:ios:smoke` with coverage for `session list -> start session -> add exercise -> log set -> save session`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run db:generate:canary` (if schema/migration changes)
- Notes:
  - Include at least one edge test for inconsistent/local-legacy dataset handling.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**`
  - `apps/mobile/src/data/schema/**` (if soft-delete columns/constraints are added)
  - `apps/mobile/src/data/migrations/**` and `apps/mobile/drizzle/**` (if schema changes)
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/__tests__/**`
- Constraints/assumptions:
  - Keep delete semantics soft-delete only; avoid introducing hard-delete code paths.
  - Maintain deterministic ordering for stable UI tests.
  - Keep active-session action gating semantics (`Start` hidden while active exists).

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- `npm run test:e2e:ios:smoke` (from `apps/mobile`)
- `npm run db:generate:canary` (from `apps/mobile`, when schema changes)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Lane 1 command output summary.
  - Targeted tests passed:
    - `npm test -- app/__tests__/session-list-repository.test.ts --runInBand`
    - `npm test -- app/__tests__/session-list-screen.test.tsx app/__tests__/index.test.tsx --runInBand`
    - `npm test -- app/__tests__/session-list-repository.test.ts app/__tests__/session-list-screen.test.tsx app/__tests__/index.test.tsx app/__tests__/domain-schema-migrations.test.ts app/__tests__/session-drafts-repository.test.ts --runInBand`
  - Verify gates passed:
    - `HOME=/tmp EXPO_NO_TELEMETRY=1 npm run lint`
    - `npm run typecheck`
    - `npm run test -- --runInBand`
    - `npm run db:generate:canary`
    - `TASK_ID=T-20260220-06 npm run test:e2e:ios:smoke`
- Schema/migration artifact summary if changed.
  - Added soft-delete column/index to `sessions` schema (`deleted_at`, `sessions_deleted_at_idx`).
  - Generated Drizzle artifacts:
    - `apps/mobile/drizzle/0002_pink_justice.sql`
    - `apps/mobile/drizzle/meta/0002_snapshot.json`
    - updated `apps/mobile/drizzle/meta/_journal.json`
  - Synced runtime migration bundle in `apps/mobile/src/data/migrations/index.ts`.
- Session-list bucket contract assertion summary.
  - `apps/mobile/app/__tests__/session-list-repository.test.ts` verifies:
    - single-active surface (deterministic fallback from inconsistent multi-active/draft data)
    - completed ordering by `completedAt DESC`
    - soft-deleted sessions hidden by default / visible with toggle
    - compact duration mapping (`30m`, `1h 5m`)
    - soft-delete mutation writes deterministic timestamps
  - `apps/mobile/app/__tests__/session-list-screen.test.tsx` adds DB-backed route hydration assertion via mocked repository summaries.
- Screenshot paths for DB-backed session-list states.
  - Session-list launch (DB-backed route path): `/Users/dinohughes/Projects/scaffolding2/apps/mobile/artifacts/maestro/T-20260220-06/20260223-170517-2585/maestro-output/screenshots/01-app-launch.png`
  - Recorder visible after session-list action (same E2E smoke run): `/Users/dinohughes/Projects/scaffolding2/apps/mobile/artifacts/maestro/T-20260220-06/20260223-170517-2585/maestro-output/screenshots/02-session-recorder-visible.png`
  - Additional note: `TASK_ID=T-20260220-06 npm run test:e2e:ios:data-smoke` currently fails due stale Maestro flow assertion (`home-foundation-ready`) after M4 home-route changes, not due SQLite migration/runtime failure signal.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Added a local session-list repository/store in `apps/mobile/src/data/session-list.ts` that reads local SQLite/Drizzle data, joins gym/exercise/set aggregates, returns bucketed summaries (`active` + `completed`), enforces a deterministic single-active surface, and supports soft-delete state updates.
  - Wired `apps/mobile/app/session-list.tsx` route to the repository through an async data client while preserving the shell component test mode (`initialSessions`) for UI tests.
  - Extended session row summary rendering to include DB-backed projection fields (`gymName`, `exerciseCount`) while keeping compact duration and disabled completed-row behavior.
  - Added `deletedAt` soft-delete support to `sessions` schema plus migration/runtime migration updates.
  - Added/updated tests for repository contract, DB-backed route hydration, schema migration SQL expectations, and `SessionPersistenceRecord` fixture shape changes.
  - Updated `apps/mobile/.maestro/flows/smoke-launch.yaml` to cover the required flow: `session list -> start/resume session -> add exercise -> log set -> submit`.
- What tests ran:
  - `npm test -- app/__tests__/session-list-repository.test.ts --runInBand`
  - `npm test -- app/__tests__/session-list-screen.test.tsx app/__tests__/index.test.tsx --runInBand`
  - `npm test -- app/__tests__/session-list-repository.test.ts app/__tests__/session-list-screen.test.tsx app/__tests__/index.test.tsx app/__tests__/domain-schema-migrations.test.ts app/__tests__/session-drafts-repository.test.ts --runInBand`
  - `HOME=/tmp EXPO_NO_TELEMETRY=1 npm run lint`
  - `npm run typecheck`
  - `npm run test -- --runInBand`
  - `npm run db:generate:canary`
  - `TASK_ID=T-20260220-06 npm run test:e2e:ios:smoke`
  - Attempted (non-task gate, migration-risk follow-up): `TASK_ID=T-20260220-06 npm run test:e2e:ios:data-smoke` -> failed due stale Maestro flow selector (`home-foundation-ready`) after M4 home-route update.
- What remains:
  - Update `apps/mobile/.maestro/flows/data-runtime-smoke.yaml` to the M4 home-route/session-list entrypoint (it still targets removed foundation screen controls).
