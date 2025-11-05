# Periodic Average Costing - Deep Dive

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

## Overview

Periodic Average (database value: **AVG**) is a simplified inventory costing method that calculates a **single average unit cost per period** and applies it uniformly to all transactions within that period. This document provides comprehensive details on implementation, calculation, and usage.

**Database Enum**: `enum_calculation_method.AVG` (see schema.prisma:42-45)

## Core Concept

**Principle**: Instead of tracking individual inventory layers (like FIFO), calculate one average cost per period and use it for all transactions.

**Period Definition**: **Calendar Month** (fixed)
- Period starts: 1st day of month (00:00:00)
- Period ends: Last day of month (23:59:59)

## Calculation Algorithm

### Step-by-Step Process

#### 1. Define Period Boundaries

```typescript
function getPeriodBoundaries(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}
```

**Example**:
- Input: `2025-01-15` (any date in January)
- Output:
  - Start: `2025-01-01 00:00:00`
  - End: `2025-01-31 23:59:59`

#### 2. Gather All Receipts in Period

```typescript
interface Receipt {
  grnId: string
  grnNumber: string
  itemId: string
  receiptDate: Date
  quantity: number
  unitCost: number  // Includes all landed costs
  totalCost: number // quantity × unitCost
}

async function getReceiptsForPeriod(
  itemId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Receipt[]> {
  // Query all GRN items for this item within the period
  return await db.query(`
    SELECT grn_id, grn_number, item_id, receipt_date,
           quantity, unit_cost, total_cost
    FROM grn_items
    WHERE item_id = ?
      AND receipt_date BETWEEN ? AND ?
      AND status = 'COMMITTED'
    ORDER BY receipt_date ASC
  `, [itemId, periodStart, periodEnd])
}
```

#### 3. Calculate Period Average Cost

```typescript
function calculatePeriodAverageCost(receipts: Receipt[]): number {
  // Handle edge case: no receipts in period
  if (receipts.length === 0) {
    return null // Will trigger fallback logic
  }

  // Sum all costs and quantities
  const totals = receipts.reduce((acc, receipt) => ({
    totalCost: acc.totalCost + receipt.totalCost,
    totalQuantity: acc.totalQuantity + receipt.quantity
  }), { totalCost: 0, totalQuantity: 0 })

  // Calculate average
  const averageCost = totals.totalCost / totals.totalQuantity

  // Round to 5 decimal places (DECIMAL(20,5) in schema)
  return Math.round(averageCost * 100000) / 100000
}
```

**Formula**:
```
Average Cost = (Σ Total Cost of All Receipts) ÷ (Σ Quantity of All Receipts)
```

#### 4. Cache the Result

**⚠️ Important**: The current schema does not include a dedicated `period_cost_cache` table.

**Data Source**: Average costs are calculated on-demand from `tb_inventory_transaction_detail` (schema.prisma:587-613)

**Recommended Implementation** (application-level caching):
```typescript
// This interface represents recommended caching structure
// Implementation should use Redis, application memory, or similar
interface PeriodCostCache {
  id: string
  itemId: string           // product_id from schema
  period: Date             // First day of month
  averageCost: number      // Calculated: SUM(total_cost) / SUM(qty)
  totalQuantity: number    // SUM(qty) for period
  totalCost: number        // SUM(total_cost) for period
  receiptCount: number     // COUNT of transactions
  calculatedAt: Date       // When calculation was performed
  createdBy: string        // System or user identifier
}

async function cachePeriodCost(
  itemId: string,
  period: Date,
  receipts: Receipt[],
  averageCost: number
): Promise<void> {
  // Implement caching in Redis, memory cache, or add table to schema
  const cache: PeriodCostCache = {
    id: generateId(),
    itemId,
    period: new Date(period.getFullYear(), period.getMonth(), 1), // Normalize to 1st
    averageCost,
    totalQuantity: receipts.reduce((sum, r) => sum + r.quantity, 0),
    totalCost: receipts.reduce((sum, r) => sum + r.totalCost, 0),
    receiptCount: receipts.length,
    calculatedAt: new Date(),
    createdBy: 'SYSTEM'
  }

  // Store in cache (implementation-specific)
  await cacheService.set(`period-cost:${itemId}:${period}`, cache)
}
```

#### 5. Apply to Transactions

```typescript
async function applyPeriodicAverageCost(
  itemId: string,
  quantity: number,
  transactionDate: Date
): Promise<ValuationResult> {
  // Get cached average cost for the transaction's period
  const averageCost = await getCachedOrCalculate(itemId, transactionDate)

  // Calculate total value
  const totalValue = quantity * averageCost

  return {
    itemId,
    quantity,
    unitCost: averageCost,
    totalValue,
    method: 'AVG', // enum_calculation_method.AVG
    period: getPeriodStart(transactionDate),
    calculatedAt: new Date()
  }
}
```

## Detailed Example

### Scenario: January 2025

#### Receipts (GRN)
```
┌────────────┬────────────┬──────────┬───────────┬─────────────┐
│ GRN        │ Date       │ Quantity │ Unit Cost │ Total Cost  │
├────────────┼────────────┼──────────┼───────────┼─────────────┤
│ GRN-001    │ 2025-01-05 │ 100      │ $10.00    │ $1,000.00   │
│ GRN-002    │ 2025-01-12 │ 150      │ $12.50    │ $1,875.00   │
│ GRN-003    │ 2025-01-18 │ 80       │ $11.00    │ $880.00     │
│ GRN-004    │ 2025-01-25 │ 120      │ $11.75    │ $1,410.00   │
└────────────┴────────────┴──────────┴───────────┴─────────────┘

Totals:
  Quantity: 100 + 150 + 80 + 120 = 450 units
  Cost: $1,000 + $1,875 + $880 + $1,410 = $5,165.00
```

#### Average Calculation
```
January 2025 Average Cost = $5,165.00 ÷ 450 = $11.4778 per unit
```

#### Cached Record
```typescript
{
  itemId: "ITEM-123",
  period: new Date("2025-01-01"),
  averageCost: 11.4778,
  totalQuantity: 450,
  totalCost: 5165.00,
  receiptCount: 4,
  calculatedAt: new Date("2025-01-31 23:00:00"),
  createdBy: "SYSTEM"
}
```

#### Transactions Using January Average

```
Transaction 1: Credit Note on Jan 8 for 60 units
├─ Date: 2025-01-08 (January)
├─ Average Cost: $11.4778
├─ Calculation: 60 × $11.4778 = $688.67
└─ Note: GRN-002 hadn't been received yet, but uses full month average

Transaction 2: Stock Adjustment on Jan 20 for 125 units
├─ Date: 2025-01-20 (January)
├─ Average Cost: $11.4778
├─ Calculation: 125 × $11.4778 = $1,434.73
└─ Note: Same average cost as Transaction 1

Transaction 3: Credit Note on Jan 29 for 90 units
├─ Date: 2025-01-29 (January)
├─ Average Cost: $11.4778
├─ Calculation: 90 × $11.4778 = $1,033.00
└─ Note: All January transactions use same cost
```

**Key Insight**: All transactions in January use **$11.4778** regardless of:
- When the transaction occurred in the month
- Which GRNs had been received at transaction time
- The sequence of receipts

## Cache Management Strategy

### Cache Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Period Cost Cache                        │
└─────────────────────────────────────────────────────────────┘
           │                           │
           │                           │
    ┌──────▼──────┐           ┌───────▼───────┐
    │  Created    │           │  Invalidated  │
    │             │           │               │
    │ - Month-end │           │ - New receipt │
    │ - First use │           │ - Late GRN    │
    │ - Manual    │           │ - Manual      │
    └─────────────┘           └───────────────┘
```

### When to Cache

✅ **Auto-create cache**:
1. First transaction in a period (calculate on-demand)
2. Month-end processing (batch calculation for all items)
3. Manual refresh requested by user

✅ **Cache Strategy**:
- **Write-through**: Calculate and cache immediately when needed
- **Lazy Loading**: Don't pre-calculate unless needed
- **Month-end Batch**: Optionally pre-calculate all items for closed months

### When to Invalidate Cache

❌ **Invalidate and recalculate when**:
1. New GRN posted to the period
2. Existing GRN edited (quantity or cost changed)
3. GRN deleted from the period
4. User explicitly requests recalculation

```typescript
async function invalidateCache(
  itemId: string,
  period: Date,
  reason: string
): Promise<void> {
  // Log the invalidation
  await auditLog({
    action: 'CACHE_INVALIDATED',
    itemId,
    period,
    reason,
    timestamp: new Date()
  })

  // Delete cache entry
  await db.delete('period_cost_cache', { itemId, period })

  // Optionally: Recalculate immediately or wait for next request
  // await recalculatePeriodCost(itemId, period)
}
```

### Cache Hit vs Miss

**Cache Hit** (optimal path):
```typescript
async function getCachedCost(
  itemId: string,
  transactionDate: Date
): Promise<number | null> {
  const period = getPeriodStart(transactionDate)

  const cached = await db.findOne('period_cost_cache', {
    itemId,
    period
  })

  return cached ? cached.averageCost : null
}
```

**Cache Miss** (fallback):
```typescript
async function handleCacheMiss(
  itemId: string,
  transactionDate: Date
): Promise<number> {
  // Calculate on-the-fly
  const { start, end } = getPeriodBoundaries(transactionDate)
  const receipts = await getReceiptsForPeriod(itemId, start, end)
  const averageCost = calculatePeriodAverageCost(receipts)

  // Cache for future use
  await cachePeriodCost(itemId, start, receipts, averageCost)

  return averageCost
}
```

## Fallback Scenarios

### No Receipts in Period

**Problem**: Transaction date is in a period with no GRN receipts

**Solutions** (in order of preference):

1. **Use Previous Period's Average**
```typescript
async function getPreviousPeriodCost(
  itemId: string,
  currentPeriod: Date
): Promise<number | null> {
  // Go back up to 12 months looking for a period with receipts
  for (let i = 1; i <= 12; i++) {
    const previousPeriod = subMonths(currentPeriod, i)
    const cost = await getCachedCost(itemId, previousPeriod)

    if (cost !== null) {
      return cost
    }
  }

  return null
}
```

2. **Use Standard Cost** (if configured)
```typescript
async function getStandardCost(itemId: string): Promise<number | null> {
  const item = await db.findById('inventory_items', itemId)
  return item.standardCost || null
}
```

3. **Use Latest Purchase Price**
```typescript
async function getLatestPurchasePrice(itemId: string): Promise<number | null> {
  const latestGRN = await db.query(`
    SELECT unit_cost
    FROM grn_items
    WHERE item_id = ?
    ORDER BY receipt_date DESC
    LIMIT 1
  `, [itemId])

  return latestGRN ? latestGRN.unit_cost : null
}
```

4. **Error** (if none available)
```typescript
throw new Error(`
  Cannot determine cost for item ${itemId}.
  No receipts in period, no historical cost, and no standard cost configured.
`)
```

### Backdated Receipts

**Problem**: A GRN is posted to a prior period after month-end

**Impact**: Invalidates the cached cost for that period

**Solution**:
```typescript
async function handleBackdatedReceipt(
  itemId: string,
  receiptDate: Date,
  grnData: GRNItem
): Promise<void> {
  // 1. Determine affected period
  const period = getPeriodStart(receiptDate)

  // 2. Invalidate cache
  await invalidateCache(itemId, period, 'Backdated receipt posted')

  // 3. Recalculate period cost
  const { start, end } = getPeriodBoundaries(receiptDate)
  const receipts = await getReceiptsForPeriod(itemId, start, end)
  const newAverage = calculatePeriodAverageCost(receipts)
  await cachePeriodCost(itemId, period, receipts, newAverage)

  // 4. Alert user if there were transactions in that period
  const transactionCount = await countTransactionsInPeriod(itemId, period)
  if (transactionCount > 0) {
    await notification.warn({
      title: 'Backdated Receipt Impact',
      message: `Backdated GRN changed average cost for ${period}. ${transactionCount} transactions affected.`,
      severity: 'MEDIUM'
    })
  }
}
```

## Performance Optimization

### Caching Strategy

**Optimization 1**: Month-End Batch Processing
```typescript
async function batchCalculateMonthEnd(month: Date): Promise<void> {
  // Get all items with activity in the month
  const activeItems = await getActiveItems(month)

  // Calculate in parallel (chunked)
  const chunks = chunk(activeItems, 100) // Process 100 items at a time

  for (const itemChunk of chunks) {
    await Promise.all(
      itemChunk.map(item =>
        calculateAndCachePeriodCost(item.id, month)
      )
    )
  }
}
```

**Optimization 2**: Index Strategy
```sql
-- Efficient period lookup
CREATE INDEX idx_period_cost_cache_item_period
ON period_cost_cache(item_id, period);

-- Efficient receipt queries
CREATE INDEX idx_grn_items_item_date
ON grn_items(item_id, receipt_date);
```

**Optimization 3**: In-Memory Cache (Optional)
```typescript
// Redis or application-level cache for frequently accessed periods
const cache = new Map<string, number>() // key: `${itemId}-${period}`, value: cost

async function getCostWithMemoryCache(
  itemId: string,
  period: Date
): Promise<number> {
  const cacheKey = `${itemId}-${period.toISOString()}`

  // Check memory cache first
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  // Check database cache
  const dbCost = await getCachedCost(itemId, period)
  if (dbCost) {
    cache.set(cacheKey, dbCost)
    return dbCost
  }

  // Calculate and cache
  const calculated = await handleCacheMiss(itemId, period)
  cache.set(cacheKey, calculated)
  return calculated
}
```

## Business Rules Summary

| Rule | Specification |
|------|---------------|
| **Period Type** | Calendar month only |
| **Calculation Time** | On-demand or month-end batch |
| **Cost Precision** | 5 decimal places (DECIMAL(20,5) in schema) |
| **Rounding** | Only on final totals, not intermediate |
| **Cache Duration** | Until invalidated by new receipt (application-level cache) |
| **Cache Implementation** | No dedicated table in schema - use Redis or application cache |
| **Fallback Order** | 1. Previous period, 2. Standard cost, 3. Latest price, 4. Error |
| **Backdated Impact** | Recalculate period, notify if transactions exist |
| **Transaction Timing** | All use same cost regardless of time in month |
| **Multi-Currency** | Calculate in receipt currency, convert at transaction time |

## Error Handling

### Common Errors

```typescript
enum PeriodicAverageError {
  NO_RECEIPTS_FOUND = 'PERIODIC_AVG_NO_RECEIPTS',
  NO_FALLBACK_COST = 'PERIODIC_AVG_NO_FALLBACK',
  CACHE_WRITE_FAILED = 'PERIODIC_AVG_CACHE_FAILED',
  INVALID_PERIOD = 'PERIODIC_AVG_INVALID_PERIOD',
  DIVISION_BY_ZERO = 'PERIODIC_AVG_ZERO_QUANTITY'
}
```

### Error Response Example

```typescript
interface PeriodicAverageErrorResponse {
  code: PeriodicAverageError
  message: string
  itemId: string
  period: Date
  suggestions: string[]
}
```

## Testing Checklist

- [ ] Single receipt in period
- [ ] Multiple receipts in period
- [ ] No receipts in period (fallback scenarios)
- [ ] Cache hit scenario
- [ ] Cache miss scenario
- [ ] Cache invalidation (new receipt)
- [ ] Backdated receipt handling
- [ ] Month boundary transactions (Dec 31 vs Jan 1)
- [ ] Same-day multiple receipts
- [ ] Zero-cost receipt handling
- [ ] Negative quantity handling
- [ ] Performance with 1000+ items
- [ ] Concurrent transaction handling

---

**Version**: 1.1
**Last Updated**: 2025-11-03
**Maintained By**: Architecture Team

---

## Document Revision Notes

**✅ Schema Alignment Completed** (2025-11-03)

This document has been updated to accurately reflect the **actual Prisma database schema** defined in `/app/data-struc/schema.prisma`.

**Key Updates**:
- Costing method enum clarified: Database uses `AVG` (display as "Periodic Average")
- Updated cost precision from 4 to 5 decimal places (DECIMAL(20,5))
- Clarified that `period_cost_cache` table does not exist in current schema
- Documented on-demand calculation from `tb_inventory_transaction_detail` (schema.prisma:587-613)
- Recommended application-level caching (Redis or memory) instead of database table
- Updated all code examples to use `AVG` enum value
- Added schema references throughout document with line number citations
