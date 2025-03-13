# Purchase Request Module Implementation

## 1. List Page Implementation (`page.tsx` & `purchase-request-list.tsx`)

### Layout Structure
```typescript
// Main Layout Components
- ListPageTemplate
  ├── Header Section
  │   ├── Title ("Purchase Requests")
  │   └── Action Buttons
  │       ├── New Purchase Request
  │       ├── Export
  │       └── Print
  ├── Filter Section
  │   ├── Search Bar
  │   ├── Type Filter Dropdown
  │   ├── Status Filter Dropdown
  │   └── Advanced Filter Component
  └── Content Section
      ├── PR Cards List
      └── Pagination Controls
```

### Key Components

#### 1. PR Card Component
```typescript
<Card className="overflow-hidden p-2 hover:bg-secondary">
  <div className="py-2 px-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Checkbox />
        <StatusBadge />
        <PRNumber />
        <Description />
      </div>
      <ActionButtons>
        <ViewButton />
        <EditButton />
        <DeleteButton />
      </ActionButtons>
    </div>
    <Grid className="grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <Field label="Date" />
      <Field label="Type" />
      <Field label="Description" />
      <Field label="Requestor" />
      <Field label="Department" />
      <Field label="Amount" />
    </Grid>
  </div>
</Card>
```

#### 2. Filter Components
```typescript
// Filter Configuration
const filterFields = [
  { value: 'refNumber', label: 'PR Number' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'department', label: 'Department' },
  { value: 'description', label: 'Description' },
  { value: 'totalAmount', label: 'Amount' }
]

// Filter Panel Implementation
<div className="flex flex-col sm:flex-row justify-between">
  <SearchInput />
  <FilterDropdowns>
    <TypeFilter />
    <StatusFilter />
    <AdvancedFilter />
  </FilterDropdowns>
</div>
```

## 2. Detail Page Implementation (`PRDetailPage.tsx`)

### Layout Structure
```typescript
// Main Layout Components
- PRDetailPage
  ├── Header Section
  │   ├── Breadcrumb
  │   ├── Title & Status
  │   └── Action Buttons
  ├── Details Section
  │   ├── Basic Info
  │   └── Requestor Info
  ├── Tabs Section
  │   ├── Items Tab
  │   ├── Budget Tab
  │   ├── Workflow Tab
  │   ├── Attachments Tab
  │   └── Activity Tab
  └── Summary Section
      └── Transaction Summary
```

### Key Components

#### 1. Header Implementation
```typescript
<PRHeader
  title={formData.description}
  status={formData.status}
  number={formData.refNumber}
  date={formData.date}
  actions={[
    { label: "Edit", icon: PencilIcon },
    { label: "Print", icon: PrinterIcon },
    { label: "Download", icon: DownloadIcon }
  ]}
/>
```

#### 2. Tabs Implementation
```typescript
<Tabs defaultValue="items">
  <TabsList className="grid w-full grid-cols-5">
    {["items", "budgets", "workflow", "attachments", "activity"]}
  </TabsList>
  <ScrollArea className="h-[400px]">
    <TabsContent value="items">
      <ItemsTab />
    </TabsContent>
    <TabsContent value="budgets">
      <ResponsiveBudgetScreen />
    </TabsContent>
    {/* Other tab contents */}
  </ScrollArea>
</Tabs>
```

## 3. Items Tab Implementation (`ItemsTab.tsx`)

### Layout Structure
```typescript
// Main Layout Components
- ItemsTab
  ├── Action Bar
  │   ├── Bulk Selection
  │   └── Item Actions
  ├── Items Table
  │   ├── Column Headers
  │   └── Item Rows
  └── Summary Section
```

### Table Implementation
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead><Checkbox /></TableHead>
      <TableHead>Location</TableHead>
      <TableHead>Product</TableHead>
      <TableHead>
        <div>Order Unit</div>
        <Separator />
        <div>Inv. Unit</div>
      </TableHead>
      {/* Other headers */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <ItemRow
        key={item.id}
        item={item}
        onSelect={handleSelectItem}
        onEdit={handleEditItem}
      />
    ))}
  </TableBody>
</Table>
```

## 4. Form Implementations

### 1. Item Form (`item-details-edit-form.tsx`)
```typescript
// Form Structure
<form>
  <BasicInformation>
    <Input name="itemCode" />
    <Input name="name" />
    <Textarea name="description" />
  </BasicInformation>
  
  <QuantitySection>
    <Input name="quantity" type="number" />
    <Select name="unit">
      {unitOptions}
    </Select>
  </QuantitySection>
  
  <PricingSection>
    <Input name="price" type="number" />
    <Select name="currency">
      {currencyOptions}
    </Select>
    <Input name="discount" type="number" />
    <Input name="tax" type="number" />
  </PricingSection>
</form>
```

### 2. Budget Form Implementation
```typescript
// Budget Form Structure
<BudgetForm>
  <AccountSection>
    <Select name="accountCode" searchable />
    <Select name="costCenter" required />
    <Select name="project" />
  </AccountSection>
  
  <AllocationSection>
    <Input name="amount" type="number" />
    <Input name="available" readonly />
    <Input name="remaining" readonly />
  </AllocationSection>
</BudgetForm>
```

## 5. Shared Components

### 1. Status Badge
```typescript
// Implementation
<StatusBadge
  status={status}
  variant="solid"
  className={cn(
    "px-3 py-1 rounded-full text-sm font-medium",
    statusStyles[status]
  )}
/>

// Styles Configuration
const statusStyles = {
  Draft: "bg-gray-100 text-gray-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-800"
}
```

### 2. Summary Total
```typescript
// Implementation
<Card>
  <CardHeader>
    <CardTitle>Transaction Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <SummaryTotal
      subTotal={calculateSubTotal()}
      discount={calculateDiscount()}
      tax={calculateTax()}
      total={calculateTotal()}
    />
  </CardContent>
</Card>
```

## 6. State Management

### 1. List Page State
```typescript
// State Hooks
const [currentPage, setCurrentPage] = useState(1)
const [searchTerm, setSearchTerm] = useState("")
const [selectedType, setSelectedType] = useState("All Types")
const [selectedStatus, setSelectedStatus] = useState("All Statuses")
const [sortField, setSortField] = useState<keyof PurchaseRequest | null>(null)
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
const [selectedPRs, setSelectedPRs] = useState<string[]>([])
const [advancedFilters, setAdvancedFilters] = useState<FilterType[]>([])
```

### 2. Detail Page State
```typescript
// Form State Management
const [formData, setFormData] = useState<PurchaseRequest>(initialData)
const [mode, setMode] = useState<"view" | "edit" | "add">(initialMode)
const [activeTab, setActiveTab] = useState("items")
const [validation, setValidation] = useState<ValidationState>({})
```

## 7. Styling Implementation

### 1. Shared Styles
```typescript
const sharedStyles = {
  card: "rounded-lg border bg-card text-card-foreground shadow-sm",
  header: "flex items-center justify-between p-6 border-b",
  title: "text-lg font-semibold",
  section: "p-6 space-y-4",
  grid: "grid gap-4",
  button: {
    base: "inline-flex items-center justify-center rounded-md text-sm font-medium",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  }
}
```

### 2. Responsive Design
```typescript
// Mobile-First Grid Layout
const gridClasses = {
  container: "grid gap-4 md:gap-6 lg:gap-8",
  cols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  form: "grid grid-cols-1 md:grid-cols-2 gap-4",
  table: "overflow-x-auto -mx-4 md:mx-0"
}
``` 