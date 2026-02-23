# Task Card

## Task metadata

- Task ID: `T-20260220-07`
- Title: M5 backend stack decision and architecture update
- Status: `completed`
- Owner: `AI + human reviewer`
- Session date: `2026-02-20`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth`
- MVP deliverables: `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend`
- Milestone spec: `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
- Architecture (if relevant): `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`

## Objective

Select the MVP backend stack using explicit criteria for development velocity, free-tier fit, strict spend control, and paid-scale upgrade path, then codify the decision in architecture docs.

## Scope

### In scope

- Lock and use these evaluation criteria:
  - cloud provider availability with a generous free tier
  - spending cap support or ability to stay on free tier without requiring uncapped credit-card spend
  - local fast test capability with high accuracy/coverage to minimize post-deployment testing
  - ability to run a local server runtime (preferred, not mandatory)
  - portability/ease of switching cloud providers
  - lean runtime footprint and efficient deployed resource usage
  - fast development loop (quick startup and quick testing)
- Review candidate stacks and capture key tradeoffs against the locked criteria.
- Required candidate stacks include `Supabase` and `Cloudflare Workers`.
- Include a recommendation with:
  - primary choice
  - fallback option
  - tradeoff summary
- Record how the selected option can operate with zero spend initially or strict predefined spend limits.
- Update `docs/specs/03-technical-architecture.md` with selected platform and rationale.
- Capture assumptions that future backend implementation tasks depend on.

### Out of scope

- Backend runtime scaffolding and code implementation.
- Deployment scripts.
- Auth/authz implementation.
- API endpoint implementation.

## Acceptance criteria

1. A decision record exists in milestone/task docs with considered options, selected stack, rationale, and key tradeoffs.
2. Decision record explicitly evaluates `Supabase` and `Cloudflare Workers`.
3. Final recommendation includes primary + fallback and reasons for both.
4. Decision record explicitly captures spending controls (zero-spend operation or predefined capped spend path).
5. Decision record explicitly captures portability implications and expected effort to switch providers later.
6. Decision record explicitly captures local-test fidelity expectations and how post-deployment test needs are minimized.
7. `docs/specs/03-technical-architecture.md` is updated to reflect selected stack and status.
8. Implementation assumptions are explicit enough for follow-up tasks to proceed without re-opening stack choice.

## Decision record (2026-02-23)

### Evaluation posture and locked criteria

- Evaluation posture: unbiased re-evaluation (`Supabase`, `Cloudflare Workers`, and any qualifying alternative), with no incumbent preference.
- Session clarifications applied:
  - `local backend runtime` is treated as a `required` criterion for this milestone (upgraded from preferred).
  - `zero spend` is preferred; card-on-file is acceptable only when hard limits/alerts/manual controls prevent surprise spend.
  - portability priority is `SQL/data portability` first.
- Candidate set scored for this task:
  - `Supabase (Postgres + Auth + RLS)`
  - `Cloudflare Workers (+ D1, with separate auth/authz implementation responsibility)`
- Provider facts were verified against official docs/pricing on `2026-02-23` (free-tier, spend controls, and local development capabilities) before locking this recommendation.
- Official references used for fact checks:
  - `Supabase` pricing/billing controls and free-tier docs
  - `Supabase` local development + local Edge Functions docs
  - `Cloudflare Workers` pricing/limits docs
  - `Cloudflare D1` local development docs
  - `Cloudflare Wrangler` local development docs

### Criteria-by-candidate comparison

| Criterion (locked) | `Supabase` | `Cloudflare Workers` | Key tradeoff notes |
| --- | --- | --- | --- |
| Generous free tier / zero-spend start | `Strong` | `Strong` | Both support zero-spend starting paths; Cloudflare free limits are stricter but hard-capped by plan limits. |
| Strict spend control / capped path | `Medium` | `Strong` | Supabase supports spend controls but `compute` is excluded from Spend Cap, so manual operational guardrails are still required. Cloudflare can remain on free plan longer with hard request/day limits. |
| Local fast test capability + high fidelity | `Strong` | `Medium` | Supabase local stack (Postgres/Auth/Storage/etc.) plus local functions workflow gives high fidelity for auth/data policy testing. Cloudflare local Worker/D1 tooling is strong for runtime code, but app auth + data ownership model fidelity is more custom and requires more integration validation. |
| Local server runtime (required) | `Meets` | `Meets` | Both can run locally. Supabase is heavier (Docker stack + optional local functions); Cloudflare has a lighter `wrangler dev` loop. |
| Portability / provider switch ease (SQL/data first) | `Strong` | `Weak-Medium` | Supabase is Postgres-first, so schema/data portability is materially better. D1 uses SQLite semantics and usually needs more migration work when moving to Postgres. |
| Lean runtime footprint / deployed efficiency | `Medium` | `Strong` | Cloudflare edge runtime is leaner by default. Supabase is managed and efficient enough for MVP but heavier than Worker-only compute. |
| Fast development loop | `Strong` | `Medium-Strong` | Supabase wins for M5 because built-in auth + Postgres + RLS reduce custom surface area. Cloudflare wins on runtime startup speed but loses time in auth/authz/data-policy implementation. |
| M5 fit (authz + sync API baseline) | `Strong` | `Medium` | M5 requires secure auth/authz and ownership enforcement quickly; Supabase aligns directly with this scope. |

### Recommendation

- Primary choice: `Supabase (hosted)`, using a local Supabase stack for development/test fidelity and keeping backend implementation SQL-first.
- Fallback option: `Cloudflare Workers + D1` (with a separate auth provider/authz design task) if Supabase is blocked by a disqualifying issue during M5 execution (for example, unacceptable local runtime friction in this environment or free-tier limitations that break MVP baseline testing).
- Tradeoff summary:
  - `Supabase` is slower/heavier at runtime startup than Workers, but it removes the largest M5 risks: auth bootstrapping, authorization enforcement model, and SQL portability uncertainty.
  - `Cloudflare Workers` is excellent for lean edge compute and zero-spend starts, but it pushes more security and data-ownership responsibility into application design during the same milestone, which increases delivery risk.

### Spend-control policy (selected stack + fallback-safe)

- Default operating mode for M5/MVP bootstrap: `zero spend` on provider free tier.
- No plan upgrade or paid add-on enablement without explicit human approval in the task that introduces it.
- If/when paid usage is enabled:
  - define a written monthly budget threshold before enabling billing,
  - keep a single production backend environment only (no always-on paid preview replicas unless justified),
  - enable provider spend alerts/caps where available,
  - add a weekly usage review checkpoint during M5/M6 execution,
  - define downgrade/feature-throttle actions before rollout.
- `Supabase` caveat (important): Spend Cap does not cover `compute`, so strict spend control also depends on manual guardrails and explicit upgrade triggers.
- `Cloudflare` fallback note: staying on the free plan provides a hard zero-spend cap, but request/storage limits can become delivery constraints and must be measured before scale-up.

### Portability implications and expected switch effort

- `Supabase -> another Postgres provider`: `Medium` effort.
  - Expected portable assets: relational schema, most SQL queries, migration intent, data model.
  - Expected rewrite work: auth integration, RLS policy translation (if target differs), platform-specific functions/storage integrations, deployment automation.
- `Cloudflare Workers + D1 -> Postgres-centered stack`: `Medium-High` effort.
  - Extra migration work expected for SQL dialect differences, data-access layer changes, and authorization enforcement model if originally implemented in app code.
- Portability strategy locked for follow-up tasks:
  - keep sync API contracts provider-neutral,
  - avoid provider-specific data types unless clearly justified,
  - document ownership rules separately from implementation mechanism.

### Local-test fidelity expectations (to minimize post-deployment testing)

- For `Supabase` primary:
  - local stack is the default for backend auth/data policy and schema testing,
  - use local tests to validate ownership rules and negative authz cases before any hosted deployment,
  - keep post-deploy testing focused on environment-specific smoke checks (secrets, network ingress, hosted auth email/provider behavior, migrations against hosted instance).
- For `Cloudflare` fallback:
  - local Worker/D1 tests can validate handler logic and DB behavior early,
  - additional post-deploy validation is still expected for production bindings, auth integrations, and environment/config correctness because more primitives are assembled manually.

### Implementation assumptions for follow-up M5 tasks (locked enough to proceed)

- Provider choice is locked for M5 execution: `Supabase` is primary; `Cloudflare Workers + D1` is documented contingency only.
- M5 follow-up tasks do not need to reopen provider selection unless a documented trigger condition blocks execution.
- Backend design remains `SQL-first` and schema portability-conscious (Postgres-compatible naming/constraints by default).
- Ownership enforcement should be implemented at the strongest backend boundary available (database policies and/or server-side checks), not FE-only checks.
- The M5 local runbook must provide a single documented entry path for local backend bring-up, even if it orchestrates multiple processes/services under the hood.
- A paid upgrade path must include explicit trigger thresholds and spend controls before billing is enabled.

## Testing and verification approach

- Planned checks/commands:
  - editorial consistency pass across touched spec files
  - link/reference sanity check for all added/updated docs
- Notes:
  - This is a docs-only decision task; no runtime code/test gate is required.

## Implementation notes

- Planned files/areas allowed to change:
  - `docs/specs/03-technical-architecture.md`
  - `docs/specs/milestones/M5-backend-foundation-authz-and-sync-api.md`
  - `docs/tasks/T-20260220-07-m5-backend-stack-decision-and-architecture-update.md`
- Constraints/assumptions:
  - Do not lock implementation details not needed for milestone-level decisions.
  - Keep selection criteria concrete and auditable.

## Mandatory verify gates

- `N/A (docs-only task; no code runtime changes)`

## Evidence

- Decision record summary.
- Criteria-by-candidate comparison summary.
- Architecture diff summary.
- Explicit final recommendation statement.

## Completion note

- What changed: Added an explicit backend stack decision record (criteria, `Supabase` vs `Cloudflare Workers` comparison, primary/fallback recommendation, spend controls, portability analysis, local-test fidelity expectations, and M5 assumptions), and updated architecture/milestone docs accordingly.
- What tests ran: `editorial consistency pass` (manual review across touched spec files), `link/reference sanity check` (local file references and cross-doc references reviewed after edits).
- What remains: Execute downstream M5 implementation tasks (`T-20260220-08` through `T-20260220-11`) using the locked `Supabase`-primary decision and documented contingency triggers.
