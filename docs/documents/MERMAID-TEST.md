# Mermaid Diagram Test Page

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This page demonstrates the various types of Mermaid diagrams supported in the Carmen ERP documentation system.

## Flowchart Example

```mermaid
graph TD
    A[Purchase Request Created] --> B{Budget Check}
    B -->|Approved| C[Convert to PO]
    B -->|Rejected| D[Return to Requester]
    C --> E[Send to Vendor]
    E --> F[Receive Goods]
    F --> G[Process GRN]
    G --> H[Update Inventory]
```

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Submit Purchase Request
    Frontend->>API: POST /api/purchase-requests
    API->>Database: Insert PR Record
    Database-->>API: PR Created
    API-->>Frontend: Success Response
    Frontend-->>User: Display Confirmation

    Note over User,Database: Workflow Approval Process

    User->>Frontend: Check PR Status
    Frontend->>API: GET /api/purchase-requests/:id
    API->>Database: Query PR
    Database-->>API: PR Data
    API-->>Frontend: PR Details
    Frontend-->>User: Display Status
```

## Entity Relationship Diagram

```mermaid
erDiagram
    PURCHASE_REQUEST ||--o{ PR_ITEM : contains
    PURCHASE_REQUEST ||--|| WORKFLOW : "goes through"
    PURCHASE_REQUEST }o--|| USER : "created by"
    PURCHASE_REQUEST }o--|| VENDOR : "for vendor"

    PR_ITEM }o--|| PRODUCT : references
    PR_ITEM }o--|| LOCATION : "for location"

    VENDOR ||--o{ PRICELIST : has
    PRICELIST ||--o{ PRICELIST_ITEM : contains
    PRICELIST_ITEM }o--|| PRODUCT : "prices product"

    PURCHASE_REQUEST {
        string id PK
        string requestNumber
        string status
        date requestDate
        decimal totalAmount
        string createdBy FK
        string vendorId FK
    }

    PR_ITEM {
        string id PK
        string prId FK
        string productId FK
        decimal quantity
        decimal unitPrice
        decimal totalPrice
    }
```

## Gantt Chart Example

```mermaid
gantt
    title Purchase Request to Delivery Timeline
    dateFormat YYYY-MM-DD
    section Request Phase
    Create PR           :a1, 2024-01-01, 1d
    Approval Process    :a2, after a1, 3d

    section Procurement
    Create PO           :b1, after a2, 1d
    Vendor Acceptance   :b2, after b1, 2d

    section Fulfillment
    Order Processing    :c1, after b2, 5d
    Shipping            :c2, after c1, 3d

    section Receipt
    Receive Goods       :d1, after c2, 1d
    Quality Check       :d2, after d1, 1d
    Update Inventory    :d3, after d2, 1d
```

## State Diagram Example

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Pending_Approval: Submit
    Pending_Approval --> Approved: Approve
    Pending_Approval --> Rejected: Reject
    Pending_Approval --> Draft: Return for Revision

    Rejected --> [*]

    Approved --> In_Progress: Create PO
    In_Progress --> Partially_Received: Receive Some Items
    In_Progress --> Completed: Receive All Items
    Partially_Received --> Completed: Receive Remaining

    Completed --> Closed: Final Review
    Closed --> [*]
```

## Class Diagram Example

```mermaid
classDiagram
    class PurchaseRequest {
        +String id
        +String requestNumber
        +Date requestDate
        +String status
        +Decimal totalAmount
        +submitForApproval()
        +approve()
        +reject()
        +convertToPO()
    }

    class PRItem {
        +String id
        +String productId
        +Decimal quantity
        +Decimal unitPrice
        +calculateTotal()
    }

    class Workflow {
        +String id
        +String status
        +Array approvers
        +moveToNextStage()
        +sendNotification()
    }

    class Vendor {
        +String id
        +String name
        +String email
        +Array pricelists
        +getActivePrice()
    }

    PurchaseRequest "1" --> "*" PRItem : contains
    PurchaseRequest "1" --> "1" Workflow : has
    PurchaseRequest "*" --> "1" Vendor : for
```

## Pie Chart Example

```mermaid
pie title Purchase Requests by Status
    "Pending Approval" : 35
    "Approved" : 25
    "In Progress" : 20
    "Completed" : 15
    "Rejected" : 5
```

## User Journey Example

```mermaid
journey
    title Purchase Request User Journey
    section Create Request
      Open PR Form: 5: User
      Add Items: 4: User
      Select Vendor: 4: User
      Submit Request: 5: User
    section Approval
      Review Request: 3: Manager
      Check Budget: 2: Manager
      Approve Request: 5: Manager
    section Processing
      Convert to PO: 5: Purchasing
      Send to Vendor: 5: Purchasing
    section Delivery
      Receive Goods: 4: Warehouse
      Quality Check: 4: Warehouse
      Update Inventory: 5: System
