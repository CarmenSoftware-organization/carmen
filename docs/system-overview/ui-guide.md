# Carmen UI Guide

This guide provides a comprehensive overview of UI layout patterns and best practices for the Carmen application. Following these guidelines will ensure consistency across the application and improve both user experience and development efficiency.

## Table of Contents

1. [Page Layouts](#1-page-layouts)
2. [Form Layouts](#2-form-layouts)
3. [List/Table Layouts](#3-listtable-layouts)
4. [Detail View Layouts](#4-detail-view-layouts)
5. [Dashboard Layouts](#5-dashboard-layouts)
6. [Modal/Dialog Layouts](#6-modaldialog-layouts)
7. [View Layouts](#7-view-layouts-information-display)
8. [Responsive Design Best Practices](#responsive-design-best-practices)

## 1. Page Layouts

### Structure
- **Container**: Typically wrapped in a `div` with `container mx-auto py-6` classes
- **Header Section**: Contains page title, description, and action buttons
- **Content Area**: Main content of the page, often with spacing (`space-y-6` or `space-y-8`)

### Common Pattern
```tsx
<div className="container mx-auto py-6">
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">{pageTitle}</h1>
      <div className="flex gap-2">
        {/* Action buttons */}
      </div>
    </div>
    <main>
      {/* Page content */}
    </main>
  </div>
</div>
```

### Best Practices
- Use consistent spacing between sections (typically 6-8 units)
- Maintain a clear visual hierarchy with proper heading sizes
- Include breadcrumbs for deep navigation structures
- Ensure responsive behavior with appropriate grid layouts

## 2. Form Layouts

### Structure
- **Form Container**: Usually a `<form>` element with `space-y-6` for spacing
- **Section Groups**: Related fields grouped together, often in a `<Card>` component
- **Field Layout**: Typically using grid layouts for alignment
- **Action Buttons**: Positioned at the bottom, often in a `<DialogFooter>` for modals

### Common Pattern
```tsx
<form className="space-y-6">
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Section Title</h3>
    <div className="grid grid-cols-2 gap-4">
      {/* Form fields */}
    </div>
  </div>
  <Separator />
  <div className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

### Best Practices
- Group related fields together with clear section headings
- Use consistent spacing between fields (typically 4 units)
- Implement proper validation with clear error messages
- Maintain consistent field widths and alignments
- Use `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, and `<FormMessage>` components for consistent styling

## 3. List/Table Layouts

### Structure
- **Container**: Wrapped in the `ListPageTemplate` component or a div with `container mx-auto py-6`
- **Header Section**: Contains page title and action buttons (clearly separated)
- **Filters Section**: Contains search input and filter controls with proper spacing
- **Bulk Actions**: Conditionally displayed when items are selected
- **Content Area**: Table or card-based list with consistent styling
- **Pagination**: Positioned at the bottom with clear navigation controls

### Common Pattern
```tsx
<ListPageTemplate
  title="List Title"
  actionButtons={
    <div className="flex items-center gap-2">
      <Button onClick={handleCreateNew}>
        <Plus className="mr-2 h-4 w-4" /> New Item
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      <Button variant="outline">
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
    </div>
  }
  filters={
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center justify-between">
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={handleSearch}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* Filter options */}
            </DropdownMenuContent>
          </DropdownMenu>
          <AdvancedFilter
            filterFields={filterFields}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  }
  bulkActions={
    selectedItems.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline">Delete Selected</Button>
        <Button variant="outline">Approve Selected</Button>
      </div>
    ) : null
  }
  content={
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column 1</TableHead>
          {/* More columns */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.property}</TableCell>
            {/* More cells */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  }
/>
```

### Title and Page Actions Section
- **Title**: Use `text-2xl font-bold` for consistent styling, left-aligned
- **Action Buttons**: Group related actions with appropriate spacing, right-aligned
- **Primary Actions**: Use primary button style for main actions (e.g., "New Item")
- **Secondary Actions**: Use outline button style for secondary actions (e.g., "Export", "Print")
- **Icons**: Include appropriate icons for visual clarity

```tsx
<div className="flex justify-between items-center mb-4">
  <h1 className="text-2xl font-bold">{title}</h1>
  <div className="flex items-center gap-2">
    <Button onClick={handleCreateNew}>
      <Plus className="mr-2 h-4 w-4" /> New Item
    </Button>
    <Button variant="outline">
      <Download className="mr-2 h-4 w-4" /> Export
    </Button>
    <Button variant="outline">
      <Printer className="mr-2 h-4 w-4" /> Print
    </Button>
  </div>
</div>
```

### Search and Filters Section
- **Layout**: Use `justify-between` to separate search and filters
- **Search**: Left-aligned with appropriate placeholder text and responsive width
- **Filters**: Right-aligned, grouped with appropriate spacing
- **Simple Filters**: Use dropdown menus with clear labels
- **Advanced Filters**: Include an advanced filter component for complex filtering
- **Responsive**: Stack elements vertically on mobile, side-by-side on desktop

```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex flex-1 items-center justify-between">
    <Input
      placeholder="Search items..."
      value={searchTerm}
      onChange={handleSearch}
      className="h-8 w-[150px] lg:w-[250px]"
    />
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* Filter options */}
        </DropdownMenuContent>
      </DropdownMenu>
      <AdvancedFilter
        filterFields={filterFields}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  </div>
</div>
```

### Table Best Practices
- Use consistent styling for table headers (typically `bg-muted/50` with `font-medium`)
- Implement hover states for rows (`hover:bg-muted/10` with `transition-colors`)
- Use badges for status indicators with appropriate colors
- Include appropriate actions in the last column
- Implement sorting indicators on sortable columns
- Use consistent alignment (left for text, right for numbers)
- Ensure proper spacing within cells
- Make rows clickable with `cursor-pointer` for better UX
- Add subtle shadows to the table container with `shadow-sm`
- Use primary text color for key identifiers (like reference numbers)

### Row Actions Best Practices
- Place action buttons in the last column, right-aligned
- Use a consistent set of icon buttons for common actions:
  - `<FileText />` icon for View actions
  - `<Edit />` icon for Edit actions
  - `<Trash2 />` icon for Delete actions
  - `<MoreVertical />` for additional actions via dropdown
- Limit visible actions to 3-4 icons to prevent overcrowding
- Use rounded icon buttons (`rounded-full`) for a more modern look
- Use the following pattern for action buttons:

```tsx
<TableCell className="text-right">
  <div className="flex justify-end space-x-1">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleView(item.id)}
      className="h-8 w-8 rounded-full"
    >
      <span className="sr-only">View</span>
      <FileText className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleEdit(item.id)}
      className="h-8 w-8 rounded-full"
    >
      <span className="sr-only">Edit</span>
      <Edit className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleDelete(item.id)}
      className="h-8 w-8 rounded-full"
    >
      <span className="sr-only">Delete</span>
      <Trash2 className="h-4 w-4" />
    </Button>
    {/* For additional actions */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <span className="sr-only">More options</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleApprove(item.id)}>
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleReject(item.id)}>
          Reject
        </DropdownMenuItem>
        {/* More actions */}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</TableCell>
```

- Always include `sr-only` elements with descriptive text for accessibility
- Use consistent spacing (`space-x-1`) between action buttons
- Consider using tooltips for action buttons to improve clarity
- For mobile layouts, consider collapsing all actions into a single "More" dropdown
- When rows are clickable, use `e.stopPropagation()` in action button handlers

### View Mode Toggle

For list pages that support both table and card views, implement a toggle component:

```tsx
<div className="flex border rounded-md overflow-hidden mr-2">
  <Button
    variant={viewMode === 'table' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => setViewMode('table')}
    className="rounded-none h-8 px-2"
  >
    <List className="h-4 w-4" />
    <span className="sr-only">Table View</span>
  </Button>
  <Button
    variant={viewMode === 'card' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => setViewMode('card')}
    className="rounded-none h-8 px-2"
  >
    <LayoutGrid className="h-4 w-4" />
    <span className="sr-only">Card View</span>
  </Button>
</div>
```

- Position the toggle in the filter section, aligned with other filter controls
- Use a segmented control design with joined buttons
- Visually indicate the active view with the `default` variant
- Use the `ghost` variant for inactive options
- Use clear icons that represent each view (`List` and `LayoutGrid`)
- Include `sr-only` text for accessibility

### Card View Pattern

For a more visual and content-rich alternative to tables, implement a card view:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {items.map((item) => (
    <Card key={item.id} className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm">
      <div className="flex flex-col h-full">
        {/* Card Header */}
        <div className="p-5 pb-3 bg-muted/30 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => handleSelectItem(item.id)}
              />
              <div>
                <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </div>
        
        {/* Card Content */}
        <div className="p-5 flex-grow">
          <div className="mb-3">
            <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
            <p className="text-sm line-clamp-2">{item.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
            {/* Field pairs */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Label</p>
              <p className="text-sm font-medium">{value}</p>
            </div>
            {/* More field pairs */}
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
            {/* Important metrics */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Amount</p>
              <p className="text-base font-semibold">{formattedAmount}</p>
            </div>
          </div>
        </div>
        
        {/* Card Actions */}
        <div className="flex justify-end px-4 py-3 bg-muted/20 border-t space-x-1">
          {/* Action buttons - same as row actions */}
        </div>
      </div>
    </Card>
  ))}
</div>
```

Card view best practices:
- Use a responsive grid layout with appropriate breakpoints
- Organize content with clear visual hierarchy
- Use a subtle header section with background color
- Group related information in sections with appropriate spacing
- Use consistent typography and label styles
- Highlight important information with proper font sizing and weight
- Add subtle hover effects with `transition-colors`
- Use a consistent action area at the bottom
- Implement the same actions as in table view
- Include checkboxes for selection when bulk actions are available
- Use shadows and borders for visual definition
- Limit text length with `line-clamp` for descriptions
- Use a flexible layout with `flex-grow` to ensure consistent card heights

### Pagination Best Practices
- Position at the bottom of the list with proper spacing
- Show current page information (e.g., "Showing 1-10 of 50 results")
- Include navigation buttons for first, previous, next, and last pages
- Disable pagination buttons when appropriate
- Use consistent button sizing and spacing

```tsx
<div className="flex items-center justify-between space-x-2 py-4">
  <div className="flex-1 text-sm text-muted-foreground">
    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
  </div>
  <div className="space-x-2">
    <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
      <ChevronsLeft className="h-4 w-4" />
    </Button>
    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
      <ChevronRight className="h-4 w-4" />
    </Button>
    <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
      <ChevronsRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

## 4. Detail View Layouts

### Structure
- **Header**: Contains title, status, and action buttons
- **Content Sections**: Organized in cards or sections with clear headings
- **Tabs**: Often used to organize different aspects of the detail view
- **Information Display**: Typically using label-value pairs

### Common Pattern
```tsx
<div className="space-y-6">
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="text-muted-foreground">{item.description}</p>
    </div>
    <div className="flex gap-2">
      {/* Action buttons */}
    </div>
  </div>
  
  <Tabs defaultValue="tab1">
    <TabsList>
      <TabsTrigger value="tab1">General</TabsTrigger>
      <TabsTrigger value="tab2">Details</TabsTrigger>
      {/* More tabs */}
    </TabsList>
    
    <TabsContent value="tab1" className="space-y-4">
      <Card className="px-3 py-6">
        <h3 className="font-semibold mb-4">Section Title</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Label</p>
            <p className="font-medium">{value}</p>
          </div>
          {/* More information pairs */}
        </div>
      </Card>
    </TabsContent>
    
    {/* More tab content */}
  </Tabs>
</div>
```

### Best Practices
- Use cards to visually separate different information sections
- Maintain consistent spacing and alignment
- Use tabs for organizing complex information
- Implement a clear visual hierarchy with proper headings
- Include appropriate actions for editing or managing the item

## 5. Dashboard Layouts

### Structure
- **Header**: Contains title and period selectors
- **Metric Cards**: Summary metrics in a grid layout
- **Charts Section**: Visualizations in cards with clear headings
- **Recent Activity**: Often displayed in a table or list format

### Common Pattern
```tsx
<div className="space-y-8">
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold">{dashboardTitle}</h1>
    <div className="flex items-center gap-4">
      {/* Period selectors */}
    </div>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Metric cards */}
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">{metricTitle}</p>
            <p className="text-2xl font-bold">{metricValue}</p>
          </div>
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
    {/* More metric cards */}
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* Chart components */}
  </div>
  
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Activity list or table */}
    </CardContent>
  </Card>
</div>
```

### Best Practices
- Use a consistent grid layout for metric cards (typically 4 columns on desktop)
- Implement responsive layouts that stack on mobile
- Use appropriate visualizations for different data types
- Include period selectors for time-based data
- Maintain consistent card styling across the dashboard

## 6. Modal/Dialog Layouts

### Structure
- **Header**: Contains title and close button
- **Content**: Main content of the dialog, often a form
- **Footer**: Contains action buttons

### Common Pattern
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[800px] [&>button]:hidden">
    <DialogHeader>
      <div className="flex justify-between w-full items-center">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogClose asChild>
          <Button variant="ghost" size="sm">
            <XIcon className="h-4 w-4" />
          </Button>
        </DialogClose>
      </div>
    </DialogHeader>
    
    <div className="py-4">
      {/* Dialog content */}
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Best Practices
- Use appropriate width constraints based on content (`sm:max-w-[425px]` for small, `sm:max-w-[800px]` for medium)
- Include a close button in the header
- Implement proper focus management
- Use consistent button placement (cancel on left, confirm on right)
- Add scrolling for long content with `max-h-[90vh] overflow-y-auto`

## 7. View Layouts (Information Display)

### Structure
- **Header**: Contains title and action buttons (e.g., edit)
- **Content Sections**: Organized in cards with clear headings
- **Information Display**: Using label-value pairs in a consistent format

### Common Pattern
```tsx
<div className="space-y-6">
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-bold">{item.name}</h1>
    <Button variant="outline" size="sm" onClick={onEdit}>
      <Edit2Icon className="h-4 w-4 mr-2" />
      Edit
    </Button>
  </div>
  
  <Card className="px-3 py-6 space-y-4">
    <h2 className="text-lg font-semibold">Section Title</h2>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-muted-foreground">Label</p>
        <p className="font-medium">{value}</p>
      </div>
      {/* More information pairs */}
    </div>
  </Card>
  
  {/* More information sections */}
</div>
```

### Best Practices
- Use consistent formatting for label-value pairs
- Organize information in logical sections
- Use appropriate typography for different information types
- Include visual indicators for important information (badges, icons)
- Provide edit actions where appropriate

## Responsive Design Best Practices

1. **Mobile-First Approach**
   - Start with mobile layouts and enhance for larger screens
   - Use appropriate breakpoints (`sm`, `md`, `lg`, `xl`)

2. **Flexible Layouts**
   - Use grid layouts with responsive columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - Implement proper stacking on mobile devices

3. **Adaptive Components**
   - Hide less important information on smaller screens
   - Use responsive typography: smaller font sizes on mobile
   - Ensure touch targets are large enough on mobile (min 44px)

4. **Table Handling**
   - Implement horizontal scrolling for tables on small screens
   - Consider collapsing tables into card views on mobile

5. **Navigation**
   - Use appropriate mobile navigation patterns
   - Ensure forms are usable on small screens with proper input sizing

## Color Usage Guidelines

- **Primary**: Use for main actions, key UI elements, and primary buttons
- **Secondary**: Use for secondary actions, less prominent UI elements
- **Accent**: Use sparingly for highlighting important information
- **Destructive**: Use for delete actions and error states
- **Muted**: Use for subtle backgrounds and less important text

## Typography Guidelines

- **Headings**: Use consistent heading sizes (h1: 3xl, h2: 2xl, h3: xl, h4: lg)
- **Body Text**: Use base font size for body text
- **Small Text**: Use sm or xs for less important information
- **Font Weight**: Use semibold for headings, medium for important text, normal for body text

## Component Spacing

- **Between Sections**: 6-8 units (space-y-6, space-y-8)
- **Between Form Fields**: 4 units (space-y-4, gap-4)
- **Between Related Elements**: 2-3 units (space-y-2, gap-2)
- **Component Padding**: 4-6 units (p-4, p-6) 