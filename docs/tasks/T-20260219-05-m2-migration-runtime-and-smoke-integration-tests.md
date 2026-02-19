# Task Card

## Task metadata

- Task ID: `T-20260219-05`
- Title: M2 runtime migrations and smoke persistence integration tests
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

Execute migrations through runtime bootstrap, add a minimal smoke write/read path, and verify end-to-end local persistence behavior with integration tests.

## Scope

### In scope

- Implement app data bootstrap that runs pending local migrations at runtime.
- Add a tiny smoke persistence function set (insert and read/list for smoke records).
- Add integration tests that validate:
  - fresh DB migration bootstrap
  - smoke insert success
  - smoke read after write
- Execute and capture native runtime smoke evidence (Expo runtime with real SQLite) for migration + smoke read/write.
- Ensure test harness can execute data-layer checks reliably in local environment.
- Update `docs/specs/06-testing-strategy.md` with the two-lane local data verification policy established in M2.

### Out of scope

- Domain entities (`session`, `exercise`, `set`) and business validation.
- Sync/outbox/auth/backend behaviors.
- UI flows or feature-level form interactions.

## Acceptance criteria

1. Runtime bootstrap applies migrations on a fresh local DB without manual intervention.
2. Smoke persistence path can insert and read records successfully after migration.
3. Integration tests cover migration bootstrap and at least one successful write/read scenario.
4. Lane 2 native runtime smoke evidence is captured for migration + smoke insert/read on Expo runtime.
5. `docs/specs/06-testing-strategy.md` is updated with the two-lane data-layer validation guidance.
6. `npm run lint`, `npm run typecheck`, and `npm run test` pass in `apps/mobile`.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - `npm run test -- <data-layer smoke integration test target>`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Notes:
  - Add at least one failure/edge assertion for migration bootstrap behavior (for example, duplicate bootstrap idempotency).
  - Capture a concise native runtime smoke record (command/steps + observed success signal) as task evidence.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/src/data/**`, `apps/mobile/app/**` (bootstrap hook only if needed), `apps/mobile/app/__tests__/**`, `apps/mobile/jest.*`
- Constraints/assumptions:
  - Keep persistence API intentionally small and infrastructure-oriented.
  - Avoid introducing domain contracts beyond smoke-table access.
  - Prefer deterministic test setup/teardown for DB state.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)

## Evidence (follow `docs/specs/04-ai-development-playbook.md`)

- Lane 1 command outputs summary (`lint`, `typecheck`, `test`, targeted integration test).
- Lane 2 native runtime smoke summary (environment, steps run, migration success signal, smoke write/read success signal).
- Testing strategy update summary for `docs/specs/06-testing-strategy.md`.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
