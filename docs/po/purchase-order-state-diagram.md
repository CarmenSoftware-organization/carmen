# Purchase Order Module - State Diagram

This document illustrates the state transitions for Purchase Orders in the Carmen F&B Management System.

## Purchase Order State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft: Create PO
    
    Draft --> Submitted: Submit for Approval
    Draft --> Deleted: Delete
    
    Submitted --> Approved: Approve
    Submitted --> Rejected: Reject
    Submitted --> Draft: Return for Changes
    
    Rejected --> Draft: Revise and Resubmit
    
    Approved --> Sent: Send to Vendor
    Approved --> Cancelled: Cancel
    
    Sent --> Partial: Receive Some Items
    Sent --> FullyReceived: Receive All Items
    Sent --> Cancelled: Cancel
    
    Partial --> FullyReceived: Receive Remaining Items
    Partial --> Closed: Close with Partial Receipt
    
    FullyReceived --> Closed: Close PO
    
    Cancelled --> [*]
    Closed --> [*]
    Deleted --> [*]
```

## Purchase Order Item State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending: Add Item to PO
    
    Pending --> Ordered: PO Approved & Sent
    Pending --> Cancelled: Item Removed or PO Cancelled
    
    Ordered --> PartiallyReceived: Partial Receipt
    Ordered --> FullyReceived: Full Receipt
    Ordered --> Cancelled: PO Cancelled
    
    PartiallyReceived --> FullyReceived: Receive Remaining
    PartiallyReceived --> Closed: Close with Partial Receipt
    
    FullyReceived --> Closed: Close Item
    
    Cancelled --> [*]
    Closed --> [*]
```

## Purchase Order Approval State Diagram

```mermaid
stateDiagram-v2
    [*] --> PendingFirstApproval: Submit PO
    
    PendingFirstApproval --> PendingSecondApproval: First Approval
    PendingFirstApproval --> Rejected: First Rejection
    
    PendingSecondApproval --> PendingFinalApproval: Second Approval
    PendingSecondApproval --> Rejected: Second Rejection
    
    PendingFinalApproval --> Approved: Final Approval
    PendingFinalApproval --> Rejected: Final Rejection
    
    Rejected --> [*]: Return to Creator
    Approved --> [*]: Proceed to Next Steps
```

## Purchase Order Financial State Diagram

```mermaid
stateDiagram-v2
    [*] --> Calculated: Initial Calculation
    
    Calculated --> Validated: Budget Validation
    Calculated --> Recalculated: Edit Items
    
    Validated --> Committed: PO Approval
    Validated --> Recalculated: Edit Items
    
    Recalculated --> Validated: Re-validate Budget
    
    Committed --> PartiallyPaid: Partial Payment
    Committed --> FullyPaid: Full Payment
    Committed --> Voided: Void PO
    
    PartiallyPaid --> FullyPaid: Complete Payment
    PartiallyPaid --> Adjusted: Financial Adjustment
    
    Adjusted --> PartiallyPaid: After Adjustment
    Adjusted --> FullyPaid: After Adjustment
    
    FullyPaid --> Closed: Close PO
    Voided --> [*]
    Closed --> [*]
```

## Integrated State Diagram with Triggers

```mermaid
stateDiagram-v2
    [*] --> Draft: Create PO
    
    Draft --> Submitted: User Action - Submit
    Submitted --> Approved: User Action - Approve
    Submitted --> Rejected: User Action - Reject
    
    Approved --> Sent: User Action - Send to Vendor
    
    Sent --> Partial: System Event - GRN Created (Partial)
    Sent --> FullyReceived: System Event - GRN Created (Full)
    
    Partial --> FullyReceived: System Event - GRN Created (Remaining)
    Partial --> Closed: User Action - Close PO
    
    FullyReceived --> Closed: System Action - Auto-Close
    
    state Draft {
        [*] --> Initial: New PO
        Initial --> ItemsAdded: Add Items
        ItemsAdded --> FinancialsCalculated: Calculate Financials
        FinancialsCalculated --> ReadyForSubmission: Validate
    }
    
    state Approved {
        [*] --> PendingDelivery
        PendingDelivery --> InTransit: Update Shipping Info
    }
    
    state Partial {
        [*] --> ItemsTracking
        ItemsTracking --> WaitingRemaining: Track Remaining Items
    }
    
    Draft --> Deleted: User Action - Delete
    Approved --> Cancelled: User Action - Cancel
    Sent --> Cancelled: User Action - Cancel
    Rejected --> [*]
    Cancelled --> [*]
    Closed --> [*]
    Deleted --> [*]
```

These state diagrams illustrate the various states a Purchase Order can transition through during its lifecycle, from creation to closure, including approval processes, goods receipt, and financial states. 