# Business Requirements: Lot-Based Costing & Automatic Lot Creation for FIFO

**Module**: Inventory Management
**Sub-Module**: Lot-Based Costing
**Version**: 1.0
**Last Updated**: 2025-11-07
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

## Overview

This document defines the business requirements for automatic lot record creation in inventory adjustments (stock-in) and the FIFO (First-In-First-Out) costing method implementation. The system ensures complete inventory traceability, accurate cost allocation, and compliance with hospitality industry standards.

---

## Business Context

### Problem Statement

The Carmen ERP system requires accurate inventory valuation and traceability for hospitality operations (hotels, restaurants, F&B). When inventory arrives (via GRN or adjustments), the system must:

1. **Create lot records automatically** to track individual batches
2. **Apply FIFO costing** to ensure oldest inventory is consumed first
3. **Maintain complete audit trails** for regulatory compliance
4. **Support both receipt and adjustment scenarios** with consistent behavior

### Business Drivers

- **Regulatory Compliance**: Food safety regulations require batch-level traceability
- **Cost Accuracy**: Precise COGS calculation for financial reporting
- **Audit Requirements**: Complete transaction history for internal/external audits
- **Operational Excellence**: Real-time inventory visibility at lot level

---

## User Personas

### 1. Storekeeper (Primary User)
**Role**: Receives goods and manages inventory adjustments
**Goals**:
- Record physical stock receipts accurately
- Create inventory adjustments quickly when discrepancies found
- Ensure system reflects actual physical inventory

### 2. Purchasing Manager (Secondary User)
**Role**: Oversees procurement and inventory valuation
**Goals**:
- Verify cost accuracy across receipts
- Review lot-level inventory reports
- Monitor inventory aging and lot expiration

### 3. Financial Controller (Stakeholder)
**Role**: Responsible for financial accuracy and compliance
**Goals**:
- Ensure accurate inventory valuation
- Complete audit trails for financial statements
- FIFO cost flow compliance

### 4. Head Chef / F&B Manager (End User)
**Role**: Consumes inventory for production
**Goals**:
- Understand which lots are available
- Track lot-level consumption for recipes
- Manage inventory expiration (FIFO naturally handles this)

---

## Functional Requirements

### FR-LOT-001: Automatic Lot Creation on GRN Commitment

**Priority**: High
**User Story**: As a Storekeeper, I want lot records created automatically when GRN is committed so that I don't have to manually create them.

**Requirements**:
1. When GRN status changes from DRAFT → COMMITTED, system SHALL automatically generate lot numbers
2. Lot number format MUST follow: `{LOCATION}-{YYMMDD}-{SEQSEQ}`
   - Example: `MK-251107-0001` (Main Kitchen, Nov 7, 2025, sequence 0001)
   - LOCATION: 2-4 character location code
   - YYMMDD: 6-digit date
   - SEQSEQ: 4-digit sequence (0001-9999)
3. Each GRN line item SHALL create one lot record in `tb_inventory_transaction_cost_layer`
4. Lot record MUST include:
   - `lot_no`: Generated lot number
   - `parent_lot_no`: NULL (indicates new lot creation)
   - `transaction_type`: `good_received_note`
   - `in_qty`: Received quantity
   - `out_qty`: 0
   - `cost_per_unit`: From GRN line item
   - `total_cost`: Calculated (in_qty × cost_per_unit)
   - `product_id`: Product identifier
   - `location_id`: Destination location
   - `lot_at_date`: GRN committed date
   - `lot_seq_no`: Extracted sequence number (integer)

**Acceptance Criteria**:
- [x] GRN commitment creates lot records for all line items
- [x] Lot numbers follow standard format with 4-digit sequence
- [x] Lot numbers are unique company-wide
- [x] System prevents duplicate lot numbers
- [x] Transaction completes atomically (all or nothing)
- [x] Audit trail captures creation details (user, timestamp)
- [x] Maximum 9,999 lots per day per location supported

---

### FR-LOT-002: Automatic Lot Creation on Stock-In Adjustments

**Priority**: High
**User Story**: As a Storekeeper, I want lot records created automatically when I create a stock-in adjustment so that new inventory is properly tracked in the lot system.

**Requirements**:
1. When Inventory Adjustment (type=IN) status changes from DRAFT → POSTED, system SHALL automatically generate lot numbers
2. Lot number format: `{LOCATION}-{YYMMDD}-{SEQSEQ}` (4-digit sequence)
3. Each adjustment line item SHALL create one lot record
4. Lot record MUST include:
   - `lot_no`: Generated lot number (e.g., `WH-251107-0015`)
   - `parent_lot_no`: NULL (new lot creation for stock-in)
   - `transaction_type`: `adjustment`
   - `in_qty`: Adjustment quantity (positive)
   - `out_qty`: 0
   - `cost_per_unit`: Average cost from existing lots OR manual entry
   - `total_cost`: Calculated
   - `product_id`, `location_id`, `lot_at_date`, `lot_seq_no`

**Requirements for Cost Determination**:
1. System SHALL calculate average cost from existing lots at the location
2. If no existing lots, system MUST prompt user for cost
3. System SHALL validate cost is within acceptable range (configurable threshold)

**Acceptance Criteria**:
- [x] Stock-in adjustments create lot records
- [x] Lot numbers follow standard format with 4-digit sequence
- [x] Cost is automatically calculated or user-provided
- [x] System prevents posting without valid cost
- [x] Transaction is atomic
- [x] Audit trail is complete

---

### FR-LOT-003: Lot Number Generation Algorithm

**Priority**: High
**User Story**: As a System, I need to generate unique lot numbers automatically so that each lot can be uniquely identified and sorted chronologically.

**Requirements**:
1. Format: `{LOCATION}-{YYMMDD}-{SEQSEQ}`
   - `LOCATION`: 2-4 character location code (e.g., MK, WH, BAR, COLD)
   - `YYMMDD`: 6-digit date (e.g., 251107 for Nov 7, 2025)
   - `SEQSEQ`: 4-digit sequence number (0001-9999)
2. Sequence SHALL reset daily per location
3. System SHALL prevent duplicate lot numbers across all locations
4. Lot number SHALL be stored as VARCHAR (not computed)
5. Lot numbers SHALL naturally sort chronologically (for FIFO)
6. System SHALL store `lot_seq_no` as integer for efficient querying

**Algorithm**:
```typescript
function generateLotNumber(
  locationCode: string,
  receiptDate: Date
): { lotNo: string; seqNo: number } {
  // Format: {LOCATION}-{YYMMDD}-{SEQSEQ}
  const dateStr = format(receiptDate, 'yyMMdd')  // 251107

  // Get next sequence for this location and date
  const lastLot = await db.query(`
    SELECT lot_seq_no
    FROM tb_inventory_transaction_cost_layer
    WHERE location_code = $1
      AND lot_at_date::date = $2::date
    ORDER BY lot_seq_no DESC
    LIMIT 1
  `, [locationCode, receiptDate])

  const nextSeq = lastLot ? lastLot.lot_seq_no + 1 : 1
  const seqStr = nextSeq.toString().padStart(4, '0')  // 4-digit: 0001

  return {
    lotNo: `${locationCode}-${dateStr}-${seqStr}`,
    seqNo: nextSeq
  }
}

// Examples:
// generateLotNumber('MK', new Date('2025-11-07')) → { lotNo: 'MK-251107-0001', seqNo: 1 }
// generateLotNumber('WH', new Date('2025-11-07')) → { lotNo: 'WH-251107-0001', seqNo: 1 }
// (15th lot same day) → { lotNo: 'MK-251107-0015', seqNo: 15 }
```

**Acceptance Criteria**:
- [x] Format is consistent with 4-digit sequence
- [x] Sequence increments correctly within same day/location
- [x] Sequence resets at midnight per location
- [x] No duplicate lot numbers possible
- [x] Lot numbers sort chronologically
- [x] Supports up to 9,999 lots per day per location

---

### FR-LOT-004: FIFO Consumption Algorithm

**Priority**: High
**User Story**: As a System, I need to consume inventory from oldest lots first so that FIFO costing is applied correctly and inventory aging is minimized.

**Requirements**:
1. When inventory is consumed (Issue, Transfer Out, Credit Note, Adjustment Out):
   - System SHALL query available lots ordered by `lot_no ASC`
   - System SHALL consume from oldest lot first
   - If one lot insufficient, system SHALL consume from next oldest lots
   - System SHALL create ADJUSTMENT records for each lot consumed

2. ADJUSTMENT Record Requirements:
   - `lot_no`: Same as parent lot
   - `parent_lot_no`: Reference to source lot
   - `transaction_type`: Based on operation (issue, transfer_out, adjustment, credit_note)
   - `in_qty`: 0
   - `out_qty`: Consumed quantity
   - `cost_per_unit`: From parent lot
   - `total_cost`: Calculated (out_qty × cost_per_unit)

3. Remaining Balance Calculation:
   - System SHALL calculate: `SUM(in_qty) - SUM(out_qty)` per lot
   - Lots with remaining balance = 0 are considered depleted
   - Depleted lots SHALL be excluded from future FIFO consumption queries

**FIFO Query**:
```sql
SELECT lot_no,
       SUM(in_qty) - SUM(out_qty) as remaining_quantity,
       cost_per_unit,
       SUBSTRING(lot_no FROM POSITION('-') + 1 FOR 6) as embedded_date
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND parent_lot_no IS NULL  -- Only LOT transactions (not adjustments)
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- Natural chronological sort (FIFO)
```

**Acceptance Criteria**:
- [x] Oldest lots consumed first
- [x] Multi-lot consumption works correctly
- [x] ADJUSTMENT records created for each consumption
- [x] Parent-child linkage via `parent_lot_no`
- [x] Remaining balances calculated correctly
- [x] Depleted lots excluded from queries

---

### FR-LOT-005: Lot Traceability

**Priority**: Medium
**User Story**: As a Financial Controller, I want to trace any inventory transaction back to its source lot so that I can verify cost accuracy and maintain audit compliance.

**Requirements**:
1. System SHALL maintain complete parent-child relationships via `parent_lot_no`
2. System SHALL support querying:
   - All adjustments for a specific lot
   - Source lot for any consumption
   - Complete consumption history by date
3. System SHALL display lot traceability in:
   - Stock card reports
   - Inventory transaction history
   - Lot movement reports

**Acceptance Criteria**:
- [x] Parent-child relationships maintained
- [x] Queries return accurate traceability data
- [x] Reports show lot-level details
- [x] Audit trail is complete

---

### FR-LOT-006: Stock-In Adjustment UI Workflow

**Priority**: Medium
**User Story**: As a Storekeeper, I want to create stock-in adjustments easily through the UI so that I can quickly record found inventory or corrections.

**Requirements**:
1. Inventory Adjustment page SHALL support:
   - Type selection: IN (Stock-In) or OUT (Stock-Out)
   - Location selection
   - Date selection
   - Reason code selection (Physical Count Variance, Found Items, etc.)
   - Line item entry (Product, Quantity, Unit Cost)

2. For Stock-In (Type=IN):
   - System SHALL auto-calculate cost OR allow manual entry
   - System SHALL validate cost is reasonable
   - System SHALL show calculated total value
   - System SHALL allow saving as DRAFT
   - System SHALL allow POSTING

3. On POST action:
   - System SHALL validate all required fields
   - System SHALL generate lot numbers (4-digit sequence)
   - System SHALL create lot records
   - System SHALL update inventory balances
   - System SHALL create journal entries (if integrated)

**Acceptance Criteria**:
- [x] UI supports all required fields
- [x] Cost calculation/entry works correctly
- [x] Draft functionality works
- [x] POST triggers lot creation
- [x] Validation prevents invalid posts
- [x] User receives confirmation message
- [x] Lot numbers displayed follow 4-digit format

---

### FR-LOT-007: Lot Balance Queries

**Priority**: Medium
**User Story**: As a Head Chef, I want to see current lot balances so that I can understand which inventory is available and prioritize usage of older items.

**Requirements**:
1. System SHALL provide query for available lots:
   ```sql
   SELECT lot_no,
          lot_seq_no,
          SUM(in_qty) - SUM(out_qty) as remaining_quantity,
          cost_per_unit,
          lot_at_date
   FROM tb_inventory_transaction_cost_layer
   WHERE product_id = :product_id
     AND location_id = :location_id
     AND parent_lot_no IS NULL
   GROUP BY lot_no, lot_seq_no, cost_per_unit, lot_at_date
   HAVING SUM(in_qty) - SUM(out_qty) > 0
   ORDER BY lot_no ASC
   ```

2. System SHALL display:
   - Lot number (e.g., MK-251107-0001)
   - Date
   - Remaining quantity
   - Cost per unit
   - Total value

**Acceptance Criteria**:
- [x] Query returns accurate balances
- [x] Only non-depleted lots shown
- [x] Sorted by lot number (oldest first)
- [x] Performance is acceptable (<1 second)
- [x] 4-digit sequence visible in lot number

---

## Non-Functional Requirements

### NFR-LOT-001: Performance
- Lot creation SHALL complete within 2 seconds for GRN with up to 50 line items
- FIFO consumption query SHALL return results within 1 second for up to 100 available lots
- Lot balance calculation SHALL be optimized using database indexes

### NFR-LOT-002: Scalability
- System SHALL support up to 1 million lot records per year
- System SHALL support up to 100,000 active (non-depleted) lots concurrently
- System SHALL support up to 9,999 lots per day per location (4-digit sequence)

### NFR-LOT-003: Data Integrity
- Lot creation SHALL be atomic (all or nothing)
- System SHALL prevent orphaned lot records
- System SHALL maintain referential integrity via foreign keys
- System SHALL use database transactions for all multi-step operations

### NFR-LOT-004: Auditability
- Every lot creation SHALL be logged with user and timestamp
- Every lot consumption SHALL be traceable to source transaction
- System SHALL maintain complete audit trail for minimum 7 years

### NFR-LOT-005: Security
- Only authorized users SHALL create/modify lot records
- Role-based permissions SHALL control access to costing data
- System SHALL log all lot-related operations for security audit

---

## Business Rules

### BR-LOT-001: Lot Number Uniqueness
- Lot numbers MUST be unique company-wide (across all locations)
- System SHALL enforce uniqueness at database level via unique constraint on (`lot_no`, `lot_index`)
- Sequence numbers SHALL increment within same location and date
- Maximum 9,999 lots per day per location (4-digit sequence limit)

### BR-LOT-002: FIFO Consumption Order
- System SHALL always consume from oldest lot first (ORDER BY lot_no ASC)
- Manual lot selection is NOT allowed for consumption
- Exceptions require special authorization and audit logging

### BR-LOT-003: Cost Method Configuration
- Costing method is company-wide setting (FIFO or Periodic Average)
- Changing costing method mid-period is NOT allowed
- Costing method change requires period-end process

### BR-LOT-004: Lot Balance Calculation
- Remaining balance SHALL always be calculated as: `SUM(in_qty) - SUM(out_qty)`
- No separate `remaining_quantity` field SHALL be maintained
- Calculation ensures single source of truth and complete audit trail

### BR-LOT-005: Stock-In Adjustment Cost
- For stock-in adjustments, cost SHOULD be average of existing lots at location
- If no existing lots, user MUST provide cost manually
- Cost MUST be within acceptable range (configurable: ±20% of recent average)

### BR-LOT-006: Transaction Status and Lot Creation
- Only POSTED/COMMITTED transactions create lot records
- DRAFT transactions SHALL NOT affect lot system
- CANCELLED/VOIDED transactions SHALL create reversing lot records

### BR-LOT-007: Parent Lot Linkage
- New lot creation: `parent_lot_no` = NULL
- Consumption/adjustment: `parent_lot_no` = source lot number
- System SHALL enforce referential integrity

### BR-LOT-008: Lot Number Format
- Format MUST be: `{LOCATION}-{YYMMDD}-{SEQSEQ}`
- LOCATION: 2-4 uppercase alphanumeric characters
- YYMMDD: Exactly 6 digits
- SEQSEQ: Exactly 4 digits (0001-9999)
- Total length: 14-16 characters

---

## Dependencies

### System Dependencies
- Database: PostgreSQL with Prisma ORM
- Schema: `tb_inventory_transaction_cost_layer` table exists
- Enums: `enum_transaction_type` configured
- Period management: `tb_period` table for period tracking

### Module Dependencies
- Procurement: GRN commitment triggers lot creation
- Inventory Management: Adjustments, transfers trigger lot operations
- Finance: Costing configuration, journal entry integration

---

## Constraints

1. **Technical Constraints**:
   - Lot number format is fixed: `{LOCATION}-{YYMMDD}-{SEQSEQ}`
   - Maximum 9,999 lots per day per location (4-digit sequence limit)
   - Parent-child lot relationships limited to one level (no recursive)

2. **Business Constraints**:
   - Costing method is company-wide (cannot vary by product/location)
   - Period management affects lot posting (cannot post to closed periods)
   - Manual lot selection not allowed for consumption (FIFO enforced)

3. **Operational Constraints**:
   - Lot creation requires location code to be configured
   - User must have proper permissions to post transactions
   - Network connectivity required for real-time lot updates

---

## Success Criteria

### Measurement Criteria

1. **Accuracy**: 100% of GRNs and stock-in adjustments create lot records correctly
2. **Performance**: 95% of lot operations complete within performance targets
3. **Traceability**: 100% of consumption transactions traceable to source lots
4. **Compliance**: Zero audit findings related to lot-level tracking
5. **User Satisfaction**: Storekeeper training completed in < 30 minutes

### Quality Metrics

- **Data Quality**: 0 orphaned lot records, 0 duplicate lot numbers
- **Cost Accuracy**: COGS calculations reconcile to 100% with financial statements
- **Audit Trail**: Complete transaction history for all lot operations
- **Sequence Capacity**: System handles up to 9,999 lots per day per location

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Duplicate lot numbers | High | Low | Database unique constraint, sequence management |
| Sequence exhaustion (>9999 per day) | Medium | Very Low | Alert at 8000, manual intervention process |
| Performance degradation | Medium | Medium | Database indexes, query optimization |
| User error in manual cost entry | Medium | Medium | Validation rules, reasonable range checks |
| Network failure during posting | Medium | Low | Atomic transactions, rollback on failure |
| Insufficient training | Low | Medium | User documentation, in-app help |

---

## Implementation Notes

### Phase 1 (Current Sprint): Core Lot Creation
- Automatic lot generation on GRN commitment (4-digit sequence)
- Automatic lot generation on stock-in adjustments (4-digit sequence)
- Basic FIFO consumption algorithm
- Lot balance queries

### Phase 2 (Future): Enhanced Features
- Lot expiration tracking
- Lot recall management
- Lot-level costing reports
- Period-end lot snapshots
- Sequence monitoring and alerting

---

## Related Documents

- [UC-lot-based-costing.md](./UC-lot-based-costing.md) - Use Cases
- [TS-lot-based-costing.md](./TS-lot-based-costing.md) - Technical Specification
- [DS-lot-based-costing.md](./DS-lot-based-costing.md) - Data Schema
- [FD-lot-based-costing.md](./FD-lot-based-costing.md) - Flow Diagrams
- [VAL-lot-based-costing.md](./VAL-lot-based-costing.md) - Validation Rules
- [SM-costing-methods.md](../../shared-methods/inventory-valuation/SM-costing-methods.md) - Costing Methods Specification
- [SM-transaction-types-and-cost-layers.md](../../shared-methods/inventory-valuation/SM-transaction-types-and-cost-layers.md) - Transaction Types Reference

---

**Document Status**: ✅ Active
**Review Date**: 2025-12-07
**Owner**: Product Management Team
**Stakeholders**: Finance, Operations, IT
