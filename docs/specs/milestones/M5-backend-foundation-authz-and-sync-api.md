# Milestone Spec

## Milestone metadata

- Milestone ID: `M5`
- Title: Backend stack decision, secure auth foundation, and sync API baseline
- Status: `in_progress`
- Owner: `AI + human reviewer`
- Target window: `2026-02`

## Parent references

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Milestone objective

Decide and lock the backend platform for MVP, stand up a minimal backend that runs locally, define a deployment strategy from free tier to paid scale, implement secure user authentication/authorization, and expose authenticated sync APIs for `gyms`, `sessions`, `session_exercises`, and `exercise_sets`.

## In scope

- Evaluate backend stack options against explicit criteria:
  - ease of development and onboarding
  - free-tier practicality
  - ability to operate at zero spend initially, or with strict predefined spend limits when paid usage is enabled
  - no dependency on uncapped credit-card-backed auto-spend for baseline operation
  - migration path to stronger paid offering
  - security/auth and authorization primitives
  - local development quality
- Confirm or revise the currently planned backend platform and record rationale in architecture docs.
- Implement minimal backend runtime that can:
  - start locally with one documented command path
  - run schema migrations
  - expose a health endpoint
- Rationalize local testing checklists into a standard fast quality-gate command path (or equivalent wrapper) for repeatable end-of-task verification.
- Define and codify backend testing strategy updates required by introducing `Supabase`:
  - backend test layers and ownership (`DB`, `Edge`, `Supabase-local integration`, hosted smoke, cross-stack `E2E`)
  - local-first execution expectations and manual verification posture while CI is absent
  - project structure/testing conventions that follow-on tasks and agents must use
- Define deployment strategy and environment model (`local`, `preview/staging`, `production`) including secrets handling and rollback expectations.
- Define user concept and access model:
  - user identity
  - authentication flow(s)
  - mechanism to add users in this stage (for example: controlled invite list or admin provisioning flow)
  - authorization ownership rules
  - baseline hardening controls
- Implement backend API contract for sync domain entities:
  - create/read/update for app-owned state
  - ownership enforcement for every record operation
  - API contract documentation for FE integration later

## Out of scope

- FE screen integration for auth or sync.
- Offline outbox engine and client-side conflict resolution orchestration.
- Group/social features and leaderboard logic.
- Advanced analytics/reporting.
- Full implementation of cross-stack mobile+backend `E2E` tests (strategy/documentation only in M5).
- Mobile test-directory refactor (for example moving `apps/mobile/app/__tests__`) unless scoped by a dedicated follow-up task.

## Deliverables

1. Backend platform decision record with considered options and final recommendation.
2. Minimal backend project scaffold and local runbook.
3. Deployment strategy/runbook from free tier to paid scale path.
4. Secure auth/authz baseline implemented and verified.
5. Sync API endpoints for session-tracking entities with ownership checks.
6. Backend contract test suite covering auth, authz, and API behavior.
7. Updated AI/testing/task-template guidance capturing backend project structure and testing expectations.
8. Standard local quality-gate command path/checklist for fast repeatable verification (with current no-CI posture documented).

## Acceptance criteria

1. A backend decision record exists documenting considered options, selected stack, rationale, and key tradeoffs.
2. `docs/specs/03-technical-architecture.md` is updated to reflect the selected backend stack and its rationale.
3. Backend can run locally from a clean checkout using documented commands, apply migrations, and return healthy status from a health endpoint.
4. Deployment strategy defines environment separation, secrets handling, backup/restore expectations, and an upgrade path from free tier to paid offering.
5. Stack and deployment choices document explicit spend controls (zero-spend mode or predefined hard spend limit) and avoid uncapped spending exposure.
6. Authentication works for MVP-required flows and issues verifiable identity for API access.
7. A user provisioning mechanism exists for this stage so new users can be added without FE integration.
8. Authorization prevents cross-user data access for all sync entities; negative tests prove unauthorized access is rejected.
9. API supports authenticated read/write operations for `gyms`, `sessions`, `session_exercises`, and `exercise_sets`.
10. FE integration is explicitly deferred, but API contract documentation is sufficient for a later integration task.
11. Backend quality gates and contract tests defined by the milestone task cards pass before milestone closeout.
12. `docs/specs/04-ai-development-playbook.md`, `docs/specs/06-testing-strategy.md`, and task template(s) are updated to reflect backend testing layers, manual verification posture (no CI yet), and project-structure conventions.
13. A standard local quality-gate command path (or documented wrapper set) is defined for fast checks, with clear scope and limits (what it covers vs what remains manual/task-specific).

## Backend platform decision (from `T-20260220-07`)

- Date locked: `2026-02-23`
- Primary stack for MVP/M5 execution: `Supabase (Postgres + Auth + RLS)` with local Supabase stack for high-fidelity local development/testing.
- Documented fallback (contingency only): `Cloudflare Workers + D1`, requiring a separate auth/authz primitive selection and more app-layer ownership enforcement work.
- Why `Supabase` won for M5:
  - fastest path to secure auth/authz + SQL-backed sync API baseline in one milestone,
  - better SQL/data portability for future provider moves,
  - stronger local-test fidelity for auth/data policy work, which aligns with the project’s local-first verification bias.
- Spend-control posture:
  - default `zero spend` on free tier,
  - no paid enablement without explicit task-level approval and written guardrails,
  - if paid path is enabled later, define thresholds + alerts/caps + downgrade actions first.
- Implementation assumptions (carry into remaining M5 tasks):
  - provider choice is locked unless a blocking issue is found,
  - sync API contract remains provider-neutral,
  - ownership enforcement must be backend-enforced (not FE-only).
- Full comparison and rationale: `docs/tasks/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`

## Task breakdown

1. `docs/tasks/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md` - evaluate backend options and finalize architecture decision. (`completed`)
2. `docs/tasks/T-20260220-08-m5-minimal-backend-local-runtime.md` - scaffold local backend runtime, reset/seed baseline, and backend testing conventions. (`planned`)
3. `docs/tasks/T-20260220-09-m5-backend-deployment-strategy-and-environments.md` - define deployment strategy, environments, and operational safeguards. (`planned`)
4. `docs/tasks/T-20260220-10-m5-user-auth-authz-and-security-baseline.md` - implement user model, auth/authz rules, and backend hardening baseline. (`planned`)
5. `docs/tasks/T-20260220-11-m5-sync-api-for-session-domain.md` - implement authenticated sync API for session domain entities with contract tests. (`planned`)
6. `docs/tasks/T-20260225-12-m5-quality-gate-command-and-testing-checklist-rationalization.md` - define/implement a standard fast local quality gate and simplify task verification checklists. (`planned`)

## Deferred follow-up tasks (not required for M5 closeout)

1. `docs/tasks/T-20260225-13-post-m5-mobile-test-directory-refactor.md` - move mobile tests out of `apps/mobile/app/__tests__` and rationalize test asset layout without behavior changes. (`planned`)

## Risks / dependencies

- Stack decision task is a strict dependency for implementation tasks; provider choice is locked to `Supabase` unless a documented contingency trigger is hit.
- `Supabase` local stack/runtime friction (CLI, Docker/runtime compatibility, local auth/function behavior) could still trigger contingency escalation even though provider selection is locked.
- Auth model and authorization policies must be settled before API endpoint implementation to avoid rework.
- If free-tier constraints are too tight for MVP data volume, deployment strategy must include explicit paid-tier trigger thresholds.
- API contract drift risk exists unless schema and endpoint contracts are versioned and tested together.
- Repo-structure cleanup churn risk: moving existing mobile tests during M5 backend setup could distract from backend delivery; keep refactor isolated in a dedicated follow-up task.

## Decision log

- Date: 2026-02-20
- Decision: Plan M5 to combine backend foundation + secure auth + backend-side sync API contract in one milestone while keeping FE integration out of scope.
- Reason: This creates a complete backend-ready surface for the next FE integration milestone without mixing FE concerns into platform/security setup.
- Impact: M5 completion should enable a focused FE integration milestone with lower platform uncertainty.

- Date: 2026-02-23
- Decision: Lock M5 primary backend stack to `Supabase (Postgres + Auth + RLS)` and document `Cloudflare Workers + D1` as contingency fallback.
- Reason: `Supabase` best satisfies the combined M5 constraints of local runtime requirement, auth/authz delivery speed, SQL/data portability, and high-fidelity local testing.
- Impact: Remaining M5 tasks can proceed without reopening provider selection; fallback only activates if a concrete blocking issue is found during implementation.

## Completion note

- What changed:
- Verification summary:
- What remains:
