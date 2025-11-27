# Credit Note Module - Components Detailed Documentation

Comprehensive documentation for all Credit Note module components with technical specifications, props interfaces, and interaction patterns.

## Table of Contents
1. [Page Components](#page-components)
2. [Form Components](#form-components)
3. [Dialog Components](#dialog-components)
4. [Tab Components](#tab-components)
5. [Utility Components](#utility-components)
6. [Component Interaction Patterns](#component-interaction-patterns)

## Page Components

### 1. Credit Note List Page (`page.tsx`)

**Purpose**: Main landing page for Credit Note management with table and card view modes

**Location**: `app/(main)/procurement/credit-note/page.tsx`

**Component Structure**:
```typescript
interface CreditNoteListPageProps {
  searchParams?: {
    view?: 'table' | 'card'
    status?: string
    vendor?: string
  }
}
```

**Key Features**:
- Dynamic view mode switching (table/card)
- Advanced filtering and search
- Bulk operations support
- Real-time status updates
- Export functionality

**State Management**:
```typescript
const [creditNotes, setCreditNotes] = useState<CreditNote[]>(mockCreditNotes)
const [viewMode, setViewMode] = useState<'table' | 'card'>('card')
const [selectedNotes, setSelectedNotes] = useState<number[]>([])
const [searchQuery, setSearchQuery] = useState('')
const [statusFilter, setStatusFilter] = useState<string>('all')
```

**Child Components**:
- `CreditNoteManagement` - Main list management component
- `Header` - Page header with navigation
- `FilterBar` - Search and filter controls
- `ExportDialog` - Data export functionality

### 2. Credit Note Detail Page (`[id]/page.tsx`)

**Purpose**: Detailed view and management of individual credit notes

**Location**: `app/(main)/procurement/credit-note/[id]/page.tsx`

**Component Structure**:
```typescript
interface CreditNoteDetailPageProps {
  params: { id: string }
  searchParams?: { mode?: 'view' | 'edit' | 'confirm' }
}
```

**Key Features**:
- Multi-mode support (view/edit/confirm)
- Tab-based navigation for different aspects
- Real-time validation and updates
- Document attachment management
- Activity logging

**State Management**:
```typescript
const [creditNote, setCreditNote] = useState<CreditNote | null>(null)
const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view')
const [activeTab, setActiveTab] = useState('details')
const [isLoading, setIsLoading] = useState(true)
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
```

**Child Components**:
- `CreditNoteDetail` - Main detail component
- `CreditNoteItems` - Items management tab
- `DocumentsTab` - Document attachments
- `ActivityLogTab` - Audit trail
- `CommentsAttachmentsTab` - Comments and files

### 3. New Credit Note Creation Pages

#### Vendor Selection Page (`new/vendor-selection/page.tsx`)

**Purpose**: First step in credit note creation - vendor selection

**Component Structure**:
```typescript
interface VendorSelectionPageProps {
  searchParams?: {
    returnUrl?: string
    preselectedVendor?: string
  }
}
```

**Key Features**:
- Searchable vendor list
- Vendor information display
- Quick filters for active vendors
- Navigation breadcrumbs

#### GRN Selection Page (`new/grn-selection/page.tsx`)

**Purpose**: Second step - selecting GRNs from chosen vendor

**Component Structure**:
```typescript
interface GRNSelectionPageProps {
  searchParams?: {
    vendorId: string
    returnUrl?: string
  }
}
```

**Key Features**:
- Vendor-specific GRN filtering
- Multi-select GRN capability
- GRN summary information
- Date range filtering

#### Item & Lot Selection Page (`new/item-lot-selection/page.tsx`)

**Purpose**: Final step - selecting specific items and lots for credit note

**Component Structure**:
```typescript
interface ItemLotSelectionPageProps {
  searchParams?: {
    vendorId: string
    grnIds: string
    returnUrl?: string
  }
}
```

**Key Features**:
- Item-level selection from GRNs
- Lot number tracking
- Quantity specification
- Reason code assignment

## Form Components

### 1. Credit Note Detail Form

**Purpose**: Main form for credit note information management

**Component**: `CreditNoteDetailForm`

**Props Interface**:
```typescript
interface CreditNoteDetailFormProps {
  creditNote: CreditNote
  mode: 'view' | 'edit' | 'confirm'
  onSave: (data: CreditNoteFormData) => Promise<void>
  onCancel: () => void
  validationErrors?: ValidationError[]
}
```

**Form Schema**:
```typescript
const creditNoteSchema = z.object({
  refNumber: z.string().min(1, 'Reference number is required'),
  vendorId: z.string().min(1, 'Vendor is required'),
  type: z.enum(['QUANTITY_RETURN', 'AMOUNT_DISCOUNT']),
  date: z.date(),
  totalAmount: z.number().positive(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  items: z.array(creditNoteItemSchema).min(1, 'At least one item is required')
})
```

**Key Features**:
- Real-time validation with Zod
- Multi-step form navigation
- Auto-save functionality
- Field-level error display
- Currency formatting

### 2. Credit Note Item Form

**Purpose**: Form for managing individual credit note items

**Component**: `CreditNoteItemForm`

**Props Interface**:
```typescript
interface CreditNoteItemFormProps {
  item?: CreditNoteItem
  onSave: (item: CreditNoteItem) => void
  onCancel: () => void
  availableItems: InventoryItem[]
  mode: 'add' | 'edit'
}
```

**Form Schema**:
```typescript
const creditNoteItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  reasonCode: z.string().min(1, 'Reason code is required'),
  lotNumber: z.string().optional(),
  expiryDate: z.date().optional(),
  notes: z.string().optional()
})
```

**Key Features**:
- Product selection with search
- Quantity validation against available stock
- Automatic amount calculations
- Lot number management
- Reason code categorization

### 3. Vendor Selection Form

**Purpose**: Form for selecting vendors during credit note creation

**Component**: `VendorSelectionForm`

**Props Interface**:
```typescript
interface VendorSelectionFormProps {
  onVendorSelect: (vendor: Vendor) => void
  preselectedVendor?: string
  filters?: VendorFilters
}
```

**Key Features**:
- Real-time vendor search
- Vendor information preview
- Active vendor filtering
- Recent vendor suggestions

## Dialog Components

### 1. New Credit Note Process Selector

**Purpose**: Initial dialog for selecting credit note creation method

**Component**: `NewCreditNoteProcessSelector`

**Props Interface**:
```typescript
interface NewCreditNoteProcessSelectorProps {
  isOpen: boolean
  onClose: () => void
  onProcessSelect: (process: 'from-grn' | 'manual') => void
}
```

**Process Options**:
- **From GRN**: Create credit note based on existing goods received notes
- **Manual**: Create credit note manually without GRN reference

**Key Features**:
- Process selection cards
- Process description and guidance
- Navigation to appropriate workflow

### 2. Item Selection Dialog

**Purpose**: Dialog for selecting items to include in credit note

**Component**: `ItemSelectionDialog`

**Props Interface**:
```typescript
interface ItemSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  availableItems: InventoryItem[]
  selectedItems: CreditNoteItem[]
  onItemsSelect: (items: CreditNoteItem[]) => void
  grnContext?: GRN[]
}
```

**Key Features**:
- Multi-select item list
- Item search and filtering
- Quantity input per item
- Real-time total calculation

### 3. Credit Note Preview Dialog

**Purpose**: Preview dialog before finalizing credit note

**Component**: `CreditNotePreviewDialog`

**Props Interface**:
```typescript
interface CreditNotePreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  creditNote: CreditNote
  onConfirm: () => Promise<void>
  onEdit: () => void
}
```

**Key Features**:
- Complete credit note preview
- Financial summary display
- Edit/confirm actions
- Print preview option

### 4. Bulk Actions Dialog

**Purpose**: Dialog for performing bulk operations on multiple credit notes

**Component**: `BulkActionsDialog`

**Props Interface**:
```typescript
interface BulkActionsDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: number[]
  availableActions: BulkAction[]
  onActionConfirm: (action: string, items: number[]) => Promise<void>
}
```

**Available Actions**:
- Export selected credit notes
- Update status in bulk
- Generate batch reports
- Delete multiple credit notes

## Tab Components

### 1. Credit Note Items Tab

**Purpose**: Tab component for managing credit note items

**Component**: `CreditNoteItemsTab`

**Props Interface**:
```typescript
interface CreditNoteItemsTabProps {
  creditNote: CreditNote
  mode: 'view' | 'edit'
  onItemsUpdate: (items: CreditNoteItem[]) => void
}
```

**Key Features**:
- Item list with edit capabilities
- Add/remove item functionality
- Bulk item operations
- Real-time total calculations

**Sub-components**:
- `ItemDetailsEditForm` - Individual item editing
- `ItemBulkActions` - Bulk operations menu
- `ItemSearchSelector` - Product search and selection

### 2. Documents Tab

**Purpose**: Tab for managing credit note documents and attachments

**Component**: `CreditNoteDocumentsTab`

**Props Interface**:
```typescript
interface CreditNoteDocumentsTabProps {
  creditNote: CreditNote
  onDocumentsUpdate: (documents: Document[]) => void
  allowEdit: boolean
}
```

**Key Features**:
- File upload and management
- Document preview
- File type validation
- Version control for documents

### 3. Related GRNs Tab

**Purpose**: Tab showing related Goods Received Notes

**Component**: `RelatedGRNsTab`

**Props Interface**:
```typescript
interface RelatedGRNsTabProps {
  creditNote: CreditNote
  relatedGRNs: GRN[]
  onGRNNavigate: (grnId: string) => void
}
```

**Key Features**:
- GRN list with details
- Direct navigation to GRNs
- GRN status tracking
- Item mapping visualization

### 4. Activity Log Tab

**Purpose**: Tab displaying credit note activity history

**Component**: `ActivityLogTab`

**Props Interface**:
```typescript
interface ActivityLogTabProps {
  creditNote: CreditNote
  activities: ActivityLogEntry[]
  showUserDetails: boolean
}
```

**Key Features**:
- Chronological activity display
- User action tracking
- Status change history
- Detailed change logs

## Utility Components

### 1. Credit Note Summary Card

**Purpose**: Reusable summary card component

**Component**: `CreditNoteSummaryCard`

**Props Interface**:
```typescript
interface CreditNoteSummaryCardProps {
  creditNote: CreditNote
  variant: 'compact' | 'detailed'
  showActions?: boolean
  onActionClick?: (action: string, id: number) => void
}
```

**Key Features**:
- Responsive card layout
- Status indicators
- Quick action buttons
- Currency formatting

### 2. Status Badge Component

**Purpose**: Standardized status display component

**Component**: `StatusBadge`

**Props Interface**:
```typescript
interface StatusBadgeProps {
  status: CreditNoteStatus
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
}
```

**Status Types**:
- `DRAFT` - Orange badge
- `PENDING_APPROVAL` - Yellow badge
- `APPROVED` - Blue badge
- `PROCESSED` - Green badge
- `REJECTED` - Red badge
- `CANCELLED` - Gray badge

### 3. Financial Summary Component

**Purpose**: Component for displaying financial calculations

**Component**: `FinancialSummary`

**Props Interface**:
```typescript
interface FinancialSummaryProps {
  items: CreditNoteItem[]
  currency: string
  showBreakdown?: boolean
  onCalculationUpdate?: (totals: FinancialTotals) => void
}
```

**Key Features**:
- Real-time calculations
- Multi-currency support
- Tax calculations
- Discount applications

### 4. Search and Filter Bar

**Purpose**: Reusable search and filtering component

**Component**: `SearchFilterBar`

**Props Interface**:
```typescript
interface SearchFilterBarProps {
  onSearchChange: (query: string) => void
  onFilterChange: (filters: FilterOptions) => void
  availableFilters: FilterConfig[]
  placeholder?: string
}
```

**Filter Types**:
- Status filters
- Date range filters
- Vendor filters
- Amount range filters

## Component Interaction Patterns

### 1. Form Validation Pattern

**Validation Strategy**:
```typescript
// Real-time validation with Zod
const form = useForm<CreditNoteFormData>({
  resolver: zodResolver(creditNoteSchema),
  mode: 'onChange'
})

// Field-level validation
const validateField = (field: string, value: any) => {
  try {
    creditNoteSchema.shape[field].parse(value)
    return null
  } catch (error) {
    return error.errors[0]?.message
  }
}
```

### 2. State Management Pattern

**Component State Flow**:
```typescript
// Parent component manages global state
const [creditNote, setCreditNote] = useState<CreditNote>()

// Child components receive state via props
<CreditNoteDetail
  creditNote={creditNote}
  onUpdate={setCreditNote}
/>

// State updates flow upward via callbacks
const handleItemUpdate = (items: CreditNoteItem[]) => {
  setCreditNote(prev => ({
    ...prev,
    items,
    totalAmount: calculateTotal(items)
  }))
}
```

### 3. Navigation Pattern

**Tab Navigation**:
```typescript
const tabs = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'documents', label: 'Documents', icon: Paperclip },
  { id: 'activity', label: 'Activity', icon: Clock }
]

const [activeTab, setActiveTab] = useState('details')
```

### 4. Error Handling Pattern

**Error Display Strategy**:
```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<{ error: Error }>
  onError?: (error: Error) => void
}

// Field-level errors
<FormField error={errors.quantity?.message} />

// Form-level errors
<ErrorAlert errors={form.formState.errors} />

// Page-level errors
<ErrorBoundary fallback={ErrorFallback}>
  <CreditNoteDetail />
</ErrorBoundary>
```

### 5. Loading States Pattern

**Loading Management**:
```typescript
const [loadingStates, setLoadingStates] = useState({
  saving: false,
  deleting: false,
  uploading: false
})

// Component loading states
{loadingStates.saving ? (
  <Spinner />
) : (
  <SaveButton onClick={handleSave} />
)}
```

### 6. Modal Management Pattern

**Dialog State Management**:
```typescript
const [dialogs, setDialogs] = useState({
  itemSelection: false,
  preview: false,
  confirmation: false
})

const openDialog = (dialogName: string) => {
  setDialogs(prev => ({ ...prev, [dialogName]: true }))
}

const closeDialog = (dialogName: string) => {
  setDialogs(prev => ({ ...prev, [dialogName]: false }))
}
```

## Component Testing Patterns

### 1. Unit Testing

**Component Testing Strategy**:
```typescript
describe('CreditNoteDetail', () => {
  it('renders credit note information correctly', () => {
    render(<CreditNoteDetail creditNote={mockCreditNote} />)
    expect(screen.getByText(mockCreditNote.refNumber)).toBeInTheDocument()
  })

  it('handles edit mode transitions', () => {
    const onModeChange = jest.fn()
    render(<CreditNoteDetail onModeChange={onModeChange} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onModeChange).toHaveBeenCalledWith('edit')
  })
})
```

### 2. Integration Testing

**Multi-component Testing**:
```typescript
describe('Credit Note Creation Flow', () => {
  it('completes full creation workflow', async () => {
    render(<CreditNoteCreationFlow />)

    // Step 1: Vendor selection
    fireEvent.click(screen.getByText('Select Vendor'))
    fireEvent.click(screen.getByText('ACME Corp'))

    // Step 2: GRN selection
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByTestId('grn-checkbox-1'))

    // Step 3: Item selection
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } })

    // Final confirmation
    fireEvent.click(screen.getByText('Create Credit Note'))

    await waitFor(() => {
      expect(screen.getByText('Credit Note Created Successfully')).toBeInTheDocument()
    })
  })
})
```

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

*Generated on: 2025-09-23*
*Component Documentation Version: 1.0*
*Carmen ERP - Credit Note Module*