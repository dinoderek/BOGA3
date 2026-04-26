---
task_id: T-20260426-01-refined-exercise-search
milestone_id: "M6"
status: completed
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "node,expo"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "N/A"
docs_touched: "docs/specs/ui/screen-map.md"
---

## Task metadata

- Task ID: `T-20260426-01-refined-exercise-search`
- Title: Refine exercise catalog search matching
- Status: `completed`
- File location rule:
  - author active cards in `docs/tasks/<task-id>.md`
  - move the file to `docs/tasks/complete/<task-id>.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-04-26`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Data model: `docs/specs/05-data-model.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main...origin/main`; resumed in `/home/stefano/projects/BOGA3` with `git status --short --branch`.
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: partial; initial `git fetch origin` completed with no output, and resumed workspace was already tracking `origin/main`.
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/00-product.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/05-data-model.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/09-project-structure.md`
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/ui/README.md`
  - `RUNBOOK.md`
  - `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Code/docs inventory freshness checks run:
  - inspected `apps/mobile/src/exercise-catalog/search.ts` - current filter indexed exercise name, all mapped muscle IDs, display names, and family names with any-word matching
  - inspected `apps/mobile/app/exercise-catalog.tsx`, `apps/mobile/app/__tests__/exercise-catalog-screen.test.tsx`, and `apps/mobile/app/__tests__/session-recorder-interactions.test.tsx` - shared search is used by catalog and recorder picker surfaces
- Known stale references or assumptions: full frontend gate has unrelated pre-existing failures in `session-list-screen` and `exercise-catalog-seeds`; details recorded in Evidence.

## Objective

Reduce overly broad exercise search results by matching only exercise names and resolved primary-muscle display/family names.

## Scope

### In scope

- Refine shared exercise catalog search behavior used by exercise catalog and session-recorder exercise filtering.
- Add focused Jest coverage for stricter search rules.
- Update authoritative UI docs if needed for changed filter semantics.

### Out of scope

- Visual UI/layout/copy changes.
- Search ranking, fuzzy matching, tag search, analytics, data-model changes, sync changes, or dependency additions.

## UI Impact (required checkpoint)

- UI Impact?: `yes`
- Rationale: user-facing result-set behavior changes, but the existing UI controls, copy, layout, routes, and navigation stay unchanged.

## UX Contract

### Key user flows

1. Flow name: Filter by exercise name and primary muscle
   - Trigger: User types in the existing exercise filter input.
   - Steps: app normalizes query words and filters exercises.
   - Success outcome: an exercise appears only when every query word matches the exercise name, primary muscle display name, or primary muscle family name.
   - Failure/edge outcome: unmatched queries keep the existing empty-results state.
2. Flow name: Avoid secondary-muscle overmatching
   - Trigger: User searches for a muscle that is only secondary/stabilizer on an exercise.
   - Steps: app evaluates only primary muscle terms for muscle-based search.
   - Success outcome: the exercise is not returned solely because of secondary/stabilizer mappings.
   - Failure/edge outcome: if no allowed terms match, the existing empty-results state appears.

### Interaction + appearance notes

- Keep the existing filter input and placeholder text.
- Keep existing empty-state copy and list presentation.
- Do not introduce new controls, animations, routes, or visual styling.

## Acceptance criteria

1. Exercise name search still works.
2. Primary muscle display/family search works.
3. Secondary/stabilizer muscle terms do not match.
4. Raw muscle group IDs do not match.
5. Multi-word searches require every query word to match the allowed search text.
6. No UI layout/copy/navigation changes are introduced.
7. `./scripts/quality-fast.sh frontend` passes, or any environment blocker is documented.

## Docs touched (required)

- `docs/specs/ui/screen-map.md` - update only if the current exercise catalog screen summary includes search/filter semantics that would otherwise be stale.
- `RUNBOOK.md` - reviewed; update only if local operator workflow changes.

UI docs update required?: `yes`

Tokens/primitives compliance statement:
- Reuse plan: no UI component/style changes.
- Exceptions: none.

UI artifacts/screenshots expectation:
- Required by task scope?: `no`
- Rationale: behavior-only filtering change with existing visual states and Jest coverage; no layout or visual contract changes.

## Testing and verification approach

- Planned checks/commands:
  - `cd apps/mobile && npm test -- --runInBand --runTestsByPath app/__tests__/exercise-catalog-search.test.ts`
  - `cd apps/mobile && npm test -- --runInBand --runTestsByPath app/__tests__/session-recorder-interactions.test.tsx --testNamePattern="filters exercise picker"`
  - `./scripts/quality-fast.sh frontend`
- Test layers covered:
  - Jest/RNTL screen behavior coverage
- Slow-gate triggers:
  - `N/A`; deterministic JS filtering change with no native/runtime-sensitive behavior.
- Hosted/deployed smoke ownership:
  - `N/A`
- CI/manual posture note:
  - CI is absent; local command evidence is required in the completion note.

## Implementation notes

- Files/areas changed:
  - `apps/mobile/src/exercise-catalog/search.ts`
  - `apps/mobile/app/__tests__/exercise-catalog-search.test.ts`
  - `apps/mobile/app/__tests__/session-recorder-interactions.test.tsx`
  - `docs/specs/ui/screen-map.md`
- Project structure impact:
  - none
- Constraints/assumptions:
  - “Primary muscles” means mappings with `role === 'primary'`.
  - primary muscle search includes `displayName` and `familyName`.
  - raw taxonomy IDs are not user-facing search terms.

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `N/A`
- Additional gate(s): targeted exercise catalog search unit test and targeted session-recorder picker UI test.

## Evidence

- Targeted test output:
  - `npm test -- --runInBand --runTestsByPath app/__tests__/exercise-catalog-search.test.ts` passed: 1 suite, 1 test.
  - `npm test -- --runInBand --runTestsByPath app/__tests__/session-recorder-interactions.test.tsx --testNamePattern="filters exercise picker"` passed: 1 suite, 1 selected test.
- Fast gate output:
  - `bash ./scripts/quality-fast.sh frontend` ran lint, typecheck, and Jest.
  - lint completed with existing warnings only.
  - typecheck completed during the gate before tests started.
  - Jest result: 32 passed suites, 2 failed suites, 200 passed tests, 2 failed tests.
  - Failing suites were unrelated to refined search:
    - `app/__tests__/session-list-screen.test.tsx` reopen failure expects `completed-session-delete-modal-card` to be absent.
    - `app/__tests__/exercise-catalog-seeds.test.ts` expects 14 seeded exercises but current summary reports 393.
- Manual verification summary:
  - Refined search behavior is covered by focused unit test and recorder picker UI test.
  - `RUNBOOK.md` reviewed; no operator workflow changes required.
- Manual verification summary (required when CI is absent/partial): refined-search behavior is covered by focused unit and UI tests; full frontend gate has unrelated failures listed above.

## Completion note (fill at end)

- What changed: refined exercise search now matches only exercise name plus resolved primary muscle display/family terms, requires all query words, excludes secondary/stabilizer/raw-ID matches, adds focused tests, and updates UI screen-map semantics.
  - Exercise search now indexes exercise name plus resolved primary muscle display/family terms only.
  - Search no longer indexes secondary/stabilizer muscles or raw muscle group IDs.
  - Multi-word queries now require every query word to match the allowed search text.
  - Added focused search unit coverage and updated recorder picker coverage for the shared refined behavior.
  - Updated UI screen map search semantics for catalog and recorder picker surfaces.
- What tests ran: targeted search utility test passed, targeted session-recorder picker test passed, and `bash ./scripts/quality-fast.sh frontend` failed only on unrelated existing suites.
  - `npm test -- --runInBand --runTestsByPath app/__tests__/exercise-catalog-search.test.ts` - passed.
  - `npm test -- --runInBand --runTestsByPath app/__tests__/session-recorder-interactions.test.tsx --testNamePattern="filters exercise picker"` - passed.
  - `bash ./scripts/quality-fast.sh frontend` - failed on unrelated existing suites listed in Evidence.
- What remains: no refined-search implementation work remains; unrelated full-gate failures need separate cleanup.
  - No refined-search implementation work remains.
  - Separate cleanup is needed for the unrelated full-gate failures in `session-list-screen` and `exercise-catalog-seeds`.

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/`.
- Ensure completion note is filled before handoff.
- Run `./scripts/task-closeout-check.sh <task-card-path>` or document why `N/A`.
