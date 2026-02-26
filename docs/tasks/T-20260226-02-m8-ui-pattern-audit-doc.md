# Task Card

## Task metadata

- Task ID: `T-20260226-02`
- Title: M8 UI pattern audit doc (harvest current patterns and primitive candidates)
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
- UX standard (UI/UX tasks only; remove for non-UX tasks): `docs/specs/08-ux-delivery-standard.md`

## Objective

Create the M8 UI audit document that inventories existing screen patterns and identifies audit-derived primitive candidates with direct references to current code.

## Scope

### In scope

- Review current user-facing route files and shared UI components.
- Inventory current patterns, including:
  - buttons/actions
  - headers/title bars
  - lists/rows
  - forms/inputs
  - empty/loading/error states
  - spacing/layout conventions
  - typography treatments
- Identify existing reusable components that already act as primitives or primitive seeds.
- Propose an audit-derived primitive candidate list (not final APIs; no implementation yet).
- Capture duplication hotspots and refactor priorities for Task 06.

### Out of scope

- Implementing tokens/primitives (Task 03).
- Guardrail enforcement tooling (Task 04).
- Writing the full authoritative UI docs bundle (Task 05).
- Refactoring screen code (Task 06).

## UX Contract

### Key user flows (minimal template)

1. Flow name: Audit current screen behaviors from code
   - Trigger: Developer/AI reads route and component files to inventory UI patterns.
   - Steps: Inspect screen markup/styles -> classify repeated patterns -> record code references and reuse candidates.
   - Success outcome: Audit reflects real current UI behavior and structure with traceable references.
   - Failure/edge outcome: Ambiguous or conflicting patterns are documented as open decisions instead of being normalized prematurely.
2. Flow name: Derive primitive candidates without redesigning
   - Trigger: Repeated patterns are found across screens/components.
   - Steps: Group repeated patterns -> note stable semantics/usages -> list candidate primitives and constraints.
   - Success outcome: Candidate primitive list is scoped and grounded in repeated usage.
   - Failure/edge outcome: One-off patterns are labeled as one-offs/deferred rather than forced into primitives.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Treat this task as evidence gathering, not UI redesign.
- Prefer naming patterns by semantics (`primary action`, `section header`, `empty state`) over current visual details alone.
- Record enough detail to drive tokens/primitives and docs, but avoid writing the same content twice across docs.
- Include line/file references where practical so future AI sessions can verify quickly.

## Acceptance criteria

1. A UI audit doc is created and linked from the M8 milestone (and/or UI docs index if created).
2. The audit lists all current user-facing screens/routes and summarizes each screen's major UI sections/patterns.
3. The audit inventories current patterns for buttons, headers, lists, forms, empty/loading/error states, spacing/layout, and typography.
4. The audit identifies current reusable components and marks which should remain specialized vs evolve into primitives.
5. The audit includes a primitive candidate list (targeting `10-20` total later) that is explicitly described as derived from observed code patterns.
6. The audit records duplication hotspots and recommends refactor ordering for Task 06.
7. All significant audit findings include file references to current code locations.

## Docs touched (required)

- `docs/specs/ui/ui-pattern-audit.md` (new)
- `docs/specs/ui/repo-discovery-baseline.md` (only if discovery facts need correction/clarification)
- `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md` (link to audit doc if not already linked)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted file inspection with `rg`/`sed`
  - doc self-review against M8 scope requirements
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - `N/A` (audit/docs task)
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - `always`
- CI/manual posture note (required when CI is absent or partial):
  - Repo has no CI; verification is local doc review and traceability check.
- Notes:
  - Keep references stable and avoid copying large code snippets into the audit.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/ui/ui-pattern-audit.md`
  - `docs/specs/ui/README.md` (optional index)
  - `docs/specs/milestones/M8-ui-guardrails-and-authoritative-ui-docs.md` (task status/link updates only)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - No new structure expected if `docs/specs/ui/` already exists from Task 01.
- Constraints/assumptions:
  - Do not define final token values or primitive props yet; this task is the evidence source for those decisions.

## Mandatory verify gates

- `npm run lint` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run typecheck` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- `npm run test` (or runtime-appropriate equivalent): `N/A` (docs-only task)
- If any default gate is `N/A`, document the reason and list the runtime-specific replacement gate(s).
- Additional gate(s), if any:
  - Manual traceability check: every major pattern category includes at least one code reference.

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Audit doc with code-reference traceability.
- Primitive candidate list derived from audited patterns.
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

