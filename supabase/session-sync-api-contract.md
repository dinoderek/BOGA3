# M5 Session Sync API Contract Baseline (`T-20260220-11`)

## Super simple summary

- Current sync API uses a mixed `Supabase PostgREST` surface:
  - row-level `GET/POST/PATCH` table routes on `app_public` for baseline entity CRUD and pulls,
  - authenticated `POST /rest/v1/rpc/replace_session_graph` for aggregate session-graph writes that must preserve nested child-removal parity.
- Clients call the sync surface with the `anon` key and, when authenticated, a user JWT; backend ownership is enforced by `RLS`, DB constraints, and explicit owner checks inside the aggregate RPC.
- Contract behavior is validated by local Supabase integration tests in `supabase/tests/session-sync-api-contract.sh`.

## Related baseline docs (per `docs/specs/04-ai-development-playbook.md`)

- `docs/specs/10-api-authn-authz-guidelines.md` (backend API/authN/authZ rules for this sync surface)

## Status / scope

- Status: implemented for local/backend validation in M5 and extended in M11 for aggregate session-graph parity.
- Chosen Supabase surface:
  - `PostgREST` table routes against `app_public` for row-level CRUD/list behavior,
  - one `PostgREST RPC` (`app_public.replace_session_graph`) for whole-session graph replacement.
- Covered entities:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
- Out of scope here:
  - mobile sync-engine wiring
  - cross-session batching/orchestration
  - non-session-domain entities

## M11 parity extension (`T-20260302-02`)

- Why it exists:
  - the mobile recorder persists a session and its nested `session_exercises` + `exercise_sets` as one aggregate rewrite, not as unrelated child-row mutations.
- Implemented parity mechanism:
  - `app_public.replace_session_graph(p_session jsonb, p_exercises jsonb, p_expected_updated_at bigint)` replaces all nested exercises/sets for one session in a single transaction;
  - omitted child rows are deleted by replacement, which preserves nested child-removal parity without introducing tombstones on `session_exercises` / `exercise_sets`;
  - stale writes are rejected by comparing `p_expected_updated_at` with the current `sessions.updated_at` value for that session;
  - the function returns the materialized session graph after replacement so the caller can treat the backend result as the authoritative aggregate write outcome.
- Auth/authz posture:
  - the RPC is callable on the public API surface, but it fails with `AUTH_REQUIRED` unless `auth.uid()` is present;
  - cross-user access is rejected inside the function before any write occurs;
  - row-level `RLS` and FK/check constraints remain in place for the underlying tables and for the row-level `PostgREST` routes.

## Surface choice (why `PostgREST` first)

- The sync-domain CRUD contract maps 1:1 to user-owned tables already protected by `RLS`.
- `RLS` + FK/check constraints already enforce ownership and core invariants server-side.
- Avoids premature custom runtime code (`Edge Functions`) before cross-entity orchestration/validation is needed.
- Keeps M5 test focus on real auth + `RLS` behavior in local Supabase.

## Auth requirements (all methods)

- Use local/hosted `Supabase` API endpoint + client-safe `anon` key.
- Send authenticated user JWT in `Authorization: Bearer <access_token>` for normal sync operations.
- For `app_public` table routes, send:
  - `Accept-Profile: app_public`
  - `Content-Profile: app_public` (writes)
- For `app_public.replace_session_graph`, send:
  - `POST /rest/v1/rpc/replace_session_graph`
  - `Accept-Profile: app_public`
  - `Content-Profile: app_public`

## Provider-neutral method catalog (M5 baseline)

The FE integration milestone should treat the following as the stable contract names. The current Supabase implementation mapping is documented alongside each method.

### `gyms`

| Provider-neutral method | Purpose | Supabase mapping (M5) |
| --- | --- | --- |
| `sync.gyms.list` | Pull gyms for current user (optionally filtered by `updatedAt >=`) | `GET /rest/v1/gyms?...` (`app_public`) |
| `sync.gyms.create` | Create user-owned gym row | `POST /rest/v1/gyms` (`Prefer: return=representation`) |
| `sync.gyms.update` | Update an existing user-owned gym row by `id` | `PATCH /rest/v1/gyms?id=eq.<id>` (`Prefer: return=representation`) |

### `sessions`

| Provider-neutral method | Purpose | Supabase mapping (M5) |
| --- | --- | --- |
| `sync.sessions.list` | Pull sessions for current user | `GET /rest/v1/sessions?...` (`app_public`) |
| `sync.sessions.create` | Create session row | `POST /rest/v1/sessions` |
| `sync.sessions.update` | Update session row by `id` (including status/completion fields) | `PATCH /rest/v1/sessions?id=eq.<id>` |
| `sync.sessions.replaceGraph` | Atomically replace one session row plus its nested exercises/sets using optimistic concurrency | `POST /rest/v1/rpc/replace_session_graph` |

### `session_exercises`

| Provider-neutral method | Purpose | Supabase mapping (M5) |
| --- | --- | --- |
| `sync.sessionExercises.list` | Pull exercises (typically filtered by `session_id`) | `GET /rest/v1/session_exercises?...` |
| `sync.sessionExercises.create` | Create exercise row under session | `POST /rest/v1/session_exercises` |
| `sync.sessionExercises.update` | Update exercise row by `id` | `PATCH /rest/v1/session_exercises?id=eq.<id>` |

### `exercise_sets`

| Provider-neutral method | Purpose | Supabase mapping (M5) |
| --- | --- | --- |
| `sync.exerciseSets.list` | Pull sets (typically filtered by `session_exercise_id`) | `GET /rest/v1/exercise_sets?...` |
| `sync.exerciseSets.create` | Create set row under exercise | `POST /rest/v1/exercise_sets` |
| `sync.exerciseSets.update` | Update set row by `id` | `PATCH /rest/v1/exercise_sets?id=eq.<id>` |

## Payload contracts (provider-neutral fields)

All timestamps are epoch milliseconds (`number`), matching the current mobile/local schema.

### `GymRecord`

```json
{
  "id": "gym_123",
  "name": "Downtown Gym",
  "origin_scope_id": "private",
  "origin_source_id": "local",
  "created_at": 1730000000000,
  "updated_at": 1730000001000
}
```

### `SessionRecord`

```json
{
  "id": "session_123",
  "gym_id": "gym_123",
  "status": "draft",
  "started_at": 1730000010000,
  "completed_at": null,
  "duration_sec": null,
  "deleted_at": null,
  "created_at": 1730000010000,
  "updated_at": 1730000010000
}
```

### `SessionExerciseRecord`

```json
{
  "id": "sx_123",
  "session_id": "session_123",
  "order_index": 0,
  "name": "Chest Press",
  "machine_name": "Plate Press",
  "origin_scope_id": "private",
  "origin_source_id": "local",
  "created_at": 1730000020000,
  "updated_at": 1730000020000
}
```

### `ExerciseSetRecord`

```json
{
  "id": "set_123",
  "session_exercise_id": "sx_123",
  "order_index": 0,
  "weight_value": "120",
  "reps_value": "10",
  "created_at": 1730000030000,
  "updated_at": 1730000030000
}
```

### `SessionGraphReplaceRequest`

```json
{
  "p_expected_updated_at": 1730000010000,
  "p_session": {
    "id": "session_123",
    "gym_id": "gym_123",
    "status": "active",
    "started_at": 1730000010000,
    "completed_at": null,
    "duration_sec": null,
    "deleted_at": null,
    "created_at": 1730000010000,
    "updated_at": 1730000020000
  },
  "p_exercises": [
    {
      "id": "sx_123",
      "order_index": 0,
      "name": "Chest Press",
      "machine_name": "Incline Press",
      "origin_scope_id": "private",
      "origin_source_id": "local",
      "created_at": 1730000015000,
      "updated_at": 1730000020000,
      "sets": [
        {
          "id": "set_123",
          "order_index": 0,
          "weight_value": "120",
          "reps_value": "10",
          "created_at": 1730000016000,
          "updated_at": 1730000020000
        }
      ]
    }
  ]
}
```

## Example request/response mappings (`PostgREST` + RPC)

### Example: create gym (`sync.gyms.create`)

- Method: `POST`
- Route: `/rest/v1/gyms`
- Headers:
  - `Accept-Profile: app_public`
  - `Content-Profile: app_public`
  - `Prefer: return=representation`
- Body:

```json
{
  "id": "sync-gym-a-1",
  "name": "Warehouse Gym",
  "origin_scope_id": "private",
  "origin_source_id": "local",
  "created_at": 1730000000000,
  "updated_at": 1730000000000
}
```

- Success response: `201` + array with the inserted row (including backend-populated `owner_user_id`).

### Example: update session completion (`sync.sessions.update`)

- Method: `PATCH`
- Route: `/rest/v1/sessions?id=eq.sync-session-a-1`
- Body:

```json
{
  "status": "completed",
  "completed_at": 1730000004000,
  "duration_sec": 4,
  "updated_at": 1730000004001
}
```

- Success response: `200` + array containing the updated row.
- Cross-user attempt: `200` + empty array (hidden by `RLS`).

### Example: list exercises for session (`sync.sessionExercises.list`)

- Method: `GET`
- Route: `/rest/v1/session_exercises?session_id=eq.sync-session-a-1&select=id,order_index,name&order=order_index.asc`
- Success response: `200` + ordered array of rows visible to the authenticated owner.

### Example: replace a session graph (`sync.sessions.replaceGraph`)

- Method: `POST`
- Route: `/rest/v1/rpc/replace_session_graph`
- Purpose:
  - update the parent session row and replace all nested child rows as one aggregate write;
  - delete any prior child rows that are omitted from `p_exercises`;
  - reject stale writes when `p_expected_updated_at` does not match the current remote session version.
- Body: `SessionGraphReplaceRequest`
- Success response: `200` + JSON object:

```json
{
  "session": {
    "id": "session_123",
    "gym_id": "gym_123",
    "status": "active",
    "started_at": 1730000010000,
    "completed_at": null,
    "duration_sec": null,
    "deleted_at": null,
    "created_at": 1730000010000,
    "updated_at": 1730000020000
  },
  "exercises": [
    {
      "id": "sx_123",
      "session_id": "session_123",
      "order_index": 0,
      "name": "Chest Press",
      "machine_name": "Incline Press",
      "origin_scope_id": "private",
      "origin_source_id": "local",
      "created_at": 1730000015000,
      "updated_at": 1730000020000,
      "sets": [
        {
          "id": "set_123",
          "session_exercise_id": "sx_123",
          "order_index": 0,
          "weight_value": "120",
          "reps_value": "10",
          "created_at": 1730000016000,
          "updated_at": 1730000020000
        }
      ]
    }
  ]
}
```

## Error/denial semantics (provider-neutral handling guidance)

Current Supabase behavior is intentionally preserved for table routes, and the M11 RPC adds explicit aggregate-sync error messages. FE integration should normalize both into provider-neutral categories.

| Provider-neutral category | Typical `PostgREST` / RPC behavior | Notes |
| --- | --- | --- |
| `AUTH_REQUIRED` | non-2xx JSON error for table routes; RPC body contains `AUTH_REQUIRED` | Missing/invalid user JWT for protected sync actions |
| `VALIDATION_FAILED` | non-2xx JSON error (`Postgres`/`PostgREST` code in body) | Check constraints, missing required fields, type issues |
| `NOT_FOUND_OR_DENIED` | `200` + empty array on targeted `SELECT`/`PATCH` | `RLS` hides cross-user rows instead of revealing existence |
| `PARENT_LINK_DENIED` | non-2xx JSON error (FK violation) | Cross-user child insert/update fails FK + ownership linkage |
| `SESSION_GRAPH_STALE` | non-2xx JSON error from `replace_session_graph` | `p_expected_updated_at` did not match the current remote `sessions.updated_at` |
| `SESSION_GRAPH_NOT_FOUND_OR_DENIED` | non-2xx JSON error from `replace_session_graph` | Aggregate write targeted a session graph not owned by the caller |

## Contract test coverage (local Supabase)

The local integration/contract suite for this task lives at:

- `supabase/tests/session-sync-api-contract.sh`
- wrapper: `supabase/scripts/test-sync-api-contract.sh`

Coverage includes:

- success create/read/update/list flows for each entity family
- success create + replace flow for `sync.sessions.replaceGraph`
- stale-write rejection for aggregate session-graph replacement
- nested child-removal parity for session-graph replacement
- validation failures for each entity family
- unauthenticated request denial
- cross-user read/update denial
- cross-user parent/child ownership mismatch denial
- cross-user denial for aggregate session-graph replacement
