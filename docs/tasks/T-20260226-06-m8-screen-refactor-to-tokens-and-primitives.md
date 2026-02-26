# Task Card

## Task metadata

- Task ID: `T-20260226-06`
- Title: M8 refactor current screens to tokens/primitives (convergence without behavior changes)
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-26`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md` (always load for context; update only when task changes paths/layout/conventions)
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle (required):
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`

## Objective

Refactor the current mobile screens to use the new tokens/primitives and converge on documented UI rules while preserving behavior, data flows, and navigation contracts.

## Scope

### In scope

- Refactor current user-facing route screens to use tokens/primitives:
  - `apps/mobile/app/index.tsx`
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/session-recorder.tsx`
  - `apps/mobile/app/exercise-catalog.tsx`
  - `apps/mobile/app/completed-session/[sessionId].tsx`
  - plus any route-level shared layout surfaces if needed (`apps/mobile/app/_layout.tsx`, route wrappers)
- Replace repeated screen-local styles with primitives/tokens where appropriate.
- Consolidate or deprecate overlapping UI components where safe.
- Update tests impacted by render/structure changes while preserving behavior assertions.
- Update UI docs bundle to remain accurate after refactor.

### Out of scope

- Product behavior changes, new features, or navigation flow redesign.
- Backend/data contract changes unrelated to UI rendering.
- Major architecture changes beyond UI component organization and token/primitives adoption.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Use existing screens with unchanged behavior after UI convergence refactor
   - Trigger: User navigates current app routes and performs existing actions.
   - Steps: Open screens -> interact with existing controls -> observe same behavior/state transitions as before.
   - Success outcome: UX behavior remains intact while visuals/layout code become more consistent and reusable.
   - Failure/edge outcome: Any behavior regression is treated as a bug and fixed or explicitly blocked before task closeout.
2. Flow name: Render common patterns consistently across screens
   - Trigger: User compares repeated UI patterns (buttons, rows, headers, empty/error states) across screens.
   - Steps: Navigate across screens -> observe consistent semantics/spacing/typography treatments -> interact with controls.
   - Success outcome: Repeated patterns appear and behave consistently due to shared primitives/tokens.
   - Failure/edge outcome: Legitimate one-offs remain documented in UI docs/implementation notes rather than silently diverging.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Convergence, not redesign: keep visual intent close to current app.
- Prefer primitive composition over screen-local one-off components unless the pattern is genuinely unique.
- Preserve tap targets/readability and existing accessibility labels where present.
- Minimize route-level JSX churn that makes tests brittle without user-visible value.

## Acceptance criteria

1. Because the current app is within the small-app threshold, all current user-facing route screens are refactored to use tokens/primitives (not just a sample subset).
2. Screen refactors preserve existing navigation behavior, route params, and user-facing flows unless a change is explicitly approved and documented.
3. Repeated patterns (buttons/text/layout/list rows/empty-loading-error states as applicable) are migrated to primitives or documented one-offs with rationale.
4. Raw color literals in screen files are removed or reduced to documented exceptions consistent with the M8 guardrail approach.
5. Overlapping duplicate UI components are consolidated or deprecated when safe; any intentional duplicates remaining are documented with rationale.
6. UI docs are updated to reflect post-refactor reality:
   - `components-catalog` for primitive usage and deprecations
   - `ux-rules` for semantics/conventions changes
   - `screen-map` / `navigation-contract` if route structure/params/transitions changed (expected: no changes, but must be reviewed)
7. `apps/mobile` verification gates pass (`lint`, `typecheck`, `test`) and targeted UI regression tests cover refactor-sensitive flows.

## Docs touched (required)

- `docs/specs/ui/components-catalog.md` (required)
- `docs/specs/ui/ux-rules.md` (required)
- `docs/specs/ui/screen-map.md` (review + update if screen sections/states changed materially)
- `docs/specs/ui/navigation-contract.md` (review + update if routes/params/transitions changed)
- `docs/specs/ui/ui-pattern-audit.md` (optional follow-up note if major audit assumptions changed during refactor)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted screen tests for refactor-touched routes/components
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
  - UI guardrail check introduced in Task 04
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - UI integration/render regression tests
  - Static guardrail check for token/primitive compliance
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - targeted tests and guardrail checks during refactor batches; full `apps/mobile` gates at closeout
- CI/manual posture note (required when CI is absent or partial):
  - No CI configured; local tests plus manual visual/interaction verification are required.
- Notes:
  - If the task becomes too large for one session, split by screen groups while preserving the "all screens under small-app rule" milestone requirement via follow-up task cards.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/**` (excluding tests only when untouched)
  - `apps/mobile/components/**`
  - `apps/mobile/src/**` (UI-related helpers/types only as needed)
  - `apps/mobile/app/__tests__/**` and related UI tests
  - `docs/specs/ui/**`
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - No major structure changes expected beyond component consolidation within existing paths.
- Constraints/assumptions:
  - Keep behavior stable; do not mix in feature work.
  - Preserve or improve test coverage for the most reused/fragile flows.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any:
  - UI guardrail command introduced in `T-20260226-04`
  - Targeted route/screen tests for touched flows

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Before/after screenshots for representative refactored screens (happy path + at least one edge/error state where applicable).
- Test evidence for refactor-sensitive flows.
- Contract traceability notes mapping UI docs semantics/primitives to refactored screen usage.
- Manual verification summary (required when CI is absent/partial):
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable: `N/A`

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.

