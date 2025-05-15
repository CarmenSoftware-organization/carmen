# Location Management System Interface Layout

## Location Listing Screen

### Header Section
- Title: "Location Listing"
- Navigation bar with system menu options

### Action Buttons (Top)
- **Create Button**: Adds new location entries
- **Print Button**: Prints the list of locations

### Filter Controls
- **View Dropdown**: Filters by location types (Inventory with option to Count, Direct, Consignment)
- **Search Field**: Allows searching within location listings

### Main Grid/Table View
| Code | Location Name | Delivery Point | EOP | Location Type | Active |
|------|--------------|----------------|-----|--------------|--------|
| AGS  | A&G - Security | Default | Default Zero | Direct | ✓ |
| INV1 | Main Warehouse | Dock 1 | Enter Counted Stock | Inventory with option to Count | ✓ |
| CON3 | Supplier Items | Zone B | Default System | Consignment | ✓ |
| *additional rows...* |

### Status Bar (Bottom)
- Record count: "Showing x of y records"
- Pagination controls

## Location Detail/Inventory Screen

### Header Section
- Title: "Location Inventory Management"
- Location identifier: "[Location Code] - [Location Name]"

### Location Information Panel
- **Location Code**: Text field (e.g., "AGS")
- **Location Name**: Text field (e.g., "A&G - Security")
- **Location Type**: Dropdown (Direct, Inventory with option to Count, Consignment)
- **EOP**: Dropdown showing appropriate option based on location type:
  - Default Zero (for Direct)
  - Enter Counted Stock (for Inventory with option to Count)
  - Default System (for Consignment)
- **Active**: Checkbox
- **Delivery Point**: Text field/dropdown (e.g., "Default")
- **Department Name**: Text field/dropdown (e.g., "Engineering")

### Action Buttons
- **Create Button**: Adds new items to inventory
- **Edit Button**: Modifies selected items
- **Delete Button**: Removes items
- **Print Button**: Prints inventory list
- **Back Button**: Returns to location listing screen

### Inventory Structure Tree/Grid
- Hierarchical view with expandable nodes:
  - **Category** (Level 1): Food, Beverage, Electronic, etc.
    - **Sub-Category** (Level 2): Dry Goods, Fresh, etc.
      - **Item Group** (Level 3): Coffee/Tea/Hot Bev., etc.
        - **Items** (Level 4): With columns for:
          - Item Description (LL) (Local Language)
          - Item Description (EN) (English)
          - SKU (Stock Keeping Unit)
          - Additional inventory data (quantity, unit, etc.)

### Status Bar
- Selection information
- Action status messages

This layout provides an organized, hierarchical approach to managing different types of locations (Inventory with option to Count, Direct, Consignment) and their associated inventory items, with appropriate end-of-period handling based on the location type.