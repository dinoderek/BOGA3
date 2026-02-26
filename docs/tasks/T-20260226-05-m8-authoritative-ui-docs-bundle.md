# Task Card

## Task metadata

- Task ID: `T-20260226-05`
- Title: M8 authoritative UI docs bundle (UX rules, screen map, navigation contract, components catalog)
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
- Source docs (required):
  - `docs/specs/ui/repo-discovery-baseline.md`
  - `docs/specs/ui/ui-pattern-audit.md`

## Objective

Create the authoritative UI docs bundle (reality-based and AI-friendly) that documents current routes, navigation, UI semantics, and primitives/component usage, using the discovery and audit outputs as the source.

## Scope

### In scope

- Create/update an organized UI docs bundle in `docs/specs/ui/` (or the canonical path established by Task 01), including:
  - `ux-rules`
  - `screen-map`
  - `navigation-contract`
  - `components-catalog`
  - optional `README`/index for navigation
- Keep docs concise and linked, avoiding duplication across files.
- Document route params and allowed transitions for current `expo-router` flows.
- Document component/primitives props and usage conventions (authoritative for AI tasks).
- Record docs ownership/maintenance expectations that later tasks can follow.

### Out of scope

- Large UI code refactors (Task 06).
- Playbook summary links (Task 07).
- Task template enforcement updates (Task 08).

## Acceptance criteria

1. The UI docs bundle exists in a canonical docs location and includes `ux-rules`, `screen-map`, `navigation-contract`, and `components-catalog`.
2. `screen-map` documents each current user-facing route with purpose, major sections, states, and entry/exit points.
3. `navigation-contract` documents route paths, params, and allowed transitions for current mobile flows (including dynamic route params where applicable).
4. `components-catalog` documents current reusable components and any newly introduced primitives (or marks pending finalization if Task 03 is not yet complete).
5. `ux-rules` documents semantic UI rules (for example primary/secondary/danger actions, list/layout conventions, empty/loading/error handling) grounded in current app behavior.
6. The docs cross-link to discovery/audit docs and clearly distinguish factual current behavior from planned/optional conventions.
7. If `docs/specs/ui/` becomes (or remains) the canonical UI docs path, `docs/specs/09-project-structure.md` is updated accordingly (unless already done).

## Docs touched (required)

- `docs/specs/ui/README.md` (recommended index)
- `docs/specs/ui/ux-rules.md`
- `docs/specs/ui/screen-map.md`
- `docs/specs/ui/navigation-contract.md`
- `docs/specs/ui/components-catalog.md`
- `docs/specs/09-project-structure.md` (if canonical UI docs path conventions are introduced/updated here)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md`)

- Planned checks/commands:
  - markdown review + cross-link/path verification
  - route/param sanity check against current `apps/mobile/app/**`
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - `N/A` (docs authoring task)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always`
- CI/manual posture note (required when CI is absent or partial):
  - Repo has no CI; verification is local doc/path consistency review.
- Notes:
  - Keep docs accurate to current code; Task 06 will update any sections affected by refactors.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/ui/**`
  - `docs/specs/09-project-structure.md` (if path conventions change)
  - `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md` (link/status updates only)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - May establish `docs/specs/ui/` as a new canonical docs subfolder; document in `docs/specs/09-project-structure.md`.
- Constraints/assumptions:
  - Avoid duplicate policy text already covered in `docs/specs/08-ux-delivery-standard.md`; UI docs should focus on product/app-specific UI reality.

## Mandatory verify gates

- `npm run lint` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run typecheck` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run test` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- If any default gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Additional gate(s), if any:
  - Manual cross-link/path verification across UI docs bundle files.

## Evidence

- UI docs bundle file list + link map summary.
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

