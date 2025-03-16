# Stock Card Module - Product Requirements Document (PRD)

**Document Status:** Draft  
**Last Updated:** March 27, 2024  
**Author:** Carmen Development Team

## Table of Contents
1. [Overview](#1-overview)
2. [Feature Requirements](#2-feature-requirements)
3. [User Flows](#3-user-flows)
4. [Technical Requirements](#4-technical-requirements)
5. [UI Components](#5-ui-components)
6. [Performance Requirements](#6-performance-requirements)
7. [Security Requirements](#7-security-requirements)
8. [Error Handling](#8-error-handling)
9. [Future Enhancements](#9-future-enhancements)

## 1. Overview

### 1.1 Purpose
The Stock Card module provides a detailed view of inventory movements and balances for each item across different locations, with hierarchical item categorization and advanced filtering capabilities.

### 1.2 Target Users
- Inventory Managers
- Store Managers
- Finance Teams
- Operations Managers

### 1.3 Business Value
- Improved inventory visibility
- Better stock control
- Enhanced decision making
- Efficient stock tracking
- Accurate financial reporting

## 2. Feature Requirements

### 2.1 Navigation Structure
```mermaid
graph TD
    A[Inventory Overview] --> B[Stock Card]
    B --> C[Item List View]
    C --> D[Stock Card Detail View]
    D --> E[Transaction Drill Down]
```

### 2.2 Item List View Features

#### 2.2.1 Hierarchical Grouping
- Item Group
  - Primary classification
  - Group-level metrics
- Category
  - Secondary classification
  - Category-specific filters
- Sub-Category
  - Detailed classification
  - Specialized grouping

#### 2.2.2 Quick Filters
- Location
  - Single/Multiple selection
  - Location hierarchy support
- Item Status
  - Active/Inactive
  - Out of stock
  - Low stock
  - Excess stock
- Stock Level
  - Below minimum
  - Above maximum
  - Optimal range

#### 2.2.3 Advanced Filters
- Date Range
  - Custom periods
  - Preset ranges
- Movement Types
  - Receipts
  - Issues
  - Adjustments
  - Transfers
- Lot Numbers
  - Single/Multiple selection
  - Expiry date range
- Item Attributes
  - Custom fields
  - Tags
  - Classifications

### 2.3 Stock Card Detail View

#### 2.3.1 Item Information Header
- Item code and name
- Primary UOM
- Alternative UOMs
- Item classification
- Item status

#### 2.3.2 Current Stock Status
- Quantity on hand
- Available quantity
- Reserved quantity
- In-transit quantity
- Blocked quantity

#### 2.3.3 Movement History
- Transaction date
- Document reference
- Movement type
- Quantity in/out
- Running balance
- Unit cost
- Total value

#### 2.3.4 Graphical Representation
- Stock level trends
- Movement patterns
- Value analysis
- Usage statistics

## 3. User Flows

### 3.1 Main Navigation Flow
```mermaid
graph TD
    A[Start] --> B[Inventory Overview]
    B --> C[Stock Card Module]
    C --> D[Item List View]
    D --> E{Action?}
    E -->|View Details| F[Stock Card Detail]
    E -->|Apply Filters| G[Filtered View]
    E -->|Group Items| H[Grouped View]
    F --> I[Transaction History]
    I --> J[Drill Down]
    G --> D
    H --> D
```

### 3.2 Filtering Flow
```mermaid
graph TD
    A[Item List] --> B{Filter Type}
    B -->|Quick Filter| C[Select Location]
    B -->|Advanced Filter| D[Open Filter Panel]
    C --> E[Apply Location Filter]
    D --> F[Select Multiple Criteria]
    F --> G[Set Date Range]
    G --> H[Choose Categories]
    H --> I[Select Movement Types]
    I --> J[Apply Filters]
    E --> K[Update List View]
    J --> K
```

### 3.3 Stock Card Detail Flow
```mermaid
graph TD
    A[Select Item] --> B[Load Stock Card]
    B --> C[View Header Info]
    C --> D{View Options}
    D -->|Movements| E[Transaction List]
    D -->|Summary| F[Stock Summary]
    D -->|Analytics| G[Graphs/Charts]
    E --> H[Select Transaction]
    H --> I[View Details]
    I --> J[Related Documents]
```

### 3.4 Detailed User Flow Diagrams

#### 3.4.1 Complete User Interaction Flow
```mermaid
graph TD
    Start([Start]) --> A[Landing Page]
    A --> B[Inventory Overview]
    B --> C[Stock Card Module]
    
    %% Main List View Interactions
    C --> D[Item List View]
    D --> E{User Action}
    
    %% Filter Path
    E -->|Filter| F[Filter Options]
    F --> F1[Quick Filters]
    F --> F2[Advanced Filters]
    F1 --> F3[Apply Filters]
    F2 --> F3
    F3 --> D
    
    %% Group Path
    E -->|Group| G[Grouping Options]
    G --> G1[Select Group Level]
    G1 --> G2[Apply Grouping]
    G2 --> D
    
    %% Sort Path
    E -->|Sort| H[Sort Options]
    H --> H1[Select Sort Field]
    H1 --> H2[Apply Sorting]
    H2 --> D
    
    %% Detail View Path
    E -->|View Details| I[Stock Card Detail]
    I --> J{Detail Actions}
    
    %% Transaction History
    J -->|View History| K[Transaction History]
    K --> K1[Filter Transactions]
    K1 --> K2[View Transaction Details]
    K2 --> K3[Related Documents]
    K3 --> K
    
    %% Stock Status
    J -->|View Status| L[Current Stock Status]
    L --> L1[Location Breakdown]
    L1 --> L2[Value Analysis]
    L2 --> L
    
    %% Analytics
    J -->|View Analytics| M[Analytics Dashboard]
    M --> M1[Stock Trends]
    M1 --> M2[Movement Analysis]
    M2 --> M3[Usage Patterns]
    M3 --> M
    
    %% Export Options
    J -->|Export| N[Export Options]
    N --> N1[Select Format]
    N1 --> N2[Configure Data]
    N2 --> N3[Download]
    
    %% Return Paths
    K --> I
    L --> I
    M --> I
    N3 --> I
    I --> D
    
    %% Error States
    D -->|Error| ERR1[Display Error]
    I -->|Error| ERR2[Display Error]
    ERR1 --> D
    ERR2 --> I
    
    %% Legend
    classDef default fill:#f9f,stroke:#333,stroke-width:2px
    classDef error fill:#ff9999,stroke:#333,stroke-width:2px
    class ERR1,ERR2 error
```

#### 3.4.2 Filter and Search Flow
```mermaid
graph TD
    Start([Start]) --> A[Item List View]
    
    %% Quick Filter Flow
    A --> B{Filter Type}
    B -->|Quick| C[Quick Filter Bar]
    C --> C1[Location Filter]
    C --> C2[Status Filter]
    C --> C3[Stock Level Filter]
    
    %% Advanced Filter Flow
    B -->|Advanced| D[Advanced Filter Panel]
    D --> D1[Date Range]
    D --> D2[Movement Types]
    D --> D3[Lot Numbers]
    D --> D4[Item Attributes]
    
    %% Search Flow
    A --> E[Search Bar]
    E --> E1[Item Code Search]
    E --> E2[Description Search]
    E --> E3[Category Search]
    
    %% Apply Filters
    C1 --> F[Apply Filters]
    C2 --> F
    C3 --> F
    D1 --> F
    D2 --> F
    D3 --> F
    D4 --> F
    E1 --> F
    E2 --> F
    E3 --> F
    
    %% Results
    F --> G[Update Results]
    G --> H{Results Found?}
    H -->|Yes| I[Display Results]
    H -->|No| J[Show No Results]
    
    %% Reset
    I --> K[Reset Filters]
    J --> K
    K --> A
```

#### 3.4.3 Transaction Drill-Down Flow
```mermaid
graph TD
    Start([Start]) --> A[Stock Card Detail]
    A --> B[Transaction List]
    
    %% Transaction Selection
    B --> C{Select Transaction}
    C -->|GRN| D[GRN Details]
    C -->|Issue| E[Issue Details]
    C -->|Transfer| F[Transfer Details]
    C -->|Adjustment| G[Adjustment Details]
    
    %% Document Details
    D --> H[View GRN Document]
    E --> I[View Issue Document]
    F --> J[View Transfer Document]
    G --> K[View Adjustment Document]
    
    %% Related Information
    H --> L[Related Information]
    I --> L
    J --> L
    K --> L
    
    L --> M[Journal Entries]
    L --> N[Stock Movements]
    L --> O[User Actions]
    
    %% Return Path
    M --> P[Return to Transaction]
    N --> P
    O --> P
    P --> B
    
    %% Export Options
    B --> Q[Export Transaction]
    Q --> R[Select Format]
    R --> S[Download]
```

## 4. Technical Requirements

### 4.1 Data Structure
```typescript
interface StockCard {
  itemId: string
  itemCode: string
  itemName: string
  itemGroup: string
  category: string
  subCategory: string
  uom: string
  locations: Location[]
  movements: Movement[]
  currentStock: StockStatus
}

interface Location {
  id: string
  name: string
  stockOnHand: number
  reservedStock: number
  availableStock: number
}

interface Movement {
  transactionId: string
  date: Date
  type: MovementType
  quantity: number
  unitCost: number
  totalCost: number
  reference: string
  location: string
}

interface StockStatus {
  totalStock: number
  valueOnHand: number
  averageCost: number
  lastPurchaseDate: Date
  lastMovementDate: Date
}
```

### 4.2 API Endpoints
```typescript
// Required API endpoints
interface StockCardAPI {
  getItemList(filters: FilterCriteria): Promise<Item[]>
  getStockCard(itemId: string): Promise<StockCard>
  getMovements(itemId: string, filters: MovementFilters): Promise<Movement[]>
  getItemHierarchy(): Promise<ItemHierarchy>
  getLocations(): Promise<Location[]>
}
```

## 5. UI Components

### 5.1 List View Components
- Hierarchical Tree View for Categories
- Quick Filter Bar
- Advanced Filter Panel
- Item List Grid
- Group Headers
- Summary Cards

### 5.2 Detail View Components
- Item Information Header
- Stock Status Dashboard
- Movement History Timeline
- Transaction Grid
- Charts and Graphs
- Document Links

## 6. Performance Requirements

### 6.1 Loading Times
- Initial page load: < 2 seconds
- Filter application: < 1 second
- Stock card detail: < 1.5 seconds
- Transaction drill-down: < 1 second

### 6.2 Data Management
- Implement pagination for large datasets
- Cache frequently accessed data
- Lazy load transaction history
- Progressive loading for scrolling

## 7. Security Requirements

### 7.1 Access Control
- Role-based access control
- Location-based restrictions
- Cost visibility permissions
- Transaction detail access levels

### 7.2 Data Security
- Encrypted data transmission
- Audit logging
- Session management
- Data access validation

## 8. Error Handling

### 8.1 Error Scenarios
- No data available
- Network connectivity issues
- Invalid filter combinations
- Access denied scenarios

### 8.2 Error Messages
- User-friendly error messages
- Clear resolution steps
- Support contact information
- Error logging and tracking

## 9. Future Enhancements

### 9.1 Phase 2 Features
- Export capabilities
  - PDF export
  - Excel export
  - Custom report templates
- Custom report generation
  - User-defined layouts
  - Scheduled reports
  - Email distribution
- Batch operations
  - Multi-item updates
  - Bulk data export
  - Mass status changes
- Advanced analytics
  - Predictive analytics
  - Usage patterns
  - Cost analysis
  - Trend forecasting
- Mobile optimization
  - Responsive design
  - Mobile-specific features
  - Offline capabilities 