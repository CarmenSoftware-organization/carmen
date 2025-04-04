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
- **Container**: Typically wrapped in a `div` with `container mx-auto py-6 px-9` classes
- **Header Section**: Contains page title, description, and action buttons
- **Content Area**: Main content of the page, often with spacing (`space-y-6` or `space-y-8`)

### Common Pattern
```tsx
<div className="container mx-auto py-6 px-9">
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
- Always include 36px left and right padding (px-9 in Tailwind) for all pages
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
- **Container**: Often wrapped in a `<Card>` or div with `rounded-lg border bg-white`
- **Header Section**: Contains title and action buttons, search, quick filters, advance filtiers
- **Table Component**: Using the shadcn `<Table>` component with proper headers
- **Pagination**: Positioned at the bottom of the table

### Common Pattern
```tsx
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-2">
      {/* Search and filters */}
    </div>
    <div className="flex gap-2">
      {/* Action buttons */}
    </div>
  </div>
  
  <div className="rounded-lg border bg-white">
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50/75">
          <TableHead className="py-3 font-medium text-gray-600">Column 1</TableHead>
          {/* More column headers */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="group hover:bg-gray-50/50 cursor-pointer">
            <TableCell>{item.property}</TableCell>
            {/* More cells */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
  
  <Pagination />
</div>
```

### Best Practices
- Use consistent styling for table headers (typically `bg-gray-50/75` with `py-3 font-medium text-gray-600`)
- Implement hover states for rows (`hover:bg-gray-50/50`)
- Include appropriate actions in the last column
- Ensure responsive behavior with horizontal scrolling for small screens
- Use badges for status indicators

## 4. Detail View Layouts

### Structure
- **Header**: Contains title, status, and action buttons
- **Content Sections**: Organized in cards or sections with clear headings
- **Tabs**: Often used to organize different aspects of the detail view
- **Information Display**: Typically using label-value pairs
- **View Modes**: 
  - **View Mode**: Read-only display of information with Edit button
  - **Edit Mode**: Interactive form fields for modifying information

### Common Pattern
```tsx
<div className="space-y-6">
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="text-muted-foreground">{item.description}</p>
    </div>
    <div className="flex gap-2">
      {isEditMode ? (
        <>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      ) : (
        <Button onClick={() => setIsEditMode(true)}>
          <Edit2Icon className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
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
        {isEditMode ? (
          <form className="grid grid-cols-2 gap-4">
            {/* Form fields for editing */}
            <FormField
              control={form.control}
              name="fieldName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Label</p>
              <p className="font-medium">{value}</p>
            </div>
            {/* More information pairs */}
          </div>
        )}
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
- Toggle between View and Edit modes with proper state management
- Preserve form values when switching between view/edit modes
- Use consistent action button placement across both modes
- In Edit mode, maintain the same layout structure as View mode
- Provide clear visual indication of which mode the user is in

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