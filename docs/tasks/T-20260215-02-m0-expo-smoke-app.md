# Task Card

## Task metadata

- Task ID: `T-20260215-02`
- Title: Create Expo Router smoke app in `apps/mobile`
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

Bootstrap the Expo Router TypeScript app at `apps/mobile` and ensure root route `/` renders the baseline message `Milestone 0 foundation ready`.

## Scope

### In scope

- Scaffold Expo app at `apps/mobile`.
- Ensure Expo Router entry structure is correct.
- Implement baseline root route message.
- Add minimal README run instructions for local startup.

### Out of scope

- Jest/test configuration.
- Lint/typecheck/test scripts implementation.
- CI integration.

## Acceptance criteria

1. `apps/mobile` exists and installs successfully.
2. App starts with Expo and root route is reachable.
3. Root route displays exact text: `Milestone 0 foundation ready`.
4. Route/file structure follows Expo Router conventions.

## Delivery split mode

- Mode: `split`
- Rationale: Foundation app scaffold should land before test/gate wiring to keep bootstrap failures isolated.

If `split`, define cards:

- Test-first card: `N/A` for this card.
- Implementation card: `T-20260215-02`

## Test plan

### Required tests

1. Manual runtime smoke check in Expo Go/simulator for root message.
2. Static check that route path `/` resolves to root screen file.

### Red phase (expected failing tests)

- Target command(s): `test -d apps/mobile`
- Expected failure reason: App directory does not exist before scaffold.

### Green phase (expected passing tests)

- Target command(s): `test -d apps/mobile && rg -n "Milestone 0 foundation ready" apps/mobile`
- Pass criteria: Directory exists and exact string is present in root route.

### Evidence to capture

- Command(s) run: `npx create-expo-app ...`, `npx expo start --offline` (or equivalent), `rg`, `git diff`
- Result summary: App scaffolded and message visible.

## Implementation notes

- Planned files/areas allowed to change: `apps/mobile/**`
- Constraints/assumptions:
  - Use Expo Router TypeScript starter.
  - Keep implementation minimal; no extra features.

## Mandatory verify gates

- `npm run lint` (temporarily exempt if not yet implemented; per bootstrap exception)
- `npm run typecheck` (temporarily exempt if not yet implemented; per bootstrap exception)
- `npm run test` (temporarily exempt if not yet implemented; per bootstrap exception)
- Additional gate(s), if any: App startup smoke check must pass

## Escalation settings

- Max verify attempts before escalation: `3` (default)
- Escalation template: `docs/specs/templates/escalation-note-template.md`
- Escalation file path (if blocked): `docs/tasks/escalations/E-T-20260215-02-<YYYYMMDD-HHMM>.md`

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
