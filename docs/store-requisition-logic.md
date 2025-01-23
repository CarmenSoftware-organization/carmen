# Store Requisition Module - Business Analysis Documentation

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive business analysis of the Store Requisition (SR) module within the Carmen F&B Management System. It details the business rules, processes, and technical requirements for managing inter-store transfers and requisitions.

### 1.2 Scope
- Store requisition creation and management
- Inventory movement tracking
- Cost allocation between stores
- Approval workflow management
- Integration with inventory and procurement modules

### 1.3 Audience
- Development Team
- Store Operations Team
- Inventory Management Team
- Finance Team
- System Administrators
- Quality Assurance Team

### 1.4 Version History
| Version | Date | Author | Description |
|---------|------|---------|-------------|
| 1.0.0 | 2024-03-20 | System Analyst | Initial version |

## 2. Business Context

### 2.1 Business Objectives
- Streamline inter-store transfer processes
- Maintain accurate inventory levels across locations
- Ensure proper cost allocation between stores
- Provide real-time visibility of stock movements
- Support efficient approval workflows
- Enable accurate tracking and reporting

### 2.2 Module Overview
The Store Requisition module manages the process of requesting and transferring inventory items between stores or departments. It handles the entire lifecycle from initial request through approval, fulfillment, and final posting of inventory movements.

### 2.3 Key Stakeholders
- Store Managers
- Department Heads
- Inventory Controllers
- Finance Team
- Warehouse Staff
- System Administrators

## 3. Business Rules

### 3.1 Creation Rules (SR_CRT)
- **SR_CRT_001**: Each SR must have a unique reference number in the format 'SR-YYYY-NNN'
- **SR_CRT_002**: Requesting and fulfilling locations must be different and valid in the system
- **SR_CRT_003**: Items must exist in the product master with valid category, subcategory, and item group
- **SR_CRT_004**: Required delivery date must be specified and future dated
- **SR_CRT_005**: Each item must specify quantity, unit, and cost information
- **SR_CRT_006**: Description field is mandatory for the requisition header
- **SR_CRT_007**: Department and job code must be specified for cost allocation
- **SR_CRT_008**: Movement type must be specified (e.g., 'Issue')
- **SR_CRT_009**: Comments can be added with timestamp and user information
- **SR_CRT_010**: Supporting documents can be attached with description and visibility settings

### 3.2 Validation Rules (SR_VAL)
- **SR_VAL_001**: System must validate stock availability at fulfilling location
- **SR_VAL_002**: Quantity validation against on-hand and on-order stock levels
- **SR_VAL_003**: Unit validation against product master settings
- **SR_VAL_004**: Location type validation (direct/inventory) for proper stock handling
- **SR_VAL_005**: Cost validation against last price and current price
- **SR_VAL_006**: Barcode validation for item identification
- **SR_VAL_007**: Category and subcategory access validation
- **SR_VAL_008**: Location code format validation
- **SR_VAL_009**: Total amount calculation validation
- **SR_VAL_010**: Document reference format validation
- **SR_VAL_011**: All dates must be stored as timestamptz in UTC
- **SR_VAL_012**: Date inputs must enforce regional format validation
- **SR_VAL_013**: Time zone conversions must respect daylight saving rules
- **SR_VAL_014**: Calendar controls must indicate working days and holidays
- **SR_VAL_015**: Date range validations must consider time zone differences

### 3.3 Approval Rules (SR_APR)
- **SR_APR_001**: Status progression must follow: Draft → Submitted → Approved → In Process → Completed
- **SR_APR_002**: Each status change must be logged with timestamp and user
- **SR_APR_003**: Approved quantities can differ from requested quantities
- **SR_APR_004**: Items can be individually approved, rejected, or set for review
- **SR_APR_005**: Partial approvals must be supported at line item level
- **SR_APR_006**: Comments are required for rejected items
- **SR_APR_007**: Status changes must update in real-time
- **SR_APR_008**: Void status requires appropriate authorization
- **SR_APR_009**: Draft status allows modifications
- **SR_APR_010**: Complete status requires all items to be processed

### 3.4 Fulfillment Rules (SR_FUL)
- **SR_FUL_001**: Support both direct and inventory location types
- **SR_FUL_002**: Track lot numbers for lot-controlled items
- **SR_FUL_003**: Calculate before and after quantities for each movement
- **SR_FUL_004**: Support partial fulfillment with remaining quantities on backorder
- **SR_FUL_005**: Update inventory balances in real-time
- **SR_FUL_006**: Generate unique lot numbers in format 'LOT-YYYYMMDD-NNN'
- **SR_FUL_007**: Track movement source and destination locations
- **SR_FUL_008**: Calculate and track total movement quantities and costs
- **SR_FUL_009**: Support multiple UoMs with conversions
- **SR_FUL_010**: Maintain movement history with full audit trail

### 3.5 UI Rules (SR_UI)
- **SR_UI_001**: SR list must display key information (date, reference, status, total)
- **SR_UI_002**: Item grid must support inline editing for quantities
- **SR_UI_003**: Financial summary must update in real-time as items are modified
- **SR_UI_004**: Status changes must be reflected immediately in the UI
- **SR_UI_005**: Validation errors must be displayed clearly next to relevant fields
- **SR_UI_006**: All monetary amounts must be displayed with 2 decimal places
- **SR_UI_007**: All quantities must be displayed with 3 decimal places
- **SR_UI_008**: All numeric values must be left-aligned
- **SR_UI_009**: All numeric values must use the system's regional numeric format
- **SR_UI_010**: All dates must be displayed using the system's regional format with UTC offset (e.g., "2024-03-20 14:30:00 +07:00")
- **SR_UI_011**: Calendar inputs must default to user's local timezone
- **SR_UI_012**: Time zone indicator must be visible in all date/time displays
- **SR_UI_013**: Date filters must operate in user's local timezone
- **SR_UI_014**: Date/time tooltips must show both local and UTC time
- **SR_UI_015**: Historical data must show the original timezone of creation

### 3.6 System Calculations Rules (SR_CALC)
- **SR_CALC_001**: Item subtotal = Quantity (3 decimals) × Unit Cost (2 decimals)
- **SR_CALC_002**: Movement quantity calculations must maintain 3 decimal precision
- **SR_CALC_003**: Before/After quantity calculations must consider all pending movements
- **SR_CALC_004**: Cost calculations must use the fulfilling location's cost method
- **SR_CALC_005**: Total cost must be rounded to 2 decimals after all calculations
- **SR_CALC_006**: Unit conversions must maintain precision to avoid rounding errors
- **SR_CALC_007**: Inventory value calculations must use the specified costing method
- **SR_CALC_008**: Movement cost calculations must handle multiple currencies
- **SR_CALC_009**: Extra cost distributions must be calculated proportionally
- **SR_CALC_010**: All calculations must handle negative quantities for returns

## 4. Data Definitions

### 4.1 Requisition Header
```typescript
interface Requisition {
  date: string // ISO 8601 format with timezone (e.g., "2024-03-20T14:30:00+07:00")
  refNo: string
  requestTo: string
  storeName: string
  description: string
  status: 'In Process' | 'Complete' | 'Reject' | 'Void' | 'Draft'
  totalAmount: number
  items: RequisitionItem[]
  movement: {
    source: string
    sourceName: string
    destination: string
    destinationName: string
    type: string
  }
  createdAt: string // ISO 8601 format with timezone
  updatedAt: string // ISO 8601 format with timezone
  timezone: string // IANA timezone identifier (e.g., "Asia/Bangkok")
}
```

### 4.2 Requisition Item
```typescript
interface RequisitionItem {
  id: number
  description: string
  unit: string
  qtyRequired: number
  qtyApproved: number
  costPerUnit: number
  total: number
  requestDate: string // ISO 8601 format with timezone
  inventory: {
    onHand: number
    onOrder: number
    lastPrice: number
    lastVendor: string
  }
  itemInfo: {
    location: string
    locationCode: string
    itemName: string
    category: string
    subCategory: string
    itemGroup: string
    barCode: string
    locationType: 'direct' | 'inventory'
  }
  qtyIssued: number
  approvalStatus: 'Accept' | 'Reject' | 'Review'
  createdAt: string // ISO 8601 format with timezone
  updatedAt: string // ISO 8601 format with timezone
}
```

### 4.3 Stock Movement
```typescript
interface StockMovement {
  id: number
  movementType: string
  sourceDocument: string
  commitDate: string // ISO 8601 format with timezone
  postingDate: string // ISO 8601 format with timezone
  status: string
  movement: {
    source: string
    sourceName: string
    destination: string
    destinationName: string
    type: string
  }
  items: {
    id: number
    productName: string
    sku: string
    uom: string
    beforeQty: number
    inQty: number
    outQty: number
    afterQty: number
    unitCost: number
    totalCost: number
    location: {
      type: 'INV' | 'DIR'
      code: string
      name: string
      displayType: string
    }
    lots: {
      lotNo: string
      quantity: number
      uom: string
      createdAt: string // ISO 8601 format with timezone
    }[]
  }[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
    lotCount: number
  }
  createdAt: string // ISO 8601 format with timezone
  updatedAt: string // ISO 8601 format with timezone
  timezone: string // IANA timezone identifier
}
```

## 5. Logic Implementation

### 5.1 Store Requisition Process
- Creation and Approval:
  - Reference Number Generation
  - Item Selection and Quantity
  - Cost Calculation
  - Approval Workflow
  - Stock Availability Check
- Movement Processing:
  - Stock Deduction
  - Location Updates
  - Cost Updates
  - History Tracking

### 5.2 Inventory Management
- Stock Level Management:
  - Real-time Balance Updates
  - Lot Tracking
  - Movement History
  - Cost Tracking
- Location Management:
  - Direct vs Inventory Locations
  - Movement Types
  - Cost Methods
  - Stock Restrictions

### 5.3 Cost Management
- Cost Calculation:
  - Unit Cost Determination
  - Total Cost Calculation
  - Currency Handling
  - Extra Cost Distribution
- Cost Allocation:
  - Department Allocation
  - Job Code Tracking
  - Cost Center Updates
  - Historical Cost Maintenance

## 6. Validation and Testing

### 6.1 Data Validation
- Reference number format and uniqueness
- Required field completeness
- Business rule compliance
- Calculation accuracy
- Status progression
- User authorization

### 6.2 Business Rule Validation
- Location validation
- Stock availability
- Cost calculation
- Movement processing
- Approval workflow
- Integration points

### 6.3 Test Scenarios
- Normal flow requisition
- Partial approval and fulfillment
- Multi-location movements
- Cost calculation scenarios
- Integration testing
- Error handling

### 6.4 Error Handling
- Validation errors
- Process errors
- System errors
- Integration errors
- Recovery procedures

## 7. Maintenance and Governance

### 7.1 Module Ownership
- Primary Owner: Store Operations Team
- Technical Owner: IT Development Team
- Business Process Owner: Operations Manager

### 7.2 Review Process
- Quarterly business rule review
- Monthly performance review
- Weekly operation review
- Daily monitoring

### 7.3 Change Management
- Change request process
- Impact assessment
- Approval workflow
- Implementation procedure
- Documentation update

## 8. Appendices

### 8.1 Glossary
- SR: Store Requisition
- UoM: Unit of Measure
- FIFO: First In, First Out
- DIR: Direct Location
- INV: Inventory Location

### 8.2 References
- Inventory Management Policy
- Cost Allocation Guidelines
- System Architecture Document
- User Manual
- API Documentation

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Analyst | | | |
| Technical Lead | | | |
| Operations Manager | | | |
| System Architect | | | | 