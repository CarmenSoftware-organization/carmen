# Purchase Request Module Elements

## 1. Pages

### 1.1 List Page (`page.tsx`)

#### Layout
```typescript
interface ListPageLayout {
  header: {
    title: string
    actions: {
      newRequest: Button
      bulkActions: ButtonGroup
      filters: AdvancedFilter
    }
  }
  content: {
    list: DataTable<PurchaseRequest>
    pagination: Pagination
  }
  sidebar: {
    filters: FilterPanel
    summary: StatsSummary
  }
}
```

#### Features
- Quick search
- Advanced filtering
- Bulk actions
- Sorting and pagination
- Status indicators
- Quick actions per row

#### Actions
```typescript
interface ListPageActions {
  create: () => void
  filter: (filters: Filter[]) => void
  sort: (field: string, direction: 'asc' | 'desc') => void
  bulkAction: (action: string, items: string[]) => void
  export: (format: 'csv' | 'pdf') => void
  refresh: () => void
}
```

### 1.2 Detail Page (`[id]/page.tsx`)

#### Layout
```typescript
interface DetailPageLayout {
  header: {
    breadcrumb: Breadcrumb
    title: string
    status: StatusBadge
    actions: ActionButtons
  }
  tabs: {
    details: DetailsTab
    items: ItemsTab
    budget: BudgetTab
    workflow: WorkflowTab
    attachments: AttachmentsTab
    activity: ActivityTab
  }
  footer: {
    actions: ActionButtons
    summary: SummaryPanel
  }
}
```

#### States
```typescript
type DetailPageMode = 'view' | 'edit' | 'add'

interface DetailPageState {
  mode: DetailPageMode
  activeTab: string
  data: PurchaseRequest
  validation: ValidationState
  permissions: UserPermissions
  workflow: WorkflowState
}
```

### 1.3 New PR Page (`new-pr/page.tsx`)

#### Layout
```typescript
interface NewPRLayout {
  header: {
    title: string
    templateSelector: TemplateSelect
    actions: ActionButtons
  }
  form: {
    sections: {
      basic: BasicInfoSection
      items: ItemsSection
      budget: BudgetSection
      workflow: WorkflowSection
    }
  }
  sidebar: {
    validation: ValidationPanel
    summary: SummaryPanel
  }
}
```

## 2. Components

### 2.1 Core Components

#### PRHeader
```typescript
interface PRHeaderProps {
  title: string
  status: PRStatus
  number: string
  date: Date
  actions: {
    label: string
    icon: IconComponent
    onClick: () => void
    disabled?: boolean
    permission?: string
  }[]
}

interface PRHeaderStyles {
  container: "flex justify-between items-center p-4 border-b"
  title: "text-2xl font-bold"
  status: "px-3 py-1 rounded-full text-sm font-medium"
  actions: "flex space-x-2"
}
```

#### PRForm
```typescript
interface PRFormProps {
  mode: FormMode
  data: PurchaseRequest
  validation: ValidationRules
  permissions: UserPermissions
  onSubmit: (data: PurchaseRequest) => Promise<void>
  onCancel: () => void
}

interface PRFormSections {
  basicInfo: {
    title: string
    fields: FormField[]
    layout: 'grid' | 'flex'
    columns?: number
  }
  requestor: {
    title: string
    fields: FormField[]
    autoFill?: boolean
  }
  department: {
    title: string
    fields: FormField[]
    dependencies?: string[]
  }
  workflow: {
    title: string
    fields: FormField[]
    dynamic?: boolean
  }
}
```

#### ItemsTable
```typescript
interface ItemsTableProps {
  items: PRItem[]
  editable: boolean
  selection: {
    enabled: boolean
    multiple: boolean
    selected: string[]
  }
  actions: {
    onAdd: () => void
    onEdit: (item: PRItem) => void
    onDelete: (itemId: string) => void
    onSelect: (itemIds: string[]) => void
  }
  columns: {
    field: string
    label: string
    type: 'text' | 'number' | 'date' | 'status' | 'actions'
    width?: string
    align?: 'left' | 'center' | 'right'
    format?: (value: any) => string
  }[]
}
```

### 2.2 Form Components

#### ItemForm
```typescript
interface ItemFormProps {
  mode: 'add' | 'edit' | 'view'
  data?: PRItem
  onSave: (item: PRItem) => void
  onCancel: () => void
}

interface ItemFormSections {
  basic: {
    fields: [
      {
        id: "itemCode"
        label: "Item Code"
        type: "text"
        required: true
        validation: "alphanumeric"
      },
      {
        id: "name"
        label: "Item Name"
        type: "text"
        required: true
      },
      {
        id: "description"
        label: "Description"
        type: "textarea"
        rows: 3
      }
    ]
  }
  quantity: {
    fields: [
      {
        id: "quantity"
        label: "Quantity"
        type: "number"
        required: true
        min: 0
      },
      {
        id: "unit"
        label: "Unit"
        type: "select"
        options: UnitOfMeasure[]
      }
    ]
  }
  pricing: {
    fields: [
      {
        id: "price"
        label: "Unit Price"
        type: "number"
        required: true
        min: 0
      },
      {
        id: "currency"
        label: "Currency"
        type: "select"
        options: Currency[]
      }
    ]
  }
}
```

#### BudgetForm
```typescript
interface BudgetFormProps {
  data: BudgetAllocation
  available: number
  onAllocate: (allocation: BudgetAllocation) => void
}

interface BudgetFormFields {
  account: {
    code: string
    name: string
    available: number
  }
  allocation: {
    amount: number
    percentage: number
    split: boolean
  }
  validation: {
    rules: ValidationRule[]
    messages: Record<string, string>
  }
}
```

### 2.3 Tab Components

#### DetailsTab
```typescript
interface DetailsTabProps {
  data: PRDetails
  mode: 'view' | 'edit'
  onChange: (field: string, value: any) => void
}

interface DetailsTabSections {
  requestInfo: {
    title: "Request Information"
    fields: [
      "requestNumber",
      "requestDate",
      "requiredDate",
      "priority"
    ]
  }
  requestor: {
    title: "Requestor Information"
    fields: [
      "name",
      "department",
      "position",
      "contact"
    ]
  }
  additional: {
    title: "Additional Information"
    fields: [
      "purpose",
      "remarks",
      "references"
    ]
  }
}
```

#### WorkflowTab
```typescript
interface WorkflowTabProps {
  workflow: WorkflowInstance
  permissions: WorkflowPermissions
  onAction: (action: WorkflowAction) => void
}

interface WorkflowElements {
  steps: {
    current: WorkflowStep
    next: WorkflowStep[]
    previous: WorkflowStep[]
  }
  actions: {
    available: WorkflowAction[]
    disabled: WorkflowAction[]
  }
  history: {
    events: WorkflowEvent[]
    comments: WorkflowComment[]
  }
}
```

### 2.4 Utility Components

#### StatusBadge
```typescript
interface StatusBadgeProps {
  status: PRStatus
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
}

interface StatusStyles {
  Draft: "bg-gray-100 text-gray-800"
  Pending: "bg-yellow-100 text-yellow-800"
  Approved: "bg-green-100 text-green-800"
  Rejected: "bg-red-100 text-red-800"
  Cancelled: "bg-gray-100 text-gray-800"
}
```

#### FilterPanel
```typescript
interface FilterPanelProps {
  fields: FilterField[]
  values: FilterValues
  onChange: (filters: Filter[]) => void
  onReset: () => void
}

interface FilterConfig {
  operators: {
    text: ['contains', 'equals', 'startsWith', 'endsWith']
    number: ['equals', 'greaterThan', 'lessThan', 'between']
    date: ['equals', 'before', 'after', 'between']
    boolean: ['equals']
  }
  presets: {
    name: string
    filters: Filter[]
  }[]
}
```

## 3. Forms

### 3.1 Purchase Request Form

#### Structure
```typescript
interface PRFormStructure {
  sections: {
    header: {
      fields: [
        "requestNumber",
        "requestDate",
        "requiredDate",
        "priority",
        "status"
      ]
    }
    requestor: {
      fields: [
        "name",
        "department",
        "position",
        "contact"
      ]
    }
    items: {
      table: true
      fields: [
        "itemCode",
        "description",
        "quantity",
        "unit",
        "price",
        "amount"
      ]
    }
    budget: {
      fields: [
        "accountCode",
        "costCenter",
        "project",
        "allocation"
      ]
    }
    workflow: {
      fields: [
        "approvalRoute",
        "currentApprover",
        "nextApprover",
        "comments"
      ]
    }
  }
}
```

#### Validation
```typescript
interface PRFormValidation {
  rules: {
    requestNumber: {
      required: true
      pattern: "PR-\\d{6}"
      unique: true
    }
    requestDate: {
      required: true
      min: "today"
    }
    requiredDate: {
      required: true
      min: "requestDate"
    }
    items: {
      minItems: 1
      itemRules: {
        quantity: {
          required: true
          min: 0
        }
        price: {
          required: true
          min: 0
        }
      }
    }
  }
  messages: {
    "requestNumber.required": "PR number is required"
    "requestNumber.pattern": "Invalid PR number format"
    "requestNumber.unique": "PR number must be unique"
    "items.minItems": "At least one item is required"
  }
}
```

### 3.2 Item Form

#### Structure
```typescript
interface ItemFormStructure {
  sections: {
    basic: {
      title: "Basic Information"
      layout: "grid"
      columns: 2
      fields: [
        {
          id: "itemCode"
          label: "Item Code"
          type: "text"
          required: true
          searchable: true
        },
        {
          id: "name"
          label: "Item Name"
          type: "text"
          required: true
        },
        {
          id: "description"
          label: "Description"
          type: "textarea"
          span: 2
        }
      ]
    }
    quantity: {
      title: "Quantity & Unit"
      layout: "grid"
      columns: 2
      fields: [
        {
          id: "quantity"
          label: "Quantity"
          type: "number"
          required: true
        },
        {
          id: "unit"
          label: "Unit"
          type: "select"
          required: true
        },
        {
          id: "conversionRate"
          label: "Conversion Rate"
          type: "number"
          readonly: true
        }
      ]
    }
    pricing: {
      title: "Pricing Information"
      layout: "grid"
      columns: 2
      fields: [
        {
          id: "price"
          label: "Unit Price"
          type: "number"
          required: true
        },
        {
          id: "currency"
          label: "Currency"
          type: "select"
          required: true
        },
        {
          id: "discount"
          label: "Discount"
          type: "number"
        },
        {
          id: "tax"
          label: "Tax"
          type: "number"
        }
      ]
    }
  }
}
```

#### Calculations
```typescript
interface ItemCalculations {
  baseAmount: (quantity: number, price: number) => number
  discountAmount: (baseAmount: number, discountRate: number) => number
  taxAmount: (baseAmount: number, taxRate: number) => number
  totalAmount: (baseAmount: number, discountAmount: number, taxAmount: number) => number
  convertedAmount: (amount: number, exchangeRate: number) => number
}
```

### 3.3 Budget Form

#### Structure
```typescript
interface BudgetFormStructure {
  sections: {
    account: {
      title: "Account Information"
      fields: [
        {
          id: "accountCode"
          label: "Account Code"
          type: "select"
          required: true
          searchable: true
        },
        {
          id: "costCenter"
          label: "Cost Center"
          type: "select"
          required: true
        },
        {
          id: "project"
          label: "Project"
          type: "select"
        }
      ]
    }
    allocation: {
      title: "Budget Allocation"
      fields: [
        {
          id: "amount"
          label: "Amount"
          type: "number"
          required: true
        },
        {
          id: "available"
          label: "Available Budget"
          type: "number"
          readonly: true
        },
        {
          id: "remaining"
          label: "Remaining After Allocation"
          type: "number"
          readonly: true
        }
      ]
    }
  }
}
```

## 4. Shared Elements

### 4.1 Common Interfaces
```typescript
interface BaseEntity {
  id: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  version: number
}

interface AuditInfo {
  action: string
  timestamp: Date
  user: string
  details: Record<string, any>
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  metadata: Record<string, any>
}
```

### 4.2 Shared Styles
```typescript
const sharedStyles = {
  card: "rounded-lg border bg-card text-card-foreground shadow-sm",
  header: "flex items-center justify-between p-6 border-b",
  title: "text-lg font-semibold",
  section: "p-6 space-y-4",
  grid: "grid gap-4",
  button: {
    base: "inline-flex items-center justify-center rounded-md text-sm font-medium",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  }
}
```

### 4.3 Constants
```typescript
const CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
  },
  DATES: {
    FORMAT: "yyyy-MM-dd",
    DISPLAY_FORMAT: "dd MMM yyyy"
  },
  CURRENCY: {
    DEFAULT: "USD",
    DECIMALS: 2
  },
  WORKFLOW: {
    MAX_APPROVERS: 5,
    AUTO_REMINDER_DAYS: 3
  }
}
``` 