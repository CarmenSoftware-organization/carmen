#!/bin/bash
find /Users/peak/Documents/GitHub/carmen/docs/app -type f -name "*.md" | grep -v template-guide | head -20 | while read f; do
  if ! grep -q "## Document History" "$f"; then
    echo "$f"
  fi
done
