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

5. `/settings`
- File: `apps/mobile/app/settings.tsx`
- Purpose:
  - minimal account/settings entry screen for the M11 auth/profile flow
- Key states (high level):
  - one tappable account/profile card
- Key exits:
  - `profile`
  - back to the previous route via stack navigation

6. `/profile`
- File: `apps/mobile/app/profile.tsx`
- Purpose:
  - auth-aware account route for sign-in, signed-in summary, and sign-out
- Key states (high level):
  - restoring/auth-bootstrap banner
  - auth-disabled warning when client config is missing
  - signed-out email/password form with inline auth error feedback
  - signed-in account summary + placeholder profile-management shell + secondary sign-out
- Key exits:
  - in-place rerender between signed-out and signed-in states
  - back to `settings` (or previous route) via stack navigation

7. `/completed-session/[sessionId]`
- File: `apps/mobile/app/completed-session/[sessionId].tsx`
- Purpose:
  - completed session detail viewer with edit/reopen/delete actions
- Key states (high level):
  - loading / error / not-found / detail
  - temporary redirect placeholder for `intent=edit`
- Key exits:
  - `session-recorder` (edit)
  - dismisses to `/` after successful reopen

## Route shell (not a user-facing screen)

1. `apps/mobile/app/_layout.tsx`
- Purpose:
  - root stack registration and local data bootstrap on app mount
- Notes:
  - static titles for main routes are declared here, including `settings` and `profile`
  - completed-session route sets its title inside the route file

## Documentation boundary

- Keep this doc brief and route-oriented.
- Do not duplicate detailed section breakdowns, component trees, or render logic from route files.
- If route purpose or screen-level state set changes materially, update this doc in the same task.
