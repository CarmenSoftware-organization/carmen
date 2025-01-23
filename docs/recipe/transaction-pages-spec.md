# Transaction Pages Specification

## 1. Transaction List Page

### Header Section
Height: 64px
Layout:
```
┌─────────────────────────────────────────────┐
│ Title    Date Range Selector    Export      │
└─────────────────────────────────────────────┘
```

Components:
1. Title: "Transactions"
   - Font: 24px, bold
   - Position: Left-aligned

2. Date Range Selector
   - Type: Dropdown with calendar
   - Options:
     * Today
     * Yesterday
     * Last 7 days
     * Last 30 days
     * Custom range
   - Position: Center

3. Export Button
   - Type: Secondary button
   - Icon: Download
   - Options:
     * Export Selected
     * Export All
     * Export Filtered

### Filter Section
Layout: Horizontal flex container
Spacing: 16px between filters

Components:
1. Location Filter
   - Type: Multi-select dropdown
   - Search enabled
   - Quick selections:
     * All locations
     * Active locations
     * By region/group

2. Status Filter
   - Type: Multi-select dropdown
   - Options:
     * Completed
     * Processing
     * Failed
     * Voided

3. Transaction Type Filter
   - Type: Multi-select dropdown
   - Options:
     * Sales
     * Voids
     * Refunds
     * Manual entries

### Transaction Grid
Features:
- Sortable columns
- Row selection
- Expandable rows for details
- Frozen first column

Columns:
1. Date/Time
   - Width: 150px
   - Format: DD/MM/YYYY HH:mm
   - Sortable
   - Time zone indicator

2. Location
   - Width: 150px
   - Shows: Location code + name
   - Filter: Quick location filter

3. Item Details
   - Width: 250px
   - Expandable cell
   - Shows:
     * Item code
     * Description
     * Category
     * Unit price

4. Quantity/Amount
   - Width: 120px
   - Format: 
     * Quantity: Decimal with unit
     * Amount: Currency

5. Status
   - Width: 100px
   - Badge with color coding:
     * Completed: Green
     * Processing: Blue
     * Failed: Red
     * Voided: Gray

6. Actions
   - Width: 100px
   - Icons for actions:
     * View details
     * Void (if allowed)
     * Reprocess
     * Export

## 2. Failed Transactions Page

### Header Section
Height: 64px
Components:
1. Title: "Failed Transactions"
   - Font: 24px, bold
   - Position: Left-aligned

2. Repost All Button
   - Type: Primary button
   - State: Disabled if no failed transactions
   - Confirmation dialog on click

### Error Summary Section
Layout: Card with statistics
Content:
- Total failed transactions
- Failure categories breakdown
- Trend graph (last 24 hours)
- Quick action recommendations

### Failed Transaction Grid
Columns:
1. Error Type
   - Width: 150px
   - Categories:
     * Sync Error
     * Mapping Error
     * Data Error
     * System Error

2. Transaction Details
   - Width: 300px
   - Shows:
     * Transaction ID
     * Date/Time
     * Location
     * Items affected

3. Error Message
   - Width: 250px
   - Expandable for full error
   - Copy button for error text
   - Error code reference

4. Repost Action
   - Width: 100px
   - Repost button
   - Status indicator
   - Attempt counter

## 3. Stock-out Review Page

### Header Section
Height: 64px
Components:
1. Title: "Stock-out Review"
   - Font: 24px, bold
   - Position: Left-aligned

2. Approve All Button
   - Type: Primary button
   - State: Disabled unless items selected
   - Confirmation workflow

### Filter Section
Components:
1. Date Filter
   - Type: Date range picker
   - Default: Today

2. Location Filter
   - Type: Multi-select dropdown
   - Hierarchical selection

3. Status Filter
   - Type: Dropdown
   - Options:
     * Pending Review
     * Approved
     * Rejected
     * All

### Stock-out Grid
Features:
- Bulk selection
- Expandable rows
- Status tracking

Columns:
1. Date
   - Width: 120px
   - Format: DD/MM/YYYY
   - Time tooltip

2. Location
   - Width: 150px
   - Location details on hover

3. Items Count
   - Width: 100px
   - Link to detailed view

4. Total Amount
   - Width: 120px
   - Currency format
   - Variance indicator

5. Approve/Reject Actions
   - Width: 150px
   - Action buttons
   - Comment field
   - History log

### Common Elements

#### Pagination
Components:
- Items per page selector
- Page navigation
- Total items counter
- Page jump input

#### Bulk Actions
Features:
- Selection counter
- Action toolbar
- Progress indicator
- Undo capability

#### Export Options
Formats:
- Excel (.xlsx)
- CSV
- PDF (for reports)

### Interaction States

#### Grid Interactions
1. Row Selection
   - Single click: Select
   - Double click: View details
   - Shift+click: Range select

2. Bulk Actions
   - Select all checkbox
   - Batch processing
   - Status updates

3. Inline Actions
   - Quick actions
   - Contextual menus
   - Status updates

### Error Handling

1. Transaction Errors
   - Error categorization
   - Resolution workflows
   - Retry mechanisms

2. Validation Errors
   - Field validation
   - Business rule validation
   - User notifications

3. System Errors
   - Error logging
   - Recovery options
   - User feedback

### Responsive Behavior

#### Desktop (>1024px)
- Full feature set
- Multi-column layout
- Advanced filters

#### Tablet (768px-1024px)
- Simplified grid
- Collapsible filters
- Touch-optimized

#### Mobile (<768px)
- Card view
- Essential actions only
- Simplified filters