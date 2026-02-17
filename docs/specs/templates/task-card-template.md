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
- Escalation policy: `docs/specs/07-escalation-policy.md`

## Objective

What this session must accomplish.

## Scope

### In scope

- 

### Out of scope

- 

## Acceptance criteria

1. 
2. 
3. 

## Delivery split mode

- Mode: `combined (default) | split`
- Rationale:

If `split`, define cards:

- Test-first card:
- Implementation card:

## Test plan

### Required tests

1. 
2. 

### Red phase (expected failing tests)

- Target command(s):
- Expected failure reason:

### Green phase (expected passing tests)

- Target command(s):
- Pass criteria:

### Evidence to capture

- Command(s) run:
- Result summary:

## Implementation notes

- Planned files/areas allowed to change:
- Constraints/assumptions:

## Mandatory verify gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- Additional gate(s), if any:

## Escalation settings

- Max verify attempts before escalation: `3` (default)
- Escalation template: `docs/specs/templates/escalation-note-template.md`
- Escalation file path (if blocked): `docs/tasks/escalations/E-<task-id>-<YYYYMMDD-HHMM>.md`

## Automated review loop (before human review)

- AI self-review completed: `yes | no`
- Checks reviewed:
  - Acceptance criteria coverage
  - Test completeness
  - Offline/edge-case handling
  - Security/data access impact
- CI status: `pending | pass | fail`

## Completion note (fill at end)

- What changed:
- Tests run and outcome:
- Verify gate outcomes:
- AI self-review findings/resolution:
- CI result:
- Follow-up tasks:
- Escalation link (if blocked):
