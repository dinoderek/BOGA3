# Agent 2 Instructions: Exercise Database Implementation Packet

Status: delegation packet for implementation work.

You are Agent 2. Your job is to implement the first Exercise Database wave for Boga3, using Agent 1's data-model decisions as the source of truth.

This is not a free-for-all. Do not touch unrelated UX, analytics UI, gesture shortcuts, training settings UI, or completed-session analytics. Your scope is the exercise database foundation.

## Mission

Implement Group A foundation:

1. Add first-class primary muscle support to exercise definitions.
2. Keep the app primary-muscle-only for this wave.
3. Prepare/import an expanded exercise catalog from old Boga's larger dataset, using one primary muscle group per exercise.
4. Update sync/data-model docs and tests for the changed exercise definition contract.

Important simplification:

- Do not port old Boga's weighted multi-muscle attribution model.
- Do not implement muscle-volume analytics.
- Do not add secondary/stabilizer picker semantics.
- Each exercise gets exactly one primary muscle group. Anything more is `architecture theatre`.

## Repositories

Current project:

- `C:\Users\sbosc\code\BOGA3`

Old Boga reference project:

- `C:\Users\sbosc\code\boga-native`

Use old Boga only as source/reference data. Boga3 architecture and specs win.

## Required Context To Load

From Boga3:

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/specs/00-product.md`
- `docs/specs/03-technical-architecture.md`
- `docs/specs/04-ai-development-playbook.md`
- `docs/specs/05-data-model.md`
- `docs/specs/06-testing-strategy.md`
- `docs/specs/09-project-structure.md`
- `docs/brainstorms/boga-native-feature-recovery.md`
- `docs/brainstorms/agent-1-data-model-decisions.md`
- `RUNBOOK.md`

Because this touches UI-facing catalog behavior, also load:

- `docs/specs/08-ux-delivery-standard.md`
- `docs/specs/ui/README.md`
- `docs/specs/ui/screen-map.md`
- `docs/specs/ui/navigation-contract.md`
- `docs/specs/ui/components-catalog.md`
- `docs/specs/ui/ux-rules.md`

## Current Worktree Warning

Agent 1 may have left premature schema edits in the worktree. Before changing anything, inspect:

- `git status --short`
- `git diff -- apps/mobile/src/data/schema/exercise-definitions.ts`
- `git diff -- apps/mobile/src/data/schema/sessions.ts`
- `git diff -- apps/mobile/src/data/schema/index.ts`
- `apps/mobile/src/data/schema/exercise-favorites.ts`
- `apps/mobile/src/data/schema/training-settings.ts`

Your scope is **exercise database**, not training settings or bodyweight snapshots.

Handle the dirty worktree like this:

1. Keep and complete only exercise-database changes that fit this task.
2. Do not expand or rely on training settings/bodyweight/favorites files unless the user explicitly says those changes should stay in this wave.
3. Do not revert user/other-agent edits unless explicitly authorized.
4. If unrelated dirty files make tests fail, report them clearly rather than silently "fixing" them outside scope.

## Boga3 Files To Inspect

Primary schema and seed files:

- `apps/mobile/src/data/schema/exercise-definitions.ts`
- `apps/mobile/src/data/schema/exercise-muscle-mappings.ts`
- `apps/mobile/src/data/schema/muscle-groups.ts`
- `apps/mobile/src/data/schema/index.ts`
- `apps/mobile/src/data/exercise-catalog.ts`
- `apps/mobile/src/data/exercise-catalog-seeds.ts`
- `apps/mobile/src/exercise-catalog/search.ts`

Sync:

- `apps/mobile/src/sync/types.ts`
- `apps/mobile/src/sync/bootstrap.ts`
- `apps/mobile/src/sync/outbox.ts`
- `apps/mobile/src/sync/runtime.ts`
- `supabase/session-sync-api-contract.md`
- `supabase/migrations/**`
- `supabase/tests/**`

UI consumers to keep compatible:

- `apps/mobile/app/exercise-catalog.tsx`
- `apps/mobile/app/session-recorder.tsx`
- `apps/mobile/components/exercise-catalog/exercise-editor-modal.tsx`

Tests:

- `apps/mobile/app/__tests__/domain-schema-migrations.test.ts`
- `apps/mobile/app/__tests__/exercise-catalog-repository.test.ts`
- `apps/mobile/app/__tests__/exercise-catalog-seeds.test.ts`
- `apps/mobile/app/__tests__/exercise-catalog-screen.test.tsx`
- `apps/mobile/app/__tests__/session-recorder-screen.test.tsx`
- `apps/mobile/app/__tests__/sync-domain-event-emission.test.ts`
- `apps/mobile/app/__tests__/sync-bootstrap-merge.test.ts`
- `apps/mobile/app/__tests__/sync-reinstall-restore-parity.test.ts`

## Old Boga Reference Files

Use these only for catalog and intent:

- `C:\Users\sbosc\code\boga-native\repositories\muscle_load.json`
- `C:\Users\sbosc\code\boga-native\repositories\muscle_groups.json`
- `C:\Users\sbosc\code\boga-native\repositories\exerciseRepository.ts`
- `C:\Users\sbosc\code\boga-native\components\ExerciseSelector.tsx`

Useful old commits:

- `a0c7270 feat: add muscle group filter to exercise selector`
- `91b7713 feat: add threshold filtering to exercise muscle groups`
- `412bb2c feat: add muscle group mapping`

Do not port threshold/weighted filtering. Boga3 now filters by primary muscle only.

## Implementation Scope

### A. Primary Muscle On Exercise Definitions

Implement Agent 1's decision:

- `exercise_definitions` should own `primary_muscle_group_id`.
- It should reference `muscle_groups.id`.
- New/updated exercises must have one primary muscle group.
- The existing `exercise_muscle_mappings` table remains for compatibility/future work, but it is not the first-wave source of truth for picker filtering or analytics.

Tasks:

1. Add local schema support for `primary_muscle_group_id`.
2. Add migration/backfill support.
3. Update repository read/write paths to use `primary_muscle_group_id`.
4. Keep existing mapping behavior from breaking current screens where possible, but simplify first-wave save semantics.
5. Update local seed validation so each seeded exercise has exactly one primary muscle group.

Backfill rule:

- Prefer an existing `role = 'primary'` mapping.
- If more than one primary exists, do not choose arbitrarily. Add an explicit reviewed mapping in code/data for that exercise.
- If no primary exists, use an explicit reviewed mapping, not silent highest-weight inference unless documented in tests.

### B. Expanded Catalog Import

Use old Boga's `muscle_load.json` as source material.

First-wave import fields:

- exercise name
- primary muscle group

Deferred fields:

- bodyweight coefficient
- movement pattern
- equipment type
- plane of motion
- weighted muscle attribution

Tasks:

1. Build a deterministic mapping from old muscle identifiers/names to Boga3 primary muscle groups.
2. Expand `SYSTEM_EXERCISE_DEFINITION_SEEDS`.
3. Ensure each imported exercise has one primary muscle group.
4. Add seed validation coverage for duplicate names, missing primary muscle, unknown primary muscle, and reviewed exceptions.
5. Keep the expanded seed dataset maintainable. If the data becomes too large for the existing file, propose or implement a reasonable split under `apps/mobile/src/data/` without changing project conventions casually.

Do not import all old metadata just because it exists. Existing does not mean useful. That lesson should not require a committee.

### C. Exercise Catalog API Compatibility

Current code returns exercises with `mappings`. Decide the smallest safe compatibility path:

- either add `primaryMuscleGroupId` to `ExerciseCatalogExercise` while preserving `mappings` temporarily;
- or adapt existing mapping-derived UI to read the new primary directly.

Keep downstream UI compiling and tested.

Required behavior:

- Listing exercises exposes primary muscle.
- Saving/creating an exercise requires primary muscle.
- Editing an exercise updates primary muscle.
- Deleted/undeleted exercise behavior remains unchanged.
- Existing session recorder picker still works.

### D. Sync Contract

Primary muscle is in sync scope.

Tasks:

1. Extend mobile sync payloads for `exercise_definitions` with `primary_muscle_group_id`.
2. Extend Supabase projection table/schema.
3. Extend ingest contract validation/projection.
4. Extend restore/bootstrap logic.
5. Extend reinstall parity coverage.
6. Update `supabase/session-sync-api-contract.md`.

Do not add a separate primary-muscle event type. It belongs to `exercise_definitions` `upsert`.

## Required Docs Updates

If you implement this, update:

- `docs/specs/05-data-model.md`
- `docs/specs/03-technical-architecture.md` if sync/entity behavior changes beyond field addition
- `docs/specs/06-testing-strategy.md` if test expectations change
- `docs/specs/ui/*` only if route/screen/component semantics change
- `supabase/session-sync-api-contract.md`

Review `RUNBOOK.md`; update it only if operator commands/workflows change. If not, mention `RUNBOOK.md reviewed; no changes required` in closeout.

## Acceptance Criteria

1. Exercise definitions have first-class `primary_muscle_group_id` locally.
2. Supabase projection/sync contract includes `primary_muscle_group_id`.
3. Bootstrap/restore preserves primary muscle.
4. Seed validation requires every system exercise to have one valid primary muscle.
5. Existing current seed ambiguity is resolved explicitly, not by accidental ordering.
6. Expanded catalog imports old Boga exercises into Boga3 with primary muscle only.
7. Exercise catalog repository can create/edit/list exercises with primary muscle.
8. Exercise picker/catalog screens still compile and pass relevant tests.
9. No weighted muscle attribution or muscle-volume feature is introduced.
10. Relevant docs are updated.

## Testing Requirements

Run targeted tests first:

- `cd apps/mobile && npm run test -- exercise-catalog-seeds`
- `cd apps/mobile && npm run test -- exercise-catalog-repository`
- `cd apps/mobile && npm run test -- domain-schema-migrations`
- `cd apps/mobile && npm run test -- sync-domain-event-emission`
- `cd apps/mobile && npm run test -- sync-bootstrap-merge`

If sync/Supabase changes are implemented, also run the relevant backend contract tests:

- `./scripts/quality-fast.sh backend`
- `./scripts/quality-slow.sh backend` if migrations/ingest/projection changed

Closeout gate:

- `./scripts/quality-fast.sh`

If a required gate cannot run because of unrelated dirty worktree or environment issues, document exactly what failed and why.

## Non-Goals

Do not implement:

- exercise favorites;
- training settings;
- session bodyweight snapshots;
- RIR UX;
- real-time metrics;
- historical comparison;
- completed-session analytics;
- gesture shortcuts;
- old weighted muscle attribution;
- old HMAC/Narrator sync;
- bodyweight coefficient metadata.

If you discover those are necessary to complete this task, stop and report the dependency instead of smuggling it into the patch.

## Expected Final Response

Report:

1. What changed.
2. Which old Boga files/data were used.
3. How primary muscle is represented.
4. How sync payload/projection changed.
5. What tests ran and their results.
6. Any remaining risks or follow-up tasks.

Keep the summary concise. The code and tests should do the talking; paragraphs trying to compensate for weak implementation are usually a confession.

