# Purchase Request RBAC Implementation Summary

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document summarizes the implementation of Role-Based Access Control (RBAC) for the Purchase Request module, focusing on the PR details page and item actions.

## 1. RBAC Service Implementation

Created a new service to centralize RBAC logic:

```typescript
// app/(main)/procurement/purchase-requests/services/rbac-service.ts
export class PRRBACService {
  // Get user's role configuration
  static getRoleConfiguration(userRole: string): RoleConfiguration { ... }

  // Check if user can perform specific action on PR
  static canPerformAction(user: User, pr: any, action: WorkflowAction): boolean { ... }

  // Check if user can approve at current workflow stage
  static canApproveAtCurrentStage(user: User, pr: any): boolean { ... }

  // Get available workflow actions for user and PR
  static getAvailableActions(user: User, pr: any): WorkflowAction[] { ... }

  // Get workflow action button configuration
  static getWorkflowActionButtons(user: User, pr: any) { ... }

  // Validate item-level action permissions
  static canPerformItemAction(user: User, item: any, action: 'approve' | 'reject' | 'review'): boolean { ... }

  // Get available item actions for user and item
  static getAvailableItemActions(user: User, item: any) { ... }
}
```

## 2. PR Detail Page Updates

### 2.1. RBAC State and Effect

Added RBAC state and effect to dynamically update available actions:

```typescript
// RBAC state
const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
const { user } = useUser(); // Get current user from context

// Update available actions when user or formData changes
useEffect(() => {
  if (user && formData) {
    const actions = PRRBACService.getAvailableActions(user, formData);
    setAvailableActions(actions);
  }
}, [user, formData]);
```

### 2.2. RBAC-Controlled Workflow Action Handlers

Added handlers for workflow actions with RBAC validation:

```typescript
// RBAC-controlled workflow action handlers
const handleWorkflowAction = (action: WorkflowAction) => {
  if (!user || !PRRBACService.canPerformAction(user, formData, action)) {
    console.warn(`User ${user?.name} cannot perform action: ${action}`);
    return;
  }

  switch (action) {
    case 'approve':
      handleApprove();
      break;
    case 'reject':
      handleReject();
      break;
    // Other actions...
  }
};
```

### 2.3. Dynamic Action Buttons

Added RBAC-controlled action buttons to the PR header:

```tsx
{/* RBAC-controlled workflow actions */}
{user && availableActions.length > 0 && (
  <>
    <div className="w-px h-6 bg-border mx-2 hidden md:block" />
    <div className="flex items-center gap-2">
      {PRRBACService.getWorkflowActionButtons(user, formData).map((actionBtn) => (
        <Button 
          key={actionBtn.action}
          onClick={() => handleWorkflowAction(actionBtn.action as WorkflowAction)} 
          variant={actionBtn.variant} 
          size="sm"
          className="h-9"
          title={actionBtn.description}
        >
          <IconComponent className="mr-2 h-4 w-4" />
          {actionBtn.label}
        </Button>
      ))}
    </div>
  </>
)}
```

## 3. PR Header Component Updates

### 3.1. Updated Interface

Added support for RBAC-controlled workflow actions:

```typescript
interface WorkflowActionButton {
  action: string;
  label: string;
  icon: string;
  variant: 'default' | 'destructive' | 'outline';
  description: string;
}

interface PRHeaderProps {
  // Existing props...
  workflowActions?: WorkflowActionButton[]
  onWorkflowAction?: (action: string) => void
}
```

### 3.2. Dynamic Icon Component

Added helper to dynamically render icons:

```typescript
const getIconComponent = (iconName: string) => {
  const icons = {
    CheckCircle,
    XCircle,
    RotateCcw,
    Edit,
    Trash2,
    Send
  };
  return icons[iconName as keyof typeof icons] || Edit;
};
```

### 3.3. Workflow Action Buttons

Added dynamic rendering of workflow action buttons:

```tsx
{/* Workflow Actions (RBAC-controlled) */}
{workflowActions.map((actionBtn) => {
  const IconComponent = getIconComponent(actionBtn.icon);
  return (
    <Button 
      key={actionBtn.action}
      onClick={() => onWorkflowAction?.(actionBtn.action)} 
      variant={actionBtn.variant} 
      size="sm"
      title={actionBtn.description}
    >
      <IconComponent className="mr-2 h-4 w-4" />
      {actionBtn.label}
    </Button>
  );
})}
```

## 4. Item Action Updates

### 4.1. Enhanced Order Card Updates

Updated to use RBAC service for item actions:

```typescript
import { PRRBACService } from "../../services/rbac-service"

// ...

const getAvailableActions = useMemo(() => {
  // Use the RBAC service to get available item actions based on user role and item status
  return PRRBACService.getAvailableItemActions(currentUser, {
    status: order.status,
    // Add other properties needed for RBAC checks
  });
}, [currentUser, order.status])
```

### 4.2. Item Action Standardization

Fixed inconsistent action labels and status handling:

- Changed "Accepted" to "Approved" for consistency
- Standardized action labels to "Approve", "Reject", "Review"
- Ensured consistent status handling across components

## 5. Key RBAC Rules Implemented

### 5.1. PR-Level Actions

| Role | Available Actions | Conditions |
|------|-------------------|------------|
| **Requester** | Edit, Delete, Submit | Own PRs, Draft/Rejected status |
| **Department Manager** | Approve, Reject, Send Back | PRs in Department Approval stage |
| **Finance Manager** | Approve, Reject, Send Back | PRs in Finance Review stage |
| **Purchasing Staff** | Approve, Reject, Send Back | PRs in Purchasing Review stage |
| **General Manager** | Approve, Reject, Send Back | PRs in Final Approval stage |
| **Admin** | All actions | All PRs |

### 5.2. Item-Level Actions

| Role | Available Actions | Item Status |
|------|-------------------|-------------|
| **Department Manager** | Approve, Reject, Review | Pending, Review |
| **Purchasing Staff** | Approve, Reject, Review | Approved, Review |
| **Requester** | Review | Pending |
| **Admin** | All actions | All statuses |

## 6. Next Steps

1. **Testing**: Test all RBAC rules across different user roles
2. **Error Handling**: Add better error messages for permission denied cases
3. **UI Feedback**: Improve visual feedback for unavailable actions
4. **Documentation**: Update user documentation with role-specific capabilities
5. **Audit Logging**: Add audit logging for all permission checks and actions

The implementation now properly enforces RBAC at both the PR level and item level, with consistent action labels and status handling throughout the system.