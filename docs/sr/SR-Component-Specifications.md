# Store Requisition Module - Component Specifications

> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Table of Contents
1. [Introduction](#introduction)
2. [Component Architecture](#component-architecture)
3. [Core Components](#core-components)
4. [Supporting Components](#supporting-components)
5. [Component Interactions](#component-interactions)
6. [State Management](#state-management)
7. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the components that make up the Store Requisition (SR) module. It covers component architecture, interfaces, props, state management, and interactions between components.

The Store Requisition module follows a component-based architecture, with a focus on reusability, maintainability, and performance. Components are organized into core components that handle primary functionality and supporting components that provide auxiliary features.

## Component Architecture

The SR module follows a hierarchical component structure:

```
app/(main)/store-operations/store-requisitions/
├── page.tsx                    # Main SR list page
├── [id]/                       # SR detail page directory
│   └── page.tsx                # SR detail page
└── components/                 # Shared components
    ├── store-requisition-detail.tsx  # Detail component
    ├── stock-movement-sr.tsx   # Stock movement component
    ├── approval-log-dialog.tsx # Approval log dialog
    ├── filter-builder.tsx      # Filter builder component
    ├── header-actions.tsx      # Header actions component
    ├── header-info.tsx         # Header info component
    ├── list-filters.tsx        # List filters component
    ├── list-header.tsx         # List header component
    └── tabs/                   # Tab components
        └── journal-entries-tab.tsx  # Journal entries tab
```

### Component Types

1. **Page Components**: Top-level components that handle routing and data fetching
2. **Container Components**: Manage state and business logic
3. **Presentation Components**: Render UI based on props
4. **Utility Components**: Reusable components for common UI patterns

### Component Design Principles

- **Single Responsibility**: Each component has a single, well-defined responsibility
- **Reusability**: Components are designed to be reusable across the module
- **Composability**: Components can be composed to create more complex UIs
- **Testability**: Components are designed to be easily testable
- **Accessibility**: Components follow accessibility best practices

## Core Components

### StoreRequisitionList

The main component for displaying a list of store requisitions with filtering and sorting capabilities.

#### Props Interface

```typescript
interface StoreRequisitionListProps {
  initialFilters?: Filter[]
  onRequisitionSelect?: (id: string) => void
  showActions?: boolean
  showPagination?: boolean
  maxItems?: number
}
```

#### Component Structure

```tsx
function StoreRequisitionList({
  initialFilters,
  onRequisitionSelect,
  showActions = true,
  showPagination = true,
  maxItems
}: StoreRequisitionListProps) {
  // State for requisitions, loading, pagination, etc.
  
  // Data fetching logic
  
  return (
    <div className="space-y-4">
      {showActions && <ListFilters onFilterChange={handleFilterChange} initialFilters={initialFilters} />}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {/* Table headers */}
          </TableHeader>
          <TableBody>
            {/* Requisition rows */}
          </TableBody>
        </Table>
      </div>
      
      {showPagination && <Pagination />}
    </div>
  )
}
```

#### Key Features

- Displays requisitions in a tabular format
- Supports filtering by status, date, location, etc.
- Supports sorting by various columns
- Implements pagination for large datasets
- Provides row-level actions (view, edit, etc.)

### StoreRequisitionDetail

The main component for displaying and managing a store requisition.

#### Props Interface

```typescript
interface StoreRequisitionDetailProps {
  id: string
  mode: 'view' | 'edit' | 'create'
  onSave?: (data: Requisition) => Promise<void>
  onCancel?: () => void
  onStatusChange?: (status: string) => void
}
```

#### Component Structure

```tsx
function StoreRequisitionDetail({
  id,
  mode = 'view',
  onSave,
  onCancel,
  onStatusChange
}: StoreRequisitionDetailProps) {
  // State for requisition data, loading, etc.
  
  // Data fetching and mutation logic
  
  return (
    <div className="space-y-6">
      <HeaderInfo requisition={requisition} />
      
      <HeaderActions 
        requisition={requisition} 
        onEdit={handleEdit} 
        onVoid={handleVoid} 
        onPrint={handlePrint} 
        onBack={handleBack} 
      />
      
      <div className="rounded-md border p-4">
        {/* Requisition details */}
        <RequisitionItems items={requisition.items} editable={mode === 'edit'} />
      </div>
      
      <Tabs defaultValue="journal">
        <TabsList>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <JournalEntriesTab requisitionId={id} />
        </TabsContent>
        <TabsContent value="comments">
          {/* Comments tab content */}
        </TabsContent>
        <TabsContent value="attachments">
          {/* Attachments tab content */}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4">
        {/* Action buttons based on mode and status */}
      </div>
    </div>
  )
}
```

#### Key Features

- Displays comprehensive requisition details
- Supports different modes (view, edit, create)
- Manages requisition lifecycle (draft, submit, approve, reject, process)
- Provides tabbed interface for related information
- Implements form validation for data entry

### StockMovementSR

Component for displaying and managing stock movements related to a store requisition.

#### Props Interface

```typescript
interface StockMovementSRProps {
  requisitionId: string
  readOnly?: boolean
  onMovementComplete?: (movement: StockMovement) => void
}
```

#### Component Structure

```tsx
function StockMovementSR({
  requisitionId,
  readOnly = false,
  onMovementComplete
}: StockMovementSRProps) {
  // State for stock movement data, loading, etc.
  
  // Data fetching and mutation logic
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Stock Movement</h3>
        {!readOnly && (
          <Button onClick={handleProcess} disabled={!canProcess}>
            Process Movement
          </Button>
        )}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {/* Table headers */}
          </TableHeader>
          <TableBody>
            {/* Stock movement items */}
          </TableBody>
          <TableFooter>
            {/* Totals */}
          </TableFooter>
        </Table>
      </div>
      
      {!readOnly && (
        <div className="space-y-4">
          {/* Lot tracking UI if applicable */}
          {/* Additional processing options */}
        </div>
      )}
    </div>
  )
}
```

#### Key Features

- Displays stock movement details related to a requisition
- Supports processing of stock movements
- Manages lot tracking for applicable items
- Calculates before and after quantities
- Validates stock availability

## Supporting Components

### ApprovalLogDialog

Component for displaying the approval history of a requisition.

#### Props Interface

```typescript
interface ApprovalLogDialogProps {
  requisitionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

#### Component Structure

```tsx
function ApprovalLogDialog({
  requisitionId,
  open,
  onOpenChange
}: ApprovalLogDialogProps) {
  // State for approval log data, loading, etc.
  
  // Data fetching logic
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Approval Log</DialogTitle>
          <DialogDescription>
            Approval history for requisition {requisitionId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Approval log entries */}
          {approvalLog.map((entry) => (
            <div key={entry.id} className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium">{entry.action}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              <div className="text-sm">{entry.user}</div>
              {entry.comments && (
                <div className="text-sm mt-1">{entry.comments}</div>
              )}
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### Key Features

- Displays approval history in a modal dialog
- Shows approval actions, timestamps, users, and comments
- Supports scrolling for long approval histories
- Provides a clean, focused UI for reviewing approvals

### FilterBuilder

Component for building advanced filters for the store requisition list.

#### Props Interface

```typescript
interface FilterBuilderProps {
  onFilterChange: (filters: Filter[]) => void
  initialFilters?: Filter[]
}

interface Filter {
  field: string
  operator: string
  value: string | number | boolean | Date
}
```

#### Component Structure

```tsx
function FilterBuilder({
  onFilterChange,
  initialFilters = []
}: FilterBuilderProps) {
  // State for filters, fields, operators, etc.
  
  // Filter management logic
  
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Advanced Filters</h3>
        <Button variant="outline" size="sm" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>
      
      {filters.map((filter, index) => (
        <div key={index} className="flex space-x-2 items-center">
          <Select
            value={filter.field}
            onValueChange={(value) => handleFieldChange(index, value)}
          >
            {/* Field options */}
          </Select>
          
          <Select
            value={filter.operator}
            onValueChange={(value) => handleOperatorChange(index, value)}
          >
            {/* Operator options based on field type */}
          </Select>
          
          {/* Value input based on field type */}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveFilter(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddFilter}
        className="mt-2"
      >
        Add Filter
      </Button>
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
```

#### Key Features

- Allows building complex filter expressions
- Supports different field types (text, number, date, boolean)
- Provides appropriate operators based on field type
- Allows adding, removing, and modifying filters
- Validates filter expressions

### HeaderActions

Component for displaying action buttons in the header of the detail view.

#### Props Interface

```typescript
interface HeaderActionsProps {
  requisition: Requisition
  onEdit: () => void
  onVoid: () => void
  onPrint: () => void
  onBack: () => void
}
```

#### Component Structure

```tsx
function HeaderActions({
  requisition,
  onEdit,
  onVoid,
  onPrint,
  onBack
}: HeaderActionsProps) {
  // Logic for determining available actions based on status
  
  return (
    <div className="flex justify-between items-center">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="flex space-x-2">
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        
        {canVoid && (
          <Button variant="outline" size="sm" onClick={onVoid}>
            <Ban className="h-4 w-4 mr-2" />
            Void
          </Button>
        )}
        
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Additional actions */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
```

#### Key Features

- Displays context-sensitive action buttons
- Shows/hides buttons based on requisition status
- Provides primary actions directly in the header
- Includes secondary actions in a dropdown menu
- Implements consistent button styling and iconography

### HeaderInfo

Component for displaying basic information about a requisition in the header.

#### Props Interface

```typescript
interface HeaderInfoProps {
  requisition: Requisition
}
```

#### Component Structure

```tsx
function HeaderInfo({ requisition }: HeaderInfoProps) {
  // Status badge styling logic
  
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold">{requisition.refNo}</h2>
        <p className="text-muted-foreground">
          Created on {formatDate(requisition.createdAt)} by {requisition.createdBy}
        </p>
      </div>
      
      <div className="flex flex-col items-end">
        <Badge variant={statusVariant}>{requisition.status}</Badge>
        {requisition.updatedAt && (
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {formatDate(requisition.updatedAt)}
          </p>
        )}
      </div>
    </div>
  )
}
```

#### Key Features

- Displays requisition reference number prominently
- Shows creation information (date, user)
- Displays status with appropriate styling
- Shows last update information if available
- Implements responsive layout for different screen sizes

### ListFilters

Component for filtering the store requisition list.

#### Props Interface

```typescript
interface ListFiltersProps {
  onFilterChange: (filters: Filter[]) => void
  initialFilters?: Filter[]
}
```

#### Component Structure

```tsx
function ListFilters({
  onFilterChange,
  initialFilters = []
}: ListFiltersProps) {
  // State for filters, view options, etc.
  
  // Filter management logic
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
      <div className="flex flex-1 items-center space-x-2">
        <Select
          value={view}
          onValueChange={handleViewChange}
          className="w-[180px]"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requisitions</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-[300px]"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Status filter options */}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdvancedFilters}
        >
          Advanced
        </Button>
      </div>
      
      {showAdvancedFilters && (
        <FilterBuilder
          onFilterChange={handleAdvancedFilterChange}
          initialFilters={advancedFilters}
        />
      )}
    </div>
  )
}
```

#### Key Features

- Provides quick filters for common scenarios
- Includes search functionality for text-based filtering
- Supports advanced filtering through FilterBuilder
- Implements responsive layout for different screen sizes
- Maintains filter state for consistent user experience

### JournalEntriesTab

Component for displaying journal entries related to a store requisition.

#### Props Interface

```typescript
interface JournalEntriesTabProps {
  requisitionId: string
}
```

#### Component Structure

```tsx
function JournalEntriesTab({ requisitionId }: JournalEntriesTabProps) {
  // State for journal entries, loading, etc.
  
  // Data fetching logic
  
  return (
    <div className="space-y-4">
      {journalEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No journal entries found for this requisition.
        </div>
      ) : (
        journalEntries.map((entry) => (
          <div key={entry.id} className="border rounded-md p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{entry.documentType} - {entry.documentNumber}</h4>
                <p className="text-sm text-muted-foreground">
                  Posted on {formatDate(entry.postingDate)}
                </p>
              </div>
              <Badge variant={entry.status === 'Posted' ? 'success' : 'default'}>
                {entry.status}
              </Badge>
            </div>
            
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.entries.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {line.accountCode} - {line.accountName}
                      </TableCell>
                      <TableCell>{line.costCenter}</TableCell>
                      <TableCell className="text-right">
                        {line.debit > 0 ? formatCurrency(line.debit) : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        {line.credit > 0 ? formatCurrency(line.credit) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.totalDebit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.totalCredit)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
```

#### Key Features

- Displays journal entries in a structured format
- Shows entry header information (document type, number, date)
- Displays entry lines with account, cost center, debit, and credit
- Shows totals for each journal entry
- Handles empty state gracefully

## Component Interactions

### Data Flow

The SR module follows a unidirectional data flow pattern:

1. **Data Fetching**: Page components fetch data from the server
2. **Data Distribution**: Data is passed down to child components via props
3. **User Interaction**: User interactions trigger events that are handled by parent components
4. **Data Mutation**: Parent components handle data mutations and update the server
5. **UI Updates**: Updated data flows back down to child components

### Component Communication

Components communicate through the following mechanisms:

1. **Props**: Parent components pass data and callbacks to child components
2. **Events**: Child components trigger events that are handled by parent components
3. **Context**: Shared state is managed through React Context for cross-component communication
4. **Custom Hooks**: Reusable logic is encapsulated in custom hooks

### Interaction Patterns

#### Creating a Requisition

1. User navigates to the SR list page
2. User clicks "New Requisition" button
3. System navigates to the SR detail page in create mode
4. User fills out requisition details and adds items
5. User submits the requisition
6. System validates the data and creates the requisition
7. System navigates back to the SR list page with a success message

#### Approving a Requisition

1. User navigates to the SR detail page for a pending requisition
2. User reviews requisition details
3. User clicks "Approve" button
4. System displays approval dialog for comments
5. User enters comments and confirms approval
6. System updates the requisition status and records the approval
7. System refreshes the page to show updated status

#### Processing a Requisition

1. User navigates to the SR detail page for an approved requisition
2. User clicks "Process" button
3. System displays the stock movement interface
4. User enters actual quantities and lot information
5. User confirms processing
6. System creates stock movement records and updates inventory
7. System updates the requisition status and refreshes the page

## State Management

### Local Component State

Each component manages its own local state using React's `useState` and `useReducer` hooks. Local state includes:

- UI state (loading, error, form values)
- Temporary data (unsaved changes)
- Component-specific state (expanded/collapsed sections)

### Global State

Global state is managed using React Context and custom hooks. Global state includes:

- User preferences
- Authentication state
- Shared configuration
- Notification state

### Server State

Server state is managed using React Query. This includes:

- Requisition data
- Reference data (locations, items, etc.)
- User permissions
- System configuration

### State Persistence

State is persisted through the following mechanisms:

- Server database for permanent data
- Local storage for user preferences
- URL parameters for filter state
- Form state for unsaved changes

## Related Documentation

- [Store Requisition Overview](./SR-Overview.md)
- [Store Requisition Technical Specification](./SR-Technical-Specification.md)
- [Store Requisition User Experience](./SR-User-Experience.md)
- [Store Requisition API Specifications](./SR-API-Specifications.md)
- [Store Requisition Module Structure](./SR-Module-Structure.md) 