# Reporting & Analytics Module - Sitemap

> **Module:** Reporting & Analytics
> **Total Pages:** 15-20
> **Route Base:** `/reporting-analytics`

---

## Navigation Hierarchy

```
Reporting & Analytics (15-20 pages)
├── Main Dashboard (1 page)
│   └── /reporting-analytics
└── Consumption Analytics (14-19 pages)
    ├── Enhanced Dashboard (2 pages)
    │   ├── /reporting-analytics/consumption-analytics
    │   └── Real-Time KPI Monitoring
    ├── Fractional Sales Analytics (3 pages)
    │   ├── Efficiency by Type
    │   ├── Transaction Volume
    │   └── Today's Distribution
    ├── Variance Analysis (3 pages)
    │   ├── Top Variance Ingredients
    │   ├── Trend Analysis
    │   └── Root Cause Identification
    ├── Live Ingredient Tracking (2 pages)
    │   ├── Real-Time Inventory Levels
    │   └── Depletion Projections
    ├── Efficiency Analysis (2 pages)
    │   ├── Yield Efficiency Trends
    │   └── Optimization Opportunities
    ├── Executive Summary Dashboard (2 pages - planned)
    │   ├── High-Level KPIs
    │   └── Executive Reporting
    └── Automated Reporting (2-5 pages - planned)
        ├── Report Scheduling
        ├── Email Distribution
        └── Custom Report Builder
```

---

## Page Details

### 1. Main Dashboard (1 page)

**Route:** `/reporting-analytics`

**Status:** Coming Soon

**Purpose**: Central hub for all reporting and analytics features.

**Planned Features**:
- Quick access to consumption analytics
- Summary KPI widgets
- Recent reports list
- Scheduled reports management
- Custom report builder access

---

### 2. Consumption Analytics Dashboard (2 pages)

**Route:** `/reporting-analytics/consumption-analytics`

**Status:** ✅ Production Ready

**Purpose**: Enhanced real-time consumption tracking with fractional sales analytics.

#### Main Dashboard Features

**Page Components**:
1. **Header Controls**:
   - Location selector (Main Kitchen, Pastry Section, Bar Station)
   - Time range selector (Today, This Week, This Month)
   - Auto-refresh toggle (30-second intervals)
   - Export button

2. **Active Alerts Panel**:
   - Critical, Warning, and Info severity levels
   - Alert message and affected items
   - Recommended actions
   - Visual severity indicators (red, yellow, blue)

3. **KPI Cards (6 metrics)**:
   - Food Cost Percentage (Target: 30%)
   - Waste Percentage (Target: 3%)
   - Fractional Sales Rate (Conversion tracking)
   - Average Transaction Value (Trend indicators)
   - Profit Margin (Performance grading)
   - Yield Efficiency (Performance rating)

4. **Tab Navigation**:
   - Overview
   - Fractional Sales
   - Variance Analysis
   - Ingredients
   - Efficiency

#### Real-Time Data

**Auto-Refresh Features**:
- 30-second refresh interval (configurable)
- Live KPI updates
- Real-time alert generation
- Dynamic chart updates
- Automatic data synchronization

**Data Sources**:
- POS transaction stream
- Inventory management system
- Recipe management system
- Consumption period tracking

---

### 3. Overview Tab (Part of Consumption Analytics - 1 page)

**Features**:

#### Consumption Trends Chart
- **Chart Type**: Composed chart (bars + lines)
- **Data**: 7-day rolling consumption
- **Metrics**:
  - Theoretical consumption (blue line)
  - Actual consumption (green line)
  - Waste amount (red bars)
- **X-Axis**: Day (1-7)
- **Y-Axis**: Cost ($)
- **Tooltip**: Currency-formatted values

#### Sales Distribution Chart
- **Chart Type**: Stacked area chart
- **Data**: Fractional vs whole item sales
- **Metrics**:
  - Fractional sales (purple area)
  - Whole sales (cyan area)
- **X-Axis**: Day (1-7)
- **Y-Axis**: Transaction count
- **Tooltip**: Transaction counts

---

### 4. Fractional Sales Tab (3 pages worth of content)

**Features**:

#### Efficiency by Type Chart
- **Chart Type**: Dual-axis bar + line chart
- **Types Tracked**:
  - Pizza Slice (1/8 conversion)
  - Cake Slice (1/12 conversion)
  - Portion Control (variable)
  - Bottle Glass (1/5 conversion)
- **Left Y-Axis**: Revenue ($) and transaction count
- **Right Y-Axis**: Efficiency percentage
- **Metrics**:
  - Revenue per type (green bars)
  - Transactions per type (blue bars)
  - Efficiency percentage (orange line)

#### Real-Time Distribution Panel
- **Today's Fractional Sales**: Total transaction count
- **Breakdown by Type**:
  - Pizza Slices: Count + percentage
  - Cake Slices: Count + percentage
  - Portions: Count + percentage
  - Others: Count + percentage
- **Visual**: Progress bars for each type
- **Updates**: Real-time with auto-refresh

#### Performance Metrics
- **Efficiency Target**: 90%+
- **Waste Target**: < 5%
- **Revenue Contribution**: Percentage of total revenue
- **Transaction Volume**: Daily/weekly/monthly trends

---

### 5. Variance Analysis Tab (3 pages worth of content)

**Features**:

#### Top Variance Ingredients List
- **Display**: Ranked list (top 5 default, expandable)
- **Columns**:
  - Ingredient name
  - Theoretical cost
  - Actual cost
  - Variance percentage
  - Trend indicator (up/down/stable)
- **Visual Indicators**:
  - Green: < 8% variance (acceptable)
  - Yellow: 8-15% variance (warning)
  - Red: > 15% variance (critical)

**Example Variance Items**:
1. **Fresh Vegetables**: 13.6% variance (high, up trend)
   - Theoretical: $125.00
   - Actual: $142.00
   - Recommended action: Improve storage procedures

2. **Chicken Breast**: 11.4% variance (high, up trend)
   - Theoretical: $210.00
   - Actual: $234.00
   - Recommended action: Review portion control

3. **Fresh Herbs**: 6.7% variance (acceptable, stable)
   - Theoretical: $45.00
   - Actual: $48.00
   - No action required

#### Variance Drivers Analysis
- **Wastage**: Spoilage, prep waste, disposal
- **Over-Portioning**: Inconsistent portions, training gaps
- **Ingredient Cost Changes**: Price fluctuations
- **Recipe Deviation**: Non-standard preparation
- **Spillage**: Accidental loss
- **Theft**: Shrinkage, unauthorized use

#### Statistical Analysis
- **Mean Variance**: Average across all ingredients
- **Median Variance**: Middle value (less affected by outliers)
- **Standard Deviation**: Variance consistency measure
- **Confidence Intervals**: Statistical confidence levels
- **Outlier Detection**: Items beyond 2-3 standard deviations

---

### 6. Ingredients Tab (2 pages worth of content)

**Features**:

#### Live Ingredient Levels Grid
- **Display**: Card grid (3 columns on desktop)
- **Per Card Information**:
  - Ingredient name
  - Status badge (Adequate, Low, Critical, Out of Stock)
  - Current level (numeric)
  - Progress bar (vs reorder point)
  - Reorder point threshold
  - Projected depletion date

**Status Thresholds**:
- **Adequate** (Green): > 2x reorder point
- **Low** (Yellow): Between reorder point and 2x reorder point
- **Critical** (Red): Below reorder point
- **Out of Stock** (Urgent): Zero inventory

#### Depletion Projections
- **Algorithm**: Consumption rate × remaining quantity
- **Factors**:
  - Historical consumption patterns
  - Current sales velocity
  - Day of week adjustments
  - Seasonal variations
- **Accuracy**: ± 1 day for stable consumption patterns

#### Real-Time Updates
- **Frequency**: Every 60 seconds
- **Trigger Events**:
  - New POS transaction
  - Inventory adjustment
  - Stock receipt
  - Waste/spoilage recording

---

### 7. Efficiency Tab (2 pages worth of content)

**Features**:

#### Yield Efficiency Trends Chart
- **Chart Type**: Dual-line chart
- **Time Range**: 7-day rolling window
- **Lines**:
  - Target efficiency (blue dashed line, 95%)
  - Actual efficiency (green solid line)
- **Y-Axis Range**: 80-100%
- **Tooltip**: Percentage format

#### Optimization Opportunities Panel
- **Display**: Prioritized list of improvement opportunities
- **Per Opportunity**:
  - Title and description
  - Impact badge (High, Medium, Long Term)
  - Detailed explanation
  - Potential savings ($/day)
  - Implementation button ("View Details")

**Example Opportunities**:

1. **Reduce Vegetable Waste**
   - **Impact**: High
   - **Description**: Improve storage and handling procedures to reduce 13.6% variance
   - **Potential Savings**: $125.50/day
   - **Action**: Review storage temperatures, rotation procedures, prep schedules

2. **Optimize Portion Sizes**
   - **Impact**: Medium
   - **Description**: Standardize fractional portion sizes for better yield control
   - **Potential Savings**: $89.25/day
   - **Action**: Implement portion control tools, staff training

3. **Recipe Standardization**
   - **Impact**: Long Term
   - **Description**: Update recipe specifications based on actual consumption patterns
   - **Potential Savings**: $67.80/day
   - **Action**: Analyze 30+ days of consumption data, revise recipes

#### Efficiency Metrics
- **Current Yield Efficiency**: 92.8%
- **Target**: 95%
- **Gap to Target**: 2.2 percentage points
- **Trend**: Improving / Stable / Declining
- **Projected Impact**: Cost savings if target achieved

---

### 8. Executive Summary Dashboard (2 pages - Planned)

**Status:** 🚧 Planned

**Purpose**: High-level executive dashboard with strategic KPIs and trends.

**Planned Features**:
- **Key Financial Metrics**:
  - Total revenue (period)
  - Total costs (period)
  - Gross profit and margin
  - Variance impact on profitability

- **Strategic KPIs**:
  - Food cost percentage trends
  - Waste reduction progress
  - Efficiency improvement rate
  - Revenue per location

- **Executive Charts**:
  - Monthly P&L trends
  - Location comparison matrix
  - Category performance heatmap
  - Improvement opportunity ranking

- **Automated Insights**:
  - Top 3 improvement opportunities
  - Critical variances requiring attention
  - Cost savings achieved (vs baseline)
  - Forecasted next period performance

---

### 9. Automated Reporting (2-5 pages - Planned)

**Status:** 🚧 Planned

**Purpose**: Scheduled report generation and distribution system.

#### Report Scheduling (1 page)

**Features**:
- **Schedule Types**:
  - Daily summary (end of day)
  - Weekly performance (Monday mornings)
  - Monthly comprehensive (month-end + 1 day)
  - Custom schedules (cron-like syntax)

- **Report Templates**:
  - Consumption analytics summary
  - Variance analysis report
  - Fractional sales performance
  - Efficiency opportunities
  - Executive summary

- **Delivery Options**:
  - Email distribution (multiple recipients)
  - Shared folder (PDF/Excel)
  - API webhook (JSON)
  - Dashboard archive

#### Custom Report Builder (2-3 pages)

**Features**:
- **Data Source Selection**:
  - Consumption metrics
  - Variance analysis
  - Fractional sales
  - Ingredient tracking
  - Efficiency metrics

- **Filter Configuration**:
  - Date range (custom)
  - Location filter
  - Category filter
  - Ingredient filter
  - Recipe filter

- **Metric Selection**:
  - Drag-and-drop metric builder
  - Calculated fields
  - Aggregations (sum, average, min, max)
  - Comparisons (vs prior period, vs budget)

- **Visualization Options**:
  - Chart type selection
  - Table formatting
  - Conditional formatting
  - Export formats (PDF, Excel, CSV)

#### Report Archive (1 page)

**Features**:
- **Report History**:
  - Generated reports list
  - Download links
  - Regenerate option
  - Archive/delete

- **Report Metadata**:
  - Generation timestamp
  - Parameters used
  - Data period
  - Generated by (user/automated)

---

## Technical Integration

### Data Flow

```
POS System → Real-Time Transaction Stream → Consumption Tracking Engine
    ↓
Recipe System → Theoretical Consumption Calculator
    ↓
Inventory System → Actual Consumption Tracker
    ↓
Variance Analysis Engine → Alert Generator
    ↓
Dashboard Visualization Layer → User Interface
```

### Performance Requirements

- **Dashboard Load**: < 2 seconds initial load
- **Auto-Refresh**: < 500ms incremental update
- **Chart Rendering**: < 1 second per chart
- **Data Export**: < 5 seconds standard ranges
- **WebSocket Latency**: < 100ms for real-time updates

### Technology Stack

- **Frontend**: React, TypeScript, Recharts
- **Real-Time**: WebSocket connections
- **State Management**: React hooks, React Query
- **Charts**: Recharts (Composed, Area, Line, Bar, Scatter charts)
- **UI Components**: Shadcn/ui (Cards, Tabs, Progress, Badges, Buttons)

---

## Component Files

### Primary Components

1. **enhanced-consumption-dashboard.tsx** (733 lines)
   - Main dashboard orchestrator
   - Tab management
   - Real-time data handling
   - Chart rendering
   - Alert display

2. **executive-summary-dashboard.tsx** (planned)
   - High-level KPI cards
   - Strategic trend charts
   - Executive reporting interface

3. **automated-reporting-dashboard.tsx** (planned)
   - Report scheduling interface
   - Custom report builder
   - Report archive management

4. **compliance-reports.tsx** (planned)
   - Regulatory compliance reporting
   - Audit trail reports
   - Variance compliance tracking

5. **cross-location-efficiency.tsx** (planned)
   - Multi-location comparison
   - Efficiency benchmarking
   - Best practice sharing

6. **fractional-comparison-reports.tsx** (planned)
   - Detailed fractional sales analysis
   - Cross-type comparisons
   - Efficiency deep-dive

7. **operational-dashboard.tsx** (planned)
   - Operational metrics
   - Shift-level analytics
   - Staff performance tracking

8. **recipe-variant-performance.tsx** (planned)
   - Recipe-level consumption tracking
   - Variant performance comparison
   - Recipe optimization suggestions

9. **time-pattern-analysis.tsx** (planned)
   - Time-of-day consumption patterns
   - Day-of-week trends
   - Seasonal variations
   - Predictive analytics

---

## Future Enhancements

### Planned Features (Next 6 Months)

1. **Predictive Analytics**:
   - Machine learning consumption forecasting
   - Automated variance pattern detection
   - Anomaly detection and alerting

2. **Mobile App**:
   - Real-time KPI monitoring on mobile
   - Push notifications for critical alerts
   - Quick variance entry and review

3. **Advanced Visualizations**:
   - Interactive drill-down charts
   - Heatmaps for pattern identification
   - Sankey diagrams for cost flow
   - Statistical process control charts

4. **Expanded Reporting**:
   - Custom dashboard builder
   - Scheduled PDF reports via email
   - API for third-party BI tool integration
   - Data warehouse export

5. **Enhanced Analytics**:
   - Multi-location comparison dashboards
   - Benchmark against industry standards
   - What-if scenario modeling
   - ROI calculator for improvements

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
