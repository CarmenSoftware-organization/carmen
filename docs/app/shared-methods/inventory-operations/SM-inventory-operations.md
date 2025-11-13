# Shared Method: Inventory Operations

## Document Information
- **Version**: 1.0.0
- **Last Updated**: 2025-01-12
- **Status**: Active
- **Maintained By**: Architecture Team

## Related Documentation
- [Inventory Transactions System](../../inventory-management/inventory-transactions/SM-inventory-transactions.md)
- [Fractional Inventory System](../../inventory-management/fractional-inventory/TS-fractional-inventory.md)
- [Inventory Valuation Service](../inventory-valuation/SM-inventory-valuation.md)

---

## 1. Purpose

The **Inventory Operations** shared method provides centralized, consistent functionality for inventory management operations across multiple modules. It ensures data integrity, audit trail compliance, and standardized patterns for inventory movements, balance tracking, and transaction recording.

**Key Benefits**:
- ✅ **Single Source of Truth**: Centralized inventory operation logic
- ✅ **Consistency**: Same patterns applied across all inventory modules
- ✅ **Data Integrity**: Atomic operations with rollback capability
- ✅ **Audit Compliance**: Standardized audit trail for all operations
- ✅ **Maintainability**: Updates in one location affect entire application

---

## 2. Scope

### 2.1 Modules Using This Shared Method

| Module | Use Cases | Integration Points |
|--------|-----------|-------------------|
| **Inventory Transactions** | GRN, Issues, Transfers, Adjustments | Balance updates, transaction recording, GL posting |
| **Fractional Inventory** | Split, Combine, Prepare, Portion operations | Stock tracking, conversion recording, quality management |
| **Store Operations** | Requisitions, wastage tracking | Stock deductions, allocation management |
| **Production** | Material consumption, finished goods | WIP tracking, material usage |
| **Physical Count** | Stock counts, variance adjustments | Reconciliation, adjustment recording |
| **Lot-Based Costing** | Lot tracking, batch management | Cost layer management, lot traceability |

### 2.2 Shared Operations

The following operations are standardized across all inventory modules:

1. **Balance Tracking** - Real-time inventory balance updates
2. **Transaction Recording** - Audit trail for all movements
3. **State Management** - Lifecycle state transitions
4. **Location-Based Operations** - Multi-location inventory tracking
5. **Validation** - Pre-operation validation and business rules
6. **Atomic Operations** - Database transaction management
7. **Audit Trail** - Standardized audit fields and logging
8. **Integration Events** - Event-driven module integration

---

## 3. Core Services

### 3.1 Inventory Balance Service

**Service Location**: `/lib/services/db/inventory-balance-service.ts`

**Purpose**: Centralized inventory balance tracking with atomic updates and concurrency control.

#### Key Features
- Real-time balance updates (quantity on-hand, allocated, available)
- Multi-location support
- Optimistic locking for concurrency
- Negative inventory prevention (configurable)
- Balance snapshot for audit trail

#### Data Structure
```typescript
interface InventoryBalance {
  itemId: string
  locationId: string

  // Quantity tracking
  quantityOnHand: number
  quantityAllocated: number
  quantityAvailable: number  // onHand - allocated

  // Reserved tracking (for orders not yet fulfilled)
  quantityReserved: number

  // Cost tracking (for reporting, NOT used for transaction costing)
  averageUnitCost: number
  totalValue: number

  // Version control
  version: number

  // Last updated
  lastTransactionDate: Date
  lastTransactionId: string

  // Audit
  updatedAt: Date
  updatedBy: string
}
```

#### API Methods

**1. Get Balance**
```typescript
async getBalance(
  itemId: string,
  locationId: string
): Promise<InventoryBalance>
```

**2. Update Balance (Atomic)**
```typescript
async updateBalance(
  itemId: string,
  locationId: string,
  quantityChange: number,
  transactionId: string,
  currentVersion: number
): Promise<InventoryBalance>
```

**3. Reserve Quantity**
```typescript
async reserveQuantity(
  itemId: string,
  locationId: string,
  quantity: number,
  reservationId: string
): Promise<InventoryBalance>
```

**4. Release Reservation**
```typescript
async releaseReservation(
  reservationId: string
): Promise<InventoryBalance>
```

**5. Bulk Balance Update**
```typescript
async updateBalanceBatch(
  updates: BalanceUpdate[]
): Promise<BatchUpdateResult>
```

#### Usage Example
```typescript
import { InventoryBalanceService } from '@/lib/services/db/inventory-balance-service'

const balanceService = new InventoryBalanceService()

// Get current balance
const balance = await balanceService.getBalance(itemId, locationId)

// Update balance atomically
try {
  const updated = await balanceService.updateBalance(
    itemId,
    locationId,
    -10,  // Reduce by 10 units
    transactionId,
    balance.version
  )
  console.log(`New balance: ${updated.quantityOnHand}`)
} catch (error) {
  if (error instanceof ConcurrencyError) {
    // Retry the operation
  }
}
```

---

### 3.2 Transaction Recording Service

**Service Location**: `/lib/services/db/transaction-recording-service.ts`

**Purpose**: Standardized recording of all inventory movements with audit trail.

#### Key Features
- Unified transaction recording across all modules
- Source document linking
- Immutable audit trail
- Reversal support
- Batch processing
- Integration event triggering

#### Data Structure
```typescript
interface InventoryOperation {
  // Identification
  id: string
  operationNumber: string
  operationDate: Date

  // Classification
  operationType: OperationType  // RECEIPT, ISSUE, TRANSFER, ADJUST, CONVERT
  movementType: MovementType    // IN, OUT, TRANSFER, TRANSFORM

  // Item & Location
  itemId: string
  locationId: string

  // Quantity & Cost
  quantity: number
  unitCost: number
  totalCost: number

  // Source Document
  sourceModule: string          // PROCUREMENT, FRACTIONAL, STORE_OPS, etc.
  sourceDocumentType: string    // GRN, CONVERSION, REQUISITION, etc.
  sourceDocumentId: string
  sourceDocumentNumber: string

  // Additional Context
  metadata: Json                 // Module-specific data

  // Status
  status: OperationStatus       // DRAFT, POSTED, COMPLETED, REVERSED
  postedAt?: Date
  postedBy?: string
  reversedBy?: string
  reversalDate?: Date
  reversalReason?: string

  // Audit
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
}
```

#### Operation Types
```typescript
enum OperationType {
  // Standard inventory transactions
  RECEIPT = 'RECEIPT',           // Goods received (GRN)
  ISSUE = 'ISSUE',               // Store requisition, production use
  TRANSFER = 'TRANSFER',         // Inter-location transfer
  ADJUST = 'ADJUST',             // Stock count adjustment
  RETURN = 'RETURN',             // Vendor return

  // Fractional inventory operations
  SPLIT = 'SPLIT',               // Convert whole to portions
  COMBINE = 'COMBINE',           // Combine portions to whole
  PREPARE = 'PREPARE',           // RAW → PREPARED state
  PORTION = 'PORTION',           // PREPARED → PORTIONED state
  WASTE = 'WASTE',               // Mark as waste

  // Other operations
  ALLOCATE = 'ALLOCATE',         // Reserve for orders
  CONSUME = 'CONSUME',           // Production consumption
  PRODUCE = 'PRODUCE',           // Finished goods production
}

enum MovementType {
  IN = 'IN',                     // Increases inventory
  OUT = 'OUT',                   // Decreases inventory
  TRANSFER = 'TRANSFER',         // Moves between locations
  TRANSFORM = 'TRANSFORM',       // Changes state without movement
}

enum OperationStatus {
  DRAFT = 'DRAFT',               // Created but not posted
  POSTED = 'POSTED',             // Posted, balance updated
  COMPLETED = 'COMPLETED',       // Finalized, immutable
  REVERSED = 'REVERSED',         // Reversed by another operation
  CANCELLED = 'CANCELLED',       // Cancelled before posting
}
```

#### API Methods

**1. Record Operation**
```typescript
async recordOperation(
  operation: CreateOperationInput
): Promise<InventoryOperation>
```

**2. Post Operation (Update Balances)**
```typescript
async postOperation(
  operationId: string,
  userId: string
): Promise<InventoryOperation>
```

**3. Reverse Operation**
```typescript
async reverseOperation(
  operationId: string,
  reason: string,
  userId: string
): Promise<InventoryOperation>
```

**4. Batch Record Operations**
```typescript
async recordOperationBatch(
  operations: CreateOperationInput[]
): Promise<BatchOperationResult>
```

**5. Get Operation History**
```typescript
async getOperationHistory(
  itemId: string,
  locationId: string,
  filters?: HistoryFilters
): Promise<InventoryOperation[]>
```

#### Usage Example
```typescript
import { TransactionRecordingService } from '@/lib/services/db/transaction-recording-service'

const recordingService = new TransactionRecordingService()

// Record conversion operation
const operation = await recordingService.recordOperation({
  operationType: 'SPLIT',
  movementType: 'TRANSFORM',
  itemId: item.id,
  locationId: location.id,
  quantity: 10,
  unitCost: 25.50,
  totalCost: 255.00,
  sourceModule: 'FRACTIONAL',
  sourceDocumentType: 'CONVERSION',
  sourceDocumentId: conversion.id,
  sourceDocumentNumber: conversion.number,
  metadata: {
    portionSize: 'Slice',
    portionsPerWhole: 8,
    expectedPortions: 80,
    actualPortions: 78,
    waste: 2
  },
  userId: session.user.id
})

// Post the operation (updates balances)
await recordingService.postOperation(operation.id, session.user.id)
```

---

### 3.3 State Management Service

**Service Location**: `/lib/services/db/state-management-service.ts`

**Purpose**: Standardized lifecycle state transitions with validation.

#### Key Features
- State transition validation
- State history tracking
- Audit trail for state changes
- Rollback support
- Integration event triggering

#### State Definitions

**Inventory Transaction States**
```typescript
enum TransactionState {
  DRAFT = 'DRAFT',               // Created, can be modified
  PENDING_APPROVAL = 'PENDING_APPROVAL',  // Awaiting approval
  APPROVED = 'APPROVED',         // Approved, ready to post
  POSTED = 'POSTED',             // Posted, balance updated
  COMPLETED = 'COMPLETED',       // Finalized, immutable
  REVERSED = 'REVERSED',         // Reversed
  CANCELLED = 'CANCELLED',       // Cancelled
  REJECTED = 'REJECTED',         // Approval rejected
}
```

**Fractional Stock States**
```typescript
enum FractionalState {
  RAW = 'raw',                   // Original whole items
  PREPARED = 'prepared',         // Processed but not portioned
  PORTIONED = 'portioned',       // Divided into sellable portions
  PARTIAL = 'partial',           // Partially consumed
  COMBINED = 'combined',         // Portions combined back
  WASTE = 'waste',               // Marked as waste
}
```

**Quality States**
```typescript
enum QualityGrade {
  EXCELLENT = 'excellent',       // Within max quality hours
  GOOD = 'good',                 // After max quality, before 75% shelf life
  FAIR = 'fair',                 // 75-90% of shelf life elapsed
  POOR = 'poor',                 // 90-100% of shelf life elapsed
  EXPIRED = 'expired',           // Past shelf life
}
```

#### State Transition Rules

**Transaction State Transitions**
```
DRAFT → POSTED → COMPLETED
  ↓        ↓
CANCELLED  REVERSED

DRAFT → PENDING_APPROVAL → APPROVED → POSTED → COMPLETED
  ↓              ↓                        ↓
CANCELLED    REJECTED                 REVERSED
```

**Fractional Stock State Transitions**
```
RAW → PREPARED → PORTIONED → PARTIAL
                    ↓
                 COMBINED → RAW

Any state → WASTE (one-way, irreversible)
```

**Quality Grade Transitions**
```
EXCELLENT → GOOD → FAIR → POOR → EXPIRED
(Time-based, automatic, irreversible)
```

#### API Methods

**1. Validate Transition**
```typescript
async validateStateTransition(
  currentState: string,
  targetState: string,
  entityType: EntityType
): Promise<ValidationResult>
```

**2. Transition State**
```typescript
async transitionState(
  entityId: string,
  entityType: EntityType,
  targetState: string,
  reason?: string,
  userId?: string
): Promise<StateTransitionResult>
```

**3. Get State History**
```typescript
async getStateHistory(
  entityId: string,
  entityType: EntityType
): Promise<StateHistory[]>
```

**4. Rollback State**
```typescript
async rollbackState(
  entityId: string,
  entityType: EntityType,
  userId: string
): Promise<StateTransitionResult>
```

#### Usage Example
```typescript
import { StateManagementService } from '@/lib/services/db/state-management-service'

const stateService = new StateManagementService()

// Validate transition
const validation = await stateService.validateStateTransition(
  'DRAFT',
  'POSTED',
  'TRANSACTION'
)

if (validation.isValid) {
  // Perform transition
  const result = await stateService.transitionState(
    transactionId,
    'TRANSACTION',
    'POSTED',
    'Posting approved transaction',
    session.user.id
  )

  console.log(`State changed: ${result.fromState} → ${result.toState}`)
} else {
  console.error(`Invalid transition: ${validation.errors.join(', ')}`)
}
```

---

### 3.4 Location Management Service

**Service Location**: `/lib/services/db/location-management-service.ts`

**Purpose**: Location-based inventory operations with permission control.

#### Key Features
- Multi-location support
- Location hierarchy (warehouses, departments, bins)
- Permission-based access control
- Location transfer validation
- Inter-location reconciliation

#### Data Structure
```typescript
interface LocationAccess {
  userId: string
  locationId: string
  permissions: LocationPermission[]
  effectiveFrom: Date
  effectiveUntil?: Date
}

interface LocationPermission {
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSFER' | 'ADJUST'
  scope: 'OWN' | 'DEPARTMENT' | 'ALL'
}
```

#### API Methods

**1. Check Location Access**
```typescript
async checkLocationAccess(
  userId: string,
  locationId: string,
  action: LocationPermission['action']
): Promise<boolean>
```

**2. Get User Locations**
```typescript
async getUserLocations(
  userId: string
): Promise<Location[]>
```

**3. Validate Transfer**
```typescript
async validateTransfer(
  sourceLocationId: string,
  targetLocationId: string,
  itemId: string,
  quantity: number
): Promise<TransferValidationResult>
```

**4. Get Location Inventory**
```typescript
async getLocationInventory(
  locationId: string,
  filters?: InventoryFilters
): Promise<LocationInventory>
```

#### Usage Example
```typescript
import { LocationManagementService } from '@/lib/services/db/location-management-service'

const locationService = new LocationManagementService()

// Check access before operation
const hasAccess = await locationService.checkLocationAccess(
  session.user.id,
  locationId,
  'UPDATE'
)

if (!hasAccess) {
  throw new UnauthorizedError('No access to this location')
}

// Validate transfer
const validation = await locationService.validateTransfer(
  sourceLocationId,
  targetLocationId,
  itemId,
  quantity
)

if (!validation.isValid) {
  throw new ValidationError(validation.errors.join(', '))
}
```

---

### 3.5 Validation Service

**Service Location**: `/lib/services/db/operation-validation-service.ts`

**Purpose**: Centralized validation for all inventory operations.

#### Key Features
- Pre-operation validation
- Business rule enforcement
- Data integrity checks
- Permission validation
- Cross-module validation

#### Validation Categories

**1. Quantity Validation**
- Sufficient inventory available
- Valid quantity format (positive, within limits)
- Negative inventory prevention
- Reserved quantity checks

**2. State Validation**
- Valid state transitions
- Operation allowed in current state
- Quality grade validation
- Expiry checks

**3. Permission Validation**
- User has required permissions
- Location access validation
- Action authorization
- Role-based access control

**4. Business Rule Validation**
- Module-specific business rules
- Cross-module consistency
- Data integrity constraints
- Compliance requirements

#### API Methods

**1. Validate Operation**
```typescript
async validateOperation(
  operation: OperationValidationInput
): Promise<ValidationResult>
```

**2. Validate Batch Operations**
```typescript
async validateOperationBatch(
  operations: OperationValidationInput[]
): Promise<BatchValidationResult>
```

**3. Check Business Rules**
```typescript
async checkBusinessRules(
  ruleSet: string,
  context: ValidationContext
): Promise<BusinessRuleResult>
```

#### Usage Example
```typescript
import { OperationValidationService } from '@/lib/services/db/operation-validation-service'

const validationService = new OperationValidationService()

// Validate before operation
const validation = await validationService.validateOperation({
  operationType: 'SPLIT',
  itemId: item.id,
  locationId: location.id,
  quantity: 10,
  userId: session.user.id,
  context: {
    currentState: 'RAW',
    targetState: 'PORTIONED',
    qualityGrade: 'EXCELLENT'
  }
})

if (!validation.isValid) {
  // Handle validation errors
  throw new ValidationError(validation.errors)
}

// Proceed with operation
```

---

### 3.6 Atomic Transaction Service

**Service Location**: `/lib/services/db/atomic-transaction-service.ts`

**Purpose**: Database transaction management with rollback capability.

#### Key Features
- Atomic operations (all-or-nothing)
- Automatic rollback on error
- Nested transaction support
- Savepoint management
- Deadlock detection and retry

#### API Methods

**1. Execute Transaction**
```typescript
async executeTransaction<T>(
  operations: TransactionOperation[],
  options?: TransactionOptions
): Promise<T>
```

**2. Execute with Retry**
```typescript
async executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries?: number
): Promise<T>
```

**3. Create Savepoint**
```typescript
async createSavepoint(
  name: string
): Promise<Savepoint>
```

**4. Rollback to Savepoint**
```typescript
async rollbackToSavepoint(
  savepoint: Savepoint
): Promise<void>
```

#### Usage Example
```typescript
import { AtomicTransactionService } from '@/lib/services/db/atomic-transaction-service'

const txService = new AtomicTransactionService()

// Execute multiple operations atomically
const result = await txService.executeTransaction([
  // Operation 1: Update stock
  async (tx) => {
    return await tx.fractionalStock.update({
      where: { id: stockId },
      data: { wholeUnits: { decrement: 10 } }
    })
  },

  // Operation 2: Create conversion record
  async (tx) => {
    return await tx.conversionRecord.create({
      data: {
        itemCode: item.code,
        conversionType: 'SPLIT',
        unitsConverted: 10,
        // ... other fields
      }
    })
  },

  // Operation 3: Update balance
  async (tx) => {
    return await balanceService.updateBalance(
      item.id,
      location.id,
      -10,
      conversionId,
      currentVersion,
      tx
    )
  }
])

// If any operation fails, all changes are rolled back automatically
```

---

### 3.7 Audit Trail Service

**Service Location**: `/lib/services/db/audit-trail-service.ts`

**Purpose**: Standardized audit logging for all inventory operations.

#### Key Features
- Comprehensive audit trail
- Before/after snapshots
- User action logging
- Change reason tracking
- Compliance reporting

#### Audit Data Structure
```typescript
interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: AuditAction

  // What changed
  beforeSnapshot: Json
  afterSnapshot: Json
  changes: FieldChange[]

  // Who & When
  userId: string
  userName: string
  userRole: string
  timestamp: Date

  // Why
  reason?: string
  sourceModule: string

  // Context
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

interface FieldChange {
  field: string
  oldValue: any
  newValue: any
  dataType: string
}

enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  POST = 'POST',
  REVERSE = 'REVERSE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  STATE_CHANGE = 'STATE_CHANGE'
}
```

#### API Methods

**1. Log Action**
```typescript
async logAction(
  action: AuditLogInput
): Promise<AuditLog>
```

**2. Get Audit Trail**
```typescript
async getAuditTrail(
  entityType: string,
  entityId: string,
  filters?: AuditFilters
): Promise<AuditLog[]>
```

**3. Batch Log Actions**
```typescript
async logActionBatch(
  actions: AuditLogInput[]
): Promise<AuditLog[]>
```

**4. Generate Audit Report**
```typescript
async generateAuditReport(
  criteria: AuditReportCriteria
): Promise<AuditReport>
```

#### Usage Example
```typescript
import { AuditTrailService } from '@/lib/services/db/audit-trail-service'

const auditService = new AuditTrailService()

// Log conversion operation
await auditService.logAction({
  entityType: 'FRACTIONAL_STOCK',
  entityId: stock.id,
  action: 'UPDATE',
  beforeSnapshot: oldStock,
  afterSnapshot: newStock,
  changes: [
    {
      field: 'wholeUnits',
      oldValue: 10,
      newValue: 0,
      dataType: 'number'
    },
    {
      field: 'totalPortions',
      oldValue: 0,
      newValue: 80,
      dataType: 'number'
    }
  ],
  userId: session.user.id,
  userName: session.user.name,
  userRole: session.user.role,
  reason: 'Split conversion for dinner service',
  sourceModule: 'FRACTIONAL_INVENTORY'
})
```

---

### 3.8 Integration Event Service

**Service Location**: `/lib/services/db/integration-event-service.ts`

**Purpose**: Event-driven integration between inventory modules.

#### Key Features
- Event publishing
- Event subscription
- Asynchronous processing
- Retry logic
- Event history

#### Event Types
```typescript
enum InventoryEventType {
  // Transaction events
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_POSTED = 'transaction.posted',
  TRANSACTION_REVERSED = 'transaction.reversed',

  // Stock events
  STOCK_UPDATED = 'stock.updated',
  STOCK_LOW = 'stock.low',
  STOCK_RESERVED = 'stock.reserved',

  // Conversion events
  CONVERSION_COMPLETED = 'conversion.completed',
  CONVERSION_FAILED = 'conversion.failed',

  // Quality events
  QUALITY_DEGRADED = 'quality.degraded',
  QUALITY_EXPIRED = 'quality.expired',

  // Alert events
  ALERT_CREATED = 'alert.created',
  ALERT_ACKNOWLEDGED = 'alert.acknowledged'
}
```

#### Event Structure
```typescript
interface InventoryEvent {
  id: string
  eventType: InventoryEventType
  timestamp: Date

  // Event data
  payload: Json

  // Source
  sourceModule: string
  sourceEntityType: string
  sourceEntityId: string

  // Processing
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  retryCount: number
  maxRetries: number
  errorMessage?: string

  // Audit
  createdAt: Date
  processedAt?: Date
}
```

#### API Methods

**1. Publish Event**
```typescript
async publishEvent(
  event: EventPublishInput
): Promise<InventoryEvent>
```

**2. Subscribe to Events**
```typescript
async subscribe(
  eventTypes: InventoryEventType[],
  handler: EventHandler
): Promise<Subscription>
```

**3. Process Events**
```typescript
async processEvents(
  batchSize?: number
): Promise<ProcessingResult>
```

**4. Get Event History**
```typescript
async getEventHistory(
  filters: EventFilters
): Promise<InventoryEvent[]>
```

#### Usage Example
```typescript
import { IntegrationEventService } from '@/lib/services/db/integration-event-service'

const eventService = new IntegrationEventService()

// Publish conversion event
await eventService.publishEvent({
  eventType: 'CONVERSION_COMPLETED',
  sourceModule: 'FRACTIONAL_INVENTORY',
  sourceEntityType: 'CONVERSION_RECORD',
  sourceEntityId: conversion.id,
  payload: {
    itemId: item.id,
    locationId: location.id,
    conversionType: 'SPLIT',
    unitsConverted: 10,
    portionsCreated: 80,
    waste: 2,
    efficiency: 0.975
  }
})

// Subscribe to stock low events
await eventService.subscribe(
  ['STOCK_LOW'],
  async (event) => {
    // Handle event
    console.log(`Stock low for item: ${event.payload.itemId}`)

    // Create alert or notification
    await alertService.createAlert({
      alertType: 'STOCK_LOW',
      itemId: event.payload.itemId,
      locationId: event.payload.locationId,
      severity: 'HIGH'
    })
  }
)
```

---

## 4. Common Patterns

### 4.1 Standard Audit Fields

All inventory-related tables MUST include these standard fields:

```prisma
// Creation audit
created_at     DateTime @default(now()) @db.Timestamptz(6)
created_by_id  String?  @db.Uuid

// Update audit
updated_at     DateTime @updatedAt @db.Timestamptz(6)
updated_by_id  String?  @db.Uuid

// Soft delete audit
deleted_at     DateTime? @db.Timestamptz(6)
deleted_by_id  String?  @db.Uuid
```

### 4.2 Common Metadata Fields

For flexible data storage across modules:

```prisma
// Flexible metadata (module-specific data)
info       Json? @db.Json

// Dimension tracking (consistent with other tables)
dimension  Json? @db.Json

// Document version tracking
doc_version Decimal @default(0) @db.Decimal
```

### 4.3 Standard Naming Conventions

**Database Conventions**:
- **Tables**: `tb_` prefix, snake_case (e.g., `tb_fractional_item`)
- **Fields**: snake_case (e.g., `created_at`, `location_id`)
- **Enums**: `enum_` prefix, lowercase values (e.g., `enum_fractional_state`, `raw`)
- **Indexes**: `idx_` prefix (e.g., `idx_item_location`)
- **Foreign Keys**: `_id` suffix (e.g., `created_by_id`, `location_id`)
- **UUID Decorators**: `@db.Uuid` for all UUID fields
- **Timestamp Decorators**: `@db.Timestamptz(6)` for all datetime fields

**TypeScript Conventions**:
- **Interfaces**: PascalCase (e.g., `FractionalItem`, `InventoryBalance`)
- **Enums**: PascalCase for enum, UPPER_CASE for values
- **Variables**: camelCase
- **Functions**: camelCase with verb prefixes

### 4.4 Error Handling Pattern

Standard error structure across all services:

```typescript
interface InventoryError {
  code: string              // Error code (e.g., 'INV-001')
  message: string           // User-friendly message
  technicalDetails?: string // Technical details for logging
  entityType?: string       // Entity type (TRANSACTION, STOCK, etc.)
  entityId?: string         // Entity ID
  fieldErrors?: FieldError[] // Field-level errors
  timestamp: Date
}

interface FieldError {
  field: string
  message: string
  value?: any
}
```

Common error codes:
- `INV-001`: Insufficient inventory
- `INV-002`: Invalid operation
- `INV-003`: Permission denied
- `INV-004`: Invalid state transition
- `INV-005`: Concurrency conflict
- `INV-006`: Validation failed
- `INV-007`: Operation not allowed
- `INV-008`: Entity not found
- `INV-009`: Duplicate operation
- `INV-010`: System error

### 4.5 Permission Checking Pattern

Standard permission check before operations:

```typescript
// Permission structure
interface InventoryPermission {
  module: string            // INVENTORY, FRACTIONAL, STORE_OPS, etc.
  action: string            // VIEW, CREATE, UPDATE, DELETE, POST, APPROVE
  scope: string             // OWN, DEPARTMENT, LOCATION, ALL
}

// Usage pattern
async function checkPermission(
  userId: string,
  permission: InventoryPermission
): Promise<boolean> {
  const user = await getUserWithPermissions(userId)

  return user.permissions.some(p =>
    p.module === permission.module &&
    p.action === permission.action &&
    (p.scope === 'ALL' || p.scope === permission.scope)
  )
}

// Example usage
if (!await checkPermission(userId, {
  module: 'FRACTIONAL',
  action: 'CREATE',
  scope: 'DEPARTMENT'
})) {
  throw new PermissionDeniedError('Insufficient permissions for this operation')
}
```

---

## 5. Integration Patterns

### 5.1 Module-to-Module Integration

**Pattern**: Event-driven integration with clear boundaries

```typescript
// Module A publishes event
await eventService.publishEvent({
  eventType: 'CONVERSION_COMPLETED',
  sourceModule: 'FRACTIONAL_INVENTORY',
  payload: conversionData
})

// Module B subscribes to event
await eventService.subscribe(
  ['CONVERSION_COMPLETED'],
  async (event) => {
    // Handle event in Module B
    await updateInventoryBalance(event.payload)
  }
)
```

### 5.2 Service-to-Service Integration

**Pattern**: Direct service calls with dependency injection

```typescript
// Service composition
class FractionalInventoryService {
  constructor(
    private balanceService: InventoryBalanceService,
    private recordingService: TransactionRecordingService,
    private auditService: AuditTrailService
  ) {}

  async splitConversion(input: SplitConversionInput): Promise<ConversionResult> {
    // Use composed services
    const balance = await this.balanceService.getBalance(input.itemId, input.locationId)

    // Record operation
    const operation = await this.recordingService.recordOperation({
      operationType: 'SPLIT',
      ...input
    })

    // Log audit
    await this.auditService.logAction({
      action: 'CREATE',
      entityType: 'CONVERSION',
      ...
    })

    return result
  }
}
```

### 5.3 Database Transaction Integration

**Pattern**: Transactional consistency across services

```typescript
// All services support transaction context
await txService.executeTransaction([
  async (tx) => {
    // Service 1: Update balance
    await balanceService.updateBalance(itemId, locationId, -10, tx)
  },
  async (tx) => {
    // Service 2: Record operation
    await recordingService.recordOperation(operationData, tx)
  },
  async (tx) => {
    // Service 3: Log audit
    await auditService.logAction(auditData, tx)
  }
])
```

---

## 6. Performance Considerations

### 6.1 Optimization Strategies

**1. Batch Processing**
```typescript
// ❌ Avoid: Individual operations
for (const item of items) {
  await service.updateBalance(item)
}

// ✅ Use: Batch operations
await service.updateBalanceBatch(items)
```

**2. Asynchronous Event Processing**
```typescript
// Non-critical operations processed asynchronously
await eventService.publishEvent(event)  // Returns immediately
// Event processed in background worker
```

**3. Database Indexing**
```sql
-- Standard indexes for inventory operations
CREATE INDEX idx_item_location ON tb_inventory_balance (item_id, location_id);
CREATE INDEX idx_operation_date ON tb_inventory_operation (operation_date DESC);
CREATE INDEX idx_operation_status ON tb_inventory_operation (status) WHERE status != 'COMPLETED';
```

**4. Query Optimization**
```typescript
// Use selective queries with proper filters
const balance = await balanceService.getBalance(
  itemId,
  locationId,
  {
    includeReserved: true,
    includeHistory: false  // Skip expensive joins when not needed
  }
)
```

**5. Caching Strategy**
```typescript
// Cache frequently accessed data
const cacheKey = `balance:${itemId}:${locationId}`
let balance = await cache.get(cacheKey)

if (!balance) {
  balance = await balanceService.getBalance(itemId, locationId)
  await cache.set(cacheKey, balance, 300)  // 5-minute TTL
}
```

### 6.2 Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Balance Update | <200ms | Single item, single location |
| Batch Balance Update | <1s | Up to 100 items |
| Transaction Recording | <300ms | Single transaction |
| Validation | <100ms | Pre-operation validation |
| Event Publishing | <50ms | Asynchronous processing |
| Audit Logging | <100ms | Background processing |

---

## 7. Security & Compliance

### 7.1 Data Protection

**Sensitive Data Handling**:
- Never log sensitive data (costs, prices) in plain text
- Encrypt audit logs containing financial information
- Mask sensitive fields in error messages
- Use secure connections for all database operations

**Access Control**:
- Enforce permission checks at service level
- Validate user context for all operations
- Log all access attempts (success and failure)
- Implement rate limiting for sensitive operations

### 7.2 Compliance Requirements

**Audit Trail Compliance**:
- ✅ Immutable audit logs (append-only)
- ✅ Complete before/after snapshots
- ✅ User identification for all actions
- ✅ Timestamp precision (microsecond level)
- ✅ Reason for changes (required for certain operations)
- ✅ 7-year retention minimum

**Data Retention**:
- Transaction records: Retain indefinitely
- Audit logs: Minimum 7 years
- Event history: Minimum 1 year
- Balance snapshots: End-of-month snapshots permanently

**Accounting Standards**:
- GAAP compliant: Transaction recording meets standards
- IFRS compliant: Inventory valuation requirements
- SOX compliant: Internal controls and audit trail

---

## 8. Testing Guidelines

### 8.1 Unit Testing

Test each service method independently:

```typescript
describe('InventoryBalanceService', () => {
  describe('updateBalance', () => {
    it('should update balance atomically', async () => {
      const result = await balanceService.updateBalance(
        'item-123',
        'loc-456',
        -10,
        'txn-789',
        1
      )

      expect(result.quantityOnHand).toBe(90)
      expect(result.version).toBe(2)
    })

    it('should throw ConcurrencyError on version mismatch', async () => {
      await expect(
        balanceService.updateBalance('item-123', 'loc-456', -10, 'txn-789', 0)
      ).rejects.toThrow(ConcurrencyError)
    })

    it('should prevent negative inventory', async () => {
      await expect(
        balanceService.updateBalance('item-123', 'loc-456', -200, 'txn-789', 1)
      ).rejects.toThrow(InsufficientInventoryError)
    })
  })
})
```

### 8.2 Integration Testing

Test service interactions:

```typescript
describe('Fractional Conversion Integration', () => {
  it('should complete split conversion with all services', async () => {
    // Arrange
    const initialBalance = await balanceService.getBalance(itemId, locationId)

    // Act
    const result = await fractionalService.splitConversion({
      itemId,
      locationId,
      unitsToSplit: 10,
      portionSizeId: 'slice-8',
      userId: testUser.id
    })

    // Assert
    // 1. Balance updated
    const finalBalance = await balanceService.getBalance(itemId, locationId)
    expect(finalBalance.quantityOnHand).toBe(initialBalance.quantityOnHand - 10)

    // 2. Operation recorded
    const operation = await recordingService.getOperation(result.operationId)
    expect(operation.operationType).toBe('SPLIT')
    expect(operation.status).toBe('POSTED')

    // 3. Audit logged
    const auditLogs = await auditService.getAuditTrail('CONVERSION', result.conversionId)
    expect(auditLogs).toHaveLength(1)
    expect(auditLogs[0].action).toBe('CREATE')

    // 4. Event published
    const events = await eventService.getEventHistory({
      eventType: 'CONVERSION_COMPLETED',
      sourceEntityId: result.conversionId
    })
    expect(events).toHaveLength(1)
  })
})
```

### 8.3 Performance Testing

Test performance targets:

```typescript
describe('Performance Tests', () => {
  it('should update balance within 200ms', async () => {
    const startTime = Date.now()

    await balanceService.updateBalance(itemId, locationId, -1, txnId, 1)

    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(200)
  })

  it('should handle batch updates efficiently', async () => {
    const updates = Array.from({ length: 100 }, (_, i) => ({
      itemId: `item-${i}`,
      locationId: 'loc-1',
      quantityChange: -1,
      transactionId: `txn-${i}`,
      currentVersion: 1
    }))

    const startTime = Date.now()
    await balanceService.updateBalanceBatch(updates)
    const duration = Date.now() - startTime

    expect(duration).toBeLessThan(1000)  // <1 second for 100 items
  })
})
```

---

## 9. Migration Guide

### 9.1 From Module-Specific to Shared Services

**Step 1: Identify Usage**
```bash
# Find all usages of old pattern
grep -r "prisma.inventoryBalance.update" ./app
```

**Step 2: Replace with Shared Service**
```typescript
// Before (direct Prisma call)
await prisma.inventoryBalance.update({
  where: { itemId_locationId: { itemId, locationId } },
  data: { quantityOnHand: { decrement: quantity } }
})

// After (shared service)
await balanceService.updateBalance(
  itemId,
  locationId,
  -quantity,
  transactionId,
  currentVersion
)
```

**Step 3: Add Service Injection**
```typescript
// In your service/action
import { InventoryBalanceService } from '@/lib/services/db/inventory-balance-service'

const balanceService = new InventoryBalanceService()
```

**Step 4: Update Tests**
```typescript
// Mock shared service in tests
vi.mock('@/lib/services/db/inventory-balance-service')

const mockBalanceService = {
  updateBalance: vi.fn().mockResolvedValue(mockBalance)
}
```

### 9.2 Database Migration

**Step 1: Add Missing Fields**
```sql
-- Add standard audit fields if missing
ALTER TABLE tb_fractional_stock
ADD COLUMN IF NOT EXISTS info JSONB,
ADD COLUMN IF NOT EXISTS dimension JSONB,
ADD COLUMN IF NOT EXISTS doc_version DECIMAL DEFAULT 0;
```

**Step 2: Create Indexes**
```sql
-- Standard indexes for shared operations
CREATE INDEX IF NOT EXISTS idx_item_location
  ON tb_fractional_stock (item_code, location_id);

CREATE INDEX IF NOT EXISTS idx_status_date
  ON tb_conversion_record (status, operation_date DESC);
```

**Step 3: Migrate Data**
```typescript
// Data migration script
async function migrateToSharedStructure() {
  // Migrate old format to new format
  const oldRecords = await prisma.$queryRaw`
    SELECT * FROM tb_old_structure
  `

  for (const record of oldRecords) {
    await balanceService.initializeBalance({
      itemId: record.item_id,
      locationId: record.location_id,
      quantityOnHand: record.quantity,
      quantityAllocated: record.allocated || 0
    })
  }
}
```

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue: Concurrency Conflicts**
```typescript
// Problem: Multiple users updating same inventory
Error: ConcurrencyError: Inventory balance was modified by another transaction

// Solution: Implement retry logic
async function updateWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const balance = await balanceService.getBalance(itemId, locationId)
      return await balanceService.updateBalance(
        itemId,
        locationId,
        quantity,
        txnId,
        balance.version
      )
    } catch (error) {
      if (error instanceof ConcurrencyError && i < maxRetries - 1) {
        await sleep(100 * Math.pow(2, i))  // Exponential backoff
        continue
      }
      throw error
    }
  }
}
```

**Issue: Negative Inventory**
```typescript
// Problem: Insufficient inventory for operation
Error: InsufficientInventoryError: Available: 5, Required: 10

// Solution: Check availability before operation
const balance = await balanceService.getBalance(itemId, locationId)
if (balance.quantityAvailable < requiredQuantity) {
  throw new InsufficientInventoryError(
    `Available: ${balance.quantityAvailable}, Required: ${requiredQuantity}`
  )
}
```

**Issue: Invalid State Transition**
```typescript
// Problem: Attempting invalid state change
Error: InvalidStateTransitionError: Cannot transition from COMPLETED to DRAFT

// Solution: Validate transition first
const validation = await stateService.validateStateTransition(
  currentState,
  targetState,
  'TRANSACTION'
)

if (!validation.isValid) {
  throw new InvalidStateTransitionError(validation.errors.join(', '))
}
```

### 10.2 Debugging Tools

**1. Enable Debug Logging**
```typescript
// In development
process.env.DEBUG_INVENTORY_OPERATIONS = 'true'

// Logs will show:
// [BalanceService] Updating balance: item-123, location: loc-456, change: -10
// [BalanceService] Current version: 1, new version: 2
// [BalanceService] Update successful: new balance = 90
```

**2. Audit Trail Analysis**
```typescript
// View complete history of an entity
const history = await auditService.getAuditTrail('STOCK', stockId)

history.forEach(log => {
  console.log(`${log.timestamp}: ${log.action} by ${log.userName}`)
  console.log(`Changes:`, log.changes)
})
```

**3. Event Processing Monitor**
```typescript
// Monitor event processing status
const processingStatus = await eventService.getProcessingStatus()

console.log(`Pending events: ${processingStatus.pending}`)
console.log(`Failed events: ${processingStatus.failed}`)
console.log(`Average processing time: ${processingStatus.avgProcessingTime}ms`)
```

---

## 11. Related Documentation

### Inventory Management Modules
- [Inventory Transactions System](../../inventory-management/inventory-transactions/SM-inventory-transactions.md)
- [Fractional Inventory System](../../inventory-management/fractional-inventory/TS-fractional-inventory.md)
- [Lot-Based Costing](../../inventory-management/lot-based-costing/BR-lot-based-costing.md)
- [Physical Count Management](../../inventory-management/physical-count-management/BR-physical-count-management.md)
- [Stock-In Operations](../../inventory-management/stock-in/BR-stock-in.md)

### Shared Methods
- [Inventory Valuation Service](../inventory-valuation/SM-inventory-valuation.md)
- [FIFO Costing Method](../inventory-valuation/SM-costing-methods.md#fifo)
- [Periodic Average Costing](../inventory-valuation/SM-periodic-average.md)

### Development Guides
- [Service Architecture](/lib/services/README.md)
- [Type System](/lib/types/)
- [Testing Standards](/__tests__/README.md)
- [Database Schema](/docs/app/data-struc/schema.prisma)

---

## 12. Support & Maintenance

### Support Channels
- **Architecture Team**: For design questions and major changes
- **Development Team**: For implementation support
- **Database Team**: For performance and optimization

### Maintenance Schedule
- **Weekly**: Monitor performance metrics
- **Monthly**: Review audit logs and error patterns
- **Quarterly**: Performance optimization review
- **Annually**: Complete service architecture review

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-01-12 | Initial documentation consolidating inventory operations shared methods | Architecture Team |

---

**Document Status**: Active
**Last Review**: 2025-01-12
**Next Review**: 2025-04-12
**Maintained By**: Architecture Team
