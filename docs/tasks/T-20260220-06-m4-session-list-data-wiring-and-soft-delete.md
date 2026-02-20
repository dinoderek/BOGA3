# Task Card

## Task metadata

- Task ID: `T-20260220-06`
- Title: M4 session list local DB wiring with single-active and soft-delete visibility contract
- Status: `planned`
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
- Schema/migration artifact summary if changed.
- Session-list bucket contract assertion summary.
- Screenshot paths for DB-backed session-list states.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
