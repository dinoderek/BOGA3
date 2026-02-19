# Milestone Spec

## Milestone metadata

- Milestone ID: `M2`
- Title: Local storage infrastructure smoke (minimal Drizzle)
- Status: `planned`
- Owner: `AI + human reviewer`
- Target window: `2026-02`

## Parent references

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Milestone objective

Validate the on-device persistence machinery end-to-end using minimal Drizzle + SQLite infrastructure with a single non-domain smoke table, without introducing workout domain modeling.

## In scope

- Add minimal Drizzle + SQLite setup for `apps/mobile`.
- Define one smoke table for infrastructure verification only.
- Add migration generation/output flow and migration execution at app data-layer bootstrap.
- Implement a tiny smoke data-access path (insert + select) against the smoke table.
- Add integration coverage proving migration + persistence behavior locally.
- Define and apply a two-lane verification approach for local data:
  - Lane 1: fast CI-safe tooling/logic checks.
  - Lane 2: native runtime smoke on Expo environment with real SQLite.

## Out of scope

- `Session -> Exercise -> Set` schema or repositories.
- Gym/machine reference modeling.
- Sync/outbox/auth/backend integration.
- Production analytics and feature-level business logic.

## Deliverables

1. Drizzle/SQLite infrastructure wiring in `apps/mobile` with one smoke schema table.
2. Migration pipeline that can initialize a fresh local DB deterministically.
3. Smoke persistence path and integration tests validating migration and local read/write behavior.

## Acceptance criteria

1. A fresh local DB can be initialized and migrated through the app data bootstrap path with no manual SQL steps.
2. A smoke insert followed by read succeeds against the single smoke table using Drizzle-backed access.
3. No workout-domain tables (`session`, `exercise`, `set`, etc.) are introduced in this milestone.
4. Lane 1 checks pass in `apps/mobile`: `npm run lint`, `npm run typecheck`, `npm run test`, and migration-generation canary command.
5. Lane 2 native smoke evidence is captured showing runtime migration + smoke insert/read success on Expo runtime.
6. `docs/specs/06-testing-strategy.md` is updated to record the two-lane local data verification policy.

## Task breakdown

1. `docs/tasks/T-20260219-04-m2-drizzle-bootstrap-and-smoke-schema.md` - add dependencies, DB bootstrap, single smoke table schema, and initial migration artifacts.
2. `docs/tasks/T-20260219-05-m2-migration-runtime-and-smoke-integration-tests.md` - wire runtime migration execution, smoke read/write path, integration coverage, native smoke evidence, and testing-strategy doc update.

## Risks / dependencies

- Expo/SQLite runtime differences between device and test environments may require adapter/test harness tuning.
- Migration tooling setup can fail if version compatibility across Drizzle/Expo packages is misaligned.
- Smoke-only scope discipline is required to avoid accidental domain modeling creep.

## Decision log

- Date: 2026-02-19
- Decision: Use minimal Drizzle now (instead of raw SQL custom migrations) while limiting schema to one smoke table.
- Reason: Keep AI-assisted implementation safer via typed schema/migrations and stay aligned with project architecture decisions.
- Impact: Validates durable local data infrastructure early with low scope, while preserving freedom to design domain schema later.
