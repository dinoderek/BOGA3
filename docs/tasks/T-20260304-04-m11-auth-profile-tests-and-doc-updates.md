---
task_id: T-20260304-04
milestone_id: "M11"
status: planned
ui_impact: "yes"
areas: "frontend,cross-stack,docs"
runtimes: "docs,expo,node,maestro,supabase"
gates_fast: "./scripts/quality-fast.sh"
gates_slow: "./scripts/quality-slow.sh"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/10-api-authn-authz-guidelines.md,docs/specs/ui/screen-map.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/ux-rules.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-04`
- Title: M11 auth/profile tests and doc updates
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
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- Project structure: `docs/specs/09-project-structure.md`
- API auth/authz guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- UI docs bundle index: `docs/specs/ui/README.md`
- UI screen map: `docs/specs/ui/screen-map.md`
- UI navigation contract: `docs/specs/ui/navigation-contract.md`
- UI semantics: `docs/specs/ui/ux-rules.md`

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
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `docs/specs/ui/README.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/ux-rules.md`
- Code/docs inventory freshness checks run (route inventory, UI docs inventory, schema/runtime inventory as applicable):
  - current mobile test inventory under `apps/mobile/app/__tests__/**` reviewed
  - current Maestro/runtime baseline under `apps/mobile/.maestro/**`, `apps/mobile/app/maestro-harness.tsx`, and `apps/mobile/src/maestro/**` reviewed via repo inventory
  - backend local auth/runtime baseline under `supabase/README.md` and `supabase/scripts/**` reviewed
- Known stale references or assumptions (must be explicit; write `none` if none):
  - assumes tasks `T-20260304-01` through `T-20260304-03` land first so this task can focus on proof and documentation instead of inventing the auth/profile behavior itself
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260304-04-m11-auth-profile-tests-and-doc-updates.md`

## Objective

Finish M11 by adding the end-to-end proof path and closing the documentation loop: comprehensive auth/profile automated coverage, a deterministic Maestro happy path against local Supabase, and promotion of the new auth/profile behavior into the authoritative project and UI docs.

## Scope

### In scope

- Add/finish automated coverage for:
  - sign in success/failure
  - sign out
  - session restore
  - profile load/update states
  - email/password update edge states
- Add the required Maestro happy path:
  - start logged out
  - sign in with deterministic credentials
  - verify logged-in profile state
  - update `username`
  - sign out
  - verify logged-out profile state
- Update existing Maestro flows only as needed so non-auth smoke/data-smoke flows remain valid under the new navigation/auth surface.
- Promote stable M11 behavior into shared docs:
  - architecture
  - testing strategy
  - API auth/authz guidance
  - UI route/navigation/semantics docs
- Close out milestone/task doc status fields and evidence references.

### Out of scope

- New auth providers or recovery flows.
- Broad redesign of existing non-auth routes.
- Hosted deployment/auth-provider setup beyond local/runtime documentation.

## UI Impact (required checkpoint)

- UI Impact?: `yes`
- If `yes`:
  - keep UI/UX parent references (`docs/specs/08-ux-delivery-standard.md`, `docs/specs/ui/README.md`)
  - keep the `UX Contract` section and fill it before implementation
  - include a tokens/primitives compliance statement in `Docs touched` / implementation notes
  - include a UI docs update plan in `Docs touched`
  - include screenshots/artifacts expectations in `Evidence`

## UX Contract (UI/UX tasks only; remove this entire section for non-UX tasks)

### Key user flows (minimal template)

1. Flow name: Full auth/profile happy path
   - Trigger: app launches with no authenticated session and test user credentials are available
   - Steps: open profile; sign in; wait for logged-in state; update `username`; sign out
   - Success outcome: the entire path is proven in automated test coverage and in Maestro against the real local runtime
   - Failure/edge outcome: failures produce actionable artifacts/logs and leave enough inline UI signal to identify the broken step
2. Flow name: Session restore
   - Trigger: app relaunches after prior successful sign-in
   - Steps: restore session; open profile; verify logged-in state without re-entering credentials
   - Success outcome: session restore works until normal Supabase session invalidation/sign-out
   - Failure/edge outcome: user lands in a safe signed-out state with no crash and clear ability to sign in again
3. Flow name: Existing local-first routes still work while logged out
   - Trigger: launch the app with no authenticated session
   - Steps: open session list, recorder, and exercise catalog entry flows relevant to existing smoke coverage
   - Success outcome: non-auth routes remain usable without forced sign-in
   - Failure/edge outcome: any accidental auth gating is detected by tests or Maestro/routing smoke before milestone closeout

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Test hooks should prefer accessible labels and stable semantics before adding extra test-only IDs.
- Maestro should validate real user-visible states, not hidden implementation-only markers.
- Visual evidence should include both logged-out and logged-in profile states.
- Any copy changes made to support clearer auth feedback must still fit the documented action hierarchy and inline-feedback rules.

## Acceptance criteria

1. Automated tests cover the primary auth/profile success paths plus at least one failure/edge path for each of: sign in, session restore, and profile/account updates.
2. The required Maestro auth/profile happy path passes against local Supabase with deterministic credentials and records artifacts under the canonical Maestro artifact root.
3. Existing non-auth flows remain runnable while logged out; any required smoke-flow adjustments are implemented and documented.
4. `docs/specs/03-technical-architecture.md`, `docs/specs/06-testing-strategy.md`, and `docs/specs/10-api-authn-authz-guidelines.md` reflect the implemented M11 behavior rather than leaving it only in milestone/task docs.
5. `docs/specs/ui/screen-map.md`, `docs/specs/ui/navigation-contract.md`, and `docs/specs/ui/ux-rules.md` reflect the final settings/profile route and auth/profile semantics.
6. Screen UI continues using documented tokens/primitives/shared components or records any final justified exception.
7. No raw color literals are introduced in screen files unless explicitly documented with rationale.
8. Milestone/task status fields and completion notes are updated consistently at closeout.

## Docs touched (required)

- Planned docs/spec files to update and why (list exact paths; write `none` + rationale if no docs/spec changes expected):
  - `docs/specs/03-technical-architecture.md` - codify final mobile auth/profile runtime semantics
  - `docs/specs/06-testing-strategy.md` - codify final M11 auth/profile coverage and Maestro proof expectations
  - `docs/specs/10-api-authn-authz-guidelines.md` - update mobile-consumer auth guidance now that FE auth/profile integration exists
  - `docs/specs/ui/screen-map.md` - document final settings/profile screens
  - `docs/specs/ui/navigation-contract.md` - document final paths/transitions
  - `docs/specs/ui/ux-rules.md` - document final auth/profile semantics and inline feedback rules
  - `docs/specs/milestones/M11-auth-ui-and-profile-management.md` - update task states/status at closeout
- For significant cross-cutting behavior changes (for example sync model, auth-gated sync behavior, conflict policy, offline/online semantics, runtime topology, or test-layer expectations), include the relevant project-level docs here:
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md` if M11 changes future execution/bootstrap expectations
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
- Rule:
  - milestone/task docs are not substitutes for these project-level docs when behavior or verification expectations become part of the shared project contract
- If `UI Impact = yes`, complete all of the following:
  - Canonical UI docs maintenance trigger map lives in `docs/specs/ui/README.md` (`Maintenance rules`).
  - UI docs update required?: `yes`
  - If `yes`, list exact files under `docs/specs/ui/` and why, mapped to that canonical trigger map.
  - `docs/specs/ui/screen-map.md` - route inventory/purpose changes
  - `docs/specs/ui/navigation-contract.md` - route transitions/paths changed
  - `docs/specs/ui/ux-rules.md` - auth/profile semantics changed
  - `docs/specs/ui/components-catalog.md` - only if reusable auth/profile primitives changed during test hardening
  - Tokens/primitives compliance statement (required for UI tasks):
    - Reuse plan: verify final auth/profile screens still rely on existing primitives/tokens or document any deliberate reusable additions
    - Exceptions (raw literals or screen-local one-offs), if any: `none planned`
  - UI artifacts/screenshots expectation (required to state for UI tasks):
    - Required by `docs/specs/08-ux-delivery-standard.md` or task scope?: `yes`
    - Planned captures/artifacts (if required): Maestro screenshots for logged-out and logged-in profile states plus any manual captures needed for edge states
    - If not required, why optional/non-blocking here: `N/A`
- Authoring rule for UI docs (`docs/specs/ui/**`):
  - keep docs synthetic/overview-first and source-linked
  - do not duplicate detailed props/variants/implementation notes that are better read from source files

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted auth/profile Jest coverage additions
  - `./scripts/quality-fast.sh`
  - `./scripts/quality-slow.sh frontend`
  - backend auth/profile contract commands if needed to support final cross-stack confidence
- Standard local gate usage:
  - `./scripts/quality-fast.sh` (required)
  - `./scripts/quality-slow.sh` (required for final cross-stack M11 proof; includes the relevant slow frontend/backend suites)
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - mobile unit/integration tests
  - backend local contract coverage as needed
  - Maestro iOS simulator auth/profile happy path
  - repo fast + slow quality wrappers
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - always for milestone closeout
- Slow-gate triggers (required when `quality-slow` may apply; state `N/A` only if truly not applicable):
  - final auth/profile Maestro happy path is an explicit milestone acceptance item
  - any auth/profile change that affects route flow, runtime session restore, or local Supabase-backed user state
- Hosted/deployed smoke ownership (required for backend/deployment work; name the owning task if deferred):
  - hosted auth/provider smoke remains manual/deferred outside M11; local Supabase is the required proof surface here
- CI/manual posture note (required when CI is absent or partial):
  - CI is absent; closeout must include local fast/slow gate summaries plus Maestro artifact paths
- Notes:
  - if `./scripts/quality-slow.sh` is too broad for the session, record the exact invoked frontend/backend slow commands while still meeting the milestone's real-runtime proof requirement

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/__tests__/**`
  - `apps/mobile/.maestro/**`
  - `apps/mobile/scripts/maestro*` only if auth/profile flow orchestration requires a small runtime update
  - `apps/mobile/app/profile.tsx` and related auth/profile modules only for testability or bug fixes discovered during proofing
  - `supabase/tests/**`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md` if execution/bootstrap expectations change
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/ui/components-catalog.md` if reusable UI inventory changes
  - `docs/specs/milestones/M11-auth-ui-and-profile-management.md`
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - no new top-level folders expected; keep new auth/profile test assets within existing mobile/maestro/supabase locations
- Constraints/assumptions:
  - use deterministic provisioned credentials from the local Supabase fixture path
  - preserve the contract that non-auth local tracker usage still works while logged out

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh`
- Standard local slow gate: `./scripts/quality-slow.sh`
- If a standard gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/T-20260304-04-m11-auth-profile-tests-and-doc-updates.md`
- Additional gate(s), if any:
  - targeted Maestro command for the new auth/profile flow if split from the generic wrapper

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Auth/profile automated test summary.
- Maestro auth/profile artifact root and screenshot list.
- Fast/slow gate result summary.
- UI/UX task visual artifacts note: include logged-out and logged-in profile captures plus any important edge-state captures.
- Manual verification summary (required when CI is absent/partial):
  - note whether manual sanity checks were needed beyond the automated suites
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable:
  - hosted auth/provider checks remain outside M11 unless a separate deployment task is opened

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, ensure the relevant project-level docs (`03`, `04`, `06`) were updated in the same session rather than only the milestone/task docs.
- For UI/UX tasks, update the relevant `docs/specs/ui/*.md` files and keep entries synthetic/overview-first.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260304-04-m11-auth-profile-tests-and-doc-updates.md` (or document why `N/A`) before handoff.
