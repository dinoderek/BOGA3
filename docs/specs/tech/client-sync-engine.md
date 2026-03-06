# Client Sync Engine (M13)

## Purpose

Document the mobile client sync runtime introduced in M13 so future tasks can extend it safely.

Source-of-truth implementation files:

- `apps/mobile/src/sync/**`
- event emission write boundaries under `apps/mobile/src/data/**`

## 1) Components, file mappings, and roles

1. `apps/mobile/src/sync/types.ts`
- M13 envelope/request/response types.
- Locked entity-event compatibility map (`SYNC_ENTITY_EVENT_TYPES`).

2. `apps/mobile/src/sync/outbox.ts`
- Persistent queue + delivery state behavior.
- Backoff constants/policy and retry state transitions.
- Batch-response application semantics (`SUCCESS` full clear, `FAILURE` prefix clear + failed suffix retained).

3. `apps/mobile/src/sync/engine.ts`
- Flush orchestrator.
- In-flight guard (`inFlightFlushPromise`) to prevent concurrent sends.
- Transport invocation + normalization + error mapping.

4. `apps/mobile/src/sync/scheduler.ts`
- Foreground cadence scheduler (`60s` general, `10s` recorder).
- Online/offline toggling and immediate eligible flush on offline->online.
- Route-context mapping (`syncCadenceContextFromPathname`).

5. `apps/mobile/src/sync/index.ts`
- Public sync API surface for app/data layers.

6. `apps/mobile/src/data/schema/sync-outbox-events.ts`
- Persistent outbox table schema.

7. `apps/mobile/src/data/schema/sync-delivery-state.ts`
- Persistent delivery state schema.

8. `apps/mobile/src/data/migrations/index.ts` (`m0007_sync_outbox_delivery_state`)
- Runtime migration for sync persistence tables.

9. Event emission integration points (`apps/mobile/src/data/**`)
- `local-gyms.ts`
- `session-drafts.ts`
- `session-list.ts`
- `exercise-catalog.ts`
- `exercise-tags.ts`

## 2) Typical flows

### A. Domain write -> queued event

1. Repository write runs in DB transaction.
2. Same transaction calls `enqueueSyncEventsTx` or `enqueueSyncEvent`.
3. Outbox rows receive monotonic `sequence_in_device`.

### B. Scheduler tick -> flush

1. Scheduler tick calls `flushSyncOutbox`.
2. Engine checks transport configured, network online, retry-block, backoff window.
3. Engine reads up to `SYNC_BATCH_MAX_SIZE` events.
4. Engine sends ingest envelope.
5. Outbox applies response semantics and updates delivery state.

### C. Offline resume

1. Scheduler receives `setOnline(false)` while offline.
2. Flushes return `offline` and queue is retained.
3. On `setOnline(true)`, scheduler triggers immediate flush + continues cadence loop.

## 3) Interactions with the rest of the application

1. Root layout (`apps/mobile/app/_layout.tsx`)
- Starts/stops default scheduler.
- Updates cadence context from pathname.

2. Data repositories (`apps/mobile/src/data/**`)
- Emit sync events at mutation boundaries.
- Keep local-first behavior even when sync transport is unavailable.

3. Auth/profile/runtime integration (current M13 state)
- Outbox/scheduler are local-runtime capable; auth-gated transport configuration is handled by subsequent M13 tasks.

4. Navigation contract coupling
- Recorder cadence depends on route segment `session-recorder`.
- If recorder route path changes, update:
  - `apps/mobile/src/sync/scheduler.ts` (`SESSION_RECORDER_ROUTE_SEGMENT`)
  - `docs/specs/ui/navigation-contract.md` (route contract)
  - this doc

## 4) Failure modes and handling

1. Transport missing
- `flushSyncOutbox` returns `disabled`; queue remains intact.

2. Offline
- `flushSyncOutbox` returns `offline`; no dequeue.

3. Retry blocked (`should_retry=false`)
- delivery state marks `retryBlocked=true`.
- subsequent flushes return `blocked` until state reset by explicit logic.

4. Retryable failure (`should_retry=true` or transport error)
- prefix commit may be removed based on `error_index`.
- failed suffix remains queued.
- next eligible attempt scheduled via locked backoff policy.

5. Invalid ingest response contract
- treated as transport failure path; retry backoff applied.

6. In-flight contention
- second concurrent flush returns `in_flight`, preventing duplicate send races.

## 5) Test overview

1. Engine/outbox behavior
- `apps/mobile/app/__tests__/sync-outbox-engine.test.ts`
- coverage: in-flight guard, backoff constants, success/failure mapping, offline/disabled/blocked states.

2. Scheduler behavior
- `apps/mobile/app/__tests__/sync-scheduler.test.ts`
- coverage: 60s vs 10s cadence and offline->online immediate trigger.

3. Domain emission wiring
- `apps/mobile/app/__tests__/sync-domain-event-emission.test.ts`
- coverage: repository write boundaries enqueue expected entity events.

4. Root wiring
- `apps/mobile/app/__tests__/root-layout-auth-bootstrap.test.tsx`
- coverage: scheduler bootstrap + pathname context update wiring.

## Maintenance rule for follow-up tasks

Tasks `M13-T03`, `M13-T04`, and `M13-T05` must update this document in the same session when they change:

- sync flow control/state transitions,
- ingest/ack handling assumptions at the client boundary,
- cadence/context mapping behavior,
- event emission boundaries,
- verification/test strategy for sync runtime behavior.
