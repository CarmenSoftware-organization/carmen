# Credit Note Module - Business Requirements

## 1. Introduction

### Purpose
This document outlines the business logic and requirements for the Credit Note (CN) module within the Carmen F&B Management System. It serves as a comprehensive guide for developers, testers, and business stakeholders to understand credit note processes and business rules.

### Scope
The documentation covers the entire Credit Note module, including:
- Credit Note Creation and Management
- Item Return Processing
- Inventory Impact Management
- Financial Processing
- Tax Handling
- Document Management
- Closed Period Adjustments

### Audience
- Procurement Team
- Finance Department
- Inventory Managers
- Tax Accountants
- Vendors/Suppliers
- System Administrators
- Auditors

### Version History
| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0.0 | 2024-03-27 | System | Initial documentation |

## 2. Business Context

### Business Objectives
- Streamline vendor return and credit note processes
- Ensure accurate inventory adjustments
- Maintain proper financial records
- Handle tax implications correctly
- Support multi-currency transactions
- Provide comprehensive audit trail

### Module Overview
The Credit Note module consists of several key components:
1. Credit Note Creation and Management
2. Item Return Processing
3. Inventory Adjustment System
4. Financial Processing
5. Tax Management
6. Document Management
7. Audit Trail System

### Key Stakeholders
- Procurement Managers
- Finance Team
- Inventory Controllers
- Tax Accountants
- Vendors/Suppliers
- Auditors
- System Administrators

## 3. Business Rules

### Credit Note Creation (CN_CRT)
- **CN_CRT_001**: All credit notes must have unique reference numbers
- **CN_CRT_002**: Must reference original GRN or Invoice
- **CN_CRT_003**: Required fields include vendor, date, currency, and reason
- **CN_CRT_004**: Items must include quantity, unit, and price details
- **CN_CRT_005**: Multi-currency support with exchange rate handling

### Inventory Management (CN_INV)
- **CN_INV_001**: Track both order units and inventory units
- **CN_INV_002**: Support lot number tracking
- **CN_INV_003**: Handle partial lot returns
- **CN_INV_005**: FIFO cost calculation for returns

### Financial Processing (CN_FIN)
- **CN_FIN_001**: Tax calculations must be itemized
- **CN_FIN_002**: Support multiple currencies
- **CN_FIN_003**: Handle exchange rate differences
- **CN_FIN_004**: Create appropriate journal entries
- **CN_FIN_005**: Support closed period adjustments

### Tax Management (CN_TAX)
- **CN_TAX_001**: Calculate tax credit based on original tax
- **CN_TAX_002**: Handle partial returns tax calculation
- **CN_TAX_003**: Support tax rate changes
- **CN_TAX_004**: Update Input VAT reports
- **CN_TAX_005**: Multi-currency tax handling

### UI Rules (CN_UI)
- **CN_UI_001**: CN list must display key information (CN number, vendor, date, status, total)
- **CN_UI_002**: Item grid must support inline editing for return quantities and actual costs
- **CN_UI_003**: Financial summary must update in real-time as items are modified
- **CN_UI_004**: Status changes must be reflected immediately in the UI
- **CN_UI_005**: Validation errors must be displayed clearly next to relevant fields
- **CN_UI_006**: Required fields must be visually marked with asterisk (*)
- **CN_UI_007**: Currency fields must display appropriate currency symbols
- **CN_UI_008**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **CN_UI_009**: Action buttons must be disabled based on user permissions
- **CN_UI_010**: Print preview must match final CN document format
- **CN_UI_011**: All monetary amounts must be displayed with 2 decimal places
- **CN_UI_012**: All quantities must be displayed with 3 decimal places
- **CN_UI_013**: Exchange rates must be displayed with 5 decimal places
- **CN_UI_014**: All numeric values must be right-aligned
- **CN_UI_015**: All numeric values must use system's regional numeric format
- **CN_UI_016**: Date inputs must enforce regional format validation
- **CN_UI_017**: Date/time values must be stored as timestamptz in UTC
- **CN_UI_018**: Time zone conversions must respect daylight saving rules
- **CN_UI_019**: Calendar controls must indicate working days and holidays
- **CN_UI_020**: Date range validations must consider time zone differences

### System Calculations Rules (CN_CALC)
- **CN_CALC_001**: Item subtotal = Round(Return Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **CN_CALC_002**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **CN_CALC_003**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **CN_CALC_004**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **CN_CALC_005**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **CN_CALC_006**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
- **CN_CALC_007**: Return subtotal = Round(Sum of Round(item subtotals, 2), 2)
- **CN_CALC_008**: Return total discount = Round(Sum of Round(item discounts, 2), 2)
- **CN_CALC_009**: Return total tax = Round(Sum of Round(item taxes, 2), 2)
- **CN_CALC_010**: Return final total = Round(Round(Return subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)
- **CN_CALC_011**: All intermediate calculations must be rounded before use in subsequent calculations
- **CN_CALC_012**: Final rounding must use half-up (banker's) rounding method
- **CN_CALC_013**: Quantity conversions must be rounded to 3 decimals before use
- **CN_CALC_014**: Exchange rate calculations must use 5 decimal precision before monetary rounding
- **CN_CALC_015**: Regional numeric format must be applied after all calculations and rounding
- **CN_CALC_016**: Each step in multi-step calculations must round intermediate results
- **CN_CALC_017**: Running totals must be rounded before adding each new value
- **CN_CALC_018**: Percentage calculations must round result before applying to base amount
- **CN_CALC_019**: Cross-currency calculations must round after each currency conversion
- **CN_CALC_020**: Tax-inclusive price breakdowns must round each component

### Extra Cost Distribution Rules (CN_DIST)
- **CN_DIST_001**: Extra costs must be distributed using one of the following methods:
  - By Value: Round(Round(Item Value, 2) / Round(Total Value, 2) × Extra Cost, 2)
  - By Quantity: Round(Round(Item Quantity, 3) / Round(Total Quantity, 3) × Extra Cost, 2)
  - By Weight: Round(Round(Item Weight, 3) / Round(Total Weight, 3) × Extra Cost, 2)
  - By Volume: Round(Round(Item Volume, 3) / Round(Total Volume, 3) × Extra Cost, 2)
  - Equal Split: Round(Extra Cost / Number of Items, 2)

- **CN_DIST_002**: Distribution rounding rules:
  - Each distribution calculation step must be rounded before use
  - Distribution ratios must sum to 1.0000 (4 decimal places)
  - Any rounding difference must be allocated to the highest value item
  - Negative extra costs must follow the same distribution rules

- **CN_DIST_003**: Extra cost types and sequence:
  - Return freight charges must be distributed first
  - Return insurance costs must be distributed second
  - Return handling charges must be distributed third
  - Return duties must be distributed fourth
  - Other return charges must be distributed last

- **CN_DIST_004**: Return cost calculation:
  - Base return cost = Round(Unit Cost × Return Quantity, 2)
  - Distributed costs = Sum of all Round(distributed extra costs, 2)
  - Total return cost = Round(Base return cost + Distributed costs, 2)
  - Unit return cost = Round(Total return cost / Return Quantity, 5)

- **CN_DIST_005**: Extra cost adjustments:
  - Added extra costs must trigger recalculation of all distributions
  - Removed extra costs must trigger recalculation of all distributions
  - Modified extra costs must trigger recalculation of all distributions
  - Distribution method changes must trigger recalculation

- **CN_DIST_006**: Distribution exclusions:
  - Free of charge returns must be excluded from value-based distribution
  - Zero-quantity returns must be excluded from quantity-based distribution
  - Zero-weight returns must be excluded from weight-based distribution
  - Zero-volume returns must be excluded from volume-based distribution

## 4. Data Definitions

### Credit Note Header Entity
```typescript
interface CreditNoteHeader {
  id: string
  documentNumber: string
  documentDate: Date
  postingDate: Date
  documentType: CreditNoteType
  status: DocumentStatus
  branchId: string
  vendorId: string
  vendorCode: string
  vendorName: string
  vendorTaxId: string
  taxInvoiceNumber: string
  taxInvoiceDate: Date
  vatRate: number
  whtRate: number
  currencyCode: string
  exchangeRate: number
  exchangeRateDate: Date
  referenceNumber: string
  departmentId: string
  reason: string
  remarks: string
  accountingPeriod: string
  taxPeriod: string
  createdBy: string
  createdDate: Date
  modifiedBy: string
  modifiedDate: Date
}
```

### Credit Note Item Entity
```typescript
interface CreditNoteItem {
  id: string
  creditNoteId: string
  lineNumber: number
  itemCode: string
  itemDescription: string
  itemType: ItemType
  orderUnitCode: string
  orderQuantity: number
  stockUnitCode: string
  stockQuantity: number
  unitConversion: number
  unitPrice: number
  amount: number
  discountPercent: number
  discountAmount: number
  netAmount: number
  vatAmount: number
  whtAmount: number
  localUnitPrice: number
  localAmount: number
  localNetAmount: number
  lotNumber: string
  fifoLayer: FIFOLayer
  warehouseCode: string
  isNBCA: boolean
  nbcaReference: string
  originalGRNNumber: string
  originalGRNDate: Date
  originalInvoiceNumber: string
  originalCost: number
  currentCost: number
  costVariance: number
}
```

### Credit Note Types
```typescript
enum CreditNoteType {
  RETURN = 'Return',
  PRICE_ADJUSTMENT = 'Price Adjustment',
  QUALITY_ISSUE = 'Quality Issue',
  QUANTITY_DISCREPANCY = 'Quantity Discrepancy',
  OTHER = 'Other'
}
```

### Document Status
```typescript
enum DocumentStatus {
  DRAFT = 'Draft',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}
```

### Item Type
```typescript
enum ItemType {
  INVENTORY = 'Inventory',
  SERVICE = 'Service',
  FIXED_ASSET = 'Fixed Asset',
  NON_INVENTORY = 'Non-Inventory'
}
```

### FIFO Layer
```typescript
interface FIFOLayer {
  id: string
  grnId: string
  grnNumber: string
  grnDate: Date
  lotNumber: string
  expiryDate: Date
  unitCost: number
  quantity: number
  remainingQuantity: number
  createdDate: Date
}
```

## 5. Process Flows

### Credit Note Creation Process
1. User initiates credit note creation
2. System prompts for vendor selection
3. User selects vendor
4. System displays list of GRNs for the vendor
5. User selects GRN to create credit note against
6. System loads GRN items
7. User selects items to return and specifies return quantities
8. System calculates financial impact
9. User provides reason and additional information
10. User saves credit note as draft
11. User reviews credit note details
12. User posts the credit note
13. System updates inventory and financial records

### Credit Note Cancellation Process
1. User selects credit note to cancel
2. System verifies credit note status
3. User provides cancellation reason
4. System cancels credit note
5. System reverses inventory and financial impacts

## 6. Integration Points

### Financial System Integration
- Journal entry creation
- Tax record updates
- Vendor balance adjustments
- Currency exchange handling

### Inventory System Integration
- Stock level adjustments
- Lot tracking updates
- Cost adjustments
- Warehouse location updates

### Procurement System Integration
- GRN reference updates
- PO reference updates
- Vendor performance metrics

### Reporting System Integration
- Financial reporting
- Inventory reporting
- Tax reporting
- Audit trail reporting

## 7. Reporting Requirements

### Credit Note Reports
- Credit Note Register
- Credit Note Detail Report
- Credit Note Summary by Vendor
- Credit Note Summary by Period
- Credit Note Summary by Item
- Credit Note Tax Report
- Credit Note Audit Trail

### Financial Reports
- Journal Entry Report
- Vendor Statement
- Tax Input Report
- Financial Impact Report

### Inventory Reports
- Inventory Adjustment Report
- Lot Tracking Report
- Cost Variance Report
- Return Analysis Report 