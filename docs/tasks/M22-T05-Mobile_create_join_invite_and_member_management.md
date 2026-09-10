---
task_id: M22-T05-Mobile_create_join_invite_and_member_management
milestone_id: "M22"
status: planned
ui_impact: "yes"
areas: "frontend"
runtimes: "node|expo|maestro"
gates_fast: "./boga test fast"
gates_slow: "./boga test frontend"
docs_touched: "docs/specs/ui/screen-map.md, docs/specs/ui/navigation-contract.md, docs/specs/ui/components-catalog.md, docs/specs/ui/ux-rules.md, docs/specs/tech/groups-contract.md"
---

# M22-T05 — Mobile: create, edit, join, invite, members and roles

## Task metadata

- Task ID: `M22-T05-Mobile_create_join_invite_and_member_management`
- Status: `planned`
- Depends on: `M22-T04` (screens to extend), `M22-T03`

## Parent references (required)

- Milestone spec: `docs/specs/milestones/M22-groups-and-foundations.md` (FR 1,
  3, 4, 5, 9; C7.4)
- **Contract:** `docs/specs/tech/groups-contract.md`
  - §4.3: the write RPCs and role matrix;
  - §6.3: routes, the username gate, share, and the known limitation.
- UX standard: `docs/specs/08-ux-delivery-standard.md` (destructive action
  safety pattern); UI docs: `docs/specs/ui/README.md`
- Profile API: `apps/mobile/src/auth/profile.ts` (`loadUserProfile`,
  `saveUsername`)

## Objective

Ship every group write flow in the app:

- create and edit a group;
- join by code or by the `boga3://group/join?code=` link, with a preview;
- see, share, and regenerate the invite (owner and admins only);
- promote, demote, transfer, remove, and leave;
- the inline username gate;
- a clear offline error for every write.

## Scope

### In scope

- **Routes:** `app/group/new.tsx`, `app/group/[groupId]/edit.tsx` (a shared
  form component), `app/group/join.tsx`, and `app/group/[groupId]/invite.tsx`.
- **Groups tab:** the header actions (My groups, Create group, Join group) and
  the empty-state primary actions.
- **Group screen:** role-gated actions — Invite, Edit, Leave, and a per-member
  action sheet (Make admin / Remove admin / Transfer ownership / Remove).
- **`components/groups/username-gate.tsx`.**
- **Share:** React Native core `Share.share`. No new native dependency.

### Out of scope

Group delete/restore. Sharing controls. Return-to after sign-in for invite
links (a documented limitation).

## UX Contract

### Key user flows

1. **Create a group**
   - Trigger: Create group from the Groups tab (header or empty state).
   - Steps:
     1. If the username is blank, the inline username field shows first; save
        it, then continue.
     2. Enter a name (1–50) and an optional description (≤280).
     3. Tap Create.
   - Success outcome: the new group screen opens as owner, with the Invite
     action prominent (C3.3.2).
   - Failure/edge outcome: inline validation; offline shows a clear error and
     creates nothing (AC12); `USERNAME_REQUIRED` from the server re-opens the
     gate.
2. **Invite**
   - Trigger: Invite on the group screen (owner or admin).
   - Steps: the code is shown large; Share opens the share sheet with the code
     and `boga3://group/join?code=…`; Regenerate asks for confirmation ("The
     old code stops working").
   - Success outcome: the code is shared, or a new code is shown.
   - Failure/edge outcome: members never see Invite (C7.4); offline regenerate
     is an error with no change.
3. **Join**
   - Trigger: Join group, or opening the invite link (the code is prefilled).
   - Steps:
     1. The username gate runs if needed.
     2. Enter or confirm the code.
     3. The preview shows the group name and member count.
     4. Tap Join.
   - Success outcome: the group screen opens, and the stream shows "joined".
     Already a member opens the group.
   - Failure/edge outcome: an invalid or regenerated code shows "This invite
     code isn't valid" (AC4); offline shows an error.
4. **Manage members**
   - Trigger: tap a member row on the group screen.
   - Steps: the action sheet offers only the actions allowed for my role and
     the target (§4.3); destructive actions (Remove, Transfer) ask for
     confirmation.
   - Success outcome: the list updates in place; removal shows "X was
     removed" in the stream.
   - Failure/edge outcome: a server `FORBIDDEN` or `NOT_FOUND` shows inline
     feedback and a refresh; offline shows an error with no change.
5. **Edit and leave**
   - Trigger: Edit (owner or admin), or Leave (non-owner).
   - Steps: edit uses the shared form; Leave asks for confirmation.
   - Success outcome: leaving returns to the Groups tab, and the group
     disappears from chips and My groups.
   - Failure/edge outcome: the owner sees Leave replaced by "Transfer
     ownership before leaving" (C3.6.5).

### Interaction + appearance notes

- Destructive actions use the danger `UiButton` and a confirmation prompt
  (the destructive action safety pattern).
- The invite code is selectable, has testID `group-invite-code` (used by the
  `M22-T06` flow), and shows in a large monospace-like style from tokens.
- Username-gate errors appear inline next to the field.

## Acceptance criteria

1. Flows 1–5 are implemented, and each has jest/RNTL happy-path and
   failure-path assertions (AC1–AC4, AC10 UI gating, AC12).
2. **Role gating matches §4.3 exactly.** A test renders each role and target
   combination and asserts the offered actions.
3. The deep link `boga3://group/join?code=ABCD2345` opens the Join screen with
   the code prefilled. A jest router test covers the route params, and the
   Maestro coverage is in `T06`.
4. The UI docs are updated. No raw colors are introduced.

## Docs touched (required)

- UI docs update required: **yes**.
  - `ui/screen-map.md` and `ui/navigation-contract.md` — the new routes, the
    deep link, and the transitions;
  - `ui/components-catalog.md` — the username gate and the member action
    sheet;
  - `ui/ux-rules.md` — the online-only write error convention.
- `docs/specs/tech/groups-contract.md`: **As-built** notes on §6.3 for the
  write screens.
- **Screenshots required:**
  - the create form with the username gate;
  - the invite screen;
  - the join preview;
  - the invalid-code error;
  - the member action sheet for each role;
  - the offline write error.

## Testing and verification approach

`./boga test fast` and `./boga test frontend`.

## Evidence

## Completion note

- What changed:
- What tests ran:
- What remains:
