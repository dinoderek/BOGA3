# Technical Architecture Decisions (High-Level)

## Purpose

Capture top-level architecture decisions for MVP, with clear `Adopted` vs `Planned` status.

## System map

`Expo React Native UI`
-> `Session domain + autosave orchestration`
-> `Local repository layer (Drizzle + SQLite)`
-> `Auth-gated sync engine + outbox (planned)`
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
| Autosave policy is explicit and testable; precise timing constants are defined in milestone/task specs | `Adopted` | Preserves high-level architecture stability while allowing milestone-level tuning details. | `docs/specs/milestones/M3-session-domain-local-autosave.md`, `docs/tasks/complete/T-20260220-03-m3-continuous-autosave-and-draft-lifecycle.md` |
| Exercise and mapping metadata semantics are retroactive for history and analytics interpretation | `Adopted` | Aligns with product expectation that edits apply globally and keeps near-term schema/runtime complexity lower before analytics materialization exists. | `docs/specs/00-product.md` |
| Logged session exercises persist canonical `exercise_definition_id` alongside display name/origin metadata | `Adopted` | Prevents name-only drift and gives later tag/analytics features a stable exercise identity for history, grouping, and per-exercise metadata lookup. | `apps/mobile/src/data/schema/session-exercises.ts`, `apps/mobile/src/data/session-drafts.ts`, `docs/tasks/complete/T-20260304-01-m12-session-exercise-definition-link-and-tag-schema.md` |
| Mobile auth bootstrap uses `Supabase Auth` client-safe credentials plus persisted session restore, and missing auth config degrades to logged-out/non-blocking behavior | `Adopted` | Establishes the M11 auth foundation without coupling launch or local tracker flows to backend availability or env configuration. | `apps/mobile/src/auth/`, `docs/specs/milestones/M11-auth-ui-and-profile-management.md` |
| Auth session state is exposed through a shared mobile auth service/provider rather than route-local listeners | `Adopted` | Prevents duplicated subscription logic across screens and gives later auth/profile UI work one canonical session state surface. | `apps/mobile/src/auth/service.ts`, `apps/mobile/src/auth/provider.tsx` |
| M11 profile management uses `app_public.user_profiles` keyed `1:1` to `auth.users(id)` with lazy mobile provisioning on first profile load/save | `Adopted` | Keeps `username` in app-owned storage while leaving email/password in `Supabase Auth`, and confines backend/profile failures to the profile route so local-only tracker flows remain usable. | `supabase/migrations/20260304153000_m11_user_profiles.sql`, `apps/mobile/src/auth/profile.ts`, `apps/mobile/app/profile.tsx` |
| Sync contract uses client outbox pattern from local store to cloud | `Planned` | Maintains offline-first guarantees while enabling reliable deferred sync when online. | `docs/specs/milestones/M11-frontend-backend-sync-integration.md` |
| Initial mobile sync behavior is auth-gated and non-blocking: local usage continues when logged out, offline, or backend-unavailable | `Planned` | Preserves local-first UX while allowing sync to run opportunistically when authenticated and connected. | `docs/specs/milestones/M11-frontend-backend-sync-integration.md` |
| MVP backend platform (primary) is `Supabase (Postgres + Auth + RLS)` | `Adopted` | Best fit for M5 scope: secure auth/authz + sync API baseline with strong local-test fidelity and better SQL/data portability than the evaluated fallback (`Cloudflare Workers + D1`). | `docs/tasks/complete/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`, `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` |
| `Cloudflare Workers + D1` is documented as an M5 contingency fallback, not the primary MVP backend | `Planned (contingency)` | Preserves a zero-spend/lean edge path if needed, but increases auth/authz implementation scope and weakens SQL portability for this milestone. | `docs/tasks/complete/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md` |
| M5 backend tasks must support a local backend runtime with high-fidelity local verification before deployment | `Adopted` | Local runtime/testing was elevated to a hard requirement to minimize post-deployment debugging and keep delivery iteration fast. | `docs/tasks/complete/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`, `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md` |
| Social/group features are layered after tracker and sync foundations | `Planned` | Prevents premature complexity while keeping extension path explicit in delivery order. | N/A |
