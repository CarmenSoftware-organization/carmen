# Physical Count Module - Site Map

## Main Site Map Flow

```mermaid
graph TD
    A[Main Inventory Management] --> B[Physical Count Dashboard]
    A --> C[Physical Count Management]
    A --> D[Physical Count Creation Wizard]

    B --> B1[Statistics Overview]
    B --> B2[Activity Charts]
    B --> B3[Recent Counts]
    B --> B4[All Counts Table]
    B --> D

    C --> C1[List/Grid View Toggle]
    C --> C2[Search & Filters]
    C --> C3[Count Management Actions]
    C --> C4[New Count Modal]
    C --> C5[Count Detail Modal]

    D --> D1[Step 1: Setup]
    D --> D2[Step 2: Location Selection]
    D --> D3[Step 3: Item Review]
    D --> D4[Step 4: Final Review]

    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 --> E[Active Count Interface]

    E --> E1[Count Header Controls]
    E --> E2[Location Navigation Bar]
    E --> E3[Item Counting Interface]
    E --> E4[Progress Tracking Panel]

    E1 --> F[Count Completion]
    F --> G[Inventory Adjustments]
    F --> H[Reports & Analytics]

    C4 --> I[New Count Form]
    I --> J[Count Created]
    J --> C

    C5 --> K[Count Detail Form]
    K --> L[Count Updated]
    L --> C
```

## Detailed Page Navigation Flow

```mermaid
graph LR
    subgraph "Physical Count Creation Wizard"
        PCA["/physical-count"]
        PCA --> PC1["Step 1: Setup<br/>- Counter Name<br/>- Department<br/>- Date/Time<br/>- Notes"]
        PC1 --> PC2["Step 2: Location Selection<br/>- Multi-select locations<br/>- Location details<br/>- Validation"]
        PC2 --> PC3["Step 3: Item Review<br/>- Review items<br/>- Exclude options<br/>- Stock levels"]
        PC3 --> PC4["Step 4: Final Review<br/>- Summary<br/>- Confirmation<br/>- Submit"]
    end

    subgraph "Active Count Interface"
        PC4 --> ACI["/physical-count/active/[id]"]
        ACI --> ACH["Count Header<br/>- Session info<br/>- Duration<br/>- Controls"]
        ACI --> ACL["Location Bar<br/>- Location tabs<br/>- Item counts<br/>- Navigation"]
        ACI --> ACMI["Main Interface<br/>- Item list<br/>- Count inputs<br/>- Status selection"]
        ACI --> ACP["Progress Panel<br/>- Progress bar<br/>- Statistics<br/>- Completion"]
    end

    subgraph "Dashboard Interface"
        PCB["/physical-count/dashboard"] --> DS["Statistics Cards<br/>- Total counts<br/>- In progress<br/>- Active counters<br/>- Pending review"]
        PCB --> DC["Activity Chart<br/>- Time-based view<br/>- Filtering<br/>- Visualization"]
        PCB --> DR["Recent Counts<br/>- Latest activities<br/>- Status indicators<br/>- Quick access"]
        PCB --> DT["All Counts Table<br/>- Comprehensive view<br/>- Management actions<br/>- Bulk operations"]
    end

    subgraph "Management Interface"
        PCM["/physical-count-management"] --> MV["View Controls<br/>- List/Grid toggle<br/>- Filter options<br/>- Search functionality"]
        PCM --> ML["List View<br/>- Detailed rows<br/>- Action buttons<br/>- Status indicators"]
        PCM --> MG["Grid View<br/>- Card layout<br/>- Quick overview<br/>- Visual status"]
        PCM --> MM["Modals<br/>- New count form<br/>- Detail forms<br/>- Confirmations"]
    end
```

## Modal and Dialog Flow

```mermaid
graph TD
    subgraph "Management Modals"
        NCM[New Count Modal] --> NCF["New Count Form<br/>- Store selection<br/>- Department<br/>- Counter assignment<br/>- Date scheduling<br/>- Notes"]
        NCF --> NCS[Count Created Successfully]
        NCS --> CLOSE1[Close Modal]

        CDM[Count Detail Modal] --> CDF["Count Detail Form<br/>- Count configuration<br/>- Item management<br/>- Status updates<br/>- Progress tracking"]
        CDF --> CDS[Count Updated Successfully]
        CDS --> CLOSE2[Close Modal]
    end

    subgraph "Confirmation Dialogs"
        DEL[Delete Count] --> DCONF["Delete Confirmation<br/>- Confirm action<br/>- Warning message<br/>- Cancel/Proceed"]
        DCONF --> DELCONF[Count Deleted]

        COMP[Complete Count] --> CCONF["Completion Confirmation<br/>- Variance summary<br/>- Final review<br/>- Submit/Cancel"]
        CCONF --> INVENTORY[Update Inventory]
    end

    subgraph "Action Flows"
        START[Start Count] --> ACTIVE[Redirect to Active Interface]
        PAUSE[Pause Count] --> PAUSED[Count Paused State]
        RESUME[Resume Count] --> ACTIVE
        SCHEDULE[Schedule Count] --> SFORM[Scheduling Form]
        SFORM --> SCHEDULED[Count Scheduled]
    end
```

## Data Flow and State Management

```mermaid
graph TB
    subgraph "Data Sources"
        API[Physical Count API]
        MOCK[Mock Data]
        USER[User Context]
        INV[Inventory Data]
    end

    subgraph "State Management"
        FORM[Form State]
        COUNT[Count Data]
        FILTER[Filter State]
        PROGRESS[Progress State]
    end

    subgraph "Components"
        WIZARD[Creation Wizard]
        DASH[Dashboard]
        MGMT[Management]
        ACTIVE[Active Count]
    end

    API --> COUNT
    MOCK --> COUNT
    USER --> FORM
    INV --> COUNT

    COUNT --> WIZARD
    COUNT --> DASH
    COUNT --> MGMT
    COUNT --> ACTIVE

    FORM --> WIZARD
    FILTER --> MGMT
    FILTER --> DASH
    PROGRESS --> ACTIVE

    WIZARD --> |Submit| API
    ACTIVE --> |Update| API
    MGMT --> |CRUD| API
```

## URL Structure and Routes

```mermaid
graph LR
    subgraph "Route Structure"
        ROOT["/inventory-management"]

        ROOT --> PC["/physical-count"]
        ROOT --> PCD["/physical-count/dashboard"]
        ROOT --> PCM["/physical-count-management"]
        ROOT --> PCA["/physical-count/active/[id]"]

        PC --> |Wizard Steps| PC1["Step 1-4<br/>Component-based navigation"]
        PCD --> |Dashboard Views| PCD1["Statistics<br/>Charts<br/>Tables"]
        PCM --> |Management Views| PCM1["List View<br/>Grid View<br/>Modals"]
        PCA --> |Active Count| PCA1["Location-based<br/>Real-time counting"]
    end

    subgraph "Navigation Patterns"
        NAV1[Linear Wizard Flow]
        NAV2[Tab-based Dashboard]
        NAV3[Filter-based Management]
        NAV4[Location-based Active]

        PC1 --> NAV1
        PCD1 --> NAV2
        PCM1 --> NAV3
        PCA1 --> NAV4
    end
```

## Component Hierarchy Map

```mermaid
graph TD
    subgraph "Physical Count Module Components"
        PC[PhysicalCountPage] --> PS[PhysicalCountSetup]
        PC --> LS[LocationSelection]
        PC --> IR[ItemReview]
        PC --> FR[FinalReview]

        PCD[PhysicalCountDashboard] --> CT[CountsTable]
        PCD --> CHART[Activity Chart]
        PCD --> STATS[Statistics Cards]

        PCM[PhysicalCountManagement] --> CLI[CountListItem]
        PCM --> CDC[CountDetailCard]
        PCM --> NCF[NewCountForm]
        PCM --> CDF[CountDetailForm]

        PCAI[PhysicalActiveCountInterface] --> CH[CountHeader]
        PCAI --> LB[LocationBar]
        PCAI --> CI[CountInterface]
        PCAI --> PP[ProgressPanel]
    end

    subgraph "Shared UI Components"
        BUTTON[Button]
        CARD[Card]
        INPUT[Input]
        SELECT[Select]
        MODAL[Modal]
        BADGE[Badge]
        TABLE[Table]
    end

    PS --> BUTTON
    PS --> CARD
    PS --> INPUT
    PS --> SELECT

    LS --> BUTTON
    LS --> CARD

    IR --> TABLE
    IR --> BUTTON

    FR --> CARD
    FR --> BUTTON

    CLI --> CARD
    CLI --> BADGE
    CLI --> BUTTON

    CDC --> CARD
    CDC --> BADGE
    CDC --> BUTTON

    NCF --> MODAL
    NCF --> INPUT
    NCF --> SELECT

    CDF --> MODAL
    CDF --> INPUT
```