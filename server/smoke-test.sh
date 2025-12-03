#!/usr/bin/env bash
set -euo pipefail

# Determine script directory (server/)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==[1] Install dependencies =="
npm ci

echo "==[2] Build server =="
if [ -f "tsconfig.deploy.json" ]; then
  echo "Using tsconfig.deploy.json"
  npx tsc -p tsconfig.deploy.json
else
  echo "Using default build script"
  npm run build
fi

echo "==[3] Start server on port 5000 =="
export PORT="${PORT:-5000}"

# Start server in background
node dist/index.js &
SERVER_PID=$!

cleanup() {
  echo "==[CLEANUP] Killing server (PID: ${SERVER_PID}) =="
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Give the server time to boot
sleep 10

echo "==[4] Health checks =="

ROOT_OK=0
INT_OK=0

echo "--> Checking root route /"
if curl -fsS "http://localhost:${PORT}/" >/dev/null 2>&1; then
  echo "OK: GET /"
  ROOT_OK=1
else
  echo "WARN: GET / failed"
fi

echo "--> Checking internal health /api/_int/health (if present)"
if curl -fsS "http://localhost:${PORT}/api/_int/health" >/dev/null 2>&1; then
  echo "OK: GET /api/_int/health"
  INT_OK=1
else
  echo "WARN: GET /api/_int/health failed or endpoint not present"
fi

if [ "${ROOT_OK}" -eq 1 ]; then
  echo "==[RESULT] Smoke test PASS (root route responding)=="
  exit 0
else
  echo "==[RESULT] Smoke test FAIL (root route not responding)=="
  exit 1
fi
