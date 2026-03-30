#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPABASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${SUPABASE_DIR}/.." && pwd)"

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

# --- Config loading: symlink or fallback to ~/.config/boga/ ---
if [[ -f "${SUPABASE_DIR}/.env.local" ]]; then
  # Script-only overrides (CLI version, optional local toggles).
  # shellcheck disable=SC1091
  source "${SUPABASE_DIR}/.env.local"
elif [[ -f "${HOME}/.config/boga/supabase/cli.env" ]]; then
  # shellcheck disable=SC1091
  source "${HOME}/.config/boga/supabase/cli.env"
fi

SUPABASE_CLI_VERSION="${SUPABASE_CLI_VERSION:-2.76.15}"
FUNCTIONS_PID_FILE="${SUPABASE_DIR}/.temp/health-functions-serve.pid"
FUNCTIONS_LOG_FILE="${SUPABASE_DIR}/.temp/health-functions-serve.log"
FUNCTION_ENV_FILE="${SUPABASE_DIR}/functions/.env.local"

ensure_tmp_dir() {
  mkdir -p "${SUPABASE_DIR}/.temp"
}

run_supabase() {
  (
    cd "${REPO_ROOT}"
    npx -y "supabase@${SUPABASE_CLI_VERSION}" "$@"
  )
}

load_supabase_status_env() {
  local line key value
  local output
  output="$(run_supabase status -o env)"

  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue
    [[ "${line}" == *=* ]] || continue
    key="${line%%=*}"
    value="${line#*=}"
    [[ "${key}" =~ ^[A-Z0-9_]+$ ]] || continue
    if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
      value="${value#\"}"
      value="${value%\"}"
    fi
    export "${key}=${value}"
  done <<< "${output}"
}

health_url() {
  if [[ -z "${API_URL:-}" ]]; then
    load_supabase_status_env
  fi
  printf '%s/functions/v1/health' "${API_URL}"
}

curl_health() {
  local url
  url="$(health_url)"

  curl --silent --show-error --fail \
    -H "apikey: ${ANON_KEY}" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    "$@" \
    "${url}"
}

functions_pid_is_running() {
  [[ -f "${FUNCTIONS_PID_FILE}" ]] || return 1

  local pid
  pid="$(cat "${FUNCTIONS_PID_FILE}")"
  [[ -n "${pid}" ]] || return 1
  kill -0 "${pid}" 2>/dev/null
}

stop_functions_serve_if_running() {
  if functions_pid_is_running; then
    local pid
    pid="$(cat "${FUNCTIONS_PID_FILE}")"
    kill "${pid}" 2>/dev/null || true
    wait "${pid}" 2>/dev/null || true
  fi
  rm -f "${FUNCTIONS_PID_FILE}"
}
