# Inventory Management Module - Product Requirements Document (PRD)

## 1. Introduction
[Previous introduction sections remain the same...]

## 2. Module Structure

### 2.1 Directory Layout
```
app/
└── (main)/
    └── inventory-management/
        ├── stock-overview/
        │   ├── page.tsx
        │   ├── inventory-balance/
        │   │   └── page.tsx
        │   ├── stock-card/
        │   │   └── page.tsx
        │   ├── slow-moving/
        │   │   └── page.tsx
        │   ├── inventory-aging/
        │   │   └── page.tsx
        │   ├── stock-valuation/
        │   │   └── page.tsx
        │   ├── stock-movement/
        │   │   └── page.tsx
        │   └── components/
        ├── transactions/
        │   ├── stock-transfer/
        │   │   ├── page.tsx
        │   │   └── [id]/
        │   ├── stock-return/
        │   │   ├── page.tsx
        │   │   └── [id]/
        │   ├── stock-write-off/
        │   │   ├── page.tsx
        │   │   └── [id]/
        │   ├── stock-conversion/
        │   │   ├── page.tsx
        │   │   └── [id]/
        │   └── components/
        ├── physical-count/
        │   ├── schedule/
        │   │   └── page.tsx
        │   ├── execution/
        │   │   ├── page.tsx
        │   │   └── [id]/
        │   ├── variance/
        │   │   └── page.tsx
        │   ├── history/
        │   │   └── page.tsx
        │   └── components/
        ├── settings/
        │   ├── locations/
        │   │   └── page.tsx
        │   ├── count-config/
        │   │   └── page.tsx
        │   ├── reorder-rules/
        │   │   └── page.tsx
        │   ├── stock-parameters/
        │   │   └── page.tsx
        │   └── components/
        └── reports/
            ├── stock-status/
            │   └── page.tsx
            ├── movement-analysis/
            │   └── page.tsx
            ├── variance/
            │   └── page.tsx
            ├── valuation/
            │   └── page.tsx
            ├── audit/
            │   └── page.tsx
            └── components/
```

### 2.2 Route Mapping

#### Stock Overview
- `/inventory-management/stock-overview` - Main stock overview dashboard
- `/inventory-management/stock-overview/inventory-balance` - Current inventory levels
- `/inventory-management/stock-overview/stock-card` - Individual item stock cards
- `/inventory-management/stock-overview/slow-moving` - Slow-moving inventory analysis
- `/inventory-management/stock-overview/inventory-aging` - Age-based inventory analysis
- `/inventory-management/stock-overview/stock-valuation` - Value-based inventory analysis
- `/inventory-management/stock-overview/stock-movement` - Movement history and trends

#### Inventory Transactions
- `/inventory-management/transactions/stock-transfer` - Internal stock transfers
- `/inventory-management/transactions/stock-return` - Return processing
- `/inventory-management/transactions/stock-write-off` - Write-off management
- `/inventory-management/transactions/stock-conversion` - Stock unit conversion

#### Physical Count
- `/inventory-management/physical-count/schedule` - Count scheduling
- `/inventory-management/physical-count/execution` - Active count execution
- `/inventory-management/physical-count/variance` - Variance analysis
- `/inventory-management/physical-count/history` - Historical counts

#### Inventory Settings
- `/inventory-management/settings/locations` - Storage location management
- `/inventory-management/settings/count-config` - Count configuration
- `/inventory-management/settings/reorder-rules` - Reorder point settings
- `/inventory-management/settings/stock-parameters` - Stock control parameters

#### Reports
- `/inventory-management/reports/stock-status` - Current stock status
- `/inventory-management/reports/movement-analysis` - Movement analysis
- `/inventory-management/reports/variance` - Variance reporting
- `/inventory-management/reports/valuation` - Value-based reporting
- `/inventory-management/reports/audit` - Audit trail reports

## 3. UI Components

### 3.1 Dashboard Layout
Following the standard report page layout (ref: `docs/report-page-spec.md`):

#### 3.1.1 Header Section (60px height)
- Left: Page title with breadcrumbs
- Right: Action buttons
  - Export (PDF, CSV, Excel)
  - Share/Schedule
  - Print
  - Settings/Customize

#### 3.1.2 Secondary Header (48px height)
- Date range selector
- View selector
- Comparison toggle

#### 3.1.3 Filter Panel
- Width: 280px (collapsible)
- Components:
  - Quick filters
  - Advanced filters
  - Filter chips
  - Clear all button
  - Save preset option

### 3.2 Stock Overview Screen
Based on existing stock-overview-ba.md patterns:

```typescript
interface StockOverviewWidget {
  location: string;
  metrics: {
    totalValue: number;
    itemCount: number;
    lowStock: number;
    expiringItems: number;
  };
  alerts: StockAlert[];
  movements: RecentMovement[];
}

interface StockAlert {
  type: 'LOW_STOCK' | 'EXPIRING' | 'EXCESS' | 'INACTIVE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  itemCount: number;
  value: number;
}
```

### 3.3 Movement Management
Following Carmen's standard UI patterns:

#### 3.3.1 List View
- Data grid with inline actions
- Status indicators using system colors:
  - Draft: Gray
  - Pending: Yellow
  - Completed: Green
  - Cancelled: Red

#### 3.3.2 Movement Form
```typescript
interface MovementForm {
  type: MovementType;
  source: LocationReference;
  destination?: LocationReference;
  items: MovementItem[];
  attachments: Attachment[];
  notes: string;
  reference: string;
}
```

## 4. Data Structures

### 4.1 Core Entities
```typescript
interface InventoryLocation {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'PRODUCTION';
  address: Address;
  status: 'ACTIVE' | 'INACTIVE';
  settings: LocationSettings;
}

interface StockItem {
  id: string;
  productId: string;
  locationId: string;
  quantity: Decimal;
  reservedQuantity: Decimal;
  availableQuantity: Decimal;
  unitCost: Decimal;
  totalValue: Decimal;
  lastCountDate: DateTime;
  lastMovementDate: DateTime;
  batchTracking: BatchTrackingInfo[];
}

interface BatchTrackingInfo {
  batchNumber: string;
  manufacturingDate?: DateTime;
  expiryDate?: DateTime;
  quantity: Decimal;
  unitCost: Decimal;
}
```

### 4.2 Movement Tracking
```typescript
interface StockMovement {
  id: string;
  type: MovementType;
  status: MovementStatus;
  sourceLocationId: string;
  destinationLocationId?: string;
  items: MovementItem[];
  totalValue: Decimal;
  createdBy: string;
  createdAt: DateTime;
  approvedBy?: string;
  approvedAt?: DateTime;
  workflow: WorkflowInstance;
}

interface MovementItem {
  productId: string;
  quantity: Decimal;
  unitCost: Decimal;
  totalCost: Decimal;
  batchNumber?: string;
  expiryDate?: DateTime;
}
```

### 4.3 Physical Count
```typescript
interface PhysicalCount {
  id: string;
  locationId: string;
  status: CountStatus;
  scheduledDate: DateTime;
  completedDate?: DateTime;
  counters: UserReference[];
  verifiers: UserReference[];
  items: CountItem[];
  variance: VarianceReport;
  workflow: WorkflowInstance;
}

interface CountItem {
  productId: string;
  systemQuantity: Decimal;
  countedQuantity: Decimal;
  variance: Decimal;
  varianceValue: Decimal;
  notes: string;
  images: string[];
}
```

## 5. Integration Points

### 5.1 Workflow Integration
Utilizing the existing workflow engine (ref: `docs/workflow-ba.md`):

```typescript
interface InventoryWorkflow {
  type: 'MOVEMENT' | 'COUNT' | 'ADJUSTMENT';
  stages: WorkflowStage[];
  currentStage: string;
  status: WorkflowStatus;
  approvers: UserReference[];
  history: WorkflowHistory[];
}
```

### 5.2 Notification System
Following the platform notification architecture (ref: `docs/platform/brd.md`):

```typescript
interface InventoryNotification {
  type: 'STOCK_ALERT' | 'MOVEMENT_STATUS' | 'COUNT_REQUIRED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  targetUsers: UserReference[];
  data: NotificationData;
  channels: NotificationChannel[];
}
```

[Previous sections 6-9 remain the same...]
```

This updated PRD now:
1. Aligns with the existing project structure
2. Uses consistent UI patterns from the report specs
3. Incorporates the workflow system
4. Matches the notification architecture
5. Follows established data structures

Would you like me to:
1. Detail any specific component further?
2. Add more integration examples?
3. Expand the UI specifications?
4. Include additional technical details?
