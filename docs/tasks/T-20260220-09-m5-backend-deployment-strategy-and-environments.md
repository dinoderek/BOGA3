# Task Card

## Task metadata

- Task ID: `T-20260220-09`
- Title: M5 backend deployment strategy and environment model
- Status: `planned`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Define and document the `Supabase` deployment path from free tier to paid scale with explicit environment boundaries and operational safeguards, while preserving the documented contingency fallback posture.

## Scope

### In scope

- Define environment topology:
  - `local`
  - `preview/staging`
  - `production`
- Document deployment approach for `Supabase` primary, including how local Supabase development maps to hosted projects/environments.
- Decide and document preview strategy for MVP (`separate staging project`, `ephemeral/manual preview`, or `deferred preview`) with spend-control rationale.
- Define cost/safety guardrails for hosting and managed services:
  - zero-spend default where possible
  - predefined spend limit/budget threshold when paid usage is enabled
  - avoid uncapped auto-spend exposure
- Document `Supabase`-specific billing/spend caveats and operator guardrails (including any limits of platform spend caps and what must be enforced operationally).
- Define secrets management and rotation baseline.
- Define secrets handling for Supabase project settings and runtime functions (for example `anon` vs `service role` key usage boundaries).
- Define backup/restore and rollback expectations for hosted Supabase environments, including free-tier limitations and manual backup/restore procedures if managed backups are unavailable.
- Define scale-up triggers and migration plan from free tier to paid tier.
- Add deployment checklist suitable for repeatable release execution.
- Define hosted/deployed smoke validation command path and manual execution cadence while CI is not yet configured.

### Out of scope

- Full production infrastructure automation implementation.
- FE deployment or mobile release workflow changes.

## Acceptance criteria

1. A `Supabase` deployment strategy doc exists and maps each environment to purpose, project topology, and controls.
2. Secrets handling, rotation expectations, key-scope boundaries (`anon`/`service role`/function secrets), and non-commit rules are explicitly documented.
3. Rollback and backup/restore expectations are documented and testable, including what is manual vs managed on the selected plan tier.
4. Free-tier limits, paid-upgrade trigger conditions, and spend guardrails are explicit.
5. Strategy documents how spending is constrained (zero-spend mode or predefined capped spend path) without relying on uncapped auto-spend, and includes Supabase-specific caveats/operator controls.
6. Hosted/deployed smoke validation steps are documented (including what is manual now because CI is absent and what should move into CI later).
7. The strategy is referenced by milestone docs and is usable by follow-up implementation tasks.

## Testing and verification approach

- Planned checks/commands:
  - documentation coherence review across architecture + milestone + deployment docs
  - command sanity check for any deployment helper script included in task scope
- Notes:
  - If automation/scripts are added, include dry-run evidence.
  - This task owns the hosted/deployed smoke validation command path that `T-20260220-08` only defines at an ownership/expectation level.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-09-m5-backend-deployment-strategy-and-environments.md`
  - deployment/runbook docs under `docs/` (exact path to be chosen in-session)
- Constraints/assumptions:
  - Must implement the `Supabase` primary path selected in `T-20260220-07`; fallback stack remains contingency-only documentation unless a blocker is declared.
  - Keep MVP operations simple; avoid over-engineering.
  - Local runtime requirement from `T-20260220-07` remains in force; deployment strategy must not assume cloud-only debugging.

## Mandatory verify gates

- `N/A (docs/planning task unless scripts are introduced)`

## Evidence

- Environment model summary.
- Free-tier-to-paid transition summary.
- Spend guardrail summary.
- Supabase-specific operator controls summary (including billing/spend-cap caveats and manual guardrails).
- Rollback and backup policy summary.
- Hosted/deployed smoke validation path summary (manual cadence while CI is absent).

## Completion note

- What changed:
- What tests ran:
- What remains:
