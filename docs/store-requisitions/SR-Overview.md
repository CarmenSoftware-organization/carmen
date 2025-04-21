# Store Requisition Module - Overview

> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

> **Note**: This is a consolidated document that combines content from:
> - README.md
> - store-requisition-ba.md
> - store-requisition-prd.md

## Table of Contents
1. [Introduction](#introduction)
2. [Module Purpose](#module-purpose)
3. [Business Context](#business-context)
4. [Key Features](#key-features)
5. [Module Architecture](#module-architecture)
6. [User Roles](#user-roles)
7. [Integration Points](#integration-points)
8. [Business Rules](#business-rules)
9. [Module Map](#module-map)
10. [Related Documentation](#related-documentation)

## Introduction
The Store Requisition (SR) module is a core component of the Carmen F&B Management System, enabling users to create, manage, and track internal requests for goods between different stores or departments. This document provides a comprehensive overview of the module, its business context, and its key components.

## Module Purpose
The Store Requisition module serves as the central system for managing internal inventory movements, allowing users to:
- Request goods from other stores or departments
- Manage approval workflows for requisitions
- Track stock movements between locations
- Maintain accurate inventory records
- Allocate costs appropriately between departments

The module streamlines the internal requisition process by providing a structured workflow for requesting, approving, and processing store requisitions, ensuring proper inventory control and efficient resource allocation.

## Business Context

### Business Objectives
- Streamline internal requisition processes between stores and departments
- Maintain accurate tracking of stock movements
- Ensure proper authorization and approval of requisitions
- Facilitate efficient inventory management
- Support both direct cost and inventory type movements
- Provide real-time visibility into stock movements
- Enable accurate cost allocation between departments

### Module Overview
The Store Requisition module manages the following key functions:
- Creation and management of store requisitions
- Approval workflow management
- Stock movement tracking
- Inventory level monitoring
- Request status tracking
- Activity logging and attachments
- Cost allocation between departments

### Key Stakeholders
- Store Managers
- Department Heads
- Inventory Controllers
- Finance Department
- Operations Staff
- System Administrators

## Key Features

1. **Request Management**
   - Creation and submission of store requisitions
   - Tracking of requisition status
   - Management of requisition details and items
   - Support for different movement types (Issue/Transfer)

2. **Approval Workflow**
   - Multi-level approval process
   - Role-based approval assignments
   - Approval history tracking
   - Partial approval capabilities

3. **Inventory Management**
   - Real-time inventory availability checking
   - Reservation of inventory for approved requisitions
   - Tracking of fulfilled quantities
   - Support for lot-controlled items

4. **Transfer Processing**
   - Generation of transfer documents
   - Tracking of item movements between locations
   - Confirmation of received items
   - Support for partial fulfillment

5. **Financial Processing**
   - Cost calculation for transferred items
   - Cost allocation between departments
   - Generation of journal entries
   - Financial reporting

6. **Reporting and Analytics**
   - Requisition status reporting
   - Transfer history tracking
   - Performance metrics and analytics
   - Cost analysis reporting

## Module Architecture

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

### Data Models

#### Requisition
```typescript
interface Requisition {
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
}
```

#### Requisition Item
```typescript
interface RequisitionItem {
  id: number
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
}
```

## User Roles

The Store Requisition module supports the following user roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Requester | Creates and submits store requisitions | Create, edit, view SRs; add items; submit for approval |
| Approver | Reviews and approves/rejects requisitions | View department SRs; approve/reject SRs |
| Fulfiller | Processes approved requisitions | View approved SRs; process items; update quantities |
| Receiver | Confirms receipt of transferred items | View incoming SRs; confirm receipt; report discrepancies |
| Manager | Oversees the entire process | View all SRs; access reports; manage settings |

## Integration Points

The Store Requisition module integrates with several other modules in the system:

1. **Inventory Management**
   - Real-time inventory level checking
   - Stock movement processing
   - Lot tracking and management
   - Inventory valuation updates

2. **Financial Management**
   - Cost allocation between departments
   - Journal entry generation
   - Financial reporting
   - Budget impact tracking

3. **Workflow Engine**
   - Approval routing
   - Status management
   - Notification generation
   - Delegation handling

4. **User Management**
   - Role-based access control
   - Permission management
   - User authentication
   - Activity tracking

5. **Reporting and Analytics**
   - Data extraction for reports
   - KPI tracking
   - Dashboard integration
   - Audit trail maintenance

## Business Rules

### Creation Rules
- Each SR must have a unique reference number
- Valid requesting and receiving locations must be specified
- Movement type must be specified (Issue or Transfer)
- Required quantities must not exceed available stock
- Request date and expected delivery date are mandatory

### Approval Rules
- All requisitions require appropriate approval
- Approvers can modify requested quantities
- Rejections must include a reason
- Status changes must be logged
- Approved quantities cannot exceed requested quantities

### Movement Rules
- Status progression: Draft → In Process → Complete/Reject/Void
- Completed requisitions cannot be modified
- Stock movements must be tracked
- Inventory levels must be updated
- All movements must maintain audit trail

### Financial Rules
- Cost calculations must use the fulfilling location's cost method
- Journal entries must be generated for all movements
- Cost allocations must be accurate between departments
- Financial periods must be respected for postings
- Currency conversions must be handled appropriately

## Module Map

The Store Requisition module consists of the following key components:

1. **List View**
   - Displays all store requisitions
   - Provides filtering and sorting capabilities
   - Shows key information (date, reference, status, etc.)
   - Offers actions for creating, viewing, and managing requisitions

2. **Detail View**
   - Shows comprehensive information about a single requisition
   - Provides tabs for different aspects (items, journal entries, etc.)
   - Offers actions for processing, approving, and managing the requisition
   - Displays status and history information

3. **Creation Form**
   - Allows users to create new requisitions
   - Provides item selection and quantity specification
   - Validates against business rules
   - Calculates totals and displays inventory information

4. **Approval Interface**
   - Enables approvers to review and approve/reject requisitions
   - Shows relevant information for decision-making
   - Allows modification of quantities
   - Provides commenting capabilities

5. **Fulfillment Interface**
   - Facilitates processing of approved requisitions
   - Tracks actual quantities issued
   - Generates stock movements
   - Updates inventory levels

## Related Documentation

- [Store Requisition Technical Specification](./SR-Technical-Specification.md)
- [Store Requisition User Experience](./SR-User-Experience.md)
- [Store Requisition Component Specifications](./SR-Component-Specifications.md)
- [Store Requisition API Specifications](./SR-API-Specifications.md)
- [Store Requisition Module Structure](./SR-Module-Structure.md)
- [Procurement Process Flow](../Procurement-Process-Flow.md) 