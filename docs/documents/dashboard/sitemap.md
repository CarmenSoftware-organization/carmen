# Dashboard Module Sitemap

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Navigation Hierarchy

```mermaid
graph TD
    A[Main Dashboard] --> B[Header]
    A --> C[Metric Cards]
    A --> D[Status Cards]
    A --> E[Charts Section]
    A --> F[Activities Table]

    B --> B1[Search Bar]
    B --> B2[Notifications]
    B --> B3[Settings]
    B --> B4[Sidebar Toggle]

    C --> C1[Total Orders]
    C --> C2[Active Suppliers]
    C --> C3[Inventory Value]
    C --> C4[Monthly Spend]

    D --> D1[Critical Stock Items]
    D --> D2[Orders Pending Approval]
    D --> D3[Completed Deliveries]

    E --> E1[Order Trends Chart]
    E --> E2[Spend Analysis Chart]
    E --> E3[Supplier Growth Chart]

    F --> F1[Activity Row]
    F1 --> F2[Actions Menu]
    F2 --> F3[View Details]
    F2 --> F4[Edit]
    F2 --> F5[Delete]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e9
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
```

## User Flow Diagram

```mermaid
flowchart LR
    Start([User Login]) --> Dashboard[Dashboard Page]

    Dashboard --> Search{Search Action?}
    Search -->|Yes| SearchResults[Search Results]
    Search -->|No| ViewMetrics[View Metrics]

    ViewMetrics --> CheckStatus{Check Status?}
    CheckStatus -->|Critical Items| CriticalView[Critical Stock View]
    CheckStatus -->|Pending Orders| PendingView[Pending Approvals]
    CheckStatus -->|Deliveries| DeliveryView[Delivery Status]

    Dashboard --> AnalyzeCharts{Analyze Charts?}
    AnalyzeCharts -->|Order Trends| OrderChart[Order Trends Details]
    AnalyzeCharts -->|Spend Analysis| SpendChart[Spend Details]
    AnalyzeCharts -->|Supplier Growth| SupplierChart[Supplier Analytics]

    Dashboard --> ActivityTable[Recent Activities]
    ActivityTable --> ActivityAction{Select Action}
    ActivityAction -->|View| ActivityDetail[Activity Details Page]
    ActivityAction -->|Edit| EditActivity[Edit Activity]
    ActivityAction -->|Delete| ConfirmDelete[Confirm Deletion]

    Dashboard --> NavModule{Navigate Module?}
    NavModule -->|Procurement| ProcurementModule[Procurement Module]
    NavModule -->|Inventory| InventoryModule[Inventory Module]
    NavModule -->|Vendors| VendorModule[Vendor Module]
    NavModule -->|Reports| ReportsModule[Reports Module]

    style Dashboard fill:#4fc3f7
    style ActivityDetail fill:#81c784
    style ProcurementModule fill:#ffb74d
```

## Route Structure

```mermaid
graph LR
    Root[/] --> Dashboard[/dashboard]

    Dashboard --> Components[Components]
    Components --> Header[dashboard-header.tsx]
    Components --> Cards[dashboard-cards.tsx]
    Components --> Charts[dashboard-chart.tsx]
    Components --> Table[dashboard-data-table.tsx]

    Dashboard --> Actions[User Actions]
    Actions --> View[View Activity Details]
    Actions --> Edit[Edit Activity]
    Actions --> Delete[Delete Activity]
    Actions --> Nav[Navigate to Module]

    View --> PR[/procurement/purchase-requests/:id]
    View --> PO[/procurement/purchase-orders/:id]
    View --> GRN[/procurement/goods-received-note/:id]
    View --> Inv[/inventory-management/*]

    Nav --> ProcModule[/procurement/*]
    Nav --> InvModule[/inventory-management/*]
    Nav --> VendorModule[/vendor-management/*]
    Nav --> ReportModule[/reporting-analytics/*]

    style Dashboard fill:#90caf9
    style Components fill:#a5d6a7
    style Actions fill:#ffcc80
```

## Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant H as Header
    participant M as Metrics Cards
    participant C as Charts
    participant T as Activities Table
    participant A as API

    U->>D: Navigate to Dashboard
    D->>H: Render Header
    H-->>U: Display Search, Notifications, Settings

    D->>M: Load Metrics
    M->>A: Fetch Dashboard Metrics
    A-->>M: Return Metrics Data
    M-->>U: Display Metric Cards

    D->>C: Load Charts
    C->>A: Fetch Chart Data
    A-->>C: Return Chart Data
    C-->>U: Display Visualizations

    D->>T: Load Activities
    T->>A: Fetch Recent Activities
    A-->>T: Return Activities
    T-->>U: Display Activity Table

    U->>T: Click Action Menu
    T-->>U: Show Actions (View/Edit/Delete)

    U->>T: Select View
    T->>D: Navigate to Detail Page
    D-->>U: Show Activity Details
```

## Data Flow Architecture

```mermaid
graph TB
    subgraph Client
        UI[Dashboard UI]
        State[Client State]
    end

    subgraph Server
        API[API Routes]
        DB[(Database)]
        Cache[Redis Cache]
    end

    subgraph External
        WS[WebSocket Server]
        Analytics[Analytics Service]
    end

    UI -->|Request Metrics| API
    API -->|Check Cache| Cache
    Cache -->|Cache Miss| DB
    DB -->|Return Data| API
    API -->|Cache Result| Cache
    API -->|Response| UI

    UI -->|Subscribe Updates| WS
    WS -->|Real-time Metrics| UI

    UI -->|Track Events| Analytics
    Analytics -->|Usage Data| DB

    State -->|Persist Preferences| API
    API -->|Save Settings| DB

    style UI fill:#e3f2fd
    style API fill:#f3e5f5
    style DB fill:#e8f5e9
    style WS fill:#fff3e0
    style Analytics fill:#fce4ec
```

## Integration Map

```mermaid
graph TD
    Dashboard[Dashboard Module]

    Dashboard --> Procurement[Procurement Module]
    Dashboard --> Inventory[Inventory Module]
    Dashboard --> Vendor[Vendor Module]
    Dashboard --> Finance[Finance Module]
    Dashboard --> Reports[Reports & Analytics]
    Dashboard --> System[System Administration]

    Procurement --> PR[Purchase Requests]
    Procurement --> PO[Purchase Orders]
    Procurement --> GRN[Goods Received Notes]

    Inventory --> Stock[Stock Overview]
    Inventory --> Count[Physical Count]
    Inventory --> Spot[Spot Check]
    Inventory --> Adj[Adjustments]

    Vendor --> VList[Vendor List]
    Vendor --> VProfile[Vendor Profiles]
    Vendor --> VPrice[Price Lists]

    Finance --> Invoices[Invoices]
    Finance --> Payments[Payments]
    Finance --> Budget[Budget Tracking]

    Reports --> Consumption[Consumption Analytics]
    Reports --> Performance[Performance Metrics]
    Reports --> Executive[Executive Summary]

    System --> Users[User Management]
    System --> Workflow[Workflow Config]
    System --> Permissions[Permissions]

    style Dashboard fill:#64b5f6
    style Procurement fill:#81c784
    style Inventory fill:#ffb74d
    style Vendor fill:#ba68c8
    style Finance fill:#4dd0e1
    style Reports fill:#ff8a65
    style System fill:#a1887f
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Loading: Page Load
    Loading --> Authenticated: Auth Success
    Loading --> Error: Auth Failure

    Authenticated --> FetchingData: Load Dashboard Data
    FetchingData --> DisplayingData: Data Loaded
    FetchingData --> Error: Fetch Failed

    DisplayingData --> Interacting: User Action

    Interacting --> SearchMode: Search
    Interacting --> ViewingDetails: View Activity
    Interacting --> EditingActivity: Edit Activity
    Interacting --> NavigatingModule: Navigate Away

    SearchMode --> DisplayingData: Clear Search
    ViewingDetails --> DisplayingData: Close Details
    EditingActivity --> SavingChanges: Save
    SavingChanges --> DisplayingData: Success
    SavingChanges --> Error: Save Failed

    NavigatingModule --> [*]: Leave Dashboard

    Error --> DisplayingData: Retry
    Error --> [*]: Fatal Error
```

## Permission-Based Navigation

```mermaid
graph TD
    User[Authenticated User]

    User --> CheckRole{Check Role}

    CheckRole -->|Staff| StaffView[Staff Dashboard View]
    CheckRole -->|Dept Manager| DeptView[Department Dashboard View]
    CheckRole -->|Financial Manager| FinView[Financial Dashboard View]
    CheckRole -->|Purchasing Staff| PurchView[Purchasing Dashboard View]
    CheckRole -->|Executive| ExecView[Executive Dashboard View]

    StaffView --> LimitedMetrics[Limited Metrics]
    StaffView --> DeptActivities[Dept Activities Only]

    DeptView --> DeptMetrics[Department Metrics]
    DeptView --> DeptTeamActivities[Team Activities]
    DeptView --> ApprovalQueue[Approval Queue]

    FinView --> FullFinMetrics[Full Financial Metrics]
    FinView --> BudgetAlerts[Budget Alerts]
    FinView --> SpendAnalysis[Spend Analysis]

    PurchView --> ProcurementMetrics[Procurement Metrics]
    PurchView --> VendorMetrics[Vendor Metrics]
    PurchView --> OrderQueue[Order Queue]

    ExecView --> AllMetrics[All System Metrics]
    ExecView --> AllActivities[All Activities]
    ExecView --> ExecutiveReports[Executive Reports]

    style User fill:#42a5f5
    style StaffView fill:#66bb6a
    style DeptView fill:#ffa726
    style FinView fill:#ab47bc
    style PurchView fill:#26c6da
    style ExecView fill:#ef5350
```

## Mobile Navigation Flow

```mermaid
flowchart TD
    MobileStart([Mobile User]) --> MobileDash[Mobile Dashboard]

    MobileDash --> HamburgerMenu{Open Menu?}
    HamburgerMenu -->|Yes| SidebarSheet[Sidebar Sheet]
    HamburgerMenu -->|No| ScrollContent[Scroll Content]

    SidebarSheet --> SelectModule[Select Module]
    SelectModule --> CloseSheet[Close Sheet]
    CloseSheet --> ModulePage[Navigate to Module]

    ScrollContent --> ViewCards[View Metric Cards]
    ViewCards --> ViewCharts[View Charts]
    ViewCharts --> ViewTable[View Activities]

    ViewTable --> SwipeRow{Swipe Action?}
    SwipeRow -->|Left| QuickActions[Quick Actions]
    SwipeRow -->|Right| ActivityMenu[Activity Menu]
    SwipeRow -->|Tap| ActivityDetails[Activity Details]

    QuickActions --> ViewAction[View]
    QuickActions --> EditAction[Edit]

    ActivityMenu --> MoreOptions[More Options]
    MoreOptions --> Delete[Delete]
    MoreOptions --> Share[Share]

    style MobileDash fill:#80deea
    style SidebarSheet fill:#ffcc80
    style ViewCards fill:#a5d6a7
    style ViewTable fill:#ce93d8
```
