# VAL-INV: Inventory Valuation System Validation Rules

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Module**: Shared Methods
**Sub-Module**: Inventory Valuation
**Document Type**: Validations (VAL)
**Version**: 1.1.0
**Last Updated**: 2025-11-03
**Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-15 | System | Initial version |
| 1.1.0 | 2025-11-03 | System | Schema alignment - updated enum values and precision |

---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Inventory Valuation system, ensuring data integrity, business rule compliance, and security across the centralized inventory costing infrastructure. The validations cover:

- **Configuration Management**: Costing method settings and changes
- **Cost Calculation**: FIFO layer consumption and Periodic Average calculations
- **Cache Management**: Period cost cache integrity and lifecycle
- **Audit Requirements**: Immutable audit trail validation
- **Integration Points**: Validation at integration boundaries with other modules
- **Security Controls**: Permission-based access and data isolation

**Critical Validation Points**:
- Costing method changes require strict authorization and justification
- FIFO layer consumption must prevent negative inventory
- Periodic Average calculations must handle edge cases (no receipts, division by zero)
- Cache invalidation must maintain data consistency
- All significant events must be logged in immutable audit trail

### 1.2 Scope

This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation (Inventory Settings UI)
- **Server-Side**: Security and business rule enforcement (API layer and services)
- **Database**: Final data integrity constraints (PostgreSQL database)

### 1.3 Validation Strategy

```
User Input (Settings Change)
    ↓
[Client-Side Validation] ← Immediate feedback, UX, permission checks
    ↓
[Server-Side Validation] ← Security, business rules, audit enforcement
    ↓
[Database Constraints] ← Final enforcement, data integrity
    ↓
Data Stored (Audit-first pattern)
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Provide immediate user feedback when possible (Settings UI)
3. Use clear, actionable error messages
4. Prevent security vulnerabilities (SQL injection, XSS)
5. Enforce business rules consistently across all layers
6. Audit-first pattern: Create audit entry BEFORE making changes
7. Immutable audit trail: No UPDATE or DELETE on audit entries
8. Fail-safe defaults: Use FIFO if configuration cannot be determined

---

## 2. Configuration Field Validations (VAL-INV-001 to 099)

### VAL-INV-001: Costing Method - Required Field Validation

**Field**: `defaultCostingMethod`
**Database Column**: `inventory_settings.default_costing_method`
**Data Type**: VARCHAR(50) / TypeScript enum `CostingMethod`

**Validation Rule**: Costing method must be specified and cannot be null or empty.

**Implementation Requirements**:
- **Client-Side**: Radio button selection (FIFO or AVG). One option must always be selected.
- **Server-Side**: Reject request if method is missing, null, or empty string.
- **Database**: Column defined as `NOT NULL`.

**Error Code**: VAL-INV-001
**Error Message**: "Costing method is required"
**User Action**: User must select either FIFO or Periodic Average method.

**Test Cases**:
- ✅ Valid: `defaultCostingMethod = "FIFO"`
- ✅ Valid: `defaultCostingMethod = "AVG"`
- ❌ Invalid: `defaultCostingMethod = null`
- ❌ Invalid: `defaultCostingMethod = ""`
- ❌ Invalid: `defaultCostingMethod = undefined`

---

### VAL-INV-002: Costing Method - Enum Value Validation

**Field**: `defaultCostingMethod`

**Validation Rule**: Costing method must be one of the allowed enum values: "FIFO" or "AVG" only.

**Rationale**: System only supports these two methods as per BR-INV-001. Other methods (LIFO, WEIGHTED_AVERAGE, STANDARD_COST) are explicitly not supported.

**Implementation Requirements**:
- **Client-Side**: Radio button UI prevents invalid selections. Only two options available.
- **Server-Side**: Verify value is in allowed enum set. Reject any other values.
- **Database**: CHECK constraint: `default_costing_method IN ('FIFO', 'AVG')`.

**Error Code**: VAL-INV-002
**Error Message**: "Invalid costing method. Must be 'FIFO' or 'AVG'"
**User Action**: User must select one of the two allowed costing methods.

**Test Cases**:
- ✅ Valid: "FIFO"
- ✅ Valid: "AVG"
- ❌ Invalid: "LIFO" (not supported)
- ❌ Invalid: "WEIGHTED_AVERAGE" (not supported)
- ❌ Invalid: "STANDARD_COST" (not supported)
- ❌ Invalid: "fifo" (case-sensitive)
- ❌ Invalid: "periodic_average" (wrong format)

---

### VAL-INV-003: Justification - Required Field Validation

**Field**: `justification` (reason for costing method change)
**Database Column**: `valuation_audit_log.reason`
**Data Type**: VARCHAR(500) / string

**Validation Rule**: Justification text is mandatory when changing costing method and cannot be empty.

**Rationale**: Per BR-INV-002, all costing method changes must be justified for audit and compliance purposes.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to justification field. Show error immediately on blur if empty.
- **Server-Side**: Reject request if justification is missing, null, or contains only whitespace.
- **Database**: Audit log entry requires non-null reason field.

**Error Code**: VAL-INV-003
**Error Message**: "Justification is required for costing method changes"
**User Action**: User must provide a business justification for the change (minimum 20 characters).

**Test Cases**:
- ✅ Valid: "Switching to periodic average for better performance and reduced complexity"
- ❌ Invalid: `null`
- ❌ Invalid: "" (empty string)
- ❌ Invalid: "   " (only whitespace)

---

### VAL-INV-004: Justification - Minimum Length

**Field**: `justification`

**Validation Rule**: Justification text must contain at least 20 characters (excluding whitespace).

**Rationale**: Ensures meaningful business justification rather than placeholder text. Per BR-INV-002.

**Implementation Requirements**:
- **Client-Side**: Display character counter below field. Show warning when length < 20.
- **Server-Side**: Reject if trimmed length is less than 20 characters.
- **Database**: CHECK constraint on length.

**Error Code**: VAL-INV-004
**Error Message**: "Justification must be at least 20 characters"
**User Action**: User must provide more detailed justification for the change.

**Test Cases**:
- ✅ Valid: "Switching to periodic average for better performance" (length = 50)
- ✅ Valid: "Performance optimization" (length = 24)
- ❌ Invalid: "Better performance" (length = 19)
- ❌ Invalid: "test" (length = 4)
- ❌ Invalid: "                    " (whitespace doesn't count)

---

### VAL-INV-005: Justification - Maximum Length

**Field**: `justification`

**Validation Rule**: Justification text cannot exceed 500 characters.

**Rationale**: Database column limit and UI display constraints.

**Implementation Requirements**:
- **Client-Side**: Limit input to 500 characters using maxLength attribute. Show character count.
- **Server-Side**: Reject if length exceeds 500 characters.
- **Database**: Column defined as `VARCHAR(500)`.

**Error Code**: VAL-INV-005
**Error Message**: "Justification cannot exceed 500 characters"
**User Action**: User must shorten the justification text or summarize.

**Test Cases**:
- ✅ Valid: Text with exactly 500 characters
- ✅ Valid: Text with 250 characters
- ❌ Invalid: Text with 501 characters

---

### VAL-INV-006: Period Type - Immutable Value

**Field**: `periodType`
**Database Column**: `inventory_settings.period_type`
**Data Type**: VARCHAR(50)

**Validation Rule**: Period type must always be "CALENDAR_MONTH" and cannot be changed.

**Rationale**: System is designed for calendar month periods only. Per BR-INV-003.

**Implementation Requirements**:
- **Client-Side**: Display as read-only informational text. No input allowed.
- **Server-Side**: Reject any attempt to modify this field. Always set to 'CALENDAR_MONTH'.
- **Database**: DEFAULT value 'CALENDAR_MONTH', CHECK constraint enforces this value.

**Error Code**: VAL-INV-006
**Error Message**: "Period type cannot be changed (system uses calendar months)"
**User Action**: No action - this field is immutable.

**Test Cases**:
- ✅ Valid: `periodType = "CALENDAR_MONTH"` (auto-set)
- ❌ Invalid: Attempt to set `periodType = "FISCAL_MONTH"`
- ❌ Invalid: Attempt to set `periodType = "WEEK"`
- ❌ Invalid: Attempt to set `periodType = null`

---

## 3. Business Rule Validations (VAL-INV-101 to 199)

### VAL-INV-101: Permission Check for Configuration Change

**Rule Description**: Only users with 'financial-manager' or 'system-admin' role can change the costing method.

**Business Justification**: Costing method changes have significant financial and operational impact. Must be restricted to authorized personnel. Per BR-INV-001.

**Validation Logic**:
1. Extract user ID from authenticated session
2. Query user's roles
3. Check if user has 'financial-manager' OR 'system-admin' role
4. If neither role is present, reject the request

**When Validated**: Before allowing access to change functionality, before saving changes

**Implementation Requirements**:
- **Client-Side**:
  * Hide "Change Method" button if user lacks permission
  * Show read-only view of configuration
- **Server-Side**:
  * Verify user role before processing change request
  * Return 403 Forbidden if user lacks permission
- **Database**: Row Level Security (RLS) policies restrict UPDATE on inventory_settings table

**Error Code**: VAL-INV-101
**Error Message**: "You do not have permission to change the costing method. This action requires 'financial-manager' or 'system-admin' role."
**User Action**: User must request appropriate permissions from system administrator.

**Related Business Requirements**: BR-INV-001

**Examples**:

**Scenario 1: Valid Case - Financial Manager**
- User: John Doe
- Role: financial-manager
- Action: Change costing method
- Result: ✅ Validation passes
- Reason: User has required 'financial-manager' role

**Scenario 2: Valid Case - System Admin**
- User: Jane Smith
- Role: system-admin
- Action: Change costing method
- Result: ✅ Validation passes
- Reason: User has required 'system-admin' role

**Scenario 3: Invalid Case - Regular User**
- User: Bob Johnson
- Role: staff
- Action: Attempt to change costing method
- Result: ❌ Validation fails
- Reason: User has 'staff' role which is not authorized
- User must: Request permission from administrator or have financial manager make the change

---

### VAL-INV-102: Prevent Duplicate Configuration

**Rule Description**: Only one active inventory settings record can exist per company.

**Business Justification**: Ensures single source of truth for costing method. Prevents configuration conflicts. Per BR-INV-004.

**Validation Logic**:
1. Check if inventory_settings record exists for company
2. If creating new record and one already exists, reject
3. If updating, verify record being updated is the only record for company

**When Validated**: On create, on update operations

**Implementation Requirements**:
- **Client-Side**: Not applicable (system manages this)
- **Server-Side**:
  * Check for existing records before creating new
  * Prevent multiple records per company
- **Database**:
  * UNIQUE constraint on company_id
  * Only one record per company enforced at DB level

**Error Code**: VAL-INV-102
**Error Message**: "Inventory settings already exist for this company. Use update instead of create."
**User Action**: System should route to update operation automatically.

**Related Business Requirements**: BR-INV-004

**Examples**:

**Scenario 1: Valid Case - First Time Setup**
- Company: COMPANY-001
- Existing records: 0
- Action: Create settings with FIFO method
- Result: ✅ Validation passes
- Reason: No existing record for company

**Scenario 2: Valid Case - Updating Existing**
- Company: COMPANY-001
- Existing records: 1
- Action: Update method from FIFO to AVG
- Result: ✅ Validation passes
- Reason: Updating existing single record

**Scenario 3: Invalid Case - Duplicate Creation**
- Company: COMPANY-001
- Existing records: 1
- Action: Attempt to create second settings record
- Result: ❌ Validation fails
- Reason: Violates unique constraint (only one settings record per company)
- System must: Route to update operation instead

---

### VAL-INV-103: Audit-First Pattern Enforcement

**Rule Description**: Audit log entry must be created BEFORE the costing method configuration change is committed to the database.

**Business Justification**: Ensures complete audit trail even if change fails. Maintains data integrity and compliance. Per BR-INV-041.

**Validation Logic**:
1. Validate all inputs for configuration change
2. Create audit entry with BEFORE state
3. Commit audit entry to database
4. If audit creation fails, abort configuration change
5. Only if audit succeeds, proceed with configuration update
6. If configuration update fails, audit entry remains as record of attempt

**When Validated**: During costing method change transaction

**Implementation Requirements**:
- **Client-Side**: Not applicable
- **Server-Side**:
  * Use transaction: BEGIN → INSERT audit → UPDATE settings → COMMIT
  * If audit insert fails, rollback entire transaction
  * Audit entry creation is mandatory gate before configuration change
- **Database**:
  * Trigger on inventory_settings.UPDATE verifies audit entry exists
  * Foreign key to audit log ensures referential integrity

**Error Code**: VAL-INV-103
**Error Message**: "Cannot change configuration without creating audit entry. Please try again."
**User Action**: User should retry the operation. If error persists, contact system administrator.

**Workflow**:
```
1. User confirms change
2. System creates audit entry (event: COSTING_METHOD_CHANGED)
3. Audit entry saved: ✅
4. System updates inventory_settings
5. Settings updated: ✅
6. Transaction commits
```

**Failure Scenario**:
```
1. User confirms change
2. System attempts to create audit entry
3. Audit entry fails (DB error): ❌
4. Transaction rolls back
5. No changes made
6. User sees error message
```

**Related Business Requirements**: BR-INV-041

---

### VAL-INV-104: Historical Cost Immutability

**Rule Description**: Changing the costing method must NOT retroactively change historical inventory valuations. Historical costs remain unchanged.

**Business Justification**: Maintains financial integrity and audit compliance. Historical transactions are immutable. Per BR-INV-013.

**Validation Logic**:
1. When costing method changes, verify no historical data is being modified
2. Only new transactions (after change date) use new method
3. Existing credit notes, stock adjustments, reports retain their original costs
4. No recalculation of past valuations

**When Validated**: During costing method change, system verification

**Implementation Requirements**:
- **Client-Side**:
  * Show clear warning: "Historical costs will not be recalculated. New method applies to future transactions only."
  * Require user acknowledgment via checkbox
- **Server-Side**:
  * Verify no UPDATE statements modify historical cost data
  * Change applies forward-looking only
- **Database**:
  * No triggers that recalculate historical costs
  * Existing records remain unchanged

**Error Code**: VAL-INV-104
**Error Message**: "Historical cost modification detected. Changes must be forward-looking only."
**User Action**: System prevents this automatically. If error occurs, contact administrator.

**Verification**:
- Before change: Count of records with costs
- After change: Same count, same cost values for pre-change records
- Only new records use new costing method

**Related Business Requirements**: BR-INV-013

**Examples**:

**Scenario 1: Valid Case - Forward-Looking Only**
- Change date: 2025-01-15
- Existing credit note (2025-01-10): Cost = $100 (FIFO)
- After change to Periodic Average:
  * 2025-01-10 credit note: Still $100 (unchanged)
  * 2025-01-20 credit note: Uses Periodic Average
- Result: ✅ Validation passes
- Reason: Historical costs preserved, new method applies forward only

**Scenario 2: Invalid Case - Retroactive Recalculation**
- Change date: 2025-01-15
- System attempts to recalculate costs for 2025-01-10
- Result: ❌ Validation fails
- Reason: Violates immutability rule
- System must: Block retroactive changes, only apply forward

---

### VAL-INV-105: FIFO Layer Availability Check

**Rule Description**: When calculating FIFO cost, sufficient inventory layers must be available to satisfy the requested quantity.

**Business Justification**: Cannot consume more inventory than exists. Prevents negative inventory. Per BR-INV-021.

**Validation Logic**:
1. Query available FIFO layers for item (remaining_quantity > 0)
2. Sum all available quantities
3. Compare: available_quantity >= requested_quantity
4. If insufficient, reject the valuation request

**When Validated**: During FIFO cost calculation, before layer consumption

**Implementation Requirements**:
- **Client-Side**: Not applicable (server-side calculation)
- **Server-Side**:
  * Query FIFO layers: `WHERE remaining_quantity > 0`
  * Calculate total available
  * Throw error if insufficient
  * Provide detailed error message with available vs requested
- **Database**:
  * CHECK constraint: `remaining_quantity >= 0`
  * Cannot have negative remaining quantities

**Error Code**: VAL-INV-105
**Error Message**: "Insufficient FIFO layers for item {itemId}. Required: {requested}, Available: {available}"
**User Action**:
- Verify GRNs have been posted for this item
- Check if requested quantity is correct
- Contact inventory team if discrepancy exists

**Related Business Requirements**: BR-INV-021

**Examples**:

**Scenario 1: Valid Case - Sufficient Layers**
- Item: ITEM-123
- Requested quantity: 100 units
- Layer 1: 50 units available @ $10
- Layer 2: 60 units available @ $12
- Total available: 110 units
- Result: ✅ Validation passes
- Consumption: 50 from Layer 1, 50 from Layer 2

**Scenario 2: Invalid Case - Insufficient Layers**
- Item: ITEM-456
- Requested quantity: 100 units
- Layer 1: 30 units available @ $10
- Layer 2: 25 units available @ $12
- Total available: 55 units
- Result: ❌ Validation fails
- Reason: Shortfall of 45 units
- User must: Verify GRN posting, check quantity, investigate discrepancy

---

### VAL-INV-106: Periodic Average Receipt Validation

**Rule Description**: When calculating Periodic Average cost, at least one posted GRN must exist in the period, or fallback strategy must succeed.

**Business Justification**: Cannot calculate average from zero receipts. Must have data or use fallback. Per BR-INV-023, BR-INV-027.

**Validation Logic**:
1. Query GRNs for item in period (status = 'posted')
2. If receipts found, calculate average
3. If no receipts, attempt fallback strategies in order:
   - Strategy 1: Previous month cost
   - Strategy 2: Standard cost
   - Strategy 3: Latest purchase price
   - Strategy 4: 3-month moving average
4. If all fallbacks fail, reject valuation request

**When Validated**: During Periodic Average cost calculation

**Implementation Requirements**:
- **Client-Side**: Not applicable (server-side calculation)
- **Server-Side**:
  * Query: `SELECT COUNT(*) WHERE status='posted' AND period=?`
  * If count = 0, execute fallback logic
  * Log fallback usage with warnings
  * If all fallbacks fail, throw comprehensive error
- **Database**: Not enforced (business logic)

**Error Code**: VAL-INV-106
**Error Message**: "Cannot determine cost for item {itemId} in period {period}. No receipts found and all fallback strategies failed. Fallbacks attempted: 1) Previous month - not found, 2) Standard cost - not configured, 3) Latest purchase - none, 4) Moving average - insufficient data. Suggestion: Check GRN posting or configure standard cost."
**User Action**:
- Verify GRNs have been posted for this period
- Consider configuring standard cost for item
- Contact finance team for cost guidance

**Related Business Requirements**: BR-INV-023, BR-INV-027

**Examples**:

**Scenario 1: Valid Case - Receipts Found**
- Item: ITEM-123
- Period: 2025-01-01
- Query result: 3 posted GRNs
  * GRN-001: 50 units @ $10 = $500
  * GRN-002: 30 units @ $12 = $360
  * GRN-003: 20 units @ $11 = $220
- Total: 100 units, $1,080
- Average: $10.80
- Result: ✅ Validation passes

**Scenario 2: Valid Case - Fallback Success**
- Item: ITEM-456
- Period: 2025-02-01
- Query result: 0 posted GRNs in February
- Fallback 1 (Previous month): Found $25.50 from January cache
- Result: ✅ Validation passes with fallback
- Warning logged: "Using previous month cost for ITEM-456 in 2025-02"

**Scenario 3: Invalid Case - No Data, All Fallbacks Fail**
- Item: ITEM-789
- Period: 2025-03-01
- Query result: 0 posted GRNs
- Fallback 1 (Previous month): No cache entry
- Fallback 2 (Standard cost): Not configured
- Fallback 3 (Latest purchase): No prior GRNs
- Fallback 4 (Moving average): < 3 months of data
- Result: ❌ All validations fail
- User must: Post GRN or configure standard cost

---

### VAL-INV-107: Division by Zero Prevention

**Rule Description**: When calculating Periodic Average, total quantity must be greater than zero to prevent division by zero errors.

**Business Justification**: Mathematical constraint - cannot divide by zero. Ensures calculation integrity.

**Validation Logic**:
1. After querying receipts, sum quantities
2. Verify: `SUM(quantity) > 0`
3. If total quantity is zero or negative, reject calculation

**When Validated**: During Periodic Average calculation, before division operation

**Implementation Requirements**:
- **Client-Side**: Not applicable
- **Server-Side**:
  * Check `totalQuantity > 0` before `averageCost = totalCost / totalQuantity`
  * If zero or negative, throw error
- **Database**: Not enforced (business logic)

**Error Code**: VAL-INV-107
**Error Message**: "Cannot calculate average cost: total quantity is zero"
**User Action**: This indicates data corruption. Contact system administrator.

**Test Cases**:
- ✅ Valid: totalQuantity = 100, totalCost = 1000, averageCost = 10.00
- ✅ Valid: totalQuantity = 1, totalCost = 5, averageCost = 5.00
- ❌ Invalid: totalQuantity = 0, totalCost = 100 (division by zero)
- ❌ Invalid: totalQuantity = -10 (negative quantity, data corruption)

---

### VAL-INV-108: Cache Staleness Check

**Rule Description**: Cached period costs older than 1 hour must be recalculated rather than used directly.

**Business Justification**: Ensures cost calculations use fresh data. Balances performance with accuracy. Per BR-INV-026.

**Validation Logic**:
1. Query period cost cache for item and period
2. Check: `calculated_at >= (NOW() - 1 hour)`
3. If fresh (< 1 hour old), use cached value
4. If stale (>= 1 hour old), recalculate and update cache

**When Validated**: During Periodic Average lookup, before using cached cost

**Implementation Requirements**:
- **Client-Side**: Not applicable
- **Server-Side**:
  * Compare cache timestamp to current time
  * If stale, trigger recalculation
  * Update cache with new value and timestamp
- **Database**: Index on `calculated_at` for efficient staleness checks

**Error Code**: VAL-INV-108
**Error Message**: None (transparent to user, system handles automatically)
**User Action**: None (system recalculates automatically)

**Cache Lifecycle**:
- Fresh: < 1 hour old → Use directly
- Stale: >= 1 hour old → Recalculate
- Expired: > 24 hours old → Recalculate or delete

**Related Business Requirements**: BR-INV-026

---

## 4. Cross-Field Validations (VAL-INV-201 to 299)

### VAL-INV-201: Method Change Confirmation Consistency

**Fields Involved**: `currentMethod`, `newMethod`, `userConfirmation`

**Validation Rule**: User must explicitly confirm they understand that changing the costing method:
1. Cannot be undone
2. Applies forward-looking only (historical costs unchanged)
3. Will notify stakeholders
4. Requires justification

**Business Justification**: Ensures user awareness of impact and consequences. Prevents accidental changes.

**Validation Logic**:
1. Display confirmation dialog showing old method → new method
2. Show all impact statements and warnings
3. Require user to check "I understand" checkbox
4. Require user to click "Confirm Change" button
5. If either action is not completed, prevent submission

**When Validated**: On costing method change submission

**Implementation Requirements**:
- **Client-Side**:
  * Show modal dialog with all warnings
  * Disable "Confirm" button until checkbox checked
  * On cancel, return to form without changes
- **Server-Side**:
  * Verify confirmation parameter is `true`
  * Reject if confirmation not provided
- **Database**: Not enforced (UI logic)

**Error Code**: VAL-INV-201
**Error Message**: "You must confirm you understand the implications before changing the costing method"
**User Action**: User must check the confirmation checkbox and click the confirm button.

**Examples**:

**Valid Scenario**:
- Current method: FIFO
- New method: AVG
- Justification: "Switching for better performance"
- Checkbox: ✅ Checked
- Confirmation button: Clicked
- Result: ✅ Passes validation

**Invalid Scenarios**:
- Checkbox not checked ❌ - "You must confirm"
- Confirmation not clicked ❌ - "You must confirm"

---

### VAL-INV-202: Audit Entry Completeness

**Fields Involved**: `eventType`, `oldValue`, `newValue`, `reason`, `userId`, `timestamp`

**Validation Rule**: All audit log entries for costing method changes must contain complete data with no null required fields.

**Business Justification**: Ensures audit trail completeness and traceability. Per BR-INV-019.

**Validation Logic**:
1. Verify all required fields are populated:
   - eventType = 'COSTING_METHOD_CHANGED'
   - oldValue (current method before change)
   - newValue (method after change)
   - reason (justification text, >= 20 chars)
   - userId (authenticated user)
   - timestamp (current date/time)
2. Optional but recommended fields:
   - ipAddress
   - sessionId
   - browser
3. Reject if any required field is null or empty

**When Validated**: During audit entry creation, before insert

**Implementation Requirements**:
- **Client-Side**: Not applicable (server generates audit entry)
- **Server-Side**:
  * Build complete audit object
  * Validate all required fields present
  * Throw error if any required field missing
- **Database**:
  * NOT NULL constraints on required columns
  * Validation trigger on INSERT

**Error Code**: VAL-INV-202
**Error Message**: "Cannot create audit entry: missing required field '{fieldName}'"
**User Action**: System should handle automatically. If error persists, contact administrator.

**Required Fields Checklist**:
- ✅ eventType
- ✅ oldValue
- ✅ newValue
- ✅ reason
- ✅ userId
- ✅ timestamp

**Test Cases**:
- ✅ Valid: All required fields populated
- ❌ Invalid: `reason = null` (missing justification)
- ❌ Invalid: `userId = null` (anonymous change not allowed)
- ❌ Invalid: `oldValue = null` (must capture before state)

---

### VAL-INV-203: FIFO Layer Consumption Integrity

**Fields Involved**: `layerId`, `quantityConsumed`, `unitCost`, `totalCost`

**Validation Rule**: For each FIFO layer consumed, the relationship `totalCost = quantityConsumed × unitCost` must hold true (within rounding tolerance of $0.01).

**Business Justification**: Ensures mathematical accuracy of FIFO calculations. Detects calculation errors.

**Validation Logic**:
1. For each layer consumption record:
   ```
   calculated = quantityConsumed × unitCost
   provided = totalCost
   difference = ABS(calculated - provided)
   valid = difference <= 0.01
   ```
2. If any layer fails validation, reject entire calculation

**When Validated**: After FIFO layer consumption, before returning result

**Implementation Requirements**:
- **Client-Side**: Not applicable
- **Server-Side**:
  * Validate each consumption record
  * Check mathematical relationship
  * Allow $0.01 tolerance for rounding
- **Database**: Not enforced (calculation logic)

**Error Code**: VAL-INV-203
**Error Message**: "FIFO calculation error: layer {layerId} total cost mismatch. Expected: {calculated}, Got: {provided}"
**User Action**: System should handle automatically. If error persists, contact administrator.

**Test Cases**:
- ✅ Valid: qty=10, unit=$5.00, total=$50.00 (exact)
- ✅ Valid: qty=10, unit=$5.33, total=$53.30 (exact)
- ✅ Valid: qty=10, unit=$5.333, total=$53.33 (rounded, within tolerance)
- ❌ Invalid: qty=10, unit=$5.00, total=$60.00 (difference = $10.00, exceeds tolerance)

---

## 5. Security Validations (VAL-INV-301 to 399)

### VAL-INV-301: Role-Based Access Control

**Validation Rule**: User must have the required role to perform inventory valuation operations.

**Checked Permissions**:
- **View Settings**:
  * Roles: financial-manager, system-admin, operations-manager (read-only)
  * Action: View current costing method and configuration
- **Change Settings**:
  * Roles: financial-manager, system-admin ONLY
  * Action: Change costing method
- **View Audit History**:
  * Roles: financial-manager, system-admin, auditor
  * Action: View audit trail of configuration changes
- **Export Audit**:
  * Roles: financial-manager, system-admin, auditor
  * Action: Export audit history to CSV

**When Validated**: Before every operation (view, change, audit access)

**Implementation Requirements**:
- **Client-Side**:
  * Hide/disable UI elements based on user role
  * Show read-only view if user can view but not edit
- **Server-Side**:
  * Always verify user role before processing request
  * Return 403 Forbidden if insufficient permissions
- **Database**:
  * Row Level Security (RLS) policies filter based on role
  * UPDATE/DELETE restricted to authorized roles

**Error Code**: VAL-INV-301
**Error Message**: "You do not have permission to {action}. Required role: {required_role}"
**User Action**: User must request appropriate permissions from administrator.

**Related Business Requirements**: BR-INV-001

**Permission Matrix**:

| Action | financial-manager | system-admin | operations-manager | staff |
|--------|------------------|--------------|-------------------|-------|
| View Settings | ✅ | ✅ | ✅ (read-only) | ❌ |
| Change Method | ✅ | ✅ | ❌ | ❌ |
| View Audit | ✅ | ✅ | ⚠️ (own changes) | ❌ |
| Export Audit | ✅ | ✅ | ❌ | ❌ |
| Request Valuation | ✅ | ✅ | ✅ | ✅ |

---

### VAL-INV-302: Company Data Isolation

**Validation Rule**: Users can only view and modify inventory settings for their own company. Cross-company access is prohibited.

**Business Justification**: Multi-tenant data isolation. Prevents unauthorized access to other companies' data. Per BR-INV-005.

**Validation Logic**:
1. Extract user's company ID from authenticated session
2. Extract company ID from requested settings record
3. Verify: `user.companyId === settings.companyId`
4. If mismatch, reject access

**When Validated**: On all settings read/write operations

**Implementation Requirements**:
- **Client-Side**:
  * Only show settings for user's company
  * No UI to access other companies
- **Server-Side**:
  * Always filter queries by user's company ID
  * Reject requests for different company IDs
- **Database**:
  * RLS policies: `company_id = current_user.company_id`
  * Automatic filtering at database level

**Error Code**: VAL-INV-302
**Error Message**: "You do not have access to settings for this company"
**User Action**: User can only access their own company's settings.

**Related Business Requirements**: BR-INV-005

**Test Cases**:
- ✅ Valid: User from COMPANY-001 accesses COMPANY-001 settings
- ❌ Invalid: User from COMPANY-001 attempts to access COMPANY-002 settings
- ❌ Invalid: User from COMPANY-001 attempts to modify COMPANY-002 settings

---

### VAL-INV-303: Audit Log Immutability

**Validation Rule**: Audit log entries are immutable. No UPDATE or DELETE operations are allowed on audit records.

**Business Justification**: Maintains audit trail integrity and compliance. Per BR-INV-019.

**Validation Logic**:
1. Block all UPDATE statements on valuation_audit_log table
2. Block all DELETE statements on valuation_audit_log table
3. Allow only INSERT operations
4. Retention policy handles old record archiving (not deletion)

**When Validated**: On all database operations against audit log table

**Implementation Requirements**:
- **Client-Side**: No edit or delete UI for audit entries
- **Server-Side**:
  * No code paths that UPDATE or DELETE audit entries
  * Only INSERT operations allowed
- **Database**:
  * BEFORE UPDATE trigger: RAISE EXCEPTION 'Audit entries are immutable'
  * BEFORE DELETE trigger: RAISE EXCEPTION 'Audit entries cannot be deleted'
  * Append-only table design

**Error Code**: VAL-INV-303
**Error Message**: "Audit log entries cannot be modified or deleted (immutable)"
**User Action**: Cannot modify audit entries. If correction needed, create new entry.

**Related Business Requirements**: BR-INV-019

**Database Triggers**:
```sql
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be modified';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_update_audit
    BEFORE UPDATE ON valuation_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER prevent_delete_audit
    BEFORE DELETE ON valuation_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();
```

---

### VAL-INV-304: Input Sanitization

**Validation Rule**: All text input (justification, reason fields) must be sanitized to prevent security vulnerabilities.

**Security Checks**:
- Remove HTML tags and scripts (XSS prevention)
- Escape special characters in database queries (SQL injection prevention)
- Validate input length to prevent buffer overflow
- Check for malicious patterns

**When Validated**: On all user input, before storing or displaying data

**Implementation Requirements**:
- **Client-Side**: Basic sanitization, mainly for UX
- **Server-Side**:
  * Comprehensive sanitization before database operations
  * Use parameterized queries (prevent SQL injection)
  * Strip HTML tags from text fields
  * Validate against whitelist of allowed characters
- **Database**: Use parameterized queries, never concatenate user input

**Error Code**: VAL-INV-304
**Error Message**: "Input contains invalid or potentially harmful content"
**User Action**: User must remove the problematic content and resubmit.

**Forbidden Content**:
- `<script>` tags
- `<iframe>` tags
- `javascript:` URLs
- SQL keywords in unexpected contexts (DROP, DELETE, TRUNCATE)
- Extremely long strings (> 500 chars for justification)

**Test Cases**:
- ✅ Valid: "Switching to periodic average for better performance"
- ✅ Valid: "Cost reduction & improved accuracy"
- ❌ Invalid: "Test <script>alert('XSS')</script>"
- ❌ Invalid: "'; DROP TABLE inventory_settings; --"
- ❌ Invalid: Input with 10,000 characters

---

### VAL-INV-305: Session Validation

**Validation Rule**: User must have valid, non-expired session to perform configuration changes.

**Business Justification**: Prevents unauthorized access via stolen or expired sessions.

**Validation Logic**:
1. Verify session token exists
2. Verify session has not expired
3. Verify session belongs to authenticated user
4. Verify user is still active (not disabled)

**When Validated**: Before every configuration change operation

**Implementation Requirements**:
- **Client-Side**:
  * Redirect to login if session expired
  * Show session timeout warning
- **Server-Side**:
  * Validate session on every request
  * Check session expiration timestamp
  * Verify user account status
- **Database**: Session storage with expiration tracking

**Error Code**: VAL-INV-305
**Error Message**: "Your session has expired. Please log in again."
**User Action**: User must log in again to continue.

---

## 6. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong and which field
2. **Be Actionable**: Explain how to fix the problem
3. **Be Kind**: Use friendly, professional tone
4. **Be Consistent**: Use same format and tone throughout
5. **Avoid Technical Jargon**: Use plain business language
6. **Provide Context**: Explain why the validation exists

### Error Message Format

**Structure**:
```
[Field/Rule Name] {problem statement}. {Expected format or action}. {Why this matters (optional)}.
```

**Examples**:

✅ **Good Messages**:
- "Costing method is required. Please select either FIFO or Periodic Average."
- "Justification must be at least 20 characters. Please provide more details about why this change is needed."
- "You do not have permission to change the costing method. This action requires 'financial-manager' or 'system-admin' role. Please contact your system administrator."
- "Insufficient FIFO layers for item ITEM-123. Required: 100 units, Available: 55 units. Please verify GRN posting is complete."

❌ **Bad Messages**:
- "Error" (too vague)
- "Invalid" (not specific)
- "Validation failed" (not actionable)
- "CHECK constraint violation" (too technical)
- "You can't do that" (unfriendly)

### Error Severity Levels

| Level | When to Use | Display | Example |
|-------|-------------|---------|---------|
| Error | Blocks submission/progress | Red icon, red border, red text | "Costing method is required" |
| Warning | Should be corrected but not blocking | Yellow icon, yellow border | "Cache is stale, recalculating..." |
| Info | Helpful guidance | Blue icon, normal border | "Historical costs will not change" |

### Error Message Examples by Category

**Field Validation Errors**:
- VAL-INV-001: "Costing method is required"
- VAL-INV-002: "Invalid costing method. Must be 'FIFO' or 'AVG'"
- VAL-INV-003: "Justification is required for costing method changes"
- VAL-INV-004: "Justification must be at least 20 characters"
- VAL-INV-005: "Justification cannot exceed 500 characters"

**Business Rule Errors**:
- VAL-INV-101: "You do not have permission to change the costing method. This action requires 'financial-manager' or 'system-admin' role."
- VAL-INV-105: "Insufficient FIFO layers for item {itemId}. Required: {requested}, Available: {available}. Please verify GRN posting."
- VAL-INV-106: "Cannot determine cost for item {itemId} in period {period}. No receipts found and all fallback strategies failed. Please check GRN posting or configure standard cost."

**Security Errors**:
- VAL-INV-301: "You do not have permission to {action}. Required role: {required_role}"
- VAL-INV-302: "You do not have access to settings for this company"
- VAL-INV-303: "Audit log entries cannot be modified or deleted (immutable)"
- VAL-INV-305: "Your session has expired. Please log in again."

---

## 7. Test Scenarios

### Test Coverage Requirements

All validation rules must have test cases covering:
1. **Positive Tests**: Valid input that should pass validation
2. **Negative Tests**: Invalid input that should fail validation
3. **Boundary Tests**: Edge cases at limits of acceptable values
4. **Integration Tests**: Validation working across all layers (client, server, database)
5. **Security Tests**: Permission checks and data isolation

### Test Scenario Template

**Test ID**: VAL-INV-T{###}

**Test Description**: {What is being tested}

**Test Type**: Positive | Negative | Boundary | Integration | Security

**Preconditions**: {What must be true before test}

**Test Steps**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Input Data**: {What data is provided}

**Expected Result**: {What should happen}

**Validation Layer**: Client | Server | Database | All

**Pass/Fail Criteria**: {How to determine if test passed}

---

### Example Test Scenarios

#### Positive Test: Valid Costing Method Change

**Test ID**: VAL-INV-T001

**Test Description**: Change costing method from FIFO to Periodic Average with valid permissions and justification

**Test Type**: Positive

**Preconditions**:
- User is authenticated
- User has 'financial-manager' role
- Current costing method is FIFO
- Inventory settings exist for company

**Test Steps**:
1. Navigate to System Administration > Inventory Settings
2. Click "Change Costing Method" button
3. Select "Periodic Average" radio button
4. Enter justification: "Switching to periodic average for better performance and reduced database load"
5. Review impact analysis
6. Check "I understand the implications" checkbox
7. Click "Confirm Change" button

**Input Data**:
- Current Method: FIFO
- New Method: AVG
- Justification: "Switching to periodic average for better performance and reduced database load" (84 characters)
- User: financial-manager role
- Confirmation: Checked

**Expected Result**:
✅ Costing method changed successfully
- Audit entry created with all details
- Database updated: default_costing_method = 'AVG'
- Success message shown: "Costing method updated successfully"
- Stakeholders notified via email
- Settings cache invalidated

**Validation Layer**: All (Client, Server, Database)

**Pass/Fail Criteria**:
- No validation errors displayed
- Audit log entry created BEFORE settings update
- Settings saved to database with new method
- Notifications sent
- UI refreshed showing new method
- Historical costs unchanged

---

#### Negative Test: Insufficient Justification Length

**Test ID**: VAL-INV-T101

**Test Description**: Attempt to change costing method with justification less than 20 characters

**Test Type**: Negative

**Preconditions**:
- User is authenticated
- User has 'financial-manager' role
- Current costing method is FIFO

**Test Steps**:
1. Navigate to System Administration > Inventory Settings
2. Click "Change Costing Method" button
3. Select "Periodic Average" radio button
4. Enter justification: "Better performance" (19 characters)
5. Attempt to submit

**Input Data**:
- Current Method: FIFO
- New Method: AVG
- Justification: "Better performance" (19 characters)

**Expected Result**:
❌ Validation error displayed

**Validation Layer**: Client and Server

**Pass/Fail Criteria**:
- Error message shown: "Justification must be at least 20 characters"
- Justification field highlighted in red
- Character counter shows: "19/20 (1 more required)"
- Settings NOT saved to database
- No audit entry created
- User remains on form

---

#### Negative Test: Unauthorized User

**Test ID**: VAL-INV-T102

**Test Description**: Attempt to change costing method without required permissions

**Test Type**: Negative (Security)

**Preconditions**:
- User is authenticated
- User has 'staff' role (NOT financial-manager or system-admin)
- Current costing method is FIFO

**Test Steps**:
1. Navigate to System Administration > Inventory Settings
2. Attempt to click "Change Costing Method" button

**Input Data**:
- User: staff role
- Current Method: FIFO

**Expected Result**:
❌ Access denied

**Validation Layer**: Client and Server

**Pass/Fail Criteria**:
- **Client-Side**:
  * "Change Costing Method" button is hidden or disabled
  * Settings displayed as read-only
  * Message: "You do not have permission to change settings (view-only)"
- **Server-Side** (if client bypassed):
  * 403 Forbidden response
  * Error: "You do not have permission to change the costing method"
- Settings NOT modified
- No audit entry created

---

#### Boundary Test: Justification Exactly 20 Characters

**Test ID**: VAL-INV-T201

**Test Description**: Change costing method with justification exactly 20 characters (minimum allowed)

**Test Type**: Boundary

**Preconditions**:
- User is authenticated
- User has 'financial-manager' role
- Current costing method is FIFO

**Test Steps**:
1. Navigate to System Administration > Inventory Settings
2. Click "Change Costing Method" button
3. Select "Periodic Average"
4. Enter justification: "Performance reasons." (20 characters exactly)
5. Submit change

**Input Data**:
- Justification: "Performance reasons." (20 characters)
- Length: Exactly at minimum boundary

**Expected Result**:
✅ Change accepted (boundary value is acceptable)

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors
- Justification accepted
- Settings updated successfully
- Character counter shows: "20/500"

---

#### Boundary Test: Justification Exactly 500 Characters

**Test ID**: VAL-INV-T202

**Test Description**: Change costing method with justification exactly 500 characters (maximum allowed)

**Test Type**: Boundary

**Preconditions**:
- User is authenticated
- User has 'financial-manager' role

**Test Steps**:
1. Navigate to Inventory Settings
2. Click "Change Costing Method"
3. Enter justification with exactly 500 characters
4. Submit

**Input Data**:
- Justification: 500 character text (exactly at maximum)

**Expected Result**:
✅ Change accepted (boundary value is acceptable)

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors
- Justification accepted
- Character counter shows: "500/500 (maximum)"
- Settings updated successfully

---

#### Integration Test: Audit-First Pattern

**Test ID**: VAL-INV-T301

**Test Description**: Verify audit entry is created BEFORE settings are updated (audit-first pattern)

**Test Type**: Integration

**Preconditions**:
- User is authenticated with required permissions
- Database transaction logging enabled
- Current costing method is FIFO

**Test Steps**:
1. Initiate costing method change from FIFO to AVG
2. Monitor database transaction log
3. Verify audit entry INSERT occurs before settings UPDATE
4. Verify both operations succeed in same transaction

**Input Data**:
- Valid change request with all required fields

**Expected Result**:
✅ Audit-first pattern followed

**Validation Layer**: Server and Database

**Pass/Fail Criteria**:
- Transaction log shows sequence:
  1. BEGIN TRANSACTION
  2. INSERT INTO valuation_audit_log (audit entry)
  3. UPDATE inventory_settings (configuration change)
  4. COMMIT
- If step 2 fails, step 3 does not execute (rollback)
- Both records created with matching timestamps
- Audit entry references settings update

---

#### Security Test: Company Data Isolation

**Test ID**: VAL-INV-T401

**Test Description**: Verify users cannot access settings for other companies

**Test Type**: Security

**Preconditions**:
- Two companies exist: COMPANY-001, COMPANY-002
- User A belongs to COMPANY-001 with financial-manager role
- User B belongs to COMPANY-002 with financial-manager role
- Both companies have different costing methods

**Test Steps**:
1. User A logs in
2. User A navigates to Inventory Settings
3. User A should see only COMPANY-001 settings
4. Attempt to access COMPANY-002 settings via direct URL/API
5. Verify access denied

**Input Data**:
- User A: COMPANY-001, financial-manager
- Attempted access: COMPANY-002 settings

**Expected Result**:
❌ Access denied for cross-company data

**Validation Layer**: All (Client, Server, Database)

**Pass/Fail Criteria**:
- **Client-Side**: Only COMPANY-001 settings visible in UI
- **Server-Side**: API request for COMPANY-002 returns 403 Forbidden
- **Database**: RLS policy blocks query for COMPANY-002 data
- Error message: "You do not have access to settings for this company"

---

#### Security Test: Audit Log Immutability

**Test ID**: VAL-INV-T402

**Test Description**: Verify audit log entries cannot be modified or deleted

**Test Type**: Security

**Preconditions**:
- Audit log entry exists from previous costing method change
- User has system-admin role (highest privilege)

**Test Steps**:
1. Attempt to UPDATE existing audit entry via database
2. Attempt to DELETE existing audit entry via database
3. Verify both operations are blocked

**Input Data**:
- Existing audit log ID: AUD-12345
- Attempted UPDATE: Change reason field
- Attempted DELETE: Remove audit entry

**Expected Result**:
❌ Both operations blocked by database triggers

**Validation Layer**: Database

**Pass/Fail Criteria**:
- UPDATE statement fails with error: "Audit log entries are immutable and cannot be modified"
- DELETE statement fails with error: "Audit log entries are immutable and cannot be deleted"
- Original audit entry remains unchanged
- No records removed from audit log

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields Involved | Type | Client | Server | Database |
|------------|-----------|-----------------|------|--------|--------|----------|
| VAL-INV-001 | Costing Method Required | defaultCostingMethod | Field | ✅ | ✅ | ✅ |
| VAL-INV-002 | Costing Method Enum | defaultCostingMethod | Field | ✅ | ✅ | ✅ |
| VAL-INV-003 | Justification Required | justification | Field | ✅ | ✅ | ✅ |
| VAL-INV-004 | Justification Min Length | justification | Field | ✅ | ✅ | ✅ |
| VAL-INV-005 | Justification Max Length | justification | Field | ✅ | ✅ | ✅ |
| VAL-INV-006 | Period Type Immutable | periodType | Field | ✅ | ✅ | ✅ |
| VAL-INV-101 | Permission Check | - | Business | ✅ | ✅ | ✅ |
| VAL-INV-102 | Prevent Duplicate Config | companyId | Business | ❌ | ✅ | ✅ |
| VAL-INV-103 | Audit-First Pattern | - | Business | ❌ | ✅ | ✅ |
| VAL-INV-104 | Historical Cost Immutability | - | Business | ⚠️ | ✅ | ✅ |
| VAL-INV-105 | FIFO Layer Availability | layersConsumed | Business | ❌ | ✅ | ✅ |
| VAL-INV-106 | Periodic Average Receipts | receipts | Business | ❌ | ✅ | ❌ |
| VAL-INV-107 | Division by Zero | totalQuantity | Business | ❌ | ✅ | ❌ |
| VAL-INV-108 | Cache Staleness | calculated_at | Business | ❌ | ✅ | ❌ |
| VAL-INV-201 | Method Change Confirmation | currentMethod, newMethod | Cross-field | ✅ | ✅ | ❌ |
| VAL-INV-202 | Audit Completeness | audit fields | Cross-field | ❌ | ✅ | ✅ |
| VAL-INV-203 | FIFO Calculation Integrity | layer fields | Cross-field | ❌ | ✅ | ❌ |
| VAL-INV-301 | Role-Based Access | - | Security | ✅ | ✅ | ✅ |
| VAL-INV-302 | Company Data Isolation | companyId | Security | ✅ | ✅ | ✅ |
| VAL-INV-303 | Audit Immutability | - | Security | ✅ | ✅ | ✅ |
| VAL-INV-304 | Input Sanitization | text fields | Security | ⚠️ | ✅ | ✅ |
| VAL-INV-305 | Session Validation | - | Security | ✅ | ✅ | ❌ |

Legend:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (e.g., display only, basic checks)

---

## 9. Related Documents

- **Business Requirements**: [BR-inventory-valuation.md](./BR-inventory-valuation.md)
- **Use Cases**: [UC-inventory-valuation.md](./UC-inventory-valuation.md)
- **System Method Specification**: [SM-inventory-valuation.md](./SM-inventory-valuation.md)
- **Data Definition**: [DD-inventory-valuation.md](./DD-inventory-valuation.md)
- **Page Content Specification**: [PC-inventory-settings.md](./PC-inventory-settings.md)
- **Flow Diagrams**: [FD-inventory-valuation.md](./FD-inventory-valuation.md)

---

**Document Control**:
- **Created**: 2025-01-15
- **Author**: System
- **Reviewed By**: Business Analyst, QA Lead, Security Team (Pending)
- **Approved By**: Technical Lead, Product Owner (Pending)
- **Next Review**: 2025-04-15

---

## Appendix A: Error Code Registry

| Code Range | Category | Description | Count |
|------------|----------|-------------|-------|
| VAL-INV-001 to 099 | Field Validations | Individual field rules for settings | 6 |
| VAL-INV-101 to 199 | Business Rules | Business logic validations | 8 |
| VAL-INV-201 to 299 | Cross-Field | Multi-field relationships | 3 |
| VAL-INV-301 to 399 | Security | Permission and access control | 5 |
| VAL-INV-901 to 999 | System | System-level errors (reserved) | 0 |

**Total Validation Rules Defined**: 22

---

## Appendix B: Validation Checklist for Developers

When implementing inventory valuation features, ensure all validations are implemented:

**Configuration Changes**:
- [ ] Costing method required (VAL-INV-001)
- [ ] Costing method enum check (VAL-INV-002)
- [ ] Justification required (VAL-INV-003)
- [ ] Justification minimum 20 chars (VAL-INV-004)
- [ ] Justification maximum 500 chars (VAL-INV-005)
- [ ] Permission check (VAL-INV-101)
- [ ] Prevent duplicate config (VAL-INV-102)
- [ ] Audit-first pattern (VAL-INV-103)
- [ ] Historical cost immutability (VAL-INV-104)

**FIFO Calculations**:
- [ ] Layer availability check (VAL-INV-105)
- [ ] Calculation integrity (VAL-INV-203)

**Periodic Average Calculations**:
- [ ] Receipt validation (VAL-INV-106)
- [ ] Division by zero prevention (VAL-INV-107)
- [ ] Cache staleness check (VAL-INV-108)

**Security**:
- [ ] Role-based access (VAL-INV-301)
- [ ] Company data isolation (VAL-INV-302)
- [ ] Audit immutability (VAL-INV-303)
- [ ] Input sanitization (VAL-INV-304)
- [ ] Session validation (VAL-INV-305)

**Audit & Cross-Field**:
- [ ] Method change confirmation (VAL-INV-201)
- [ ] Audit completeness (VAL-INV-202)

---

## Appendix C: Validation Implementation Patterns

### Pattern 1: Client-Side Real-Time Validation (React Hook Form + Zod)

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const costingMethodChangeSchema = z.object({
  newMethod: z.enum(['FIFO', 'AVG'], {
    required_error: "Costing method is required", // VAL-INV-001
    invalid_type_error: "Invalid costing method" // VAL-INV-002
  }),
  justification: z.string()
    .min(20, "Justification must be at least 20 characters") // VAL-INV-004
    .max(500, "Justification cannot exceed 500 characters") // VAL-INV-005
    .refine(val => val.trim().length >= 20, {
      message: "Justification must be at least 20 characters (excluding whitespace)"
    }),
  confirmationChecked: z.boolean()
    .refine(val => val === true, {
      message: "You must confirm you understand the implications" // VAL-INV-201
    })
});

// Usage in component
const form = useForm({
  resolver: zodResolver(costingMethodChangeSchema)
});
```

### Pattern 2: Server-Side Business Rule Validation

```typescript
// server-side validation (server action or API route)
async function updateCostingMethod(data: UpdateCostingMethodRequest) {
  // VAL-INV-101: Permission check
  const user = await getCurrentUser();
  if (!['financial-manager', 'system-admin'].includes(user.role)) {
    throw new Error('You do not have permission to change the costing method');
  }

  // VAL-INV-302: Company data isolation
  const settings = await getInventorySettings(data.companyId);
  if (settings.companyId !== user.companyId) {
    throw new Error('You do not have access to settings for this company');
  }

  // VAL-INV-103: Audit-first pattern
  await createAuditEntry({
    eventType: 'COSTING_METHOD_CHANGED',
    oldValue: settings.defaultCostingMethod,
    newValue: data.newMethod,
    reason: data.justification,
    userId: user.id
  });

  // Now safe to update settings
  await updateSettings({
    ...settings,
    defaultCostingMethod: data.newMethod
  });
}
```

### Pattern 3: Database Constraint Validation

```sql
-- VAL-INV-001, VAL-INV-002: Costing method required and enum
ALTER TABLE inventory_settings
  ADD CONSTRAINT check_costing_method
  CHECK (default_costing_method IN ('FIFO', 'AVG'));

-- VAL-INV-102: Prevent duplicate configuration
CREATE UNIQUE INDEX idx_unique_company_settings
  ON inventory_settings(company_id);

-- VAL-INV-303: Audit immutability triggers
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be modified';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_update_audit
    BEFORE UPDATE ON valuation_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER prevent_delete_audit
    BEFORE DELETE ON valuation_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();
```

---

## Document Revision Notes

**✅ Schema Alignment Completed** (2025-11-03)

This document has been updated to accurately reflect the **actual Prisma database schema** defined in `/app/data-struc/schema.prisma`.

**Key Updates**:
- Costing method enum values clarified: Database uses `FIFO` and `AVG` (display as "Periodic Average")
- Updated all validation rules from `PERIODIC_AVERAGE` to `AVG` enum value
- Updated SQL CHECK constraints to use correct enum values ('FIFO', 'AVG')
- Added schema references throughout document
- Validated all validation rules against actual schema definitions

---

**Document End**

> 📝 **Note to Developers**:
> - Implement all three validation layers (client, server, database)
> - Never trust client-side validation alone
> - Use consistent error codes and messages
> - Log all validation failures for monitoring
> - Test all validation rules with positive, negative, and boundary cases
> - Keep validation rules synchronized with business requirements
> - Update this document when adding new validation rules
