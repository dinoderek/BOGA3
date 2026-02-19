# Task Card

## Task metadata

- Task ID: `T-20260219-04`
- Title: M2 Drizzle bootstrap and smoke schema setup
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-19`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M2-local-storage-infrastructure-smoke.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Create the minimum Drizzle + SQLite foundation in `apps/mobile` with one infrastructure-only smoke table and initial migration artifacts.

## Scope

### In scope

- Add required local storage dependencies for Drizzle + Expo SQLite usage.
- Add a dedicated local data-layer bootstrap module.
- Define one smoke table schema for infrastructure verification only.
- Add migration configuration and generate initial migration output.
- Add basic wiring so the app codebase can import DB bootstrap safely.

### Out of scope

- Runtime migration execution behavior.
- Smoke insert/read integration flow.
- Any `Session -> Exercise -> Set` or gym/machine schema.
- UI feature changes unrelated to data bootstrap safety.

## Acceptance criteria

1. Drizzle + SQLite dependencies/config are added and compile in `apps/mobile`.
2. A single smoke schema table is defined and included in generated migration artifacts.
3. No workout-domain tables or repositories are introduced.
4. Lane 1 setup is in place with a migration-generation canary command documented for CI/local verification.
5. `npm run lint` and `npm run typecheck` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - `npm run lint`
  - `npm run typecheck`
  - migration-generation canary command (to be added in this task)
- Notes:
  - Task focus is Lane 1 foundation (tooling + compile-time readiness); runtime native validation is deferred to `T-20260219-05`.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/package.json`, `apps/mobile/drizzle.config.*`, `apps/mobile/src/data/**`, `apps/mobile/drizzle/**`
- Constraints/assumptions:
  - Keep naming generic (infrastructure smoke only).
  - Use minimal schema shape (`id`, value payload, timestamps) without domain semantics.
  - Avoid introducing app-level domain repository abstractions in this task.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`, run at closeout even if unchanged)

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- 

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
