---
task_id: T-20260227-02
milestone_id: "M9"
status: planned
ui_impact: "no"
areas: "frontend"
runtimes: "node,expo,sql,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260227-02`
- Title: M9 local variation schema and session reference migration
- Status: `planned`
- Session date: `2026-02-27`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - schema inventory under `apps/mobile/src/data/schema/**`
  - migration inventory under `apps/mobile/drizzle/**`
- Known stale references or assumptions:
  - recorder currently still contains legacy preset path; variation reference adoption depends on recorder integration tasks
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260227-02-m9-local-variation-schema-and-session-reference-migration.md`

## Objective

Implement the local data contract for key/value exercise variations and migrate session exercise persistence to store exercise reference plus optional variation reference, including a safe legacy compatibility strategy for existing data.

## Scope

### In scope

- Add local schema entities needed for key/value variation metadata and exercise-owned variation definitions.
- Add/update constraints for uniqueness and referential integrity.
- Update local repositories/contracts to read/write:
  - variation keys and values,
  - exercise-owned variations,
  - `session_exercises.exercise_definition_id` + optional `exercise_variation_id`.
- Add migration/backfill logic for existing rows with only legacy name/machine fields.
- Preserve compatibility fallback behavior where deterministic backfill is not possible.
- Add targeted schema/repository tests and migration tests.

### Out of scope

- Catalog or recorder UI implementation.
- Analytics implementation.
- Backend sync/API implementation.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Schema supports key/value variation metadata with seeded system keys/values and user-created keys/values.
2. Schema supports exercise-owned variations composed of one or more key/value pairs.
3. `session_exercises` stores stable exercise reference and optional variation reference.
4. Existing persisted sessions remain readable after migration; unresolved legacy mappings use a documented fallback behavior.
5. Repository-level APIs exist for downstream catalog/recorder tasks without requiring schema reinterpretation.
6. Targeted tests cover constraints, migration behavior, backfill behavior, and repository read/write paths.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - task progress + any model clarifications discovered during implementation

## Testing and verification approach

- Planned checks/commands:
  - targeted schema/repository tests in `apps/mobile`
  - migration-generation canary if schema artifacts change (`npm run db:generate:canary`)
  - focused data migration/backfill tests for legacy `machineName`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required; runtime-sensitive migration/data smoke trigger)
- Test layers covered:
  - unit (repository/normalization helpers)
  - data-layer integration (SQLite schema + migration path)
  - native runtime data smoke (via slow gate)
- Execution triggers:
  - always for fast gate
  - slow gate required because schema/migrations/data bootstrapping are modified
- Slow-gate triggers:
  - any change under `apps/mobile/src/data/schema/**`, `apps/mobile/drizzle/**`, or persistence bootstrap/repository paths
- Hosted/deployed smoke ownership: `N/A (local mobile data layer only)`
- CI/manual posture note: no CI configured; local gate evidence required in completion note

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/schema/**`
  - `apps/mobile/src/data/**` (repositories/normalizers)
  - `apps/mobile/drizzle/**`
  - related tests under `apps/mobile/**/__tests__/**`
- Project structure impact: no new top-level folders expected
- Constraints/assumptions:
  - Keep variation optional in persistence and domain logic.
  - Keep migration/backfill deterministic and idempotent.

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260227-02-m9-local-variation-schema-and-session-reference-migration.md`
- Additional gate(s), if any:
  - `npm run db:generate:canary` when migration artifacts are regenerated

## Evidence

- Schema diff summary (tables/columns/constraints added/updated).
- Backfill behavior summary with edge-case outcomes.
- Local gate results summary (`quality-fast` + `quality-slow frontend`).
- Manual verification summary (CI absent).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260227-02-m9-local-variation-schema-and-session-reference-migration.md` (or document why `N/A`) before handoff.
