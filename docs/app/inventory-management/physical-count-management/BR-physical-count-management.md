# Business Requirements: Physical Count Management

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Physical Count Management
- **Route**: `/app/(main)/inventory-management/physical-count-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version documenting required backend specifications |

---

## Overview

Physical Count Management is a comprehensive inventory verification system that enables hospitality businesses to conduct systematic physical inventory counts across multiple store locations. The system supports full-facility inventory audits with item-by-item verification, variance tracking, and status-based workflow management.

This sub-module addresses the critical need for accurate inventory records in hospitality operations where stock discrepancies can lead to menu unavailability, cost control issues, and financial reporting inaccuracies. By providing a structured counting process with digital data capture, the system eliminates manual counting errors, reduces audit time, and ensures accurate stock valuations.

The system integrates with the core inventory transaction system (documented in SM-costing-methods.md) to record count adjustments, supports multiple counting teams working in parallel, and provides real-time visibility into count progress and variances for management oversight.

## Business Objectives

1. **Achieve 95%+ inventory accuracy** by implementing systematic physical verification processes with variance tracking and adjustment workflows
2. **Reduce counting cycle time by 40%** through digital data capture, parallel team operations, and elimination of paper-based processes
3. **Ensure financial audit compliance** by maintaining complete audit trails of all count activities, approvals, and inventory adjustments
4. **Enable proactive variance management** by identifying discrepancies in real-time and triggering investigation workflows for significant variances
5. **Support multi-location operations** with centralized count scheduling, location-specific permissions, and consolidated reporting
6. **Integrate count adjustments** seamlessly with the inventory transaction system to maintain accurate FIFO/Average cost calculations
7. **Provide management visibility** into count progress, variance trends, and inventory accuracy metrics across all locations
8. **Enforce separation of duties** through workflow-based permissions ensuring counters, approvers, and adjusters have appropriate access controls

## Key Stakeholders

- **Primary Users**: Storekeepers, Warehouse Staff (daily count execution and data entry)
- **Secondary Users**: Inventory Managers, Store Supervisors (count scheduling, review, and approval)
- **Approvers**: Head of Inventory, Finance Managers (variance approval and adjustment authorization)
- **Administrators**: System Administrators (user permissions, location setup, and workflow configuration)
- **Reviewers**: Internal Auditors, Cost Controllers (compliance verification and accuracy monitoring)
- **Support**: IT Support Team (technical assistance and system maintenance)

---

## Functional Requirements

### FR-PCM-001: Physical Count Session Creation
**Priority**: Critical

The system must allow authorized users to create physical count sessions with comprehensive scheduling and configuration options. Each count session represents a systematic inventory verification exercise for a specific location at a specific point in time.

**Acceptance Criteria**:
- Users can initiate new count sessions through "New Count" button in main interface
- System captures: counter assignment (user), department, location (store), count date, and optional notes
- System auto-generates unique count reference number with format `PC-{YEAR}-{SEQUENCE}` (e.g., PC-2024-001)
- System records count creation timestamp, creating user ID, and initial status as 'pending'
- System validates: counter must be active user, location must exist, date cannot be future date
- System supports bulk import of count schedules from template (future enhancement)

**Related Requirements**: BR-PCM-001 (Session Creation Rules), FR-PCM-004 (Status Workflow)

---

### FR-PCM-002: Item-by-Item Count Entry
**Priority**: Critical

The system must provide an intuitive item-by-item count entry interface that displays expected quantities (from system records) alongside actual counted quantities, enabling efficient variance detection during the counting process.

**Acceptance Criteria**:
- Interface displays items in tabular format with columns: Item Details, Expected Qty, Actual Qty (input), Unit, Submit Action
- Item Details show: product name, SKU code, and description for clear identification
- Expected quantity pre-populated from system inventory balance (closing balance from tb_inventory_transaction_closing_balance)
- Counter can input actual quantity with numeric keyboard-optimized input field
- System validates: actual quantity must be non-negative integer/decimal based on unit type
- Counter can submit individual items as counted (row-level confirmation with checkmark icon)
- Submitted items are visually distinguished (green checkmark, disabled input) to track progress
- Interface supports large item lists with vertical scrolling and maintains header row visibility

**Related Requirements**: FR-PCM-003 (Count Detail Data Model), BR-PCM-007 (Item Validation Rules)

---

### FR-PCM-003: Count Progress Tracking
**Priority**: High

The system must track and display count session progress in real-time, showing completion percentage, variance statistics, and enabling management to monitor count activities across multiple sessions.

**Acceptance Criteria**:
- System calculates and displays: Total Items, Completed Items, Completion Percentage
- Count session cards show real-time progress indicators (e.g., "75 of 150 items counted - 50%")
- System calculates variance: `SUM(actual_qty - expected_qty) / SUM(expected_qty) * 100`
- Variance displayed with color coding: Green (<2%), Yellow (2-5%), Red (>5%)
- List view shows summary statistics: Item Count, Last Count Date, Variance %, Completed Count
- Grid view shows detailed count cards with visual progress bars and status badges
- Management dashboard aggregates: Active Counts, Average Variance, High-Risk Locations (future enhancement)

**Related Requirements**: FR-PCM-006 (Filtering and Search), NFR-PCM-003 (Real-time Updates)

---

### FR-PCM-004: Count Status Workflow
**Priority**: Critical

The system must enforce a status-based workflow that governs count session lifecycle from creation through completion, ensuring proper sequencing of activities and maintaining data integrity throughout the process.

**Acceptance Criteria**:
- System implements three-state workflow: **Pending** → **In Progress** → **Completed**
- **Pending State**: Count scheduled but not started; allows editing session details, deleting session
- **In Progress State**: Counting actively underway; allows item quantity entry, individual item submission, session cancellation (with confirmation)
- **Completed State**: Count finished and locked; read-only display, allows variance approval workflow (future), enables inventory adjustment posting
- Status transitions triggered by: "Start Count" button (Pending → In Progress), "Complete Count" button (In Progress → Completed)
- System validates: Cannot complete count with zero items entered, cannot start count without assigned counter
- Status changes recorded in workflow_history JSON field with timestamp and user ID
- Cancelled counts marked with doc_status='cancelled' (not deleted) to maintain audit trail

**Related Requirements**: BR-PCM-008 (Workflow State Transition Rules), FR-PCM-007 (Permission Controls)

---

### FR-PCM-005: Count Session Notes and Documentation
**Priority**: Medium

The system must allow users to document count observations, discrepancy explanations, and special circumstances through a flexible notes system attached to both count sessions and individual items.

**Acceptance Criteria**:
- Session-level notes field (multi-line textarea) for general observations and instructions
- System preserves notes content across session saves and status transitions
- Notes display in all count views (list, grid, detail form) for continuity
- System supports rich text notes (future enhancement) for formatted documentation
- Notes included in count reports and audit logs for compliance verification
- System tracks notes history with timestamps and user attribution (future enhancement)

**Related Requirements**: NFR-PCM-010 (Audit Trail Requirements), FR-PCM-008 (Reporting and Export)

---

### FR-PCM-006: Filtering and Search Capabilities
**Priority**: High

The system must provide comprehensive filtering and search capabilities enabling users to quickly locate specific count sessions across large datasets with multiple filtering dimensions.

**Acceptance Criteria**:
- **Status Filter**: Dropdown with options: All Statuses, Pending, In Progress, Completed
- **Department Filter**: Dropdown populated from tb_department table with option: All Departments
- **Location Filter**: Toggle button reveals location dropdown populated from tb_location table, with visual filter pill showing active location selection
- **Search Field**: Text input searches across: count number, store name, counter name (future enhancement)
- Filters work independently and cumulatively (multiple filters applied simultaneously)
- System applies filters client-side for immediate response on reasonable dataset sizes (<1000 records)
- Active filters visually indicated with highlight styling and clear/reset buttons
- Filter state persists during session (stored in component state, future: localStorage)

**Related Requirements**: NFR-PCM-001 (Search Response Time <500ms)

---

### FR-PCM-007: Role-Based Permission Controls
**Priority**: Critical

The system must enforce role-based access controls ensuring users can only perform actions appropriate to their role, maintaining segregation of duties and preventing unauthorized modifications.

**Acceptance Criteria**:
- **Storekeeper/Counter Role**: Can create count sessions, enter count data, submit item counts, view own counts
- **Supervisor/Manager Role**: All counter permissions plus: reassign counts, cancel counts, approve variances
- **Inventory Manager Role**: All supervisor permissions plus: view all locations, generate reports, configure count schedules
- **Finance Manager Role**: Read-only access to completed counts, approve high-value variances (>10%), post inventory adjustments
- System validates permissions before: displaying action buttons, processing form submissions, executing server actions
- Permission violations return clear error messages without exposing system internals
- Permissions stored in tb_user.user_action JSON field and evaluated on both client and server

**Related Requirements**: BR-PCM-014 (Security and Permission Rules), NFR-PCM-007 (Authentication Requirements)

---

### FR-PCM-008: Count Deletion and Cancellation
**Priority**: Medium

The system must allow authorized users to delete pending count sessions or cancel in-progress counts when needed, with appropriate safeguards to prevent accidental data loss.

**Acceptance Criteria**:
- Delete action available only for count sessions in 'pending' status
- Delete button displays with warning icon and requires confirmation dialog
- Confirmation dialog shows: count details, warning message, "Confirm Delete" and "Cancel" buttons
- Successful deletion soft-deletes record (sets deleted_at timestamp and deleted_by_id) maintaining audit trail
- Cancel action available for count sessions in 'in-progress' status
- Cancellation requires reason note (mandatory text input in confirmation dialog)
- Cancelled counts marked with doc_status='cancelled' and remain visible with cancelled badge
- System prevents deletion/cancellation of completed counts (immutable once finalized)

**Related Requirements**: BR-PCM-009 (Deletion and Cancellation Rules), NFR-PCM-018 (Data Retention Policy)

---

### FR-PCM-009: List and Grid View Modes
**Priority**: Low

The system must provide multiple visualization modes for count sessions, allowing users to choose their preferred layout based on information density needs and screen size.

**Acceptance Criteria**:
- Toggle buttons in toolbar switch between List View and Grid View modes
- **List View**: Compact rows showing: Location, Department, Counter, Date, Status, Items (X of Y), Variance %, Actions
- **Grid View**: Card layout showing: All list view data plus Progress Bar, Last Count Date, Notes Preview
- View preference stored in component state and persists during user session
- Responsive design: Grid view shows 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Both views support all filtering and sorting operations consistently
- Active view indicated by highlighted toggle button with contrasting background color

**Related Requirements**: NFR-PCM-013 (Mobile Responsive Design)

---

## Business Rules

### General Rules

- **BR-PCM-001**: Each physical count session must be assigned to a single counting location; multi-location counts require separate count sessions
- **BR-PCM-002**: Count reference numbers must be system-generated and immutable after creation to maintain audit trail integrity
- **BR-PCM-003**: Only one active count session (pending or in-progress status) may exist per location at any given time to prevent conflicting adjustments
- **BR-PCM-004**: Count date must not be a future date; system defaults to current date but allows backdating for recording late-entered counts
- **BR-PCM-005**: Count sessions must capture both expected quantity (system balance) and actual quantity (physically counted) for variance calculation
- **BR-PCM-006**: The system must maintain complete audit trail of all count activities including: creation, modifications, status changes, deletions/cancellations

### Data Validation Rules

- **BR-PCM-007**: Counter (assigned user) must be an active user with 'storekeeper' or higher role; inactive users cannot be assigned
- **BR-PCM-008**: Location must exist in tb_location table and have status='active'; inactive locations cannot have new counts created
- **BR-PCM-009**: Department must exist in tb_department table and be associated with the selected location
- **BR-PCM-010**: Actual quantity must be non-negative (>=0) and match the unit precision (integer for 'pcs', up to 3 decimals for 'kg/L')
- **BR-PCM-011**: Expected quantity retrieved from tb_inventory_transaction_closing_balance.closing_qty for location and product
- **BR-PCM-012**: Count session notes limited to 1000 characters to prevent database storage issues

### Workflow Rules

- **BR-PCM-013**: Count status transitions must follow strict sequence: Pending → In Progress → Completed (no backward transitions except cancellation)
- **BR-PCM-014**: Transition from Pending to In Progress requires: assigned counter, count date, location; system prevents transition if missing
- **BR-PCM-015**: Transition from In Progress to Completed requires: at least one item with actual quantity entered; system prevents empty count completion
- **BR-PCM-016**: Completed counts are immutable; no modifications to quantities, items, or session details allowed after completion
- **BR-PCM-017**: Cancelled counts (from In Progress state) require mandatory cancellation reason; cancelled counts remain visible but non-editable
- **BR-PCM-018**: Status changes must record: transition timestamp, user ID performing transition, previous status, new status in workflow_history JSON

### Calculation Rules

- **BR-PCM-019**: Variance % calculation: `((SUM(actual_qty) - SUM(expected_qty)) / SUM(expected_qty)) * 100` rounded to 2 decimal places
- **BR-PCM-020**: Item-level variance: `actual_qty - expected_qty` displayed with +/- sign and unit suffix (e.g., +5 pcs, -2.5 kg)
- **BR-PCM-021**: Completion % calculation: `(completed_item_count / total_item_count) * 100` rounded to nearest integer
- **BR-PCM-022**: Count adjustment value calculation (for inventory transaction posting): `(actual_qty - expected_qty) * product_unit_cost` (future enhancement)
- **BR-PCM-023**: High-variance threshold: Variance % > 5% flagged as requiring supervisor review (configurable per location)

### Security Rules

- **BR-PCM-024**: Users can only view count sessions for locations they have permission to access (based on tb_user.location_assignments)
- **BR-PCM-025**: Only count creator or users with 'supervisor' role can delete pending counts
- **BR-PCM-026**: Only users with 'manager' or higher role can cancel in-progress counts
- **BR-PCM-027**: Count data entry actions (entering actual quantities) must be performed by users with 'counter' permission for the specific location
- **BR-PCM-028**: Completed counts visible to all users with inventory read permission, but modifications restricted to 'finance' role for adjustment posting

---

## Data Model

### CountSession Entity

**Purpose**: Represents a physical inventory count session for a specific location at a specific point in time, tracking the overall count progress, variance, and workflow state.

**Conceptual Structure**:

```typescript
interface CountSession {
  // Primary key
  id: string;                                    // UUID, auto-generated

  // Count identification
  countStockNo: string;                          // Format: PC-{YEAR}-{SEQUENCE}, system-generated
  countStockType: 'physical' | 'spot';           // Type of count; physical=full inventory, spot=sample verification

  // Scheduling and assignment
  startDate: Date;                               // Count scheduled/start date (default: today)
  endDate: Date | null;                          // Count completion date (set when status→completed)
  locationId: string;                            // Foreign key to tb_location.id
  locationName: string;                          // Denormalized for display performance
  counterId: string;                             // Foreign key to tb_user.id (assigned counter)
  counterName: string;                           // Denormalized from tb_user.name
  departmentId: string;                          // Foreign key to tb_department.id
  departmentName: string;                        // Denormalized for filtering

  // Status and workflow
  docStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled';  // Current count status
  workflowId: string | null;                     // Foreign key to tb_workflow.id (optional workflow)
  workflowName: string | null;                   // Workflow name if using approval workflow
  workflowCurrentStage: string | null;           // Current approval stage (e.g., 'supervisor_review')
  workflowHistory: WorkflowHistoryEntry[];       // JSON array of status transitions with timestamps

  // Count data
  description: string | null;                    // Count purpose or description
  note: string | null;                           // General notes and observations
  lastCountDate: string | null;                  // Last count date for this location (historical reference)

  // Calculated fields (derived from tb_count_stock_detail)
  totalItemCount: number;                        // Total number of items in count
  completedItemCount: number;                    // Number of items with actual_qty entered
  variancePercentage: number;                    // Overall variance % (calculated)

  // Extended data
  info: Record<string, any> | null;              // JSON for extensible metadata

  // User action permissions
  userAction: {
    read_only: string[];                         // User IDs with read-only access
    execute: string[];                           // User IDs who can modify
    approve: string[];                           // User IDs who can approve (future)
  } | null;

  // Audit fields
  createdAt: Date;                               // Creation timestamp
  createdById: string;                           // Creator user ID (foreign key to tb_user.id)
  updatedAt: Date | null;                        // Last update timestamp
  updatedById: string | null;                    // Last updater user ID
  deletedAt: Date | null;                        // Soft delete timestamp
  deletedById: string | null;                    // User who deleted/cancelled

  // Navigation properties (not stored, loaded on demand)
  countDetails?: CountDetail[];                  // Line items being counted
}

interface WorkflowHistoryEntry {
  timestamp: Date;
  userId: string;
  userName: string;
  fromStatus: string;
  toStatus: string;
  action: string;                                // e.g., 'started', 'completed', 'cancelled'
  note?: string;
}
```

### CountDetail Entity

**Purpose**: Represents individual line items within a physical count session, recording both expected (system) and actual (counted) quantities for variance analysis.

**Conceptual Structure**:

```typescript
interface CountDetail {
  // Primary key
  id: string;                                    // UUID, auto-generated
  countStockId: string;                          // Foreign key to tb_count_stock.id (parent session)
  sequenceNo: number;                            // Display order (1, 2, 3, ...)

  // Product identification
  productId: string;                             // Foreign key to tb_product.id
  productName: string;                           // Denormalized for display
  productSku: string;                            // Product SKU/barcode for identification
  productDescription: string | null;             // Additional product details for clarity

  // Quantity tracking
  expectedQuantity: number;                      // System balance from tb_inventory_transaction_closing_balance
  actualQuantity: number | null;                 // Counted quantity (null=not yet counted)
  variance: number;                              // Calculated: actualQuantity - expectedQuantity
  variancePercentage: number;                    // Calculated: (variance / expectedQuantity) * 100
  unit: string;                                  // Unit of measure (e.g., 'pcs', 'kg', 'L')

  // Item status
  isSubmitted: boolean;                          // Whether counter has submitted this item (UI state)
  isCounted: boolean;                            // Whether actual quantity has been entered

  // Item-level notes
  note: string | null;                           // Item-specific notes (e.g., "damaged items excluded")

  // Extended data
  info: Record<string, any> | null;              // JSON for extensible metadata (e.g., lot numbers, expiry dates)

  // Audit fields
  createdAt: Date;                               // Creation timestamp (when item added to count)
  createdById: string;                           // User who added item to count
  updatedAt: Date | null;                        // Last update timestamp
  updatedById: string | null;                    // User who last updated quantity
  deletedAt: Date | null;                        // Soft delete timestamp (if item removed from count)
  deletedById: string | null;                    // User who removed item

  // Navigation properties
  countSession?: CountSession;                   // Parent count session
  product?: Product;                             // Full product details
}
```

### NewCountFormData Entity

**Purpose**: Data transfer object for creating new physical count sessions, capturing initial scheduling and assignment information.

```typescript
interface NewCountFormData {
  counter: string;                               // Counter name (will be resolved to user ID)
  department: string;                            // Department name (will be resolved to department ID)
  storeName: string;                             // Location name (will be resolved to location ID)
  date: string;                                  // Count date in ISO format (YYYY-MM-DD)
  notes: string | null;                          // Optional initial notes
}
```

### CountDetailFormData Entity

**Purpose**: Data transfer object for submitting count details with all item quantities, used when completing count entry.

```typescript
interface CountDetailFormData {
  items: {
    id: string;                                  // Count detail ID
    name: string;                                // Product name
    sku: string;                                 // Product SKU
    description: string;                         // Product description
    expectedQuantity: number;                    // System balance
    actualQuantity: number;                      // User-entered count
    unit: string;                                // Unit of measure
    isSubmitted: boolean;                        // Row-level submission status
  }[];
  notes: string;                                 // Session-level notes
}
```

---

## Integration Points

### Internal Integrations

- **Inventory Transaction System (SM-costing-methods.md)**: Count adjustments (actual - expected quantities) post to tb_inventory_transaction as adjustment transactions, updating inventory balances and triggering cost recalculation under FIFO or Average costing method rules
- **Product Management Module**: Retrieves product master data (name, SKU, description, unit) from tb_product for count detail line items
- **Location Management**: Validates location permissions, retrieves location hierarchy (department → location) for count assignment and filtering
- **User Management**: Authenticates users, validates permissions (counter, supervisor, manager roles), retrieves user lists for counter assignment dropdown
- **Workflow Engine**: Orchestrates approval workflows for high-variance counts, enforces status transition rules, records workflow history
- **Reporting Module**: Consumes count data for variance reports, accuracy dashboards, and audit compliance reporting (future enhancement)

### External Integrations

- **ERP Accounting System**: Exports count adjustments as journal entries for inventory value adjustments in general ledger (future enhancement via API)
- **Mobile Count App**: Receives count data from mobile barcode scanning devices via REST API, synchronizes count progress in real-time (future enhancement)

### Data Dependencies

- **Depends On**:
  - User Management (tb_user) for counter assignments and permissions
  - Location Management (tb_location) for count location validation
  - Department Management (tb_department) for department associations
  - Product Management (tb_product) for item master data
  - Inventory Balances (tb_inventory_transaction_closing_balance) for expected quantities
- **Used By**:
  - Inventory Adjustments (posts adjustment transactions to tb_inventory_transaction)
  - Variance Reporting (consumes completed count data for analytics)
  - Audit Compliance (provides count records for period-end verification)

---

## Non-Functional Requirements

### Performance

- **NFR-PCM-001**: Count list page must load and display up to 100 count sessions within 2 seconds on standard network connection
- **NFR-PCM-002**: Count detail form must load item list (up to 500 items) within 3 seconds with responsive UI during loading
- **NFR-PCM-003**: Real-time progress calculations (completion %, variance %) must update within 200ms after item quantity entry
- **NFR-PCM-004**: Filtering operations (status, location, department) must return results within 500ms for datasets up to 1000 records
- **NFR-PCM-005**: Count session creation (from form submission to confirmation) must complete within 1 second excluding network latency

### Security

- **NFR-PCM-006**: All server actions must validate user authentication before processing requests; unauthenticated requests return 401 Unauthorized
- **NFR-PCM-007**: All server actions must validate user permissions before executing operations; unauthorized access returns 403 Forbidden with sanitized error message
- **NFR-PCM-008**: Count data transmission must use HTTPS/TLS 1.2+ encryption to protect count quantities and variance data in transit
- **NFR-PCM-009**: User passwords and authentication tokens must never be logged or stored in count audit trails
- **NFR-PCM-010**: Complete audit trail must record: user ID, timestamp, action type, before/after values for all count modifications

### Usability

- **NFR-PCM-011**: Count detail form must support keyboard navigation and tabbing between quantity input fields for efficient data entry
- **NFR-PCM-012**: Form validation errors must display inline near the relevant field with clear, actionable error messages (e.g., "Quantity must be a positive number")
- **NFR-PCM-013**: UI must be fully responsive supporting mobile (320px+), tablet (768px+), and desktop (1024px+) screen sizes with touch-friendly buttons (min 44×44px)
- **NFR-PCM-014**: Loading states must display skeleton screens or progress indicators during data fetching operations (no blank screens)
- **NFR-PCM-015**: Success/error notifications must auto-dismiss after 5 seconds with option to manually close, using toast/snackbar pattern

### Reliability

- **NFR-PCM-016**: System must handle concurrent count sessions (multiple locations counting simultaneously) without data conflicts or race conditions
- **NFR-PCM-017**: Count data auto-save (draft mode) must occur every 30 seconds during active entry to prevent data loss from session timeouts (future enhancement)
- **NFR-PCM-018**: Soft delete pattern must be used for count session deletion/cancellation to support data recovery and audit compliance
- **NFR-PCM-019**: Database transactions must ensure atomicity; count completion must successfully post all line items or rollback entirely on error
- **NFR-PCM-020**: System must gracefully handle expected quantity lookup failures (missing closing balance records) by defaulting to 0 with warning notification

### Scalability

- **NFR-PCM-021**: System must support up to 50 simultaneous users performing count entry across different locations without performance degradation
- **NFR-PCM-022**: Database schema must accommodate growth to 100,000+ count sessions and 10M+ count detail records over 5 years
- **NFR-PCM-023**: Count history retention must support 7-year data retention for financial audit compliance without compromising query performance

---

## Success Metrics

### Efficiency Metrics

- **Counting cycle time reduction**: Target 40% reduction in time required to complete full facility count (baseline: manual count = 8 hours → digital count = 4.8 hours)
- **Data entry efficiency**: Target <10 seconds average time per item for quantity entry (measured from item focus to submission)
- **Error correction rate**: Target <5% of count sessions requiring correction or recount due to data entry errors

### Quality Metrics

- **Inventory accuracy**: Target 95%+ inventory record accuracy measured by variance % <2% on regular cycle counts
- **Count completion rate**: Target 98% of scheduled count sessions completed within planned timeframe without cancellation
- **Variance investigation**: Target 100% of high-variance items (>5% variance) investigated and documented with root cause notes

### Adoption Metrics

- **User adoption rate**: Target 90% of counting staff using digital system within 30 days of rollout (vs. paper-based process)
- **Feature utilization**: Target 80% of counts using status workflow (Pending → In Progress → Completed) vs. direct entry
- **Mobile usage**: Target 60% of counts performed on mobile/tablet devices for improved ergonomics at count locations (future, post mobile app launch)

### Business Impact Metrics

- **Cost savings**: Target $50,000 annual savings from reduced labor hours and eliminated paper/printing costs (based on 200 count sessions/year × 3.2 hours saved × $78 blended labor rate)
- **Shrinkage reduction**: Target 25% reduction in inventory shrinkage through improved accuracy and variance visibility (baseline shrinkage = 2% of inventory value)
- **Audit compliance**: Target 100% of count sessions passing internal audit review with complete documentation and approval workflows

---

## Dependencies

### Module Dependencies

- **User Management Module**: Required for user authentication, role-based permissions, and counter assignment dropdown population
- **Location Management Module**: Required for location validation, location hierarchy (department → location mapping), and location-based filtering
- **Product Management Module**: Required for product master data (name, SKU, description, unit of measure) used in count detail line items
- **Inventory Transaction Module**: Required for retrieving expected quantities (closing balances) and posting count adjustment transactions
- **Workflow Engine (optional)**: Required if implementing approval workflows for high-variance counts or supervisor reviews

### Technical Dependencies

- **Next.js 14+**: Application framework providing App Router, Server Components, and Server Actions
- **TypeScript 5+**: Type-safe development ensuring data model consistency between frontend and backend
- **React 18+**: Frontend framework for interactive count detail form with real-time calculations
- **Shadcn/ui Components**: UI component library for forms, cards, buttons, selects, and data tables
- **Zod Validation Library**: Schema validation for form inputs, server action parameters, and data integrity
- **Prisma ORM**: Database access layer for type-safe queries to tb_count_stock, tb_count_stock_detail, and related tables
- **PostgreSQL Database**: Data persistence layer with JSONB support for workflow_history and info fields

### Data Dependencies

- **tb_user**: User master data for counter assignment and authentication (active users only)
- **tb_location**: Location master data for count location validation and location-based permissions
- **tb_department**: Department master data for count categorization and filtering
- **tb_product**: Product master data for count line items (active products only)
- **tb_inventory_transaction_closing_balance**: Current inventory balances providing expected quantities for variance calculation
- **tb_workflow (optional)**: Workflow definitions if implementing approval processes

---

## Assumptions and Constraints

### Assumptions

1. Users performing physical counts have basic computer/tablet literacy and can operate touch-screen interfaces without extensive training
2. Expected quantities retrieved from inventory transaction closing balance are accurate as of the count start date (any transactions between closing balance calculation and count date are ignored)
3. Network connectivity is available during count entry; offline mode is not required for Phase 1 implementation
4. Count sessions are for full location inventory; partial counts (specific product categories only) can be handled by excluding items from count detail list
5. All counted items have product master records in tb_product; ad-hoc items found during count but not in system require separate product creation process
6. Count adjustment posting to inventory transactions is a separate workflow triggered after count completion (not automatic upon status = completed)

### Constraints

1. **Browser Compatibility**: System must support latest two versions of Chrome, Firefox, Safari, and Edge; Internet Explorer not supported
2. **Screen Size**: Count detail form optimized for tablet/desktop (768px+ width); mobile phones supported but with reduced usability due to table scrolling requirements
3. **Concurrent Editing**: System does not support multiple users editing the same count session simultaneously; last-write-wins strategy applies (race condition possible)
4. **Data Volume**: Count detail form performance degrades with >500 items; locations with larger inventories should be split into multiple count sessions by category
5. **Barcode Scanning**: Barcode scanner integration not included in Phase 1; manual SKU entry required (future enhancement via mobile app)
6. **Historical Reporting**: Variance trend analysis and historical count comparison reports deferred to Phase 2 implementation

### Risks

1. **User Adoption Risk**: Counter staff resistance to digital process due to unfamiliarity with technology
   - *Mitigation*: Conduct hands-on training sessions, provide quick reference guides, designate power users as on-floor support
2. **Data Migration Risk**: Existing paper-based count records difficult to migrate into new system for historical analysis
   - *Mitigation*: Focus on forward-looking data collection, accept loss of historical variance trends, prioritize new data quality
3. **Network Dependency**: System unusable during network outages preventing count data entry in remote storage locations
   - *Mitigation*: Implement auto-save drafts, provide clear "Connection Lost" messaging, add offline mode in Phase 2 via Progressive Web App
4. **Performance Risk**: Large item lists (>500 items) cause slow page load and laggy input response on older devices
   - *Mitigation*: Implement pagination or virtualized scrolling, optimize SQL queries with appropriate indexes, consider server-side filtering

---

## Future Enhancements

### Phase 2 Enhancements

- **Barcode Scanning Integration**: Mobile app with barcode scanner support for product identification, eliminating manual SKU entry and reducing errors
- **Offline Mode**: Progressive Web App with local data storage enabling count entry without network connectivity, syncing when connection restored
- **Auto-Save Drafts**: Automatic draft saving every 30 seconds during active count entry to prevent data loss from timeouts or crashes
- **Approval Workflow**: Configurable multi-step approval process for high-variance counts requiring supervisor/manager sign-off before posting adjustments
- **Variance Trend Analysis**: Historical reporting showing variance trends over time, identifying problem products/locations for targeted investigation
- **Cycle Count Scheduling**: Automated cycle count scheduling with ABC classification (count high-value items more frequently than low-value)
- **Bulk Import**: CSV/Excel import for count schedules and pre-populated count detail line items for large-scale count operations
- **Photo Documentation**: Attach photos to count line items for visual documentation of damaged goods, packaging discrepancies, or physical condition

### Future Considerations

- **AI-Powered Variance Detection**: Machine learning models predicting expected variance ranges based on historical data, flagging anomalies for immediate investigation
- **Integration with WMS**: Real-time sync with Warehouse Management System for expected quantities, eliminating dependency on closing balance calculation timing
- **Mobile First Redesign**: Native mobile apps (iOS/Android) with optimized UX for on-floor counting, voice input, and gesture controls
- **Blockchain Audit Trail**: Immutable ledger of count activities for enhanced audit compliance and tamper-proof record keeping

### Technical Debt

- **Client-Side Filtering**: Current implementation filters count list in browser memory; replace with server-side filtering/pagination for datasets >1000 records
- **Race Condition Handling**: Implement optimistic locking (version field) to prevent concurrent edit conflicts when multiple users access same count
- **Type Safety Gap**: UI component interfaces (NewCountData, CountDetailData) do not match Prisma schema exactly; consolidate type definitions in shared types library
- **Hardcoded Mock Data**: Current UI uses hardcoded mock data (users, departments, storeLocations); replace with actual API calls to backend
- **Missing Error Boundaries**: Add React Error Boundaries around count detail form to gracefully handle component crashes without losing entered data

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

- **Physical Count**: Systematic verification of actual inventory quantities on-hand through manual counting, comparing physical counts against system records
- **Count Session**: A single inventory verification exercise for a specific location at a specific point in time, tracked from creation through completion
- **Variance**: The difference between expected quantity (system balance) and actual quantity (physically counted), expressed as absolute difference or percentage
- **Expected Quantity**: The quantity of an item that the system predicts should be physically present based on transaction history (opening balance + receipts - issues)
- **Actual Quantity**: The quantity of an item physically counted during the count session
- **Closing Balance**: The inventory quantity on-hand at the end of an accounting period or point in time, calculated from tb_inventory_transaction
- **Counter**: User assigned to perform the physical counting activity and enter actual quantities into the system
- **Status Workflow**: The sequence of states (Pending → In Progress → Completed) that governs count session lifecycle and determines available actions
- **Soft Delete**: Deletion pattern where records are marked as deleted (deleted_at timestamp) but not physically removed from the database, supporting audit trails
- **FIFO**: First-In-First-Out inventory costing method where oldest inventory costs are expensed first; count adjustments affect cost layer calculations
- **SKU**: Stock Keeping Unit, unique identifier code for each distinct product/item in inventory

### References

- [Technical Specification](./TS-physical-count-management.md) - Server actions, API contracts, and database schema
- [Use Cases](./UC-physical-count-management.md) - Detailed user scenarios and workflow diagrams
- [Data Definition](./DS-physical-count-management.md) - Complete database schema and relationships
- [Flow Diagrams](./FD-physical-count-management.md) - Visual workflow and sequence diagrams
- [Validations](./VAL-physical-count-management.md) - Validation rules and error handling specifications
- [Prisma Schema Documentation](../../../data-struc/schema.prisma) - Full database schema definition
- [SM-Costing-Methods.md](../../shared-methods/SM-costing-methods.md) - Inventory transaction system integration (planned)
- [MODULE-PRD.md](../../../prd/modules/inventory-management/MODULE-PRD.md) - Inventory Management module overview

### Change Requests

| CR ID | Date | Description | Status |
|-------|------|-------------|--------|
| - | - | No change requests submitted | - |

---

**Document End**

> 📝 **Implementation Note**:
> This Business Requirements document specifies the required backend functionality based on analysis of the UI prototype (page.tsx and components) and Prisma schema (tb_count_stock, tb_count_stock_detail tables). The documented interfaces represent conceptual data models to guide implementation, not production-ready code. Developers should implement server actions, type definitions, and validation schemas according to project conventions and technical specifications in the TS document.
