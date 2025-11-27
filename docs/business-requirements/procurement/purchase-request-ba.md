# Purchase Request Module - Business Analysis Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Introduction

### Purpose
This document outlines the business logic and requirements for the Purchase Request (PR) module within the Carmen F&B Management System. It serves as a comprehensive guide for developers, testers, and business stakeholders to understand purchase request processes, workflows, and business rules.

### Scope
The documentation covers the entire Purchase Request module, including:
- PR Creation and Management
- Item Management
- Budget Control
- Workflow Approvals
- Vendor Selection
- Financial Calculations
- Document Management

### Audience
- Procurement Team
- Department Managers
- Finance Department
- Budget Controllers
- Vendors/Suppliers
- System Administrators
- Auditors

### Version History
| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0.0 | 2024-01-19 | System | Initial documentation |

## 2. Business Context

### Business Objectives
- Streamline purchase request creation and approval
- Ensure budget compliance and control
- Maintain accurate procurement records
- Optimize vendor selection process
- Track procurement spending
- Support audit requirements
- Enable efficient workflow management

### Module Overview
The Purchase Request module consists of several key components:
1. PR Creation and Management
2. Item Management
3. Budget Control System
4. Approval Workflow
5. Vendor Management
6. Financial Processing
7. Document Management

### Key Stakeholders
- Requestors
- Department Heads
- Finance Team
- Budget Controllers
- Procurement Managers
- Vendors/Suppliers
- Auditors

## 3. Business Rules

### PR Creation (PR_CRT)
- **PR_CRT_001**: All PRs must have unique reference numbers
- **PR_CRT_002**: Required fields include requestor, department, delivery date
- **PR_CRT_003**: Items must include quantity, unit, and estimated cost
- **PR_CRT_004**: PR type must be specified (General/Market List/Asset)
- **PR_CRT_005**: Description and justification mandatory

### Budget Control (PR_BDG)
- **PR_BDG_001**: Budget availability check required
- **PR_BDG_002**: Soft commitment creation on submission
- **PR_BDG_003**: Budget category validation
- **PR_BDG_004**: Amount thresholds for approvals
- **PR_BDG_005**: Currency conversion rules

### Workflow Approval (PR_WFL)
- **PR_WFL_001**: Multi-level approval based on amount
- **PR_WFL_002**: Department head approval mandatory
- **PR_WFL_003**: Financial review for high-value PRs
- **PR_WFL_004**: Status transition rules
- **PR_WFL_005**: Delegation of authority rules

### Item Management (PR_ITM)
- **PR_ITM_001**: Item details validation
- **PR_ITM_002**: Price comparison with history
- **PR_ITM_003**: Quantity validation
- **PR_ITM_004**: Category assignment required
- **PR_ITM_005**: Delivery date validation

### 3.5 UI Rules
- **PR_021**: PR list must display key information (PR number, requestor, date, status, total)
- **PR_022**: Item grid must support inline editing for quantities and estimated prices
- **PR_023**: Financial summary must update in real-time as items are modified
- **PR_024**: Status changes must be reflected immediately in the UI
- **PR_025**: Validation errors must be displayed clearly next to relevant fields
- **PR_026**: Required fields must be visually marked with asterisk (*)
- **PR_027**: Currency fields must display appropriate currency symbols
- **PR_028**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **PR_029**: Action buttons must be disabled based on user permissions
- **PR_030**: Print preview must match final PR document format
- **PR_031**: All monetary amounts must be displayed with 2 decimal places
- **PR_032**: All quantities must be displayed with 3 decimal places
- **PR_033**: Exchange rates must be displayed with 5 decimal places
- **PR_034**: All numeric values must be right-aligned
- **PR_035**: All numeric values must use system's regional numeric format
- **PR_036**: Date inputs must enforce regional format validation
- **PR_037**: Date/time values must be stored as timestamptz in UTC
- **PR_038**: Time zone conversions must respect daylight saving rules
- **PR_039**: Calendar controls must indicate working days and holidays
- **PR_040**: Date range validations must consider time zone differences

### 3.6 System Calculations Rules
- **PR_036**: Item subtotal = Round(Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **PR_037**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **PR_038**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **PR_039**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **PR_040**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **PR_041**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
- **PR_042**: Request subtotal = Round(Sum of Round(item subtotals, 2), 2)
- **PR_043**: Request total discount = Round(Sum of Round(item discounts, 2), 2)
- **PR_044**: Request total tax = Round(Sum of Round(item taxes, 2), 2)
- **PR_045**: Request final total = Round(Round(Request subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)
- **PR_046**: All intermediate calculations must be rounded before use in subsequent calculations
- **PR_047**: Final rounding must use half-up (banker's) rounding method
- **PR_048**: Quantity conversions must be rounded to 3 decimals before use
- **PR_049**: Exchange rate calculations must use 5 decimal precision before monetary rounding
- **PR_050**: Regional numeric format must be applied after all calculations and rounding
- **PR_051**: Each step in multi-step calculations must round intermediate results
- **PR_052**: Running totals must be rounded before adding each new value
- **PR_053**: Percentage calculations must round result before applying to base amount
- **PR_054**: Cross-currency calculations must round after each currency conversion
- **PR_055**: Tax-inclusive price breakdowns must round each component

## 4. Data Definitions

### Purchase Request Entity
```typescript
interface PurchaseRequest {
  id: string
  refNumber: string
  date: Date
  type: PRType
  deliveryDate: Date
  description: string
  requestorId: string
  requestor: {
    name: string
    id: string
    department: string
  }
  status: DocumentStatus
  workflowStatus: WorkflowStatus
  currentWorkflowStage: WorkflowStage
  location: string
  department: string
  jobCode: string
  estimatedTotal: number
  vendor: string
  vendorId: number
  currency: string
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

### PR Item Entity
```typescript
interface PurchaseRequestItem {
  id?: string
  location: string
  name: string
  description: string
  unit: string
  quantityRequested: number
  quantityApproved: number
  inventoryInfo: InventoryInfo
  currency: string
  baseCurrency?: string
  price: number
  totalAmount: number
  status?: string
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  netAmount: number
  deliveryDate: Date
  deliveryPoint: string
  jobCode: string
  createdDate: Date
  updatedDate: Date
  createdBy: string
  updatedBy: string
  itemCategory: string
  itemSubcategory: string
  vendor: string
  pricelistNumber: string
  comment: string
  adjustments: {
    discount: boolean
    tax: boolean
  }
  taxIncluded: boolean
  currencyRate: number
  foc: number
  accountCode: string
  baseSubTotalPrice: number
  subTotalPrice: number
  baseNetAmount: number
  baseDiscAmount: number
  baseTaxAmount: number
  baseTotalAmount: number
}
```

### Budget Data Entity
```typescript
interface BudgetData {
  location: string
  budgetCategory: string
  totalBudget: number
  softCommitmentPR: number
  softCommitmentPO: number
  hardCommitment: number
  availableBudget: number
  currentPRAmount: number
}
```

## 5. Logic Implementation

### PR Creation Process
- Initial Creation:
  - Reference Number Generation
  - Basic Information Entry
  - Item Selection
  - Cost Estimation
  - Budget Validation
- Validation Rules:
  - Required Fields
  - Budget Availability
  - Item Details
  - Delivery Dates

### Workflow Management
- Approval Levels:
  - Department Head
  - Budget Controller
  - Finance Review
  - Final Approval
- Status Transitions:
  - Draft → Submitted
  - Submitted → Under Review
  - Under Review → Approved/Rejected
  - Approved → Completed

### Financial Processing
- Cost Calculations:
  - Item Costs
  - Tax Calculations
  - Discount Applications
  - Currency Conversions
- Budget Impact:
  - Commitment Creation
  - Budget Updates
  - Financial Validations

## 6. Validation and Testing

### Test Scenarios
1. PR Creation
   - Basic PR Creation
   - Item Addition
   - Budget Validation
   - Document Attachment
   - Submission Process

2. Workflow Processing
   - Approval Routing
   - Status Updates
   - Notifications
   - Delegation Handling
   - Rejection Process

3. Financial Validation
   - Budget Checks
   - Currency Handling
   - Tax Calculations
   - Commitment Creation
   - Cost Updates

### Error Handling
- Duplicate PR Prevention
- Budget Validation Errors
- Item Validation Issues
- Workflow Errors
- System Errors

## 7. Maintenance and Governance

### Ownership
- Primary Owner: Procurement Department
- Technical Owner: IT Department
- Process Owner: Finance Department

### Review Process
1. Daily PR review
2. Weekly budget review
3. Monthly workflow review
4. Quarterly system audit

### Change Management
1. All changes must be documented
2. Impact analysis required
3. Stakeholder approval needed
4. Training requirements identified

## 8. Appendices

### Glossary
- **PR**: Purchase Request
- **PO**: Purchase Order
- **FOC**: Free of Charge
- **SOD**: Segregation of Duties

### References
- Procurement Policy
- Financial Guidelines
- Budget Control Procedures
- Workflow Guidelines

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Procurement Manager | | | |
| Finance Manager | | | |
| IT Manager | | | |
| Operations Manager | | | | 