---
task_id: T-20260224-04
milestone_id: "M6"
status: completed
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "node,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/tasks/T-20260224-04-m6-session-recorder-exercise-management-integration.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/screen-map.md,docs/specs/ui/ux-rules.md,docs/specs/ui/components-catalog.md,docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260224-04`
- Title: M6 connect session-recorder exercise manage/add flows to exercise catalog editor
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-27`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Milestone spec: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard (UI/UX tasks only): `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index (UI/UX tasks only): `docs/specs/ui/README.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main` @ `0ec55aa`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git pull --ff-only`, already up to date)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/ui/README.md`
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/ui/components-catalog.md`
- Code/docs inventory freshness checks run:
  - recorder + catalog route/state scan (`apps/mobile/app/session-recorder.tsx`, `apps/mobile/app/exercise-catalog.tsx`) - verified `2026-02-27`
  - exercise-catalog data/schema scan (`apps/mobile/src/data/exercise-catalog.ts`, `apps/mobile/src/data/schema/exercise-definitions.ts`) - verified `2026-02-27`
  - existing test inventory scan (`apps/mobile/app/__tests__`) for recorder/catalog/deletion flows - verified `2026-02-27`
- Known stale references or assumptions: `none`

## Objective

Integrate the M6 exercise catalog management/editing experience into the session recorder `Log new exercise -> Manage / Add new` flows, while also cleaning up legacy in-recorder exercise-management artifacts and upgrading the exercise catalog to soft-delete semantics (`delete`, `view deleted`, `undelete`) that are reflected in recorder selection behavior.

## Scope

### In scope

- Link the session recorder exercise picker/manage/add flows to the persistent exercise catalog editor introduced in `T-20260224-03`.
- Define and implement a clear navigation/return path between:
  - session recorder exercise picker/manage UI
  - exercise catalog editor route/screen
- Clean up legacy recorder-local exercise-management artifacts that conflict with the persistent catalog model (in-memory `exercisePresets` add/edit/archive management UI/state/contracts).
- Change exercise-catalog delete behavior from hard delete to soft delete (persist deleted state/timestamp).
- Add catalog UX to:
  - hide deleted exercises by default
  - show deleted exercises on demand
  - undelete exercises from the deleted-visible state
- Ensure recorder picker behavior uses the catalog model:
  - soft-deleted exercises are not available in normal picker lists
  - newly created/updated/undeleted exercises are visible after returning from catalog
- Add UI/data-layer test coverage for recorder integration + soft-delete lifecycle.

### Out of scope

- Redesigning the entire session recorder exercise modal UX.
- Historical mapping/versioning behavior for completed sessions.
- Backend sync/API integration for exercise definitions/mappings.
- Introducing editable muscle-group taxonomy (taxonomy remains system-defined in M6).

## UI Impact (required checkpoint)

- UI Impact?: `yes`
- This task changes route-to-route flow semantics and exercise list state semantics (active vs deleted visibility), so `UX Contract` and `docs/specs/ui/*.md` updates are required.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Open persistent exercise editor from recorder
   - Trigger: User is in session recorder exercise picker and taps `Manage` or `Add new`.
   - Steps: Open `Log new exercise` -> trigger manage/add action -> navigate to exercise catalog -> complete or cancel editor action -> return to recorder.
   - Success outcome: User returns to recorder and draft session context is preserved.
   - Failure/edge outcome: If catalog load/save fails, user gets recoverable feedback and recorder remains usable.
2. Flow name: Create/update exercise in catalog and use it in recorder
   - Trigger: User creates or edits an exercise while logging a session.
   - Steps: Enter catalog from recorder -> save create/edit -> return -> select updated/new exercise in picker.
   - Success outcome: Picker reflects latest active catalog data without app restart.
   - Failure/edge outcome: If refresh fails, user sees retryable feedback and can continue with existing available exercises.
3. Flow name: Soft-delete exercise and verify visibility behavior
   - Trigger: User deletes an exercise from exercise catalog actions.
   - Steps: Delete exercise -> confirm item disappears from active list -> toggle `Show deleted` -> verify deleted item appears with restore affordance.
   - Success outcome: Delete is reversible and deleted exercises are excluded from active selection surfaces.
   - Failure/edge outcome: If delete persistence fails, item state does not silently drift and user gets error feedback.
4. Flow name: Undelete exercise and reuse it in recorder
   - Trigger: User is viewing deleted exercises in catalog and restores one.
   - Steps: Toggle `Show deleted` -> undelete exercise -> verify it reappears in active list -> return to recorder picker -> select it.
   - Success outcome: Restored exercise behaves like any active exercise.
   - Failure/edge outcome: If undelete fails, deleted state remains explicit and recoverable with retry.

### Interaction + appearance notes (lightweight)

- Recorder draft and autosave behavior must remain stable while navigating out to catalog and back.
- Avoid keeping two competing exercise-management systems in recorder and catalog.
- Deleted exercise visibility should be explicit and reversible via one clear toggle/action path.
- Delete/undelete affordances must be visually and semantically distinct from edit actions.

## Acceptance criteria

1. Session recorder exercise add/manage flow provides access to the persistent exercise catalog editor introduced in `T-20260224-03`.
2. Legacy recorder-local exercise preset management artifacts are removed or reduced to non-conflicting integration affordances.
3. Catalog exercise delete is soft-delete (not hard-delete) and persists deleted state.
4. Deleted exercises are hidden from the default catalog list and recorder picker, but can be viewed when deleted visibility is enabled.
5. User can undelete a deleted exercise and it returns to active catalog and recorder picker behavior.
6. Recorder exercise picker reflects newly created, updated, soft-deleted, and undeleted catalog exercises after return without app restart.
7. Existing recorder exercise selection/change/set-management flows continue to work after integration.
8. UI/data tests cover recorder integration path plus at least one delete/view-deleted/undelete lifecycle path.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/tasks/T-20260224-04-m6-session-recorder-exercise-management-integration.md` - scope extension + test-flow plan
  - `docs/specs/ui/navigation-contract.md` - update transitions if recorder manage opens catalog route and add-new behavior changes
  - `docs/specs/ui/screen-map.md` - update recorder/catalog screen-purpose notes for integrated flow semantics
  - `docs/specs/ui/ux-rules.md` - update list/deleted-state semantics for exercise catalog if behavior contract changes
  - `docs/specs/ui/components-catalog.md` - document shared reusable exercise editor modal component
- UI docs update required?: `yes` (route transition + list/deleted-state semantics will change)
- Tokens/primitives compliance statement:
  - Reuse plan: continue using existing `uiColors`/shared UI primitives and current modal/list patterns unless promoting reusable primitives is justified during implementation.
  - Exceptions: none planned.
- UI artifacts/screenshots expectation:
  - Required by scope?: `yes`
  - Planned captures/artifacts: recorder -> catalog -> recorder return; catalog deleted-visible state; undelete success state.

## Flow Test Brainstorm (first pass)

1. `P0`: Recorder `Log new exercise` -> `Manage` opens catalog route, returning preserves recorder draft context.
2. `P0`: Recorder `Log new exercise` -> `Add new` opens catalog route, create succeeds, return allows selecting the new exercise.
3. `P0`: Catalog soft-delete hides deleted exercise from default catalog list and recorder picker.
4. `P0`: Catalog `Show deleted` reveals deleted exercise and displays undelete action.
5. `P0`: Catalog undelete restores exercise to active list and recorder picker without app restart.
6. `P1`: Existing session exercise rows retain stable names/sets after leaving recorder for catalog and returning.
7. `P1`: Delete failure path surfaces error and leaves item state unchanged.
8. `P1`: Undelete failure path surfaces error and keeps item in deleted state.
9. `P1`: Recorder change-exercise flow for an already-added exercise still works with catalog-backed picker list.
10. `P2`: Completed-edit mode path remains stable if exercise picker integration is exercised there.

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md`)

- Planned checks/commands:
  - targeted recorder/catalog integration UI tests
  - targeted exercise-catalog soft-delete/undelete tests (UI + repository)
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - Fast gate: `./scripts/quality-fast.sh frontend` (mandatory)
  - Slow gate: `./scripts/quality-slow.sh frontend` (required because this task changes user-facing UI flows/routes)
- Notes:
  - Prefer deterministic UI tests with mocked data-layer dependencies for route-flow assertions.
  - Add repository/data tests for soft-delete semantics to avoid UI-only coupling.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/app/exercise-catalog.tsx`
  - `apps/mobile/app/_layout.tsx` (if route params/entry affordance updates are needed)
  - `apps/mobile/components/session-recorder/types.ts` (legacy preset artifact cleanup if still referenced)
  - `apps/mobile/src/data/exercise-catalog.ts`
  - `apps/mobile/src/data/schema/exercise-definitions.ts`
  - `apps/mobile/src/data/schema/index.ts` and related migration artifacts under `apps/mobile/drizzle/**`
  - `apps/mobile/app/__tests__/**`
  - `apps/mobile/src/data/**/__tests__/**`
  - impacted UI docs under `docs/specs/ui/**`
- Project structure impact: `no major structure changes expected` (schema/migration artifact updates only)
- Constraints/assumptions:
  - M6 taxonomy remains system-defined and non-editable.
  - Keep recorder autosave/session draft behavior intact while integrating route navigation.

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Additional gate(s), if any: targeted recorder/catalog integration and soft-delete lifecycle tests

## Evidence

- UI flow evidence for recorder -> catalog -> recorder return path.
- Evidence that create/update/delete/undelete states are reflected in recorder picker behavior.
- Test/gate results summary for targeted tests + fast/slow frontend gates.
- Manual verification summary (CI currently absent): include local run outcomes and any residual risk.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
  - Implemented session-recorder integration with persistent exercise catalog:
    - exercise picker `Manage` navigates to `exercise-catalog` with recorder-origin query params, while `Add new` opens the shared exercise editor modal directly inside `session-recorder`.
    - returning from catalog preserves recorder draft context; successful save from recorder-origin catalog returns via `router.back()`.
  - Removed recorder-local exercise preset management artifacts so recorder no longer maintains a competing in-memory exercise catalog/edit/archive flow.
  - Added exercise catalog soft-delete lifecycle:
    - schema + migration support for `exercise_definitions.deleted_at`.
    - repository/store supports soft-delete (`deletedAt`), include-deleted listing, and undelete.
    - UI supports `Show deleted` / `Hide deleted`, deleted row state hint, undelete action, and disabled direct editing for deleted rows.
  - Updated recorder picker loading behavior to source active exercises from persistent catalog and refresh on screen focus/open.
  - Updated iOS Maestro smoke flows to match seeded catalog labels (`Barbell Back Squat`) so slow-gate smoke remains aligned with current seed fixtures.
- What tests ran:
  - `./scripts/quality-fast.sh frontend` (pass; lint warnings only, no lint/type/test failures)
  - `./scripts/quality-slow.sh frontend` (pass; iOS smoke + data-runtime smoke)
  - Targeted affected suites (pass):
    - `app/__tests__/exercise-catalog-repository.test.ts`
    - `app/__tests__/exercise-catalog-screen.test.tsx`
    - `app/__tests__/session-recorder-screen.test.tsx`
    - `app/__tests__/session-recorder-interactions.test.tsx`
    - `app/__tests__/session-recorder-submit.test.tsx`
    - `app/__tests__/session-recorder-persistence.test.tsx`
    - `app/__tests__/session-list-recorder-journey.test.tsx`
    - `app/__tests__/session-completed-journey.test.tsx`
    - `app/__tests__/domain-schema-migrations.test.ts`
- What remains:
  - No known functional blockers for this task scope.
  - Residual non-blocking test-console warnings remain in `session-recorder-screen` (`act(...)` warning during async picker refresh).

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update relevant `docs/specs/ui/*.md` files (or explicit no-update rationale).
- Update parent milestone task breakdown/status in the same session.
