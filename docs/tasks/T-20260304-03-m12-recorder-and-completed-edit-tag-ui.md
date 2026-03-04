---
task_id: T-20260304-03
milestone_id: "M12"
status: planned
ui_impact: "yes"
areas: "frontend|docs"
runtimes: "docs|node|expo|maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/milestones/M12-exercise-tags.md,docs/specs/ui/screen-map.md,docs/specs/ui/ux-rules.md,docs/specs/ui/components-catalog.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-03`
- Title: M12 recorder and completed-edit tag UI
- Status: `planned`
- File location rule:
  - author active cards in `docs/tasks/T-20260304-03-m12-recorder-and-completed-edit-tag-ui.md`
  - move the file to `docs/tasks/complete/T-20260304-03-m12-recorder-and-completed-edit-tag-ui.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-03-04`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M12-exercise-tags.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- Project structure: `docs/specs/09-project-structure.md`
- UI docs bundle index: `docs/specs/ui/README.md`
- UI screen map: `docs/specs/ui/screen-map.md`
- UI navigation contract: `docs/specs/ui/navigation-contract.md`
- UI components catalog: `docs/specs/ui/components-catalog.md`
- UI UX rules: `docs/specs/ui/ux-rules.md`
- Source brainstorm: `docs/brainstorms/010.ExerciseTags.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ ce40da15ad9ef663b0e6608bbb9a5b1a49bd3f9c`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `no` (`git fetch origin main` completed during planning, but local `main` remained behind `origin/main`)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/ui/README.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/milestones/M12-exercise-tags.md`
  - `docs/brainstorms/010.ExerciseTags.md`
- Code/docs inventory freshness checks run:
  - `apps/mobile/app/session-recorder.tsx` - reviewed current recorder modal/picker/action-menu shape
  - `apps/mobile/components/session-recorder/session-content-layout.tsx` - reviewed shared exercise-card layout reuse surface
  - `docs/specs/ui/screen-map.md` and `docs/specs/ui/ux-rules.md` - reviewed current authoritative screen/modal semantics
- Known stale references or assumptions (must be explicit; write `none` if none):
  - assumes schema and repository tasks land first so UI can consume stable tag APIs and durable `exercise_definition_id`
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260304-03-m12-recorder-and-completed-edit-tag-ui.md`

## Objective

Add fast, low-friction exercise-tag interactions to the session recorder and completed-session edit flow, including tag chips, add-tag selection/creation, and manage-tags rename/delete/undelete interactions.

## Scope

### In scope

- Render assigned tags as compact chips on logged exercise cards in `session-recorder`.
- Add an add-tag affordance per logged exercise.
- Implement an in-route add-tag modal/sheet that supports:
  - search/filter within tags for the current exercise definition
  - selecting an existing tag
  - creating a new tag inline
  - opening manage-tags mode
- Implement manage-tags UI that supports:
  - rename
  - soft-delete
  - show/hide deleted tags
  - undelete
- Support fast removal of an assigned tag from the current logged exercise.
- Make the same tag attach/remove interactions available in completed-session edit mode where exercise editing is already supported.
- Extract or reuse shared UI components only where it reduces duplication materially.

### Out of scope

- New standalone routes for tag management.
- Analytics/reporting UI.
- Global tag administration across all exercises.
- Backend sync/API work.

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

1. Flow name: Add existing tag to a logged exercise
   - Trigger: User is logging an exercise and wants to record a known setup/context variant.
   - Steps: Tap `Add tag` -> search/filter existing tags for that exercise -> select a tag.
   - Success outcome: The selected tag appears immediately as a chip on the exercise card.
   - Failure/edge outcome: If tag suggestions fail to load, the modal shows inline error feedback without closing the recorder.
2. Flow name: Create a new tag inline
   - Trigger: User types a label that does not already exist for the current exercise definition.
   - Steps: Tap `Add tag` -> type a new tag -> choose the create action.
   - Success outcome: The new tag is created, assigned, and rendered immediately on the exercise card.
   - Failure/edge outcome: Blank or duplicate-normalized input shows inline validation and does not create a tag.
3. Flow name: Manage tags for an exercise definition
   - Trigger: User wants to rename, delete, or restore tags for the current exercise definition.
   - Steps: Open add-tag flow -> enter manage-tags mode -> rename, delete, or undelete a tag -> return to add-tag flow or close.
   - Success outcome: Updated tag labels/availability are reflected immediately in the current recorder context.
   - Failure/edge outcome: Rename-to-duplicate and invalid edit attempts show inline validation and leave the manage view usable.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Keep tag chips compact and secondary to the exercise name and set logging controls.
- Keep `Add tag` quick to reach from the exercise header; avoid burying it in the kebab menu.
- Add-tag and manage-tags interactions should stay in-route modal/sheet state, consistent with current recorder semantics.
- Deleting a tag definition is a management action, not a chip-removal action; chip removal only removes the current assignment.
- Use existing tokens/primitives for cards, buttons, text, and modal surfaces; avoid route-local raw colors or bespoke spacing systems.

## Acceptance criteria

1. Logged exercise cards in `session-recorder` show assigned tags as chips beneath the exercise header.
2. The add-tag interaction lets the user search existing tags for the current exercise definition and assign one without leaving the recorder.
3. The add-tag interaction lets the user create a new tag inline when no exact normalized match exists.
4. The manage-tags interaction supports rename, soft-delete, show/hide deleted tags, and undelete.
5. Removing a tag chip from a logged exercise removes only the current assignment.
6. Completed-session edit mode supports the same tag attach/remove behavior for editable logged exercises.
7. Screen UI uses documented tokens/primitives/shared components for common buttons/text/layout/list patterns, or records a justified exception.
8. No raw color literals are introduced in screen files unless explicitly allowed by the task and documented with rationale.
9. Relevant `docs/specs/ui/*.md` docs are updated in the same task (or explicit `no update` rationale is recorded in `Docs touched`).
10. `docs/specs/ui/navigation-contract.md` is updated only if route paths, params, or transitions change; otherwise closeout must record the explicit no-update rationale.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M12-exercise-tags.md` - keep milestone task state and final UI contract aligned
  - `docs/specs/ui/screen-map.md` - session-recorder key state inventory changes if tag modals/manage states become part of the screen contract
  - `docs/specs/ui/ux-rules.md` - modal, chip, and management-action semantics for tag interactions
  - `docs/specs/ui/components-catalog.md` - document any new reusable tag-related component or shared recorder component expansion
- If `UI Impact = yes`, complete all of the following:
  - Canonical UI docs maintenance trigger map lives in `docs/specs/ui/README.md` (`Maintenance rules`).
  - UI docs update required?: `yes`
  - If `yes`, list exact files under `docs/specs/ui/` and why, mapped to that canonical trigger map:
    - `docs/specs/ui/screen-map.md` - screen state set change
    - `docs/specs/ui/ux-rules.md` - UI semantics/pattern change
    - `docs/specs/ui/components-catalog.md` - reusable component inventory change if a shared tag modal/chip component is introduced
  - `docs/specs/ui/navigation-contract.md`:
    - expected update posture: `no` by default
    - rationale: current plan keeps tag interactions as in-route modal state, not route/query/transition changes
  - Tokens/primitives compliance statement (required for UI tasks):
    - Reuse plan: `UiSurface`, `UiText`, `UiButton`, existing session-recorder shared layout/components, and existing modal treatment patterns already used in recorder/catalog flows
    - Exceptions (raw literals or screen-local one-offs), if any: none expected; any exception must be documented with file + rationale at closeout
  - UI artifacts/screenshots expectation (required to state for UI tasks):
    - Required by `docs/specs/08-ux-delivery-standard.md` or task scope?: `yes`
    - Planned captures/artifacts (if required):
      - recorder exercise card with assigned tag chips
      - add-tag modal with filtered suggestions
      - manage-tags modal showing rename/delete/undelete state
      - completed-edit mode with tag interaction visible
    - If not required, why optional/non-blocking here:
      - `N/A`

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted React Native Testing Library coverage for recorder tag flows and completed-edit mode
  - `npm run test -- --runInBand app/__tests__/session-recorder-screen.test.tsx app/__tests__/session-recorder-interactions.test.tsx app/__tests__/completed-session-detail-screen.test.tsx`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Test layers covered:
  - UI/component
  - interaction/integration
  - real simulator smoke when required
- Execution triggers:
  - always run targeted UI tests during implementation
  - run `./scripts/quality-fast.sh frontend` at closeout
  - run `./scripts/quality-slow.sh frontend` at closeout because this task changes a core recorder interaction surface
- Slow-gate triggers (required when `quality-slow` may apply; state `N/A` only if truly not applicable):
  - required for this task because it changes user-facing recorder UI and completed-edit interaction on a primary screen
- Hosted/deployed smoke ownership (required for backend/deployment work; name the owning task if deferred):
  - `N/A`
- CI/manual posture note (required when CI is absent or partial):
  - no CI is configured; local targeted tests, `quality-fast`, and `quality-slow frontend` are the expected proof path
- Notes:
  - if the implementation lands entirely within existing in-route modal state, no navigation-contract update should be made unless code proves otherwise

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/components/session-recorder/**`
  - optional new shared components under `apps/mobile/components/session-recorder/` or another existing canonical shared UI folder
  - targeted tests under `apps/mobile/app/__tests__/`
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - no new top-level paths expected; keep shared tag UI under an existing canonical component folder if extraction is justified
- Constraints/assumptions:
  - do not introduce a new route for tag management unless a later explicit decision changes the contract
  - keep add-tag fast path separate from management actions so the recorder does not become admin-heavy

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- If a standard gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/T-20260304-03-m12-recorder-and-completed-edit-tag-ui.md`
- Additional gate(s), if any:
  - targeted RNTL test command(s) for recorder and completed-edit flows

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Targeted test results for add-tag, create-tag, rename/delete/undelete, and chip-remove flows
- `quality-slow frontend` run summary and artifact root if executed
- UI/UX task visual artifacts note:
  - include the planned captures listed in `Docs touched`, or record why an expected artifact was not produced
- Manual verification summary (required when CI is absent/partial):
  - confirm tag interactions remain usable in both active recorder mode and completed-edit mode
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
- For UI/UX tasks, update the relevant `docs/specs/ui/*.md` files (or record explicit `no update` rationale) and keep entries synthetic/overview-first.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260304-03-m12-recorder-and-completed-edit-tag-ui.md` (or document why `N/A`) before handoff.
