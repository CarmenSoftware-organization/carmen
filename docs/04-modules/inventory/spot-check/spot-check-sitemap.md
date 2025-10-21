# Spot Check Module - Complete Site Map

## Module Navigation Structure

```mermaid
graph TD
    %% Main Module Entry
    A[Spot Check Module<br/>/inventory-management/spot-check] --> B[Main Spot Check Page<br/>/spot-check]
    A --> C[Dashboard<br/>/spot-check/dashboard]
    A --> D[New Spot Check<br/>/spot-check/new]
    A --> E[Active Counts<br/>/spot-check/active]
    A --> F[Completed Counts<br/>/spot-check/completed]

    %% Main Page Components
    B --> G[Count Detail Modal<br/>CountDetailForm]
    B --> H[List View<br/>CountListItem]
    B --> I[Grid View<br/>CountDetailCard]
    B --> J[Filter Controls<br/>Search + Dropdowns]
    B --> K[Location Filter Panel<br/>Conditional Display]

    %% Dashboard Components
    C --> L[Statistics Cards<br/>Active Counters, Items, Reviews]
    C --> M[Active Counts Panel<br/>Real-time Monitoring]
    C --> N[Pending Reviews Panel<br/>Approval Queue]
    C --> O[Latest Activities Panel<br/>Activity Feed]

    %% New Spot Check Components
    D --> P[Creation Form<br/>NewSpotCheckForm]
    D --> Q[Item Preview Panel<br/>Selected Items Display]
    D --> R[Form Validation<br/>Zod Schema]

    %% Active Counts Components
    E --> S[Active Count Detail<br/>/spot-check/active/[id]]
    E --> T[Status Filters<br/>Filter Controls]
    E --> U[Count Session Cards<br/>Progress Display]

    %% Active Count Detail Components
    S --> V[Count Interface<br/>CountDetailForm]
    S --> W[Session Controls<br/>Pause/Complete]
    S --> X[Progress Tracking<br/>Real-time Updates]

    %% Completed Counts Components
    F --> Y[Completed Count Detail<br/>/spot-check/completed/[id]]
    F --> Z[Search & Filters<br/>Search Bar + Date Filter]
    F --> AA[Export Options<br/>Download Buttons]

    %% Data Flow Connections
    P -.->|Creates| S
    S -.->|Completes| Y
    V -.->|Submits| F

    %% Modal/Overlay Connections
    G -.->|Modal over| B
    V -.->|Full screen| S
```

## Data Flow Diagram

```mermaid
graph LR
    subgraph "Spot Check Creation"
        A1[Setup Parameters] --> A2[Filter Items]
        A2 --> A3[Random/High Value Selection]
        A3 --> A4[Create Count Session]
    end

    subgraph "Count Execution"
        B1[Load Count Session] --> B2[Display Items]
        B2 --> B3[Record Counts]
        B3 --> B4[Calculate Variances]
        B4 --> B5[Submit Results]
    end

    subgraph "Data Storage"
        C1[Count Templates]
        C2[Active Sessions]
        C3[Count Results]
        C4[Variance Reports]
    end

    A4 --> B1
    B5 --> C3
    C3 --> C4
```

## User Flow Paths

```mermaid
journey
    title Spot Check User Journey
    section Setup
      Navigate to Spot Check: 5: User
      Click New Spot Check: 5: User
      Select Counter: 4: User
      Choose Department: 4: User
      Pick Store Location: 4: User
      Set Count Date: 3: User
      Choose Selection Method: 4: User
      Set Item Count: 3: User
      Review Selected Items: 5: User
      Create Spot Check: 5: User
    section Execution
      Start Active Count: 5: Counter
      View Item List: 4: Counter
      Count First Item: 3: Counter
      Record Quantity: 4: Counter
      Note Item Status: 4: Counter
      Continue to Next Item: 4: Counter
      Complete All Items: 5: Counter
      Review Count Summary: 5: Counter
      Submit Final Results: 5: Counter
    section Review
      View Completed Counts: 4: Manager
      Analyze Variances: 5: Manager
      Generate Reports: 4: Manager
```

## Component Hierarchy

```mermaid
graph TD
    A[SpotCheck Root] --> B[Dashboard Page]
    A --> C[New Spot Check Page]
    A --> D[Active Count Page]
    A --> E[Completed Count Page]

    B --> B1[Count List Item]
    B --> B2[Count Detail Card]
    B --> B3[Filter Controls]
    B --> B4[View Toggle]

    C --> C1[New Spot Check Form]
    C1 --> C2[Counter Selection]
    C1 --> C3[Department Selection]
    C1 --> C4[Store Selection]
    C1 --> C5[Date Picker]
    C1 --> C6[Selection Method]
    C1 --> C7[Item Count Input]
    C1 --> C8[Item Preview Panel]

    D --> D1[Count Detail Form]
    D1 --> D2[Count Items Component]
    D1 --> D3[Count Progress]
    D1 --> D4[Count Summary]

    E --> E1[Completed Count List]
    E1 --> E2[Count Result Display]
    E1 --> E3[Variance Analysis]
```

## Workflow States

```mermaid
stateDiagram-v2
    [*] --> Setup
    Setup --> ItemSelection: Configure Parameters
    ItemSelection --> SessionCreated: Create Count
    SessionCreated --> InProgress: Start Count
    InProgress --> Paused: Pause Count
    Paused --> InProgress: Resume Count
    InProgress --> Completed: Complete All Items
    Completed --> Submitted: Submit Results
    Submitted --> [*]

    Setup --> [*]: Cancel
    InProgress --> [*]: Cancel Count
```

## Page Structure Summary

| Page | Route | Components | Key Features |
|------|-------|------------|--------------|
| Dashboard | `/spot-check` | CountListItem, CountDetailCard, Filters | List/Grid view, Status filtering |
| New Count | `/spot-check/new` | NewSpotCheckForm, ItemPreview | Form validation, Real-time preview |
| Active Count | `/spot-check/active/[id]` | CountDetailForm, CountItems | Item counting, Progress tracking |
| Completed | `/spot-check/completed` | CompletedCountList | Results viewing, Variance analysis |

*Generated: September 25, 2025*
*Source: Complete codebase analysis of Spot Check module*