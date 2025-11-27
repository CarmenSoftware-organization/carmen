# Dashboard Business Logic & Rules

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

The Dashboard module implements core business rules for data aggregation, user permissions, and system-wide metrics calculation. This document outlines all business logic, validation rules, and workflow processes.

## Data Aggregation Rules

### Metric Calculation Rules

#### 1. Total Orders Calculation
**Rule**: Count all purchase orders created in the current calendar month

**Formula**:
```typescript
totalOrders = COUNT(PurchaseOrder WHERE
  createdAt >= startOfMonth(currentDate) AND
  createdAt <= endOfMonth(currentDate)
)
```

**Trend Calculation**:
```typescript
currentMonthOrders = orders in current month
previousMonthOrders = orders in previous month
changePercentage = ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
trend = changePercentage > 0 ? 'up' : 'down'
```

**Business Constraints**:
- Only count orders with status: Draft, Pending, Approved, Processing, Complete
- Exclude: Cancelled, Rejected orders
- Filter by user's authorized departments if not executive role

#### 2. Active Suppliers Calculation
**Rule**: Count suppliers with active status and recent activity

**Formula**:
```typescript
activeSuppliers = COUNT(Vendor WHERE
  isActive = true AND
  lastActivityDate >= (currentDate - 90 days) AND
  verificationStatus = 'verified'
)
```

**Trend Calculation**:
```typescript
currentActiveSuppliers = active suppliers now
previousActiveSuppliers = active suppliers 30 days ago
changePercentage = ((currentActiveSuppliers - previousActiveSuppliers) / previousActiveSuppliers) * 100
```

**Business Constraints**:
- Only count verified suppliers
- Must have at least one transaction in last 90 days
- Exclude suspended or blacklisted suppliers
- Filter by user's authorized vendor relationships

#### 3. Inventory Value Calculation
**Rule**: Sum total value of all inventory items at current prices

**Formula**:
```typescript
inventoryValue = SUM(
  InventoryItem.quantity * InventoryItem.unitPrice
  WHERE InventoryItem.status = 'active'
)
```

**Trend Calculation**:
```typescript
currentInventoryValue = current total value
previousInventoryValue = value 30 days ago
changePercentage = ((currentInventoryValue - previousInventoryValue) / previousInventoryValue) * 100
```

**Business Constraints**:
- Use current unit price, not historical cost
- Only count items in active locations
- Exclude expired, damaged, or disposed items
- Apply write-off adjustments
- Filter by user's authorized locations

#### 4. Monthly Spend Calculation
**Rule**: Sum all approved procurement expenditures for current month

**Formula**:
```typescript
monthlySpend = SUM(
  PurchaseOrder.totalAmount
  WHERE PurchaseOrder.approvalDate >= startOfMonth(currentDate) AND
        PurchaseOrder.approvalDate <= endOfMonth(currentDate) AND
        PurchaseOrder.status IN ['Approved', 'Processing', 'Complete']
)
```

**Trend Calculation**:
```typescript
currentMonthSpend = spend in current month
previousMonthSpend = spend in previous month
changePercentage = ((currentMonthSpend - previousMonthSpend) / previousMonthSpend) * 100
```

**Business Constraints**:
- Only count approved orders
- Include taxes and shipping costs
- Exclude cancelled or rejected orders
- Apply budget category filters
- Filter by user's authorized budget access

### Status Alert Calculation Rules

#### 1. Critical Stock Items
**Rule**: Identify items below minimum threshold or approaching expiry

**Criteria**:
```typescript
criticalItems = InventoryItem WHERE (
  currentQuantity <= minimumQuantity OR
  (expiryDate - currentDate) <= criticalExpiryDays OR
  stockTurnoverRate < minimumTurnoverRate
)
```

**Threshold Definitions**:
- **Minimum Quantity**: Set per item in product master
- **Critical Expiry Days**: 7 days for perishables, 30 days for non-perishables
- **Minimum Turnover Rate**: Based on item category (calculated monthly)

**Priority Assignment**:
```typescript
priority = {
  currentQuantity = 0 → 'critical',
  currentQuantity <= (minimumQuantity * 0.5) → 'high',
  (expiryDate - currentDate) <= 3 days → 'critical',
  (expiryDate - currentDate) <= 7 days → 'high',
  default → 'medium'
}
```

**Business Constraints**:
- Auto-trigger purchase request when critical threshold reached
- Notify department manager via email/notification
- Consider lead time in reorder calculations
- Filter by user's location access

#### 2. Orders Pending Approval
**Rule**: Count orders awaiting approval at user's authorization level

**Criteria**:
```typescript
pendingOrders = PurchaseRequest WHERE (
  status = 'Pending Approval' AND
  currentApprovalLevel = user.approvalLevel AND
  assignedApprover = user.id
)
```

**Approval Level Logic**:
```typescript
approvalLevel = {
  amount <= 1000 → 'Department Manager',
  amount <= 5000 → 'Finance Manager',
  amount > 5000 → 'Executive Approval'
}
```

**Aging Rules**:
```typescript
urgency = {
  pendingDays > 7 → 'overdue',
  pendingDays > 3 → 'urgent',
  default → 'normal'
}
```

**Business Constraints**:
- Show only orders assigned to current user
- Include delegated approvals when user is backup approver
- Sort by priority and age
- Auto-escalate after 7 days without action

#### 3. Completed Deliveries
**Rule**: Count successfully completed deliveries in current week

**Criteria**:
```typescript
completedDeliveries = GoodsReceivedNote WHERE (
  status = 'Complete' AND
  completionDate >= startOfWeek(currentDate) AND
  completionDate <= endOfWeek(currentDate) AND
  qualityCheckStatus = 'Passed'
)
```

**Week Definition**: Monday to Sunday

**Business Constraints**:
- Only count GRNs with passed quality checks
- Exclude partial deliveries (count when fully received)
- Filter by user's location access
- Include only verified receipts

## Chart Data Aggregation

### Order Trends Chart
**Time Period**: Last 6 months, aggregated by month

**Calculation**:
```typescript
monthlyOrders = GROUP BY month(createdAt)
  COUNT(PurchaseOrder)
  WHERE createdAt >= (currentDate - 6 months)
```

**Business Rules**:
- Include all order statuses except Cancelled
- Group by order creation date, not approval date
- Handle partial months (prorate for current month)
- Fill missing months with zero values

### Spend Analysis Chart
**Time Period**: Last 6 months, aggregated by month

**Calculation**:
```typescript
monthlySpend = GROUP BY month(approvalDate)
  SUM(PurchaseOrder.totalAmount)
  WHERE approvalDate >= (currentDate - 6 months)
```

**Business Rules**:
- Only include approved orders
- Use approval date, not creation date
- Convert all amounts to base currency
- Round to nearest thousand for display

### Supplier Network Growth Chart
**Time Period**: Last 6 months, showing correlation

**Calculations**:
```typescript
monthlySuppliersAndOrders = {
  suppliers: COUNT(DISTINCT Vendor WHERE lastActivityDate in month),
  orders: COUNT(PurchaseOrder WHERE createdAt in month)
} GROUP BY month
```

**Business Rules**:
- Count only active suppliers for each month
- Show relationship between supplier count and order volume
- Include new supplier onboarding metrics
- Calculate supplier utilization rate

## Permission-Based Data Filtering

### Role-Based Visibility Rules

#### Staff Role
**Data Access**:
- Own department metrics only
- Own created/assigned activities
- Limited supplier information
- Department-level inventory

**Calculation Adjustments**:
```typescript
WHERE department = user.department AND
      (createdBy = user.id OR assignedTo = user.id)
```

#### Department Manager Role
**Data Access**:
- Department-wide metrics
- All team member activities
- Department budget and spend
- Department inventory across locations

**Calculation Adjustments**:
```typescript
WHERE department = user.department
```

#### Financial Manager Role
**Data Access**:
- All financial metrics
- Cross-department spend analysis
- Budget utilization
- Payment and invoice status

**Calculation Adjustments**:
```typescript
// No department filter for financial data
WHERE (financial access scope applies)
```

#### Purchasing Staff Role
**Data Access**:
- Procurement metrics
- Vendor performance data
- Order status across departments
- Inventory levels for purchasing decisions

**Calculation Adjustments**:
```typescript
WHERE (procurement_related = true)
```

#### Executive Role
**Data Access**:
- All system metrics
- Cross-department analytics
- Strategic KPIs
- Enterprise-wide visibility

**Calculation Adjustments**:
```typescript
// No filters - full system access
```

## Activity Feed Business Rules

### Activity Types and Sources

#### 1. Purchase Request Activities
**Tracked Events**:
- Creation, Submission, Approval, Rejection, Modification

**Priority Assignment**:
```typescript
priority = {
  status = 'Rejected' → 'high',
  urgency = 'urgent' → 'high',
  amount > departmentThreshold → 'medium',
  default → 'low'
}
```

#### 2. Purchase Order Activities
**Tracked Events**:
- Creation, Approval, Processing, Completion, Cancellation

**Priority Assignment**:
```typescript
priority = {
  status = 'Processing' AND deliveryDate - currentDate <= 2 → 'high',
  amount > 5000 → 'medium',
  default → 'low'
}
```

#### 3. Goods Receipt Activities
**Tracked Events**:
- Receipt, Quality Check, Approval, Rejection

**Priority Assignment**:
```typescript
priority = {
  qualityCheckStatus = 'Failed' → 'critical',
  hasDiscrepancy = true → 'high',
  default → 'low'
}
```

#### 4. Stock Adjustment Activities
**Tracked Events**:
- Adjustment Creation, Approval, Completion

**Priority Assignment**:
```typescript
priority = {
  adjustmentType = 'Write-off' → 'high',
  adjustmentAmount > significantThreshold → 'medium',
  default → 'low'
}
```

#### 5. Vendor Invoice Activities
**Tracked Events**:
- Receipt, Verification, Approval, Payment

**Priority Assignment**:
```typescript
priority = {
  paymentDueDate - currentDate <= 3 → 'high',
  hasDiscrepancy = true → 'high',
  amount > 10000 → 'medium',
  default → 'low'
}
```

#### 6. Quality Check Activities
**Tracked Events**:
- Check Performed, Pass/Fail Status, Follow-up Actions

**Priority Assignment**:
```typescript
priority = {
  status = 'Failed' → 'critical',
  requiresImmediate Action = true → 'high',
  default → 'medium'
}
```

### Activity Feed Filtering Rules

**Default Display**: Last 10 activities

**Filtering Criteria**:
```typescript
recentActivities = Activities WHERE (
  createdAt >= (currentDate - 7 days) AND
  (
    user.role = 'Executive' OR
    department = user.department OR
    createdBy = user.id OR
    assignedTo = user.id
  )
) ORDER BY createdAt DESC LIMIT 10
```

**Pagination**: Load 10 more on scroll/click

**Real-time Updates**: WebSocket connection for live activity stream (future)

## Validation Rules

### Metric Display Validation

#### Number Formatting
```typescript
formatNumber(value) {
  if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value/1000).toFixed(1)}K`
  return value.toString()
}
```

#### Currency Formatting
```typescript
formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
```

#### Percentage Formatting
```typescript
formatPercentage(value) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
```

#### Date Formatting
```typescript
formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
```

## Error Handling Rules

### Data Fetch Failures
```typescript
onMetricsFetchError() {
  // Show last cached values with warning indicator
  // Display "Data may be outdated" message
  // Retry fetch after exponential backoff
  // Log error to monitoring service
}
```

### Calculation Errors
```typescript
onCalculationError() {
  // Show "N/A" or "--" for failed metric
  // Log detailed error for debugging
  // Continue rendering other metrics
  // Alert user if critical metric fails
}
```

### Permission Errors
```typescript
onPermissionError() {
  // Hide unauthorized metrics
  // Show appropriate "No access" message
  // Log security event
  // Redirect if completely unauthorized
}
```

## Performance Rules

### Caching Strategy
```typescript
cacheRules = {
  metrics: 5 minutes,
  chartData: 15 minutes,
  activities: 1 minute,
  userPermissions: 30 minutes
}
```

### Data Refresh Rules
```typescript
refreshRules = {
  autoRefresh: every 60 seconds (if tab active),
  manualRefresh: button click,
  onActivity: when user creates/modifies data,
  onFocus: when tab regains focus
}
```

### Query Optimization
```typescript
optimizationRules = {
  useIndexes: true,
  aggregateOnServer: true,
  limitResultSet: true,
  useMaterializedViews: for complex calculations
}
```

## Integration Rules

### External System Integration

#### ERP System
- Sync order and spend data hourly
- Reconcile inventory values daily
- Update supplier status real-time

#### Accounting System
- Sync financial metrics daily
- Validate invoice amounts on receipt
- Update budget tracking real-time

#### Notification System
- Send alerts for critical thresholds
- Email digest for pending approvals
- Push notifications for urgent items

## Audit Trail Rules

### Activity Logging
All dashboard interactions logged:
```typescript
auditLog = {
  userId: user.id,
  action: 'view_dashboard' | 'click_metric' | 'view_activity',
  timestamp: currentTimestamp,
  ipAddress: request.ip,
  metadata: {
    role: user.role,
    department: user.department,
    metricsViewed: [...],
    filtersApplied: {...}
  }
}
```

### Compliance Requirements
- Log all data access for SOX compliance
- Track permission changes
- Monitor unusual access patterns
- Retain logs for 7 years

## Future Business Rules

### Planned Enhancements
1. **AI-Powered Insights**: Anomaly detection in metrics
2. **Predictive Analytics**: Forecast future trends
3. **Custom Dashboards**: User-configurable widgets
4. **Multi-currency Support**: Real-time conversion
5. **Advanced Filtering**: Complex query builder
6. **Scheduled Reports**: Automated email digests
7. **Benchmark Comparisons**: Industry standard comparisons
8. **Goal Tracking**: KPI targets and progress
