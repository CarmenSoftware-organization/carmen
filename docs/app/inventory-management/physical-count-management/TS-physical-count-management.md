# Technical Specification: Physical Count Management

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
| 1.0.0 | 2025-01-11 | System | Initial technical specification documenting required implementation |

---

## Overview

This Technical Specification defines the implementation requirements for the Physical Count Management system, describing the server actions, API contracts, component architecture, and data flow patterns needed to support physical inventory count workflows. The specification is based on the UI prototype at `app/(main)/inventory-management/physical-count-management/` and the Prisma schema tables `tb_count_stock` and `tb_count_stock_detail`.

The implementation follows Next.js 14 App Router patterns with Server Actions for mutations, React Server Components for data fetching, and Client Components for interactive UI elements. All data persistence uses Prisma ORM with PostgreSQL via Supabase.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- This document describes implementation patterns, component responsibilities, and data flows in text format
- Actual code implementation should follow project conventions and technical patterns
- Refer to Data Specification document for complete database schema definitions
- Refer to Validations document for detailed validation rule specifications

**Related Documents**:
- [Business Requirements](./BR-physical-count-management.md) - Business rules and functional requirements
- [Use Cases](./UC-physical-count-management.md) - User workflows and system interactions
- [Data Specification](./DS-physical-count-management.md) - Database schema and relationships
- [Flow Diagrams](./FD-physical-count-management.md) - Visual process flows
- [Validations](./VAL-physical-count-management.md) - Validation rules and error handling

---

## Architecture

### High-Level Architecture

The Physical Count Management system follows a three-tier architecture with clear separation between presentation, business logic, and data layers:

```
┌──────────────────────────────────────┐
│       Client (Browser)               │
│  React Components + Client State     │
└────────────┬─────────────────────────┘
             │ HTTPS
             ▼
┌──────────────────────────────────────┐
│     Next.js App Router Server        │
├──────────────────────────────────────┤
│  React Server Components (RSC)       │
│  - page.tsx (data fetching)          │
│  - Initial page render                │
├──────────────────────────────────────┤
│  Server Actions                      │
│  - createCountSession()              │
│  - enterCountQuantities()            │
│  - completeCountSession()            │
│  - cancelCountSession()              │
│  - deleteCountSession()              │
├──────────────────────────────────────┤
│  Business Logic Layer                │
│  - Workflow validation               │
│  - Variance calculations             │
│  - Permission checks                 │
│  - Audit logging                     │
└────────────┬─────────────────────────┘
             │ Prisma ORM
             ▼
┌──────────────────────────────────────┐
│    PostgreSQL Database               │
│  (via Supabase)                      │
├──────────────────────────────────────┤
│  tb_count_stock                      │
│  tb_count_stock_detail               │
│  tb_location                         │
│  tb_product                          │
│  tb_user                             │
│  tb_inventory_transaction...         │
└──────────────────────────────────────┘
```

### Component Architecture

**Frontend Layer**:
- **Page Component** (`page.tsx`): React Server Component handling initial data fetching and rendering count list view
- **Interactive UI Components**: Client Components managing user interactions (forms, modals, filters)
- **State Management**: React useState for local state, component props for shared state (no global state needed)
- **Form Handling**: React Hook Form with Zod validation schemas for type-safe form submissions

**Backend Layer**:
- **Server Actions** (`actions.ts`): Next.js Server Actions handling mutations (create, update, delete operations)
- **Business Logic**: Workflow validation, status transition enforcement, variance calculations
- **Data Access Layer**: Prisma Client for database operations with transaction support
- **Integration Layer**: Inventory Transaction System integration for expected quantities and adjustment posting

**Data Layer**:
- **Primary Tables**: tb_count_stock (count sessions), tb_count_stock_detail (count line items)
- **Reference Tables**: tb_location, tb_product, tb_user, tb_department
- **Integration Tables**: tb_inventory_transaction_closing_balance (expected quantities)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router pattern
- **UI Library**: React 18+ with TypeScript 5+
- **Styling**: Tailwind CSS 3+ with Shadcn/ui component library
- **State Management**: React useState/useReducer (component-level state only)
- **Form Handling**: React Hook Form 7+ with Zod 3+ validation
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Next.js 14+ Server Actions and Server Components
- **Database**: PostgreSQL 15+ (hosted on Supabase)
- **ORM**: Prisma 5+ for type-safe database access
- **Authentication**: Supabase Auth for user authentication and session management
- **Validation**: Zod 3+ for runtime type checking and input validation

### Testing
- **Unit Tests**: Vitest for component and utility function tests
- **Integration Tests**: Vitest with Prisma client mocking for server action tests
- **E2E Tests**: Playwright for end-to-end workflow testing (future)

### DevOps
- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: Vercel for Next.js application hosting
- **Database**: Supabase for PostgreSQL hosting and management
- **Monitoring**: Vercel Analytics for performance monitoring

---

## Component Structure

### Directory Structure

```
app/(main)/inventory-management/physical-count-management/
├── page.tsx                           # Main list page (React Server Component)
├── components/
│   ├── new-count-form.tsx             # Modal form for creating count sessions
│   ├── count-detail-form.tsx          # Modal form for entering count quantities
│   ├── count-list-item.tsx            # List row component for count session
│   ├── count-detail-card.tsx          # Grid card component for count session
│   └── count-progress.tsx             # Progress indicator component
├── actions.ts                         # Server Actions for mutations (required)
├── types.ts                           # TypeScript type definitions (required)
├── validations.ts                     # Zod validation schemas (required)
└── README.md                          # Module documentation
```

### Key Components

#### Page Component
**File**: `page.tsx`
**Type**: React Server Component
**Purpose**: Main entry point for Physical Count Management displaying list/grid of count sessions

**Responsibilities**:
- Fetch initial count session list from database using Prisma
- Apply default filters (e.g., status not deleted)
- Render count list/grid view with interactive components
- Handle server-side data fetching with proper error boundaries

**Data Fetching Pattern**:
- Uses Prisma Client in Server Component for initial data load
- Queries tb_count_stock with joins to tb_location, tb_user for denormalized display data
- Applies default filtering (deleted_at IS NULL) and sorting (created_at DESC)
- Passes data to client components via props

#### New Count Form Component
**File**: `components/new-count-form.tsx`
**Type**: Client Component (interactive form)
**Purpose**: Modal form for creating new physical count sessions

**Responsibilities**:
- Render form fields: Counter (user select), Department (department select), Store Location (location select), Date (date picker), Notes (textarea)
- Validate inputs using Zod schema before submission
- Call createCountSession Server Action on form submit
- Display success/error toast notifications
- Close modal and refresh parent list on successful creation

**Props Interface**:
- onClose: Function to close modal
- onSubmit: Function receiving NewCountData to handle successful submission

**Form Fields**:
- Counter (required): Dropdown populated from tb_user where role includes 'storekeeper'
- Department (required): Dropdown populated from tb_department
- Store Location (required): Dropdown populated from tb_location filtered by department
- Date (required): Date picker defaulting to current date, allows backdating
- Notes (optional): Multi-line text area for count purpose/instructions

#### Count Detail Form Component
**File**: `components/count-detail-form.tsx`
**Type**: Client Component (interactive form)
**Purpose**: Modal form for entering actual counted quantities with variance display

**Responsibilities**:
- Display count session header info (location, counter, date, reference number) in read-only mode
- Render items table with columns: Item Details, Expected Qty, Actual Qty (input), Unit, Submit Action
- Fetch and display expected quantities from tb_inventory_transaction_closing_balance
- Calculate real-time variance as user enters actual quantities
- Handle per-item submission (optional checkmark for tracking progress)
- Call enterCountQuantities Server Action to save quantities
- Transition to completeCountSession Server Action when user clicks Complete Count

**Props Interface**:
- onClose: Function to close modal
- onSubmit: Function receiving CountDetailData to handle completion
- countSessionId: UUID of count session being entered

**Data Loading**:
- Loads count session from tb_count_stock
- Loads count detail line items from tb_count_stock_detail
- Loads expected quantities via query to tb_inventory_transaction_closing_balance
- Displays warning icon for items with missing closing balance (expected qty defaults to 0)

#### Count List Item Component
**File**: `components/count-list-item.tsx`
**Type**: Client Component
**Purpose**: Row component for list view displaying count session summary

**Responsibilities**:
- Display count session data: Location, Department, Counter, Date, Status badge
- Display progress: "X of Y items counted - Z%"
- Display variance percentage with color coding
- Render action buttons based on status and user permissions: Start Count, View, Cancel, Delete

**Props Interface**:
- count session data object with all display fields
- onStartCount: Function to open Count Detail Form modal
- onDelete: Function to trigger delete confirmation

#### Count Detail Card Component
**File**: `components/count-detail-card.tsx`
**Type**: Client Component
**Purpose**: Card component for grid view displaying count session with visual emphasis

**Responsibilities**:
- Similar to List Item but with card layout optimized for grid display
- Includes progress bar visualization
- Displays last count date for comparison
- Shows notes preview (first 100 characters)

**Props Interface**: Same as Count List Item component

---

## Sitemap

### Overview
The Physical Count Management system follows a single-page application pattern with modal overlays for forms. The sitemap below shows the primary page, modals accessible from it, and navigation flows.

### Page Hierarchy

```
Physical Count Management
│
├── Main Page: Count List/Grid View
│   │   Route: /inventory-management/physical-count-management
│   │   Component: page.tsx
│   │
│   ├── View Mode Toggle (List / Grid)
│   ├── Filter Panel
│   │   ├── Status Filter (All, Pending, In Progress, Completed)
│   │   ├── Department Filter (All Departments, F&B, Housekeeping, ...)
│   │   └── Location Filter (toggle button reveals dropdown)
│   │
│   ├── Count List/Grid Display
│   │   ├── Count List Item (List View)
│   │   └── Count Detail Card (Grid View)
│   │
│   └── Actions
│       ├── New Count Button → Opens New Count Form Modal
│       ├── Start Count Button → Opens Count Detail Form Modal
│       ├── View Button → Opens Count Detail Form Modal (read-only)
│       ├── Cancel Button → Opens Cancel Confirmation Dialog
│       └── Delete Button → Opens Delete Confirmation Dialog
│
├── Modal: New Count Form
│   │   Triggered by: "New Count" button click
│   │   Component: NewCountForm
│   │
│   ├── Form Fields
│   │   ├── Counter (select dropdown)
│   │   ├── Department (select dropdown)
│   │   ├── Store Location (select dropdown)
│   │   ├── Date (date picker)
│   │   └── Notes (textarea)
│   │
│   └── Actions
│       ├── Create Count → Calls createCountSession Server Action
│       └── Cancel → Closes modal without saving
│
├── Modal: Count Detail Form
│   │   Triggered by: "Start Count" or "View" button click
│   │   Component: CountDetailForm
│   │
│   ├── Header Section (read-only)
│   │   ├── Location Name
│   │   ├── Counter Name
│   │   ├── Count Date
│   │   └── Reference Number
│   │
│   ├── Items Table
│   │   ├── Item Details Column (name, SKU, description)
│   │   ├── Expected Qty Column (from closing balance)
│   │   ├── Actual Qty Column (numeric input)
│   │   ├── Unit Column (pcs, kg, L)
│   │   └── Submit Action Column (checkmark button)
│   │
│   ├── Session Notes Section (textarea)
│   │
│   └── Actions
│       ├── Complete Count → Calls completeCountSession Server Action
│       └── Cancel → Closes modal, prompts for unsaved changes
│
├── Dialog: Cancel Count Confirmation
│   │   Triggered by: "Cancel Count" button (supervisor only)
│   │   Component: Inline confirmation dialog
│   │
│   ├── Warning Message
│   ├── Cancellation Reason Field (required, textarea)
│   │
│   └── Actions
│       ├── Confirm Cancellation → Calls cancelCountSession Server Action
│       └── Cancel → Closes dialog without action
│
└── Dialog: Delete Count Confirmation
    │   Triggered by: Delete icon/button (pending counts only)
    │   Component: Inline confirmation dialog
    │
    ├── Warning Message
    ├── Count Details Summary (for verification)
    │
    └── Actions
        ├── Confirm Delete → Calls deleteCountSession Server Action
        └── Cancel → Closes dialog without action
```

### Navigation Targets

**From Main Page**:
- New Count button → Opens New Count Form modal overlay
- Start Count button on list item → Opens Count Detail Form modal for data entry
- View button on list item → Opens Count Detail Form modal in read-only mode (completed counts)
- Cancel button → Opens Cancel Confirmation dialog
- Delete button → Opens Delete Confirmation dialog

**From New Count Form Modal**:
- Create Count action → Closes modal, refreshes main page with new count at top of list
- Cancel action → Closes modal, returns to main page without changes

**From Count Detail Form Modal**:
- Complete Count action → Closes modal, refreshes main page showing completed count with updated status and variance
- Cancel action → Closes modal (prompts for unsaved changes if quantities entered), returns to main page

**From Confirmation Dialogs**:
- Confirm action → Executes Server Action, closes dialog, refreshes main page with updated list
- Cancel action → Closes dialog without executing action

---

## Server Actions

### Overview
Server Actions provide the mutation layer for Physical Count Management, handling all create, update, and delete operations with server-side validation, authorization, and transaction management. Each Server Action follows a consistent pattern: input validation, authorization check, business logic execution, database transaction, audit logging, and response formatting.

### Server Action Implementation Pattern

All Server Actions follow this structure:
1. **Input Validation**: Parse and validate input using Zod schema
2. **Authorization**: Check user authentication and permissions
3. **Business Logic**: Validate business rules and workflow constraints
4. **Database Transaction**: Execute Prisma queries within transaction
5. **Audit Logging**: Record activity in audit trail
6. **Response**: Return typed success/error result

### Action: createCountSession

**Purpose**: Creates a new physical count session with status 'pending' and generates unique reference number

**Input Parameters**:
- counter (string, required): Counter name to be resolved to user ID via lookup
- department (string, required): Department name to be resolved to department ID
- storeName (string, required): Location name to be resolved to location ID
- date (string, required): Count date in ISO format (YYYY-MM-DD)
- notes (string, optional): Initial count session notes

**Authorization**:
- User must be authenticated
- User must have 'storekeeper' or higher role
- User must have permission for selected location

**Business Logic Validation**:
- Verify counter exists in tb_user and has active status
- Verify location exists in tb_location and has active status
- Verify department exists and matches location
- Check date is not future date (BR-PCM-004)
- Check no active count exists for location (BR-PCM-003): Query tb_count_stock WHERE location_id = X AND doc_status IN ('pending', 'in_progress') AND deleted_at IS NULL

**Database Operations**:
1. Resolve counter name to user_id via query to tb_user WHERE name = counter
2. Resolve location name to location_id via query to tb_location WHERE name = storeName
3. Resolve department name to department_id via query to tb_department WHERE name = department
4. Generate count_stock_no: Query MAX(count_stock_no) for current year, increment sequence (format: PC-{YEAR}-{SEQUENCE})
5. Insert new record into tb_count_stock with:
   - Generated count_stock_no
   - Resolved location_id, department_id, counter user_id
   - start_date from input date
   - doc_status = 'pending'
   - count_stock_type = 'physical'
   - notes from input
   - created_at, created_by_id from auth context
6. Commit transaction

**Response**:
- Success: Returns created count session object with ID and generated count_stock_no
- Error: Returns validation errors or business rule violations with user-friendly messages

**Error Handling**:
- Input validation failure → 400 Bad Request with field-specific errors
- Active count exists → 400 Bad Request with message referencing existing count number
- Database constraint violation → 500 Internal Server Error with generic message (detailed error logged)

---

### Action: startCountSession

**Purpose**: Transitions count session from 'pending' to 'in_progress' status, preparing for quantity entry

**Input Parameters**:
- countStockId (string UUID, required): ID of count session to start

**Authorization**:
- User must be authenticated
- User must be assigned counter OR have supervisor role for location
- User must have permission for count session location

**Business Logic Validation**:
- Verify count session exists and belongs to accessible location
- Verify current status is 'pending' (BR-PCM-013)
- Verify assigned counter exists and is active (BR-PCM-014)

**Database Operations**:
1. Query tb_count_stock WHERE id = countStockId AND deleted_at IS NULL
2. Validate current doc_status = 'pending'
3. Update tb_count_stock SET:
   - doc_status = 'in_progress'
   - updated_at = NOW()
   - updated_by_id = current_user_id
4. Append workflow_history JSON entry recording transition
5. Commit transaction

**Response**:
- Success: Returns updated count session with status 'in_progress'
- Error: Returns status transition validation error

---

### Action: enterCountQuantities

**Purpose**: Saves actual counted quantities for count items, calculates variances, updates progress metrics

**Input Parameters**:
- countStockId (string UUID, required): ID of count session
- items (array, required): Array of item objects with structure:
  - id (string UUID): Count detail line item ID
  - actualQuantity (number): User-entered counted quantity
  - isSubmitted (boolean): Whether user submitted this item (optional progress tracking)

**Authorization**:
- User must be authenticated
- User must be assigned counter OR have supervisor role
- Count session must be in 'in_progress' status

**Business Logic Validation**:
- Verify count session exists and status is 'in_progress'
- Validate all item IDs belong to this count session
- Validate actualQuantity is non-negative (BR-PCM-010)
- Validate actualQuantity precision matches unit type (integer for 'pcs', up to 3 decimals for 'kg/L')

**Database Operations**:
1. Begin transaction
2. For each item in items array:
   - Update tb_count_stock_detail SET qty = actualQuantity WHERE id = item.id
   - Optionally update item metadata JSON with isSubmitted flag
3. Query updated count detail records to calculate aggregate progress:
   - total_item_count = COUNT(*)
   - completed_item_count = COUNT(*) WHERE qty IS NOT NULL
4. Update tb_count_stock with calculated progress metrics
5. Commit transaction

**Response**:
- Success: Returns updated count session with progress metrics
- Error: Returns validation errors for invalid quantities

---

### Action: completeCountSession

**Purpose**: Finalizes count session, transitions status to 'completed', calculates final variance, locks from further edits

**Input Parameters**:
- countStockId (string UUID, required): ID of count session to complete
- sessionNotes (string, optional): Final session notes documenting observations

**Authorization**:
- User must be authenticated
- User must be assigned counter OR have supervisor role
- Count session must be in 'in_progress' status

**Business Logic Validation**:
- Verify count session status is 'in_progress' (BR-PCM-013)
- Verify at least one item has actual_qty entered (BR-PCM-015)
- Calculate aggregate variance percentage: ((SUM(actual_qty) - SUM(expected_qty)) / SUM(expected_qty)) * 100
- Flag high variance if variance % > 5% threshold (BR-PCM-023)

**Database Operations**:
1. Begin transaction
2. Query tb_count_stock_detail to get all items with quantities
3. Calculate aggregate metrics:
   - total_expected = SUM(expected_qty) WHERE actual_qty IS NOT NULL
   - total_actual = SUM(actual_qty) WHERE actual_qty IS NOT NULL
   - variance_percentage = ((total_actual - total_expected) / total_expected) * 100
4. Update tb_count_stock SET:
   - doc_status = 'completed'
   - end_date = NOW()
   - variance_percentage = calculated value
   - note = sessionNotes (if provided, append to existing notes)
   - updated_at = NOW()
   - updated_by_id = current_user_id
5. Append workflow_history JSON entry with completion details
6. Commit transaction
7. Trigger notification event (UC-PCM-104) if high variance detected

**Response**:
- Success: Returns completed count session with final variance metrics
- Error: Returns validation error if no items counted or invalid status

**Post-Completion Actions** (asynchronous):
- Send completion notification to supervisor/manager
- If high variance (>5%): Send urgent alert to inventory manager
- Optionally trigger approval workflow for adjustment posting (future)

---

### Action: cancelCountSession

**Purpose**: Cancels an in-progress count session with mandatory reason, soft-deletes record for audit trail

**Input Parameters**:
- countStockId (string UUID, required): ID of count session to cancel
- cancellationReason (string, required): Explanation for cancellation (minimum 10 characters)

**Authorization**:
- User must be authenticated
- User must have 'supervisor' or 'manager' role (BR-PCM-026)
- Count session must be in 'in_progress' status

**Business Logic Validation**:
- Verify count session exists and status is 'in_progress'
- Validate cancellationReason length >= 10 characters (BR-PCM-017)
- Verify user has supervisor or manager role for location

**Database Operations**:
1. Begin transaction
2. Query tb_count_stock WHERE id = countStockId
3. Validate current doc_status = 'in_progress'
4. Update tb_count_stock SET:
   - doc_status = 'cancelled'
   - end_date = NOW() (cancellation timestamp)
   - deleted_at = NOW() (soft delete for audit trail)
   - deleted_by_id = current_user_id
   - updated_at = NOW()
   - updated_by_id = current_user_id
5. Append workflow_history JSON entry with cancellation reason
6. Commit transaction

**Response**:
- Success: Returns confirmation with cancelled count reference
- Error: Returns validation error for missing reason or invalid status

**Audit Logging**:
- Log cancellation with full context: user, timestamp, reason, count details
- Cancelled counts remain in database (soft delete) for audit compliance

---

### Action: deleteCountSession

**Purpose**: Soft-deletes a pending count session that was created incorrectly or is no longer needed

**Input Parameters**:
- countStockId (string UUID, required): ID of count session to delete

**Authorization**:
- User must be authenticated
- User must be creator (created_by_id matches user) OR have 'supervisor' role (BR-PCM-025)
- Count session must be in 'pending' status only (BR-PCM-009)

**Business Logic Validation**:
- Verify count session exists and status is 'pending'
- Verify user is creator OR has supervisor role for location
- Prevent deletion of in-progress or completed counts (immutable)

**Database Operations**:
1. Begin transaction
2. Query tb_count_stock WHERE id = countStockId
3. Validate doc_status = 'pending'
4. Validate user authorization (created_by_id = user_id OR user has supervisor role)
5. Update tb_count_stock SET:
   - deleted_at = NOW()
   - deleted_by_id = current_user_id
   - Record remains in database (soft delete)
6. Commit transaction

**Response**:
- Success: Returns confirmation of deletion
- Error: Returns permission error or invalid status error

**Audit Logging**:
- Log deletion with user, timestamp, count reference for audit trail
- Soft-deleted counts excluded from default queries via WHERE deleted_at IS NULL filter

---

### Action: getExpectedQuantities (Helper Action)

**Purpose**: Retrieves expected inventory quantities from closing balance table for variance comparison

**Input Parameters**:
- productIds (array of UUIDs, required): Product IDs to lookup
- locationId (string UUID, required): Location ID for scoped lookup
- cutoffDate (string date, optional): Historical cutoff date for closing balance (defaults to most recent)

**Authorization**:
- User must be authenticated
- User must have permission to view inventory for location

**Database Operations**:
1. Query tb_inventory_transaction_closing_balance:
   - WHERE product_id IN (productIds)
   - AND location_id = locationId
   - AND closing_date <= cutoffDate (if provided, else most recent)
   - ORDER BY closing_date DESC
   - Use DISTINCT ON (product_id) to get most recent balance per product
2. For products not found in closing balance: Return expected_qty = 0 with warning flag

**Response**:
- Success: Returns map of product_id → expected_qty with metadata (closing_date, hasClosingBalance flag)
- Error: Returns database error or permission error

---

## Data Flow

### Create Count Session Flow

1. User fills New Count Form with counter, department, location, date, notes
2. Form validates inputs client-side using Zod schema
3. On submit, form calls createCountSession Server Action
4. Server Action validates authorization and business rules
5. Server Action generates unique count_stock_no (PC-{YEAR}-{SEQUENCE})
6. Server Action inserts record into tb_count_stock with status 'pending'
7. Server Action returns created count session with ID
8. UI displays success toast notification
9. UI closes modal and refreshes count list showing new count at top

### Enter Count Quantities Flow

1. User clicks "Start Count" button on pending count
2. System calls startCountSession Server Action to transition status to 'in_progress'
3. System opens Count Detail Form modal
4. Count Detail Form loads:
   - Count session from tb_count_stock
   - Count detail line items from tb_count_stock_detail
   - Expected quantities via getExpectedQuantities helper (queries tb_inventory_transaction_closing_balance)
5. User enters actual quantity for item, system calculates variance in real-time (client-side)
6. User optionally clicks checkmark to submit item (tracks progress, optional save to database)
7. User repeats for all items in list
8. User clicks "Complete Count" button
9. System calls completeCountSession Server Action with all entered quantities
10. Server Action validates at least one item has quantity entered
11. Server Action calculates aggregate variance percentage
12. Server Action updates tb_count_stock: status='completed', end_date=NOW(), variance_percentage=calculated
13. Server Action appends workflow_history entry
14. Server Action commits transaction
15. Server Action triggers notification event (if high variance)
16. UI displays success toast with variance percentage
17. UI closes modal and refreshes count list showing completed count

### Variance Calculation Flow

**Item-Level Variance** (calculated client-side in real-time):
1. User enters actualQuantity in input field
2. System retrieves expectedQuantity from loaded data
3. System calculates: variance = actualQuantity - expectedQuantity
4. System calculates: variancePercentage = (variance / expectedQuantity) * 100
5. System displays variance with +/- sign and unit (e.g., "+5 pcs" or "-2.5 kg")
6. System applies color coding: Green (<2%), Yellow (2-5%), Red (>5%)

**Aggregate Variance** (calculated server-side on completion):
1. completeCountSession Server Action queries all count detail items with actual_qty
2. Server calculates: totalExpected = SUM(expected_qty) WHERE actual_qty IS NOT NULL
3. Server calculates: totalActual = SUM(actual_qty) WHERE actual_qty IS NOT NULL
4. Server calculates: aggregateVariance = totalActual - totalExpected
5. Server calculates: variancePercentage = (aggregateVariance / totalExpected) * 100 (rounded to 2 decimals)
6. Server updates tb_count_stock.variance_percentage field
7. Server returns variance in response for UI display

### Status Workflow Flow

Status transitions follow strict state machine enforced by workflow engine (UC-PCM-101):

**Allowed Transitions**:
- pending → in_progress (Start Count button)
- in_progress → completed (Complete Count button)
- in_progress → cancelled (Cancel Count button, supervisor only)

**Forbidden Transitions** (prevented by validation):
- completed → any status (immutable once completed)
- cancelled → any status (immutable once cancelled)
- pending → completed (must go through in_progress)
- Any backward transitions

**Workflow History Tracking**:
- Each status transition appends entry to workflow_history JSON array
- Entry includes: timestamp, user_id, user_name, from_status, to_status, action, optional note
- History provides complete audit trail of count lifecycle

---

## Type Definitions

### Overview
TypeScript interfaces provide type safety across client and server boundaries. All types should be defined in `types.ts` file and shared between components and Server Actions.

### Core Types

**CountSession**: Represents a physical count session with all metadata, status, and workflow information
- Fields align with tb_count_stock table columns
- Includes calculated fields: totalItemCount, completedItemCount, variancePercentage
- Includes navigation properties: countDetails array (loaded on demand)

**CountDetail**: Represents individual line items within a count session
- Fields align with tb_count_stock_detail table columns
- Includes both expected and actual quantities for variance calculation
- Includes UI state: isSubmitted flag for progress tracking

**NewCountFormData**: DTO for count session creation form submission
- Fields: counter (string), department (string), storeName (string), date (string), notes (string optional)
- Used for form validation and Server Action input

**CountDetailFormData**: DTO for count quantity entry form submission
- Fields: items array (id, actualQuantity, isSubmitted), sessionNotes (string)
- Used for batch quantity update submission

**CountStatus**: Enumeration of valid count statuses
- Values: 'pending', 'in_progress', 'completed', 'cancelled'
- Used for status filter dropdown and status badge rendering

**WorkflowHistoryEntry**: Structure for workflow history log entries
- Fields: timestamp, userId, userName, fromStatus, toStatus, action, note (optional)
- Stored in workflow_history JSON array field

### Type Usage Patterns

**Server Actions** (actions.ts):
- Input parameters typed with specific DTOs (e.g., NewCountFormData)
- Return typed result objects with success/error discriminated unions
- Use Zod schemas for runtime validation aligned with TypeScript types

**React Components**:
- Props interfaces for all components defining expected data shape
- Component state typed with useState<Type> for type safety
- Event handlers typed with appropriate event types

**Data Fetching**:
- Server Components return typed data from Prisma queries
- Client Components receive typed props from parent Server Components
- Server Actions return typed results consumed by client components

---

## Validation Schemas

### Overview
Validation schemas use Zod for runtime type checking and validation, providing both client-side form validation and server-side input validation. All schemas defined in `validations.ts` file.

### Schema Definitions

**NewCountSessionSchema**: Validates count session creation inputs
- counter: String, minimum 1 character (required), matches existing user name
- department: String, minimum 1 character (required), matches existing department name
- storeName: String, minimum 1 character (required), matches existing location name
- date: String in ISO date format (YYYY-MM-DD), not future date, required
- notes: String, maximum 1000 characters, optional

**CountQuantitySchema**: Validates individual count quantity entry
- countDetailId: UUID string, required
- actualQuantity: Number, non-negative, precision based on unit type (integer for 'pcs', up to 3 decimals for 'kg/L'), required
- isSubmitted: Boolean, optional

**CompleteCountSchema**: Validates count completion inputs
- countStockId: UUID string, required
- items: Array of CountQuantitySchema objects, minimum 1 item required (at least one item must be counted)
- sessionNotes: String, maximum 1000 characters, optional

**CancelCountSchema**: Validates count cancellation inputs
- countStockId: UUID string, required
- cancellationReason: String, minimum 10 characters (meaningful reason required), maximum 1000 characters, required

**DeleteCountSchema**: Validates count deletion inputs
- countStockId: UUID string, required (simple validation for delete operations)

### Validation Error Handling

**Client-Side Validation**:
- React Hook Form integrates Zod schemas via zodResolver
- Validation runs on field blur and form submit
- Errors displayed inline near respective form fields
- Submit button disabled until all validations pass

**Server-Side Validation**:
- Server Actions parse inputs using Zod schema.parse() or schema.safeParse()
- Validation failures return 400 Bad Request with structured error messages
- Error format: { field: string, message: string }[] for field-specific errors
- Generic validation failures return single error message

---

## Integration Points

### Inventory Transaction System Integration

**Purpose**: Retrieve expected quantities and post count adjustments to core inventory system

**Expected Quantity Lookup**:
- Query tb_inventory_transaction_closing_balance for most recent closing_qty per product at location
- Join via product_id and location_id
- Order by closing_date DESC, use DISTINCT ON (product_id) for most recent
- Default to expected_qty = 0 if no closing balance record found (with warning flag)
- Display warning tooltip in Count Detail Form for items with missing closing balance

**Count Adjustment Posting** (UC-PCM-202, future enhancement):
- After count completion and variance approval
- For each item with variance (actual_qty ≠ expected_qty):
  - Calculate adjustment_qty = actual_qty - expected_qty
  - Insert transaction into tb_inventory_transaction:
    - transaction_type = 'count_adjustment'
    - in_qty = adjustment_qty (if positive, represents receipts)
    - out_qty = abs(adjustment_qty) (if negative, represents issues)
    - reference_no = count_stock_no
    - reference_id = count_stock_id
    - transaction_date = count end_date
- Inventory Transaction System updates tb_inventory_transaction_closing_balance with new balances
- Cost recalculation triggered per FIFO/Average cost method (see SM-costing-methods.md)

### Notification Service Integration

**Purpose**: Send alerts to supervisors and managers for count completion and high variance

**Event Types**:
- COUNT_COMPLETED: Sent when count session transitions to 'completed' status
- HIGH_VARIANCE_DETECTED: Sent when variance percentage exceeds threshold (>5%)
- COUNT_STALLED: Sent by scheduled job for in-progress counts with no activity >4 hours (future)

**Notification Recipients**:
- Supervisor for location (from tb_location.supervisor_id)
- Inventory Manager (if high variance)
- Finance Manager (if high-value variance, future)

**Notification Content**:
- Email/SMS with count summary: Reference number, Location, Counter, Variance %
- Link to view count details in application
- Action required (if any): Review, Approve, Investigate

### Reporting Module Integration

**Purpose**: Export completed count data for variance reports and accuracy dashboards

**Data Export**:
- Reporting Module queries tb_count_stock and tb_count_stock_detail for completed counts
- Aggregates variance metrics: Average variance %, high-variance count, top variance products
- Generates reports: Daily Variance Summary, Monthly Accuracy Report, Audit Compliance Report
- Reports distributed via email or accessible in reporting dashboard

---

## Error Handling

### Error Categories

**Validation Errors** (400 Bad Request):
- User input fails Zod schema validation
- Business rule violations (e.g., active count exists for location)
- Workflow constraint violations (e.g., invalid status transition)
- Response includes field-specific error messages for user correction

**Authorization Errors** (403 Forbidden):
- User lacks required role for action
- User lacks permission for location
- User attempts to modify count created by another user without supervisor role
- Response includes generic permission denied message (no sensitive details exposed)

**Not Found Errors** (404 Not Found):
- Count session ID does not exist
- Referenced entity (user, location, product) not found
- Response includes entity type and ID for debugging

**Conflict Errors** (409 Conflict):
- Concurrent modification detected (optimistic locking violation)
- Duplicate count creation attempt for same location
- Response instructs user to refresh and retry

**Server Errors** (500 Internal Server Error):
- Database connection failures
- Transaction rollback due to unexpected error
- External system integration failures
- Response includes generic error message; detailed error logged server-side only

### Error Response Format

Server Actions return discriminated union result type:
- Success: { success: true, data: T }
- Error: { success: false, error: { code: string, message: string, field?: string } }

UI consumes result and displays appropriate feedback:
- Validation errors: Inline near form fields
- Authorization errors: Toast notification with error message
- Server errors: Toast notification with user-friendly message + log error details

### Error Logging

All errors logged to application logging service with context:
- User ID and username
- Attempted action and input parameters (sanitized, no sensitive data)
- Error type, message, and stack trace
- Request metadata (timestamp, IP address, user agent)

---

## Performance Considerations

### Database Query Optimization

**Count List Query**:
- Index on (deleted_at, doc_status, created_at) for efficient filtering and sorting
- Limit query to 100 records by default (pagination for larger datasets)
- Use SELECT only required columns (avoid SELECT *)
- Join tb_location and tb_user for denormalized display data (location_name, counter_name)

**Count Detail Query**:
- Index on (count_stock_id) for fast line item retrieval
- Join tb_product for product details (name, SKU, description, unit)
- Batch query expected quantities (single query with IN clause for all product_ids)

**Expected Quantity Lookup**:
- Index on (product_id, location_id, closing_date) for fast closing balance lookup
- Use DISTINCT ON (product_id) with ORDER BY closing_date DESC for most recent balance
- Batch query for multiple products to minimize round trips

### Client-Side Performance

**List/Grid Rendering**:
- Virtualized scrolling for large count lists (>100 items) using react-virtual or similar
- Debounced search input (300ms delay) to prevent excessive re-renders
- Client-side filtering for small datasets (<1000 records), server-side for larger

**Count Detail Form**:
- Virtualized table for item lists (>500 items) to prevent DOM bloat
- Debounced variance calculation (100ms) to prevent calculation on every keystroke
- Optimistic UI updates for item submission (immediate checkmark, async save)

**State Management**:
- Minimize re-renders using React.memo for list items and cards
- Use useCallback for event handlers to prevent unnecessary re-renders
- Avoid global state; use component-level state for UI interactions

### Server Action Performance

**Transaction Management**:
- Keep database transactions short (< 100ms target)
- Batch updates where possible (multiple item quantities in single transaction)
- Use read-committed isolation level for count queries (avoid serializable unless required)

**Caching Strategy**:
- Cache user permissions in session for 5 minutes (reduce database lookups)
- Cache location/department/product lookups in Server Component for page renders
- No caching for count session data (real-time accuracy required)

---

## Security Considerations

### Authentication and Authorization

**Authentication**:
- All Server Actions validate user authentication via Supabase Auth session
- Unauthenticated requests return 401 Unauthorized
- Session tokens validated on every request (no client-side-only auth)

**Authorization**:
- Server Actions check user role against required permission for action
- Location-scoped permissions: User can only access counts for assigned locations
- Role-based action permissions:
  - Storekeeper: Create counts, enter quantities, view own counts
  - Supervisor: All storekeeper permissions + cancel counts, delete pending counts, view all counts for department
  - Manager: All supervisor permissions + approve adjustments, configure workflows

**Permission Validation Pattern**:
1. Load user from session with roles and location assignments
2. Check required role for action (e.g., 'supervisor' for cancel operation)
3. Check location permission if action scoped to location
4. If validation fails: Return 403 Forbidden with generic message (no permission details exposed)

### Input Validation and Sanitization

**Server-Side Validation**:
- All Server Action inputs validated using Zod schemas before processing
- No trust placed on client-side validation (defense in depth)
- SQL injection prevention via Prisma parameterized queries (never raw SQL with user input)
- XSS prevention via React's built-in escaping (no dangerouslySetInnerHTML with user content)

**Data Sanitization**:
- User-entered text (notes, cancellation reason) sanitized to remove script tags
- Maximum length limits enforced (prevent database overflow or DoS)
- UUID validation for all ID parameters (prevent enumeration attacks)

### Audit Trail and Compliance

**Audit Logging**:
- All count modifications logged with user attribution and timestamp
- Workflow history embedded in count session record (JSON field)
- Separate audit log table (tb_audit_log) for system-wide activity tracking
- Audit logs immutable (insert only, no updates/deletes)

**Data Retention**:
- Completed and cancelled counts retained indefinitely for financial audit compliance (7 years minimum)
- Soft delete pattern ensures deleted counts remain in database for audit purposes
- Audit logs retained per compliance policy (7+ years)

**Sensitive Data Handling**:
- No PII in count records (user IDs only, names for display denormalized from tb_user)
- Variance data not considered sensitive but treated as confidential business information
- Access logs maintained for compliance reporting

---

## Testing Strategy

### Unit Testing

**Server Actions**:
- Mock Prisma Client to isolate database interactions
- Test input validation with Zod schema edge cases
- Test business logic validation (workflow constraints, authorization)
- Test error handling and error response formatting
- Test audit logging calls

**Components**:
- Test rendering with various prop combinations
- Test user interactions (button clicks, form submissions)
- Test form validation error display
- Mock Server Action calls to isolate component logic

### Integration Testing

**Server Action Integration**:
- Use test database instance for Prisma operations
- Test full Server Action flow: validation → authorization → database → response
- Test transaction rollback on errors
- Test concurrent modification scenarios

**Component Integration**:
- Test component interaction with Server Actions via React Testing Library
- Test data fetching and display (Server Components)
- Test form submission and Server Action result handling

### End-to-End Testing

**Critical User Workflows** (Playwright tests):
- Create count session → Enter quantities → Complete count (happy path)
- Create count session → Start count → Cancel count (cancellation flow)
- Filter and search counts → View completed count (read-only flow)
- High variance detection → Notification triggered (alert flow)

---

## Deployment and Operations

### Environment Variables

Required environment variables:
- DATABASE_URL: PostgreSQL connection string (Supabase)
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key
- SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (server-side only)

### Database Migrations

Migration strategy for schema changes:
- Use Prisma Migrate for version-controlled schema evolution
- Test migrations on staging environment before production
- Backup database before applying production migrations
- Document breaking changes and required code updates

### Monitoring and Observability

**Application Monitoring**:
- Vercel Analytics for Next.js performance metrics
- Server Action execution time tracking
- Error rate monitoring by error type
- User activity tracking (counts created, completed per day)

**Database Monitoring**:
- Query performance monitoring via Supabase dashboard
- Slow query alerts (queries >1 second)
- Connection pool utilization tracking
- Table size growth monitoring

**Alert Thresholds**:
- Server Action error rate >5% → Alert development team
- Count completion variance anomaly (average variance >10%) → Alert inventory manager
- Database connection pool exhaustion → Alert DevOps team

---

## Future Enhancements

### Phase 2 Features

**Offline Mode**:
- Progressive Web App support for count entry without network
- Local storage for draft count data
- Background sync when connection restored

**Barcode Scanning**:
- Mobile app integration with barcode scanner
- Product lookup by barcode/SKU
- Voice input for quantity entry (hands-free counting)

**Approval Workflow**:
- Multi-step approval for high-variance counts
- Email notifications to approvers
- Approval history tracking
- Configurable approval rules per location

**Advanced Reporting**:
- Variance trend analysis over time
- Product-level accuracy metrics
- Counter performance tracking
- Interactive dashboards with drill-down

### Technical Debt Items

**Optimistic Locking**:
- Add version field to tb_count_stock for concurrent modification detection
- Implement optimistic locking in Server Actions
- Return 409 Conflict with reload prompt on version mismatch

**Type Safety Improvements**:
- Consolidate type definitions (eliminate duplication between UI types and Prisma types)
- Generate Zod schemas from TypeScript interfaces using zod-to-ts
- Share types between client and server via centralized types library

**Performance Optimization**:
- Implement server-side pagination for count list (>1000 records)
- Add database indexes based on query analysis
- Optimize expected quantity lookup with materialized view

**Testing Coverage**:
- Increase unit test coverage to 80%+
- Add integration tests for all Server Actions
- Add E2E tests for critical workflows
- Implement visual regression testing for UI components

---

**Document End**

> 📝 **Implementation Note**:
> This Technical Specification provides implementation guidance for Physical Count Management based on the UI prototype and Prisma schema analysis. Developers should use this document as the authoritative source for server action signatures, validation rules, data flows, and integration patterns when implementing the backend functionality. The specification is designed to be implemented using Next.js 14+ App Router patterns, Server Actions, and Prisma ORM with PostgreSQL.
