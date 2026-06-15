#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

export DEMO_MODE=true
export NEXT_PUBLIC_DEMO_MODE=true
export NEXTAUTH_SECRET=screenshot-secret
export NEXTAUTH_URL=http://127.0.0.1:3000
export KEYCLOAK_ISSUER=http://127.0.0.1:8080/realms/routeforge
export KEYCLOAK_CLIENT_ID=demo
export KEYCLOAK_CLIENT_SECRET=demo
export BACKEND_URL=http://127.0.0.1:8484

mkdir -p docs/screenshots

pnpm run dev --port 3000 --hostname 127.0.0.1 &
DEV_PID=$!

cleanup() {
  kill "$DEV_PID" 2>/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:3000/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

npx --yes playwright install chromium

capture() {
  local url="$1"
  local out="$2"
  npx --yes playwright screenshot "$url" "$out" --viewport-size=1440,900 --wait-for-timeout=3000
}

capture "http://127.0.0.1:3000/" "docs/screenshots/home.png"
capture "http://127.0.0.1:3000/integrations" "docs/screenshots/integrations.png"
capture "http://127.0.0.1:3000/schemas" "docs/screenshots/schemas.png"
capture "file://${ROOT}/keycloak/theme-preview.html" "docs/screenshots/login-theme.png"

echo "Screenshots saved to docs/screenshots/"
