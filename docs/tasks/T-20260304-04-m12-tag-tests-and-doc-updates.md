---
task_id: T-20260304-04
milestone_id: "M12"
status: planned
ui_impact: "no"
areas: "docs|frontend"
runtimes: "docs|node|expo|maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/milestones/M12-exercise-tags.md,docs/specs/06-testing-strategy.md,docs/specs/ui/screen-map.md,docs/specs/ui/ux-rules.md,docs/specs/ui/components-catalog.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260304-04`
- Title: M12 tag tests and doc updates
- Status: `planned`
- File location rule:
  - author active cards in `docs/tasks/T-20260304-04-m12-tag-tests-and-doc-updates.md`
  - move the file to `docs/tasks/complete/T-20260304-04-m12-tag-tests-and-doc-updates.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-03-04`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M12-exercise-tags.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- Project structure: `docs/specs/09-project-structure.md`
- UI docs bundle index: `docs/specs/ui/README.md`
- UI screen map: `docs/specs/ui/screen-map.md`
- UI navigation contract: `docs/specs/ui/navigation-contract.md`
- UI components catalog: `docs/specs/ui/components-catalog.md`
- UI UX rules: `docs/specs/ui/ux-rules.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ ce40da15ad9ef663b0e6608bbb9a5b1a49bd3f9c`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `no` (`git fetch origin main` completed during planning, but local `main` remained behind `origin/main`)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/ui/README.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/milestones/M12-exercise-tags.md`
- Code/docs inventory freshness checks run:
  - reviewed current testing-policy and UI-doc maintenance rules to map expected same-session updates
  - reviewed `screen-map`, `navigation-contract`, `components-catalog`, and `ux-rules` to determine likely M12 doc touchpoints
- Known stale references or assumptions (must be explicit; write `none` if none):
  - assumes the earlier M12 implementation tasks already landed and this task is finalizing verification/docs rather than defining the feature contract from scratch
- Optional helper command (recommended):
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260304-04-m12-tag-tests-and-doc-updates.md`

## Objective

Close M12 with the missing targeted tests, verification evidence, and authoritative docs updates required for the new tag feature to be discoverable and maintainable in future sessions.

## Scope

### In scope

- Add any remaining targeted automated coverage not completed in earlier M12 tasks.
- Run milestone-closeout verification for the full tag feature contract.
- Update authoritative docs to reflect implemented M12 behavior:
  - testing strategy if M12 changes stable verification expectations
  - UI docs that describe screen states, modal semantics, or reusable components
  - milestone/task status references
- Record explicit no-update rationale for any candidate UI doc that implementation did not actually change.

### Out of scope

- New feature behavior beyond what M12 already scoped.
- Schema redesign or major recorder UX redesign.
- Backend sync/API work.

## UI Impact (required checkpoint)

- UI Impact?: `no`
- UI-adjacent impact rationale:
  - this task primarily verifies and documents UI behavior that earlier tasks implemented; it is not expected to introduce additional user-facing behavior

## Acceptance criteria

1. The combined M12 feature has targeted automated coverage for schema/repository/UI behavior sufficient to protect the locked milestone contract.
2. `./scripts/quality-fast.sh frontend` passes for the final M12 implementation.
3. `./scripts/quality-slow.sh frontend` runs and its result/artifact path is recorded because M12 changes a primary recorder interaction surface.
4. Relevant authoritative docs are updated in the same session:
   - `docs/specs/ui/screen-map.md` if recorder state inventory changed
   - `docs/specs/ui/ux-rules.md` if tag interaction semantics changed
   - `docs/specs/ui/components-catalog.md` if reusable tag UI was introduced
   - `docs/specs/ui/navigation-contract.md` only if route/query/transition behavior actually changed
5. If M12 introduces a stable new testing expectation beyond task-local verification, `docs/specs/06-testing-strategy.md` is updated in the same session.
6. The milestone task breakdown and completion notes are updated to reflect the actual closeout state.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M12-exercise-tags.md` - final task states and milestone closeout notes
  - `docs/specs/06-testing-strategy.md` - only if M12 adds a stable new verification expectation worth promoting to project level
  - `docs/specs/ui/screen-map.md` - if recorder/completed-edit state inventory changed
  - `docs/specs/ui/ux-rules.md` - if tag modal/chip/management semantics changed current UI behavior
  - `docs/specs/ui/components-catalog.md` - if a reusable tag-related component was introduced
  - `docs/specs/ui/navigation-contract.md` - only if implementation changed route/query/transition behavior; otherwise record explicit no-update rationale
- For significant cross-cutting behavior changes:
  - `docs/specs/06-testing-strategy.md`
- Rule:
  - promote stable testing expectations into `docs/specs/06-testing-strategy.md` rather than leaving them only in milestone/task docs

## Testing and verification approach

- Planned checks/commands:
  - any missing targeted Jest commands from earlier M12 tasks
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Test layers covered:
  - unit
  - repository/data integration
  - UI interaction
  - simulator smoke
- Execution triggers:
  - milestone closeout
- Slow-gate triggers:
  - required for this closeout because M12 changes recorder UI on a primary screen
- Hosted/deployed smoke ownership:
  - `N/A`
- CI/manual posture note:
  - no CI is configured; this task owns recording the final local verification/evidence set
- Notes:
  - if earlier M12 tasks already ran part of the required verification, this task should either re-run or explicitly aggregate the still-valid evidence

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/__tests__/`
  - `docs/specs/milestones/M12-exercise-tags.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/ui/*.md`
  - `docs/tasks/T-20260304-0*.md`
- Project structure impact:
  - no structure change expected
- Constraints/assumptions:
  - keep UI docs synthetic and source-linked rather than turning them into full behavior specs

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- If a standard gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Optional closeout validation helper (recommended before handoff): `./scripts/task-closeout-check.sh docs/tasks/T-20260304-04-m12-tag-tests-and-doc-updates.md`
- Additional gate(s), if any:
  - targeted Jest commands that fill any remaining M12 coverage gaps

## Evidence

- Final test-command summary for M12
- `quality-slow frontend` artifact root and concise result summary
- Manual verification summary (required when CI is absent/partial):
  - confirm the implemented add/create/rename/delete/undelete/remove flows still match the milestone contract
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable:
  - `N/A`

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, ensure the relevant project-level docs (`03`, `04`, `06`) were updated in the same session rather than only the milestone/task docs.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260304-04-m12-tag-tests-and-doc-updates.md` (or document why `N/A`) before handoff.
