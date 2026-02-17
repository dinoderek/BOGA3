# Task Card

## Task metadata

- Task ID: `T-20260215-03`
- Title: Add smoke test and implement quality gates in `apps/mobile`
- Status: `completed`
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
- Add package scripts: `lint`, `typecheck`, `test`.
- For each script verify that (1) You can run the script successfully, (2) You can parse the output of the script successfully, (3) the script does what it intends to do
- Confirm gate scripts pass locally on clean state.
- Update testing strategy and AI development strategy to enssure that quality gates are applied after each change.
- Remove bootstrap verify exception in playbook once gates are operational.

### Out of scope

- Additional feature development unrelated to smoke flow.
- Hosted CI workflow setup.
- Backend or sync implementation.

## Acceptance criteria

1. Smoke UI test exists and passes.
2. `npm run lint`, `npm run typecheck`, and `npm run test` run successfully in `apps/mobile`.
3. You the AI can run those commands successfully and parse their output successfully.
4. Update documentation so that execution policy is restored to strict verify enforcement after this task.

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
- Pass criteria: All commands succeed on clean working tree.

### Evidence to capture

- Command(s) run: `npm run lint`, `npm run typecheck`, `npm run test`
- Result summary: All local gates green; smoke test confirms message visibility.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/**`, `docs/specs/04-ai-development-playbook.md`
- Constraints/assumptions:
  - Use `jest-expo` and React Native Testing Library for UI tests.
  - Keep smoke assertion stable via exact text contract.
  - After gates are live, bootstrap exception must be removed.

## Mandatory verify gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Escalation settings

- Max verify attempts before escalation: `3` (default)
- Escalation template: `docs/specs/templates/escalation-note-template.md`
- Escalation file path (if blocked): `docs/tasks/escalations/E-T-20260215-03-<YYYYMMDD-HHMM>.md`

## Automated review loop (before human review)

- AI self-review completed: `yes`
- Checks reviewed:
  - Acceptance criteria coverage
  - Test completeness
  - Offline/edge-case handling
  - Security/data access impact
- CI status: `pending`

## Completion note (fill at end)

- What changed: Added runnable gate scripts in `apps/mobile/package.json` (`typecheck`, `test`), added Jest runtime config (`apps/mobile/jest.config.js`) and setup (`apps/mobile/jest.setup.ts`), added smoke UI test `apps/mobile/app/__tests__/index.test.tsx` asserting exact text `Milestone 0 foundation ready`, installed/pinned compatible test deps (`@testing-library/react-native@13.2.0`, `react-test-renderer@19.1.0`), removed Milestone 0 bootstrap exception from `docs/specs/04-ai-development-playbook.md`, and updated `docs/specs/06-testing-strategy.md` to require targeted checks after each meaningful change plus full closeout gates.
- Tests run and outcome: `npm run test -- --runInBand` passed with smoke test green (`1 passed`); intentional fail probe test (`app/__tests__/fail-probe.test.tsx`) failed as expected with assertion output, then removed and test returned green.
- Verify gate outcomes: Clean-state verify passed for `npm run lint`, `npm run typecheck`, `npm run test`. Fail probes validated behavior/output parsing for each gate: lint parse error via temporary `app/lint-probe.tsx`, TS type error via temporary `typecheck-probe.ts`, and intentional test assertion failure via temporary failing test; all probes were removed and final verify rerun passed.
- AI self-review findings/resolution: Acceptance criteria fully covered; dependency conflict during install resolved by pinning `react-test-renderer@19.1.0` to match app React `19.1.0`; no remaining functional gaps for task scope.
- CI result: `pending` (local gate implementation task; CI status not validated in this session).
- Follow-up tasks: none for Milestone 0 gate restoration; next work can proceed under strict verify enforcement.
- Escalation link (if blocked): `n/a`

