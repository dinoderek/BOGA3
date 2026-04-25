#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/worktree-lib.sh"

CURRENT_SLOT=""
SUPABASE=1
DRY_RUN=0
GRACE_SECONDS="${BOGA_WORKTREE_SWEEP_GRACE_SECONDS:-600}"

usage() {
  cat <<'EOF'
Usage: ./scripts/worktree-sweep.sh [options]

Opportunistically cleans Supabase infrastructure for completed/orphaned BOGA
worktree slots recorded in ~/.config/boga/worktrees/slots.

Options:
  --current-slot <n>  Slot that must never be cleaned (default: current worktree slot).
  --no-supabase      Only report/prune logic; do not clean Supabase infra.
  --dry-run          Print actions without removing containers/volumes/registry files.
  --grace-seconds n  Minimum registry age before cleanup (default: 600).
  -h, --help         Show this help text.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --current-slot)
      CURRENT_SLOT="${2:-}"
      [[ -n "$CURRENT_SLOT" ]] || { echo "[worktree-sweep] --current-slot requires a value" >&2; exit 2; }
      shift 2
      ;;
    --no-supabase)
      SUPABASE=0
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --grace-seconds)
      GRACE_SECONDS="${2:-}"
      [[ -n "$GRACE_SECONDS" ]] || { echo "[worktree-sweep] --grace-seconds requires a value" >&2; exit 2; }
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[worktree-sweep] unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$CURRENT_SLOT" ]]; then
  CURRENT_SLOT="$(boga_worktree_slot_or_default "$REPO_ROOT")"
fi
boga_validate_slot_value "$CURRENT_SLOT" >/dev/null

if ! boga_is_integer "$GRACE_SECONDS"; then
  echo "[worktree-sweep] invalid grace seconds: $GRACE_SECONDS" >&2
  exit 2
fi

CONFIG_ROOT="$(boga_config_root)"
REGISTRY_DIR="$CONFIG_ROOT/worktrees/slots"
CURRENT_COMMON_GIT_DIR="$(boga_common_git_dir "$REPO_ROOT")"

mkdir -p "$REGISTRY_DIR"

active_path_is_current_worktree_group() {
  local candidate="$1"
  local line worktree_path

  while IFS= read -r line; do
    case "$line" in
      worktree\ *)
        worktree_path="${line#worktree }"
        [[ -d "$worktree_path" ]] || continue
        if [[ "$(boga_abs_dir "$worktree_path")" == "$candidate" ]]; then
          return 0
        fi
        ;;
    esac
  done < <(git -C "$REPO_ROOT" worktree list --porcelain)

  return 1
}

registry_age_is_ready() {
  local registry_file="$1"
  local now mtime

  mtime="$(boga_file_mtime_epoch "$registry_file" 2>/dev/null || true)"
  [[ -n "$mtime" ]] || return 1
  now="$(date +%s)"

  (( now - mtime >= 10#$GRACE_SECONDS ))
}

completion_reason() {
  local registry_file="$1"
  local registered_path registered_abs registry_common

  registered_path="$(boga_registry_path_from_file "$registry_file" 2>/dev/null || true)"
  if [[ -z "$registered_path" ]]; then
    printf 'missing-registry-path\n'
    return 0
  fi

  if [[ ! -d "$registered_path" ]]; then
    printf 'registered-path-missing\n'
    return 0
  fi

  registered_abs="$(boga_abs_dir "$registered_path")"

  if ! boga_is_repo_root "$registered_abs"; then
    printf 'registered-path-not-boga-root\n'
    return 0
  fi

  registry_common="$(boga_registry_common_git_dir_from_file "$registry_file" 2>/dev/null || true)"
  if [[ -n "$registry_common" \
    && -d "$registry_common" \
    && "$(boga_abs_dir "$registry_common")" == "$CURRENT_COMMON_GIT_DIR" ]]; then
    if ! active_path_is_current_worktree_group "$registered_abs"; then
      printf 'not-in-current-git-worktree-list\n'
      return 0
    fi
  fi

  return 1
}

clean_slot() {
  local slot="$1"
  local reason="$2"
  local args

  echo "[worktree-sweep] completed slot $slot detected ($reason)"

  args=(--slot "$slot" --remove-registry)
  if [[ "$SUPABASE" == "1" ]]; then
    args+=(--supabase)
  else
    echo "[worktree-sweep] --no-supabase set; registry cleanup only for slot $slot"
  fi
  if [[ "$DRY_RUN" == "1" ]]; then
    args+=(--dry-run)
  fi

  "$SCRIPT_DIR/worktree-clean.sh" "${args[@]}"
}

echo "[worktree-sweep] scanning completed worktree slots (current slot: $CURRENT_SLOT)"

shopt -s nullglob
for registry_file in "$REGISTRY_DIR"/*; do
  slot="$(basename "$registry_file")"
  if ! boga_validate_slot_value "$slot" >/dev/null 2>&1; then
    echo "[worktree-sweep] removing invalid registry file: $registry_file" >&2
    if [[ "$DRY_RUN" == "1" ]]; then
      echo "[worktree-sweep] dry-run: rm -f $registry_file"
    else
      rm -f "$registry_file"
    fi
    continue
  fi

  if [[ "$slot" == "$CURRENT_SLOT" ]]; then
    echo "[worktree-sweep] keeping current slot $slot"
    continue
  fi

  if ! registry_age_is_ready "$registry_file"; then
    echo "[worktree-sweep] keeping slot $slot: registry younger than ${GRACE_SECONDS}s grace period"
    continue
  fi

  if reason="$(completion_reason "$registry_file")"; then
    clean_slot "$slot" "$reason"
  else
    echo "[worktree-sweep] keeping slot $slot: registered worktree still looks active"
  fi
done

echo "[worktree-sweep] done"
