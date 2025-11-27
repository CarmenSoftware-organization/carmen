# Understanding Module Structure

**Learn Carmen's consistent module organization** to navigate and extend the codebase effectively.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Standard Module Structure

```
module-name/
├── sub-module/
│   ├── page.tsx                    # List view (Server Component)
│   ├── [id]/
│   │   └── page.tsx                # Detail view
│   ├── new/
│   │   └── page.tsx                # Create form
│   ├── [id]/edit/
│   │   └── page.tsx                # Edit form (optional)
│   ├── components/                 # Module-specific components
│   │   ├── ItemList.tsx
│   │   ├── ItemDetail.tsx
│   │   ├── ItemForm.tsx
│   │   └── ItemFilters.tsx
│   ├── hooks/                      # Module-specific hooks (optional)
│   │   └── useItems.ts
│   ├── actions.ts                  # Server actions
│   └── constants.ts                # Module constants (optional)
```

---

## Module Organization

**8 Main Modules**:
1. `dashboard/` - Overview and metrics
2. `finance/` - Multi-currency, exchange rates
3. `inventory-management/` - Stock, costing, adjustments
4. `procurement/` - Purchase requests, orders, GRN
5. `vendor-management/` - Vendors, price lists, RFPs
6. `product-management/` - Products, categories, units
7. `store-operations/` - Requisitions, replenishment, wastage
8. `operational-planning/` - Recipes, menu engineering

---

## Procurement Module Example

```
procurement/
├── purchase-requests/
│   ├── page.tsx                    # List all requests
│   ├── [id]/
│   │   └── page.tsx                # View request details
│   ├── new/
│   │   └── page.tsx                # Create new request
│   ├── components/
│   │   ├── PurchaseRequestList.tsx
│   │   ├── PurchaseRequestDetail.tsx
│   │   ├── PurchaseRequestForm.tsx
│   │   └── ItemsTable.tsx
│   ├── actions.ts                  # createRequest, updateRequest
│   └── pages/                      # Page content docs
│       ├── PC-list-page.md
│       ├── PC-create-form.md
│       └── PC-detail-page.md
│
├── purchase-orders/
│   ├── page.tsx
│   ├── [id]/page.tsx
│   └── ...
│
├── goods-received-notes/
│   ├── page.tsx
│   ├── [id]/page.tsx
│   └── ...
│
└── my-approvals/
    ├── page.tsx
    └── ...
```

---

## File Responsibilities

### page.tsx (List View)

**Purpose**: Display paginated, filterable, sortable list

**Pattern**:
```typescript
export default function ItemsPage() {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({...})

  const filteredItems = useMemo(() => {
    return items.filter(...).sort(...)
  }, [items, search, sortConfig])

  return (
    <div className="space-y-4">
      <SearchBar />
      <DataTable data={filteredItems} />
    </div>
  )
}
```

---

### [id]/page.tsx (Detail View)

**Purpose**: Display single item with full details

**Pattern**:
```typescript
export default async function ItemPage({ params }: Props) {
  const item = await getItemById(params.id)
  if (!item) notFound()

  return (
    <div className="space-y-6">
      <DetailHeader item={item} />
      <BasicInfo item={item} />
      <RelatedData itemId={item.id} />
    </div>
  )
}
```

---

### new/page.tsx (Create Form)

**Purpose**: Create new record with validation

**Pattern**:
```typescript
export default function NewItemPage() {
  const form = useForm<ItemInput>({
    resolver: zodResolver(itemSchema)
  })

  async function onSubmit(data: ItemInput) {
    const result = await createItem(data)
    if (result.success) router.push(`/items/${result.id}`)
  }

  return <ItemForm form={form} onSubmit={onSubmit} />
}
```

---

### components/ Directory

**Purpose**: Reusable components specific to this module

**Common Components**:
- `ItemList.tsx` - List table or grid
- `ItemDetail.tsx` - Detail view layout
- `ItemForm.tsx` - Shared form component
- `ItemFilters.tsx` - Filter controls
- `StatusBadge.tsx` - Status visualization
- `ItemActions.tsx` - Action buttons

---

### actions.ts (Server Actions)

**Purpose**: Type-safe mutations without API routes

**Pattern**:
```typescript
'use server'

export async function createItem(data: ItemInput) {
  const validated = schema.parse(data)
  // Create logic
  revalidatePath('/items')
  return { success: true, id: 'new-id' }
}

export async function updateItem(id: string, data: ItemInput) {
  const validated = schema.parse(data)
  // Update logic
  revalidatePath(`/items/${id}`)
  return { success: true }
}

export async function deleteItem(id: string) {
  // Delete logic
  revalidatePath('/items')
  return { success: true }
}
```

---

## Cross-Module Integration

**Procurement → Inventory**:
```typescript
// GRN creates inventory transactions
const grn = await createGRN(data)
await createInventoryTransactions(grn.items)
```

**Vendor → Procurement**:
```typescript
// Use vendor price lists in purchase requests
const priceList = await getVendorPriceList(vendorId)
```

**Recipe → Inventory**:
```typescript
// Recipe costing uses inventory costs
const recipeCost = await calculateRecipeCost(recipe)
```

---

## Module Dependencies

**Shared Dependencies**:
- `lib/types/` - Centralized types
- `lib/mock-data/` - Mock data
- `lib/utils/` - Utilities
- `lib/hooks/` - Common hooks
- `components/ui/` - UI components

**Module-Specific**:
- Local `components/`
- Local `hooks/`
- Local `actions.ts`

---

## Best Practices

**✅ Do**:
- Follow consistent file structure
- Use Server Components for data fetching
- Keep module-specific code in module directory
- Import types from `lib/types/`
- Use absolute imports `@/`

**❌ Don't**:
- Create types in module directory (use `lib/types/`)
- Duplicate components across modules (move to shared)
- Mix business logic in components (use actions or services)
- Use relative imports for shared code

---

## Related Documentation

- **[WIKI-HOME.md](../WIKI-HOME.md)** - Documentation hub
- **[ARCHITECTURE-OVERVIEW.md](../ARCHITECTURE-OVERVIEW.md)** - System architecture
- **[COMPONENT-PATTERNS.md](COMPONENT-PATTERNS.md)** - Component best practices
- **[reference/MODULE-DEPENDENCIES.md](../reference/MODULE-DEPENDENCIES.md)** - Inter-module relationships

---

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **🚀 [Getting Started](GETTING-STARTED.md)** | **📚 [Full Onboarding](../DEVELOPER-ONBOARDING.md)**
