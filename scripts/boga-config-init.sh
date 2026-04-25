#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/worktree-lib.sh"

CONFIG_ROOT="$(boga_config_root)"
SUPABASE_CONFIG_DIR="$CONFIG_ROOT/supabase"
EDGE_CONFIG_DIR="$CONFIG_ROOT/edge-functions"

copy_if_missing() {
  local source_file="$1"
  local target_file="$2"
  local created_label="$3"

  if [[ -f "$target_file" ]]; then
    return 0
  fi

  if [[ ! -f "$source_file" ]]; then
    echo "[boga-config-init] missing example file: $source_file" >&2
    exit 1
  fi

  cp "$source_file" "$target_file"
  echo "[boga-config-init] created $created_label: $target_file"
}

mkdir -p "$SUPABASE_CONFIG_DIR" "$EDGE_CONFIG_DIR"

copy_if_missing \
  "$REPO_ROOT/supabase/.env.hosted.example" \
  "$SUPABASE_CONFIG_DIR/env.hosted" \
  "hosted Supabase env"

copy_if_missing \
  "$REPO_ROOT/supabase/.env.local.example" \
  "$SUPABASE_CONFIG_DIR/cli.env" \
  "Supabase CLI env"

copy_if_missing \
  "$REPO_ROOT/supabase/functions/.env.local.example" \
  "$EDGE_CONFIG_DIR/env.shared" \
  "shared Edge Function env"

echo "[boga-config-init] machine config root: $CONFIG_ROOT"
echo "[boga-config-init] fill hosted credentials in $SUPABASE_CONFIG_DIR/env.hosted when needed"
