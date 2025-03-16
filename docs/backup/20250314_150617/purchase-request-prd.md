# Purchase Request Module - Product Requirements Document (PRD)

## 1. Introduction

### 1.1 Purpose
This document outlines the detailed product requirements for the Purchase Request (PR) module within the Carmen F&B Management System. It serves as a comprehensive guide for the development, testing, and implementation of the PR module.

### 1.2 Scope
The PR module enables users to create, manage, and process purchase requests throughout their entire lifecycle, from initial creation through approval workflows to conversion into purchase orders.

### 1.3 Target Users
- Requestors (Staff, Department Managers)
- Approvers (Department Heads, Finance Managers)
- Procurement Team
- Finance Department
- Budget Controllers
- System Administrators

### 1.4 Document References
- Purchase Request Business Analysis (docs/purchase-request-ba.md)
- Purchase Request API Specification (docs/purchase-request-api-sp.md)
- Module Requirements (docs/pr/module-requirements.md)
- UI Flow Specification (docs/pr/ui-flow-specification.md)

## 2. Product Overview

### 2.1 Product Perspective
The Purchase Request module is a core component of the Carmen F&B Management System, enabling the systematic requisition of goods and services. It integrates with several other modules:

- **Budget Module**: For budget validation and commitment
- **Inventory Management**: For stock level verification
- **Vendor Management**: For vendor selection and price comparison
- **User Management**: For authentication and authorization
- **Workflow Management**: For approval routing
- **Purchase Order Module**: For PR-to-PO conversion
- **Document Management**: For attachments and document generation

### 2.2 Key Features
1. **PR Creation and Management**: Create, edit, view, and delete purchase requests
2. **Item Management**: Add, edit, and remove items with detailed specifications
3. **Vendor Comparison**: Compare vendors and price lists for optimal selection
4. **Inventory Integration**: View on-hand and on-order quantities for informed decisions
5. **Budget Control**: Validate against budgets and create commitments
6. **Workflow Management**: Route PRs through configurable approval workflows
7. **Attachments**: Upload and manage supporting documents
8. **Activity Tracking**: Monitor all actions and status changes
9. **Template Support**: Create and use templates for recurring purchases
10. **Reporting**: Generate reports on PR status, spending, and trends

### 2.3 User Stories

#### Requestor
- As a requestor, I want to create a new purchase request, so I can procure needed goods or services
- As a requestor, I want to check inventory levels when adding items, so I avoid unnecessary purchases
- As a requestor, I want to compare vendors for an item, so I can select the most suitable supplier
- As a requestor, I want to attach supporting documents, so approvers have complete information
- As a requestor, I want to save a PR as a draft, so I can complete it later
- As a requestor, I want to use PR templates, so I can quickly create recurring requests
- As a requestor, I want to track approval status, so I know when my request is processed

#### Approver
- As an approver, I want to see pending PRs requiring my approval, so I can process them promptly
- As an approver, I want to view detailed item information, so I can make informed decisions
- As an approver, I want to add comments to PRs, so I can provide feedback to requestors
- As an approver, I want to approve/reject specific items, so I can partially approve requests
- As an approver, I want to delegate approval authority, so requests are processed during my absence

#### Procurement Team
- As a procurement manager, I want to convert approved PRs to POs, so I can execute purchases
- As a procurement manager, I want to analyze PR trends, so I can optimize purchasing strategies
- As a procurement manager, I want to compare vendor performance, so I can select reliable suppliers

#### Finance Team
- As a finance manager, I want to validate PRs against budgets, so I can ensure spending compliance
- As a finance manager, I want to track budget commitments, so I can manage financial resources

## 3. Functional Requirements

### 3.1 PR Management

#### 3.1.1 PR Creation
- The system shall allow users to create new purchase requests with unique reference numbers
- The system shall provide a multi-step wizard for PR creation
- The system shall support template-based PR creation for recurring purchases
- The system shall enable copying from existing PRs
- The system shall allow bulk item import via spreadsheet
- The system shall validate mandatory fields before submission
- The system shall support draft saving at any point in the creation process

#### 3.1.2 PR Editing
- The system shall allow editing of PRs in draft status with full capabilities
- The system shall restrict editing of submitted PRs based on user role and PR status
- The system shall maintain an audit trail of all changes
- The system shall support item-level modifications (add, edit, remove)
- The system shall recalculate financial totals upon any change

#### 3.1.3 PR Viewing
- The system shall provide a detailed view of PR information organized in tabs
- The system shall display PR general information, items, budget, workflow, attachments, and activity
- The system shall support printing and exporting PR details
- The system shall show real-time status updates
- The system shall highlight validation issues and approval status

#### 3.1.4 PR Deletion
- The system shall allow deletion of PRs in draft status only
- The system shall prompt for confirmation before deletion
- The system shall maintain deletion records for audit purposes

### 3.2 Item Management

#### 3.2.1 Item Addition
- The system shall provide a product lookup with filtering and search capabilities
- The system shall support manual item entry for non-catalog items
- The system shall pre-populate fields from master data when available
- The system shall perform validation on required item fields
- The system shall support bulk item addition

#### 3.2.2 Item Details
- The system shall display comprehensive item information including description, category, and specifications
- The system shall show inventory information (on-hand, on-order) for each item
- The system shall enable vendor comparison for price optimization
- The system shall calculate and display financial details (unit price, total price, taxes, discounts)
- The system shall track approval status at the item level

#### 3.2.3 Inventory Integration
- The system shall display "On Hand" inventory levels by location
- The system shall show "On Order" quantities from pending purchase orders
- The system shall provide inventory metrics (par levels, reorder points, min/max stock)
- The system shall highlight stock status (below minimum, above maximum, etc.)

#### 3.2.4 Vendor Comparison
- The system shall allow selection of multiple vendors for comparison
- The system shall display vendor ratings and performance metrics
- The system shall show current price lists and historical pricing
- The system shall support vendor selection directly from comparison dialog
- The system shall update item details based on selected vendor

### 3.3 Budget Control

#### 3.3.1 Budget Validation
- The system shall validate PR amounts against available budget
- The system shall display warning when budget thresholds are exceeded
- The system shall support multiple budget allocations for a single PR
- The system shall perform real-time budget checks during PR creation/editing

#### 3.3.2 Financial Calculations
- The system shall calculate item subtotals, taxes, and discounts
- The system shall support multiple currencies with conversion
- The system shall track exchange rates for foreign currency transactions
- The system shall handle tax-inclusive and tax-exclusive pricing
- The system shall calculate and display budget impact

### 3.4 Workflow Management

#### 3.4.1 Approval Routing
- The system shall route PRs through configurable approval workflows
- The system shall determine approval paths based on amount, department, and PR type
- The system shall notify approvers of pending actions
- The system shall support parallel and sequential approvals
- The system shall handle delegation of approval authority

#### 3.4.2 Status Tracking
- The system shall display current workflow status and next steps
- The system shall maintain a complete history of approval actions
- The system shall show expected completion timeline
- The system shall highlight bottlenecks and delays

#### 3.4.3 Actions
- The system shall support approve, reject, and send back actions
- The system shall require comments for rejections and send backs
- The system shall allow item-level approval/rejection
- The system shall enforce approval thresholds based on user roles

### 3.5 Attachments & Documents

#### 3.5.1 Attachment Management
- The system shall allow uploading supporting documents
- The system shall support multiple file formats (PDF, DOC, XLS, JPG, etc.)
- The system shall provide attachment preview capabilities
- The system shall maintain attachment history and versions

#### 3.5.2 Document Generation
- The system shall generate standardized PR documents in printable format
- The system shall support custom document templates
- The system shall enable export to PDF, Excel, and other formats

### 3.6 Activity Tracking

#### 3.6.1 Audit Trail
- The system shall log all PR-related actions with timestamp and user
- The system shall display change history in the activity tab
- The system shall highlight critical actions (submission, approval, rejection)
- The system shall support filtering of activity records

## 4. Non-Functional Requirements

### 4.1 Performance
- The PR list page shall load within 2 seconds with 1000 records
- The PR detail page shall load within 3 seconds
- The system shall support at least 1000 concurrent users
- The system shall handle at least 100,000 PRs annually

### 4.2 Security
- The system shall implement role-based access control
- The system shall encrypt sensitive data
- The system shall maintain detailed audit logs
- The system shall enforce password policies
- The system shall timeout inactive sessions

### 4.3 Usability
- The UI shall be responsive and accessible
- The system shall provide clear error messages and validation feedback
- The system shall offer contextual help and tooltips
- The system shall support keyboard navigation
- The system shall maintain state during navigation

### 4.4 Scalability
- The system shall scale horizontally to accommodate growth
- The database shall handle at least 10 million PR records
- The architecture shall support modular expansion

### 4.5 Availability
- The system shall be available 99.9% of the time
- The system shall implement graceful degradation during partial outages
- The system shall recover automatically from most failures

### 4.6 Localization
- The system shall support multiple languages
- The system shall handle different date/time formats
- The system shall support multiple currencies with proper formatting

## 5. UI/UX Specifications

### 5.1 PR List View
- Responsive data grid with filterable and sortable columns
- Quick-action buttons for common operations
- Status indicators with clear visual differentiation
- Advanced filtering and search panel
- Bulk action capabilities

### 5.2 PR Detail View
- Tabbed interface with the following sections:
  - General Information
  - Items
  - Budget
  - Workflow
  - Attachments
  - Activity
- Action buttons contextual to PR status
- Real-time status updates
- Summary panel with key metrics

### 5.3 Item Management Interface
- Inline editing capabilities
- Bulk actions for multiple items
- Contextual buttons for "On Hand" and "On Order" information
- Vendor comparison dialog
- Validation indicators

### 5.4 Dialogs and Modals
- **Inventory Breakdown**: Displays on-hand quantities by location
- **Pending Purchase Orders**: Shows items on order with delivery dates
- **Vendor Comparison**: Enables comparison of vendors and price lists
- **Workflow Actions**: Provides interfaces for approval decisions
- **Budget Allocation**: Facilitates distribution of costs to budget lines

## 6. Technical Specifications

### 6.1 Architecture
- Next.js App Router for frontend routing
- React Server Components for enhanced performance
- Drizzle ORM for database operations
- Supabase for authentication and database
- TypeScript for type safety

### 6.2 Frontend Components
- Reusable UI components from Shadcn UI, Radix UI, and Tailwind CSS
- Context providers for state management
- Server actions for API functionality
- Form validation using Zod schemas

### 6.3 API Endpoints
- Comprehensive REST API for all PR operations
- Webhook support for external integrations
- Batch processing endpoints for bulk operations

### 6.4 Database Models
- Normalized schema design
- Foreign key relationships
- Indexing for optimal query performance
- Transaction support for data integrity

## 7. Implementation Phases

### 7.1 Phase 1: Core Functionality
- Basic PR creation and management
- Item management with essential details
- Simple workflow approval
- Basic reporting capabilities

### 7.2 Phase 2: Enhanced Features
- Vendor comparison
- Inventory integration
- Template management
- Advanced budget control
- Document generation

### 7.3 Phase 3: Advanced Capabilities
- AI-powered recommendations
- Advanced analytics and reporting
- Mobile app support
- External system integrations

## 8. Success Metrics

### 8.1 Key Performance Indicators
- PR processing time reduction by 30%
- Budget compliance rate improvement to 95%
- User satisfaction score above 4.0/5.0
- System adoption rate of 90% within 3 months
- Error reduction of 50% compared to manual process

### 8.2 Monitoring and Measurement
- User feedback through in-app surveys
- Performance monitoring through telemetry
- Usage analytics for feature utilization
- Error tracking and resolution metrics

## 9. Appendices

### 9.1 Glossary
- **PR**: Purchase Request
- **PO**: Purchase Order
- **GRN**: Goods Received Note
- **FOC**: Free of Charge

### 9.2 Related Documents
- System Architecture Documentation
- API Documentation
- User Guide
- Training Materials

### 9.3 Change History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-03-02 | System | Initial PRD | 