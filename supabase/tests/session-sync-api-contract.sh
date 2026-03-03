#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUPABASE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck disable=SC1091
source "${SUPABASE_DIR}/scripts/_common.sh"
# shellcheck disable=SC1091
source "${SUPABASE_DIR}/scripts/auth-fixture-constants.sh"

require_jq() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required for sync API contract tests." >&2
    exit 1
  fi
}

http_request() {
  local method="$1"
  local url="$2"
  local auth_bearer="$3"
  local apikey_value="$4"
  local profile_header="${5:-}"
  local body="${6:-}"
  local prefer_header="${7:-}"

  local response_file
  response_file="$(mktemp)"

  local -a curl_args
  curl_args=(
    --silent
    --show-error
    -X "${method}"
    -H "apikey: ${apikey_value}"
    -H "Authorization: Bearer ${auth_bearer}"
    -o "${response_file}"
    -w "%{http_code}"
  )

  if [[ -n "${profile_header}" ]]; then
    curl_args+=(-H "Accept-Profile: ${profile_header}" -H "Content-Profile: ${profile_header}")
  fi

  if [[ -n "${prefer_header}" ]]; then
    curl_args+=(-H "Prefer: ${prefer_header}")
  fi

  if [[ -n "${body}" ]]; then
    curl_args+=(-H "Content-Type: application/json" --data "${body}")
  fi

  REQUEST_STATUS="$(curl "${curl_args[@]}" "${url}")"
  REQUEST_BODY="$(cat "${response_file}")"
  rm -f "${response_file}"
}

assert_status() {
  local expected="$1"
  local context="$2"
  if [[ "${REQUEST_STATUS}" != "${expected}" ]]; then
    echo "[fail] ${context}: expected status ${expected}, got ${REQUEST_STATUS}" >&2
    echo "${REQUEST_BODY}" >&2
    exit 1
  fi
}

assert_non_2xx() {
  local context="$1"
  if [[ "${REQUEST_STATUS}" =~ ^2 ]]; then
    echo "[fail] ${context}: expected non-2xx status, got ${REQUEST_STATUS}" >&2
    echo "${REQUEST_BODY}" >&2
    exit 1
  fi
}

assert_json_expr() {
  if [[ "$#" -lt 2 ]]; then
    echo "[fail] assert_json_expr requires at least <jq-expr> <context>" >&2
    exit 1
  fi

  local expr_index=$(( $# - 1 ))
  local context_index=$#
  local expr="${!expr_index}"
  local context="${!context_index}"
  local jq_arg_count=$(( $# - 2 ))
  local -a jq_args=()

  if (( jq_arg_count > 0 )); then
    jq_args=("${@:1:jq_arg_count}")
  fi

  if (( jq_arg_count > 0 )); then
    jq_ok() {
      printf '%s' "${REQUEST_BODY}" | jq -e "${jq_args[@]}" "${expr}" >/dev/null
    }
  else
    jq_ok() {
      printf '%s' "${REQUEST_BODY}" | jq -e "${expr}" >/dev/null
    }
  fi

  if ! jq_ok; then
    echo "[fail] ${context}: jq assertion failed: ${expr}" >&2
    echo "${REQUEST_BODY}" >&2
    exit 1
  fi
}

assert_body_contains() {
  local needle="$1"
  local context="$2"
  if ! printf '%s' "${REQUEST_BODY}" | grep -qi "${needle}"; then
    echo "[fail] ${context}: expected response body to contain '${needle}'" >&2
    echo "${REQUEST_BODY}" >&2
    exit 1
  fi
}

postgrest_select() {
  local table="$1"
  local query="$2"
  local token="$3"
  http_request GET "${API_URL}/rest/v1/${table}?${query}" "${token}" "${ANON_KEY}" "app_public"
}

postgrest_insert() {
  local table="$1"
  local token="$2"
  local body="$3"
  http_request POST "${API_URL}/rest/v1/${table}" "${token}" "${ANON_KEY}" "app_public" "${body}" "return=representation"
}

postgrest_patch() {
  local table="$1"
  local query="$2"
  local token="$3"
  local body="$4"
  http_request PATCH "${API_URL}/rest/v1/${table}?${query}" "${token}" "${ANON_KEY}" "app_public" "${body}" "return=representation"
}

postgrest_rpc() {
  local fn_name="$1"
  local token="$2"
  local body="$3"
  http_request POST "${API_URL}/rest/v1/rpc/${fn_name}" "${token}" "${ANON_KEY}" "app_public" "${body}"
}

load_fixture_uuid() {
  local fixture_key="$1"
  http_request GET "${API_URL}/rest/v1/dev_fixture_principals?fixture_key=eq.${fixture_key}&select=subject_uuid" "${ANON_KEY}" "${ANON_KEY}"
  assert_status "200" "load fixture uuid ${fixture_key}"
  printf '%s' "${REQUEST_BODY}" | jq -r '.[0].subject_uuid'
}

sign_in_password() {
  local email="$1"
  local password="$2"
  local payload
  payload="$(jq -nc --arg email "${email}" --arg password "${password}" '{email: $email, password: $password}')"
  http_request POST "${API_URL}/auth/v1/token?grant_type=password" "${ANON_KEY}" "${ANON_KEY}" "" "${payload}"
}

require_jq
load_supabase_status_env

if [[ -z "${API_URL:-}" || -z "${ANON_KEY:-}" ]]; then
  echo "Missing Supabase local runtime env. Start local stack first." >&2
  exit 1
fi

echo "[sync-api] signing in fixture users"
sign_in_password "${USER_A_EMAIL}" "${USER_A_PASSWORD}"
assert_status "200" "user_a sign-in"
USER_A_TOKEN="$(printf '%s' "${REQUEST_BODY}" | jq -r '.access_token')"
[[ -n "${USER_A_TOKEN}" && "${USER_A_TOKEN}" != "null" ]]

sign_in_password "${USER_B_EMAIL}" "${USER_B_PASSWORD}"
assert_status "200" "user_b sign-in"
USER_B_TOKEN="$(printf '%s' "${REQUEST_BODY}" | jq -r '.access_token')"
[[ -n "${USER_B_TOKEN}" && "${USER_B_TOKEN}" != "null" ]]

USER_A_UUID="$(load_fixture_uuid "${USER_A_FIXTURE_KEY}")"
USER_B_UUID="$(load_fixture_uuid "${USER_B_FIXTURE_KEY}")"

BASE_MS="$(($(date +%s) * 1000))"

GYM_A_ID="sync-gym-a-1"
SESSION_A_ID="sync-session-a-1"
SX_A_ID="sync-sx-a-1"
SET_A_ID="sync-set-a-1"
GRAPH_SESSION_ID="sync-graph-session-a-1"
GRAPH_KEEP_SX_ID="sync-graph-sx-keep-a-1"
GRAPH_REMOVE_SX_ID="sync-graph-sx-remove-a-1"
GRAPH_NEW_SX_ID="sync-graph-sx-new-a-1"
GRAPH_KEEP_SET_ID="sync-graph-set-keep-a-1"
GRAPH_REMOVE_SET_ID="sync-graph-set-remove-a-1"
GRAPH_KEEP_SET_NEW_ID="sync-graph-set-keep-new-a-1"
GRAPH_NEW_SET_ID="sync-graph-set-new-a-1"

echo "[sync-api] unauthorized requests return error payloads"
postgrest_select "gyms" "select=id&limit=1" "${ANON_KEY}"
assert_non_2xx "anon select gyms"
assert_body_contains "message" "anon select gyms error payload"

postgrest_insert "gyms" "${ANON_KEY}" "$(jq -nc \
  --arg id "sync-gym-anon" \
  --arg name "Anon Gym" \
  --argjson now "${BASE_MS}" \
  '{id: $id, name: $name, created_at: $now, updated_at: $now}')"
assert_non_2xx "anon insert gym"
assert_body_contains "message" "anon insert gym error payload"

echo "[sync-api] gyms success flow (create/read/update/list)"
postgrest_insert "gyms" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "${GYM_A_ID}" \
  --arg name "Warehouse Gym" \
  --argjson now "${BASE_MS}" \
  '{id: $id, name: $name, origin_scope_id: "private", origin_source_id: "local", created_at: $now, updated_at: $now}')"
assert_status "201" "user_a create gym"
assert_json_expr --arg owner "${USER_A_UUID}" --arg id "${GYM_A_ID}" 'length == 1 and .[0].id == $id and .[0].owner_user_id == $owner' "user_a create gym row"

postgrest_select "gyms" "id=eq.${GYM_A_ID}&select=id,name,updated_at,owner_user_id" "${USER_A_TOKEN}"
assert_status "200" "user_a read gym by id"
assert_json_expr --arg owner "${USER_A_UUID}" 'length == 1 and .[0].owner_user_id == $owner' "user_a read gym owner"

postgrest_patch "gyms" "id=eq.${GYM_A_ID}" "${USER_A_TOKEN}" "$(jq -nc \
  --arg name "Warehouse Gym (Renamed)" \
  --argjson updated_at "$((BASE_MS + 1))" \
  '{name: $name, updated_at: $updated_at}')"
assert_status "200" "user_a update gym"
assert_json_expr 'length == 1 and .[0].name == "Warehouse Gym (Renamed)"' "user_a update gym result"

postgrest_select "gyms" "select=id,name,updated_at&updated_at=gte.$((BASE_MS))&order=updated_at.asc" "${USER_A_TOKEN}"
assert_status "200" "user_a list gyms by updated_at"
assert_json_expr --arg id "${GYM_A_ID}" 'map(.id) | index($id) != null' "user_a list gyms contains created gym"

echo "[sync-api] gyms validation + ownership denial"
postgrest_insert "gyms" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "sync-gym-a-invalid" \
  --argjson now "$((BASE_MS + 2))" \
  '{id: $id, name: "   ", created_at: $now, updated_at: $now}')"
assert_non_2xx "gym blank name validation"
assert_body_contains "23514" "gym blank name validation code"

postgrest_select "gyms" "id=eq.${GYM_A_ID}&select=id" "${USER_B_TOKEN}"
assert_status "200" "user_b cross-user gym read"
assert_json_expr 'length == 0' "user_b cross-user gym read denied"

postgrest_patch "gyms" "id=eq.${GYM_A_ID}" "${USER_B_TOKEN}" '{"name":"Hijack"}'
assert_status "200" "user_b cross-user gym update"
assert_json_expr 'length == 0' "user_b cross-user gym update denied"

echo "[sync-api] sessions success flow (create/read/update/list)"
postgrest_insert "sessions" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "${SESSION_A_ID}" \
  --arg gym_id "${GYM_A_ID}" \
  --argjson started_at "$((BASE_MS + 10))" \
  --argjson created_at "$((BASE_MS + 10))" \
  --argjson updated_at "$((BASE_MS + 10))" \
  '{id: $id, gym_id: $gym_id, status: "draft", started_at: $started_at, created_at: $created_at, updated_at: $updated_at}')"
assert_status "201" "user_a create session"
assert_json_expr --arg owner "${USER_A_UUID}" 'length == 1 and .[0].owner_user_id == $owner and .[0].status == "draft"' "user_a create session row"

postgrest_select "sessions" "id=eq.${SESSION_A_ID}&select=id,gym_id,status,started_at,owner_user_id" "${USER_A_TOKEN}"
assert_status "200" "user_a read session by id"
assert_json_expr --arg gym_id "${GYM_A_ID}" 'length == 1 and .[0].gym_id == $gym_id' "user_a read session payload"

postgrest_patch "sessions" "id=eq.${SESSION_A_ID}" "${USER_A_TOKEN}" "$(jq -nc \
  --argjson completed_at "$((BASE_MS + 4000))" \
  --argjson updated_at "$((BASE_MS + 4001))" \
  '{status: "completed", completed_at: $completed_at, duration_sec: 4, updated_at: $updated_at}')"
assert_status "200" "user_a update session"
assert_json_expr 'length == 1 and .[0].status == "completed" and .[0].duration_sec == 4' "user_a update session result"

postgrest_select "sessions" "select=id,status,updated_at&updated_at=gte.$((BASE_MS))&order=updated_at.asc" "${USER_A_TOKEN}"
assert_status "200" "user_a list sessions by updated_at"
assert_json_expr --arg id "${SESSION_A_ID}" 'map(.id) | index($id) != null' "user_a list sessions contains created session"

echo "[sync-api] sessions validation + ownership denial"
postgrest_insert "sessions" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "sync-session-a-invalid-status" \
  --arg gym_id "${GYM_A_ID}" \
  --argjson now "$((BASE_MS + 20))" \
  '{id: $id, gym_id: $gym_id, status: "bad_status", started_at: $now, created_at: $now, updated_at: $now}')"
assert_non_2xx "session invalid status validation"
assert_body_contains "23514" "session invalid status validation code"

postgrest_patch "sessions" "id=eq.${SESSION_A_ID}" "${USER_B_TOKEN}" '{"status":"active"}'
assert_status "200" "user_b cross-user session update"
assert_json_expr 'length == 0' "user_b cross-user session update denied"

postgrest_select "sessions" "id=eq.${SESSION_A_ID}&select=id" "${USER_B_TOKEN}"
assert_status "200" "user_b cross-user session read"
assert_json_expr 'length == 0' "user_b cross-user session read denied"

echo "[sync-api] session_exercises success flow (create/read/update/list)"
postgrest_insert "session_exercises" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "${SX_A_ID}" \
  --arg session_id "${SESSION_A_ID}" \
  --argjson created_at "$((BASE_MS + 30))" \
  --argjson updated_at "$((BASE_MS + 30))" \
  '{id: $id, session_id: $session_id, order_index: 0, name: "Chest Press", machine_name: "Plate Press", created_at: $created_at, updated_at: $updated_at}')"
assert_status "201" "user_a create session_exercise"
assert_json_expr --arg owner "${USER_A_UUID}" 'length == 1 and .[0].owner_user_id == $owner and .[0].order_index == 0' "user_a create session_exercise row"

postgrest_select "session_exercises" "id=eq.${SX_A_ID}&select=id,session_id,order_index,name,machine_name" "${USER_A_TOKEN}"
assert_status "200" "user_a read session_exercise by id"
assert_json_expr --arg session_id "${SESSION_A_ID}" 'length == 1 and .[0].session_id == $session_id' "user_a read session_exercise payload"

postgrest_patch "session_exercises" "id=eq.${SX_A_ID}" "${USER_A_TOKEN}" "$(jq -nc \
  --arg machine_name "Incline Press" \
  --argjson updated_at "$((BASE_MS + 31))" \
  '{machine_name: $machine_name, updated_at: $updated_at}')"
assert_status "200" "user_a update session_exercise"
assert_json_expr 'length == 1 and .[0].machine_name == "Incline Press"' "user_a update session_exercise result"

postgrest_select "session_exercises" "session_id=eq.${SESSION_A_ID}&select=id,order_index,name&order=order_index.asc" "${USER_A_TOKEN}"
assert_status "200" "user_a list session_exercises by session"
assert_json_expr --arg id "${SX_A_ID}" 'length == 1 and .[0].id == $id' "user_a list session_exercises payload"

echo "[sync-api] session_exercises validation + ownership denial"
postgrest_insert "session_exercises" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "sync-sx-a-invalid" \
  --arg session_id "${SESSION_A_ID}" \
  --argjson now "$((BASE_MS + 32))" \
  '{id: $id, session_id: $session_id, order_index: 1, name: "   ", created_at: $now, updated_at: $now}')"
assert_non_2xx "session_exercise blank name validation"
assert_body_contains "23514" "session_exercise blank name validation code"

postgrest_patch "session_exercises" "id=eq.${SX_A_ID}" "${USER_B_TOKEN}" '{"name":"Hijack"}'
assert_status "200" "user_b cross-user session_exercise update"
assert_json_expr 'length == 0' "user_b cross-user session_exercise update denied"

postgrest_insert "session_exercises" "${USER_B_TOKEN}" "$(jq -nc \
  --arg id "sync-sx-cross-owner" \
  --arg session_id "${SESSION_A_ID}" \
  --argjson now "$((BASE_MS + 33))" \
  '{id: $id, session_id: $session_id, order_index: 9, name: "Bad Link", created_at: $now, updated_at: $now}')"
assert_non_2xx "cross-user session_exercise parent link"
assert_body_contains "foreign key" "cross-user session_exercise parent link error"

echo "[sync-api] exercise_sets success flow (create/read/update/list)"
postgrest_insert "exercise_sets" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "${SET_A_ID}" \
  --arg session_exercise_id "${SX_A_ID}" \
  --argjson created_at "$((BASE_MS + 40))" \
  --argjson updated_at "$((BASE_MS + 40))" \
  '{id: $id, session_exercise_id: $session_exercise_id, order_index: 0, weight_value: "120", reps_value: "10", created_at: $created_at, updated_at: $updated_at}')"
assert_status "201" "user_a create exercise_set"
assert_json_expr --arg owner "${USER_A_UUID}" 'length == 1 and .[0].owner_user_id == $owner and .[0].order_index == 0' "user_a create exercise_set row"

postgrest_select "exercise_sets" "id=eq.${SET_A_ID}&select=id,session_exercise_id,order_index,weight_value,reps_value" "${USER_A_TOKEN}"
assert_status "200" "user_a read exercise_set by id"
assert_json_expr --arg sx_id "${SX_A_ID}" 'length == 1 and .[0].session_exercise_id == $sx_id' "user_a read exercise_set payload"

postgrest_patch "exercise_sets" "id=eq.${SET_A_ID}" "${USER_A_TOKEN}" "$(jq -nc \
  --arg reps_value "12" \
  --argjson updated_at "$((BASE_MS + 41))" \
  '{reps_value: $reps_value, updated_at: $updated_at}')"
assert_status "200" "user_a update exercise_set"
assert_json_expr 'length == 1 and .[0].reps_value == "12"' "user_a update exercise_set result"

postgrest_select "exercise_sets" "session_exercise_id=eq.${SX_A_ID}&select=id,order_index,reps_value&order=order_index.asc" "${USER_A_TOKEN}"
assert_status "200" "user_a list exercise_sets by session_exercise"
assert_json_expr --arg id "${SET_A_ID}" 'length == 1 and .[0].id == $id' "user_a list exercise_sets payload"

echo "[sync-api] exercise_sets validation + ownership denial"
postgrest_insert "exercise_sets" "${USER_A_TOKEN}" "$(jq -nc \
  --arg id "sync-set-a-invalid" \
  --arg session_exercise_id "${SX_A_ID}" \
  --argjson now "$((BASE_MS + 42))" \
  '{id: $id, session_exercise_id: $session_exercise_id, order_index: -1, weight_value: "100", reps_value: "8", created_at: $now, updated_at: $now}')"
assert_non_2xx "exercise_set negative order validation"
assert_body_contains "23514" "exercise_set negative order validation code"

postgrest_patch "exercise_sets" "id=eq.${SET_A_ID}" "${USER_B_TOKEN}" '{"reps_value":"99"}'
assert_status "200" "user_b cross-user exercise_set update"
assert_json_expr 'length == 0' "user_b cross-user exercise_set update denied"

postgrest_insert "exercise_sets" "${USER_B_TOKEN}" "$(jq -nc \
  --arg id "sync-set-cross-owner" \
  --arg session_exercise_id "${SX_A_ID}" \
  --argjson now "$((BASE_MS + 43))" \
  '{id: $id, session_exercise_id: $session_exercise_id, order_index: 9, weight_value: "200", reps_value: "3", created_at: $now, updated_at: $now}')"
assert_non_2xx "cross-user exercise_set parent link"
assert_body_contains "foreign key" "cross-user exercise_set parent link error"

echo "[sync-api] owner spoofing is denied across write methods"
postgrest_insert "sessions" "${USER_B_TOKEN}" "$(jq -nc \
  --arg id "sync-session-spoof" \
  --arg owner "${USER_A_UUID}" \
  --argjson now "$((BASE_MS + 50))" \
  '{id: $id, owner_user_id: $owner, status: "draft", started_at: $now, created_at: $now, updated_at: $now}')"
assert_non_2xx "session owner spoofing insert"
assert_body_contains "row-level security" "session owner spoofing insert denied"

echo "[sync-api] session graph replace RPC create/update parity flow"
GRAPH_INITIAL_UPDATED_AT="$((BASE_MS + 60))"
GRAPH_REPLACED_UPDATED_AT="$((BASE_MS + 90))"

postgrest_rpc "replace_session_graph" "${USER_A_TOKEN}" "$(jq -nc \
  --arg session_id "${GRAPH_SESSION_ID}" \
  --arg gym_id "${GYM_A_ID}" \
  --arg keep_sx_id "${GRAPH_KEEP_SX_ID}" \
  --arg remove_sx_id "${GRAPH_REMOVE_SX_ID}" \
  --arg keep_set_id "${GRAPH_KEEP_SET_ID}" \
  --arg remove_set_id "${GRAPH_REMOVE_SET_ID}" \
  --argjson now "${GRAPH_INITIAL_UPDATED_AT}" \
  '{
    p_session: {
      id: $session_id,
      gym_id: $gym_id,
      status: "draft",
      started_at: $now,
      completed_at: null,
      duration_sec: null,
      deleted_at: null,
      created_at: $now,
      updated_at: $now
    },
    p_exercises: [
      {
        id: $keep_sx_id,
        order_index: 0,
        name: "Bench Press",
        machine_name: "Flat Bench",
        origin_scope_id: "private",
        origin_source_id: "local",
        created_at: $now,
        updated_at: $now,
        sets: [
          {
            id: $keep_set_id,
            order_index: 0,
            weight_value: "120",
            reps_value: "10",
            created_at: $now,
            updated_at: $now
          }
        ]
      },
      {
        id: $remove_sx_id,
        order_index: 1,
        name: "Cable Fly",
        machine_name: "Cable Station",
        origin_scope_id: "private",
        origin_source_id: "local",
        created_at: $now,
        updated_at: $now,
        sets: [
          {
            id: $remove_set_id,
            order_index: 0,
            weight_value: "35",
            reps_value: "12",
            created_at: $now,
            updated_at: $now
          }
        ]
      }
    ]
  }')"
assert_status "200" "user_a create session graph via rpc"
assert_json_expr --arg session_id "${GRAPH_SESSION_ID}" --arg keep_sx_id "${GRAPH_KEEP_SX_ID}" --arg remove_sx_id "${GRAPH_REMOVE_SX_ID}" --argjson updated_at "${GRAPH_INITIAL_UPDATED_AT}" \
  '.session.id == $session_id and .session.updated_at == $updated_at and (.exercises | length) == 2 and ([.exercises[].id] | index($keep_sx_id) != null) and ([.exercises[].id] | index($remove_sx_id) != null)' \
  "user_a create session graph rpc result"

postgrest_select "session_exercises" "session_id=eq.${GRAPH_SESSION_ID}&select=id,order_index,name&order=order_index.asc" "${USER_A_TOKEN}"
assert_status "200" "user_a read initial graph session_exercises"
assert_json_expr --arg keep_sx_id "${GRAPH_KEEP_SX_ID}" --arg remove_sx_id "${GRAPH_REMOVE_SX_ID}" \
  'length == 2 and .[0].id == $keep_sx_id and .[1].id == $remove_sx_id' \
  "user_a initial graph session_exercises payload"

postgrest_rpc "replace_session_graph" "${USER_A_TOKEN}" "$(jq -nc \
  --arg session_id "${GRAPH_SESSION_ID}" \
  --arg gym_id "${GYM_A_ID}" \
  --arg keep_sx_id "${GRAPH_KEEP_SX_ID}" \
  --arg new_sx_id "${GRAPH_NEW_SX_ID}" \
  --arg keep_set_id "${GRAPH_KEEP_SET_ID}" \
  --arg keep_set_new_id "${GRAPH_KEEP_SET_NEW_ID}" \
  --arg new_set_id "${GRAPH_NEW_SET_ID}" \
  --argjson expected_updated_at "${GRAPH_INITIAL_UPDATED_AT}" \
  --argjson started_at "${GRAPH_INITIAL_UPDATED_AT}" \
  --argjson updated_at "${GRAPH_REPLACED_UPDATED_AT}" \
  '{
    p_expected_updated_at: $expected_updated_at,
    p_session: {
      id: $session_id,
      gym_id: $gym_id,
      status: "active",
      started_at: $started_at,
      completed_at: null,
      duration_sec: null,
      deleted_at: null,
      updated_at: $updated_at
    },
    p_exercises: [
      {
        id: $keep_sx_id,
        order_index: 0,
        name: "Bench Press",
        machine_name: "Competition Bench",
        origin_scope_id: "private",
        origin_source_id: "local",
        created_at: $started_at,
        updated_at: $updated_at,
        sets: [
          {
            id: $keep_set_id,
            order_index: 0,
            weight_value: "125",
            reps_value: "8",
            created_at: $started_at,
            updated_at: $updated_at
          },
          {
            id: $keep_set_new_id,
            order_index: 1,
            weight_value: "115",
            reps_value: "10",
            created_at: $updated_at,
            updated_at: $updated_at
          }
        ]
      },
      {
        id: $new_sx_id,
        order_index: 1,
        name: "Incline Dumbbell Press",
        machine_name: null,
        origin_scope_id: "private",
        origin_source_id: "local",
        created_at: $updated_at,
        updated_at: $updated_at,
        sets: [
          {
            id: $new_set_id,
            order_index: 0,
            weight_value: "80",
            reps_value: "11",
            created_at: $updated_at,
            updated_at: $updated_at
          }
        ]
      }
    ]
  }')"
assert_status "200" "user_a replace session graph via rpc"
assert_json_expr --arg keep_sx_id "${GRAPH_KEEP_SX_ID}" --arg new_sx_id "${GRAPH_NEW_SX_ID}" --arg keep_set_new_id "${GRAPH_KEEP_SET_NEW_ID}" --argjson updated_at "${GRAPH_REPLACED_UPDATED_AT}" \
  '.session.updated_at == $updated_at and .session.status == "active" and (.exercises | length) == 2 and ([.exercises[].id] | index($keep_sx_id) != null) and ([.exercises[].id] | index($new_sx_id) != null) and (.exercises[] | select(.id == $keep_sx_id) | .machine_name == "Competition Bench" and (.sets | length) == 2 and ([.sets[].id] | index($keep_set_new_id) != null))' \
  "user_a replace session graph rpc result"

postgrest_select "session_exercises" "session_id=eq.${GRAPH_SESSION_ID}&select=id,order_index,name,machine_name&order=order_index.asc" "${USER_A_TOKEN}"
assert_status "200" "user_a read replaced graph session_exercises"
assert_json_expr --arg keep_sx_id "${GRAPH_KEEP_SX_ID}" --arg new_sx_id "${GRAPH_NEW_SX_ID}" \
  'length == 2 and .[0].id == $keep_sx_id and .[1].id == $new_sx_id' \
  "user_a replaced graph session_exercises payload"

postgrest_select "exercise_sets" "session_exercise_id=eq.${GRAPH_REMOVE_SX_ID}&select=id" "${USER_A_TOKEN}"
assert_status "200" "user_a removed exercise sets omitted after graph replace"
assert_json_expr 'length == 0' "user_a removed exercise sets deleted by graph replace"

postgrest_select "exercise_sets" "session_exercise_id=eq.${GRAPH_KEEP_SX_ID}&select=id,order_index,weight_value,reps_value&order=order_index.asc" "${USER_A_TOKEN}"
assert_status "200" "user_a keep exercise sets after graph replace"
assert_json_expr --arg keep_set_id "${GRAPH_KEEP_SET_ID}" --arg keep_set_new_id "${GRAPH_KEEP_SET_NEW_ID}" \
  'length == 2 and .[0].id == $keep_set_id and .[0].reps_value == "8" and .[1].id == $keep_set_new_id' \
  "user_a keep exercise sets payload after graph replace"

postgrest_select "exercise_sets" "session_exercise_id=eq.${GRAPH_NEW_SX_ID}&select=id,reps_value" "${USER_A_TOKEN}"
assert_status "200" "user_a new exercise set after graph replace"
assert_json_expr --arg new_set_id "${GRAPH_NEW_SET_ID}" 'length == 1 and .[0].id == $new_set_id and .[0].reps_value == "11"' "user_a new exercise set payload after graph replace"

echo "[sync-api] session graph replace RPC stale/auth/ownership denial"
postgrest_rpc "replace_session_graph" "${USER_A_TOKEN}" "$(jq -nc \
  --arg session_id "${GRAPH_SESSION_ID}" \
  --arg gym_id "${GYM_A_ID}" \
  --argjson expected_updated_at "${GRAPH_INITIAL_UPDATED_AT}" \
  --argjson started_at "${GRAPH_INITIAL_UPDATED_AT}" \
  --argjson updated_at "$((GRAPH_REPLACED_UPDATED_AT + 1))" \
  '{p_expected_updated_at: $expected_updated_at, p_session: {id: $session_id, gym_id: $gym_id, status: "active", started_at: $started_at, updated_at: $updated_at}, p_exercises: []}')"
assert_non_2xx "user_a stale session graph replace"
assert_body_contains "SESSION_GRAPH_STALE" "user_a stale session graph replace denial"

postgrest_rpc "replace_session_graph" "${USER_B_TOKEN}" "$(jq -nc \
  --arg session_id "${GRAPH_SESSION_ID}" \
  --arg gym_id "${GYM_A_ID}" \
  --argjson expected_updated_at "${GRAPH_REPLACED_UPDATED_AT}" \
  --argjson started_at "${GRAPH_INITIAL_UPDATED_AT}" \
  --argjson updated_at "$((GRAPH_REPLACED_UPDATED_AT + 2))" \
  '{p_expected_updated_at: $expected_updated_at, p_session: {id: $session_id, gym_id: $gym_id, status: "active", started_at: $started_at, updated_at: $updated_at}, p_exercises: []}')"
assert_non_2xx "user_b cross-user session graph replace"
assert_body_contains "SESSION_GRAPH_NOT_FOUND_OR_DENIED" "user_b cross-user session graph replace denial"

postgrest_rpc "replace_session_graph" "${ANON_KEY}" "$(jq -nc \
  --arg session_id "${GRAPH_SESSION_ID}" \
  --arg gym_id "${GYM_A_ID}" \
  --argjson expected_updated_at "${GRAPH_REPLACED_UPDATED_AT}" \
  --argjson started_at "${GRAPH_INITIAL_UPDATED_AT}" \
  --argjson updated_at "$((GRAPH_REPLACED_UPDATED_AT + 3))" \
  '{p_expected_updated_at: $expected_updated_at, p_session: {id: $session_id, gym_id: $gym_id, status: "active", started_at: $started_at, updated_at: $updated_at}, p_exercises: []}')"
assert_non_2xx "anon session graph replace"
assert_body_contains "AUTH_REQUIRED" "anon session graph replace denial"

echo "[sync-api] sync API contract checks passed"
