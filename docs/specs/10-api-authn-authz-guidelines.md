# API AuthN/AuthZ Guidelines (M5 Baseline)

## Purpose

Minimal authN/authZ context every agent must know before:

- developing new backend APIs
- consuming backend APIs from the mobile app

This is the shortest operational summary. Use the "Further reading" section when a task changes auth, `RLS`, or security posture.

## Status / scope

- Applies to the current M5 backend baseline (`Supabase`).
- Captures the agreed design baseline for auth/authz and API usage.
- FE auth UI integration is still separate work; this doc is for backend/API development posture.

## Minimal rules (must know)

1. Backend auth/authz stack is `Supabase Auth + Postgres RLS`.
2. Authorization must be backend-enforced (`RLS` / DB constraints), never FE-only.
3. M5 auth method is `email + password` only.
4. Public self-signup is disabled.
5. User creation is controlled/admin-provisioned only (script or dashboard admin flow).
6. User-owned app rows use direct ownership linkage to `auth.users(id)` via `owner_user_id`.
7. MVP sync-domain tables are user-private (including `gyms` for now).
8. Child tables also carry redundant `owner_user_id` and must enforce ownership consistency with parent rows (constraints/FKs).
9. `RLS` must be enabled on all user-owned tables with deny-by-default posture.
10. Normal app access uses `anon` key + user JWT; never use `service_role` from mobile/client code.
11. `service_role` is server-only/admin-only (provisioning, maintenance, tightly scoped backend tasks).
12. API changes must include negative-path tests for unauthorized and cross-user access denial.

## Practical guidance for API developers (backend)

- Prefer simple ownership policies on each table: compare `owner_user_id` to `auth.uid()`.
- Do not trust handler-level checks alone; keep DB constraints and `RLS` as the source of truth.
- Validate custom API inputs at the boundary (Edge Function/server handler) and rely on DB constraints for invariants.
- Do not expose `auth` schema via API surfaces.
- Treat `owner_user_id` as immutable after insert unless a task explicitly defines a safe migration/admin path.

## Practical guidance for API consumers (mobile/app)

- Use client-safe Supabase credentials only (`anon` key), plus the authenticated user session token.
- Assume all user data access is scoped to the authenticated user by backend policy.
- Never assume the client can override ownership (`owner_user_id`) for another user.
- Handle auth failures and `RLS` denials as expected runtime outcomes (not exceptional backend bugs by default).
- Do not embed or request `service_role` credentials for any app feature.

## Local development / test expectations

- Use local Supabase runtime for auth/RLS/API verification when backend authz behavior changes.
- Use deterministic fixture identities (`user_a`, `user_b`) for ownership tests.
- Prefer real local Supabase Auth sign-in flows for auth tests (success/failure), not only mocked tokens.
- Required test coverage for auth-sensitive API changes:
  - success path
  - unauthenticated denial
  - cross-user denial

## Minimal security hygiene

- Never log passwords, JWTs, refresh tokens, `Authorization` headers, or service-role keys.
- Keep auth error responses generic where user enumeration risk exists.
- Use Supabase built-in auth rate limiting/config hardening for M5 baseline (no custom rate limiter required unless scoped by a task).

## Further reading (load when needed)

- Design proposal (current M5 auth baseline rationale):
  - `docs/brainstorms/M5-AuthN-AuthZ-Security-Baseline-Design.md`
- M5 auth/authz implementation task:
  - `docs/tasks/T-20260220-10-m5-user-auth-authz-and-security-baseline.md`
- M5 milestone scope and acceptance criteria:
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Testing requirements for backend auth/RLS/API work:
  - `docs/specs/06-testing-strategy.md`
- Local Supabase runtime and fixture commands:
  - `supabase/README.md`
