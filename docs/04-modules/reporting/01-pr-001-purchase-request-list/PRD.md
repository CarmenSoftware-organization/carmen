# Purchase Request List Report - Product Requirement Document

**Report ID:** PR-001
**Report Name:** Purchase Request List Report
**Module:** Purchase Request (PR)
**Priority:** High
**Status:** Approved - OK

## Executive Summary

This report displays a summary list of all Purchase Requests (PR) within a specified date range, allowing users to quickly view and filter PRs by status, delivery date, and type.

## Business Objectives

- **Primary Goal:** Provide quick overview of all purchase requests
- **Users:** Purchasing managers, department heads, finance team
- **Frequency:** Daily to weekly usage
- **Key Metrics:** PR count by status, total PR value, pending approvals

## Functional Requirements

### Filter Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Date From To | Date Range | Yes | Current Month | PR creation date range |
| Delivery Date From To | Date Range | No | - | Expected delivery date range |
| Status | Multi-select | No | All | PR status filter |
| PR Type | Dropdown | No | All | Type of purchase request |

### Data Columns

| Column Name | Thai Description | Data Type | Width | Alignment | Format |
|-------------|------------------|-----------|-------|-----------|--------|
| Date | วันที่ PR | Date | 100px | Center | DD/MM/YYYY |
| PR.NO | หมายเลข PR | Text | 120px | Left | PR-YYYYMMDD-XXXX |
| Description | Description header PR | Text | 250px | Left | Text |
| Department Request | Department Request | Text | 150px | Left | Text |
| Delivery Date | วันที่ส่งสินค้า | Date | 110px | Center | DD/MM/YYYY |
| PR Type | ประเภทของ PR | Text | 120px | Center | Text |
| Status | สถานะ PR | Text | 100px | Center | Badge/Label |
| Total | ยอดสุทธิของ PR | Currency | 130px | Right | #,##0.00 |

## Business Rules

1. **Display Rules:**
   - Show summary information only (one row per PR)
   - Default sort: PR Date descending
   - Maximum 100 rows per page with pagination

2. **Status Values:**
   - Draft (yellow badge)
   - Pending Approval (orange badge)
   - Approved (green badge)
   - Rejected (red badge)
   - Cancelled (gray badge)

3. **Calculation Rules:**
   - Total = Sum of all line items (net amount after discount and tax)
   - Display in PR currency

4. **Access Rules:**
   - Users can only see PRs from their department unless they have cross-department access
   - Finance team sees all PRs

## UI/UX Requirements

- Display in system grid with print capability
- Clickable PR.NO links to PR detail view
- Status badges with color coding
- Export to Excel button
- Print button with preview
- Quick filters for common date ranges (Today, This Week, This Month)

## Performance Requirements

- Load within 3 seconds for standard month query
- Support up to 10,000 PRs without performance degradation
- Pagination for large result sets

## Integration Points

- PR Master data table
- Department master
- User permissions
- Status workflow system
