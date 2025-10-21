# Carmen ERP - System Architecture Documentation

> **Document Type:** Technical Architecture
> **Audience:** Senior Developers, System Architects, Technical Leads
> **Last Updated:** October 9, 2025
> **Version:** 1.0

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Module Architecture](#module-architecture)
5. [Data Architecture](#data-architecture)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Security Architecture](#security-architecture)
9. [Integration Architecture](#integration-architecture)
10. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Overview

Carmen ERP is a modern, cloud-ready hospitality management system built on Next.js 14 with TypeScript, implementing a server-side rendering strategy with client-side hydration for optimal performance.

### Architecture Principles

1. **Component-Based Architecture:** Modular, reusable React components
2. **Type Safety:** Strict TypeScript throughout
3. **Server-First:** Leverage Next.js App Router and Server Components
4. **Centralized Data:** Unified type system and mock data layer
5. **Role-Based Security:** Comprehensive RBAC implementation
6. **Responsive Design:** Mobile-first, accessible UI

---

## 🏗️ Technology Stack

### Frontend Layer

```mermaid
graph TB
    subgraph "Frontend Technologies"
        A[Next.js 14.0+]
        B[React 18]
        C[TypeScript 5.8+]
        D[Tailwind CSS 3.4+]
        E[Shadcn/ui Components]
    end

    subgraph "Component Library"
        F[Radix UI Primitives]
        G[Lucide Icons]
        H[React Hook Form]
        I[Zod Validation]
    end

    subgraph "State Management"
        J[Zustand]
        K[React Query/TanStack Query]
        L[React Context API]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    B --> H
    H --> I
    B --> J
    B --> K
    B --> L
```

### Technology Stack Details

| Layer | Technology | Version | Purpose |
|-------|------------|---------|----------|
| **Framework** | Next.js | 14.0+ | Full-stack React framework |
| **Language** | TypeScript | 5.8+ | Type-safe development |
| **UI Library** | React | 18 | Component-based UI |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **Components** | Shadcn/ui | Latest | Pre-built accessible components |
| **Primitives** | Radix UI | Latest | Headless UI components |
| **Icons** | Lucide React | Latest | Icon library |
| **Forms** | React Hook Form | Latest | Form state management |
| **Validation** | Zod | Latest | Schema validation |
| **State (Global)** | Zustand | Latest | Global state management |
| **State (Server)** | React Query | Latest | Server state & caching |
| **Date Utils** | date-fns | Latest | Date manipulation |
| **Testing** | Vitest | Latest | Unit testing |

---

## 🏛️ Architecture Layers

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[Web Browser]
        B[Mobile Browser]
    end

    subgraph "Application Layer"
        C[Next.js App Router]
        D[Page Components]
        E[Server Components]
        F[Client Components]
    end

    subgraph "Business Logic Layer"
        G[Server Actions]
        H[API Route Handlers]
        I[Business Rules]
        J[Workflow Engine]
    end

    subgraph "Data Access Layer"
        K[Type System]
        L[Mock Data Services]
        M[Data Validators]
        N[Type Guards]
        O[Type Converters]
    end

    subgraph "Cross-Cutting Concerns"
        P[Authentication]
        Q[Authorization RBAC]
        R[Logging]
        S[Error Handling]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    D --> F
    E --> G
    F --> G
    G --> I
    H --> I
    I --> J
    I --> L
    L --> K
    L --> M
    L --> N
    L --> O
    P --> G
    Q --> G
    R --> G
    S --> G
```

### Layer Responsibilities

#### 1. Presentation Layer
- **Responsibility:** User interface rendering
- **Technologies:** HTML, CSS (Tailwind), React Components
- **Pattern:** Component-based, responsive design

#### 2. Application Layer
- **Responsibility:** Application routing and component orchestration
- **Technologies:** Next.js App Router, React Server Components
- **Pattern:** File-system based routing, server-first rendering

#### 3. Business Logic Layer
- **Responsibility:** Business rules, validations, workflows
- **Technologies:** TypeScript, Server Actions, Zod
- **Pattern:** Domain-driven design, service-oriented

#### 4. Data Access Layer
- **Responsibility:** Data management, type safety, validation
- **Technologies:** TypeScript interfaces, Mock data, Validators
- **Pattern:** Repository pattern, type-safe data access

#### 5. Cross-Cutting Concerns
- **Responsibility:** Security, logging, error handling
- **Technologies:** User Context, RBAC, Error boundaries
- **Pattern:** Aspect-oriented programming

---

## 📦 Module Architecture

### Module Structure

```mermaid
graph LR
    subgraph "Core Business Modules"
        A[Procurement]
        B[Inventory Management]
        C[Vendor Management]
        D[Product Management]
    end

    subgraph "Operational Modules"
        E[Store Operations]
        F[Recipe Management]
        G[Production]
    end

    subgraph "Support Modules"
        H[Finance]
        I[Reporting & Analytics]
        J[System Administration]
    end

    subgraph "Foundation Modules"
        K[User Context]
        L[RBAC Engine]
        M[Workflow Engine]
    end

    A <-->|Stock Updates| B
    A <-->|Vendor Orders| C
    B <-->|Product Data| D
    B <-->|Transfers| E
    C <-->|Pricing| D
    D <-->|Recipes| F
    E <-->|Inventory| B
    F <-->|Production| G
    H <-->|Transactions| A
    H <-->|Valuation| B
    I <-->|Data| A
    I <-->|Data| B
    I <-->|Data| C
    J <-->|Config| K
    J <-->|Permissions| L
    J <-->|Workflows| M
    K --> A
    K --> B
    K --> C
    L --> A
    L --> B
    M --> A
```

### Module Dependencies

```mermaid
graph TD
    subgraph "Independent Modules No Dependencies"
        A[Product Management]
        B[Vendor Management]
        C[User Management]
    end

    subgraph "Low Dependency Modules"
        D[Recipe Management]
        E[Finance Configuration]
    end

    subgraph "Medium Dependency Modules"
        F[Store Operations]
        G[Inventory Management]
    end

    subgraph "High Dependency Modules"
        H[Procurement]
        I[Reporting & Analytics]
        J[Production]
    end

    A --> D
    A --> G
    A --> H
    B --> H
    C --> H
    D --> J
    E --> H
    E --> G
    G --> F
    G --> H
    G --> I
    H --> I
    F --> I
    D --> I
```

---

## 💾 Data Architecture

### Centralized Type System

All types are centralized in `/lib/types/`:

```mermaid
graph TB
    subgraph "Type System Structure"
        A[index.ts - Barrel Export]

        subgraph "Domain Types"
            B[common.ts]
            C[user.ts]
            D[inventory.ts]
            E[procurement.ts]
            F[vendor.ts]
            G[product.ts]
            H[recipe.ts]
            I[finance.ts]
        end

        subgraph "Utility Types"
            J[guards.ts]
            K[converters.ts]
            L[validators.ts]
        end
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Server Action
    participant V as Validator
    participant D as Data Service
    participant M as Mock Data
    participant T as Type Guards

    U->>C: User Action
    C->>S: Call Server Action
    S->>V: Validate Input (Zod)
    V-->>S: Validation Result

    alt Valid Input
        S->>D: Request Data Operation
        D->>M: Access Mock Data
        M-->>D: Return Data
        D->>T: Type Guard Check
        T-->>D: Type Confirmed
        D-->>S: Typed Data
        S-->>C: Success Response
        C-->>U: Update UI
    else Invalid Input
        V-->>S: Validation Errors
        S-->>C: Error Response
        C-->>U: Show Errors
    end
```

### Mock Data Architecture

Centralized mock data in `/lib/mock-data/`:

```mermaid
graph TB
    subgraph "Mock Data Structure"
        A[index.ts - Barrel Export]

        subgraph "Entity Data"
            B[users.ts]
            C[vendors.ts]
            D[products.ts]
            E[inventory.ts]
            F[procurement.ts]
            G[recipes.ts]
            H[finance.ts]
        end

        subgraph "Factories"
            I[factories.ts]
            J[test-scenarios/]
        end
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    I --> B
    I --> C
    I --> D
```

---

## 🧩 Component Architecture

### Component Hierarchy

```mermaid
graph TB
    subgraph "Layout Components"
        A[RootLayout]
        B[MainLayout]
        C[AuthLayout]
    end

    subgraph "Navigation Components"
        D[AppSidebar]
        E[TopNav]
        F[Breadcrumbs]
    end

    subgraph "Page Components"
        G[List Pages]
        H[Detail Pages]
        I[Form Pages]
        J[Dashboard Pages]
    end

    subgraph "Feature Components"
        K[Module-Specific Components]
        L[Shared Components]
    end

    subgraph "UI Components"
        M[Shadcn/ui Components]
        N[Custom Components]
    end

    A --> B
    A --> C
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    B --> I
    B --> J
    G --> K
    G --> L
    H --> K
    H --> L
    I --> K
    I --> L
    J --> K
    J --> L
    K --> M
    K --> N
    L --> M
    L --> N
```

### Component Patterns

#### 1. Server Component Pattern (Default)

```typescript
// app/(main)/procurement/purchase-requests/page.tsx
import { getPurchaseRequests } from '@/lib/data/procurement'

export default async function PurchaseRequestsPage() {
  const requests = await getPurchaseRequests()

  return (
    <div>
      <PurchaseRequestList requests={requests} />
    </div>
  )
}
```

#### 2. Client Component Pattern

```typescript
'use client'

// components/procurement/PurchaseRequestList.tsx
import { useState, useMemo } from 'react'

export function PurchaseRequestList({ requests }) {
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() =>
    requests.filter(r => r.title.includes(filter)),
    [requests, filter]
  )

  return (
    // Component JSX
  )
}
```

#### 3. Form Component Pattern

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  title: z.string().min(1),
  // ... other fields
})

export function PurchaseRequestForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    // Server action call
  }

  return (
    // Form JSX
  )
}
```

---

## 🔄 State Management

### State Management Architecture

```mermaid
graph TB
    subgraph "Local Component State"
        A[useState]
        B[useReducer]
        C[useRef]
    end

    subgraph "Form State"
        D[React Hook Form]
        E[Zod Validation]
    end

    subgraph "Global UI State"
        F[Zustand Store]
        G[sidebar state]
        H[theme state]
        I[filter state]
    end

    subgraph "Server State"
        J[React Query]
        K[Cache Management]
        L[Optimistic Updates]
    end

    subgraph "Context State"
        M[UserContext]
        N[ThemeContext]
    end

    D --> E
    F --> G
    F --> H
    F --> I
    J --> K
    J --> L
```

### User Context Architecture

```mermaid
graph TB
    subgraph "User Context Provider"
        A[UserContextProvider]

        subgraph "User State"
            B[Current User]
            C[Active Role]
            D[Active Department]
            E[Active Location]
        end

        subgraph "Permission State"
            F[User Permissions]
            G[Role Permissions]
            H[Feature Flags]
        end

        subgraph "Actions"
            I[Switch Role]
            J[Switch Department]
            K[Switch Location]
            L[Check Permission]
        end
    end

    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L

    C --> F
    C --> G
    B --> F
```

---

## 🔐 Security Architecture

### Role-Based Access Control (RBAC)

```mermaid
graph TB
    subgraph "RBAC Components"
        A[User]
        B[Role Assignment]
        C[Role]
        D[Permissions]
        E[Resources]
    end

    subgraph "Permission Check Flow"
        F[Request]
        G[Extract User]
        H[Load Permissions]
        I[Check Permission]
        J[Allow/Deny]
    end

    A -->|has| B
    B -->|defines| C
    C -->|grants| D
    D -->|to access| E

    F --> G
    G --> H
    H --> I
    I --> J
```

### User Roles & Permissions

```mermaid
graph LR
    subgraph "User Roles"
        A[System Administrator]
        B[Financial Manager]
        C[Department Manager]
        D[Purchasing Staff]
        E[Chef]
        F[Counter Staff]
        G[Staff]
    end

    subgraph "Permission Levels"
        H[Full Access]
        I[Departmental Access]
        J[Limited Access]
        K[View Only]
    end

    A --> H
    B --> I
    C --> I
    D --> J
    E --> J
    F --> K
    G --> K
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Page
    participant A as Auth Service
    participant S as Session Manager
    participant C as UserContext

    U->>L: Enter Credentials
    L->>A: Validate Credentials
    A->>A: Check User DB

    alt Valid Credentials
        A->>S: Create Session
        S->>C: Set User Context
        C->>U: Redirect to Dashboard
    else Invalid Credentials
        A->>L: Return Error
        L->>U: Show Error
    end
```

---

## 🔌 Integration Architecture

### Module Integration Points

```mermaid
graph TB
    subgraph "Procurement Module"
        A[Purchase Requests]
        B[Purchase Orders]
        C[GRN]
    end

    subgraph "Inventory Module"
        D[Stock Levels]
        E[Stock Transactions]
        F[Physical Counts]
    end

    subgraph "Vendor Module"
        G[Vendor Profiles]
        H[Price Lists]
    end

    subgraph "Finance Module"
        I[Account Codes]
        J[Cost Centers]
        K[Transactions]
    end

    A -->|Creates| B
    B -->|References| G
    B -->|Uses| H
    B -->|Generates| C
    C -->|Updates| D
    C -->|Creates| E
    E -->|Maps to| I
    E -->|Allocates to| J
    F -->|Adjusts| D
    F -->|Creates| E
```

### External Integration Architecture

```mermaid
graph TB
    subgraph "Carmen ERP"
        A[POS Integration Module]
        B[System Integrations]
    end

    subgraph "External Systems"
        C[POS System]
        D[Accounting System]
        E[E-commerce Platform]
    end

    subgraph "Integration Layer"
        F[API Gateway]
        G[Data Transformation]
        H[Error Handling]
        I[Logging]
    end

    C <-->|Recipe/Product Mapping| A
    C <-->|Sales Transactions| A
    D <-->|Financial Data| B
    E <-->|Product Data| B

    A --> F
    B --> F
    F --> G
    G --> H
    G --> I
```

---

## 🚀 Deployment Architecture

### Deployment Model

```mermaid
graph TB
    subgraph "CDN Edge Network"
        A[Static Assets]
        B[Images]
        C[CSS/JS Bundles]
    end

    subgraph "Next.js Application"
        D[Server Components]
        E[API Routes]
        F[Server Actions]
    end

    subgraph "Database Layer Future"
        G[PostgreSQL/Supabase]
        H[Redis Cache]
    end

    subgraph "Storage Layer Future"
        I[File Storage]
        J[Document Storage]
    end

    A -->|Serves| D
    B -->|Serves| D
    C -->|Serves| D
    D --> E
    D --> F
    E --> G
    F --> G
    E --> H
    F --> H
    E --> I
    F --> J
```

### File System Architecture

```
carmen/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (main)/                   # Main application routes
│   │   ├── dashboard/
│   │   ├── procurement/
│   │   ├── inventory-management/
│   │   ├── vendor-management/
│   │   ├── product-management/
│   │   ├── store-operations/
│   │   ├── operational-planning/
│   │   ├── production/
│   │   ├── reporting-analytics/
│   │   ├── finance/
│   │   └── system-administration/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui components
│   ├── procurement/              # Procurement components
│   ├── inventory/                # Inventory components
│   ├── vendor/                   # Vendor components
│   └── ...                       # Other module components
│
├── lib/                          # Utility libraries
│   ├── types/                    # Centralized type system
│   │   ├── index.ts              # Barrel export
│   │   ├── common.ts             # Common types
│   │   ├── user.ts               # User types
│   │   ├── inventory.ts          # Inventory types
│   │   ├── procurement.ts        # Procurement types
│   │   ├── guards.ts             # Type guards
│   │   ├── converters.ts         # Type converters
│   │   └── validators.ts         # Validators
│   │
│   ├── mock-data/                # Centralized mock data
│   │   ├── index.ts              # Barrel export
│   │   ├── users.ts
│   │   ├── vendors.ts
│   │   ├── products.ts
│   │   ├── factories.ts
│   │   └── test-scenarios/
│   │
│   ├── context/                  # React contexts
│   │   └── user-context.tsx     # User context & RBAC
│   │
│   └── utils/                    # Utility functions
│       ├── formatters.ts
│       └── validators.ts
│
├── public/                       # Static assets
└── docs/                         # Documentation
    └── documents/                # System documentation
```

---

## 📊 Performance Architecture

### Rendering Strategy

```mermaid
graph TB
    subgraph "Server-Side Rendering"
        A[Initial Page Load]
        B[Server Component Render]
        C[Static HTML Generation]
        D[Stream to Client]
    end

    subgraph "Client-Side Hydration"
        E[Client Component Hydration]
        F[Event Handlers Attachment]
        G[State Initialization]
    end

    subgraph "Subsequent Navigation"
        H[Client-Side Routing]
        I[Partial Revalidation]
        J[Optimistic Updates]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
```

### Caching Strategy

```mermaid
graph LR
    subgraph "Cache Layers"
        A[Browser Cache]
        B[CDN Cache]
        C[Server Cache]
        D[React Query Cache]
    end

    subgraph "Cache Invalidation"
        E[Time-based TTL]
        F[Event-based]
        G[Manual]
    end

    A --> E
    B --> E
    C --> E
    C --> F
    D --> F
    D --> G
```

---

## 📚 Related Documents

- [Technical Architecture Details](./TECHNICAL-ARCHITECTURE.md)
- [Data Flow Diagrams](./DATA-FLOW-DIAGRAMS.md)
- [Integration Architecture](./INTEGRATION-ARCHITECTURE.md)
- [API Documentation](../api/API-DOCUMENTATION.md)
- [Development Guide](../development/DEVELOPMENT-GUIDE.md)

---

## 📧 Architecture Review

For architecture-related questions or proposals:
- **Email:** architecture-team@carmen-erp.com
- **Review Schedule:** Bi-weekly
- **RFC Process:** Submit via project management system

---

## 📜 Version History

| Version | Date | Changes | Architect |
|---------|------|---------|-----------|
| 1.0 | 2025-10-09 | Initial architecture documentation | System Architecture Team |

---

**Last Updated:** October 9, 2025
**Next Review:** November 1, 2025
**Architecture Version:** 1.0
