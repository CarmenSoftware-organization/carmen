# Inventory Management Module Documentation

This directory contains comprehensive documentation for the Inventory Management module of the Carmen ERP system.

## Documentation Structure

### 📊 Sitemap and Architecture
- **[inventory-management-sitemap.md](./inventory-management-sitemap.md)** - Complete Mermaid sitemap showing module structure, navigation flow, workflow state diagrams, and user interaction patterns

### 📋 Detailed Specifications
- **[inventory-management-specification.md](./inventory-management-specification.md)** - Comprehensive specification document covering all UI elements, workflows, actions, and technical implementation details

### 📸 Screenshots
All screenshots are captured at full page resolution and show the actual application state:

- **[inventory-management-dashboard.png](./inventory-management-dashboard.png)** - Main dashboard with draggable widgets using React Beautiful DnD
- **[inventory-adjustments-list.png](./inventory-adjustments-list.png)** - Adjustments list with advanced search, filtering, and sorting capabilities
- **[inventory-balance-report.png](./inventory-balance-report.png)** - Balance report with tabs, advanced filtering, and summary metrics
- **[physical-count-setup.png](./physical-count-setup.png)** - Physical count setup wizard Step 1 with form validation
- **[spot-check-dashboard.png](./spot-check-dashboard.png)** - Spot check dashboard with card-based layout and progress tracking

## Module Overview

The Inventory Management module manages:
- **Inventory Dashboard**: Draggable widget system with real-time analytics
- **Stock Overview**: Comprehensive inventory balance reporting and analysis
- **Inventory Adjustments**: Complete adjustment lifecycle with approval workflows
- **Spot Checks**: Ad-hoc inventory verification with streamlined workflows
- **Physical Counts**: Comprehensive cycle counting with multi-step setup wizard
- **Period End**: Period closing and reconciliation procedures
- **Fractional Inventory**: Fractional unit handling and conversions
- **Stock In**: Goods receipt and inventory posting workflows

## Key Features Documented

### 🎛️ Inventory Management Dashboard
- Draggable widget system using React Beautiful DnD
- 6 interactive widgets with real-time data visualization
- Customizable layout with persistent user preferences
- Quick navigation to all major inventory functions

### 📊 Stock Overview and Balance Reporting
- Advanced filtering with collapsible filter panel
- Multiple view modes (Product, Category, Lot)
- Dual valuation methods (FIFO, Weighted Average)
- Tabbed interface (Balance Report, Movement History)
- Export and print functionality
- Real-time calculation updates

### 📝 Inventory Adjustments
- Comprehensive adjustment tracking and approval workflows
- Advanced search and filtering capabilities
- Status-based workflow management (Draft → Posted → Voided)
- Type categorization (IN/OUT adjustments)
- Detailed audit trails and reason code tracking
- Bulk operations and action menus

### 🔍 Spot Check Management
- Card-based dashboard layout with visual progress indicators
- Status tracking (Planning → Scheduled → In Progress → Completed)
- Department and location-based filtering
- Real-time progress monitoring
- Quick creation and scheduling workflows

### 📊 Physical Count Management
- Multi-step setup wizard with form validation
- Location and item selection with hierarchical support
- Counter assignment and scheduling
- Progress tracking and variance detection
- Comprehensive count lifecycle management

### 📅 Period End and Specialized Modules
- Period closing and reconciliation procedures
- Fractional inventory unit conversions
- Stock receipt and quality validation workflows
- Integration with procurement and production modules

## Technical Architecture

### Component Structure
```
inventory-management/
├── page.tsx                          # Main dashboard (6 draggable widgets)
├── stock-overview/
│   ├── inventory-balance/            # Balance reports with advanced filtering
│   ├── stock-cards/                  # Individual product views
│   ├── slow-moving/                  # Slow moving analysis
│   └── inventory-aging/              # Age-based analysis
├── inventory-adjustments/
│   ├── components/
│   │   ├── inventory-adjustment-list.tsx    # Main list (238 lines)
│   │   └── filter-sort-options.tsx          # Advanced filtering
│   └── [id]/                         # Adjustment detail pages
├── spot-check/
│   ├── page.tsx                      # Dashboard with card layout
│   └── components/                   # Spot check workflow components
├── physical-count/
│   ├── components/
│   │   ├── setup.tsx                 # Setup wizard Step 1 (128 lines)
│   │   ├── location-selection.tsx    # Step 2: Location selection
│   │   ├── item-review.tsx          # Step 3: Item review
│   │   └── final-review.tsx         # Step 4: Final review
│   └── dashboard/                    # Count management interface
├── period-end/                       # Period closing workflows
├── fractional-inventory/             # Fractional unit handling
└── stock-in/                        # Goods receipt workflows
```

### Key Technologies
- **Next.js 14** with App Router
- **TypeScript** with strict mode
- **React Beautiful DnD** for drag-and-drop dashboard
- **Recharts** for data visualization and analytics
- **Tailwind CSS** + **Shadcn/ui** for styling
- **Mock Data System** for development and testing
- **React Hook Form** + **Zod** validation for forms

## Data Flow Patterns

### Inventory Adjustment Lifecycle
Draft → Submitted → Under Review → Approved → Posted

### Spot Check Workflow
Planning → Scheduled → In Progress → Completed

### Physical Count Workflow
Setup → Location Selection → Item Review → Final Review → Scheduled → In Progress → Completed

## Navigation Hierarchy

```
Inventory Management
├── Dashboard (Draggable Widget System)
├── Stock Overview
│   ├── Overview Dashboard (Coming Soon)
│   ├── Inventory Balance (Multi-tab with advanced filtering)
│   ├── Stock Cards (Card-based product views)
│   ├── Slow Moving (Analysis and reporting)
│   └── Inventory Aging (Age-based categorization)
├── Inventory Adjustments
│   ├── Adjustments List (Search, filter, sort)
│   └── Adjustment Detail (Multi-tab interface)
├── Spot Check
│   ├── Spot Check Dashboard (Card layout)
│   ├── New Spot Check (Quick creation)
│   └── Active Checks (Progress monitoring)
├── Physical Count
│   ├── Setup Wizard (4-step process)
│   ├── Count Dashboard (Management interface)
│   └── Active Counts (Execution interface)
├── Period End (Closing procedures)
├── Fractional Inventory (Unit conversions)
└── Stock In (Goods receipt workflows)
```

## File Sizes and Complexity

| Component | File Size | Lines | Screenshot Size | Complexity |
|-----------|-----------|-------|-----------------|------------|
| Main Dashboard | Medium | ~300 | 243KB | High (DnD) |
| Adjustments List | Medium | 238 | 354KB | High |
| Balance Report | Large | ~320 | 285KB | Very High |
| Physical Count Setup | Small | 128 | 242KB | Medium |
| Spot Check Dashboard | Medium | ~200 | 265KB | Medium |

## Usage Instructions

1. **For Developers**: Start with the sitemap to understand the overall structure, then review the detailed specification for implementation details
2. **For Product Managers**: Focus on the specification document for feature details, user workflows, and business logic
3. **For UI/UX Designers**: Use the screenshots alongside the specification to understand current implementation and design patterns
4. **For QA Teams**: The specification provides comprehensive test scenarios, expected behaviors, and workflow validations

## Last Updated
Generated: September 25, 2024
Source Code Analysis: Complete recursive scan of inventory management module
Screenshots: 5 full-page captures of major interfaces
Documentation Status: ✅ Complete

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

This documentation provides a complete analysis of the Inventory Management module based on recursive source code scanning and live application capture. All screenshots and specifications reflect the current state of the application as of the generation date.