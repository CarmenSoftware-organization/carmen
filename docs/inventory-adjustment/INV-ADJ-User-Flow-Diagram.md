# Inventory Adjustment Module - User Flow Diagrams

**Document Status:** Draft  
**Last Updated:** March 27, 2024

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Table of Contents

1. [Introduction](#1-introduction)
2. [Adjustment Lifecycle Flow](#2-adjustment-lifecycle-flow)
3. [Adjustment Creation Flow](#3-adjustment-creation-flow)
4. [Item Management Flow](#4-item-management-flow)
5. [Lot Selection Flow](#5-lot-selection-flow)
6. [Document Management Flow](#6-document-management-flow)
7. [Posting and Financial Flow](#7-posting-and-financial-flow)
8. [Mobile User Flow](#8-mobile-user-flow)
9. [Error Handling Flow](#9-error-handling-flow)

## 1. Introduction

This document provides visual representations of user flows within the Inventory Adjustment module of the Carmen F&B Management System. These diagrams illustrate typical user journeys and interactions with the system, helping to understand the workflow and user experience.

## 2. Adjustment Lifecycle Flow

The following diagram illustrates the complete lifecycle of an inventory adjustment from creation to completion.

```mermaid
graph TD
    A[Start] --> B[Create Adjustment]
    B --> C[Save as Draft]
    C --> D[Edit Draft]
    D --> E{Submit?}
    E -->|No| D
    E -->|Yes| F[Submit]
    F --> G[Ready for Posting]
    G --> H{Post Now?}
    H -->|No| I[Remain in Ready State]
    I --> H
    H -->|Yes| J[Post Adjustment]
    J --> K[Update Inventory]
    K --> L[Generate Journal Entries]
    L --> M[Posted Status]
    M --> N{Need to Void?}
    N -->|No| O[End]
    N -->|Yes| P[Void Adjustment]
    P --> Q[Reverse Inventory]
    Q --> R[Reverse Journal Entries]
    R --> S[Voided Status]
    S --> O
```

## 3. Adjustment Creation Flow

This diagram shows the step-by-step process for creating a new inventory adjustment.

```mermaid
graph TD
    A[Start] --> B[Navigate to Adjustments]
    B --> C[Click New Adjustment]
    C --> D[Select Adjustment Type]
    D --> E[Select Location]
    E --> F[Select Reason Code]
    F --> G[Enter Description]
    G --> H[Select Department]
    H --> I[Add Items]
    I --> J{Lot Tracked?}
    J -->|Yes| K[Select Lots]
    J -->|No| L[Enter Quantity]
    K --> M[Enter Cost if Required]
    L --> M
    M --> N{More Items?}
    N -->|Yes| I
    N -->|No| O[Attach Documents]
    O --> P[Review Totals]
    P --> Q{Save as Draft?}
    Q -->|Yes| R[Save Draft]
    Q -->|No| S{Submit?}
    S -->|Yes| T[Submit]
    S -->|No| U[Cancel]
    R --> V[Draft Created]
    T --> W[Ready for Posting]
    U --> X[Discard Changes]
    V --> Y[End]
    W --> Y
    X --> Y
```

## 4. Item Management Flow

This diagram shows the process for managing items within an adjustment.

```mermaid
graph TD
    A[Start] --> B[Open Adjustment]
    B --> C[Navigate to Items Tab]
    C --> D{Action?}
    D -->|Add Item| E[Click Add Item]
    D -->|Edit Item| F[Select Item to Edit]
    D -->|Remove Item| G[Select Item to Remove]
    E --> H[Search for Product]
    H --> I[Select Product]
    I --> J{Lot Tracked?}
    J -->|Yes| K[Open Lot Selection]
    J -->|No| L[Enter Quantity]
    K --> M[Select Lots and Quantities]
    M --> N[Confirm Lot Selection]
    N --> L
    L --> O[Enter/Confirm Unit Cost]
    O --> P[Add Item to Adjustment]
    F --> Q[Open Edit Dialog]
    Q --> R[Modify Quantity]
    R --> S{Lot Tracked?}
    S -->|Yes| T[Modify Lot Selection]
    S -->|No| U[Update Unit Cost]
    T --> U
    U --> V[Save Changes]
    G --> W[Confirm Removal]
    W --> X[Remove Item]
    P --> Y[Update Totals]
    V --> Y
    X --> Y
    Y --> Z[End]
```

## 5. Lot Selection Flow

This diagram illustrates the process for selecting lots for lot-tracked items.

```mermaid
graph TD
    A[Start] --> B[Add/Edit Item]
    B --> C{Lot Tracked?}
    C -->|No| D[Skip Lot Selection]
    C -->|Yes| E[Open Lot Selection Dialog]
    E --> F[View Available Lots]
    F --> G{Action?}
    G -->|Select Existing Lot| H[Choose Lot]
    G -->|Create New Lot| I[Click New Lot]
    H --> J[Enter Quantity]
    I --> K[Enter Lot Number]
    K --> L[Enter Manufacturing Date]
    L --> M[Enter Expiry Date]
    M --> N[Enter Quantity]
    J --> O{More Lots?}
    N --> O
    O -->|Yes| G
    O -->|No| P[Calculate Total Quantity]
    P --> Q[Confirm Lot Selection]
    Q --> R[Return to Item Form]
    D --> R
    R --> S[End]
```

## 6. Document Management Flow

This diagram shows the process for managing documents attached to an adjustment.

```mermaid
graph TD
    A[Start] --> B[Open Adjustment]
    B --> C[Navigate to Documents Section]
    C --> D{Action?}
    D -->|Add Document| E[Click Add Document]
    D -->|View Document| F[Click Document]
    D -->|Remove Document| G[Click Remove]
    E --> H[Select File from Device]
    H --> I[Upload File]
    I --> J[Add Description]
    J --> K[Save Document]
    F --> L[Preview Document]
    L --> M{Download?}
    M -->|Yes| N[Download Document]
    M -->|No| O[Close Preview]
    G --> P[Confirm Removal]
    P --> Q[Remove Document]
    K --> R[Document Added]
    N --> S[Document Downloaded]
    O --> T[Return to Documents List]
    Q --> U[Document Removed]
    R --> V[End]
    S --> V
    T --> V
    U --> V
```

## 7. Posting and Financial Flow

This diagram illustrates the process for posting an adjustment and its financial impact.

```mermaid
graph TD
    A[Start] --> B[Open Adjustment]
    B --> C[Click Post]
    C --> D[Confirm Posting]
    D --> E[System Validates Adjustment]
    E --> F{Valid?}
    F -->|No| G[Show Validation Errors]
    F -->|Yes| H[Update Inventory Quantities]
    H --> I[Calculate Financial Impact]
    I --> J[Generate Journal Entries]
    J --> K[Update Item Costs]
    K --> L[Create Stock Movement Records]
    L --> M[Update Adjustment Status to Posted]
    M --> N[Show Success Message]
    G --> O[Return to Adjustment]
    N --> P[View Journal Entries]
    P --> Q[View Stock Movements]
    Q --> R[End]
    O --> R
```

## 8. Mobile User Flow

This diagram shows the user flow for mobile devices.

```mermaid
graph TD
    A[Start] --> B[Open Mobile App]
    B --> C[Navigate to Inventory]
    C --> D[Select Adjustments]
    D --> E{Action?}
    E -->|View List| F[Browse Adjustments]
    E -->|Create New| G[Tap + Button]
    E -->|Search| H[Enter Search Term]
    F --> I[Apply Filters]
    I --> J[Tap Adjustment]
    H --> K[View Search Results]
    K --> J
    G --> L[Simple Creation Form]
    L --> M[Add Items]
    M --> N[Review and Submit]
    J --> O[View Adjustment Details]
    O --> P{Action?}
    P -->|Post| Q[Tap Post]
    P -->|Edit| R[Tap Edit]
    Q --> S[Confirm Posting]
    R --> T[Mobile Edit Form]
    S --> U[Posting Confirmation]
    T --> V[Save Changes]
    U --> W[Return to List]
    V --> O
    N --> W
    W --> X[End]
```

## 9. Error Handling Flow

This diagram illustrates how errors are handled during the adjustment process.

```mermaid
graph TD
    A[Start] --> B{Action Type}
    B -->|Form Submission| C[Validate Form]
    B -->|API Request| D[Send Request]
    B -->|Data Processing| E[Process Data]
    
    C --> F{Valid?}
    F -->|Yes| G[Submit Form]
    F -->|No| H[Show Field Errors]
    H --> I[Highlight Invalid Fields]
    I --> J[Show Error Summary]
    J --> K[User Corrects Errors]
    K --> C
    
    D --> L{Success?}
    L -->|Yes| M[Process Response]
    L -->|No| N[Handle API Error]
    N --> O{Error Type}
    O -->|Validation| P[Show Validation Errors]
    O -->|Server| Q[Show Server Error]
    O -->|Network| R[Show Connection Error]
    O -->|Authorization| S[Show Permission Error]
    
    P --> T[Map Errors to Fields]
    Q --> U[Show Technical Details]
    R --> V[Offer Retry Option]
    S --> W[Show Access Denied]
    
    T --> X[User Corrects Data]
    U --> Y[Offer Support Contact]
    V --> Z{Retry?}
    Z -->|Yes| D
    Z -->|No| AA[Cancel Operation]
    W --> AB[Request Access]
    
    E --> AC{Processing Error?}
    AC -->|Yes| AD[Show Processing Error]
    AC -->|No| AE[Complete Operation]
    
    AD --> AF{Recoverable?}
    AF -->|Yes| AG[Offer Recovery Options]
    AF -->|No| AH[Show Failure Message]
    
    AG --> AI{Retry Processing?}
    AI -->|Yes| E
    AI -->|No| AJ[Cancel Processing]
    
    G --> AK[Show Success]
    M --> AK
    AE --> AK
    
    X --> AL[Resubmit]
    Y --> AM[Contact Support]
    AA --> AN[Return to Previous State]
    AB --> AO[Authentication Flow]
    AH --> AP[Show Error Details]
    AJ --> AQ[Return to Stable State]
    
    AL --> B
    AM --> AR[End with Support Ticket]
    AN --> AS[End with Cancellation]
    AO --> AT[End with Auth Redirect]
    AP --> AU[End with Error]
    AQ --> AV[End with Partial Success]
    AK --> AW[End with Success]
    
    AR --> AX[End]
    AS --> AX
    AT --> AX
    AU --> AX
    AV --> AX
    AW --> AX
``` 