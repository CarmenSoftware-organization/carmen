# Working with Types Guide

**Master Carmen's centralized type system** for type-safe development.

---

## Core Principle

**ALWAYS** import types from `lib/types/` - never create duplicate types in module directories.

```typescript
// ✅ Correct
import { User, Vendor, PurchaseRequest } from '@/lib/types'

// ❌ Wrong
interface User { ... }  // Don't define types locally
```

---

## Type System Organization

**Location**: `lib/types/`

```
lib/types/
├── index.ts              # Barrel export (import from here)
├── common.ts             # Shared types (Money, DocumentStatus)
├── user.ts               # User, Role, Department, Location
├── inventory.ts          # Inventory items, stock, costing
├── procurement.ts        # Purchase requests, orders, GRN
├── vendor.ts             # Vendor profiles, price lists
├── product.ts            # Products, categories, units
├── recipe.ts             # Recipes, ingredients
├── finance.ts            # Currencies, exchange rates
├── guards.ts             # Type guard functions
├── converters.ts         # Type conversion utilities
└── validators.ts         # Validation functions
```

---

## Common Types

**Money Type**:
```typescript
interface Money {
  amount: number
  currency: string  // ISO 4217: USD, EUR, GBP
}

// Usage
const price: Money = { amount: 100.50, currency: 'USD' }
```

**Document Status**:
```typescript
type DocumentStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'
```

**Audit Fields**:
```typescript
interface AuditFields {
  created_at: Date
  created_by: string
  updated_at: Date
  updated_by: string
}
```

---

## Domain Types Examples

**Purchase Request**:
```typescript
interface PurchaseRequest extends AuditFields {
  id: string
  request_number: string
  request_date: Date
  status: DocumentStatus
  department_id: string
  requested_by_id: string
  total_amount: Money
  notes?: string

  // Relations
  department?: Department
  requested_by?: User
  items?: PurchaseRequestDetail[]
  approvals?: Approval[]
}
```

**Vendor**:
```typescript
interface Vendor extends AuditFields {
  id: string
  company_name: string
  tax_id: string
  email: string
  phone: string
  website?: string
  is_active: boolean

  // Relations
  contacts?: VendorContact[]
  addresses?: VendorAddress[]
  price_lists?: PriceList[]
}
```

---

## Type Guards

**Purpose**: Runtime type checking

**Location**: `lib/types/guards.ts`

**Usage**:
```typescript
import { isUser, isPurchaseRequest } from '@/lib/types/guards'

function processData(data: unknown) {
  if (isUser(data)) {
    // TypeScript knows data is User
    console.log(data.email)
  }

  if (isPurchaseRequest(data)) {
    // TypeScript knows data is PurchaseRequest
    console.log(data.request_number)
  }
}
```

**Example Implementation**:
```typescript
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'email' in value &&
    'first_name' in value &&
    'last_name' in value
  )
}
```

---

## Type Converters

**Purpose**: Transform data between types

**Location**: `lib/types/converters.ts`

**Example**:
```typescript
export function purchaseRequestToPurchaseOrder(
  request: PurchaseRequest
): Omit<PurchaseOrder, 'id' | 'created_at'> {
  return {
    purchase_request_id: request.id,
    vendor_id: '', // To be filled
    order_number: generateOrderNumber(),
    order_date: new Date(),
    status: 'DRAFT',
    total_amount: request.total_amount,
    items: request.items?.map(convertRequestItem) || []
  }
}
```

---

## Validators

**Purpose**: Business rule validation

**Location**: `lib/types/validators.ts`

**Example**:
```typescript
export function validatePurchaseRequest(
  request: PurchaseRequest
): ValidationResult {
  const errors: string[] = []

  if (request.items.length === 0) {
    errors.push('At least one item is required')
  }

  if (request.total_amount.amount <= 0) {
    errors.push('Total amount must be greater than zero')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

---

## Working with Form Types

**Zod Schema to Type**:
```typescript
import { z } from 'zod'

const purchaseRequestSchema = z.object({
  request_date: z.date(),
  department_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_id: z.string().uuid()
  })).min(1)
})

// Infer TypeScript type from Zod schema
type PurchaseRequestInput = z.infer<typeof purchaseRequestSchema>
```

**Use in Forms**:
```typescript
const form = useForm<PurchaseRequestInput>({
  resolver: zodResolver(purchaseRequestSchema)
})
```

---

## Type Safety Best Practices

**✅ Do**:
```typescript
// Use strict types
const user: User = await getUser(id)

// Use type guards for unknown data
if (isUser(data)) {
  processUser(data)
}

// Use Zod for runtime validation
const validated = schema.parse(input)
```

**❌ Don't**:
```typescript
// Don't use 'any'
const data: any = await fetch()  // ❌

// Don't cast without validation
const user = data as User  // ❌

// Don't define duplicate types
interface User { ... }  // ❌ Use lib/types/user.ts
```

---

## Utility Types

**Partial Updates**:
```typescript
type UpdateUser = Partial<Omit<User, 'id' | 'created_at'>>
```

**Required Fields**:
```typescript
type CreateUser = Required<Pick<User, 'email' | 'first_name' | 'last_name'>>
```

**Pick Specific Fields**:
```typescript
type UserBasicInfo = Pick<User, 'id' | 'email' | 'first_name' | 'last_name'>
```

**Omit Fields**:
```typescript
type UserWithoutPassword = Omit<User, 'password_hash'>
```

---

## Related Documentation

- **[WORKING-WITH-MOCK-DATA.md](WORKING-WITH-MOCK-DATA.md)** - Mock data usage
- **[FORM-HANDLING.md](FORM-HANDLING.md)** - Form patterns
- **[COMPONENT-PATTERNS.md](COMPONENT-PATTERNS.md)** - Component best practices
- **[ARCHITECTURE-OVERVIEW.md](../ARCHITECTURE-OVERVIEW.md)** - System architecture

---

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **🚀 [Getting Started](GETTING-STARTED.md)** | **📚 [Full Onboarding](../DEVELOPER-ONBOARDING.md)**
