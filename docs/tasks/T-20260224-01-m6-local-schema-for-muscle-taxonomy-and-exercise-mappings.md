# Task Card

## Task metadata

- Task ID: `T-20260224-01`
- Title: M6 local schema for muscle taxonomy and exercise-to-muscle mappings
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-24`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#explicitly-deferred-after-mvp`
- Milestone spec: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Design and implement the local data schema foundation for a system-defined muscle taxonomy, exercise definitions, and weighted exercise-to-muscle associations, with room for user-editable exercises.

## Scope

### In scope

- Add local schema tables/entities for:
  - muscle groups (system-defined taxonomy)
  - exercise definitions (system and user exercises)
  - weighted exercise-to-muscle associations
- Add schema constraints/indexes for stable IDs, uniqueness, and valid weight values.
- Define how user vs system exercises are represented in the schema (field(s)/constraints).
- Add/export schema types and migration(s) in the current local data layer.
- Add schema-level tests/smoke verification as appropriate for existing project patterns.

### Out of scope

- Seeding the final taxonomy and system exercise records.
- Exercise editing UI/UX.
- Analytics rollups or reporting.
- Final historical mapping/versioning behavior for completed sessions.
- Backend sync/API changes.

## Acceptance criteria

1. Local schema includes a system-defined muscle-group entity with stable IDs and user-facing names.
2. Local schema includes an exercise-definition entity that can represent both `system` and `user` exercises.
3. Local schema includes a many-to-many association entity linking exercises to muscle groups with non-normalized weights.
4. Uniqueness/constraint rules prevent duplicate mappings for the same `(exercise, muscle_group)` pair.
5. Schema changes are exported through the existing schema index and included in local migrations.
6. Added/updated schema checks/tests pass for the touched area.

## Testing and verification approach

- Planned checks/commands:
  - `npm run test -- apps/mobile/src/data/**` (targeted, exact command/path may vary)
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
- Notes:
  - Follow existing Drizzle schema + migration verification patterns used in M2/M3 tasks.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/schema/**`
  - `apps/mobile/src/data/migrations/**`
  - `apps/mobile/src/data/**` (only as needed for schema exports/smoke wiring)
  - `apps/mobile/src/**/__tests__/**` or existing schema smoke tests
- Constraints/assumptions:
  - Keep the taxonomy system-defined/non-editable at the data-model level for M6.
  - Do not lock a historical mapping snapshot/version strategy in this task unless required by schema shape.
  - Preserve compatibility with current local-first architecture and migration runtime.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted schema/migration tests for touched tables

## Evidence

- Schema diff summary (new tables/fields/indexes/constraints).
- Migration diff summary.
- Targeted test output summary.
- Full gate run summary.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update parent milestone task breakdown/status in the same session.
