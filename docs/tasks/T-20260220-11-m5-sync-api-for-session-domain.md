# Task Card

## Task metadata

- Task ID: `T-20260220-11`
- Title: M5 authenticated sync API for session domain entities
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- API authN/authZ guidelines: `docs/specs/10-api-authn-authz-guidelines.md`

## Objective

Implement `Supabase`-backed API methods to read/write user-scoped gym and session-tracking state (`gyms`, `sessions`, `session_exercises`, `exercise_sets`) with authentication and authorization enforced, and validate the chosen API surface with thorough local contract/integration coverage.

## Scope

### In scope

- Choose and implement one explicit Supabase API surface for the sync contract (documented in-task):
  - `Supabase Edge Functions` endpoints (preferred when needed for provider-neutral contract shaping, orchestration, or validation)
  - `Supabase PostgREST/RPC` surface with documented contract mapping (acceptable if contract remains explicit and stable for FE integration)
- Implement authenticated endpoints/methods for sync domain entities:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
- Implement ownership-aware read/write behavior using backend-enforced controls (`RLS` and/or server-side checks); FE-only enforcement is not acceptable.
- Define provider-neutral API payload/response contracts for later FE integration (even if implemented on Supabase-specific primitives).
- Add contract tests for:
  - success paths
  - validation failures
  - unauthorized requests
  - cross-user access denial
- Add test coverage appropriate to the chosen implementation surface:
  - unit tests for custom runtime logic/validation (for example `Edge Functions`) when present
  - local Supabase integration/contract tests for real auth + `RLS` behavior (required)
  - cross-stack mobile+backend `E2E` implementation is not required in this task, but contracts/test fixtures should support the documented `E2E` strategy
- Document endpoint catalog and example payloads, including mapping from provider-neutral contract to Supabase implementation artifacts (Edge Function names, RPC names, or table routes).

### Out of scope

- FE integration and client sync engine wiring.
- Conflict-resolution policy beyond MVP-safe baseline.
- Group/social APIs.

## Acceptance criteria

1. Authenticated API read/write methods exist for all required session domain entities.
2. API surface choice (`Edge Functions` vs `PostgREST/RPC` mix) is documented with rationale and contract mapping.
3. Every endpoint/method enforces user ownership semantics via backend-enforced controls (`RLS` and/or server-side checks).
4. Unauthorized requests are rejected with deterministic error responses.
5. Cross-user access attempts are rejected and test-covered.
6. Test coverage reflects the chosen API surface (unit coverage for custom code where present, plus required local Supabase integration/contract coverage).
7. Endpoint contracts are documented and stable enough for a dedicated FE integration milestone.
8. Backend quality gates and contract tests pass.

## Testing and verification approach

- Planned checks/commands (from applicable backend/function workspace):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `supabase db reset` (or selected local migration/bootstrap command path) when schema/API contract fixtures change
  - targeted API contract test suite command(s) (to be finalized during implementation)
  - surface-specific fast tests (for example `deno test` for Edge Functions) when custom runtime code is introduced
- Notes:
  - Include at least one end-to-end API flow per entity family and one negative ownership test per family.
  - If the chosen surface is mostly `PostgREST/RPC` with minimal custom code, compensate for limited unit-test surface with stronger contract/integration and `RLS` coverage.
  - Tests must run primarily against local Supabase runtime to preserve the local-fidelity requirement from `T-20260220-07`.

## Implementation notes

- Planned files/areas allowed to change:
  - `supabase/**`
  - `apps/backend/**` (if auxiliary backend/test harness workspace exists)
  - `docs/specs/03-technical-architecture.md` (if API-layer architecture decisions need codification)
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-11-m5-sync-api-for-session-domain.md`
- Constraints/assumptions:
  - Must build on auth/authz baseline from `T-20260220-10`.
  - Must keep the external sync contract provider-neutral even if implemented with Supabase-specific primitives.
  - Must preserve `Supabase` as the primary implementation path unless a documented blocker triggers contingency escalation.
  - Keep API contracts MVP-minimal and explicit.

## Mandatory verify gates

- `npm run lint` (from applicable backend/function workspace)
- `npm run typecheck` (from applicable backend/function workspace)
- `npm run test` (from applicable backend/function workspace)
- `supabase db reset` (or selected local migration/bootstrap command path) when schema/API fixtures changed
- API contract test suite command(s) (from applicable backend/function workspace)
- Surface-specific fast test command(s) for introduced custom runtime code (if applicable)

## Evidence

- Endpoint catalog summary.
- API contract test results summary.
- Unauthorized/cross-user denial evidence summary.
- Contract-to-Supabase implementation mapping summary (`Edge Functions` / `RPC` / table routes).
- Lint/typecheck/test summary.

## Completion note

- What changed:
- Chose `Supabase PostgREST` table routes on `app_public` as the explicit M5 sync API surface (no custom sync `Edge Functions` in this task) and documented the provider-neutral method catalog + Supabase mapping in `supabase/session-sync-api-contract.md`.
- Added `supabase/tests/session-sync-api-contract.sh` with local contract/integration coverage for authenticated create/read/update/list flows across `gyms`, `sessions`, `session_exercises`, and `exercise_sets`.
- Added negative-path coverage in the sync API contract suite for unauthenticated denial, validation failures, cross-user read/update denial via `RLS`, cross-user parent-child ownership mismatch rejection via FK constraints, and owner spoofing denial.
- Added `supabase/scripts/test-sync-api-contract.sh` wrapper and documented the new sync API contract baseline + command in `supabase/README.md`.
- What tests ran:
- `./supabase/scripts/test-sync-api-contract.sh` ✅ (includes local runtime up, `supabase db reset`, local auth fixture provisioning, and sync API contract suite)
- `./supabase/scripts/db-lint-local.sh` ✅
- `./supabase/scripts/test-auth-authz.sh` ✅ (regression check for auth/RLS baseline)
- `npm run lint` / `npm run typecheck` / `npm run test`: `N/A` (no backend Node/TS helper workspace or custom Edge runtime code introduced in this task; runtime-specific Supabase local gates were used instead)
- What remains:
- FE integration/client sync engine wiring remains out of scope and should consume the documented provider-neutral contract in a later task.
