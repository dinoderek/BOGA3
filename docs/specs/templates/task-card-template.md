# Task Card Template

## Task metadata

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
- Notes:

## Implementation notes

- Planned files/areas allowed to change:
- Constraints/assumptions:

## Mandatory verify gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- Additional gate(s), if any:

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- 

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- 
