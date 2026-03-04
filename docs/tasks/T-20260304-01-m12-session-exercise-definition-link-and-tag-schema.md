---
task_id: T-20260304-01
milestone_id: "M12"
status: planned
ui_impact: "no"
areas: "frontend|docs"
runtimes: "docs|node|expo|sql"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/milestones/M12-exercise-tags.md,docs/specs/03-technical-architecture.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-01`
- Title: M12 session exercise definition link and tag schema
- Status: `planned`
- File location rule:
  - author active cards in `docs/tasks/T-20260304-01-m12-session-exercise-definition-link-and-tag-schema.md`
  - move the file to `docs/tasks/complete/T-20260304-01-m12-session-exercise-definition-link-and-tag-schema.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-03-04`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M12-exercise-tags.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- Exercise taxonomy milestone: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Source brainstorm: `docs/brainstorms/010.ExerciseTags.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ ce40da15ad9ef663b0e6608bbb9a5b1a49bd3f9c`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `no` (`git fetch origin main` completed, but local `main` remained behind `origin/main @ 46cf5e9f403db1481fb38c4a10653eb4870a8c9d` during planning)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
  - `docs/specs/milestones/M12-exercise-tags.md`
  - `docs/brainstorms/010.ExerciseTags.md`
- Code/docs inventory freshness checks run:
  - `apps/mobile/src/data/schema/session-exercises.ts` - verified current logged exercise schema lacks durable `exercise_definition_id`
  - `apps/mobile/src/data/session-drafts.ts` - reviewed current draft persistence contract and session-exercise storage shape
  - `apps/mobile/src/data/exercise-catalog.ts` - reviewed current exercise-definition repository contract and ID ownership
- Known stale references or assumptions (must be explicit; write `none` if none):
  - local `main` is behind `origin/main` after fetch; implementation session should sync before code edits
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260304-01-m12-session-exercise-definition-link-and-tag-schema.md`

## Objective

Correct the current logged-session data bug by persisting a durable `exercise_definition_id` on `session_exercises`, then add the local schema foundation for exercise tag definitions and tag assignments.

## Scope

### In scope

- Add durable `exercise_definition_id` storage to logged `session_exercises`.
- Add local schema and Drizzle migration artifacts for:
  - exercise tag definitions scoped by `exercise_definition_id`
  - tag assignments scoped by `session_exercise_id`
- Update draft/session persistence contracts so the new linkage is written, restored, and preserved across active and completed session flows.
- Add schema-level uniqueness/index/foreign-key protections needed for:
  - tag-definition scope integrity
  - assignment integrity
  - lookup performance for the expected local query paths
- Add or update targeted repository/bootstrap tests that prove the schema and persistence contract behave correctly.

### Out of scope

- Repository/domain normalization and rename/delete behavior beyond what is required to validate the schema shape.
- Session-recorder or completed-edit UI changes.
- Analytics/reporting queries or UI.
- Backend sync/API work.

## UI Impact (required checkpoint)

- UI Impact?: `no`
- UI-adjacent impact rationale:
  - this task changes the data contract used by UI flows, but does not directly implement or modify screen behavior

## Acceptance criteria

1. `session_exercises` persists a durable `exercise_definition_id` for logged exercises that originate from the exercise catalog.
2. The local schema includes an exercise-tag-definition table scoped to `exercise_definition_id`.
3. The local schema includes a logged-exercise tag-assignment table scoped to `session_exercise_id`.
4. Schema/bootstrap behavior remains valid for fresh local databases.
5. Draft save/restore and completed-session reads preserve the new `exercise_definition_id` field without regressing existing exercise/set content.
6. Schema constraints/indexes are sufficient to support future repository enforcement for duplicate tag prevention and assignment integrity.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M12-exercise-tags.md` - keep milestone task state and schema contract wording aligned if implementation details tighten
  - `docs/specs/03-technical-architecture.md` - document durable `exercise_definition_id` linkage on logged session exercises if it becomes part of the shared session-domain contract
- For significant cross-cutting behavior changes:
  - `docs/specs/03-technical-architecture.md`
- Rule:
  - milestone/task docs are not substitutes for project-level docs when this logged-session contract becomes canonical shared behavior

## Testing and verification approach

- Planned checks/commands:
  - targeted schema/bootstrap and draft-persistence tests in `apps/mobile`
  - `npm run test -- --runInBand app/__tests__/local-data-bootstrap.test.ts app/__tests__/session-drafts-repository.test.ts`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A` unless implementation reveals runtime-sensitive bootstrap behavior that needs native smoke coverage
- Test layers covered:
  - unit
  - data-layer integration
  - schema/bootstrap coverage
- Execution triggers:
  - always run targeted tests during implementation
  - run `./scripts/quality-fast.sh frontend` at closeout
- Slow-gate triggers:
  - run `./scripts/quality-slow.sh frontend` only if the schema/persistence change alters runtime bootstrap behavior enough to require fresh iOS data-smoke evidence
- Hosted/deployed smoke ownership:
  - `N/A`
- CI/manual posture note:
  - no CI is configured; local targeted tests plus `quality-fast` are the default proof path
- Notes:
  - no user-data preservation migration is expected at this stage; this task is schema/bootstrap work, not legacy-data recovery work

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/schema/session-exercises.ts`
  - `apps/mobile/src/data/schema/index.ts`
  - new or adjacent schema files under `apps/mobile/src/data/schema/**`
  - `apps/mobile/drizzle/**`
  - `apps/mobile/src/data/session-drafts.ts`
  - `apps/mobile/src/data/bootstrap.ts`
  - targeted tests under `apps/mobile/app/__tests__/`
- Project structure impact:
  - no new top-level folders expected; keep schema assets in existing `apps/mobile/src/data/schema/**` and generated Drizzle artifacts in `apps/mobile/drizzle/**`
- Constraints/assumptions:
  - there is no meaningful user data preservation requirement at this stage; do not over-design legacy-row migration handling

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `N/A by default`; use `./scripts/quality-slow.sh frontend` only if runtime-sensitive bootstrap risk is triggered
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/T-20260304-01-m12-session-exercise-definition-link-and-tag-schema.md`
- Additional gate(s), if any:
  - targeted Jest command(s) for schema/persistence tests

## Evidence

- Schema change summary and no-legacy-data rationale
- Targeted test results for schema/bootstrap/persistence
- Manual verification summary (required when CI is absent/partial):
  - confirm the new `exercise_definition_id` contract is present in save/restore code paths and did not regress existing recorder data behavior
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable:
  - `N/A`

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, ensure the relevant project-level docs (`03`, `04`, `06`) were updated in the same session rather than only the milestone/task docs.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260304-01-m12-session-exercise-definition-link-and-tag-schema.md` (or document why `N/A`) before handoff.
