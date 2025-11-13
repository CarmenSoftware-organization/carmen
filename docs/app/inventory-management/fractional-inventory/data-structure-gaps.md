# Data Structure Gaps: Fractional Inventory Management

## Document Information
- **Module**: Inventory Management - Fractional Inventory
- **Version**: 1.0.0
- **Last Updated**: 2025-01-12
- **Status**: Gap Analysis

## Related Documents
- [Business Requirements](./BR-fractional-inventory.md)
- [Use Cases](./UC-fractional-inventory.md)
- [Technical Specification](./TS-fractional-inventory.md)
- [Data Schema](./DS-fractional-inventory.md)
- [Existing Schema](/docs/app/data-struc/schema.prisma)

---

## 1. Executive Summary

### 1.1 Purpose

This document analyzes gaps between the **existing database schema** (schema.prisma) and the **requirements for Fractional Inventory Management** as defined in the BR, UC, and TS documents.

### 1.2 Key Findings

**Current State**:
- ❌ **NO fractional inventory tables exist in schema.prisma**
- ✅ Standard inventory tables exist (tb_product, tb_inventory_transaction, tb_location)
- ✅ Base enum types exist (enum_doc_status, enum_physical_count_type)

**Requirements**:
- **5 new tables** needed for fractional inventory functionality
- **4 new enums** needed for state/quality/alert tracking
- **Multiple indexes** needed for performance
- **Several triggers** needed for automation

**Impact**: **HIGH** - Requires significant schema additions to support fractional inventory module

---

## 2. Existing Schema Analysis

### 2.1 Relevant Existing Tables

**tb_product**:
```prisma
model tb_product {
  id                  String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code                String  @unique @db.VarChar
  name                String  @db.VarChar
  local_name          String? @db.VarChar
  description         String? @db.VarChar
  product_status_type enum_product_status_type? @default(active)
  // ... other fields

  info      Json?   @db.Json  // ✅ Can store fractional config here temporarily
  dimension Json?   @db.Json
  // ... relations
}
```

**Assessment**: ✅ **Can be extended with JSONB** for fractional configuration temporarily, but dedicated table recommended.

---

**tb_inventory_transaction**:
```prisma
model tb_inventory_transaction {
  id                        String                    @id @db.Uuid
  doc_type                  enum_inventory_doc_type?
  doc_id                    String?                   @db.Uuid
  doc_no                    String?                   @db.VarChar
  doc_date                  DateTime?                 @db.Timestamptz(6)

  location_id               String?                   @db.Uuid
  product_id                String                    @db.Uuid

  transaction_qty           Decimal?                  @db.Decimal(20, 5)
  transaction_qty_unit_id   String?                   @db.Uuid
  transaction_base_qty      Decimal?                  @db.Decimal(20, 5)

  balance_qty               Decimal?                  @db.Decimal(20, 5)
  balance_qty_unit_id       String?                   @db.Uuid
  balance_base_qty          Decimal?                  @db.Decimal(20, 5)

  // ... cost tracking fields
  info      Json?   @db.Json
  dimension Json?   @db.Json
  // ... other fields
}
```

**Assessment**: ✅ **Handles whole unit transactions** but ❌ **CANNOT track fractional portions, states, or quality**. Fractional inventory needs separate tracking.

---

**tb_location**:
```prisma
model tb_location {
  id            String               @id @db.Uuid
  code          String               @unique @db.VarChar
  name          String               @db.VarChar
  location_type enum_location_type?  @default(inventory)
  // ... other fields
}
```

**Assessment**: ✅ **Fully compatible** - Can be used as foreign key for location-based fractional stock.

---

### 2.2 Existing Enums - Reusability Analysis

**enum_doc_status**:
```prisma
enum enum_doc_status {
  draft
  in_progress
  completed
  cancelled
  voided
}
```

**Assessment**: ❌ **NOT suitable for fractional states** (RAW, PREPARED, PORTIONED, PARTIAL, COMBINED, WASTE). Need new enum.

---

**enum_physical_count_type**:
```prisma
enum enum_physical_count_type {
  no
  yes
}
```

**Assessment**: ❌ **NOT relevant** to fractional inventory. No reuse opportunity.

---

**enum_activity_action & enum_activity_entity_type**:
```prisma
enum_activity_action {
  // ... existing actions
}

enum enum_activity_entity_type {
  // ... existing entity types
}
```

**Assessment**: ✅ **Can be extended** to add fractional inventory entity types:
- Add `fractional_item` to enum_activity_entity_type
- Add `fractional_stock` to enum_activity_entity_type
- Add `conversion` to enum_activity_action

---

## 3. Required New Database Objects

### 3.1 New Tables Needed

**Priority 1 (Critical - Core Functionality)**:

| Table Name | Purpose | Estimated Rows | Indexes |
|------------|---------|----------------|---------|
| `tb_fractional_item` | Item configuration for fractional tracking | 100-500 | 4 |
| `tb_fractional_stock` | Current inventory state with portions | 1,000-10,000 | 7 |
| `tb_conversion_record` | Audit trail of conversions | 10,000-100,000 | 6 |

**Priority 2 (High - Smart Features)**:

| Table Name | Purpose | Estimated Rows | Indexes |
|------------|---------|----------------|---------|
| `tb_inventory_alert` | Smart alerts and recommendations | 500-5,000 | 4 |
| `tb_conversion_recommendation` | AI-generated conversion suggestions | 100-1,000 | 3 |

**Total**: 5 new tables, 24 new indexes

---

### 3.2 New Enums Needed

**FractionalState Enum**:
```prisma
enum enum_fractional_state {
  raw        // Original whole items
  prepared   // Prepared but not portioned
  portioned  // Divided into portions
  partial    // Partially consumed
  combined   // Re-combined from portions
  waste      // Marked as waste
}
```

**QualityGrade Enum**:
```prisma
enum enum_quality_grade {
  excellent  // Within maxQualityHours
  good       // After maxQuality, before 75% shelf life
  fair       // 75-90% shelf life
  poor       // 90-100% shelf life
  expired    // Past shelf life
}
```

**ConversionType Enum**:
```prisma
enum enum_conversion_type {
  split      // Whole → Portions
  combine    // Portions → Whole
  prepare    // RAW → PREPARED
  portion    // PREPARED → PORTIONED
}
```

**AlertType Enum**:
```prisma
enum enum_alert_type {
  quality_degrading
  portion_low
  expiry_warning
  conversion_optimal
  waste_high
  reserved_high
  quality_poor
}
```

**AlertSeverity Enum**:
```prisma
enum enum_alert_severity {
  low
  medium
  high
  critical
}
```

**AlertStatus Enum**:
```prisma
enum enum_alert_status {
  active
  acknowledged
  resolved
  dismissed
  auto_resolved
}
```

**RecommendationStatus Enum**:
```prisma
enum enum_recommendation_status {
  pending
  accepted
  rejected
  expired
  actioned
}
```

**Total**: 7 new enums

---

### 3.3 New Triggers Needed

| Trigger Name | Purpose | Table | Complexity |
|--------------|---------|-------|------------|
| `trg_update_quality_grade` | Auto-calculate quality based on time | tb_fractional_stock | Medium |
| `trg_calculate_available_portions` | Auto-calculate available = total - reserved | tb_fractional_stock | Low |
| `trg_calculate_expiry_date` | Auto-calculate expiry from preparedAt + shelfLife | tb_fractional_stock | Low |
| `trg_audit_conversion` | Log all conversion operations to activity log | tb_conversion_record | Low |

**Total**: 4 new triggers

---

## 4. Gap Analysis by Table

### 4.1 tb_fractional_item (NEW TABLE REQUIRED)

**Purpose**: Store configuration for items supporting fractional sales

**Why Existing Tables Cannot Support This**:
- ❌ `tb_product.info` JSONB field could store config temporarily, but:
  - No schema validation at database level
  - No efficient querying on portion sizes
  - No foreign key constraints for data integrity
  - Performance issues for complex queries
  - Mixing product data with fractional config is poor design

**Required Fields** (26 fields total):
- Core: id, itemCode, itemName, category, baseUnit
- Portions: availablePortions (JSONB array), defaultPortionId
- Quality: shelfLifeHours, maxQualityHours, temperatureRequired
- Conversion: expectedWastePercent, baseCostPerUnit, conversionCostPerUnit
- Automation: autoConversionEnabled, minPortionThreshold
- System: isActive, createdAt, createdBy, updatedAt, updatedBy, deletedAt

**JSONB Structures**:
```typescript
// availablePortions field
interface PortionSize {
  id: string;
  name: string;
  portionsPerWhole: number;
  displayOrder: number;
  isActive: boolean;
}
```

**Indexes Needed**:
1. Primary key on `id`
2. Unique index on `itemCode`
3. Index on `category`
4. Index on `isActive`

---

### 4.2 tb_fractional_stock (NEW TABLE REQUIRED)

**Purpose**: Track current inventory with multi-state lifecycle and portions

**Why Existing Tables Cannot Support This**:
- ❌ `tb_inventory_transaction` tracks whole unit transactions with balance_qty
- ❌ **CANNOT track**:
  - Multiple states (RAW, PREPARED, PORTIONED, PARTIAL, COMBINED, WASTE)
  - Portion quantities (e.g., 3.5 portions available from 1.5 pizzas)
  - Reserved portions (allocated to orders)
  - Quality degradation over time
  - State transition dates
  - Partial quantity (0.00-0.99 of a whole unit)

**Required Fields** (30 fields total):
- Item: itemCode (FK), locationId (FK)
- State: currentState, stateTransitionDate
- Quantities: wholeUnits, partialQuantity, totalPortions, reservedPortions, availablePortions
- Original: originalWholeUnits, originalTotalPortions
- Quality: qualityGrade, qualityUpdatedAt, expiryDate, preparedAt
- Conversion: lastConversionId, lastConversionDate, lastConversionType
- Alerts: hasQualityAlert, hasQuantityAlert, hasExpiryAlert
- System: createdAt, createdBy, updatedAt, updatedBy, deletedAt

**Indexes Needed**:
1. Primary key on `id`
2. Composite on `(itemCode, locationId)`
3. Index on `currentState`
4. Index on `qualityGrade`
5. Index on `locationId`
6. Partial index on `expiryDate WHERE expiryDate IS NOT NULL`
7. Composite partial index on alert flags

---

### 4.3 tb_conversion_record (NEW TABLE REQUIRED)

**Purpose**: Immutable audit trail of all conversion operations

**Why Existing Tables Cannot Support This**:
- ❌ `tb_activity` is generic audit log, not specialized for conversions
- ❌ `tb_inventory_transaction` tracks balance changes, not conversion operations
- ❌ **CANNOT track**:
  - Before/after states and quantities
  - Portion size details
  - Conversion efficiency calculations
  - Waste generation tracking
  - Quality impact assessment
  - Business context (reason, notes)

**Required Fields** (36 fields total):
- References: itemCode (FK), stockId (FK), conversionType
- Context: performedAt, performedBy, locationId
- Before State: beforeState, beforeWholeUnits, beforePartialQty, beforeTotalPortions, beforeQualityGrade
- After State: afterState, afterWholeUnits, afterPartialQty, afterTotalPortions, afterQualityGrade
- Calculations: unitsConverted, portionsCreated, expectedPortions, wasteGenerated, conversionEfficiency, conversionCost
- Portion: portionSizeId, portionSizeName, portionsPerWhole
- Quality: qualityImpact, qualityNotes
- Business: reason, notes
- Validation: isValidated, validatedAt, validatedBy, validationNotes
- System: createdAt

**Indexes Needed**:
1. Primary key on `id`
2. Composite on `(itemCode, performedAt DESC)`
3. Index on `stockId`
4. Index on `conversionType`
5. Index on `performedAt DESC`
6. Index on `performedBy`
7. Index on `locationId`

---

### 4.4 tb_inventory_alert (NEW TABLE REQUIRED)

**Purpose**: Smart alerts for quality, portions, and conversion timing

**Why Existing Tables Cannot Support This**:
- ❌ No alert/notification system exists in current schema
- ❌ Generic notification table would not support:
  - Alert type classification (quality, portion, expiry, conversion)
  - Severity levels
  - Recommended actions (JSONB array)
  - Context-specific data for each alert type
  - Auto-resolution timing

**Required Fields** (20 fields total):
- Target: itemCode (FK), stockId (FK), locationId
- Classification: alertType, severity
- Content: title, message
- Actions: recommendedActions (JSONB)
- Context: contextData (JSONB)
- Lifecycle: status, triggeredAt, acknowledgedAt, acknowledgedBy, resolvedAt, resolvedBy, dismissedAt, dismissedBy
- Auto: autoResolveAt
- System: createdAt, updatedAt

**JSONB Structures**:
```typescript
// recommendedActions field
interface RecommendedAction {
  actionType: string;
  actionLabel: string;
  priority: number;
  estimatedTime: number;
  estimatedCost?: number;
  parameters?: Record<string, any>;
}

// contextData field (varies by alert type)
interface QualityDegradingContext {
  currentQuality: string;
  nextQuality: string;
  hoursUntilNextGrade: number;
  currentShelfLifePercent: number;
  expiryDate: string;
}
```

**Indexes Needed**:
1. Primary key on `id`
2. Composite partial on `(itemCode, status) WHERE status = 'ACTIVE'`
3. Composite on `(alertType, severity)`
4. Composite partial on `(locationId, status) WHERE status IN ('ACTIVE', 'ACKNOWLEDGED')`
5. Index on `triggeredAt DESC`

---

### 4.5 tb_conversion_recommendation (NEW TABLE REQUIRED)

**Purpose**: AI-generated recommendations for optimal conversion timing

**Why Existing Tables Cannot Support This**:
- ❌ No recommendation system exists in current schema
- ❌ Required to track:
  - Recommendation scoring (confidence, priority)
  - Demand analysis (JSONB)
  - Timing (optimal time, validity)
  - Outcome tracking (was actioned, actual results)
  - Lifecycle (pending, accepted, rejected, expired)

**Required Fields** (25 fields total):
- Target: itemCode (FK), locationId
- Recommendation: recommendationType, recommendedAction
- Scoring: confidenceScore, priorityScore
- Parameters: recommendedUnits, recommendedPortionId, expectedYield, estimatedWaste, estimatedCost, estimatedRevenue
- Analysis: demandAnalysis (JSONB)
- Timing: optimalConversionTime, validUntil
- Lifecycle: status, generatedAt, acceptedAt, acceptedBy, rejectedAt, rejectedBy, expiredAt
- Outcome: wasActioned, conversionRecordId, actualEfficiency, actualWaste
- System: createdAt, updatedAt

**JSONB Structures**:
```typescript
// demandAnalysis field
interface DemandAnalysis {
  forecastPeriodHours: number;
  predictedDemand: number;
  currentAvailability: number;
  gap: number;
  historicalAverageSales: number;
  recentTrend: string;
  dayOfWeek: string;
  timeOfDay: string;
  seasonalFactor: number;
}
```

**Indexes Needed**:
1. Primary key on `id`
2. Composite partial on `(itemCode, locationId, status) WHERE status = 'PENDING'`
3. Index on `optimalConversionTime`
4. Index on `priorityScore`

---

## 5. Naming Convention Alignment

### 5.1 Current Schema Patterns

**Table Naming**:
- Pattern: `tb_<entity_name>`
- Examples: `tb_product`, `tb_inventory_transaction`, `tb_location`
- ✅ **Aligned**: All proposed tables follow `tb_` prefix

**Enum Naming**:
- Pattern: `enum_<entity>_<attribute>`
- Examples: `enum_doc_status`, `enum_product_status_type`, `enum_physical_count_type`
- ⚠️ **Needs adjustment**: Proposed enums should follow pattern:
  - `enum_fractional_state` (good)
  - `enum_quality_grade` (good)
  - `enum_conversion_type` (good)
  - `enum_alert_type` (good)

**Field Naming**:
- Pattern: `snake_case`
- Examples: `product_id`, `doc_date`, `created_at`, `created_by_id`
- ✅ **Aligned**: All proposed fields follow snake_case

**ID Fields**:
- Pattern: UUID with `@db.Uuid` decorator
- Default: `@default(dbgenerated("gen_random_uuid()"))`
- ✅ **Aligned**: All proposed tables use UUID primary keys

**Common Fields**:
- All tables include: `created_at`, `created_by_id`, `updated_at`, `updated_by_id`, `deleted_at`, `deleted_by_id`
- Most tables include: `info` (Json), `dimension` (Json)
- ⚠️ **Recommendation**: Add these common fields to fractional tables for consistency

---

### 5.2 Recommended Adjustments to DS Document

**Add Common Fields**:
```prisma
// Add to all fractional tables
info        Json?   @db.Json       // Flexible metadata
dimension   Json?   @db.Json       // Dimension tracking
doc_version Decimal @default(0) @db.Decimal  // Version control
```

**Adjust Enum Names** (if needed for consistency):
```prisma
// Current proposal is already aligned
enum enum_fractional_state { ... }
enum enum_quality_grade { ... }
enum enum_conversion_type { ... }
enum enum_alert_type { ... }
enum enum_alert_severity { ... }
enum enum_alert_status { ... }
enum enum_recommendation_status { ... }
```

**Adjust Foreign Key Naming**:
```prisma
// Current: itemCode String
// Better: item_code String (snake_case for consistency)

// Current: locationId String
// Better: location_id String (snake_case for consistency)
```

---

## 6. Integration Points with Existing Schema

### 6.1 Foreign Key Relationships

**tb_fractional_item**:
```prisma
// Proposed relationship to existing table
item_code String @db.VarChar

// Should reference:
tb_product @relation(fields: [item_code], references: [code])
```

**tb_fractional_stock**:
```prisma
// Proposed relationships
item_code   String @db.VarChar
location_id String @db.Uuid

// Should reference:
tb_fractional_item @relation(fields: [item_code], references: [item_code])
tb_location @relation(fields: [location_id], references: [id])
```

**tb_conversion_record**:
```prisma
// Proposed relationships
item_code  String @db.VarChar
stock_id   String @db.Uuid

// Should reference:
tb_fractional_item  @relation(fields: [item_code], references: [item_code])
tb_fractional_stock @relation(fields: [stock_id], references: [id])
```

---

### 6.2 Activity Log Integration

**Extend enum_activity_entity_type**:
```prisma
enum enum_activity_entity_type {
  // ... existing types
  fractional_item
  fractional_stock
  conversion_record
  inventory_alert
  conversion_recommendation
}
```

**Extend enum_activity_action**:
```prisma
enum enum_activity_action {
  // ... existing actions
  split      // For conversion operations
  combine    // For conversion operations
  portion    // For conversion operations
  prepare    // For conversion operations
}
```

---

## 7. Migration Impact Analysis

### 7.1 Database Migration Complexity

**Complexity Score**: **HIGH**

| Aspect | Impact | Effort |
|--------|--------|--------|
| New Tables | 5 tables | High |
| New Enums | 7 enums | Medium |
| New Indexes | 24 indexes | Medium |
| New Triggers | 4 triggers | Medium |
| Schema Updates | Enum extensions | Low |
| Data Migration | None (new module) | None |
| **Total Effort** | - | **3-4 weeks** |

---

### 7.2 Rollback Strategy

**Phase 1: Core Tables** (Can rollback independently)
- Create `tb_fractional_item`
- Create `tb_fractional_stock`
- Create `tb_conversion_record`
- Create necessary enums

**Phase 2: Smart Features** (Dependent on Phase 1)
- Create `tb_inventory_alert`
- Create `tb_conversion_recommendation`

**Rollback Plan**:
```sql
-- Rollback Phase 2
DROP TABLE IF EXISTS tb_conversion_recommendation CASCADE;
DROP TABLE IF EXISTS tb_inventory_alert CASCADE;
DROP TYPE IF EXISTS enum_recommendation_status;
DROP TYPE IF EXISTS enum_alert_status;
DROP TYPE IF EXISTS enum_alert_severity;
DROP TYPE IF EXISTS enum_alert_type;

-- Rollback Phase 1
DROP TABLE IF EXISTS tb_conversion_record CASCADE;
DROP TABLE IF EXISTS tb_fractional_stock CASCADE;
DROP TABLE IF EXISTS tb_fractional_item CASCADE;
DROP TYPE IF EXISTS enum_conversion_type;
DROP TYPE IF EXISTS enum_quality_grade;
DROP TYPE IF EXISTS enum_fractional_state;
```

---

### 7.3 Testing Requirements

**Unit Tests** (Database Level):
- [ ] Test all constraints (CHECK, UNIQUE, NOT NULL)
- [ ] Test all foreign key relationships
- [ ] Test all triggers
- [ ] Test all indexes (query performance)

**Integration Tests** (Application Level):
- [ ] Test CRUD operations on all tables
- [ ] Test conversion workflows
- [ ] Test alert generation
- [ ] Test recommendation generation
- [ ] Test quality degradation automation

**Performance Tests**:
- [ ] Test query performance with 10,000 stock records
- [ ] Test conversion record insertion (100/sec target)
- [ ] Test dashboard query performance (<2sec target)
- [ ] Test alert generation job (<1min target)

---

## 8. Recommendations

### 8.1 Immediate Actions

1. **Review & Approve Gaps** (1 day)
   - Stakeholder review of gap analysis
   - Approve new table designs
   - Approve enum additions

2. **Update DS Document** (2 days)
   - Align field naming with schema.prisma conventions
   - Add common fields (info, dimension, doc_version)
   - Adjust foreign key naming to snake_case
   - Add explicit relations to existing tables

3. **Create Migration Scripts** (3 days)
   - Phase 1: Core tables (tb_fractional_item, tb_fractional_stock, tb_conversion_record)
   - Phase 2: Smart features (tb_inventory_alert, tb_conversion_recommendation)
   - Create rollback scripts

4. **Update schema.prisma** (1 day)
   - Add all new models
   - Add all new enums
   - Update existing enums (activity types)
   - Generate Prisma client

5. **Testing** (5 days)
   - Database constraint testing
   - Trigger testing
   - Performance testing
   - Integration testing

---

### 8.2 Long-term Considerations

**Performance Monitoring**:
- Monitor conversion_record table growth (potentially 100K+ rows/year)
- Implement archival strategy for old conversion records
- Monitor index bloat and rebuild quarterly

**Future Enhancements**:
- Consider partitioning tb_conversion_record by date (when exceeds 1M rows)
- Consider materialized view for dashboard metrics (if query >2sec)
- Consider time-series database for quality tracking history

**Documentation**:
- Keep DS document in sync with schema.prisma
- Document all custom triggers and their behavior
- Maintain data dictionary for JSONB structures

---

## 9. Conclusion

**Gap Summary**:
- **5 new tables** required (none exist currently)
- **7 new enums** required
- **24 new indexes** required
- **4 new triggers** required
- **2 enum extensions** required (activity types)

**Recommendation**: **APPROVE** schema additions with adjustments for naming convention alignment.

**Next Steps**:
1. Update DS document with adjusted field names
2. Create Prisma migration scripts
3. Test migration on dev environment
4. Deploy to staging for integration testing
5. Deploy to production after validation

---

**Document End**
