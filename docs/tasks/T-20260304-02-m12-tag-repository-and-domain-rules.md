---
task_id: T-20260304-02
milestone_id: "M12"
status: planned
ui_impact: "no"
areas: "frontend|docs"
runtimes: "docs|node|expo|sql"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/milestones/M12-exercise-tags.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-02`
- Title: M12 tag repository and domain rules
- Status: `planned`
- File location rule:
  - author active cards in `docs/tasks/T-20260304-02-m12-tag-repository-and-domain-rules.md`
  - move the file to `docs/tasks/complete/T-20260304-02-m12-tag-repository-and-domain-rules.md` when `Status` becomes `completed` or `outdated`
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
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `no` (`git fetch origin main` completed during planning, but local `main` remained behind `origin/main`)
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
  - `apps/mobile/src/data/exercise-catalog.ts` - reviewed current repository style and validation posture
  - `apps/mobile/src/data/schema/session-exercises.ts` - confirmed logged exercise scope dependency
  - `apps/mobile/components/session-recorder/types.ts` - reviewed current recorder exercise state shape that repository callers will need to support
- Known stale references or assumptions (must be explicit; write `none` if none):
  - assumes Task `T-20260304-01` lands first so repository code can rely on durable `exercise_definition_id`
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260304-02-m12-tag-repository-and-domain-rules.md`

## Objective

Implement the repository/domain layer for exercise tags so tag creation, rename, delete/undelete, suggestion lookup, and per-log assignment all follow one consistent set of validation and normalization rules.

## Scope

### In scope

- Add repository/domain APIs for:
  - list tag definitions for one `exercise_definition_id`
  - list default suggestions excluding deleted tags
  - create a tag definition
  - rename a tag definition
  - soft-delete and undelete a tag definition
  - attach a tag to a logged `session_exercise`
  - remove a tag from a logged `session_exercise`
  - list assigned tags for a logged `session_exercise`
- Define and implement normalization rules for tag names:
  - trim whitespace
  - preserve display casing
  - compare normalized values case-insensitively for duplicate prevention
- Define and implement domain errors or failure states for:
  - blank name
  - duplicate name on create
  - duplicate name on rename
  - invalid cross-definition assignment
  - duplicate assignment on one logged exercise

### Out of scope

- Recorder or completed-session UI rendering.
- Navigation or route changes.
- Analytics queries or reports.
- Backend sync/API behavior.

## UI Impact (required checkpoint)

- UI Impact?: `no`
- UI-adjacent impact rationale:
  - repository error shapes and list semantics will be consumed by the upcoming recorder/manage-tags UI, but this task does not change screens directly

## Acceptance criteria

1. The repository can list tag suggestions for a single `exercise_definition_id`, excluding soft-deleted tags by default.
2. Creating a tag trims input, rejects blank values, and prevents normalized duplicates within the same exercise definition.
3. Renaming a tag applies the same normalization and duplicate-prevention rules as creation.
4. Soft-delete hides a tag from default suggestion results without deleting historical tag assignments.
5. Undelete restores a soft-deleted tag to default suggestion results.
6. A tag can be attached to a logged `session_exercise` only when the tag definition belongs to that logged exercise’s `exercise_definition_id`.
7. Duplicate assignment of the same tag to the same logged exercise is prevented.
8. Removing a tag from a logged exercise deletes only the assignment, not the reusable tag definition.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M12-exercise-tags.md` - keep milestone contract and task state aligned if repository semantics tighten during implementation
- For significant cross-cutting behavior changes (if triggered):
  - `docs/specs/03-technical-architecture.md` only if repository semantics become part of the shared project contract beyond the milestone
- Rule:
  - do not update only the milestone/task docs if implementation reveals a stable cross-cutting metadata behavior that future milestones must rely on

## Testing and verification approach

- Planned checks/commands:
  - targeted repository tests for create/rename/delete/undelete/attach/remove rules
  - `npm run test -- --runInBand app/__tests__/exercise-tag-repository.test.ts`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A`
- Test layers covered:
  - unit
  - repository/data integration
- Execution triggers:
  - always run targeted repository tests during implementation
  - run `./scripts/quality-fast.sh frontend` at closeout
- Slow-gate triggers:
  - `N/A`; no runtime-sensitive simulator behavior is expected from this repository-focused task alone
- Hosted/deployed smoke ownership:
  - `N/A`
- CI/manual posture note:
  - no CI is configured; repository tests plus `quality-fast` are the required local proof path
- Notes:
  - if implementation introduces a reusable store module or new persistence surface, extend test coverage before UI wiring lands

## Implementation notes

- Planned files/areas allowed to change:
  - new or adjacent modules under `apps/mobile/src/data/**`
  - targeted test files under `apps/mobile/app/__tests__/`
  - schema helper imports if required by repository implementation
- Project structure impact:
  - no new top-level folders expected
- Constraints/assumptions:
  - repository APIs should stay exercise-scoped and avoid leaking a global tag taxonomy into the contract

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `N/A`
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/T-20260304-02-m12-tag-repository-and-domain-rules.md`
- Additional gate(s), if any:
  - targeted repository Jest command(s)

## Evidence

- Repository behavior summary for create/rename/delete/undelete/attach/remove
- Targeted repository test results
- Manual verification summary (required when CI is absent/partial):
  - confirm repository returns stable suggestion and assignment semantics for the UI layer to consume
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
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260304-02-m12-tag-repository-and-domain-rules.md` (or document why `N/A`) before handoff.
