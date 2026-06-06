#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT/scripts/playwright.sh"
# shellcheck source=scripts/playwright-lib.sh
source "$ROOT/scripts/playwright-lib.sh"

export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$ROOT/.playwright-browsers}"

maybe_reexec_outside_snap "$ROOT" "$SCRIPT" "$@"

NODE_BIN="$(find_node)" || {
  echo "Could not find a Node.js binary for Playwright." >&2
  echo "Install Node.js or set PLAYWRIGHT_NODE to a non-snap node path." >&2
  exit 1
}

exec "$NODE_BIN" "$ROOT/node_modules/@playwright/test/cli.js" "$@"
