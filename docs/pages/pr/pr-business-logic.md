# Purchase Request: Business Logic

This document outlines the business logic, rules, and constraints for the Purchase Request (PR) module.

## 1. PR Creation and Submission

### 1.1. Basic Creation Rules

*   A user can create a new PR, which will initially be in "Draft" status.
*   When a PR is created, it must have a requestor, a request date, and at least one item.
*   The user can save a PR as a draft at any time, and it will not enter the approval workflow.
*   To submit a PR for approval, the user must explicitly click the "Submit" button.
*   Upon submission, the PR status changes to "Submitted", and it enters the first stage of the approval workflow.

### 1.2. Required Field Validation

**Mandatory PR Header Fields:**
*   Reference Number (auto-generated or manual)
*   Request Date (cannot be in the past)
*   PR Type (General Purchase, Asset Purchase, Service Request, etc.)
*   Requestor Information (name, department)
*   Department (must match requestor's department)
*   Description (minimum 10 characters)

**Mandatory Item Fields:**
*   Location (delivery/installation location)
*   Product Name/Description
*   Request Quantity (must be positive number)
*   Request Unit (standard unit of measure)
*   Required Date (cannot be earlier than PR date)

### 1.3. Business Validation Rules

*   **Duplicate Prevention**: System checks for duplicate PRs based on requestor, date, and similar item descriptions
*   **Quantity Constraints**: Request quantities must be positive numbers; zero or negative quantities not allowed
*   **Date Logic**: Required dates cannot be in the past; must be at least 1 business day from submission date
*   **Department Authorization**: Users can only create PRs for their assigned department unless granted special permissions
*   **Budget Pre-check**: System performs soft budget availability check during creation (warnings only)

## 2. PR Workflow and Status

### 2.1. Workflow Stage Progression

The PR workflow follows a series of stages, each requiring approval from a specific user role:

**Standard Workflow Sequence:**
1. **Requester** (Draft/Initial Creation)
2. **Department Head Approval** (departmentHeadApproval)
3. **Financial Manager Approval** (financialApproval) 
4. **Purchasing Processing** (purchasing)
5. **Final Completion** (completed)

### 2.2. Workflow Actions by Stage

At each stage, the authorized approver can perform these actions:

#### **Department Head Stage:**
*   **Approve**: Moves PR to Financial Manager approval stage
*   **Reject**: Returns PR to requester with rejection reason (status becomes "Rejected")
*   **Send Back**: Returns PR to requester for modifications (status becomes "Review")
*   **Request Information**: Adds comments requesting clarification without changing status

#### **Financial Manager Stage:**
*   **Approve**: Moves PR to Purchasing processing stage
*   **Reject**: Returns PR to requester with financial rejection reason
*   **Send Back**: Can return to either requester or department head based on issue type
*   **Budget Hold**: Places PR on hold pending budget availability

#### **Purchasing Staff Stage:**
*   **Process**: Begins vendor selection and PO creation process
*   **Send Back**: Returns to previous stage if vendor/pricing issues arise
*   **Complete**: Finalizes PR when all procurement actions are complete
*   **Split for Multiple POs**: Divides PR items across multiple purchase orders

### 2.3. Document Status Definitions

#### **Status Hierarchy and Constraints:**
*   **Draft**: Editable by requestor only; not visible to approvers; no workflow actions available
*   **Submitted**: Read-only for requestor; visible to department head; workflow actions enabled
*   **In Progress**: Active in approval workflow; editing restricted by stage and role
*   **Approved**: Department/Financial approval completed; awaiting procurement processing
*   **Completed**: All workflow stages completed; PR closed and read-only
*   **Rejected**: Returned to requestor; editable for resubmission; comments required from rejector
*   **On Hold**: Temporary suspension; typically for budget or vendor issues; resumable by authorized roles

### 2.4. Status Transition Rules

#### **Valid Transitions by Current Status:**
*   **Draft** → Submitted (by Requestor only)
*   **Submitted** → In Progress, Rejected (by Department Head)
*   **In Progress** → Approved, Rejected, On Hold (by current stage approver)
*   **Approved** → Completed, On Hold (by Purchasing Staff)
*   **Rejected** → Draft (by Requestor for resubmission)
*   **On Hold** → Previous Status (by authorized users)

#### **Transition Constraints:**
*   Status cannot skip stages (sequential approval required)
*   Rejected PRs must include mandatory rejection comments
*   Requestors cannot directly transition from "Submitted" back to "Draft"
*   "Completed" status is terminal (no further transitions allowed)
*   "Send Back" action creates special transition paths with audit trail

## 3. Item Management

### 3.1. Basic Item Rules

*   Each PR must contain at least one item.
*   Each item has its own status (Pending, Approved, Rejected, Review).
*   The status of an item can be updated individually or in bulk.
*   When an item is added to a PR, it must have a product name, quantity, and unit of measure.
*   The price of an item can be automatically populated from the product catalog or manually entered.

### 3.2. Item Status Management

#### **Item Status Definitions:**
*   **Pending**: Newly added item awaiting first approval stage
*   **Approved**: Item approved by current workflow stage
*   **Rejected**: Item rejected with mandatory reason
*   **Review**: Item requires additional information or clarification
*   **Accepted**: Item fully approved through all workflow stages
*   **On Hold**: Item temporarily suspended (budget/availability issues)

#### **Quantity Management Rules:**
*   **Request Quantity**: Original quantity requested by user (cannot be zero)
*   **Approved Quantity**: Quantity approved by manager (can be less than requested)
*   **Order Quantity**: Final quantity for procurement (set by purchasing staff)
*   **Unit Conversion**: System handles conversion between request unit and standard inventory unit
*   **Partial Approval**: Approved quantity can be different from requested quantity
*   **Over-approval**: Requires special authorization if approved quantity exceeds requested

### 3.3. Inventory Integration Rules

#### **Stock Availability Checking:**
*   **On-hand Quantity**: Real-time inventory levels displayed for each item
*   **Available Stock**: On-hand minus committed quantities from other PRs/POs
*   **Reorder Alerts**: Visual indicators when stock falls below reorder level
*   **Location-based Availability**: Stock levels shown per storage location
*   **Average Monthly Usage**: Historical consumption data for demand forecasting

#### **Inventory Impact Actions:**
*   **Soft Reservation**: When PR item approved, quantity soft-reserved from available stock
*   **Hard Commitment**: When PO created, quantity becomes hard commitment
*   **Stock Adjustment**: When goods received, inventory levels updated
*   **Allocation Rules**: Priority handling for critical items vs. standard items

### 3.4. Pricing and Cost Management

#### **Price Sources and Hierarchy:**
1. **Vendor Catalog Price**: Current price from preferred vendor price list
2. **Historical Average**: Average cost from last 6 months of purchases
3. **Last Purchase Price**: Most recent price paid for identical item
4. **Manual Override**: User-entered price with justification required
5. **Quote Price**: Price from vendor quotation (for high-value items)

#### **Pricing Business Rules:**
*   **Price Variance Alerts**: Warning when price differs >15% from historical average
*   **Free of Charge (FOC) Items**: Zero-price items with proper authorization
*   **Currency Handling**: Multi-currency support with exchange rate conversion
*   **Tax Calculation**: Automatic tax calculation based on item category and location
*   **Discount Application**: Volume discounts and negotiated rates handling

#### **Financial Calculations:**
*   **Subtotal**: Sum of (quantity × unit price) for all items
*   **Discount Amount**: Line-level and header-level discounts
*   **Tax Amount**: Calculated tax on taxable items
*   **Net Amount**: Subtotal minus discounts
*   **Total Amount**: Net amount plus taxes
*   **Multi-currency Display**: Shows both transaction currency and base currency amounts

### 3.5. Item-Level Workflow Permissions

#### **Department Manager Actions:**
*   Can **Approve**, **Reject**, or set to **Review** any item with status `Pending` or `Review`
*   Can modify **Approved Quantity** (must be ≤ requested quantity unless justified)
*   Can add **Comments** explaining approval decisions
*   Cannot edit **Vendor** or **Pricing** information
*   Must provide **Rejection Reason** for rejected items

#### **Financial Manager Actions:**
*   Can **Approve**, **Reject**, or set to **Review** items approved by Department Manager
*   Can modify **Approved Quantity** and **Budget Allocation**
*   Can view all **Pricing Information** but cannot edit
*   Can place items **On Hold** for budget-related issues
*   Must validate **Budget Availability** before final approval

#### **Purchasing Staff Actions:**
*   Can **Approve**, **Reject**, or set to **Review** items with status `Approved`, `Accepted`, or `Review`
*   Can edit **Vendor Information**, **Pricing**, and **Order Quantities**
*   Can access **Vendor Comparison** functionality
*   Can **Split Items** across multiple purchase orders
*   Can set **Order Unit** different from request unit

#### **Requestor Actions:**
*   Can set item to **Review** if status is `Pending` (with comment required)
*   Can **Edit** all item details while PR is in `Draft` status
*   Can **Delete** items from draft PRs
*   Cannot modify items once PR is submitted (except when returned for revision)

### 3.6. Split Items Action

#### **Split Conditions and Permissions:**
*   **Item Selection**: At least one item must be selected from the list within the PR Details page
*   **Authorization**: Can only be performed by original **Requestor** or **System Administrator**
*   **Status Requirement**: PR must be in modifiable status (`Draft`, `Rejected`, or `Review`)
*   **Minimum Items**: Original PR must retain at least one item after split

#### **Split Process Workflow:**
1. **Validation**: System validates split eligibility and permissions
2. **New PR Creation**: Auto-generates new PR with incremented reference number
3. **Header Replication**: Copies all header details (requestor, department, description) to new PR
4. **Item Transfer**: Moves selected items from original to new PR (preserves item details)
5. **Financial Recalculation**: Updates totals for both original and new PRs
6. **Audit Logging**: Records split action with details of transferred items
7. **User Notification**: Provides confirmation and link to new PR
8. **Status Reset**: New PR starts in `Draft` status regardless of original PR status

#### **Business Rules for Split Actions:**
*   **Comment Required**: Split action must include reason/justification comment
*   **Approval Reset**: New PR must restart approval workflow from beginning
*   **Budget Allocation**: Original budget allocation may need rebalancing
*   **Vendor Grouping**: Items can be split to group by preferred vendors
*   **Delivery Timing**: Items can be split based on different required dates
*   **Department Transfer**: Split can facilitate cross-department item allocation

## 4. Budget and Financials

### 4.1. Budget Control Framework

#### **Budget Association Rules:**
*   Each PR is associated with a **Department Budget** based on requestor's department
*   **Cost Center** allocation required for each PR (can span multiple cost centers)
*   **Project/Job Code** association for project-specific expenditures
*   **Annual Budget** vs **Monthly Budget** controls with rollover rules

#### **Budget Checking Logic:**
*   **Soft Check**: Performed during PR creation (warnings only, submission allowed)
*   **Hard Check**: Performed before final approval (can block approval if insufficient funds)
*   **Available Budget**: Current budget minus committed amounts (existing PRs/POs)
*   **Committed Amounts**: Include approved PRs and active purchase orders
*   **Spending Limit**: Individual user spending limits enforced separately from budget

### 4.2. Financial Validation Rules

#### **Budget Availability Scenarios:**
*   **Sufficient Budget**: PR processed normally through workflow
*   **Budget Warning**: PR amount within 90-110% of available budget (requires manager awareness)
*   **Budget Exceeded**: PR amount >110% of available budget (requires special authorization)
*   **Budget Depleted**: No remaining budget (requires budget revision or emergency approval)

#### **Emergency Override Process:**
*   **Justification Required**: Detailed business case for budget override
*   **Higher Authority Approval**: Requires Financial Manager and General Manager approval
*   **Budget Amendment**: May trigger formal budget revision process
*   **Alternative Funding**: Option to reassign to different budget codes

### 4.3. Financial Calculations and Rules

#### **PR Total Calculation:**
*   **Line Total**: (Request Quantity × Unit Price) per item
*   **Subtotal**: Sum of all line totals
*   **Line Discounts**: Item-specific discount amounts
*   **Header Discounts**: PR-level discount percentages
*   **Tax Calculation**: Based on item tax codes and delivery location
*   **Net Amount**: Subtotal minus total discounts
*   **Final Total**: Net amount plus total taxes

#### **Currency and Exchange Rate Rules:**
*   **Multi-Currency Support**: PR can contain items in different currencies
*   **Base Currency Conversion**: All amounts displayed in both transaction and base currency
*   **Exchange Rate Source**: Daily rates from central bank or financial system
*   **Rate Lock**: Exchange rates locked at PR approval for cost consistency
*   **Variance Handling**: Rate differences between PR and PO creation managed through variance accounts

### 4.4. Financial Approval Thresholds

#### **Approval Authority Matrix:**
*   **Department Manager**: Up to $10,000 per PR
*   **Financial Manager**: Up to $50,000 per PR  
*   **General Manager**: Up to $100,000 per PR
*   **Board Approval**: Above $100,000 (special process required)

#### **Cumulative Spending Controls:**
*   **Monthly Limits**: Individual user monthly spending limits
*   **Annual Limits**: Department annual spending limits
*   **Vendor Concentration**: Limits on percentage of budget to single vendor
*   **Category Limits**: Spending limits by expense category (office supplies, equipment, etc.)

## 5. Role-Based Access Control (RBAC)

The actions a user can perform on a PR are determined by their role, with granular field-level permissions and information visibility controls.

### 5.1. Role Definitions and Permissions

#### **Requestor/Staff Role**
*   **Edit Permissions**: Can edit location, product, comment, request quantity, request unit, required date, PR header fields (ref number, date, type, requestor, department, description)
*   **View Restrictions**: 
    *   **Cannot view** vendor names, pricelist numbers, or any pricing information
    *   **Cannot view** transaction summary (financial totals)
    *   **Cannot access** vendor comparison functionality
*   **Actions**: Create, edit, submit, and delete own PRs
*   **Workflow**: Can submit PR for approval, delete draft PRs

#### **Department Manager Role**
*   **Edit Permissions**: Can edit comments and approved quantities only
*   **View Access**: Can view all vendor and pricing information but cannot edit vendor/pricing fields
*   **Actions**: Approve, reject, or send back PRs assigned to them
*   **Financial Access**: Can view transaction summary and all financial information

#### **Financial Manager Role**
*   **Edit Permissions**: Can edit comments and approved quantities only
*   **View Access**: Full access to all vendor, pricing, and financial information
*   **Actions**: Provide final financial approval, reject, or send back PRs
*   **Financial Access**: Can view transaction summary and all financial information

#### **Purchasing Staff Role**
*   **Edit Permissions**: Can edit comments, approved quantities, vendor fields, pricing information, and order units
*   **View Access**: Full access to all information including vendor comparison functionality
*   **Actions**: Process approved PRs, manage vendor selection, create purchase orders
*   **Financial Access**: Can view transaction summary and all financial information

### 5.2. Financial Information Visibility

**Restricted Financial Information** (hidden from Requestor/Staff roles):
*   Unit prices and total amounts
*   Vendor pricing details
*   Transaction summary (subtotals, discounts, taxes, net amounts, total amounts)
*   Vendor comparison pricing data
*   Exchange rates and currency conversions

**Purpose**: Ensures budget confidentiality and prevents requestors from seeing sensitive vendor pricing that could influence future negotiations.

### 5.3. Field-Level Permission Matrix

| Field Category | Requestor/Staff | Dept Manager | Financial Manager | Purchasing Staff |
|---|---|---|---|---|
| **Basic Item Details** | Edit | View Only | View Only | Edit |
| **Quantities** | Edit (Request) | Edit (Approved) | Edit (Approved) | Edit (Approved) |
| **Vendor Information** | Hidden | View Only | View Only | Edit |
| **Pricing Information** | Hidden | View Only | View Only | Edit |
| **Comments** | Edit | Edit | Edit | Edit |
| **PR Header Fields** | Edit | View Only | View Only | View Only |

### 5.4. UI Components Access Control

#### **Sidebar Functionality**
*   **Comments & Attachments**: Accessible to all roles
*   **Activity Log**: Accessible to all roles with full audit trail visibility

#### **Transaction Summary**
*   **Visible to**: Department Manager, Financial Manager, Purchasing Staff
*   **Hidden from**: Requestor, Staff
*   **Content**: Subtotals, discounts, taxes, net amounts, total amounts, currency information

#### **Vendor Comparison**
*   **Accessible to**: Purchasing Staff only
*   **Hidden from**: All other roles including approvers
*   **Purpose**: Allows purchasing staff to compare vendor pricing during procurement process

## 6. User Interface and Layout

### 6.1. Two-Column Layout Design

The PR Detail page implements a responsive two-column layout:

*   **Main Content Area**: Contains PR header information, item tabs (Items, Budgets, Workflow), and conditional transaction summary
*   **Collapsible Sidebar**: Houses comments & attachments and activity log functionality
*   **Toggle Control**: Users can show/hide the sidebar using a toggle button in the header toolbar

### 6.2. Sidebar Components

#### **Comments & Attachments Tab**
*   **Real-time Commenting**: Users can add comments with timestamps and user attribution
*   **File Attachments**: Support for document attachments with view/download functionality
*   **User Avatars**: Display user profile pictures and initials for better user experience
*   **Keyboard Shortcuts**: Ctrl+Enter to quickly send comments

#### **Activity Log Tab**
*   **Comprehensive Audit Trail**: Records all PR actions, status changes, and user interactions
*   **Search Functionality**: Filter activity entries by user, action, description, or timestamp
*   **Chronological Display**: Shows activities in reverse chronological order with detailed timestamps
*   **User Attribution**: Clear identification of who performed each action

### 6.3. Transaction Summary Enhancement

*   **Card-Based Design**: Modern card layout with visual hierarchy
*   **Financial Breakdown**: Subtotal, discounts, taxes, and total amounts with clear labeling
*   **Multi-Currency Support**: Display both transaction currency and base currency
*   **Visual Indicators**: Icons and color coding for different financial components
*   **RBAC Integration**: Automatically hidden from requestor roles to maintain financial confidentiality

### 6.4. Responsive Design Principles

*   **Mobile-First Approach**: Optimized for various screen sizes
*   **Progressive Enhancement**: Sidebar collapses on smaller screens
*   **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
*   **Performance**: Smooth transitions and animations for better user experience

## 7. Audit Trail and Compliance

### 7.1. Activity Logging Requirements

#### **Mandatory Audit Events:**
*   **PR Creation**: User, timestamp, initial values
*   **Status Changes**: All workflow transitions with previous and new status
*   **Field Modifications**: Granular tracking of field-level changes with before/after values
*   **Approval Actions**: Approve, reject, send back actions with comments
*   **Financial Changes**: All pricing, quantity, and total amount modifications
*   **Access Events**: User logins, PR views, report generations

#### **Audit Data Retention:**
*   **Minimum Retention**: 7 years for financial compliance
*   **Data Integrity**: Tamper-proof logging with checksums
*   **User Attribution**: All changes linked to specific user accounts
*   **Timestamp Accuracy**: Server-side timestamps in UTC format
*   **Session Tracking**: Changes tracked within user session context

### 7.2. Compliance Controls

#### **Segregation of Duties:**
*   **No Self-Approval**: Users cannot approve their own PRs
*   **Role Separation**: Requestors cannot have approval roles for same department
*   **Vendor Independence**: Purchasing staff cannot approve PRs they created
*   **Financial Review**: Financial approval required separately from operational approval

#### **Data Security and Privacy:**
*   **PCI Compliance**: Vendor payment information protected
*   **GDPR Compliance**: Personal data handling in comments and user information
*   **Access Logging**: All data access logged for security audit
*   **Data Encryption**: Sensitive financial data encrypted at rest and in transit

### 7.3. Regulatory Requirements

#### **Financial Reporting:**
*   **Commitment Accounting**: PRs create financial commitments for reporting
*   **Budget Tracking**: Real-time budget utilization reporting
*   **Vendor Payment**: Integration with accounts payable for payment processing
*   **Tax Reporting**: Tax amount tracking for regulatory compliance

#### **Internal Controls:**
*   **Three-Way Matching**: PR → PO → Receipt matching requirements
*   **Approval Evidence**: Digital signatures and timestamp proof
*   **Document Retention**: All PR documents and attachments preserved
*   **Variance Analysis**: Price and quantity variance tracking and explanation

## 8. System Integration and Data Flow

### 8.1. Inventory Management Integration

#### **Real-time Stock Updates:**
*   **Stock Inquiry**: Live inventory levels displayed during PR creation
*   **Reservation System**: Approved quantities soft-reserved from available stock
*   **Reorder Triggers**: PR creation can trigger automatic reorder point calculations
*   **Location Management**: Multi-location inventory tracking and allocation

#### **Inventory Impact Workflow:**
1. **PR Creation**: Check current stock levels and display availability
2. **PR Approval**: Create soft reservation for approved quantities
3. **PO Creation**: Convert soft reservation to hard commitment
4. **Goods Receipt**: Update actual inventory levels and clear commitments
5. **Invoice Processing**: Final cost updates and variance accounting

### 8.2. Vendor Management Integration

#### **Vendor Data Synchronization:**
*   **Vendor Master**: Real-time access to vendor information and ratings
*   **Price Lists**: Current vendor pricing and contract terms
*   **Performance Metrics**: Vendor delivery and quality history
*   **Compliance Status**: Vendor certification and approval status

#### **Procurement Process Flow:**
*   **Vendor Selection**: Automatic preferred vendor suggestion based on item category
*   **Quote Management**: Integration with vendor quote request system
*   **Contract Compliance**: Verification against existing vendor contracts
*   **Performance Tracking**: Delivery time and quality metrics collection

### 8.3. Financial System Integration

#### **Budget and Cost Center Integration:**
*   **Real-time Budget**: Live budget balance inquiry and commitment updates
*   **Cost Center Validation**: Verification of valid cost center codes
*   **Project Accounting**: Integration with project management for job costing
*   **Financial Reporting**: Automated journal entry creation for commitments

#### **Accounts Payable Integration:**
*   **PO Generation**: Approved PRs automatically converted to purchase orders
*   **Three-way Matching**: PR → PO → Invoice matching process
*   **Payment Processing**: Integration with AP for vendor payment
*   **Accrual Accounting**: Month-end accrual processing for received goods

### 8.4. Workflow and Notification System

#### **Automated Notifications:**
*   **Approval Pending**: Email alerts to approvers when PR awaits action
*   **Budget Alerts**: Warnings when department approaches budget limits
*   **Escalation Rules**: Automatic escalation for overdue approvals
*   **Status Updates**: Real-time notifications to requestors on PR progress

#### **Integration Patterns:**
*   **API Connectivity**: RESTful APIs for external system integration
*   **Data Synchronization**: Batch processes for master data updates
*   **Error Handling**: Automatic retry and error notification mechanisms
*   **Performance Monitoring**: Integration point monitoring and alerting
