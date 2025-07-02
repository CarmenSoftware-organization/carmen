# Purchase Request List Page: UI/UX Specification

This document outlines the UI/UX design and functional requirements for the Purchase Request (PR) List page and its associated components.

## 1. PR List Page Overview

### 1.1. Purpose

The Purchase Request List page serves as the primary interface for users to view, search, filter, and manage purchase requests. It provides a comprehensive overview of all purchase requests relevant to the user based on their role and permissions.

### 1.2. Layout Structure

The page is organized into the following sections:

1. **Header**: Contains the page title, primary action buttons, and view toggles
2. **Filter Bar**: Provides search and filtering capabilities
3. **Bulk Actions**: Appears when items are selected, offering batch operations
4. **Data Table/Grid**: Displays the purchase requests in tabular or grid format
5. **Pagination**: Controls for navigating through multiple pages of results
6. **Status Summary**: Shows counts of PRs by status (optional)

## 2. Header Section

### 2.1. Components

- **Page Title**: "Purchase Requests"
- **Primary Action Buttons**:
  - **New PR**: Creates a new purchase request
  - **Export**: Dropdown with options (Excel, CSV, PDF)
  - **Print**: Prints the current view or selected items
  - **View Toggle**: Switches between table and grid views
- **View Selector**: Dynamic toggles based on RBAC widget access (My PR, My Approvals, Ready for PO)

### 2.2. Visual Design

- The header uses a clean, minimal design with adequate spacing
- Primary action buttons are prominently displayed with appropriate icons
- The "New PR" button uses the primary color to draw attention

## 3. Filter Bar Section

### 3.1. Components

- **Search Input**: Global search field that filters across multiple columns
- **RBAC Widget Toggles**: Dynamic buttons based on user's widget access permissions (myPR, myApproval, myOrder)
- **Advanced Filter Button**: Opens the advanced filtering panel
- **Active Filters Display**: Shows currently applied filters with the ability to remove them
- **Secondary Filter Dropdown**: Context-sensitive filters based on selected widget toggle
- **Column Visibility**: Button to toggle column visibility

### 3.2. RBAC Widget Access Control

The filter interface dynamically adapts based on user's role configuration:

```typescript
interface RoleConfiguration {
  widgetAccess: {
    myPR: boolean;        // Shows "My PR" toggle
    myApproval: boolean;  // Shows "My Approvals" toggle
    myOrder: boolean;     // Shows "Ready for PO" toggle
  }
  visibilitySetting: 'location' | 'department' | 'full';
}
```

### 3.3. Advanced Filter Panel

- **Filter Categories**:
  - Status (Draft, Submitted, In Progress, Approved, Rejected)
  - Date Range (Created Date, Required Date)
  - Department (filtered by visibilitySetting)
  - Requestor (filtered by visibilitySetting)
  - Vendor
  - Amount Range
  - PR Type
  - Workflow Stage (based on user's assigned stages)
- **Filter Operators**: Equals, Contains, Greater Than, Less Than, Between
- **Logical Operators**: AND, OR for combining multiple filters
- **Save Filter**: Option to save the current filter configuration for future use
- **Clear All**: Button to reset all filters

## 4. Bulk Actions Section

### 4.1. Components

- **Selection Counter**: Shows the number of selected items
- **Bulk Action Buttons**:
  - **Approve**: Approve selected PRs (visible to approvers only)
  - **Reject**: Reject selected PRs (visible to approvers only)
  - **Delete**: Delete selected PRs (visible for draft PRs only)
  - **Export**: Export selected PRs
  - **Print**: Print selected PRs
  - **Change Status**: Change the status of selected PRs (admin only)

### 4.2. Visual Design

- The bulk actions bar appears only when items are selected
- It uses a distinct background color to differentiate it from the rest of the interface
- Action buttons are grouped logically based on function

## 5. Data Table Section

### 5.1. Table Columns

| Column | Description | Sortable | Filterable |
|--------|-------------|----------|------------|
| Checkbox | Selection checkbox | No | No |
| Ref Number | PR reference number | Yes | Yes |
| Date | PR creation date | Yes | Yes |
| Requestor | Name of the requestor | Yes | Yes |
| Department | Department of the requestor | Yes | Yes |
| Description | Brief description of the PR | Yes | Yes |
| Status | Current status of the PR | Yes | Yes |
| Workflow Stage | Current workflow stage | Yes | Yes |
| Total Amount | Total amount of the PR | Yes | Yes |
| Currency | Currency code | Yes | Yes |
| Vendor | Vendor name | Yes | Yes |
| Actions | Action buttons | No | No |

### 5.2. Row Actions

- **View**: Opens the PR details page in view mode
- **Edit**: Opens the PR details page in edit mode (visible for editable PRs only)
- **Delete**: Deletes the PR (visible for draft PRs only)
- **Duplicate**: Creates a copy of the PR
- **Workflow Actions**: Context-specific workflow actions (Approve, Reject, etc.)

### 5.3. Visual Design

- Each row is clearly delineated with subtle borders or background alternation
- Status is displayed using color-coded badges for quick identification
- Hover states provide visual feedback for interactive elements
- Row selection is indicated with a distinct background color

### 5.4. Grid View Alternative

- Displays PRs as cards in a grid layout
- Each card shows key information: Ref Number, Date, Requestor, Status, Total Amount
- Cards have the same action options as table rows
- Cards use color-coding for status indication

## 6. Pagination Section

### 6.1. Components

- **Page Navigation**: First, Previous, Page Numbers, Next, Last
- **Items Per Page**: Dropdown to select the number of items per page (10, 25, 50, 100)
- **Page Information**: Showing X to Y of Z items

### 6.2. Visual Design

- Pagination controls are clearly visible at the bottom of the table
- Current page is highlighted
- Disabled navigation buttons (e.g., Previous on first page) have reduced opacity

## 7. Status Summary Section (Optional)

### 7.1. Components

- **Status Cards**: Small cards showing counts for each status
  - Draft: X
  - Submitted: X
  - In Progress: X
  - Approved: X
  - Rejected: X
- Each card is clickable to filter the list by that status

### 7.2. Visual Design

- Cards use the same color coding as status badges
- Counts are prominently displayed
- Current filter status is highlighted

## 8. Responsive Design

### 8.1. Desktop (1200px+)

- Full table with all columns visible
- Advanced filtering options readily accessible
- Grid view shows 4-5 cards per row

### 8.2. Tablet (768px - 1199px)

- Table with reduced column set (configurable priority)
- Horizontal scrolling for full table view
- Grid view shows 2-3 cards per row
- Advanced filtering in collapsible panel

### 8.3. Mobile (< 768px)

- Card-based list view replaces table by default
- Single column grid view
- Simplified filtering with expandable advanced options
- Bottom action bar for common actions

## 9. States and Interactions

### 9.1. Loading State

- Skeleton loader for table/grid while data is being fetched
- Loading indicator for filtering operations

### 9.2. Empty State

- When no PRs match the current filters:
  - Clear illustration
  - "No purchase requests found" message
  - Suggestion to clear filters or create a new PR
  - Action button to create new PR

### 9.3. Error State

- Error message with description
- Retry button
- Contact support option

### 9.4. Selection State

- Visual indication of selected rows/cards
- Bulk action bar appears
- Count of selected items displayed

## 10. Accessibility Considerations

- All interactive elements have appropriate ARIA labels
- Color is not the only means of conveying information
- Keyboard navigation is fully supported
- Focus states are clearly visible
- Screen reader compatibility for all elements
- Sufficient color contrast for text and interactive elements

## 11. Performance Considerations

- Virtualized list rendering for large datasets
- Pagination to limit initial data load
- Debounced search input to reduce API calls
- Optimistic UI updates for common actions
- Cached filter results where appropriate

## 12. Integration Points

- **API Endpoints**:
  - GET /api/purchase-requests (with filtering, sorting, pagination)
  - POST /api/purchase-requests (create new PR)
  - DELETE /api/purchase-requests/:id (delete PR)
  - POST /api/purchase-requests/bulk-actions (bulk operations)
- **User Permissions**: Integration with RBAC system
- **Notifications**: Real-time updates for status changes
- **Export Services**: Integration with export/print services