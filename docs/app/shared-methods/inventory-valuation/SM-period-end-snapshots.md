# Shared Method: Period-End Snapshots

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Version**: 1.1.0 (Future Enhancement Specification)
**Status**: ⚠️ **PLANNED - NOT YET IMPLEMENTED**
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: 2025-11-06

---

## ⚠️ CRITICAL NOTICE: Future Enhancement Document

**This document describes a PLANNED feature set that is NOT yet implemented.**

### Current Implementation Status

❌ **The following features described in this document DO NOT exist in the current schema**:
- `tb_period` table for period management
- `tb_period_snapshot` table for storing snapshots
- `enum_period_status` enum (OPEN, CLOSED, LOCKED)
- `enum_snapshot_status` enum (DRAFT, FINALIZED, SUPERSEDED, LOCKED)
- Period-end snapshot creation process
- Opening/closing balance tracking by period
- Period lifecycle management (OPEN → CLOSED → LOCKED)
- Period re-open functionality
- Movement summary fields (receipts, issues, adjustments, transfers)

✅ **What DOES exist in current schema**:
- Transaction-level data in `tb_inventory_transaction` and `tb_inventory_transaction_detail`
- Balance tracking via `tb_inventory_transaction_closing_balance` (using `in_qty`/`out_qty`)
- Real-time balance calculation: `SUM(in_qty) - SUM(out_qty)`
- No period-based snapshots - all data is transaction-based

**✅ IMPORTANT**: Balance calculation using `SUM(in_qty) - SUM(out_qty)` is the CORRECT design (not a planned feature). This document uses `remaining_quantity` in snapshot examples for readability, but implementation will always calculate from transaction history.

### Implementation Roadmap

This document describes **Phase 4: Period Management Implementation** from `SCHEMA-ALIGNMENT.md`.

**Prerequisites**: Schema changes in Phase 1-3 must be completed first.

**For current transaction-based approach, see**: `SM-costing-methods.md` v2.0.0

**For implementation roadmap, see**: `SCHEMA-ALIGNMENT.md` Phases 1-5

---

<div style="color: #FFD700;">

## Purpose

This document provides comprehensive specifications for the **period-end snapshot process**, which captures opening and closing inventory balances for financial reporting, audit compliance, and period-over-period analysis. The snapshot system supports both FIFO (lot-level) and Periodic Average (aggregate) costing methods.

## Overview

### What is a Period-End Snapshot?

A period-end snapshot is a **point-in-time capture** of inventory balances and movements for a specific calendar month. It serves as:

- **Financial Record**: Permanent record of inventory value for financial statements
- **Audit Trail**: Historical snapshot for regulatory compliance and audits
- **Opening Balance**: Source of truth for next period's opening balances
- **Analysis Base**: Foundation for period-over-period inventory analysis

### Key Principles

1. **Period Definition**: Calendar month (1st to last day of month)
2. **Dual Method Support**: Both FIFO (lot-level) and Periodic Average (aggregate)
3. **Immutability**: Snapshots are READ-ONLY after creation
4. **Consistency**: Opening balance for period N = Closing balance from period N-1
5. **Completeness**: Captures all active inventory items at all locations
6. **Manual Trigger**: Authorized users initiate snapshot creation

## Period Definition

### Calendar Month Structure

Each period aligns with a calendar month:

| Period Component | Description | Example |
|-----------------|-------------|---------|
| **Period ID** | Format: `YY-MM` | `25-01` |
| **Period Start** | First day of month (00:00:00) | `2025-01-01 00:00:00` |
| **Period End** | Last day of month (23:59:59) | `2025-01-31 23:59:59` |
| **Status** | OPEN, CLOSED, LOCKED | `CLOSED` |

### Period Status Lifecycle

```
OPEN → CLOSED → LOCKED
  ↑        ↓
  └────────┘
  (Re-open)
```

| Status | Description | Transactions Allowed? | Snapshot Exists? |
|--------|-------------|-----------------------|-----------------|
| **OPEN** | Active period, accepting transactions | ✅ Yes | ❌ No |
| **CLOSED** | Period closed, snapshot created | ❌ No | ✅ Yes |
| **LOCKED** | Permanent closure, no re-opening | ❌ No | ✅ Yes |

**Important**: Only the most recent closed period can be re-opened (with proper authorization).

## Snapshot Types

### Type 1: FIFO Lot-Level Snapshots

**Granularity**: One snapshot record per lot (item + location + lot number)

**Purpose**: Track individual lot balances for FIFO costing

**Example**:
```typescript
{
  snapshot_id: "SNAP-25-01-LOT-001",
  period_id: "25-01",  // Format: YY-MM
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  location_code: "MK",
  lot_number: "MK-250115-01",  // Format: {LOCATION}-{YYMMDD}-{SEQ}

  // Opening balance (from prior period CLOSE transaction)
  opening_quantity: 100.00000,
  opening_unit_cost: 12.50000,
  opening_total_cost: 1250.00000,

  // Movement summary
  receipts_quantity: 0.00000,
  receipts_total_cost: 0.00000,
  issues_quantity: 75.00000,
  issues_total_cost: 937.50000,
  adjustments_in_quantity: 0.00000,
  adjustments_in_total_cost: 0.00000,
  adjustments_out_quantity: 0.00000,
  adjustments_out_total_cost: 0.00000,
  transfers_in_quantity: 0.00000,
  transfers_in_total_cost: 0.00000,
  transfers_out_quantity: 0.00000,
  transfers_out_total_cost: 0.00000,

  // Closing balance (recorded in period CLOSE transaction)
  closing_quantity: 25.00000,
  closing_unit_cost: 12.50000,
  closing_total_cost: 312.50000,

  snapshot_date: "2025-02-01 00:00:00",
  created_by: "USER-001",
  status: "FINALIZED"
}
```

### Type 2: Periodic Average Aggregate Snapshots

**Granularity**: One snapshot record per item-location combination

**Purpose**: Track aggregate balances for Periodic Average costing

**Example**:
```typescript
{
  snapshot_id: "SNAP-25-01-AVG-001",
  period_id: "25-01",  // Format: YY-MM
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  location_code: "MK",
  lot_number: null,  // No lot tracking for Periodic Average

  // Opening balance (from prior period CLOSE transaction)
  opening_quantity: 150.00000,
  opening_unit_cost: 12.75000,  // Average cost from prior period
  opening_total_cost: 1912.50000,

  // Movement summary
  receipts_quantity: 200.00000,
  receipts_total_cost: 2600.00000,
  issues_quantity: 180.00000,
  issues_total_cost: 2340.00000,  // Using period average $13.00
  adjustments_in_quantity: 10.00000,
  adjustments_in_total_cost: 130.00000,
  adjustments_out_quantity: 5.00000,
  adjustments_out_total_cost: 65.00000,
  transfers_in_quantity: 50.00000,
  transfers_in_total_cost: 650.00000,
  transfers_out_quantity: 75.00000,
  transfers_out_total_cost: 975.00000,

  // Closing balance (recorded in period CLOSE transaction)
  closing_quantity: 150.00000,
  closing_unit_cost: 13.00000,  // Period average cost
  closing_total_cost: 1950.00000,

  // Cost variance analysis (Periodic Average only)
  cost_variance_per_unit: 0.25000,  // closing_unit_cost - opening_unit_cost ($13.00 - $12.75)
  cost_variance_total: 37.50000,    // cost_variance_per_unit × closing_quantity
  cost_variance_percentage: 1.96,   // (closing_unit_cost / opening_unit_cost - 1) × 100

  snapshot_date: "2025-02-01 00:00:00",
  created_by: "USER-001",
  status: "FINALIZED"
}
```

## Snapshot Data Structure

### Common Properties (Both Methods)

| Property | Data Type | Description | Example |
|----------|-----------|-------------|---------|
| `snapshot_id` | VARCHAR(50) | Unique snapshot identifier | `SNAP-25-01-LOT-001` |
| `period_id` | VARCHAR(7) | Period identifier (YY-MM) | `25-01` |
| `item_id` | VARCHAR(50) | Product identifier | `ITEM-12345` |
| `location_id` | VARCHAR(50) | Storage location identifier | `LOC-KITCHEN` |
| `lot_number` | VARCHAR(50) | Lot identifier (FIFO only), Format: {LOCATION}-{YYMMDD}-{SEQ} | `MK-250115-01` |
| `snapshot_date` | TIMESTAMP | Date/time snapshot created | `2025-02-01 00:00:00` |
| `created_by` | VARCHAR(50) | User who created snapshot | `USER-001` |
| `status` | ENUM | Snapshot status | `FINALIZED` |

### Opening Balance Properties

| Property | Data Type | Description | Formula |
|----------|-----------|-------------|---------|
| `opening_quantity` | DECIMAL(20,5) | Beginning quantity | Prior period closing_quantity |
| `opening_unit_cost` | DECIMAL(20,5) | Beginning unit cost | Prior period closing_unit_cost |
| `opening_total_cost` | DECIMAL(20,5) | Beginning total value | opening_quantity × opening_unit_cost |

### Movement Summary Properties

All movement properties track **quantities** and **total costs** for the period:

| Property | Data Type | Description | Calculation Source |
|----------|-----------|-------------|-------------------|
| `receipts_quantity` | DECIMAL(20,5) | Total receipts | SUM(GRN quantities) |
| `receipts_total_cost` | DECIMAL(20,5) | Total receipt costs | SUM(GRN costs) |
| `issues_quantity` | DECIMAL(20,5) | Total issues | SUM(Issue quantities) |
| `issues_total_cost` | DECIMAL(20,5) | Total issue costs | SUM(Issue costs via FIFO) |
| `adjustments_in_quantity` | DECIMAL(20,5) | Total adjustment increases | SUM(Adjustment IN via in_qty) |
| `adjustments_in_total_cost` | DECIMAL(20,5) | Total adjustment increase costs | SUM(Adjustment IN costs) |
| `adjustments_out_quantity` | DECIMAL(20,5) | Total adjustment decreases | SUM(Adjustment OUT via out_qty) |
| `adjustments_out_total_cost` | DECIMAL(20,5) | Total adjustment decrease costs | SUM(Adjustment OUT costs) |
| `transfers_in_quantity` | DECIMAL(20,5) | Total transfers in | SUM(Transfer In quantities) |
| `transfers_in_total_cost` | DECIMAL(20,5) | Total transfer in costs | SUM(Transfer In costs) |
| `transfers_out_quantity` | DECIMAL(20,5) | Total transfers out | SUM(Transfer Out quantities) |
| `transfers_out_total_cost` | DECIMAL(20,5) | Total transfer out costs | SUM(Transfer Out costs via FIFO) |

### Closing Balance Properties

| Property | Data Type | Description | Formula |
|----------|-----------|-------------|---------|
| `closing_quantity` | DECIMAL(20,5) | Ending quantity | opening_quantity + receipts + transfers_in + adjustments_in - adjustments_out - issues - transfers_out |
| `closing_unit_cost` | DECIMAL(20,5) | Ending unit cost | For FIFO: lot unit_cost<br>For AVG: total_value ÷ total_quantity |
| `closing_total_cost` | DECIMAL(20,5) | Ending total value | closing_quantity × closing_unit_cost |

### Cost Variance Properties (Periodic Average Only)

| Property | Data Type | Description | Formula |
|----------|-----------|-------------|---------|
| `cost_variance_per_unit` | DECIMAL(20,5) | Unit cost change from prior period | closing_unit_cost - opening_unit_cost |
| `cost_variance_total` | DECIMAL(20,5) | Total cost impact of variance | cost_variance_per_unit × closing_quantity |
| `cost_variance_percentage` | DECIMAL(10,2) | Percentage cost change | (closing_unit_cost / opening_unit_cost - 1) × 100 |

**Note**: Cost variance fields are NULL for FIFO snapshots (cost per lot remains constant).

## Snapshot Creation Process

### Pre-Snapshot Validation (BR-PERIOD-014, BR-PERIOD-015)

Before creating snapshots, validate:

1. **Transaction Status**: Only POSTED transactions included
2. **Period Completeness**: All expected transactions posted
3. **Data Integrity**: No negative quantities or costs
4. **Prior Period**: Previous period properly closed
5. **Authorization**: User has financial-manager or system-admin role

### FIFO Method Snapshot Creation

**Step-by-Step Process**:

**Step 1**: Identify all active lots for the period
```sql
-- Get all lots with activity in the period or positive closing balance
SELECT DISTINCT
  item_id,
  location_id,
  lot_number
FROM tb_inventory_transaction_closing_balance
WHERE (
  -- Lots with remaining quantity at period end
  remaining_quantity > 0
  OR
  -- Lots with activity during period (even if now exhausted)
  EXISTS (
    SELECT 1
    FROM tb_adjustment_layers
    WHERE parent_lot_number = tb_inventory_transaction_closing_balance.lot_number
      AND transaction_date BETWEEN :period_start AND :period_end
  )
)
```

**Step 2**: Calculate opening balance for each lot
```sql
-- Opening balance = Prior period closing balance
SELECT
  closing_quantity as opening_quantity,
  closing_unit_cost as opening_unit_cost,
  closing_total_cost as opening_total_cost
FROM tb_period_snapshots
WHERE period_id = :prior_period_id
  AND item_id = :item_id
  AND location_id = :location_id
  AND lot_number = :lot_number

-- If no prior snapshot (new lot in current period), opening = 0
```

**Step 3**: Calculate movement summary
```sql
-- Receipts (LOT layers created in period)
SELECT
  SUM(receipt_quantity) as receipts_quantity,
  SUM(total_cost) as receipts_total_cost
FROM tb_inventory_transaction_closing_balance
WHERE lot_number = :lot_number
  AND receipt_date BETWEEN :period_start AND :period_end

-- Issues (ADJUSTMENT layers in period)
SELECT
  SUM(quantity) as issues_quantity,
  SUM(total_cost) as issues_total_cost
FROM tb_adjustment_layers
WHERE parent_lot_number = :lot_number
  AND transaction_type = 'ISSUE'
  AND transaction_date BETWEEN :period_start AND :period_end

-- Similar queries for adjustments, transfers, etc.
```

**Step 4**: Calculate closing balance
```sql
-- Closing quantity = current remaining_quantity from lot
SELECT remaining_quantity as closing_quantity
FROM tb_inventory_transaction_closing_balance
WHERE lot_number = :lot_number

-- Closing unit cost = lot unit_cost (unchanged)
-- Closing total cost = closing_quantity × closing_unit_cost
```

**Step 5**: Insert snapshot record
```sql
INSERT INTO tb_period_snapshots (
  snapshot_id,
  period_id,
  item_id,
  location_id,
  lot_number,
  opening_quantity,
  opening_unit_cost,
  opening_total_cost,
  receipts_quantity,
  receipts_total_cost,
  -- ... all movement fields
  closing_quantity,
  closing_unit_cost,
  closing_total_cost,
  snapshot_date,
  created_by,
  status
) VALUES (...)
```

### Periodic Average Method Snapshot Creation

**Step-by-Step Process**:

**Step 1**: Identify all item-location combinations with activity
```sql
SELECT DISTINCT
  item_id,
  location_id
FROM tb_inventory_transaction_detail
WHERE transaction_date BETWEEN :period_start AND :period_end
  AND status = 'POSTED'

UNION

-- Include items with opening balance but no current period activity
SELECT DISTINCT
  item_id,
  location_id
FROM tb_period_snapshots
WHERE period_id = :prior_period_id
  AND closing_quantity > 0
```

**Step 2**: Calculate opening balance
```sql
SELECT
  closing_quantity as opening_quantity,
  closing_unit_cost as opening_unit_cost,
  closing_total_cost as opening_total_cost
FROM tb_period_snapshots
WHERE period_id = :prior_period_id
  AND item_id = :item_id
  AND location_id = :location_id
  AND lot_number IS NULL  -- Aggregate snapshot
```

**Step 3**: Calculate total receipts for period
```sql
SELECT
  SUM(quantity) as receipts_quantity,
  SUM(total_cost) as receipts_total_cost
FROM tb_inventory_transaction_detail
WHERE item_id = :item_id
  AND location_id = :location_id
  AND transaction_type IN ('GRN', 'TRANSFER_IN', 'ADJUSTMENT_INCREASE')
  AND transaction_date BETWEEN :period_start AND :period_end
  AND status = 'POSTED'
```

**Step 4**: Calculate period average cost
```sql
-- Formula: (Opening Value + Receipt Value) ÷ (Opening Qty + Receipt Qty)
SET period_avg_cost =
  (opening_total_cost + receipts_total_cost) /
  (opening_quantity + receipts_quantity)
```

**Step 5**: Calculate movements using period average cost
```sql
-- Issues
SELECT SUM(quantity) as issues_quantity
FROM tb_inventory_transaction_detail
WHERE item_id = :item_id
  AND location_id = :location_id
  AND transaction_type = 'ISSUE'
  AND transaction_date BETWEEN :period_start AND :period_end

SET issues_total_cost = issues_quantity × period_avg_cost

-- Similar for adjustments, transfers out, etc.
```

**Step 6**: Calculate closing balance
```sql
SET closing_quantity =
  opening_quantity +
  receipts_quantity +
  transfers_in_quantity +
  adjustments_quantity -
  issues_quantity -
  transfers_out_quantity

SET closing_unit_cost = period_avg_cost
SET closing_total_cost = closing_quantity × closing_unit_cost
```

**Step 7**: Insert aggregate snapshot record

### Validation and Finalization

After creating all snapshots for a period:

**Validation Checks**:
1. **Balance Equation**: Verify closing = opening + receipts + transfers_in + adj_in - adj_out - issues - transfers_out
2. **No Negative Values**: Confirm no negative quantities or costs
3. **Completeness**: Verify snapshot exists for every active item-location (and lot for FIFO)
4. **Total Inventory Value**: Compare to expected total from general ledger
5. **Adjustment Balance**: Verify adjustments_in_quantity and adjustments_out_quantity are non-negative

**Finalization Steps**:
1. Mark all snapshots with `status = 'FINALIZED'`
2. Update period status from `OPEN` to `CLOSED`
3. Lock period to prevent further transactions
4. Generate period-end reports
5. Log completion in audit trail

## Period CLOSE/OPEN Transaction Pattern

### Overview

The period-end snapshot process uses a **transaction-based pattern** to record closing and opening balances in `tb_inventory_transaction_closing_balance` using the `in_qty` and `out_qty` fields.

### Pattern Structure

**Period CLOSE Transaction**:
- Records **ending balance** using `out_qty` field
- Transaction type: `PERIOD_CLOSE`
- Transaction date: Last day of period
- Period ID: Current period (e.g., `25-11`)

**Period OPEN Transaction**:
- Records **opening balance** using `in_qty` field
- Transaction type: `PERIOD_OPEN`
- Transaction date: First day of new period
- Period ID: New period (e.g., `25-12`)

### Example Transaction Pattern

From the spreadsheet showing November 2025 closing (period `25-11`):

**November Period CLOSE** (2025-11-30):
```typescript
{
  period_id: "25-11",
  transaction_type: "PERIOD_CLOSE",
  transaction_date: "2025-11-30",
  lot_no: "MK-251102-01",
  in_qty: 0,  // No inbound for CLOSE
  out_qty: 250.00000,  // Ending balance recorded in out_qty
  cost_per_unit: 61.80000,
  total_cost: 15450.00000,
  document_no: "CLOSE-25-11",
  notes: "Period 25-11 closing balance"
}
```

**December Period OPEN** (2025-12-01):
```typescript
{
  period_id: "25-12",
  transaction_type: "PERIOD_OPEN",
  transaction_date: "2025-12-01",
  lot_no: "MK-251102-01",
  in_qty: 250.00000,  // Opening balance recorded in in_qty
  out_qty: 0,  // No outbound for OPEN
  cost_per_unit: 61.80000,
  total_cost: 15450.00000,
  document_no: "OPEN-25-12",
  notes: "Period 25-12 opening balance"
}
```

### Balance Continuity

The pattern ensures:
- **Closing balance (period N)** = `out_qty` from PERIOD_CLOSE transaction
- **Opening balance (period N+1)** = `in_qty` from PERIOD_OPEN transaction
- **Continuity check**: CLOSE `out_qty` must equal OPEN `in_qty` for same lot

### Implementation Benefits

1. **Transaction-Based**: All balances recorded as transactions (audit trail)
2. **Calculated Balance**: Balance = `SUM(in_qty) - SUM(out_qty)` includes period transitions
3. **Period Isolation**: Each period has explicit CLOSE/OPEN boundaries
4. **Consistent Pattern**: Same structure as regular transactions (GRN, ISSUE, etc.)
5. **Easy Validation**: Compare CLOSE out_qty to OPEN in_qty for verification

### SQL Example

```sql
-- Get period closing balance (from CLOSE transaction)
SELECT
  lot_no,
  out_qty as closing_quantity,  -- Ending balance in out_qty
  cost_per_unit as closing_unit_cost,
  total_cost as closing_total_cost
FROM tb_inventory_transaction_closing_balance
WHERE period_id = '25-11'
  AND transaction_type = 'PERIOD_CLOSE'
  AND lot_no = 'MK-251102-01'

-- Get next period opening balance (from OPEN transaction)
SELECT
  lot_no,
  in_qty as opening_quantity,  -- Opening balance in in_qty
  cost_per_unit as opening_unit_cost,
  total_cost as opening_total_cost
FROM tb_inventory_transaction_closing_balance
WHERE period_id = '25-12'
  AND transaction_type = 'PERIOD_OPEN'
  AND lot_no = 'MK-251102-01'

-- Validate continuity
SELECT
  close.lot_no,
  close.out_qty as closing_qty,
  open.in_qty as opening_qty,
  CASE
    WHEN close.out_qty = open.in_qty THEN 'VALID'
    ELSE 'ERROR: Balance mismatch'
  END as validation_status
FROM tb_inventory_transaction_closing_balance close
INNER JOIN tb_inventory_transaction_closing_balance open
  ON close.lot_no = open.lot_no
  AND close.period_id = '25-11'
  AND close.transaction_type = 'PERIOD_CLOSE'
  AND open.period_id = '25-12'
  AND open.transaction_type = 'PERIOD_OPEN'
```

## Opening Balance Rules (BR-PERIOD-009)

### Fundamental Principle

**Opening balance for period N MUST equal closing balance from period N-1**

This ensures:
- **Continuity**: No inventory "lost" or "created" between periods
- **Accuracy**: Financial statements reconcile period-over-period
- **Auditability**: Complete chain of custody for inventory values

### Implementation Logic

```typescript
function calculateOpeningBalance(
  periodId: string,
  itemId: string,
  locationId: string,
  lotNumber?: string
): OpeningBalance {

  // Get prior period ID
  const priorPeriodId = getPriorPeriod(periodId)  // e.g., "25-01" → "24-12"

  // Query prior period closing balance
  const priorSnapshot = await db.query(`
    SELECT
      closing_quantity,
      closing_unit_cost,
      closing_total_cost
    FROM tb_period_snapshots
    WHERE period_id = $1
      AND item_id = $2
      AND location_id = $3
      AND (lot_number = $4 OR (lot_number IS NULL AND $4 IS NULL))
  `, [priorPeriodId, itemId, locationId, lotNumber])

  if (priorSnapshot) {
    // Use prior closing as opening
    return {
      opening_quantity: priorSnapshot.closing_quantity,
      opening_unit_cost: priorSnapshot.closing_unit_cost,
      opening_total_cost: priorSnapshot.closing_total_cost
    }
  } else {
    // No prior snapshot = new item/lot in current period
    return {
      opening_quantity: 0,
      opening_unit_cost: 0,
      opening_total_cost: 0
    }
  }
}
```

### Special Cases

**Case 1: First Period for Item**
- Opening balance = 0 (no prior history)
- First receipt establishes cost basis

**Case 2: New Lot in FIFO Method**
- Lot may be created mid-period (not from opening)
- Opening balance for this lot = 0
- Receipt establishes lot cost

**Case 3: Period Re-opened and Re-closed**
- New snapshot created
- Uses original prior period closing (not interim snapshot)
- Maintains consistency with original period chain

## Closing Balance Calculation (BR-PERIOD-010)

### Standard Formula

```
Closing Quantity =
  Opening Quantity
  + Receipts Quantity
  + Transfers In Quantity
  + Adjustments In Quantity
  - Adjustments Out Quantity
  - Issues Quantity
  - Transfers Out Quantity
```

### FIFO Method Closing Balance

For each lot:

```typescript
function calculateFIFOClosingBalance(
  lotNumber: string,
  openingBalance: OpeningBalance,
  movements: Movements
): ClosingBalance {

  // Quantity calculation
  const closingQty =
    openingBalance.opening_quantity +
    movements.receipts_quantity +
    movements.transfers_in_quantity +
    movements.adjustments_in_quantity -
    movements.adjustments_out_quantity -
    movements.issues_quantity -
    movements.transfers_out_quantity

  // Unit cost remains constant for lot (from lot layer)
  const closingUnitCost = openingBalance.opening_unit_cost

  // Total cost = quantity × unit cost
  const closingTotalCost = closingQty * closingUnitCost

  return {
    closing_quantity: closingQty,
    closing_unit_cost: closingUnitCost,
    closing_total_cost: closingTotalCost
  }
}
```

**Note**: For FIFO, closing balance should match `remaining_quantity` from lot layer table.

### Periodic Average Method Closing Balance

For each item-location:

```typescript
function calculateAvgClosingBalance(
  itemId: string,
  locationId: string,
  openingBalance: OpeningBalance,
  movements: Movements
): ClosingBalance {

  // Quantity calculation (same as FIFO)
  const closingQty =
    openingBalance.opening_quantity +
    movements.receipts_quantity +
    movements.transfers_in_quantity +
    movements.adjustments_in_quantity -
    movements.adjustments_out_quantity -
    movements.issues_quantity -
    movements.transfers_out_quantity

  // Calculate period average cost
  const totalValue =
    openingBalance.opening_total_cost +
    movements.receipts_total_cost +
    movements.transfers_in_total_cost +
    movements.adjustments_in_total_cost -
    movements.adjustments_out_total_cost

  const totalQuantity =
    openingBalance.opening_quantity +
    movements.receipts_quantity +
    movements.transfers_in_quantity +
    movements.adjustments_in_quantity -
    movements.adjustments_out_quantity

  const periodAvgCost = totalValue / totalQuantity

  // Closing unit cost = period average
  const closingUnitCost = periodAvgCost
  const closingTotalCost = closingQty * closingUnitCost

  // Calculate cost variance (Periodic Average only)
  const costVariancePerUnit = closingUnitCost - openingBalance.opening_unit_cost
  const costVarianceTotal = costVariancePerUnit * closingQty
  const costVariancePercentage = openingBalance.opening_unit_cost > 0
    ? ((closingUnitCost / openingBalance.opening_unit_cost - 1) * 100)
    : 0

  return {
    closing_quantity: closingQty,
    closing_unit_cost: closingUnitCost,
    closing_total_cost: closingTotalCost,
    // Cost variance analysis
    cost_variance_per_unit: costVariancePerUnit,
    cost_variance_total: costVarianceTotal,
    cost_variance_percentage: costVariancePercentage
  }
}
```

## Movement Summary Calculations

### Receipt Movements

**Includes**:
- GRN (Goods Receipt Notes)
- Transfer In (from other locations)
- Inventory Adjustments (Increase)

**Query Example**:
```sql
-- FIFO Method: By lot
SELECT
  SUM(CASE WHEN transaction_type IN ('GRN', 'TRANSFER_IN', 'ADJUSTMENT_INCREASE')
    THEN quantity ELSE 0 END) as receipts_quantity,
  SUM(CASE WHEN transaction_type IN ('GRN', 'TRANSFER_IN', 'ADJUSTMENT_INCREASE')
    THEN total_cost ELSE 0 END) as receipts_total_cost
FROM tb_inventory_transaction_closing_balance
WHERE lot_number = :lot_number
  AND receipt_date BETWEEN :period_start AND :period_end

-- Periodic Average: By item-location
SELECT
  SUM(quantity) as receipts_quantity,
  SUM(total_cost) as receipts_total_cost
FROM tb_inventory_transaction_detail
WHERE item_id = :item_id
  AND location_id = :location_id
  AND transaction_type IN ('GRN', 'TRANSFER_IN', 'ADJUSTMENT_INCREASE')
  AND transaction_date BETWEEN :period_start AND :period_end
  AND status = 'POSTED'
```

### Issue Movements

**Includes**:
- Store Requisitions (Issues for production/department use)

**Query Example**:
```sql
-- FIFO Method: By lot (from adjustment layers)
SELECT
  SUM(quantity) as issues_quantity,
  SUM(total_cost) as issues_total_cost
FROM tb_adjustment_layers
WHERE parent_lot_number = :lot_number
  AND transaction_type = 'ISSUE'
  AND transaction_date BETWEEN :period_start AND :period_end

-- Periodic Average: By item-location
SELECT
  SUM(quantity) as issues_quantity
FROM tb_inventory_transaction_detail
WHERE item_id = :item_id
  AND location_id = :location_id
  AND transaction_type = 'ISSUE'
  AND transaction_date BETWEEN :period_start AND :period_end
  AND status = 'POSTED'

-- Cost = quantity × period_avg_cost (calculated separately)
```

### Adjustment Movements

**Includes**:
- Inventory Adjustments (Increase and Decrease)
- Write-Offs

**Separate IN/OUT Tracking**:
```sql
-- FIFO Method: Track adjustments via parent_lot_no pattern
SELECT
  -- Adjustment increases (in_qty)
  SUM(CASE WHEN parent_lot_no IS NOT NULL AND in_qty > 0
    THEN in_qty ELSE 0 END) as adjustments_in_quantity,
  SUM(CASE WHEN parent_lot_no IS NOT NULL AND in_qty > 0
    THEN total_cost ELSE 0 END) as adjustments_in_total_cost,

  -- Adjustment decreases (out_qty)
  SUM(CASE WHEN parent_lot_no IS NOT NULL AND out_qty > 0
    THEN out_qty ELSE 0 END) as adjustments_out_quantity,
  SUM(CASE WHEN parent_lot_no IS NOT NULL AND out_qty > 0
    THEN total_cost ELSE 0 END) as adjustments_out_total_cost
FROM tb_inventory_transaction_closing_balance
WHERE lot_no = :lot_number
  AND created_at BETWEEN :period_start AND :period_end

-- Periodic Average: By item-location
SELECT
  SUM(CASE WHEN transaction_type = 'ADJUSTMENT_INCREASE'
    THEN quantity ELSE 0 END) as adjustments_in_quantity,
  SUM(CASE WHEN transaction_type = 'ADJUSTMENT_INCREASE'
    THEN total_cost ELSE 0 END) as adjustments_in_total_cost,

  SUM(CASE WHEN transaction_type IN ('ADJUSTMENT_DECREASE', 'WRITE_OFF')
    THEN quantity ELSE 0 END) as adjustments_out_quantity,
  SUM(CASE WHEN transaction_type IN ('ADJUSTMENT_DECREASE', 'WRITE_OFF')
    THEN total_cost ELSE 0 END) as adjustments_out_total_cost
FROM tb_inventory_transaction_detail
WHERE item_id = :item_id
  AND location_id = :location_id
  AND transaction_date BETWEEN :period_start AND :period_end
  AND status = 'POSTED'
```

**Net Adjustment Calculation**:
```
Net Adjustment Quantity = adjustments_in_quantity - adjustments_out_quantity
Net Adjustment Cost = adjustments_in_total_cost - adjustments_out_total_cost
```

### Transfer Movements

**Two Types**:
1. **Transfers In**: Receipts from other locations
2. **Transfers Out**: Issues to other locations

**Query Example**:
```sql
-- Transfers In
SELECT
  SUM(quantity) as transfers_in_quantity,
  SUM(total_cost) as transfers_in_total_cost
FROM tb_inventory_transaction_detail
WHERE location_id = :location_id  -- Destination
  AND transaction_type = 'TRANSFER_IN'
  AND transaction_date BETWEEN :period_start AND :period_end

-- Transfers Out
SELECT
  SUM(quantity) as transfers_out_quantity,
  SUM(total_cost) as transfers_out_total_cost
FROM tb_adjustment_layers  -- For FIFO method
WHERE location_id = :location_id  -- Source
  AND transaction_type = 'TRANSFER_OUT'
  AND transaction_date BETWEEN :period_start AND :period_end
```

## Period Re-Opening Process (BR-PERIOD-011, BR-PERIOD-012)

### Authorization Requirements

**Who Can Re-open**:
- financial-manager role
- system-admin role

**Requirements**:
- Only most recent closed period can be re-opened
- Must provide reason (minimum 50 characters)

### Re-Opening Process

**Step 1**: Validate re-open request
```typescript
async function validateReopenRequest(
  periodId: string,
  userId: string,
  reason: string
): Promise<ValidationResult> {

  // Check user authorization
  const user = await getUserRole(userId)
  if (!['financial-manager', 'system-admin'].includes(user.role)) {
    return { valid: false, error: 'Insufficient permissions' }
  }

  // Check period is most recent closed
  const mostRecentClosed = await getMostRecentClosedPeriod()
  if (periodId !== mostRecentClosed.period_id) {
    return { valid: false, error: 'Only most recent closed period can be re-opened' }
  }

  // Check reason length
  if (reason.length < 50) {
    return { valid: false, error: 'Reason must be at least 50 characters' }
  }

  return { valid: true }
}
```

**Step 2**: Re-open period
```sql
-- Update period status
UPDATE tb_periods
SET status = 'OPEN',
    reopened_at = CURRENT_TIMESTAMP,
    reopened_by = :user_id,
    reopen_reason = :reason
WHERE period_id = :period_id
```

**Step 3**: Preserve existing snapshot (BR-PERIOD-013)
- **DO NOT** delete existing snapshots
- Mark snapshots as `status = 'SUPERSEDED'`
- Keep for audit trail

**Step 4**: Allow corrective transactions
- Users can post additional transactions to corrected period
- Transactions use original period date range

**Step 5**: Re-close period
- Create new snapshot when re-closed
- New snapshot replaces superseded one as current
- Opening balance for next period uses new snapshot closing

### Audit Trail

All re-open actions logged:
```typescript
{
  action: 'PERIOD_REOPEN',
  period_id: '25-01',  // Format: YY-MM
  user_id: 'USER-001',
  timestamp: '2025-02-15 14:30:00',
  reason: 'Correcting missed GRN transaction from January 28th...',
  prior_snapshot_count: 1523,
  prior_total_value: 458762.50
}
```

## Cost Variance Analysis Example (Periodic Average)

### Scenario: Rice Cost Increase Over 3 Months

**Item**: Thai Jasmine Rice (25kg bag)
**Location**: Main Kitchen (MK)
**Costing Method**: Periodic Average

#### January 2025 (Period 25-01)
```
Opening Balance: 100 bags @ $25.00/bag = $2,500
Receipts: 200 bags @ $26.00/bag = $5,200
Total Available: 300 bags @ $7,700

Period Average Cost: $7,700 ÷ 300 = $25.67/bag

Issues: 250 bags @ $25.67 = $6,417.50
Closing Balance: 50 bags @ $25.67 = $1,283.50

Cost Variance:
  - Opening: $25.00/bag
  - Closing: $25.67/bag
  - Variance per unit: +$0.67 (2.68% increase)
  - Total variance impact: $0.67 × 50 = $33.50
```

#### February 2025 (Period 25-02)
```
Opening Balance: 50 bags @ $25.67/bag = $1,283.50
Receipts: 300 bags @ $28.50/bag = $8,550
Total Available: 350 bags @ $9,833.50

Period Average Cost: $9,833.50 ÷ 350 = $28.10/bag

Issues: 280 bags @ $28.10 = $7,868
Closing Balance: 70 bags @ $28.10 = $1,967

Cost Variance:
  - Opening: $25.67/bag
  - Closing: $28.10/bag
  - Variance per unit: +$2.43 (9.47% increase) ← HIGH INCREASE alert
  - Total variance impact: $2.43 × 70 = $170.10
```

#### March 2025 (Period 25-03)
```
Opening Balance: 70 bags @ $28.10/bag = $1,967
Receipts: 250 bags @ $27.50/bag = $6,875
Total Available: 320 bags @ $8,842

Period Average Cost: $8,842 ÷ 320 = $27.63/bag

Issues: 270 bags @ $27.63 = $7,460.10
Closing Balance: 50 bags @ $27.63 = $1,381.50

Cost Variance:
  - Opening: $28.10/bag
  - Closing: $27.63/bag
  - Variance per unit: -$0.47 (-1.67% decrease)
  - Total variance impact: -$0.47 × 50 = -$23.50
```

#### Analysis Summary

**Cumulative Cost Change**: $25.00 → $27.63 (+$2.63 or +10.52% over 3 months)

**3-Month Trend**:
```
Period    | Cost/Bag | Monthly Variance | Cumulative Change
----------|----------|------------------|------------------
Jan (25-01)| $25.67  | +2.68%           | +$0.67
Feb (25-02)| $28.10  | +9.47%           | +$3.10
Mar (25-03)| $27.63  | -1.67%           | +$2.63
```

**Management Insights**:
- February showed sharp 9.47% increase (triggers HIGH INCREASE alert)
- March showed slight correction (-1.67%) but still above January baseline
- Overall 10.52% increase over 3 months indicates sustained price pressure
- Budget impact: If budgeted at $25.00/bag, actual cost of $27.63 = +10.52% over budget
- Recommendation: Review supplier contracts, consider bulk purchasing or alternative suppliers

**Financial Impact** (on closing inventory):
```
January closing value impact: +$33.50
February closing value impact: +$170.10
March closing value impact: -$23.50
Total variance over 3 months: +$180.10 on just this one item
```

## Snapshot Usage and Reporting

### Financial Statement Reports

**Balance Sheet - Inventory Valuation**:
```sql
SELECT
  item_id,
  SUM(closing_quantity) as total_quantity,
  SUM(closing_total_cost) as total_value
FROM tb_period_snapshots
WHERE period_id = :current_period
  AND status = 'FINALIZED'
GROUP BY item_id
```

**Profit & Loss - Cost of Goods Sold**:
```sql
-- COGS = Opening Inventory + Purchases - Closing Inventory
SELECT
  SUM(opening_total_cost) as opening_inventory,
  SUM(receipts_total_cost) as purchases,
  SUM(closing_total_cost) as closing_inventory,
  SUM(opening_total_cost + receipts_total_cost - closing_total_cost) as cogs
FROM tb_period_snapshots
WHERE period_id = :period_id
  AND status = 'FINALIZED'
```

### Period-over-Period Analysis

**Inventory Turnover Analysis**:
```sql
WITH period_data AS (
  SELECT
    period_id,
    item_id,
    location_id,
    opening_quantity,
    closing_quantity,
    issues_quantity,
    (opening_quantity + closing_quantity) / 2 as avg_inventory
  FROM tb_period_snapshots
  WHERE period_id IN (:period_list)
    AND status = 'FINALIZED'
)
SELECT
  item_id,
  period_id,
  issues_quantity / avg_inventory as turnover_ratio
FROM period_data
ORDER BY item_id, period_id
```

**Inventory Movement Report**:
```sql
SELECT
  item_id,
  location_id,
  opening_quantity,
  receipts_quantity,
  transfers_in_quantity,
  adjustments_in_quantity,
  adjustments_out_quantity,
  (adjustments_in_quantity - adjustments_out_quantity) as net_adjustments,
  issues_quantity,
  transfers_out_quantity,
  closing_quantity,
  (closing_quantity - opening_quantity) as net_change
FROM tb_period_snapshots
WHERE period_id = :period_id
  AND status = 'FINALIZED'
ORDER BY ABS(closing_quantity - opening_quantity) DESC
```

### Cost Variance Analysis Reports (Periodic Average)

**Cost Variance Summary by Item**:
```sql
SELECT
  item_id,
  period_id,
  closing_quantity,
  opening_unit_cost,
  closing_unit_cost,
  cost_variance_per_unit,
  cost_variance_total,
  cost_variance_percentage,
  CASE
    WHEN cost_variance_percentage > 10 THEN 'HIGH INCREASE'
    WHEN cost_variance_percentage > 5 THEN 'MODERATE INCREASE'
    WHEN cost_variance_percentage > 0 THEN 'SLIGHT INCREASE'
    WHEN cost_variance_percentage = 0 THEN 'NO CHANGE'
    WHEN cost_variance_percentage > -5 THEN 'SLIGHT DECREASE'
    WHEN cost_variance_percentage > -10 THEN 'MODERATE DECREASE'
    ELSE 'HIGH DECREASE'
  END as variance_category
FROM tb_period_snapshots
WHERE period_id = :period_id
  AND lot_number IS NULL  -- Periodic Average only
  AND status = 'FINALIZED'
ORDER BY ABS(cost_variance_percentage) DESC
```

**Cost Inflation/Deflation Trend**:
```sql
SELECT
  item_id,
  period_id,
  closing_unit_cost,
  cost_variance_per_unit,
  cost_variance_percentage,
  -- Running average of cost variance
  AVG(cost_variance_percentage) OVER (
    PARTITION BY item_id
    ORDER BY period_id
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) as three_month_avg_variance,
  -- Cumulative cost change
  SUM(cost_variance_per_unit) OVER (
    PARTITION BY item_id
    ORDER BY period_id
  ) as cumulative_cost_change
FROM tb_period_snapshots
WHERE lot_number IS NULL  -- Periodic Average only
  AND status = 'FINALIZED'
ORDER BY item_id, period_id
```

**Top Cost Movers Report**:
```sql
-- Items with highest absolute cost variance impact
SELECT
  ps.item_id,
  ps.period_id,
  ps.closing_quantity,
  ps.cost_variance_per_unit,
  ps.cost_variance_total,
  ps.cost_variance_percentage,
  -- Total inventory value impact
  ps.closing_total_cost,
  -- Percentage of total inventory value
  (ps.cost_variance_total / ps.closing_total_cost * 100) as variance_impact_pct
FROM tb_period_snapshots ps
WHERE ps.period_id = :period_id
  AND ps.lot_number IS NULL  -- Periodic Average only
  AND ps.status = 'FINALIZED'
ORDER BY ABS(ps.cost_variance_total) DESC
LIMIT 20
```

**Category Cost Variance Summary**:
```sql
SELECT
  p.category_id,
  c.category_name,
  COUNT(ps.item_id) as item_count,
  SUM(ps.closing_quantity) as total_quantity,
  AVG(ps.cost_variance_percentage) as avg_cost_variance_pct,
  SUM(ps.cost_variance_total) as total_cost_variance,
  SUM(ps.closing_total_cost) as total_closing_value,
  (SUM(ps.cost_variance_total) / SUM(ps.closing_total_cost) * 100) as category_impact_pct
FROM tb_period_snapshots ps
JOIN tb_products p ON ps.item_id = p.id
JOIN tb_categories c ON p.category_id = c.id
WHERE ps.period_id = :period_id
  AND ps.lot_number IS NULL  -- Periodic Average only
  AND ps.status = 'FINALIZED'
GROUP BY p.category_id, c.category_name
ORDER BY ABS(total_cost_variance) DESC
```

**Cost Variance vs Budget Analysis**:
```sql
SELECT
  ps.item_id,
  ps.period_id,
  ps.closing_unit_cost as actual_cost,
  b.budgeted_unit_cost,
  (ps.closing_unit_cost - b.budgeted_unit_cost) as cost_vs_budget,
  ((ps.closing_unit_cost / b.budgeted_unit_cost - 1) * 100) as variance_vs_budget_pct,
  ps.cost_variance_per_unit as period_over_period_variance,
  ps.closing_quantity,
  ((ps.closing_unit_cost - b.budgeted_unit_cost) * ps.closing_quantity) as total_budget_impact
FROM tb_period_snapshots ps
LEFT JOIN tb_budget_costs b
  ON ps.item_id = b.item_id
  AND ps.period_id = b.period_id
WHERE ps.period_id = :period_id
  AND ps.lot_number IS NULL  -- Periodic Average only
  AND ps.status = 'FINALIZED'
ORDER BY ABS(total_budget_impact) DESC
```

### Audit and Compliance Reports

**Snapshot Completeness Audit**:
```sql
-- Verify snapshot exists for every item-location with activity
SELECT
  itd.item_id,
  itd.location_id,
  COUNT(DISTINCT itd.transaction_id) as transaction_count,
  CASE WHEN ps.snapshot_id IS NULL THEN 'MISSING' ELSE 'OK' END as snapshot_status
FROM tb_inventory_transaction_detail itd
LEFT JOIN tb_period_snapshots ps
  ON itd.item_id = ps.item_id
  AND itd.location_id = ps.location_id
  AND ps.period_id = :period_id
WHERE itd.transaction_date BETWEEN :period_start AND :period_end
  AND itd.status = 'POSTED'
GROUP BY itd.item_id, itd.location_id, ps.snapshot_id
HAVING COUNT(DISTINCT ps.snapshot_id) = 0
```

**Balance Equation Validation**:
```sql
-- Verify closing = opening + receipts + transfers_in + adj_in - adj_out - issues - transfers_out
SELECT
  snapshot_id,
  period_id,
  item_id,
  location_id,
  lot_number,
  closing_quantity as recorded_closing,
  (opening_quantity + receipts_quantity + transfers_in_quantity +
   adjustments_in_quantity - adjustments_out_quantity - issues_quantity - transfers_out_quantity) as calculated_closing,
  (closing_quantity - (opening_quantity + receipts_quantity + transfers_in_quantity +
   adjustments_in_quantity - adjustments_out_quantity - issues_quantity - transfers_out_quantity)) as variance
FROM tb_period_snapshots
WHERE period_id = :period_id
  AND ABS(closing_quantity - (opening_quantity + receipts_quantity +
      transfers_in_quantity + adjustments_in_quantity - adjustments_out_quantity - issues_quantity -
      transfers_out_quantity)) > 0.001  -- Allow for rounding
```

## Performance Considerations

### Snapshot Creation Performance

**Expected Volume**:
- FIFO Method: 10,000 - 50,000 lot snapshots per period (typical)
- Periodic Average: 1,000 - 5,000 item-location snapshots per period

**Optimization Strategies**:

1. **Batch Processing**: Create snapshots in batches of 500-1000
2. **Parallel Processing**: Process independent item-locations concurrently
3. **Index Strategy**: Optimize queries with proper indexes
4. **Progress Tracking**: Provide real-time progress feedback to user

**Recommended Indexes**:
```sql
-- For FIFO snapshot queries
CREATE INDEX idx_fifo_snapshot_query ON tb_inventory_transaction_closing_balance
(item_id, location_id, lot_number, receipt_date);

CREATE INDEX idx_adjustment_snapshot ON tb_adjustment_layers
(parent_lot_number, transaction_date, transaction_type);

-- For Periodic Average snapshot queries
CREATE INDEX idx_avg_snapshot_query ON tb_inventory_transaction_detail
(item_id, location_id, transaction_date, transaction_type, status);

-- For prior period lookup
CREATE INDEX idx_snapshot_period_item ON tb_period_snapshots
(period_id, item_id, location_id, lot_number);
```

### Query Performance

**Snapshot Read Performance**:
- Individual snapshot: <10ms
- Period summary (all snapshots): <500ms
- Multi-period analysis: <2 seconds

**Optimization Tips**:
1. Cache period snapshot summaries (15-minute TTL)
2. Use materialized views for common reports
3. Pre-calculate period statistics (total inventory value, COGS, etc.)
4. Archive old snapshots to separate table (>2 years)

## Error Handling

### Common Errors

| Error Code | Description | Resolution |
|-----------|-------------|------------|
| `PERIOD_NOT_CLOSED` | Attempted to access snapshot for open period | Close period first |
| `MISSING_PRIOR_PERIOD` | No prior period snapshot found | Create prior period snapshot or accept zero opening |
| `BALANCE_EQUATION_FAILED` | Calculated closing ≠ expected closing | Investigate transaction data integrity |
| `NEGATIVE_CLOSING_QTY` | Closing quantity is negative | Check for missing receipts or excess issues |
| `UNAUTHORIZED_REOPEN` | User lacks permission to re-open period | Request authorization from financial manager |
| `REOPEN_NOT_RECENT` | Attempted to re-open non-recent period | Only most recent closed period can be re-opened |

### Data Integrity Checks

Before finalizing snapshots:

```typescript
async function validateSnapshotIntegrity(periodId: string): Promise<boolean> {

  // Check 1: All snapshots have non-negative quantities
  const negativeQty = await db.query(`
    SELECT COUNT(*) as count
    FROM tb_period_snapshots
    WHERE period_id = $1 AND closing_quantity < 0
  `, [periodId])

  if (negativeQty.count > 0) {
    throw new Error('NEGATIVE_CLOSING_QTY')
  }

  // Check 2: Balance equation holds for all snapshots
  const balanceErrors = await db.query(`
    SELECT COUNT(*) as count
    FROM tb_period_snapshots
    WHERE period_id = $1
      AND ABS(closing_quantity - (opening_quantity + receipts_quantity +
          transfers_in_quantity + adjustments_in_quantity - adjustments_out_quantity - issues_quantity -
          transfers_out_quantity)) > 0.001
  `, [periodId])

  if (balanceErrors.count > 0) {
    throw new Error('BALANCE_EQUATION_FAILED')
  }

  // Check 3: Opening balance matches prior closing (where applicable)
  const openingErrors = await db.query(`
    SELECT COUNT(*) as count
    FROM tb_period_snapshots curr
    JOIN tb_period_snapshots prior
      ON curr.item_id = prior.item_id
      AND curr.location_id = prior.location_id
      AND (curr.lot_number = prior.lot_number
           OR (curr.lot_number IS NULL AND prior.lot_number IS NULL))
      AND prior.period_id = :prior_period_id
    WHERE curr.period_id = $1
      AND ABS(curr.opening_quantity - prior.closing_quantity) > 0.001
  `, [periodId])

  if (openingErrors.count > 0) {
    throw new Error('OPENING_BALANCE_MISMATCH')
  }

  return true
}
```

## Best Practices

### Snapshot Creation Guidelines

1. **Timing**: Create snapshots within 3 business days of month-end
2. **Validation**: Run all integrity checks before finalizing
3. **Communication**: Notify stakeholders before closing period
4. **Backup**: Create database backup before snapshot creation
5. **Review**: Financial manager should review summary before finalizing
6. **Documentation**: Document any unusual items or adjustments

### Period Management Guidelines

1. **Monthly Routine**: Establish consistent month-end close schedule
2. **Pre-Close Checklist**: Verify all transactions posted before closing
3. **Cutoff Enforcement**: Strictly enforce period cutoff dates
4. **Re-Open Sparingly**: Minimize period re-opens (aim for <5% of periods)
5. **Audit Trail**: Maintain detailed logs of all period status changes

### Testing and Validation

1. **Pre-Production Testing**: Test snapshot process with production data copy
2. **Reconciliation**: Reconcile snapshot totals with general ledger
3. **Year-End Close**: Perform additional validation for year-end snapshots
4. **Spot Checks**: Randomly sample 5-10% of snapshots for manual verification

---

**Version**: 1.1.0
**Last Updated**: 2025-11-06
**Status**: Active
**Maintained By**: Architecture Team
**Review Cycle**: Quarterly

---

## Document Revision Notes

**Version 1.1.0** (2025-11-06):
- **Breaking Change**: Split adjustments into separate IN/OUT tracking
  - Changed from single `adjustments_quantity` / `adjustments_total_cost`
  - Now uses `adjustments_in_quantity` / `adjustments_in_total_cost` and `adjustments_out_quantity` / `adjustments_out_total_cost`
- **Rationale**: Aligns with current implementation using `in_qty`/`out_qty` pattern in `tb_inventory_transaction_closing_balance`
- **Benefits**: Better audit trail, consistent with LOT/ADJUSTMENT transaction type tracking via parent_lot_no
- Updated all formulas, SQL queries, and TypeScript examples to reflect split adjustments
- Added net adjustment calculation formula: `net = adjustments_in - adjustments_out`
- Updated FIFO adjustment tracking to use parent_lot_no pattern
- Enhanced validation checks to verify non-negative adjustment quantities

- **New Feature**: Cost variance tracking for Periodic Average method
  - Added `cost_variance_per_unit`: Unit cost change from prior period
  - Added `cost_variance_total`: Total cost impact of variance on closing inventory
  - Added `cost_variance_percentage`: Percentage cost change for trend analysis
  - **Purpose**: Track cost inflation/deflation, variance analysis, budget comparisons
  - **Benefits**: Better financial analysis, cost trend identification, management reporting
  - Added comprehensive cost variance analysis reports:
    - Cost Variance Summary by Item (with variance categories)
    - Cost Inflation/Deflation Trend (3-month moving average, cumulative changes)
    - Top Cost Movers Report (highest absolute variance impact)
    - Category Cost Variance Summary (aggregated by category)
    - Cost Variance vs Budget Analysis (actual vs budgeted cost comparison)
  - Updated Periodic Average closing balance calculation to include variance computation
  - **Note**: Cost variance fields are NULL for FIFO snapshots (lot cost remains constant)

**Version 1.0.0** (2025-11-03):
- Initial creation of period-end snapshots specification
- Comprehensive coverage of FIFO lot-level and Periodic Average aggregate snapshots
- Detailed snapshot creation process with step-by-step SQL examples
- Opening and closing balance calculation formulas
- Movement summary calculations for all transaction types
- Period re-opening process with authorization requirements
- Snapshot usage for financial statements and compliance reports
- Performance optimization recommendations
- Data integrity validation checks
- Best practices for period management

</div>
