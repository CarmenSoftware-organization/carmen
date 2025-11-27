# Use Cases: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.1
- **Last Updated**: 2025-11-26
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-26 | Documentation Team | Code compliance review - removed fictional features, aligned with BR document |

## Overview

This document details the use cases for Location Management functionality in the hospitality ERP system, covering location creation, configuration, user and product assignment, and location lifecycle management.

## Actor Definitions

### Primary Actors
- **Operations Manager**: Creates and manages locations, assigns delivery points
- **Store Manager**: Manages location-specific settings and assignments
- **System Administrator**: Configures location types and system-wide settings
- **Inventory Manager**: Manages physical count settings and product assignments

### Supporting Actors
- **System**: Automated validation

---

## UC-LOC-001: Create New Location

### Basic Information
- **Actor**: Operations Manager
- **Preconditions**:
  - User has "Create Location" permission
  - User is authenticated
- **Postconditions**:
  - New location created
  - Location appears in location list

### Main Flow
1. Operations Manager navigates to Location Management
2. System displays location list
3. Manager clicks "Create Location" button
4. System navigates to create location page with form:
   - Location Code (max 10 characters, uppercase alphanumeric with hyphens)
   - Location Name (max 100 characters)
   - Type (Inventory, Direct, or Consignment)
   - Physical Count Enabled (Yes/No)
   - Status (Active, Inactive, Closed, Pending Setup)
   - Description (optional)
   - Department (optional dropdown)
   - Cost Center (optional dropdown)
   - Consignment Vendor (optional, shown for Consignment type)
   - Address fields (optional)
5. Manager enters required information
6. Manager clicks "Save Location"
7. System validates all required fields
8. System creates location record
9. System displays success message
10. System redirects to location detail page

### Alternative Flows

**A1: Validation Errors**
- At step 7, if validation fails:
  1. System displays inline error messages next to invalid fields
  2. System highlights fields with errors
  3. Manager corrects errors and resubmits
  4. Flow continues from step 7

**A2: Duplicate Location Code**
- At step 8, if location code already exists:
  1. System displays error: "Location code already exists"
  2. Manager enters different code
  3. Flow continues from step 7

**A3: Cancel Operation**
- At any step before step 6:
  1. Manager clicks "Cancel" button
  2. System returns to location list
  3. Use case ends

### Exception Flows

**E1: Network Error**
- At step 8:
  1. System displays error: "Unable to create location. Please try again."
  2. Manager can retry or cancel
  3. Use case ends

---

## UC-LOC-002: Edit Existing Location

### Basic Information
- **Actor**: Operations Manager, Store Manager
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists
  - User is authenticated
- **Postconditions**:
  - Location information updated
  - Changes reflected in location list

### Main Flow
1. User navigates to Location Management
2. System displays location list with search and filters
3. User searches/filters to find desired location
4. User clicks on location row or View button
5. System navigates to location detail page in view mode
6. User clicks "Edit" button
7. System switches to edit mode displaying tabbed interface:
   - General tab (location details)
   - Shelves tab
   - Users tab
   - Products tab
   - Delivery Points tab
8. User modifies fields in General tab:
   - Location Name (code is displayed but disabled)
   - Type
   - Status
   - Physical Count Enabled
   - Description
   - Department
   - Cost Center
   - Consignment Vendor (for consignment type)
   - Address
9. User clicks "Save Changes"
10. System validates all required fields
11. System updates location record
12. System displays success message
13. System switches back to view mode

### Alternative Flows

**A1: No Changes Made**
- At step 9, if no changes detected:
  1. System displays message: "No changes to save"
  2. User can continue editing or cancel
  3. Flow returns to step 8

**A2: Validation Errors**
- Similar to UC-LOC-001 Alternative Flow A1

**A3: Cancel Edit**
- At any step:
  1. User clicks "Cancel" button
  2. System discards unsaved changes
  3. System switches back to view mode

---

## UC-LOC-003: View Location Details

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Location exists
- **Postconditions**: None (read-only operation)

### Main Flow
1. User navigates to Location Management
2. System displays location list
3. User searches/filters to find desired location
4. User clicks on location row or View icon
5. System navigates to location detail page
6. System displays tabbed interface with 5 tabs:
   - **General Tab**:
     - Location Code (read-only)
     - Location Name
     - Type (with color-coded badge)
     - Status (with color-coded badge)
     - Physical Count Enabled (Yes/No icon)
     - Description
     - Department
     - Cost Center
     - Consignment Vendor (if applicable)
     - Address
   - **Shelves Tab**:
     - List of storage shelves
     - Shelf code, name, status
   - **Users Tab**:
     - List of assigned users
     - User name, email, role, permissions
     - Primary location indicator
   - **Products Tab**:
     - List of assigned products
     - Product code, name, category
     - Inventory parameters (min, max, reorder point, PAR level)
     - Current quantity and low stock indicator
   - **Delivery Points Tab**:
     - List of delivery points
     - Address, contact info, logistics details
     - Primary delivery point indicator
7. System displays action buttons:
   - Back (returns to list)
   - Edit (switches to edit mode)
   - Delete (triggers deletion flow)

### Alternative Flows

**A1: No Data in Tabs**
- For any tab with no data:
  1. System displays empty state message
  2. In edit mode, displays "Add First [Item]" button

---

## UC-LOC-004: Delete Location

### Basic Information
- **Actor**: System Administrator
- **Preconditions**:
  - User has "Delete Location" permission
  - Location exists
  - User is authenticated
- **Postconditions**:
  - Location removed from list
  - Location no longer available for selection

### Main Flow
1. User views location in list or detail page
2. User clicks Delete button (trash icon)
3. System displays confirmation dialog:
   - Title: "Delete Location"
   - Message: "Are you sure you want to delete this location? This action cannot be undone."
   - Buttons: Cancel, Delete (destructive style)
4. User clicks "Delete" to confirm
5. System validates deletion constraints:
   - Checks for assigned products (assignedProductsCount > 0)
6. System removes location from list
7. System displays success message: "Location deleted successfully"
8. System refreshes location list

### Alternative Flows

**A1: Cancel Deletion**
- At step 4:
  1. User clicks "Cancel"
  2. System closes dialog without changes
  3. Use case ends

**A2: Cannot Delete - Has Assigned Products**
- At step 5, if location has assigned products:
  1. System displays error: "Cannot delete location with assigned products. Please remove product assignments first."
  2. System closes dialog
  3. Use case ends

---

## UC-LOC-005: Search and Filter Locations

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Locations exist
- **Postconditions**: Filtered list displayed to user

### Main Flow
1. User navigates to Location Management
2. System displays location list in table view
3. System displays search and filter controls:
   - Search input field (searches name, code, description, department)
   - Type dropdown (All, Inventory, Direct, Consignment)
   - Status dropdown (All, Active, Inactive, Closed, Pending Setup)
   - Physical Count dropdown (All, Count Enabled, Count Disabled)
4. User enters search term in search field
5. System filters locations in real-time by:
   - Location name (case-insensitive partial match)
   - Location code (case-insensitive partial match)
   - Description (case-insensitive partial match)
   - Department name (case-insensitive partial match)
6. User selects type filter
7. System applies type filter (AND logic with search)
8. User selects status filter
9. System applies status filter (AND logic with previous filters)
10. User selects physical count filter
11. System applies physical count filter
12. System displays filtered results with count:
    - "Showing X of Y locations"

### Alternative Flows

**A1: No Results Found**
- At step 12, if no locations match criteria:
  1. System displays empty state in table
  2. User can modify filters or clear filters

---

## UC-LOC-006: Sort Location List

### Basic Information
- **Actor**: Any authenticated user
- **Preconditions**:
  - User is authenticated
  - Locations exist
- **Postconditions**: List sorted by selected column

### Main Flow
1. User views location list in table view
2. System displays sortable column headers:
   - Code
   - Name
   - Type
   - Status
   - Shelves (count)
   - Products (count)
   - Users (count)
3. User clicks column header to sort
4. System sorts list in ascending order
5. System displays up arrow icon next to column name
6. User clicks same column header again
7. System reverses sort to descending order
8. System displays down arrow icon next to column name
9. User can click different column header to change sort field
10. System applies new sort and updates icon

---

## UC-LOC-007: Bulk Actions on Locations

### Basic Information
- **Actor**: Operations Manager, System Administrator
- **Preconditions**:
  - User is authenticated
  - Multiple locations exist
- **Postconditions**: Selected locations updated or deleted

### Main Flow
1. User views location list
2. User selects locations using checkboxes
3. System displays selection count: "X location(s) selected"
4. System enables bulk action buttons:
   - Activate
   - Deactivate
   - Delete
   - Clear Selection
5. User clicks desired bulk action
6. System displays confirmation if needed
7. System performs action on all selected locations
8. System displays success message
9. System refreshes list and clears selection

### Alternative Flows

**A1: Select All**
- At step 2:
  1. User clicks header checkbox
  2. System selects all visible locations
  3. Flow continues from step 3

**A2: Bulk Delete with Products**
- At step 7 for delete action:
  1. If any location has assigned products, system shows error
  2. System lists locations that cannot be deleted
  3. User can proceed with remaining locations or cancel

---

## UC-LOC-008: Manage Shelves

### Basic Information
- **Actor**: Warehouse Manager, Store Manager
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists
- **Postconditions**: Shelves created, updated, or deleted

### Main Flow
1. User opens location detail page in edit mode
2. User clicks "Shelves" tab
3. System displays shelf list table with:
   - Shelf Code
   - Shelf Name
   - Status (Active/Inactive)
   - Actions (Edit, Delete)
4. User clicks "Add Shelf" button
5. System displays Add Shelf dialog:
   - Shelf Code (max 20 chars)
   - Name
6. User enters shelf information
7. User clicks "Add Shelf"
8. System validates and adds shelf to list
9. System closes dialog
10. Shelf appears in table

### Alternative Flows

**A1: Edit Shelf**
- At step 3:
  1. User clicks Edit from row actions
  2. System displays Edit Shelf dialog with current values
  3. User modifies fields
  4. User clicks "Save Changes"
  5. System updates shelf

**A2: Delete Shelf**
- At step 3:
  1. User clicks Delete from row actions
  2. System displays confirmation dialog
  3. User confirms deletion
  4. System removes shelf from list

---

## UC-LOC-009: Assign Users to Location

### Basic Information
- **Actor**: Operations Manager, System Administrator
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists
  - Users exist in system
- **Postconditions**: Users assigned to location with roles and permissions

### Main Flow
1. User opens location detail page in edit mode
2. User clicks "Users" tab
3. System displays user assignment interface:
   - Table of assigned users
   - "Add User" button
4. User clicks "Add User" button
5. System displays user selection dialog:
   - User dropdown/search
   - Role selection (Location Manager, Inventory Controller, etc.)
   - Permission checkboxes
   - Primary location checkbox
6. User selects user and configures role/permissions
7. User clicks "Add"
8. System adds user to assigned list
9. User can edit or remove assignments from table

### Alternative Flows

**A1: Edit User Assignment**
- At step 3:
  1. User clicks Edit from row actions
  2. System displays edit dialog with current values
  3. User modifies role/permissions
  4. User clicks "Save"

**A2: Remove User Assignment**
- At step 3:
  1. User clicks Remove from row actions
  2. System removes user from assigned list

---

## UC-LOC-010: Assign Products to Location

### Basic Information
- **Actor**: Store Manager, Inventory Manager
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists
  - Products exist in system
- **Postconditions**: Products assigned to location with inventory parameters

### Main Flow
1. User opens location detail page in edit mode
2. User clicks "Products" tab
3. System displays product assignment interface:
   - Table of assigned products
   - "Add Product" button
4. User clicks "Add Product" button
5. System displays product selection dialog:
   - Product search by name/code/category
   - Shelf selector (from location's shelves)
   - Inventory parameters:
     - Min Quantity
     - Max Quantity
     - Reorder Point
     - PAR Level
6. User selects product and sets parameters
7. User clicks "Add"
8. System adds product to assigned list
9. Table shows current quantity and low stock indicators

### Alternative Flows

**A1: Edit Product Assignment**
- At step 3:
  1. User clicks Edit from row actions
  2. System displays edit dialog with current values
  3. User modifies parameters or shelf
  4. User clicks "Save"

**A2: Remove Product Assignment**
- At step 3:
  1. User clicks Remove from row actions
  2. System removes product from assigned list

---

## UC-LOC-011: Manage Delivery Points

### Basic Information
- **Actor**: Purchasing Manager, Operations Manager
- **Preconditions**:
  - User has "Edit Location" permission
  - Location exists
- **Postconditions**: Delivery points created, updated, or deleted

### Main Flow
1. User opens location detail page in edit mode
2. User clicks "Delivery Points" tab
3. System displays delivery points list:
   - Name, Code
   - Address
   - Contact info
   - Primary indicator
   - Status
4. User clicks "Add Delivery Point" button
5. System displays delivery point form:
   - Name, Code
   - Address (line 1, line 2, city, postal code, country)
   - Contact (name, phone, email)
   - Instructions (delivery, access)
   - Logistics (operating hours, max vehicle size, dock leveler, forklift)
   - Primary checkbox
   - Active checkbox
6. User enters information
7. User clicks "Save"
8. System validates and adds delivery point

### Alternative Flows

**A1: Edit Delivery Point**
- At step 3:
  1. User clicks Edit from row actions
  2. System displays form with current values
  3. User modifies fields
  4. User clicks "Save"

**A2: Delete Delivery Point**
- At step 3:
  1. User clicks Delete from row actions
  2. System displays confirmation
  3. User confirms
  4. System removes delivery point

---

## UC-LOC-012: Export Location List

### Basic Information
- **Actor**: Operations Manager
- **Preconditions**:
  - User is authenticated
  - Locations exist
- **Postconditions**: Location data exported to file

### Main Flow
1. User navigates to Location Management
2. User applies desired filters
3. User clicks "Export" button
4. System generates CSV file with filtered locations
5. Browser downloads CSV file

---

## UC-LOC-013: Print Location List

### Basic Information
- **Actor**: Operations Manager, Store Manager
- **Preconditions**:
  - User is authenticated
  - Locations exist
- **Postconditions**: Location list printed

### Main Flow
1. User navigates to Location Management
2. User applies desired filters and sorting
3. User clicks "Print" button
4. System opens browser print dialog
5. User configures print settings
6. User clicks Print

---

## Use Case Priority Matrix

| Use Case | Priority | Frequency | Complexity |
|----------|----------|-----------|------------|
| UC-LOC-001: Create New Location | High | Medium | Medium |
| UC-LOC-002: Edit Existing Location | High | High | Medium |
| UC-LOC-003: View Location Details | High | Very High | Low |
| UC-LOC-004: Delete Location | Medium | Low | Low |
| UC-LOC-005: Search and Filter Locations | High | Very High | Low |
| UC-LOC-006: Sort Location List | Medium | High | Low |
| UC-LOC-007: Bulk Actions | Medium | Medium | Medium |
| UC-LOC-008: Manage Shelves | Medium | Medium | Medium |
| UC-LOC-009: Assign Users to Location | High | Medium | Medium |
| UC-LOC-010: Assign Products to Location | High | Medium | Medium |
| UC-LOC-011: Manage Delivery Points | Medium | Low | Medium |
| UC-LOC-012: Export Location List | Low | Low | Low |
| UC-LOC-013: Print Location List | Low | Low | Low |

## Business Rules Summary

Reference BR-location-management.md for complete business rules. Key rules affecting use cases:

- **BR-001**: Location code must be uppercase alphanumeric with hyphens only, maximum 10 characters
- **BR-002**: Cannot delete location with assigned products (assignedProductsCount > 0)
- **BR-003**: Consignment type locations should have a vendor assigned
- **BR-004**: Shelf codes should be unique within a location
- **BR-005**: One primary delivery point per location
- **BR-006**: One primary user assignment per user across locations
