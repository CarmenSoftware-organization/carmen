# Purchase Request Module Implementation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Directory Structure

The Purchase Request module is organized according to the Next.js App Router pattern:

```
app/(main)/procurement/purchase-requests/
├── page.tsx                    # Main PR list page
├── [id]/                       # PR detail page directory
│   └── page.tsx                # PR detail page
├── new/                        # New PR page directory
│   └── page.tsx                # New PR creation page
└── components/                 # Shared components
    ├── purchase-request-list.tsx  # List component
    ├── PRDetailPage.tsx        # Detail page component
    ├── PRForm.tsx              # Main PR form
    ├── PRHeader.tsx            # Header component
    ├── item-details-edit-form.tsx # Item editing form
    ├── SummaryTotal.tsx        # Financial summary component
    ├── advanced-filter.tsx     # Advanced filtering component
    ├── tabs/                   # Tab components
    │   ├── ItemsTab.tsx        # Items management tab
    │   ├── WorkflowTab.tsx     # Workflow status tab
    │   ├── BudgetsTab.tsx      # Budget management tab
    │   ├── AttachmentsTab.tsx  # Attachments tab
    │   └── ActivityTab.tsx     # Activity log tab
    └── utils.tsx               # Utility functions
```

## 2. List Page Implementation (`page.tsx` & `purchase-request-list.tsx`)

### Main Page Component
```typescript
// app/(main)/procurement/purchase-requests/page.tsx
import { PurchaseRequestList } from './components/purchase-request-list'

export default function PurchaseRequestsPage() {
  return (
    <div>
      <PurchaseRequestList />
    </div>
  )
}
```

### List Component Structure
```typescript
// app/(main)/procurement/purchase-requests/components/purchase-request-list.tsx
export function PurchaseRequestList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [sortField, setSortField] = useState<keyof PurchaseRequest | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedPRs, setSelectedPRs] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<FilterType[]>([]);
  
  // Filter, sort, and pagination logic
  
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Requests</h1>
        <div className="flex space-x-2">
          <Button onClick={handleCreatePR}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PRs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <TypeFilter
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
          <Button variant="outline" onClick={toggleAdvancedFilter}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {/* PR Cards List */}
      <div className="space-y-2">
        {getCurrentPageData().map((pr) => (
          <Card key={pr.id} className="overflow-hidden p-2 hover:bg-secondary">
            <div className="py-2 px-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedPRs.includes(pr.id)}
                    onCheckedChange={() => handleSelectPR(pr.id)}
                  />
                  <StatusBadge status={pr.status} />
                  <span className="text-lg font-medium">{pr.refNumber}</span>
                  <h3 className="text-lg font-semibold">{pr.description}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewPR(pr.id)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditPR(pr.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePR(pr.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
                {fieldConfigs.map((config) => (
                  <div key={String(config.field)} className="text-sm">
                    <div className="text-muted-foreground">{config.label}</div>
                    <div>
                      {config.format
                        ? typeof config.format === 'function'
                          ? config.format(pr[config.field as keyof PurchaseRequest])
                          : String(pr[config.field as keyof PurchaseRequest])
                        : String(pr[config.field as keyof PurchaseRequest])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={endIndex >= filteredData.length}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## 3. Detail Page Implementation (`[id]/page.tsx` & `PRDetailPage.tsx`)

### Detail Page Component
```typescript
// app/(main)/procurement/purchase-requests/[id]/page.tsx
import PRDetailPage from '../components/PRDetailPage'

export default function PRDetailPageWrapper() {
  return <PRDetailPage />
}
```

### PRDetailPage Component
```typescript
// app/(main)/procurement/purchase-requests/components/PRDetailPage.tsx
export default function PRDetailPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PurchaseRequest>(initialData);
  const [mode, setMode] = useState<"view" | "edit" | "add">("view");
  const [activeTab, setActiveTab] = useState("items");
  
  // Form handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFormDataChange = (data: Partial<PurchaseRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic
    setMode("view");
  };
  
  const handleModeChange = (newMode: "view" | "edit") => {
    setMode(newMode);
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/procurement/purchase-requests")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{formData.description}</h1>
            <div className="flex items-center gap-2">
              {mode === "view" ? (
                <Button onClick={() => handleModeChange("edit")}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="default" onClick={handleSubmit}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleModeChange("view")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="outline" size="sm">
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Basic Information Form */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="refNumber">Reference Number</Label>
              <Input
                id="refNumber"
                name="refNumber"
                value={formData.refNumber}
                onChange={handleInputChange}
                disabled={mode === "view"}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date.toISOString().split("T")[0]}
                onChange={(e) =>
                  handleFormDataChange({
                    date: new Date(e.target.value),
                  })
                }
                disabled={mode === "view"}
              />
            </div>
            {/* Additional form fields */}
          </div>
          
          {/* Tabs Section */}
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="budgets">Budget</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[400px]">
              <TabsContent value="items">
                <ItemsTab />
              </TabsContent>
              <TabsContent value="budgets">
                <BudgetsTab />
              </TabsContent>
              <TabsContent value="workflow">
                <WorkflowTab />
              </TabsContent>
              <TabsContent value="attachments">
                <AttachmentsTab />
              </TabsContent>
              <TabsContent value="activity">
                <ActivityTab />
              </TabsContent>
            </ScrollArea>
          </Tabs>
          
          {/* Summary Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <SummaryTotal
                subTotal={calculateSubTotal(formData)}
                discount={calculateDiscount(formData)}
                tax={calculateTax(formData)}
                total={calculateTotal(formData)}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 4. Items Tab Implementation (`ItemsTab.tsx`)

```typescript
// app/(main)/procurement/purchase-requests/components/tabs/ItemsTab.tsx
export function ItemsTab() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<PurchaseRequestItem[]>(itemDetails);
  const [selectedItem, setSelectedItem] = useState<PurchaseRequestItem | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"view" | "edit" | "add">("view");

  function handleSelectItem(itemId: string) {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }

  function openItemForm(
    item: PurchaseRequestItem | null,
    mode: "view" | "edit" | "add"
  ) {
    setSelectedItem(item);
    setFormMode(mode);
    setIsEditFormOpen(true);
  }

  function handleSave(formData: PurchaseRequestItem) {
    setItems(prevItems => {
      if (formData.id) {
        // Update existing item
        return prevItems.map(item => item.id === formData.id ? formData : item);
      } else {
        // Add new item
        return [...prevItems, { ...formData, id: Date.now().toString() }];
      }
    });
    setIsEditFormOpen(false);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Item Details</h2>
        <Button onClick={() => openItemForm(null, "add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => handleBulkAction("Accepted")}>
            Accept Selected
          </Button>
          <Button onClick={() => handleBulkAction("Rejected")}>
            Reject Selected
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedItems.length === items.length && items.length > 0}
                onCheckedChange={handleSelectAllItems}
              />
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(item.id || "")}
                  onCheckedChange={() => handleSelectItem(item.id || "")}
                />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>{item.quantityRequested}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>{item.totalAmount}</TableCell>
              <TableCell>
                <StatusBadge status={item.status || "Pending"} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openItemForm(item, "view")}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openItemForm(item, "edit")}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isEditFormOpen && (
        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent className="max-w-3xl">
            <ItemDetailsEditForm
              initialData={selectedItem || undefined}
              mode={formMode}
              onModeChange={setFormMode}
              onSave={handleSave}
              onCancel={() => setIsEditFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
```

## 5. Item Details Form Implementation (`item-details-edit-form.tsx`)

```typescript
// app/(main)/procurement/purchase-requests/components/item-details-edit-form.tsx
export function ItemDetailsEditForm({
  onSave,
  onCancel,
  initialData,
  mode,
  onModeChange,
}: ItemDetailsFormProps) {
  const [formData, setFormData] = useState<PurchaseRequestItem>(
    initialData ? { ...emptyItemData, ...initialData } : emptyItemData
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="w-full max-w-full mx-auto p-6">
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          {mode === "add" ? "Add New Item" : "Item Details"}
        </h2>
        <div className="flex items-center gap-2">
          {mode === "view" && (
            <Button variant="outline" onClick={() => onModeChange("edit")}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Basic Item Information */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <StatusBadge status={formData.status || "Pending"} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
            <FormField id="location" label="Location" required>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                disabled={mode === "view"}
                className="h-8 text-sm"
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField id="name" label="Product name" required>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
            </div>
            <div className="sm:col-span-3">
              <FormField id="description" label="Description" readOnly>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  readOnly={true}
                  className="h-8 text-sm"
                />
              </FormField>
            </div>
          </div>
        </div>
        
        {/* Quantity and Pricing */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Quantity and Pricing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormField id="quantityRequested" label="Quantity" required>
              <Input
                id="quantityRequested"
                name="quantityRequested"
                type="number"
                value={formData.quantityRequested}
                onChange={handleInputChange}
                required
                disabled={mode === "view"}
                className="h-8 text-sm"
              />
            </FormField>
            <FormField id="unit" label="Unit" required>
              <Input
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                disabled={mode === "view"}
                className="h-8 text-sm"
              />
            </FormField>
            <FormField id="price" label="Unit Price" required>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={mode === "view"}
                className="h-8 text-sm"
              />
            </FormField>
            <FormField id="currency" label="Currency" required>
              <Input
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                required
                disabled={mode === "view"}
                className="h-8 text-sm"
              />
            </FormField>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          {mode !== "view" && (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
```

## 6. State Management

The PR module uses React's built-in state management with the useState hook. State is managed at different levels:

1. **Page-level state**: Managed in the main page components (PurchaseRequestList, PRDetailPage)
2. **Component-level state**: Managed in individual components (ItemsTab, ItemDetailsEditForm)
3. **Form state**: Managed in form components using controlled inputs

### Data Flow

1. **Parent to Child**: Props are passed down from parent components to children
2. **Child to Parent**: Callback functions are passed to child components to update parent state
3. **Sibling Communication**: Siblings communicate through their common parent

Example of data flow:
```
PRDetailPage (manages formData)
├── passes formData to ItemsTab
├── passes handleUpdateItem callback to ItemsTab
└── ItemsTab calls handleUpdateItem when an item is updated
```

## 7. Utility Functions

```typescript
// app/(main)/procurement/purchase-requests/components/utils.tsx

// Calculate subtotal from items
export function calculateSubTotal(pr: PurchaseRequest): number {
  return pr.items?.reduce((sum, item) => sum + (item.subTotalPrice || 0), 0) || 0;
}

// Calculate discount total
export function calculateDiscount(pr: PurchaseRequest): number {
  return pr.items?.reduce((sum, item) => sum + (item.discountAmount || 0), 0) || 0;
}

// Calculate tax total
export function calculateTax(pr: PurchaseRequest): number {
  return pr.items?.reduce((sum, item) => sum + (item.taxAmount || 0), 0) || 0;
}

// Calculate grand total
export function calculateTotal(pr: PurchaseRequest): number {
  return calculateSubTotal(pr) - calculateDiscount(pr) + calculateTax(pr);
}

// Get badge variant based on status
export function getBadgeVariant(status: string): string {
  switch (status) {
    case 'Draft': return 'outline';
    case 'Submitted': return 'secondary';
    case 'Approved': return 'success';
    case 'Rejected': return 'destructive';
    case 'Cancelled': return 'outline';
    default: return 'outline';
  }
}

// Handle document status change
export function handleDocumentAction(
  action: string,
  document: PurchaseRequest
): PurchaseRequest {
  switch (action) {
    case 'submit':
      return { ...document, status: 'Submitted' };
    case 'approve':
      return { ...document, status: 'Approved' };
    case 'reject':
      return { ...document, status: 'Rejected' };
    case 'cancel':
      return { ...document, status: 'Cancelled' };
    default:
      return document;
  }
}
``` 