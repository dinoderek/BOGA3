# Task Card

## Task metadata

- Task ID: `T-20260225-13`
- Title: Post-M5 mobile test-directory refactor and test asset layout rationalization
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-25`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#3-fe-auth-integrated-with-backend`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` (deferred follow-up context; not part of M5 closeout)
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Objective

Move mobile app tests out of `apps/mobile/app/__tests__/` into a dedicated mobile test directory/layout, update configs/scripts/docs accordingly, and preserve behavior and developer ergonomics (including Maestro conventions) without mixing in feature changes.

## Scope

### In scope

- Define target mobile test layout (for example `apps/mobile/tests/**`) and document rationale.
- Move existing Jest/RTL/data/domain tests from `apps/mobile/app/__tests__/` to the target layout.
- Update test discovery/configuration/import paths as needed (`jest`, TS path references, helper imports, scripts/docs).
- Preserve or improve local developer ergonomics:
  - focused test execution
  - watch mode behavior
  - clear grouping by test type/domain
- Update project structure and testing strategy docs with the new canonical mobile test location.

### Out of scope

- Backend/Supabase feature work.
- Behavior changes to app screens/domain logic unrelated to path/import updates.
- Moving Maestro flows out of `apps/mobile/.maestro/flows` (this task should preserve that convention unless a separate explicit decision is made).
- Visual/UX changes.

## Acceptance criteria

1. `apps/mobile/app/__tests__/` is no longer the canonical location for mobile non-Maestro tests; new canonical location is implemented and documented.
2. Existing mobile test suites continue to run from the updated locations.
3. Jest/test tooling config and scripts work with the new layout (including targeted test runs).
4. `docs/specs/06-testing-strategy.md` and `docs/specs/09-project-structure.md` are updated to reflect the new mobile test layout.
5. The task is behavior-preserving (no intentional feature changes).
6. Maestro flow location remains documented and unchanged unless a separate explicit decision is recorded.

## Testing and verification approach

- Planned checks/commands:
  - mobile lint/typecheck/test command(s)
  - targeted runs for at least one UI test and one non-UI/data test from the new locations
  - optional Maestro smoke if script/config path changes affect test runner integration
- Test layers covered:
  - mobile unit/component/integration test discovery and execution
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - always for this task (refactor task)
- CI/manual posture note (required when CI is absent or partial):
  - CI is absent; local verification evidence is required.
- Notes:
  - Keep the diff focused on moves/config/docs; avoid opportunistic test rewrites unless required by path changes.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/__tests__/**` (moves)
  - `apps/mobile/tests/**` (new canonical location; exact structure finalized in-session)
  - `apps/mobile/package.json`
  - `apps/mobile` test/jest config files
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/tasks/T-20260225-13-post-m5-mobile-test-directory-refactor.md`
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - establishes a new canonical mobile test directory and retires `apps/mobile/app/__tests__/` as the default.
- Constraints/assumptions:
  - This is a dedicated refactor task and should not include feature work.
  - Execute after M5 backend foundation tasks to avoid churn/conflicts.

## Mandatory verify gates

- Mobile lint command
- Mobile typecheck command
- Mobile test command
- Targeted test execution from new test location(s)
- Documentation updates for `docs/specs/06-testing-strategy.md` and `docs/specs/09-project-structure.md`

## Evidence

- Before/after test layout summary.
- Test command results summary (including targeted runs from new locations).
- Config/script change summary.
- Manual verification summary (required when CI is absent/partial):
  - any remaining manual checks or known path-related caveats.

## Completion note

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone/follow-up tracking note in the same session.
