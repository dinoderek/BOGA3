# Task Card

## Task metadata

- Task ID: `T-20260220-10`
- Title: M5 user concept, authentication, authorization, and security baseline
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Implement MVP backend user identity model on `Supabase`, a controlled user-provisioning mechanism for this stage, and secure authentication/authorization rules (primarily `Supabase Auth` + `Postgres RLS`) so all backend data operations are user-scoped and protected.

## Scope

### In scope

- Define user concept and ownership model for backend records, including how app-owned tables relate to `auth.users` (direct FK and/or profile table pattern, to be documented).
- Implement mechanism to add users in this stage without FE integration (for example: Supabase dashboard admin flow, Admin API script, or controlled invite list).
- Implement MVP authentication flow(s) on `Supabase Auth` and document enabled vs disabled providers for this stage.
- Implement authorization enforcement for user-owned data using database-level controls (`RLS` policies) and server-side checks where needed.
- Add secure defaults:
  - input validation
  - secure secret handling patterns
  - baseline abuse controls for auth endpoints
  - minimal audit/error logging discipline
- Add Supabase-specific secure defaults:
  - enable `RLS` on all user-owned tables in scope
  - deny-by-default policy posture before allow policies
  - no client exposure of `service role` credentials
  - explicit use-boundary documentation for `anon` vs `service role` vs server-only secrets
- Implement contract tests for auth success/failure and cross-user access denial.
- Use deterministic local test fixtures/baselines defined in `T-20260220-08` (for example `user_a`, `user_b`) for repeatable ownership-denial tests.

### Out of scope

- FE auth UI flows.
- Social/group authorization rules.
- Advanced enterprise security controls beyond MVP baseline.

## Acceptance criteria

1. User identity model is defined and mapped to app-owned entities, including the `Supabase Auth` user linkage pattern.
2. A user-provisioning mechanism exists for this stage and is documented/tested.
3. Authentication flow works for MVP-required cases and produces verifiable identity context for API requests.
4. Authorization policies enforce per-user ownership constraints across protected entities, with `RLS` enabled on all protected tables in scope.
5. Negative-path tests prove unauthorized and cross-user access is blocked (including at least one database-policy/RLS denial test path).
6. Security baseline controls for validation, secrets, auth endpoint hardening, and Supabase key-scope boundaries are implemented and documented.
7. Backend quality gates and contract tests pass.

## Testing and verification approach

- Planned checks/commands (from applicable backend/function workspace):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `supabase db reset` (or selected local migration/bootstrap command path) before auth/authz contract test run when schema/policies change
  - targeted auth/authz contract tests (suite naming to be defined in-session)
  - `DB`-level policy/function test command (for example `pgTAP` or equivalent SQL-level test path) when policies/functions/constraints change
- Notes:
  - Include at least one explicit cross-user access-denied test per protected resource family.
  - Prefer real `RLS` enforcement verification against local Supabase runtime; handler-only mocks are insufficient for ownership guarantees.
  - Tests should exercise the strongest available enforcement boundary (`RLS` and/or server-only checks), not only handler-level guards.

## Implementation notes

- Planned files/areas allowed to change:
  - `supabase/**`
  - `apps/backend/**` (if auxiliary backend/test harness workspace exists)
  - `docs/specs/03-technical-architecture.md` (if auth/authz decision details need to be codified)
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-10-m5-user-auth-authz-and-security-baseline.md`
- Constraints/assumptions:
  - Must build on backend scaffold from `T-20260220-08`.
  - Must implement the `Supabase Auth + Postgres RLS` primary path from `T-20260220-07` unless a milestone-level blocker is documented.
  - Must align with backend contract-test intent in `docs/specs/06-testing-strategy.md`.

## Mandatory verify gates

- `npm run lint` (from applicable backend/function workspace)
- `npm run typecheck` (from applicable backend/function workspace)
- `npm run test` (from applicable backend/function workspace)
- `supabase db reset` (or selected local migration/bootstrap command path) when schema/policies changed
- Auth/authz contract test suite command (from applicable backend/function workspace)
- `DB`-level policy/function test command when policies/functions/constraints changed

## Evidence

- Auth flow success/failure test summary.
- User-provisioning flow summary.
- Authorization denial test summary.
- `RLS` policy coverage / denial evidence summary.
- Security baseline checklist summary.
- Lint/typecheck/test summary.

## Completion note

- What changed:
- Added `Supabase` auth/authz baseline migration in `supabase/migrations/20260225143000_m5_auth_authz_security_baseline.sql`:
  - user-owned sync-domain tables in `app_public` (`gyms`, `sessions`, `session_exercises`, `exercise_sets`)
  - redundant `owner_user_id -> auth.users(id)` ownership linkage on all protected tables
  - composite ownership FKs to prevent cross-user parent/child linkage
  - `RLS` enabled on all protected tables with owner-only CRUD policies for `authenticated`
  - owner immutability trigger for protected tables
- Updated `supabase/config.toml` auth posture for M5:
  - `app_public` exposed in local API schemas
  - global self-signup disabled (`[auth].enable_signup = false`)
  - email provider login preserved for provisioned users (`[auth.email].enable_signup = true`)
- Added controlled provisioning scripts (service-role only):
  - `supabase/scripts/auth-provision-user.sh`
  - `supabase/scripts/auth-provision-local-fixtures.sh`
  - deterministic fixture constants in `supabase/scripts/auth-fixture-constants.sh`
- Added local auth/authz contract test suite:
  - `supabase/tests/auth-authz-contract.sh`
  - `supabase/scripts/test-auth-authz.sh`
- Updated `supabase/README.md` with auth posture, provisioning commands, and auth/authz test runbook.
- What tests ran:
- `./supabase/scripts/test-auth-authz.sh`
- `./supabase/scripts/db-lint-local.sh`
- `./supabase/scripts/smoke-seed.sh`
- `npm run lint` / `npm run typecheck` / `npm run test`: `N/A` (no backend Node/TS workspace introduced; runtime-specific Supabase gates used)
- What remains:
- `T-20260220-09`: hosted deployment strategy/environment/secrets and hosted smoke ownership/commands.
- `T-20260220-11`: authenticated sync API contract implementation for session domain entities.
- `T-20260225-12`: repo-level quality-gate command rationalization.
