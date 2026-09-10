---
task_id: M22-T01-Backend_group_membership_invites_and_authz
milestone_id: "M22"
status: planned
ui_impact: "no"
areas: "backend"
runtimes: "supabase|sql"
gates_fast: "./boga test fast"
gates_slow: "./boga test backend"
docs_touched: "docs/specs/tech/groups-contract.md, docs/specs/05-data-model.md, docs/specs/10-api-authn-authz-guidelines.md, docs/specs/06-testing-strategy.md, docs/specs/02-quality-and-test-gates.md, scripts/lanes.tsv"
---

# M22-T01 — Backend: groups, membership periods, invites, authorization

## Task metadata

- Task ID: `M22-T01-Backend_group_membership_invites_and_authz`
- Status: `planned`
- Depends on: none (design merged)
- Parallel with: `M22-T03`

## Parent references (required)

- Milestone spec: `docs/specs/milestones/M22-groups-and-foundations.md`
- **Contract (source of truth for this card):** `docs/specs/tech/groups-contract.md`
  §2 (rules 1–5), §2.1–§2.3, §3, §4 (shared shapes, the error tokens, the
  reads `group_list_mine` / `group_get` / `group_invite_preview`, all of §4.3),
  and §8 (the backend lane)
- AuthZ rules: `docs/specs/10-api-authn-authz-guidelines.md` rules 14–18
- Testing: `docs/specs/02-quality-and-test-gates.md`, `docs/specs/06-testing-strategy.md`

## Objective

Ship the membership half of the group domain on the server:

- the `groups`, `group_memberships`, and `group_invites` tables;
- the internal helpers;
- every membership and invite RPC;
- a new hermetic backend contract lane `groups-contract` that proves them.

## Scope

### In scope

- **Migration** `supabase/migrations/<ts>_m22_groups_membership.sql`:
  - the tables, constraints, and indexes of contract §2.1–§2.3;
  - RLS enabled with no permissive policies, and `revoke all` from `anon` and
    `authenticated` (§3);
  - the internal helpers `group_require_app_user()`, `group_active_role(...)`,
    and the invite-code generator and normalizer (pgcrypto `extensions.gen_random_bytes`);
  - RPCs `group_create`, `group_update`, `group_list_mine`, `group_get`,
    `group_invite_get`, `group_invite_regenerate`, `group_invite_preview`,
    `group_join`, `group_leave`, `group_remove_member`, `group_set_role`, and
    `group_transfer_ownership`, with exactly the §4 shapes, tokens, and role
    matrix.
- **Lane `groups-contract`:**
  - the test body `supabase/tests/groups-contract.sh`, run via
    `supabase/scripts/run-suite.sh`;
  - a registry row in `scripts/lanes.tsv` (gate `slow-backend`, infra
    `supabase`, ci `no`), placed after `auth-authz`;
  - `./boga docs gen` to regenerate the spec 02 lane matrix;
  - a catalog row in spec 06.
- **As-built notes** in the contract, and the as-built membership inventory in
  spec 05 and spec 10.

### Out of scope

`group_session_shares`, the share trigger, `group_stream`,
`group_session_detail`, and the metric helpers (`M22-T02`). Any mobile code.

## Acceptance criteria

1. **Hermetic users.** `groups-contract` provisions per-run unique users
   (owner, admin, member, outsider, joiner) and passes on repeated runs in one
   slot without a reset.
2. **Success paths.** Every RPC in scope is covered, including create → owner
   with an invite, join → member, rejoin after leave → a new `member` period,
   and a second join as a no-op returning `joined:false`.
3. **Role matrix (AC10).**
   - A member can't call `invite_get`, `invite_regenerate`, `update`, `remove`,
     `set_role`, or `transfer`.
   - An admin can't remove an admin or the owner, and can't call `set_role` or
     `transfer`.
   - The owner can do all of these.
   - The owner (including a sole owner) gets `OWNER_MUST_TRANSFER` on leave.
   - A transfer makes the previous owner an admin.
4. **Error tokens and invites.**
   - `USERNAME_REQUIRED` on create and join for a user with a null or blank
     username.
   - `INVITE_INVALID` for unknown codes and for the old code after
     `invite_regenerate` (AC4).
   - Invite lookup normalizes case, spaces, dashes, and `O/I/L`.
   - `VALIDATION` for name/description bounds and self-targeting.
5. **Access (AC9, AC11).**
   - A non-member gets `NOT_FOUND` from `group_get` and `invite_get`, and the
     body is identical for a nonexistent group id.
   - A removed member gets `NOT_FOUND` on their next `group_get`.
   - Direct PostgREST select, insert, update, and delete on all three tables
     are denied or empty for `authenticated` and `anon`.
6. **Agent tokens.** A token carrying a `client_id` claim gets
   `AGENT_FORBIDDEN` from every RPC in scope. Mint it from the local JWT secret
   if available; otherwise reuse the OAuth helper path from
   `supabase/tests/agent-api-contract.sh`.
7. **Regression.** `./boga test backend` is green, including
   `sync-drift --strict`, which proves no group table is misread as a Sync v2
   entity.

## Docs touched (required)

- `docs/specs/tech/groups-contract.md`: add **As-built** notes to §2.1–§2.3,
  §3, and the §4 RPCs shipped here.
- `docs/specs/05-data-model.md`: add the as-built backend inventory for the
  three tables, with sync impact `out of sync scope` and its rationale.
- `docs/specs/10-api-authn-authz-guidelines.md`: remove "planned" from rules
  15–18 once they are true, and point the local-dev expectations at
  `groups-contract`.
- `docs/specs/06-testing-strategy.md`: add a backend lane catalog row for
  `groups-contract`, and add it to the shared runtime contract list.
- `docs/specs/02-quality-and-test-gates.md`: regenerate the matrix with
  `./boga docs gen`.

## Testing and verification approach

- **Iterate** with `./boga test groups-contract`.
- **Before the PR:**
  - `./boga test backend` (all lanes, including `sync-drift`);
  - `./boga test fast` (the docs-check and meta parts are triggered by the
    registry change).
- **Evidence:** the command output, and `./boga timings` for the new lane
  (never an estimate).

## Implementation notes

- `supabase/migrations/**`, `supabase/tests/**`, `scripts/lanes.tsv`, docs.
- Error transport follows `sync_push`:
  `raise exception '<TOKEN>: …' using errcode = 'P0001'`.
- Never add an `owner_user_id` column or an FK into the Sync v2 tables
  (contract §2 rules 1–2).

## Evidence

## Completion note

- What changed:
- What tests ran:
- What remains:
