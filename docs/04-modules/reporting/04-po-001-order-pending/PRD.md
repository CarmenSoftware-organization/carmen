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
- This will show all PO line items that have not been received

## Grouping Options

The PO Detail Report supports the following grouping options for pending orders:
- Group by Vendor
- Group by Product
- Group by Delivery Location
- Group by Expected Delivery Date

## Business Value

Consolidating this report into PO Detail Report:
- Reduces report maintenance overhead
- Provides more flexible filtering options
- Enables drill-down to full PO details
- Maintains single source of truth

## See Also

- PO-002: Purchase Order Detail Report (primary report)
- PO-003: Purchase Order List Report (summary view)
