# Milestone Spec

## Milestone metadata

- Milestone ID: `M12`
- Title: `Exercise Tags`
- Status: `planned`
- Owner: `AI + human reviewer`
- Target window: `post-MVP (TBD)`

## Parent references

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX delivery standard: `docs/specs/08-ux-delivery-standard.md`
- Project structure: `docs/specs/09-project-structure.md`
- Exercise taxonomy milestone: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- UI docs bundle: `docs/specs/ui/README.md`
- Source brainstorm: `docs/brainstorms/010.ExerciseTags.md`

## Milestone objective

Add a lightweight, reusable exercise-tagging model so users can capture exercise-specific setup/context details while logging, manage those tags over time, and preserve tag assignments on logged exercises for later analytics breakdowns.

This milestone is intentionally focused on tag capture, management, and persistence semantics. It does not include shipping analytics screens or reports.

## Scope decisions (locked for M12)

1. Tags are attached to a specific logged exercise instance inside a session.
2. Reusable tag definitions are scoped per `exercise_definition`, not global across the app.
3. Logged exercises must persist a durable `exercise_definition_id` so tag suggestions can be resolved against the correct exercise definition.
4. Tag definitions are user-private in this milestone.
5. Tag definition deletion is a soft-delete that hides the tag from future selection but does not erase historical assignments.
6. Tag metadata semantics are retroactive for label management:
   - rename updates the displayed label everywhere the tag definition is referenced;
   - delete/undelete changes selector visibility, not historical assignment existence.
7. Analytics/reporting UI is deferred; M12 only ensures the stored data model is suitable for later per-exercise tag breakdowns.

## In scope

- Local data-model support for exercise-scoped reusable tags and per-log tag assignments.
- Local data-model support for persisting `exercise_definition_id` on `session_exercises`.
- Repository APIs for:
  - listing tag suggestions for an exercise definition
  - creating a new tag definition
  - renaming a tag definition
  - soft-deleting and undeleting a tag definition
  - attaching/removing tag assignments on a logged session exercise
- Session recorder UI support for:
  - viewing tags on an exercise card
  - adding tags to a logged exercise
  - removing tags from a logged exercise
  - creating a new tag inline from the add-tag flow
- Completed-session edit-mode support for the same tag attach/remove interactions where session exercise editing is already allowed.
- A manage-tags flow for an exercise definition, including rename, deleted-tag visibility, soft-delete, and undelete behavior.
- Validation, deduplication, and persistence rules for tag naming and assignment integrity.
- Documentation and test updates required by the new schema, repository, route behavior, and UI semantics.

## Out of scope

- Analytics dashboards, charts, filters, or reports that display tag breakdowns.
- Global/shared tag taxonomies across all exercises.
- Public, group, or brotherhood-shared tags.
- Set-level tags.
- Auto-derived tags from gym, machine, or equipment context.
- Tag colors, icons, categories, hierarchy, or ordering rules beyond basic alphabetical/filter behavior.
- Backend sync/API work for tag entities.
- Migration of historical ad hoc exercise rows that cannot be linked to an exercise definition without an explicit later policy.

## Deliverables

1. A local schema extension that adds:
   - durable `exercise_definition_id` linkage on `session_exercises`,
   - exercise-scoped tag-definition storage,
   - per-session-exercise tag-assignment storage.
2. Repository/domain APIs that enforce scoped tag suggestions, deduplicated tag creation, soft-delete/undelete behavior, and logged-exercise tag assignment rules.
3. Session recorder and completed-session edit UI for attaching, creating, removing, renaming, deleting, and undeleting exercise tags.
4. Test coverage for schema constraints, repository behavior, and primary UI tag flows.
5. Same-session updates to the relevant project/UI docs when implementation lands, especially if route behavior, session-exercise contracts, or reusable UI patterns change.

## Acceptance criteria

1. A logged exercise can display zero or more tags as compact chips on the exercise card in the session recorder.
2. A user can open an add-tag flow for a logged exercise, search existing tags for that exercise definition, and attach one without leaving the recorder.
3. A user can create a new tag inline from the add-tag flow when no exact existing tag matches the entered text.
4. Exact-match duplicate tag definitions are prevented within the same exercise definition, using normalized case-insensitive comparison.
5. The same tag cannot be attached twice to the same logged exercise.
6. A user can remove a tag from the current logged exercise without deleting the reusable tag definition.
7. A user can enter a manage-tags flow for an exercise definition, rename a tag, soft-delete a tag, reveal deleted tags, and undelete a tag.
8. Soft-deleting a tag removes it from future default suggestions but does not erase historical tag assignments that already reference it.
9. Logged session exercises persist enough information to resolve their tag scope deterministically through a durable `exercise_definition_id` link.
10. Completed-session edit mode supports the same tag attach/remove behavior for editable logged exercises.
11. The stored tag model is queryable for future analytics breakdowns by `(exercise_definition_id, tag_definition_id)` without introducing a global tag taxonomy.
12. Existing recorder flows for adding/changing/removing exercises and sets remain stable after tag support is introduced.
13. The current missing durable `exercise_definition_id` linkage on logged `session_exercises` is corrected as part of this milestone rather than deferred as a follow-up dependency.

## Planned technical approach

### Data model

- Extend `session_exercises` to persist a durable `exercise_definition_id`.
- Add a new exercise-scoped tag-definition table with at least:
  - `id`
  - `exercise_definition_id`
  - `name`
  - `deleted_at`
  - `created_at`
  - `updated_at`
- Add a new tag-assignment table with at least:
  - `id`
  - `session_exercise_id`
  - `exercise_tag_definition_id`
  - `created_at`

### Constraints and normalization

- Enforce uniqueness of active tag names per exercise definition using normalized comparison semantics.
- Enforce uniqueness of tag assignments per logged exercise.
- Preserve display casing for labels while comparing normalized values for duplicate-prevention.
- Apply the same duplicate-prevention rules during rename operations.
- Use soft-delete on tag definitions rather than cascading deletion of historical assignments.

### Recorder interaction model

- Show tags as lightweight chips beneath the exercise header.
- Use a fast modal/sheet flow for add-tag interactions:
  - search existing tags
  - select an existing tag
  - create a new tag inline
  - open manage-tags mode
- In manage-tags mode, support:
  - rename
  - soft-delete
  - reveal deleted tags
  - undelete
- Keep the add-tag flow optimized for rapid logging rather than full administration.

### Historical behavior

- Treat tag assignments as historical facts on logged exercises.
- Apply current tag-definition metadata retroactively for presentation semantics, consistent with the project’s current metadata direction.
- Preserve historical assignment rows when a tag definition is soft-deleted.

### Analytics readiness

- Shape the stored model so a future analytics milestone can break down one exercise by tag usage without requiring a global tag taxonomy or reinterpreting free-text labels.

## Task breakdown

1. `docs/tasks/T-20260304-01-m12-session-exercise-definition-link-and-tag-schema.md` - fix the missing durable `exercise_definition_id` linkage on logged session exercises and implement the local schema/Drizzle migration artifacts for tag definitions and tag assignments. (`planned`)
2. `docs/tasks/T-20260304-02-m12-tag-repository-and-domain-rules.md` - implement repository/domain APIs for tag suggestion, create, rename, attach/remove, delete/undelete, and validation behavior. (`planned`)
3. `docs/tasks/T-20260304-03-m12-recorder-and-completed-edit-tag-ui.md` - add session-recorder and completed-session edit UI for tag chips, add-tag flow, and manage-tags flow including rename/delete/undelete interactions. (`planned`)
4. `docs/tasks/T-20260304-04-m12-tag-tests-and-doc-updates.md` - add targeted tests and update affected project/UI docs after the feature contract is implemented. (`planned`)

Rule:

- use `docs/tasks/<task-id>.md` for active/planned/blocked cards
- update references to `docs/tasks/complete/<task-id>.md` once a task card is completed and moved

## Risks / dependencies

- Correcting the current missing durable `exercise_definition_id` linkage on `session_exercises` changes a foundational recorder/session contract; implementation must not break current draft persistence, completed-session reads, or future sync assumptions.
- Tag UX can easily become too heavy for the recorder if creation, selection, and management are not clearly separated into a fast path and an admin path.
- Soft-delete semantics must be implemented carefully so deleted tags disappear from suggestions without orphaning or visually hiding historical assignments.
- If a logged exercise is changed from one exercise definition to another later, tag-assignment compatibility rules will need to be explicit to avoid invalid cross-definition assignments.
- This milestone is local-only; future backend sync work will need a follow-on policy for tag entity ownership, replication, and conflict behavior.
- UI docs may need updates in `docs/specs/ui/**` if the exercise-card interaction contract or modal patterns change materially.

## Completion note (fill when milestone closes)

- What changed:
- Verification summary:
- What remains:

## Status update checklist (mandatory during task closeout)

- Keep milestone `Status` current as tasks progress.
- Update task breakdown entries to reflect each task state (`planned | in_progress | completed | blocked | outdated`).
- If milestone remains open after a session, record why in the active task completion note and/or milestone completion note (status remains `in_progress`).
