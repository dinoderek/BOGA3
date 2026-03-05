#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/quality-slow.sh [frontend|backend]

Runs local slow quality gates.
- no args: runs all available slow gates (frontend + backend)
- frontend: runs Maestro-based frontend runtime smoke checks
- backend: runs backend auth/RLS + sync API contract suites (shared Supabase runtime baseline enforced by wrappers)

Note: task cards decide when slow gates are mandatory.
EOF
}

area="${1:-all}"

if [[ "${area}" == "--help" || "${area}" == "-h" ]]; then
  usage
  exit 0
fi

run_frontend() {
  if [[ ! -f "${REPO_ROOT}/apps/mobile/package.json" ]]; then
    echo "[quality-slow] skipping frontend: apps/mobile/package.json not found"
    return 0
  fi

  echo "[quality-slow] frontend: test:e2e:ios:smoke"
  (cd "${REPO_ROOT}/apps/mobile" && npm run test:e2e:ios:smoke)

  echo "[quality-slow] frontend: test:e2e:ios:data-smoke"
  (cd "${REPO_ROOT}/apps/mobile" && npm run test:e2e:ios:data-smoke)

  echo "[quality-slow] frontend: test:e2e:ios:auth-profile"
  (cd "${REPO_ROOT}/apps/mobile" && npm run test:e2e:ios:auth-profile)
}

run_backend() {
  if [[ ! -x "${REPO_ROOT}/supabase/scripts/test-auth-authz.sh" ]]; then
    echo "[quality-slow] skipping backend auth/authz: wrapper not found or not executable"
  else
    echo "[quality-slow] backend: test-auth-authz"
    "${REPO_ROOT}/supabase/scripts/test-auth-authz.sh"
  fi

  if [[ ! -x "${REPO_ROOT}/supabase/scripts/test-sync-api-contract.sh" ]]; then
    echo "[quality-slow] skipping backend sync-api-contract: wrapper not found or not executable"
  else
    echo "[quality-slow] backend: test-sync-api-contract"
    "${REPO_ROOT}/supabase/scripts/test-sync-api-contract.sh"
  fi
}

case "${area}" in
  all)
    run_frontend
    run_backend
    ;;
  frontend)
    run_frontend
    ;;
  backend)
    run_backend
    ;;
  *)
    echo "[quality-slow] unknown area: ${area}" >&2
    usage >&2
    exit 2
    ;;
esac

echo "[quality-slow] done (${area})"
