# AI Development Playbook (v0)

## Purpose

Define the minimum scaffolding required before feature development, and standardize how AI sessions consume project context.


## Minimum scaffolding 

1. Project directives/specs exist and are current:
   - `docs/specs/README.md`
   - `docs/specs/00-mvp-deliverables.md`
   - `docs/specs/03-technical-architecture.md`
   - `docs/specs/06-testing-strategy.md`
   - `docs/specs/08-ux-delivery-standard.md` (required for UI tasks)
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
   - After each meaningful change, run the smallest relevant check (targeted test or gate) before continuing.
4. Refactor:
   - Improve structure without changing behavior.
   - Re-run targeted tests.
   - Re-run the smallest relevant gate after each refactor batch.
5. Verify:
   - Run mandatory quality gates:
     - `npm run lint`
     - `npm run typecheck`
     - `npm run test`
   - Run task-specific checks if defined.
   - Rule: do not defer all verification to the end; apply targeted checks during development and full gates at closeout.
6. Closeout:
   - Update task completion note with outcomes and remaining risks.

## Test and implementation session policy

Default:

1. Keep test creation and feature implementation in the same task/session using the protocol above.

If complexity/risk justifies it, create additional follow-up task cards:

1. Complex domain logic with many edge cases.
2. Large multi-screen UI flows.
3. High-risk refactors where behavior lock-in is needed first.

## Execution-mode context packet (strict gatekeeper)

Provide these references at execution start:

1. This playbook: `docs/specs/04-ai-development-playbook.md`
2. Active milestone spec
3. Active task card
4. Any changed parent specs
5. `docs/specs/08-ux-delivery-standard.md` (for UI tasks)

## Task card rules

1. Task card must include explicit references to:
   - Project directives
   - MVP deliverable
   - Milestone spec
2. Task card must define:
   - In-scope / out-of-scope
   - UX contract with key user flows (for UI tasks)
   - Acceptance criteria
   - Testing and verification approach (commands/checks)
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

Required triggers:

1. Critical execution prerequisites are missing -> immediate escalation (no retries).
2. Mandatory verify gates fail after `3` full verify attempts -> escalate.
3. Same failure signature repeats for `2` consecutive attempts without a new hypothesis -> escalate early.

Provide clear information to the human about the failure, what you tried to fix the failure, why the fixes failed and suggest next steps.

## Change discipline

1. If implementation changes architecture/testing behavior, update the relevant spec in the same session.
2. Record major decisions using `Date / Decision / Reason / Impact`.
