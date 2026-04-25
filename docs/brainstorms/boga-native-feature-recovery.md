# Boga Native Feature Recovery Inventory

Status: planning note, not authoritative spec.

Source inspected:
- Current Boga3 repo: `C:\Users\sbosc\code\BOGA3`
- Old Boga repo: `C:\Users\sbosc\code\boga-native`, branch `main`
- Old history signals: recent log plus feature commits including analytics, bodyweight, muscle mapping, wheel picker, grind, starred exercises, muscle filters, swipe delete, and best-effort sync.

## Executive Summary

Boga3 has the better foundation: Expo Router structure, local SQLite/Drizzle schema, editable exercise catalog, tags, auth/profile, and Supabase-backed sync. The old app had the more interesting training intelligence. The features worth recovering are mostly analytics/configuration/input-speed features, not the old architecture.

Do not port old code blindly. The old app stored sessions as coarse JSON in one table and used in-memory config for several settings. Boga3 has a normalized data model and sync contract, so each recovered feature needs a clean data-model/sync decision.

## Actual Port Roadmap

This is the current intended grouping and order.

### Group A: Exercise Database

1. **Primary-muscle exercise catalog**
   - Expand Boga3's exercise database using old Boga's larger catalog as source material.
   - Simplify the model: each exercise gets one primary muscle group.
   - Do not port old Boga's multi-muscle attribution / weighted muscle-load model yet.

2. **Exercise picker primary-muscle filters**
   - Add explicit filter chips/dropdowns by primary muscle group.
   - Keep text search.
   - Filtering should be based on the exercise's primary muscle only, not secondary/stabilizer contribution.

3. **Exercise favorites**
   - Add star/favorite support for exercises.
   - Surface favorites first in the exercise picker.
   - Treat as user-owned data; sync decision required before implementation.

### Group B: Logging UX

4. **Faster set-entry controls**
   - Add a better reps/weight entry workflow than plain text fields.
   - Prefer stepper/wheel-style controls plus direct text editing.
   - Do not blindly port the old wheel picker dependency; port the interaction idea.

5. **Gesture shortcuts**
   - Add double-tap or similarly fast action to add a set.
   - Consider swipe-delete after the visible controls are solid.
   - Gestures must remain shortcuts, not the only path.

6. **RIR logging UX**
   - Keep Boga3's current set-type direction but make RIR part of the logging workflow deliberately.
   - Target labels: warm-up, RIR 2, RIR 1, RIR 0.
   - RIR must be easy to set while logging, not buried in a slow modal.

### Group C: Analytics

7. **Simplified training settings**
   - RM method.
   - Current bodyweight.
   - RIR logic/defaults.
   - Avoid reviving the full old configuration screen. Bring back only what analytics and logging actually need.

8. **Bodyweight snapshot for historical comparison**
   - Store bodyweight with logged training data so old sessions remain comparable even after current bodyweight changes.
   - Preferred first model: session-level `bodyweight_kg` snapshot, because bodyweight changing inside one workout is not a real product problem.
   - This is a data-model and sync-scope change.

9. **Real-time metrics in recorder**
   - Show useful live metrics while logging:
     - estimated 1RM,
     - set volume,
     - comparison against historical records.
   - Use primary-muscle metadata only; no muscle attribution math for now.

10. **Historical exercise comparison**
   - For selected exercises, show historical bests from completed sessions:
     - best estimated 1RM,
     - heaviest lift,
     - longest set,
     - max volume.
   - Compare by exercise identity, not display name.

11. **Completed-session metrics / analytics**
   - Add completed-session totals and breakdowns:
     - total volume,
     - best 1RM,
     - per-exercise volume,
     - per-set derived metrics.
   - No muscle-volume table until/if multi-muscle attribution returns.

## Add To Boga3

### 1. Training Metrics Engine

Old source:
- `services/metrics.ts`
- `services/setCalculationService.ts`
- `services/setsCalculationService.ts`
- `types/set.model.ts`
- commits: `8f6eb95`, `35db2dc`

Old behavior:
- Calculates effective set load.
- Calculates set volume.
- Calculates estimated 1RM using `Epley`, `Brzycki`, `Lombardi`, and custom `BoGa`.
- Supports bodyweight contribution through per-exercise `bodyweightCoefficient`.
- Supports `externalLoadOnly` mode.
- Aggregates total volume, best 1RM by exercise, and muscle volume.

Boga3 state:
- Missing as an app feature.
- Boga3 currently stores raw `weightValue`, `repsValue`, and `setType`; completed-session detail shows raw rows only.
- No visible bodyweight-aware calculation service, no RM-method preference, no volume/1RM analytics UI.

Recommended Boga3 shape:
- Add a domain-level analytics module under `apps/mobile/src/analytics/` or similar.
- Use `exercise_definition_id` and current exercise muscle mappings rather than old name-only lookup.
- Add tests for formula behavior, invalid inputs, bodyweight contribution, external-load-only mode, and aggregation.
- Defer materialized analytics tables until needed; compute on read first.

Priority: P0.

### 2. Completed Session Analytics View

Old source:
- `components/SessionView.tsx`
- `components/ExerciseCard.tsx`
- `components/SetRow.tsx`
- `components/MuscleVolumeTable.tsx`

Old behavior:
- Completed session detail displayed:
  - best 1RM strip,
  - exercise count,
  - set count,
  - total volume,
  - per-exercise total volume,
  - per-set volume and 1RM,
  - collapsible muscle-volume table.

Boga3 state:
- Partially present as a raw completed-session viewer.
- `apps/mobile/app/completed-session/[sessionId].tsx` shows start/end/duration/location, exercise names, tags, and raw weight/reps.
- Missing calculated analytics.

Recommended Boga3 shape:
- Extend completed-session detail with an analytics section backed by the new metrics engine.
- Keep raw set rows visible, but add derived columns only when calculations are valid.
- Use collapsible sections for dense analytics; the old pattern was correct.

Priority: P0.

### 3. Historical Exercise Summary While Recording

Old source:
- `services/historicalSummaryService.ts`
- `services/records.ts`
- `components/ExerciseHistorySummary.tsx`
- `contexts/HistoricalSummaryContext.tsx`
- `docs/historical-summary-reactivity.md`
- commits: `f08ce25`, `1de8831`, `7f220a2`

Old behavior:
- For each exercise in the active session, showed historical records from completed sessions:
  - best 1RM,
  - heaviest lift,
  - longest set,
  - max volume.
- Historical summary only considered completed sessions.
- Refreshes after session save/delete via a lightweight reactivity path.

Boga3 state:
- Missing.
- Session recorder has no visible history strip or per-exercise record context.

Recommended Boga3 shape:
- Build history by `exercise_definition_id`, not mutable exercise name.
- Use completed sessions only.
- Exclude deleted sessions by default.
- Decide how set tags and set types affect records. Initial version can ignore tags and include all non-empty sets.
- Add an inline compact strip in `session-recorder` under each exercise header.

Priority: P0.

### 4. Expanded Exercise Catalog Import

Old source:
- `repositories/muscle_load.json`
- `repositories/muscle_groups.json`
- `repositories/exerciseRepository.ts`

Old behavior:
- `muscle_load.json` contains 373 exercises.
- Each exercise includes movement pattern, plane of motion, equipment type, bodyweight coefficient, and granular muscle attribution.
- The old selector used this as the main catalog.

Boga3 state:
- Partially present, but much smaller.
- Current system seed catalog has 14 exercise definitions and 19 muscle groups with simpler mapping weights.
- Boga3 has a proper editable catalog and sync-aware exercise definitions, which is better, but the starter catalog is thin.

Recommended Boga3 shape:
- Create a migration/import task that maps old exercise names into Boga3 `exercise_definitions`.
- Map old granular muscles to one Boga3 primary muscle group through an explicit, reviewed mapping table.
- Preserve `bodyweightCoefficient`, movement pattern, plane, and equipment only if Boga3 adds schema fields for them; otherwise import only names + muscle mappings first.
- Use source docs/tests because 373 rows of silent seed data without validation is how projects acquire sediment.

Priority: P0 for larger seed catalog; P1 for extra metadata fields.

### 5. User Training Configuration

Old source:
- `app/ConfigurationScreen.tsx`
- `contexts/ConfigurationContext.tsx`
- `repositories/ConfigurationRepository.ts`
- `types/config.ts`
- commits: `47f0ae71`, `f3b058e`

Old behavior:
- Configured RM method.
- Configured bodyweight.
- Configured `externalLoadOnly`.
- Configured set wheel picker on/off.
- Configured Grind Log on/off.

Boga3 state:
- Missing as training settings.
- Current `/settings` and `/profile` are account/sync-oriented, not training-preference-oriented.
- Boga3 has `setType` values (`warm_up`, `rir_0`, `rir_1`, `rir_2`) but no user-facing training config surface.

Recommended Boga3 shape:
- Add a training settings section, probably separate from account/profile.
- Minimum settings:
  - RM method,
  - bodyweight,
  - external load only,
  - analytics display toggles.
- Decide storage and sync scope explicitly. Bodyweight and RM method affect historical interpretation; this touches product semantics and cannot be hand-waved.

Priority: P0.

### 6. Faster Set Entry: Wheel Picker / Stepper

Old source:
- `components/SetWheelPicker.tsx`
- `contexts/SetWheelPickerContext.tsx`
- commits: `b7e2b49`, `fc89bc3`, `105a778`

Old behavior:
- Bottom-sheet wheel picker for reps, weight, and optionally grind.
- Weight allowed 0-300kg in 0.5kg increments.
- Reps allowed 0-100.
- Coordinated through context so only one set picker is active.

Boga3 state:
- Missing for reps/weight.
- Boga3 has a set-type picker, but reps/weight entry is still text-input driven.

Recommended Boga3 shape:
- Do not resurrect the exact old dependency unless it is still compatible.
- Prefer a native-feeling stepper/wheel control that fits the current UI primitives.
- Add increment/decrement affordances for weight and reps, with direct text editing still available.

Priority: P1.

### 7. Exercise Favorites / Starred Exercises

Old source:
- commit `20f5376 feat: star exercises in selector`
- files from that commit included:
  - `contexts/StarredExercisesContext.tsx`
  - `repositories/StarredExercisesRepository.ts`
  - `database/migrations/0001_starred_exercises.sql`
  - selector UI changes

Old behavior:
- Users could star exercises in the selector.
- Starred exercises were persisted and surfaced preferentially.

Boga3 state:
- Missing.
- Current search is better structured, but has no favorites/pins.

Recommended Boga3 shape:
- Add `exercise_favorites` keyed by exercise definition and owner/local user.
- Show favorites at the top of the exercise picker.
- Sync scope likely yes, but needs explicit decision.

Priority: P1.

### 8. Explicit Muscle-Group Filter Chips In Exercise Picker

Old source:
- `components/ExerciseSelector.tsx`
- `utils/muscleGroups.ts`
- commits: `a0c7270`, `91b7713`, `7683bb3`

Old behavior:
- Selector had explicit muscle-group filter pills.
- Later commit added threshold filtering so an exercise only matched a group if its muscle contribution was meaningful enough.

Boga3 state:
- Partially present.
- Current picker/catalog can text-search by exercise or muscle group.
- Missing explicit muscle-group filter chips and threshold semantics.

Recommended Boga3 shape:
- Add filter chips for primary muscle groups in the picker.
- Do not use old weighted-threshold semantics while Boga3 is primary-muscle-only.
- Keep text search as the default; filters should refine, not replace.

Priority: P1.

### 9. Ergonomic Gestures For Logging

Old source:
- `components/Session.tsx`
- `components/Set.tsx`
- `components/SessionCard.tsx`
- `components/SwipeDeleteAction.tsx`
- commits: `42060a6`, `43a93f4`, `b7fa773`, `c5cf4e9`

Old behavior:
- Swipe to delete sessions, exercises, and sets.
- Double-tap exercise card/header to add a set.
- Long-press exercise name to change exercise.

Boga3 state:
- Partially present with buttons/menus and animated delete affordances.
- Missing the fast gesture workflow as a first-class interaction.

Recommended Boga3 shape:
- Reintroduce only after checking mobile usability and accessibility.
- Add gesture alternatives, never gesture-only behavior.
- Start with double-tap or plus-button proximity for add-set; swipe-delete can come later because accidental deletion risk is real.

Priority: P1.

### 10. Better Historical/Analytics Refresh Model

Old source:
- `docs/historical-summary-reactivity.md`
- `contexts/HistoricalSummaryContext.tsx`

Old behavior:
- Historical summaries refreshed when sessions changed.
- The old doc considered several models: manual invalidation, centralized state, query invalidation, DB-triggered recompute, polling.

Boga3 state:
- Missing because historical analytics are missing.
- Sync now introduces additional mutation paths, so the old pub/sub trick is not enough.

Recommended Boga3 shape:
- Use repository-level invalidation or query-style refresh around local DB reads.
- Sync/bootstrap changes should invalidate analytics views.
- Avoid polling unless no better option exists. Polling is for people who enjoy wasting battery and dignity.

Priority: P1, after analytics exists.

### 11. Date-Range / Filtered Session Analytics Queries

Old source:
- `repositories/DrizzleSessionRepository.ts`
- method: `getSessionsInDateRange`

Old behavior:
- Repository supported querying sessions in a date range.

Boga3 state:
- Partially present at repository level.
- `listCompletedSessionsForAnalysis` supports date/duration filters, but there is no user-facing analytics screen using those filters.

Recommended Boga3 shape:
- Use this for future analytics dashboards:
  - weekly/monthly volume,
  - exercise progression,
  - muscle group workload trends.

Priority: P2.

### 12. Degenerate Session Save Policy

Old source:
- commit `6012ce9 allow degenerate sessions save`

Old behavior:
- Allowed empty sessions and exercises with no sets to save.

Boga3 state:
- Different behavior.
- Current recorder removes incomplete sets/exercises on submit with confirmation.

Recommended Boga3 shape:
- Do not automatically restore old behavior.
- Decide product policy:
  - allow empty sessions as notes/placeholders,
  - or keep Boga3 cleanup behavior.
- If allowed, represent this intentionally in UI and tests.

Priority: P2 / decision only.

## Do Not Port As-Is

### Old HMAC Remote Session Sync

Old source:
- `repositories/RemoteSessionRepository.ts`
- `repositories/BestEffortSyncSessionRepository.ts`
- `utils/apiClient.ts`
- `utils/hmacAuth.ts`
- `docs/narrator-backup-integration.md`
- commits: `4ab862a`, `1380c1d`, `e959bd9`

Reason:
- Boga3 already has a better Supabase Auth + outbox + event-ingest sync direction.
- The old HMAC API client and best-effort sync queue were useful exploration, not the target architecture.

Keep:
- The product idea of non-blocking local-first backup.

Do not keep:
- HMAC request signing,
- old `/api/sessions` repository contract,
- name-only exercise reconciliation.

### Old Demo Screen Structure

Old source:
- `app/SessionDemo.tsx`
- `app/SessionListDemo.tsx`
- `app/SessionViewDemo.tsx`

Reason:
- Boga3's route structure is cleaner and should remain the base.
- Recover behavior, not demo shell architecture.

### Old Style System

Old source:
- `styles/**`
- `docs/style-system-refactor.md`

Reason:
- Boga3 already has UI primitives/tokens and stricter UI docs.
- Porting old styles would be regression-by-nostalgia, which is still regression.

## Suggested Implementation Order

1. Group A1: Primary-muscle exercise catalog.
2. Group A2: Primary-muscle filters in picker.
3. Group A3: Exercise favorites.
4. Group C7: Simplified training settings.
5. Group C8: Bodyweight snapshot for historical comparison.
6. Group B6: RIR logging UX.
7. Group C9: Real-time metrics in recorder.
8. Group C10: Historical exercise comparison.
9. Group C11: Completed-session metrics / analytics.
10. Group B4: Faster set-entry controls.
11. Group B5: Gesture shortcuts.

## Data Model / Sync Questions To Resolve Before Coding

1. Are RM method and bodyweight user settings synced?
2. Is bodyweight stored per session for historical accuracy, or interpreted retroactively like exercise metadata? Current preference: store a session-level bodyweight snapshot.
3. Does `externalLoadOnly` affect stored records or only display-time calculations?
4. Should `bodyweightCoefficient`, movement pattern, equipment type, and plane of motion become first-class exercise metadata?
5. Are exercise favorites synced user data?
6. Should set type/RIR influence 1RM/volume records, or only annotate sets?
7. Do analytics results remain computed-on-read, or do we introduce materialized summary tables later?
8. Is primary muscle a required field for every exercise definition?
