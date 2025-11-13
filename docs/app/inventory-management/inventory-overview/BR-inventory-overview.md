# Business Requirements: Inventory Overview

**Module**: Inventory Management
**Sub-module**: Inventory Overview
**Version**: 1.0
**Last Updated**: 2025-01-10

---

## Table of Contents
1. [Document Overview](#document-overview)
2. [Functional Requirements](#functional-requirements)
3. [Business Rules](#business-rules)
4. [User Personas](#user-personas)
5. [Success Criteria](#success-criteria)

---

## Document Overview

### Purpose
This document defines business requirements for the Inventory Overview module, which provides executive-level visibility into inventory operations across multiple hotel locations.

### Scope
The Inventory Overview serves as the central command center for inventory management, offering:
- Real-time inventory visibility across all locations
- Performance metrics and analytics
- Stock distribution analysis
- Inter-location transfer optimization
- Quick navigation to detailed inventory reports

### Module Context
**Parent Module**: Inventory Management
**Related Modules**:
- Stock Overview (detailed reporting)
- Physical Count Management
- Inventory Adjustments
- Stock Movements

---

## Functional Requirements

### Dashboard & Visualization

#### FR-INV-OVW-001: Customizable Dashboard Layout
**Priority**: High
**User Story**: As a Store Manager, I want to rearrange dashboard widgets by dragging and dropping so that I can prioritize the information most relevant to my daily operations.

**Requirements**:
- Support drag-and-drop reordering of dashboard widgets
- Persist user's preferred dashboard layout
- Widgets include: Inventory Levels, Inventory Value Trend, Inventory Turnover
- Support text widgets for alerts and notifications
- Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)

**Acceptance Criteria**:
- ✅ User can drag any widget to a new position
- ✅ Dashboard retains custom layout after page refresh
- ✅ All widgets render correctly in new positions
- ✅ Layout adapts to screen size breakpoints

**Source Evidence**: `app/(main)/inventory-management/page.tsx:45-58` (DragDropContext implementation)

---

#### FR-INV-OVW-002: Inventory Level Visualization
**Priority**: Critical
**User Story**: As a Head Chef, I want to see current inventory levels compared to reorder points across all food categories so that I can proactively identify potential stockouts.

**Requirements**:
- Display bar chart showing current levels vs reorder points
- Categorize by: Food, Beverages, Cleaning, Linen, Amenities
- Visual indicators when levels approach or fall below reorder point
- Interactive tooltips showing exact quantities
- Support filtering by category

**Acceptance Criteria**:
- ✅ Chart displays all 5 major inventory categories
- ✅ Current levels and reorder points clearly differentiated by color
- ✅ Hover tooltip shows category name and exact quantities
- ✅ Categories with low stock highlighted visually

**Source Evidence**: `app/(main)/inventory-management/page.tsx:62-75` (Bar chart configuration)

---

#### FR-INV-OVW-003: Inventory Value Trend Analysis
**Priority**: High
**User Story**: As a Financial Controller, I want to track monthly inventory value trends so that I can monitor working capital tied up in inventory.

**Requirements**:
- Display line chart of inventory value over 6-month period
- Show trend direction (increasing/decreasing)
- Display total inventory value in local currency
- Support drill-down to monthly details
- Calculate month-over-month change percentage

**Acceptance Criteria**:
- ✅ Chart shows last 6 months of data (Jan-Jun)
- ✅ Y-axis shows currency values
- ✅ Trend line clearly visible
- ✅ Current month value prominently displayed

**Source Evidence**: `app/(main)/inventory-management/page.tsx:76-88` (Line chart configuration)

---

#### FR-INV-OVW-004: Inventory Turnover Analysis
**Priority**: High
**User Story**: As a Purchasing Manager, I want to see inventory turnover rates by category so that I can identify slow-moving and fast-moving inventory.

**Requirements**:
- Display pie chart of turnover rates by category
- Calculate turnover ratio: (Cost of Goods Sold / Average Inventory)
- Visual breakdown by category
- Support comparison across categories
- Highlight categories with low turnover (< 4) or high turnover (> 12)

**Acceptance Criteria**:
- ✅ Pie chart shows all inventory categories
- ✅ Each slice labeled with category name and turnover rate
- ✅ Colors differentiate between categories
- ✅ Tooltips show exact turnover calculations

**Source Evidence**: `app/(main)/inventory-management/page.tsx:89-110` (Pie chart configuration)

---

### Stock Overview & Monitoring

#### FR-INV-OVW-005: Multi-Location Stock Visibility
**Priority**: Critical
**User Story**: As a General Manager, I want to view consolidated stock levels across all hotel locations so that I can optimize inventory distribution.

**Requirements**:
- Display aggregate metrics across all locations
- Support filtering by individual location
- Show metrics: Total Items, Total Value, Low Stock Count, Expiring Items
- Location selector dropdown with user permission filtering
- Real-time data refresh

**Acceptance Criteria**:
- ✅ "All Locations" view shows aggregate data
- ✅ Selecting specific location filters all metrics
- ✅ Location dropdown only shows locations user has access to
- ✅ Metrics update immediately when location changed

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:76-95` (Location filtering logic)

---

#### FR-INV-OVW-006: Critical Stock Alerts
**Priority**: Critical
**User Story**: As a Storekeeper, I want to see immediate alerts for low stock items and items expiring soon so that I can take corrective action before stockouts or waste occur.

**Requirements**:
- Display count of items below reorder point
- Display count of items expiring within 7 days
- Visual indicators (red for critical, orange for warning)
- Click-through to detailed item list
- Alert thresholds configurable by category

**Acceptance Criteria**:
- ✅ Low stock count displayed in red
- ✅ Expiring count displayed in orange
- ✅ Counts update when location filter changed
- ✅ Zero state message when no alerts

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:214-248` (Alert cards)

---

#### FR-INV-OVW-007: Stock Distribution Charts
**Priority**: High
**User Story**: As a Department Manager, I want to visualize stock distribution by category so that I can understand which categories consume the most inventory value.

**Requirements**:
- Bar chart showing quantity distribution by category
- Pie chart showing value distribution by category
- Support both single-location and multi-location views
- Interactive tooltips with formatted values
- Automatic aggregation when viewing all locations

**Acceptance Criteria**:
- ✅ Bar chart displays quantities across categories
- ✅ Pie chart displays value percentages
- ✅ Tooltips show formatted currency and quantities
- ✅ Charts update when location selection changes

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:258-308` (Chart components)

---

### Performance Analytics

#### FR-INV-OVW-008: Location Performance Comparison
**Priority**: High
**User Story**: As a Chief Engineer, I want to compare stock efficiency across locations so that I can identify best practices and underperforming locations.

**Requirements**:
- Compare locations on: Stock Efficiency, Turnover Rate, Fill Rate
- Display comparison bar chart
- Performance classification: Excellent, Good, Average, Poor
- Detailed metrics table with sortable columns
- Performance scoring algorithm

**Acceptance Criteria**:
- ✅ Chart shows all locations with 3 metrics
- ✅ Each location tagged with performance level
- ✅ Color-coded badges (green=excellent, blue=good, yellow=average, red=poor)
- ✅ Metrics displayed as percentages or ratios

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:346-394` (Performance comparison)

---

#### FR-INV-OVW-009: Transfer Optimization Suggestions
**Priority**: Medium
**User Story**: As a Purchasing Manager, I want AI-powered transfer suggestions to optimize stock distribution so that I can reduce waste and prevent stockouts.

**Requirements**:
- Analyze stock imbalances across locations
- Generate transfer suggestions with: From/To locations, quantity, reason
- Calculate potential savings per transfer
- Priority ranking: High, Medium, Low
- One-click transfer creation
- Reasons: excess_stock, approaching_stockout, expiry_risk, demand_variance

**Acceptance Criteria**:
- ✅ Suggestions prioritized by potential savings
- ✅ Each suggestion shows item, locations, quantity, reason
- ✅ Priority badge color-coded
- ✅ "Create Transfer" button initiates transfer workflow

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:396-438` (Transfer suggestions)

---

### Quick Navigation

#### FR-INV-OVW-010: Quick Access to Detailed Reports
**Priority**: High
**User Story**: As a Financial Controller, I want quick access buttons to detailed inventory reports so that I can navigate efficiently to the information I need.

**Requirements**:
- Navigation buttons to: Inventory Balance, Stock Cards, Slow Moving, Inventory Aging
- Icon-based visual representation
- Button grid layout (4 columns desktop, 2 columns mobile)
- Navigation preserves current location filter context

**Acceptance Criteria**:
- ✅ All 4 report buttons visible and clickable
- ✅ Icons clearly represent each report type
- ✅ Buttons maintain visual consistency with design system
- ✅ Navigation links work correctly

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:310-343` (Quick action buttons)

---

### Data Refresh & Real-Time Updates

#### FR-INV-OVW-011: Automated Data Refresh
**Priority**: Medium
**User Story**: As a Storekeeper, I want inventory data to automatically refresh every 5 minutes so that I always see current stock levels without manual refresh.

**Requirements**:
- Auto-refresh interval: 5 minutes (configurable)
- Loading state indicator during refresh
- Preserve user's current filter and view settings
- Error handling for failed refreshes
- Manual refresh button

**Acceptance Criteria**:
- ✅ Data refreshes automatically every 5 minutes
- ✅ Loading indicator shown during refresh
- ✅ Selected location and tab maintained
- ✅ Error message if refresh fails

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:54-67` (Data loading logic)

---

## Business Rules

### BR-INV-OVW-001: Location-Based Access Control
**Rule**: Users can only view inventory data for locations they are assigned to, unless they have System Administrator role.

**Rationale**: Protect sensitive inventory data and enforce organizational boundaries.

**Implementation**:
- Filter location list by user's `availableLocations` array
- Aggregate metrics only include accessible locations
- Bypass filtering for System Administrator role

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:76-91`

---

### BR-INV-OVW-002: Stock Level Alert Thresholds
**Rule**:
- **Low Stock**: Item quantity ≤ reorder point
- **Expiring Soon**: Item expiry date ≤ current date + 7 days

**Rationale**: Provide advance warning for procurement and waste prevention.

**Implementation**:
- Low stock calculation: `quantityOnHand <= reorderPoint`
- Expiring calculation: `expiryDate <= today + 7 days`

---

### BR-INV-OVW-003: Performance Classification Algorithm
**Rule**: Location performance classified based on weighted metrics:
- **Excellent**: Stock efficiency ≥ 90% AND turnover ≥ 8 AND fill rate ≥ 95%
- **Good**: Stock efficiency ≥ 80% AND turnover ≥ 6 AND fill rate ≥ 90%
- **Average**: Stock efficiency ≥ 70% AND turnover ≥ 4 AND fill rate ≥ 85%
- **Poor**: Below average thresholds

**Rationale**: Standardize performance assessment across locations.

**Source Evidence**: `lib/mock-data/location-inventory.ts:154-168`

---

### BR-INV-OVW-004: Transfer Priority Calculation
**Rule**: Transfer suggestions prioritized by:
1. **High Priority**: Stockout risk (qty < 10% of reorder point) OR expiry within 3 days
2. **Medium Priority**: Approaching reorder point OR expiry within 7 days
3. **Low Priority**: Optimization opportunity (excess at one location, normal at another)

**Rationale**: Prioritize actions that prevent stockouts and reduce waste.

**Source Evidence**: `lib/mock-data/location-inventory.ts:308-335`

---

### BR-INV-OVW-005: Currency Display
**Rule**: All monetary values displayed in hotel's base currency with proper formatting (comma separators, 2 decimal places).

**Implementation**: Use `formatCurrency()` utility function.

**Source Evidence**: `lib/utils/formatters.ts`

---

### BR-INV-OVW-006: Chart Data Aggregation
**Rule**: When "All Locations" selected, aggregate data by:
- **Quantities**: Simple summation across locations
- **Values**: Sum of (quantity × unit cost) across locations
- **Averages**: Weighted average based on quantities

**Rationale**: Provide accurate multi-location analytics.

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:98-114`

---

## User Personas

### Primary Users

#### Store Manager / Storekeeper
**Role**: Daily inventory oversight and operational management
**Key Needs**:
- Real-time stock visibility
- Low stock and expiring item alerts
- Quick access to stock cards and balance reports
- Location-specific filtering

**Features Used**:
- Dashboard overview with customizable widgets
- Critical stock alerts
- Quick navigation buttons
- Location filter

---

#### Purchasing Manager
**Role**: Strategic procurement and supplier management
**Key Needs**:
- Inventory turnover analysis
- Transfer optimization
- Multi-location visibility
- Performance benchmarking

**Features Used**:
- Inventory turnover charts
- Transfer suggestions
- Location performance comparison
- Slow-moving inventory reports

---

#### Financial Controller
**Role**: Financial planning and inventory valuation
**Key Needs**:
- Inventory value trending
- Working capital analysis
- Multi-location consolidation
- Period-end reporting

**Features Used**:
- Inventory value trend chart
- Aggregate metrics across locations
- Inventory balance reports
- Export capabilities

---

#### General Manager / Department Manager
**Role**: Strategic oversight and operational excellence
**Key Needs**:
- High-level KPIs
- Location comparison
- Exception reporting
- Trend analysis

**Features Used**:
- Executive dashboard
- Performance comparison
- Transfer suggestions
- Multi-location aggregation

---

#### Head Chef / Sous Chef
**Role**: Food inventory and kitchen operations
**Key Needs**:
- Food category visibility
- Expiring item alerts
- Reorder point monitoring
- Recipe ingredient availability

**Features Used**:
- Inventory levels by category (Food)
- Expiring soon alerts
- Stock distribution charts
- Quick access to stock cards

---

### Secondary Users

#### Housekeeping Manager
**Role**: Linen and amenities inventory
**Key Features**: Linen and Amenities category monitoring

#### Chief Engineer / Maintenance Staff
**Role**: Engineering supplies and spare parts
**Key Features**: Category-specific inventory tracking

---

## Success Criteria

### Operational Metrics
- **Data Accuracy**: 99.9% accuracy in inventory calculations
- **Response Time**: Dashboard loads in < 2 seconds
- **Refresh Rate**: Data updates every 5 minutes
- **Uptime**: 99.5% system availability

### Business Metrics
- **Stockout Reduction**: 30% reduction in stockouts after 6 months
- **Waste Reduction**: 20% reduction in expired item write-offs
- **Working Capital**: 15% reduction in excess inventory value
- **Turnover Improvement**: 10% increase in average turnover rate

### User Adoption
- **Daily Active Users**: 80% of authorized users access dashboard daily
- **Feature Utilization**: 70% of users use transfer suggestions monthly
- **Performance Monitoring**: 90% of managers review location comparison weekly
- **Alert Response Time**: Critical alerts acted upon within 2 hours

### Compliance
- **Access Control**: 100% compliance with location-based permissions
- **Data Security**: Zero unauthorized data access incidents
- **Audit Trail**: 100% of inventory movements logged

---

## Appendices

### Appendix A: Inventory Categories
1. **Food**: Perishable and non-perishable food items
2. **Beverages**: Alcoholic and non-alcoholic beverages
3. **Cleaning**: Housekeeping and cleaning supplies
4. **Linen**: Towels, bedsheets, tablecloths
5. **Amenities**: Guest amenities and toiletries

### Appendix B: Performance Metrics Definitions
- **Stock Efficiency**: (Inventory Available / Total Capacity) × 100
- **Turnover Rate**: Cost of Goods Sold / Average Inventory Value
- **Fill Rate**: (Orders Fulfilled / Total Orders) × 100
- **Stockout Rate**: (Stockout Events / Total Orders) × 100

### Appendix C: Related Documentation
- Stock Overview Technical Specification: `TS-stock-overview.md`
- Inventory Transactions Business Rules: `docs/app/inventory-management/inventory-transactions/BR-inventory-transactions.md`
- Costing Methods: `docs/app/shared-methods/inventory-valuation/SM-costing-methods.md`

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-10 | System | Initial creation based on source code analysis |

