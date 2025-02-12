# Purchase Request Process Flow

```mermaid
%%{init: { 
  'theme': 'base', 
  'themeVariables': { 
    'primaryColor': '#FFFFFF',
    'edgeLabelBackground':'#F6F7F8'
  }
}}%%

graph TD
    %% Start Point
    Start([Create Purchase Request]):::start

    %% Initial Steps
    Start --> Draft[Draft PR]:::process
    Draft --> ValidateB{"Budget
    Validation"}:::decision
    
    %% Budget Validation Path
    ValidateB -->|Insufficient| BudgetErr[Budget Error]:::error
    BudgetErr --> NotifyF[Notify Finance]:::process
    NotifyF --> Draft
    
    ValidateB -->|Sufficient| ItemCheck{"Item
    Validation"}:::decision
    
    %% Item Validation Path
    ItemCheck -->|Invalid| ItemErr[Item Error]:::error
    ItemErr --> NotifyP[Notify Procurement]:::process
    NotifyP --> Draft
    
    ItemCheck -->|Valid| Submit[Submit PR]:::process
    
    %% Approval Flow
    Submit --> L1{"Level 1
    Approval"}:::decision
    L1 -->|Reject| Rejected1[Rejected - L1]:::error
    L1 -->|Send Back| Draft
    Rejected1 --> Notify1[Notify Requestor]:::process
    Notify1 --> Draft

    L1 -->|Approve| CheckAmt{"Amount
    > 50K?"}:::decision
    
    CheckAmt -->|No| PRApproved[PR Approved]:::success
    
    CheckAmt -->|Yes| L2{"Level 2
    Approval"}:::decision
    L2 -->|Reject| Rejected2[Rejected - L2]:::error
    L2 -->|Send Back| Draft
    Rejected2 --> Notify2["Notify Requestor
    & L1 Approver"]:::process
    Notify2 --> Draft
    
    L2 -->|Approve| PRApproved
    
    %% PR Processing
    PRApproved --> CreatePO[Create PO]:::process
    CreatePO --> End([End]):::end

    %% Parallel Notifications
    PRApproved --> NotifyAll["Notify All
    Stakeholders"]:::process
    NotifyAll --> End

    %% System Integration
    PRApproved --> UpdateBudget["Update Budget
    Utilization"]:::system
    UpdateBudget --> End

    %% Styling Classes
    classDef start fill:#2ECC71,stroke:#27AE60,color:#FFFFFF
    classDef process fill:#3498DB,stroke:#2980B9,color:#FFFFFF
    classDef decision fill:#F1C40F,stroke:#F39C12,color:#000000
    classDef error fill:#E74C3C,stroke:#C0392B,color:#FFFFFF
    classDef success fill:#27AE60,stroke:#229954,color:#FFFFFF
    classDef system fill:#9B59B6,stroke:#8E44AD,color:#FFFFFF
```

## Process Description

### 1. Initial Steps
- **Create Purchase Request**: User initiates PR creation
- **Draft PR**: User fills in PR details
- **Budget Validation**: System checks budget availability
- **Item Validation**: System validates item details and specifications

### 2. Approval Workflow
- **Level 1 Approval**: Department head/immediate supervisor approval
- **Amount Check**: System checks if amount exceeds 50K threshold
- **Level 2 Approval**: Required for amounts > 50K (Finance/Senior Management)

### 3. Success Path
- **PR Approved**: Final approval state
- **Create PO**: System generates Purchase Order
- **Notify Stakeholders**: System sends notifications
- **Update Budget**: System updates budget utilization

### 4. Error Handling
- **Budget Error**: Insufficient budget handling
- **Item Error**: Invalid item specifications handling
- **Rejection Handling**: L1/L2 rejection processing

### 5. System Integration
- Budget Management System
- Notification System
- Document Management System
- Financial System

## Color Legend Explanation

- 🟢 **Green** (#2ECC71): Start/End points of the process
- 🔵 **Blue** (#3498DB): Process steps and actions
- 🟡 **Yellow** (#F1C40F): Decision points and validations
- 🔴 **Red** (#E74C3C): Error states and rejections
- 🟣 **Purple** (#9B59B6): System automated actions
- 🟩 **Dark Green** (#27AE60): Success states

## Notes
1. All rejections route back to Draft state for modification
2. Notifications are sent at each major state change
3. Budget is checked before and updated after approval
4. System maintains audit trail throughout the process 