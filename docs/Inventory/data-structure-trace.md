# Inventory Management - Data Structure Trace

## 1. Stock Overview Route (/inventory-management/stock-overview)

### 1.1 Data Models

```typescript
interface StockItem {
  id: string
  sku: string
  name: string
  category: {
    id: string
    name: string
    path: string[]
  }
  uom: {
    primary: string
    secondary?: string
    conversionRate?: number
  }
  locations: StockLocation[]
  tracking: {
    batch: boolean
    expiry: boolean
    serialNumber: boolean
  }
  thresholds: {
    minimum: number
    maximum: number
    reorderPoint: number
    reorderQuantity: number
  }
  valuation: {
    method: 'FIFO' | 'WEIGHTED_AVERAGE'
    currentCost: number
    averageCost: number
    lastPurchasePrice: number
  }
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  metadata: Record<string, any>
  timestamps: {
    created: string
    updated: string
    lastCount: string
    lastMovement: string
  }
}

interface StockLocation {
  locationId: string
  quantity: {
    onHand: number
    allocated: number
    available: number
    inTransit: number
  }
  batches?: BatchInfo[]
  bins?: BinLocation[]
}

interface BatchInfo {
  batchNumber: string
  expiryDate: string
  quantity: number
  manufacturingDate?: string
  receivedDate: string
  cost: number
  status: 'ACTIVE' | 'QUARANTINE' | 'EXPIRED'
}
```

### 1.2 Section Components

```typescript
// KPI Dashboard Section
interface InventoryKPIs {
  totalValue: number
  totalItems: number
  lowStockItems: number
  expiringItems: number
  stockTurnover: number
  deadStock: {
    value: number
    items: number
  }
}

// Stock Grid Section
interface StockGridConfig {
  columns: GridColumn[]
  filters: FilterConfig[]
  sorting: SortConfig[]
  grouping: GroupConfig[]
  actions: ActionConfig[]
}

// Location Overview Section
interface LocationOverview {
  locationId: string
  name: string
  type: 'WAREHOUSE' | 'STORE' | 'TRANSIT'
  capacity: {
    total: number
    used: number
    available: number
  }
  items: {
    total: number
    active: number
    belowMin: number
  }
  value: number
}
```

## 2. Stock Movement Route (/inventory-management/movement)

### 2.1 Data Models

```typescript
interface StockMovement {
  id: string
  type: MovementType
  reference: string
  status: MovementStatus
  source: LocationReference
  destination: LocationReference
  items: MovementItem[]
  documentation: {
    attachments: Attachment[]
    notes: string
  }
  workflow: {
    currentStage: string
    history: WorkflowHistory[]
  }
  metadata: Record<string, any>
  timestamps: {
    created: string
    updated: string
    completed?: string
  }
  createdBy: UserReference
}

interface MovementItem {
  productId: string
  quantity: number
  batch?: string
  serialNumbers?: string[]
  cost: number
  reason?: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
}

type MovementType = 
  | 'TRANSFER'
  | 'RECEIPT'
  | 'ISSUE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'WRITE_OFF'

type MovementStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED'
```

### 2.2 Section Components

```typescript
// Movement List Section
interface MovementListConfig {
  filters: {
    dateRange: DateRange
    types: MovementType[]
    locations: string[]
    status: MovementStatus[]
  }
  columns: GridColumn[]
  actions: ActionConfig[]
}

// Movement Detail Section
interface MovementDetail {
  header: {
    reference: string
    type: MovementType
    status: MovementStatus
    dates: {
      created: string
      required?: string
      completed?: string
    }
  }
  locations: {
    source: LocationDetail
    destination: LocationDetail
  }
  items: MovementItem[]
  workflow: WorkflowStatus
  audit: AuditTrail[]
}
```

## 3. Physical Count Route (/inventory-management/physical-count)

### 3.1 Data Models

```typescript
interface PhysicalCount {
  id: string
  type: 'FULL' | 'CYCLE' | 'SPOT'
  status: CountStatus
  location: LocationReference
  schedule: {
    plannedDate: string
    startDate?: string
    endDate?: string
  }
  items: CountItem[]
  teams: CountTeam[]
  variances: VarianceReport[]
  approvals: ApprovalFlow[]
  metadata: Record<string, any>
}

interface CountItem {
  productId: string
  expectedQuantity: number
  countedQuantity: number
  variance: number
  status: 'PENDING' | 'COUNTED' | 'VERIFIED'
  batches?: BatchCount[]
  counts: {
    first: Count
    second?: Count
    final?: Count
  }
}

interface Count {
  quantity: number
  countedBy: UserReference
  countedAt: string
  notes?: string
  attachments?: Attachment[]
}
```

### 3.2 Section Components

```typescript
// Count Schedule Section
interface CountSchedule {
  calendar: {
    events: CountEvent[]
    view: 'month' | 'week' | 'day'
  }
  upcoming: ScheduledCount[]
  filters: ScheduleFilter[]
}

// Count Execution Section
interface CountExecution {
  header: CountHeader
  progress: {
    total: number
    counted: number
    verified: number
    variance: number
  }
  countSheet: {
    items: CountSheetItem[]
    actions: CountAction[]
  }
  validation: {
    rules: ValidationRule[]
    results: ValidationResult[]
  }
}
```

## 4. Settings Route (/inventory-management/settings)

### 4.1 Data Models

```typescript
interface InventorySettings {
  general: {
    valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE'
    trackingOptions: TrackingOptions
    thresholdRules: ThresholdRule[]
  }
  locations: {
    types: LocationType[]
    hierarchy: LocationHierarchy[]
    binSetup: BinConfiguration[]
  }
  counting: {
    schedules: CountScheduleRule[]
    tolerances: ToleranceRule[]
    approvalWorkflow: WorkflowDefinition
  }
  notifications: {
    triggers: NotificationTrigger[]
    templates: NotificationTemplate[]
    recipients: RecipientRule[]
  }
}

interface TrackingOptions {
  batchTracking: boolean
  expiryTracking: boolean
  serialTracking: boolean
  costTracking: boolean
  binTracking: boolean
}
```

### 4.2 Section Components

```typescript
// Location Settings Section
interface LocationSettings {
  types: LocationTypeConfig[]
  hierarchy: HierarchyConfig[]
  mapping: LocationMapping[]
  zones: ZoneDefinition[]
}

// Count Configuration Section
interface CountConfiguration {
  schedules: ScheduleConfig[]
  rules: CountRuleConfig[]
  workflows: WorkflowConfig[]
  tolerances: ToleranceConfig[]
}
```

## 5. Common Types

```typescript
interface LocationReference {
  id: string
  name: string
  type: string
  code: string
}

interface UserReference {
  id: string
  name: string
  role: string
}

interface Attachment {
  id: string
  type: string
  url: string
  filename: string
  uploadedBy: string
  uploadedAt: string
}

interface WorkflowHistory {
  stage: string
  action: string
  user: UserReference
  timestamp: string
  notes?: string
}

interface AuditTrail {
  action: string
  timestamp: string
  user: UserReference
  details: Record<string, any>
}
```

Would you like me to:
1. Add more detailed type definitions?
2. Include validation rules?
3. Add state management interfaces?
4. Define API endpoints for these data structures?