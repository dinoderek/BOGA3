# Task Card

## Task metadata

- Task ID: `T-20260215-03`
- Title: Add smoke test and implement quality gates in `apps/mobile`
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-15`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M0-technology-foundations.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Escalation policy: `docs/specs/07-escalation-policy.md`

## Objective

Implement Jest + `jest-expo` + React Native Testing Library smoke test coverage for the root message and make `lint`, `typecheck`, and `test` gates fully operational for local verification.

## Scope

### In scope

- Configure test runtime and setup files.
- Add smoke UI test asserting `Milestone 0 foundation ready` is displayed.
- Add package scripts: `lint`, `typecheck`, `test`, `quality`.
- Confirm gate scripts pass locally on clean state.
- Remove or expire bootstrap verify exception in playbook once gates are operational.

### Out of scope

- Additional feature development unrelated to smoke flow.
- Hosted CI workflow setup.
- Backend or sync implementation.

## Acceptance criteria

1. Smoke UI test exists and passes.
2. `npm run lint`, `npm run typecheck`, and `npm run test` run successfully in `apps/mobile`.
3. `npm run quality` runs all three gates and fails if any gate fails.
4. Execution policy is restored to strict verify enforcement after this task.

## Delivery split mode

- Mode: `combined (default)`
- Rationale: Test and gate wiring should be finalized in one session to avoid partial verification setups.

## Test plan

### Required tests

1. UI smoke test for root route message presence.
2. Gate-command behavior tests (pass on clean repo, fail on injected violation if validated).

### Red phase (expected failing tests)

- Target command(s): `npm run test -- --runInBand` (before smoke test exists)
- Expected failure reason: No valid smoke assertion/config yet.

### Green phase (expected passing tests)

- Target command(s):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run quality`
- Pass criteria: All commands succeed on clean working tree.

### Evidence to capture

- Command(s) run: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run quality`
- Result summary: All local gates green; smoke test confirms message visibility.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/**`, `docs/specs/04-ai-development-playbook.md`
- Constraints/assumptions:
  - Use `jest-expo` and React Native Testing Library for UI tests.
  - Keep smoke assertion stable via exact text contract.
  - After gates are live, bootstrap exception must be removed or marked expired.

## Mandatory verify gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- Additional gate(s), if any: `npm run quality`

## Escalation settings

- Max verify attempts before escalation: `3` (default)
- Escalation template: `docs/specs/templates/escalation-note-template.md`
- Escalation file path (if blocked): `docs/tasks/escalations/E-T-20260215-03-<YYYYMMDD-HHMM>.md`

## Automated review loop (before human review)

- AI self-review completed: `no`
- Checks reviewed:
  - Acceptance criteria coverage
  - Test completeness
  - Offline/edge-case handling
  - Security/data access impact
- CI status: `pending`

## Completion note (fill at end)

- What changed:
- Tests run and outcome:
- Verify gate outcomes:
- AI self-review findings/resolution:
- CI result:
- Follow-up tasks:
- Escalation link (if blocked):

## Decision log (if needed)

- Date:
- Decision:
- Reason:
- Impact:
