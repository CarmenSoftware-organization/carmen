# Form Handling Guide

**Carmen's form handling patterns** using React Hook Form + Zod validation.

---

## Stack

- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Shadcn Form Components**: Pre-built form UI

---

## Basic Form Pattern

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField } from '@/components/ui/form'

// 1. Define schema
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  quantity: z.number().positive('Must be positive'),
})

// 2. Infer TypeScript type
type FormData = z.infer<typeof schema>

// 3. Create form component
export function ItemForm({ onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      quantity: 1
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

---

## Form Fields

### Text Input

```typescript
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Enter name" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select

```typescript
<FormField
  control={form.control}
  name="department_id"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Department</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {departments.map(dept => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox

```typescript
<FormField
  control={form.control}
  name="is_active"
  render={({ field }) => (
    <FormItem className="flex items-center space-x-2">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <FormLabel>Active</FormLabel>
    </FormItem>
  )}
/>
```

---

## Complex Validations

### Conditional Validation

```typescript
const schema = z.object({
  type: z.enum(['INTERNAL', 'EXTERNAL']),
  vendor_id: z.string().optional(),
}).refine(data => {
  if (data.type === 'EXTERNAL') {
    return !!data.vendor_id
  }
  return true
}, {
  message: 'Vendor is required for external purchases',
  path: ['vendor_id']
})
```

### Custom Validation

```typescript
const schema = z.object({
  start_date: z.date(),
  end_date: z.date(),
}).refine(data => data.end_date > data.start_date, {
  message: 'End date must be after start date',
  path: ['end_date']
})
```

---

## Field Arrays (Dynamic Lists)

```typescript
const schema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive()
  })).min(1, 'At least one item required')
})

type FormData = z.infer<typeof schema>

function PurchaseRequestForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      items: [{ product_id: '', quantity: 1, unit_price: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`items.${index}.product_id`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select {...field}>...</Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="button" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => append({ ... })}>
          Add Item
        </Button>
      </form>
    </Form>
  )
}
```

---

## Form Submission

### With Server Action

```typescript
async function onSubmit(data: FormData) {
  try {
    const result = await createItem(data)

    if (result.success) {
      toast.success('Created successfully')
      router.push(`/items/${result.id}`)
    } else {
      toast.error(result.error || 'Failed to create')
    }
  } catch (error) {
    toast.error('An error occurred')
  }
}
```

### With Loading State

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

async function onSubmit(data: FormData) {
  setIsSubmitting(true)
  try {
    await createItem(data)
  } finally {
    setIsSubmitting(false)
  }
}

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

---

## Error Handling

### Field Errors

Automatic from Zod validation via `<FormMessage />`

### Server Errors

```typescript
async function onSubmit(data: FormData) {
  const result = await createItem(data)

  if (!result.success && result.errors) {
    // Set field-specific errors
    Object.entries(result.errors).forEach(([field, message]) => {
      form.setError(field as keyof FormData, {
        message: message as string
      })
    })
  }
}
```

---

## Best Practices

**✅ Do**:
- Always use Zod schemas for validation
- Use TypeScript type inference from schemas
- Handle both client and server errors
- Provide clear, user-friendly error messages
- Use field arrays for dynamic lists

**❌ Don't**:
- Skip validation
- Use uncontrolled forms
- Forget to handle loading states
- Show technical error messages to users

---

## Related Documentation

- **[COMPONENT-PATTERNS.md](COMPONENT-PATTERNS.md)** - Component best practices
- **[WORKING-WITH-TYPES.md](WORKING-WITH-TYPES.md)** - Type system
- **[STATE-MANAGEMENT.md](STATE-MANAGEMENT.md)** - State management

---

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **🚀 [Getting Started](GETTING-STARTED.md)**
