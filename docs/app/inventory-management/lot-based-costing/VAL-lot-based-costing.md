# VAL-LOT: Lot-Based Costing Validations

**Document Version**: 1.0
**Last Updated**: 2025-11-07
**Module**: Inventory Management
**Feature**: Lot-Based Costing with Automatic Lot Creation

---

## Document Overview

This document defines comprehensive validation rules for the lot-based costing system. It covers input validations, business rule validations, data integrity checks, security validations, and validation test cases.

**Related Documents**:
- [BR-LOT: Business Requirements](./BR-lot-based-costing.md)
- [UC-LOT: Use Cases](./UC-lot-based-costing.md)
- [TS-LOT: Technical Specification](./TS-lot-based-costing.md)
- [DS-LOT: Data Schema](./DS-lot-based-costing.md)
- [FD-LOT: Flow Diagrams](./FD-lot-based-costing.md)

---

## Validation Categories

### Validation Levels

| Level | Scope | When Applied | Responsibility |
|-------|-------|--------------|----------------|
| **L1: UI/Client** | User input | Before form submission | Frontend validation |
| **L2: Server Action** | Request data | On server action call | Backend validation |
| **L3: Service Layer** | Business logic | During service execution | Service validation |
| **L4: Database** | Data integrity | On database operation | Database constraints |

### Validation Types

| Type | Description | Example |
|------|-------------|---------|
| **Format** | Data format and structure | Lot number format, date format |
| **Range** | Value within allowed range | Sequence 1-9999, quantity > 0 |
| **Required** | Mandatory fields | Product ID, location code |
| **Uniqueness** | No duplicates allowed | Lot number uniqueness |
| **Business Rule** | Domain-specific rules | FIFO consumption, balance checks |
| **Authorization** | Permission checks | User can commit GRN |
| **Integrity** | Data consistency | Parent lot exists, balance ≥ 0 |

---

## Input Validations

### VAL-001: Lot Number Format Validation

**Rule**: Lot number must follow format `{LOCATION}-{YYMMDD}-{SEQSEQ}` with 4-digit sequence

**Validation Level**: L1 (UI), L2 (Server), L3 (Service)

**Implementation**:

```typescript
// Zod schema validation
const lotNumberSchema = z.string().regex(
  /^[A-Z0-9]{2,4}-\d{6}-\d{4}$/,
  'Lot number must follow format: LOCATION-YYMMDD-SEQSEQ (4-digit sequence)'
)

// Validation function
function validateLotNumberFormat(lotNo: string): boolean {
  const pattern = /^([A-Z0-9]{2,4})-(\d{6})-(\d{4})$/
  const match = lotNo.match(pattern)

  if (!match) {
    return false
  }

  const [, locationCode, dateStr, seqStr] = match

  // Validate location code length
  if (locationCode.length < 2 || locationCode.length > 4) {
    return false
  }

  // Validate date component (YYMMDD)
  const year = parseInt('20' + dateStr.substring(0, 2), 10)
  const month = parseInt(dateStr.substring(2, 4), 10)
  const day = parseInt(dateStr.substring(4, 6), 10)

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false
  }

  // Validate sequence (1-9999)
  const sequence = parseInt(seqStr, 10)
  if (sequence < 1 || sequence > 9999) {
    return false
  }

  return true
}
```

**Test Cases**:

| Input | Valid? | Reason |
|-------|--------|--------|
| `MK-251107-0001` | ✅ Yes | Valid format |
| `PV-251225-1234` | ✅ Yes | Valid with high sequence |
| `WH01-251107-0001` | ✅ Yes | Valid 4-char location |
| `MK-251107-001` | ❌ No | Sequence must be 4 digits |
| `MK-251107-10000` | ❌ No | Sequence exceeds 9999 |
| `mk-251107-0001` | ❌ No | Location must be uppercase |
| `MK-251332-0001` | ❌ No | Invalid date (month 13) |
| `M-251107-0001` | ❌ No | Location too short (1 char) |
| `ABCDE-251107-0001` | ❌ No | Location too long (5 chars) |

**Error Messages**:
- `"Invalid lot number format. Expected: {LOCATION}-{YYMMDD}-{SEQSEQ} (4-digit sequence)"`
- `"Lot number location code must be 2-4 uppercase alphanumeric characters"`
- `"Lot number date component is invalid"`
- `"Lot number sequence must be 0001-9999"`

---

### VAL-002: Location Code Validation

**Rule**: Location code must be 2-4 uppercase alphanumeric characters and exist in database

**Validation Level**: L1 (UI), L2 (Server), L3 (Service)

**Implementation**:

```typescript
const locationCodeSchema = z.string()
  .min(2, 'Location code must be at least 2 characters')
  .max(4, 'Location code must be at most 4 characters')
  .regex(/^[A-Z0-9]+$/, 'Location code must be uppercase alphanumeric')

async function validateLocationExists(locationCode: string): Promise<boolean> {
  const location = await prisma.tb_location.findUnique({
    where: { location_code: locationCode }
  })
  return location !== null && location.is_active === true
}
```

**Test Cases**:

| Input | Valid? | Reason |
|-------|--------|--------|
| `MK` | ✅ Yes (if exists) | Valid 2-char code |
| `PV` | ✅ Yes (if exists) | Valid 2-char code |
| `WH01` | ✅ Yes (if exists) | Valid 4-char code |
| `mk` | ❌ No | Must be uppercase |
| `M` | ❌ No | Too short (1 char) |
| `WAREHOUSE` | ❌ No | Too long (9 chars) |
| `MK-1` | ❌ No | Contains hyphen |
| `ABC` | ❌ No (if doesn't exist) | Not found in database |
| `DEL` | ❌ No (if inactive) | Location inactive |

**Error Messages**:
- `"Location code must be 2-4 uppercase alphanumeric characters"`
- `"Location '{CODE}' not found"`
- `"Location '{CODE}' is inactive"`

---

### VAL-003: Quantity Validation

**Rule**: Quantities must be positive decimal numbers with max 5 decimal places

**Validation Level**: L1 (UI), L2 (Server)

**Implementation**:

```typescript
const quantitySchema = z.number()
  .positive('Quantity must be greater than zero')
  .max(999999999.99999, 'Quantity exceeds maximum allowed value')
  .refine(
    (val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 5
    },
    'Quantity can have at most 5 decimal places'
  )

// For stock-in adjustments
const stockInQuantitySchema = quantitySchema.refine(
  (val) => val > 0,
  'Stock-in adjustment quantity must be positive'
)

// For stock-out adjustments
const stockOutQuantitySchema = quantitySchema.refine(
  (val) => val < 0,
  'Stock-out adjustment quantity must be negative'
)
```

**Test Cases**:

| Input | Context | Valid? | Reason |
|-------|---------|--------|--------|
| `10.5` | GRN | ✅ Yes | Valid positive decimal |
| `100.00000` | GRN | ✅ Yes | Valid with 5 decimals |
| `0.00001` | GRN | ✅ Yes | Valid small positive |
| `10` | Stock-in | ✅ Yes | Valid positive |
| `-10` | Stock-out | ✅ Yes | Valid negative for stock-out |
| `0` | GRN | ❌ No | Must be > 0 |
| `-5` | GRN | ❌ No | Must be positive for receipt |
| `10.123456` | Any | ❌ No | Too many decimal places (6) |
| `1000000000` | Any | ❌ No | Exceeds maximum |
| `10` | Stock-out | ❌ No | Stock-out must be negative |

**Error Messages**:
- `"Quantity must be greater than zero"`
- `"Quantity can have at most 5 decimal places"`
- `"Quantity exceeds maximum allowed value (999,999,999.99999)"`
- `"Stock-in adjustment must have positive quantity"`
- `"Stock-out adjustment must have negative quantity"`

---

### VAL-004: Cost Per Unit Validation

**Rule**: Cost per unit must be positive decimal with max 5 decimal places

**Validation Level**: L1 (UI), L2 (Server)

**Implementation**:

```typescript
const costPerUnitSchema = z.number()
  .positive('Cost per unit must be greater than zero')
  .max(999999999.99999, 'Cost per unit exceeds maximum allowed value')
  .refine(
    (val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 5
    },
    'Cost per unit can have at most 5 decimal places'
  )
```

**Test Cases**:

| Input | Valid? | Reason |
|-------|--------|--------|
| `5.50` | ✅ Yes | Valid positive decimal |
| `0.01` | ✅ Yes | Valid minimum cost |
| `1000.00000` | ✅ Yes | Valid with 5 decimals |
| `0` | ❌ No | Must be > 0 |
| `-5.50` | ❌ No | Must be positive |
| `5.123456` | ❌ No | Too many decimal places |
| `1000000000` | ❌ No | Exceeds maximum |

**Error Messages**:
- `"Cost per unit must be greater than zero"`
- `"Cost per unit can have at most 5 decimal places"`
- `"Cost per unit exceeds maximum allowed value"`

---

### VAL-005: Date Validation

**Rule**: Transaction dates must be valid dates, not in future, and within current fiscal year

**Validation Level**: L1 (UI), L2 (Server)

**Implementation**:

```typescript
const transactionDateSchema = z.date()
  .max(new Date(), 'Transaction date cannot be in the future')
  .refine(
    (date) => {
      const fiscalYearStart = getFiscalYearStart()  // e.g., 2025-01-01
      return date >= fiscalYearStart
    },
    'Transaction date must be within current fiscal year'
  )
  .refine(
    (date) => {
      const lastClosedPeriod = getLastClosedPeriod()
      return date > lastClosedPeriod
    },
    'Cannot post transactions in closed period'
  )
```

**Test Cases**:

| Input | Current Date | Valid? | Reason |
|-------|--------------|--------|--------|
| `2025-11-07` | `2025-11-07` | ✅ Yes | Today's date |
| `2025-11-06` | `2025-11-07` | ✅ Yes | Yesterday |
| `2025-11-08` | `2025-11-07` | ❌ No | Future date |
| `2024-12-31` | `2025-11-07` | ❌ No | Prior fiscal year |
| `2025-10-01` | `2025-11-07` | ❌ No (if closed) | In closed period |

**Error Messages**:
- `"Transaction date cannot be in the future"`
- `"Transaction date must be within current fiscal year"`
- `"Cannot post transactions in closed period ({PERIOD})"`
- `"Invalid date format"`

---

## Business Rule Validations

### VAL-006: LOT Pattern Validation

**Rule**: LOT records must have `lot_no` populated, `parent_lot_no = NULL`, `in_qty > 0`, `out_qty = 0`

**Validation Level**: L3 (Service), L4 (Database)

**Implementation**:

```typescript
function validateLotPattern(record: {
  lotNo: string | null
  parentLotNo: string | null
  inQty: Decimal
  outQty: Decimal
}): void {
  if (record.lotNo === null) {
    throw new ValidationError('LOT record must have lot_no populated')
  }

  if (record.parentLotNo !== null) {
    throw new ValidationError('LOT record must have parent_lot_no = NULL')
  }

  if (record.inQty.lte(0)) {
    throw new ValidationError('LOT record must have in_qty > 0')
  }

  if (!record.outQty.eq(0)) {
    throw new ValidationError('LOT record must have out_qty = 0')
  }
}
```

**Database Check Constraint**:
```sql
ALTER TABLE tb_inventory_transaction_cost_layer
  ADD CONSTRAINT chk_lot_pattern
  CHECK (
    (lot_no IS NOT NULL AND parent_lot_no IS NULL
     AND in_qty > 0 AND out_qty = 0)
    OR
    (lot_no IS NULL AND parent_lot_no IS NOT NULL
     AND in_qty = 0 AND out_qty > 0)
  );
```

**Test Cases**:

| lot_no | parent_lot_no | in_qty | out_qty | Valid? |
|--------|---------------|--------|---------|--------|
| `MK-251107-0001` | `NULL` | 50 | 0 | ✅ Yes (LOT) |
| `NULL` | `MK-251107-0001` | 0 | 10 | ✅ Yes (ADJUSTMENT) |
| `NULL` | `NULL` | 50 | 0 | ❌ No (missing lot_no for LOT) |
| `MK-251107-0001` | `MK-251105-0001` | 50 | 0 | ❌ No (both lot_no and parent populated) |
| `MK-251107-0001` | `NULL` | 0 | 10 | ❌ No (LOT with out_qty > 0) |
| `NULL` | `MK-251107-0001` | 10 | 10 | ❌ No (ADJUSTMENT with both in_qty and out_qty) |

**Error Messages**:
- `"LOT record must have lot_no populated"`
- `"LOT record must have parent_lot_no = NULL"`
- `"LOT record must have in_qty > 0"`
- `"LOT record must have out_qty = 0"`
- `"Invalid cost layer pattern: violates LOT/ADJUSTMENT rules"`

---

### VAL-007: ADJUSTMENT Pattern Validation

**Rule**: ADJUSTMENT records must have `lot_no = NULL`, `parent_lot_no` populated, `in_qty = 0`, `out_qty > 0`

**Validation Level**: L3 (Service), L4 (Database)

**Implementation**:

```typescript
function validateAdjustmentPattern(record: {
  lotNo: string | null
  parentLotNo: string | null
  inQty: Decimal
  outQty: Decimal
}): void {
  if (record.lotNo !== null) {
    throw new ValidationError('ADJUSTMENT record must have lot_no = NULL')
  }

  if (record.parentLotNo === null) {
    throw new ValidationError('ADJUSTMENT record must have parent_lot_no populated')
  }

  if (!record.inQty.eq(0)) {
    throw new ValidationError('ADJUSTMENT record must have in_qty = 0')
  }

  if (record.outQty.lte(0)) {
    throw new ValidationError('ADJUSTMENT record must have out_qty > 0')
  }
}
```

**Error Messages**:
- `"ADJUSTMENT record must have lot_no = NULL"`
- `"ADJUSTMENT record must have parent_lot_no populated"`
- `"ADJUSTMENT record must have in_qty = 0"`
- `"ADJUSTMENT record must have out_qty > 0"`

---

### VAL-008: Parent Lot Existence Validation

**Rule**: When `parent_lot_no` is populated, it must reference an existing lot number

**Validation Level**: L3 (Service), L4 (Database)

**Implementation**:

```typescript
async function validateParentLotExists(parentLotNo: string): Promise<void> {
  const parentLot = await prisma.tb_inventory_transaction_cost_layer.findFirst({
    where: {
      lot_no: parentLotNo,
      lot_index: 1  // Ensure it's a LOT record, not consumption
    }
  })

  if (!parentLot) {
    throw new ValidationError(`Parent lot '${parentLotNo}' not found`)
  }

  // Check if lot is depleted
  const balance = await getLotBalance(parentLotNo)
  if (balance.lte(0)) {
    throw new ValidationError(`Parent lot '${parentLotNo}' is fully depleted`)
  }
}
```

**Database Foreign Key**:
```sql
FOREIGN KEY (parent_lot_no)
  REFERENCES tb_inventory_transaction_cost_layer(lot_no)
  ON DELETE RESTRICT
```

**Test Cases**:

| parent_lot_no | Exists? | Balance | Valid? |
|---------------|---------|---------|--------|
| `MK-251107-0001` | Yes | 50 kg | ✅ Yes |
| `MK-251107-0001` | Yes | 0 kg | ⚠️ Warning (depleted) |
| `MK-251199-9999` | No | - | ❌ No |
| `NULL` | - | - | ✅ Yes (for LOT) |

**Error Messages**:
- `"Parent lot '{LOT_NO}' not found"`
- `"Parent lot '{LOT_NO}' is fully depleted (balance = 0)"`

---

### VAL-009: Sufficient Inventory Validation (FIFO)

**Rule**: Issue/consumption quantity must not exceed available inventory balance

**Validation Level**: L3 (Service)

**Implementation**:

```typescript
async function validateSufficientInventory(params: {
  productId: string
  locationId: string
  issueQty: Decimal
}): Promise<void> {
  const { productId, locationId, issueQty } = params

  // Get total available balance
  const balance = await prisma.$queryRaw<Array<{ balance: Decimal }>>`
    SELECT COALESCE(SUM(in_qty) - SUM(out_qty), 0) as balance
    FROM tb_inventory_transaction_cost_layer
    WHERE product_id = ${productId}::uuid
      AND location_id = ${locationId}::uuid
      AND lot_no IS NOT NULL
  `

  const availableBalance = balance[0]?.balance ?? new Decimal(0)

  if (availableBalance.lt(issueQty)) {
    throw new InsufficientInventoryError(
      `Insufficient inventory. Available: ${availableBalance.toString()}, ` +
      `Requested: ${issueQty.toString()}`
    )
  }
}
```

**Test Cases**:

| Available Balance | Issue Qty | Valid? |
|-------------------|-----------|--------|
| 100 kg | 50 kg | ✅ Yes |
| 100 kg | 100 kg | ✅ Yes |
| 100 kg | 101 kg | ❌ No |
| 0 kg | 1 kg | ❌ No |
| 50.5 kg | 50.5 kg | ✅ Yes |

**Error Messages**:
- `"Insufficient inventory. Available: {AVAILABLE}, Requested: {REQUESTED}"`
- `"No inventory available for product '{PRODUCT}' at location '{LOCATION}'"`

---

### VAL-010: Lot Sequence Limit Validation

**Rule**: Daily lot sequence must not exceed 9999 per location

**Validation Level**: L3 (Service)

**Implementation**:

```typescript
async function validateSequenceLimit(
  locationCode: string,
  receiptDate: Date,
  nextSequence: number
): Promise<void> {
  const MAX_SEQUENCE = 9999

  if (nextSequence > MAX_SEQUENCE) {
    throw new SequenceLimitExceededError(
      `Daily lot limit (${MAX_SEQUENCE}) exceeded for location ${locationCode} ` +
      `on date ${format(receiptDate, 'yyyy-MM-dd')}. ` +
      'Please use a different location code or defer receipt to next day.'
    )
  }
}
```

**Test Cases**:

| Last Sequence | Next Sequence | Valid? |
|---------------|---------------|--------|
| 1 | 2 | ✅ Yes |
| 9998 | 9999 | ✅ Yes |
| 9999 | 10000 | ❌ No |
| NULL (first) | 1 | ✅ Yes |

**Error Messages**:
- `"Daily lot limit (9999) exceeded for location {LOCATION} on {DATE}"`
- `"Please use a different location code or defer receipt to next day"`

---

### VAL-011: Lot Number Uniqueness Validation

**Rule**: Lot number must be globally unique across all cost layers

**Validation Level**: L3 (Service), L4 (Database)

**Implementation**:

```typescript
async function validateLotNumberUnique(lotNo: string): Promise<void> {
  const existing = await prisma.tb_inventory_transaction_cost_layer.findFirst({
    where: { lot_no: lotNo }
  })

  if (existing) {
    throw new DuplicateLotNumberError(
      `Lot number '${lotNo}' already exists. This should not happen. ` +
      'Please contact system administrator.'
    )
  }
}
```

**Database Unique Constraint**:
```sql
UNIQUE (lot_no, lot_index)
```

**Error Messages**:
- `"Lot number '{LOT_NO}' already exists"`
- `"Duplicate lot number detected. System error - contact administrator"`

---

### VAL-012: Lot Index Continuity Validation

**Rule**: Lot index should increment continuously without gaps (1, 2, 3, ...)

**Validation Level**: L3 (Service)

**Implementation**:

```typescript
async function getNextLotIndex(parentLotNo: string): Promise<number> {
  const lastIndex = await prisma.tb_inventory_transaction_cost_layer.findFirst({
    where: {
      OR: [
        { lot_no: parentLotNo },
        { parent_lot_no: parentLotNo }
      ]
    },
    orderBy: { lot_index: 'desc' },
    select: { lot_index: true }
  })

  return lastIndex ? lastIndex.lot_index + 1 : 1
}

// Validation: Check for gaps
async function validateLotIndexContinuity(
  lotNo: string
): Promise<{ hasGaps: boolean; missingIndexes: number[] }> {
  const records = await prisma.tb_inventory_transaction_cost_layer.findMany({
    where: {
      OR: [
        { lot_no: lotNo },
        { parent_lot_no: lotNo }
      ]
    },
    orderBy: { lot_index: 'asc' },
    select: { lot_index: true }
  })

  const indexes = records.map(r => r.lot_index)
  const expected = Array.from({ length: indexes.length }, (_, i) => i + 1)
  const missing = expected.filter(e => !indexes.includes(e))

  return {
    hasGaps: missing.length > 0,
    missingIndexes: missing
  }
}
```

**Test Cases**:

| Existing Indexes | Next Index | Has Gaps? |
|------------------|------------|-----------|
| [1] | 2 | No |
| [1, 2, 3] | 4 | No |
| [1, 3] | 4 | Yes (missing 2) |
| [1, 2, 5] | 6 | Yes (missing 3, 4) |

**Error Messages**:
- `"Lot index continuity broken. Missing indexes: {MISSING}"`
- `"Warning: Gap detected in lot indexes for lot '{LOT_NO}'"`

---

## Data Integrity Validations

### VAL-013: Balance Calculation Validation

**Rule**: Lot balance must equal SUM(in_qty) - SUM(out_qty) and never be negative

**Validation Level**: L3 (Service), L4 (Database)

**Implementation**:

```typescript
async function validateLotBalance(lotNo: string): Promise<{
  valid: boolean
  calculated: Decimal
  stored: Decimal
}> {
  // Calculate balance from cost layers
  const result = await prisma.$queryRaw<Array<{ balance: Decimal }>>`
    SELECT SUM(in_qty) - SUM(out_qty) as balance
    FROM tb_inventory_transaction_cost_layer
    WHERE lot_no = ${lotNo}
       OR parent_lot_no = ${lotNo}
  `

  const calculated = result[0]?.balance ?? new Decimal(0)

  // Get stored balance (if using closing_balance table)
  const stored = await prisma.tb_inventory_transaction_closing_balance.findUnique({
    where: {
      product_id_location_id_lot_no: {
        lot_no: lotNo,
        // ... other unique key fields
      }
    },
    select: { balance_qty: true }
  })

  const isValid = calculated.gte(0) && (
    stored === null || calculated.eq(stored.balance_qty)
  )

  return {
    valid: isValid,
    calculated,
    stored: stored?.balance_qty ?? new Decimal(0)
  }
}
```

**Test Cases**:

| in_qty | out_qty | Calculated Balance | Valid? |
|--------|---------|-------------------|--------|
| 50 | 0 | 50 | ✅ Yes |
| 50 | 30 | 20 | ✅ Yes |
| 50 | 50 | 0 | ✅ Yes (depleted) |
| 50 | 60 | -10 | ❌ No (negative) |

**Error Messages**:
- `"Lot balance is negative ({BALANCE}). Data integrity violation."`
- `"Calculated balance ({CALC}) does not match stored balance ({STORED})"`

---

### VAL-014: Total Cost Calculation Validation

**Rule**: `total_cost` must equal `(in_qty OR out_qty) × cost_per_unit`

**Validation Level**: L3 (Service), L4 (Database)

**Implementation**:

```typescript
function validateTotalCost(record: {
  inQty: Decimal
  outQty: Decimal
  costPerUnit: Decimal
  totalCost: Decimal
}): void {
  const expectedTotal = record.inQty.gt(0)
    ? record.inQty.mul(record.costPerUnit)
    : record.outQty.mul(record.costPerUnit)

  // Allow small rounding difference (0.01)
  const diff = record.totalCost.sub(expectedTotal).abs()

  if (diff.gt(0.01)) {
    throw new ValidationError(
      `Total cost calculation error. Expected: ${expectedTotal.toString()}, ` +
      `Got: ${record.totalCost.toString()}`
    )
  }
}
```

**Database Trigger**:
```sql
CREATE OR REPLACE FUNCTION fn_calculate_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.in_qty > 0 THEN
    NEW.total_cost = NEW.in_qty * NEW.cost_per_unit;
  ELSIF NEW.out_qty > 0 THEN
    NEW.total_cost = NEW.out_qty * NEW.cost_per_unit;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Test Cases**:

| in_qty | out_qty | cost_per_unit | total_cost | Valid? |
|--------|---------|---------------|------------|--------|
| 50 | 0 | 5.50 | 275.00 | ✅ Yes |
| 0 | 10 | 5.50 | 55.00 | ✅ Yes |
| 50 | 0 | 5.50 | 300.00 | ❌ No (should be 275.00) |
| 0 | 10 | 5.50 | 50.00 | ❌ No (should be 55.00) |

**Error Messages**:
- `"Total cost calculation error. Expected: {EXPECTED}, Got: {ACTUAL}"`

---

## Security Validations

### VAL-015: User Permission Validation

**Rule**: User must have appropriate permission to perform operation

**Validation Level**: L2 (Server Action)

**Implementation**:

```typescript
enum Permission {
  COMMIT_GRN = 'procurement:commit_grn',
  CREATE_ADJUSTMENT = 'inventory:create_adjustment',
  PROCESS_ISSUE = 'inventory:process_issue',
  VIEW_LOT_BALANCE = 'inventory:view_lot_balance',
  VIEW_LOT_TRACEABILITY = 'inventory:view_lot_traceability'
}

async function validateUserPermission(
  userId: string,
  permission: Permission
): Promise<void> {
  const user = await prisma.tb_user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: true } } }
  })

  if (!user) {
    throw new UnauthorizedError('User not found')
  }

  const hasPermission = user.role.permissions.some(
    p => p.code === permission
  )

  if (!hasPermission) {
    throw new ForbiddenError(
      `User does not have permission: ${permission}`
    )
  }
}
```

**Test Cases**:

| User Role | Operation | Permission | Valid? |
|-----------|-----------|------------|--------|
| Purchasing Staff | Commit GRN | `commit_grn` | ✅ Yes |
| Storekeeper | Create Adjustment | `create_adjustment` | ✅ Yes |
| Chef | Process Issue | `process_issue` | ✅ Yes |
| Viewer | Commit GRN | `commit_grn` | ❌ No |
| Anonymous | View Balance | `view_lot_balance` | ❌ No |

**Error Messages**:
- `"Unauthorized: User not authenticated"`
- `"Forbidden: User does not have permission: {PERMISSION}"`
- `"Access denied: Insufficient permissions"`

---

### VAL-016: Period Closure Validation

**Rule**: Cannot post transactions in closed accounting period

**Validation Level**: L2 (Server), L3 (Service)

**Implementation**:

```typescript
async function validatePeriodOpen(transactionDate: Date): Promise<void> {
  const period = await prisma.tb_accounting_period.findFirst({
    where: {
      start_date: { lte: transactionDate },
      end_date: { gte: transactionDate }
    }
  })

  if (!period) {
    throw new ValidationError(
      `No accounting period found for date ${format(transactionDate, 'yyyy-MM-dd')}`
    )
  }

  if (period.status === 'CLOSED') {
    throw new PeriodClosedError(
      `Cannot post transactions in closed period: ` +
      `${format(period.start_date, 'MMM yyyy')}`
    )
  }
}
```

**Test Cases**:

| Transaction Date | Period Status | Valid? |
|------------------|---------------|--------|
| `2025-11-07` | OPEN | ✅ Yes |
| `2025-10-15` | CLOSED | ❌ No |
| `2025-12-01` | Not exists | ❌ No |

**Error Messages**:
- `"Cannot post transactions in closed period: {PERIOD}"`
- `"No accounting period found for date {DATE}"`

---

## Performance Validations

### VAL-017: Batch Size Validation

**Rule**: Bulk operations should not exceed reasonable batch size

**Validation Level**: L2 (Server)

**Implementation**:

```typescript
const MAX_BATCH_SIZE = 1000

function validateBatchSize(itemCount: number): void {
  if (itemCount > MAX_BATCH_SIZE) {
    throw new ValidationError(
      `Batch size (${itemCount}) exceeds maximum allowed (${MAX_BATCH_SIZE}). ` +
      'Please split into smaller batches.'
    )
  }
}
```

**Error Messages**:
- `"Batch size ({SIZE}) exceeds maximum allowed ({MAX})"`
- `"Please split operation into smaller batches"`

---

### VAL-018: Query Timeout Validation

**Rule**: Long-running queries should timeout gracefully

**Validation Level**: L3 (Service)

**Implementation**:

```typescript
const QUERY_TIMEOUT_MS = 30000  // 30 seconds

async function executeWithTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = QUERY_TIMEOUT_MS
): Promise<T> {
  return Promise.race([
    queryFn(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError('Query timeout exceeded')),
        timeoutMs
      )
    )
  ])
}
```

**Error Messages**:
- `"Query timeout exceeded (30s). Please narrow search criteria."`

---

## Validation Test Scenarios

### Scenario 1: GRN Commitment Validation Chain

**Test Case**: Complete validation chain for GRN commitment

```typescript
describe('GRN Commitment Validations', () => {
  it('should validate complete GRN commitment flow', async () => {
    // Setup
    const grn = createTestGRN({
      status: 'APPROVED',
      lines: [
        { product_id: 'prod-1', received_qty: 50, unit_cost: 5.50 }
      ]
    })

    // Act & Assert

    // VAL-015: User permission
    await expect(validateUserPermission(user.id, Permission.COMMIT_GRN))
      .resolves.not.toThrow()

    // VAL-016: Period open
    await expect(validatePeriodOpen(new Date()))
      .resolves.not.toThrow()

    // VAL-003: Quantity validation
    expect(() => validateQuantity(50)).not.toThrow()

    // VAL-004: Cost validation
    expect(() => validateCostPerUnit(5.50)).not.toThrow()

    // VAL-002: Location validation
    await expect(validateLocationExists('MK'))
      .resolves.toBe(true)

    // VAL-010: Sequence limit
    await expect(validateSequenceLimit('MK', new Date(), 1))
      .resolves.not.toThrow()

    // VAL-011: Lot uniqueness (after generation)
    const lotNo = await generateLotNumber({ locationCode: 'MK', receiptDate: new Date() })
    await expect(validateLotNumberUnique(lotNo.lotNo))
      .resolves.not.toThrow()

    // Commit GRN
    const result = await commitGrn({ grnId: grn.id, commitDate: new Date() })

    expect(result.success).toBe(true)
    expect(result.lotsCreated).toHaveLength(1)

    // Post-validation: Verify lot pattern
    const costLayer = await getCostLayer(result.lotsCreated[0])
    expect(() => validateLotPattern(costLayer)).not.toThrow()

    // Post-validation: Verify balance
    const balance = await validateLotBalance(result.lotsCreated[0])
    expect(balance.valid).toBe(true)
    expect(balance.calculated).toEqual(new Decimal(50))
  })

  it('should reject GRN commitment with invalid data', async () => {
    const grn = createTestGRN({
      status: 'APPROVED',
      lines: [
        { product_id: 'prod-1', received_qty: 0, unit_cost: 5.50 }  // Invalid qty
      ]
    })

    await expect(commitGrn({ grnId: grn.id, commitDate: new Date() }))
      .rejects.toThrow('Quantity must be greater than zero')
  })
})
```

### Scenario 2: FIFO Consumption Validation Chain

**Test Case**: Validate FIFO consumption with multiple lots

```typescript
describe('FIFO Consumption Validations', () => {
  it('should validate FIFO consumption flow', async () => {
    // Setup: Create test lots
    await createTestLot({ lotNo: 'MK-251105-0001', balance: 30, cost: 5.00 })
    await createTestLot({ lotNo: 'MK-251106-0001', balance: 80, cost: 5.20 })

    const issueQty = new Decimal(100)

    // Act & Assert

    // VAL-009: Sufficient inventory
    await expect(
      validateSufficientInventory({
        productId: 'prod-1',
        locationId: 'loc-1',
        issueQty
      })
    ).resolves.not.toThrow()

    // FIFO allocation
    const allocation = await fifoConsumptionService.allocateLots({
      productId: 'prod-1',
      locationId: 'loc-1',
      issueQty,
      issueDate: new Date()
    })

    expect(allocation.allocations).toHaveLength(2)
    expect(allocation.totalQty).toEqual(issueQty)

    // VAL-008: Parent lots exist
    for (const alloc of allocation.allocations) {
      await expect(validateParentLotExists(alloc.lotNo))
        .resolves.not.toThrow()
    }

    // Process issue
    const result = await processIssue({
      productId: 'prod-1',
      locationId: 'loc-1',
      issueQty,
      issueDate: new Date()
    })

    expect(result.success).toBe(true)

    // Post-validation: Verify consumption pattern
    const consumptions = await getCostLayers({
      transactionId: result.transactionId
    })

    for (const consumption of consumptions) {
      expect(() => validateAdjustmentPattern(consumption)).not.toThrow()
    }

    // Post-validation: Verify balances
    const lot1Balance = await validateLotBalance('MK-251105-0001')
    expect(lot1Balance.calculated).toEqual(new Decimal(0))  // Fully consumed

    const lot2Balance = await validateLotBalance('MK-251106-0001')
    expect(lot2Balance.calculated).toEqual(new Decimal(10))  // 80 - 70 = 10
  })

  it('should reject issue with insufficient inventory', async () => {
    await createTestLot({ lotNo: 'MK-251107-0001', balance: 50, cost: 5.00 })

    await expect(
      processIssue({
        productId: 'prod-1',
        locationId: 'loc-1',
        issueQty: new Decimal(100),  // Requesting more than available
        issueDate: new Date()
      })
    ).rejects.toThrow('Insufficient inventory. Available: 50, Requested: 100')
  })
})
```

---

## Validation Error Handling

### Error Response Format

```typescript
interface ValidationError {
  code: string
  message: string
  field?: string
  value?: any
  details?: Record<string, string[]>
}

interface ValidationErrorResponse {
  success: false
  error: 'VALIDATION_ERROR'
  message: string
  validationErrors: ValidationError[]
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_FORMAT` | Data format validation failed | 400 |
| `REQUIRED_FIELD` | Required field missing | 400 |
| `OUT_OF_RANGE` | Value outside allowed range | 400 |
| `DUPLICATE` | Uniqueness constraint violated | 409 |
| `NOT_FOUND` | Referenced entity not found | 404 |
| `INSUFFICIENT_INVENTORY` | Not enough inventory | 422 |
| `PERIOD_CLOSED` | Accounting period closed | 422 |
| `SEQUENCE_LIMIT` | Daily limit exceeded | 422 |
| `UNAUTHORIZED` | User not authenticated | 401 |
| `FORBIDDEN` | User lacks permission | 403 |
| `INTEGRITY_VIOLATION` | Data integrity check failed | 500 |

---

## Validation Summary Matrix

| Validation | Level | Critical | Auto-Fix | Error Action |
|------------|-------|----------|----------|--------------|
| VAL-001: Lot format | L1, L2, L3 | Yes | No | Block |
| VAL-002: Location code | L1, L2, L3 | Yes | No | Block |
| VAL-003: Quantity | L1, L2 | Yes | No | Block |
| VAL-004: Cost | L1, L2 | Yes | No | Block |
| VAL-005: Date | L1, L2 | Yes | No | Block |
| VAL-006: LOT pattern | L3, L4 | Yes | No | Block |
| VAL-007: ADJUSTMENT pattern | L3, L4 | Yes | No | Block |
| VAL-008: Parent lot exists | L3, L4 | Yes | No | Block |
| VAL-009: Sufficient inventory | L3 | Yes | No | Block |
| VAL-010: Sequence limit | L3 | Yes | No | Block |
| VAL-011: Lot uniqueness | L3, L4 | Yes | Retry | Block/Retry |
| VAL-012: Lot index continuity | L3 | No | Yes | Warn |
| VAL-013: Balance calculation | L3, L4 | Yes | No | Block |
| VAL-014: Total cost | L3, L4 | Yes | Yes | Auto-fix |
| VAL-015: User permission | L2 | Yes | No | Block |
| VAL-016: Period closure | L2, L3 | Yes | No | Block |
| VAL-017: Batch size | L2 | No | No | Block |
| VAL-018: Query timeout | L3 | No | No | Timeout |

**Legend**:
- **Critical**: Failure causes transaction abort
- **Auto-Fix**: System automatically corrects the issue
- **Block**: Operation prevented, user must fix
- **Retry**: System retries with adjustment
- **Warn**: Operation proceeds with warning
- **Timeout**: Operation cancelled after timeout

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-07 | System | Initial validations documentation with 4-digit lot sequence |

---

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Assurance Lead | | | |
| Technical Lead | | | |
| Business Analyst | | | |
| Project Manager | | | |
