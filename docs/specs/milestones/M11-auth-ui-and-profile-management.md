# Milestone Spec

## Milestone metadata

- Milestone ID: `M11`
- Title: `Auth UI and Profile Management`
- Status: `in_progress`
- Owner: `AI + human reviewer`
- Target window: `2026-03`

## Parent references

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX delivery standard: `docs/specs/08-ux-delivery-standard.md`
- Project structure: `docs/specs/09-project-structure.md`
- API auth/authz guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- UI docs bundle: `docs/specs/ui/README.md`
- UI screen map: `docs/specs/ui/screen-map.md`
- UI navigation contract: `docs/specs/ui/navigation-contract.md`
- Source brainstorm: `docs/brainstorms/009.BasicAuth.md`

## Milestone objective

Add first-class mobile app support for:

- sign in with `email + password`,
- sign out,
- persistent authenticated session restore,
- current-user profile viewing and editing.

This milestone is intentionally limited to auth and profile UX. It does **not** introduce generic local-to-server data sync, outbox behavior, or conflict handling.

## Scope decisions (locked for M11)

1. Auth method remains `email + password` only.
2. Public self-signup remains disabled; users are still admin-provisioned.
3. Mobile uses normal `Supabase Auth` session behavior (`access token` + `refresh token`), not a custom "forever token".
4. Passwords remain owned by `Supabase Auth`; they are never stored in an app profile row.
5. App-specific profile data is limited to `username` in M11.
6. Email remains an auth identity field, not a column duplicated into the app profile table.
7. Local tracker data remains usable while logged out and is not uploaded, downloaded, merged, or cleared as part of M11.

## In scope

- Mobile auth client integration for:
  - sign-in with `email + password`
  - restore existing authenticated session on app launch
  - sign-out
  - auth-state-aware UI rendering
- A settings entrypoint added to the current top-level navigation surface.
- A settings surface with a single `Profile` destination for now.
- A profile screen with distinct logged-out and logged-in states.
- Logged-out profile state:
  - email input
  - password input
  - submit action
  - clear inline auth failure messaging
- Logged-in profile state:
  - signed-in account summary
  - current email display
  - editable `username`
  - in-app email update flow
  - in-app password update flow
  - secondary/de-emphasized sign-out action
- Minimal backend profile storage needed for `username`:
  - add `app_public.user_profiles`
  - `id` is `auth.users.id` (`1:1`)
  - fields: `username`, `created_at`, `updated_at`
  - `RLS` so users can read/update only their own profile row
- Profile provisioning strategy:
  - auth users continue to be created by admin provisioning
  - `user_profiles` row is created lazily on first successful sign-in if missing
- UI/documentation/test updates required by the new routes and profile semantics.

## Out of scope

- Any generic sync engine, outbox, background retry, pull/push loop, or conflict handling.
- Uploading existing local tracker data to the server.
- Downloading tracker data from the server.
- Multi-device reconciliation semantics.
- Public signup, invites, magic links, OAuth, phone auth, or anonymous auth.
- Account deletion.
- Backend admin tooling for token revocation beyond existing manual/admin processes.
- Password reset-via-email recovery flow from the logged-out state.
- Group/social/public-profile features.

## Deliverables

1. Mobile auth/session integration using the existing `Supabase Auth` backend baseline.
2. Settings/profile navigation and screen UX for logged-out and logged-in states.
3. Narrow backend profile model for `username` management only.
4. Tests covering sign-in, sign-out, session restore, profile load, and profile update/error flows.
5. Same-session documentation updates for any changed auth guidance and UI route/navigation docs.

## Acceptance criteria

1. A logged-out user can open the profile screen and sign in with a provisioned `email + password` account.
2. Invalid credentials produce explicit inline feedback without crashing the route or blocking local app usage elsewhere.
3. After successful sign-in, the app restores the authenticated session across relaunches until the session is explicitly ended or revoked by normal `Supabase Auth` behavior.
4. A signed-in user can sign out from the profile screen; the sign-out control is available but visually secondary to profile management actions.
5. The profile screen clearly renders the signed-in account email and current `username` value.
6. A signed-in user can create or update their `username`, and that value persists server-side in `app_public.user_profiles`.
7. A signed-in user can change their email from the app using authenticated `Supabase Auth` user-update behavior.
8. A signed-in user can change their password from the app using authenticated `Supabase Auth` user-update behavior.
9. The UX surfaces the fact that email change completion may depend on the backend's configured confirmation flow instead of assuming immediate silent success.
10. Signing in or out does not start any generic tracker-data sync flow, clear local SQLite data, or change local-only recorder/list functionality.
11. Maestro coverage exists for the primary auth/profile happy path:
  - start logged out
  - sign in
  - verify logged-in profile state
  - update `username`
  - sign out
  - verify logged-out profile state
12. Existing non-auth mobile flows remain runnable without requiring a signed-in user unless a later milestone explicitly changes that contract.

## Planned technical approach

### Auth/session model

- Use the existing `Supabase Auth` backend baseline from M5.
- The mobile app uses client-safe Supabase credentials only.
- The mobile app persists and restores the authenticated session using the Supabase client session model.
- M11 does not invent an app-specific long-lived token format.

### Profile model

- Introduce `app_public.user_profiles` keyed `1:1` to `auth.users(id)`.
- Store only app-specific profile data needed now:
  - `username`
  - `created_at`
  - `updated_at`
- Do not store:
  - `password`
  - duplicate `email`
  - broader preferences/settings that are unrelated to profile identity

### Profile provisioning

- Keep user creation/admin provisioning in the existing backend-admin path.
- Do not require a separate manual SQL script just to create profile rows for every existing user before M11 can function.
- If a signed-in user has no `user_profiles` row yet, create it on first authenticated profile load/save.

### UI/navigation approach

- Extend the current top-level navigation with a settings affordance on the right side of the bottom navigation surface.
- Initial settings scope stays intentionally small:
  - one entry: `Profile`
- Keep the profile screen focused on account tasks only:
  - sign in when logged out
  - manage account fields when logged in
- Keep sign-out discoverable but visually de-emphasized.

### Email/password management semantics

- Email update uses authenticated user-update behavior from `Supabase Auth`.
- Password update uses authenticated user-update behavior from `Supabase Auth`.
- Because `Supabase Auth` email updates can require confirmation depending on backend settings, the app must show a pending/success state that does not assume the email is already fully changed.

## Task breakdown

1. `docs/tasks/complete/T-20260304-01-m11-auth-client-session-bootstrap.md` - add mobile auth client wiring, session restore, and auth-state service. (`completed`)
2. `docs/tasks/complete/T-20260304-02-m11-settings-and-profile-navigation.md` - add settings entrypoint, settings surface, and profile screen route/navigation. (`completed`)
3. `docs/tasks/T-20260304-03-m11-profile-backend-model-and-update-flows.md` - add `user_profiles`, profile load/save, and authenticated email/password update flows. (`planned`)
4. `docs/tasks/T-20260304-04-m11-auth-profile-tests-and-doc-updates.md` - add remaining auth/profile coverage, Maestro proof path, and any final M11 doc cleanup. (`planned`)

Rule:

- use `docs/tasks/<task-id>.md` while tasks are active/planned;
- update references to `docs/tasks/complete/<task-id>.md` once a task card is completed and moved.

## Risks / dependencies

- Profile management introduces the first mobile dependency on authenticated backend state; login-state handling must not leak into unrelated local-only flows.
- Email change UX may be more complex than username/password updates because backend confirmation settings can add a pending step.
- Lazy profile-row creation must be idempotent so retry/relaunch does not create duplicate or partially initialized state.
- Maestro/runtime tests will need deterministic provisioned credentials and a clean way to start in logged-out state.
- UI docs (`screen-map`, `navigation-contract`, `ux-rules`, and possibly `components-catalog`) will require same-session updates when implementation lands.

## Completion note (fill when milestone closes)

- What changed:
- Verification summary:
- What remains:

## Status update checklist (mandatory during task closeout)

- Keep milestone `Status` current as tasks progress.
- Update task breakdown entries to reflect each task state (`planned | in_progress | completed | blocked | outdated`).
- If milestone remains open after a session, record why in the active task completion note and/or milestone completion note (status remains `in_progress`).
