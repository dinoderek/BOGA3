# Mobile App File Index

This file is a quick index for where code and config live in `apps/mobile`.

Human testing workflows and on-device validation steps are documented in:
- `README_HUMAN_TESTING.md`

## Directory index

- `app/`: Expo Router routes, layouts, and route-level UI tests.
- `app/__tests__/`: Screen/route integration tests.
- `assets/images/`: App icons, splash, and web favicon assets.
- `components/`: Shared or feature-level component/types modules.
- `components/session-recorder/`: Session recorder feature types and seed constants.
- `src/data/`: Local data bootstrap and data-layer exports.
- `src/data/schema/`: Drizzle schema definitions for local SQLite.
- `drizzle/`: Generated SQL migrations and Drizzle metadata.

## Root file index

- `app.json`: Expo app configuration.
- `eas.json`: EAS build profile configuration.
- `package.json`: Scripts and dependencies.
- `tsconfig.json`: TypeScript compiler config and path aliases.
- `eslint.config.js`: Lint configuration.
- `jest.config.js`: Jest configuration.
- `jest.setup.ts`: Jest test setup hooks.
- `drizzle.config.ts`: Drizzle migration generation config.
- `.gitignore`: Git ignore rules for generated/local files.
- `README_HUMAN_TESTING.md`: Human testing guide and development loops.
