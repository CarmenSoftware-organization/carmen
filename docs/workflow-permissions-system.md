# Workflow-Based Permissions System

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

The Workflow-Based Permissions System replaces the previous hardcoded role-based permissions with a flexible, workflow-stage-based approach. This system allows users to have different permissions based on their assignments to specific workflow stages, providing more granular and contextual access control.

## Architecture

### Core Components

#### 1. Workflow Context (`lib/context/workflow-context.tsx`)
- **Purpose**: Provides workflow state and permissions throughout the application
- **Key Features**:
  - Tracks current workflow for PR processing
  - Manages user's assigned workflow stages
  - Calculates permissions based on stage assignments
  - Provides real-time permission updates

#### 2. Workflow Permissions Service (`lib/services/workflow-permissions.ts`)
- **Purpose**: Contains the business logic for calculating permissions
- **Key Functions**:
  - `getWorkflowFieldPermissions()`: Returns field-level permissions based on workflow roles
  - `canViewWorkflowFinancialInfo()`: Determines if user can see financial information
  - `canEditWorkflowField()`: Checks edit permissions for specific fields
  - `getPrimaryWorkflowRole()`: Gets user's highest priority role
  - `getWorkflowRoleDisplayName()`: Converts role types to display names

#### 3. Workflow Stage Configuration
- **Types**: Enhanced `Stage` interface with `roleType` field
- **Data**: Updated workflow mock data with role assignments
- **Role Types**: Four standardized workflow roles

## Workflow Role Types

### 1. Requester (`requester`)
- **Purpose**: Users who create and submit purchase requests
- **Permissions**:
  - Can edit basic request fields (location, product, quantities, dates)
  - Can edit PR header information (ref number, type, description)
  - Cannot view financial information (pricing, totals)
  - Cannot approve or modify vendor information

### 2. Purchaser (`purchaser`)
- **Purpose**: Purchasing staff who handle vendor management and pricing
- **Permissions**:
  - Can edit vendor information and pricing
  - Can view and edit all financial information
  - Can add comments and modify approved quantities
  - Can access procurement-specific features

### 3. Approver (`approver`)
- **Purpose**: Managers who approve requests at various levels
- **Permissions**:
  - Can view financial information
  - Can modify approved quantities
  - Can add approval comments
  - Can perform workflow actions (approve, reject, send back)

### 4. Reviewer (`reviewer`)
- **Purpose**: Finance and audit users who review for compliance
- **Permissions**:
  - Can view all financial information
  - Can add review comments
  - Limited edit permissions focused on review activities
  - Access to audit trails and compliance reports

## How It Works

### 1. User Assignment to Workflow Stages

Users are assigned to specific workflow stages, not directly to workflow roles. Each stage has a `roleType` that determines the permissions users get when assigned to that stage.

```typescript
// Example: Purchasing Review stage
{
  id: 2,
  name: "Purchasing Review",
  description: "Review by purchasing staff",
  roleType: "purchaser", // This determines permissions
  assignedUsers: [
    { id: 5, name: "Emily Wong", department: "Purchasing" },
    { id: 6, name: "John Martinez", department: "Purchasing" }
  ]
}
```

### 2. Permission Calculation

The system calculates permissions by:

1. **Finding User's Stages**: Identifies all workflow stages where the user is assigned
2. **Extracting Role Types**: Gets the `roleType` from each assigned stage
3. **Combining Permissions**: Merges permissions from all role types
4. **Returning Final Permissions**: Provides a comprehensive permission object

```typescript
// User assigned to both "Request Creation" (requester) and "Purchasing Review" (purchaser) stages
// Gets combined permissions from both role types
const permissions = {
  canViewFinancialInfo: true, // From purchaser role
  canEditFields: {
    location: true,     // From requester role
    product: true,      // From requester role
    vendor: true,       // From purchaser role
    price: true,        // From purchaser role
    // ... other fields
  }
}
```

### 3. Real-time Permission Updates

The `WorkflowContext` automatically updates permissions when:
- User's stage assignments change
- Current workflow changes
- Workflow configuration is modified

## Implementation Details

### Stage-to-Role Mapping

| Workflow Stage | Role Type | Primary Permissions |
|---|---|---|
| Request Creation | `requester` | Edit request details, basic fields |
| Purchasing Review | `purchaser` | Edit vendor info, pricing, financial access |
| Department Approval | `approver` | Approval actions, financial viewing |
| Finance Review | `reviewer` | Financial review, compliance checking |
| Final Approval | `approver` | Final approval actions |

### Permission Matrix

| Field/Action | Requester | Purchaser | Approver | Reviewer |
|---|---|---|---|---|
| Location | ✅ Edit | ❌ | ❌ | ❌ |
| Product | ✅ Edit | ❌ | ❌ | ❌ |
| Request Qty | ✅ Edit | ❌ | ❌ | ❌ |
| Approved Qty | ❌ | ✅ Edit | ✅ Edit | ❌ |
| Vendor | ❌ | ✅ Edit | ❌ | ❌ |
| Price | ❌ | ✅ Edit | ❌ | ❌ |
| Financial Info | ❌ View | ✅ View | ✅ View | ✅ View |
| Comments | ✅ Edit | ✅ Edit | ✅ Edit | ✅ Edit |

## Usage Examples

### 1. In React Components

```typescript
import { useWorkflow } from '@/lib/context/workflow-context';

function PRDetailComponent() {
  const { workflowPermissions, getUserWorkflowRoles } = useWorkflow();
  
  return (
    <div>
      {/* Show financial info only if user has permission */}
      {workflowPermissions.canViewFinancialInfo && (
        <FinancialSummary />
      )}
      
      {/* Show vendor field only if user can edit it */}
      {workflowPermissions.canEditFields.vendor && (
        <VendorSelector />
      )}
      
      {/* Display user's roles */}
      <p>Your roles: {getUserWorkflowRoles().join(', ')}</p>
    </div>
  );
}
```

### 2. Permission Checking

```typescript
import { canViewWorkflowFinancialInfo, getWorkflowFieldPermissions } from '@/lib/services/workflow-permissions';

// Check if user with specific roles can view financial info
const userRoles = ['requester', 'purchaser'];
const canViewFinancial = canViewWorkflowFinancialInfo(userRoles); // true (has purchaser role)

// Get all field permissions for user roles
const permissions = getWorkflowFieldPermissions(userRoles);
console.log(permissions.vendor); // true (purchaser can edit vendor)
console.log(permissions.location); // true (requester can edit location)
```

## Migration from Legacy System

### Before (Hardcoded Roles)
```typescript
// Old system used hardcoded role names
function canViewFinancialInfo(userRole: string): boolean {
  const restrictedRoles = ['Requestor', 'Staff'];
  return !restrictedRoles.includes(userRole);
}
```

### After (Workflow-Based)
```typescript
// New system uses workflow stage assignments
function canViewWorkflowFinancialInfo(workflowRoles: WorkflowRoleType[]): boolean {
  if (workflowRoles.length === 1 && workflowRoles[0] === 'requester') {
    return false;
  }
  return true;
}
```

### Key Changes
1. **Dynamic Role Assignment**: Users can have multiple workflow roles simultaneously
2. **Context-Aware Permissions**: Permissions change based on the active workflow
3. **Stage-Based Logic**: Permissions tied to workflow stages, not user profiles
4. **Flexible Configuration**: Easy to add new workflows with different permission models

## Benefits

### 1. Flexibility
- Users can have different permissions in different workflows
- Easy to create new workflows with custom permission models
- Permissions automatically adjust based on stage assignments

### 2. Maintainability
- Clean separation between workflow logic and permission logic
- Single source of truth for permission calculations
- Type-safe permission checking with TypeScript

### 3. Scalability
- Easy to add new workflow role types
- Simple to extend permissions for new fields or actions
- Supports complex multi-stage approval processes

### 4. User Experience
- Users see exactly what they can access based on their current workflow assignments
- Consistent permissions across all related features
- Real-time updates when assignments change

## Testing Strategy

### 1. Unit Tests
- Test permission calculation logic with various role combinations
- Verify edge cases (no roles, single role, multiple roles)
- Test workflow context state management

### 2. Integration Tests
- Test workflow context integration with React components
- Verify permission updates when workflow changes
- Test user assignment to stages

### 3. User Acceptance Testing
1. **Requester Flow**: Create PR, verify limited permissions, cannot see financial info
2. **Purchaser Flow**: Assign to purchasing stage, verify vendor/pricing access
3. **Approver Flow**: Assign to approval stage, verify approval actions available
4. **Multi-Role Flow**: Assign to multiple stages, verify combined permissions

## Future Enhancements

### 1. Dynamic Stage Assignment
- API integration for real-time stage assignments
- Workflow engine integration for automatic assignments
- Rule-based assignment logic

### 2. Permission Auditing
- Track permission changes over time
- Audit trail for security compliance
- Permission usage analytics

### 3. Advanced Workflow Features
- Conditional permissions based on request properties
- Time-based permission expiry
- Department-specific workflow variations

### 4. Performance Optimizations
- Permission caching strategies
- Lazy loading of workflow configurations
- Optimized permission calculation algorithms

## Troubleshooting

### Common Issues

#### 1. User Can't See Expected Fields
- **Check**: User's workflow stage assignments
- **Solution**: Verify user is assigned to stages with appropriate `roleType`

#### 2. Permissions Not Updating
- **Check**: Workflow context is properly wrapped around components
- **Solution**: Ensure `WorkflowProvider` is in the component tree

#### 3. Financial Information Not Visible
- **Check**: User's workflow roles include non-requester roles
- **Solution**: Assign user to purchaser, approver, or reviewer stages

### Debug Tools

```typescript
// Debug user's current workflow permissions
function debugPermissions() {
  const { workflowPermissions, getUserWorkflowRoles, userWorkflowStages } = useWorkflow();
  
  console.log('User Workflow Roles:', getUserWorkflowRoles());
  console.log('Assigned Stages:', userWorkflowStages);
  console.log('Calculated Permissions:', workflowPermissions);
}
```

## Conclusion

The Workflow-Based Permissions System provides a robust, flexible foundation for access control in the Carmen ERP system. By tying permissions to workflow stages rather than static user roles, the system better reflects the dynamic nature of business processes and provides users with contextually appropriate access to features and information.

This architecture supports the complex approval workflows required in enterprise environments while maintaining simplicity for end users and developers.