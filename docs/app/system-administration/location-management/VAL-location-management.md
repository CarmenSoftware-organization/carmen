# Validation Rules: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.1
- **Last Updated**: 2025-11-26
- **Status**: Active
- **Validation Library**: Zod 3.x
- **Form Library**: React Hook Form 7.x

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-26 | Documentation Team | Code compliance review - corrected code regex, removed fictional server-side validation |

## Overview

This document defines comprehensive validation rules for Location Management, focusing on client-side (Zod) validation as implemented in the current frontend-only architecture.

---

## Client-Side Validation (Zod Schema)

### Location Form Schema

**File**: `lib/types/location-management.ts`

```typescript
import { z } from 'zod'

const locationSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(10, 'Code must be 10 characters or less')
    .regex(/^[A-Z0-9-]+$/, 'Code must contain only uppercase letters, numbers, and hyphens')
    .trim(),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),

  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),

  type: z.enum(['inventory', 'direct', 'consignment'], {
    errorMap: () => ({ message: 'Please select a valid location type' })
  }),

  status: z.enum(['active', 'inactive', 'closed', 'pending_setup'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),

  physicalCountEnabled: z.boolean(),

  departmentId: z.string().optional(),

  costCenterId: z.string().optional(),

  consignmentVendorId: z.string().optional(),

  address: z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('Thailand')
  }).optional()
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
| Required | Client | Value must exist | "Code is required" |
| Min Length | Client | >= 1 character | "Code is required" |
| Max Length | Client | <= 10 characters | "Code must be 10 characters or less" |
| Format | Client | /^[A-Z0-9-]+$/ | "Code must contain only uppercase letters, numbers, and hyphens" |
| Whitespace | Client | Trim leading/trailing spaces | Auto-trimmed |

**Business Rules**:
- Code is entered during creation
- Code field is disabled in edit mode (read-only for existing locations)
- Code must be unique (checked against existing locations in mock data)
- Recommended format: 3-10 characters (e.g., "WH-001", "MAIN", "NYC001")

**Validation Examples**:

```typescript
// Valid codes
"WH-001"     // ✓ Uppercase with hyphen
"WAREHOUSE"  // ✓ Uppercase letters only
"LOC123"     // ✓ Uppercase with numbers
"MAIN"       // ✓ Short code
"A-B-C"      // ✓ Multiple hyphens allowed

// Invalid codes
"wh-001"             // ✗ Contains lowercase
"WH 001"             // ✗ Contains space
"WH_001"             // ✗ Contains underscore
"NYC-WAREHOUSE-001"  // ✗ Exceeds 10 characters
""                   // ✗ Empty
```

---

### VR-002: Location Name

**Field**: `name`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Value must exist | "Name is required" |
| Min Length | Client | >= 1 character | "Name is required" |
| Max Length | Client | <= 100 characters | "Name must be 100 characters or less" |
| Whitespace | Client | Trim leading/trailing spaces | Auto-trimmed |
| Not Empty | Client | After trim, length > 0 | "Name cannot be empty" |

**Business Rules**:
- Name must be descriptive and meaningful
- Should indicate location purpose or geographic area
- Can be updated at any time

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
| Required | Client | Value must exist | "Please select a valid location type" |
| Enum | Client | Must be: inventory, direct, or consignment | "Invalid location type" |

**Valid Values**:

```typescript
type InventoryLocationType = 'inventory' | 'direct' | 'consignment'

// inventory: Standard warehouses with full inventory tracking
// direct: Production/consumption areas with immediate expense
// consignment: Vendor-owned stock until consumed
```

**Business Rules**:
- Type determines inventory behavior throughout system
- Direct locations may bypass goods receipt processes
- Inventory locations require full stock-in/stock-out workflow
- Consignment locations track vendor ownership (should have vendor assigned)
- Physical count setting typically aligns with type:
  - inventory → true
  - direct → false
  - consignment → true

---

### VR-004: Status

**Field**: `status`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Value must exist | "Please select a valid status" |
| Enum | Client | Must be: active, inactive, closed, or pending_setup | "Invalid status" |

**Valid Values**:

```typescript
type LocationStatus = 'active' | 'inactive' | 'closed' | 'pending_setup'

// active: Operational location
// inactive: Temporarily not in use
// closed: Permanently closed
// pending_setup: Being configured
```

**Business Rules**:
- Active locations appear in dropdowns and operational screens
- Inactive/closed/pending locations may be hidden from new transactions
- Status changes do not require validation against other entities in current implementation

---

### VR-005: Physical Count Enabled

**Field**: `physicalCountEnabled`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Value must exist | Handled by boolean default |
| Type | Client | Must be boolean | Type error |

**Valid Values**:

```typescript
// true: Location requires periodic physical counts
// false: Location excluded from count schedules
```

**Business Rules**:
- Determines if location appears in physical count schedules
- Locations with true must participate in periodic counts
- Typically:
  - Inventory locations → true
  - Direct locations → false (consumption tracking only)
  - Consignment locations → true

---

### VR-006: Description

**Field**: `description`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Optional | Client | Can be empty | N/A |
| Max Length | Client | <= 500 characters | "Description must be 500 characters or less" |

---

### VR-007: Department

**Field**: `departmentId`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Optional | Client | Can be empty | N/A |
| Format | Client | Must be valid ID from dropdown | Controlled by select component |

---

### VR-008: Cost Center

**Field**: `costCenterId`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Optional | Client | Can be empty | N/A |
| Format | Client | Must be valid ID from dropdown | Controlled by select component |

---

### VR-009: Consignment Vendor

**Field**: `consignmentVendorId`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Conditional | Client | Should be set for consignment type | Warning only |
| Format | Client | Must be valid vendor ID from dropdown | Controlled by select component |

**Business Rules**:
- Only shown when type is "consignment"
- Should be set for proper ownership tracking
- Not strictly required (warning, not error)

---

## Shelf Validation

### SVR-001: Shelf Code

**Field**: `code`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Value must exist | "Shelf code is required" |
| Max Length | Client | <= 20 characters | "Shelf code must be 20 characters or less" |
| Format | Client | Uppercase alphanumeric | Applied via CSS class |

**Validation Examples**:

```typescript
// Valid shelf codes
"A1"        // ✓
"SHELF-01"  // ✓
"ZONE-A-R1" // ✓

// Invalid shelf codes
""          // ✗ Empty
"Very long shelf code that exceeds limit"  // ✗ > 20 chars
```

---

### SVR-002: Shelf Name

**Field**: `name`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Value must exist | "Shelf name is required" |

---

## User Assignment Validation

### UAV-001: User Selection

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | User must be selected | Controlled by form |
| Unique | Client | Same user cannot be assigned twice | Check against existing assignments |

---

### UAV-002: Role Selection

**Field**: `roleAtLocation`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Role must be selected | "Please select a role" |
| Enum | Client | Must be valid role | Controlled by select component |

**Valid Values**:

```typescript
type LocationRole =
  | 'location_manager'
  | 'inventory_controller'
  | 'receiver'
  | 'picker'
  | 'counter'
  | 'viewer'
```

---

### UAV-003: Primary Location

**Field**: `isPrimary`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Boolean | Client | Must be true or false | Controlled by checkbox |
| Unique | Client | User can have only one primary location | Warning or auto-unset previous |

---

## Product Assignment Validation

### PAV-001: Product Selection

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Product must be selected | Controlled by form |
| Unique | Client | Same product cannot be assigned twice | Check against existing assignments |

---

### PAV-002: Inventory Parameters

**Fields**: `minQuantity`, `maxQuantity`, `reorderPoint`, `parLevel`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Optional | Client | All parameters optional | N/A |
| Non-negative | Client | >= 0 if provided | "Value must be 0 or greater" |
| Logical | Client | min <= max if both provided | Warning only |
| Logical | Client | reorderPoint <= max if both provided | Warning only |

---

## Delivery Point Validation

### DPV-001: Name and Code

**Fields**: `name`, `code`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Required | Client | Both must exist | "Name/Code is required" |

---

### DPV-002: Address

**Fields**: `address`, `city`, `postalCode`, `country`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Address Required | Client | Must exist | "Address is required" |
| City Required | Client | Must exist | "City is required" |
| Postal Required | Client | Must exist | "Postal code is required" |
| Country Required | Client | Must exist (default: Thailand) | "Country is required" |

---

### DPV-003: Primary Delivery Point

**Field**: `isPrimary`

**Validation Rules**:

| Rule | Type | Validation | Error Message |
|------|------|------------|---------------|
| Boolean | Client | Must be true or false | Controlled by checkbox |
| Unique | Client | Location can have only one primary delivery point | Warning or auto-unset previous |

---

## Cross-Field Validation

### CV-001: Location Type and Physical Count Consistency

**Rule**: Physical count requirement should align with location type

**Validation**:

```typescript
const validateTypeAndPhysicalCount = (
  type: InventoryLocationType,
  physicalCountEnabled: boolean
): boolean => {
  const recommendations = {
    'inventory': true,
    'consignment': true,
    'direct': false
  }

  // Warning only, not error
  if (recommendations[type] !== physicalCountEnabled) {
    console.warn(`Physical count "${physicalCountEnabled}" is unusual for ${type} location type`)
  }

  return true // Allow but warn
}
```

---

### CV-002: Consignment Type and Vendor

**Rule**: Consignment type locations should have a vendor assigned

**Validation**:

```typescript
const validateConsignmentVendor = (
  type: InventoryLocationType,
  consignmentVendorId?: string
): { valid: boolean; warning?: string } => {
  if (type === 'consignment' && !consignmentVendorId) {
    return {
      valid: true, // Allow but warn
      warning: 'Consignment locations should have a vendor assigned for proper ownership tracking'
    }
  }

  return { valid: true }
}
```

---

## Deletion Validation

### DV-001: Cannot Delete Location with Products

**Rule**: Cannot delete location with assigned products

**Validation**:

```typescript
const canDeleteLocation = (location: InventoryLocation): {
  canDelete: boolean
  reason?: string
} => {
  if (location.assignedProductsCount > 0) {
    return {
      canDelete: false,
      reason: 'Cannot delete location with assigned products. Please remove product assignments first.'
    }
  }

  return { canDelete: true }
}
```

---

## Validation Error Messages

### Standard Error Format

```typescript
interface ValidationError {
  field: string
  message: string
}

// Example error display
{
  field: 'code',
  message: 'Code must contain only uppercase letters, numbers, and hyphens'
}
```

### User-Friendly Messages

| Validation | Technical Message | User-Friendly Message |
|------------|------------------|----------------------|
| Required field | "Code is required" | "Please enter a location code" |
| Invalid format | "Code must contain only uppercase letters, numbers, and hyphens" | "Location code can only use capital letters, numbers, and hyphens (e.g., WH-001)" |
| Max length | "Code must be 10 characters or less" | "Location code is too long (maximum 10 characters)" |
| Has products | "Cannot delete location with assigned products" | "This location has products assigned. Please remove them before deleting." |

---

## Form Integration

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<LocationFormData>({
  resolver: zodResolver(locationSchema),
  defaultValues: {
    code: '',
    name: '',
    type: 'inventory',
    status: 'active',
    physicalCountEnabled: true,
    description: '',
    address: {
      country: 'Thailand'
    }
  }
})
```

### Error Display Pattern

```tsx
<FormField
  control={form.control}
  name="code"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Location Code</FormLabel>
      <FormControl>
        <Input
          {...field}
          placeholder="e.g., WH-001"
          className="uppercase"
          maxLength={10}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Validation Summary

### Validation Layer

**Client-Side (Zod + React Hook Form)**:
- Immediate user feedback
- Field-level validation on blur
- Form-level validation on submit
- Real-time error display

### Validation Priorities

**High Priority** (Blocking):
- Required fields (code, name, type, status)
- Format validation (code regex)
- Length limits

**Medium Priority** (Warning):
- Type and physical count consistency
- Consignment vendor recommendation

**Low Priority** (Informational):
- Format recommendations
- Best practice suggestions
