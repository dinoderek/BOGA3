---
task_id: T-20260304-02
milestone_id: "M11"
status: completed
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "docs,expo,node"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/ui/screen-map.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/ux-rules.md,docs/specs/ui/components-catalog.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-02`
- Title: M11 settings and profile navigation
- Status: `completed`
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
- UI docs bundle index: `docs/specs/ui/README.md`
- UI screen map: `docs/specs/ui/screen-map.md`
- UI navigation contract: `docs/specs/ui/navigation-contract.md`
- UI semantics: `docs/specs/ui/ux-rules.md`
- UI components catalog: `docs/specs/ui/components-catalog.md`

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
  - `docs/specs/ui/README.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/ui/components-catalog.md`
- Code/docs inventory freshness checks run (route inventory, UI docs inventory, schema/runtime inventory as applicable):
  - `apps/mobile/app/_layout.tsx` reviewed for current stack registration and route title behavior
  - `apps/mobile/components/navigation/top-level-tabs.tsx` reviewed for current top-level navigation surface that M11 must extend
  - current route inventory under `apps/mobile/app/**` reviewed; no settings/profile routes exist yet
- Known stale references or assumptions (must be explicit; write `none` if none):
  - assumes task `T-20260304-01` provides the shared auth-state surface consumed here
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/complete/T-20260304-02-m11-settings-and-profile-navigation.md`

## Objective

Add the M11 user-facing navigation and screen structure: a settings entrypoint from the current top-level nav surface, a minimal settings screen, and a profile route that supports signed-out sign-in UX plus signed-in account summary and sign-out.

## Scope

### In scope

- Extend the current primary navigation surface with a right-side settings affordance.
- Add a settings route with one destination entry: `Profile`.
- Add a profile route with distinct auth-aware states:
  - signed out: email/password sign-in form and inline failure feedback area
  - signed in: account email display, placeholder/profile-management shell for later mutation work, and de-emphasized sign-out
- Wire profile route actions to the shared auth service from `T-20260304-01`:
  - sign in
  - sign out
  - auth-state-driven rerender
- Keep route titles and navigation behavior explicit in the Expo Router stack.
- Add focused UI tests for route navigation and auth-state-aware rendering.

### Out of scope

- Backend `user_profiles` schema and username persistence.
- Email change and password change mutation flows.
- Final Maestro auth happy-path proof.
- Generic settings/preferences beyond the one `Profile` entry.

## UI Impact (required checkpoint)

- UI Impact?: `yes`
- If `yes`:
  - keep UI/UX parent references (`docs/specs/08-ux-delivery-standard.md`, `docs/specs/ui/README.md`)
  - keep the `UX Contract` section and fill it before implementation
  - include a tokens/primitives compliance statement in `Docs touched` / implementation notes:
    - what existing tokens/primitives/shared UI components will be reused
    - any justified one-off styling or raw literal exceptions (file + rationale)
  - include a UI docs update plan in `Docs touched`
  - include screenshots/artifacts expectations in `Evidence`

## UX Contract (UI/UX tasks only; remove this entire section for non-UX tasks)

### Key user flows (minimal template)

1. Flow name: Open settings from primary app navigation
   - Trigger: user taps the new settings affordance from a primary top-level screen
   - Steps: open settings; see a small settings menu/list; choose `Profile`
   - Success outcome: user reaches the profile screen without losing their place in the rest of the local-first app
   - Failure/edge outcome: if navigation fails, the app remains on the current route with visible feedback or safe no-op behavior rather than a crash
2. Flow name: Sign in from logged-out profile state
   - Trigger: logged-out user opens `Profile`
   - Steps: enter email; enter password; submit; await inline auth result
   - Success outcome: profile route switches into logged-in state and shows the signed-in account email
   - Failure/edge outcome: invalid credentials show clear inline feedback and keep the form editable
3. Flow name: Sign out from logged-in profile state
   - Trigger: signed-in user taps the de-emphasized sign-out action
   - Steps: confirm immediate action if design needs no modal; sign out; rerender logged-out state
   - Success outcome: profile route returns to the logged-out sign-in form
   - Failure/edge outcome: sign-out error is surfaced inline without leaving the route in an indeterminate state

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Reuse the current `UiButton`, `UiSurface`, and `UiText` primitives before introducing new one-off controls.
- Keep sign-out clearly available but visually secondary to the account-management content.
- Keep the settings affordance compact and aligned with the existing top-level navigation language rather than introducing a second heavy nav bar.
- Inline auth errors should sit near the sign-in form, not as detached global toasts.
- Do not introduce raw color literals in route files.

## Acceptance criteria

1. A settings affordance is present on the current primary navigation surface and routes to a new settings screen.
2. The settings screen contains a `Profile` destination and no extra out-of-scope settings content.
3. The profile route renders distinct logged-out and logged-in states driven by the shared auth session state.
4. Logged-out profile state includes email input, password input, submit action, and inline auth failure messaging.
5. Logged-in profile state includes the signed-in email and a visible but de-emphasized sign-out action.
6. Route registration/titles/transitions are documented and implemented without breaking current `/session-list` and `/exercise-catalog` entry flows.
7. Screen UI uses documented tokens/primitives/shared components for common buttons/text/layout/list patterns, or records a justified exception.
8. No raw color literals are introduced in screen files unless explicitly allowed by the task and documented with rationale.
9. Relevant `docs/specs/ui/*.md` docs are updated in the same task.
10. `docs/specs/ui/navigation-contract.md` is updated when routes, params/query behavior, redirects, or transitions change.

## Docs touched (required)

- Planned docs/spec files to update and why (list exact paths; write `none` + rationale if no docs/spec changes expected):
  - `docs/specs/ui/screen-map.md` - add settings/profile route purpose and high-level states
  - `docs/specs/ui/navigation-contract.md` - document new routes and transitions from current primary screens
  - `docs/specs/ui/ux-rules.md` - record any new auth-form and settings-navigation UI semantics
  - `docs/specs/ui/components-catalog.md` - document the expanded `TopLevelTabs` responsibility now that it includes the shared settings affordance
- Rule:
  - milestone/task docs are not substitutes for project-level or canonical UI docs when behavior/contracts become shared project knowledge
- If `UI Impact = yes`, complete all of the following:
  - Canonical UI docs maintenance trigger map lives in `docs/specs/ui/README.md` (`Maintenance rules`).
  - UI docs update required?: `yes`
  - If `yes`, list exact files under `docs/specs/ui/` and why, mapped to that canonical trigger map.
  - `docs/specs/ui/screen-map.md` - route inventory grows with settings/profile screens
  - `docs/specs/ui/navigation-contract.md` - route paths/transitions change
  - `docs/specs/ui/ux-rules.md` - action semantics and auth-form feedback semantics change
  - `docs/specs/ui/components-catalog.md` - `TopLevelTabs` role changes because it now exposes the shared settings affordance
  - Tokens/primitives compliance statement (required for UI tasks):
    - Reuse plan: reused `UiButton`, `UiSurface`, `UiText`, `uiBorder`, `uiColors`, `uiRadius`, `uiSpace`, and existing `TopLevelTabs` composition
    - Exceptions (raw literals or screen-local one-offs), if any: `none introduced`
  - UI artifacts/screenshots expectation (required to state for UI tasks):
    - Required by `docs/specs/08-ux-delivery-standard.md` or task scope?: `yes`
    - Planned captures/artifacts (if required): settings entrypoint visible from a primary screen, settings screen with `Profile`, profile logged-out state, profile logged-in state
    - If not required, why optional/non-blocking here: `N/A`
- Authoring rule for UI docs (`docs/specs/ui/**`):
  - keep docs synthetic/overview-first and source-linked
  - do not duplicate detailed props/variants/implementation notes that are better read from source files

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted React Native Testing Library coverage for settings/profile route rendering and auth-state transitions
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A` for this split task; final Maestro auth flow proof is owned by `T-20260304-04`
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - UI/component/integration tests for route behavior
  - frontend lint/typecheck/test fast gate
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - always
- Slow-gate triggers (required when `quality-slow` may apply; state `N/A` only if truly not applicable):
  - `N/A` for planned closeout because this task intentionally defers real-simulator auth happy-path evidence to `T-20260304-04`
- Hosted/deployed smoke ownership (required for backend/deployment work; name the owning task if deferred):
  - `N/A`
- CI/manual posture note (required when CI is absent or partial):
  - CI is absent; include local screenshot evidence plus `./scripts/quality-fast.sh frontend`
- Notes:
  - if route changes incidentally require smoke-flow selector updates, record the follow-up in `T-20260304-04` rather than expanding this task

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/app/settings.tsx` (new)
  - `apps/mobile/app/profile.tsx` (new)
  - `apps/mobile/components/navigation/**`
  - `apps/mobile/components/ui/**` only if a reusable primitive is justified
  - `apps/mobile/app/__tests__/**`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/ui/components-catalog.md` if new reusable UI is introduced
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - no top-level structure change expected; only new route files and possibly small shared navigation/form components
- Constraints/assumptions:
  - settings should remain intentionally small for M11
  - sign-in form should use the shared auth service from `T-20260304-01`, not direct client wiring inside the route

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `N/A` (final Maestro auth/profile proof is deferred to `T-20260304-04`)
- If a standard gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260304-02-m11-settings-and-profile-navigation.md`
- Additional gate(s), if any:
  - targeted settings/profile route Jest command(s)

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Navigation/route change summary:
  - extended `TopLevelTabs` with a right-side `Settings` action on `session-list` and `exercise-catalog`
  - added explicit stack-registered `/settings` and `/profile` routes
  - `/settings` now contains the single `Profile` destination for the M11 account flow
- Sign-in/sign-out UI test summary:
  - targeted Jest coverage verifies settings -> profile navigation, logged-out profile form rendering, sign-in submission, inline auth error display, signed-in account summary rendering, and sign-out invocation
- Screenshot/capture evidence for the planned settings/profile states:
  - updated `apps/mobile/app/__tests__/__snapshots__/ui-primitives.test.tsx.snap` captures the shared top-level navigation surface with the new settings affordance
  - route-state captures are currently assertion-based in `apps/mobile/app/__tests__/settings-profile-navigation.test.tsx`
- Manual verification summary (required when CI is absent/partial): not run in a simulator during this split task; real-device/simulator auth-path proof remains intentionally deferred to `T-20260304-04`
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable:
  - `N/A`

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed: added a shared `Settings` affordance to the existing top-level navigation surface, added `/settings` and `/profile` with explicit stack titles, implemented auth-aware profile UI for restoring/auth-disabled/signed-out/signed-in states using the shared auth service, and updated the authoritative UI docs plus the M11 milestone task breakdown.
- What tests ran: `cd apps/mobile && npm test -- --runTestsByPath app/__tests__/ui-primitives.test.tsx app/__tests__/root-layout-auth-bootstrap.test.tsx app/__tests__/session-list-screen.test.tsx app/__tests__/settings-profile-navigation.test.tsx --updateSnapshot`; `./scripts/quality-fast.sh frontend`.
- What remains: `T-20260304-03` still owns backend `user_profiles` plus editable profile-management flows, and `T-20260304-04` still owns real simulator/Maestro auth proof plus any final M11 doc cleanup after those flows land.

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- For UI/UX tasks, update the relevant `docs/specs/ui/*.md` files and keep entries synthetic/overview-first.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260304-02-m11-settings-and-profile-navigation.md` (or document why `N/A`) before handoff.
