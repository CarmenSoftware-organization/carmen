# Blue Ledger Reports - Master Specification Document (MSD)

**Document Version:** 1.0  
**Date:** February 24, 2025  
**System:** Blue Ledger ERP  
**Total Reports:** 35

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Executive Summary

This Master Specification Document provides comprehensive specifications for 35 reports across the Blue Ledger ERP system. Reports are organized into 12 functional modules covering purchasing, inventory, receiving, vendor management, and recipe management operations.

### Report Distribution by Module

| Module | Report Count | Focus Area |
|--------|--------------|------------|
| PR (Purchase Request) | 3 | Purchase request creation and tracking |
| PO (Purchase Order) | 3 | Purchase order management |
| RC (Receiving) | 4 | Goods receiving and analysis |
| Inventory | 6 | Stock management and tracking |
| SR (Store Requisition) | 2 | Internal requisitions |
| CR (Credit Note) | 1 | Vendor credits |
| SI (Stock In) | 1 | Stock receipts |
| SO (Stock Out) | 1 | Stock issuance |
| Closing | 1 | Period-end adjustments |
| General | 12 | Cross-functional reports |

---

## Table of Contents

1. [Report Inventory](#report-inventory)
2. [Purchase Request (PR) Reports](#purchase-request-reports)
3. [Purchase Order (PO) Reports](#purchase-order-reports)
4. [Receiving (RC) Reports](#receiving-reports)
5. [Credit Note Reports](#credit-note-reports)
6. [Vendor Management Reports](#vendor-management-reports)
7. [Product Management Reports](#product-management-reports)
8. [Store Requisition Reports](#store-requisition-reports)
9. [Stock Movement Reports](#stock-movement-reports)
10. [Inventory Management Reports](#inventory-management-reports)
11. [Recipe Management Reports](#recipe-management-reports)
12. [Technical Specifications](#technical-specifications)

---

## Report Inventory

### Complete Report List

| ID | Report Name | Module | Status | Implementation Notes |
|----|-------------|---------|--------|---------------------|
| 1 | Purchase Request List Report | PR | OK | Use system display with print capability |
| 2 | Purchase Request Detail Report | PR | OK | Full report with status filter |
| 3 | Price List Detail by Product Report | PR | Pending | Screen comparison view |
| 4 | Order Pending Report | PO | OK | Merged with PO Detail |
| 5 | Purchase Order Detail | PO | OK | Full report with status filter |
| 6 | Purchase Order List Report | PO | OK | System display with print |
| 7 | Receiving List Report | RC | OK | System display with print |
| 8 | Receiving Detail Report | RC | OK | Full detail report |
| 9 | Top Purchasing | RC | OK | Dashboard with drill-down |
| 10 | Purchase Analysis by Item Report | RC | OK | Analysis section report |
| 11 | Credit Note List Report | - | OK | Using Receiving format |
| 12 | Credit Note Detail | CR | OK | Full detail report |
| 13 | Vendor List | - | - | Master data report |
| 14 | Vendor Detailed | - | - | Vendor detail report |
| 15 | Product List | - | - | Master data report |
| 16 | Product Category | - | - | Category report |
| 17 | Store Requisition Detail | SR | - | Requisition details |
| 18 | Store Requisition Detail Summary | - | - | Summary view |
| 19 | Store Requisition List | - | - | List view |
| 20 | Issue Detail | SR | - | Issue tracking |
| 21 | Stock In Detail | SI | - | Stock receipt details |
| 22 | Stock Out Detail | SO | - | Stock issuance details |
| 23 | EOP Adjustment Report | Closing | - | End of period adjustments |
| 24 | Inventory Balance (by Location and Product) | inventory | - | Balance by location |
| 25 | Inventory Movement Detailed By Product | GL Check | - | Movement tracking |
| 26 | Inventory Movement Summary By Location | inventory | - | Location summary |
| 27 | Slow Moving Report | Inventory | - | Slow-moving analysis |
| 28 | Stock Card Detailed Report | inventory | - | Detailed stock card |
| 29 | Stock Card Summary Report | - | - | Summary stock card |
| 30 | Deviation by Item | - | - | Variance analysis |
| 31 | Inventory Aging Report | inventory | - | Aging analysis |
| 32 | Expired Items Report | inventory | - | Expiry tracking |
| 33 | Recipe List | - | - | Recipe listing |
| 34 | Recipe Card | - | - | Recipe details |
| 35 | Material Consumption | - | - | Material usage tracking |

---

## Purchase Request Reports

### Report #1: Purchase Request List Report

**Purpose:** Display summary information of Purchase Requests (PR) showing key details for each PR document.

**Module:** PR (Purchase Request)

**Report Type:** List/Summary Report

**Implementation:** System display with print capability (not standalone report)

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | PR creation date start |
| Date To | Date | Yes | PR creation date end |
| Delivery Date From | Date | No | Delivery date start |
| Delivery Date To | Date | No | Delivery date end |
| Status | Dropdown | No | PR status filter |

#### Data Columns

| Column Name | Thai Description | Data Type | Description |
|-------------|------------------|-----------|-------------|
| Date | วันที่ PR | Date | PR creation date |
| PR.NO | หมายเลข PR | Text | PR document number |
| Description | Description header PR | Text | PR header description |
| Department Request | Department Request | Text | Requesting department |
| Delivery Date | วันที่ส่งสินค้า | Date | Expected delivery date |
| PR Type | ประเภทของ PR | Text | Type of PR |
| Status | สถานะ PR | Text | Current PR status |
| Total | ยอดสุทธิของ PR | Currency | Net total amount |

#### Business Rules

- Display only summary information per PR
- User can select status to filter results
- Support multi-status selection
- Print capability from system display
- Sort by PR date descending (default)

---

### Report #2: Purchase Request Detail Report

**Purpose:** Display detailed information of Purchase Requests including product details, quantities, taxes, and amounts.

**Module:** PR (Purchase Request)

**Report Type:** Detail Report

**Implementation:** Full report with drill-down capability

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | PR creation date start |
| Date To | Date | Yes | PR creation date end |
| Status | Multi-select | No | PR status filter |
| Department | Dropdown | No | Department filter |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| PR No | Text | Purchase request number |
| PR Date | Date | Creation date |
| Line No | Integer | Line item number |
| Product Code | Text | Product identifier |
| Product Name | Text | Product description |
| Unit | Text | Unit of measure |
| Quantity | Decimal | Requested quantity |
| Unit Price | Currency | Price per unit |
| Discount | Percentage/Amount | Discount applied |
| Tax | Currency | Tax amount |
| Net Amount | Currency | Line total |
| Location | Text | Delivery location |
| Delivery Date | Date | Required delivery date |
| Status | Text | Line item status |
| Remarks | Text | Additional notes |

#### Business Rules

- Show all line items for selected PRs
- Support status filtering (Draft, Pending, Approved, Rejected, Cancelled)
- Group by PR number
- Calculate subtotals per PR
- Export to Excel capability
- Print in detail or summary mode

---

### Report #3: Price List Detail by Product Report

**Purpose:** Compare pricing from multiple vendors for products to help users identify best pricing options.

**Module:** PR (Purchase Request)

**Report Type:** Comparison Report

**Implementation:** Interactive screen view (not standalone report)

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Price list date range start |
| Date To | Date | Yes | Price list date range end |
| Product | Multi-select | No | Specific products |
| Vendor | Multi-select | No | Specific vendors |
| Category | Dropdown | No | Product category |

#### Data Columns

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

#### Business Rules

- Display multiple vendor quotes side by side
- Highlight lowest price per product
- Show price variance analysis
- Filter by date range, product, vendor
- Interactive comparison view
- Not generated as static report

---

## Purchase Order Reports

### Report #4: Order Pending Report

**Purpose:** Display pending purchase orders awaiting fulfillment.

**Module:** PO (Purchase Order)

**Report Type:** Detail Report

**Implementation:** Merged with PO Detail Report

**Note:** This report has been consolidated into the PO Detail Report with status filter capability. Users should use PO Detail Report and filter by "Pending" status.

#### Grouping Options

- Group by Vendor
- Group by Product
- Group by Location

---

### Report #5: Purchase Order Detail

**Purpose:** Display detailed information of Purchase Orders including all line items, pricing, taxes, and delivery information.

**Module:** PO (Purchase Order)

**Report Type:** Detail Report

**Implementation:** Full report with status filtering

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | PO date start |
| Date To | Date | Yes | PO date end |
| Status | Multi-select | No | PO status (Pending, Approved, Partial, Complete, Cancelled) |
| Vendor | Dropdown | No | Vendor filter |
| Location | Dropdown | No | Delivery location |

#### Data Columns

| Column Name | Thai Description | Data Type | Description |
|-------------|------------------|-----------|-------------|
| PO No | หมายเลข PO | Text | Purchase order number |
| PO Date | วันที่ PO | Date | PO creation date |
| Vendor Code | รหัสผู้จำหน่าย | Text | Vendor identifier |
| Vendor Name | ชื่อผู้จำหน่าย | Text | Vendor name |
| Product Code | รหัสสินค้า | Text | Product identifier |
| Product Name | ชื่อสินค้า | Text | Product description |
| Unit | หน่วย | Text | Unit of measure |
| Ordered Qty | จำนวนที่สั่ง | Decimal | Ordered quantity |
| Received Qty | จำนวนที่รับแล้ว | Decimal | Received quantity |
| Pending Qty | จำนวนคงเหลือ | Decimal | Outstanding quantity |
| Unit Price | ราคาต่อหน่วย | Currency | Price per unit |
| Discount | ส่วนลด | Currency | Discount amount |
| Tax | ภาษี | Currency | Tax amount |
| Net Amount | ยอดสุทธิ | Currency | Line net amount |
| Location | สถานที่จัดส่ง | Text | Delivery location |
| Delivery Date | วันที่ส่ง | Date | Expected delivery |
| Status | สถานะ | Text | Line status |

#### Business Rules

- Group by PO number
- Show all line items with received vs pending quantities
- Calculate PO totals and subtotals
- Support multiple status selection
- Track fulfillment percentage
- Export and print capabilities

---

### Report #6: Purchase Order List Report

**Purpose:** Display summary view of Purchase Orders showing key information for each PO document.

**Module:** PO (Purchase Order)

**Report Type:** List/Summary Report

**Implementation:** System display with print capability

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | PO date start |
| Date To | Date | Yes | PO date end |
| Status | Multi-select | No | PO status filter |
| Vendor | Dropdown | No | Vendor filter |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| PO No | Text | Purchase order number |
| PO Date | Date | PO creation date |
| Vendor Name | Text | Vendor name |
| Description | Text | PO description |
| Currency | Text | Transaction currency |
| Total Amount | Currency | PO total amount |
| Received Amount | Currency | Amount received |
| Pending Amount | Currency | Amount pending |
| Status | Text | PO status |
| Created By | Text | User who created PO |

#### Business Rules

- One row per PO document
- Display summary financial information
- Show fulfillment status
- Support status filtering
- Print from system display
- Default sort by PO date descending

---

## Receiving Reports

### Report #7: Receiving List Report

**Purpose:** Display summary of goods receiving transactions showing currency and key totals.

**Module:** RC (Receiving)

**Report Type:** Summary Report

**Implementation:** System display with print capability

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Receiving date start |
| Date To | Date | Yes | Receiving date end |
| Vendor | Dropdown | No | Vendor filter |
| Status | Multi-select | No | Status filter |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Receiving No | Text | Receiving document number |
| Receiving Date | Date | Date of receipt |
| PO Reference | Text | Related PO number |
| Vendor Name | Text | Vendor name |
| Currency | Text | Transaction currency |
| Total Amount | Currency | Total received value |
| Extra Cost | Currency | Additional charges (landed cost) |
| Net Amount | Currency | Final amount |
| Status | Text | Receiving status |
| Location | Text | Receiving location |

#### Business Rules

- Display summary per receiving document
- Show currency information
- Include extra costs (landed costs)
- Filter by date, vendor, status
- Print capability
- Link to PO reference

---

### Report #8: Receiving Detail Report

**Purpose:** Display detailed information of receiving transactions including all products, quantities, pricing, and taxes.

**Module:** RC (Receiving)

**Report Type:** Detail Report

**Implementation:** Full detail report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Receiving date start |
| Date To | Date | Yes | Receiving date end |
| Status | Multi-select | No | Receiving status |
| Vendor | Dropdown | No | Vendor filter |
| Location | Dropdown | No | Receiving location |

#### Data Columns

| Column Name | Thai Description | Data Type | Description |
|-------------|------------------|-----------|-------------|
| Receiving No | เลขที่รับสินค้า | Text | Receiving document number |
| Receiving Date | วันที่รับ | Date | Receipt date |
| PO No | เลขที่ PO | Text | Related PO |
| Vendor Code | รหัสผู้จำหน่าย | Text | Vendor code |
| Vendor Name | ชื่อผู้จำหน่าย | Text | Vendor name |
| Product Code | รหัสสินค้า | Text | Product code |
| Product Name | ชื่อสินค้า | Text | Product description |
| Unit | หน่วย | Text | Unit of measure |
| Ordered Qty | จำนวนที่สั่ง | Decimal | PO quantity |
| Received Qty | จำนวนที่รับ | Decimal | Received quantity |
| Unit Price | ราคา/หน่วย | Currency | Unit price |
| Discount | ส่วนลด | Currency | Discount |
| Tax | ภาษี | Currency | Tax amount |
| Amount | จำนวนเงิน | Currency | Line amount |
| Location | สถานที่ | Text | Storage location |
| Status | สถานะ | Text | Line status |

#### Business Rules

- Show all line items per receiving
- Compare ordered vs received quantities
- Group by receiving number
- Calculate subtotals and totals
- Support status filtering
- Track variances from PO
- Export and print capabilities

---

### Report #9: Top Purchasing / Top Receiving

**Purpose:** Display top purchased/received items ranking by quantity or amount.

**Module:** RC (Receiving)

**Report Type:** Ranking/Analysis Report

**Implementation:** Dashboard with drill-down capability

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Period start date |
| Date To | Date | Yes | Period end date |
| Group By | Radio | Yes | Vendor or Product |
| Ranking Type | Radio | Yes | By Amount or By Quantity |
| Top N | Dropdown | Yes | Number of items (10, 20, 50, 100) |
| Location | Dropdown | No | Location filter |

#### Data Columns (By Vendor)

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Rank | Integer | Ranking position |
| Vendor Code | Text | Vendor identifier |
| Vendor Name | Text | Vendor name |
| Total Amount | Currency | Total purchase value |
| Total Quantity | Decimal | Total quantity |
| Number of POs | Integer | PO count |
| Percentage | Percentage | % of total purchases |

#### Data Columns (By Product)

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Rank | Integer | Ranking position |
| Product Code | Text | Product identifier |
| Product Name | Text | Product description |
| Category | Text | Product category |
| Total Quantity | Decimal | Total received quantity |
| Total Amount | Currency | Total value |
| Average Price | Currency | Average unit price |
| Percentage | Percentage | % of total |

#### Business Rules

- Support ranking by vendor (amount) or product (quantity)
- Configurable top N (10-100 items)
- Display as dashboard initially
- "More" button to view complete list
- Visual chart representation
- Drill-down to detail transactions
- Compare across periods

---

### Report #10: Purchase Analysis by Item Report

**Purpose:** Analyze purchasing patterns including which products were purchased, at what prices, and to which locations.

**Module:** RC (Receiving)

**Report Type:** Analysis Report

**Implementation:** Full report in analysis section

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Analysis period start |
| Date To | Date | Yes | Analysis period end |
| Product | Multi-select | No | Specific products |
| Vendor | Multi-select | No | Specific vendors |
| Location | Multi-select | No | Specific locations |
| Category | Dropdown | No | Product category |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product identifier |
| Product Name | Text | Product description |
| Category | Text | Product category |
| Vendor Name | Text | Supplier name |
| Location | Text | Receiving location |
| Purchase Count | Integer | Number of purchases |
| Total Quantity | Decimal | Total quantity purchased |
| Min Price | Currency | Lowest unit price |
| Max Price | Currency | Highest unit price |
| Avg Price | Currency | Average unit price |
| Last Price | Currency | Most recent price |
| Price Variance | Currency | Max - Min price |
| Total Amount | Currency | Total spend |

#### Business Rules

- Analyze by product, vendor, location
- Track price variations over time
- Identify pricing trends
- Show purchase frequency
- Calculate average, min, max prices
- Support multiple dimensions
- Export for further analysis
- Visual charts for trends

---

## Credit Note Reports

### Report #11: Credit Note List Report

**Purpose:** Display summary of Credit Notes issued to vendors.

**Module:** Credit Note

**Report Type:** List/Summary Report

**Implementation:** Using Receiving format, system display with print

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | CN date start |
| Date To | Date | Yes | CN date end |
| Vendor | Dropdown | No | Vendor filter |
| Status | Multi-select | No | CN status |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| CN No | Text | Credit note number |
| CN Date | Date | Credit note date |
| Vendor Name | Text | Vendor name |
| Reference | Text | Related document reference |
| Currency | Text | Transaction currency |
| Total Amount | Currency | Credit note total |
| Status | Text | CN status |
| Created By | Text | User who created |

#### Business Rules

- One row per credit note
- Link to related receiving/PO
- Show status
- Print capability
- Default sort by CN date

---

### Report #12: Credit Note Detail

**Purpose:** Display detailed information of Credit Notes including product details and amounts.

**Module:** CR (Credit Note)

**Report Type:** Detail Report

**Implementation:** Full detail report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | CN date start |
| Date To | Date | Yes | CN date end |
| Vendor | Dropdown | No | Vendor filter |
| Status | Multi-select | No | Status filter |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| CN No | Text | Credit note number |
| CN Date | Date | Credit note date |
| Vendor Code | Text | Vendor code |
| Vendor Name | Text | Vendor name |
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Unit | Text | Unit of measure |
| Quantity | Decimal | Return quantity |
| Unit Price | Currency | Unit price |
| Discount | Currency | Discount amount |
| Tax | Currency | Tax amount |
| Net Amount | Currency | Line net amount |
| Reason | Text | Reason for credit |
| Reference | Text | Related document |
| Status | Text | Line status |

#### Business Rules

- Show all line items per CN
- Group by CN number
- Calculate totals per CN
- Link to original receiving
- Support status filtering
- Track reason codes
- Print and export capability

---

## Vendor Management Reports

### Report #13: Vendor List

**Purpose:** Display master list of all vendors in the system.

**Module:** Vendor Management

**Report Type:** Master Data List

**Implementation:** Master data report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Status | Dropdown | No | Active/Inactive |
| Category | Dropdown | No | Vendor category |
| Payment Terms | Dropdown | No | Payment terms |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Vendor Code | Text | Vendor identifier |
| Vendor Name | Text | Vendor full name |
| Category | Text | Vendor category |
| Contact Person | Text | Primary contact |
| Phone | Text | Contact phone |
| Email | Email | Contact email |
| Address | Text | Vendor address |
| Payment Terms | Text | Payment terms |
| Credit Limit | Currency | Credit limit |
| Status | Text | Active/Inactive |

#### Business Rules

- List all vendors or filter by criteria
- Show active status
- Display contact information
- Sort alphabetically by default
- Export to Excel
- Print capability

---

### Report #14: Vendor Detailed

**Purpose:** Display detailed vendor information including transaction history and statistics.

**Module:** Vendor Management

**Report Type:** Detail Report

**Implementation:** Vendor detail report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Vendor | Multi-select | Yes | Specific vendors |
| Date From | Date | No | Transaction period start |
| Date To | Date | No | Transaction period end |

#### Data Columns

**Vendor Information Section:**
- Vendor Code, Name, Category
- Contact Details
- Address
- Payment Terms
- Tax ID

**Transaction Statistics:**
- Total Purchase Orders
- Total Received Amount
- Outstanding Amount
- Average Order Value
- Last Transaction Date
- Credit Limit vs Used

**Transaction History:**
- Transaction Date
- Document Type (PO/RC/CN)
- Document Number
- Amount
- Status

#### Business Rules

- Show vendor master data
- Display transaction summary
- List recent transactions
- Calculate statistics for period
- Track credit usage
- Print vendor profile

---

## Product Management Reports

### Report #15: Product List

**Purpose:** Display master list of all products in the system.

**Module:** Product Management

**Report Type:** Master Data List

**Implementation:** Master data report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Category | Dropdown | No | Product category |
| Status | Dropdown | No | Active/Inactive |
| Type | Dropdown | No | Product type |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product identifier |
| Product Name | Text | Product description |
| Category | Text | Product category |
| Type | Text | Product type |
| Unit | Text | Base unit of measure |
| Current Stock | Decimal | Current inventory |
| Reorder Level | Decimal | Reorder point |
| Unit Cost | Currency | Standard cost |
| Selling Price | Currency | Selling price |
| Status | Text | Active/Inactive |

#### Business Rules

- List all products or filter
- Show current stock levels
- Display pricing information
- Sort by code or name
- Export capability
- Print capability

---

### Report #16: Product Category

**Purpose:** Display product categories and associated products.

**Module:** Product Management

**Report Type:** Category Report

**Implementation:** Category hierarchy report

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Category Code | Text | Category identifier |
| Category Name | Text | Category description |
| Parent Category | Text | Parent category (if hierarchical) |
| Product Count | Integer | Number of products |
| Total Value | Currency | Total inventory value |
| Status | Text | Active/Inactive |

#### Business Rules

- Display category hierarchy
- Show product count per category
- Calculate total values
- Support drill-down to products
- Export capability

---

## Store Requisition Reports

### Report #17: Store Requisition Detail

**Purpose:** Display detailed information of store requisitions for internal transfers.

**Module:** SR (Store Requisition)

**Report Type:** Detail Report

**Implementation:** Detail report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Requisition date start |
| Date To | Date | Yes | Requisition date end |
| From Location | Dropdown | No | Source location |
| To Location | Dropdown | No | Destination location |
| Status | Multi-select | No | Requisition status |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| SR No | Text | Requisition number |
| SR Date | Date | Requisition date |
| From Location | Text | Source location |
| To Location | Text | Destination location |
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Unit | Text | Unit of measure |
| Requested Qty | Decimal | Requested quantity |
| Issued Qty | Decimal | Issued quantity |
| Pending Qty | Decimal | Pending quantity |
| Unit Cost | Currency | Unit cost |
| Amount | Currency | Line amount |
| Status | Text | Line status |
| Requested By | Text | Requester |

#### Business Rules

- Show all line items per requisition
- Track requested vs issued quantities
- Group by SR number
- Calculate totals
- Support status filtering
- Print and export

---

### Report #18: Store Requisition Detail Summary

**Purpose:** Display summary view of store requisitions.

**Module:** Store Requisition

**Report Type:** Summary Report

**Implementation:** Summary view

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| SR No | Text | Requisition number |
| SR Date | Date | Requisition date |
| From Location | Text | Source location |
| To Location | Text | Destination location |
| Total Items | Integer | Number of line items |
| Total Quantity | Decimal | Total quantity |
| Total Amount | Currency | Total value |
| Status | Text | Overall status |
| Requested By | Text | Requester |

---

### Report #19: Store Requisition List

**Purpose:** Display list of all store requisitions.

**Module:** Store Requisition

**Report Type:** List Report

**Implementation:** List view with print

#### Business Rules

- One row per requisition
- Summary information only
- Filter by date, location, status
- Print capability

---

### Report #20: Issue Detail

**Purpose:** Display details of inventory issued from store requisitions.

**Module:** SR (Store Requisition)

**Report Type:** Detail Report

**Implementation:** Issue tracking report

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Issue No | Text | Issue document number |
| Issue Date | Date | Issue date |
| SR Reference | Text | Related SR number |
| From Location | Text | Source location |
| To Location | Text | Destination location |
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Issued Qty | Decimal | Issued quantity |
| Unit Cost | Currency | Unit cost |
| Amount | Currency | Issue amount |
| Issued By | Text | User who issued |

---

## Stock Movement Reports

### Report #21: Stock In Detail

**Purpose:** Display detailed information of all stock receipts.

**Module:** SI (Stock In)

**Report Type:** Detail Report

**Implementation:** Stock receipt tracking

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Stock in date start |
| Date To | Date | Yes | Stock in date end |
| Location | Dropdown | No | Storage location |
| Transaction Type | Dropdown | No | Type of stock in |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Transaction No | Text | Stock in document number |
| Transaction Date | Date | Transaction date |
| Transaction Type | Text | Type (Receiving, Transfer In, Adjustment) |
| Location | Text | Receiving location |
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Quantity | Decimal | Received quantity |
| Unit Cost | Currency | Unit cost |
| Amount | Currency | Total value |
| Reference | Text | Source document |
| Created By | Text | User |

---

### Report #22: Stock Out Detail

**Purpose:** Display detailed information of all stock issuances.

**Module:** SO (Stock Out)

**Report Type:** Detail Report

**Implementation:** Stock issuance tracking

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Stock out date start |
| Date To | Date | Yes | Stock out date end |
| Location | Dropdown | No | Source location |
| Transaction Type | Dropdown | No | Type of stock out |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Transaction No | Text | Stock out document number |
| Transaction Date | Date | Transaction date |
| Transaction Type | Text | Type (Issue, Transfer Out, Adjustment, Consumption) |
| Location | Text | Source location |
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Quantity | Decimal | Issued quantity |
| Unit Cost | Currency | Unit cost |
| Amount | Currency | Total value |
| Reference | Text | Target document |
| Created By | Text | User |

---

## Inventory Management Reports

### Report #23: EOP Adjustment Report

**Purpose:** Display end-of-period inventory adjustments.

**Module:** Closing

**Report Type:** Adjustment Report

**Implementation:** Period-end report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Period | Dropdown | Yes | Accounting period |
| Location | Multi-select | No | Locations |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Location | Text | Storage location |
| System Qty | Decimal | System quantity |
| Physical Qty | Decimal | Physical count |
| Variance | Decimal | Difference |
| Unit Cost | Currency | Unit cost |
| Variance Amount | Currency | Value difference |
| Reason | Text | Adjustment reason |
| Adjusted By | Text | User |
| Adjustment Date | Date | Date adjusted |

#### Business Rules

- Show adjustments for period close
- Calculate variances
- Track reasons for adjustments
- Require approval workflow
- Integrate with GL posting

---

### Report #24: Inventory Balance (by Location and Product)

**Purpose:** Display current inventory balances by location and product.

**Module:** inventory

**Report Type:** Balance Report

**Implementation:** Real-time balance report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| As of Date | Date | Yes | Balance as of date |
| Location | Multi-select | No | Specific locations |
| Product | Multi-select | No | Specific products |
| Category | Dropdown | No | Product category |
| Show Zero Balance | Checkbox | No | Include zero balances |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Location | Text | Storage location |
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Category | Text | Product category |
| Unit | Text | Unit of measure |
| On Hand Qty | Decimal | Current balance |
| Reserved Qty | Decimal | Reserved quantity |
| Available Qty | Decimal | Available for use |
| Unit Cost | Currency | Current unit cost |
| Total Value | Currency | Total inventory value |
| Reorder Level | Decimal | Reorder point |
| Status | Text | Stock status |

#### Business Rules

- Real-time or as-of-date balance
- Support multiple locations
- Show available vs reserved
- Calculate total values
- Flag items below reorder level
- Export capability
- Group by location or product

---

### Report #25: Inventory Movement Detailed By Product

**Purpose:** Display detailed inventory movements by product for GL reconciliation.

**Module:** เช็คกับ GL ตอน Post (GL Check)

**Report Type:** Movement Detail Report

**Implementation:** GL reconciliation report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Movement period start |
| Date To | Date | Yes | Movement period end |
| Product | Multi-select | No | Specific products |
| Location | Multi-select | No | Specific locations |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Transaction Date | Date | Movement date |
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Location | Text | Location |
| Transaction Type | Text | Type of movement |
| Document No | Text | Source document |
| In Qty | Decimal | Quantity received |
| Out Qty | Decimal | Quantity issued |
| Balance Qty | Decimal | Running balance |
| Unit Cost | Currency | Transaction cost |
| In Value | Currency | Value received |
| Out Value | Currency | Value issued |
| Balance Value | Currency | Running value |
| GL Account | Text | GL account code |
| Posted | Boolean | GL posting status |

#### Business Rules

- Show all movements by product
- Calculate running balances
- Track GL posting status
- Support reconciliation
- Group by product
- Export for GL verification

---

### Report #26: Inventory Movement Summary By Location

**Purpose:** Display summarized inventory movements by location.

**Module:** inventory

**Report Type:** Movement Summary Report

**Implementation:** Location summary

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Period start |
| Date To | Date | Yes | Period end |
| Location | Multi-select | No | Specific locations |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Location | Text | Storage location |
| Opening Balance Qty | Decimal | Opening quantity |
| Opening Balance Value | Currency | Opening value |
| Total In Qty | Decimal | Total received |
| Total In Value | Currency | Total receipt value |
| Total Out Qty | Decimal | Total issued |
| Total Out Value | Currency | Total issue value |
| Closing Balance Qty | Decimal | Closing quantity |
| Closing Balance Value | Currency | Closing value |

#### Business Rules

- Summarize by location
- Calculate opening and closing
- Track in/out movements
- Reconcile to GL
- Export capability

---

### Report #27: Slow Moving Report

**Purpose:** Identify slow-moving or non-moving inventory items.

**Module:** Inventory

**Report Type:** Analysis Report

**Implementation:** Inventory analysis

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| As of Date | Date | Yes | Analysis date |
| Days Without Movement | Integer | Yes | Days threshold (e.g., 90, 180, 365) |
| Location | Multi-select | No | Specific locations |
| Category | Dropdown | No | Product category |
| Minimum Value | Currency | No | Value threshold |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Category | Text | Product category |
| Location | Text | Storage location |
| On Hand Qty | Decimal | Current quantity |
| Unit Cost | Currency | Unit cost |
| Total Value | Currency | Total value |
| Last Movement Date | Date | Last transaction date |
| Days Without Movement | Integer | Days since last movement |
| Last Movement Type | Text | Type of last movement |
| Reorder Level | Decimal | Reorder point |

#### Business Rules

- Identify items with no movement for X days
- Configurable threshold (90, 180, 365 days)
- Calculate inventory value at risk
- Flag obsolete items
- Support category analysis
- Export for review
- Recommend disposal or promotion

---

### Report #28: Stock Card Detailed Report

**Purpose:** Display detailed stock card showing all transactions for a product.

**Module:** inventory

**Report Type:** Stock Card Detail

**Implementation:** Transaction history report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Period start |
| Date To | Date | Yes | Period end |
| Product | Multi-select | Yes | Specific products |
| Location | Dropdown | No | Specific location |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Transaction Date | Date | Transaction date |
| Transaction Type | Text | Type of transaction |
| Document No | Text | Source document |
| Reference | Text | Additional reference |
| In Qty | Decimal | Quantity received |
| Out Qty | Decimal | Quantity issued |
| Balance Qty | Decimal | Running balance |
| Unit Cost | Currency | Transaction cost |
| In Value | Currency | Value received |
| Out Value | Currency | Value issued |
| Balance Value | Currency | Running value |
| Location | Text | Location |
| Created By | Text | User |

#### Business Rules

- Show all transactions for product
- Calculate running balance (FIFO/Average)
- Track both quantity and value
- Group by product
- Support multiple products
- Print stock card format
- Export capability

---

### Report #29: Stock Card Summary Report

**Purpose:** Display summarized stock card information.

**Module:** Stock Management

**Report Type:** Stock Card Summary

**Implementation:** Summary view

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Opening Balance | Decimal | Opening quantity |
| Total In | Decimal | Total received |
| Total Out | Decimal | Total issued |
| Closing Balance | Decimal | Closing quantity |
| Opening Value | Currency | Opening value |
| Total In Value | Currency | Total receipt value |
| Total Out Value | Currency | Total issue value |
| Closing Value | Currency | Closing value |

---

### Report #30: Deviation by Item

**Purpose:** Analyze deviations between expected and actual inventory levels.

**Module:** Inventory Analysis

**Report Type:** Variance Analysis

**Implementation:** Deviation tracking

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Location | Text | Location |
| Expected Qty | Decimal | Expected quantity |
| Actual Qty | Decimal | Actual quantity |
| Variance Qty | Decimal | Difference |
| Variance % | Percentage | Variance percentage |
| Unit Cost | Currency | Unit cost |
| Variance Value | Currency | Value difference |
| Reason | Text | Variance reason |

---

### Report #31: Inventory Aging Report

**Purpose:** Analyze inventory by age to identify old stock.

**Module:** inventory

**Report Type:** Aging Analysis

**Implementation:** Age analysis report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| As of Date | Date | Yes | Analysis date |
| Location | Multi-select | No | Specific locations |
| Category | Dropdown | No | Product category |
| Aging Buckets | Predefined | Yes | Age ranges (0-30, 31-60, 61-90, 91-180, 180+) |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Category | Text | Product category |
| Location | Text | Storage location |
| Total Qty | Decimal | Total quantity |
| Qty 0-30 Days | Decimal | Quantity aged 0-30 days |
| Qty 31-60 Days | Decimal | Quantity aged 31-60 days |
| Qty 61-90 Days | Decimal | Quantity aged 61-90 days |
| Qty 91-180 Days | Decimal | Quantity aged 91-180 days |
| Qty 180+ Days | Decimal | Quantity over 180 days |
| Unit Cost | Currency | Unit cost |
| Total Value | Currency | Total value |
| Value 180+ Days | Currency | Value of old stock |

#### Business Rules

- Age inventory based on receipt date
- Configurable age buckets
- Calculate total and aged values
- Identify potentially obsolete stock
- Support FIFO aging
- Export for analysis
- Flag high-value aged items

---

### Report #32: Expired Items Report

**Purpose:** Track and report on expired or expiring inventory items.

**Module:** inventory

**Report Type:** Expiry Tracking

**Implementation:** Expiry alert report

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Expiry Date From | Date | Yes | Expiry range start |
| Expiry Date To | Date | Yes | Expiry range end |
| Location | Multi-select | No | Specific locations |
| Status | Dropdown | No | Expired/Expiring Soon |
| Days Before Expiry | Integer | No | Alert threshold (e.g., 30 days) |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Product Code | Text | Product code |
| Product Name | Text | Product description |
| Category | Text | Product category |
| Location | Text | Storage location |
| Batch/Lot No | Text | Batch number |
| Manufacturing Date | Date | Production date |
| Expiry Date | Date | Expiry date |
| Days to Expiry | Integer | Days until expiry |
| Quantity | Decimal | Quantity on hand |
| Unit Cost | Currency | Unit cost |
| Total Value | Currency | Total value at risk |
| Status | Text | Expired/Expiring Soon |

#### Business Rules

- Track items by expiry date
- Alert for items expiring within X days
- Calculate value at risk
- Support batch/lot tracking
- Flag expired items
- Generate disposal recommendations
- Export for action planning
- Email alerts for critical expirations

---

## Recipe Management Reports

### Report #33: Recipe List

**Purpose:** Display list of all recipes in the system.

**Module:** Recipe Management

**Report Type:** Master Data List

**Implementation:** Recipe listing

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipe Type | Dropdown | No | Type of recipe |
| Category | Dropdown | No | Recipe category |
| Status | Dropdown | No | Active/Inactive |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Recipe Code | Text | Recipe identifier |
| Recipe Name | Text | Recipe description |
| Category | Text | Recipe category |
| Type | Text | Recipe type |
| Yield Quantity | Decimal | Standard yield |
| Yield Unit | Text | Unit of measure |
| Total Cost | Currency | Total recipe cost |
| Cost per Unit | Currency | Cost per yield unit |
| Number of Ingredients | Integer | Ingredient count |
| Status | Text | Active/Inactive |
| Last Updated | Date | Last modification date |

#### Business Rules

- List all recipes or filter
- Show cost information
- Display yield details
- Sort by various fields
- Export capability
- Print capability

---

### Report #34: Recipe Card

**Purpose:** Display detailed recipe card with all ingredients and instructions.

**Module:** Recipe Management

**Report Type:** Detail Report

**Implementation:** Recipe specification

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipe | Multi-select | Yes | Specific recipes |
| Cost Date | Date | No | Cost as of date |

#### Data Structure

**Recipe Header:**
- Recipe Code, Name
- Category, Type
- Yield Quantity, Unit
- Total Cost, Cost per Unit
- Preparation Time
- Instructions

**Ingredient Details:**

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Ingredient Code | Text | Product code |
| Ingredient Name | Text | Product description |
| Required Quantity | Decimal | Quantity needed |
| Unit | Text | Unit of measure |
| Unit Cost | Currency | Cost per unit |
| Total Cost | Currency | Extended cost |
| Percentage | Percentage | % of total cost |
| Preparation Notes | Text | Prep instructions |

#### Business Rules

- Show complete recipe details
- List all ingredients with quantities
- Calculate total and per-unit costs
- Display preparation instructions
- Support cost-as-of date
- Print in standard format
- Calculate cost based on current prices
- Track recipe versions

---

### Report #35: Material Consumption

**Purpose:** Track actual material consumption against recipe standards.

**Module:** Recipe Management

**Report Type:** Variance Analysis

**Implementation:** Consumption tracking

#### Filter Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Date From | Date | Yes | Period start |
| Date To | Date | Yes | Period end |
| Recipe | Multi-select | No | Specific recipes |
| Location | Dropdown | No | Production location |

#### Data Columns

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| Recipe Code | Text | Recipe identifier |
| Recipe Name | Text | Recipe description |
| Production Date | Date | Production date |
| Batches Produced | Integer | Number of batches |
| Ingredient Code | Text | Material code |
| Ingredient Name | Text | Material description |
| Standard Qty | Decimal | Standard quantity per batch |
| Total Standard Qty | Decimal | Total standard for batches |
| Actual Qty Used | Decimal | Actual consumption |
| Variance Qty | Decimal | Difference |
| Variance % | Percentage | Variance percentage |
| Standard Cost | Currency | Standard cost |
| Actual Cost | Currency | Actual cost |
| Cost Variance | Currency | Cost difference |

#### Business Rules

- Compare actual vs standard consumption
- Calculate variances by recipe
- Track by production date
- Identify waste or inefficiency
- Support batch production
- Calculate cost impacts
- Export for analysis
- Alert on significant variances

---

## Technical Specifications

### Common Technical Requirements

#### Date Handling
- All dates in format: DD/MM/YYYY or YYYY-MM-DD
- Support date range selections
- Default to current month for most reports
- Support fiscal period selection

#### Currency and Numbers
- Support multiple currencies
- Display currency code
- Decimal precision: 2 places for currency, 4 for quantities
- Thousand separator formatting
- Support exchange rates

#### Filtering Standards
- All list/detail reports support date range filtering
- Multi-select filters for categories, locations, products
- Save filter preferences per user
- Quick date filters (Today, This Week, This Month, This Quarter, This Year)

#### Sorting and Grouping
- Default sort by date descending
- Support multi-level sorting
- Grouping with subtotals
- Grand totals at report end

#### Export Capabilities
- Export to Excel (.xlsx)
- Export to PDF
- Export to CSV
- Maintain formatting in exports

#### Print Requirements
- Print preview capability
- Page setup (portrait/landscape)
- Header with company logo and report title
- Footer with page numbers and print date/time
- User and filter parameters displayed

#### Performance Requirements
- Reports load within 5 seconds for standard date ranges
- Support pagination for large datasets
- Limit initial display to 1000 rows with "load more"
- Background processing for complex reports

#### Security and Access Control
- Role-based access to reports
- Data filtering by user permissions
- Audit trail for report execution
- Sensitive data masking where applicable

#### Data Refresh
- Real-time data for balance reports
- Near real-time (5 min delay) for transaction reports
- Historical snapshot capability
- Manual refresh option

---

## Implementation Priority

### Phase 1 - Critical (Immediate)
1. Purchase Request Detail Report
2. Purchase Order Detail
3. Receiving Detail Report
4. Inventory Balance Report
5. Stock Card Detailed Report

### Phase 2 - High Priority
6. Purchase Analysis by Item Report
7. Top Purchasing Report
8. Credit Note Detail
9. Vendor Detailed
10. Product List
11. Inventory Movement Detailed By Product
12. Slow Moving Report
13. Expired Items Report

### Phase 3 - Medium Priority
14. Store Requisition Detail
15. Issue Detail
16. Stock In Detail
17. Stock Out Detail
18. Inventory Aging Report
19. Recipe Card
20. Material Consumption

### Phase 4 - Standard Implementation
21. All remaining list reports
22. All summary reports
23. Analysis and optimization reports

---

## Appendix

### Status Definitions

**OK**: Specification complete and approved for development
**Pending**: Under review or awaiting requirements
**On Process**: Currently in development
**Send to P'Aek**: Sent to development team

### Module Definitions

- **PR**: Purchase Request module
- **PO**: Purchase Order module
- **RC**: Receiving module
- **CR**: Credit Note module
- **SR**: Store Requisition module
- **SI**: Stock In module
- **SO**: Stock Out module
- **Inventory/inventory**: Inventory management module
- **Closing**: Period-end closing module
- **GL Check**: General Ledger reconciliation

### Report Type Definitions

- **List Report**: Summary view, one row per document
- **Detail Report**: Complete information including all line items
- **Analysis Report**: Analytical view with calculations and trends
- **Master Data Report**: Reference data listing
- **Variance Report**: Comparison between expected and actual

---

**End of Document**

*This Master Specification Document is a living document and will be updated as requirements evolve and new features are identified.*