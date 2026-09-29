#!/usr/bin/env bash
set -euo pipefail
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
script="$dir/guard-test-assertions.py"
if python3 -c "import sys" >/dev/null 2>&1; then
  exec python3 "$script"
fi
exec python "$script"
