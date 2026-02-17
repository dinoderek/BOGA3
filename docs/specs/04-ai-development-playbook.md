# AI Development Playbook (v0)

## Purpose

Define the minimum scaffolding required before feature development, and standardize how AI sessions consume project context.

## Session modes

1. `Discussion mode`: brainstorming/spec design only. No code edits, test runs, or merge readiness checks. Output will generally be MD product or technical or task files.
2. `Execution mode`: buold session. Build code for delivery, runs tests, or validates merge readiness.

Rule: strict gatekeeper checks, verify gates, and escalation rules apply only in `execution mode`.

## Session interaction mode

1. `interactive` (default): human is available for clarifications during execution.
2. `non_interactive`: human is not available until the session exits.

Source of truth:

1. Explicit chat instruction from the human.
2. Task card metadata if present.
3. Default to `interactive` when unspecified.

Conflict rule: if chat instruction and task card metadata differ, follow chat instruction.

## Minimum scaffolding before Feature 1

1. Project directives/specs exist and are current:
   - `docs/specs/README.md`
   - `docs/specs/00-mvp-deliverables.md`
   - `docs/specs/03-technical-architecture.md`
   - `docs/specs/06-testing-strategy.md`
2. This playbook exists and is followed.
3. A milestone spec exists for the active milestone.
4. A task card exists for the active coding session.

## Reference hierarchy (source-of-truth chain)

1. Project level:
   - `docs/specs/README.md`
   - `docs/specs/03-technical-architecture.md`
   - `docs/specs/06-testing-strategy.md`
2. MVP level:
   - `docs/specs/00-mvp-deliverables.md`
3. Milestone level:
   - `docs/specs/milestones/<milestone-id>.md`
4. Task level:
   - `docs/tasks/<task-id>.md`

Rule: each lower level must link to its parent(s).
Rule: each lower level may add detail but must not override or relax parent-level constraints.

## Delivery workflow

1. Select one MVP milestone from `docs/specs/00-mvp-deliverables.md`.
2. Write a milestone spec using `docs/specs/templates/milestone-spec-template.md`.
3. Break milestone spec into small task cards using `docs/specs/templates/task-card-template.md`.
4. Execute one task card per AI session (or a tightly related pair only).
5. Update task status and decision log at end of session.

## Task execution protocol (quality-first)

Use this sequence for every task card:

1. Plan:
   - Confirm acceptance criteria.
   - Confirm required tests and commands.
2. Red:
   - Write/update tests first.
   - Run targeted tests and confirm expected failures.
3. Green:
   - Implement minimum code needed for tests to pass.
4. Refactor:
   - Improve structure without changing behavior.
   - Re-run targeted tests.
5. Verify:
   - Run mandatory quality gates:
     - `npm run lint`
     - `npm run typecheck`
     - `npm run test`
   - Run task-specific checks if defined.
6. Closeout:
   - Update task completion note with outcomes and remaining risks.

## Milestone 0 bootstrap exception

This exception is temporary and applies only to Milestone 0 bootstrap tasks while verify scripts are not yet implemented.

Allowed temporary exemption condition:

1. `npm run lint`, `npm run typecheck`, and `npm run test` are missing or not runnable because the app scaffold and gate scripts are not implemented yet.

Required controls while exempt:

1. Task-specific structural checks (for example `rg`, file existence, and cross-reference checks) must still run and pass.
2. Acceptance criteria, red/green evidence, and closeout notes remain mandatory.
3. This exception does not relax escalation triggers for other blockers.

Expiry:

1. Remove this section in `docs/tasks/T-20260215-03-m0-testing-and-quality-gates.md` once verify scripts exist and pass on a clean local state.
2. After removal, strict verify enforcement returns to the default `lint + typecheck + test` gate requirement for all execution-mode tasks.

## Test and implementation session policy

Default:

1. Keep test creation and feature implementation in the same task/session using the protocol above.

Split into separate sessions only when complexity/risk justifies it:

1. Complex domain logic with many edge cases.
2. Large multi-screen UI flows.
3. High-risk refactors where behavior lock-in is needed first.

## Execution-mode context packet (strict gatekeeper)

Provide these references at execution start:

1. This playbook: `docs/specs/04-ai-development-playbook.md`
2. Active milestone spec
3. Active task card
4. Any changed parent specs

Strict gatekeeper rule: if any required artifact is missing, do not execute implementation. Mark task `blocked` and follow `docs/specs/07-escalation-policy.md`.

## Task card rules

1. Task card must include explicit references to:
   - Project directives
   - MVP deliverable
   - Milestone spec
2. Task card must define:
   - In-scope / out-of-scope
   - Acceptance criteria
   - Required tests
   - Allowed files/areas
3. Task card must end with a completion note:
   - What changed
   - What tests ran
   - What remains

## Automated feedback loops (before human review)

1. Local verification gates must pass (`lint`, `typecheck`, `test`).
2. CI verification gates must pass on the branch/PR.
3. Run an AI self-review pass against:
   - Acceptance criteria coverage
   - Test completeness
   - Offline requirements
   - Security/data access constraints
4. Human review starts only after loops above are green.

## Stop-ship conditions

Do not mark task complete if any condition is true:

1. Any required quality gate fails.
2. Acceptance criteria are partially unmet.
3. Required tests are missing or failing.
4. Regressions are detected and not explicitly accepted.

## Escalation protocol (human-in-the-loop)

Follow `docs/specs/07-escalation-policy.md` for blocked execution sessions.

Required triggers:

1. Critical execution prerequisites are missing -> immediate escalation (no retries).
2. Mandatory verify gates fail after `3` full verify attempts -> escalate.
3. Same failure signature repeats for `2` consecutive attempts without a new hypothesis -> escalate early.

Escalation artifact:

1. Write escalation note using `docs/specs/templates/escalation-note-template.md`.
2. Save note as:
   - `docs/tasks/escalations/E-<task-id>-<YYYYMMDD-HHMM>.md` when task card exists.
   - `docs/tasks/escalations/E-UNSCOPED-<YYYYMMDD-HHMM>.md` when no task card exists.
3. If task card exists, update status to `blocked` and link the escalation file.
4. Wait for human decision before resuming execution.

## Change discipline

1. If implementation changes architecture/testing behavior, update the relevant spec in the same session.
2. Record major decisions using `Date / Decision / Reason / Impact`.

## Decision log

- Date: 2026-02-13
- Decision: Manage AI delivery through a strict `Project -> MVP -> Milestone -> Task` reference chain.
- Reason: Improve AI context quality, reduce drift, and make work traceable.
- Impact: Every task becomes auditable and easier to continue across sessions.
- Date: 2026-02-13
- Decision: Execute every task with a mandatory `Plan -> Red -> Green -> Refactor -> Verify -> Closeout` protocol and pre-human automated feedback loops.
- Reason: Make quality and test discipline non-optional in AI-assisted implementation.
- Impact: Reduces regressions and increases reliability of delivered changes.
- Date: 2026-02-15
- Decision: Apply strict gatekeeper checks only in `execution mode`, with mandatory human-in-the-loop escalation for blocked tasks.
- Reason: Preserve flexibility for discussion sessions while preventing wasted cycles during implementation.
- Impact: Clear stop rules and handoff artifacts reduce thrash and improve unblock speed.
- Date: 2026-02-17
- Decision: Add a temporary Milestone 0 bootstrap exception for missing verify scripts, with mandatory removal in `T-20260215-03`.
- Reason: Allow foundational setup to proceed before quality scripts exist without weakening long-term enforcement.
- Impact: M0 bootstrap tasks can execute with bounded exceptions; strict verify gates are restored after gate implementation.
