# Task Card

## Task metadata

- Task ID: `T-20260226-08`
- Title: M8 update task template(s) with UI impact checks and docs-update enforcement
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
- Template targets (required):
  - `docs/specs/templates/task-card-template.md`
  - `docs/tasks/README.md`
- Playbook context (recommended): `docs/specs/04-ai-development-playbook.md`

## Objective

Modify the task template(s) so UI-affecting tasks explicitly declare UI impact, require tokens/primitives compliance and UI-doc updates, and include a `Docs touched` section with clear mapping rules.

## Scope

### In scope

- Update `docs/specs/templates/task-card-template.md` to add a `UI Impact` checklist/decision point.
- Add UI-task requirements to the template when `UI Impact = yes`, including:
  - tokens/primitives compliance requirement
  - docs-update requirement (which docs to update by change type)
  - screenshots/artifacts requirement if applicable (non-blocking unless already required by workflow)
- Add acceptance-criteria boilerplate for UI tasks:
  - no raw color literals in screens (unless explicitly allowed)
  - uses primitives for buttons/text/layout/list patterns
  - updated UI docs as applicable
  - navigation contract updated if routes/transitions changed
- Add a `Docs touched` section to the template.
- Add a mapping table/bullets for UI docs maintenance triggers.
- Update `docs/tasks/README.md` if needed so the new template expectations are discoverable.

### Out of scope

- Editing existing historical task cards retroactively (unless a small example is helpful and explicitly scoped).
- Changing milestone template requirements beyond small cross-links/notes.
- Adding heavyweight process gates that slow normal task authoring.

## Acceptance criteria

1. `docs/specs/templates/task-card-template.md` contains a clear `UI Impact` yes/no checkpoint (or equivalent gating mechanism) that is easy to apply in review.
2. When `UI Impact = yes`, the template requires:
   - tokens/primitives compliance statement
   - UI docs update requirements
   - `Docs touched` section completion
   - screenshots/artifacts requirement language that is optional/non-blocking unless already required elsewhere
3. The template includes UI acceptance boilerplate covering:
   - no raw color literals in screens (unless explicitly allowed)
   - use primitives for buttons/text/layout/list patterns
   - update `screen-map` / `navigation-contract` / `components-catalog` / `ux-rules` as applicable
   - update navigation contract when routes/transitions/params change
4. The template includes a concise mapping table or bullet guidance for when each UI doc must be updated.
5. The resulting template remains lightweight and review-enforceable (no heavy workflow additions).
6. `docs/tasks/README.md` is updated if needed to point task authors to the revised template expectations.

## Docs touched (required)

- `docs/specs/templates/task-card-template.md`
- `docs/tasks/README.md` (if needed)
- `docs/specs/04-ai-development-playbook.md` (only if template changes require aligned wording; otherwise Task 07 owns playbook edits)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - markdown review of template sections and placeholders
  - spot-check against at least one recent UI task card to confirm the template is usable
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - `N/A` (docs/template task)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always`
- CI/manual posture note (required when CI is absent or partial):
  - Repo has no CI; verification is local template usability review.
- Notes:
  - Keep the template additive and backwards-compatible enough for non-UI tasks (clear instructions to skip/remove UI-specific sections when not applicable).

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/templates/task-card-template.md`
  - `docs/tasks/README.md`
  - `docs/specs/04-ai-development-playbook.md` (only if wording alignment is required)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - No structure changes expected.
- Constraints/assumptions:
  - Avoid overfitting to M8 only; template changes should improve future UI task authoring across milestones.

## Mandatory verify gates

- `npm run lint` (or runtime-appropriate equivalent): `N/A` (docs/template task)
- `npm run typecheck` (or runtime-appropriate equivalent): `N/A` (docs/template task)
- `npm run test` (or runtime-appropriate equivalent): `N/A` (docs/template task)
- If any default gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Additional gate(s), if any:
  - Manual template walkthrough for one UI task scenario and one non-UI task scenario.

## Evidence

- Template diff summary showing new `UI Impact` gate, `Docs touched` section, and UI-doc mapping guidance.
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

