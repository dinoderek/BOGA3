---
task_id: M13-T05-profile-sync-ui-and-end-to-end-verification
milestone_id: "M13"
status: in_progress
ui_impact: "yes"
areas: "frontend|cross-stack|docs"
runtimes: "node|expo|maestro|supabase"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/milestones/M13-simple-backend-sync.md,docs/specs/ui/screen-map.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/ux-rules.md,docs/specs/06-testing-strategy.md,docs/specs/tech/client-sync-engine.md"
---

# Task Card

## Task metadata

- Task ID: `M13-T05-profile-sync-ui-and-end-to-end-verification`
- Title: M13 profile sync UX and end-to-end journey verification
- Status: `in_progress`
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
- Client sync engine deep-dive: `docs/specs/tech/client-sync-engine.md`

## Objective

Deliver the profile sync controls/status UX and provide explicit proof for the two required user journeys owned by this task.

## Scope

### In scope

- Implement/finalize `/profile` sync controls and status messaging.
- Ensure sync status semantics match M13 policy (`60s` general, `10s` recorder cadence).
- Ensure failure UI reflects the simplified ingest contract (`should_retry` hint + backend free-text message).
- Add/execute automated coverage and Maestro/integration evidence for both required journeys.
- Update authoritative UI docs for any changed profile/settings behavior.
- Update `docs/specs/tech/client-sync-engine.md` with any profile-sync UX-driven runtime semantics changes (including interruption/replay handling if clarified by this task).

### Out of scope

- New sync protocol/schema changes.
- Multi-device semantics.
- Reinstall restore-state parity verification (owned by `M13-T06`).

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

### Interaction + appearance notes

1. Retrieval model:
- first-enable (or first auth session after enable for a different user) runs one bootstrap pull + merge + convergence flush.
- this retrieval is non-streaming in M13 (no incremental/progressive backend stream UI).
- steady-state M13 sync is push-dominant; there is no periodic pull loop after bootstrap.

2. Status presentation model (`/profile` sync section):
- always show sync toggle (`Enabled` / `Disabled`) and last successful sync (`Never` until first success).
- show a single current-state line (for example: `Syncing`, `Up to date`, `Waiting for network`, `Retry scheduled`, `Action required`).
- while active, use indeterminate activity feedback (`Syncing...`) rather than a determinate progress bar.
- include pending outbox count when non-zero (`N changes waiting to sync`) to indicate outstanding local work.

3. Blocking behavior:
- sync work runs in the background and must not block normal app usage.
- profile screen may disable only the directly relevant control while that control action is in-flight (for example toggle submit), not the whole route.
- user can leave `/profile` during bootstrap/retry and continue recording/local usage.

4. Failure message and retry hint contract:
- when backend returns `FAILURE`, surface backend free-text `message` inline.
- if `should_retry=true` (or transport failure), show retry hint (`Will retry automatically`) and next-attempt timing when available.
- if `should_retry=false`, show `Action required`/`Sync blocked` wording and explicit no-auto-retry hint.

5. Unrecoverable-error UX:
- keep local data usable; do not force sign-out or full-screen blocking modal.
- keep error visible inline in `/profile` sync section until state changes.
- provide clear copy that automatic retry is stopped and manual intervention is required.
- no event-level debug payload is shown in UI (no raw envelope/body rendering in M13).

## Acceptance criteria

1. `/profile` shows sync enabled state, last successful sync, and clear inline error state (including retry hint + free-text failure message when present).
2. Journey 1 has automated proof (test and/or Maestro evidence).
3. Journey 2 has automated proof (test and/or Maestro evidence).
4. `./scripts/quality-fast.sh frontend` passes.
5. `./scripts/quality-slow.sh frontend` passes with artifact evidence recorded.
6. UI docs are updated for any changed profile/settings route behavior and semantics.
7. Reinstall restore-parity proof is explicitly delegated to `docs/tasks/M13-T06-reinstall-restore-state-parity.md`.
8. Sync retrieval UX for first-enable bootstrap is represented as background, non-streaming work with indeterminate activity feedback (no determinate progress bar in M13).
9. Non-retryable ingest failure (`should_retry=false`) is shown as persistent inline blocked state with explicit no-auto-retry messaging while local app usage remains available.
10. `docs/specs/tech/client-sync-engine.md` is updated in the same session with final M13 profile-sync status semantics and interruption/replay/checkpoint behavior.

## Docs touched (required)

- `docs/specs/milestones/M13-simple-backend-sync.md` - closeout status and journey-proof summary (restore-parity tracked in `M13-T06`).
- `docs/specs/ui/screen-map.md` - profile/settings state updates if changed.
- `docs/specs/ui/navigation-contract.md` - route/transition updates if changed.
- `docs/specs/ui/ux-rules.md` - sync status semantics in profile UI.
- `docs/specs/06-testing-strategy.md` - final journey-proof policy updates if needed.
- `docs/specs/tech/client-sync-engine.md` - mandatory same-session update for component/flow/failure/test-overview sections when profile-sync UX changes sync runtime interactions, including interruption/replay/checkpoint semantics where applicable.

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
