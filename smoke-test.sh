#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://localhost:4000}
BACKEND_START_CMD=${BACKEND_START_CMD:-}
STARTED_BACKEND=0
BACKEND_PID=""

cleanup() {
  if [[ $STARTED_BACKEND -eq 1 && -n "$BACKEND_PID" ]]; then
    echo "\n[smoke-test] Shutting down backend (pid: $BACKEND_PID)"
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

log_section() {
  echo "\n[smoke-test] $1"
}

wait_for_endpoint() {
  local url=$1
  local retries=${2:-10}
  local delay=${3:-2}
  for ((i=1; i<=retries; i++)); do
    if curl --fail --silent "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done
  return 1
}

ensure_backend() {
  if curl --fail --silent "$API_BASE/api/_int/health" >/dev/null 2>&1; then
    echo "[smoke-test] Backend already running at $API_BASE"
    return
  fi

  if [[ -n "$BACKEND_START_CMD" ]]; then
    echo "[smoke-test] Starting backend using BACKEND_START_CMD"
    eval "$BACKEND_START_CMD" &
    BACKEND_PID=$!
    STARTED_BACKEND=1
    sleep 3
    if ! wait_for_endpoint "$API_BASE/api/_int/health"; then
      echo "[smoke-test] Backend failed to report healthy state" >&2
      exit 1
    fi
  else
    echo "[smoke-test] Backend not running and BACKEND_START_CMD not provided" >&2
    exit 1
  fi
}

check_endpoint() {
  local method=$1
  local path=$2
  local payload=${3:-}
  local url="$API_BASE$path"
  echo "[smoke-test] $method $url"
  if [[ -n "$payload" ]]; then
    curl --fail --silent --show-error --header 'Content-Type: application/json' --request "$method" --data "$payload" "$url" >/dev/null
  else
    curl --fail --silent --show-error --request "$method" "$url" >/dev/null
  fi
}

log_section "Ensuring backend availability"
ensure_backend

log_section "Health checks"
check_endpoint GET /api/_int/health
check_endpoint GET /api/_int/build-guard

log_section "Applications"
check_endpoint GET /api/applications
check_endpoint POST /api/applications/create '{"businessName":"Smoke Test Co","contactEmail":"smoke@example.com","contactPhone":"+1-555-0000","amountRequested":0,"silo":"BF"}'
check_endpoint POST /api/applications/submit '{"applicationId":"smoke-test"}'
check_endpoint POST /api/applications/upload '{"applicationId":"smoke-test","documentType":"void","fileUrl":"https://example.com/doc.pdf"}'
check_endpoint POST /api/applications/complete '{"applicationId":"smoke-test"}'

log_section "Documents"
check_endpoint GET /api/documents
check_endpoint POST /api/documents/smoke-test/status '{"status":"received"}'

log_section "Lenders"
check_endpoint GET /api/lenders
check_endpoint GET /api/lender-products
check_endpoint POST /api/lenders/send-to-lender '{"applicationId":"smoke-test","lenderId":"stub","notes":"smoke"}'

log_section "Pipeline"
check_endpoint GET /api/pipeline
check_endpoint POST /api/pipeline/transition '{"applicationId":"smoke-test","fromStageId":"new","toStageId":"submitted"}'
check_endpoint POST /api/pipeline/reorder '{"stageOrder":["stage-1","stage-2"]}'

log_section "Communication"
check_endpoint POST /api/communication/sms '{"to":"+1-555-0000","message":"Smoke test"}'
check_endpoint POST /api/communication/email '{"to":"ops@example.com","subject":"Smoke","body":"Smoke test"}'
check_endpoint POST /api/communication/calls '{"to":"+1-555-0001","outcome":"connected"}'

log_section "Admin"
check_endpoint GET /api/admin/retry-queue
check_endpoint POST /api/admin/retry-queue/smoke-test/retry '{}'
check_endpoint GET /api/admin/backups
check_endpoint POST /api/admin/backups '{}'

log_section "Silo aware verification"
for silo in BF SLF BI; do
  echo "[smoke-test] Checking pipeline for silo $silo"
  curl --fail --silent --show-error --header "X-Silo: $silo" "$API_BASE/api/pipeline" >/dev/null
done

echo "\n[smoke-test] Completed successfully"
