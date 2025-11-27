# PR Detail Item UI Component Specifications

## Overview

This document provides detailed UI/UX specifications for the PR Detail Item CRUD system, including component designs, responsive layouts, and role-based interface patterns.

## Design Principles

### Core UI Principles
- **Role-Based Visibility**: UI adapts to user permissions automatically
- **Consistent Layout**: Same visual structure for edit and view modes
- **Progressive Disclosure**: Show relevant information based on workflow stage
- **Clear Status Indicators**: Visual cues for item status and user actions
- **Responsive Design**: Works across desktop, tablet, and mobile devices

### Visual Design System
```typescript
interface DesignTokens {
  colors: {
    primary: '#2563eb';           // Blue for primary actions
    success: '#059669';           // Green for approved/success states
    warning: '#d97706';           // Orange for pending/review states
    danger: '#dc2626';            // Red for rejected/error states
    neutral: '#6b7280';           // Gray for secondary text
    background: '#f9fafb';        // Light gray background
  };
  
  spacing: {
    xs: '4px';
    sm: '8px';
    md: '16px';
    lg: '24px';
    xl: '32px';
  };
  
  typography: {
    heading: 'font-semibold text-lg';
    body: 'font-normal text-base';
    caption: 'font-normal text-sm text-gray-600';
    label: 'font-medium text-sm';
  };
}
```

## Main Components Architecture

### 1. PR Items List Component

```typescript
interface PRItemsListProps {
  prId: string;
  userRole: UserRole;
  onItemSelect: (itemId: string) => void;
  onBulkAction: (action: BulkAction, itemIds: string[]) => void;
}

interface PRItemsListState {
  items: PRDetailItemView[];
  selectedItems: string[];
  loading: boolean;
  filters: ItemFilters;
  sortBy: SortOption;
}
```

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ PR Items List                                    [+ Add Item] │
├─────────────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [Assigned to Me ☐] [Date Range]         │
├─────────────────────────────────────────────────────────────┤
│ Bulk Actions: [☐ Select All] [Approve Selected ▼]           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [☐] Item #001 - Office Supplies                        │ │
│ │     📍 Main Office | 📦 50 units | 📅 2024-02-15      │ │
│ │     Status: Pending HD | Est: $125.50 | [View Details] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [☐] Item #002 - Computer Equipment                     │ │
│ │     📍 IT Department | 📦 2 units | 📅 2024-02-20     │ │
│ │     Status: Approved | Est: $2,450.00 | [View Details] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Role-Based Variations:**
- **Staff**: Can add items, edit draft items, view own items only
- **HD**: Can approve/reject pending items, view department items
- **Purchase Staff**: Can edit approved items, assign vendors, view all
- **Manager**: Can final approve, view financial summaries

### 2. Item Detail Expanded Panel

```typescript
interface ItemDetailPanelProps {
  item: PRDetailItemView;
  userRole: UserRole;
  mode: 'view' | 'edit';
  onSave: (updates: Partial<PRDetailItem>) => void;
  onStatusChange: (newStatus: ItemStatus, comments?: string) => void;
  onClose: () => void;
}
```

**Panel Layout (Responsive):**
```
┌─────────────────────────────────────────────────────────────┐
│ Item Details - #001                                    [✕]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Basic Information ─────────────────────────────────────┐ │
│ │ Location: [Main Office____________] or "Main Office"      │ │
│ │ Product:  [Office Supplies_______] or "Office Supplies"  │ │
│ │ Quantity: [50___] [units▼] or "50 units"                │ │
│ │ Required: [2024-02-15____] or "February 15, 2024"       │ │
│ │ Comment:  [Optional notes_______] or "Optional notes"    │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Approval Information ──────────────────────────────────┐ │
│ │ Approved Qty: [45___] [units▼] or "45 units"            │ │
│ │ Status: [Pending HD ▼] or "Pending HD Approval"         │ │
│ │ Comments: "Reduced quantity due to budget constraints"   │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Financial Information ─────────────────────────────────┐ │
│ │ Est. Unit Price: "$125.50 (System Estimate)"            │ │
│ │ Est. Total: "$5,627.50"                                  │ │
│ │ Vendor: "ABC Supplies Inc."                              │ │
│ │ Risk Level: 🟡 Medium                                    │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Actions ───────────────────────────────────────────────┐ │
│ │ [Approve] [Send for Review] [Reject] [Save Changes]      │ │
│ └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. Role-Specific Panel Variations

#### Staff/Requestor Panel
```typescript
const StaffItemPanel: React.FC<ItemDetailPanelProps> = ({ item, mode }) => {
  const visibleSections = ['basicInfo', 'workflowInfo'];
  const editableFields = mode === 'edit' && item.status === 'draft' 
    ? ['location', 'productName', 'requestQuantity', 'requestUnit', 'requiredDate', 'comment']
    : [];
    
  return (
    <Panel>
      <BasicInfoSection 
        item={item} 
        editable={editableFields} 
        showFinancial={false} 
      />
      <WorkflowInfoSection 
        item={item} 
        showApprovalDetails={item.status !== 'draft'} 
      />
      {item.status === 'draft' && (
        <ActionSection actions={['save', 'submit']} />
      )}
    </Panel>
  );
};
```

#### HD Panel
```typescript
const HDPanel: React.FC<ItemDetailPanelProps> = ({ item, mode }) => {
  const canEdit = item.status === 'pending_hd';
  const editableFields = canEdit 
    ? ['approvedQuantity', 'approvedUnit'] 
    : [];
    
  return (
    <Panel>
      <BasicInfoSection 
        item={item} 
        editable={[]} 
        showFinancial={true} 
      />
      <ApprovalSection 
        item={item} 
        editable={editableFields}
        showEstimates={true}
      />
      <FinancialSection 
        item={item} 
        showEstimates={true}
        showActuals={false}
      />
      {canEdit && (
        <ActionSection 
          actions={['approve', 'review', 'reject']} 
          requiresComments={['review', 'reject']}
        />
      )}
    </Panel>
  );
};
```

#### Purchase Staff Panel
```typescript
const PurchaseStaffPanel: React.FC<ItemDetailPanelProps> = ({ item, mode }) => {
  const canEdit = ['hd_approved', 'pending_manager', 'manager_approved'].includes(item.status);
  const editableFields = canEdit 
    ? ['requestUnit', 'requiredDate', 'comment', 'approvedQuantity', 'approvedUnit', 
       'purchaserEstimatedPrice', 'purchaserVendorId', 'actualUnitPrice']
    : [];
    
  return (
    <Panel>
      <BasicInfoSection 
        item={item} 
        editable={editableFields.filter(f => ['requestUnit', 'requiredDate', 'comment'].includes(f))} 
        showFinancial={true} 
      />
      <ApprovalSection 
        item={item} 
        editable={editableFields.filter(f => ['approvedQuantity', 'approvedUnit'].includes(f))}
      />
      <VendorSection 
        item={item}
        editable={editableFields.includes('purchaserVendorId')}
        showVendorOptions={true}
      />
      <PricingSection 
        item={item}
        editable={editableFields.filter(f => f.includes('Price'))}
        showEstimates={true}
        showActuals={true}
      />
      {canEdit && (
        <ActionSection 
          actions={['save', 'submitToManager', 'requestChanges']} 
        />
      )}
    </Panel>
  );
};
```

## Responsive Design Patterns

### Desktop Layout (1200px+)
```
┌─────────────────────────────────────────────────────────────┐
│ Header Navigation                                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Items List ───┐ ┌─── Detail Panel ─────────────────────┐ │
│ │                  │ │                                     │ │
│ │ [Item 1]         │ │ ┌─── Basic Info ─────────────────────┐ │ │
│ │ [Item 2]         │ │ │ Location: [____________]          │ │ │
│ │ [Item 3]         │ │ │ Product:  [____________]          │ │ │
│ │                  │ │ └───────────────────────────────────┘ │ │
│ │                  │ │                                     │ │
│ │                  │ │ ┌─── Approval Info ──────────────────┐ │ │
│ │                  │ │ │ Status: [Pending HD]              │ │ │
│ │                  │ │ └───────────────────────────────────┘ │ │
│ └──────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1199px)
```
┌─────────────────────────────────────────────────────────────┐
│ Header Navigation                                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Items List (Collapsible) ─────────────────────────────┐ │
│ │ [≡] Items List                                    [+Add] │ │
│ │ [Item 1] [Item 2] [Item 3]                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Detail Panel (Full Width) ───────────────────────────┐ │
│ │ Item Details - #001                              [✕]   │ │
│ │ ┌─── Basic Info ─────────────────────────────────────────┐ │ │
│ │ │ Location: [Main Office]                             │ │ │
│ │ │ Product:  [Office Supplies]                         │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────────────┐
│ ☰ PR Items              [+Add] │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Item #001                   │ │
│ │ Office Supplies             │ │
│ │ 📍 Main Office | 📦 50 units│ │
│ │ Status: Pending HD          │ │
│ │ [View Details]              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Item #002                   │ │
│ │ Computer Equipment          │ │
│ │ 📍 IT Dept | 📦 2 units    │ │
│ │ Status: Approved            │ │
│ │ [View Details]              │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

// Detail view becomes full-screen modal
┌─────────────────────────────────┐
│ ← Item Details #001             │
├─────────────────────────────────┤
│ ▼ Basic Information             │
│ Location: Main Office           │
│ Product: Office Supplies        │
│ Quantity: 50 units              │
│                                 │
│ ▼ Approval Information          │
│ Status: Pending HD              │
│ Approved: 45 units              │
│                                 │
│ [Approve] [Review] [Reject]     │
└─────────────────────────────────┘
```

## Component Library

### 1. Status Badge Component

```typescript
interface StatusBadgeProps {
  status: ItemStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const config = {
    draft: { color: 'gray', icon: '📝', label: 'Draft' },
    pending_hd: { color: 'yellow', icon: '⏳', label: 'Pending HD' },
    hd_approved: { color: 'blue', icon: '✅', label: 'HD Approved' },
    pending_manager: { color: 'orange', icon: '⏳', label: 'Pending Manager' },
    manager_approved: { color: 'green', icon: '✅', label: 'Approved' },
    review: { color: 'purple', icon: '🔄', label: 'Under Review' },
    rejected: { color: 'red', icon: '❌', label: 'Rejected' }
  };
  
  return (
    <span className={`badge badge-${config[status].color} badge-${size}`}>
      {showIcon && config[status].icon} {config[status].label}
    </span>
  );
};
```

### 2. Field Display Component

```typescript
interface FieldDisplayProps {
  label: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'currency' | 'select';
  editable: boolean;
  options?: SelectOption[];
  onChange?: (value: any) => void;
  validation?: ValidationRule[];
  helpText?: string;
}

const FieldDisplay: React.FC<FieldDisplayProps> = ({ 
  label, value, type, editable, options, onChange, validation, helpText 
}) => {
  if (editable) {
    return (
      <div className="field-group">
        <label className="field-label">{label}</label>
        {type === 'select' ? (
          <select value={value} onChange={(e) => onChange?.(e.target.value)}>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input 
            type={type === 'currency' ? 'number' : type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="field-input"
          />
        )}
        {helpText && <span className="field-help">{helpText}</span>}
      </div>
    );
  }
  
  // View mode - text display with same layout
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="field-text">
        {type === 'currency' ? `$${value?.toFixed(2)}` : value}
      </div>
      {helpText && <span className="field-help">{helpText}</span>}
    </div>
  );
};
```

### 3. Action Button Group

```typescript
interface ActionButtonGroupProps {
  actions: ActionConfig[];
  onAction: (action: string, data?: any) => void;
  loading?: boolean;
  disabled?: boolean;
}

interface ActionConfig {
  key: string;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  requiresComment?: boolean;
}

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({ 
  actions, onAction, loading, disabled 
}) => {
  return (
    <div className="action-group">
      {actions.map(action => (
        <button
          key={action.key}
          className={`btn btn-${action.variant}`}
          onClick={() => handleAction(action)}
          disabled={loading || disabled}
        >
          {action.icon && <span className="btn-icon">{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
};
```

### 4. Bulk Action Toolbar

```typescript
interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  availableActions: BulkActionConfig[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: string, options?: any) => void;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount, totalCount, availableActions, onSelectAll, onClearSelection, onBulkAction
}) => {
  return (
    <div className="bulk-toolbar">
      <div className="bulk-selection">
        <input 
          type="checkbox" 
          checked={selectedCount === totalCount}
          indeterminate={selectedCount > 0 && selectedCount < totalCount}
          onChange={selectedCount === totalCount ? onClearSelection : onSelectAll}
        />
        <span>{selectedCount} of {totalCount} selected</span>
      </div>
      
      {selectedCount > 0 && (
        <div className="bulk-actions">
          <select onChange={(e) => handleBulkAction(e.target.value)}>
            <option value="">Bulk Actions</option>
            {availableActions.map(action => (
              <option key={action.key} value={action.key}>
                {action.label}
              </option>
            ))}
          </select>
          <button onClick={() => onBulkAction('apply')}>Apply</button>
        </div>
      )}
    </div>
  );
};
```

## Interaction Patterns

### 1. Inline Editing Flow
```
1. User clicks on editable field
2. Field transforms to input control
3. User makes changes
4. Auto-save on blur OR explicit save button
5. Optimistic UI update with loading state
6. Success/error feedback
7. Field returns to text display
```

### 2. Status Transition Flow
```
1. User clicks status action button
2. Modal/dropdown appears with options
3. If comments required, show text area
4. User confirms action
5. Loading state on button
6. API call with optimistic update
7. Success notification
8. UI updates to new status
9. Relevant users get notifications
```

### 3. Bulk Operations Flow
```
1. User selects multiple items
2. Bulk action toolbar appears
3. User selects action from dropdown
4. Confirmation dialog with details
5. Progress indicator for bulk operation
6. Results summary with success/failure counts
7. Individual item status updates
8. Notification to affected users
```

## Accessibility Features

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Focus Indicators**: Clear visual focus states
- **Alternative Text**: Descriptive alt text for icons and images

### Implementation Examples
```typescript
// Accessible status badge
<span 
  className="status-badge"
  role="status"
  aria-label={`Item status: ${status}`}
>
  {statusIcon} {statusText}
</span>

// Accessible form field
<div className="field-group">
  <label htmlFor={fieldId} className="field-label">
    {label} {required && <span aria-label="required">*</span>}
  </label>
  <input
    id={fieldId}
    type={type}
    value={value}
    onChange={onChange}
    aria-describedby={helpText ? `${fieldId}-help` : undefined}
    aria-invalid={hasError}
  />
  {helpText && (
    <span id={`${fieldId}-help`} className="field-help">
      {helpText}
    </span>
  )}
</div>

// Accessible action buttons
<button
  className="btn btn-primary"
  onClick={onApprove}
  aria-describedby="approve-help"
  disabled={!canApprove}
>
  Approve Item
</button>
<span id="approve-help" className="sr-only">
  This will approve the item and move it to the next stage
</span>
```

## Performance Optimizations

### 1. Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedItemList: React.FC<{ items: PRDetailItem[] }> = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ItemCard item={items[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 2. Lazy Loading and Code Splitting
```typescript
// Lazy load heavy components
const ItemDetailPanel = lazy(() => import('./ItemDetailPanel'));
const BulkOperationsModal = lazy(() => import('./BulkOperationsModal'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <ItemDetailPanel item={selectedItem} />
</Suspense>
```

### 3. Optimistic Updates
```typescript
const useOptimisticUpdate = () => {
  const [optimisticState, setOptimisticState] = useState(null);
  
  const updateOptimistically = async (updateFn, apiCall) => {
    // Apply update immediately
    setOptimisticState(updateFn);
    
    try {
      // Make API call
      const result = await apiCall();
      // Clear optimistic state on success
      setOptimisticState(null);
      return result;
    } catch (error) {
      // Revert optimistic state on error
      setOptimisticState(null);
      throw error;
    }
  };
  
  return { optimisticState, updateOptimistically };
};
```

## Testing Specifications

### 1. Component Testing
```typescript
// Example test for role-based visibility
describe('ItemDetailPanel', () => {
  it('shows financial information to HD but not to Staff', () => {
    const item = mockPRItem();
    
    // Test HD view
    render(<ItemDetailPanel item={item} userRole="hd" />);
    expect(screen.getByText('Est. Unit Price')).toBeInTheDocument();
    
    // Test Staff view
    render(<ItemDetailPanel item={item} userRole="staff" />);
    expect(screen.queryByText('Est. Unit Price')).not.toBeInTheDocument();
  });
  
  it('allows editing only appropriate fields based on status', () => {
    const item = mockPRItem({ status: 'pending_hd' });
    
    render(<ItemDetailPanel item={item} userRole="hd" mode="edit" />);
    
    // Should have editable approved quantity
    expect(screen.getByRole('spinbutton', { name: /approved quantity/i })).toBeEnabled();
    
    // Should not have editable product name
    expect(screen.getByText('Office Supplies')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /product name/i })).not.toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```typescript
// Test complete workflow
describe('PR Item Workflow', () => {
  it('completes full approval workflow', async () => {
    const user = userEvent.setup();
    
    // Staff creates item
    render(<PRItemsPage userRole="staff" />);
    await user.click(screen.getByText('Add Item'));
    await user.type(screen.getByLabelText('Product Name'), 'Test Product');
    await user.click(screen.getByText('Save'));
    
    // Staff submits for approval
    await user.click(screen.getByText('Submit for Approval'));
    expect(screen.getByText('Pending HD')).toBeInTheDocument();
    
    // HD approves
    render(<PRItemsPage userRole="hd" />);
    await user.click(screen.getByText('Approve'));
    expect(screen.getByText('HD Approved')).toBeInTheDocument();
  });
});
```

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

This UI specification provides comprehensive guidance for implementing a consistent, accessible, and role-appropriate user interface for the PR Detail Item CRUD system.