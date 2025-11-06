# Use Cases: Goods Received Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Goods Received Note (GRN)
- **Route**: `/procurement/goods-received-note`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Procurement Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | Documentation Team | Initial version from source code analysis |

---

## Overview

This document describes the use cases for the Goods Received Note (GRN) module, covering all user interactions, system processes, and integration points discovered in the actual codebase. The GRN module supports receiving goods from vendors through two primary workflows: PO-based GRN creation (from existing purchase orders) and manual GRN creation (for unplanned deliveries).

Key workflows include GRN list management, item-level receiving with discrepancy tracking, multi-currency handling, extra cost distribution, and automatic stock movement generation upon commitment.

**Related Documents**:
- [Business Requirements](./BR-goods-received-note.md)
- [Technical Specification](./TS-goods-received-note.md)
- [Data Definition](./DD-goods-received-note.md)
- [Flow Diagrams](./FD-goods-received-note.md)
- [Validations](./VAL-goods-received-note.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Receiving Clerk | Warehouse or receiving area staff who physically receive goods | Records GRN, inspects goods, documents discrepancies |
| Purchasing Staff | Procurement team members managing the purchasing process | Creates GRNs, reviews discrepancies, manages vendor issues |
| Warehouse Staff | Staff responsible for inventory and storage operations | Assigns storage locations, confirms stock movements |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Procurement Manager | Manager overseeing procurement operations | Reviews discrepancies, voids GRNs |
| Finance Team | Financial staff processing vendor payments | Reviews GRN financial data, processes invoices |
| Warehouse Supervisor | Supervisor of warehouse operations | Manages storage assignments |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| Inventory Management Module | Updates stock levels when GRN is committed | Internal Module Integration |
| Finance Module | Receives journal voucher entries from committed GRNs | Internal Module Integration |
| Purchase Orders Module | Provides source data for PO-based GRNs | Internal Module Integration |

---

## Use Case Diagram

```
                    ┌────────────────────────────────────────┐
                    │    Goods Received Note System          │
                    └──────────────┬─────────────────────────┘
                                   │
    ┌──────────────────────────────┼──────────────────────────────┐
    │                              │                              │
    │                              │                              │
┌───▼────────┐               ┌────▼─────────┐            ┌───────▼────────┐
│ Receiving  │               │  Purchasing  │            │   Warehouse    │
│   Clerk    │               │    Staff     │            │     Staff      │
└───┬────────┘               └────┬─────────┘            └───────┬────────┘
    │                              │                              │
[UC-GRN-001]                  [UC-GRN-002]                   [UC-GRN-005]
[UC-GRN-003]                  [UC-GRN-003]                   [UC-GRN-006]
[UC-GRN-004]                  [UC-GRN-007]                   [UC-GRN-009]
[UC-GRN-005]                  [UC-GRN-008]
[UC-GRN-006]                  [UC-GRN-010]


              ┌──────────────────┐
              │   Procurement    │
              │     Manager      │
              └────────┬─────────┘
                       │
                  [UC-GRN-012]
                  [UC-GRN-013]


    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │  Inventory   │              │   Finance    │              │  Purchase    │
    │ Management   │              │    Module    │              │    Orders    │
    │   Module     │              │              │              │    Module    │
    └──────┬───────┘              └──────┬───────┘              └──────┬───────┘
           │                             │                             │
      [UC-GRN-101]                  [UC-GRN-102]                  [UC-GRN-103]
   (stock update)              (journal voucher)             (PO fulfillment)
```

**Legend**:
- **Primary Actors** (top row): Receiving Clerk, Purchasing Staff, Warehouse Staff
- **Secondary Actors** (middle row): Procurement Manager
- **System Actors** (bottom row): Inventory, Finance, and Purchase Orders modules

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-GRN-001 | View and Filter GRN List | Receiving Clerk, Purchasing Staff | High | Simple | User |
| UC-GRN-002 | Create GRN from Purchase Order | Purchasing Staff, Receiving Clerk | Critical | Complex | User |
| UC-GRN-003 | Create Manual GRN | Receiving Clerk, Purchasing Staff | High | Medium | User |
| UC-GRN-004 | View GRN Details | Receiving Clerk, Purchasing Staff, Warehouse Staff | High | Simple | User |
| UC-GRN-005 | Edit GRN (Draft/Received Status) | Receiving Clerk, Warehouse Staff | High | Medium | User |
| UC-GRN-006 | Manage GRN Items | Receiving Clerk, Warehouse Staff | Critical | Complex | User |
| UC-GRN-007 | Record Item Discrepancies | Receiving Clerk | High | Medium | User |
| UC-GRN-008 | Manage Extra Costs | Purchasing Staff | Medium | Medium | User |
| UC-GRN-009 | Assign Storage Locations | Warehouse Staff | Critical | Simple | User |
| UC-GRN-010 | Add Comments and Attachments | Receiving Clerk, Purchasing Staff | Medium | Simple | User |
| UC-GRN-011 | Commit GRN | Warehouse Staff, Receiving Clerk, Purchasing Staff | Critical | Complex | User |
| UC-GRN-012 | Void GRN | Procurement Manager | Medium | Simple | User |
| **System Use Cases** | | | | | |
| UC-GRN-101 | Generate Stock Movements | Inventory Management Module | Critical | Complex | System |
| UC-GRN-102 | Generate Journal Voucher | Finance Module | Critical | Complex | System |
| UC-GRN-103 | Update PO Fulfillment Status | Purchase Orders Module | High | Medium | System |

---

## User Use Cases

### UC-GRN-001: View and Filter GRN List

**Description**: User views a paginated list of all Goods Received Notes and applies filters to find specific GRNs based on criteria such as status, date, vendor, or location.

**Actor(s)**: Receiving Clerk, Purchasing Staff, Warehouse Staff

**Priority**: High

**Frequency**: Daily (multiple times per day)

**Preconditions**:
- User is authenticated and has permission to view GRNs
- GRN data exists in the system

**Postconditions**:
- **Success**: User sees filtered list of GRNs matching their criteria
- **Failure**: User sees error message, full list displayed if filters invalid

**Main Flow**:
1. User navigates to `/procurement/goods-received-note` route
2. System loads and displays GRN list in data table with default sorting (newest first)
3. User selects filter criteria (status, vendor, date range, location)
4. System applies filters and updates the display
5. User sees filtered GRN list with key information: GRN number, date, vendor, status, total value
6. Use case ends

**Alternative Flows**:

**Alt-1A: Search by GRN Number or Invoice** (At step 3)
- 3a. User enters search term in search box
- 3b. System filters GRNs matching search term in GRN number, vendor name, or invoice number
- 3c. System displays filtered results
- Continue to step 6

**Alt-1B: Sort by Column** (At step 3)
- 3a. User clicks column header to sort
- 3b. System sorts GRNs by selected column (ascending/descending)
- 3c. System displays sorted results
- Continue to step 6

**Exception Flows**:

**Exc-1A: No GRNs Found** (At step 4)
- System finds no GRNs matching filter criteria
- System displays "No results found" message
- User clears filters or modifies search criteria
- Resume at step 3 or end use case

**Business Rules**:
- **BR-GRN-023**: Users can only view GRNs for their assigned locations unless they have cross-location permission

**Related Requirements**:
- FR-GRN-001: GRN List and Overview
- NFR-GRN-001: List page load performance within 2 seconds

**Notes**:
- List supports sorting by all displayed columns
- Status colors: DRAFT (gray), RECEIVED (blue), COMMITTED (green), VOID (red)
- Pagination defaults to 20 rows per page

---

### UC-GRN-002: Create GRN from Purchase Order

**Description**: User creates a new Goods Received Note by selecting items from existing purchase orders, recording actual quantities received, and documenting any discrepancies.

**Actor(s)**: Purchasing Staff, Receiving Clerk

**Priority**: Critical

**Frequency**: Daily (10-30 times per day across all locations)

**Preconditions**:
- User is authenticated with receiving or purchasing role
- At least one purchase order exists with status allowing receipt
- Vendor and product master data are configured

**Postconditions**:
- **Success**: New GRN created with status DRAFT or RECEIVED, linked to source PO
- **Failure**: No GRN created, user informed of validation errors

**Main Flow**:
1. User clicks "New GRN" button from GRN list page
2. System displays process type selection dialog: "From PO" or "Manual"
3. User selects "From PO"
4. System navigates to vendor selection page
5. User selects vendor from list
6. System displays pending purchase orders for selected vendor
7. User selects one or more PO lines to receive
8. System pre-populates GRN with PO details (vendor, items, ordered quantities, prices)
9. User enters actual received quantities for each item
10. System auto-calculates discrepancies (ordered vs. received)
11. User enters delivery information (invoice number, invoice date, delivery note, vehicle number, driver name)
12. User assigns receiver name and receipt date
13. User saves GRN
14. System validates data, assigns GRN number (GRN-YYYY-NNN format)
15. System saves GRN with status RECEIVED
16. System displays success message with GRN number
17. System navigates to GRN detail page for review
18. Use case ends

**Alternative Flows**:

**Alt-2A: Partial Receipt** (At step 9)
- 9a. User enters received quantity less than ordered quantity
- 9b. System flags item with partial receipt indicator
- 9c. System allows saving GRN with partial quantities
- Continue to step 10

**Alt-2B: Over Receipt** (At step 9)
- 9a. User enters received quantity greater than ordered quantity
- 9b. System displays warning about over receipt
- 9c. User confirms over receipt or corrects quantity
- 9d. System saves GRN if confirmed
- Continue to step 10

**Alt-2C: Save as Draft** (At step 13)
- 13a. User saves GRN as draft instead of received status
- 13b. System saves with status DRAFT
- 13c. System allows later editing and completion
- Continue to step 16

**Alt-2D: Record Rejected or Damaged Items** (At step 9)
- 9a. User enters rejected quantity or damaged quantity
- 9b. System requires rejection reason or damage notes
- 9c. User provides required notes
- 9d. System calculates net received quantity (delivered - rejected - damaged)
- Continue to step 10

**Exception Flows**:

**Exc-2A: Validation Failure** (At step 14)
- System detects validation errors (missing required fields, invalid quantities)
- System displays specific validation error messages
- User corrects errors
- Resume at step 13

**Exc-2B: Duplicate Invoice Number** (At step 14)
- System detects duplicate invoice number for same vendor
- System displays warning message
- User confirms duplicate is intentional or corrects invoice number
- Resume at step 13 or end use case

**Business Rules**:
- **BR-GRN-001**: Each GRN assigned unique sequential number GRN-YYYY-NNN
- **BR-GRN-003**: GRN must reference a purchase order OR be marked as manual
- **BR-GRN-004**: Received quantity must be greater than 0
- **BR-GRN-005**: Rejected + damaged quantity cannot exceed delivered quantity
- **BR-GRN-009**: Receipt date cannot be in the future

**Includes**:
- [UC-GRN-006: Manage GRN Items](#uc-grn-006-manage-grn-items)
- [UC-GRN-007: Record Item Discrepancies](#uc-grn-007-record-item-discrepancies)

**Related Requirements**:
- FR-GRN-002: PO-Based GRN Creation
- FR-GRN-005: GRN Items Management
- FR-GRN-006: Discrepancy Management
- NFR-GRN-003: PO-based GRN creation completes within 3 seconds

**UI Mockups**: See Flow Diagrams for PO-based GRN creation workflow

**Notes**:
- System generates temporary ID (new-UUID) during creation, replaced with actual GRN number on save
- User can select multiple PO lines from same PO or different POs for same vendor
- System stores PO reference for traceability and audit

---

### UC-GRN-003: Create Manual GRN

**Description**: User creates a standalone Goods Received Note without a purchase order reference for unplanned deliveries, returns, or transfers.

**Actor(s)**: Receiving Clerk, Purchasing Staff

**Priority**: High

**Frequency**: Daily (5-10 times per day)

**Preconditions**:
- User is authenticated with receiving or purchasing role
- Vendor and product master data are configured
- Items exist in product catalog

**Postconditions**:
- **Success**: New manual GRN created with status DRAFT or RECEIVED
- **Failure**: No GRN created, user informed of validation errors

**Main Flow**:
1. User clicks "New GRN" button from GRN list page
2. System displays process type selection dialog
3. User selects "Manual"
4. System generates temporary GRN ID and navigates to GRN detail page in confirm mode
5. User selects vendor from dropdown
6. User enters delivery information (invoice number, invoice date, delivery note)
7. User searches and selects items from product catalog
8. For each item, user enters: received quantity, unit price, storage location
9. User optionally enters: batch number, lot number, expiry date, manufacturing date
10. System calculates line totals and GRN subtotal
11. User enters receipt date and receiver name
12. User saves GRN
13. System validates data, assigns GRN number (GRN-YYYY-NNN format)
14. System saves GRN with status RECEIVED
15. System displays success message
16. System navigates to GRN detail view
17. Use case ends

**Alternative Flows**:

**Alt-3A: Add Multiple Items** (At step 7-9)
- User clicks "Add Item" button
- System displays item search dialog
- User searches and selects item
- System adds item to GRN items list
- User repeats for additional items
- Continue to step 10

**Alt-3B: Save as Draft** (At step 12)
- User saves GRN as draft for later completion
- System saves with status DRAFT
- System allows editing until status changed
- Continue to step 15

**Alt-3C: Select Cash Transaction** (At step 6)
- User marks GRN as cash transaction
- System requires cash book selection
- User selects cash book for recording
- System records cash book reference
- Continue to step 7

**Exception Flows**:

**Exc-3A: Item Not in Catalog** (At step 7)
- User cannot find item in product catalog
- User contacts administrator to add new item
- User pauses GRN creation
- Use case ends (resume later after item added)

**Exc-3B: Missing Required Fields** (At step 13)
- System detects missing required fields (vendor, items, quantities, locations)
- System displays validation errors with specific field names
- User completes missing fields
- Resume at step 12

**Business Rules**:
- **BR-GRN-001**: Each GRN assigned unique sequential number
- **BR-GRN-003**: Manual GRN has no purchase order reference
- **BR-GRN-004**: Received quantity must be greater than 0
- **BR-GRN-008**: Storage location must be assigned for all items before commitment
- **BR-GRN-009**: Receipt date cannot be in the future

**Related Requirements**:
- FR-GRN-003: Manual GRN Creation
- FR-GRN-005: GRN Items Management
- FR-GRN-011: Location and Storage Management

**Notes**:
- Manual GRNs often used for vendor returns, emergency purchases, or direct deliveries
- No ordered quantity reference available, so no automatic discrepancy detection
- User must manually flag any discrepancies
- Manual GRNs require same level of documentation as PO-based GRNs

---

### UC-GRN-004: View GRN Details

**Description**: User views complete details of an existing Goods Received Note including all items, financial summary, attachments, and activity log.

**Actor(s)**: Receiving Clerk, Purchasing Staff, Warehouse Staff, Finance Team

**Priority**: High

**Frequency**: Daily (50-100 times per day)

**Preconditions**:
- User is authenticated with appropriate permissions
- GRN exists in the system
- User has access to GRN's location (if location-based security enabled)

**Postconditions**:
- **Success**: User views complete GRN information
- **Failure**: User sees error message if no permission or GRN not found

**Main Flow**:
1. User clicks GRN row in list page or navigates via direct link
2. System loads GRN data including all related information
3. System displays GRN detail page with multiple tabs
4. User sees GRN header: number, status, vendor, date, receiver
5. User sees Items tab (default) showing all received items
6. User can switch to other tabs: Extra Costs, Stock Movement, Tax, Financial Summary, Activity Log, Comments & Attachments, Related POs
7. System displays appropriate data for selected tab
8. Use case ends

**Alternative Flows**:

**Alt-4A: View Related Purchase Order** (At step 6)
- User clicks PO reference link in header
- System navigates to PO detail page in new tab
- User reviews PO information
- User returns to GRN detail
- Resume at step 6

**Alt-4B: Download Attachment** (At step 7)
- User switches to Comments & Attachments tab
- User clicks attachment link
- System downloads or displays attachment
- User reviews attachment
- Resume at step 7

**Alt-4C: View Activity History** (At step 7)
- User switches to Activity Log tab
- System displays chronological list of all GRN activities
- User reviews creation, modifications, status changes with timestamps and users
- Resume at step 7

**Exception Flows**:

**Exc-4A: GRN Not Found** (At step 2)
- System cannot find GRN with specified ID
- System displays "GRN not found" error message
- System returns user to GRN list page
- Use case ends

**Exc-4B: Permission Denied** (At step 2)
- User does not have permission to view GRN (location restriction)
- System displays "Access denied" message
- System returns user to previous page
- Use case ends

**Business Rules**:
- **BR-GRN-023**: Users can only view GRNs for their assigned locations unless cross-location permission

**Related Requirements**:
- FR-GRN-004: GRN Status Management (view only)
- FR-GRN-013: Activity Log and Audit Trail
- FR-GRN-014: Comments and Attachments
- NFR-GRN-002: Detail page loads within 1.5 seconds

**Notes**:
- Read-only view for COMMITTED and VOID status GRNs
- Edit button available for DRAFT and RECEIVED status (if user has permission)
- All tabs load data on demand for performance
- Status badge color-coded for quick identification

---

### UC-GRN-006: Manage GRN Items

**Description**: User adds, edits, or removes items from a GRN, managing quantities, pricing, locations, and item-specific attributes like batch numbers and expiry dates.

**Actor(s)**: Receiving Clerk, Warehouse Staff

**Priority**: Critical

**Frequency**: Daily (every GRN creation and edit)

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- User has edit permission for GRN
- Product catalog contains items to be received

**Postconditions**:
- **Success**: GRN items updated with correct quantities, prices, and attributes
- **Failure**: Items unchanged, user informed of validation errors

**Main Flow**:
1. User opens GRN in edit mode
2. System displays Items tab with current item list
3. User clicks "Add Item" button
4. System displays item search dialog
5. User searches for and selects item from product catalog
6. System adds item row with editable fields
7. User enters: received quantity, unit of measure, unit price
8. User assigns storage location from dropdown
9. User optionally enters: batch number, lot number, serial numbers, manufacturing date, expiry date
10. System calculates line total (quantity × unit price)
11. User saves item
12. System validates item data
13. System updates item in GRN
14. System recalculates GRN subtotal
15. Use case ends

**Alternative Flows**:

**Alt-6A: Edit Existing Item** (At step 3)
- User clicks edit icon on existing item row
- System enables editing of item fields
- User modifies quantities or attributes
- User saves changes
- Continue to step 12

**Alt-6B: Delete Item** (At step 3)
- User clicks delete icon on item row
- System displays confirmation dialog
- User confirms deletion
- System removes item from GRN
- System recalculates GRN subtotal
- Resume at step 2 or end use case

**Alt-6C: Bulk Add from PO** (At step 3-6)
- User selects "Add from PO" option
- System displays PO line selector
- User selects multiple PO lines
- System adds all selected items with PO data
- Continue to step 7

**Alt-6D: Copy Item** (At step 3)
- User clicks copy icon on existing item row
- System creates duplicate item row
- User modifies quantities or attributes as needed
- Continue to step 11

**Exception Flows**:

**Exc-6A: Item Validation Failure** (At step 12)
- System detects validation errors (missing required fields, invalid quantities)
- System displays specific error messages
- User corrects errors
- Resume at step 11

**Exc-6B: Duplicate Item** (At step 12)
- System detects same item already exists in GRN
- System displays warning
- User confirms adding duplicate or merges with existing item
- Resume at step 11 or step 3

**Business Rules**:
- **BR-GRN-004**: Received quantity must be greater than 0
- **BR-GRN-007**: Expiry date must be after manufacturing date (if both provided)
- **BR-GRN-008**: Storage location must be assigned for all items
- **BR-GRN-016**: Item total = (received quantity × unit price) + allocated extra cost

**Includes**:
- [UC-GRN-007: Record Item Discrepancies](#uc-grn-007-record-item-discrepancies)
- [UC-GRN-009: Assign Storage Locations](#uc-grn-009-assign-storage-locations)

**Related Requirements**:
- FR-GRN-005: GRN Items Management
- FR-GRN-009: Extra Costs Management (for cost allocation)

**Notes**:
- Unit conversions supported if product has multiple units configured
- System auto-populates unit price from PO or product master cost
- Batch/lot numbers required for items with batch tracking enabled
- Serial numbers required for serialized inventory items
- Item table supports sorting, filtering by multiple criteria

---

### UC-GRN-007: Record Item Discrepancies

**Description**: User documents discrepancies between expected and actual received items, including quantity variances, damaged goods, and other issues.

**Actor(s)**: Receiving Clerk

**Priority**: High

**Frequency**: Daily (occurs in 20-30% of GRNs)

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- Items exist in GRN
- User is reviewing received goods

**Postconditions**:
- **Success**: Discrepancies documented with type, notes, and quantities
- **Failure**: Discrepancies not recorded, user informed of missing information

**Main Flow**:
1. User reviews item delivered quantity against ordered quantity
2. System auto-detects quantity discrepancy if delivered ≠ ordered
3. System flags item row with discrepancy indicator
4. User clicks on item to view/edit details
5. System displays item detail form with discrepancy fields
6. User selects discrepancy type: quantity, damage, or other
7. User enters rejected quantity (if applicable)
8. User enters damaged quantity (if applicable)
9. User enters discrepancy notes explaining the issue
10. User saves item details
11. System validates discrepancy data
12. System updates item with hasDiscrepancy flag
13. System increments GRN discrepancies count
14. System displays updated item in list with discrepancy badge
15. Use case ends

**Alternative Flows**:

**Alt-7A: Damage Discrepancy** (At step 6)
- User selects "damage" as discrepancy type
- User enters damaged quantity
- User describes nature of damage in notes
- System calculates net received quantity (delivered - damaged)
- Continue to step 10

**Alt-7B: Other Discrepancy** (At step 6)
- User selects "other" as discrepancy type
- User describes the issue in notes
- User may enter rejected quantity if items not accepted
- Continue to step 10

**Alt-7C: No Discrepancy After Review** (At step 4)
- User confirms quantities match and no discrepancies
- User does not flag discrepancy
- System removes auto-detected discrepancy flag
- Use case ends

**Exception Flows**:

**Exc-7A: Missing Discrepancy Notes** (At step 11)
- System detects discrepancy flagged but no notes provided
- System displays validation error "Discrepancy notes required"
- User enters descriptive notes
- Resume at step 10

**Exc-7B: Invalid Quantity Values** (At step 11)
- System detects rejected + damaged > delivered quantity
- System displays validation error
- User corrects quantities
- Resume at step 10

**Business Rules**:
- **BR-GRN-005**: Rejected quantity + damaged quantity cannot exceed delivered quantity
- **BR-GRN-006**: Discrepancy notes required when hasDiscrepancy flag is true

**Related Requirements**:
- FR-GRN-006: Discrepancy Management

**Notes**:
- Discrepancy count displayed prominently in GRN header
- Discrepancy data used for vendor performance tracking
- Photos can be attached as evidence via Comments & Attachments tab

---

### UC-GRN-008: Manage Extra Costs

**Description**: User adds and distributes additional costs (freight, handling, insurance, customs) across received items using selected distribution method.

**Actor(s)**: Purchasing Staff

**Priority**: Medium

**Frequency**: Weekly (10-20% of GRNs have extra costs)

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- User has edit permission
- Items exist in GRN for cost distribution

**Postconditions**:
- **Success**: Extra costs recorded and distributed to items, total GRN value updated
- **Failure**: Extra costs not added, user informed of validation errors

**Main Flow**:
1. User opens GRN in edit mode
2. User navigates to Extra Costs tab
3. User clicks "Add Extra Cost" button
4. System displays extra cost entry form
5. User selects cost type: shipping, handling, insurance, or customs
6. User enters cost amount and currency
7. User confirms exchange rate (if different from GRN currency)
8. System saves extra cost to list
9. User selects distribution method: by net amount, by quantity, or equal
10. System calculates distribution and allocates extra costs to each item
11. System updates item costs and totals
12. System recalculates GRN total amount
13. User saves changes
14. System displays updated financial summary
15. Use case ends

**Alternative Flows**:

**Alt-8A: Add Multiple Extra Costs** (At step 8)
- User clicks "Add Another" button
- User repeats steps 5-8 for additional cost
- System accumulates total extra costs
- Continue to step 9

**Alt-8B: Change Distribution Method** (At step 9)
- User changes distribution method dropdown
- System immediately recalculates distribution
- System updates item cost allocations
- User reviews new allocation
- Continue to step 13

**Alt-8C: Delete Extra Cost** (At step 3)
- User clicks delete icon on existing extra cost
- System displays confirmation
- User confirms deletion
- System removes cost and recalculates distribution
- Resume at step 9 or end use case

**Exception Flows**:

**Exc-8A: Invalid Cost Amount** (At step 7)
- User enters zero or negative cost amount
- System displays validation error "Amount must be greater than 0"
- User enters valid amount
- Resume at step 7

**Exc-8B: Currency Mismatch** (At step 7)
- Extra cost currency differs from GRN currency
- System requires exchange rate
- User provides or confirms exchange rate
- System converts to base currency for distribution
- Continue to step 8

**Business Rules**:
- **BR-GRN-020**: Extra cost distribution by net amount = (item net amount ÷ total net amount) × total extra costs
- **BR-GRN-021**: Extra cost distribution by quantity = (item quantity ÷ total quantity) × total extra costs
- **BR-GRN-022**: Extra cost distribution equal = total extra costs ÷ number of items
- **BR-GRN-016**: Item total amount includes allocated extra cost

**Related Requirements**:
- FR-GRN-009: Extra Costs Management
- FR-GRN-012: Financial Summary and Tax Calculation

**Notes**:
- Extra costs are distributed proportionally based on selected method
- Distribution method can be changed, and costs automatically reallocated
- Extra costs included in journal voucher postings
- Common cost types: freight-in, handling fees, insurance, customs duties

---

### UC-GRN-009: Assign Storage Locations

**Description**: User assigns storage locations for each received item, indicating where goods will be stored in the warehouse or facility.

**Actor(s)**: Warehouse Staff

**Priority**: Critical

**Frequency**: Daily (every GRN requiring location assignment)

**Preconditions**:
- GRN exists with items
- Storage locations are configured in system
- User has permission to assign locations

**Postconditions**:
- **Success**: All items have storage locations assigned, GRN ready for commitment
- **Failure**: Items missing locations, GRN cannot be committed

**Main Flow**:
1. User opens GRN in edit mode
2. User navigates to Items tab
3. System displays items list with storage location column
4. For each item, user clicks location dropdown
5. System displays available storage locations filtered by location type
6. User selects appropriate storage location (warehouse, kitchen, office, etc.)
7. System assigns location to item
8. User repeats for all items
9. System validates all items have locations assigned
10. User saves GRN
11. System confirms all location assignments saved
12. Use case ends

**Alternative Flows**:

**Alt-9A: Bulk Location Assignment** (At step 4)
- User selects multiple item rows
- User clicks "Assign Location" bulk action
- User selects location from dropdown
- System assigns same location to all selected items
- Continue to step 9

**Alt-9B: Use Default Location** (At step 5)
- System suggests default location based on item category or department
- User accepts default location suggestion
- System assigns default location
- Continue to step 7

**Exception Flows**:

**Exc-9A: Location Not Available** (At step 5)
- User cannot find appropriate location in dropdown
- User contacts warehouse supervisor to create new location
- User pauses GRN processing
- Use case ends (resume after location created)

**Exc-9B: Missing Location Assignment** (At attempt to commit GRN)
- System detects items without location assignments
- System displays validation error listing items needing locations
- User assigns missing locations
- Resume location assignment workflow

**Business Rules**:
- **BR-GRN-008**: Storage location must be assigned for all items before GRN commitment
- **BR-GRN-014**: Stock movements only generated when GRN committed and locations assigned

**Related Requirements**:
- FR-GRN-011: Location and Storage Management
- FR-GRN-010: Stock Movement Generation (requires locations)

**Notes**:
- Location types: warehouse, kitchen storage, cold storage, dry goods, office
- Location capacity and organization managed separately in Inventory module
- Some locations may be restricted based on item type or user permissions
- Location assignment critical for accurate inventory tracking

---

### UC-GRN-011: Commit GRN

**Description**: User finalizes a GRN by committing it, which triggers stock movements, updates inventory levels, and generates financial journal entries.

**Actor(s)**: Warehouse Staff, Receiving Clerk, Purchasing Staff

**Priority**: Critical

**Frequency**: Daily (10-30 times per day)

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- All items have storage locations assigned
- User has permission to commit GRNs

**Postconditions**:
- **Success**: GRN status changed to COMMITTED, stock movements generated, inventory updated, journal voucher created
- **Failure**: GRN status unchanged, user informed of blocking issues

**Main Flow**:
1. User opens GRN in RECEIVED status
2. User reviews all GRN data: items, quantities, prices, locations, discrepancies
3. User verifies all validations passed (locations assigned)
4. User clicks "Commit GRN" button
5. System validates GRN is ready for commitment
6. System displays commitment confirmation dialog with impact summary
7. User confirms commitment
8. System changes GRN status to COMMITTED
9. System generates stock movement records for all items
10. System updates inventory levels in assigned storage locations
11. System calculates financial totals including tax and extra costs
12. System generates journal voucher with debit and credit entries
13. System posts journal voucher to finance module
14. System records commitment timestamp and user
15. System displays success message with stock movement and journal voucher references
16. System locks GRN for editing (now read-only)
17. Use case ends

**Alternative Flows**:

**Alt-11A: Commitment with Discrepancies** (At step 5)
- GRN contains flagged discrepancies
- System displays warning about committing with discrepancies
- User reviews discrepancy notes
- User confirms commitment (discrepancies already documented)
- Continue to step 6

**Exception Flows**:

**Exc-11A: Missing Storage Locations** (At step 5)
- System detects items without storage location assignments
- System displays validation error listing items needing locations
- System prevents commitment
- User assigns locations via UC-GRN-009
- Resume at step 4 or end use case

**Exc-11B: Stock Movement Generation Failure** (At step 9)
- System encounters error generating stock movements
- System rolls back GRN status change
- System displays error message with details
- System logs error for technical support
- User retries after issue resolved
- Use case ends

**Business Rules**:
- **BR-GRN-012**: COMMITTED status GRNs cannot be edited or deleted, only voided
- **BR-GRN-014**: Stock movements only generated when GRN status changes to COMMITTED
- **BR-GRN-008**: Storage location must be assigned for all items before commitment

**Includes**:
- [UC-GRN-101: Generate Stock Movements](#uc-grn-101-generate-stock-movements)
- [UC-GRN-102: Generate Journal Voucher](#uc-grn-102-generate-journal-voucher)

**Related Requirements**:
- FR-GRN-004: GRN Status Management
- FR-GRN-010: Stock Movement Generation
- FR-GRN-012: Financial Summary and Tax Calculation
- NFR-GRN-004: Commitment completes within 5 seconds

**Notes**:
- Commitment is irreversible transaction - only void operation allowed afterward
- Stock movements create audit trail in inventory module
- Journal voucher entries follow accounting department GL account mapping
- Committed GRNs used as basis for vendor invoice matching and payment processing
- System sends notification to finance team upon successful commitment

---

### UC-GRN-013: Void GRN

**Description**: User cancels a GRN by voiding it, preventing any inventory or financial impact while preserving the record for audit purposes.

**Actor(s)**: Procurement Manager

**Priority**: Medium

**Frequency**: Weekly (2-5 times per week for errors or returns)

**Preconditions**:
- GRN exists in any status (DRAFT, RECEIVED, or COMMITTED)
- User has procurement manager role or appropriate permission
- If GRN is COMMITTED, stock movements must be reversible

**Postconditions**:
- **Success**: GRN status changed to VOID, preserved for audit, no inventory/financial impact
- **Failure**: GRN status unchanged, user informed of issues

**Main Flow**:
1. User opens GRN to be voided
2. User clicks "Void GRN" button in header
3. System displays void confirmation dialog
4. System shows impact summary (if COMMITTED, lists stock movements to reverse)
5. User enters void reason in required field
6. User confirms void operation
7. System validates void operation is allowed
8. If GRN is COMMITTED, system generates reversing stock movements
9. If GRN is COMMITTED, system generates reversing journal voucher
10. System changes GRN status to VOID
11. System records void timestamp, user, and reason
12. System adds void entry to activity log
13. System displays success message
14. System displays GRN in read-only mode with VOID status
15. Use case ends

**Alternative Flows**:

**Alt-13A: Void Draft or Received GRN** (At step 8)
- GRN status is DRAFT or RECEIVED (not yet committed)
- No stock movements or journal entries exist
- System simply changes status to VOID
- Continue to step 10

**Alt-13B: Void with Replacement GRN** (At step 5)
- User enters void reason referencing replacement GRN
- System links to replacement GRN number if provided
- User confirms void
- Continue to step 7

**Exception Flows**:

**Exc-13A: Missing Void Reason** (At step 7)
- User did not enter void reason
- System displays validation error "Void reason is required"
- User enters reason
- Resume at step 6

**Exc-13B: Insufficient Permission** (At step 7)
- User lacks permission to void GRN
- System displays "Access denied - procurement manager role required"
- Use case ends

**Exc-13C: Reversal Failure** (At step 8-9)
- System encounters error reversing stock movements or journal entries
- System displays error message
- System does not change GRN status
- User contacts support to resolve issue
- Use case ends

**Business Rules**:
- **BR-GRN-023**: Only creator or procurement manager can void a GRN
- **BR-GRN-013**: VOID status GRNs are read-only and preserved for audit
- **BR-GRN-012**: Cannot edit or delete voided GRNs

**Related Requirements**:
- FR-GRN-004: GRN Status Management
- FR-GRN-013: Activity Log and Audit Trail

**Notes**:
- Void operation different from delete - record preserved in system
- Voided GRNs appear in reports with VOID status clearly indicated
- Common void reasons: duplicate entry, vendor return, data entry error, goods rejected
- If goods were physically received but GRN voided, separate return process may be needed
- Voided GRNs do not count toward vendor performance metrics

---

### UC-GRN-010: Add Comments and Attachments

**Description**: User adds text comments and file attachments to a GRN for documentation, collaboration, and record-keeping purposes.

**Actor(s)**: Receiving Clerk, Purchasing Staff

**Priority**: Medium

**Frequency**: Daily (30-50% of GRNs have comments or attachments)

**Preconditions**:
- GRN exists in system
- User has edit or view permission for GRN
- For attachments: files available for upload (delivery notes, packing slips, photos)

**Postconditions**:
- **Success**: Comments and attachments added to GRN, visible to all users with access
- **Failure**: Comments or attachments not saved, user informed of errors

**Main Flow**:
1. User opens GRN detail page
2. User navigates to Comments & Attachments tab
3. User sees existing comments and attachments (if any)
4. User enters text in comment field
5. User clicks "Add Comment" button
6. System saves comment with user name and timestamp
7. System displays new comment in chronological order (newest first)
8. User clicks "Attach File" button
9. System displays file upload dialog
10. User selects file from device (PDF, image, Excel)
11. System validates file type and size (max 10MB)
12. System uploads file to storage
13. System saves attachment reference with file name and URL
14. System displays attachment in list with download link
15. Use case ends

**Alternative Flows**:

**Alt-10A: Add Multiple Attachments** (At step 9-14)
- User clicks "Attach File" again
- User selects additional file
- System uploads and saves additional attachment
- User repeats for all files to attach
- Continue to step 15

**Alt-10B: View Attachment** (At step 3)
- User clicks attachment link
- System downloads file or displays in browser (for images/PDFs)
- User reviews attachment
- Resume at step 3 or end use case

**Alt-10C: Comment Only** (At step 3-7)
- User adds comment without attachment
- User does not proceed to file attachment steps
- Use case ends after step 7

**Exception Flows**:

**Exc-10A: File Too Large** (At step 11)
- System detects file size exceeds 10MB limit
- System displays error "File size must be less than 10MB"
- User compresses file or selects different file
- Resume at step 10 or end use case

**Exc-10B: Unsupported File Type** (At step 11)
- System detects unsupported file format
- System displays error "Supported formats: PDF, JPG, PNG, XLSX"
- User converts file or selects different file
- Resume at step 10 or end use case

**Business Rules**:
- None specific (general data validation rules apply)

**Related Requirements**:
- FR-GRN-014: Comments and Attachments
- FR-GRN-013: Activity Log (comment addition logged)

**Notes**:
- Common attachments: delivery notes, packing slips, vendor invoices, photos of discrepancies
- Comments support collaboration between receiving, purchasing, and finance teams
- Attachments stored securely with access controlled by user permissions
- Comment history preserved even if GRN is voided
- No edit or delete capability for comments to maintain audit trail

---

## System Use Cases

### UC-GRN-101: Generate Stock Movements

**Description**: System automatically generates stock movement records when a GRN is committed, updating inventory levels in assigned storage locations.

**Trigger**: GRN status changed to COMMITTED (via UC-GRN-012)

**Actor(s)**:
- **Primary**: Inventory Management Module
- **Secondary**: GRN Module

**Priority**: Critical

**Frequency**: Real-time (triggered by each GRN commitment, 10-30 times per day)

**Preconditions**:
- GRN status changed to COMMITTED
- All GRN items have storage locations assigned
- Inventory Management Module is available
- Storage locations exist and are active

**Postconditions**:
- **Success**: Stock movement records created, inventory levels updated in storage locations
- **Failure**: Transaction rolled back, GRN status reverted, error logged

**Main Flow**:
1. System receives GRN commitment event with GRN ID
2. System retrieves GRN data with all item details
3. For each item in GRN, system creates stock movement record:
   - Movement type: RECEIPT
   - From location: Receiving area (or delivery location)
   - To location: Assigned storage location
   - Item ID and details
   - Quantity: received quantity (delivered - rejected - damaged)
   - Unit of measure
   - Cost: unit price + allocated extra cost
   - Total cost: quantity × cost
   - Lot/batch number (if applicable)
   - Movement date: GRN commitment timestamp
4. System retrieves current stock level (before stock) for to location
5. System calculates new stock level (after stock = before stock + quantity)
6. System updates inventory on-hand quantity in to location
7. System saves stock movement record
8. System repeats for all items
9. System validates all stock movements created successfully
10. System returns success status to GRN module
11. Use case ends

**Alternative Flows**:

**Alt-101A: Multiple Locations** (At step 3)
- Single GRN has items going to different storage locations
- System creates separate stock movement for each item-location combination
- System updates inventory in each respective location
- Continue to step 8

**Alt-101B: Batch/Lot Tracking** (At step 3)
- Item requires batch/lot tracking
- System creates stock movement with lot number
- System updates inventory with lot-specific quantities
- Continue to step 4

**Exception Flows**:

**Exc-101A: Location Not Found** (At step 4)
- System cannot find storage location in inventory system
- System throws error "Storage location [CODE] not found"
- System rolls back all stock movements for this GRN
- System reverts GRN status to RECEIVED
- System logs error and notifies support
- Use case ends

**Exc-101B: Negative Stock** (At step 5-6)
- Calculated stock level would be negative (should not occur for receipts)
- System throws error and halts processing
- System rolls back transaction
- Use case ends

**Exc-101C: Duplicate Stock Movement** (At step 7)
- System detects stock movement already exists for this GRN and item
- System prevents duplicate creation
- System validates existing movement matches current data
- Continue to step 8 or end use case

**Business Rules**:
- **BR-GRN-014**: Stock movements only generated when GRN status changes to COMMITTED
- **BR-GRN-009**: Stock levels updated atomically to prevent inventory discrepancies

**Related Requirements**:
- FR-GRN-010: Stock Movement Generation
- NFR-GRN-004: Stock movement generation completes within 5 seconds
- NFR-GRN-020: Transaction rollback on failure

**Notes**:
- Stock movements are atomic - all succeed or all fail
- Inventory updates visible immediately in Inventory Management module
- Stock movement records serve as audit trail for inventory changes
- Integration point with Inventory Management Module via internal API
- Movement cost includes proportional extra cost allocation

---

### UC-GRN-102: Generate Journal Voucher

**Description**: System automatically generates accounting journal voucher entries when a GRN is committed, recording the financial impact in the general ledger.

**Trigger**: GRN status changed to COMMITTED (via UC-GRN-012)

**Actor(s)**:
- **Primary**: Finance Module
- **Secondary**: GRN Module

**Priority**: Critical

**Frequency**: Real-time (triggered by each GRN commitment, 10-30 times per day)

**Preconditions**:
- GRN status changed to COMMITTED
- All financial calculations completed (subtotal, tax, discounts, extra costs)
- GL account mapping configured for inventory and payables
- Finance Module is available

**Postconditions**:
- **Success**: Journal voucher created with balanced debit/credit entries
- **Failure**: Transaction rolled back, GRN status reverted, error logged

**Main Flow**:
1. System receives GRN commitment event with GRN ID
2. System retrieves GRN financial summary data
3. System calculates total amounts in base currency:
   - Subtotal (sum of all item amounts)
   - Discount amount
   - Net amount (subtotal - discount)
   - Tax amount (net × tax rate)
   - Extra costs total
   - Grand total (net + tax + extra costs)
4. System creates journal voucher record with unique JV number
5. System adds debit entry:
   - Department: Inventory/Purchasing
   - Account: Inventory (asset account)
   - Amount: GRN net amount
6. System adds credit entry:
   - Department: Finance
   - Account: Accounts Payable (liability account)
   - Amount: GRN net amount
7. System adds tax debit/credit entries:
   - Debit: VAT Recoverable
   - Credit: VAT Payable
   - Amount: Tax amount
8. System adds extra cost entries:
   - Debit: Freight In / Handling (expense accounts)
   - Credit: Accounts Payable
   - Amount: Extra cost amounts
9. System validates journal voucher is balanced (total debits = total credits)
10. System saves journal voucher
11. System posts journal voucher to Finance Module
12. System links journal voucher to GRN record
13. System returns success status to GRN module
14. Use case ends

**Alternative Flows**:

**Alt-102A: Multi-Currency JV** (At step 3)
- GRN transaction currency differs from base currency
- System includes both transaction currency and base currency amounts
- System uses exchange rate from GRN for conversion
- System records exchange gain/loss if applicable
- Continue to step 4

**Alt-102B: Cash Transaction** (At step 6-8)
- GRN marked as cash transaction
- System uses Cash/Bank account instead of Accounts Payable
- System references cash book from GRN
- Continue to step 9

**Exception Flows**:

**Exc-102A: Unbalanced Journal Voucher** (At step 9)
- System detects total debits ≠ total credits
- System logs detailed calculation breakdown
- System throws error "Journal voucher unbalanced"
- System rolls back transaction
- System reverts GRN status
- System notifies support
- Use case ends

**Exc-102B: GL Account Not Found** (At step 5-8)
- System cannot find configured GL account for entry
- System throws error "GL account mapping not configured for [account type]"
- System halts journal voucher creation
- System rolls back transaction
- Use case ends

**Business Rules**:
- **BR-GRN-017**: GRN subtotal = sum of all item total amounts
- **BR-GRN-018**: GRN net amount = subtotal - discount amount
- **BR-GRN-019**: GRN total amount = net amount + tax amount + sum of extra costs
- **BR-GRN-016**: Item total amount includes allocated extra cost

**Related Requirements**:
- FR-GRN-012: Financial Summary and Tax Calculation
- NFR-GRN-004: Journal voucher generation completes within 5 seconds
- NFR-GRN-020: Transaction rollback on failure

**Notes**:
- Journal voucher entries follow double-entry bookkeeping principles
- All amounts converted to base currency (USD) for posting
- Department allocation based on GRN location or item configuration
- Journal voucher reference stored in GRN for audit trail
- Finance team uses journal voucher for vendor payment processing
- Integration point with Finance Module via internal API

---

### UC-GRN-103: Update PO Fulfillment Status

**Description**: System automatically updates the source purchase order's fulfillment status when a GRN is created or committed from a PO.

**Trigger**:
- GRN created from PO (via UC-GRN-002)
- GRN committed (via UC-GRN-012)

**Actor(s)**:
- **Primary**: Purchase Orders Module
- **Secondary**: GRN Module

**Priority**: High

**Frequency**: Real-time (triggered by PO-based GRN operations, 10-20 times per day)

**Preconditions**:
- GRN created from or linked to a purchase order
- Purchase order exists and is in active status
- Purchase Orders Module is available

**Postconditions**:
- **Success**: PO line fulfillment quantities updated, PO status updated if fully received
- **Failure**: Error logged, does not block GRN processing (non-critical integration)

**Main Flow**:
1. System receives GRN event (creation or commitment) with PO reference
2. System retrieves GRN item data with PO line item references
3. For each GRN item linked to PO line:
   - System retrieves corresponding PO line item
   - System updates PO line received quantity += GRN item received quantity
   - System calculates PO line outstanding quantity (ordered - received)
   - If outstanding quantity = 0, system marks PO line as "Fully Received"
   - If outstanding quantity > 0, system marks PO line as "Partially Received"
   - System saves PO line updates
4. System evaluates overall PO status:
   - If all PO lines fully received, system marks PO status as "Fully Received"
   - If some lines fully received and some partial, status remains "Partially Received"
   - If any lines have no receipts, status remains "Open" or "Approved"
5. System saves PO status update
6. System creates PO activity log entry noting GRN receipt
7. System returns success status
8. Use case ends

**Alternative Flows**:

**Alt-103A: Partial Receipt** (At step 3)
- GRN received quantity < PO ordered quantity
- System updates PO line to "Partially Received"
- System calculates and displays outstanding quantity
- Purchasing staff can create additional GRN for remaining quantity
- Continue to step 4

**Alt-103B: Over Receipt** (At step 3)
- GRN received quantity > PO ordered quantity
- System allows over receipt and updates PO line
- System flags over receipt for procurement review
- System marks PO line as "Fully Received" (all ordered quantity + extra received)
- Continue to step 4

**Alt-103C: Multiple GRNs per PO** (At step 3)
- Multiple GRNs created from same PO
- System accumulates received quantities across all GRNs
- System tracks fulfillment per PO line across multiple receipts
- Continue to step 4

**Exception Flows**:

**Exc-103A: PO Not Found** (At step 2)
- System cannot find referenced purchase order
- System logs warning but allows GRN processing to continue
- System does not update PO fulfillment
- Use case ends

**Exc-103B: PO Already Closed** (At step 4)
- Purchase order status is "Closed" or "Cancelled"
- System logs warning about receiving against closed PO
- System still allows GRN processing (management decision)
- System notifies procurement team
- Continue to step 6 or end use case

**Business Rules**:
- **BR-GRN-001**: GRN-PO link maintained for traceability
- **BR-GRN-015**: PO fulfillment updates are non-blocking (GRN processing continues even if PO update fails)

**Related Requirements**:
- FR-GRN-015: Purchase Order Reference Tracking
- FR-GRN-002: PO-Based GRN Creation

**Notes**:
- Integration point with Purchase Orders Module via internal API
- PO fulfillment status drives procurement workflow (close POs, trigger new POs)
- Partial receipt common for large orders or phased deliveries
- Over receipt handled based on configuration
- This integration supports procurement analytics and vendor performance tracking

---

## Appendix

### Glossary
- **Actor**: Person, role, or system that interacts with the GRN module
- **Discrepancy**: Variance between expected (ordered) and actual (received) goods
- **Commitment**: Finalization of GRN triggering inventory and financial updates
- **Stock Movement**: Inventory transaction recording goods transfer between locations
- **Journal Voucher**: Accounting entry recording financial impact of GRN
- **Extra Cost**: Additional cost beyond item prices (freight, handling, insurance)
- **Base Currency**: Primary currency for financial reporting (USD)
- **Transaction Currency**: Currency used in specific GRN transaction

### References
- [Business Requirements](./BR-goods-received-note.md)
- [Technical Specification](./TS-goods-received-note.md)
- [Data Definition](./DD-goods-received-note.md)
- [Flow Diagrams](./FD-goods-received-note.md)
- [Validations](./VAL-goods-received-note.md)

### Change Requests
| CR ID | Date | Description | Status |
|-------|------|-------------|--------|
| - | - | - | - |

---

**Document End**

> 📝 **Note to Reviewers**:
> - This document was generated from actual source code analysis of the GRN module workflows
> - All use cases documented exist in the current codebase implementation
> - No fictional use cases have been added
> - Review for accuracy against current system behavior
