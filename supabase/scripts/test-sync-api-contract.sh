#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPABASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "[test] ensuring local runtime is up"
"${SUPABASE_DIR}/scripts/local-runtime-up.sh"

echo "[test] resetting database (migrations + seed)"
"${SUPABASE_DIR}/scripts/reset-local.sh"

echo "[test] provisioning deterministic local auth fixtures"
"${SUPABASE_DIR}/scripts/auth-provision-local-fixtures.sh"

echo "[test] running sync API contract suite"
"${SUPABASE_DIR}/tests/session-sync-api-contract.sh"

echo "[test] sync API contract suite passed"
