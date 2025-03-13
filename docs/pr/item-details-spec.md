# Purchase Request Item Details - Technical Specification

## 1. Overview

### 1.1 Purpose
This document provides detailed technical specifications for the Item Details component within the Purchase Request module of the Carmen F&B Management System.

### 1.2 Component Scope
- Item creation and editing
- Detailed item information management
- Pricing and quantity calculations
- Inventory integration
- Budget allocation
- Document attachments
- Change history tracking

### 1.3 Related Components
- Purchase Request Main Form
- Item List Grid
- Budget Validation Service
- Inventory Management System
- Document Management System

## 2. Component Architecture

### 2.1 Technical Stack
```typescript
// Core Technologies
const TECH_STACK = {
  framework: "Next.js 14",
  language: "TypeScript 5.x",
  ui: {
    components: "shadcn/ui",
    styling: "Tailwind CSS",
    forms: "react-hook-form",
    validation: "zod"
  },
  state: {
    server: "React Server Components",
    client: "useState, useReducer",
    forms: "react-hook-form"
  }
}
```

### 2.2 Component Props Interface
```typescript
interface ItemDetailsProps {
  mode: 'view' | 'edit' | 'add'
  item?: PurchaseRequestItem
  onSave: (item: PurchaseRequestItem) => Promise<void>
  onCancel: () => void
  permissions: ItemPermissions
}
```

## 3. Data Models

### 3.1 Core Item Model
```typescript
interface PurchaseRequestItem {
  id: string
  itemCode: string
  name: string
  description: string
  category: ItemCategory
  subCategory: ItemSubCategory
  specifications: ItemSpecification[]
  manufacturer: ManufacturerInfo
  pricing: PricingDetails
  quantity: QuantityInfo
  inventory: InventoryDetails
  accounting: AccountingInfo
  delivery: DeliveryInfo
  attachments: ItemAttachment[]
  history: ChangeHistory[]
  metadata: ItemMetadata
}

interface ItemMetadata {
  createdBy: string
  createdAt: Date
  modifiedBy: string
  modifiedAt: Date
  status: ItemStatus
  version: number
}
```

### 3.2 Supporting Types
```typescript
interface ItemSpecification {
  name: string
  value: string
  unit: string
}

interface ManufacturerInfo {
  name: string
  partNumber: string
  brand: string
}

interface PricingDetails {
  currency: CurrencyCode
  unitPrice: number
  baseUnitPrice: number
  exchangeRate: number
  discounts: Discount[]
  taxes: Tax[]
  subtotal: number
  totalDiscount: number
  totalTax: number
  netTotal: number
}

interface QuantityInfo {
  requested: number
  unit: UnitOfMeasure
  baseUnit: UnitOfMeasure
  conversionRate: number
}

interface InventoryDetails {
  stock: StockLevels
  warehouse: WarehouseInfo
  history: InventoryHistory
}

interface AccountingInfo {
  accountCode: string
  costCenter: string
  projectCode?: string
  taxCode: string
  budgetLine: string
  budgetAvailable: number
}

interface DeliveryInfo {
  requestedDate: Date
  promisedDate?: Date
  location: DeliveryLocation
  shipping: ShippingDetails
}
```

## 4. Component Layout

### 4.1 Tab Structure
```typescript
enum ItemDetailTabs {
  BasicInfo = "Basic Information",
  Pricing = "Pricing & Quantities",
  Inventory = "Inventory Information",
  Accounting = "Accounting & Budget",
  Delivery = "Delivery Details",
  Attachments = "Attachments",
  History = "History"
}
```

### 4.2 Form Layout
```typescript
interface FormLayout {
  header: {
    title: string
    itemNumber: string
    status: ItemStatus
    actions: ActionButtons
  }
  tabs: {
    id: ItemDetailTabs
    label: string
    content: React.ReactNode
    permissions: string[]
  }[]
}

interface ActionButtons {
  save: boolean
  edit: boolean
  delete: boolean
  cancel: boolean
}
```

## 5. Validation Rules

### 5.1 Field Validation
```typescript
const validationRules = {
  required: [
    'itemCode',
    'name',
    'description',
    'category',
    'quantity.requested',
    'quantity.unit',
    'pricing.unitPrice',
    'pricing.currency',
    'accounting.accountCode',
    'accounting.costCenter',
    'delivery.requestedDate'
  ],
  
  numeric: [
    {
      field: 'quantity.requested',
      min: 0.01,
      decimals: 3
    },
    {
      field: 'pricing.unitPrice',
      min: 0,
      decimals: 2
    },
    {
      field: 'pricing.exchangeRate',
      min: 0.000001,
      decimals: 6
    }
  ],
  
  dates: [
    {
      field: 'delivery.requestedDate',
      minDate: 'today'
    }
  ]
}
```

### 5.2 Business Rules
```typescript
const businessRules = {
  budget: {
    checkAvailability: true,
    allowExceed: false,
    requireApproval: true
  },
  
  stock: {
    checkAvailability: true,
    allowNegative: false,
    warnLowStock: true
  },
  
  pricing: {
    requireExchangeRate: true,
    allowZeroPrice: false,
    maxDiscountPercent: 100
  }
}
```

## 6. Component Functions

### 6.1 Core Functions
```typescript
interface ItemDetailsFunctions {
  // Form Management
  initializeForm: () => Promise<void>
  loadItemData: (itemId: string) => Promise<PurchaseRequestItem>
  validateForm: () => Promise<boolean>
  
  // Actions
  handleSave: () => Promise<void>
  handleEdit: () => void
  handleDelete: () => Promise<void>
  handleCancel: () => void
  
  // Calculations
  calculateTotals: () => void
  convertUnits: () => void
  validateBudget: () => Promise<boolean>
  checkInventory: () => Promise<InventoryStatus>
  
  // Attachments
  handleFileUpload: (files: File[]) => Promise<void>
  handleFileDelete: (fileId: string) => Promise<void>
  
  // History
  trackChange: (change: ChangeRecord) => void
  loadHistory: () => Promise<ChangeHistory[]>
}
```

### 6.2 Event Handlers
```typescript
interface EventHandlers {
  onQuantityChange: (value: number) => void
  onUnitChange: (unit: UnitOfMeasure) => void
  onPriceChange: (price: number) => void
  onCurrencyChange: (currency: CurrencyCode) => void
  onBudgetLineChange: (budgetLine: string) => void
  onLocationChange: (location: DeliveryLocation) => void
}
```

## 7. State Management

### 7.1 Local State
```typescript
interface LocalState {
  activeTab: ItemDetailTabs
  isEditing: boolean
  isDirty: boolean
  errors: ValidationErrors
  loading: {
    saving: boolean
    loading: boolean
    uploading: boolean
  }
}
```

### 7.2 Form State
```typescript
interface FormState {
  values: PurchaseRequestItem
  touched: Record<string, boolean>
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
}
```

## 8. Integration Points

### 8.1 External Services
```typescript
interface ExternalServices {
  inventory: {
    getStock: (itemCode: string) => Promise<StockLevels>
    checkAvailability: (itemCode: string, quantity: number) => Promise<boolean>
  }
  
  budget: {
    checkAvailability: (budgetLine: string, amount: number) => Promise<BudgetStatus>
    reserve: (budgetLine: string, amount: number) => Promise<void>
  }
  
  documents: {
    upload: (files: File[]) => Promise<string[]>
    delete: (fileId: string) => Promise<void>
    download: (fileId: string) => Promise<Blob>
  }
}
```

### 8.2 Event Emitters
```typescript
interface EventEmitters {
  onItemSaved: (item: PurchaseRequestItem) => void
  onItemDeleted: (itemId: string) => void
  onValidationError: (errors: ValidationErrors) => void
  onBudgetExceeded: (status: BudgetStatus) => void
  onStockUnavailable: (status: InventoryStatus) => void
}
```

## 9. Error Handling

### 9.1 Error Types
```typescript
type ValidationError = {
  field: string
  message: string
  type: 'required' | 'format' | 'range' | 'custom'
}

type BusinessError = {
  code: string
  message: string
  severity: 'warning' | 'error'
  details?: any
}
```

### 9.2 Error Handling Strategy
```typescript
const errorHandling = {
  validation: {
    showInline: true,
    preventSubmit: true,
    autoScroll: true
  },
  
  business: {
    showModal: true,
    allowOverride: false,
    logToServer: true
  },
  
  system: {
    retry: {
      count: 3,
      delay: 1000
    },
    fallback: 'error-boundary'
  }
}
```

## 10. Performance Optimization

### 10.1 Optimization Strategies
```typescript
const optimizations = {
  memoization: {
    components: ['PricingCalculator', 'InventoryStatus', 'BudgetStatus'],
    calculations: ['totals', 'conversions']
  },
  
  lazyLoading: {
    tabs: ['History', 'Attachments'],
    components: ['FileViewer', 'HistoryTimeline']
  },
  
  caching: {
    inventory: {
      ttl: 300000, // 5 minutes
      revalidate: 'onChange'
    },
    budget: {
      ttl: 60000, // 1 minute
      revalidate: 'onChange'
    }
  }
}
```

### 10.2 Resource Management
```typescript
const resourceManagement = {
  attachments: {
    maxSize: 10485760, // 10MB
    allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
    compression: {
      enabled: true,
      quality: 0.8
    }
  },
  
  batch: {
    maxItems: 100,
    debounce: 300
  }
}
```

## 11. Accessibility

### 11.1 ARIA Attributes
```typescript
const ariaConfig = {
  labels: {
    required: 'Required field',
    invalid: 'Invalid input',
    loading: 'Loading content'
  },
  
  roles: {
    form: 'form',
    tabs: 'tablist',
    tab: 'tab',
    panel: 'tabpanel'
  },
  
  keyboard: {
    tab: true,
    arrows: true,
    shortcuts: {
      save: 'mod+s',
      cancel: 'esc'
    }
  }
}
```

## 12. Testing Strategy

### 12.1 Test Cases
```typescript
interface TestCases {
  unit: {
    calculations: string[]
    validation: string[]
    transformations: string[]
  }
  
  integration: {
    forms: string[]
    services: string[]
    events: string[]
  }
  
  e2e: {
    workflows: string[]
    scenarios: string[]
  }
}
```

### 12.2 Test Data
```typescript
interface TestData {
  items: PurchaseRequestItem[]
  errors: ValidationError[]
  responses: {
    inventory: InventoryResponse[]
    budget: BudgetResponse[]
  }
}
```

## 13. Documentation

### 13.1 Component Documentation
```typescript
interface Documentation {
  usage: {
    basic: string
    advanced: string
    examples: string[]
  }
  
  props: {
    name: string
    type: string
    required: boolean
    description: string
  }[]
  
  methods: {
    name: string
    parameters: string[]
    returns: string
    description: string
  }[]
}
```

### 13.2 Change Log
```typescript
interface ChangeLog {
  version: string
  date: string
  changes: {
    type: 'feature' | 'fix' | 'improvement'
    description: string
  }[]
}
```

## 14. Content Specifications

### 14.1 Basic Information Tab
```typescript
interface BasicInfoTabContent {
  layout: {
    type: "form"
    columns: 2
    sections: [
      {
        title: "Item Identification",
        fields: [
          {
            id: "itemCode",
            label: "Item Code",
            type: "text",
            required: true,
            searchable: true,
            validation: "alphanumeric",
            maxLength: 20,
            placeholder: "Enter item code",
            helpText: "Unique identifier for the item"
          },
          {
            id: "name",
            label: "Item Name",
            type: "text",
            required: true,
            maxLength: 100,
            placeholder: "Enter item name",
            helpText: "Full name of the item"
          },
          {
            id: "description",
            label: "Description",
            type: "textarea",
            required: true,
            maxLength: 500,
            richText: true,
            placeholder: "Enter detailed description",
            helpText: "Detailed description of the item"
          }
        ]
      },
      {
        title: "Classification",
        fields: [
          {
            id: "category",
            label: "Category",
            type: "select",
            required: true,
            options: "ItemCategory[]",
            cascading: true,
            placeholder: "Select category",
            helpText: "Main category of the item"
          },
          {
            id: "subCategory",
            label: "Sub Category",
            type: "select",
            required: true,
            dependsOn: "category",
            options: "ItemSubCategory[]",
            placeholder: "Select sub-category",
            helpText: "Specific sub-category of the item"
          },
          {
            id: "tags",
            label: "Tags",
            type: "multiSelect",
            createNew: true,
            options: "string[]",
            placeholder: "Add tags",
            helpText: "Keywords to help in searching"
          }
        ]
      },
      {
        title: "Specifications",
        fields: [
          {
            id: "specifications",
            type: "dynamic-form",
            addButtonText: "Add Specification",
            maxItems: 10,
            fields: [
              {
                id: "name",
                label: "Name",
                type: "text",
                required: true
              },
              {
                id: "value",
                label: "Value",
                type: "text",
                required: true
              },
              {
                id: "unit",
                label: "Unit",
                type: "text"
              }
            ]
          }
        ]
      },
      {
        title: "Manufacturer Information",
        fields: [
          {
            id: "manufacturer.name",
            label: "Manufacturer",
            type: "text",
            placeholder: "Enter manufacturer name"
          },
          {
            id: "manufacturer.partNumber",
            label: "Part Number",
            type: "text",
            placeholder: "Enter part number"
          },
          {
            id: "manufacturer.brand",
            label: "Brand",
            type: "text",
            placeholder: "Enter brand name"
          }
        ]
      }
    ]
  }
}
```

### 14.2 Pricing & Quantities Tab
```typescript
interface PricingQuantitiesTabContent {
  layout: {
    type: "form"
    columns: 2
    sections: [
      {
        title: "Quantity Information",
        fields: [
          {
            id: "quantity.requested",
            label: "Quantity",
            type: "number",
            required: true,
            min: 0.01,
            step: 0.001,
            decimals: 3,
            placeholder: "Enter quantity"
          },
          {
            id: "quantity.unit",
            label: "Unit",
            type: "select",
            required: true,
            options: "UnitOfMeasure[]",
            placeholder: "Select unit"
          },
          {
            id: "quantity.baseUnit",
            label: "Base Unit",
            type: "select",
            required: true,
            options: "UnitOfMeasure[]",
            placeholder: "Select base unit"
          },
          {
            id: "quantity.conversionRate",
            label: "Conversion Rate",
            type: "number",
            required: true,
            min: 0.000001,
            decimals: 6,
            readOnly: true,
            calculated: true
          }
        ]
      },
      {
        title: "Pricing Details",
        fields: [
          {
            id: "pricing.currency",
            label: "Currency",
            type: "select",
            required: true,
            options: "CurrencyCode[]",
            placeholder: "Select currency"
          },
          {
            id: "pricing.unitPrice",
            label: "Unit Price",
            type: "number",
            required: true,
            min: 0,
            decimals: 2,
            placeholder: "Enter unit price"
          },
          {
            id: "pricing.baseUnitPrice",
            label: "Base Unit Price",
            type: "number",
            readOnly: true,
            decimals: 2,
            calculated: true
          },
          {
            id: "pricing.exchangeRate",
            label: "Exchange Rate",
            type: "number",
            required: true,
            decimals: 4,
            autoFetch: true
          }
        ]
      },
      {
        title: "Discounts",
        fields: [
          {
            id: "pricing.discounts",
            type: "dynamic-form",
            addButtonText: "Add Discount",
            maxItems: 5,
            fields: [
              {
                id: "type",
                label: "Type",
                type: "select",
                options: ["Percentage", "Amount"]
              },
              {
                id: "value",
                label: "Value",
                type: "number",
                min: 0
              },
              {
                id: "basis",
                label: "Basis",
                type: "select",
                options: ["Unit", "Total"]
              }
            ]
          }
        ]
      },
      {
        title: "Taxes",
        fields: [
          {
            id: "pricing.taxes",
            type: "dynamic-form",
            addButtonText: "Add Tax",
            maxItems: 5,
            fields: [
              {
                id: "code",
                label: "Tax Code",
                type: "select",
                options: "TaxCode[]"
              },
              {
                id: "rate",
                label: "Rate (%)",
                type: "number",
                readOnly: true
              },
              {
                id: "amount",
                label: "Amount",
                type: "number",
                calculated: true
              },
              {
                id: "inclusive",
                label: "Tax Inclusive",
                type: "checkbox"
              }
            ]
          }
        ]
      },
      {
        title: "Totals",
        fields: [
          {
            id: "pricing.subtotal",
            label: "Subtotal",
            type: "number",
            readOnly: true,
            calculated: true
          },
          {
            id: "pricing.totalDiscount",
            label: "Total Discount",
            type: "number",
            readOnly: true,
            calculated: true
          },
          {
            id: "pricing.totalTax",
            label: "Total Tax",
            type: "number",
            readOnly: true,
            calculated: true
          },
          {
            id: "pricing.netTotal",
            label: "Net Total",
            type: "number",
            readOnly: true,
            calculated: true
          }
        ]
      }
    ]
  }
}
```

### 14.3 Inventory Information Tab
```typescript
interface InventoryTabContent {
  layout: {
    type: "form"
    columns: 2
    sections: [
      {
        title: "Current Stock Information",
        fields: [
          {
            id: "inventory.stock.onHand",
            label: "On Hand",
            type: "number",
            readOnly: true,
            realtime: true
          },
          {
            id: "inventory.stock.available",
            label: "Available",
            type: "number",
            readOnly: true,
            realtime: true
          },
          {
            id: "inventory.stock.reserved",
            label: "Reserved",
            type: "number",
            readOnly: true,
            realtime: true
          },
          {
            id: "inventory.stock.onOrder",
            label: "On Order",
            type: "number",
            readOnly: true,
            realtime: true
          }
        ]
      },
      {
        title: "Stock Levels",
        fields: [
          {
            id: "inventory.levels.minimum",
            label: "Minimum Stock",
            type: "number",
            readOnly: true
          },
          {
            id: "inventory.levels.maximum",
            label: "Maximum Stock",
            type: "number",
            readOnly: true
          },
          {
            id: "inventory.levels.reorder",
            label: "Reorder Point",
            type: "number",
            readOnly: true
          }
        ]
      },
      {
        title: "Historical Data",
        fields: [
          {
            id: "inventory.history.lastPurchase",
            type: "info-group",
            fields: [
              {
                id: "date",
                label: "Last Purchase Date"
              },
              {
                id: "quantity",
                label: "Quantity"
              },
              {
                id: "price",
                label: "Price"
              },
              {
                id: "vendor",
                label: "Vendor"
              }
            ]
          },
          {
            id: "inventory.history.averageConsumption",
            type: "info-group",
            fields: [
              {
                id: "monthly",
                label: "Monthly Average"
              },
              {
                id: "quarterly",
                label: "Quarterly Average"
              },
              {
                id: "yearly",
                label: "Yearly Average"
              }
            ]
          }
        ]
      },
      {
        title: "Warehouse Information",
        fields: [
          {
            id: "inventory.warehouse.default",
            label: "Default Warehouse",
            type: "select",
            options: "Warehouse[]"
          },
          {
            id: "inventory.warehouse.locations",
            type: "table",
            columns: [
              {
                id: "code",
                label: "Location Code"
              },
              {
                id: "name",
                label: "Location Name"
              },
              {
                id: "quantity",
                label: "Quantity"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 14.4 Accounting & Budget Tab
```typescript
interface AccountingBudgetTabContent {
  layout: {
    type: "form"
    columns: 2
    sections: [
      {
        title: "Account Assignment",
        fields: [
          {
            id: "accounting.accountCode",
            label: "Account Code",
            type: "select",
            required: true,
            options: "ChartOfAccounts[]",
            searchable: true,
            validation: "accountFormat",
            placeholder: "Select account code"
          },
          {
            id: "accounting.costCenter",
            label: "Cost Center",
            type: "select",
            required: true,
            options: "CostCenter[]",
            searchable: true,
            placeholder: "Select cost center"
          },
          {
            id: "accounting.projectCode",
            label: "Project Code",
            type: "select",
            options: "Project[]",
            searchable: true,
            placeholder: "Select project code"
          },
          {
            id: "accounting.taxCode",
            label: "Tax Code",
            type: "select",
            required: true,
            options: "TaxCode[]",
            placeholder: "Select tax code"
          }
        ]
      },
      {
        title: "Budget Information",
        fields: [
          {
            id: "budget.budgetLine",
            label: "Budget Line",
            type: "select",
            required: true,
            options: "BudgetLine[]",
            searchable: true,
            placeholder: "Select budget line"
          },
          {
            id: "budget.available",
            label: "Available Budget",
            type: "number",
            readOnly: true,
            realtime: true,
            formatting: "currency"
          },
          {
            id: "budget.consumed",
            label: "Consumed Budget",
            type: "number",
            readOnly: true,
            realtime: true,
            formatting: "currency"
          },
          {
            id: "budget.committed",
            label: "Committed Budget",
            type: "number",
            readOnly: true,
            realtime: true,
            formatting: "currency"
          }
        ]
      }
    ]
  }
}
```

### 14.5 Delivery Details Tab
```typescript
interface DeliveryTabContent {
  layout: {
    type: "form"
    columns: 2
    sections: [
      {
        title: "Delivery Schedule",
        fields: [
          {
            id: "delivery.requestedDate",
            label: "Requested Date",
            type: "date",
            required: true,
            validation: "futureDate",
            placeholder: "Select requested date"
          },
          {
            id: "delivery.promisedDate",
            label: "Promised Date",
            type: "date",
            validation: "futureDate",
            placeholder: "Select promised date"
          },
          {
            id: "delivery.deliveryType",
            label: "Delivery Type",
            type: "select",
            options: ["Full", "Partial", "Staggered"],
            placeholder: "Select delivery type"
          }
        ]
      },
      {
        title: "Delivery Location",
        fields: [
          {
            id: "delivery.location.address",
            label: "Address",
            type: "textarea",
            required: true,
            placeholder: "Enter delivery address"
          },
          {
            id: "delivery.location.instructions",
            label: "Delivery Instructions",
            type: "textarea",
            placeholder: "Enter delivery instructions"
          },
          {
            id: "delivery.location.contactPerson",
            type: "group",
            fields: [
              {
                id: "name",
                label: "Contact Name",
                type: "text"
              },
              {
                id: "phone",
                label: "Contact Phone",
                type: "text"
              },
              {
                id: "email",
                label: "Contact Email",
                type: "email"
              }
            ]
          }
        ]
      },
      {
        title: "Shipping Information",
        fields: [
          {
            id: "delivery.shipping.method",
            label: "Shipping Method",
            type: "select",
            options: "ShippingMethod[]",
            placeholder: "Select shipping method"
          },
          {
            id: "delivery.shipping.terms",
            label: "Shipping Terms",
            type: "select",
            options: "IncoTerms[]",
            placeholder: "Select shipping terms"
          },
          {
            id: "delivery.shipping.cost",
            label: "Shipping Cost",
            type: "number",
            decimals: 2,
            formatting: "currency",
            placeholder: "Enter shipping cost"
          }
        ]
      }
    ]
  }
}
```

### 14.6 Attachments Tab
```typescript
interface AttachmentsTabContent {
  layout: {
    type: "form"
    sections: [
      {
        title: "Document Attachments",
        fields: [
          {
            id: "attachments.files",
            type: "file-upload",
            multiple: true,
            maxSize: 10485760, // 10MB
            allowedTypes: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png"],
            dropZone: {
              text: "Drag and drop files here or click to browse",
              accept: ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            },
            preview: {
              enabled: true,
              thumbnails: true
            },
            metadata: {
              fields: [
                {
                  id: "category",
                  label: "Document Category",
                  type: "select",
                  options: "DocumentCategory[]",
                  required: true
                },
                {
                  id: "description",
                  label: "Description",
                  type: "text"
                }
              ]
            }
          }
        ]
      },
      {
        title: "External Links",
        fields: [
          {
            id: "attachments.links",
            type: "dynamic-form",
            addButtonText: "Add Link",
            fields: [
              {
                id: "url",
                label: "URL",
                type: "url",
                required: true
              },
              {
                id: "description",
                label: "Description",
                type: "text"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 14.7 History Tab
```typescript
interface HistoryTabContent {
  layout: {
    type: "tabs",
    tabs: [
      {
        id: "changes",
        label: "Change History",
        content: {
          type: "table",
          columns: [
            {
              id: "timestamp",
              label: "Date/Time",
              format: "datetime"
            },
            {
              id: "user",
              label: "User"
            },
            {
              id: "field",
              label: "Field"
            },
            {
              id: "oldValue",
              label: "Old Value"
            },
            {
              id: "newValue",
              label: "New Value"
            },
            {
              id: "reason",
              label: "Reason"
            }
          ],
          sorting: true,
          filtering: true,
          pagination: true
        }
      },
      {
        id: "approvals",
        label: "Approval History",
        content: {
          type: "timeline",
          fields: [
            {
              id: "stage",
              label: "Stage"
            },
            {
              id: "approver",
              label: "Approver"
            },
            {
              id: "status",
              label: "Status"
            },
            {
              id: "date",
              label: "Date"
            },
            {
              id: "comments",
              label: "Comments"
            }
          ]
        }
      },
      {
        id: "usage",
        label: "Usage History",
        content: {
          type: "table",
          columns: [
            {
              id: "document",
              label: "Document"
            },
            {
              id: "type",
              label: "Type"
            },
            {
              id: "quantity",
              label: "Quantity"
            },
            {
              id: "date",
              label: "Date"
            },
            {
              id: "reference",
              label: "Reference"
            }
          ],
          sorting: true,
          filtering: true,
          pagination: true
        }
      }
    ]
  }
}
``` 