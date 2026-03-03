# Milestone Spec

## Milestone metadata

- Milestone ID: `M9`
- Title: Exercise variations and fast selection foundation
- Status: `in_progress`
- Owner: `AI + human reviewer`
- Target window: `2026-03` / `2026-04`

## Parent references

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`
- Related prior milestone: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Brainstorm source: `docs/brainstorms/M9-Exercise-Variations`

## Milestone objective

Introduce optional, key/value-based exercise variations while preserving a fast and intuitive exercise logging flow, and establish local data foundations for future analytics grouping without implementing analytics in this milestone.

## Locked decisions (for M9)

1. Variation is optional for logging (`no variation` is valid).
2. Variation model is key/value based.
3. System-preseeded variation keys: `grip`, `hold`, `machine`, `implement`, `incline`.
4. System-preseeded values exist for seeded keys, and users can add new keys and values.
5. Variations belong to an exercise definition (not shared across exercise definitions).
6. Variation authoring is catalog-first in M9 (no inline recorder quick-create).
7. Exercise metadata semantics are fully retroactive for history and future analytics interpretation:
   - no exercise/variation versioning in M9,
   - no snapshot-preserved exercise metadata semantics for analytics in M9,
   - history reads resolve against the latest catalog metadata,
   - retroactive scope includes exercise labels, variation labels/key-values, and exercise-to-muscle mappings.
8. This retroactive metadata decision supersedes conflicting M6 snapshot-oriented historical wording and is the canonical direction for follow-on tasks.
9. Product decisions are tracked in `docs/specs/00-product.md`; technical decisions are tracked in `docs/specs/03-technical-architecture.md`.

## In scope

- Local schema/model support for key/value variation metadata:
  - variation keys,
  - variation values,
  - exercise-owned variations composed of key/value pairs.
- Recorder persistence model updates so logged session exercises reference exercise identity and optional variation identity.
- Catalog UI for managing per-exercise variations and user-defined key/value metadata.
- Recorder UX for fast exercise add flow with optional variation selection/change.
- Best-effort migration/backfill strategy for existing `machineName` usage to the new variation model, with safe fallback when direct mapping is ambiguous.
- Retroactive history/analytics semantics decision alignment across product + technical docs (including supersession note over prior M6 historical-direction wording).

## Out of scope

- Analytics feature implementation (dashboards, PR/grouping controls, derived metrics).
- Exercise/variation versioning model.
- Non-retroactive historical metadata semantics.
- Backend sync/API rollout for variation model.
- Group-level social/competition behavior.

## Deliverables

1. A locked key/value variation data contract (schema + repository contract) that supports optional variation on logged exercises.
2. Seed baseline for system variation keys/values and user-extensible key/value creation path.
3. Exercise catalog variation-management UX that supports:
   - creating/editing/deleting exercise-owned variations,
   - adding custom variation keys and values.
4. Session recorder fast-path UX where exercise logging remains low-friction and variation selection is optional.
5. Best-effort machine-name migration/backfill behavior with explicit fallback semantics.
6. Updated product/technical decision docs that unambiguously lock retroactive metadata semantics (including mapping metadata).

## Acceptance criteria

1. Logged session exercises persist a stable exercise reference and optional variation reference; variation is not required to save/complete a session.
2. M9 ships seeded variation keys (`grip`, `hold`, `machine`, `implement`, `incline`) and seeded values for those keys.
3. Users can add custom variation keys and custom variation values from catalog flows.
4. Exercise variations are scoped to a single exercise definition and represented as key/value attributes.
5. Catalog UI supports full variation lifecycle management for an exercise (create/edit/remove/archive as defined by implementation contract).
6. Recorder exercise logging remains fast with an explicit no-variation path and optional variation selection/change path.
7. Existing `machineName` data is handled by a documented migration strategy that attempts structured backfill and keeps safe compatibility fallbacks when mapping is not deterministic.
8. Product + architecture docs explicitly lock retroactive semantics for exercise/variation/mapping metadata and note supersession of conflicting prior wording.
9. M9 task specs are detailed enough for implementation without reopening core model/semantics decisions.

## Task breakdown

1. `docs/tasks/complete/T-20260227-01-m9-retroactive-semantics-decision-realignment.md` - lock retroactive history/analytics semantics and align product/architecture/milestone docs. (`completed`)
2. `docs/tasks/complete/T-20260227-02-m9-local-variation-schema-and-session-reference-migration.md` - implement local schema + migration for key/value variations and session exercise references. (`completed`)
3. `docs/tasks/T-20260227-03-m9-exercise-catalog-variation-management-ui.md` - implement catalog UI for per-exercise variation/key/value management. (`planned`)
4. `docs/tasks/T-20260227-04-m9-recorder-fast-exercise-and-optional-variation-selection.md` - implement recorder UX for fast add + optional variation selection/change. (`planned`)
5. `docs/tasks/T-20260227-05-m9-machine-backfill-history-resolution-and-regression-coverage.md` - finalize migration fallback behavior, retroactive history resolution, and regression coverage. (`planned`)

## Risks / dependencies

- Current recorder still carries legacy preset flows and pending M6 integration work (`T-20260224-04`); M9 recorder work must either absorb or explicitly sequence that dependency.
- User-defined keys/values can increase entropy; UI and validation constraints must keep selection manageable.
- Retroactive metadata semantics simplify model complexity now but can surprise users who expect frozen historical labels.
- Backfill from legacy `machineName` may be partially ambiguous; deterministic and safe fallback policy is required.
- Future analytics cache invalidation/recompute strategy must be explicit once analytics materialization exists.

## Decision log

- Date: 2026-02-27
- Decision: M9 adopts optional key/value exercise variations with catalog-first authoring and user-extensible keys/values.
- Reason: balances expressive tracking needs with low-friction logging and avoids overfitting the model before analytics is implemented.
- Impact: schema + recorder + catalog contracts must support optional variation references and user-managed key/value metadata.

- Date: 2026-02-27
- Decision: Exercise/variation/mapping metadata semantics are retroactive for history and future analytics interpretation; no versioning/snapshot semantics in M9.
- Reason: user intent favors “edit once, apply everywhere” and avoids high model complexity before analytics features exist.
- Impact: prior snapshot-oriented historical wording from M6 must be superseded; future precomputed analytics must support invalidation/recompute on metadata edits.

- Date: 2026-03-03
- Decision: Legacy session backfill only assigns exercise references when exercise-name matching is exact and unique; unresolved rows keep legacy `name`/`machineName` fallback fields with null refs.
- Reason: preserves deterministic, idempotent migration behavior while the recorder still writes the legacy free-form payload.
- Impact: boot-time backfill creates machine variations only when a canonical exercise definition can be resolved; recorder/catalog follow-up tasks can adopt explicit refs without breaking older local data.

## Completion note (fill when milestone closes)

- What changed:
- Verification summary:
- What remains:

## Status update checklist (mandatory during task closeout)

- Keep milestone `Status` current as tasks progress.
- Update task breakdown entries to reflect each task state (`planned | in_progress | completed | blocked`).
- If milestone remains open after a session, record why in the active task completion note and/or milestone completion note.
