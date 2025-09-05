#!/usr/bin/env bash
# Basic terminal check script
set -euo pipefail

OUT_FILE="tools/terminal-check-output.txt"
echo "Terminal check report - $(date)" > "$OUT_FILE"

echo "Detecting shell..." | tee -a "$OUT_FILE"
echo "SHELL=$SHELL" | tee -a "$OUT_FILE"
echo "BASH_VERSION=${BASH_VERSION-}" | tee -a "$OUT_FILE"

echo "Checking git and bash on PATH..." | tee -a "$OUT_FILE"
command -v git >/dev/null 2>&1 && echo "git: $(command -v git)" | tee -a "$OUT_FILE" || echo "git: not found on PATH" | tee -a "$OUT_FILE"
command -v bash >/dev/null 2>&1 && echo "bash: $(command -v bash)" | tee -a "$OUT_FILE" || echo "bash: not found on PATH" | tee -a "$OUT_FILE"

echo "Running short timed output test..." | tee -a "$OUT_FILE"
for i in 1 2 3; do
  echo "tick $i $(date +%T)" | tee -a "$OUT_FILE"
  sleep 1
done
echo "done" | tee -a "$OUT_FILE"

echo "Report saved to $OUT_FILE"
