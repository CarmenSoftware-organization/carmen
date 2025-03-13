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
    Approver[Approver]
    Vendor[Vendor]
    
    %% Processes
    CreatePO[1.0\nCreate PO]
    ManageItems[2.0\nManage Items]
    CalculateFinancials[3.0\nCalculate Financials]
    ApprovalProcess[4.0\nApproval Process]
    VendorCommunication[5.0\nVendor Communication]
    GoodsReceipt[6.0\nGoods Receipt]
    Reporting[7.0\nReporting]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    ItemsDB[(Items DB)]
    VendorsDB[(Vendors DB)]
    InventoryDB[(Inventory DB)]
    
    %% Data Flows
    ProcurementOfficer -->|PO Details| CreatePO
    CreatePO -->|Store PO| PurchaseOrdersDB
    CreatePO -->|Request Items| ManageItems
    
    ProcurementOfficer -->|Item Details| ManageItems
    ManageItems -->|Store Items| ItemsDB
    ManageItems -->|Request Calculations| CalculateFinancials
    
    CalculateFinancials -->|Financial Data| PurchaseOrdersDB
    CalculateFinancials -->|Budget Check| FinanceManager
    FinanceManager -->|Budget Approval| CalculateFinancials
    
    PurchaseOrdersDB -->|PO for Approval| ApprovalProcess
    Approver -->|Approval Decision| ApprovalProcess
    ApprovalProcess -->|Update Status| PurchaseOrdersDB
    
    PurchaseOrdersDB -->|Approved PO| VendorCommunication
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
```

## Level 2 Data Flow Diagram: PO Creation Process

```mermaid
flowchart TD
    %% External Entities
    ProcurementOfficer[Procurement Officer]
    
    %% Processes
    InitiatePO[1.1\nInitiate PO]
    SelectVendor[1.2\nSelect Vendor]
    EnterBasicInfo[1.3\nEnter Basic Info]
    ValidatePO[1.4\nValidate PO]
    GeneratePONumber[1.5\nGenerate PO Number]
    SavePO[1.6\nSave PO]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    VendorsDB[(Vendors DB)]
    PRsDB[(Purchase Requests DB)]
    
    %% Data Flows
    ProcurementOfficer -->|Initiate Request| InitiatePO
    InitiatePO -->|From PR| PRsDB
    PRsDB -->|PR Data| InitiatePO
    InitiatePO -->|Basic Info| EnterBasicInfo
    
    EnterBasicInfo -->|Vendor Selection| SelectVendor
    SelectVendor -->|Vendor Query| VendorsDB
    VendorsDB -->|Vendor Data| SelectVendor
    SelectVendor -->|Selected Vendor| EnterBasicInfo
    
    EnterBasicInfo -->|PO Draft| ValidatePO
    ValidatePO -->|Valid PO| GeneratePONumber
    ValidatePO -->|Invalid PO| EnterBasicInfo
    
    GeneratePONumber -->|PO with Number| SavePO
    SavePO -->|Store PO| PurchaseOrdersDB
    SavePO -->|Confirmation| ProcurementOfficer
```

## Level 2 Data Flow Diagram: Item Management Process

```mermaid
flowchart TD
    %% External Entities
    ProcurementOfficer[Procurement Officer]
    
    %% Processes
    AddItem[2.1\nAdd Item]
    SearchItems[2.2\nSearch Items]
    ConfigureItem[2.3\nConfigure Item]
    CalculateItemFinancials[2.4\nCalculate Item Financials]
    ValidateItem[2.5\nValidate Item]
    SaveItem[2.6\nSave Item]
    
    %% Data Stores
    ItemsDB[(Items DB)]
    PurchaseOrderItemsDB[(PO Items DB)]
    InventoryDB[(Inventory DB)]
    
    %% Data Flows
    ProcurementOfficer -->|Add Item Request| AddItem
    AddItem -->|Search Query| SearchItems
    SearchItems -->|Item Query| ItemsDB
    ItemsDB -->|Item Data| SearchItems
    SearchItems -->|Selected Item| ConfigureItem
    
    ConfigureItem -->|Item Details| CalculateItemFinancials
    CalculateItemFinancials -->|Check Inventory| InventoryDB
    InventoryDB -->|Inventory Data| CalculateItemFinancials
    CalculateItemFinancials -->|Financial Details| ValidateItem
    
    ValidateItem -->|Valid Item| SaveItem
    ValidateItem -->|Invalid Item| ConfigureItem
    
    SaveItem -->|Store Item| PurchaseOrderItemsDB
    SaveItem -->|Confirmation| ProcurementOfficer
```

## Level 2 Data Flow Diagram: Approval Process

```mermaid
flowchart TD
    %% External Entities
    ProcurementOfficer[Procurement Officer]
    Approver[Approver]
    
    %% Processes
    SubmitForApproval[4.1\nSubmit for Approval]
    NotifyApprovers[4.2\nNotify Approvers]
    ReviewPO[4.3\nReview PO]
    MakeDecision[4.4\nMake Decision]
    UpdateStatus[4.5\nUpdate Status]
    NotifyStakeholders[4.6\nNotify Stakeholders]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    ApprovalHistoryDB[(Approval History DB)]
    NotificationsDB[(Notifications DB)]
    
    %% Data Flows
    ProcurementOfficer -->|Submit Request| SubmitForApproval
    SubmitForApproval -->|Get PO| PurchaseOrdersDB
    PurchaseOrdersDB -->|PO Data| SubmitForApproval
    SubmitForApproval -->|Approval Request| NotifyApprovers
    
    NotifyApprovers -->|Store Notification| NotificationsDB
    NotificationsDB -->|Notification| Approver
    Approver -->|Access PO| ReviewPO
    ReviewPO -->|Get PO| PurchaseOrdersDB
    PurchaseOrdersDB -->|PO Data| ReviewPO
    
    ReviewPO -->|Review Data| MakeDecision
    MakeDecision -->|Decision| UpdateStatus
    UpdateStatus -->|Update PO| PurchaseOrdersDB
    UpdateStatus -->|Record History| ApprovalHistoryDB
    
    UpdateStatus -->|Status Change| NotifyStakeholders
    NotifyStakeholders -->|Store Notification| NotificationsDB
    NotificationsDB -->|Notification| ProcurementOfficer
```

## Level 2 Data Flow Diagram: Goods Receipt Process

```mermaid
flowchart TD
    %% External Entities
    InventoryManager[Inventory Manager]
    Vendor[Vendor]
    
    %% Processes
    DeliverGoods[6.1\nDeliver Goods]
    ReceiveGoods[6.2\nReceive Goods]
    VerifyAgainstPO[6.3\nVerify Against PO]
    RecordDiscrepancies[6.4\nRecord Discrepancies]
    CreateGRN[6.5\nCreate GRN]
    UpdateInventory[6.6\nUpdate Inventory]
    UpdatePOStatus[6.7\nUpdate PO Status]
    
    %% Data Stores
    PurchaseOrdersDB[(Purchase Orders DB)]
    PurchaseOrderItemsDB[(PO Items DB)]
    GRNsDB[(GRNs DB)]
    InventoryDB[(Inventory DB)]
    
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
```

These data flow diagrams illustrate how data moves through the Purchase Order module, from creation to goods receipt, including the approval process and item management. 