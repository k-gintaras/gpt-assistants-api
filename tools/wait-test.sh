#!/usr/bin/env bash
OUT="/c/Users/emnom/Desktop/github-projects/codator/tools/wait-test-output.txt"
echo "RUN START $(date +%s)" > "$OUT"
for n in 1 2 3; do
  echo "TEST $n START $(date +%s)" >> "$OUT"
  sleep $n
  echo "TEST $n END $(date +%s)" >> "$OUT"
done
echo "RUN END $(date +%s)" >> "$OUT"
echo "Wrote $OUT"
