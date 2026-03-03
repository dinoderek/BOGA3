# Technical Architecture Decisions (High-Level)

## Purpose

Capture top-level architecture decisions for MVP, with clear `Adopted` vs `Planned` status.

## System map

`Expo React Native UI`
-> `Session domain + autosave orchestration`
-> `Local repository layer (Drizzle + SQLite)`
-> `Auth-gated sync engine + reconciliation service`
-> `Supabase backend (M5 selected; local-first dev/test via Supabase local stack)`

## Deep dives

- `docs/specs/tech/mobile-sync-engine-overview.md`: Detailed architecture, strategy, integration points, and file map for the implemented mobile sync engine.

## Decision register

| Decision | Status | Why | Source |
| --- | --- | --- | --- |
| `Expo + React Native + TypeScript` for mobile frontend | `Adopted` | Fastest path to a phone-first app with one codebase and strong AI-assisted delivery. | `apps/mobile/package.json` |
| `Expo Router` for app navigation | `Adopted` | File-based routing keeps structure simple and predictable for AI and humans. | `apps/mobile/package.json`, `apps/mobile/app/` |
| `SQLite (on-device) + Drizzle ORM` for local persistence | `Adopted` | Reliable offline-first data with typed schema and migrations. | `apps/mobile/package.json`, `apps/mobile/src/data/schema/`, `apps/mobile/drizzle/` |
| Continuous local autosave is implemented as a domain/data-layer contract before UI wiring | `Adopted` | Enables isolated verification of persistence behavior before screen integration. | `apps/mobile/src/session-recorder/draft-autosave.ts`, `docs/specs/milestones/M3-session-domain-local-autosave.md` |
| React Native lifecycle integration uses adapter contracts | `Adopted` | Maps RN lifecycle events to flush triggers without coupling persistence logic to UI components. | `apps/mobile/src/session-recorder/lifecycle-helpers.ts` |
| Session completion persists `completedAt` and materialized `durationSec` | `Adopted` | Keeps completion reads/sorts deterministic without recomputing duration for completed sessions. | `apps/mobile/src/data/schema/sessions.ts`, `apps/mobile/src/data/session-drafts.ts` |
| Autosave policy is explicit and testable; precise timing constants are defined in milestone/task specs | `Adopted` | Preserves high-level architecture stability while allowing milestone-level tuning details. | `docs/specs/milestones/M3-session-domain-local-autosave.md`, `docs/tasks/complete/T-20260220-03-m3-continuous-autosave-and-draft-lifecycle.md` |
| Exercise variation model is optional and key/value based, with user-extensible keys/values and exercise-owned variation definitions | `Adopted` | Supports expressive tracking while preserving fast logging defaults and avoiding premature analytics-model complexity. | `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`, `docs/brainstorms/M9-Exercise-Variations` |
| Session exercise persistence should reference canonical exercise identity and optional variation identity | `Adopted` | Prevents name-only drift and establishes stable data contracts for history behavior and future analytics/grouping features. | `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` |
| History reads and future analytics interpretation resolve exercise/variation/mapping metadata from the latest canonical catalog definitions; M9 does not introduce versioned or snapshot-preserved metadata semantics | `Adopted` | Aligns with product expectation that edits apply globally while keeping near-term schema/runtime complexity lower before analytics materialization exists. | `docs/specs/00-product.md`, `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` |
| Initial M11 mobile sync reconciles the full scoped domain from local SQLite and backend snapshots on each foreground attempt; a persisted client outbox remains future work | `Adopted` | Keeps the first sync engine simple and deterministic for the small M11 domain while preserving local-first behavior and leaving room for a later outbox if scale or background delivery needs it. | `apps/mobile/src/sync/service.ts`, `docs/specs/milestones/M11-frontend-backend-sync-integration.md` |
| Initial mobile sync behavior is auth-gated and non-blocking: local usage continues when logged out, offline, or backend-unavailable, while `sync_state` persists paused/error reasons and timestamps | `Adopted` | Preserves local-first UX while allowing sync to run opportunistically when authenticated and connected, with durable diagnostics for later UI surfaces. | `apps/mobile/src/sync/engine.ts`, `apps/mobile/src/data/sync-state.ts`, `docs/specs/milestones/M11-frontend-backend-sync-integration.md` |
| Initial M11 sync is foreground/app-usage based (`bootstrap`, `resume`, connectivity regain, periodic polling) rather than OS-level background delivery | `Adopted` | Matches the first sync milestone scope and avoids premature native background/runtime complexity. | `apps/mobile/src/sync/engine.ts`, `docs/specs/milestones/M11-frontend-backend-sync-integration.md` |
| User-visible M11 sync diagnostics are read-only and restrained: a dedicated sync-status route plus a lightweight entry card expose persisted sync timestamps/reasons without interrupting core logging flows | `Adopted` | Makes sync health discoverable while preserving the app's local-first, non-blocking feel during routine offline/auth-paused periods. | `apps/mobile/app/sync-status.tsx`, `apps/mobile/app/session-list.tsx`, `apps/mobile/components/sync/sync-status-card.tsx` |
| Session sync conflict handling preserves aggregate session-graph parity using deterministic aggregate reconciliation (`updatedAt` winner + CAS-backed stale fallback); row-level child last-write semantics are insufficient for recorder edits | `Adopted` | The mobile recorder rewrites nested exercises/sets as a whole graph, so sync must resolve divergence at the aggregate level without mixing child rows from different versions. | `apps/mobile/src/sync/service.ts`, `supabase/session-sync-api-contract.md`, `apps/mobile/src/data/session-drafts.ts` |
| Session-graph writes use an aggregate `Supabase PostgREST RPC` with compare-and-swap semantics, while row-level `PostgREST` routes remain the pull/basic-CRUD surface | `Adopted` | Preserves nested child-removal parity for recorder edits and rejects stale aggregate writes without mixing child rows from different versions. | `supabase/session-sync-api-contract.md`, `supabase/migrations/20260303113000_m11_session_graph_replace_rpc.sql`, `supabase/tests/session-sync-api-contract.sh` |
| Mobile sync foundation uses an injected auth-session source, env-based public Supabase client config, and persisted local `sync_state` metadata with an explicit `never_initialized` default before orchestration evaluates eligibility | `Adopted` | Gives the sync engine a stable auth/config/state boundary without introducing login UI or privileged mobile credentials. | `apps/mobile/src/sync/auth-session.tsx`, `apps/mobile/src/sync/backend-client.ts`, `apps/mobile/src/data/sync-state.ts`, `docs/specs/milestones/M11-frontend-backend-sync-integration.md` |
| MVP backend platform (primary) is `Supabase (Postgres + Auth + RLS)` | `Adopted` | Best fit for M5 scope: secure auth/authz + sync API baseline with strong local-test fidelity and better SQL/data portability than the evaluated fallback (`Cloudflare Workers + D1`). | `docs/tasks/complete/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`, `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` |
| `Cloudflare Workers + D1` is documented as an M5 contingency fallback, not the primary MVP backend | `Planned (contingency)` | Preserves a zero-spend/lean edge path if needed, but increases auth/authz implementation scope and weakens SQL portability for this milestone. | `docs/tasks/complete/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md` |
| M5 backend tasks must support a local backend runtime with high-fidelity local verification before deployment | `Adopted` | Local runtime/testing was elevated to a hard requirement to minimize post-deployment debugging and keep delivery iteration fast. | `docs/tasks/complete/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`, `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` |
| Social/group features are layered after tracker and sync foundations | `Planned` | Prevents premature complexity while keeping extension path explicit in delivery order. | N/A |
