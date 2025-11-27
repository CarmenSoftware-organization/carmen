# Current System Capabilities: What Works Today

**Document Version**: 1.0.0
**Last Updated**: 2025-01-04
**Status**: Production v1.0 Reference Guide
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Audience**: End Users, Operations Staff, Finance Team

---

## 🎯 Quick Summary

The Carmen ERP inventory valuation system is **production-ready** with core lot-based tracking and dual costing method support. This guide shows you what's available today and how to use it effectively.

```
✅ System Status: Production Ready
📦 Version: 1.0 (Foundation)
🎓 Maturity: 80% Complete
🚀 Next Phase: Enhancement Program (8-11 weeks)
```

---

## ✅ What You Can Do Today

### 1. Track Inventory by Lot Number

**Status**: ✅ **Fully Functional**

Every inventory receipt creates a unique lot number that tracks the item from receipt to consumption.

**Lot Number Format**: `{LOCATION}-{YYMMDD}-{SEQ}`

**Examples**:
- `MK-250115-0001` - Main Kitchen, January 15, 2025, sequence 01
- `BAR-250116-0002` - Bar, January 16, 2025, sequence 02
- `KC-251105-0001` - Kakadiya Kitchen, November 5, 2025, sequence 01

**Key Features**:
- ✅ Automatic lot number generation on GRN commit
- ✅ Unique tracking from receipt to consumption
- ✅ Embedded date for natural FIFO ordering
- ✅ Location-specific lot identification
- ✅ Daily sequence numbering

**How to Use**:
```
1. Receive goods → System creates lot number automatically
2. Record quantity and cost per lot
3. Track lot consumption through production/issues
4. View lot history and current balance
```

---

### 2. Calculate FIFO Costs

**Status**: ✅ **Fully Functional**

First-In-First-Out (FIFO) costing automatically consumes the oldest lots first.

**How It Works**:
```
System sorts lots naturally: MK-250110-0001 → MK-250115-0001 → MK-250120-0001
                            (Jan 10)      (Jan 15)      (Jan 20)
                            Oldest        Middle        Newest
                            Consumed First →
```

**Key Features**:
- ✅ Automatic oldest-lot-first consumption
- ✅ Natural date sorting (no separate date field needed)
- ✅ Multi-lot consumption support
- ✅ Cost layer tracking per lot

**When to Use FIFO**:
- ✅ Perishable inventory (food, beverages)
- ✅ Items with expiration dates
- ✅ High price volatility
- ✅ Matching physical flow

**Example Scenario**:
```
Stock on Hand:
- LOT: MK-250110-0001 | Qty: 50 kg | Cost: $10.00/kg | Total: $500
- LOT: MK-250115-0001 | Qty: 75 kg | Cost: $12.00/kg | Total: $900

Issue Request: 100 kg

System Automatically Consumes:
1. MK-250110-0001: 50 kg @ $10.00 = $500.00
2. MK-250115-0001: 50 kg @ $12.00 = $600.00
   Total Cost: $1,100.00
   Average: $11.00/kg
```

---

### 3. Calculate Periodic Average Costs (Enhanced with Period-End Revaluation)

**Status**: ✅ **Fully Functional**

Enhanced Periodic Average costing calculates the weighted average cost for all receipts within a calendar month, with automated period-end revaluation to standardize inventory costs.

**How It Works**:
```
Period: January 2025 (25-01)

During Period (Receipts at Actual Cost):
- MK-250105-0001: 100 kg @ $10.00 = $1,000.00
- MK-250112-0001: 150 kg @ $12.00 = $1,800.00
- MK-250120-0001: 200 kg @ $11.00 = $2,200.00

Period Average = $5,000 / 450 kg = $11.11/kg (rounded to 2 decimals)

Consumption During Period:
- All January issues use cached average: $11.11/kg for reference

Period-End Close (Revaluation):
- Remaining inventory: 250 kg at various actual costs
- Book value at actual costs: $2,750.00
- Revalued amount: 250 kg × $11.11 = $2,777.50
- Diff (revaluation variance): $27.50 posted to P&L

Next Period Opens:
- Opening balance: 250 kg @ $11.11/kg (standardized)
- Clean slate for February calculations
```

**Key Features**:
- ✅ Calendar month period boundaries (YY-MM format)
- ✅ Receipts recorded at actual cost (never adjusted during period)
- ✅ Cached period average used for consumption reference
- ✅ Automated period-end revaluation via CLOSE transaction
- ✅ Opening balance standardized via OPEN transaction
- ✅ Diff column tracks rounding errors and revaluation variance
- ✅ Receipt-based averaging: `SUM(total_cost) / SUM(qty)`
- ✅ Fallback strategies for missing data

**Transaction Types**:
- **RECEIVE**: Records receipt at actual cost (LOT layer, no parent)
- **ISSUE**: Consumption using cached period average (ADJUSTMENT layer, has parent)
- **CLOSE**: Revalues ending inventory to period average (LOT layer)
- **OPEN**: Creates opening balance at period average (LOT layer)

**When to Use Periodic Average**:
- ✅ Stable prices with low volatility
- ✅ High-volume commodity items
- ✅ Items where physical flow doesn't matter
- ✅ Simplified financial reporting
- ✅ Need for period-to-period cost consistency

**Calculation Formula**:
```sql
-- Calculate period average from receipts
Period Average Cost = SUM(receipt_qty × receipt_cost) / SUM(receipt_qty)
                     for all RECEIVE transactions in period YY-MM

-- Calculate revaluation variance at period close
Diff = (Period Average × Remaining Qty) - Book Value at Actual Costs
```

**Diff Column Behavior**:
- Tracks rounding differences (prices stored as DECIMAL(20,5), displayed as 2 decimals)
- Captures revaluation variance at period close
- Posted to revaluation variance account in P&L
- Ensures inventory balance sheet reflects period average cost

---

### 4. View Complete Transaction History

**Status**: ✅ **Fully Functional**

Every inventory movement is recorded with full audit trail capabilities.

**Transaction Record Fields**:
- ✅ Lot number (`lot_no`)
- ✅ Item and location identification
- ✅ Receipt quantity (`in_qty`)
- ✅ Issue/consumption quantity (`out_qty`)
- ✅ Cost per unit
- ✅ Timestamp
- ✅ User and document reference

**Balance Calculation**:
```
Current Balance = SUM(in_qty) - SUM(out_qty) for each lot
```

**How to Use**:
1. View all transactions for a specific lot number
2. Trace item movement from receipt to consumption
3. Calculate current balance at any point in time
4. Generate audit reports

**Key Features**:
- ✅ Complete audit trail
- ✅ Historical data preservation
- ✅ Point-in-time balance queries
- ✅ Multi-level drill-down capability

---

### 5. Switch Between Costing Methods

**Status**: ✅ **Fully Functional**

The system supports company-wide configuration to use either FIFO or Periodic Average.

**Configuration**:
```
Settings → Inventory → Costing Method
Options:
  • FIFO (First-In-First-Out)
  • Periodic Average

Current Method: [FIFO / Periodic Average]
```

**Key Features**:
- ✅ Company-wide costing method selection
- ✅ Switch between FIFO and Periodic Average
- ✅ Method change audit trail
- ✅ Consistent financial reporting

**Important Notes**:
- ⚠️ Method change affects future transactions only
- ⚠️ Historical data calculated with original method
- ⚠️ Recommend changing at period boundaries
- ⚠️ Consult finance team before switching

---

### 6. Generate Standard Reports

**Status**: ✅ **Fully Functional**

Standard inventory valuation reports are available for financial and operational analysis.

**Available Reports**:
- ✅ Inventory Valuation Summary (by item, location)
- ✅ Lot Balance Report (current quantities and values)
- ✅ Transaction History Report (all movements)
- ✅ Cost Analysis Report (FIFO vs Periodic comparison)
- ✅ Inventory Movement Report (receipts and issues)

**Report Filters**:
- Item / Item Category
- Location / Location Group
- Date Range / Period
- Lot Number
- Transaction Type

---

## ⚠️ Current Limitations & Workarounds

Understanding current limitations helps you work effectively while enhancements are being developed.

### Limitation 1: Inferred Transaction Types

**Current State**: No explicit transaction_type field
**Impact**: Must use `in_qty`/`out_qty` patterns to distinguish receipts from consumption
**Workaround**: Query logic: `WHERE in_qty > 0` (receipt) vs `WHERE out_qty > 0` (consumption)
**Coming in Phase 1** (1-2 weeks): Explicit `transaction_type` ENUM field (LOT, ADJUSTMENT, TRANSFER)

---

### Limitation 2: Limited Parent Lot Traceability

**Current State**: Cannot directly link consumption back to source lot in main table
**Impact**: Audit trail requires joining `transaction_detail` table
**Workaround**: Use `from_lot_no` field in `tb_inventory_transaction_detail` for traceability
**Coming in Phase 1** (1-2 weeks): Direct `parent_lot_no` reference in main balance table

---

### Limitation 3: No Period Locking

**Current State**: Cannot prevent changes to closed accounting periods
**Impact**: Late receipts can alter historical costs
**Workaround**: Manual period freeze procedures, export month-end reports immediately
**Coming in Phase 4** (2-3 weeks): Period lifecycle management (OPEN → CLOSED → LOCKED)

---

### Limitation 4: No Automated Snapshots

**Current State**: No automatic period-end balance preservation
**Impact**: Historical reports recalculated each time (performance and accuracy concerns)
**Workaround**: Export and archive month-end reports manually
**Coming in Phase 4** (2-3 weeks): Automated snapshot creation during period close

---

## 🎓 Best Practices: Using the System Today

### Practice 1: Consistent Lot Number Format

**Do**:
- ✅ Always use format: `{LOCATION}-{YYMMDD}-{SEQ}`
- ✅ Use uppercase location codes (MK, BAR, KC)
- ✅ Use 6-digit date (YYMMDD)
- ✅ Use 2-digit sequence (01, 02, etc.)

**Don't**:
- ❌ Mix formats: `MK-20250115-01` vs `MK-250115-1`
- ❌ Use lowercase: `mk-250115-01`
- ❌ Skip sequence: `MK-250115`
- ❌ Use separators other than hyphen

---

### Practice 2: Choose Right Costing Method

**Use FIFO When**:
- ✅ Inventory is perishable (food, beverages)
- ✅ Items have expiration dates
- ✅ Prices fluctuate significantly
- ✅ Physical flow matches FIFO (oldest used first)
- ✅ Regulatory requirements mandate FIFO

**Use Periodic Average When**:
- ✅ Prices are relatively stable
- ✅ High-volume commodity items
- ✅ Physical flow tracking is impractical
- ✅ Simplified reporting preferred
- ✅ Items are fungible (identical units)

---

### Practice 3: Regular Reconciliation

**Daily**:
- Review transaction postings for errors
- Verify lot balances match physical counts
- Correct any entry mistakes promptly

**Weekly**:
- Run inventory valuation reports
- Compare system balances to physical stock
- Investigate significant variances

**Monthly**:
- Perform full physical inventory count
- Calculate period average costs (if using Periodic Average)
- Export and archive all reports
- Review period close

---

### Practice 4: Audit Trail Maintenance

**Always Document**:
- ✅ Reason for adjustments
- ✅ Source documents (GRN, issue slips)
- ✅ Physical count results

**Maintain Records**:
- ✅ Supporting documents for all transactions
- ✅ Period-end reports and reconciliations
- ✅ Adjustment justifications
- ✅ Physical count sheets

---

## 🔍 Common Tasks & Solutions

### Task: Find All Transactions for a Lot

**Goal**: View complete history of a specific lot number

**Solution**:
```sql
SELECT
  transaction_id,
  lot_no,
  in_qty,
  out_qty,
  cost_per_unit,
  created_at,
  created_by
FROM tb_inventory_transaction_closing_balance
WHERE lot_no = 'MK-250115-001'
ORDER BY created_at ASC
```

**Result**: Complete chronological audit trail for the lot

---

### Task: Calculate Current Lot Balance

**Goal**: Find current quantity and value for a lot

**Solution**:
```sql
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as current_qty,
  cost_per_unit,
  (SUM(in_qty) - SUM(out_qty)) * cost_per_unit as current_value
FROM tb_inventory_transaction_closing_balance
WHERE lot_no = 'MK-250115-001'
GROUP BY lot_no, cost_per_unit
```

**Result**: Current balance and valuation

---

### Task: View FIFO Consumption Order

**Goal**: See which lots will be consumed first

**Solution**:
```sql
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as available_qty,
  cost_per_unit
FROM tb_inventory_transaction_closing_balance
WHERE item_id = 'ITEM-001'
  AND location_id = 'MK'
  AND (SUM(in_qty) - SUM(out_qty)) > 0
GROUP BY lot_no, cost_per_unit
ORDER BY lot_no ASC  -- Natural FIFO order
```

**Result**: Lots listed oldest-first (FIFO order)

---

### Task: Calculate Periodic Average Cost

**Goal**: Find average cost for a period

**Solution**:
```sql
SELECT
  item_id,
  location_id,
  SUM(in_qty * cost_per_unit) / SUM(in_qty) as period_avg_cost
FROM tb_inventory_transaction_closing_balance
WHERE item_id = 'ITEM-001'
  AND location_id = 'MK'
  AND lot_no LIKE '%-2501__-__'  -- January 2025 (YY-MM pattern)
  AND in_qty > 0  -- Only receipts
GROUP BY item_id, location_id
```

**Result**: Weighted average cost for the period

---

### Task: Trace Consumption Source

**Goal**: Find which lot(s) were consumed

**Solution**:
```sql
SELECT
  td.from_lot_no as source_lot,
  td.qty as consumed_qty,
  td.cost_per_unit,
  td.qty * td.cost_per_unit as consumption_cost,
  cb.lot_no as original_receipt_lot
FROM tb_inventory_transaction_detail td
INNER JOIN tb_inventory_transaction_closing_balance cb
  ON td.from_lot_no = cb.lot_no
WHERE td.id = :consumption_transaction_id
ORDER BY td.from_lot_no ASC
```

**Result**: Source lot(s) and consumption details

---

## 📞 Getting Help

### Questions About Using the System?

**Operations Team**:
- Daily usage questions
- Transaction posting issues
- Report interpretation

**Finance Team**:
- Costing method selection
- Period-end procedures
- Valuation policies

**IT Support**:
- System access issues
- Technical problems
- Data corrections

### Common Questions

**Q: Can I change a lot number after posting?**
A: Generally no. Lot numbers should be permanent for audit trail integrity. Contact IT support for exceptional cases.

**Q: What happens if I post with the wrong cost?**
A: Post an adjustment transaction with the correct cost. Document the reason for the adjustment.

**Q: How do I know which costing method to use?**
A: Consult with your finance team. The choice depends on inventory characteristics, regulatory requirements, and reporting needs.

**Q: Can I use both FIFO and Periodic Average?**
A: Not simultaneously. The system uses one method company-wide. However, you can analyze what-if scenarios using both methods in reports.

**Q: When will automatic lot generation be available?**
A: Phase 2 (approximately 1 week after Phase 1 completion). See WHATS-COMING.md for detailed timeline.

---

## 🚀 What's Next?

The system is currently in an **enhancement program** to add advanced features while maintaining full backward compatibility with existing functionality.

**Recently Completed**:
- ✅ **Automatic lot number generation**: GRN commitment auto-generates lot numbers

**Coming Soon**:
- ⏳ **Phase 1** (1-2 weeks): Transaction types, parent lot linkage, schema enhancements
- ⏳ **Phase 3** (2-3 weeks): Enhanced FIFO with complete traceability
- ⏳ **Phase 4** (2-3 weeks): Period management, locking, and automated snapshots
- ⏳ **Phase 5** (2 weeks): Enhanced reporting and performance optimization

**Learn More**:
- See **WHATS-COMING.md** for upcoming features
- See **ENHANCEMENTS-ROADMAP.md** for detailed timeline
- See **ENHANCEMENT-COMPARISON.md** for feature comparisons

---

**Document Status**: ✅ Production Reference
**Next Review**: End of Phase 1
**Maintained By**: Operations & Finance Teams
**Distribution**: All Users
