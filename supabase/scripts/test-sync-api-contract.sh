#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPABASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "[test] ensuring shared local runtime baseline"
"${SUPABASE_DIR}/scripts/ensure-local-runtime-baseline.sh"

echo "[test] running sync API contract suite"
"${SUPABASE_DIR}/tests/session-sync-api-contract.sh"

echo "[test] sync API contract suite passed"
