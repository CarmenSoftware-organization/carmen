# Purchase Order Module - State Diagram

This document illustrates the state transitions for Purchase Orders in the Carmen F&B Management System.

## Purchase Order State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft: Create PO
    
    Draft --> Sent: Send to Vendor
    Draft --> Deleted: Delete
    
    Sent --> Partial: Receive Some Items
    Sent --> FullyReceived: Receive All Items
    Sent --> Voided: Void
    
    Partial --> FullyReceived: Receive Remaining Items
    Partial --> Closed: Close with Partial Receipt
    Partial --> Voided: Void
    
    FullyReceived --> Closed: Close PO
    FullyReceived --> Voided: Void
    
    Voided --> [*]
    Closed --> [*]
    Deleted --> [*]
    
    classDef draftState fill:#e6f7ff,stroke:#1890ff;
    classDef activeState fill:#f6ffed,stroke:#52c41a;
    classDef terminalState fill:#fff2e8,stroke:#fa8c16;
    
    class Draft draftState;
    class Sent,Partial,FullyReceived activeState;
    class Voided,Closed,Deleted terminalState;
```

> **Important Business Rule**: Purchase Orders in draft mode can be deleted. Once a Purchase Order has been sent to a vendor (active state), it can only be voided or closed, not deleted. This ensures data integrity and maintains a proper audit trail.

## Purchase Order Item State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending: Add Item to PO
    
    Pending --> Ordered: PO Sent
    Pending --> Cancelled: Item Removed or PO Deleted
    
    Ordered --> PartiallyReceived: Partial Receipt
    Ordered --> FullyReceived: Full Receipt
    Ordered --> Voided: PO Voided
    
    PartiallyReceived --> FullyReceived: Receive Remaining
    PartiallyReceived --> Closed: Close with Partial Receipt
    PartiallyReceived --> Voided: PO Voided
    
    FullyReceived --> Closed: Close Item
    FullyReceived --> Voided: PO Voided
    
    Voided --> [*]
    Cancelled --> [*]
    Closed --> [*]
    
    classDef pendingState fill:#e6f7ff,stroke:#1890ff;
    classDef activeState fill:#f6ffed,stroke:#52c41a;
    classDef terminalState fill:#fff2e8,stroke:#fa8c16;
    
    class Pending pendingState;
    class Ordered,PartiallyReceived,FullyReceived activeState;
    class Voided,Closed,Cancelled terminalState;
```

## Purchase Order Financial State Diagram

```mermaid
stateDiagram-v2
    [*] --> Calculated: Initial Calculation
    
    Calculated --> Validated: Budget Validation
    Calculated --> Recalculated: Edit Items
    
    Validated --> Committed: PO Sent
    Validated --> Recalculated: Edit Items
    Validated --> Deleted: Delete Draft PO
    
    Recalculated --> Validated: Re-validate Budget
    
    Committed --> PartiallyPaid: Partial Payment
    Committed --> FullyPaid: Full Payment
    Committed --> Voided: Void PO
    
    PartiallyPaid --> FullyPaid: Complete Payment
    PartiallyPaid --> Adjusted: Financial Adjustment
    PartiallyPaid --> Voided: Void PO
    
    Adjusted --> PartiallyPaid: After Adjustment
    Adjusted --> FullyPaid: After Adjustment
    Adjusted --> Voided: Void PO
    
    FullyPaid --> Closed: Close PO
    FullyPaid --> Voided: Void PO
    
    Voided --> [*]
    Deleted --> [*]
    Closed --> [*]
    
    classDef draftState fill:#e6f7ff,stroke:#1890ff;
    classDef activeState fill:#f6ffed,stroke:#52c41a;
    classDef terminalState fill:#fff2e8,stroke:#fa8c16;
    
    class Calculated,Validated,Recalculated draftState;
    class Committed,PartiallyPaid,Adjusted,FullyPaid activeState;
    class Voided,Closed,Deleted terminalState;
```

## Integrated State Diagram with Triggers

```mermaid
stateDiagram-v2
    [*] --> Draft: Create PO
    
    Draft --> Sent: User Action - Send to Vendor
    Draft --> Deleted: User Action - Delete
    
    Sent --> Partial: System Event - GRN Created (Partial)
    Sent --> FullyReceived: System Event - GRN Created (Full)
    Sent --> Voided: User Action - Void
    
    Partial --> FullyReceived: System Event - GRN Created (Remaining)
    Partial --> Closed: User Action - Close PO
    Partial --> Voided: User Action - Void
    
    FullyReceived --> Closed: System Action - Auto-Close
    FullyReceived --> Voided: User Action - Void
    
    state Draft {
        [*] --> Initial: New PO
        Initial --> ItemsAdded: Add Items
        ItemsAdded --> FinancialsCalculated: Calculate Financials
        FinancialsCalculated --> ReadyForSending: Validate
    }
    
    state Sent {
        [*] --> PendingDelivery
        PendingDelivery --> InTransit: Update Shipping Info
    }
    
    state Partial {
        [*] --> ItemsTracking
        ItemsTracking --> WaitingRemaining: Track Remaining Items
    }
    
    Voided --> [*]
    Closed --> [*]
    Deleted --> [*]
```

These state diagrams illustrate the various states a Purchase Order can transition through during its lifecycle, from creation to closure, including goods receipt and financial states. The diagrams highlight the important business rule that draft POs can be deleted, while active POs (Sent, Partially Received, Fully Received) can only be voided or closed. 