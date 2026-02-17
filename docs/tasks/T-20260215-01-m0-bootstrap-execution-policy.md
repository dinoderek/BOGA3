# Task Card

## Task metadata

- Task ID: `T-20260215-01`
- Title: Milestone 0 bootstrap policy exception and scaffolding prep
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-15`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M0-technology-foundations.md` (created in this task)
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Escalation policy: `docs/specs/07-escalation-policy.md`

## Objective

Define and document the temporary execution-policy relaxation that allows implementation sessions to proceed before quality gate commands exist, while preserving strict enforcement once gates are implemented.

## Scope

### In scope

- Create milestone spec `docs/specs/milestones/M0-technology-foundations.md`.
- Update `docs/specs/04-ai-development-playbook.md` with a Milestone 0 bootstrap exception.
- Define explicit expiry condition for the exception.
- Prepare follow-up task sequence for app scaffolding and gate implementation.

### Out of scope

- Creating application code.
- Installing dependencies.
- Running application tests or lint/typecheck gates.

## Acceptance criteria

1. Milestone spec exists and defines Milestone 0 scope and deliverables.
2. Playbook includes a temporary exception for missing verify commands during bootstrap.
3. Exception includes a concrete expiry trigger tied to gate implementation.
4. Remaining Milestone 0 work is split into actionable task cards.

## Delivery split mode

- Mode: `combined (default)`
- Rationale: This is a docs/policy-only session and does not need test/implementation split.

## Test plan

### Required tests

1. Structural doc validation by path and section presence.
2. Cross-reference validation that all new docs link to required parent artifacts.

### Red phase (expected failing tests)

- Target command(s): `rg -n "Milestone 0 bootstrap exception|expiry" docs/specs/04-ai-development-playbook.md`
- Expected failure reason: Section not present before edits.

### Green phase (expected passing tests)

- Target command(s): `rg -n "Milestone 0 bootstrap exception|expiry" docs/specs/04-ai-development-playbook.md`
- Pass criteria: Exception and expiry language are present and unambiguous.

### Evidence to capture

- Command(s) run: `rg`, `sed`, `git diff -- docs/specs docs/tasks`
- Result summary: Required sections and references added.

## Implementation notes

- Planned files/areas allowed to change: `docs/specs/*`, `docs/tasks/*`
- Constraints/assumptions:
  - Must not relax long-term quality standards.
  - Exception applies only until `npm run lint`, `npm run typecheck`, and `npm run test` exist and execute.

## Mandatory verify gates

- `npm run lint` (temporarily exempt for this task due missing app/gates)
- `npm run typecheck` (temporarily exempt for this task due missing app/gates)
- `npm run test` (temporarily exempt for this task due missing app/gates)
- Additional gate(s), if any: `rg`-based doc presence checks must pass

## Escalation settings

- Max verify attempts before escalation: `3` (default)
- Escalation template: `docs/specs/templates/escalation-note-template.md`
- Escalation file path (if blocked): `docs/tasks/escalations/E-T-20260215-01-<YYYYMMDD-HHMM>.md`

## Automated review loop (before human review)

- AI self-review completed: `yes`
- Checks reviewed:
  - Acceptance criteria coverage
  - Test completeness
  - Offline/edge-case handling
  - Security/data access impact
- CI status: `pending`

## Completion note (fill at end)

- What changed: Created `docs/specs/milestones/M0-technology-foundations.md`; added `Milestone 0 bootstrap exception` section with explicit expiry/removal condition in `docs/specs/04-ai-development-playbook.md`; validated task linkage for `T-20260215-02` and `T-20260215-03`.
- Tests run and outcome: `test -f docs/specs/milestones/M0-technology-foundations.md` (red fail before edits, green pass after edits); `rg -n "Milestone 0 bootstrap exception|expiry" docs/specs/04-ai-development-playbook.md` (red fail before edits, green pass after edits); cross-reference checks for milestone links in `docs/tasks/T-20260215-01-m0-bootstrap-execution-policy.md`, `docs/tasks/T-20260215-02-m0-expo-smoke-app.md`, and `docs/tasks/T-20260215-03-m0-testing-and-quality-gates.md` passed.
- Verify gate outcomes: `npm run lint`, `npm run typecheck`, `npm run test` marked temporarily exempt for this bootstrap policy task per the new Milestone 0 exception; required `rg`/structure/reference checks passed.
- AI self-review findings/resolution: Acceptance criteria fully covered; no policy conflicts with parent specs; exception is bounded by explicit expiry tied to `T-20260215-03`.
- CI result: `pending` (not configured for this docs-only bootstrap task).
- Follow-up tasks: `docs/tasks/T-20260215-02-m0-expo-smoke-app.md`, `docs/tasks/T-20260215-03-m0-testing-and-quality-gates.md`.
- Escalation link (if blocked): `n/a`
