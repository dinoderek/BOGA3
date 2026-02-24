# Task Card

## Task metadata

- Task ID: `T-20260224-04`
- Title: M6 historical exercise-mapping behavior options and decision prep
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-24`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#explicitly-deferred-after-mvp`
- Milestone spec: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Document the historical behavior options for edited exercise-to-muscle mappings (snapshot, versioned, recompute), compare tradeoffs, and define the implementation implications needed before future analytics work begins.

## Scope

### In scope

- Document the candidate historical behaviors:
  - snapshot at log time
  - versioned mappings
  - recompute using latest mapping
- Compare tradeoffs across:
  - implementation complexity
  - data storage cost
  - user expectations
  - analytics reproducibility
  - migration/sync impact
- Identify schema and API implications of each option at a high level.
- Recommend a follow-on decision path (for example, lock now vs defer until analytics milestone kickoff).
- Update milestone/spec references if the preferred option is narrowed or locked.

### Out of scope

- Implementing the chosen historical behavior in code.
- Analytics rollups or metric formulas.
- UI changes.
- Backend sync/API implementation.

## Acceptance criteria

1. The three candidate historical behaviors are documented and compared with explicit tradeoffs.
2. Each option includes high-level schema implications and migration risks.
3. A recommended decision path is recorded for the next implementation milestone (lock now vs defer with trigger).
4. `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md` is updated if decision status or options wording changes.
5. Follow-on tasks can use the document to avoid reopening the same framing discussion.

## Testing and verification approach

- Planned checks/commands:
  - editorial consistency pass across touched docs
  - link/reference sanity check for updated milestone/task docs
- Notes:
  - This is a docs/decision-prep task; no runtime code changes are expected.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
  - `docs/tasks/T-20260224-04-m6-historical-mapping-behavior-options.md`
  - optional follow-on spec docs if the decision is elevated beyond M6
- Constraints/assumptions:
  - Do not block M6 taxonomy/mapping/editing implementation on a fully finalized analytics design.
  - Keep the comparison concrete enough to drive schema decisions when analytics starts.

## Mandatory verify gates

- `N/A (docs-only task; no code runtime changes)`

## Evidence

- Option comparison summary with recommendation/next-step trigger.
- Updated milestone wording summary (if changed).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- Update parent milestone task breakdown/status in the same session.
