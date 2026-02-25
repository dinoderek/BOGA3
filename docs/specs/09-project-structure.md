# Project Structure (Current + Conventions)

## Purpose

Define the canonical repository structure, path ownership, and placement conventions so implementation and test assets land in predictable locations.

## Maintenance rule

- Update this document in the same task/session when significant project-structure changes are made (for example new top-level folders, workspace moves, canonical test-location changes, or path-convention changes).
- Minor file additions within an existing well-defined folder usually do not require updates.

## Current repository structure (verified 2026-02-25)

```text
/
  AGENTS.md
  apps/
    mobile/                      # Expo React Native app (current primary codebase)
      app/                       # Expo Router routes/screens
      app/__tests__/             # Current app-side test location (legacy/needs rationalization)
      components/                # UI components
      src/                       # Non-route app code (domain/data/helpers)
      drizzle/                   # Mobile local DB schema/migrations artifacts
      .maestro/flows/            # Maestro flow definitions (canonical location)
      scripts/                   # Mobile/maestro helper scripts
      artifacts/maestro/         # Maestro output artifacts/screenshots
  docs/
    specs/                       # Project/milestone/task process and technical specs
    tasks/                       # Task cards
    brainstorms/                 # Working notes and brainstorming docs
```

## Workspace ownership (current)

- `apps/mobile/`
  - owns the mobile app code, mobile-only tests, mobile SQLite schema artifacts, Maestro flows, and mobile test helper scripts.
- `docs/specs/`
  - owns project policy, architecture/testing strategy, milestone specs, and templates.
- `docs/tasks/`
  - owns per-session execution task cards.
- `docs/brainstorms/`
  - owns non-authoritative ideation notes (helpful context, not source of truth).

## Agreed structure conventions (M5 additions)

- `supabase/` (planned in M5)
  - backend root for local Supabase project assets (migrations, seeds, functions, and backend-local tests).
- `apps/mobile/.maestro/flows`
  - remains the canonical location for Maestro flow definitions.
- `e2e/` (reserved)
  - reserved for cross-stack orchestration/tests that span mobile + backend.
  - strategy may be documented before implementation exists.
- Mobile test-directory refactor
  - moving tests out of `apps/mobile/app/__tests__/` is a valid follow-up improvement, but it must be done in a dedicated task (not mixed into unrelated backend work).

## Placement guidance

- Put code near the runtime/workspace that owns it:
  - mobile app code/tests in `apps/mobile/**`
  - Supabase backend assets in `supabase/**`
  - cross-stack orchestration in repo-root `e2e/**` and/or shared `scripts/**` (as documented)
- Prefer one canonical location per test/tool type and document exceptions in `docs/specs/06-testing-strategy.md`.
- If a new folder becomes canonical for a subsystem or test type, update this doc and any impacted templates/playbook references in the same task.

## Known cleanup opportunities (tracked)

- Rationalize mobile test placement currently under `apps/mobile/app/__tests__/` into a dedicated mobile test directory (deferred to a dedicated follow-up task).
- Standardize repo-level quality gate command wrappers once backend fast-test lanes are added (tracked in M5 follow-up tasking).
