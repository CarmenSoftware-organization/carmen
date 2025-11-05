# Price List Detail by Product Report - Product Requirement Document

**Report ID:** PR-003
**Report Name:** Price List Detail by Product Report
**Module:** Purchase Request (PR)
**Report Type:** Comparison Report
**Priority:** Medium
**Status:** Pending
**Implementation:** Interactive screen view (not standalone report)

## Executive Summary

This report compares pricing from multiple vendors for products to help users identify best pricing options during purchase request creation.

## Business Objectives

- **Primary Goal:** Enable price comparison across vendors
- **Users:** Purchasing staff, buyers
- **Frequency:** On-demand during PR creation
- **Key Metrics:** Price variance, lowest vendor, cost savings potential

## Functional Requirements

### Filter Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Date From To | Date Range | Yes | Last 30 Days | Price list date range |
| Product | Multi-select | No | All | Specific products |
| Vendor | Multi-select | No | All | Specific vendors |
| Category | Dropdown | No | All | Product category |

### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product identifier |
| Product Name | Text | Product description |
| Vendor 1 Price | Currency | Vendor 1 quoted price |
| Vendor 2 Price | Currency | Vendor 2 quoted price |
| Vendor 3 Price | Currency | Vendor 3 quoted price |
| Lowest Price | Currency | Minimum price offered |
| Lowest Vendor | Text | Vendor with lowest price |
| Price Difference | Currency | Max - Min price |
| Price Variation % | Percentage | Price variance percentage |

## Business Rules

- Display multiple vendor quotes side by side (max 5 vendors)
- Highlight lowest price per product (green background)
- Show price variance analysis
- Filter by date range, product, vendor
- Interactive comparison view
- Not generated as static report (screen view only)
- Calculate potential savings if switching to lowest vendor

## UI/UX Requirements

- Interactive table with sortable columns
- Visual indicators for best price
- Drill-down to vendor details
- Quick add to PR from comparison view
- Export comparison to Excel
- Price trend chart (optional)

## Performance Requirements

- Real-time price lookup
- Support comparison of up to 100 products simultaneously
- Load within 2 seconds

## Integration Points

- Vendor price lists
- Product master
- Purchase history
- Current PR being created
