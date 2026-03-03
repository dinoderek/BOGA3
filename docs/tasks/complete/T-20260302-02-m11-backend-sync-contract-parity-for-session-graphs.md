---
task_id: T-20260302-02
milestone_id: "M11"
status: completed
ui_impact: "no"
areas: "backend,docs"
runtimes: "supabase,docs"
gates_fast: "./scripts/quality-fast.sh backend"
gates_slow: "./scripts/quality-slow.sh backend"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,supabase/session-sync-api-contract.md,supabase/migrations/**,supabase/tests/**"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-02`
- Title: M11 backend sync contract parity for session graphs
- Status: `completed`
- Session date: `2026-03-03`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- API/auth guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- Sync API contract: `supabase/session-sync-api-contract.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ 484d5518e382485a3aee6a2818defa375b5b1d31`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git fetch origin`; `HEAD...origin/main = 0 0`)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `supabase/session-sync-api-contract.md`
- Code/docs inventory freshness checks run:
  - compare mobile session-edit/delete behavior with current API contract, backend schema, and backend contract tests
- Known stale references or assumptions:
  - local backend runtime verification is blocked unless Docker/OrbStack is available on the workstation
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/complete/T-20260302-02-m11-backend-sync-contract-parity-for-session-graphs.md`

## Objective

Ensure the backend contract can faithfully represent the real frontend session-graph edit model, including nested row removal and any other parity gaps discovered in Task 01.

## Scope

### In scope

- Decide and implement the parity mechanism required for session-graph sync correctness.
- Update backend schema/API contract documentation and tests accordingly.
- Preserve backend-enforced auth/authz and ownership guarantees.
- Update project-level architecture/testing docs if stable sync-contract behavior changes.

### Out of scope

- Mobile sync orchestration.
- End-user auth UI.
- Hosted environment/deployment work.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Backend sync contract supports the required session-graph parity semantics for M11.
2. Auth, unauthenticated denial, and cross-user denial coverage remain intact for the updated contract.
3. Contract tests cover the new parity path, including delete/tombstone or equivalent behavior.
4. `supabase/session-sync-api-contract.md` reflects the implemented contract.
5. Project-level architecture/testing docs are updated if the stable sync model changed.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `supabase/session-sync-api-contract.md` - document the final parity contract
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - record any scope/contract refinement
  - `docs/specs/03-technical-architecture.md` - document stable sync-model changes
  - `docs/specs/06-testing-strategy.md` - document required sync parity coverage if changed

## Testing and verification approach

- Planned checks/commands:
  - targeted backend contract tests for the new parity path
  - `./scripts/quality-fast.sh backend`
  - `./scripts/quality-slow.sh backend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh backend`
  - `./scripts/quality-slow.sh backend`
- Test layers covered: backend contract/integration/authz
- Execution triggers: always
- Slow-gate triggers:
  - required because this task changes backend sync contract behavior and auth/RLS-exercised integration coverage
- Hosted/deployed smoke ownership: deferred to a future cloud-environment milestone
- CI/manual posture note: no CI; local backend contract suites are the source of truth

## Implementation notes

- Planned files/areas allowed to change:
  - `supabase/migrations/**`
  - `supabase/tests/**`
  - `supabase/scripts/**` (only if wrappers need updates)
  - `supabase/session-sync-api-contract.md`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
- Project structure impact: `no structure change expected`
- Constraints/assumptions:
  - preserve `Supabase Auth + RLS` enforcement; do not move ownership checks into FE-only code

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh backend`
- Standard local slow gate: `./scripts/quality-slow.sh backend`
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260302-02-m11-backend-sync-contract-parity-for-session-graphs.md`

## Evidence

- Final parity mechanism summary.
- Backend contract test results summary.
- Manual verification summary: local backend contract suites are still required because CI is absent; this session could only perform static validation because Docker/OrbStack was unavailable.
- Deferred/manual hosted checks summary: hosted smoke remains owned by a future cloud-environment milestone.

## Completion note

- What changed: Added `supabase/migrations/20260303113000_m11_session_graph_replace_rpc.sql` with `app_public.replace_session_graph`, an authenticated aggregate session-graph replace RPC that enforces owner checks, rejects stale writes with `p_expected_updated_at`, and deletes omitted nested child rows during replacement; extended `supabase/tests/session-sync-api-contract.sh` to cover aggregate create/replace parity, stale-write rejection, unauthenticated denial, and cross-user denial; updated the sync contract, M11 milestone, and project-level architecture/testing docs to document the adopted RPC-based parity model.
- What tests ran: `git fetch origin`; `git rev-list --left-right --count HEAD...origin/main`; `bash -n supabase/tests/session-sync-api-contract.sh supabase/scripts/test-sync-api-contract.sh scripts/quality-fast.sh scripts/quality-slow.sh`; `./supabase/scripts/test-sync-api-contract.sh`; `./scripts/quality-fast.sh backend`; `./scripts/quality-slow.sh backend`.
- What remains: the remaining M11 tasks still need to wire the mobile auth adapter, sync engine, sync UI, broader mock-backend coverage, and the cross-stack `Maestro` proof path.
- Manual verification summary (required when CI is absent/partial): static shell validation passed, `./scripts/task-closeout-check.sh` passed, and the real local Supabase runtime suites passed after starting OrbStack, including the direct sync contract suite plus the standard backend fast and slow wrappers.

## Status update checklist

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, update `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` in the same session as applicable.
- Update parent milestone task breakdown/status in the same session.
