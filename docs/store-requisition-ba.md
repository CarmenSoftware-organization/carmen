# Store Requisition Module - Business Analysis Documentation

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive business analysis of the Store Requisition (SR) module within the Carmen F&B Management System. The SR module is essential for managing internal requests for goods between different stores or departments, ensuring proper inventory control and efficient resource allocation.

### 1.2 Scope
The document covers the entire store requisition process, from creation to fulfillment, including request management, approval workflows, inventory updates, and movement tracking.

### 1.3 Audience
- Store managers and staff
- Department heads
- Inventory controllers
- System administrators
- Development team
- Quality assurance team

### 1.4 Version History
| Version | Date       | Author | Changes Made |
|---------|------------|---------|--------------|
| 1.0     | 2024-03-20 | System  | Initial version |

## 2. Business Context

### 2.1 Business Objectives
- Streamline internal requisition processes between stores and departments
- Maintain accurate tracking of stock movements
- Ensure proper authorization and approval of requisitions
- Facilitate efficient inventory management
- Support both direct cost and inventory type movements

### 2.2 Module Overview
The Store Requisition module manages the following key functions:
- Creation and management of store requisitions
- Approval workflow management
- Stock movement tracking
- Inventory level monitoring
- Request status tracking
- Activity logging and attachments

### 2.3 Key Stakeholders
- Store Managers
- Department Heads
- Inventory Controllers
- Finance Department
- Operations Staff
- System Administrators

## 3. Business Rules

### 3.1 Requisition Creation Rules
- **SR_001**: Each requisition must have a unique reference number
- **SR_002**: Valid requesting and receiving locations must be specified
- **SR_003**: Movement type must be specified (Issue or Transfer)
- **SR_004**: Required quantities must not exceed available stock
- **SR_005**: Request date and expected delivery date are mandatory

### 3.2 Item Management Rules
- **SR_006**: Each item must have valid unit and quantity information
- **SR_007**: Items must be available in the source location
- **SR_008**: Direct cost items can only be issued to direct cost locations
- **SR_009**: Inventory items can only be transferred between inventory locations
- **SR_010**: Cost variations are allowed within open periods

### 3.3 Approval Rules
- **SR_011**: All requisitions require appropriate approval
- **SR_012**: Approvers can modify requested quantities
- **SR_013**: Rejections must include a reason
- **SR_014**: Status changes must be logged
- **SR_015**: Approved quantities cannot exceed requested quantities

### 3.4 Movement and Status Rules
- **SR_016**: Status progression: Draft → In Process → Complete/Reject/Void
- **SR_017**: Completed requisitions cannot be modified
- **SR_018**: Stock movements must be tracked
- **SR_019**: Inventory levels must be updated
- **SR_020**: All movements must maintain audit trail

## 4. Data Definitions

### 4.1 Requisition Header
\`\`\`typescript
interface Requisition {
  date: string
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
}
\`\`\`

### 4.2 Requisition Item
\`\`\`typescript
interface RequisitionItem {
  id: number
  description: string
  unit: string
  qtyRequired: number
  qtyApproved: number
  costPerUnit: number
  total: number
  requestDate: string
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
}
\`\`\`

## 5. Logic Implementation

### 5.1 Requisition Creation Process
1. Initialize requisition with basic information
2. Select movement type (Issue/Transfer)
3. Specify source and destination locations
4. Add requested items with quantities
5. Validate against inventory levels
6. Generate reference number
7. Set initial status

### 5.2 Item Processing
1. Validate requested quantities
2. Check item availability
3. Verify location compatibility
4. Calculate item costs
5. Apply any relevant restrictions
6. Track inventory levels

### 5.3 Approval Workflow
1. Submit requisition for approval
2. Route to appropriate approvers
3. Review and modify quantities if needed
4. Capture approval decisions
5. Update status and notify requestor
6. Generate stock movements

### 5.4 Movement Processing
1. Validate movement type
2. Check source location stock
3. Create stock movement records
4. Update inventory levels
5. Generate movement documents
6. Maintain audit trail

## 6. Validation and Testing

### 6.1 Data Validation
- Validate all required fields
- Check reference number uniqueness
- Verify quantity calculations
- Validate location compatibility
- Check inventory availability
- Verify movement types

### 6.2 Business Rule Validation
- Verify approval routing rules
- Check status transitions
- Validate movement rules
- Verify inventory updates
- Check audit trail creation

### 6.3 Test Scenarios
1. Regular store requisition
2. Direct cost requisition
3. Inventory transfer
4. Partial approval
5. Rejection handling
6. Void process
7. Multiple item requisition
8. Inventory level checks

### 6.4 Error Handling
- Invalid quantity errors
- Insufficient stock errors
- Invalid location errors
- Approval routing errors
- Movement processing errors

## 7. Maintenance and Governance

### 7.1 Module Ownership
- **Primary Owner**: Store Operations Department
- **Technical Owner**: IT Department
- **Data Owner**: Inventory Control Department

### 7.2 Review Process
- Weekly review of pending requisitions
- Monthly review of requisition patterns
- Quarterly review of business rules
- Regular review of error logs

### 7.3 Change Management
- Change request process for business rules
- Version control for module updates
- User training for new features
- Communication plan for changes

## 8. Appendices

### 8.1 Glossary
- **SR**: Store Requisition
- **Issue**: Movement to direct cost location
- **Transfer**: Movement between inventory locations
- **Direct Cost**: Non-inventory tracking location
- **Movement Type**: Issue or Transfer

### 8.2 References
- Store Operations Manual
- Inventory Management Guidelines
- Internal Control Procedures
- System Technical Documentation

## 9. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Store Operations Manager | | | |
| Inventory Control Manager | | | |
| IT Manager | | | |
| Quality Assurance | | | | 