# Task Card

## Task metadata

- Task ID: `T-20260220-08`
- Title: M5 minimal backend local runtime scaffold
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Objective

Create the smallest `Supabase`-based backend implementation baseline that runs locally (via Supabase local stack), supports schema migration and deterministic local reset/seed, exposes a health endpoint, and establishes the backend testing/project-structure conventions needed for follow-on M5 tasks.

## Scope

### In scope

- Create backend project scaffold for `Supabase` primary execution:
  - `supabase/` project structure (required)
  - optional helper workspace (for example `apps/backend`) only if needed for test harnesses/scripts/docs tooling
- Add environment configuration strategy for Supabase local + hosted environments.
- Implement a single documented local startup command path (may wrap multiple commands) and a health endpoint (prefer `Supabase Edge Function` health route for explicit API path testing).
- Add first Postgres migration/schema baseline required to prove local migration/bootstrap and unblock follow-on tasks.
- Define deterministic local reset/seed fixture baseline for backend testing (at minimum `anonymous`, `user_a`, `user_b`; optionally admin/service-role-only helper path) and document the command path.
- Document local setup/run steps in backend runbook, including local runtime prerequisites (`Docker`-compatible container runtime + Supabase CLI).
- Add foundational automated tests for bootstrap and health behavior against the selected Supabase local API surface.
- Establish and document backend testing strategy baseline for M5 follow-on tasks:
  - `DB`-level tests (for example `pgTAP` or equivalent SQL-level test path) for policies/functions/constraints
  - `Edge` unit tests (if Edge Functions/custom runtime code is introduced)
  - `Supabase-local` integration/contract tests for auth + real `RLS` behavior
  - hosted/deployed smoke validation ownership (documented here, detailed command path owned by `T-20260220-09`)
  - cross-stack `E2E` test strategy (`Maestro` + local Supabase) documented as future implementation work
- Update AI execution/testing policy docs, testing strategy docs, and task template(s) for Supabase backend development expectations and project-structure conventions.
- Document current-vs-target test/project structure conventions, including:
  - keep `apps/mobile/.maestro/flows` as the Maestro flow location
  - reserve repo-root `e2e/` for cross-stack orchestration/tests (strategy in M5; implementation later)
  - defer mobile test-directory refactor (for example `apps/mobile/app/__tests__`) to a dedicated task

### Out of scope

- Deployment to cloud environments.
- Hosted/deployed validation command implementation (owned by `T-20260220-09`; only ownership/expectations are documented here).
- Full auth/authz policy implementation.
- FE integration or sync client logic.
- Final user-owned schema/auth linkage design (owned by `T-20260220-10` / `T-20260220-11`).
- Full implementation of cross-stack mobile+backend `E2E` tests (strategy only in this task).
- Mobile test-directory refactor (for example moving `apps/mobile/app/__tests__`) in this task.

## Acceptance criteria

1. Supabase backend project structure exists (at minimum `supabase/`) with reproducible local startup and dependency install flow.
2. Supabase local stack starts successfully and returns healthy status from a documented endpoint (prefer a local Edge Function health endpoint).
3. Supabase migration/bootstrap flow runs from clean state using documented command(s).
4. A deterministic local reset/seed command path exists and documents baseline test fixtures (including `user_a`/`user_b` ownership-test fixtures).
5. Baseline schema/migration bootstrap exists for upcoming auth and sync API tasks without prematurely locking the final auth linkage or full user-owned domain schema design.
6. Testing strategy is established for backend with explicit `DB`/`Edge`/`Supabase-local integration`/hosted-smoke/`E2E`(strategy-only) layers, Supabase-local fidelity expectations, and execution-trigger guidance.
7. Backend quality gates reach FE-like baseline quality for local work (applicable `lint`, `typecheck`, fast local tests) and clearly defer hosted validation command details to `T-20260220-09`.
8. `docs/specs/04-ai-development-playbook.md`, `docs/specs/06-testing-strategy.md`, and task template(s) are updated for backend workflow, quality expectations, project-structure conventions, and the current no-CI posture.

## Testing and verification approach

- Planned checks/commands (from backend workspace):
  - `supabase start` (or a single project command that wraps local stack startup)
  - `supabase db reset` (or selected Supabase local migration/bootstrap command path)
  - deterministic seed/fixture smoke check (may be included in `supabase db reset` wrapper)
  - health endpoint smoke check against local stack (document exact command once API surface is scaffolded)
  - `npm run lint` (if a Node/TS workspace or function test harness is introduced)
  - `npm run typecheck` (if a Node/TS workspace or function test harness is introduced)
  - `npm run test` (if a Node/TS workspace or function test harness is introduced)
  - backend fast test command(s) for introduced layer(s) (for example `pgTAP`, `deno test`, or integration/contract smoke)
- Notes:
  - Keep runtime checks deterministic and CI-safe.
  - This task documents hosted/deployed validation ownership and expectations but does not own hosted smoke command implementation/execution (that is `T-20260220-09`).
  - Health endpoint implementation choice must not prematurely lock the final sync API surface choice for `T-20260220-11` (`Edge Functions` vs `PostgREST/RPC` mix).
  - Must preserve `Supabase` as primary path unless a documented blocking issue triggers contingency escalation.

## Recommended execution checklist (draft runbook outline for `T-20260220-08`)

1. Confirm prerequisites and versions:
   - `Supabase CLI` installed and runnable.
   - `Docker`-compatible container runtime available and healthy.
   - Document exact local prerequisites/versions in the runbook.
2. Scaffold backend baseline:
   - Initialize/create `supabase/` project structure.
   - Add minimal config and any helper scripts/wrappers needed for a single documented startup path.
3. Prove local bring-up:
   - Run `supabase start` (or wrapper).
   - Capture service startup summary and note any machine-specific caveats.
4. Add migration/bootstrap baseline:
   - Create minimal schema/migration proving migration flow works.
   - Run `supabase db reset` (or wrapper) from clean state.
5. Add deterministic fixture baseline:
   - Seed/document `anonymous`, `user_a`, `user_b` fixture identities (plus optional admin helper path).
   - Verify seed/reset command produces repeatable state.
6. Add health endpoint smoke surface:
   - Implement health route (Edge Function preferred for explicit API-path smoke).
   - Verify with a documented local smoke command.
   - Document that this health route does not lock `T-20260220-11` sync API surface choice.
7. Add foundational automated checks:
   - Add bootstrap/health smoke tests and any introduced fast layer tests (`pgTAP`, `deno`, or integration smoke).
   - Keep tests deterministic and local-first.
8. Codify strategy + conventions:
   - Update `docs/specs/06-testing-strategy.md` backend sections.
   - Update `docs/specs/04-ai-development-playbook.md` and templates for no-CI/manual posture + structure/test-layer fields.
   - Document current-vs-target project structure conventions (`apps/mobile/.maestro/flows`, repo-root `e2e/`, deferred mobile test refactor).
9. Handoff to downstream tasks:
   - Record exact command paths for `T-20260220-09` hosted smoke docs, `T-20260220-10` auth/RLS tests, and `T-20260220-11` API contract tests.
   - Note remaining open decisions (for example DB test tool specifics if `pgTAP` is deferred).

## Implementation notes

- Planned files/areas allowed to change:
  - `supabase/**` (new or expanded)
  - `apps/backend/**` (new; only if needed for auxiliary tooling/tests)
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/templates/task-card-template.md`
  - `docs/specs/templates/milestone-spec-template.md` (if template changes are required to encode backend-testing/project-structure expectations)
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-08-m5-minimal-backend-local-runtime.md`
- Constraints/assumptions:
  - Must implement the `Supabase` primary decision from `T-20260220-07`; do not switch providers in this task.
  - Keep initial scaffold minimal and secure-by-default.
  - Local runtime is a hard requirement; remote-only development flow is not acceptable for M5.

## Mandatory verify gates

- Supabase local startup command (`supabase start` or project wrapper)
- Supabase local migration/bootstrap command (`supabase db reset` or chosen command path)
- Deterministic local seed/fixture baseline command/smoke check
- Local health endpoint smoke check command
- `npm run lint` (from applicable backend/function workspace, if introduced)
- `npm run typecheck` (from applicable backend/function workspace, if introduced)
- `npm run test` (from applicable backend/function workspace, if introduced)
- Backend fast test command(s) for any introduced backend layer(s) (from applicable backend/function workspace, if introduced)
- Documentation update diff/review for `docs/specs/04-ai-development-playbook.md`, `docs/specs/06-testing-strategy.md`, and task template(s)

## Evidence

- Supabase local startup command output summary.
- Health endpoint response summary.
- Migration/bootstrap output summary.
- Deterministic fixture/seed baseline summary (including ownership-test fixture identities).
- Lint/typecheck/test summary (for any introduced backend/function workspace).
- Backend test-layer baseline summary (what is implemented now vs documented for follow-on tasks).
- Spec/template updates summary for `docs/specs/04-ai-development-playbook.md`, `docs/specs/06-testing-strategy.md`, and task template(s).

## Completion note

- What changed:
- What tests ran:
- What remains:
