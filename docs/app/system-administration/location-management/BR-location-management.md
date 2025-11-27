# Business Requirements: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.1
- **Last Updated**: 2025-11-26
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-26 | Documentation Team | Code compliance review - removed fictional features, added missing features |

## Overview

Location Management enables operations managers to define and manage physical and logical locations for inventory management, store operations, and delivery points across the hospitality organization.

## Business Goals

1. **Centralized Location Control**: Single source of truth for all operational locations
2. **Inventory Segregation**: Enable separate inventory tracking per location
3. **Access Control**: Assign users to specific locations with role-based permissions
4. **Delivery Management**: Configure delivery points per location for procurement
5. **Stock Management**: Configure physical count and inventory parameters per location

---

## Functional Requirements

### FR-LOC-001: Location Creation
**Priority**: High
**User Story**: As an Operations Manager, I want to create new locations so that I can track inventory and operations at different sites.

**Requirements**:
- Create location with required fields: code (max 10 chars, uppercase alphanumeric with hyphens), name (max 100 chars)
- Set location type: Inventory, Direct, or Consignment
- Configure physical count enabled (yes/no)
- Set status: active, inactive, closed, or pending_setup
- Optional: description, department, cost center, address
- For consignment locations: assign consignment vendor

**Acceptance Criteria**:
- Location code must match regex pattern `^[A-Z0-9-]+$`
- Location code max 10 characters
- Type must be one of: inventory, direct, consignment
- Status must be one of: active, inactive, closed, pending_setup
- Form validates required fields before submission

---

### FR-LOC-002: Location Types
**Priority**: High
**User Story**: As a Store Manager, I want different location types so that inventory behaves correctly based on location purpose.

**Location Types**:
- **Inventory**: Standard warehouse/storage with full inventory tracking
- **Direct**: Production areas with immediate expense on receipt
- **Consignment**: Vendor-owned inventory until consumed (requires vendor assignment)

**Acceptance Criteria**:
- Type selection shows label and description for each option
- Consignment type displays additional vendor selection field
- Type displayed with color-coded badge in list view

---

### FR-LOC-003: Physical Count Configuration
**Priority**: Medium
**User Story**: As an Inventory Manager, I want to specify which locations require physical counts so that I can plan count schedules.

**Requirements**:
- Set physicalCountEnabled (true/false) per location
- Filter locations by physical count status in list view
- Display physical count status with check/x icon in location list

**Acceptance Criteria**:
- Physical count toggle available in location form
- Filter dropdown with options: All, Count Enabled, Count Disabled
- Visual indicator (CheckCircle/XCircle icon) in list view

---

### FR-LOC-004: Delivery Points Management
**Priority**: Medium
**User Story**: As a Purchasing Manager, I want to configure delivery points for locations so that vendors know where to deliver goods.

**Requirements**:
- Create multiple delivery points per location
- Configure delivery point details: name, code, address, contact info
- Set delivery instructions and access instructions
- Configure logistics: max vehicle size, dock leveler availability, forklift availability
- Set operating hours
- Mark one delivery point as primary

**Acceptance Criteria**:
- Add/Edit/Delete delivery points from location detail page
- Primary delivery point displayed with star badge
- Active/Inactive status per delivery point
- Full address with city, postal code, country

---

### FR-LOC-005: User Assignment
**Priority**: High
**User Story**: As a System Administrator, I want to assign users to locations with specific roles so that they can perform authorized operations.

**Requirements**:
- Assign users to locations with role selection
- Available roles: Location Manager, Inventory Controller, Receiver, Picker, Counter, Viewer
- Configure granular permissions per assignment
- Mark one assignment as primary location
- Remove user assignments

**Available Permissions**:
- location:view, location:edit
- inventory:view, inventory:receive, inventory:issue, inventory:adjust, inventory:transfer
- count:view, count:participate, count:finalize
- shelf:manage

**Acceptance Criteria**:
- User selection from available users list
- Role dropdown with all location roles
- Permission checkboxes with descriptions
- Primary location indicator (star icon)
- Edit and Remove actions per assignment

---

### FR-LOC-006: Product Assignment
**Priority**: Medium
**User Story**: As a Store Manager, I want to assign products to locations with inventory parameters so that stock levels are properly managed.

**Requirements**:
- Search and select products from centralized product catalog
- Set inventory parameters: min quantity, max quantity, reorder point, PAR level
- Assign default shelf for product storage
- Create new shelves inline during product assignment
- View current stock quantity and low stock alerts

**Acceptance Criteria**:
- Product search by name, code, or category
- Only unassigned products shown in selection
- Shelf selector with "Add New Shelf" option
- Low stock indicator when current quantity <= reorder point
- Edit parameters and remove product assignment

---

### FR-LOC-007: Shelf Management
**Priority**: Medium
**User Story**: As a Warehouse Manager, I want to define storage shelves within a location so that products can be organized and located efficiently.

**Requirements**:
- Create shelves with code (max 20 chars) and name
- Set active/inactive status per shelf
- Edit and delete shelves
- View shelves in table format

**Acceptance Criteria**:
- Add Shelf button opens dialog with code and name fields
- Shelf code displays in monospace font
- Active/Inactive badge per shelf
- Edit/Delete actions in dropdown menu
- Empty state with "Add First Shelf" prompt

---

### FR-LOC-008: Location Search & Filter
**Priority**: Medium
**User Story**: As an Operations Manager, I want to search and filter locations so that I can quickly find specific sites.

**Requirements**:
- Search by name, code, description, department name
- Filter by type: All, Inventory, Direct, Consignment
- Filter by status: All, Active, Inactive, Closed, Pending Setup
- Filter by physical count: All, Count Enabled, Count Disabled
- Sort by: code, name, type, status, shelves count, products count, users count

**Acceptance Criteria**:
- Real-time search as user types
- Multiple filters combine with AND logic
- Results count displays "Showing X of Y locations"
- Sortable column headers with up/down arrow indicator

---

### FR-LOC-009: Location Activation/Deactivation
**Priority**: High
**User Story**: As a System Administrator, I want to change location status so that I can control operational availability.

**Requirements**:
- Set status to: active, inactive, closed, pending_setup
- Bulk activate/deactivate multiple selected locations
- Cannot delete location with assigned products

**Acceptance Criteria**:
- Status dropdown in edit mode
- Bulk action buttons appear when locations selected
- Delete blocked with alert if assignedProductsCount > 0
- Status displayed with color-coded badge

---

### FR-LOC-010: Location List & Bulk Actions
**Priority**: Medium
**User Story**: As an Operations Manager, I want to manage multiple locations at once so that I can efficiently handle bulk operations.

**Requirements**:
- Select individual or all locations via checkboxes
- Bulk activate selected locations
- Bulk deactivate selected locations
- Bulk delete selected locations (with validation)
- Export locations to CSV
- Print location list

**Acceptance Criteria**:
- Checkbox column for selection
- "X location(s) selected" indicator
- Bulk action buttons: Activate, Deactivate, Delete, Clear Selection
- Export generates CSV with all location fields
- Print opens browser print dialog

---

### FR-LOC-011: Organization Assignment
**Priority**: Medium
**User Story**: As a Financial Controller, I want to assign locations to departments and cost centers so that expenses can be properly tracked.

**Requirements**:
- Assign department to location
- Assign cost center to location
- For consignment locations: assign consignment vendor

**Acceptance Criteria**:
- Department dropdown with available departments
- Cost Center dropdown with available cost centers
- Vendor dropdown appears only for consignment type locations
- Department name displayed in location list

---

### FR-LOC-012: Location Address
**Priority**: Low
**User Story**: As a Logistics Coordinator, I want to record location addresses so that deliveries can be properly routed.

**Requirements**:
- Record address: line 1, line 2, city, postal code, country
- Display formatted address in view mode
- Edit address fields in edit mode

**Acceptance Criteria**:
- Address card section in General tab
- All fields displayed as read-only text in view mode
- Input fields in edit mode
- Default country: Thailand

---

## Business Rules

### BR-001: Location Code Format
Location code must be uppercase alphanumeric with hyphens only, maximum 10 characters.

### BR-002: Cannot Delete Location with Products
Locations with assigned products (assignedProductsCount > 0) cannot be deleted. User must remove product assignments first.

### BR-003: Consignment Vendor Required
Consignment type locations should have a vendor assigned for proper ownership tracking.

### BR-004: Shelf Code Uniqueness
Shelf codes should be unique within a location.

### BR-005: One Primary Delivery Point
Each location should have at most one delivery point marked as primary.

### BR-006: One Primary User Assignment
Each user's assignments can have at most one location marked as primary.

---

## Dependencies

- **Product Management**: Provides product catalog for product assignments
- **User Management**: Provides user list for user assignments
- **Vendor Management**: Provides vendor list for consignment locations

---

## Success Metrics

1. **Location Setup Time**: < 2 minutes per location
2. **Search Performance**: < 300ms for location searches
3. **Form Validation**: All required fields validated before submission
4. **User Experience**: Intuitive tabbed interface for managing related data

---

## Appendix: Data Model Summary

### InventoryLocation
- id, code, name, description
- type (inventory | direct | consignment)
- status (active | inactive | closed | pending_setup)
- physicalCountEnabled
- departmentId, departmentName
- costCenterId, costCenterName
- consignmentVendorId, consignmentVendorName
- shelvesCount, assignedUsersCount, assignedProductsCount
- address (optional)
- createdAt, createdBy, updatedAt, updatedBy

### Shelf
- id, locationId, code, name
- zoneType, isActive
- createdAt, createdBy

### UserLocationAssignment
- id, userId, userName, userEmail, locationId
- roleAtLocation, permissions[]
- isPrimary, isActive
- assignedAt, assignedBy

### ProductLocationAssignment
- id, productId, productCode, productName, categoryName, baseUnit, locationId
- shelfId, shelfName
- minQuantity, maxQuantity, reorderPoint, parLevel
- currentQuantity, isActive, isStocked
- assignedAt, assignedBy

### DeliveryPoint
- id, locationId, name, code
- address, contactName, contactPhone, contactEmail
- deliveryInstructions, operatingHours
- maxVehicleSize, hasDockLeveler, hasForklift
- isPrimary, isActive
- createdAt, createdBy
