# Purchase Order Module - User Flow Diagram

This document outlines the key user flows for the Purchase Order module in the Carmen F&B Management System.

## 1. Purchase Order Creation and Management Flow

```mermaid
flowchart TD
    Start([Start]) --> PR{From PR?}
    PR -->|Yes| SelectPR[Select Purchase Request]
    PR -->|No| CreateNew[Create New PO]
    
    SelectPR --> PopulateData[Populate Data from PR]
    CreateNew --> EnterBasicInfo[Enter Basic Information]
    
    PopulateData --> ReviewVendor[Review Vendor Information]
    EnterBasicInfo --> SelectVendor[Select Vendor]
    
    ReviewVendor --> ReviewItems[Review Items]
    SelectVendor --> AddItems[Add Items]
    
    ReviewItems --> EditItems[Edit Items if needed]
    AddItems --> ConfigureItems[Configure Item Details]
    
    EditItems --> CalculateFinancials[Calculate Financials]
    ConfigureItems --> CalculateFinancials
    
    CalculateFinancials --> ValidatePO[Validate PO]
    ValidatePO -->|Valid| SaveDraft[Save as Draft]
    ValidatePO -->|Invalid| FixErrors[Fix Validation Errors]
    
    FixErrors --> ValidatePO
    
    SaveDraft --> SendToVendor[Send to Vendor]
    SendToVendor --> End([End])
```

## 2. Goods Receipt Flow

```mermaid
flowchart TD
    Start([Start]) --> SelectPO[Select Purchase Order]
    SelectPO --> VerifyDetails[Verify PO Details]
    
    VerifyDetails --> ReceiveGoods{Full or Partial?}
    
    ReceiveGoods -->|Full| ReceiveAllItems[Receive All Items]
    ReceiveGoods -->|Partial| SelectItems[Select Items to Receive]
    
    ReceiveAllItems --> EnterQuantities[Enter Received Quantities]
    SelectItems --> EnterPartialQuantities[Enter Partial Quantities]
    
    EnterQuantities --> AddNotes[Add Receipt Notes]
    EnterPartialQuantities --> AddNotes
    
    AddNotes --> CreateGRN[Create Goods Received Note]
    CreateGRN --> UpdateInventory[Update Inventory]
    
    UpdateInventory --> UpdatePOStatus[Update PO Status]
    UpdatePOStatus -->|Fully Received| ClosePO[Close PO]
    UpdatePOStatus -->|Partially Received| KeepOpen[Keep PO Open]
    
    ClosePO --> End([End])
    KeepOpen --> End
```

## 3. Purchase Order Modification Flow

```mermaid
flowchart TD
    Start([Start]) --> SelectPO[Select Purchase Order]
    SelectPO --> CheckStatus{Check Status}
    
    CheckStatus -->|Draft| EditPO[Edit PO]
    CheckStatus -->|Other Status| CannotEdit[Cannot Edit]
    
    EditPO --> ModifyDetails[Modify PO Details]
    CannotEdit --> End([End])
    
    ModifyDetails --> EditItems[Edit Items]
    
    EditItems --> RecalculateFinancials[Recalculate Financials]
    
    RecalculateFinancials --> SaveChanges[Save Changes]
    
    SaveChanges --> End
```

## 4. Purchase Order Reporting Flow

```mermaid
flowchart TD
    Start([Start]) --> SelectReportType[Select Report Type]
    
    SelectReportType --> ReportOptions{Report Type}
    
    ReportOptions -->|PO Status| StatusReport[PO Status Report]
    ReportOptions -->|Vendor Performance| VendorReport[Vendor Performance Report]
    ReportOptions -->|Spending Analysis| SpendingReport[Spending Analysis Report]
    
    StatusReport --> ConfigureFilters[Configure Filters]
    VendorReport --> SelectVendors[Select Vendors]
    SpendingReport --> SelectCategories[Select Categories/Departments]
    
    ConfigureFilters --> GenerateReport[Generate Report]
    SelectVendors --> SelectDateRange[Select Date Range]
    SelectCategories --> SelectDateRange
    
    SelectDateRange --> GenerateReport
    
    GenerateReport --> ViewReport[View Report]
    ViewReport --> ExportOptions{Export?}
    
    ExportOptions -->|Yes| SelectFormat[Select Format]
    ExportOptions -->|No| End([End])
    
    SelectFormat --> ExportReport[Export Report]
    ExportReport --> End
```

## 5. Purchase Order Status Transition Flow

```mermaid
flowchart TD
    Start([Start]) --> Draft[Draft]
    
    Draft -->|Send to Vendor| Sent[Sent]
    Draft -->|Delete| Deleted[Deleted]
    
    Sent -->|Receive Some Items| Partial[Partially Received]
    Sent -->|Receive All Items| FullyReceived[Fully Received]
    Sent -->|Void| Voided[Voided]
    
    Partial -->|Receive Remaining Items| FullyReceived
    Partial -->|Close with Partial Receipt| Closed[Closed]
    Partial -->|Void| Voided
    
    FullyReceived -->|Close PO| Closed
    FullyReceived -->|Void| Voided
    
    Voided --> End([End])
    Closed --> End([End])
    Deleted --> End([End])

    classDef draftActions fill:#e6f7ff,stroke:#1890ff;
    classDef activeActions fill:#f6ffed,stroke:#52c41a;
    classDef terminalActions fill:#fff2e8,stroke:#fa8c16;
    
    class Draft draftActions;
    class Sent,Partial,FullyReceived activeActions;
    class Closed,Voided,Deleted terminalActions;
```

> **Important Business Rule**: Purchase Orders can only be deleted while in draft status. Once a Purchase Order has been sent to a vendor (active state), it can only be voided or closed, not deleted. This ensures data integrity and maintains a proper audit trail.

## 6. User Role Interactions

```mermaid
flowchart TD
    ProcurementOfficer[Procurement Officer] -->|Creates| PO[Purchase Order]
    ProcurementOfficer -->|Manages| Items[PO Items]
    ProcurementOfficer -->|Tracks| Status[PO Status]
    ProcurementOfficer -->|Sends to| Vendor[Vendor]
    ProcurementOfficer -->|Can Delete| DraftPO[Draft PO]
    ProcurementOfficer -->|Can Void| ActivePO[Active PO]
    
    FinanceManager[Finance Manager] -->|Reviews| Financials[Financial Details]
    FinanceManager -->|Monitors| Budget[Budget Allocation]
    
    DepartmentManager[Department Manager] -->|Reviews| DeptPO[Department POs]
    
    InventoryManager[Inventory Manager] -->|Receives| Goods[Goods]
    InventoryManager -->|Creates| GRN[Goods Received Note]
    InventoryManager -->|Can Close| ActivePO
    
    Vendor -->|Receives| SentPO[Sent PO]
    Vendor -->|Delivers| OrderedItems[Ordered Items]
    
    Items -->|Affect| Inventory[Inventory Levels]
    
    GRN -->|Updates| POStatus[PO Status]
    GRN -->|Updates| Inventory
    
    SentPO -->|Leads to| OrderedItems
    OrderedItems -->|Triggers| GRN
    
    DraftPO -.-> PO
    ActivePO -.-> PO
```

## 7. Mobile User Flow

```mermaid
flowchart TD
    Start([Start]) --> Login[Login to System]
    
    Login --> Dashboard[View Dashboard]
    
    Dashboard --> POList[View PO List]
    Dashboard --> CreatePO[Create New PO]
    Dashboard --> Reports[View Reports]
    
    POList --> FilterPOs[Filter POs]
    POList --> SelectPO[Select PO]
    
    SelectPO --> ViewDetails[View PO Details]
    
    ViewDetails --> ViewItems[View Items]
    ViewDetails --> ViewStatus[View Status]
    ViewDetails --> ViewAttachments[View Attachments]
    
    ViewDetails --> Actions{Actions}
    
    Actions -->|Draft PO| EditPO[Edit PO]
    Actions -->|Sent PO| ReceiveGoods[Receive Goods]
    Actions -->|Any PO| AddComment[Add Comment]
    Actions -->|Any PO| SharePO[Share PO]
    
    EditPO --> SaveChanges[Save Changes]
    ReceiveGoods --> CreateGRN[Create GRN]
    
    SaveChanges --> ViewDetails
    CreateGRN --> ViewDetails
    AddComment --> ViewDetails
    SharePO --> ViewDetails
    
    CreatePO --> EnterDetails[Enter PO Details]
    EnterDetails --> AddItems[Add Items]
    AddItems --> ReviewPO[Review PO]
    ReviewPO --> SavePO[Save PO]
    SavePO --> SendToVendor[Send to Vendor]
    SendToVendor --> Dashboard
    
    Reports --> ConfigureReport[Configure Report]
    ConfigureReport --> ViewReport[View Report]
    ViewReport --> ExportReport[Export Report]
    ExportReport --> Dashboard
    
    ViewDetails --> Dashboard
```

These diagrams illustrate the key user flows and interactions within the Purchase Order module, from creation to closure, including goods receipt, reporting, and mobile interactions. 