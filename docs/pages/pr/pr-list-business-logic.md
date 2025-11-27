# Purchase Request List Page: Business Logic

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document outlines the business logic, rules, and constraints for the Purchase Request (PR) List page operations.

## 1. Data Access and Visibility Rules

### 1.1. RBAC Widget Access Control

Data visibility is controlled by two layers:
1. **Widget Access Permissions** (`roleConfig.widgetAccess`)
2. **Data Visibility Settings** (`roleConfig.visibilitySetting`)

#### Widget Access Control
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

### 1.2. Widget-Specific Data Visibility

#### My Pending Widget (when `widgetAccess.myPR = true`)
- **Scope**: PRs created by the user that require action or are in progress
- **Filter Logic**: `WHERE requestorId = currentUser.id AND status IN ('Draft', 'Submitted', 'In Progress', 'Rejected')`
- **Status Access**: Actionable statuses (Draft, Submitted, In Progress, Rejected)
- **Secondary Filters**: Status-based filters (Draft, Submitted, Approved, etc.)
- **Purpose**: User's actionable PR queue for efficient workflow management

#### All Documents Widget (when `widgetAccess.myApproval = true`)
- **Scope**: Comprehensive view of PRs based on user's role and department access
- **Filter Logic**: Based on user role and visibility settings:
  - **Staff**: Only own PRs
  - **Department Manager**: Department PRs + Own PRs
  - **Financial Manager**: All PRs within authority scope
  - **Purchasing Staff**: All PRs system-wide
- **Secondary Filters**: Workflow stage-based filters (Department Approval, Financial Approval, etc.)
- **Purpose**: Complete document management and oversight

#### Ready for PO Widget (when `widgetAccess.myOrder = true`)
- **Scope**: Approved PRs ready for purchase order creation
- **Filter Logic**: `WHERE status = 'Approved' AND currentWorkflowStage = 'Completed'`
- **Access**: Typically for Purchasing Staff role
- **Status Access**: Approved PRs only
- **Purpose**: Process approved PRs into Purchase Orders

#### Dynamic Widget Selection
- **Default Widget**: Based on user role and available permissions
- **Priority Order**: myPending → allDocuments → readyForPO
- **Role-based Defaults**:
  - **Staff**: myPending (only available widget)
  - **Department Manager**: myPending (default), allDocuments (available)
  - **Purchasing Staff**: allDocuments (default), myPending and readyForPO (available)

#### Admin Override
- **Scope**: Can view all PRs regardless of widget access settings
- **Filter Logic**: No restrictions
- **Status Access**: All statuses
- **Widget Access**: All widgets enabled by default

### 1.2. Data Filtering Business Rules

#### Default Views by Role
```typescript
const defaultViews = {
  requester: {
    name: "My Requests",
    filters: { requestorId: currentUser.id },
    sortBy: "date",
    sortOrder: "desc"
  },
  departmentManager: {
    name: "Department Requests",
    filters: { 
      OR: [
        { department: currentUser.department },
        { currentApprover: currentUser.id }
      ]
    },
    sortBy: "status",
    sortOrder: "asc"
  },
  approver: {
    name: "Pending My Approval",
    filters: { currentApprover: currentUser.id },
    sortBy: "date",
    sortOrder: "asc"
  },
  purchasing: {
    name: "Approved PRs",
    filters: { status: "Approved" },
    sortBy: "date",
    sortOrder: "asc"
  },
  admin: {
    name: "All Requests",
    filters: {},
    sortBy: "date",
    sortOrder: "desc"
  }
}
```

## 2. Status-Based Business Logic

### 2.1. Status Display Rules

#### Status Priority for Display
1. **Rejected**: Highest priority - always shown prominently
2. **Approved**: High priority - indicates completion
3. **In Progress**: Medium priority - indicates active workflow
4. **Submitted**: Medium priority - indicates pending action
5. **Draft**: Low priority - indicates incomplete

#### Status Color Coding
- **Draft**: Gray (#6B7280)
- **Submitted**: Blue (#3B82F6)
- **In Progress**: Yellow (#F59E0B)
- **Approved**: Green (#10B981)
- **Rejected**: Red (#EF4444)

### 2.2. Workflow Stage Display

#### Stage Indicators
- Show current workflow stage for "In Progress" PRs
- Display next approver information
- Show approval progress (e.g., "2 of 3 approvals")

#### Stage Business Rules
```typescript
const workflowStages = {
  requester: {
    label: "Created",
    description: "PR created by requestor",
    nextStage: "departmentManager"
  },
  departmentManager: {
    label: "Department Review",
    description: "Pending department manager approval",
    nextStage: "finance"
  },
  finance: {
    label: "Finance Review",
    description: "Pending finance approval",
    nextStage: "purchasing"
  },
  purchasing: {
    label: "Purchasing Review",
    description: "Pending purchasing approval",
    nextStage: "approved"
  },
  approved: {
    label: "Approved",
    description: "Fully approved and ready for PO creation",
    nextStage: null
  }
}
```

## 3. Action Availability Logic

### 3.1. Row-Level Action Visibility

#### View Action
- **Always Available**: All users can view PRs they have access to
- **Implementation**: No restrictions

#### Edit Action
```typescript
const canEdit = (pr: PurchaseRequest, user: User): boolean => {
  // Admin can edit any PR
  if (user.role === 'admin') return true;
  
  // Requester can edit their own draft or rejected PRs
  if (user.id === pr.requestorId) {
    return pr.status === 'Draft' || pr.status === 'Rejected';
  }
  
  // No one else can edit
  return false;
}
```

#### Delete Action
```typescript
const canDelete = (pr: PurchaseRequest, user: User): boolean => {
  // Admin can delete any draft PR
  if (user.role === 'admin' && pr.status === 'Draft') return true;
  
  // Requester can delete their own draft PRs
  if (user.id === pr.requestorId && pr.status === 'Draft') return true;
  
  // Cannot delete submitted, approved, or rejected PRs
  return false;
}
```

#### Duplicate Action
```typescript
const canDuplicate = (pr: PurchaseRequest, user: User): boolean => {
  // Any user who can view a PR can duplicate it
  // Duplicated PR will be created as Draft with current user as requestor
  return true; // If user can see the PR, they can duplicate it
}
```

#### Workflow Actions (Approve/Reject/Send Back)
```typescript
const getAvailableWorkflowActions = (pr: PurchaseRequest, user: User): string[] => {
  const actions: string[] = [];
  
  // Only available for PRs in workflow
  if (pr.status !== 'Submitted' && pr.status !== 'In Progress') {
    return actions;
  }
  
  // Check if user is current approver
  if (pr.currentApprover === user.id) {
    actions.push('approve', 'reject', 'sendBack');
  }
  
  // Admin can perform any workflow action
  if (user.role === 'admin') {
    actions.push('approve', 'reject', 'sendBack');
  }
  
  return actions;
}
```

### 3.2. Bulk Action Availability

#### Enhanced Bulk Operations with Mixed Status Handling

#### Bulk Approve
- **Condition**: User must be approver for ALL selected PRs
- **Status Check**: All PRs must be in "Submitted" or "In Progress" status
- **Validation**: Each PR must be at the user's approval stage
- **Mixed Status Handling**: System analyzes selection and provides options:
  - Process only applicable PRs
  - Process all PRs (may move some to review status)
  - Cancel and manually select appropriate PRs
- **Smart Processing**: Automatically handles different approval stages intelligently

#### Bulk Reject
- **Condition**: Same as bulk approve
- **Additional**: Must provide rejection reason
- **Effect**: All selected PRs move to "Rejected" status
- **Comment Requirements**: Bulk rejection reason applied to all items
- **Notification System**: Automated notifications to all affected requestors

#### Bulk Return (Enhanced)
- **Multi-step Process**: Select target stage for return workflow
- **Stage Selection**: Choose specific workflow stage to return items to
- **Reason Required**: Mandatory explanation for bulk return actions
- **Impact Analysis**: Shows affected users and departments before processing

#### Bulk Delete
- **Condition**: All selected PRs must be in "Draft" status
- **Permission**: User must be owner or admin for each PR
- **Validation**: Cannot delete PRs with items already ordered
- **Safety Checks**: Additional confirmation for bulk deletion operations

#### Bulk Export
- **Condition**: User must have view access to all selected PRs
- **No Status Restriction**: Can export PRs in any status
- **Format Options**: Excel, CSV, PDF with role-based content filtering
- **Financial Data Masking**: Pricing information excluded for unauthorized roles

#### Bulk Status Change (Admin Only)
- **Advanced Operation**: Direct status manipulation for administrative purposes
- **Audit Trail**: Comprehensive logging of bulk status changes
- **Validation Rules**: Ensures business rule compliance during bulk operations
- **Rollback Capability**: Ability to undo bulk operations if needed

## 4. Search and Filter Logic

### 4.1. Global Search Implementation

#### Searchable Fields
```typescript
const searchableFields = [
  'refNumber',
  'description',
  'requestor.name',
  'vendor',
  'department',
  'jobCode'
];

const searchLogic = (searchTerm: string) => {
  return {
    OR: searchableFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    }))
  };
};
```

#### Search Performance Rules
- Minimum 2 characters before search triggers
- Debounce delay: 300ms
- Maximum search results: 1000 items
- Search within current filter context only

### 4.2. Advanced Filter Logic

#### Date Range Filters
```typescript
const dateRangeFilter = (field: string, startDate: Date, endDate: Date) => {
  return {
    [field]: {
      gte: startDate,
      lte: endDate
    }
  };
};
```

#### Amount Range Filters
```typescript
const amountRangeFilter = (minAmount: number, maxAmount: number) => {
  return {
    estimatedTotal: {
      gte: minAmount,
      lte: maxAmount
    }
  };
};
```

#### Multi-Select Filters
```typescript
const multiSelectFilter = (field: string, values: string[]) => {
  return {
    [field]: {
      in: values
    }
  };
};
```

### 4.3. Filter Persistence Rules

#### Session Storage
- Current filters persist during browser session
- Cleared on logout or session timeout

#### User Preferences
- Saved filters stored in user profile
- Default view preference saved
- Column visibility preferences saved

## 5. Sorting Logic

### 5.1. Default Sorting Rules

#### By Role
- **Requester**: Sort by date (newest first)
- **Approver**: Sort by date (oldest first) - prioritize older pending items
- **Purchasing**: Sort by approval date (oldest first)
- **Admin**: Sort by date (newest first)

#### Secondary Sorting
- Primary: User-selected column
- Secondary: Date (for consistent ordering)
- Tertiary: Reference number (for absolute consistency)

### 5.2. Multi-Column Sorting
```typescript
const sortingRules = {
  maxColumns: 3,
  defaultSecondary: 'date',
  defaultTertiary: 'refNumber'
};
```

## 6. Pagination Logic

### 6.1. Page Size Rules

#### Default Page Sizes by Role
- **Requester**: 25 items (typically fewer PRs)
- **Approver**: 50 items (need to see more for efficiency)
- **Purchasing**: 100 items (processing many PRs)
- **Admin**: 50 items (balanced view)

#### Performance Limits
- Maximum page size: 100 items
- Virtual scrolling threshold: 500+ items
- Cache size: 5 pages

### 6.2. Navigation Rules

#### Page Boundary Handling
- Prevent navigation beyond available pages
- Auto-adjust to last page if current page becomes invalid
- Maintain position when filters change

## 7. Real-Time Update Logic

### 7.1. Update Triggers

#### Status Changes
- PR status updates trigger real-time refresh
- Workflow stage changes update display
- New approvals/rejections update immediately

#### New PR Creation
- Add to list if matches current filters
- Show notification of new item
- Maintain user's current scroll position

### 7.2. Conflict Resolution

#### Concurrent Edits
- Show warning if PR was modified by another user
- Provide option to refresh or continue
- Highlight conflicting changes

#### Stale Data Detection
- Check data freshness on user interaction
- Auto-refresh if data is stale (>5 minutes)
- Show indicator for outdated information

## 8. Performance and Optimization Rules

### 8.1. Data Loading Strategy

#### Initial Load
- Load first page immediately
- Prefetch next page in background
- Cache filter options and metadata

#### Lazy Loading
- Load additional pages on demand
- Implement virtual scrolling for large datasets
- Unload distant pages to manage memory

### 8.2. Caching Strategy

#### Client-Side Cache
- Cache recent pages for 5 minutes
- Cache filter results for 2 minutes
- Invalidate cache on data mutations

#### Server-Side Optimization
- Use database indexes for common filters
- Implement query result caching
- Optimize for role-based access patterns

## 9. Validation Rules

### 9.1. Input Validation

#### Search Input
- Sanitize search terms
- Prevent SQL injection
- Limit search term length (100 characters)

#### Filter Values
- Validate date ranges (start <= end)
- Validate amount ranges (min <= max)
- Validate enum values for dropdowns

### 9.2. Business Rule Validation

#### Selection Limits
- Maximum bulk selection: 100 items
- Warn at 50+ selections
- Prevent memory issues with large selections

#### Action Validation
- Validate permissions before action execution
- Check PR status before workflow actions
- Verify data integrity before bulk operations