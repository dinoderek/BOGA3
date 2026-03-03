---
task_id: T-20260302-05
milestone_id: "M11"
status: completed
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "node,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/03-technical-architecture.md,docs/specs/06-testing-strategy.md,docs/specs/milestones/M11-frontend-backend-sync-integration.md,docs/specs/tech/mobile-sync-engine-overview.md,docs/specs/ui/screen-map.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/components-catalog.md,docs/specs/ui/ux-rules.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260302-05`
- Title: M11 sync status route and diagnostics UI
- Status: `completed`
- Session date: `2026-03-02`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`
- UI screen map: `docs/specs/ui/screen-map.md`
- UI navigation contract: `docs/specs/ui/navigation-contract.md`
- UI components catalog: `docs/specs/ui/components-catalog.md`
- UI UX rules: `docs/specs/ui/ux-rules.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `main @ e57e98e`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `yes` (`git fetch origin main`; no remote drift)
- Parent refs opened in this session:
  - `docs/specs/README.md`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/ui/README.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`
  - `docs/specs/ui/ux-rules.md`
- Code/docs inventory freshness checks run:
  - route inventory and current top-level navigation affordances
  - current `sync_state` read path and sync-engine persisted status semantics
- Known stale references or assumptions:
  - none
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/complete/T-20260302-05-m11-sync-status-route-and-diagnostics-ui.md`

## Objective

Add a small settings/profile-style screen that exposes sync status and recent sync timestamps, with restrained diagnostics that inform the user without making sync failures feel noisy or blocking.

## Scope

### In scope

- Add a new route for sync status/settings.
- Show at least:
  - current sync status
  - last successful sync
  - last failed sync if relevant
  - paused reason when sync is disabled or waiting
- Optionally show a lightweight stale/failure indicator elsewhere in the app if the status has been degraded long enough.
- Update relevant UI docs in the same session.

### Out of scope

- Full account/profile management.
- End-user auth screens.
- Heavy operational/debug dashboards.

## UI Impact (required checkpoint)

- UI Impact?: `yes`

## UX Contract (UI/UX tasks only)

### Key user flows (minimal template)

1. Flow name: Review sync status
   - Trigger: User opens the sync status/settings route.
   - Steps: Open route -> review current sync state -> review recent sync timestamps and pause reason if present.
   - Success outcome: User can understand whether sync is healthy, paused, or degraded.
   - Failure/edge outcome: Missing status data falls back to explicit, calm empty-state language rather than blank or misleading UI.

2. Flow name: Notice prolonged sync degradation
   - Trigger: Sync has been failing or paused for an extended period.
   - Steps: User sees lightweight indicator -> opens sync status route -> reads cause/status.
   - Success outcome: Issue is discoverable without interrupting core logging flows.
   - Failure/edge outcome: Indicator stays restrained and does not act like a blocking error modal.

### Interaction + appearance notes (lightweight)

- Reuse existing tokens/primitives and current app visual language.
- Prefer a calm settings/status presentation over alarm-heavy error styling.
- Keep the route compact; this is status visibility, not a control center.
- Avoid making routine offline periods look like app failures.

## Acceptance criteria

1. A new route exists for sync status/settings.
2. The route shows current sync state and last successful sync information.
3. Degraded/paused sync states are expressed clearly and non-disruptively.
4. Any indicator outside the route is lightweight and non-blocking.
5. Existing tokens/primitives are reused unless a documented exception is needed.
6. Relevant `docs/specs/ui/*.md` docs are updated in the same task.
7. Project-level architecture/testing docs are updated if stable sync-status semantics change.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md` - reflect route/UX outcomes if refined
  - `docs/specs/03-technical-architecture.md` - document stable user-visible sync-status semantics if needed
  - `docs/specs/06-testing-strategy.md` - document status/diagnostic verification expectations if refined
- Canonical UI docs maintenance trigger map lives in `docs/specs/ui/README.md` (`Maintenance rules`).
- UI docs update required?: `yes`
- If `yes`, list exact files under `docs/specs/ui/` and why:
  - `docs/specs/ui/screen-map.md` - new route purpose/state summary
  - `docs/specs/ui/navigation-contract.md` - new route path and navigation transitions
  - `docs/specs/ui/components-catalog.md` - document reusable sync-status presentation component if one is introduced
  - `docs/specs/ui/ux-rules.md` - document any new app-specific status/diagnostics semantics
- Tokens/primitives compliance statement:
  - Reuse plan: existing `components/ui` primitives and current screen/layout patterns
  - Exceptions (raw literals or screen-local one-offs), if any: `none expected`
- UI artifacts/screenshots expectation:
  - Required by `docs/specs/08-ux-delivery-standard.md` or task scope?: `yes`
  - Planned captures/artifacts:
    - healthy sync status state
    - degraded/paused sync state

## Testing and verification approach

- Planned checks/commands:
  - targeted screen/component tests
  - `./scripts/quality-fast.sh frontend`
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh frontend`
- Test layers covered: UI/component/integration, runtime smoke if triggered
- Execution triggers: always
- Slow-gate triggers:
  - run `./scripts/quality-slow.sh frontend` if route/navigation/runtime-sensitive changes warrant fresh `Maestro` evidence under current project rules
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: no CI; local frontend gates plus required UI evidence are mandatory

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/**`
  - `apps/mobile/components/**`
  - `apps/mobile/app/__tests__/**`
  - `docs/specs/milestones/M11-frontend-backend-sync-integration.md`
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/06-testing-strategy.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`
  - `docs/specs/ui/ux-rules.md`
- Project structure impact: `no structure change expected`
- Constraints/assumptions:
  - keep the UI intentionally small and diagnostic, not administrative

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend` when trigger conditions apply
- Optional closeout validation helper: `./scripts/task-closeout-check.sh docs/tasks/complete/T-20260302-05-m11-sync-status-route-and-diagnostics-ui.md`

## Evidence

- Healthy and degraded sync-status screenshots/captures.
- UI/UX task visual artifacts note: required by task scope and `docs/specs/08-ux-delivery-standard.md`.
- Manual verification summary: local frontend gates executed because CI is absent.

## Completion note

- What changed:
  - Added `apps/mobile/app/sync-status.tsx` as a read-only sync diagnostics route showing current status, pause reason, and recent attempt/success/failure timestamps from persisted `sync_state`.
  - Added `apps/mobile/components/sync/sync-status-card.tsx` plus shared sync-status presentation/read helpers so `session-list` can expose a lightweight, non-blocking sync-status entry card with the same semantics as the detailed route.
  - Updated project-level architecture/testing docs, the M11 milestone spec, the sync-engine deep dive, and the authoritative UI docs bundle to reflect the new route and calm diagnostics semantics.
- What tests ran:
  - `apps/mobile`: `npm test -- --runInBand app/__tests__/sync-status-screen.test.tsx app/__tests__/session-list-screen.test.tsx`
  - `apps/mobile`: `npm run typecheck`
- What remains:
  - `T-20260302-06` still needs broader mock-backend sync scenario coverage.
  - `T-20260302-07` still needs the first local-Supabase cross-stack sync `Maestro` proof path.

## Status update checklist

- Update `Status` to `completed`, `blocked`, or `outdated`.
- If `Status = completed` or `outdated`, move the task card to `docs/tasks/complete/` and update affected references in the same session.
- Ensure completion note is filled before handoff.
- If the task changed significant cross-cutting behavior, update `docs/specs/03-technical-architecture.md`, `docs/specs/04-ai-development-playbook.md`, and `docs/specs/06-testing-strategy.md` in the same session as applicable.
- Update the relevant `docs/specs/ui/*.md` files in the same session and keep entries synthetic/overview-first.
- Update parent milestone task breakdown/status in the same session.
