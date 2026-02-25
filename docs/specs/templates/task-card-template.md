# Task Card Template

## Task metadata

- Task ID:
- Title:
- Status: `planned | in_progress | completed | blocked`
- Session date:
- Session interaction mode: `interactive (default) | non_interactive`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#...`
- Milestone spec: `docs/specs/milestones/<milestone-id>.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md` (always load for context; update only when task changes paths/layout/conventions)
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`

## Objective

What this session must accomplish.

## Scope

### In scope

- 

### Out of scope

- 

## UX Contract (UI/UX tasks only; remove this entire section for non-UX tasks)

### Key user flows (minimal template)

1. Flow name:
   - Trigger:
   - Steps:
   - Success outcome:
   - Failure/edge outcome:
2. Flow name:
   - Trigger:
   - Steps:
   - Success outcome:
   - Failure/edge outcome:

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- 

## Acceptance criteria

1. 
2. 
3. 

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
- CI/manual posture note (required when CI is absent or partial):
- Notes:

## Implementation notes

- Planned files/areas allowed to change:
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
- Constraints/assumptions:

## Mandatory verify gates

- `npm run lint` (or runtime-appropriate equivalent)
- `npm run typecheck` (or runtime-appropriate equivalent)
- `npm run test` (or runtime-appropriate equivalent)
- Additional gate(s), if any:

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- 
- Manual verification summary (required when CI is absent/partial):

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
