# Purchase Order Module - Business Analysis Documentation

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive business analysis of the Purchase Order (PO) module within the Carmen F&B Management System. The module is essential for managing and tracking purchase orders, ensuring proper vendor relationships, and maintaining accurate procurement records.

### 1.2 Scope
The document covers the entire purchase order process, including PO creation, vendor management, item management, financial processing, and document tracking. It encompasses various types of purchases from office supplies to capital equipment.

### 1.3 Audience
- Procurement officers
- Finance managers
- Department managers
- Vendors/Suppliers
- System administrators
- Development team
- Quality assurance team

### 1.4 Version History
| Version | Date       | Author | Changes Made |
|---------|------------|---------|--------------|
| 1.0     | 2024-03-20 | System  | Initial version |

## 2. Business Context

### 2.1 Business Objectives
- Streamline purchase order creation and management
- Ensure accurate vendor and pricing information
- Maintain procurement compliance and control
- Track order status and delivery
- Monitor procurement spending
- Support audit requirements
- Enable efficient workflow management

### 2.2 Module Overview
The Purchase Order module manages the following key functions:
- PO Creation and Management
- Vendor Integration
- Item Management
- Budget Control
- Financial Processing
- Document Management
- Status Tracking
- Delivery Management

### 2.3 Key Stakeholders
- Procurement Officers
- Finance Team
- Department Managers
- Vendors/Suppliers
- Budget Controllers
- Inventory Managers
- System Administrators
- Auditors

## 3. Business Rules

### 3.1 PO Creation Rules
- **PO_001**: All POs must have unique reference numbers
- **PO_002**: POs must be linked to approved purchase requests
- **PO_003**: Required fields include vendor, delivery date, and currency
- **PO_004**: Items must include quantity, unit, and price
- **PO_005**: Description and credit terms are mandatory

### 3.2 Vendor Rules
- **PO_006**: Vendor must be from approved vendor list
- **PO_007**: Vendor credit terms must be specified
- **PO_008**: Currency and exchange rates required for foreign vendors
- **PO_009**: Vendor contact information mandatory
- **PO_010**: Price validation against vendor price lists

### 3.3 Financial Rules
- **PO_011**: Tax calculations must be itemized
- **PO_012**: Discount applications must be documented
- **PO_013**: Currency conversion rules must be followed
- **PO_014**: Budget validation required
- **PO_015**: Total amount calculations must include all adjustments

### 3.4 Status Rules
- **PO_016**: Status transitions must follow defined workflow
- **PO_017**: Status changes must be logged
- **PO_018**: Closed POs cannot be modified
- **PO_019**: Voided POs require documentation
- **PO_020**: Partial receipts must be tracked

### 3.5 UI Rules
- **PO_021**: PO list must display key information (PO number, vendor, date, status, total)
- **PO_022**: Item grid must support inline editing for quantities and prices
- **PO_023**: Financial summary must update in real-time as items are modified
- **PO_024**: Status changes must be reflected immediately in the UI
- **PO_025**: Validation errors must be displayed clearly next to relevant fields
- **PO_026**: Required fields must be visually marked with asterisk (*)
- **PO_027**: Currency fields must display appropriate currency symbols
- **PO_028**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **PO_029**: Action buttons must be disabled based on user permissions
- **PO_030**: Print preview must match final PO document format
- **PO_031**: All monetary amounts must be displayed with 2 decimal places
- **PO_032**: All quantities must be displayed with 3 decimal places
- **PO_033**: Exchange rates must be displayed with 5 decimal places
- **PO_034**: All numeric values must be right-aligned
- **PO_035**: All numeric values must use system's regional numeric format
- **PO_036**: Date inputs must enforce regional format validation
- **PO_037**: Date/time values must be stored as timestamptz in UTC
- **PO_038**: Time zone conversions must respect daylight saving rules
- **PO_039**: Calendar controls must indicate working days and holidays
- **PO_040**: Date range validations must consider time zone differences

### 3.6 System Calculations Rules
- **PO_036**: Item subtotal = Round(Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **PO_037**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **PO_038**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **PO_039**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **PO_040**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **PO_041**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
- **PO_042**: Order subtotal = Round(Sum of Round(item subtotals, 2), 2)
- **PO_043**: Order total discount = Round(Sum of Round(item discounts, 2), 2)
- **PO_044**: Order total tax = Round(Sum of Round(item taxes, 2), 2)
- **PO_045**: Order final total = Round(Round(Order subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)
- **PO_046**: All intermediate calculations must be rounded before use in subsequent calculations
- **PO_047**: Final rounding must use half-up (banker's) rounding method
- **PO_048**: Quantity conversions must be rounded to 3 decimals before use
- **PO_049**: Exchange rate calculations must use 5 decimal precision before monetary rounding
- **PO_050**: Regional numeric format must be applied after all calculations and rounding
- **PO_051**: Each step in multi-step calculations must round intermediate results
- **PO_052**: Running totals must be rounded before adding each new value
- **PO_053**: Percentage calculations must round result before applying to base amount
- **PO_054**: Cross-currency calculations must round after each currency conversion
- **PO_055**: Tax-inclusive price breakdowns must round each component

## 4. Data Definitions

### 4.1 Purchase Order
```typescript
interface PurchaseOrder {
  poId: string
  number: string
  vendorId: number
  vendorName: string
  orderDate: Date
  DeliveryDate?: Date
  status: PurchaseOrderStatus
  currencyCode: string
  exchangeRate: number
  notes?: string
  createdBy: number
  approvedBy?: number
  approvalDate?: Date
  email: string
  buyer: string
  creditTerms: string
  description: string
  remarks: string
  items: PurchaseOrderItem[]
  baseCurrencyCode: string
  baseSubTotalPrice: number
  subTotalPrice: number
  baseNetAmount: number
  netAmount: number
  baseDiscAmount: number
  discountAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
}
```

### 4.2 Purchase Order Item
```typescript
interface PurchaseOrderItem {
  id: string
  name: string
  description: string
  convRate: number
  orderedQuantity: number
  orderUnit: string
  baseQuantity: number
  baseUnit: string
  baseReceivingQty: number
  receivedQuantity: number
  remainingQuantity: number
  unitPrice: number
  status: PurchaseRequestItemStatus
  isFOC: boolean
  taxRate: number
  discountRate: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  totalAmount: number
  comment?: string
  taxIncluded: boolean
  adjustments?: {
    discount: boolean
    tax: boolean
  }
  inventoryInfo: {
    onHand: number
    onOrdered: number
    reorderLevel: number
    restockLevel: number
    averageMonthlyUsage: number
    lastPrice: number
    lastOrderDate: Date
    lastVendor: string
  }
}
```

### 4.3 Purchase Order Status
```typescript
enum PurchaseOrderStatus {
  Open = "Open",
  Voided = "Voided",
  Closed = "Closed",
  Draft = "Draft",
  Sent = "Sent",
  Partial = "Partial",
  FullyReceived = "FullyReceived",
  Cancelled = "Cancelled",
  Deleted = "Deleted"
}
```

## 5. Logic Implementation

### 5.1 PO Creation Process
1. Initialize from approved PR or new PO
2. Validate vendor information
3. Add and configure items
4. Calculate financial values
5. Apply taxes and discounts
6. Validate budget availability
7. Generate PO number
8. Save and activate PO

### 5.2 Financial Processing
1. Calculate item subtotals
2. Apply item-level discounts
3. Calculate item-level taxes
4. Sum all item totals
5. Apply order-level adjustments
6. Convert currencies if needed
7. Calculate final totals

### 5.3 Status Management
1. Track PO status changes
2. Update related documents
3. Manage partial receipts
4. Handle order modifications
5. Process order closure
6. Handle order cancellation

### 5.4 Document Management
1. Generate PO document
2. Manage attachments
3. Track version history
4. Handle amendments
5. Process approvals
6. Maintain audit trail

## 6. Validation and Testing

### 6.1 Data Validation
- Validate vendor details
- Check item specifications
- Verify pricing information
- Validate currency conversions
- Check budget availability
- Verify document relationships

### 6.2 Business Rule Validation
- Test PO creation rules
- Verify vendor rules
- Validate financial calculations
- Check status transitions
- Test document management
- Verify audit logging

### 6.3 Test Scenarios
1. Standard PO creation
2. Foreign currency PO
3. Multi-item PO
4. Partial receipts
5. Order modifications
6. Order cancellation
7. Budget validation
8. Document generation

### 6.4 Error Handling
- Invalid vendor errors
- Budget validation errors
- Calculation errors
- Status transition errors
- Document generation errors
- Integration errors

## 7. Maintenance and Governance

### 7.1 Module Ownership
- **Primary Owner**: Procurement Department
- **Technical Owner**: IT Department
- **Process Owner**: Finance Department

### 7.2 Review Process
- Daily PO review
- Weekly budget review
- Monthly vendor review
- Quarterly system audit
- Regular error log review

### 7.3 Change Management
- PO modification workflow
- Version control procedures
- User communication plan
- Training requirements
- Documentation updates

## 8. Appendices

### 8.1 Glossary
- **PO**: Purchase Order
- **PR**: Purchase Request
- **FOC**: Free of Charge
- **GRN**: Goods Received Note
- **Base Currency**: Primary currency for accounting

### 8.2 References
- Procurement Policy Manual
- Vendor Management Guidelines
- Financial Processing Guidelines
- System Technical Documentation

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Procurement Manager | | | |
| Finance Manager | | | |
| IT Manager | | | |
| Operations Manager | | | | 