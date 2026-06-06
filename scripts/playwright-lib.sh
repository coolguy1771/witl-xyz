# shellcheck shell=bash

find_node() {
  if [[ -n "${PLAYWRIGHT_NODE:-}" && -x "${PLAYWRIGHT_NODE}" ]]; then
    echo "${PLAYWRIGHT_NODE}"
    return
  fi

  local cursor_node candidate home="${HOME:-}"
  if [[ -n "$home" ]]; then
    cursor_node="$(
      find "$home/.cursor-server/bin" -maxdepth 2 -name node -type f 2>/dev/null |
        head -n 1 || true
    )"
  fi
  if [[ -n "$cursor_node" && -x "$cursor_node" ]]; then
    echo "$cursor_node"
    return
  fi

  if [[ -x /usr/bin/node ]]; then
    echo /usr/bin/node
    return
  fi

  if command -v node >/dev/null 2>&1; then
    candidate="$(command -v node)"
    if [[ "$candidate" != /snap/* ]]; then
      echo "$candidate"
      return
    fi
  fi

  return 1
}

snap_confined() {
  [[ -n "${PLAYWRIGHT_SNAP_ESCAPE:-}" ]] && return 1
  [[ -n "${SNAP:-}" ]] && return 0
  grep -qE 'snap\.|/snap/' /proc/self/cgroup 2>/dev/null
}

maybe_reexec_outside_snap() {
  local root="$1"
  local script_path="$2"
  shift 2

  if ! snap_confined; then
    return 0
  fi

  if ! command -v systemd-run >/dev/null 2>&1; then
    echo "Playwright cannot launch Chromium under snap confinement." >&2
    echo "Run: bash ${script_path} $*" >&2
    echo "Or install Node outside snap (e.g., /usr/bin/node or set PLAYWRIGHT_NODE)." >&2
    exit 1
  fi

  local browsers_path="${PLAYWRIGHT_BROWSERS_PATH:-$root/.playwright-browsers}"
  local unit_args=(
    --user
    --wait
    --collect
    --working-directory="$root"
    --setenv=PLAYWRIGHT_SNAP_ESCAPE=1
    --setenv=PLAYWRIGHT_BROWSERS_PATH="$browsers_path"
  )

  if [[ -n "${PLAYWRIGHT_NODE:-}" ]]; then
    unit_args+=(--setenv=PLAYWRIGHT_NODE="$PLAYWRIGHT_NODE")
  fi
  if [[ -n "${CI:-}" ]]; then
    unit_args+=(--setenv=CI="$CI")
  fi

  exec systemd-run "${unit_args[@]}" /bin/bash "$script_path" "$@"
}
