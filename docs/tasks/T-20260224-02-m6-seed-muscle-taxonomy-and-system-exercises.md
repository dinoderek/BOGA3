# Task Card

## Task metadata

- Task ID: `T-20260224-02`
- Title: M6 seed non-editable muscle taxonomy and initial system exercise mappings
- Status: `completed`
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
- Seed weighted exercise-to-muscle mappings using non-normalized weights, balancing simplicity with evidence quality.
- Document the studies/sources used to support the taxonomy and exercise-muscle associations/weighting choices.
- Default to simple weighting conventions (for example, `primary=1.0`, `secondary=0.5`) unless strong study evidence supports more granular weights for specific mappings.
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
3. Seeded mappings use non-normalized weights and default to simple weighting (`1.0` primary / `0.5` secondary) unless a stronger evidence-based rationale is documented for more granular values.
4. The taxonomy and seeded exercise-mapping choices are documented with supporting study/source references and rationale.
5. Seed validation prevents duplicate `(exercise, muscle_group)` mappings and invalid/missing referenced IDs.
6. Seeded records can be loaded/verified through the local data layer or seed-loading path used by the app.
7. The included initial system exercise list is documented in the task completion evidence or linked docs.

## Testing and verification approach

- Planned checks/commands:
  - targeted seed-data validation test(s) for taxonomy and exercise mappings
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
- Notes:
  - Prefer deterministic seed fixtures and assertions over manual inspection.
  - Include checks that enforce/flag undocumented granular weights if the task adopts a simple default weighting convention.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**` (seed data, repositories, bootstrap hooks)
  - `apps/mobile/src/**/__tests__/**`
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md` (only if taxonomy naming/IDs are intentionally adjusted)
- Constraints/assumptions:
  - Muscle taxonomy remains non-editable in M6.
  - Keep the initial system exercise set intentionally small/representative; do not optimize for completeness yet.
  - Prioritize mappings/weights with strong evidence support; prefer simple primary/secondary weighting when evidence is weak or mixed.
  - Use stable IDs consistently across schema, seed data, and UI-facing usage.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any: targeted seed validation tests

## Evidence

- Taxonomy seed summary (IDs + labels).
- Initial system exercise seed summary (exercise count + examples).
- Mapping examples demonstrating non-normalized weights (and where applicable, why any granular weight exceeds the default simple ladder).
- Source/study reference summary supporting taxonomy and mapping choices.
- Test/gate results summary.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Added `apps/mobile/src/data/exercise-catalog-seeds.ts` with the M6 system seed bundle for muscle taxonomy, system exercises, weighted exercise-to-muscle mappings, source references, and validation helpers.
  - Implemented deterministic validation for duplicate IDs/mapping pairs, invalid weights, invalid roles, missing exercise docs, and missing/unknown referenced IDs.
  - Wired idempotent system catalog seeding into `bootstrapLocalDataLayer` after runtime migrations, with retry behavior on seed failures.
  - Added Jest coverage for seed validation/simplification policy and bootstrap seed integration retry behavior.
  - Simplified the seed taxonomy/mapping defaults based on review feedback:
    - collapsed chest sub-groups to a single `chest` muscle group
    - M6 seed roles use `primary|secondary` only (schema still allows `stabilizer`)
    - omitted speculative stabilizer/bracing mappings from the starter catalog
    - trimmed the starter system exercise set to 14 exercises
  - Seed evidence summary (current M6 starter set):
    - taxonomy: 19 non-editable muscle groups
    - system exercises: 14
    - exercise-muscle mappings: 34 (non-normalized; default ladder only `1.0` / `0.5`)
    - examples: `Barbell Bench Press -> chest (1.0), delts_front (0.5), triceps (0.5)`; `Barbell Back Squat -> quads (1.0), glutes_max/adductors/spinal_erectors (0.5)`
  - Source/reference set documented in the seed module includes ExRx exercise anatomy directory plus supporting context/biomechanics references (Schoenfeld 2010, Vigotsky 2018, Escamilla squat/deadlift, Contreras hip thrust).
- What tests ran:
  - `npm test -- --runInBand app/__tests__/exercise-catalog-seeds.test.ts app/__tests__/local-data-bootstrap.test.ts` (pass)
  - `npm run lint` (pass)
  - `npm run typecheck` (pass)
  - `npm test -- --runInBand` (pass)
- What remains:
  - M6 remains open for exercise editing muscle-linking UI (`T-20260224-03`), session-recorder exercise management integration (`T-20260224-04`), and the historical mapping behavior decision/options task (`T-20260224-05`).

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update parent milestone task breakdown/status in the same session.
