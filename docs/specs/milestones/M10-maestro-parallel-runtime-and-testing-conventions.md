# Milestone Spec

## Milestone metadata

- Milestone ID: `M10`
- Title: Maestro parallel runtime and testing conventions revamp
- Status: `completed`
- Owner: `AI + human reviewer`
- Target window: `2026-03`

## Parent references

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- Maestro runtime/testing contract: `docs/specs/11-maestro-runtime-and-testing-conventions.md`
- Brainstorm source: `docs/brainstorms/Maestro-Revamp`
- Current implementation baseline:
  - `apps/mobile/package.json`
  - `apps/mobile/app.json`
  - `apps/mobile/eas.json`
  - `apps/mobile/.maestro/flows/smoke-launch.yaml`
  - `apps/mobile/.maestro/flows/data-runtime-smoke.yaml`
  - `apps/mobile/scripts/ios-sim-boot.sh`
  - `apps/mobile/scripts/maestro-ios-smoke.sh`
  - `apps/mobile/scripts/maestro-ios-data-smoke.sh`
  - `apps/mobile/README-maestro.md`
  - `apps/mobile/README_HUMAN_TESTING.md`
  - `docs/tasks/complete/T-20260220-01-m1-ios-maestro-ai-testing-loop.md`

Completed implementation note (`2026-03-01`):

- the final M10 runtime uses explicit per-worktree simulator/port config and no longer uses host-level arbitration.
- historical references below to the previous host-locking model describe the draft-time baseline that M10 replaced.

## Milestone objective

Replace the current Expo Go based Maestro smoke loop with a reliable, parallel-safe, development-client-based iOS runtime toolkit and an authoritative documentation set that tells future agents and humans exactly how to provision simulators, launch isolated Expo servers, reset app state, and choose between full reset, data reset, and deep-link driven setup.

## Verified current-state baseline (draft-time audit)

- Current Maestro coverage is limited to two flows:
  - `apps/mobile/.maestro/flows/smoke-launch.yaml`
  - `apps/mobile/.maestro/flows/data-runtime-smoke.yaml`
- Current runners are `apps/mobile/scripts/maestro-ios-smoke.sh` and `apps/mobile/scripts/maestro-ios-data-smoke.sh`.
- Current runner behavior is still Expo Go based:
  - both scripts launch `host.exp.Exponent`,
  - both start `npx expo start --ios --non-interactive --port <port>`,
  - both open `exp://127.0.0.1:<port>` on the simulator,
  - both optionally uninstall Expo Go state rather than managing a development client binary.
- Current parallelism support is partial:
  - the draft-time implementation used host-level locking to derive ports and simulator pools,
  - but there is no per-worktree config sample, no dedicated simulator provisioning by agent identity, and no runtime state file for downstream scripts.
- Current simulator helper `apps/mobile/scripts/ios-sim-boot.sh` only resolves and boots an existing simulator by name or UDID.
  - it can create a dedicated simulator when `IOS_SIM_AUTO_CREATE=1`,
  - it does not install an app binary,
  - it does not emit a reusable runtime state artifact.
- Current docs are incomplete/stale for the desired workflow:
  - `apps/mobile/README-maestro.md` still hardcodes an outdated absolute workspace path,
  - `apps/mobile/README_HUMAN_TESTING.md` also contains a stale absolute workspace path,
  - neither doc is an authoritative future-agent contract for setup tiers, reset rules, or shared dev-build reuse.
- Current app/build config already has useful starting points:
  - `apps/mobile/app.json` defines `scheme: "mobile"`,
  - `apps/mobile/eas.json` already has a `development` profile with `developmentClient: true`.
- Current gaps relative to the brainstorm:
  - no shared dev-build creation/reuse script,
  - no canonical untracked worktree config file plus checked-in sample,
  - no provision/launch/teardown toolkit split,
  - no documented build invalidation rule,
  - no hidden test harness/deep-link reset layer,
  - no authoritative source-of-truth Maestro runtime/testing spec under `docs/specs/`.

## Locked decisions for M10

1. Maestro runtime for iOS automation must move to an Expo development client based flow; Expo Go may remain available for manual development but is not the primary M10 automation target.
2. The iOS development client binary is a shared host-local artifact, not something every worktree rebuilds for every run.
3. Each worktree must use `apps/mobile/.maestro/maestro.env.local` as the canonical untracked Maestro config file and `apps/mobile/.maestro/maestro.env.sample` as the checked-in sample file; scripts are stateless beyond that env contract and generated runtime state files.
4. Parallel isolation must work across separate repository checkouts on the same host by isolating:
   - simulator identity,
   - Expo dev-server port,
   - runtime state files,
   - cleanup ownership.
5. Slot-based host arbitration is retained as the M10 baseline; later refactors may change implementation details only if they preserve deterministic, cross-worktree-safe isolation.
6. Setup should minimize slow UI tapping:
   - use `clearState` only for true cold-start/install permission layers,
   - use app-level data reset for storage/session cleanup,
   - use deep links or hidden harness routes to `teleport` to the screen/state under test.
7. Hidden Maestro/debug harness functionality must be explicitly guarded so it is only available in allowed development/test contexts.
8. `docs/specs/11-maestro-runtime-and-testing-conventions.md` is the authoritative source-of-truth doc for Maestro runtime/testing conventions; runbooks and top-level testing/playbook docs must align to it.
9. The canonical shared-build root is `$HOME/.cache/boga/maestro/ios-dev-client`, and runtime scripts consume the resolved `.app` via `MAESTRO_IOS_DEV_CLIENT_APP_PATH`.
10. The canonical toolkit surface is:
   - `apps/mobile/scripts/maestro-ios-dev-client-build.sh`
   - `apps/mobile/scripts/maestro-ios-provision.sh`
   - `apps/mobile/scripts/maestro-ios-launch.sh`
   - `apps/mobile/scripts/maestro-ios-teardown.sh`
   - existing smoke/data-smoke runners stay as thin scenario entrypoints.
11. The canonical runtime artifact root remains `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`, and future toolkit runs must emit `runtime.env`, `provision.log`, `launch.log`, and `teardown.log` there.
12. M10 reset taxonomy uses the exact terms `full reset`, `data reset`, and `teleport`.

## In scope

- Verified current-state audit converted into authoritative spec language for future execution.
- Shared iOS development-client build creation/reuse workflow, including:
  - canonical artifact path contract,
  - rebuild invalidation rules,
  - config/env sample,
  - first-time setup guidance.
- Parallel-safe simulator/runtime toolkit scripts for:
  - provisioning or resolving a dedicated simulator,
  - booting/installing the shared dev client,
  - starting Expo on an isolated port,
  - deep-linking the dev client to the local bundle,
  - teardown and cleanup after success or failure.
- Refactor of current Maestro runner scripts to reuse common toolkit code instead of duplicating Expo Go logic.
- Hidden harness or deep-link utilities for app-state reset and navigation teleportation.
- Updated Maestro testing policy covering:
  - full reset vs data reset vs deep-link navigation,
  - when to use harness routes,
  - when cold-launch coverage is required,
  - artifact/log expectations.
- Synthetic documentation for:
  - Simulator + Expo + Maestro runtime topology,
  - first-time setup,
  - per-worktree configuration,
  - troubleshooting,
  - testing conventions for future agent sessions.
- Rationalization of existing Maestro-related documentation so one authoritative source-of-truth doc exists, secondary runbooks link back to it, and redundant/stale duplicates are removed or reduced to thin operational entrypoints.

## Out of scope

- Android Maestro/device automation.
- Cloud device farms or hosted CI execution.
- Broad UI/product redesign unrelated to test harness support.
- Replacing Jest/RNTL as the primary fast feedback loop.
- Cross-stack backend + mobile E2E beyond what is necessary to keep current mobile smoke/data-smoke flows working.

## Deliverables

1. An authoritative Maestro runtime/testing spec under `docs/specs/` that documents the verified current baseline, target runtime contract, reset taxonomy, and future-agent operating rules.
2. A shared dev-client build script plus worktree config sample that support reusing a host-local `.app` artifact and rebuilding only when native inputs require it.
3. A parallel-safe iOS runtime toolkit with distinct provision, launch, and teardown responsibilities and clear runtime state/log outputs.
4. Refactored Maestro flows and app-side harness support so setup relies on documented reset/deep-link layers instead of unnecessary UI tapping.
5. Updated top-level docs and runbooks:
   - `docs/specs/README.md`
   - `docs/specs/04-ai-development-playbook.md`
   - `docs/specs/06-testing-strategy.md`
   - `docs/specs/09-project-structure.md`
   - `apps/mobile/README-maestro.md`
   - `apps/mobile/README_HUMAN_TESTING.md`
   - with redundant/stale Maestro-specific documentation removed or reduced to links back to the authoritative spec.

Rule: because this milestone changes runtime/testing workflow and introduces a new authoritative project-level spec doc, the owning tasks must update `docs/specs/README.md`, `docs/specs/04-ai-development-playbook.md`, `docs/specs/06-testing-strategy.md`, and `docs/specs/09-project-structure.md` as applicable.

## Execution phases

### Phase 0 - Audit and contract lock

- Turn the verified draft-time audit into an authoritative runtime/testing contract.
- Lock exact config-file naming, authoritative doc path, and script-surface expectations.
- Record which parts of the brainstorm are adopted as-is versus adjusted to fit the current codebase.

### Phase 1 - Shared build and config foundation

- Implement the shared dev-client artifact workflow.
- Add config sample and first-time setup instructions.
- Verify or harden `app.json` / `eas.json` for the development-client contract.

### Phase 2 - Parallel runtime toolkit

- Create or refactor scripts into provision / launch / teardown responsibilities.
- Persist runtime state and cleanup ownership.
- Remove duplicated runner logic where possible.

### Phase 3 - Harness and flow migration

- Add hidden harness/deep-link setup paths.
- Migrate current flows and runners from Expo Go assumptions to development-client assumptions.
- Codify full reset vs data reset vs deep-link usage.

### Phase 4 - Docs and policy integration

- Align top-level testing/playbook/project-structure docs and app runbooks to the implemented toolkit.
- Remove stale paths and stale Expo Go assumptions.
- Leave future task sessions with one canonical Maestro operating model.

## Acceptance criteria

1. M10 establishes one authoritative Maestro runtime/testing document under `docs/specs/` and `docs/specs/README.md` links to it.
2. The repository has `apps/mobile/.maestro/maestro.env.sample` as the checked-in sample config file and documents `apps/mobile/.maestro/maestro.env.local` as the untracked per-worktree config path.
3. A shared dev-client build script can create or refresh a reusable simulator `.app` artifact at a documented host-local path, and it documents when rebuilds are required.
4. The iOS runtime toolkit can provision or resolve a dedicated simulator, install the dev client, launch Expo on an isolated port, deep-link the simulator to the correct bundle, and tear down cleanly after success or failure.
5. The toolkit emits enough runtime state and logs for downstream scripts and debugging without relying on manual terminal state, with `runtime.env`, `provision.log`, `launch.log`, and `teardown.log` under the canonical artifact root.
6. Current smoke and data-smoke flows no longer depend on `host.exp.Exponent` or raw Expo Go `exp://` assumptions.
7. M10 documents and implements a clear reset taxonomy:
   - full reset / cold install,
   - app-data reset,
   - deep-link or harness teleportation.
8. Hidden harness actions are guarded to allowed development/test contexts.
9. `docs/specs/04-ai-development-playbook.md`, `docs/specs/06-testing-strategy.md`, `docs/specs/09-project-structure.md`, `apps/mobile/README-maestro.md`, and `apps/mobile/README_HUMAN_TESTING.md` are aligned to the new runtime/testing contract.
10. Maestro-related docs do not compete as independent sources of truth; the authoritative spec owns the full contract and secondary docs link to it without duplicating large overlapping guidance.
11. Task cards created for M10 are detailed enough to execute the milestone without reopening the core runtime-model decisions above.

## Task breakdown

1. `docs/tasks/complete/T-20260301-01-m10-maestro-baseline-audit-and-contract-lock.md` - convert the verified current-state audit into an authoritative M10 contract doc and lock exact file/env/runtime conventions. (`completed`)
2. `docs/tasks/complete/T-20260301-02-m10-shared-dev-client-build-and-worktree-config.md` - add shared dev-client build/reuse workflow, sample config, and first-time setup rules. (`completed`)
3. `docs/tasks/complete/T-20260301-03-m10-parallel-ios-runtime-toolkit-and-teardown.md` - implement provision/launch/teardown toolkit and refactor runners onto it. (`completed`)
4. `docs/tasks/complete/T-20260301-04-m10-maestro-harness-reset-taxonomy-and-flow-migration.md` - add harness/deep-link reset utilities and migrate flows to the development-client runtime model. (`completed`)
5. `docs/tasks/complete/T-20260301-05-m10-maestro-docs-and-policy-integration.md` - align shared docs, runbooks, and policy docs to the implemented M10 workflow. (`completed`)

## Risks / dependencies

- Building a reusable iOS dev client may require local Apple/Xcode tooling details that are not exercised by the current Expo Go based smoke loop.
- Native-input invalidation rules must be accurate enough to avoid both stale binaries and unnecessary rebuilds.
- Hidden test harness routes can become accidental production surface area if not guarded tightly.
- Dedicated simulator creation can accumulate stale devices if teardown/cleanup policy is weak.
- Top-level docs currently contain stale absolute paths; drift risk remains high until the new authoritative doc exists and other docs link back to it.

## Completion note (fill when milestone closes)

- What changed:
- What changed: M10 delivered the authoritative Maestro runtime contract, shared dev-client build/config foundation, provision/launch/teardown toolkit, harness-based reset taxonomy, and final docs/policy integration across the playbook, testing strategy, project-structure spec, and mobile runbooks.
- Verification summary: frontend runtime/toolkit work was verified in prior M10 tasks with `./scripts/quality-fast.sh frontend` and `./scripts/quality-slow.sh frontend`; final closeout verified doc/path/command consistency, removal of stale runbook wording, and task/milestone status alignment.
- What remains: nothing for M10; future Maestro work should start from `docs/specs/11-maestro-runtime-and-testing-conventions.md`.

## Status update checklist (mandatory during task closeout)

- Keep milestone `Status` current as tasks progress.
- Update task breakdown entries to reflect each task state (`planned | in_progress | completed | blocked`).
- If milestone remains open after a session, record why in the active task completion note and/or milestone completion note.
