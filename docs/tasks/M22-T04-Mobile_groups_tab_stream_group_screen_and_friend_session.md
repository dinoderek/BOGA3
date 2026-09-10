---
task_id: M22-T04-Mobile_groups_tab_stream_group_screen_and_friend_session
milestone_id: "M22"
status: planned
ui_impact: "yes"
areas: "frontend"
runtimes: "node|expo|maestro"
gates_fast: "./boga test fast"
gates_slow: "./boga test frontend"
docs_touched: "docs/specs/ui/screen-map.md, docs/specs/ui/navigation-contract.md, docs/specs/ui/components-catalog.md, docs/specs/ui/ux-rules.md, docs/specs/08-ux-delivery-standard.md, docs/specs/tech/groups-contract.md"
---

# M22-T04 — Mobile: Groups tab, stream, group screen, friend's session view

## Task metadata

- Task ID: `M22-T04-Mobile_groups_tab_stream_group_screen_and_friend_session`
- Status: `planned`
- Depends on: `M22-T03`
- Precedes: `M22-T05`, which adds the create, join, invite, and manage
  actions onto these screens

## Parent references (required)

- Milestone spec: `docs/specs/milestones/M22-groups-and-foundations.md` (FR 2,
  6, 7, 8, 9)
- **Contract:** `docs/specs/tech/groups-contract.md`
  - §6.3: routes, tab, and friend view;
  - §7: freshness and the offline marker.
- UX standard: `docs/specs/08-ux-delivery-standard.md`; UI docs:
  `docs/specs/ui/README.md`
- Existing layout to compose: `SessionContentLayout`
  (`apps/mobile/components/session-recorder/`), used by
  `apps/mobile/app/completed-session/[sessionId].tsx`

## Objective

Ship the read side of groups in the app:

- the fourth **Groups** tab, with the stream and group filter chips;
- the My groups list;
- the group screen (header plus Stream and Members, read-only in this task);
- the read-only friend's session view;
- the signed-out, empty, offline, and lost-access states.

## Scope

### In scope

- **Tab:** `TopLevelTabs` gains a `groups` tab (`top-level-tab-groups`), and
  `app/(tabs)/_layout.tsx` gains the route and `resolveActiveTab`.
- **Routes:** `app/(tabs)/groups.tsx`, `app/group/mine.tsx`,
  `app/group/[groupId]/index.tsx`, and
  `app/group-session/[memberId]/[sessionId].tsx`, registered with titles in
  `app/_layout.tsx`.
- **Components:** new `components/groups/`:
  - a stream session card;
  - a membership item;
  - the group filter chips (reuse `SegmentedChips`);
  - an offline banner;
  - a member row.
- **Pull-to-refresh:** `RefreshControl` on the stream lists.

### Out of scope

Create, join, edit, invite, share, the username gate, and member management
actions (`M22-T05`). The empty state's Create and Join buttons and the header
actions land in `T05`; this task leaves their slots.

## UX Contract

### Key user flows

1. **Browse the stream**
   - Trigger: tap the Groups tab while signed in with at least one group.
   - Steps:
     1. The cached stream renders at once.
     2. A refresh runs on focus and every 30 s while focused.
     3. The chips switch between All and a single group.
     4. Pull-to-refresh forces a refresh.
   - Success outcome:
     - newest-first cards, each showing username, gym, start time, status
       ("Training now" or "Completed · duration"), performed sets, total kg,
       exercise count, and PR highlights;
     - membership items ("X joined / left the group / was removed").
   - Failure/edge outcome: the offline marker with "last updated"; the offline
     empty state when there is no cache; an inline error with Retry on a
     non-network error.
2. **Open a friend's session**
   - Trigger: tap a session card.
   - Steps: the friend view loads the detail (cache first) and renders
     exercises with performed sets (kg, reps, effort).
   - Success outcome: the View Session layout with no edit, delete, or append.
     "In progress" shows for an active session. Pull-to-refresh updates it.
   - Failure/edge outcome: `NOT_FOUND` shows "This session is no longer
     available" and evicts the cache; offline shows the cached detail with the
     marker.
3. **Open a group**
   - Trigger: tap a membership item, or a group in My groups.
   - Steps: the header shows name, description, member count, and my role; the
     Stream and Members segments load; members are sorted by role, then
     username.
   - Success outcome: that group's stream and member list.
   - Failure/edge outcome: after removal, "You're no longer a member of this
     group", with cached data hidden (C3.6.8).
4. **Signed out or no groups**
   - Trigger: open the Groups tab.
   - Success outcome:
     - signed-out or auth-unconfigured shows a sign-in-required state;
     - no groups shows the explanatory empty state (its Create/Join actions
       come in `T05`).

### Interaction + appearance notes

- Reuse `UiSurface`, `UiText`, `UiButton`, `SegmentedChips`, and tokens. Add
  no raw color literals (`npm run lint:ui-guardrails`).
- Session cards are collapsed summaries: the collapsible summary card pattern
  without an expand, where a tap navigates.
- **The fourth tab must fit on the smallest supported phone.** Capture a
  screenshot, and if the labels truncate, record the adjustment.
- New patterns (the stream card, the offline marker, pull-to-refresh) are
  added to the 08 UX patterns.

## Acceptance criteria

1. Flows 1–4 are implemented, and each has jest/RNTL happy-path and
   failure-path assertions (AC5, AC6, AC12, AC14 UI side).
2. The friend view renders no owner action testIDs (AC6).
3. Screens use documented tokens and primitives, with no raw colors.
4. The UI docs are updated (below). `navigation-contract.md` lists the new
   routes and transitions.

## Docs touched (required)

- UI docs update required: **yes**.
  - `ui/screen-map.md` — the new screens;
  - `ui/navigation-contract.md` — routes, params, and transitions;
  - `ui/components-catalog.md` — the `components/groups/*` components;
  - `ui/ux-rules.md` — pull-to-refresh and the offline marker.
- `docs/specs/08-ux-delivery-standard.md`: UX patterns for the stream card and
  the offline marker.
- `docs/specs/tech/groups-contract.md`: **As-built** notes for §6.3 and §7.
- Tokens/primitives reuse plan: the primitives above; exceptions none planned.
- **Screenshots required:**
  - stream (All and one group);
  - offline marker;
  - empty state;
  - signed-out state;
  - friend view;
  - group screen;
  - the tab bar on a small phone.

## Testing and verification approach

- **Iterate** with `npx jest groups`.
- **Before the PR:** `./boga test fast` and `./boga test frontend`. The
  existing smoke lanes must stay green with the new tab. The two-user e2e is
  `M22-T06`.

## Evidence

## Completion note

- What changed:
- What tests ran:
- What remains:
