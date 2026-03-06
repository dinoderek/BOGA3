---
task_id: M13-T02-client-outbox-and-recorder-cadence-sync
milestone_id: "M13"
status: completed
ui_impact: "no"
areas: "frontend|cross-stack"
runtimes: "node|expo"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/milestones/M13-simple-backend-sync.md,docs/specs/06-testing-strategy.md"
---

# Task Card

## Task metadata

- Task ID: `M13-T02-client-outbox-and-recorder-cadence-sync`
- Title: M13 client outbox and dual-cadence scheduler
- Status: `completed`
- File location rule:
  - author active cards in `docs/tasks/<task-id>.md`
  - move the file to `docs/tasks/complete/<task-id>.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-03-06`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M13-simple-backend-sync.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Data model: `docs/specs/05-data-model.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Objective

Implement the local outbox and scheduler behavior with the locked cadence policy (`60s` general, `10s` on `session-recorder`).

## Scope

### In scope

- Add persistent outbox queue and delivery state.
- Emit events at domain write boundaries for M13 entity scope.
- Implement scheduler cadence switching by current route/context.
- Implement in-flight guard and backoff state machine.
- Implement client handling for ingest responses:
  - `SUCCESS` clears the submitted batch.
  - `FAILURE` uses `error_index` to keep the failed suffix queued.
- Add frontend unit/integration coverage for queue, cadence, retry, and offline resume.

### Out of scope

- Backend ingest endpoint implementation.
- First-sync bootstrap merge logic.
- Profile UI controls.

## Acceptance criteria

1. Events are queued for tracked entity mutations.
2. Scheduler uses `60s` cadence outside recorder and `10s` in recorder.
3. In-flight guard prevents concurrent sends.
4. Offline mode retains queue without data loss.
5. Backoff constants follow milestone policy.
6. Ingest response handling follows contract (`SUCCESS | FAILURE`, `error_index`, `should_retry`, free-text `message`).
7. Automated tests cover both cadence paths and retry behavior.

## Docs touched (required)

- `docs/specs/milestones/M13-simple-backend-sync.md` - implementation notes alignment if needed.
- `docs/specs/06-testing-strategy.md` - update only if stable coverage shape changes.

## Testing and verification approach

- Planned checks/commands:
  - focused outbox/scheduler Jest suites
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend` (required; recorder behavior is runtime-sensitive)
- Test layers covered:
  - unit
  - integration
  - runtime smoke

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/**`
  - `apps/mobile/app/**` (only if route-context hooks are needed)
  - `apps/mobile/app/__tests__/**`
- Project structure impact:
  - none expected

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`

## Evidence

- Targeted suites:
  - `npm run test -- app/__tests__/sync-outbox-engine.test.ts app/__tests__/sync-scheduler.test.ts app/__tests__/sync-domain-event-emission.test.ts app/__tests__/root-layout-auth-bootstrap.test.ts` (`pass`)
- Fast gate:
  - `./scripts/quality-fast.sh frontend` (`pass`; existing repo lint warnings only, no lint/type/test errors)
- Slow gate:
  - `./scripts/quality-slow.sh frontend`
    - `test:e2e:ios:smoke` (`pass`)
    - `test:e2e:ios:data-smoke` (`pass`)
    - `test:e2e:ios:auth-profile` (`fail`: `Element not found: Id matching regex: profile-username-input`)
  - Retried `npm run test:e2e:ios:auth-profile` once; same failure reproduced.
- Cadence proof notes:
  - Added scheduler unit coverage asserting `60s` default cadence and `10s` `session-recorder` cadence plus offline->online immediate flush trigger.

## Completion note (fill at end)

- What changed:
  - Added persistent sync tables (`sync_outbox_events`, `sync_delivery_state`) and runtime migration `m0007`.
  - Implemented M13 sync outbox/event models, ingest-response handling, retry/backoff policy, and flush in-flight guard under `apps/mobile/src/sync/**`.
  - Added route-aware cadence scheduler (`60s` general / `10s` recorder) and wired root layout to update cadence context from pathname.
  - Wired M13 entity-scope event enqueueing at frontend write boundaries for gyms/sessions/session exercises/exercise sets/exercise definitions/exercise muscle mappings/exercise tag definitions/session exercise tags.
  - Added sync-focused unit coverage for engine/scheduler and domain-event emission wiring.
- What tests ran:
  - `npm run test -- app/__tests__/sync-outbox-engine.test.ts app/__tests__/sync-scheduler.test.ts app/__tests__/sync-domain-event-emission.test.ts app/__tests__/root-layout-auth-bootstrap.test.ts`
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend` (with one deterministic failing sub-flow noted above)
  - `npm run test:e2e:ios:auth-profile` (retry, same failure)
- What remains:
  - Resolve the existing/now-deterministic Maestro auth-profile flow failure (`profile-username-input` not found after sign-in).
