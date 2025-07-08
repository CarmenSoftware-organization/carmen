# Purchase Request: Role-Based Access Control (RBAC)

This document outlines the Role-Based Access Control (RBAC) for the Purchase Request (PR) module, categorizing permissions based on user roles and workflow stages.

## 1. Enhanced Role Definitions

### 1.1. Primary Roles

- **Staff/Requestor**: Can create, edit, and submit PRs. Can view their own PRs. Cannot see vendor or pricing information.
- **Department Manager**: Can approve/reject PRs at department level. Can view department PRs and financial information but cannot edit vendor/pricing fields.
- **Financial Manager**: Can approve/reject PRs at financial level. Has full visibility of financial data but limited editing permissions.
- **Purchasing Staff**: Can process approved PRs, manage vendors, and handle procurement operations. Has full access to vendor comparison and pricing management.
- **System Administrator**: Has complete access to all PRs and can perform any action across all modules.

### 1.2. Role Hierarchy and Inheritance

```typescript
interface RoleHierarchy {
  Staff: {
    inherits: [],
    restrictions: ['vendor_info', 'pricing_info', 'financial_summary']
  },
  DepartmentManager: {
    inherits: ['Staff'],
    additions: ['approve_department', 'view_financial_info']
  },
  FinancialManager: {
    inherits: ['DepartmentManager'],
    additions: ['approve_financial', 'budget_management']
  },
  PurchasingStaff: {
    inherits: ['FinancialManager'],
    additions: ['vendor_management', 'pricing_edit', 'vendor_comparison']
  },
  SystemAdministrator: {
    inherits: ['all'],
    restrictions: []
  }
}
```

### 1.3. Role-Based Widget Access

```typescript
interface RoleWidgetAccess {
  Staff: {
    myPending: true,
    allDocuments: false,
    readyForPO: false
  },
  DepartmentManager: {
    myPending: true,
    allDocuments: true,
    readyForPO: false
  },
  FinancialManager: {
    myPending: true,
    allDocuments: true,
    readyForPO: false
  },
  PurchasingStaff: {
    myPending: true,
    allDocuments: true,
    readyForPO: true
  }
}
```

## 2. Role-Based Permissions

These permissions are directly tied to a user's assigned role, regardless of the PR's current workflow status.

### 2.1. Action-Level Permissions

| Action | Staff/Requestor | Dept Manager | Financial Manager | Purchasing Staff | Admin |
| --- | --- | --- | --- | --- | --- |
| Create PR | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit PR | ✅ (own, draft/rejected) | ❌ | ❌ | ❌ | ✅ |
| Delete PR | ✅ (own, draft only) | ❌ | ❌ | ❌ | ✅ |
| Submit PR | ✅ (own) | ❌ | ❌ | ❌ | ✅ |
| View All PRs | ❌ | ❌ (dept only) | ✅ (scope based) | ✅ | ✅ |
| View Own PRs | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Financial Info | ❌ | ✅ | ✅ | ✅ | ✅ |
| Vendor Comparison | ❌ | ❌ | ❌ | ✅ | ✅ |

### 2.2. PR Header Field-Level Permissions

| Field | Staff/Requestor | Dept Manager | Financial Manager | Purchasing Staff | Admin |
| --- | --- | --- | --- | --- | --- |
| Reference Number | ✅ | ❌ | ❌ | ❌ | ✅ |
| Date | ✅ | ❌ | ❌ | ❌ | ✅ |
| Type | ✅ | ❌ | ❌ | ❌ | ✅ |
| Requestor | ✅ | ❌ | ❌ | ❌ | ✅ |
| Department | ✅ | ❌ | ❌ | ❌ | ✅ |
| Description | ✅ | ❌ | ❌ | ❌ | ✅ |

### 2.3. PR Item Field-Level Permissions

These permissions apply to individual fields within PR items and control both visibility and editability.

| Field | Staff/Requestor | Dept Manager | Financial Manager | Purchasing Staff | Admin |
| --- | --- | --- | --- | --- | --- |
| Location | ✅ Edit | ❌ View | ❌ View | ❌ View | ✅ Edit |
| Product | ✅ Edit | ❌ View | ❌ View | ❌ View | ✅ Edit |
| Comment | ✅ Edit | ✅ Edit | ✅ Edit | ✅ Edit | ✅ Edit |
| Request Qty | ✅ Edit | ❌ View | ❌ View | ❌ View | ✅ Edit |
| Request Unit | ✅ Edit | ❌ View | ❌ View | ❌ View | ✅ Edit |
| Required Date | ✅ Edit | ❌ View | ❌ View | ❌ View | ✅ Edit |
| Approved Qty | ❌ Hidden | ✅ Edit | ✅ Edit | ✅ Edit | ✅ Edit |
| Vendor | ❌ Hidden | ❌ View | ❌ View | ✅ Edit | ✅ Edit |
| Price | ❌ Hidden | ❌ View | ❌ View | ✅ Edit | ✅ Edit |
| Order Unit | ❌ Hidden | ❌ View | ❌ View | ✅ Edit | ✅ Edit |
| Business Dimensions | ✅ Edit | ✅ Edit | ✅ Edit | ❌ View | ✅ Edit |

### 2.4. Financial Information Visibility

#### **Transaction Summary Access:**
- **Hidden from**: Staff/Requestor roles (complete section not displayed)
- **Visible to**: Department Manager, Financial Manager, Purchasing Staff, Admin
- **Content**: Subtotals, discounts, taxes, net amounts, total amounts, currency information

#### **Pricing Information Access:**
- **Hidden from**: Staff/Requestor roles (vendor names, prices, totals)
- **View Only**: Department Manager, Financial Manager
- **Edit Access**: Purchasing Staff, Admin

#### **Vendor Information Access:**
- **Hidden from**: Staff/Requestor roles (vendor names, comparison tools)
- **View Only**: Department Manager, Financial Manager  
- **Full Access**: Purchasing Staff (includes vendor comparison functionality), Admin

## 3. Workflow-Based Permissions

These permissions are dependent on the PR's current workflow stage and apply to actions that move the PR through its lifecycle.

### 3.1. PR Item Action-Level Permissions

| Action | Role | Item Status | Allowed |
| --- | --- | --- | --- |
| **Approve PR** | Approver | Any | ✅ |
| | Admin | Any | ✅ |
| **Reject PR** | Approver | Any | ✅ |
| | Admin | Any | ✅ |
| **Send Back PR** | Approver | Any | ✅ |
| | Admin | Any | ✅ |
| **Edit Item** | Requester | `Pending` | ✅ |
| | Requester | `Rejected` | ✅ |
| | Approver | `Pending` | ❌ |
| | Purchasing | `Approved` | ✅ |
| | Admin | Any | ✅ |
| **Delete Item** | Requester | `Pending` | ✅ |
| | Admin | Any | ✅ |
| **Approve Item** | Approver | `Pending` | ✅ |
| | Admin | Any | ✅ |
| **Reject Item** | Approver | `Pending` | ✅ |
| | Admin | Any | ✅ |
| **Send Back Item** | Approver | `Pending` | ✅ |
| | Admin | Any | ✅ |

## 4. Enhanced UI and Workflow RBAC

### 4.1. Sidebar and Comments Access Control

#### **Comments & Attachments Section:**
- **Access**: All roles can view and add comments
- **Avatar Display**: User profile pictures with role-based styling
- **Real-time Updates**: Live comment synchronization across all users
- **File Attachments**: Upload/download permissions based on role

#### **Activity Log Section:**
- **Visibility**: All roles can view complete activity history
- **Search Functionality**: Full-text search across all activity entries
- **Audit Trail**: Immutable log of all user actions and system events
- **Role Attribution**: Clear identification of user roles in activity entries

### 4.2. Enhanced ItemsTab RBAC

#### **Three-Tier Information Architecture:**
1. **Compact Row (Always Visible)**: Basic item information accessible to all roles
2. **Essential Details Row**: Location, quantity, dates - role-filtered display
3. **Expandable Panel**: Role-specific sections with dynamic content

#### **Expandable Panel Sections by Role:**

**Staff/Requestor View:**
```typescript
interface StaffExpandedView {
  visibleSections: [
    'inventoryInfo',      // Color-coded stock tiles
    'businessDimensions'  // Job, Events, Projects, Market Segments
  ];
  hiddenSections: [
    'vendorPricing',      // Completely hidden
    'taxDiscountOverrides' // Not applicable
  ];
  editableSections: ['businessDimensions'];
}
```

**Department Manager View:**
```typescript
interface DeptManagerExpandedView {
  visibleSections: [
    'inventoryInfo',
    'businessDimensions',
    'vendorPricing'       // View-only pricing information
  ];
  hiddenSections: [
    'taxDiscountOverrides' // Only for Purchasing Staff
  ];
  editableSections: ['businessDimensions', 'approvedQuantity'];
}
```

**Purchasing Staff View:**
```typescript
interface PurchasingExpandedView {
  visibleSections: [
    'inventoryInfo',
    'businessDimensions',
    'vendorPricing',      // Full edit access
    'taxDiscountOverrides' // Full access to overrides
  ];
  hiddenSections: [];      // No hidden sections
  editableSections: ['vendorPricing', 'taxDiscountOverrides'];
  specialFeatures: ['vendorComparison'];
}
```

### 4.3. Bulk Operations RBAC

#### **Enhanced Bulk Action Intelligence:**
- **Mixed Status Analysis**: System analyzes selected items and provides role-appropriate options
- **Scope Selection**: Choose to process applicable items only or handle all with appropriate status changes
- **Return Workflow**: Multi-step return process with target stage selection for approvers
- **Smart Notifications**: Automated notifications to affected users based on bulk operations

#### **Role-Based Bulk Actions:**
```typescript
interface BulkActionPermissions {
  Staff: ['select', 'export'];
  DepartmentManager: ['select', 'approve', 'reject', 'return', 'export'];
  FinancialManager: ['select', 'approve', 'reject', 'return', 'export'];
  PurchasingStaff: ['select', 'approve', 'reject', 'return', 'export', 'assignVendor'];
  Admin: ['all'];
}
```

### 4.4. Financial Information Masking

#### **Transaction Summary RBAC:**
```typescript
const TransactionSummaryAccess = {
  renderCondition: (userRole: string) => {
    return canViewFinancialInfo(userRole);
  },
  restrictedRoles: ['Staff', 'Requestor'],
  visibleToRoles: ['Department Manager', 'Financial Manager', 'Purchasing Staff', 'Admin']
};
```

#### **Dynamic Field Rendering:**
```typescript
const FieldAccess = {
  vendor: {
    Staff: 'hidden',
    DepartmentManager: 'readonly',
    PurchasingStaff: 'editable'
  },
  pricing: {
    Staff: 'hidden',
    DepartmentManager: 'readonly',
    PurchasingStaff: 'editable'
  },
  businessDimensions: {
    Staff: 'editable',
    DepartmentManager: 'editable',
    PurchasingStaff: 'readonly'
  }
};
```

### 4.5. Navigation and Menu RBAC

#### **Widget Toggle Access:**
- **Dynamic Generation**: Widget toggles generated based on `roleConfig.widgetAccess`
- **Default Selection**: Role-appropriate default widget selected automatically
- **Secondary Filters**: Filter options change based on selected widget and user role

#### **Floating Action Menu:**
```typescript
interface FloatingActionsByRole {
  Staff: ['delete', 'submit'];
  DepartmentManager: ['reject', 'sendBack', 'approve'];
  FinancialManager: ['reject', 'sendBack', 'approve'];
  PurchasingStaff: ['sendBack', 'submit'];
}
```

### 4.6. Real-time Update RBAC

#### **Live Synchronization Rules:**
- **Status Changes**: All users receive real-time status updates for PRs they can access
- **Comment Updates**: Live comment synchronization for all users viewing the same PR
- **Activity Log**: Real-time activity logging visible to all users with access to the PR
- **Role-based Filtering**: Updates filtered based on user's permission to view specific information