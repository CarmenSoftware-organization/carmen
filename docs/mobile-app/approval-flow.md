# Purchase Request Approval Module Page Flow

This diagram illustrates the user flow through the purchase request approval module of the Hotel Supply Chain Mobile Application.

```mermaid
flowchart TD
    A[Dashboard] --> B[Approval Queue]
    B --> C{Filter View?}
    C -->|All| B
    C -->|Urgent| D[Urgent Requests]
    C -->|By Department| E[Department Filter]
    C -->|By Date| F[Date Range Filter]
    
    D --> G[Select PR for Review]
    E --> G
    F --> G
    B --> G
    
    G --> H[PR Summary View]
    H --> I[Detailed Review]
    I --> J[View Item Details]
    J --> K[Check Inventory Status]
    J --> L[View Price Comparison]
    J --> M[Review Budget Impact]
    
    I --> N{Decision?}
    N -->|Approve| O[Approve PR]
    N -->|Reject| P[Rejection Reason]
    N -->|Send Back| Q[Change Requirements]
    N -->|Split & Reject| R[Item Selection for Split]
    
    R --> S[Approve Selected Items]
    S --> T[Reject Remaining Items]
    T --> U[Provide Rejection Reason]
    
    O --> V[Confirmation Screen]
    P --> V
    Q --> V
    U --> V
    
    V --> W{More Approvals?}
    W -->|Yes| B
    W -->|No| X[Return to Dashboard]
    
    B --> Y[Delegation Settings]
    Y --> Z[Set Delegation Period]
    Z --> AA[Select Delegate]
    AA --> AB[Confirm Delegation]
    AB --> B
    
    B --> AC[Bulk Selection]
    AC --> AD[Batch Approve Similar PRs]
    AD --> V
```

## Purchase Request Approval Process Details

1. **Approval Queue**: List of pending requests requiring approval
2. **Filtering Options**: Sort and filter by priority, department, date, etc.
3. **PR Review**: Comprehensive examination of request details
4. **Decision Options**:
   - Approve: Full approval of request
   - Reject: Complete rejection with justification
   - Send Back: Return to requester for changes
   - Split & Reject: Partial approval of selected items
5. **Delegation**: Temporary transfer of approval authority
6. **Bulk Actions**: Process multiple similar requests simultaneously

## Key Features

- Real-time notifications for pending approvals
- Budget impact visualization
- Offline approval capability
- Priority indicators for urgent requests
- Complete audit trail of decisions
- Quantity adjustment during approval
- Approval history view
- Mobile-optimized review interface
