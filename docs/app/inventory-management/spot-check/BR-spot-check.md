# Business Requirements: Spot Check

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


## Overview

The Spot Check sub-module enables quick, targeted verification of inventory quantities for selected items at any location. Unlike full physical counts that verify all inventory, spot checks focus on specific products or categories that require immediate verification, such as high-value items, fast-moving products, or items with suspected discrepancies.

Spot checks are conducted on-demand throughout the month and provide a rapid mechanism to identify and correct inventory variances before they impact operations. They support just-in-time inventory accuracy without the overhead of full physical counts.

The system integrates with the Inventory Transaction System to retrieve expected quantities and post adjustments when variances are found, maintaining real-time inventory accuracy.

## Business Objectives

1. **Rapid Verification**: Enable quick spot verification of inventory accuracy for selected items without requiring full physical count
2. **Variance Detection**: Identify and correct inventory discrepancies immediately upon detection rather than waiting for monthly counts
3. **Risk Management**: Focus verification efforts on high-value, high-risk, or problem items that require closer monitoring
4. **Operational Continuity**: Allow inventory verification without disrupting normal operations or requiring extensive staff time
5. **Loss Prevention**: Detect potential theft, damage, or process errors through targeted sampling and investigation
6. **Compliance Support**: Provide evidence of ongoing inventory control processes for audit and regulatory requirements
7. **Data Quality**: Maintain inventory accuracy through frequent, targeted verification of critical items
8. **Process Improvement**: Identify patterns in variances to improve inventory management processes and controls

## Key Stakeholders

- **Primary Users**: Storekeepers, Inventory Coordinators - Conduct spot checks daily
- **Secondary Users**: Department Supervisors - Initiate and review spot checks for their areas
- **Approvers**: Inventory Managers - Approve significant variances, review spot check frequency and effectiveness
- **Administrators**: System Administrators - Configure spot check parameters, maintain product categories
- **Reviewers**: Internal Auditors - Review spot check history and variance patterns for compliance
- **Support**: IT Support - Troubleshoot system issues, provide training on spot check procedures

---

## Functional Requirements

### FR-SC-001: Initiate Spot Check
**Priority**: Critical

The system must allow authorized users to create a new spot check for a specific location with selected products.

**Acceptance Criteria**:
- Users can create spot check by selecting location and products
- System pre-populates count_stock_type = 'spot' automatically
- System generates unique spot check number (format: SPOT-YYYY-NNNNNN)
- System allows adding products individually or by category
- System retrieves expected quantities from current inventory balances
- Initial status is 'pending' upon creation
- Spot check can include 1 to 50 products (configurable limit)
- System validates user has access to selected location

**Related Requirements**: FR-SC-002, FR-SC-003, VAL-SC-001, VAL-SC-101

---

### FR-SC-002: Select Products for Spot Check
**Priority**: High

The system must provide flexible methods to select products for spot check verification.

**Acceptance Criteria**:
- Users can search and add products individually by name or code
- Users can add all products from a category (e.g., "Dairy", "Proteins")
- Users can add products from a predefined spot check template
- System displays product information (name, code, current quantity, last count date)
- Users can remove products before starting spot check
- System prevents adding duplicate products to same spot check
- System shows warning if product has no inventory transactions (no expected quantity)
- Maximum 50 products per spot check (configurable)

**Related Requirements**: FR-SC-001, FR-SC-003, BR-SC-003

---

### FR-SC-003: Enter Counted Quantities
**Priority**: Critical

The system must allow users to enter actual physical quantities for each product in the spot check.

**Acceptance Criteria**:
- Users can enter actual quantities using numeric keypad or barcode scanner
- System displays expected quantity next to entry field for reference
- System calculates and displays variance immediately upon entry
- System marks item as 'counted' when actual quantity entered
- Users can update actual quantity before completing spot check
- System validates actual quantity >= 0
- System supports fractional quantities (2 decimal places)
- System auto-saves entered quantities (draft mode)

**Related Requirements**: FR-SC-004, FR-SC-005, VAL-SC-014

---

### FR-SC-004: Review Variance Analysis
**Priority**: High

The system must calculate and display variance information for each product in the spot check.

**Acceptance Criteria**:
- System automatically calculates variance_qty = actual_qty - expected_qty
- System automatically calculates variance_pct = (variance_qty / expected_qty) * 100
- System displays variance with visual indicators (green=match, yellow=small variance, red=high variance)
- High variance threshold: > 5% or > $100 value (configurable)
- Users can add notes explaining variances
- System flags items requiring supervisor approval
- Users can filter/sort by variance percentage or value
- System displays summary statistics (total items, items with variance, total variance value)

**Related Requirements**: FR-SC-005, FR-SC-006, VAL-SC-203

---

### FR-SC-005: Complete Spot Check
**Priority**: Critical

The system must allow users to complete spot check and post inventory adjustments.

**Acceptance Criteria**:
- Users can complete spot check after all selected items are counted
- System validates all items have actual quantities entered
- System posts inventory adjustment transactions for items with variance
- System updates inventory balances in real-time
- System sets status to 'completed' and records end_date
- System prevents further modifications after completion
- System creates audit trail of all adjustments
- High-variance items (>5% or >$100) require supervisor approval before completion

**Related Requirements**: FR-SC-004, FR-SC-006, VAL-SC-102, VAL-SC-105

---

### FR-SC-006: Approve High Variance Items
**Priority**: High

The system must route spot checks with high variance items for supervisor approval.

**Acceptance Criteria**:
- System identifies high variance items (>5% or >$100 configured threshold)
- System notifies supervisor when approval required
- Supervisors can review variance details and notes
- Supervisors can approve or reject individual high variance items
- System prevents completion until high variance items approved or resolved
- System records approver details and approval timestamp
- System allows supervisor to request recount before approval

**Related Requirements**: FR-SC-004, FR-SC-005, VAL-SC-103

---

### FR-SC-007: Cancel Spot Check
**Priority**: Medium

The system must allow users to cancel spot check before completion.

**Acceptance Criteria**:
- Users can cancel spot check in 'pending' or 'in_progress' status
- System prompts for cancellation reason
- System changes status to 'cancelled'
- Cancelled spot checks retain entered data for reference
- System does not post adjustments for cancelled spot checks
- Only authorized users (supervisor+) can cancel in-progress spot checks
- System preserves audit trail of cancellation

**Related Requirements**: FR-SC-005, VAL-SC-201

---

### FR-SC-008: View Spot Check History
**Priority**: Medium

The system must provide comprehensive history and reporting of spot checks.

**Acceptance Criteria**:
- Users can view list of all spot checks for their locations
- List displays spot check number, date, location, item count, status, variance summary
- Users can filter by date range, location, status, product
- Users can search by spot check number or product name
- System displays spot check details including all line items and variances
- Users can export spot check data to CSV/Excel
- System shows variance trends over time
- Supervisors can view team performance metrics

**Related Requirements**: FR-SC-009, BR-SC-006

---

### FR-SC-009: Create Spot Check Templates
**Priority**: Low

The system must allow users to create reusable spot check templates for frequently checked product groups.

**Acceptance Criteria**:
- Users can create named templates (e.g., "Daily High-Value Check", "Dairy Products")
- Templates store predefined list of products
- Users can add/remove products from template
- Users can create new spot check from template with one click
- System applies template products to new spot check
- Templates are location-specific or global (configurable)
- Users can share templates with team members

**Related Requirements**: FR-SC-001, FR-SC-002

---

## Business Rules

### General Rules
- **BR-SC-001**: Spot checks can be created anytime, on-demand, without scheduling restrictions
- **BR-SC-002**: Spot checks must include at least 1 product and maximum 50 products (configurable)
- **BR-SC-003**: Products can only appear once in any given spot check
- **BR-SC-004**: Spot checks use the same database tables as physical counts, differentiated by count_stock_type = 'spot'
- **BR-SC-005**: Expected quantities are retrieved from current closing balance in inventory transactions

### Data Validation Rules
- **BR-SC-006**: Actual quantity must be non-negative (>= 0)
- **BR-SC-007**: Actual quantity supports up to 2 decimal places for fractional units
- **BR-SC-008**: Variance calculations must use formula: variance_qty = actual_qty - expected_qty
- **BR-SC-009**: Variance percentage calculated as: variance_pct = (variance_qty / expected_qty) * 100
- **BR-SC-010**: If expected_qty = 0, variance_pct is NULL

### Workflow Rules
- **BR-SC-011**: Spot check status follows: pending → in_progress → completed OR pending → cancelled
- **BR-SC-012**: In-progress spot checks can be saved as draft and resumed later
- **BR-SC-013**: Only storekeepers can create and enter quantities for spot checks
- **BR-SC-014**: Supervisors must approve high variance items before spot check completion
- **BR-SC-015**: Completed spot checks cannot be modified or deleted
- **BR-SC-016**: Cancelled spot checks retain data but do not post adjustments

### Calculation Rules
- **BR-SC-017**: Variance quantity = actual quantity - expected quantity
- **BR-SC-018**: Variance percentage = (variance quantity / expected quantity) * 100
- **BR-SC-019**: Variance value = variance quantity * product cost
- **BR-SC-020**: High variance threshold: > 5% OR variance value > $100 (configurable)
- **BR-SC-021**: Total variance value = SUM(variance_qty * product_cost) for all items

### Security Rules
- **BR-SC-022**: Users can only create spot checks for locations they have access to
- **BR-SC-023**: Users can only view spot checks for their assigned locations (unless manager+)
- **BR-SC-024**: Supervisors can approve variances for their department locations
- **BR-SC-025**: Managers can view and approve spot checks across all locations
- **BR-SC-026**: System administrators can configure spot check parameters and templates

---

## Data Model

**Note**: The interfaces shown below are conceptual data models used to communicate business requirements. They are NOT intended to be copied directly into code. Developers should use these as a guide to understand the required data structure.

### Spot Check Session Entity

**Purpose**: Represents a spot check verification event for selected products at a specific location. Shares the same database table (`tb_count_stock`) as physical counts, differentiated by count_stock_type = 'spot'.

**Conceptual Structure**:

```typescript
interface SpotCheckSession {
  // Primary key
  id: string;                           // UUID, unique identifier

  // Business identifier
  count_stock_no: string;               // Unique spot check number (SPOT-YYYY-NNNNNN)

  // Type discriminator (IMPORTANT)
  count_stock_type: 'spot';             // Always 'spot' for spot checks

  // Core fields
  location_id: string;                  // Location where spot check conducted
  location_name: string;                // Denormalized location name for reporting
  start_date: Date;                     // When spot check started
  end_date: Date | null;                // When spot check completed (null if in progress)

  // Status and workflow
  doc_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';

  // Additional information
  description: string | null;           // Purpose or notes about this spot check
  note: string | null;                  // Additional comments
  info: SpotCheckInfo | null;           // JSON metadata

  // Workflow management
  workflow_id: string | null;           // Workflow instance identifier
  workflow_name: string | null;         // Workflow definition name
  workflow_current_stage: string | null;// Current workflow stage
  workflow_history: WorkflowHistory[] | null; // Workflow stage transitions

  // Audit fields
  created_date: Date;                   // Creation timestamp
  created_by: string;                   // Creator user ID
  updated_date: Date;                   // Last update timestamp
  updated_by: string;                   // Last updater user ID
  deleted_at: Date | null;              // Soft delete timestamp

  // Relationships
  details: SpotCheckDetail[];           // Line items (products being checked)
}

// Supplementary types
interface SpotCheckInfo {
  total_items: number;                  // Total number of products in spot check
  items_counted: number;                // Number of products actually counted
  total_variance_value: number;         // Total monetary variance (2 decimals)
  high_variance_items: number;          // Count of items exceeding variance threshold
  adjustment_posted: boolean;           // Whether adjustments have been posted
  supervisor_approved: boolean;         // Whether supervisor approved high variances
  approved_by: string | null;           // Supervisor who approved
  approved_at: Date | null;             // Approval timestamp
  template_id: string | null;           // If created from template, template ID
  template_name: string | null;         // If created from template, template name
}

interface WorkflowHistory {
  stage: string;                        // Workflow stage name
  status: string;                       // Stage status
  timestamp: Date;                      // Stage transition time
  user_id: string;                      // User who triggered transition
  notes: string | null;                 // Transition notes
}
```

### Spot Check Detail Entity

**Purpose**: Represents individual product line items within a spot check session. Shares the same database table (`tb_count_stock_detail`) as physical count details.

**Conceptual Structure**:

```typescript
interface SpotCheckDetail {
  // Primary key
  id: string;                           // UUID, unique identifier

  // Foreign key
  count_stock_id: string;               // Reference to spot check session

  // Sequence
  sequence_no: number;                  // Display order (1, 2, 3, ...)

  // Product information
  product_id: string;                   // Product being verified
  product_code: string;                 // Denormalized product code
  product_name: string;                 // Denormalized product name
  unit_id: string;                      // Unit of measure
  unit_name: string;                    // Denormalized unit name

  // Quantity information
  expected_qty: number;                 // System expected quantity (2 decimals)
  actual_qty: number | null;            // Physically counted quantity (2 decimals)
  variance_qty: number | null;          // Calculated: actual_qty - expected_qty (2 decimals)
  variance_pct: number | null;          // Calculated: (variance_qty / expected_qty) * 100 (2 decimals)

  // Status
  is_counted: boolean;                  // Whether this item has been counted

  // Adjustment tracking
  adjustment_posted: boolean;           // Whether adjustment transaction created
  adjustment_transaction_id: string | null; // Reference to inventory adjustment transaction

  // Additional information
  note: string | null;                  // Item-specific notes (e.g., reason for variance)
  info: SpotCheckDetailInfo | null;     // JSON metadata

  // Audit fields
  created_date: Date;                   // Creation timestamp
  created_by: string;                   // Creator user ID
  updated_date: Date;                   // Last update timestamp
  updated_by: string;                   // Last updater user ID
  deleted_at: Date | null;              // Soft delete timestamp

  // Relationships
  spot_check: SpotCheckSession;         // Parent spot check session
  product: Product;                     // Product reference
}

// Supplementary types
interface SpotCheckDetailInfo {
  product_cost: number | null;          // Product cost for variance value calculation (2 decimals)
  variance_value: number | null;        // Monetary variance = variance_qty * product_cost (2 decimals)
  high_variance: boolean;               // Whether exceeds variance threshold
  requires_approval: boolean;           // Whether supervisor approval needed
  approved: boolean;                    // Whether supervisor approved this item
  approved_by: string | null;           // Supervisor who approved
  approved_at: Date | null;             // Approval timestamp
  recount_requested: boolean;           // Whether supervisor requested recount
  last_count_date: Date | null;         // Date of last physical/spot count for this product
  bin_location: string | null;          // Physical bin/shelf location
}
```

### Spot Check Template Data Definition (Future Enhancement)

**Purpose**: Reusable product groupings for frequent spot checks. Not yet implemented in database schema.

**Conceptual Structure**:

```typescript
interface SpotCheckTemplate {
  // Primary key
  id: string;                           // UUID, unique identifier

  // Template information
  template_name: string;                // Descriptive template name
  description: string | null;           // Template purpose or usage notes

  // Scope
  location_id: string | null;           // If location-specific, location ID (null = global)
  department_id: string | null;         // If department-specific, department ID

  // Template products
  products: TemplateProduct[];          // Products included in template

  // Usage tracking
  usage_count: number;                  // How many times template has been used
  last_used: Date | null;               // Last usage date

  // Status
  is_active: boolean;                   // Whether template is active

  // Audit fields
  created_date: Date;                   // Creation timestamp
  created_by: string;                   // Creator user ID
  updated_date: Date;                   // Last update timestamp
  updated_by: string;                   // Last updater user ID
}

interface TemplateProduct {
  product_id: string;                   // Product to include
  sequence_no: number;                  // Display order
  notes: string | null;                 // Product-specific notes for template
}
```

---

## Integration Points

### Internal Integrations
- **Inventory Transaction System**: Retrieve expected quantities from closing balances; post inventory adjustment transactions for variances
- **Product Management**: Retrieve product details (name, code, cost, category) for spot check items
- **Location Management**: Validate location access; retrieve location details
- **User Management**: Validate user permissions; retrieve user roles and location assignments
- **Workflow Engine**: Manage approval workflows for high variance items
- **Notification System**: Send notifications to supervisors for approval requests

### External Integrations
- **Reporting System**: Export spot check data and variance trends for management reporting
- **Audit System**: Provide spot check history and variance data for compliance audits

### Data Dependencies
- **Depends On**:
  - Location Management (location master data)
  - Product Management (product master data, cost data)
  - Inventory Transaction System (expected quantities, closing balances)
  - User Management (user roles, permissions, location assignments)
- **Used By**:
  - Reporting & Analytics (variance analysis, trends)
  - Audit & Compliance (inventory control evidence)
  - Inventory Management Dashboard (accuracy metrics)

---

## Non-Functional Requirements

### Performance
- **NFR-SC-001**: Spot check list page must load within 2 seconds for up to 100 spot checks
- **NFR-SC-002**: Product search must return results within 500ms for up to 10,000 products
- **NFR-SC-003**: Variance calculation must complete within 100ms per item
- **NFR-SC-004**: Adjustment posting must complete within 5 seconds for up to 50 items
- **NFR-SC-005**: System must support up to 20 concurrent spot checks being entered

### Security
- **NFR-SC-006**: All spot check operations must be authenticated and authorized
- **NFR-SC-007**: Location-based access control must be enforced for all spot check operations
- **NFR-SC-008**: Role-based permissions must control spot check actions (create, approve, cancel)
- **NFR-SC-009**: All spot check changes must be logged in audit trail
- **NFR-SC-010**: Sensitive variance information must be protected from unauthorized access

### Usability
- **NFR-SC-011**: Spot check entry screen must be mobile-responsive for tablet use
- **NFR-SC-012**: System must support barcode scanner input for product selection and quantity entry
- **NFR-SC-013**: Variance indicators must use color-coding (green/yellow/red) for quick identification
- **NFR-SC-014**: Auto-save functionality must preserve entered data every 30 seconds
- **NFR-SC-015**: System must provide clear error messages and guidance for all validation failures

### Reliability
- **NFR-SC-016**: Spot check system must maintain 99.5% uptime during business hours
- **NFR-SC-017**: System must prevent data loss through auto-save and transaction management
- **NFR-SC-018**: Adjustment posting must be atomic (all-or-nothing) to prevent partial updates
- **NFR-SC-019**: System must recover gracefully from network interruptions during entry
- **NFR-SC-020**: Concurrent spot checks must not interfere with each other's data

### Scalability
- **NFR-SC-021**: System must handle up to 1,000 spot checks per month per location
- **NFR-SC-022**: Historical spot check data retention: 2 years online, 7 years archived
- **NFR-SC-023**: System must support up to 50 products per spot check efficiently

---

## Success Metrics

### Efficiency Metrics
- **Spot Check Completion Time**: Average time to complete spot check < 10 minutes for 10 items
- **Variance Resolution Time**: Average time from variance detection to resolution < 24 hours
- **Template Usage**: > 60% of spot checks created from templates (after template feature launch)

### Quality Metrics
- **Inventory Accuracy**: Maintain > 95% inventory accuracy across all locations
- **Variance Rate**: < 3% of spot check items show variance > 5%
- **High Variance Items**: < 10% of spot checks require supervisor approval for high variance
- **Cancelled Spot Checks**: < 5% of spot checks cancelled before completion

### Adoption Metrics
- **Spot Check Frequency**: Average 2-3 spot checks per location per week
- **User Participation**: > 80% of storekeepers conduct at least one spot check per week
- **Coverage**: > 90% of high-value and fast-moving products verified via spot check monthly

### Business Impact Metrics
- **Shrinkage Reduction**: Reduce inventory shrinkage by 20% within 6 months
- **Write-Off Reduction**: Reduce inventory write-offs by 15% through early variance detection
- **Audit Findings**: Zero material inventory control findings in annual audits

---

## Dependencies

### Module Dependencies
- **Inventory Transaction System**: Required for expected quantities and adjustment posting
- **Product Management**: Required for product master data and cost information
- **Location Management**: Required for location validation and access control
- **User Management**: Required for authentication, authorization, and role management
- **Workflow Engine**: Required for approval workflow management

### Technical Dependencies
- **Next.js 14+**: Application framework with App Router
- **React 18+**: UI component library
- **TypeScript 5+**: Type safety and development experience
- **Prisma ORM**: Database access and type-safe queries
- **PostgreSQL 14+**: Database engine
- **React Hook Form + Zod**: Form handling and validation

### Data Dependencies
- **Master Data**: Products, locations, users, units of measure
- **Inventory Balances**: Current closing balances from inventory transactions
- **Product Costs**: Standard or average cost for variance value calculation
- **User Permissions**: Role-based permissions and location assignments

---

## Assumptions and Constraints

### Assumptions
1. Storekeepers have mobile devices (tablets) with barcode scanners for field entry
2. Expected quantities from inventory transactions are sufficiently accurate for comparison
3. Product costs are available and reasonably current for variance value calculation
4. Network connectivity is available at storage locations for real-time entry
5. Supervisors are available to approve high variance items within reasonable timeframe
6. Users have been trained on spot check procedures and variance thresholds

### Constraints
1. Maximum 50 products per spot check to maintain performance and usability
2. Spot checks share database tables with physical counts (technical constraint)
3. Adjustment posting requires integration with Inventory Transaction System
4. Mobile UI must accommodate smaller screens while maintaining usability
5. Real-time variance calculation requires immediate product cost lookup
6. Approval workflow may introduce delays in spot check completion

### Risks
1. **Network Reliability**: Network interruptions may disrupt spot check entry and auto-save
   - *Mitigation*: Implement offline-capable entry with sync when connection restored
2. **Expected Quantity Accuracy**: Inaccurate expected quantities lead to false variances
   - *Mitigation*: Ensure inventory transaction system maintains accurate real-time balances
3. **Supervisor Availability**: Delays in high variance approval may slow operations
   - *Mitigation*: Implement escalation rules and delegate approval authority appropriately
4. **User Adoption**: Staff may resist additional spot check workload
   - *Mitigation*: Demonstrate time savings vs. full counts, integrate into daily workflow
5. **Data Volume**: Large number of historical spot checks may impact query performance
   - *Mitigation*: Implement archival strategy and optimize database indexes

---

## Future Enhancements

### Phase 2 Enhancements
- **Automated Spot Check Scheduling**: System recommends spot checks based on variance patterns, product categories, or time since last count
- **Mobile App**: Native mobile application for offline spot check entry with sync
- **Variance Trend Analysis**: Dashboard showing variance trends by product, category, location, or user
- **Integration with Loss Prevention**: Alert security team when high variance detected on theft-prone items
- **Photo Capture**: Attach photos of product location or condition during spot check
- **Signature Capture**: Digital signature from supervisor when approving high variance items

### Future Considerations
- **AI-Powered Recommendations**: Machine learning to predict which products need spot checks based on historical variance patterns
- **Blockchain Audit Trail**: Immutable audit trail for compliance and regulatory requirements
- **RFID Integration**: Automated quantity detection using RFID tags for high-value items
- **Voice Entry**: Voice-to-text for hands-free quantity entry and notes
- **Gamification**: Points and badges for users who maintain high inventory accuracy

### Technical Debt
- Spot Check Templates not yet implemented in database schema (documented as future entity)
- Mobile-specific UI optimizations deferred to Phase 2
- Offline entry capability requires additional development effort
- Advanced analytics and reporting require data warehouse integration

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Product Manager | | | |
| Technical Lead | | | |
| Inventory Manager | | | |
| Quality Assurance | | | |

---

## Appendix

### Glossary

- **Spot Check**: Targeted inventory verification of selected products, as opposed to full physical count
- **Expected Quantity**: System-calculated quantity based on current inventory balance from transactions
- **Actual Quantity**: Physical count performed by storekeeper during spot check
- **Variance**: Difference between expected and actual quantities (can be positive or negative)
- **High Variance**: Variance exceeding configured threshold (default: >5% or >$100) requiring approval
- **Adjustment Posting**: Creating inventory adjustment transaction to correct stock levels based on spot check results
- **Spot Check Template**: Predefined list of products for frequently conducted spot checks
- **Draft Mode**: Ability to save partially completed spot check and resume later
- **count_stock_type**: Database field discriminator that differentiates spot checks ('spot') from physical counts ('physical')

### References

- [Technical Specification](./TS-spot-check.md) - To be created
- [Use Cases](./UC-spot-check.md) - To be created
- [Data Definition](./DD-spot-check.md) - To be created
- [Flow Diagrams](./FD-spot-check.md) - To be created
- [Validations](./VAL-spot-check.md) - To be created
- [Prisma Schema](../../data-struc/schema.prisma)
- [Physical Count Management BR](../physical-count-management/BR-physical-count-management.md) - Related module

### Change Requests

| CR ID | Date | Description | Status |
|-------|------|-------------|--------|
| | | | |

---

**Document End**

> 📝 **Note to Authors**:
> - This BR document defines requirements for Spot Check sub-module
> - Spot checks share database tables with physical counts (`tb_count_stock`, `tb_count_stock_detail`)
> - Differentiated by `count_stock_type = 'spot'` field value
> - Focus is on rapid, targeted verification of selected products vs. comprehensive physical counts
> - Maximum 50 products per spot check (configurable) for performance and usability
