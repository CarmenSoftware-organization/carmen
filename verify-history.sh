#!/bin/bash
echo "Verifying Document History coverage..."
echo "---"

total=$(find /Users/peak/Documents/GitHub/carmen/docs/app -type f -name "*.md" | grep -v template-guide | wc -l)
with_history=$(find /Users/peak/Documents/GitHub/carmen/docs/app -type f -name "*.md" | grep -v template-guide | xargs grep -l "## Document History" 2>/dev/null | wc -l)
without_history=$((total - with_history))

echo "Total documentation files: $total"
echo "Files with Document History: $with_history"
echo "Files without Document History: $without_history"

if [ $without_history -eq 0 ]; then
    echo "✅ All documentation files have Document History section!"
else
    echo "❌ Some files are missing Document History section"
    echo "Files without Document History:"
    find /Users/peak/Documents/GitHub/carmen/docs/app -type f -name "*.md" | grep -v template-guide | while read f; do
        if ! grep -q "## Document History" "$f" 2>/dev/null; then
            echo "  - $f"
        fi
    done
fi
