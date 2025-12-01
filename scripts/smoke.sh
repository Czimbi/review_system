#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
NGINX_URL="${NGINX_URL:-http://localhost:8080}"

attempt_curl() {
  local label="$1"
  local url="$2"
  local max_retries=5
  local delay=3

  for attempt in $(seq 1 "$max_retries"); do
    if curl -fsS "$url" >/dev/null; then
      echo "[$label] OK (attempt $attempt)"
      return 0
    fi
    echo "[$label] attempt $attempt failed, retrying in ${delay}s..."
    sleep "$delay"
  done

  echo "[$label] failed after ${max_retries} attempts."
  return 1
}

echo "Checking backend API at ${API_URL}/health"
attempt_curl "API" "${API_URL}/health"

echo "Checking nginx endpoint at ${NGINX_URL}/nginx-health"
attempt_curl "NGINX" "${NGINX_URL}/nginx-health"

echo "Smoke tests passed."

