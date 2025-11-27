#!/bin/bash
echo "Checking all vendor portal related files..."
echo "==========================================="
echo ""

find /Users/peak/Documents/GitHub/carmen/docs -type f -path "*vendor*" -name "*.md" | grep -i portal | while read file; do
  if grep -q "## Document History" "$file" 2>/dev/null; then
    echo "✅ $(basename "$file")"
  else
    echo "❌ $(basename "$file") - Missing Document History"
    echo "   Path: $file"
  fi
done

echo ""
echo "==========================================="
