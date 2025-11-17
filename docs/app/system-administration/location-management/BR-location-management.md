# Business Requirements: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.0
- **Last Updated**: 2025-01-16
- **Status**: Active

## Overview

Location Management enables operations managers to define and manage physical and logical locations for inventory management, store operations, and delivery points across the hospitality organization.

## Business Goals

1. **Centralized Location Control**: Single source of truth for all operational locations
2. **Inventory Segregation**: Enable separate inventory tracking per location
3. **Access Control**: Restrict user access to specific locations
4. **Delivery Management**: Link locations to delivery points for procurement
5. **Stock Count Planning**: Configure physical count requirements per location

## Functional Requirements

### FR-LOC-001: Location Creation
**Priority**: High
**User Story**: As an Operations Manager, I want to create new locations so that I can track inventory and operations at different sites.

**Requirements**:
- Create location with code, name, type, delivery point
- Set location type (Inventory, Direct, Consignment)
- Configure physical count type (yes/no)
- Link to delivery point
- Set active status

**Acceptance Criteria**:
- Location name must be unique
- Location code max 10 characters
- Type must be one of: Inventory, Direct, Consignment
- Active locations visible across system
- Audit trail captures creation

---

### FR-LOC-002: Location Types
**Priority**: High
**User Story**: As a Store Manager, I want different location types so that inventory behaves correctly based on location purpose.

**Location Types**:
- **Inventory**: Standard warehouse/store locations with full inventory tracking
- **Direct**: Direct consumption locations (kitchen, production areas)
- **Consignment**: Consignment stock locations (owned by vendor until consumed)

**Acceptance Criteria**:
- Type determines inventory behavior and costing
- Inventory locations support all stock transactions
- Direct locations bypass stock-in processes
- Consignment locations track vendor ownership

---

### FR-LOC-003: Physical Count Configuration
**Priority**: Medium
**User Story**: As an Inventory Manager, I want to specify which locations require physical counts so that I can plan count schedules efficiently.

**Requirements**:
- Set physical_count_type (yes/no) per location
- Locations with "yes" appear in count schedules
- Locations with "no" excluded from physical counts

**Acceptance Criteria**:
- Physical count setting affects stock count workflows
- Cannot perform stock count at "no" locations
- Count schedules auto-populate "yes" locations

---

### FR-LOC-004: Delivery Point Assignment
**Priority**: Medium
**User Story**: As a Purchasing Manager, I want to assign delivery points to locations so that purchase orders route correctly.

**Requirements**:
- Link location to delivery point (from tb_delivery_point)
- Support multiple locations per delivery point
- Display delivery point address on purchase orders
- Update delivery point references when changed

**Acceptance Criteria**:
- Delivery point must be active
- Purchase orders use location's delivery point
- Delivery point changes reflect immediately
- Historical POs retain original delivery point

---

### FR-LOC-005: User Assignment
**Priority**: High
**User Story**: As a System Administrator, I want to assign users to locations so that they only access data from authorized sites.

**Requirements**:
- Assign multiple users to a location
- Assign multiple locations to a user
- Remove user assignments
- Filter all data by user's assigned locations

**Acceptance Criteria**:
- Users see only assigned location data
- Location change requires re-authentication
- User without locations cannot access inventory
- Audit log tracks assignments

---

### FR-LOC-006: Product Assignment
**Priority**: Medium
**User Story**: As a Store Manager, I want to assign products to locations so that only relevant items appear in requisitions and counts.

**Requirements**:
- Assign products to specific locations
- Define min/max stock levels per product-location
- Set reorder points per location
- Support bulk product assignment

**Acceptance Criteria**:
- Only assigned products visible at location
- Stock levels tracked per product-location
- Reorder alerts based on location thresholds
- Product removal blocks if stock exists

---

### FR-LOC-007: Location Search & Filter
**Priority**: Medium
**User Story**: As an Operations Manager, I want to search and filter locations so that I can quickly find specific sites.

**Requirements**:
- Search by name, code, delivery point
- Filter by type, active status, physical count setting
- Sort by name, code, type, created date

**Acceptance Criteria**:
- Search returns real-time results
- Multiple filters combine with AND logic
- Results update as filters change

---

### FR-LOC-008: Location Activation/Deactivation
**Priority**: High
**User Story**: As a System Administrator, I want to deactivate closed locations so that they don't appear in operational screens while preserving historical data.

**Requirements**:
- Set is_active flag to true/false
- Inactive locations excluded from dropdowns
- Historical transactions preserved
- Reactivation restores visibility

**Acceptance Criteria**:
- Cannot deactivate location with stock
- Inactive locations hidden in new transactions
- Historical reports include inactive locations
- User assignments auto-suspend on deactivation

---

## Business Rules

### BR-001: Unique Location Name
Each location must have a unique name across the entire system.

### BR-002: Cannot Delete Location with Stock
Locations with inventory balances cannot be deleted, only deactivated.

### BR-003: Location Type Immutable
Location type cannot be changed after creation if transactions exist.

### BR-004: Active Delivery Point Required
Assigned delivery point must be active.

### BR-005: Physical Count Location Requirement
Stock counts can only be performed at locations with physical_count_type = yes.

## Dependencies

- **Inventory Management**: Provides stock transaction data
- **User Management**: Provides user assignments
- **Product Management**: Provides product catalog
- **Procurement**: Uses delivery points for purchase orders
- **Store Operations**: Uses locations for requisitions

## Success Metrics

1. **Location Setup Time**: < 2 minutes per location
2. **Search Performance**: < 300ms for location searches
3. **User Assignment Accuracy**: 100% correct access control
4. **Data Integrity**: Zero stock misplacements between locations
