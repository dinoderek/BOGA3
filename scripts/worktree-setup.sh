#!/usr/bin/env bash
# Per-worktree setup: assign slot, generate config, create symlinks, install hook.
# Idempotent -- safe to re-run.
#
# Usage:
#   ./scripts/worktree-setup.sh                  # Full setup
#   ./scripts/worktree-setup.sh --generate-config-only  # Only regenerate config.toml from template

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

BOGA_CONFIG_DIR="${HOME}/.config/boga"
SUPABASE_DIR="${REPO_ROOT}/supabase"
TEMPLATE_FILE="${SUPABASE_DIR}/config.toml.template"
CONFIG_FILE="${SUPABASE_DIR}/config.toml"
SLOT_FILE="${REPO_ROOT}/.worktree-slot"
GENERATE_CONFIG_ONLY=0

if [[ "${1:-}" == "--generate-config-only" ]]; then
  GENERATE_CONFIG_ONLY=1
fi

# --- Ensure template exists ---
if [[ ! -f "${TEMPLATE_FILE}" ]]; then
  echo "[worktree-setup] ERROR: ${TEMPLATE_FILE} not found. Cannot proceed." >&2
  exit 1
fi

# --- Step 1: Ensure machine-global config exists ---
if [[ "${GENERATE_CONFIG_ONLY}" -eq 0 ]]; then
  if [[ ! -d "${BOGA_CONFIG_DIR}" ]]; then
    echo "[worktree-setup] ~/.config/boga/ not found; running boga-config-init.sh..."
    "${SCRIPT_DIR}/boga-config-init.sh"
  fi
fi

# --- Step 2: Assign worktree slot ---
read_slot() {
  if [[ -f "${SLOT_FILE}" ]]; then
    cat "${SLOT_FILE}"
  else
    echo "0"
  fi
}

assign_slot() {
  # If slot file already exists, keep it
  if [[ -f "${SLOT_FILE}" ]]; then
    echo "[worktree-setup] Existing slot file found: slot $(cat "${SLOT_FILE}")"
    return
  fi

  # Scan worktrees for used slots
  local used_slots=()
  local worktree_dir
  while IFS= read -r line; do
    if [[ "${line}" == "worktree "* ]]; then
      worktree_dir="${line#worktree }"
      if [[ -f "${worktree_dir}/.worktree-slot" ]]; then
        used_slots+=("$(cat "${worktree_dir}/.worktree-slot")")
      fi
    fi
  done < <(git worktree list --porcelain 2>/dev/null || true)

  # Check if this is the main worktree (prefer slot 0)
  local main_worktree
  main_worktree="$(git worktree list --porcelain 2>/dev/null | head -1 | sed 's/^worktree //' || true)"
  if [[ "${REPO_ROOT}" == "${main_worktree}" ]]; then
    echo "0" > "${SLOT_FILE}"
    echo "[worktree-setup] Assigned slot 0 (main worktree)"
    return
  fi

  # Find lowest unused slot (starting from 1 for non-main worktrees)
  local slot=1
  while true; do
    local found=0
    for used in "${used_slots[@]+"${used_slots[@]}"}"; do
      if [[ "${used}" == "${slot}" ]]; then
        found=1
        break
      fi
    done
    if [[ "${found}" -eq 0 ]]; then
      break
    fi
    slot=$((slot + 1))
  done

  echo "${slot}" > "${SLOT_FILE}"
  echo "[worktree-setup] Assigned slot ${slot}"
}

if [[ "${GENERATE_CONFIG_ONLY}" -eq 0 ]]; then
  assign_slot
fi

SLOT="$(read_slot)"

# --- Step 3: Derive port values from slot ---
API_PORT=$((55431 + SLOT * 100))
DB_PORT=$((55422 + SLOT * 100))
SHADOW_PORT=$((55420 + SLOT * 100))
STUDIO_PORT=$((55423 + SLOT * 100))
INBUCKET_PORT=$((55424 + SLOT * 100))
ANALYTICS_PORT=$((55427 + SLOT * 100))
POOLER_PORT=$((55429 + SLOT * 100))
INSPECTOR_PORT=$((8183 + SLOT * 10))
EXPO_DEV_PORT=$((8081 + SLOT))

if [[ "${SLOT}" -eq 0 ]]; then
  PROJECT_ID="scaffolding"
else
  PROJECT_ID="scaffolding-wt${SLOT}"
fi

# --- Step 4: Generate config.toml from template ---
generate_config() {
  local content
  content="$(cat "${TEMPLATE_FILE}")"

  content="${content//\{\{PROJECT_ID\}\}/${PROJECT_ID}}"
  content="${content//\{\{API_PORT\}\}/${API_PORT}}"
  content="${content//\{\{DB_PORT\}\}/${DB_PORT}}"
  content="${content//\{\{SHADOW_PORT\}\}/${SHADOW_PORT}}"
  content="${content//\{\{STUDIO_PORT\}\}/${STUDIO_PORT}}"
  content="${content//\{\{INBUCKET_PORT\}\}/${INBUCKET_PORT}}"
  content="${content//\{\{ANALYTICS_PORT\}\}/${ANALYTICS_PORT}}"
  content="${content//\{\{POOLER_PORT\}\}/${POOLER_PORT}}"
  content="${content//\{\{INSPECTOR_PORT\}\}/${INSPECTOR_PORT}}"

  printf '%s\n' "${content}" > "${CONFIG_FILE}"
  echo "[worktree-setup] Generated ${CONFIG_FILE} (slot ${SLOT}, project_id=${PROJECT_ID})"
}

generate_config

if [[ "${GENERATE_CONFIG_ONLY}" -eq 1 ]]; then
  exit 0
fi

# --- Step 5: Create symlinks for shared config ---
create_symlink() {
  local target="$1"
  local link="$2"

  if [[ -L "${link}" ]]; then
    # Already a symlink -- update if target differs
    local current_target
    current_target="$(readlink "${link}")"
    if [[ "${current_target}" == "${target}" ]]; then
      echo "[worktree-setup] Symlink already correct: ${link}"
      return
    fi
  fi

  if [[ ! -f "${target}" ]]; then
    echo "[worktree-setup] WARNING: Symlink target missing: ${target}" >&2
    echo "[worktree-setup]   Creating target from example files via boga-config-init.sh..." >&2
    "${SCRIPT_DIR}/boga-config-init.sh"
  fi

  ln -sf "${target}" "${link}"
  echo "[worktree-setup] Symlinked ${link} -> ${target}"
}

create_symlink "${BOGA_CONFIG_DIR}/supabase/env.hosted" "${SUPABASE_DIR}/.env.hosted"
create_symlink "${BOGA_CONFIG_DIR}/supabase/cli.env" "${SUPABASE_DIR}/.env.local"
create_symlink "${BOGA_CONFIG_DIR}/edge-functions/env.shared" "${SUPABASE_DIR}/functions/.env.local"

# --- Step 6: Maestro per-worktree config ---
MAESTRO_DIR="${REPO_ROOT}/apps/mobile/.maestro"
MAESTRO_LOCAL="${MAESTRO_DIR}/maestro.env.local"
MAESTRO_SAMPLE="${MAESTRO_DIR}/maestro.env.sample"

if [[ ! -f "${MAESTRO_LOCAL}" ]] && [[ -f "${MAESTRO_SAMPLE}" ]]; then
  cp "${MAESTRO_SAMPLE}" "${MAESTRO_LOCAL}"
  # Set EXPO_DEV_SERVER_PORT based on slot
  if command -v sed >/dev/null 2>&1; then
    sed -i "s|EXPO_DEV_SERVER_PORT=\${EXPO_DEV_SERVER_PORT:-}|EXPO_DEV_SERVER_PORT=\${EXPO_DEV_SERVER_PORT:-${EXPO_DEV_PORT}}|" "${MAESTRO_LOCAL}" 2>/dev/null || true
  fi
  echo "[worktree-setup] Created ${MAESTRO_LOCAL} with EXPO_DEV_SERVER_PORT=${EXPO_DEV_PORT}"
fi

# --- Step 7: Install post-checkout hook ---
install_hook() {
  local hook_source="${REPO_ROOT}/hooks/post-checkout"
  local git_common_dir

  if [[ ! -f "${hook_source}" ]]; then
    echo "[worktree-setup] WARNING: hooks/post-checkout not found; skipping hook install." >&2
    return
  fi

  # git rev-parse --git-common-dir gives the shared .git dir for worktrees
  git_common_dir="$(git rev-parse --git-common-dir 2>/dev/null || echo "${REPO_ROOT}/.git")"
  local hooks_dir="${git_common_dir}/hooks"
  mkdir -p "${hooks_dir}"

  # Compute relative path from hooks_dir to hook_source
  local rel_path
  rel_path="$(python3 -c "import os.path; print(os.path.relpath('${hook_source}', '${hooks_dir}'))" 2>/dev/null || echo "${hook_source}")"

  ln -sf "${rel_path}" "${hooks_dir}/post-checkout"
  echo "[worktree-setup] Installed post-checkout hook: ${hooks_dir}/post-checkout -> ${rel_path}"
}

install_hook

# --- Step 8: Print summary ---
echo ""
echo "=== Worktree setup complete ==="
echo "  Slot:           ${SLOT}"
echo "  Project ID:     ${PROJECT_ID}"
echo "  API port:       ${API_PORT}"
echo "  DB port:        ${DB_PORT}"
echo "  Shadow port:    ${SHADOW_PORT}"
echo "  Studio port:    ${STUDIO_PORT}"
echo "  Inbucket port:  ${INBUCKET_PORT}"
echo "  Analytics port: ${ANALYTICS_PORT}"
echo "  Pooler port:    ${POOLER_PORT}"
echo "  Inspector port: ${INSPECTOR_PORT}"
echo "  Expo dev port:  ${EXPO_DEV_PORT}"
echo "  Config:         ${BOGA_CONFIG_DIR}"
echo "==============================="
