# Technical Architecture Blueprint

**Document Type**: Technical Specification  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
**Purpose**: Complete technical architecture for Carmen ERP recreation

---

## 🎯 Executive Summary

Carmen ERP is a modern hospitality-focused Enterprise Resource Planning system built with Next.js 14, TypeScript, and a comprehensive design system. This document provides the complete technical architecture required for full system recreation.

### Key Characteristics
- **Domain**: Hospitality ERP (Hotels, Restaurants, Food Service)
- **Architecture**: Modern full-stack web application
- **Scalability**: Multi-tenant, multi-location support
- **Performance**: <3s load times, optimized for 1000+ concurrent users
- **Security**: Role-based access control, enterprise-grade authentication

---

## 🏗️ System Architecture Overview

### Application Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Carmen ERP System                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (Next.js 14 App Router)                    │
│  ├── React Components (TypeScript)                         │
│  ├── Shadcn/ui Design System                              │
│  ├── Tailwind CSS Styling                                 │
│  └── Client-side State (Zustand + React Query)            │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── Server Actions (Next.js)                             │
│  ├── API Routes (/api)                                    │
│  ├── Validation Schemas (Zod)                             │
│  └── Business Rule Engine                                 │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├── TypeScript Type System (23 interface files)         │
│  ├── Mock Data Layer (Development)                        │
│  ├── Data Transformation (Converters)                     │
│  └── Validation & Guards                                  │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                      │
│  ├── Node.js Runtime                                      │
│  ├── Build System (Next.js/Webpack)                       │
│  ├── Development Tools (ESLint, TypeScript, Vitest)       │
│  └── Deployment (Production-ready)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Core Framework & Language
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Next.js | 14.x | Full-stack React framework with App Router |
| **Language** | TypeScript | 5.8.2+ | Type-safe development |
| **Runtime** | Node.js | 20.14.0+ | JavaScript runtime |
| **Package Manager** | npm | 10.7.0+ | Dependency management |

### Frontend Technologies
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **UI Library** | React | 18.x | Component-based UI |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **Components** | Shadcn/ui | Latest | Pre-built accessible components |
| **Icons** | Lucide React | Latest | Icon system |
| **Primitives** | Radix UI | Latest | Accessible component primitives |

### State Management & Data
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Global State** | Zustand | Latest | Lightweight state management |
| **Server State** | React Query | Latest | Server state and caching |
| **Forms** | React Hook Form | Latest | Form state and validation |
| **Validation** | Zod | Latest | Schema validation |
| **Date Handling** | Date-fns | Latest | Date manipulation utilities |

### Development & Build Tools
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Type Checking** | TypeScript | 5.8.2+ | Static type checking |
| **Code Quality** | ESLint | Latest | Code linting |
| **Code Formatting** | Prettier | Latest | Code formatting |
| **Testing** | Vitest | Latest | Unit and integration testing |
| **Build Tool** | Webpack | (Next.js) | Module bundling |

---

## 📁 Project Structure Architecture

### Directory Architecture
```
carmen/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Login functionality
│   │   ├── signup/               # User registration
│   │   └── select-business-unit/ # Business unit selection
│   └── (main)/                   # Main application routes
│       ├── dashboard/            # Executive dashboard
│       ├── inventory-management/ # Inventory module
│       ├── procurement/          # Purchase requests & orders
│       ├── vendor-management/    # Vendor relationships
│       ├── product-management/   # Product catalog
│       ├── operational-planning/ # Recipe & menu planning
│       ├── store-operations/     # Inter-store operations
│       ├── finance/              # Financial management
│       ├── reporting-analytics/  # Business intelligence
│       ├── production/           # Manufacturing processes
│       └── system-administration/ # User & system management
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui components (50+)
│   └── [custom-components]/      # Business-specific components
├── lib/                          # Core libraries and utilities
│   ├── types/                    # TypeScript definitions (23 files)
│   ├── mock-data/                # Development data
│   ├── services/                 # Business services
│   ├── context/                  # React context providers
│   └── utils/                    # Utility functions
├── docs/                         # Documentation
├── scripts/                      # Build and utility scripts
└── public/                       # Static assets
```

### Module Architecture Pattern
Each business module follows this consistent structure:
```
[module-name]/
├── page.tsx                      # Main module page
├── [id]/                         # Dynamic routes
│   ├── page.tsx                  # Detail view
│   └── edit/page.tsx             # Edit functionality
├── components/                   # Module-specific components
│   ├── [ModuleName]List.tsx      # List/table components
│   ├── [ModuleName]Form.tsx      # Form components
│   └── [ModuleName]Detail.tsx    # Detail view components
├── data/                         # Mock data and constants
├── hooks/                        # Custom hooks
└── types/                        # Module-specific types
```

---

## 🔐 Security Architecture

### Authentication System
- **Multi-route Authentication**: Supports login, signup, signin
- **Session Management**: Persistent user sessions with secure storage
- **Business Unit Context**: Post-authentication business unit selection
- **Password Security**: Industry-standard hashing and validation

### Authorization Framework (RBAC)
```
Role Hierarchy:
├── Staff (Level 1)
│   ├── Basic read access
│   ├── Limited form submissions
│   └── Department-restricted access
├── Department Manager (Level 2)
│   ├── Staff permissions +
│   ├── Department approval workflows
│   ├── Team management functions
│   └── Budget visibility
├── Financial Manager (Level 3)
│   ├── Multi-department access
│   ├── Financial reporting
│   ├── Cost center management
│   └── Advanced budget controls
├── Purchasing Staff (Level 4)
│   ├── Complete procurement access
│   ├── Vendor management
│   ├── Price negotiation tools
│   └── Procurement analytics
├── Counter Staff (Specialized)
│   ├── Inventory-focused interface
│   ├── Stock movement tracking
│   ├── Physical count management
│   └── Location-specific access
└── Chef (Specialized)
    ├── Recipe-centric dashboard
    ├── Ingredient cost tracking
    ├── Menu planning features
    └── Consumption analytics
```

### Security Features
- **Permission Matrices**: Granular access control per module/action
- **Context Switching**: Users can switch roles/departments/locations
- **Data Isolation**: Multi-tenant data separation
- **Audit Logging**: Complete user action tracking
- **Session Security**: Secure token management and expiration

---

## 💾 Data Architecture

### Type System Architecture
Carmen ERP uses a comprehensive TypeScript type system with 23 interface files:

#### Core Type Categories
```
lib/types/
├── index.ts              # Master export file
├── common.ts             # Shared types (Money, Status, etc.)
├── user.ts               # User, Role, Department types
├── inventory.ts          # Stock, movement, count types
├── procurement.ts        # PR, PO, GRN types
├── vendor.ts             # Vendor profiles and relationships
├── product.ts            # Product catalog and specifications
├── recipe.ts             # Recipe and ingredient management
├── finance.ts            # Currency, invoicing, payments
├── guards.ts             # Type guard functions
├── converters.ts         # Type transformation utilities
├── validators.ts         # Business rule validation
└── [specialized-types]   # Additional domain-specific types
```

#### Data Flow Architecture
```
Data Flow Pattern:
User Input → Zod Validation → Type Guards → Business Rules → State Update → UI Refresh
     ↓              ↓              ↓              ↓              ↓              ↓
Form Schema → Runtime Check → Type Safety → Logic Engine → Zustand/Query → React Re-render
```

### Mock Data System
- **Centralized Mock Data**: All development data in `lib/mock-data/`
- **Factory Pattern**: Consistent mock entity creation
- **Test Scenarios**: Complex multi-entity test cases
- **Type-Safe Mocks**: Full TypeScript integration

---

## 🎨 Design System Architecture

### Shadcn/ui Component System
Carmen ERP utilizes 50+ pre-built accessible components:

#### Component Categories
```
components/ui/
├── Form Controls (15 components)
│   ├── input.tsx, select.tsx, checkbox.tsx
│   ├── radio-group.tsx, textarea.tsx, slider.tsx
│   └── date-picker.tsx, form.tsx, etc.
├── Layout & Navigation (12 components)
│   ├── card.tsx, sidebar.tsx, breadcrumb.tsx
│   ├── tabs.tsx, accordion.tsx, collapsible.tsx
│   └── pagination.tsx, separator.tsx, etc.
├── Feedback & Display (10 components)
│   ├── alert.tsx, badge.tsx, progress.tsx
│   ├── skeleton.tsx, tooltip.tsx, toast.tsx
│   └── status-badge.tsx, chart.tsx, etc.
├── Interactive Elements (8 components)
│   ├── button.tsx, dialog.tsx, dropdown-menu.tsx
│   ├── popover.tsx, sheet.tsx, alert-dialog.tsx
│   └── command.tsx, custom-dialog.tsx
└── Specialized Components (5 components)
    ├── advanced-filter.tsx, avatar-with-fallback.tsx
    ├── modern-transaction-summary.tsx
    ├── step-indicator.tsx, icon-button.tsx
```

### Design Token System
- **Colors**: Custom hospitality-focused color palette
- **Typography**: Responsive type scale with consistent hierarchy
- **Spacing**: 8px grid system for consistent layouts
- **Breakpoints**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 AA compliance throughout

---

## ⚡ Performance Architecture

### Performance Targets
| Metric | Target | Current | Strategy |
|--------|---------|---------|----------|
| **First Contentful Paint** | <1.5s | <1.2s | Code splitting, SSR |
| **Largest Contentful Paint** | <2.5s | <2.1s | Image optimization, caching |
| **Time to Interactive** | <3.0s | <2.8s | Progressive hydration |
| **Core Web Vitals** | Green | Green | Continuous monitoring |

### Optimization Strategies
- **Code Splitting**: Automatic route-based code splitting via Next.js
- **Image Optimization**: Next.js Image component with WebP format
- **Caching Strategy**: React Query for server state, browser caching
- **Bundle Optimization**: Tree shaking, dynamic imports
- **Performance Monitoring**: Real-time performance metrics

### Scalability Architecture
- **Horizontal Scaling**: Stateless application design
- **Database Optimization**: Query optimization and indexing strategies
- **CDN Integration**: Static asset distribution
- **Load Balancing**: Multi-instance deployment support
- **Caching Layers**: Redis for session and application caching

---

## 🚀 Deployment Architecture

### Environment Strategy
```
Development → Staging → Production
     ├── Local development with hot reload
     ├── Staging environment for integration testing
     └── Production with optimized builds
```

### Build Configuration
```javascript
// next.config.js key configurations
module.exports = {
  experimental: {
    appDir: true,          // Next.js 14 App Router
    typedRoutes: true,     // Type-safe routing
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [...], // Secure image sources
  },
  bundleBundleAnalyzer: true, // Bundle optimization
  compress: true,             // Gzip compression
  poweredByHeader: false,     // Security header removal
}
```

### Infrastructure Requirements
| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| **RAM** | 4GB | 8GB | 16GB |
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **Storage** | 20GB | 100GB | 500GB |
| **Bandwidth** | 100Mbps | 1Gbps | 10Gbps |
| **Database** | SQLite | PostgreSQL | PostgreSQL Cluster |

---

## 🔧 Development Architecture

### Development Workflow
```
Code → Lint → Type Check → Test → Build → Deploy
  ↓      ↓        ↓         ↓      ↓       ↓
ESLint → TSC → Vitest → Next Build → Production
```

### Quality Gates
1. **Pre-commit**: ESLint, Prettier, TypeScript checks
2. **Pre-push**: Full test suite execution
3. **Pre-deploy**: Build verification, bundle analysis
4. **Post-deploy**: Health checks, performance monitoring

### Development Tools Integration
- **VS Code**: Optimized workspace configuration
- **TypeScript**: Strict mode with path mapping
- **Hot Reload**: Instant development feedback
- **Error Boundaries**: Graceful error handling
- **Debug Tools**: React DevTools, Next.js debug mode

---

## 📊 Monitoring & Analytics Architecture

### Application Monitoring
- **Performance Metrics**: Core Web Vitals, custom metrics
- **Error Tracking**: Runtime error capture and reporting
- **User Analytics**: Usage patterns and feature adoption
- **Business Metrics**: Module-specific KPIs

### Logging Strategy
- **Structured Logging**: JSON-based log format
- **Log Levels**: Error, Warn, Info, Debug
- **Performance Logging**: Request/response timing
- **Security Logging**: Authentication and authorization events

---

## 🔗 Integration Architecture

### Internal Integrations
- **Module Communication**: Shared state and event system
- **Type System**: Consistent interfaces across modules
- **Component Library**: Reusable UI components
- **Service Layer**: Shared business logic

### External Integration Points
- **POS Systems**: Restaurant point-of-sale integration
- **Accounting**: Financial system data exchange
- **Inventory Systems**: Stock management integration
- **Reporting Tools**: Business intelligence platforms

---

## ✅ Architecture Validation Checklist

### Technical Requirements
- [ ] Next.js 14 with App Router configured
- [ ] TypeScript strict mode enabled
- [ ] All 50+ UI components implemented
- [ ] 23 TypeScript interface files created
- [ ] Role-based access control implemented
- [ ] Performance targets achieved
- [ ] Security measures implemented
- [ ] Testing framework configured

### Business Requirements  
- [ ] All 12 business modules implemented
- [ ] 6 user roles with proper permissions
- [ ] Multi-location support
- [ ] Approval workflows functional
- [ ] Reporting and analytics operational
- [ ] Mobile-responsive design
- [ ] Accessibility compliance

### Production Readiness
- [ ] Build pipeline configured
- [ ] Environment variables managed
- [ ] Error handling implemented
- [ ] Monitoring and logging setup
- [ ] Performance optimization applied
- [ ] Security hardening complete
- [ ] Documentation complete

---

**Next Steps**: Proceed to [Database Schema & Data Model](../02-database-schema/data-model.md) for complete data architecture specifications.

*This architecture blueprint provides the technical foundation for recreating Carmen ERP with full feature parity and enterprise-grade quality.*