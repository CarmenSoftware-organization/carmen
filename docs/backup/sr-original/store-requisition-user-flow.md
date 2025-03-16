# Store Requisition Module - User Flow Diagrams

> **IMPORTANT**: This content has been migrated to [SR-User-Experience.md](./SR-User-Experience.md). Please refer to that document for the most up-to-date information.

This document provides visual representations of the user flows within the Store Requisition module of the Carmen F&B Management System.

## 1. Main Store Requisition Process Flow

```mermaid
flowchart TD
    Start([Start]) --> List[View Store Requisition List]
    List --> Create[Create New Store Requisition]
    Create --> SelectMovementType[Select Movement Type\nIssue or Transfer]
    SelectMovementType --> SelectLocations[Select Source and\nDestination Locations]
    SelectLocations --> AddItems[Add Items to Requisition]
    AddItems --> ViewInventory[View Inventory Levels]
    ViewInventory --> AdjustQuantities[Adjust Requested Quantities]
    AdjustQuantities --> SaveDraft[Save as Draft]
    AdjustQuantities --> Submit[Submit for Approval]
    SaveDraft --> EditLater[Edit Later]
    EditLater --> Submit
    Submit --> ApprovalProcess[Approval Process]
    ApprovalProcess --> Approved{Approved?}
    Approved -->|Yes| Processing[Processing]
    Approved -->|No| Rejected[Rejected]
    Rejected --> Notify[Notify Requester]
    Notify --> Revise[Revise and Resubmit]
    Revise --> Submit
    Processing --> StockMovement[Generate Stock Movement]
    StockMovement --> UpdateInventory[Update Inventory Levels]
    UpdateInventory --> GenerateJournal[Generate Journal Entries]
    GenerateJournal --> Complete[Mark as Complete]
    Complete --> End([End])
```

## 2. Approval Workflow

```mermaid
flowchart TD
    Start([Start]) --> ReceiveReq[Receive Requisition for Approval]
    ReceiveReq --> Review[Review Requisition Details]
    Review --> CheckItems[Check Item Details]
    CheckItems --> CheckInventory[Check Inventory Availability]
    CheckInventory --> Decision{Decision}
    Decision -->|Approve All| ApproveAll[Approve All Items]
    Decision -->|Partial Approval| ModifyQty[Modify Quantities]
    Decision -->|Reject| AddReason[Add Rejection Reason]
    ModifyQty --> PartialApprove[Approve Modified Requisition]
    AddReason --> Reject[Reject Requisition]
    ApproveAll --> NotifyApproved[Notify Requester of Approval]
    PartialApprove --> NotifyPartial[Notify Requester of Partial Approval]
    Reject --> NotifyRejected[Notify Requester of Rejection]
    NotifyApproved --> ProcessingQueue[Add to Processing Queue]
    NotifyPartial --> ProcessingQueue
    NotifyRejected --> End([End])
    ProcessingQueue --> End
```

## 3. Stock Movement Processing

```mermaid
flowchart TD
    Start([Start]) --> GetApproved[Get Approved Requisition]
    GetApproved --> ValidateStock[Validate Stock Availability]
    ValidateStock --> Available{Stock Available?}
    Available -->|Yes| CreateMovement[Create Stock Movement Record]
    Available -->|No| HandleShortage[Handle Stock Shortage]
    HandleShortage --> PartialFulfill[Partial Fulfillment]
    HandleShortage --> Backorder[Create Backorder]
    PartialFulfill --> CreateMovement
    Backorder --> NotifyShortage[Notify Requester of Shortage]
    CreateMovement --> UpdateSource[Update Source Location Inventory]
    UpdateSource --> UpdateDest[Update Destination Location Inventory]
    UpdateDest --> RecordBefore[Record Before Quantities]
    RecordBefore --> RecordAfter[Record After Quantities]
    RecordAfter --> GenerateDoc[Generate Movement Document]
    GenerateDoc --> End([End])
```

## 4. Financial Processing

```mermaid
flowchart TD
    Start([Start]) --> GetMovement[Get Stock Movement Data]
    GetMovement --> DetermineAccounts[Determine Account Codes]
    DetermineAccounts --> MovementType{Movement Type}
    MovementType -->|Issue| DirectCost[Direct Cost Journal Entry]
    MovementType -->|Transfer| InventoryTransfer[Inventory Transfer Journal Entry]
    DirectCost --> DebitCost[Debit Cost Account]
    DebitCost --> CreditInventory[Credit Inventory Account]
    InventoryTransfer --> DebitDestInventory[Debit Destination Inventory]
    DebitDestInventory --> CreditSourceInventory[Credit Source Inventory]
    CreditInventory --> ValidateBalance[Validate Journal Balance]
    CreditSourceInventory --> ValidateBalance
    ValidateBalance --> Balanced{Balanced?}
    Balanced -->|Yes| PostJournal[Post Journal Entry]
    Balanced -->|No| FixImbalance[Fix Imbalance]
    FixImbalance --> ValidateBalance
    PostJournal --> UpdateFinancials[Update Financial Records]
    UpdateFinancials --> End([End])
```

## 5. User Role Interactions

```mermaid
flowchart TD
    subgraph Store Manager
        CreateReq[Create Requisition]
        TrackStatus[Track Status]
        ViewHistory[View History]
        GenerateReports[Generate Reports]
    end
    
    subgraph Approver
        ReviewReq[Review Requisition]
        ModifyQty[Modify Quantities]
        ApproveReject[Approve/Reject]
    end
    
    subgraph Inventory Controller
        ProcessReq[Process Requisition]
        ManageMovement[Manage Stock Movement]
        UpdateStock[Update Stock Levels]
    end
    
    subgraph Finance Manager
        ReviewJournal[Review Journal Entries]
        ValidateEntries[Validate Entries]
        GenerateReports2[Generate Financial Reports]
    end
    
    CreateReq --> ReviewReq
    ReviewReq --> ApproveReject
    ApproveReject --> ProcessReq
    ProcessReq --> ManageMovement
    ManageMovement --> UpdateStock
    ManageMovement --> ReviewJournal
    ReviewJournal --> ValidateEntries
    TrackStatus --> ViewHistory
    UpdateStock --> TrackStatus
    ValidateEntries --> GenerateReports2
    GenerateReports2 --> GenerateReports
```

## 6. Complete Store Requisition Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted: Submit
    Submitted --> UnderReview: Start Review
    UnderReview --> Approved: Approve
    UnderReview --> PartiallyApproved: Partial Approve
    UnderReview --> Rejected: Reject
    Rejected --> Draft: Revise
    Approved --> InProcess: Start Processing
    PartiallyApproved --> InProcess: Start Processing
    InProcess --> PartiallyFulfilled: Partial Fulfill
    InProcess --> Fulfilled: Complete Fulfill
    PartiallyFulfilled --> Fulfilled: Complete Remaining
    Fulfilled --> Completed: Generate Financials
    Completed --> [*]
    
    Draft --> Voided: Void
    Submitted --> Voided: Void
    Voided --> [*]
```

These diagrams illustrate the key user flows and processes within the Store Requisition module, from initial creation through approval, fulfillment, and financial processing. They provide a visual representation of how different users interact with the system and how data flows through the various stages of the requisition lifecycle. 