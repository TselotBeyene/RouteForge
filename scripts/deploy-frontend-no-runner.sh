#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="172.16.0.3"
DEPLOY_USER="test"
DEPLOY_PASSWORD="test@1234"

RUNTIME_DIR="/home/test/tselot_Studio/frontend"
ARCHIVE_NAME="frontend-standalone.tar.gz"

echo "Loading frontend.env from server before build..."

TMP_ENV_FILE=".frontend.remote.env"

if sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" "test -f ${RUNTIME_DIR}/frontend.env"; then
  sshpass -p "${DEPLOY_PASSWORD}" scp -o StrictHostKeyChecking=no \
    "${DEPLOY_USER}@${DEPLOY_HOST}:${RUNTIME_DIR}/frontend.env" "${TMP_ENV_FILE}"

  set -a
  . "./${TMP_ENV_FILE}"
  set +a

  rm -f "${TMP_ENV_FILE}"
else
  echo "WARNING: Remote frontend.env not found. Using default backend URL."
fi

export BACKEND_URL="${BACKEND_URL:-${FRONTEND_BACKEND_URL:-${NEXT_PUBLIC_API_BASE_URL:-http://127.0.0.1:8484}}}"
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-${BACKEND_URL}}"

echo "Frontend will build using backend URL: ${BACKEND_URL}"

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

if [ ! -d ".next/standalone" ]; then
  echo "ERROR: .next/standalone was not generated."
  echo "Make sure next.config.ts contains: output: \"standalone\""
  exit 1
fi

echo "Preparing standalone package..."
rm -rf deploy-output "${ARCHIVE_NAME}"
mkdir -p deploy-output/current

cp -R .next/standalone/. deploy-output/current/

mkdir -p deploy-output/current/.next
cp -R .next/static deploy-output/current/.next/static

if [ -d "public" ]; then
  cp -R public deploy-output/current/public
fi

tar -czf "${ARCHIVE_NAME}" -C deploy-output current

echo "Creating remote frontend directory..."
sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "mkdir -p ${RUNTIME_DIR}/logs"

echo "Uploading frontend package..."
sshpass -p "${DEPLOY_PASSWORD}" scp -o StrictHostKeyChecking=no "${ARCHIVE_NAME}" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${RUNTIME_DIR}/${ARCHIVE_NAME}"

echo "Uploading restart script..."
sshpass -p "${DEPLOY_PASSWORD}" scp -o StrictHostKeyChecking=no "scripts/restart-frontend-nohup.sh" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${RUNTIME_DIR}/restart-frontend-nohup.sh"

echo "Extracting and restarting frontend on server..."
sshpass -p "${DEPLOY_PASSWORD}" ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" "
  set -e
  cd ${RUNTIME_DIR}
  rm -rf current
  tar -xzf ${ARCHIVE_NAME}
  chmod +x restart-frontend-nohup.sh
  ./restart-frontend-nohup.sh
"

echo "Frontend deployment complete."
echo "Frontend URL: http://${DEPLOY_HOST}:3000"