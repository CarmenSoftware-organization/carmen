# Costing Methods Specification

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Version**: 2.0.0 (Schema-Aligned)
**Status**: Documentation Updated to Match Current Schema
**Last Updated**: 2025-11-03

---

## ⚠️ IMPORTANT: Schema Alignment Notice

This document has been updated to reflect the **actual current database schema**.

- ✅ **Current Implementation**: Documented with actual table/field names from schema.prisma
- ⚠️ **Future Enhancements**: Marked with warnings and cross-referenced to SCHEMA-ALIGNMENT.md

**For implementation roadmap of desired features, see**: `SCHEMA-ALIGNMENT.md`

---

## Overview

This document provides detailed specifications for the two inventory costing methods supported by the Carmen ERP system: **FIFO** and **AVG (Periodic Average)**.

**Database Enum**: `enum_calculation_method` with values `FIFO` and `AVG` (see schema.prisma:42-45)

---

## System Configuration

### Company-Wide Setting

**Configuration Level**: Company-wide (applies to all locations and items)

**Setting Location**: System Administration > Settings > Inventory Settings

**Available Options** (from `enum_calculation_method`):
- `FIFO` - First-In-First-Out
- `AVG` - Periodic Average (Monthly) - *displayed as "Periodic Average" in UI*

---

## FIFO (First-In-First-Out)

### Concept

FIFO assumes that the **oldest inventory is used/sold first**. This method tracks individual receipt lots and consumes them in chronological order.

### Current Implementation (Schema-Aligned)

**✅ What Exists Now**:
- Lot tracking via `lot_no` field (format: `{LOCATION}-{YYMMDD}-{SEQ}`, e.g., `MK-251102-01`)
- Transaction tracking with `in_qty` (receipts) and `out_qty` (consumption)
- Cost tracking via `cost_per_unit` and `total_cost`
- Lot index for multiple entries with same lot number
- Date embedded in lot number (no separate receipt_date needed)

**⚠️ Limitations of Current Schema**:
- No parent lot linkage for adjustments
- No transaction_type distinction (LOT vs ADJUSTMENT)

**✅ Correct Design**:
- Balance calculated as `SUM(in_qty) - SUM(out_qty)` (single source of truth, complete audit trail)

### How Current FIFO Works

**Database Table**: `tb_inventory_transaction_closing_balance` (schema.prisma:614-639)

**Actual Prisma Model**:
```prisma
model tb_inventory_transaction_closing_balance {
  id                              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inventory_transaction_detail_id String   @db.Uuid

  lot_no                          String?  @db.VarChar  // ✅ Free-form text
  lot_index                       Int      @default(1)  // ✅ For multiple entries

  location_id                     String?  @db.Uuid
  product_id                      String?  @db.Uuid

  in_qty                          Decimal? @db.Decimal(20, 5)  // ✅ Receipts
  out_qty                         Decimal? @db.Decimal(20, 5)  // ✅ Consumption
  cost_per_unit                   Decimal? @db.Decimal(20, 5)
  total_cost                      Decimal? @db.Decimal(20, 5)

  note                            String?
  info                            Json?
  dimension                       Json?

  // Audit fields
  created_at                      DateTime?
  created_by_id                   String?
  updated_at                      DateTime?
  updated_by_id                   String?

  @@unique([lot_no, lot_index])
}
```

**Current FIFO Algorithm**:
```sql
-- ✅ CURRENT: Get available lots (calculate remaining on-the-fly)
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,
  cost_per_unit,
  -- Date extracted from lot_no format: {LOCATION}-{YYMMDD}-{SEQ}
  SUBSTRING(lot_no FROM POSITION('-' IN lot_no) + 1 FOR 6) as embedded_date
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- FIFO order: lot_no naturally sorts chronologically
```

### Current Data Structure

**TypeScript Interface** (current implementation):
```typescript
interface FIFOLayer {
  id: string                    // UUID
  itemId: string                // product_id
  lotNumber: string             // lot_no (free-form text)
  lotIndex: number              // lot_index (for multiple entries)
  locationId?: string           // location_id

  // ✅ Current fields
  inQty: number                 // in_qty (incoming quantity)
  outQty: number                // out_qty (outgoing quantity)
  unitCost: number              // cost_per_unit (DECIMAL 20,5)
  totalCost: number             // total_cost (DECIMAL 20,5)

  transactionDetailId: string   // inventory_transaction_detail_id

  // Audit fields
  createdAt?: Date
  createdById?: string
  updatedAt?: Date
  updatedById?: string
}

// ✅ Runtime calculation helper
interface CalculatedLotBalance {
  lotNumber: string             // Format: {LOCATION}-{YYMMDD}-{SEQ} (e.g., 'MK-251102-01')
  remainingQuantity: number     // Calculated: SUM(in_qty) - SUM(out_qty)
  unitCost: number
  embeddedDate: string          // Extracted from lot_no (YYMMDD portion)
  totalValue: number            // Calculated: remaining_quantity * unit_cost
}
```

### Current FIFO Example

#### Setup
```
Opening Balance: 0 units

Receipts (GRN - creates entries with in_qty):
- Jan 5, 2025: MK-250105-01 - Entry with in_qty=100, cost_per_unit=$10.00
- Jan 15, 2025: MK-250115-01 - Entry with in_qty=150, cost_per_unit=$12.00
- Jan 25, 2025: MK-250125-01 - Entry with in_qty=200, cost_per_unit=$11.50

Database State (tb_inventory_transaction_closing_balance):
┌───────────────┬────────┬──────────┬────────────┬─────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │
├───────────────┼────────┼──────────┼────────────┼─────────────┤
│ MK-250105-01  │ 100    │ 0        │ $10.00     │ $1,000      │
│ MK-250115-01  │ 150    │ 0        │ $12.00     │ $1,800      │
│ MK-250125-01  │ 200    │ 0        │ $11.50     │ $2,300      │
└───────────────┴────────┴──────────┴────────────┴─────────────┘

Calculated Available Balance:
┌───────────────┬──────────────────────┬───────────┬─────────────┐
│ Lot           │ Remaining (in-out)   │ Unit Cost │ Total Value │
├───────────────┼──────────────────────┼───────────┼─────────────┤
│ MK-250105-01  │ 100 (100-0)          │ $10.00    │ $1,000      │
│ MK-250115-01  │ 150 (150-0)          │ $12.00    │ $1,800      │
│ MK-250125-01  │ 200 (200-0)          │ $11.50    │ $2,300      │
└───────────────┴──────────────────────┴───────────┴─────────────┘
Total: 450 units @ $5,100
```

#### Transaction: Issue 180 units on Jan 30

**Current FIFO Consumption Process**:
```
Step 1: Query available lots (oldest first)
  SELECT lot_no, SUM(in_qty) - SUM(out_qty) as remaining
  ORDER BY lot_no ASC  -- Natural chronological sort

Step 2: Consume MK-250105-01 (oldest by lot_no)
  - Available: 100 units @ $10.00
  - Consume: 100 units
  - Create new entry: lot_no=MK-250105-01, in_qty=0, out_qty=100, cost=$10.00
  - Cost: $1,000
  - Still needed: 80 units

Step 3: Consume MK-250115-01 (next oldest by lot_no)
  - Available: 150 units @ $12.00
  - Consume: 80 units
  - Create new entry: lot_no=MK-250115-01, in_qty=0, out_qty=80, cost=$12.00
  - Cost: $960
  - Fully satisfied

Total Transaction Cost: $1,000 + $960 = $1,960
Average Unit Cost: $1,960 ÷ 180 = $10.89
```

**Updated Database State**:
```
┌───────────────┬────────┬──────────┬────────────┬─────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │
├───────────────┼────────┼──────────┼────────────┼─────────────┤
│ MK-250105-01  │ 100    │ 0        │ $10.00     │ $1,000      │  ← Original receipt
│ MK-250105-01  │ 0      │ 100      │ $10.00     │ -$1,000     │  ← Consumption entry
│ MK-250115-01  │ 150    │ 0        │ $12.00     │ $1,800      │  ← Original receipt
│ MK-250115-01  │ 0      │ 80       │ $12.00     │ -$960       │  ← Consumption entry
│ MK-250125-01  │ 200    │ 0        │ $11.50     │ $2,300      │  ← Untouched
└───────────────┴────────┴──────────┴────────────┴─────────────┘

Calculated Remaining Balances:
┌───────────────┬──────────────────────┬───────────┬─────────────┐
│ Lot           │ Remaining (in-out)   │ Unit Cost │ Total Value │
├───────────────┼──────────────────────┼───────────┼─────────────┤
│ MK-250105-01  │ 0 (100-100)          │ $10.00    │ $0          │  ← Fully consumed
│ MK-250115-01  │ 70 (150-80)          │ $12.00    │ $840        │  ← Partially consumed
│ MK-250125-01  │ 200 (200-0)          │ $11.50    │ $2,300      │  ← Untouched
└───────────────┴──────────────────────┴───────────┴─────────────┘
Total: 270 units @ $3,140
```

### Current FIFO Business Rules

**✅ What Works Now**:
1. Lot tracking with structured format: `{LOCATION}-{YYMMDD}-{SEQ}` (e.g., `MK-251102-01`)
2. Receipt tracking via `in_qty` > 0 entries
3. Consumption tracking via `out_qty` > 0 entries
4. FIFO order by `lot_no` ASC (natural chronological sort)
5. Date embedded in lot_no (no separate receipt_date field needed)
6. Multiple entries per lot using `lot_index`
7. Remaining balance calculated as SUM(in_qty) - SUM(out_qty)

**⚠️ Current Limitations**:
1. Cannot distinguish lot creation from adjustments programmatically (no transaction_type field)
2. No parent lot linkage for traceability (no parent_lot_no reference)
3. Transfers don't automatically create new lot numbers at destination

**✅ Correct Design**:
- Balance calculated from transaction history: `SUM(in_qty) - SUM(out_qty)`

### FIFO Advantages

✅ **Matches Physical Flow**: Often reflects actual inventory movement
✅ **Lower COGS in Rising Prices**: Uses older, cheaper costs first
✅ **Audit Trail**: Transaction history via in_qty/out_qty entries
✅ **Lot Tracking**: Basic lot identification via lot_no field

### FIFO Disadvantages

❌ **Manual Lot Management**: No automatic lot number generation
❌ **Limited Traceability**: No parent-child lot relationships
⚠️ **Performance**: Aggregation queries needed for balances (trade-off for audit trail)

---

<div style="color: #FFD700;">

## ⚠️ FUTURE ENHANCEMENT: Enhanced Lot-Based System

See `SCHEMA-ALIGNMENT.md` for complete implementation roadmap.

### Proposed Enhancements (Not Yet Implemented)

**Phase 3: FIFO Algorithm Implementation** (SCHEMA-ALIGNMENT.md)

The following features are **planned but not yet implemented**:

1. **✅ Structured Lot Numbers**: `{LOCATION}-{YYMMDD}-{SEQ}` format (e.g., `MK-251102-01`) - **IMPLEMENTED**
2. **✅ FIFO Ordering**: ORDER BY lot_no ASC (natural chronological sort) - **IMPLEMENTED**
3. **⚠️ Transaction Types**: Distinguish LOT (new lots) from ADJUSTMENT (consumption) layers - **NOT IMPLEMENTED**
4. **⚠️ Parent Linkage**: `parent_lot_no` field for adjustment layer traceability - **NOT IMPLEMENTED**
5. **⚠️ Automatic Lot Creation**: GRN/Transfer automatically generate lot numbers - **PARTIAL**
6. **⚠️ Lot Number Parsing**: Function to extract date from lot_no when needed - **NOT IMPLEMENTED**

**Note**:
- Balance continues to be calculated as `SUM(in_qty) - SUM(out_qty)` (correct design)
- No separate `receipt_date` field needed - date embedded in lot_no

### How Enhanced System Would Work (Future)

**⚠️ This is the DESIRED state from SCHEMA-ALIGNMENT.md - NOT current implementation**

```sql
-- ⚠️ FUTURE ENHANCEMENT (See SCHEMA-ALIGNMENT.md Phase 3)
-- Enhanced schema with transaction_type field:
SELECT
  lot_no,  -- Format: {LOCATION}-{YYMMDD}-{SEQ} (e.g., MK-251102-01)
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,  -- Calculated from transaction history
  cost_per_unit,
  -- Date can be extracted from lot_no if needed:
  SUBSTRING(lot_no FROM POSITION('-' IN lot_no) + 1 FOR 6) as embedded_date
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
  AND transaction_type = 'LOT'     -- ⚠️ New field (not yet implemented)
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- FIFO order: lot_no naturally sorts chronologically
```

### Transaction Type Behavior (Future Enhancement)

**⚠️ Not yet implemented - see SCHEMA-ALIGNMENT.md Phase 3**

| Transaction Type | Layer Type | Creates New Lot? | Future Implementation |
|-----------------|------------|------------------|----------------------|
| **GRN (Receipt)** | LOT | ✅ Yes | Auto-generate lot number |
| **Transfer In** | LOT | ✅ Yes | New lot at destination |
| **Store Requisition** | ADJUSTMENT | ❌ No | Link via parent_lot_no |
| **Credit Note** | ADJUSTMENT | ❌ No | Link via parent_lot_no |
| **Inventory Adjustment** | ADJUSTMENT | ❌ No | Link via parent_lot_no |

</div>

---

## Periodic Average

### Concept

Periodic Average calculates a **single average cost per period** (calendar month) and applies it to all transactions within that period.

### Current Implementation (Schema-Aligned)

**✅ What Exists Now**:
- On-demand calculation from transaction details
- No dedicated period cost cache table
- Uses `tb_inventory_transaction_detail` for cost aggregation

**⚠️ Limitations**:
- No `tb_period` table for period management
- No `tb_period_snapshot` table for snapshots
- Calculations performed on-the-fly (no caching)

### How Current Periodic Average Works

**Data Source**: `tb_inventory_transaction_detail` (schema.prisma:587-613)

**Current Calculation Method**:
```sql
-- ✅ CURRENT: Calculate average cost on-demand
SELECT
  product_id,
  location_id,
  SUM(CASE WHEN qty > 0 THEN total_cost ELSE 0 END) /
    SUM(CASE WHEN qty > 0 THEN qty ELSE 0 END) AS average_cost,
  SUM(CASE WHEN qty > 0 THEN qty ELSE 0 END) AS total_receipts,
  SUM(CASE WHEN qty > 0 THEN total_cost ELSE 0 END) AS total_cost,
  COUNT(CASE WHEN qty > 0 THEN 1 END) AS receipt_count
FROM tb_inventory_transaction_detail
WHERE
  product_id = :productId
  AND location_id = :locationId
  AND created_at >= :periodStart  -- First day of month
  AND created_at < :periodEnd     -- First day of next month
GROUP BY product_id, location_id
```

**TypeScript Interface** (current implementation):
```typescript
interface PeriodCostCalculation {
  itemId: string                // product_id
  locationId: string            // location_id
  period: Date                  // First day of month (e.g., 2025-01-01)
  averageCost: number           // Calculated: total_cost / total_quantity
  totalQuantity: number         // SUM(qty) for receipts only
  totalCost: number             // SUM(total_cost) for receipts only
  receiptCount: number          // COUNT of receipt transactions
  calculatedAt: Date            // When calculation was performed
}

// ⚠️ RECOMMENDED: Implement application-level caching for performance
// Current schema does not include a cache table
interface CachedPeriodCost {
  itemId: string
  locationId: string
  period: string                // 'YYYY-MM' format
  averageCost: number
  cachedAt: Date
  expiresAt: Date               // Invalidate on new receipts
}
```

### How Periodic Average Works

1. **Period Definition**
   - Period = Calendar month (1st to last day)
   - Each month has one average cost per item per location

2. **Average Calculation**
   - Formula: `(Total Cost of Receipts) ÷ (Total Quantity Received)`
   - Only includes receipts (qty > 0) within the period
   - Calculated on-demand when needed

3. **Transaction Costing**
   - All transactions in the period use the same average cost
   - No lot tracking required
   - Cost is consistent regardless of transaction timing within month

### Periodic Average Example

#### Setup
```
January 2025 Receipts (from tb_inventory_transaction_detail):

GRN-001 (Jan 5):  qty=100, cost_per_unit=$10.00, total_cost=$1,000
GRN-002 (Jan 15): qty=150, cost_per_unit=$12.00, total_cost=$1,800
GRN-003 (Jan 25): qty=200, cost_per_unit=$11.50, total_cost=$2,300

Total January Receipts:
  Quantity: 100 + 150 + 200 = 450 units
  Cost: $1,000 + $1,800 + $2,300 = $5,100

January Average Cost = $5,100 ÷ 450 = $11.333 per unit
```

#### Transactions Using January Average

```
Transaction 1: Issue on Jan 10 for 80 units
  Cost: 80 × $11.333 = $906.64

Transaction 2: Issue on Jan 20 for 120 units
  Cost: 120 × $11.333 = $1,359.96

Transaction 3: Adjustment on Jan 28 for 50 units
  Cost: 50 × $11.333 = $566.65

All transactions use same $11.333 average cost
regardless of when they occurred in January
```

### Current Periodic Average Business Rules

**✅ What Works Now**:
1. On-demand calculation from transaction details
2. Period-based cost aggregation (calendar month)
3. Receipts-only calculation (qty > 0)
4. Consistent cost application within period

**⚠️ Current Limitations**:
1. No dedicated cache table (recalculates every time)
2. No period management (OPEN/CLOSED/LOCKED states)
3. No snapshot mechanism for historical costs
4. Performance impact on high-volume queries
5. Late receipts automatically included (no period locking)

### Periodic Average Advantages

✅ **Simplicity**: No lot tracking required
✅ **Consistency**: Same cost for all transactions in period
✅ **Less Storage**: No detailed lot history
✅ **Easier Reporting**: Simplified cost analysis

### Periodic Average Disadvantages

❌ **Less Precise**: Averages out cost variations
❌ **No Lot Traceability**: Cannot track specific lots
❌ **No Caching**: Recalculates on every query
❌ **Performance**: Aggregation queries on large datasets
❌ **Timing Sensitivity**: Late receipts automatically change costs

---

<div style="color: #FFD700;">

## ⚠️ FUTURE ENHANCEMENT: Period Management

See `SCHEMA-ALIGNMENT.md` Phase 4 for complete implementation roadmap.

### Proposed Period Management (Not Yet Implemented)

**Phase 4: Period Management Implementation** (SCHEMA-ALIGNMENT.md:417-431)

The following features are **planned but not yet implemented**:

1. **Period Table**: `tb_period` with OPEN → CLOSED → LOCKED lifecycle
2. **Snapshot Table**: `tb_period_snapshot` for period-end balances
3. **Period Close Process**: Manual trigger with authorization
4. **Period Re-Open**: With approval workflow and reason tracking
5. **Cost Caching**: Performance optimization for average costs
6. **Transaction Validation**: Check period status before posting

### How Period Management Would Work (Future)

**⚠️ This is the DESIRED state from SCHEMA-ALIGNMENT.md - NOT current implementation**

```typescript
// ⚠️ FUTURE ENHANCEMENT - See SCHEMA-ALIGNMENT.md Phase 4
interface Period {
  id: string
  periodId: string              // ⚠️ Format: 'YYYY-MM'
  periodName: string            // ⚠️ 'January 2025'
  fiscalYear: number
  fiscalMonth: number

  startDate: Date
  endDate: Date

  status: 'OPEN' | 'CLOSED' | 'LOCKED'  // ⚠️ New enum

  closedAt?: Date
  closedById?: string

  snapshotId?: string           // ⚠️ Links to period snapshot
}

interface PeriodSnapshot {
  id: string
  snapshotId: string
  periodId: string              // ⚠️ Links to period

  productId: string
  locationId: string
  lotNo?: string                // ⚠️ NULL for Periodic Average

  // Opening balance (from prior period)
  openingQuantity: number
  openingUnitCost: number
  openingTotalCost: number

  // Movement summary
  receiptsQuantity: number
  receiptsTotal: number
  issuesQuantity: number
  issuesTotal: number
  adjustmentsQuantity: number
  adjustmentsTotal: number

  // Closing balance
  closingQuantity: number
  closingUnitCost: number
  closingTotalCost: number

  snapshotDate: Date
  snapshotStatus: 'DRAFT' | 'FINALIZED' | 'LOCKED'  // ⚠️ New enum
}
```

</div>

---

## Comparison Matrix

| Feature | FIFO (Current) | Periodic Average (Current) | Enhanced FIFO (Future) |
|---------|----------------|---------------------------|----------------------|
| **Complexity** | Moderate | Low | High |
| **Performance** | Moderate (aggregation) | Low (no cache) | High (direct fields) |
| **Cost Accuracy** | Good (lot-based) | Approximate (averaged) | Excellent (precise) |
| **Lot Traceability** | Basic (lot_no) | ❌ None | ✅ Full (parent linkage) |
| **Storage** | Moderate | Low | High |
| **Period Management** | ❌ None | ❌ None | ⚠️ Future (tb_period) |
| **Snapshots** | ❌ None | ❌ None | ⚠️ Future (tb_period_snapshot) |
| **Automatic Lot Numbers** | ❌ Manual | N/A | ⚠️ Future (auto-generate) |

---

## Selection Guidelines

### Use FIFO When:

✅ Lot traceability is important (food, pharma, chemicals)
✅ Price fluctuations are significant
✅ Inventory turnover is moderate to slow
✅ Basic lot tracking meets requirements

### Use Periodic Average When:

✅ Inventory is homogeneous (commodities, bulk items)
✅ High transaction volume
✅ Price stability exists
✅ Simplicity is priority
✅ Lot-level tracking not required

---

## Implementation Notes

### System Setting

**Schema Reference**: `enum_calculation_method` (schema.prisma:42-45)

```typescript
// Current system-wide configuration
interface InventorySettings {
  defaultCostingMethod: 'FIFO' | 'AVG'  // From enum_calculation_method
  periodType: 'CALENDAR_MONTH'          // Fixed for both methods
  allowItemOverride: false              // Company-wide only
}
```

**Database Values**:
- `FIFO` - First-In-First-Out
- `AVG` - Periodic Average (displayed as "Periodic Average" in UI)

### Service Layer

```typescript
// Current implementation approach
class InventoryValuationService {
  async calculateInventoryValuation(
    itemId: string,
    locationId: string,
    quantity: number,
    date: Date
  ): Promise<ValuationResult> {
    const method = await this.getCostingMethod()

    if (method === 'FIFO') {
      return this.calculateFIFOCost(itemId, locationId, quantity, date)
    } else {
      return this.calculatePeriodicAverageCost(itemId, locationId, date)
    }
  }

  private async calculateFIFOCost(
    itemId: string,
    locationId: string,
    quantity: number,
    date: Date
  ): Promise<ValuationResult> {
    // ✅ CURRENT: Query lots with aggregated balances
    const lots = await this.getAvailableLots(itemId, locationId, date)

    // Consume oldest lots first
    let remaining = quantity
    let totalCost = 0
    const consumptions = []

    for (const lot of lots) {
      if (remaining <= 0) break

      const lotRemaining = lot.inQty - lot.outQty  // ✅ Calculate remaining
      const consumeQty = Math.min(remaining, lotRemaining)

      consumptions.push({
        lotNo: lot.lotNo,
        quantity: consumeQty,
        unitCost: lot.unitCost,
        totalCost: consumeQty * lot.unitCost
      })

      totalCost += consumeQty * lot.unitCost
      remaining -= consumeQty
    }

    if (remaining > 0) {
      throw new Error('Insufficient inventory')
    }

    return {
      totalCost,
      averageUnitCost: totalCost / quantity,
      consumptions
    }
  }

  private async calculatePeriodicAverageCost(
    itemId: string,
    locationId: string,
    date: Date
  ): Promise<ValuationResult> {
    // ✅ CURRENT: On-demand calculation from transaction details
    const period = this.getMonthPeriod(date)
    const averageCost = await this.calculatePeriodAverage(
      itemId,
      locationId,
      period
    )

    return {
      averageCost,
      period
    }
  }
}
```

---

## Testing Scenarios

### FIFO Test Cases (Current Implementation)

1. ✅ Single lot consumption (full) - Test SUM(in_qty) - SUM(out_qty) = 0
2. ✅ Single lot consumption (partial) - Test remaining balance calculation
3. ✅ Multiple lot consumption - Test FIFO order by created_at
4. ✅ Backdated transaction - Test lot availability as of date
5. ✅ Insufficient quantity error - Test remaining < needed
6. ✅ Lot balance reconciliation - Test SUM(in_qty) = SUM(out_qty) + remaining
7. ✅ Same-date lot ordering - Test lot_no tiebreaker

### Periodic Average Test Cases (Current Implementation)

1. ✅ Single receipt period - Test basic average calculation
2. ✅ Multiple receipts period - Test weighted average
3. ✅ No receipts period - Test fallback to previous period or standard cost
4. ✅ Late receipt impact - Test automatic recalculation (no period locking)
5. ✅ Period boundary transactions - Test month start/end edge cases
6. ✅ Zero quantity receipts - Test exclusion from average calculation

---

## Document Revision History

### Version 2.0.0 (Schema-Aligned) - 2025-11-03

**✅ Major Update: Schema Alignment Completed**

This document has been updated to accurately reflect the **actual Prisma database schema** defined in `/app/data-struc/schema.prisma`.

**Key Changes**:
1. **Current Implementation Documented**:
   - FIFO uses `in_qty` / `out_qty` for balance tracking
   - Remaining quantity calculated as SUM(in_qty) - SUM(out_qty)
   - Lot numbers are free-form text (no enforced format)
   - No dedicated period or snapshot tables exist
   - Periodic average calculated on-demand (no cache table)

2. **Future Enhancements Marked**:
   - All desired features marked with ⚠️ warnings
   - Cross-referenced to SCHEMA-ALIGNMENT.md for implementation roadmap
   - Clearly separated current vs. future functionality
   - Added implementation phase references

3. **Updated Examples**:
   - FIFO examples show actual in_qty/out_qty entries
   - Demonstrated balance calculation approach
   - Showed database state before/after transactions
   - Updated SQL queries to match actual schema

4. **Comparison Matrix Updated**:
   - Added "Enhanced FIFO (Future)" column
   - Marked missing features in current implementation
   - Cross-referenced planned enhancements

### Version 1.2 - 2025-11-03 (Pre-Alignment)

**Previous Update**: Lot-Based Cost Layer System Added
- Added comprehensive lot-based system documentation (now marked as future enhancement)
- Transaction types and behaviors documented
- Enhanced FIFO consumption algorithm
- Comprehensive examples added

**Note**: Version 1.2 described a desired future state, not current implementation.

---

**Version**: 2.0.0 (Schema-Aligned)
**Status**: Current schema documented, future enhancements marked
**Last Updated**: 2025-11-03
**Maintained By**: Architecture Team

**Related Documents**:
- `SCHEMA-ALIGNMENT.md` - Gap analysis and implementation roadmap
- `SM-inventory-valuation.md` - Core inventory valuation specification
- `SM-period-management.md` - Period lifecycle management (future)
- `SM-period-end-snapshots.md` - Snapshot process specification (future)
