# Inventory Adjustment Module - Business Requirements

**Document Status:** Draft  
**Last Updated:** March 27, 2024

## Table of Contents

1. [Introduction](#1-introduction)
2. [Business Context](#2-business-context)
3. [Business Rules](#3-business-rules)
4. [Data Definitions](#4-data-definitions)
5. [Logic Implementation](#5-logic-implementation)
6. [Validation and Testing](#6-validation-and-testing)
7. [Maintenance and Governance](#7-maintenance-and-governance)
8. [Appendices](#8-appendices)

## 1. Introduction

### 1.1 Purpose

This document provides a comprehensive business analysis of the Inventory Adjustment module within the Carmen F&B Management System. It details the business rules, processes, and technical requirements for managing inventory adjustments across all locations.

### 1.2 Scope

- Inventory adjustment creation and processing
- Adjustment reason management
- Cost impact calculation
- Lot tracking and management
- Journal entry generation
- Integration with other inventory modules
- Reporting and analysis

### 1.3 Audience

- Inventory Management Team
- Finance Team
- Operations Managers
- Store Managers
- Auditors
- System Administrators
- Development Team
- Quality Assurance Team

### 1.4 Version History

| Version | Date | Author | Description |
|---------|------|---------|-------------|
| 1.0.0 | 2024-03-27 | System Analyst | Initial version |

## 2. Business Context

### 2.1 Business Objectives

- Maintain accurate inventory records through controlled adjustments
- Track and document reasons for inventory discrepancies
- Calculate and record cost impacts of adjustments
- Maintain audit trail of all adjustment transactions
- Support lot-level inventory management
- Generate accurate financial entries
- Enable analysis of adjustment patterns

### 2.2 Module Overview

The Inventory Adjustment module enables authorized users to make controlled corrections to inventory quantities and values. It supports both positive (IN) and negative (OUT) adjustments with comprehensive tracking of reasons, costs, and documentation.

### 2.3 Key Stakeholders

- Inventory Managers
- Finance Controllers
- Store Managers
- Department Heads
- Auditors
- Cost Controllers
- Operations Directors
- IT Support Team

## 3. Business Rules

### 3.1 Creation Rules (ADJ_CRT)

- **ADJ_CRT_001**: Each adjustment must have a unique reference number
- **ADJ_CRT_002**: Adjustment type must be specified as either IN or OUT
- **ADJ_CRT_003**: Valid location must be selected
- **ADJ_CRT_004**: Reason code is mandatory
- **ADJ_CRT_005**: Description must be provided for audit purposes
- **ADJ_CRT_006**: Items must belong to the selected location
- **ADJ_CRT_007**: Lot numbers are required for lot-tracked items
- **ADJ_CRT_008**: Supporting documents must be attached
- **ADJ_CRT_009**: Department code is mandatory
- **ADJ_CRT_010**: Date must not be in closed accounting period

### 3.2 Validation Rules (ADJ_VAL)

- **ADJ_VAL_001**: Negative stock balance is not allowed
- **ADJ_VAL_002**: Adjustment quantity must not be zero
- **ADJ_VAL_003**: Cost must be provided for all items
- **ADJ_VAL_004**: Lot quantities must not exceed available balance
- **ADJ_VAL_005**: Total cost must match sum of item costs
- **ADJ_VAL_006**: Reason code must match adjustment type
- **ADJ_VAL_007**: Date must be within allowed range
- **ADJ_VAL_008**: Location must be active
- **ADJ_VAL_009**: Items must be active
- **ADJ_VAL_010**: Department must be authorized for location

### 3.3 Processing Rules (ADJ_PRC)

- **ADJ_PRC_001**: Stock update on posting only
- **ADJ_PRC_002**: Journal entries generated automatically
- **ADJ_PRC_003**: Cost updates for affected items
- **ADJ_PRC_004**: Movement history must be updated
- **ADJ_PRC_005**: Lot tracking must be maintained
- **ADJ_PRC_006**: Status changes must be logged
- **ADJ_PRC_007**: No modification after posting
- **ADJ_PRC_008**: Void requires separate transaction
- **ADJ_PRC_009**: Period-end validation required
- **ADJ_PRC_010**: Real-time stock validation

### 3.4 UI Rules (ADJ_UI)

- **ADJ_UI_001**: List view must show key fields (Reference, Date, Type, Status, Location, Reason, Items, Total Value)
- **ADJ_UI_002**: Color coding for different statuses (Draft: amber, Posted: green, Void: red)
- **ADJ_UI_003**: Item grid must support inline editing
- **ADJ_UI_004**: Real-time total calculation display
- **ADJ_UI_005**: Required fields clearly marked with asterisk
- **ADJ_UI_006**: Reason selection through dropdown
- **ADJ_UI_007**: Document attachments with drag-drop support
- **ADJ_UI_008**: Lot selection through popup dialog
- **ADJ_UI_009**: Cost fields right-aligned with 2 decimals
- **ADJ_UI_010**: Quantity fields right-aligned with 3 decimals
- **ADJ_UI_011**: Date fields use system regional format with UTC offset
- **ADJ_UI_012**: Status changes reflect immediately
- **ADJ_UI_013**: Error messages display next to relevant fields
- **ADJ_UI_014**: Print preview before posting

### 3.5 System Calculations Rules (ADJ_CALC)

- **ADJ_CALC_001**: Item Cost = Unit Cost × Quantity (round to 2 decimals)
- **ADJ_CALC_002**: Total IN Quantity = Sum of all positive adjustments (round to 3 decimals)
- **ADJ_CALC_003**: Total OUT Quantity = Sum of all negative adjustments (round to 3 decimals)
- **ADJ_CALC_004**: Total Cost = Sum of all item costs (round to 2 decimals)
- **ADJ_CALC_005**: New Average Cost = ((Old Qty × Old Cost) + (Adj Qty × Adj Cost)) / (Old Qty + Adj Qty)
- **ADJ_CALC_006**: Variance % = ((Physical Count - System Qty) / System Qty) × 100
- **ADJ_CALC_007**: Cost Variance = (New Cost - Old Cost) × Quantity
- **ADJ_CALC_008**: Lot Cost = Weighted average of existing lots
- **ADJ_CALC_009**: Period Impact = Sum of all adjustments in period

## 4. Data Definitions

### 4.1 Inventory Adjustment

```typescript
interface InventoryAdjustment {
  id: string
  date: string // ISO 8601 format with timezone
  type: 'IN' | 'OUT'
  status: 'Draft' | 'Posted' | 'Void'
  location: string
  locationCode: string
  reason: string
  description?: string
  department: string
  items: StockMovementItem[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
  }
  createdBy: string
  createdAt: string // ISO 8601 format with timezone
  modifiedBy?: string
  modifiedAt?: string // ISO 8601 format with timezone
  postedBy?: string
  postedAt?: string // ISO 8601 format with timezone
}

interface StockMovementItem {
  id: string
  productName: string
  sku: string
  location: Location
  lots: Lot[]
  uom: string
  unitCost: number
  totalCost: number
  currentStock: number
  adjustedStock: number
}

interface Lot {
  lotNo: string
  quantity: number
  uom: string
  expiryDate?: string // ISO 8601 format with timezone
}

interface JournalEntry {
  id: string
  account: string
  accountName: string
  debit: number
  credit: number
  department: string
  reference: string
}
```

### 4.2 Adjustment Reason

```typescript
interface AdjustmentReason {
  id: string
  code: string
  description: string
  type: 'IN' | 'OUT' | 'BOTH'
  requiresDocument: boolean
  requiresQualityCheck: boolean
  glAccount: string
  isActive: boolean
  createdAt: string
  modifiedAt?: string
}
```

## 5. Logic Implementation

### 5.1 Adjustment Processing

- Reference number generation
- Item validation and cost calculation
- Lot allocation and tracking
- Stock balance validation
- Journal entry generation
- Stock and cost updates
- History maintenance

### 5.2 Cost Processing

- Unit cost calculation
- Total cost computation
- Average cost updates
- Variance calculation
- Financial impact assessment
- Period cost aggregation

### 5.3 Integration Points

- Stock Management
- Financial Accounting
- Audit Trail
- Reporting System
- Notification System
- Document Management

## 6. Validation and Testing

### 6.1 Data Validation

- Reference number uniqueness
- Mandatory field completion
- Date range validation
- Stock availability
- Cost accuracy
- Lot tracking integrity

### 6.2 Business Rule Validation

- Cost calculations
- Status transitions
- Integration points
- Security controls
- Audit requirements

### 6.3 Test Scenarios

1. Adjustment Creation
   - Positive adjustment
   - Negative adjustment
   - Mixed lot adjustments
   - Cost impact calculation
   - Document attachment

2. Processing and Integration
   - Stock updates
   - Cost calculations
   - Journal entries
   - History tracking
   - Report generation

### 6.4 Error Handling

- Validation errors
- Processing failures
- Integration issues
- Concurrency handling
- System timeouts
- Data inconsistencies

## 7. Maintenance and Governance

### 7.1 Module Ownership

- Primary Owner: Inventory Management Team
- Technical Owner: IT Development Team
- Business Owner: Operations Director
- Support Owner: IT Support Team

### 7.2 Review Process

- Monthly adjustment pattern review
- Quarterly reason code review
- Semi-annual cost impact analysis
- Annual process optimization
- Continuous improvement tracking

### 7.3 Change Management

- Change request process
- Impact assessment
- Testing requirements
- Implementation guidelines
- Rollback procedures

### 7.4 Data Retention

- Active data: 2 years
- Archive data: 7 years
- Audit trail: 10 years
- Document retention
- Recovery procedures
- Archival process

## 8. Appendices

### 8.1 Glossary

- **Adjustment**: Correction to inventory quantity or value
- **Lot**: Batch of inventory items tracked together
- **Unit Cost**: Cost per unit of measure
- **Average Cost**: Weighted average cost of inventory
- **Variance**: Difference between expected and actual values
- **Journal Entry**: Financial transaction record
- **Posting**: Process of finalizing an adjustment
- **Void**: Cancellation of an adjustment
- **Reason Code**: Standardized explanation for adjustment
- **Cost Impact**: Financial effect of adjustment

### 8.2 References

1. Inventory Management Policy
2. Financial Integration Guidelines
3. Security Standards
4. Audit Requirements
5. Data Retention Policy
6. Change Management Procedures
7. Testing Guidelines
8. User Access Policy
9. System Architecture 