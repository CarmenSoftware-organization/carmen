# Flow Diagrams: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version |

---

## Overview

This document provides visual representations of workflows, data flows, and system interactions for the Spot Check sub-module using Mermaid diagrams.

**Diagram Types**:
- **Process Flows**: End-to-end user workflows
- **Data Flows**: How data moves through the system
- **Sequence Diagrams**: Component interactions over time
- **State Diagrams**: Status transitions and rules
- **Integration Flows**: External system interactions

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Use Cases](./UC-spot-check.md)
- [Technical Specification](./TS-spot-check.md)
- [Data Definition](./DD-spot-check.md)
- [Validations](./VAL-spot-check.md)

---

## High-Level Process Flow

### Complete Spot Check Lifecycle

```mermaid
flowchart TD
    Start([User Initiates<br/>Spot Check]) --> SelectLocation[Select Location<br/>and Description]
    SelectLocation --> CreateSession[Create Spot Check Session<br/>Status: pending]
    CreateSession --> AddProducts{Add Products<br/>to Spot Check}

    AddProducts -->|Search & Add| FetchExpected[Fetch Expected Qty<br/>from ITS]
    FetchExpected --> AddDetail[Add Product to Detail List<br/>Max 50 products]
    AddDetail --> MoreProducts{More Products<br/>to Add?}
    MoreProducts -->|Yes| AddProducts
    MoreProducts -->|No| StartCounting[User Clicks<br/>'Start Counting']

    StartCounting --> UpdateStatus1[Update Status<br/>to 'in_progress']
    UpdateStatus1 --> EnterQty[Enter Actual Quantities]
    EnterQty --> CalcVariance[Calculate Variance<br/>Real-time]
    CalcVariance --> AutoSave[Auto-save<br/>Every 30s]
    AutoSave --> AllCounted{All Products<br/>Counted?}
    AllCounted -->|No| EnterQty
    AllCounted -->|Yes| ReviewVariance[Review Variance<br/>Analysis]

    ReviewVariance --> HighVariance{High Variance<br/>Items?}
    HighVariance -->|Yes| RequireApproval[Require Supervisor<br/>Approval]
    RequireApproval --> NotifySupervisor[Notify Supervisor]
    NotifySupervisor --> WaitApproval[Wait for<br/>Approval]
    WaitApproval --> Approved{Approved?}
    Approved -->|Rejected| Recount[Request Recount<br/>or Investigation]
    Recount --> EnterQty
    Approved -->|Yes| ProceedComplete
    HighVariance -->|No| ProceedComplete[Proceed to<br/>Complete]

    ProceedComplete --> ValidateComplete{Validate<br/>Completion?}
    ValidateComplete -->|Fail| ShowError[Display Error]
    ShowError --> ReviewVariance
    ValidateComplete -->|Pass| PostAdjustments[Post Inventory<br/>Adjustments to ITS]

    PostAdjustments --> ITSSuccess{ITS API<br/>Success?}
    ITSSuccess -->|Fail| QueueRetry[Queue for<br/>Background Retry]
    QueueRetry --> SetPendingPost[Status:<br/>pending_adjustment_post]
    SetPendingPost --> NotifyOps[Notify Operations<br/>Team]
    ITSSuccess -->|Success| RecordTx[Record Adjustment<br/>Transaction IDs]
    RecordTx --> UpdateStatus2[Update Status<br/>to 'completed']
    UpdateStatus2 --> SetEndDate[Set end_date<br/>= Current Time]
    SetEndDate --> NotifyComplete[Notify Manager]
    NotifyComplete --> End([Spot Check<br/>Complete])

    CreateSession -.->|Optional| Cancel[Cancel Spot Check]
    UpdateStatus1 -.->|Optional| Cancel
    Cancel --> SetCancelled[Status: cancelled<br/>Retain Data]
    SetCancelled --> CancelEnd([Cancelled])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style CancelEnd fill:#ffe1e1
    style HighVariance fill:#fff4e1
    style ITSSuccess fill:#fff4e1
```

---

## Detailed Process Flows

### 1. Create Spot Check Session

```mermaid
flowchart TD
    Start([User Clicks<br/>'Create Spot Check']) --> DisplayForm[Display Creation Form]
    DisplayForm --> UserInput[User Enters:<br/>- Location<br/>- Description optional]
    UserInput --> ValidateClient{Client-side<br/>Validation?}

    ValidateClient -->|Fail| ShowClientError[Show Validation Error]
    ShowClientError --> UserInput
    ValidateClient -->|Pass| SubmitServer[Submit to<br/>Server Action]

    SubmitServer --> CheckAccess{User Has<br/>Location Access?}
    CheckAccess -->|No| ReturnError[Return Error:<br/>Access Denied]
    ReturnError --> DisplayError[Display Error<br/>Message]
    DisplayError --> UserInput

    CheckAccess -->|Yes| GenerateNumber[Generate Unique<br/>Spot Check Number<br/>SPOT-YYYY-NNNNNN]
    GenerateNumber --> CreateRecord[Create Record in<br/>tb_count_stock:<br/>- type = 'spot'<br/>- status = 'pending'<br/>- start_date = now]
    CreateRecord --> SaveDB[(Save to<br/>Database)]
    SaveDB --> ReturnSuccess[Return Spot Check ID]
    ReturnSuccess --> Redirect[Redirect to<br/>Add Products Screen]
    Redirect --> End([Add Products<br/>Screen Loaded])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
```

### 2. Add Products to Spot Check

```mermaid
flowchart TD
    Start([Add Products<br/>Screen Loaded]) --> Display[Display:<br/>- Current products<br/>- Search box<br/>- Category selector]
    Display --> UserAction{User Action?}

    UserAction -->|Search| SearchInput[Enter Product<br/>Name or Code]
    SearchInput --> Debounce[Debounce 300ms]
    Debounce --> QueryProducts[Query Product<br/>Master]
    QueryProducts --> ShowResults[Display Search<br/>Results]
    ShowResults --> UserSelect[User Clicks 'Add']

    UserAction -->|Category| SelectCategory[Select Product<br/>Category]
    SelectCategory --> FilterCategory[Filter Products<br/>by Category]
    FilterCategory --> ShowCategory[Display Category<br/>Products]
    ShowCategory --> UserSelectMulti[User Selects<br/>Products]
    UserSelectMulti --> AddMultiple[Add Multiple<br/>Products]

    UserSelect --> ValidateAdd{Validate:<br/>Not Duplicate<br/>< 50 Products}
    AddMultiple --> ValidateAdd
    ValidateAdd -->|Fail| ShowAddError[Show Error<br/>Message]
    ShowAddError --> Display

    ValidateAdd -->|Pass| CreateDetail[Create Detail Record:<br/>- count_stock_id<br/>- product_id<br/>- sequence_no<br/>- expected_qty = null]
    CreateDetail --> SaveDetail[(Save Detail<br/>to Database)]
    SaveDetail --> FetchExpected[Call ITS API:<br/>Get Expected Qty]

    FetchExpected --> ITSResponse{ITS Response?}
    ITSResponse -->|Success| UpdateExpected[Update Detail:<br/>expected_qty = balance]
    UpdateExpected --> UpdateUI[Update Product List<br/>with Expected Qty]
    ITSResponse -->|Fail| SetNull[expected_qty = null]
    SetNull --> ShowWarning[Show Warning:<br/>Expected qty unavailable]
    ShowWarning --> UpdateUI

    UpdateUI --> CheckMax{Reached Max<br/>50 Products?}
    CheckMax -->|Yes| DisableAdd[Disable Add<br/>Button]
    DisableAdd --> Display
    CheckMax -->|No| Display

    Display --> StartCount{User Clicks<br/>'Start Counting'?}
    StartCount -->|No| UserAction
    StartCount -->|Yes| UpdateStatus[Update Status:<br/>'in_progress']
    UpdateStatus --> Redirect[Redirect to<br/>Enter Quantities]
    Redirect --> End([Enter Quantities<br/>Screen])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
```

### 3. Enter Counted Quantities

```mermaid
flowchart TD
    Start([Enter Quantities<br/>Screen]) --> LoadProducts[Load Product List<br/>with Expected Qtys]
    LoadProducts --> Display[Display Table:<br/>Product, Expected,<br/>Actual input, Variance]

    Display --> UserInput[User Enters<br/>Actual Quantity]
    UserInput --> ValidateInput{Valid Input?<br/>>= 0, max 2 decimals}
    ValidateInput -->|Fail| ShowError[Show Inline<br/>Error]
    ShowError --> Display

    ValidateInput -->|Pass| CalcVariance[Calculate:<br/>variance_qty = actual - expected<br/>variance_pct = variance / expected * 100]
    CalcVariance --> UpdateUI[Update UI:<br/>- Show variance<br/>- Color code green/yellow/red<br/>- Set is_counted = true]
    UpdateUI --> StoreLocal[Store in<br/>Local Storage]

    StoreLocal --> AutoSaveTimer{30 Second<br/>Timer?}
    AutoSaveTimer -->|Triggered| BatchSave[Batch Save<br/>All Modified Qtys]
    BatchSave --> ServerAction[Call Server Action:<br/>updateActualQuantities]
    ServerAction --> SaveDB[(Save to<br/>Database)]
    SaveDB --> ClearLocal[Clear Local<br/>Storage for Saved]
    ClearLocal --> ShowSaved[Show 'Saved'<br/>Indicator]
    ShowSaved --> AutoSaveTimer

    AutoSaveTimer -->|Not Yet| Display
    Display --> AllDone{All Products<br/>Counted?}
    AllDone -->|No| UserInput
    AllDone -->|Yes| EnableNext[Enable 'Next'<br/>Button]
    EnableNext --> UserNext{User Clicks<br/>'Next'?}
    UserNext -->|No| Display
    UserNext -->|Yes| FinalSave[Final Save All]
    FinalSave --> Redirect[Redirect to<br/>Review Variance]
    Redirect --> End([Review Variance<br/>Screen])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
```

### 4. Review Variance and Complete

```mermaid
flowchart TD
    Start([Review Variance<br/>Screen]) --> LoadData[Load:<br/>- All product variances<br/>- Calculate aggregates]
    LoadData --> Display[Display:<br/>- Summary stats<br/>- Variance table<br/>- High variance highlights]

    Display --> UserAction{User Action?}
    UserAction -->|Add Note| OpenNoteDialog[Open Note<br/>Dialog]
    OpenNoteDialog --> EnterNote[Enter Variance<br/>Explanation]
    EnterNote --> SaveNote[Save Note to<br/>Detail Record]
    SaveNote --> Display

    UserAction -->|Recount| ConfirmRecount{Confirm<br/>Recount?}
    ConfirmRecount -->|No| Display
    ConfirmRecount -->|Yes| BackToEntry[Return to<br/>Enter Quantities]
    BackToEntry --> EnterScreen([Enter Quantities<br/>Screen])

    UserAction -->|Complete| CheckHighVar{High Variance<br/>Items?}
    CheckHighVar -->|Yes| CheckApproval{All High Var<br/>Approved?}
    CheckApproval -->|No| ShowApprovalNeeded[Show: Supervisor<br/>Approval Required]
    ShowApprovalNeeded --> SubmitApproval[Submit for<br/>Approval]
    SubmitApproval --> NotifySupervisor[Notify Supervisor]
    NotifySupervisor --> WaitApproval[Wait for<br/>Approval]
    WaitApproval --> ApprovalComplete{Approved?}
    ApprovalComplete -->|No| BackToReview[Return to<br/>Review]
    BackToReview --> Display
    ApprovalComplete -->|Yes| ProceedComplete

    CheckApproval -->|Yes| ProceedComplete[Proceed to<br/>Complete]
    CheckHighVar -->|No| ProceedComplete

    ProceedComplete --> ValidateAll{Validate:<br/>All counted<br/>All approved}
    ValidateAll -->|Fail| ShowValidationError[Show Error]
    ShowValidationError --> Display

    ValidateAll -->|Pass| ConfirmComplete{Confirm<br/>Completion?}
    ConfirmComplete -->|No| Display
    ConfirmComplete -->|Yes| SetEndDate[Set end_date<br/>= current time]
    SetEndDate --> PostAdjustments[Post Adjustments<br/>to ITS]
    PostAdjustments --> Complete[Update Status:<br/>'completed']
    Complete --> Notify[Notify Manager]
    Notify --> Redirect[Redirect to<br/>Detail View]
    Redirect --> End([Spot Check<br/>Completed])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
```

### 5. Supervisor Approval Flow

```mermaid
flowchart TD
    Start([Supervisor Receives<br/>Notification]) --> OpenLink[Click Notification<br/>Link]
    OpenLink --> LoadData[Load Spot Check<br/>with High Variance Items]
    LoadData --> Display[Display:<br/>- Product details<br/>- Expected vs Actual<br/>- Variance amount<br/>- Requester notes]

    Display --> ReviewItem[Supervisor Reviews<br/>Variance Details]
    ReviewItem --> Decision{Supervisor<br/>Decision?}

    Decision -->|Approve| OpenApprovalDialog[Open Approval<br/>Dialog]
    OpenApprovalDialog --> EnterApprovalNotes[Enter Optional<br/>Approval Notes]
    EnterApprovalNotes --> SubmitApproval[Submit Approval]
    SubmitApproval --> UpdateRecord[Update Detail Record:<br/>- approved = true<br/>- approved_by<br/>- approved_at<br/>- notes]
    UpdateRecord --> SaveApproval[(Save to<br/>Database)]
    SaveApproval --> CheckAllApproved{All High Var<br/>Approved?}
    CheckAllApproved -->|Yes| UpdateSpotCheck[Update Spot Check:<br/>supervisor_approved = true]
    UpdateSpotCheck --> NotifyRequester[Notify Requester:<br/>Approved]
    CheckAllApproved -->|No| NotifyRequester
    NotifyRequester --> End([Approval<br/>Complete])

    Decision -->|Reject| OpenRejectDialog[Open Rejection<br/>Dialog]
    OpenRejectDialog --> EnterRejection[Enter Rejection<br/>Reason Required]
    EnterRejection --> SubmitRejection[Submit Rejection]
    SubmitRejection --> UpdateRejection[Update Detail:<br/>- approved = false<br/>- rejection_reason]
    UpdateRejection --> SaveRejection[(Save to<br/>Database)]
    SaveRejection --> NotifyReject[Notify Requester:<br/>Rejected with Reason]
    NotifyReject --> RejectEnd([Approval<br/>Rejected])

    Decision -->|Request Recount| EnterRecountReason[Enter Optional<br/>Recount Notes]
    EnterRecountReason --> FlagRecount[Flag Detail:<br/>recount_requested = true]
    FlagRecount --> SaveFlag[(Save to<br/>Database)]
    SaveFlag --> NotifyRecount[Notify Storekeeper:<br/>Recount Requested]
    NotifyRecount --> RecountEnd([Recount<br/>Requested])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style RejectEnd fill:#ffe1e1
    style RecountEnd fill:#fff4e1
```

---

## Data Flow Diagrams

### Context Diagram: Spot Check System

```mermaid
flowchart TD
    Storekeeper([Storekeeper]) -->|Create, Enter Quantities| SpotCheckSystem[Spot Check<br/>System]
    Supervisor([Supervisor]) -->|Approve High Variance| SpotCheckSystem
    Manager([Manager]) -->|View Reports| SpotCheckSystem

    SpotCheckSystem -->|Get Expected Qty| ITS[Inventory Transaction<br/>System]
    SpotCheckSystem -->|Post Adjustments| ITS
    ITS -->|Return Balance| SpotCheckSystem
    ITS -->|Return Transaction ID| SpotCheckSystem

    SpotCheckSystem -->|Send Notifications| NotificationService[Notification<br/>Service]
    NotificationService -->|Email/In-App Alert| Supervisor
    NotificationService -->|Completion Alert| Manager

    SpotCheckSystem -->|Log Actions| AuditLog[(Audit Log<br/>System)]
    SpotCheckSystem -->|Query/Update| Database[(PostgreSQL<br/>Database)]

    style SpotCheckSystem fill:#e1f0ff
    style ITS fill:#fff4e1
    style Database fill:#f0f0f0
```

### Detailed Data Flow: Complete Spot Check

```mermaid
flowchart LR
    User([User]) -->|1. Enter Actual Qty| Browser[Browser]
    Browser -->|2. Calculate Variance| Client[Client-Side<br/>JavaScript]
    Client -->|3. Store Locally| LocalStorage[(Local Storage)]
    Client -->|4. Auto-Save Batch| ServerAction[Server Action:<br/>updateQuantities]

    ServerAction -->|5. Validate| ValidationLayer[Validation<br/>Layer]
    ValidationLayer -->|6. Calculate Variance| BusinessLogic[Business<br/>Logic]
    BusinessLogic -->|7. Update Records| Prisma[Prisma ORM]
    Prisma -->|8. Write| Database[(PostgreSQL)]

    User -->|9. Complete| CompleteAction[Server Action:<br/>completeSpotCheck]
    CompleteAction -->|10. Validate All Counted| BusinessLogic
    BusinessLogic -->|11. Post Adjustment| ITSClient[ITS API<br/>Client]
    ITSClient -->|12. HTTP POST| ITS[Inventory<br/>Transaction System]
    ITS -->|13. Return Transaction ID| ITSClient
    ITSClient -->|14. Record Transaction ID| BusinessLogic
    BusinessLogic -->|15. Update Status| Prisma
    Prisma -->|16. Write| Database
    Database -->|17. Return Success| CompleteAction
    CompleteAction -->|18. Trigger Notification| NotificationService[Notification<br/>Service]
    NotificationService -->|19. Send Email| Manager([Manager])

    style Browser fill:#e1f5e1
    style Database fill:#f0f0f0
    style ITS fill:#fff4e1
```

---

## Sequence Diagrams

### Sequence: Create and Complete Spot Check

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant SA as Server Action
    participant BL as Business Logic
    participant DB as Database
    participant ITS as ITS API

    Note over User,ITS: Create Spot Check
    User->>UI: Select location, click Create
    UI->>SA: createSpotCheck(location_id)
    SA->>BL: Validate location access
    BL->>DB: Check user permissions
    DB-->>BL: Permissions OK
    BL->>DB: INSERT tb_count_stock (type='spot', status='pending')
    DB-->>BL: spot_check_id
    BL-->>SA: Success
    SA-->>UI: spot_check_id
    UI-->>User: Redirect to Add Products

    Note over User,ITS: Add Products
    User->>UI: Search "Chicken Breast", click Add
    UI->>SA: addProduct(spot_check_id, product_id)
    SA->>BL: Validate product not duplicate
    BL->>DB: INSERT tb_count_stock_detail
    DB-->>BL: detail_id
    BL->>ITS: GET /api/inventory/balance
    ITS-->>BL: expected_qty: 100.00
    BL->>DB: UPDATE detail SET expected_qty=100.00
    DB-->>BL: Success
    BL-->>SA: Detail with expected_qty
    SA-->>UI: Product added
    UI-->>User: Show product with expected 100.00

    Note over User,ITS: Enter Quantities
    User->>UI: Enter actual: 95.00
    UI->>UI: Calculate variance: -5.00 (-5%)
    UI->>UI: Store in local storage
    Note over UI: Auto-save timer (30s)
    UI->>SA: autoSaveQuantities([{id, actual_qty}])
    SA->>BL: Batch update quantities
    BL->>DB: UPDATE multiple details
    DB-->>BL: Success
    BL-->>SA: Saved
    SA-->>UI: Success
    UI->>UI: Clear local storage
    UI-->>User: Show "Saved" indicator

    Note over User,ITS: Complete Spot Check
    User->>UI: Review variance, click Complete
    UI->>UI: Confirm dialog
    User->>UI: Confirm
    UI->>SA: completeSpotCheck(spot_check_id)
    SA->>BL: Validate all counted & approved
    BL->>DB: Check all is_counted=true
    DB-->>BL: All counted
    BL->>BL: Set end_date = now
    loop For each product with variance
        BL->>ITS: POST /api/inventory/adjustment
        ITS-->>BL: transaction_id
        BL->>DB: UPDATE detail (adjustment_transaction_id, adjustment_posted=true)
    end
    BL->>DB: UPDATE tb_count_stock (status='completed')
    DB-->>BL: Success
    BL-->>SA: Completed
    SA-->>UI: Success
    UI-->>User: Show success, redirect to detail
```

---

## State Diagrams

### Spot Check Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Create spot check

    Pending --> InProgress: Start counting<br/>(add products, click Start)
    Pending --> Cancelled: Cancel before starting
    Pending --> [*]: Delete (soft delete)

    InProgress --> Completed: Complete spot check<br/>(all counted, adjustments posted,<br/>high variance approved)
    InProgress --> Cancelled: Cancel during counting
    InProgress --> Pending: Save as draft<br/>(pause counting)

    Completed --> [*]: Archive after 12 months
    Cancelled --> [*]: Archive

    PendingAdjustmentPost --> Completed: Background retry successful<br/>(adjustments posted)
    PendingAdjustmentPost --> Failed: Max retries exhausted

    Failed --> [*]: Manual intervention required

    note right of Pending
        Products can be added
        Status can be changed to in_progress
        Can be cancelled
    end note

    note right of InProgress
        Quantities being entered
        Auto-save active
        Can save draft (→ pending)
        Can complete or cancel
    end note

    note right of Completed
        Read-only
        Cannot be modified
        Adjustments posted to ITS
        Available for reporting
    end note

    note right of PendingAdjustmentPost
        ITS unavailable during completion
        Adjustments queued for retry
        Background job attempts posting
    end note
```

### Product Detail Status Flow

```mermaid
stateDiagram-v2
    [*] --> Added: Product added to spot check

    Added --> Counted: Actual quantity entered<br/>(is_counted = true)

    Counted --> LowVariance: Variance < 5% AND < $100
    Counted --> HighVariance: Variance >= 5% OR >= $100

    LowVariance --> AdjustmentPending: Spot check completed
    HighVariance --> AwaitingApproval: Submit for approval

    AwaitingApproval --> Approved: Supervisor approves
    AwaitingApproval --> RecountRequested: Supervisor requests recount
    AwaitingApproval --> Rejected: Supervisor rejects

    RecountRequested --> Added: Return to entry<br/>(clear actual_qty)
    Rejected --> Added: Investigation required

    Approved --> AdjustmentPending: Spot check completed
    LowVariance --> NoAdjustment: Variance = 0<br/>(no adjustment needed)

    AdjustmentPending --> AdjustmentPosted: ITS API success<br/>(adjustment_transaction_id set)
    AdjustmentPending --> AdjustmentFailed: ITS API failed<br/>(queued for retry)

    AdjustmentPosted --> [*]: Complete
    AdjustmentFailed --> AdjustmentPosted: Retry successful
    AdjustmentFailed --> ManualIntervention: Max retries exhausted
    NoAdjustment --> [*]: Complete

    note right of HighVariance
        Requires supervisor approval
        Cannot complete without approval
    end note

    note right of AdjustmentPosted
        Inventory balance updated
        Transaction ID recorded
        Audit trail complete
    end note
```

---

## Integration Flow Diagrams

### Integration: Retrieve Expected Quantities from ITS

```mermaid
flowchart TD
    Start([Product Added<br/>to Spot Check]) --> PrepareRequest[Prepare API Request:<br/>- product_id<br/>- location_id<br/>- as_of_date=today]
    PrepareRequest --> CheckToken{OAuth Token<br/>Valid?}

    CheckToken -->|Expired| RefreshToken[Refresh OAuth<br/>Token]
    RefreshToken --> RefreshSuccess{Refresh<br/>Success?}
    RefreshSuccess -->|No| AuthError[Return Error:<br/>Authentication Failed]
    AuthError --> Degrade1[Degrade Gracefully:<br/>expected_qty = null]
    Degrade1 --> WarnUser1[Warn User:<br/>Expected qty unavailable]
    WarnUser1 --> End1([Product Added<br/>Without Expected Qty])

    RefreshSuccess -->|Yes| MakeRequest
    CheckToken -->|Valid| MakeRequest[Make HTTP GET Request:<br/>/api/inventory/balance]

    MakeRequest --> Timeout{Response<br/>Within 10s?}
    Timeout -->|No| RetryOnce[Retry Immediately<br/>Once]
    RetryOnce --> Timeout2{Response?}
    Timeout2 -->|No| NetworkError[Network Timeout<br/>Error]
    NetworkError --> Degrade2[expected_qty = null]
    Degrade2 --> WarnUser2[Warn User]
    WarnUser2 --> End1

    Timeout -->|Yes| CheckStatus{HTTP Status?}
    Timeout2 -->|Yes| CheckStatus

    CheckStatus -->|200 OK| ParseResponse[Parse JSON Response]
    ParseResponse --> ValidateResponse{Valid<br/>Response Format?}
    ValidateResponse -->|No| FormatError[Invalid Format<br/>Error]
    FormatError --> Degrade2
    ValidateResponse -->|Yes| ExtractBalance[Extract:<br/>current_balance]
    ExtractBalance --> UpdateDetail[Update Detail Record:<br/>expected_qty = balance]
    UpdateDetail --> SaveDB[(Save to<br/>Database)]
    SaveDB --> Success[Return Success]
    Success --> End2([Product Added<br/>With Expected Qty])

    CheckStatus -->|404 Not Found| ProductNotFound[Product/Location<br/>Not Found in ITS]
    ProductNotFound --> SetZero[expected_qty = 0.00]
    SetZero --> WarnUser3[Warn: Product not<br/>in inventory system]
    WarnUser3 --> End2

    CheckStatus -->|401 Unauthorized| AuthError

    CheckStatus -->|500 Server Error| ServerError[ITS Server<br/>Error]
    ServerError --> ExponentialBackoff[Retry with Backoff:<br/>1s, 2s, 4s]
    ExponentialBackoff --> MaxRetries{Max 3 Retries<br/>Exhausted?}
    MaxRetries -->|No| MakeRequest
    MaxRetries -->|Yes| ITSUnavailable[ITS Unavailable]
    ITSUnavailable --> Degrade2

    style End1 fill:#fff4e1
    style End2 fill:#e1f5e1
```

### Integration: Post Adjustments to ITS

```mermaid
flowchart TD
    Start([Spot Check<br/>Completed]) --> GetVariances[Get All Products<br/>with variance_qty != 0]
    GetVariances --> CheckCount{Variance<br/>Count?}
    CheckCount -->|0| NoAdjustment[No Adjustments<br/>Needed]
    NoAdjustment --> SetComplete[Set Status:<br/>'completed']
    SetComplete --> End1([Complete])

    CheckCount -->|>0| StartLoop{For Each<br/>Product}
    StartLoop --> PreparePayload[Prepare Adjustment:<br/>- product_id<br/>- location_id<br/>- adjustment_qty<br/>- reason='spot_check'<br/>- reference_no]
    PreparePayload --> CheckToken{OAuth Token<br/>Valid?}

    CheckToken -->|Expired| RefreshToken[Refresh Token]
    RefreshToken --> RefreshSuccess{Success?}
    RefreshSuccess -->|No| QueueRetry1[Queue for<br/>Background Retry]
    QueueRetry1 --> SetPending[Status:<br/>pending_adjustment_post]
    SetPending --> AlertOps1[Alert Operations<br/>Team]
    AlertOps1 --> End2([Pending Adjustment<br/>Post])

    RefreshSuccess -->|Yes| PostRequest
    CheckToken -->|Valid| PostRequest[POST Request:<br/>/api/inventory/adjustment]

    PostRequest --> Timeout{Response<br/>Within 10s?}
    Timeout -->|No| RetryBackoff[Retry with Backoff:<br/>1s, 2s, 4s]
    RetryBackoff --> MaxRetries{Max 3<br/>Retries?}
    MaxRetries -->|No| PostRequest
    MaxRetries -->|Yes| QueueRetry1

    Timeout -->|Yes| CheckStatus{HTTP<br/>Status?}

    CheckStatus -->|200 OK| ParseResponse[Parse Response:<br/>Get transaction_id]
    ParseResponse --> UpdateDetail[Update Detail:<br/>- adjustment_transaction_id<br/>- adjustment_posted = true]
    UpdateDetail --> SaveDB[(Save to<br/>Database)]
    SaveDB --> MoreProducts{More Products<br/>to Process?}
    MoreProducts -->|Yes| StartLoop
    MoreProducts -->|No| AllPosted[All Adjustments<br/>Posted]
    AllPosted --> SetComplete

    CheckStatus -->|400 Bad Request| BusinessRuleError[Business Rule<br/>Violation]
    BusinessRuleError --> FlagProduct[Flag Product:<br/>adjustment_failed]
    FlagProduct --> LogError[Log Error<br/>with Reason]
    LogError --> NotifyManager[Notify Manager:<br/>Manual Intervention Needed]
    NotifyManager --> MoreProducts

    CheckStatus -->|422 Unprocessable| BusinessRuleError

    CheckStatus -->|500 Server Error| ServerError[ITS Server<br/>Error]
    ServerError --> QueueRetry1

    CheckStatus -->|503 Unavailable| ITSUnavailable[ITS Temporarily<br/>Unavailable]
    ITSUnavailable --> QueueRetry1

    style End1 fill:#e1f5e1
    style End2 fill:#fff4e1
```

---

## Component Interaction Diagram

### Frontend-Backend Interaction

```mermaid
flowchart TD
    subgraph Browser["Browser (Client)"]
        Page[Page Component<br/>Server Rendered]
        ClientComp[Client Components<br/>Interactive UI]
        LocalStorage[(Local Storage<br/>Fallback)]
    end

    subgraph NextJS["Next.js Server"]
        ServerAction[Server Actions<br/>Mutations]
        API[API Routes<br/>if needed]
        BL[Business Logic<br/>Layer]
    end

    subgraph Data["Data Layer"]
        Prisma[Prisma ORM<br/>Type-Safe]
        DB[(PostgreSQL<br/>Database)]
    end

    subgraph External["External Systems"]
        ITS[Inventory<br/>Transaction<br/>System]
        Notification[Notification<br/>Service]
    end

    Page -->|Initial Load| ServerAction
    ServerAction -->|Pre-render Data| Page

    ClientComp -->|User Action| ServerAction
    ClientComp -->|Auto-Save| ServerAction
    ClientComp -.->|Offline Fallback| LocalStorage
    LocalStorage -.->|Restore on Reconnect| ClientComp

    ServerAction -->|Call| BL
    API -->|Call| BL
    BL -->|Validate| BL
    BL -->|Query/Mutate| Prisma
    Prisma -->|SQL| DB
    DB -->|Results| Prisma
    Prisma -->|Data| BL

    BL -->|Fetch Expected Qty| ITS
    ITS -->|Return Balance| BL
    BL -->|Post Adjustment| ITS
    ITS -->|Transaction ID| BL

    BL -->|Send Notification| Notification
    Notification -->|Email/Push| Users([Users])

    BL -->|Response| ServerAction
    ServerAction -->|Return| ClientComp
    ClientComp -->|Update UI| ClientComp

    style Browser fill:#e1f5ff
    style NextJS fill:#ffe1f5
    style Data fill:#f0f0f0
    style External fill:#fff4e1
```

---

## Error Handling Flow

### Error Recovery Flow

```mermaid
flowchart TD
    Start([Error Occurs]) --> IdentifyType{Error Type?}

    IdentifyType -->|Validation| ClientError[Client Validation<br/>Error]
    ClientError --> ShowInline[Show Inline<br/>Error Message]
    ShowInline --> UserCorrect[User Corrects<br/>Input]
    UserCorrect --> Retry1([Retry Action])

    IdentifyType -->|Network| NetworkError[Network/Timeout<br/>Error]
    NetworkError --> CheckAutoSave{Auto-Save<br/>Active?}
    CheckAutoSave -->|Yes| SaveLocal[Preserve Data in<br/>Local Storage]
    SaveLocal --> ShowBanner[Show Warning<br/>Banner]
    ShowBanner --> WaitReconnect[Wait for<br/>Network Reconnect]
    WaitReconnect --> Reconnect{Network<br/>Restored?}
    Reconnect -->|Yes| RestoreData[Restore Data<br/>from Local]
    RestoreData --> SyncServer[Sync to<br/>Server]
    SyncServer --> Retry1
    Reconnect -->|No| WaitReconnect

    CheckAutoSave -->|No| ShowRetry[Show Retry<br/>Button]
    ShowRetry --> UserRetry{User Clicks<br/>Retry?}
    UserRetry -->|Yes| Retry1
    UserRetry -->|No| Abandon([Action<br/>Abandoned])

    IdentifyType -->|ITS Unavailable| ITSError[External System<br/>Unavailable]
    ITSError --> CheckCritical{Critical for<br/>Operation?}
    CheckCritical -->|Yes - Expected Qty| DegradeExpected[Degrade Gracefully:<br/>Set expected_qty = null]
    DegradeExpected --> WarnUser1[Warn User:<br/>Can Proceed Without]
    WarnUser1 --> AllowProceed([User Can<br/>Proceed])

    CheckCritical -->|Yes - Adjustment| QueueRetry[Queue for<br/>Background Retry]
    QueueRetry --> SetPending[Set Status:<br/>pending_adjustment_post]
    SetPending --> NotifyUser[Notify User:<br/>Will Retry Automatically]
    NotifyUser --> BackgroundJob[Background Job<br/>Retries with Backoff]
    BackgroundJob --> JobSuccess{Retry<br/>Success?}
    JobSuccess -->|Yes| Complete([Complete<br/>Successfully])
    JobSuccess -->|No| AlertOps[Alert Operations<br/>Team]
    AlertOps --> ManualFix([Manual<br/>Intervention])

    IdentifyType -->|Business Rule| BusinessError[Business Rule<br/>Violation]
    BusinessError --> ShowError[Show User-Friendly<br/>Error Message]
    ShowError --> LogError[Log Error with<br/>Context]
    LogError --> CheckRecoverable{Recoverable?}
    CheckRecoverable -->|Yes| SuggestFix[Suggest Fix to<br/>User]
    SuggestFix --> UserFix{User Fixes<br/>Issue?}
    UserFix -->|Yes| Retry1
    UserFix -->|No| Abandon
    CheckRecoverable -->|No| NotifyManager[Notify Manager]
    NotifyManager --> ManualFix

    IdentifyType -->|Unexpected| UnexpectedError[Unexpected<br/>System Error]
    UnexpectedError --> CatchBoundary[Error Boundary<br/>Catches]
    CatchBoundary --> LogSentry[Log to Sentry<br/>with Stack Trace]
    LogSentry --> ShowFallback[Show Fallback UI:<br/>'Something went wrong']
    ShowFallback --> OfferActions[Offer Actions:<br/>- Refresh Page<br/>- Go Home<br/>- Contact Support]
    OfferActions --> UserAction{User<br/>Action?}
    UserAction -->|Refresh| Retry1
    UserAction -->|Go Home| Home([Return to<br/>Home])
    UserAction -->|Support| ContactSupport([Contact<br/>Support])

    style Retry1 fill:#e1f5e1
    style Abandon fill:#ffe1e1
    style ManualFix fill:#fff4e1
    style Complete fill:#e1f5e1
```

---

## Appendix

### Glossary

- **Spot Check**: Targeted inventory verification of selected products
- **Expected Quantity**: System-calculated inventory balance from ITS
- **Actual Quantity**: Physical count performed by storekeeper
- **Variance**: Difference between expected and actual quantities
- **High Variance**: Variance exceeding 5% or $100 threshold
- **ITS**: Inventory Transaction System (external integration)
- **Auto-Save**: Automatic periodic saving of entered data (every 30s)
- **Local Storage**: Browser-based temporary data storage for offline scenarios
- **Server Action**: Next.js function that runs on server, called from client
- **Optimistic UI**: Update UI immediately before server confirmation
- **Exponential Backoff**: Retry strategy with increasing wait times (1s, 2s, 4s)

### Diagram Conventions

**Color Coding**:
- Green: Successful completion, happy path
- Yellow: Warning, conditional path
- Red: Error, cancellation
- Blue: System/process box
- Gray: Database/storage

**Symbols**:
- Rectangle: Process step
- Diamond: Decision point
- Cylinder: Database/storage
- Circle: Start/end point
- Arrow: Data/control flow
- Dashed line: Optional/fallback path

---

**Document End**

> 📝 **Flow Diagram Summary**:
> - **Process Flows**: 6 detailed workflows (create, add products, enter quantities, review/complete, approval, error handling)
> - **Data Flows**: 2 diagrams (context, detailed completion flow)
> - **Sequence Diagrams**: 1 comprehensive sequence covering full lifecycle
> - **State Diagrams**: 2 state machines (spot check status, product detail status)
> - **Integration Flows**: 2 detailed integration diagrams (fetch expected qty, post adjustments)
> - **Component Interaction**: 1 architectural interaction diagram
> - **Total Diagrams**: 14 comprehensive Mermaid diagrams
