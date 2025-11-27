# Hotel Supply Chain Mobile App - Section Flow Diagram

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
The following diagram illustrates the primary user flows and relationships between the main sections of the hotel supply chain mobile application.

```mermaid
flowchart TD
    subgraph Authentication
        A[Login] --> B[Dashboard]
        A -- Forgot Password --> C[Password Reset]
        C --> A
    end

    subgraph Main_Navigation
        B -- Bottom Nav --> D[Purchase Approvals]
        B -- Bottom Nav --> E[Mobile Receiving]
        B -- Bottom Nav --> F[Inventory Management]
        B -- Bottom Nav --> G[Damage Reporting]
        D -- Back --> B
        E -- Back --> B
        F -- Back --> B
        G -- Back --> B
    end

    subgraph Notifications
        B -- Notification Icon --> H[Notification Center]
        H -- View Notification --> D
        H -- View Notification --> E
        H -- View Notification --> F
        H -- View Notification --> G
    end

    subgraph Purchase_Approval_Flow
        D --> D1[PR List]
        D1 --> D2[PR Details]
        D2 --> D3[Approve]
        D2 --> D4[Reject]
        D2 --> D5[Send Back]
        D3 --> D6[Confirmation]
        D4 --> D7[Rejection Reason]
        D5 --> D8[Feedback Form]
        D6 --> D1
        D7 --> D1
        D8 --> D1
        D1 --> D9[Approval History]
        D9 --> D1
    end

    subgraph Mobile_Receiving_Flow
        E --> E1[Scanner Interface]
        E1 -- Scan PO --> E2[PO Verification]
        E1 -- Manual Entry --> E2
        E2 --> E3[Item Verification]
        E3 -- Add Lot Info --> E3a[Lot Entry]
        E3a --> E3
        E3 -- All Items OK --> E4[Delivery Confirmation]
        E3 -- Issues Found --> E5[Exception Documentation]
        E5 --> E3
        E4 -- Complete --> E6[Receiving History]
        E6 --> E1
        E -- View Expected --> E7[Expected Deliveries]
        E7 --> E2
    end

    subgraph Inventory_Management_Flow
        F --> F1[Inventory Dashboard]
        F1 --> F2[Spot Check]
        F1 --> F3[Physical Count]
        F1 --> F4[Inventory Transfer]
        F1 --> F5[Cycle Count]
        
        F2 --> F2a[Scan Items]
        F2a --> F2b[Discrepancy Report]
        F2b --> F2c[Adjustment]
        F2c --> F2

        F3 --> F3a[Count Setup]
        F3a --> F3b[Count Execution]
        F3b --> F3c[Reconciliation]
        F3c --> F3

        F4 --> F4a[Source Selection]
        F4a --> F4b[Destination Selection]
        F4b --> F4c[Item Selection]
        F4c --> F4d[Transfer Confirmation]
        F4d --> F4
        
        F5 --> F5a[Schedule Review]
        F5a --> F5b[Item List]
        F5b --> F5c[Count Entry]
        F5c --> F5
    end

    subgraph Damage_Reporting_Flow
        G --> G1[Report List]
        G1 --> G2[New Report]
        G2 --> G3[Item Details]
        G3 --> G4[Photo Documentation]
        G4 --> G5[Submit Report]
        G5 --> G6[Approval Flow]
        G6 -- Approved --> G1
        G6 -- Sent Back --> G3
        G1 -- View Details --> G7[Report Details]
        G7 --> G1
    end

    subgraph Settings_Profile
        B -- Profile Icon --> S1[User Profile]
        S1 --> S2[Notification Settings]
        S1 --> S3[App Preferences]
        S1 --> S4[Help & Support]
        S2 --> S1
        S3 --> S1
        S4 --> S1
    end

    subgraph Admin_Area
        S1 -- Admin Only --> A1[User Management]
        A1 --> A2[Role Management]
        A2 --> A3[Department Settings]
        A3 --> A4[System Configuration]
        A4 --> A1
    end

    %% Styling
    classDef primary fill:#1a73e8,stroke:#0d47a1,color:white
    classDef approvals fill:#4caf50,stroke:#2e7d32,color:white
    classDef receiving fill:#ff9800,stroke:#e65100,color:white
    classDef inventory fill:#009688,stroke:#00796b,color:white
    classDef damage fill:#f44336,stroke:#b71c1c,color:white
    classDef auth fill:#9c27b0,stroke:#6a1b9a,color:white
    classDef settings fill:#607d8b,stroke:#37474f,color:white
    classDef admin fill:#795548,stroke:#4e342e,color:white

    class B primary
    class D,D1,D2,D3,D4,D5,D6,D7,D8,D9 approvals
    class E,E1,E2,E3,E3a,E4,E5,E6,E7 receiving
    class F,F1,F2,F2a,F2b,F2c,F3,F3a,F3b,F3c,F4,F4a,F4b,F4c,F4d,F5,F5a,F5b,F5c inventory
    class G,G1,G2,G3,G4,G5,G6,G7 damage
    class A,C auth
    class H,S1,S2,S3,S4 settings
    class A1,A2,A3,A4 admin