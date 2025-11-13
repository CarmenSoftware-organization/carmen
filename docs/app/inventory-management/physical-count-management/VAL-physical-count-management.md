# Validations: Physical Count Management

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Physical Count Management
- **Route**: `/app/(main)/inventory-management/physical-count`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version |

---

## Overview

This document defines all validation rules for the Physical Count Management sub-module. Validations are implemented across three layers:

1. **Client-Side (Frontend)**: React Hook Form + Zod - Immediate user feedback
2. **Server-Side (Backend)**: Business logic validation - Security and business rules
3. **Database**: Constraints and triggers - Data integrity enforcement

### Validation Strategy

- **Defense in Depth**: Multiple validation layers prevent invalid data
- **User Experience**: Client-side validations provide immediate feedback
- **Security**: Server-side validations prevent malicious requests
- **Data Integrity**: Database constraints ensure consistency
- **Fail Fast**: Validate early to prevent cascading errors

### Validation Principles

1. **Required First**: Check required fields before other validations
2. **Type Safety**: Validate data types and formats
3. **Business Rules**: Enforce business logic and workflows
4. **Security**: Validate permissions and ownership
5. **User-Friendly**: Provide clear, actionable error messages

---

## Field-Level Validations

### Count Session (tb_count_stock)

#### VAL-PCM-001: location_id (Required, UUID)
**Layer**: Client, Server, Database
**Type**: Required Field, Format Validation

**Rules**:
- Must be provided (not null, not empty string)
- Must be valid UUID format (8-4-4-4-12 hex digits)
- Must reference existing location in tb_location table
- User must have access to the selected location

**Error Messages**:
- Client: "Location is required"
- Client: "Invalid location format"
- Server: "Location not found"
- Server: "You don't have access to this location"
- Database: Foreign key constraint violation

**Test Cases**:
```typescript
// Valid
location_id: "440e8400-e29b-41d4-a716-446655440001"

// Invalid
location_id: null                    // Error: Location is required
location_id: ""                      // Error: Location is required
location_id: "invalid-uuid"          // Error: Invalid location format
location_id: "550e8400-e29b-41d4-a716-446655440099" // Error: Location not found
```

---

#### VAL-PCM-002: count_stock_no (Optional, String)
**Layer**: Client, Server, Database
**Type**: Format Validation, Uniqueness

**Rules**:
- Optional (can be auto-generated)
- If provided: max 50 characters
- If provided: must match pattern ^CNT-\d{4}-\d{4,6}$
- Must be unique across all count sessions
- Cannot be changed after creation

**Error Messages**:
- Client: "Count number must match format CNT-YYYY-NNNNNN"
- Client: "Count number maximum 50 characters"
- Server: "Count number already exists"
- Server: "Count number cannot be changed"

**Test Cases**:
```typescript
// Valid
count_stock_no: "CNT-2024-0015"
count_stock_no: "CNT-2024-000001"
count_stock_no: null  // Auto-generated

// Invalid
count_stock_no: "COUNT-2024-15"      // Error: Invalid format
count_stock_no: "CNT-24-0015"        // Error: Year must be 4 digits
count_stock_no: "CNT-2024-0015" (existing) // Error: Already exists
```

---

#### VAL-PCM-003: start_date (Required, DateTime)
**Layer**: Client, Server, Database
**Type**: Required Field, Format Validation, Range Validation

**Rules**:
- Must be provided
- Must be valid ISO 8601 timestamp with timezone
- Cannot be more than 7 days in the past
- Cannot be more than 30 days in the future
- Must be before end_date (if end_date provided)

**Error Messages**:
- Client: "Start date is required"
- Client: "Start date must be a valid date"
- Server: "Start date cannot be more than 7 days in the past"
- Server: "Start date cannot be more than 30 days in the future"
- Server: "Start date must be before end date"

**Test Cases**:
```typescript
// Valid
start_date: new Date()
start_date: new Date(Date.now() + 86400000) // Tomorrow

// Invalid
start_date: null                     // Error: Start date is required
start_date: "invalid-date"           // Error: Invalid date format
start_date: new Date(Date.now() - 8*86400000) // Error: Too far in past
start_date: new Date(Date.now() + 31*86400000) // Error: Too far in future
```

---

#### VAL-PCM-004: end_date (Optional, DateTime)
**Layer**: Client, Server, Database
**Type**: Format Validation, Range Validation

**Rules**:
- Optional (can be null for in-progress counts)
- If provided: must be valid ISO 8601 timestamp with timezone
- If provided: must be after start_date
- If provided: cannot be more than 30 days after start_date
- If provided: cannot be in the future
- Required when status = completed

**Error Messages**:
- Client: "End date must be a valid date"
- Server: "End date must be after start date"
- Server: "End date cannot be more than 30 days after start date"
- Server: "End date cannot be in the future"
- Server: "End date is required when completing count"

**Test Cases**:
```typescript
// Valid
end_date: null  // For in-progress counts
end_date: new Date() // For completed counts

// Invalid (assuming start_date = 2024-01-15)
end_date: new Date("2024-01-14") // Error: Must be after start date
end_date: new Date("2024-02-20") // Error: More than 30 days after start
end_date: new Date(Date.now() + 86400000) // Error: Cannot be in future
```

---

#### VAL-PCM-005: doc_status (Required, Enum)
**Layer**: Client, Server, Database
**Type**: Required Field, Enum Validation, State Transition Validation

**Rules**:
- Must be provided
- Must be one of: pending, in_progress, completed, cancelled, voided
- Default value: pending
- Status transitions must follow workflow rules (see VAL-PCM-201)

**Error Messages**:
- Client: "Status is required"
- Client: "Invalid status value"
- Server: "Invalid status transition"

**Test Cases**:
```typescript
// Valid
doc_status: "pending"
doc_status: "in_progress"
doc_status: "completed"

// Invalid
doc_status: null             // Error: Status is required
doc_status: "draft"          // Error: Invalid status value
doc_status: "completed" → "pending" // Error: Invalid transition
```

---

#### VAL-PCM-006: count_stock_type (Required, Enum)
**Layer**: Client, Server, Database
**Type**: Required Field, Enum Validation

**Rules**:
- Must be provided
- Must be one of: physical, spot
- Default value: physical
- Cannot be changed after creation

**Error Messages**:
- Client: "Count type is required"
- Client: "Invalid count type"
- Server: "Count type cannot be changed"

**Test Cases**:
```typescript
// Valid
count_stock_type: "physical"
count_stock_type: "spot"

// Invalid
count_stock_type: null       // Error: Count type is required
count_stock_type: "cycle"    // Error: Invalid count type
```

---

#### VAL-PCM-007: description (Optional, String)
**Layer**: Client, Server, Database
**Type**: Length Validation

**Rules**:
- Optional
- If provided: max 500 characters
- If provided: must not contain only whitespace

**Error Messages**:
- Client: "Description maximum 500 characters"
- Client: "Description cannot be only whitespace"

**Test Cases**:
```typescript
// Valid
description: "Monthly kitchen inventory count - January 2024"
description: null

// Invalid
description: "A".repeat(501) // Error: Maximum 500 characters
description: "   "           // Error: Cannot be only whitespace
```

---

#### VAL-PCM-008: note (Optional, String)
**Layer**: Client, Server, Database
**Type**: Length Validation

**Rules**:
- Optional
- If provided: max 1000 characters
- If provided: must not contain only whitespace

**Error Messages**:
- Client: "Note maximum 1000 characters"
- Client: "Note cannot be only whitespace"

**Test Cases**:
```typescript
// Valid
note: "Found 3 expired dairy products, removed from inventory"
note: null

// Invalid
note: "A".repeat(1001) // Error: Maximum 1000 characters
note: "   "            // Error: Cannot be only whitespace
```

---

### Count Detail (tb_count_stock_detail)

#### VAL-PCM-010: count_stock_id (Required, UUID)
**Layer**: Server, Database
**Type**: Required Field, Foreign Key Validation

**Rules**:
- Must be provided (not null, not empty string)
- Must be valid UUID format
- Must reference existing count session in tb_count_stock table
- Count session must not be deleted (deleted_at IS NULL)

**Error Messages**:
- Server: "Count session ID is required"
- Server: "Invalid count session ID format"
- Server: "Count session not found"
- Database: Foreign key constraint violation

**Test Cases**:
```typescript
// Valid
count_stock_id: "550e8400-e29b-41d4-a716-446655440001"

// Invalid
count_stock_id: null          // Error: Count session ID is required
count_stock_id: "invalid"     // Error: Invalid format
count_stock_id: "550e8400-e29b-41d4-a716-446655440099" // Error: Not found
```

---

#### VAL-PCM-011: sequence_no (Optional, Integer)
**Layer**: Client, Server, Database
**Type**: Range Validation, Uniqueness

**Rules**:
- Optional (auto-generated if not provided)
- If provided: must be positive integer (>= 1)
- If provided: must be unique within count session
- Default value: 1
- Used for display order

**Error Messages**:
- Client: "Sequence number must be positive"
- Server: "Sequence number already exists in this count"

**Test Cases**:
```typescript
// Valid
sequence_no: 1
sequence_no: 52
sequence_no: null // Auto-generated

// Invalid
sequence_no: 0               // Error: Must be positive
sequence_no: -5              // Error: Must be positive
sequence_no: 1.5             // Error: Must be integer
sequence_no: 15 (existing)   // Error: Already exists
```

---

#### VAL-PCM-012: product_id (Required, UUID)
**Layer**: Client, Server, Database
**Type**: Required Field, Foreign Key Validation, Uniqueness

**Rules**:
- Must be provided
- Must be valid UUID format
- Must reference existing product in tb_product table
- Product must be active (is_active = true)
- Product must not be deleted (deleted_at IS NULL)
- Must be unique within count session (one line per product)

**Error Messages**:
- Client: "Product is required"
- Client: "Invalid product format"
- Server: "Product not found"
- Server: "Product is inactive"
- Server: "Product already added to this count"

**Test Cases**:
```typescript
// Valid
product_id: "660e8400-e29b-41d4-a716-446655440001"

// Invalid
product_id: null              // Error: Product is required
product_id: "invalid"         // Error: Invalid format
product_id: "660e8400-e29b-41d4-a716-446655440099" // Error: Not found
product_id: "660e8400-..." (inactive) // Error: Product is inactive
product_id: "660e8400-..." (existing) // Error: Already added
```

---

#### VAL-PCM-013: expected_qty (Optional, Decimal)
**Layer**: Client, Server, Database
**Type**: Range Validation, Precision Validation

**Rules**:
- Optional (retrieved from system or can be entered manually)
- If provided: must be >= 0
- Precision: 15 digits total, 2 decimal places
- Cannot be negative
- Retrieved from closing balance of last inventory transaction

**Error Messages**:
- Client: "Expected quantity cannot be negative"
- Client: "Expected quantity maximum 2 decimal places"
- Server: "Expected quantity exceeds maximum precision"

**Test Cases**:
```typescript
// Valid
expected_qty: 100.00
expected_qty: 0.50
expected_qty: null

// Invalid
expected_qty: -10            // Error: Cannot be negative
expected_qty: 123.456        // Error: Maximum 2 decimal places
expected_qty: 9999999999999.99 // Error: Exceeds precision
```

---

#### VAL-PCM-014: actual_qty (Required, Decimal)
**Layer**: Client, Server, Database
**Type**: Required Field, Range Validation, Precision Validation

**Rules**:
- Must be provided when saving count detail
- Must be >= 0
- Precision: 15 digits total, 2 decimal places
- Cannot be negative
- Used to calculate variance_qty and variance_pct

**Error Messages**:
- Client: "Actual quantity is required"
- Client: "Actual quantity cannot be negative"
- Client: "Actual quantity maximum 2 decimal places"
- Server: "Actual quantity exceeds maximum precision"

**Test Cases**:
```typescript
// Valid
actual_qty: 95.00
actual_qty: 0.00

// Invalid
actual_qty: null             // Error: Actual quantity is required
actual_qty: -5               // Error: Cannot be negative
actual_qty: 123.456          // Error: Maximum 2 decimal places
```

---

#### VAL-PCM-015: variance_qty (Calculated, Decimal)
**Layer**: Server, Database
**Type**: Calculated Field, Validation

**Rules**:
- Automatically calculated: actual_qty - expected_qty
- Precision: 15 digits total, 2 decimal places
- Can be positive (overage) or negative (shortage)
- Must be recalculated when actual_qty or expected_qty changes

**Calculation**:
```typescript
variance_qty = actual_qty - expected_qty
```

**Test Cases**:
```typescript
// Calculation Examples
expected_qty: 100, actual_qty: 95  → variance_qty: -5.00 (shortage)
expected_qty: 100, actual_qty: 105 → variance_qty: 5.00 (overage)
expected_qty: 100, actual_qty: 100 → variance_qty: 0.00 (match)
```

---

#### VAL-PCM-016: variance_pct (Calculated, Decimal)
**Layer**: Server, Database
**Type**: Calculated Field, Validation

**Rules**:
- Automatically calculated: (variance_qty / expected_qty) * 100
- Precision: 5 digits total, 2 decimal places
- Can be positive or negative
- If expected_qty = 0, variance_pct = NULL
- Must be recalculated when variance_qty or expected_qty changes

**Calculation**:
```typescript
variance_pct = expected_qty > 0
  ? (variance_qty / expected_qty) * 100
  : null
```

**Test Cases**:
```typescript
// Calculation Examples
expected_qty: 100, variance_qty: -5   → variance_pct: -5.00%
expected_qty: 100, variance_qty: 10   → variance_pct: 10.00%
expected_qty: 0, variance_qty: 5      → variance_pct: null
expected_qty: 50, variance_qty: -2.5  → variance_pct: -5.00%
```

---

#### VAL-PCM-017: is_counted (Required, Boolean)
**Layer**: Client, Server, Database
**Type**: Required Field, Boolean Validation

**Rules**:
- Must be provided
- Must be true or false
- Default value: false
- Set to true when actual_qty is entered
- All items must be counted (is_counted = true) before completing count

**Error Messages**:
- Client: "Counted status is required"
- Server: "Cannot complete count - not all items counted"

**Test Cases**:
```typescript
// Valid
is_counted: true
is_counted: false

// Invalid
is_counted: null             // Error: Counted status is required
is_counted: "yes"            // Error: Must be boolean
```

---

#### VAL-PCM-018: adjustment_posted (Required, Boolean)
**Layer**: Server, Database
**Type**: Required Field, Boolean Validation, State Management

**Rules**:
- Must be provided
- Must be true or false
- Default value: false
- Set to true after adjustment transaction created
- Cannot be changed back to false once true
- Must be true for all items when count status = completed

**Error Messages**:
- Server: "Adjustment posted status is required"
- Server: "Cannot unpost adjustment"
- Server: "Cannot complete count - adjustments not posted"

**Test Cases**:
```typescript
// Valid
adjustment_posted: false  // Initial state
adjustment_posted: true   // After posting

// Invalid
adjustment_posted: null              // Error: Status is required
adjustment_posted: true → false      // Error: Cannot unpost
```

---

#### VAL-PCM-019: adjustment_transaction_id (Optional, UUID)
**Layer**: Server, Database
**Type**: Foreign Key Validation, Conditional Required

**Rules**:
- Optional initially
- If adjustment_posted = true, must be provided
- Must be valid UUID format
- Must reference existing inventory transaction
- Cannot be changed once set

**Error Messages**:
- Server: "Adjustment transaction ID required when adjustment posted"
- Server: "Invalid adjustment transaction ID format"
- Server: "Adjustment transaction not found"
- Server: "Adjustment transaction ID cannot be changed"

**Test Cases**:
```typescript
// Valid
adjustment_transaction_id: null  // When adjustment_posted = false
adjustment_transaction_id: "770e8400-e29b-41d4-a716-446655440001" // When posted

// Invalid
adjustment_transaction_id: null  (when adjustment_posted = true) // Error: Required
adjustment_transaction_id: "invalid" // Error: Invalid format
```

---

## Business Rule Validations

### VAL-PCM-101: One Active Count Per Location
**Priority**: Critical
**Layer**: Server, Database

**Rule**: Only one count session with status "pending" or "in_progress" can exist per location at any time.

**Validation Logic**:
```typescript
// Check for existing active counts
const existingCount = await prisma.tb_count_stock.findFirst({
  where: {
    location_id: locationId,
    doc_status: { in: ['pending', 'in_progress'] },
    deleted_at: null,
    id: { not: currentCountId } // Exclude current count on update
  }
});

if (existingCount) {
  throw new ValidationError(
    'An active count already exists for this location. Complete or cancel it before starting a new count.'
  );
}
```

**Error Message**: "An active count already exists for this location. Complete or cancel the existing count (CNT-2024-0015) before starting a new one."

**Test Scenarios**:
- ✅ Create new count when no active count exists
- ❌ Create new count when pending count exists → Error
- ❌ Create new count when in_progress count exists → Error
- ✅ Create new count when only completed counts exist
- ✅ Update existing count (doesn't conflict with itself)

---

### VAL-PCM-102: All Items Must Be Counted
**Priority**: Critical
**Layer**: Server

**Rule**: Count session can only be completed when all detail lines have is_counted = true.

**Validation Logic**:
```typescript
// Check for uncounted items
const uncountedItems = await prisma.tb_count_stock_detail.count({
  where: {
    count_stock_id: countStockId,
    is_counted: false,
    deleted_at: null
  }
});

if (uncountedItems > 0) {
  throw new ValidationError(
    `Cannot complete count - ${uncountedItems} items not yet counted`
  );
}
```

**Error Message**: "Cannot complete count - 3 items not yet counted. Please count all items before completing."

**Test Scenarios**:
- ✅ Complete count when all items counted
- ❌ Complete count with uncounted items → Error
- ✅ Save draft with uncounted items (status = pending)

---

### VAL-PCM-103: High Variance Requires Approval
**Priority**: High
**Layer**: Server

**Rule**: Items with variance > 5% or variance value > $500 require supervisor approval before completion.

**Validation Logic**:
```typescript
// Check for high variance items
const highVarianceItems = await prisma.tb_count_stock_detail.findMany({
  where: {
    count_stock_id: countStockId,
    deleted_at: null,
    OR: [
      { variance_pct: { gt: 5 } },
      { variance_pct: { lt: -5 } },
      // Variance value check requires product cost lookup
    ]
  }
});

if (highVarianceItems.length > 0 && !supervisorApproved) {
  throw new ValidationError(
    `High variance detected on ${highVarianceItems.length} items. Supervisor approval required.`
  );
}
```

**Error Message**: "High variance detected on 2 items (Chicken Breast: -8.5%, Salmon Fillet: $625 shortage). Supervisor approval required before completing count."

**Test Scenarios**:
- ✅ Complete count with low variance (< 5%, < $500)
- ❌ Complete count with high variance without approval → Error
- ✅ Complete count with high variance + supervisor approval
- ❌ Complete count with variance > $500 without approval → Error

---

### VAL-PCM-104: Cannot Modify Completed Count
**Priority**: Critical
**Layer**: Server

**Rule**: Count sessions with status "completed" or "voided" cannot be modified (except by voiding within 24 hours).

**Validation Logic**:
```typescript
if (existingCount.doc_status === 'completed' || existingCount.doc_status === 'voided') {
  // Only allow voiding within 24 hours
  if (action === 'void' && existingCount.doc_status === 'completed') {
    const hoursSinceCompletion =
      (Date.now() - existingCount.end_date.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCompletion > 24) {
      throw new ValidationError(
        'Count can only be voided within 24 hours of completion'
      );
    }

    if (!hasRole('manager')) {
      throw new ValidationError(
        'Only managers can void completed counts'
      );
    }
  } else {
    throw new ValidationError(
      `Cannot modify count with status: ${existingCount.doc_status}`
    );
  }
}
```

**Error Messages**:
- "Cannot modify completed count. Only voiding is allowed within 24 hours."
- "Count can only be voided within 24 hours of completion (completed 36 hours ago)"
- "Only managers can void completed counts"

**Test Scenarios**:
- ❌ Edit completed count → Error
- ✅ Void completed count within 24 hours (manager)
- ❌ Void completed count after 24 hours → Error
- ❌ Void completed count (non-manager) → Error
- ❌ Edit voided count → Error

---

### VAL-PCM-105: Adjustment Posting Required
**Priority**: Critical
**Layer**: Server

**Rule**: Count session can only be completed when all detail lines have adjustment_posted = true.

**Validation Logic**:
```typescript
const unpostedItems = await prisma.tb_count_stock_detail.count({
  where: {
    count_stock_id: countStockId,
    adjustment_posted: false,
    deleted_at: null
  }
});

if (unpostedItems > 0) {
  throw new ValidationError(
    `Cannot complete count - adjustments not posted for ${unpostedItems} items`
  );
}
```

**Error Message**: "Cannot complete count - inventory adjustments not posted for 5 items. Please post all adjustments before completing."

**Test Scenarios**:
- ✅ Complete count when all adjustments posted
- ❌ Complete count with unposted adjustments → Error
- ✅ Save draft with unposted adjustments

---

### VAL-PCM-106: Cannot Delete Count with Posted Adjustments
**Priority**: Critical
**Layer**: Server

**Rule**: Count sessions cannot be deleted if any detail lines have adjustment_posted = true. Must be voided instead.

**Validation Logic**:
```typescript
const postedItems = await prisma.tb_count_stock_detail.count({
  where: {
    count_stock_id: countStockId,
    adjustment_posted: true,
    deleted_at: null
  }
});

if (postedItems > 0) {
  throw new ValidationError(
    'Cannot delete count with posted adjustments. Use void instead.'
  );
}
```

**Error Message**: "Cannot delete count CNT-2024-0015 - inventory adjustments have been posted. Use void action to reverse this count."

**Test Scenarios**:
- ✅ Delete count with no posted adjustments (soft delete)
- ❌ Delete count with posted adjustments → Error
- ✅ Void count with posted adjustments (manager, within 24h)

---

## Cross-Field Validations

### VAL-PCM-201: Status Transition Validation
**Priority**: Critical
**Layer**: Server

**Rule**: Status transitions must follow the allowed workflow paths.

**Allowed Transitions**:
```
pending → in_progress
pending → cancelled
in_progress → completed
in_progress → cancelled
in_progress → pending (save draft)
completed → voided (manager only, within 24 hours)
```

**Validation Logic**:
```typescript
const allowedTransitions = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled', 'pending'],
  completed: ['voided'],
  cancelled: [],
  voided: []
};

if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
  throw new ValidationError(
    `Invalid status transition: ${currentStatus} → ${newStatus}`
  );
}

// Additional checks for specific transitions
if (newStatus === 'completed') {
  // Validate all items counted (VAL-PCM-102)
  // Validate all adjustments posted (VAL-PCM-105)
  // Validate high variance approval if needed (VAL-PCM-103)
}

if (newStatus === 'voided') {
  // Validate 24-hour window
  // Validate manager role
}
```

**Error Messages**:
- "Invalid status transition: completed → pending. Completed counts cannot be reopened."
- "Cannot transition from cancelled to in_progress. Create a new count instead."
- "Invalid status transition: pending → voided. Only completed counts can be voided."

**Test Scenarios**:
- ✅ pending → in_progress
- ✅ in_progress → completed (when all validations pass)
- ✅ in_progress → pending (save draft)
- ❌ completed → pending → Error
- ❌ cancelled → in_progress → Error
- ✅ completed → voided (manager, <24h)

---

### VAL-PCM-202: Start Date vs End Date Validation
**Priority**: High
**Layer**: Client, Server

**Rule**: end_date must be after start_date when both are provided.

**Validation Logic**:
```typescript
if (endDate && startDate) {
  if (endDate <= startDate) {
    throw new ValidationError(
      'End date must be after start date'
    );
  }

  const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 30) {
    throw new ValidationError(
      'Count duration cannot exceed 30 days'
    );
  }
}
```

**Error Messages**:
- "End date must be after start date"
- "Count duration cannot exceed 30 days (current: 35 days)"

**Test Scenarios**:
- ✅ start: 2024-01-15, end: 2024-01-16
- ❌ start: 2024-01-15, end: 2024-01-15 → Error
- ❌ start: 2024-01-15, end: 2024-01-14 → Error
- ❌ start: 2024-01-01, end: 2024-02-05 → Error (>30 days)

---

### VAL-PCM-203: Variance Calculation Validation
**Priority**: High
**Layer**: Server

**Rule**: variance_qty and variance_pct must be correctly calculated from expected_qty and actual_qty.

**Validation Logic**:
```typescript
const calculatedVarianceQty = actualQty - expectedQty;
const calculatedVariancePct = expectedQty > 0
  ? (calculatedVarianceQty / expectedQty) * 100
  : null;

if (Math.abs(varianceQty - calculatedVarianceQty) > 0.01) {
  throw new ValidationError(
    'Variance quantity mismatch. Recalculation required.'
  );
}

if (expectedQty > 0 && Math.abs(variancePct - calculatedVariancePct) > 0.01) {
  throw new ValidationError(
    'Variance percentage mismatch. Recalculation required.'
  );
}
```

**Error Messages**:
- "Variance quantity mismatch. Expected: -5.00, Calculated: -5.50. Recalculation required."
- "Variance percentage mismatch. Recalculation required."

**Test Scenarios**:
- ✅ expected: 100, actual: 95, variance_qty: -5, variance_pct: -5.00
- ❌ expected: 100, actual: 95, variance_qty: -4 → Error
- ❌ expected: 100, actual: 95, variance_pct: -4.00 → Error

---

### VAL-PCM-204: Counted Status Consistency
**Priority**: Medium
**Layer**: Server

**Rule**: is_counted must be true when actual_qty is provided, and false when actual_qty is null.

**Validation Logic**:
```typescript
if (actualQty !== null && !isCounted) {
  throw new ValidationError(
    'Item with actual quantity must be marked as counted'
  );
}

if (actualQty === null && isCounted) {
  throw new ValidationError(
    'Item marked as counted must have actual quantity'
  );
}
```

**Error Messages**:
- "Item with actual quantity (95.00) must be marked as counted"
- "Item marked as counted must have actual quantity entered"

**Test Scenarios**:
- ✅ actual_qty: 95, is_counted: true
- ✅ actual_qty: null, is_counted: false
- ❌ actual_qty: 95, is_counted: false → Error
- ❌ actual_qty: null, is_counted: true → Error

---

### VAL-PCM-205: Adjustment Posting Consistency
**Priority**: Critical
**Layer**: Server

**Rule**: adjustment_transaction_id must be provided when adjustment_posted = true, and null when adjustment_posted = false.

**Validation Logic**:
```typescript
if (adjustmentPosted && !adjustmentTransactionId) {
  throw new ValidationError(
    'Adjustment transaction ID required when adjustment posted'
  );
}

if (!adjustmentPosted && adjustmentTransactionId) {
  throw new ValidationError(
    'Adjustment transaction ID must be null when adjustment not posted'
  );
}
```

**Error Messages**:
- "Adjustment transaction ID required when adjustment marked as posted"
- "Adjustment transaction ID must be null when adjustment not posted"

**Test Scenarios**:
- ✅ posted: true, transaction_id: "770e8400-..."
- ✅ posted: false, transaction_id: null
- ❌ posted: true, transaction_id: null → Error
- ❌ posted: false, transaction_id: "770e8400-..." → Error

---

## Security Validations

### VAL-PCM-301: Location Access Permission
**Priority**: Critical
**Layer**: Server

**Rule**: Users can only create/view/edit counts for locations they have access to.

**Validation Logic**:
```typescript
// Check user's location access
const hasLocationAccess = await checkLocationAccess(userId, locationId);

if (!hasLocationAccess) {
  throw new AuthorizationError(
    'You do not have access to this location'
  );
}
```

**Error Message**: "Access denied. You do not have permission to perform inventory counts for Main Kitchen."

**Test Scenarios**:
- ✅ User with location access creates count
- ❌ User without location access creates count → Error
- ❌ User without location access views count → Error
- ✅ User with location access views count

---

### VAL-PCM-302: Role-Based Action Permission
**Priority**: Critical
**Layer**: Server

**Rule**: Different actions require specific user roles.

**Permission Matrix**:
```
Action                 | Storekeeper | Supervisor | Manager
-----------------------|-------------|------------|--------
Create count           | ✓           | ✓          | ✓
Enter quantities       | ✓           | ✓          | ✓
Save draft             | ✓           | ✓          | ✓
Complete count         | ✗           | ✓          | ✓
Cancel count           | ✗           | ✓          | ✓
Void completed count   | ✗           | ✗          | ✓
View counts            | ✓ (own)     | ✓ (all)    | ✓ (all)
Edit completed count   | ✗           | ✗          | ✗
```

**Validation Logic**:
```typescript
const requiredRoles = {
  complete: ['supervisor', 'manager'],
  cancel: ['supervisor', 'manager'],
  void: ['manager']
};

if (requiredRoles[action] && !hasAnyRole(userRoles, requiredRoles[action])) {
  throw new AuthorizationError(
    `Action '${action}' requires one of: ${requiredRoles[action].join(', ')}`
  );
}
```

**Error Messages**:
- "Permission denied. Action 'complete' requires supervisor or manager role."
- "Permission denied. Only managers can void completed counts."
- "Permission denied. You can only view your own counts."

**Test Scenarios**:
- ✅ Supervisor completes count
- ❌ Storekeeper completes count → Error
- ✅ Manager voids count
- ❌ Supervisor voids count → Error

---

### VAL-PCM-303: Ownership Validation
**Priority**: High
**Layer**: Server

**Rule**: Users can only edit counts they created, unless they are supervisor or manager.

**Validation Logic**:
```typescript
if (action === 'edit' && existingCount.created_by !== userId) {
  const isSupervisorOrManager = hasAnyRole(userRoles, ['supervisor', 'manager']);

  if (!isSupervisorOrManager) {
    throw new AuthorizationError(
      'You can only edit counts you created'
    );
  }
}
```

**Error Message**: "Permission denied. You can only edit counts you created. This count was created by John Doe."

**Test Scenarios**:
- ✅ User edits own count
- ❌ Storekeeper edits another storekeeper's count → Error
- ✅ Supervisor edits any count
- ✅ Manager edits any count

---

### VAL-PCM-304: Concurrent Modification Protection
**Priority**: High
**Layer**: Server

**Rule**: Prevent concurrent modifications using optimistic locking (updated_at timestamp).

**Validation Logic**:
```typescript
// Client sends last known updated_at
const currentRecord = await prisma.tb_count_stock.findUnique({
  where: { id: countStockId },
  select: { updated_at: true }
});

if (currentRecord.updated_at.getTime() !== clientUpdatedAt.getTime()) {
  throw new ConcurrencyError(
    'This count has been modified by another user. Please refresh and try again.'
  );
}
```

**Error Message**: "Conflict detected. This count was modified by Jane Smith at 2024-01-15 10:35:22. Please refresh and reapply your changes."

**Test Scenarios**:
- ✅ Update with matching timestamp
- ❌ Update with stale timestamp → Error
- ✅ Retry after refresh

---

## Error Messages

### Client-Side Error Messages (Immediate Feedback)

**Field Validation Errors**:
```typescript
const errorMessages = {
  // Required fields
  'location_id.required': 'Location is required',
  'start_date.required': 'Start date is required',
  'product_id.required': 'Product is required',
  'actual_qty.required': 'Actual quantity is required',

  // Format errors
  'location_id.invalid': 'Invalid location format',
  'count_stock_no.format': 'Count number must match format CNT-YYYY-NNNNNN',
  'start_date.invalid': 'Start date must be a valid date',

  // Range errors
  'actual_qty.negative': 'Actual quantity cannot be negative',
  'expected_qty.negative': 'Expected quantity cannot be negative',
  'description.maxLength': 'Description maximum 500 characters',
  'note.maxLength': 'Note maximum 1000 characters',

  // Precision errors
  'actual_qty.precision': 'Actual quantity maximum 2 decimal places',
  'expected_qty.precision': 'Expected quantity maximum 2 decimal places'
};
```

### Server-Side Error Messages (Business Logic)

**Business Rule Errors**:
```typescript
const businessErrorMessages = {
  // Uniqueness
  'count_stock_no.duplicate': 'Count number CNT-2024-0015 already exists',
  'product.duplicate': 'Product "Chicken Breast" already added to this count',

  // State validation
  'location.activeCount': 'An active count already exists for Main Kitchen (CNT-2024-0015). Complete or cancel it before starting a new count.',
  'items.notCounted': 'Cannot complete count - 3 items not yet counted: Chicken Breast, Salmon Fillet, Olive Oil',
  'adjustments.notPosted': 'Cannot complete count - inventory adjustments not posted for 5 items',
  'variance.highRequiresApproval': 'High variance detected on 2 items (Chicken Breast: -8.5%, Salmon Fillet: $625 shortage). Supervisor approval required.',

  // Workflow errors
  'status.invalidTransition': 'Invalid status transition: completed → pending. Completed counts cannot be reopened.',
  'count.cannotModifyCompleted': 'Cannot modify completed count CNT-2024-0015. Only voiding is allowed within 24 hours.',
  'count.cannotVoidExpired': 'Count can only be voided within 24 hours of completion (completed 36 hours ago)',
  'count.cannotDeletePosted': 'Cannot delete count CNT-2024-0015 - inventory adjustments have been posted. Use void action to reverse.',

  // Date range errors
  'start_date.tooOld': 'Start date cannot be more than 7 days in the past',
  'start_date.tooFuture': 'Start date cannot be more than 30 days in the future',
  'end_date.beforeStart': 'End date must be after start date',
  'end_date.tooLong': 'Count duration cannot exceed 30 days (current: 35 days)',
  'end_date.future': 'End date cannot be in the future',

  // Reference errors
  'location.notFound': 'Location with ID 440e8400-... not found',
  'product.notFound': 'Product with ID 660e8400-... not found',
  'product.inactive': 'Product "Expired Item" is inactive and cannot be counted',
  'count.notFound': 'Count session with ID 550e8400-... not found'
};
```

### Authorization Error Messages

**Permission Errors**:
```typescript
const authErrorMessages = {
  'location.accessDenied': 'Access denied. You do not have permission to perform inventory counts for Main Kitchen.',
  'role.insufficient': 'Permission denied. Action "complete" requires supervisor or manager role. Your role: storekeeper',
  'ownership.denied': 'Permission denied. You can only edit counts you created. This count was created by John Doe.',
  'void.managerOnly': 'Permission denied. Only managers can void completed counts.',
  'concurrency.conflict': 'Conflict detected. This count was modified by Jane Smith at 2024-01-15 10:35:22. Please refresh and reapply your changes.'
};
```

### Database Error Messages

**Constraint Violations**:
```typescript
const databaseErrorMessages = {
  'fk.location_id': 'Foreign key constraint violation: Invalid location reference',
  'fk.product_id': 'Foreign key constraint violation: Invalid product reference',
  'fk.count_stock_id': 'Foreign key constraint violation: Invalid count session reference',
  'unique.count_stock_no': 'Unique constraint violation: Count number already exists',
  'check.actual_qty': 'Check constraint violation: Actual quantity must be >= 0'
};
```

---

## Test Scenarios

### Scenario 1: Create Valid Count Session
**Objective**: Verify successful creation of count session with valid data

**Test Data**:
```typescript
{
  location_id: "440e8400-e29b-41d4-a716-446655440001",
  count_stock_type: "physical",
  start_date: new Date("2024-01-15T08:00:00Z"),
  description: "Monthly kitchen inventory count - January 2024",
  doc_status: "pending"
}
```

**Expected Result**: ✅ Count session created successfully with auto-generated count_stock_no

**Validations Checked**:
- VAL-PCM-001: location_id valid
- VAL-PCM-003: start_date valid
- VAL-PCM-005: doc_status valid
- VAL-PCM-101: No active count exists for location
- VAL-PCM-301: User has location access

---

### Scenario 2: Create Count with Existing Active Count
**Objective**: Verify prevention of duplicate active counts per location

**Test Data**:
```typescript
// Existing count
{
  location_id: "440e8400-e29b-41d4-a716-446655440001",
  doc_status: "in_progress"
}

// New count attempt
{
  location_id: "440e8400-e29b-41d4-a716-446655440001",
  doc_status: "pending"
}
```

**Expected Result**: ❌ Error: "An active count already exists for Main Kitchen (CNT-2024-0015)"

**Validations Checked**:
- VAL-PCM-101: One active count per location

---

### Scenario 3: Enter Count Quantities
**Objective**: Verify entering actual quantities and variance calculation

**Test Data**:
```typescript
{
  product_id: "660e8400-e29b-41d4-a716-446655440001",
  expected_qty: 100.00,
  actual_qty: 95.00,
  is_counted: true
}
```

**Expected Result**: ✅ Detail saved with:
- variance_qty: -5.00
- variance_pct: -5.00
- is_counted: true

**Validations Checked**:
- VAL-PCM-012: product_id valid
- VAL-PCM-013: expected_qty valid
- VAL-PCM-014: actual_qty valid
- VAL-PCM-203: Variance calculations correct
- VAL-PCM-204: Counted status consistent

---

### Scenario 4: Complete Count with Uncounted Items
**Objective**: Verify prevention of completion with uncounted items

**Test Data**:
```typescript
// Count session with 10 items
// 7 items counted, 3 items not counted

// Attempt to complete
{
  id: "550e8400-e29b-41d4-a716-446655440001",
  doc_status: "completed"
}
```

**Expected Result**: ❌ Error: "Cannot complete count - 3 items not yet counted: Chicken Breast, Salmon Fillet, Olive Oil"

**Validations Checked**:
- VAL-PCM-102: All items must be counted
- VAL-PCM-201: Status transition validation

---

### Scenario 5: Complete Count with High Variance
**Objective**: Verify high variance approval requirement

**Test Data**:
```typescript
// Item with high percentage variance
{
  expected_qty: 100.00,
  actual_qty: 85.00,  // -15% variance
  is_counted: true
}

// Attempt to complete without approval
{
  doc_status: "completed",
  supervisor_approved: false
}
```

**Expected Result**: ❌ Error: "High variance detected on 1 item (Chicken Breast: -15.00%). Supervisor approval required."

**Validations Checked**:
- VAL-PCM-103: High variance requires approval
- VAL-PCM-201: Status transition validation

---

### Scenario 6: Successfully Complete Count
**Objective**: Verify successful completion with all validations passing

**Test Data**:
```typescript
// Count session
{
  id: "550e8400-e29b-41d4-a716-446655440001",
  location_id: "440e8400-e29b-41d4-a716-446655440001",
  doc_status: "in_progress",
  start_date: "2024-01-15T08:00:00Z"
}

// All 10 items
// - All have is_counted = true
// - All have adjustment_posted = true
// - No high variance items

// Complete action
{
  doc_status: "completed",
  end_date: "2024-01-15T14:30:00Z"
}
```

**Expected Result**: ✅ Count completed successfully with:
- doc_status: "completed"
- end_date: "2024-01-15T14:30:00Z"

**Validations Checked**:
- VAL-PCM-102: All items counted
- VAL-PCM-105: All adjustments posted
- VAL-PCM-103: No high variance issues
- VAL-PCM-201: Valid status transition
- VAL-PCM-202: End date after start date

---

### Scenario 7: Void Completed Count (Manager, Within 24h)
**Objective**: Verify manager can void recently completed count

**Test Data**:
```typescript
// Completed count
{
  id: "550e8400-e29b-41d4-a716-446655440001",
  doc_status: "completed",
  end_date: "2024-01-15T14:30:00Z"  // 12 hours ago
}

// Void action (manager)
{
  doc_status: "voided",
  user_role: "manager"
}
```

**Expected Result**: ✅ Count voided successfully

**Validations Checked**:
- VAL-PCM-104: Within 24-hour window
- VAL-PCM-104: Manager role
- VAL-PCM-201: Valid status transition

---

### Scenario 8: Attempt to Void Expired Count
**Objective**: Verify prevention of voiding after 24-hour window

**Test Data**:
```typescript
// Completed count
{
  doc_status: "completed",
  end_date: "2024-01-13T14:30:00Z"  // 36 hours ago
}

// Void attempt
{
  doc_status: "voided",
  user_role: "manager"
}
```

**Expected Result**: ❌ Error: "Count can only be voided within 24 hours of completion (completed 36 hours ago)"

**Validations Checked**:
- VAL-PCM-104: 24-hour window expired

---

### Scenario 9: Storekeeper Attempts Supervisor Action
**Objective**: Verify role-based permission enforcement

**Test Data**:
```typescript
// User
{
  user_id: "user-123",
  role: "storekeeper"
}

// Complete action attempt
{
  doc_status: "completed"
}
```

**Expected Result**: ❌ Error: "Permission denied. Action 'complete' requires supervisor or manager role. Your role: storekeeper"

**Validations Checked**:
- VAL-PCM-302: Role-based action permission

---

### Scenario 10: Concurrent Modification Conflict
**Objective**: Verify optimistic locking prevents lost updates

**Test Data**:
```typescript
// User A reads count
{
  updated_at: "2024-01-15T10:30:00Z"
}

// User B updates count
{
  updated_at: "2024-01-15T10:35:22Z"
}

// User A attempts update with stale timestamp
{
  updated_at: "2024-01-15T10:30:00Z"  // Stale
}
```

**Expected Result**: ❌ Error: "Conflict detected. This count was modified by Jane Smith at 2024-01-15 10:35:22. Please refresh and reapply your changes."

**Validations Checked**:
- VAL-PCM-304: Concurrent modification protection

---

## Validation Matrix

### Summary Table

| Validation ID | Category | Layer | Priority | Automated |
|--------------|----------|-------|----------|-----------|
| VAL-PCM-001 | Field | C,S,D | Critical | ✅ |
| VAL-PCM-002 | Field | C,S,D | Medium | ✅ |
| VAL-PCM-003 | Field | C,S,D | Critical | ✅ |
| VAL-PCM-004 | Field | C,S,D | High | ✅ |
| VAL-PCM-005 | Field | C,S,D | Critical | ✅ |
| VAL-PCM-006 | Field | C,S,D | High | ✅ |
| VAL-PCM-007 | Field | C,S,D | Low | ✅ |
| VAL-PCM-008 | Field | C,S,D | Low | ✅ |
| VAL-PCM-010 | Field | S,D | Critical | ✅ |
| VAL-PCM-011 | Field | C,S,D | Medium | ✅ |
| VAL-PCM-012 | Field | C,S,D | Critical | ✅ |
| VAL-PCM-013 | Field | C,S,D | Medium | ✅ |
| VAL-PCM-014 | Field | C,S,D | Critical | ✅ |
| VAL-PCM-015 | Calculated | S,D | High | ✅ |
| VAL-PCM-016 | Calculated | S,D | High | ✅ |
| VAL-PCM-017 | Field | C,S,D | High | ✅ |
| VAL-PCM-018 | Field | S,D | Critical | ✅ |
| VAL-PCM-019 | Field | S,D | High | ✅ |
| VAL-PCM-101 | Business | S,D | Critical | ✅ |
| VAL-PCM-102 | Business | S | Critical | ✅ |
| VAL-PCM-103 | Business | S | High | ✅ |
| VAL-PCM-104 | Business | S | Critical | ✅ |
| VAL-PCM-105 | Business | S | Critical | ✅ |
| VAL-PCM-106 | Business | S | Critical | ✅ |
| VAL-PCM-201 | Cross-Field | S | Critical | ✅ |
| VAL-PCM-202 | Cross-Field | C,S | High | ✅ |
| VAL-PCM-203 | Cross-Field | S | High | ✅ |
| VAL-PCM-204 | Cross-Field | S | Medium | ✅ |
| VAL-PCM-205 | Cross-Field | S | Critical | ✅ |
| VAL-PCM-301 | Security | S | Critical | ✅ |
| VAL-PCM-302 | Security | S | Critical | ✅ |
| VAL-PCM-303 | Security | S | High | ✅ |
| VAL-PCM-304 | Security | S | High | ✅ |

**Legend**:
- **Layer**: C=Client, S=Server, D=Database
- **Priority**: Critical, High, Medium, Low
- **Automated**: ✅ = Fully automated

### Enforcement Layer Details

| Validation Type | Client | Server | Database | Notes |
|----------------|--------|--------|----------|-------|
| Required Fields | ✅ | ✅ | ✅ | Three-layer defense |
| Format Validation | ✅ | ✅ | - | Client + Server |
| Range Validation | ✅ | ✅ | ✅ | Three-layer defense |
| Uniqueness | - | ✅ | ✅ | Server + Database |
| Business Rules | - | ✅ | - | Server only |
| Cross-Field | ✅ | ✅ | - | Client + Server |
| Security | - | ✅ | ✅ | Server + Database |
| Workflow | - | ✅ | - | Server only |

---

## Glossary

### Terms

- **Count Session**: A physical inventory count event for a specific location and time period
- **Count Detail**: Individual line items within a count session representing products being counted
- **Expected Quantity**: System-calculated quantity based on last inventory transaction closing balance
- **Actual Quantity**: Physical count performed by storekeeper
- **Variance**: Difference between expected and actual quantities (can be positive or negative)
- **High Variance**: Variance exceeding 5% or $500 threshold requiring supervisor approval
- **Adjustment Posting**: Creating inventory adjustment transaction to correct stock levels
- **Active Count**: Count session with status pending or in_progress
- **Soft Delete**: Marking record as deleted (deleted_at timestamp) without physical removal
- **Optimistic Locking**: Concurrency control using updated_at timestamp to detect conflicts

### Abbreviations

- **PCM**: Physical Count Management
- **UUID**: Universally Unique Identifier
- **RLS**: Row-Level Security
- **ACID**: Atomicity, Consistency, Isolation, Durability
- **ITS**: Inventory Transaction System

---

## References

- [Business Requirements](./BR-physical-count-management.md)
- [Use Cases](./UC-physical-count-management.md)
- [Technical Specification](./TS-physical-count-management.md)
- [Data Definition](./DD-physical-count-management.md)
- [Flow Diagrams](./FD-physical-count-management.md)
- [Prisma Schema](../../data-struc/schema.prisma)

---

**Document End**

> 📝 **Validation Coverage**: 33 validations across 4 categories (Field-Level: 18, Business Rules: 6, Cross-Field: 5, Security: 4)
>
> 📊 **Enforcement**: Client (15), Server (33), Database (18)
>
> ✅ **Automation**: 100% automated validation coverage
