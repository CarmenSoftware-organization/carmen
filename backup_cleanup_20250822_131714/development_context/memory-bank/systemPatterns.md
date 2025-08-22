# System Patterns

## Architecture Overview
Carmen follows a modern Next.js 14 architecture with the following key patterns:

### Directory Structure
```
app/
├── (auth)         # Authentication routes
├── (main)         # Main application routes
│   ├── procurement/
│   │   ├── purchase-requests/
│   │   │   ├── components/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
├── api/           # API routes
├── components/    # Shared components
├── hooks/         # Custom hooks
├── lib/           # Utility functions
├── contexts/      # React contexts
└── utils/         # Helper utilities
```

## Design Patterns

### Component Patterns
1. **Server Components First**
   - Default to React Server Components
   - Use 'use client' only when necessary
   - Optimize for server-side rendering

2. **Component Composition**
   - Small, focused components
   - Props for configuration
   - Children for flexibility
   - Composition over inheritance

3. **Layout Patterns**
   - Nested layouts with app router
   - Shared UI elements
   - Responsive design patterns
   - Dynamic routes

4. **List-Detail Pattern**
   - List view with sorting, filtering, and pagination
   - Detail view with tabs for different data sections
   - Consistent navigation between views
   - Type-safe data handling

### State Management
1. **Zustand Store Pattern**
   ```typescript
   interface Store {
     state: State
     actions: Actions
   }
   ```

2. **Query Pattern**
   - TanStack Query for server state
   - Optimistic updates
   - Cache management
   - Error handling

3. **Sorting Pattern**
   ```typescript
   interface SortConfig {
     field: keyof DataType
     direction: "asc" | "desc"
   }
   ```

4. **Filtering Pattern**
   ```typescript
   interface FilterType<T> {
     field: keyof T
     operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'
     value: string | number
     logicalOperator?: 'AND' | 'OR'
   }
   ```

### Form Handling
1. **Form Pattern**
   ```typescript
   interface FormConfig {
     schema: ZodSchema
     defaultValues: DefaultValues
     onSubmit: SubmitHandler
   }
   ```

### Theme System
1. **Theme Provider Pattern**
   ```typescript
   interface ThemeProviderProps {
     children: React.ReactNode
     attribute?: string
     defaultTheme?: string
     enableSystem?: boolean
   }
   ```

## Code Organization

### File Naming
- Components: PascalCase (UserProfile.tsx)
- Utilities: camelCase (formatDate.ts)
- Constants: UPPER_CASE
- Types: PascalCase (UserType.ts)

### Import Organization
```typescript
// External imports
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Internal imports
import { Button } from '@/components/ui'
import { useStore } from '@/store'

// Types
import type { User } from '@/types'
```

## Best Practices

### Performance
1. **Code Splitting**
   - Dynamic imports
   - Route-based splitting
   - Component lazy loading

2. **Optimization**
   - Image optimization
   - Font optimization
   - Bundle size management
   - Memoization of sorted and filtered data

### Type Safety
1. **TypeScript Patterns**
   - Strict type checking
   - Interface over type
   - Proper generics usage
   - Utility types
   - Type-safe table implementations

### Error Handling
1. **Error Boundary Pattern**
   - Component-level boundaries
   - Fallback UI
   - Error reporting

2. **API Error Pattern**
   ```typescript
   interface ApiError {
     code: string
     message: string
     details?: Record<string, unknown>
   }
   ```

## Testing Patterns
1. **Component Testing**
   - Unit tests for utilities
   - Integration tests for features
   - E2E tests for critical paths

2. **Test Organization**
   ```
   __tests__/
   ├── unit/
   ├── integration/
   └── e2e/
   ``` 

## UI Patterns

### Table Pattern
```typescript
interface TableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  sorting?: SortConfig
  onSort?: (field: keyof T) => void
  pagination?: {
    currentPage: number
    itemsPerPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}
```

### List Template Pattern
```typescript
interface ListPageTemplateProps {
  title: string
  filters: React.ReactNode
  actionButtons: React.ReactNode
  content: React.ReactNode
  bulkActions?: React.ReactNode
}
```

### Filter Pattern
```typescript
interface FilterProps<T> {
  filterFields: { value: keyof T; label: string }[]
  onApplyFilters: (filters: FilterType<T>[]) => void
  onClearFilters: () => void
}
``` 