# Maestro iOS Runtime Runbook

The full Maestro runtime/testing contract lives in [`docs/specs/11-maestro-runtime-and-testing-conventions.md`](../../docs/specs/11-maestro-runtime-and-testing-conventions.md).

Use this file as the operational quickstart for `apps/mobile`.

## Run location

Run commands from `apps/mobile`.

## Runtime topology

- Per-worktree config lives in `.maestro/maestro.env.local` and starts from `.maestro/maestro.env.sample`.
- Runtime scripts fail fast if `.maestro/maestro.env.local` is missing.
- The shared iOS development-client build is host-local and defaults to `$HOME/.cache/boga/maestro/ios-dev-client/mobile-dev-client.app`.
- `npm run test:e2e:ios:smoke` and `npm run test:e2e:ios:data-smoke` use the port and simulator configured for this workspace, provision/install the dev client, launch Metro, run Maestro, then tear down.
- Run artifacts are written to `artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`.

## First-time setup

1. Install JavaScript dependencies:

```bash
npm install
```

2. Ensure Xcode/iOS Simulator, CocoaPods, and Maestro are installed and on your `PATH`:

```bash
pod --version
xcrun simctl list devices >/dev/null
maestro --version
```

3. Create the per-worktree Maestro config:

```bash
cp .maestro/maestro.env.sample .maestro/maestro.env.local
```

4. Edit `.maestro/maestro.env.local` and set:

```bash
EXPO_DEV_SERVER_PORT=<unique-port-for-this-workspace>
IOS_SIM_UDID=<dedicated-simulator-udid>
```

5. Build or reuse the shared simulator dev client:

```bash
./scripts/maestro-ios-dev-client-build.sh
```

## Per-worktree config

The local config file is `.maestro/maestro.env.local`.

Common overrides:

- `TASK_ID`
- `EXPO_DEV_SERVER_PORT`
- `IOS_SIM_UDID`
- `IOS_SIM_DEVICE`
- `MAESTRO_IOS_SHARED_BUILD_ROOT`
- `MAESTRO_IOS_DEV_CLIENT_APP_PATH`
- `MAESTRO_KEEP_SIMULATOR_BOOTED`

The sample file is a template only. It does not provide a runnable fallback on its own.

When multiple worktrees share one Mac, each worktree must set:

- a unique `EXPO_DEV_SERVER_PORT`
- a unique `IOS_SIM_UDID` or at least a unique `IOS_SIM_DEVICE` name

Prefer `IOS_SIM_UDID` for shared-host use because duplicate simulator names are easy to confuse.
If `.maestro/maestro.env.local` is missing, runtime scripts fail immediately instead of silently reusing generic defaults.
By default teardown shuts the configured simulator down after each run. Set `MAESTRO_KEEP_SIMULATOR_BOOTED=1` only if you intentionally want to keep it running for manual follow-up work.

## Shared dev-client commands

Check whether the shared build is current:

```bash
./scripts/maestro-ios-dev-client-build.sh --status
```

Print the resolved `.app` path:

```bash
./scripts/maestro-ios-dev-client-build.sh --print-app-path
```

Force a rebuild:

```bash
./scripts/maestro-ios-dev-client-build.sh --force
```

The build is refreshed when the `.app` or build metadata is missing, when the native-input fingerprint changes, or when `--force` is passed.

## Main validation commands

Cold-start smoke lane:

```bash
TASK_ID=T-20260301-05 npm run test:e2e:ios:smoke
```

Data-runtime smoke lane:

```bash
TASK_ID=T-20260301-05 npm run test:e2e:ios:data-smoke
```

Repo-level slow gate:

```bash
cd ../..
./scripts/quality-slow.sh frontend
```

## Reset rules

- `smoke` uses `full reset` plus harness `teleport` to the recorder.
- `data-smoke` uses harness `data reset` plus `teleport`.
- Use `full reset` only when cold-install/onboarding/permission behavior is part of the objective.
- Use `data reset` when app-owned persisted state must be cleared without reinstalling the binary.
- Use `teleport` as the default navigation/setup method when the flow is not explicitly testing setup UI.

## Artifacts and logs

Each run writes `artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/` with:

- `runtime.env`
- `provision.log`
- `launch.log`
- `teardown.log`
- `expo-start.log`
- `maestro-junit.xml`
- `maestro-output/`
- `maestro-debug/`

If a run fails, start with `runtime.env`, `launch.log`, and `expo-start.log`.
