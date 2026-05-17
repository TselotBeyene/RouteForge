#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="/home/test/tselot_Studio/frontend"
CURRENT_DIR="${RUNTIME_DIR}/current"
PID_FILE="${RUNTIME_DIR}/app.pid"
LOG_DIR="${RUNTIME_DIR}/logs"
ENV_FILE="${RUNTIME_DIR}/frontend.env"

mkdir -p "${LOG_DIR}"

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

echo "Stopping old frontend if running..."

if [ -f "${PID_FILE}" ]; then
  OLD_PID="$(cat "${PID_FILE}" || true)"

  if [ -n "${OLD_PID}" ] && kill -0 "${OLD_PID}" 2>/dev/null; then
    echo "Stopping process ${OLD_PID}..."
    kill "${OLD_PID}" || true
    sleep 5

    if kill -0 "${OLD_PID}" 2>/dev/null; then
      echo "Force stopping process ${OLD_PID}..."
      kill -9 "${OLD_PID}" || true
    fi
  fi

  rm -f "${PID_FILE}"
fi

echo "Starting frontend with nohup..."

cd "${CURRENT_DIR}"

nohup env \
  NODE_ENV="${NODE_ENV}" \
  PORT="${FRONTEND_PORT}" \
  HOSTNAME="${FRONTEND_HOSTNAME}" \
  node server.js \
  > "${LOG_DIR}/frontend.out.log" 2> "${LOG_DIR}/frontend.err.log" &

echo $! > "${PID_FILE}"

echo "Frontend started with PID $(cat "${PID_FILE}")"

sleep 5

echo "Checking frontend..."

if curl -fsS "http://localhost:${FRONTEND_PORT}" >/dev/null; then
  echo "Frontend health check passed."
else
  echo "Frontend health check failed."
  echo "Check logs:"
  echo "${LOG_DIR}/frontend.out.log"
  echo "${LOG_DIR}/frontend.err.log"
  exit 1
fi
