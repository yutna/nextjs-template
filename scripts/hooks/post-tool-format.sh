#!/bin/bash
set -euo pipefail

# Auto-format files after editing tools run.
# Receives JSON on stdin with tool_name and tool_input.
# Always returns {"continue": true} so the session is never blocked.

output_continue() {
  echo '{"continue": true}'
  exit 0
}

trap output_continue ERR

INPUT=$(cat 2>/dev/null) || INPUT=""

if [ -z "$INPUT" ]; then
  output_continue
fi

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null) || true

# Only act on file-editing tools
case "$TOOL_NAME" in
  editFiles|create_file|write_to_file|edit|create|write|insert|replace|update_file|upsert_file)
    ;;
  *)
    output_continue
    ;;
esac

# Extract file path from tool_input — try common key names
FILE_PATH=""
for key in path file_path filePath file destination target filename; do
  FILE_PATH=$(echo "$INPUT" | jq -r ".tool_input.${key} // empty" 2>/dev/null) || true
  if [ -n "$FILE_PATH" ]; then
    break
  fi
done

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  output_continue
fi

# Run prettier on the file; ignore failures
npx prettier --write "$FILE_PATH" >/dev/null 2>&1 || true

output_continue
