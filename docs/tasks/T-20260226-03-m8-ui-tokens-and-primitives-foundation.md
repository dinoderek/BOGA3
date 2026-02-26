# Task Card

## Task metadata

- Task ID: `T-20260226-03`
- Title: M8 tokens source of truth and audit-derived primitives foundation
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
- Audit source (required): `docs/specs/ui/ui-pattern-audit.md`

## Objective

Implement a single token source of truth and a minimal primitives layer derived from the audit so existing screens can be refactored without a redesign.

## Scope

### In scope

- Introduce UI tokens for current app needs (minimum: colors, spacing, typography, radius; optional shadows/borders if clearly reused).
- Implement an initial primitive set derived from the audit (target total primitives in milestone: `10-20`).
- Define clear placement conventions for tokens/primitives in `apps/mobile/` (and document them).
- Update a small set of shared UI components to prove primitive usage (without doing the full screen refactor yet).
- Add/adjust tests for primitives where practical (behavior/accessibility/render states for high-value components).

### Out of scope

- Full screen refactor across all routes (Task 06).
- Guardrail enforcement/lint/script checks (Task 04).
- Full UI docs bundle authoring (Task 05).
- Redesigning existing UX patterns or introducing new flows.

## UX Contract

### Key user flows (minimal template)

1. Flow name: Render common action/list/layout primitives with current app semantics
   - Trigger: Existing screens/components consume new primitives.
   - Steps: Screen/shared component imports primitive -> passes semantic props -> primitive renders expected style/state.
   - Success outcome: UI appearance remains consistent with current app patterns while style values move to tokens.
   - Failure/edge outcome: If a pattern cannot be represented cleanly, it is documented as a gap or deliberate one-off (not hidden with ad hoc overrides).
2. Flow name: Compose primitives without screen-local style duplication
   - Trigger: A repeated UI block is updated to use primitives.
   - Steps: Replace local repeated styling with primitive composition -> verify visual/interaction parity in tests/manual check.
   - Success outcome: Reuse increases and screen-local style duplication decreases.
   - Failure/edge outcome: Primitive abstraction remains lightweight; avoid over-generalizing one-off layouts.

### Interaction + appearance notes (lightweight; prefer <= 5 bullets)

- Derive token values from audited current usage; do not "theme refresh" the app in this task.
- Prefer semantic naming (`colorActionPrimary`, `spaceSm`) over screen-specific naming.
- Primitive props should reflect semantics first (primary/secondary/destructive) before visual variants.
- Keep the primitive set intentionally small; specialized components can remain specialized.

## Acceptance criteria

1. A token source of truth exists in `apps/mobile` and includes at least colors, spacing, typography, and radius values used by primitives.
2. An initial primitive set is implemented and documented in code comments/types, with APIs derived from the audit (not invented redesign abstractions).
3. The primitive set size remains intentionally bounded (milestone target `10-20`; if fewer are implemented in this task, the remaining candidates are tracked for Task 06/05 docs).
4. At least one existing shared component or screen-adjacent component is updated to consume tokens/primitives as a proof of integration.
5. No user-facing behavioral changes are introduced beyond UI consistency/plumbing.
6. `apps/mobile` verification gates pass (`lint`, `typecheck`, `test`) with any new/updated tests.

## Docs touched (required)

- `docs/specs/ui/ui-pattern-audit.md` (reference finalized primitive choices and any rejected candidates)
- `docs/specs/ui/components-catalog.md` (seed or partial draft is acceptable if Task 05 owns finalization)
- `docs/specs/ui/ux-rules.md` (only if semantic rules are introduced/clarified in this task)
- `docs/specs/09-project-structure.md` (only if new canonical UI tokens/primitives folders are introduced)

## Testing and verification approach (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Planned checks/commands:
  - targeted component/unit/render tests for new primitives (where practical)
  - `npm run lint` (from `apps/mobile`)
  - `npm run typecheck` (from `apps/mobile`)
  - `npm run test` (from `apps/mobile`)
- Test layers covered (for example unit / integration / contract / E2E / hosted smoke):
  - UI component render/behavior tests
  - Regression coverage through existing `apps/mobile` tests impacted by shared components
- Execution triggers (`always`, file-change-triggered, milestone closeout, release closeout):
  - targeted tests during development; full `apps/mobile` gates at task closeout
- CI/manual posture note (required when CI is absent or partial):
  - No CI configured; local `apps/mobile` gates and manual visual spot checks are required.
- Notes:
  - Prefer incremental adoption in one or two shared components to keep this task focused on foundation, not full migration.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/components/**`
  - `apps/mobile/src/**` (if UI primitives/tokens live under `src`)
  - `apps/mobile/app/**` (limited proof integration only)
  - `apps/mobile/app/__tests__/**` and/or component test files
  - `docs/specs/ui/**` (docs updates tied to introduced primitives)
  - `docs/specs/09-project-structure.md` (if canonical placement changes)
- Project structure impact (new paths/conventions or explicit no-structure-change decision):
  - Likely introduces canonical tokens/primitives paths; if new, document in `docs/specs/09-project-structure.md`.
- Constraints/assumptions:
  - Preserve current user-facing behavior and route semantics.
  - Avoid broad screen rewrites; Task 06 owns the bulk migration.

## Mandatory verify gates

- `npm run lint` (from `apps/mobile`)
- `npm run typecheck` (from `apps/mobile`)
- `npm run test` (from `apps/mobile`)
- Additional gate(s), if any:
  - Targeted primitive/shared-component tests added or updated in this task.

## Evidence (follow `docs/specs/04-ai-development-playbook.md` and `docs/specs/08-ux-delivery-standard.md` for UI tasks)

- Before/after examples (screenshots or test snapshots) showing at least one migrated shared UI element.
- Test evidence for primitive states/semantics where added.
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

