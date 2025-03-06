# Purchase Request Module - Site Map

## 1. Navigation Structure

```
/procurement/purchase-requests/
├── /                                # PR List View (Main Landing Page)
├── /new                            # Create New PR
└── /[id]/                          # PR Detail View
    └── /edit                       # Edit PR
```

## 2. Page Components Hierarchy

### 2.1. PR List Page (`/procurement/purchase-requests/`)
```
PurchaseRequestList
├── Header
│   ├── Page Title: "Purchase Requests"
│   └── Action Buttons
│       ├── "+ New Request" Button
│       ├── Import Button
│       └── Export Button
├── Filter Panel
│   ├── Search Input
│   ├── Status Filter
│   ├── Date Range Picker
│   ├── Department Dropdown
│   └── Advanced Filters Button
└── DataGrid
    ├── Column Headers
    │   ├── PR Number (sortable)
    │   ├── Date (sortable)
    │   ├── Requestor
    │   ├── Department
    │   ├── Total Amount (sortable) 
    │   ├── Status (with badge)
    │   └── Actions
    └── Row Actions
        ├── View
        ├── Edit
        ├── Delete
        └── Download
```

### 2.2. PR Creation Page (`/procurement/purchase-requests/new`)
```
PRCreationWizard
├── Header
│   ├── Page Title: "Create Purchase Request"
│   └── Action Buttons
│       ├── Save as Draft
│       ├── Submit
│       └── Cancel
├── Step Indicator
│   ├── Step 1: Basic Information
│   ├── Step 2: Items
│   └── Step 3: Review & Submit
├── Basic Information Form (Step 1)
│   ├── Department Dropdown
│   ├── PR Type Dropdown
│   ├── Currency Dropdown
│   ├── Due Date Picker
│   └── Description Text Area
├── Items Management (Step 2)
│   ├── Action Buttons
│   │   ├── Add Item Button
│   │   ├── Import Button
│   │   └── Use Template Button
│   └── Items DataGrid
│       ├── Product Name
│       ├── Quantity
│       ├── Unit
│       ├── Price
│       ├── Total
│       └── Actions
└── Review & Submit (Step 3)
    ├── PR Summary
    │   ├── Basic Information Summary
    │   ├── Items Summary
    │   └── Financial Summary
    ├── Validation Messages
    └── Submit/Save Buttons
```

### 2.3. PR Detail Page (`/procurement/purchase-requests/[id]`)
```
PRDetailPage
├── Header
│   ├── Page Title: "Purchase Request {PR Number}"
│   ├── Status Badge
│   └── Action Buttons
│       ├── Edit (if appropriate)
│       ├── Delete (if appropriate)
│       ├── Print
│       ├── Export
│       └── Workflow Actions (Approve/Reject/Send Back)
├── General Information Section
│   ├── PR Reference Number
│   ├── Created Date
│   ├── Requestor
│   ├── Department
│   ├── PR Type
│   ├── Description
│   └── Expected Delivery Date
├── TabGroup
│   ├── TabTriggers
│   │   ├── Items
│   │   ├── Budget
│   │   ├── Workflow
│   │   ├── Attachments
│   │   └── Activity
│   └── TabContent
│       ├── ItemsTab
│       │   ├── Action Buttons
│       │   │   ├── Add Item (if editable)
│       │   │   ├── Bulk Actions
│       │   │   └── Filter/Search
│       │   └── Items DataGrid
│       │       ├── Selection Checkbox
│       │       ├── Item Name
│       │       ├── Description
│       │       ├── Quantity
│       │       ├── Unit
│       │       ├── Price
│       │       ├── Total
│       │       ├── Status Badge
│       │       └── Actions
│       ├── BudgetTab
│       │   ├── Budget Allocation Summary
│       │   ├── Budget Usage Chart
│       │   └── Budget Lines DataGrid
│       ├── WorkflowTab
│       │   ├── Current Status
│       │   ├── Next Approvers
│       │   └── Workflow History Timeline
│       ├── AttachmentsTab
│       │   ├── Upload Button
│       │   └── Attachments List
│       └── ActivityTab
│           └── Activity Timeline
└── Transaction Summary
    ├── Subtotal
    ├── Discount
    ├── Tax
    └── Total
```

### 2.4. PR Edit Page (`/procurement/purchase-requests/[id]/edit`)
```
PREditPage
├── Similar structure to PRDetailPage
└── With editable forms and fields
```

## 3. Dialogs and Modal Components

### 3.1. Item Details Dialog
```
ItemDetailsEditForm
├── Dialog Header
│   ├── Title: "Item Details"
│   └── Close Button
├── Tabbed Content
│   ├── Basic Information Tab
│   │   ├── Item Name
│   │   ├── Description
│   │   ├── Category/Subcategory
│   │   └── Item Status
│   ├── Quantity & Delivery Tab
│   │   ├── Unit Input
│   │   ├── Quantity Requested
│   │   ├── Quantity Approved
│   │   ├── Delivery Date
│   │   ├── Delivery Point
│   │   └── Contextual Action Buttons
│   │       ├── "On Hand" Button → Inventory Breakdown Dialog
│   │       └── "On Order" Button → Pending Purchase Orders Dialog
│   └── Pricing Tab
│       ├── Vendor Selection
│       ├── "Compare Vendors" Button → Vendor Comparison Dialog
│       ├── Price Input
│       ├── Currency Dropdown
│       ├── Discount Settings
│       ├── Tax Settings
│       └── Pricing Summary
└── Action Footer
    ├── Save Button
    ├── Cancel Button
    └── Delete Button (if applicable)
```

### 3.2. Inventory Breakdown Dialog
```
InventoryBreakdown
├── Dialog Header
│   ├── Title: "On Hand by Location"
│   └── Close Button
├── Item Details Summary
│   ├── Item Name
│   ├── Description
│   └── Status Badge
└── Inventory Table
    ├── Location
    ├── Quantity On Hand
    ├── Inventory Units
    ├── Par
    ├── Reorder Point
    ├── Min Stock
    └── Max Stock
```

### 3.3. Pending Purchase Orders Dialog
```
PendingPurchaseOrdersComponent
├── Dialog Header
│   ├── Title: "Pending Purchase Order"
│   └── Close Button
├── Item Details Summary
│   ├── Item Name
│   ├── Description
│   ├── Requested Quantity
│   └── Approved Quantity
├── Purchase Orders Table
│   ├── PO Number
│   ├── Vendor
│   ├── Delivery Date
│   ├── Remaining Quantity
│   ├── Inventory Units
│   └── Locations Ordered
└── Summary Footer
    └── Total on Order
```

### 3.4. Vendor Comparison Dialog
```
VendorComparison
├── Dialog Header
│   ├── Title: "Vendor Comparison"
│   └── Close Button
├── Search and Filter
│   ├── Search Input
│   └── Filter Dropdowns
├── Vendors Table
│   ├── Selection Radio Button
│   ├── Vendor Name
│   ├── Rating
│   ├── Lead Time
│   ├── Minimum Order
│   ├── Unit Price
│   └── Price List Number
├── Price History Chart (if available)
└── Action Footer
    ├── Select Vendor Button
    ├── Add New Vendor Button
    └── Cancel Button
```

### 3.5. Workflow Action Dialogs

#### 3.5.1. Approve Dialog
```
ApprovalDialog
├── Dialog Header
│   ├── Title: "Approve Purchase Request"
│   └── Close Button
├── PR Summary
│   ├── PR Number
│   ├── Requestor
│   └── Total Amount
├── Comments Text Area
└── Action Footer
    ├── Approve Button
    └── Cancel Button
```

#### 3.5.2. Reject Dialog
```
RejectDialog
├── Dialog Header
│   ├── Title: "Reject Purchase Request"
│   └── Close Button
├── PR Summary
├── Reason for Rejection (Required)
└── Action Footer
    ├── Reject Button
    └── Cancel Button
```

#### 3.5.3. Send Back Dialog
```
SendBackDialog
├── Dialog Header
│   ├── Title: "Send Back Purchase Request"
│   └── Close Button
├── PR Summary
├── Comments/Instructions (Required)
└── Action Footer
    ├── Send Back Button
    └── Cancel Button
```

### 3.6. Attachment Management Dialog
```
AttachmentUploadDialog
├── Dialog Header
│   ├── Title: "Upload Attachment"
│   └── Close Button
├── File Upload Area
│   ├── Drag & Drop Zone
│   └── Browse Button
├── File Details Form
│   ├── Description Input
│   ├── Category Dropdown
│   └── Tags Input
└── Action Footer
    ├── Upload Button
    └── Cancel Button
```

### 3.7. Budget Allocation Dialog
```
BudgetAllocationDialog
├── Dialog Header
│   ├── Title: "Budget Allocation"
│   └── Close Button
├── Total Amount to Allocate
├── Budget Lines Form
│   ├── Budget Code Dropdown
│   ├── Amount Input
│   └── Add Another Line Button
├── Allocation Summary
│   ├── Allocated Amount
│   ├── Unallocated Amount
│   └── Validation Indicators
└── Action Footer
    ├── Save Button
    └── Cancel Button
```

## 4. User Flow Diagrams

### 4.1. PR Creation Flow
```
Start
  ↓
PR List Page
  ↓
Click "+ New Request"
  ↓
PR Creation Page
  ↓
Complete Basic Information
  ↓
Next → Items Management
  ↓
Add Items
  ↓  ↘
  |   Open Item Details Dialog → Configure Item Details
  |                             ↘ Check Inventory → Open Inventory Breakdown Dialog
  |                             ↘ Check On Order → Open Pending POs Dialog 
  |                             ↘ Compare Vendors → Open Vendor Comparison Dialog
  ↓  ↙
Review & Submit
  ↓
Submit PR
  ↓
PR Detail Page
  ↓
End
```

### 4.2. PR Approval Flow
```
Start
  ↓
Approver Dashboard/Notification
  ↓
Open PR Detail Page
  ↓
Review PR Details
  ↓
Review Items Tab
  ↓  ↘
  |   Open Item Details Dialog → Review Item Details
  |                             ↘ Check Inventory → Open Inventory Breakdown Dialog
  |                             ↘ Check On Order → Open Pending POs Dialog
  ↓  ↙
Review Budget Tab
  ↓
Review Attachments Tab
  ↓
Make Decision
  ↓
  ├── Approve → Open Approve Dialog → Submit Approval
  ├── Reject → Open Reject Dialog → Submit Rejection
  └── Send Back → Open Send Back Dialog → Submit Feedback
  ↓
PR Updated
  ↓
End
```

## 5. Component Relationships

### 5.1. Purchase Request Object Relationship
```
PurchaseRequest
  ├── has many → PurchaseRequestItems
  │                ├── has one → Vendor
  │                ├── has one → Product
  │                └── has many → BudgetAllocations
  ├── has many → Attachments
  ├── has many → Comments
  ├── has many → ActivityLogs
  ├── has one → Workflow
  │               └── has many → WorkflowStages
  ├── has one → Requestor (User)
  └── has one → Department
```

## 6. Mobile Responsive Considerations

For mobile devices, the site map adapts with:

- Responsive scaling of all components
- Collapsed navigation menu via hamburger icon
- Simplified data tables with horizontal scrolling
- Accordion patterns for detailed information
- Full-screen modals for all dialogs
- Steppers for multi-part forms
- Touch-friendly input controls

This mobile adaptation ensures the PR module remains fully functional on tablets and smartphones. 