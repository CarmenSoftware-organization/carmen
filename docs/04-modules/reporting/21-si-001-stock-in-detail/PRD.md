# Stock In Detail Report - Product Requirement Document

**Report ID:** SI-001
**Report Name:** Stock In Detail Report
**Module:** Stock In (SI)
**Priority:** Medium
**Status:** Specification from MSD

## Executive Summary

Display detailed information of all stock receipts including various transaction types (Receiving, Transfer In, Adjustment).

## Source

This specification is extracted from the Master Specification Document (MSD).
For detailed requirements, refer to:
- docs/reports/bl_reports_msd.md

## Key Features

### Transaction Types
- Receiving (from vendors)
- Transfer In (from other locations)
- Adjustment (inventory adjustments)
- Production Receipt (from manufacturing)

### Filter Parameters
- Date Range: Stock in date range
- Location: Storage location filter
- Transaction Type: Type of stock in movement

### Data Columns
- Transaction No, Date, Type
- Location, Product Code/Name
- Quantity, Unit Cost, Total Amount
- Reference Document, Created By

## Implementation Status

This report requires detailed PRD development.
