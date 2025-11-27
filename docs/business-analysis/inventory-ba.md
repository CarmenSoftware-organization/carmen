# Inventory Management Module - Business Analysis Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Introduction

### Purpose
This document outlines the business logic and requirements for the Inventory Management module within the Carmen F&B Management System. It serves as a comprehensive guide for developers, testers, and business stakeholders to understand inventory processes, workflows, and business rules.

### Scope
The documentation covers the entire Inventory Management module, including:
- Stock In/Out Management
- Physical Count Management
- Spot Check Management
- Period End Processing
- Inventory Adjustments
- Stock Movement Tracking

### Audience
- Warehouse Managers
- Store Managers
- Finance Department
- Department Managers
- System Administrators
- Auditors

### Version History
| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0.0 | 2024-01-19 | System | Initial documentation |

## 2. Business Context

### Business Objectives
- Maintain accurate real-time inventory levels
- Track stock movements and transactions
- Facilitate periodic inventory counts and reconciliation
- Enable spot checks and adjustments
- Ensure proper valuation of inventory
- Support multi-location inventory management
- Integrate with procurement and financial systems

### Module Overview
The Inventory Management module consists of several key components:
1. Stock Movement Management
2. Physical Count Processing
3. Spot Check Management
4. Period End Processing
5. Inventory Adjustment Management
6. Location Management
7. Lot Tracking System

### Key Stakeholders
- Warehouse Managers
- Store Managers
- Department Heads
- Finance Team
- Procurement Team
- Auditors
- System Administrators

## 3. Business Rules

### Stock Movement (INV_STK)
- **INV_STK_001**: All stock movements must have a unique reference number
- **INV_STK_002**: Stock movements must be linked to valid locations
- **INV_STK_003**: Stock-in requires source documentation (GRN, Transfer, Return)
- **INV_STK_004**: Stock-out requires proper authorization
- **INV_STK_005**: Lot tracking required for applicable items

### Physical Count (INV_PHY)
- **INV_PHY_001**: Physical counts must be scheduled and approved
- **INV_PHY_002**: Count variances require management approval
- **INV_PHY_003**: System must track counting progress
- **INV_PHY_004**: Reconciliation required for variances
- **INV_PHY_005**: Historical counts must be maintained

### Inventory Adjustment (INV_ADJ)
- **INV_ADJ_001**: All adjustments require reason codes
- **INV_ADJ_002**: Adjustments above threshold require approval
- **INV_ADJ_003**: System must track adjustment history
- **INV_ADJ_004**: Cost impact must be calculated
- **INV_ADJ_005**: Adjustment types must be categorized (IN/OUT)

### Period End (INV_PRD)
- **INV_PRD_001**: Period end requires all pending transactions to be processed
- **INV_PRD_002**: System must calculate ending inventory value
- **INV_PRD_003**: Period end reports must be generated
- **INV_PRD_004**: Historical period data must be maintained
- **INV_PRD_005**: Integration with financial period required

## 4. Data Definitions

### Inventory Transaction Entity
```typescript
interface InventoryTransaction {
  transactionId: number
  itemId: number
  locationId: number
  transactionType: TransactionType
  quantity: number
  unitCost: number
  totalCost: number
  transactionDate: Date
  referenceNo?: string
  referenceType?: string
  userId: number
  notes?: string
}
```

### Stock Movement Entity
```typescript
interface StockMovementItem {
  id: string
  productName: string
  sku: string
  location: Location
  lots: Lot[]
  uom: string
  unitCost: number
  totalCost: number
}
```

### Inventory Adjustment Entity
```typescript
interface InventoryAdjustment {
  id: string
  date: string
  type: string
  status: string
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
}
```

## 5. Logic Implementation

### Stock Movement Processing
- Movement Types:
  - Stock In (GRN, Transfer, Return)
  - Stock Out (Issue, Transfer, Adjustment)
  - Internal Transfer
  - Adjustment
- Location Types:
  - Inventory Locations (Main Warehouse, Sub Warehouses)
  - Direct Issue Locations (F&B, Housekeeping)
- Cost Calculation:
  - Moving Average Cost
  - FIFO for lot-tracked items
  - Landed cost inclusion

### Inventory Valuation
- Valuation Methods:
  - Moving Average Cost (MAC)
  - First In First Out (FIFO)
  - Standard Cost
- Cost Components:
  - Purchase Cost
  - Landed Cost
  - Additional Charges

### Period End Processing
1. Transaction Cutoff
2. Physical Count Reconciliation
3. Cost Calculation
4. Valuation
5. Financial Integration
6. Report Generation

## 6. Validation and Testing

### Test Scenarios
1. Stock Movement
   - Stock In Processing
   - Stock Out Processing
   - Transfer Processing
   - Lot Tracking
   - Cost Calculation

2. Physical Count
   - Count Sheet Generation
   - Variance Recording
   - Approval Workflow
   - Reconciliation

3. Period End
   - Cutoff Processing
   - Valuation Calculation
   - Report Generation
   - Financial Integration

### Error Handling
- Negative Stock Prevention
- Invalid Location Transfer
- Duplicate Transaction Prevention
- Cost Calculation Errors
- Period End Validation

## 7. Maintenance and Governance

### Ownership
- Primary Owner: Warehouse Department
- Technical Owner: IT Department
- Process Owner: Finance Department

### Review Process
1. Daily transaction review
2. Weekly stock reconciliation
3. Monthly physical count
4. Quarterly process audit

### Change Management
1. All changes must be documented
2. Impact analysis required
3. Stakeholder approval needed
4. Training requirements identified

## 8. Appendices

### Glossary
- **GRN**: Goods Received Note
- **MAC**: Moving Average Cost
- **FIFO**: First In First Out
- **FOC**: Free of Charge

### References
- Inventory Management Policy
- Stock Count Procedures
- Valuation Guidelines
- Period End Procedures

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Warehouse Manager | | | |
| Finance Director | | | |
| IT Manager | | | |
| Compliance Officer | | | | 