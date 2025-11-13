# Data Definition: Physical Count Management

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Physical Count Management
- **Database**: PostgreSQL
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version |

---

## Overview

This document defines the data structures for the Physical Count Management sub-module, which manages inventory counting sessions, line-by-line item counts, variance tracking, and integration with the inventory transaction system. The data model supports both scheduled physical counts and spot checks, with comprehensive audit trails and workflow management.

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-physical-count-management.md) - Requirements in text format (no code)
- [Technical Specification](./TS-physical-count-management.md) - Implementation patterns in text format (no code)
- [Use Cases](./UC-physical-count-management.md) - Use cases in text format (no code)
- [Flow Diagrams](./FD-physical-count-management.md) - Visual diagrams with mermaid (ONLY place for diagrams)
- [Validations](./VAL-physical-count-management.md) - Validation rules in text format (no code)

---

## Entity Relationship Overview

**Primary Entities**: Core data entities in the Physical Count Management sub-module
- **Count Stock Session (tb_count_stock)**: Represents a physical count session initiated at a specific location, containing header information about the count event, timing, status, and ownership
- **Count Stock Detail (tb_count_stock_detail)**: Represents individual product lines within a count session, tracking expected vs actual quantities, variances, and adjustment information for each item being counted
- **Product (tb_product)**: Reference entity containing product master data including SKU, name, units of measure, and product specifications
- **Location (tb_location)**: Reference entity representing physical locations (warehouses, stores, departments) where counts are performed
- **User (tb_user)**: Reference entity containing user information for count creators, counters, and approvers

**Key Relationships**:
1. **Count Stock Session → Count Stock Detail**: One-to-Many relationship
   - Business meaning: Each count session contains multiple product line items being counted. A single count event at a location involves counting multiple inventory items, with each item tracked separately.
   - Cardinality: One count session has 1 to many count detail records
   - Example: A kitchen count session has 50 detail lines representing 50 different food items being counted

2. **Count Stock Detail → Product**: Many-to-One relationship
   - Business meaning: Each count line references a specific product from the master product catalog. Multiple count sessions can count the same product at different times or locations.
   - Cardinality: Many count details reference one product
   - Example: "Chicken Breast 1kg" product appears in multiple count sessions across different days and locations

3. **Count Stock Session → Location**: Many-to-One relationship
   - Business meaning: Each count session is performed at a specific physical location (warehouse, store, department). Multiple count sessions occur at the same location over time.
   - Cardinality: Many count sessions belong to one location
   - Example: Main Kitchen location has weekly count sessions every Monday

4. **Count Stock Session → User**: Many-to-One relationship (multiple user fields)
   - Business meaning: Tracks who created the count session, who performed the counting, and who approved/completed it. Maintains accountability and audit trail.
   - Cardinality: Many count sessions reference the same users (creators, counters, approvers)
   - Example: Store Manager "John Smith" creates count sessions, multiple staff members perform counts

5. **Count Stock Session → Department**: Many-to-One relationship
   - Business meaning: Associates count sessions with organizational departments for reporting, permissions, and workflow routing
   - Cardinality: Many count sessions belong to one department
   - Example: All kitchen inventory counts belong to the "Food & Beverage" department

**Relationship Notes**:
- Count sessions use soft delete pattern (deleted_at timestamp) to preserve historical data while removing from active views
- Deleting a count session cascades to delete all related count detail records (referential integrity maintained)
- Product, Location, and User references use RESTRICT cascade behavior (cannot delete if referenced by active counts)
- Workflow tracking fields capture status history and user actions throughout the count lifecycle
- See [Flow Diagrams](./FD-physical-count-management.md) for visual ERD diagrams if needed

---

## Data Entities

### Entity: Count Stock Session (tb_count_stock)

**Description**: Represents a physical inventory count session initiated at a specific location to verify on-hand quantities against system records. Each session captures header-level information including timing, location, status, count type, workflow stage, and aggregate variance results.

**Business Purpose**: Serves as the container for organizing and tracking inventory counting activities. Supports scheduled periodic counts, cycle counts, and spot checks. Enables variance analysis, inventory adjustment workflows, and compliance with inventory management best practices. Provides audit trail for inventory accuracy verification.

**Data Ownership**: Inventory Management Department, with access controlled by location and department permissions. Count sessions are owned by the location where the count is performed, with visibility based on user role (storekeeper, supervisor, manager).

**Access Pattern**:
- By ID: Direct lookup for viewing/editing specific count session
- By location: List all counts for a specific warehouse/store/department
- By status: Filter counts by workflow stage (pending, in_progress, completed)
- By date range: Historical count analysis, reporting, and trend tracking
- By count type: Separate views for physical counts vs spot checks
- By user: View counts created by or assigned to specific users

**Data Volume**: Expected 50-200 count sessions per month (4-16 per location), approximately 600-2,400 records per year. With 12-month retention in active tables and 7-year archival, expect ~2,000-3,000 active records and ~15,000-18,000 archived records.

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID format, auto-generated using PostgreSQL gen_random_uuid())
- **Business Key**: count_stock_no - Human-readable count session number (format: "CNT-YYYY-NNNN" or similar)
- **Display Name**: Combination of count_stock_no + location_name + date for user display

**Core Business Fields**:
- **count_stock_no**: VARCHAR - Business identifier for the count session
  - Required: Yes (auto-generated)
  - Unique: Yes (among non-deleted records)
  - Example values: "CNT-2024-0001", "PC-MK-20240115", "COUNT-20240115-001"
  - Purpose: Human-readable reference for users, printed reports, and cross-system references

- **count_stock_type**: ENUM - Type of inventory count being performed
  - Required: Yes
  - Default value: 'physical'
  - Allowed values: 'physical' (comprehensive full count), 'spot' (quick verification count)
  - Example values: 'physical' for monthly full counts, 'spot' for daily quick checks
  - Purpose: Differentiates between full physical inventory counts and targeted spot checks

- **location_id**: UUID - Reference to the location where count is performed
  - Required: Yes
  - Foreign key to: tb_location.id
  - Example values: UUID of "Main Kitchen", "Central Warehouse", "Bar Storage"
  - Purpose: Identifies where inventory is being counted, enforces location-based permissions

- **location_name**: VARCHAR - Denormalized location name for reporting
  - Required: No (populated from tb_location)
  - Example values: "Main Kitchen", "Central Warehouse", "Bar Storage - Floor 2"
  - Purpose: Performance optimization for reports, maintains readable name even if location renamed

- **department_id**: UUID - Reference to department owning this count
  - Required: No (may inherit from location)
  - Foreign key to: tb_department.id
  - Example values: UUID of "Food & Beverage", "Housekeeping", "Maintenance"
  - Purpose: Organizational grouping, permissions, workflow routing

- **start_date**: TIMESTAMPTZ - When the count session was initiated
  - Required: Yes
  - Default value: NOW() (current timestamp)
  - Example values: "2024-01-15T08:00:00Z" (8 AM UTC on Jan 15, 2024)
  - Purpose: Records when counting began, used for duration calculations and reporting

- **end_date**: TIMESTAMPTZ - When the count session was completed
  - Required: No (NULL until count is completed)
  - Example values: "2024-01-15T14:30:00Z" (2:30 PM UTC on Jan 15, 2024), NULL for in-progress
  - Purpose: Records completion time, used for calculating count duration and productivity metrics

- **description**: VARCHAR - Brief description or purpose of the count
  - Required: No
  - Example values: "Monthly kitchen inventory count", "Spot check after delivery", "Year-end physical count"
  - Purpose: Provides context about why count was initiated, aids in historical analysis

- **note**: VARCHAR - Additional notes, observations, or comments
  - Required: No
  - Example values: "Found expired items removed", "Freezer temperature was low, affecting product condition"
  - Purpose: Captures qualitative information, issues encountered, and contextual details

**Status and Workflow**:
- **doc_status**: ENUM - Current status in the count workflow lifecycle
  - Allowed values: 'pending' (newly created, not started), 'in_progress' (counting underway), 'completed' (count finished and closed), 'cancelled' (count cancelled before completion), 'voided' (count invalidated after completion)
  - Status transitions: pending → in_progress → completed, or pending/in_progress → cancelled
  - Default status: 'pending'
  - Business rules: Only pending counts can be edited; completed counts are immutable; voided counts require approval
  - Example: New count starts as 'pending', transitions to 'in_progress' when counter begins, moves to 'completed' when finalized

- **workflow_id**: VARCHAR - External workflow system identifier
  - Purpose: Links to external workflow/approval system if integrated
  - Example: "WF-20240115-001" for workflow orchestration

- **workflow_name**: VARCHAR - Name of the workflow stage or process
  - Purpose: Human-readable workflow stage description
  - Example: "Kitchen Monthly Count", "Emergency Spot Check"

- **workflow_current_stage**: VARCHAR - Current stage in multi-step workflow
  - Purpose: Tracks position in approval or verification workflows
  - Example: "counting", "supervisor_review", "manager_approval"

- **workflow_history**: JSONB - Complete history of workflow transitions and actions
  - Purpose: Audit trail of all status changes, approvals, and user actions
  - Structure: Array of objects with timestamp, user, action, from_status, to_status, reason
  - Example: `[{"timestamp": "2024-01-15T08:00:00Z", "user": "john.smith", "action": "started", "from_status": "pending", "to_status": "in_progress"}]`

**Flexible Data Fields**:
- **info**: JSONB - Additional flexible information and metadata
  - Common attributes:
    - "total_items_counted": number of products counted
    - "total_variance_value": aggregate monetary variance
    - "high_variance_items": count of items exceeding variance threshold
    - "expected_total_quantity": sum of expected quantities
    - "actual_total_quantity": sum of actual counted quantities
    - "adjustment_posted": boolean indicating if adjustment transaction created
    - "requires_approval": boolean for high-variance counts
    - "counter_ids": array of user IDs who performed counting
  - Use cases: Storing calculated summaries, custom fields per location, integration flags
  - Example: `{"total_items_counted": 52, "total_variance_value": 1250.50, "high_variance_items": 3, "requires_approval": true}`

**Audit Fields** (Standard for all entities):
- **created_at**: TIMESTAMPTZ - Timestamp when record was created (UTC, immutable)
  - Auto-populated: Yes (default NOW())
  - Example: "2024-01-15T08:00:00Z"
- **created_by**: UUID - User who created the count session (UUID reference to tb_user)
  - Required: Yes
  - Example: UUID of "John Smith - Inventory Manager"
- **updated_at**: TIMESTAMPTZ - Timestamp of last modification (UTC, auto-updated on every change)
  - Auto-populated: Yes (triggers update on row modification)
  - Example: "2024-01-15T14:30:00Z"
- **updated_by**: UUID - User who last modified the record (UUID reference to tb_user)
  - Required: Yes
  - Example: UUID of "Jane Doe - Supervisor"
- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp (NULL for active records)
  - Default: NULL (active record)
  - Example: NULL (active), "2024-02-01T10:00:00Z" (soft deleted)
  - Purpose: Allows data recovery, maintains referential integrity, preserves audit trail

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key, unique identifier | 550e8400-e29b-41d4-a716-446655440001 | Unique, Non-null |
| count_stock_no | VARCHAR | Yes | Auto-generated | Human-readable count session number | CNT-2024-0001, PC-MK-20240115 | Unique within active records |
| count_stock_type | ENUM | Yes | 'physical' | Type of count (physical or spot check) | physical, spot | Must be 'physical' or 'spot' |
| start_date | TIMESTAMPTZ | Yes | NOW() | When count session was initiated | 2024-01-15T08:00:00Z | Cannot be far in future |
| end_date | TIMESTAMPTZ | No | NULL | When count session was completed | 2024-01-15T14:30:00Z | Must be >= start_date |
| location_id | UUID | Yes | - | Reference to location where count performed | 550e8400-... | Must reference existing location |
| location_name | VARCHAR | No | From location | Denormalized location name | Main Kitchen, Central Warehouse | - |
| department_id | UUID | No | NULL | Department owning this count | 550e8400-... | Must reference existing dept |
| doc_status | ENUM | Yes | 'pending' | Current status in workflow | pending, in_progress, completed | Must be from allowed values |
| description | VARCHAR | No | NULL | Brief description or purpose | Monthly kitchen inventory count | - |
| note | VARCHAR | No | NULL | Additional notes or observations | Found expired items removed | - |
| workflow_id | VARCHAR | No | NULL | External workflow system ID | WF-20240115-001 | - |
| workflow_name | VARCHAR | No | NULL | Workflow stage description | Kitchen Monthly Count | - |
| workflow_current_stage | VARCHAR | No | NULL | Current stage in workflow | supervisor_review | - |
| workflow_history | JSONB | No | NULL | Complete workflow transition history | [{"timestamp": ..., "action": ...}] | Valid JSON array |
| info | JSONB | No | NULL | Additional flexible metadata | {"total_items_counted": 52} | Valid JSON object |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp (UTC) | 2024-01-15T08:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user reference | 550e8400-... | Must reference existing user |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp (UTC) | 2024-01-15T14:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user reference | 550e8400-... | Must reference existing user |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active records |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using gen_random_uuid()
- Purpose: Uniquely identifies each count session across the entire system

**Unique Constraints**:
- `count_stock_no`: Must be unique among non-deleted records
  - Allows reuse after soft delete
  - Format: Configurable per organization (e.g., "CNT-YYYY-NNNN", "PC-{location_code}-{YYYYMMDD}-{NN}")
  - Generated automatically by system on count session creation

**Foreign Key Relationships**:
- **Location** (`location_id` → `tb_location.id`)
  - On Delete: RESTRICT (cannot delete location with active counts)
  - On Update: CASCADE
  - Business rule: Counts are tied to physical locations; location must exist when count created

- **Department** (`department_id` → `tb_department.id`)
  - On Delete: RESTRICT (cannot delete department with active counts)
  - On Update: CASCADE
  - Business rule: Departmental ownership for reporting and permissions

- **User** (`created_by`, `updated_by` → `tb_user.id`)
  - On Delete: SET NULL (preserve history even if user deleted)
  - On Update: CASCADE
  - Business rule: Track record ownership and accountability

**Check Constraints**:
- **Status values**: Must be one of: 'pending', 'in_progress', 'completed', 'cancelled', 'voided'
  - Enforced by ENUM type definition
  - Business rule: Controls workflow transitions and data immutability

- **Count type values**: Must be 'physical' or 'spot'
  - Enforced by ENUM type definition
  - Business rule: Differentiates comprehensive counts from quick checks

- **Date validation**: `end_date` must be >= `start_date` (if not null)
  - Business rule: Count cannot complete before it starts (logical temporal consistency)

- **Location requirement**: `location_id` must not be null
  - Business rule: Every count must be associated with a physical location

**Not Null Constraints**:
- Required fields cannot be NULL: id, count_stock_no, count_stock_type, start_date, location_id, doc_status, created_at, created_by, updated_at, updated_by
- Business justification: These fields are essential for identifying, locating, and tracking count sessions

**Default Values**:
- `count_stock_type`: 'physical' - Most common type of count
- `doc_status`: 'pending' - New count sessions start in pending state
- `start_date`: NOW() - Automatically capture creation time
- `created_at`, `updated_at`: NOW() - Automatic timestamp capture
- `deleted_at`: NULL - Records are active by default

#### Sample Data Examples

**Example 1: Monthly Physical Count**
```
ID: 550e8400-e29b-41d4-a716-446655440001
Count No: CNT-2024-0015
Type: physical
Start Date: 2024-01-15 08:00:00 UTC
End Date: 2024-01-15 14:30:00 UTC
Location: Main Kitchen (ID: 440e8400-...)
Department: Food & Beverage
Status: completed
Description: Monthly kitchen inventory count - January 2024
Note: Found 3 expired dairy products, removed from inventory
Info: {
  "total_items_counted": 52,
  "total_variance_value": -350.50,
  "high_variance_items": 2,
  "adjustment_posted": true
}
Created: 2024-01-15 08:00:00 UTC by John Smith (Inventory Manager)
Completed: 2024-01-15 14:30:00 UTC
```

**Example 2: Spot Check After Delivery**
```
ID: 550e8400-e29b-41d4-a716-446655440002
Count No: CNT-2024-0016
Type: spot
Start Date: 2024-01-16 10:15:00 UTC
End Date: 2024-01-16 10:45:00 UTC
Location: Central Warehouse (ID: 441e8400-...)
Department: Procurement
Status: completed
Description: Spot check verification after meat delivery
Note: Delivery quantities match PO, no discrepancies
Info: {
  "total_items_counted": 8,
  "total_variance_value": 0.00,
  "high_variance_items": 0,
  "adjustment_posted": false,
  "related_po": "PO-2024-0125"
}
Created: 2024-01-16 10:15:00 UTC by Maria Garcia (Receiving Clerk)
Completed: 2024-01-16 10:45:00 UTC
```

**Example 3: In-Progress Count Session**
```
ID: 550e8400-e29b-41d4-a716-446655440003
Count No: CNT-2024-0017
Type: physical
Start Date: 2024-01-17 09:00:00 UTC
End Date: NULL (in progress)
Location: Bar Storage (ID: 442e8400-...)
Department: Food & Beverage
Status: in_progress
Description: Weekly bar inventory count
Note: NULL
Info: {
  "total_items_counted": 15,
  "expected_items": 45,
  "counter_ids": ["user-id-123"]
}
Workflow History: [
  {
    "timestamp": "2024-01-17T09:00:00Z",
    "user": "robert.lee",
    "action": "started",
    "from_status": "pending",
    "to_status": "in_progress"
  }
]
Created: 2024-01-17 09:00:00 UTC by Robert Lee (Bar Manager)
Last Updated: 2024-01-17 09:35:00 UTC by Robert Lee
```

---

### Entity: Count Stock Detail (tb_count_stock_detail)

**Description**: Represents individual product line items within a physical count session. Each detail record tracks expected quantity (from system records), actual counted quantity (physical verification), variance calculation, unit of measure, and adjustment information for a specific product being counted during the inventory verification process.

**Business Purpose**: Provides granular item-by-item count data that forms the basis for variance analysis, inventory adjustments, and accuracy reporting. Enables line-level tracking of discrepancies, supports root cause analysis of inventory inaccuracies, and maintains detailed audit trail of counting activities. Integrates with inventory transaction system to retrieve expected quantities and post adjustments.

**Data Ownership**: Inventory Management Department, with access controlled by parent count session permissions. Detail records inherit security context from the count session header (location, department, user permissions).

**Access Pattern**:
- By count session ID: Retrieve all line items for a specific count session (primary access pattern)
- By product ID: Find all historical counts for a specific product across sessions
- By variance threshold: Identify high-variance items requiring investigation
- By sequence: Maintain display order within count session for user interface
- Aggregated: Calculate session-level totals and variance summaries

**Data Volume**: Expected 20-100 detail lines per count session, approximately 1,000-8,000 detail records per month. With parent session retention policies, expect ~12,000-96,000 active detail records and ~84,000-672,000 archived detail records over 7 years.

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID format, auto-generated using PostgreSQL gen_random_uuid())
- **Composite Business Key**: Combination of count_stock_id + sequence_no + product_id uniquely identifies each line
- **Display Name**: Combination of sequence_no + product_name + SKU for user display

**Core Business Fields**:
- **count_stock_id**: UUID - Reference to parent count session
  - Required: Yes
  - Foreign key to: tb_count_stock.id
  - Example values: UUID of parent count session
  - Purpose: Links detail line to count session header, establishes parent-child relationship

- **sequence_no**: INTEGER - Line sequence number within the count session
  - Required: No
  - Default value: 1
  - Example values: 1, 2, 3, ... (sequential line numbers)
  - Purpose: Maintains display order, allows re-ordering of lines, provides user reference

- **product_id**: UUID - Reference to product being counted
  - Required: Yes
  - Foreign key to: tb_product.id
  - Example values: UUID of "Chicken Breast 1kg", "Tomato Sauce 5L"
  - Purpose: Identifies which inventory item is being counted

- **product_code**: VARCHAR - Denormalized product SKU/code
  - Required: No (populated from tb_product)
  - Example values: "CHKN-BRST-1KG", "SKU-12345"
  - Purpose: Performance optimization, maintains readable code even if product renamed

- **product_name**: VARCHAR - Denormalized product name
  - Required: No (populated from tb_product)
  - Example values: "Chicken Breast 1kg", "Tomato Sauce 5L"
  - Purpose: Performance optimization for reporting and display

- **unit_id**: UUID - Reference to unit of measure
  - Required: No
  - Foreign key to: tb_unit.id
  - Example values: UUID of "kg", "liters", "pieces"
  - Purpose: Defines how quantity is measured for this product

- **unit_name**: VARCHAR - Denormalized unit name
  - Required: No (populated from tb_unit)
  - Example values: "kg", "liters", "pieces", "cases"
  - Purpose: Performance optimization, display unit without joins

**Quantity Fields**:
- **expected_qty**: DECIMAL(15,2) - Expected quantity from system records
  - Required: No (retrieved from inventory transaction closing balance)
  - Example values: 45.00, 120.50, 1500.00
  - Purpose: System's theoretical on-hand quantity, basis for variance calculation
  - Source: tb_inventory_transaction_closing_balance for the location and product

- **actual_qty**: DECIMAL(15,2) - Physically counted quantity
  - Required: No (NULL until counted)
  - Example values: 43.00, 125.00, 1498.50
  - Purpose: Real-world verified quantity, entered by counter during physical verification

- **variance_qty**: DECIMAL(15,2) - Calculated variance (actual - expected)
  - Required: No (calculated field)
  - Example values: -2.00 (shortage), +4.50 (overage), 0.00 (match)
  - Purpose: Quantifies discrepancy between system and physical, triggers investigation

- **variance_pct**: DECIMAL(5,2) - Variance as percentage of expected
  - Required: No (calculated field)
  - Calculation: (variance_qty / expected_qty) * 100
  - Example values: -4.44% (shortage), +3.73% (overage), 0.00% (match)
  - Purpose: Normalizes variance for comparison across products, triggers thresholds

**Status and Adjustment Fields**:
- **is_counted**: BOOLEAN - Flag indicating if item has been physically counted
  - Required: No
  - Default value: false
  - Example values: true (counted), false (not yet counted)
  - Purpose: Tracks counting progress, prevents premature session completion

- **adjustment_posted**: BOOLEAN - Flag indicating if adjustment transaction created
  - Required: No
  - Default value: false
  - Example values: true (adjustment posted), false (not yet posted)
  - Purpose: Prevents duplicate adjustment postings, tracks integration status

- **adjustment_transaction_id**: UUID - Reference to posted inventory adjustment transaction
  - Required: No (NULL until adjustment posted)
  - Foreign key to: tb_inventory_transaction.id
  - Example values: UUID of adjustment transaction
  - Purpose: Links count result to inventory ledger, enables reconciliation

**Additional Fields**:
- **note**: VARCHAR - Line-level notes or comments
  - Required: No
  - Example values: "Product damaged", "Expiry date near", "Miscounted initially, recounted"
  - Purpose: Captures qualitative observations, explanations for variances

- **info**: JSONB - Additional flexible metadata for the line item
  - Common attributes:
    - "recount_required": boolean flag for items needing verification
    - "variance_reason": explanation code or text
    - "photo_urls": array of image URLs documenting physical count
    - "bin_location": specific storage location within broader location
    - "lot_number": batch or lot information if tracked
  - Use cases: Storing custom attributes, integration data, extended information
  - Example: `{"variance_reason": "expired_removed", "photo_urls": ["https://..."], "recount_required": false}`

**Audit Fields** (Standard for all entities):
- **created_at**: TIMESTAMPTZ - Timestamp when line was created (UTC, immutable)
- **created_by**: UUID - User who created the detail line
- **updated_at**: TIMESTAMPTZ - Timestamp of last modification (UTC, auto-updated)
- **updated_by**: UUID - User who last modified the line
- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp (NULL for active records)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key, unique identifier | 550e8400-e29b-41d4-a716-446655440010 | Unique, Non-null |
| count_stock_id | UUID | Yes | - | Reference to parent count session | 550e8400-e29b-41d4-a716-446655440001 | Must reference existing count |
| sequence_no | INTEGER | No | 1 | Line number within count session | 1, 2, 3, 10 | Positive integer |
| product_id | UUID | Yes | - | Reference to product being counted | 550e8400-... | Must reference existing product |
| product_code | VARCHAR | No | From product | Denormalized product SKU | CHKN-BRST-1KG | - |
| product_name | VARCHAR | No | From product | Denormalized product name | Chicken Breast 1kg | - |
| unit_id | UUID | No | NULL | Reference to unit of measure | 550e8400-... | Must reference existing unit |
| unit_name | VARCHAR | No | From unit | Denormalized unit name | kg, liters, pieces | - |
| expected_qty | DECIMAL(15,2) | No | NULL | Expected quantity from system | 45.00, 120.50 | Must be >= 0 |
| actual_qty | DECIMAL(15,2) | No | NULL | Physically counted quantity | 43.00, 125.00 | Must be >= 0 |
| variance_qty | DECIMAL(15,2) | No | Calculated | Variance (actual - expected) | -2.00, +4.50, 0.00 | Can be negative |
| variance_pct | DECIMAL(5,2) | No | Calculated | Variance percentage | -4.44%, +3.73% | Can be negative |
| is_counted | BOOLEAN | No | false | Flag if item counted | true, false | - |
| adjustment_posted | BOOLEAN | No | false | Flag if adjustment transaction created | true, false | - |
| adjustment_transaction_id | UUID | No | NULL | Reference to adjustment transaction | 550e8400-... | Must reference existing txn |
| note | VARCHAR | No | NULL | Line-level notes | Product damaged | - |
| info | JSONB | No | NULL | Additional flexible metadata | {"variance_reason": "..."} | Valid JSON object |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp (UTC) | 2024-01-15T08:30:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user reference | 550e8400-... | Must reference existing user |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp (UTC) | 2024-01-15T14:00:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user reference | 550e8400-... | Must reference existing user |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active records |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using gen_random_uuid()
- Purpose: Uniquely identifies each count detail line across the entire system

**Unique Constraints**:
- No explicit unique constraint on business keys (same product can appear multiple times in a count if needed)
- Typical pattern: One product appears once per count session (enforced by application logic)
- Composite uniqueness: (count_stock_id, product_id) typically unique but not database-enforced

**Foreign Key Relationships**:
- **Count Stock** (`count_stock_id` → `tb_count_stock.id`)
  - On Delete: CASCADE (deleting count session deletes all detail lines)
  - On Update: CASCADE
  - Business rule: Detail lines cannot exist without parent count session

- **Product** (`product_id` → `tb_product.id`)
  - On Delete: RESTRICT (cannot delete product with count history)
  - On Update: CASCADE
  - Business rule: Products referenced in counts must exist

- **Unit** (`unit_id` → `tb_unit.id`)
  - On Delete: RESTRICT (cannot delete unit with count references)
  - On Update: CASCADE
  - Business rule: Units of measure must be defined

- **Adjustment Transaction** (`adjustment_transaction_id` → `tb_inventory_transaction.id`)
  - On Delete: RESTRICT (cannot delete posted adjustment)
  - On Update: CASCADE
  - Business rule: Maintains link to inventory ledger

- **User** (`created_by`, `updated_by` → `tb_user.id`)
  - On Delete: SET NULL (preserve history even if user deleted)
  - On Update: CASCADE
  - Business rule: Track record ownership and accountability

**Check Constraints**:
- **Quantity validation**: `expected_qty` and `actual_qty` must be >= 0
  - Business rule: Cannot have negative on-hand inventory quantities

- **Variance calculation**: `variance_qty` = `actual_qty` - `expected_qty`
  - Enforced by application logic and database triggers
  - Can be negative (shortage) or positive (overage)

- **Variance percentage**: `variance_pct` = (`variance_qty` / `expected_qty`) * 100
  - Calculated field, division by zero handled (returns NULL if expected_qty = 0)

- **Sequence number**: Must be positive integer if provided
  - Business rule: Maintains logical ordering of lines

**Not Null Constraints**:
- Required fields cannot be NULL: id, count_stock_id, product_id, created_at, created_by, updated_at, updated_by
- Business justification: These fields are essential for identifying and linking count detail lines

**Default Values**:
- `sequence_no`: 1 - Default line number if not specified
- `is_counted`: false - New lines start as uncounted
- `adjustment_posted`: false - Adjustments not posted initially
- `created_at`, `updated_at`: NOW() - Automatic timestamp capture
- `deleted_at`: NULL - Records are active by default

#### Sample Data Examples

**Example 1: Counted Item with Shortage Variance**
```
ID: 550e8400-e29b-41d4-a716-446655440010
Count Session: CNT-2024-0015 (ID: 550e8400-...001)
Sequence: 1
Product: Chicken Breast 1kg (ID: 660e8400-..., Code: CHKN-BRST-1KG)
Unit: kg
Expected Qty: 45.00 kg
Actual Qty: 43.00 kg
Variance Qty: -2.00 kg
Variance %: -4.44%
Is Counted: true
Adjustment Posted: true
Adjustment Transaction: ADJ-2024-0234 (ID: 770e8400-...)
Note: 2 kg shortage found, likely due to unrecorded kitchen usage
Info: {
  "variance_reason": "unrecorded_usage",
  "bin_location": "Walk-in Cooler A-3",
  "recount_required": false
}
Created: 2024-01-15 08:30:00 UTC by John Smith
Last Updated: 2024-01-15 14:30:00 UTC by John Smith
```

**Example 2: Counted Item with Overage Variance**
```
ID: 550e8400-e29b-41d4-a716-446655440011
Count Session: CNT-2024-0015 (ID: 550e8400-...001)
Sequence: 2
Product: Tomato Sauce 5L (ID: 661e8400-..., Code: TOM-SAUCE-5L)
Unit: liters
Expected Qty: 120.00 L
Actual Qty: 125.00 L
Variance Qty: +5.00 L
Variance %: +4.17%
Is Counted: true
Adjustment Posted: true
Adjustment Transaction: ADJ-2024-0235 (ID: 770e8400-...)
Note: Found 1 unreceived case (5L), checking receiving records
Info: {
  "variance_reason": "unreceived_delivery",
  "bin_location": "Dry Storage B-12",
  "related_po": "PO-2024-0120"
}
Created: 2024-01-15 08:30:00 UTC by John Smith
Last Updated: 2024-01-15 14:30:00 UTC by John Smith
```

**Example 3: Uncounted Item (Pending)**
```
ID: 550e8400-e29b-41d4-a716-446655440012
Count Session: CNT-2024-0017 (ID: 550e8400-...003)
Sequence: 15
Product: Vodka Premium 1L (ID: 662e8400-..., Code: VOD-PREM-1L)
Unit: bottles
Expected Qty: 24.00 bottles
Actual Qty: NULL (not yet counted)
Variance Qty: NULL
Variance %: NULL
Is Counted: false
Adjustment Posted: false
Adjustment Transaction: NULL
Note: NULL
Info: {
  "bin_location": "Liquor Storage - Secure Cabinet 2"
}
Created: 2024-01-17 09:00:00 UTC by Robert Lee
Last Updated: 2024-01-17 09:00:00 UTC by Robert Lee
```

**Example 4: Zero Variance (Perfect Match)**
```
ID: 550e8400-e29b-41d4-a716-446655440013
Count Session: CNT-2024-0016 (ID: 550e8400-...002)
Sequence: 1
Product: Ribeye Steak 250g (ID: 663e8400-..., Code: BEEF-RIB-250G)
Unit: pieces
Expected Qty: 48.00 pieces
Actual Qty: 48.00 pieces
Variance Qty: 0.00
Variance %: 0.00%
Is Counted: true
Adjustment Posted: false (no adjustment needed)
Adjustment Transaction: NULL
Note: Count matches delivery, no discrepancies
Info: {
  "variance_reason": "none",
  "bin_location": "Walk-in Freezer C-1",
  "delivery_verified": true
}
Created: 2024-01-16 10:15:00 UTC by Maria Garcia
Last Updated: 2024-01-16 10:45:00 UTC by Maria Garcia
```

---

## Relationships

### One-to-Many Relationships

#### Count Stock Session → Count Stock Detail

**Relationship Type**: One count session has many count detail lines

**Foreign Key**: `tb_count_stock_detail.count_stock_id` references `tb_count_stock.id`

**Cardinality**:
- One parent count session can have: 1 to many children detail lines (typically 20-100 lines per count)
- Each child detail line must have: exactly 1 parent count session

**Cascade Behavior**:
- **On Delete**: CASCADE
  - Deleting parent count session automatically deletes all child detail lines
  - Ensures no orphaned detail records exist
  - When count session is soft deleted (deleted_at set), application should cascade soft delete to details

- **On Update**: CASCADE
  - Updating parent count session ID propagates to all detail lines (rare in practice with UUIDs)

**Business Rule**: Detail lines represent the line-by-line breakdown of items counted during the session. A count session without any detail lines is incomplete and should not be allowed to complete. The parent-child relationship ensures that all count data is grouped under a single session header for reporting, workflow, and audit purposes.

**Example Scenario**:
```
Parent: Count Session CNT-2024-0015 (Main Kitchen, Jan 15, 2024)
Children:
  - Line 1: Chicken Breast 1kg (43.00 kg counted)
  - Line 2: Tomato Sauce 5L (125.00 L counted)
  - Line 3: Olive Oil 1L (38.00 L counted)
  - ... (52 lines total)

When CNT-2024-0015 is deleted:
  - All 52 detail lines are automatically deleted (CASCADE)
  - Ensures referential integrity and prevents orphaned data
  - If using soft delete, application sets deleted_at on all details
```

**Common Query Patterns**:
- Get count session with all detail lines: Filter details by count_stock_id, join to get product names
- Get detail lines for specific session: WHERE count_stock_id = {session_id}
- Count lines per session: GROUP BY count_stock_id with COUNT
- Get sessions with incomplete counts: JOIN details WHERE is_counted = false
- Calculate session totals: Aggregate SUM(variance_qty), SUM(variance_qty * unit_cost) per count_stock_id

---

#### Product → Count Stock Detail (Historical Counts)

**Relationship Type**: One product has been counted in many count sessions over time

**Foreign Key**: `tb_count_stock_detail.product_id` references `tb_product.id`

**Cardinality**:
- One product can appear in: 0 to many count detail records (historical count data)
- Each count detail line references: exactly 1 product

**Cascade Behavior**:
- **On Delete**: RESTRICT
  - Cannot delete product if it appears in any count detail records
  - Protects historical count data and audit trail
  - If product needs to be removed, must archive or inactivate instead of delete

- **On Update**: CASCADE
  - Updates to product ID propagate to all count detail records (rare with UUIDs)

**Business Rule**: Products that have been counted form part of the historical inventory audit trail. Deleting products with count history would compromise data integrity and compliance requirements. Products can be marked inactive but must not be deleted if count records exist.

**Example Scenario**:
```
Product: Chicken Breast 1kg (ID: 660e8400-...)
Historical Counts:
  - CNT-2024-0015 (Jan 15): Expected 45.00, Actual 43.00, Variance -2.00
  - CNT-2024-0008 (Jan 08): Expected 42.00, Actual 42.00, Variance 0.00
  - CNT-2023-0312 (Dec 31): Expected 50.00, Actual 48.00, Variance -2.00
  - ... (historical trend data)

Attempting to delete "Chicken Breast 1kg":
  - Database RESTRICT constraint prevents deletion
  - Error message: "Cannot delete product with count history"
  - Solution: Mark product as inactive instead
```

**Common Query Patterns**:
- Get all counts for a product: WHERE product_id = {product_id} ORDER BY created_at DESC
- Find high-variance products: GROUP BY product_id, aggregate variance statistics
- Product count frequency: Count distinct count_stock_id per product_id
- Historical variance trend: Time series of variance_qty for specific product

---

#### Location → Count Stock Session

**Relationship Type**: One location has many count sessions performed over time

**Foreign Key**: `tb_count_stock.location_id` references `tb_location.id`

**Cardinality**:
- One location can have: 0 to many count sessions (historical counts at that location)
- Each count session belongs to: exactly 1 location

**Cascade Behavior**:
- **On Delete**: RESTRICT
  - Cannot delete location if it has count session records
  - Protects historical count data
  - Location must be archived or inactivated instead

- **On Update**: CASCADE
  - Updates to location ID propagate to all count sessions (rare with UUIDs)

**Business Rule**: Count sessions are inherently tied to the physical location where inventory is stored and counted. Historical count data must remain associated with the original location for audit purposes, even if location is later closed or reorganized.

**Example Scenario**:
```
Location: Main Kitchen (ID: 440e8400-...)
Count Sessions:
  - CNT-2024-0015 (Jan 15, 2024): Monthly physical count
  - CNT-2024-0008 (Jan 08, 2024): Weekly spot check
  - CNT-2023-0312 (Dec 31, 2023): Year-end physical count
  - ... (historical count data)

Attempting to delete "Main Kitchen":
  - Database RESTRICT constraint prevents deletion
  - Error message: "Cannot delete location with count history"
  - Solution: Mark location as inactive instead
```

**Common Query Patterns**:
- Get all counts for a location: WHERE location_id = {location_id} ORDER BY start_date DESC
- Count frequency by location: COUNT(*) GROUP BY location_id
- Location variance trends: Aggregate variance statistics per location over time
- Active count sessions by location: WHERE location_id = {id} AND doc_status IN ('pending', 'in_progress')

---

### Hierarchical Relationships (Self-Referencing)

**Not applicable** - The Physical Count Management data model does not include hierarchical self-referencing relationships. Count sessions and detail lines have flat structures with relationships to master data entities only.

---

## Data Indexing Strategy

### Primary Indexes

**Primary Key Index** (Automatic):
- **Count Stock Table**: `tb_count_stock.id`
  - Purpose: Ensure uniqueness and fast lookup by UUID
  - Type: B-tree (automatic with PRIMARY KEY constraint)
  - Performance: O(log n) lookup, highly efficient
  - Usage: Direct count session retrieval by ID

- **Count Stock Detail Table**: `tb_count_stock_detail.id`
  - Purpose: Ensure uniqueness and fast lookup by UUID
  - Type: B-tree (automatic with PRIMARY KEY constraint)
  - Performance: O(log n) lookup, highly efficient
  - Usage: Direct detail line retrieval by ID

### Business Key Indexes

**Unique Business Key** (Count Stock):
- **Field**: `tb_count_stock.count_stock_no`
- **Purpose**: Fast lookup by human-readable count number, enforce uniqueness
- **Type**: Unique B-tree index
- **Partial Index**: Only on non-deleted records (WHERE deleted_at IS NULL)
- **Use Cases**: User searches by count number (CNT-2024-0015), cross-system references

### Foreign Key Indexes

**Count Stock Detail → Count Stock**:
- **Field**: `tb_count_stock_detail.count_stock_id`
- **Purpose**: Fast joins to parent count session, efficient relationship queries
- **Type**: B-tree index
- **Use Cases**: Loading all detail lines for a count session, cascade operations, session totals

**Count Stock → Location**:
- **Field**: `tb_count_stock.location_id`
- **Purpose**: Filter counts by location, efficient location-based queries
- **Type**: B-tree index
- **Use Cases**: "Show all counts for Main Kitchen", location-specific reporting

**Count Stock Detail → Product**:
- **Field**: `tb_count_stock_detail.product_id`
- **Purpose**: Find all count history for a product, product variance analysis
- **Type**: B-tree index
- **Use Cases**: Product count history, variance trends per product

**User Reference Indexes**:
- **Fields**: `tb_count_stock.created_by`, `tb_count_stock.updated_by`
- **Purpose**: Filter by user who created or modified counts
- **Type**: B-tree indexes
- **Use Cases**: "Show me counts I created", user activity reports

**Department Reference Index**:
- **Field**: `tb_count_stock.department_id`
- **Purpose**: Department-specific count filtering and reporting
- **Type**: B-tree index
- **Use Cases**: Department manager views, departmental reporting

### Status and Workflow Indexes

**Status Index** (Count Stock):
- **Field**: `tb_count_stock.doc_status`
- **Purpose**: Fast filtering by workflow state
- **Type**: B-tree index
- **Partial Index**: WHERE deleted_at IS NULL (only active records)
- **Use Cases**: Dashboard showing "pending counts", "in progress counts", status-specific views

**Count Type Index** (Count Stock):
- **Field**: `tb_count_stock.count_stock_type`
- **Purpose**: Separate views for physical counts vs spot checks
- **Type**: B-tree index
- **Partial Index**: WHERE deleted_at IS NULL
- **Use Cases**: "Show physical counts only", "Show spot checks only"

**Counting Status Index** (Count Stock Detail):
- **Field**: `tb_count_stock_detail.is_counted`
- **Purpose**: Track counting progress, find uncounted items
- **Type**: B-tree index
- **Use Cases**: "Show uncounted items", completion progress tracking

### Composite Indexes

**Status + Date Index** (Count Stock):
- **Fields**: (`doc_status`, `start_date DESC`)
- **Purpose**: Efficient sorting and filtering by status and date together
- **Type**: Composite B-tree index
- **Partial Index**: WHERE deleted_at IS NULL
- **Use Cases**: "Show recent completed counts", time-based reports by status

**Location + Date Index** (Count Stock):
- **Fields**: (`location_id`, `start_date DESC`)
- **Purpose**: Location-specific time-ordered queries
- **Type**: Composite B-tree index
- **Use Cases**: Location manager viewing recent location count history

**Count Session + Sequence Index** (Count Stock Detail):
- **Fields**: (`count_stock_id`, `sequence_no ASC`)
- **Purpose**: Maintain display order of detail lines within session
- **Type**: Composite B-tree index
- **Use Cases**: Displaying count lines in correct sequence for user

**Count Session + Product Index** (Count Stock Detail):
- **Fields**: (`count_stock_id`, `product_id`)
- **Purpose**: Quickly find specific product within a count session, enforce uniqueness
- **Type**: Composite B-tree index (potentially unique)
- **Use Cases**: "Has this product already been added to count?", duplicate prevention

### Date Range Indexes

**Date Range Index** (Count Stock):
- **Fields**: (`start_date`, `end_date`)
- **Purpose**: Fast date range queries for reporting and analysis
- **Type**: B-tree index
- **Use Cases**: "Counts started this month", "Completed counts in date range", duration analysis

**Temporal Index** (Count Stock):
- **Field**: `created_at`
- **Purpose**: Time-series analysis, chronological sorting
- **Type**: B-tree index
- **Use Cases**: Historical reports, trend analysis, audit trails

### JSON/JSONB Indexes

**Info Metadata Index** (Count Stock):
- **Field**: `info`
- **Purpose**: Fast queries on JSON properties
- **Type**: GIN index on JSONB column
- **Use Cases**: Filter by info properties, JSON path queries
- **Example Queries**: info->>'requires_approval' = 'true', info ? 'high_variance_items'

**Info Metadata Index** (Count Stock Detail):
- **Field**: `info`
- **Purpose**: Fast queries on JSON properties at line level
- **Type**: GIN index on JSONB column
- **Use Cases**: Find lines with specific variance reasons, photo documentation queries

### Partial Indexes (Soft Delete)

**Active Records Index**:
- **Fields**: Multiple indexes with WHERE clause
- **Condition**: WHERE deleted_at IS NULL
- **Purpose**: Exclude soft-deleted records from index, improve performance
- **Benefit**: Smaller index size, faster queries on active data
- **Use Cases**: All production queries that filter out deleted records

### Index Maintenance Guidelines

**Monitoring**:
- Track index usage statistics: pg_stat_user_indexes to identify unused indexes
- Monitor index bloat: Reindex when bloat exceeds 20-30%
- Check slow query log: Add indexes for frequently slow queries (>100ms)
- Analyze query plans: Use EXPLAIN ANALYZE to validate index effectiveness

**Best Practices**:
- Index foreign keys used in joins (count_stock_id, product_id, location_id)
- Index columns used in WHERE clauses frequently (>10% of queries): status, location_id, doc_status
- Index columns used in ORDER BY: start_date, created_at
- Use composite indexes for multi-column queries: (status, start_date), (location_id, start_date)
- Avoid over-indexing: Each index has write overhead (~10-15% per index)
- Remove unused indexes: Monitor and cleanup periodically (quarterly reviews)

**Index Naming Convention**:
- Primary key: `tb_count_stock_pkey`, `tb_count_stock_detail_pkey` (automatic)
- Unique: `idx_count_stock_no_unique`, `idx_count_detail_composite_unique`
- Foreign key: `idx_count_stock_location_id`, `idx_count_detail_count_stock_id`
- Composite: `idx_count_stock_status_date`, `idx_count_detail_session_seq`
- Partial: `idx_count_stock_status_active` (with WHERE deleted_at IS NULL)
- JSONB: `idx_count_stock_info_gin`, `idx_count_detail_info_gin`

---

## Data Integrity Rules

### Referential Integrity

**Foreign Key Constraints**:
- All foreign keys must reference existing records in the target table
- Foreign key fields are indexed for query performance
- Relationship validation occurs at database level (cannot be bypassed)

**Cascade Rules** - What happens when parent record is deleted/updated:

**Count Stock Detail → Count Stock**:
- **CASCADE**: Deleting count session automatically deletes all detail lines
  - Use case: Count sessions and their details are tightly coupled; details have no meaning without session
  - Soft delete: Application should cascade soft delete (set deleted_at) to all child details

**Count Stock → Location, Department**:
- **RESTRICT**: Prevent location/department deletion if count sessions exist
  - Forces explicit handling of count history before location removal
  - Use case: Protect historical data, enforce location archival instead of deletion

**Count Stock Detail → Product**:
- **RESTRICT**: Prevent product deletion if count history exists
  - Preserves audit trail and historical count data
  - Use case: Products can be inactivated but not deleted if they have count records

**Count Stock Detail → Adjustment Transaction**:
- **RESTRICT**: Prevent adjustment transaction deletion if referenced by counts
  - Maintains link between count variance and inventory ledger
  - Use case: Ensures posted adjustments cannot be removed, preserving financial integrity

**User References (created_by, updated_by)**:
- **SET NULL**: Foreign key set to NULL when user deleted
  - Preserves historical records even if user account removed
  - Use case: Audit trail survives user account lifecycle

**Orphan Prevention**:
- No detail records without valid parent count session (enforced by foreign key + CASCADE delete)
- No count sessions without valid location (enforced by foreign key + NOT NULL constraint)
- No detail lines without valid product (enforced by foreign key + NOT NULL constraint)
- Application logic must handle cascade scenarios appropriately
- Soft delete parent → Application must cascade soft delete to children

### Domain Integrity

**Data Type Enforcement**:
- Column data types strictly enforced by PostgreSQL
- Type mismatches rejected at insert/update time
- Application must send correctly typed data
- Examples: UUIDs must be valid UUID format, dates must be valid timestamps, decimals must have proper precision

**Check Constraints**:
- Business rules enforced at database level
- Examples:
  - **Status values**: `doc_status IN ('pending', 'in_progress', 'completed', 'cancelled', 'voided')`
  - **Count type values**: `count_stock_type IN ('physical', 'spot')`
  - **Quantity validation**: `expected_qty >= 0 AND actual_qty >= 0` (cannot have negative on-hand quantities)
  - **Date validation**: `end_date >= start_date OR end_date IS NULL` (count cannot complete before it starts)
  - **Sequence validation**: `sequence_no > 0` (line numbers must be positive)

**NOT NULL Constraints**:
- Required fields cannot be null
- Enforced for critical business data
- Examples (Count Stock): id, count_stock_no, count_stock_type, start_date, location_id, doc_status, created_at, created_by, updated_at, updated_by
- Examples (Count Stock Detail): id, count_stock_id, product_id, created_at, created_by, updated_at, updated_by
- Application must provide values for these fields

**DEFAULT Values**:
- Sensible defaults for optional fields
- Reduce application complexity
- Ensure consistency across records
- Examples:
  - `doc_status` defaults to 'pending' (new counts start in pending state)
  - `count_stock_type` defaults to 'physical' (most common type)
  - `sequence_no` defaults to 1 (first line if not specified)
  - `is_counted` defaults to false (items not counted initially)
  - `adjustment_posted` defaults to false (adjustments posted later)
  - `start_date` defaults to NOW() (capture creation time)
  - `created_at`, `updated_at` default to NOW() (automatic timestamp capture)
  - `deleted_at` defaults to NULL (records are active by default)

**UNIQUE Constraints**:
- Prevent duplicate values where business requires uniqueness
- Partial unique constraint on count_stock_no (unique only within active records WHERE deleted_at IS NULL)
- Allows business key reuse after soft delete
- Example: CNT-2024-0015 can be reused after previous instance is soft deleted (edge case)

### Entity Integrity

**Primary Key Requirements**:
- Every table must have a primary key
- Primary keys are immutable (never updated)
- Primary keys are always NOT NULL and UNIQUE
- UUID type for distributed system compatibility, avoid sequence conflicts

**Audit Trail Requirements** (All tables must have):
- `created_at`: When record was created (immutable, defaults to NOW())
- `created_by`: Who created the record (immutable, references tb_user.id)
- `updated_at`: When record was last modified (auto-updated on every change)
- `updated_by`: Who last modified the record (references tb_user.id)
- Purpose: Accountability, troubleshooting, compliance, security investigation

**Soft Delete Requirements**:
- `deleted_at`: Timestamp for soft delete (NULL = active record)
- Never physically delete records (preserve history for audit and compliance)
- Queries must filter WHERE deleted_at IS NULL to exclude deleted records
- Allows recovery and audit trail preservation
- Application can "undelete" by setting deleted_at back to NULL

### Data Quality Constraints

**Value Range Constraints**:
- Quantities: Must be positive (expected_qty >= 0, actual_qty >= 0)
- Variance: Can be negative (shortage) or positive (overage), no constraint
- Sequence numbers: Must be positive integers (sequence_no > 0)
- Dates: end_date must be >= start_date if not null (logical temporal consistency)

**Format Constraints**:
- Count stock number: Follow consistent format (e.g., "CNT-YYYY-NNNN", configurable per organization)
- UUIDs: Must be valid UUID v4 format
- Timestamps: Must be valid TIMESTAMPTZ with timezone awareness (UTC storage)
- ENUM values: Must be from defined enumeration (enforced by PostgreSQL ENUM type)

**Business Logic Constraints**:
- Count session completion requires at least one counted detail line (is_counted = true)
- Completed count sessions (doc_status = 'completed') are immutable (enforced by application)
- Variance calculation: variance_qty = actual_qty - expected_qty (maintained by triggers or application)
- Variance percentage: variance_pct = (variance_qty / expected_qty) * 100 when expected_qty > 0
- Status transitions follow strict workflow: pending → in_progress → completed, or pending/in_progress → cancelled
- Only 'pending' counts can be edited (application enforces)

---

## Database Triggers and Automation

### Automatic Timestamp Updates

**Updated At Trigger** (Count Stock and Count Stock Detail):
- **Purpose**: Automatically update `updated_at` timestamp on every record modification
- **Trigger Event**: BEFORE UPDATE on the tables
- **Behavior**: Sets `updated_at` to current timestamp (NOW()) before saving changes
- **Benefits**: Ensures accurate last-modified tracking without application logic, prevents stale timestamp bugs

**Created At Protection** (Count Stock and Count Stock Detail):
- **Purpose**: Prevent modification of `created_at` and `created_by` fields
- **Trigger Event**: BEFORE UPDATE on the tables
- **Behavior**: Raises error if attempt made to change creation timestamp or creator
- **Benefits**: Immutable audit trail, prevents tampering with creation history, data integrity

### Audit Logging

**Change Tracking Trigger** (Count Stock and Count Stock Detail):
- **Purpose**: Record all insert, update, and delete operations for comprehensive audit trail
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on the tables
- **Audit Table**: Separate audit log table (e.g., `audit_log`) stores change history
- **Captured Data**:
  - Operation type: INSERT (new count created), UPDATE (count modified), DELETE (count soft-deleted)
  - User who performed action: extracted from created_by or updated_by
  - Timestamp of change: when operation occurred
  - Old values: before change (for UPDATE, DELETE operations)
  - New values: after change (for INSERT, UPDATE operations)
  - Changed fields only: efficient storage, only store delta
  - Additional context: workflow_history JSONB for count-specific audit

**Use Cases**:
- Compliance and regulatory requirements: 7-year audit trail for inventory records
- Troubleshooting data issues: "Who changed this count from pending to completed?"
- User accountability: Track all user actions for performance review
- Security investigation: Detect unauthorized changes or suspicious patterns
- Data recovery: Restore previous values if incorrect changes made

### Data Validation Triggers

**Business Rule Validation** (Count Stock):
- **Purpose**: Enforce complex business rules that cannot be expressed with simple constraints
- **Trigger Event**: BEFORE INSERT OR UPDATE on tb_count_stock
- **Validation Examples**:
  - Verify location is active and accessible to user creating count
  - Check that only one active count exists per location at a time (BR-PCM-003)
  - Validate status transitions: prevent direct transition from pending to completed (must go through in_progress)
  - Ensure end_date is populated when transitioning to completed status
  - Verify at least one detail line exists before allowing completion (query tb_count_stock_detail)

**Business Rule Validation** (Count Stock Detail):
- **Purpose**: Enforce detail-level business rules
- **Trigger Event**: BEFORE INSERT OR UPDATE on tb_count_stock_detail
- **Validation Examples**:
  - Verify product exists and is active
  - Check that parent count session is not completed (completed counts are immutable)
  - Validate that product hasn't already been added to count session (prevent duplicates if enforced)
  - Ensure actual_qty is populated when is_counted = true
  - Verify unit_id matches product's default unit of measure

**Error Handling**:
- Trigger raises exception with meaningful error message (e.g., "Cannot add items to completed count session")
- Transaction is rolled back automatically
- Application receives clear error to display to user
- Error codes used for internationalization and specific handling

### Cascade Operations

**Soft Delete Cascade** (Count Stock → Count Stock Detail):
- **Purpose**: When parent count session is soft-deleted, automatically soft-delete all child detail lines
- **Trigger Event**: AFTER UPDATE on tb_count_stock (when deleted_at is set from NULL to timestamp)
- **Behavior**: Updates all child tb_count_stock_detail records to set their deleted_at to same timestamp as parent
- **Benefits**: Maintains referential integrity with soft deletes, prevents orphaned detail records, allows cascade undelete

**Status Propagation** (Not implemented in current design, potential future enhancement):
- **Purpose**: Update workflow_history JSON when status changes
- **Example**: When doc_status changes from 'pending' to 'in_progress', append entry to workflow_history
- **Trigger Event**: AFTER UPDATE on tb_count_stock (when doc_status changes)
- **Behavior**: Triggers business logic to append workflow transition record with timestamp, user, from_status, to_status

### Computed Fields

**Variance Calculation Trigger** (Count Stock Detail):
- **Purpose**: Automatically calculate variance fields when actual_qty or expected_qty change
- **Trigger Event**: BEFORE INSERT OR UPDATE on tb_count_stock_detail
- **Calculations**:
  - `variance_qty` = `actual_qty` - `expected_qty` (when both are not null)
  - `variance_pct` = (`variance_qty` / `expected_qty`) * 100 (when expected_qty > 0, else NULL)
- **Benefits**: Data consistency, reduces application complexity, prevents calculation errors, single source of truth

**Denormalized Field Population** (Count Stock):
- **Purpose**: Automatically populate denormalized fields from referenced entities
- **Trigger Event**: BEFORE INSERT OR UPDATE on tb_count_stock
- **Behavior**:
  - Populate `location_name` from tb_location.name when location_id set
  - Ensures location_name is current even if location renamed later (historical snapshot)
- **Benefits**: Performance optimization for reports, reduces joins, maintains readable values

**Denormalized Field Population** (Count Stock Detail):
- **Purpose**: Automatically populate product and unit denormalized fields
- **Trigger Event**: BEFORE INSERT OR UPDATE on tb_count_stock_detail
- **Behavior**:
  - Populate `product_code` from tb_product.code
  - Populate `product_name` from tb_product.name
  - Populate `unit_name` from tb_unit.name
- **Benefits**: Performance optimization, report-friendly data, reduces join complexity

### Notification Triggers

**Event Notification** (Count Stock):
- **Purpose**: Notify external systems or queue background jobs when significant events occur
- **Trigger Event**: AFTER INSERT OR UPDATE on tb_count_stock
- **Mechanism**: PostgreSQL NOTIFY/LISTEN or message queue integration (RabbitMQ, Redis)
- **Use Cases**:
  - Send notification when count completed and requires approval (high variance)
  - Queue email to supervisor when count session is started
  - Trigger workflow step transition in external workflow system
  - Update search index for count sessions
  - Invalidate cache for location count statistics
  - Notify inventory adjustment system when count completed (for adjustment posting)

**Example Notification Events**:
- `count_session_started`: When doc_status changes to 'in_progress'
- `count_session_completed`: When doc_status changes to 'completed'
- `high_variance_detected`: When count completed with variance exceeding threshold
- `adjustment_required`: When completed count needs inventory adjustment posting

---

## Performance Considerations

### Query Performance Targets

**Response Time Objectives**:
- **Simple Queries** (single count session by ID): < 10ms
- **List Queries** (filtered, sorted, paginated count sessions): < 100ms
- **Detail Queries** (count session with all detail lines, 50-100 lines): < 150ms
- **Complex Queries** (joins with product/location, aggregations): < 500ms
- **Reports and Analytics** (variance analysis, historical trends): < 5 seconds
- **Batch Operations** (bulk count creation, 1000 details): < 10 seconds

**Achieving Targets**:
- Proper indexing on frequently queried columns: doc_status, location_id, count_stock_id, product_id
- Query optimization using PostgreSQL EXPLAIN ANALYZE to validate execution plans
- Connection pooling to manage database connections efficiently (pool size: 10-50 connections)
- Read replicas for reporting and analytics (offload from primary database)
- Caching frequently accessed data in Redis/Memcached (location names, product catalog)
- Denormalized fields reduce join overhead (location_name, product_name, unit_name)

### Table Size Projections

**Count Stock Session (tb_count_stock)**:

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 200 | 2 MB | Initial adoption, 50 locations × 4 counts |
| Year 1 | 2,400 | 24 MB | Steady monthly growth, 200 sessions/month |
| Year 3 | 4,800 | 48 MB | With 12-month archival, 2 years active |
| Year 5 | 4,800 | 48 MB | Mature state with archival, stable size |

**Sizing Assumptions**:
- Average row size: ~10 KB (including indexes, JSONB workflow_history)
- Growth rate: ~200 count sessions/month (50 locations × 4 counts per location)
- Archival: Records older than 12 months moved to archive tables
- Retention: Archived data kept for 7 years, then purged for compliance

**Count Stock Detail (tb_count_stock_detail)**:

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 10,000 | 80 MB | 200 sessions × 50 lines average |
| Year 1 | 120,000 | 960 MB | Steady monthly growth |
| Year 3 | 240,000 | 1.9 GB | With 12-month archival, 2 years active |
| Year 5 | 240,000 | 1.9 GB | Mature state with archival, stable size |

**Sizing Assumptions**:
- Average row size: ~8 KB (including indexes, JSONB info)
- Growth rate: ~10,000 detail lines/month (200 sessions × 50 lines)
- Archival: Detail lines archived with parent count session
- Retention: 7 years archived, then purged

**Storage Planning**:
- Primary tables: Active 12 months of data
- Archive tables: 7 years of historical data (~84 months)
- Indexes: Approximately 50% of table size
- Total with overhead: Plan for 3x estimated size (include WAL, temp files, bloat)
- Archive storage: Cost-effective HDD or cloud storage tiers

### Optimization Techniques

**Query Optimization**:
- Use EXPLAIN ANALYZE to understand query execution plans and identify bottlenecks
- Identify slow queries from PostgreSQL slow query log (queries > 100ms)
- Add indexes for frequently accessed columns: location_id, doc_status, product_id, count_stock_id
- Optimize JOIN order: join smaller tables first, filter early
- Use appropriate WHERE clause filtering to reduce row scans
- Limit result sets with LIMIT and OFFSET for pagination (consider keyset pagination for large offsets)
- Use EXISTS instead of IN for subqueries when checking existence
- Avoid SELECT * - request only needed columns to reduce data transfer

**Indexing Best Practices**:
- Index foreign keys used in JOINs: count_stock_id, location_id, product_id
- Index columns in WHERE clauses with high selectivity: doc_status (pending, in_progress), location_id
- Index columns in ORDER BY: start_date, created_at for chronological sorting
- Use composite indexes for multi-column queries: (location_id, start_date), (doc_status, start_date)
- Create partial indexes for filtered queries: WHERE deleted_at IS NULL
- Monitor and remove unused indexes quarterly (check pg_stat_user_indexes)
- Each index adds ~10-15% write overhead, balance read vs write performance

**Partitioning** (for very large tables > 10M rows, future consideration):
- Partition tb_count_stock by date range: monthly or quarterly partitions based on start_date
- Partition tb_count_stock_detail by count_stock_id range (if parent partitioned)
- Benefits: Improves query performance on large datasets, simplifies archival and purging
- Considerations: Requires PostgreSQL 10+, adds complexity to schema management

**Connection Pooling**:
- Limit concurrent database connections to prevent exhaustion
- Reuse connections across requests for efficiency
- Typical pool size: 10-50 connections depending on load
- Use PgBouncer or built-in application connection pooling
- Monitor connection utilization and adjust pool size

**Caching Strategy**:
- Cache frequently accessed, rarely changed data in Redis or Memcached
- Cache location names, product catalog, user details (TTL: 15-60 minutes)
- Cache count session lists by location/status (TTL: 5 minutes)
- Cache at application level to reduce database load
- Invalidate cache on data changes using triggers or application logic
- Use cache-aside pattern: check cache first, fetch from DB on miss, populate cache

**Read Replicas**:
- Offload reporting and analytics queries to read replicas
- Reduce load on primary database for transactional workload
- Eventually consistent reads acceptable for reports (lag: seconds to minutes)
- Failover capability for high availability
- Typical setup: 1 primary + 1-2 read replicas

**Batch Operations**:
- Group multiple INSERTs into single transaction for detail lines
- Use bulk UPDATE where possible instead of row-by-row
- Process large datasets in chunks (e.g., 500-1000 rows per batch)
- Avoid row-by-row processing in application (N+1 query problem)
- Use COPY command for bulk data loading

**Denormalization Benefits**:
- location_name, product_name, unit_name fields reduce JOIN overhead
- Query count sessions without joining to tb_location for display purposes
- Trade-off: increased storage, potential data staleness vs. performance gain
- Update triggers maintain consistency when referenced data changes

---

## Data Archival Strategy

### Archival Policy

**Retention Periods**:
- **Active Data**: Last 12 months in primary tables (tb_count_stock, tb_count_stock_detail)
- **Archived Data**: 1-7 years in archive tables (tb_count_stock_archive, tb_count_stock_detail_archive)
- **Purge After**: 7 years (compliance requirement for financial and inventory audit records)

**Archival Criteria**:
- Count sessions older than 12 months based on start_date
- Completed or cancelled status only (doc_status IN ('completed', 'cancelled', 'voided'))
- No active dependencies or references from other systems
- Cascade archive: When count session archived, all detail lines also archived

**Archival Frequency**:
- Monthly archival process (scheduled job on first Sunday of each month at 2 AM)
- Off-peak hours to minimize impact on operations
- Incremental archival: only new records meeting criteria since last run

### Archive Table Structure

**Archive Tables**:
- Identical schema to primary table (created using CREATE TABLE ... LIKE ... INCLUDING ALL)
- Additional `archived_at` TIMESTAMPTZ field to track when record was archived
- Additional `archived_by` UUID field to track who initiated archival
- Same indexes for query performance on archived data
- Separate tablespace for cost-effective storage (HDD or cold cloud storage)

**Archive Table Naming**:
- Pattern: `{primary_table}_archive`
- Examples: `tb_count_stock_archive`, `tb_count_stock_detail_archive`

**Data Location**:
- Primary tables: High-performance SSD storage for fast access
- Archive tables: Cost-effective HDD storage or cloud cold storage (S3 Glacier, Azure Cool Blob)
- Compressed storage for archive data (PostgreSQL table compression or external compression)

### Archival Process

**Archival Workflow** (Monthly Scheduled Job):
1. Identify count sessions meeting archival criteria: start_date < NOW() - 12 months AND doc_status IN ('completed', 'cancelled', 'voided')
2. Begin transaction for atomicity
3. Copy identified count session records to tb_count_stock_archive with archived_at = NOW()
4. Copy all related detail lines to tb_count_stock_detail_archive (JOIN on count_stock_id)
5. Verify row counts match: archived sessions = archived detail line groups
6. Soft delete records from primary tables (set deleted_at = NOW()) - preserves IDs for referential integrity
7. Update archival metadata table with job run statistics
8. Commit transaction
9. VACUUM primary tables to reclaim space
10. Log archival operation with counts and any errors

**Transaction Safety**:
- Entire archival process wrapped in single transaction for atomicity
- Rollback on any error to prevent data loss or inconsistency
- Verify row counts before and after: records archived = records deleted
- Maintain referential integrity throughout process
- Archival is reversible: can "unarchive" by copying back and clearing deleted_at

**Archival Verification**:
- Compare row counts: archived count sessions vs. deleted count sessions
- Verify no data loss: all fields copied correctly
- Check archive table integrity: foreign keys, constraints, indexes intact
- Test archive data accessibility: run sample queries on archive tables
- Alert on verification failures for manual review

### Archive Data Access

**Querying Archive Data**:
- Create views combining primary and archive tables using UNION ALL
- Example view: `v_count_stock_all` = SELECT * FROM tb_count_stock WHERE deleted_at IS NULL UNION ALL SELECT * FROM tb_count_stock_archive
- Use UNION ALL for combined queries (no duplicate elimination needed)
- Partition by archive status for query optimization
- Application can query view for seamless access to all data (active + archived)

**Archive Data Retrieval**:
- Slower query performance acceptable for archived data (not real-time operations)
- Read-only access for most users (only view archived counts)
- Admin-only restore capabilities for data recovery
- Export to external systems for long-term cold storage or compliance archives

**Data Restore** (Unarchive):
- Copy records from archive tables back to primary tables (if needed for active use)
- Clear deleted_at to NULL to make records active again
- Refresh indexes and statistics on primary tables
- Verify data consistency after restore
- Use case: Reopen old count session for corrections or audit investigation

---

## Security Considerations

### Row-Level Security (RLS)

**Purpose**: Control which count sessions and detail lines users can see and modify based on their role, department, and location permissions

**Policy Types**:
- **Read Policies**: Control which count session rows users can SELECT
- **Write Policies**: Control which rows users can INSERT/UPDATE/DELETE
- **Location Isolation**: Users only see counts for locations they have access to
- **Department Isolation**: Users only see counts for their department or subordinate departments
- **Role-Based**: Different policies for Storekeeper, Supervisor, Manager roles

**Example Policies**:

**Location Isolation**:
- Storekeepers can only access counts for their assigned location
- Policy: `location_id IN (SELECT location_id FROM user_location_assignments WHERE user_id = current_user_id)`
- Exception: Managers and regional supervisors can access multiple locations

**Department Isolation**:
- Users can only access counts from their own department or child departments
- Policy: `department_id IN (SELECT department_id FROM user_accessible_departments WHERE user_id = current_user_id)`
- Exception: Corporate managers and inventory directors can access all departments

**Creator Access**:
- Storekeepers can see counts they created
- Policy: `created_by = current_user_id OR user_has_supervisor_role()`
- Exception: Supervisors and managers can see all counts for their locations

**Status-Based Access**:
- Regular storekeepers can only edit pending counts
- Policy: `doc_status = 'pending' AND created_by = current_user_id`
- Exception: Supervisors can edit in_progress counts, managers can void completed counts

**Admin Override**:
- System administrators and inventory directors bypass all RLS policies
- Policy: `USING (true)` for admin and inventory_director roles
- Full system access for troubleshooting, compliance, and audit purposes

### Column-Level Security

**Purpose**: Hide sensitive columns from unauthorized users, protect financial data

**Sensitive Data Examples** (Count Stock):
- Variance values and percentages (financial impact)
- Workflow history (contains approval decisions and reasons)
- Internal notes (may contain sensitive observations)
- JSONB info field (may contain confidential metadata)

**Sensitive Data Examples** (Count Stock Detail):
- Variance quantities and percentages (discrepancy details)
- Adjustment transaction references (financial integration)
- Expected quantities (reveals inventory levels)
- Notes and info fields (may contain explanations of variances)

**Access Control**:
- Grant SELECT on specific columns only for restricted roles
- Revoke access to sensitive columns from basic storekeepers
- Use views with filtered columns for role-specific access
- Full access for managers, supervisors, and auditors

**Example Permissions**:
```
Grant Storekeeper (read-only) SELECT on:
  count_stock_no, start_date, location_name, doc_status, description

Revoke from Storekeeper:
  variance aggregates in info JSONB, workflow_history, internal notes

Grant Supervisor full SELECT on all columns

Grant Manager full access including UPDATE/DELETE
```

### Data Encryption

**Encryption At Rest**:
- PostgreSQL database-level encryption enabled on storage volumes
- Transparent to application (automatic encrypt/decrypt by database engine)
- Encryption key management by cloud provider KMS or Hardware Security Module (HSM)
- Meets compliance requirements: PCI-DSS (if storing payment-related data), SOC 2, ISO 27001
- All count data, including historical and archived records, encrypted at rest

**Encryption In Transit**:
- SSL/TLS for all database connections (TLS 1.2 or higher)
- Certificate-based authentication for application connections
- Encrypted connection strings stored in environment variables or secrets manager
- No plaintext data transmission over network

**Column-Level Encryption** (if extra sensitive data added in future):
- Encrypt specific columns using pgcrypto extension
- Application manages encryption keys (separate from database)
- Encrypt before INSERT, decrypt after SELECT
- Use cases: If storing employee personal data, proprietary product formulas, or other highly sensitive information in notes/info fields

**Encryption Key Management**:
- Separate encryption keys from encrypted data (never store together)
- Regular key rotation policy (quarterly or semi-annually)
- Secure key storage in HSM or cloud Key Management Service (AWS KMS, Azure Key Vault)
- Multi-factor authentication for key access and rotation operations

### Access Control

**Database Users and Roles**:
- **app_read_only**: SELECT only on count tables (for reporting and analytics)
- **app_read_write**: SELECT, INSERT, UPDATE on count tables (no DELETE for safety)
- **app_admin**: Full access including DELETE and schema modifications
- **reporting_user**: SELECT on views and archive tables (for BI tools and reports)
- **archival_job**: Special role for archival process with limited scope

**Authentication**:
- Strong password policy: minimum 12 characters, complexity requirements
- Multi-factor authentication (MFA) for admin and privileged access
- Service account credentials for application connections (rotated quarterly)
- Individual user accounts for direct database access (auditable)
- Rotate credentials regularly: service accounts quarterly, user accounts on role change or termination

**Authorization**:
- Principle of least privilege: grant minimum necessary permissions
- Grant permissions at role level, assign users to roles
- Regular access reviews and audits (quarterly)
- Revoke access immediately when user role changes or leaves organization
- Separate roles for production and non-production environments

**Audit Trail**:
- Log all database access attempts (successful and failed)
- Track failed login attempts for security monitoring
- Monitor suspicious activity: excessive queries, after-hours access, bulk exports
- Alert on security violations: unauthorized access attempts, privilege escalation
- Integrate database audit logs with SIEM system for centralized monitoring

---

## Backup and Recovery

### Backup Strategy

**Full Backups**:
- **Frequency**: Daily at 2 AM UTC (off-peak hours for hospitality operations)
- **Retention**: 30 days online (fast restore), 90 days in cold storage (compliance)
- **Method**: PostgreSQL pg_dump or database snapshot (cloud provider snapshot)
- **Location**: Off-site cloud storage in separate region (disaster recovery)
- **Verification**: Automated restore test weekly to verify backup integrity

**Incremental Backups**:
- **Frequency**: Every 4 hours (6 times per day)
- **Retention**: 7 days
- **Method**: Write-Ahead Log (WAL) archiving to S3/Azure Blob
- **Purpose**: Minimize data loss window (Recovery Point Objective: 4 hours)

**Continuous Archiving**:
- **Method**: WAL streaming to backup server or cloud storage
- **Purpose**: Near-zero Recovery Point Objective (RPO < 5 minutes)
- **Benefit**: Point-in-time recovery capability to any second within retention period

**Backup Verification**:
- Weekly restore test to staging environment to verify backup integrity
- Automated backup health checks (file size, checksum validation)
- Alert on backup failures immediately via PagerDuty/OpsGenie
- Document restore procedures and maintain runbooks

### Backup Contents

**Included in Backup**:
- All database tables (structure and data): tb_count_stock, tb_count_stock_detail, reference tables
- Indexes and constraints
- Views and stored procedures/functions
- User roles and permissions
- Database configuration (postgresql.conf, pg_hba.conf)
- ENUM type definitions (enum_count_stock_status, enum_count_stock_type)

**Excluded from Backup** (stored separately):
- Large binary files: photos attached to count records stored in object storage (S3, Azure Blob)
- Temporary tables
- Cache tables
- Log tables (archived separately to log aggregation system)

### Recovery Procedures

**Point-in-Time Recovery** (PITR):
- Restore from latest full backup
- Replay WAL logs to specific timestamp (e.g., "2024-01-15 14:30:00 UTC")
- Use case: Recover from accidental data deletion or corruption
- Recovery Time Objective (RTO): < 4 hours for full database
- Process: Stop database, restore base backup, replay WAL to target time, verify data, restart database

**Full Database Restore**:
- Restore entire database from latest backup
- Use case: Complete database corruption, hardware failure, ransomware attack
- RTO: < 8 hours for full production database
- Process: Provision new database instance, restore from backup, verify integrity, update application connections, test thoroughly

**Table-Level Recovery**:
- Restore specific table (tb_count_stock or tb_count_stock_detail) from backup to staging environment
- Copy needed data back to production selectively
- Use case: Recover accidentally deleted count sessions or corrupted detail lines
- RTO: < 2 hours for single table
- Process: Restore to staging, identify target records, export as SQL, import to production, verify

**Disaster Recovery**:
- Failover to backup region/server (hot standby or warm standby)
- Automated failover triggers for critical outages
- Use case: Primary datacenter failure, prolonged cloud region outage
- RTO: < 1 hour for automatic failover
- Process: Detect primary failure, promote standby to primary, update DNS/load balancer, verify data sync, resume operations

### Backup Retention Policy

**Retention Schedule**:
- **Daily backups**: Keep for 30 days online (fast restore)
- **Weekly backups**: Keep for 90 days online (13 weeks)
- **Monthly backups**: Keep for 1 year (12 months) in cold storage
- **Yearly backups**: Keep for 7 years (compliance requirement) in archive storage

**Storage Optimization**:
- Compress old backups using gzip or cloud-native compression (reduce storage costs)
- Move to cheaper storage tiers over time: Hot → Cool → Cold → Archive
- Delete expired backups automatically using lifecycle policies
- Monitor storage costs and optimize retention based on actual restore needs vs. cost

---

## Data Migration

### Version 1.0.0 - Initial Schema

**Migration Metadata**:
- **Migration File**: `001_create_count_stock_tables.sql` (descriptive, not actual SQL)
- **Date**: 2025-01-11
- **Author**: Inventory Management Team
- **Purpose**: Initial database schema creation for Physical Count Management module

**Migration Steps** (Description):
1. Create tb_count_stock table with all columns: id, count_stock_no, count_stock_type, start_date, end_date, location_id, location_name, department_id, doc_status, description, note, workflow fields, info JSONB, audit fields
2. Create tb_count_stock_detail table with all columns: id, count_stock_id, sequence_no, product_id, product fields, unit fields, quantity fields (expected, actual, variance), status flags, adjustment fields, note, info JSONB, audit fields
3. Create primary key constraints on id columns for both tables
4. Create foreign key constraints: count_stock_detail.count_stock_id → tb_count_stock.id (CASCADE delete), count_stock.location_id → tb_location.id (RESTRICT), count_stock_detail.product_id → tb_product.id (RESTRICT)
5. Create unique constraint on tb_count_stock.count_stock_no (partial, WHERE deleted_at IS NULL)
6. Create check constraints: doc_status values, count_stock_type values, quantity >= 0, end_date >= start_date
7. Create indexes: business key (count_stock_no unique), foreign keys (count_stock_id, location_id, product_id), status (doc_status, count_stock_type), composite (location_id + start_date, count_stock_id + sequence_no), JSONB (info GIN)
8. Create audit triggers: updated_at auto-update, created_at protection, change tracking to audit_log table
9. Create business logic triggers: variance calculation, denormalized field population, status transition validation
10. Create ENUM types: enum_count_stock_status (pending, in_progress, completed, cancelled, voided), enum_count_stock_type (physical, spot), enum_doc_status (if not already exists)
11. Grant permissions to database roles: app_read_write (SELECT, INSERT, UPDATE), app_admin (full access), reporting_user (SELECT only)
12. Insert seed/reference data: none required (no lookup tables)

**Data Included**:
- Table structure and constraints
- ENUM type definitions
- Indexes for performance
- Triggers for automation
- No seed data required (count sessions created by users)

**Verification**:
- Verify tables exist: \dt tb_count_stock*
- Test constraints: attempt to insert invalid status, verify rejection
- Validate triggers: insert record, check updated_at auto-populated
- Confirm indexes created: \d+ tb_count_stock, \d+ tb_count_stock_detail
- Test foreign key cascade: insert count session, insert details, delete session, verify details deleted

**Rollback Plan**:
- Drop triggers: updated_at trigger, audit trigger, validation triggers
- Drop indexes: all non-primary key indexes
- Drop foreign key constraints
- Drop tables: tb_count_stock_detail (child first), tb_count_stock (parent second)
- Drop ENUM types: enum_count_stock_status, enum_count_stock_type (if unused elsewhere)
- Revoke granted permissions
- Verify clean rollback: no residual objects remain

---

## Data Quality

### Data Quality Dimensions

**Completeness**:
- All required fields populated: count_stock_no, location_id, product_id, created_by, etc.
- All count sessions have at least one detail line before completion
- No NULL in NOT NULL columns (enforced by database)
- Foreign key references valid (no orphaned records)
- Measured: % of count sessions with all required fields complete (target: 100%)

**Accuracy**:
- Denormalized fields (location_name, product_name) match source tables
- Variance calculations correct: variance_qty = actual_qty - expected_qty
- Variance percentages accurate: variance_pct = (variance_qty / expected_qty) * 100
- Status transitions follow workflow rules
- Measured: % of records passing validation rules (target: 99.9%)

**Consistency**:
- Count detail lines reference valid parent count sessions
- Product references in details match product catalog
- Location references valid and active
- Audit timestamps logical: created_at <= updated_at
- Measured: % of records passing consistency checks (target: 100%)

**Validity**:
- Status values from allowed ENUM list (enforced by database)
- Quantities non-negative (expected_qty >= 0, actual_qty >= 0)
- Dates reasonable: start_date not far in future, end_date >= start_date
- UUIDs valid format
- Measured: % of records passing validation rules (target: 100%)

**Timeliness**:
- Count sessions started and completed within reasonable timeframe (< 1 day for physical count)
- Audit timestamps reflect actual changes (updated_at within seconds of modification)
- Expected quantities retrieved from current inventory transaction data
- Measured: Average lag between count start and completion (target: < 8 hours for physical)

**Uniqueness**:
- No duplicate count_stock_no among active records (enforced by unique constraint)
- Products typically appear once per count session (not database-enforced, application logic)
- No duplicate detail lines with same count_stock_id + product_id (application validation)
- Measured: % of records with unique business keys (target: 100%)

### Data Quality Checks

**Automated Quality Checks** (Run daily via scheduled job):

**Check for Orphaned Detail Records**:
```
Purpose: Find detail lines with non-existent parent count session
Query Logic: SELECT from tb_count_stock_detail LEFT JOIN tb_count_stock WHERE tb_count_stock.id IS NULL
Expected: 0 orphaned records (foreign key constraint should prevent this)
Action: Investigate data corruption, restore from backup if found
```

**Check for Invalid Status Values**:
```
Purpose: Ensure status values are from ENUM list (should be impossible due to ENUM constraint)
Query Logic: Not needed (ENUM type enforces validity)
Expected: N/A (database guarantees validity)
Action: None (trust database constraint)
```

**Check for Counts Stuck In Progress**:
```
Purpose: Find count sessions stuck in 'in_progress' status for too long
Query Logic: SELECT WHERE doc_status = 'in_progress' AND start_date < NOW() - INTERVAL '2 days'
Expected: 0 stuck counts (physical counts should complete within 1 day)
Action: Alert supervisor, investigate abandoned counts, escalate or cancel
```

**Check for Completed Counts Without End Date**:
```
Purpose: Verify completed counts have end_date populated
Query Logic: SELECT WHERE doc_status = 'completed' AND end_date IS NULL
Expected: 0 records (end_date should be set when completing)
Action: Update end_date = updated_at, investigate trigger failure
```

**Check for Negative Quantities**:
```
Purpose: Ensure no negative expected or actual quantities (check constraint should prevent)
Query Logic: SELECT FROM tb_count_stock_detail WHERE expected_qty < 0 OR actual_qty < 0
Expected: 0 negative quantities (check constraint enforces)
Action: Should never happen, investigate data corruption if found
```

**Check for Incorrect Variance Calculations**:
```
Purpose: Verify variance_qty matches calculated variance
Query Logic: SELECT WHERE variance_qty != (actual_qty - expected_qty)
Expected: 0 mismatches (trigger calculates correctly)
Action: Recalculate variances, investigate trigger failure
```

**Check for High Variance Items**:
```
Purpose: Identify items with variance exceeding threshold for review
Query Logic: SELECT WHERE ABS(variance_pct) > 5.0 AND doc_status = 'completed'
Expected: Review and investigate high-variance items
Action: Generate report for management review, investigate root causes
```

**Check for Uncounted Items in Completed Counts**:
```
Purpose: Verify completed counts have all items counted
Query Logic: SELECT FROM tb_count_stock WHERE doc_status = 'completed' AND EXISTS (SELECT FROM tb_count_stock_detail WHERE count_stock_id = id AND is_counted = false)
Expected: 0 records (completed counts should have all items counted)
Action: Investigate completion logic, prevent premature completion
```

### Data Quality Monitoring

**Quality Metrics Dashboard**:
- Completeness score by count session: % of counts with all required data
- Accuracy score: % of variance calculations matching expected results
- Daily quality trend: Track quality metrics over time, identify degradation
- Top quality issues: Most common validation failures and root causes

**Alerting**:
- Alert when quality score drops below 95% (critical threshold)
- Alert on quality checks failing: orphaned records, incorrect calculations, stuck counts
- Alert on data volume anomalies: sudden spike or drop in count creation rate
- Alert on unusual data patterns: excessive high-variance counts, abnormal completion times

**Reporting**:
- Weekly data quality report: summary of quality metrics, issues identified, actions taken
- Monthly quality trends: long-term quality evolution, improvement initiatives
- Issue resolution tracking: log quality issues, track resolution time, identify patterns
- Root cause analysis: investigate recurring quality problems, implement preventive measures

---

## Testing Data

### Test Data Requirements

**Test Environments**:
- **Development**: Full synthetic test data (count sessions with realistic variance patterns)
- **Staging**: Copy of production data (sanitized, anonymized)
- **Testing**: Mix of synthetic and sanitized data for comprehensive testing
- **Demo**: Curated realistic data for customer demonstrations (positive examples)

**Data Sanitization** (for production data copies to staging/testing):
- Remove or mask user personal information (names, emails, IDs)
- Anonymize location names (replace with generic "Location A", "Location B")
- Replace real monetary variance amounts with randomized values
- Mask product names (replace with generic "Product A", "Product B") if proprietary
- Preserve data relationships and integrity (maintain parent-child links, foreign keys)
- Maintain statistical properties (variance distributions, count frequencies)

### Test Data Generation

**Synthetic Data Creation**:

**Approach 1: Manual Test Records** (for unit testing, feature development):
- Create specific test scenarios: zero variance, high variance, multi-day counts
- Well-known test data for predictable testing
- Examples: count session "TEST-CNT-001" with specific variance pattern
- Use for: Unit tests, integration tests, feature verification

**Approach 2: Generated Test Data** (for performance and load testing):
- Use SQL generate_series() function to create bulk data
- Generate 1000+ count sessions with realistic date distribution
- Randomized values within valid ranges
- Automated test data creation scripts
- Use for: Load testing, performance benchmarking, UI stress testing

**Example: Generate 100 Test Count Sessions** (conceptual description):
```
Logic:
- Generate series from 1 to 100
- Business key: 'TEST-CNT-' + padded series number (TEST-CNT-0001 to TEST-CNT-0100)
- Count type: Randomly 'physical' (80%) or 'spot' (20%)
- Start date: Random date within last 6 months
- End date: start_date + random interval (4 hours to 12 hours)
- Location: Random selection from test locations
- Status: Randomly 'pending' (10%), 'in_progress' (5%), 'completed' (85%)
- Created by: Random test user
- Department: Random test department

For each count session, generate 30-80 detail lines:
- Product: Random selection from test products
- Expected qty: Random value between 10 and 500
- Actual qty: expected_qty + random variance (-20% to +20%)
- Variance qty/pct: Calculated from expected and actual
- Is counted: true (95% of lines), false (5% for in-progress counts)
```

**Realistic Test Data**:
- Use realistic location names: "Test Main Kitchen", "Test Central Warehouse", "Test Bar Storage"
- Realistic products: "Test Chicken Breast", "Test Tomato Sauce", "Test Olive Oil"
- Realistic amounts: quantities from 10-500 units, not just 1, 2, 3
- Realistic dates: distributed over time, not all same date
- Realistic distributions: status mix (85% completed, 10% pending, 5% in-progress), variance mix (70% low, 20% medium, 10% high)

### Test Scenarios

**Volume Testing**:
- Insert 10,000+ count sessions with 500,000+ detail lines
- Test pagination with large datasets (1000 records per page)
- Verify query performance under load (response time targets)
- Test batch operations (bulk count creation, mass status updates)

**Concurrency Testing**:
- Simultaneous INSERT from multiple users creating counts in parallel
- Concurrent UPDATE to same count session (e.g., multiple users counting different items)
- Test locking and transaction isolation (prevent race conditions)
- Verify no data corruption, no lost updates

**Edge Case Testing**:
- Null values in optional fields (note, description, department_id)
- Minimum and maximum quantities (0, 999999.99)
- Boundary conditions: exactly at variance thresholds (5.0%, 10.0%)
- Empty strings vs. NULL in VARCHAR fields
- Special characters in text fields (Unicode, quotes, newlines)
- Very long count sessions (started but not completed for days)

**Referential Integrity Testing**:
- Test CASCADE delete: delete count session, verify all details deleted
- Test RESTRICT: attempt to delete location with counts, verify rejection
- Test foreign key enforcement: insert detail with invalid count_stock_id, verify rejection
- Verify orphan prevention: no detail lines without parent count session

**Constraint Testing**:
- Test unique constraint: attempt to insert duplicate count_stock_no, verify rejection
- Test check constraints: insert negative quantity, verify rejection
- Test NOT NULL requirements: insert without required fields, verify rejection
- Test ENUM constraints: insert invalid status value, verify rejection
- Test default value application: insert without default fields, verify defaults applied

**Data Quality Testing**:
- Test validation triggers: attempt invalid status transition, verify rejection
- Test variance calculation triggers: insert actual/expected qty, verify variance calculated
- Test denormalized field population: insert with location_id, verify location_name populated
- Test status workflow enforcement: attempt to skip workflow steps, verify rejection

### Test Data Cleanup

**Cleanup Strategy**:
- Mark test data with identifiable pattern: count_stock_no starts with 'TEST-'
- Automated cleanup scripts run weekly to remove old test data
- Separate test data tenant/department: all test counts under "Test Department"
- Regular cleanup of test data older than 30 days

**Cleanup Query Example** (conceptual description):
```
Delete test data:
- WHERE count_stock_no LIKE 'TEST-%'
- WHERE department_id = (UUID of "Test Department")
- WHERE created_by IN (list of test user UUIDs)
- WHERE location_id IN (list of test location UUIDs)

Process:
- Identify test count sessions matching criteria
- Delete all detail lines for test sessions (CASCADE or manual)
- Delete test count sessions
- Verify deletion counts match expected
- Log cleanup operation
```

---

## Glossary

**Database Terms**:
- **Primary Key**: Unique identifier for each record, cannot be null or duplicate. In count tables, this is the `id` UUID field.
- **Foreign Key**: Column that references the primary key of another table, establishes relationships. Examples: count_stock_id, location_id, product_id.
- **Index**: Database structure that improves query performance by enabling fast lookups. Examples: indexes on doc_status, location_id, count_stock_id.
- **Constraint**: Rule enforced by the database to maintain data integrity. Examples: NOT NULL, UNIQUE, CHECK, FOREIGN KEY constraints.
- **Cascade**: Automatic propagation of changes or deletes to related records. Example: deleting count session cascades delete to all detail lines.
- **Transaction**: Group of database operations that succeed or fail together (atomic). Example: archival process wrapped in transaction.
- **ACID**: Atomicity, Consistency, Isolation, Durability - database transaction properties ensuring data integrity.

**PostgreSQL-Specific Terms**:
- **UUID**: Universally Unique Identifier, 128-bit value used for primary keys. Example: 550e8400-e29b-41d4-a716-446655440001.
- **TIMESTAMPTZ**: Timestamp with timezone, stores UTC time with timezone offset. Example: 2024-01-15T08:00:00Z.
- **JSONB**: Binary JSON storage format, indexed and queryable. Used for info and workflow_history fields.
- **GIN**: Generalized Inverted Index, used for JSONB and full-text search. Applied to info JSONB columns.
- **B-tree**: Default index type for efficient equality and range queries. Used for most indexes.
- **Partial Index**: Index with WHERE clause, indexes only subset of rows. Example: unique index on count_stock_no WHERE deleted_at IS NULL.
- **ENUM**: Enumerated type with predefined allowed values. Examples: enum_count_stock_status, enum_count_stock_type.
- **WAL**: Write-Ahead Log, transaction log used for crash recovery and replication. Used in backup strategy.

**Application Terms**:
- **Soft Delete**: Marking record as deleted (deleted_at timestamp) instead of removing it. Preserves audit trail and allows recovery.
- **Audit Trail**: Historical record of who changed what and when. Implemented via created_at, created_by, updated_at, updated_by, workflow_history.
- **Backfill**: Updating existing records with new data after adding a column. Example: populating expected_qty from closing balance.
- **Migration**: Script to change database schema from one version to another. Example: 001_create_count_stock_tables.sql.
- **Seed Data**: Initial reference data inserted during setup. Not used in count tables (user-generated data).
- **Orphan Record**: Child record with non-existent parent (referential integrity violation). Prevented by foreign key constraints.

**Business Terms (Physical Count Management)**:
- **Physical Count**: Comprehensive full inventory count of all products at a location. Typically scheduled monthly or quarterly.
- **Spot Check**: Quick verification count of specific high-value or high-risk products. Typically unscheduled or ad-hoc.
- **Count Session**: A single counting event with header information, containing multiple line items. Represented by tb_count_stock record.
- **Count Detail Line**: Individual product counted within a session. Represented by tb_count_stock_detail record.
- **Expected Quantity**: System's theoretical on-hand quantity from inventory transaction closing balance. Basis for variance calculation.
- **Actual Quantity**: Physically counted quantity verified by storekeeper during count process.
- **Variance**: Discrepancy between expected and actual quantities. Can be shortage (negative) or overage (positive).
- **Variance Threshold**: Percentage threshold (e.g., 5%) above which variance is considered high and requires investigation.
- **Adjustment Posting**: Creating inventory transaction to correct system quantity to match physical count result.
- **Workflow Stage**: Current step in count lifecycle (pending, in_progress, completed, cancelled, voided).
- **Storekeeper**: User role responsible for performing physical counts and entering data.
- **Supervisor**: User role responsible for reviewing and approving count results, especially high-variance counts.
- **Manager**: User role with full permissions including voiding completed counts and managing locations.

**Hospitality-Specific Terms**:
- **Location**: Physical storage area where inventory is kept. Examples: Main Kitchen, Central Warehouse, Bar Storage, Walk-in Cooler.
- **Department**: Organizational unit owning inventory. Examples: Food & Beverage, Housekeeping, Maintenance, Front Office.
- **Counter**: Person performing the physical counting (typically storekeeper or inventory clerk).
- **Closing Balance**: Theoretical on-hand quantity at end of day from inventory transaction ledger.

---

## Related Documents

- [Business Requirements](./BR-physical-count-management.md) - User stories and functional requirements
- [Technical Specification](./TS-physical-count-management.md) - System architecture and component design
- [Use Cases](./UC-physical-count-management.md) - Detailed user workflows and scenarios
- [Flow Diagrams](./FD-physical-count-management.md) - Visual workflow and process diagrams
- [Validations](./VAL-physical-count-management.md) - Data validation rules and error handling

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Database Architect | | | |
| Technical Lead | | | |
| Security Officer | | | |
| Operations Manager | | | |

---

**Document End**

> 📝 **Note to Authors**:
> - Extract data definitions from actual Prisma schema
> - Use descriptive text instead of SQL CREATE statements
> - Focus on business meaning and relationships
> - Include realistic sample data examples
> - Document constraints and rules in plain language
> - Describe indexing strategy conceptually
> - Explain cascade behaviors and referential integrity
> - No code, no SQL queries - only text descriptions
> - Keep examples realistic and hospitality-focused
> - Update when schema changes based on code
> - Review with database team and stakeholders
