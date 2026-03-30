#!/usr/bin/env bash
# One-time machine setup: create ~/.config/boga/ from example files.
# Idempotent -- safe to re-run.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

BOGA_CONFIG_DIR="${HOME}/.config/boga"
SUPABASE_DIR="${REPO_ROOT}/supabase"

# --- Create directory structure ---
mkdir -p "${BOGA_CONFIG_DIR}/supabase"
mkdir -p "${BOGA_CONFIG_DIR}/edge-functions"

created_hosted=0

# --- Copy example files to targets if targets don't exist ---
if [[ ! -f "${BOGA_CONFIG_DIR}/supabase/env.hosted" ]]; then
  if [[ -f "${SUPABASE_DIR}/.env.hosted.example" ]]; then
    cp "${SUPABASE_DIR}/.env.hosted.example" "${BOGA_CONFIG_DIR}/supabase/env.hosted"
    echo "[boga-config-init] Created ${BOGA_CONFIG_DIR}/supabase/env.hosted from example."
    created_hosted=1
  else
    echo "[boga-config-init] WARNING: ${SUPABASE_DIR}/.env.hosted.example not found; skipping env.hosted." >&2
  fi
else
  echo "[boga-config-init] ${BOGA_CONFIG_DIR}/supabase/env.hosted already exists; skipping."
fi

if [[ ! -f "${BOGA_CONFIG_DIR}/supabase/cli.env" ]]; then
  if [[ -f "${SUPABASE_DIR}/.env.local.example" ]]; then
    cp "${SUPABASE_DIR}/.env.local.example" "${BOGA_CONFIG_DIR}/supabase/cli.env"
    echo "[boga-config-init] Created ${BOGA_CONFIG_DIR}/supabase/cli.env from example."
  else
    echo "[boga-config-init] WARNING: ${SUPABASE_DIR}/.env.local.example not found; skipping cli.env." >&2
  fi
else
  echo "[boga-config-init] ${BOGA_CONFIG_DIR}/supabase/cli.env already exists; skipping."
fi

if [[ ! -f "${BOGA_CONFIG_DIR}/edge-functions/env.shared" ]]; then
  if [[ -f "${SUPABASE_DIR}/functions/.env.local.example" ]]; then
    cp "${SUPABASE_DIR}/functions/.env.local.example" "${BOGA_CONFIG_DIR}/edge-functions/env.shared"
    echo "[boga-config-init] Created ${BOGA_CONFIG_DIR}/edge-functions/env.shared from example."
  else
    echo "[boga-config-init] WARNING: ${SUPABASE_DIR}/functions/.env.local.example not found; skipping env.shared." >&2
  fi
else
  echo "[boga-config-init] ${BOGA_CONFIG_DIR}/edge-functions/env.shared already exists; skipping."
fi

# --- Remind user to fill in hosted credentials ---
if [[ "${created_hosted}" -eq 1 ]]; then
  echo ""
  echo "[boga-config-init] ACTION REQUIRED: Fill in hosted credentials at:"
  echo "  ${BOGA_CONFIG_DIR}/supabase/env.hosted"
fi

echo "[boga-config-init] Done. Machine-global config directory: ${BOGA_CONFIG_DIR}"
