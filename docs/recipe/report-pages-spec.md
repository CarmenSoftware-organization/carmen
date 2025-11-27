# Report Pages Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Gross Profit Report Page

### Header Section (64px height)
```
┌─────────────────────────────────────────────┐
│ Title    Date Range    Export    Share      │
└─────────────────────────────────────────────┘
```

Components:
1. Title
   - Text: "Gross Profit Report"
   - Font: 24px, bold
   - Position: Left-aligned

2. Date Range Selector
   - Type: Custom date range picker
   - Presets:
     * Today
     * Yesterday
     * This Week
     * Last Week
     * This Month
     * Custom Range
   - Default: Today
   - Comparison period option

3. Export Button
   - Options dropdown:
     * PDF Report
     * Excel (.xlsx)
     * CSV Data
     * Chart Images

4. Share Button
   - Options:
     * Schedule Report
     * Email Report
     * Generate Link

### Filter Section
Layout: Horizontal flex with wrap
Spacing: 16px gap

Components:
1. Location Filter
   - Type: Multi-select dropdown
   - Hierarchical selection
   - Quick selections:
     * All Locations
     * By Region
     * By Type

2. Category Filter
   - Type: Multi-select dropdown
   - Hierarchical categories
   - Search enabled

3. View Type Selector
   - Type: Button group
   - Options:
     * By Outlet
     * By Category
     * By Item

### Summary Cards Section
Layout: Four equal-width cards
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ Total    │ │ Gross    │ │ Margin   │
│ Sales    │ │ Cost     │ │ Profit   │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

Each card contains:
- Metric title
- Current value
- Comparison value
- Trend indicator
- Percentage change

### Chart Section
Height: 400px
Features:
1. Chart Types
   - Primary: Bar chart
   - Secondary: Line chart
   - Toggle between views

2. Chart Controls
   - Time period grouping
   - Data series selection
   - Zoom controls
   - Download chart

3. Interactive Elements
   - Tooltips
   - Click-through to details
   - Highlighting

### Detailed Grid
Features:
- Column resizing
- Sorting
- Fixed header
- Row expansion

Columns:
1. Item Details
   - Code
   - Name
   - Category
   - Subcategory

2. Sales Amount
   - Quantity
   - Unit Price
   - Total Sales
   - Sales Mix %

3. Cost Details
   - Unit Cost
   - Total Cost
   - Cost Mix %

4. Margin Analysis
   - Gross Profit
   - Margin %
   - Target Margin
   - Variance

5. Comparison
   - vs Previous Period
   - vs Budget
   - Trend Indicator

## 2. Consumption Report Page

### Header Section
Similar to Gross Profit Report with:
- Title: "Consumption Report"
- Same date and export controls

### Filter Section
Additional filters:
1. Product Filter
   - Type: Multi-select
   - Product categories
   - Individual products

2. Consumption Type
   - Options:
     * Actual Usage
     * Theoretical Usage
     * Variance Analysis

### Summary Cards
Metrics:
1. Total Consumption
   - Value
   - vs Theoretical
   - Variance %

2. Top Variances
   - Highest usage items
   - Cost impact
   - Trend

3. Waste Analysis
   - Waste percentage
   - Cost of waste
   - Trend

4. Performance
   - Efficiency rating
   - Target vs Actual
   - Impact on cost

### Chart Section
Multiple chart types:
1. Usage Trends
   - Actual vs Theoretical
   - By product category
   - By location

2. Variance Analysis
   - Positive/negative variances
   - Cost impact
   - Trend analysis

### Detailed Grid
Columns:
1. Product Details
   - Code
   - Name
   - Category
   - Unit

2. Actual Usage
   - Quantity
   - Cost
   - Usage rate

3. Theoretical Usage
   - Expected quantity
   - Standard cost
   - Calculated rate

4. Variance Analysis
   - Quantity variance
   - Cost variance
   - Percentage variance

## Common Components

### 1. Notification System
Types:
1. Toast Notifications
   - Success messages
   - Error alerts
   - Warning notifications
   - Position: Top-right
   - Auto-dismiss: 5 seconds
   - Action buttons when applicable

2. Error Messages
   - Inline validation
   - System errors
   - Connection issues
   - Recovery options

3. Success Confirmations
   - Action completion
   - Save confirmations
   - Export completion
   - Links to results

### 2. Navigation
Components:
1. Side Menu
   - Fixed position
   - Collapsible
   - Section hierarchy
   - Quick links

2. Breadcrumbs
   - Current location
   - Navigation path
   - Click navigation

3. Quick Actions
   - Contextual buttons
   - Common tasks
   - Recent items

### 3. Search & Filter
Features:
1. Global Search
   - Type: Full-text search
   - Scope selection
   - Results grouping
   - Recent searches

2. Advanced Filters
   - Custom criteria
   - Date ranges
   - Multiple conditions
   - Save/load filters

3. Filter Presets
   - Save current filters
   - Load saved filters
   - Share filters
   - Default presets

### Responsive Design

#### Desktop (>1024px)
- Full layout
- All features visible
- Multi-column grids
- Advanced charts

#### Tablet (768px-1024px)
- Stacked layout
- Scrollable sections
- Simplified charts
- Essential filters

#### Mobile (<768px)
- Single column
- Card-based views
- Basic charts
- Core features only