# Store Requisition Module - Technical Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

> **Note**: This is a consolidated document that combines content from:
> - store-requisition-logic.md
> - store-requisition-prd.md
> - store-requisitions.md

## Table of Contents
1. [Introduction](#introduction)
2. [Module Requirements](#module-requirements)
3. [Data Models](#data-models)
4. [Core Interfaces](#core-interfaces)
5. [Database Schema](#database-schema)
6. [Implementation Details](#implementation-details)
7. [Module Elements](#module-elements)
8. [Validation Rules](#validation-rules)
9. [Technical Dependencies](#technical-dependencies)
10. [Performance Considerations](#performance-considerations)
11. [Security Considerations](#security-considerations)
12. [Related Documentation](#related-documentation)

## Introduction
This document provides comprehensive technical specifications for the Store Requisition (SR) module within the Carmen F&B Management System. It covers data models, interfaces, implementation details, and technical requirements necessary for development and maintenance.

The Store Requisition (SR) Module is a comprehensive system designed to streamline and manage the entire store requisition process, from creation to approval, fulfillment, and tracking. It provides a centralized platform for managing internal inventory movements between stores or departments.

### Business Objectives
- Streamline internal requisition processes
- Maintain accurate inventory records
- Ensure proper authorization and approval
- Facilitate efficient stock movements
- Support cost allocation between departments
- Provide real-time visibility into stock movements

### Success Metrics
- Average processing time per requisition
- Inventory accuracy rate
- User adoption rate
- Error reduction rate
- Compliance rate

## Module Requirements
### Functional Requirements

#### SR Creation [SR_CRT]
| ID | Requirement | Priority |
|----|-------------|----------|
| SR_CRT_001 | System shall allow users to create new store requisitions | High |
| SR_CRT_002 | System shall generate unique reference numbers for each requisition | High |
| SR_CRT_003 | System shall allow selection of source and destination locations | High |
| SR_CRT_004 | System shall support different movement types (Issue/Transfer) | High |
| SR_CRT_005 | System shall allow adding multiple items to a requisition | High |
| SR_CRT_006 | System shall validate item availability at source location | High |
| SR_CRT_007 | System shall calculate total quantities and costs | Medium |
| SR_CRT_008 | System shall support saving requisitions as drafts | Medium |
| SR_CRT_009 | System shall allow attaching supporting documents | Low |
| SR_CRT_010 | System shall support comments and notes | Low |

#### SR Approval [SR_APR]
| ID | Requirement | Priority |
|----|-------------|----------|
| SR_APR_001 | System shall route requisitions for appropriate approval | High |
| SR_APR_002 | System shall allow approvers to modify requested quantities | High |
| SR_APR_003 | System shall require reasons for rejections | Medium |
| SR_APR_004 | System shall support partial approvals at line item level | Medium |
| SR_APR_005 | System shall track approval history | Medium |
| SR_APR_006 | System shall notify requesters of approval status changes | Medium |
| SR_APR_007 | System shall support approval delegation | Low |
| SR_APR_008 | System shall enforce approval thresholds based on value | Low |

#### SR Fulfillment [SR_FUL]
| ID | Requirement | Priority |
|----|-------------|----------|
| SR_FUL_001 | System shall allow processing of approved requisitions | High |
| SR_FUL_002 | System shall track actual quantities issued | High |
| SR_FUL_003 | System shall update inventory levels in real-time | High |
| SR_FUL_004 | System shall generate stock movement records | High |
| SR_FUL_005 | System shall support lot tracking for applicable items | Medium |
| SR_FUL_006 | System shall support partial fulfillment | Medium |
| SR_FUL_007 | System shall calculate before and after quantities | Medium |
| SR_FUL_008 | System shall generate appropriate journal entries | Medium |

#### SR Reporting [SR_RPT]
| ID | Requirement | Priority |
|----|-------------|----------|
| SR_RPT_001 | System shall provide requisition status reports | Medium |
| SR_RPT_002 | System shall track movement history | Medium |
| SR_RPT_003 | System shall provide cost allocation reports | Medium |
| SR_RPT_004 | System shall support export of report data | Low |
| SR_RPT_005 | System shall provide performance metrics | Low |

### Non-Functional Requirements

#### Performance [SR_PRF]
| ID | Requirement | Priority |
|----|-------------|----------|
| SR_PRF_001 | System shall load requisition lists within 2 seconds | High |
| SR_PRF_002 | System shall load requisition details within 3 seconds | High |
| SR_PRF_003 | System shall process approvals within 1 second | Medium |
| SR_PRF_004 | System shall support at least 100 concurrent users | Medium |
| SR_PRF_005 | System shall handle at least 1000 requisitions per day | Medium |

#### Security [SR_SEC]
| ID | Requirement | Priority |
|----|-------------|----------|
| SR_SEC_001 | System shall enforce role-based access control | High |
| SR_SEC_002 | System shall maintain audit trails for all actions | High |
| SR_SEC_003 | System shall encrypt sensitive data | Medium |
| SR_SEC_004 | System shall timeout inactive sessions after 30 minutes | Medium |
| SR_SEC_005 | System shall validate all input data | High |

#### Usability [SR_USA]
| ID | Requirement | Priority |
|----|-------------|----------|
| SR_USA_001 | System shall provide intuitive navigation | High |
| SR_USA_002 | System shall display clear error messages | High |
| SR_USA_003 | System shall support keyboard shortcuts | Medium |
| SR_USA_004 | System shall be responsive on different devices | Medium |
| SR_USA_005 | System shall provide contextual help | Low |

## Data Models

### Core Data Models

#### Requisition
```typescript
interface Requisition {
  id: string
  date: string
  refNo: string
  requestTo: string
  storeName: string
  description: string
  status: 'In Process' | 'Complete' | 'Reject' | 'Void' | 'Draft'
  totalAmount: number
  items: RequisitionItem[]
  movement: {
    source: string
    sourceName: string
    destination: string
    destinationName: string
    type: string
  }
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
}
```

#### RequisitionItem
```typescript
interface RequisitionItem {
  id: number
  requisitionId: string
  productId: string
  description: string
  unit: string
  qtyRequired: number
  qtyApproved: number
  costPerUnit: number
  total: number
  requestDate: string
  inventory: {
    onHand: number
    onOrder: number
    lastPrice: number
    lastVendor: string
  }
  itemInfo: {
    location: string
    locationCode: string
    itemName: string
    category: string
    subCategory: string
    itemGroup: string
    barCode: string
    locationType: 'direct' | 'inventory'
  }
  qtyIssued: number
  approvalStatus: 'Accept' | 'Reject' | 'Review'
  createdAt: string
  updatedAt: string
}
```

#### StockMovement
```typescript
interface StockMovement {
  id: number
  movementType: string
  sourceDocument: string
  commitDate: string
  postingDate: string
  status: string
  movement: {
    source: string
    sourceName: string
    destination: string
    destinationName: string
    type: string
  }
  items: StockMovementItem[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
    lotCount: number
  }
  createdAt: string
  updatedAt: string
  timezone: string
}
```

#### StockMovementItem
```typescript
interface StockMovementItem {
  id: number
  movementId: number
  productId: string
  productName: string
  sku: string
  uom: string
  beforeQty: number
  inQty: number
  outQty: number
  afterQty: number
  unitCost: number
  totalCost: number
  location: {
    type: 'INV' | 'DIR'
    code: string
    name: string
    displayType: string
  }
  lots: LotInfo[]
}
```

#### LotInfo
```typescript
interface LotInfo {
  lotNo: string
  quantity: number
  uom: string
  createdAt: string
}
```

#### JournalEntry
```typescript
interface JournalEntry {
  id: string
  documentType: string
  documentNumber: string
  postingDate: string
  description: string
  entries: {
    accountCode: string
    accountName: string
    debit: number
    credit: number
    costCenter: string
    department: string
  }[]
  totalDebit: number
  totalCredit: number
  status: string
  createdAt: string
  createdBy: string
}
```

## Core Interfaces

### List View Interface
The Store Requisition List View displays all requisitions with filtering and sorting capabilities.

#### Key Components
- **Header**: Title, action buttons (New Request, Print)
- **Filters**: View dropdown, search field, status filters
- **Grid**: Date, Ref #, Request To, Store Name, Description, Status, Process Status
- **Footer**: Pagination, location filter

#### Actions
- Create new requisition
- View requisition details
- Print requisition list
- Filter and search requisitions

### Detail View Interface
The Store Requisition Detail View shows comprehensive information about a single requisition.

#### Key Components
- **Header**: Ref #, status, action buttons
- **Information Panel**: Date, locations, description, totals
- **Item Grid**: Item details, quantities, costs
- **Tabs**: Journal Entries, Comments, Attachments
- **Action Panel**: Process, approve, reject, void buttons

#### Actions
- Edit requisition (if in Draft status)
- Process requisition (if approved)
- Approve/reject requisition (if pending approval)
- Void requisition
- Print requisition details
- Add comments and attachments

## Database Schema

### Requisition Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the requisition |
| ref_no | VARCHAR(20) | UNIQUE, NOT NULL | Reference number for the requisition |
| date | TIMESTAMP WITH TIME ZONE | NOT NULL | Date of the requisition |
| source_location | VARCHAR(20) | NOT NULL | Source location code |
| source_name | VARCHAR(100) | NOT NULL | Source location name |
| destination_location | VARCHAR(20) | NOT NULL | Destination location code |
| destination_name | VARCHAR(100) | NOT NULL | Destination location name |
| movement_type | VARCHAR(20) | NOT NULL | Type of movement (Issue/Transfer) |
| description | TEXT | NOT NULL | Description of the requisition |
| status | VARCHAR(20) | NOT NULL | Status of the requisition |
| total_amount | DECIMAL(12,2) | NOT NULL | Total amount of the requisition |
| created_by | UUID | NOT NULL | User who created the requisition |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Creation timestamp |
| updated_by | UUID | | User who last updated the requisition |
| updated_at | TIMESTAMP WITH TIME ZONE | | Last update timestamp |

### RequisitionItem Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the item |
| requisition_id | UUID | FOREIGN KEY, NOT NULL | Reference to the Requisition table |
| product_id | UUID | FOREIGN KEY, NOT NULL | Reference to the Product table |
| description | TEXT | NOT NULL | Description of the item |
| unit | VARCHAR(20) | NOT NULL | Unit of measurement |
| qty_required | DECIMAL(12,3) | NOT NULL | Quantity requested |
| qty_approved | DECIMAL(12,3) | | Quantity approved |
| cost_per_unit | DECIMAL(12,2) | NOT NULL | Cost per unit |
| total | DECIMAL(12,2) | NOT NULL | Total cost for the item |
| approval_status | VARCHAR(20) | | Approval status for the item |
| qty_issued | DECIMAL(12,3) | | Quantity actually issued |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | | Last update timestamp |

### StockMovement Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the movement |
| movement_type | VARCHAR(20) | NOT NULL | Type of movement |
| source_document | VARCHAR(20) | NOT NULL | Reference to source document |
| commit_date | TIMESTAMP WITH TIME ZONE | NOT NULL | Date of commitment |
| posting_date | TIMESTAMP WITH TIME ZONE | NOT NULL | Date of posting |
| status | VARCHAR(20) | NOT NULL | Status of the movement |
| source_location | VARCHAR(20) | NOT NULL | Source location code |
| destination_location | VARCHAR(20) | NOT NULL | Destination location code |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | | Last update timestamp |

## Implementation Details
### Technology Stack
- Frontend: React, Next.js, TypeScript
- State Management: React Context API, React Query
- UI Components: Shadcn UI, Tailwind CSS
- API: RESTful API with Express.js
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js

### Directory Structure
```
app/(main)/store-operations/store-requisitions/
├── page.tsx                    # Main SR list page
├── [id]/                       # SR detail page directory
│   └── page.tsx                # SR detail page
└── components/                 # Shared components
    ├── store-requisition-detail.tsx  # Detail component
    ├── stock-movement-sr.tsx   # Stock movement component
    ├── approval-log-dialog.tsx # Approval log dialog
    ├── filter-builder.tsx      # Filter builder component
    ├── header-actions.tsx      # Header actions component
    ├── header-info.tsx         # Header info component
    ├── list-filters.tsx        # List filters component
    ├── list-header.tsx         # List header component
    └── tabs/                   # Tab components
        └── journal-entries-tab.tsx  # Journal entries tab
```

### Component Architecture
The SR module follows a component-based architecture with the following key patterns:

1. **Page Components**: Top-level components that handle routing and data fetching
2. **Container Components**: Manage state and business logic
3. **Presentation Components**: Render UI based on props
4. **Utility Components**: Reusable components for common UI patterns

#### Example: Page Component Structure

```tsx
// app/(main)/store-operations/store-requisitions/page.tsx
import { Suspense } from "react"
import { StoreRequisitionList } from "./components/store-requisition-list"
import { StoreRequisitionListSkeleton } from "./components/store-requisition-list-skeleton"
import { ListHeader } from "./components/list-header"

export default function StoreRequisitionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ListHeader />
      <Suspense fallback={<StoreRequisitionListSkeleton />}>
        <StoreRequisitionList />
      </Suspense>
    </div>
  )
}
```

## Module Elements

### Core Components

#### StoreRequisitionDetail
The main component for displaying and managing a store requisition.

```typescript
interface StoreRequisitionDetailProps {
  id: string
  mode: 'view' | 'edit' | 'create'
  onSave?: (data: Requisition) => Promise<void>
  onCancel?: () => void
}
```

#### StockMovementSR
Component for displaying and managing stock movements related to a store requisition.

```typescript
interface StockMovementSRProps {
  requisitionId: string
  readOnly?: boolean
}
```

#### JournalEntriesTab
Component for displaying journal entries related to a store requisition.

```typescript
interface JournalEntriesTabProps {
  requisitionId: string
}
```

### Supporting Components

#### FilterBuilder
Component for building advanced filters for the store requisition list.

```typescript
interface FilterBuilderProps {
  onFilterChange: (filters: Filter[]) => void
  initialFilters?: Filter[]
}
```

#### HeaderActions
Component for displaying action buttons in the header of the detail view.

```typescript
interface HeaderActionsProps {
  requisition: Requisition
  onEdit: () => void
  onVoid: () => void
  onPrint: () => void
  onBack: () => void
}
```

## Validation Rules

### Field Validation
- **Reference Number**: Must be unique and follow the format 'SR-YYYY-NNN'
- **Date**: Must be a valid date in ISO 8601 format with timezone
- **Locations**: Must be valid location codes in the system
- **Movement Type**: Must be one of the predefined types (Issue/Transfer)
- **Description**: Required, maximum 500 characters
- **Quantities**: Must be positive numbers with up to 3 decimal places
- **Costs**: Must be non-negative numbers with up to 2 decimal places

### Business Rule Validation
- **Location Compatibility**: Source and destination locations must be compatible based on movement type
- **Stock Availability**: Requested quantities must not exceed available stock
- **Status Transitions**: Status changes must follow the defined workflow
- **Approval Rules**: Approvals must follow the defined approval matrix
- **Financial Rules**: Journal entries must balance (debits = credits)

## Technical Dependencies

### External Dependencies
- **Inventory Module**: For stock level checking and updates
- **Product Module**: For product information and pricing
- **Location Module**: For location information and validation
- **User Module**: For user authentication and authorization
- **Workflow Module**: For approval routing and status management
- **Financial Module**: For journal entry generation and posting

### Internal Dependencies
- **API Services**: For data fetching and mutation
- **State Management**: For managing application state
- **UI Components**: For rendering the user interface
- **Validation Services**: For data validation
- **Utility Functions**: For common operations

## Performance Considerations

### Optimization Strategies
- **Data Fetching**: Use React Query for efficient data fetching and caching
- **Pagination**: Implement server-side pagination for large datasets
- **Lazy Loading**: Load components and data only when needed
- **Memoization**: Use React.memo and useMemo for expensive computations
- **Virtualization**: Use virtualized lists for large datasets
- **Indexing**: Ensure proper database indexing for frequently queried fields

### Performance Metrics
- **Page Load Time**: Target < 2 seconds for list view, < 3 seconds for detail view
- **API Response Time**: Target < 500ms for most operations
- **Rendering Performance**: Target < 16ms for frame rendering
- **Memory Usage**: Monitor and optimize memory usage
- **Network Requests**: Minimize number and size of network requests

## Security Considerations

### Authentication and Authorization
- **User Authentication**: Implement secure authentication using NextAuth.js
- **Role-Based Access Control**: Enforce access control based on user roles
- **Permission Checking**: Validate permissions for all operations
- **API Security**: Implement proper API security measures

### Data Security
- **Input Validation**: Validate all user inputs to prevent injection attacks
- **Output Encoding**: Encode all outputs to prevent XSS attacks
- **CSRF Protection**: Implement CSRF protection for all forms
- **Sensitive Data**: Encrypt sensitive data in transit and at rest
- **Audit Logging**: Maintain comprehensive audit logs for all operations

## Related Documentation
- [Store Requisition Overview](./SR-Overview.md)
- [Store Requisition User Experience](./SR-User-Experience.md)
- [Store Requisition Component Specifications](./SR-Component-Specifications.md)
- [Store Requisition API Specifications](./SR-API-Specifications.md)
- [Store Requisition Module Structure](./SR-Module-Structure.md) 