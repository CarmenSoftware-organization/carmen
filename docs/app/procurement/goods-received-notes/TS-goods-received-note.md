# Technical Specification: Goods Received Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Goods Received Note (GRN)
- **Route**: `/procurement/goods-received-note`
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

This technical specification describes the implementation of the Goods Received Note (GRN) module using Next.js 14 App Router, React, TypeScript, and Supabase. The module implements two distinct creation workflows (PO-based and manual), comprehensive item management, quality inspection, multi-currency handling, and automatic stock movement generation.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DD (Data Definition) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-goods-received-note.md) - Requirements in text format (no code)
- [Use Cases](./UC-goods-received-note.md) - Use cases in text format (no code)
- [Data Definition](./DD-goods-received-note.md) - Data definitions in text format (no SQL code)
- [Flow Diagrams](./FD-goods-received-note.md) - Visual diagrams (no code)
- [Validations](./VAL-goods-received-note.md) - Validation rules in text format (no code)

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

The GRN module follows Next.js 14 App Router conventions with server-side rendering for initial page loads and client-side interactivity for data manipulation.

- **Frontend Layer**
  - Page Components: Main list page and detail page with dynamic routing
  - UI Components: Data tables, forms, tabs, dialogs for GRN operations
  - State Management: Zustand store for GRN creation workflow state
  - API Client: Mock data integration (future: Supabase client)

- **Backend Layer**
  - Server Actions: Handle GRN CRUD operations and business logic
  - Data Access Layer: Interface with mock data (future: database queries)
  - Business Logic: Validation, calculations, status transitions
  - Integration Layer: Stock movements, journal vouchers, PO updates

- **Data Layer**
  - Mock Data: Centralized mock data in lib/mock directory
  - Type Definitions: Centralized TypeScript interfaces in lib/types
  - Data Models: GoodsReceiveNote, GoodsReceiveNoteItem, related entities

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS, Shadcn/ui components
- **State Management**: Zustand for GRN creation workflow state
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
app/(main)/procurement/goods-received-note/
├── page.tsx                                    # GRN list page
├── [id]/
│   └── page.tsx                                # GRN detail page (view/edit/confirm modes)
├── new/
│   └── vendor-selection/
│       └── page.tsx                            # Vendor selection for PO-based creation
├── components/
│   ├── GoodsReceiveNoteList.tsx               # List component wrapper
│   ├── grn-shadcn-data-table.tsx              # Data table with filtering/sorting
│   ├── GoodsReceiveNoteDetail.tsx             # Detail view component
│   ├── tabs/
│   │   ├── GoodsReceiveNoteItems.tsx          # Items management tab
│   │   ├── ExtraCostsTab.tsx                  # Extra costs distribution tab
│   │   ├── StockMovementTab.tsx               # Stock movements display tab
│   │   ├── TaxTab.tsx                         # Tax calculation tab
│   │   ├── FinancialSummaryTab.tsx            # Financial summary tab
│   │   ├── ActivityLogTab.tsx                 # Activity log tab
│   │   ├── CommentsAttachmentsTab.tsx         # Comments and attachments tab
│   │   ├── RelatedPOList.tsx                  # Related POs tab
│   │   └── pending-purchase-orders.tsx        # Pending POs selection
│   └── itemDetailForm.tsx                     # Item detail form dialog
└── stores/
    └── useGRNCreationStore.ts                 # Zustand state management

lib/
├── types/
│   └── procurement.ts                         # GRN type definitions
└── mock/
    └── mock_goodsReceiveNotes.tsx             # Mock GRN data
```

### Key Components

#### List Page Component
**File**: `page.tsx` (main)
**Purpose**: Display paginated list of all GRNs with filtering and sorting
**Responsibilities**:
- Render main page layout with "New GRN" action button
- Display process type selection dialog (PO-based vs Manual)
- Route users to appropriate creation workflow
- Pass mock GRN data to list component for display

#### GRN List Component
**File**: `components/GoodsReceiveNoteList.tsx`
**Purpose**: Wrapper component that delegates to data table
**Responsibilities**:
- Load mock GRN data from centralized mock data file
- Pass data to shadcn-based data table component
- Handle data table wrapper responsibilities

#### Data Table Component
**File**: `components/grn-shadcn-data-table.tsx`
**Purpose**: Feature-rich data table with integrated sorting, filtering, and pagination
**Responsibilities**:
- Display GRN records in sortable columns
- Provide column-based filtering (status, vendor, date range)
- Support search across GRN number, vendor name, invoice number
- Render status badges with color coding
- Provide row actions (view, edit, void)
- Handle pagination with configurable page sizes
- Maintain filter and sort state

#### Detail Page Component
**File**: `[id]/page.tsx`
**Purpose**: Dynamic route handler for GRN detail view and editing
**Responsibilities**:
- Handle three ID scenarios: new records (new-*), deprecated flow (0), existing records
- Load GRN data from mock data store or Zustand creation store
- Support multiple modes via query parameter: view, edit, confirm, add
- Render detail component with appropriate mode
- Handle navigation between modes

#### Detail View Component
**File**: `components/GoodsReceiveNoteDetail.tsx`
**Purpose**: Main GRN detail interface with tabbed navigation
**Responsibilities**:
- Display GRN header with key information (number, status, vendor, dates)
- Render tabbed interface for different aspects of GRN
- Manage tab state and switching between tabs
- Handle edit mode toggling for DRAFT and RECEIVED status
- Provide action buttons (Save, Commit, Void) based on status and permissions
- Display status badge with appropriate color

#### Items Management Tab
**File**: `components/tabs/GoodsReceiveNoteItems.tsx`
**Purpose**: Manage received items with quantities, pricing, and attributes
**Responsibilities**:
- Display items in editable table format
- Support add, edit, delete operations on items
- Provide item detail form dialog for detailed editing
- Display item fields: code, name, quantities (ordered, delivered, received, rejected, damaged)
- Show quality status, discrepancy flags, storage locations
- Calculate and display line totals
- Handle batch/lot number entry
- Support item selection from product catalog via search

#### Extra Costs Tab
**File**: `components/tabs/ExtraCostsTab.tsx`
**Purpose**: Manage additional costs and distribution to items
**Responsibilities**:
- Display list of extra costs with type, amount, currency
- Provide add/delete operations for extra costs
- Support distribution method selection (net amount, quantity, equal)
- Calculate cost distribution across items based on selected method
- Update item costs when distribution method changes
- Display total extra costs
- Handle multi-currency extra costs with exchange rates

#### Stock Movement Tab
**File**: `components/tabs/StockMovementTab.tsx`
**Purpose**: Display generated stock movements after GRN commitment
**Responsibilities**:
- Show stock movements created from committed GRN
- Display movement details: item, quantity, from/to locations, cost
- Show before/after stock levels
- Display movement timestamps
- Read-only view of system-generated data

#### Financial Summary Tab
**File**: `components/tabs/FinancialSummaryTab.tsx`
**Purpose**: Display comprehensive financial calculations and journal voucher
**Responsibilities**:
- Display subtotal, discount, net amount, tax, extra costs, total
- Show multi-currency amounts (transaction and base currency)
- Display journal voucher entries if GRN committed
- Show GL account codes, departments, debit/credit amounts
- Validate journal voucher is balanced
- Display exchange rate and currency conversions

#### Activity Log Tab
**File**: `components/tabs/ActivityLogTab.tsx`
**Purpose**: Display chronological audit trail of GRN activities
**Responsibilities**:
- Show all GRN events (creation, modifications, status changes)
- Display activity type, description, user, timestamp
- Sort activities in reverse chronological order (newest first)
- Read-only display (no editing or deletion)
- Provide activity filtering or search (future enhancement)

#### Comments and Attachments Tab
**File**: `components/tabs/CommentsAttachmentsTab.tsx`
**Purpose**: Manage user comments and file attachments
**Responsibilities**:
- Display existing comments with user and timestamp
- Provide comment input field and add functionality
- Display attachment list with file names and download links
- Handle file upload for attachments (delivery notes, photos)
- Validate file types and sizes
- Store attachment URLs

---

## Data Flow

### Read Operations

```
User navigates to GRN List
    ↓
Page Component loads
    ↓
Component imports mock data from lib/mock
    ↓
Mock data passed to List Component
    ↓
Data Table Component receives data
    ↓
User applies filters/sorting
    ↓
Component filters/sorts data in memory
    ↓
Filtered results displayed to user
```

### Write Operations (Current Mock Implementation)

```
User fills GRN form
    ↓
Form Validation (Client-side)
    ↓
Data stored in Zustand store (temporary)
    ↓
User saves GRN
    ↓
System generates GRN number
    ↓
Data would be posted to server action (future)
    ↓
Currently: Data only in memory (not persisted)
    ↓
UI updates with success message
    ↓
Navigation to detail view
```

### PO-Based GRN Creation Flow

```
User clicks "New GRN" → selects "From PO"
    ↓
Navigation to vendor selection page
    ↓
User selects vendor
    ↓
System filters pending POs for vendor
    ↓
User selects PO lines to receive
    ↓
System pre-populates GRN with PO data
    ↓
Zustand store holds GRN creation state
    ↓
User enters received quantities
    ↓
System calculates discrepancies
    ↓
User completes delivery information
    ↓
User saves → GRN created with RECEIVED status
    ↓
Navigation to detail view for review
```

### Manual GRN Creation Flow

```
User clicks "New GRN" → selects "Manual"
    ↓
System generates temporary ID (new-UUID)
    ↓
Navigation to detail page in confirm mode
    ↓
Zustand store initialized with placeholder data
    ↓
User selects vendor manually
    ↓
User searches and adds items from catalog
    ↓
User enters quantities, prices, locations
    ↓
System calculates totals
    ↓
User saves → GRN created with RECEIVED status
    ↓
Detail view updates with real GRN number
```

---

## State Management

### Global State (Zustand)

**Store**: `useGRNCreationStore`
**Purpose**: Manage temporary state during GRN creation workflow
**State Properties**:
- processType: 'po' or 'manual'
- newlyCreatedGRNData: Temporary GRN object for manual creation
- setProcessType: Method to set workflow type
- setNewlyCreatedGRNData: Method to store temporary GRN
- reset: Method to clear store after workflow completion

**Usage**: Store persists GRN creation state as user navigates between vendor selection, PO selection, and GRN confirmation pages. Cleared after GRN successfully created.

### Local State

Components use React useState for:
- Tab selection in detail view
- Edit mode toggling
- Form field values
- Filter and sort state in data table
- Dialog open/close states
- Loading and error states

---

## Component Interactions

### List Page Interaction Flow

User opens list page → Page component loads mock data → GoodsReceiveNoteList component receives data → grn-shadcn-data-table renders table with filters → User applies filter → Component updates display → User clicks GRN row → Navigation to detail page with GRN ID

### Detail Page Interaction Flow

User opens detail page → Page component checks ID type (new vs existing) → Loads data from mock store or Zustand → GoodsReceiveNoteDetail component renders with mode → User switches tabs → Tab component loads → User edits data → Local state updates → User saves → Zustand store or mock data updates → UI refreshes

### Item Management Interaction Flow

User opens Items tab → GoodsReceiveNoteItems component displays items → User clicks "Add Item" → Item search dialog opens → User selects item → itemDetailForm dialog opens → User fills quantities, location → User saves → Item added to GRN → Subtotal recalculated → Table updates

### Extra Cost Distribution Flow

User opens Extra Costs tab → ExtraCostsTab displays costs → User adds extra cost → User selects distribution method → Component calculates distribution formula → Each item's cost updated with allocation → Financial summary recalculates → User sees updated totals

---

## Data Validation

### Client-Side Validation

Implemented in components using conditional rendering and validation logic:

- **Required Fields**: Component checks for empty values before enabling save
- **Quantity Validation**: Ensures received quantity > 0, rejected + damaged ≤ delivered
- **Date Validation**: Receipt date cannot be future, expiry after manufacturing date
- **Location Validation**: All items must have storage location before commitment
- **Currency Validation**: Exchange rate > 0 for currency conversions
- **File Validation**: Attachment size ≤ 10MB, supported formats only

### Business Rule Validation

Components enforce business rules through conditional logic:

- **Status Transitions**: Edit buttons disabled for COMMITTED/VOID status
- **GRN Numbering**: System generates unique GRN-YYYY-NNN format numbers
- **Discrepancy Detection**: Auto-flags items where delivered ≠ ordered
- **Quality Check**: Prevents commitment if quality check required but not passed
- **Financial Calculations**: Validates journal voucher balance before posting

---

## Security Implementation

### Authentication

Currently using mock authentication with user context:
- User context provides authentication state
- User role determines available actions
- Session management via NextAuth.js framework

### Authorization

Role-based access control implemented:
- **Receiving Clerk**: Can create, edit DRAFT/RECEIVED GRNs
- **Purchasing Staff**: Can create, edit, view all GRNs
- **Warehouse Staff**: Can edit items, assign locations, commit GRNs
- **Procurement Manager**: Can void GRNs, approve high-value commitments
- **Finance Team**: Read-only access to financial data

Components conditionally render action buttons based on user role.

### Data Protection

- **Input Validation**: All user inputs validated before processing
- **XSS Protection**: React automatically escapes rendered content
- **Type Safety**: TypeScript ensures type correctness throughout application

---

## Error Handling

### Client-Side Error Handling

Components implement error handling patterns:

**Try-Catch Pattern**: Future server action calls will be wrapped in try-catch blocks

**User Feedback**: Toast notifications planned for success and error messages

**Error Display**: Inline validation errors on form fields

**Error Types Handled**:
- Validation errors: Display field-specific messages
- Data loading errors: Show error state with retry option
- Navigation errors: Redirect to safe fallback page

### Current Mock Implementation

Since data operations are in-memory with mock data:
- No actual persistence failures
- Validation errors caught before state updates
- Missing data results in empty states or default values

---

## Performance Optimization

### Frontend Optimization

- **Code Splitting**: Each tab component lazy loaded on demand
- **Memoization**: Data table uses useMemo for filtered/sorted results
- **Conditional Rendering**: Tabs render content only when active
- **Virtual Scrolling**: Planned for large item lists
- **Debouncing**: Search inputs debounced to reduce re-renders

### Data Loading

Current mock implementation loads all data immediately:
- Future: Implement pagination for list page
- Future: Load GRN details on-demand per tab
- Future: Implement caching for repeated data access

### Calculation Optimization

- Financial totals calculated only when relevant data changes
- Extra cost distribution recalculated only on method change or cost updates
- Discrepancy detection runs once on item quantity change

---

## Integration Points

### Purchase Orders Module Integration

**Integration Pattern**: Component imports and filters mock purchase order data

**Data Exchange**:
- GRN receives: PO ID, PO number, vendor, items, ordered quantities, prices
- PO receives (future): Received quantities, fulfillment status updates

**Trigger Points**:
- User selects "From PO" creation workflow
- System loads pending POs for selected vendor
- User selects PO lines to receive
- GRN creation links to source PO
- GRN commitment updates PO fulfillment status

### Inventory Management Module Integration

**Integration Pattern**: Future server action will call inventory API

**Data Exchange**:
- Inventory receives: Item IDs, received quantities, storage locations, costs
- Stock movements generated with from/to locations
- Inventory levels updated in target locations

**Trigger Points**:
- GRN status changes to COMMITTED
- System generates stock movement records
- Inventory on-hand quantities updated atomically

### Finance Module Integration

**Integration Pattern**: Future server action will post journal voucher

**Data Exchange**:
- Finance receives: Journal voucher with GL codes, amounts, departments
- Debit entries for inventory and expenses
- Credit entries for accounts payable

**Trigger Points**:
- GRN status changes to COMMITTED
- System calculates financial totals with tax and extra costs
- Journal voucher generated and posted
- Accounts payable updated for vendor payment

---

## Deployment Configuration

### Environment Variables

```
# Database (Future)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Build Configuration

Next.js configuration includes:
- TypeScript strict mode enabled
- App Router with server components as default
- Client components marked with 'use client' directive
- Absolute imports with '@/' prefix

---

## Testing Strategy

### Unit Tests (Planned)

**Location**: `__tests__/unit/`
**Framework**: Vitest
**Coverage Target**: >80%
**Focus**:
- Test validation logic in components
- Test calculation functions (totals, distributions, discrepancies)
- Test state management (Zustand store)
- Test utility functions

### Integration Tests (Planned)

**Location**: `__tests__/integration/`
**Framework**: Vitest with test database
**Focus**:
- Test complete GRN creation workflows
- Test data persistence and retrieval
- Test status transitions and business rules
- Test integration with PO, inventory, finance modules

### E2E Tests (Planned)

**Location**: `e2e/`
**Framework**: Playwright
**Focus**:
- Test PO-based GRN creation end-to-end
- Test manual GRN creation end-to-end
- Test item management, extra costs, commitment
- Test responsive design across devices

---

## Dependencies

### npm Packages

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.0.0 | UI library |
| next | ^14.0.0 | Framework |
| typescript | ^5.8.2 | Type safety |
| zustand | ^4.0.0 | State management |
| tailwindcss | ^3.0.0 | Styling |
| lucide-react | ^0.0.0 | Icons |
| date-fns | ^2.0.0 | Date utilities |
| @radix-ui/* | ^1.0.0 | UI primitives |

### Internal Dependencies

- **Centralized Types**: lib/types/procurement.ts for all GRN type definitions
- **Centralized Mock Data**: lib/mock/mock_goodsReceiveNotes.tsx for test data
- **User Context**: lib/context/user-context.tsx for authentication and authorization
- **UI Components**: components/ui/* for shadcn components
- **Utility Functions**: lib/utils.ts for common utilities

---

## Migration Path

### Current State (Mock Data)

- GRN data stored in mock file: lib/mock/mock_goodsReceiveNotes.tsx
- No persistence - data resets on page refresh
- All operations client-side only
- No actual integration with PO, inventory, or finance modules

### Phase 1: Database Integration

- Replace mock data with Supabase queries
- Implement server actions for CRUD operations
- Add database transactions for data consistency
- Implement proper error handling and logging

### Phase 2: Module Integration

- Implement PO fulfillment updates via API calls
- Implement stock movement generation via inventory API
- Implement journal voucher posting via finance API
- Add webhook or event-based integration patterns

### Phase 3: Feature Enhancements

- Add form validation with Zod schemas
- Implement file upload for attachments via Supabase Storage
- Add real-time updates for collaborative editing
- Implement audit log with full activity tracking
- Add email notifications for approvals and commitments

---

## Monitoring and Logging

### Application Logging (Planned)

Future implementation will log:
- Info level: GRN creation, commitment, void operations
- Warning level: Discrepancies, validation failures, over receipts
- Error level: Integration failures, data inconsistencies
- Debug level: State changes, calculation steps (development only)

**Log Structure**: Timestamp, log level, user ID, GRN ID, operation, message, error details

### Performance Monitoring (Planned)

- Page load times for list and detail pages
- Component render performance
- Data loading and calculation times
- Integration API response times

---

## Technical Debt

| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| Replace mock data with database | High | Large | Required for production deployment |
| Implement server actions | High | Large | Required for data persistence |
| Add form validation with Zod | Medium | Medium | Improve data quality |
| Implement file upload | Medium | Small | Enable attachment functionality |
| Add unit tests | Medium | Large | Improve code reliability |
| Implement E2E tests | Low | Medium | Catch integration issues |

---

## Appendix

### Related Documents
- [Business Requirements](./BR-goods-received-note.md)
- [Use Cases](./UC-goods-received-note.md)
- [Data Definition](./DD-goods-received-note.md)
- [Flow Diagrams](./FD-goods-received-note.md)
- [Validations](./VAL-goods-received-note.md)

### Useful Commands

```bash
# Development
npm run dev

# Type checking
npm run checktypes

# Linting
npm run lint

# Build
npm run build
```

---

**Document End**

> 📝 **Note to Authors**:
> - This document describes implementation patterns, not code
> - All component descriptions based on actual codebase structure
> - Mock data implementation clearly marked as temporary
> - Migration path documented for production readiness
