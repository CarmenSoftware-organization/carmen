# Data Definition: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version |

---

## Overview

This document defines the data structures for the Spot Check sub-module. **IMPORTANT**: Spot Check shares the same database tables (`tb_count_stock` and `tb_count_stock_detail`) with Physical Count Management, differentiated by the `count_stock_type` field value ('spot' vs 'physical').

**Key Data Characteristics**:
- **Type Discriminator**: `count_stock_type = 'spot'` identifies spot check records
- **Shared Schema**: Same table structure as Physical Count Management
- **Business Rules**: Different workflows and validation rules despite shared schema
- **Data Isolation**: No technical isolation; logical separation via type field

**⚠️ Note**: This document provides text descriptions only. No SQL code is included.

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Use Cases](./UC-spot-check.md)
- [Technical Specification](./TS-spot-check.md)
- [Flow Diagrams](./FD-spot-check.md)
- [Validations](./VAL-spot-check.md)
- [Physical Count Management Data Definition](../physical-count-management/DD-physical-count-management.md) - Shared schema reference

---

## Entity Descriptions

### Spot Check Session (tb_count_stock)

**Table Name**: `tb_count_stock`
**Shared With**: Physical Count Management (differentiated by `count_stock_type`)

**Purpose**: Represents a spot check verification session for selected products at a specific location. Records the session metadata, workflow state, and summary information.

**Scope**: One record per spot check session. Typically 2-10 spot checks per location per week.

**Lifecycle**:
1. **Creation**: Record created when user initiates spot check with location selection
2. **Product Addition**: Status remains 'pending' while products are added
3. **Active Counting**: Status changes to 'in_progress' when counting begins
4. **Completion**: Status changes to 'completed' when all items counted and adjustments posted
5. **Cancellation**: Status changes to 'cancelled' if spot check abandoned
6. **Retention**: Records retained indefinitely with soft delete (deleted_at)

**Record Volume Estimates**:
- Active records: ~50-100 per location (current month)
- Monthly growth: ~20-30 per location
- Annual total: ~240-360 per location
- 5-year projection: ~1,200-1,800 records per location

### Spot Check Detail (tb_count_stock_detail)

**Table Name**: `tb_count_stock_detail`
**Shared With**: Physical Count Management

**Purpose**: Represents individual product line items within a spot check session. Records expected quantity, actual counted quantity, and calculated variance for each product.

**Scope**: Multiple records per spot check session (1 to 50 products per spot check, typically 5-15).

**Lifecycle**:
1. **Creation**: Record created when product added to spot check
2. **Expected Quantity**: Populated from Inventory Transaction System integration
3. **Counting**: `actual_qty` entered by storekeeper, `variance_qty` and `variance_pct` calculated
4. **Completion**: `is_counted` set to true, `adjustment_posted` set to true after adjustment
5. **Retention**: Retained with parent spot check session

**Record Volume Estimates**:
- Details per spot check: 5-15 products (average 10)
- Active details: ~500-1,500 per location (current month)
- Monthly growth: ~200-300 per location
- Annual total: ~2,400-3,600 per location
- 5-year projection: ~12,000-18,000 details per location

---

## Field Definitions

### tb_count_stock (Spot Check Session)

For complete field definitions, see [Physical Count Management DD](../physical-count-management/DD-physical-count-management.md). Key spot-check-specific notes below:

#### count_stock_type
- **Data Type**: enum_count_stock_type
- **Allowed Values**: 'physical', 'spot'
- **Required**: Yes
- **Default**: 'physical'
- **For Spot Checks**: Always 'spot'
- **Purpose**: Discriminates spot checks from physical counts in shared table
- **Indexed**: Yes (for filtering queries)

#### count_stock_no
- **Format for Spot Checks**: SPOT-YYYY-NNNNNN
- **Example**: SPOT-2024-000015
- **Unique**: Yes (across both physical counts and spot checks)
- **Generated**: Auto-generated on creation

#### doc_status
- **Spot Check Workflow**: pending → in_progress → completed OR cancelled
- **Differences from Physical Count**:
  - Spot checks can have multiple active per location (no one-active-per-location rule)
  - Quicker transitions (typically completed within same day)
  - No 'voided' status (only 'cancelled' available)

#### info JSON Field
- **Spot Check Specific Fields**:
  - total_items: Number of products in spot check
  - items_counted: Number of products actually counted
  - total_variance_value: Monetary impact of all variances
  - high_variance_items: Count of items exceeding variance threshold
  - supervisor_approved: Boolean indicating all high variance items approved
  - approved_by: User ID of approving supervisor (if applicable)
  - approved_at: Timestamp of approval (if applicable)
  - template_id: Reference to template used (future feature)
  - template_name: Name of template used (future feature)

**Example info JSON** (for Spot Check):
```json
{
  "total_items": 10,
  "items_counted": 10,
  "total_variance_value": -125.50,
  "high_variance_items": 1,
  "supervisor_approved": true,
  "approved_by": "user-550e8400-e29b-41d4-a716-446655440001",
  "approved_at": "2024-01-15T14:00:00Z",
  "template_id": null,
  "template_name": null
}
```

### tb_count_stock_detail (Spot Check Detail)

For complete field definitions, see [Physical Count Management DD](../physical-count-management/DD-physical-count-management.md). Key spot-check-specific notes below:

#### info JSON Field
- **Spot Check Specific Fields**:
  - product_cost: Product cost for variance value calculation
  - variance_value: Monetary variance (variance_qty * product_cost)
  - high_variance: Boolean flag if exceeds threshold (>5% or >$100)
  - requires_approval: Boolean if supervisor approval needed
  - approved: Boolean indicating supervisor approved this item
  - approved_by: User ID of approving supervisor
  - approved_at: Timestamp of approval
  - recount_requested: Boolean if supervisor requested recount
  - last_count_date: Date of last physical or spot count for this product
  - bin_location: Physical storage location (shelf/bin identifier)

**Example info JSON** (for Spot Check Detail):
```json
{
  "product_cost": 15.00,
  "variance_value": -75.00,
  "high_variance": true,
  "requires_approval": true,
  "approved": true,
  "approved_by": "user-supervisor-123",
  "approved_at": "2024-01-15T14:00:00Z",
  "recount_requested": false,
  "last_count_date": "2024-01-01T00:00:00Z",
  "bin_location": "COOLER-A-SHELF-2"
}
```

---

## Relationships

### Spot Check Session Relationships

**Parent Relationships** (Spot Check depends on):
- **tb_location**: One location has many spot checks
  - Foreign Key: `location_id` references `tb_location(id)`
  - Cardinality: Many-to-One (mandatory)
  - Cascade: No cascade delete (preserve audit trail)
  - Notes: Location must exist and be active; user must have access

- **tb_user** (Created By): One user creates many spot checks
  - Foreign Key: `created_by` references `tb_user(id)`
  - Cardinality: Many-to-One (mandatory)
  - Cascade: No cascade delete (preserve creator reference)

- **tb_user** (Updated By): One user updates many spot checks
  - Foreign Key: `updated_by` references `tb_user(id)`
  - Cardinality: Many-to-One (mandatory)
  - Cascade: No cascade delete (preserve updater reference)

**Child Relationships** (Depends on Spot Check):
- **tb_count_stock_detail**: One spot check has many detail lines
  - Foreign Key: `tb_count_stock_detail(count_stock_id)` references `tb_count_stock(id)`
  - Cardinality: One-to-Many (optional, but typically 1-50 details)
  - Cascade: No cascade delete (soft delete only)
  - Notes: Details created as products are added; max 50 per spot check

### Spot Check Detail Relationships

**Parent Relationships** (Detail depends on):
- **tb_count_stock**: One spot check has many details
  - Foreign Key: `count_stock_id` references `tb_count_stock(id)`
  - Cardinality: Many-to-One (mandatory)
  - Cascade: No cascade delete (soft delete only)

- **tb_product**: One product appears in many spot check details
  - Foreign Key: `product_id` references `tb_product(id)`
  - Cardinality: Many-to-One (mandatory)
  - Cascade: No cascade delete (preserve product reference)
  - Notes: Product must exist and be active when added

- **tb_unit**: One unit of measure used in many details
  - Foreign Key: `unit_id` references `tb_unit(id)`
  - Cardinality: Many-to-One (optional)
  - Cascade: No cascade delete (preserve unit reference)

- **tb_inventory_transaction** (Adjustment): One inventory transaction can be referenced by one spot check detail
  - Foreign Key: `adjustment_transaction_id` references `tb_inventory_transaction(id)`
  - Cardinality: One-to-One (optional, only after adjustment posted)
  - Cascade: No cascade delete (preserve transaction reference)

**Child Relationships**: None

---

## Indexing Strategy

### Indexes on tb_count_stock

**Note**: These indexes apply to all records in `tb_count_stock`, including both spot checks and physical counts.

1. **Primary Key Index**:
   - Columns: `id`
   - Type: B-tree, Unique
   - Purpose: Uniquely identify each spot check session

2. **Business Key Index**:
   - Columns: `count_stock_no`
   - Type: B-tree, Unique, Partial (WHERE deleted_at IS NULL)
   - Purpose: Enforce unique spot check numbers, enable fast lookup by number

3. **Type and Status Composite Index**:
   - Columns: `count_stock_type`, `doc_status`
   - Type: B-tree, Partial (WHERE deleted_at IS NULL)
   - Purpose: Filter spot checks by status efficiently
   - Example Query: "Show all completed spot checks"

4. **Location and Type Composite Index**:
   - Columns: `location_id`, `count_stock_type`
   - Type: B-tree, Partial (WHERE deleted_at IS NULL)
   - Purpose: Filter spot checks by location efficiently
   - Example Query: "Show all spot checks for Main Kitchen"

5. **Created Date Index**:
   - Columns: `created_at`
   - Type: B-tree, Descending
   - Purpose: Sort spot checks by date, enable date range queries
   - Example Query: "Show spot checks from last 7 days"

6. **Workflow Stage Index** (if workflow enabled):
   - Columns: `workflow_current_stage`
   - Type: B-tree, Partial (WHERE workflow_current_stage IS NOT NULL)
   - Purpose: Filter spot checks by workflow stage

### Indexes on tb_count_stock_detail

**Note**: These indexes apply to all detail records, including both spot checks and physical counts.

1. **Primary Key Index**:
   - Columns: `id`
   - Type: B-tree, Unique
   - Purpose: Uniquely identify each detail line

2. **Foreign Key Index (Spot Check)**:
   - Columns: `count_stock_id`
   - Type: B-tree
   - Purpose: Fast lookup of all products in a spot check
   - Example Query: "Get all products for spot check SPOT-2024-000015"

3. **Foreign Key Index (Product)**:
   - Columns: `product_id`
   - Type: B-tree
   - Purpose: Find all spot checks containing a specific product
   - Example Query: "Show spot check history for Chicken Breast"

4. **Composite Index (Spot Check + Product)**:
   - Columns: `count_stock_id`, `product_id`
   - Type: B-tree, Unique, Partial (WHERE deleted_at IS NULL)
   - Purpose: Enforce one product per spot check, fast joins
   - Example Query: Join spot check session with details

5. **Counted Status Index**:
   - Columns: `is_counted`
   - Type: B-tree, Partial (WHERE is_counted = false)
   - Purpose: Find uncounted products in spot check
   - Example Query: "Show uncounted products in this spot check"

6. **Adjustment Posted Index**:
   - Columns: `adjustment_posted`
   - Type: B-tree, Partial (WHERE adjustment_posted = false)
   - Purpose: Find products pending adjustment posting
   - Example Query: "Show products with unposted adjustments"

---

## Data Integrity Rules

### Referential Integrity

1. **Location Reference**:
   - `location_id` must reference valid record in `tb_location`
   - Location must not be soft-deleted (`tb_location.deleted_at IS NULL`)
   - Enforced by foreign key constraint and application logic

2. **Product Reference**:
   - `product_id` must reference valid record in `tb_product`
   - Product should be active (`tb_product.is_active = true`) when added
   - Enforced by foreign key constraint and validation logic

3. **User References**:
   - `created_by` and `updated_by` must reference valid users in `tb_user`
   - Enforced by foreign key constraints

4. **Spot Check Detail Parent**:
   - `count_stock_id` must reference valid spot check in `tb_count_stock`
   - Parent spot check must have `count_stock_type = 'spot'`
   - Enforced by foreign key constraint and application validation

### Domain Integrity

1. **Quantity Constraints**:
   - `expected_qty` >= 0 (CHECK constraint)
   - `actual_qty` >= 0 (CHECK constraint)
   - `variance_qty` can be positive or negative (no constraint)
   - All quantities: decimal(15,2) precision

2. **Status Values**:
   - `doc_status` must be valid enum value: 'pending', 'in_progress', 'completed', 'cancelled'
   - Status transitions follow business rules (see workflow diagram in FD document)

3. **Type Value**:
   - `count_stock_type` must be 'spot' for spot checks
   - Enforced by enum constraint and application logic

4. **Date Constraints**:
   - `end_date` must be NULL or after `start_date` (CHECK constraint)
   - `end_date` cannot be in future (application validation)
   - `created_at` and `updated_at` automatically set by database

### Entity Integrity

1. **Primary Keys**:
   - `id` (UUID) is primary key for both tables
   - Generated using `gen_random_uuid()` function
   - Guaranteed unique across all records

2. **Business Keys**:
   - `count_stock_no` must be unique across all spot checks and physical counts
   - Format: SPOT-YYYY-NNNNNN for spot checks
   - Enforced by unique index

3. **Required Fields**:
   - Spot Check Session: `location_id`, `count_stock_type`, `start_date`, `doc_status`, `created_by`, `updated_by`
   - Spot Check Detail: `count_stock_id`, `product_id`, `sequence_no`, `created_by`, `updated_by`

---

## Database Triggers

### Automatic Timestamp Updates

**Trigger Name**: `trg_update_timestamp_count_stock`
**Table**: `tb_count_stock`
**Event**: BEFORE UPDATE
**Purpose**: Automatically update `updated_at` timestamp on every record modification

**Logic** (described in text):
- Before any UPDATE operation
- Set `updated_at` = current timestamp
- Applies to all columns (including status changes, quantity updates)

**Trigger Name**: `trg_update_timestamp_count_stock_detail`
**Table**: `tb_count_stock_detail`
**Event**: BEFORE UPDATE
**Purpose**: Same as above, for detail records

### Audit Logging Trigger

**Trigger Name**: `trg_audit_count_stock`
**Table**: `tb_count_stock`
**Event**: AFTER INSERT, UPDATE, DELETE
**Purpose**: Log all changes to spot check sessions for audit trail

**Logic** (described in text):
- After INSERT, UPDATE, or DELETE
- Log operation type, user ID, timestamp
- Log old and new values (for UPDATE)
- Store in separate audit table `tb_audit_log`

### Validation Trigger (if enabled)

**Trigger Name**: `trg_validate_count_stock_detail`
**Table**: `tb_count_stock_detail`
**Event**: BEFORE INSERT, UPDATE
**Purpose**: Enforce business rules at database level

**Validation Rules** (described in text):
1. Product cannot appear twice in same spot check
2. `actual_qty` must be >= 0
3. If `is_counted` = true, `actual_qty` must not be NULL
4. If `adjustment_posted` = true, `adjustment_transaction_id` must not be NULL

**Note**: Most validations performed at application layer; triggers provide final safety net.

### Variance Calculation Trigger (optional)

**Trigger Name**: `trg_calculate_variance`
**Table**: `tb_count_stock_detail`
**Event**: BEFORE INSERT, UPDATE
**Purpose**: Automatically calculate variance_qty and variance_pct when actual_qty changes

**Calculation Logic** (described in text):
- If `actual_qty` changes or `expected_qty` changes:
  - `variance_qty` = `actual_qty` - `expected_qty`
  - If `expected_qty` > 0:
    - `variance_pct` = (`variance_qty` / `expected_qty`) * 100
  - Else:
    - `variance_pct` = NULL

**Note**: Variance calculation typically handled at application layer for performance; trigger provides consistency guarantee.

---

## Data Archival Strategy

### Archival Policy

**Active Data** (Primary Database):
- **Timeframe**: Current fiscal year + 1 year
- **Example**: If current year is 2024, retain 2023 and 2024 spot checks
- **Access**: Full read/write access for authorized users

**Archived Data** (Secondary Storage):
- **Timeframe**: 2-7 years
- **Purpose**: Historical analysis, audit compliance, trend reporting
- **Access**: Read-only, slower retrieval time

**Purged Data** (Deleted):
- **Timeframe**: > 7 years
- **Purpose**: Regulatory compliance (7-year retention for financial records)
- **Process**: Irreversibly deleted with proper approval and logging

### Archival Process

**Schedule**: Annually, at fiscal year end

**Steps** (described in text):
1. Identify spot checks older than retention period (created_at < 2 years ago)
2. Export data to archival storage (cold storage, data warehouse)
3. Verify archival integrity (checksum, record count)
4. Soft delete from primary database (set `deleted_at` = archive date)
5. Purge soft-deleted records older than 7 years (permanent deletion)
6. Update audit log with archival actions

**Restoration Process** (if needed):
1. Locate archived data by date range and spot check number
2. Import from archival storage to temporary table
3. Provide read-only access to authorized users
4. Re-archive after analysis complete

---

## Performance Considerations

### Query Optimization

**Common Queries** (estimated execution time targets):

1. **List Spot Checks by Location** (< 100ms):
   - Query: Find all spot checks for location in date range
   - Index Used: `location_id`, `count_stock_type`, `created_at`
   - Optimization: Composite index on (location_id, count_stock_type, created_at)

2. **Get Spot Check Details** (< 50ms):
   - Query: Find all products in spot check with product names
   - Index Used: `count_stock_id` (detail), join with tb_product
   - Optimization: Include product data in query to avoid N+1

3. **Find Uncounted Products** (< 50ms):
   - Query: Find products in spot check with is_counted = false
   - Index Used: `count_stock_id`, partial index on `is_counted`
   - Optimization: Partial index improves filter performance

4. **Variance Analysis Query** (< 200ms):
   - Query: Aggregate variance data across all completed spot checks for location
   - Index Used: Composite on (location_id, count_stock_type, doc_status)
   - Optimization: Materialized view for frequently accessed aggregates

5. **Approval Queue Query** (< 100ms):
   - Query: Find all high variance items requiring approval
   - Index Used: JSONB GIN index on `info` field for "requires_approval" = true
   - Optimization: Separate table for approval queue (future enhancement)

### Table Size Projections

**tb_count_stock** (Spot Check Sessions):
- Average record size: ~500 bytes (including JSON fields)
- Records per location per year: ~240-360
- 10 locations: ~2,400-3,600 records/year
- 5-year projection: ~12,000-18,000 records (6-9 MB)

**tb_count_stock_detail** (Spot Check Details):
- Average record size: ~400 bytes
- Details per spot check: ~10 products
- 10 locations: ~24,000-36,000 records/year
- 5-year projection: ~120,000-180,000 records (48-72 MB)

**Total Estimated Size** (5 years, 10 locations): 54-81 MB (manageable without partitioning)

### Optimization Techniques

1. **Partial Indexes**: Only index active records (deleted_at IS NULL)
2. **Composite Indexes**: Combine frequently filtered columns
3. **JSONB Indexing**: GIN indexes on JSON fields for fast queries
4. **Query Plan Analysis**: Regular EXPLAIN ANALYZE to identify slow queries
5. **Connection Pooling**: Prisma connection pool (10-50 connections)
6. **Read Replicas**: Separate read-only database for reports (future)

---

## Security Considerations

### Row-Level Security (RLS)

**Policy on tb_count_stock**:
- **SELECT Policy**: Users can view spot checks for locations they have access to
  - Logic: `location_id IN (SELECT location_id FROM tb_user_location WHERE user_id = current_user_id())`
  - Enforced at database level, transparent to application

- **INSERT Policy**: Users can create spot checks for locations they have access to
  - Logic: Same as SELECT + user has 'create_spot_check' permission

- **UPDATE Policy**: Users can update spot checks they created OR have supervisor role
  - Logic: `created_by = current_user_id() OR current_user_has_role('supervisor')`

- **DELETE Policy**: Not allowed (soft delete only via UPDATE)

**Policy on tb_count_stock_detail**:
- **SELECT Policy**: Inherit from parent spot check (via `count_stock_id` join)
- **INSERT/UPDATE Policy**: Same as parent spot check
- **DELETE Policy**: Not allowed (soft delete only)

### Column-Level Security (future enhancement)

**Sensitive Columns** (future):
- `approved_by`, `approved_at` in info JSON: Only visible to supervisor+ roles
- Variance value > $1000: Only visible to manager+ roles

### Data Encryption

**At Rest**: PostgreSQL transparent data encryption (TDE) via Supabase
**In Transit**: TLS 1.3 for all database connections
**Sensitive Fields**: No PII or payment data in spot check tables (no additional encryption needed)

---

## Backup and Recovery

### Backup Strategy

**Frequency**:
- **Full Backup**: Daily at 2 AM UTC
- **Incremental Backup**: Every 4 hours
- **Transaction Log Backup**: Continuous (WAL archiving)

**Retention**:
- Daily backups: 30 days
- Weekly backups: 12 months
- Monthly backups: 7 years (compliance)

**Storage**:
- Primary: Supabase automated backups
- Secondary: AWS S3 cold storage
- Geographic redundancy: Multi-region replication

### Recovery Procedures

**Point-in-Time Recovery (PITR)**:
- **RPO** (Recovery Point Objective): < 5 minutes (transaction log)
- **RTO** (Recovery Time Objective): < 1 hour (restore from backup)
- **Process**: Restore latest full backup + apply transaction logs up to failure point

**Disaster Recovery**:
- **Scenario**: Complete database loss
- **Process**: Restore from geographic backup, validate data integrity, switch DNS
- **RTO**: < 4 hours

**Data Corruption Recovery**:
- **Scenario**: Accidental deletion or data corruption
- **Process**: Identify affected records by timestamp, restore from backup to temp table, merge good data
- **RTO**: Variable (depends on corruption scope)

---

## Sample Data

### Example Spot Check Session

**Spot Check 1: Daily High-Value Check - Main Kitchen**
```
Record Type: Spot Check Session (tb_count_stock)

id: 550e8400-e29b-41d4-a716-446655440001
count_stock_no: SPOT-2024-000015
count_stock_type: spot
start_date: 2024-01-15 08:00:00 UTC
end_date: 2024-01-15 08:45:00 UTC
location_id: 440e8400-e29b-41d4-a716-446655440001
location_name: Main Kitchen
doc_status: completed
description: Daily high-value protein verification
note: null
info: {
  "total_items": 5,
  "items_counted": 5,
  "total_variance_value": -75.50,
  "high_variance_items": 1,
  "supervisor_approved": true,
  "approved_by": "user-supervisor-001",
  "approved_at": "2024-01-15T08:40:00Z"
}
workflow_id: null
workflow_name: null
workflow_current_stage: null
workflow_history: null
created_at: 2024-01-15 07:55:00 UTC
created_by: user-storekeeper-001
updated_at: 2024-01-15 08:45:05 UTC
updated_by: user-coordinator-001
deleted_at: null
```

**Detail Lines for Spot Check 1**:

```
Detail 1: Chicken Breast (High Variance - Approved)
id: 660e8400-e29b-41d4-a716-446655440011
count_stock_id: 550e8400-e29b-41d4-a716-446655440001
sequence_no: 1
product_id: prod-660e8400-001 (Chicken Breast)
product_code: MEAT-CHKN-001
product_name: Chicken Breast, Boneless, Skinless
unit_id: unit-kg
unit_name: Kilogram
expected_qty: 100.00
actual_qty: 95.00
variance_qty: -5.00
variance_pct: -5.00
is_counted: true
adjustment_posted: true
adjustment_transaction_id: adj-770e8400-001
note: Found 5kg expired, removed from inventory
info: {
  "product_cost": 15.00,
  "variance_value": -75.00,
  "high_variance": true,
  "requires_approval": true,
  "approved": true,
  "approved_by": "user-supervisor-001",
  "approved_at": "2024-01-15T08:40:00Z",
  "recount_requested": false,
  "last_count_date": "2024-01-01T00:00:00Z",
  "bin_location": "COOLER-A-SHELF-2"
}

Detail 2: Beef Tenderloin (Match)
sequence_no: 2
product_name: Beef Tenderloin, Prime Cut
expected_qty: 25.00
actual_qty: 25.00
variance_qty: 0.00
variance_pct: 0.00
(... other fields similar to Detail 1)

Detail 3: Salmon Fillet (Small Overage)
sequence_no: 3
product_name: Salmon Fillet, Atlantic, Fresh
expected_qty: 50.00
actual_qty: 50.50
variance_qty: 0.50
variance_pct: 1.00
note: Small overage, within acceptable range
(... other fields similar)

Detail 4: Lamb Chops (Match)
sequence_no: 4
product_name: Lamb Chops, Frenched, Premium
expected_qty: 15.00
actual_qty: 15.00
variance_qty: 0.00
variance_pct: 0.00

Detail 5: Duck Breast (Small Shortage)
sequence_no: 5
product_name: Duck Breast, Magret, Whole
expected_qty: 20.00
actual_qty: 19.50
variance_qty: -0.50
variance_pct: -2.50
note: Small shortage, within acceptable range
```

### Example Spot Check Session 2: Cancelled

```
Spot Check 2: Cancelled Spot Check - Dry Storage

count_stock_no: SPOT-2024-000016
count_stock_type: spot
start_date: 2024-01-15 10:00:00 UTC
end_date: null
location_id: 440e8400-e29b-41d4-a716-446655440002 (Dry Storage)
location_name: Dry Storage
doc_status: cancelled
description: Weekly dry goods verification
note: Cancelled - Location access unavailable due to maintenance
info: {
  "total_items": 3,
  "items_counted": 1,
  "total_variance_value": 0.00,
  "high_variance_items": 0,
  "supervisor_approved": false,
  "cancellation_reason": "Location access unavailable",
  "cancelled_by": "user-supervisor-002",
  "cancelled_at": "2024-01-15T10:30:00Z"
}
created_at: 2024-01-15 09:55:00 UTC
created_by: user-storekeeper-002
updated_at: 2024-01-15 10:30:00 UTC
updated_by: user-supervisor-002
```

---

## Glossary

- **Spot Check Session**: Single instance of targeted inventory verification
- **Spot Check Detail**: Individual product line within spot check session
- **Type Discriminator**: Field value that differentiates record types in shared table
- **Expected Quantity**: System-calculated inventory balance from transaction history
- **Actual Quantity**: Physical count performed by storekeeper
- **Variance**: Difference between expected and actual (positive = overage, negative = shortage)
- **High Variance**: Variance exceeding threshold (>5% or >$100) requiring approval
- **Adjustment Transaction**: Inventory transaction posted to correct balance based on variance
- **Soft Delete**: Marking record as deleted (deleted_at timestamp) without physical removal
- **Row-Level Security (RLS)**: Database-level security that filters rows based on user permissions
- **Point-in-Time Recovery (PITR)**: Restoring database to specific timestamp using transaction logs

---

**Document End**

> 📝 **Data Definition Summary**:
> - **Shared Schema**: Uses same tables as Physical Count Management
> - **Type Discriminator**: count_stock_type = 'spot' identifies spot checks
> - **Session Table**: tb_count_stock (header data, workflow state)
> - **Detail Table**: tb_count_stock_detail (product lines, variances)
> - **Estimated Size**: 54-81 MB for 5 years, 10 locations
> - **Security**: Row-Level Security (RLS) enforces location-based access
