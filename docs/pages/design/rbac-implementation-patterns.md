# RBAC Implementation Patterns: A Guide from Purchase Request Module

**Document Version**: 1.0  
**Created**: January 2025  
**Based on**: Purchase Request RBAC Production Implementation  

This document extracts proven Role-Based Access Control (RBAC) patterns from the Purchase Request module to serve as a blueprint for implementing consistent, secure, and scalable permission systems across all Carmen ERP modules.

## 1. RBAC Architecture Overview

### 1.1. Core RBAC Principles

The Purchase Request module demonstrates a sophisticated multi-layered RBAC system with these core principles:

- **Role-Based Progressive Disclosure**: UI adapts dynamically based on user roles
- **Field-Level Permissions**: Granular control over individual form fields
- **Widget-Based Access Control**: Dynamic interface sections based on role
- **Workflow-Stage Permissions**: Actions available based on current process stage
- **Context-Aware Security**: Permissions adapt to document state and user context

### 1.2. RBAC Service Architecture

```typescript
interface RBACService {
  // Core permission checking
  canPerformAction(user: User, entity: any, action: string): boolean;
  getAvailableActions(user: User, entity: any): string[];
  
  // Field-level permissions
  canEditField(fieldName: string, userRole: string): boolean;
  canViewField(fieldName: string, userRole: string): boolean;
  
  // Widget access control
  getRoleConfiguration(userRole: string): RoleConfiguration;
  hasWidgetAccess(user: User, widget: string): boolean;
  
  // Workflow permissions
  canApproveAtCurrentStage(user: User, entity: any): boolean;
  getWorkflowActionButtons(user: User, entity: any): ActionButton[];
}
```

## 2. Role Definition Patterns

### 2.1. Standard Role Hierarchy

**Role Definitions Based on PR Implementation:**
```typescript
enum UserRole {
  Staff = 'Staff',
  DepartmentManager = 'Department Manager',
  FinancialManager = 'Financial Manager',
  PurchasingStaff = 'Purchasing Staff',
  SystemAdministrator = 'System Administrator'
}

interface RoleConfiguration {
  // Widget access permissions
  widgetAccess: {
    myPending: boolean;      // Own documents view
    allDocuments: boolean;   // Department/organization view
    readyForProcessing: boolean; // Workflow-specific view
  };
  
  // Data visibility scope
  visibilitySetting: 'self' | 'department' | 'organization';
  
  // Workflow stage assignments
  assignedWorkflowStages?: string[];
  
  // Special permissions
  canViewFinancialInfo: boolean;
  canEditVendorInfo: boolean;
  canPerformBulkActions: boolean;
}
```

### 2.2. Role Configuration Implementation

```typescript
class RBACConfigurationService {
  private static roleConfigurations: Record<string, RoleConfiguration> = {
    'Staff': {
      widgetAccess: { 
        myPending: true, 
        allDocuments: false, 
        readyForProcessing: false 
      },
      visibilitySetting: 'self',
      canViewFinancialInfo: false,
      canEditVendorInfo: false,
      canPerformBulkActions: false
    },
    
    'Department Manager': {
      widgetAccess: { 
        myPending: true, 
        allDocuments: true, 
        readyForProcessing: false 
      },
      visibilitySetting: 'department',
      assignedWorkflowStages: ['departmentApproval'],
      canViewFinancialInfo: true,
      canEditVendorInfo: false,
      canPerformBulkActions: true
    },
    
    'Financial Manager': {
      widgetAccess: { 
        myPending: true, 
        allDocuments: true, 
        readyForProcessing: false 
      },
      visibilitySetting: 'organization',
      assignedWorkflowStages: ['financialApproval'],
      canViewFinancialInfo: true,
      canEditVendorInfo: false,
      canPerformBulkActions: true
    },
    
    'Purchasing Staff': {
      widgetAccess: { 
        myPending: true, 
        allDocuments: true, 
        readyForProcessing: true 
      },
      visibilitySetting: 'organization',
      assignedWorkflowStages: ['purchasingProcessing'],
      canViewFinancialInfo: true,
      canEditVendorInfo: true,
      canPerformBulkActions: true
    },
    
    'System Administrator': {
      widgetAccess: { 
        myPending: true, 
        allDocuments: true, 
        readyForProcessing: true 
      },
      visibilitySetting: 'organization',
      assignedWorkflowStages: ['all'],
      canViewFinancialInfo: true,
      canEditVendorInfo: true,
      canPerformBulkActions: true
    }
  };
  
  static getRoleConfiguration(userRole: string): RoleConfiguration {
    return this.roleConfigurations[userRole] || this.roleConfigurations['Staff'];
  }
}
```

## 3. Field-Level Permission Patterns

### 3.1. Field Permission Matrix

**Implementation Pattern from PR Module:**
```typescript
interface FieldPermissionMatrix {
  [fieldName: string]: {
    [role: string]: 'edit' | 'view' | 'hidden';
  };
}

const fieldPermissions: FieldPermissionMatrix = {
  // Basic entity fields
  'refNumber': {
    'Staff': 'edit',
    'Department Manager': 'view',
    'Financial Manager': 'view',
    'Purchasing Staff': 'view',
    'System Administrator': 'edit'
  },
  
  'date': {
    'Staff': 'edit',
    'Department Manager': 'view',
    'Financial Manager': 'view',
    'Purchasing Staff': 'view',
    'System Administrator': 'edit'
  },
  
  'description': {
    'Staff': 'edit',
    'Department Manager': 'view',
    'Financial Manager': 'view',
    'Purchasing Staff': 'view',
    'System Administrator': 'edit'
  },
  
  // Financial fields
  'vendor': {
    'Staff': 'hidden',
    'Department Manager': 'view',
    'Financial Manager': 'view',
    'Purchasing Staff': 'edit',
    'System Administrator': 'edit'
  },
  
  'price': {
    'Staff': 'hidden',
    'Department Manager': 'view',
    'Financial Manager': 'view',
    'Purchasing Staff': 'edit',
    'System Administrator': 'edit'
  },
  
  'totalAmount': {
    'Staff': 'hidden',
    'Department Manager': 'view',
    'Financial Manager': 'view',
    'Purchasing Staff': 'view',
    'System Administrator': 'view'
  },
  
  // Business dimension fields
  'jobCode': {
    'Staff': 'edit',
    'Department Manager': 'edit',
    'Financial Manager': 'edit',
    'Purchasing Staff': 'view',
    'System Administrator': 'edit'
  },
  
  'project': {
    'Staff': 'edit',
    'Department Manager': 'edit',
    'Financial Manager': 'edit',
    'Purchasing Staff': 'view',
    'System Administrator': 'edit'
  }
};

// Utility functions
export const canEditField = (fieldName: string, userRole: string): boolean => {
  return fieldPermissions[fieldName]?.[userRole] === 'edit';
};

export const canViewField = (fieldName: string, userRole: string): boolean => {
  const permission = fieldPermissions[fieldName]?.[userRole];
  return permission === 'edit' || permission === 'view';
};

export const getFieldPermission = (fieldName: string, userRole: string): string => {
  return fieldPermissions[fieldName]?.[userRole] || 'hidden';
};
```

### 3.2. Dynamic Field Renderer Pattern

**RBAC-Aware Component Implementation:**
```typescript
interface FieldRendererProps<T = string> {
  name: string;
  label: string;
  value: T;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  mode: 'view' | 'edit';
  userRole: string;
  onChange?: (value: T) => void;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const RBACFieldRenderer = <T extends string | number | Date>({
  name, label, value, type = 'text', options, mode, userRole, onChange, required, icon: Icon
}: FieldRendererProps<T>) => {
  const canEdit = canEditField(name, userRole) && mode === 'edit';
  const canView = canViewField(name, userRole);
  
  // Field not visible to this role
  if (!canView) {
    return null;
  }
  
  const labelElement = (
    <Label htmlFor={name} className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
  );
  
  // Editable field
  if (canEdit) {
    return (
      <div className="space-y-2">
        {labelElement}
        {renderEditableField({ name, type, value, options, onChange })}
      </div>
    );
  }
  
  // Read-only field
  return (
    <div className="space-y-2">
      {labelElement}
      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md min-h-[40px] flex items-center">
        {formatValue(value, type)}
      </div>
    </div>
  );
};

const renderEditableField = ({ name, type, value, options, onChange }) => {
  switch (type) {
    case 'select':
      return (
        <Select value={String(value)} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${name}`} />
          </SelectTrigger>
          <SelectContent>
            {options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'textarea':
      return (
        <Textarea
          id={name}
          value={String(value)}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-h-[60px]"
        />
      );
      
    case 'date':
      return (
        <Input
          id={name}
          type="date"
          value={value instanceof Date ? value.toISOString().split('T')[0] : String(value)}
          onChange={(e) => onChange?.(e.target.value)}
        />
      );
      
    default:
      return (
        <Input
          id={name}
          type={type}
          value={String(value)}
          onChange={(e) => onChange?.(e.target.value)}
        />
      );
  }
};
```

## 4. Widget-Based Access Control

### 4.1. Widget Access Pattern

**Dynamic UI Sections Based on Role:**
```typescript
interface WidgetAccessController {
  getVisibleWidgets(userRole: string): string[];
  getWidgetConfiguration(userRole: string, widget: string): WidgetConfig;
  hasWidgetAccess(userRole: string, widget: string): boolean;
}

interface WidgetConfig {
  key: string;
  label: string;
  description: string;
  scope: 'self' | 'department' | 'organization';
  defaultFilters?: Record<string, any>;
  availableActions?: string[];
}

class WidgetAccessService {
  private static widgetConfigurations: Record<string, Record<string, WidgetConfig>> = {
    'Staff': {
      'myPending': {
        key: 'myPending',
        label: 'My Pending',
        description: 'View your own pending documents',
        scope: 'self',
        defaultFilters: { requestorId: '{currentUserId}' },
        availableActions: ['view', 'edit', 'delete']
      }
    },
    
    'Department Manager': {
      'myPending': {
        key: 'myPending',
        label: 'My Pending',
        description: 'View your own pending documents',
        scope: 'self',
        defaultFilters: { requestorId: '{currentUserId}' },
        availableActions: ['view', 'edit', 'delete']
      },
      
      'allDocuments': {
        key: 'allDocuments',
        label: 'Department Documents',
        description: 'View all department documents requiring approval',
        scope: 'department',
        defaultFilters: { department: '{currentUserDepartment}' },
        availableActions: ['view', 'approve', 'reject', 'return']
      }
    },
    
    'Financial Manager': {
      'myPending': {
        key: 'myPending',
        label: 'My Created',
        description: 'Documents you created',
        scope: 'self',
        defaultFilters: { requestorId: '{currentUserId}' },
        availableActions: ['view']
      },
      
      'allDocuments': {
        key: 'allDocuments',
        label: 'All Documents',
        description: 'Organization-wide document visibility',
        scope: 'organization',
        defaultFilters: {},
        availableActions: ['view', 'approve', 'reject', 'return']
      }
    },
    
    'Purchasing Staff': {
      'myPending': {
        key: 'myPending',
        label: 'My Created',
        description: 'Documents you created',
        scope: 'self',
        defaultFilters: { requestorId: '{currentUserId}' },
        availableActions: ['view']
      },
      
      'allDocuments': {
        key: 'allDocuments',
        label: 'All Documents',
        description: 'Organization-wide document visibility',
        scope: 'organization',
        defaultFilters: {},
        availableActions: ['view', 'process']
      },
      
      'readyForProcessing': {
        key: 'readyForProcessing',
        label: 'Ready for PO',
        description: 'Approved documents ready for procurement',
        scope: 'organization',
        defaultFilters: { status: 'approved', stage: 'purchasingProcessing' },
        availableActions: ['view', 'process', 'createPO']
      }
    }
  };
  
  static getVisibleWidgets(userRole: string): string[] {
    return Object.keys(this.widgetConfigurations[userRole] || {});
  }
  
  static getWidgetConfiguration(userRole: string, widget: string): WidgetConfig | null {
    return this.widgetConfigurations[userRole]?.[widget] || null;
  }
  
  static hasWidgetAccess(userRole: string, widget: string): boolean {
    return !!this.widgetConfigurations[userRole]?.[widget];
  }
}
```

### 4.2. Widget-Based Filter Bar Implementation

```typescript
interface RBACFilterBarProps {
  userRole: string;
  onFilterChange: (filters: FilterState) => void;
  defaultWidget?: string;
}

const RBACFilterBar: React.FC<RBACFilterBarProps> = ({ 
  userRole, onFilterChange, defaultWidget 
}) => {
  const availableWidgets = WidgetAccessService.getVisibleWidgets(userRole);
  const [activeWidget, setActiveWidget] = useState(
    defaultWidget || availableWidgets[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentWidgetConfig = WidgetAccessService.getWidgetConfiguration(userRole, activeWidget);
  
  useEffect(() => {
    if (currentWidgetConfig) {
      // Apply default filters for the selected widget
      onFilterChange({
        widget: activeWidget,
        search: searchTerm,
        defaults: currentWidgetConfig.defaultFilters
      });
    }
  }, [activeWidget, searchTerm, currentWidgetConfig, onFilterChange]);
  
  return (
    <div className="space-y-4">
      {/* Widget Toggle Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {availableWidgets.map(widget => {
          const config = WidgetAccessService.getWidgetConfiguration(userRole, widget);
          return (
            <Button
              key={widget}
              variant={activeWidget === widget ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveWidget(widget)}
              className="h-8"
            >
              {config?.label}
            </Button>
          );
        })}
      </div>
      
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <AdvancedFilterButton userRole={userRole} activeWidget={activeWidget} />
      </div>
    </div>
  );
};
```

## 5. Workflow-Based Permissions

### 5.1. Workflow Permission Engine

```typescript
interface WorkflowPermissionEngine {
  canPerformWorkflowAction(
    user: User, 
    entity: any, 
    action: WorkflowAction
  ): boolean;
  
  getAvailableWorkflowActions(
    user: User, 
    entity: any
  ): WorkflowAction[];
  
  getNextWorkflowStage(
    currentStage: string, 
    action: WorkflowAction, 
    context: any
  ): string;
}

enum WorkflowAction {
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  RETURN = 'return',
  EDIT = 'edit',
  DELETE = 'delete'
}

class WorkflowRBACService {
  static canPerformWorkflowAction(
    user: User, 
    entity: any, 
    action: WorkflowAction
  ): boolean {
    // Admin can do everything
    if (user.role === 'System Administrator') {
      return true;
    }
    
    switch (action) {
      case WorkflowAction.SUBMIT:
        return entity.requestorId === user.id && entity.status === 'draft';
        
      case WorkflowAction.EDIT:
        return entity.requestorId === user.id && 
               ['draft', 'rejected'].includes(entity.status);
        
      case WorkflowAction.DELETE:
        return entity.requestorId === user.id && entity.status === 'draft';
        
      case WorkflowAction.APPROVE:
      case WorkflowAction.REJECT:
      case WorkflowAction.RETURN:
        return this.canApproveAtCurrentStage(user, entity);
        
      default:
        return false;
    }
  }
  
  private static canApproveAtCurrentStage(user: User, entity: any): boolean {
    const roleConfig = RBACConfigurationService.getRoleConfiguration(user.role);
    
    // Check if user is assigned to current workflow stage
    return roleConfig.assignedWorkflowStages?.includes(entity.currentWorkflowStage) ||
           roleConfig.assignedWorkflowStages?.includes('all');
  }
  
  static getAvailableWorkflowActions(user: User, entity: any): WorkflowAction[] {
    const actions: WorkflowAction[] = [];
    
    Object.values(WorkflowAction).forEach(action => {
      if (this.canPerformWorkflowAction(user, entity, action)) {
        actions.push(action);
      }
    });
    
    return actions;
  }
  
  static getWorkflowActionButtons(user: User, entity: any) {
    const availableActions = this.getAvailableWorkflowActions(user, entity);
    
    const buttonConfigs = {
      [WorkflowAction.APPROVE]: {
        label: 'Approve',
        icon: 'CheckCircle',
        variant: 'default' as const,
        className: 'bg-green-600 hover:bg-green-700'
      },
      [WorkflowAction.REJECT]: {
        label: 'Reject',
        icon: 'XCircle',
        variant: 'destructive' as const
      },
      [WorkflowAction.RETURN]: {
        label: 'Send Back',
        icon: 'RotateCcw',
        variant: 'outline' as const,
        className: 'text-orange-600 border-orange-600 hover:bg-orange-50'
      },
      [WorkflowAction.EDIT]: {
        label: 'Edit',
        icon: 'Edit',
        variant: 'outline' as const
      },
      [WorkflowAction.DELETE]: {
        label: 'Delete',
        icon: 'Trash',
        variant: 'destructive' as const
      },
      [WorkflowAction.SUBMIT]: {
        label: 'Submit',
        icon: 'Send',
        variant: 'default' as const
      }
    };
    
    return availableActions.map(action => ({
      action,
      ...buttonConfigs[action]
    }));
  }
}
```

### 5.2. Smart Workflow Decision Engine

```typescript
interface WorkflowDecision {
  canSubmit: boolean;
  action: 'approve' | 'reject' | 'return' | 'blocked';
  buttonText: string;
  buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary';
  buttonColor?: string;
  reason: string;
  itemsSummary?: {
    approved: number;
    rejected: number;
    review: number;
    pending: number;
    total: number;
  };
}

class WorkflowDecisionEngine {
  static analyzeWorkflowState(items: any[]): WorkflowDecision {
    const summary = this.getItemsSummary(items);
    
    // Priority 1: All items rejected
    if (summary.rejected === summary.total && summary.total > 0) {
      return {
        canSubmit: true,
        action: 'reject',
        buttonText: 'Submit & Reject',
        buttonVariant: 'destructive',
        reason: 'All items have been rejected',
        itemsSummary: summary
      };
    }
    
    // Priority 2: Any items marked for review
    if (summary.review > 0) {
      return {
        canSubmit: true,
        action: 'return',
        buttonText: 'Submit & Return',
        buttonVariant: 'outline',
        buttonColor: 'text-orange-600 border-orange-600 hover:bg-orange-50',
        reason: `${summary.review} item(s) marked for review`,
        itemsSummary: summary
      };
    }
    
    // Priority 3: Any items still pending (blocks submission)
    if (summary.pending > 0) {
      return {
        canSubmit: false,
        action: 'blocked',
        buttonText: 'Review Required',
        buttonVariant: 'secondary',
        reason: `${summary.pending} item(s) still pending review`,
        itemsSummary: summary
      };
    }
    
    // Priority 4: Any items approved (can proceed)
    if (summary.approved > 0) {
      return {
        canSubmit: true,
        action: 'approve',
        buttonText: 'Submit & Approve',
        buttonVariant: 'default',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        reason: `${summary.approved} item(s) approved for processing`,
        itemsSummary: summary
      };
    }
    
    // Default: No items
    return {
      canSubmit: false,
      action: 'blocked',
      buttonText: 'No Items',
      buttonVariant: 'secondary',
      reason: 'No items available for approval',
      itemsSummary: summary
    };
  }
  
  private static getItemsSummary(items: any[]) {
    return items.reduce((summary, item) => {
      switch (item.status) {
        case 'approved':
          summary.approved++;
          break;
        case 'rejected':
          summary.rejected++;
          break;
        case 'review':
          summary.review++;
          break;
        default:
          summary.pending++;
          break;
      }
      return summary;
    }, {
      approved: 0,
      rejected: 0,
      review: 0,
      pending: 0,
      total: items.length
    });
  }
}
```

## 6. Section-Based Content Control

### 6.1. Progressive Disclosure Pattern

```typescript
interface SectionVisibilityConfig {
  [sectionName: string]: {
    [role: string]: 'visible' | 'hidden' | 'collapsed';
  };
}

const sectionVisibility: SectionVisibilityConfig = {
  'basicInformation': {
    'Staff': 'visible',
    'Department Manager': 'visible',
    'Financial Manager': 'visible',
    'Purchasing Staff': 'visible',
    'System Administrator': 'visible'
  },
  
  'inventoryInformation': {
    'Staff': 'visible',
    'Department Manager': 'visible',
    'Financial Manager': 'visible',
    'Purchasing Staff': 'visible',
    'System Administrator': 'visible'
  },
  
  'businessDimensions': {
    'Staff': 'visible',
    'Department Manager': 'visible',
    'Financial Manager': 'visible',
    'Purchasing Staff': 'collapsed',
    'System Administrator': 'visible'
  },
  
  'vendorPricing': {
    'Staff': 'hidden',
    'Department Manager': 'collapsed',
    'Financial Manager': 'collapsed',
    'Purchasing Staff': 'visible',
    'System Administrator': 'visible'
  },
  
  'taxDiscountOverrides': {
    'Staff': 'hidden',
    'Department Manager': 'hidden',
    'Financial Manager': 'hidden',
    'Purchasing Staff': 'visible',
    'System Administrator': 'visible'
  },
  
  'transactionSummary': {
    'Staff': 'hidden',
    'Department Manager': 'visible',
    'Financial Manager': 'visible',
    'Purchasing Staff': 'visible',
    'System Administrator': 'visible'
  }
};

const RBACSection: React.FC<{
  sectionName: string;
  userRole: string;
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}> = ({ sectionName, userRole, title, children, defaultCollapsed = false }) => {
  const visibility = sectionVisibility[sectionName]?.[userRole] || 'hidden';
  const [isCollapsed, setIsCollapsed] = useState(
    defaultCollapsed || visibility === 'collapsed'
  );
  
  if (visibility === 'hidden') {
    return null;
  }
  
  const isCollapsible = visibility === 'collapsed' || visibility === 'visible';
  
  return (
    <Card className="shadow-sm">
      <CardHeader 
        className={cn(
          "pb-3",
          isCollapsible && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={isCollapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <CardTitle className="text-base font-medium flex items-center justify-between">
          {title}
          {isCollapsible && (
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          )}
        </CardTitle>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};
```

## 7. Bulk Operations RBAC

### 7.1. Role-Based Bulk Actions

```typescript
interface BulkActionConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive' | 'outline';
  requiredRoles: string[];
  requiredPermissions?: string[];
  itemStatusFilter?: string[];
  confirmationRequired: boolean;
}

const bulkActionConfigurations: BulkActionConfig[] = [
  {
    key: 'approve',
    label: 'Approve Selected',
    icon: CheckCircle,
    variant: 'default',
    requiredRoles: ['Department Manager', 'Financial Manager', 'Purchasing Staff', 'System Administrator'],
    itemStatusFilter: ['pending', 'review'],
    confirmationRequired: true
  },
  
  {
    key: 'reject',
    label: 'Reject Selected',
    icon: XCircle,
    variant: 'destructive',
    requiredRoles: ['Department Manager', 'Financial Manager', 'Purchasing Staff', 'System Administrator'],
    itemStatusFilter: ['pending', 'review'],
    confirmationRequired: true
  },
  
  {
    key: 'delete',
    label: 'Delete Selected',
    icon: Trash,
    variant: 'destructive',
    requiredRoles: ['Staff', 'System Administrator'],
    itemStatusFilter: ['draft'],
    confirmationRequired: true
  },
  
  {
    key: 'export',
    label: 'Export Selected',
    icon: Download,
    variant: 'outline',
    requiredRoles: ['all'],
    confirmationRequired: false
  }
];

const BulkActionBar: React.FC<{
  selectedItems: any[];
  userRole: string;
  onAction: (action: string, items: any[]) => void;
}> = ({ selectedItems, userRole, onAction }) => {
  const availableActions = bulkActionConfigurations.filter(action => 
    action.requiredRoles.includes('all') || action.requiredRoles.includes(userRole)
  );
  
  const getApplicableItems = (action: BulkActionConfig) => {
    if (!action.itemStatusFilter) {
      return selectedItems;
    }
    
    return selectedItems.filter(item => 
      action.itemStatusFilter!.includes(item.status)
    );
  };
  
  if (selectedItems.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedItems.length} item(s) selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {availableActions.map(action => {
            const applicableItems = getApplicableItems(action);
            const isDisabled = applicableItems.length === 0;
            
            return (
              <Button
                key={action.key}
                variant={action.variant}
                size="sm"
                disabled={isDisabled}
                onClick={() => onAction(action.key, applicableItems)}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label} ({applicableItems.length})
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

## 8. Context-Aware UI Components

### 8.1. RBAC Higher-Order Component

```typescript
interface RBACProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  entityContext?: any;
  fallback?: ReactNode;
  user: User;
}

const withRBAC = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & RBACProps>((props, ref) => {
    const { 
      children, 
      requiredRoles, 
      requiredPermissions, 
      entityContext, 
      fallback, 
      user, 
      ...restProps 
    } = props;
    
    // Check role-based access
    const hasRoleAccess = !requiredRoles || requiredRoles.some(role => 
      user.roles?.includes(role) || role === 'all'
    );
    
    // Check permission-based access
    const hasPermissionAccess = !requiredPermissions || requiredPermissions.every(permission =>
      user.permissions?.includes(permission)
    );
    
    // Check context-based access (e.g., ownership, workflow stage)
    const hasContextAccess = !entityContext || 
      RBACService.canAccessEntity(user, entityContext);
    
    if (!hasRoleAccess || !hasPermissionAccess || !hasContextAccess) {
      return fallback ? <>{fallback}</> : null;
    }
    
    return <WrappedComponent {...restProps as P} ref={ref} />;
  });
};

// Usage examples
const ProtectedFinancialSection = withRBAC(FinancialSummaryCard);
const ProtectedActionButton = withRBAC(Button);

// In component
<ProtectedFinancialSection
  requiredRoles={['Department Manager', 'Financial Manager', 'Purchasing Staff']}
  user={user}
  fallback={<div className="text-muted-foreground">Financial information not available</div>}
>
  <FinancialData />
</ProtectedFinancialSection>
```

### 8.2. Context-Aware Action Buttons

```typescript
interface SmartActionButtonProps {
  entity: any;
  user: User;
  action: string;
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onAction?: (action: string, entity: any) => void;
}

const SmartActionButton: React.FC<SmartActionButtonProps> = ({
  entity, user, action, children, variant = 'default', size = 'default', 
  className, onAction, ...props
}) => {
  const canPerformAction = WorkflowRBACService.canPerformWorkflowAction(
    user, entity, action as WorkflowAction
  );
  
  if (!canPerformAction) {
    return null;
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => onAction?.(action, entity)}
      {...props}
    >
      {children}
    </Button>
  );
};

// Usage
<SmartActionButton
  entity={purchaseRequest}
  user={currentUser}
  action="approve"
  onAction={handleWorkflowAction}
>
  <CheckCircle className="mr-2 h-4 w-4" />
  Approve
</SmartActionButton>
```

## 9. Testing RBAC Implementation

### 9.1. RBAC Test Patterns

```typescript
describe('RBAC Implementation', () => {
  const mockUsers = {
    staff: { id: '1', role: 'Staff', department: 'Kitchen' },
    deptManager: { id: '2', role: 'Department Manager', department: 'Kitchen' },
    finManager: { id: '3', role: 'Financial Manager', department: 'Finance' },
    purchaser: { id: '4', role: 'Purchasing Staff', department: 'Procurement' },
    admin: { id: '5', role: 'System Administrator', department: 'IT' }
  };
  
  const mockEntity = {
    id: 'pr-001',
    requestorId: '1',
    status: 'pending',
    currentWorkflowStage: 'departmentApproval'
  };
  
  describe('Field-Level Permissions', () => {
    test('Staff can edit basic fields but not financial fields', () => {
      expect(canEditField('description', 'Staff')).toBe(true);
      expect(canEditField('vendor', 'Staff')).toBe(false);
      expect(canViewField('vendor', 'Staff')).toBe(false);
    });
    
    test('Department Manager can view but not edit financial fields', () => {
      expect(canViewField('vendor', 'Department Manager')).toBe(true);
      expect(canEditField('vendor', 'Department Manager')).toBe(false);
    });
    
    test('Purchasing Staff can edit vendor fields', () => {
      expect(canEditField('vendor', 'Purchasing Staff')).toBe(true);
      expect(canEditField('price', 'Purchasing Staff')).toBe(true);
    });
  });
  
  describe('Widget Access Control', () => {
    test('Staff only has access to myPending widget', () => {
      const widgets = WidgetAccessService.getVisibleWidgets('Staff');
      expect(widgets).toEqual(['myPending']);
    });
    
    test('Department Manager has access to myPending and allDocuments', () => {
      const widgets = WidgetAccessService.getVisibleWidgets('Department Manager');
      expect(widgets).toContain('myPending');
      expect(widgets).toContain('allDocuments');
    });
    
    test('Purchasing Staff has access to readyForProcessing widget', () => {
      const widgets = WidgetAccessService.getVisibleWidgets('Purchasing Staff');
      expect(widgets).toContain('readyForProcessing');
    });
  });
  
  describe('Workflow Permissions', () => {
    test('Staff can only edit their own drafts', () => {
      const draftEntity = { ...mockEntity, status: 'draft', requestorId: '1' };
      expect(WorkflowRBACService.canPerformWorkflowAction(
        mockUsers.staff, draftEntity, WorkflowAction.EDIT
      )).toBe(true);
      
      const otherUserEntity = { ...mockEntity, status: 'draft', requestorId: '2' };
      expect(WorkflowRBACService.canPerformWorkflowAction(
        mockUsers.staff, otherUserEntity, WorkflowAction.EDIT
      )).toBe(false);
    });
    
    test('Department Manager can approve at department stage', () => {
      const entityAtDeptStage = { 
        ...mockEntity, 
        currentWorkflowStage: 'departmentApproval' 
      };
      expect(WorkflowRBACService.canPerformWorkflowAction(
        mockUsers.deptManager, entityAtDeptStage, WorkflowAction.APPROVE
      )).toBe(true);
    });
    
    test('Financial Manager cannot approve at department stage', () => {
      const entityAtDeptStage = { 
        ...mockEntity, 
        currentWorkflowStage: 'departmentApproval' 
      };
      expect(WorkflowRBACService.canPerformWorkflowAction(
        mockUsers.finManager, entityAtDeptStage, WorkflowAction.APPROVE
      )).toBe(false);
    });
  });
  
  describe('Component Rendering', () => {
    test('Financial section hidden from Staff', () => {
      const { container } = render(
        <RBACSection 
          sectionName="transactionSummary" 
          userRole="Staff" 
          title="Financial Summary"
        >
          <div>Financial content</div>
        </RBACSection>
      );
      expect(container.firstChild).toBeNull();
    });
    
    test('Financial section visible to Department Manager', () => {
      const { getByText } = render(
        <RBACSection 
          sectionName="transactionSummary" 
          userRole="Department Manager" 
          title="Financial Summary"
        >
          <div>Financial content</div>
        </RBACSection>
      );
      expect(getByText('Financial Summary')).toBeInTheDocument();
    });
  });
});
```

## 10. Implementation Guidelines

### 10.1. Setup Checklist

**Initial RBAC Setup:**
- [ ] Define role hierarchy and configurations
- [ ] Create field permission matrix
- [ ] Implement widget access control system
- [ ] Set up workflow permission engine
- [ ] Create RBAC-aware components
- [ ] Implement section visibility controls
- [ ] Add bulk operations with role filtering
- [ ] Create comprehensive test suite

**Security Considerations:**
- [ ] Server-side permission validation
- [ ] Input sanitization and validation
- [ ] Audit logging for permission changes
- [ ] Session management and timeout
- [ ] Cross-site scripting (XSS) protection
- [ ] SQL injection prevention

### 10.2. Best Practices

**Development Guidelines:**
1. **Always check permissions server-side** - Client-side RBAC is for UX only
2. **Use consistent permission patterns** - Follow established field and action patterns
3. **Implement progressive disclosure** - Show information based on role hierarchy
4. **Provide clear fallbacks** - Always have appropriate fallback UI for denied access
5. **Test all role combinations** - Comprehensive testing across all user roles
6. **Document permission logic** - Clear documentation of why specific permissions exist
7. **Audit permission changes** - Log all permission-related modifications

**Performance Optimization:**
1. **Cache permission checks** - Avoid repeated permission calculations
2. **Lazy load protected content** - Only load content the user can access
3. **Optimize widget queries** - Filter data based on user scope at query level
4. **Batch permission checks** - Group multiple permission checks when possible

This RBAC implementation guide provides a comprehensive foundation for building secure, role-aware interfaces across the Carmen ERP system, based on the proven patterns from the Purchase Request module.