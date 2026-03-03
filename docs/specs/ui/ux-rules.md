# UX Rules (Authoritative Current UI Semantics)

## Purpose

Document app-specific UI semantics and guardrails for the current mobile app.

- This doc is a reality-based source of truth for current behavior and conventions.
- It complements (does not replace) `docs/specs/08-ux-delivery-standard.md`, which defines cross-task UX process requirements.

## Sources

- UI docs index: `docs/specs/ui/README.md`
- Repo discovery baseline: `docs/specs/ui/repo-discovery-baseline.md`
- UI pattern audit (evidence): `docs/specs/ui/ui-pattern-audit.md`
- Screen map: `docs/specs/ui/screen-map.md`
- Navigation contract: `docs/specs/ui/navigation-contract.md`
- Components catalog: `docs/specs/ui/components-catalog.md`

## Status legend

- `Current behavior (authoritative)`: verified against current app code.
- `Pending / planned`: approved direction or audit-derived target not fully implemented yet.

## Current behavior (authoritative)

### 1. Action semantics

1. Primary actions are filled/high-emphasis actions used for the main next step in a section/screen.
   - Examples:
     - `Start Session`
     - `Submit Session` / `Save Changes`
     - `New Exercise`
2. Secondary actions are neutral/outline actions used for non-destructive alternatives or dismiss/close flows.
   - Examples:
     - `Cancel`
     - `Done`
     - `Reopen` (when enabled)
3. Danger actions are explicitly destructive and visually distinct.
   - Examples:
     - delete session
     - soft-delete exercise
     - remove destructive menu actions
4. Tab actions (`TopLevelTabs`) are navigation controls, not generic primary actions.
   - They use tab semantics (`accessibilityRole="tab"` / tablist) and active-state visuals.

### 2. Modal and overlay semantics

1. Most secondary workflows in current screens use in-route modal/overlay UI state instead of route changes.
   - Examples:
     - session list action menus
     - exercise catalog editor/action/delete modals
     - session recorder gym/exercise pickers/action menus and inline exercise creation editor
2. Modal open/close is treated as state within the current route and should not be documented as a navigation transition.
3. Dismiss overlays via backdrop press are common and expected when the flow is not destructive-final.

### 3. Screen layout and spacing conventions (current app behavior)

1. Current user-facing screens use vertical layouts with no horizontal scrolling on phone widths.
2. Page backgrounds are muted light surfaces (`surfacePage`-like behavior), with card/panel surfaces layered on top.
3. Spacing rhythm is already close to 8pt increments (common values cluster around `8/10/12/14/16/20`) and should remain consistent.
4. Bottom tab navigation remains visible on `session-list` and `exercise-catalog` across primary states (including loading/error in `exercise-catalog`).

### 4. List and row interaction conventions

1. Pressable list rows commonly separate:
   - main row press target (open/edit primary action)
   - trailing kebab/icon action for secondary actions
2. This split interaction pattern is used in both `session-list` and `exercise-catalog`, and should be preserved during refactors unless behavior intentionally changes.
3. Deleted/archived visibility is controlled via toggles and state hints, not separate routes.
4. In `exercise-catalog`, deleted exercises remain in list history when deleted visibility is enabled, show explicit `Deleted` state, and expose `Undelete` from row actions.

### 5. Forms and validation conventions

1. Text inputs, picker triggers, and read-only fields are visually similar but currently implemented in multiple screen-local styles.
2. Exercise catalog uses explicit field labels + inline validation/error messages and is the strongest current form pattern reference.
3. `session-recorder` completed-edit mode includes start/end validation and an autosave-paused notice when timestamps are invalid.
4. Validation/error feedback should remain near the relevant field/control whenever possible.

### 6. Loading, empty, error, and feedback state handling

1. Whole-screen loading/error states are used when route data cannot render meaningful content yet.
   - `exercise-catalog`: centered state + bottom tabs remain visible
   - `completed-session/[sessionId]`: centered state variants with route title preserved
2. In-section state panels are used inside `session-list` history region (loading/error/empty).
3. Inline helper/success/error text is used for form feedback and post-action feedback (`exercise-catalog`, completed-session action bar).
4. State presentation style varies by screen today; refactors may unify visuals, but the semantic distinction (whole-screen vs in-section vs inline) should remain explicit.

### 7. Completed-session detail screen semantics

1. Completed-session detail uses a sticky action bar for edit/reopen/delete actions above the detail content.
2. `Reopen` can be disabled when another active session exists; the UI shows a textual hint explaining why.
3. `intent=edit` on the completed-session route is a redirect behavior, not a separate screen.

### 8. Navigation/query semantics (UI-facing rule)

1. Route mode/state changes that affect screen behavior (for example `session-recorder` completed-edit mode) must be documented in `docs/specs/ui/navigation-contract.md`.
2. Route alias behavior (`/` -> `session-list`) should be treated as a navigation entry alias, not a unique screen design.
3. `exercise-catalog` supports recorder-entry query semantics (`source=session-recorder`, `intent=manage`) for the manage flow, while recorder `Add new` uses the same exercise editor inside the recorder route.

### 9. UI guardrail enforcement (current enforced rule)

1. Do not add raw color literals (`#hex`, `rgb(...)`, `rgba(...)`) directly in screen/component `.tsx` files.
2. Use UI tokens from `apps/mobile/components/ui/tokens.ts` directly or through primitives in `apps/mobile/components/ui/`.
3. Temporary exceptions require an explicit allowlist entry and rationale in `apps/mobile/scripts/ui-guardrails.config.js`.
4. As of Task `T-20260226-06`, the current route screens (`session-list`, `session-recorder`, `exercise-catalog`, `completed-session/[sessionId]`) no longer require raw-color allowlist exceptions.

Guardrail command:

- Run from `apps/mobile/`: `npm run lint:ui-guardrails`
- Audit mode: `npm run lint:ui-guardrails -- --include-allowlisted`

### 10. Documentation maintenance rule (UI semantics)

1. If a task changes current UI semantics (action roles, state treatment, modal conventions, list interactions, validation behavior), update this file in the same task/session.
2. If the change is route-path/param/transition related, update `navigation-contract.md` in the same task.
3. If the change is component/primitives API related, update `components-catalog.md` in the same task.

### 11. Sync diagnostics semantics

1. Sync health is exposed through read-only surfaces, not blocking modals or mandatory prompts.
2. The `session-list` sync card is a lightweight entry/indicator surface; it should stay compact and navigational.
3. Routine paused states such as offline or auth-missing should use calm informational language rather than danger-heavy failure styling.
4. Backend-unavailable retry states may use a warning tone, but they still must reinforce that local logging continues.

## Pending / planned (not current behavior)

1. Additional primitive extraction (for example state panels, modal surfaces, row cards, form fields) remains pending to reduce route-local style duplication beyond the token convergence completed in Task `T-20260226-06`.
2. Additional primitives from the audit (for example `ScreenContainer`, `EmptyState`, `ModalSurface`) are candidates, not current required APIs.
3. Temporary raw-color guardrail allowlist entries remain available only for future exceptional migrations; current route-screen exceptions were cleared in Task `T-20260226-06`.
