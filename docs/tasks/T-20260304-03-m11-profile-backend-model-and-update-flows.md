---
task_id: T-20260304-03
milestone_id: "M11"
status: planned
ui_impact: "yes"
areas: "frontend,backend,cross-stack,docs"
runtimes: "docs,expo,node,supabase,sql"
gates_fast: "./scripts/quality-fast.sh"
gates_slow: "./scripts/quality-slow.sh backend"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/10-api-authn-authz-guidelines.md,docs/specs/ui/ux-rules.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-03`
- Title: M11 profile backend model and update flows
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
  - `docs/specs/ui/ux-rules.md`
- Code/docs inventory freshness checks run (route inventory, UI docs inventory, schema/runtime inventory as applicable):
  - `supabase/README.md` reviewed for current local auth provisioning and contract-test baseline
  - `supabase/config.toml` and existing auth scripts reviewed via repo search; backend auth baseline exists, but no `user_profiles` model is present yet
  - current mobile repo search shows no existing profile-fetch/update client module
- Known stale references or assumptions (must be explicit; write `none` if none):
  - assumes `T-20260304-02` has already created the profile route and auth-aware screen shell consumed here
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260304-03-m11-profile-backend-model-and-update-flows.md`

## Objective

Implement the authenticated profile model and account-management flows for M11: backend `user_profiles` storage with per-user access control, lazy profile provisioning, username persistence, and authenticated email/password update behavior exposed through the profile screen.

## Scope

### In scope

- Add `app_public.user_profiles` keyed `1:1` to `auth.users(id)`.
- Add deny-by-default `RLS` so users can read/update only their own profile row.
- Implement lazy profile-row creation on first authenticated profile load/save when missing.
- Add mobile profile data access/update logic for:
  - load current profile
  - create/update `username`
  - update email through authenticated Supabase user-update behavior
  - update password through authenticated Supabase user-update behavior
- Surface success/pending/error states inline on the profile screen:
  - username save success/failure
  - email-change pending confirmation messaging when applicable
  - password update success/failure
- Keep local-only app usage intact when the backend is unavailable or a profile request fails.
- Add backend contract coverage for the new table/policies and targeted mobile tests for profile mutation flows.

### Out of scope

- Public signup or invite UX.
- Account deletion.
- Generic tracker-data sync/upload/download.
- Non-profile settings/preferences.
- Broader public/social profile behavior.

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

1. Flow name: Load signed-in profile
   - Trigger: signed-in user opens the profile screen
   - Steps: auth session resolves; profile data loads; missing profile row is provisioned lazily if needed
   - Success outcome: user sees email plus editable `username` field and account update controls
   - Failure/edge outcome: backend/profile failure is shown inline without crashing the route or signing the user out
2. Flow name: Update username
   - Trigger: signed-in user edits `username`
   - Steps: change text; submit save; await server result
   - Success outcome: saved username persists and success feedback is visible
   - Failure/edge outcome: inline error appears and existing saved value remains recoverable
3. Flow name: Update email
   - Trigger: signed-in user edits email
   - Steps: enter new email; submit; app receives authenticated update result
   - Success outcome: UI shows success or pending-confirmation messaging that does not overstate completion
   - Failure/edge outcome: invalid/auth/backend errors are shown inline and the user remains on the profile screen
4. Flow name: Update password
   - Trigger: signed-in user enters a new password
   - Steps: enter password; submit; await authenticated update result
   - Success outcome: UI confirms password update success without exposing sensitive values
   - Failure/edge outcome: inline validation or backend error feedback appears and no secret is logged or echoed back

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Keep account edits in one focused profile screen rather than scattering them across modals/routes.
- Reuse existing primitives first; if form-field composition becomes repetitive enough, promote a reusable component and document it.
- Email-change feedback must explicitly distinguish `submitted/pending confirmation` from `fully completed`.
- Password inputs must never display saved values or store them beyond the immediate form submission flow.
- Sign-out remains visually secondary after the new profile-management sections are added.

## Acceptance criteria

1. `app_public.user_profiles` exists with `id`, `username`, `created_at`, and `updated_at`, linked `1:1` to `auth.users(id)`.
2. `RLS` and constraints ensure only the authenticated owner can read/update their profile row.
3. If a signed-in user lacks a profile row, the app provisions one lazily in an idempotent way during profile load/save.
4. A signed-in user can create or update `username`, and the saved value persists server-side.
5. A signed-in user can request an email update from the app, and the UI communicates pending-confirmation semantics when the backend requires it.
6. A signed-in user can update their password from the app without logging or persisting sensitive values.
7. Profile fetch/update failures remain inline on the profile route and do not break unrelated local-only app usage.
8. Screen UI uses documented tokens/primitives/shared components for common buttons/text/layout/form patterns, or records a justified exception.
9. No raw color literals are introduced in screen files unless explicitly allowed by the task and documented with rationale.
10. Relevant cross-cutting auth/testing docs are updated in the same task.

## Docs touched (required)

- Planned docs/spec files to update and why (list exact paths; write `none` + rationale if no docs/spec changes expected):
  - `docs/specs/03-technical-architecture.md` - promote the implemented profile-storage and auth-profile runtime contract
  - `docs/specs/06-testing-strategy.md` - document required profile/auth mutation coverage and backend contract expectations
  - `docs/specs/10-api-authn-authz-guidelines.md` - update API/mobile-consumer auth guidance now that FE authenticated profile operations exist
  - `docs/specs/ui/ux-rules.md` - capture new account-form/error/pending-state semantics if they become shared UI behavior
- For significant cross-cutting behavior changes (for example sync model, auth-gated sync behavior, conflict policy, offline/online semantics, runtime topology, or test-layer expectations), include the relevant project-level docs here:
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
- Rule:
  - milestone/task docs are not substitutes for these project-level docs when behavior or verification expectations become part of the shared project contract
- If `UI Impact = yes`, complete all of the following:
  - Canonical UI docs maintenance trigger map lives in `docs/specs/ui/README.md` (`Maintenance rules`).
  - UI docs update required?: `yes`
  - If `yes`, list exact files under `docs/specs/ui/` and why, mapped to that canonical trigger map.
  - `docs/specs/ui/ux-rules.md` - profile edit semantics, inline feedback, and sign-out emphasis may change
  - `docs/specs/ui/components-catalog.md` - only if new reusable auth/profile form components are introduced
  - Tokens/primitives compliance statement (required for UI tasks):
    - Reuse plan: continue with `UiButton`, `UiSurface`, `UiText`, and shared tokens first; only promote a new `FormField`-like primitive if repeated auth/profile form composition justifies it
    - Exceptions (raw literals or screen-local one-offs), if any: `none planned`
  - UI artifacts/screenshots expectation (required to state for UI tasks):
    - Required by `docs/specs/08-ux-delivery-standard.md` or task scope?: `yes`
    - Planned captures/artifacts (if required): logged-in profile loaded state, username save success/failure, email update pending/success state, password update success/failure state
    - If not required, why optional/non-blocking here: `N/A`
- Authoring rule for UI docs (`docs/specs/ui/**`):
  - keep docs synthetic/overview-first and source-linked
  - do not duplicate detailed props/variants/implementation notes that are better read from source files

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted backend contract tests for `user_profiles` ownership and lazy-provisioning behavior
  - targeted mobile tests for profile load/save/update states
  - `./scripts/quality-fast.sh`
  - `./scripts/quality-slow.sh backend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh` (required; task spans frontend + backend)
  - `./scripts/quality-slow.sh backend` (required; migration/auth-contract changes are core scope)
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - backend contract/integration tests against local Supabase
  - mobile unit/integration tests for profile UI/data behavior
  - repo fast gate across changed workspaces
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - always
- Slow-gate triggers (required when `quality-slow` may apply; state `N/A` only if truly not applicable):
  - any change under `supabase/migrations/**`
  - any auth/profile API contract or `RLS` change
  - any local-Supabase-backed profile provisioning path change
- Hosted/deployed smoke ownership (required for backend/deployment work; name the owning task if deferred):
  - manual hosted smoke remains deferred; local Supabase is the required proof for this task
- CI/manual posture note (required when CI is absent or partial):
  - CI is absent; record both local Supabase contract results and manual profile UI verification
- Notes:
  - real Maestro auth/profile proof remains owned by `T-20260304-04`

## Implementation notes

- Planned files/areas allowed to change:
  - `supabase/migrations/**`
  - `supabase/tests/**`
  - `supabase/scripts/**` if a small wrapper is needed for new contract coverage
  - `apps/mobile/app/profile.tsx`
  - `apps/mobile/src/auth/**`
  - `apps/mobile/app/__tests__/**`
  - `apps/mobile/components/ui/**` only if reusable form primitives are justified
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/10-api-authn-authz-guidelines.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/ui/components-catalog.md` if reusable UI inventory changes
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - no new top-level folders expected; backend change should fit existing `supabase/**` ownership and mobile auth/profile modules should stay under `apps/mobile/src/**`
- Constraints/assumptions:
  - do not duplicate email into `user_profiles`
  - do not store password in `user_profiles`
  - lazy profile creation must be safe to retry across relaunches and request retries
  - keep auth/profile requests non-blocking for non-profile local app flows

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh`
- Standard local slow gate: `./scripts/quality-slow.sh backend`
- If a standard gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/T-20260304-03-m11-profile-backend-model-and-update-flows.md`
- Additional gate(s), if any:
  - targeted backend contract command(s)
  - targeted mobile profile Jest command(s)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- `user_profiles` schema/RLS summary.
- Lazy profile provisioning summary.
- Username/email/password update test summary.
- `./scripts/quality-fast.sh` and `./scripts/quality-slow.sh backend` result summary.
- UI/UX task visual artifacts note: logged-in profile states and inline feedback captures.
- Manual verification summary (required when CI is absent/partial):
  - record one local-Supabase-backed profile update pass and its outcome
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable:
  - hosted validation deferred until a later deployment-focused task/release check

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
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260304-03-m11-profile-backend-model-and-update-flows.md` (or document why `N/A`) before handoff.
