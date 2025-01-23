# Goods Received Note Module - Business Analysis Documentation

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive business analysis of the Goods Received Note (GRN) module within the Carmen F&B Management System. The GRN module is essential for managing and tracking the receipt of goods from vendors, ensuring accurate inventory records, and facilitating proper financial accounting.

### 1.2 Scope
The document covers the entire GRN process, from creation to approval, including inventory updates, financial postings, and integration with other modules such as Purchase Orders and Inventory Management.

### 1.3 Audience
- Procurement team members
- Warehouse staff
- Finance department
- System administrators
- Development team
- Quality assurance team

### 1.4 Version History
| Version | Date       | Author | Changes Made |
|---------|------------|---------|--------------|
| 1.0     | 2024-03-20 | System  | Initial version |

## 2. Business Context

### 2.1 Business Objectives
- Accurately record and track the receipt of goods from vendors
- Ensure proper inventory management and stock level updates
- Facilitate accurate financial accounting and vendor payments
- Maintain audit trails for all goods receipt transactions
- Support both regular purchases and consignment receipts

### 2.2 Module Overview
The GRN module manages the following key functions:
- Creation and management of Goods Receive Notes
- Detailed item management within GRNs
- Extra costs tracking
- Stock movement tracking
- Financial summary generation
- Comments and attachments support
- Activity logging

### 2.3 Key Stakeholders
- Warehouse Managers
- Procurement Officers
- Finance Department
- Vendors
- Auditors
- System Administrators

## 3. Business Rules

### 3.1 GRN Creation Rules
- **GRN_001**: Each GRN must have a unique reference number
- **GRN_002**: GRN must reference a valid Purchase Order (except for cash purchases)
- **GRN_003**: Single vendor per GRN
- **GRN_004**: Valid receiving location required
- **GRN_005**: Authorized receiver must be specified

### 3.2 Item Management Rules
- **GRN_006**: Received quantity cannot exceed ordered quantity
- **GRN_007**: Each item must have valid unit and price information
- **GRN_008**: Lot numbers required for lot-tracked items
- **GRN_009**: Expiry dates required for perishable items
- **GRN_010**: Price variances must be within approved thresholds

### 3.3 Financial Rules
- **GRN_011**: Proper tax handling for taxable items
- **GRN_012**: Exchange rate required for foreign currency transactions
- **GRN_013**: Extra costs must be properly allocated
- **GRN_014**: Cash purchases must reference valid cash book
- **GRN_015**: Automatic AP entry generation upon posting

### 3.4 Approval and Status Rules
- **GRN_016**: Required approvals based on value thresholds
- **GRN_017**: Status progression: Draft → Received → Posted
- **GRN_018**: Posted GRNs cannot be modified
- **GRN_019**: Void requires proper authorization
- **GRN_020**: Status changes must be logged

### 3.5 UI Rules
- **GRN_021**: GRN list must display key information (GRN number, vendor, date, status, total)
- **GRN_022**: Item grid must support inline editing for received quantities and actual costs
- **GRN_023**: Financial summary must update in real-time as items are modified
- **GRN_024**: Status changes must be reflected immediately in the UI
- **GRN_025**: Validation errors must be displayed clearly next to relevant fields
- **GRN_026**: Required fields must be visually marked with asterisk (*)
- **GRN_027**: Currency fields must display appropriate currency symbols
- **GRN_028**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **GRN_029**: Action buttons must be disabled based on user permissions
- **GRN_030**: Print preview must match final GRN document format
- **GRN_031**: All monetary amounts must be displayed with 2 decimal places
- **GRN_032**: All quantities must be displayed with 3 decimal places
- **GRN_033**: Exchange rates must be displayed with 5 decimal places
- **GRN_034**: All numeric values must be right-aligned
- **GRN_035**: All numeric values must use system's regional numeric format
- **GRN_036**: Date inputs must enforce regional format validation
- **GRN_037**: Date/time values must be stored as timestamptz in UTC
- **GRN_038**: Time zone conversions must respect daylight saving rules
- **GRN_039**: Calendar controls must indicate working days and holidays
- **GRN_040**: Date range validations must consider time zone differences

### 3.6 System Calculations Rules
- **GRN_041**: Item subtotal = Round(Received Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **GRN_042**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **GRN_043**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **GRN_044**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **GRN_045**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **GRN_046**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
- **GRN_047**: Receipt subtotal = Round(Sum of Round(item subtotals, 2), 2)
- **GRN_048**: Receipt total discount = Round(Sum of Round(item discounts, 2), 2)
- **GRN_049**: Receipt total tax = Round(Sum of Round(item taxes, 2), 2)
- **GRN_050**: Receipt final total = Round(Round(Receipt subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)
- **GRN_051**: All intermediate calculations must be rounded before use in subsequent calculations
- **GRN_052**: Final rounding must use half-up (banker's) rounding method
- **GRN_053**: Quantity conversions must be rounded to 3 decimals before use
- **GRN_054**: Exchange rate calculations must use 5 decimal precision before monetary rounding
- **GRN_055**: Regional numeric format must be applied after all calculations and rounding
- **GRN_056**: Each step in multi-step calculations must round intermediate results
- **GRN_057**: Running totals must be rounded before adding each new value
- **GRN_058**: Percentage calculations must round result before applying to base amount
- **GRN_059**: Cross-currency calculations must round after each currency conversion
- **GRN_060**: Tax-inclusive price breakdowns must round each component
- **GRN_061**: Variance calculations between PO and actual received quantities must be rounded to 3 decimals
- **GRN_062**: Cost variance calculations between PO and actual costs must be rounded to 2 decimals
- **GRN_063**: Average cost calculations must maintain 5 decimal precision before final rounding
- **GRN_064**: Landed cost allocations must be rounded to 2 decimals for each component
- **GRN_065**: Inventory value adjustments must be rounded to 2 decimals

### 3.7 Extra Cost Distribution Rules
- **GRN_066**: Extra costs must be distributed using one of the following methods:
  - By Value: Round(Round(Item Value, 2) / Round(Total Value, 2) × Extra Cost, 2)
  - By Quantity: Round(Round(Item Quantity, 3) / Round(Total Quantity, 3) × Extra Cost, 2)
  - By Weight: Round(Round(Item Weight, 3) / Round(Total Weight, 3) × Extra Cost, 2)
  - By Volume: Round(Round(Item Volume, 3) / Round(Total Volume, 3) × Extra Cost, 2)
  - Equal Split: Round(Extra Cost / Number of Items, 2)

- **GRN_067**: Distribution rounding rules:
  - **GRN_067.1**: Each distribution calculation step must be rounded before use
  - **GRN_067.2**: Distribution ratios must sum to 1.0000 (4 decimal places)
  - **GRN_067.3**: Any rounding difference must be allocated to the highest value item
  - **GRN_067.4**: Negative extra costs must follow the same distribution rules

- **GRN_068**: Extra cost types and sequence:
  - **GRN_068.1**: Freight charges must be distributed first
  - **GRN_068.2**: Insurance costs must be distributed second
  - **GRN_068.3**: Handling charges must be distributed third
  - **GRN_068.4**: Custom duties must be distributed fourth
  - **GRN_068.5**: Other charges must be distributed last

- **GRN_069**: Landed cost calculation:
  - **GRN_069.1**: Base item cost = Round(Unit Cost × Quantity, 2)
  - **GRN_069.2**: Distributed costs = Sum of all Round(distributed extra costs, 2)
  - **GRN_069.3**: Total landed cost = Round(Base item cost + Distributed costs, 2)
  - **GRN_069.4**: Unit landed cost = Round(Total landed cost / Quantity, 5)

- **GRN_070**: Extra cost adjustments:
  - **GRN_070.1**: Added extra costs must trigger recalculation of all distributions
  - **GRN_070.2**: Removed extra costs must trigger recalculation of all distributions
  - **GRN_070.3**: Modified extra costs must trigger recalculation of all distributions
  - **GRN_070.4**: Distribution method changes must trigger recalculation

- **GRN_071**: Distribution exclusions:
  - **GRN_071.1**: Free of charge items must be excluded from value-based distribution
  - **GRN_071.2**: Zero-quantity items must be excluded from quantity-based distribution
  - **GRN_071.3**: Zero-weight items must be excluded from weight-based distribution
  - **GRN_071.4**: Zero-volume items must be excluded from volume-based distribution

## 4. Data Definitions

### 4.1 GRN Header
\`\`\`typescript
interface GoodsReceiveNote {
  id: string
  ref: string
  date: Date
  invoiceDate?: Date
  invoiceNumber?: string
  taxInvoiceDate?: Date
  taxInvoiceNumber?: string
  description: string
  receiver: string
  vendor: string
  vendorId: string
  location: string
  currency: string
  status: string
  isConsignment: boolean
  isCash: boolean
  cashBook?: string
  items: GoodsReceiveNoteItem[]
  attachments: Attachment[]
  activityLog: ActivityLog[]
  exchangeRate: number
  baseCurrency: string
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
\`\`\`

### 4.2 GRN Item
\`\`\`typescript
interface GoodsReceiveNoteItem {
  id: string
  name: string
  description: string
  jobCode: string
  orderedQuantity: number
  receivedQuantity: number
  unit: string
  unitPrice: number
  subTotalAmount: number
  totalAmount: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  netAmount: number
  expiryDate?: Date
  serialNumber?: string
  notes?: string
  lotNumber: string
  deliveryPoint: string
  deliveryDate: Date
  location: string
  isFreeOfCharge: boolean
  taxIncluded: boolean
  adjustments: {
    discount: boolean
    tax: boolean
  }
}
\`\`\`

## 5. Logic Implementation

### 5.1 GRN Creation Process
1. Initialize GRN with basic information
2. Link to Purchase Order (if applicable)
3. Populate vendor and delivery information
4. Add received items with quantities and prices
5. Calculate financial totals
6. Generate reference number
7. Set initial status

### 5.2 Item Processing
1. Validate received quantities against PO
2. Check lot numbers and expiry dates
3. Calculate item-level totals
4. Apply taxes and discounts
5. Update inventory quantities
6. Track serial numbers (if applicable)

### 5.3 Financial Processing
1. Calculate base amounts in local currency
2. Apply exchange rates for foreign currency
3. Calculate tax amounts
4. Apply extra costs allocation
5. Generate accounting entries
6. Update vendor balances

### 5.4 Approval Workflow
1. Submit GRN for approval
2. Route to appropriate approvers
3. Capture approval decisions
4. Update status based on approvals
5. Generate notifications
6. Log all approval actions

## 6. Validation and Testing

### 6.1 Data Validation
- Validate all required fields
- Check reference number uniqueness
- Verify quantity and amount calculations
- Validate currency and exchange rates
- Check lot number formats
- Verify tax calculations

### 6.2 Business Rule Validation
- Verify PO linkage rules
- Check approval routing rules
- Validate status transitions
- Verify financial posting rules
- Check inventory update rules

### 6.3 Test Scenarios
1. Regular PO-based receipt
2. Cash purchase receipt
3. Consignment receipt
4. Foreign currency receipt
5. Partial receipt
6. Receipt with extra costs
7. Receipt with multiple items
8. Void and correction scenarios

### 6.4 Error Handling
- Invalid quantity errors
- Price variance errors
- Posting errors
- Approval routing errors
- Inventory update errors

## 7. Maintenance and Governance

### 7.1 Module Ownership
- **Primary Owner**: Procurement Department
- **Technical Owner**: IT Department
- **Data Owner**: Finance Department

### 7.2 Review Process
- Monthly review of GRN processing metrics
- Quarterly review of business rules
- Annual audit of approval thresholds
- Regular review of error logs

### 7.3 Change Management
- Change request process for business rules
- Version control for module updates
- User training for new features
- Communication plan for changes

## 8. Appendices

### 8.1 Glossary
- **GRN**: Goods Received Note
- **PO**: Purchase Order
- **AP**: Accounts Payable
- **FOC**: Free of Charge
- **UOM**: Unit of Measure

### 8.2 References
- Procurement Policy Manual
- Financial Accounting Procedures
- Inventory Management Guidelines
- System Technical Documentation

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Procurement Manager | | | |
| Finance Manager | | | |
| IT Manager | | | |
| Quality Assurance | | | | 