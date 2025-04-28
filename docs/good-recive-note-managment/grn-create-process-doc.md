# Goods Receiving Process Documentation

## Overview

The Goods Receiving Process is designed to efficiently manage the receipt of goods from vendors, allowing users to select multiple purchase orders, choose specific items to be received, and generate Goods Receiving Notes (GRNs). The system supports receiving items from the same PO into different locations and allows for flexible item selection.

## Process Start Options

Users can initiate the goods receiving process in two ways:

### Option 1: PO-Based Receiving (Standard Flow)
Start by selecting vendors and POs, then proceed to item selection and GRN generation. This is the standard flow for receiving goods that were previously ordered through the system.

### Option 2: Manual GRN Creation
Create a GRN manually without referencing existing POs. This option is useful for:
- Receiving unplanned deliveries
- Processing returns
- Handling goods that were not ordered through the system
- Creating adjustments or corrections

## Complete Process Flow

**PO-Based Flow:**
1. **Vendor Selection** → 2. **PO Selection** → 3. **Item & Location Selection** → 4. **GRN Confirmation**

**Manual Flow:**
1. **Manual GRN Creation** → 2. **Item & Location Entry** → 3. **GRN Confirmation**

### Screen 0: Process Selection

**Purpose:** Allow users to choose between PO-based receiving or manual GRN creation.

**Key Components:**
- Header: "Goods Receiving"
- Two prominent option cards:
  1. PO-Based Receiving
     - Icon and title
     - Description: "Receive goods based on existing Purchase Orders"
     - "Select" button
  2. Manual GRN Creation
     - Icon and title
     - Description: "Create a GRN manually without reference to POs"
     - "Select" button
- Recent GRNs section (showing last 5 GRNs created)

**Data Requirements:**
- Recent GRN data

**User Actions:**
- Select PO-based receiving process
- Select manual GRN creation process
- View recent GRNs

**Navigation:**
- PO-Based: Proceeds to Vendor Selection screen
- Manual: Proceeds to Manual GRN Creation screen

---

### Screen M1: Manual GRN Creation

**Purpose:** Allow users to create a GRN manually without referencing existing purchase orders.

**Key Components:**
- Header: "Goods Receiving - Manual GRN Creation"
- Vendor selection dropdown
- Reference number field (optional)
- Remarks field
- Date selector (defaults to current date)
- Manual item entry section with columns:
  - Item Code (with search/lookup)
  - Description
  - Unit
  - Quantity
  - Location (dropdown)
  - Unit Price (optional)
- "Add Item" button to add more items
- "Create GRN" button
- Step indicator (special: Manual process)

**Data Requirements:**
- Vendor list
- Item master data for lookup
- Location master data

**User Actions:**
- Select vendor
- Enter optional reference/remarks
- Add items manually with quantities and locations
- Add multiple items
- Create GRN

**Validations:**
- Vendor is required
- At least one item must be added
- Each item must have a valid item code, quantity, and location

**Navigation:**
- Next: Proceeds to GRN Confirmation
- Cancel: Returns to dashboard
- Switch to PO-based: Changes to standard PO-based flow

---

### Screen 1: Vendor Selection

**Purpose:** Allow users to select the vendor from whom goods are being received.

**Key Components:**
- Header: "Goods Receiving - Select Vendor"
- Search bar to filter vendors
- Vendor table with columns:
  - Vendor ID
  - Vendor Name
  - Pending POs (count)
  - Action button (Select)
- Step indicator (1 of 4)

**Data Requirements:**
- Vendor ID
- Vendor Name
- Count of pending POs per vendor

**User Actions:**
- Search for vendors
- Select a vendor to proceed

**Navigation:**
- Next: Proceeds to PO Selection
- Cancel: Returns to dashboard

---

### Screen 2: PO Selection

**Purpose:** Allow users to select one or more purchase orders for receiving.

**Key Components:**
- Header: "Goods Receiving - Select Purchase Orders"
- Selected vendor information with change option
- Search bar to filter POs
- Date filter
- PO table with columns:
  - Selection checkbox
  - PO Number
  - PR Reference
  - Date
  - Items count
  - Value
- Selection count summary
- Step indicator (2 of 4)

**Data Requirements:**
- Purchase Order data filtered by selected vendor:
  - PO Number
  - PR Reference
  - Date
  - Items count
  - Value

**User Actions:**
- Change vendor selection
- Search for specific POs
- Filter by date
- Select/deselect multiple POs
- Proceed to next step or go back

**Navigation:**
- Next: Proceeds to Item Selection
- Back: Returns to Vendor Selection

---

### Screen 3: Item & Location Selection

**Purpose:** Allow users to select receiving locations and specific items to be received.

**Key Components:**
- Header: "Goods Receiving - Select Items"
- Selected vendor and PO information
- Location selection area with selectable location tags
- Select/Deselect All buttons
- Search items field
- Items organized by location and PO with columns:
  - Selection checkbox
  - Item Code
  - Description
  - Unit
  - Ordered Quantity
  - Previously Received Quantity
  - Receiving Quantity input
- Selection count summary
- Step indicator (3 of 4)

**Data Requirements:**
- Location data from items in selected POs
- Item data for each selected PO:
  - Item Code
  - Description
  - Unit
  - Ordered Quantity
  - Previously Received Quantity
  - Location

**User Actions:**
- Select/deselect receiving locations
- Search for specific items
- Select/deselect individual items
- Enter receiving quantities for selected items
- Proceed to generate GRN or go back

**Validations:**
- At least one location must be selected
- At least one item must be selected
- Receiving quantity must be greater than 0 and not exceed ordered quantity minus previously received

**Navigation:**
- Next: Generates GRN and proceeds to Confirmation
- Back: Returns to PO Selection

---

### Screen 4: GRN Confirmation

**Purpose:** Display the generated GRN and provide options to print, save, or complete the process.

**Key Components:**
- Header: "Goods Receiving Note"
- Success notification
- Print and Save as PDF buttons
- GRN Details section:
  - GRN Number
  - Date & Time
  - Vendor
  - Received By
- Summary section:
  - Purchase Orders count
  - Locations count
  - Items Received count
  - Total Quantity
- Received Items section organized by location and PO:
  - Item Code
  - Description
  - Unit
  - Ordered Quantity
  - Received Quantity
  - Status (Complete/Partial)
- Done button
- Step indicator (4 of 4)

**Data Requirements:**
- Generated GRN Number
- Current Date/Time
- Receiver information
- All selected items data grouped by location and PO

**User Actions:**
- Print GRN
- Save GRN as PDF
- Complete the process

**Navigation:**
- Done: Returns to starting point (Vendor Selection or dashboard)

## Layout Structure

### Common Elements Across All Screens

- **Top Bar:**
  - Application name (Inventory Management System)
  - User profile

- **Left Navigation:**
  - Main Menu
  - Dashboard link
  - Purchase Orders link
  - Goods Receiving link (highlighted)
  - Inventory link
  - Reports link
  - Settings link

- **Step Indicator:**
  - Located at the bottom of the content area
  - Shows current step and total steps (varies based on chosen flow)

### Content Area Layout

- **Process Selection Screen:**
  - Top: Header
  - Middle: Two option cards side by side
  - Bottom: Recent GRNs table

- **Manual GRN Creation Screen:**
  - Top: Header + Vendor selection + Reference fields
  - Middle: Manual item entry table (scrollable)
  - Bottom: Add Item button + Create GRN button + Step indicator

- **Vendor Selection Screen:**
  - Top: Header + Search
  - Middle: Vendor table (scrollable)
  - Bottom: Step indicator

- **PO Selection Screen:**
  - Top: Header + Vendor info + Search/Filter
  - Middle: PO table (scrollable)
  - Bottom: Selection count + Action buttons + Step indicator

- **Item & Location Selection Screen:**
  - Top: Header + Vendor/PO info
  - Upper Middle: Location selection
  - Middle: Item selection actions (Select All, Search)
  - Lower Middle: Items tables by location (scrollable)
  - Bottom: Selection count + Action buttons + Step indicator

- **GRN Confirmation Screen:**
  - Top: Header + Action buttons
  - Upper Middle: Success notification
  - Middle: GRN Details + Summary grids
  - Lower Middle: Received items by location (scrollable)
  - Bottom: Done button + Step indicator

## Responsive Behavior

The UI is designed to adapt to different screen sizes:

- **Desktop/Large Screens:** Full layout as described above
- **Tablet:** Column widths adjust, navigation may collapse to icons
- **Mobile:** Stacked layout with collapsible sections, reduced table columns

## Technical Notes

- The system supports two distinct starting points for goods receiving
- Location information is stored at the item level, not the PO level
- Each PO can have items going to different locations
- The UI groups items by location for intuitive receiving
- The interface allows for filtering by location to simplify the receiving process
- Manual GRN creation bypasses the PO verification but still updates inventory
- Both flows result in the same GRN format and inventory updates

## User Permission Requirements

- View Vendors
- View Purchase Orders
- Create Goods Receiving Notes
- Update Inventory
- Manual GRN Creation (may be a separate permission)

## System Integrations

- Inventory Management System
- Purchase Order System
- Vendor Management
- Warehouse/Location Management
- Item Master Data
- User Authentication and Permission System

## Process Decision Points

1. **Initial Process Selection:**
   - PO-Based: When receiving goods that match existing purchase orders
   - Manual: When receiving unplanned deliveries or making inventory adjustments

2. **Location Selection (PO-Based flow):**
   - Users can choose which locations to receive items into
   - This filters the items shown to only those for selected locations

3. **Item Selection:**
   - Items can be individually selected or deselected
   - Quantities can be adjusted to handle partial deliveries

4. **GRN Finalization:**
   - Review before confirmation
   - Options to print or save the GRN
