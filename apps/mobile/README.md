# Mobile App Development Guide

This guide is optimized for fast human validation on a physical phone.

## Prerequisites

Run all commands from `/Users/dinohughes/Projects/scaffolding/apps/mobile`.

1. Install dependencies:

```bash
npm install
```

2. Authenticate with Expo Application Services:

```bash
npx eas-cli@latest login
```

## Workflow A: Instant Local Loop (fastest while coding)

Use this when you want immediate UI feedback while both laptop and phone are on the same network.

1. Start Metro:

```bash
npx expo start
```

2. Open the app on your phone:
   - Expo Go for standard managed Expo features.
   - Development build (dev client) if you introduce custom native modules.
3. Keep the app open while coding; changes hot reload in seconds.

## Workflow B: Preview Publish Loop (shareable on-device checkpoint)

Use this when you want a stable, installable preview build and fast remote updates.

### One-time setup

1. Link this app to an EAS project:

```bash
npx eas-cli@latest init
```

2. Configure EAS Update for this app/runtime:

```bash
npx eas-cli@latest update:configure
```

3. Ensure `preview` channel points to `preview` branch:

```bash
npx eas-cli@latest channel:create preview --branch preview
# if the channel already exists, use:
npx eas-cli@latest channel:edit preview --branch preview
```

4. Build and install a preview app on device:

```bash
npx eas-cli@latest build -p ios --profile preview
# or
npx eas-cli@latest build -p android --profile preview
```

### Day-to-day preview loop

1. Make UI changes locally.
2. Publish an update to the preview branch:

```bash
npx eas-cli@latest update --branch preview --message "ui: <short note>"
```

3. Open/reload the installed preview app on device and validate.

Notes:
- Native dependency/config changes require a new preview build.
- JS/TS/UI changes usually ship via update without rebuilding the binary.

## Workflow C: Dev Client Loop (native modules + fast iteration)

Use this if Expo Go is not enough.

1. Build and install development client once:

```bash
npx eas-cli@latest build -p ios --profile development
# or
npx eas-cli@latest build -p android --profile development
```

2. Start Metro for the dev client:

```bash
npx expo start --dev-client
```

3. Open the installed dev client and connect to Metro.

## Local data lane-1 canary

Run migration generation canary command:

```bash
npm run db:generate:canary
```
