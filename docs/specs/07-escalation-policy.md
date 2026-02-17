# Escalation Policy (Human-in-the-Loop)

## Purpose

Define when execution must stop and request human input, and standardize the handoff artifact used to unblock work.

## Applicability

This policy applies only to `execution mode` sessions (implementation/testing/verification work).

It does not apply to `discussion mode` sessions (brainstorming/spec drafting).

## Interaction mode handling

1. `interactive` (default): escalate by creating the artifact and requesting a decision in the current chat.
2. `non_interactive`: escalate by creating the artifact, marking task `blocked`, and ending execution without further retries.

Precedence for interaction mode:

1. Explicit chat instruction from the human.
2. Task card metadata if present.
3. Default to `interactive` when unspecified.

Conflict rule: if chat instruction and task card metadata differ, follow chat instruction.

## Escalation triggers

### Trigger A: Missing critical prerequisites (immediate)

Escalate immediately with no retries when any required execution prerequisite is missing, including:

1. No active task card.
2. No active milestone spec.
3. Missing required parent references/context packet.
4. Missing environment baseline required to run defined verify gates.

### Trigger B: Verify gate failure after retry budget

Escalate when mandatory verify gates still fail after `3` full attempts.

Attempt definition:

1. Apply a fix.
2. Re-run all mandatory verify gates for the task.
3. Record outcome and next hypothesis.

### Trigger C: Repeated failure with no new hypothesis (early)

Escalate early before attempt 3 when the same failure signature repeats for `2` consecutive attempts and no materially new debugging hypothesis exists.

## Escalation actions

When a trigger fires:

1. Stop feature implementation changes.
2. Create escalation note using `docs/specs/templates/escalation-note-template.md`.
3. Save note at:
   - `docs/tasks/escalations/E-<task-id>-<YYYYMMDD-HHMM>.md` when an active task card exists.
   - `docs/tasks/escalations/E-UNSCOPED-<YYYYMMDD-HHMM>.md` when no active task card exists.
4. Update active task card only if one exists:
   - Status -> `blocked`
   - Add escalation link
   - Summarize blocker in completion note
   - If no task card exists, record task-card update as `n/a` in the escalation note.
5. Request a human decision (interactive) or exit and await human input (non_interactive).

## Human response contract

Execution resumes only after a human decision is recorded in the escalation note or task card, including:

1. Selected path forward.
2. Any constraints or scope changes.
3. Approval to continue retries or defer the task.

