# Use Cases: Physical Count Management

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
| 1.0.0 | 2025-01-11 | System | Initial version documenting required workflows |

---

## Overview

This document defines the use cases for the Physical Count Management system, describing the interactions between hospitality users (Storekeepers, Warehouse Managers, Inventory Managers) and the system during physical inventory count workflows. The use cases cover count session creation, item-by-item count entry, progress tracking, variance analysis, and count completion with status workflow enforcement.

The documented use cases represent workflows required by the UI prototype and supported by the Prisma schema (tb_count_stock, tb_count_stock_detail tables). These use cases guide the implementation of server actions, type definitions, and validation schemas needed to support the frontend functionality.

**Related Documents**:
- [Business Requirements](./BR-physical-count-management.md)
- [Technical Specification](./TS-physical-count-management.md)
- [Data Specification](./DS-physical-count-management.md)
- [Flow Diagrams](./FD-physical-count-management.md)
- [Validations](./VAL-physical-count-management.md)

---

## Actors

### Primary Actors
| Actor | Description | Role |
|-------|-------------|------|
| Storekeeper | Front-line inventory staff responsible for physical counting | Creates count sessions, enters actual quantities, submits item counts |
| Warehouse Supervisor | Mid-level supervisor overseeing counting activities | Reviews count progress, reassigns counts, handles cancellations |
| Inventory Manager | Senior manager responsible for inventory accuracy | Schedules counts, analyzes variances, approves high-variance adjustments |

### Secondary Actors
| Actor | Description | Role |
|-------|-------------|------|
| Finance Manager | Financial controller responsible for inventory valuation | Reviews completed counts, approves inventory adjustments, audits count records |
| Cost Controller | Analyst monitoring inventory costs and shrinkage | Generates variance reports, investigates discrepancies, tracks accuracy metrics |
| Internal Auditor | Compliance officer ensuring process adherence | Audits count records, verifies segregation of duties, validates approval workflows |

### System Actors
| System | Description | Integration Type |
|--------|-------------|------------------|
| Inventory Transaction System | Core system managing inventory movements and balances | Module - Provides expected quantities, receives adjustment transactions |
| Workflow Engine | Automated workflow management system | Module - Orchestrates approval workflows, enforces state transitions |
| Notification Service | System sending alerts and notifications | Event - Sends count completion alerts, variance warnings |
| Reporting Module | Business intelligence and reporting system | Module - Consumes count data for dashboards and analytics |

---

## Use Case Diagram

```
                            ┌─────────────────────────────────────┐
                            │  Physical Count Management System   │
                            └────────────┬────────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┬────────────────────────┐
          │                              │                              │                        │
          │                              │                              │                        │
    ┌─────▼──────┐                 ┌────▼─────┐                  ┌─────▼──────┐         ┌──────▼────────┐
    │ Storekeeper│                 │Warehouse │                  │ Inventory  │         │    Finance    │
    │            │                 │Supervisor│                  │  Manager   │         │   Manager     │
    └─────┬──────┘                 └────┬─────┘                  └─────┬──────┘         └──────┬────────┘
          │                              │                              │                        │
     [UC-PCM-001]                   [UC-PCM-001]                   [UC-PCM-001]            [UC-PCM-006]
     [UC-PCM-002]                   [UC-PCM-004]                   [UC-PCM-005]          (view/approve)
     [UC-PCM-003]                   [UC-PCM-007]                   [UC-PCM-006]
     [UC-PCM-008]                   [UC-PCM-008]                   [UC-PCM-008]
    (create/enter)                 (review/cancel)              (analyze/schedule)
          │                              │
          │                              │
          └──────────────────────────────┼────────────────────────────────────────────────┐
                                         │                                                 │
                                         │                                                 │
                                   ┌─────▼──────┐                                    ┌─────▼──────┐
                                   │  Workflow  │                                    │  Inventory │
                                   │   Engine   │                                    │Transaction │
                                   │            │                                    │   System   │
                                   └─────┬──────┘                                    └─────┬──────┘
                                         │                                                 │
                                    [UC-PCM-101]                                      [UC-PCM-102]
                                    [UC-PCM-103]                                      [UC-PCM-103]
                                  (enforce workflow)                             (provide expected qty)

    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │ Notification │              │  Reporting   │              │   Audit      │
    │   Service    │              │    Module    │              │   Logger     │
    │              │              │              │              │              │
    └──────┬───────┘              └──────┬───────┘              └──────┬───────┘
           │                             │                             │
      [UC-PCM-104]                  [UC-PCM-201]                  [UC-PCM-105]
   (send alerts)                 (consume data)                (log activities)
```

**Legend**:
- **Primary Actors** (top): Hospitality staff performing count activities
- **Secondary Actors** (middle-right): Management and compliance roles
- **System Actors** (bottom): Automated processes, integrations, and background services

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-PCM-001 | Create Physical Count Session | Storekeeper, Supervisor, Manager | High | Simple | User |
| UC-PCM-002 | Enter Count Data for Items | Storekeeper | High | Medium | User |
| UC-PCM-003 | Complete Physical Count | Storekeeper, Supervisor | High | Medium | User |
| UC-PCM-004 | Review Count Progress | Supervisor, Manager | Medium | Simple | User |
| UC-PCM-005 | Filter and Search Counts | All Users | Medium | Simple | User |
| UC-PCM-006 | View Count Details (Read-Only) | Finance Manager, Auditor | Medium | Simple | User |
| UC-PCM-007 | Cancel In-Progress Count | Supervisor, Manager | Low | Medium | User |
| UC-PCM-008 | Delete Pending Count | Storekeeper, Supervisor | Low | Simple | User |
| **System Use Cases** | | | | | |
| UC-PCM-101 | Enforce Status Workflow Transitions | Workflow Engine | High | Medium | System |
| UC-PCM-102 | Calculate Expected Quantities | Inventory Transaction System | High | Medium | System |
| UC-PCM-103 | Calculate Variance Metrics | System | High | Simple | System |
| UC-PCM-104 | Send Count Notifications | Notification Service | Medium | Simple | System |
| UC-PCM-105 | Log Count Activities | Audit Logger | High | Simple | System |
| **Integration Use Cases** | | | | | |
| UC-PCM-201 | Export Count Data for Reporting | Reporting Module | Medium | Simple | Integration |
| UC-PCM-202 | Post Count Adjustments to Inventory | Inventory Transaction System | High | Complex | Integration |

---

## User Use Cases

### UC-PCM-001: Create Physical Count Session

**Description**: Storekeeper initiates a new physical count session by specifying the location, assigned counter, count date, and optional notes. System generates a unique count reference and initializes the session with 'pending' status.

**Actor(s)**: Storekeeper, Warehouse Supervisor, Inventory Manager

**Priority**: High

**Frequency**: Daily to Weekly (based on count schedules)

**Preconditions**:
- User is authenticated with 'storekeeper' or higher role
- User has permission to access the target location
- Target location exists and is active in tb_location
- At least one active user exists to assign as counter

**Postconditions**:
- **Success**: New count session created in tb_count_stock with status='pending', unique count_stock_no generated, creation timestamp and user recorded
- **Failure**: No count session created, validation errors displayed to user, database remains unchanged

**Main Flow** (Happy Path):
1. User navigates to Physical Count Management page (`/inventory-management/physical-count-management`)
2. System displays count list/grid view with "New Count" button
3. User clicks "New Count" button
4. System displays New Count Form modal with fields: Counter (dropdown), Department (dropdown), Store Location (dropdown), Date (date picker defaulted to today), Notes (textarea)
5. User selects Counter from dropdown (populated from tb_user where role includes 'storekeeper')
6. User selects Department from dropdown (populated from tb_department)
7. User selects Store Location from dropdown (populated from tb_location where department matches selected)
8. User verifies Date field (default: today, can backdate if needed)
9. User optionally enters Notes describing count purpose or special instructions
10. User clicks "Create Count" button
11. System validates all required fields (Counter, Department, Location, Date)
12. System generates unique count_stock_no with format `PC-{YEAR}-{SEQUENCE}` (e.g., PC-2024-001)
13. System creates new record in tb_count_stock with:
    - Generated count_stock_no
    - Resolved user ID from counter name
    - Resolved location ID and department ID from selections
    - start_date from date field
    - doc_status = 'pending'
    - count_stock_type = 'physical'
    - notes from user input
    - created_at = current timestamp
    - created_by_id = logged-in user ID
14. System inserts record into database
15. System displays success toast notification "Count session PC-2024-001 created successfully"
16. System closes New Count Form modal
17. System refreshes count list showing newly created count session at top with status badge "Pending"
18. Use case ends

**Alternative Flows**:

**Alt-1A: User Cancels Count Creation** (At step 9)
- 9a. User clicks "X" close button or "Cancel" button
- 9b. System discards form data without validation
- 9c. System closes New Count Form modal
- 9d. System returns to count list view
- Use case ends

**Alt-1B: Location Has Active Count** (At step 11)
- 11a. System detects existing count session for selected location with status 'pending' or 'in_progress'
- 11b. System displays validation error "Location already has an active count (PC-2024-025). Please complete or cancel existing count before creating new one."
- 11c. System highlights Location dropdown field in red
- 11d. User selects different location or cancels form
- Resume at step 7 or use case ends

**Exception Flows**:

**Exc-1A: Required Field Missing** (At step 11)
- System validation detects missing Counter, Department, or Location
- System displays inline error messages near empty fields: "Counter is required", "Department is required", "Location is required"
- System highlights empty fields with red border
- User fills missing fields
- Resume at step 10

**Exc-1B: Invalid Date** (At step 11)
- System detects future date entered
- System displays validation error "Count date cannot be in the future. Please select today or earlier date."
- System highlights Date field in red
- User corrects date
- Resume at step 10

**Exc-1C: Database Error** (At step 14)
- Database insert operation fails due to connection error, constraint violation, or timeout
- System logs error details with context (user ID, selected values)
- System displays error toast "Failed to create count session. Please try again or contact support."
- System keeps New Count Form open with user's entered data intact
- User can retry submission or cancel
- Resume at step 10 or use case ends

**Business Rules**:
- **BR-PCM-001**: Each count session must be assigned to a single location
- **BR-PCM-002**: Count reference numbers must be system-generated and immutable
- **BR-PCM-003**: Only one active count session per location at any time
- **BR-PCM-004**: Count date must not be a future date
- **BR-PCM-007**: Counter must be an active user with 'storekeeper' or higher role

**Related Requirements**:
- FR-PCM-001: Physical Count Session Creation
- BR-PCM-001 through BR-PCM-007: Count creation business rules
- NFR-PCM-005: Count session creation must complete within 1 second

**UI Mockups**: NewCountForm component (new-count-form.tsx)

**Notes**:
- System auto-generates count_stock_no; users cannot specify custom numbers
- Notes field optional but recommended for documenting count purpose (e.g., "Monthly cycle count", "Year-end physical inventory")
- Expected quantity population deferred to count detail entry phase (not required at session creation)

---

### UC-PCM-002: Enter Count Data for Items

**Description**: Storekeeper enters actual counted quantities for items in a count session, comparing against expected system quantities to identify variances in real-time. Counter can submit items individually as counted to track progress.

**Actor(s)**: Storekeeper

**Priority**: High

**Frequency**: Daily (during active counting periods)

**Preconditions**:
- User is authenticated with 'storekeeper' or 'counter' role
- Count session exists with status 'in_progress' (transition from 'pending' required first)
- Count session has count detail line items populated in tb_count_stock_detail
- User has permission to modify the count session (is assigned counter or has supervisor role)

**Postconditions**:
- **Success**: Actual quantities recorded in tb_count_stock_detail.qty for counted items, progress indicators updated, variances calculated and displayed
- **Failure**: No quantities saved, validation errors displayed, count session remains in previous state

**Main Flow** (Happy Path):
1. User navigates to Physical Count Management page
2. System displays count list with count sessions; user identifies count in 'in_progress' status
3. User clicks "Start Count" button on count list item (or "Continue" for partially completed count)
4. System displays Count Detail Form modal showing:
   - Header: Location name, Counter name, Count date, Reference number (read-only)
   - Items table with columns: Item Details (name, SKU, description), Expected Qty, Actual Qty (input), Unit, Submit Action (checkmark button)
   - Session notes textarea at bottom
5. System loads count detail line items from tb_count_stock_detail for this count_stock_id
6. System populates Expected Qty from tb_inventory_transaction_closing_balance.closing_qty for each product_id at the location
7. System displays items in sequence order (sequence_no ascending)
8. User locates first item physically in storage location
9. User manually counts physical quantity on-hand
10. User enters counted quantity in Actual Qty input field for that item row
11. System validates entry is non-negative number matching unit precision (integer for 'pcs', up to 3 decimals for 'kg/L')
12. System calculates item variance: `actual_qty - expected_qty` and displays with +/- prefix (e.g., "+5 pcs" or "-2.5 kg")
13. User clicks checkmark button in Submit Action column for that item
14. System marks item as submitted (isSubmitted = true), disables input field, displays green checkmark
15. System updates progress counter at top: "75 of 150 items counted - 50%"
16. User repeats steps 8-15 for remaining items
17. User periodically adds notes in Session notes textarea documenting observations (e.g., "Damaged items excluded from count", "Expired products found")
18. System auto-saves draft periodically (future enhancement) to prevent data loss
19. After all items counted, user reviews entered quantities and notes
20. User clicks "Complete Count" button
21. System validates at least one item has actual_qty entered (not null)
22. System saves all entered quantities to tb_count_stock_detail.qty field
23. System updates count session metadata:
    - total_item_count = count of all detail records
    - completed_item_count = count of detail records where qty IS NOT NULL
    - variance_percentage = calculated aggregate variance
24. System transitions count session status from 'in_progress' to 'completed' (UC-PCM-003)
25. Use case continues to UC-PCM-003

**Alternative Flows**:

**Alt-2A: User Submits Individual Items Incrementally** (At step 13-15)
- 13a. User submits items one-by-one as counted rather than entering all quantities first
- 13b. System saves submitted item quantity to database immediately (optimistic update)
- 13c. System displays green checkmark and disabled input for submitted items
- 13d. If system save fails, displays error toast and re-enables input field
- Continue with remaining items

**Alt-2B: User Cancels Count Entry Mid-Way** (At step 17)
- 17a. User clicks "Cancel" button without completing all items
- 17b. System displays confirmation dialog "You have unsaved changes. Cancel count entry? Entered quantities will be lost."
- 17c. User confirms cancellation
- 17d. System discards unsaved actual quantity entries (quantities NOT yet submitted remain null)
- 17e. System closes Count Detail Form modal
- 17f. System returns to count list; count remains 'in_progress' with partially completed state
- Use case ends

**Alt-2C: Zero Quantity Counted** (At step 10)
- 10a. User physically counts zero items (stockout or missing inventory)
- 10b. User enters "0" in Actual Qty field
- 10c. System accepts zero as valid quantity (not null, distinct from "not yet counted")
- 10d. System calculates negative variance: `0 - expected_qty` (e.g., "-50 pcs" indicates stockout)
- 10e. System highlights variance in red (large negative variance)
- Continue to step 13

**Alt-2D: User Encounters Unrecognized Item** (At step 8)
- 8a. User finds physical item in location that is not in count detail list (unexpected inventory)
- 8b. User adds note in Session notes: "Found unlisted item: [description], estimated qty: [amount]"
- 8c. Follow-up action required: Add product to master data, create separate count session, or investigate source
- Continue with remaining listed items

**Exception Flows**:

**Exc-2A: Invalid Quantity Entry** (At step 10-11)
- System detects invalid input: negative number, non-numeric characters, or precision exceeds unit specification
- System displays inline validation error "Quantity must be a non-negative number" or "Quantity precision exceeds unit (max 3 decimals for kg)"
- System highlights input field in red
- User corrects quantity entry
- Resume at step 10

**Exc-2B: Expected Quantity Lookup Failure** (At step 6)
- System cannot find closing balance record for product at location (missing tb_inventory_transaction_closing_balance record)
- System defaults expected_qty to 0 with warning icon
- System displays info tooltip "No transaction history found for this item. Expected quantity defaulted to 0."
- User proceeds with count; variance will be calculated against expected=0
- Continue to step 7

**Exc-2C: Concurrent Edit Conflict** (At step 22)
- Another user modifies same count session simultaneously (race condition)
- Database update fails due to concurrent modification (optimistic locking violation if implemented)
- System displays error "Count session modified by another user. Please refresh and re-enter quantities."
- System logs conflict details for troubleshooting
- User must reload count session and re-enter data
- Use case ends

**Business Rules**:
- **BR-PCM-010**: Actual quantity must be non-negative and match unit precision
- **BR-PCM-011**: Expected quantity retrieved from tb_inventory_transaction_closing_balance
- **BR-PCM-015**: Transition to 'completed' requires at least one item with actual quantity entered
- **BR-PCM-020**: Item-level variance calculated as `actual_qty - expected_qty` with unit suffix

**Related Requirements**:
- FR-PCM-002: Item-by-Item Count Entry
- FR-PCM-003: Count Progress Tracking
- NFR-PCM-002: Count detail form must load up to 500 items within 3 seconds
- NFR-PCM-003: Real-time variance calculations must update within 200ms

**UI Mockups**: CountDetailForm component (count-detail-form.tsx)

**Notes**:
- Large item lists (>500 items) may require pagination or virtualized scrolling for performance
- Barcode scanning integration deferred to Phase 2 (mobile app); manual entry required in Phase 1
- Auto-save drafts feature deferred to Phase 2; users should complete count in single session to avoid data loss

---

### UC-PCM-003: Complete Physical Count

**Description**: Storekeeper finalizes a physical count session after all items counted, transitioning status from 'in_progress' to 'completed' and locking the count from further modifications. System calculates final variance metrics and records completion timestamp.

**Actor(s)**: Storekeeper, Warehouse Supervisor

**Priority**: High

**Frequency**: Daily (following count entry activities)

**Preconditions**:
- Count session exists with status 'in_progress'
- At least one item in count detail has actual_qty entered (not all null)
- User has permission to complete count (is assigned counter or has supervisor role)

**Postconditions**:
- **Success**: Count session status transitioned to 'completed', end_date recorded, workflow history updated, count locked from modifications, variance metrics finalized
- **Failure**: Count remains 'in_progress', no status change, error displayed to user

**Main Flow** (Happy Path):
1. User is in Count Detail Form modal with all items counted (continuing from UC-PCM-002 step 20)
2. User reviews entered quantities across all items
3. User verifies session notes documented all discrepancies and observations
4. User clicks "Complete Count" button
5. System validates at least one item has actual_qty entered (not null)
6. System validates count session is currently in 'in_progress' status
7. System calculates final aggregate variance: `((SUM(actual_qty) - SUM(expected_qty)) / SUM(expected_qty)) * 100` rounded to 2 decimals
8. System updates tb_count_stock record:
   - doc_status = 'completed'
   - end_date = current timestamp
   - variance_percentage = calculated variance %
   - total_item_count = COUNT(tb_count_stock_detail records)
   - completed_item_count = COUNT(tb_count_stock_detail WHERE qty IS NOT NULL)
   - updated_at = current timestamp
   - updated_by_id = logged-in user ID
9. System appends workflow history entry to workflow_history JSON:
   ```json
   {
     "timestamp": "2024-04-20T14:35:22Z",
     "userId": "uuid-123",
     "userName": "John Doe",
     "fromStatus": "in_progress",
     "toStatus": "completed",
     "action": "completed",
     "note": "All 150 items counted with 2.3% variance"
   }
   ```
10. System commits database transaction
11. System triggers UC-PCM-104 (Send Count Notifications) to alert supervisor/manager of count completion
12. System displays success toast "Count PC-2024-001 completed successfully. Variance: +2.3%"
13. System closes Count Detail Form modal
14. System refreshes count list showing completed count with:
    - Status badge "Completed" (green)
    - End date displayed
    - Variance percentage with color coding (Green <2%, Yellow 2-5%, Red >5%)
    - Progress indicator "150 of 150 items - 100%"
15. User sees completed count is now read-only (no edit/delete buttons, only "View" button)
16. Use case ends

**Alternative Flows**:

**Alt-3A: User Cancels Completion** (At step 4)
- 4a. User clicks "Cancel" button instead of "Complete Count"
- 4b. System keeps Count Detail Form open with all entered data intact
- 4c. User can continue editing quantities or close form
- Resume at step 2 or use case ends

**Alt-3B: High Variance Detected** (At step 7)
- 7a. System detects variance percentage exceeds threshold (e.g., >5% configured per location)
- 7b. System displays warning dialog "High variance detected: 8.7%. Supervisor approval may be required. Continue completion?"
- 7c. User acknowledges warning and confirms completion
- 7d. System proceeds to step 8 but flags count for supervisor review (sets flag in info JSON field)
- 7e. System triggers variance alert notification to supervisor
- Continue to step 8

**Alt-3C: Partial Count Completion** (At step 5)
- 5a. System detects some items have null actual_qty (not all items counted)
- 5b. System displays confirmation dialog "Only 120 of 150 items counted. Complete count with partial data? Uncounted items will be excluded from variance calculation."
- 5c. User confirms partial completion
- 5d. System marks uncounted items as excluded (sets flag in tb_count_stock_detail.info JSON)
- 5e. System recalculates variance using only counted items
- Continue to step 7

**Exception Flows**:

**Exc-3A: No Items Counted** (At step 5)
- System validates count detail and finds all items have null actual_qty
- System displays error "Cannot complete count with no items counted. Please enter at least one actual quantity."
- System prevents status transition
- User must return to count entry (UC-PCM-002) or cancel
- Use case ends

**Exc-3B: Invalid Current Status** (At step 6)
- System detects count session status is not 'in_progress' (e.g., already 'completed' or 'cancelled' due to concurrent modification)
- System displays error "Count session cannot be completed. Current status: Completed. Another user may have already completed this count."
- System refreshes count detail view to show current state
- Use case ends

**Exc-3C: Database Transaction Failure** (At step 10)
- Database commit fails due to connection loss, constraint violation, or timeout
- System rolls back all changes (status remains 'in_progress')
- System logs error with full context
- System displays error "Failed to complete count. Please check your connection and try again."
- User can retry completion
- Resume at step 4

**Business Rules**:
- **BR-PCM-015**: Transition to 'completed' requires at least one item with actual quantity entered
- **BR-PCM-016**: Completed counts are immutable; no modifications allowed
- **BR-PCM-018**: Status transitions must record timestamp, user, and before/after status in workflow_history
- **BR-PCM-019**: Variance % calculation uses formula `((SUM(actual) - SUM(expected)) / SUM(expected)) * 100`
- **BR-PCM-023**: Variance >5% flagged as high-variance requiring supervisor review

**Related Requirements**:
- FR-PCM-004: Count Status Workflow
- FR-PCM-003: Count Progress Tracking
- BR-PCM-013 through BR-PCM-018: Workflow state transition rules
- NFR-PCM-019: Database transactions must ensure atomicity

**UI Mockups**: CountDetailForm component with "Complete Count" button

**Notes**:
- Completion locks count session; reopening for editing requires supervisor override (future enhancement)
- High-variance counts may trigger approval workflow before adjustment posting (deferred to Phase 2)
- Partial count completion supported for situations where some items physically inaccessible during count window

---

### UC-PCM-004: Review Count Progress

**Description**: Warehouse Supervisor or Inventory Manager reviews ongoing count sessions to monitor progress, identify delays, and provide support to counting teams. System displays real-time completion percentages and variance indicators.

**Actor(s)**: Warehouse Supervisor, Inventory Manager

**Priority**: Medium

**Frequency**: Multiple times daily (during active counting periods)

**Preconditions**:
- User is authenticated with 'supervisor' or 'manager' role
- At least one count session exists in system
- User has permission to view counts for locations under their management

**Postconditions**:
- **Success**: User views current count progress, identifies counts requiring attention, takes appropriate action (reassign, contact counter, etc.)
- **Failure**: No postcondition changes (read-only operation)

**Main Flow** (Happy Path):
1. User navigates to Physical Count Management page
2. System displays count list with all count sessions user has permission to view
3. System applies default filter: Status = "In Progress" to focus on active counts
4. User scans list for counts with concerning indicators:
   - Low completion percentage despite time elapsed
   - High variance percentage (>5%)
   - Counts approaching end-of-day without completion
5. User clicks on count list item to expand details (or views Grid View card)
6. System displays count summary information:
   - Location name, Department, Assigned counter name
   - Count date, Reference number, Current status
   - Progress: "75 of 150 items counted - 50%"
   - Variance: "+2.3%" with color coding
   - Last count date for comparison
   - Session notes preview
7. User identifies count with slow progress (e.g., only 30% complete after 3 hours)
8. User contacts assigned counter via phone/radio to check status or offer assistance
9. Counter reports issue (e.g., items in hard-to-reach storage area)
10. User decides to reassign count or adjust scope (future enhancement: inline reassignment)
11. User adds supervisor note documenting intervention (future enhancement)
12. User continues monitoring remaining active counts
13. Use case ends

**Alternative Flows**:

**Alt-4A: High Variance Requires Investigation** (At step 7)
- 7a. User identifies count with high variance percentage (>5%) even though only partially complete
- 7b. User clicks on count to view item-level details (opens Count Detail Form in read-only mode)
- 7c. System displays items sorted by absolute variance descending (highest variance items first)
- 7d. User identifies products with large discrepancies (e.g., "Olive Oil Premium: Expected 50, Actual 15, Variance -70%")
- 7e. User initiates investigation workflow: check recent issues, verify counting accuracy, inspect storage area
- 7f. User documents investigation findings in session notes or creates follow-up task
- Continue monitoring other counts

**Alt-4B: Multiple Counts for Same Location** (At step 4)
- 4a. User notices two count sessions for same location (one pending, one in-progress)
- 4b. System should have prevented this per BR-PCM-003, but occurred due to data issue or workaround
- 4c. User contacts counter to determine which count is valid
- 4d. User cancels duplicate/erroneous count via UC-PCM-007 (Cancel In-Progress Count)
- Continue monitoring remaining counts

**Exception Flows**:

**Exc-4A: Count Stalled for Extended Period** (At step 7)
- User identifies count in-progress for >6 hours with <20% completion
- User attempts to contact assigned counter but cannot reach them (shift ended, absent)
- User escalates to Inventory Manager for decision
- Manager decides to cancel stalled count and reschedule with different counter
- Manager executes UC-PCM-007 (Cancel In-Progress Count) with reason note
- Use case ends

**Business Rules**:
- **BR-PCM-023**: Variance >5% flagged as high-variance for supervisor review
- **BR-PCM-024**: Users can only view count sessions for locations they have permission to access

**Related Requirements**:
- FR-PCM-003: Count Progress Tracking
- FR-PCM-006: Filtering and Search Capabilities
- FR-PCM-007: Role-Based Permission Controls
- NFR-PCM-004: Filtering operations must return results within 500ms

**UI Mockups**: PhysicalCountManagement page (page.tsx) with list/grid views

**Notes**:
- Read-only review; modification actions (reassign, cancel) are separate use cases
- Future enhancement: Real-time progress updates via WebSocket for live monitoring without manual refresh
- Future enhancement: Dashboard view showing aggregated progress metrics across all active counts

---

### UC-PCM-005: Filter and Search Counts

**Description**: User applies filters and search criteria to quickly locate specific count sessions within large datasets, narrowing results by status, location, department, or text search.

**Actor(s)**: All Users (Storekeeper, Supervisor, Manager, Finance Manager)

**Priority**: Medium

**Frequency**: Multiple times daily

**Preconditions**:
- User is authenticated
- At least one count session exists in system
- User has permission to view counts for at least one location

**Postconditions**:
- **Success**: Count list filtered to show only matching sessions, filter state preserved during session
- **Failure**: No postcondition changes (filter operation failure displays error but doesn't alter data)

**Main Flow** (Happy Path):
1. User navigates to Physical Count Management page
2. System displays count list with all count sessions (no filters applied initially)
3. User identifies need to filter counts (e.g., wants to see only completed counts from last week)
4. User clicks Status dropdown filter in toolbar
5. System displays dropdown options: All Statuses, Pending, In Progress, Completed
6. User selects "Completed" option
7. System applies status filter, updates count list to show only completed count sessions
8. System displays count of filtered results (e.g., "Showing 23 of 47 counts")
9. User additionally clicks Department dropdown filter
10. System displays department options populated from tb_department: All Departments, F&B, Housekeeping, Front Office, etc.
11. User selects "F&B" department
12. System applies cumulative filter (Status=Completed AND Department=F&B)
13. System updates count list showing only completed counts for F&B department (e.g., 8 results)
14. User clicks Building icon button to reveal Location filter
15. System displays location dropdown populated from tb_location for F&B department
16. User selects "Main Kitchen Store" location
17. System applies third cumulative filter, narrows results further (e.g., 3 results)
18. System displays active filter pills: [Completed] [F&B] [Main Kitchen Store ×]
19. User reviews filtered count sessions
20. User clicks "×" on "Main Kitchen Store" filter pill to remove location filter
21. System removes location filter, expands results back to all F&B completed counts (8 results)
22. User completes task using filtered data
23. Use case ends

**Alternative Flows**:

**Alt-5A: Text Search** (At step 3)
- 3a. User wants to find count by reference number or counter name
- 3b. User types search text in Search field: "PC-2024-025" or "John Doe"
- 3c. System applies text search across: count_stock_no, location_name, counter_name fields
- 3d. System updates count list showing only matching results
- 3e. User clicks result to view count details
- Continue to step 22

**Alt-5B: Clear All Filters** (At step 19)
- 19a. User wants to reset all filters to see full unfiltered list
- 19b. User clicks "Clear Filters" button (future enhancement) or manually removes each filter
- 19c. System removes all active filters (Status, Department, Location, Search)
- 19d. System reloads full count list without any filters applied
- 19e. System displays "Showing all 47 counts"
- Continue to step 22

**Alt-5C: No Results Found** (At step 13)
- 13a. System applies filters but no count sessions match the criteria (result count = 0)
- 13b. System displays empty state message: "No counts found matching your filters. Try adjusting filter criteria."
- 13c. System suggests removing or changing filters
- 13d. User modifies filter selections or clears filters to broaden search
- Resume at step 4 or step 19b

**Exception Flows**:

**Exc-5A: Filter Dropdown Load Failure** (At step 10)
- System attempts to load department options from tb_department but query fails
- System logs error details
- System displays error message in dropdown: "Failed to load departments. Please refresh page."
- System disables Department dropdown temporarily
- User can still use Status and Location filters or refresh page
- Use case ends

**Exc-5B: Performance Degradation with Large Dataset** (At step 7)
- User applies filter on dataset with >1000 count sessions (exceeds client-side filtering threshold)
- Client-side filtering takes >2 seconds, causing UI lag
- System displays loading spinner during filter operation
- Filter completes but user experience degraded
- Future mitigation: Implement server-side filtering/pagination for large datasets
- Continue to step 8

**Business Rules**:
- **BR-PCM-024**: Users can only view count sessions for locations they have permission to access (filter options automatically scoped to user permissions)

**Related Requirements**:
- FR-PCM-006: Filtering and Search Capabilities
- NFR-PCM-001: Search response time <500ms for datasets up to 1000 records
- NFR-PCM-004: Filtering operations must return results within 500ms

**UI Mockups**: PhysicalCountManagement page (page.tsx) filter toolbar with dropdowns and search field

**Notes**:
- Filters apply cumulatively (AND logic, not OR)
- Filter state preserved during user session (component state, future: localStorage for persistence across sessions)
- Text search case-insensitive for better usability
- Future enhancement: Saved filter presets (e.g., "My Active Counts", "High Variance Completed")

---

### UC-PCM-006: View Count Details (Read-Only)

**Description**: Finance Manager or Internal Auditor views completed count session details in read-only mode for audit verification, variance review, or approval workflows without ability to modify data.

**Actor(s)**: Finance Manager, Internal Auditor, Cost Controller

**Priority**: Medium

**Frequency**: Weekly to Monthly (audit reviews, variance analysis)

**Preconditions**:
- User is authenticated with appropriate role (finance, auditor)
- Count session exists with status 'completed'
- User has permission to view counts for the location (read-only permission)

**Postconditions**:
- **Success**: User reviews count details, documents findings, may initiate approval workflow for high-variance adjustments (future)
- **Failure**: No postcondition changes (read-only operation)

**Main Flow** (Happy Path):
1. User navigates to Physical Count Management page
2. System displays count list; user applies Status filter = "Completed"
3. User identifies count session requiring review (e.g., high variance count flagged by supervisor)
4. User clicks on count list item or clicks "View" button
5. System displays Count Detail Form in read-only mode:
   - All input fields disabled (grayed out, not editable)
   - No "Complete Count" button (replaced with "Close" button)
   - All data displayed for viewing: Header info, Items table, Variance calculations, Notes
6. User reviews header information: Location, Counter, Count date, Reference number, Status = Completed, End date
7. User reviews items table focusing on high-variance items:
   - Sorts table by variance column (descending) to see largest discrepancies first
   - Identifies items with variance >10% or >$500 value impact
8. User cross-references item variances with session notes to understand explanations:
   - Notes indicate: "Damaged items excluded from count (5 bottles broken)"
   - Notes indicate: "Expired products found and set aside for disposal (12 kg)"
9. User documents review findings in audit log or compliance system (external to this module)
10. User determines variance is acceptable and properly documented per policy
11. User clicks "Close" button
12. System closes Count Detail Form modal
13. User returns to count list and marks review as complete in audit tracking system (external)
14. Use case ends

**Alternative Flows**:

**Alt-6A: Variance Requires Additional Investigation** (At step 9)
- 9a. User identifies unexplained variance not documented in notes
- 9b. User contacts Inventory Manager for clarification
- 9c. Manager investigates and provides explanation (e.g., missing transaction, data entry error)
- 9d. Manager adds supplemental notes to count session (if system allows post-completion notes)
- 9e. User documents explanation in audit log and continues review
- Continue to step 11

**Alt-6B: High Variance Requires Approval** (At step 10)
- 10a. User determines variance exceeds auto-approval threshold (e.g., >$5000 inventory value impact)
- 10b. User initiates approval workflow: Create approval request, assign to Finance Director
- 10c. System (future enhancement) creates approval task linked to count session
- 10d. Count adjustment posting blocked until approval granted
- 10e. User documents approval request in audit log
- Continue to step 11

**Alt-6C: Export Count Data for Reporting** (At step 7)
- 7a. User wants to export count details for inclusion in monthly variance report
- 7b. User clicks "Export" button (future enhancement) or uses Reporting Module integration (UC-PCM-201)
- 7c. System generates Excel or PDF report with count details and variance analysis
- 7d. User saves export file and incorporates into variance report
- Continue to step 8

**Exception Flows**:

**Exc-6A: Missing or Incomplete Notes** (At step 8)
- User expects to find variance explanation in notes but notes field is empty or vague
- User cannot complete audit review without proper documentation
- User escalates to Inventory Manager: "Count PC-2024-015 has 8.5% variance but no explanation notes. Please provide details."
- Manager adds missing notes retroactively (if system allows, or via separate documentation)
- User resumes review once documentation provided
- Use case ends

**Business Rules**:
- **BR-PCM-016**: Completed counts are immutable; read-only access for all users except authorized finance roles for adjustment posting
- **BR-PCM-024**: Users can only view count sessions for locations they have permission to access
- **BR-PCM-028**: Completed counts visible to users with inventory read permission; modifications restricted to finance role

**Related Requirements**:
- FR-PCM-007: Role-Based Permission Controls
- FR-PCM-006: Filtering and Search Capabilities (to locate counts for review)
- NFR-PCM-010: Complete audit trail of all count activities for compliance

**UI Mockups**: CountDetailForm component in read-only mode (all inputs disabled)

**Notes**:
- Read-only mode enforced both in UI (disabled inputs) and backend (server actions validate user cannot modify completed counts)
- Future enhancement: Approval workflow integration for high-variance counts requiring finance director sign-off before adjustment posting
- Export functionality deferred to Phase 2 (Reporting Module integration)

---

### UC-PCM-007: Cancel In-Progress Count

**Description**: Warehouse Supervisor or Inventory Manager cancels an in-progress count session when counting cannot be completed due to operational issues, staffing problems, or data quality concerns. System marks count as cancelled with mandatory reason note while preserving audit trail.

**Actor(s)**: Warehouse Supervisor, Inventory Manager

**Priority**: Low

**Frequency**: Occasional (1-2 times per month)

**Preconditions**:
- User is authenticated with 'supervisor' or 'manager' role
- Count session exists with status 'in_progress'
- User has permission to cancel counts for the location (supervisor or higher)

**Postconditions**:
- **Success**: Count session status changed to 'cancelled', cancellation reason recorded, timestamp and cancelling user logged, count excluded from active count lists
- **Failure**: Count remains 'in_progress', no status change, error displayed to user

**Main Flow** (Happy Path):
1. User navigates to Physical Count Management page
2. System displays count list; user identifies in-progress count requiring cancellation
3. User determines cancellation necessary due to operational issue (e.g., assigned counter called in sick, storage area inaccessible due to maintenance)
4. User clicks on count list item to view details
5. User clicks "Cancel Count" button (displayed only for in-progress counts to users with supervisor role)
6. System displays cancellation confirmation dialog:
   - Title: "Cancel Count PC-2024-018?"
   - Warning: "This action will mark the count as cancelled and cannot be undone. Partial count data will be preserved for audit."
   - Required field: Cancellation Reason (text area, placeholder: "Explain why this count is being cancelled...")
   - Buttons: [Cancel] [Confirm Cancellation]
7. User enters cancellation reason in text area: "Counter called in sick; rescheduling count for tomorrow with backup counter."
8. User clicks "Confirm Cancellation" button
9. System validates cancellation reason is not empty (minimum 10 characters)
10. System validates count session is currently in 'in_progress' status
11. System updates tb_count_stock record:
    - doc_status = 'cancelled'
    - end_date = current timestamp (cancellation time)
    - deleted_at = current timestamp (soft delete for audit preservation)
    - deleted_by_id = logged-in user ID
12. System appends workflow history entry:
    ```json
    {
      "timestamp": "2024-04-20T11:15:00Z",
      "userId": "uuid-456",
      "userName": "Jane Smith (Supervisor)",
      "fromStatus": "in_progress",
      "toStatus": "cancelled",
      "action": "cancelled",
      "note": "Counter called in sick; rescheduling count for tomorrow with backup counter."
    }
    ```
13. System commits database transaction
14. System displays success toast "Count PC-2024-018 cancelled successfully"
15. System closes cancellation dialog
16. System removes cancelled count from default count list view (Status filter excludes cancelled by default)
17. Cancelled count remains visible when Status filter = "All" or "Cancelled" (future: add Cancelled status option)
18. Use case ends

**Alternative Flows**:

**Alt-7A: User Abandons Cancellation** (At step 7)
- 7a. User reviews cancellation dialog and decides not to cancel (count can still be completed)
- 7b. User clicks "Cancel" button (closes dialog without cancelling count)
- 7c. System closes cancellation dialog without any changes
- 7d. Count remains in 'in_progress' status
- Use case ends

**Alt-7B: User Provides Detailed Cancellation Reason** (At step 7)
- 7a. User enters comprehensive cancellation reason with context and next steps
- 7b. Example: "Storage area flooded due to burst pipe. Count cannot continue. Facilities working on repair. Will reschedule full count after area cleaned and restocked. Estimated 3-5 days delay."
- 7c. System accepts detailed reason (supports up to 1000 characters)
- 7d. Detailed reason preserved in workflow_history for audit and planning purposes
- Continue to step 9

**Exception Flows**:

**Exc-7A: Missing Cancellation Reason** (At step 9)
- System validates cancellation reason field and finds it empty or too short (<10 characters)
- System displays inline validation error "Cancellation reason is required (minimum 10 characters). Please explain why this count is being cancelled."
- System highlights Cancellation Reason field in red
- System prevents cancellation until valid reason provided
- User enters reason
- Resume at step 8

**Exc-7B: Invalid Current Status** (At step 10)
- System detects count session status is not 'in_progress' (e.g., already 'completed' or 'cancelled' by another user concurrently)
- System displays error "Count cannot be cancelled. Current status: Completed. Another user may have completed this count."
- System closes cancellation dialog and refreshes count list to show current state
- Use case ends

**Exc-7C: Database Update Failure** (At step 13)
- Database commit fails due to connection loss or constraint violation
- System rolls back changes (status remains 'in_progress')
- System logs error with full context
- System displays error "Failed to cancel count. Please check your connection and try again."
- User can retry cancellation
- Resume at step 5

**Business Rules**:
- **BR-PCM-017**: Cancelled counts require mandatory cancellation reason
- **BR-PCM-018**: Status changes must record timestamp, user, and before/after status in workflow_history
- **BR-PCM-026**: Only users with 'manager' or higher role can cancel in-progress counts
- **BR-PCM-006**: Cancelled counts maintained in audit trail (soft delete, not physical delete)

**Related Requirements**:
- FR-PCM-008: Count Deletion and Cancellation
- FR-PCM-004: Count Status Workflow
- BR-PCM-009, BR-PCM-017, BR-PCM-018: Cancellation business rules
- NFR-PCM-018: Soft delete pattern for audit trail preservation

**UI Mockups**: Cancellation confirmation dialog with reason text area

**Notes**:
- Cancelled counts distinguished from deleted pending counts: Cancelled = partially completed then stopped, Deleted = removed before counting started
- Cancelled counts preserved for audit: can be viewed in read-only mode, included in cancelled counts reports
- Future enhancement: Cancellation may create follow-up task for rescheduling count with new counter assignment

---

### UC-PCM-008: Delete Pending Count

**Description**: Storekeeper or Warehouse Supervisor deletes a pending count session that was created incorrectly or is no longer needed before any counting activity begins. System soft-deletes the record to maintain audit trail.

**Actor(s)**: Storekeeper, Warehouse Supervisor

**Priority**: Low

**Frequency**: Occasional (1-2 times per week)

**Preconditions**:
- User is authenticated with 'storekeeper' or 'supervisor' role
- Count session exists with status 'pending'
- User has permission to delete count (is creator or has supervisor role for the location)

**Postconditions**:
- **Success**: Count session soft-deleted (deleted_at timestamp set), removed from default count list views, preserved in database for audit
- **Failure**: Count remains active, no deletion, error displayed to user

**Main Flow** (Happy Path):
1. User navigates to Physical Count Management page
2. System displays count list including pending count sessions
3. User identifies pending count requiring deletion (e.g., created with wrong location, duplicate entry, no longer needed)
4. User clicks delete icon button (trash icon) on count list item row
5. System displays deletion confirmation dialog:
   - Title: "Delete Count PC-2024-030?"
   - Warning icon and message: "This will permanently delete this count session. This action cannot be undone."
   - Count details summary: Location, Counter, Date for verification
   - Buttons: [Cancel] [Confirm Delete]
6. User verifies deletion details match intended count
7. User clicks "Confirm Delete" button
8. System validates count session is currently in 'pending' status (not 'in_progress' or 'completed')
9. System validates user has permission to delete: is creator (created_by_id matches user ID) OR has supervisor role for location
10. System performs soft delete on tb_count_stock record:
    - deleted_at = current timestamp
    - deleted_by_id = logged-in user ID
    - Record remains in database but flagged as deleted
11. System commits database transaction
12. System displays success toast "Count PC-2024-030 deleted successfully"
13. System closes confirmation dialog
14. System removes deleted count from count list view (default view excludes soft-deleted records)
15. Use case ends

**Alternative Flows**:

**Alt-8A: User Cancels Deletion** (At step 7)
- 7a. User reviews confirmation dialog and decides not to delete (count may still be needed)
- 7b. User clicks "Cancel" button
- 7c. System closes confirmation dialog without any changes
- 7d. Count remains in 'pending' status
- Use case ends

**Alt-8B: Bulk Deletion of Multiple Pending Counts** (At step 3, future enhancement)
- 3a. User needs to delete multiple pending counts (e.g., cleanup of test data, mass rescheduling)
- 3b. User selects multiple count sessions using checkboxes
- 3c. User clicks "Delete Selected" button (bulk action)
- 3d. System displays confirmation showing count of selected sessions: "Delete 5 count sessions?"
- 3e. User confirms bulk deletion
- 3f. System soft-deletes all selected pending counts in single transaction
- 3g. System displays success toast "5 count sessions deleted successfully"
- Use case ends

**Exception Flows**:

**Exc-8A: Invalid Status for Deletion** (At step 8)
- System detects count session status is not 'pending' (e.g., 'in_progress' or 'completed')
- System displays error "Cannot delete count with status: In Progress. Only pending counts can be deleted. Use Cancel for in-progress counts."
- System prevents deletion and closes dialog
- User must use UC-PCM-007 (Cancel) for in-progress counts instead
- Use case ends

**Exc-8B: Insufficient Permission** (At step 9)
- System detects user is not creator and does not have supervisor role for location
- System displays error "You do not have permission to delete this count. Only the creator or a supervisor can delete pending counts."
- System prevents deletion and closes dialog
- User must request supervisor to delete count if still needed
- Use case ends

**Exc-8C: Database Delete Failure** (At step 11)
- Database update fails (setting deleted_at timestamp) due to connection loss or constraint violation
- System logs error details
- System displays error "Failed to delete count. Please try again or contact support."
- User can retry deletion
- Resume at step 4

**Business Rules**:
- **BR-PCM-009**: Only pending count sessions can be deleted; in-progress counts must be cancelled (UC-PCM-007)
- **BR-PCM-025**: Only count creator or users with 'supervisor' role can delete pending counts
- **BR-PCM-006**: Soft delete pattern maintains audit trail; records not physically removed from database
- **BR-PCM-016**: Completed counts cannot be deleted (immutable)

**Related Requirements**:
- FR-PCM-008: Count Deletion and Cancellation
- BR-PCM-009, BR-PCM-025: Deletion business rules
- NFR-PCM-018: Data retention policy with soft delete pattern

**UI Mockups**: Delete confirmation dialog with warning message

**Notes**:
- Soft delete (not physical delete) supports audit requirements and potential data recovery
- Deleted counts excluded from default views but can be accessed via administrative reporting interface (future)
- Delete button hidden for non-pending counts; system enforces status validation on both UI and server
- Future enhancement: Purge process for permanently removing old deleted records per retention policy (e.g., after 7 years)

---

## System Use Cases

### UC-PCM-101: Enforce Status Workflow Transitions

**Description**: Automated system process ensuring count session status transitions follow strict sequencing rules (Pending → In Progress → Completed/Cancelled) and preventing invalid state changes. Workflow engine validates transitions and records history.

**Trigger**: User action attempting count status change (Start Count, Complete Count, Cancel Count buttons)

**Actor(s)**:
- **Primary**: Workflow Engine (System)
- **Secondary**: User initiating status change

**Priority**: High

**Frequency**: Real-time (triggered by user actions)

**Preconditions**:
- Count session exists in database with current doc_status value
- User has permission to perform requested status transition
- Server action receives transition request with count_stock_id and target status

**Postconditions**:
- **Success**: Status transition validated and permitted, database updated with new status, workflow history appended
- **Failure**: Status transition rejected, error returned to user, database remains unchanged

**Main Flow**:
1. System receives status transition request from server action (e.g., completeCountSession action)
2. System loads current count session from tb_count_stock using count_stock_id
3. System retrieves current doc_status value (e.g., 'in_progress')
4. System determines requested target status from action type (e.g., 'completed')
5. System validates transition against allowed state machine:
   - 'pending' → 'in_progress': ALLOWED (Start Count)
   - 'in_progress' → 'completed': ALLOWED (Complete Count)
   - 'in_progress' → 'cancelled': ALLOWED (Cancel Count)
   - 'completed' → any: FORBIDDEN (immutable)
   - 'cancelled' → any: FORBIDDEN (immutable)
   - All other transitions: FORBIDDEN
6. Transition is ALLOWED; system proceeds
7. System validates business rules for specific transition:
   - For 'in_progress' → 'completed': Validate at least one item has actual_qty (BR-PCM-015)
   - For 'in_progress' → 'cancelled': Validate cancellation reason provided (BR-PCM-017)
   - For 'pending' → 'in_progress': Validate assigned counter exists and is active (BR-PCM-014)
8. All validations pass; system prepares workflow history entry
9. System appends new entry to workflow_history JSON array:
   ```json
   {
     "timestamp": "{ISO8601 datetime}",
     "userId": "{user_id}",
     "userName": "{user_name}",
     "fromStatus": "{current_status}",
     "toStatus": "{target_status}",
     "action": "{action_verb}",
     "note": "{optional note}"
   }
   ```
10. System updates tb_count_stock record:
    - doc_status = target_status
    - end_date = current timestamp (if transitioning to 'completed' or 'cancelled')
    - workflow_history = updated JSON array
    - workflow_current_stage = target_status (if workflow_id present)
    - updated_at = current timestamp
    - updated_by_id = user_id
11. System commits database transaction
12. System returns success result to server action
13. Server action propagates success to UI layer
14. Process completes

**Alternative Flows**:

**Alt-101A: Transition to Cancelled Status** (At step 4-7)
- 4a. Target status is 'cancelled' (from 'in_progress')
- 5a. System validates transition 'in_progress' → 'cancelled': ALLOWED
- 7a. System validates cancellation reason provided in request (mandatory per BR-PCM-017)
- 7b. System sets deleted_at timestamp (soft delete) in addition to status change
- 9a. System includes cancellation reason in workflow history entry note field
- Continue to step 10

**Alt-101B: Transition with Approval Workflow** (At step 7, future enhancement)
- 7a. System detects count has workflow_id assigned (approval workflow required)
- 7b. System checks if current workflow stage permits direct status change
- 7c. If workflow requires approval: System blocks transition, returns "Approval required" error
- 7d. If workflow approval already granted: System permits transition and updates workflow_current_stage
- Continue to step 8 or return error

**Exception Flows**:

**Exc-101A: Invalid Transition Attempted** (At step 5)
- System detects requested transition is FORBIDDEN per state machine
- Example: User attempts to transition 'completed' → 'in_progress' (reopening completed count)
- System rejects transition
- System logs invalid transition attempt with user ID and details
- System returns error to server action: "Invalid status transition: Cannot change status from 'completed' to 'in_progress'"
- Server action returns HTTP 400 Bad Request with error message
- UI displays error toast to user
- Process ends

**Exc-101B: Business Rule Validation Failure** (At step 7)
- System validates transition-specific business rules and finds violation
- Example: User attempts 'in_progress' → 'completed' but no items have actual_qty entered
- System rejects transition
- System returns error: "Cannot complete count: No items have been counted. Please enter at least one actual quantity."
- Server action returns HTTP 400 Bad Request
- UI displays validation error to user
- Process ends

**Exc-101C: Concurrent Modification Conflict** (At step 11)
- Database update fails due to optimistic locking violation (another user modified count simultaneously)
- System detects current doc_status in database differs from value retrieved in step 3
- System rolls back transaction
- System returns error: "Count status modified by another user. Please refresh and try again."
- Server action returns HTTP 409 Conflict
- UI prompts user to reload count details
- Process ends

**Business Rules**:
- **BR-PCM-013**: Status transitions must follow strict sequence: Pending → In Progress → Completed (no backward transitions except cancellation)
- **BR-PCM-014**: Transition Pending → In Progress requires assigned counter, count date, location
- **BR-PCM-015**: Transition In Progress → Completed requires at least one item with actual quantity
- **BR-PCM-016**: Completed counts are immutable; no further status changes permitted
- **BR-PCM-017**: Cancelled counts require mandatory cancellation reason
- **BR-PCM-018**: Status changes must record timestamp, user, before/after status in workflow_history

**SLA**:
- **Processing Time**: <200ms for status validation and transition
- **Availability**: 99.9% uptime (follows main application SLA)
- **Recovery Time**: Automatic rollback on error; no manual intervention required

**Monitoring**:
- Count of status transitions by type (pending→in_progress, in_progress→completed, etc.)
- Invalid transition attempt count and types
- Transition validation failure reasons
- Average transition processing time

**Related Requirements**:
- FR-PCM-004: Count Status Workflow
- BR-PCM-013 through BR-PCM-018: Workflow state transition rules
- NFR-PCM-019: Database transactions must ensure atomicity

---

### UC-PCM-102: Calculate Expected Quantities

**Description**: Automated system process retrieving expected inventory quantities for count items by querying the inventory transaction closing balance table. Provides baseline for variance calculation during count entry.

**Trigger**: Count Detail Form load (when user starts entering count data)

**Actor(s)**:
- **Primary**: Inventory Transaction System (provides closing balance data)
- **Secondary**: Count Detail Form (consumes expected quantities)

**Priority**: High

**Frequency**: Real-time (on-demand when count detail form opened)

**Preconditions**:
- Count session exists with count detail line items in tb_count_stock_detail
- Inventory transaction closing balance records exist in tb_inventory_transaction_closing_balance for products at location
- Database connection available

**Postconditions**:
- **Success**: Expected quantities populated in count detail records, displayed in Count Detail Form for variance comparison
- **Failure**: Expected quantities default to 0 with warning indicator; count can proceed but variance calculation affected

**Main Flow**:
1. User opens Count Detail Form for count session (continuing from UC-PCM-002)
2. System loads count session record from tb_count_stock
3. System queries tb_count_stock_detail for all line items where count_stock_id matches
4. For each count detail line item:
   - 4a. System extracts product_id and location_id from count session
   - 4b. System queries tb_inventory_transaction_closing_balance for most recent closing balance:
     ```sql
     SELECT closing_qty
     FROM tb_inventory_transaction_closing_balance
     WHERE product_id = :product_id
       AND location_id = :location_id
     ORDER BY closing_date DESC
     LIMIT 1
     ```
   - 4c. System retrieves closing_qty value (e.g., 50.00)
   - 4d. System assigns closing_qty to expectedQuantity field in count detail data structure
5. System handles products with no closing balance:
   - 5a. Query returns no rows for product (product never received at location or new product)
   - 5b. System defaults expectedQuantity to 0
   - 5c. System sets warning flag: hasClosingBalance = false
6. System compiles full count detail dataset with expected quantities populated
7. System returns dataset to Count Detail Form for rendering
8. Count Detail Form displays items with Expected Qty column populated
9. Items with hasClosingBalance = false display warning icon with tooltip: "No transaction history found. Expected quantity defaulted to 0."
10. Process completes

**Alternative Flows**:

**Alt-102A: Expected Quantity from Specific Date** (At step 4b, future enhancement)
- 4b1. System queries closing balance as of specific cutoff date (e.g., end of prior month for monthly count)
- 4b2. SQL query modified to add condition: `AND closing_date <= :cutoff_date`
- 4b3. System retrieves historical closing balance rather than most recent
- 4b4. Count variance calculated against historical baseline for reconciliation purposes
- Continue to step 4c

**Alt-102B: Batch Query Optimization** (At step 4)
- 4a. For performance, system batches expected quantity lookups rather than querying one-by-one
- 4b. System issues single SQL query with IN clause for all product_ids:
   ```sql
   SELECT DISTINCT ON (product_id) product_id, closing_qty
   FROM tb_inventory_transaction_closing_balance
   WHERE product_id IN (:product_id_list)
     AND location_id = :location_id
   ORDER BY product_id, closing_date DESC
   ```
- 4c. System maps results back to count detail line items by product_id
- 4d. Products not in result set default to expectedQuantity = 0
- Continue to step 5

**Exception Flows**:

**Exc-102A: Database Query Failure** (At step 4b)
- Database query fails due to connection timeout, table lock, or server error
- System logs error with query details and count session context
- System defaults expectedQuantity to 0 for failed lookups
- System sets error flag in count detail record
- System displays warning banner in Count Detail Form: "Unable to load expected quantities. Please verify network connection."
- Count can proceed with expected=0 but variance calculations will be inaccurate
- Process continues with degraded data

**Exc-102B: Closing Balance Table Missing** (At step 4b)
- Query fails because tb_inventory_transaction_closing_balance table does not exist (database migration issue)
- System logs critical error
- System displays error message: "Inventory closing balance data unavailable. Cannot load count details."
- System prevents Count Detail Form from opening
- Administrator must resolve database schema issue
- Process ends

**Exc-102C: Inconsistent Unit of Measure** (At step 4c)
- Closing balance record found but unit of measure differs from product master (data integrity issue)
- Example: Product master defines unit='pcs' but closing balance calculated in 'kg'
- System logs warning with product_id and unit mismatch details
- System applies unit conversion if conversion factor exists (future enhancement)
- Otherwise, system displays expected quantity with asterisk and tooltip warning
- Continue to step 4d with warning

**Data Contract**:

**Input Data Requirements**:
- **count_stock_id**: UUID of count session
- **product_id**: UUID of product (from tb_count_stock_detail)
- **location_id**: UUID of storage location (from tb_count_stock)

**Output Data Structure**:
```typescript
interface CountDetailWithExpected {
  id: string;                      // count_stock_detail.id
  productId: string;
  productName: string;
  productSku: string;
  expectedQuantity: number;        // from tb_inventory_transaction_closing_balance.closing_qty
  actualQuantity: number | null;   // user-entered count (null if not yet counted)
  unit: string;                    // unit of measure
  hasClosingBalance: boolean;      // false if expected quantity defaulted to 0
  closingBalanceDate: Date | null; // date of closing balance record (for reference)
}
```

**Business Rules**:
- **BR-PCM-011**: Expected quantity retrieved from tb_inventory_transaction_closing_balance.closing_qty
- **BR-PCM-022**: Count adjustment value (future) calculated using expected quantity as baseline

**SLA**:
- **Query Time**: <100ms per product lookup (target <2 seconds for 500 products with batch query)
- **Availability**: Depends on inventory transaction system availability (99.9% target)

**Monitoring**:
- Expected quantity lookup success/failure rate
- Query execution time metrics
- Count of products with missing closing balance
- Database connection error frequency

**Related Requirements**:
- FR-PCM-002: Item-by-Item Count Entry (depends on expected quantities)
- BR-PCM-011: Expected quantity data source specification
- NFR-PCM-002: Count detail form must load up to 500 items within 3 seconds

---

### UC-PCM-103: Calculate Variance Metrics

**Description**: Automated system process calculating variance percentages and absolute variances at both item level and aggregate count session level. Provides real-time variance visibility during count entry and final variance metrics upon completion.

**Trigger**: User enters actual quantity for count item, or user completes count session

**Actor(s)**:
- **Primary**: System (calculation engine)
- **Secondary**: Count Detail Form (displays calculated variances)

**Priority**: High

**Frequency**: Real-time (triggered by quantity entry or count completion)

**Preconditions**:
- Count detail record exists with both expected_qty and actual_qty populated
- Expected quantity is non-zero (to avoid division by zero in percentage calculation)

**Postconditions**:
- **Success**: Variance values calculated and displayed to user, color coding applied based on thresholds
- **Failure**: Variance calculation skipped with error indicator; count can proceed but without variance visibility

**Main Flow**:
1. User enters actual quantity value in Count Detail Form input field (continuing from UC-PCM-002 step 10)
2. System receives actualQuantity value from UI input
3. System retrieves expectedQuantity for that count detail line item (from UC-PCM-102)
4. System calculates item-level absolute variance:
   ```
   variance = actualQuantity - expectedQuantity
   ```
   Example: actual=45, expected=50 → variance=-5
5. System calculates item-level variance percentage:
   ```
   variancePercentage = (variance / expectedQuantity) * 100
   ```
   Example: (-5 / 50) * 100 = -10.00%
   Round to 2 decimal places
6. System handles edge case: expectedQuantity = 0
   - 6a. If expected=0 and actual>0: variance=actual, variancePercentage=null (cannot calculate percentage)
   - 6b. If expected=0 and actual=0: variance=0, variancePercentage=0%
7. System updates count detail record in memory with calculated values
8. System applies color coding based on variance percentage:
   - Green: abs(variancePercentage) < 2%
   - Yellow: 2% <= abs(variancePercentage) <= 5%
   - Red: abs(variancePercentage) > 5%
9. System renders variance in Count Detail Form:
   - Display format: "+5 pcs" (positive variance) or "-2.5 kg" (negative variance)
   - Percentage displayed in parentheses: "(-10.00%)"
   - Color coding applied to text
10. User continues entering quantities for remaining items; steps 1-9 repeat for each item
11. User clicks "Complete Count" button (UC-PCM-003)
12. System calculates aggregate count session variance:
    ```
    totalExpected = SUM(expectedQuantity) across all items
    totalActual = SUM(actualQuantity) across all counted items (exclude null)
    aggregateVariance = totalActual - totalExpected
    aggregateVariancePercentage = (aggregateVariance / totalExpected) * 100
    ```
    Round to 2 decimal places
13. System updates tb_count_stock record with aggregated metrics:
    - variance_percentage = aggregateVariancePercentage
    - Store in JSON field for drill-down: total_expected, total_actual, aggregate_variance
14. System displays aggregate variance in count list view and completion toast
15. Process completes

**Alternative Flows**:

**Alt-103A: Zero Expected Quantity** (At step 6)
- 6a. Expected quantity is 0 (no transaction history or new product)
- 6b. User enters actual quantity > 0 (found physical inventory)
- 6c. System calculates variance = actualQuantity - 0 = actualQuantity
- 6d. System sets variancePercentage = null (cannot divide by zero)
- 6e. System displays variance as absolute value only: "+25 pcs" (no percentage)
- 6f. System applies color coding based on absolute variance threshold:
   - Green: abs(variance) < 5 units
   - Yellow: 5 <= abs(variance) <= 20 units
   - Red: abs(variance) > 20 units
- Continue to step 7

**Alt-103B: Partial Count Session** (At step 12)
- 12a. User completes count with some items not counted (actualQuantity = null)
- 12b. System excludes uncounted items from aggregate calculation
- 12c. System calculates aggregate based only on counted items:
   ```
   totalExpected = SUM(expectedQuantity) WHERE actualQuantity IS NOT NULL
   totalActual = SUM(actualQuantity) WHERE actualQuantity IS NOT NULL
   ```
- 12d. System stores count of uncounted items for reference:
   ```json
   {
     "totalItems": 150,
     "countedItems": 120,
     "uncountedItems": 30,
     "partialVariancePercentage": 2.5
   }
   ```
- Continue to step 13

**Exception Flows**:

**Exc-103A: Invalid Expected Quantity** (At step 4)
- Expected quantity is negative (data integrity issue in closing balance)
- System logs error with product_id and expected_qty value
- System defaults expected to 0 for calculation purposes
- System displays warning icon with tooltip: "Invalid expected quantity. Variance calculation may be inaccurate."
- Continue to step 4 with defaulted value

**Exc-103B: Precision Overflow** (At step 5)
- Variance percentage calculation results in extremely large value (e.g., >10,000% for new products)
- System detects overflow (abs(variancePercentage) > 999)
- System caps display value at ">999%" or "<-999%"
- System stores actual calculated value in database for audit
- Continue to step 7 with capped display value

**Business Rules**:
- **BR-PCM-019**: Variance % calculation formula: `((SUM(actual_qty) - SUM(expected_qty)) / SUM(expected_qty)) * 100`
- **BR-PCM-020**: Item-level variance: `actual_qty - expected_qty` with unit suffix
- **BR-PCM-021**: Completion % calculation: `(completed_item_count / total_item_count) * 100`
- **BR-PCM-023**: High-variance threshold: Variance % > 5% flagged for supervisor review

**SLA**:
- **Calculation Time**: <50ms per item variance calculation
- **Aggregate Calculation**: <200ms for count session with up to 500 items

**Monitoring**:
- Variance calculation execution time
- Count of high-variance items (>5%) per count session
- Frequency of variance calculation errors
- Average variance percentage across all completed counts

**Related Requirements**:
- FR-PCM-003: Count Progress Tracking
- FR-PCM-002: Item-by-Item Count Entry
- BR-PCM-019 through BR-PCM-023: Variance calculation business rules
- NFR-PCM-003: Real-time variance calculations must update within 200ms

---

### UC-PCM-104: Send Count Notifications

**Description**: Automated notification service sends alerts to supervisors and managers when counts are completed, high variances detected, or counts stalled requiring attention. Integrates with notification service for email/SMS delivery.

**Trigger**: Count completion, high variance detection, or stalled count detection

**Actor(s)**:
- **Primary**: Notification Service
- **Secondary**: Count completion event, variance threshold breach event

**Priority**: Medium

**Frequency**: Event-driven (multiple times per day during active counting periods)

**Preconditions**:
- Notification service is configured and available
- User notification preferences defined (email, SMS, in-app)
- Count session event triggers notification criteria

**Postconditions**:
- **Success**: Notification sent to appropriate recipients, delivery confirmed
- **Failure**: Notification queued for retry, error logged

**Main Flow**:
1. System completes count session transition to 'completed' status (UC-PCM-003 step 10)
2. System triggers COUNT_COMPLETED event with payload:
   ```json
   {
     "eventType": "COUNT_COMPLETED",
     "countStockId": "uuid-123",
     "countStockNo": "PC-2024-001",
     "locationName": "Main Kitchen Store",
     "counterName": "John Doe",
     "completionDate": "2024-04-20T14:35:00Z",
     "totalItems": 150,
     "countedItems": 150,
     "variancePercentage": 2.3,
     "isHighVariance": false
   }
   ```
3. Notification Service receives COUNT_COMPLETED event
4. Notification Service queries notification recipients based on rules:
   - Supervisor for the location (from tb_location.supervisor_id)
   - Inventory Manager (if variance >5%)
   - Finance Manager (if high-value variance >$5000, future)
5. For each recipient:
   - 5a. Notification Service checks user notification preferences (email, SMS, in-app)
   - 5b. Notification Service prepares notification content:
     ```
     Subject: "Physical Count Completed: PC-2024-001"
     Body:
     "Physical count for Main Kitchen Store has been completed by John Doe.

     - Total Items: 150
     - Counted Items: 150
     - Variance: +2.3%
     - Completion Time: 2024-04-20 14:35

     View count details: [Link to count session]
     ```
   - 5c. Notification Service sends notification via configured channels (email, SMS)
6. Notification Service logs delivery status for each recipient
7. If delivery fails: Notification Service queues for retry with exponential backoff
8. Process completes

**Alternative Flows**:

**Alt-104A: High Variance Alert** (At step 2)
- 2a. System detects variance >5% after count completion
- 2b. System sets isHighVariance = true in event payload
- 2c. System triggers HIGH_VARIANCE_DETECTED event in addition to COUNT_COMPLETED
- 2d. Notification Service sends urgent alert to Inventory Manager and Finance Manager
- 2e. Alert subject: "URGENT: High Variance Detected - PC-2024-001 (8.7%)"
- 2f. Alert marked as high priority for immediate attention
- Continue to step 3

**Alt-104B: Stalled Count Notification** (Scheduled check, separate trigger)
- Background job runs hourly checking for stalled counts
- Job queries tb_count_stock for records: status='in_progress' AND updated_at < NOW() - INTERVAL '4 hours'
- Job triggers COUNT_STALLED event for each stalled count
- Notification Service sends reminder to assigned counter and supervisor
- Notification content: "Count PC-2024-018 has been in progress for 4 hours with only 30% completion. Please check status."
- Continue to step 6

**Exception Flows**:

**Exc-104A: Notification Service Unavailable** (At step 3)
- Notification Service is down or unreachable
- System logs error and queues notification for later delivery
- System continues normal operation (notification failure does not block count completion)
- Queued notifications processed when service restored
- Process ends

**Exc-104B: Recipient Email Invalid** (At step 5c)
- Email delivery fails with "invalid recipient" error
- Notification Service logs delivery failure with reason
- System attempts alternative delivery method (SMS if configured, or in-app notification)
- If all delivery methods fail: System records failure and alerts administrator
- Process continues for remaining recipients

**SLA**:
- **Notification Latency**: <30 seconds from event trigger to delivery
- **Delivery Success Rate**: >95% for email notifications
- **Retry Window**: Up to 24 hours with exponential backoff

**Monitoring**:
- Notification delivery success/failure rate by type
- Notification latency metrics
- Queue depth for retry notifications
- Recipient notification preference usage

**Related Requirements**:
- NFR-PCM-015: Success notifications must auto-dismiss after 5 seconds

---

### UC-PCM-105: Log Count Activities

**Description**: Automated audit logging system records all count-related activities (creation, status changes, quantity entries, deletions) to maintain complete audit trail for compliance and forensic analysis.

**Trigger**: Any count modification operation (create, update, delete, status change)

**Actor(s)**:
- **Primary**: Audit Logger (System)
- **Secondary**: All server actions modifying count data

**Priority**: High

**Frequency**: Real-time (triggered by every count modification)

**Preconditions**:
- Audit log table exists and is writable
- User authentication context available (user ID, username)
- Count operation includes before/after state data

**Postconditions**:
- **Success**: Audit log entry created with complete activity details, timestamp, user attribution
- **Failure**: Audit log write failure logged to error monitoring; operation may rollback depending on criticality

**Main Flow**:
1. User performs count modification action (e.g., creates count session, enters quantity, completes count)
2. Server action processes modification in database transaction
3. Before committing transaction, server action calls audit logger:
   ```typescript
   auditLogger.log({
     action: 'COUNT_SESSION_CREATED',
     entityType: 'count_stock',
     entityId: 'uuid-123',
     userId: 'uuid-456',
     userName: 'John Doe',
     timestamp: new Date(),
     beforeState: null,
     afterState: { /* new count session data */ },
     ipAddress: '192.168.1.100',
     userAgent: 'Mozilla/5.0...'
   })
   ```
4. Audit logger serializes log entry
5. Audit logger inserts record into audit log table (tb_audit_log)
6. Audit log write succeeds
7. Server action commits main transaction
8. User receives success confirmation
9. Process completes

**Alternative Flows**:

**Alt-105A: Status Transition Audit** (At step 3)
- 3a. Action is status transition (e.g., Complete Count)
- 3b. Audit logger captures before/after status in log entry:
   ```typescript
   {
     action: 'COUNT_STATUS_CHANGED',
     entityType: 'count_stock',
     entityId: 'uuid-123',
     beforeState: { doc_status: 'in_progress' },
     afterState: { doc_status: 'completed', end_date: '2024-04-20T14:35:00Z' },
     metadata: { variance_percentage: 2.3, total_items: 150 }
   }
   ```
- Continue to step 4

**Alt-105B: Bulk Quantity Entry Audit** (At step 3)
- 3a. User submits multiple item quantities in single save operation
- 3b. Audit logger creates single log entry with batch details:
   ```typescript
   {
     action: 'COUNT_QUANTITIES_UPDATED',
     entityType: 'count_stock_detail',
     entityId: 'uuid-123', // count session ID
     metadata: {
       itemCount: 25,
       itemIds: ['uuid-a', 'uuid-b', ...],
       summary: '25 items quantities entered'
     }
   }
   ```
- Continue to step 4

**Exception Flows**:

**Exc-105A: Audit Log Write Failure (Non-Critical)** (At step 5-6)
- Audit log table write fails due to temporary issue
- System logs audit write error to error monitoring service
- System DOES NOT rollback main transaction (count operation succeeds despite audit failure)
- System attempts async retry to write audit log
- Process continues to step 7

**Exc-105B: Audit Log Write Failure (Critical)** (At step 5-6)
- Audit log write fails for critical operation (e.g., high-value adjustment posting)
- System determines operation requires audit trail per compliance rules
- System rolls back main transaction (count operation fails)
- System returns error to user: "Operation failed due to audit logging error. Please try again."
- User must retry operation
- Process ends

**Business Rules**:
- **BR-PCM-006**: System must maintain complete audit trail of all count activities
- **NFR-PCM-010**: Complete audit trail must record: user ID, timestamp, action type, before/after values

**SLA**:
- **Logging Latency**: <50ms to write audit log entry
- **Availability**: 99.9% (same as main database)
- **Retention**: 7 years minimum per financial audit compliance

**Monitoring**:
- Audit log write success/failure rate
- Audit log write latency
- Audit log table size and growth rate
- Failed audit writes by operation type

**Related Requirements**:
- NFR-PCM-010: Complete audit trail requirement
- BR-PCM-006: Audit trail must record all count activities

---

## Integration Use Cases

### UC-PCM-201: Export Count Data for Reporting

**Description**: Reporting Module consumes completed count data to generate variance reports, accuracy dashboards, and audit compliance documentation. Data exported in structured format for analysis and visualization.

**Actor(s)**:
- **Primary**: Reporting Module (Internal System)
- **External System**: Business Intelligence platform (future)

**Trigger**: Scheduled report generation or user-initiated ad-hoc report

**Integration Type**:
- [x] Module Integration (internal)
- [ ] REST API
- [ ] Message Queue

**Direction**:
- [x] Outbound (Count data flows to Reporting Module)
- [ ] Inbound
- [ ] Bidirectional

**Priority**: Medium

**Frequency**: Daily scheduled reports, ad-hoc on-demand

**Preconditions**:
- Completed count sessions exist in database
- Reporting Module has read access to tb_count_stock and tb_count_stock_detail tables
- User has permission to generate reports for locations

**Postconditions**:
- **Success**: Count data exported and ingested by Reporting Module, reports generated successfully
- **Failure**: Export error logged, report generation skipped, alert sent to administrator

**Main Flow** (Outbound Report Data Export):
1. Reporting Module scheduler triggers daily variance report generation at 6:00 AM
2. Reporting Module queries tb_count_stock for completed counts from previous day:
   ```sql
   SELECT * FROM tb_count_stock
   WHERE doc_status = 'completed'
     AND end_date >= CURRENT_DATE - INTERVAL '1 day'
     AND end_date < CURRENT_DATE
   ```
3. Reporting Module joins tb_count_stock_detail to retrieve item-level variances
4. Reporting Module aggregates data:
   - Total count sessions completed: 15
   - Average variance percentage: 2.8%
   - High-variance counts (>5%): 3
   - Top 10 products by absolute variance
5. Reporting Module generates variance summary report (PDF/Excel)
6. Reporting Module distributes report to stakeholders via email
7. Reporting Module updates report generation log with success status
8. Process completes

**Data Mapping**:

| Internal Field | Report Field | Transformation |
|----------------|--------------|----------------|
| count_stock_no | Count Reference | Direct mapping |
| location_name | Store Location | Direct mapping |
| end_date | Completion Date | Format as YYYY-MM-DD |
| variance_percentage | Variance % | Format as percentage with 2 decimals |
| tb_count_stock_detail.* | Line Items | Aggregated array |

**Monitoring**:
- Report generation success/failure rate
- Report generation duration
- Count data export volume
- User report access frequency

**Fallback Strategy**:
If Reporting Module unavailable: Counts still complete successfully, reports generated when service restored

**Related Requirements**:
- FR-PCM-008: Reporting and Export (future enhancement)

---

### UC-PCM-202: Post Count Adjustments to Inventory

**Description**: After count completion and approval, system posts inventory adjustments (differences between expected and actual quantities) to the core Inventory Transaction System to update inventory balances and trigger cost recalculations.

**Actor(s)**:
- **Primary**: Physical Count Management System
- **External System**: Inventory Transaction System

**Trigger**: Finance Manager approves count variance adjustments (future enhancement)

**Integration Type**:
- [x] Module Integration (internal)
- [ ] REST API
- [ ] Message Queue

**Direction**:
- [x] Outbound (Adjustment transactions flow to Inventory System)
- [ ] Inbound
- [ ] Bidirectional

**Priority**: High

**Frequency**: Daily to Weekly (after count completion and approval)

**Preconditions**:
- Count session status = 'completed'
- Count variance approved (if approval workflow enabled)
- Inventory Transaction System available
- Adjustment transactions not yet posted (prevent duplicate posting)

**Postconditions**:
- **Success**: Adjustment transactions created in tb_inventory_transaction for each variance item, inventory balances updated, count marked as posted
- **Failure**: No adjustments posted, error logged, count remains in pending-post status

**Main Flow** (Outbound Adjustment Posting):
1. Finance Manager reviews completed count PC-2024-001 with variance 2.3%
2. Finance Manager approves variance adjustments (future enhancement: approval workflow)
3. System receives adjustment posting request
4. System validates count session:
   - Status = 'completed'
   - Not already posted (adjustment_posted flag = false)
   - All variances within approved thresholds or manually approved
5. System queries tb_count_stock_detail for all items with variance (actual_qty ≠ expected_qty)
6. For each variance item:
   - 6a. System calculates adjustment quantity: `actual_qty - expected_qty`
   - 6b. If adjustment_qty > 0: Create inventory receipt transaction (IN)
   - 6c. If adjustment_qty < 0: Create inventory issue transaction (OUT)
   - 6d. System prepares transaction record:
     ```typescript
     {
       transaction_type: 'count_adjustment',
       product_id: 'uuid-product',
       location_id: 'uuid-location',
       in_qty: adjustment_qty > 0 ? adjustment_qty : 0,
       out_qty: adjustment_qty < 0 ? abs(adjustment_qty) : 0,
       reference_no: 'PC-2024-001',
       reference_id: 'uuid-count-stock',
       transaction_date: count.end_date,
       created_by_id: current_user_id
     }
     ```
7. System inserts adjustment transactions into tb_inventory_transaction (batch insert for performance)
8. Inventory Transaction System receives new transactions
9. Inventory Transaction System updates tb_inventory_transaction_closing_balance:
   - Recalculates closing_qty for affected products
   - Updates closing_date to current date
10. Inventory Transaction System triggers cost recalculation (FIFO/Average cost method per SM-costing-methods.md)
11. System marks count session as adjustment posted:
    - adjustment_posted = true
    - adjustment_posted_at = current timestamp
    - adjustment_posted_by_id = current_user_id
12. System logs adjustment posting activity in audit trail
13. System displays success notification: "Inventory adjustments posted for PC-2024-001. 8 items adjusted."
14. Process completes

**Alternative Flows**:

**Alt-202A: Partial Variance Approval** (At step 4)
- 4a. Finance Manager approves only some variance items (e.g., low-value items), rejects high-value items requiring investigation
- 4b. System filters adjustment items to only approved items
- 4c. System posts adjustments for approved items only
- 4d. System flags rejected items for follow-up investigation
- 4e. Count marked as partially posted; remaining items require separate approval and posting
- Continue to step 6 with filtered item list

**Alt-202B: Zero-Variance Items Excluded** (At step 5)
- 5a. System detects some items have zero variance (actual_qty = expected_qty)
- 5b. System excludes zero-variance items from adjustment posting (no transaction needed)
- 5c. System posts adjustments only for non-zero variance items
- Continue to step 6 with filtered item list

**Exception Flows**:

**Exc-202A: Inventory Transaction System Unavailable** (At step 8)
- Inventory Transaction System is down or unreachable
- System cannot insert adjustment transactions
- System logs error and queues adjustments for retry
- System displays error: "Inventory system unavailable. Adjustments will be posted when system restored."
- Count remains in pending-post status
- Background job retries posting periodically until successful
- Process ends

**Exc-202B: Duplicate Posting Detected** (At step 4)
- System detects adjustment_posted = true (count adjustments already posted previously)
- System prevents duplicate posting
- System displays error: "Adjustments already posted for PC-2024-001 on 2024-04-21. Cannot post again."
- Process ends

**Exc-202C: Cost Recalculation Failure** (At step 10)
- Inventory Transaction System successfully inserts adjustment transactions
- Cost recalculation process fails due to missing cost layer data or calculation error
- System logs error with details
- Transactions remain in database but closing balance may be inconsistent
- System alerts Inventory Manager for manual review
- Process completes with warning

**Data Contract**:

**Request** (Adjustment Transaction):
```typescript
interface AdjustmentTransaction {
  transaction_type: 'count_adjustment';
  product_id: string;
  location_id: string;
  in_qty: number;          // Positive adjustment (receipts)
  out_qty: number;         // Negative adjustment (issues)
  reference_no: string;    // Count stock number (e.g., PC-2024-001)
  reference_id: string;    // Count stock UUID
  transaction_date: Date;  // Count completion date
  lot_no?: string;         // Optional lot tracking
  lot_index?: number;      // Optional lot index for FIFO
  created_by_id: string;
}
```

**Response**:
```typescript
interface AdjustmentPostingResult {
  success: boolean;
  transaction_ids: string[];      // UUIDs of created transactions
  adjusted_item_count: number;
  error?: string;
}
```

**Business Rules**:
- **BR-PCM-022**: Count adjustment value calculated using expected quantity as baseline and product unit cost
- **Integration with SM-costing-methods.md**: Adjustments post to shared inventory transaction system with proper FIFO/Average cost handling

**SLA**:
- **Posting Time**: <5 seconds for 100 adjustment transactions
- **Availability**: Depends on Inventory Transaction System (99.9% target)
- **Idempotency**: System prevents duplicate posting via adjustment_posted flag

**Monitoring**:
- Adjustment posting success/failure rate
- Average posting time per count session
- Count of high-value adjustments requiring approval
- Frequency of duplicate posting attempts (should be zero)

**Fallback Strategy**:
If Inventory Transaction System unavailable for extended period: Adjustments queued with timestamp; manual intervention may be required to clear backlog and resolve data inconsistencies

**Related Requirements**:
- FR-PCM-004: Count Status Workflow (integration point after completion)
- BR-PCM-022: Count adjustment value calculation
- Integration with SM-costing-methods.md for inventory transaction posting

---

## Use Case Traceability Matrix

| Use Case | Functional Req | Business Rule | Test Case | Status |
|----------|----------------|---------------|-----------|--------|
| UC-PCM-001 | FR-PCM-001 | BR-PCM-001 to BR-PCM-007 | TC-PCM-001 | To Implement |
| UC-PCM-002 | FR-PCM-002 | BR-PCM-010, BR-PCM-011 | TC-PCM-002 | To Implement |
| UC-PCM-003 | FR-PCM-004 | BR-PCM-013 to BR-PCM-018 | TC-PCM-003 | To Implement |
| UC-PCM-004 | FR-PCM-003, FR-PCM-006 | BR-PCM-023, BR-PCM-024 | TC-PCM-004 | To Implement |
| UC-PCM-005 | FR-PCM-006 | BR-PCM-024 | TC-PCM-005 | To Implement |
| UC-PCM-006 | FR-PCM-007 | BR-PCM-016, BR-PCM-024, BR-PCM-028 | TC-PCM-006 | To Implement |
| UC-PCM-007 | FR-PCM-008 | BR-PCM-009, BR-PCM-017, BR-PCM-026 | TC-PCM-007 | To Implement |
| UC-PCM-008 | FR-PCM-008 | BR-PCM-009, BR-PCM-025 | TC-PCM-008 | To Implement |
| UC-PCM-101 | FR-PCM-004 | BR-PCM-013 to BR-PCM-018 | TC-PCM-101 | To Implement |
| UC-PCM-102 | FR-PCM-002 | BR-PCM-011 | TC-PCM-102 | To Implement |
| UC-PCM-103 | FR-PCM-003 | BR-PCM-019 to BR-PCM-023 | TC-PCM-103 | To Implement |
| UC-PCM-104 | NFR-PCM-015 | - | TC-PCM-104 | To Implement |
| UC-PCM-105 | NFR-PCM-010 | BR-PCM-006 | TC-PCM-105 | To Implement |
| UC-PCM-201 | FR-PCM-008 (future) | - | TC-PCM-201 | Planned |
| UC-PCM-202 | FR-PCM-004 | BR-PCM-022 | TC-PCM-202 | Planned |

---

## Appendix

### Glossary

- **Actor**: Person, role, or system that interacts with the system to achieve a goal
- **Use Case**: Sequence of interactions between actor and system to accomplish a specific goal
- **Precondition**: State that must be true before use case can begin execution
- **Postcondition**: State that is guaranteed to be true after use case successfully completes
- **Main Flow**: Primary sequence of steps representing the "happy path" with no errors or exceptions
- **Alternative Flow**: Variation of main flow where different path is taken based on conditions or user choice
- **Exception Flow**: Error handling path when something goes wrong or validation fails
- **Trigger**: Event or action that initiates execution of a use case

### Common Patterns

**Pattern: Modal Form Submission**
1. User clicks button to open modal form
2. System displays modal with form fields
3. User fills form fields
4. User clicks submit button
5. System validates input (client-side)
6. System submits to server action
7. Server validates and processes
8. Server returns success/error response
9. System displays result notification
10. System closes modal on success
11. System refreshes parent view with updated data

**Pattern: List Filtering with Multiple Criteria**
1. User navigates to list page
2. System displays full list with filter controls
3. User selects filter option from dropdown
4. System applies filter and narrows results
5. User selects additional filter (cumulative)
6. System applies both filters (AND logic)
7. System displays filtered count
8. User clears one filter via pill/button
9. System removes that filter and expands results
10. User clears all filters to restore full list

**Pattern: Status-Based Workflow Transition**
1. User selects entity in current status
2. User clicks action button (e.g., "Start", "Complete")
3. System validates current status permits transition
4. System validates business rules for transition
5. System displays confirmation dialog (if destructive)
6. User confirms action
7. System updates status field
8. System records transition in history
9. System commits transaction
10. System displays success notification
11. System updates UI to reflect new status and available actions

---

**Document End**

> 📝 **Implementation Note**:
> This Use Cases document specifies the required user and system workflows based on analysis of the UI prototype and Prisma schema. These use cases guide the implementation of server actions, form handlers, validation logic, and integration points needed to support the Physical Count Management functionality. Developers should use these workflows as the authoritative source for behavior requirements when implementing the backend.
