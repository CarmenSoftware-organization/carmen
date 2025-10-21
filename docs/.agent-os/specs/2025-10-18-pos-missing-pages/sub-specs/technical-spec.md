# Technical Specification

> Spec: POS Integration Missing Pages Implementation
> Created: 2025-10-18

## 1. Stock-out Review Page

### Route & Navigation
- **URL**: `/system-administration/system-integrations/pos/transactions/stock-out-review`
- **Access**: Accessible from POS Integration dashboard "Pending Approvals" card
- **Permissions**: Requires `approve_transactions` permission
- **Navigation**: Add menu item under "POS Integration → Transactions → Stock-out Review"

### UI Components

#### Page Header
```typescript
interface StockoutReviewHeader {
  title: "Stock-out Review & Approval"
  subtitle: "Review and approve pending stock-out transactions"
  actions: [
    { label: "Bulk Approve", icon: CheckCircle, variant: "primary" },
    { label: "Bulk Reject", icon: XCircle, variant: "destructive" }
  ]
  filters: [
    { type: "date-range", label: "Date Range" },
    { type: "select", label: "Location", options: Location[] },
    { type: "select", label: "Requester", options: User[] },
    { type: "search", placeholder: "Search by Transaction ID" }
  ]
}
```

#### Approval Queue Table
```typescript
interface ApprovalQueueColumns {
  select: Checkbox // For bulk operations
  transactionId: string
  date: Date
  location: string
  requester: string
  itemCount: number
  totalValue: Money
  inventoryImpact: "Low" | "Medium" | "High"
  status: "Pending"
  actions: [
    { label: "View Details", action: expandRow },
    { label: "Approve", action: approveTransaction },
    { label: "Reject", action: rejectTransaction }
  ]
}

interface ExpandedRowDetails {
  lineItems: {
    posItem: string
    mappedRecipe: string
    quantity: number
    unit: string
    estimatedCost: Money
    inventoryLocation: string
  }[]
  notes: string | null
  attachments: File[]
  approvalNotes: {
    user: string
    timestamp: Date
    action: "Requested Info" | "Approved" | "Rejected"
    comment: string
  }[]
}
```

#### Inventory Impact Preview
```typescript
interface InventoryImpactPreview {
  affectedItems: {
    ingredient: string
    currentStock: number
    deductionAmount: number
    resultingStock: number
    stockStatus: "Sufficient" | "Low" | "Critical"
    reorderPoint: number
  }[]
  warnings: {
    type: "low_stock" | "critical_stock" | "negative_stock"
    message: string
    affectedItems: string[]
  }[]
}
```

### State Management
```typescript
interface StockoutReviewState {
  transactions: PendingTransaction[]
  selectedTransactions: Set<string>
  filters: {
    dateRange: DateRange
    location: string | null
    requester: string | null
    searchQuery: string
  }
  expandedRows: Set<string>
  isLoading: boolean
  approvalModal: {
    isOpen: boolean
    transaction: PendingTransaction | null
    action: "approve" | "reject" | "request-info"
    notes: string
  }
}
```

### API Integration
```typescript
// GET /api/pos/transactions/pending-approvals
interface PendingApprovalsResponse {
  transactions: PendingTransaction[]
  totalCount: number
  page: number
  pageSize: number
}

// POST /api/pos/transactions/:id/approve
interface ApproveTransactionRequest {
  transactionId: string
  notes?: string
  approver: string
}

// POST /api/pos/transactions/:id/reject
interface RejectTransactionRequest {
  transactionId: string
  reason: string
  approver: string
}

// POST /api/pos/transactions/bulk-approve
interface BulkApproveRequest {
  transactionIds: string[]
  notes?: string
  approver: string
}
```

### Performance Requirements
- Initial page load: < 2 seconds
- Filtering/sorting: < 500ms
- Bulk approval (< 50 items): < 3 seconds
- Real-time updates: WebSocket connection for new pending transactions

### Validation Rules
- Cannot approve transactions with critical stock warnings without explicit confirmation
- Cannot reject without providing a reason
- Bulk operations limited to 100 transactions at a time
- Approval notes optional but recommended for rejections

---

## 2. Transaction Detail Drawer

### Component Type & Behavior
- **Type**: Slide-out drawer (Sheet component from shadcn/ui)
- **Trigger**: Click on any transaction row in transaction lists
- **Position**: Right-side overlay (400px width on desktop, full-width on mobile)
- **Animation**: Slide in from right with backdrop fade
- **Close Actions**: X button, backdrop click, Escape key

### UI Structure

#### Drawer Header
```typescript
interface TransactionDetailHeader {
  transactionId: string
  date: Date
  status: TransactionStatus
  actions: [
    { label: "Print", icon: Printer },
    { label: "Export", icon: Download },
    { label: "Close", icon: X }
  ]
}
```

#### Content Sections
```typescript
interface TransactionDetailContent {
  // Section 1: Transaction Summary
  summary: {
    location: string
    posSystem: string
    totalAmount: Money
    itemCount: number
    processedAt: Date
    processedBy: string
  }

  // Section 2: Line Items
  lineItems: {
    posItemId: string
    posItemName: string
    category: string
    quantity: number
    unitPrice: Money
    totalPrice: Money
    mappedRecipe: string | null
    inventoryDeduction: {
      ingredients: {
        name: string
        quantity: number
        unit: string
        location: string
      }[]
    } | null
  }[]

  // Section 3: Inventory Impact
  inventoryImpact: {
    totalIngredients: number
    totalDeductedValue: Money
    affectedLocations: string[]
    details: {
      ingredient: string
      beforeStock: number
      deducted: number
      afterStock: number
      unit: string
      location: string
    }[]
  }

  // Section 4: Error Details (if failed)
  error?: {
    category: "Mapping Error" | "Stock Error" | "System Error"
    code: string
    message: string
    affectedItems: string[]
    suggestedActions: {
      action: string
      description: string
      canRetry: boolean
    }[]
  }

  // Section 5: Audit Log
  auditLog: {
    timestamp: Date
    user: string
    action: "Created" | "Processed" | "Approved" | "Rejected" | "Retried" | "Failed"
    details: string
    metadata?: Record<string, any>
  }[]
}
```

#### Action Buttons (Conditional)
```typescript
interface DrawerActions {
  // For Failed Transactions
  failed: [
    { label: "Retry Transaction", variant: "primary", disabled: !canRetry },
    { label: "Mark Resolved", variant: "secondary" },
    { label: "View Mapping", variant: "ghost", link: "/mapping" }
  ]

  // For Pending Approval
  pending: [
    { label: "Approve", variant: "primary" },
    { label: "Reject", variant: "destructive" },
    { label: "Request Info", variant: "secondary" }
  ]

  // For Successful Transactions
  success: [
    { label: "View Inventory", variant: "secondary", link: "/inventory" },
    { label: "Print Receipt", variant: "ghost" }
  ]
}
```

### State Management
```typescript
interface TransactionDetailState {
  isOpen: boolean
  transactionId: string | null
  transaction: Transaction | null
  isLoading: boolean
  activeTab: "summary" | "line-items" | "inventory" | "audit"
  retryModal: {
    isOpen: boolean
    isProcessing: boolean
  }
}
```

### API Integration
```typescript
// GET /api/pos/transactions/:id/details
interface TransactionDetailResponse {
  transaction: Transaction
  lineItems: TransactionLineItem[]
  inventoryImpact: InventoryImpactDetail[]
  auditLog: AuditLogEntry[]
  error?: TransactionError
}

// POST /api/pos/transactions/:id/retry
interface RetryTransactionRequest {
  transactionId: string
  resolvedMappings?: { posItemId: string, recipeId: string }[]
}
```

### Performance Requirements
- Drawer open animation: < 300ms
- Data fetch: < 1 second
- Audit log pagination: 20 entries per page
- Line items virtual scrolling: > 100 items

### Accessibility Requirements
- Focus trap within drawer when open
- Keyboard navigation (Tab, Escape, Arrow keys)
- Screen reader announcements for state changes
- ARIA labels for all interactive elements

---

## 3. Mapping Drawer Modal

### Component Type & Behavior
- **Type**: Modal dialog (Dialog component from shadcn/ui)
- **Trigger**: "Map" button on unmapped items in Recipe Mapping page
- **Size**: Medium (600px width on desktop, full-width on mobile)
- **Animation**: Fade in with scale
- **Close Actions**: X button, Cancel button, Escape key

### UI Structure

#### Modal Header
```typescript
interface MappingDrawerHeader {
  title: "Map POS Item to Recipe"
  subtitle: string // "Configure how this POS item maps to inventory"
  posItemPreview: {
    posItemId: string
    name: string
    category: string
    price: Money
  }
}
```

#### Form Structure
```typescript
interface MappingFormFields {
  // Recipe Selection
  recipe: {
    type: "combobox" // Searchable dropdown
    label: "Target Recipe"
    placeholder: "Search recipes..."
    options: {
      value: string // recipeId
      label: string // recipe name
      category: string
      baseUnit: string
    }[]
    validation: required
  }

  // Portion Configuration
  portionSize: {
    type: "number"
    label: "Portion Size"
    placeholder: "1.0"
    min: 0.01
    step: 0.01
    validation: required | positive
  }

  unit: {
    type: "select"
    label: "Unit of Measurement"
    options: Unit[] // From selected recipe's compatible units
    validation: required
  }

  // Optional Overrides
  costOverride: {
    type: "number"
    label: "Cost Override (Optional)"
    placeholder: "Leave blank for automatic calculation"
    prefix: "$"
    min: 0
    step: 0.01
    validation: optional | positive
  }

  // Mapping Notes
  notes: {
    type: "textarea"
    label: "Mapping Notes (Optional)"
    placeholder: "Add any relevant notes about this mapping..."
    maxLength: 500
  }
}
```

#### Inventory Impact Preview
```typescript
interface MappingPreview {
  title: "Inventory Impact Preview"
  preview: {
    recipe: string
    portionSize: number
    unit: string
    ingredients: {
      name: string
      quantityPerPortion: number
      unit: string
      estimatedCost: Money
    }[]
    totalEstimatedCost: Money
    costComparison?: {
      posPrice: Money
      estimatedCost: Money
      margin: number // percentage
      marginStatus: "Good" | "Low" | "Negative"
    }
  }
}
```

#### Form Actions
```typescript
interface MappingDrawerActions {
  primary: {
    label: "Save Mapping"
    variant: "primary"
    disabled: !isFormValid
    action: handleSaveMapping
  }
  secondary: {
    label: "Preview Impact"
    variant: "secondary"
    action: handlePreviewUpdate
  }
  cancel: {
    label: "Cancel"
    variant: "ghost"
    action: handleClose
  }
}
```

### State Management
```typescript
interface MappingDrawerState {
  isOpen: boolean
  posItem: POSItem | null
  form: {
    recipeId: string | null
    portionSize: number | null
    unit: string | null
    costOverride: number | null
    notes: string
  }
  preview: MappingPreview | null
  isPreviewLoading: boolean
  isSaving: boolean
  errors: Record<string, string>
}
```

### API Integration
```typescript
// GET /api/pos/mapping/recipes/search?q={query}
interface RecipeSearchResponse {
  recipes: {
    id: string
    name: string
    category: string
    baseUnit: string
    compatibleUnits: Unit[]
    averageCost: Money
  }[]
}

// POST /api/pos/mapping/preview
interface MappingPreviewRequest {
  recipeId: string
  portionSize: number
  unit: string
}

interface MappingPreviewResponse {
  ingredients: IngredientDeduction[]
  totalCost: Money
}

// POST /api/pos/mapping/create
interface CreateMappingRequest {
  posItemId: string
  recipeId: string
  portionSize: number
  unit: string
  costOverride?: number
  notes?: string
}

interface CreateMappingResponse {
  mapping: POSMapping
  success: boolean
  message: string
}
```

### Validation Rules
- Recipe must be selected before portion size
- Portion size must be positive number
- Unit must be compatible with selected recipe
- Cost override must be positive if provided
- Preview must be generated before saving
- Duplicate mappings prevented (POS item can only map to one recipe)

### Performance Requirements
- Modal open: < 200ms
- Recipe search: < 500ms (debounced)
- Preview generation: < 1 second
- Save operation: < 2 seconds

### User Experience
- Auto-focus on recipe search when modal opens
- Live preview updates as form changes
- Clear error messages for validation failures
- Success toast notification on save
- Automatically close modal on successful save
- Return focus to trigger button on close

---

## 4. Failed Transaction View

### Display Context
- **Integration**: Part of Transaction Detail drawer
- **Trigger**: Viewing a transaction with status "Failed"
- **Layout**: Replaces normal transaction details with error-focused view

### UI Structure

#### Error Summary Card
```typescript
interface ErrorSummaryCard {
  severity: "critical" | "high" | "medium"
  category: "Mapping Error" | "Stock Insufficient" | "System Error" | "Validation Error"
  errorCode: string
  primaryMessage: string
  occurredAt: Date
  affectedItems: number
  canRetry: boolean
}
```

#### Error Details Section
```typescript
interface ErrorDetailsSection {
  title: "Error Details"
  details: {
    errorType: string
    specificMessage: string
    technicalDetails?: {
      stackTrace?: string
      requestId: string
      endpoint: string
    }
  }

  affectedItems: {
    posItemId: string
    posItemName: string
    quantity: number
    errorReason: string
    suggestedFix: string
  }[]
}
```

#### Troubleshooting Guide
```typescript
interface TroubleshootingGuide {
  title: "Troubleshooting Steps"
  category: string // Based on error type

  // For Mapping Errors
  mappingError?: {
    issue: "POS items not mapped to recipes"
    steps: [
      {
        step: 1
        action: "Navigate to Recipe Mapping page"
        link: "/system-administration/system-integrations/pos/mapping/recipes"
      },
      {
        step: 2
        action: "Map the following items to recipes"
        items: string[]
      },
      {
        step: 3
        action: "Return here and click Retry Transaction"
      }
    ]
    quickAction: {
      label: "Map Items Now"
      link: "/mapping?items={itemIds}"
    }
  }

  // For Stock Errors
  stockError?: {
    issue: "Insufficient inventory for transaction"
    steps: [
      {
        step: 1
        action: "Review current stock levels"
        link: "/inventory"
      },
      {
        step: 2
        action: "Adjust stock or modify recipe portions"
      },
      {
        step: 3
        action: "Retry transaction after adjustments"
      }
    ]
    stockDetails: {
      ingredient: string
      required: number
      available: number
      shortage: number
    }[]
  }

  // For System Errors
  systemError?: {
    issue: "System error during processing"
    steps: [
      {
        step: 1
        action: "Verify POS connection status"
        link: "/settings/config"
      },
      {
        step: 2
        action: "Check system logs for additional details"
      },
      {
        step: 3
        action: "Contact support if error persists"
        supportInfo: {
          email: "support@example.com"
          requestId: string
        }
      }
    ]
  }
}
```

#### Resolution Actions
```typescript
interface ResolutionActions {
  // Automatic Actions
  automatic: {
    retry: {
      label: "Retry Transaction"
      variant: "primary"
      disabled: !canRetry
      action: handleRetryTransaction
      tooltip: canRetry
        ? "Attempt to process transaction again"
        : "Cannot retry: resolve issues first"
    }
  }

  // Manual Actions
  manual: {
    resolve: {
      label: "Mark as Resolved"
      variant: "secondary"
      action: handleManualResolve
      confirmation: "Confirm manual resolution?"
    }
    ignore: {
      label: "Ignore Error"
      variant: "ghost"
      action: handleIgnoreError
      confirmation: "This will hide the error. Continue?"
    }
  }

  // Navigation Actions
  navigation: [
    {
      label: "Fix Mapping"
      icon: Link
      link: "/mapping"
      condition: errorCategory === "Mapping Error"
    },
    {
      label: "Check Inventory"
      icon: Package
      link: "/inventory"
      condition: errorCategory === "Stock Insufficient"
    },
    {
      label: "View System Logs"
      icon: FileText
      link: "/logs"
      condition: errorCategory === "System Error"
    }
  ]
}
```

#### Error History Timeline
```typescript
interface ErrorHistoryTimeline {
  events: {
    timestamp: Date
    type: "error_occurred" | "retry_attempted" | "resolution_action" | "status_change"
    description: string
    user?: string
    details?: {
      attemptNumber?: number
      actionTaken?: string
      result?: "success" | "failed"
      notes?: string
    }
  }[]
}
```

### State Management
```typescript
interface FailedTransactionState {
  transaction: FailedTransaction
  errorDetails: TransactionError
  troubleshootingSteps: TroubleshootingGuide
  errorHistory: ErrorEvent[]
  resolutionModal: {
    isOpen: boolean
    type: "retry" | "resolve" | "ignore"
    isProcessing: boolean
    notes: string
  }
}
```

### API Integration
```typescript
// GET /api/pos/transactions/:id/error-details
interface ErrorDetailsResponse {
  error: {
    category: string
    code: string
    message: string
    technicalDetails: any
  }
  affectedItems: AffectedItem[]
  troubleshootingSteps: TroubleshootingStep[]
  canRetry: boolean
  retryHistory: RetryAttempt[]
}

// POST /api/pos/transactions/:id/retry
interface RetryTransactionRequest {
  transactionId: string
  notes?: string
}

interface RetryTransactionResponse {
  success: boolean
  newTransactionId?: string
  error?: string
}

// POST /api/pos/transactions/:id/mark-resolved
interface MarkResolvedRequest {
  transactionId: string
  resolution: string
  notes: string
}
```

### Error Categorization System
```typescript
enum ErrorCategory {
  MAPPING_ERROR = "Mapping Error",
  STOCK_INSUFFICIENT = "Stock Insufficient",
  VALIDATION_ERROR = "Validation Error",
  SYSTEM_ERROR = "System Error",
  CONNECTION_ERROR = "Connection Error"
}

interface ErrorCategoryConfig {
  category: ErrorCategory
  severity: "critical" | "high" | "medium"
  canAutoRetry: boolean
  requiresUserAction: boolean
  troubleshootingTemplate: string
  suggestedActions: Action[]
}
```

### Performance Requirements
- Error details fetch: < 1 second
- Troubleshooting steps generation: < 500ms
- Retry operation: < 3 seconds
- Error history pagination: 10 events per page

### User Experience
- Clear error categorization with color coding
- Step-by-step troubleshooting guidance
- Direct links to resolution pages
- Retry status feedback with progress indicator
- Success/failure notifications
- Error history for context

---

## 5. Cross-Cutting Technical Requirements

### Technology Stack
- **Framework**: Next.js 14 App Router
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand for global state, React Query for server state
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Shared Component Patterns
```typescript
// Consistent Money display
function formatMoney(amount: Money): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency
  }).format(amount.amount)
}

// Consistent Status badges
interface StatusBadgeProps {
  status: TransactionStatus
  size?: "sm" | "md" | "lg"
}

// Consistent Loading states
interface LoadingState {
  skeleton: boolean // Use skeleton loaders for initial load
  spinner: boolean // Use spinners for actions
  optimistic: boolean // Use optimistic updates where possible
}
```

### Error Handling Strategy
```typescript
// Consistent error display
interface ErrorBoundary {
  fallback: React.ComponentType<{ error: Error }>
  onError: (error: Error, errorInfo: React.ErrorInfo) => void
}

// Toast notifications for user actions
interface ToastConfig {
  success: { duration: 3000, variant: "success" }
  error: { duration: 5000, variant: "destructive" }
  info: { duration: 4000, variant: "default" }
}
```

### Data Fetching Patterns
```typescript
// React Query configuration
const queryConfig = {
  staleTime: 30000, // 30 seconds
  cacheTime: 300000, // 5 minutes
  refetchOnWindowFocus: true,
  retry: 3
}

// Optimistic updates for mutations
function useOptimisticUpdate() {
  return useMutation({
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['transactions'])

      // Snapshot previous value
      const previous = queryClient.getQueryData(['transactions'])

      // Optimistically update
      queryClient.setQueryData(['transactions'], (old) => [...old, newData])

      return { previous }
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['transactions'], context.previous)
    }
  })
}
```

### Security Requirements
- All API calls authenticated with JWT tokens
- Role-based access control (RBAC) for approval actions
- Audit logging for all state-changing operations
- Input sanitization for all user-provided content
- CSRF protection for form submissions
- Rate limiting on retry operations (max 3 retries per 5 minutes)

### Testing Requirements
```typescript
// Unit tests
- Component rendering with various states
- Form validation logic
- State management actions
- Utility functions

// Integration tests
- Full user workflows (approve, reject, retry)
- API integration
- Error handling flows
- Optimistic updates

// E2E tests (Playwright)
- Stock-out approval workflow
- Transaction detail viewing
- Recipe mapping process
- Failed transaction retry
```

### Accessibility Requirements (WCAG 2.1 AA)
- Keyboard navigation for all interactive elements
- Focus indicators visible and high-contrast
- Screen reader announcements for dynamic content
- ARIA labels for complex components
- Color contrast ratios ≥ 4.5:1
- Skip links for navigation
- Form field labels and error associations

### Performance Budgets
- Initial page load: < 2 seconds
- Time to Interactive (TTI): < 3 seconds
- First Contentful Paint (FCP): < 1.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- Bundle size: < 500KB (gzipped)

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## 6. Implementation Notes

### Development Approach
1. **Component-First**: Build UI components in isolation first
2. **State Management**: Implement state logic with mock data
3. **API Integration**: Connect to backend endpoints
4. **Error Handling**: Add comprehensive error boundaries
5. **Testing**: Write tests alongside implementation
6. **Accessibility**: Validate WCAG compliance
7. **Performance**: Profile and optimize

### File Structure
```
app/
  (main)/
    system-administration/
      system-integrations/
        pos/
          transactions/
            stock-out-review/
              page.tsx
              components/
                ApprovalQueueTable.tsx
                InventoryImpactPreview.tsx
                BulkActionsToolbar.tsx
            components/
              TransactionDetailDrawer.tsx
          mapping/
            recipes/
              components/
                MappingDrawer.tsx
          components/
            FailedTransactionView.tsx

components/
  pos-integration/
    ErrorSummaryCard.tsx
    TroubleshootingGuide.tsx

lib/
  types/
    pos-integration.ts
  mock-data/
    pos-transactions.ts
  hooks/
    use-transaction-approval.ts
    use-mapping.ts
```

### Incremental Rollout Plan
1. **Phase 1**: Stock-out Review page (core approval workflow)
2. **Phase 2**: Transaction Detail drawer (viewing and audit)
3. **Phase 3**: Mapping Drawer modal (configuration efficiency)
4. **Phase 4**: Failed Transaction view (error resolution)

### Known Technical Challenges
1. **Real-time Updates**: Consider WebSocket vs polling for pending approvals
2. **Large Data Sets**: Implement virtual scrolling for 100+ line items
3. **Offline Support**: Handle network failures gracefully during retry
4. **Complex State**: Coordinate between drawer/modal and parent page state
