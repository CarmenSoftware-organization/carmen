# Technical Specification: Credit Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Credit Note
- **Route**: `/procurement/credit-note`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Procurement Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | Documentation Team | Initial version from source code analysis |

---

## Overview

This technical specification describes the implementation of the Credit Note module using Next.js 14 App Router, React, TypeScript, and Supabase. The module implements two distinct credit note types (quantity-based returns with FIFO costing and amount-based discounts), vendor and GRN selection workflows, inventory lot tracking, automatic journal entry generation, tax calculations, and approval workflows.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DD (Data Definition) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-credit-note.md) - Requirements in text format (no code)
- [Use Cases](./UC-credit-note.md) - Use cases in text format (no code)
- [Data Definition](./DD-credit-note.md) - Data definitions in text format (no SQL code)
- [Flow Diagrams](./FD-credit-note.md) - Visual diagrams (no code)
- [Validations](./VAL-credit-note.md) - Validation rules in text format (no code)

---

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
┌─────────────┐
│  Next.js    │
│   Server    │
├─────────────┤
│   React     │
│ Components  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
│  PostgreSQL │
└─────────────┘
```

### Component Architecture

The Credit Note module follows Next.js 14 App Router conventions with server-side rendering for initial page loads and client-side interactivity for data manipulation. The module integrates with GRN module for source data, Inventory module for lot tracking, and Finance module for GL postings.

- **Frontend Layer**
  - Page Components: List page, detail page with dynamic routing, vendor selection, GRN selection
  - UI Components: Data tables, forms, tabs, dialogs for credit note operations
  - State Management: React useState for component-level state
  - API Client: Mock data integration (future: Supabase client)

- **Backend Layer**
  - Server Actions: Handle credit note CRUD operations and business logic (future implementation)
  - Data Access Layer: Interface with mock data (future: database queries)
  - Business Logic: FIFO costing calculations, tax calculations, status transitions, approval workflows
  - Integration Layer: Stock movements, journal entries, GRN references, vendor payables

- **Data Layer**
  - Mock Data: Centralized mock data in lib/mock directory
  - Type Definitions: Centralized TypeScript interfaces in lib/types
  - Data Models: CreditNote, CreditNoteItem, AppliedLot, CreditNoteAttachment

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS, Shadcn/ui components
- **State Management**: React useState for local state
- **Form Handling**: React Hook Form (planned for future implementation)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Data Tables**: Custom shadcn-based data table with sorting and filtering

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js Server Actions (planned for future implementation)
- **Database**: PostgreSQL via Supabase (currently using mock data)
- **Authentication**: NextAuth.js / Supabase Auth
- **File Storage**: Supabase Storage (for attachments)

### Business Logic
- **FIFO Costing Engine**: Calculates weighted average costs from inventory lots
- **Tax Calculation Engine**: Applies tax rates and calculates input VAT adjustments
- **Approval Workflow Engine**: Determines approval requirements based on thresholds
- **Journal Entry Generator**: Creates GL entries for posting to finance module

### Testing
- **Unit Tests**: Vitest (planned)
- **E2E Tests**: Playwright (planned)

### DevOps
- **Version Control**: Git
- **Hosting**: Vercel
- **Database**: Supabase cloud

---

## Component Structure

### Directory Structure

```
app/(main)/procurement/credit-note/
├── page.tsx                                    # Credit note list page
├── [id]/
│   └── page.tsx                                # Credit note detail page
├── new/
│   └── page.tsx                                # New credit note - vendor selection
├── components/
│   ├── credit-note-management.tsx              # List component with filtering
│   ├── credit-note-detail.tsx                  # Detail view wrapper
│   ├── credit-note.tsx                         # Main detail component with tabs
│   ├── vendor-selection.tsx                    # Vendor selection dialog
│   ├── grn-selection.tsx                       # GRN selection dialog
│   ├── item-and-lot-selection.tsx              # Item/lot selection with FIFO
│   ├── inventory.tsx                           # Lot application display tab
│   ├── journal-entries.tsx                     # Journal entries display tab
│   ├── tax-entries.tsx                         # Tax calculations display tab
│   ├── stock-movement.tsx                      # Stock movements display tab
│   ├── cn-lot-application.tsx                  # Lot application details
│   ├── item-details-edit.tsx                   # Item detail edit form
│   ├── lot-selection.tsx                       # Lot selection component
│   ├── advanced-filter.tsx                     # Advanced filtering
│   └── StockMovementTab.tsx                    # Stock movement tab

lib/
├── types/
│   └── credit-note.ts                          # Credit note type definitions
└── mock/
    ├── credit-notes.ts                         # Mock credit note data
    └── static-credit-notes.ts                  # Static mock data for development
```

### Key Components

#### List Page Component
**File**: `page.tsx` (main)
**Purpose**: Display paginated list of all credit notes with filtering and sorting
**Responsibilities**:
- Render main page layout with "New Credit Note" action button
- Display credit note management component
- Handle navigation to creation workflow
- Support card view and table view modes

#### Credit Note Management Component
**File**: `components/credit-note-management.tsx`
**Purpose**: Main list interface with filtering, sorting, and bulk operations
**Responsibilities**:
- Load mock credit note data from centralized mock data file
- Display credit notes in card view or table view
- Provide status filtering (All, Draft, Submitted, Approved, Rejected, Voided)
- Support search across CN number, vendor name, description
- Render status badges with color coding (draft=gray, pending=yellow, approved=blue, posted=green, void=red)
- Provide row actions (view, edit, approve, reject, delete)
- Handle bulk operations (approve, reject, delete selected)
- Maintain pagination state with configurable page sizes
- Sort by any column in ascending or descending order

#### Detail Page Component
**File**: `[id]/page.tsx`
**Purpose**: Dynamic route handler for credit note detail view
**Responsibilities**:
- Load credit note data from mock data store based on ID parameter
- Render credit note detail wrapper component
- Handle navigation between list and detail views

#### Detail Wrapper Component
**File**: `components/credit-note-detail.tsx`
**Purpose**: Wrapper component for credit note detail interface
**Responsibilities**:
- Pass credit note data to main detail component
- Handle component mounting and initialization
- Manage component lifecycle

#### Main Detail Component
**File**: `components/credit-note.tsx`
**Purpose**: Primary credit note interface with tabbed navigation and header
**Responsibilities**:
- Display credit note header with key information:
  - CN number, date, status
  - Credit type (QUANTITY_RETURN or AMOUNT_DISCOUNT)
  - Vendor information (name, code)
  - Currency and exchange rate
  - Invoice and tax invoice references
  - GRN reference (if applicable)
  - Credit reason and description
- Render tabbed interface for different aspects:
  - Inventory tab (lot applications and FIFO analysis)
  - Journal Entries tab (GL postings)
  - Tax Entries tab (VAT calculations)
  - Stock Movement tab (inventory adjustments for quantity returns)
- Manage tab state and switching between tabs
- Handle field edit interactions for header information
- Provide action buttons based on status:
  - Save (for draft edits)
  - Submit for Approval (draft to pending)
  - Approve/Reject (for approvers)
  - Post (approved to posted)
  - Void (posted to void)
- Display status badge with appropriate color
- Integrate all tabs as separate components

#### Vendor Selection Component
**File**: `components/vendor-selection.tsx`
**Purpose**: First step in credit note creation workflow
**Responsibilities**:
- Display searchable list of vendors
- Support vendor search by name or code
- Render vendor cards with key information (name, code, contact)
- Handle vendor selection via radio buttons
- Navigate to GRN selection upon vendor selection
- Maintain vendor selection state

#### GRN Selection Component
**File**: `components/grn-selection.tsx`
**Purpose**: Second step for selecting source GRN
**Responsibilities**:
- Display searchable list of GRNs for selected vendor
- Support search by GRN number or invoice number
- Show GRN information (number, date, invoice, amount)
- Handle GRN selection
- Navigate to item/lot selection upon GRN selection
- Allow skipping GRN selection for standalone credit notes

#### Item and Lot Selection Component
**File**: `components/item-and-lot-selection.tsx`
**Purpose**: Core component for selecting items, lots, and calculating FIFO costs
**Responsibilities**:
- Display credit note type selection (Quantity Return vs Amount Discount)
- Show GRN items in expandable table format
- For each item, display available inventory lots with:
  - Lot number
  - Receive date
  - GRN number and invoice reference
  - Available quantity
  - Unit cost
- Support lot selection via checkboxes
- Accept return quantity input per selected lot
- Calculate real-time FIFO summary:
  - Total received quantity across selected lots
  - Weighted average cost using FIFO method
  - Current unit cost
  - Cost variance (current - FIFO average)
  - Return quantity
  - Return amount (quantity × current cost)
  - Cost of goods sold (quantity × FIFO weighted average)
  - Realized gain/loss (return amount - COGS)
- Display FIFO analysis in expandable section per item
- Support discount amount entry (in addition to or instead of quantity return)
- Validate return quantities don't exceed lot availability
- Save item/lot selections and navigate to detail view
- Handle both quantity return and amount discount workflows

#### Inventory Tab Component
**File**: `components/inventory.tsx`
**Purpose**: Display lot application details and FIFO cost analysis
**Responsibilities**:
- Show applied lots table for each credit note item
- Display lot application details:
  - Lot number with receive date
  - Original GRN and invoice references
  - Return quantity from this lot
  - Lot unit cost
- Show FIFO cost summary:
  - Total received quantity
  - Weighted average cost
  - Current unit cost
  - Cost variance
  - Return amount, COGS, realized gain/loss
- Display aggregate totals across all items
- Provide expandable/collapsible sections per item
- Highlight positive variances in green, negative in red
- Support export to Excel functionality (future enhancement)

#### Journal Entries Tab Component
**File**: `components/journal-entries.tsx`
**Purpose**: Display generated journal entries for posted credit notes
**Responsibilities**:
- Show journal entries grouped by entry type:
  - Primary Entries Group (AP credit, inventory adjustment, input VAT)
  - Inventory Entries Group (cost variance adjustments)
- Display entry details per line:
  - GL account code and name
  - Department and cost center
  - Entry description
  - Reference (CN number, GRN number)
  - Debit and credit amounts
  - Tax code (if applicable)
  - Entry order number
- Validate total debits equal total credits
- Display group subtotals
- Show posting date and journal voucher reference
- Read-only view of system-generated entries

#### Tax Entries Tab Component
**File**: `components/tax-entries.tsx`
**Purpose**: Display tax calculations and VAT adjustments
**Responsibilities**:
- Show document information:
  - Credit note number
  - Tax invoice reference
  - Document date
  - Vendor name and tax ID
- Display tax calculations:
  - Base amount (net of tax)
  - Tax rate (typically 18%)
  - Tax amount
  - Original invoice base and tax (for comparison)
- Show VAT adjustments:
  - Type (Input VAT)
  - Tax code (VAT18 or applicable rate)
  - Description
  - Base amount, rate, tax amount
  - GL account code (1240 - Input VAT)
- Display VAT period information:
  - Period name (e.g., "October 2024")
  - VAT return status (Open/Closed)
  - Due date for return
  - Reporting code (BOX4 for input VAT credit)
- Calculate tax impact on vendor payable
- Read-only display of system-calculated values

#### Stock Movement Tab Component
**File**: `components/stock-movement.tsx` and `StockMovementTab.tsx`
**Purpose**: Display inventory movements for quantity-based credits
**Responsibilities**:
- Show stock movements generated when credit note posted
- Display movement details per item:
  - Location type (INV=Inventory, CON=Consignment)
  - Lot number
  - Quantity (negative for returns)
  - Unit cost and extra costs
  - Movement date
- Show before and after inventory balances per lot
- Display total value impact
- Read-only view (movements generated by system)
- Only visible for quantity-based credit notes

#### CN Lot Application Component
**File**: `components/cn-lot-application.tsx`
**Purpose**: Detailed lot application analysis and display
**Responsibilities**:
- Display detailed lot-by-lot breakdown
- Show FIFO calculation methodology
- Display cost variance analysis
- Provide drill-down into lot details
- Support lot-level reporting

#### Item Details Edit Component
**File**: `components/item-details-edit.tsx`
**Purpose**: Edit form for individual credit note items
**Responsibilities**:
- Display item detail form dialog
- Support editing of item fields (quantity, discount, description)
- Validate item-level data
- Recalculate line totals on changes
- Save item updates to parent component

#### Lot Selection Component
**File**: `components/lot-selection.tsx`
**Purpose**: Lot selection interface for item returns
**Responsibilities**:
- Display available lots for selected item
- Support lot filtering and search
- Handle lot selection logic
- Validate lot availability
- Pass selected lots back to parent

#### Advanced Filter Component
**File**: `components/advanced-filter.tsx`
**Purpose**: Advanced filtering options for credit note list
**Responsibilities**:
- Provide filter UI for multiple criteria:
  - Date range (from/to)
  - Vendor selection
  - Credit type
  - Status
  - Amount range
  - Credit reason
- Apply filters to credit note list
- Clear filters functionality
- Save filter preferences (future enhancement)

---

## Data Flow

### Read Operations

```
User navigates to Credit Note List
    ↓
Page Component loads
    ↓
Component imports mock data from lib/mock
    ↓
Mock data passed to Management Component
    ↓
Management Component receives data
    ↓
User applies filters/sorting
    ↓
Component filters/sorts data in memory
    ↓
Filtered results displayed in card or table view
```

### Vendor and GRN Selection Flow

```
User clicks "New Credit Note"
    ↓
Navigation to vendor selection page
    ↓
Vendor Selection Component loads vendor list
    ↓
User searches and selects vendor
    ↓
Component stores vendor in local state
    ↓
Navigation to GRN selection (optional)
    ↓
GRN Selection Component loads GRNs for vendor
    ↓
User searches and selects GRN OR skips
    ↓
Component stores GRN reference
    ↓
Navigation to item/lot selection
```

### Item/Lot Selection and FIFO Calculation Flow

```
Item/Lot Selection Component loads
    ↓
System displays GRN items (if GRN selected)
    OR product catalog (if manual)
    ↓
User selects credit note type:
  - QUANTITY_RETURN → Enable lot selection
  - AMOUNT_DISCOUNT → Enable discount entry only
    ↓
For QUANTITY_RETURN:
  User expands item to view available lots
    ↓
  Component loads lot data from inventory
    ↓
  User checks lot selection checkboxes
    ↓
  User enters return quantity per lot
    ↓
  System validates quantity ≤ lot available
    ↓
  System calculates FIFO costing:
    - Retrieves lot costs from inventory
    - Calculates weighted average: Σ(qty × cost) / Σ(qty)
    - Determines current unit cost
    - Calculates variance: current - FIFO average
    - Computes return amount: qty × current cost
    - Computes COGS: qty × FIFO average
    - Computes realized gain/loss: return amt - COGS
    ↓
  System displays FIFO summary in real-time
    ↓
For AMOUNT_DISCOUNT:
  User enters discount amount per item
    ↓
  System calculates tax on discount
    ↓
User saves item/lot selections
    ↓
Navigation to credit note detail view
    ↓
Detail component displays complete credit note
```

### Credit Note Approval Workflow Flow

```
User opens draft credit note
    ↓
User clicks "Submit for Approval"
    ↓
System performs validation:
  - All required fields present
  - Items and lots selected
  - Calculations correct
    ↓
System determines approval requirement:
  IF credit amount ≤ auto-approval threshold
    → Auto-approve, change status to APPROVED
  IF credit amount > threshold
    → Change status to PENDING
    → Send notification to approver
    ↓
Approver receives notification
    ↓
Approver opens credit note
    ↓
Approver reviews:
  - Header information
  - Items and quantities
  - FIFO analysis
  - Financial impact
    ↓
Approver decides:
  APPROVE:
    - Clicks "Approve" button
    - Enters optional approval comments
    - Status changes to APPROVED
    - Requester notified
  REJECT:
    - Clicks "Reject" button
    - Enters rejection reason (required)
    - Status changes to REJECTED
    - Requester notified
    - Credit note returns to DRAFT for revision
```

### Posting and Journal Entry Generation Flow

```
User opens approved credit note
    ↓
User clicks "Post" button
    ↓
System performs pre-posting validation:
  - Accounting period open for document date
  - GL accounts configured
  - Vendor account active
  - Inventory locations valid (for qty returns)
    ↓
System generates journal entries:
  PRIMARY ENTRIES GROUP:
    Entry 1: DR Accounts Payable (2100)
      - Department: Purchasing (PUR)
      - Amount: Credit total
      - Description: "CN Vendor Adjustment"
      - Reference: CN number

    Entry 2: CR Inventory (1140) [qty returns only]
      - Department: Warehouse (WHS)
      - Amount: Net inventory value (qty × FIFO cost)
      - Description: "Inventory Value Adjustment"
      - Reference: GRN number

    Entry 3: CR Input VAT (1240)
      - Department: Accounting (ACC)
      - Amount: Tax amount
      - Tax code: VAT with rate
      - Description: "Tax Adjustment"
      - Reference: CN number

  INVENTORY ENTRIES GROUP [if cost variance exists]:
    Entry 4: DR/CR Cost Variance account
      - Department: Warehouse (WHS)
      - Amount: (current cost - FIFO cost) × qty
      - Description: "FIFO Cost Variance"
      - Reference: CN number
    ↓
System validates journal balance:
  - Total debits = Total credits
    ↓
System generates stock movements [qty returns only]:
  For each item with lot selection:
    - Transaction type: Credit Note Return
    - Location type: INV or CON
    - Lot number: From selected lots
    - Quantity: Negative (e.g., -10 for return)
    - Unit cost: From FIFO calculation
    - Extra cost: Proportional allocation
    - Movement date: Posting date
    - Reference: CN number
    ↓
System posts transactions atomically:
  1. Post journal entries to Finance module
  2. Post stock movements to Inventory module
  3. Update vendor payable balance
  4. Change credit note status to POSTED
  5. Assign posting date and reference number
    ↓
System sends notifications:
  - Email to finance team
  - Email to requester
  - In-app notifications
    ↓
System logs posting in audit trail
    ↓
User sees success message
    ↓
Detail view refreshes with posted status
    ↓
Credit note locked from edits
```

### Voiding Flow

```
User opens posted credit note
    ↓
User clicks "Void" button (manager only)
    ↓
System prompts for void reason:
  - Error in quantities/amounts
  - Vendor dispute
  - Duplicate credit note
  - Other (with explanation)
    ↓
User enters void reason and comments
    ↓
System displays void impact preview:
  - Journal entries to be reversed
  - Stock movements to be reversed
  - Vendor payable adjustment
    ↓
User confirms void operation
    ↓
System performs void validation:
  - Accounting period open
  - No dependent transactions (payments, settlements)
    ↓
System generates reversing entries:
  - Same journal entries with opposite DR/CR
  - Same stock movements with opposite quantities
  - Same GL accounts, amounts, references
    ↓
System posts reversing transactions:
  1. Post reversing journal entries
  2. Post reversing stock movements
  3. Restore vendor payable balance
  4. Change status to VOID
  5. Assign void date and reference
    ↓
System sends void notifications
    ↓
System logs void in audit trail with reason
    ↓
User sees void confirmation
    ↓
Original credit note retained with VOID status
```

---

## State Management

### Local State (React useState)

Components use React useState for:
- **Tab selection**: Active tab in detail view
- **Edit mode**: Toggle between view and edit modes (draft only)
- **Form field values**: All header and item fields during editing
- **Filter state**: Status filters, search terms, date ranges in list
- **Sort state**: Column and direction in data table
- **Dialog states**: Open/close for vendor selection, GRN selection, lot selection
- **Loading states**: Loading indicators during data operations
- **Error states**: Validation errors and error messages
- **Selection state**: Selected lots, selected items for bulk operations
- **Expansion state**: Expanded/collapsed FIFO analysis sections

### No Global State Currently

The module currently does not use global state management (no Zustand store like GRN module). All state is local to components. Future enhancement may add global state for:
- Credit note creation workflow across multiple pages
- User preferences (view mode, filter preferences)
- Draft autosave functionality

---

## API Integration Points

### Current Implementation (Mock Data)

All data operations currently use mock data from centralized files:
- `lib/mock/credit-notes.ts` - Primary mock data
- `lib/mock/static-credit-notes.ts` - Static examples for testing

### Future Server Actions (Planned)

**Create Credit Note**
- Endpoint: Server action (future)
- Input: Credit note header, items, lot selections
- Output: Created credit note with assigned CN number
- Business logic: Validation, FIFO calculation, number generation

**Update Credit Note**
- Endpoint: Server action (future)
- Input: Credit note ID, updated fields
- Output: Updated credit note object
- Business logic: Status validation, recalculations, audit logging

**Submit for Approval**
- Endpoint: Server action (future)
- Input: Credit note ID
- Output: Updated status, approval notifications
- Business logic: Threshold check, approver determination, email notifications

**Approve/Reject Credit Note**
- Endpoint: Server action (future)
- Input: Credit note ID, approval decision, comments
- Output: Updated status
- Business logic: Authority validation, status transition, notifications

**Post Credit Note**
- Endpoint: Server action (future)
- Input: Credit note ID, posting date
- Output: Posted credit note with journal entries and stock movements
- Business logic: Journal entry generation, stock movement creation, GL posting, inventory updates

**Void Credit Note**
- Endpoint: Server action (future)
- Input: Credit note ID, void reason
- Output: Voided credit note with reversing entries
- Business logic: Reversing entry generation, transaction rollback, balance restoration

### Integration with Other Modules

**GRN Module Integration**
- Read GRN data: Retrieve GRN header and items for credit note creation
- Reference linkage: Store GRN reference in credit note
- Status tracking: No status updates to GRN (read-only reference)

**Inventory Module Integration**
- Read lot data: Retrieve available lots for return items
- Read lot costs: Get unit costs for FIFO calculations
- Post stock movements: Send negative stock movements on credit note posting
- Update balances: Reduce inventory quantities per lot

**Finance Module Integration**
- Post journal entries: Send GL entries on credit note posting
- Update vendor payable: Reduce payable balance by credit amount
- Post tax entries: Send input VAT adjustments for tax reporting
- Period validation: Validate accounting period is open before posting

**Vendor Module Integration**
- Read vendor data: Retrieve vendor information for selection
- Read vendor accounts: Get GL account codes for posting
- Credit application: Apply credit to vendor account balance (future)

---

## Business Logic Implementation

### FIFO Costing Engine

**Purpose**: Calculate weighted average cost of returned goods using First-In-First-Out method

**Algorithm Description**:
1. Retrieve all selected inventory lots for returned item
2. For each lot, get lot quantity and lot unit cost
3. Calculate total received quantity: sum of all lot quantities
4. Calculate weighted average cost: sum of (lot qty × lot cost) / total qty
5. Get current unit cost from product master or GRN item
6. Calculate cost variance: current cost - weighted average cost
7. Calculate return amount: return quantity × current cost
8. Calculate cost of goods sold: return quantity × weighted average cost
9. Calculate realized gain/loss: return amount - COGS
10. Store all calculations with credit note item for audit and reporting

**Data Requirements**:
- Inventory lot data with quantities and costs
- Product current cost or GRN item cost
- Return quantity per lot

**Output**:
- Weighted average cost per item
- Cost variance per item
- Realized gain/loss per item
- Total FIFO impact across all items

### Tax Calculation Engine

**Purpose**: Calculate input VAT adjustments on credit note amounts

**Algorithm Description**:
1. Retrieve tax rate applicable on credit note document date (typically 18%)
2. For each credit note item, get base amount (net of tax)
3. Calculate tax amount: base amount × tax rate
4. Round tax amount to 2 decimal places
5. Aggregate total base amount and total tax amount
6. Determine tax invoice reference (required for VAT credit)
7. Determine VAT period based on document date
8. Create tax entry record with all calculations
9. Store tax entry linked to credit note

**Data Requirements**:
- Tax rate configuration per date
- Credit note item amounts
- Vendor tax registration status
- Tax invoice reference

**Output**:
- Tax amount per item
- Total tax amount
- VAT period classification
- Tax entry for VAT return reporting

### Approval Workflow Engine

**Purpose**: Determine approval requirements and route credit notes to appropriate approvers

**Algorithm Description**:
1. User submits credit note (status changes DRAFT → PENDING)
2. System retrieves credit note total amount
3. System retrieves approval threshold configuration:
   - Auto-approval threshold (e.g., $500)
   - Manager approval threshold (e.g., $5,000)
4. IF total ≤ auto-approval threshold:
   - Change status directly to APPROVED
   - Skip manual approval
   - Log auto-approval in audit trail
5. ELSE IF total ≤ manager approval threshold:
   - Change status to PENDING
   - Route to department manager
   - Send email notification to manager
6. ELSE IF total > manager approval threshold:
   - Change status to PENDING
   - Route to procurement manager
   - Send email notification to procurement manager
7. Store approval requirement with credit note
8. Log status change in audit trail

**Data Requirements**:
- Approval threshold configuration per location/department
- Approver assignments per level
- User email addresses for notifications

**Output**:
- Status change (DRAFT → APPROVED or DRAFT → PENDING)
- Approval routing decision
- Notification triggers

### Journal Entry Generator

**Purpose**: Generate GL journal entries when credit note is posted

**Algorithm Description**:

1. Validate accounting period is open for credit note date
2. Retrieve GL account configuration:
   - Accounts Payable account (2100)
   - Inventory account (1140)
   - Input VAT account (1240)
   - Cost Variance account (configurable)
3. Generate Primary Entries Group:

   **Entry 1 - Accounts Payable Credit**:
   - Account: 2100
   - Department: Purchasing (PUR)
   - Debit amount: Credit note total amount
   - Description: "CN Vendor Adjustment"
   - Reference: Credit note number
   - Order: 1

   **Entry 2 - Inventory Adjustment** (quantity returns only):
   - Account: 1140
   - Department: Warehouse (WHS)
   - Credit amount: Net inventory value (sum of qty × FIFO cost per item)
   - Description: "Inventory Value Adjustment"
   - Reference: GRN number
   - Order: 2

   **Entry 3 - Input VAT Credit**:
   - Account: 1240
   - Department: Accounting (ACC)
   - Credit amount: Total tax amount
   - Tax code: VAT with applicable rate
   - Description: "Tax Adjustment"
   - Reference: Credit note number
   - Order: 3

4. Generate Inventory Entries Group (if cost variance exists):

   **Entry 4 - Cost Variance**:
   - Account: Cost variance account
   - Department: Warehouse (WHS)
   - Debit (if loss) or Credit (if gain): abs(cost variance × quantity)
   - Description: "FIFO Cost Variance"
   - Reference: Credit note number
   - Order: 4

5. Validate journal balance: total debits = total credits
6. Assign journal voucher number
7. Assign posting date
8. Store all entries with credit note
9. Post entries to Finance module

**Data Requirements**:
- GL account mapping configuration
- Department codes
- Credit note header and item data
- FIFO costing results
- Tax calculation results

**Output**:
- Complete journal voucher with entries
- Journal voucher number
- Posting reference
- Balance validation status

### Stock Movement Generator

**Purpose**: Generate inventory stock movements for quantity-based credit notes

**Algorithm Description** (quantity returns only):

1. Validate credit note type is QUANTITY_RETURN
2. For each credit note item with lot selection:

   a. Retrieve lot selection details:
      - Lot number
      - Return quantity
      - Unit cost from FIFO calculation
      - Extra costs (if any)

   b. Create stock movement record:
      - Transaction type: "Credit Note Return"
      - Location type: INV (Inventory) or CON (Consignment)
      - Lot number: From lot selection
      - Quantity: Negative value (e.g., -10 for 10 units returned)
      - Unit cost: From FIFO calculation
      - Extra cost: Proportional allocation if applicable
      - Movement date: Credit note posting date
      - Reference type: "Credit Note"
      - Reference number: CN number
      - Document ID: Credit note ID

   c. Calculate movement value:
      - Value: quantity × (unit cost + extra cost per unit)
      - Note: Value is negative for returns

3. Validate all stock movements created for all items
4. Post stock movements to Inventory module atomically
5. Inventory module updates:
   - Reduces lot available quantity by return quantity
   - Updates inventory valuation
   - Maintains lot traceability
   - Records movement in transaction history

**Data Requirements**:
- Credit note type
- Credit note items with lot selections
- FIFO costing results
- Location information
- Posting date

**Output**:
- Stock movement records per lot per item
- Inventory quantity updates
- Inventory valuation updates
- Movement transaction log

---

## Validation Logic

### Client-Side Validation

**Header Validation**:
- Document date: Required, cannot be future date
- Vendor: Required selection
- Currency: Required, defaults to base currency
- Exchange rate: Required if non-base currency, must be > 0
- Invoice reference: Required for tax credits
- Credit reason: Required selection from predefined list
- Description: Required, minimum 10 characters (50 for OTHER reason)

**Item Validation** (Quantity Returns):
- At least one item required
- Return quantity: Required, must be > 0, cannot exceed lot available quantity
- Lot selection: At least one lot selected per item
- Unit price: Required, must be > 0
- Location: Required for all items

**Item Validation** (Amount Discounts):
- At least one item required
- Discount amount: Required, must be > 0
- Discount cannot exceed original invoice amount (warning)

**FIFO Validation**:
- Lot data available: All selected lots must have cost data
- Quantity validation: Return quantities match lot selections
- Calculation validation: Weighted average cost calculation successful

### Server-Side Validation (Future Implementation)

**Pre-Save Validation**:
- Duplicate invoice number check (warn if exists for vendor)
- Vendor account active status check
- Product catalog validation for all items
- Inventory lot existence validation
- Numerical field range validations

**Pre-Submission Validation**:
- All required fields complete
- At least one item with valid lot selection (quantity) or discount (amount)
- Calculations correct (totals, tax, FIFO)
- Status is DRAFT

**Pre-Approval Validation**:
- User has approval authority for credit amount
- Credit note in PENDING status
- No concurrent edits detected

**Pre-Posting Validation**:
- Credit note in APPROVED status
- Accounting period open for document date
- All GL accounts configured and exist
- Vendor account exists and is active
- Inventory locations valid (for quantity returns)
- No dependent transactions exist (for void operation)

---

## Security and Permissions

### Role-Based Access Control

**Roles**:
- **Purchasing Staff**: Create, edit draft, submit, view
- **Receiving Clerk**: Create quantity returns, edit draft, view
- **Procurement Manager**: All purchasing staff permissions plus approve, reject, post, void
- **Finance Team**: View, post approved credits, review journal entries
- **Warehouse Staff**: View, confirm lot selections

**Permission Matrix**:

| Action | Purchasing Staff | Receiving Clerk | Procurement Manager | Finance Team | Warehouse Staff |
|--------|-----------------|-----------------|---------------------|--------------|-----------------|
| View List | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Detail | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Credit Note | ✓ | ✓ | ✓ | - | - |
| Edit Draft | ✓ | ✓ | ✓ | - | - |
| Submit for Approval | ✓ | ✓ | ✓ | - | - |
| Approve | - | - | ✓ | - | - |
| Reject | - | - | ✓ | - | - |
| Post | - | - | ✓ | ✓ | - |
| Void | - | - | ✓ | - | - |
| View Financial Data | ✓ | Limited | ✓ | ✓ | Limited |

### Data Access Controls

- **Location-Based Access**: Users can only view/edit credit notes for their assigned locations (unless cross-location permission granted)
- **Vendor-Based Access**: Users can only create credit notes for vendors they have permission to access
- **Status-Based Editing**: Only DRAFT status credit notes can be edited
- **Amount-Based Approval**: Approval authority validated against user's approval limit

### Audit Trail

All credit note operations logged with:
- **Action Type**: Create, update, submit, approve, reject, post, void
- **User**: Username and user ID
- **Timestamp**: Date and time of action
- **Details**: Changed fields, old/new values
- **IP Address**: Request source IP
- **Status Changes**: From/to status
- **Comments**: Approval/rejection comments, void reasons

Audit log is immutable (no deletion or editing allowed) and retained per compliance requirements.

---

## Performance Considerations

### Optimization Strategies

**Data Loading**:
- Paginated list loading (20 records per page default)
- Lazy loading of tab content (load tab data only when tab activated)
- Memoization of FIFO calculations (cache results per lot combination)
- Debounced search inputs (300ms delay)

**Calculation Performance**:
- FIFO calculations optimized for up to 50 lots per item
- Tax calculations cached per tax rate and base amount combination
- Journal entry generation pre-calculated on save, not on each view

**Component Rendering**:
- React memo for expensive components (FIFO summary, journal entries)
- Virtual scrolling for large item lists (future enhancement)
- Conditional rendering of tabs (don't render hidden tabs)

**Network Optimization** (Future):
- Batch API requests where possible
- Optimize database queries with proper indexing
- Implement caching layer for reference data (vendors, products, GL accounts)

### Performance Targets

- **List page load**: < 2 seconds with 1,000 credit notes
- **Detail page load**: < 1.5 seconds including all tabs
- **FIFO calculation**: < 2 seconds for 10 lots per item
- **Tax calculation**: < 1 second for 20 items
- **Save operation**: < 3 seconds including validation
- **Post operation**: < 5 seconds including journal and stock movements
- **Void operation**: < 5 seconds including reversing entries

---

## Error Handling

### Client-Side Error Handling

**Validation Errors**:
- Display inline field-level errors for form validation
- Show summary error list for multiple validation failures
- Highlight invalid fields with red border and error icon
- Prevent form submission until all errors resolved

**Network Errors**:
- Display user-friendly error messages for API failures
- Retry logic for transient network errors (3 retries with exponential backoff)
- Offline mode detection with appropriate messaging
- Automatic reconnection and data sync when network restored

**Component Errors**:
- Error boundaries wrap major components
- Fallback UI displayed on component crash
- Error details logged to console for debugging
- User can reload component or entire page

### Server-Side Error Handling (Future)

**Business Logic Errors**:
- Return structured error response with error code and message
- Log error details with context for debugging
- Roll back database transactions on errors
- Return user-actionable error messages

**System Errors**:
- Log critical errors to monitoring system
- Send alerts for repeated errors or critical failures
- Graceful degradation where possible
- Maintenance mode for severe system issues

**Data Integrity Errors**:
- Atomic transactions for posting and voiding operations
- Rollback on any failure in multi-step processes
- Validate data consistency before and after operations
- Lock records during updates to prevent concurrent modification

---

## Testing Strategy

### Unit Testing (Planned)

**Components to Test**:
- FIFO calculation logic with various lot combinations
- Tax calculation with different rates and amounts
- Journal entry generation with different credit types
- Stock movement generation for quantity returns
- Approval workflow logic with different thresholds
- Validation functions for all fields and business rules

**Test Framework**: Vitest
**Coverage Target**: > 80% for business logic, > 60% for UI components

### Integration Testing (Planned)

**Scenarios to Test**:
- End-to-end credit note creation flow (vendor → GRN → lots → save)
- Approval workflow (submit → approve → post)
- Void workflow with journal and stock movement reversal
- Multi-currency credit note with exchange rate conversion
- FIFO costing with complex lot selections
- Integration with GRN, Inventory, and Finance modules

**Test Framework**: Playwright
**Coverage**: All critical user paths

### Manual Testing

**Test Cases**:
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Responsive design on tablets (warehouse use case)
- User permission enforcement
- Data validation edge cases
- Large data volumes (100+ items, 50+ lots per item)

---

## Deployment

### Environment Configuration

**Development**:
- Local Next.js dev server
- Mock data for all operations
- Debug logging enabled
- Hot reload for code changes

**Staging**:
- Vercel preview deployment
- Supabase staging database
- Test data populated
- All features enabled for testing

**Production**:
- Vercel production deployment
- Supabase production database
- Error logging to monitoring service
- Performance monitoring enabled
- Feature flags for gradual rollout

### Database Migration Strategy

**Initial Deployment**:
1. Create database tables per DD document
2. Create indexes for performance
3. Set up foreign key constraints
4. Configure database functions and triggers
5. Load reference data (GL accounts, tax rates)
6. Migrate historical credit notes (if applicable)

**Ongoing Changes**:
- Version-controlled migration scripts
- Backward-compatible schema changes where possible
- Data migration scripts tested in staging
- Rollback plan for each migration

---

## Monitoring and Logging

### Application Monitoring

**Metrics to Track**:
- Credit note creation success/failure rate
- Average time to create credit note
- FIFO calculation performance
- Posting operation success rate
- Approval workflow completion time
- API response times

**Monitoring Tools** (Planned):
- Vercel Analytics for performance
- Sentry for error tracking
- Custom dashboard for business metrics

### Logging Strategy

**Log Levels**:
- **ERROR**: System errors, validation failures, API errors
- **WARN**: Business rule violations, deprecated feature usage
- **INFO**: User actions (create, submit, approve, post, void)
- **DEBUG**: Detailed execution flow (development only)

**Log Content**:
- Timestamp, user ID, credit note ID
- Action performed
- Request and response data (sanitized)
- Error details with stack trace
- Performance metrics (execution time)

**Log Retention**:
- ERROR/WARN logs: 90 days
- INFO logs: 30 days
- DEBUG logs: 7 days (development only)
- Audit trail: Permanent (compliance requirement)

---

## Future Enhancements

### Planned Features

1. **Workflow Automation**:
   - Auto-submission for low-value credits
   - Scheduled posting batch jobs
   - Automated approval reminders

2. **Advanced Reporting**:
   - Credit note aging report
   - FIFO variance analysis report
   - Vendor credit summary
   - Tax credit reconciliation report

3. **Enhanced FIFO Analysis**:
   - Visual charts for cost variance trends
   - Lot profitability analysis
   - Historical FIFO comparison

4. **Integration Enhancements**:
   - Real-time vendor account updates
   - Direct payment application from credits
   - EDI integration for vendor credit notifications

5. **Mobile Optimization**:
   - Native mobile app for warehouse returns
   - Barcode scanning for lot selection
   - Offline mode with sync

6. **AI/ML Features**:
   - Credit amount prediction based on historical data
   - Anomaly detection for unusual credits
   - Automated credit reason classification

---

## Glossary

**FIFO (First-In-First-Out)**: Inventory costing method that assumes first items purchased are first items returned.

**Cost Variance**: Difference between current inventory cost and FIFO weighted average cost.

**Realized Gain/Loss**: Financial impact of cost variance on credit note.

**Lot Tracking**: System capability to track specific inventory batches with unique identifiers.

**Input VAT**: Value-added tax paid on purchases that can be credited against output VAT.

**Journal Voucher**: Accounting document containing GL entries.

**Stock Movement**: Inventory transaction record showing quantity changes.

**Approval Threshold**: Credit amount limit requiring manager approval.

**GL Account**: General Ledger account number used in financial system.

---

## References

### Internal Documents
- Business Requirements (BR-credit-note.md)
- Use Cases (UC-credit-note.md)
- Data Definition (DD-credit-note.md)
- Flow Diagrams (FD-credit-note.md)
- Validations (VAL-credit-note.md)

### External Standards
- Next.js 14 Documentation
- React 18 Documentation
- TypeScript Documentation
- Tailwind CSS Documentation
- Shadcn/ui Component Library

### Code Standards
- /docs/CLAUDE.md - Project development standards
- /lib/types/README.md - Type system documentation
- /lib/mock/README.md - Mock data guidelines

---

**Document Control**:
- **Classification**: Internal Use
- **Distribution**: Development Team, Procurement Team, Finance Team
- **Review Cycle**: Quarterly or when technical architecture changes
- **Approval**: Technical Lead, Development Manager

**End of Document**
