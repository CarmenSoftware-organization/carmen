# Purchase Request List: RBAC Implementation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document summarizes the implementation of Role-Based Access Control (RBAC) for the Purchase Request List page.

## 1. RBAC Widget Access Control

The PR List now uses RBAC-controlled widget access to determine which filter toggles are available to each user:

```typescript
// Load RBAC configuration and available widgets
useEffect(() => {
  if (user) {
    // Get role configuration from RBAC service
    const config = PRRBACService.getRoleConfiguration(user.role);
    setRoleConfig(config);
    
    // Determine available widgets based on role configuration
    const widgets = [];
    if (config.widgetAccess.myPR) widgets.push('myPR');
    if (config.widgetAccess.myApproval) widgets.push('myApproval');
    if (config.widgetAccess.myOrder) widgets.push('myOrder');
    
    // Always add allDocument for admins or users with full visibility
    if (user.role === 'System Administrator' || config.visibilitySetting === 'full') {
      widgets.push('allDocument');
    }
    
    setAvailableWidgets(widgets);
    
    // Set default toggle to first available widget
    if (widgets.length > 0 && !widgets.includes(toggleMode)) {
      setToggleMode(widgets[0] as any);
    }
  }
}, [user, toggleMode]);
```

## 2. Dynamic Widget Toggles

The toggle buttons are now dynamically rendered based on the user's RBAC permissions:

```tsx
{/* RBAC-controlled widget toggles */}
<div className="inline-flex rounded-md shadow-sm border">
  {/* Only show widgets the user has access to */}
  {availableWidgets.includes('myPR') && (
    <Button
      variant={toggleMode === 'myPR' ? 'default' : 'ghost'}
      size="sm"
      className="rounded-none h-8 px-4"
      onClick={() => {
        setToggleMode('myPR');
        setSelectedWorkflowStage('all');
      }}
    >
      My PR
    </Button>
  )}
  
  {availableWidgets.includes('myApproval') && (
    <Button
      variant={toggleMode === 'myApproval' ? 'default' : 'ghost'}
      size="sm"
      className="rounded-none h-8 px-4"
      onClick={() => {
        setToggleMode('myApproval');
        setSelectedWorkflowStage('all');
      }}
    >
      My Approvals
    </Button>
  )}
  
  {availableWidgets.includes('myOrder') && (
    <Button
      variant={toggleMode === 'myOrder' ? 'default' : 'ghost'}
      size="sm"
      className="rounded-none h-8 px-4"
      onClick={() => {
        setToggleMode('myOrder');
        setSelectedWorkflowStage('all');
      }}
    >
      Ready for PO
    </Button>
  )}
  
  {availableWidgets.includes('allDocument') && (
    <Button
      variant={toggleMode === 'allDocument' ? 'default' : 'ghost'}
      size="sm"
      className="rounded-none h-8 px-4"
      onClick={() => {
        setToggleMode('allDocument');
        setSelectedWorkflowStage('all');
      }}
    >
      All Documents
    </Button>
  )}
</div>
```

## 3. Widget-Specific Filtering Logic

Each widget now has its own specific filtering logic:

```typescript
// Apply widget-specific filters based on RBAC
switch (toggleMode) {
  case 'myPR':
    // Show ALL PRs created by the user (all statuses)
    result = result.filter(pr => pr.requestorId === currentUserId);
    break;
    
  case 'myApproval':
    // Show PRs pending user's approval at assigned workflow stages
    const userAssignedStages = user?.assignedWorkflowStages || [];
    result = result.filter(pr => 
      userAssignedStages.includes(pr.currentWorkflowStage) && 
      [DocumentStatus.Submitted, DocumentStatus.InProgress].includes(pr.status)
    );
    break;
    
  case 'myOrder':
    // Show approved PRs ready for purchase order creation
    result = result.filter(pr => 
      pr.status === DocumentStatus.Approved && 
      pr.currentWorkflowStage === WorkflowStage.Completed
    );
    break;
    
  case 'allDocument':
    // No filtering - show all documents (already the default)
    break;
}
```

## 4. Dynamic Secondary Filters

The secondary filter dropdown now shows context-specific options based on the selected widget:

```typescript
// Define secondary filters based on selected widget
const getSecondaryFilters = useMemo(() => {
  switch (toggleMode) {
    case 'myPR':
      return [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'inProgress', label: 'In Progress' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ];
    
    case 'myApproval':
      // Get workflow stages assigned to the user
      const userAssignedStages = user?.assignedWorkflowStages || [];
      return [
        { value: 'all', label: 'All Stages' },
        ...userAssignedStages.map(stage => ({
          value: stage,
          label: stage.replace(/([A-Z])/g, ' $1').trim() // Convert camelCase to spaces
        }))
      ];
    
    case 'myOrder':
      return [
        { value: 'all', label: 'All Approved' },
        { value: 'pending', label: 'Pending PO Creation' },
        { value: 'inProgress', label: 'PO In Progress' },
        { value: 'completed', label: 'PO Created' }
      ];
    
    case 'allDocument':
    default:
      return [
        { value: 'all', label: 'All Stages' },
        { value: 'requester', label: 'Requester' },
        { value: 'departmentHeadApproval', label: 'Department Head Approval' },
        { value: 'financeApproval', label: 'Finance Approval' },
        { value: 'completed', label: 'Completed' },
        { value: 'rejected', label: 'Rejected' }
      ];
  }
}, [toggleMode, user?.assignedWorkflowStages]);
```

## 5. Key Changes

### 5.1. Renamed "My Pending" to "My PR"

- **Before**: "My Pending" only showed Draft and InProgress PRs
- **After**: "My PR" shows ALL PRs created by the user (all statuses)

### 5.2. Added RBAC-Controlled Widgets

- **My PR**: Available if `roleConfig.widgetAccess.myPR = true`
- **My Approvals**: Available if `roleConfig.widgetAccess.myApproval = true`
- **Ready for PO**: Available if `roleConfig.widgetAccess.myOrder = true`
- **All Documents**: Available for admins or users with full visibility

### 5.3. Dynamic Secondary Filters

- **My PR**: Filter by status (Draft, Submitted, Approved, etc.)
- **My Approvals**: Filter by workflow stages assigned to the user
- **Ready for PO**: Filter by PO creation status
- **All Documents**: Filter by workflow stage

### 5.4. Workflow Stage Integration

- Filters now based on user's assigned workflow stages
- Dynamically generated from user context

## 6. Implementation Benefits

- **Personalized UI**: Users only see relevant toggles
- **Role-Appropriate Views**: Data filtered based on role and permissions
- **Workflow Integration**: Filters based on actual workflow assignments
- **Consistent Terminology**: Uses same terms as PR details page
- **Flexible Configuration**: Controlled by RBAC service

## 7. Next Steps

1. **Testing**: Test with different user roles and permissions
2. **Bulk Actions**: Update bulk actions to respect RBAC permissions
3. **Error Handling**: Add better error messages for permission denied cases
4. **User Preferences**: Save user's preferred toggle and filters
5. **Performance**: Optimize filtering for large datasets