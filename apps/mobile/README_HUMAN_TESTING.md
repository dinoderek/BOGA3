# Mobile App Development Guide

This guide is optimized for fast human validation on a physical phone.

## Code organization

### Top-level folders

- `app/`: Expo Router route files, route layouts, and route-level UI tests.
- `assets/`: App images/icons/splash and other static assets bundled with the app.
- `components/`: Shared or feature UI/domain types that are not route files.
- `drizzle/`: Generated SQL migrations and Drizzle metadata snapshots.
- `src/`: Non-route app code (data access, schema, and future domain logic).
- `.vscode/`: Local editor settings/recommendations for this app workspace.
- `.expo/` and `node_modules/`: Generated local/runtime artifacts (do not edit manually).

### Root files

- `package.json`: Dependencies and developer scripts (`start`, `test`, `db:generate`, etc.).
- `app.json`: Expo app configuration (bundle metadata, plugins, platform settings).
- `eas.json`: EAS build/submit profile configuration.
- `tsconfig.json`: TypeScript compiler settings and path aliases.
- `eslint.config.js`: Lint rules and ignore configuration.
- `jest.config.js` and `jest.setup.ts`: Jest test config and runtime setup.
- `drizzle.config.ts`: Drizzle migration generation config.
- `.gitignore`: Ignore rules for generated/local files.
- `README.md`: Development workflows and code organization policy.

## Test placement policy

- `Route/screen integration tests`: place in `app/__tests__/` and test user flows through route components.
- `Feature/domain unit tests`: colocate near feature code using `__tests__/` folders (for example, `src/**/__tests__/` or `components/**/__tests__/`).
- `Data layer tests`: place under `src/data/__tests__/` and focus on schema, queries, and repository behavior.
- `Pure utility tests`: colocate with the utility module using `*.test.ts`.

Use the smallest test scope that validates behavior:
- prefer unit tests for state and pure logic,
- use route integration tests for navigation/UI interaction wiring,
- avoid duplicating the same assertion across multiple test types.

## Prerequisites

Run all commands from `/Users/dinohughes/Projects/scaffolding-quality/apps/mobile`.

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
