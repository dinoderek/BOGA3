---
task_id: M13-T01-sync-event-contract-and-data-scope
milestone_id: "M13"
status: completed
ui_impact: "no"
areas: "docs|backend|cross-stack"
runtimes: "docs|supabase|sql"
gates_fast: "./scripts/quality-fast.sh backend"
gates_slow: "./scripts/quality-slow.sh backend"
docs_touched: "docs/specs/milestones/M13-simple-backend-sync.md,docs/specs/03-technical-architecture.md,docs/specs/05-data-model.md,docs/specs/06-testing-strategy.md,supabase/session-sync-api-contract.md"
---

# Task Card

## Task metadata

- Task ID: `M13-T01-sync-event-contract-and-data-scope`
- Title: M13 event contract and full data-scope lock
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
- API auth/authz guidelines: `docs/specs/10-api-authn-authz-guidelines.md`

## Objective

Lock the M13 sync event contract and precise entity coverage so implementation tasks can proceed without ambiguity.

## Scope

### In scope

- Define canonical event envelope shape and validation rules.
- Map each M13 data-scope entity to supported event types.
- Define idempotency and per-device ordering contract.
- Define backend acknowledgement/error categories.
- Update cross-cutting specs and sync contract doc references.

### Out of scope

- Client outbox runtime implementation.
- Backend ingest endpoint implementation.
- UI changes.

## Acceptance criteria

1. Event envelope contract is documented with required and optional fields.
2. Entity-event mapping covers all M13 data-scope entities.
3. Idempotency and ordering semantics are explicit and testable.
4. Contract includes failure categories and retry handling expectations.
5. Cross-cutting docs are updated in the same session (`03`, `05`, `06`, and contract doc source).

## Docs touched (required)

- `docs/specs/milestones/M13-simple-backend-sync.md` - align milestone text with finalized event contract.
- `docs/specs/03-technical-architecture.md` - lock planned sync architectural statement.
- `docs/specs/05-data-model.md` - lock data-model/sync-scope mapping.
- `docs/specs/06-testing-strategy.md` - lock contract-level verification expectations.
- `supabase/session-sync-api-contract.md` - add/align M13 event-contract section.

## Testing and verification approach

- Planned checks/commands:
  - `./scripts/quality-fast.sh backend`
  - targeted local contract smoke for updated API contract docs/examples (if scripts exist)
- Standard local gate usage:
  - `./scripts/quality-fast.sh backend`
  - `./scripts/quality-slow.sh backend` when contract script updates land
- Test layers covered:
  - contract
  - integration (doc-backed)
- Slow-gate triggers:
  - required if backend test assets/scripts change
- Hosted/deployed smoke ownership:
  - deferred to a later M13 implementation task

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/**`
  - `supabase/session-sync-api-contract.md`
- Project structure impact:
  - none expected

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh backend`
- Standard local slow gate: `./scripts/quality-slow.sh backend` if backend contract scripts/tests change

## Evidence

- command output summary for all executed gates
- concise contract change summary by file
- Manual verification summary (required when CI is absent/partial): CI is not configured; this task ran local backend fast gate coverage (`./scripts/quality-fast.sh backend`) and validated contract lock consistency across the required docs.

## Completion note (fill at end)

- What changed: Locked the canonical M13 event envelope, entity-event mapping, idempotency/ordering semantics, and failure-category retry contract in `supabase/session-sync-api-contract.md`; aligned milestone sync protocol text in `docs/specs/milestones/M13-simple-backend-sync.md`; updated cross-cutting sync statements in `docs/specs/03-technical-architecture.md`, `docs/specs/05-data-model.md`, and `docs/specs/06-testing-strategy.md`.
- What tests ran: `./scripts/quality-fast.sh backend` (pass).
- What remains: M13 implementation tasks `M13-T02` through `M13-T05` are still pending; milestone remains open (`in_progress`).
