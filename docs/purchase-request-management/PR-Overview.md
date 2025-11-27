# Purchase Request Module - Overview

> **Note**: This is a consolidated document that combines content from:
> - README.md
> - purchase-request-ba.md
> - module-map.md

## Table of Contents
1. [Introduction](#introduction)
2. [Module Purpose](#module-purpose)
3. [Business Context](#business-context)
4. [Key Features](#key-features)
5. [Module Architecture](#module-architecture)
6. [User Roles](#user-roles)
7. [Integration Points](#integration-points)
8. [Business Rules](#business-rules)
9. [Module Map](#module-map)
10. [Related Documentation](#related-documentation)

## Introduction
The Purchase Request (PR) module is a core component of the Carmen F&B Management System, enabling users to create, manage, and track purchase requests throughout their lifecycle. This document provides a comprehensive overview of the module, its business context, and its key components.

## Module Purpose
The Purchase Request module serves as the entry point for the procurement process, allowing users to:
- Request goods and services
- Obtain necessary approvals
- Track request status
- Manage budget allocations
- Convert approved requests to purchase orders

The module streamlines the procurement process by providing a structured workflow for requesting, approving, and processing purchase requests, ensuring compliance with organizational policies and budget constraints.

## Business Context

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

## Key Features

1. **Purchase Request Management**
   - Creation of purchase requests
   - Editing and updating purchase request details
   - Viewing purchase request history and status
   - Cancellation and deletion of purchase requests

2. **Item Management**
   - Adding items to purchase requests
   - Specifying quantities, units, and estimated prices
   - Managing item details and specifications
   - Tracking item status

3. **Workflow and Approvals**
   - Configurable approval workflows
   - Role-based approval processes
   - Status tracking and notifications
   - Audit trail of approval actions

4. **Budget Control**
   - Budget availability checks
   - Soft commitment creation
   - Budget allocation tracking
   - Financial validation

5. **Template Management**
   - Creating and managing PR templates
   - Using templates for recurring purchases
   - Template versioning and history

6. **Vendor Management**
   - Vendor selection and assignment
   - Price comparison
   - Vendor performance tracking
   - Preferred vendor management

7. **Financial Processing**
   - Cost calculations
   - Tax and discount handling
   - Currency conversion
   - Budget impact assessment

8. **Document Management**
   - Attachment handling
   - Supporting documentation
   - Document versioning
   - Audit trail

9. **Reporting and Analytics**
   - Purchase request status reporting
   - Budget allocation and tracking
   - Spending analysis by category
   - Request processing time analysis

## Module Architecture

### Directory Structure
```
app/(main)/procurement/purchase-requests/
├── page.tsx                    # Main PR list page
├── [id]/                      # PR detail page directory
├── new-pr/                    # New PR page directory
└── components/                # Shared components
    ├── tabs/                  # Tab components
    │   ├── ActivityTab.tsx
    │   ├── AttachmentsTab.tsx
    │   ├── WorkflowTab.tsx
    │   ├── ItemsTab.tsx
    │   ├── Summary-pr-table.tsx
    │   ├── budget-tab.tsx
    │   ├── BudgetsTab.tsx
    │   └── DetailsTab.tsx
    ├── PRDetailPage.tsx       # Main detail page component
    ├── purchase-request-list.tsx
    ├── advanced-filter.tsx
    ├── vendor-comparison.tsx
    ├── SummaryTotal.tsx
    ├── inventory-breakdown.tsx
    ├── item-details-edit-form.tsx
    ├── pending-purchase-orders.tsx
    ├── pricing-form.tsx
    ├── PRForm.tsx
    ├── PRHeader.tsx
    ├── dashboard-approval.tsx
    └── utils.tsx
```

### Component Overview
The PR module consists of the following key components:

#### Core Components
- **PRDetailPage**: Main component for viewing and editing PR details
- **PRForm**: Form component for creating and editing PRs
- **ItemsTab**: Component for managing PR items
- **WorkflowTab**: Component for managing PR approval workflow
- **BudgetsTab**: Component for budget validation and allocation

#### Supporting Components
- **AdvancedFilter**: Component for filtering PR lists
- **PricingForm**: Component for managing item pricing
- **SummaryTotal**: Component for displaying PR totals
- **InventoryBreakdown**: Component for displaying inventory information
- **VendorComparison**: Component for comparing vendor prices

### Data Flow
The PR module follows a structured data flow:

1. **Creation Flow**:
   ```mermaid
   sequenceDiagram
       participant U as User
       participant F as PR Form
       participant V as Validation
       participant S as Server
       
       U->>F: Initiate New PR
       F->>F: Load Template (if selected)
       U->>F: Fill PR Details
       F->>V: Validate Input
       V-->>F: Validation Result
       F->>S: Submit PR
       S-->>F: PR Created
       F->>U: Show Success
   ```

2. **Approval Flow**:
   ```mermaid
   sequenceDiagram
       participant R as Requestor
       participant A as Approver
       participant W as Workflow
       participant N as Notification
       
       R->>W: Submit PR
       W->>N: Notify Approver
       A->>W: Review PR
       alt Approved
           W->>N: Notify Success
           W->>R: PR Approved
       else Rejected
           W->>N: Notify Rejection
           W->>R: PR Rejected
       end
   ```

## User Roles

The Purchase Request module supports the following user roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Requestor | Creates and manages purchase requests | Create, edit, view PRs; add items; submit for approval |
| Department Manager | Approves departmental requests | View department PRs; approve/reject PRs |
| Finance Officer | Reviews financial aspects | View PRs; review financial details; export reports |
| Finance Manager | Approves financial aspects | Finance Officer permissions; financial approval of PRs |
| Procurement Officer | Processes approved PRs | View approved PRs; convert to POs; manage vendors |
| Budget Controller | Monitors budget impact | View budget allocations; approve/reject budget impacts |
| System Administrator | Manages system configuration | Configure workflows; manage users; system settings |

## Integration Points

### External Services
```typescript
interface ExternalServices {
  inventory: {
    checkStock: (itemId: string) => Promise<StockLevel>
    reserveStock: (itemId: string, quantity: number) => Promise<void>
  }
  budget: {
    checkAvailability: (budgetCode: string, amount: number) => Promise<BudgetStatus>
    allocate: (budgetCode: string, amount: number) => Promise<void>
  }
  workflow: {
    initiate: (prId: string) => Promise<WorkflowInstance>
    progress: (instanceId: string, action: WorkflowAction) => Promise<void>
  }
  notification: {
    send: (userId: string, notification: Notification) => Promise<void>
    track: (notificationId: string) => Promise<NotificationStatus>
  }
}
```

### Data Integration
The PR module integrates with the following systems:

1. **Budget Module**
   - Budget availability checks
   - Commitment creation
   - Budget allocation tracking

2. **Inventory Management**
   - Stock level checks
   - Item information
   - Unit conversion

3. **User Management**
   - User authentication
   - Role-based permissions
   - Delegation management

4. **Document Management**
   - File storage
   - Document versioning
   - Access control

5. **Notification System**
   - Email notifications
   - In-app notifications
   - Notification preferences

6. **Purchase Order Module**
   - PR to PO conversion
   - PO tracking
   - PR-PO relationship management

7. **Vendor Management**
   - Vendor information
   - Pricing data
   - Vendor performance metrics

## Business Rules

### PR Creation Rules (PR_CRT)
- **PR_CRT_001**: All PRs must have unique reference numbers
- **PR_CRT_002**: Required fields include requestor, department, delivery date
- **PR_CRT_003**: Items must include quantity, unit, and estimated cost
- **PR_CRT_004**: PR type must be specified (General/Market List/Asset)
- **PR_CRT_005**: Description and justification mandatory

### Budget Control Rules (PR_BDG)
- **PR_BDG_001**: Budget availability check required
- **PR_BDG_002**: Soft commitment creation on submission
- **PR_BDG_003**: Budget category validation
- **PR_BDG_004**: Amount thresholds for approvals
- **PR_BDG_005**: Currency conversion rules

### Workflow Approval Rules (PR_WFL)
- **PR_WFL_001**: Multi-level approval based on amount
- **PR_WFL_002**: Department head approval mandatory
- **PR_WFL_003**: Financial review for high-value PRs
- **PR_WFL_004**: Status transition rules
- **PR_WFL_005**: Delegation of authority rules

### Item Management Rules (PR_ITM)
- **PR_ITM_001**: Item details validation
- **PR_ITM_002**: Price comparison with history
- **PR_ITM_003**: Quantity validation
- **PR_ITM_004**: Category assignment required
- **PR_ITM_005**: Delivery date validation

### System Calculations Rules
- **PR_036**: Item subtotal = Round(Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **PR_037**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **PR_038**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **PR_039**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **PR_040**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **PR_041**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)

## Module Map

### Pages and Components

#### List View (page.tsx)
- **Purpose**: Main landing page for PR module
- **Key Features**:
  - List of purchase requests
  - Advanced filtering
  - Bulk actions
  - Quick actions

#### Detail View ([id]/page.tsx)
- **Purpose**: Detailed view and management of a single PR
- **Key Features**:
  - PR information management
  - Multi-tab interface
  - Workflow management
- **Tab Structure**:
  - Details: Basic PR information
  - Items: Item management
  - Budget: Budget allocation and tracking
  - Workflow: Approval process management
  - Attachments: Document management
  - Activity: Audit trail and history

#### New PR (new-pr/page.tsx)
- **Purpose**: Creation of new purchase requests
- **Key Features**:
  - PR template selection
  - Item management
  - Budget validation

### Navigation Structure
```
Purchase Requests
├── Dashboard
├── My Requests
│   ├── Draft
│   ├── Submitted
│   ├── Approved
│   └── Rejected
├── All Requests
│   ├── List View
│   └── Calendar View
├── Templates
│   ├── My Templates
│   ├── Shared Templates
│   └── Create Template
├── Approvals
│   ├── Pending
│   ├── Approved
│   └── Rejected
└── Reports
    ├── Status Summary
    ├── Budget Impact
    └── Approval Time
```

## Related Documentation
- [PR Technical Specification](./PR-Technical-Specification.md)
- [PR User Experience](./PR-User-Experience.md)
- [PR Component Specifications](./PR-Component-Specifications.md)
- [PR API Specifications](./PR-API-Specifications.md)
- [Procurement Process Flow](../Procurement-Process-Flow.md)

---

**Document Status**: Updated - Content Migrated (Phase 2)  
**Last Updated**: March 14, 2024  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Next Update**: Phase 3 - Content Refinement 