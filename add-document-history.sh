#!/bin/bash

# Script to add Document History section to all documentation files
# that don't already have one

# Find all markdown files excluding templates
find /Users/peak/Documents/GitHub/carmen/docs/app -type f -name "*.md" | grep -v template-guide | while read -r file; do
    # Check if file already has "## Document History"
    if ! grep -q "## Document History" "$file"; then
        echo "Processing: $file"

        # Read the file content
        content=$(cat "$file")

        # Determine the insertion point
        # Look for common patterns: Status line, first ---, or after Module Information section

        if grep -q "**Status**:" "$file"; then
            # Insert after Status line
            awk '
            /\*\*Status\*\*:/ {
                print
                getline
                print ""
                print "## Document History"
                print ""
                print "| Version | Date | Author | Changes |"
                print "|---------|------|--------|---------|"
                print "| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |"
                print ""
                print
                next
            }
            {print}
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

        elif grep -q "^---$" "$file"; then
            # Insert before first --- separator
            awk '
            BEGIN { done=0 }
            /^---$/ && done==0 {
                print "## Document History"
                print ""
                print "| Version | Date | Author | Changes |"
                print "|---------|------|--------|---------|"
                print "| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |"
                print ""
                done=1
            }
            {print}
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

        else
            # Insert after the first heading
            awk '
            BEGIN { done=0 }
            /^#/ && done==0 {
                print
                getline
                print
                print "## Document History"
                print ""
                print "| Version | Date | Author | Changes |"
                print "|---------|------|--------|---------|"
                print "| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |"
                print ""
                done=1
                next
            }
            {print}
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        fi

        echo "✅ Added Document History to: $file"
    fi
done

echo ""
echo "✅ Document History update complete!"
