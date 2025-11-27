# Costing Methods Specification

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Version**: 2.1.0 (LOT/ADJUSTMENT Implementation)
**Status**: Transaction Type System Implemented
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: 2025-11-06

---

## ⚠️ IMPORTANT: Schema Alignment Notice

This document has been updated to reflect the **actual current database schema** and recent implementation updates.

- ✅ **Current Implementation**: Documented with actual table/field names from schema.prisma
- ✅ **Transaction Type System**: LOT and ADJUSTMENT distinction implemented via parent_lot_no pattern
- ⚠️ **Future Enhancements**: Marked with warnings and cross-referenced to SCHEMA-ALIGNMENT.md

**For implementation roadmap of remaining features, see**: `SCHEMA-ALIGNMENT.md`

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
- **Transaction type distinction**: LOT vs ADJUSTMENT via parent_lot_no pattern
  - **LOT transactions**: `parent_lot_no` is NULL/empty (creates new lot)
  - **ADJUSTMENT transactions**: `parent_lot_no` is populated (references parent lot)

**✅ Correct Design**:
- Balance calculated as `SUM(in_qty) - SUM(out_qty)` (single source of truth, complete audit trail)
- Parent-child lot relationship tracked via `parent_lot_no` field

### How Current FIFO Works

**Database Table**: `tb_inventory_transaction_closing_balance` (schema.prisma:614-639)

**Actual Prisma Model**:
```prisma
model tb_inventory_transaction_closing_balance {
  id                              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inventory_transaction_detail_id String   @db.Uuid

  lot_no                          String?  @db.VarChar  // ✅ Free-form text
  lot_index                       Int      @default(1)  // ✅ For multiple entries
  parent_lot_no                   String?  @db.VarChar  // ✅ Parent lot reference (NULL for LOT, populated for ADJUSTMENT)

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
  SUBSTRING(lot_no FROM POSITION('-' IN lot_no) + 1 FOR 6) as embedded_date,
  -- Transaction type identification
  CASE
    WHEN parent_lot_no IS NULL THEN 'LOT'      -- New lot creation
    ELSE 'ADJUSTMENT'                           -- Adjustment to existing lot
  END as transaction_type
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit, parent_lot_no
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
  parentLotNumber?: string      // parent_lot_no (NULL for LOT, populated for ADJUSTMENT)
  locationId?: string           // location_id

  // ✅ Current fields
  inQty: number                 // in_qty (incoming quantity)
  outQty: number                // out_qty (outgoing quantity)
  unitCost: number              // cost_per_unit (DECIMAL 20,5)
  totalCost: number             // total_cost (DECIMAL 20,5)

  transactionDetailId: string   // inventory_transaction_detail_id

  // ✅ Transaction type helper
  transactionType: 'LOT' | 'ADJUSTMENT'  // Derived from parent_lot_no

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
  transactionType: 'LOT' | 'ADJUSTMENT'  // Derived from parent_lot_no presence
}
```

### Current FIFO Example

#### Setup
```
Opening Balance: 0 units

Receipts (GRN commitment creates entries with in_qty):
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

#### Parent Lot Linkage Example

**Scenario**: Understanding LOT vs ADJUSTMENT transaction types

```
Initial GRN Receipt (LOT transaction):
┌────────┬───────────────┬──────────────────┬────────┬──────────┬────────────┐
│ id     │ lot_no        │ parent_lot_no    │ in_qty │ out_qty  │ Layer Type │
├────────┼───────────────┼──────────────────┼────────┼──────────┼────────────┤
│ uuid-1 │ MK-250130-01  │ NULL             │ 200    │ 0        │ LOT        │
└────────┴───────────────┴──────────────────┴────────┴──────────┴────────────┘
Status: New lot created from GRN commitment

Store Requisition (ADJUSTMENT transaction):
┌────────┬───────────────┬──────────────────┬────────┬──────────┬────────────┐
│ id     │ lot_no        │ parent_lot_no    │ in_qty │ out_qty  │ Layer Type │
├────────┼───────────────┼──────────────────┼────────┼──────────┼────────────┤
│ uuid-1 │ MK-250130-01  │ NULL             │ 200    │ 0        │ LOT        │
│ uuid-2 │ MK-250130-01  │ MK-250130-01     │ 0      │ 50       │ ADJUSTMENT │
└────────┴───────────────┴──────────────────┴────────┴──────────┴────────────┘
Status: Adjustment linked to parent lot MK-250130-01

Calculated Balance:
  Lot MK-250130-01: 200 - 50 = 150 units remaining

Query to get only new lots (LOT layer):
  WHERE parent_lot_no IS NULL
  Result: MK-250130-01 (200 units initial)

Query to get adjustments (ADJUSTMENT layer):
  WHERE parent_lot_no IS NOT NULL
  Result: MK-250130-01 adjustment (-50 units consumption)

Traceability:
  UUID-2 transaction references UUID-1 via parent_lot_no
  Full audit trail: LOT creation → ADJUSTMENT consumption
```

**Benefits of parent_lot_no Pattern**:
- ✅ Clear distinction between lot creation and consumption
- ✅ Parent-child relationship for full traceability
- ✅ No need for separate transaction_type enum field
- ✅ Simple NULL check for filtering transaction types
- ✅ Maintains complete audit trail

---

### Credit Note (CN) Transaction Handling

**Transaction Type**: `CN` (Credit Note)

Credit Notes affect inventory in two distinct ways, both triggered immediately when the Credit Note is **committed** (CN uses direct DRAFT → COMMITTED → VOID flow):

1. **QUANTITY_RETURN**: Physical return of goods (creates `out_qty` entry)
2. **AMOUNT_DISCOUNT**: Cost adjustment without physical return (creates zero-quantity cost adjustment)

Both operations process based on the configured **Cost Method** (FIFO or Periodic AVG).

---

#### CN Operation 1: QUANTITY_RETURN (Physical Return)

**Behavior**: Returns physical inventory to vendor, reducing stock quantity.

**Two Scenarios**:
- **Same-Lot Return**: Return from the specific lot received in the original GRN
- **Different-Lot Return**: Return when original lot is partially/fully consumed (uses FIFO consumption)

##### Same-Lot Return Example (FIFO)

**Setup**:
```
Product: Raw Material XYZ
Location: Main Kitchen (MK)
Costing Method: FIFO

Initial Receipt (GRN-001 committed Jan 15):
┌───────────────┬────────┬──────────┬────────────┬─────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │
├───────────────┼────────┼──────────┼────────────┼─────────────┤
│ MK-250115-01  │ 100    │ 0        │ $12.50     │ $1,250      │
└───────────────┴────────┴──────────┴────────────┴─────────────┘

Calculated Balance: 100 units @ $1,250 ($12.50/unit)
```

**Credit Note Transaction** (CN-001 committed Jan 20):
- Reason: Quality issue - 30 units damaged
- Operation: QUANTITY_RETURN
- Specific Lot: MK-250115-01

**Database Entry Created**:
```
Transaction Type: CN
Entry Details:
- lot_no: MK-250115-01 (matches original GRN lot)
- in_qty: 0
- out_qty: 30
- cost_per_unit: $12.50 (same as original lot)
- total_cost: -$375 (negative = inventory reduction)
```

**Updated Database State**:
```
┌───────────────┬────────┬──────────┬────────────┬─────────────┬────────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │ transaction    │
├───────────────┼────────┼──────────┼────────────┼─────────────┼────────────────┤
│ MK-250115-01  │ 100    │ 0        │ $12.50     │ $1,250      │ GRN-001        │
│ MK-250115-01  │ 0      │ 30       │ $12.50     │ -$375       │ CN-001 (QTY_RET)│
└───────────────┴────────┴──────────┴────────────┴─────────────┴────────────────┘

Calculated Balance: 70 units (100-30) @ $875 ($12.50/unit maintained)
```

**Key Points**:
- Uses original lot's cost ($12.50)
- Cost per unit remains constant
- Lot is **not depleted** (remaining = 70 units)
- Audit trail preserved via transaction entries

##### Different-Lot Return Example (FIFO)

**Setup**:
```
Product: Raw Material XYZ
Location: Main Kitchen (MK)
Costing Method: FIFO

Multiple Receipts:
┌───────────────┬────────┬──────────┬────────────┬─────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │
├───────────────┼────────┼──────────┼────────────┼─────────────┤
│ MK-250115-01  │ 100    │ 80       │ $12.50     │ Receipt/Issue│  ← Partially consumed
│ MK-250120-01  │ 150    │ 0        │ $13.00     │ $1,950       │  ← Newer lot
└───────────────┴────────┴──────────┴────────────┴─────────────┘

Calculated Balances:
- MK-250115-01: 20 units remaining (100-80) @ $12.50
- MK-250120-01: 150 units remaining @ $13.00
```

**Credit Note Transaction** (CN-002 committed Jan 25):
- Reason: Over-delivered - return 30 units
- Operation: QUANTITY_RETURN
- Original lot reference: MK-250115-01 (but only 20 units remain)

**FIFO Processing**:
```
Step 1: Check lot MK-250115-01 availability
  - Requested: 30 units from MK-250115-01
  - Available: 20 units (100-80)
  - Action: Consume all 20 units from MK-250115-01

Step 2: Query next available lot (FIFO order)
  - ORDER BY lot_no ASC
  - Next lot: MK-250120-01 (150 units @ $13.00)
  - Needed: 10 units remaining (30-20)
  - Action: Consume 10 units from MK-250120-01

Step 3: Create CN transactions
  - Entry 1: lot_no=MK-250115-01, out_qty=20, cost=$12.50
  - Entry 2: lot_no=MK-250120-01, out_qty=10, cost=$13.00
```

**Database Entries Created**:
```
┌───────────────┬────────┬──────────┬────────────┬─────────────┬────────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │ transaction    │
├───────────────┼────────┼──────────┼────────────┼─────────────┼────────────────┤
│ MK-250115-01  │ 0      │ 20       │ $12.50     │ -$250       │ CN-002 (QTY_RET)│
│ MK-250120-01  │ 0      │ 10       │ $13.00     │ -$130       │ CN-002 (QTY_RET)│
└───────────────┴────────┴──────────┴────────────┴─────────────┴────────────────┘

Total CN-002 Cost: $250 + $130 = $380
```

**Lot Depletion Detection**:
```
MK-250115-01 Balance Check:
  SUM(in_qty) - SUM(out_qty) = 100 - (80+20) = 0 units
  Status: ✅ LOT DEPLETED (calculated on-the-fly, no explicit flag)

MK-250120-01 Balance Check:
  SUM(in_qty) - SUM(out_qty) = 150 - 10 = 140 units remaining
```

---

#### CN Operation 2: AMOUNT_DISCOUNT (Cost Adjustment)

**Behavior**: Adjusts inventory cost without changing physical quantity (e.g., price negotiation, volume discount received post-delivery).

**Key Characteristics**:
- `in_qty = 0` (no quantity added)
- `out_qty = 0` (no quantity removed)
- `cost_per_unit = $0.00` (not applicable for zero-quantity adjustment)
- `total_cost < 0` (negative value = discount/cost reduction)

##### Amount Discount Example (FIFO)

**Setup**:
```
Product: Raw Material ABC
Location: Main Kitchen (MK)
Costing Method: FIFO

Initial State after GRN-003 committed:
┌───────────────┬────────┬──────────┬────────────┬─────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │
├───────────────┼────────┼──────────┼────────────┼─────────────┤
│ MK-250125-01  │ 200    │ 0        │ $15.00     │ $3,000      │
└───────────────┴────────┴──────────┴────────────┴─────────────┘

Calculated Balance: 200 units @ $3,000 ($15.00/unit)
```

**Credit Note Transaction** (CN-003 committed Jan 28):
- Reason: Volume discount negotiated - $300 discount
- Operation: AMOUNT_DISCOUNT
- Applies to: Remaining inventory only (not consumed items)

**Database Entry Created**:
```
Transaction Type: CN
Entry Details:
- lot_no: MK-250125-01 (links to affected lot)
- in_qty: 0 (no quantity change)
- out_qty: 0 (no quantity change)
- cost_per_unit: $0.00 (not applicable)
- total_cost: -$300 (negative = cost reduction)
```

**Updated Database State**:
```
┌───────────────┬────────┬──────────┬────────────┬─────────────┬────────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │ transaction    │
├───────────────┼────────┼──────────┼────────────┼─────────────┼────────────────┤
│ MK-250125-01  │ 200    │ 0        │ $15.00     │ $3,000      │ GRN-003        │
│ MK-250125-01  │ 0      │ 0        │ $0.00      │ -$300       │ CN-003 (AMT_DISC)│
└───────────────┴────────┴──────────┴────────────┴─────────────┴────────────────┘

Calculated Values:
  Physical Quantity: 200 units (unchanged)
  Total Cost: $3,000 - $300 = $2,700
  Effective Unit Cost: $2,700 ÷ 200 = $13.50/unit (reduced from $15.00)
```

**Effective Cost Calculation**:
```
Formula:
  Effective Unit Cost = (SUM(in_qty × cost) + SUM(cost adjustments)) / SUM(in_qty)

For lot MK-250125-01:
  = (200 × $15.00 + (-$300)) / 200
  = ($3,000 - $300) / 200
  = $2,700 / 200
  = $13.50 per unit
```

**Multi-Lot Discount Allocation**:

When amount discount applies to partially consumed inventory across multiple lots:

```
Scenario: GRN received 300 units, 100 consumed, CN discount $450

Lot State:
┌───────────────┬────────┬──────────┬────────────┬─────────────┐
│ lot_no        │ in_qty │ out_qty  │ unit_cost  │ total_cost  │
├───────────────┼────────┼──────────┼────────────┼─────────────┤
│ MK-250130-01  │ 300    │ 100      │ $20.00     │ GRN/ISSUE   │
└───────────────┴────────┴──────────┴────────────┴─────────────┘

Remaining Inventory: 200 units (300-100)
Remaining Value: 200 × $20.00 = $4,000

CN AMOUNT_DISCOUNT Processing:
- Discount: $450
- Applies to: Remaining 200 units only
- Creates: lot_no=MK-250130-01, in_qty=0, out_qty=0, total_cost=-$450
- New Effective Cost: ($4,000 - $450) / 200 = $17.75/unit
```

---

#### CN Transaction Handling: Periodic Average

**Key Difference**: Periodic Average uses **period-based average cost** instead of lot-specific costs.

##### QUANTITY_RETURN (Periodic AVG)

**Behavior**: Returns reduce quantity but cost is based on period average, not specific lot.

**Example**:
```
Product: Raw Material XYZ
Location: Main Kitchen (MK)
Costing Method: Periodic AVG

January 2025 Period Average: $11.333/unit
(Calculated from all January receipts: $5,100 ÷ 450 units)

Credit Note CN-004 (Jan 28):
- Return: 30 units
- Reason: Quality issue

CN Entry Created:
- transaction_type: CN
- qty: -30 (negative = return)
- cost_per_unit: $11.333 (period average, not original GRN cost)
- total_cost: 30 × $11.333 = -$339.99

Note: No lot_no tracking in Periodic AVG method
```

##### AMOUNT_DISCOUNT (Periodic AVG)

**Behavior**: Cost adjustments affect the **period average calculation** for future transactions.

**Example**:
```
Product: Raw Material ABC
Costing Method: Periodic AVG

January Receipts:
- GRN-001: 200 units @ $15.00 = $3,000
- GRN-002: 300 units @ $16.00 = $4,800
  Total: 500 units @ $7,800

Initial Period Average: $7,800 ÷ 500 = $15.60/unit

Credit Note CN-005 (Jan 25):
- Amount Discount: $450
- Operation: AMOUNT_DISCOUNT

Updated Period Calculation:
  Total Receipts Cost: $7,800 - $450 = $7,350
  Total Quantity: 500 units (unchanged)
  Adjusted Period Average: $7,350 ÷ 500 = $14.70/unit

Impact:
  - All transactions after CN-005 in January use $14.70/unit
  - Transactions before CN-005 remain at $15.60/unit (no retroactive change)
  - Cost adjustment applied immediately on CN commit
```

---

#### CN Transaction Business Rules

**BR-CN-001: Transaction Type**
- All Credit Note inventory transactions must use transaction type `CN`
- Distinct from generic adjustments (ADJ_OUT) for audit trail

**BR-CN-002: Cost Method Processing**
- CN transactions process based on company-wide costing method configuration
- FIFO: Uses lot-specific costs with FIFO consumption order
- Periodic AVG: Uses period average cost for QUANTITY_RETURN
- Periodic AVG: Adjusts period average calculation for AMOUNT_DISCOUNT

**BR-CN-003: QUANTITY_RETURN Same-Lot**
- When returning to same lot, use original lot's `cost_per_unit`
- Create entry with `in_qty=0`, `out_qty=returned_qty`, `lot_no=original_lot`
- Maintains cost consistency for same-lot returns

**BR-CN-004: QUANTITY_RETURN Different-Lot (FIFO)**
- When original lot insufficient, consume from next available lots
- Query available lots: `ORDER BY lot_no ASC` (FIFO order)
- Create separate CN entries for each lot consumed
- Calculate lot depletion: `SUM(in_qty) - SUM(out_qty) = 0`

**BR-CN-005: AMOUNT_DISCOUNT Processing**
- Create entry with `in_qty=0`, `out_qty=0`, `total_cost<0`
- Set `cost_per_unit=$0.00` (not applicable for zero-quantity)
- Link to affected lot(s) via `lot_no` field
- Allocate discount to **remaining inventory only** (not consumed items)

**BR-CN-006: Effective Cost Calculation**
- Formula: `(SUM(in_qty × cost) + SUM(cost_adjustments)) / SUM(in_qty)`
- Apply to each lot separately in FIFO
- Apply to entire period in Periodic AVG
- Recalculate on-the-fly when querying inventory valuation

**BR-CN-007: Timing**
- All CN inventory transactions trigger **immediately on CN commit**
- CN uses DRAFT → COMMITTED → VOID flow
- Cost adjustments apply at moment of commitment

**BR-CN-008: Lot Depletion**
- No explicit "depleted" flag in database
- Calculate on-the-fly: `SUM(in_qty) - SUM(out_qty) = 0`
- Depleted lots excluded from available inventory queries
- Audit trail preserved (entries remain in database)

---

### Current FIFO Business Rules

**✅ What Works Now**:
1. Lot tracking with structured format: `{LOCATION}-{YYMMDD}-{SEQ}` (e.g., `MK-251102-01`)
2. Receipt tracking via `in_qty` > 0 entries
3. Consumption tracking via `out_qty` > 0 entries
4. FIFO order by `lot_no` ASC (natural chronological sort)
5. Date embedded in lot_no (no separate receipt_date field needed)
6. Multiple entries per lot using `lot_index`
7. Remaining balance calculated as SUM(in_qty) - SUM(out_qty)
8. **Transaction type distinction**: LOT vs ADJUSTMENT via `parent_lot_no` pattern
   - **LOT**: `parent_lot_no` is NULL (new lot creation - GRN, transfers)
   - **ADJUSTMENT**: `parent_lot_no` is populated (consumption, adjustments)
9. Parent-child lot traceability via `parent_lot_no` field

**⚠️ Current Limitations**:
1. Transfers don't automatically create new lot numbers at destination (manual process)

**✅ Correct Design**:
- Balance calculated from transaction history: `SUM(in_qty) - SUM(out_qty)`
- Transaction type derived from `parent_lot_no` presence

### FIFO Advantages

✅ **Matches Physical Flow**: Often reflects actual inventory movement
✅ **Lower COGS in Rising Prices**: Uses older, cheaper costs first
✅ **Audit Trail**: Transaction history via in_qty/out_qty entries
✅ **Lot Tracking**: Basic lot identification via lot_no field
✅ **Automatic Lot Management**: Automatic lot number generation on GRN commit

### FIFO Disadvantages

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
3. **✅ Transaction Types**: Distinguish LOT (new lots) from ADJUSTMENT (consumption) layers - **IMPLEMENTED** (via parent_lot_no pattern)
4. **✅ Parent Linkage**: `parent_lot_no` field for adjustment layer traceability - **IMPLEMENTED**
5. **✅ Automatic Lot Creation**: GRN commitment automatically generates lot numbers - **IMPLEMENTED**
6. **⚠️ Lot Number Parsing**: Function to extract date from lot_no when needed - **NOT IMPLEMENTED**
7. **⚠️ Automatic Transfer Lot Creation**: Automatically generate new lot numbers at destination location - **NOT IMPLEMENTED**

**Note**:
- Balance continues to be calculated as `SUM(in_qty) - SUM(out_qty)` (correct design)
- No separate `receipt_date` field needed - date embedded in lot_no
- Transaction type derived from `parent_lot_no` presence (NULL = LOT, populated = ADJUSTMENT)

### How Enhanced System Works (Current Implementation)

**✅ This is the CURRENT implementation using parent_lot_no pattern**

```sql
-- ✅ CURRENT: Query LOT transactions (exclude adjustments)
SELECT
  lot_no,  -- Format: {LOCATION}-{YYMMDD}-{SEQ} (e.g., MK-251102-01)
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,  -- Calculated from transaction history
  cost_per_unit,
  parent_lot_no,  -- NULL for LOT, populated for ADJUSTMENT
  -- Date can be extracted from lot_no if needed:
  SUBSTRING(lot_no FROM POSITION('-' IN lot_no) + 1 FOR 6) as embedded_date
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
  AND parent_lot_no IS NULL  -- ✅ Only LOT transactions (new lots)
GROUP BY lot_no, cost_per_unit, parent_lot_no
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- FIFO order: lot_no naturally sorts chronologically

-- ✅ CURRENT: Query ADJUSTMENT transactions (linked to parent lot)
SELECT
  lot_no,
  parent_lot_no,  -- References the parent lot
  SUM(in_qty) as total_in,
  SUM(out_qty) as total_out,
  cost_per_unit
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
  AND parent_lot_no IS NOT NULL  -- ✅ Only ADJUSTMENT transactions
GROUP BY lot_no, parent_lot_no, cost_per_unit
ORDER BY created_at ASC
```

### Transaction Type Behavior (Current Implementation)

**✅ Implemented**: Transaction type distinction via parent_lot_no pattern

| Transaction Type | Layer Type | Creates New Lot? | parent_lot_no | Implementation Status |
|-----------------|------------|------------------|---------------|----------------------|
| **GRN Commitment** | LOT | ✅ Yes | NULL | ✅ Auto-generates lot number |
| **Transfer In** | LOT | ✅ Yes | NULL | ⚠️ Manual lot creation at destination |
| **Store Requisition** | ADJUSTMENT | ❌ No | Populated | ✅ Links via parent_lot_no |
| **Credit Note** | ADJUSTMENT | ❌ No | Populated | ✅ Links via parent_lot_no |
| **Inventory Adjustment** | ADJUSTMENT | ❌ No | Populated | ✅ Links via parent_lot_no |
| **Production Output** | LOT | ✅ Yes | NULL | ✅ Auto-generates lot number |
| **Production Consumption** | ADJUSTMENT | ❌ No | Populated | ✅ Links via parent_lot_no |

**Pattern Rules**:
- **LOT transactions** (parent_lot_no = NULL): Create new inventory lots with new lot numbers
- **ADJUSTMENT transactions** (parent_lot_no = value): Modify existing lots, maintain audit trail

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
4. **Period Re-Open**: With reason tracking and authorization
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

| Feature | FIFO (Current) | Periodic Average (Current) | Future Enhancements |
|---------|----------------|---------------------------|---------------------|
| **Complexity** | Moderate | Low | High |
| **Performance** | Moderate (aggregation) | Low (no cache) | High (with caching) |
| **Cost Accuracy** | Good (lot-based) | Approximate (averaged) | Excellent (optimized) |
| **Lot Traceability** | ✅ Full (parent_lot_no) | ❌ None | ✅ Enhanced queries |
| **Transaction Types** | ✅ LOT/ADJUSTMENT | N/A | ✅ Maintained |
| **Storage** | Moderate | Low | Moderate |
| **Period Management** | ❌ None | ❌ None | ⚠️ Future (tb_period) |
| **Snapshots** | ❌ None | ❌ None | ⚠️ Future (tb_period_snapshot) |
| **Automatic Lot Numbers** | ✅ Auto-generate | N/A | ✅ Auto-generate |
| **Transfer Lot Creation** | ⚠️ Manual | N/A | ⚠️ Future (automatic) |

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

### Version 2.1.0 (LOT/ADJUSTMENT Implementation) - 2025-11-06

**✅ Transaction Type System Implemented**

This update reflects the implementation of LOT and ADJUSTMENT transaction type distinction via the `parent_lot_no` pattern.

**Key Changes**:
1. **Transaction Type Distinction Implemented**:
   - LOT transactions: `parent_lot_no` is NULL (new lot creation)
   - ADJUSTMENT transactions: `parent_lot_no` is populated (references parent lot)
   - Parent-child lot traceability now available
   - Updated Prisma model to include `parent_lot_no` field

2. **Documentation Updates**:
   - Moved LOT/ADJUSTMENT from "Future Enhancements" to "Current Implementation"
   - Updated SQL queries to demonstrate transaction type filtering
   - Added transaction type to TypeScript interfaces
   - Updated business rules to reflect implementation status
   - Enhanced transaction type behavior table with pattern rules

3. **Examples Enhanced**:
   - Added queries for LOT-only and ADJUSTMENT-only transactions
   - Demonstrated parent_lot_no usage patterns
   - Updated comparison matrix to reflect current capabilities

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

**Version**: 2.1.0 (LOT/ADJUSTMENT Implementation)
**Status**: Transaction type system implemented via parent_lot_no pattern
**Last Updated**: 2025-11-06
**Maintained By**: Architecture Team

**Related Documents**:
- `SCHEMA-ALIGNMENT.md` - Gap analysis and implementation roadmap
- `SM-inventory-valuation.md` - Core inventory valuation specification
- `SM-period-management.md` - Period lifecycle management (future)
- `SM-period-end-snapshots.md` - Snapshot process specification (future)
