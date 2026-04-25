# Agent 1 Instructions: Data Model Decision Packet

Status: delegation packet for planning work.

You are Agent 1. Your job is to make the data-model decisions required before Boga3 starts porting selected features from the old Boga app. Do not implement code. Do not edit schema. Do not create migrations. Produce a clear decision document and a task breakdown for later implementation agents.

## Mission

Decide the data-model and sync direction for the first recovery wave:

1. Primary muscle group per exercise.
2. Exercise favorites.
3. Simplified training settings.
4. Session-level bodyweight snapshot.
5. RIR logging semantics.
6. Analytics computed from logged sessions.

The key simplification is deliberate: Boga3 will not port old Boga's weighted multi-muscle attribution model for now. Each exercise should have one primary muscle group. Do not reintroduce secondary muscle attribution by accident; that would be `clever`, which is often just expensive wrongness wearing glasses.

## Repositories

Current project:

- `C:\Users\sbosc\code\BOGA3`

Old Boga reference project:

- `C:\Users\sbosc\code\boga-native`

Use old Boga only as reference material. Boga3 architecture wins whenever there is a conflict.

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
- `RUNBOOK.md`

If you touch UI planning, also load:

- `docs/specs/08-ux-delivery-standard.md`
- `docs/specs/ui/README.md`

## Boga3 Files To Inspect

Data model and repositories:

- `apps/mobile/src/data/schema/exercise-definitions.ts`
- `apps/mobile/src/data/schema/exercise-muscle-mappings.ts`
- `apps/mobile/src/data/schema/muscle-groups.ts`
- `apps/mobile/src/data/schema/sessions.ts`
- `apps/mobile/src/data/schema/session-exercises.ts`
- `apps/mobile/src/data/schema/exercise-sets.ts`
- `apps/mobile/src/data/schema/exercise-tag-definitions.ts`
- `apps/mobile/src/data/schema/session-exercise-tags.ts`
- `apps/mobile/src/data/exercise-catalog.ts`
- `apps/mobile/src/data/exercise-catalog-seeds.ts`
- `apps/mobile/src/data/session-drafts.ts`
- `apps/mobile/src/data/session-list.ts`
- `apps/mobile/src/data/set-types.ts`

Sync:

- `apps/mobile/src/sync/**`
- `supabase/session-sync-api-contract.md`
- `supabase/migrations/**`

Screens, only for understanding data consumers:

- `apps/mobile/app/session-recorder.tsx`
- `apps/mobile/app/exercise-catalog.tsx`
- `apps/mobile/app/completed-session/[sessionId].tsx`
- `apps/mobile/app/settings.tsx`
- `apps/mobile/app/profile.tsx`

Tests to inspect for expected conventions:

- `apps/mobile/app/__tests__/domain-schema-migrations.test.ts`
- `apps/mobile/app/__tests__/exercise-catalog-repository.test.ts`
- `apps/mobile/app/__tests__/exercise-tag-repository.test.ts`
- `apps/mobile/app/__tests__/session-drafts-repository.test.ts`
- `apps/mobile/app/__tests__/sync-domain-event-emission.test.ts`
- `apps/mobile/app/__tests__/sync-reinstall-restore-parity.test.ts`

## Old Boga Reference Files

Use these to understand the old feature intent, not as direct implementation templates:

- `C:\Users\sbosc\code\boga-native\repositories\muscle_load.json`
- `C:\Users\sbosc\code\boga-native\repositories\muscle_groups.json`
- `C:\Users\sbosc\code\boga-native\repositories\exerciseRepository.ts`
- `C:\Users\sbosc\code\boga-native\app\ConfigurationScreen.tsx`
- `C:\Users\sbosc\code\boga-native\types\config.ts`
- `C:\Users\sbosc\code\boga-native\types\set.model.ts`
- `C:\Users\sbosc\code\boga-native\services\metrics.ts`
- `C:\Users\sbosc\code\boga-native\services\setCalculationService.ts`
- `C:\Users\sbosc\code\boga-native\services\setsCalculationService.ts`
- `C:\Users\sbosc\code\boga-native\services\historicalSummaryService.ts`
- `C:\Users\sbosc\code\boga-native\services\records.ts`

Useful old commits:

- `20f5376 feat: star exercises in selector`
- `8f6eb95 Add bodyweight support and volume analysis service`
- `35db2dc Enhance SessionView with load calculations and 1RM estimates`
- `47f0ae71 feat: Add bodyweight input and "External load only" input to the configuration screen; enhance configuration handling in session management`
- `f3b058e` grind/config/history refresh changes
- `a0c7270 feat: add muscle group filter to exercise selector`
- `91b7713 feat: add threshold filtering to exercise muscle groups`

## Decisions You Must Make

### Decision 1: Primary Muscle Model

Question:

- Should primary muscle be represented as:
  - a direct `primary_muscle_group_id` column on `exercise_definitions`, or
  - a constrained use of existing `exercise_muscle_mappings`, where exactly one mapping has role `primary`?

Consider:

- Boga3 already has `exercise_muscle_mappings`.
- Existing specs say exercise and mapping metadata are retroactive.
- Simplicity matters for picker filters and analytics.
- Avoid weighted attribution for now.
- If using mappings, define how to enforce "one primary" locally and in Supabase.
- If using a direct column, define whether existing mapping table stays, is simplified, or becomes future-only.

Required output:

- Adopted recommendation.
- Rationale.
- Schema impact.
- Sync impact.
- Test implications.
- Migration/backfill strategy.

### Decision 2: Expanded Exercise Catalog Shape

Question:

- Which fields from old `muscle_load.json` should become first-class Boga3 metadata now?

Candidate fields:

- exercise name
- primary muscle group
- bodyweight coefficient
- movement pattern
- equipment type
- plane of motion

Expected conservative default:

- Import names + primary muscle group first.
- Add `bodyweight_coefficient` only if needed for the first analytics wave.
- Defer movement pattern, equipment type, and plane of motion unless there is a clear near-term UI or analytics use.

Required output:

- Fields to add now.
- Fields explicitly deferred.
- Why.

### Decision 3: Exercise Favorites

Question:

- How should favorite/starred exercises be modeled?

Consider:

- User-owned data.
- Needs local-first behavior.
- Should likely sync.
- Needs to work for system and user-created exercise definitions.

Possible model:

- `exercise_favorites`
  - `id`
  - `exercise_definition_id`
  - `created_at`
  - `deleted_at` or hard-delete semantics
  - optional owner/scope fields if needed by sync/backend.

Required output:

- Table/entity recommendation.
- Local schema shape.
- Backend projection shape.
- Sync event types.
- Deletion semantics.
- Tests needed.

### Decision 4: Training Settings

Question:

- Where do simplified training settings live?

Settings in scope:

- RM method: `Epley | Brzycki | Lombardi | BoGa`
- current bodyweight
- RIR defaults/logic

Consider:

- Current account/profile is Supabase-backed but is not the same as generic training settings.
- Settings may affect display-time interpretation of historical data.
- RM method may be a display preference.
- Bodyweight current value is a user profile/training preference, but logged sessions need snapshots.

Required output:

- Local table or profile extension recommendation.
- Backend/sync scope recommendation.
- Whether settings changes are retroactive for analytics display.
- Validation constraints.
- Tests needed.

### Decision 5: Session Bodyweight Snapshot

Question:

- Should logged sessions store bodyweight?

Current preferred answer:

- Yes, add a session-level `bodyweight_kg` snapshot.

Consider:

- Old Boga session model stored `bodyweight`.
- Historical comparisons should remain valid after bodyweight changes.
- Session-level is enough; set-level bodyweight is unnecessary unless future requirements prove otherwise.
- Need nullable/backfill behavior for old local rows.

Required output:

- Schema field recommendation.
- Requiredness/nullability/backfill.
- How recorder gets default bodyweight from settings.
- How completed-edit changes work.
- Sync contract changes.
- Tests needed.

### Decision 6: RIR Semantics

Question:

- Is Boga3's current `set_type` enough, or should RIR become a separate field?

Current state:

- `apps/mobile/src/data/set-types.ts` supports:
  - `warm_up`
  - `rir_0`
  - `rir_1`
  - `rir_2`
  - `null`

Consider:

- Old Boga used "Grind" values.
- New roadmap wants RIR logic/defaults.
- Warm-up is not technically RIR, so decide whether `set_type` remains the right combined field.

Required output:

- Keep `set_type` or split into `set_kind` + `rir`.
- Rationale.
- Migration impact.
- Analytics behavior: does RIR affect 1RM/volume or only annotate?
- Tests needed.

### Decision 7: Analytics Storage

Question:

- Are analytics computed on read or materialized?

Expected conservative default:

- Compute on read for first wave.
- No analytics tables yet.

Consider:

- Current app size is small.
- Computed-on-read avoids cache invalidation complexity.
- Later dashboards may justify materialized summaries.

Required output:

- Recommendation.
- Performance risk.
- Future trigger for materialization.

## Required Deliverable

Create one markdown file:

- `docs/brainstorms/agent-1-data-model-decisions.md`

The file must be self-contained and include:

1. **Summary**
   - One short section with the recommended path.

2. **Decision Table**
   - Columns:
     - `Area`
     - `Decision`
     - `Rationale`
     - `Schema impact`
     - `Sync impact`
     - `Implementation owner/follow-up`

3. **Detailed Decisions**
   - One subsection per decision above.
   - Include rejected alternatives.

4. **Proposed Implementation Sequence**
   - Break later work into small tasks.
   - Identify dependencies.
   - Mark which agents can work in parallel.

5. **Files Expected To Change Later**
   - Grouped by area:
     - local schema,
     - repositories,
     - sync,
     - Supabase,
     - UI,
     - tests,
     - docs.

6. **Testing Strategy**
   - Name specific test suites to add/update.
   - Include data migration tests and sync-event tests where relevant.

7. **Open Questions**
   - Only list true blockers or product questions.
   - Do not pad this section with uncertainty theatre.

## Non-Goals

Do not:

- implement migrations,
- edit runtime code,
- import the old exercise catalog,
- create UI,
- run long slow gates,
- port old sync,
- port old weighted muscle attribution,
- create task cards unless explicitly asked.

## Quality Bar

Your output must be concrete enough that Agent 2 can start the exercise database work and Agent 4 can start training settings without re-litigating fundamentals.

Use direct file references. Cite old Boga files only where they genuinely inform the decision.

If the decision changes Boga3's authoritative data model or sync scope, clearly state which specs must be updated during implementation:

- `docs/specs/05-data-model.md`
- `docs/specs/03-technical-architecture.md`
- `docs/specs/06-testing-strategy.md`
- `supabase/session-sync-api-contract.md`
- `RUNBOOK.md` only if operator workflow changes.

