# Business Requirements: Inventory Valuation

## Module Information
- **Module**: Shared Methods
- **Sub-Module**: Inventory Valuation
- **Route**: System-wide (centralized service)
- **Version**: 2.0.0 (Schema-Aligned)
- **Last Updated**: 2025-11-03
- **Owner**: Finance & Operations Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-02 | System Architect | Initial version |
| 1.1.0 | 2025-11-03 | Architecture Team | **Schema Alignment**: Updated references to match actual Prisma schema |
| 1.2.0 | 2025-11-03 | Architecture Team | **Lot-Based Cost Layers & Period-End Snapshots**: Added business rules for lot-based FIFO system and period-end balance snapshots |
| 2.0.0 | 2025-11-03 | Architecture Team | **Major Update**: Separated current implementation from future enhancements, cross-referenced SCHEMA-ALIGNMENT.md |

## ⚠️ IMPORTANT: Schema Alignment Notice

This document defines business requirements for inventory valuation. Requirements are categorized as:

- ✅ **Current Implementation**: Features implemented with actual schema (see `schema.prisma`)
- ⚠️ **Future Enhancement**: Planned features requiring schema changes (see `SCHEMA-ALIGNMENT.md`)

**For implementation roadmap of future features, see**: `SCHEMA-ALIGNMENT.md` Phases 1-5

---

## 📊 Rule Implementation Status Dashboard

### Overall Compliance

```
Total Rules Defined: 53 business rules across 4 categories
Currently Implemented: 15 rules (28%)
Planned Enhancements: 38 rules (72%)

Implementation Progress: ███░░░░░░░ 28%
Target Completion: Phase 1-4 (8-11 weeks)
```

### Status Legend

- ✅ **Implemented**: Rule active in production today
- 🔄 **Partial**: Basic implementation, enhancements planned
- ⚠️ **Planned**: Scheduled for specific phase
- 📋 **Future**: Under consideration, not scheduled
- 🚧 **Blocked**: Requires schema changes first

### Rule Categories Summary

| Category | Total Rules | Implemented ✅ | Partial 🔄 | Planned ⚠️ | Implementation % |
|----------|-------------|----------------|------------|------------|------------------|
| **LOT Rules** (BR-LOT-*) | 13 | 3 | 3 | 7 | 46% (6/13) |
| **Transfer Rules** (BR-TRANSFER-*) | 6 | 4 | 0 | 2 | 67% (4/6) |
| **Period Rules** (BR-PERIOD-*) | 17 | 1 | 0 | 16 | 6% (1/17) |
| **Inventory Rules** (BR-INV-*) | 17 | 7 | 3 | 7 | 59% (10/17) |
| **Total** | **53** | **15** | **6** | **32** | **40% (21/53)** |

### Implementation Roadmap by Phase

| Phase | Duration | Rules Implemented | Cumulative | Target % |
|-------|----------|-------------------|------------|----------|
| **Current (v1.0)** | Done | 15 + 6 partial | 21/53 | 40% |
| **Phase 1** | 1-2 weeks | +10 rules | 31/53 | 58% |
| **Phase 2** | 1 week | +3 rules | 34/53 | 64% |
| **Phase 3** | 2-3 weeks | +8 rules | 42/53 | 79% |
| **Phase 4** | 2-3 weeks | +11 rules | 53/53 | **100%** |
| **Phase 5** | 2 weeks | Polish only | 53/53 | 100% |

### Critical Path Rules (P0 Priority)

| Rule ID | Description | Status | Phase | Business Impact |
|---------|-------------|--------|-------|-----------------|
| BR-LOT-001 | GRN creates LOT layer | ✅ | Current | Core functionality |
| BR-LOT-005 | Consumption creates ADJUSTMENT | 🚧 | Phase 1 | Requires transaction_type |
| BR-LOT-010 | FIFO ordering | ✅ | Current | Core FIFO |
| BR-PERIOD-002 | Sequential periods | ⚠️ | Phase 4 | Period integrity |
| BR-PERIOD-007 | Snapshot on close | ⚠️ | Phase 4 | Historical accuracy |
| BR-INV-010 | FIFO layer consumption | 🔄 | Phase 3 | Cost accuracy |
| BR-INV-019 | FIFO calculation | ✅ | Current | Core costing |

### Quick Reference: Rule Status by ID

#### LOT Rules (BR-LOT-*)
- BR-LOT-001 ✅ | BR-LOT-002 ✅ | BR-LOT-003 ✅ | BR-LOT-004 🔄
- BR-LOT-005 🚧 | BR-LOT-006 🚧 | BR-LOT-007 🚧 | BR-LOT-008 ✅
- BR-LOT-009 ✅ | BR-LOT-010 ✅ | BR-LOT-011 ✅ | BR-LOT-012 🔄
- BR-LOT-013 🔄

#### Transfer Rules (BR-TRANSFER-*)
- BR-TRANSFER-001 ✅ | BR-TRANSFER-002 🚧 | BR-TRANSFER-003 ✅
- BR-TRANSFER-004 ✅ | BR-TRANSFER-005 ✅ | BR-TRANSFER-006 ✅

#### Period Rules (BR-PERIOD-*)
- BR-PERIOD-001 ✅ | BR-PERIOD-002 ⚠️ | BR-PERIOD-003 ⚠️
- BR-PERIOD-004 through BR-PERIOD-017 ⚠️ (All Phase 4)

#### Inventory Rules (BR-INV-*)
- BR-INV-001 ✅ | BR-INV-002 ✅ | BR-INV-003 ✅ | BR-INV-004 ✅
- BR-INV-005 ✅ | BR-INV-006 ✅ | BR-INV-007 ✅ | BR-INV-008 🔄
- BR-INV-009 🔄 | BR-INV-010 🔄 | BR-INV-011 ⚠️ | BR-INV-012 ⚠️
- BR-INV-013 ⚠️ | BR-INV-014 ⚠️ | BR-INV-015 ✅ | BR-INV-016 ✅
- BR-INV-017 ✅

### Enhancement Dependencies

**Schema Prerequisites for Rule Implementation**:

| Schema Change | Dependent Rules | Phase | Count |
|---------------|-----------------|-------|-------|
| Add `transaction_type` field | BR-LOT-005, BR-LOT-006, BR-LOT-007, BR-TRANSFER-002 | Phase 1 | 4 |
| Add `parent_lot_no` field | BR-LOT-006, BR-LOT-007 | Phase 1 | 2 |
| Add `tb_period` table | BR-PERIOD-002 through BR-PERIOD-017 | Phase 1 | 16 |
| Add `tb_period_snapshot` table | BR-PERIOD-007, BR-PERIOD-010 | Phase 1 | 2 |
| Add lot format validation | BR-LOT-004 | Phase 2 | 1 |
| Enhanced FIFO logic | BR-LOT-012, BR-LOT-013, BR-INV-010 | Phase 3 | 3 |

### What This Means for You

**✅ Today (v1.0)**:
- Core FIFO and Periodic Average costing works
- Basic lot tracking and balance calculation functional
- Essential business rules enforced
- Sufficient for day-to-day operations

**⚠️ Phase 1-2 (2-3 weeks)**:
- Transaction categorization automated
- Parent lot linkage available
- Lot format validation enforced
- Period management infrastructure ready

**🎯 Phase 3-4 (4-6 weeks)**:
- Complete FIFO edge case handling
- Period locking and snapshots
- 100% audit trail coverage
- Full regulatory compliance

---

## Overview

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

The Inventory Valuation system is a centralized, application-wide service that provides a single source of truth for all inventory costing calculations throughout the Carmen ERP system. This shared method ensures consistency and accuracy in inventory valuations across all modules including Credit Notes, Stock Adjustments, Financial Reports, and Cost of Goods Sold (COGS) calculations.

The system supports two industry-standard costing methods configurable at the company level: **FIFO (First-In-First-Out)** and **AVG (Periodic Average)**. The selected method applies uniformly across all inventory items, locations, and transactions, ensuring consistent financial reporting and compliance with accounting standards.

**Database Enum**: `enum_calculation_method` with values `FIFO` and `AVG` (see schema.prisma:42-45)

This centralized approach replaces the previous item-level costing configuration, simplifying system administration and ensuring financial data integrity. All inventory valuations are calculated using the same business rules and algorithms, providing transparency, audit trails, and compliance with financial regulations.

## Business Objectives

1. **Establish Single Source of Truth**: Provide one centralized service for all inventory cost calculations, eliminating inconsistencies across modules and ensuring uniform costing throughout the system.

2. **Ensure Financial Compliance**: Support industry-standard costing methods (FIFO and Periodic Average) that comply with Generally Accepted Accounting Principles (GAAP) and International Financial Reporting Standards (IFRS).

3. **Simplify System Administration**: Reduce complexity by implementing company-wide costing method configuration instead of per-item or per-location settings, making the system easier to manage and audit.

4. **Improve Performance**: Optimize inventory valuation calculations through intelligent caching strategies (Periodic Average) and efficient layer management (FIFO), ensuring sub-second response times even with high transaction volumes.

5. **Enable Accurate Financial Reporting**: Provide precise, consistent cost data for financial statements, management reports, and regulatory filings, supporting confident decision-making and audit compliance.

6. **Maintain Complete Audit Trail**: Log all configuration changes, cost calculations, and fallback strategies with full traceability, supporting internal audits, external audits, and regulatory compliance requirements.

7. **Support Business Continuity**: Implement fallback costing strategies to ensure valuations can be calculated even when primary data sources are incomplete, preventing business disruption.

8. **Facilitate Module Integration**: Provide clean, well-documented APIs that allow all modules (Credit Notes, Stock Adjustments, Reports) to easily integrate with centralized costing services.

9. **Ensure Data Consistency**: Guarantee that the same inventory item valued on the same date will always produce the same cost, regardless of which module requests the valuation.

10. **Enable Future Expansion**: Design the system with extensibility in mind, allowing for potential future costing methods (Standard Cost, Latest Purchase Price) without disrupting existing functionality.

## Key Stakeholders

**Primary Users**:
- Financial Managers: Configure costing method, review audit trails, ensure compliance
- System Administrators: Manage system configuration, monitor performance, troubleshoot issues

**Secondary Users**:
- Purchasing Staff: Indirectly use valuation service through Credit Note creation
- Operations Managers: Indirectly use valuation service through Stock Adjustments
- Report Viewers: Consume cost data in financial and operational reports

**Approvers**:
- CFO/Finance Director: Approve costing method changes (major accounting policy decisions)
- Finance Team: Review and validate cost calculations and audit trails

**Administrators**:
- System Administrators: Configure settings, manage background jobs, monitor system health
- Database Administrators: Manage data storage, optimize queries, maintain data integrity

**Reviewers**:
- Internal Auditors: Review audit trails, validate compliance with accounting policies
- External Auditors: Verify costing methods, review financial data accuracy, assess controls
- Regulatory Reviewers: Ensure compliance with financial reporting standards

**Support**:
- IT Support Team: Troubleshoot technical issues, assist users with system access
- Development Team: Maintain and enhance the valuation service, fix bugs, implement new features

---

## Functional Requirements

### FR-INV-001: Display Current Costing Method Configuration
**Priority**: Medium

The system must display the current costing method configuration to authorized users, showing which method is actively being used for inventory valuations.

**Acceptance Criteria**:
- System displays current costing method (FIFO or Periodic Average) on Inventory Settings page
- System shows period type (Calendar Month - read-only)
- System displays last updated timestamp and username
- System shows method descriptions explaining what each method does
- Settings page loads within 2 seconds
- Only users with financial-manager or system-admin role can view settings

**Related Requirements**: BR-INV-001, BR-INV-002, UC-INV-001

---

### FR-INV-002: Allow Authorized Users to Change Costing Method
**Priority**: High

The system must allow authorized users to change the system-wide costing method from FIFO to Periodic Average or vice versa, subject to proper authorization and validation.

**Acceptance Criteria**:
- System provides radio button selection for FIFO and Periodic Average
- System displays detailed descriptions and impact analysis for each method
- Change requires business justification (minimum 20 characters)
- Change requires approver name (CFO/Finance Director)
- System prevents changing to the same method currently active
- Only users with financial-manager or system-admin role can change settings
- Configuration changes complete within 5 seconds

**Related Requirements**: BR-INV-003, BR-INV-004, BR-INV-005, UC-INV-002

---

### FR-INV-003: Require Justification for Costing Method Changes
**Priority**: High

The system must require users to provide business justification when changing the costing method, supporting audit compliance and accountability.

**Acceptance Criteria**:
- System requires "Reason for Change" text (minimum 20 characters, maximum 500 characters)
- System requires "Approved By" name (minimum 3 characters, maximum 100 characters)
- System validates inputs before allowing save
- System displays field-level validation errors
- Justification and approver information stored in audit trail
- System prevents saving changes without complete justification

**Related Requirements**: BR-INV-004, BR-INV-005, UC-INV-002

---

### FR-INV-004: Audit All Configuration Changes
**Priority**: High

The system must create immutable audit log entries for all costing method configuration changes, supporting compliance and accountability.

**Acceptance Criteria**:
- System creates audit entry BEFORE making configuration change
- Audit entry includes: old method, new method, reason, approver, user, timestamp
- Audit entry creation failure prevents configuration change (transaction rollback)
- Audit entries are immutable (cannot be edited or deleted)
- Audit log stored permanently (minimum 7 years retention)
- System includes optional metadata (IP address, session ID, browser)

**Related Requirements**: BR-INV-006, BR-INV-041, BR-INV-042, BR-INV-043, UC-INV-106

---

### FR-INV-005: Maintain Complete Audit Trail
**Priority**: Medium

The system must maintain a complete, queryable audit trail of all configuration changes accessible to authorized users.

**Acceptance Criteria**:
- System stores all configuration change events in valuation_audit_log table
- Audit history accessible via "View Audit History" dialog
- History displayed in reverse chronological order (most recent first)
- Each entry shows: date/time, previous method, new method, changed by, reason, approver
- Audit data retained for minimum 7 years
- Audit entries queryable by date range and user

**Related Requirements**: BR-INV-009, BR-INV-010, BR-INV-011, UC-INV-003

---

### FR-INV-006: Allow Filtering and Searching Audit History
**Priority**: Medium

The system must provide filtering and search capabilities for audit history to help users find specific changes quickly.

**Acceptance Criteria**:
- Users can filter by date range (from date, to date)
- Users can filter by user who made change
- Filters apply immediately or on "Apply" button click
- System displays count of filtered results
- "Clear Filters" button resets all filters
- Empty state message shown when no results match filters

**Related Requirements**: UC-INV-003

---

### FR-INV-007: Export Audit History to CSV
**Priority**: Low

The system must allow authorized users to export audit history to CSV format for external analysis or compliance reporting.

**Acceptance Criteria**:
- "Export to CSV" button available in audit history dialog
- Export includes all filtered records (respects current filters)
- CSV includes columns: Date/Time, Previous Method, New Method, Changed By, Reason, Approved By, Change ID
- Filename format: `inventory-costing-audit-{company}-{date}.csv`
- Export completes within 10 seconds for up to 1000 records
- Export respects user's company scope (no cross-company data)

**Related Requirements**: BR-INV-012, BR-INV-013, UC-INV-004

---

### FR-INV-008: Provide Centralized Valuation API
**Priority**: High

The system must provide a centralized API that all modules can use to request inventory valuations.

**Acceptance Criteria**:
- Service provides `calculateInventoryValuation(itemId, quantity, date)` method
- Method accepts: item ID (string/UUID), quantity (decimal), transaction date (Date)
- Method returns ValuationResult with: itemId, quantity, unitCost, totalValue, method, calculatedAt
- API validates all inputs before processing
- API throws descriptive errors for invalid inputs
- API supports synchronous processing (returns result immediately)

**Related Requirements**: BR-INV-014, BR-INV-015, BR-INV-016, BR-INV-017, BR-INV-018, UC-INV-005

---

### FR-INV-009: Support Batch Valuations
**Priority**: Medium

The system must support batch valuation requests to efficiently value multiple items in a single operation.

**Acceptance Criteria**:
- Service provides `batchValuation(items[], date)` method
- Method accepts array of {itemId, quantity} objects and common date
- Method processes items in parallel for performance
- Method returns array of ValuationResult objects
- Partial failures allowed (some succeed, some fail)
- Batch processing completes within 5 seconds for 100 items

**Related Requirements**: NFR-INV-021, UC-INV-204

---

### FR-INV-010: Calculate FIFO Costs by Consuming Oldest Layers
**Priority**: High

The system must calculate FIFO costs by systematically consuming the oldest available inventory layers first.

**Acceptance Criteria**:
- System queries FIFO layers WHERE SUM(in_qty) - SUM(out_qty) > 0
- Layers ordered by lot_number ASC (natural chronological sort via embedded date)
- Lot format `{LOCATION}-{YYMMDD}-{SEQ}` ensures chronological ordering without separate date field
- System consumes quantity from oldest layer first
- If layer insufficient, system moves to next oldest layer
- System continues until required quantity satisfied
- System tracks which layers consumed with quantities and costs (via out_qty entries)
- Error thrown if insufficient layers available

**Related Requirements**: BR-INV-019, BR-INV-020, BR-INV-021, BR-INV-022, BR-INV-023, UC-INV-101

---

### FR-INV-011: Track FIFO Layer Consumption
**Priority**: High

The system must track detailed information about which FIFO layers were consumed for each valuation.

**Acceptance Criteria**:
- ValuationResult includes layersConsumed[] array for FIFO valuations
- Each consumed layer record includes: layerId, lotNumber (format: {LOCATION}-{YYMMDD}-{SEQ}), quantityConsumed, unitCost, totalCost
- Receipt date derived from lot_number embedded date (YYMMDD portion)
- Consumption data supports audit trail and cost verification
- Layer consumption information returned to calling module
- Data retained for audit and compliance purposes

**Related Requirements**: BR-INV-020, UC-INV-101

---

### FR-INV-012: Calculate Period Average Using Monthly Receipts with Revaluation
**Priority**: High

The system must calculate periodic average cost using all receipts within the calendar month of the transaction date, with automated period-end revaluation to standardize inventory costs.

**Acceptance Criteria**:
- System normalizes transaction date to period boundaries (1st to last day of month)
- System queries all GRN items WHERE receipt_date BETWEEN period_start AND period_end
- Only COMMITTED GRN items included in calculation
- Average cost formula: Σ(quantity × unitCost) ÷ Σ(quantity)
- Average cost rounded to 5 decimal places (DECIMAL(20,5) in schema)
- Total value rounded to 2 decimal places
- Receipts recorded at actual cost, consumption uses cached period average
- **Period close creates CLOSE transaction** to revalue ending inventory to period average
- **Period open creates OPEN transaction** for next period at standardized average cost
- Diff column tracks rounding errors (2 decimal price, 3 decimal qty) and revaluation variance
- Error thrown if no receipts found in period (triggers fallback)

**Related Requirements**: BR-INV-024, BR-INV-025, BR-INV-026, BR-INV-027, BR-INV-028, BR-INV-048, BR-INV-049, BR-INV-050, UC-INV-102

---

### FR-INV-012A: Transaction Type Identification Logic
**Priority**: High

The system must automatically identify transaction types based on parent lot reference and transaction nature.

**Acceptance Criteria**:
- **LOT Layer transactions** (parent_lot_no IS NULL): RECEIVE, TRANSFER_IN, OPEN, CLOSE
- **ADJUSTMENT Layer transactions** (parent_lot_no IS NOT NULL): ISSUE, ADJ_IN, ADJ_OUT, TRANSFER_OUT
- Transaction type determines cost layer behavior
- LOT transactions create new lots with independent balances
- ADJUSTMENT transactions consume from parent lots (reduce parent balance)
- System validates transaction type consistency with parent_lot_no presence
- CLOSE transaction revalues remaining inventory to period average
- OPEN transaction creates opening balance at period average cost

**Related Requirements**: BR-INV-051, BR-INV-052, BR-INV-053, BR-INV-054, BR-INV-055, BR-INV-056, BR-INV-057, BR-INV-058

---

### FR-INV-012B: Period-End Revaluation Process
**Priority**: High

The system must automatically revalue inventory at period close to standardize costs to period average.

**Acceptance Criteria**:
- Period close calculates final period average cost
- System creates CLOSE transaction (LOT layer, no parent)
- CLOSE transaction includes Diff variance: (Period Average - Actual Costs) × Remaining Qty
- Diff represents revaluation adjustment posted to P&L
- System creates OPEN transaction for next period
- OPEN transaction uses period average cost (standardized opening balance)
- Revaluation ensures period-to-period cost consistency
- All transactions maintain complete audit trail

**Related Requirements**: BR-INV-048, BR-INV-049, BR-INV-050, BR-PERIOD-*

---

### FR-INV-012C: Diff Column Calculation and Tracking
**Priority**: Medium

The system must track rounding differences and revaluation variances in the Diff column.

**Acceptance Criteria**:
- Diff column tracks precision/rounding differences (price: 2 decimal display, 3 decimal qty)
- During period: Diff accumulates rounding errors from transactions
- At period close: Diff includes revaluation variance adjustment
- Diff calculation: (Period Average × Remaining Qty) - (Book Value at Actual Costs)
- Diff posted to revaluation variance account in P&L
- Movement reports reflect Diff impact on inventory valuation
- System maintains precision: DECIMAL(20,5) storage, 2 decimal display

**Related Requirements**: BR-INV-059, BR-INV-060

---

### FR-INV-013: Cache Calculated Period Costs
**Priority**: High

The system must cache calculated periodic average costs to improve performance of subsequent valuations.

**Acceptance Criteria**:
- System checks cache before calculating period average
- Cache hit returns cost immediately (sub-50ms response)
- Cache miss triggers calculation then stores result
- Cache entry uniquely identified by (item_id, period)
- Cache includes metadata: receiptCount, totalQuantity, totalCost
- Cache UPSERT ensures idempotency (safe to recalculate)
- Cache write failures logged but do not fail parent operation

**Related Requirements**: BR-INV-030, BR-INV-031, BR-INV-032, BR-INV-033, NFR-INV-010, NFR-INV-011, UC-INV-103

---

### FR-INV-014: Cache Period Average Costs
**Priority**: High

The system must maintain a cache table for period average costs to optimize performance.

**Acceptance Criteria**:
- Cache table stores: id, item_id, period, average_cost, total_quantity, total_cost, receipt_count, calculated_at
- Unique constraint on (item_id, period)
- Cache populated during cost calculation
- Cache used for subsequent requests in same period
- Cache invalidated when new GRN posted in period
- Cache entries readable by reporting tools

**Related Requirements**: NFR-INV-012, UC-INV-103

---

### FR-INV-015: Provide Fallback Costing Strategies
**Priority**: Medium

The system must provide fallback strategies when primary cost calculation fails, ensuring business continuity.

**Acceptance Criteria**:
- Fallback Strategy 1: Use previous month's cached cost if available
- Fallback Strategy 2: Use item's standard cost if configured and > 0
- Fallback Strategy 3: Use latest purchase price (last 90 days)
- Fallback strategies attempted in priority order
- System logs which fallback strategy succeeded
- ValuationResult flagged with warning when fallback used
- Error thrown only when all fallback strategies fail

**Related Requirements**: BR-INV-034, BR-INV-035, BR-INV-036, BR-INV-037, BR-INV-038, UC-INV-104

---

### FR-INV-016: Log Fallback Strategy Usage
**Priority**: Medium

The system must log when fallback strategies are used to support troubleshooting and data quality improvement.

**Acceptance Criteria**:
- System logs fallback usage to audit/application logs
- Log includes: itemId, quantity, transactionDate, attempted method, fallback strategy used
- ValuationResult includes fallbackUsed flag and fallbackStrategy name
- Warning message included in result for calling module
- Logs help identify data quality issues (missing receipts, unconfigured items)

**Related Requirements**: UC-INV-104

---

### FR-INV-017: Log Significant Valuation Events
**Priority**: Medium

The system must create audit log entries for significant valuation events such as failures, fallbacks, and unusual conditions.

**Acceptance Criteria**:
- System logs valuation failures with error details
- System logs fallback strategy usage
- System logs "no receipts in period" conditions
- Audit entries include: eventType, itemId, quantity, date, attemptedMethod, errorMessage
- Audit logging failures do not fail parent operations
- Logs support troubleshooting and system monitoring

**Related Requirements**: BR-INV-039, BR-INV-040, NFR-INV-014, UC-INV-105

---

### FR-INV-018: Create Audit Entry Before Configuration Change
**Priority**: High

The system must create audit log entry BEFORE saving configuration changes to ensure complete audit trail.

**Acceptance Criteria**:
- Audit entry created in same transaction as configuration change
- Audit entry creation failure causes transaction rollback
- Configuration change NOT saved if audit fails
- Audit entry includes all change details (old/new values, reason, approver)
- Audit entry immutable after creation

**Related Requirements**: BR-INV-041, BR-INV-042, BR-INV-043, NFR-INV-015, UC-INV-106

---

### FR-INV-019: Ensure Audit Entries Are Immutable
**Priority**: High

The system must ensure audit log entries cannot be modified or deleted after creation.

**Acceptance Criteria**:
- No UPDATE operations allowed on audit log table
- No DELETE operations allowed on audit log table
- Database constraints prevent modifications
- Audit table uses append-only pattern
- Any attempt to modify audit entries logged and blocked

**Related Requirements**: BR-INV-042, UC-INV-106

---

### FR-INV-020: Notify Stakeholders of Configuration Changes
**Priority**: Medium

The system must send notifications to relevant stakeholders when costing method is changed.

**Acceptance Criteria**:
- Notifications sent to all users with roles: financial-manager, operations-manager, system-admin
- Notification includes: old method, new method, changed by user, timestamp
- In-app notifications sent immediately
- Email notifications sent if enabled in user preferences
- Notification delivery within 1 minute of change
- Notification failures logged but do not fail configuration change

**Related Requirements**: BR-INV-045, BR-INV-046, BR-INV-047, NFR-INV-016, UC-INV-107

---

### FR-INV-021: Integrate with Credit Note Module
**Priority**: High

The system must provide valuation services to Credit Note module for calculating return costs.

**Acceptance Criteria**:
- Credit Note module calls centralized valuation service
- Valuation calculated for each line item on credit note
- Cost based on return date and configured costing method
- Credit note displays unitCost and totalCost from valuation
- Valuation failures display user-friendly error messages
- Integration supports both single and batch valuations

**Related Requirements**: NFR-INV-017, UC-INV-201

---

### FR-INV-022: Integrate with Stock Adjustment Module
**Priority**: High

The system must provide valuation services to Stock Adjustment module for costing adjustments.

**Acceptance Criteria**:
- Stock Adjustment module calls valuation service for DECREASE and WRITE_OFF adjustments
- INCREASE adjustments use actual cost (no valuation needed)
- Valuation based on adjustment date and configured costing method
- Adjustment valued cost used for general ledger posting
- Valuation failures prevent adjustment completion (with option for manual override)

**Related Requirements**: NFR-INV-018, UC-INV-202

---

### FR-INV-023: Invalidate Cache on GRN Posting
**Priority**: High

The system must invalidate cached period costs when new GRN is posted to ensure accurate valuations.

**Acceptance Criteria**:
- System subscribes to GRN_POSTED events from GRN module
- Event includes: grnId, receiptDate, itemIds[] array
- System invalidates cache for all affected items in receipt month
- Cache invalidation completes within 500ms
- Event processing guarantees at-least-once delivery
- Duplicate events detected and skipped (idempotency)

**Related Requirements**: BR-INV-029, NFR-INV-019, NFR-INV-020, UC-INV-203

---

### FR-INV-024: Support Batch Valuation for Reports
**Priority**: Medium

The system must support efficient batch valuations for reporting and bulk operations.

**Acceptance Criteria**:
- Batch API accepts array of items and common date
- Items processed in parallel for performance
- Partial failures allowed (some succeed, some fail)
- Results array includes successful valuations and error details
- Large batches (>100) processed in chunks to prevent resource exhaustion

**Related Requirements**: NFR-INV-021, UC-INV-204

---

### FR-INV-025: Pre-calculate Monthly Period Costs
**Priority**: Medium

The system must automatically pre-calculate period costs at end of each month to improve performance.

**Acceptance Criteria**:
- Background job runs at 2 AM on 1st of each month
- Job calculates costs for all active items with receipts in previous month
- Costs cached using application-level cache (Redis or similar) - no dedicated table in schema
- Job uses distributed lock to prevent concurrent execution
- Job generates summary report (success count, failure count, execution time)
- Job completes within 1 hour for 10,000 active items

**Related Requirements**: NFR-INV-022, UC-INV-301

---

### FR-INV-026: Clean Up Stale Cache Entries
**Priority**: Low

The system must periodically remove stale cache entries that are no longer needed.

**Acceptance Criteria**:
- Background job runs weekly (3 AM Sunday)
- Job deletes cache entries older than 6 months
- Deletion performed in batches to prevent lock contention
- Job logs summary (entries deleted, space reclaimed)
- Job completes within 15 minutes

**Related Requirements**: NFR-INV-023, UC-INV-302

---

## Business Rules

### General Rules

- **BR-INV-001**: Only users with financial-manager or system-admin role can view inventory settings
- **BR-INV-002**: Settings are company-specific and isolated by company ID (no cross-company access)
- **BR-INV-003**: Only financial-manager or system-admin roles can change costing method
- **BR-INV-006**: All costing method changes must be logged in audit trail before being saved
- **BR-INV-007**: Costing method changes affect only future transactions, not historical data
- **BR-INV-008**: System-wide costing method applies to all locations and items (no exceptions)
- **BR-INV-009**: Audit history is company-specific (filtered by company ID)
- **BR-INV-010**: Audit entries are immutable (cannot be edited or deleted)
- **BR-INV-011**: Audit history retention follows company data retention policy (minimum 7 years)
- **BR-INV-012**: Exported audit data respects user's company scope (no cross-company data)
- **BR-INV-013**: Export includes only data user has permission to view

### Data Validation Rules

- **BR-INV-004**: Costing method change requires business justification (minimum 20 characters, maximum 500 characters)
- **BR-INV-005**: Costing method change requires approver name (CFO/Finance Director, minimum 3 characters, maximum 100 characters)
- **BR-INV-014**: Valuation calculations are company-specific (isolated by company ID)
- **BR-INV-015**: All valuations use configured costing method for that company
- **BR-INV-016**: Calculations are deterministic (same inputs produce same outputs)
- **BR-INV-017**: Unit costs rounded to 5 decimal places (DECIMAL(20,5) in schema) for precision
- **BR-INV-018**: Total values rounded to 2 decimal places for currency standard

### Workflow Rules

- **BR-INV-041**: Audit entry MUST be created before configuration change is saved
- **BR-INV-042**: Audit entries are immutable after creation (append-only)
- **BR-INV-043**: Audit entry creation failure prevents configuration change (transaction rollback)
- **BR-INV-044**: All configuration changes require complete audit trail
- **BR-INV-045**: Notification failure does not rollback configuration change
- **BR-INV-046**: Notifications respect user preferences (email on/off)
- **BR-INV-047**: Critical stakeholders always notified (financial managers, admins)

### Calculation Rules

- **BR-INV-019**: FIFO consumes oldest layers first (by lot_number ASC - natural chronological sort via embedded date)
- **BR-INV-020**: Each FIFO consumption tracked with layer details for audit trail
- **BR-INV-021**: FIFO layers with zero balance (SUM(in_qty) - SUM(out_qty) = 0) are skipped
- **BR-INV-022**: FIFO unit cost precision: 5 decimal places (DECIMAL(20,5) in schema)
- **BR-INV-023**: FIFO total value precision: 2 decimal places
- **BR-INV-024**: Period boundaries always calendar month (1st to last day)
- **BR-INV-025**: Periodic Average formula: Σ(quantity × unitCost) ÷ Σ(quantity)
- **BR-INV-026**: Periodic Average cost precision: 5 decimal places (DECIMAL(20,5) in schema)
- **BR-INV-027**: Periodic Average total value precision: 2 decimal places
- **BR-INV-028**: Only COMMITTED GRN items included in periodic average calculation
- **BR-INV-029**: Cached costs remain valid until new GRN posted in that period
- **BR-INV-030**: Cache entries uniquely identified by (item_id, period) combination
- **BR-INV-031**: Cache entries can be updated when recalculated (UPSERT pattern)
- **BR-INV-032**: Cache entries include metadata (receiptCount, totalQuantity, totalCost) for transparency
- **BR-INV-033**: Cache failures do not fail parent operations (cache is optimization)
- **BR-INV-034**: Fallback strategies attempted in priority order (previous period → standard cost → latest purchase)
- **BR-INV-035**: Fallback results flagged with warning for user awareness
- **BR-INV-036**: Previous period fallback limited to 1 month prior only
- **BR-INV-037**: Latest purchase fallback limited to last 90 days
- **BR-INV-038**: Standard cost used only if configured and greater than zero
- **BR-INV-039**: Audit logging failures do not fail parent operations
- **BR-INV-040**: Sensitive data (costs, quantities) may be audited depending on company policy

### Transaction Type Rules

- **BR-INV-051**: System automatically identifies 8 transaction types: RECEIVE, ISSUE, ADJ_IN, ADJ_OUT, TRANSFER_IN, TRANSFER_OUT, OPEN, CLOSE
- **BR-INV-052**: LOT layer transactions (parent_lot_no IS NULL) include: RECEIVE, TRANSFER_IN, OPEN, CLOSE
- **BR-INV-053**: ADJUSTMENT layer transactions (parent_lot_no IS NOT NULL) include: ISSUE, ADJ_IN, ADJ_OUT, TRANSFER_OUT
- **BR-INV-054**: RECEIVE creates new lot at actual purchase price (no parent)
- **BR-INV-055**: ISSUE consumes from parent lot using FIFO or period average
- **BR-INV-056**: ADJ_IN adjusts inventory upward (cannot exceed parent lot balance)
- **BR-INV-057**: ADJ_OUT adjusts inventory downward (references parent lot)
- **BR-INV-058**: TRANSFER_IN creates new lot at destination location (no parent)
- **BR-INV-059**: TRANSFER_OUT consumes from source lot (references parent)
- **BR-INV-060**: CLOSE transaction revalues ending inventory to period average (LOT layer)
- **BR-INV-061**: OPEN transaction creates opening balance at period average (LOT layer)

### Period-End Revaluation Rules

- **BR-INV-048**: Enhanced Periodic Average includes automated period-end revaluation
- **BR-INV-049**: Receipts recorded at actual cost during period (not revalued immediately)
- **BR-INV-050**: Consumption uses cached period average for cost calculation
- **BR-INV-062**: Period close calculates final period average from all receipts
- **BR-INV-063**: CLOSE transaction creates revaluation adjustment with Diff variance
- **BR-INV-064**: Diff variance = (Period Average × Remaining Qty) - Book Value at Actual
- **BR-INV-065**: Diff posted to revaluation variance account in P&L
- **BR-INV-066**: OPEN transaction standardizes opening balance to period average
- **BR-INV-067**: Next period opens at period average cost (clean slate)
- **BR-INV-068**: Revaluation ensures period-to-period cost consistency

### Precision and Rounding Rules

- **BR-INV-069**: Price stored with 5 decimal precision (DECIMAL(20,5)), displayed with 2 decimals
- **BR-INV-070**: Quantity stored with 3 decimal precision
- **BR-INV-071**: Diff column tracks rounding errors during period
- **BR-INV-072**: Diff column accumulates revaluation variance at period close
- **BR-INV-073**: Movement reports reflect Diff impact on inventory valuation

<div style="color: #FFD700;">

### ⚠️ FUTURE ENHANCEMENT: Lot-Based Cost Layer Rules (FIFO)

**Status**: Planned (See SCHEMA-ALIGNMENT.md Phase 3)

These rules define the **desired** lot-based system. Current implementation uses `in_qty`/`out_qty` instead.

- **BR-LOT-001** ✅: GRN creates new LOT layer with unique lot number format `{LOCATION}-{YYMMDD}-{SEQ}`
  - **Format**: `{LOCATION}-{YYMMDD}-{SEQ}` where LOCATION is 2-4 char code, YYMMDD is 6-digit date, SEQ is 2-digit sequence
  - **Examples**: `MK-251102-0001`, `KC-251105-0001`, `BAR-251110-0001`
  - **Current**: Automatic lot number generation implemented on GRN commit
- **BR-LOT-002** ⚠️: Transfer In creates new LOT layer at destination location with new lot number
  - **Current**: No automatic lot generation for transfers
- **BR-LOT-003** ⚠️: Lot numbers must be unique across all locations within the company
  - **Current**: Uniqueness enforced by `@@unique([lot_no, lot_index])` but not location-aware
- **BR-LOT-004** ✅: Each LOT layer tracks balance via `in_qty`/`out_qty` (calculated as SUM(in_qty) - SUM(out_qty))
  - **Current**: Correctly implemented using transaction-based approach (single source of truth)
- **BR-LOT-005** ⚠️: ISSUE, ADJ_IN, ADJ_OUT, TRANSFER_OUT create ADJUSTMENT layers (not LOT layers)
  - **Transaction Types**: System automatically identifies layer type based on parent_lot_no presence
  - **Current**: No transaction_type distinction between LOT and ADJUSTMENT (Phase 1 enhancement)
- **BR-LOT-006** ⚠️: ADJUSTMENT layers MUST link to parent lot via `parent_lot_number` field
  - **Current**: No `parent_lot_no` field exists
- **BR-LOT-007** ⚠️: Multiple ADJUSTMENT layers can reference the same parent lot
  - **Current**: Not applicable (no parent linkage)
- **BR-LOT-008** ⚠️: ADJUSTMENT layers record transaction type and reason for audit trail
  - **Current**: No `transaction_type` field in closing_balance table
- **BR-LOT-009** ✅: ADJUSTMENT layers reduce balance of parent lots via `out_qty` entries
  - **Current**: Correctly implemented (balance calculated from transaction history)
- **BR-LOT-010** ✅: Lot consumption follows strict FIFO order: `lot_number ASC` (natural chronological sort)
  - **Rationale**: Lot format `{LOCATION}-{YYMMDD}-{SEQ}` embeds date, enabling natural chronological ordering
  - **Current**: Implemented using ORDER BY `lot_no ASC` for FIFO consumption
- **BR-LOT-011** ✅: Only lots with positive balance (SUM(in_qty) - SUM(out_qty) > 0) are eligible for consumption
  - **Current**: Correctly implemented using HAVING SUM(in_qty) - SUM(out_qty) > 0
- **BR-LOT-012** ⚠️: Lot consumption creates ADJUSTMENT layer for each lot consumed
  - **Current**: Creates new entry with `out_qty` > 0
- **BR-LOT-013** ✅: Fully consumed lots (SUM(in_qty) - SUM(out_qty) = 0) remain in history for audit trail
  - **Current**: Correctly implemented (entries with in_qty = out_qty remain)

### ⚠️ FUTURE ENHANCEMENT: Transfer Lot Numbering Rules

**Status**: Planned (See SCHEMA-ALIGNMENT.md Phase 3)

- **BR-TRANSFER-001** ✅: Transfer Out consumes from source location lots using FIFO algorithm
  - **Current**: Implemented with current FIFO logic
- **BR-TRANSFER-002** ⚠️: Transfer Out creates ADJUSTMENT layers at source location
  - **Current**: Creates entries with `out_qty` > 0
- **BR-TRANSFER-003** ⚠️: Transfer In creates NEW LOT layer at destination location
  - **Current**: Creates entries with `in_qty` > 0, manual lot number
- **BR-TRANSFER-004** ⚠️: Destination lot number MUST be different from source lot number
  - **Current**: Not enforced (manual entry)
- **BR-TRANSFER-005** ✅: Destination lot carries unit cost from source lot consumption
  - **Current**: Implemented via `cost_per_unit` field
- **BR-TRANSFER-006** ✅: Source and destination lots are traceable via transaction records
  - **Current**: Traceable via `inventory_transaction_detail_id`

### Credit Note (CN) Inventory Transaction Rules

**Status**: Current Implementation (Integrated with FIFO and Periodic AVG methods)

Credit Note transactions affect inventory immediately when CN is committed (DRAFT → COMMITTED). Two operation types: **QUANTITY_RETURN** (physical return) and **AMOUNT_DISCOUNT** (cost adjustment).

- **BR-CN-001** ✅: **Transaction Type Distinction**
  - All Credit Note inventory transactions MUST use transaction type `CN`
  - Distinct from generic adjustments (ADJ_OUT) for audit trail and reporting
  - **Current**: Implemented via transaction_type field in closing_balance table
  - **Purpose**: Enable filtered queries, audit reports, and CN-specific analytics

- **BR-CN-002** ✅: **Cost Method Processing**
  - CN transactions process based on company-wide costing method configuration
  - **FIFO Method**:
    - QUANTITY_RETURN: Uses lot-specific costs with FIFO consumption order
    - AMOUNT_DISCOUNT: Adjusts specific lot costs via zero-quantity adjustment
  - **Periodic AVG Method**:
    - QUANTITY_RETURN: Uses period average cost (not original GRN cost)
    - AMOUNT_DISCOUNT: Adjusts period average calculation for future transactions
  - **Current**: Implemented in costing method calculation logic

- **BR-CN-003** ✅: **QUANTITY_RETURN Same-Lot Return**
  - When returning to the same lot as original GRN receipt:
    - Uses original lot's `cost_per_unit` value from GRN
    - Creates entry with `in_qty=0`, `out_qty=returned_qty`, `lot_no=original_lot`
    - Maintains cost consistency (same unit cost as original receipt)
  - **Current**: Implemented with lot-specific cost tracking
  - **Formula**: `remaining_qty = SUM(in_qty) - SUM(out_qty)`

- **BR-CN-004** ✅: **QUANTITY_RETURN Different-Lot (FIFO)**
  - When original lot is insufficient (partially/fully consumed):
    - Query available lots: `ORDER BY lot_no ASC` (FIFO order)
    - Consume from oldest available lots first
    - Create separate CN entries for each lot consumed
    - Calculate lot depletion on-the-fly: `SUM(in_qty) - SUM(out_qty) = 0`
  - **Current**: Implemented with FIFO consumption algorithm
  - **Lot Depletion**: No explicit flag, calculated from transaction history
  - **Audit Trail**: Multiple CN entries preserve full traceability

- **BR-CN-005** ✅: **AMOUNT_DISCOUNT Zero-Quantity Processing**
  - Cost adjustment without physical quantity change:
    - Create entry with `in_qty=0`, `out_qty=0`, `total_cost<0` (negative)
    - Set `cost_per_unit=$0.00` (not applicable for zero-quantity)
    - Link to affected lot(s) via `lot_no` field
    - Allocate discount to **remaining inventory only** (not consumed items)
  - **Current**: Implemented with zero-quantity cost adjustment pattern
  - **Validation**: System prevents applying discount to depleted lots

- **BR-CN-006** ✅: **Effective Cost Calculation**
  - Formula: `Effective Unit Cost = (SUM(in_qty × cost) + SUM(cost_adjustments)) / SUM(in_qty)`
  - **FIFO Method**: Apply per lot separately
    - Each lot maintains its own effective cost after discounts
    - Example: Lot with 200 units @ $15.00, $300 discount = $13.50/unit effective
  - **Periodic AVG Method**: Apply to entire period
    - Adjusts period total cost for average calculation
    - Affects all transactions after discount in same period
  - **Current**: Implemented in valuation query logic (calculated on-demand)

- **BR-CN-007** ✅: **Immediate Commitment Trigger**
  - All CN inventory transactions trigger **immediately on CN commit**
  - Status flow: DRAFT → COMMITTED (no PENDING/APPROVED states)
  - Cost adjustments apply at moment of commitment
  - **Current**: Implemented with direct DRAFT → COMMITTED flow
  - **Rationale**: Financial and inventory impacts must be synchronized

- **BR-CN-008** ✅: **Lot Depletion Detection**
  - No explicit "depleted" or "is_depleted" flag stored in database
  - Calculate depletion on-the-fly: `SUM(in_qty) - SUM(out_qty) = 0`
  - Depleted lots excluded from available inventory queries via `HAVING` clause
  - Audit trail preserved: Depleted lot entries remain in database
  - **Current**: Implemented with calculated balance approach
  - **Query Pattern**: `HAVING SUM(in_qty) - SUM(out_qty) > 0` for available lots
  - **Performance**: Indexed lot_no and product_id for efficient aggregation

**CN-Specific Query Patterns**:

```sql
-- Available lots for CN QUANTITY_RETURN (FIFO)
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,
  cost_per_unit
FROM tb_inventory_transaction_closing_balance
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0  -- Exclude depleted lots
ORDER BY lot_no ASC  -- FIFO order

-- Effective cost calculation (including AMOUNT_DISCOUNT)
SELECT
  lot_no,
  SUM(in_qty) as total_received,
  SUM(out_qty) as total_consumed,
  SUM(in_qty) - SUM(out_qty) as remaining,
  (SUM(CASE WHEN in_qty > 0 THEN in_qty * cost_per_unit ELSE 0 END) +
   SUM(CASE WHEN in_qty = 0 AND out_qty = 0 THEN total_cost ELSE 0 END)) /
  NULLIF(SUM(in_qty), 0) as effective_unit_cost
FROM tb_inventory_transaction_closing_balance
WHERE lot_no = :lot_no
GROUP BY lot_no
```

**Cross-Reference**:
- Detailed transaction handling: `SM-costing-methods.md` (CN Transaction Handling section)
- Transaction type specifications: `SM-transaction-types-and-cost-layers.md` (Rule 2: Credit Note)
- Credit Note module rules: `BR-credit-note.md`, `VAL-credit-note.md`

### ⚠️ FUTURE ENHANCEMENT: Period-End Snapshot Rules

**Status**: Planned (See SCHEMA-ALIGNMENT.md Phase 4)

These rules require `tb_period` and `tb_period_snapshot` tables which **do not exist yet**.

- **BR-PERIOD-001** ✅: Period definition is calendar month (1st to last day) for both FIFO and Periodic Average
  - **Current**: Implemented in calculation logic
- **BR-PERIOD-002** ⚠️: Period-end snapshots created manually by authorized users (financial-manager or system-admin)
  - **Current**: No period or snapshot tables exist
- **BR-PERIOD-003** ⚠️: Period status can be OPEN (active), CLOSED (snapshot created), or LOCKED (permanent)
  - **Current**: No period management exists
- **BR-PERIOD-004** ⚠️: Only OPEN periods can accept new transactions
  - **Current**: No period status validation
- **BR-PERIOD-005** ⚠️: Snapshots include lot identification, opening/closing quantities, opening/closing costs, movement summary
  - **Current**: No snapshot table exists
- **BR-PERIOD-006** ⚠️: FIFO method creates lot-level snapshots (item, location, lot number)
  - **Current**: No snapshot mechanism
- **BR-PERIOD-007** ⚠️: Periodic Average method creates aggregate snapshots (item, location)
  - **Current**: No snapshot mechanism
- **BR-PERIOD-008** ⚠️: Movement summary includes receipts, issues, adjustments, transfers in, transfers out
  - **Current**: No movement summary storage
- **BR-PERIOD-009** ⚠️: Opening balance for period N MUST equal closing balance from period N-1
  - **Current**: No period linkage mechanism
- **BR-PERIOD-010** ⚠️: Closing quantity formula: Opening + Receipts - Issues + Adjustments + Transfers In - Transfers Out
  - **Current**: No period calculations
- **BR-PERIOD-011** ⚠️: Only most recent closed period can be re-opened
  - **Current**: No period re-open capability
- **BR-PERIOD-012** ⚠️: Period re-open requires reason (minimum 50 characters)
  - **Current**: No period management workflow
- **BR-PERIOD-013** ⚠️: Re-opening period does NOT delete existing snapshots (preserves audit trail)
  - **Current**: No snapshot preservation mechanism
- **BR-PERIOD-014** ⚠️: New snapshot created when period re-closed after corrections
  - **Current**: No snapshot versioning
- **BR-PERIOD-015** ⚠️: Only POSTED transactions included in period snapshots
  - **Current**: No snapshot filtering
- **BR-PERIOD-016** ⚠️: Snapshot data is READ-ONLY after creation (immutable)
  - **Current**: No snapshot table
- **BR-PERIOD-017** ⚠️: Snapshots retained permanently for audit and financial reporting
  - **Current**: No snapshot retention

</div>

---

## Data Model

**Note**: The interfaces shown below are **conceptual data models** used to communicate business requirements. They are NOT intended to be copied directly into code. Refer to [DD-inventory-valuation.md](DD-inventory-valuation.md) for complete data definitions.

### InventorySettings Entity

**Purpose**: Stores company-wide inventory costing method configuration and settings.

**Conceptual Structure**:

```typescript
interface InventorySettings {
  // Primary key
  id: string;                              // Unique identifier (UUID)

  // Company relationship
  companyId: string;                       // Foreign key to companies table (unique per company)

  // Core configuration (from enum_calculation_method)
  defaultCostingMethod: 'FIFO' | 'AVG';    // Active costing method (AVG = Periodic Average)
  periodType: 'CALENDAR_MONTH';            // Fixed to calendar month (read-only)

  // Audit fields
  createdAt: Date;                         // When settings first created
  updatedAt: Date;                         // When settings last modified
  createdBy: string;                       // User ID who created settings
  updatedBy?: string;                      // User ID who last modified settings
}
```

### ValuationResult Entity

**Purpose**: Represents the result of an inventory cost calculation, returned by valuation service.

**Conceptual Structure**:

```typescript
interface ValuationResult {
  // Item identification
  itemId: string;                          // Item being valued

  // Quantity and cost
  quantity: number;                        // Quantity valued (decimal 19,4)
  unitCost: number;                        // Cost per unit (decimal 19,4)
  totalValue: number;                      // Total cost (decimal 19,2)

  // Method and metadata (from enum_calculation_method)
  method: 'FIFO' | 'AVG';                  // Costing method used (AVG = Periodic Average)
  calculatedAt: Date;                      // When calculation performed

  // FIFO-specific data (optional, only when method = FIFO)
  layersConsumed?: FIFOLayerConsumption[]; // Details of consumed layers

  // Periodic Average-specific data (optional, only when method = AVG)
  period?: Date;                           // Period start (1st of month)
  averageCost?: number;                    // Average cost for period (decimal 19,4)

  // Fallback indicators (optional)
  fallbackUsed?: boolean;                  // True if fallback strategy used
  fallbackStrategy?: string;               // Which fallback strategy succeeded
  warning?: string;                        // Warning message about fallback
}
```

### FIFOLayerConsumption Entity

**Purpose**: Details about a single FIFO layer consumed during valuation calculation.

**Conceptual Structure**:

```typescript
interface FIFOLayerConsumption {
  layerId: string;                         // FIFO layer UUID
  lotNumber: string;                       // Lot/batch number from receipt
  quantityConsumed: number;                // Quantity taken from this layer (decimal 19,4)
  unitCost: number;                        // Unit cost from this layer (decimal 19,4)
  totalCost: number;                       // Total cost from this layer (decimal 19,2)
  receiptDate: Date;                       // When this layer was received
}
```

### PeriodCostCache Entity

**Purpose**: Caches calculated periodic average costs for performance optimization.

**Conceptual Structure**:

```typescript
interface PeriodCostCache {
  // Primary key
  id: string;                              // Unique identifier (UUID)

  // Cache key (unique together)
  itemId: string;                          // Item being cached
  period: Date;                            // Period start (1st of month, normalized)

  // Calculated values
  averageCost: number;                     // Average cost for period (decimal 19,4)
  totalQuantity: number;                   // Sum of quantities in period (decimal 19,4)
  totalCost: number;                       // Sum of costs in period (decimal 19,2)
  receiptCount: number;                    // Number of receipts in calculation

  // Metadata
  calculatedAt: Date;                      // When cost was calculated
  createdBy: string;                       // Always 'SYSTEM' for automated calculations
}
```

### ValuationAuditLog Entity

**Purpose**: Immutable audit trail of all costing method configuration changes.

**Conceptual Structure**:

```typescript
interface ValuationAuditLog {
  // Primary key
  id: string;                              // Unique identifier (UUID)

  // Event classification
  eventType: 'COSTING_METHOD_CHANGED';     // Type of event

  // Change details (from enum_calculation_method)
  oldValue: 'FIFO' | 'AVG';                // Previous costing method (AVG = Periodic Average)
  newValue: 'FIFO' | 'AVG';                // New costing method (AVG = Periodic Average)

  // Authorization
  reason: string;                          // Business justification (20-500 chars)
  approvedBy: string;                      // Approving authority name (3-100 chars)

  // User and timestamp
  userId: string;                          // User who made change
  timestamp: Date;                         // When change occurred (UTC)

  // Optional metadata
  ipAddress?: string;                      // IP address of user
  sessionId?: string;                      // Session identifier
  browser?: string;                        // Browser and version
}
```

---

## Integration Points

### Internal Integrations

- **Credit Note Module**: Calls valuation service to calculate return costs for each line item. Integration triggered when user creates or edits credit note. Uses `calculateInventoryValuation()` API with return date.

- **Stock Adjustment Module**: Calls valuation service for DECREASE and WRITE_OFF adjustments to determine cost for general ledger posting. INCREASE adjustments use actual cost (no valuation needed).

- **GRN Module**: Publishes GRN_POSTED event after committing goods receipt. Valuation service subscribes to event to invalidate cache for affected items/periods.

- **Report Module**: Calls batch valuation service for inventory reports, cost analysis, and financial statements. Uses `batchValuation()` API for efficiency.

- **Notification Service**: Receives requests from Inventory Settings Service to send notifications when costing method changed. Sends in-app and email notifications to stakeholders.

- **Audit Logging Service**: Receives audit log entries from valuation services for configuration changes and significant events. Stores entries in audit tables.

### External Integrations

- None (system is internal shared method)

### Data Dependencies

- **Depends On**:
  - GRN Module: Requires goods receipt data (receipt date, quantity, unit cost) for period average calculations
  - FIFO Layers: Requires FIFO layer data (receipt date, remaining quantity, unit cost) for FIFO calculations
  - Item Master: Requires item existence validation, optional standard cost fallback
  - Company Settings: Requires company identification for multi-tenancy
  - User Management: Requires user authentication and role verification

- **Used By**:
  - Credit Note Module: Consumes valuation results for return costing
  - Stock Adjustment Module: Consumes valuation results for adjustment costing
  - Report Module: Consumes valuation results for financial reporting
  - Cost Analysis Tools: Consumes valuation data for cost analytics
  - Financial Statements: Consumes valuation data for COGS and inventory values

---

## Non-Functional Requirements

### Performance

- **NFR-INV-001**: Inventory Settings page shall load within 2 seconds under normal network conditions
- **NFR-INV-002**: Configuration changes shall complete within 5 seconds including audit logging and cache invalidation
- **NFR-INV-003**: System shall send configuration change notifications within 1 minute of change
- **NFR-INV-004**: Audit history shall load within 3 seconds for up to 100 entries
- **NFR-INV-005**: Audit data shall be retained for minimum 7 years per compliance requirements
- **NFR-INV-006**: CSV export shall complete within 10 seconds for up to 1000 audit records
- **NFR-INV-007**: Single item valuation calculations shall complete within 500ms
- **NFR-INV-008**: API shall support 100+ concurrent valuation requests without degradation
- **NFR-INV-009**: FIFO calculation shall complete within 300ms for up to 100 layers
- **NFR-INV-010**: Period average calculation shall complete within 500ms for up to 1000 receipts
- **NFR-INV-011**: Cache hit rate shall exceed 80% for period average valuations
- **NFR-INV-012**: Cache write operations shall complete within 100ms
- **NFR-INV-013**: Fallback calculation shall complete within 200ms
- **NFR-INV-014**: Audit logging shall not add more than 50ms overhead to operations
- **NFR-INV-015**: Audit entry creation shall complete within 200ms
- **NFR-INV-016**: Notifications shall be delivered within 1 minute of triggering event
- **NFR-INV-017**: Credit note cost calculation shall complete within 1 second
- **NFR-INV-018**: Stock adjustment valuation shall complete within 1 second
- **NFR-INV-019**: GRN event processing shall complete within 500ms
- **NFR-INV-020**: System shall guarantee at-least-once event delivery for GRN events
- **NFR-INV-021**: Batch valuation shall process 100 items within 5 seconds
- **NFR-INV-022**: Monthly pre-calculation job shall complete within 1 hour for 10,000 active items
- **NFR-INV-023**: Cache cleanup job shall complete within 15 minutes

### Security

- **NFR-INV-024**: Only authenticated users with valid session can access inventory settings
- **NFR-INV-025**: Only users with financial-manager or system-admin role can view settings
- **NFR-INV-026**: Only users with financial-manager or system-admin role can modify settings
- **NFR-INV-027**: All configuration changes must be audited with user identification
- **NFR-INV-028**: Audit entries must be immutable and tamper-proof
- **NFR-INV-029**: System shall enforce company-level data isolation (no cross-company access)
- **NFR-INV-030**: API shall validate all input parameters to prevent injection attacks
- **NFR-INV-031**: System shall log all unauthorized access attempts
- **NFR-INV-032**: Sensitive data (costs) may be redacted in logs based on company policy

### Usability

- **NFR-INV-033**: Inventory Settings page shall be accessible via standard navigation path
- **NFR-INV-034**: Impact analysis shall be clearly visible before confirming changes
- **NFR-INV-035**: Error messages shall be user-friendly and actionable
- **NFR-INV-036**: Success messages shall confirm actions taken
- **NFR-INV-037**: Audit history shall be sortable and filterable
- **NFR-INV-038**: Page shall be responsive and mobile-friendly
- **NFR-INV-039**: Page shall comply with WCAG 2.1 AA accessibility standards
- **NFR-INV-040**: Help text shall be available for all complex fields

### Reliability

- **NFR-INV-041**: System shall have 99.9% uptime during business hours
- **NFR-INV-042**: Database transactions shall be ACID-compliant
- **NFR-INV-043**: Failed operations shall rollback completely (no partial updates)
- **NFR-INV-044**: System shall gracefully handle concurrent modification conflicts
- **NFR-INV-045**: Background jobs shall be fault-tolerant and resumable
- **NFR-INV-046**: System shall recover from failures without data loss
- **NFR-INV-047**: Fallback strategies shall ensure business continuity

### Scalability

- **NFR-INV-048**: System shall support 100,000+ inventory items per company
- **NFR-INV-049**: System shall support 1,000+ concurrent users across all companies
- **NFR-INV-050**: System shall handle 10,000+ transactions per day per company
- **NFR-INV-051**: Cache shall scale to millions of period cost entries
- **NFR-INV-052**: Audit log shall scale to 10+ years of history

---

## Success Metrics

### Efficiency Metrics

- **Valuation Request Response Time**: 95th percentile < 500ms (target: <300ms)
- **Cache Hit Rate**: >80% for period average valuations (target: >90%)
- **Audit Query Performance**: Load 100 entries in <3 seconds (target: <2 seconds)
- **Batch Processing Efficiency**: 100 items in 5 seconds (target: 200 items in 5 seconds)
- **Background Job Completion**: Pre-calc completes <1 hour for 10K items (target: <30 min)

### Quality Metrics

- **Calculation Accuracy**: 100% correct valuations (zero tolerance for calculation errors)
- **Data Consistency**: 100% consistency across modules using same valuation
- **Audit Completeness**: 100% of configuration changes audited
- **System Uptime**: 99.9% availability during business hours (target: 99.95%)
- **Error Rate**: <0.1% failed valuations (target: <0.01%)

### Adoption Metrics

- **User Adoption**: 100% of relevant modules using centralized valuation service
- **Settings Review Frequency**: Financial managers review settings monthly
- **Audit Trail Usage**: Auditors access audit history quarterly (minimum)

### Business Impact Metrics

- **Time Savings**: 50% reduction in time to generate costing reports
- **Data Quality Improvement**: 90% reduction in cost inconsistencies across modules
- **Compliance Confidence**: 100% audit readiness (instant audit trail access)
- **Performance Improvement**: 80% faster valuations with caching vs. on-demand calculation

---

## Dependencies

### Module Dependencies

- **GRN Module**: Required for goods receipt data (receipt dates, quantities, costs) used in period average calculations. Integration via event subscription for cache invalidation.

- **FIFO Layer Management**: Required for FIFO costing calculations. Depends on layer creation during GRN posting and layer consumption tracking.

- **User Management**: Required for authentication, role verification, and user identification in audit logs. Needed to enforce security rules.

- **Company Settings**: Required for multi-tenancy support, company identification, and data isolation between companies.

- **Notification Service**: Required for sending configuration change notifications to stakeholders. Not critical path - failures do not block configuration changes.

- **Audit Logging Service**: Required for storing audit trail entries. Critical path - failures must block configuration changes to maintain compliance.

### Technical Dependencies

- **Database System**: PostgreSQL or compatible RDBMS for storing settings, cache, and audit data with ACID guarantees.

- **Date Utility Library**: date-fns for period boundary calculations, date normalization, and date arithmetic.

- **Message Queue**: RabbitMQ, Kafka, or similar for event-driven GRN integration and cache invalidation.

- **Caching Layer**: Optional Redis for application-level caching of costing method setting (in addition to database cache table).

### Data Dependencies

- **Item Master Data**: Required for item validation, optional standard cost lookup as fallback strategy.

- **GRN Transaction Data**: Required for period average calculations (committed goods receipts with dates, quantities, costs).

- **FIFO Layer Data**: Required for FIFO calculations (receipt layers with remaining quantities, unit costs, lot numbers).

- **User Directory**: Required for user authentication, role lookup, and audit trail user identification.

---

## Assumptions and Constraints

### Assumptions

- Costing method changes are infrequent (1-2 times per year or less), as they represent major accounting policy decisions.

- All GRN data is accurate and committed before being used in cost calculations (GIGO - garbage in, garbage out).

- Calendar month periods are acceptable for all companies using the system (no fiscal year or custom period requirements).

- Users have stable internet connections during configuration changes to prevent partial updates or transaction failures.

- Financial managers and system administrators are properly trained on the implications of changing costing methods.

- Audit retention period of 7 years satisfies all regulatory requirements (may be longer in some jurisdictions).

- Standard cost and latest purchase price fallbacks are acceptable alternatives when primary calculation fails (business accepts this trade-off).

- Companies using the system have sufficient database storage for audit logs, cache entries, and FIFO layers over multi-year periods.

### Constraints

- System must use only FIFO or Periodic Average methods - no other costing methods supported in initial version (LIFO, Moving Average, Standard Cost as primary methods not supported).

- Period type fixed to calendar month - no support for fiscal periods, custom periods, or weekly/quarterly periods.

- Costing method is company-wide only - no support for per-item, per-location, or per-category costing methods.

- Historical transactions cannot be retroactively revalued when costing method changes (prevents financial statement restatement complexity).

- Cache invalidation depends on event-driven integration - if events fail, cache may become stale (acceptable risk with manual refresh capability).

- Fallback strategies have limited lookback periods (1 month for previous period, 90 days for latest purchase) to balance accuracy vs. performance.

- Audit log is append-only - no mechanism to correct audit entries if erroneous data was logged (by design for compliance).

- Background jobs run on fixed schedules - no real-time pre-calculation or on-demand cache warming (acceptable for performance optimization).

### Risks

- **Risk**: Costing method change without proper planning could cause confusion or financial reporting issues.
  - **Mitigation**: Require justification, approver name, display impact analysis, send notifications to all stakeholders, provide complete audit trail.

- **Risk**: Cache becoming stale if GRN events fail to publish or process correctly, leading to incorrect valuations.
  - **Mitigation**: Implement at-least-once delivery, duplicate detection, error queues, monitoring alerts, manual cache invalidation capability.

- **Risk**: FIFO layer data corruption or gaps causing valuation failures and business disruption.
  - **Mitigation**: Implement fallback strategies, comprehensive error logging, data validation during GRN posting, regular data integrity checks.

- **Risk**: Performance degradation with very high transaction volumes or large number of FIFO layers.
  - **Mitigation**: Implement caching, batch processing, query optimization, database indexing, background pre-calculation, horizontal scaling capability.

- **Risk**: Insufficient audit trail retention or audit data loss could impact compliance and regulatory audits.
  - **Mitigation**: Enforce 7-year minimum retention, implement database backups, audit log replication, immutable storage, compliance monitoring.

- **Risk**: Unauthorized configuration changes due to insufficient access controls or social engineering.
  - **Mitigation**: Enforce role-based access control, require approver name, comprehensive audit logging, unusual activity alerts, user training.

---

## Future Enhancements

### Phase 2 Enhancements

- **Standard Cost as Primary Method**: Add Standard Cost as a third costing method option, allowing companies to use predetermined costs instead of actual costs. Requires standard cost maintenance interface and variance tracking.

- **Per-Category Costing Methods**: Support different costing methods for different product categories (e.g., FIFO for perishables, Periodic Average for staples). Requires category-level configuration and more complex routing logic.

- **Fiscal Period Support**: Allow companies to use fiscal year periods instead of calendar months for Periodic Average calculations. Requires configurable period boundaries and date normalization changes.

- **Real-time Cache Warming**: Implement real-time cache updates when GRNs posted instead of waiting for invalidation/recalculation. Improves performance but increases complexity.

- **Advanced Fallback Strategies**: Add more sophisticated fallback options like weighted moving average, supplier price lists, or market price lookups. Requires integration with external pricing data.

- **Cost Simulation**: Allow users to simulate the impact of changing costing methods before committing, showing projected cost differences. Requires "what-if" calculation engine.

### Future Considerations

- **Multi-currency Support**: Handle items purchased in different currencies with exchange rate conversions in cost calculations. Complex but needed for international operations.

- **Cost Variance Analysis**: Provide detailed analysis of cost variations by period, item, supplier, or category. Helpful for procurement optimization and cost control.

- **Automated Costing Method Recommendations**: Use machine learning to recommend optimal costing method based on item characteristics, transaction patterns, and business goals.

- **Intercompany Transfer Pricing**: Support transfer pricing rules for inventory moved between related companies with different costing methods.

- **Regulatory Reporting**: Pre-built reports for tax authorities, financial regulators, and industry-specific compliance requirements.

### Technical Debt

- None (greenfield implementation based on documented requirements)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Product Manager | | | |
| Technical Lead | | | |
| Finance Representative | | | |
| Quality Assurance | | | |

---

## Appendix

### Glossary

- **FIFO (First-In-First-Out)**: Inventory costing method that assumes items purchased first are sold first, consuming oldest cost layers before newer ones
- **Periodic Average**: Inventory costing method that calculates average cost for all receipts within a period (calendar month) and applies that average to all transactions in the period
- **Costing Method**: The accounting policy that determines how inventory costs are calculated and assigned to transactions
- **Valuation**: The process of calculating the monetary value (cost) of inventory items
- **Layer**: In FIFO costing, a distinct batch of inventory from a single receipt with its own quantity and unit cost
- **Period**: For Periodic Average, a calendar month from the 1st to the last day
- **Cache**: Temporary storage of calculated costs to improve performance of repeated requests
- **Fallback Strategy**: Alternative method to calculate cost when primary method fails due to missing data
- **Audit Trail**: Complete, immutable record of all configuration changes and significant events
- **Company-wide**: Setting that applies to all items, locations, and transactions for a company
- **Calendar Month**: Period from 1st day to last day of a month (e.g., Jan 1-31, Feb 1-28/29)

### References

- [Shared Method Specification](SM-inventory-valuation.md)
- [Data Definition](DD-inventory-valuation.md)
- [Use Cases](UC-inventory-valuation.md)
- [Page Content](PC-inventory-settings.md)
- [Flow Diagrams](FD-inventory-valuation.md) - to be created
- [Validations](VAL-inventory-valuation.md) - to be created
- [GAAP Inventory Accounting Standards](https://www.fasb.org/)
- [IFRS IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/)

### Change Requests

| CR ID | Date | Description | Status |
|-------|------|-------------|--------|
| - | - | No change requests at this time | - |

---

## Document Revision Notes

### Version 2.0.0 (Schema-Aligned) - 2025-11-03

**✅ Major Update: Separated Current Implementation from Future Enhancements**

This document has been updated to clearly distinguish between:
- Features implemented with current schema (✅ Current)
- Features requiring future schema changes (⚠️ Future Enhancement)

**Key Changes**:
1. **Schema Alignment Notice Added**:
   - Clear categorization of current vs future requirements
   - Cross-reference to SCHEMA-ALIGNMENT.md for implementation roadmap

2. **Business Rules Updated**:
   - All lot-based rules (BR-LOT-*) marked as future enhancements
   - Current implementation state documented for each rule
   - ✅ marks indicate what exists now vs ⚠️ for planned features

3. **Period Management Rules Updated**:
   - All period rules (BR-PERIOD-*) marked as future enhancements
   - Noted that `tb_period` and `tb_period_snapshot` tables don't exist yet
   - Cross-referenced to SCHEMA-ALIGNMENT.md Phase 4

4. **Transfer Rules Updated**:
   - Separated current capabilities from planned enhancements
   - Documented manual lot number assignment vs future auto-generation

**Important Notes**:
- Business requirements remain valid as desired future state
- Balance calculated as `SUM(in_qty) - SUM(out_qty)` is the CORRECT design (not a limitation)
- No period management tables exist yet (planned in Phase 4)
- No parent lot linkage field exists yet (planned in Phase 3)

### Version 1.2.0 (Pre-Alignment) - 2025-11-03

**Lot-Based Cost Layers & Period-End Snapshots Added**

- Added 13 new business rules for lot-based cost layers (BR-LOT-001 to BR-LOT-013)
- Added 6 new business rules for transfer lot numbering (BR-TRANSFER-001 to BR-TRANSFER-006)
- Added 17 new business rules for period-end snapshots (BR-PERIOD-001 to BR-PERIOD-017)
- Documented lot number format and FIFO consumption algorithm
- Documented period status lifecycle: OPEN → CLOSED → LOCKED

**Note**: Version 1.2 described desired future state, not current implementation.

### Version 1.1.0 - 2025-11-03

**Schema Alignment Completed**

- Costing method enum values clarified: `FIFO` and `AVG`
- Updated cost precision to DECIMAL(20,5)
- Added schema references throughout document

---

**Document End**

> 📝 **Note to Authors**:
> - This is a comprehensive requirements document covering all functional and non-functional aspects
> - All FR and BR codes referenced in Use Cases are defined here
> - NFR codes ensure performance, security, usability, reliability, and scalability
> - Data model is conceptual - refer to DD document for implementation details
> - Success metrics should be tracked after implementation
> - Dependencies must be validated before implementation begins
> - Risks and mitigations should be reviewed quarterly
> - Future enhancements inform long-term roadmap planning
