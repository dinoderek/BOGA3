# M5 Session Sync API Contract Baseline (`T-20260220-11`)

## Super simple summary

- Current sync API uses `Supabase PostgREST` directly on `app_public` tables (`gyms`, `sessions`, `session_exercises`, `exercise_sets`).
- Clients call table `GET/POST/PATCH` routes with `anon` key + user JWT; backend ownership is enforced by `RLS` + DB constraints.
- Contract behavior is validated by local Supabase integration tests in `supabase/tests/session-sync-api-contract.sh`.

## Related baseline docs (per `docs/specs/04-ai-development-playbook.md`)

- `docs/specs/10-api-authn-authz-guidelines.md` (backend API/authN/authZ rules for this sync surface)

## Status / scope

- Status: implemented for local/backend validation in M5.
- Chosen Supabase surface: `PostgREST` table routes against `app_public` (no custom `Edge Function` sync handlers in M5 baseline).
- Covered entities:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
- Out of scope here:
  - mobile sync-engine wiring
  - conflict resolution policy beyond row-level last-write semantics
  - batched multi-entity transaction orchestration

## M11 audit notes (Task 01)

- Current mobile edit behavior is more aggregate-oriented than this M5 baseline:
  - session recorder saves replace the full `session_exercises` + `exercise_sets` graph for a session in local storage rather than issuing independent child-row patches;
  - completed-session deletion currently maps to `sessions.deleted_at`, so top-level soft delete exists only for the parent session row.
- Known parity gaps relative to that mobile behavior:
  - there is no M5 delete/tombstone representation for `session_exercises` or `exercise_sets`;
  - the row-level `GET/POST/PATCH` contract does not yet encode "this edited session graph no longer contains child X/Y";
  - row-level last-write semantics alone are not sufficient to preserve whole-session intent when local and remote child graphs diverge.
- Required follow-up for M11 implementation (`T-20260302-02`):
  - add a backend parity mechanism for nested child removal (`delete`, tombstone, or deterministic graph-replacement equivalent);
  - define how stale-write/conflict cases are detected or rejected so sync does not silently merge incompatible child graphs;
  - keep auth/RLS ownership guarantees intact for any new parity surface.

## Surface choice (why `PostgREST` first)

- The sync-domain CRUD contract maps 1:1 to user-owned tables already protected by `RLS`.
- `RLS` + FK/check constraints already enforce ownership and core invariants server-side.
- Avoids premature custom runtime code (`Edge Functions`) before cross-entity orchestration/validation is needed.
- Keeps M5 test focus on real auth + `RLS` behavior in local Supabase.

## Auth requirements (all methods)

- Use local/hosted `Supabase` API endpoint + client-safe `anon` key.
- Send authenticated user JWT in `Authorization: Bearer <access_token>`.
- For `app_public` table routes, send:
  - `Accept-Profile: app_public`
  - `Content-Profile: app_public` (writes)

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

## Example request/response mappings (M5 local `PostgREST`)

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

## Error/denial semantics (provider-neutral handling guidance)

Current Supabase `PostgREST` behavior is intentionally preserved in M5. FE integration should normalize it into provider-neutral categories.

| Provider-neutral category | Typical `PostgREST` behavior (M5) | Notes |
| --- | --- | --- |
| `AUTH_REQUIRED` | non-2xx JSON error (commonly `401`) | Missing/invalid user JWT for protected `app_public` tables |
| `VALIDATION_FAILED` | non-2xx JSON error (`Postgres`/`PostgREST` code in body) | Check constraints, missing required fields, type issues |
| `NOT_FOUND_OR_DENIED` | `200` + empty array on targeted `SELECT`/`PATCH` | `RLS` hides cross-user rows instead of revealing existence |
| `PARENT_LINK_DENIED` | non-2xx JSON error (FK violation) | Cross-user child insert/update fails FK + ownership linkage |

## Contract test coverage (local Supabase)

The local integration/contract suite for this task lives at:

- `supabase/tests/session-sync-api-contract.sh`
- wrapper: `supabase/scripts/test-sync-api-contract.sh`

Coverage includes:

- success create/read/update/list flows for each entity family
- validation failures for each entity family
- unauthenticated request denial
- cross-user read/update denial
- cross-user parent/child ownership mismatch denial
