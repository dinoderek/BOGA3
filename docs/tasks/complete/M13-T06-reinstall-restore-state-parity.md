---
task_id: M13-T06-reinstall-restore-state-parity
milestone_id: "M13"
status: completed
ui_impact: "no"
areas: "frontend|backend|cross-stack"
runtimes: "node|supabase"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh backend"
docs_touched: "docs/specs/milestones/M13-simple-backend-sync.md,docs/specs/06-testing-strategy.md,docs/specs/tech/client-sync-engine.md"
---

# Task Card

## Task metadata

- Task ID: `M13-T06-reinstall-restore-state-parity`
- Title: M13 reinstall restore-state parity verification
- Status: `completed`
- File location rule:
  - author active cards in `docs/tasks/<task-id>.md`
  - move the file to `docs/tasks/complete/<task-id>.md` when `Status` becomes `completed` or `outdated`
- Session date: `2026-03-06`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M13-simple-backend-sync.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Data model: `docs/specs/05-data-model.md`
- AI development playbook: `docs/specs/04-ai-development-playbook.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- Client sync engine deep-dive: `docs/specs/tech/client-sync-engine.md`

## Objective

Implement deterministic automated proof that a brand-new app installation restored via sync produces identical user-domain state to the pre-sync state.

## Scope

### In scope

- Add a `Jest` test lane (primary) backed by local `Supabase` runtime baseline.
- Build a full M13 data-scope fixture by creating at least one row/edge for each entity:
  - `gyms`
  - `sessions`
  - `session_exercises`
  - `exercise_sets`
  - `exercise_definitions`
  - `exercise_muscle_mappings`
  - `exercise_tag_definitions`
  - `session_exercise_tags`
- Capture normalized deterministic pre-sync local snapshot.
- Run sync to successful convergence.
- Simulate reinstall (fresh local app data + fresh sync device state), re-login, trigger bootstrap/merge, and wait for convergence.
- Capture normalized post-restore snapshot and assert deep equality with pre-sync snapshot.
- Explicitly exclude non-scope state from comparison (auth credentials/session tokens, smoke/runtime-only artifacts, sync outbox/delivery metadata).

### Out of scope

- New sync protocol/schema changes.
- Multi-device semantics.
- Maestro as a required proof lane (optional supplemental evidence only).

## Acceptance criteria

1. A targeted automated test exists for reinstall restore-state parity.
2. The test creates/ensures at least one pre-sync record/edge for every M13 data-scope entity (including tags and tag assignments).
3. Pre-sync and post-restore snapshots are normalized deterministically before comparison.
4. Post-reinstall login + bootstrap/merge + convergence path is executed in the test and reaches success state.
5. Post-restore snapshot equals pre-sync snapshot for all M13 data-scope entities.
6. Non-scope state is excluded from parity assertions (auth/session credentials, runtime smoke data, sync outbox/delivery internals).
7. Primary lane uses `Jest` + local `Supabase` baseline (`Vitest` is not required).
8. `./scripts/quality-fast.sh frontend` passes.
9. `./scripts/quality-slow.sh backend` passes (or explicit `N/A` rationale is documented if scope changes).

## Docs touched (required)

- `docs/specs/milestones/M13-simple-backend-sync.md` - track parity-proof implementation/closeout for M13 acceptance.
- `docs/specs/06-testing-strategy.md` - codify restore-parity verification expectations in M13 sync policy if needed.
- `docs/specs/tech/client-sync-engine.md` - document the reinstall restore-parity test lane and snapshot-comparison boundaries.

## Testing and verification approach

- Planned checks/commands:
  - `./supabase/scripts/ensure-local-runtime-baseline.sh`
  - targeted `Jest` restore-parity suite in `apps/mobile/app/__tests__/`
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh backend`
- Test layers covered:
  - integration
  - cross-stack integration (mobile runtime + local Supabase)
- Notes:
  - use `Jest` as the primary lane for deterministic state assertions;
  - Maestro evidence is optional and non-blocking for this task.

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/__tests__/**`
  - `apps/mobile/src/sync/**`
  - `apps/mobile/src/data/**`
  - test helpers/harness code as needed
  - `docs/specs/**` and milestone/task docs
- Project structure impact:
  - none expected

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh backend`
- Additional required runtime baseline command: `./supabase/scripts/ensure-local-runtime-baseline.sh`

## Evidence

- restore-parity test output showing pre-sync and post-restore snapshot equality
- command outputs for:
  - `./supabase/scripts/ensure-local-runtime-baseline.sh`
  - targeted `Jest` parity suite
  - `./scripts/quality-fast.sh frontend`
  - `./scripts/quality-slow.sh backend`
- manual verification summary (if any)

## Completion note

- What changed: Restore-parity implementation exists from the prior session; this session refreshed local setup and rechecked the backend blocker.
  - Added targeted parity suite `apps/mobile/app/__tests__/sync-reinstall-restore-parity.test.ts`.
  - Added runner wrapper `apps/mobile/scripts/test-sync-reinstall-restore-parity.sh` to enforce local Supabase baseline + inject runtime auth env for the targeted lane.
  - Implemented deterministic M13 full-scope fixture + scoped snapshot normalization + reinstall reset simulation + post-login bootstrap/merge parity assertion.
  - Updated M13 sync testing references in:
    - `docs/specs/06-testing-strategy.md`
    - `docs/specs/tech/client-sync-engine.md`
    - `docs/specs/milestones/M13-simple-backend-sync.md`
- What tests ran: Targeted parity/frontend gates passed previously; backend slow gate now passes after Docker and `jq` setup.
  - `apps/mobile/scripts/test-sync-reinstall-restore-parity.sh` (`PASS`)
  - `./scripts/quality-fast.sh frontend` (`PASS`, lint warnings only)
  - `./scripts/quality-slow.sh backend` (`FAIL` at `supabase/tests/session-sync-api-contract.sh`: expected `exercise_sets.set_type` column that is absent in current schema cache)
  - `./scripts/worktree-doctor.sh` (`PASS` after `./scripts/worktree-setup.sh` initialized local generated config)
  - `./scripts/quality-slow.sh backend` (`BLOCKED` on 2026-05-03 before contract tests: Docker daemon unavailable at `unix:///var/run/docker.sock`)
  - `./scripts/quality-slow.sh backend` (`BLOCKED` on 2026-05-03 after Docker/Supabase startup and DB reset: auth fixture provisioning requires missing `jq`)
  - `./scripts/quality-slow.sh backend` (`PASS`; auth/authz, sync API contract, and sync events ingest contract suites passed)
- What remains: Nothing for this task; move to `docs/tasks/complete/` and update M13 references.
- Manual verification summary (required when CI is absent/partial): Backend runtime verification completed locally through `./scripts/quality-slow.sh backend`; the previous `exercise_sets.set_type` schema-cache failure is resolved by the current migrations.
