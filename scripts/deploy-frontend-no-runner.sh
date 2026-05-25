#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="172.16.0.3"
DEPLOY_USER="test"
DEPLOY_PASSWORD="test@1234"

RUNTIME_DIR="/home/test/tselot_Studio/frontend"
REMOTE_RESTART="${RUNTIME_DIR}/restart-frontend-nohup.sh"
ARCHIVE_NAME="frontend-standalone.tar.gz"

TMP_DIR="$(mktemp -d)"
PACKAGE_DIR="${TMP_DIR}/package"
ARCHIVE_PATH="${TMP_DIR}/${ARCHIVE_NAME}"
TMP_ENV_FILE="${TMP_DIR}/frontend.env"

cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

if ! command -v sshpass >/dev/null 2>&1; then
  echo "ERROR: sshpass is required."
  echo "Install it with:"
  echo "brew install hudochenkov/sshpass/sshpass"
  exit 1
fi

echo "Loading frontend.env from server before build..."

if sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" "test -f ${RUNTIME_DIR}/frontend.env"; then
  sshpass -p "${DEPLOY_PASSWORD}" scp -o StrictHostKeyChecking=no \
    "${DEPLOY_USER}@${DEPLOY_HOST}:${RUNTIME_DIR}/frontend.env" "${TMP_ENV_FILE}"

  set -a
  . "${TMP_ENV_FILE}"
  set +a
else
  echo "WARNING: Remote frontend.env not found. Build will use local/default env."
fi

export BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8484}"
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-/api/bff}"

echo "Frontend build env:"
echo "  BACKEND_URL=${BACKEND_URL}"
echo "  NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}"

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

if [ ! -d ".next/standalone" ]; then
  echo "ERROR: .next/standalone was not generated."
  echo "Make sure next.config.ts contains: output: \"standalone\""
  exit 1
fi

if [ ! -f "scripts/restart-frontend-nohup.sh" ]; then
  echo "ERROR: scripts/restart-frontend-nohup.sh not found."
  exit 1
fi

echo "Preparing frontend deployment package in temporary directory..."

mkdir -p "${PACKAGE_DIR}/current"

cp -R .next/standalone/. "${PACKAGE_DIR}/current/"

mkdir -p "${PACKAGE_DIR}/current/.next"
cp -R .next/static "${PACKAGE_DIR}/current/.next/static"

if [ -d "public" ]; then
  cp -R public "${PACKAGE_DIR}/current/public"
fi

find "${PACKAGE_DIR}" -name "._*" -delete

COPYFILE_DISABLE=1 tar -czf "${ARCHIVE_PATH}" -C "${PACKAGE_DIR}" current

echo "Preparing frontend directory on server..."
sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" "
  mkdir -p ${RUNTIME_DIR}/logs
"

echo "Uploading restart script..."
sshpass -p "${DEPLOY_PASSWORD}" scp -o StrictHostKeyChecking=no \
  scripts/restart-frontend-nohup.sh \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_RESTART}"

echo "Stopping old frontend and cleaning old files..."
sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" "
  cd ${RUNTIME_DIR}
  chmod +x restart-frontend-nohup.sh
  ./restart-frontend-nohup.sh stop-clean
"

echo "Uploading new frontend package..."
sshpass -p "${DEPLOY_PASSWORD}" scp -o StrictHostKeyChecking=no \
  "${ARCHIVE_PATH}" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${RUNTIME_DIR}/${ARCHIVE_NAME}"

echo "Extracting new frontend package..."
sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" "
  cd ${RUNTIME_DIR}
  tar -xzf ${ARCHIVE_NAME}
  rm -f ${ARCHIVE_NAME}
"

echo "Starting new frontend..."
sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" "
  cd ${RUNTIME_DIR}
  ./restart-frontend-nohup.sh start
"

echo "Frontend deployment complete."
echo "Frontend URL: http://${DEPLOY_HOST}:3000"
echo "Log file: ${RUNTIME_DIR}/logs/frontend.log"