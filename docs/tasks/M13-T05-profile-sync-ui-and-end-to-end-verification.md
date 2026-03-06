---
task_id: M13-T05-profile-sync-ui-and-end-to-end-verification
milestone_id: "M13"
status: planned
ui_impact: "yes"
areas: "frontend|cross-stack|docs"
runtimes: "node|expo|maestro|supabase"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/milestones/M13-simple-backend-sync.md,docs/specs/ui/screen-map.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/ux-rules.md,docs/specs/06-testing-strategy.md"
---

# Task Card

## Task metadata

- Task ID: `M13-T05-profile-sync-ui-and-end-to-end-verification`
- Title: M13 profile sync UX and end-to-end journey verification
- Status: `planned`
- File location rule:
  - author active cards in `docs/tasks/<task-id>.md`
  - move the file to `docs/tasks/complete/<task-id>.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-03-06`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M13-simple-backend-sync.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Data model: `docs/specs/05-data-model.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`
- UI screen map: `docs/specs/ui/screen-map.md`
- UI navigation contract: `docs/specs/ui/navigation-contract.md`
- UI UX rules: `docs/specs/ui/ux-rules.md`

## Objective

Deliver the profile sync controls/status UX and close M13 verification with explicit proof for the two required user journeys.

## Scope

### In scope

- Implement/finalize `/profile` sync controls and status messaging.
- Ensure sync status semantics match M13 policy (`60s` general, `10s` recorder cadence).
- Ensure failure UI reflects the simplified ingest contract (`should_retry` hint + backend free-text message).
- Add/execute automated coverage and Maestro/integration evidence for both required journeys.
- Update authoritative UI docs for any changed profile/settings behavior.

### Out of scope

- New sync protocol/schema changes.
- Multi-device semantics.

## UX Contract

### Key user flows

1. Already logged in -> record session -> sync eventually converges
- Trigger:
  - signed-in user starts recording in `/session-recorder`
- Steps:
  - user logs/update session data
  - outbox events are queued and flushed on recorder cadence
  - user can verify sync status from `/profile`
- Success outcome:
  - backend convergence occurs and status reflects recent success
- Failure/edge outcome:
  - failures are surfaced inline and recovery occurs after connectivity/service restoration

2. Logged out -> login -> bootstrap/merge -> record session -> sync eventually converges
- Trigger:
  - logged-out user signs in and enables sync
- Steps:
  - bootstrap + merge converges
  - user starts recording session
  - recorder updates sync on recorder cadence
- Success outcome:
  - both pre-existing and new recorder state converge
- Failure/edge outcome:
  - local data remains usable and eventual convergence occurs after recovery

## Acceptance criteria

1. `/profile` shows sync enabled state, last successful sync, and clear inline error state (including retry hint + free-text failure message when present).
2. Journey 1 has automated proof (test and/or Maestro evidence).
3. Journey 2 has automated proof (test and/or Maestro evidence).
4. `./scripts/quality-fast.sh frontend` passes.
5. `./scripts/quality-slow.sh frontend` passes with artifact evidence recorded.
6. UI docs are updated for any changed profile/settings route behavior and semantics.

## Docs touched (required)

- `docs/specs/milestones/M13-simple-backend-sync.md` - closeout status and verification summary.
- `docs/specs/ui/screen-map.md` - profile/settings state updates if changed.
- `docs/specs/ui/navigation-contract.md` - route/transition updates if changed.
- `docs/specs/ui/ux-rules.md` - sync status semantics in profile UI.
- `docs/specs/06-testing-strategy.md` - final journey-proof policy updates if needed.

## Testing and verification approach

- Planned checks/commands:
  - targeted profile sync UI tests
  - journey tests for both required flows
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
  - local Supabase + Maestro flow evidence for both journeys
- Test layers covered:
  - component/integration
  - end-to-end
  - runtime smoke

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/profile.tsx`
  - `apps/mobile/src/**`
  - `apps/mobile/.maestro/**`
  - `apps/mobile/app/__tests__/**`
  - `docs/specs/ui/**`
- Project structure impact:
  - none expected

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`

## Evidence

- Journey 1 proof artifact(s): test output + runtime capture references
- Journey 2 proof artifact(s): test output + runtime capture references
- slow-gate artifact root(s)

## Completion note (fill at end)

- What changed:
- What tests ran:
- What remains:
