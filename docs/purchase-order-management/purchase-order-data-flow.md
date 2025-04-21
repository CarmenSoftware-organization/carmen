# Purchase Order Module - Data Flow Diagram

This document illustrates the data flows within the Purchase Order module in the Carmen F&B Management System.

## Level 0 Data Flow Diagram

```mermaid
flowchart TD
    User[User] <--> |Inputs/Views Data| PO[Purchase Order System]
    Vendor[Vendor] <--> |Receives PO/Delivers Goods| PO
    PO <--> |Stores/Retrieves Data| Database[(Database)]
    PO <--> |Integrates with| OtherModules[Other Modules]
```

## Level 1 Data Flow Diagram

```mermaid
flowchart TD
    %% External Entities
    ProcurementOfficer[Procurement Officer]
    FinanceManager[Finance Manager]
    Vendor[Vendor]
    
    %% Processes
    CreatePO[1.0 Create PO]
    ManageItems[2.0 Manage Items]
    CalculateFinancials[3.0 Calculate Financials]
    VendorCommunication[4.0 Vendor Communication]
    GoodsReceipt[5.0 Goods Receipt]
    Reporting[6.0 Reporting]
    TraceabilityManagement[7.0 Traceability Management]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    ItemsDB[(Items DB)]
    VendorsDB[(Vendors DB)]
    InventoryDB[(Inventory DB)]
    PurchaseRequestsDB[(Purchase Requests DB)]
    TraceabilityDB[(Traceability DB)]
    
    %% Data Flows
    ProcurementOfficer -->|PO Details| CreatePO
    CreatePO -->|Store PO| PurchaseOrdersDB
    CreatePO -->|Request Items| ManageItems
    
    %% PR-to-PO Traceability Flows
    PurchaseRequestsDB -->|PR Data| CreatePO
    CreatePO -->|PR Reference| PurchaseOrdersDB
    PurchaseRequestsDB -->|PR Items| ManageItems
    ManageItems -->|PR Item References| TraceabilityDB
    TraceabilityDB -->|Traceability Data| Reporting
    
    ProcurementOfficer -->|Item Details| ManageItems
    ManageItems -->|Store Items| ItemsDB
    ManageItems -->|Request Calculations| CalculateFinancials
    
    CalculateFinancials -->|Financial Data| PurchaseOrdersDB
    CalculateFinancials -->|Budget Check| FinanceManager
    FinanceManager -->|Budget Approval| CalculateFinancials
    
    PurchaseOrdersDB -->|Completed PO| VendorCommunication
    VendorCommunication -->|Send PO| Vendor
    Vendor -->|Delivery Info| VendorCommunication
    
    Vendor -->|Delivers Goods| GoodsReceipt
    GoodsReceipt -->|Update Inventory| InventoryDB
    GoodsReceipt -->|Update PO Status| PurchaseOrdersDB
    
    PurchaseOrdersDB -->|PO Data| Reporting
    ItemsDB -->|Item Data| Reporting
    VendorsDB -->|Vendor Data| Reporting
    InventoryDB -->|Inventory Data| Reporting
    Reporting -->|Reports| ProcurementOfficer
    Reporting -->|Financial Reports| FinanceManager
    
    %% Traceability Management Flows
    PurchaseOrdersDB <-->|PO Data| TraceabilityManagement
    PurchaseRequestsDB <-->|PR Data| TraceabilityManagement
    TraceabilityManagement -->|Traceability Data| TraceabilityDB
    TraceabilityManagement -->|Traceability Reports| ProcurementOfficer
    GoodsReceipt -->|Receipt Data| TraceabilityManagement
```

## Level 2 Data Flow Diagram: PO Creation Process

```mermaid
flowchart TD
    %% External Entities
    ProcurementOfficer[Procurement Officer]
    
    %% Processes
    InitiatePO[1.1 Initiate PO]
    SelectPRItems[1.2 Select PR Items]
    SelectVendor[1.3 Select Vendor]
    EnterBasicInfo[1.4 Enter Basic Info]
    ValidatePO[1.5 Validate PO]
    GeneratePONumber[1.6 Generate PO Number]
    SavePO[1.7 Save PO]
    StorePRReferences[1.8 Store PR References]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    VendorsDB[(Vendors DB)]
    PRsDB[(Purchase Requests DB)]
    PRItemsDB[(PR Items DB)]
    TraceabilityDB[(Traceability DB)]
    
    %% Data Flows
    ProcurementOfficer -->|Initiate Request| InitiatePO
    InitiatePO -->|From PR| PRsDB
    PRsDB -->|PR Data| InitiatePO
    
    InitiatePO -->|PR Selection| SelectPRItems
    SelectPRItems -->|Get PR Items| PRItemsDB
    PRItemsDB -->|PR Item Data| SelectPRItems
    SelectPRItems -->|Selected PR Items| EnterBasicInfo
    
    EnterBasicInfo -->|Vendor Selection| SelectVendor
    SelectVendor -->|Vendor Query| VendorsDB
    VendorsDB -->|Vendor Data| SelectVendor
    SelectVendor -->|Selected Vendor| EnterBasicInfo
    
    EnterBasicInfo -->|PO Draft| ValidatePO
    ValidatePO -->|Valid PO| GeneratePONumber
    ValidatePO -->|Invalid PO| EnterBasicInfo
    
    GeneratePONumber -->|PO with Number| SavePO
    SavePO -->|Store PO| PurchaseOrdersDB
    SavePO -->|PR References| StorePRReferences
    
    StorePRReferences -->|Store Traceability| TraceabilityDB
    StorePRReferences -->|Update PR Items| PRItemsDB
    
    SavePO -->|Confirmation| ProcurementOfficer
```

## Level 2 Data Flow Diagram: Item Management Process

```mermaid
flowchart TD
    %% External Entities
    ProcurementOfficer[Procurement Officer]
    
    %% Processes
    AddItem[2.1 Add Item]
    SearchItems[2.2 Search Items]
    SelectPRSource[2.3 Select PR Source]
    ConfigureItem[2.4 Configure Item]
    CalculateItemFinancials[2.5 Calculate Item Financials]
    ValidateItem[2.6 Validate Item]
    ValidatePRQuantity[2.7 Validate PR Quantity]
    SaveItem[2.8 Save Item]
    UpdatePRItemStatus[2.9 Update PR Item Status]
    
    %% Data Stores
    ItemsDB[(Items DB)]
    PurchaseOrderItemsDB[(PO Items DB)]
    InventoryDB[(Inventory DB)]
    PRItemsDB[(PR Items DB)]
    TraceabilityDB[(Traceability DB)]
    
    %% Data Flows
    ProcurementOfficer -->|Add Item Request| AddItem
    
    AddItem -->|From PR?| SelectPRSource
    SelectPRSource -->|Yes| PRItemsDB
    PRItemsDB -->|PR Item Data| SelectPRSource
    SelectPRSource -->|PR Item Selected| ConfigureItem
    SelectPRSource -->|PR Item Reference| ConfigureItem
    
    AddItem -->|From Catalog| SearchItems
    SearchItems -->|Item Query| ItemsDB
    ItemsDB -->|Item Data| SearchItems
    SearchItems -->|Selected Item| ConfigureItem
    
    ConfigureItem -->|Item Details| CalculateItemFinancials
    CalculateItemFinancials -->|Check Inventory| InventoryDB
    InventoryDB -->|Inventory Data| CalculateItemFinancials
    CalculateItemFinancials -->|Financial Details| ValidateItem
    
    ValidateItem -->|Valid Item| ValidatePRQuantity
    ValidateItem -->|Invalid Item| ConfigureItem
    
    ValidatePRQuantity -->|PR Item?| PRItemsDB
    PRItemsDB -->|Available Quantity| ValidatePRQuantity
    ValidatePRQuantity -->|Quantity Valid| SaveItem
    ValidatePRQuantity -->|Quantity Invalid| ConfigureItem
    
    SaveItem -->|Store Item| PurchaseOrderItemsDB
    SaveItem -->|PR Reference?| UpdatePRItemStatus
    UpdatePRItemStatus -->|Update PR Item| PRItemsDB
    UpdatePRItemStatus -->|Store Traceability| TraceabilityDB
    
    SaveItem -->|Confirmation| ProcurementOfficer
```

## Level 2 Data Flow Diagram: PR-to-PO Traceability Process

```mermaid
flowchart TD
    %% External Entities
    ProcurementOfficer[Procurement Officer]
    Auditor[Auditor]
    
    %% Processes
    TrackPRtoPO[7.1 Track PR-to-PO]
    QueryTraceability[7.2 Query Traceability]
    GenerateTraceabilityReport[7.3 Generate Traceability Report]
    UpdateTraceability[7.4 Update Traceability]
    AuditTraceability[7.5 Audit Traceability]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    PurchaseOrderItemsDB[(PO Items DB)]
    PRsDB[(Purchase Requests DB)]
    PRItemsDB[(PR Items DB)]
    TraceabilityDB[(Traceability DB)]
    AuditLogDB[(Audit Log DB)]
    
    %% Data Flows
    ProcurementOfficer -->|Traceability Query| QueryTraceability
    QueryTraceability -->|Query PR| PRsDB
    QueryTraceability -->|Query PR Items| PRItemsDB
    QueryTraceability -->|Query PO| PurchaseOrdersDB
    QueryTraceability -->|Query PO Items| PurchaseOrderItemsDB
    QueryTraceability -->|Query Traceability| TraceabilityDB
    
    QueryTraceability -->|Traceability Data| GenerateTraceabilityReport
    GenerateTraceabilityReport -->|Traceability Report| ProcurementOfficer
    
    TrackPRtoPO -->|PR Item Changes| PRItemsDB
    TrackPRtoPO -->|PO Item Changes| PurchaseOrderItemsDB
    TrackPRtoPO -->|Update Traceability| UpdateTraceability
    
    UpdateTraceability -->|Store Traceability| TraceabilityDB
    UpdateTraceability -->|Log Change| AuditLogDB
    
    Auditor -->|Audit Request| AuditTraceability
    AuditTraceability -->|Query Traceability| TraceabilityDB
    AuditTraceability -->|Query Audit Log| AuditLogDB
    AuditTraceability -->|Audit Report| Auditor
```

## Level 2 Data Flow Diagram: Goods Receipt Process

```mermaid
flowchart TD
    %% External Entities
    InventoryManager[Inventory Manager]
    Vendor[Vendor]
    
    %% Processes
    DeliverGoods[5.1 Deliver Goods]
    ReceiveGoods[5.2 Receive Goods]
    VerifyAgainstPO[5.3 Verify Against PO]
    RecordDiscrepancies[5.4 Record Discrepancies]
    CreateGRN[5.5 Create GRN]
    UpdateInventory[5.6 Update Inventory]
    UpdatePOStatus[5.7 Update PO Status]
    UpdateTraceability[5.8 Update Traceability]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    PurchaseOrderItemsDB[(PO Items DB)]
    GRNsDB[(GRNs DB)]
    InventoryDB[(Inventory DB)]
    PRItemsDB[(PR Items DB)]
    TraceabilityDB[(Traceability DB)]
    
    %% Data Flows
    Vendor -->|Delivers Items| DeliverGoods
    DeliverGoods -->|Delivery Note| ReceiveGoods
    InventoryManager -->|Receive Request| ReceiveGoods
    
    ReceiveGoods -->|Get PO| PurchaseOrdersDB
    PurchaseOrdersDB -->|PO Data| ReceiveGoods
    ReceiveGoods -->|Get Items| PurchaseOrderItemsDB
    PurchaseOrderItemsDB -->|Item Data| ReceiveGoods
    
    ReceiveGoods -->|Received Items| VerifyAgainstPO
    VerifyAgainstPO -->|Discrepancies| RecordDiscrepancies
    VerifyAgainstPO -->|Verified Items| CreateGRN
    
    CreateGRN -->|Store GRN| GRNsDB
    CreateGRN -->|Update Request| UpdateInventory
    UpdateInventory -->|Update Stock| InventoryDB
    
    CreateGRN -->|Update Request| UpdatePOStatus
    UpdatePOStatus -->|Update PO| PurchaseOrdersDB
    UpdatePOStatus -->|Update Items| PurchaseOrderItemsDB
    
    UpdatePOStatus -->|PR References?| UpdateTraceability
    UpdateTraceability -->|Update PR Items| PRItemsDB
    UpdateTraceability -->|Update Traceability| TraceabilityDB
```

These data flow diagrams illustrate how data moves through the Purchase Order module, from creation to goods receipt, including the PR-to-PO traceability, item management, and goods receipt processes. 