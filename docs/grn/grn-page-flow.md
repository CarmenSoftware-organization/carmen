# Goods Received Note (GRN) Module - Page Flow Diagrams

This document provides visual representations of the user flows and page navigation within the Goods Received Note module.

## 1. Main GRN User Flow

```mermaid
flowchart TD
    Start([Start]) --> GRNList[GRN List Page]
    
    %% Create Flow
    GRNList -->|"Click 'Create New'"| CreateGRN[Create GRN Page]
    CreateGRN -->|"Select PO"| POSelection[PO Selection]
    CreateGRN -->|"Direct Entry"| VendorSelection[Vendor Selection]
    POSelection --> FillGRNDetails[Fill GRN Details]
    VendorSelection --> FillGRNDetails
    FillGRNDetails -->|"Add/Edit Items"| ItemsTab[Items Tab]
    FillGRNDetails -->|"Add Extra Costs"| ExtraCostsTab[Extra Costs Tab]
    FillGRNDetails -->|"View Stock Movements"| StockMovementTab[Stock Movement Tab]
    FillGRNDetails -->|"View Journal Entries"| JournalEntriesTab[Journal Entries Tab]
    FillGRNDetails -->|"Manage Tax Entries"| TaxEntriesTab[Tax Entries Tab]
    
    ItemsTab --> SaveGRN{Save GRN?}
    ExtraCostsTab --> SaveGRN
    StockMovementTab --> SaveGRN
    JournalEntriesTab --> SaveGRN
    TaxEntriesTab --> SaveGRN
    
    SaveGRN -->|"Yes"| SaveAction[Save GRN]
    SaveGRN -->|"No"| CancelAction[Cancel]
    
    SaveAction --> GRNDetail[GRN Detail Page]
    CancelAction --> GRNList
    
    %% View/Edit Flow
    GRNList -->|"Click on GRN"| GRNDetail
    GRNDetail -->|"Click Edit"| EditGRN[Edit GRN Page]
    EditGRN --> FillGRNDetails
    
    %% Approval Flow
    GRNDetail -->|"Submit for Approval"| SubmitApproval[Submit for Approval]
    SubmitApproval --> ApprovalProcess[Approval Process]
    ApprovalProcess -->|"Approved"| UpdateStatus[Update Status to Approved]
    ApprovalProcess -->|"Rejected"| RejectReason[Enter Rejection Reason]
    RejectReason --> UpdateStatusRejected[Update Status to Rejected]
    UpdateStatus --> GRNDetail
    UpdateStatusRejected --> GRNDetail
    
    %% Post Flow
    GRNDetail -->|"Post GRN"| PostGRN[Post GRN]
    PostGRN --> UpdateInventory[Update Inventory]
    UpdateInventory --> GenerateJournalEntries[Generate Journal Entries]
    GenerateJournalEntries --> UpdateStatusPosted[Update Status to Posted]
    UpdateStatusPosted --> GRNDetail
    
    %% Print/Export Flow
    GRNDetail -->|"Print"| PrintGRN[Print GRN]
    GRNDetail -->|"Export"| ExportGRN[Export GRN]
    PrintGRN --> GRNDetail
    ExportGRN --> GRNDetail
    
    %% Delete Flow
    GRNDetail -->|"Delete"| ConfirmDelete{Confirm Delete?}
    ConfirmDelete -->|"Yes"| DeleteGRN[Delete GRN]
    ConfirmDelete -->|"No"| GRNDetail
    DeleteGRN --> GRNList
```

## 2. GRN Creation Flow

```mermaid
flowchart TD
    Start([Start]) --> SelectCreationMethod{Creation Method}
    
    SelectCreationMethod -->|"From PO"| SelectPO[Select Purchase Order]
    SelectCreationMethod -->|"Direct Entry"| SelectVendor[Select Vendor]
    SelectCreationMethod -->|"Cash Purchase"| SelectVendorCash[Select Vendor & Cash Book]
    
    SelectPO --> AutoPopulate[Auto-populate PO Data]
    AutoPopulate --> AdjustQuantities[Adjust Received Quantities]
    
    SelectVendor --> ManualEntry[Manual Item Entry]
    SelectVendorCash --> ManualEntry
    
    AdjustQuantities --> EnterDetails[Enter GRN Details]
    ManualEntry --> EnterDetails
    
    EnterDetails --> AddExtraCosts{Add Extra Costs?}
    AddExtraCosts -->|"Yes"| EnterExtraCosts[Enter Extra Costs]
    AddExtraCosts -->|"No"| CalculateTotals[Calculate Totals]
    
    EnterExtraCosts --> DistributeExtraCosts[Distribute Extra Costs]
    DistributeExtraCosts --> CalculateTotals
    
    CalculateTotals --> ReviewGRN[Review GRN]
    ReviewGRN --> SaveGRN{Save GRN?}
    
    SaveGRN -->|"Yes"| SaveAction[Save GRN]
    SaveGRN -->|"No"| CancelAction[Cancel]
    
    SaveAction --> SubmitApproval{Submit for Approval?}
    SubmitApproval -->|"Yes"| SubmitAction[Submit for Approval]
    SubmitApproval -->|"No"| End([End])
    
    SubmitAction --> End
    CancelAction --> End
```

## 3. GRN Approval Flow

```mermaid
flowchart TD
    Start([Start]) --> GRNSubmitted[GRN Submitted for Approval]
    
    GRNSubmitted --> NotifyApprovers[Notify Approvers]
    NotifyApprovers --> ApproverReview[Approver Reviews GRN]
    
    ApproverReview --> ApprovalDecision{Approval Decision}
    
    ApprovalDecision -->|"Approve"| ApproveGRN[Approve GRN]
    ApprovalDecision -->|"Reject"| EnterRejectionReason[Enter Rejection Reason]
    ApprovalDecision -->|"Request Changes"| RequestChanges[Request Changes]
    
    ApproveGRN --> CheckApprovalLevel{Final Approval?}
    CheckApprovalLevel -->|"Yes"| UpdateStatusApproved[Update Status to Approved]
    CheckApprovalLevel -->|"No"| NotifyNextApprover[Notify Next Approver]
    
    NotifyNextApprover --> ApproverReview
    
    EnterRejectionReason --> UpdateStatusRejected[Update Status to Rejected]
    RequestChanges --> NotifyCreator[Notify GRN Creator]
    
    UpdateStatusApproved --> NotifyStakeholders[Notify All Stakeholders]
    UpdateStatusRejected --> NotifyStakeholders
    NotifyCreator --> End([End])
    
    NotifyStakeholders --> End
```

## 4. GRN Posting Flow

```mermaid
flowchart TD
    Start([Start]) --> ApprovedGRN[Approved GRN]
    
    ApprovedGRN --> InitiatePosting[Initiate Posting]
    InitiatePosting --> ValidateGRN{Validate GRN}
    
    ValidateGRN -->|"Valid"| UpdateInventory[Update Inventory]
    ValidateGRN -->|"Invalid"| DisplayErrors[Display Validation Errors]
    DisplayErrors --> CorrectErrors[Correct Errors]
    CorrectErrors --> ValidateGRN
    
    UpdateInventory --> GenerateJournalEntries[Generate Journal Entries]
    GenerateJournalEntries --> PostToLedger[Post to General Ledger]
    
    PostToLedger --> UpdateVendorBalance[Update Vendor Balance]
    UpdateVendorBalance --> UpdateStatusPosted[Update Status to Posted]
    
    UpdateStatusPosted --> GenerateNotifications[Generate Notifications]
    GenerateNotifications --> End([End])
```

## 5. GRN Component Interaction

```mermaid
flowchart TD
    GRNPage[GRN Page] --> GRNHeader[GRN Header Component]
    GRNPage --> TabsContainer[Tabs Container]
    
    GRNHeader --> BasicInfoSection[Basic Info Section]
    GRNHeader --> ActionButtons[Action Buttons]
    GRNHeader --> StatusDisplay[Status Display]
    
    TabsContainer --> ItemsTab[Items Tab]
    TabsContainer --> ExtraCostsTab[Extra Costs Tab]
    TabsContainer --> StockMovementTab[Stock Movement Tab]
    TabsContainer --> JournalEntriesTab[Journal Entries Tab]
    TabsContainer --> TaxEntriesTab[Tax Entries Tab]
    TabsContainer --> CommentsTab[Comments Tab]
    TabsContainer --> AttachmentsTab[Attachments Tab]
    TabsContainer --> ActivityLogTab[Activity Log Tab]
    
    ItemsTab --> ItemsGrid[Items Grid]
    ItemsTab --> BulkActions[Bulk Actions]
    ItemsTab --> ItemDetailForm[Item Detail Form]
    
    ExtraCostsTab --> CostsGrid[Costs Grid]
    ExtraCostsTab --> DistributionSettings[Distribution Settings]
    
    StockMovementTab --> MovementsGrid[Movements Grid]
    StockMovementTab --> MovementDetails[Movement Details]
    
    JournalEntriesTab --> JournalGrid[Journal Grid]
    JournalEntriesTab --> AccountingDetails[Accounting Details]
    
    TaxEntriesTab --> TaxInvoiceDetails[Tax Invoice Details]
    TaxEntriesTab --> TaxCalculations[Tax Calculations]
    
    GRNPage --> SummarySection[Summary Section]
    SummarySection --> TotalsDisplay[Totals Display]
    SummarySection --> CurrencyDisplay[Currency Display]
```

## 6. GRN Status Transitions

```mermaid
stateDiagram-v2
    [*] --> Draft: Create GRN
    
    Draft --> Pending: Submit for Approval
    Draft --> Cancelled: Cancel
    
    Pending --> Approved: Approve
    Pending --> Rejected: Reject
    Pending --> Draft: Return to Draft
    
    Approved --> Posted: Post GRN
    Approved --> Draft: Return to Draft
    
    Rejected --> Draft: Return to Draft
    
    Posted --> Void: Void GRN
    
    Cancelled --> [*]
    Void --> [*]
``` 