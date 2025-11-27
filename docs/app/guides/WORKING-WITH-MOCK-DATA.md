# Working with Mock Data Guide

**Learn to use Carmen's mock data system** while the database is not yet connected.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Current Status

**Database Connection**: ❌ Not connected (planned)
**Data Source**: ✅ Mock JSON data in `lib/mock-data/`
**Data Persistence**: Browser state only (resets on refresh)

---

## Mock Data Organization

```
lib/mock-data/
├── index.ts              # Barrel export
├── users.ts              # Mock users, roles, departments
├── vendors.ts            # Mock vendors, contacts, addresses
├── inventory.ts          # Mock inventory items, stock levels
├── procurement.ts        # Mock purchase requests, orders
├── products.ts           # Mock products, categories, units
├── recipes.ts            # Mock recipes, ingredients
├── finance.ts            # Mock currencies, exchange rates
├── factories.ts          # Factory functions for creating mocks
└── test-scenarios/       # Complex test scenarios
```

---

## Basic Usage

**Import mock data**:
```typescript
import {
  mockUsers,
  mockVendors,
  mockInventoryItems,
  mockPurchaseRequests
} from '@/lib/mock-data'

// Use in components
const vendors = mockVendors
const activeVendors = mockVendors.filter(v => v.is_active)
```

---

## Factory Functions

**Purpose**: Create custom mock objects with defaults

**Example**:
```typescript
import {
  createMockVendor,
  createMockUser,
  createMockPurchaseRequest
} from '@/lib/mock-data/factories'

// Create with defaults
const vendor = createMockVendor()

// Create with overrides
const customVendor = createMockVendor({
  company_name: 'Custom Supplier Inc',
  is_active: true,
  email: 'contact@custom.com'
})

// Create user with specific role
const purchasingUser = createMockUser({
  role: 'purchasing-staff',
  department: 'procurement'
})
```

---

## Common Mock Data

**Users**:
```typescript
import { mockUsers } from '@/lib/mock-data'

const adminUser = mockUsers.find(u => u.role === 'admin')
const purchasingStaff = mockUsers.filter(u => u.role === 'purchasing-staff')
```

**Vendors**:
```typescript
import { mockVendors } from '@/lib/mock-data'

const activeVendors = mockVendors.filter(v => v.is_active)
const vendorWithId = mockVendors.find(v => v.id === vendorId)
```

---

## Creating Test Scenarios

**Location**: `lib/mock-data/test-scenarios/`

**Example scenario**:
```typescript
// test-scenarios/approval-workflow.ts
export const approvalWorkflowScenario = {
  users: [
    createMockUser({ id: 'requester-1', role: 'staff' }),
    createMockUser({ id: 'manager-1', role: 'department-manager' }),
    createMockUser({ id: 'finance-1', role: 'financial-manager' })
  ],
  purchaseRequest: createMockPurchaseRequest({
    requested_by_id: 'requester-1',
    status: 'SUBMITTED',
    total_amount: { amount: 5000, currency: 'USD' }
  }),
  approvals: [
    {
      id: 'approval-1',
      approved_by_id: 'manager-1',
      status: 'APPROVED'
    }
  ]
}
```

---

## Simulating CRUD Operations

**Current limitations**: No actual persistence, data resets on page refresh

**Pattern for "Creating" data**:
```typescript
// In component state
const [items, setItems] = useState(mockPurchaseRequests)

function handleCreate(newItem: PurchaseRequest) {
  setItems([...items, newItem])
  // Note: This only persists in component state
}
```

**Better pattern** (prepare for database):
```typescript
// Use Server Actions
'use server'

export async function createPurchaseRequest(data: PurchaseRequestInput) {
  // Currently: Just validate and return success
  const validated = schema.parse(data)

  // Future: await prisma.purchaseRequest.create({ data: validated })

  return {
    success: true,
    id: crypto.randomUUID()
  }
}
```

---

## Transitioning to Database

**When database is connected**, minimal changes needed:

**Before (Mock Data)**:
```typescript
import { mockPurchaseRequests } from '@/lib/mock-data'

export default function Page() {
  const requests = mockPurchaseRequests
  return <List requests={requests} />
}
```

**After (Database)**:
```typescript
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const requests = await prisma.purchaseRequest.findMany()
  return <List requests={requests} />
}
```

**Server Action - Before**:
```typescript
'use server'

export async function createItem(data: ItemInput) {
  const validated = schema.parse(data)
  // Mock: Just return success
  return { success: true, id: crypto.randomUUID() }
}
```

**Server Action - After**:
```typescript
'use server'

export async function createItem(data: ItemInput) {
  const validated = schema.parse(data)
  const item = await prisma.item.create({ data: validated })
  revalidatePath('/items')
  return { success: true, id: item.id }
}
```

---

## Best Practices

**✅ Do**:
- Use factory functions for test data
- Write code that works with both mock and real data
- Use Server Actions for mutations (even with mocks)
- Import from `@/lib/mock-data`

**❌ Don't**:
- Hardcode data in components
- Rely on mock data-specific features
- Skip validation because it's mock data
- Create duplicate mock data across files

---

## Related Documentation

- **[WORKING-WITH-TYPES.md](WORKING-WITH-TYPES.md)** - Type system
- **[DATABASE-SCHEMA-GUIDE.md](../DATABASE-SCHEMA-GUIDE.md)** - Database schema
- **[FORM-HANDLING.md](FORM-HANDLING.md)** - Form patterns

---

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **🚀 [Getting Started](GETTING-STARTED.md)**
