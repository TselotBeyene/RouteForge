#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="/home/test/tselot_Studio/frontend"
CURRENT_DIR="${RUNTIME_DIR}/current"
PID_FILE="${RUNTIME_DIR}/app.pid"
LOG_DIR="${RUNTIME_DIR}/logs"
ENV_FILE="${RUNTIME_DIR}/frontend.env"

mkdir -p "${LOG_DIR}"

echo "Cleaning old frontend deployment archives and compressed logs..."
rm -f "${RUNTIME_DIR}/frontend-standalone.tar.gz"
rm -f "${RUNTIME_DIR}/frontend-deploy.tar.gz"
find "${LOG_DIR}" -type f -name "*.log.gz" -delete || true

if [ ! -d "${CURRENT_DIR}" ]; then
  echo "Frontend current directory not found: ${CURRENT_DIR}"
  exit 1
fi

if [ ! -f "${CURRENT_DIR}/server.js" ]; then
  echo "Next standalone server.js not found: ${CURRENT_DIR}/server.js"
  exit 1
fi

if [ ! -f "${ENV_FILE}" ]; then
  echo "Frontend env file not found: ${ENV_FILE}"
  exit 1
fi

set -a
. "${ENV_FILE}"
set +a

FRONTEND_PORT="${FRONTEND_PORT:-3000}"
FRONTEND_HOSTNAME="${FRONTEND_HOSTNAME:-0.0.0.0}"
NODE_ENV="${NODE_ENV:-production}"

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8484}"
NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-/api/bff}"

: "${NEXTAUTH_URL:?NEXTAUTH_URL is required}"
: "${NEXTAUTH_SECRET:?NEXTAUTH_SECRET is required}"
: "${KEYCLOAK_CLIENT_ID:?KEYCLOAK_CLIENT_ID is required}"
: "${KEYCLOAK_CLIENT_SECRET:?KEYCLOAK_CLIENT_SECRET is required}"
: "${KEYCLOAK_ISSUER:?KEYCLOAK_ISSUER is required}"

BFF_ALLOWED_ORIGINS="${BFF_ALLOWED_ORIGINS:-http://172.16.0.3:3000,http://localhost:3000}"
NEXT_PUBLIC_KARAVAN_URL="${NEXT_PUBLIC_KARAVAN_URL:-http://localhost:8081}"
NEXT_PUBLIC_HAWTIO_URL="${NEXT_PUBLIC_HAWTIO_URL:-https://camel.hawt.io/online/login?redirectUri=http%3A%2F%2Fcamel.hawt.io%2Fonline%2F}"

echo "Stopping old frontend if running..."

if [ -f "${PID_FILE}" ]; then
  OLD_PID="$(cat "${PID_FILE}" || true)"

  if [ -n "${OLD_PID}" ] && kill -0 "${OLD_PID}" 2>/dev/null; then
    echo "Stopping old frontend process ${OLD_PID}..."
    kill "${OLD_PID}" || true
    sleep 8

    if kill -0 "${OLD_PID}" 2>/dev/null; then
      echo "Force stopping old frontend process ${OLD_PID}..."
      kill -9 "${OLD_PID}" || true
      sleep 2
    fi
  fi

  rm -f "${PID_FILE}"
fi

echo "Clearing nohup logs..."
: > "${LOG_DIR}/frontend.out.log"
: > "${LOG_DIR}/frontend.err.log"

echo "Starting frontend on port ${FRONTEND_PORT}..."

cd "${CURRENT_DIR}"

nohup env \
  NODE_ENV="${NODE_ENV}" \
  PORT="${FRONTEND_PORT}" \
  HOSTNAME="${FRONTEND_HOSTNAME}" \
  BACKEND_URL="${BACKEND_URL}" \
  NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL}" \
  BFF_ALLOWED_ORIGINS="${BFF_ALLOWED_ORIGINS}" \
  NEXT_PUBLIC_KARAVAN_URL="${NEXT_PUBLIC_KARAVAN_URL}" \
  NEXT_PUBLIC_HAWTIO_URL="${NEXT_PUBLIC_HAWTIO_URL}" \
  NEXTAUTH_URL="${NEXTAUTH_URL}" \
  NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
  KEYCLOAK_CLIENT_ID="${KEYCLOAK_CLIENT_ID}" \
  KEYCLOAK_CLIENT_SECRET="${KEYCLOAK_CLIENT_SECRET}" \
  KEYCLOAK_ISSUER="${KEYCLOAK_ISSUER}" \
  node server.js \
  > "${LOG_DIR}/frontend.out.log" 2> "${LOG_DIR}/frontend.err.log" &

echo $! > "${PID_FILE}"

NEW_PID="$(cat "${PID_FILE}")"

echo "Frontend started with PID ${NEW_PID}"
echo "Waiting for frontend to become ready on port ${FRONTEND_PORT}..."

for i in $(seq 1 60); do
  if curl -fsS "http://localhost:${FRONTEND_PORT}" >/dev/null; then
    echo "Frontend health check passed."
    echo "Frontend is running at http://localhost:${FRONTEND_PORT}"
    exit 0
  fi

  if ! kill -0 "${NEW_PID}" 2>/dev/null; then
    echo "Frontend process exited before becoming ready."
    echo "Check logs:"
    echo "  ${LOG_DIR}/frontend.out.log"
    echo "  ${LOG_DIR}/frontend.err.log"
    exit 1
  fi

  echo "Frontend not ready yet... attempt ${i}/60"
  sleep 2
done

echo "Frontend health check failed after waiting 120 seconds."
echo "Process is still running: ${NEW_PID}"
echo "Check logs:"
echo "  ${LOG_DIR}/frontend.out.log"
echo "  ${LOG_DIR}/frontend.err.log"
exit 1