# Frontend Implementation Guide

**Document Type**: Frontend Development Specification  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Purpose**: Complete frontend implementation guide for Carmen ERP

---

## ⚛️ Frontend Architecture Overview

Carmen ERP utilizes **Next.js 14 with App Router**, providing a modern, type-safe, and performant frontend architecture. The implementation follows React best practices with comprehensive state management and form handling.

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18 with functional components
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: Zustand (global) + React Query (server)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

---

## 🏗️ Project Structure Implementation

### App Router Structure
```typescript
app/
├── (auth)/                     # Authentication group
│   ├── login/[[...login]]/     # Login with optional params
│   │   └── page.tsx           # Login page component
│   ├── signup/                # User registration
│   └── select-business-unit/  # Business unit selection
├── (main)/                    # Main application group
│   ├── layout.tsx            # Main layout with sidebar
│   ├── page.tsx              # Dashboard page (redirect)
│   ├── dashboard/            # Executive dashboard
│   │   └── page.tsx
│   ├── procurement/          # Procurement module
│   │   ├── page.tsx         # Module overview
│   │   ├── purchase-requests/
│   │   │   ├── page.tsx     # PR list
│   │   │   ├── new-pr/
│   │   │   │   └── page.tsx # New PR form
│   │   │   └── [id]/
│   │   │       └── page.tsx # PR details
│   │   └── purchase-orders/
│   │       ├── page.tsx
│   │       └── [id]/
│   └── [other-modules]/      # Additional business modules
├── api/                      # API routes (if needed)
├── globals.css              # Global styles
└── layout.tsx               # Root layout
```

### Component Organization
```typescript
components/
├── ui/                       # Shadcn/ui base components
│   ├── button.tsx
│   ├── form.tsx
│   ├── table.tsx
│   └── [50+ components]
├── layout/                   # Layout components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Breadcrumb.tsx
├── forms/                    # Reusable form components
│   ├── FormField.tsx
│   ├── FormSection.tsx
│   └── DynamicItemList.tsx
├── tables/                   # Data table components
│   ├── DataTable.tsx
│   ├── TableFilters.tsx
│   └── TablePagination.tsx
├── business/                 # Business-specific components
│   ├── procurement/
│   │   ├── PurchaseRequestForm.tsx
│   │   ├── PurchaseRequestList.tsx
│   │   └── ApprovalWorkflow.tsx
│   ├── inventory/
│   └── vendor/
└── common/                   # Common utility components
    ├── StatusBadge.tsx
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx
```

---

## 🔄 State Management Architecture

### Zustand Global State
```typescript
// lib/store/app-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  // User context
  user: User | null
  userContext: UserContext | null
  
  // UI state
  sidebarCollapsed: boolean
  currentModule: string
  
  // Actions
  setUser: (user: User) => void
  setUserContext: (context: UserContext) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentModule: (module: string) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        userContext: null,
        sidebarCollapsed: false,
        currentModule: 'dashboard',
        
        // Actions
        setUser: (user) => set({ user }),
        setUserContext: (userContext) => set({ userContext }),
        setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
        setCurrentModule: (currentModule) => set({ currentModule }),
      }),
      {
        name: 'carmen-app-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          currentModule: state.currentModule
        })
      }
    )
  )
)
```

### React Query Configuration
```typescript
// lib/providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: (failureCount, error) => {
            // Don't retry on 4xx errors
            if (error && 'status' in error && error.status >= 400 && error.status < 500) {
              return false
            }
            return failureCount < 3
          }
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Server State Hooks
```typescript
// lib/hooks/use-purchase-requests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPurchaseRequests, createPurchaseRequest, approvePurchaseRequest } from '@/app/(main)/procurement/purchase-requests/actions'

export function usePurchaseRequests(filters?: PRFilters) {
  return useQuery({
    queryKey: ['purchase-requests', filters],
    queryFn: () => getPurchaseRequests(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createPurchaseRequest,
    onSuccess: () => {
      // Invalidate and refetch purchase requests
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, approval }: { id: string; approval: ApprovalData }) =>
      approvePurchaseRequest(id, approval),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-approvals'] })
    },
  })
}
```

---

## 📝 Form Implementation Patterns

### React Hook Form + Zod Integration
```typescript
// components/forms/PurchaseRequestForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreatePurchaseRequest } from '@/lib/hooks/use-purchase-requests'

// Validation schema
const purchaseRequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().min(1, "Department is required"),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  requiredDate: z.string().refine(date => new Date(date) > new Date(), {
    message: "Required date must be in the future"
  }),
  items: z.array(z.object({
    description: z.string().min(5, "Item description required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unitOfMeasure: z.string().min(1, "Unit of measure required"),
    estimatedPrice: z.object({
      amount: z.number().min(0, "Price cannot be negative"),
      currency: z.string()
    }).optional()
  })).min(1, "At least one item is required")
})

type FormData = z.infer<typeof purchaseRequestSchema>

export function PurchaseRequestForm() {
  const createPR = useCreatePurchaseRequest()
  
  const form = useForm<FormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: {
      description: '',
      department: '',
      priority: 'normal',
      requiredDate: '',
      items: [{ description: '', quantity: 1, unitOfMeasure: '', estimatedPrice: undefined }]
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createPR.mutateAsync(data)
      // Handle success (navigation, toast, etc.)
    } catch (error) {
      // Handle error
      console.error('Failed to create purchase request:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter purchase request description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Additional form fields */}
        
        <Button type="submit" disabled={createPR.isPending}>
          {createPR.isPending ? 'Creating...' : 'Create Purchase Request'}
        </Button>
      </form>
    </Form>
  )
}
```

### Dynamic Form Arrays
```typescript
// components/forms/DynamicItemList.tsx
import { useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

interface DynamicItemListProps {
  control: any
  name: string
}

export function DynamicItemList({ control, name }: DynamicItemListProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name
  })

  const addItem = () => {
    append({ description: '', quantity: 1, unitOfMeasure: '', estimatedPrice: undefined })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Items</h3>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      
      {fields.map((field, index) => (
        <div key={field.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">Item {index + 1}</h4>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Item form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={control}
              name={`${name}.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Additional fields */}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 📊 Data Table Implementation

### Reusable Data Table Component
```typescript
// components/tables/DataTable.tsx
'use client'

import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumn
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center justify-between">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

### Purchase Request Table Implementation
```typescript
// app/(main)/procurement/purchase-requests/components/PurchaseRequestList.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/DataTable'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Edit, Check } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PurchaseRequest } from '@/lib/types'
import { usePurchaseRequests } from '@/lib/hooks/use-purchase-requests'

const columns: ColumnDef<PurchaseRequest>[] = [
  {
    accessorKey: 'number',
    header: 'PR Number',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const amount = row.getValue('totalAmount') as Money
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: amount.currency,
      }).format(amount.amount)
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return date.toLocaleDateString()
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const pr = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {pr.status === 'pending' && (
              <DropdownMenuItem>
                <Check className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function PurchaseRequestList() {
  const { data: purchaseRequests = [], isLoading } = usePurchaseRequests()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <DataTable
      columns={columns}
      data={purchaseRequests}
      searchPlaceholder="Search purchase requests..."
    />
  )
}
```

---

## 🏗️ Layout Implementation

### Main Layout with Sidebar
```typescript
// app/(main)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Responsive Sidebar Component
```typescript
// components/layout/Sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ChevronDown, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store/app-store'

interface NavigationItem {
  id: string
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    id: 'procurement',
    title: 'Procurement',
    icon: ShoppingCart,
    description: 'Purchase requests and orders',
    children: [
      {
        id: 'purchase-requests',
        title: 'Purchase Requests',
        href: '/procurement/purchase-requests',
        icon: FileText
      },
      {
        id: 'purchase-orders',
        title: 'Purchase Orders',
        href: '/procurement/purchase-orders',
        icon: Package
      }
    ]
  },
  // Additional navigation items...
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(['procurement'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold">Carmen ERP</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            pathname={pathname}
            expanded={expandedItems.includes(item.id)}
            onToggleExpanded={() => toggleExpanded(item.id)}
          />
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-white border-r transition-all duration-300",
        sidebarCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
```

---

## 🔐 Authentication Implementation

### User Context Provider
```typescript
// lib/context/user-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, UserContext } from '@/lib/types'
import { getCurrentUser, switchUserContext } from '@/app/(auth)/actions'

interface UserContextType {
  user: User | null
  userContext: UserContext | null
  isLoading: boolean
  switchContext: (context: Partial<UserContext>) => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setUserContext(currentUser?.context || null)
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleSwitchContext = async (context: Partial<UserContext>) => {
    if (!user) return

    try {
      const newContext = await switchUserContext(context)
      setUserContext(newContext)
      
      // Update user object
      setUser(prev => prev ? { ...prev, context: newContext } : null)
    } catch (error) {
      console.error('Failed to switch context:', error)
    }
  }

  const logout = () => {
    setUser(null)
    setUserContext(null)
    // Redirect to login or handle logout
  }

  return (
    <UserContext.Provider value={{
      user,
      userContext,
      isLoading,
      switchContext: handleSwitchContext,
      logout
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
```

---

## 📱 Responsive Design Implementation

### Mobile-First Approach
```typescript
// Responsive utility classes and breakpoints
const breakpoints = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (large laptops)
  '2xl': '1536px' // 2X large devices (large monitors)
}

// Responsive grid examples
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards or content */}
</div>

// Responsive text sizing
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Page Title
</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

### Mobile Navigation Pattern
```typescript
// Mobile-optimized navigation with sheet overlay
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function MobileNavigation() {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          {/* Navigation content */}
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

---

## ⚡ Performance Optimization

### Code Splitting and Lazy Loading
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const PurchaseRequestForm = lazy(() => import('./PurchaseRequestForm'))
const DataTable = lazy(() => import('@/components/tables/DataTable'))

export function ProcurementPage() {
  return (
    <div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <DataTable />
      </Suspense>
      
      <Suspense fallback={<div>Loading form...</div>}>
        <PurchaseRequestForm />
      </Suspense>
    </div>
  )
}
```

### Optimistic Updates
```typescript
// Optimistic updates with React Query
export function useOptimisticPRUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updatePurchaseRequest,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['purchase-requests'] })
      
      // Get current data
      const previousData = queryClient.getQueryData(['purchase-requests'])
      
      // Optimistically update
      queryClient.setQueryData(['purchase-requests'], (old: PurchaseRequest[]) =>
        old.map(pr => pr.id === variables.id ? { ...pr, ...variables.data } : pr)
      )
      
      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['purchase-requests'], context.previousData)
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
```

---

## ✅ Frontend Implementation Checklist

### Core Architecture (Required)
- [ ] Next.js 14 App Router setup
- [ ] TypeScript configuration with strict mode
- [ ] Tailwind CSS with Shadcn/ui components
- [ ] Zustand global state management
- [ ] React Query server state management
- [ ] React Hook Form + Zod validation

### Component System (Required)
- [ ] Reusable UI component library
- [ ] Business-specific components for each module
- [ ] Form components with validation
- [ ] Data table components with sorting/filtering
- [ ] Layout components (sidebar, header, breadcrumb)
- [ ] Mobile-responsive components

### State Management (Required)
- [ ] User authentication state
- [ ] User context switching
- [ ] UI state (sidebar, modals, etc.)
- [ ] Server state caching and synchronization
- [ ] Optimistic updates for better UX

### Performance (Required)
- [ ] Code splitting for large components
- [ ] Lazy loading for non-critical components
- [ ] Image optimization with Next.js Image
- [ ] Bundle optimization and analysis
- [ ] React Query caching strategies

### Responsive Design (Required)
- [ ] Mobile-first CSS approach
- [ ] Responsive navigation patterns
- [ ] Adaptive layouts for different screen sizes
- [ ] Touch-friendly interface elements
- [ ] Progressive enhancement

---

**Next Steps**: Implement [Business Logic & Rules](../08-business-logic/rules.md) to complete the application logic layer.

*This frontend guide provides complete implementation patterns for recreating Carmen ERP with modern React and Next.js best practices.*