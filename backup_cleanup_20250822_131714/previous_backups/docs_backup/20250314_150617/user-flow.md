# Purchase Request Module - User Flow Documentation

## 1. Overview

### 1.1 Purpose
This document details the user flows and interactions within the Purchase Request (PR) module, providing step-by-step guidance for all user roles and scenarios.

### 1.2 User Roles
- Requestor
- Department Approver
- Finance Approver
- Budget Controller
- Procurement Officer
- System Administrator

## 2. Main User Flows

### 2.1 Create Purchase Request
```mermaid
sequenceDiagram
    actor R as Requestor
    participant S as System
    participant B as Budget Check
    participant N as Notifications
    
    R->>S: Access PR Creation
    S->>R: Display PR Form
    R->>S: Fill PR Details
    S->>B: Validate Budget
    B-->>S: Budget Status
    S->>R: Show Budget Result
    R->>S: Add Items
    S->>R: Calculate Totals
    R->>S: Submit PR
    S->>N: Send Notifications
    N-->>R: Confirmation
```

### 2.2 Approval Process
```mermaid
sequenceDiagram
    actor R as Requestor
    actor A as Approver
    participant S as System
    participant N as Notifications
    
    R->>S: Submit PR
    S->>N: Send to Approver
    N-->>A: Notification
    A->>S: Review PR
    alt Approved
        A->>S: Approve
        S->>N: Notify Approval
        N-->>R: Approval Notice
    else Rejected
        A->>S: Reject
        S->>N: Notify Rejection
        N-->>R: Rejection Notice
    else Send Back
        A->>S: Return for Revision
        S->>N: Notify Return
        N-->>R: Revision Request
    end
```

### 2.3 Vendor Allocation
```mermaid
sequenceDiagram
    actor R as Requestor
    participant S as System
    participant V as Vendor DB
    participant N as Notifications
    
    R->>S: Access Vendor Selection
    S->>V: Fetch Vendor List
    V-->>S: Return Vendors
    S->>R: Display Vendors
    R->>S: Select Primary Vendor
    S->>V: Validate Vendor
    V-->>S: Validation Result
    alt Valid Vendor
        S->>R: Show Vendor Details
        R->>S: Set Vendor Terms
        S->>N: Notify Vendor
        N-->>R: Confirmation
    else Invalid Vendor
        S->>R: Show Error
        R->>S: Select Alternative
    end
```

### 2.4 Template Usage
```mermaid
sequenceDiagram
    actor R as Requestor
    participant S as System
    participant T as Templates
    
    R->>S: Select Create from Template
    S->>T: Fetch Templates
    T-->>S: Template List
    S->>R: Display Templates
    R->>S: Select Template
    S->>R: Pre-fill PR Form
    R->>S: Modify Details
    S->>R: Update Calculations
    R->>S: Submit PR
```

## 3. Detailed User Interactions

### 3.1 PR Creation Process
1. Access PR Creation
   - Navigate to PR module
   - Click "Create New PR"
   - Select creation method (blank/template)

2. Fill Header Information
   - Enter/select department
   - Choose currency
   - Set delivery date
   - Add description
   - Select priority
   - Select/assign vendor
   - Set vendor-specific terms

3. Vendor Selection
   - Search vendor database
   - View vendor details
   - Check vendor status
   - Review vendor ratings
   - Verify vendor compliance
   - Check vendor categories
   - Set vendor terms
   - Add alternate vendors

4. Add Items
   - Search/select items
   - Enter quantities
   - Add item notes
   - Set budget categories
   - Review pricing
   - Verify vendor availability
   - Check vendor quotations

5. Attach Documents
   - Upload files
   - Add document descriptions
   - Set document types
   - Review attachments

6. Submit PR
   - Review all details
   - Check budget status
   - Add submission notes
   - Confirm submission

### 3.2 Approval Process
1. Receive Approval Request
   - Get notification
   - Access PR details
   - Review information

2. Review PR Details
   - Check items
   - Verify budget
   - Review attachments
   - Check history

3. Take Action
   - Approve PR
   - Reject PR
   - Return for revision
   - Add comments
   - Set conditions

### 3.3 Template Management
1. Create Template
   - Start from existing PR
   - Set template name
   - Define default values
   - Set access rights

2. Use Template
   - Select template
   - Modify details
   - Update quantities
   - Adjust pricing
   - Submit PR

## 4. Error Handling

### 4.1 Validation Errors
1. Required Fields
   - Display error messages
   - Highlight missing fields
   - Show field requirements

2. Budget Validation
   - Show budget status
   - Display available amount
   - Highlight overages
   - Provide override options

3. Data Format Errors
   - Show format requirements
   - Highlight invalid entries
   - Provide correction guidance

### 4.2 System Errors
1. Connection Issues
   - Show connection status
   - Provide retry options
   - Save draft automatically
   - Recover last state

2. Processing Errors
   - Display error details
   - Provide error codes
   - Show recovery steps
   - Offer support contact

### 4.3 Budget Validation Process
The budget validation process is a critical component of the Purchase Request workflow, ensuring that all requests comply with financial controls and budget allocations.

```mermaid
flowchart TD
    %% Main nodes
    Start([Budget Check]) --> InitialCheck{Initial Budget\nValidation}
    
    %% Initial validation path
    InitialCheck -->|Check| FetchBudget[Fetch Budget Data]
    FetchBudget --> CalculateImpact[Calculate Budget Impact]
    CalculateImpact --> BudgetAvailable{Sufficient\nBudget?}
    
    %% Budget available path
    BudgetAvailable -->|Yes| ValidateSuccess[Budget Validation Passed]
    ValidateSuccess --> DisplayStatus[Display Budget Status]
    DisplayStatus --> AllowSubmit([Allow PR Submission])
    
    %% Budget not available path
    BudgetAvailable -->|No| CheckOverride{Override\nAllowed?}
    
    %% Override paths
    CheckOverride -->|Yes| OverrideRules[Check Override Rules]
    OverrideRules --> RequireApproval{Requires Special\nApproval?}
    RequireApproval -->|Yes| RequestApproval[Request Budget Override Approval]
    RequestApproval --> WaitForApproval[Wait for Override Approval]
    WaitForApproval --> OverrideDecision{Override\nApproved?}
    OverrideDecision -->|Yes| ValidateSuccess
    OverrideDecision -->|No| RejectOverride[Reject Override]
    RejectOverride --> DisplayError[Display Budget Error]
    
    RequireApproval -->|No| ValidateSuccess
    
    %% No override path
    CheckOverride -->|No| DisplayError
    DisplayError --> SuggestOptions[Suggest Options]
    SuggestOptions --> EditOptions{User Action?}
    
    %% Edit options
    EditOptions -->|Reduce Quantities| EditItems[Edit PR Items]
    EditItems --> InitialCheck
    
    EditOptions -->|Change Items| EditItems
    
    EditOptions -->|Cancel PR| CancelPR[Cancel PR]
    CancelPR --> End([End Budget Process])
    
    EditOptions -->|Save as Draft| SaveDraft[Save as Draft]
    SaveDraft --> End
    
    %% Styling with lighter colors
    classDef start fill:#C8F7C8,stroke:#324B4B,stroke-width:2px,color:black
    classDef process fill:#D6EBFC,stroke:#324B4B,stroke-width:1px,color:black
    classDef decision fill:#FFF0D4,stroke:#324B4B,stroke-width:1px,color:black
    classDef terminated fill:#FFD6D6,stroke:#324B4B,stroke-width:2px,color:black
    classDef success fill:#C8F7C8,stroke:#324B4B,stroke-width:2px,color:black
    classDef error fill:#FFD6D6,stroke:#324B4B,stroke-width:1px,color:black
    classDef end fill:#E0E0E0,stroke:#324B4B,stroke-width:2px,color:black
    
    class Start,AllowSubmit,End start
    class FetchBudget,CalculateImpact,ValidateSuccess,DisplayStatus,OverrideRules,RequestApproval,WaitForApproval,RejectOverride,DisplayError,SuggestOptions,EditItems,CancelPR,SaveDraft process
    class InitialCheck,BudgetAvailable,CheckOverride,RequireApproval,OverrideDecision,EditOptions decision
    class ValidateSuccess,AllowSubmit success
    class RejectOverride,DisplayError error
```

#### Budget Validation Steps:

1. **Initial Budget Check**
   - System retrieves current budget data
   - Calculates PR's impact on available budget
   - Compares PR total against available budget

2. **Budget Availability Decision**
   - If sufficient budget exists, validation passes
   - If insufficient budget, system checks override options

3. **Override Process**
   - System checks if user has override permissions
   - Determines if special approval is required
   - Routes override request to appropriate approvers
   - Tracks override approval status

4. **User Options When Budget Insufficient**
   - Reduce quantities or change items
   - Request budget override
   - Save as draft for later submission
   - Cancel the PR

5. **Budget Status Display**
   - Shows current budget allocation
   - Displays PR impact on budget
   - Indicates remaining budget after PR
   - Highlights any budget warnings or errors

## 5. User Interface States

### 5.1 PR Status Indicators
- Draft: Yellow
- Submitted: Blue
- Under Review: Orange
- Approved: Green
- Rejected: Red
- Cancelled: Grey
- Closed: Black
- Sent Back: Purple

### 5.2 Action Availability
- Edit: Draft status only
- Submit: Complete required fields
- Approve: Authorized approvers only
- Cancel: Before final approval
- Close: After completion

## 6. Notifications

### 6.1 Email Notifications
- PR Submission
- Approval Request
- Approval Decision
- Budget Alert
- Status Update
- Action Required

### 6.2 In-App Notifications
- Pending Actions
- Status Changes
- Budget Warnings
- System Messages
- Reminders

## 7. Mobile Experience

### 7.1 Mobile Views
- PR List
- PR Details
- Approval Actions
- Status Updates
- Notifications

### 7.2 Mobile Actions
- View PR Details
- Basic Approvals
- Status Checks
- Notifications
- Comments

## 8. Shortcuts and Quick Actions

### 8.1 Keyboard Shortcuts
- Alt + N: New PR
- Alt + S: Save Draft
- Alt + A: Approve
- Alt + R: Reject
- Ctrl + Enter: Submit

### 8.2 Quick Actions
- Copy PR
- Save Template
- Quick Approve
- Bulk Update
- Export Data

## 9. Help and Support

### 9.1 Contextual Help
- Field descriptions
- Process guidance
- Validation rules
- Error solutions
- Best practices

### 9.2 Support Access
- Help documentation
- Video tutorials
- Support contact
- FAQ access
- Training materials

## 10. Comprehensive Purchase Request Lifecycle

### 10.1 Complete PR Lifecycle Flowchart
```mermaid
flowchart TD
    %% Main nodes
    Start([Start]) --> ChooseCreation{Create from?}
    ChooseCreation -->|New| CreateBlank[Create Blank PR]
    ChooseCreation -->|Template| SelectTemplate[Select Template]
    
    SelectTemplate --> LoadTemplate[Load Template Data]
    LoadTemplate --> FillPRForm
    
    CreateBlank --> FillPRForm[Fill PR Form]
    FillPRForm --> AddItems[Add Items]
    AddItems --> AddAttachments[Add Attachments]
    
    AddAttachments --> SaveDraft[Save as Draft]
    SaveDraft --> EditDraft[Edit Draft]
    EditDraft --> AddItems
    
    SaveDraft --> ValidateBudget{Budget Check}
    ValidateBudget -->|Failed| BudgetOverride{Override?}
    BudgetOverride -->|Yes| SubmitPR[Submit PR]
    BudgetOverride -->|No| EditDraft
    
    ValidateBudget -->|Passed| SubmitPR
    SubmitPR --> NotifyApprovers[Notify Approvers]
    
    %% Department Approval
    NotifyApprovers --> DeptReview[Department Review]
    DeptReview --> DeptDecision{Dept Decision}
    DeptDecision -->|Approve| FinanceReview[Finance Review]
    DeptDecision -->|Reject| Rejected([PR Rejected])
    DeptDecision -->|Send Back| EditDraft
    
    %% Finance Approval
    FinanceReview --> FinanceDecision{Finance Decision}
    FinanceDecision -->|Approve| FinalApproval[Final Approval]
    FinanceDecision -->|Reject| Rejected
    FinanceDecision -->|Send Back| EditDraft
    
    %% Final Approval
    FinalApproval --> GMDecision{GM Decision}
    GMDecision -->|Approve| Approved([PR Approved])
    GMDecision -->|Reject| Rejected
    GMDecision -->|Send Back| EditDraft
    
    %% Post Approval
    Approved --> ConvertToPO[Convert to PO]
    ConvertToPO --> PRClosed([PR Closed])
    
    %% Cancellation path
    SaveDraft --> CancelPR[Cancel PR]
    CancelPR --> Cancelled([PR Cancelled])
    
    %% Styling with lighter colors
    classDef start fill:#C8F7C8,stroke:#324B4B,stroke-width:2px,color:black
    classDef process fill:#D6EBFC,stroke:#324B4B,stroke-width:1px,color:black
    classDef decision fill:#FFF0D4,stroke:#324B4B,stroke-width:1px,color:black
    classDef terminated fill:#FFD6D6,stroke:#324B4B,stroke-width:2px,color:black
    classDef success fill:#C8F7C8,stroke:#324B4B,stroke-width:2px,color:black
    
    class Start start
    class CreateBlank,SelectTemplate,LoadTemplate,FillPRForm,AddItems,AddAttachments,SaveDraft,EditDraft,SubmitPR,NotifyApprovers,DeptReview,FinanceReview,FinalApproval,ConvertToPO,CancelPR process
    class ChooseCreation,ValidateBudget,BudgetOverride,DeptDecision,FinanceDecision,GMDecision decision
    class Rejected,Cancelled terminated
    class Approved,PRClosed success
```

### 10.2 Role-Based PR Interaction Diagram
```mermaid
flowchart LR
    %% Actors
    Requestor((Requestor))
    DeptHead((Dept Head))
    Finance((Finance))
    GM((GM))
    ProcOfficer((Proc Officer))
    
    %% PR States
    Draft[Draft PR]
    Submitted[Submitted PR]
    DeptApproved[Dept Approved]
    FinanceApproved[Finance Approved]
    Approved[Approved PR]
    Rejected[Rejected PR]
    PO[Purchase Order]
    
    %% Connections - Requestor
    Requestor -->|Create| Draft
    Requestor -->|Submit| Submitted
    Requestor -->|Edit| Draft
    Requestor -->|View| Submitted
    Requestor -->|View| DeptApproved
    Requestor -->|View| FinanceApproved
    Requestor -->|View| Approved
    Requestor -->|View| Rejected
    
    %% Connections - Department Head
    DeptHead -->|Review| Submitted
    DeptHead -->|Approve| DeptApproved
    DeptHead -->|Reject| Rejected
    DeptHead -->|Send Back| Draft
    
    %% Connections - Finance
    Finance -->|Review| DeptApproved
    Finance -->|Approve| FinanceApproved
    Finance -->|Reject| Rejected
    Finance -->|Send Back| Draft
    
    %% Connections - GM
    GM -->|Review| FinanceApproved
    GM -->|Approve| Approved
    GM -->|Reject| Rejected
    GM -->|Send Back| Draft
    
    %% Connections - Procurement Officer
    ProcOfficer -->|View| Approved
    ProcOfficer -->|Convert| PO
    
    %% Styling with lighter colors
    classDef actor fill:#FFF0D4,stroke:#324B4B,stroke-width:2px,color:black,shape:circle
    classDef state fill:#D6EBFC,stroke:#324B4B,stroke-width:1px,color:black
    classDef rejected fill:#FFD6D6,stroke:#324B4B,stroke-width:1px,color:black
    classDef approved fill:#C8F7C8,stroke:#324B4B,stroke-width:1px,color:black
    classDef po fill:#E6D6F8,stroke:#324B4B,stroke-width:1px,color:black
    
    class Requestor,DeptHead,Finance,GM,ProcOfficer actor
    class Draft,Submitted,DeptApproved,FinanceApproved state
    class Rejected rejected
    class Approved approved
    class PO po
```

## 11. Appendices

### 11.1 Status Flow Diagram
```mermaid
graph TD
    Draft[Draft] -->|Submit| Submitted[Submitted]
    Submitted -->|Review| UnderReview[Under Review]
    UnderReview -->|Approve| Approved[Approved]
    UnderReview -->|Reject| Rejected[Rejected]
    UnderReview -->|Send Back| Draft
    Approved -->|Process| Closed[Closed]
    Draft -->|Cancel| Cancelled[Cancelled]
    UnderReview -->|Send Back for Revision| Draft
    Submitted -->|Send Back for Revision| Draft
    
    %% Styling with lighter colors
    classDef default fill:#D6EBFC,stroke:#324B4B,stroke-width:1px,color:black
    classDef approved fill:#C8F7C8,stroke:#324B4B,stroke-width:1px,color:black
    classDef rejected fill:#FFD6D6,stroke:#324B4B,stroke-width:1px,color:black
    classDef cancelled fill:#E0E0E0,stroke:#324B4B,stroke-width:1px,color:black
    
    class Approved,Closed approved
    class Rejected rejected
    class Cancelled cancelled
```

### 11.2 Screen Maps
1. PR List View
2. PR Creation Form
3. Approval View
4. Template Selection
5. Document Attachment
6. Budget Review
7. Status History
8. Audit Trail

## 12. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| UX Designer | | | |
| Business Analyst | | | |
| Training Lead | | | |
| User Representative | | | |
