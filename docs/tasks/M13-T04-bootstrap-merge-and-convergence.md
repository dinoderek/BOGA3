---
task_id: M13-T04-bootstrap-merge-and-convergence
milestone_id: "M13"
status: planned
ui_impact: "no"
areas: "frontend|backend|cross-stack"
runtimes: "node|expo|supabase"
gates_fast: "./scripts/quality-fast.sh"
gates_slow: "./scripts/quality-slow.sh"
docs_touched: "docs/specs/milestones/M13-simple-backend-sync.md,docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md"
---

# Task Card

## Task metadata

- Task ID: `M13-T04-bootstrap-merge-and-convergence`
- Title: M13 first-enable bootstrap, merge, and convergence
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

## Objective

Implement first-sync bootstrap and local merge flow, then converge outbox delivery for the merged result.

## Scope

### In scope

- Add one-time bootstrap trigger on sync enable.
- Fetch remote restorable state and merge with local state.
- Queue and flush post-merge local deltas/events.
- Apply post-merge batch response semantics correctly (`SUCCESS` clears batch; `FAILURE` retains suffix from `error_index`).
- Protect local-first behavior on failures.
- Add automated coverage for merge correctness and convergence outcomes.

### Out of scope

- Profile UI visuals/refinement.
- Backend ingest internals beyond required integration points.

## Acceptance criteria

1. First sync enable triggers bootstrap/merge without restart.
2. Merge behavior is deterministic and preserves local usability.
3. Convergence flush occurs after merge and updates sync metadata on success.
4. Failure path keeps local data intact and retryable, honoring `should_retry` + `error_index` semantics.
5. Tests cover the logged-out-then-login bootstrap journey up to convergence.

## Docs touched (required)

- `docs/specs/milestones/M13-simple-backend-sync.md` - align with implemented merge behavior.
- `docs/specs/03-technical-architecture.md` - update planned/adopted language if behavior stabilizes.
- `docs/specs/06-testing-strategy.md` - update coverage policy if needed.

## Testing and verification approach

- Planned checks/commands:
  - targeted frontend integration tests for bootstrap/merge
  - cross-stack local integration check against backend ingest/projection
  - `./scripts/quality-fast.sh`
  - `./scripts/quality-slow.sh` when runtime-sensitive flows are changed
- Test layers covered:
  - integration
  - contract
  - cross-stack smoke

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/**`
  - `apps/mobile/app/__tests__/**`
  - integration harness/scripts as needed
- Project structure impact:
  - none expected

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh`
- Standard local slow gate: `./scripts/quality-slow.sh` when risk triggers apply

## Evidence

- merge-scenario test outputs
- convergence proof notes
- gate summaries

## Completion note (fill at end)

- What changed:
- What tests ran:
- What remains:
