# Task Card

## Task metadata

- Task ID: `T-20260226-01`
- Title: M7 remove `draft` status and migrate to strict `active|completed` session lifecycle
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-26`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M7-completed-session-detail-reopen-and-edit.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md` (always load for context; update only when task changes paths/layout/conventions)
- Supporting references:
  - `docs/specs/milestones/M3-session-domain-local-autosave.md`
  - `docs/specs/milestones/M4-session-list-screen-and-data-wiring.md`
  - `docs/tasks/T-20260225-02-m7-completed-session-data-contracts-edit-and-reopen.md`
  - `docs/tasks/T-20260225-03-m7-mode-aware-recorder-completed-edit-flow.md`

## Objective

Remove the internal `draft` session status from the local schema and app data model, migrate existing local rows safely, and update all repository/UI logic to use a strict `active|completed` lifecycle without regressions to autosave, session list, completed edit, or reopen behavior.

## Scope

### In scope

- Replace local session status enum/guards/defaults from `draft|active|completed` to `active|completed`.
- Add a local migration/backfill path so existing `draft` rows are converted deterministically to `active`.
- Update repository/store types and queries that currently reference `draft` as an in-progress status.
- Update list/reopen invariants and user-facing copy/tests so “active session” semantics match implementation exactly.
- Update recorder persistence defaults/restore behavior to persist in-progress sessions as `active` only.
- Update tests, fixtures, and migration canaries that assert `draft` status presence/defaults.
- Update docs/specs/task references that describe `draft` semantics where they become stale/inaccurate.

### Out of scope

- Backend/cloud sync contract changes (unless a local schema/status contract dependency is discovered and explicitly scoped).
- New lifecycle states beyond `active|completed`.
- Visual redesign of recorder/list/detail UI.

## Acceptance criteria

1. Local schema and migration/runtime artifacts no longer define or default to a `draft` session status.
2. Existing local `draft` rows are migrated/backfilled to `active` without data loss.
3. Repositories, stores, and list/reopen logic enforce a strict `active|completed` lifecycle and no longer branch on `draft`.
4. Recorder autosave/create/resume flows continue to work with only `active` as the in-progress persisted status.
5. Completed-session reopen gating and repository invariants use “active session” semantics consistently in code and UI.
6. Updated tests cover migration/backfill behavior and active/completed lifecycle regression-sensitive flows.
7. `apps/mobile` `lint`, `typecheck`, and `test` pass.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - targeted schema/migration tests (`domain-schema-migrations`, data-layer lifecycle/repository tests)
  - targeted session-list and recorder regression tests
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Test layers covered:
  - schema/migration tests
  - repository/data-contract tests
  - UI regression tests (list/recorder/completed detail flows impacted by status semantics)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always` for targeted lifecycle/migration tests while changing schema or status logic
  - milestone closeout via full `npm run test`
- CI/manual posture note:
  - No CI pipeline is configured; verification is local-only and must include targeted lifecycle/migration tests plus full local gates.
- Notes:
  - Prefer a two-step implementation: (1) migration/backfill + data-layer support, (2) cleanup/removal of dead `draft` branches/usages.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/schema/sessions.ts`
  - `apps/mobile/src/data/migrations/**`
  - `apps/mobile/src/data/session-drafts.ts`
  - `apps/mobile/src/data/session-list.ts`
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/__tests__/**` (migration/data/UI regression tests)
  - `docs/specs/**` and `docs/tasks/**` references to `draft` lifecycle semantics
- Project structure impact:
  - No top-level structure change expected; changes stay within existing mobile data/app/test paths and docs.
- Constraints/assumptions:
  - Preserve the single in-progress-session invariant throughout the migration.
  - Do not silently break existing persisted local data; migration/backfill is mandatory.
  - Keep user-facing wording aligned with final implementation semantics (“active session” only).

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted migration/schema tests + targeted session-list/recorder lifecycle regression tests

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Test evidence for migration/backfill of legacy `draft` rows to `active`
- Test evidence for reopen gating/invariant behavior after `draft` removal
- Test evidence for recorder autosave/create/resume behavior with strict `active|completed`
- Manual verification summary (required when CI is absent/partial):
  - Summarize local verification of an upgrade path (pre-migration `draft` fixture -> post-migration active behavior) and impacted UI flows.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Removed persisted `draft` status from the mobile `sessions` schema (`active|completed` only) and updated repository lifecycle contracts/defaults accordingly.
  - Added migration `0004_active_completed_lifecycle` (Drizzle SQL + runtime migration bundle + snapshot/journal metadata) to rebuild `sessions` and rewrite legacy `draft` rows to `active`.
  - Updated repository and migration tests to validate the new lifecycle contract and migration rewrite behavior.
  - Updated M7 milestone task breakdown with this task and left milestone `Status` unchanged (`in_progress`) because the remaining M7 feature tasks are still open.
- What tests ran:
  - `npm test -- --runTestsByPath app/__tests__/session-drafts-repository.test.ts app/__tests__/session-list-repository.test.ts app/__tests__/domain-schema-migrations.test.ts` (from `apps/mobile`) ✅
  - `npm run typecheck` (from `apps/mobile`) ✅
  - `./scripts/quality-fast.sh frontend` ✅ (`lint`, `typecheck`, full mobile `jest` suite)
- What remains:
  - M7 feature tasks for completed-session data contracts/edit flow/integration evidence remain open (`docs/tasks/T-20260225-02`, `-03`, `-04`).

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
