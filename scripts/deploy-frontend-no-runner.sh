#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="172.16.0.3"
DEPLOY_USER="test"
RUNTIME_DIR="/home/test/tselot_Studio/frontend"
ARCHIVE_NAME="frontend-standalone.tar.gz"

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
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p ${RUNTIME_DIR}/logs"

echo "Uploading frontend package..."
scp "${ARCHIVE_NAME}" "${DEPLOY_USER}@${DEPLOY_HOST}:${RUNTIME_DIR}/${ARCHIVE_NAME}"

echo "Uploading restart script..."
scp "scripts/restart-frontend-nohup.sh" "${DEPLOY_USER}@${DEPLOY_HOST}:${RUNTIME_DIR}/restart-frontend-nohup.sh"

echo "Extracting and restarting frontend on server..."
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "
  set -e
  cd ${RUNTIME_DIR}
  rm -rf current
  tar -xzf ${ARCHIVE_NAME}
  chmod +x restart-frontend-nohup.sh
  ./restart-frontend-nohup.sh
"

echo "Frontend deployment complete."
echo "Open: http://${DEPLOY_HOST}:3000"
