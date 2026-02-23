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

## Objective

Create the smallest `Supabase`-based backend implementation baseline that runs locally (via Supabase local stack), supports schema migration, and exposes a health endpoint.

## Scope

### In scope

- Create backend project scaffold for `Supabase` primary execution:
  - `supabase/` project structure (required)
  - optional helper workspace (for example `apps/backend`) only if needed for test harnesses/scripts/docs tooling
- Add environment configuration strategy for Supabase local + hosted environments.
- Implement a single documented local startup command path (may wrap multiple commands) and a health endpoint (prefer `Supabase Edge Function` health route for explicit API path testing).
- Add first Postgres migration/schema baseline for user-owned session domain entities under Supabase-managed migrations.
- Document local setup/run steps in backend runbook, including local runtime prerequisites (`Docker`-compatible container runtime + Supabase CLI).
- Add foundational automated tests for bootstrap and health behavior against the selected Supabase local API surface.
- Establish backend testing strategy layers for this stage:
  - unit tests
  - integration tests
  - component/API handler tests (or nearest Supabase-equivalent such as Edge Function handler tests / API contract tests)
  - deployed-environment validation tests
- Update AI execution/testing policy docs for Supabase backend development expectations.

### Out of scope

- Deployment to cloud environments.
- Full auth/authz policy implementation.
- FE integration or sync client logic.

## Acceptance criteria

1. Supabase backend project structure exists (at minimum `supabase/`) with reproducible local startup and dependency install flow.
2. Supabase local stack starts successfully and returns healthy status from a documented endpoint (prefer a local Edge Function health endpoint).
3. Supabase migration/bootstrap flow runs from clean state using documented command(s).
4. Baseline schema exists for upcoming auth and sync API tasks.
5. Testing strategy is established for backend with explicit unit/integration/component(deployed-API-equivalent)/deployed test layers and Supabase-local fidelity expectations.
6. Backend quality gates reach FE-like baseline quality (applicable `lint`, `typecheck`, fast local tests, and a documented deployed validation test path).
7. `docs/specs/04-ai-development-playbook.md` and `docs/specs/06-testing-strategy.md` are updated for backend workflow and quality expectations.

## Testing and verification approach

- Planned checks/commands (from backend workspace):
  - `supabase start` (or a single project command that wraps local stack startup)
  - `supabase db reset` (or selected Supabase local migration/bootstrap command path)
  - health endpoint smoke check against local stack (document exact command once API surface is scaffolded)
  - `npm run lint` (if a Node/TS workspace or function test harness is introduced)
  - `npm run typecheck` (if a Node/TS workspace or function test harness is introduced)
  - `npm run test` (if a Node/TS workspace or function test harness is introduced)
  - Supabase-specific fast integration/API test command(s)
  - deployed validation command(s) or scripted check path (documented even if execution is deferred to later task)
- Notes:
  - Keep runtime checks deterministic and CI-safe.
  - Must preserve `Supabase` as primary path unless a documented blocking issue triggers contingency escalation.

## Implementation notes

- Planned files/areas allowed to change:
  - `supabase/**` (new or expanded)
  - `apps/backend/**` (new; only if needed for auxiliary tooling/tests)
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-08-m5-minimal-backend-local-runtime.md`
- Constraints/assumptions:
  - Must implement the `Supabase` primary decision from `T-20260220-07`; do not switch providers in this task.
  - Keep initial scaffold minimal and secure-by-default.
  - Local runtime is a hard requirement; remote-only development flow is not acceptable for M5.

## Mandatory verify gates

- Supabase local startup command (`supabase start` or project wrapper)
- Supabase local migration/bootstrap command (`supabase db reset` or chosen command path)
- Local health endpoint smoke check command
- `npm run lint` (from applicable backend/function workspace, if introduced)
- `npm run typecheck` (from applicable backend/function workspace, if introduced)
- `npm run test` (from applicable backend/function workspace, if introduced)
- Supabase-specific fast integration/API test command(s) (from applicable backend/function workspace)
- Documented deployed validation command(s) or scripted check path

## Evidence

- Supabase local startup command output summary.
- Health endpoint response summary.
- Migration/bootstrap output summary.
- Lint/typecheck/test summary (for any introduced backend/function workspace).
- Integration/component/e2e validation summary (including Supabase-local API validation path).
- Spec updates summary for `docs/specs/04-ai-development-playbook.md` and `docs/specs/06-testing-strategy.md`.

## Completion note

- What changed:
- What tests ran:
- What remains:
