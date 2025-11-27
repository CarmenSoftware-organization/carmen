# Store Operations Module Documentation

This directory contains comprehensive documentation for the Store Operations module of the Carmen ERP system.

## Documentation Structure

### 📊 Sitemap and Architecture
- **[store-operations-sitemap.md](./store-operations-sitemap.md)** - Complete Mermaid sitemap showing module structure, navigation flow, and user interaction patterns

### 📋 Detailed Specifications
- **[store-operations-specification.md](./store-operations-specification.md)** - Comprehensive specification document covering all UI elements, workflows, actions, and technical implementation details

### 📸 Screenshots
All screenshots are captured at full page resolution and show the actual application state:

- **[store-operations-dashboard.png](./store-operations-dashboard.png)** - Main dashboard with draggable widgets
- **[store-requisition-list.png](./store-requisition-list.png)** - Requisitions list with advanced filtering
- **[store-requisition-detail-items.png](./store-requisition-detail-items.png)** - Requisition detail showing items tab
- **[store-requisition-detail-stock.png](./store-requisition-detail-stock.png)** - Requisition detail showing stock movements tab
- **[store-replenishment-page.png](./store-replenishment-page.png)** - Stock replenishment dashboard and inventory table
- **[wastage-reporting-page.png](./wastage-reporting-page.png)** - Wastage analytics and reporting interface

## Module Overview

The Store Operations module manages:
- **Store Requisitions**: Complete lifecycle from creation to fulfillment
- **Stock Replenishment**: Monitoring and ordering for low stock items
- **Wastage Reporting**: Tracking and analyzing inventory waste
- **Dashboard Analytics**: Real-time metrics and customizable widgets

## Key Features Documented

### 🎛️ Store Operations Dashboard
- Draggable widget system using React Beautiful DnD
- 6 interactive widgets with real-time data
- Customizable layout with persistent user preferences

### 📝 Store Requisitions
- Advanced filtering and search capabilities
- Multi-tab detail view (Items, Stock Movements, Journal, Approval)
- Complex approval workflow with item-level tracking
- Comprehensive comment and attachment system
- Activity logging and audit trail

### 📦 Stock Replenishment
- Real-time stock level monitoring
- Intelligent reorder point calculations
- Bulk requisition creation
- PAR level management
- Low stock alerts and notifications

### 🗑️ Wastage Reporting
- Comprehensive wastage tracking by category
- Monthly trend analysis with charts
- Cost impact calculation
- Review and approval workflow
- Export capabilities for reporting

## Technical Architecture

### Component Structure
```
store-operations/
├── page.tsx                     # Main dashboard (253KB screenshot)
├── components/
│   ├── store-requisition-list.tsx    # List component (476KB screenshot)
│   ├── store-replenishment.tsx       # Replenishment dashboard (334KB screenshot)
│   └── wastage-reporting.tsx         # Wastage analytics
├── store-requisitions/
│   └── components/
│       └── store-requisition-detail.tsx  # Detail view (1,950 lines, 440KB+369KB screenshots)
├── stock-replenishment/
│   └── page.tsx                 # Replenishment wrapper
└── wastage-reporting/
    └── page.tsx                 # Wastage wrapper
```

### Key Technologies
- **Next.js 14** with App Router
- **TypeScript** with strict mode
- **React Beautiful DnD** for drag-and-drop
- **Recharts** for data visualization
- **Tailwind CSS** + **Shadcn/ui** for styling
- **Zod** for validation
- **React Hook Form** for form management

## Data Flow Patterns

### Requisition Lifecycle
Draft → Submitted → In Process → Approved → Fulfilled

### Stock Monitoring
Monitor → Alert → Review → Order → Track → Replenish

### Wastage Workflow
Identify → Record → Classify → Review → Approve → Write-off

## Navigation Hierarchy

```
Store Operations
├── Dashboard (Drag & Drop Widgets)
├── Store Requisitions
│   ├── List View (Table/Card Toggle)
│   └── Detail View
│       ├── Items Tab (Inline Editing)
│       ├── Stock Movements Tab
│       ├── Journal Entries Tab
│       └── Approval Workflow Tab
├── Stock Replenishment
│   ├── Statistics Cards
│   ├── Trend Chart
│   └── Inventory Table
└── Wastage Reporting
    ├── Analytics Dashboard
    ├── Trend Charts
    └── Records Management
```

## File Sizes and Complexity

| Component | File Size | Lines | Screenshot Size | Complexity |
|-----------|-----------|-------|-----------------|------------|
| Dashboard | Small | ~200 | 253KB | Medium |
| Requisition List | Medium | ~500 | 476KB | High |
| Requisition Detail | **Largest** | **1,950** | 440KB+369KB | **Very High** |
| Stock Replenishment | Medium | ~330 | 334KB | Medium |
| Wastage Reporting | Medium | ~400 | TBD | Medium |

## Usage Instructions

1. **For Developers**: Start with the sitemap to understand the overall structure, then review the detailed specification
2. **For Product Managers**: Focus on the specification document for feature details and user workflows
3. **For UI/UX Designers**: Use the screenshots alongside the specification to understand current implementation
4. **For QA Teams**: The specification provides comprehensive test scenarios and expected behaviors

## Last Updated
Generated: September 25, 2024
Source Code Analysis: Complete recursive scan of store operations module
Screenshots: Full-page captures of all major interfaces
Documentation Status: ✅ Complete

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

This documentation provides a complete analysis of the Store Operations module based on recursive source code scanning and live application capture. All screenshots and specifications reflect the current state of the application as of the generation date.