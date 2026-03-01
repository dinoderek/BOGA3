---
task_id: T-20260301-02
milestone_id: "M10"
status: planned
ui_impact: "no"
areas: "frontend"
runtimes: "docs,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/11-maestro-runtime-and-testing-conventions.md,apps/mobile/README_HUMAN_TESTING.md,apps/mobile/README-maestro.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260301-02`
- Title: M10 shared dev-client build and worktree config
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
- Maestro runtime contract: `docs/specs/11-maestro-runtime-and-testing-conventions.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
- Code/docs inventory freshness checks run:
  - `apps/mobile/app.json`
  - `apps/mobile/eas.json`
  - existing mobile scripts under `apps/mobile/scripts/**`
- Known stale references or assumptions:
  - exact local build mechanism for the shared simulator `.app` artifact must be chosen against the current Expo toolchain at execution time
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260301-02-m10-shared-dev-client-build-and-worktree-config.md`

## Objective

Establish the reusable native-binary foundation for M10 by adding a shared dev-client build/reuse script, a canonical per-worktree config sample, and the first-time setup documentation needed before runtime-toolkit work can safely assume a development client exists.

## Scope

### In scope

- Add one canonical checked-in sample config file and one documented untracked local config path for Maestro runtime settings.
- Add a build/reuse script that can:
  - create a simulator-compatible Expo development client `.app` artifact at a documented host-local path,
  - detect when the artifact is already usable,
  - rebuild when the chosen native-input invalidation rule says it is required,
  - fail with actionable diagnostics when required host tools are missing.
- Verify or harden `apps/mobile/app.json` and `apps/mobile/eas.json` for the development-client contract.
- Document first-time setup steps for a fresh checkout:
  - required host tools,
  - required auth/login state if applicable,
  - config-file creation,
  - shared artifact location,
  - rebuild trigger rules.
- Record the finalized contract in the Maestro spec/runbook docs.

### Out of scope

- Simulator provisioning/boot/install orchestration.
- Metro launch and deep-link handshake.
- App-side test harness routes.
- Full Maestro flow migration.

## UI Impact (required checkpoint)

- UI Impact?: `no`

## Acceptance criteria

1. A checked-in Maestro config sample file exists and the untracked local config path is documented and gitignored.
2. A build/reuse script exists for the shared iOS development-client artifact and documents or implements its rebuild/no-op behavior.
3. The chosen artifact workflow is outside the checkout or otherwise shared safely across worktrees, and the path contract is documented.
4. `app.json` / `eas.json` are verified or updated so the development-client workflow is explicit and compatible with M10.
5. First-time setup instructions are present and sufficient for a new agent or human session to prepare the shared binary and local config.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md` - record finalized config/build contracts
  - `apps/mobile/README_HUMAN_TESTING.md` - first-time setup instructions
  - `apps/mobile/README-maestro.md` - runtime prerequisites and config references

## Testing and verification approach

- Planned checks/commands:
  - targeted invocation of the new build/reuse script in no-op or diagnostic mode
  - config-file discovery/path sanity checks
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh <frontend|backend>`: `N/A` for this task unless script/config changes also force a runtime smoke rerun
- Test layers covered:
  - script contract verification
  - frontend lint/typecheck/test fast gate
- Execution triggers:
  - always for fast gate
  - runtime smoke rerun only if execution changes existing app boot/runtime behavior while implementing the build workflow
- Slow-gate triggers:
  - `N/A by default`; if the task changes app launch/runtime behavior beyond build preparation, rerun `./scripts/quality-slow.sh frontend` and record why
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI configured; script behavior and docs are verified locally

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app.json`
  - `apps/mobile/eas.json`
  - `apps/mobile/scripts/**`
  - `apps/mobile/.gitignore` or repo `.gitignore` if needed for config/runtime artifacts
  - `apps/mobile/README_HUMAN_TESTING.md`
  - `apps/mobile/README-maestro.md`
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
- Project structure impact:
  - new config sample file and shared-binary contract may require a `docs/specs/09-project-structure.md` update in a later docs-integration task
- Constraints/assumptions:
  - keep the build artifact reusable across multiple checkouts on the same machine
  - do not couple this task to simulator orchestration yet

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `N/A by default; run ./scripts/quality-slow.sh frontend only if task scope expands into runtime behavior`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260301-02-m10-shared-dev-client-build-and-worktree-config.md`
- Additional gate(s), if any:
  - targeted script invocation proving config discovery and rebuild/no-op behavior

## Evidence

- Config file path/sample summary.
- Shared build artifact contract summary, including rebuild triggers.
- Fast-gate result summary.
- Manual verification summary (CI absent), including any host-tool prerequisites encountered.

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260301-02-m10-shared-dev-client-build-and-worktree-config.md` (or document why `N/A`) before handoff.
