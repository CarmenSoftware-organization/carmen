# Purchase Request Module: UI Design Guide & Implementation Patterns

**Document Version**: 1.0  
**Created**: January 2025  
**Based on**: Purchase Request Production Implementation  

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This guide extracts proven UI design patterns, component structures, and implementation flows from the Purchase Request module to serve as a reference for implementing other modules in the Carmen ERP system.

## 1. Overview: Design System Foundation

### 1.1. Architectural Principles

The Purchase Request module demonstrates the following core design principles that should be applied across all modules:

- **Role-Based Progressive Disclosure**: Information and actions adapt dynamically based on user permissions
- **Context-Aware Interfaces**: UI components respond intelligently to workflow states and user context
- **Responsive-First Design**: Mobile-first approach with graceful enhancement for larger screens
- **Accessibility by Default**: WCAG 2.1 AA compliance built into all components
- **Performance-Optimized**: Lazy loading, virtualization, and optimistic updates

### 1.2. Technical Stack Integration

**Framework Foundation:**
- Next.js 14 App Router with TypeScript
- Shadcn/ui + Radix UI primitives
- Tailwind CSS with custom design tokens
- React Hook Form + Zod validation
- Zustand for state management

**Key Libraries:**
- `@radix-ui/react-*` for accessible primitives
- `lucide-react` for consistent iconography
- `date-fns` for date manipulation
- `clsx` and `cn` utility for conditional styling

## 2. List Page Pattern

The PR List demonstrates the standard list page pattern that should be applied to all modules.

### 2.1. Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header Section (Actions + View Controls)                   │
├─────────────────────────────────────────────────────────────┤
│ Filter Bar (Search + RBAC Widgets + Advanced Filters)      │
├─────────────────────────────────────────────────────────────┤
│ Bulk Actions Bar (Contextual, Selection-Driven)            │
├─────────────────────────────────────────────────────────────┤
│ Data Display (Table/Grid Toggle with Pagination)           │
├─────────────────────────────────────────────────────────────┤
│ Footer (Pagination + Summary Statistics)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Header Section Pattern

**Component Structure:**
```typescript
interface ModuleHeaderProps {
  title: string;
  createAction?: CreateActionConfig;
  exportActions?: ExportConfig[];
  viewControls?: ViewControlConfig;
  userRole: string;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({ 
  title, createAction, exportActions, viewControls, userRole 
}) => {
  const availableActions = getHeaderActions(userRole);
  
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">Module overview and management</p>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {availableActions.create && (
          <Button onClick={createAction?.handler} size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            {createAction?.label || 'New'}
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {exportActions?.map(action => (
              <DropdownMenuItem key={action.format} onClick={action.handler}>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {viewControls && (
          <ToggleGroup type="single" value={viewControls.current} onValueChange={viewControls.onChange}>
            <ToggleGroupItem value="table" aria-label="Table view">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <GridIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>
    </div>
  );
};
```

### 2.3. RBAC Widget Filter Pattern

**Dynamic Filter System:**
```typescript
interface RBACWidgetConfig {
  available: string[];
  default: string;
  labels: Record<string, string>;
  scope: 'self' | 'department' | 'businessUnit';
}

const RBACFilterBar: React.FC<{ userRole: string, onFilterChange: (filter: FilterState) => void }> = ({ 
  userRole, onFilterChange 
}) => {
  const widgetConfig = getRoleWidgetConfiguration(userRole);
  const [activeWidget, setActiveWidget] = useState(widgetConfig.default);
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="space-y-4">
      {/* Primary Widget Toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        {widgetConfig.available.map(widget => (
          <Button
            key={widget}
            variant={activeWidget === widget ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveWidget(widget)}
            className="h-8"
          >
            {widgetConfig.labels[widget]}
          </Button>
        ))}
      </div>
      
      {/* Search and Advanced Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <AdvancedFilterButton userRole={userRole} />
      </div>
      
      {/* Secondary Filters (Context-sensitive) */}
      <SecondaryFilters activeWidget={activeWidget} userRole={userRole} />
    </div>
  );
};
```

### 2.4. Data Display Pattern

**Responsive Table/Grid Toggle:**
```typescript
interface DataDisplayProps<T> {
  data: T[];
  viewMode: 'table' | 'grid';
  columns: ColumnConfig<T>[];
  onItemAction: (action: string, item: T) => void;
  userRole: string;
  loading?: boolean;
}

const DataDisplay = <T extends BaseEntity>({ 
  data, viewMode, columns, onItemAction, userRole, loading 
}: DataDisplayProps<T>) => {
  if (loading) {
    return <DataSkeleton viewMode={viewMode} />;
  }
  
  if (data.length === 0) {
    return <EmptyState />;
  }
  
  return viewMode === 'table' ? (
    <DataTable 
      data={data}
      columns={columns}
      onAction={onItemAction}
      userRole={userRole}
    />
  ) : (
    <DataGrid
      data={data}
      onAction={onItemAction}
      userRole={userRole}
    />
  );
};
```

## 3. Detail Page Pattern

The PR Detail page establishes the standard pattern for detail/form pages across all modules.

### 3.1. Two-Column Layout with Collapsible Sidebar

**Layout Structure:**
```typescript
interface DetailPageLayoutProps {
  header: ReactNode;
  mainContent: ReactNode;
  sidebarContent?: ReactNode;
  floatingActions?: ReactNode;
  user: User;
}

const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  header, mainContent, sidebarContent, floatingActions, user
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  
  return (
    <div className="container mx-auto py-6 pb-32">
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Main Content */}
        <div className={cn(
          'flex-grow space-y-6',
          isSidebarVisible ? 'lg:w-3/4' : 'w-full'
        )}>
          {header}
          {mainContent}
        </div>
        
        {/* Collapsible Sidebar */}
        {sidebarContent && (
          <div className={cn(
            'space-y-6 transition-all duration-300',
            isSidebarVisible ? 'lg:w-1/4' : 'w-0 opacity-0 overflow-hidden'
          )}>
            {sidebarContent}
          </div>
        )}
      </div>
      
      {/* Floating Actions */}
      {floatingActions}
    </div>
  );
};
```

### 3.2. Header Card Pattern

**Dynamic Header with Actions:**
```typescript
interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  mode: 'view' | 'edit' | 'add';
  onModeChange: (mode: 'view' | 'edit') => void;
  onSave?: () => void;
  onCancel?: () => void;
  userRole: string;
  sidebarToggle?: {
    visible: boolean;
    onToggle: () => void;
  };
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  title, subtitle, status, mode, onModeChange, onSave, onCancel, userRole, sidebarToggle
}) => {
  const hasEditPermissions = getFieldPermissions(userRole);
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b bg-muted/10">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <BackButton />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
              {status}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Mode-specific actions */}
            {mode === "view" ? (
              hasEditPermissions && (
                <Button onClick={() => onModeChange("edit")} size="sm" className="h-9">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )
            ) : (
              <>
                <Button variant="default" onClick={onSave} size="sm" className="h-9">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={onCancel} size="sm" className="h-9">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            
            {/* Standard actions */}
            <ActionButtons userRole={userRole} />
            
            {/* Sidebar toggle */}
            {sidebarToggle && (
              <SidebarToggleButton 
                visible={sidebarToggle.visible}
                onToggle={sidebarToggle.onToggle}
              />
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
```

### 3.3. Form Field Pattern with RBAC

**Intelligent Field Rendering:**
```typescript
interface FieldProps<T = string> {
  name: keyof FormData;
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

const FormField = <T extends string | number | Date>({
  name, label, value, type = 'text', options, mode, userRole, onChange, required, icon: Icon
}: FieldProps<T>) => {
  const canEdit = canEditField(name, userRole) && mode === 'edit';
  const canView = canViewField(name, userRole);
  
  if (!canView) return null;
  
  const labelElement = (
    <Label htmlFor={name} className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
  );
  
  if (canEdit) {
    return (
      <div className="space-y-2">
        {labelElement}
        {type === 'select' ? (
          <Select value={String(value)} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === 'textarea' ? (
          <Textarea
            id={String(name)}
            value={String(value)}
            onChange={(e) => onChange?.(e.target.value as T)}
            className="min-h-[60px]"
          />
        ) : (
          <Input
            id={String(name)}
            type={type}
            value={String(value)}
            onChange={(e) => onChange?.(e.target.value as T)}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {labelElement}
      <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md">
        {formatValue(value, type)}
      </div>
    </div>
  );
};
```

### 3.4. Tabbed Content Pattern

**Responsive Tab System:**
```typescript
interface TabConfig {
  key: string;
  label: string;
  badge?: number;
  content: ReactNode;
  userRole?: string[];
}

interface TabbedContentProps {
  tabs: TabConfig[];
  userRole: string;
  mode: 'view' | 'edit';
}

const TabbedContent: React.FC<TabbedContentProps> = ({ tabs, userRole, mode }) => {
  const accessibleTabs = tabs.filter(tab => 
    !tab.userRole || tab.userRole.includes(userRole)
  );
  
  return (
    <Card className="shadow-sm">
      <Tabs defaultValue={accessibleTabs[0]?.key} className="w-full">
        <CardHeader className="pb-0 pt-4 px-4">
          <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${accessibleTabs.length}, 1fr)` }}>
            {accessibleTabs.map(tab => (
              <TabsTrigger 
                key={tab.key}
                value={tab.key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <Badge variant="secondary" className="ml-2">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="w-full rounded-b-md border-t">
            <div className="p-6">
              {accessibleTabs.map(tab => (
                <TabsContent key={tab.key} value={tab.key} className="mt-0">
                  {tab.content}
                </TabsContent>
              ))}
            </div>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  );
};
```

## 4. Component Patterns

### 4.1. Status Badge System

**Consistent Status Representation:**
```typescript
interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  description?: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-800',
    description: 'Document is being prepared'
  },
  submitted: {
    label: 'Submitted',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800',
    description: 'Awaiting approval'
  },
  approved: {
    label: 'Approved',
    variant: 'default',
    className: 'bg-green-100 text-green-800',
    description: 'Approved and ready'
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800',
    description: 'Rejected with comments'
  }
};

const StatusBadge: React.FC<{ 
  status: string; 
  className?: string; 
  showTooltip?: boolean 
}> = ({ status, className, showTooltip = true }) => {
  const config = statusConfigs[status] || statusConfigs.draft;
  
  const badge = (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
  
  return showTooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>{config.description}</TooltipContent>
    </Tooltip>
  ) : badge;
};
```

### 4.2. RBAC HOC Pattern

**Role-Based Component Wrapper:**
```typescript
interface RBACWrapperProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  user: User;
}

const RBACWrapper: React.FC<RBACWrapperProps> = ({
  children, requiredRoles, requiredPermissions, fallback, user
}) => {
  const hasRoleAccess = !requiredRoles || requiredRoles.some(role => 
    user.roles?.includes(role)
  );
  
  const hasPermissionAccess = !requiredPermissions || requiredPermissions.every(permission =>
    user.permissions?.includes(permission)
  );
  
  if (!hasRoleAccess || !hasPermissionAccess) {
    return fallback || null;
  }
  
  return <>{children}</>;
};

// Usage example
<RBACWrapper requiredRoles={['Department Manager', 'Admin']} user={user}>
  <FinancialSummarySection />
</RBACWrapper>
```

### 4.3. Loading States Pattern

**Consistent Loading UI:**
```typescript
interface LoadingStateProps {
  variant: 'skeleton' | 'spinner' | 'pulse';
  count?: number;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ variant, count = 1, className }) => {
  switch (variant) {
    case 'skeleton':
      return (
        <div className={cn('space-y-3', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      );
      
    case 'spinner':
      return (
        <div className={cn('flex items-center justify-center p-8', className)}>
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
      
    case 'pulse':
      return (
        <div className={cn('animate-pulse bg-muted rounded h-20', className)} />
      );
      
    default:
      return null;
  }
};
```

### 4.4. Empty State Pattern

**Consistent Empty State UI:**
```typescript
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileX,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 text-center',
      className
    )}>
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
```

## 5. Workflow Patterns

### 5.1. Smart Action Buttons

**Context-Aware Action System:**
```typescript
interface WorkflowActionConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive' | 'outline';
  condition: (item: any, user: User) => boolean;
  handler: (item: any) => void;
}

const useWorkflowActions = (item: any, user: User): WorkflowActionConfig[] => {
  return useMemo(() => {
    const actions: WorkflowActionConfig[] = [
      {
        key: 'approve',
        label: 'Approve',
        icon: CheckCircle,
        variant: 'default',
        condition: (item, user) => 
          canPerformAction(user, item, 'approve') && item.status === 'pending',
        handler: (item) => handleApprove(item)
      },
      {
        key: 'reject',
        label: 'Reject',
        icon: XCircle,
        variant: 'destructive',
        condition: (item, user) => 
          canPerformAction(user, item, 'reject') && item.status === 'pending',
        handler: (item) => handleReject(item)
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: Edit,
        variant: 'outline',
        condition: (item, user) => 
          canPerformAction(user, item, 'edit') && ['draft', 'rejected'].includes(item.status),
        handler: (item) => handleEdit(item)
      }
    ];
    
    return actions.filter(action => action.condition(item, user));
  }, [item, user]);
};
```

### 5.2. Floating Action Menu

**Role-Based Floating Actions:**
```typescript
interface FloatingActionMenuProps {
  item: any;
  user: User;
  workflowDecision?: WorkflowDecision;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  item, user, workflowDecision
}) => {
  const actions = useWorkflowActions(item, user);
  
  if (actions.length === 0) return null;
  
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
      {/* Workflow Summary */}
      {workflowDecision && (
        <Card className="shadow-lg p-3 border">
          <div className="text-xs text-muted-foreground mb-1">Status</div>
          <div className="text-sm font-medium">
            {getWorkflowSummaryText(workflowDecision)}
          </div>
        </Card>
      )}
      
      {/* Action Buttons */}
      <Card className="shadow-xl p-4 flex space-x-3 border">
        {actions.map(action => (
          <Button
            key={action.key}
            onClick={() => action.handler(item)}
            variant={action.variant}
            size="sm"
            className="h-9"
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </Card>
    </div>
  );
};
```

## 6. Responsive Design Patterns

### 6.1. Breakpoint System

**Tailwind CSS Responsive Utilities:**
```typescript
const responsiveClasses = {
  // Mobile-first approach
  mobile: 'block',
  tablet: 'md:block',
  desktop: 'lg:block',
  
  // Layout adjustments
  mobileHidden: 'hidden md:block',
  desktopHidden: 'block md:hidden',
  
  // Grid systems
  mobileGrid: 'grid grid-cols-1',
  tabletGrid: 'grid grid-cols-1 md:grid-cols-2',
  desktopGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  
  // Typography
  mobileText: 'text-sm',
  desktopText: 'text-sm md:text-base',
  
  // Spacing
  mobileSpacing: 'p-4',
  responsiveSpacing: 'p-4 md:p-6 lg:p-8'
};
```

### 6.2. Mobile-First Component Pattern

**Responsive Component Design:**
```typescript
interface ResponsiveComponentProps {
  children: ReactNode;
  mobileLayout?: ReactNode;
  tabletLayout?: ReactNode;
  desktopLayout?: ReactNode;
}

const ResponsiveComponent: React.FC<ResponsiveComponentProps> = ({
  children,
  mobileLayout,
  tabletLayout,
  desktopLayout
}) => {
  return (
    <>
      {/* Mobile layout */}
      <div className="block md:hidden">
        {mobileLayout || children}
      </div>
      
      {/* Tablet layout */}
      <div className="hidden md:block lg:hidden">
        {tabletLayout || children}
      </div>
      
      {/* Desktop layout */}
      <div className="hidden lg:block">
        {desktopLayout || children}
      </div>
    </>
  );
};
```

## 7. Performance Patterns

### 7.1. Lazy Loading Pattern

**Component and Route Lazy Loading:**
```typescript
// Component lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));
const SidebarContent = lazy(() => import('./SidebarContent'));

// Usage with Suspense
<Suspense fallback={<LoadingState variant="skeleton" count={3} />}>
  <HeavyComponent />
</Suspense>

// Route lazy loading
const PRDetailPage = lazy(() => import('./pages/PRDetailPage'));
const PRListPage = lazy(() => import('./pages/PRListPage'));
```

### 7.2. Optimistic Updates Pattern

**Immediate UI Response:**
```typescript
const useOptimisticUpdate = <T>(
  updateFn: (data: T) => Promise<T>,
  onError?: (error: Error) => void
) => {
  const [optimisticState, setOptimisticState] = useState<T | null>(null);
  
  const update = async (data: T) => {
    // Apply optimistic update immediately
    setOptimisticState(data);
    
    try {
      const result = await updateFn(data);
      setOptimisticState(null);
      return result;
    } catch (error) {
      // Revert optimistic state
      setOptimisticState(null);
      onError?.(error as Error);
      throw error;
    }
  };
  
  return { update, optimisticState };
};
```

### 7.3. Virtual Scrolling Pattern

**Large List Optimization:**
```typescript
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactElement;
}

const VirtualizedList = <T,>({ 
  items, height, itemHeight, renderItem 
}: VirtualizedListProps<T>) => {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
      width="100%"
    >
      {renderItem}
    </List>
  );
};
```

## 8. Implementation Checklist

### 8.1. Module Setup Checklist

**Initial Setup:**
- [ ] Create module directory structure following Next.js App Router conventions
- [ ] Set up TypeScript interfaces in `/types/index.ts`
- [ ] Configure RBAC service with role definitions
- [ ] Create base components (List, Detail, Form)
- [ ] Implement responsive layout patterns
- [ ] Add accessibility attributes and ARIA labels
- [ ] Set up lazy loading for heavy components
- [ ] Configure error boundaries

**List Page Checklist:**
- [ ] Header with role-based actions
- [ ] RBAC widget filtering system
- [ ] Advanced filter panel
- [ ] Table/Grid toggle with responsive design
- [ ] Bulk operations with smart validation
- [ ] Pagination with summary statistics
- [ ] Loading and empty states
- [ ] Export functionality

**Detail Page Checklist:**
- [ ] Two-column layout with collapsible sidebar
- [ ] Header with mode switching (view/edit)
- [ ] RBAC field-level permissions
- [ ] Tabbed content with role-based visibility
- [ ] Floating action menu with workflow intelligence
- [ ] Real-time updates and optimistic UI
- [ ] Comments and activity log
- [ ] Mobile-responsive design

### 8.2. Quality Assurance Checklist

**Accessibility:**
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatibility tested
- [ ] Sufficient color contrast ratios
- [ ] Focus management implemented

**Performance:**
- [ ] Component lazy loading implemented
- [ ] Virtual scrolling for large lists
- [ ] Optimistic updates for common actions
- [ ] Image optimization and lazy loading
- [ ] Bundle size optimization verified

**Browser Compatibility:**
- [ ] Chrome/Chromium (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile browsers tested

**Security:**
- [ ] RBAC implementation verified
- [ ] Input validation and sanitization
- [ ] XSS protection implemented
- [ ] CSRF protection configured
- [ ] Sensitive data masking verified

## 9. Migration Guide

### 9.1. Existing Module Upgrade

**Step-by-Step Migration:**

1. **Assessment Phase:**
   - Audit existing component structure
   - Identify RBAC requirements
   - Map user workflows and permissions
   - Document current state and gaps

2. **Foundation Phase:**
   - Implement RBAC service integration
   - Add TypeScript type definitions
   - Create base layout components
   - Set up responsive design system

3. **Component Migration:**
   - Replace custom components with standardized patterns
   - Implement role-based field permissions
   - Add accessibility attributes
   - Update styling to match design system

4. **Feature Enhancement:**
   - Add advanced filtering capabilities
   - Implement optimistic updates
   - Add lazy loading for performance
   - Integrate workflow management

5. **Testing and Optimization:**
   - Comprehensive testing across all roles
   - Performance optimization and monitoring
   - Accessibility testing and remediation
   - Browser compatibility verification

### 9.2. New Module Implementation

**Development Sequence:**

1. **Planning:** Define RBAC requirements, user workflows, and component hierarchy
2. **Foundation:** Set up module structure, types, and base components
3. **List Implementation:** Build list page with filtering and bulk operations
4. **Detail Implementation:** Create detail page with form management and workflows
5. **Integration:** Connect with backend services and real-time updates
6. **Testing:** Comprehensive testing and optimization
7. **Documentation:** Update design guide with new patterns

This design guide provides a comprehensive foundation for implementing consistent, accessible, and performant UI components across the Carmen ERP system, based on the proven patterns from the Purchase Request module.