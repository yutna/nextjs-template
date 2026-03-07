#!/bin/bash
set -euo pipefail

# Run lint check before session ends.
# Returns a systemMessage warning if lint fails, but never blocks the session.

output_continue() {
  echo '{"continue": true}'
  exit 0
}

trap output_continue ERR

# Verify npm and the lint script are available
if ! command -v npm >/dev/null 2>&1; then
  output_continue
fi

if ! npm run --silent env 2>/dev/null | grep -q .; then
  # Fallback: check package.json for a lint script
  if [ ! -f "package.json" ] || ! grep -q '"lint"' package.json 2>/dev/null; then
    output_continue
  fi
fi

LINT_OUTPUT=$(npm run lint -- --quiet 2>&1 | tail -20) || true
LINT_EXIT=${PIPESTATUS[0]:-$?}

if [ "$LINT_EXIT" -eq 0 ] || [ -z "$LINT_OUTPUT" ]; then
  output_continue
fi

# Count error lines (lines containing "error" or file-path-like patterns)
ERROR_COUNT=$(echo "$LINT_OUTPUT" | grep -c -iE '(error|✖|✗)' 2>/dev/null) || ERROR_COUNT=0
FIRST_ERRORS=$(echo "$LINT_OUTPUT" | head -5 | sed 's/"/\\"/g' | tr '\n' ' ')

MESSAGE="Lint check found issues (approx ${ERROR_COUNT} errors). First few: ${FIRST_ERRORS}"

# Output valid JSON with systemMessage
cat <<EOF
{"continue": true, "systemMessage": "${MESSAGE}"}
EOF

exit 0
