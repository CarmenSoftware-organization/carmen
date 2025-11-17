# Naming Conventions

**Consistent naming standards** across Carmen ERP codebase.

---

## File Naming

### Directories

**Pattern**: `kebab-case`

```
✅ Good:
- purchase-requests/
- vendor-management/
- goods-received-notes/

❌ Bad:
- PurchaseRequests/
- vendor_management/
- goodsReceived/
```

### Component Files

**Pattern**: `PascalCase.tsx`

```
✅ Good:
- Sidebar.tsx
- PurchaseRequestList.tsx
- ItemDetail.tsx

❌ Bad:
- sidebar.tsx
- purchase-request-list.tsx
- item_detail.tsx
```

### Page Files

**Pattern**: `page.tsx` (Next.js App Router convention)

```
app/
├── (main)/
│   ├── procurement/
│   │   ├── purchase-requests/
│   │   │   ├── page.tsx              # List page
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Detail page
│   │   │   └── new/
│   │   │       └── page.tsx          # Create page
```

### Documentation Files

**Pattern**: `[TYPE]-[feature-name].md`

```
✅ Good:
- DD-purchase-requests.md
- BR-vendors.md
- TS-inventory-costing.md

❌ Bad:
- purchase-requests-dd.md
- VendorsBR.md
- inventory_costing_ts.md
```

---

## Code Naming

### Variables

**Pattern**: `camelCase`

```typescript
✅ Good:
const purchaseRequest = ...
const totalAmount = ...
const isActive = ...

❌ Bad:
const PurchaseRequest = ...
const total_amount = ...
const IsActive = ...
```

### Constants

**Pattern**: `SCREAMING_SNAKE_CASE`

```typescript
✅ Good:
const MAX_ITEMS_PER_PAGE = 50
const DEFAULT_CURRENCY = 'USD'
const API_BASE_URL = '...'

❌ Bad:
const maxItemsPerPage = 50
const defaultCurrency = 'USD'
```

### Functions

**Pattern**: `camelCase` with verb prefix

```typescript
✅ Good:
function getPurchaseRequests()
function createPurchaseOrder()
function validateInventoryItem()
function handleSubmit()
function isValidEmail()

❌ Bad:
function purchase_requests()
function CreateOrder()
function validation()
function submit()
```

---

## Type Naming

### Interfaces

**Pattern**: `PascalCase`

```typescript
✅ Good:
interface User { ... }
interface PurchaseRequest { ... }
interface VendorContact { ... }

❌ Bad:
interface user { ... }
interface IPurchaseRequest { ... }  // Don't use 'I' prefix
interface vendor_contact { ... }
```

### Types

**Pattern**: `PascalCase`

```typescript
✅ Good:
type DocumentStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED'
type Money = { amount: number; currency: string }

❌ Bad:
type documentStatus = ...
type TDocumentStatus = ...
```

### Enums

**Pattern**: `PascalCase` for enum, `SCREAMING_SNAKE_CASE` for values

```typescript
✅ Good:
enum DocumentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED'
}

❌ Bad:
enum document_status { ... }
enum DocumentStatus {
  draft = 'draft',  // Should be DRAFT
  Submitted = 'Submitted'  // Should be SUBMITTED
}
```

---

## Component Naming

### Components

**Pattern**: `PascalCase` with descriptive name

```typescript
✅ Good:
function PurchaseRequestList() { ... }
function VendorDetailCard() { ... }
function StatusBadge() { ... }

❌ Bad:
function List() { ... }  // Too generic
function vendorCard() { ... }  // Not PascalCase
function prDetail() { ... }  // Unclear abbreviation
```

### Component Props

**Pattern**: `ComponentNameProps`

```typescript
✅ Good:
interface PurchaseRequestListProps {
  requests: PurchaseRequest[]
}

interface StatusBadgeProps {
  status: DocumentStatus
}

❌ Bad:
interface Props { ... }  // Too generic
interface ListProps { ... }  // Not specific enough
```

---

## Database Naming

### Table Names

**Pattern**: `tb_snake_case`

```sql
✅ Good:
- tb_purchase_request
- tb_vendor_contact
- tb_inventory_item

❌ Bad:
- PurchaseRequest
- vendorContact
- tb-inventory-item
```

### Column Names

**Pattern**: `snake_case`

```sql
✅ Good:
- request_number
- total_amount
- created_at

❌ Bad:
- requestNumber
- totalAmount
- createdAt
```

### Enum Types

**Pattern**: `enum_table_field`

```sql
✅ Good:
- enum_purchase_request_status
- enum_vendor_type
- enum_inventory_transaction_type

❌ Bad:
- pr_status
- VendorType
- enum-transaction-type
```

---

## API & Route Naming

### API Routes

**Pattern**: `kebab-case` (RESTful)

```
✅ Good:
GET  /api/purchase-requests
POST /api/purchase-requests
GET  /api/purchase-requests/:id
PUT  /api/purchase-requests/:id

❌ Bad:
GET  /api/PurchaseRequests
POST /api/purchase_requests
GET  /api/pr/:id  // Unclear abbreviation
```

### Server Actions

**Pattern**: `camelCase` with action verb

```typescript
✅ Good:
async function createPurchaseRequest(data) { ... }
async function updateVendor(id, data) { ... }
async function deletePurchaseOrder(id) { ... }

❌ Bad:
async function purchase_request(data) { ... }
async function vendor(id, data) { ... }
async function remove(id) { ... }  // Too generic
```

---

## Hook Naming

**Pattern**: `use` + `PascalCase`

```typescript
✅ Good:
function usePurchaseRequests() { ... }
function useVendorForm() { ... }
function useInventoryCalculation() { ... }

❌ Bad:
function getPurchaseRequests() { ... }  // Missing 'use' prefix
function usepr() { ... }  // Unclear abbreviation
function use_vendor_form() { ... }  // Not camelCase
```

---

## Boolean Naming

**Pattern**: `is/has/can` + adjective/noun

```typescript
✅ Good:
const isActive = true
const hasPermission = false
const canEdit = true
const isLoading = false

❌ Bad:
const active = true  // Unclear type
const permission = false  // Unclear type
const edit = true  // Unclear
```

---

## Event Handler Naming

**Pattern**: `handle` + event type

```typescript
✅ Good:
function handleSubmit(event) { ... }
function handleChange(event) { ... }
function handleDelete(id) { ... }

❌ Bad:
function onSubmit(event) { ... }  // Reserve 'on' for props
function submit(event) { ... }  // Not descriptive
function deleteHandler(id) { ... }  // Suffix not prefix
```

---

## Common Abbreviations (Allowed)

**Standard abbreviations**:
- `id` - identifier
- `qty` - quantity
- `amt` - amount
- `grn` - goods received note
- `po` - purchase order
- `pr` - purchase request
- `rfp` - request for pricing

**Use sparingly and only when widely understood in context**

---

## Quick Reference

| Element | Convention | Example |
|---------|------------|---------|
| **Directories** | kebab-case | `purchase-requests/` |
| **Components** | PascalCase.tsx | `PurchaseRequestList.tsx` |
| **Variables** | camelCase | `totalAmount` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_ITEMS` |
| **Functions** | camelCase + verb | `getPurchaseRequests()` |
| **Interfaces** | PascalCase | `interface User` |
| **Tables** | tb_snake_case | `tb_purchase_request` |
| **Columns** | snake_case | `total_amount` |
| **Hooks** | use + PascalCase | `usePurchaseRequests()` |
| **Booleans** | is/has/can + word | `isActive` |
| **Event Handlers** | handle + event | `handleSubmit` |

---

## Related Documentation

- **[COMPONENT-PATTERNS.md](../guides/COMPONENT-PATTERNS.md)** - Component best practices
- **[WORKING-WITH-TYPES.md](../guides/WORKING-WITH-TYPES.md)** - Type system
- **[DATABASE-SCHEMA-GUIDE.md](../DATABASE-SCHEMA-GUIDE.md)** - Database schema

---

**🏠 [Back to Wiki](../WIKI-HOME.md)**
