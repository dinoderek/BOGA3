# Navigation Contract (Authoritative Current Flows)

## Purpose

Brief entrypoint contract for current mobile routes, query/path params, and allowed route transitions.

- This doc answers: "which routes exist, what params matter, and how screens navigate between them?"
- Source files remain authoritative for exact navigation call sites and edge-case behavior.

## Sources

- `docs/specs/ui/screen-map.md`
- `docs/specs/ui/repo-discovery-baseline.md`
- Route files under `apps/mobile/app/**`

## Router baseline (current)

- Router system: `expo-router` (file-based routes in `apps/mobile/app/`)
- Root stack/layout: `apps/mobile/app/_layout.tsx`
- Navigation is currently string-path based (no centralized typed route helper layer)

## Route + param summary (current)

1. `/` (alias)
- File: `apps/mobile/app/index.tsx`
- Params:
  - none
- Behavior:
  - re-exports `/session-list`

2. `/session-list`
- File: `apps/mobile/app/session-list.tsx`
- Params:
  - none
- Behavior:
  - focus refreshes data via local reload token

3. `/session-recorder`
- File: `apps/mobile/app/session-recorder.tsx`
- Query params:
  - `mode` (optional; `completed-edit` enables completed-session edit flow)
  - `sessionId` (optional; used by completed-edit flow)
- Behavior:
  - missing/invalid completed-edit inputs are handled by route UI state (no crash)

4. `/exercise-catalog`
- File: `apps/mobile/app/exercise-catalog.tsx`
- Query params:
  - `source` (optional; `session-recorder` enables recorder-return affordances)
  - `intent` (optional; `add` auto-opens create editor once on initial load)
- Behavior:
  - when opened from recorder, saving an exercise returns via `router.back()`

5. `/completed-session/[sessionId]`
- File: `apps/mobile/app/completed-session/[sessionId].tsx`
- Path params:
  - `sessionId` (required dynamic segment)
- Query params:
  - `intent` (optional; `edit` redirects to `session-recorder` completed-edit mode)

6. `/sync-status`
- File: `apps/mobile/app/sync-status.tsx`
- Params:
  - none
- Behavior:
  - reads persisted local `sync_state` metadata and refreshes it when the route regains focus

## Allowed route transitions (current high-level flows)

1. `/` -> `/session-list`
   - default route alias behavior
2. `/session-list` -> `/session-recorder`
   - start/open active session
3. `/session-list` -> `/completed-session/<sessionId>`
   - open completed session detail
4. `/session-list` -> `/session-recorder?mode=completed-edit&sessionId=<sessionId>`
   - edit completed session from session actions
5. `/session-list` <-> `/exercise-catalog`
   - top-level tabs
6. `/completed-session/<sessionId>` -> `/session-recorder?mode=completed-edit&sessionId=<sessionId>`
   - edit action
7. `/completed-session/<sessionId>?intent=edit` -> `/session-recorder?mode=completed-edit&sessionId=<sessionId>`
   - route-side redirect (`replace`)
8. `/completed-session/<sessionId>` -> `/`
   - successful reopen (`dismissTo('/')`)
9. `/session-recorder...` -> `/`
   - successful submit/save (`dismissTo('/')`)
10. `/session-recorder` -> `/exercise-catalog?source=session-recorder&intent=manage`
   - exercise picker `Manage` action
11. `/exercise-catalog?source=session-recorder...` -> `/session-recorder`
   - explicit back action or post-save return (`router.back()`)
12. `/session-list` -> `/sync-status`
   - non-blocking sync-status entry card opens the detailed diagnostics route

Note:

- Modal opens/closes are in-route UI state transitions, not route transitions.
- `session-recorder` exercise picker `Add new` now opens an in-route exercise editor modal rather than navigating to `/exercise-catalog`.

## Header titles (current, high level)

- Static titles for `index`, `session-list`, `session-recorder`, `exercise-catalog`, and `sync-status` are set in `apps/mobile/app/_layout.tsx`
- `completed-session/[sessionId]` sets its title inside the route file (current title: `View Session`)

## Documentation boundary

- Keep this doc concise and contract-oriented.
- Do not duplicate every navigation call site or all route edge cases from source.
- If a task changes route paths, params, redirects, or screen-to-screen transitions, update this doc in the same session.
