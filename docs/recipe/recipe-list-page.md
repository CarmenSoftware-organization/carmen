# Recipe List Page Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Page Layout

### Header Section
- Page title "Recipe Management"
- Create New Recipe button
- Search and filter controls

### Main Content
- Data grid/table displaying recipes with the following columns:
  - Recipe Code (sortable)
  - Description (sortable)
  - Category (sortable)
  - Location
  - Status (Active/Void)
  - Actions column

### Filter Section
- Search by Recipe Code or Description
- Filter by:
  - Category
  - Location
  - Status (Active/Void)
- Clear filters button

## Actions

### Page Level Actions
- Create New Recipe
- Export Recipe List
- Refresh List
- Clear Filters

### Row Level Actions
- View Recipe Details
- Edit Recipe
- Void Recipe
- Print Recipe
- Quick Cost Update

## Content Structure

### Recipe Table
```
| Recipe Code | Description | Category | Location | Status | Actions |
|-------------|-------------|-----------|----------|---------|----------|
| REC001      | Chocolate Cake | Desserts | Kitchen 1 | Active | [Actions] |
```

### Pagination
- Items per page selector (10, 25, 50, 100)
- Page navigation controls
- Total items count

### Loading States
- Initial loading indicator
- Action loading states
- Error states handling

## Responsive Behavior

### Desktop View
- Full table view with all columns
- Horizontal scrolling for many columns

### Tablet View
- Condensed table with essential columns
- Expandable rows for additional details

### Mobile View
- Card-based layout instead of table
- Essential information displayed
- Actions in dropdown menu

## Error Handling

### Error States
- No recipes found
- Search with no results
- Network error
- Loading error

### User Feedback
- Success/error messages for actions
- Confirmation dialogs for destructive actions
- Loading indicators for async operations