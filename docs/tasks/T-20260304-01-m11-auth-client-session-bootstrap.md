---
task_id: T-20260304-01
milestone_id: "M11"
status: planned
ui_impact: "no"
areas: "frontend,docs"
runtimes: "docs,expo,node"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/10-api-authn-authz-guidelines.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-01`
- Title: M11 auth client session bootstrap
- Status: `planned`
- File location rule:
  - author active cards in `docs/tasks/<task-id>.md`
  - move the file to `docs/tasks/complete/<task-id>.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-03-04`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Milestone spec: `docs/specs/milestones/M11-auth-ui-and-profile-management.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- API auth/authz guidelines: `docs/specs/10-api-authn-authz-guidelines.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ 0e8f4a6`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git fetch origin main`; local `main` was already ahead of `origin/main` by 1 commit, so no pull was needed before authoring)
- Parent refs opened in this session (list exact files actually reviewed):
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/milestones/M11-auth-ui-and-profile-management.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
- Code/docs inventory freshness checks run (route inventory, UI docs inventory, schema/runtime inventory as applicable):
  - `apps/mobile/app/_layout.tsx` reviewed for current bootstrap and stack registration shape
  - `apps/mobile/package.json` reviewed for current mobile dependency/runtime baseline
  - `rg -n "supabase|createClient|auth\\." apps/mobile supabase -g '!supabase/migrations/**' -g '!supabase/seed.sql'` - current repo has backend auth baseline but no mobile Supabase auth client wiring yet
- Known stale references or assumptions (must be explicit; write `none` if none):
  - assumes M5 auth backend baseline remains the session source of truth and no hidden mobile auth client exists outside the reviewed paths
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260304-01-m11-auth-client-session-bootstrap.md`

## Objective

Add the mobile auth foundation for M11: client-safe Supabase configuration, persistent session restore, a central auth-state service, and app bootstrap wiring that keeps the rest of the local-first app usable while logged out.

## Scope

### In scope

- Add a mobile Supabase client integration using client-safe credentials only.
- Add persistent authenticated session storage/restore for app relaunch.
- Introduce a small auth-state access layer for the mobile app:
  - current session
  - current auth user
  - loading/restore status
  - sign-in/sign-out method surface for later UI tasks
- Wire auth bootstrap into the app root without blocking local SQLite bootstrap or local-only flows.
- Define how auth-state changes are observed so later UI tasks do not duplicate listeners across routes.
- Add targeted non-UI tests for auth bootstrap and session lifecycle behavior.

### Out of scope

- Settings or profile route UI.
- Username/email/password edit forms.
- `user_profiles` schema or backend profile persistence.
- Generic sync engine, outbox, or auth-gated tracker-data upload/download.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. The mobile app has a single documented/authored Supabase client bootstrap path that uses only client-safe credentials.
2. Authenticated sessions are restored on app launch through the app auth service and exposed to later UI work without route-local duplication.
3. Logged-out state does not block launch, local data bootstrap, session-list usage, recorder usage, or exercise-catalog usage.
4. Auth-state transitions are observable through a shared service or provider surface rather than direct per-screen client wiring.
5. Targeted tests cover at least:
   - cold launch with no stored session
   - launch with a stored session
   - sign-out/session-clear path
6. No generic sync behavior starts as a side effect of auth bootstrap.

## Docs touched (required)

- Planned docs/spec files to update and why (list exact paths; write `none` + rationale if no docs/spec changes expected):
  - `docs/specs/03-technical-architecture.md` - promote the implemented mobile auth bootstrap/session-restore contract once stable
  - `docs/specs/06-testing-strategy.md` - record required auth bootstrap/session lifecycle coverage expectations if they become part of the shared test contract
  - `docs/specs/10-api-authn-authz-guidelines.md` - update mobile-consumer guidance now that FE auth-session wiring exists
- For significant cross-cutting behavior changes (for example sync model, auth-gated sync behavior, conflict policy, offline/online semantics, runtime topology, or test-layer expectations), include the relevant project-level docs here:
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
- Rule:
  - milestone/task docs are not substitutes for these project-level docs when behavior or verification expectations become part of the shared project contract

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted Jest coverage for auth bootstrap/session lifecycle modules
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A` for this task unless bootstrap changes unexpectedly require runtime smoke to debug launch regressions
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - unit/integration-style mobile auth bootstrap tests
  - frontend lint/typecheck/test fast gate
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - always
- Slow-gate triggers (required when `quality-slow` may apply; state `N/A` only if truly not applicable):
  - `N/A` by plan; no Maestro/runtime harness changes are intended in this task
- Hosted/deployed smoke ownership (required for backend/deployment work; name the owning task if deferred):
  - `N/A`
- CI/manual posture note (required when CI is absent or partial):
  - CI is absent; local targeted tests plus `./scripts/quality-fast.sh frontend` are the required closeout evidence
- Notes:
  - if session persistence depends on a device/runtime-specific storage adapter, keep most scenario coverage mocked and defer real auth/profile Maestro proof to `T-20260304-04`

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/src/auth/**` (new auth client/service/provider modules if needed)
  - `apps/mobile/src/data/**` only if bootstrap sequencing needs small integration changes
  - `apps/mobile/package.json` if auth client dependencies are added
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - likely adds a new canonical mobile auth module area under `apps/mobile/src/auth/`; if adopted, document the path in `docs/specs/09-project-structure.md` only if it becomes a meaningful convention
- Constraints/assumptions:
  - use Supabase's normal session model; do not invent a custom long-lived token format
  - do not store passwords, refresh tokens, or sensitive auth payloads in logs
  - keep auth bootstrap non-blocking for local-only app behavior

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `N/A` (no Maestro/runtime-specific behavior is intentionally changed here)
- If a standard gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/T-20260304-01-m11-auth-client-session-bootstrap.md`
- Additional gate(s), if any:
  - targeted auth bootstrap/session lifecycle Jest command(s)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Auth bootstrap/service module summary.
- Session restore/sign-out test summary.
- `./scripts/quality-fast.sh frontend` result summary.
- Manual verification summary (required when CI is absent/partial):
  - record whether a manual signed-out launch sanity check was run and whether local-only routes still worked
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable:
  - `N/A`

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, ensure the relevant project-level docs (`03`, `04`, `06`) were updated in the same session rather than only the milestone/task docs.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260304-01-m11-auth-client-session-bootstrap.md` (or document why `N/A`) before handoff.
