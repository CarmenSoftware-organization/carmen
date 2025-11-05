# Flow Diagrams: Purchase Orders

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Orders
- **Document Type**: Flow Diagrams (FD)
- **Version**: 2.0.0
- **Last Updated**: 2025-10-31
- **Status**: Approved

**Document History**:
- v1.0.0 (2025-10-30): Initial version with approval workflow diagrams
- v2.0.0 (2025-10-31): Removed Diagram 2 (Approval Workflow) and Diagram 9 (Multi-Level Approval Sequence), updated all remaining diagrams to remove approval workflow logic

## Related Documents
- [Business Requirements](./BR-purchase-orders.md)
- [Use Cases](./UC-purchase-orders.md)
- [Technical Specification](./TS-purchase-orders.md)
- [Data Definition](./DS-purchase-orders.md)
- [Validations](./VAL-purchase-orders.md)

---

## Overview

This document provides visual representations of purchase order workflows, data flows, and state transitions. All diagrams use Mermaid syntax for version control and maintainability.

**Diagram Types**:
- Process Flow Diagrams: User and system workflows
- Data Flow Diagrams: Information movement
- State Transition Diagrams: Status lifecycle
- Sequence Diagrams: System interactions
- Integration Flow Diagrams: External system interactions

---

## 1. Purchase Order Creation Process Flow

\`\`\`mermaid
flowchart TD
    Start([User Starts PO Creation]) --> CheckSource{Source?}
    
    CheckSource -->|From PR| SelectPR[Select Approved PRs]
    CheckSource -->|Manual| ManualEntry[Manual PO Entry]
    
    SelectPR --> FilterPRs[Filter by Vendor/Dept]
    FilterPRs --> SelectItems[Select PR Items]
    SelectItems --> ValidateVendor{Same Vendor?}
    
    ValidateVendor -->|No| ErrorVendor[Show Error: Mixed Vendors]
    ErrorVendor --> FilterPRs
    ValidateVendor -->|Yes| PopulateForm[Populate PO Form]
    
    ManualEntry --> SelectVendor[Select Vendor]
    SelectVendor --> PopulateForm
    
    PopulateForm --> EnterDetails[Enter Order Details:<br/>- Delivery Date<br/>- Location<br/>- Terms]
    EnterDetails --> AddLineItems[Add/Review Line Items]
    AddLineItems --> ApplyDiscount[Apply Discount<br/>Optional]
    ApplyDiscount --> AddShipping[Add Shipping<br/>Optional]
    AddShipping --> CalcTotals[Calculate Totals]
    CalcTotals --> AllocateBudget[Allocate to<br/>Budget Accounts]
    
    AllocateBudget --> ValidateBudget{Budget<br/>Available?}
    ValidateBudget -->|No| ShowBudgetError[Show Budget Error]
    ShowBudgetError --> AdjustPO{Adjust PO?}
    AdjustPO -->|Yes| AddLineItems
    AdjustPO -->|No| CancelCreate[Cancel Creation]
    
    ValidateBudget -->|Yes| ValidateForm{Form<br/>Valid?}
    ValidateForm -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> EnterDetails
    
    ValidateForm -->|Yes| CreatePO[Create PO Record]
    CreatePO --> GeneratePONum[Generate PO Number]
    GeneratePONum --> CreateLineItems[Create Line Items]
    CreateLineItems --> CreateBudgetAlloc[Create Budget Allocations]
    CreateBudgetAlloc --> UpdatePRStatus[Update PR Status<br/>if from PR]
    UpdatePRStatus --> CreateAuditLog[Create Audit Log Entry]
    CreateAuditLog --> End([PO Created<br/>Status: Draft])
    
    CancelCreate --> EndCancel([Creation Cancelled])
\`\`\`

**Description**: Complete flow for creating a purchase order from purchase requests or manually.

## 2. Send Purchase Order to Vendor

\`\`\`mermaid
flowchart TD
    Start([PO Status: Draft]) --> UserClickSend[User Clicks<br/>'Send to Vendor']
    UserClickSend --> DisplayDialog[Display Send Dialog]
    
    DisplayDialog --> LoadVendorEmail[Load Vendor<br/>Email Address]
    LoadVendorEmail --> ValidateEmail{Email<br/>Valid?}
    
    ValidateEmail -->|No| ShowEmailError[Show Error:<br/>Invalid Email]
    ShowEmailError --> AllowManual[Allow Manual<br/>Email Entry]
    AllowManual --> DisplayDialog
    
    ValidateEmail -->|Yes| PrepareEmail[Prepare Email:<br/>- Subject<br/>- Body Template<br/>- CC Recipients]
    PrepareEmail --> UserReview[User Reviews<br/>Email Content]
    UserReview --> UserAdditions{Add CC or<br/>Attachments?}
    
    UserAdditions -->|Yes| AddCCAttach[Add CC Recipients<br/>or Attachments]
    AddCCAttach --> UserReview
    
    UserAdditions -->|No| UserConfirm{User<br/>Confirms<br/>Send?}
    UserConfirm -->|No| SaveDraft[Save as Draft]
    SaveDraft --> EndDraft([Email Saved<br/>Not Sent])
    
    UserConfirm -->|Yes| GeneratePDF[Generate PO PDF]
    GeneratePDF --> PDFSuccess{PDF<br/>Generated?}
    
    PDFSuccess -->|No| PDFError[Show PDF Error]
    PDFError --> RetryPDF{Retry?}
    RetryPDF -->|Yes| GeneratePDF
    RetryPDF -->|No| EndError([Send Failed])
    
    PDFSuccess -->|Yes| SendEmail[Send Email<br/>with Attachments]
    SendEmail --> EmailSuccess{Email<br/>Sent?}
    
    EmailSuccess -->|No| LogEmailError[Log Email Error]
    LogEmailError --> ShowEmailFailed[Show Error Message]
    ShowEmailFailed --> RetryOptions{User<br/>Action}
    RetryOptions -->|Retry| SendEmail
    RetryOptions -->|Download PDF| DownloadPDF[Download PDF<br/>for Manual Send]
    RetryOptions -->|Cancel| EndError
    DownloadPDF --> EndManual([Manual Send<br/>Required])
    
    EmailSuccess -->|Yes| UpdatePOStatus[Update PO Status<br/>to 'Sent']
    UpdatePOStatus --> RecordSentDetails[Record:<br/>- Sent Timestamp<br/>- Sent By<br/>- Recipient Email]
    RecordSentDetails --> CreateCommLog[Create Communication<br/>Log Entry]
    CreateCommLog --> SetExpectedAck[Set Expected<br/>Acknowledgment Date]
    SetExpectedAck --> UpdateActivityLog[Update Activity Log]
    UpdateActivityLog --> NotifyStaff[Notify Purchasing<br/>Staff]
    NotifyStaff --> End([PO Sent to Vendor<br/>Status: Sent])
\`\`\`

**Description**: Process for sending purchase order to vendor via email with PDF attachment.

---

## 3. Purchase Order Change Order Process

\`\`\`mermaid
flowchart TD
    Start([PO Status: Sent/Acknowledged]) --> UserInitiate[User Clicks<br/>'Request Change Order']
    UserInitiate --> DisplayChangeForm[Display Change Order Form]
    
    DisplayChangeForm --> ShowCurrentPO[Show Current<br/>PO Details<br/>Read-Only]
    ShowCurrentPO --> UserMakeChanges[User Makes Changes:<br/>- Quantities<br/>- Prices<br/>- Dates<br/>- Add/Remove Items]
    
    UserMakeChanges --> CalculateImpact[Calculate Impact:<br/>- New Totals<br/>- Change %<br/>- Budget Impact]
    CalculateImpact --> DisplayComparison[Display Comparison:<br/>Original vs New]
    
    DisplayComparison --> UserEnterReason[User Enters<br/>Change Reason<br/>Required]
    UserEnterReason --> UserSubmitChange{User<br/>Submits<br/>Change?}
    
    UserSubmitChange -->|No| CancelChange([Change<br/>Cancelled])
    
    UserSubmitChange -->|Yes| ValidateChanges{Changes<br/>Valid?}
    ValidateChanges -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> UserMakeChanges
    
    ValidateChanges -->|Yes| CheckBudget{Budget<br/>Available<br/>for Increase?}
    CheckBudget -->|No| BudgetError[Show Budget Error]
    BudgetError --> AdjustChange{Adjust<br/>Changes?}
    AdjustChange -->|Yes| UserMakeChanges
    AdjustChange -->|No| CancelChange
    
    CheckBudget -->|Yes| EvaluateSignificance{Total<br/>Change<br/>>10%?}

    EvaluateSignificance -->|Yes| RequireManagerAuth[Require Manager<br/>Authorization]
    RequireManagerAuth --> NotifyManager[Notify Manager]
    NotifyManager --> ManagerReview{Manager<br/>Authorizes?}

    ManagerReview -->|No| RejectChange[Reject Change Order]
    RejectChange --> NotifyRejection[Notify User]
    NotifyRejection --> EndRejected([Change Rejected])

    ManagerReview -->|Yes| ApplyChanges[Apply Changes<br/>Immediately]

    EvaluateSignificance -->|No| ApplyChanges
    
    ApplyChanges --> CreateRevision[Create PO Revision<br/>Rev 1, Rev 2, etc.]
    CreateRevision --> UpdatePO[Update PO Details]
    UpdatePO --> LogHistory[Log All Changes<br/>in History]
    LogHistory --> CheckPOSent{Was PO<br/>Already<br/>Sent?}
    
    CheckPOSent -->|No| UpdateBudget[Update Budget<br/>Encumbrance]
    CheckPOSent -->|Yes| PrepareVendorNotice[Prepare Vendor<br/>Change Notice]
    PrepareVendorNotice --> SendChangeNotice[Send Revised PO<br/>to Vendor]
    SendChangeNotice --> LogVendorComm[Log Vendor<br/>Communication]
    LogVendorComm --> UpdateBudget
    
    UpdateBudget --> NotifyStakeholders[Notify Stakeholders]
    NotifyStakeholders --> End([Change Order Complete])
\`\`\`

**Description**: Process for modifying sent purchase orders with change order control and manager authorization for significant changes (>10%).

---

## 4. Purchase Order Cancellation Process

\`\`\`mermaid
flowchart TD
    Start([User Initiates Cancellation]) --> CheckPOStatus{Current<br/>PO Status}
    
    CheckPOStatus -->|Draft| SimpleCancellation[Simple Cancellation<br/>No Vendor Notification]
    CheckPOStatus -->|Sent/Acknowledged| CheckReceipts{Items<br/>Received?}
    
    CheckReceipts -->|Yes| CannotCancel[Cannot Cancel:<br/>Items Already Received]
    CannotCancel --> OfferOptions[Offer Options:<br/>- Partial Cancel<br/>- Return Process<br/>- Close PO]
    OfferOptions --> UserChoice{User<br/>Selects}
    UserChoice -->|Partial| PartialCancel[Cancel Unreceived<br/>Items Only]
    UserChoice -->|Return| RedirectReturn[Redirect to<br/>Return Process]
    UserChoice -->|Close| ClosePO[Close PO as<br/>Completed]
    UserChoice -->|Cancel| EndNoAction([Action Cancelled])
    
    CheckReceipts -->|No| CheckShipment{Items<br/>in Transit?}
    CheckShipment -->|Yes| WarnTransit[Warn: Items May<br/>Arrive, Prepare to Return]
    WarnTransit --> RequireConfirm{User<br/>Confirms<br/>Risk?}
    RequireConfirm -->|No| EndNoAction
    RequireConfirm -->|Yes| VendorNotification
    
    CheckShipment -->|No| VendorNotification[Vendor Notification<br/>Required]
    SimpleCancellation --> ShowCancelDialog[Display Cancellation Dialog]
    VendorNotification --> ShowCancelDialog
    
    ShowCancelDialog --> RequireReason[Require Cancellation<br/>Reason Entry]
    RequireReason --> EnterComments[User Enters<br/>Detailed Comments]
    EnterComments --> CheckAuthority{User Has<br/>Authority?}
    
    CheckAuthority -->|No| RequestManagerApproval[Request Manager<br/>Approval]
    RequestManagerApproval --> ManagerReviews[Manager Reviews<br/>Cancellation Request]
    ManagerReviews --> ManagerDecision{Manager<br/>Approves?}
    ManagerDecision -->|No| NotifyDenied[Notify User:<br/>Request Denied]
    NotifyDenied --> EndDenied([Cancellation Denied])
    ManagerDecision -->|Yes| ProceedCancel[Proceed with<br/>Cancellation]
    
    CheckAuthority -->|Yes| UserConfirm{User<br/>Confirms?}
    UserConfirm -->|No| EndNoAction
    UserConfirm -->|Yes| ProceedCancel
    
    ProceedCancel --> UpdatePOStatus[Update PO Status<br/>to 'Cancelled']
    UpdatePOStatus --> RecordCancellation[Record:<br/>- Cancelled Timestamp<br/>- Cancelled By<br/>- Reason]
    RecordCancellation --> ReleaseBudget[Release Budget<br/>Encumbrance]
    ReleaseBudget --> UpdatePRStatus{From PR?}
    
    UpdatePRStatus -->|Yes| RevertPRStatus[Update PR Status<br/>to 'Approved - Not Ordered']
    UpdatePRStatus -->|No| CreateAuditLog
    RevertPRStatus --> CreateAuditLog[Create Audit Log<br/>Entry]
    
    CreateAuditLog --> NeedVendorNotice{Vendor<br/>Notification<br/>Needed?}
    NeedVendorNotice -->|Yes| SendCancellationEmail[Send Cancellation<br/>Notice to Vendor]
    SendCancellationEmail --> LogVendorComm[Log Vendor<br/>Communication]
    LogVendorComm --> NotifyStakeholders
    
    NeedVendorNotice -->|No| NotifyStakeholders[Notify:<br/>- Creator<br/>- Manager<br/>- Budget Controller]
    NotifyStakeholders --> End([PO Cancelled])
    
    PartialCancel --> PartialProcess[Process Partial<br/>Cancellation]
    PartialProcess --> End
    RedirectReturn --> EndRedirect([Redirected to<br/>Return Module])
    ClosePO --> EndClosed([PO Closed])
\`\`\`

**Description**: Purchase order cancellation with vendor notification and budget release.

---

## 5. Purchase Order Status State Transition Diagram

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft: Create PO

    Draft --> Sent: Send to Vendor
    Draft --> Cancelled: Cancel Draft
    Draft --> [*]: Delete

    Sent --> Acknowledged: Vendor Confirms
    Sent --> PartiallyReceived: Receive Some Items
    Sent --> Cancelled: Cancel (with Vendor Notice)
    Sent --> OnHold: Place on Hold

    Acknowledged --> PartiallyReceived: Receive Some Items
    Acknowledged --> FullyReceived: Receive All Items
    Acknowledged --> OnHold: Place on Hold

    OnHold --> Draft: Resume (if draft)
    OnHold --> Sent: Resume (if sent)
    OnHold --> Acknowledged: Resume (if acknowledged)
    OnHold --> Cancelled: Cancel While on Hold

    PartiallyReceived --> FullyReceived: Receive Remaining Items
    PartiallyReceived --> Completed: Close with Partial Receipt
    PartiallyReceived --> OnHold: Place on Hold

    FullyReceived --> Completed: Auto-Complete (30 days)
    FullyReceived --> Completed: Manual Complete

    Completed --> [*]: Archive
    Cancelled --> [*]: Archive

    note right of Draft
        User can edit freely
        No budget impact
    end note

    note right of Sent
        Budget encumbered
        Vendor notified
        Change requires
        change order process
    end note

    note right of FullyReceived
        All quantities received
        30-day grace period
        before auto-complete
    end note

    note right of Completed
        Read-only
        Historical record
        Cannot reopen
    end note
\`\`\`

**Description**: Complete state machine showing all possible PO status transitions and constraints.

**State Guard Descriptions**:

**Send to Vendor Guard**:
- **Condition Name**: Can Send to Vendor
- **Description**: PO can only be sent if all validations pass and vendor contact is valid
- **Required Checks**:
  - PO status is 'Draft'
  - At least one line item exists
  - All required fields completed
  - Budget is available for total amount
  - Vendor has valid email address
  - PO PDF can be generated
  - User has 'send_purchase_orders' permission
- **Implementation**: System validates before email transmission and creates budget encumbrance

**Receive Items Guard**:
- **Condition Name**: Can Receive Items
- **Description**: Items can only be received against sent/acknowledged POs
- **Required Checks**:
  - PO status is 'Sent' or 'Acknowledged'
  - Receiving location matches delivery location
  - Quantities within tolerance (+5%)
  - Line items match PO
- **Implementation**: GRN creation validates against PO

**Complete PO Guard**:
- **Condition Name**: Can Complete
- **Description**: PO can only be completed when all conditions are met
- **Required Checks**:
  - All items fully received OR partial receipt approved
  - No open quality issues or disputes
  - 30 days elapsed since full receipt (for auto-complete)
  - All related invoices processed (if integrated)
  - Budget fully reconciled
- **Implementation**: Automated job checks conditions daily

**Cancel Guard**:
- **Condition Name**: Can Cancel
- **Description**: PO can be cancelled if no items have been received
- **Required Checks**:
  - No GRN entries exist for this PO
  - User has cancellation authority based on PO amount
  - Cancellation reason provided
  - If sent: Vendor notification prepared
- **Implementation**: System prevents cancellation if items received

---

## 6. Budget Integration Data Flow

\`\`\`mermaid
flowchart LR
    subgraph PO_System["Purchase Order System"]
        CreatePO[Create PO]
        SendPO[Send PO to Vendor]
        ModifyPO[Modify PO]
        CancelPO[Cancel PO]
        ReceiveGoods[Receive Goods via GRN]
    end

    subgraph Budget_System["Budget Management System"]
        CheckAvailability[Check Budget<br/>Availability]
        CreateEncumbrance[Create<br/>Encumbrance]
        AdjustEncumbrance[Adjust<br/>Encumbrance]
        ReleaseEncumbrance[Release<br/>Encumbrance]
        ConvertToExpense[Convert<br/>to Expense]
    end

    CreatePO -->|Budget Check Request| CheckAvailability
    CheckAvailability -->|Available Amount| CreatePO

    SendPO -->|Encumbrance Request| CreateEncumbrance
    CreateEncumbrance -->|Transaction ID| SendPO
    
    ModifyPO -->|Adjustment Request| AdjustEncumbrance
    AdjustEncumbrance -->|Updated Transaction| ModifyPO
    
    CancelPO -->|Release Request| ReleaseEncumbrance
    ReleaseEncumbrance -->|Confirmation| CancelPO
    
    ReceiveGoods -->|Conversion Request| ConvertToExpense
    ConvertToExpense -->|Expense Record| ReceiveGoods
    
    style PO_System fill:#e1f5ff
    style Budget_System fill:#fff4e1
\`\`\`

**Description**: Data flow between purchase order system and budget management system.

---

## 7. Vendor Communication Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    actor User
    participant PO_System
    participant Email_Service
    participant PDF_Generator
    participant Vendor
    participant Audit_Log
    
    User->>PO_System: Click "Send to Vendor"
    PO_System->>PO_System: Validate PO Status = Draft
    PO_System->>PO_System: Load Vendor Contact Info
    PO_System-->>User: Display Send Dialog
    
    User->>PO_System: Review and Confirm Send
    PO_System->>PDF_Generator: Generate PO PDF
    PDF_Generator-->>PO_System: Return PDF File
    
    alt PDF Generation Success
        PO_System->>Email_Service: Send Email with PDF
        Email_Service->>Vendor: Deliver Email
        Vendor-->>Email_Service: Email Received
        Email_Service-->>PO_System: Send Confirmation
        
        PO_System->>PO_System: Update PO Status to "Sent"
        PO_System->>PO_System: Record Sent Timestamp
        PO_System->>Audit_Log: Log Communication
        PO_System-->>User: Success Message
        
    else PDF Generation Failed
        PDF_Generator-->>PO_System: Error
        PO_System-->>User: Show Error, Offer Retry
    else Email Send Failed
        Email_Service-->>PO_System: Delivery Failed
        PO_System->>Audit_Log: Log Failed Attempt
        PO_System-->>User: Show Error, Offer Manual Send
    end
    
    opt Vendor Acknowledgment
        Vendor->>PO_System: Acknowledge Receipt (via Portal)
        PO_System->>PO_System: Update Status to "Acknowledged"
        PO_System->>Audit_Log: Log Acknowledgment
        PO_System-->>User: Notify Acknowledgment
    end
\`\`\`

**Description**: Sequence of interactions when sending PO to vendor with error handling.

## 8. Goods Receipt Integration Flow

\`\`\`mermaid
flowchart TD
    Start([GRN Created]) --> GRNApproved{GRN<br/>Approved?}
    
    GRNApproved -->|No| EndWait([Wait for GRN Approval])
    
    GRNApproved -->|Yes| GetPORef[Get Referenced<br/>PO ID]
    GetPORef --> FetchPO[Fetch PO Details]
    FetchPO --> GetGRNLines[Get GRN Line Items]
    
    GetGRNLines --> LoopLines{For Each<br/>GRN Line}
    LoopLines --> FindPOLine[Find Matching<br/>PO Line Item]
    FindPOLine --> UpdateReceived[Update<br/>Quantity Received]
    UpdateReceived --> CalcRemaining[Calculate<br/>Quantity Remaining]
    CalcRemaining --> CheckTolerance{Within<br/>Tolerance?}
    
    CheckTolerance -->|No| FlagOverReceipt[Flag Over-Receipt<br/>Requires Review]
    CheckTolerance -->|Yes| NextLine
    FlagOverReceipt --> NextLine{More<br/>Lines?}
    
    NextLine -->|Yes| LoopLines
    NextLine -->|No| EvaluateStatus[Evaluate Overall<br/>PO Status]
    
    EvaluateStatus --> AnyRemaining{Any Items<br/>Remaining?}
    AnyRemaining -->|Yes| SetPartiallyReceived[Set Status:<br/>'Partially Received']
    AnyRemaining -->|No| SetFullyReceived[Set Status:<br/>'Fully Received']
    
    SetPartiallyReceived --> UpdateBudget1[Convert Received<br/>Portion to Expense]
    SetFullyReceived --> UpdateBudget2[Convert All<br/>Encumbrance to Expense]
    
    UpdateBudget1 --> LogHistory1[Log Status Change]
    UpdateBudget2 --> LogHistory2[Log Status Change]
    
    LogHistory1 --> NotifyPartial[Notify Purchasing Staff:<br/>Partial Receipt]
    LogHistory2 --> NotifyFull[Notify All:<br/>Fully Received]
    
    NotifyPartial --> SetAutoComplete{30 Days<br/>Since Full<br/>Receipt?}
    NotifyFull --> SetAutoComplete
    
    SetAutoComplete -->|No| End([Status Updated])
    SetAutoComplete -->|Yes| AutoComplete[Auto-Complete PO]
    AutoComplete --> FinalizeStatus[Set Status:<br/>'Completed']
    FinalizeStatus --> ArchivePO[Archive PO]
    ArchivePO --> End
\`\`\`

**Description**: Automatic PO status update when goods are received via GRN.

---

## Summary

This document provides comprehensive visual representations of all major purchase order workflows including:

1. **Creation Process**: From PRs or manual entry
2. **Vendor Communication**: Sending POs with PDF generation
3. **Change Management**: Change order process with budget validation
4. **Cancellation**: Budget release and vendor notification
5. **State Transitions**: Complete lifecycle state machine
6. **Budget Integration**: Real-time budget system interaction
7. **Vendor Communication Sequence**: Email transmission sequence
8. **GRN Integration**: Automatic status updates on receipt

These diagrams serve as reference for developers, testers, and stakeholders to understand system behavior and data flows.

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-30 | System | Initial creation from template |
