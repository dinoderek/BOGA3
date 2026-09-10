#!/usr/bin/env bash

# Tests for the Supabase CLI pin helpers in scripts/worktree-lib.sh
# (boga_supabase_cli_version, boga_version_at_least). Infra-free: temp dirs only.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck disable=SC1091
source "${REPO_ROOT}/scripts/worktree-lib.sh"

fail() { echo "  ASSERT FAILED: $*" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT
export BOGA_CONFIG_ROOT="${TMP}/config"
unset SUPABASE_CLI_VERSION
repo="${TMP}/repo"
mkdir -p "${repo}/supabase" "${BOGA_CONFIG_ROOT}/supabase"

expect_version() {
  local want="$1" got
  got="$(boga_supabase_cli_version "${repo}")"
  [[ "${got}" == "${want}" ]] || fail "expected CLI version '${want}', got '${got}'"
}
at_least() { boga_version_at_least "$1" "$2" || fail "expected $1 >= $2"; }
below() { if boga_version_at_least "$1" "$2"; then fail "expected $1 < $2"; fi; }

# No override anywhere -> repo default; the checked-in example pins nothing.
expect_version "${BOGA_SUPABASE_CLI_DEFAULT_VERSION}"
cp "${REPO_ROOT}/supabase/.env.local.example" "${repo}/supabase/.env.local"
expect_version "${BOGA_SUPABASE_CLI_DEFAULT_VERSION}"

# Worktree override file (plain, quoted, exported; last assignment wins).
printf 'SUPABASE_CLI_VERSION=2.200.0\n' > "${repo}/supabase/.env.local"
expect_version "2.200.0"
printf 'SUPABASE_CLI_VERSION=2.200.0\nexport SUPABASE_CLI_VERSION="2.201.0"  # trial\n' > "${repo}/supabase/.env.local"
expect_version "2.201.0"

# Machine file is used when the worktree link is absent.
rm "${repo}/supabase/.env.local"
printf "SUPABASE_CLI_VERSION='2.202.0'\n" > "${BOGA_CONFIG_ROOT}/supabase/cli.env"
expect_version "2.202.0"

# An explicit caller env value wins over the file.
got="$(SUPABASE_CLI_VERSION=2.300.0 boga_supabase_cli_version "${repo}")"
[[ "${got}" == "2.300.0" ]] || fail "explicit env should win, got '${got}'"

# Minimum: numeric (not lexical) compare; the repo default must satisfy it.
at_least "${BOGA_SUPABASE_CLI_DEFAULT_VERSION}" "${BOGA_SUPABASE_CLI_MIN_VERSION}"
at_least 2.108.0 2.108.0
at_least 2.110.0 2.108.0
at_least 3.0.0 2.108.0
at_least 2.118.0-beta.4 2.108.0
below 2.76.15 2.108.0
below 2.99.9 2.108.0
below 1.200.0 2.108.0
below latest 2.108.0

echo "[supabase-cli-version.test] ok"
