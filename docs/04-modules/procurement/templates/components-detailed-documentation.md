# Purchase Request Template - Components Detailed Documentation

## Table of Contents
1. [Component Overview](#component-overview)
2. [Page Components](#page-components)
3. [Form Components](#form-components)
4. [Dialog Components](#dialog-components)
5. [Table Components](#table-components)
6. [Shared Template Components](#shared-template-components)
7. [Component Interaction Patterns](#component-interaction-patterns)

## Component Overview

The Purchase Request Template module follows a modular component architecture with clear separation between presentation, business logic, and data management. Components are organized into logical groups based on their functionality and reusability.

### Component Categories
- **Page Components**: Main route components that handle routing and top-level state
- **Form Components**: Input handling and validation components
- **Dialog Components**: Modal interfaces for focused interactions
- **Table Components**: Data display and manipulation components
- **Shared Components**: Reusable components across multiple contexts

## Page Components

### 1. PurchaseRequestTemplatesPage
**File**: `app/(main)/procurement/purchase-request-templates/page.tsx`

**Purpose**: Main landing page for template management with dual-view interface and bulk operations.

**Key Features**:
- View mode switching (table/card)
- Search and filtering
- Bulk operations
- Template CRUD operations
- Pagination

**Props Interface**:
```typescript
// No external props - main page component
```

**State Management**:
```typescript
const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
const [selectedItems, setSelectedItems] = useState<string[]>([])
const [currentPage, setCurrentPage] = useState(1)
const [searchTerm, setSearchTerm] = useState("")
const [selectedType, setSelectedType] = useState("All Types")
const [selectedStatus, setSelectedStatus] = useState("All Statuses")
const [activeFilters, setActiveFilters] = useState<FilterType<PurchaseRequest>[]>([])
const [templates, setTemplates] = useState<PurchaseRequest[]>(templateData)
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
```

**Core Functions**:
```typescript
// Navigation
const handleView = (id: string) => void
const handleEdit = (id: string) => void
const handleCreateNew = () => void

// Item Selection
const handleSelectItem = (id: string) => void
const handleSelectAll = (checked: boolean) => void

// CRUD Operations
const handleDelete = (id: string) => void
const confirmDelete = () => void

// Filtering
const handleSearch = (term: string) => void
const handleTypeChange = (type: string) => void
const handleStatusChange = (status: string) => void
const handleApplyFilters = (filters: FilterType<PurchaseRequest>[]) => void
```

**Template Integration**:
```typescript
<PRListTemplate
  title="Purchase Request Templates"
  data={templates}
  selectedItems={selectedItems}
  // ... other props
  customActions={customActions}
  viewToggle={viewToggle}
  tableView={renderTableView()}
  cardView={renderCardView()}
/>
```

**Custom Actions**:
- Delete Selected
- Clone Selected
- Set as Default

### 2. PurchaseRequestTemplateDetailPage
**File**: `app/(main)/procurement/purchase-request-templates/[id]/page.tsx`

**Purpose**: Template detail view and editing interface with tab-based organization.

**Props Interface**:
```typescript
interface Props {
  params: { id: string }
}
```

**State Management**:
```typescript
const [formData, setFormData] = useState<PurchaseRequest>(getTemplateById(params.id))
```

**Mode Handling**:
```typescript
const mode = (searchParams?.get("mode") as "view" | "edit" | "add") || "view"

const handleModeChange = (newMode: "view" | "edit") => {
  router.push(`/procurement/purchase-request-templates/${params.id}?mode=${newMode}`)
}
```

**Tab Configuration**:
```typescript
const tabs = [
  {
    value: "items",
    label: "Items",
    content: <ItemsTab items={mockTemplateItems} mode={mode} />
  },
  {
    value: "budgets",
    label: "Budgets",
    content: <BudgetsTabPlaceholder />
  },
  {
    value: "activity",
    label: "Activity",
    content: <ActivityTabPlaceholder />
  }
]
```

**Action Buttons**:
```typescript
const actions = (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm">
      <FileCheck className="h-4 w-4 mr-2" />
      Set as Default
    </Button>
    <Button variant="outline" size="sm">
      <Copy className="h-4 w-4 mr-2" />
      Clone Template
    </Button>
  </div>
)
```

## Form Components

### 3. ItemFormDialog
**File**: `app/(main)/procurement/purchase-request-templates/components/item-form-dialog.tsx`

**Purpose**: Comprehensive form dialog for adding and editing template items with real-time calculations.

**Props Interface**:
```typescript
interface ItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<TemplateItem>) => void
  initialData?: TemplateItem
  mode: "add" | "edit"
}
```

**Form Schema**:
```typescript
const formSchema = z.object({
  itemCode: z.string().min(1, "Item code is required"),
  description: z.string().min(1, "Description is required"),
  uom: z.string().min(1, "UOM is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  budgetCode: z.string().min(1, "Budget code is required"),
  accountCode: z.string().min(1, "Account code is required"),
  department: z.string().min(1, "Department is required"),
  taxCode: z.string().min(1, "Tax code is required"),
  currency: z.nativeEnum(CurrencyCode),
  currencyRate: z.number().min(0.01, "Exchange rate must be positive"),
  taxIncluded: z.boolean().default(false),
  discountRate: z.number().min(0, "Discount rate must be non-negative"),
  taxRate: z.number().min(0, "Tax rate must be non-negative"),
  adjustments: z.object({
    discount: z.boolean().default(false),
    tax: z.boolean().default(false),
  })
})
```

**Form Sections**:

#### Basic Information Section
```typescript
// Item Code and Description
<FormField name="itemCode" />
<FormField name="description" />
```

#### Quantity and UOM Section
```typescript
// Unit of Measure and Quantity
<FormField name="uom" render={({ field }) => (
  <Select onValueChange={field.onChange}>
    <SelectItem value="KG">KG</SelectItem>
    <SelectItem value="EA">EA</SelectItem>
    <SelectItem value="BTL">BTL</SelectItem>
    <SelectItem value="CTN">CTN</SelectItem>
  </Select>
)} />
<FormField name="quantity" type="number" />
```

#### Pricing Section
```typescript
// Currency, Exchange Rate, Unit Price, Tax Settings
<FormField name="currency" />
<FormField name="currencyRate" />
<FormField name="unitPrice" />
<FormField name="taxIncluded" type="checkbox" />
```

#### Adjustments Section
```typescript
// Discount and Tax Adjustments
<FormField name="adjustments.discount" type="checkbox" />
<FormField name="discountRate" type="number" />
<FormField name="adjustments.tax" type="checkbox" />
<FormField name="taxRate" type="number" />
```

#### Additional Information Section
```typescript
// Budget Code, Account Code, Department, Tax Code
<FormField name="budgetCode" />
<FormField name="accountCode" />
<FormField name="department" render={({ field }) => (
  <Select onValueChange={field.onChange}>
    <SelectItem value="Kitchen">Kitchen</SelectItem>
    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
    <SelectItem value="Maintenance">Maintenance</SelectItem>
  </Select>
)} />
<FormField name="taxCode" />
```

**Real-time Calculations**:
```typescript
const [calculatedAmounts, setCalculatedAmounts] = useState({
  baseAmount: 0,
  discountAmount: 0,
  netAmount: 0,
  taxAmount: 0,
  totalAmount: 0,
})

useEffect(() => {
  const quantity = form.watch('quantity') || 0
  const unitPrice = form.watch('unitPrice') || 0
  const discountRate = form.watch('discountRate') || 0
  const taxRate = form.watch('taxRate') || 0

  const baseAmount = quantity * unitPrice
  const discountAmount = baseAmount * (discountRate / 100)
  const netAmount = baseAmount - discountAmount
  const taxAmount = netAmount * (taxRate / 100)
  const totalAmount = netAmount + taxAmount

  setCalculatedAmounts({
    baseAmount,
    discountAmount,
    netAmount,
    taxAmount,
    totalAmount,
  })
}, [form.watch('quantity'), form.watch('unitPrice'), form.watch('discountRate'), form.watch('taxRate')])
```

**Calculated Amounts Display**:
```typescript
<div className="grid grid-cols-4 gap-4 bg-muted p-4 rounded-lg">
  <div>
    <p className="text-sm font-medium">Base Amount</p>
    <p className="text-lg">{calculatedAmounts.baseAmount.toFixed(2)}</p>
  </div>
  <div>
    <p className="text-sm font-medium">Discount</p>
    <p className="text-lg">{calculatedAmounts.discountAmount.toFixed(2)}</p>
  </div>
  <div>
    <p className="text-sm font-medium">Tax</p>
    <p className="text-lg">{calculatedAmounts.taxAmount.toFixed(2)}</p>
  </div>
  <div>
    <p className="text-sm font-medium">Total</p>
    <p className="text-lg font-bold">{calculatedAmounts.totalAmount.toFixed(2)}</p>
  </div>
</div>
```

## Dialog Components

### 4. Delete Confirmation Dialog
**Location**: Within parent components

**Purpose**: Confirms deletion operations for templates and items.

**Implementation Pattern**:
```typescript
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the
        template and remove it from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**State Management**:
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

const handleDelete = (id: string) => {
  setTemplateToDelete(id)
  setDeleteDialogOpen(true)
}

const confirmDelete = () => {
  if (templateToDelete) {
    // Perform deletion
    setTemplates(templates.filter(template => template.id !== templateToDelete))
    setTemplateToDelete(null)
    setDeleteDialogOpen(false)
  }
}
```

## Table Components

### 5. TemplateItemsTable
**File**: `app/(main)/procurement/purchase-request-templates/components/template-items-table.tsx`

**Purpose**: Displays template items in a comprehensive table format with actions.

**Props Interface**:
```typescript
interface TemplateItemsTableProps {
  items: TemplateItem[]
  mode: "view" | "edit" | "add"
  onAddItem?: () => void
  onEditItem?: (item: TemplateItem) => void
  onDeleteItem?: (itemId: string) => void
}
```

**Table Structure**:
```typescript
<Table>
  <TableHeader>
    <TableRow className="bg-muted/50">
      <TableHead>Item Code</TableHead>
      <TableHead>Description</TableHead>
      <TableHead>UOM</TableHead>
      <TableHead className="text-right">Quantity</TableHead>
      <TableHead className="text-right">Unit Price</TableHead>
      <TableHead className="text-right">Total Amount</TableHead>
      <TableHead>Budget Code</TableHead>
      <TableHead>Account Code</TableHead>
      <TableHead>Department</TableHead>
      {mode !== "view" && <TableHead className="w-[100px]">Actions</TableHead>}
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id} className="hover:bg-muted/50">
        {/* Table cells */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Action Buttons** (Edit/Add modes only):
```typescript
{mode !== "view" && (
  <TableCell>
    <div className="flex justify-end space-x-1">
      <Button variant="ghost" size="icon" onClick={() => onEditItem?.(item)}>
        <FileText className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onEditItem?.(item)}>
        <Edit className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEditItem?.(item)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEditItem?.(item)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDeleteItem?.(item.id)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </TableCell>
)}
```

**Add Item Button** (Edit/Add modes):
```typescript
{mode !== "view" && (
  <div className="flex justify-end">
    <Button onClick={onAddItem} size="sm" className="h-8">
      <PlusCircle className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  </div>
)}
```

### 6. ItemsTab
**File**: `app/(main)/procurement/purchase-request-templates/components/ItemsTab.tsx`

**Purpose**: Container component that manages the items table and form dialog interactions.

**Props Interface**:
```typescript
interface ItemsTabProps {
  items: TemplateItem[]
  mode: "view" | "edit" | "add"
}
```

**State Management**:
```typescript
const [items, setItems] = useState<TemplateItem[]>(initialItems)
const [formOpen, setFormOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<TemplateItem | null>(null)
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [itemToDelete, setItemToDelete] = useState<string | null>(null)
```

**Event Handlers**:
```typescript
const handleAddItem = () => {
  setSelectedItem(null)
  setFormOpen(true)
}

const handleEditItem = (item: TemplateItem) => {
  setSelectedItem(item)
  setFormOpen(true)
}

const handleDeleteItem = (itemId: string) => {
  setItemToDelete(itemId)
  setDeleteDialogOpen(true)
}

const handleFormSubmit = (data: Partial<TemplateItem>) => {
  if (selectedItem) {
    // Edit existing item
    setItems(items.map(item =>
      item.id === selectedItem.id ? { ...item, ...data } : item
    ))
  } else {
    // Add new item
    setItems([...items, data as TemplateItem])
  }
}
```

**Component Layout**:
```typescript
<Card>
  <CardContent className="p-6">
    <ScrollArea className="h-[calc(100vh-300px)]">
      <TemplateItemsTable
        items={items}
        mode={mode}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />
    </ScrollArea>

    <ItemFormDialog
      open={formOpen}
      onOpenChange={setFormOpen}
      onSubmit={handleFormSubmit}
      initialData={selectedItem || undefined}
      mode={selectedItem ? "edit" : "add"}
    />

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      {/* Delete confirmation dialog */}
    </AlertDialog>
  </CardContent>
</Card>
```

## Shared Template Components

### 7. PRListTemplate
**File**: `components/templates/PRListTemplate.tsx`

**Purpose**: Reusable list component shared across Purchase Request related modules.

**Key Features**:
- Dual view modes (table/card)
- Advanced filtering
- Pagination
- Bulk operations
- Customizable actions

**Props Interface**:
```typescript
interface PRListTemplateProps {
  title: string
  data: PurchaseRequest[]
  selectedItems: string[]
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onSearch: (term: string) => void
  onTypeChange: (type: string) => void
  onStatusChange: (status: string) => void
  onSelectItem: (id: string) => void
  onSelectAll: (checked: boolean) => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
  typeOptions: FilterOption[]
  statusOptions: FilterOption[]
  fieldConfigs: FieldConfig[]
  advancedFilter?: React.ReactNode
  customActions?: React.ReactNode
  viewToggle?: React.ReactNode
  viewMode: 'table' | 'card'
  tableView?: React.ReactNode
  cardView?: React.ReactNode
}
```

### 8. PRDetailTemplate
**File**: `components/templates/PRDetailTemplate.tsx`

**Purpose**: Reusable detail component shared across Purchase Request related modules.

**Key Features**:
- Mode switching (view/edit)
- Tab interface
- Form handling
- Custom actions

**Props Interface**:
```typescript
interface PRDetailTemplateProps {
  mode: "view" | "edit" | "add"
  title: React.ReactNode
  formData: PurchaseRequest
  onModeChange: (mode: "view" | "edit") => void
  onSubmit: (e: React.FormEvent) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (data: Partial<PurchaseRequest>) => void
  tabs: Array<{
    value: string
    label: string
    content: React.ReactNode
  }>
  actions?: React.ReactNode
}
```

## Component Interaction Patterns

### State Flow Patterns

#### 1. Parent-Child Communication
```typescript
// Parent Component (ItemsTab)
const [items, setItems] = useState<TemplateItem[]>([])

// Child Component (TemplateItemsTable)
<TemplateItemsTable
  items={items}
  onEditItem={handleEditItem}
  onDeleteItem={handleDeleteItem}
/>

// Event bubbling back to parent
const handleEditItem = (item: TemplateItem) => {
  setSelectedItem(item)
  setFormOpen(true)
}
```

#### 2. Dialog State Management
```typescript
// Dialog open/close state
const [formOpen, setFormOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<TemplateItem | null>(null)

// Dialog handlers
const handleAddItem = () => {
  setSelectedItem(null)  // Clear selection for add mode
  setFormOpen(true)
}

const handleEditItem = (item: TemplateItem) => {
  setSelectedItem(item)  // Set item for edit mode
  setFormOpen(true)
}

const handleFormSubmit = (data: Partial<TemplateItem>) => {
  // Update items list
  setFormOpen(false)     // Close dialog
}
```

#### 3. Mode-Based Rendering
```typescript
// Conditional rendering based on mode
{mode !== "view" && (
  <Button onClick={onAddItem}>
    <PlusCircle className="h-4 w-4 mr-2" />
    Add Item
  </Button>
)}

// Actions column visibility
{mode !== "view" && <TableHead>Actions</TableHead>}
```

### Data Flow Architecture

#### Template List → Detail Flow
```typescript
// List page navigation
const handleView = (id: string) => {
  router.push(`/procurement/purchase-request-templates/${id}?mode=view`)
}

const handleEdit = (id: string) => {
  router.push(`/procurement/purchase-request-templates/${id}?mode=edit`)
}

// Detail page mode detection
const mode = (searchParams?.get("mode") as "view" | "edit" | "add") || "view"
```

#### Form Data Management
```typescript
// Form initialization
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: initialData || defaultFormValues
})

// Real-time calculations
useEffect(() => {
  // Watch form values and calculate totals
  const quantity = form.watch('quantity')
  const unitPrice = form.watch('unitPrice')
  // ... calculation logic
}, [form.watch('quantity'), form.watch('unitPrice')])

// Form submission
const handleSubmit = (values: z.infer<typeof formSchema>) => {
  onSubmit({
    ...values,
    totalAmount: calculatedAmounts.totalAmount
  })
}
```

### Error Handling Patterns

#### Form Validation
```typescript
// Zod schema validation
const formSchema = z.object({
  itemCode: z.string().min(1, "Item code is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  // ... other validations
})

// Display validation errors
<FormMessage /> // Automatically displays field errors
```

#### Operation Error Handling
```typescript
const handleOperation = async () => {
  try {
    // Perform operation
    await operationFunction()

    toast({
      title: "Success",
      description: "Operation completed successfully"
    })
  } catch (error) {
    console.error("Operation failed:", error)

    toast({
      title: "Error",
      description: "Operation failed. Please try again.",
      variant: "destructive"
    })
  }
}
```

---

*Documentation generated on: 2025-09-23*
*Component Documentation Version: 1.0*
*Carmen ERP - Purchase Request Template Module*