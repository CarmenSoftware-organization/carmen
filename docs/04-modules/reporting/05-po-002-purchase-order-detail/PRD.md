# Purchase Order Detail Report - Product Requirement Document

**Report ID:** PO-002
**Report Name:** Purchase Order Detail Report
**Module:** Purchase Order (PO)
**Priority:** Critical
**Status:** Approved - OK

## Executive Summary

Comprehensive detail report showing all PO line items with order quantities, received quantities, pending amounts, pricing, and delivery information. Essential for tracking PO fulfillment and vendor performance.

## Business Objectives

- **Primary Goal:** Monitor PO execution and fulfillment status
- **Users:** Purchasing managers, receiving staff, finance team
- **Frequency:** Daily monitoring
- **Key Metrics:** Fulfillment rate, pending deliveries, vendor performance

## Functional Requirements

### Filter Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Date From To | Date Range | Yes | Current Month | PO date range |
| Vendor From To | Vendor Range | No | All | Vendor range |
| Location From To | Location Range | No | All | Delivery location |
| Status | Multi-select | No | All | PO status (Pending/Approved/Partial/Complete/Cancelled) |

### Data Columns

| Column Name | Thai Description | Data Type | Width | Format |
|-------------|------------------|-----------|-------|--------|
| Ref PR.No. | เลขที่ PR อ้างอิง | Text | 120px | Text |
| Store Location | สถานที่จัดเก็บ | Text | 130px | Text |
| Product ID | รหัสสินค้า | Text | 100px | Text |
| Description | รายละเอียด | Text | 250px | Text |
| Order Qty | จำนวนสั่ง | Decimal | 90px | #,##0.00 |
| Order Unit | หน่วย | Text | 70px | Text |
| Foc Qty | FOC | Decimal | 80px | #,##0.00 |
| Price | ราคา/หน่วย | Currency | 100px | #,##0.00 |
| Discount | ส่วนลด | Currency | 90px | #,##0.00 |
| Tax Amount | ภาษี | Currency | 90px | #,##0.00 |
| Net Amount | ยอดสุทธิ | Currency | 120px | #,##0.00 |
| Received Qty | รับแล้ว | Decimal | 90px | #,##0.00 |
| Pending Qty | คงเหลือ | Decimal | 90px | #,##0.00 |

## Business Rules

1. **Fulfillment Tracking:**
   - Received Qty = Sum of all received quantities from RC documents
   - Pending Qty = Order Qty - Received Qty
   - Status updates automatically based on fulfillment:
     - Pending: Received Qty = 0
     - Partial: 0 < Received Qty < Order Qty
     - Complete: Received Qty = Order Qty

2. **Calculation Rules:**
   - Net Amount = (Order Qty × Price) - Discount + Tax Amount
   - Received Amount = (Received Qty × Price) - Pro-rated Discount + Pro-rated Tax
   - Pending Amount = Net Amount - Received Amount

3. **Display Rules:**
   - Highlight partial fulfillment rows (yellow)
   - Show over-received items in red
   - Group by PO number with subtotals
   - Display fulfillment percentage

## UI/UX Requirements

- Progress bar showing fulfillment percentage per PO
- Link to receiving documents
- Alert icon for overdue deliveries
- Expandable sections for each PO
- Export with received/pending breakdown
- Print option with vendor-specific grouping

## Performance Requirements

- Load within 5 seconds for 1,000 line items
- Support up to 100,000 line items with pagination
- Real-time fulfillment status updates

## Integration Points

- PO master data
- Receiving transactions (RC)
- Purchase Request (PR) references
- Vendor master
- Product master
- Inventory locations
