# Technical Architecture Decisions (High-Level)

## Purpose

Capture top-level architecture decisions for MVP, with clear `Adopted` vs `Planned` status.

## System map

`Expo React Native UI`
-> `Session domain + autosave orchestration`
-> `Local repository layer (Drizzle + SQLite)`
-> `Sync outbox (planned)`
-> `Supabase backend (M5 selected; local-first dev/test via Supabase local stack)`

## Decision register

| Decision | Status | Why | Source |
| --- | --- | --- | --- |
| `Expo + React Native + TypeScript` for mobile frontend | `Adopted` | Fastest path to a phone-first app with one codebase and strong AI-assisted delivery. | `apps/mobile/package.json` |
| `Expo Router` for app navigation | `Adopted` | File-based routing keeps structure simple and predictable for AI and humans. | `apps/mobile/package.json`, `apps/mobile/app/` |
| `SQLite (on-device) + Drizzle ORM` for local persistence | `Adopted` | Reliable offline-first data with typed schema and migrations. | `apps/mobile/package.json`, `apps/mobile/src/data/schema/`, `apps/mobile/drizzle/` |
| Continuous local autosave is implemented as a domain/data-layer contract before UI wiring | `Adopted` | Enables isolated verification of persistence behavior before screen integration. | `apps/mobile/src/session-recorder/draft-autosave.ts`, `docs/specs/milestones/M3-session-domain-local-autosave.md` |
| React Native lifecycle integration uses adapter contracts | `Adopted` | Maps RN lifecycle events to flush triggers without coupling persistence logic to UI components. | `apps/mobile/src/session-recorder/lifecycle-helpers.ts` |
| Session completion persists `completedAt` and materialized `durationSec` | `Adopted` | Keeps completion reads/sorts deterministic without recomputing duration for completed sessions. | `apps/mobile/src/data/schema/sessions.ts`, `apps/mobile/src/data/session-drafts.ts` |
| Autosave policy is explicit and testable; precise timing constants are defined in milestone/task specs | `Adopted` | Preserves high-level architecture stability while allowing milestone-level tuning details. | `docs/specs/milestones/M3-session-domain-local-autosave.md`, `docs/tasks/T-20260220-03-m3-continuous-autosave-and-draft-lifecycle.md` |
| Sync contract uses client outbox pattern from local store to cloud | `Planned` | Maintains offline-first guarantees while enabling reliable deferred sync when online. | `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend` |
| MVP backend platform (primary) is `Supabase (Postgres + Auth + RLS)` | `Adopted` | Best fit for M5 scope: secure auth/authz + sync API baseline with strong local-test fidelity and better SQL/data portability than the evaluated fallback (`Cloudflare Workers + D1`). | `docs/tasks/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`, `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` |
| `Cloudflare Workers + D1` is documented as an M5 contingency fallback, not the primary MVP backend | `Planned (contingency)` | Preserves a zero-spend/lean edge path if needed, but increases auth/authz implementation scope and weakens SQL portability for this milestone. | `docs/tasks/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md` |
| M5 backend tasks must support a local backend runtime with high-fidelity local verification before deployment | `Adopted` | Local runtime/testing was elevated to a hard requirement to minimize post-deployment debugging and keep delivery iteration fast. | `docs/tasks/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`, `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` |
| Social/group features are layered after tracker and sync foundations | `Planned` | Prevents premature complexity while keeping extension path explicit in delivery order. | `docs/specs/00-mvp-deliverables.md#5-first-groups-prototype` |
