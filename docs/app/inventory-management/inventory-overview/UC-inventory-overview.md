# Use Cases: Inventory Overview

**Module**: Inventory Management
**Sub-module**: Inventory Overview
**Version**: 1.0
**Last Updated**: 2025-01-10

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Table of Contents
1. [Use Case Index](#use-case-index)
2. [User Use Cases](#user-use-cases)
3. [System Use Cases](#system-use-cases)

---

## Use Case Index

### User Use Cases
- **UC-INV-OVW-001**: View Inventory Dashboard
- **UC-INV-OVW-002**: Customize Dashboard Layout
- **UC-INV-OVW-003**: Filter by Location
- **UC-INV-OVW-004**: Analyze Stock Distribution
- **UC-INV-OVW-005**: Review Location Performance
- **UC-INV-OVW-006**: Generate Transfer Suggestions
- **UC-INV-OVW-007**: Navigate to Detailed Reports
- **UC-INV-OVW-008**: Monitor Critical Alerts

### System Use Cases
- **UC-INV-OVW-101**: Load Dashboard Data
- **UC-INV-OVW-102**: Aggregate Multi-Location Metrics
- **UC-INV-OVW-103**: Calculate Performance Scores
- **UC-INV-OVW-104**: Generate Transfer Recommendations

---

## User Use Cases

### UC-INV-OVW-001: View Inventory Dashboard

**Actor(s)**: Store Manager, Purchasing Manager, Financial Controller, General Manager

**Priority**: Critical

**Preconditions**:
- User is authenticated
- User has "Inventory View" permission
- User is assigned to at least one location

**Postconditions**:
- Dashboard displays current inventory metrics
- All charts and widgets rendered
- User's location filter applied

**Main Flow**:
1. User navigates to `/inventory-management` route
2. System displays loading state (800ms)
3. System loads inventory data for accessible locations
4. System renders dashboard with default "All Locations" view
5. System displays:
   - 6 draggable widgets (Inventory Levels, Value Trend, Turnover, Alerts)
   - 4 summary metric cards (Total Items, Value, Low Stock, Expiring)
   - 3 tabbed sections (Overview, Performance, Transfers)
6. System applies user's saved layout preferences (if exists)
7. Dashboard displays successfully

**Alternative Flows**:

**AF-001: First Time User**
- At step 6: No saved preferences exist
- System displays default widget layout
- User sees welcome message or onboarding tooltip

**AF-002: Single Location Access**
- At step 3: User only has access to one location
- System automatically filters to that location
- Location selector disabled or hidden

**Exception Flows**:

**EF-001: No Data Available**
- At step 3: No inventory data exists for user's locations
- System displays empty state message
- System shows "Get Started" guidance

**EF-002: Loading Timeout**
- At step 3: Data loading exceeds 10 seconds
- System displays error message
- System offers manual retry button

**Source Evidence**: `app/(main)/inventory-management/page.tsx:45-150`

---

### UC-INV-OVW-002: Customize Dashboard Layout

**Actor(s)**: All authenticated users

**Priority**: High

**Preconditions**:
- User is viewing dashboard
- Dashboard is fully loaded

**Postconditions**:
- Widgets rearranged in new positions
- Layout preference saved to user profile
- New layout persists across sessions

**Main Flow**:
1. User clicks and holds on widget drag handle
2. System highlights droppable zones
3. User drags widget to new position
4. System shows visual placeholder at drop target
5. User releases widget
6. System animates widget to new position
7. System reflows remaining widgets
8. System saves layout preference via API
9. System displays confirmation (toast/notification)

**Alternative Flows**:

**AF-001: Cancel Drag**
- At step 4: User presses ESC or drags outside valid zone
- Widget returns to original position
- No changes saved

**Exception Flows**:

**EF-001: Save Preference Failed**
- At step 8: API call fails (network error)
- Layout changes still visible in current session
- System displays warning: "Layout not saved. Will reset on refresh."
- System retries save on next user action

**Source Evidence**: `app/(main)/inventory-management/page.tsx:48-58` (onDragEnd handler)

---

### UC-INV-OVW-003: Filter by Location

**Actor(s)**: Store Manager, Purchasing Manager, General Manager

**Priority**: Critical

**Preconditions**:
- User is viewing dashboard
- User has access to multiple locations

**Postconditions**:
- All metrics and charts filtered to selected location
- Filter selection persisted
- Location context applied to navigation links

**Main Flow**:
1. User clicks location selector dropdown
2. System displays list of accessible locations
3. System shows "All Locations" option at top
4. User selects specific location
5. System updates state with selected location
6. System recalculates all metrics for selected location:
   - Summary cards (Total Items, Value, Low Stock, Expiring)
   - Stock distribution charts (quantity and value)
   - Performance metrics (if single location)
7. System maintains selected tab (Overview/Performance/Transfers)
8. Charts animate transition to new data
9. Location selection saved to session

**Alternative Flows**:

**AF-001: Select "All Locations"**
- At step 4: User selects "All Locations"
- System aggregates metrics across all accessible locations
- Performance tab shows comparison between locations
- Transfer suggestions generated across locations

**AF-002: System Administrator**
- At step 2: User has System Administrator role
- System shows all locations in dropdown (no filtering)
- User can access any location's data

**Exception Flows**:

**EF-001: No Access to Selected Location**
- At step 4: User selects location they don't have access to (edge case)
- System displays "Access Denied" message
- System reverts to "All Locations" view

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:76-95, 154-174`

---

### UC-INV-OVW-004: Analyze Stock Distribution

**Actor(s)**: Purchasing Manager, Department Manager, Store Manager

**Priority**: High

**Preconditions**:
- User is viewing dashboard
- Stock data loaded successfully
- User on "Overview" tab

**Postconditions**:
- User understands stock distribution patterns
- User identifies categories requiring attention

**Main Flow**:
1. User navigates to Overview tab
2. System displays two charts side-by-side:
   - Bar chart: Stock quantity by category
   - Pie chart: Stock value distribution by category
3. User hovers over bar chart bar
4. System displays tooltip: "[Category]: [Quantity] items"
5. User hovers over pie chart slice
6. System displays tooltip: "[Category]: [Currency Value] ([Percentage]%)"
7. User identifies categories with disproportionate quantity vs value
8. User clicks category in chart
9. System navigates to Stock Cards filtered by that category

**Alternative Flows**:

**AF-001: Single Category Dominance**
- At step 2: One category represents >70% of value
- System highlights this in chart with distinct color
- System adds annotation: "Food category represents 75% of total value"

**AF-002: Mobile View**
- At step 2: User on mobile device
- Charts stack vertically instead of side-by-side
- Charts height reduced for better mobile UX

**Exception Flows**:

**EF-001: No Category Data**
- At step 2: All categories have zero inventory
- System displays empty state
- System suggests: "Start by receiving inventory"

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:258-308`

---

### UC-INV-OVW-005: Review Location Performance

**Actor(s)**: General Manager, Purchasing Manager, Operations Manager

**Priority**: High

**Preconditions**:
- User is viewing dashboard
- Multiple locations exist in system
- Performance metrics calculated

**Postconditions**:
- User identifies high and low performing locations
- User has actionable insights for improvement

**Main Flow**:
1. User clicks "Performance" tab
2. System displays location performance comparison chart
3. Chart shows 3 metrics per location:
   - Stock Efficiency %
   - Turnover Rate
   - Fill Rate %
4. User reviews bar chart visualization
5. User scrolls to performance details table
6. System displays each location with:
   - Location name and icon
   - Performance badge (Excellent/Good/Average/Poor)
   - Metric values
7. User identifies "Poor" performing location
8. User clicks on location row
9. System navigates to that location's detailed dashboard

**Alternative Flows**:

**AF-001: All Locations Excellent**
- At step 6: All locations tagged "Excellent"
- System displays congratulatory message
- System shows historical comparison: "15% improvement from last quarter"

**AF-002: Sort by Metric**
- At step 6: User clicks column header (e.g., "Turnover Rate")
- Table re-sorts by that metric (highest to lowest)
- Sorting preference saved

**Exception Flows**:

**EF-001: Insufficient Data for Scoring**
- At step 3: Location has < 30 days of transaction history
- System displays "N/A" for performance metrics
- System adds note: "Insufficient data (min 30 days required)"

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:346-394`

---

### UC-INV-OVW-006: Generate Transfer Suggestions

**Actor(s)**: Purchasing Manager, Store Manager

**Priority**: Medium

**Preconditions**:
- User viewing dashboard
- Multiple locations with inventory data
- Stock imbalances exist across locations

**Postconditions**:
- Transfer suggestions generated
- Potential savings calculated
- User can initiate transfer workflow

**Main Flow**:
1. User clicks "Transfer Suggestions" tab
2. System analyzes inventory across all locations:
   - Identifies items with excess stock at one location
   - Identifies items approaching stockout at another location
   - Identifies items approaching expiry at one location
3. System generates transfer suggestions with:
   - Item name and code
   - From location → To location
   - Suggested quantity
   - Reason (excess_stock, approaching_stockout, expiry_risk)
   - Priority (High, Medium, Low)
   - Potential savings
4. System sorts suggestions by priority then savings
5. User reviews top suggestion
6. User clicks "Create Transfer" button
7. System opens transfer creation form with pre-filled data:
   - From/To locations
   - Item and quantity
   - Reason code
8. User submits transfer request
9. System creates transfer record (pending status)
10. System removes suggestion from list
11. System displays success confirmation

**Alternative Flows**:

**AF-001: No Transfer Opportunities**
- At step 2: Stock levels balanced across locations
- System displays message: "Stock well-distributed. No transfers recommended."
- System shows last transfer date

**AF-002: Dismiss Suggestion**
- At step 6: User clicks "Dismiss" instead of "Create Transfer"
- System removes suggestion from current view
- System logs dismissal (prevents re-suggestion for 7 days)

**Exception Flows**:

**EF-001: Transfer Creation Failed**
- At step 9: API error during transfer creation
- System displays error message
- Suggestion remains in list
- User can retry

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:396-438`, `lib/mock-data/location-inventory.ts:308-335`

---

### UC-INV-OVW-007: Navigate to Detailed Reports

**Actor(s)**: All users with inventory access

**Priority**: High

**Preconditions**:
- User viewing dashboard
- User on "Overview" tab

**Postconditions**:
- User navigated to selected report
- Current location filter context preserved

**Main Flow**:
1. User views Quick Actions section
2. System displays 4 report buttons in grid:
   - Inventory Balance (bar chart icon)
   - Stock Cards (package icon)
   - Slow Moving (clock icon)
   - Inventory Aging (alert icon)
3. User clicks "Inventory Balance" button
4. System captures current filter context (selected location)
5. System navigates to `/inventory-management/stock-overview/inventory-balance`
6. System passes location filter as query parameter
7. Report page loads with location pre-selected
8. User reviews detailed report

**Alternative Flows**:

**AF-001: Right-Click for New Tab**
- At step 3: User right-clicks button → "Open in new tab"
- Report opens in new browser tab
- Original dashboard remains open

**AF-002: Mobile View**
- At step 2: User on mobile device
- Buttons display in 2-column grid instead of 4
- Icons larger for touch targets

**Exception Flows**:

**EF-001: Report Access Denied**
- At step 5: User lacks permission for selected report
- System displays "Access Denied" message
- System suggests contacting administrator

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:310-343`

---

### UC-INV-OVW-008: Monitor Critical Alerts

**Actor(s)**: Store Manager, Storekeeper, Head Chef

**Priority**: Critical

**Preconditions**:
- User viewing dashboard
- Alert thresholds configured
- Inventory data current

**Postconditions**:
- User aware of critical stock issues
- User takes corrective action

**Main Flow**:
1. User views summary metric cards
2. System highlights "Low Stock" card in red with count: 7
3. System highlights "Expiring Soon" card in orange with count: 5
4. User clicks on "Low Stock" card
5. System navigates to Inventory Balance report
6. System auto-applies filter: "Stock Status = Below Reorder Point"
7. Report displays 7 items with:
   - Item name
   - Current quantity
   - Reorder point
   - Quantity needed
8. User initiates purchase requests for low stock items

**Alternative Flows**:

**AF-001: No Alerts**
- At step 2-3: Both counts are zero
- Cards display green checkmark
- Message: "All stock levels healthy"

**AF-002: Click Expiring Soon**
- At step 4: User clicks "Expiring Soon" instead
- System navigates to Inventory Aging report
- System filters: "Days Until Expiry ≤ 7"
- User reviews expiring items and plans usage

**Exception Flows**:

**EF-001: Data Stale**
- At step 2: Last data refresh > 15 minutes ago
- System displays warning icon
- System shows last update timestamp
- User clicks "Refresh Now" button

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:214-248`

---

## System Use Cases

### UC-INV-OVW-101: Load Dashboard Data

**Actor(s)**: System

**Triggered By**: User navigation to dashboard, auto-refresh timer

**Priority**: Critical

**Preconditions**:
- Database connection available
- User session valid

**Postconditions**:
- All dashboard data loaded in memory
- Charts and widgets ready to render

**Main Flow**:
1. System receives dashboard load request
2. System identifies user's accessible locations from session
3. System queries inventory data in parallel:
   - Query 1: Stock balances by location and category
   - Query 2: Recent stock movements (last 24 hours)
   - Query 3: Performance metrics by location
   - Query 4: Alert counts (low stock, expiring)
4. System aggregates results
5. System calculates derived metrics:
   - Total items across locations
   - Total inventory value
   - Turnover rates by category
   - Performance scores by location
6. System formats data for chart rendering
7. System returns data object to client
8. System caches results (TTL: 5 minutes)
9. Total processing time < 2 seconds

**Exception Flows**:

**EF-001: Database Query Timeout**
- At step 3: Query exceeds 5-second timeout
- System logs error with query details
- System returns cached data if available
- System displays "Using cached data" warning

**EF-002: Partial Data Failure**
- At step 3: One query fails, others succeed
- System proceeds with available data
- Failed metrics show "N/A"
- System logs error for investigation

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:54-67`, `lib/mock-data/location-inventory.ts:149-188`

---

### UC-INV-OVW-102: Aggregate Multi-Location Metrics

**Actor(s)**: System

**Triggered By**: UC-INV-OVW-101 (Load Dashboard Data)

**Priority**: High

**Preconditions**:
- Individual location data loaded
- User has access to multiple locations

**Postconditions**:
- Aggregated metrics calculated
- Ready for dashboard display

**Main Flow**:
1. System receives array of location stock data
2. System initializes aggregate totals:
   - totalItems = 0
   - totalValue = 0
   - totalLowStock = 0
   - totalExpiring = 0
3. System iterates through each location:
   ```
   For each location:
     totalItems += location.metrics.totalItems
     totalValue += location.metrics.totalValue.amount
     totalLowStock += location.lowStockCount
     totalExpiring += location.expiringCount
   ```
4. System aggregates category data:
   ```
   For each location.categories:
     If category exists in aggregate:
       aggregate[category].quantity += location.category.quantity
       aggregate[category].value += location.category.value
     Else:
       Create new aggregate category entry
   ```
5. System calculates weighted averages:
   - Average turnover rate (weighted by inventory value)
   - Average stock efficiency (weighted by total items)
6. System returns aggregated metrics object

**Source Evidence**: `app/(main)/inventory-management/stock-overview/page.tsx:98-114`, `lib/mock-data/location-inventory.ts:169-188`

---

### UC-INV-OVW-103: Calculate Performance Scores

**Actor(s)**: System

**Triggered By**: UC-INV-OVW-101 (Load Dashboard Data)

**Priority**: High

**Preconditions**:
- Location stock data available
- Minimum 30 days transaction history

**Postconditions**:
- Performance classification assigned
- Performance metrics calculated

**Main Flow**:
1. System receives location data
2. System calculates stock efficiency:
   ```
   stockEfficiency = (quantityAvailable / totalCapacity) × 100
   ```
3. System calculates turnover rate:
   ```
   turnoverRate = costOfGoodsSold / avgInventoryValue
   ```
4. System calculates fill rate:
   ```
   fillRate = (ordersFulfilled / totalOrders) × 100
   ```
5. System classifies performance:
   ```
   IF stockEfficiency ≥ 90 AND turnoverRate ≥ 8 AND fillRate ≥ 95:
     performance = "excellent"
   ELSE IF stockEfficiency ≥ 80 AND turnoverRate ≥ 6 AND fillRate ≥ 90:
     performance = "good"
   ELSE IF stockEfficiency ≥ 70 AND turnoverRate ≥ 4 AND fillRate ≥ 85:
     performance = "average"
   ELSE:
     performance = "poor"
   ```
6. System returns performance object with metrics and classification

**Source Evidence**: `lib/mock-data/location-inventory.ts:154-168`

---

### UC-INV-OVW-104: Generate Transfer Recommendations

**Actor(s)**: System

**Triggered By**: UC-INV-OVW-101 (Load Dashboard Data)

**Priority**: Medium

**Preconditions**:
- Multiple locations with stock data
- Stock balances calculated
- Reorder points configured

**Postconditions**:
- Transfer suggestions generated
- Savings calculated
- Suggestions prioritized

**Main Flow**:
1. System analyzes inventory across all location pairs
2. For each item across locations:
   ```
   For location A, location B:
     If A.quantity > A.reorderPoint × 2 AND B.quantity < B.reorderPoint:
       Calculate suggested transfer quantity
       Calculate potential savings
       Determine reason (excess_stock, approaching_stockout, etc.)
       Calculate priority
       Add to suggestions list
   ```
3. System calculates potential savings:
   ```
   savings = (carrying_cost_at_A × transfer_qty) + (stockout_cost_at_B)
   ```
4. System determines priority:
   ```
   IF B.quantity < B.reorderPoint × 0.1 OR expiry_within_3_days:
     priority = "high"
   ELSE IF B.quantity < B.reorderPoint OR expiry_within_7_days:
     priority = "medium"
   ELSE:
     priority = "low"
   ```
5. System sorts suggestions: priority DESC, savings DESC
6. System limits to top 20 suggestions
7. System returns transfer suggestions array

**Source Evidence**: `lib/mock-data/location-inventory.ts:308-335`

---

## Appendices

### Appendix A: Performance Metrics Calculations

**Stock Efficiency**:
```
Stock Efficiency % = (Quantity Available / Total Capacity) × 100

Where:
- Quantity Available = Items ready for use/sale
- Total Capacity = Maximum storage capacity for location
```

**Turnover Rate**:
```
Turnover Rate = Cost of Goods Sold (COGS) / Average Inventory Value

Where:
- COGS = Sum of issued inventory cost over period
- Average Inventory Value = (Opening + Closing Inventory) / 2
- Period = Typically 12 months (annualized)
```

**Fill Rate**:
```
Fill Rate % = (Orders Fulfilled Completely / Total Orders) × 100

Where:
- Orders Fulfilled Completely = Requisitions/transfers with 100% quantity delivered
- Total Orders = All requisitions/transfers in period
```

### Appendix B: Alert Threshold Definitions

| Alert Type | Threshold | Action Required |
|------------|-----------|-----------------|
| Low Stock | Quantity ≤ Reorder Point | Create purchase request |
| Expiring Soon | Expiry Date ≤ Today + 7 days | Plan usage or transfer |
| Overstock | Quantity > Reorder Point × 3 | Consider transfer |
| Obsolete | No movement in 180 days | Review for write-off |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-10 | System | Initial creation from source code analysis |
