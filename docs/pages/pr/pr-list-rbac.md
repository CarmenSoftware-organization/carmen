# Purchase Request List Page: Role-Based Access Control (RBAC)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document outlines the Role-Based Access Control (RBAC) specifications for the Purchase Request List page, defining what users can see and do based on their roles and permissions.

## 1. User Roles Definition

### 1.1. Primary Roles

- **Requester**: Users who can create and submit purchase requests
- **Department Manager**: Users who approve PRs within their department
- **Finance Manager**: Users who handle financial approval of PRs
- **Purchasing Manager**: Users who manage the procurement process
- **System Administrator**: Users with full system access
- **Viewer**: Users with read-only access to specific PRs

### 1.2. Role Hierarchy

```
System Administrator (Full Access)
    ├── Purchasing Manager (All PRs + Procurement Actions)
    ├── Finance Manager (Financial Approval + View All)
    ├── Department Manager (Department PRs + Approval)
    ├── Requester (Own PRs + Create)
    └── Viewer (Read-only Access)
```

## 2. Data Visibility Rules

### 2.1. PR Visibility Matrix

| Role | Visible PRs | Filter Scope |
|------|-------------|--------------|
| **Requester** | Own PRs only | PRs where user is the requestor |
| **Department Manager** | Department PRs + Own PRs | PRs from their department + PRs pending their approval |
| **Finance Manager** | All PRs requiring financial approval + Own PRs | PRs above financial threshold + Own PRs |
| **Purchasing Manager** | All approved PRs + Own PRs | All PRs in purchasing workflow + Own PRs |
| **System Administrator** | All PRs | No restrictions |
| **Viewer** | Assigned PRs only | PRs explicitly shared with them |

### 2.2. Default View by Role (Based on Workflow Configuration)

| Role | Default View | Default Filters | Based On |
|------|--------------|-----------------|----------|
| **Requester** | "My PRs" | Status: All, Requestor: Current User | Widget Access: myPR |
| **Department Head** | "My Approvals" | Workflow Stage: Department Approval, Status: Submitted/In Progress | Assigned to "Department Approval" stage |
| **Finance Manager** | "My Approvals" | Workflow Stage: Finance Review, Status: Submitted/In Progress | Assigned to "Finance Review" stage |
| **Purchasing Staff** | "My Approvals" | Workflow Stage: Purchasing Review, Status: Submitted/In Progress | Assigned to "Purchasing Review" stage |
| **General Manager** | "My Approvals" | Workflow Stage: Final Approval, Status: Submitted/In Progress | Assigned to "Final Approval" stage |
| **System Administrator** | "All Requests" | No default filters | Full access override |

## 3. Widget Access Permissions (RBAC-Controlled)

### 3.1. Widget Access Matrix

| Role | myPR Widget | myApproval Widget | myOrder Widget | Configuration Source |
|------|-------------|-------------------|----------------|---------------------|
| **Requester** | Configurable | ❌ | ❌ | `roleConfig.widgetAccess.myPR` |
| **Department Head** | Configurable | Configurable | ❌ | `roleConfig.widgetAccess.*` |
| **Finance Manager** | Configurable | Configurable | ❌ | `roleConfig.widgetAccess.*` |
| **Purchasing Staff** | Configurable | Configurable | Configurable | `roleConfig.widgetAccess.*` |
| **General Manager** | Configurable | Configurable | ❌ | `roleConfig.widgetAccess.*` |
| **System Administrator** | ✅ | ✅ | ✅ | Full access override |

### 3.2. Widget-Specific Filter Logic

#### My PR Widget (`roleConfig.widgetAccess.myPR`)
```typescript
// When enabled, shows ALL PRs created by user (all statuses)
filter: `requestorId = ${currentUser.id}`
secondaryFilters: ['All Status', 'Draft', 'Submitted', 'In Progress', 'Approved', 'Rejected']
```

#### My Approvals Widget (`roleConfig.widgetAccess.myApproval`)
```typescript
// When enabled, shows PRs pending user's approval
filter: `currentWorkflowStage IN (${userAssignedStages}) AND status IN ('Submitted', 'In Progress')`
secondaryFilters: dynamicStageList // Based on user's assigned workflow stages
```

#### Ready for PO Widget (`roleConfig.widgetAccess.myOrder`)
```typescript
// When enabled, shows approved PRs ready for purchase order creation
filter: `status = 'Approved' AND currentWorkflowStage = 'Completed'`
secondaryFilters: ['All Approved', 'Pending PO', 'PO Created']
```

### 3.3. Page-Level Actions

| Action | Requester | Dept Manager | Finance Manager | Purchasing Manager | Admin | Viewer |
|--------|-----------|--------------|-----------------|-------------------|-------|--------|
| **View List** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create New PR** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Export All** | ❌ | ✅ (Dept only) | ✅ | ✅ | ✅ | ❌ |
| **Print All** | ❌ | ✅ (Dept only) | ✅ | ✅ | ✅ | ❌ |
| **Bulk Actions** | ✅ (Own PRs) | ✅ (Dept PRs) | ✅ (Financial) | ✅ (Procurement) | ✅ | ❌ |
| **Advanced Filters** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Save Filters** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 3.3. Individual PR Actions

| Action | Requester | Dept Manager | Finance Manager | Purchasing Manager | Admin | Viewer |
|--------|-----------|--------------|-----------------|-------------------|-------|--------|
| **View Details** | ✅ (Own) | ✅ (Dept) | ✅ (All) | ✅ (All) | ✅ | ✅ (Assigned) |
| **Edit** | ✅ (Own, Draft/Rejected) | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Delete** | ✅ (Own, Draft) | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Duplicate** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Submit** | ✅ (Own, Draft) | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Approve** | ❌ | ✅ (Dept, Pending) | ✅ (Financial) | ✅ (Final) | ✅ | ❌ |
| **Reject** | ❌ | ✅ (Dept, Pending) | ✅ (Financial) | ✅ (Procurement) | ✅ | ❌ |
| **Send Back** | ❌ | ✅ (Dept) | ✅ (Financial) | ✅ (Procurement) | ✅ | ❌ |

### 3.4. Bulk Actions Permissions

| Bulk Action | Requester | Dept Manager | Finance Manager | Purchasing Manager | Admin | Viewer |
|-------------|-----------|--------------|-----------------|-------------------|-------|--------|
| **Bulk Approve** | ❌ | ✅ (Dept PRs) | ✅ (Financial) | ✅ (Procurement) | ✅ | ❌ |
| **Bulk Reject** | ❌ | ✅ (Dept PRs) | ✅ (Financial) | ✅ (Procurement) | ✅ | ❌ |
| **Bulk Delete** | ✅ (Own, Draft) | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Bulk Export** | ✅ (Own) | ✅ (Dept) | ✅ (All) | ✅ (All) | ✅ | ❌ |
| **Bulk Status Change** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

## 4. Column Visibility Rules

### 4.1. Standard Columns (Visible to All)

- Ref Number
- Date
- Description
- Status
- Total Amount
- Currency

### 4.2. Role-Specific Columns

| Column | Requester | Dept Manager | Finance Manager | Purchasing Manager | Admin | Viewer |
|--------|-----------|--------------|-----------------|-------------------|-------|--------|
| **Requestor** | ❌ (Always self) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Department** | ❌ (Always own) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Workflow Stage** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Vendor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Budget Code** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Cost Center** | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Created By** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Last Modified** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 5. Filter Restrictions

### 5.1. Department Filter

| Role | Department Filter Options |
|------|---------------------------|
| **Requester** | Own department only (hidden/disabled) |
| **Department Manager** | Own department + subordinate departments |
| **Finance Manager** | All departments |
| **Purchasing Manager** | All departments |
| **System Administrator** | All departments |
| **Viewer** | Departments of assigned PRs only |

### 5.2. Requestor Filter

| Role | Requestor Filter Options |
|------|--------------------------|
| **Requester** | Self only (hidden/disabled) |
| **Department Manager** | Department members only |
| **Finance Manager** | All users |
| **Purchasing Manager** | All users |
| **System Administrator** | All users |
| **Viewer** | Requestors of assigned PRs only |

### 5.3. Status Filter

| Role | Restricted Statuses |
|------|---------------------|
| **Requester** | No restrictions |
| **Department Manager** | No restrictions |
| **Finance Manager** | No restrictions |
| **Purchasing Manager** | Cannot filter by "Draft" (not relevant) |
| **System Administrator** | No restrictions |
| **Viewer** | No restrictions |

## 6. Workflow-Based Permissions

### 6.1. Workflow Stage Assignment Rules

Permissions are dynamically determined based on workflow configuration:

```typescript
// Users assigned to specific workflow stages can:
// 1. View PRs at their assigned stage
// 2. Perform actions available at that stage
// 3. See PRs in their approval queue

const stagePermissions = {
  "Request Creation": {
    assignedRoles: ["Requester"],
    availableActions: ["Submit"],
    viewScope: "own"
  },
  "Department Approval": {
    assignedRoles: ["Department Head"],
    availableActions: ["Approve", "Reject", "Send Back"],
    viewScope: "department"
  },
  "Finance Review": {
    assignedRoles: ["Finance Manager"],
    availableActions: ["Approve", "Reject", "Send Back"],
    viewScope: "all"
  },
  "Purchasing Review": {
    assignedRoles: ["Purchasing Staff"],
    availableActions: ["Approve", "Reject", "Send Back"],
    viewScope: "all"
  },
  "Final Approval": {
    assignedRoles: ["General Manager"],
    availableActions: ["Approve", "Reject", "Send Back"],
    viewScope: "all"
  }
};
```

### 6.2. Approval Stage Permissions

| Workflow Stage | Who Can Approve | Who Can Reject | Who Can View | Assignment Method |
|----------------|-----------------|----------------|--------------|-------------------|
| **Department Approval** | Users assigned to stage | Users assigned to stage | Requestor, Assigned Users, Admin | Workflow Configuration |
| **Finance Review** | Users assigned to stage | Users assigned to stage | All above + Assigned Users | Workflow Configuration |
| **Purchasing Review** | Users assigned to stage | Users assigned to stage | All above + Assigned Users | Workflow Configuration |
| **Final Approval** | Users assigned to stage | Users assigned to stage | All roles | Workflow Configuration |

### 6.2. Status-Based Action Permissions

| PR Status | Edit | Delete | Submit | Approve | Reject |
|-----------|------|--------|--------|---------|--------|
| **Draft** | Requestor/Admin | Requestor/Admin | Requestor/Admin | ❌ | ❌ |
| **Submitted** | Admin only | Admin only | ❌ | Stage Approver | Stage Approver |
| **In Progress** | Admin only | Admin only | ❌ | Stage Approver | Stage Approver |
| **Approved** | Admin only | ❌ | ❌ | ❌ | Purchasing Manager |
| **Rejected** | Requestor/Admin | Requestor/Admin | Requestor/Admin | ❌ | ❌ |

## 7. Dynamic Permission Evaluation

### 7.1. Context-Sensitive Permissions

The system evaluates permissions dynamically based on:

- **User Role**: Primary role assignment
- **Department Hierarchy**: User's position in organizational structure
- **PR Ownership**: Whether user created the PR
- **Workflow Stage**: Current stage of PR approval
- **PR Status**: Current status of the PR
- **Business Rules**: Custom rules based on amount, category, etc.

### 7.2. Permission Evaluation Logic

```typescript
function canPerformAction(user: User, pr: PurchaseRequest, action: string): boolean {
  // Base role check
  if (!hasBasePermission(user.role, action)) return false;
  
  // Ownership check
  if (requiresOwnership(action) && pr.requestorId !== user.id && !isAdmin(user)) return false;
  
  // Department check
  if (requiresDepartmentAccess(action) && !hasAccessToDepartment(user, pr.department)) return false;
  
  // Workflow stage check
  if (isWorkflowAction(action) && !canApproveAtStage(user, pr.currentWorkflowStage)) return false;
  
  // Status check
  if (!isValidForStatus(action, pr.status)) return false;
  
  // Business rule check
  if (!passesBusinessRules(user, pr, action)) return false;
  
  return true;
}
```

## 8. UI Element Visibility Rules

### 8.1. Button Visibility

| UI Element | Visibility Rule |
|------------|-----------------|
| **New PR Button** | Visible if user can create PRs |
| **Edit Button** | Visible if user can edit specific PR |
| **Delete Button** | Visible if user can delete specific PR |
| **Approve Button** | Visible if user can approve at current stage |
| **Reject Button** | Visible if user can reject at current stage |
| **Bulk Actions** | Visible if user has bulk permissions |
| **Export Button** | Visible based on data access level |

### 8.2. Menu Item Visibility

| Menu Item | Visibility Rule |
|-----------|-----------------|
| **Duplicate** | Always visible for viewable PRs |
| **Print** | Visible for viewable PRs |
| **Share** | Visible if user has sharing permissions |
| **Archive** | Admin only |
| **Restore** | Admin only |

## 9. Error Handling for Permissions

### 9.1. Permission Denied Scenarios

| Scenario | User Experience |
|----------|-----------------|
| **Insufficient Role** | Button/action disabled with tooltip explanation |
| **Wrong Department** | Item not visible in list |
| **Wrong Workflow Stage** | Action button hidden or disabled |
| **Status Restriction** | Clear error message with guidance |

### 9.2. Error Messages

| Permission Error | Message |
|------------------|---------|
| **Cannot Edit** | "You don't have permission to edit this purchase request" |
| **Cannot Approve** | "This purchase request is not pending your approval" |
| **Cannot Delete** | "Only draft purchase requests can be deleted" |
| **Cannot View** | "You don't have access to this purchase request" |

## 10. Audit and Compliance

### 10.1. Permission Logging

All permission checks and actions are logged for audit purposes:

- User ID and role
- Action attempted
- PR ID and status
- Permission result (granted/denied)
- Timestamp
- IP address

### 10.2. Compliance Requirements

- **SOX Compliance**: Segregation of duties between requestor and approver
- **Financial Controls**: Amount-based approval thresholds
- **Department Controls**: Department-based access restrictions
- **Audit Trail**: Complete history of all permission-based actions