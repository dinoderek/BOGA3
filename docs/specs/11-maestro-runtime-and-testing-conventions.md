# Maestro Runtime and Testing Conventions (M10 Contract)

## Purpose

This document is the authoritative source of truth for the `apps/mobile` Maestro runtime and testing contract.

It has two jobs:

1. record the verified current implementation as of `2026-03-01`, based on code rather than historical runbooks;
2. lock the exact M10 runtime, config, script, artifact, and terminology contract that follow-up tasks must implement.

## Status / scope

- Scope: iOS Maestro runtime/tooling, flow execution conventions, and the related documentation ownership model for `apps/mobile/**`.
- Current-state status: the implemented runtime is still `Expo Go` based.
- Target-state status: M10 will migrate the automation runtime to an Expo development client workflow.
- Authority rule:
  - this doc is normative for Maestro runtime/testing conventions;
  - milestone/task docs may scope work, but must not redefine this contract;
  - app runbooks should stay operational and link back here for the full policy.

## Documentation ownership model

- Authoritative contract:
  - `docs/specs/11-maestro-runtime-and-testing-conventions.md`
- Secondary operational entrypoints:
  - `apps/mobile/README-maestro.md`
  - `apps/mobile/README_HUMAN_TESTING.md`
- Supporting but non-authoritative context:
  - `docs/specs/milestones/M10-maestro-parallel-runtime-and-testing-conventions.md`
  - `docs/brainstorms/Maestro-Revamp`
  - historical Maestro task cards

Rules:

1. The full runtime/testing contract lives here.
2. Secondary runbooks should stay operational and link back here instead of duplicating the full contract.
3. The brainstorm and old task docs are context only; they are not source-of-truth once this doc exists.

## Verified current-state baseline (`2026-03-01`)

### Current flows

- There are exactly two committed Maestro flows:
  - `apps/mobile/.maestro/flows/smoke-launch.yaml`
  - `apps/mobile/.maestro/flows/data-runtime-smoke.yaml`
- Both flows target `appId: host.exp.Exponent`, which confirms the current automation target is `Expo Go`, not a development client.
- Both flows drive setup through visible UI taps rather than deep-link/harness setup:
  - `smoke-launch.yaml` taps through sessions, starts or resumes a session, logs a squat set, and submits it.
  - `data-runtime-smoke.yaml` follows a similar path and asserts history visibility.
- Verified against:
  - `apps/mobile/.maestro/flows/smoke-launch.yaml:1-38`
  - `apps/mobile/.maestro/flows/data-runtime-smoke.yaml:1-40`

### Current runner behavior

- The current entrypoints are `npm run test:e2e:ios:smoke` and `npm run test:e2e:ios:data-smoke`, which call:
  - `apps/mobile/scripts/maestro-ios-smoke.sh`
  - `apps/mobile/scripts/maestro-ios-data-smoke.sh`
- Both runner scripts currently:
  - acquire a shared slot via `maestro-ios-slot-lock.sh`,
  - derive the Expo port from `EXPO_DEV_SERVER_BASE_PORT + slot index` unless `EXPO_DEV_SERVER_PORT` is explicitly set,
  - resolve a simulator from `IOS_SIM_UDID_POOL`, then `IOS_SIM_DEVICE_POOL`, then `IOS_SIM_DEVICE`,
  - create artifacts under `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`,
  - boot the simulator,
  - optionally uninstall/reset `host.exp.Exponent`,
  - start `npx expo start --ios --non-interactive --port <port>`,
  - sleep for `EXPO_START_WAIT_SECONDS` (default `30`),
  - launch `host.exp.Exponent`,
  - open `exp://127.0.0.1:<port>` on the simulator,
  - execute `maestro test`.
- Verified against:
  - `apps/mobile/package.json:17-18`
  - `apps/mobile/scripts/maestro-ios-smoke.sh:7-96`
  - `apps/mobile/scripts/maestro-ios-data-smoke.sh:7-96`

### Current simulator helper behavior

- `apps/mobile/scripts/ios-sim-boot.sh` only resolves an existing simulator by `IOS_SIM_UDID` or `IOS_SIM_DEVICE`, boots it, waits for boot readiness, and echoes the resolved UDID.
- It does not create dedicated simulators.
- It does not install an app binary.
- It does not emit a reusable runtime state file.
- Verified against:
  - `apps/mobile/scripts/ios-sim-boot.sh:4-49`

### Current slot-lock behavior

- `apps/mobile/scripts/maestro-ios-slot-lock.sh` implements host-level lock directories under `MAESTRO_IOS_SLOT_LOCK_ROOT` and uses `mkdir` as the lock primitive.
- Default slots are `slot-1,slot-2,slot-3`.
- It writes the owning PID into `<lock-dir>/pid`.
- It can recover stale locks when the recorded PID no longer exists.
- It returns `"<slot-id> <slot-index>"` on acquisition.
- Verified against:
  - `apps/mobile/scripts/maestro-ios-slot-lock.sh:4-99`

### Current app/build assumptions

- `apps/mobile/app.json` already defines `scheme: "mobile"`, which gives M10 a usable app/deep-link scheme baseline.
- `apps/mobile/eas.json` already defines a `development` build profile with `developmentClient: true`.
- Verified against:
  - `apps/mobile/app.json:3-46`
  - `apps/mobile/eas.json:6-19`

### Current artifact/log shape

- Current smoke/data-smoke runners already create:
  - `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`
  - `maestro-output/`
  - `maestro-debug/`
  - `expo-start.log`
  - `simulator.log`
  - `maestro-junit.xml`
- Verified against:
  - `apps/mobile/scripts/maestro-ios-smoke.sh:44-49`
  - `apps/mobile/scripts/maestro-ios-data-smoke.sh:44-49`

### Current documentation gaps

- `apps/mobile/README-maestro.md` is not authoritative and hardcodes an outdated workspace path: `/Users/dinohughes/Projects/scaffolding/apps/mobile`.
- `apps/mobile/README_HUMAN_TESTING.md` also hardcodes an outdated workspace path: `/Users/dinohughes/Projects/scaffolding-quality/apps/mobile`.
- Neither runbook defines a canonical config file, shared dev-build contract, runtime state file, or reset taxonomy.
- Verified against:
  - `apps/mobile/README-maestro.md:12-17`
  - `apps/mobile/README_HUMAN_TESTING.md:41-44`

## Locked M10 target contract

Everything in this section is normative for follow-up M10 tasks.

### 1. Runtime model

1. The primary iOS automation runtime is `Maestro + iOS Simulator + Expo development client`.
2. `Expo Go` is a verified current-state baseline only; it is not the target M10 automation runtime.
3. The user-facing runner commands remain:
   - `npm run test:e2e:ios:smoke`
   - `npm run test:e2e:ios:data-smoke`
4. Those runner commands must become thin wrappers over a shared toolkit rather than duplicating runtime orchestration logic.

### 2. Canonical config files

The per-worktree Maestro config contract is:

- checked-in sample file:
  - `apps/mobile/.maestro/maestro.env.sample`
- untracked local file:
  - `apps/mobile/.maestro/maestro.env.local`

Rules:

1. Future runtime scripts must treat `apps/mobile/.maestro/maestro.env.local` as the canonical local config file.
2. The sample file is the only checked-in example/config template.
3. Scripts may still accept direct environment overrides, but the documented baseline is to source `maestro.env.local`.

### 3. Canonical environment terminology

Existing environment names that are already implemented remain canonical:

- `TASK_ID`
- `EXPO_DEV_SERVER_BASE_PORT`
- `EXPO_DEV_SERVER_PORT`
- `MAESTRO_IOS_SLOT_IDS`
- `MAESTRO_IOS_SLOT_WAIT_SECONDS`
- `MAESTRO_IOS_SLOT_POLL_SECONDS`
- `MAESTRO_IOS_SLOT_LOCK_ROOT`
- `IOS_SIM_DEVICE`
- `IOS_SIM_DEVICE_POOL`
- `IOS_SIM_UDID_POOL`

New M10-required environment names are locked as:

- `MAESTRO_IOS_SHARED_BUILD_ROOT`
  - canonical shared host-local directory for reusable development-client artifacts.
- `MAESTRO_IOS_DEV_CLIENT_APP_PATH`
  - resolved absolute path to the installed `.app` artifact used by simulator provisioning.

### 4. Shared dev-build artifact concept

The shared development-client artifact contract is:

1. The artifact is host-local and reusable across repository checkouts.
2. The canonical shared-build root is:
   - `$HOME/.cache/boga/maestro/ios-dev-client`
3. The exact `.app` path consumed by runtime scripts is passed through `MAESTRO_IOS_DEV_CLIENT_APP_PATH`.
4. A dedicated build/reuse script owns creating or refreshing that artifact; smoke/data-smoke runners do not build native binaries directly.

### 5. Canonical toolkit script surface

Future M10 tasks must implement or align on this script surface:

- `apps/mobile/scripts/maestro-ios-dev-client-build.sh`
- `apps/mobile/scripts/maestro-ios-provision.sh`
- `apps/mobile/scripts/maestro-ios-launch.sh`
- `apps/mobile/scripts/maestro-ios-teardown.sh`
- `apps/mobile/scripts/maestro-ios-smoke.sh`
- `apps/mobile/scripts/maestro-ios-data-smoke.sh`

Responsibility split:

- `maestro-ios-dev-client-build.sh`
  - builds or refreshes the shared dev-client artifact when native inputs require it.
- `maestro-ios-provision.sh`
  - resolves or creates the simulator, boots it, installs the dev client, and writes runtime state.
- `maestro-ios-launch.sh`
  - acquires/uses the resolved slot, starts Expo on the isolated port, deep-links the dev client, and updates runtime state.
- `maestro-ios-teardown.sh`
  - performs cleanup using the emitted runtime state, including Expo process shutdown and slot release.
- `maestro-ios-smoke.sh` / `maestro-ios-data-smoke.sh`
  - remain the high-level scenario entrypoints and call the shared toolkit.

### 6. Runtime state and log expectations

The canonical artifact root remains:

- `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`

M10 runtime scripts must emit:

- `runtime.env`
- `provision.log`
- `launch.log`
- `teardown.log`
- `maestro-junit.xml`
- `maestro-output/`
- `maestro-debug/`

Minimum `runtime.env` fields:

- `TASK_ID`
- `MAESTRO_ARTIFACT_ROOT`
- `MAESTRO_IOS_SLOT_ID`
- `MAESTRO_IOS_SLOT_INDEX`
- `IOS_SIM_UDID`
- `IOS_SIM_DEVICE`
- `EXPO_DEV_SERVER_PORT`
- `MAESTRO_IOS_DEV_CLIENT_APP_PATH`
- `EXPO_PID`

Transition note:

- current scripts emit `expo-start.log` and `simulator.log`;
- M10 canonical lifecycle logs are `provision.log`, `launch.log`, and `teardown.log`;
- follow-up tasks may keep the old files temporarily during migration, but the contract above is the destination surface.

### 7. Parallel isolation contract

1. Cross-worktree parallel safety remains mandatory.
2. Slot-based host arbitration is retained as the canonical baseline for M10 because it already exists in code and is cross-worktree safe.
3. Each acquired slot must deterministically map to:
   - one Expo port,
   - one simulator selection,
   - one runtime state file,
   - one cleanup owner.
4. If later tasks extend or replace the current slot helper, they must preserve the same deterministic cross-worktree isolation guarantees.

### 8. Reset taxonomy

M10 locks these exact terms:

1. `full reset`
   - cold-start/install-level reset;
   - may reinstall the dev client or use `launchApp`/`clearState` when permission/onboarding/install behavior is under test;
   - not the default for ordinary smoke setup.
2. `data reset`
   - clears app-owned persisted data while keeping the installed binary/runtime in place;
   - preferred when a clean app data state is needed without re-testing install semantics.
3. `teleport`
   - uses deep links or a hidden harness route to land directly in the target screen/state;
   - default setup method for routine flow positioning because it minimizes slow UI tapping.

Priority rule:

- prefer `teleport`;
- use `data reset` when state cleanup is required;
- use `full reset` only when install/permission/true cold-start behavior is part of the test objective.

### 9. Harness and deep-link contract

1. The app-level setup/navigation layer must use the existing app scheme baseline (`mobile`) rather than `Expo Go`-specific URLs.
2. Hidden reset/setup routes or actions are allowed for M10, but they must be guarded so they are only available in allowed development/test contexts.
3. Exact route implementation is deferred to later M10 tasks; the contract being locked here is that harness/deep-link setup is the preferred setup layer.

## Brainstorm adoption summary

Adopted from `docs/brainstorms/Maestro-Revamp`:

- shared host-local development-client artifact
- provision / launch / teardown toolkit split
- runtime state file for downstream scripts
- synthetic authoritative documentation
- `full reset` / `data reset` / `teleport` style setup taxonomy

Adjusted to fit the current codebase:

- retain slot-based host arbitration instead of switching to a fixed `BOT_ID` naming model
- keep `apps/mobile/artifacts/maestro/...` as the canonical artifact root
- preserve existing runner command names and make them thin wrappers instead of replacing them
- keep currently implemented env names where they already exist rather than renaming the whole surface

Deferred to later M10 tasks:

- exact dev-client build invalidation logic
- exact simulator creation naming convention
- exact harness route/action implementation details

## M10 closeout note

When M10 closes, move implementation history and milestone-specific cleanup notes out of this document and into milestone closure notes or another non-authoritative historical record. This document should remain the stable runtime/testing contract after the migration is complete.
