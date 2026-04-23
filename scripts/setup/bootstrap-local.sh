#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
START_SERVICES=false

if [[ "${1:-}" == "--start" ]]; then
  START_SERVICES=true
fi

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[error] required command not found: $cmd"
    exit 1
  fi
}

require_node_major() {
  local min_major="$1"
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "$major" -lt "$min_major" ]]; then
    echo "[error] Node.js ${min_major}+ is required. Found: $(node -v)"
    exit 1
  fi
}

require_pnpm_major() {
  local min_major="$1"
  local major
  major="$(pnpm -v | awk -F. '{print $1}')"
  if [[ "$major" -lt "$min_major" ]]; then
    echo "[error] pnpm ${min_major}+ is required. Found: $(pnpm -v)"
    exit 1
  fi
}

copy_if_missing() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "$dst" ]]; then
    cp "$src" "$dst"
    echo "[ok] created $dst"
  else
    echo "[ok] keeping existing $dst"
  fi
}

echo "[info] validating local prerequisites"
need_cmd node
need_cmd pnpm
need_cmd docker
need_cmd supabase
require_node_major 20
require_pnpm_major 10

if ! command -v go >/dev/null 2>&1; then
  echo "[warn] Go not found. Worker local run will be unavailable until Go is installed."
fi

echo "[info] installing dependencies"
cd "$ROOT_DIR"
pnpm install

echo "[info] preparing local environment files"
copy_if_missing "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"
copy_if_missing "$ROOT_DIR/packages/web/.env.example" "$ROOT_DIR/packages/web/.env.local"

echo ""
echo "[next] fill Supabase keys in:"
echo "  - $ROOT_DIR/.env.local"
echo "  - $ROOT_DIR/packages/web/.env.local"

echo ""
echo "[next] start local dependencies and app"
echo "  supabase start"
echo "  cd packages/web && pnpm dev"
echo ""
echo "[optional] run worker"
echo "  cd packages/worker && go run ./cmd/worker"

if [[ "$START_SERVICES" == true ]]; then
  echo ""
  echo "[info] starting Supabase"
  supabase start
  echo "[info] starting web app"
  (cd "$ROOT_DIR/packages/web" && pnpm dev)
fi
