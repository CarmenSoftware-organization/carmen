# Use Cases: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.0
- **Last Updated**: 2025-01-16
- **Status**: Active

## Overview

This document details the use cases for Location Management functionality in the hospitality ERP system, covering location creation, configuration, user and product assignment, and location lifecycle management.

## Actor Definitions

### Primary Actors
- **Operations Manager**: Creates and manages locations, assigns delivery points
- **Store Manager**: Manages location-specific settings and assignments
- **System Administrator**: Configures location types and system-wide settings
- **Inventory Manager**: Manages physical count settings and product assignments

### Supporting Actors
- **System**: Automated validation and audit logging
- **Database**: Persistence layer

---

## UC-LOC-001: Create New Location

### Basic Information
- **Actor**: Operations Manager
- **Preconditions**:
  - User has "Create Location" permission
  - User is authenticated
  - Delivery points are configured in the system
- **Postconditions**:
  - New location created in database
  - Location appears in location list
  - Audit trail created

### Main Flow
1. Operations Manager navigates to Location Management
2. System displays location list
3. Manager clicks "Create Location" button
4. System displays location creation form with tabs:
   - Basic Information tab (active by default)
   - User Assignment tab
   - Product Assignment tab
5. Manager enters required information:
   - Location Code (max 10 characters, unique)
   - Location Name (max 100 characters)
   - Type (Direct, Inventory, or Consignment)
   - Physical Count Required (Yes/No)
   - Delivery Point (from dropdown)
   - Active status (checked by default)
6. Manager optionally assigns users via User Assignment tab:
   - Views dual-pane interface (Available Users | Assigned Users)
   - Searches for users by name or email
   - Selects users from available list
   - Clicks left chevron to assign users
7. Manager optionally assigns products via Product Assignment tab:
   - Chooses view mode (Product Mode or Category Mode)
   - Searches for products by code or name
   - Selects products from available list
   - Clicks left chevron to assign products
8. Manager clicks "Save Location"
9. System validates all required fields
10. System creates location record with unique UUID
11. System creates user assignment records (tb_user_location)
12. System creates product assignment records (if implemented)
13. System displays success message
14. System redirects to location detail page

### Alternative Flows

**A1: Validation Errors**
- At step 9, if validation fails:
  1. System displays inline error messages next to invalid fields
  2. System highlights fields with errors
  3. Manager corrects errors and resubmits
  4. Flow continues from step 9

**A2: Duplicate Location Code**
- At step 10, if location code already exists:
  1. System displays error: "Location code already exists"
  2. Manager enters different code
  3. Flow continues from step 9

**A3: Cancel Operation**
- At any step before step 8:
  1. Manager clicks "Cancel" button
  2. System displays confirmation dialog
  3. If confirmed, system discards changes and returns to location list
  4. Use case ends

### Exception Flows

**E1: Network Error**
- At step 10:
  1. System displays error: "Unable to create location. Please try again."
  2. Manager can retry or cancel
  3. Use case ends

---

## UC-LOC-002: Edit Existing Location

### Basic Information
- **Actor**: Operations Manager, Store Manager
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists in database
  - User is authenticated
- **Postconditions**:
  - Location information updated
  - Changes reflected in all related records
  - Audit trail updated with modification details

### Main Flow
1. User navigates to Location Management
2. System displays location list with search and filters
3. User searches/filters to find desired location
4. User clicks Edit icon (pencil) for the location
5. System navigates to edit page
6. System displays location edit form with:
   - Basic Information (pre-populated)
   - User Assignment tab (with current assignments)
   - Product Assignment tab (with current assignments)
7. User modifies fields:
   - Location Name (code is disabled for existing locations)
   - Type
   - Physical Count Required
   - Delivery Point
   - Active status
8. User optionally modifies user assignments:
   - Removes users by selecting from assigned list and clicking right chevron
   - Adds users by selecting from available list and clicking left chevron
9. User optionally modifies product assignments:
   - Removes products by selecting from assigned list and clicking right chevron
   - Adds products by selecting from available list and clicking left chevron
10. User clicks "Save Location"
11. System validates all required fields
12. System updates location record
13. System updates user assignment records (tb_user_location)
14. System updates product assignment records
15. System updates audit fields (updated_at, updated_by_id)
16. System displays success message
17. System redirects to location detail page

### Alternative Flows

**A1: No Changes Made**
- At step 10, if no changes detected:
  1. System displays message: "No changes to save"
  2. User can continue editing or cancel
  3. Flow returns to step 7

**A2: Validation Errors**
- Similar to UC-LOC-001 Alternative Flow A1

**A3: Cannot Modify Location with Active Transactions**
- At step 11, if location has active inventory transactions:
  1. System restricts modification of certain fields (type, active status)
  2. System displays warning message
  3. User can modify allowed fields only
  4. Flow continues from step 12

---

## UC-LOC-003: View Location Details

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Location exists in database
- **Postconditions**: None (read-only operation)

### Main Flow
1. User navigates to Location Management
2. System displays location list
3. User searches/filters to find desired location
4. User clicks View icon (file/document) for the location
5. System navigates to location detail page
6. System displays three information cards:
   - **Basic Information Card**:
     - Location Code
     - Location Name
     - Type (as badge)
     - Status (Active/Inactive as badge)
   - **Delivery Information Card**:
     - Physical Count Required (Yes/No)
     - Delivery Point
   - **Assigned Users Card**:
     - Count of assigned users
     - User avatars with initials
     - User name and email
     - Empty state if no users assigned
7. System displays action buttons:
   - Back (returns to list)
   - Edit (navigates to edit page)
   - Delete (triggers deletion flow)

### Alternative Flows

**A1: No Assigned Users**
- At step 6:
  1. System displays "No users assigned to this location" in Assigned Users card

---

## UC-LOC-004: Delete Location

### Basic Information
- **Actor**: System Administrator
- **Preconditions**:
  - User has "Delete Location" permission
  - Location exists in database
  - User is authenticated
- **Postconditions**:
  - Location marked as deleted (soft delete)
  - Location removed from active lists
  - Historical data preserved
  - Audit trail updated

### Main Flow
1. User views location in list or detail page
2. User clicks Delete button (trash icon)
3. System displays confirmation dialog:
   - Title: "Delete Location"
   - Message: "Are you sure you want to delete this location? This action cannot be undone."
   - Buttons: Cancel, Delete (destructive style)
4. User clicks "Delete" to confirm
5. System validates deletion constraints:
   - Checks for active inventory balances
   - Checks for open transactions
   - Checks for assigned users/products
6. System performs soft delete:
   - Sets deleted_at timestamp
   - Sets deleted_by_id to current user
   - Keeps is_active as true (for audit purposes)
7. System removes user assignments (soft delete tb_user_location records)
8. System removes product assignments (soft delete records)
9. System displays success message: "Location deleted successfully"
10. System refreshes location list
11. Deleted location no longer appears in active lists

### Alternative Flows

**A1: Cancel Deletion**
- At step 4:
  1. User clicks "Cancel"
  2. System closes dialog without changes
  3. Use case ends

**A2: Cannot Delete - Has Active Stock**
- At step 5, if location has inventory balances:
  1. System displays error: "Cannot delete location with existing inventory. Please transfer stock first."
  2. System closes dialog
  3. Use case ends

**A3: Cannot Delete - Has Open Transactions**
- At step 5, if location has open transactions:
  1. System displays error: "Cannot delete location with open transactions. Please complete or cancel transactions first."
  2. System closes dialog
  3. Use case ends

---

## UC-LOC-005: Search and Filter Locations

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Locations exist in database
- **Postconditions**: Filtered list displayed to user

### Main Flow
1. User navigates to Location Management
2. System displays location list in table view (default)
3. System displays search and filter controls:
   - Search input field (placeholder: "Search locations...")
   - Status dropdown (All Status, Active, Inactive)
   - Type dropdown (All Types, Direct, Inventory, Consignment)
   - Clear Filters button (if filters active)
   - View toggle (Table/Card)
4. User enters search term in search field
5. System filters locations in real-time by:
   - Location name (case-insensitive partial match)
   - Location type (case-insensitive partial match)
   - Location code (case-insensitive partial match)
6. User selects status filter
7. System applies status filter (AND logic with search)
8. User selects type filter
9. System applies type filter (AND logic with previous filters)
10. System displays filtered results with count:
    - "Showing X of Y records" in table footer
11. User can clear all filters by clicking "Clear Filters"
12. System resets search and filter controls
13. System displays all locations

### Alternative Flows

**A1: No Results Found**
- At step 10, if no locations match criteria:
  1. System displays empty state in table
  2. User can modify filters or clear filters

**A2: Switch View Mode**
- At any point:
  1. User clicks view toggle (Table/Card icon)
  2. System switches between table and card view
  3. Filters remain applied
  4. Flow continues

---

## UC-LOC-006: Sort Location List

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Locations exist in database
- **Postconditions**: List sorted by selected column

### Main Flow
1. User views location list in table view
2. System displays sortable column headers:
   - Code
   - Name
   - Type
3. User clicks column header to sort
4. System sorts list in ascending order
5. System displays chevron-up icon next to column name
6. User clicks same column header again
7. System reverses sort to descending order
8. System displays chevron-down icon next to column name
9. User can click different column header to change sort field
10. System applies new sort and updates icon

### Alternative Flows

**A1: Card View - No Sorting**
- If user is in card view:
  1. Sorting is maintained from table view
  2. Cards displayed in current sort order

---

## UC-LOC-007: Toggle View Mode

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Locations exist in database
- **Postconditions**: View mode changed, filters and sort preserved

### Main Flow
1. User views location list in default table view
2. System displays view toggle buttons in toolbar
3. User clicks Card View icon (grid icon)
4. System switches to card layout:
   - Displays locations as cards in responsive grid
   - Each card shows: Name, Code, Type, EOP, Delivery Point, Status, Actions
   - Maintains current filters and search
5. User can click Table View icon (table icon)
6. System switches back to table layout
7. Filters, search, and sort remain unchanged

### Alternative Flows

**A1: Mobile Responsive**
- On mobile devices:
  1. Card view automatically adjusts to single column
  2. Table view displays horizontal scroll for full table

---

## UC-LOC-008: Assign Users to Location

### Basic Information
- **Actor**: Operations Manager, System Administrator
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists in database
  - Users exist in system
- **Postconditions**:
  - User-location associations created in tb_user_location
  - Users can access location in their context
  - Audit trail updated

### Main Flow
1. User opens location for editing (UC-LOC-002)
2. User clicks "User Assignment" tab
3. System displays dual-pane interface:
   - **Assigned Users Pane** (left):
     - Search field
     - Select All checkbox
     - List of currently assigned users with:
       - Avatar with initials
       - User name
       - Role badge
       - Primary location
       - Additional location badges
   - **Available Users Pane** (right):
     - Search field
     - Select All checkbox
     - List of unassigned users
4. User searches for users in available pane
5. System filters available users by name or email
6. User selects one or more users from available list
7. User clicks left chevron button (assign)
8. System moves selected users to assigned pane
9. User can select users from assigned pane
10. User clicks right chevron button (remove)
11. System moves selected users to available pane
12. User clicks "Save Location"
13. System creates tb_user_location records for new assignments
14. System soft-deletes tb_user_location records for removed assignments
15. System displays success message

### Alternative Flows

**A1: Select All Users**
- At step 6:
  1. User clicks "Select All" checkbox in available pane
  2. System selects all filtered users
  3. User clicks assign button
  4. System moves all selected users
  5. Flow continues from step 12

**A2: No Users Selected**
- At step 7 or 10:
  1. If no users selected, chevron buttons are disabled
  2. User must select at least one user to assign/remove

---

## UC-LOC-009: Assign Products to Location

### Basic Information
- **Actor**: Store Manager, Inventory Manager
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists in database
  - Products exist in system
- **Postconditions**:
  - Product-location associations created
  - Products available for requisitions at location
  - Audit trail updated

### Main Flow
1. User opens location for editing (UC-LOC-002)
2. User clicks "Product Assignment" tab
3. System displays view mode toggle (Product Mode / Category Mode)
4. User selects Product Mode (default)
5. System displays dual-pane interface similar to user assignment:
   - Assigned Products pane (left) with search and select all
   - Available Products pane (right) with search and select all
6. Each product displays:
   - Product code with package icon
   - Product name
   - Category and base unit
7. User searches for products by code or name
8. System filters product list in real-time
9. User selects products from available list
10. User clicks left chevron to assign
11. System moves products to assigned pane
12. User can switch to Category Mode
13. System displays products grouped by category:
    - Expandable category folders
    - Product count badges
    - Nested product list under each category
14. User expands categories and selects products
15. User assigns/removes products using chevron buttons
16. User clicks "Save Location"
17. System creates product assignment records
18. System displays success message

### Alternative Flows

**A1: Category Mode Operations**
- At step 13:
  1. User clicks category header to expand/collapse
  2. System toggles category expansion
  3. Products within category become visible/hidden
  4. User can select individual products or use Select All within category

**A2: Switch Between View Modes**
- At any time:
  1. User clicks view mode toggle
  2. System switches between Product and Category mode
  3. Selections are preserved
  4. Flow continues

---

## UC-LOC-010: Print Location List

### Basic Information
- **Actor**: Operations Manager, Store Manager
- **Preconditions**:
  - User is authenticated
  - Locations exist in database
- **Postconditions**: Location list printed or saved as PDF

### Main Flow
1. User navigates to Location Management
2. User applies desired filters and sorting
3. User clicks "Print" button
4. System opens browser print dialog with:
   - Current filtered and sorted location list
   - Print-optimized layout
   - Company header
5. User configures print settings
6. User clicks Print or Save as PDF
7. System generates printable document

### Alternative Flows

**A1: Export to CSV**
- Future enhancement:
  1. User clicks "Export" button
  2. System generates CSV file with filtered locations
  3. Browser downloads CSV file

---

## UC-LOC-011: View Location Assignments

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Location has assignments (users or products)
- **Postconditions**: None (read-only)

### Main Flow
1. User views location detail page (UC-LOC-003)
2. System displays Assigned Users card
3. For each assigned user, system shows:
   - User avatar (colored background with initials)
   - User name
   - User email
4. If no users assigned, system displays:
   - "No users assigned to this location"
5. System displays count: "Assigned Users (X)"

### Alternative Flows

**A1: View Product Assignments**
- Future enhancement:
  1. System displays Assigned Products card
  2. Shows list of assigned products
  3. Displays product code and name

---

## Use Case Priority Matrix

| Use Case | Priority | Frequency | Complexity |
|----------|----------|-----------|------------|
| UC-LOC-001: Create New Location | High | Medium | Medium |
| UC-LOC-002: Edit Existing Location | High | High | Medium |
| UC-LOC-003: View Location Details | High | Very High | Low |
| UC-LOC-004: Delete Location | Medium | Low | High |
| UC-LOC-005: Search and Filter Locations | High | Very High | Low |
| UC-LOC-006: Sort Location List | Medium | High | Low |
| UC-LOC-007: Toggle View Mode | Low | Medium | Low |
| UC-LOC-008: Assign Users to Location | High | Medium | Medium |
| UC-LOC-009: Assign Products to Location | High | Medium | Medium |
| UC-LOC-010: Print Location List | Low | Low | Low |
| UC-LOC-011: View Location Assignments | Medium | High | Low |

## Business Rules Summary

- **BR-001**: Location code must be unique and cannot be changed after creation
- **BR-002**: Location name must be unique across the system
- **BR-003**: Locations with inventory balances cannot be deleted (only deactivated)
- **BR-004**: Delivery point must be active and valid
- **BR-005**: Physical count setting determines if location appears in stock count schedules
- **BR-006**: User assignments create records in tb_user_location
- **BR-007**: Product assignments enable requisition and stock management at location
- **BR-008**: Soft deletes preserve historical data and audit trail
- **BR-009**: Location type cannot be changed if transactions exist
- **BR-010**: Inactive locations hidden from dropdown selections but visible in historical reports
