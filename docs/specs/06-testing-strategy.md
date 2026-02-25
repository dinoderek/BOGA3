# Testing Strategy (High-Level)

## Purpose

Define the top-level testing stack and working practices for MVP.

## Decisions and rationale

1. `Vitest` for unit/domain tests.
Reason: fast feedback loop for logic-heavy parts like set/session calculations and sync state behavior.

2. `React Native Testing Library + jest-expo` for UI/component tests.
Reason: validates real screen behavior with React Native-friendly tooling.

3. `Data layer integration tests` against local SQLite schema.
Reason: catches migration and persistence issues early in an offline-first app.

4. `Two-lane local data verification` for SQLite runtime confidence.
Reason: keep CI feedback fast with deterministic checks while still proving real-device migration and persistence behavior in native Expo runtime.

5. `Backend auth/RLS contract tests`.
Reason: prevents data-leak/security regressions as backend is introduced.

6. `Maestro` for MVP end-to-end flows.
Reason: practical mobile E2E coverage with lower setup cost than heavier alternatives.

7. `Quality gate in CI` (core tests must pass before merge).
Reason: keeps AI-generated changes safe and predictable as code volume grows.

8. `Supabase-local backend contract/integration testing` as the default backend verification lane for M5+.
Reason: validates real auth + `RLS` behavior before hosted deployment and preserves local-first confidence.

9. `Cross-stack E2E strategy` (`Maestro` + local Supabase) is documented before implementation.
Reason: keeps FE/backend integration test expectations explicit without forcing premature E2E build-out during backend foundation work.

## Local data two-lane policy (M2)

- Lane 1 (`CI-safe`):
  - Run fast checks in `apps/mobile` (`lint`, `typecheck`, `test`) and include targeted data-layer tests that validate migration/bootstrap orchestration and smoke insert/read behavior using deterministic test doubles.
  - Include migration-generation canary (`npm run db:generate:canary`) to detect schema/migration artifact drift.
- Lane 2 (`native runtime smoke`):
  - Run a focused smoke flow on Expo native runtime with real `expo-sqlite`.
  - Capture concise evidence: runtime environment, steps executed, migration success signal, and smoke write/read success signal.
- Rule:
  - Do not treat Lane 1 as a substitute for Lane 2 when validating runtime SQLite behavior; both lanes are required for milestone-level local data confidence.

## Default testing practice

- Every feature should include at least one success-path test and one offline/error-path test.
- During execution sessions, run a targeted test or gate after each meaningful change, then run full `lint + typecheck + test` before task closeout.

## Current CI posture (M5)

- There is currently no CI pipeline configured for this repo.
- Until CI exists, task cards must explicitly document:
  - what is run locally for verification,
  - what is deferred/manual (for example hosted deployment smoke checks),
  - when manual checks must run (per change, before handoff, milestone closeout, release closeout).
- When CI is introduced, update this doc and `docs/specs/04-ai-development-playbook.md` in the same task to move applicable manual gates into CI.

## Backend / Supabase testing model (M5 onward)

- Scope:
  - applies to `supabase/**`, backend helper workspaces, and any cross-stack mobile+backend verification.
- Test layers (top-level ownership):
  - `DB` tests (`pgTAP` preferred, or equivalent SQL-level test path):
    - cover `RLS` policies, SQL functions, constraints, and invariants.
    - required for policy/function/constraint changes.
  - `Edge` unit tests (runtime-native, for example `deno test`) when Edge Functions/custom backend runtime code exists:
    - cover validation, mapping, and pure logic.
  - `Supabase-local integration/contract tests` (required for backend auth/authz/API work):
    - run against local Supabase runtime and verify real auth context + `RLS` behavior.
    - cover success, validation failure, unauthorized, and cross-user denial paths.
  - Hosted/deployed smoke validation:
    - validates environment-specific behavior (secrets/bindings, ingress, hosted auth/provider config, migration execution on hosted instance).
    - manual by default until CI exists.
  - Cross-stack `E2E` (`Maestro` + local Supabase):
    - strategy is documented during M5.
    - implementation can land in a dedicated follow-up task/milestone.
- Deterministic backend fixture baseline:
  - use a reset + seed command path before auth/RLS/API contract suites.
  - maintain named fixture identities for ownership tests (at minimum `anonymous`, `user_a`, `user_b`; optional admin/service-role-only helper path).
- Execution triggers (minimum expectations):
  - always run cheap tests relevant to the changed layer(s).
  - run `Supabase-local integration/contract` tests when changing:
    - `supabase/migrations/**`
    - `supabase/functions/**`
    - auth configuration/policies
    - sync API contracts/fixtures
  - run hosted smoke validation when changing:
    - deployment/env/secrets config
    - hosted-only behavior
    - milestone/release closeout that requires fresh hosted evidence
  - cross-stack `E2E` runs are not required during M5 backend foundation unless a task explicitly scopes them.
- Coverage policy for Supabase API surfaces:
  - if implementation uses custom runtime code (for example Edge Functions), require unit tests plus local integration/contract tests.
  - if implementation is mostly `PostgREST/RPC`, unit-test surface may be small; compensate with stronger DB + local integration/contract coverage.

## Project structure conventions for testing assets (M5 backend additions)

- `apps/mobile/.maestro/flows` remains the canonical location for Maestro flow definitions.
- Repo-root `e2e/` is reserved for cross-stack orchestration/tests (strategy documented in M5; implementation may be added later).
- `supabase/` is the backend root for migrations, seeds, functions, and backend-local test assets.
- Do not couple backend foundation work to a mobile test-directory refactor (for example moving `apps/mobile/app/__tests__`) unless a dedicated task explicitly scopes that change.

## iOS UI smoke policy (Maestro, current stage)

- Jest/React Native Testing Library remains the default for component logic, state transitions, and CI-safe assertions.
- Maestro is used for simulator/device-integrated UI smoke checks that confirm core screens are reachable and visibly intact.
- Current required Maestro coverage is a single iOS smoke flow:
  - app launch visible state
  - session recorder visible state
- Required screenshots for smoke flow:
  - `01-app-launch`
  - `02-session-recorder-visible`
- Screenshot capture is automated by the Maestro flow and stored under:
  - `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`
- Rule:
  - if a task changes user-facing UI, run `npm run test:e2e:ios:smoke` before closeout.

## iOS simulator data smoke policy (Maestro, current stage)

- Purpose:
  - validate runtime migration + smoke insert/read behavior on real Expo iOS runtime (`expo-sqlite`) when change risk is runtime-sensitive.
- Command:
  - `npm run test:e2e:ios:data-smoke`
- Required when any of these are true:
  - `apps/mobile/src/data/bootstrap.ts` changes.
  - `apps/mobile/src/data/migrations/**` changes.
  - `apps/mobile/drizzle/**` migration artifacts or schema outputs change.
  - `apps/mobile/package.json` changes include Expo/SQLite/Drizzle dependency updates.
  - milestone/release closeout requires fresh native runtime data evidence.
- Optional (recommended) when:
  - data-layer behavior changes are low risk and local runtime confidence is desired before handoff.
- Usually not required when:
  - changes are limited to data-repository pure logic that does not alter runtime migration/bootstrap wiring and Lane 1 checks are green.
- Evidence expectations:
  - include command result and screenshot paths from `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`.
  - required screenshots for data smoke flow:
    - `03-data-runtime-smoke-start`
    - `04-data-runtime-smoke-success`

## iOS simulator parallel-run policy (Maestro)

- Problem:
  - parallel local agents can collide on simulator selection and Expo dev-server ports.
- Enforcement:
  - iOS Maestro runner scripts must acquire a shared host lock slot before booting simulator / starting Expo.
  - slot lock root defaults to `/tmp/scaffolding2-maestro-ios-slots`.
  - default slots are `slot-1,slot-2,slot-3` and each slot gets a deterministic Expo port (`base + slot-index`).
- Configuration:
  - `MAESTRO_IOS_SLOT_IDS` (default: `slot-1,slot-2,slot-3`)
  - `MAESTRO_IOS_SLOT_WAIT_SECONDS` (default: `120`)
  - `MAESTRO_IOS_SLOT_POLL_SECONDS` (default: `1`)
  - `MAESTRO_IOS_SLOT_LOCK_ROOT` (default: `/tmp/scaffolding2-maestro-ios-slots`)
  - `EXPO_DEV_SERVER_BASE_PORT` (default: `8082`)
  - optional per-slot simulator pools:
    - `IOS_SIM_DEVICE_POOL` (comma-separated device names)
    - `IOS_SIM_UDID_POOL` (comma-separated UDIDs; preferred when deterministic mapping is required)
- Operational rules:
  - parallel runs are supported up to configured slot count.
  - if no slot is free before timeout, runner exits non-zero.
  - manual overrides (`EXPO_DEV_SERVER_PORT`, `IOS_SIM_DEVICE`, `IOS_SIM_UDID`) are allowed but can bypass isolation; use with care in shared-host parallel runs.

## Planned next phase (UI quality and appearance)

1. Add visual regression testing for critical screens/components.
Reason: catch layout and styling regressions (spacing, clipping, overlap) that behavior tests miss.

2. Define a lightweight UI contract per key screen (visibility, tap targets, no overlap, small-phone fit).
Reason: make visual correctness explicit so both humans and AI can validate against clear rules.

3. Add screenshot checkpoints in end-to-end flows.
Reason: verify real user journeys preserve expected appearance.

4. Establish baseline update policy for snapshots.
Reason: ensure visual changes are intentional and reviewed, not silently accepted.

5. Use visual diff output as AI iteration input.
Reason: helps AI make targeted UI fixes and faster design refinements.
