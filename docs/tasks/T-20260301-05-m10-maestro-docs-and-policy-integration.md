---
task_id: T-20260301-05
milestone_id: "M10"
status: completed
ui_impact: "no"
areas: "docs"
runtimes: "docs"
gates_fast: "N/A"
gates_slow: "N/A"
docs_touched: "docs/specs/04-ai-development-playbook.md,docs/specs/06-testing-strategy.md,docs/specs/09-project-structure.md,apps/mobile/README-maestro.md,apps/mobile/README_HUMAN_TESTING.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260301-05`
- Title: M10 Maestro docs and policy integration
- Status: `completed`
- Session date: `2026-03-01`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- Maestro runtime contract: `docs/specs/11-maestro-runtime-and-testing-conventions.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ 2356e6d94b566b66928a0016a272c7cb40fe67e9`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git fetch origin main`; local `main` already matched `origin/main`)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - command/path sanity for implemented M10 scripts and flow entrypoints
  - runbook inventory under `apps/mobile/README-maestro.md` and `apps/mobile/README_HUMAN_TESTING.md`
- Known stale references or assumptions:
  - none expected once earlier M10 implementation tasks are complete; stale path/command findings must be fixed in this task rather than deferred
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260301-05-m10-maestro-docs-and-policy-integration.md`

## Objective

Finish M10 by aligning the shared docs and runbooks to the implemented runtime model so future sessions can discover the Maestro workflow from one authoritative spec and a small set of accurate operational guides.

## Scope

### In scope

- Update top-level policy docs to reflect the implemented M10 workflow:
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Update app runbooks:
  - `apps/mobile/README-maestro.md`
  - `apps/mobile/README_HUMAN_TESTING.md`
- Remove stale absolute paths and stale Expo Go assumptions from documentation.
- Remove or materially reduce redundant Maestro documentation so only one full contract document remains and secondary docs act as short entrypoints or operational quickstarts.
- Make sure the docs answer, at minimum:
  - what the runtime topology is,
  - how to do first-time setup,
  - how per-worktree config works,
  - how shared dev-build reuse works,
  - how provision/launch/teardown are invoked,
  - when to use full reset vs data reset vs deep-link teleportation,
  - where artifacts and logs are written.
- Update project-structure documentation if M10 introduced new canonical config/spec/runtime-state paths.

### Out of scope

- Additional code changes unless a documentation inconsistency reveals a blocking bug in the just-implemented M10 workflow.
- Expanding Maestro coverage beyond the milestone scope.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. Top-level docs and app runbooks all point back to the authoritative Maestro spec and no longer disagree on commands, paths, or reset rules.
2. Stale absolute workspace paths are removed from the Maestro-related docs touched by this task.
3. Redundant Maestro documentation is removed or reduced enough that there is one clear source of truth and no large overlapping contract text remains elsewhere.
4. `docs/specs/06-testing-strategy.md` clearly states the new Maestro runtime/testing conventions, including reset taxonomy and when slow-gate Maestro runs are required.
5. `docs/specs/04-ai-development-playbook.md` tells future task authors what Maestro-specific context and gates must be loaded/declared.
6. `docs/specs/09-project-structure.md` documents any new canonical config/sample/spec/runtime-state locations introduced by M10.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/04-ai-development-playbook.md` - align execution/startup context and gate expectations
  - `docs/specs/06-testing-strategy.md` - align Maestro testing policy and reset taxonomy
  - `docs/specs/09-project-structure.md` - document new canonical Maestro-related paths if introduced
  - `apps/mobile/README-maestro.md` - operational runbook aligned to the final M10 toolkit
  - `apps/mobile/README_HUMAN_TESTING.md` - first-time human setup and manual fallback guidance
  - remove or shrink redundant Maestro docs if they still duplicate the authoritative spec after earlier M10 tasks

## Testing and verification approach

- Planned checks/commands:
  - docs/path/command consistency review across all touched files
  - `rg` sanity checks for stale Expo Go assumptions and stale absolute paths in Maestro docs
- Standard local gate usage:
  - `./scripts/quality-fast.sh`: `N/A (docs-only task)`
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A by default for docs-only closeout`
- Test layers covered: docs consistency + command/path sanity
- Execution triggers: always
- Slow-gate triggers:
  - `N/A` unless this task also changes scripts or command surfaces; if that happens, rerun the smallest relevant runtime check and record it
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI configured; docs verification is manual in-task

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `apps/mobile/README-maestro.md`
  - `apps/mobile/README_HUMAN_TESTING.md`
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
- Project structure impact:
  - document any new canonical M10 paths introduced by earlier tasks
- Constraints/assumptions:
  - docs should stay synthetic and point back to the authoritative Maestro spec instead of restating every implementation detail

## Mandatory verify gates

- Standard local fast gate: `N/A (docs-only)`
- Standard local slow gate: `N/A (docs-only unless command surfaces change)`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260301-05-m10-maestro-docs-and-policy-integration.md`

## Evidence

- Summary of doc/policy alignment changes:
  - updated `docs/specs/04-ai-development-playbook.md` so Maestro tasks must load the authoritative contract, declare slow-gate posture, and record runtime evidence.
  - updated `docs/specs/06-testing-strategy.md` to define Maestro policy ownership, canonical commands, reset taxonomy, slow-gate triggers, and evidence expectations without duplicating the full runtime contract.
  - updated `docs/specs/09-project-structure.md` to document `.maestro/maestro.env.sample`, `.maestro/maestro.env.local`, `apps/mobile/scripts/maestro-*.sh`, and `apps/mobile/artifacts/maestro/` as canonical M10 locations.
- `rg` summary for stale path or Expo Go wording cleanup:
  - removed stale Expo Go transition wording from `apps/mobile/README-maestro.md` and `apps/mobile/README_HUMAN_TESTING.md`.
  - removed stale absolute workspace paths from the runbooks; no absolute machine-specific workspace paths remain in the touched Maestro docs.
- Summary of which Maestro docs were removed, reduced, or converted to link-first entrypoints:
  - reduced `apps/mobile/README-maestro.md` to a thin operational runbook.
  - reduced `apps/mobile/README_HUMAN_TESTING.md` to a human workflow entrypoint that points back to the authoritative contract.
- Manual verification summary (required when CI is absent/partial): docs consistency and command/path sanity completed via targeted file/script review, `rg` cleanup checks, and task closeout validation.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed: aligned the AI playbook, testing strategy, project-structure spec, and both mobile runbooks to the implemented M10 Maestro runtime; removed stale Expo Go transition guidance and stale absolute workspace paths; converted the runbooks into link-first operational entrypoints that defer policy to `docs/specs/11-maestro-runtime-and-testing-conventions.md`.
- What tests ran: `./scripts/task-bootstrap.sh docs/tasks/T-20260301-05-m10-maestro-docs-and-policy-integration.md`; `git fetch origin main`; targeted `sed`/`rg` inventory review of Maestro scripts, flows, config, and docs; `./scripts/task-closeout-check.sh docs/tasks/T-20260301-05-m10-maestro-docs-and-policy-integration.md`.
- What remains: M10 milestone closeout is complete; no follow-up work remains for this task.

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260301-05-m10-maestro-docs-and-policy-integration.md` (or document why `N/A`) before handoff.
