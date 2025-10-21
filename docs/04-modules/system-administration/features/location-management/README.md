# Location Management

> **Feature:** System Administration > Location Management
> **Pages:** 4
> **Status:** ✅ Production Ready

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

---

## Data Model

```typescript
interface Location {
  // Identity
  id: string;
  code: string;
  name: string;
  type: LocationType;

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

**Last Updated:** 2025-01-17
**Version:** 1.0.0
