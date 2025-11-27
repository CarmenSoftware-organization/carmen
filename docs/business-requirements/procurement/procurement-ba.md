# Procurement Module - Business Analysis Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Introduction

### Purpose
This document outlines the business logic and requirements for the Procurement module within the Carmen F&B Management System. It serves as a comprehensive guide for developers, testers, and business stakeholders to understand the procurement processes, workflows, and business rules.

### Scope
The documentation covers the entire Procurement module, including:
- Purchase Requests (PR)
- Purchase Orders (PO)
- Goods Received Notes (GRN)
- Credit Notes
- Vendor Comparison
- Approval Workflows

### Audience
- Procurement Team
- Finance Department
- Department Managers
- Vendors/Suppliers
- System Administrators
- Auditors

### Version History
| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0.0 | 2024-01-19 | System | Initial documentation |

## 2. Business Context

### Business Objectives
- Streamline the procurement process from request to receipt
- Ensure compliance with procurement policies and approval workflows
- Optimize vendor selection and pricing
- Maintain accurate procurement records for audit purposes
- Control and monitor procurement spending
- Integrate with inventory and financial systems

### Module Overview
The Procurement module consists of several key components:
1. Purchase Request Management
2. Purchase Order Processing
3. Goods Receipt Management
4. Credit Note Handling
5. Vendor Comparison Tools
6. Approval Workflow Management
7. Budget Control System

### Key Stakeholders
- Procurement Managers
- Department Heads
- Finance Team
- Inventory Managers
- Vendors/Suppliers
- Auditors
- System Administrators

## 3. Business Rules

### Purchase Request (PR_REQ)
- **PR_REQ_001**: All purchase requests must have a unique reference number
- **PR_REQ_002**: Required fields include requestor, department, delivery date, and items
- **PR_REQ_003**: Budget validation required before submission
- **PR_REQ_004**: Multi-level approval workflow based on amount and department
- **PR_REQ_005**: Items must include quantity, unit, and estimated cost

### Purchase Order (PR_PO)
- **PR_PO_001**: POs must be linked to approved purchase requests
- **PR_PO_002**: Vendor selection must be justified for orders above threshold
- **PR_PO_003**: Currency and exchange rates must be specified for foreign vendors
- **PR_PO_004**: Tax and discount calculations must be itemized
- **PR_PO_005**: Credit terms must align with vendor agreement

### Goods Receipt (PR_GR)
- **PR_GR_001**: All received goods must reference a valid PO
- **PR_GR_002**: Quantity and quality checks required before acceptance
- **PR_GR_003**: Partial deliveries must be tracked against original PO
- **PR_GR_004**: Discrepancies must be documented and approved
- **PR_GR_005**: Stock levels must be updated upon receipt

### Credit Notes (PR_CN)
- **PR_CN_001**: Must reference original PO or GRN
- **PR_CN_002**: Approval required for all credit notes
- **PR_CN_003**: Impact on accounting must be tracked
- **PR_CN_004**: Reason for credit note must be documented

## 4. Data Definitions

### Purchase Order Entity
```typescript
interface PurchaseOrder {
  poId: string                  // Unique identifier
  number: string                // PO reference number
  vendorId: number             // Vendor reference
  vendorName: string           // Vendor name
  orderDate: Date              // Order date
  DeliveryDate?: Date          // Expected delivery
  status: PurchaseOrderStatus  // Current status
  currencyCode: string         // Currency code
  exchangeRate: number         // Exchange rate
  items: PurchaseOrderItem[]   // Line items
  baseSubTotalPrice: number    // Subtotal in base currency
  subTotalPrice: number        // Subtotal in order currency
  baseNetAmount: number        // Net amount in base currency
  netAmount: number            // Net amount in order currency
  baseTotalAmount: number      // Total in base currency
  totalAmount: number          // Total in order currency
  // ... additional fields
}
```

### Purchase Request Entity
```typescript
interface PurchaseRequest {
  id: string                   // Unique identifier
  refNumber: string           // Reference number
  date: Date                  // Request date
  type: PRType                // Request type
  deliveryDate: Date          // Required delivery date
  requestor: Requestor        // Requestor details
  status: DocumentStatus      // Current status
  workflowStatus: WorkflowStatus // Approval status
  items: PurchaseRequestItem[] // Requested items
  budget: Budget              // Budget information
  approvalHistory: ApprovalHistoryItem[] // Approval trail
  // ... additional fields
}
```

## 5. Logic Implementation

### Purchase Order Processing
- PR to PO conversion rules:
  - Approved PR required
  - Vendor selection validation
  - Budget availability check
  - Currency conversion if applicable
  - Tax and discount application
  - Total amount calculation

### Approval Workflow
- Hierarchical approval based on:
  - Amount thresholds
  - Department
  - Item categories
  - Budget impact
- Status transitions:
  - Draft → Pending → Approved/Rejected
  - Additional approvals for exceptions

### Budget Control
- Available budget calculation:
  - Total Budget
  - Less: Soft commitments (PR)
  - Less: Hard commitments (PO)
  - Less: Actual spend
  - Equals: Available budget

## 6. Validation and Testing

### Test Scenarios
1. Purchase Request Creation
   - Create with minimum required fields
   - Create with all fields
   - Validate budget check
   - Test approval routing

2. Purchase Order Processing
   - Convert PR to PO
   - Add/modify line items
   - Apply taxes and discounts
   - Currency conversion

3. Goods Receipt
   - Full receipt
   - Partial receipt
   - Quality check failures
   - Discrepancy handling

### Error Handling
- Budget exceeded
- Invalid vendor selection
- Missing required fields
- Currency conversion errors
- Approval workflow exceptions

## 7. Maintenance and Governance

### Ownership
- Primary Owner: Procurement Department
- Technical Owner: IT Department
- Process Owner: Finance Department

### Review Process
1. Monthly review of procurement KPIs
2. Quarterly vendor performance review
3. Annual process audit
4. System performance review

### Change Management
1. All changes must be documented
2. Impact analysis required for process changes
3. Stakeholder approval for major changes
4. Training for process updates

## 8. Appendices

### Glossary
- **PR**: Purchase Request
- **PO**: Purchase Order
- **GRN**: Goods Received Note
- **FOC**: Free of Charge
- **RFQ**: Request for Quotation

### References
- Procurement Policy Manual
- Financial Approval Matrix
- Vendor Management Guidelines
- Budget Control Procedures

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Procurement Manager | | | |
| Finance Director | | | |
| IT Manager | | | |
| Compliance Officer | | | | 