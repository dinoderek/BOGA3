# AI Development Playbook (v0)

## Purpose

Define the minimum scaffolding required before feature development, and standardize how AI sessions consume project context.


## Minimum scaffolding 

1. Project directives/specs exist and are current:
   - `docs/specs/README.md`
   - `docs/specs/00-mvp-deliverables.md`
   - `docs/specs/03-technical-architecture.md`
   - `docs/specs/06-testing-strategy.md`
   - `docs/specs/09-project-structure.md`
   - `docs/specs/08-ux-delivery-standard.md` (required for UI tasks)
2. This playbook exists and is followed.
3. A milestone spec exists for the active milestone.
4. A task card exists for the active coding session.

## Reference hierarchy (source-of-truth chain)

1. Project level:
   - `docs/specs/README.md`
   - `docs/specs/03-technical-architecture.md`
   - `docs/specs/06-testing-strategy.md`
   - `docs/specs/09-project-structure.md`
2. MVP level:
   - `docs/specs/00-mvp-deliverables.md`
3. Milestone level:
   - `docs/specs/milestones/<milestone-id>.md`
4. Task level:
   - `docs/tasks/<task-id>.md`

Rule: each lower level must link to its parent(s).
Rule: each lower level may add detail but must not override or relax parent-level constraints.

## Runtime terminology and gate profiles

Use these definitions when a task says "runtime", "runtime-specific gates", or "runtime-appropriate equivalents".

- `Runtime` (for this playbook):
  - an execution surface with its own process/toolchain and verification commands (not just a folder).
  - examples in this repo: Node/TS workspace (`npm` scripts), Expo mobile runtime + Maestro, local `Supabase` stack, `Supabase` Edge Functions (`Deno`), SQL/`pgTAP`, hosted deployment environments.
- `Runtime-specific gate`:
  - the smallest repeatable verification command(s) that meaningfully validate the changed runtime when default Node gates are not sufficient or not applicable.

Baseline gate profiles (task cards may tighten these):

1. `Node/TS workspace` (default)
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
2. `Supabase` local backend runtime (`supabase/**`, no backend Node workspace introduced)
   - local runtime bring-up (`supabase start` or project wrapper)
   - local migration/reset + seed (`supabase db reset` or project wrapper)
   - fast DB/schema check (`supabase db lint` and/or `supabase test db` when `pgTAP` exists)
   - local API/Edge smoke or contract checks (health/auth/RLS/API path as scoped by task)
3. `Supabase` Edge Functions with custom logic
   - `Deno` unit tests (`deno test`) for function logic (if present)
   - `Supabase-local` integration/contract tests against the real gateway/auth context
4. `Expo` mobile UI/runtime work
   - `apps/mobile` `lint` + `typecheck` + `test`
   - Maestro smoke flows when UI/runtime-sensitive changes require them (per `docs/specs/06-testing-strategy.md`)
5. Hosted/deployed environment changes
   - relevant local gates for the changed runtime(s)
   - hosted smoke validation (manual until CI exists; task card must name owner and trigger timing)

Rule: task cards must list the exact gate commands they require; this section only defines baseline expectations.

## Delivery workflow

1. Select one MVP milestone from `docs/specs/00-mvp-deliverables.md`.
2. Write a milestone spec using `docs/specs/templates/milestone-spec-template.md`.
3. Break milestone spec into small task cards using `docs/specs/templates/task-card-template.md`.
4. Execute one task card per AI session (or a tightly related pair only).
5. Update task and milestone docs at end of session:
   - set task `Status` (`completed` or `blocked`)
   - fill task `Completion note`
   - update milestone `Status` and task breakdown item states
   - update decision log entries when decisions changed
6. If a task introduces a new runtime, deployment surface, or test layer:
   - update `docs/specs/06-testing-strategy.md`,
   - update this playbook if execution/verification workflow changes,
   - update relevant template(s) if future tasks need new required fields or checks.

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
     - replace/add runtime-specific gates when the task is not Node-only (for example `supabase` CLI checks, `deno test`, `pgTAP`, Maestro smoke commands)
     - if `lint/typecheck/test` are not applicable for the introduced runtime (for example no Node/TS workspace was added for a `Supabase`-only task), document the `N/A` rationale and run runtime-specific equivalents instead
   - Run task-specific checks if defined.
   - Rule: do not defer all verification to the end; apply targeted checks during development and full gates at closeout.
6. Closeout:
   - Update task completion note with outcomes and remaining risks.
   - Update task `Status` in the task card.
   - Update milestone `Status` + task breakdown state in the milestone card before handoff.

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
5. `docs/specs/09-project-structure.md` (always load for context; update only when task changes paths/layout/conventions)
6. `docs/specs/08-ux-delivery-standard.md` (for UI tasks)
7. `docs/specs/10-api-authn-authz-guidelines.md` (for backend API/auth work and API-consuming integration tasks)

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
   - test-layer ownership and execution triggers for non-trivial backend/deployment/E2E work
   - hosted/deployed smoke validation ownership (or explicit task that owns it when deferred)
   - CI/manual verification posture when CI is absent or partial
   - project-structure impact (new paths/conventions or explicit no-structure-change decision)
   - Allowed files/areas
3. Task card must end with a completion note:
   - What changed
   - What tests ran
   - What remains
4. Task status must be updated in the same session as implementation:
   - `planned|in_progress -> completed` only when acceptance criteria + required gates are green.
   - otherwise set `blocked` with explicit reason and next action.

## Status update policy (mandatory)

Before ending any implementation session, AI must update both:

1. Active task card:
   - `Status`
   - `Completion note`
2. Active milestone card:
   - `Status` (or explicit unchanged rationale if milestone remains open)
   - task breakdown progress for touched tasks

Rule: do not consider a task done if code is complete but status fields were not updated.
Rule: if a task makes significant project-structure changes (for example adds/moves/removes top-level folders, moves canonical test locations, introduces a new workspace, or changes path conventions), update `docs/specs/09-project-structure.md` in the same session and summarize the change in the task completion note.

## Automated feedback loops (before human review)

1. Local verification gates must pass (`lint`, `typecheck`, `test`, or documented runtime-appropriate equivalents).
2. CI verification gates must pass on the branch/PR only when CI is configured for the repo/branch; otherwise mark this loop `N/A` and follow the manual/deferred verification posture in `Current CI posture`.
3. Run an AI self-review pass against:
   - Acceptance criteria coverage
   - Test completeness
   - Offline requirements
   - Security/data access constraints
4. Human review starts only after all applicable loops above are green (`CI` is currently `N/A` until configured).

## Current CI posture (2026-02-25)

1. No CI pipeline is currently configured for this repo.
2. Until CI exists:
   - local verification gates are mandatory,
   - task cards must clearly call out manual/deferred hosted checks,
   - completion notes must summarize manual verification evidence.
3. When CI is introduced, update this playbook and `docs/specs/06-testing-strategy.md` in the same task/session to reflect the new gate ownership.

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
2. If implementation makes significant project-structure changes, update `docs/specs/09-project-structure.md` in the same session.
3. Record major decisions using `Date / Decision / Reason / Impact`.
