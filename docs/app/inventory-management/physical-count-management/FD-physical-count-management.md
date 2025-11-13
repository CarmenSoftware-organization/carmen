# Flow Diagrams: Physical Count Management

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Physical Count Management
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

This document provides visual representations of the processes, data flows, state transitions, and system interactions for the Physical Count Management sub-module. These diagrams illustrate how inventory counting sessions are created, items are counted, variances are calculated, and inventory adjustments are posted. The flows support scheduled physical counts and spot checks with comprehensive audit trails and workflow management.

**Key Processes Documented**:
- Count session creation and initialization
- Item-by-item counting and variance calculation
- Count session completion and review
- High-variance investigation and approval
- Integration with inventory transaction system
- Status workflow and state transitions

**Related Documents**:
- [Business Requirements](./BR-physical-count-management.md)
- [Use Cases](./UC-physical-count-management.md)
- [Technical Specification](./TS-physical-count-management.md)
- [Data Definition](./DD-physical-count-management.md)
- [Validations](./VAL-physical-count-management.md)

---

## Diagram Index

| Diagram | Type | Purpose | Complexity |
|---------|------|---------|------------|
| [High-Level Process Flow](#high-level-process-flow) | Process | End-to-end count session lifecycle | Medium |
| [Create Count Session](#detailed-process-flow-create-count-session) | Process | Count session creation process | Low |
| [Enter Count Quantities](#detailed-process-flow-enter-count-quantities) | Process | Item counting and variance calculation | Medium |
| [Complete Count Session](#detailed-process-flow-complete-count-session) | Process | Count completion and adjustment posting | High |
| [Data Flow Diagram](#data-flow-diagram) | Data | Data movement through system | Medium |
| [Sequence Diagram - Full Count](#sequence-diagram---create-and-complete-count) | Interaction | Component interactions | High |
| [State Diagram](#state-diagram) | State | Count session status transitions | Medium |
| [Integration Flow](#system-integration-flow) | Integration | Inventory system integration | High |
| [Component Interaction](#component-interaction-diagram) | Architecture | Frontend-backend component interaction | Medium |
| [Error Handling Flow](#error-handling-flow) | Error | Error detection and recovery | Medium |

---

## Process Flow

### High-Level Process Flow

**Purpose**: End-to-end business process for conducting physical inventory counts and reconciling system records with actual on-hand quantities

**Actors**:
- Storekeeper (creates and performs count)
- Supervisor (reviews high-variance counts)
- System (calculates variance, posts adjustments)
- Inventory Transaction System (provides expected quantities)

**Trigger**:
- Scheduled periodic count (weekly/monthly)
- Ad-hoc spot check (after delivery, suspected shrinkage)
- Manager initiates count for location

```mermaid
flowchart TD
    Start([Storekeeper initiates<br/>physical count]) --> CreateSession[Create count session<br/>for location]
    CreateSession --> LoadProducts[Load products for counting<br/>from inventory system]
    LoadProducts --> RetrieveExpected[Retrieve expected quantities<br/>from closing balance]

    RetrieveExpected --> CountItems[Storekeeper counts items<br/>one by one]
    CountItems --> EnterActual[Enter actual quantities<br/>for each product]
    EnterActual --> CalcVariance{Calculate variance<br/>for each item}

    CalcVariance --> CheckComplete{All items<br/>counted?}
    CheckComplete -->|No| CountItems
    CheckComplete -->|Yes| ReviewVariances[Review aggregate variance]

    ReviewVariances --> HighVariance{High variance<br/>detected?}

    HighVariance -->|Yes| SupervisorReview[Send to supervisor<br/>for review]
    SupervisorReview --> InvestigateReason[Investigate variance reason]
    InvestigateReason --> ApproveCount{Supervisor<br/>approves?}
    ApproveCount -->|No| Recount[Re-count high<br/>variance items]
    Recount --> EnterActual
    ApproveCount -->|Yes| PostAdjustment[Post inventory adjustment]

    HighVariance -->|No| PostAdjustment
    PostAdjustment --> UpdateClosingBalance[Update inventory<br/>closing balance]
    UpdateClosingBalance --> NotifyUsers[/Notify relevant users/]
    NotifyUsers --> CompleteSession([Count session<br/>completed])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style CompleteSession fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style CreateSession fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style CountItems fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CalcVariance fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style SupervisorReview fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style PostAdjustment fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Recount fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Start**: Storekeeper initiates physical count for a specific location (e.g., Main Kitchen)
2. **Create Session**: System creates count session record with pending status, captures location, date, counter
3. **Load Products**: System identifies all products expected at the location from inventory transaction system
4. **Retrieve Expected**: System retrieves expected quantities from closing balance for each product
5. **Count Items**: Storekeeper physically counts items in storage location
6. **Enter Actual**: Storekeeper enters actual counted quantities into system for each product
7. **Calculate Variance**: System calculates variance (actual - expected) and variance percentage for each item
8. **Check Complete**: System verifies all items have been counted (is_counted = true)
   - If not complete: Continue counting remaining items
   - If complete: Proceed to variance review
9. **Review Variances**: System calculates aggregate variance statistics (total variance value, high variance item count)
10. **High Variance**: System checks if variance exceeds threshold (>5% or >$500)
    - If high variance: Route to supervisor for approval
    - If acceptable variance: Proceed to adjustment posting
11. **Supervisor Review**: Supervisor reviews count results and variance explanations
12. **Investigate Reason**: Supervisor investigates cause of high variance (theft, spoilage, counting error)
13. **Approve Count**: Supervisor makes decision to approve or reject count
    - If rejected: Re-count required for high-variance items
    - If approved: Proceed to adjustment posting
14. **Re-count**: Storekeeper re-counts flagged items and re-enters quantities
15. **Post Adjustment**: System creates inventory adjustment transaction to correct system quantities
16. **Update Closing Balance**: Inventory transaction system updates closing balance to match actual counts
17. **Notify Users**: System sends notifications to storekeeper (completion), supervisor (approval if needed), manager (high variance report)
18. **Complete Session**: Count session status updated to 'completed', session locked from further editing

**Exception Handling**:
- **Database failure during count**: Auto-save draft, allow resume from last saved state
- **Network timeout during adjustment posting**: Retry with exponential backoff, alert if fails after 3 attempts
- **Validation errors (negative quantities)**: Display error immediately, prevent progression until corrected
- **Unexpected product found (not in system)**: Allow ad-hoc product addition with supervisor approval
- **Count abandoned**: System flags as incomplete after 24 hours, sends reminder to storekeeper and supervisor

---

### Detailed Process Flow: Create Count Session

**Purpose**: Detailed view of count session creation process, including location selection, product list generation, and expected quantity retrieval

```mermaid
flowchart TD
    Start([Storekeeper clicks<br/>"New Count"]) --> SelectLocation[Select location<br/>from dropdown]
    SelectLocation --> CheckActiveCount{Active count<br/>exists for<br/>location?}

    CheckActiveCount -->|Yes| ErrorActive[Display error:<br/>Only one active count<br/>per location]
    ErrorActive --> SelectLocation

    CheckActiveCount -->|No| SelectType[Select count type:<br/>Physical or Spot Check]
    SelectType --> EnterDetails[Enter description,<br/>notes, target date]
    EnterDetails --> ValidateForm{Form<br/>valid?}

    ValidateForm -->|No| ShowErrors[Display validation errors]
    ShowErrors --> EnterDetails

    ValidateForm -->|Yes| CreateSession[Create count session<br/>in database]
    CreateSession --> GenerateNumber[Generate count number<br/>CNT-YYYY-NNNN]
    GenerateNumber --> SetPending[Set status = 'pending']
    SetPending --> SaveAudit[Save audit fields<br/>created_by, created_at]

    SaveAudit --> QueryProducts{Count<br/>type?}
    QueryProducts -->|Physical| LoadAllProducts[Query ALL products<br/>for location]
    QueryProducts -->|Spot Check| SelectProducts[User selects specific<br/>products to count]

    LoadAllProducts --> CreateDetailLines[Create detail line<br/>for each product]
    SelectProducts --> CreateDetailLines
    CreateDetailLines --> RetrieveExpected[Call Inventory Transaction<br/>System API]
    RetrieveExpected --> GetClosingBalance[Get closing balance<br/>for each product]
    GetClosingBalance --> PopulateExpected[Populate expected_qty<br/>in detail lines]

    PopulateExpected --> SaveDetails[(Save all detail lines<br/>to database)]
    SaveDetails --> DisplaySession[Display count session<br/>with product list]
    DisplaySession --> Success([Session created<br/>successfully])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style ErrorActive fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ShowErrors fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CreateSession fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style SaveDetails fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RetrieveExpected fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
```

**Decision Points**:

| Decision | Criteria | Outcome |
|----------|----------|---------|
| Active count exists | Query tb_count_stock WHERE location_id = selected AND doc_status IN ('pending', 'in_progress') | Block creation / Allow creation |
| Form valid | All required fields populated, location selected, type chosen | Continue / Show errors |
| Count type | User selection: Physical or Spot Check | Load all products / User selects products |
| Expected quantity retrieval | API call to inventory transaction system for closing balance | Populate expected_qty / Handle error |

**Expected Outcomes**:
- Count session created with unique count number (CNT-2024-0015)
- Status = 'pending'
- All products for location loaded as detail lines (physical count) OR selected products loaded (spot check)
- Expected quantities populated from closing balance
- Session ready for storekeeper to begin counting

---

### Detailed Process Flow: Enter Count Quantities

**Purpose**: Process for entering actual counted quantities item by item, calculating variance, and flagging discrepancies

```mermaid
flowchart TD
    Start([Storekeeper starts<br/>counting session]) --> ChangeStatus[Click "Start Count"<br/>Status = 'in_progress']
    ChangeStatus --> SelectItem[Select product from list<br/>to count]
    SelectItem --> PhysicalCount[Physically count items<br/>in storage location]
    PhysicalCount --> EnterQuantity[Enter actual quantity<br/>in input field]

    EnterQuantity --> ValidateQty{Quantity<br/>valid?}
    ValidateQty -->|No| QtyError[Display error:<br/>Must be >= 0]
    QtyError --> EnterQuantity

    ValidateQty -->|Yes| CalcVariance[Calculate variance:<br/>actual - expected]
    CalcVariance --> CalcPct[Calculate variance %:<br/>variance / expected * 100]
    CalcPct --> CheckThreshold{Variance %<br/>> 5%?}

    CheckThreshold -->|Yes| FlagHighVariance[Flag as high variance<br/>highlight in red]
    CheckThreshold -->|No| NormalVariance[Display in normal color]

    FlagHighVariance --> PromptNote[Prompt for notes:<br/>Explain variance reason]
    PromptNote --> EnterNotes[User enters notes<br/>optionally]
    EnterNotes --> MarkCounted

    NormalVariance --> MarkCounted[Mark item as counted<br/>is_counted = true]
    MarkCounted --> SaveLine[(Save detail line<br/>to database)]
    SaveLine --> UpdateProgress[Update progress:<br/>X of Y items counted]

    UpdateProgress --> CheckAllCounted{All items<br/>counted?}
    CheckAllCounted -->|No| SelectItem
    CheckAllCounted -->|Yes| CalcAggregateVariance[Calculate aggregate variance:<br/>total variance value]
    CalcAggregateVariance --> DisplaySummary[Display count summary:<br/>total items, variance count]
    DisplaySummary --> EnableComplete[Enable "Complete Count"<br/>button]
    EnableComplete --> Success([Counting complete,<br/>ready to finalize])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style QtyError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style FlagHighVariance fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CalcVariance fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style SaveLine fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Decision Points**:

| Decision | Criteria | Outcome |
|----------|----------|---------|
| Quantity valid | actual_qty >= 0 (cannot be negative) | Continue / Show error |
| Variance threshold | ABS(variance_pct) > 5% | Flag high variance / Normal |
| All items counted | COUNT(*) WHERE is_counted = true = Total detail lines | Enable complete button / Continue counting |

**Calculations**:
- **Variance Quantity**: `actual_qty - expected_qty` (can be negative for shortages, positive for overages)
- **Variance Percentage**: `(variance_qty / expected_qty) * 100` (percentage of expected quantity)
- **Aggregate Variance**: `SUM(variance_qty * unit_cost)` (monetary value of total variance)

**Progress Tracking**:
- Display: "15 of 52 items counted (29%)"
- Visual progress bar updated in real-time
- Uncounted items highlighted for attention

---

### Detailed Process Flow: Complete Count Session

**Purpose**: Process for finalizing count session, reviewing variances, obtaining approval if needed, and posting inventory adjustments

```mermaid
flowchart TD
    Start([Storekeeper clicks<br/>"Complete Count"]) --> ValidateComplete{All items<br/>counted?}

    ValidateComplete -->|No| ErrorIncomplete[Display error:<br/>Must count all items<br/>before completing]
    ErrorIncomplete --> CountRemaining([Return to counting])

    ValidateComplete -->|Yes| CalcAggregateVariance[Calculate aggregate:<br/>total variance value,<br/>high variance count]
    CalcAggregateVariance --> CheckHighVariance{High variance?<br/>value > $500 OR<br/>count > 3 items}

    CheckHighVariance -->|Yes| SetPendingApproval[Set requires_approval = true<br/>in info JSON]
    SetPendingApproval --> NotifySupervisor[/Send notification to<br/>supervisor for review/]
    NotifySupervisor --> WaitApproval[Wait for supervisor<br/>approval]
    WaitApproval --> SupervisorReview{Supervisor<br/>decision?}

    SupervisorReview -->|Reject| RequestRecount[Notify storekeeper:<br/>Re-count required]
    RequestRecount --> FlagItems[Flag high-variance items<br/>for recount]
    FlagItems --> CountRemaining

    SupervisorReview -->|Approve| LogApproval[Log approval in<br/>workflow_history]
    LogApproval --> ProceedToPost

    CheckHighVariance -->|No| ProceedToPost[Proceed to<br/>adjustment posting]

    ProceedToPost --> BeginTransaction[BEGIN TRANSACTION]
    BeginTransaction --> CreateAdjustments[Create adjustment<br/>transactions for<br/>each variance]
    CreateAdjustments --> PostToLedger[Post adjustments to<br/>inventory transaction ledger]
    PostToLedger --> UpdateClosingBalance[Update closing balance<br/>for each product]
    UpdateClosingBalance --> MarkPosted[Mark adjustments as posted<br/>adjustment_posted = true]

    MarkPosted --> SetComplete[Set count session<br/>status = 'completed']
    SetComplete --> SetEndDate[Set end_date = NOW()]
    SetEndDate --> LogWorkflow[Append to workflow_history:<br/>completion event]
    LogWorkflow --> CommitTransaction[COMMIT TRANSACTION]

    CommitTransaction --> NotifyComplete[/Send notifications:<br/>storekeeper, supervisor,<br/>manager/]
    NotifyComplete --> DisplaySuccess[Display success message<br/>with variance summary]
    DisplaySuccess --> Success([Count session<br/>completed and locked])

    BeginTransaction -.->|Error| RollbackTransaction[ROLLBACK TRANSACTION]
    RollbackTransaction --> ErrorPosting[Display error:<br/>Adjustment posting failed]
    ErrorPosting --> RetryOption[Offer retry option]
    RetryOption --> ProceedToPost

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style CountRemaining fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style ErrorIncomplete fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ErrorPosting fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style NotifySupervisor fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CreateAdjustments fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CommitTransaction fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

**Decision Points**:

| Decision | Criteria | Outcome |
|----------|----------|---------|
| All items counted | COUNT(*) WHERE is_counted = false = 0 | Proceed / Block completion |
| High variance | total_variance_value > $500 OR high_variance_items > 3 | Require approval / Auto-complete |
| Supervisor decision | Approve / Reject count results | Proceed to posting / Request recount |
| Transaction success | All DB operations succeed | Commit / Rollback |

**Transaction Steps** (All-or-Nothing):
1. Create adjustment transaction records (tb_inventory_transaction)
2. Post adjustment entries to inventory ledger
3. Update closing balance (tb_inventory_transaction_closing_balance)
4. Mark detail lines as adjustment_posted = true
5. Update count session status to 'completed'
6. Set end_date timestamp
7. Append completion event to workflow_history

**Notifications Sent**:
- **Storekeeper**: Count completed successfully, variance summary
- **Supervisor**: Count completed (if approved), high variance report
- **Manager**: High variance alert (if exceeds threshold), completion summary
- **Finance**: Adjustment posted notice (if variance > $1000)

---

## Data Flow Diagram

### Level 0: Context Diagram

**Purpose**: Physical Count Management system in context with external entities and systems

```mermaid
flowchart LR
    Storekeeper([Storekeeper]) -->|Creates count,<br/>enters quantities| PCM{Physical Count<br/>Management<br/>System}
    Supervisor([Supervisor]) -->|Reviews and<br/>approves| PCM
    Manager([Manager]) -->|Views reports,<br/>initiates counts| PCM

    PCM -->|Notifications| Storekeeper
    PCM -->|Approval requests| Supervisor
    PCM -->|High variance alerts| Manager

    PCM <-->|Read/Write<br/>count data| DB[(Carmen<br/>Database)]

    PCM <-->|Get expected quantities<br/>Post adjustments| ITS[Inventory<br/>Transaction<br/>System]

    PCM -->|Send notifications| NS[Notification<br/>Service]

    PCM -->|Export variance reports| RS[Reporting<br/>Module]

    style Storekeeper fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Supervisor fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Manager fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style PCM fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style DB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ITS fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style NS fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style RS fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

**External Entities**:
- **Storekeeper**: End users who create count sessions and enter actual quantities
- **Supervisor**: Users who review and approve high-variance counts
- **Manager**: Users who view reports and initiate periodic counts
- **Database**: PostgreSQL database storing count session and detail data
- **Inventory Transaction System**: Provides expected quantities and receives adjustment postings
- **Notification Service**: Sends email/SMS notifications to users
- **Reporting Module**: Generates variance analysis and trend reports

---

### Level 1: System Decomposition

**Purpose**: Major processes and data stores within Physical Count Management system

```mermaid
flowchart TD
    subgraph "Physical Count Management System"
        P1[1.0<br/>Manage Count Sessions]
        P2[2.0<br/>Enter Count Quantities]
        P3[3.0<br/>Calculate Variance]
        P4[4.0<br/>Review & Approve]
        P5[5.0<br/>Post Adjustments]
        P6[6.0<br/>Send Notifications]

        DS1[(D1: Count Stock<br/>tb_count_stock)]
        DS2[(D2: Count Detail<br/>tb_count_stock_detail)]
        DS3[(D3: Audit Log)]
    end

    Storekeeper([Storekeeper]) -->|Count session data| P1
    P1 -->|Session created| DS1
    P1 -->|Trigger| P2

    Storekeeper -->|Actual quantities| P2
    P2 -->|Detail lines| DS2
    P2 -->|Trigger| P3

    P3 <-->|Read expected,<br/>Calculate variance| DS2
    P3 -->|High variance flag| P4

    Supervisor([Supervisor]) <-->|Review & decision| P4
    P4 <-->|Workflow status| DS1
    P4 -->|Approved| P5

    P5 <-->|Read variance data| DS2
    P5 -->|Post adjustment| ITS[Inventory<br/>Transaction<br/>System]
    P5 -->|Update status| DS1
    P5 -->|Log events| DS3
    P5 -->|Trigger| P6

    P6 -->|Notifications| Storekeeper
    P6 -->|Notifications| Supervisor
    P6 -->|Notifications| Manager([Manager])

    style Storekeeper fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Supervisor fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Manager fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style P1 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style P3 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style P4 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style P5 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style P6 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style DS1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DS2 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DS3 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ITS fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

**Data Stores**:
- **D1: Count Stock (tb_count_stock)**: Count session header data (location, date, status, aggregate variance)
- **D2: Count Detail (tb_count_stock_detail)**: Line-level count data (product, expected, actual, variance)
- **D3: Audit Log**: All system events, changes, and user actions for compliance

**Processes**:
1. **1.0 Manage Count Sessions**: Create, update, delete count sessions; enforce business rules (one active count per location)
2. **2.0 Enter Count Quantities**: Capture actual counted quantities, validate inputs, mark items as counted
3. **3.0 Calculate Variance**: Compute variance quantity and percentage, flag high-variance items, calculate aggregates
4. **4.0 Review & Approve**: Route high-variance counts for supervisor review, capture approval decisions, manage workflow
5. **5.0 Post Adjustments**: Create and post inventory adjustment transactions to correct system quantities
6. **6.0 Send Notifications**: Send notifications to relevant users based on events (creation, completion, approval)

---

## Sequence Diagram - Create and Complete Count

### Full Count Lifecycle Sequence

**Purpose**: Time-ordered sequence of interactions for creating and completing a full physical count session

**Scenario**: Storekeeper creates monthly physical count for Main Kitchen, counts all items, system posts adjustments

```mermaid
sequenceDiagram
    actor Storekeeper
    participant UI as User Interface
    participant API as Server Actions
    participant Service as Business Logic
    participant DB as Database
    participant ITS as Inventory Transaction<br/>System
    participant Queue as Message Queue

    %% Create Count Session
    Storekeeper->>UI: Click "New Physical Count"
    UI->>UI: Open create count form
    Storekeeper->>UI: Select location: Main Kitchen<br/>Type: Physical<br/>Click Submit
    UI->>API: createCountSession(data)

    API->>Service: validateCountSession(data)
    Service->>DB: Check active count for location
    DB-->>Service: No active count found
    Service->>Service: Validate business rules

    Service->>DB: BEGIN TRANSACTION
    Service->>DB: INSERT INTO tb_count_stock<br/>(generate count_stock_no,<br/>status = 'pending')
    DB-->>Service: Return count session id

    Service->>ITS: GET /api/products/by-location?location_id=...
    ITS-->>Service: Return product list (52 products)

    Service->>Service: For each product,<br/>get expected qty from<br/>closing balance
    Service->>ITS: GET /api/closing-balance/bulk?product_ids=...
    ITS-->>Service: Return expected quantities

    Service->>DB: INSERT INTO tb_count_stock_detail<br/>(52 detail lines with<br/>expected_qty)
    Service->>DB: COMMIT
    DB-->>Service: Success

    Service-->>API: Return session with products
    API-->>UI: 201 Created
    UI-->>Storekeeper: Display count session<br/>CNT-2024-0015<br/>52 products ready to count

    %% Start Counting
    Storekeeper->>UI: Click "Start Count"
    UI->>API: startCountSession(session_id)
    API->>DB: UPDATE tb_count_stock<br/>SET doc_status = 'in_progress',<br/>start_date = NOW()
    DB-->>API: Success
    API-->>UI: Status updated
    UI-->>Storekeeper: Count started,<br/>begin entering quantities

    %% Enter Quantities (simplified - showing 1 item)
    loop For each product
        Storekeeper->>UI: Enter actual quantity: 43.00 kg<br/>for Chicken Breast
        UI->>API: enterCountQuantities(session_id, [{<br/>product_id, actual_qty: 43.00}])
        API->>Service: processCountEntry(data)
        Service->>DB: SELECT expected_qty FROM<br/>tb_count_stock_detail<br/>WHERE product_id = ...
        DB-->>Service: expected_qty = 45.00

        Service->>Service: Calculate variance:<br/>variance_qty = 43 - 45 = -2.00<br/>variance_pct = -4.44%
        Service->>DB: UPDATE tb_count_stock_detail<br/>SET actual_qty = 43.00,<br/>variance_qty = -2.00,<br/>variance_pct = -4.44,<br/>is_counted = true
        DB-->>Service: Success
        Service-->>API: Variance calculated
        API-->>UI: Item counted (15 of 52)
        UI-->>Storekeeper: Progress: 29%<br/>Variance: -2.00 kg (-4.44%)
    end

    %% Complete Count
    Storekeeper->>UI: Click "Complete Count"
    UI->>API: completeCountSession(session_id)
    API->>Service: validateAndComplete(session_id)

    Service->>DB: Check all items counted:<br/>SELECT COUNT(*) WHERE<br/>is_counted = false
    DB-->>Service: 0 uncounted items

    Service->>DB: Calculate aggregate variance:<br/>SUM(variance_qty * unit_cost)
    DB-->>Service: Total variance: -$350.50<br/>High variance items: 2

    Service->>Service: Check high variance:<br/>$350.50 < $500 AND 2 < 3<br/>No approval needed

    Service->>DB: BEGIN TRANSACTION

    loop For each variance
        Service->>DB: INSERT INTO tb_inventory_transaction<br/>(type = 'adjustment',<br/>product_id, quantity = variance_qty)
        Service->>ITS: POST /api/adjustments<br/>(adjustment data)
        ITS-->>Service: Adjustment posted,<br/>closing balance updated
        Service->>DB: UPDATE tb_count_stock_detail<br/>SET adjustment_posted = true,<br/>adjustment_transaction_id = ...
    end

    Service->>DB: UPDATE tb_count_stock<br/>SET doc_status = 'completed',<br/>end_date = NOW(),<br/>info = {total_variance: -350.50}
    Service->>DB: COMMIT
    DB-->>Service: Success

    Service->>Queue: Publish CountCompleted event
    Service-->>API: Count completed
    API-->>UI: 200 OK
    UI-->>Storekeeper: Count CNT-2024-0015 completed!<br/>Total variance: -$350.50<br/>Adjustments posted

    Queue->>Queue: Process CountCompleted
    Queue->>Storekeeper: Email: Count completed
    Queue->>Supervisor: Email: Monthly count completed
    Queue->>Manager: Email: Variance report
```

**Key Interactions**:

1. **UI → API**: Frontend calls server actions (createCountSession, enterCountQuantities, completeCountSession)
2. **API → Service**: Server actions delegate to business service for validation and processing
3. **Service → DB**: Service executes database transactions (count session, detail lines, adjustments)
4. **Service → ITS**: Service integrates with Inventory Transaction System for product list, expected quantities, adjustment posting
5. **Service → Queue**: Service publishes events for async notification processing
6. **Queue → Users**: Background job sends email notifications to relevant parties

**Timing Considerations**:
- **Synchronous operations**: Steps 1-5 (count creation < 2 seconds, variance calculation < 500ms)
- **Asynchronous operations**: Notification sending (background, < 30 seconds)
- **Long-running operations**: Counting process (user-paced, typically 2-8 hours for physical count)

---

## State Diagram

### Count Session State Transitions

**Purpose**: Document all possible states and valid transitions for a count session throughout its lifecycle

**Entity**: Count Stock Session (tb_count_stock)

```mermaid
stateDiagram-v2
    [*] --> Pending: Create count session

    Pending --> InProgress: Start counting
    Pending --> Cancelled: Cancel before starting
    Pending --> [*]: Delete (soft delete)

    InProgress --> Completed: Complete count<br/>(all items counted,<br/>adjustment posted)
    InProgress --> Cancelled: Cancel during counting
    InProgress --> Pending: Pause/save draft

    Completed --> Voided: Void completed count<br/>(manager only,<br/>within 24 hours)

    Cancelled --> [*]: Archive
    Voided --> [*]: Archive
    Completed --> [*]: Archive after 12 months

    note right of Pending
        Initial state
        Can edit location, date
        Can add/remove products
    end note

    note right of InProgress
        Counting active
        Can enter quantities
        Cannot edit header
        Auto-save progress
    end note

    note right of Completed
        Count finalized
        Immutable data
        Adjustments posted
        Closing balance updated
    end note

    note right of Cancelled
        Count abandoned
        No adjustments posted
        Reason required
    end note

    note right of Voided
        Count invalidated
        Reverse adjustments
        Re-count required
    end note
```

**State Definitions**:

| State | Description | Can Transition To | Entry Actions | Exit Actions |
|-------|-------------|-------------------|---------------|--------------|
| Pending | Count session created, not started | In Progress, Cancelled, Deleted | Set status = 'pending', Generate count_stock_no, Load products | Validate at least 1 product |
| In Progress | Counting underway, quantities being entered | Completed, Cancelled, Pending (pause) | Set status = 'in_progress', Set start_date = NOW() | Verify progress saved |
| Completed | Count finalized, adjustments posted | Voided (within 24h) | Set status = 'completed', Set end_date = NOW(), Post adjustments, Update closing balance, Lock editing | Send completion notifications |
| Cancelled | Count abandoned before completion | Archived | Set status = 'cancelled', Require cancellation reason | Release resources |
| Voided | Completed count invalidated | Archived | Set status = 'voided', Reverse adjustments, Restore previous closing balance | Send void notifications, Require re-count |

**Transition Rules**:

1. **Pending → In Progress**:
   - Requires: At least 1 product in count session, location accessible to user, no other active count at location
   - Validation: Check product list loaded, verify expected quantities retrieved

2. **In Progress → Completed**:
   - Requires: ALL items marked as counted (is_counted = true for all detail lines), variance calculations complete
   - Validation: Check all expected quantities populated, verify variance calculations correct, confirm adjustment transactions created

3. **In Progress → Cancelled**:
   - Requires: Cancellation reason provided, user has permission (creator or supervisor)
   - Validation: Confirm no adjustments posted, verify cancellation authorized

4. **Completed → Voided**:
   - Requires: Manager permission, within 24 hours of completion, void reason provided
   - Validation: Check time window, verify manager authorization, confirm adjustments reversible

5. **Pending → Cancelled**:
   - Requires: Cancellation reason, user has permission
   - Validation: Confirm no counting started, verify authorization

**State Guards** (Conditions):

**Can Start Counting**:
- **Condition Name**: Can Start Count
- **Description**: Count session can only be started if it is in pending status and has products loaded
- **Required Checks**:
  - Count session status must be 'pending'
  - At least 1 product must be in detail lines
  - Expected quantities must be populated for all products
  - No other count session with status 'in_progress' exists for same location
- **Implementation**: System validates these conditions before allowing status transition to 'in_progress'

**Can Complete Count**:
- **Condition Name**: Can Complete
- **Description**: Count session can only be completed if all items counted and variance calculated
- **Required Checks**:
  - Count session status must be 'in_progress'
  - All detail lines must have is_counted = true
  - All detail lines must have actual_qty populated (not NULL)
  - All detail lines must have variance_qty and variance_pct calculated
- **Implementation**: System checks completeness before allowing status transition to 'completed'

**Can Void Count**:
- **Condition Name**: Can Void
- **Description**: Completed count can be voided by manager within 24-hour window
- **Required Checks**:
  - Count session status must be 'completed'
  - User must have 'manager' role or permission
  - Completion time must be within 24 hours (NOW() - end_date < 24 hours)
  - Void reason must be provided
  - Adjustments must be reversible (no dependent transactions)
- **Implementation**: System verifies user permissions, time window, and adjustment reversibility before allowing void

---

## System Integration Flow

### Inventory Transaction System Integration

**Purpose**: Integration with Inventory Transaction System for retrieving expected quantities and posting adjustments

**Systems Involved**:
- **Internal System**: Physical Count Management
- **External System**: Inventory Transaction System (ITS)
- **Integration Method**: REST API over HTTPS

```mermaid
flowchart TD
    subgraph "Physical Count Management"
        A[Count Session Created] --> B[Prepare Product List]
        B --> C[Authenticate with ITS]
        C --> D{Authentication}
        D -->|Success| E[Get OAuth Token]
        D -->|Failure| F[Retry Auth]
        F --> C

        E --> G[Request Expected Quantities]
        G --> H[Send GET Request<br/>/api/closing-balance/bulk]
        H --> I{ITS Response}

        I -->|200 OK| J[Process Response Data]
        I -->|429 Rate Limited| K[Wait & Retry]
        I -->|500 Server Error| L[Retry Logic]
        I -->|404 Not Found| M[Handle Missing Products]

        K --> H
        L -->|Retry 1-3| H
        L -->|Max Retries| N[Alert & Log Error]

        J --> O[Populate Expected Quantities]
        O --> P[Save to Detail Lines]

        M --> O1[Set expected_qty = 0<br/>for missing products]
        O1 --> P

        %% Adjustment Posting Flow
        P --> Q[User Completes Count]
        Q --> R[Calculate Variance]
        R --> S[Prepare Adjustment Payload]
        S --> T[Send POST Request<br/>/api/adjustments]
        T --> U{ITS Response}

        U -->|201 Created| V[Update Closing Balance]
        U -->|400 Bad Request| W[Validation Error]
        U -->|500 Server Error| X[Retry Posting]

        V --> Y[Mark Adjustment Posted]
        Y --> Z[Complete Count Session]

        W --> N
        X -->|Retry 1-3| T
        X -->|Max Retries| N

        N --> AA[Manual Intervention Required]
    end

    subgraph "Inventory Transaction System"
        B1[Receive GET Request] --> B2[Validate Auth Token]
        B2 --> B3[Query Closing Balance<br/>for Products]
        B3 --> B4[Return Expected Quantities]

        B5[Receive POST Request] --> B6[Validate Adjustment Data]
        B6 --> B7[Create Adjustment Txns]
        B7 --> B8[Update Closing Balance]
        B8 --> B9[Return Success]
    end

    H -.->|HTTPS| B1
    B4 -.->|JSON| I

    T -.->|HTTPS| B5
    B9 -.->|JSON| U

    style A fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style C fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style E fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style F fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style K fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style L fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style N fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style P fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style V fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Z fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style AA fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
```

**Integration Points**:

1. **Authentication**: OAuth 2.0 token-based authentication with ITS
   - Token endpoint: `POST /oauth/token`
   - Grant type: client_credentials
   - Token expiration: 1 hour
   - Refresh: Automatic token refresh before expiration

2. **Get Expected Quantities**:
   - Endpoint: `GET /api/closing-balance/bulk`
   - Request format: Query parameters `?location_id=xxx&product_ids=yyy,zzz`
   - Response format: JSON array `[{product_id, expected_qty, unit_id, as_of_date}]`
   - Timeout: 30 seconds
   - Retry policy: 3 retries with exponential backoff (1s, 2s, 4s)

3. **Post Adjustments**:
   - Endpoint: `POST /api/adjustments`
   - Request format: JSON payload `{count_stock_id, adjustments: [{product_id, quantity, reason}]}`
   - Response format: JSON `{adjustment_batch_id, adjustments: [{id, product_id, transaction_id}]}`
   - Timeout: 60 seconds (batch operation)
   - Retry policy: 3 retries with exponential backoff (2s, 4s, 8s)

4. **Error Handling**:
   - **400 Bad Request**: Validation error, display error message to user, no retry
   - **401 Unauthorized**: Authentication failure, refresh token and retry once
   - **404 Not Found**: Product not found in closing balance, set expected_qty = 0, log warning
   - **429 Rate Limited**: Wait for rate limit window, retry with exponential backoff
   - **500 Server Error**: ITS internal error, retry up to 3 times, alert if all fail
   - **Network Timeout**: Retry up to 3 times, log error, alert administrator

5. **Fallback Strategy**:
   - If expected quantities unavailable: Allow user to manually enter expected quantities from physical records
   - If adjustment posting fails: Save adjustment data locally, retry background job, manual posting as last resort
   - If ITS completely unavailable: Continue count session, queue adjustments for posting when ITS recovers

**Request/Response Examples**:

**Get Expected Quantities Request**:
```
GET /api/closing-balance/bulk?location_id=440e8400-...&product_ids=660e8400-...,661e8400-...
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Get Expected Quantities Response**:
```json
[
  {
    "product_id": "660e8400-...",
    "product_code": "CHKN-BRST-1KG",
    "expected_qty": 45.00,
    "unit_id": "unit-kg",
    "as_of_date": "2024-01-15T00:00:00Z"
  },
  {
    "product_id": "661e8400-...",
    "product_code": "TOM-SAUCE-5L",
    "expected_qty": 120.00,
    "unit_id": "unit-liters",
    "as_of_date": "2024-01-15T00:00:00Z"
  }
]
```

**Post Adjustments Request**:
```
POST /api/adjustments
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "count_stock_id": "550e8400-...",
  "count_stock_no": "CNT-2024-0015",
  "location_id": "440e8400-...",
  "adjustment_date": "2024-01-15T14:30:00Z",
  "adjustments": [
    {
      "product_id": "660e8400-...",
      "quantity": -2.00,
      "reason": "count_variance",
      "notes": "2 kg shortage found, likely due to unrecorded kitchen usage"
    },
    {
      "product_id": "661e8400-...",
      "quantity": 5.00,
      "reason": "count_variance",
      "notes": "Found 1 unreceived case"
    }
  ]
}
```

**Post Adjustments Response**:
```json
{
  "adjustment_batch_id": "770e8400-...",
  "count_stock_id": "550e8400-...",
  "adjustments": [
    {
      "id": "adj-001",
      "product_id": "660e8400-...",
      "transaction_id": "txn-12345",
      "closing_balance_before": 45.00,
      "closing_balance_after": 43.00
    },
    {
      "id": "adj-002",
      "product_id": "661e8400-...",
      "transaction_id": "txn-12346",
      "closing_balance_before": 120.00,
      "closing_balance_after": 125.00
    }
  ],
  "posted_at": "2024-01-15T14:30:15Z"
}
```

---

## Component Interaction Diagram

### Frontend-Backend Interaction for Count Entry

**Purpose**: Show how frontend and backend components interact during count quantity entry

```mermaid
flowchart LR
    subgraph Frontend
        UI[React Component<br/>CountDetailForm]
        Store[Zustand Store<br/>countStore]
        Hook[React Hook Form<br/>+ Zod Validation]
    end

    subgraph Backend
        SA[Server Action<br/>enterCountQuantities]
        BL[Business Logic<br/>CountService]
        DB[(PostgreSQL<br/>Database)]
    end

    subgraph External
        ITS[Inventory Transaction<br/>System]
    end

    UI -->|User enters quantity| Hook
    Hook -->|Validate input| Hook
    Hook -->|Invalid| UI
    Hook -->|Valid| Store
    Store -->|Update local state| UI
    UI -->|Call server action| SA
    SA -->|Delegate to service| BL
    BL -->|Read expected_qty| DB
    BL -->|Calculate variance| BL
    BL -->|Save actual_qty,<br/>variance_qty| DB
    DB -->|Return updated line| BL
    BL -->|Return result| SA
    SA -->|Return to client| Store
    Store -->|Update UI state| UI
    UI -->|Display variance| UI

    BL -.->|Get expected qty<br/>(if not cached)| ITS
    ITS -.->|Return closing balance| BL

    style UI fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Store fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Hook fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style SA fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style BL fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style DB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ITS fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

**Component Responsibilities**:

1. **React Component (CountDetailForm)**:
   - Display count entry form with product list
   - Capture user input (actual quantities)
   - Display variance calculations in real-time
   - Show progress (items counted / total items)

2. **Zustand Store (countStore)**:
   - Manage client-side count session state
   - Cache count session data, detail lines, variance summaries
   - Synchronize state across components
   - Handle optimistic updates for better UX

3. **React Hook Form + Zod**:
   - Client-side form validation (required fields, quantity >= 0)
   - Type-safe form data with TypeScript
   - Display validation errors inline
   - Prevent invalid submissions

4. **Server Action (enterCountQuantities)**:
   - Receive count data from client
   - Authenticate user and authorize operation
   - Delegate to business logic service
   - Return result or error to client

5. **Business Logic (CountService)**:
   - Retrieve expected_qty from database or ITS
   - Calculate variance_qty (actual - expected)
   - Calculate variance_pct ((variance / expected) * 100)
   - Update detail line with actual quantities and variance
   - Validate business rules (count not completed, item not already counted)

6. **Database**:
   - Persist count session and detail line data
   - Provide ACID transaction guarantees
   - Enforce referential integrity and constraints

**Data Flow**:
1. User enters quantity → Hook validates → Store updates local state
2. Store calls server action → Server action delegates to service
3. Service reads expected quantity → Calculates variance → Saves to database
4. Database returns updated line → Service returns result → Store updates
5. Store updates UI → User sees variance displayed

---

## Error Handling Flow

### Error Processing and Recovery Flow

**Purpose**: Document how errors are detected, classified, handled, and recovered during count operations

```mermaid
flowchart TD
    Start[Count Operation Start] --> Try{Try Operation}

    Try -->|Success| Success([Operation Complete])
    Try -->|Error| Classify{Error Type}

    Classify -->|Validation Error| E1[Return Validation Errors<br/>to User]
    Classify -->|Network/ITS Error| E2{Retryable?}
    Classify -->|Business Rule Error| E3[Return Business Error<br/>to User]
    Classify -->|Database Error| E4{Transaction?}
    Classify -->|System Error| E5[Log & Alert Admin]

    E2 -->|Yes| Retry{Retry Count<br/>< Max (3)?}
    E2 -->|No| E5

    Retry -->|Yes| Wait[Wait with<br/>Exponential Backoff<br/>1s, 2s, 4s]
    Retry -->|No| E5

    Wait --> Try

    E4 -->|Yes| Rollback[ROLLBACK Transaction]
    E4 -->|No| E5

    Rollback --> LogRollback[Log Rollback Event]
    LogRollback --> E5

    E1 --> UserCorrect[User Corrects Input]
    UserCorrect --> Try

    E3 --> UserAction[User Takes Action<br/>based on Rule]
    UserAction --> Try

    E5 --> SaveState[Save Current State<br/>to Recovery Store]
    SaveState --> NotifyAdmin[/Notify Administrator/]
    NotifyAdmin --> ManualFix[Manual Intervention<br/>or Data Recovery]

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style E1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style E3 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style E5 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Wait fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Rollback fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style UserCorrect fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style ManualFix fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
```

**Error Categories and Handling**:

**1. Validation Errors** (Client-side and Server-side):
- **Examples**: Negative quantity entered, required field missing, invalid format
- **Detection**: React Hook Form validation (client), Zod schema validation (server)
- **Handling**: Display inline error messages to user, prevent submission
- **Recovery**: User corrects input, resubmits form
- **No retry**: User must fix validation errors

**2. Network/ITS Integration Errors**:
- **Examples**: Connection timeout, rate limiting (429), ITS server error (500)
- **Detection**: HTTP status codes, timeout exceptions
- **Handling**: Classify as retryable or non-retryable
- **Recovery**: Retry with exponential backoff (1s, 2s, 4s) up to 3 times
- **Fallback**: If all retries fail, log error, alert admin, allow manual intervention

**3. Business Rule Errors**:
- **Examples**: Active count already exists for location, count already completed, item already counted
- **Detection**: Business logic validation in CountService
- **Handling**: Return user-friendly error message with guidance
- **Recovery**: User takes action based on rule (e.g., cancel existing count first, use different location)
- **No retry**: Business rule violations require user action

**4. Database Errors**:
- **Examples**: Transaction deadlock, connection pool exhausted, constraint violation
- **Detection**: Database exceptions, SQL error codes
- **Handling**: If within transaction, rollback; log error details
- **Recovery**: Retry once after brief delay (transaction may succeed on retry)
- **Fallback**: If retry fails, log error, alert admin, display generic error to user

**5. System Errors** (Unexpected):
- **Examples**: Out of memory, file system full, unhandled exception
- **Detection**: Try-catch blocks, uncaught exception handlers
- **Handling**: Log full error details (stack trace, context), save current state
- **Recovery**: Alert administrator immediately, attempt to save user's progress
- **Fallback**: Display apology message to user, provide support contact

**Error Response Format** (Server Actions):
```typescript
// Success response
{
  success: true,
  data: { ... },
  message: "Count quantity saved successfully"
}

// Error response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Quantity must be greater than or equal to zero",
    field: "actual_qty",
    details: { ... }
  }
}
```

**Retry Strategy**:
- **Attempt 1**: Immediate retry (0s delay)
- **Attempt 2**: 1 second delay
- **Attempt 3**: 2 seconds delay
- **Attempt 4**: 4 seconds delay
- **Max Attempts**: 3 retries (4 total attempts)
- **Exponential Backoff**: 2^(attempt - 1) seconds
- **Jitter**: Add random 0-500ms to prevent thundering herd

**Recovery Mechanisms**:
- **Auto-save**: Count session auto-saved every 30 seconds or after each quantity entered
- **Session recovery**: If user closes browser, can resume count session on next login
- **Optimistic updates**: UI updates immediately, reverts if server action fails
- **Idempotency**: Server actions designed to be safely retried (upsert instead of insert)

---

## Glossary

- **Actor**: Entity (user, system) that interacts with the process (Storekeeper, Supervisor, Manager, Inventory Transaction System)
- **Decision Point**: Point where flow branches based on conditions (e.g., high variance check, all items counted check)
- **Fork/Join**: Parallel processing split and synchronization (not used in physical count flow, sequential process)
- **Guard**: Condition that must be true for state transition (e.g., can only complete if all items counted)
- **State**: Distinct condition or stage in count session lifecycle (Pending, In Progress, Completed, Cancelled, Voided)
- **Transition**: Movement from one state to another (e.g., Pending → In Progress when counting starts)
- **Variance**: Discrepancy between expected and actual quantities, can be shortage (negative) or overage (positive)
- **Expected Quantity**: System's theoretical on-hand quantity from inventory transaction closing balance
- **Actual Quantity**: Physically counted quantity verified by storekeeper during count process
- **Aggregate Variance**: Sum of all line-level variances, typically expressed as monetary value (quantity × unit cost)
- **High Variance Threshold**: Percentage or absolute value threshold above which variance requires supervisor approval (default: 5% or $500)
- **Closing Balance**: Theoretical on-hand quantity at end of day from inventory transaction ledger
- **Adjustment Posting**: Creating inventory transaction to correct system quantity to match physical count result

---

## Diagram Conventions

### Notation Guide

**Flowchart Symbols**:
- **Rectangle**: Process step (e.g., "Calculate Variance")
- **Diamond**: Decision point (e.g., "All items counted?")
- **Circle/Rounded Rectangle**: Start/End point (e.g., "Count Session Completed")
- **Parallelogram**: Input/Output (e.g., "User enters quantity")
- **Cylinder**: Database (e.g., "Save to database")
- **Cloud/Rectangle with shadow**: External system (e.g., "Inventory Transaction System")

**Arrow Styles**:
- **Solid**: Direct flow (normal process progression)
- **Dashed**: Asynchronous or callback (e.g., ITS API response)
- **Thick**: Primary happy path
- **Thin**: Alternative or error path

**Colors** (used in diagrams):
- **Blue (#cce5ff)**: Start points, user actions
- **Green (#ccffcc)**: Success end points, completed states
- **Red (#ffcccc)**: Error end points, rejected states, critical actions
- **Yellow/Orange (#ffe0b3)**: Processing steps, calculations, important decisions
- **Purple (#e0ccff)**: Database operations, external integrations
- **Gray (#e8e8e8)**: Standard process steps, neutral actions

---

## Tools Used

- **Mermaid**: Primary diagramming tool (renders in markdown, version controlled)
- **Mermaid Flowchart**: Process flows, data flows, decision trees
- **Mermaid Sequence Diagram**: Interaction sequences, API calls
- **Mermaid State Diagram**: Status lifecycle, state transitions

---

## Maintenance

### Update Triggers
- Process changes: New workflow steps added, existing steps modified
- New features added: Additional count types, approval workflows, integration points
- Business rules modified: Variance thresholds changed, status transitions updated
- System integrations changed: New ITS endpoints, authentication method changed
- State transitions updated: New statuses added, transition rules modified

### Review Schedule
- **Monthly**: Quick review for changes (during sprint retrospective)
- **Quarterly**: Comprehensive review (align with major releases)
- **On Change**: Immediate update for major changes (within 1 week of implementation)

---

## Related Documents

- [Business Requirements](./BR-physical-count-management.md)
- [Use Cases](./UC-physical-count-management.md)
- [Technical Specification](./TS-physical-count-management.md)
- [Data Definition](./DD-physical-count-management.md)
- [Validations](./VAL-physical-count-management.md)

---

**Document End**

> 📝 **Note to Authors**:
> - Keep diagrams simple and focused on key flows
> - Use consistent notation throughout all diagrams
> - Update diagrams immediately when process changes
> - Include legend for any custom symbols not in standard Mermaid
> - Export diagrams as images for presentations if needed
> - Maintain source Mermaid code in this markdown file for version control
> - Review with stakeholders for accuracy before finalizing
> - Test diagram rendering in target markdown viewers
