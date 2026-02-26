#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

TASK_ID="${TASK_ID:-ad-hoc}"
IOS_SIM_DEVICE_DEFAULT="${IOS_SIM_DEVICE:-iPhone 17 Pro}"
IOS_SIM_DEVICE_POOL="${IOS_SIM_DEVICE_POOL:-iPhone 17 Pro,iPhone 17 Pro Max,iPhone Air}"
EXPO_DEV_SERVER_BASE_PORT="${EXPO_DEV_SERVER_BASE_PORT:-8082}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")-$$"
FLOW_FILE="$APP_DIR/.maestro/flows/smoke-launch.yaml"
SLOT_ID=""
SLOT_INDEX=""

IFS=' ' read -r SLOT_ID SLOT_INDEX <<< "$("$SCRIPT_DIR/maestro-ios-slot-lock.sh" acquire)"

if [[ -z "$SLOT_ID" || -z "$SLOT_INDEX" ]]; then
  echo "Unable to acquire iOS Maestro slot." >&2
  exit 1
fi

if [[ -n "${EXPO_DEV_SERVER_PORT:-}" ]]; then
  SLOT_PORT="$EXPO_DEV_SERVER_PORT"
else
  SLOT_PORT="$((EXPO_DEV_SERVER_BASE_PORT + SLOT_INDEX))"
fi

SLOT_DEVICE="$IOS_SIM_DEVICE_DEFAULT"
if [[ -n "${IOS_SIM_UDID_POOL:-}" ]]; then
  IFS=',' read -r -a IOS_SIM_UDID_POOL_ITEMS <<< "$IOS_SIM_UDID_POOL"
  if (( SLOT_INDEX < ${#IOS_SIM_UDID_POOL_ITEMS[@]} )); then
    SLOT_UDID="$(echo "${IOS_SIM_UDID_POOL_ITEMS[$SLOT_INDEX]}" | xargs)"
  fi
fi

if [[ -z "${SLOT_UDID:-}" ]]; then
  IFS=',' read -r -a IOS_SIM_DEVICE_POOL_ITEMS <<< "$IOS_SIM_DEVICE_POOL"
  if (( SLOT_INDEX < ${#IOS_SIM_DEVICE_POOL_ITEMS[@]} )); then
    SLOT_DEVICE="$(echo "${IOS_SIM_DEVICE_POOL_ITEMS[$SLOT_INDEX]}" | xargs)"
  fi
fi

ARTIFACT_ROOT="$APP_DIR/artifacts/maestro/$TASK_ID/$TIMESTAMP"
MAESTRO_OUTPUT_DIR="$ARTIFACT_ROOT/maestro-output"
MAESTRO_DEBUG_DIR="$ARTIFACT_ROOT/maestro-debug"
EXPO_LOG_FILE="$ARTIFACT_ROOT/expo-start.log"
SIM_LOG_FILE="$ARTIFACT_ROOT/simulator.log"
JUNIT_FILE="$ARTIFACT_ROOT/maestro-junit.xml"

mkdir -p "$MAESTRO_OUTPUT_DIR" "$MAESTRO_DEBUG_DIR"

if [[ -n "${SLOT_UDID:-}" ]]; then
  SIM_UDID="$(IOS_SIM_UDID="$SLOT_UDID" "$SCRIPT_DIR/ios-sim-boot.sh" 2>"$SIM_LOG_FILE")"
else
  SIM_UDID="$(IOS_SIM_DEVICE="$SLOT_DEVICE" "$SCRIPT_DIR/ios-sim-boot.sh" 2>"$SIM_LOG_FILE")"
fi

if [[ "${IOS_SIM_RESET_EXPO_GO_STATE:-1}" == "1" ]]; then
  {
    echo "[maestro-ios-smoke] Resetting Expo Go state on simulator $SIM_UDID"
    xcrun simctl terminate "$SIM_UDID" host.exp.Exponent >/dev/null 2>&1 || true
    xcrun simctl uninstall "$SIM_UDID" host.exp.Exponent >/dev/null 2>&1 || true
  } >>"$SIM_LOG_FILE" 2>&1
fi

cd "$APP_DIR"
CI=1 npx expo start --ios --non-interactive --port "$SLOT_PORT" >"$EXPO_LOG_FILE" 2>&1 &
EXPO_PID=$!

cleanup() {
  if kill -0 "$EXPO_PID" >/dev/null 2>&1; then
    kill "$EXPO_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$SLOT_ID" ]]; then
    "$SCRIPT_DIR/maestro-ios-slot-lock.sh" release "$SLOT_ID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

# Give Expo Go time to launch and load the project on the simulator.
sleep "${EXPO_START_WAIT_SECONDS:-30}"
xcrun simctl launch "$SIM_UDID" host.exp.Exponent >/dev/null 2>&1 || true
xcrun simctl openurl "$SIM_UDID" "exp://127.0.0.1:$SLOT_PORT" >/dev/null 2>&1 || true
sleep 3

maestro test "$FLOW_FILE" \
  --udid "$SIM_UDID" \
  --format junit \
  --output "$JUNIT_FILE" \
  --debug-output "$MAESTRO_DEBUG_DIR" \
  --test-output-dir "$MAESTRO_OUTPUT_DIR"

echo "Smoke run complete."
echo "Artifacts: $ARTIFACT_ROOT"
echo "Slot: $SLOT_ID (index=$SLOT_INDEX, port=$SLOT_PORT, device_udid=$SIM_UDID)"
