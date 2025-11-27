#!/usr/bin/env python3
"""
Fix remaining BR files with Document History separator issues
Target: Remove '---' that appears after Document History table ending with "Initial version"
"""

from pathlib import Path
import re

# Remaining files with errors (from check output)
remaining_files = [
    "/Users/peak/Documents/GitHub/carmen/docs/app/finance/currency-management/BR-currency-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/finance/department-management/BR-department-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/finance/exchange-rate-management/BR-exchange-rate-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/inventory-transactions/BR-inventory-transactions.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/period-end/BR-period-end.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/physical-count-management/BR-physical-count-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/spot-check/BR-spot-check.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/inventory-management/stock-in/BR-stock-in.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/credit-note/BR-credit-note.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/goods-received-notes/BR-goods-received-note.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/my-approvals/BR-my-approvals.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/purchase-orders/BR-purchase-orders.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/procurement/purchase-request-templates/BR-purchase-request-templates.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/categories/BR-categories.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/products/BR-products.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/product-management/units/BR-units.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/shared-methods/inventory-valuation/BR-inventory-valuation.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/store-operations/wastage-reporting/BR-wastage-reporting.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/template-guide/BR-template.md",
]

def fix_file(file_path):
    """Remove '---' after Document History table"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        fixed_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            fixed_lines.append(line)

            # Check if this line is the last row of Document History table
            if '| 1.0.0 |' in line and 'Initial version' in line:
                # Look ahead for the '---' separator
                if i + 1 < len(lines) and lines[i+1].strip() == '':
                    # Blank line after table
                    fixed_lines.append(lines[i+1])
                    i += 1
                    if i + 1 < len(lines) and lines[i+1].strip() == '---':
                        # Skip the '---' line
                        i += 2  # Skip both blank line and '---'
                        continue

            i += 1

        # Write back if changed
        if ''.join(fixed_lines) != ''.join(lines):
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(fixed_lines)
            return True
        return False

    except Exception as e:
        print(f"   Error: {e}")
        return False

def main():
    print("FIXING REMAINING BR FILES")
    print("="*80)

    fixed = 0
    skipped = 0

    for file_path in remaining_files:
        path_obj = Path(file_path)
        if not path_obj.exists():
            print(f"⚠️  Not found: {path_obj.name}")
            continue

        if fix_file(file_path):
            fixed += 1
            print(f"✅ {path_obj.relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))}")
        else:
            skipped += 1
            print(f"⏭️  {path_obj.name}")

    print(f"\n{'='*80}")
    print(f"Fixed: {fixed}, Skipped: {skipped}")

if __name__ == "__main__":
    main()
