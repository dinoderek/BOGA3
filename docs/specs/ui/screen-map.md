# Screen Map (Authoritative Current UI)

## Purpose

Brief entrypoint map of the current mobile screens.

- This doc answers: "what screens exist and what is each screen for?"
- Use `docs/specs/ui/navigation-contract.md` for path/param/transition rules.
- Use source files for detailed UI structure and render logic.

## Sources

- `docs/specs/ui/repo-discovery-baseline.md`
- `docs/specs/ui/ui-pattern-audit.md`
- `docs/specs/ui/navigation-contract.md`

## User-facing route map (current)

1. `/` (alias)
- File: `apps/mobile/app/index.tsx`
- Purpose:
  - default app entry route that re-exports `session-list`
- Notes:
  - no unique UI; behaves as `/session-list`

2. `/session-list`
- File: `apps/mobile/app/session-list.tsx`
- Purpose:
  - sessions home/history screen (active session entry, completed history, session actions)
- Key states (high level):
  - loading / error / empty / populated list
  - in-route action modals
- Key exits:
  - `session-recorder`
  - `completed-session/[sessionId]`
  - `exercise-catalog`

3. `/session-recorder`
- File: `apps/mobile/app/session-recorder.tsx`
- Purpose:
  - active session recorder and completed-session editor (query-driven mode)
- Key states (high level):
  - active mode
  - completed-edit loading/error/content states
  - in-route picker/editor/action modals
- Key exits:
  - `exercise-catalog` (`source=session-recorder&intent=manage` from exercise picker)
  - dismisses to `/` on submit/save success

4. `/exercise-catalog`
- File: `apps/mobile/app/exercise-catalog.tsx`
- Purpose:
  - exercise catalog management (create/edit/soft-delete/undelete exercises and muscle mappings)
- Key states (high level):
  - loading / error / content
  - in-route editor/action/delete modals
  - deleted visibility toggle (`Show deleted` / `Hide deleted`)
- Key exits:
  - `session-recorder` after save when opened from recorder-origin manage flow
  - `session-list` via top-level tabs

5. `/completed-session/[sessionId]`
- File: `apps/mobile/app/completed-session/[sessionId].tsx`
- Purpose:
  - completed session detail viewer with edit/reopen/delete actions
- Key states (high level):
  - loading / error / not-found / detail
  - temporary redirect placeholder for `intent=edit`
- Key exits:
  - `session-recorder` (edit)
  - dismisses to `/` after successful reopen

6. `/sync-status`
- File: `apps/mobile/app/sync-status.tsx`
- Purpose:
  - read-only sync diagnostics screen for current state, pause reason, and recent sync timestamps
- Key states (high level):
  - loading / unavailable fallback / healthy / paused-or-delayed status states
- Key exits:
  - back to prior screen via stack navigation

## Route shell (not a user-facing screen)

1. `apps/mobile/app/_layout.tsx`
- Purpose:
  - root stack registration and local data bootstrap on app mount
- Notes:
  - static titles for main routes, including `sync-status`, are declared here
  - completed-session route sets its title inside the route file

## Documentation boundary

- Keep this doc brief and route-oriented.
- Do not duplicate detailed section breakdowns, component trees, or render logic from route files.
- If route purpose or screen-level state set changes materially, update this doc in the same task.
