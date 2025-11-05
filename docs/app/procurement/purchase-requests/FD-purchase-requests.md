# FD-PR-001: Purchase Requests Flow Diagrams

**Module**: Procurement
**Sub-Module**: Purchase Requests
**Document Type**: Flow Diagrams (FD)
**Version**: 1.0.0
**Last Updated**: 2025-01-30
**Status**: Active

---

## 1. Overview

### 1.1 Purpose
This document provides comprehensive flow diagrams for all processes, data flows, and workflows related to the Purchase Requests sub-module.

### 1.2 Diagram Types
- Process Flow Diagrams: User and system processes
- Data Flow Diagrams: Data movement and transformation
- Sequence Diagrams: Component interactions
- State Diagrams: Status transitions
- Workflow Diagrams: Approval processes
- Integration Diagrams: External system interactions
- Swimlane Diagrams: Multi-actor processes
- Decision Trees: Business logic
- Activity Diagrams: Parallel processes
- Error Handling Flows: Exception management

### 1.3 Conventions
- **Start/End**: Rounded rectangles
- **Process**: Rectangles
- **Decision**: Diamonds
- **Data**: Parallelograms
- **Database**: Cylinder
- **Actor**: Stick figure

---

## 2. Process Flow Diagrams

### 2.1 Create Purchase Request - Main Flow

```mermaid
flowchart TD
    Start([User clicks 'New PR']) --> CheckPerm{Has permission?}
    CheckPerm -->|No| ErrorPerm[Display permission error]
    ErrorPerm --> End1([End])

    CheckPerm -->|Yes| SelectTemplate[Select Workflow Template<br/>with embedded PR Type]
    SelectTemplate --> LoadTemplate[Load template:<br/>- PR Type auto-set<br/>- Default items<br/>- Form defaults]
    LoadTemplate --> LoadForm[Display PR form]
    LoadForm --> FillHeader[Fill header information:<br/>- Date<br/>- Delivery Date<br/>- Department<br/>- Location]

    FillHeader --> AddItems[Add line items]
    AddItems --> FillItem[For each item:<br/>- Select product<br/>- Enter quantity<br/>- Enter unit price<br/>- Add notes]

    FillItem --> MoreItems{Add more items?}
    MoreItems -->|Yes| AddItems
    MoreItems -->|No| Review[Review PR summary]

    Review --> Validate{Validation OK?}
    Validate -->|No| ShowErrors[Display validation errors]
    ShowErrors --> FillHeader

    Validate -->|Yes| SaveOption{Save action?}
    SaveOption -->|Save as Draft| SaveDraft[(Save with status='Draft')]
    SaveOption -->|Submit| QueryWorkflow[Query Workflow Engine:<br/>pr_type + amount + dept]

    SaveDraft --> Success1[Display success message]
    Success1 --> End2([End])

    QueryWorkflow --> WorkflowLookup[(Lookup approval_rules table)]
    WorkflowLookup --> CheckRules{Workflow<br/>found?}

    CheckRules -->|No| WorkflowError[Error: No workflow configured]
    WorkflowError --> End5([End])

    CheckRules -->|Yes| BuildChain[Build approval chain<br/>from workflow config]
    BuildChain --> CheckAutoApprove{Auto-approve<br/>rule?}

    CheckAutoApprove -->|Yes| DirectApprove[(Save with status='Approved')]
    DirectApprove --> Success2[Display success message]
    Success2 --> End3([End])

    CheckAutoApprove -->|No| CreateApprovals[Create approval records<br/>per workflow chain]
    CreateApprovals --> SendNotifications[Send notifications to approvers]
    SendNotifications --> UpdateStatus[(Update status='Submitted')]
    UpdateStatus --> Success3[Display success message]
    Success3 --> End4([End])
```

### 2.2 Use Template to Create PR

```mermaid
flowchart TD
    Start([User clicks 'New from Template']) --> LoadTemplates[Load available templates]
    LoadTemplates --> SelectTemplate[User selects template]
    SelectTemplate --> LoadTemplate[(Fetch template data)]

    LoadTemplate --> CopyData[Copy template data to form:<br/>- Items<br/>- Default values<br/>- Settings]

    CopyData --> AutoFill[Auto-fill fields:<br/>- Current date<br/>- User's department<br/>- User's location]

    AutoFill --> AllowEdit[Allow user to modify]
    AllowEdit --> Review[Review PR]
    Review --> Validate{Valid?}

    Validate -->|No| ShowErrors[Display errors]
    ShowErrors --> AllowEdit

    Validate -->|Yes| Submit[Submit PR]
    Submit --> End([End])
```

### 2.3 Edit Purchase Request

```mermaid
flowchart TD
    Start([User opens PR]) --> CheckStatus{Status check}
    CheckStatus -->|Submitted/Approved| ShowReadOnly[Display read-only view]
    ShowReadOnly --> End1([End])

    CheckStatus -->|Draft/Rejected| CheckOwner{Is owner?}
    CheckOwner -->|No| ShowReadOnly

    CheckOwner -->|Yes| LoadPR[(Load PR data)]
    LoadPR --> DisplayForm[Display editable form]
    DisplayForm --> EditFields[User modifies fields]

    EditFields --> ItemActions{Item action?}
    ItemActions -->|Add| AddItem[Add new line item]
    AddItem --> EditFields

    ItemActions -->|Edit| ModifyItem[Modify existing item]
    ModifyItem --> RecalcLine[Recalculate line total]
    RecalcLine --> EditFields

    ItemActions -->|Delete| DeleteItem[Mark item as deleted]
    DeleteItem --> EditFields

    ItemActions -->|None| SaveAction{Save action?}
    SaveAction -->|Cancel| ConfirmCancel{Confirm cancel?}
    ConfirmCancel -->|Yes| End2([End])
    ConfirmCancel -->|No| EditFields

    SaveAction -->|Save| Validate{Valid?}
    Validate -->|No| ShowErrors[Display errors]
    ShowErrors --> EditFields

    Validate -->|Yes| RecalcTotals[Recalculate PR totals]
    RecalcTotals --> UpdateDB[(Update database)]
    UpdateDB --> LogActivity[(Log activity)]
    LogActivity --> Success[Display success message]
    Success --> End3([End])
```

---

### 2.4 Create PR with Inventory Context Flow

**Description**: Workflow for creating PR with real-time inventory visibility (on-hand and on-order quantities).

```mermaid
flowchart TD
    Start([Requestor creates PR]) --> FillHeader[Fill header fields]
    FillHeader --> HidePriceChoice{Enable<br/>Hide Price?}
    HidePriceChoice -->|Yes| SetHidePriceTrue[Set hide_price = true]
    HidePriceChoice -->|No| SetHidePriceFalse[Set hide_price = false]
    SetHidePriceTrue --> AddItem[Click Add Item]
    SetHidePriceFalse --> AddItem

    AddItem --> SelectProduct[Select Product]
    SelectProduct --> LoadInventory[Load Inventory Data]

    LoadInventory --> CallInventoryAPI{Inventory API<br/>Available?}
    CallInventoryAPI -->|Yes| FetchOnHand[Fetch on-hand quantity]
    CallInventoryAPI -->|No| DisplayNA[Display N/A]

    FetchOnHand --> FetchOnOrder[Fetch on-order quantity]
    FetchOnOrder --> DisplayInventory[Display inventory with<br/>visual indicators]

    DisplayInventory --> StockCheck{Stock Level?}
    StockCheck -->|Low/Critical| ShowWarning[Show low stock warning]
    StockCheck -->|Healthy| FillItemFields[Fill item fields]
    ShowWarning --> FillItemFields
    DisplayNA --> FillItemFields

    FillItemFields --> HidePriceCheck{hide_price<br/>= true?}
    HidePriceCheck -->|Yes| HidePricingFields[Hide vendor & pricing fields]
    HidePriceCheck -->|No| ShowPricingFields[Show all pricing fields]

    HidePricingFields --> EnterQuantity[Enter quantity, UOM]
    ShowPricingFields --> EnterPricing[Enter vendor, unit price, discount]

    EnterQuantity --> SaveItem[Save Item]
    EnterPricing --> AutoCalc[Auto-calculate net, tax, total]
    AutoCalc --> SaveItem

    SaveItem --> MoreItems{Add more<br/>items?}
    MoreItems -->|Yes| AddItem
    MoreItems -->|No| SubmitPR[Submit PR]

    SubmitPR --> Validation{Valid?}
    Validation -->|No| ShowErrors[Show validation errors]
    ShowErrors --> FillHeader
    Validation -->|Yes| CreatePR[Create PR with inventory snapshot]
    CreatePR --> Workflow[Initiate approval workflow]
    Workflow --> End4([End])
```

---

### 2.5 Create PR with Item Delivery Details Flow

**Description**: Workflow for adding item-specific delivery metadata (comment, required date, delivery point).

```mermaid
flowchart TD
    Start([Add new item]) --> StandardFields[Fill standard item fields]
    StandardFields --> ExpandDetails{Expand<br/>Item Details?}

    ExpandDetails -->|Yes| ShowMetadata[Show metadata fields]
    ExpandDetails -->|No| SaveWithoutMetadata[Save without metadata]

    ShowMetadata --> EnterComment[Enter Comment<br/>optional, max 500 chars]
    EnterComment --> CharCount{Length > 500?}
    CharCount -->|Yes| ShowLengthError[Show character limit error]
    ShowLengthError --> EnterComment
    CharCount -->|No| SelectDate[Select Required Date<br/>optional]

    SelectDate --> DateCheck{Date in past?}
    DateCheck -->|Yes| ShowDateError[Show date validation error]
    ShowDateError --> SelectDate
    DateCheck -->|No| SelectDeliveryPoint[Select Delivery Point<br/>optional dropdown]

    SelectDeliveryPoint --> LoadDP[Load active delivery points<br/>filtered by department]
    LoadDP --> DPSelected{Delivery point<br/>selected?}

    DPSelected -->|Yes| AutoPopLabel[Auto-populate<br/>delivery_point_label]
    DPSelected -->|No| NoDP[delivery_point = NULL]

    AutoPopLabel --> SaveItem[Save Item with metadata]
    NoDP --> SaveItem
    SaveWithoutMetadata --> SaveItem

    SaveItem --> MoreItems{Add more<br/>items?}
    MoreItems -->|Yes| Start
    MoreItems -->|No| ReviewItems[Review all items<br/>with delivery summary]
    ReviewItems --> Submit[Submit PR]
    Submit --> End5([End])
```

---

### 2.6 Approve PR with Enhanced Pricing Visibility Flow

**Description**: Approval workflow with full visibility of FOC, pricing breakdown, and delivery details.

```mermaid
flowchart TD
    Start([Approver opens PR]) --> ViewHeader[View PR header]
    ViewHeader --> CheckHidePrice{hide_price<br/>= true?}
    CheckHidePrice -->|Yes| ShowBadge[Show Hide Price indicator badge]
    CheckHidePrice -->|No| NoBadge[No badge]

    ShowBadge --> ViewItems[View PR items table]
    NoBadge --> ViewItems

    ViewItems --> DisplayColumns[Display all columns:<br/>Product, Qty, UOM, FOC,<br/>Vendor, Prices, Calculations,<br/>Delivery Details]

    DisplayColumns --> FOCCheck{FOC items<br/>present?}
    FOCCheck -->|Yes| HighlightFOC[Highlight FOC fields<br/>visible to Approver only]
    FOCCheck -->|No| ReviewPricing[Review pricing breakdown]
    HighlightFOC --> ReviewPricing

    ReviewPricing --> OverrideCheck{Override<br/>amounts?}
    OverrideCheck -->|Yes| ShowOverrideWarning[Highlight override<br/>with calculated comparison]
    OverrideCheck -->|No| ReviewDelivery[Review delivery details]
    ShowOverrideWarning --> ReviewDelivery

    ReviewDelivery --> ViewTotals[View PR totals<br/>in summary panel]
    ViewTotals --> BudgetCheck{Budget<br/>exceeded?}
    BudgetCheck -->|Yes| ShowBudgetWarning[Show budget warning]
    BudgetCheck -->|No| MakeDecision[Make approval decision]
    ShowBudgetWarning --> MakeDecision

    MakeDecision --> Decision{Decision?}
    Decision -->|Approve| AddComment[Optional: Add approval comment]
    Decision -->|Reject| RequireComment[Require rejection comment<br/>min 10 characters]
    Decision -->|Return| RequestRevision[Request revision with comment]

    AddComment --> ConfirmApprove[Confirm approval]
    RequireComment --> ConfirmReject[Confirm rejection]
    RequestRevision --> UpdateStatus2[Update PR status]

    ConfirmApprove --> UpdateStatus[Update PR status<br/>Partially Approved or Approved]
    ConfirmReject --> RejectPR[Set status = Rejected]

    UpdateStatus --> MoreApprovals{More approvals<br/>needed?}
    MoreApprovals -->|Yes| NotifyNext[Notify next approver]
    MoreApprovals -->|No| NotifyRequestor[Notify requestor]

    NotifyNext --> LogAction[Log approval action]
    NotifyRequestor --> LogAction
    RejectPR --> NotifyReject[Notify requestor of rejection]
    NotifyReject --> LogAction
    UpdateStatus2 --> LogAction

    LogAction --> End6([End])
```

---

## 3. Data Flow Diagrams

### 3.1 Level 0 - Context Diagram

```mermaid
flowchart LR
    User([User/Requestor]) -->|Create/Edit PR| PR[Purchase Requests<br/>System]
    Approver([Approver]) -->|Approve/Reject| PR
    PR -->|PR Data| PO[Purchase Orders<br/>System]
    PR -->|Budget Check| Budget[Budget<br/>System]
    PR -->|User Data| User
    PR -->|Approval Status| Approver
    Products[(Product<br/>Master)] -->|Product Info| PR
    Vendors[(Vendor<br/>Master)] -->|Vendor Info| PR
    PR -->|Activity Logs| Audit[(Audit<br/>System)]
```

### 3.2 Level 1 - Main Processes

```mermaid
flowchart TD
    User([User]) -->|PR Input| P1[1.0<br/>Create/Edit PR]
    P1 -->|PR Data| DS1[(PR Database)]

    DS1 -->|PR for Approval| P2[2.0<br/>Approval Workflow]
    Approver([Approver]) -->|Approval Decision| P2
    P2 -->|Updated Status| DS1

    DS1 -->|Approved PR| P3[3.0<br/>Convert to PO]
    P3 -->|PO Data| PO[(PO System)]

    P1 -->|Product Request| Products[(Product Master)]
    Products -->|Product Details| P1

    P2 -->|Approval Notification| Notify[Notification<br/>Service]
    Notify -->|Email/Alert| Approver

    P1 & P2 & P3 -->|Activity Logs| Audit[(Audit Log)]
```

### 3.3 Level 2 - Create PR Process Detail

```mermaid
flowchart TD
    User([User]) -->|Form Input| P11[1.1<br/>Validate Input]
    P11 -->|Valid Data| P12[1.2<br/>Calculate Totals]

    Products[(Products)] -->|Product Info| P12
    Currency[(Currency)] -->|Exchange Rate| P12

    P12 -->|Calculated PR| P13[1.3<br/>Save PR]
    P13 -->|Header Data| DS1[(PR Table)]
    P13 -->|Line Items| DS2[(PR Items Table)]

    P13 -->|PR ID| P14[1.4<br/>Create Approvals]
    ApprovalRules[(Approval<br/>Rules)] -->|Required Stages| P14
    P14 -->|Approval Records| DS3[(Approvals Table)]

    P14 -->|Success| User
```

---

## 4. Sequence Diagrams

### 4.1 Create and Submit Purchase Request

```mermaid
sequenceDiagram
    actor User
    participant UI as PR Form
    participant API as Server Action
    participant DB as Database
    participant Approval as Approval Service
    participant Notify as Notification Service

    User->>UI: Click "New PR"
    UI->>API: Load form defaults
    API->>DB: Fetch user context (dept, location)
    DB-->>API: User data
    API-->>UI: Form with defaults

    User->>UI: Fill PR details
    User->>UI: Add line items

    loop For each item
        User->>UI: Add product
        UI->>API: Validate product
        API->>DB: Check product exists
        DB-->>API: Product details
        API-->>UI: Product validated
    end

    User->>UI: Click "Submit"
    UI->>API: Submit PR data

    API->>API: Validate all fields
    API->>API: Calculate totals

    API->>DB: Begin transaction
    API->>DB: Insert PR header
    DB-->>API: PR ID

    loop For each line item
        API->>DB: Insert PR item
    end

    API->>Approval: Determine approval chain
    Approval->>DB: Fetch approval rules
    DB-->>Approval: Rules for amount/dept
    Approval-->>API: Approval chain

    loop For each approver
        API->>DB: Create approval record
        API->>Notify: Send notification
        Notify-->>API: Notification sent
    end

    API->>DB: Update PR status = 'Submitted'
    API->>DB: Commit transaction
    DB-->>API: Success

    API-->>UI: Success response
    UI-->>User: Display success message
```

### 4.2 Approve Purchase Request

```mermaid
sequenceDiagram
    actor Approver
    participant UI as Approval UI
    participant API as Server Action
    participant DB as Database
    participant Workflow as Workflow Engine
    participant Notify as Notification Service

    Approver->>UI: Open pending PR
    UI->>API: Fetch PR details
    API->>DB: Get PR with items
    DB-->>API: PR data
    API->>DB: Get approval record
    DB-->>API: Approval data
    API-->>UI: Display PR for approval

    Approver->>UI: Review PR
    Approver->>UI: Add comments
    Approver->>UI: Click "Approve"

    UI->>API: Submit approval
    API->>DB: Begin transaction

    API->>DB: Update approval record (status='Approved')
    API->>DB: Set approved_at timestamp

    API->>Workflow: Check if all approvals complete
    Workflow->>DB: Count pending approvals
    DB-->>Workflow: Approval count

    alt All approvals complete
        Workflow-->>API: Fully approved
        API->>DB: Update PR status = 'Approved'
        API->>Notify: Notify PR creator
        Notify->>Approver: Email: PR approved
    else More approvals needed
        Workflow-->>API: Pending next stage
        API->>DB: Get next approver
        DB-->>API: Next approver details
        API->>Notify: Notify next approver
    end

    API->>DB: Log activity
    API->>DB: Commit transaction
    DB-->>API: Success

    API-->>UI: Success response
    UI-->>Approver: Display confirmation
```

### 4.3 Convert PR to Purchase Order

```mermaid
sequenceDiagram
    actor User
    participant UI as PR Detail
    participant API as Server Action
    participant DB as Database
    participant PO as PO Service

    User->>UI: Click "Convert to PO"
    UI->>API: Initiate conversion

    API->>DB: Fetch PR with items
    DB-->>API: PR data

    API->>API: Validate PR status (must be Approved)

    alt PR not approved
        API-->>UI: Error: PR must be approved
        UI-->>User: Display error
    else PR approved
        API->>PO: Create PO from PR

        PO->>PO: Map PR fields to PO
        PO->>DB: Begin transaction
        PO->>DB: Insert PO header
        DB-->>PO: PO ID

        loop For each PR item
            PO->>DB: Insert PO item
        end

        PO->>DB: Create PR-PO link
        PO->>DB: Update PR status = 'Converted'
        PO->>DB: Commit transaction
        DB-->>PO: Success

        PO-->>API: PO created (PO number)
        API-->>UI: Success with PO link
        UI-->>User: Display success + redirect to PO
    end
```

### 4.4 Reject Purchase Request

```mermaid
sequenceDiagram
    actor Approver
    participant UI as Approval UI
    participant API as Server Action
    participant DB as Database
    participant Workflow as Workflow Engine
    participant Notify as Notification Service

    Approver->>UI: Open pending PR
    UI->>API: Fetch PR details
    API->>DB: Get PR with items and approvals
    DB-->>API: PR data
    API-->>UI: Display PR for review

    Approver->>UI: Review PR
    Approver->>UI: Click "Reject"
    UI->>Approver: Show rejection dialog
    Approver->>UI: Enter rejection reason (min 10 chars)
    Approver->>UI: Click "Confirm Rejection"

    UI->>API: Submit rejection
    API->>API: Validate reason length

    alt Reason too short
        API-->>UI: Error: Reason required (min 10 chars)
        UI-->>Approver: Display validation error
    else Reason valid
        API->>DB: Begin transaction

        API->>DB: Update approval record
        Note over DB: status='Rejected'<br/>rejected_at=now<br/>comments=reason

        API->>DB: Update PR status = 'Rejected'

        API->>Workflow: Cancel other pending approvals
        Workflow->>DB: Update all pending approvals to 'Cancelled'
        DB-->>Workflow: Approvals cancelled

        API->>DB: Log activity
        Note over DB: Log: PR rejected by [approver]<br/>with reason

        API->>Notify: Send rejection notification to creator
        Notify-->>API: Notification sent

        API->>DB: Commit transaction
        DB-->>API: Success

        API-->>UI: Success response
        UI-->>Approver: Display confirmation

        Note over Notify: Email sent to PR creator<br/>with rejection reason<br/>and instructions to edit
    end
```

---

## 5. State Diagrams

### 5.1 Purchase Request Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create new PR

    Draft --> Submitted: Submit for approval
    Draft --> Cancelled: Cancel draft
    Draft --> [*]: Delete

    Submitted --> Approved: All approvals complete
    Submitted --> Rejected: Any approval rejected
    Submitted --> Draft: Recall/Edit
    Submitted --> Cancelled: Cancel request

    Rejected --> Draft: Edit and resubmit
    Rejected --> Cancelled: Cancel
    Rejected --> [*]: Archive

    Approved --> Converted: Create PO
    Approved --> Cancelled: Cancel approved PR

    Converted --> [*]: Archive after retention period
    Cancelled --> [*]: Archive after retention period

    note right of Draft
        Editable by creator
        No approvals required
    end note

    note right of Submitted
        Read-only
        Awaiting approvals
        Can be recalled
    end note

    note right of Approved
        Read-only
        Ready for PO conversion
    end note

    note right of Rejected
        Read-only
        Can be edited and resubmitted
    end note

    note right of Converted
        Read-only
        Linked to PO
        Cannot be modified
    end note
```

### 5.2 Approval Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: PR submitted

    Pending --> Approved: Approver approves
    Pending --> Rejected: Approver rejects
    Pending --> Skipped: Auto-skip (delegated/absent)
    Pending --> Recalled: Creator recalls PR

    Approved --> [*]: Process complete
    Rejected --> [*]: Process terminated
    Skipped --> [*]: Moved to next stage
    Recalled --> [*]: PR back to draft

    note right of Pending
        Awaiting approver action
        Notifications sent
        Reminders active
    end note

    note right of Approved
        Timestamp recorded
        Comments saved
        Next stage triggered
    end note

    note right of Rejected
        Reason required
        PR status updated
        Creator notified
    end note
```

---

## 6. Workflow Diagrams

### 6.1 Multi-Stage Sequential Approval Workflow

**Description**: Sequential approval flow where each stage must approve before proceeding to the next stage. The number of stages and specific approvers are determined by the workflow engine configuration.

```mermaid
flowchart TD
    Start([PR Submitted]) --> GetRules[(Query Workflow Engine:<br/>pr_type + amount + dept)]
    GetRules --> BuildChain[Build approval chain<br/>from workflow config]
    BuildChain --> Stage1[Stage 1 Approver<br/>processes PR]

    Stage1 --> Decision1{Stage 1<br/>Decision?}
    Decision1 -->|Reject| Rejected[PR Status = Rejected]
    Rejected --> NotifyCreator1[Notify creator with reason]
    NotifyCreator1 --> End1([End])

    Decision1 -->|Approve| CheckMore{More stages<br/>required?}

    CheckMore -->|No| Approved[PR Status = Approved]
    Approved --> NotifyCreator2[Notify creator]
    NotifyCreator2 --> End2([End])

    CheckMore -->|Yes| Stage2[Stage 2 Approver<br/>processes PR]
    Stage2 --> Decision2{Stage 2<br/>Decision?}
    Decision2 -->|Reject| Rejected
    Decision2 -->|Approve| CheckMore2{More stages<br/>required?}

    CheckMore2 -->|No| Approved
    CheckMore2 -->|Yes| Stage3[Stage 3 Approver<br/>processes PR]

    Stage3 --> Decision3{Stage 3<br/>Decision?}
    Decision3 -->|Reject| Rejected
    Decision3 -->|Approve| Approved

    style Stage1 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Stage2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Stage3 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style GetRules fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Approved fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

**Note**: The workflow engine determines:
- How many stages are required
- Which roles are assigned to each stage
- Whether approval proceeds to next stage or completes

### 6.2 Parallel Approval Workflow

```mermaid
flowchart TD
    Start([PR Submitted]) --> Split{Amount ><br/>$25,000 AND<br/>Type = Asset?}

    Split -->|No| Sequential[Sequential approval]
    Sequential --> Stage1[Department Manager]
    Stage1 --> End1([End])

    Split -->|Yes| Parallel[Parallel approval required]
    Parallel --> Fork[Split]

    Fork --> Path1[Path 1: Department Manager]
    Fork --> Path2[Path 2: Asset Manager]
    Fork --> Path3[Path 3: Finance Manager]

    Path1 --> Check1{Approved?}
    Path2 --> Check2{Approved?}
    Path3 --> Check3{Approved?}

    Check1 -->|No| Rejected[PR Rejected]
    Check2 -->|No| Rejected
    Check3 -->|No| Rejected

    Check1 -->|Yes| Join[All must approve]
    Check2 -->|Yes| Join
    Check3 -->|Yes| Join

    Join --> AllApproved{All<br/>approved?}
    AllApproved -->|Yes| Approved[PR Approved]
    AllApproved -->|No| Wait[Wait for all]
    Wait --> Join

    Approved --> End2([End])
    Rejected --> End3([End])
```

---

## 7. System Integration Diagrams

### 7.1 Budget System Integration

```mermaid
flowchart LR
    PR[Purchase Request<br/>System] -->|Check budget| Budget[Budget<br/>System]
    Budget -->|Budget available| PR
    Budget -->|Insufficient funds| PR

    PR -->|Reserve funds| Budget
    Budget -->|Funds reserved| PR

    PR -->|Release funds<br/>(rejected)| Budget
    Budget -->|Funds released| PR

    PR -->|Commit funds<br/>(converted to PO)| Budget
    Budget -->|Funds committed| PR

    style PR fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Budget fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
```

### 7.2 Product Master Integration

```mermaid
flowchart TD
    User([User]) -->|Search product| PR[PR Form]
    PR -->|Query| PM[Product Master<br/>API]
    PM -->|Product list| PR

    User -->|Select product| PR
    PR -->|Get details| PM
    PM -->|Product details:<br/>- Description<br/>- UOM<br/>- Last price<br/>- Preferred vendor| PR

    PR -->|Display in form| User
    User -->|Add to PR| PR
```

### 7.3 Approval Notification Flow

```mermaid
flowchart TD
    PR[PR System] -->|Approval needed| Queue[Message Queue]
    Queue -->|Process| Notify[Notification<br/>Service]

    Notify -->|Check preferences| UserPref[(User<br/>Preferences)]
    UserPref -->|Email enabled| Email[Email<br/>Service]
    UserPref -->|SMS enabled| SMS[SMS<br/>Service]
    UserPref -->|In-app enabled| InApp[In-App<br/>Notification]

    Email -->|Send email| Approver([Approver])
    SMS -->|Send SMS| Approver
    InApp -->|Push notification| Approver

    Notify -->|Log notification| Log[(Notification<br/>Log)]
```

---

## 8. Swimlane Diagrams

### 8.1 End-to-End PR Process

```mermaid
flowchart TD
    subgraph Requestor
        R1[Create PR]
        R2[Submit PR]
        R7[Receive approval notification]
        R8[Convert to PO]
    end

    subgraph System
        S1[Validate input]
        S2[Save PR]
        S3[Determine approval chain]
        S4[Send notifications]
        S5[Update status]
        S6[Log activity]
    end

    subgraph "Department Manager"
        D1[Receive notification]
        D2[Review PR]
        D3[Approve/Reject]
    end

    subgraph "Finance Manager"
        F1[Receive notification]
        F2[Review PR]
        F3[Approve/Reject]
    end

    R1 --> S1
    S1 --> S2
    R2 --> S3
    S3 --> S4
    S4 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> S5
    S5 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> S6
    S6 --> R7
    R7 --> R8
```

### 8.2 Multi-Level Approval Workflow with Decision Points

```mermaid
flowchart LR
    subgraph Requestor [👤 Requestor]
        direction TB
        R1[Create PR]
        R2[Fill details &<br/>add items]
        R3{Save action?}
        R4[Submit for<br/>Approval]
        R10[Receive<br/>notification]
        R11{Next action?}
        R12[Edit & Resubmit]
    end

    subgraph System [⚙️ System]
        direction TB
        S1[Validate PR]
        S2[Save as Draft]
        S3[Determine<br/>Approval Chain]
        S4[Create approval<br/>records]
        S5[Update status<br/>to Submitted]
        S6[Send<br/>notifications]
        S9{All approvals<br/>complete?}
        S10[Update to<br/>Approved]
        S11[Update to<br/>Rejected]
    end

    subgraph DeptMgr [👔 Department Manager]
        direction TB
        D1[Receive<br/>notification]
        D2[Review PR]
        D3{Decision?}
        D4[Approve]
        D5[Reject]
    end

    subgraph FinMgr [💼 Finance Manager]
        direction TB
        F1[Receive<br/>notification]
        F2[Review PR &<br/>Budget]
        F3{Decision?}
        F4[Approve]
        F5[Reject]
    end

    subgraph GenMgr [🎩 General Manager]
        direction TB
        G1[Receive<br/>notification]
        G2[Review PR]
        G3{Decision?}
        G4[Approve]
        G5[Reject]
    end

    subgraph Purchasing [🛒 Purchasing Staff]
        direction TB
        P1[Receive<br/>notification]
        P2[Convert<br/>to PO]
        P3[Send to<br/>vendor]
    end

    %% Flow connections
    R1 --> R2
    R2 --> R3
    R3 -->|Save Draft| S2
    R3 -->|Submit| R4
    R4 --> S1
    S1 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> S6

    S6 --> D1
    D1 --> D2
    D2 --> D3
    D3 -->|Approve| D4
    D3 -->|Reject| D5
    D5 --> S11
    S11 --> R10

    D4 --> S9
    S9 -->|Next Stage: Finance| F1
    F1 --> F2
    F2 --> F3
    F3 -->|Approve| F4
    F3 -->|Reject| F5
    F5 --> S11
    F4 --> S9

    S9 -->|Next Stage: GM| G1
    G1 --> G2
    G2 --> G3
    G3 -->|Approve| G4
    G3 -->|Reject| G5
    G5 --> S11
    G4 --> S9

    S9 -->|All Approvals Complete| S10
    S10 --> P1
    P1 --> P2
    P2 --> P3

    R10 --> R11
    R11 -->|Edit| R12
    R12 --> R2

    style System fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Requestor fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style DeptMgr fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style FinMgr fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style GenMgr fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Purchasing fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

## 9. Decision Trees

### 9.1 Workflow Engine Approval Determination

**Description**: Dynamic approval routing based on workflow engine configuration, not hardcoded decision trees.

```mermaid
flowchart TD
    Start([PR Submitted]) --> ExtractParams[Extract Parameters:<br/>- pr_type from template<br/>- total_amount calculated<br/>- department from user]

    ExtractParams --> QueryEngine[Query Workflow Engine]
    QueryEngine --> LookupRules[(Lookup approval_rules table)]

    LookupRules --> MatchCriteria[Match rules WHERE:<br/>pr_type matches<br/>AND amount in range<br/>AND dept matches or NULL]

    MatchCriteria --> CheckMatch{Rule<br/>found?}

    CheckMatch -->|No| NoWorkflow[Error: No workflow configured<br/>for this combination]
    NoWorkflow --> End1([Submission Failed])

    CheckMatch -->|Yes| GetRule[Get matching rule:<br/>- approval_sequence<br/>- approver_roles<br/>- thresholds<br/>- workflow_type]

    GetRule --> CheckWorkflowType{Workflow<br/>Type?}

    CheckWorkflowType -->|Auto-Approve| AutoApprove[Set status = Approved<br/>No approvers needed]
    AutoApprove --> End2([Auto-Approved])

    CheckWorkflowType -->|Sequential| BuildSequential[Build sequential chain:<br/>1. Stage 1 approver<br/>2. Stage 2 approver if needed<br/>3. Stage 3 approver if needed]
    BuildSequential --> CreateRecords1[Create approval records<br/>with sequence numbers]
    CreateRecords1 --> Notify1[Notify first approver only]
    Notify1 --> End3([Approval Chain Created])

    CheckWorkflowType -->|Parallel| BuildParallel[Build parallel chain:<br/>Multiple approvers at once]
    BuildParallel --> CreateRecords2[Create approval records<br/>with same sequence number]
    CreateRecords2 --> Notify2[Notify all parallel approvers]
    Notify2 --> End4([Approval Chain Created])

    CheckWorkflowType -->|Hybrid| BuildHybrid[Build hybrid chain:<br/>Sequential stages with<br/>parallel approvers per stage]
    BuildHybrid --> CreateRecords3[Create approval records<br/>with stage + sequence]
    CreateRecords3 --> Notify3[Notify first stage approvers]
    Notify3 --> End5([Approval Chain Created])

    style QueryEngine fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style LookupRules fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style CheckMatch fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style NoWorkflow fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style AutoApprove fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

**Workflow Configuration Note**:

Approval routing is entirely determined by rules configured in the workflow engine. The workflow engine evaluates:
- **PR Type** (from selected template: Market List, Standard Order, Fixed Asset)
- **Total Amount** (calculated from line items)
- **Department** (from requestor context)

Based on these parameters, the workflow engine:
1. Queries the `approval_rules` table for matching configuration
2. Returns the configured approval sequence (sequential, parallel, or hybrid)
3. Identifies required approver roles and stages
4. Handles auto-approve scenarios if configured

**No amount thresholds are hardcoded** - all approval logic is data-driven and configurable by administrators through the workflow engine.

### 9.2 Status Transition Logic

```mermaid
flowchart TD
    Start([User Action]) --> CurrentStatus{Current<br/>Status?}

    CurrentStatus -->|Draft| DraftActions{Action?}
    DraftActions -->|Submit| CheckValid{Valid?}
    CheckValid -->|Yes| ToSubmitted[Status = Submitted]
    CheckValid -->|No| StayDraft[Stay in Draft]
    DraftActions -->|Cancel| ToCancelled[Status = Cancelled]
    DraftActions -->|Delete| DeletePR[Delete record]

    CurrentStatus -->|Submitted| SubmitActions{Action?}
    SubmitActions -->|Approve all| ToApproved[Status = Approved]
    SubmitActions -->|Reject any| ToRejected[Status = Rejected]
    SubmitActions -->|Recall| ToDraft[Status = Draft]

    CurrentStatus -->|Approved| ApproveActions{Action?}
    ApproveActions -->|Convert| ToConverted[Status = Converted]
    ApproveActions -->|Cancel| ToCancelled

    CurrentStatus -->|Rejected| RejectActions{Action?}
    RejectActions -->|Edit| ToDraft
    RejectActions -->|Cancel| ToCancelled

    CurrentStatus -->|Converted| NoAction[Read-only<br/>No actions allowed]
    CurrentStatus -->|Cancelled| NoAction
```

---

## 10. Activity Diagrams

### 10.1 Concurrent Item Processing

```mermaid
flowchart TD
    Start([Save PR with 5 items]) --> Fork[Split]

    Fork --> Item1[Process Item 1]
    Fork --> Item2[Process Item 2]
    Fork --> Item3[Process Item 3]
    Fork --> Item4[Process Item 4]
    Fork --> Item5[Process Item 5]

    Item1 --> V1[Validate]
    Item2 --> V2[Validate]
    Item3 --> V3[Validate]
    Item4 --> V4[Validate]
    Item5 --> V5[Validate]

    V1 --> C1[Calculate]
    V2 --> C2[Calculate]
    V3 --> C3[Calculate]
    V4 --> C4[Calculate]
    V5 --> C5[Calculate]

    C1 --> S1[Save]
    C2 --> S2[Save]
    C3 --> S3[Save]
    C4 --> S4[Save]
    C5 --> S5[Save]

    S1 --> Join[Synchronize]
    S2 --> Join
    S3 --> Join
    S4 --> Join
    S5 --> Join

    Join --> UpdateTotals[Update PR totals]
    UpdateTotals --> End([End])
```

### 10.2 Batch Approval Processing

```mermaid
flowchart TD
    Start([Approver selects multiple PRs]) --> CheckAll{All PRs<br/>valid?}

    CheckAll -->|No| ShowError[Show validation errors]
    ShowError --> End1([End])

    CheckAll -->|Yes| ConfirmBatch{Confirm<br/>batch action?}
    ConfirmBatch -->|No| End2([End])

    ConfirmBatch -->|Yes| BeginTx[Begin transaction]
    BeginTx --> ProcessLoop[For each PR]

    ProcessLoop --> ValidatePR{PR can be<br/>approved?}
    ValidatePR -->|No| SkipPR[Skip this PR]
    ValidatePR -->|Yes| ApprovePR[Approve PR]

    ApprovePR --> UpdateStatus[Update status]
    UpdateStatus --> LogActivity[Log activity]
    LogActivity --> QueueNotify[Queue notification]

    SkipPR --> MorePRs{More PRs?}
    QueueNotify --> MorePRs

    MorePRs -->|Yes| ProcessLoop
    MorePRs -->|No| CommitTx[Commit transaction]

    CommitTx --> SendNotifications[Send all notifications]
    SendNotifications --> ShowResults[Display results summary]
    ShowResults --> End3([End])
```

---

## 11. Error Handling Flows

### 11.1 PR Submission Error Handling

```mermaid
flowchart TD
    Start([Submit PR]) --> TrySubmit{Try submit}

    TrySubmit -->|Success| UpdateStatus[Update status]
    UpdateStatus --> End1([Success])

    TrySubmit -->|Validation Error| ValidError[Validation failed]
    ValidError --> ShowValidation[Show field errors]
    ShowValidation --> AllowFix[Allow user to fix]
    AllowFix --> Retry1{Retry?}
    Retry1 -->|Yes| TrySubmit
    Retry1 -->|No| End2([Cancelled])

    TrySubmit -->|Database Error| DBError[Database error]
    DBError --> Rollback[Rollback transaction]
    Rollback --> LogError1[Log error details]
    LogError1 --> CheckRetry{Transient<br/>error?}
    CheckRetry -->|Yes| Retry2[Retry with backoff]
    Retry2 --> TrySubmit
    CheckRetry -->|No| ShowDBError[Show user-friendly error]
    ShowDBError --> End3([Error])

    TrySubmit -->|Network Error| NetError[Network timeout]
    NetError --> LogError2[Log error]
    LogError2 --> RetryPrompt{Retry?}
    RetryPrompt -->|Yes| TrySubmit
    RetryPrompt -->|No| End4([Error])

    TrySubmit -->|Approval Service Error| ApprError[Approval service down]
    ApprError --> SaveDraft[Save as draft instead]
    SaveDraft --> NotifyAdmin[Notify admin]
    NotifyAdmin --> ShowWarning[Show warning to user]
    ShowWarning --> End5([Saved as draft])
```

### 11.2 Concurrent Edit Conflict Resolution

```mermaid
flowchart TD
    Start([User saves changes]) --> CheckVersion{Version<br/>matches?}

    CheckVersion -->|Yes| SaveChanges[Save changes]
    SaveChanges --> IncrementVersion[Increment version]
    IncrementVersion --> End1([Success])

    CheckVersion -->|No| Conflict[Conflict detected]
    Conflict --> FetchLatest[Fetch latest version]
    FetchLatest --> ShowConflict[Show conflict dialog]

    ShowConflict --> UserChoice{User choice?}
    UserChoice -->|Discard mine| UseTheirs[Use latest version]
    UseTheirs --> End2([Changes discarded])

    UserChoice -->|Keep mine| Merge{Can auto-merge?}
    Merge -->|Yes| AutoMerge[Merge changes]
    AutoMerge --> SaveMerged[Save merged version]
    SaveMerged --> End3([Merged success])

    Merge -->|No| ManualMerge[Show manual merge UI]
    ManualMerge --> UserResolves[User resolves conflicts]
    UserResolves --> SaveResolved[Save resolved version]
    SaveResolved --> End4([Conflict resolved])

    UserChoice -->|Cancel| End5([Cancelled])
```

---

## 12. Performance Optimization Flows

### 12.1 Lazy Loading PR List

```mermaid
flowchart TD
    Start([User opens PR list]) --> InitialLoad[Load first page<br/>20 records]
    InitialLoad --> Display1[Display with skeleton]

    Display1 --> ScrollCheck{User scrolls<br/>near bottom?}
    ScrollCheck -->|No| Wait[Wait]
    Wait --> ScrollCheck

    ScrollCheck -->|Yes| LoadMore[Load next page]
    LoadMore --> AppendData[Append to list]
    AppendData --> Display2[Update display]

    Display2 --> MoreData{More data<br/>available?}
    MoreData -->|Yes| ScrollCheck
    MoreData -->|No| ShowEnd[Show - End of list]
    ShowEnd --> End([End])
```

### 12.2 Caching Strategy

```mermaid
flowchart TD
    Start([Request PR data]) --> CheckCache{Data in<br/>cache?}

    CheckCache -->|Yes| ValidCache{Cache<br/>valid?}
    ValidCache -->|Yes| ReturnCache[Return cached data]
    ReturnCache --> End1([Fast response])

    ValidCache -->|No| InvalidateCache[Invalidate cache]
    InvalidateCache --> FetchDB

    CheckCache -->|No| FetchDB[Fetch from database]
    FetchDB --> StoreCache[Store in cache]
    StoreCache --> ReturnData[Return data]
    ReturnData --> End2([Slower response])

    UpdateEvent([Data updated]) --> InvalidateRelated[Invalidate related caches]
    InvalidateRelated --> End3([Cache invalidated])
```

---

## 13. Related Documents

- **Business Requirements**: [BR-purchase-requests.md](./BR-purchase-requests.md)
- **Use Cases**: [UC-purchase-requests.md](./UC-purchase-requests.md)
- **Technical Specification**: [TS-purchase-requests.md](./TS-purchase-requests.md)
- **Data Definition**: [DS-purchase-requests.md](./DS-purchase-requests.md)
- **Validations**: [VAL-purchase-requests.md](./VAL-purchase-requests.md)

---

**Document Control**:
- **Created**: 2025-01-30
- **Author**: System Architect
- **Reviewed By**: Development Lead, Business Analyst
- **Next Review**: 2025-04-30
