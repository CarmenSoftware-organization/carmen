# Validation Rules: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.0
- **Last Updated**: 2025-01-16
- **Status**: Active
- **Validation Library**: Zod 3.x
- **Form Library**: React Hook Form 7.x

## Overview

This document defines comprehensive validation rules for Location Management, including client-side (Zod), server-side, and database-level validations.

---

## Client-Side Validation (Zod Schema)

### Location Form Schema

**File**: `components/location-detail-form.tsx`, `components/location-edit-form.tsx`

```typescript
import { z } from 'zod'

const locationSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(10, 'Code must be 10 characters or less')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers')
    .trim(),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),

  type: z.enum(['Direct', 'Inventory', 'Consignment'], {
    errorMap: () => ({ message: 'Please select a valid location type' })
  }),

  eop: z.enum(['true', 'false'], {
    errorMap: () => ({ message: 'Please select physical count requirement' })
  }),

  deliveryPoint: z.string()
    .min(1, 'Delivery point is required')
    .max(50, 'Delivery point must be 50 characters or less')
    .trim(),

  isActive: z.boolean()
})

type LocationFormData = z.infer<typeof locationSchema>
```

---

## Field-Level Validation Rules

### VR-001: Location Code

**Field**: `code`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client & Server | Value must exist | "Code is required" |
| Min Length | Client & Server | >= 1 character | "Code is required" |
| Max Length | Client & Server | <= 10 characters | "Code must be 10 characters or less" |
| Format | Client & Server | /^[A-Z0-9]+$/ | "Code must contain only uppercase letters and numbers" |
| Uniqueness | Server & DB | Unique across active locations | "Location code already exists" |
| Immutability | Client & Server | Cannot change after creation | Field disabled for existing locations |
| Whitespace | Client & Server | Trim leading/trailing spaces | Auto-trimmed |

**Business Rules**:
- Code is auto-generated or manually entered during creation
- Once created, code field is disabled in edit mode
- Code must be unique among non-deleted locations
- Recommended format: 3-10 characters (e.g., NYC001, LA-WAREHOUSE)

**Validation Examples**:

```typescript
// Valid codes
"NYC001"    // ✓
"WAREHOUSE" // ✓
"LOC123"    // ✓
"MAIN"      // ✓

// Invalid codes
"nyc001"             // ✗ Contains lowercase
"NYC 001"            // ✗ Contains space
"NYC-WAREHOUSE-001"  // ✗ Exceeds 10 characters
""                   // ✗ Empty
"NYC_001"            // ✗ Contains underscore
```

---

### VR-002: Location Name

**Field**: `name`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client & Server | Value must exist | "Name is required" |
| Min Length | Client & Server | >= 1 character | "Name is required" |
| Max Length | Client & Server | <= 100 characters | "Name must be 100 characters or less" |
| Uniqueness | Server & DB | Unique across active locations | "Location name already exists" |
| Whitespace | Client & Server | Trim leading/trailing spaces | Auto-trimmed |
| Not Empty | Client & Server | After trim, length > 0 | "Name cannot be empty" |

**Business Rules**:
- Name must be descriptive and meaningful
- Should indicate location purpose or geographic area
- Can be updated at any time (if no constraints)
- Must remain unique across all active locations

**Validation Examples**:

```typescript
// Valid names
"New York Central Kitchen"           // ✓
"Los Angeles Distribution Center"   // ✓
"Miami Seafood Processing"          // ✓
"Main Warehouse - Building A"       // ✓

// Invalid names
""                                  // ✗ Empty
"   "                              // ✗ Only whitespace
"A very long location name that exceeds the maximum character limit of one hundred characters and therefore is invalid"  // ✗ > 100 chars
```

---

### VR-003: Location Type

**Field**: `type`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client & Server | Value must exist | "Please select a valid location type" |
| Enum | Client & Server | Must be: Direct, Inventory, or Consignment | "Invalid location type" |
| Immutability | Server | Cannot change if transactions exist | "Cannot change type: location has existing transactions" |

**Valid Values**:

```typescript
type LocationType = 'Direct' | 'Inventory' | 'Consignment'

// Direct: Production/consumption areas, bypass stock-in
// Inventory: Standard warehouses with full tracking
// Consignment: Vendor-owned stock until consumed
```

**Business Rules**:
- Type determines inventory behavior throughout system
- Direct locations bypass goods receipt processes
- Inventory locations require full stock-in/stock-out workflow
- Consignment locations track vendor ownership
- Once transactions exist, type cannot be changed
- Physical count requirement typically depends on type:
  - Inventory → Yes
  - Direct → No
  - Consignment → Yes

**Validation Logic**:

```typescript
// Server-side type change validation
async function canChangeLocationType(locationId: string): Promise<boolean> {
  const transactionCount = await prisma.tb_stock_transaction.count({
    where: {
      location_id: locationId,
      deleted_at: null
    }
  })

  return transactionCount === 0
}
```

---

### VR-004: Physical Count (EOP)

**Field**: `eop` (End of Period / Physical Count Required)

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client & Server | Value must exist | "Please select physical count requirement" |
| Enum | Client & Server | Must be: 'true' or 'false' | "Invalid physical count selection" |

**Valid Values**:

```typescript
type PhysicalCountType = 'true' | 'false'

// 'true': Location requires periodic physical counts
// 'false': Location excluded from count schedules
```

**Business Rules**:
- Determines if location appears in stock count schedules
- Locations with 'true' must participate in periodic counts
- Locations with 'false' cannot be selected for physical counts
- Typically:
  - Inventory locations → 'true'
  - Direct locations → 'false' (consumption tracking only)
  - Consignment locations → 'true'

---

### VR-005: Delivery Point

**Field**: `deliveryPoint`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client & Server | Value must exist | "Delivery point is required" |
| Min Length | Client & Server | >= 1 character | "Delivery point is required" |
| Max Length | Client & Server | <= 50 characters | "Delivery point must be 50 characters or less" |
| Whitespace | Client & Server | Trim leading/trailing spaces | Auto-trimmed |

**Business Rules**:
- Identifies where goods should be delivered
- Used on purchase orders and GRN documents
- Can be updated at any time
- Future enhancement: Link to tb_delivery_point table

**Future Enhancement**:

```typescript
// When integrated with tb_delivery_point
const schema = z.object({
  deliveryPointId: z.string()
    .uuid('Invalid delivery point ID')
    .refine(async (id) => {
      const dp = await prisma.tb_delivery_point.findUnique({
        where: { id, is_active: true, deleted_at: null }
      })
      return !!dp
    }, 'Selected delivery point is not active')
})
```

---

### VR-006: Active Status

**Field**: `isActive`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client & Server | Value must exist | Handled by boolean default |
| Type | Client & Server | Must be boolean | Type error |
| Constraint | Server | Cannot deactivate if has active stock | "Cannot deactivate location with active inventory" |

**Business Rules**:
- Active locations appear in dropdowns and operational screens
- Inactive locations hidden from new transactions
- Historical transactions remain visible with inactive locations
- Cannot deactivate location with active inventory balances
- Reactivation allowed if no business rule violations

**Validation Logic**:

```typescript
async function canDeactivateLocation(locationId: string): Promise<{
  canDeactivate: boolean
  reason?: string
}> {
  // Check active inventory
  const activeStock = await prisma.tb_inventory_item.count({
    where: {
      location_id: locationId,
      quantity_on_hand: { gt: 0 },
      deleted_at: null
    }
  })

  if (activeStock > 0) {
    return {
      canDeactivate: false,
      reason: "Location has active inventory balances"
    }
  }

  // Check open transactions
  const openTransactions = await prisma.tb_stock_transaction.count({
    where: {
      location_id: locationId,
      status: { in: ['pending', 'in_progress'] },
      deleted_at: null
    }
  })

  if (openTransactions > 0) {
    return {
      canDeactivate: false,
      reason: "Location has open stock transactions"
    }
  }

  return { canDeactivate: true }
}
```

---

## Cross-Field Validation

### CV-001: Location Type and Physical Count Consistency

**Rule**: Physical count requirement should align with location type

**Validation**:

```typescript
const validateTypeAndPhysicalCount = (type: LocationType, eop: string): boolean => {
  const recommendations = {
    'Inventory': 'true',
    'Consignment': 'true',
    'Direct': 'false'
  }

  // Warning only, not error
  if (recommendations[type] !== eop) {
    console.warn(`Physical count "${eop}" is unusual for ${type} location type`)
  }

  return true // Allow but warn
}
```

**Business Rule**: While system allows any combination, best practices suggest:
- Inventory → Physical Count = Yes
- Consignment → Physical Count = Yes
- Direct → Physical Count = No

---

### CV-002: Active Status and Stock Balance

**Rule**: Cannot deactivate location with active stock

**Validation** (Server-side):

```typescript
const validateActiveStatusChange = async (
  locationId: string,
  newIsActive: boolean,
  currentIsActive: boolean
): Promise<{ valid: boolean; error?: string }> => {
  // Only validate when changing from active to inactive
  if (currentIsActive && !newIsActive) {
    const result = await canDeactivateLocation(locationId)
    if (!result.canDeactivate) {
      return { valid: false, error: result.reason }
    }
  }

  return { valid: true }
}
```

---

## User Assignment Validation

### UV-001: User Existence

**Rule**: All assigned users must exist and be active

**Validation** (Server-side):

```typescript
const validateUserAssignments = async (userIds: string[]): Promise<{
  valid: boolean
  invalidUsers?: string[]
}> => {
  const users = await prisma.tb_user_profile.findMany({
    where: {
      id: { in: userIds },
      deleted_at: null
    },
    select: { id: true }
  })

  const foundIds = users.map(u => u.id)
  const invalidUsers = userIds.filter(id => !foundIds.includes(id))

  return {
    valid: invalidUsers.length === 0,
    invalidUsers: invalidUsers.length > 0 ? invalidUsers : undefined
  }
}
```

### UV-002: Duplicate Prevention

**Rule**: Same user cannot be assigned to location twice

**Database Constraint**:

```sql
CREATE UNIQUE INDEX idx_user_location_unique
ON tb_user_location(user_id, location_id)
WHERE deleted_at IS NULL;
```

**Application Validation**:

```typescript
const validateNoDuplicateAssignments = (
  newUserIds: string[],
  existingUserIds: string[]
): { valid: boolean; duplicates?: string[] } => {
  const duplicates = newUserIds.filter(id => existingUserIds.includes(id))

  return {
    valid: duplicates.length === 0,
    duplicates: duplicates.length > 0 ? duplicates : undefined
  }
}
```

---

## Product Assignment Validation (Future)

### PV-001: Product Existence

**Rule**: All assigned products must exist and be active

**Validation** (Server-side):

```typescript
const validateProductAssignments = async (productIds: string[]): Promise<{
  valid: boolean
  invalidProducts?: string[]
}> => {
  const products = await prisma.tb_product.findMany({
    where: {
      id: { in: productIds },
      is_active: true,
      deleted_at: null
    },
    select: { id: true }
  })

  const foundIds = products.map(p => p.id)
  const invalidProducts = productIds.filter(id => !foundIds.includes(id))

  return {
    valid: invalidProducts.length === 0,
    invalidProducts: invalidProducts.length > 0 ? invalidProducts : undefined
  }
}
```

---

## Deletion Validation

### DV-001: No Active Stock

**Rule**: Cannot delete location with inventory balances

**Validation** (Server-side):

```typescript
const validateNoActiveStock = async (locationId: string): Promise<{
  canDelete: boolean
  reason?: string
  stockCount?: number
}> => {
  const stockCount = await prisma.tb_inventory_item.aggregate({
    where: {
      location_id: locationId,
      quantity_on_hand: { gt: 0 },
      deleted_at: null
    },
    _sum: { quantity_on_hand: true },
    _count: true
  })

  if (stockCount._count > 0) {
    return {
      canDelete: false,
      reason: "Location has active inventory",
      stockCount: stockCount._count
    }
  }

  return { canDelete: true }
}
```

### DV-002: No Open Transactions

**Rule**: Cannot delete location with pending/open transactions

**Validation** (Server-side):

```typescript
const validateNoOpenTransactions = async (locationId: string): Promise<{
  canDelete: boolean
  reason?: string
  transactionCount?: number
}> => {
  const transactionCount = await prisma.tb_stock_transaction.count({
    where: {
      location_id: locationId,
      status: { in: ['pending', 'in_progress', 'approved'] },
      deleted_at: null
    }
  })

  if (transactionCount > 0) {
    return {
      canDelete: false,
      reason: "Location has open stock transactions",
      transactionCount
    }
  }

  return { canDelete: true }
}
```

### DV-003: No Pending Requisitions

**Rule**: Cannot delete location with pending requisitions (from or to)

**Validation** (Server-side):

```typescript
const validateNoPendingRequisitions = async (locationId: string): Promise<{
  canDelete: boolean
  reason?: string
}> => {
  const requisitionCount = await prisma.tb_store_requisition.count({
    where: {
      OR: [
        { from_location_id: locationId },
        { to_location_id: locationId }
      ],
      status: { in: ['pending', 'approved', 'in_progress'] },
      deleted_at: null
    }
  })

  if (requisitionCount > 0) {
    return {
      canDelete: false,
      reason: "Location has pending requisitions"
    }
  }

  return { canDelete: true }
}
```

---

## Server-Side Validation

### Complete Location Validation Function

```typescript
import { z } from 'zod'

const serverLocationSchema = locationSchema.extend({
  id: z.string().uuid().optional(),
  delivery_point_id: z.string().uuid().optional(),
  created_by_id: z.string().uuid(),
  updated_by_id: z.string().uuid()
})

async function validateLocation(
  data: z.infer<typeof serverLocationSchema>,
  isUpdate: boolean = false
): Promise<{ valid: boolean; errors?: Record<string, string> }> {
  const errors: Record<string, string> = {}

  // 1. Schema validation
  try {
    serverLocationSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        errors[err.path.join('.')] = err.message
      })
    }
  }

  // 2. Uniqueness validation
  if (!isUpdate || data.name) {
    const existingName = await prisma.tb_location.findFirst({
      where: {
        name: data.name,
        id: { not: data.id },
        deleted_at: null
      }
    })

    if (existingName) {
      errors.name = 'Location name already exists'
    }
  }

  if (!isUpdate) {
    const existingCode = await prisma.tb_location.findFirst({
      where: {
        code: data.code,
        deleted_at: null
      }
    })

    if (existingCode) {
      errors.code = 'Location code already exists'
    }
  }

  // 3. Delivery point validation
  if (data.delivery_point_id) {
    const deliveryPoint = await prisma.tb_delivery_point.findUnique({
      where: { id: data.delivery_point_id }
    })

    if (!deliveryPoint || !deliveryPoint.is_active || deliveryPoint.deleted_at) {
      errors.delivery_point_id = 'Selected delivery point is not active'
    }
  }

  // 4. Type change validation (for updates)
  if (isUpdate && data.type) {
    const canChange = await canChangeLocationType(data.id!)
    if (!canChange) {
      errors.type = 'Cannot change location type: location has existing transactions'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined
  }
}
```

---

## Database Constraints

### Table Constraints

```sql
-- Location table constraints
ALTER TABLE tb_location
  ADD CONSTRAINT check_name_not_empty
  CHECK (LENGTH(TRIM(name)) > 0);

ALTER TABLE tb_location
  ADD CONSTRAINT check_code_format
  CHECK (code ~ '^[A-Z0-9]+$');

ALTER TABLE tb_location
  ADD CONSTRAINT check_code_length
  CHECK (LENGTH(code) >= 1 AND LENGTH(code) <= 10);

-- Unique constraints
CREATE UNIQUE INDEX idx_location_name_unique
  ON tb_location(name)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_location_code_unique
  ON tb_location(code)
  WHERE deleted_at IS NULL;

-- User-location constraints
CREATE UNIQUE INDEX idx_user_location_unique
  ON tb_user_location(user_id, location_id)
  WHERE deleted_at IS NULL;

-- Foreign key constraints
ALTER TABLE tb_location
  ADD CONSTRAINT fk_location_delivery_point
  FOREIGN KEY (delivery_point_id)
  REFERENCES tb_delivery_point(id)
  ON DELETE SET NULL;

ALTER TABLE tb_user_location
  ADD CONSTRAINT fk_user_location_user
  FOREIGN KEY (user_id)
  REFERENCES tb_user_profile(id)
  ON DELETE CASCADE;

ALTER TABLE tb_user_location
  ADD CONSTRAINT fk_user_location_location
  FOREIGN KEY (location_id)
  REFERENCES tb_location(id)
  ON DELETE CASCADE;
```

---

## Validation Error Messages

### Standard Error Format

```typescript
interface ValidationError {
  field: string
  message: string
  code: string
  details?: Record<string, any>
}

// Example error responses
{
  field: 'code',
  message: 'Location code already exists',
  code: 'DUPLICATE_CODE',
  details: { existingId: 'uuid-here' }
}

{
  field: 'isActive',
  message: 'Cannot deactivate location with active inventory',
  code: 'HAS_ACTIVE_STOCK',
  details: { stockCount: 45 }
}
```

### User-Friendly Messages

| Validation | Technical Message | User-Friendly Message |
|------------|------------------|----------------------|
| Required field | "Code is required" | "Please enter a location code" |
| Duplicate code | "DUPLICATE_CODE" | "This location code is already in use" |
| Invalid format | "Code must contain only uppercase letters and numbers" | "Location code can only use capital letters and numbers (e.g., NYC001)" |
| Has stock | "HAS_ACTIVE_STOCK" | "Cannot delete this location because it currently has inventory. Please transfer the stock first." |
| Open transactions | "HAS_OPEN_TRANSACTIONS" | "Cannot delete this location because it has pending transactions. Please complete or cancel them first." |

---

## Validation Testing

### Unit Test Examples

```typescript
describe('Location Validation', () => {
  describe('Code validation', () => {
    it('should accept valid uppercase alphanumeric code', () => {
      const result = locationSchema.safeParse({ code: 'NYC001', /* ... */ })
      expect(result.success).toBe(true)
    })

    it('should reject code with lowercase', () => {
      const result = locationSchema.safeParse({ code: 'nyc001', /* ... */ })
      expect(result.success).toBe(false)
      expect(result.error?.errors[0].message).toContain('uppercase')
    })

    it('should reject code exceeding 10 characters', () => {
      const result = locationSchema.safeParse({ code: 'VERYLONGCODE123', /* ... */ })
      expect(result.success).toBe(false)
    })
  })

  describe('Name validation', () => {
    it('should accept valid location name', () => {
      const result = locationSchema.safeParse({ name: 'Central Kitchen', /* ... */ })
      expect(result.success).toBe(true)
    })

    it('should trim whitespace', () => {
      const result = locationSchema.safeParse({ name: '  Central Kitchen  ', /* ... */ })
      expect(result.data?.name).toBe('Central Kitchen')
    })

    it('should reject empty name', () => {
      const result = locationSchema.safeParse({ name: '', /* ... */ })
      expect(result.success).toBe(false)
    })
  })
})
```

---

## Validation Summary

### Validation Layers

1. **Client-Side (Zod + React Hook Form)**:
   - Immediate user feedback
   - Field-level validation on blur
   - Form-level validation on submit
   - Real-time error display

2. **Server-Side (API Routes)**:
   - Same Zod schema validation
   - Business rule validation
   - Database uniqueness checks
   - Cross-entity validation

3. **Database-Level (PostgreSQL)**:
   - Data type enforcement
   - Unique constraints
   - Foreign key constraints
   - Check constraints
   - Trigger-based validation

### Validation Priorities

**High Priority** (Blocking):
- Required fields (code, name, type, eop, deliveryPoint)
- Uniqueness (code, name)
- Type immutability (if transactions exist)

**Medium Priority** (Warning):
- Type and physical count consistency
- Delivery point format

**Low Priority** (Informational):
- Name length suggestions
- Code format recommendations
