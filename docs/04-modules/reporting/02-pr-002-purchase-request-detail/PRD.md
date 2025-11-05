# Purchase Request Detail Report - Product Requirement Document

**Report ID:** PR-002
**Report Name:** Purchase Request Detail Report
**Module:** Purchase Request (PR)
**Priority:** High
**Status:** Approved - OK

## Executive Summary

This report provides comprehensive details of Purchase Requests including all line items with products, quantities, pricing, taxes, and delivery information.

## Business Objectives

- **Primary Goal:** Detailed analysis and verification of PR line items
- **Users:** Purchasing officers, auditors, finance team
- **Frequency:** Weekly to monthly for review and audit
- **Key Metrics:** Line item details, quantity analysis, pricing verification

## Functional Requirements

### Filter Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Date From To | Date Range | Yes | Current Month | PR creation date range |
| Vendor From To | Vendor Range | No | All | Vendor code range |
| Location From To | Location Range | No | All | Store location range |
| Status | Multi-select | No | All | PR status filter |

### Data Columns

| Column Name | Thai Description | Data Type | Width | Alignment | Format |
|-------------|------------------|-----------|-------|-----------|--------|
| Store Location | สถานที่ | Text | 120px | Left | Text |
| Product ID | รหัสสินค้า | Text | 100px | Left | Text |
| Description | รายละเอียด | Text | 250px | Left | Text |
| Order Qty | จำนวน | Decimal | 90px | Right | #,##0.00 |
| Order Unit | หน่วย | Text | 70px | Center | Text |
| Foc Qty | FOC | Decimal | 80px | Right | #,##0.00 |
| Price | ราคา | Currency | 100px | Right | #,##0.00 |
| Discount | ส่วนลด | Currency | 90px | Right | #,##0.00 |
| Tax Amount | ภาษี | Currency | 90px | Right | #,##0.00 |
| Net Amount | ยอดสุทธิ | Currency | 120px | Right | #,##0.00 |

## Business Rules

1. **Grouping Rules:**
   - Group by PR Number
   - Show PR header information above line items
   - Calculate subtotal per PR
   - Grand total at report end

2. **Calculation Rules:**
   - Net Amount = (Order Qty × Price) - Discount + Tax Amount
   - FOC (Free of Charge) items shown separately
   - Tax calculation based on tax configuration

3. **Display Rules:**
   - Show all line items including FOC
   - Highlight negative quantities or amounts
   - Flag items over budget threshold

## UI/UX Requirements

- Collapsible PR sections
- Drill-down to product details
- Export with formatting preserved
- Print with page breaks per PR

## Performance Requirements

- Load within 5 seconds for 1000 line items
- Support up to 50,000 line items with pagination
- Background processing for large exports
