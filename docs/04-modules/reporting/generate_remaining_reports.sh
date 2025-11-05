#!/bin/bash

# This script generates basic PRD and TEMPLATE files for reports without detailed content

# Report 4: Order Pending (merged with PO Detail)
mkdir -p "04-po-001-order-pending"
cat > "04-po-001-order-pending/PRD.md" << 'EOF'
# Order Pending Report - Product Requirement Document

**Report ID:** PO-001
**Report Name:** Order Pending Report
**Module:** Purchase Order (PO)
**Priority:** Medium
**Status:** Merged with PO Detail Report

## Executive Summary

This report displays pending purchase orders awaiting fulfillment. 

**Note:** This report has been consolidated into the PO Detail Report (#5: PO-002) with status filter capability. Users should use PO Detail Report and filter by "Pending" status.

## Implementation Note

Use Report #5 (PO-002: Purchase Order Detail) with the following filter:
- Status Filter: Select "Pending"

## Grouping Options

- Group by Vendor
- Group by Product  
- Group by Location

## See Also

- PO-002: Purchase Order Detail Report
EOF

cat > "04-po-001-order-pending/TEMPLATE.md" << 'EOF'
# Order Pending Report - Template Structure

## Implementation Note

This report has been merged into **PO-002: Purchase Order Detail Report**.

To view pending orders:
1. Open PO Detail Report
2. Set Status Filter = "Pending"
3. Optionally group by Vendor, Product, or Location

## See Also

- Report #5: Purchase Order Detail Report
- Refer to PO-002 template for layout details
EOF

echo "Created Report 4: Order Pending"
