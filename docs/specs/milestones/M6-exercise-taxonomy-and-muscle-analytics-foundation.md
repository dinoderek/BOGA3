# Milestone Spec

## Milestone metadata

- Milestone ID: `M6`
- Title: Exercise taxonomy and muscle-target weighting foundation
- Status: `planned`
- Owner: `AI + human reviewer`
- Target window: `post-MVP (TBD)`

## Parent references

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#explicitly-deferred-after-mvp`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Future features backlog: `docs/specs/07-future-features.md`

## Milestone objective

Define a practical, data-driven exercise metadata model that associates exercises to one or more muscle groups with weighted contributions, ships an initial set of system exercises with mappings, and supports user exercise editing of muscle links.

## In scope

- Define a v1 taxonomy of supported muscle groups (stable IDs + display names).
- Define exercise-to-muscle association model (many-to-many).
- Lock weighting semantics for v1 (`non-normalized` relative weights).
- Define a non-editable system taxonomy for this milestone.
- Define and seed an initial set of system exercises linked to muscle groups.
- Implement/support exercise editing flows that allow linking muscle groups.
- Record unresolved decisions and iteration points (for example: historical versioning behavior).

## Out of scope

- Finalizing historical mapping behavior (`snapshot/versioned/recomputed`) for completed sessions.
- Analytics rollups/dashboards or effort-adjusted stimulus scoring (RPE/RIR proximity-to-failure models).
- Exhaustive exercise catalog seeding.
- Backend sync/API changes for exercise definitions and muscle mappings.

## Deliverables

1. Non-editable taxonomy of muscle groups (stable IDs + display names).
2. Initial set of system exercises linked to muscle groups with weights.
3. Exercise editing support that allows linking muscle groups (including weights) for user-editable exercises.

## Acceptance criteria

1. A v1 muscle-group taxonomy exists with stable IDs and user-facing display names.
2. The muscle-group taxonomy is system-defined and non-editable in this milestone.
3. Weighting semantics are explicitly defined as `non-normalized` and interpreted consistently.
4. An initial set of system exercises exists and each included exercise is linked to one or more muscle groups with weights.
5. Exercise editing supports linking one or more muscle groups with weights for user-editable exercises.
6. Historical behavior for edits to exercise mappings is explicitly marked `TBD`, with candidate options listed.
7. The spec is precise enough to support follow-on task cards for schema design, seed data, and UI/editor work.

## Locked decisions (current)

- Exercise-to-muscle weights are `non-normalized`.
  - Interpretation: `1.0` represents a full primary-reference contribution for that exercise; multiple muscles may receive meaningful weights without forcing a shared total.
- The muscle-group taxonomy is `system-defined` and `non-editable` in this milestone.
  - Users may link muscles to exercises where editing is supported, but they may not create/edit muscle-group definitions in M6.
- Historical behavior for edited mappings is `TBD`.
  - We have not yet locked whether analytics for past sessions use the mapping at log time or the latest mapping.

## Proposed exercise-to-muscle association model (v1)

Each exercise can map to one or more muscle groups via weighted associations.

Recommended fields (conceptual; schema to be designed in a later task):

- `exercise_id`
- `muscle_group_id`
- `weight` (decimal, non-normalized)
- `role` (`primary | secondary | stabilizer`) - optional but recommended for UX presets

Notes:

- Weighting should be applied to leaf muscle groups only (not parent rollups).
- Parent groups (for example, `Shoulders`, `Back`, `Legs`) should be computed rollups for future reporting, not directly weighted.
- Stable IDs must not change after release; display labels can evolve if needed.

## Initial muscle group taxonomy (v1 draft)

This is the proposed initial set to balance useful coverage with manageable custom exercise setup.

| Family | Muscle Group (display) | Suggested ID |
| --- | --- | --- |
| Chest | Chest (Mid/Sternal) | `chest_sternal` |
| Chest | Upper Chest (Clavicular) | `chest_upper` |
| Shoulders | Front Delts | `delts_front` |
| Shoulders | Lateral Delts | `delts_lateral` |
| Shoulders | Rear Delts | `delts_rear` |
| Back | Lats | `back_lats` |
| Back | Upper Back (Rhomboids + Mid Traps) | `back_upper` |
| Back | Upper Traps | `traps_upper` |
| Back | Spinal Erectors | `spinal_erectors` |
| Arms | Biceps | `biceps` |
| Arms | Triceps | `triceps` |
| Arms | Forearms / Grip | `forearms_grip` |
| Core | Abs (Rectus Abdominis) | `abs_rectus` |
| Core | Obliques | `abs_obliques` |
| Legs | Quads | `quads` |
| Legs | Hamstrings | `hamstrings` |
| Legs | Glute Max | `glutes_max` |
| Legs | Hip Abductors (Glute Med/Min) | `hip_abductors` |
| Legs | Adductors | `adductors` |
| Lower Legs | Calves | `calves` |

## Example weighting semantics (illustrative)

Example: chest press / bench press style movement

- `chest_sternal`: `1.0`
- `delts_front`: `0.5`
- `triceps`: `0.4`

This illustrates the intended `non-normalized` interpretation: contributions are relative and do not need to sum to `1.0`.

## User-created exercise mapping guidance (v1 draft)

- Users can create custom exercises and assign one or more muscle-group weights.
- At least one muscle association should be required.

## Open decisions / iteration backlog

- Historical mapping behavior for completed sessions:
  - `snapshot at log time`
  - `versioned mappings`
  - `recompute using latest mapping`
- Whether to lock a standard preset ladder for weights (for example, `1.0`, `0.66`, `0.5`, `0.33`, `0.15`) vs free-form decimals only.
- Whether to include additional v1 muscle groups such as `tibialis_anterior`, `hip_flexors`, `serratus_anterior`, or `rotator_cuff`.
- How to distinguish `system` vs `user` exercises in the exercise-definition model (field shape and constraints).

## Task breakdown

Planned task cards for M6 are listed below.

1. `docs/tasks/T-20260224-01-m6-local-schema-for-muscle-taxonomy-and-exercise-mappings.md` - design local schema for exercise definitions, muscle groups, and weighted associations. (`planned`)
2. `docs/tasks/T-20260224-02-m6-seed-muscle-taxonomy-and-system-exercises.md` - define and seed the non-editable muscle taxonomy plus the initial system exercise mapping set. (`planned`)
3. `docs/tasks/T-20260224-03-m6-exercise-editing-muscle-linking-ui.md` - implement exercise editing support for linking muscle groups and weights on user-editable exercises. (`planned`)
4. `docs/tasks/T-20260224-04-m6-historical-mapping-behavior-options.md` - define follow-on decision/options for historical mapping behavior before analytics implementation. (`planned`)

## Risks / dependencies

- Overly granular taxonomy can increase user friction and reduce mapping consistency.
- Under-granular taxonomy can weaken analytics usefulness and future extensibility.
- Historical mapping behavior has downstream impact on schema design, analytics correctness, and sync behavior.
- Seeding too many system exercises initially may slow delivery; seeding too few may limit immediate usefulness.

## Decision log

- Date: 2026-02-24
- Decision: Use `non-normalized` exercise-to-muscle weights.
- Reason: Better matches current research/coaching practice for compound movements where multiple muscles receive meaningful stimulus.
- Impact: Mapping rules and future analytics formulas must treat weights as relative contributions, not percentage splits.

- Date: 2026-02-24
- Decision: Keep M6 focused on taxonomy + system exercise mappings + exercise editing support; exclude analytics implementation.
- Reason: This milestone should establish the exercise/muscle data model and editing workflows before building analytics on top.
- Impact: Analytics rollups and metric design will be handled in a later milestone after mappings are in place.

- Date: 2026-02-24
- Decision: Defer historical mapping behavior for edited exercise muscle profiles (`TBD`).
- Reason: This requires a broader tradeoff across data model complexity, user expectations, and analytics reproducibility.
- Impact: Schema and follow-on analytics tasks must explicitly revisit versioning/snapshot strategy before implementation is finalized.

- Date: 2026-02-24
- Decision: Treat the muscle-group taxonomy as system-defined and non-editable in M6.
- Reason: Reduces scope and preserves consistency while exercise-level mapping UX is being established.
- Impact: M6 editing work should allow linking existing muscle groups only; taxonomy administration is deferred.

## Completion note

- What changed:
- Verification summary:
- What remains:

## Status update checklist (mandatory during task closeout)

- Keep milestone `Status` current as tasks progress.
- Update task breakdown entries to reflect each task state (`planned | in_progress | completed | blocked`).
- If milestone remains open after a session, record why in the active task completion note.
