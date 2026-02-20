# Task Card

## Task metadata

- Task ID: `T-20260220-02`
- Title: M3 domain schema and migration foundation
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M3-session-domain-local-autosave.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Introduce the first domain-local Drizzle schema and migrations for session recording entities with forward-compatible provenance metadata.

## Scope

### In scope

- Add Drizzle schema tables:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
- Model draft/completed session lifecycle fields (`status`, timing fields, duration materialization field).
- Add relational constraints and indexes for ordered exercise/set rows and cascade behavior.
- Keep gym names non-unique.
- Add provenance-ready columns for future server/group adoption:
  - gym origin fields (scope/source IDs)
  - exercise origin linkage fields (scope/source IDs)
- Generate migration artifacts and update runtime migration bundle.

### Out of scope

- Autosave orchestration behavior.
- Screen-level lifecycle hooks.
- Session completion business flow and submit UX.

## Acceptance criteria

1. Domain schema compiles and replaces smoke-table usage in exported schema index.
2. `Session -> Exercise -> Set` foreign-key relationships are enforced with deterministic ordering constraints.
3. `gyms.name` is not unique.
4. Provenance fields are present for gyms and session exercises, defaulting to local/private origin semantics.
5. Migration artifacts are generated and runtime migration config is updated in sync.
6. `npm run db:generate:canary`, `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - `npm run db:generate:canary`
  - targeted schema/migration integration tests (if created in-task)
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - Validate fresh-bootstrap migration path remains deterministic after schema replacement.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/schema/**`
  - `apps/mobile/src/data/migrations/**`
  - `apps/mobile/drizzle/**`
  - `apps/mobile/src/data/bootstrap.ts` (only as needed for schema import/runtime compatibility)
  - `apps/mobile/app/__tests__/**` (data-layer tests only)
- Constraints/assumptions:
  - Use UUID/text IDs for domain entities to avoid local-only integer identity coupling.
  - Preserve backward-safe migration semantics for already-initialized local DBs.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- `npm run db:generate:canary` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Lane 1 command output summary.
- Migration artifact summary (`apps/mobile/drizzle/**` and runtime bundle changes).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Added first domain schema tables under `apps/mobile/src/data/schema/`:
    - `gyms` (`apps/mobile/src/data/schema/gyms.ts`)
    - `sessions` (`apps/mobile/src/data/schema/sessions.ts`)
    - `session_exercises` (`apps/mobile/src/data/schema/session-exercises.ts`)
    - `exercise_sets` (`apps/mobile/src/data/schema/exercise-sets.ts`)
  - Added lifecycle and provenance columns:
    - `sessions.status`, `sessions.started_at`, `sessions.completed_at`, `sessions.duration_sec`
    - `gyms.origin_scope_id`, `gyms.origin_source_id`
    - `session_exercises.origin_scope_id`, `session_exercises.origin_source_id`
  - Added deterministic ordering constraints and relational integrity:
    - unique ordering indexes on `(session_id, order_index)` and `(session_exercise_id, order_index)`
    - FK chain with cascade from `sessions -> session_exercises -> exercise_sets`
  - Replaced schema-index smoke export with domain exports in `apps/mobile/src/data/schema/index.ts`.
  - Updated Drizzle generation input to the schema folder (`apps/mobile/drizzle.config.ts`) so legacy smoke table metadata remains diff-visible without being exported from schema index.
  - Generated migration artifacts:
    - `apps/mobile/drizzle/0001_wet_moondragon.sql`
    - `apps/mobile/drizzle/meta/0001_snapshot.json`
    - `apps/mobile/drizzle/meta/_journal.json` update
  - Synced runtime migration bundle in `apps/mobile/src/data/migrations/index.ts` with new journal entry and `m0001` SQL.
  - Added schema/migration contract coverage:
    - `apps/mobile/app/__tests__/domain-schema-migrations.test.ts`
  - Updated smoke repository/table test imports to direct legacy table path:
    - `apps/mobile/src/data/smoke-records.ts`
    - `apps/mobile/app/__tests__/smoke-records.test.ts`
- Tests run and outcome:
  - `npm run test -- domain-schema-migrations.test.ts smoke-records.test.ts` -> pass.
  - `npm run db:generate:canary` -> pass (`No schema changes, nothing to migrate` after artifact generation).
  - `npm run lint` -> pass.
  - `npm run typecheck` -> pass.
  - `npm run test` -> pass (`7` suites, `19` tests).
- Remaining risks:
  - Lane 2 native runtime data smoke was not run in this task; run `npm run test:e2e:ios:data-smoke` if fresh native-runtime migration evidence is required for milestone closeout.
