---
task_id: M13-T03-backend-ingest-idempotency-and-projection
milestone_id: "M13"
status: planned
ui_impact: "no"
areas: "backend|cross-stack"
runtimes: "supabase|sql|deno"
gates_fast: "./scripts/quality-fast.sh backend"
gates_slow: "./scripts/quality-slow.sh backend"
docs_touched: "docs/specs/milestones/M13-simple-backend-sync.md,docs/specs/05-data-model.md,docs/specs/06-testing-strategy.md,docs/specs/tech/client-sync-engine.md,supabase/session-sync-api-contract.md"
---

# Task Card

## Task metadata

- Task ID: `M13-T03-backend-ingest-idempotency-and-projection`
- Title: M13 backend event ingest, idempotency, and projection
- Status: `planned`
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
- API auth/authz guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- Client sync engine deep-dive: `docs/specs/tech/client-sync-engine.md`

## Objective

Implement backend event ingest and projection so outbox events are applied idempotently and restorable backup state stays coherent.

## Scope

### In scope

- Add authenticated ingest endpoint(s) for batched events.
- Enforce idempotency by `event_id` and ordering by `(device_id, sequence_in_device)`.
- Persist event ingest metadata required for strict in-order processing.
- Project applied events into restorable user-state tables/read models.
- Add backend contract tests for success, duplicate replay, ordering, and denial paths.

### Out of scope

- Frontend outbox emission logic.
- Profile UI work.
- End-to-end mobile Maestro verification.

## Acceptance criteria

1. Event ingest response contract is minimal: `SUCCESS` or `FAILURE` with `error_index`, optional `error_event_id`, `should_retry`, and free-text `message`.
2. Duplicate event replay is idempotent.
3. Batch processing is strict request-order with stop-on-first-failure and prefix-commit behavior.
4. Projection state remains coherent for all M13 data-scope entities.
5. Backend auth/RLS denial paths are tested.
6. Backend fast/slow quality gates pass.

## Docs touched (required)

- `supabase/session-sync-api-contract.md` - ingest/ack/projection contract details.
- `docs/specs/05-data-model.md` - backend model updates for projection storage.
- `docs/specs/06-testing-strategy.md` - backend sync verification expectations.
- `docs/specs/milestones/M13-simple-backend-sync.md` - align technical approach details if needed.
- `docs/specs/tech/client-sync-engine.md` - update client/backend interaction, failure-mode, and test-overview sections impacted by ingest/projection behavior changes.

## Testing and verification approach

- Planned checks/commands:
  - backend unit/contract tests for ingest/projection
  - `./scripts/quality-fast.sh backend`
  - `./scripts/quality-slow.sh backend`
- Test layers covered:
  - db/constraint
  - contract/integration
  - local runtime smoke

## Implementation notes

- Planned files/areas allowed to change:
  - `supabase/migrations/**`
  - `supabase/functions/**` (if ingest endpoint uses functions)
  - `supabase/tests/**`
  - `supabase/scripts/**`
- Project structure impact:
  - no top-level structure change expected

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh backend`
- Standard local slow gate: `./scripts/quality-slow.sh backend`

## Evidence

- backend contract test outputs
- idempotency/replay proof summary
- projection correctness checks

## Completion note (fill at end)

- What changed:
- What tests ran:
- What remains:
