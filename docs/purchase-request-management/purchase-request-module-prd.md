# Product Requirements Document (PRD)
# Carmen Hospitality Supply Chain System
# Purchase Request Module

## 1. Document Control

| Document Information |                                      |
|----------------------|--------------------------------------|
| Document Title       | Purchase Request Module PRD          |
| Version              | 1.0.0                                |
| Date                 | April 18, 2025                       |
| Status               | Draft                                |
| Author               | Carmen Product Team                  |

### 1.1 Version History

| Version | Date         | Modified By | Description      |
|---------|--------------|-------------|------------------|
| 1.0.0   | April 18, 2025 | Carmen Product Team | Initial version |

### 1.2 Approvals

| Name           | Role                  | Date | Signature |
|----------------|----------------------|------|-----------|
|                | Procurement Manager  |      |           |
|                | Finance Manager      |      |           |
|                | IT Manager           |      |           |
|                | Operations Manager   |      |           |

## 2. Introduction

### 2.1 Purpose

This Product Requirements Document (PRD) defines the requirements for the Purchase Request (PR) Module within the Carmen Hospitality Supply Chain System. The document serves as a comprehensive guide for developers, testers, and business stakeholders to understand the purchase request processes, workflows, and business rules necessary for implementation.

### 2.2 Scope

The scope of this document includes the complete functionality of the Purchase Request Module, encompassing:

- PR Creation and Management
- Item Management
- Budget Control
- Workflow Approvals
- Vendor Selection
- Financial Calculations
- Document Management
- User Interface Specifications

### 2.3 Target Audience

This document is intended for:
- Development Team
- QA Team
- Product Management
- Procurement Team
- Department Managers
- Finance Department
- Budget Controllers
- System Administrators
- Auditors

### 2.4 References

- Procurement Policy
- Financial Guidelines
- Budget Control Procedures
- Workflow Guidelines
- System Architecture Documentation

## 3. Product Overview

### 3.1 Product Description

The Purchase Request Module is a critical component of the Carmen Hospitality Supply Chain System, designed to streamline the procurement process for hotels and hospitality businesses. The module enables users to create, submit, track, and manage purchase requests through a configurable approval workflow while ensuring budget compliance, vendor optimization, and accurate financial record-keeping.

### 3.2 Business Objectives

- Streamline purchase request creation and approval processes
- Ensure budget compliance and control
- Maintain accurate procurement records
- Optimize vendor selection process
- Track procurement spending
- Support audit requirements
- Enable efficient workflow management
- Improve procurement transparency
- Reduce manual processes and paperwork

### 3.3 User Personas

#### 3.3.1 Requestor
- Hotel staff who need to request goods or services
- Primarily focused on creating and submitting PRs
- Needs visibility into PR status and history

#### 3.3.2 Department Head
- Responsible for reviewing and approving departmental PRs
- Manages departmental budgets
- Requires insights into departmental spending

#### 3.3.3 Budget Controller
- Validates PRs against available budgets
- Reviews financial aspects of purchase requests
- Monitors budget utilization across departments

#### 3.3.4 Procurement Manager
- Oversees the procurement process
- Reviews and approves high-value PRs
- Manages vendor relationships

#### 3.3.5 Finance Team
- Reviews financial aspects of PRs
- Ensures compliance with financial policies
- Manages budget allocations and reporting

#### 3.3.6 System Administrator
- Configures system settings and permissions
- Manages user access and roles
- Configures workflow rules and approval paths

## 4. Functional Requirements

### 4.1 Core Functionality

#### 4.1.1 Purchase Request Creation

**FR-PR-001**: Users must be able to create new purchase requests with a unique reference number.

**FR-PR-002**: The system must auto-generate a unique reference number for each new PR.

**FR-PR-003**: Users must be able to select a PR type (General Purchase, Market List, etc.).

**FR-PR-004**: Users must be able to provide a description for the PR.

**FR-PR-005**: The system must capture the requestor information automatically based on the logged-in user.

**FR-PR-006**: Users must be able to select or enter a job code for the PR.

**FR-PR-007**: Users must be able to select a department for the PR.

**FR-PR-008**: The system must capture the creation date and time automatically.

**FR-PR-009**: Users must be able to specify the desired delivery date for the PR.

#### 4.1.2 Item Management

**FR-PR-010**: Users must be able to add multiple items to a PR.

**FR-PR-011**: For each item, users must be able to:
  - Select from a catalog or enter a new item
  - Specify the store/department location
  - Enter or select an SKU number
  - Provide a description
  - Select a unit of measure
  - Enter requested quantity
  - Specify delivery date
  - Specify delivery point
  - Select currency
  - View currency rate
  - Enter or view price information

**FR-PR-012**: The system must provide the ability to view and modify approved quantities separate from requested quantities.

**FR-PR-013**: Users must be able to specify FOC (Free of Charge) quantities for items.

**FR-PR-014**: Users must be able to add job codes to individual items.

**FR-PR-015**: Users must be able to view inventory information for each item, including:
  - On Hand quantity (current department and total by locations)
  - On Ordered quantity
  - Reorder level
  - Restock information
  - Last price
  - Last vendor

**FR-PR-016**: Users must be able to view PO information linked to items, including:
  - PO number
  - Reference number
  - Buyer information
  - Ordered quantity
  - Received quantity
  - Order price

**FR-PR-017**: Users must be able to add comments to individual items.

**FR-PR-018**: The system must allow for item selection via checkbox for further actions.

#### 4.1.3 Financial Information

**FR-PR-019**: The system must calculate and display the following financial information for each item:
  - Unit price
  - Subtotal (price × quantity)
  - Discount percentage
  - Discount amount
  - Tax type
  - Tax rate
  - Tax amount
  - Total amount

**FR-PR-020**: The system must calculate and display the following financial information for the entire PR:
  - Net amount (sum of item subtotals)
  - Discount amount (sum of item discounts)
  - Tax amount (sum of item taxes)
  - Total amount (net amount - discount + tax)

**FR-PR-021**: The system must support multiple currencies and display both transaction currency and base currency information.

**FR-PR-022**: The system must apply the following calculation rules:
  - Item subtotal = Round(Quantity (3 decimals) × Unit Price (2 decimals), 2)
  - Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
  - Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
  - Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
  - Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
  - Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
  - Request subtotal = Round(Sum of Round(item subtotals, 2), 2)
  - Request total discount = Round(Sum of Round(item discounts, 2), 2)
  - Request total tax = Round(Sum of Round(item taxes, 2), 2)
  - Request final total = Round(Round(Request subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)

**FR-PR-023**: The system must support tax-inclusive and tax-exclusive pricing.

**FR-PR-024**: The system must handle adjustments to discounts and taxes with a checkbox indicator.

#### 4.1.4 Vendor Management and Price Comparison

**FR-PR-025**: The system must allow users to view price comparison information for items, including:
  - Vendor reference number
  - Vendor name
  - Unit of measure
  - Vendor rank
  - Price
  - Discount percentage
  - Discount amount
  - FOC quantity
  - Quantity range (from-to)

**FR-PR-026**: The system must provide an "Allocate Vendor" function that selects vendors based on the following prioritized rules:
  1. Vendor ranking
  2. Lowest price
  3. Last receiving

**FR-PR-027**: When manually selecting a product, the system must default the tax rate from the product table.

**FR-PR-028**: When auto-allocating, the tax rate must be derived from the price list.

**FR-PR-029**: When manually allocating, the system must assign the tax from the price list.

**FR-PR-030**: If the Adjust checkbox is checked, the system must not update the price automatically.

#### 4.1.5 Workflow and Approvals

**FR-PR-031**: The system must integrate with the configurable workflow engine to manage PR approvals.

**FR-PR-032**: The system must display the current status of the PR in the workflow process.

**FR-PR-033**: The system must provide workflow action buttons including:
  - Split & Reject
  - Approve
  - Reject
  - Send Back

**FR-PR-034**: The system must enforce that PRs cannot be voided if submitted and can only be rejected through the workflow process.

**FR-PR-035**: The system must display a process progress bar showing the status of the procurement process.

#### 4.1.6 Document Management

**FR-PR-036**: The system must provide a comment section with:
  - Comment number
  - Date
  - Author
  - Comment text
  - Ability to create new comments

**FR-PR-037**: The system must provide an attachment section with:
  - Attachment number
  - File name
  - Description
  - Public access flag
  - Date of attachment
  - Uploader information
  - Ability to create and attach new files

**FR-PR-038**: The system must maintain an activity log capturing:
  - Date and time of actions
  - User who performed the action
  - Action type (creation, modification, approval, etc.)

#### 4.1.7 Budget Control

**FR-PR-039**: The system must provide budget information for review during the PR process.

**FR-PR-040**: The system must not prevent submissions if they exceed budget allocations but should flag them for review.

### 4.2 User Interface Requirements

#### 4.2.1 General UI Requirements

**UI-PR-001**: The PR list must display key information (PR number, requestor, date, status, total).

**UI-PR-002**: The item grid must support inline editing for quantities and estimated prices.

**UI-PR-003**: Financial summary must update in real-time as items are modified.

**UI-PR-004**: Status changes must be reflected immediately in the UI.

**UI-PR-005**: Validation errors must be displayed clearly next to relevant fields.

**UI-PR-006**: Required fields must be visually marked with asterisk (*).

**UI-PR-007**: Currency fields must display appropriate currency symbols.

**UI-PR-008**: All dates must be displayed using the system's regional format with UTC offset (e.g., "2024-03-20 +07:00").

**UI-PR-009**: Action buttons must be disabled based on user permissions.

**UI-PR-010**: All monetary amounts must be displayed with 2 decimal places.

**UI-PR-011**: All quantities must be displayed with 3 decimal places.

**UI-PR-012**: Exchange rates must be displayed with 5 decimal places.

**UI-PR-013**: All numeric values must be right-aligned.

**UI-PR-014**: All numeric values must use the system's regional numeric format.

**UI-PR-015**: Date inputs must enforce regional format validation.

#### 4.2.2 Purchase Request Detail View

**UI-PR-016**: The Purchase Request Detail View must include the following sections:
  - Header with primary navigation tabs
  - Action buttons (Commit, Edit, Void, Print, Back)
  - Process status display
  - PR Issue Header (PR Ref#, PR Type, Permit by, Description)
  - Request Information (Date, Job Code, Department, Requestor, Status)
  - Process progress bar
  - Item details grid
  - Financial totals section
  - Workflow buttons
  - Comment section
  - Attachment section
  - Activity log section

**UI-PR-017**: The Item Details section must have both collapsed and expanded views.

**UI-PR-018**: The expanded item view must display:
  - Store information
  - Item number
  - Item description
  - Unit
  - Price
  - Quantity requested
  - Quantity approved
  - FOC quantity
  - Total
  - Delivery information
  - Discount and tax details
  - Price comparison table
  - Inventory information
  - PO information
  - Comment field

#### 4.2.3 Navigation and Actions

**UI-PR-019**: Primary navigation tabs must include "Procurement," "Material," "Portions," "Reports," and "Options."

**UI-PR-020**: User identification and administrative options such as 'Business Unit' and 'Log Out' must be available in the top right corner.

**UI-PR-021**: Action buttons for the PR must include:
  - Commit (to progress the PR to the next stage)
  - Edit (to modify the PR)
  - Void (to cancel the PR if not submitted)
  - Print (to generate a printable version)
  - Back (to navigate to the previous screen)

**UI-PR-022**: Item-level action buttons must include Create and Delete options.

**UI-PR-023**: The system must provide filtering capabilities, including filtering by 'Status' to track requests at different stages.

### 4.3 Reporting Requirements

**RP-PR-001**: The system must provide a Print function to print the content displayed on the screen.

**RP-PR-002**: The system must provide an Export function to export content to Excel or other formats.

**RP-PR-003**: The system must maintain detailed activity logs for audit purposes.

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

**NF-PR-001**: The system must support concurrent access by multiple users without performance degradation.

**NF-PR-002**: Page load times should not exceed 2 seconds under normal operating conditions.

**NF-PR-003**: All financial calculations must be performed in real-time as data is entered or modified.

### 5.2 Security Requirements

**NF-PR-002**: The system must implement role-based access control for all PR functions.

**NF-PR-003**: All financial data must be encrypted during transmission and storage.

**NF-PR-004**: The system must maintain a complete audit trail of all actions performed on PRs.

**NF-PR-005**: Session timeout should be configurable by administrators.

### 5.3 Reliability Requirements

**NF-PR-006**: The system must maintain data integrity during concurrent updates.

**NF-PR-007**: The system must implement transaction management to ensure that financial operations are atomic.

**NF-PR-008**: The system must have a backup and recovery mechanism for all PR data.

### 5.4 Scalability Requirements

**NF-PR-009**: The system must be able to handle a growing number of users and PRs without performance degradation.

**NF-PR-010**: The database design must optimize for efficient retrieval of PR data.

### 5.5 Usability Requirements

**NF-PR-011**: The user interface must be intuitive and require minimal training for basic operations.

**NF-PR-012**: Error messages must be clear and provide guidance on resolving issues.

**NF-PR-013**: The system must provide contextual help for complex functions.

## 6. Technical Architecture

### 6.1 Technology Stack

The Purchase Request Module will be implemented using the following technology stack:

- **Frontend**: Next.js with Shadcn UI components
- **Backend**: Nest.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: Best practices (JWT, OAuth, etc.)

### 6.2 Integration Points

The PR module will integrate with the following internal systems within the Carmen Hospitality Supply Chain system:

- **Inventory Management System**: For checking inventory levels and stock information
- **Accounting System**: For budget validation and financial calculations
- **Vendor Database**: For vendor selection and price comparison
- **Workflow Engine**: For approval routing and process management

### 6.3 Data Model

#### 6.3.1 Purchase Request Entity

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

#### 6.3.2 PR Item Entity

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

#### 6.3.3 Budget Data Entity

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

## 7. Business Rules

### 7.1 PR Creation Rules

- **PR_CRT_001**: All PRs must have unique reference numbers
- **PR_CRT_002**: Required fields include requestor, department, delivery date
- **PR_CRT_003**: Items must include quantity, unit, and estimated cost
- **PR_CRT_004**: PR type must be specified (General/Market List/Asset)
- **PR_CRT_005**: Description and justification mandatory

### 7.2 Budget Control Rules

- **PR_BDG_001**: Budget availability check required
- **PR_BDG_002**: Soft commitment creation on submission
- **PR_BDG_003**: Budget category validation
- **PR_BDG_004**: Amount thresholds for approvals
- **PR_BDG_005**: Currency conversion rules

### 7.3 Workflow Approval Rules

- **PR_WFL_001**: Multi-level approval based on amount
- **PR_WFL_002**: Department head approval mandatory
- **PR_WFL_003**: Financial review for high-value PRs
- **PR_WFL_004**: Status transition rules
- **PR_WFL_005**: Delegation of authority rules

### 7.4 Item Management Rules

- **PR_ITM_001**: Item details validation
- **PR_ITM_002**: Price comparison with history
- **PR_ITM_003**: Quantity validation
- **PR_ITM_004**: Category assignment required
- **PR_ITM_005**: Delivery date validation

### 7.5 Calculation Rules

- **PR_CAL_001**: Item subtotal = Round(Quantity (3 decimals) × Unit Price (2 decimals), 2)
- **PR_CAL_002**: Item discount amount = Round(Round(Subtotal, 2) × Discount Rate, 2)
- **PR_CAL_003**: Item net amount = Round(Round(Subtotal, 2) - Round(Discount Amount, 2), 2)
- **PR_CAL_004**: Item tax amount = Round(Round(Net Amount, 2) × Tax Rate, 2)
- **PR_CAL_005**: Item total = Round(Round(Net Amount, 2) + Round(Tax Amount, 2), 2)
- **PR_CAL_006**: Base currency conversion = Round(Round(Amount, 2) × Exchange Rate (5 decimals), 2)
- **PR_CAL_007**: Request subtotal = Round(Sum of Round(item subtotals, 2), 2)
- **PR_CAL_008**: Request total discount = Round(Sum of Round(item discounts, 2), 2)
- **PR_CAL_009**: Request total tax = Round(Sum of Round(item taxes, 2), 2)
- **PR_CAL_010**: Request final total = Round(Round(Request subtotal, 2) - Round(Total discount, 2) + Round(Total tax, 2), 2)

## 8. Development Guidelines

### 8.1 Coding Standards

- Follow JavaScript/TypeScript best practices
- Use ESLint for code quality enforcement
- Implement proper error handling
- Document all functions and methods

### 8.2 Testing Requirements

- Implement unit tests for all business logic
- Develop integration tests for API endpoints
- Create end-to-end tests for critical user flows
- Perform performance testing for financial calculations
- Conduct security testing for sensitive operations

### 8.3 Documentation Requirements

- Maintain up-to-date API documentation
- Create user manuals for different roles
- Document all business rules and calculations
- Provide release notes for each version

## 9. Implementation Plan

### 9.1 Development Phases

#### Phase 1: Core PR Creation and Item Management
- Basic PR creation
- Item addition and management
- Simple approval workflow

#### Phase 2: Financial and Workflow Enhancements
- Complete financial calculations
- Budget integration
- Advanced workflow functionality

#### Phase 3: Advanced Features
- Vendor selection optimization
- Reporting enhancements
- Performance optimizations

### 9.2 Milestones and Deliverables

| Milestone | Description | Deliverables | Estimated Completion |
|-----------|-------------|--------------|----------------------|
| M1 | PR Creation | PR creation UI, Basic item management | Week 4 |
| M2 | Financial Integration | Financial calculations, Budget integration | Week 8 |
| M3 | Workflow | Complete workflow functionality | Week 12 |
| M4 | Advanced Features | Vendor optimization, Reporting | Week 16 |
| M5 | Testing & Deployment | Final QA, Deployment packages | Week 20 |

## 10. Glossary

- **PR**: Purchase Request
- **PO**: Purchase Order
- **FOC**: Free of Charge
- **SKU**: Stock Keeping Unit
- **UI**: User Interface
- **API**: Application Programming Interface
- **ORM**: Object-Relational Mapping
- **JWT**: JSON Web Token
- **OAuth**: Open Authorization
- **RBAC**: Role-Based Access Control
- **SOD**: Segregation of Duties

## 11. Appendices

### Appendix A: UI Mockups

[Include references to UI mockups and designs]

### Appendix B: Workflow Diagrams

[Include references to workflow diagrams]

### Appendix C: API Specifications

[Include references to API documentation]

## 12. Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Technical Lead | | | |
| UX Designer | | | |
| QA Lead | | | |
| Business Stakeholder | | | |