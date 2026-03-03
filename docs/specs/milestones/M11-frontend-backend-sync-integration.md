# Milestone Spec

## Milestone metadata

- Milestone ID: `M11`
- Title: Frontend/backend sync integration and sync status UX
- Status: `in_progress`
- Owner: `AI + human reviewer`
- Target window: `2026-03`

## Parent references

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- API/auth guidelines: `docs/specs/10-api-authn-authz-guidelines.md`
- Maestro runtime contract: `docs/specs/11-maestro-runtime-and-testing-conventions.md`
- Backend baseline milestone: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Sync API contract baseline: `supabase/session-sync-api-contract.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`

## Milestone objective

Integrate the mobile app with the existing local/backend sync foundation for the current session-tracking domain so authenticated users can sync opportunistically without breaking the app's local-first behavior, while documenting conflict policy, sync status behavior, and verification expectations in the project-level docs.

## In scope

- Define and document the M11 sync behavior contract:
  - auth-gated sync behavior
  - sync triggers and cadence
  - graceful offline/backend-unavailable behavior
  - conflict resolution policy
  - sync status and diagnostics semantics
- Scope sync to the current M5-backed session domain:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
- Audit the current backend sync contract against real frontend edit behavior and add parity support where needed:
  - delete/tombstone semantics or equivalent graph-parity mechanism
  - child-row parity for nested session edits
- Add a mobile auth/session adapter for sync consumption:
  - sync only runs when an authenticated user session is available
  - no end-user login UI in this milestone
- Add mobile sync state persistence:
  - last successful sync time
  - last failed sync time
  - last attempted sync time
  - current sync status / reason for pause
- Implement the sync engine/orchestrator for foreground app usage:
  - bootstrap/app-open
  - app foreground/resume
  - connectivity regain
  - periodic polling while app is open
- Add a simple sync status surface in the app:
  - new `settings` or `profile` route
  - optional lightweight stale/failure indicator if sync has been failing for an extended period
- Add test coverage across mock-backend and real local-backend lanes.
- Update project-level docs (`03`, `04`, `06`) whenever stable sync behavior, architecture, or verification rules are introduced.

## Out of scope

- End-user login/sign-up/forgot-password/logout UI.
- Public self-signup or account-management flows.
- Cloud deployment/staging/production environment strategy.
- OS-level background fetch or native background sync scheduling.
- Hard multi-device enforcement, remote device management, or explicit device-switch UX.
- Sync for frontend data not yet represented by backend APIs (for example exercise-catalog metadata) unless a dedicated follow-up task expands backend scope first.

## Locked sync contract (Task 01)

- Auth gating:
  - sync remains paused when no authenticated session exists or when auth expires;
  - local recording, autosave, and history behavior continue without backend access.
- Trigger model:
  - first sync attempt occurs opportunistically on app bootstrap/open when an authenticated session exists;
  - additional attempts occur on app foreground/resume, connectivity regain, and periodic polling while the app remains open;
  - M11 does not guarantee OS-level background delivery.
- Scope boundary:
  - only the current M5-backed session domain is syncable in M11: `gyms`, `sessions`, `session_exercises`, and `exercise_sets`;
  - exercise-catalog metadata and other post-M5 frontend-only entities remain local-only.
- Conflict policy:
  - treat a session and its nested exercises/sets as one sync aggregate for correctness purposes;
  - do not treat independent child-row last-write wins as sufficient for recorder edits, because the current mobile save path rewrites the nested graph as a whole;
  - if both sides diverge, implementation must prefer an explicit stale-write/conflict path or another deterministic aggregate-level reconciliation rule rather than silently mixing child rows from different versions.
- Known backend parity gaps entering implementation:
  - `sessions.deleted_at` exists, but `session_exercises` and `exercise_sets` have no delete/tombstone representation in the M5 contract;
  - the current M5 `PostgREST` baseline only exposes row-level `GET/POST/PATCH`, which does not yet encode full session-graph replacement or nested child removal parity.
- Implemented parity surface (`T-20260302-02`):
  - backend aggregate writes use `app_public.replace_session_graph`, exposed through `POST /rest/v1/rpc/replace_session_graph`;
  - the RPC compares `p_expected_updated_at` to the current remote `sessions.updated_at` value and rejects stale writes instead of mixing divergent child rows;
  - nested child omission in `p_exercises` is treated as deletion during replacement, so session-exercise and set parity is preserved without adding child tombstones.

## Deliverables

1. M11 sync behavior contract documented across milestone docs and promoted to project-level architecture/testing/process docs where behavior becomes stable.
2. Backend sync contract parity for the current mobile session-graph editing model.
3. Mobile auth-aware backend client and sync state persistence foundation.
4. Foreground sync engine/orchestrator with retry/recovery behavior that preserves local-first UX.
5. A small in-app sync status/settings surface.
6. Mock-backend sync scenario coverage for the major sync paths and failure modes.
7. First `Maestro` + local `Supabase` cross-stack sync `E2E` proof path.

## Acceptance criteria

1. Sync remains disabled when no authenticated session exists, while local app usage continues normally.
2. When an authenticated session exists and connectivity/backend reachability allow it, the app syncs the scoped session domain without requiring manual user intervention.
3. The initial sync trigger model is implemented and documented:
  - bootstrap/app-open
  - app foreground/resume
  - connectivity regain
  - periodic polling while the app is open
4. The app persists and exposes at least:
  - `lastSuccessfulSyncAt`
  - `lastFailedSyncAt`
  - `lastAttemptedSyncAt`
  - current sync status / paused reason
5. Conflict resolution policy is explicitly documented and implemented for the scoped domain, with tests covering the relevant rare-conflict path or conflict-avoidance model.
  - session graphs are reconciled as aggregates, not as unrelated child-row winners.
6. Backend contract supports the frontend's real edit model for the scoped domain, including delete/tombstone or equivalent parity where needed.
  - nested exercise/set removals caused by full graph rewrites are preserved correctly.
7. Backend-unavailable, offline, and auth-missing/expired states are handled gracefully without crashing the app or surfacing noisy errors during normal use.
8. A new settings/profile-style route exposes sync status and last successful sync information.
9. Mock-backend tests cover the relevant scenario matrix:
  - frontend/local ahead
  - backend ahead
  - offline/backend unavailable recovery
  - auth-gated sync disabled path
  - conflict path or conflict-avoidance semantics
  - delete/tombstone parity when supported by the chosen contract
10. At least one real `Maestro` + local `Supabase` `E2E` path proves that local mobile changes reach the backend.
11. `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` are kept current as stable sync behavior, architecture boundaries, and verification expectations are introduced or changed.
12. Relevant UI docs under `docs/specs/ui/**` are updated in the same session as the sync status route and any related navigation changes.

## Task breakdown

1. `docs/tasks/complete/T-20260302-01-m11-sync-scope-conflict-policy-and-m5-realignment.md` - locked sync/auth behavior and conflict policy, audited backend parity gaps, and confirmed the M5 realignment. (`completed`)
2. `docs/tasks/complete/T-20260302-02-m11-backend-sync-contract-parity-for-session-graphs.md` - added aggregate backend contract parity for real frontend session-graph edits via `replace_session_graph`. (`completed`)
3. `docs/tasks/T-20260302-03-m11-mobile-auth-session-adapter-and-sync-state-foundation.md` - add mobile auth-aware backend client plumbing and local sync-state persistence foundation. (`planned`)
4. `docs/tasks/T-20260302-04-m11-sync-engine-triggers-retry-and-reconciliation.md` - implement sync orchestration, retries, and reconciliation behavior. (`planned`)
5. `docs/tasks/T-20260302-05-m11-sync-status-route-and-diagnostics-ui.md` - add the sync status route and lightweight diagnostics UX. (`planned`)
6. `docs/tasks/T-20260302-06-m11-sync-mock-backend-scenarios-and-regression-coverage.md` - add mock-backend sync scenario coverage and regressions. (`planned`)
7. `docs/tasks/T-20260302-07-m11-maestro-local-backend-sync-e2e-smoke.md` - add the first local-Supabase cross-stack sync `E2E` smoke. (`planned`)

## Risks / dependencies

- The current M5 API baseline may be insufficient for full session-graph parity if nested deletes/tombstones are not represented.
- The mobile app currently has no auth UI and no shared provider layer; M11 must add sync-facing auth/session plumbing without overreaching into account UX.
- Exercise catalog and other post-M5 local-only data remain outside backend scope; attempting to sync them in M11 would widen the milestone substantially.
- Row-level last-write semantics may be too weak for real session-graph edits unless the aggregate reconciliation model is documented and implemented carefully.
- `Maestro` + local `Supabase` orchestration introduces cross-runtime complexity and should be isolated behind a repeatable wrapper/path.

## Decision log

- Date: `2026-03-02`
- Decision: M11 sync is auth-gated, but auth is not required for local app usage.
- Reason: Preserves local-first behavior while enabling cloud sync only when a valid authenticated session exists.
- Impact: Mobile sync code must distinguish `local-only` from `sync-enabled` states without blocking recording flows.

- Date: `2026-03-02`
- Decision: End-user login UI is out of scope for M11; sync consumes auth state via an adapter/test harness instead.
- Reason: Sync integration and login UX are separate concerns, and M11 should focus on correctness of sync behavior against the existing backend baseline.
- Impact: Tests and harnesses may inject or provision authenticated sessions without requiring production-style sign-in screens.

- Date: `2026-03-02`
- Decision: Initial sync behavior is foreground/app-usage based, not OS-level background sync.
- Reason: Bootstrap/resume/connectivity-regain/polling behavior is sufficient for the first sync milestone and avoids premature native-background complexity.
- Impact: M11 must document that sync occurs opportunistically while the app is active rather than guaranteeing background delivery.

- Date: `2026-03-02`
- Decision: M11 sync scope is limited to the current M5-backed session domain.
- Reason: The existing backend baseline only covers `gyms`, `sessions`, `session_exercises`, and `exercise_sets`; expanding beyond that would mix backend scope expansion with sync-engine delivery.
- Impact: Other frontend data remains local-only until a separate backend-expansion milestone/task introduces the necessary APIs.

- Date: `2026-03-02`
- Decision: M11 conflict handling is aggregate-oriented for session graphs, not child-row last-write-wins.
- Reason: The recorder persists nested exercise/set edits by replacing the session child graph, so mixing independently "winning" child rows would not preserve real user intent.
- Impact: Implementation and tests must use a deterministic stale-write/conflict-avoidance rule that preserves full graph parity, and backend parity work must add a child-removal mechanism.

- Date: `2026-03-03`
- Decision: M11 backend session-graph parity uses a `PostgREST RPC` (`replace_session_graph`) with compare-and-swap semantics on `sessions.updated_at`.
- Reason: Row-level child CRUD alone could not encode whole-graph replacement or omitted-child deletion without silently merging divergent child rows.
- Impact: Mobile sync write paths should use the aggregate RPC for session-graph pushes, while row-level `GET` routes remain valid for pulls and simpler entity reads.

## Completion note (fill when milestone closes)

- What changed:
- Verification summary:
- What remains:

## Status update checklist (mandatory during task closeout)

- Keep milestone `Status` current as tasks progress.
- Update task breakdown entries to reflect each task state (`planned | in_progress | completed | blocked | outdated`).
- If milestone remains open after a session, record why in the active task completion note and/or milestone completion note (status remains `in_progress`).
