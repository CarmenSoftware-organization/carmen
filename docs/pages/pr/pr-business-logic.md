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

### 2.1.1. Workflow Decision Engine

The system implements an intelligent **Workflow Decision Engine** that automatically determines the appropriate workflow action based on item status analysis:

**Priority-Based Decision Logic:**
1. **All Rejected**: If all items are rejected → Automatic PR rejection
2. **Any Review**: If any items need review → Return to previous stage
3. **Any Pending**: If any items are pending → Block submission (requires action)
4. **Any Approved**: If any items are approved → Allow progression to next stage

**Decision Engine Outputs:**
- **Action Type**: approve, reject, return, or blocked
- **Button Text**: Dynamic text based on workflow state ("Submit & Approve", "Submit & Reject", etc.)
- **Button Styling**: Visual indicators with appropriate colors (green for approve, red for reject, orange for review)
- **Validation Reason**: Clear explanation of why the action is or isn't available
- **Items Summary**: Count breakdown of approved, rejected, review, and pending items

**Workflow State Management:**
- **Real-time Analysis**: Engine evaluates workflow state on every item status change
- **Intelligent Blocking**: Prevents submission when items require attention
- **Clear Communication**: Provides specific feedback on what actions are needed
- **Status Aggregation**: Summarizes complex item states into actionable decisions

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

#### **Enhanced Item Action Framework:**
The system implements a sophisticated **Item Workflow State** engine that determines available actions based on:
- **User Role**: Organizational role (Staff, Department Manager, Financial Manager, Purchasing Staff)
- **Item Status**: Current item status (Pending, Review, Approved, Rejected)
- **Workflow Stage**: Current PR workflow stage (departmentHeadApproval, financialApproval, purchasing)
- **Role Context**: Active role selection for multi-role users

#### **Smart Action Availability:**
- **Dynamic Permissions**: Available actions calculated in real-time based on role and context
- **Status-Based Logic**: Only relevant actions shown for current item status
- **Workflow Stage Validation**: Actions validated against current PR workflow stage
- **Comment Requirement**: Certain actions require mandatory comments for audit trail

#### **Department Manager Actions:**
*   Can **Approve**, **Reject**, or set to **Review** any item with status `Pending` or `Review`
*   Can modify **Approved Quantity** (must be ≤ requested quantity unless justified)
*   Can add **Comments** explaining approval decisions
*   Cannot edit **Vendor** or **Pricing** information
*   Must provide **Rejection Reason** for rejected items
*   **Available Actions**: ['approve', 'reject', 'review', 'comment', 'history']

#### **Financial Manager Actions:**
*   Can **Approve**, **Reject**, or set to **Review** items approved by Department Manager
*   Can modify **Approved Quantity** and **Budget Allocation**
*   Can view all **Pricing Information** but cannot edit
*   Can place items **On Hold** for budget-related issues
*   Must validate **Budget Availability** before final approval
*   **Available Actions**: ['approve', 'reject', 'review', 'comment', 'history']

#### **Purchasing Staff Actions:**
*   Can **Approve**, **Reject**, or set to **Review** items with status `Approved`, `Accepted`, or `Review`
*   Can edit **Vendor Information**, **Pricing**, and **Order Quantities**
*   Can access **Vendor Comparison** functionality
*   Can **Split Items** across multiple purchase orders
*   Can set **Order Unit** different from request unit
*   **Available Actions**: ['approve', 'reject', 'review', 'comment', 'history', 'vendor_compare', 'split']

#### **Requestor Actions:**
*   Can set item to **Review** if status is `Pending` (with comment required)
*   Can **Edit** all item details while PR is in `Draft` status
*   Can **Delete** items from draft PRs
*   Cannot modify items once PR is submitted (except when returned for revision)
*   **Available Actions**: ['review', 'comment', 'history'] (for pending items only)

#### **System Administrator Actions:**
*   **Full Permissions**: Can perform all available actions regardless of workflow stage
*   **Override Capability**: Can approve, reject, or review any item at any stage
*   **Administrative Functions**: Can reassign workflow roles and modify system settings
*   **Available Actions**: ['approve', 'reject', 'review', 'comment', 'history', 'admin_override']

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

The Purchase Request system implements a comprehensive dual-role RBAC system that supports users having multiple organizational roles and multiple workflow stage roles. This system provides precise control over permissions based on both the user's inherent organizational role and their assigned workflow stage role for each PR.

### 5.0. Multi-Role RBAC System Overview

#### **Dual-Role Architecture**
The system operates on two distinct but interconnected role types:

1. **Organizational Roles (User Roles)**: Permanent roles based on organizational structure
   - Staff/Requestor, Department Manager, Financial Manager, Purchasing Staff, System Administrator
   - Users can have multiple organizational roles simultaneously
   - Permission aggregation follows Union principle (user inherits permissions from all assigned roles)

2. **Workflow Stage Roles (Contextual Roles)**: Assigned per PR per workflow stage
   - Requestor, Approver, Purchaser, Observer
   - Users can be assigned multiple workflow stage roles across different PRs
   - Users can have different workflow stage roles for different stages of the same PR

#### **Permission Calculation Formula**
```
Final Permission = Active Organizational Role ∩ Max(Workflow Stage Roles) ∩ Current Stage ∩ Visibility Scope
```

#### **Visibility Rules Foundation**
- **Base Rule**: Users can ALWAYS see PRs they created (regardless of other permissions)
- **Extended Visibility**: Users can see department or BU PRs ONLY if explicitly assigned visibility permissions
- **Additive Model**: All visibility levels are cumulative (Own + Department + BU if assigned)

### 5.1. PR Visibility Matrix

#### **Base Visibility Rules**
| User Type | Own Created PRs | Department PRs | Entire BU PRs |
|-----------|----------------|----------------|---------------|
| **Any User** | ✅ Always Visible | 🔐 Only if Assigned | 🔐 Only if Assigned |
| **System Admin** | ✅ Always Visible | ✅ Always Visible | ✅ Always Visible |

#### **Assigned Visibility Permissions Matrix**
| Organizational Role | Default Visibility | Can Be Assigned Dept | Can Be Assigned BU |
|-------------------|-------------------|-------------------|------------------|
| **Staff** | Self Only | ✅ Yes | ❌ No |
| **Department Manager** | Self Only | ✅ Yes (Own Dept) | 🔐 Special Approval |
| **Financial Manager** | Self Only | ✅ Yes (Any Dept) | ✅ Yes |
| **Purchasing Staff** | Self Only | ✅ Yes (Relevant Depts) | ✅ Yes |
| **System Administrator** | Full BU | ✅ Yes | ✅ Yes |

#### **Visibility Assignment Authorization**
| Assigner Role | Can Assign Self | Can Assign Department | Can Assign BU |
|---------------|----------------|---------------------|---------------|
| **System Admin** | ✅ Yes | ✅ Yes | ✅ Yes |
| **BU Manager** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Department Manager** | ✅ Yes | ✅ Own Dept Only | ❌ No |
| **Financial Manager** | ✅ Yes | ✅ Yes | 🔐 With Approval |
| **Others** | ❌ No | ❌ No | ❌ No |

#### **Visibility Calculation Examples**
- **Example 1**: Staff user creates PR-001 → Can see PR-001 (own)
- **Example 2**: Staff user + Department visibility assigned → Can see PR-001 (own) + all department PRs
- **Example 3**: Department Manager + BU visibility assigned → Can see own PRs + all BU PRs
- **Example 4**: Multiple role user (Staff + Dept Manager) → Inherits highest visibility scope

### 5.2. Multiple Organizational Roles Support

#### **Role Combination Matrix**
| Primary Role | Secondary Roles Allowed | Permission Aggregation | Active Role Selection |
|-------------|------------------------|---------------------|---------------------|
| **Staff** | Department Manager, Purchasing Staff | Union of Permissions | Required |
| **Department Manager** | Financial Manager, Purchasing Staff | Union of Permissions | Required |
| **Financial Manager** | Department Manager, Purchasing Staff | Union of Permissions | Required |
| **Purchasing Staff** | Department Manager | Union of Permissions | Required |
| **System Administrator** | All Roles | Full Permissions | Optional |

#### **Multi-Role Business Rules**
- **Rule 1**: Users can have multiple organizational roles simultaneously
- **Rule 2**: Permission aggregation follows Union principle (user inherits ALL permissions)
- **Rule 3**: Users must select "active" organizational role for current session
- **Rule 4**: Higher organizational role permissions override lower ones
- **Rule 5**: Active role selection affects current session permissions only

### 5.3. Workflow Stage Role Assignment Matrix

#### **Workflow Stage Roles per PR**
| PR Stage | Requestor | Approver | Purchaser | Observer |
|----------|-----------|----------|-----------|----------|
| **Draft** | ✅ Creator | ❌ None | ❌ None | 🔍 Assigned Users |
| **Department Approval** | 🔍 Creator | ✅ Dept Manager | ❌ None | 🔍 Others |
| **Financial Approval** | 🔍 Creator | ✅ Finance Manager | ❌ None | 🔍 Others |
| **Purchasing Processing** | 🔍 Creator | ❌ None | ✅ Purchasing Staff | 🔍 Others |
| **Completed** | 🔍 Creator | ❌ None | ❌ None | 🔍 All |

#### **Multiple Workflow Stage Roles Support**
| User Assignment | Same PR | Different PRs | Conflict Resolution |
|----------------|---------|---------------|-------------------|
| **Multiple Observer Roles** | ✅ Allowed | ✅ Allowed | No Conflict |
| **Requestor + Observer** | ✅ Allowed | ✅ Allowed | No Conflict |
| **Requestor + Approver** | ❌ Not Allowed | ✅ Allowed | System Prevents |
| **Approver + Observer** | ✅ Allowed | ✅ Allowed | User Chooses |
| **Approver + Purchaser** | ❌ Same PR | ✅ Allowed | System Prevents |

#### **Workflow Stage Role Assignment Rules**
- **Rule 1**: Each PR must have exactly one Requestor (the creator)
- **Rule 2**: Each workflow stage must have exactly one Approver assigned
- **Rule 3**: Each PR can have multiple Observers at any stage
- **Rule 4**: Users can hold different workflow stage roles for different PRs
- **Rule 5**: Workflow stage roles can be reassigned by administrators
- **Rule 6**: Users cannot be both Requestor and final Approver for same PR

### 5.4. Combined Permission Calculation Matrix

#### **Permission Aggregation Formula**
```
Final Permission = Active Org Role ∩ Max(Workflow Stage Roles) ∩ Current Stage ∩ Visibility Scope
```

#### **Role Combination Permission Matrix**
| Org Role | Workflow Role | Current Stage | Visibility Scope | Final Permission |
|----------|---------------|---------------|------------------|------------------|
| Staff | Requestor | Draft | Self | Full Edit (Own PR) |
| Staff | Requestor | Submitted | Self | View Only (Own PR) |
| Staff | Observer | Any | Department | View Only (Dept PRs) |
| Dept Manager | Approver | Dept Approval | Department | Approve (Dept PRs) |
| Dept Manager | Observer | Other Stages | Department | View Only (Dept PRs) |
| Financial Manager | Approver | Financial Approval | BU | Approve (All PRs) |
| Purchasing Staff | Purchaser | Purchasing | BU | Process (All PRs) |

#### **Multi-Role Permission Calculation Examples**

**Scenario 1: User with Staff + Department Manager roles**
- Available Roles: Staff, Department Manager
- Active Role: Department Manager
- Workflow Stage Role: Approver (Department Approval stage)
- Visibility Scope: Department
- **Result**: Can approve department PRs with full departmental financial access

**Scenario 2: User with multiple workflow stage roles**
- Organizational Role: Financial Manager
- Workflow Stage Roles: Observer (PR-1), Approver (PR-2)
- Visibility Scope: BU
- **Result**: Can view PR-1, can approve PR-2, sees all BU PRs

**Scenario 3: Conflict resolution**
- Organizational Role: Staff
- Workflow Stage Role: Requestor (created PR-1)
- System Assignment: Approver (PR-1) - BLOCKED
- **Result**: System prevents assignment, maintains segregation of duties

#### **Permission Hierarchy Rules**
- **Rule 1**: Organizational role provides base permission foundation
- **Rule 2**: Workflow stage role can enhance or restrict organizational permissions
- **Rule 3**: Current workflow stage validates action availability
- **Rule 4**: Visibility scope determines data access boundaries
- **Rule 5**: Most restrictive permission always takes precedence
- **Rule 6**: No permission can exceed user's organizational role limitations

### 5.5. Enhanced Field-Level Access Matrix

#### **Field Visibility by Role Combination**
| Field Category | Staff/Requestor | Staff/Observer | Dept Mgr/Approver | Finance Mgr/Approver | Purchasing/Purchaser |
|---------------|----------------|----------------|-------------------|---------------------|-------------------|
| **Basic Info** | ✅ Edit | 🔍 View | 🔍 View | 🔍 View | 🔍 View |
| **Quantities** | ✅ Edit Request | 🔍 View | ✅ Edit Approved | ✅ Edit Approved | ✅ Edit Order |
| **Dates** | ✅ Edit Required | 🔍 View | 🔍 View | 🔍 View | ✅ Edit Delivery |
| **Vendor Info** | ❌ Hidden | ❌ Hidden | 🔍 View | 🔍 View | ✅ Edit |
| **Pricing** | ❌ Hidden* | ❌ Hidden* | 🔍 View | 🔍 View | ✅ Edit |
| **Financial** | ❌ Hidden | ❌ Hidden | ✅ Edit Discounts | ✅ Edit All | 🔍 View |
| **Budget** | ❌ Hidden | ❌ Hidden | 🔍 View Dept | ✅ Edit All | 🔍 View |
| **Comments** | ✅ Edit | ✅ Edit | ✅ Edit | ✅ Edit | ✅ Edit |

*Except with "Show Prices" toggle enabled

#### **Enhanced Field Permission Rules**
- **Financial fields are hidden from Staff organizational role** regardless of workflow stage role
- **Vendor information is hidden from Requestor workflow stage role** regardless of organizational role
- **Approval fields are only editable by Approver workflow stage role**
- **Procurement fields are only editable by Purchaser workflow stage role**
- **"Show Prices" toggle only affects total amounts**, not detailed pricing panels
- **Role-based panels are completely hidden** for unauthorized roles

#### **Multi-Role Field Access Logic**
1. **Base Access**: Determined by active organizational role
2. **Role Enhancement**: Workflow stage role can provide additional access
3. **Role Restriction**: Workflow stage role can restrict organizational access
4. **Stage Validation**: Current workflow stage validates field editability
5. **Scope Filtering**: Visibility scope determines which PRs are accessible

### 5.6. Role Definitions and Permissions

#### **Requestor/Staff Role**
*   **Edit Permissions**: Can edit location, product, comment, request quantity, request unit, required date, delivery point, PR header fields (type, description)
*   **View Restrictions**: 
    *   **Cannot view** vendor names, pricelist numbers, or price per unit information
    *   **Cannot view** detailed pricing panels (vendor, discount, net amount, tax breakdown)
    *   **Cannot view** FOC (Free of Charge) quantities
    *   **Cannot view** transaction summary (financial totals)
    *   **Cannot access** vendor comparison functionality
*   **Conditional Access**: Can see total amounts only when "Show Prices" toggle is enabled
*   **Actions**: Create, edit, submit, and delete own PRs
*   **Workflow**: Can submit PR for approval, delete draft PRs

#### **Department Manager Role**
*   **Edit Permissions**: Can edit comments, approved quantities, vendor information, discount amounts, and tax amounts
*   **View Access**: Can view all vendor and pricing information including detailed pricing panels
*   **View FOC Information**: Can view and edit FOC (Free of Charge) quantities
*   **Actions**: Approve, reject, or send back PRs assigned to them
*   **Financial Access**: Can view transaction summary and all financial information
*   **Pricing Panel Access**: Always visible regardless of "Show Prices" toggle setting

#### **Financial Manager Role**
*   **Edit Permissions**: Can edit comments, approved quantities, vendor information, discount amounts, and tax amounts
*   **View Access**: Full access to all vendor, pricing, and financial information including detailed pricing panels
*   **View FOC Information**: Can view and edit FOC (Free of Charge) quantities
*   **Actions**: Provide final financial approval, reject, or send back PRs
*   **Financial Access**: Can view transaction summary and all financial information
*   **Pricing Panel Access**: Always visible regardless of "Show Prices" toggle setting

#### **Purchasing Staff Role**
*   **Edit Permissions**: Can edit comments, approved quantities, vendor fields, all pricing information (including price per unit), discount amounts, tax amounts, and order units
*   **View Access**: Full access to all information including vendor comparison functionality and detailed pricing panels
*   **View FOC Information**: Can view and edit FOC (Free of Charge) quantities
*   **Actions**: Process approved PRs, manage vendor selection, create purchase orders
*   **Financial Access**: Can view transaction summary and all financial information
*   **Pricing Panel Access**: Always visible regardless of "Show Prices" toggle setting

### 5.7. Action Authorization Matrix

#### **Actions by Role Combination and Stage**
| Action | Staff/Requestor | Dept Mgr/Approver | Finance Mgr/Approver | Purchasing/Purchaser |
|--------|----------------|-------------------|---------------------|-------------------|
| **Edit** | ✅ Draft Stage Only | ❌ Never | ❌ Never | ✅ Procurement Fields |
| **Delete** | ✅ Draft Stage Only | ❌ Never | ❌ Never | ❌ Never |
| **Submit** | ✅ Draft Stage Only | ❌ Never | ❌ Never | ❌ Never |
| **Approve** | ❌ Never | ✅ At Dept Stage | ✅ At Finance Stage | ❌ Never |
| **Reject** | ❌ Never | ✅ At Dept Stage | ✅ At Finance Stage | ✅ At Purchasing |
| **Send Back** | ❌ Never | ✅ At Dept Stage | ✅ At Finance Stage | ✅ At Purchasing |
| **Process** | ❌ Never | ❌ Never | ❌ Never | ✅ At Purchasing |
| **Create PO** | ❌ Never | ❌ Never | ❌ Never | ✅ At Purchasing |
| **Comment** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |

#### **Scope-Based Action Authorization**
| Visibility Scope | Own Created PRs | Department PRs | BU PRs |
|-----------------|----------------|----------------|---------|
| **Self Only** | Full Actions (if workflow role) | ❌ No Access | ❌ No Access |
| **Department Assigned** | Full Actions (if workflow role) | Actions (if workflow role) | ❌ No Access |
| **BU Assigned** | Full Actions (if workflow role) | Actions (if workflow role) | Actions (if workflow role) |

#### **Stage-Specific Action Rules**
| Workflow Stage | Requestor Actions | Approver Actions | Purchaser Actions | Observer Actions |
|----------------|-------------------|------------------|-------------------|------------------|
| **Draft** | Edit, Delete, Submit | - | - | View |
| **Submitted** | View, Comment | Approve, Reject, Send Back | - | View |
| **Dept Approval** | View, Comment | - | - | View |
| **Financial Approval** | View, Comment | Approve, Reject, Send Back | - | View |
| **Purchasing** | View, Comment | - | Process, Create PO, Edit Vendors | View |
| **Completed** | View | View | View | View |

#### **Multi-Role Action Logic**
- **Rule 1**: User can perform any action authorized by their highest applicable role combination
- **Rule 2**: User must explicitly choose which role combination to use for each action
- **Rule 3**: Actions must be logged with specific role combination used
- **Rule 4**: User cannot perform conflicting actions simultaneously
- **Rule 5**: Stage restrictions override role permissions

### 5.8. Conflict Resolution and Compliance Matrix

#### **Role Conflict Scenarios**
| Conflict Type | Scenario | Resolution | System Action |
|---------------|----------|------------|---------------|
| **Same PR Requestor/Approver** | User created PR, assigned as approver | Block Assignment | Prevent + Alert |
| **Multiple Approver Roles** | User assigned multiple approver roles | Allow with Selection | Prompt Role Choice |
| **Competing Organizational Roles** | User has Staff + Manager roles | Use Active Role | Require Role Selection |
| **Workflow Stage Conflicts** | User assigned conflicting workflow roles | Block Conflicts | Prevent + Alert |

#### **Conflict Prevention Rules**
| Prevention Rule | Validation Point | Action |
|----------------|------------------|--------|
| **No Self-Approval** | Assignment Time | Block assignment if user is requestor |
| **No Role Stacking** | Action Time | Prevent conflicting actions |
| **Segregation of Duties** | Workflow Time | Require different users for key stages |
| **Authority Limits** | Approval Time | Validate approval authority |

#### **Segregation of Duties Matrix**
| Role Combination | Same PR | Different PRs | Compliance Rule |
|-----------------|---------|---------------|-----------------|
| **Requestor + Dept Approver** | ❌ Blocked | ✅ Allowed | No self-approval |
| **Requestor + Finance Approver** | ❌ Blocked | ✅ Allowed | No self-approval |
| **Requestor + Purchaser** | 🔐 Restricted | ✅ Allowed | Limited procurement actions |
| **Dept Approver + Finance Approver** | ❌ Blocked | ✅ Allowed | No double approval |
| **Approver + Purchaser** | 🔐 Restricted | ✅ Allowed | Sequential stages only |

### 5.9. Audit and Compliance Matrix

#### **Audit Requirements by Role Combination**
| Role Combination | Actions Logged | Visibility Logged | Role Switches Logged |
|-----------------|----------------|-------------------|-------------------|
| **All Users** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Approvers** | ✅ Enhanced | ✅ Enhanced | ✅ Enhanced |
| **System Admin** | ✅ All Actions | ✅ All Access | ✅ All Switches |

#### **Enhanced Audit Trail Requirements**
- **Multi-Role Action Logging**: All actions must be logged with specific role combination used
- **Role Switch Tracking**: Role switches must be logged with timestamp and reason  
- **Permission Calculation Audit**: System must track which roles were active for each action
- **Compliance Validation Logging**: System must log segregation of duties validations

#### **Compliance Validation Matrix**
| Compliance Check | Frequency | Trigger | Action |
|-----------------|-----------|---------|--------|
| **Segregation of Duties** | Real-time | Action Attempt | Block if Violation |
| **Authority Limits** | Real-time | Approval Attempt | Block if Exceeded |
| **Role Assignments** | Daily | Batch Process | Alert if Irregular |
| **Visibility Permissions** | Weekly | Audit Process | Report Anomalies |

### 5.10. Multi-Role RBAC Implementation Summary

#### **Key Features of the Multi-Role RBAC System**

1. **Dual-Role Architecture**: Combines organizational roles (permanent) with workflow stage roles (contextual)
2. **Multiple Role Support**: Users can have multiple organizational roles and multiple workflow stage roles
3. **Dynamic Permission Calculation**: Real-time permission aggregation using intersection formulas
4. **Granular Visibility Control**: Base visibility (own PRs) + assigned visibility (department/BU)
5. **Conflict Resolution**: Automatic prevention of segregation of duties violations
6. **Comprehensive Audit**: Enhanced logging for multi-role scenarios

#### **Permission Calculation Hierarchy**
```
1. Base Visibility: Own created PRs (always accessible)
2. Extended Visibility: Department/BU PRs (if assigned)
3. Organizational Role: Provides permission foundation
4. Workflow Stage Role: Enhances or restricts permissions
5. Current Stage: Validates action availability
6. Final Permission: Most restrictive takes precedence
```

#### **Implementation Phases**
- **Phase 1**: Organizational role multiplicity support
- **Phase 2**: Workflow stage role assignment system
- **Phase 3**: Permission aggregation and calculation engine
- **Phase 4**: Conflict resolution and compliance validation
- **Phase 5**: Enhanced audit and monitoring

#### **Business Benefits**
- **Flexibility**: Supports complex organizational structures
- **Security**: Maintains segregation of duties
- **Scalability**: Handles growing business requirements  
- **Compliance**: Comprehensive audit and control framework
- **Usability**: Clear role selection and permission visibility

### 5.2. Financial Information Visibility

#### **"Show Prices" Toggle Control**
*   **Purpose**: Allows users to control visibility of total amounts in main item table
*   **Scope**: Controls only the price column in the main items table
*   **Independence**: Separate from detailed pricing panel visibility (which is role-based)
*   **Location**: Accessible via Profile Menu → Switch Context → Show Prices Toggle

#### **Role-Based Financial Access**

**Requestor/Staff Role Restrictions**:
*   **Always Hidden**: Price per unit, detailed pricing panels, FOC quantities, vendor comparison
*   **Conditionally Hidden**: Total amounts (controlled by "Show Prices" toggle)
*   **Never Visible**: Transaction summary, vendor pricing details, exchange rates

**Approver/Purchaser Role Access**:
*   **Always Visible**: Detailed pricing panels, FOC quantities, vendor information
*   **Toggle Controlled**: Main table price column (same as requestors)
*   **Full Access**: Transaction summary, vendor comparison, all financial data

**Purpose**: Ensures budget confidentiality while allowing requestors limited price visibility when needed for decision-making.

### 5.3. Legacy Field-Level Permission Matrix (Single-Role Reference)

**Note**: This matrix shows traditional single-role permissions. For multi-role scenarios, refer to Section 5.5 Enhanced Field-Level Access Matrix.

| Field Category | Requestor/Staff | Dept Manager | Financial Manager | Purchasing Staff |
|---|---|---|---|---|
| **Basic Item Details** | Edit | View Only | View Only | Edit |
| **Quantities** | Edit (Request) | Edit (Approved) | Edit (Approved) | Edit (Approved) |
| **Vendor Information** | Hidden | Edit | Edit | Edit |
| **Price Per Unit** | Hidden | View Only | View Only | Edit |
| **Discount & Tax** | Hidden | Edit | Edit | Edit |
| **FOC Quantities** | Hidden | Edit | Edit | Edit |
| **Total Amounts** | Toggle Control | Always Visible | Always Visible | Always Visible |
| **Comments** | Edit | Edit | Edit | Edit |
| **Required Date** | Edit | Edit | Edit | Edit |
| **Delivery Point** | Edit (Dropdown) | Edit (Dropdown) | Edit (Dropdown) | Edit (Dropdown) |
| **On Hand/On Order** | View Only | View Only | View Only | View Only |
| **PR Header Fields** | Edit | View Only | View Only | View Only |

**Important**: This matrix applies only when users have single organizational roles and single workflow stage roles. For users with multiple roles, the system uses the Enhanced Field-Level Access Matrix (Section 5.5) with permission aggregation rules.

### 5.4. Enhanced Item Interface Design

#### **Multi-Level Information Architecture**
The item interface implements a three-tier information display system:

1. **Main Item Row**: Basic item details (name, quantity, unit, status)
2. **Detailed Pricing Panel**: Compact single-row pricing breakdown (role-based visibility)
3. **Comment & Inventory Row**: Additional fields with enhanced layout
4. **Expanded Item View**: Full detailed view (when chevron clicked)

#### **Detailed Pricing Panel** (Compact Single Row)
*   **Layout**: 6-column responsive grid with smaller fonts for space efficiency
*   **Visibility**: Hidden for requestors, always visible for approvers/purchasers
*   **Fields Included**: 
    - Vendor (editable by approvers/purchasers)
    - Price per Unit (hidden for requestors, editable by purchasers only)
    - Discount (editable by approvers/purchasers)
    - Net Amount (calculated: price × quantity - discount)
    - Tax (editable by approvers/purchasers)
    - Total (final amount without base currency conversion)
*   **Design**: Green background with compact 10px labels and 12px values

#### **Comment & Inventory Row** (8-Column Layout)
*   **Comment Field**: 4/8 columns with textarea for detailed notes
*   **On Hand Quantity**: 1/8 column showing current inventory with green background
*   **On Order Quantity**: 1/8 column showing pending deliveries with blue background
*   **Date Required**: 1/8 column with date picker functionality
*   **Delivery Point**: 1/8 column with dropdown selection from predefined locations

#### **Delivery Point Options**
Predefined dropdown options include:
- Main Kitchen, Storage Room, Receiving Dock
- Cold Storage, Dry Storage, Bar Storage
- Housekeeping, Maintenance, Front Office
- Spa, Gym, Pool Area, Restaurant
- Banquet Hall, Laundry, Other

### 5.5. UI Components Access Control

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

#### **Pricing Panel Visibility Logic**
*   **Main Table Price Column**: Controlled by "Show Prices" toggle for all roles
*   **Detailed Pricing Panel**: Role-based - hidden for requestors, visible for approvers/purchasers
*   **Expanded View Pricing**: Hidden for requestors, toggle-controlled for approvers/purchasers

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

#### **Enhanced Inventory Information Display:**
*   **Color-coded Tiles**: Visual indicators for On Hand, On Order, Reorder Level, Restock Level
*   **Location-based Stock**: Stock levels per storage location with visual indicators
*   **Average Usage Calculation**: Historical consumption data for demand forecasting
*   **Stock Alerts**: Visual warnings when requested quantities exceed available stock

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

#### **Enhanced Vendor Comparison Functionality:**
*   **Multi-vendor Pricing**: Side-by-side price comparison for Purchasing Staff only
*   **Comprehensive Vendor Data**: Displays vendor ID, name, ratings, and preference status
*   **Price List Analysis**: Shows price list numbers, names, validity periods, and pricing tiers
*   **Performance Metrics**: Historical delivery performance, lead times, and reliability scores
*   **Contract Terms**: Payment terms, minimum quantities, and order units comparison
*   **Cost Analysis**: Unit prices, total costs, and financial impact assessment
*   **Risk Assessment**: Vendor risk scoring and recommendation engine
*   **Role-Based Access**: Completely hidden from Requestor and Approver roles for confidentiality

#### **Vendor Comparison Interface Features:**
*   **Tabular Comparison View**: Side-by-side vendor comparison in organized table format
*   **Preferred Vendor Highlighting**: Visual indicators for preferred vendors
*   **Price Validity Tracking**: Clear display of price list validity periods
*   **Lead Time Analysis**: Comparison of delivery times across vendors
*   **Historical Performance**: Vendor ratings and past performance metrics
*   **Selection Assistance**: Intelligent recommendations based on price, quality, and reliability
*   **Export Functionality**: Ability to export comparison data for offline analysis

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

#### **Enhanced Financial Controls:**
*   **Multi-currency Support**: Real-time exchange rate integration
*   **Financial Information Masking**: Automatic hiding of pricing from Requestor roles
*   **Budget Validation**: Real-time budget checking with soft and hard limits
*   **Approval Thresholds**: Dynamic approval routing based on monetary amounts

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

#### **Real-time Communication:**
*   **Comment System**: Real-time chat-like communication on PR details
*   **Activity Logging**: Comprehensive audit trail with searchable history
*   **Attachment Management**: File upload and download with version control
*   **WebSocket Updates**: Live status updates without page refresh

## 9. Enhanced User Interface Business Logic

### 9.1. Two-Column Layout Management

#### **Sidebar State Control:**
*   **Toggle Persistence**: Sidebar state maintained across page refreshes
*   **Responsive Behavior**: Automatic collapse on mobile devices
*   **Content Priority**: Main content always accessible, sidebar supplementary
*   **Accessibility**: Keyboard navigation and screen reader support

#### **Content Organization:**
*   **Comments & Attachments**: Real-time communication hub
*   **Activity Log**: Searchable audit trail with user action history
*   **Dynamic Loading**: Lazy loading of sidebar content for performance
*   **Context Awareness**: Sidebar content updates based on main content changes

### 9.2. Role-Based UI Adaptation

#### **Dynamic Interface Rendering:**
*   **Field Visibility**: Real-time field hiding/showing based on user role
*   **Action Button Availability**: Context-sensitive action buttons
*   **Information Masking**: Financial data automatically hidden from unauthorized roles
*   **Navigation Control**: Menu items and tabs filtered by permissions

#### **Progressive Disclosure:**
*   **Expandable Panels**: Three-tier information architecture in Items tab
*   **Role-based Sections**: Different expanded views for different roles
*   **Bulk Operation Intelligence**: Smart handling of mixed-status item selections
*   **Workflow Context**: Interface adapts to current workflow stage

### 9.3. Enhanced Data Management

#### **Optimistic Updates:**
*   **Immediate Feedback**: UI updates before server confirmation
*   **Error Recovery**: Automatic rollback on operation failure
*   **Conflict Resolution**: Handling of concurrent edit scenarios
*   **State Synchronization**: Real-time state updates across browser tabs

#### **Performance Optimization:**
*   **Component Lazy Loading**: Heavy components loaded on demand
*   **Virtual Scrolling**: Efficient handling of large data sets
*   **Caching Strategy**: Smart caching of frequently accessed data
*   **Background Prefetching**: Predictive data loading for common actions

### 9.4. Enhanced ItemsTab Expandable Panel System

#### **Multi-Tier Information Architecture:**
The ItemsTab implements a sophisticated expandable panel system providing role-based access to detailed item information:

#### **Main Item Row Components:**
*   **Basic Information**: Item name, description, request quantity, approved quantity, status indicators
*   **Action Buttons**: Role-based action buttons (Approve, Reject, Review) with intelligent availability
*   **Status Indicators**: Color-coded status badges with clear visual hierarchy
*   **Expand/Collapse Control**: Chevron-based expansion for detailed views

#### **Expandable Panel Sections:**

**1. Business Dimensions Section (All Roles):**
*   **Job Number**: Project-specific job code assignment
*   **Events**: Event-related categorization and tracking
*   **Projects**: Project association and budget allocation
*   **Market Segments**: Business unit and market segment classification
*   **Edit Capability**: Universal edit button for all authorized roles

**2. Enhanced Inventory Information (All Roles):**
*   **Location-Based Stock Levels**: Real-time inventory by storage location
*   **Color-Coded Indicators**: Visual representation of stock status (adequate, low, critical)
*   **Reorder Alerts**: Automatic warnings when stock falls below reorder points
*   **Historical Usage**: Average monthly consumption patterns
*   **On-Order Quantities**: Pending deliveries and expected arrival dates

**3. Vendor Comparison Section (Purchaser Role Only):**
*   **Multi-Vendor Analysis**: Side-by-side comparison of available vendors
*   **Price Comparison Matrix**: Comprehensive pricing analysis across vendors
*   **Performance Metrics**: Vendor reliability, delivery time, and quality scores
*   **Contract Terms**: Payment terms, minimum quantities, and lead times
*   **Recommendation Engine**: Intelligent vendor selection guidance

**4. Financial Details Section (Manager/Purchaser Roles):**
*   **Detailed Pricing Breakdown**: Unit prices, discounts, taxes, and totals
*   **Currency Conversion**: Multi-currency support with real-time exchange rates
*   **Budget Impact**: Real-time budget consumption and availability
*   **Cost Center Allocation**: Department and project-specific cost assignments

#### **Role-Based Panel Visibility:**
*   **Requestor (Staff) Role**: Business dimensions and inventory information only
*   **Approver Roles**: All sections except vendor comparison
*   **Purchaser Role**: Full access to all expandable panel sections
*   **Progressive Disclosure**: Information revealed based on role permissions and workflow stage

#### **Enhanced User Experience Features:**
*   **Smooth Animations**: Fluid expand/collapse transitions for better usability
*   **Persistent State**: Panel expansion preferences saved per user session
*   **Keyboard Navigation**: Full keyboard accessibility for all panel interactions
*   **Mobile Responsive**: Optimized layout for mobile and tablet devices
*   **Loading States**: Intelligent loading indicators for data-heavy sections

## 10. Recent Implementation Enhancements (January 2025)

### 10.1. Workflow Decision Engine Implementation

#### **Technical Implementation:**
*   **Location**: `/services/workflow-decision-engine.ts`
*   **Status**: Fully implemented and integrated
*   **Features**: Priority-based workflow analysis, intelligent action determination, real-time status aggregation
*   **Integration**: Seamlessly integrated with ItemsTab and PR detail components

#### **Key Capabilities:**
*   **Dynamic Action Buttons**: Context-aware approval buttons with intelligent text and styling
*   **Status Aggregation**: Real-time analysis of item statuses for workflow decisions
*   **Role-Based Actions**: Intelligent action availability based on user role and workflow stage
*   **Validation Logic**: Comprehensive validation of workflow state changes

### 10.2. Enhanced Vendor Comparison System

#### **Implementation Status:**
*   **Components**: `vendor-comparison-view.tsx`, `vendor-comparison.tsx`
*   **Data Layer**: `item-vendor-data.ts` with comprehensive vendor database
*   **Integration**: Role-based access with purchasing staff exclusive access
*   **Currency Support**: Multi-currency pricing with USD standardization

#### **Business Features:**
*   **Comprehensive Vendor Database**: 30+ vendors with detailed pricing and performance data
*   **Price List Management**: Valid date ranges, minimum quantities, lead times
*   **Performance Metrics**: Vendor ratings, delivery performance, quality scores
*   **Risk Assessment**: Preferred vendor highlighting and recommendation engine

### 10.3. Role-Based Access Control Enhancements

#### **Advanced RBAC Features:**
*   **Multi-Role Support**: Users can have multiple organizational roles simultaneously
*   **Workflow Stage Roles**: Contextual roles per PR per workflow stage
*   **Dynamic Permission Calculation**: Real-time permission aggregation using intersection formulas
*   **Visibility Scope Management**: Granular control over PR visibility (Self, Department, Business Unit)
*   **Conflict Resolution**: Automatic prevention of segregation of duties violations

#### **Field-Level Security:**
*   **Financial Information Masking**: Automatic hiding of pricing information from Staff roles
*   **Vendor Information Protection**: Complete vendor details hidden from Requestor roles
*   **Progressive Disclosure**: Information revealed incrementally based on role and workflow stage
*   **"Show Prices" Toggle**: User-controlled visibility of total amounts

### 10.4. Enhanced User Interface Components

#### **ItemsTab Expandable Panels:**
*   **Implementation Status**: Ready for deployment
*   **JSX Structure**: Requires malformed JSX structure fixes
*   **Role-Based Sections**: Business dimensions, inventory info, vendor comparison, financial details
*   **Responsive Design**: Mobile-optimized with smooth animations

#### **Technical Requirements:**
*   **RBAC Integration**: Complete integration with field-permission utilities
*   **Performance Optimization**: Lazy loading and efficient state management
*   **Accessibility**: Full keyboard navigation and screen reader support
*   **Mobile Responsiveness**: Touch-optimized interface for mobile devices

### 10.5. Current Development Status

#### **Completed Features:**
- ✅ Workflow Decision Engine
- ✅ Vendor Comparison System  
- ✅ Multi-Role RBAC Framework
- ✅ Financial Information Masking
- ✅ Enhanced Inventory Integration

#### **In Progress:**
- 🔄 ItemsTab Expandable Panel Implementation
- 🔄 Enhanced UI/UX Improvements
- 🔄 Mobile Responsiveness Enhancements

#### **Pending Implementation:**
- ⏳ Complete ItemsTab JSX structure fixes
- ⏳ Full deployment of expandable panel system
- ⏳ Advanced reporting and analytics integration
- ⏳ Mobile app synchronization

### 10.6. Integration with Existing Systems

#### **Maintained Compatibility:**
*   **Existing Workflows**: All existing PR workflows remain functional
*   **Legacy Data**: Full backward compatibility with existing PR data
*   **API Consistency**: Enhanced APIs maintain backward compatibility
*   **User Experience**: Gradual rollout ensures minimal disruption

#### **Future Roadmap:**
*   **Advanced Analytics**: Integration with business intelligence systems
*   **Mobile Application**: Native mobile app for approvals and reviews
*   **AI-Powered Insights**: Machine learning for vendor recommendations and demand forecasting
*   **Advanced Reporting**: Enhanced financial and operational reporting capabilities
