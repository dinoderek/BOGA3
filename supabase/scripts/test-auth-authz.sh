#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPABASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "[test] ensuring shared local runtime baseline"
"${SUPABASE_DIR}/scripts/ensure-local-runtime-baseline.sh"

echo "[test] running auth/authz contract suite"
"${SUPABASE_DIR}/tests/auth-authz-contract.sh"

echo "[test] auth/authz contract suite passed"
