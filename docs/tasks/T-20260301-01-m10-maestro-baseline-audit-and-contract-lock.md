---
task_id: T-20260301-01
milestone_id: "M10"
status: planned
ui_impact: "no"
areas: "docs"
runtimes: "docs"
gates_fast: "N/A"
gates_slow: "N/A"
docs_touched: "docs/specs/README.md,docs/specs/11-maestro-runtime-and-testing-conventions.md,docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260301-01`
- Title: M10 Maestro baseline audit and contract lock
- Status: `planned`
- Session date: `2026-03-01`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - `apps/mobile/.maestro/flows/**` inventory
  - `apps/mobile/scripts/*maestro*` and `apps/mobile/scripts/ios-sim-boot.sh`
  - `apps/mobile/app.json`
  - `apps/mobile/eas.json`
  - current runbook docs under `apps/mobile/README-maestro.md` and `apps/mobile/README_HUMAN_TESTING.md`
- Known stale references or assumptions:
  - current runbooks contain stale absolute workspace paths and should not be treated as authoritative until refreshed
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260301-01-m10-maestro-baseline-audit-and-contract-lock.md`

## Objective

Create the authoritative source-of-truth Maestro runtime/testing contract for M10 by documenting the verified current implementation, locking the target runtime model, and choosing the exact canonical doc/config surfaces future tasks will implement against.

## Scope

### In scope

- Re-open and verify the current Maestro implementation in code rather than relying on historical docs.
- Create `docs/specs/11-maestro-runtime-and-testing-conventions.md` as the authoritative project-level Maestro doc.
- Record current-state facts with code references:
  - current flows,
  - current runner behavior,
  - current simulator helper behavior,
  - current slot-lock behavior,
  - current Expo Go assumptions,
  - current config/documentation gaps.
- Lock exact M10 contracts for:
  - authoritative doc path,
  - local config file path and sample-file path,
  - shared dev-build artifact concept,
  - runtime state/log file expectations,
  - provision/launch/teardown script surface,
  - reset taxonomy terminology.
- Rationalize the current Maestro documentation set:
  - decide which doc is the single source of truth,
  - decide which existing runbooks become thin operational entrypoints,
  - identify redundant or stale Maestro docs that should be removed or materially reduced in later M10 tasks.
- Update `docs/specs/README.md` so the new Maestro doc is discoverable.
- Apply any consistency updates needed in the M10 milestone spec after the contract doc is written.

### Out of scope

- Implementing build scripts.
- Implementing simulator provisioning or launch scripts.
- App-side harness or Maestro flow changes.
- Testing-strategy/playbook updates beyond minimal cross-linking needed for the new canonical doc to be discoverable.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. `docs/specs/11-maestro-runtime-and-testing-conventions.md` exists and is explicitly marked as the authoritative Maestro runtime/testing contract.
2. The new doc distinguishes verified current-state behavior from target M10 behavior and cites the concrete code paths used for verification.
3. The doc locks the exact config/runtime terminology future M10 tasks will implement, including config file naming and reset taxonomy.
4. The doc explicitly defines the documentation ownership model: which file is authoritative, which files are secondary runbooks, and which existing docs are redundant/stale.
5. `docs/specs/README.md` links to the new Maestro doc.
6. The M10 milestone spec remains consistent with the new authoritative contract doc.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md` - new authoritative Maestro runtime/testing contract
  - `docs/specs/README.md` - add the new canonical spec doc to the file map
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md` - consistency pass after contract lock
  - `apps/mobile/README-maestro.md` - only if needed to convert it immediately into a thin entrypoint that points back to the authoritative spec

## Testing and verification approach

- Planned checks/commands:
  - `rg` sanity checks for current Maestro/Expo Go assumptions across `apps/mobile/.maestro/**`, `apps/mobile/scripts/**`, and runbooks
  - path/reference sanity review for all docs touched
- Standard local gate usage:
  - `./scripts/quality-fast.sh`: `N/A (docs-only task)`
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A (docs-only task)`
- Test layers covered: docs consistency + code-reference verification
- Execution triggers: always
- Slow-gate triggers: `N/A`
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI configured; verification is manual in-task

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/README.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
- Project structure impact:
  - adds one new project-level spec doc under `docs/specs/`
- Constraints/assumptions:
  - keep the doc synthetic and contract-focused rather than duplicating script source wholesale

## Mandatory verify gates

- Standard local fast gate: `N/A (docs-only)`
- Standard local slow gate: `N/A (docs-only)`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260301-01-m10-maestro-baseline-audit-and-contract-lock.md`

## Evidence

- Summary of verified current Maestro behaviors with the code files inspected.
- Summary of locked M10 contracts for config/build/runtime/reset terminology.
- Summary of documentation ownership decisions and redundant-doc cleanup plan.
- Manual verification summary (CI absent): docs path/reference sanity completed.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260301-01-m10-maestro-baseline-audit-and-contract-lock.md` (or document why `N/A`) before handoff.
