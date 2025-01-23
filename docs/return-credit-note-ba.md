# Return Credit Note Module - Business Analysis Documentation

## 1. Introduction

### Purpose
This document outlines the business logic and requirements for the Return Credit Note (RCN) module within the Carmen F&B Management System. It serves as a comprehensive guide for developers, testers, and business stakeholders to understand credit note processes, workflows, and business rules.

### Scope
The documentation covers the entire Return Credit Note module, including:
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
| 1.0.0 | 2024-01-19 | System | Initial documentation |

## 2. Business Context

### Business Objectives
- Streamline vendor return and credit note processes
- Ensure accurate inventory adjustments
- Maintain proper financial records
- Handle tax implications correctly
- Support multi-currency transactions
- Enable efficient workflow management
- Provide comprehensive audit trail

### Module Overview
The Return Credit Note module consists of several key components:
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
- **CN_INV_004**: Update inventory levels upon approval
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

### 3.5 UI Rules
- **RCN_021**: RCN list must display key information (RCN number, vendor, date, status, total)
- **RCN_022**: Item grid must support inline editing for return quantities and actual costs
- **RCN_023**: Financial summary must update in real-time as items are modified
- **RCN_024**: Status changes must be reflected immediately in the UI
- **RCN_025**: Validation errors must be displayed clearly next to relevant fields
- **RCN_026**: Required fields must be visually marked with asterisk (*)
- **RCN_027**: Currency fields must display appropriate currency symbols
- **RCN_028**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **RCN_029**: Action buttons must be disabled based on user permissions
- **RCN_030**: Print preview must match final RCN document format
- **RCN_031**: All monetary amounts must be displayed with 2 decimal places
- **RCN_032**: All quantities must be displayed with 3 decimal places
- **RCN_033**: Exchange rates must be displayed with 5 decimal places
- **RCN_034**: All numeric values must be right-aligned
- **RCN_035**: All numeric values must use system's regional numeric format
- **RCN_036**: Date inputs must enforce regional format validation
- **RCN_037**: Date/time values must be stored as timestamptz in UTC
- **RCN_038**: Time zone conversions must respect daylight saving rules
- **RCN_039**: Calendar controls must indicate working days and holidays
- **RCN_040**: Date range validations must consider time zone differences

### 3.6 System Calculations Rules
- **RCN_041**: Item subtotal = Round(Return Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **RCN_042**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **RCN_043**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **RCN_044**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **RCN_045**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **RCN_046**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
- **RCN_047**: Return subtotal = Round(Sum of Round(item subtotals, 2), 2)
- **RCN_048**: Return total discount = Round(Sum of Round(item discounts, 2), 2)
- **RCN_049**: Return total tax = Round(Sum of Round(item taxes, 2), 2)
- **RCN_050**: Return final total = Round(Round(Return subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)
- **RCN_051**: All intermediate calculations must be rounded before use in subsequent calculations
- **RCN_052**: Final rounding must use half-up (banker's) rounding method
- **RCN_053**: Quantity conversions must be rounded to 3 decimals before use
- **RCN_054**: Exchange rate calculations must use 5 decimal precision before monetary rounding
- **RCN_055**: Regional numeric format must be applied after all calculations and rounding
- **RCN_056**: Each step in multi-step calculations must round intermediate results
- **RCN_057**: Running totals must be rounded before adding each new value
- **RCN_058**: Percentage calculations must round result before applying to base amount
- **RCN_059**: Cross-currency calculations must round after each currency conversion
- **RCN_060**: Tax-inclusive price breakdowns must round each component
- **RCN_061**: Variance calculations between GRN and actual return quantities must be rounded to 3 decimals
- **RCN_062**: Cost variance calculations between GRN and actual return costs must be rounded to 2 decimals
- **RCN_063**: Average cost adjustments must maintain 5 decimal precision before final rounding
- **RCN_064**: Return cost allocations must be rounded to 2 decimals for each component
- **RCN_065**: Inventory value reversals must be rounded to 2 decimals

### 3.7 Extra Cost Distribution Rules
- **RCN_066**: Extra costs must be distributed using one of the following methods:
  - By Value: Round(Round(Item Value, 2) / Round(Total Value, 2) × Extra Cost, 2)
  - By Quantity: Round(Round(Item Quantity, 3) / Round(Total Quantity, 3) × Extra Cost, 2)
  - By Weight: Round(Round(Item Weight, 3) / Round(Total Weight, 3) × Extra Cost, 2)
  - By Volume: Round(Round(Item Volume, 3) / Round(Total Volume, 3) × Extra Cost, 2)
  - Equal Split: Round(Extra Cost / Number of Items, 2)

- **RCN_067**: Distribution rounding rules:
  - **RCN_067.1**: Each distribution calculation step must be rounded before use
  - **RCN_067.2**: Distribution ratios must sum to 1.0000 (4 decimal places)
  - **RCN_067.3**: Any rounding difference must be allocated to the highest value item
  - **RCN_067.4**: Negative extra costs must follow the same distribution rules

- **RCN_068**: Extra cost types and sequence:
  - **RCN_068.1**: Return freight charges must be distributed first
  - **RCN_068.2**: Return insurance costs must be distributed second
  - **RCN_068.3**: Return handling charges must be distributed third
  - **RCN_068.4**: Return duties must be distributed fourth
  - **RCN_068.5**: Other return charges must be distributed last

- **RCN_069**: Return cost calculation:
  - **RCN_069.1**: Base return cost = Round(Unit Cost × Return Quantity, 2)
  - **RCN_069.2**: Distributed costs = Sum of all Round(distributed extra costs, 2)
  - **RCN_069.3**: Total return cost = Round(Base return cost + Distributed costs, 2)
  - **RCN_069.4**: Unit return cost = Round(Total return cost / Return Quantity, 5)

- **RCN_070**: Extra cost adjustments:
  - **RCN_070.1**: Added extra costs must trigger recalculation of all distributions
  - **RCN_070.2**: Removed extra costs must trigger recalculation of all distributions
  - **RCN_070.3**: Modified extra costs must trigger recalculation of all distributions
  - **RCN_070.4**: Distribution method changes must trigger recalculation

- **RCN_071**: Distribution exclusions:
  - **RCN_071.1**: Free of charge returns must be excluded from value-based distribution
  - **RCN_071.2**: Zero-quantity returns must be excluded from quantity-based distribution
  - **RCN_071.3**: Zero-weight returns must be excluded from weight-based distribution
  - **RCN_071.4**: Zero-volume returns must be excluded from volume-based distribution

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
  approvedBy: string
  approvedDate: Date
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

## 5. Logic Implementation

### Credit Note Creation Process
- Initial Creation:
  - Reference Number Generation
  - Vendor Selection
  - Item Return Details
  - Unit Conversion Handling
  - Lot Selection
- Validation Rules:
  - Required Fields
  - Quantity Validation
  - Price Validation
  - Tax Calculation
  - Currency Conversion

### Inventory Processing
- Stock Movement:
  - Lot Tracking
  - FIFO Layer Updates
  - Unit Conversions
  - Cost Calculations
  - Inventory Adjustments

### Financial Processing
- Journal Entries:
  - AP Credit Notes
  - Inventory Adjustments
  - Tax Entries
  - Exchange Differences
  - Period-End Processing

## 6. Validation and Testing

### Test Scenarios
1. Credit Note Creation
   - Basic Credit Note Creation
   - Multi-Currency Handling
   - Lot Selection
   - Unit Conversion
   - Tax Calculation

2. Inventory Processing
   - Stock Movement
   - Lot Tracking
   - FIFO Updates
   - Cost Calculations
   - Partial Returns

3. Financial Validation
   - Journal Entries
   - Tax Processing
   - Currency Handling
   - Period Closing
   - Audit Trail

### Error Handling
- Duplicate Prevention
- Quantity Validation
- Price Validation
- Currency Conversion
- System Errors

## 7. Maintenance and Governance

### Ownership
- Primary Owner: Finance Department
- Technical Owner: IT Department
- Process Owner: Procurement Department

### Review Process
1. Daily credit note review
2. Weekly inventory reconciliation
3. Monthly tax review
4. Quarterly system audit

### Change Management
1. All changes must be documented
2. Impact analysis required
3. Stakeholder approval needed
4. Training requirements identified

## 8. Appendices

### Glossary
- **RCN**: Return Credit Note
- **GRN**: Goods Received Note
- **FIFO**: First In, First Out
- **VAT**: Value Added Tax
- **WHT**: Withholding Tax
- **NBCA**: Non-Base Currency Adjustment

### References
- Financial Guidelines
- Tax Regulations
- Inventory Management Procedures
- Audit Requirements

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Finance Manager | | | |
| Procurement Manager | | | |
| IT Manager | | | |
| Tax Manager | | | | 