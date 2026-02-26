# Task Card

## Task metadata

- Task ID: `T-20260226-07`
- Title: M8 update AI development playbook with UI rules summary and UI docs links
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
- Playbook target (required): `docs/specs/04-ai-development-playbook.md`
- UI docs bundle (required):
  - `docs/specs/ui/repo-discovery-baseline.md`
  - `docs/specs/ui/ui-pattern-audit.md`
  - `docs/specs/ui/ux-rules.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`

## Objective

Update the AI development playbook with a concise UI Development Rules Summary and links to the authoritative UI docs so future AI tasks have a clear, enforceable UI context entrypoint.

## Scope

### In scope

- Add a concise UI rules summary to `docs/specs/04-ai-development-playbook.md` covering:
  - use tokens/primitives (no raw hex/ad hoc spacing in screens unless explicitly allowed)
  - prefer composition over screen-local one-offs unless justified
  - update UI docs when screens/routes/components change
  - promote new reusable patterns to primitives + documentation
- Add links/references to the detailed UI docs bundle.
- Keep the summary short and defer detail to the UI docs.
- Update any adjacent playbook wording if needed to keep the new UI section coherent.

### Out of scope

- Changing task template format (Task 08).
- Editing UI docs content beyond link/path fixes.
- Introducing new execution workflow requirements unrelated to UI rules summary.

## Acceptance criteria

1. `docs/specs/04-ai-development-playbook.md` includes a concise `UI Development Rules Summary` section (or equivalent clearly named section).
2. The summary explicitly states the non-negotiables:
   - tokens/primitives over ad hoc screen styling
   - composition over one-offs unless justified
   - UI docs updates required when screens/routes/components change
   - new reusable patterns must become primitives and be documented
3. The summary links to the detailed UI docs bundle (`ux-rules`, `screen-map`, `navigation-contract`, `components-catalog`, and audit/discovery docs).
4. The added content is concise and does not duplicate detailed UI docs content.
5. Any playbook references to UI task context remain internally consistent after the update.

## Docs touched (required)

- `docs/specs/04-ai-development-playbook.md`
- `docs/specs/ui/README.md` (optional, if adding an index link target or normalizing UI docs links)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - markdown/path/link verification for new UI docs references
  - playbook section consistency review
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - `N/A` (docs-only task)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always`
- CI/manual posture note (required when CI is absent or partial):
  - Repo has no CI; verification is local doc review.
- Notes:
  - Keep this task focused on summary + links; avoid turning the playbook into a duplicate UI spec.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/04-ai-development-playbook.md`
  - `docs/specs/ui/README.md` (optional link normalization)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - No structure changes expected.
- Constraints/assumptions:
  - UI docs bundle already exists (Task 05 complete or sufficiently drafted).

## Mandatory verify gates

- `npm run lint` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run typecheck` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run test` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- If any default gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Additional gate(s), if any:
  - Manual verification that every referenced UI doc path exists.

## Evidence

- Playbook diff summary highlighting the new UI rules summary and link list.
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

