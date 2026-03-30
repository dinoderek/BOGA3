# Worktree Support, Shared Config, and Serving Isolation

## Purpose

Define the design for migrating from multiple full repository clones to `git worktree`, with centralized machine-level configuration and per-worktree isolated serving infrastructure.

## Problem statement

The project currently relies on multiple full clones of the repository for parallel development. This has three drawbacks:

1. **Disk waste**: each clone duplicates the entire `.git` history and `node_modules`.
2. **Config drift**: credentials, CLI versions, and environment files are managed independently per clone with no sharing mechanism.
3. **Port conflicts**: the Supabase local stack uses hardcoded ports in `config.toml`. Running two clones simultaneously causes Docker port collisions.

`git worktree` solves (1) by sharing a single `.git` directory across multiple working directories. This design addresses (2) and (3).

## Architecture: three-tier configuration model

| Tier | Location | Lifecycle | Contents |
|------|----------|-----------|----------|
| **1 -- Machine-global** | `~/.config/boga/` | Created once per machine | Hosted credentials, CLI version, edge-function identity env |
| **2 -- Per-worktree** | Gitignored files inside each worktree | Generated on worktree creation | `supabase/config.toml` (ports, project_id), `apps/mobile/.env.local` (auto-synced), `apps/mobile/.maestro/maestro.env.local` |
| **3 -- Checked-in** | Tracked in git | Committed | `supabase/config.toml.template`, example files, hook scripts |

### Shared config directory (`~/.config/boga/`)

```
~/.config/boga/
  supabase/
    env.hosted          # SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN, etc.
    cli.env             # SUPABASE_CLI_VERSION override
  edge-functions/
    env.shared          # APP_ENV=local, APP_NAME=scaffolding-backend
```

Current gitignored files are migrated as follows:

| Current file | New location | Rationale |
|---|---|---|
| `supabase/.env.hosted` | Symlink -> `~/.config/boga/supabase/env.hosted` | Hosted credentials are machine-scoped, not worktree-scoped |
| `supabase/.env.local` | Symlink -> `~/.config/boga/supabase/cli.env` | Same CLI version across all worktrees |
| `supabase/functions/.env.local` | Symlink -> `~/.config/boga/edge-functions/env.shared` | APP_ENV/APP_NAME are identity, not instance-specific |
| `apps/mobile/.env.local` | Stays per-worktree (auto-generated) | Contains port-dependent URLs from the running stack |
| `apps/mobile/.maestro/maestro.env.local` | Stays per-worktree | Already designed for per-worktree uniqueness |

## Per-worktree identity: slot system

Each worktree receives a stable numeric slot (0, 1, 2, ...) stored in `<worktree-root>/.worktree-slot` (gitignored). The slot drives port allocation and the Supabase Docker project namespace.

### Port derivation formula

```
API_PORT       = 55431 + (slot * 100)
DB_PORT        = 55422 + (slot * 100)
SHADOW_PORT    = 55420 + (slot * 100)
STUDIO_PORT    = 55423 + (slot * 100)
INBUCKET_PORT  = 55424 + (slot * 100)
ANALYTICS_PORT = 55427 + (slot * 100)
POOLER_PORT    = 55429 + (slot * 100)
INSPECTOR_PORT = 8183  + (slot * 10)
EXPO_DEV_PORT  = 8081  + slot
```

Slot 0 produces the exact current hardcoded ports -- zero behavioral change for single-worktree users. Slot 1 gives 55531, 55522, etc. This supports up to ~4 parallel worktrees before running into port-range conflicts with typical local services.

### Project ID

- Slot 0: `scaffolding` (backwards compatible)
- Slot N (N > 0): `scaffolding-wt{N}`

Each project_id gets its own set of Docker containers via the Supabase CLI, providing full data isolation.

## `config.toml` strategy

The Supabase CLI's `env()` substitution only works for string-typed secret fields, not integer port fields or `project_id`. Therefore:

1. **Rename** the checked-in `supabase/config.toml` to `supabase/config.toml.template`.
2. **Gitignore** `supabase/config.toml` (the generated file).
3. The setup script reads the template, substitutes `{{PLACEHOLDER}}` values based on the worktree slot, and writes the real `config.toml`.

Placeholders in the template:

| Placeholder | Example value (slot 0) |
|---|---|
| `{{PROJECT_ID}}` | `scaffolding` |
| `{{API_PORT}}` | `55431` |
| `{{DB_PORT}}` | `55422` |
| `{{SHADOW_PORT}}` | `55420` |
| `{{STUDIO_PORT}}` | `55423` |
| `{{INBUCKET_PORT}}` | `55424` |
| `{{ANALYTICS_PORT}}` | `55427` |
| `{{POOLER_PORT}}` | `55429` |
| `{{INSPECTOR_PORT}}` | `8183` |

## Automatic setup via `post-checkout` hook

Git's `post-checkout` hook fires on `git worktree add` (unless `--no-checkout` is used). When a new worktree is created, the hook's first parameter is the null ref (`0000000000000000000000000000000000000000`), distinguishing new worktree creation from a regular branch checkout.

Since all worktrees share `.git/hooks/`, a single hook covers every worktree automatically. This works for:

- **Humans** running `git worktree add`
- **Claude Code** using `isolation: worktree` or `--worktree`
- **Codex and other AI agents** that create worktrees via standard git
- Any CI/CD that uses worktrees

### Hook: `hooks/post-checkout`

Checked into the repo (not directly in `.git/hooks/`). Installed as a symlink by `scripts/worktree-setup.sh`.

```bash
#!/usr/bin/env bash
PREV_HEAD="$1"
NULL_REF="0000000000000000000000000000000000000000"

# Only run on new worktree creation (null previous HEAD)
[[ "${PREV_HEAD}" == "${NULL_REF}" ]] || exit 0

REPO_ROOT="$(git rev-parse --show-toplevel)"
if [[ -x "${REPO_ROOT}/scripts/worktree-setup.sh" ]]; then
  echo "[post-checkout] New worktree detected. Running worktree-setup.sh..."
  "${REPO_ROOT}/scripts/worktree-setup.sh"
fi
```

### Safety net: `_common.sh` guard

Every Supabase script sources `supabase/scripts/_common.sh`. This file gains a guard:

```bash
if [[ ! -f "${SUPABASE_DIR}/config.toml" ]]; then
  echo "supabase/config.toml not found. Run ./scripts/worktree-setup.sh to initialize this worktree." >&2
  exit 1
fi
```

It also auto-regenerates `config.toml` from the template when the template is newer (handles the case where someone pulls a template change without re-running setup).

### Claude Code `WorktreeCreate` hook (optional complement)

For Claude Code's `--worktree` mode, a `WorktreeCreate` hook can be configured in `.claude/settings.json` or user settings. This fires during Claude's own worktree lifecycle. It is optional because the `post-checkout` hook already covers this case. Document it in the runbook for users who want explicit control.

## Failure handling

| Failure mode | Behavior |
|---|---|
| `~/.config/boga/` doesn't exist | `worktree-setup.sh` runs `boga-config-init.sh` automatically |
| Symlink target missing | `worktree-setup.sh` warns and creates the target from example files |
| Template file missing | `worktree-setup.sh` fails fast with clear error |
| `config.toml` missing at runtime | `_common.sh` guard fails fast: "Run ./scripts/worktree-setup.sh" |
| Template newer than config.toml | `_common.sh` auto-regenerates config.toml |
| Slot file missing (old clone) | Defaults to slot 0 (backwards compatible) |
| Port collision (too many worktrees) | User sees Docker bind error; documented limit of ~4 parallel stacks |

## Implementation plan

### New files

| File | Purpose |
|------|---------|
| `/.gitignore` | Ignore `.worktree-slot` at repo root |
| `hooks/post-checkout` | Auto-run `worktree-setup.sh` on `git worktree add` |
| `scripts/boga-config-init.sh` | One-time machine setup: create `~/.config/boga/` from example files |
| `scripts/worktree-setup.sh` | Per-worktree setup: assign slot, generate config, create symlinks, install hook |

### Modified files

| File | Changes |
|------|---------|
| `supabase/.gitignore` | Add `config.toml` |
| `supabase/config.toml` | Rename to `supabase/config.toml.template`, replace hardcoded values with `{{PLACEHOLDER}}` tokens |
| `supabase/scripts/_common.sh` | Add config.toml guard, slot detection, auto-regeneration from template |
| `apps/mobile/scripts/maestro-env.sh` | Add guard validating `EXPO_DEV_SERVER_PORT` is set |
| `supabase/.env.local.example` | Add comment noting `scripts/boga-config-init.sh` |
| `supabase/.env.hosted.example` | Add comment noting `scripts/boga-config-init.sh` |
| `supabase/functions/.env.local.example` | Add comment noting `scripts/boga-config-init.sh` |
| `RUNBOOK.md` | Add worktree quick-start and detailed workflow section |
| `docs/specs/09-project-structure.md` | Add `hooks/` folder and `.worktree-slot` to structure map |

### Script details: `scripts/worktree-setup.sh`

Idempotent. Safe to re-run. Steps:

1. Run `scripts/boga-config-init.sh` if `~/.config/boga/` is missing.
2. Scan `git worktree list --porcelain` to find used slots. Assign lowest unused slot (prefer 0 for the main worktree).
3. Write `.worktree-slot`.
4. Read `supabase/config.toml.template`, substitute `{{PLACEHOLDER}}` values from slot, write `supabase/config.toml`.
5. Create symlinks: `supabase/.env.hosted`, `supabase/.env.local`, `supabase/functions/.env.local` -> `~/.config/boga/` targets.
6. If `apps/mobile/.maestro/maestro.env.local` does not exist, copy from sample and set `EXPO_DEV_SERVER_PORT`.
7. Install `post-checkout` hook: `ln -sf ../../hooks/post-checkout .git/hooks/post-checkout` (or the appropriate relative path for worktrees).
8. Print summary: slot, port range, symlink targets.

### Script details: `scripts/boga-config-init.sh`

Idempotent. Steps:

1. Create `~/.config/boga/supabase/` and `~/.config/boga/edge-functions/` directories.
2. Copy example files to targets if targets don't exist:
   - `supabase/.env.hosted.example` -> `~/.config/boga/supabase/env.hosted`
   - `supabase/.env.local.example` -> `~/.config/boga/supabase/cli.env`
   - `supabase/functions/.env.local.example` -> `~/.config/boga/edge-functions/env.shared`
3. Print reminder to fill in hosted credentials if `env.hosted` was just created.

### `_common.sh` changes

After `REPO_ROOT` derivation (line 7):

```bash
# --- Worktree slot detection ---
WORKTREE_SLOT_FILE="${REPO_ROOT}/.worktree-slot"
if [[ -f "${WORKTREE_SLOT_FILE}" ]]; then
  WORKTREE_SLOT="$(cat "${WORKTREE_SLOT_FILE}")"
else
  WORKTREE_SLOT=0
fi

# --- config.toml guard and auto-regeneration ---
if [[ ! -f "${SUPABASE_DIR}/config.toml" ]]; then
  if [[ -f "${SUPABASE_DIR}/config.toml.template" ]]; then
    echo "[supabase] config.toml missing; regenerating from template (slot ${WORKTREE_SLOT})" >&2
    "${REPO_ROOT}/scripts/worktree-setup.sh" --generate-config-only
  else
    echo "supabase/config.toml not found and no template available. Run ./scripts/worktree-setup.sh" >&2
    exit 1
  fi
elif [[ "${SUPABASE_DIR}/config.toml.template" -nt "${SUPABASE_DIR}/config.toml" ]]; then
  echo "[supabase] config.toml.template is newer; regenerating config.toml (slot ${WORKTREE_SLOT})" >&2
  "${REPO_ROOT}/scripts/worktree-setup.sh" --generate-config-only
fi
```

Config loading updated to source from symlink or fall back to `~/.config/boga/`:

```bash
if [[ -f "${SUPABASE_DIR}/.env.local" ]]; then
  source "${SUPABASE_DIR}/.env.local"
elif [[ -f "${HOME}/.config/boga/supabase/cli.env" ]]; then
  source "${HOME}/.config/boga/supabase/cli.env"
fi
```

## Per-worktree isolation summary

| Resource | Isolated? | Mechanism |
|----------|-----------|-----------|
| Supabase Docker containers | Yes | Different `project_id` per slot |
| Supabase ports (API, DB, Studio...) | Yes | Slot-based port offset (+100/slot) |
| Edge function server | Yes | Worktree-local `.temp/`, different API port |
| Expo dev server | Yes | `EXPO_DEV_SERVER_PORT` per slot |
| iOS Simulator | Per-config | User sets `IOS_SIM_UDID` in `maestro.env.local` |
| Shared build cache | Shared (safe) | `~/.cache/boga/maestro/ios-dev-client/` fingerprint dedup |
| Database data | Isolated | Each slot's Supabase has its own Postgres volume |
| Hosted credentials | Shared | `~/.config/boga/` symlinks |

## Verification plan

1. **Single worktree (backwards compat)**: Run `./scripts/worktree-setup.sh` in the main checkout. Confirm slot 0, `config.toml` has original ports, `./supabase/scripts/local-runtime-up.sh` works as before.
2. **Second worktree**: `git worktree add ../scaffolding-wt1 some-branch`, confirm `post-checkout` hook fires and `worktree-setup.sh` runs automatically. Verify slot 1, ports offset by 100.
3. **Parallel stacks**: Start Supabase in both worktrees simultaneously. Confirm no port conflicts, each has its own Docker containers.
4. **Shared config**: Modify `~/.config/boga/supabase/cli.env`. Confirm both worktrees pick up the change.
5. **Template update**: Modify `config.toml.template` and run any Supabase script. Confirm `_common.sh` auto-regenerates `config.toml`.
6. **Tests**: Run `./scripts/quality-fast.sh backend` in both worktrees. Each hits its own Supabase stack.
7. **Clean worktree (no slot file)**: Remove `.worktree-slot`. Confirm scripts default to slot 0 (backwards compat).

## References

- [Git `post-checkout` hook documentation](https://git-scm.com/docs/githooks#_post_checkout)
- [Using Git Hooks When Creating Worktrees](https://mskelton.dev/bytes/using-git-hooks-when-creating-worktrees) -- pattern for detecting new worktree via null ref
- [Git Worktrees and Neon Branching](https://neon.com/guides/git-worktrees-neon-branching) -- post-checkout hook for database isolation per worktree
- [Extending Claude Code Worktrees for Database Isolation](https://www.damiangalarza.com/posts/2026-03-10-extending-claude-code-worktrees-for-true-database-isolation/) -- WorktreeCreate hook pattern
