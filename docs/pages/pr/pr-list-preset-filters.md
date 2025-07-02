# Purchase Request List: RBAC-Controlled Preset Filter Configuration

This document outlines how the preset filter options are configured based on the workflow setup and RBAC system.

## 1. RBAC Widget Access Control

### 1.1. Widget Access Configuration

The filter interface is dynamically generated based on user's role configuration:

```typescript
interface RoleConfiguration {
  widgetAccess: {
    myPR: boolean;        // Controls "My PR" widget visibility
    myApproval: boolean;  // Controls "My Approvals" widget visibility
    myOrder: boolean;     // Controls "Ready for PO" widget visibility
  }
  visibilitySetting: 'location' | 'department' | 'full';
}
```

### 1.2. Widget-Specific Filter Logic

#### My PR Widget (`roleConfig.widgetAccess.myPR`)
- **Purpose**: Shows ALL PRs created by the user (complete ownership view)
- **Filter**: `requestorId = ${currentUser.id}`
- **Status Scope**: ALL statuses (Draft, Submitted, In Progress, Approved, Rejected, Cancelled)
- **Available To**: Any role (when enabled by admin)

#### My Approvals Widget (`roleConfig.widgetAccess.myApproval`)
- **Purpose**: Shows PRs pending user's approval at assigned workflow stages
- **Filter**: `currentWorkflowStage IN (${userAssignedStages}) AND status IN ('Submitted', 'In Progress')`
- **Status Scope**: Only actionable statuses (Submitted, In Progress)
- **Available To**: Users assigned to workflow stages

#### Ready for PO Widget (`roleConfig.widgetAccess.myOrder`)
- **Purpose**: Shows approved PRs ready for Purchase Order creation
- **Filter**: `status = 'Approved' AND currentWorkflowStage = 'Completed'`
- **Status Scope**: Approved PRs only
- **Available To**: Typically Purchasing Staff

## 2. Workflow-Based Configuration

### 2.1. Workflow Stages (From Workflow Configuration)

Based on the workflow configuration, the available workflow stages are:

#### Standard Purchase Request Workflow (WF-001)
```typescript
const workflowStages = [
  { id: 1, name: "Request Creation", assignedRoles: ["Requester"] },
  { id: 2, name: "Department Approval", assignedRoles: ["Department Head"] },
  { id: 3, name: "Purchasing Review", assignedRoles: ["Purchasing Staff"] },
  { id: 4, name: "Finance Review", assignedRoles: ["Finance Manager"] },
  { id: 5, name: "Final Approval", assignedRoles: ["General Manager"] },
  { id: 6, name: "Completed", assignedRoles: [] }
];
```

### 2.2. Dynamic Stage Assignment

Users are assigned to specific workflow stages, which determines their "My Approvals" filter:

```typescript
const getUserAssignedStages = (userId: number): Stage[] => {
  return workflows
    .flatMap(workflow => workflow.stages)
    .filter(stage => stage.assignedUsers.some(user => user.id === userId));
};
```

## 3. Role-Based Widget Toggles

### 3.1. For Requester Role
```typescript
const requesterToggles = [
  { 
    value: 'myPR', 
    label: 'My PR',
    filter: `requestorId = ${currentUser.id}`,
    enabled: roleConfig.widgetAccess.myPR,
    description: 'All purchase requests I have created (all statuses)'
  }
];
```

### 3.2. For Approver Roles (Department Head, Finance Manager, General Manager)
```typescript
const approverToggles = [
  { 
    value: 'myPR', 
    label: 'My PR',
    filter: `requestorId = ${currentUser.id}`,
    enabled: roleConfig.widgetAccess.myPR,
    description: 'All purchase requests I have created (all statuses)'
  },
  { 
    value: 'myApproval', 
    label: 'My Approvals',
    filter: `currentWorkflowStage IN (${assignedStages}) AND status IN ('Submitted', 'In Progress')`,
    enabled: roleConfig.widgetAccess.myApproval,
    description: 'PRs pending my approval at assigned workflow stages'
  }
];
```

### 3.3. For Purchasing Staff Role
```typescript
const purchasingToggles = [
  { 
    value: 'myPR', 
    label: 'My PR',
    filter: `requestorId = ${currentUser.id}`,
    enabled: roleConfig.widgetAccess.myPR,
    description: 'All purchase requests I have created (all statuses)'
  },
  { 
    value: 'myApproval', 
    label: 'My Approvals',
    filter: `currentWorkflowStage = 'Purchasing Review' AND status IN ('Submitted', 'In Progress')`,
    enabled: roleConfig.widgetAccess.myApproval,
    description: 'PRs pending my approval at Purchasing Review stage'
  },
  { 
    value: 'myOrder', 
    label: 'Ready for PO',
    filter: `status = 'Approved' AND currentWorkflowStage = 'Completed'`,
    enabled: roleConfig.widgetAccess.myOrder,
    description: 'Approved PRs ready for Purchase Order creation'
  }
];
```

## 4. Secondary Filter Options

### 4.1. When "My PR" is selected
```typescript
const myPRStatusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' }
];
```

### 4.2. When "My Approvals" is selected
```typescript
const approvalStageFilters = [
  { value: 'all', label: 'All Stages' },
  ...userAssignedStages.map(stage => ({
    value: stage.name.toLowerCase().replace(/\s+/g, ''),
    label: stage.name
  }))
];
```

### 4.3. When "Ready for PO" is selected
```typescript
const poReadyFilters = [
  { value: 'all', label: 'All Approved' },
  { value: 'pending', label: 'Pending PO Creation' },
  { value: 'inProgress', label: 'PO In Progress' },
  { value: 'completed', label: 'PO Created' }
];
```

## 5. Important Distinctions

### 5.1. "My PR" vs "My Pending" Clarification

| Filter Type | Scope | Status Filter | Control Method | Purpose |
|-------------|-------|---------------|----------------|---------|
| **"My PR"** (RBAC) | All PRs I created | ALL statuses | `roleConfig.widgetAccess.myPR` | Complete ownership view |
| **"My Pending"** (Business Logic) | PRs needing my action | Draft + InProgress only | Hardcoded business logic | Action-oriented view |

#### Key Differences:
- **"My PR"** shows comprehensive history (Draft to Approved to Completed)
- **"My Pending"** shows only actionable items (Draft, InProgress)
- **"My PR"** is RBAC-controlled and configurable per role
- **"My Pending"** is business logic for operational efficiency

### 5.2. Migration from Current Implementation

Current code uses "My Pending" with limited scope:
```typescript
// Current implementation (limited scope)
if (toggleMode === 'myPending') {
  result = result.filter(pr =>
    pr.requestorId === currentUserId &&
    (pr.status === DocumentStatus.Draft || pr.status === DocumentStatus.InProgress)
  );
}
```

Should be replaced with RBAC-controlled "My PR":
```typescript
// RBAC-controlled implementation (full scope)
if (selectedWidget === 'myPR' && roleConfig.widgetAccess.myPR) {
  result = result.filter(pr => pr.requestorId === currentUserId);
  // No status filtering - shows ALL statuses
}
```

## 6. Dynamic Filter Configuration Service

### 6.1. Filter Configuration Service

```typescript
class FilterConfigurationService {
  
  static getAvailableToggles(user: User, roleConfig: RoleConfiguration): ToggleOption[] {
    const toggles: ToggleOption[] = [];
    
    // My PR toggle (available to all roles if enabled)
    if (roleConfig.widgetAccess.myPR) {
      toggles.push({
        value: 'myPR',
        label: 'My PR',
        filter: this.buildMyPRFilter(user),
        defaultSecondaryFilter: 'all'
      });
    }
    
    // My Approvals toggle (available to approver roles if enabled)
    if (roleConfig.widgetAccess.myApproval && this.hasApprovalStages(user)) {
      toggles.push({
        value: 'myApproval',
        label: 'My Approvals',
        filter: this.buildMyApprovalFilter(user),
        defaultSecondaryFilter: 'all'
      });
    }
    
    // Ready for PO toggle (available to purchasing staff if enabled)
    if (roleConfig.widgetAccess.myOrder && this.isPurchasingRole(user.role)) {
      toggles.push({
        value: 'myOrder',
        label: 'Ready for PO',
        filter: this.buildMyOrderFilter(user),
        defaultSecondaryFilter: 'pending'
      });
    }
    
    return toggles;
  }
  
  static getSecondaryFilters(toggleValue: string, user: User): FilterOption[] {
    switch (toggleValue) {
      case 'myPR':
        return this.getMyPRStatusFilters();
      case 'myApproval':
        return this.getApprovalStageFilters(user);
      case 'myOrder':
        return this.getPOReadyFilters();
      default:
        return [];
    }
  }
  
  private static buildMyPRFilter(user: User): string {
    return `requestorId = ${user.id}`;
  }
  
  private static buildMyApprovalFilter(user: User): string {
    const assignedStages = WorkflowService.getUserAssignedStages(user.id);
    const stageNames = assignedStages.map(stage => `'${stage.name}'`).join(',');
    return `currentWorkflowStage IN (${stageNames}) AND status IN ('Submitted', 'In Progress')`;
  }
  
  private static buildMyOrderFilter(user: User): string {
    return `status = 'Approved' AND currentWorkflowStage = 'Completed'`;
  }
  
  private static hasApprovalStages(user: User): boolean {
    return WorkflowService.getUserAssignedStages(user.id).length > 0;
  }
  
  private static isPurchasingRole(role: string): boolean {
    return role === 'Purchasing Staff';
  }
}
```

### 6.2. Workflow Service Integration

```typescript
class WorkflowService {
  
  static getUserAssignedStages(userId: number): Stage[] {
    // Get all active workflows
    const workflows = WorkflowRepository.getAllActiveWorkflows();
    const assignedStages: Stage[] = [];
    
    workflows.forEach(workflow => {
      workflow.stages.forEach(stage => {
        if (stage.assignedUsers.some(user => user.id === userId)) {
          assignedStages.push(stage);
        }
      });
    });
    
    return assignedStages;
  }
  
  static getWorkflowStageOptions(userId: number): FilterOption[] {
    const assignedStages = this.getUserAssignedStages(userId);
    
    return [
      { value: 'all', label: 'All Stages' },
      ...assignedStages.map(stage => ({
        value: stage.name.toLowerCase().replace(/\s+/g, ''),
        label: stage.name
      }))
    ];
  }
}
```

## 7. Implementation in Purchase Request List Component

### 7.1. Updated State Management

```typescript
// Replace the current simple toggle with dynamic configuration
const [filterConfig, setFilterConfig] = useState<FilterConfiguration | null>(null);
const [selectedToggle, setSelectedToggle] = useState<string>('');
const [selectedSecondaryFilter, setSelectedSecondaryFilter] = useState<string>('all');

// Initialize filter configuration based on user role and permissions
useEffect(() => {
  const config = FilterConfigurationService.getFilterConfiguration(currentUser, roleConfig);
  setFilterConfig(config);
  
  // Set default toggle (first available option)
  if (config.toggles.length > 0) {
    setSelectedToggle(config.toggles[0].value);
    setSelectedSecondaryFilter(config.toggles[0].defaultSecondaryFilter);
  }
}, [currentUser, roleConfig]);
```

### 7.2. Updated Filter UI

```typescript
const filters = (
  <div>
    <div className="flex flex-1 items-center justify-between gap-2">
      {/* Search Input */}
      <Input
        type="search"
        placeholder="Search purchase requests..."
        value={searchTerm}
        onChange={handleSearch}
        className="h-8 w-[220px] text-xs"
      />
      
      {/* Dynamic RBAC-Controlled Toggle Buttons */}
      {filterConfig && (
        <div className="inline-flex rounded-md shadow-sm border">
          {filterConfig.toggles.map((toggle, index) => (
            <Button
              key={toggle.value}
              variant={selectedToggle === toggle.value ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                "h-8 px-4",
                index === 0 ? "rounded-r-none" : 
                index === filterConfig.toggles.length - 1 ? "rounded-l-none" : "rounded-none"
              )}
              onClick={() => {
                setSelectedToggle(toggle.value);
                setSelectedSecondaryFilter(toggle.defaultSecondaryFilter);
              }}
            >
              {toggle.label}
            </Button>
          ))}
        </div>
      )}
      
      {/* Dynamic Secondary Filter */}
      {filterConfig && selectedToggle && (
        <Select
          value={selectedSecondaryFilter}
          onValueChange={setSelectedSecondaryFilter}
        >
          <SelectTrigger className="rounded h-8 px-3 w-[180px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FilterConfigurationService.getSecondaryFilters(selectedToggle, currentUser).map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {/* Advanced Filter and View Toggle */}
      <div className="flex items-center space-x-2">
        <AdvancedFilter<PurchaseRequest>
          filterFields={filterFields}
          onApplyFilters={handleApplyAdvancedFilters}
          onClearFilters={handleClearAdvancedFilters}
        />
        {/* View toggle buttons */}
      </div>
    </div>
    
    {/* Active Filter Display */}
    <div className="w-full bg-muted px-2 py-0.5 rounded text-[10px] font-normal flex items-center mt-2">
      <span>
        Filter: {filterConfig?.toggles.find(t => t.value === selectedToggle)?.label}
        {selectedSecondaryFilter !== 'all' && (
          <> ({FilterConfigurationService.getSecondaryFilters(selectedToggle, currentUser)
            .find(f => f.value === selectedSecondaryFilter)?.label})</>
        )}
      </span>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => {
          if (filterConfig?.toggles.length > 0) {
            setSelectedToggle(filterConfig.toggles[0].value);
            setSelectedSecondaryFilter(filterConfig.toggles[0].defaultSecondaryFilter);
          }
        }}
      >
        ×
      </Button>
    </div>
  </div>
);
```

## 8. Configuration Management

### 8.1. Admin Configuration Interface

Administrators can configure:

1. **Role Widget Access**: Enable/disable widgets per role via `roleConfig.widgetAccess`
2. **Workflow Stage Assignments**: Assign users to workflow stages in workflow configuration
3. **Visibility Settings**: Configure data visibility scope per role (`location`, `department`, `full`)
4. **Default Filters**: Set default filter selections per role

### 8.2. User Preference Storage

Store user preferences for:
- Default toggle selection
- Default secondary filter
- Saved filter configurations
- Column visibility preferences

This approach ensures that the preset filter options are dynamically generated based on the actual workflow configuration and RBAC setup, making the system flexible and maintainable.