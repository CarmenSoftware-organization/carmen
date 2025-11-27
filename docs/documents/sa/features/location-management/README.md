# Location Management

> **Feature:** System Administration > Location Management
> **Pages:** 4
> **Status:** ✅ Production Ready

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

Location Management provides centralized control over all physical business locations in the Carmen ERP system. This feature enables organizations to define, configure, and maintain locations including warehouses, restaurants, central kitchens, delivery points, and end-of-period (EOP) locations.

### Key Features

1. **Location CRUD** - Create, view, edit, and delete locations
2. **Dual View Modes** - Toggle between table and card views
3. **Advanced Filtering** - Filter by status, type, and search
4. **Hierarchical Organization** - Support for location hierarchies
5. **Configuration Management** - Manage location-specific settings
6. **Status Tracking** - Active/inactive status management

---

## Page Structure

### 1. Location List Page
**Route:** `/system-administration/location-management`

#### Features:
- **Search Bar**: Search by name, code, or type
- **Quick Filters**:
  - Status (All, Active, Inactive)
  - Type (All, Warehouse, Restaurant, Kitchen, etc.)
- **View Toggle**: Switch between table and card views
- **Create Button**: Add new location
- **Print Button**: Generate location reports

#### Table View Columns:
- Code
- Name
- Type
- EOP (End of Period)
- Delivery Point
- Status (badge)
- Actions (View, Edit, Delete)

#### Card View:
- Location name and code
- Status badge
- Type and EOP information
- Delivery point
- Quick action buttons

### 2. Create Location Page
**Route:** `/system-administration/location-management/new`

#### Form Sections:

**Basic Information**
- Location Code (required, unique)
- Location Name (required)
- Location Type (dropdown: Warehouse, Restaurant, Central Kitchen, Store, Delivery Point)
- Status (Active/Inactive toggle)

**Address Details**
- Address Line 1
- Address Line 2
- City
- State/Province
- Postal Code
- Country

**Configuration**
- Is EOP Location (End of Period)
- Is Delivery Point
- Parent Location (for hierarchical structure)
- Default Department
- Timezone

**Contact Information**
- Phone Number
- Email
- Manager Name
- Emergency Contact

**Advanced Settings**
- Allow Inventory
- Allow Transfers
- Allow Purchases
- Allow Production
- Cost Center Code
- Tax Identifier

### 3. View Location Page
**Route:** `/system-administration/location-management/[id]/view`

#### Sections:

**Location Header**
- Location name and code
- Status badge
- Edit button

**Details Cards**
- Basic Information
- Address
- Contact Details
- Configuration Settings

**Statistics**
- Active Users
- Inventory Items
- Pending Transfers
- Monthly Transactions

**Recent Activity**
- Recent inventory movements
- Recent transfers
- Recent purchases
- Recent production

### 4. Edit Location Page
**Route:** `/system-administration/location-management/[id]/edit`

Same form as Create Location, pre-populated with existing data.

**Additional Features:**
- **Tab Interface**: Switch between different assignment sections
  - **User Assignment Tab**: Assign users to this location
  - **Product Assignment Tab**: Assign products available at this location

#### 4.1. User Assignment Tab

Enhanced dual-panel interface for assigning users to the location, using the same interface as Department user assignment.

**Features:**
- Visual hierarchy with user avatars, names, roles, and current locations
- Three-column layout (Assigned Users | Actions | Available Users)
- Chevron buttons for assignment/removal
- Search and Select All functionality
- Equal-height scrollable panels

#### 4.2. Product Assignment Tab

Comprehensive product assignment with two viewing modes to accommodate different workflows.

**Mode Toggle:**
- **Product Mode** (List icon): Flat list view of all products
- **Category Mode** (FolderTree icon): Hierarchical tree view grouped by category

**Product Mode Features:**
- Dual-panel interface similar to user assignment
- Display: Product code, name, category, and base unit
- Search by product code or name
- Individual and bulk selection
- Assign/remove products between panels

**Category Mode Features:**
- Products grouped by category with expand/collapse
- Category headers show folder icon and product count badge
- Expandable tree structure
- Select products within categories
- Same dual-panel layout with category grouping
- Maintains selection when switching modes

---

## Data Model

```typescript
interface Location {
  // Identity
  id: string;
  code: string;
  name: string;
  type: LocationType;

  // Assignment
  assignedUsers?: string[]; // Array of user IDs assigned to this location
  assignedProducts?: string[]; // Array of product IDs available at this location

  // Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Configuration
  isEOP: boolean; // End of Period location
  isDeliveryPoint: boolean;
  parentLocationId?: string;
  defaultDepartment?: string;
  timezone: string;

  // Contact
  phone?: string;
  email?: string;
  manager?: string;
  emergencyContact?: string;

  // Permissions
  allowInventory: boolean;
  allowTransfers: boolean;
  allowPurchases: boolean;
  allowProduction: boolean;

  // Financial
  costCenter?: string;
  taxId?: string;

  // Status
  isActive: boolean;

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

enum LocationType {
  WAREHOUSE = 'Warehouse',
  RESTAURANT = 'Restaurant',
  CENTRAL_KITCHEN = 'Central Kitchen',
  STORE = 'Store',
  DELIVERY_POINT = 'Delivery Point',
  OFFICE = 'Office',
  FRANCHISE = 'Franchise'
}
```

---

## Assignment Features

### User Assignment

**Purpose:** Define which users have access to and can work at specific locations.

**Interface Components:**

1. **Assigned Users Panel (Left)**
   - Shows users currently assigned to this location
   - Search by name or email
   - Select All checkbox for bulk operations
   - Visual display:
     - Color-coded avatar with initials
     - User's full name (prominent)
     - Role/Position with briefcase icon
     - Current location(s) with location icon
     - Additional locations shown as badges

2. **Action Buttons (Center)**
   - ChevronLeft (←): Assign selected users from Available to Assigned
   - ChevronRight (→): Remove selected users from Assigned to Available
   - Buttons disabled when no selection

3. **Available Users Panel (Right)**
   - Shows users not yet assigned to this location
   - Independent search functionality
   - Same visual hierarchy as Assigned panel

**Use Cases:**
- Assign staff to specific restaurant/store locations
- Control access to warehouse locations
- Define kitchen staff for central kitchens
- Manage delivery personnel for delivery points

### Product Assignment

**Purpose:** Define which products are available at each location for ordering, inventory, and operations.

**Two Viewing Modes:**

#### Product Mode (Flat List)

**Best for:** Quick product lookup and assignment

**Interface:**
```
┌──────────────────────────────────────────────────┐
│ [List Icon] Product Mode  [FolderTree] Category  │
├──────────────────────────────────────────────────┤
│  Assigned Products      [<] [>]  Available       │
│  ┌────────────────┐            ┌───────────────┐│
│  │ 📦 PRD-001     │            │ 📦 PRD-005    ││
│  │ Olive Oil      │            │ Tomatoes      ││
│  │ 🏷️ Oils • bottle│            │ 🏷️ Produce•kg ││
│  └────────────────┘            └───────────────┘│
└──────────────────────────────────────────────────┘
```

**Features:**
- Flat list of all products
- Search by product code or name
- Display: Code, Name, Category, Base Unit
- Quick selection and assignment
- Ideal for locations with specific product lists

#### Category Mode (Tree View)

**Best for:** Category-based product selection and organization

**Interface:**
```
┌──────────────────────────────────────────────────┐
│ [List] Product  [FolderTree Icon] Category Mode  │
├──────────────────────────────────────────────────┤
│  Assigned Products      [<] [>]  Available       │
│  ┌────────────────┐            ┌───────────────┐│
│  │ ▼ 📁 Food (12) │            │ ▶ 📁 Dry (16) ││
│  │   □ Olive Oil  │            │ ▼ 📁 Meat (6) ││
│  │   □ Pasta      │            │   □ Chicken   ││
│  │                │            │   □ Beef      ││
│  └────────────────┘            └───────────────┘│
└──────────────────────────────────────────────────┘
```

**Features:**
- Products grouped by category
- Expand/collapse categories with chevron icons
- Category headers show:
  - Folder icon
  - Category name
  - Product count badge
- Select individual products within categories
- Tree structure for nested categories
- Ideal for bulk assignment by category

**Mode Switching:**
- Toggle between modes using buttons at top
- Selection preserved when switching
- Search applies to both modes
- Independent panel searching

**Product Assignment Use Cases:**
- **Restaurant**: Assign menu items and ingredients to specific locations
- **Warehouse**: Define available inventory items per warehouse
- **Store**: Set available products for store requisitions
- **Central Kitchen**: Configure recipe ingredients and supplies
- **Category-based**: Assign entire product categories to new locations

---

## API Endpoints

```http
GET /api/locations
POST /api/locations
GET /api/locations/:id
PUT /api/locations/:id
DELETE /api/locations/:id
GET /api/locations/:id/statistics
GET /api/locations/:id/activity
```

---

## Business Rules

1. **Unique Code**: Location codes must be unique within organization
2. **Active Location Required**: At least one active location required
3. **Hierarchy Validation**: Parent location must exist and be active
4. **Circular Prevention**: Cannot create circular parent-child relationships
5. **Deletion Rules**: Cannot delete location with active inventory or pending transactions

---

## User Guide

### Creating a Location

1. Navigate to Location Management
2. Click "Create Location"
3. Fill required fields (code, name, type)
4. Add address details
5. Configure settings
6. Save location

### Editing a Location

1. Find location in list
2. Click Edit button
3. Modify fields as needed
4. Save changes

---

## Technical Implementation

### Components

**UserAssignment Component** (`user-assignment.tsx`):
- Manages user-to-location assignments
- Reuses same component from Department Management
- Props:
  - `assignedUserIds: string[]`
  - `onAssignedUsersChange: (userIds: string[]) => void`
- Features: Dual-panel interface, search, bulk operations

**ProductAssignment Component** (`product-assignment.tsx`):
- Manages product availability at locations
- Props:
  - `assignedProductIds: string[]`
  - `onAssignedProductsChange: (productIds: string[]) => void`
- Features:
  - Mode toggle (Product/Category)
  - Dual-panel interface
  - Category tree with expand/collapse
  - Search and bulk selection

**LocationEditForm Component** (`location-edit-form.tsx`):
- Main form with tab interface
- State management:
  ```typescript
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([])
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users')
  ```
- Tabs component from shadcn/ui
- Form submission includes both assignments

### Helper Functions

**Product Assignment:**
```typescript
groupProductsByCategory(products: Product[]): CategoryGroup[]
toggleCategory(categoryId: string): void
```

**State Management:**
- useMemo for filtering performance
- Set-based category expansion state
- Independent search state per panel
- Mode toggle preserves selections

### API Integration

**Location with Assignments:**
```http
PUT /api/locations/:id
Body: {
  code: string
  name: string
  assignedUsers: string[]
  assignedProducts: string[]
  ...
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "loc-001",
    "code": "NYC001",
    "name": "New York Central Kitchen",
    "assignedUsers": ["user-001", "user-002"],
    "assignedProducts": ["product-001", "product-002", "product-003"],
    ...
  }
}
```

---

## Changelog

### Version 1.1.0 (2025-01-28)

**Added:**
- **User Assignment Tab**: Enhanced interface for assigning users to locations
  - Visual hierarchy with avatars, names, roles, and locations
  - Three-column layout with chevron navigation
  - Search and Select All functionality
  - Reuses Department user assignment component

- **Product Assignment Tab**: Comprehensive product availability management
  - **Product Mode**: Flat list view for quick product assignment
    - Search by code or name
    - Product card display with code, name, category, unit
  - **Category Mode**: Hierarchical tree view for category-based assignment
    - Expandable/collapsible categories
    - Product count badges
    - Nested category support
  - Mode toggle with icons (List / FolderTree)
  - Independent search per panel
  - Bulk selection in both modes

- **Tab Interface**: Organize user and product assignments
  - Easy switching between assignment types
  - Independent state management
  - Consistent UI patterns

**Improved:**
- Location edit workflow with organized assignments
- User experience for managing location access
- Product availability configuration per location
- Performance with useMemo optimization

**Technical:**
- Added `assignedUsers` and `assignedProducts` fields to Location model
- Created ProductAssignment component with dual modes
- Implemented category grouping and tree rendering
- Added mode toggle state management
- Integrated Tabs component for organized UI

### Version 1.0.0 (2025-01-17)
- Initial Location Management implementation
- CRUD operations for locations
- Dual view modes (table/card)
- Advanced filtering and search
- Status management

---

**Last Updated:** 2025-01-28
**Version:** 1.1.0
