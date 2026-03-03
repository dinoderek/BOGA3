---
task_id: T-20260227-02
milestone_id: "M9"
status: completed
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
- Status: `completed`
- Session date: `2026-02-27`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ 6568181`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git pull --ff-only origin main` -> already up to date)
- Parent refs opened in this session:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - schema inventory under `apps/mobile/src/data/schema/**`
  - migration inventory under `apps/mobile/drizzle/**`
- Known stale references or assumptions:
  - recorder still writes legacy `name` + optional `machineName`; this task preserves that path and adds deterministic reference resolution/backfill beneath it
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
- Manual verification summary (required when CI is absent/partial): migration diff review, targeted repository/backfill test review, and Maestro artifact-path verification completed locally.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed: Added variation metadata schema (`exercise_variation_keys`, `exercise_variation_values`, `exercise_variations`, `exercise_variation_attributes`) and generated `apps/mobile/drizzle/0006_flowery_bulldozer.sql`; seeded system variation keys/values plus boot-time deterministic legacy backfill for `session_exercises`; updated exercise catalog/session draft repositories to expose variation metadata APIs and to read/write stable exercise/variation refs while retaining `name`/`machineName` as the compatibility fallback for unresolved legacy rows.
- What tests ran: `git pull --ff-only origin main`; `./scripts/task-bootstrap.sh docs/tasks/T-20260227-02-m9-local-variation-schema-and-session-reference-migration.md`; `npm test -- --runInBand app/__tests__/exercise-catalog-repository.test.ts app/__tests__/session-drafts-repository.test.ts app/__tests__/exercise-variation-seeds.test.ts app/__tests__/session-exercise-reference-backfill.test.ts`; `npm test -- --runInBand app/__tests__/domain-schema-migrations.test.ts`; `npm run db:generate`; `./scripts/quality-fast.sh frontend`; `./scripts/quality-slow.sh frontend`.
- What remains: Catalog UI still needs key/value + variation authoring flows, and recorder UI still needs to pass/select explicit variation refs instead of relying on the legacy `machineName` bridge.

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260227-02-m9-local-variation-schema-and-session-reference-migration.md` (or document why `N/A`) before handoff.
