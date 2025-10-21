#!/bin/bash

# Script to update internal links in markdown files after documentation reorganization
# Updates old structure paths to new numbered structure

echo "Updating internal links in markdown files..."

# Function to update links in a directory
update_links() {
    find "$1" -name "*.md" -type f | while read -r file; do
        echo "Processing: $file"

        # Module links from 04-modules context
        sed -i '' 's|\.\./pr/|./procurement/purchase-requests/|g' "$file"
        sed -i '' 's|\.\./po/|./procurement/purchase-orders/|g' "$file"
        sed -i '' 's|\.\./grn/|./procurement/goods-received-notes/|g' "$file"
        sed -i '' 's|\.\./cn/|./procurement/credit-notes/|g' "$file"
        sed -i '' 's|\.\./prt/|./procurement/templates/|g' "$file"
        sed -i '' 's|\.\./inv/|./inventory/stock-management/|g' "$file"
        sed -i '' 's|\.\./inventory/|./inventory/stock-management/|g' "$file"
        sed -i '' 's|\.\./pc/|./inventory/physical-count/|g' "$file"
        sed -i '' 's|\.\./sc/|./inventory/spot-check/|g' "$file"
        sed -i '' 's|\.\./vm/|./vendor-management/|g' "$file"
        sed -i '' 's|\.\./pm/|./product-management/|g' "$file"
        sed -i '' 's|\.\./so/|./store-operations/|g' "$file"
        sed -i '' 's|\.\./store-ops/|./store-operations/|g' "$file"
        sed -i '' 's|\.\./op/|./operational-planning/|g' "$file"
        sed -i '' 's|\.\./operational-planning/|./operational-planning/|g' "$file"
        sed -i '' 's|\.\./sa/|./system-administration/|g' "$file"
        sed -i '' 's|\.\./reporting/|./reporting/|g' "$file"
        sed -i '' 's|\.\./dashboard/|./dashboard/|g' "$file"
        sed -i '' 's|\.\./production/|./production/|g' "$file"

        # Top-level section links
        sed -i '' 's|\.\./architecture/SYSTEM-ARCHITECTURE\.md|../02-architecture/system-architecture.md|g' "$file"
        sed -i '' 's|\.\./api/|../06-api-reference/|g' "$file"
        sed -i '' 's|\.\./development/|../07-development/|g' "$file"

        # Overview section links
        sed -i '' 's|\.\./SYSTEM-DOCUMENTATION-INDEX\.md|./README.md|g' "$file"
        sed -i '' 's|\.\./SYSTEM-GAPS-AND-ROADMAP\.md|./system-gaps-roadmap.md|g' "$file"
        sed -i '' 's|\.\./DOCUMENTATION-SUMMARY-REPORT\.md|./documentation-summary.md|g' "$file"
        sed -i '' 's|\.\./MODULE-VERIFICATION-REPORT\.md|./module-verification.md|g' "$file"

    done
}

# Update links in all new directories
update_links "01-overview"
update_links "02-architecture"
update_links "03-data-model"
update_links "04-modules"
update_links "05-cross-cutting"
update_links "06-api-reference"
update_links "07-development"
update_links "08-reference"

echo "Link update complete!"
