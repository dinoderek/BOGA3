# Task Card

## Task metadata

- Task ID: `T-20260226-04`
- Title: M8 lightweight UI guardrail enforcement (tokens/primitives compliance checks)
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-26`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md` (always load for context; update only when task changes paths/layout/conventions)
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`
- Tokens/primitives foundation (required): `docs/tasks/T-20260226-03-m8-ui-tokens-and-primitives-foundation.md`

## Objective

Add a minimal, practical enforcement layer that nudges UI work toward tokens/primitives and away from raw screen-local styling without creating heavy process or noisy false positives.

## Scope

### In scope

- Choose and implement one lightweight enforcement approach (or a small combination), such as:
  - lint rule(s)
  - repo script/check
  - codemod-assisted review check
  - documented convention with a repeatable detection script
- Scope checks to UI files where signal is high (for example screens/components) and define exceptions/allowlists.
- Enforce or warn on high-value cases first (for example raw color literals in screens).
- Document how to run/read the check and how to request/record exceptions.

### Out of scope

- Perfect/static-proof enforcement of all styling rules.
- Rewriting all legacy UI code to satisfy the new guardrails (Task 06 owns migrations).
- Template/playbook updates for task-level enforcement wording (Tasks 07/08).

## UX Contract

### Key user flows (minimal template)

1. Flow name: Developer runs UI guardrail check
   - Trigger: Local lint/check command is run during UI development or review.
   - Steps: Command scans scoped UI files -> reports violations/warnings -> developer fixes or documents exceptions.
   - Success outcome: High-signal issues (raw literals/ad hoc patterns) are caught early with actionable output.
   - Failure/edge outcome: Legitimate exceptions can be allowlisted/documented without disabling the entire guardrail.
2. Flow name: Reviewer validates UI task compliance
   - Trigger: Reviewer checks a UI-affecting change.
   - Steps: Reviewer runs/reads guardrail output -> verifies exceptions are documented -> confirms token/primitive usage.
   - Success outcome: Review is faster and more consistent.
   - Failure/edge outcome: If the check is noisy, scope is tightened and exceptions are documented explicitly.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Prefer high-signal checks over broad style policing.
- Start with color/token compliance and obvious ad hoc screen styles; expand only if low-noise.
- Output should be clear enough for AI/humans to act on without manual interpretation.

## Acceptance criteria

1. At least one repeatable UI guardrail check exists and can be run locally (lint rule or script).
2. The guardrail targets UI files (screens/components) and explicitly excludes/allowlists token source files and justified exceptions.
3. The guardrail flags at least one high-value anti-pattern (minimum: raw color literals in screen files, or documented equivalent if repo constraints require a different first rule).
4. The guardrail run instructions and exception process are documented in a project doc (UI docs and/or task template/playbook-linked docs).
5. The check is demonstrated on at least one sample violation/fix or validated against current refactor targets.
6. `apps/mobile` verification gates pass after introducing the guardrail tooling/config.

## Docs touched (required)

- `docs/specs/ui/ux-rules.md` (if guardrail rules are part of UI semantics/conventions)
- `docs/specs/ui/components-catalog.md` (only if primitive usage guidance is clarified there)
- `docs/specs/04-ai-development-playbook.md` (only if command/workflow changes are introduced here; otherwise Task 07 owns playbook edits)
- `docs/specs/06-testing-strategy.md` (only if a new canonical UI check is added to repeatable verification strategy)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - run the new UI guardrail check on scoped files
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - Static analysis/tooling validation
  - Regression via existing `apps/mobile` gates
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always` for UI-affecting code changes once introduced
- CI/manual posture note (required when CI is absent or partial):
  - No CI configured; the guardrail is local/manual until CI exists.
- Notes:
  - Keep scope and failure modes simple; this is a nudge, not a blocker for every legacy file on day one.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/package.json`
  - `apps/mobile/eslint*` / config files / scripts
  - `apps/mobile/scripts/**` (if implementing a custom check)
  - `docs/specs/ui/**` (usage + exceptions documentation)
  - `docs/specs/06-testing-strategy.md` and/or `docs/specs/04-ai-development-playbook.md` (only if verification workflow changes)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - No major structure changes expected; small script/config additions only.
- Constraints/assumptions:
  - Avoid a check that immediately fails the entire current codebase without an incremental adoption path.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any:
  - Run the new UI guardrail command directly and capture output summary.

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Guardrail command output summary (including at least one real finding or explicit "clean" result on scoped files).
- Documentation snippet/location for exceptions and usage.
- Manual verification summary (required when CI is absent/partial):
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable: `N/A`

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.

