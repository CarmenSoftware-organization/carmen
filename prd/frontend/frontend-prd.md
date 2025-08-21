# Carmen Frontend Architecture PRD

## Document Information

| **Attribute**     | **Value**                           |
|-------------------|-------------------------------------|
| **Document Type** | Frontend Architecture PRD           |
| **Version**       | 1.0.0                              |
| **Date**          | January 2025                       |
| **Status**        | Draft                              |
| **Owner**         | Frontend Team                      |

---

## Executive Summary

The Carmen Hospitality System frontend is built on cutting-edge web technologies to deliver exceptional user experience, performance, and scalability. Using Next.js 15+ with Static Site Generation, Tailwind CSS 4+, and modern React patterns, the frontend provides a responsive, accessible, and internationalized interface for hospitality operations.

---

## Technology Stack

### Core Framework
- **Next.js 15+** with App Router
- **React 19** with latest features
- **TypeScript 5+** for type safety
- **Node.js 20+ LTS** runtime

### Styling & UI
- **Tailwind CSS 4+** with container queries and layers
- **Shadcn/ui (Latest)** component library
- **Radix UI** primitives for accessibility
- **CSS Grid & Flexbox** for layouts
- **PostCSS** for processing

### State Management
- **TanStack Query v5** for server state
- **TanStack Table v8** for data tables
- **TanStack Virtual v3** for virtualization
- **React Context** for global state
- **Zustand** (optional) for complex state

### Forms & Validation
- **React Hook Form v7** for form management
- **Zod** for schema validation
- **Shared schemas** between frontend/backend
- **Custom validators** for business rules

### Internationalization
- **Next.js i18n** native routing
- **date-fns** for locale-aware formatting
- **Multi-language** support (EN, ES, FR, DE)
- **RTL support** for Arabic/Hebrew

### PDF Generation
- **@react-pdf/renderer** for client-side generation
- **Dynamic templates** for documents
- **Multi-language PDFs** with proper fonts
- **Chart integration** for reports

### Development Tools
- **Turbopack** for development builds
- **SWC** for production compilation
- **ESLint** for code quality
- **Prettier** for formatting
- **Husky** for git hooks

---

## Architecture Patterns

### Component Architecture

#### Static Site Generation (SSG)
```typescript
// pages/inventory/stock-cards/page.tsx
export default async function StockCardsPage() {
  // Server component with data fetching
  const stockCards = await getStockCards();
  
  return (
    <div className="container mx-auto p-4">
      <StockCardsClient initialData={stockCards} />
    </div>
  );
}
```

#### Component Composition
```typescript
// Compound component pattern
<DataTable>
  <DataTable.Toolbar>
    <DataTable.Search />
    <DataTable.Filters />
  </DataTable.Toolbar>
  <DataTable.Content>
    <DataTable.Columns />
    <DataTable.Rows />
  </DataTable.Content>
  <DataTable.Footer>
    <DataTable.Pagination />
  </DataTable.Footer>
</DataTable>
```

### Server vs Client Components

#### Server Components (Default)
- Page layouts and static content
- Data fetching and initial rendering
- SEO-optimized content
- Non-interactive elements

#### Client Components ('use client')
- Interactive forms and buttons
- State management
- Real-time updates
- User input handling

### State Management Strategy

#### Server State (TanStack Query)
```typescript
// hooks/usePurchaseRequests.ts
export function usePurchaseRequests(filters?: PRFilters) {
  return useQuery({
    queryKey: ['purchase-requests', filters],
    queryFn: () => api.procurement.getPurchaseRequests(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds for live data
  });
}
```

#### Local State (React Hooks)
```typescript
// components/InventoryAdjustmentForm.tsx
function InventoryAdjustmentForm() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Styling Architecture

### Tailwind CSS 4+ Configuration

#### Cascade Layers
```css
/* globals.css */
@layer reset, base, components, utilities;

@layer base {
  :root {
    --color-primary: oklch(0.5555 0 0);
    --color-secondary: oklch(0.9702 0 0);
  }
}

@layer components {
  .card {
    @apply bg-card text-card-foreground rounded-lg border shadow-sm;
  }
}
```

#### Container Queries
```css
.inventory-card {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .inventory-details {
    @apply grid grid-cols-2 gap-4;
  }
}
```

### Shadcn/ui Component System

#### Installation and Setup
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
```

#### Theme Configuration
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CSS Variables in globals.css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

#### Component Implementation
```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Key Shadcn/ui Components Used

**Core UI Components**:
```typescript
// Form components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// Layout components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Navigation components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationMenu } from "@/components/ui/navigation-menu"
import { Breadcrumb } from "@/components/ui/breadcrumb"

// Feedback components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// Overlay components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Data display components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import { Calendar } from "@/components/ui/calendar"
```

#### Component Configuration Example
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## Data Management

### TanStack Query Patterns

#### Query Configuration
```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### Optimistic Updates
```typescript
// hooks/useUpdateInventory.ts
export function useUpdateInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateInventoryItem,
    onMutate: async (newItem) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const previousData = queryClient.getQueryData(['inventory']);
      
      queryClient.setQueryData(['inventory'], (old: Item[]) =>
        old.map(item => item.id === newItem.id ? { ...item, ...newItem } : item)
      );
      
      return { previousData };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(['inventory'], context?.previousData);
    },
  });
}
```

### TanStack Table Implementation

#### Column Definitions
```typescript
// components/PurchaseRequestTable.tsx
const columns: ColumnDef<PurchaseRequest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'number',
    header: 'PR Number',
    cell: ({ row }) => (
      <Link href={`/procurement/purchase-requests/${row.original.id}`}>
        {row.getValue('number')}
      </Link>
    ),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => formatCurrency(row.getValue('totalAmount')),
  },
];
```

#### Table Features
```typescript
function PurchaseRequestTable({ data }: { data: PurchaseRequest[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters: filtering, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFiltering,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  return <DataTable table={table} />;
}
```

---

## Form Management

### React Hook Form with Zod

#### Schema Definition
```typescript
// schemas/purchaseRequestSchema.ts
export const purchaseRequestSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  requestedBy: z.string().min(1, 'Requester is required'),
  requestDate: z.date(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

export type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;
```

#### Form Implementation
```typescript
// components/PurchaseRequestForm.tsx
export function PurchaseRequestForm({ onSubmit }: { onSubmit: (data: PurchaseRequestFormData) => void }) {
  const form = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: {
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="departmentId"
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
        
        {/* Dynamic item fields */}
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4">
            <FormField
              control={form.control}
              name={`items.${index}.productId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <ProductSelector onValueChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove Item
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
        >
          Add Item
        </Button>
        
        <Button type="submit">Submit Request</Button>
      </form>
    </Form>
  );
}
```

---

## Internationalization

### Next.js i18n Configuration

#### Locale Setup
```typescript
// next.config.js
const nextConfig = {
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
    localeDetection: true,
  },
};
```

#### Translation Files
```json
// locales/en/common.json
{
  "navigation": {
    "dashboard": "Dashboard",
    "procurement": "Procurement",
    "inventory": "Inventory",
    "vendors": "Vendors"
  },
  "procurement": {
    "purchaseRequest": "Purchase Request",
    "createNew": "Create New",
    "status": {
      "draft": "Draft",
      "pending": "Pending Approval",
      "approved": "Approved"
    }
  }
}
```

#### Usage in Components
```typescript
// components/Navigation.tsx
import { useTranslation } from 'next-i18next';

export function Navigation() {
  const { t } = useTranslation('common');
  
  return (
    <nav>
      <Link href="/dashboard">{t('navigation.dashboard')}</Link>
      <Link href="/procurement">{t('navigation.procurement')}</Link>
      <Link href="/inventory">{t('navigation.inventory')}</Link>
    </nav>
  );
}
```

### Date & Currency Formatting

#### Date Handling
```typescript
// utils/dateUtils.ts
import { format } from 'date-fns';
import { enUS, es, fr, de } from 'date-fns/locale';

const locales = { en: enUS, es, fr, de };

export function formatDate(date: Date, formatStr: string, locale: string) {
  return format(date, formatStr, { locale: locales[locale] });
}

export function formatRelativeTime(date: Date, locale: string) {
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: locales[locale] 
  });
}
```

#### Currency Formatting
```typescript
// utils/currencyUtils.ts
export function formatCurrency(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
```

---

## PDF Generation

### Client-side PDF Templates

#### Invoice Template
```typescript
// components/pdf/InvoiceTemplate.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
});

export function InvoiceTemplate({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Invoice #{data.number}</Text>
        
        <View style={styles.table}>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text>{item.description}</Text>
              <Text>{item.quantity}</Text>
              <Text>{formatCurrency(item.price)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
```

#### PDF Generation Hook
```typescript
// hooks/usePDFGeneration.ts
import { pdf } from '@react-pdf/renderer';

export function usePDFGeneration() {
  const generatePDF = async (template: React.ReactElement) => {
    const blob = await pdf(template).toBlob();
    return blob;
  };
  
  const downloadPDF = async (template: React.ReactElement, filename: string) => {
    const blob = await generatePDF(template);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  
  return { generatePDF, downloadPDF };
}
```

---

## Performance Optimization

### Static Site Generation

#### Page Generation
```typescript
// app/inventory/stock-cards/page.tsx
export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.map(location => ({ locationId: location.id }));
}

export default async function StockCardPage({ params }: { params: { locationId: string } }) {
  const stockData = await getStockDataForLocation(params.locationId);
  
  return (
    <div className="container">
      <StockCardDisplay data={stockData} />
    </div>
  );
}
```

#### Incremental Static Regeneration
```typescript
// pages/api/revalidate.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  try {
    await res.revalidate('/inventory/stock-cards');
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}
```

### Code Splitting

#### Dynamic Imports
```typescript
// Lazy load heavy components
const ReportGenerator = dynamic(() => import('@/components/ReportGenerator'), {
  loading: () => <Skeleton className="h-96 w-full" />,
});

const ChartComponent = dynamic(() => import('@/components/Chart'), {
  ssr: false, // Client-side only for charts
});
```

### Virtualization

#### Large Lists
```typescript
// components/VirtualizedInventoryList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedInventoryList({ items }: { items: InventoryItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <InventoryItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Security Implementation

### Authentication Integration

#### Keycloak Client Setup
```typescript
// lib/auth.ts
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
});

export async function initKeycloak() {
  const authenticated = await keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
  });
  
  return { keycloak, authenticated };
}
```

#### Protected Routes
```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  roles = [],
  permissions = [] 
}: {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
}) {
  const { user, hasRole, hasPermission } = useAuth();
  
  if (!user) {
    return <LoginPage />;
  }
  
  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    return <UnauthorizedPage />;
  }
  
  if (permissions.length > 0 && !permissions.some(perm => hasPermission(perm))) {
    return <UnauthorizedPage />;
  }
  
  return <>{children}</>;
}
```

### Input Sanitization

#### XSS Prevention
```typescript
// utils/sanitization.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

---

## Testing Strategy

### Component Testing

#### Unit Tests
```typescript
// __tests__/PurchaseRequestForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PurchaseRequestForm } from '@/components/PurchaseRequestForm';

describe('PurchaseRequestForm', () => {
  it('should validate required fields', async () => {
    const onSubmit = jest.fn();
    render(<PurchaseRequestForm onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByText('Submit Request'));
    
    await waitFor(() => {
      expect(screen.getByText('Department is required')).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });
  
  it('should submit valid form data', async () => {
    const onSubmit = jest.fn();
    render(<PurchaseRequestForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Department'), { 
      target: { value: 'kitchen' } 
    });
    fireEvent.click(screen.getByText('Submit Request'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        departmentId: 'kitchen',
        // ... other form data
      });
    });
  });
});
```

### E2E Testing

#### Playwright Tests
```typescript
// e2e/procurement.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Procurement Module', () => {
  test('should create purchase request', async ({ page }) => {
    await page.goto('/procurement/purchase-requests');
    await page.click('text=Create New');
    
    await page.selectOption('[name="departmentId"]', 'kitchen');
    await page.fill('[name="items.0.quantity"]', '10');
    
    await page.click('text=Submit Request');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

---

## Accessibility Standards

### WCAG 2.2 Compliance

#### Keyboard Navigation
```typescript
// components/DataTable.tsx
export function DataTable({ data }: { data: any[] }) {
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        setFocusedRowIndex(prev => 
          Math.min(prev + 1, data.length - 1)
        );
        break;
      case 'ArrowUp':
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        // Handle row selection
        break;
    }
  };
  
  return (
    <table onKeyDown={handleKeyDown} role="grid">
      {/* Table content */}
    </table>
  );
}
```

#### Screen Reader Support
```typescript
// components/StatusBadge.tsx
export function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    approved: { color: 'green', label: 'Approved' },
    pending: { color: 'yellow', label: 'Pending approval' },
    rejected: { color: 'red', label: 'Rejected' },
  };
  
  const config = statusConfig[status];
  
  return (
    <span
      className={`badge badge-${config.color}`}
      aria-label={`Status: ${config.label}`}
      role="status"
    >
      {config.label}
    </span>
  );
}
```

---

## Build & Deployment

### Build Configuration

#### Next.js Config
```typescript
// next.config.js
const nextConfig = {
  output: 'export', // Static export
  trailingSlash: true,
  images: {
    unoptimized: true, // For static export
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    ppr: true, // Partial Prerendering
  },
};
```

#### Dockerfile
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration

#### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.carmen.io
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.carmen.io
NEXT_PUBLIC_KEYCLOAK_REALM=carmen
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=carmen-frontend

# Build-time variables
ANALYZE=false
SENTRY_DSN=https://sentry.io/...
```

---

## Monitoring & Analytics

### Error Tracking

#### Sentry Integration
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
  ],
});

export { Sentry };
```

### Performance Monitoring

#### Web Vitals
```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to Google Analytics, DataDog, etc.
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
  });
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

---

## Development Workflow

### Code Quality

#### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

---

## Future Enhancements

### Planned Features
1. **Progressive Web App (PWA)** - Offline functionality
2. **Real-time Notifications** - WebSocket integration
3. **Mobile App** - React Native version
4. **Advanced Analytics** - BI dashboard integration
5. **AI Features** - Predictive analytics, recommendations

### Technical Debt
1. **Legacy Component Migration** - Convert class to function components
2. **Bundle Size Optimization** - Tree shaking improvements
3. **Performance Monitoring** - Real user monitoring (RUM)
4. **Accessibility Audit** - WCAG 2.2 AAA compliance

---

## Appendices

### A. File Structure
```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Auth routes
│   ├── dashboard/         # Dashboard pages
│   ├── procurement/       # Procurement pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components (Shadcn/ui)
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configs
├── schemas/              # Zod validation schemas
├── styles/               # Global styles
└── types/                # TypeScript types
```

### B. Dependencies

#### Core Dependencies
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-tooltip": "^1.0.7",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-accordion": "^1.1.2",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "lucide-react": "^0.300.0",
  "@tanstack/react-query": "^5.0.0",
  "@tanstack/react-table": "^8.0.0",
  "react-hook-form": "^7.0.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.0.0",
  "@react-pdf/renderer": "^3.0.0",
  "date-fns": "^3.0.0"
}
```

### C. Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS 14+, Android 10+

---

*This document serves as the definitive guide for Carmen frontend architecture and will be updated as the system evolves.*