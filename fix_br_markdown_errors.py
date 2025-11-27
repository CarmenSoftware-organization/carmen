#!/usr/bin/env python3
"""
Fix markdown format errors in all BR-*.md files
Remove '---' separator after Document History tables
"""

import re
from pathlib import Path

# Files that need fixing (from check script)
files_to_fix = [
    "/Users/peak/Documents/GitHub/carmen/docs/app/finance/account-code-mapping/BR-account-code-mapping.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/finance/currency-management/BR-currency-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/finance/department-management/BR-department-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/finance/exchange-rate-management/BR-exchange-rate-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/fractional-inventory/BR-fractional-inventory.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/inventory-adjustments/BR-inventory-adjustments.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/inventory-overview/BR-inventory-overview.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/inventory-transactions/BR-inventory-transactions.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/lot-based-costing/BR-lot-based-costing.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/period-end/BR-period-end.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/physical-count-management/BR-physical-count-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/spot-check/BR-spot-check.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/stock-in/BR-stock-in.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/stock-overview/BR-stock-overview.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/menu-engineering/BR-menu-engineering.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/recipe-management/categories/BR-categories.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/recipe-management/cuisine-types/BR-cuisine-types.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/operational-planning/recipe-management/recipes/BR-recipes.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/credit-note/BR-credit-note.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/goods-received-notes/BR-goods-received-note.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/my-approvals/BR-my-approvals.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/purchase-orders/BR-purchase-orders.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/purchase-request-templates/BR-purchase-request-templates.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/purchase-requests/BR-purchase-requests.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/categories/BR-categories.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/products/BR-products.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/units/BR-units.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/shared-methods/inventory-valuation/BR-inventory-valuation.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/store-operations/stock-replenishment/BR-stock-replenishment.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/store-operations/store-requisitions/BR-store-requisitions.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/store-operations/wastage-reporting/BR-wastage-reporting.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/BR-system-administration.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/business-rules/BR-business-rules.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/monitoring/BR-monitoring.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/permission-management/BR-permission-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/settings/BR-settings.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/system-integrations/BR-system-integrations.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/user-management/BR-user-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/workflow/BR-workflow.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/template-guide/BR-template.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/price-lists/BR-price-lists.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/pricelist-templates/BR-pricelist-templates.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/requests-for-pricing/BR-requests-for-pricing.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-directory/BR-vendor-directory.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-portal/BR-vendor-portal.md",
]

def fix_markdown_format(file_path):
    """Fix markdown format by removing '---' after tables"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        lines = content.split('\n')
        fixed_lines = []
        skip_next_separator = False

        for i, line in enumerate(lines):
            # Check if previous line was a table row (contains pipes)
            if i > 0 and '|' in lines[i-1]:
                # If current line is '---' (separator, not table header separator)
                if line.strip() == '---' and not lines[i-1].strip().startswith('|---'):
                    # Skip this line (don't add to fixed_lines)
                    continue

            fixed_lines.append(line)

        if fixed_lines != lines:
            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(fixed_lines))
            return True, "Fixed"
        else:
            return False, "No changes needed"

    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("FIXING MARKDOWN FORMAT ERRORS IN BR FILES")
    print("="*80)
    print(f"Processing {len(files_to_fix)} files...\n")

    fixed_count = 0
    error_count = 0
    skipped_count = 0

    for file_path in files_to_fix:
        path_obj = Path(file_path)
        rel_path = path_obj.relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))

        success, message = fix_markdown_format(file_path)

        if success:
            fixed_count += 1
            print(f"✅ {rel_path}")
        elif "Error" in message:
            error_count += 1
            print(f"❌ {rel_path}")
            print(f"   {message}")
        else:
            skipped_count += 1
            print(f"⏭️  {rel_path} - {message}")

    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total files processed: {len(files_to_fix)}")
    print(f"✅ Fixed: {fixed_count}")
    print(f"❌ Errors: {error_count}")
    print(f"⏭️  Skipped: {skipped_count}")

if __name__ == "__main__":
    main()
