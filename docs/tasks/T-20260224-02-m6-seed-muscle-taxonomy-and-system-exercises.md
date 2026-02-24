# Task Card

## Task metadata

- Task ID: `T-20260224-02`
- Title: M6 seed non-editable muscle taxonomy and initial system exercise mappings
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

Define and seed the M6 non-editable muscle taxonomy plus an initial set of system exercises with weighted muscle mappings, using the v1 taxonomy IDs locked in the milestone.

## Scope

### In scope

- Finalize the v1 muscle taxonomy list for M6 (display names + stable IDs) if minor naming tweaks are needed.
- Implement taxonomy seed data for the system-defined muscle groups.
- Define an initial set of system exercises for M6 and seed them.
- Seed weighted exercise-to-muscle mappings using non-normalized weights.
- Add validation/tests to catch missing taxonomy IDs, duplicate mappings, and invalid weights in seed data.
- Document the initial system exercise set included in M6.

### Out of scope

- User-created exercise editing UX.
- Analytics calculations or dashboards.
- Exhaustive exercise catalog coverage.
- Historical mapping/versioning behavior for completed sessions.
- Backend sync of seeded definitions.

## Acceptance criteria

1. The M6 taxonomy seed matches the milestone’s v1 taxonomy IDs and is system-defined/non-editable.
2. An initial system exercise set is seeded and each seeded exercise has at least one muscle mapping.
3. Compound examples (for example, a chest press pattern) include multiple muscle mappings with non-normalized weights.
4. Seed validation prevents duplicate `(exercise, muscle_group)` mappings and invalid/missing referenced IDs.
5. Seeded records can be loaded/verified through the local data layer or seed-loading path used by the app.
6. The included initial system exercise list is documented in the task completion evidence or linked docs.

## Testing and verification approach

- Planned checks/commands:
  - targeted seed-data validation test(s) for taxonomy and exercise mappings
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
- Notes:
  - Prefer deterministic seed fixtures and assertions over manual inspection.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**` (seed data, repositories, bootstrap hooks)
  - `apps/mobile/src/**/__tests__/**`
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md` (only if taxonomy naming/IDs are intentionally adjusted)
- Constraints/assumptions:
  - Muscle taxonomy remains non-editable in M6.
  - Keep the initial system exercise set intentionally small/representative; do not optimize for completeness yet.
  - Use stable IDs consistently across schema, seed data, and UI-facing usage.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted seed validation tests

## Evidence

- Taxonomy seed summary (IDs + labels).
- Initial system exercise seed summary (exercise count + examples).
- Mapping examples demonstrating non-normalized weights.
- Test/gate results summary.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update parent milestone task breakdown/status in the same session.
