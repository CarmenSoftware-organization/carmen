# Dashboard Module Documentation

## Overview

The Dashboard module serves as the primary landing page and command center for the Carmen ERP system. It provides a comprehensive overview of key metrics, recent activities, and actionable insights across procurement, inventory, and operational domains.

## Module Information

- **Module Name**: Dashboard
- **Route**: `/dashboard`
- **Access Level**: All authenticated users (role-based content visibility)
- **Primary Purpose**: Executive overview and quick access to system metrics

## Key Features

### 1. Main Metrics Dashboard Cards
- **Total Orders**: Display total purchase orders for the current month with trend analysis
- **Active Suppliers**: Show count of verified active suppliers with growth percentage
- **Inventory Value**: Current stock valuation with change indicators
- **Monthly Spend**: Total procurement expenditure with trend comparison

### 2. Status Cards
- **Critical Stock Items**: Alert for items below minimum threshold
- **Orders Pending Approval**: Count of orders awaiting manager approval
- **Completed Deliveries**: Weekly delivery completion metrics

### 3. Data Visualization Charts
- **Order Trends**: Area chart showing 6-month purchase order trends
- **Spend Analysis**: Bar chart displaying monthly procurement spend
- **Supplier Network Growth**: Line chart correlating supplier count with order volume

### 4. Recent Activities Table
- Real-time activity feed showing latest procurement and inventory operations
- Displays: Purchase Requests, Purchase Orders, Goods Receipts, Stock Adjustments, Vendor Invoices, Quality Checks
- Action menu for each activity (View, Edit, Delete)

### 5. Search and Navigation
- Global search functionality in header
- Quick access to notifications
- Settings access
- Sidebar navigation toggle

## Page Structure

### Header Component
**File**: `/app/(main)/dashboard/components/dashboard-header.tsx`

**Features**:
- Sidebar toggle button
- Page title: "Hotel Supply Chain Dashboard"
- Search bar (hidden on mobile)
- Notification bell icon
- Settings icon

### Metric Cards Component
**File**: `/app/(main)/dashboard/components/dashboard-cards.tsx`

**Main Metrics**:
1. Total Orders
   - Value display with icon
   - Percentage change with trend indicator
   - Description text

2. Active Suppliers
   - Count display with icon
   - Growth percentage
   - Verification status

3. Inventory Value
   - Dollar value with icon
   - Change percentage
   - Current stock context

4. Monthly Spend
   - Total spend display
   - Percentage change
   - Procurement context

**Status Indicators**:
1. Critical Stock Items
   - Badge with count
   - Alert status (red)
   - Threshold description

2. Orders Pending Approval
   - Badge with count
   - Warning status (yellow)
   - Approval context

3. Completed Deliveries
   - Badge with count
   - Success status (green)
   - Time period (weekly)

### Chart Component
**File**: `/app/(main)/dashboard/components/dashboard-chart.tsx`

**Visualizations**:

1. **Order Trends** (Area Chart)
   - Data: 6-month monthly orders
   - Type: Area chart with gradient fill
   - Metrics: Order count by month

2. **Spend Analysis** (Bar Chart)
   - Data: Monthly procurement spend (in thousands)
   - Type: Bar chart with rounded corners
   - Metrics: Dollar value by month

3. **Supplier Network Growth** (Line Chart)
   - Data: Supplier count and order volume correlation
   - Type: Dual-line chart
   - Metrics: Suppliers and orders over time

### Data Table Component
**File**: `/app/(main)/dashboard/components/dashboard-data-table.tsx`

**Columns**:
- Type: Activity type (Purchase Request, Purchase Order, etc.)
- Document: Document ID with reference number
- Target: Associated entity (supplier, department, etc.)
- Status: Current status with color-coded badge
- Priority: Priority level with color coding
- Reviewer: Assigned reviewer name
- Date: Activity date
- Actions: Dropdown menu with operations

**Status Colors**:
- Approved/Complete: Green
- Processing/Pending: Yellow
- Under Review: Blue
- Failed: Red

**Priority Colors**:
- Critical: Red
- High: Orange
- Medium: Yellow
- Low: Green

**Actions Menu**:
- View details
- Edit
- Delete (destructive action)

## Data Flow

### Static Data
Currently using mock data for demonstration:
- Chart data: 6 months of aggregated metrics
- Activity data: Recent 6 activities with various types

### Future Integration Points
1. **Real-time Metrics API**
   - Endpoint: `/api/dashboard/metrics`
   - Updates: Total orders, suppliers, inventory value, spend

2. **Activity Stream API**
   - Endpoint: `/api/dashboard/activities`
   - Pagination support
   - Real-time updates via WebSocket

3. **Chart Data API**
   - Endpoint: `/api/dashboard/charts`
   - Time range filtering
   - Aggregation by period

## State Management

### Client-Side State
- Chart configuration
- Table sorting and filtering
- Search query
- Selected time periods

### Server State
- Dashboard metrics
- Recent activities
- User preferences
- Role-based visibility rules

## User Interactions

### Available Actions
1. **Search**: Global search across entities
2. **View Details**: Navigate to activity detail pages
3. **Edit**: Modify activities (permission-based)
4. **Delete**: Remove activities (permission-based)
5. **Notifications**: View system notifications
6. **Settings**: Access user/system settings

### Navigation Flows
1. Dashboard → Activity Details (via table actions)
2. Dashboard → Module Pages (via sidebar)
3. Dashboard → Search Results (via search bar)
4. Dashboard → Notifications (via bell icon)
5. Dashboard → Settings (via settings icon)

## Responsive Design

### Breakpoints
- **Mobile** (< 768px): Stacked layout, hidden search
- **Tablet** (768px - 1024px): 2-column grid for cards
- **Desktop** (> 1024px): 4-column grid, full features

### Mobile Adaptations
- Sidebar converts to sheet overlay
- Search hidden, accessible via icon
- Cards stack vertically
- Charts maintain readability
- Table scrolls horizontally

## Accessibility

### ARIA Labels
- Sidebar trigger: "Toggle sidebar"
- Search input: "Search..."
- Notification button: "Notifications"
- Settings button: "Settings"
- Action buttons: Descriptive labels

### Keyboard Navigation
- Tab order follows visual hierarchy
- Dropdown menus keyboard accessible
- Chart tooltips accessible via keyboard
- Table rows focusable

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy (h1 for title)
- Status indicators announced
- Chart data accessible via table fallback

## Performance Considerations

### Optimization Strategies
1. **Client Components**: Charts and interactive elements only
2. **Static Rendering**: Header and card structure
3. **Code Splitting**: Chart library lazy loaded
4. **Image Optimization**: Icons via Lucide (tree-shakeable)

### Loading States
- Skeleton loaders for metrics
- Progressive chart rendering
- Incremental table loading
- Optimistic UI updates

## Security & Permissions

### Access Control
- All users can view dashboard
- Edit/Delete actions require specific permissions
- Metrics filtered by user role and department
- Sensitive data masked based on clearance level

### Data Visibility Rules
1. **Staff**: Own department metrics only
2. **Department Manager**: Department-wide metrics
3. **Financial Manager**: Full financial visibility
4. **Purchasing Staff**: Procurement metrics
5. **Executive**: Full system visibility

## Integration Points

### Connected Modules
1. **Procurement**: Purchase requests, orders, GRN
2. **Inventory Management**: Stock levels, adjustments
3. **Vendor Management**: Supplier data
4. **Reporting & Analytics**: Chart data sources
5. **Finance**: Spend analysis

### Shared Components
- UI components from `/components/ui`
- Chart components from shadcn/ui
- Icon library: Lucide React

## Future Enhancements

### Planned Features
1. **Customizable Widgets**: User-configurable dashboard layout
2. **Real-time Updates**: WebSocket integration for live metrics
3. **Advanced Filtering**: Date range, department, status filters
4. **Export Functionality**: PDF/Excel export of metrics
5. **Drill-down Analytics**: Click-through to detailed reports
6. **Alert Management**: Configurable threshold alerts
7. **Multi-location Support**: Location-specific dashboards
8. **Comparative Analysis**: Period-over-period comparisons

### Technical Debt
1. Replace mock data with API integration
2. Implement proper error boundaries
3. Add comprehensive loading states
4. Enhance mobile table experience
5. Add unit and integration tests

## Testing Strategy

### Unit Tests
- Component rendering
- Data transformation functions
- Status/priority color mapping
- Chart data formatting

### Integration Tests
- User interaction flows
- Navigation between components
- Search functionality
- Action menu operations

### E2E Tests
- Dashboard load performance
- Chart rendering accuracy
- Table pagination and sorting
- Cross-module navigation

## Related Documentation

- [Purchase Request Module](./procurement/purchase-requests/README.md)
- [Purchase Order Module](./procurement/purchase-orders/README.md)
- [Inventory Management](./inventory/stock-management/README.md)
- [Vendor Management](./vendor-management/README.md)
- [User Context System](/lib/context/user-context.tsx)

## Maintenance Notes

### Last Updated
- Documentation: 2025-10-02
- Code Version: Latest (check git log for specific commits)

### Known Issues
1. Mock data needs API integration
2. Real-time updates not implemented
3. Mobile table UX needs improvement
4. Chart performance with large datasets untested

### Change Log
- Initial implementation: Dashboard structure and components
- Added responsive design support
- Implemented chart visualizations
- Created activity table with actions
