# RUNBOOK

## Purpose

Human-operator guide for local development, runtime operations, logs, and tests across the mobile frontend, Maestro E2E runtime, and Supabase backend.

## Scope and conventions

- Run commands from repo root unless a section says otherwise.
- This runbook is for local development/runtime only.
- Authoritative Maestro runtime contract still lives in `docs/specs/11-maestro-runtime-and-testing-conventions.md`.

## Prerequisites

- Node.js + npm
- Xcode + iOS Simulator (`xcrun simctl`)
- CocoaPods (`pod`)
- Maestro CLI (`maestro`)
- Docker (for local Supabase stack)
- `jq` (required by backend contract test scripts)

## Worktree setup and isolation

Authoritative design: `docs/specs/12-worktree-config-and-isolation.md`.

BOGA worktrees must live outside another BOGA checkout. Use the wrapper when possible:

```bash
./scripts/worktree-create.sh codex/my-branch
```

Initialize or repair the current checkout/worktree:

```bash
./scripts/worktree-setup.sh
```

Diagnose isolation/config problems:

```bash
./scripts/worktree-doctor.sh
```

Sweep completed worktree Supabase infrastructure:

```bash
./scripts/worktree-sweep.sh
```

Setup generates `.worktree-slot`, `supabase/config.toml`, shared Supabase env symlinks, and `apps/mobile/.maestro/maestro.env.local`.

Rules:

- never create a BOGA worktree under another BOGA checkout;
- run `cd apps/mobile && npm install` in each worktree;
- do not symlink `apps/mobile/node_modules` between worktrees;
- use a unique simulator target per concurrent worktree.

`./supabase/scripts/local-runtime-up.sh` automatically runs a conservative Supabase cleanup sweep for completed worktree slots before starting the current slot. A slot is considered completed only when its registered path is gone/invalid, or when it belongs to this git worktree group and is no longer listed by `git worktree list`.

## Quick start (full local stack)

1. Initialize this checkout/worktree:

```bash
./scripts/worktree-setup.sh
```

2. Start backend runtime:

```bash
./supabase/scripts/local-runtime-up.sh
```

3. Install mobile dependencies:

```bash
cd apps/mobile
npm install
```

4. Start the iOS dev-client manual loop:

```bash
npm run start:ios:dev-client
```

## Mobile app: run on iOS simulator

### Fast JS loop (Expo)

```bash
cd apps/mobile
npx expo start
```

### Dev-client loop (matches Maestro runtime)

```bash
cd apps/mobile
./scripts/maestro-ios-dev-client-build.sh
npm run start:ios:dev-client
```

### Uninstall and reinstall app on simulator

1. Boot/open a simulator.
2. Reinstall the built dev client:

```bash
APP_PATH="$(cd apps/mobile && ./scripts/maestro-ios-dev-client-build.sh --print-app-path)"
BUNDLE_ID="$(plutil -extract CFBundleIdentifier raw -o - "$APP_PATH/Info.plist")"
xcrun simctl uninstall booted "$BUNDLE_ID" || true
xcrun simctl install booted "$APP_PATH"
xcrun simctl launch booted "$BUNDLE_ID"
```

### Automated uninstall/reinstall via smoke lane

The smoke runner uses a full reset path and reinstalls automatically:

```bash
cd apps/mobile
TASK_ID=ad-hoc npm run test:e2e:ios:smoke
```

## Supabase: run locally and reset

### Start/stop/reset

Start runtime:

```bash
./supabase/scripts/local-runtime-up.sh
```

Stop runtime:

```bash
./supabase/scripts/local-runtime-down.sh
```

Clean completed/orphaned Supabase infra:

```bash
./scripts/worktree-sweep.sh
```

Clean one completed slot manually:

```bash
./scripts/worktree-clean.sh --slot <n> --supabase --remove-registry
```

Reset DB (migrations + seed):

```bash
./supabase/scripts/reset-local.sh
```

Ensure shared baseline (non-destructive when already up, with fixture enforcement):

```bash
./supabase/scripts/ensure-local-runtime-baseline.sh
```

### Test accounts (local fixtures)

- `user_a.local@example.test` / `ScaffoldingUserA!234`
- `user_b.local@example.test` / `ScaffoldingUserB!234`

Source: `supabase/scripts/auth-fixture-constants.sh`

## Logs

### App logs

- Expo/dev-client logs: terminal where `npm run start:ios:dev-client` or `npx expo start --dev-client` is running.
- Maestro run artifacts/logs:
  - root: `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`
  - key files: `runtime.env`, `provision.log`, `launch.log`, `teardown.log`, `expo-start.log`, `simulator-system.log`, `maestro-junit.xml`
- Live simulator process logs (manual):

```bash
APP_PATH="$(cd apps/mobile && ./scripts/maestro-ios-dev-client-build.sh --print-app-path)"
APP_EXECUTABLE="$(plutil -extract CFBundleExecutable raw -o - "$APP_PATH/Info.plist")"
xcrun simctl spawn booted log stream --style compact --level debug --predicate "process == \"$APP_EXECUTABLE\""
```

### Supabase logs

- Health function log file:

```bash
tail -f supabase/.temp/health-functions-serve.log
```

- Runtime status/env:

```bash
source ~/.config/boga/supabase/cli.env
npx -y "supabase@${SUPABASE_CLI_VERSION:-2.76.15}" status -o env
```

- Container logs (if needed):

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}' | rg supabase
docker logs -f <container-name>
```

## Tests

### Frontend (apps/mobile)

```bash
cd apps/mobile
npm run lint
npm run typecheck
npm run test
npm run db:generate:canary
```

### E2E / simulator runtime (apps/mobile)

```bash
cd apps/mobile
TASK_ID=ad-hoc npm run test:e2e:ios:smoke
TASK_ID=ad-hoc npm run test:e2e:ios:data-smoke
TASK_ID=ad-hoc npm run test:e2e:ios:auth-profile
```

### Backend (Supabase)

```bash
./supabase/scripts/test-fast.sh
./supabase/scripts/test-auth-authz.sh
./supabase/scripts/test-sync-api-contract.sh
./supabase/scripts/test-sync-events-ingest-contract.sh
```

### Repo-level wrappers

```bash
./scripts/quality-fast.sh
./scripts/quality-fast.sh frontend
./scripts/quality-fast.sh backend
./scripts/quality-slow.sh frontend
./scripts/quality-slow.sh backend
```

### Cross-stack restore-parity lane

```bash
cd apps/mobile
npm run test:sync:reinstall-parity
```
