# Shared Method: Inventory Valuation

**📌 Schema Reference**: Data structures defined in `/prisma/schema.prisma`
**⚠️ Status**: Current schema documented with future enhancements marked
**📋 Gap Analysis**: See [SCHEMA-ALIGNMENT.md](./SCHEMA-ALIGNMENT.md) for implementation roadmap

## Purpose

The Inventory Valuation shared method provides **centralized, application-wide inventory costing** using either **FIFO (First-In-First-Out)** or **AVG (Periodic Average)** costing methods. This ensures consistent inventory valuation across all modules and transactions.

**Database Enum**: `enum_calculation_method` with values `FIFO` and `AVG` ✅ (exists in schema)

## Current Schema Structure

### Core Tables

#### 1. tb_inventory_transaction (Header)
```prisma
model tb_inventory_transaction {
  id                 String  @id @db.Uuid
  inventory_doc_type enum_inventory_doc_type  // ✅ good_received_note, credit_note, store_requisition, stock_in, stock_out
  inventory_doc_no   String  @db.Uuid
  note               String?
  info               Json?
  dimension          Json?
  // ... audit fields
}
```

#### 2. tb_inventory_transaction_detail (Transaction Items)
```prisma
model tb_inventory_transaction_detail {
  id                       String   @id @db.Uuid
  inventory_transaction_id String   @db.Uuid

  from_lot_no    String?  @db.VarChar  // ✅ Exists - source lot for consumption
  current_lot_no String?  @db.VarChar  // ✅ Exists - destination lot for receipts

  location_id String?  @db.Uuid
  product_id  String   @db.Uuid

  qty           Decimal?  @db.Decimal(20, 5)  // ✅ Transaction quantity
  cost_per_unit Decimal?  @db.Decimal(20, 5)  // ✅ Unit cost
  total_cost    Decimal?  @db.Decimal(20, 5)  // ✅ Extended cost

  note      String?
  info      Json?
  dimension Json?
  // ... audit fields
}
```

#### 3. tb_inventory_transaction_closing_balance (Lot Balances)
```prisma
model tb_inventory_transaction_closing_balance {
  id                              String  @id @db.Uuid
  inventory_transaction_detail_id String  @db.Uuid

  lot_no    String?  @db.VarChar  // ✅ Lot identifier (free-form currently)
  lot_index Int      @default(1)  // ✅ Sequence for same lot

  location_id String?  @db.Uuid
  product_id  String?  @db.Uuid

  in_qty        Decimal?  @db.Decimal(20, 5)  // ✅ Quantity received into lot
  out_qty       Decimal?  @db.Decimal(20, 5)  // ✅ Quantity consumed from lot
  cost_per_unit Decimal?  @db.Decimal(20, 5)  // ✅ Cost per unit
  total_cost    Decimal?  @db.Decimal(20, 5)  // ✅ Total cost

  note      String?
  info      Json?
  dimension Json?
  // ... audit fields

  @@unique([lot_no, lot_index])
}
```

<div style="color: #FFD700;">

**⚠️ FUTURE ENHANCEMENT** (See SCHEMA-ALIGNMENT.md Phase 1):
```prisma
// Proposed additions to tb_inventory_transaction_closing_balance:
// Note: in_qty and out_qty are KEPT for audit trail
// Remaining quantity is CALCULATED at runtime: SUM(in_qty) - SUM(out_qty)

  receipt_date       DateTime?  // When lot was created (for FIFO ordering)
  transaction_type   String?    // 'LOT' or 'ADJUSTMENT'
  parent_lot_no      String?    // For ADJUSTMENT layers linking to parent
  transaction_reason String?    // Business reason code
```

</div>

### Current Costing Methods

#### FIFO (First-In-First-Out) ✅
**Current Implementation**:
- Uses `lot_no` field in `tb_inventory_transaction_closing_balance`
- Tracks `in_qty` (receipts) and `out_qty` (consumption)
- Balance calculated as: `in_qty - out_qty`

**⚠️ LIMITATION**:
- No enforced lot number format (free-form text)
- No `receipt_date` field for proper FIFO ordering
- No parent lot linkage for adjustment tracking

**✅ CORRECT DESIGN**:
- Balance calculated as `SUM(in_qty) - SUM(out_qty)` (single source of truth, complete audit trail)

**Current Query Pattern**:
```sql
-- Get lot balance
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as current_balance,
  cost_per_unit
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
```

<div style="color: #FFD700;">

**⚠️ FUTURE ENHANCEMENT** (See SCHEMA-ALIGNMENT.md Phase 3):
```sql
-- Proposed FIFO query with receipt_date ordering
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,
  cost_per_unit,
  -- receipt_date can be extracted from lot_no if needed: SUBSTRING(lot_no FROM POSITION('-') + 1 FOR 6)
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- Natural chronological sort (FIFO via embedded date)
```

</div>

#### Periodic Average (AVG) ✅
**Current Implementation**:
- Calculates average cost from transaction details
- Uses `enum_calculation_method = 'AVG'`
- No lot tracking required

**Current Calculation**:
```sql
-- Monthly average cost
SELECT
  product_id,
  location_id,
  SUM(total_cost) / SUM(qty) as avg_cost
FROM tb_inventory_transaction_detail itd
JOIN tb_inventory_transaction it ON itd.inventory_transaction_id = it.id
WHERE it.created_at BETWEEN :period_start AND :period_end
  AND it.inventory_doc_type = 'good_received_note'
GROUP BY product_id, location_id
```

## Scope

### Application-Wide Usage

This shared method is used across multiple modules:

| Module | Use Case | Current Integration | Future Enhancement |
|--------|----------|-------------------|-------------------|
| **Credit Notes** | Calculate return cost | Uses `from_lot_no` field | ⚠️ Enhanced lot consumption tracking |
| **GRN (Goods Receipt)** | Record receipt cost | Creates `current_lot_no` entry | ✅ Automatic lot number generation |
| **Store Requisitions** | Issue cost calculation | Uses `from_lot_no` for consumption | ⚠️ FIFO algorithm with parent linkage |
| **Stock In/Out** | Inventory movement costing | Basic lot tracking | ⚠️ Enhanced lot lineage tracking |
| **Inventory Adjustments** | Adjustment costing | Manual lot specification | ⚠️ Automated lot selection |
| **Financial Reporting** | COGS and valuation | Manual calculation | ⚠️ Automated period snapshots |

### Centralization Benefits

✅ **Consistency**: Same costing method applied across all transactions
✅ **Compliance**: Meets accounting standards (GAAP, IFRS)
✅ **Auditability**: Single point of control for cost calculations
✅ **Maintainability**: Update costing logic in one place
✅ **Performance**: Optimized with caching strategies

## System Configuration

### Company-Wide Setting ✅

The inventory costing method is configured **once at the company level** and applies to **all inventory items** and **all locations**.

**Configuration Location**: System Administration > Settings > Inventory Settings

**Available Methods** (from `enum_calculation_method`):
1. **FIFO (First-In-First-Out)** - Consumes oldest inventory first
2. **AVG (Periodic Average)** - Uses monthly average cost for all transactions

**Key Principle**: The system setting determines costing for **new transactions only**. Historical transactions retain their original costing.

## Current Transaction Flow

### Transaction Types ✅

From `enum_inventory_doc_type`:

| Type | Code | Purpose | Creates Lot? | Consumes Lot? |
|------|------|---------|--------------|---------------|
| **GRN** | `good_received_note` | Purchase receipt | ✅ Yes (`current_lot_no`) | ❌ No |
| **Credit Note** | `credit_note` | Vendor return | ❌ No | ✅ Yes (`from_lot_no`) |
| **Store Requisition** | `store_requisition` | Inventory issue | ❌ No | ✅ Yes (`from_lot_no`) |
| **Stock In** | `stock_in` | Inventory receipt | ✅ Yes (`current_lot_no`) | ❌ No |
| **Stock Out** | `stock_out` | Inventory issue | ❌ No | ✅ Yes (`from_lot_no`) |

### Transaction Flow Diagrams

#### 1. GRN (Good Received Note) - Receipt Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Create GRN from Purchase Order                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Create Transaction Header                                │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction                             │
│   id                 = UUID                                       │
│   inventory_doc_type = 'good_received_note'                      │
│   inventory_doc_no   = {GRN_ID}                                  │
│   note               = "Received from PO-12345"                  │
│   created_at         = NOW()                                     │
│   created_by_id      = {USER_ID}                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Create Transaction Detail (per item)                     │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction_detail                      │
│   id                       = UUID                                 │
│   inventory_transaction_id = {HEADER_ID}                         │
│   current_lot_no           = {LOT_NUMBER}  ← Manual entry        │
│   location_id              = {LOCATION_ID}                       │
│   product_id               = {PRODUCT_ID}                        │
│   qty                      = {RECEIVED_QTY}                      │
│   cost_per_unit            = {UNIT_COST}                         │
│   total_cost               = qty × cost_per_unit                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Create Closing Balance Entry (LOT layer)                 │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction_closing_balance             │
│   id                              = UUID                          │
│   inventory_transaction_detail_id = {DETAIL_ID}                  │
│   lot_no                          = {LOT_NUMBER}                 │
│   lot_index                       = 1                            │
│   location_id                     = {LOCATION_ID}                │
│   product_id                      = {PRODUCT_ID}                 │
│   in_qty                          = {RECEIVED_QTY}  ← Creates    │
│   out_qty                         = 0                            │
│   cost_per_unit                   = {UNIT_COST}                  │
│   total_cost                      = in_qty × cost_per_unit       │
│   created_at                      = NOW()                        │
│                                                                   │
│ RESULT: New lot created with inventory                           │
│ Balance: SUM(in_qty) - SUM(out_qty) = {RECEIVED_QTY}            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ OUTCOME: Inventory increased, new lot available for consumption  │
└─────────────────────────────────────────────────────────────────┘
```

#### 2. Credit Note (Vendor Return) - Consumption Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Create Credit Note to return goods to vendor        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Query Available Lots (FIFO)                              │
│ ─────────────────────────────────────────────────────────────── │
│ SELECT lot_no, cost_per_unit,                                    │
│        SUM(in_qty) - SUM(out_qty) as balance                     │
│ FROM tb_inventory_transaction_closing_balance                    │
│ WHERE product_id = {PRODUCT_ID}                                  │
│   AND location_id = {LOCATION_ID}                                │
│   AND lot_no IS NOT NULL                                         │
│ GROUP BY lot_no, cost_per_unit                                   │
│ HAVING SUM(in_qty) - SUM(out_qty) > 0                            │
│ ORDER BY created_at ASC, lot_no ASC  ← FIFO order               │
│                                                                   │
│ RESULT: List of available lots with balances                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Create Transaction Header                                │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction                             │
│   id                 = UUID                                       │
│   inventory_doc_type = 'credit_note'                             │
│   inventory_doc_no   = {CREDIT_NOTE_ID}                          │
│   note               = "Return to vendor"                        │
│   created_at         = NOW()                                     │
│   created_by_id      = {USER_ID}                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Create Transaction Detail (per consumed lot)             │
│ ─────────────────────────────────────────────────────────────── │
│ FOR EACH lot consumed in FIFO order:                             │
│                                                                   │
│ INSERT INTO tb_inventory_transaction_detail                      │
│   id                       = UUID                                 │
│   inventory_transaction_id = {HEADER_ID}                         │
│   from_lot_no              = {LOT_NUMBER}  ← Consumed lot        │
│   location_id              = {LOCATION_ID}                       │
│   product_id               = {PRODUCT_ID}                        │
│   qty                      = {CONSUMED_QTY}                      │
│   cost_per_unit            = {LOT_COST}                          │
│   total_cost               = qty × cost_per_unit                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Create Closing Balance Entry (ADJUSTMENT layer)          │
│ ─────────────────────────────────────────────────────────────── │
│ FOR EACH lot consumed:                                            │
│                                                                   │
│ INSERT INTO tb_inventory_transaction_closing_balance             │
│   id                              = UUID                          │
│   inventory_transaction_detail_id = {DETAIL_ID}                  │
│   lot_no                          = {LOT_NUMBER}                 │
│   lot_index                       = {NEXT_INDEX}                 │
│   location_id                     = {LOCATION_ID}                │
│   product_id                      = {PRODUCT_ID}                 │
│   in_qty                          = 0                            │
│   out_qty                         = {CONSUMED_QTY}  ← Consumes   │
│   cost_per_unit                   = {LOT_COST}                   │
│   total_cost                      = out_qty × cost_per_unit      │
│   created_at                      = NOW()                        │
│                                                                   │
│ RESULT: Lot balance reduced by consumption                       │
│ New Balance: SUM(in_qty) - SUM(out_qty) = Previous - Consumed   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ OUTCOME: Inventory decreased, COGS recorded at lot cost          │
└─────────────────────────────────────────────────────────────────┘
```

#### 3. Store Requisition (Issue to Department) - Consumption Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Department requests inventory (e.g., Kitchen)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Query Available Lots (FIFO)                              │
│ ─────────────────────────────────────────────────────────────── │
│ [Same as Credit Note - FIFO query for available lots]            │
│                                                                   │
│ SELECT lot_no, cost_per_unit,                                    │
│        SUM(in_qty) - SUM(out_qty) as balance                     │
│ FROM tb_inventory_transaction_closing_balance                    │
│ WHERE product_id = {PRODUCT_ID}                                  │
│   AND location_id = {LOCATION_ID}                                │
│   AND lot_no IS NOT NULL                                         │
│ GROUP BY lot_no, cost_per_unit                                   │
│ HAVING SUM(in_qty) - SUM(out_qty) > 0                            │
│ ORDER BY created_at ASC, lot_no ASC                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Create Transaction Header                                │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction                             │
│   id                 = UUID                                       │
│   inventory_doc_type = 'store_requisition'                       │
│   inventory_doc_no   = {REQUISITION_ID}                          │
│   note               = "Issue to Kitchen - Recipe #123"          │
│   created_at         = NOW()                                     │
│   created_by_id      = {USER_ID}                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Create Transaction Detail (per consumed lot)             │
│ ─────────────────────────────────────────────────────────────── │
│ FOR EACH lot consumed in FIFO order:                             │
│                                                                   │
│ INSERT INTO tb_inventory_transaction_detail                      │
│   id                       = UUID                                 │
│   inventory_transaction_id = {HEADER_ID}                         │
│   from_lot_no              = {LOT_NUMBER}  ← Consumed lot        │
│   location_id              = {LOCATION_ID}                       │
│   product_id               = {PRODUCT_ID}                        │
│   qty                      = {ISSUED_QTY}                        │
│   cost_per_unit            = {LOT_COST}                          │
│   total_cost               = qty × cost_per_unit                 │
│   dimension                = {DEPARTMENT_ID, RECIPE_ID}          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Create Closing Balance Entry (ADJUSTMENT layer)          │
│ ─────────────────────────────────────────────────────────────── │
│ FOR EACH lot consumed:                                            │
│                                                                   │
│ INSERT INTO tb_inventory_transaction_closing_balance             │
│   id                              = UUID                          │
│   inventory_transaction_detail_id = {DETAIL_ID}                  │
│   lot_no                          = {LOT_NUMBER}                 │
│   lot_index                       = {NEXT_INDEX}                 │
│   location_id                     = {LOCATION_ID}                │
│   product_id                      = {PRODUCT_ID}                 │
│   in_qty                          = 0                            │
│   out_qty                         = {ISSUED_QTY}  ← Consumes     │
│   cost_per_unit                   = {LOT_COST}                   │
│   total_cost                      = out_qty × cost_per_unit      │
│   dimension                       = {DEPARTMENT_ID}              │
│   created_at                      = NOW()                        │
│                                                                   │
│ RESULT: Lot balance reduced, COGS allocated to department        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ OUTCOME: Inventory issued to department, cost tracked by recipe  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. Stock In (Direct Receipt) - Receipt Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Direct stock receipt (no PO)                        │
│ Use Cases: Beginning balance, found inventory, donations         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Create Transaction Header                                │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction                             │
│   id                 = UUID                                       │
│   inventory_doc_type = 'stock_in'                                │
│   inventory_doc_no   = {STOCK_IN_ID}                             │
│   note               = "Beginning balance / Found items"         │
│   created_at         = NOW()                                     │
│   created_by_id      = {USER_ID}                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Create Transaction Detail                                │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction_detail                      │
│   id                       = UUID                                 │
│   inventory_transaction_id = {HEADER_ID}                         │
│   current_lot_no           = {LOT_NUMBER}  ← Manual entry        │
│   location_id              = {LOCATION_ID}                       │
│   product_id               = {PRODUCT_ID}                        │
│   qty                      = {RECEIVED_QTY}                      │
│   cost_per_unit            = {UNIT_COST}                         │
│   total_cost               = qty × cost_per_unit                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Create Closing Balance Entry (LOT layer)                 │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction_closing_balance             │
│   id                              = UUID                          │
│   inventory_transaction_detail_id = {DETAIL_ID}                  │
│   lot_no                          = {LOT_NUMBER}                 │
│   lot_index                       = 1                            │
│   location_id                     = {LOCATION_ID}                │
│   product_id                      = {PRODUCT_ID}                 │
│   in_qty                          = {RECEIVED_QTY}  ← Creates    │
│   out_qty                         = 0                            │
│   cost_per_unit                   = {UNIT_COST}                  │
│   total_cost                      = in_qty × cost_per_unit       │
│   created_at                      = NOW()                        │
│                                                                   │
│ RESULT: New lot created with inventory                           │
│ Balance: SUM(in_qty) - SUM(out_qty) = {RECEIVED_QTY}            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ OUTCOME: Inventory increased without purchase order reference    │
└─────────────────────────────────────────────────────────────────┘
```

#### 5. Stock Out (Direct Issue) - Consumption Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Direct stock removal                                │
│ Use Cases: Wastage, expired items, damaged goods, write-off      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Query Available Lots (FIFO)                              │
│ ─────────────────────────────────────────────────────────────── │
│ [Same FIFO query as Credit Note and Store Requisition]           │
│                                                                   │
│ SELECT lot_no, cost_per_unit,                                    │
│        SUM(in_qty) - SUM(out_qty) as balance                     │
│ FROM tb_inventory_transaction_closing_balance                    │
│ WHERE product_id = {PRODUCT_ID}                                  │
│   AND location_id = {LOCATION_ID}                                │
│   AND lot_no IS NOT NULL                                         │
│ GROUP BY lot_no, cost_per_unit                                   │
│ HAVING SUM(in_qty) - SUM(out_qty) > 0                            │
│ ORDER BY created_at ASC, lot_no ASC                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Create Transaction Header                                │
│ ─────────────────────────────────────────────────────────────── │
│ INSERT INTO tb_inventory_transaction                             │
│   id                 = UUID                                       │
│   inventory_doc_type = 'stock_out'                               │
│   inventory_doc_no   = {STOCK_OUT_ID}                            │
│   note               = "Wastage - expired items"                 │
│   created_at         = NOW()                                     │
│   created_by_id      = {USER_ID}                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Create Transaction Detail (per consumed lot)             │
│ ─────────────────────────────────────────────────────────────── │
│ FOR EACH lot consumed in FIFO order:                             │
│                                                                   │
│ INSERT INTO tb_inventory_transaction_detail                      │
│   id                       = UUID                                 │
│   inventory_transaction_id = {HEADER_ID}                         │
│   from_lot_no              = {LOT_NUMBER}  ← Consumed lot        │
│   location_id              = {LOCATION_ID}                       │
│   product_id               = {PRODUCT_ID}                        │
│   qty                      = {REMOVED_QTY}                       │
│   cost_per_unit            = {LOT_COST}                          │
│   total_cost               = qty × cost_per_unit                 │
│   note                     = "Reason: Expired"                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Create Closing Balance Entry (ADJUSTMENT layer)          │
│ ─────────────────────────────────────────────────────────────── │
│ FOR EACH lot consumed:                                            │
│                                                                   │
│ INSERT INTO tb_inventory_transaction_closing_balance             │
│   id                              = UUID                          │
│   inventory_transaction_detail_id = {DETAIL_ID}                  │
│   lot_no                          = {LOT_NUMBER}                 │
│   lot_index                       = {NEXT_INDEX}                 │
│   location_id                     = {LOCATION_ID}                │
│   product_id                      = {PRODUCT_ID}                 │
│   in_qty                          = 0                            │
│   out_qty                         = {REMOVED_QTY}  ← Consumes    │
│   cost_per_unit                   = {LOT_COST}                   │
│   total_cost                      = out_qty × cost_per_unit      │
│   note                            = "Wastage/Write-off"          │
│   created_at                      = NOW()                        │
│                                                                   │
│ RESULT: Lot balance reduced, loss/expense recorded               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ OUTCOME: Inventory decreased, wastage/loss expense recorded      │
└─────────────────────────────────────────────────────────────────┘
```

#### Transaction Flow Legend

```
┌──────────┐
│ Box      │  Represents a process step or data operation
└──────────┘

    ↓         Flow direction (top to bottom)

FOR EACH      Loop/iteration for multiple items or lots

← →           Annotation/explanation arrow

[Section]     Reference to other documented process

{VARIABLE}    Placeholder for actual value
```

### Current Data Flow

**Receipt Transaction (GRN, Stock In)**:
```
1. Create tb_inventory_transaction (header)
2. Create tb_inventory_transaction_detail (with current_lot_no)
3. Create tb_inventory_transaction_closing_balance (with in_qty > 0)
```

**Consumption Transaction (Credit Note, Store Req, Stock Out)**:
```
1. Create tb_inventory_transaction (header)
2. Create tb_inventory_transaction_detail (with from_lot_no)
3. Update tb_inventory_transaction_closing_balance (with out_qty > 0)
```

<div style="color: #FFD700;">

**⚠️ FUTURE ENHANCEMENT** (See SCHEMA-ALIGNMENT.md Phase 3):
```
Receipt Transaction:
1. Generate structured lot number: {LOCATION}-{YYMMDD}-{SEQ} (e.g., MK-251102-01)
2. Create LOT layer with in_qty > 0, transaction_type = 'LOT'
   - No separate receipt_date needed (date embedded in lot_no)

Consumption Transaction:
1. Query available lots WHERE SUM(in_qty) - SUM(out_qty) > 0
2. ORDER BY lot_no ASC (natural chronological sort - FIFO)
3. Consume from oldest lot(s) first
4. Create ADJUSTMENT layer(s) with out_qty > 0, parent_lot_no linkage
5. Set transaction_type = 'ADJUSTMENT'

Note:
- Remaining quantity calculated at runtime: SUM(in_qty) - SUM(out_qty)
- Date can be extracted from lot_no when needed: SUBSTRING(lot_no, position('-')+1, 6)
```

</div>

## Current Lot Tracking Limitations

### What Works Today ✅

1. **Structured Lot Tracking**: System tracks `lot_no` with format `{LOCATION}-{YYMMDD}-{SEQ}` (e.g., `MK-251102-01`)
2. **Date Embedded in Lot**: Date stored in lot number (no separate receipt_date field needed)
3. **FIFO Ordering**: ORDER BY lot_no ASC provides natural chronological sort
4. **In/Out Quantities**: Tracks receipts (`in_qty`) and consumption (`out_qty`)
5. **Cost Tracking**: Stores `cost_per_unit` and `total_cost`
6. **Transaction Linkage**: Links to transaction details via foreign key
7. **Multi-Location Support**: Separate lot balances per location
8. **Calculated Balance**: `SUM(in_qty) - SUM(out_qty)` provides single source of truth with complete audit trail

### Current Limitations ⚠️

1. **No Parent Linkage**: Can't trace which lot was consumed (no `parent_lot_no` field)
2. **No Transaction Type**: Can't distinguish LOT vs ADJUSTMENT layers (no `transaction_type` field)
3. **No Period Management**: No `tb_period` table for month-end close
4. **No Snapshots**: No `tb_period_snapshot` table for historical balances

### Current FIFO Implementation ✅

**FIFO Query (Using Lot Number Sort)**:
```sql
-- ✅ Current implementation: Order by lot_no provides chronological sort
SELECT
  lot_no,  -- Format: {LOCATION}-{YYMMDD}-{SEQ} (e.g., MK-251102-01)
  cost_per_unit,
  SUM(in_qty) - SUM(out_qty) as balance,
  -- Extract date from lot_no if needed:
  SUBSTRING(lot_no FROM POSITION('-' IN lot_no) + 1 FOR 6) as embedded_date
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id AND location_id = :location_id
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- ✅ True FIFO: lot_no naturally sorts chronologically
```

**Period-End Valuation**:
```sql
-- Current workaround: Manual calculation at period-end
SELECT
  product_id,
  location_id,
  SUM(in_qty) - SUM(out_qty) as closing_qty,
  AVG(cost_per_unit) as avg_cost
FROM tb_inventory_transaction_closing_balance
WHERE created_at <= :period_end_date
GROUP BY product_id, location_id
-- ⚠️ No automated snapshot creation
```

## Implementation Roadmap

**See [SCHEMA-ALIGNMENT.md](./SCHEMA-ALIGNMENT.md) for detailed implementation plan**

### Phase 1: Schema Enhancement (1-2 weeks)
- Add new fields to `tb_inventory_transaction_closing_balance`
- Create `tb_period` and `tb_period_snapshot` tables
- Migrate existing data to new structure

### Phase 2: Lot Number Standardization (1 week)
- Implement structured lot number format
- Add generation and validation logic

### Phase 3: FIFO Algorithm Implementation (2-3 weeks)
- Implement proper FIFO consumption logic
- Add parent lot linkage
- Update transaction posting workflow

### Phase 4: Period Management (2-3 weeks)
- Implement period lifecycle (OPEN → CLOSED → LOCKED)
- Automated snapshot creation
- Period re-open workflow

### Phase 5: Reporting & Validation (2 weeks)
- Inventory valuation reports
- COGS calculations
- Variance analysis

**Total Timeline**: 8-11 weeks (2-3 months)

## Service Implementation

### Current Service Location

**Location**: `/lib/services/inventory/inventory-valuation-service.ts` (to be created)

**Main Method** (Current):
```typescript
async function getInventoryValue(
  productId: string,
  locationId: string
): Promise<number> {
  // Current implementation: Calculate from closing balance
  const balances = await db.tb_inventory_transaction_closing_balance.findMany({
    where: {
      product_id: productId,
      location_id: locationId,
    },
  })

  const totalValue = balances.reduce((sum, bal) => {
    const qty = (bal.in_qty || 0) - (bal.out_qty || 0)
    const cost = bal.cost_per_unit || 0
    return sum + (qty * cost)
  }, 0)

  return totalValue
}
```

<div style="color: #FFD700;">

**⚠️ FUTURE ENHANCEMENT**:
```typescript
async function calculateInventoryValuation(
  itemId: string,
  quantity: number,
  date: Date
): Promise<ValuationResult> {
  // Future implementation: FIFO with receipt_date ordering
  // See SCHEMA-ALIGNMENT.md Phase 3
}
```

</div>

## Business Rules

### 1. Company-Wide Configuration ✅
- ✅ One costing method applies to entire company
- ✅ All locations use the same method (FIFO or AVG)
- ✅ All items use the same method
- ✅ Configured in `enum_calculation_method`

### 2. Historical Integrity ✅
- ✅ Existing transactions retain original costing
- ✅ Only new transactions use updated method
- ❌ **Not Implemented**: Changing method does NOT recalculate history (no mechanism exists)

### 3. Current Lot Management
- ✅ System tracks `lot_no` in closing balance table
- ✅ Tracks `in_qty` and `out_qty` per lot (balance calculated at runtime)
- ⚠️ **Limitation**: No enforced lot number format
- ⚠️ **Limitation**: No `receipt_date` for proper FIFO ordering

### 4. Transaction Posting ✅
- ✅ Transaction creates header (`tb_inventory_transaction`)
- ✅ Transaction creates details (`tb_inventory_transaction_detail`)
- ✅ Receipt transactions populate `current_lot_no`
- ✅ Consumption transactions populate `from_lot_no`
- ⚠️ **Limitation**: No validation of lot availability before consumption

### 5. Cost Precision ✅
- ✅ Costs stored with 5 decimal places (`DECIMAL(20,5)`)
- ✅ Includes: `cost_per_unit`, `total_cost` fields
- ✅ Currency-specific rounding rules can be applied

### 6. Period Management ❌
- ❌ **Not Implemented**: No `tb_period` table exists
- ❌ **Not Implemented**: No period status lifecycle (OPEN/CLOSED/LOCKED)
- ❌ **Not Implemented**: No automated period-end snapshots
- ⚠️ **Workaround**: Manual month-end calculations

### 7. Periodic Average Calculation ✅
- ✅ System can calculate average from transaction details
- ✅ Formula: `SUM(total_cost) / SUM(qty)` for period
- ⚠️ **Limitation**: No caching mechanism (calculate on-demand)
- ⚠️ **Limitation**: No period definition table

## Data Flow

### Current FIFO Flow ✅
```
GRN Receipt → Generate lot_no: {LOCATION}-{YYMMDD}-{SEQ} (e.g., MK-251102-01)
           → Create closing_balance entry (lot_no, in_qty, cost_per_unit)
                         ↓
           Store in tb_inventory_transaction_closing_balance
                         ↓
Stock-Out → Query available lots WHERE SUM(in_qty) - SUM(out_qty) > 0
               ↓
           ORDER BY lot_no ASC (✅ natural chronological sort - true FIFO)
               ↓
           Consume oldest lot first
               ↓
           Create closing_balance entry (out_qty)
               ↓
           Balance = SUM(in_qty) - SUM(out_qty) (calculated from transaction history)
```

**⚠️ FUTURE FIFO ENHANCEMENTS** (See SCHEMA-ALIGNMENT.md):
```
Additional Features NOT YET IMPLEMENTED:
- transaction_type field (to distinguish LOT vs ADJUSTMENT layers)
- parent_lot_no field (for adjustment layer traceability)

Current Flow (Implemented):
GRN Receipt → ✅ Auto-generates {LOCATION}-{YYMMDD}-{SEQ}
           → Create lot entry (in_qty > 0)
                         ↓
Stock-Out → Query lots WHERE SUM(in_qty) - SUM(out_qty) > 0
           → ORDER BY lot_no ASC (chronological FIFO)
           → Consume oldest lot first
           → Create ADJUSTMENT layer (out_qty > 0, parent_lot_no, transaction_type = 'ADJUSTMENT')
           → Balance recalculated: SUM(in_qty) - SUM(out_qty)
```

### Current Periodic Average Flow
```
Month Start → Accumulate Receipts
                ↓
        Calculate: SUM(total_cost) / SUM(qty)
                ↓
        Apply average cost to all transactions
                ↓
        ⚠️ Recalculate on-demand (no caching)
```

## API Integration

### Current API Patterns

**Get Inventory Balance**:
```typescript
// GET /api/inventory/balance?productId={id}&locationId={id}
const balance = await db.$queryRaw`
  SELECT
    product_id,
    location_id,
    SUM(in_qty) - SUM(out_qty) as balance,
    AVG(cost_per_unit) as avg_cost
  FROM tb_inventory_transaction_closing_balance
  WHERE product_id = ${productId}
    AND location_id = ${locationId}
  GROUP BY product_id, location_id
`
```

**Post Transaction**:
```typescript
// POST /api/inventory/transaction
// 1. Create tb_inventory_transaction
// 2. Create tb_inventory_transaction_detail (with from_lot_no or current_lot_no)
// 3. Create/Update tb_inventory_transaction_closing_balance
```

## Related Documentation

- **[SCHEMA-ALIGNMENT.md](./SCHEMA-ALIGNMENT.md)** - Current vs desired schema gap analysis
- [SM-costing-methods.md](./SM-costing-methods.md) - FIFO and Periodic Average details
- [SM-transaction-types-and-cost-layers.md](./SM-transaction-types-and-cost-layers.md) - Transaction type specifications
- [SM-period-end-snapshots.md](./SM-period-end-snapshots.md) - Period-end snapshot process (future)
- [SM-period-management.md](./SM-period-management.md) - Period lifecycle management (future)

---

**Version**: 2.0.0 (Schema-Aligned)
**Last Updated**: 2025-11-03
**Maintained By**: Architecture Team
**Status**: Current Schema Documented + Future Enhancements Identified

---

## Document Revision Notes

**Version 2.0.0** (2025-11-03) - Schema Alignment Update:
- ✅ Documented ACTUAL current schema structure
- ✅ Used actual table names (`tb_inventory_transaction_closing_balance`)
- ✅ Used actual field names (`in_qty`, `out_qty`, `lot_no`, `from_lot_no`, `current_lot_no`)
- ✅ Used actual enums (`enum_calculation_method`, `enum_inventory_doc_type`)
- ⚠️ Marked all future enhancements with clear comments
- 📋 Created SCHEMA-ALIGNMENT.md with implementation roadmap
- 🔗 Cross-referenced gap analysis document

**Version 1.2** (2025-11-03) - Original Version:
- Documented desired lot-based system (not aligned with current schema)
- Used proposed field names that don't exist yet
- See SCHEMA-ALIGNMENT.md for migration from v1.2 → v2.0
