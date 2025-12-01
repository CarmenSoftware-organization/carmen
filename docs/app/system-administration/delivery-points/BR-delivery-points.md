# Business Requirements: Delivery Points

## Document Information
- **Module**: System Administration / Delivery Points
- **Version**: 1.0
- **Last Updated**: 2025-11-28
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-28 | Documentation Team | Initial version - extracted from Location Management |

## Overview

Delivery Points Management enables operations managers to define and maintain delivery point records for the organization. Delivery points represent physical locations where vendors can deliver goods and are referenced by inventory locations for procurement purposes.

## Business Goals

1. **Centralized Delivery Point Management**: Single maintenance page for all delivery points
2. **Standardized Delivery Information**: Consistent delivery point data for vendor communications
3. **Logistics Configuration**: Define vehicle access, equipment availability, and operating parameters
4. **Contact Management**: Maintain delivery contact information for each point

---

## Functional Requirements

### FR-DP-001: Delivery Point List
**Priority**: High
**User Story**: As an Operations Manager, I want to view and manage all delivery points in one place so that I can efficiently maintain delivery information.

**Requirements**:
- Display all delivery points in table format
- Show columns: Name, Code, City, Contact Name, Max Vehicle Size, Status
- Search by name, code, city, or contact name
- Filter by status: All, Active, Inactive
- Sort by any column (ascending/descending)
- Pagination or scrollable list

**Acceptance Criteria**:
- Real-time search as user types
- Status filter dropdown
- Sortable column headers with directional indicator
- Results count displayed
- Empty state when no results match filters

---

### FR-DP-002: Create Delivery Point
**Priority**: High
**User Story**: As an Operations Manager, I want to create new delivery points so that vendors know where to deliver goods.

**Requirements**:
- Add Delivery Point button opens dialog form
- Required fields: Name, Code
- Address fields: Address Line 1, Address Line 2, City, Postal Code, Country
- Contact fields: Contact Name, Contact Phone, Contact Email
- Logistics fields: Max Vehicle Size dropdown, Dock Leveler checkbox, Forklift checkbox
- Operating Hours text field
- Delivery Instructions text area
- Access Instructions text area
- Active status toggle

**Max Vehicle Size Options**:
- Small Van
- Medium Truck
- Large Truck
- Semi-Trailer

**Acceptance Criteria**:
- Form validation for required fields
- Code field: max 20 characters, uppercase with hyphens
- Email field: valid email format
- Phone field: valid phone format
- Default status: Active
- Dialog closes on successful save
- List refreshes to show new entry

---

### FR-DP-003: Edit Delivery Point
**Priority**: High
**User Story**: As an Operations Manager, I want to edit delivery point details so that I can keep information current.

**Requirements**:
- Edit button per row opens dialog with current values
- All fields editable except ID
- Same validation as create
- Cancel and Save buttons

**Acceptance Criteria**:
- Dialog pre-populated with current values
- Changes reflected in list after save
- Cancel discards changes without saving
- Validation errors shown inline

---

### FR-DP-004: Delete Delivery Point
**Priority**: Medium
**User Story**: As an Operations Manager, I want to delete unused delivery points so that the list stays relevant.

**Requirements**:
- Delete button per row
- Confirmation dialog before deletion
- Cannot delete if referenced by locations (future enhancement)

**Acceptance Criteria**:
- Delete confirmation shows delivery point name
- Successful deletion removes row from list
- Cancel returns to list without deleting

---

### FR-DP-005: Activate/Deactivate Delivery Point
**Priority**: Medium
**User Story**: As an Operations Manager, I want to deactivate delivery points no longer in use without deleting historical data.

**Requirements**:
- Active/Inactive status per delivery point
- Inactive delivery points not shown in location assignment dropdowns
- Filter to show/hide inactive delivery points in list

**Acceptance Criteria**:
- Status displayed with color-coded badge (green/gray)
- Toggle in edit form to change status
- Inactive points excluded from location reference dropdowns

---

## Business Rules

### BR-001: Delivery Point Code Format
Delivery point code must be uppercase alphanumeric with hyphens only, maximum 20 characters.

### BR-002: Unique Delivery Point Code
Each delivery point code must be unique across all delivery points.

### BR-003: Active Delivery Points Only in Lookups
Only active delivery points appear in location assignment dropdowns and other reference lookups.

### BR-004: Contact Information Optional
Contact information fields (name, phone, email) are optional but recommended.

---

## Dependencies

- **Location Management**: Locations reference delivery points via deliveryPointId

---

## Success Metrics

1. **CRUD Operations**: Complete create, read, update, delete functionality
2. **Search Performance**: < 300ms for delivery point searches
3. **Form Validation**: All fields validated appropriately
4. **User Experience**: Intuitive list with inline actions

---

## Appendix: Data Model Summary

### DeliveryPoint
- id: string (UUID)
- name: string (required)
- code: string (required, max 20 chars, unique)
- address: object
  - addressLine1: string
  - addressLine2: string (optional)
  - city: string
  - postalCode: string
  - country: string
- contactName: string (optional)
- contactPhone: string (optional)
- contactEmail: string (optional)
- deliveryInstructions: string (optional)
- accessInstructions: string (optional)
- operatingHours: string (optional)
- maxVehicleSize: enum (small_van | medium_truck | large_truck | semi_trailer)
- hasDockLeveler: boolean
- hasForklift: boolean
- isActive: boolean
- createdAt: Date
- createdBy: string
- updatedAt: Date (optional)
- updatedBy: string (optional)

---

## Navigation

- **Path**: System Administration > Delivery Points
- **URL**: `/system-administration/delivery-points`
- **Sidebar Location**: Under System Administration menu, after Location Management
