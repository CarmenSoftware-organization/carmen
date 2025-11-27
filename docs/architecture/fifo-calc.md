# FIFO Inventory Calculation Business Logic

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

This document visualizes the comprehensive business logic for inventory management using the First-In, First-Out (FIFO) costing method. The system is built on three core pillars:
- **Immutable transaction logging**
- **Definitive costing sequence**
- **Systematic Reversal & Correction mechanism**

## Core Data Architecture

```mermaid
erDiagram
    tb_inventory_transaction ||--o{ tb_inventory_transaction_detail : contains
    tb_inventory_transaction_detail ||--o{ tb_inventory_transaction_closing_balance : creates
    tb_inventory_transaction {
        int id PK
        string source_doc_id
        string type "GRN|Issue|Adjustment"
        date transaction_date
        timestamp system_timestamp
        int costing_sequence "Definitive order"
        string status "Original|Reversal|Correction"
        int original_transaction_id FK
    }
    tb_inventory_transaction_detail {
        int id PK
        int inventory_transaction_id FK
        int product_id FK
        int location_id FK
        decimal qty "Positive for receipts"
        decimal unit_cost
    }
    tb_inventory_transaction_closing_balance {
        int id PK
        int product_id FK
        int location_id FK
        int source_transaction_detail_id FK
        date received_date
        decimal original_qty
        decimal remaining_qty
        decimal unit_cost "Landed cost"
        string status "Active|Consumed|Reversed"
    }
    tb_inventory_period_balance {
        int product_id PK
        int location_id PK
        int accounting_period_id PK
        decimal ending_qty
        decimal ending_value
    }
    tb_inventory_locks {
        int product_id PK
        int location_id PK
        timestamp lock_timestamp
        int user_id
    }
```

## Process A: Receiving Stock (GRN)

### Initial Receipt Process

```mermaid
flowchart TD
    Start([GRN Received]) --> CalcCost[Calculate Total Landed Cost<br/>Purchase Price - Discounts<br/>+ Pro-rated Costs + Taxes]
    CalcCost --> CreateHeader[Create Transaction Header<br/>Status = 'Original'<br/>Assign Next Costing Sequence]
    CreateHeader --> CheckRounding{Unit Cost has<br/>Non-terminating<br/>Decimal?}
    
    CheckRounding -->|Yes| SplitLayers[Split into Multiple Layers<br/>Adjust last unit by ±$0.01<br/>to match exact total]
    CheckRounding -->|No| SingleLayer[Create Single Layer]
    
    SplitLayers --> CreateDetails[Create Transaction Details<br/>One per Layer]
    SingleLayer --> CreateDetails
    
    CreateDetails --> CreateFIFO[Create FIFO Layers<br/>tb_inventory_transaction_closing_balance<br/>Status = 'Active']
    CreateFIFO --> LinkBack[Link Each Layer to<br/>Source Transaction Detail]
    LinkBack --> End([GRN Complete])
    
    style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style End fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style SplitLayers fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
```

### GRN Modification Process (Open Period Only)

```mermaid
flowchart TD
    ModReq([Modification Request]) --> Lock[PESSIMISTIC LOCK<br/>Lock product_id + location_id]
    Lock --> ValidateType{Type of Change?}
    
    ValidateType -->|Cost Only| PassValid[Validation Passes]
    ValidateType -->|Qty Increase| PassValid
    ValidateType -->|Qty Decrease| CheckOutflow[Calculate Outflow_Qty<br/>Sales + Transfers + Adjustments]
    
    CheckOutflow --> CompareQty{New Qty <<br/>Outflow Qty?}
    CompareQty -->|Yes| ErrorMsg[ERROR: Cannot reduce<br/>Already issued/transferred]
    CompareQty -->|No| CheckTransfer{Any Quantity<br/>Transferred?}
    
    CheckTransfer -->|Yes| PropLock[PROPAGATION LOCK<br/>Cannot modify - requires<br/>separate cost adjustment]
    CheckTransfer -->|No| PassValid
    
    PassValid --> GenReversal[Generate Reversal Transaction<br/>Negates original entry]
    GenReversal --> GenCorrection[Generate Correction Transaction<br/>Apply new details]
    GenCorrection --> MarkOld[Mark Original Layers<br/>as 'Reversed']
    MarkOld --> CreateNew[Create New 'Active' Layers<br/>with Corrected Details]
    CreateNew --> TriggerRecalc[Flag All Subsequent<br/>Transactions for Recalculation]
    TriggerRecalc --> ReleaseLock[RELEASE LOCK]
    ReleaseLock --> Success([Modification Complete])
    
    ErrorMsg --> ReleaseLock2[RELEASE LOCK]
    PropLock --> ReleaseLock2
    ReleaseLock2 --> Fail([Modification Failed])
    
    style ModReq fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style Success fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Fail fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style ErrorMsg fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style PropLock fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
```

## Process B: Issuing Stock (FIFO Consumption)

```mermaid
flowchart TD
    IssueStart([Issue Request]) --> CreateTrans[Create Transaction<br/>Status = 'Original'<br/>Assign Costing Sequence]
    CreateTrans --> QueryLayers[Query Active FIFO Layers<br/>ORDER BY received_date,<br/>source_transaction_detail_id]
    QueryLayers --> ConsumeLoop[Start Consumption Loop]
    
    ConsumeLoop --> NeedMore{Qty Still<br/>Needed?}
    NeedMore -->|Yes| GetNext[Get Next Layer]
    GetNext --> CheckAvail{Layer Qty ≥<br/>Needed Qty?}
    
    CheckAvail -->|Yes| ConsumePartial[Consume Needed Qty<br/>Update remaining_qty]
    CheckAvail -->|No| ConsumeFull[Consume Entire Layer<br/>Set Status = 'Consumed']
    
    ConsumePartial --> CreateDetail1[Create Transaction Detail<br/>with Layer's unit_cost]
    ConsumeFull --> CreateDetail2[Create Transaction Detail<br/>with Layer's unit_cost]
    
    CreateDetail1 --> Done([Issue Complete])
    CreateDetail2 --> ConsumeLoop
    
    NeedMore -->|No| Done
    
    style IssueStart fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Done fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

## Process C: Physical Inventory Count (Stock Take)

```mermaid
flowchart TD
    InitCount([Initiate Stock Count]) --> Snapshot[Record Book_Qty_At_Snapshot<br/>for All Items]
    Snapshot --> PhysCount[Staff Performs<br/>Physical Count]
    PhysCount --> EnterData[Enter Physical_Count_Qty]
    EnterData --> CalcVar[Calculate Variance<br/>Physical - Book Snapshot]
    
    CalcVar --> CalcCost[Calculate Variance Cost<br/>Using Weighted Average<br/>of Active Layers]
    CalcCost --> Review[Manager Reviews<br/>Variance Report]
    Review --> Approve{Approve?}
    
    Approve -->|Yes| CheckSign{Variance<br/>Sign?}
    Approve -->|No| Reject([Count Rejected])
    
    CheckSign -->|Positive| StockIn[Generate Stock In<br/>Adjustment Transaction]
    CheckSign -->|Negative| StockOut[Generate Stock Out<br/>Adjustment Transaction]
    
    StockIn --> AssignSeq[Assign Costing Sequence<br/>Post to Ledger]
    StockOut --> AssignSeq
    AssignSeq --> Complete([Stock Take Complete])
    
    style InitCount fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Complete fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Reject fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
```

## Process D: FIFO Recalculation Engine

```mermaid
flowchart TD
    Trigger([Modification Posted]) --> GetSeq[Get Modified Transaction's<br/>Costing Sequence]
    GetSeq --> FindSubs[Find All Subsequent<br/>Issue Transactions]
    FindSubs --> StartLoop[Start Processing Loop<br/>In Costing Sequence Order]
    
    StartLoop --> NextIssue[Get Next Issue Transaction]
    NextIssue --> UnCost[UN-COST:<br/>Restore remaining_qty to<br/>Originally Consumed Layers]
    UnCost --> MarkSuper[Mark Old Detail Records<br/>as Superseded]
    MarkSuper --> ReCost[RE-COST:<br/>Run FIFO Logic Against<br/>Corrected Layer State]
    ReCost --> CreateNewDet[Create New Detail Records<br/>with Recalculated Costs]
    CreateNewDet --> UpdateLayers[Update remaining_qty on<br/>Newly Consumed Layers]
    
    UpdateLayers --> MoreIssues{More Issues<br/>to Process?}
    MoreIssues -->|Yes| NextIssue
    MoreIssues -->|No| RecalcDone([Recalculation Complete])
    
    style Trigger fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style RecalcDone fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

## Process E: End of Period Closing

```mermaid
flowchart TD
    InitClose([Initiate Period Close]) --> PreCheck[Pre-Closing Validations]
    PreCheck --> Check1{All Documents<br/>Posted?}
    Check1 -->|No| Fail1[Cannot Close:<br/>Pending Documents]
    Check1 -->|Yes| Check2{Recalculations<br/>Complete?}
    
    Check2 -->|No| Fail2[Cannot Close:<br/>Pending Recalculations]
    Check2 -->|Yes| Check3{Stock Takes<br/>Posted?}
    
    Check3 -->|No| Fail3[Cannot Close:<br/>Pending Adjustments]
    Check3 -->|Yes| CalcFinal[Calculate Final Values]
    
    CalcFinal --> SumLayers[Sum All Active Layers:<br/>Ending_Qty = SUM of remaining_qty<br/>Ending_Value = SUM of remaining_qty × unit_cost]
    SumLayers --> StoreSnapshot[Store in tb_inventory_period_balance<br/>Create Permanent Snapshot]
    StoreSnapshot --> LockPeriod[Set Period Status = 'Closed'<br/>Lock All Transactions]
    LockPeriod --> Success([Period Successfully Closed])
    
    Fail1 --> FailEnd([Close Failed])
    Fail2 --> FailEnd
    Fail3 --> FailEnd
    
    style InitClose fill:#FF9800,stroke:#E65100,stroke-width:2px,color:#fff
    style Success fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style FailEnd fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style Fail1 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style Fail2 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
    style Fail3 fill:#F44336,stroke:#C62828,stroke-width:2px,color:#fff
```

## Key System Rules

### 1. Costing Sequence Supremacy
- **Costing sequence** (not transaction date) determines processing order
- Each item/location combination has its own sequence
- Sequence is unbreakable and chronological

### 2. Modification Safeguards
- **Pessimistic Locking**: Prevents concurrent modifications
- **Propagation Lock**: Blocks modifications if items were transferred
- **Quantity Validation**: Cannot reduce below already-consumed quantity

### 3. Audit Trail Preservation
- Original transactions are **never deleted**
- Modifications create Reversal + Correction pairs
- Complete traceability maintained

### 4. Period Management
- **Open Periods**: Allow modifications with full recalculation
- **Closed Periods**: Completely immutable, no backdating allowed
- Closing is **irreversible**

## Transaction Status Flow

```mermaid
stateDiagram-v2
    [*] --> Original: Initial Post
    Original --> Reversal: Modification Request
    Reversal --> Correction: Automatic
    
    state "FIFO Layers" as layers {
        Active --> Consumed: Fully Issued
        Active --> Reversed: Modified
        Reversed --> [*]
        Consumed --> [*]
    }
    
    note right of Reversal: Negates Original
    note right of Correction: Applies New Values
    note left of Active: Available for Issue
```

This comprehensive system ensures:
- **Data Integrity**: Through immutable logging and controlled modifications
- **Accuracy**: Via automatic recalculation of all affected transactions
- **Auditability**: Complete transaction history with reversal/correction pairs
- **Performance**: Through pessimistic locking and sequential processing