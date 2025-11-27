# Shared Method: Period Management

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Version**: 2.0.0 (Future Enhancement Specification)
**Status**: ⚠️ **PLANNED - NOT YET IMPLEMENTED**
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: 2025-11-03

---

## ⚠️ CRITICAL NOTICE: Future Enhancement Document

**This document describes a PLANNED feature set that is NOT yet implemented.**

### Current Implementation Status

❌ **The following features described in this document DO NOT exist in the current schema**:
- `tb_period` table for period management
- `enum_period_status` enum (OPEN, CLOSED, LOCKED)
- Period lifecycle management (OPEN → CLOSED → LOCKED)
- Period close process with authorization controls
- Period re-open functionality
- Period lock functionality (permanent closure)
- Transaction validation against period status
- Period-based financial reporting cutoffs

✅ **What DOES exist in current schema**:
- Transaction timestamps via `created_at` fields
- No period-based controls on transaction posting
- No period status lifecycle
- All transactions are immediately posted without period restrictions
- Reporting is transaction-based, not period-based

### Implementation Roadmap

This document describes **Phase 4: Period Management Implementation** from `SCHEMA-ALIGNMENT.md`.

**Prerequisites**: Schema changes in Phase 1-3 must be completed first.

**For current transaction-based approach, see**: `SM-costing-methods.md` v2.0.0

**For implementation roadmap, see**: `SCHEMA-ALIGNMENT.md` Phases 1-5

---

<div style="color: #FFD700;">

## Purpose

This document provides comprehensive specifications for **period management** in the Carmen ERP system, including period lifecycle, status transitions, authorization controls, and operational workflows for monthly inventory valuation and financial reporting.

## Overview

### What is Period Management?

Period management controls the **inventory accounting periods** (calendar months) through which transactions flow. It ensures:

- **Data Integrity**: Transactions posted to correct accounting periods
- **Financial Control**: Period closing prevents retroactive changes
- **Audit Compliance**: Complete audit trail of period status changes
- **Reporting Accuracy**: Financial reports based on properly closed periods

### Core Concepts

**Accounting Period**: A calendar month during which inventory transactions are recorded and eventually frozen for financial reporting.

**Period Status Lifecycle**:
```
OPEN → CLOSED → LOCKED
  ↑        ↓
  └────────┘
  (Re-open)
```

**Period Cutoff**: The date/time after which no transactions can be posted to a period (enforced when status = CLOSED or LOCKED).

## Period Data Structure

### Period Entity

| Property | Data Type | Description | Example |
|----------|-----------|-------------|---------|
| `period_id` | VARCHAR(7) | Unique period identifier (YY-MM) | `25-01` |
| `period_name` | VARCHAR(50) | Display name | `January 2025` |
| `fiscal_year` | INTEGER | Fiscal year | `2025` |
| `fiscal_month` | INTEGER | Month within fiscal year | `1` |
| `start_date` | DATE | Period start (1st day, 00:00:00) | `2025-01-01` |
| `end_date` | DATE | Period end (last day, 23:59:59) | `2025-01-31` |
| `status` | ENUM | Current status | `OPEN`, `CLOSED`, `LOCKED` |
| `created_at` | TIMESTAMP | Period creation timestamp | `2025-01-01 00:00:00` |
| `created_by` | VARCHAR(50) | User who created period | `USER-001` |
| `closed_at` | TIMESTAMP | Period close timestamp | `2025-02-01 14:30:00` |
| `closed_by` | VARCHAR(50) | User who closed period | `USER-002` |
| `reopened_at` | TIMESTAMP | Last re-open timestamp | `2025-02-05 10:15:00` |
| `reopened_by` | VARCHAR(50) | User who re-opened period | `USER-002` |
| `reopen_reason` | TEXT | Reason for re-opening | `Missed GRN transaction...` |
| `reopen_count` | INTEGER | Number of times re-opened | `1` |
| `locked_at` | TIMESTAMP | Period lock timestamp | `2025-03-01 00:00:00` |
| `locked_by` | VARCHAR(50) | User who locked period | `USER-003` |
| `snapshot_id` | VARCHAR(50) | Current snapshot reference | `SNAP-25-01-FINAL` |

### Period Status Enum

| Status | Code | Description | Transactions Allowed? |
|--------|------|-------------|-----------------------|
| **OPEN** | `OPEN` | Active period accepting transactions | ✅ Yes |
| **CLOSED** | `CLOSED` | Period closed, snapshot created | ❌ No |
| **LOCKED** | `LOCKED` | Permanent closure, no re-opening | ❌ No |

## Period Lifecycle

### Status Transition Diagram

```
┌─────────┐
│  OPEN   │  ← Initial state when period created
└────┬────┘
     │
     │ Close Period (create snapshot)
     ↓
┌─────────┐
│ CLOSED  │  ← Period closed, can be re-opened
└────┬────┘
     │ ↑
     │ │ Re-open
     │ └──────────────────────
     │
     │ Lock Period (permanent)
     ↓
┌─────────┐
│ LOCKED  │  ← Permanent closure, no changes
└─────────┘
```

### State Transition Rules

| Current Status | Target Status | Allowed? | Authorization Required | Conditions |
|---------------|---------------|----------|------------------------|------------|
| **OPEN** | CLOSED | ✅ Yes | financial-manager | All transactions posted |
| **CLOSED** | OPEN | ✅ Yes | financial-manager | Most recent closed period only |
| **CLOSED** | LOCKED | ✅ Yes | financial-manager | Next period closed |
| **OPEN** | LOCKED | ❌ No | N/A | Must close first |
| **LOCKED** | Any | ❌ No | N/A | Permanent state |

## Period Creation

### Automatic Period Creation

**Trigger**: System automatically creates new periods:
1. On first application setup (current month)
2. When transaction date is in non-existent period
3. Via scheduled job (create next month on 25th of current month)

**Algorithm**:
```typescript
async function createPeriod(date: Date): Promise<Period> {

  const periodId = format(date, 'yy-MM')  // Format: YY-MM (e.g., "25-01")
  const periodName = format(date, 'MMMM yyyy')
  const fiscalYear = getYear(date)
  const fiscalMonth = getMonth(date) + 1

  // Calculate period boundaries
  const startDate = startOfMonth(date)
  const endDate = endOfMonth(date)

  // Create period record
  const period = await db.insert('tb_periods', {
    period_id: periodId,
    period_name: periodName,
    fiscal_year: fiscalYear,
    fiscal_month: fiscalMonth,
    start_date: startDate,
    end_date: endDate,
    status: 'OPEN',
    created_at: new Date(),
    created_by: 'SYSTEM',
    reopen_count: 0
  })

  // Log creation
  await logAudit({
    action: 'PERIOD_CREATED',
    period_id: periodId,
    user_id: 'SYSTEM',
    timestamp: new Date()
  })

  return period
}
```

### Manual Period Creation

**Use Case**: Create future periods for planning or backdated periods for historical data entry

**Requirements**:
- system-admin role required
- Period must not overlap with existing periods
- Reason must be provided for backdated periods

**Process**:
1. User selects month/year to create
2. System validates no overlap with existing periods
3. User provides reason (if backdated)
4. System creates period with status = OPEN
5. System logs creation in audit trail

## Period Closing Process

### Pre-Close Checklist

Before closing a period, verify:

1. **All Transactions Posted**: No DRAFT transactions remaining for the period
2. **Reconciliation Complete**: Inventory counts reconciled with system
3. **Prior Period Closed**: Previous period already closed (sequential closing)
4. **Data Validation**: No data integrity issues

**Validation Query**:
```sql
-- Check for draft transactions in period
SELECT COUNT(*) as draft_count
FROM tb_inventory_transactions
WHERE transaction_date BETWEEN :period_start AND :period_end
  AND status = 'DRAFT'

-- Check for unreconciled counts
SELECT COUNT(*) as unreconciled_count
FROM tb_inventory_counts
WHERE count_date BETWEEN :period_start AND :period_end
  AND status != 'RECONCILED'

-- Check prior period status
SELECT status
FROM tb_periods
WHERE period_id = :prior_period_id
```

### Close Period Workflow

**Step 1: Initiate Close**
```typescript
async function initiatePeriodClose(
  periodId: string,
  userId: string
): Promise<CloseInitiation> {

  // Validate authorization
  const user = await getUserRole(userId)
  if (!['financial-manager', 'system-admin'].includes(user.role)) {
    throw new UnauthorizedError('Only financial managers can close periods')
  }

  // Validate period is open
  const period = await getPeriod(periodId)
  if (period.status !== 'OPEN') {
    throw new InvalidStateError(`Period ${periodId} is already ${period.status}`)
  }

  // Validate prior period closed (sequential closing)
  const priorPeriodId = getPriorPeriod(periodId)
  const priorPeriod = await getPeriod(priorPeriodId)
  if (priorPeriod && priorPeriod.status === 'OPEN') {
    throw new InvalidStateError('Prior period must be closed first')
  }

  // Run pre-close validation
  const validation = await validatePeriodForClose(periodId)
  if (!validation.passed) {
    return {
      canClose: false,
      validationErrors: validation.errors
    }
  }

  return {
    canClose: true,
    periodSummary: await getPeriodSummary(periodId)
  }
}
```

**Step 2: Create Snapshots**

See [SM-period-end-snapshots.md](./SM-period-end-snapshots.md) for detailed snapshot creation process.

**Summary**:
1. Create lot-level snapshots (FIFO method)
2. Create aggregate snapshots (Periodic Average method)
3. Validate snapshot integrity
4. Finalize snapshots

**Step 3: Update Period Status**
```sql
UPDATE tb_periods
SET
  status = 'CLOSED',
  closed_at = CURRENT_TIMESTAMP,
  closed_by = :user_id,
  snapshot_id = :snapshot_id
WHERE period_id = :period_id
```

**Step 4: Generate Period Close Reports**

Automatically generate:
- Inventory valuation summary
- Cost of goods sold (COGS) calculation
- Period movement report
- Variance analysis
- Financial statement preparation data

**Step 5: Notify Stakeholders**

Send notifications to:
- Finance team (period closed, reports available)
- Operations team (no more transactions for this period)
- Audit team (period ready for review)

### Post-Close Actions

After successful close:

1. **Archive Draft Transactions**: Move or flag draft transactions from closed period
2. **Update GL**: Post inventory valuation journal entries to general ledger
3. **Lock Editing**: Prevent editing of closed period transactions
4. **Generate Reports**: Make period-end reports available
5. **Prepare Next Period**: Ensure next period exists and is open

## Period Re-Opening Process

### Authorization and Requirements (BR-PERIOD-011, BR-PERIOD-012)

**Who Can Re-open**:
- financial-manager role
- system-admin role

**Requirements**:
- Only most recent closed period can be re-opened
- Must provide detailed reason (minimum 50 characters)
- Next period must not be locked

### Re-Open Period Workflow

**Step 1: Request Re-Opening**
```typescript
async function requestPeriodReopen(
  periodId: string,
  userId: string,
  reason: string
): Promise<ReopenRequest> {

  // Validate authorization
  const user = await getUserRole(userId)
  if (!['financial-manager', 'system-admin'].includes(user.role)) {
    throw new UnauthorizedError('Insufficient permissions')
  }

  // Validate period is most recent closed
  const mostRecentClosed = await getMostRecentClosedPeriod()
  if (periodId !== mostRecentClosed.period_id) {
    throw new InvalidStateError('Only most recent closed period can be re-opened')
  }

  // Validate reason length
  if (reason.length < 50) {
    throw new ValidationError('Reason must be at least 50 characters')
  }

  // Execute re-open
  return await executePeriodReopen(periodId, userId, reason)
}
```

**Step 2: Execute Re-Opening**
```typescript
async function executePeriodReopen(
  periodId: string,
  userId: string,
  reason: string
): Promise<ReopenResult> {

  // Mark existing snapshot as superseded (preserve for audit)
  await db.update('tb_period_snapshots', {
    status: 'SUPERSEDED',
    superseded_at: new Date(),
    superseded_by: userId
  }, {
    period_id: periodId,
    status: 'FINALIZED'
  })

  // Update period status to OPEN
  await db.update('tb_periods', {
    status: 'OPEN',
    reopened_at: new Date(),
    reopened_by: userId,
    reopen_reason: reason,
    reopen_count: db.raw('reopen_count + 1')
  }, {
    period_id: periodId
  })

  // Log re-open action
  await logAudit({
    action: 'PERIOD_REOPENED',
    period_id: periodId,
    user_id: userId,
    reason: reason,
    timestamp: new Date()
  })

  // Notify stakeholders
  await notifyStakeholders({
    type: 'PERIOD_REOPENED',
    period_id: periodId,
    reason: reason
  })

  return {
    success: true,
    period_id: periodId,
    new_status: 'OPEN'
  }
}
```

**Step 3: Post Corrective Transactions**

Users can now:
- Post additional transactions to re-opened period
- Correct errors in existing transactions
- Add missed transactions

**Important**: Transactions must use original period date range.

**Step 4: Re-Close Period**

When corrections complete:
1. User initiates close again
2. System creates new snapshot
3. New snapshot marked as `FINALIZED`
4. Period status returns to `CLOSED`
5. Opening balance for next period updated from new snapshot

### Re-Open Limitations

**Hard Limits**:
- Maximum 5 re-opens per period (configurable)
- Cannot re-open if next period is locked
- Cannot re-open periods older than 6 months (configurable)

**Best Practice**: Minimize re-opens to <5% of all periods.

## Period Locking Process

### When to Lock a Period

Lock a period when:
1. Next period successfully closed
2. Financial statements finalized
3. External audit complete (if applicable)
4. Sufficient time passed (e.g., 3 months)
5. Year-end close complete (for last period of fiscal year)

### Lock Period Workflow

**Step 1: Validate Lock Conditions**
```typescript
async function validatePeriodLock(
  periodId: string,
  userId: string
): Promise<LockValidation> {

  // Check authorization
  const user = await getUserRole(userId)
  if (!['financial-manager', 'system-admin'].includes(user.role)) {
    throw new UnauthorizedError('Insufficient permissions')
  }

  // Period must be closed
  const period = await getPeriod(periodId)
  if (period.status !== 'CLOSED') {
    throw new InvalidStateError('Period must be closed before locking')
  }

  // Next period must be closed
  const nextPeriodId = getNextPeriod(periodId)
  const nextPeriod = await getPeriod(nextPeriodId)
  if (!nextPeriod || nextPeriod.status !== 'CLOSED') {
    throw new InvalidStateError('Next period must be closed before locking')
  }

  return { canLock: true }
}
```

**Step 2: Execute Lock**
```sql
UPDATE tb_periods
SET
  status = 'LOCKED',
  locked_at = CURRENT_TIMESTAMP,
  locked_by = :user_id
WHERE period_id = :period_id
```

**Step 3: Finalize Snapshots**
```sql
-- Mark snapshots as permanently finalized
UPDATE tb_period_snapshots
SET status = 'LOCKED'
WHERE period_id = :period_id
```

**Step 4: Archive Data** (Optional)

For very old locked periods:
- Move detailed transaction records to archive tables
- Retain snapshots and summaries in active database
- Maintain referential integrity

## Transaction Posting Rules

### Period Status and Posting

| Period Status | Posting Allowed? | Restrictions |
|--------------|------------------|--------------|
| **OPEN** | ✅ Yes | Transaction date must be within period boundaries |
| **CLOSED** | ❌ No | All posting blocked |
| **LOCKED** | ❌ No | All posting blocked (permanent) |

### Date Range Validation

```typescript
async function validateTransactionPosting(
  transaction: Transaction
): Promise<ValidationResult> {

  // Get period for transaction date
  const periodId = format(transaction.transaction_date, 'yyyy-MM')
  const period = await getPeriod(periodId)

  // Period must exist
  if (!period) {
    // Auto-create if within allowed range
    if (isDateWithinAllowedRange(transaction.transaction_date)) {
      await createPeriod(transaction.transaction_date)
      return { valid: true }
    }
    throw new PeriodNotFoundError(`No period exists for ${periodId}`)
  }

  // Period must be open
  if (period.status !== 'OPEN') {
    throw new PeriodClosedError(
      `Cannot post to ${period.status} period ${periodId}`
    )
  }

  // Transaction date must be within period boundaries
  if (
    isBefore(transaction.transaction_date, period.start_date) ||
    isAfter(transaction.transaction_date, period.end_date)
  ) {
    throw new DateOutOfRangeError(
      `Transaction date must be within period ${periodId} (${period.start_date} to ${period.end_date})`
    )
  }

  return { valid: true }
}
```

### Cutoff Enforcement

**Strict Cutoff**: After period closes, NO backdated transactions allowed

**Benefits**:
- Data integrity maintained
- Financial statements accurate
- Audit trail complete

**User Experience**:
- Clear error message when attempting to post to closed period
- Suggestion to request period re-open if needed
- Alternative: Post to current period with reference to prior period

## Multi-Period Management

### Period Sequence

Periods must be managed sequentially:

1. **Sequential Creation**: Periods created in chronological order
2. **Sequential Closing**: Prior period must be closed before closing next
3. **No Gaps**: No missing periods between opened and closed periods

**Validation**:
```typescript
async function validatePeriodSequence(periodId: string): Promise<boolean> {

  const period = await getPeriod(periodId)
  const priorPeriodId = getPriorPeriod(periodId)
  const priorPeriod = await getPeriod(priorPeriodId)

  // Check prior period exists
  if (priorPeriodId && !priorPeriod) {
    throw new SequenceError(`Prior period ${priorPeriodId} does not exist`)
  }

  // Check prior period is not open (if closing current)
  if (priorPeriod && priorPeriod.status === 'OPEN' && period.status === 'CLOSED') {
    throw new SequenceError(`Prior period ${priorPeriodId} must be closed first`)
  }

  return true
}
```

### Period Query and Reporting

**Get Current Open Period**:
```sql
SELECT *
FROM tb_periods
WHERE status = 'OPEN'
ORDER BY period_id DESC
LIMIT 1
```

**Get All Open Periods**:
```sql
SELECT *
FROM tb_periods
WHERE status = 'OPEN'
ORDER BY period_id ASC
```

**Get Period Summary**:
```sql
SELECT
  p.period_id,
  p.period_name,
  p.status,
  COUNT(DISTINCT s.snapshot_id) as snapshot_count,
  SUM(s.closing_total_cost) as total_inventory_value,
  COUNT(DISTINCT t.transaction_id) as transaction_count
FROM tb_periods p
LEFT JOIN tb_period_snapshots s ON p.period_id = s.period_id AND s.status = 'FINALIZED'
LEFT JOIN tb_inventory_transactions t ON t.transaction_date BETWEEN p.start_date AND p.end_date
WHERE p.period_id = :period_id
GROUP BY p.period_id, p.period_name, p.status
```

### Fiscal Year Management

**Fiscal Year Definition**:
- Configurable start month (e.g., January, April, July)
- 12 consecutive periods per fiscal year
- Special handling for year-end close

**Year-End Close**:
1. Close all 12 periods of fiscal year
2. Lock all periods after external audit
3. Generate annual financial statements
4. Prepare opening balances for new fiscal year
5. Archive old fiscal year data (optional)

## Authorization and Permissions

### Role-Based Access Control

| Role | Create Period | Close Period | Re-Open Period | Lock Period | View Snapshots |
|------|---------------|--------------|----------------|-------------|----------------|
| **system-admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **financial-manager** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **purchasing-staff** | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Yes (limited) |
| **staff** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |

### Audit Trail Requirements

All period management actions must be logged:

```typescript
interface PeriodAuditLog {
  action: 'PERIOD_CREATED' | 'PERIOD_CLOSED' | 'PERIOD_REOPENED' | 'PERIOD_LOCKED'
  period_id: string
  user_id: string
  timestamp: Date
  reason?: string  // Required for re-open
  prior_status?: string
  new_status: string
  snapshot_id?: string
}
```

**Audit Query**:
```sql
SELECT
  action,
  period_id,
  user_id,
  timestamp,
  reason,
  prior_status,
  new_status
FROM tb_activity
WHERE entity_type = 'PERIOD'
  AND period_id = :period_id
ORDER BY timestamp DESC
```

## Performance Considerations

### Period Query Optimization

**Common Queries**:
1. Get current open period
2. Check if date is in open period
3. Get period summary
4. List recent periods

**Recommended Indexes**:
```sql
-- Primary index
CREATE UNIQUE INDEX idx_periods_pk ON tb_periods (period_id);

-- Status queries
CREATE INDEX idx_periods_status ON tb_periods (status, period_id);

-- Date range queries
CREATE INDEX idx_periods_dates ON tb_periods (start_date, end_date);

-- User action queries
CREATE INDEX idx_periods_user ON tb_periods (created_by, closed_by);
```

### Caching Strategy

**Cache Period Information**:
- Current open period (5-minute TTL)
- Period status (1-minute TTL)
- Period summaries (15-minute TTL)

**Cache Invalidation**:
- Invalidate on any period status change
- Invalidate on snapshot creation
- Invalidate on period re-open

## Error Handling

### Common Errors

| Error Code | Description | Resolution |
|-----------|-------------|------------|
| `PERIOD_NOT_FOUND` | Period does not exist | Create period first |
| `PERIOD_CLOSED` | Cannot post to closed period | Request period re-open |
| `PERIOD_LOCKED` | Period permanently locked | Post to current period instead |
| `PRIOR_PERIOD_OPEN` | Prior period must be closed first | Close periods sequentially |
| `UNAUTHORIZED_ACTION` | User lacks permission | Request authorization from manager |
| `INVALID_STATUS_TRANSITION` | Status transition not allowed | Follow proper workflow |
| `REOPEN_LIMIT_EXCEEDED` | Period re-opened too many times | Improve transaction processes |

### Error Recovery

**Period Close Failed**:
1. Rollback period status to OPEN
2. Delete incomplete snapshots
3. Log error details
4. Notify user and administrators
5. Allow retry after issue resolved

**Period Re-Open Failed**:
1. Maintain current CLOSED status
2. Log error details
3. Notify requesting user
4. Investigate and resolve issue

## Best Practices

### Period Management Guidelines

1. **Monthly Routine**:
   - Close period within 3 business days of month-end
   - Complete all reconciliations before closing
   - Review summary reports before finalizing

2. **Sequential Closing**:
   - Always close periods in chronological order
   - Never skip periods
   - Ensure no gaps in period history

3. **Minimize Re-Opens**:
   - Aim for <5% re-open rate
   - Implement pre-close checklists to catch issues early
   - Train users on proper transaction posting procedures

4. **Timely Locking**:
   - Lock periods after next period closed
   - Lock all periods after year-end audit
   - Maintain unlocked periods for reasonable time (3-6 months)

5. **Documentation**:
   - Document reasons for all re-opens (minimum 50 characters)
   - Maintain decision log for period closing
   - Keep audit trail accessible for 7+ years

### Operational Workflow

**Pre-Month-End** (Days 25-28):
- Remind users to complete transactions
- Run preliminary reports
- Identify and resolve issues

**Month-End** (Last day):
- Final transaction cutoff (e.g., 5 PM)
- Complete reconciliations
- Prepare for close

**Post-Month-End** (Days 1-3):
- Run period close process
- Review snapshots and reports
- Distribute reports to stakeholders

### Training and Communication

1. **User Training**:
   - Educate users on period cutoff dates
   - Explain impact of closed periods
   - Provide guidance on handling late transactions

2. **Stakeholder Communication**:
   - Announce period close schedule
   - Notify of period closings
   - Share reports and insights

3. **Process Improvement**:
   - Review re-open reasons monthly
   - Identify recurring issues
   - Implement process improvements

## Integration Points

### Module Integration

| Module | Integration Point | Period Check Required? |
|--------|------------------|----------------------|
| **Procurement** | GRN posting | ✅ Yes |
| **Inventory** | All transactions | ✅ Yes |
| **Store Operations** | Store requisitions | ✅ Yes |
| **Finance** | GL posting, reports | ✅ Yes |
| **Reporting** | Period-based reports | ✅ Yes |

### External System Integration

**General Ledger**:
- Post period-end journal entries when period closes
- Sync inventory valuation to GL
- Maintain period alignment between systems

**Business Intelligence**:
- Export period snapshots for analysis
- Provide period status for report filtering
- Enable period-over-period comparisons

## Testing Scenarios

### Unit Tests

1. **Period Creation**:
   - Create period with valid date
   - Prevent duplicate periods
   - Auto-calculate boundaries

2. **Status Transitions**:
   - OPEN → CLOSED (valid)
   - CLOSED → OPEN (valid with auth)
   - CLOSED → LOCKED (valid)
   - LOCKED → Any (invalid)

3. **Authorization**:
   - Financial manager can close
   - Staff cannot close
   - System admin has full access

### Integration Tests

1. **End-to-End Close**:
   - Create transactions in period
   - Close period
   - Verify snapshots created
   - Verify transactions blocked

2. **Re-Open Workflow**:
   - Close period
   - Re-open with reason
   - Post corrective transaction
   - Re-close period
   - Verify new snapshot

3. **Multi-Period**:
   - Create 3 consecutive periods
   - Close in sequence
   - Verify opening = prior closing
   - Lock oldest period

---

**Version**: 1.0.0
**Last Updated**: 2025-11-03
**Status**: Active
**Maintained By**: Architecture Team
**Review Cycle**: Quarterly

---

## Document Revision Notes

**Version 1.0.0** (2025-11-03):
- Initial creation of period management specification
- Comprehensive period lifecycle documentation
- Status transition rules and workflows
- Period creation, closing, re-opening, and locking processes
- Transaction posting rules and cutoff enforcement
- Multi-period management and fiscal year handling
- Authorization and audit trail requirements
- Performance optimization and error handling
- Best practices for operational workflows
- Integration points with other modules
- Testing scenarios for validation

</div>
