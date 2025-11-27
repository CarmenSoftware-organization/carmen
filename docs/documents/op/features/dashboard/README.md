# Operational Planning Dashboard

> **Feature:** Operational Planning > Dashboard
> **Pages:** 1
> **Status:** ✅ Production Ready

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

The Operational Planning Dashboard provides a customizable, drag-and-drop interface for monitoring key operational metrics including demand forecasting, menu performance, inventory planning, and recipe updates. Users can personalize their dashboard layout to focus on the most relevant metrics for their role.

### Key Features

1. **Drag-and-Drop Customization** - Rearrange dashboard widgets
2. **Demand Forecasting** - Forecast vs actual sales comparison
3. **Menu Performance** - Sales and profit tracking by recipe
4. **Inventory Planning** - Stock status distribution (overstocked, optimal, understocked, stockout risk)
5. **Real-Time Updates** - Live data refresh
6. **Responsive Design** - Adapts to all screen sizes

---

## Page Structure

### Main Dashboard
**Route:** `/operational-planning`

**Layout:** Responsive grid (1 column mobile, 2 columns tablet, 3 columns desktop)

---

## Dashboard Widgets

### 1. Demand Forecast vs Actual
**Type:** Line Chart
**Data Source:** Sales history + forecasting algorithm

**Metrics Displayed:**
- Forecasted sales by day
- Actual sales by day
- Variance percentage
- Trend indicators

**Chart Configuration:**
```typescript
interface DemandForecastData {
  day: string; // Day of week or date
  forecast: number; // Predicted sales
  actual: number; // Real sales
}

// Example data
const data = [
  { day: 'Mon', forecast: 1000, actual: 950 },
  { day: 'Tue', forecast: 1200, actual: 1150 },
  { day: 'Wed', forecast: 1100, actual: 1050 },
  { day: 'Thu', forecast: 1300, actual: 1250 },
  { day: 'Fri', forecast: 1500, actual: 1600 },
  { day: 'Sat', forecast: 1800, actual: 1900 },
  { day: 'Sun', forecast: 1600, actual: 1700 }
];
```

**Insights:**
- Green line: Actual sales
- Blue line: Forecast
- Accuracy percentage displayed
- Over/under forecast indicators

### 2. Menu Performance
**Type:** Bar Chart (Dual Axis)
**Data Source:** Menu engineering analysis

**Metrics Displayed:**
- Sales volume per dish (left axis)
- Profit per dish (right axis)
- Top 5 performers shown

**Chart Configuration:**
```typescript
interface MenuPerformanceData {
  name: string; // Dish name
  sales: number; // Units sold
  profit: number; // Total profit in currency
}

// Example data
const data = [
  { name: 'Dish A', sales: 120, profit: 600 },
  { name: 'Dish B', sales: 80, profit: 480 },
  { name: 'Dish C', sales: 100, profit: 550 },
  { name: 'Dish D', sales: 60, profit: 420 },
  { name: 'Dish E', sales: 90, profit: 540 }
];
```

**Insights:**
- Identify best sellers
- Compare sales vs profitability
- Spot underperformers
- Quick link to Menu Engineering

### 3. Inventory Planning Status
**Type:** Pie Chart
**Data Source:** Inventory management system

**Categories:**
- **Overstocked** (Red): Items above max stock level
- **Optimal** (Green): Items within target range
- **Understocked** (Yellow): Items below min stock level
- **Stockout Risk** (Orange): Items approaching zero

**Chart Configuration:**
```typescript
interface InventoryPlanningData {
  category: 'Overstocked' | 'Optimal' | 'Understocked' | 'Stockout Risk';
  value: number; // Percentage
}

// Example data
const data = [
  { category: 'Overstocked', value: 20 },
  { category: 'Optimal', value: 60 },
  { category: 'Understocked', value: 15 },
  { category: 'Stockout Risk', value: 5 }
];
```

**Insights:**
- Overall inventory health
- Action items by category
- Click to view detailed inventory report
- Alerts for critical items

### 4. Recipe Updates Widget
**Type:** Text Summary
**Data Source:** Recipe management system

**Information Displayed:**
- Number of recipes updated in last 7 days
- Recently modified recipes
- Pending approvals
- Draft recipes count

**Example:**
```
3 recipes updated in the last week
- Thai Green Curry (cost updated)
- Caesar Salad (new variant added)
- Margherita Pizza (ingredients modified)
```

### 5. Upcoming Events Widget
**Type:** Text Summary
**Data Source:** Calendar/Events system

**Information Displayed:**
- Scheduled major events
- Expected attendance
- Menu planning status
- Special requirements

**Example:**
```
2 major events scheduled next month
- Wedding Reception (200 guests) - Jan 28
- Corporate Banquet (150 guests) - Feb 5
```

### 6. Menu Engineering Widget
**Type:** Text Summary
**Data Source:** Menu engineering analysis

**Information Displayed:**
- Items needing attention
- Classification changes
- Optimization opportunities
- Quick actions

**Example:**
```
5 dishes identified for menu optimization
- 2 Dogs: Consider removal
- 2 Plow Horses: Increase price
- 1 Puzzle: Enhance marketing
```

---

## Drag-and-Drop Functionality

### Implementation
**Library:** `react-beautiful-dnd`

### Features:
- **Drag Handle**: Entire widget card is draggable
- **Drop Zones**: Visual indicators during drag
- **Smooth Animation**: Transitions between positions
- **Persistence**: Layout saved to user preferences
- **Reset Layout**: Option to restore default arrangement

### User Actions:
1. Click and hold on any widget
2. Drag to desired position
3. Drop in new location
4. Layout auto-saves

### Technical Details:
```typescript
interface DashboardItem {
  id: string; // Unique widget identifier
  content: string; // Widget title
  type: 'demandForecast' | 'menuPerformance' | 'inventoryPlanning' | 'text';
  data?: any; // Widget-specific data
}

// Layout state persisted to localStorage
const saveLayout = (items: DashboardItem[]) => {
  localStorage.setItem('dashboardLayout', JSON.stringify(items));
};
```

---

## Data Model

```typescript
interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: number; // Display order
  size: 'small' | 'medium' | 'large';
  refreshInterval: number; // Seconds
  dataSource: string;
  filters?: WidgetFilter[];
  visible: boolean;
}

type WidgetType =
  | 'demandForecast'
  | 'menuPerformance'
  | 'inventoryPlanning'
  | 'recipeUpdates'
  | 'upcomingEvents'
  | 'menuEngineering';

interface WidgetFilter {
  field: string;
  operator: string;
  value: any;
}

interface DashboardPreferences {
  userId: string;
  layout: DashboardWidget[];
  defaultView: 'grid' | 'list';
  refreshRate: number; // Seconds
  theme: 'light' | 'dark';
}
```

---

## API Endpoints

```http
# Dashboard Data
GET /api/operational-planning/dashboard
GET /api/operational-planning/dashboard/widgets

# Individual Widget Data
GET /api/operational-planning/dashboard/demand-forecast
GET /api/operational-planning/dashboard/menu-performance
GET /api/operational-planning/dashboard/inventory-planning
GET /api/operational-planning/dashboard/recipe-updates
GET /api/operational-planning/dashboard/upcoming-events

# User Preferences
GET /api/operational-planning/dashboard/preferences
PUT /api/operational-planning/dashboard/preferences
POST /api/operational-planning/dashboard/preferences/reset
```

---

## Business Rules

### Data Refresh
1. **Demand Forecast**: Updated every 6 hours
2. **Menu Performance**: Updated daily at midnight
3. **Inventory Planning**: Real-time updates
4. **Recipe Updates**: Updated on change
5. **Upcoming Events**: Updated hourly

### Widget Visibility
1. **Role-Based**: Widgets visible based on user role
2. **Permission-Gated**: Sensitive data requires permissions
3. **Customizable**: Users can show/hide widgets
4. **Default Layout**: Different defaults per role

### Data Accuracy
1. **Forecast Accuracy**: Displayed with confidence interval
2. **Real-Time Lag**: Max 5 minutes for inventory data
3. **Historical Range**: Last 30 days for trends
4. **Cache Duration**: 5 minutes for dashboard data

---

## Integration Points

### Recipe Management
- Recipe update notifications
- Draft recipe count
- Cost change alerts
- New recipe approvals

### Menu Engineering
- Performance classification
- Optimization recommendations
- Alert summaries
- Quick action links

### Inventory Management
- Stock status aggregation
- Reorder point alerts
- Wastage tracking
- Stockout predictions

### Forecasting System
- Sales predictions
- Demand patterns
- Seasonal adjustments
- Accuracy tracking

### Events Management
- Scheduled events
- Expected volumes
- Special requirements
- Menu planning status

---

## User Guide

### Customizing Dashboard Layout

1. **Rearrange Widgets**:
   - Click and drag any widget
   - Drop in desired position
   - Layout saves automatically

2. **Reset Layout**:
   - Click settings icon
   - Select "Reset to Default"
   - Confirm action

3. **Hide/Show Widgets**:
   - Click settings icon
   - Toggle widget visibility
   - Save preferences

### Reading Charts

**Demand Forecast:**
- Blue line = Predicted sales
- Green line = Actual sales
- Above forecast = Positive variance
- Below forecast = Negative variance

**Menu Performance:**
- Blue bars = Sales volume
- Green bars = Profit amount
- Taller bars = Better performers

**Inventory Planning:**
- Green = Healthy stock levels (target 60-70%)
- Yellow = Needs attention (keep <20%)
- Orange = Critical (keep <10%)
- Red = Action required (keep <20%)

### Taking Action

From dashboard widgets, users can:
- Click charts to drill down
- View detailed reports
- Navigate to related modules
- Create quick tasks
- Export data

---

## Responsive Design

### Breakpoints

**Mobile (< 768px)**
- 1 column layout
- Stacked widgets
- Condensed charts
- Simplified interactions

**Tablet (768px - 1024px)**
- 2 column layout
- Medium-sized widgets
- Full chart features
- Touch-optimized

**Desktop (> 1024px)**
- 3 column layout
- Large widgets
- Full functionality
- Mouse interactions

### Adaptive Content
- Charts scale to container
- Text wraps appropriately
- Icons adjust to size
- Touch targets >44px on mobile

---

## Performance Optimization

### Best Practices

1. **Lazy Loading**:
   - Widgets load on scroll
   - Charts render on viewport entry
   - Images loaded progressively

2. **Caching**:
   - Dashboard data cached 5 minutes
   - Widget preferences cached locally
   - Chart data memoized

3. **Efficient Rendering**:
   - React.memo for widgets
   - UseMemo for calculations
   - Debounced drag events
   - Virtualized lists for large data

4. **Data Management**:
   - Paginated API responses
   - Aggregated data where possible
   - Incremental updates
   - Background refresh

### Load Time Targets
- Initial render: <2 seconds
- Widget load: <500ms each
- Chart rendering: <300ms
- Drag response: <100ms

---

## Accessibility

### WCAG 2.1 AA Compliance

**Keyboard Navigation:**
- Tab through widgets
- Arrow keys for drag-and-drop
- Enter/Space to activate
- Escape to cancel

**Screen Reader Support:**
- ARIA labels on all widgets
- Chart data tables provided
- Status announcements
- Landmark regions

**Visual Accessibility:**
- Color contrast ratio >4.5:1
- Chart patterns (not just colors)
- Resizable text
- Focus indicators

---

## Troubleshooting

### Issue: Widgets Not Loading
**Cause**: API connection error or timeout
**Solution**: Refresh page, check network connection, verify API status

### Issue: Drag-and-Drop Not Working
**Cause**: Browser compatibility or JavaScript disabled
**Solution**: Use modern browser (Chrome, Firefox, Safari, Edge), enable JavaScript

### Issue: Data Not Updating
**Cause**: Cache issue or stale data
**Solution**: Hard refresh (Ctrl+F5), clear browser cache, check refresh interval settings

### Issue: Charts Not Displaying
**Cause**: Missing data or rendering error
**Solution**: Verify data availability, check date range, refresh widget

---

## Future Enhancements

**Planned Features:**
- Custom widget creation
- More chart types (heatmaps, gauges)
- Real-time collaboration
- AI-powered insights
- Voice commands
- Mobile app version
- Widget marketplace
- Advanced filtering per widget

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
