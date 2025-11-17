# Component Patterns Guide

**Standard patterns for building Carmen components** with consistency and best practices.

---

## Core Patterns

### 1. List Component Pattern

```typescript
'use client'

import { useMemo, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'

interface SortConfig {
  field: keyof Item
  direction: 'asc' | 'desc'
}

export function ItemList({ items }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  })

  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const aVal = a[sortConfig.field]
        const bVal = b[sortConfig.field]
        return sortConfig.direction === 'asc'
          ? aVal > bVal ? 1 : -1
          : aVal < bVal ? 1 : -1
      })
  }, [items, searchTerm, sortConfig])

  return (
    <div className="space-y-4">
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <DataTable data={filteredItems} onSort={setSortConfig} />
    </div>
  )
}
```

---

### 2. Detail Component Pattern

```typescript
// Server Component
export default async function ItemDetail({ params }: Props) {
  const item = await getItemById(params.id)

  if (!item) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1>{item.name}</h1>
        <ItemActions item={item} />
      </div>

      {/* Info Sections */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="font-medium">{item.name}</dd>
            </div>
            {/* More fields */}
          </dl>
        </CardContent>
      </Card>

      {/* Related Data */}
      <RelatedItems itemId={item.id} />
    </div>
  )
}
```

---

### 3. Form Component Pattern

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
})

type FormData = z.infer<typeof schema>

export function ItemForm({ initialData, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Component File Structure

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createItem } from './actions'

// 2. Type definitions
interface Props {
  items: Item[]
}

// 3. Main component
export function ItemList({ items }: Props) {
  return <div>...</div>
}

// 4. Subcomponents (if small and component-specific)
function ItemCard({ item }: { item: Item }) {
  return <Card>...</Card>
}

// 5. Helper functions
function formatItemName(item: Item): string {
  return item.name.toUpperCase()
}
```

---

## Server vs Client Components

**Server Component** (default):
```typescript
// No 'use client' directive
export default async function Page() {
  const data = await getData()  // Direct server fetch
  return <View data={data} />
}
```

**Client Component** (interactive):
```typescript
'use client'  // Required for useState, useEffect, event handlers

export function InteractiveForm() {
  const [value, setValue] = useState('')
  return <Input value={value} onChange={e => setValue(e.target.value)} />
}
```

---

## Common Component Patterns

### Status Badge

```typescript
function StatusBadge({ status }: { status: DocumentStatus }) {
  const variants = {
    DRAFT: 'secondary',
    SUBMITTED: 'default',
    APPROVED: 'success',
    REJECTED: 'destructive'
  }

  return (
    <Badge variant={variants[status]}>
      {status}
    </Badge>
  )
}
```

### Actions Menu

```typescript
function ItemActions({ item }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => router.push(`/items/${item.id}/edit`)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(item.id)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Best Practices

**✅ Do**:
- Use `function` keyword for components
- Keep components focused (single responsibility)
- Use Server Components by default
- Extract reusable logic into custom hooks
- Use `useMemo` for expensive calculations

**❌ Don't**:
- Mix business logic with presentation
- Create huge monolithic components
- Use Client Components unnecessarily
- Duplicate components across modules

---

## Related Documentation

- **[FORM-HANDLING.md](FORM-HANDLING.md)** - Form patterns
- **[STATE-MANAGEMENT.md](STATE-MANAGEMENT.md)** - State management
- **[ARCHITECTURE-OVERVIEW.md](../ARCHITECTURE-OVERVIEW.md)** - Architecture

---

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **🚀 [Getting Started](GETTING-STARTED.md)**
