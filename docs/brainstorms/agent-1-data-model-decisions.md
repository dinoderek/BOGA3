# Agent 1 Data Model Decisions

Status: decision packet for later implementation work.

This document is intentionally a planning deliverable. It does not implement schema, migrations, sync changes, UI, or analytics code. The decisions here are meant to unblock the first Boga Native feature recovery wave while preserving Boga3's local-first SQLite plus Supabase sync architecture.

## Summary

Adopt the simplest first-wave model: each exercise has exactly one primary muscle group, stored directly on `exercise_definitions`. Do not port old Boga's weighted multi-muscle attribution model. Keep `exercise_muscle_mappings` as compatibility/future-only data until a dedicated cleanup task decides whether to remove it.

Import only exercise names plus primary muscle group now. Defer `bodyweight_coefficient`, `movement_pattern`, `equipment_type`, and `plane_of_motion`. Add synced user-owned exercise favorites, synced training settings, nullable session-level `bodyweight_kg` snapshots, and keep the current `exercise_sets.set_type` RIR labels. Compute analytics on read; do not add analytics tables yet.

## Decision Table

| Area | Decision | Rationale | Schema impact | Sync impact | Implementation owner/follow-up |
| --- | --- | --- | --- | --- | --- |
| Primary muscle model | Add `primary_muscle_group_id` to `exercise_definitions`; treat `exercise_muscle_mappings` as compatibility/future-only. | A direct column enforces the product simplification in the main read path and makes picker filters and analytics queries obvious. | Add nullable-then-required primary muscle FK locally and in Supabase after backfill; backfill from current primary mappings. | In sync scope: extend `exercise_definitions` upsert/projection/restore payloads with `primary_muscle_group_id`; keep existing mapping sync only for compatibility until cleanup. | Agent 2 exercise database/schema task. |
| Exercise catalog shape | Add/import exercise `name` and `primary_muscle_group_id` only. | The first recovery wave needs a bigger catalog and primary-muscle filters, not extra metadata. | No first-wave columns for bodyweight coefficient, movement pattern, equipment, or plane. | Only the expanded `exercise_definitions` payload changes. | Agent 2 catalog import task. |
| Bodyweight coefficient | Defer. | User decision: bodyweight-aware exercise metadata is not part of the first catalog wave. | No `bodyweight_coefficient` column now. | Out of sync scope for this wave; document the deferred field in specs/task notes when implemented later. | Future analytics metadata task. |
| Exercise favorites | Add `exercise_favorites` as user-owned soft-deletable data. | Favorites are per-user state and must work for system and user-created exercises. | New local table with stable id, `exercise_definition_id`, `created_at`, `updated_at`, `deleted_at`; unique active favorite per exercise. | In sync scope: new backend projection table and `exercise_favorites` `upsert`/`delete` events. | Agent 2 or parallel Agent 3 exercise picker task. |
| Training settings | Add synced training settings separate from auth/profile. | Account profile is identity data; training settings are user-owned app preferences that should restore across devices. | New singleton local `training_settings` row with RM method, current bodyweight, and RIR defaults/settings. | In sync scope: backend projection plus `training_settings` `upsert`; restore/bootstrap includes it. | Agent 4 settings task. |
| Session bodyweight snapshot | Add nullable `sessions.bodyweight_kg`. | Historical session analytics should not change when current bodyweight changes. | Add nullable real/decimal-compatible field; existing rows remain null. | In sync scope: extend `sessions` upsert/complete projection and restore payloads. | Agent 4 settings plus recorder integration, or separate session schema task. |
| RIR semantics | Keep current `exercise_sets.set_type`. | Existing local, UI, and sync support already use `warm_up`, `rir_0`, `rir_1`, `rir_2`, and `null`; splitting now adds churn without first-wave benefit. | No schema split into `set_kind` and `rir`. | Existing `exercise_sets.set_type` sync remains canonical. | Recorder/analytics task. |
| Analytics storage | Compute on read. | Current data size and dashboard scope do not justify cache invalidation complexity. | No analytics tables. | No analytics sync scope. Analytics are derived from synced logged sessions and metadata. | Analytics engine task. |

## Detailed Decisions

### 1. Primary Muscle Model

Adopted recommendation: add `primary_muscle_group_id` directly to `exercise_definitions`.

Current Boga3 has `exercise_muscle_mappings` with `weight` and `role`, and some current seed data already allows more than one `primary` mapping for an exercise. That shape served the earlier muscle-mapping foundation, but it keeps the old weighted-attribution door open. The recovery wave explicitly wants the opposite: one primary muscle per exercise.

Schema impact:

- Add `exercise_definitions.primary_muscle_group_id` referencing `muscle_groups.id`.
- Backfill from existing mappings by choosing one mapping per exercise:
  - prefer a mapping with `role = 'primary'`;
  - if multiple primaries exist, use a deterministic reviewed mapping table in the import/backfill task, not arbitrary SQL ordering;
  - if no primary exists, use the highest-weight mapping only as a temporary migration aid and record rows needing review.
- After backfill and review, make new saves require exactly one primary muscle.
- Keep `exercise_muscle_mappings` in place initially for compatibility and possible future multi-muscle work, but stop using it as the product source of truth for first-wave picker filtering and analytics.

Sync impact:

- In sync scope.
- Extend `exercise_definitions` event payloads, backend projection, bootstrap restore, and reinstall parity comparisons with `primary_muscle_group_id`.
- Do not add a new primary-muscle event type; the primary muscle is part of the `exercise_definitions` `upsert`.
- Keep `exercise_muscle_mappings` in the M13 sync scope until a dedicated cleanup removes or reclassifies it. During the first wave, mapping rows are compatibility/future-only and must not be required for primary-muscle filtering or analytics.

Rejected alternatives:

- Constrain `exercise_muscle_mappings` to exactly one `role = 'primary'`: rejected because it leaves the main model as a relationship table with role/weight semantics, requires partial unique constraints locally and in Supabase, and keeps secondary/stabilizer attribution in the active product path.
- Keep current multi-mapping behavior: rejected because it conflicts with the recovery-wave simplification and current seed data already demonstrates ambiguity.

Test implications:

- Update `apps/mobile/app/__tests__/domain-schema-migrations.test.ts` for the new local column and backfill migration.
- Update `apps/mobile/app/__tests__/exercise-catalog-repository.test.ts` and screen tests so save/list requires exactly one primary muscle.
- Update seed validation tests so every system exercise has exactly one primary muscle.
- Update sync event, bootstrap merge, and reinstall parity tests for the new `exercise_definitions.primary_muscle_group_id` payload.
- Add backend contract coverage in `supabase/tests/sync-events-ingest-contract.sh` for the new projection field.

### 2. Expanded Exercise Catalog Shape

Adopted recommendation: import exercise names plus one primary muscle group now.

Old Boga's `repositories/muscle_load.json` has 373 exercises and useful fields: `bodyweight_coefficient`, `movement_pattern`, `equipment_type`, `plane_of_motion`, and weighted `muscle_attribution`. For this first recovery wave, only names and primary muscle are first-class Boga3 metadata.

Fields to add now:

- `name`
- `primary_muscle_group_id`

Fields explicitly deferred:

- `bodyweight_coefficient`
- `movement_pattern`
- `equipment_type`
- `plane_of_motion`
- weighted `muscle_attribution`

Why:

- Primary-muscle filtering and identity-based analytics need the name and primary muscle only.
- The user decision for this packet is to defer bodyweight coefficient.
- Movement pattern, equipment, and plane are not required by the first-wave UI or analytics.
- Weighted attribution is explicitly out of scope.

Implementation notes:

- Build an explicit old-muscle-to-Boga3-primary mapping review table for catalog import rather than deriving primaries silently from the old weighted array.
- Current Boga3 muscle groups live in `apps/mobile/src/data/exercise-catalog-seeds.ts`; import work should map old IDs such as `pectoralis_major` and `quadriceps_femoris` into the existing Boga3 taxonomy.
- Existing system seed docs and validation should be updated so there is one clear primary per exercise.

### 3. Exercise Favorites

Adopted recommendation: add a new user-owned `exercise_favorites` entity.

Recommended local schema shape:

- `id` text primary key.
- `exercise_definition_id` text not null, FK to `exercise_definitions.id`.
- `created_at` timestamp ms not null.
- `updated_at` timestamp ms not null.
- `deleted_at` timestamp ms nullable.
- Unique active favorite per `exercise_definition_id`.

Recommended backend projection shape:

- `app_public.exercise_favorites`
- `owner_user_id` not null with RLS.
- Same domain fields as local, with owner-scoped uniqueness.
- FK should enforce same-owner access for user-created definitions where applicable.

Sync event types:

- `exercise_favorites` supports `upsert` and `delete`.
- `delete` is a soft-delete projection that sets `deleted_at`.
- `upsert` with `deleted_at = null` handles re-favorite/undelete.

Deletion semantics:

- Use soft-delete to make retry, restore, and re-favorite idempotent.
- The UI should hide deleted favorites by default.
- If an exercise definition is deleted, favorite rows may remain as tombstoned or hidden state; do not cascade hard-delete user sync history.

Tests needed:

- Repository tests for favorite, unfavorite, re-favorite, duplicate prevention, and deleted exercise behavior.
- Picker ordering tests for favorites-first behavior.
- Sync domain event tests for `exercise_favorites` `upsert` and `delete`.
- Backend ingest/projection tests for owner scoping and idempotent favorite updates.
- Restore parity tests including favorites.

Rejected alternatives:

- Boolean `is_favorite` on `exercise_definitions`: rejected because exercise definitions are shared between system and user-created semantics while favorite state is clearly per-user state.
- Local-only favorites: rejected because favorites are user-owned preference data and should restore with sync.

### 4. Training Settings

Adopted recommendation: add synced training settings outside auth/profile.

Settings in scope:

- RM method: `Epley | Brzycki | Lombardi | BoGa`.
- Current bodyweight in kg.
- RIR defaults/settings needed by the first logging workflow.

Recommended local shape:

- `training_settings`
- singleton row id, for example `primary`.
- `rm_method` text not null default `Epley`.
- `current_bodyweight_kg` real nullable.
- `default_set_type` text nullable, constrained to `warm_up | rir_0 | rir_1 | rir_2 | null` if implemented.
- `created_at` and `updated_at`.

Backend/sync scope:

- In sync scope.
- Add `app_public.training_settings` projection with one row per owner.
- Add sync entity type `training_settings` with `upsert`.
- A hard delete event is not needed for first wave; clearing individual values should use nullable fields in an `upsert`.
- Bootstrap/restore must include settings before recorder defaults are applied.

Retroactivity:

- RM method is a display-time preference and is retroactive for analytics display.
- Current bodyweight is a default for new sessions only.
- Historical analytics use `sessions.bodyweight_kg` when present, not current bodyweight.
- RIR defaults affect future logging only; existing sets keep their stored `set_type`.

Validation constraints:

- `rm_method` must be one of `Epley`, `Brzycki`, `Lombardi`, `BoGa`.
- `current_bodyweight_kg` is nullable or positive.
- Default RIR/set type must use the existing `set_type` enum or null.

Tests needed:

- Settings repository tests for defaults, validation, update, and persistence.
- Sync event tests for settings `upsert`.
- Bootstrap/restore tests proving settings restore before recorder defaults are read.
- Profile/settings UI tests once the settings screen is added.

Rejected alternatives:

- Extend `app_public.user_profiles`: rejected because profile owns identity/account fields, while training settings are app-domain preferences.
- Local-only settings: rejected by user decision; these settings should sync.
- Store settings only in AsyncStorage: rejected because this project uses SQLite for local domain state and syncable user data.

### 5. Session Bodyweight Snapshot

Adopted recommendation: add nullable `sessions.bodyweight_kg`.

Schema field recommendation:

- Add `bodyweight_kg` to local `sessions`.
- Add `bodyweight_kg` to `app_public.sessions`.
- Use a numeric type compatible with existing SQLite/Supabase conventions; validate positive when non-null.

Requiredness, nullability, and backfill:

- Nullable.
- Existing sessions backfill to null.
- Do not infer historical bodyweight from current settings during migration; that would rewrite history with a preference that may not have existed when the session happened.

Recorder default behavior:

- New sessions copy `training_settings.current_bodyweight_kg` into the session draft at creation time when available.
- If settings bodyweight is null, the session snapshot starts null.
- Editing the current setting later does not mutate active or completed sessions automatically.

Completed-edit behavior:

- Completed session edit should allow changing the session bodyweight snapshot once UI support exists.
- Changing the completed session snapshot updates the session row and emits a `sessions` upsert/complete-compatible sync event.

Sync contract changes:

- In sync scope.
- Add `bodyweight_kg` to `sessions` upsert payloads, backend projection, bootstrap reads, convergence upserts, and restore parity snapshots.
- Preserve nullable behavior for legacy rows and older local data.

Tests needed:

- Migration test for nullable column and positive guard.
- Session draft repository test for defaulting from settings.
- Completed-edit repository/screen test for snapshot persistence.
- Sync event emission and backend projection tests for `bodyweight_kg`.
- Restore parity test for null and non-null snapshots.

Rejected alternatives:

- Set-level bodyweight: rejected because bodyweight changing inside one workout is not a first-wave product problem.
- Current bodyweight only: rejected because historical analytics would drift when settings change.

### 6. RIR Semantics

Adopted recommendation: keep `exercise_sets.set_type`.

Current supported values:

- `warm_up`
- `rir_0`
- `rir_1`
- `rir_2`
- `null`

Rationale:

- Existing local schema, recorder UI, normalizer, and M13/M14 sync projection already support this field.
- Warm-up is not technically RIR, but the current field is a practical first-wave logging label.
- Splitting now into `set_kind` plus numeric `rir` would require local migrations, backend migrations, ingest changes, restore changes, and UI rewiring before analytics has proven it needs the extra precision.

Migration impact:

- No first-wave migration.
- If future analytics needs independent warm-up/exertion dimensions, introduce a dedicated migration from:
  - `warm_up` -> `set_kind = warm_up`, `rir = null`
  - `rir_0` -> `set_kind = work`, `rir = 0`
  - `rir_1` -> `set_kind = work`, `rir = 1`
  - `rir_2` -> `set_kind = work`, `rir = 2`
  - `null` -> both null/defaults

Analytics behavior:

- For first-wave volume and 1RM, RIR is annotation only.
- `warm_up` may be excluded from record/best-set analytics if the analytics feature explicitly chooses that behavior, but the data model does not force exclusion.
- RIR values should be available for display and later filtering/trend analysis.

Tests needed:

- Keep existing set-type persistence and sync tests.
- Add analytics tests proving first-wave calculations do not change by RIR value unless a specific analytics rule says otherwise.
- Add recorder-default tests if `training_settings.default_set_type` is implemented.

Rejected alternatives:

- Split into `set_kind` and `rir` now: rejected due to churn and no immediate first-wave calculation need.
- Port old Boga `GrindLevel` exactly: rejected because Boga3 already has a compact RIR-oriented enum and the old model includes values not currently in scope, such as cooldown.

### 7. Analytics Storage

Adopted recommendation: compute analytics on read for the first wave.

Analytics should be derived from:

- completed `sessions`;
- `session_exercises.exercise_definition_id`;
- `exercise_sets.weight_value`, `reps_value`, and `set_type`;
- `sessions.bodyweight_kg` when later bodyweight-aware exercise metadata exists;
- `training_settings.rm_method` for display-time 1RM formula selection;
- `exercise_definitions.primary_muscle_group_id` for primary-muscle grouping.

No analytics tables should be added now.

Performance risk:

- Low for the current MVP data size.
- Parsing text `weight_value` and `reps_value` repeatedly is acceptable initially but should be isolated inside an analytics service so it can be optimized later.

Future trigger for materialization:

- Add materialized summaries only when profiling shows completed-session history or dashboard queries are too slow on realistic local data.
- Another trigger is the introduction of expensive cross-session dashboards, multi-device conflict reconciliation for derived values, or server-side social/leaderboard analytics.

Rejected alternatives:

- Materialized local analytics tables now: rejected because invalidation across edits, deletes, reopens, settings changes, and metadata edits is more complex than the current product needs.
- Backend analytics projection now: rejected because first-wave analytics are user-facing local read models, not a backend sharing feature.

## Proposed Implementation Sequence

1. Exercise primary-muscle schema and sync foundation.
   - Add `exercise_definitions.primary_muscle_group_id` locally and in Supabase.
   - Backfill from current mappings with a reviewed exception list.
   - Extend `exercise_definitions` sync payloads, projection, bootstrap, and restore parity.
   - Update authoritative docs: `docs/specs/05-data-model.md`, `docs/specs/03-technical-architecture.md`, `docs/specs/06-testing-strategy.md`, and `supabase/session-sync-api-contract.md`.

2. Exercise catalog import.
   - Import old Boga exercise names and reviewed primary muscle mappings only.
   - Update seed validation to require exactly one primary per exercise.
   - Remove or hide secondary-muscle editing from first-wave UI paths if still present.
   - Can start after step 1 schema contract is clear.

3. Exercise favorites.
   - Add `exercise_favorites` local schema, repository, sync entity type, backend projection, picker ordering, and tests.
   - Can run in parallel with step 4 after the sync entity-extension pattern is established.

4. Training settings.
   - Add synced `training_settings` storage and repository.
   - Add settings UI later under the current settings/profile navigation structure.
   - Can run in parallel with favorites because it owns a separate table/entity.

5. Session bodyweight snapshot.
   - Add nullable `sessions.bodyweight_kg`.
   - Wire new-session default from `training_settings.current_bodyweight_kg`.
   - Add completed-edit support after the repository contract exists.
   - Depends on training settings for defaulting, but schema/sync work can begin earlier.

6. Analytics engine.
   - Add read-time analytics service for volume, estimated 1RM, per-exercise totals, and history comparisons.
   - Use RM method from training settings and logged session data.
   - Treat RIR as annotation only in the first version.
   - Depends on primary-muscle and bodyweight snapshot contracts; does not depend on bodyweight coefficient because that field is deferred.

Parallelization:

- Agent 2: primary-muscle schema/sync plus catalog import.
- Agent 3: favorites repository/sync/UI once entity-extension pattern is ready.
- Agent 4: training settings plus session bodyweight snapshot.
- Agent 5: analytics engine after the data contracts above are stable.

## Files Expected To Change Later

Local schema:

- `apps/mobile/src/data/schema/exercise-definitions.ts`
- `apps/mobile/src/data/schema/sessions.ts`
- `apps/mobile/src/data/schema/index.ts`
- new `apps/mobile/src/data/schema/exercise-favorites.ts`
- new `apps/mobile/src/data/schema/training-settings.ts`
- `apps/mobile/src/data/migrations/index.ts`
- `apps/mobile/drizzle/**`

Repositories:

- `apps/mobile/src/data/exercise-catalog.ts`
- `apps/mobile/src/data/exercise-catalog-seeds.ts`
- `apps/mobile/src/data/session-drafts.ts`
- `apps/mobile/src/data/session-list.ts`
- new exercise favorites repository module
- new training settings repository module

Sync:

- `apps/mobile/src/sync/types.ts`
- `apps/mobile/src/sync/outbox.ts` only if helper typing needs changes
- `apps/mobile/src/sync/bootstrap.ts`
- sync event emitters in data repositories

Supabase:

- `supabase/migrations/**`
- `supabase/session-sync-api-contract.md`
- `supabase/tests/sync-events-ingest-contract.sh`

UI:

- `apps/mobile/app/exercise-catalog.tsx`
- `apps/mobile/app/session-recorder.tsx`
- `apps/mobile/app/completed-session/[sessionId].tsx`
- `apps/mobile/app/settings.tsx`
- `apps/mobile/app/profile.tsx` only if navigation/account presentation needs links
- exercise catalog/editor components under `apps/mobile/components/**`

Tests:

- `apps/mobile/app/__tests__/domain-schema-migrations.test.ts`
- `apps/mobile/app/__tests__/exercise-catalog-repository.test.ts`
- `apps/mobile/app/__tests__/exercise-catalog-seeds.test.ts`
- `apps/mobile/app/__tests__/exercise-catalog-screen.test.tsx`
- `apps/mobile/app/__tests__/session-drafts-repository.test.ts`
- `apps/mobile/app/__tests__/sync-domain-event-emission.test.ts`
- `apps/mobile/app/__tests__/sync-bootstrap-merge.test.ts`
- `apps/mobile/app/__tests__/sync-reinstall-restore-parity.test.ts`
- new favorites/settings/analytics tests as features land

Docs:

- `docs/specs/05-data-model.md`
- `docs/specs/03-technical-architecture.md`
- `docs/specs/06-testing-strategy.md`
- milestone/task docs for the implementation wave
- `RUNBOOK.md` only if implementation changes commands, runtime setup, fixtures, or operator workflows

## Testing Strategy

Local data and migration tests:

- Assert new columns/tables exist and constraints are present.
- Assert primary-muscle migration/backfill handles current seed exceptions deterministically.
- Assert legacy sessions have null `bodyweight_kg`.
- Assert settings defaults are created or read safely when absent.

Repository/domain tests:

- Exercise catalog requires exactly one primary muscle and no longer depends on secondary mappings for first-wave reads.
- Favorites support favorite, unfavorite, re-favorite, and duplicate prevention.
- Training settings validate RM method, bodyweight, and default set type.
- Session drafts copy current bodyweight into new sessions without mutating historical sessions after setting changes.
- Analytics calculations parse set values defensively and compute on read from completed sessions only.

Sync tests:

- `sync-domain-event-emission.test.ts` covers:
  - `exercise_definitions.primary_muscle_group_id`;
  - `exercise_favorites` `upsert`/`delete`;
  - `training_settings` `upsert`;
  - `sessions.bodyweight_kg`.
- `sync-bootstrap-merge.test.ts` covers restore/merge for all new synced fields/entities.
- `sync-reinstall-restore-parity.test.ts` includes favorites, training settings, primary muscle, and session bodyweight.

Backend tests:

- `supabase/tests/sync-events-ingest-contract.sh` covers ingest/projection validation for new fields/entities.
- RLS/owner tests cover favorites and training settings.
- Duplicate/idempotent event tests cover favorite replays and settings replays.

UI tests:

- Exercise picker/catalog tests cover primary-muscle filtering and favorites-first ordering.
- Settings tests cover training settings display/update validation.
- Recorder tests cover bodyweight defaulting and RIR default behavior if exposed.
- Completed-session tests cover bodyweight edit/display and analytics display once implemented.

Slow gates:

- Not required for this planning document.
- Later implementation tasks should run `./scripts/quality-fast.sh` by default.
- Run `./scripts/quality-slow.sh backend` for Supabase migration/RLS/ingest changes.
- Run `./scripts/quality-slow.sh frontend` only when UI/runtime-sensitive recorder or Maestro-covered behavior changes.

## Open Questions

- Primary-muscle backfill for exercises that currently have multiple primary mappings needs a reviewed mapping list. Current seed data includes at least `sys_romanian_deadlift` with multiple primaries, so implementation should not rely on arbitrary ordering.
- Decide in the implementation task whether to remove secondary-muscle UI immediately or leave it hidden/disabled while `exercise_muscle_mappings` remains compatibility/future-only.
- Future bodyweight-aware analytics need a separate decision to add `bodyweight_coefficient` and define whether it is user-editable exercise metadata or system-only catalog metadata.

