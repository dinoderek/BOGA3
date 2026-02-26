# Task Card

## Task metadata

- Task ID: `T-20260226-01`
- Title: M8 repo discovery and UI inventory baseline (docs/templates/navigation/styling/routes)
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-26`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#1-fe-scaffolding-and-session-tracking`
- Milestone spec: `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md` (always load for context; update only when task changes paths/layout/conventions)

## Objective

Produce the required M8 repo discovery baseline so all later UI guardrail/docs/refactor tasks work from verified current facts instead of assumptions.

## Scope

### In scope

- Inspect and document:
  - existing documentation folder structure
  - exact AI development guidelines document path/name
  - milestone/task template paths
  - navigation approach and route locations
  - current styling approach(s)
  - current route/screen inventory
  - current reusable UI component inventory (initial baseline)
- Create a discovery baseline doc in the UI docs area (or create that area if this task owns the initial path creation).
- Include direct code/document references for each discovery item.
- Record open questions or ambiguities for follow-up audit work.

### Out of scope

- Deep UI pattern audit and primitive extraction design (Task 02).
- Implementing tokens/primitives or changing screen code.
- Updating playbook/template enforcement rules (Tasks 07/08).

## Acceptance criteria

1. A discovery baseline doc is created in the docs folder and linked from the M8 milestone (if path/name differs from milestone draft assumptions, milestone/task references are updated in the same session).
2. The doc records the exact path/name of the AI development guidelines document (`docs/specs/04-ai-development-playbook.md`) and the milestone/task template files under `docs/specs/templates/`.
3. The doc records the current navigation approach (`expo-router`) and where routes live (`apps/mobile/app/`).
4. The doc lists current route files/screens (including dynamic routes and `_layout`) and briefly states each route's purpose.
5. The doc records the current styling approach (for example `StyleSheet.create`, any shared style helpers/components) and notes repeated raw-literal usage patterns observed at a high level.
6. The doc includes an initial reusable component inventory (for example navigation tabs and shared session layout components) with code references.
7. Any unclear discovery items are captured as explicit follow-up questions/notes for Task 02 (not silently assumed).

## Docs touched (required)

- `docs/specs/ui/repo-discovery-baseline.md` (new; exact filename may vary if a better name is chosen)
- `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md` (update links/assumptions if discovery changes them)
- `docs/specs/09-project-structure.md` (only if this task establishes a new canonical `docs/specs/ui/` folder)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - `rg --files` and targeted file reads for docs/routes/components inventory
  - markdown link/path sanity review
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - `N/A` (docs-only discovery task)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always`
- CI/manual posture note (required when CI is absent or partial):
  - Repo has no CI; this task is validated by local doc review and path verification.
- Notes:
  - If discovery reveals a different route/styling setup than currently expected, update the M8 milestone/task wording immediately before closeout.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/ui/**` (new discovery doc and optional index)
  - `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md`
  - `docs/specs/09-project-structure.md` (only if path conventions are introduced here)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - Likely introduces `docs/specs/ui/` as a canonical UI documentation folder; if so, update `docs/specs/09-project-structure.md` in this task or explicitly defer ownership to Task 05 and record that deferral.
- Constraints/assumptions:
  - This task is factual discovery only; avoid prescribing token names, primitive APIs, or refactor scope beyond verified inventory facts.

## Mandatory verify gates

- `npm run lint` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run typecheck` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run test` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- If any default gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Additional gate(s), if any:
  - Manual path verification for every referenced file in the discovery doc.

## Evidence

- Discovery table or bullet inventory with code/doc references.
- Manual verification summary (required when CI is absent/partial):
- Deferred/manual hosted checks summary (owner + trigger timing), if applicable: `N/A`

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.

