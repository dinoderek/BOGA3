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

## Worktree quick-start (parallel development)

`git worktree` lets you work on multiple branches simultaneously without duplicating the full repo. Each worktree gets its own Supabase stack on isolated ports.

### First-time machine setup

```bash
./scripts/boga-config-init.sh
```

Creates `~/.config/boga/` with shared credentials and CLI config copied from example files. Only needed once per machine.

### Initialize the main checkout

```bash
./scripts/worktree-setup.sh
```

Assigns slot 0 (default ports), generates `supabase/config.toml` from the template, creates symlinks to `~/.config/boga/`, and installs the `post-checkout` hook.

### Create a second worktree

```bash
git worktree add ../scaffolding-wt1 some-branch
```

The `post-checkout` hook fires automatically and runs `worktree-setup.sh`, which:
- Assigns the next available slot (1, 2, ...)
- Generates `config.toml` with offset ports (+100 per slot)
- Creates a separate Supabase project (`scaffolding-wt1`, `scaffolding-wt2`, ...)

### Port layout

| Resource | Slot 0 | Slot 1 | Slot 2 |
|----------|--------|--------|--------|
| API | 55431 | 55531 | 55631 |
| DB | 55422 | 55522 | 55622 |
| Studio | 55423 | 55523 | 55623 |
| Inspector | 8183 | 8193 | 8203 |
| Expo dev | 8081 | 8082 | 8083 |

### Re-run setup (safe, idempotent)

```bash
./scripts/worktree-setup.sh
```

### Remove a worktree

```bash
git worktree remove ../scaffolding-wt1
```

Docker containers for that slot's project remain until manually cleaned up:
```bash
npx -y supabase@2.76.15 stop --project-id scaffolding-wt1
```

## Quick start (full local stack)

1. Start backend runtime:

```bash
./supabase/scripts/local-runtime-up.sh
```

2. Install mobile dependencies:

```bash
cd apps/mobile
npm install
```

3. Create per-worktree Maestro config (first time only):

```bash
cp .maestro/maestro.env.sample .maestro/maestro.env.local
```

4. Build or reuse simulator dev client:

```bash
./scripts/maestro-ios-dev-client-build.sh
```

5. Start app in simulator dev-client mode:

```bash
npx expo start --dev-client
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
npx expo start --dev-client
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

- Expo/dev-client logs: terminal where `npx expo start --dev-client` is running.
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
npx -y supabase@2.76.15 status -o env
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

