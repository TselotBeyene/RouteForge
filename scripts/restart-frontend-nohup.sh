#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-start}"

RUNTIME_DIR="/home/test/tselot_Studio/frontend"
CURRENT_DIR="${RUNTIME_DIR}/current"
PID_FILE="${RUNTIME_DIR}/app.pid"
LOG_DIR="${RUNTIME_DIR}/logs"
LOG_FILE="${LOG_DIR}/frontend.log"
ENV_FILE="${RUNTIME_DIR}/frontend.env"

mkdir -p "${LOG_DIR}"

log() {
  echo "$1" | tee -a "${LOG_FILE}"
}

load_env() {
  if [ ! -f "${ENV_FILE}" ]; then
    log "ERROR: Frontend env file not found: ${ENV_FILE}"
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
}

stop_frontend() {
  if [ -f "${PID_FILE}" ]; then
    OLD_PID="$(cat "${PID_FILE}" || true)"

    if [ -n "${OLD_PID}" ] && kill -0 "${OLD_PID}" 2>/dev/null; then
      log "Stopping old frontend process ${OLD_PID}..."
      kill "${OLD_PID}" || true
      sleep 8

      if kill -0 "${OLD_PID}" 2>/dev/null; then
        log "Force stopping old frontend process ${OLD_PID}..."
        kill -9 "${OLD_PID}" || true
      fi
    fi

    rm -f "${PID_FILE}"
  fi

  if command -v fuser >/dev/null 2>&1; then
    fuser -k 3000/tcp >/dev/null 2>&1 || true
  fi
}

if [ "${ACTION}" = "stop-clean" ]; then
  rm -f "${LOG_FILE}"
  touch "${LOG_FILE}"

  log "Stopping old frontend and cleaning previous deployment..."

  stop_frontend

  rm -rf "${CURRENT_DIR}"
  rm -f "${RUNTIME_DIR}/frontend-standalone.tar.gz"
  rm -f "${RUNTIME_DIR}/frontend-deploy.tar.gz"
  rm -f "${LOG_DIR}/frontend.out.log"
  rm -f "${LOG_DIR}/frontend.err.log"
  rm -f "${LOG_DIR}"/*.log.gz 2>/dev/null || true

  log "Old frontend stopped. Old current deployment and logs removed."
  exit 0
fi

if [ "${ACTION}" != "start" ]; then
  echo "Usage: $0 {start|stop-clean}"
  exit 1
fi

rm -f "${LOG_FILE}"
touch "${LOG_FILE}"

load_env

if [ ! -d "${CURRENT_DIR}" ]; then
  log "ERROR: Frontend current directory not found: ${CURRENT_DIR}"
  exit 1
fi

if [ ! -f "${CURRENT_DIR}/server.js" ]; then
  log "ERROR: Next standalone server.js not found: ${CURRENT_DIR}/server.js"
  exit 1
fi

log "Starting frontend on port ${FRONTEND_PORT}..."

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
  >> "${LOG_FILE}" 2>&1 &

echo $! > "${PID_FILE}"

NEW_PID="$(cat "${PID_FILE}")"

log "Frontend started with PID ${NEW_PID}"
log "Waiting for frontend health check..."

for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${FRONTEND_PORT}/login?loggedOut=1" >/dev/null 2>&1; then
    log "Frontend health check passed."
    log "Frontend is running at http://172.16.0.3:${FRONTEND_PORT}"
    exit 0
  fi

  if ! kill -0 "${NEW_PID}" 2>/dev/null; then
    log "Frontend process exited before becoming ready."
    log "Check log: ${LOG_FILE}"
    exit 1
  fi

  log "Frontend not ready yet... attempt ${i}/60"
  sleep 2
done

log "Frontend health check failed after waiting."
log "Check log: ${LOG_FILE}"
exit 1
