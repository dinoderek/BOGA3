---
task_id: T-20260302-01
milestone_id: "M11"
status: completed
ui_impact: "no"
areas: "docs,backend,cross-stack"
runtimes: "docs,supabase"
gates_fast: "N/A"
gates_slow: "N/A"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,supabase/session-sync-api-contract.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-01`
- Title: M11 sync scope, conflict policy, and M5 realignment
- Status: `completed`
- Session date: `2026-03-02`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Milestone spec: `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- API/auth guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- Backend baseline milestone: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Sync API contract: `supabase/session-sync-api-contract.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ 619f5b4`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git fetch origin`; `HEAD...origin/main = 0 0`)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `supabase/session-sync-api-contract.md`
- Code/docs inventory freshness checks run:
  - backend contract audit against current mobile session-edit behavior and nested child-removal semantics
  - active milestone/task inventory for M5/M11 planning
- Known stale references or assumptions:
  - M5 realignment was already mostly landed before this closeout; this task confirmed that `T-20260220-09` was already archived as `outdated` and cleaned up the remaining active-task drift
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/complete/T-20260302-01-m11-sync-scope-conflict-policy-and-m5-realignment.md`

## Objective

Lock the M11 sync/auth behavior and conflict-policy contract, audit the current backend contract for known parity gaps, and complete the M5 documentation realignment so cloud deployment no longer blocks the sync milestone.

## Scope

### In scope

- Finalize the written M11 contract for:
  - auth-gated sync behavior
  - sync trigger model
  - conflict policy or conflict-avoidance model
  - session-domain-only scope boundaries
- Audit `supabase/session-sync-api-contract.md` against current frontend edit behavior and record required backend parity work.
- Mark `T-20260220-09` outdated and update M5 milestone status/task references accordingly.
- Promote stable planning decisions into project-level docs (`03`, `04`, `06`) rather than leaving them only in milestone/task docs.

### Out of scope

- Backend schema/API implementation.
- Mobile sync-engine implementation.
- UI route implementation.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. M11 scope, auth behavior, and initial sync trigger model are explicitly documented.
2. Conflict policy or conflict-avoidance behavior is explicitly documented strongly enough to guide implementation tasks.
3. Required backend parity gaps are identified and captured for the next task.
4. `T-20260220-09` is marked `outdated` and no longer blocks M5 closeout.
5. Project-level docs (`03`, `04`, `06`) are updated where the stable sync/auth/testing contract has changed.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - lock milestone contract and task breakdown
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` - realign M5 scope/closeout after deferring cloud deployment
  - `docs/tasks/complete/T-20260220-09-m5-backend-deployment-strategy-and-environments.md` - mark outdated with rationale
  - `docs/specs/03-technical-architecture.md` - record planned sync behavior at project level
  - `docs/specs/04-ai-development-playbook.md` - require project-level doc maintenance for significant sync changes
  - `docs/specs/06-testing-strategy.md` - record sync-coverage expectations
  - `supabase/session-sync-api-contract.md` - add audit notes only if the contract summary needs explicit gap callouts

## Testing and verification approach

- Planned checks/commands:
  - docs coherence review across `M5`, `M11`, `03`, `04`, `06`, and sync contract docs
  - `rg` checks for stale M5 `in_progress` / task-reference drift
- Standard local gate usage:
  - `./scripts/quality-fast.sh`: `N/A (docs/planning task)`
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A`
- Test layers covered: docs/planning coherence
- Execution triggers: always
- Slow-gate triggers: `N/A`
- Hosted/deployed smoke ownership: deferred to a future cloud-environment milestone
- CI/manual posture note: no CI; manual doc coherence review in-task

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/complete/T-20260220-09-m5-backend-deployment-strategy-and-environments.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `supabase/session-sync-api-contract.md` (only if gap callouts are added)
- Project structure impact: `no structure change expected`
- Constraints/assumptions:
  - keep M11 scoped to the existing backend session domain unless a human explicitly broadens it

## Mandatory verify gates

- Standard local fast gate: `N/A (docs/planning task)`
- Standard local slow gate: `N/A`
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260302-01-m11-sync-scope-conflict-policy-and-m5-realignment.md`

## Evidence

- M11 sync/auth/conflict policy summary.
- M5 scope realignment summary.
- Backend parity gap summary for follow-up implementation.
- Manual verification summary: docs/task reference coherence reviewed because CI is absent for docs-only work.

## Completion note

- What changed: Locked the M11 written contract in the milestone and project-level docs; added explicit aggregate-session conflict/parity audit notes to `supabase/session-sync-api-contract.md`; confirmed the M5 realignment had already landed and archived this task card so the milestone no longer points at an active placeholder.
- What tests ran: `./scripts/task-bootstrap.sh docs/tasks/T-20260302-01-m11-sync-scope-conflict-policy-and-m5-realignment.md`; `git fetch origin`; `git rev-list --left-right --count HEAD...origin/main`; `rg`/`sed` audits across `M11`, `M5`, project-level sync/testing docs, and `supabase/session-sync-api-contract.md`; `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260302-01-m11-sync-scope-conflict-policy-and-m5-realignment.md`
- What remains: `T-20260302-02` still needs to implement the backend parity mechanism for nested child removals and stale-write/conflict handling, and the remaining M11 tasks still need to add the mobile auth/session adapter, sync engine, diagnostics UI, mock-backend coverage, and cross-stack `Maestro` proof path.
- Manual verification summary (required when CI is absent/partial): Performed manual doc/task coherence review, verified `main` was synced with `origin/main`, confirmed no stale active reference to `T-20260220-09` remained in the touched sync docs, and re-ran the task closeout checker after archiving this card.

## Status update checklist

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, update `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` in the same session.
- Update parent milestone task breakdown/status in the same session.
