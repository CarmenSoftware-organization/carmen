# Purchase Request List Page: Action Flow

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document outlines the user and system action flows for the Purchase Request (PR) List page interactions.

## 1. Page Load and Initial Display

### 1.1. Initial Page Load
1. **User Action**: Navigates to the Purchase Request list page
2. **System Action**: 
   - Authenticates user and checks permissions
   - Loads default view based on user role
   - Fetches PR data with default filters applied
   - Renders the list with loading state
3. **System Action**: Displays PRs based on user's role and permissions
   - **Requester**: Shows only their own PRs
   - **Approver**: Shows PRs pending their approval + their own PRs
   - **Purchasing**: Shows all approved PRs + their own PRs
   - **Admin**: Shows all PRs

### 1.2. Default View Selection (RBAC-Based)
- **Based on Widget Access**: First available widget from user's RBAC configuration
- **Priority Order**: myPR → myApproval → myOrder → fallback to advanced filters
- **Dynamic Loading**: Views are generated based on `roleConfig.widgetAccess`
- **No Hardcoded Views**: All toggles are permission-controlled

## 2. Search and Filtering Actions

### 2.1. Global Search
1. **User Action**: Types in the search input field
2. **System Action**: 
   - Debounces input (300ms delay)
   - Searches across: Ref Number, Description, Requestor Name, Vendor
   - Updates the table with filtered results
   - Shows "No results found" if no matches
3. **User Action**: Clears search
4. **System Action**: Resets to previous filter state

### 2.2. Advanced Filtering
1. **User Action**: Clicks "Advanced Filter" button
2. **System Action**: Opens advanced filter panel
3. **User Action**: Selects filter criteria:
   - Status filter (multi-select)
   - Date range picker
   - Department dropdown
   - Requestor search/select
   - Amount range slider
   - Vendor search/select
4. **User Action**: Clicks "Apply Filters"
5. **System Action**:
   - Validates filter criteria
   - Applies filters to dataset
   - Updates URL with filter parameters
   - Refreshes table with filtered results
   - Shows active filter badges
6. **User Action**: Clicks "Clear All Filters"
7. **System Action**: Resets all filters to default state

### 2.3. Quick Filter by Status
1. **User Action**: Clicks on a status badge in status summary
2. **System Action**: 
   - Applies status filter
   - Updates table immediately
   - Shows active filter indicator

### 2.4. Save Filter Configuration
1. **User Action**: Configures filters and clicks "Save Filter"
2. **System Action**: 
   - Opens save filter dialog
   - Prompts for filter name
3. **User Action**: Enters filter name and saves
4. **System Action**: 
   - Saves filter configuration to user preferences
   - Adds filter to saved filters dropdown

## 3. Sorting Actions

### 3.1. Column Header Sorting
1. **User Action**: Clicks on a sortable column header
2. **System Action**: 
   - Toggles sort direction (asc → desc → none)
   - Updates sort indicator in column header
   - Re-sorts data and refreshes table
   - Updates URL with sort parameters

### 3.2. Multi-Column Sorting
1. **User Action**: Holds Ctrl/Cmd and clicks additional column headers
2. **System Action**: 
   - Adds secondary sort criteria
   - Shows sort priority indicators
   - Applies multi-level sorting

## 4. Selection Actions

### 4.1. Single Row Selection
1. **User Action**: Clicks checkbox on a table row
2. **System Action**: 
   - Toggles row selection state
   - Updates selection count
   - Shows/hides bulk action bar
   - Enables/disables bulk action buttons based on selection

### 4.2. Select All
1. **User Action**: Clicks "Select All" checkbox in header
2. **System Action**: 
   - Selects all visible rows on current page
   - Updates all row checkboxes
   - Shows bulk action bar with total count
3. **User Action**: Clicks "Select All" again
4. **System Action**: Deselects all rows

### 4.3. Select All Pages
1. **User Action**: Clicks "Select all X items across all pages" link
2. **System Action**: 
   - Selects all items matching current filters
   - Updates selection count to total
   - Shows warning about bulk action scope

## 5. Bulk Actions

### 5.1. Bulk Approve (Approvers Only)
1. **User Action**: Selects multiple PRs and clicks "Approve"
2. **System Action**: 
   - Validates user permissions for each PR
   - Shows confirmation dialog with list of PRs
3. **User Action**: Confirms bulk approval
4. **System Action**: 
   - Processes approvals in batch
   - Shows progress indicator
   - Updates PR statuses
   - Sends notifications to relevant users
   - Refreshes table
   - Shows success/error summary

### 5.2. Bulk Reject (Approvers Only)
1. **User Action**: Selects multiple PRs and clicks "Reject"
2. **System Action**: Opens rejection reason dialog
3. **User Action**: Enters rejection reason and confirms
4. **System Action**: 
   - Processes rejections with reason
   - Updates PR statuses
   - Sends notifications to requestors
   - Refreshes table

### 5.3. Bulk Delete (Draft PRs Only)
1. **User Action**: Selects multiple draft PRs and clicks "Delete"
2. **System Action**: 
   - Validates PRs are in draft status
   - Shows confirmation dialog with warning
3. **User Action**: Confirms deletion
4. **System Action**: 
   - Soft deletes the PRs
   - Removes from current view
   - Shows success message

### 5.4. Bulk Export
1. **User Action**: Selects PRs and clicks "Export"
2. **System Action**: Opens export options dialog
3. **User Action**: Selects export format (Excel, CSV, PDF)
4. **System Action**: 
   - Generates export file
   - Downloads file to user's device
   - Shows completion notification

## 6. Individual Row Actions

### 6.1. View PR Details
1. **User Action**: Clicks "View" button or PR reference number
2. **System Action**: 
   - Navigates to PR details page
   - Passes PR ID as parameter
   - Opens in view mode

### 6.2. Edit PR
1. **User Action**: Clicks "Edit" button
2. **System Action**: 
   - Validates edit permissions
   - Navigates to PR details page in edit mode
   - If no permission, shows error message

### 6.3. Delete PR
1. **User Action**: Clicks "Delete" button
2. **System Action**: 
   - Validates delete permissions (draft status + ownership/admin)
   - Shows confirmation dialog
3. **User Action**: Confirms deletion
4. **System Action**: 
   - Soft deletes the PR
   - Removes from table
   - Shows success message

### 6.4. Duplicate PR
1. **User Action**: Clicks "Duplicate" button
2. **System Action**: 
   - Creates copy of PR with new reference number
   - Sets status to Draft
   - Navigates to new PR in edit mode

### 6.5. Workflow Actions (Context-Sensitive)
1. **User Action**: Clicks workflow action (Approve/Reject/Send Back)
2. **System Action**: 
   - Validates user permissions for the action
   - Shows appropriate dialog (approval confirmation, rejection reason, etc.)
3. **User Action**: Completes action in dialog
4. **System Action**: 
   - Processes workflow action
   - Updates PR status and workflow stage
   - Sends notifications
   - Refreshes row data

## 7. View Management Actions

### 7.1. Switch View (Table/Grid)
1. **User Action**: Clicks view toggle button
2. **System Action**: 
   - Switches between table and grid layout
   - Maintains current filters and sorting
   - Saves view preference

### 7.2. Change Widget Toggle (RBAC-Based)
1. **User Action**: Clicks different widget toggle (My PR, My Approvals, Ready for PO)
2. **System Action**: 
   - Validates user has access to selected widget (`roleConfig.widgetAccess`)
   - Applies widget-specific filter logic
   - Updates secondary filter dropdown options
   - Refreshes data based on new filter
   - Updates URL with widget parameter

### 7.3. Column Visibility
1. **User Action**: Clicks column visibility button
2. **System Action**: Opens column selection dropdown
3. **User Action**: Toggles column visibility checkboxes
4. **System Action**: 
   - Shows/hides selected columns
   - Saves column preferences
   - Adjusts table layout

## 8. Pagination Actions

### 8.1. Page Navigation
1. **User Action**: Clicks page number, Next, Previous, First, or Last
2. **System Action**: 
   - Validates page number
   - Fetches data for requested page
   - Updates table content
   - Updates pagination controls
   - Maintains current filters and sorting

### 8.2. Items Per Page
1. **User Action**: Changes items per page dropdown
2. **System Action**: 
   - Recalculates pagination
   - Fetches appropriate data
   - Updates table
   - Saves preference

## 9. Real-time Updates

### 9.1. Status Change Notifications
1. **System Action**: Receives real-time notification of PR status change
2. **System Action**: 
   - Updates affected row in table
   - Shows notification toast
   - Maintains user's current position and selections

### 9.2. New PR Creation
1. **System Action**: Receives notification of new PR creation
2. **System Action**: 
   - Adds new row if it matches current filters
   - Shows notification of new item
   - Updates pagination if necessary

## 10. Error Handling Flows

### 10.1. Network Error
1. **System Action**: Detects network failure during action
2. **System Action**: 
   - Shows error message with retry option
   - Maintains user's current state
   - Provides offline indicator if applicable

### 10.2. Permission Error
1. **System Action**: Receives permission denied response
2. **System Action**: 
   - Shows appropriate error message
   - Disables unavailable actions
   - Suggests contacting administrator

### 10.3. Validation Error
1. **System Action**: Receives validation error from server
2. **System Action**: 
   - Shows specific error message
   - Highlights problematic fields/selections
   - Provides guidance for correction

## 11. Performance Optimization Flows

### 11.1. Lazy Loading
1. **User Action**: Scrolls near bottom of table (if virtual scrolling enabled)
2. **System Action**: 
   - Loads next batch of data
   - Appends to existing table
   - Updates pagination info

### 11.2. Debounced Search
1. **User Action**: Types rapidly in search field
2. **System Action**: 
   - Waits for 300ms pause
   - Cancels previous search requests
   - Executes search with latest input

### 11.3. Cached Results
1. **User Action**: Navigates back to previously viewed page/filter
2. **System Action**: 
   - Checks cache for recent data
   - Uses cached data if available and fresh
   - Shows data immediately while validating in background