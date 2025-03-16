# Credit Note Module - Component Structure

This document outlines the component structure for the Credit Note Module, showing the relationships between different components and their responsibilities.

## Component Hierarchy

```
CreditNoteModule
├── CreditNoteManagement (List View)
│   ├── Header
│   │   ├── Title
│   │   └── ActionButtons (New, Export, Print)
│   ├── FilterSection
│   │   ├── SearchInput
│   │   ├── StatusFilter
│   │   └── AdvancedFilter
│   ├── CreditNoteList
│   │   ├── CreditNoteListItem
│   │   │   ├── StatusBadge
│   │   │   ├── BasicInfo
│   │   │   └── ActionButtons (View, Edit, Delete)
│   │   └── Pagination
│   └── BulkActions
│
├── CreditNoteDetail (Detail View)
│   ├── Header
│   │   ├── BackButton
│   │   ├── Title
│   │   ├── StatusBadge
│   │   └── ActionButtons (Edit, Delete, Print)
│   ├── CreditNoteInfo
│   │   ├── CreditNoteHeader
│   │   └── CreditNoteSummary
│   ├── TabsContainer
│   │   ├── ItemsTab
│   │   │   ├── ItemsTable
│   │   │   └── ItemsSummary
│   │   ├── InventoryTab
│   │   │   ├── InventoryAdjustments
│   │   │   └── LotTracking
│   │   ├── JournalEntriesTab
│   │   │   └── JournalEntriesTable
│   │   ├── TaxEntriesTab
│   │   │   └── TaxEntriesTable
│   │   ├── StockMovementTab
│   │   │   └── StockMovementTable
│   │   ├── CommentsAttachmentsTab
│   │   │   ├── CommentsList
│   │   │   ├── CommentForm
│   │   │   ├── AttachmentsList
│   │   │   └── AttachmentUpload
│   │   └── ActivityLogTab
│   │       └── ActivityLogList
│   └── RightPanel (Optional)
│       ├── SummaryInfo
│       └── RelatedDocuments
│
├── CreditNoteCreation (Wizard)
│   ├── VendorSelection
│   │   ├── VendorSearch
│   │   └── VendorInfo
│   ├── GRNSelection
│   │   ├── GRNFilter
│   │   └── GRNList
│   ├── ItemAndLotSelection
│   │   ├── ItemList
│   │   └── LotSelection
│   ├── ItemDetailsEdit
│   │   ├── ItemForm
│   │   └── CostCalculation
│   └── CnLotApplication
│       ├── LotTable
│       └── LotAllocation
│
└── Shared Components
    ├── StatusBadge
    ├── CurrencyDisplay
    ├── DateDisplay
    ├── QuantityInput
    ├── ReasonSelect
    ├── CommentComponent
    └── AttachmentComponent
```

## Component Responsibilities

### CreditNoteManagement
- Displays a list of all credit notes
- Provides filtering and search functionality
- Enables bulk actions on selected credit notes
- Entry point for creating new credit notes

### CreditNoteDetail
- Displays detailed information about a specific credit note
- Provides tabs for different aspects of the credit note
- Enables actions like editing, deleting, etc.

### CreditNoteCreation
- Guides users through the process of creating a new credit note
- Handles vendor selection, GRN selection, item selection, etc.
- Validates input at each step
- Calculates financial impact

### Shared Components
- Reusable components used across the module
- Ensures consistent UI/UX
- Simplifies maintenance and updates

## Data Flow

1. **List View to Detail View**:
   - User selects a credit note from the list
   - System loads detailed information for the selected credit note
   - Detail view displays comprehensive information

2. **List View to Creation Flow**:
   - User clicks "New Credit Note"
   - System starts the creation wizard
   - User progresses through steps to create a new credit note

3. **Creation Flow to Detail View**:
   - User completes the creation process
   - System saves the new credit note
   - System redirects to the detail view of the new credit note

4. **Detail View Actions**:
   - User can edit, delete, etc. the credit note
   - System updates the credit note status and data
   - Detail view reflects the changes

## State Management

The Credit Note Module uses the following state management approach:

1. **List View State**:
   - Filter criteria
   - Search terms
   - Selected credit notes
   - Pagination state

2. **Detail View State**:
   - Current tab
   - Edit mode
   - Right panel visibility
   - Form validation state

3. **Creation Wizard State**:
   - Current step
   - Selected vendor
   - Selected GRN
   - Selected items and lots
   - Form data for each step

## Responsive Design Considerations

The component structure supports responsive design with the following considerations:

1. **Mobile View**:
   - Simplified list view with essential information
   - Collapsible sections in detail view
   - Step-by-step wizard with clear navigation

2. **Tablet View**:
   - Optimized layout for medium screens
   - Responsive tables with horizontal scrolling
   - Adjusted form layouts

3. **Desktop View**:
   - Full-featured interface with all components visible
   - Multi-column layouts
   - Advanced filtering and bulk actions 