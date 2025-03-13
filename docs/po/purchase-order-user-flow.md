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
    
    SaveDraft --> Submit[Submit for Approval]
    Submit --> End([End])
```

## 2. Purchase Order Approval Flow

```mermaid
flowchart TD
    Start([Start]) --> ReceiveNotification[Receive Approval Notification]
    ReceiveNotification --> ReviewPO[Review Purchase Order]
    
    ReviewPO --> Decision{Approve?}
    
    Decision -->|Yes| ApprovePO[Approve PO]
    Decision -->|No| RejectPO[Reject PO]
    Decision -->|Request Changes| RequestChanges[Request Changes]
    
    ApprovePO --> NotifyCreator[Notify Creator]
    RejectPO --> ProvideReason[Provide Rejection Reason]
    RequestChanges --> SpecifyChanges[Specify Required Changes]
    
    ProvideReason --> NotifyCreator
    SpecifyChanges --> NotifyCreator
    
    NotifyCreator --> UpdateStatus[Update PO Status]
    UpdateStatus --> End([End])
```

## 3. Goods Receipt Flow

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

## 4. Purchase Order Modification Flow

```mermaid
flowchart TD
    Start([Start]) --> SelectPO[Select Purchase Order]
    SelectPO --> CheckStatus{Check Status}
    
    CheckStatus -->|Draft| EditPO[Edit PO]
    CheckStatus -->|Submitted/Approved| RequestChange[Request Change]
    CheckStatus -->|Closed/Voided| CannotEdit[Cannot Edit]
    
    EditPO --> ModifyDetails[Modify PO Details]
    RequestChange --> SubmitChangeRequest[Submit Change Request]
    CannotEdit --> End([End])
    
    ModifyDetails --> EditItems[Edit Items]
    SubmitChangeRequest --> WaitApproval[Wait for Approval]
    
    EditItems --> RecalculateFinancials[Recalculate Financials]
    WaitApproval --> ApprovalDecision{Approved?}
    
    RecalculateFinancials --> SaveChanges[Save Changes]
    ApprovalDecision -->|Yes| CreateRevision[Create PO Revision]
    ApprovalDecision -->|No| NotifyRejection[Notify Rejection]
    
    SaveChanges --> End
    CreateRevision --> End
    NotifyRejection --> End
```

## 5. Purchase Order Reporting Flow

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

## 6. Integrated User Flow

```mermaid
flowchart TD
    Start([Start]) --> NeedPO{Need PO?}
    
    NeedPO -->|Yes| CreatePR[Create Purchase Request]
    NeedPO -->|No| End([End])
    
    CreatePR --> PRApproval[PR Approval Process]
    PRApproval --> PRApproved{PR Approved?}
    
    PRApproved -->|Yes| CreatePO[Create Purchase Order]
    PRApproved -->|No| ReviseRequest[Revise Request]
    
    ReviseRequest --> CreatePR
    
    CreatePO --> POApproval[PO Approval Process]
    POApproval --> POApproved{PO Approved?}
    
    POApproved -->|Yes| SendToVendor[Send to Vendor]
    POApproved -->|No| RevisePO[Revise PO]
    
    RevisePO --> CreatePO
    
    SendToVendor --> TrackDelivery[Track Delivery]
    TrackDelivery --> GoodsReceived{Goods Received?}
    
    GoodsReceived -->|Yes| CreateGRN[Create Goods Received Note]
    GoodsReceived -->|No| FollowUp[Follow Up with Vendor]
    
    FollowUp --> TrackDelivery
    
    CreateGRN --> UpdateInventory[Update Inventory]
    UpdateInventory --> FullyReceived{Fully Received?}
    
    FullyReceived -->|Yes| ClosePO[Close PO]
    FullyReceived -->|No| KeepOpen[Keep PO Open]
    
    ClosePO --> End
    KeepOpen --> TrackDelivery
```

## 7. User Role Interactions

```mermaid
flowchart TD
    ProcurementOfficer[Procurement Officer] -->|Creates| PO[Purchase Order]
    ProcurementOfficer -->|Manages| Items[PO Items]
    ProcurementOfficer -->|Tracks| Status[PO Status]
    
    FinanceManager[Finance Manager] -->|Reviews| Financials[Financial Details]
    FinanceManager -->|Approves| Budget[Budget Allocation]
    
    DepartmentManager[Department Manager] -->|Approves| DeptPO[Department POs]
    
    InventoryManager[Inventory Manager] -->|Receives| Goods[Goods]
    InventoryManager -->|Creates| GRN[Goods Received Note]
    
    Vendor[Vendor] -->|Receives| SentPO[Sent PO]
    Vendor -->|Delivers| OrderedItems[Ordered Items]
    
    PO -->|Requires| Approval[Approval]
    Approval -->|By| Approvers[Approvers]
    
    Items -->|Affect| Inventory[Inventory Levels]
    
    GRN -->|Updates| POStatus[PO Status]
    GRN -->|Updates| Inventory
    
    SentPO -->|Leads to| OrderedItems
    OrderedItems -->|Triggers| GRN
```

These diagrams illustrate the key user flows and interactions within the Purchase Order module, from creation to closure, including approval processes, goods receipt, and reporting. 