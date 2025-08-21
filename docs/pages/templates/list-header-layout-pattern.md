# List Header Layout & Structure Pattern

## Overview

This document provides a standardized template for implementing consistent list header layouts across all modules in the application. The pattern is based on the Purchase Request list implementation and ensures uniform user experience across different sections.

## Purpose

Create consistent list page interfaces with integrated filtering, search, and action capabilities that follow established UX patterns and maintain visual coherence throughout the application.

---

## 🎯 **Standardized List Header Implementation Pattern**

### Core Structure

The standard list header follows a four-tier layout:

1. **Title & Actions Row**: Module title with primary action buttons
2. **Description Row**: Explanatory text about the module's purpose  
3. **Filter Toolbar**: Search, quick filters, advanced filters, and view controls
4. **Active Filters Display**: Visual representation of applied filters

### Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ [Module Title]                            [New] [Export] [Print] │
│ [Description text explaining the module purpose]                │
├─────────────────────────────────────────────────────────────────┤
│ [🔍 Search Box] [Quick Filter Toggle] [Secondary Dropdowns]     │
│                                                                 │
│ [Saved ▼] [Advanced Filter] [Columns ▼] [📋 Table] [⊞ Card]   │
├─────────────────────────────────────────────────────────────────┤
│ Active Filters: [Filter 1 ×] [Filter 2 ×] [Clear all]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [DATA TABLE OR CARD GRID CONTENT HERE]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 **Implementation Template**

### 1. Main List Component Structure

```typescript
/**
 * STANDARD LIST HEADER PATTERN
 * Replace [MODULE_NAME] and [Entity] with your specific module details
 */

interface ListHeaderProps {
  title: string;
  description: string;
  totalCount?: number;
  selectedCount?: number;
}

const [MODULE_NAME]List = () => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">[Module Title]</h1>
          <p className="text-muted-foreground">
            [Module description and purpose explanation]
          </p>
        </div>
        
        {/* Action Buttons - Top aligned with title */}
        <div className="flex items-center space-x-2 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New [Entity]
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Create Blank [Entity]
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>[Entity] Templates</DropdownMenuLabel>
              <DropdownMenuItem>Template Option 1</DropdownMenuItem>
              <DropdownMenuItem>Template Option 2</DropdownMenuItem>
              <DropdownMenuItem>Template Option 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Data Table with integrated filtering */}
      <[MODULE_NAME]DataTable
        columns={[module]Columns}
        data={data}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardView={cardView}
      />
    </div>
  )
}
```

### 2. Data Table Toolbar Structure

```typescript
const [MODULE_NAME]DataTable = <TData, TValue>({
  columns,
  data,
  viewMode,
  onViewModeChange,
  cardView,
}: DataTableProps<TData, TValue>) => {
  const [globalFilter, setGlobalFilter] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<FilterType<TData>[]>([])
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption | null>(null)

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search [entities]..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 h-9 w-[250px] lg:w-[300px]"
            />
          </div>
          
          {/* Quick Filters Component - Module-specific implementation */}
          <[MODULE_NAME]QuickFilters 
            onQuickFilter={handleQuickFilter}
            activeFilter={quickFilter}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Saved Filters Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
                <span>Saved Filters</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              {/* Saved filters content */}
            </PopoverContent>
          </Popover>
          
          {/* Advanced Filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={`h-8 ${appliedFilters.length > 0 ? 'bg-primary/10 border-primary/20' : ''}`}
              >
                <Filter className="mr-2 h-4 w-4" />
                <span>Filter</span>
                {appliedFilters.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {appliedFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              {/* Advanced filter content */}
            </SheetContent>
          </Sheet>
          
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="rounded-none h-8 px-2"
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Table View</span>
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('card')}
              className="rounded-none h-8 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Card View</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {appliedFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1 px-2 py-1">
              {`${filter.field} ${filter.operator} ${filter.value}`}
              <button 
                onClick={() => {
                  const newFilters = appliedFilters.filter((_, i) => i !== index)
                  setAppliedFilters(newFilters)
                }} 
                className="ml-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Table or Card View */}
      {viewMode === 'table' ? (
        <div className="rounded-md border">
          <Table>
            {/* Table implementation */}
          </Table>
        </div>
      ) : (
        React.cloneElement(cardView as React.ReactElement, { data: filteredData })
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          {/* Pagination controls */}
        </div>
      </div>
    </div>
  )
}
```

### 3. Quick Filters Component Template

**Note**: Quick filters are module-specific and should be implemented based on each module's business requirements and user workflows. The following provides a flexible foundation:

```typescript
interface QuickFiltersProps {
  onQuickFilter: (filter: QuickFilterOption) => void
  activeFilter: QuickFilterOption | null
}

export interface QuickFilterOption {
  type: string  // Module-specific filter types (e.g., 'document', 'status', 'category', 'assignment')
  value: string
  label: string
}

export function [MODULE_NAME]QuickFilters({ onQuickFilter, activeFilter }: QuickFiltersProps) {
  // TODO: Define module-specific filter states and logic
  // Example implementation structure:
  
  return (
    <div className="flex items-center space-x-4">
      {/* TODO: Implement module-specific quick filters */}
      {/* 
        Common patterns include:
        - Primary view toggles (e.g., "My Items" vs "All Items")
        - Status filters (e.g., Active, Inactive, Pending)
        - Category/Type filters 
        - Assignment/Ownership filters
        - Date-based filters
        - Priority/Urgency filters
      */}
    </div>
  )
}
```

**Quick Filter Design Guidelines:**

1. **Primary Filters**: Main view toggles that define the data scope
2. **Secondary Filters**: Conditional filters that appear based on primary selection
3. **Always Available**: Filters that are always visible regardless of other selections
4. **Contextual Logic**: Show/hide filters based on user role, permissions, or business rules

**Common Quick Filter Patterns:**

- **Ownership-based**: "My Items" vs "All Items" vs "Assigned to Me"
- **Status-based**: Workflow states specific to the module
- **Time-based**: "Today", "This Week", "This Month"
- **Category-based**: Module-specific classifications
- **Priority-based**: High, Medium, Low priority items

---

## 🛠 **Module-Specific Customization Examples**

### Inventory Management Example

```typescript
// Module-specific quick filters for inventory
const InventoryQuickFilters = ({ onQuickFilter, activeFilter }: QuickFiltersProps) => {
  const [viewMode, setViewMode] = useState<'low-stock-alerts' | 'all-inventory'>('low-stock-alerts')
  
  // Inventory-specific filter options
  const statusOptions = [
    { value: 'all-status', label: 'All Status' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'discontinued', label: 'Discontinued' },
  ]
  
  const locationOptions = [
    { value: 'all-locations', label: 'All Locations' },
    { value: 'main-warehouse', label: 'Main Warehouse' },
    { value: 'cold-storage', label: 'Cold Storage' },
    { value: 'dry-storage', label: 'Dry Storage' },
  ]
  
  return (
    <div className="flex items-center space-x-4">
      {/* Primary view toggle */}
      <div className="flex bg-muted rounded-lg p-1">
        <Button variant={viewMode === 'low-stock-alerts' ? 'default' : 'ghost'} size="sm" className="h-8 px-3">
          Low Stock Alerts
        </Button>
        <Button variant={viewMode === 'all-inventory' ? 'default' : 'ghost'} size="sm" className="h-8 px-3">
          All Inventory
        </Button>
      </div>
      {/* Additional inventory-specific filters... */}
    </div>
  )
}

// Action buttons for inventory
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
<Button variant="outline" size="sm">
  <Upload className="mr-2 h-4 w-4" />
  Bulk Import
</Button>
<Button variant="outline" size="sm">
  <RefreshCw className="mr-2 h-4 w-4" />
  Stock Take
</Button>
```

### Vendor Management Example

```typescript
// Module-specific quick filters for vendors
const VendorQuickFilters = ({ onQuickFilter, activeFilter }: QuickFiltersProps) => {
  const [viewMode, setViewMode] = useState<'active-vendors' | 'all-vendors'>('active-vendors')
  
  // Vendor-specific filter options based on business requirements
  const statusOptions = [
    { value: 'all-status', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending-approval', label: 'Pending Approval' },
    { value: 'blacklisted', label: 'Blacklisted' },
  ]
  
  return (
    <div className="flex items-center space-x-4">
      {/* Primary view toggle */}
      <div className="flex bg-muted rounded-lg p-1">
        <Button variant={viewMode === 'active-vendors' ? 'default' : 'ghost'} size="sm" className="h-8 px-3">
          Active Vendors
        </Button>
        <Button variant={viewMode === 'all-vendors' ? 'default' : 'ghost'} size="sm" className="h-8 px-3">
          All Vendors
        </Button>
      </div>
      {/* Additional vendor-specific filters... */}
    </div>
  )
}

// Action buttons for vendors
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Vendor
</Button>
<Button variant="outline" size="sm">
  <Users className="mr-2 h-4 w-4" />
  Import Vendors
</Button>
<Button variant="outline" size="sm">
  <BarChart className="mr-2 h-4 w-4" />
  Performance Report
</Button>
```

### Store Operations Example

```typescript
// Module-specific quick filters for store operations
const StoreOperationsQuickFilters = ({ onQuickFilter, activeFilter }: QuickFiltersProps) => {
  const [viewMode, setViewMode] = useState<'pending-requests' | 'all-requests'>('pending-requests')
  
  // Store operations specific filter options
  const statusOptions = [
    { value: 'all-status', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'cancelled', label: 'Cancelled' },
  ]
  
  return (
    <div className="flex items-center space-x-4">
      {/* Primary view toggle */}
      <div className="flex bg-muted rounded-lg p-1">
        <Button variant={viewMode === 'pending-requests' ? 'default' : 'ghost'} size="sm" className="h-8 px-3">
          Pending Requests
        </Button>
        <Button variant={viewMode === 'all-requests' ? 'default' : 'ghost'} size="sm" className="h-8 px-3">
          All Requests
        </Button>
      </div>
      {/* Additional store operations specific filters... */}
    </div>
  )
}
```

---

## 📋 **Implementation Checklist**

### ✅ **Required Components**
- [ ] Main list page component with header structure
- [ ] Data table component with integrated toolbar  
- [ ] Quick filters component with conditional secondary options
- [ ] Advanced filters component with save/load functionality
- [ ] Column definitions with sorting and actions
- [ ] Card view component for mobile responsiveness

### ✅ **Required Features**
- [ ] Search functionality across key fields
- [ ] Primary/secondary filter system with conditional display
- [ ] Advanced filtering with multiple operators
- [ ] Saved filters with star/favorite system
- [ ] Active filter badges with individual removal
- [ ] Table/card view toggle
- [ ] Column visibility control
- [ ] Export/print functionality
- [ ] Pagination with row selection display

### ✅ **Business Logic Integration**
- [ ] Role-based access control for actions and visibility
- [ ] Module-specific workflow states and business rules
- [ ] Proper status and category mappings
- [ ] Conditional UI based on user permissions
- [ ] Bulk operations for selected items

### ✅ **Styling Consistency**
- [ ] Consistent spacing (px-6, py-6, space-y-4, space-x-2)
- [ ] Button sizing (h-8, h-9, size="sm")
- [ ] Color scheme matching existing theme
- [ ] Responsive design (md:flex-row, lg:w-[300px])
- [ ] Icon sizing consistency (h-4 w-4 for buttons, h-3 w-3 for close)
- [ ] Border radius and shadow consistency

### ✅ **Accessibility & UX**
- [ ] Proper ARIA labels and screen reader support
- [ ] Keyboard navigation for all interactive elements
- [ ] Loading states and error handling
- [ ] Mobile-first responsive design
- [ ] Clear visual hierarchy and information density

---

## 🎨 **Design System Guidelines**

### Spacing & Layout
- **Container**: `container mx-auto py-6 px-6`
- **Section spacing**: `space-y-6` for main sections, `space-y-4` for components
- **Button spacing**: `space-x-2` for button groups
- **Component padding**: `px-2 lg:px-3` for small components

### Typography & Sizing
- **Page title**: `text-3xl font-bold tracking-tight`
- **Description**: `text-muted-foreground`
- **Button height**: `h-8` for toolbar buttons, `h-9` for main actions
- **Input sizing**: `w-[250px] lg:w-[300px]` for search inputs

### Color & Theming
- **Active filters**: `bg-primary/10 border-primary/20`
- **Filter badges**: `variant="outline"` with `px-2 py-1`
- **Muted backgrounds**: `bg-muted` for toggles and secondary elements
- **Icon coloring**: `text-muted-foreground` for secondary icons

### Interactive States
- **Hover states**: Built-in shadcn/ui hover styles
- **Active states**: `variant="default"` for active selections
- **Disabled states**: Automatic via shadcn/ui button props
- **Loading states**: Implement skeleton loaders where appropriate

---

## 🚀 **Quick Start Guide**

To implement this pattern for a new module:

1. **Copy the template files** and replace placeholders:
   - `[MODULE_NAME]` → Your module name (e.g., `Inventory`)
   - `[Entity]` → Your entity name (e.g., `Item`)
   - `[entities]` → Plural entity name (e.g., `items`)

2. **Define your filter options** based on your module's business logic:
   - Primary view toggles (actionable vs. comprehensive views)
   - Status options relevant to your entities
   - Category/type classifications
   - Assignment/ownership filters

3. **Implement the filtering logic** in your data table:
   - Map filter values to your data model
   - Handle conditional secondary filters
   - Implement search across relevant fields

4. **Customize action buttons** for your module's operations:
   - Primary action (New/Add/Create)
   - Secondary actions (Import, Export, Reports)
   - Module-specific tools

5. **Design module-specific quick filters**:
   - Analyze business requirements and user workflows
   - Define primary view toggles based on user roles
   - Implement secondary filters based on primary selection
   - Follow established UI patterns and conventions

6. **Test the implementation**:
   - Verify all filters work correctly with module data
   - Test responsive behavior across devices
   - Validate role-based permissions and access control
   - Check accessibility compliance and keyboard navigation

This template provides a solid foundation for consistent, user-friendly list interfaces across your application while allowing appropriate customization for each module's unique business requirements and user workflows.