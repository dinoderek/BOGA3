# Task Cards

Store active task cards here.

Completed task cards must be moved to `docs/tasks/complete/` as part of closeout when their status becomes `completed`.

## Naming

Canonical naming and metadata shape are defined in:
- `docs/specs/templates/task-card-template.md`

## Lifecycle

- `docs/tasks/`
  - active task cards only: `planned`, `in_progress`, or `blocked`
- `docs/tasks/complete/`
  - completed task-card archive
- Rule:
  - once a task card is marked `completed`, move the file from `docs/tasks/` to `docs/tasks/complete/` in the same session
  - update any affected doc references when the file moves

## Source of truth

Use the task template for all authoring requirements:
- `docs/specs/templates/task-card-template.md`
