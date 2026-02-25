# Task Card

## Task metadata

- Task ID: `T-20260225-02`
- Title: M7 completed-session data contracts for load-by-id, in-place edit persistence, and reopen invariant
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
- Supporting domain/persistence references:
  - `docs/specs/milestones/M3-session-domain-local-autosave.md`
  - `docs/specs/milestones/M4-session-list-screen-and-data-wiring.md`

## Objective

Extend local session repositories/stores so the app can load a full session graph by ID (including completed sessions), persist edits to completed sessions safely (including updated completion timing and duration recomputation), and reopen a completed session by mutating the same record while enforcing the single-active-session invariant.

## Scope

### In scope

- Add repository/store contract(s) for loading a session graph by `sessionId` regardless of status (`active`/`draft`/`completed`) and regardless of deleted state (consumer decides UX gating).
- Add completed-session update contract(s) that can persist changes to:
  - `gymId`
  - `startedAt`
  - `completedAt`
  - exercises/sets graph
  - derived `durationSec`
- Preserve/define explicit invariants for completed-session updates:
  - status remains `completed`
  - `completedAt` required for completed update finalization
  - `durationSec` materialized and non-negative
- Add reopen contract that mutates an existing completed session record to `active` in place:
  - clears `completedAt`
  - clears `durationSec`
  - updates timestamps
  - rejects reopen if another non-deleted `draft/active` session exists
- Add repository-level tests for reopen and completed-update edge cases.
- Export new contracts from `apps/mobile/src/data/index.ts`.

### Out of scope

- UI route/screen wiring for detail/edit/reopen buttons.
- Recorder mode refactor and autosave orchestration (Task 03).
- Sync/outbox propagation semantics.
- New schema tables unless required by an implementation blocker.

## Acceptance criteria

1. A repository API can load a full session graph by ID for a completed session, including ordered exercises and sets.
2. A repository API can persist edits to an existing completed session graph without throwing the current “Cannot modify completed session” error path.
3. Completed-session update persistence retains `status = completed`, writes edited `startedAt`/`completedAt`, and recomputes/stores `durationSec`.
4. Completed-session update rejects invalid timing inputs (including `completedAt < startedAt`) with a deterministic error.
5. Reopen mutates the same session record to active status (same `sessionId`) and clears completion materialization fields.
6. Reopen is rejected if another non-deleted active/draft session already exists.
7. Repository tests cover happy paths and invariant failures for completed update and reopen.
8. `apps/mobile/src/data/index.ts` exports the new contracts/types used by upcoming UI tasks.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - targeted repository/store unit tests in `apps/mobile/app/__tests__/`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - Repository/store unit tests
  - Data-contract/invariant tests (completed update + reopen)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always` for targeted repository tests while changing repository/store contracts
  - milestone closeout via full `npm run test`
- CI/manual posture note (required when CI is absent or partial):
  - No CI is configured; repository contract verification is local-only and must be evidenced with targeted and full Jest runs.
- Notes:
  - Prefer tests that exercise both repository-level behavior and lower-level store behavior where invariants are split.
  - Reuse existing `session-drafts` test harness patterns and fake dates for deterministic duration assertions.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/session-drafts.ts`
  - `apps/mobile/src/data/index.ts`
  - `apps/mobile/src/data/session-list.ts` (if helper queries/invariant checks are shared)
  - `apps/mobile/app/__tests__/session-drafts-repository.test.ts`
  - `apps/mobile/app/__tests__/session-list-repository.test.ts` (if reopen affects list semantics tests)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - No project-structure change expected; work should remain within existing `apps/mobile/src/data` and test directories.
- Constraints/assumptions:
  - Prefer extending the existing `session-drafts` repository/store rather than creating a parallel “completed sessions” repository to avoid domain duplication.
  - Keep the reopen invariant enforced in repository/store code even though UI also disables the action.
  - Avoid schema changes unless current row/query shapes cannot support load-by-id graph/update safely.
  - Deleted completed sessions remain loadable/editable/reopenable by product decision; do not silently block due to `deletedAt`.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted repository tests for completed update + reopen invariants

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Test evidence for:
  - completed load-by-id graph ordering
  - completed update with duration recomputation
  - invalid time rejection
  - reopen same-record mutation
  - single-active-session reopen rejection
- Brief note documenting final invariant ownership (repository vs store vs both).
- Manual verification summary (required when CI is absent/partial):
  - Summarize local execution of targeted repository tests and any manual DB/runtime smoke checks used to confirm invariant behavior.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
