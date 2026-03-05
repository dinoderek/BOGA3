#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd -- "$APP_DIR/../.." && pwd)"

# Reuse deterministic local Supabase auth fixtures for the M11 happy path.
source "$REPO_ROOT/supabase/scripts/auth-fixture-constants.sh"

echo "[maestro-ios-auth-profile] ensuring shared local Supabase baseline"
"$REPO_ROOT/supabase/scripts/ensure-local-runtime-baseline.sh"

export MAESTRO_AUTH_PROFILE_EMAIL="${MAESTRO_AUTH_PROFILE_EMAIL:-$USER_A_EMAIL}"
export MAESTRO_AUTH_PROFILE_PASSWORD="${MAESTRO_AUTH_PROFILE_PASSWORD:-$USER_A_PASSWORD}"
export MAESTRO_AUTH_PROFILE_USERNAME="${MAESTRO_AUTH_PROFILE_USERNAME:-maestro-${TASK_ID:-auth-profile}-$(date +%H%M%S)}"

MAESTRO_RESET_STRATEGY="full" exec "$SCRIPT_DIR/maestro-ios-run-flow.sh" \
  --scenario "Auth profile happy path" \
  --flow "$APP_DIR/.maestro/flows/auth-profile-happy-path.yaml"
