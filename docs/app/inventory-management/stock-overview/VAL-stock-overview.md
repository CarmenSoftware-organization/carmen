# Validation Rules: Stock Overview

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Stock Overview
- **Version**: 1.0.0
- **Last Updated**: 2025-01-10
- **Status**: Active

## Document Purpose

This document defines comprehensive validation rules for the Stock Overview module across all system layers: client-side (UI), server-side (application), and database constraints. Validations ensure data integrity, prevent errors, and maintain business rule compliance for inventory analytics and reporting.

**Related Documents**:
- [Business Requirements](./BR-stock-overview.md)
- [Use Cases](./UC-stock-overview.md)
- [Technical Specification](./TS-stock-overview.md)
- [Data Schema](./DS-stock-overview.md)
- [Flow Diagrams](./FD-stock-overview.md)

---

## Validation Categories

### Field-Level Validations (VAL-INV-OVW-001 to 099)
Basic field format, type, and range validations for user inputs and data display

### Business Rule Validations (VAL-INV-OVW-101 to 199)
Complex business logic validations for performance metrics, alerts, and suggestions

### Cross-Field Validations (VAL-INV-OVW-201 to 299)
Validations involving multiple fields, entities, or data aggregations

### Security Validations (VAL-INV-OVW-301 to 399)
Permission and authorization validations for location-based access control

---

## Field-Level Validations

### VAL-INV-OVW-001: Location Selection Validity
**Rule**: Selected location must exist and be accessible to the user based on permissions.

**Layer**: Client + Server
**Error Message**: "Selected location is not accessible. Please choose from available locations."
**Implementation**:
```typescript
// Zod schema
const locationSelectionSchema = z.object({
  locationId: z.union([
    z.literal('all'),
    z.string().uuid("Invalid location ID")
  ])
});

// Validation function
async function validateLocationAccess(
  userId: string,
  locationId: string
): Promise<void> {
  if (locationId === 'all') {
    return; // All locations is always valid
  }

  const user = await getUserContext(userId);

  // System Administrator has access to all locations
  if (user.role === 'System Administrator') {
    return;
  }

  // Check if location is in user's accessible locations
  const hasAccess = user.availableLocations.some(
    loc => loc.id === locationId
  );

  if (!hasAccess) {
    throw new ValidationError(
      "Selected location is not accessible. Please choose from available locations."
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: locationId="all", locationId=user.availableLocations[0].id
- ✅ Valid (Admin): locationId=any-location-uuid
- ❌ Invalid: locationId=location-not-in-user-permissions
- ❌ Invalid: locationId="invalid-uuid-format"

---

### VAL-INV-OVW-002: Dashboard Widget Order Validation
**Rule**: Widget order must be an array of valid widget IDs with no duplicates.

**Layer**: Client
**Error Message**: "Invalid widget configuration. Please reset dashboard layout."
**Implementation**:
```typescript
const VALID_WIDGETS = [
  'inventory-levels',
  'value-trend',
  'turnover',
  'low-stock-alert',
  'expiring-alert',
  'quick-actions'
] as const;

const widgetOrderSchema = z.array(
  z.enum(VALID_WIDGETS)
)
.min(1, "At least one widget must be displayed")
.max(6, "Maximum 6 widgets allowed")
.refine(
  widgets => new Set(widgets).size === widgets.length,
  "Duplicate widgets are not allowed"
);

// Validation function
function validateWidgetOrder(widgetOrder: string[]): void {
  const result = widgetOrderSchema.safeParse(widgetOrder);

  if (!result.success) {
    // Reset to default order
    const defaultOrder = [...VALID_WIDGETS];
    localStorage.setItem('dashboard-layout', JSON.stringify(defaultOrder));

    throw new ValidationError(
      "Invalid widget configuration. Dashboard reset to default layout."
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: ['inventory-levels', 'value-trend', 'turnover', ...]
- ✅ Valid: ['turnover', 'low-stock-alert', 'inventory-levels', ...] (different order)
- ❌ Invalid: ['invalid-widget', 'inventory-levels', ...]
- ❌ Invalid: ['inventory-levels', 'inventory-levels', ...] (duplicates)
- ❌ Invalid: [] (empty array)

---

### VAL-INV-OVW-003: Date Range Validity
**Rule**: Date ranges for filters must have end date >= start date, and both must not be future dates.

**Layer**: Client + Server
**Error Message**: "Invalid date range. End date must be after or equal to start date, and dates cannot be in the future."
**Implementation**:
```typescript
const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
})
.refine(
  data => data.endDate >= data.startDate,
  "End date must be after or equal to start date"
)
.refine(
  data => data.endDate <= new Date(),
  "Dates cannot be in the future"
);

// Usage example
const isValidDateRange = (start: Date, end: Date): boolean => {
  try {
    dateRangeSchema.parse({ startDate: start, endDate: end });
    return true;
  } catch {
    return false;
  }
};
```

**Test Scenarios**:
- ✅ Valid: start=2025-01-01, end=2025-01-10 (today)
- ✅ Valid: start=2025-01-01, end=2025-01-01 (same day)
- ❌ Invalid: start=2025-01-10, end=2025-01-01 (end before start)
- ❌ Invalid: start=2025-01-10, end=2025-01-15 (future date)

---

### VAL-INV-OVW-004: Tab Selection Validation
**Rule**: Selected tab must be one of the valid tab options.

**Layer**: Client
**Error Message**: "Invalid tab selection."
**Implementation**:
```typescript
const VALID_TABS = ['overview', 'performance', 'transfers'] as const;

const tabSelectionSchema = z.enum(VALID_TABS);

function validateTabSelection(tab: string): void {
  const result = tabSelectionSchema.safeParse(tab);

  if (!result.success) {
    throw new ValidationError(
      `Invalid tab selection. Must be one of: ${VALID_TABS.join(', ')}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: 'overview', 'performance', 'transfers'
- ❌ Invalid: 'invalid-tab', 'settings', ''

---

### VAL-INV-OVW-005: Chart Data Value Ranges
**Rule**: Chart data values must be non-negative numbers within reasonable ranges.

**Layer**: Client + Server
**Error Message**: "Invalid chart data values detected."
**Implementation**:
```typescript
const chartDataSchema = z.object({
  category: z.string().min(1),
  value: z.number()
    .nonnegative("Values must be non-negative")
    .finite("Values must be finite numbers")
    .max(Number.MAX_SAFE_INTEGER, "Value exceeds maximum")
});

const chartDataArraySchema = z.array(chartDataSchema)
  .min(1, "Chart must have at least one data point");

// Validation for aggregated metrics
const metricSchema = z.object({
  totalItems: z.number().int().nonnegative(),
  totalValue: z.number().nonnegative().finite(),
  lowStockCount: z.number().int().nonnegative(),
  expiringCount: z.number().int().nonnegative()
});
```

**Test Scenarios**:
- ✅ Valid: {category: 'Food', value: 1250.50}
- ✅ Valid: {category: 'Beverages', value: 0}
- ❌ Invalid: {category: 'Food', value: -100} (negative)
- ❌ Invalid: {category: '', value: 100} (empty category)
- ❌ Invalid: {category: 'Food', value: NaN} (not a number)
- ❌ Invalid: {category: 'Food', value: Infinity}

---

## Business Rule Validations

### VAL-INV-OVW-101: Performance Classification Threshold Validation
**Rule**: Performance metrics must meet classification thresholds as defined in BR-INV-OVW-003.

**Layer**: Server
**Error Message**: "Invalid performance metrics detected. Values outside expected ranges."
**Implementation**:
```typescript
const performanceMetricsSchema = z.object({
  stockEfficiency: z.number()
    .min(0, "Stock efficiency cannot be negative")
    .max(100, "Stock efficiency cannot exceed 100%"),
  turnoverRate: z.number()
    .nonnegative("Turnover rate cannot be negative")
    .max(999, "Turnover rate exceeds reasonable maximum"),
  fillRate: z.number()
    .min(0, "Fill rate cannot be negative")
    .max(100, "Fill rate cannot exceed 100%")
});

function classifyPerformance(metrics: PerformanceMetrics): PerformanceLevel {
  // Validate metrics first
  performanceMetricsSchema.parse(metrics);

  // Apply classification algorithm (BR-INV-OVW-003)
  if (
    metrics.stockEfficiency >= 90 &&
    metrics.turnoverRate >= 8 &&
    metrics.fillRate >= 95
  ) {
    return 'excellent';
  } else if (
    metrics.stockEfficiency >= 80 &&
    metrics.turnoverRate >= 6 &&
    metrics.fillRate >= 90
  ) {
    return 'good';
  } else if (
    metrics.stockEfficiency >= 70 &&
    metrics.turnoverRate >= 4 &&
    metrics.fillRate >= 85
  ) {
    return 'average';
  } else {
    return 'poor';
  }
}
```

**Test Scenarios**:
- ✅ Valid: stockEff=92, turnover=8.5, fill=96 → 'excellent'
- ✅ Valid: stockEff=85, turnover=7, fill=92 → 'good'
- ✅ Valid: stockEff=75, turnover=5, fill=87 → 'average'
- ✅ Valid: stockEff=65, turnover=3, fill=80 → 'poor'
- ❌ Invalid: stockEff=105 (exceeds 100%)
- ❌ Invalid: stockEff=-10 (negative)
- ❌ Invalid: turnover=NaN

---

### VAL-INV-OVW-102: Transfer Suggestion Validity
**Rule**: Transfer suggestions must have different source and destination locations, positive quantity, and valid priority.

**Layer**: Server
**Error Message**: "Invalid transfer suggestion parameters."
**Implementation**:
```typescript
const transferSuggestionSchema = z.object({
  itemId: z.string().uuid(),
  fromLocationId: z.string().uuid(),
  toLocationId: z.string().uuid(),
  suggestedQuantity: z.number()
    .positive("Suggested quantity must be positive")
    .finite(),
  reason: z.enum([
    'excess_stock',
    'approaching_stockout',
    'expiry_risk',
    'demand_variance'
  ]),
  priority: z.enum(['high', 'medium', 'low']),
  potentialSavings: z.number().nonnegative()
})
.refine(
  data => data.fromLocationId !== data.toLocationId,
  "Source and destination locations must be different"
)
.refine(
  data => {
    // Validate priority matches reason
    if (data.reason === 'expiry_risk' || data.reason === 'approaching_stockout') {
      return data.priority === 'high' || data.priority === 'medium';
    }
    return true;
  },
  "Priority must match reason severity"
);

// Business rule validation (BR-INV-OVW-004)
function validateTransferPriority(
  suggestion: TransferSuggestion,
  stockData: StockBalance[]
): void {
  const fromStock = stockData.find(s =>
    s.locationId === suggestion.fromLocationId &&
    s.itemId === suggestion.itemId
  );

  const toStock = stockData.find(s =>
    s.locationId === suggestion.toLocationId &&
    s.itemId === suggestion.itemId
  );

  if (!fromStock || !toStock) {
    throw new ValidationError("Stock data not found for locations");
  }

  const item = getItem(suggestion.itemId);
  const reorderPoint = item.reorderPoint || 0;

  // Validate HIGH priority conditions
  if (suggestion.priority === 'high') {
    const isStockoutRisk = toStock.quantityOnHand < (reorderPoint * 0.1);
    const isExpiryRisk = fromStock.expiryDate &&
      (fromStock.expiryDate.getTime() - Date.now()) < (3 * 24 * 60 * 60 * 1000);

    if (!isStockoutRisk && !isExpiryRisk) {
      throw new ValidationError(
        "High priority requires stockout risk or expiry within 3 days"
      );
    }
  }
}
```

**Test Scenarios**:
- ✅ Valid: from≠to, qty=50, reason='excess_stock', priority='low'
- ✅ Valid: from≠to, qty=100, reason='approaching_stockout', priority='high'
- ❌ Invalid: from=to (same location)
- ❌ Invalid: qty=0 or qty<0 (non-positive quantity)
- ❌ Invalid: priority='high' with reason='demand_variance' (mismatch)

---

### VAL-INV-OVW-103: Alert Threshold Validation
**Rule**: Alert thresholds must comply with BR-INV-OVW-002 business rules.

**Layer**: Server
**Error Message**: "Invalid alert configuration."
**Implementation**:
```typescript
const alertConfigSchema = z.object({
  alertType: z.enum([
    'LOW_STOCK',
    'OUT_OF_STOCK',
    'OVERSTOCK',
    'EXPIRY_WARNING',
    'EXPIRED',
    'SLOW_MOVING',
    'FAST_MOVING',
    'REORDER_POINT'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  currentQuantity: z.number().nonnegative(),
  thresholdQuantity: z.number().nonnegative().optional(),
  daysUntilExpiry: z.number().int().nonnegative().optional()
});

// Business rule: Low stock = quantity ≤ reorder point
function validateLowStockAlert(
  currentQty: number,
  reorderPoint: number,
  severity: AlertSeverity
): void {
  if (currentQty > reorderPoint) {
    throw new ValidationError(
      "Low stock alert requires quantity ≤ reorder point"
    );
  }

  // Critical severity requires out of stock
  if (severity === 'critical' && currentQty > 0) {
    throw new ValidationError(
      "Critical severity requires quantity = 0"
    );
  }

  // High severity requires quantity ≤ reorder point
  if (severity === 'high' && currentQty > reorderPoint) {
    throw new ValidationError(
      "High severity requires quantity ≤ reorder point"
    );
  }
}

// Business rule: Expiring soon = expiry date ≤ today + 7 days
function validateExpiryAlert(
  expiryDate: Date,
  severity: AlertSeverity
): void {
  const today = new Date();
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (daysUntilExpiry > 7) {
    throw new ValidationError(
      "Expiry warning requires expiry within 7 days"
    );
  }

  // High severity requires expiry within 3 days
  if (severity === 'high' && daysUntilExpiry > 3) {
    throw new ValidationError(
      "High severity expiry alert requires expiry within 3 days"
    );
  }

  // Critical severity requires already expired
  if (severity === 'critical' && daysUntilExpiry > 0) {
    throw new ValidationError(
      "Critical severity requires already expired"
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: LOW_STOCK, qty=50, reorder=100, severity='high'
- ✅ Valid: OUT_OF_STOCK, qty=0, severity='critical'
- ✅ Valid: EXPIRY_WARNING, days=5, severity='medium'
- ❌ Invalid: LOW_STOCK, qty=150, reorder=100 (qty > reorder)
- ❌ Invalid: EXPIRY_WARNING, days=10 (> 7 days)
- ❌ Invalid: severity='critical', qty=50 (critical requires qty=0)

---

### VAL-INV-OVW-104: Data Aggregation Consistency
**Rule**: Aggregated metrics must follow aggregation rules defined in BR-INV-OVW-006.

**Layer**: Server
**Error Message**: "Data aggregation validation failed."
**Implementation**:
```typescript
function validateAggregatedMetrics(
  rawData: LocationInventory[],
  aggregated: AggregatedMetrics
): void {
  // Validate total items = sum of individual counts
  const calculatedItems = rawData.reduce(
    (sum, loc) => sum + loc.itemCount, 0
  );

  if (Math.abs(aggregated.totalItems - calculatedItems) > 0) {
    throw new ValidationError(
      `Total items mismatch. Expected: ${calculatedItems}, Got: ${aggregated.totalItems}`
    );
  }

  // Validate total value = sum of (quantity × unit cost)
  const calculatedValue = rawData.reduce((sum, loc) => {
    return sum + loc.items.reduce((itemSum, item) => {
      return itemSum + (item.quantity * item.unitCost);
    }, 0);
  }, 0);

  // Allow small rounding difference (< $0.10)
  if (Math.abs(aggregated.totalValue - calculatedValue) > 0.10) {
    throw new ValidationError(
      `Total value mismatch. Expected: ${calculatedValue}, Got: ${aggregated.totalValue}`
    );
  }

  // Validate alert counts
  const calculatedLowStock = rawData.reduce((count, loc) => {
    return count + loc.items.filter(item =>
      item.quantity <= (item.reorderPoint || 0)
    ).length;
  }, 0);

  if (aggregated.lowStockCount !== calculatedLowStock) {
    throw new ValidationError(
      `Low stock count mismatch. Expected: ${calculatedLowStock}, Got: ${aggregated.lowStockCount}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: Aggregated metrics match sum of individual location data
- ❌ Invalid: totalItems=500 when sum=600 (mismatch)
- ❌ Invalid: totalValue=10000 when sum=12000 (mismatch > $0.10)
- ❌ Invalid: lowStockCount=10 when actual count=15

---

## Cross-Field Validations

### VAL-INV-OVW-201: Multi-Location Filter Consistency
**Rule**: When "All Locations" is selected, all location-specific filters must be cleared.

**Layer**: Client
**Error Message**: "Location-specific filters are not applicable when 'All Locations' is selected."
**Implementation**:
```typescript
const filterStateSchema = z.object({
  selectedLocation: z.union([
    z.literal('all'),
    z.string().uuid()
  ]),
  filters: z.object({
    categoryId: z.string().uuid().optional(),
    dateRange: z.object({
      start: z.date(),
      end: z.date()
    }).optional(),
    // Location-specific filters
    specificLocationFilters: z.object({
      departmentId: z.string().uuid().optional(),
      zoneId: z.string().uuid().optional()
    }).optional()
  })
})
.refine(
  data => {
    // If "All Locations" selected, location-specific filters must be empty
    if (data.selectedLocation === 'all') {
      return !data.filters.specificLocationFilters ||
        Object.keys(data.filters.specificLocationFilters).length === 0;
    }
    return true;
  },
  "Location-specific filters are not applicable when 'All Locations' is selected"
);
```

**Test Scenarios**:
- ✅ Valid: location='all', specificFilters=null
- ✅ Valid: location='loc-uuid', specificFilters={departmentId: 'dept-uuid'}
- ❌ Invalid: location='all', specificFilters={departmentId: 'dept-uuid'}

---

### VAL-INV-OVW-202: Chart Data and Metrics Synchronization
**Rule**: Chart data must be consistent with summary metrics displayed.

**Layer**: Client + Server
**Error Message**: "Chart data and summary metrics are out of sync."
**Implementation**:
```typescript
function validateChartMetricsSync(
  chartData: ChartData[],
  summaryMetrics: SummaryMetrics
): void {
  // Sum chart data values
  const chartTotal = chartData.reduce(
    (sum, data) => sum + data.value, 0
  );

  // Compare with summary metric
  const difference = Math.abs(chartTotal - summaryMetrics.totalValue);

  // Allow 1% tolerance for rounding
  const tolerance = summaryMetrics.totalValue * 0.01;

  if (difference > tolerance) {
    throw new ValidationError(
      `Chart data (${chartTotal}) does not match summary metrics (${summaryMetrics.totalValue})`
    );
  }
}

// Validate category count consistency
function validateCategoryCount(
  chartData: ChartData[],
  expectedCategories: number
): void {
  const uniqueCategories = new Set(
    chartData.map(d => d.category)
  ).size;

  if (uniqueCategories !== expectedCategories) {
    throw new ValidationError(
      `Expected ${expectedCategories} categories, found ${uniqueCategories}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: chartTotal=10000, metricTotal=10005 (within 1%)
- ✅ Valid: 5 chart categories match 5 expected categories
- ❌ Invalid: chartTotal=10000, metricTotal=12000 (> 1% diff)
- ❌ Invalid: 5 chart categories but 6 expected

---

### VAL-INV-OVW-203: Performance Metrics Mutual Consistency
**Rule**: Performance metrics must be internally consistent (e.g., stock efficiency relates to capacity).

**Layer**: Server
**Error Message**: "Performance metrics are internally inconsistent."
**Implementation**:
```typescript
function validatePerformanceConsistency(
  metrics: PerformanceMetrics,
  inventory: InventoryData
): void {
  // Stock efficiency = (available / capacity) × 100
  const calculatedEfficiency = (
    inventory.totalAvailable / inventory.totalCapacity
  ) * 100;

  if (Math.abs(metrics.stockEfficiency - calculatedEfficiency) > 1) {
    throw new ValidationError(
      `Stock efficiency inconsistent. Expected: ${calculatedEfficiency}%, Got: ${metrics.stockEfficiency}%`
    );
  }

  // Turnover rate = COGS / Avg Inventory
  const calculatedTurnover =
    inventory.costOfGoodsSold / inventory.averageInventoryValue;

  if (Math.abs(metrics.turnoverRate - calculatedTurnover) > 0.1) {
    throw new ValidationError(
      `Turnover rate inconsistent. Expected: ${calculatedTurnover}, Got: ${metrics.turnoverRate}`
    );
  }

  // Fill rate = (fulfilled / total) × 100
  const calculatedFillRate = (
    inventory.ordersFulfilled / inventory.totalOrders
  ) * 100;

  if (Math.abs(metrics.fillRate - calculatedFillRate) > 1) {
    throw new ValidationError(
      `Fill rate inconsistent. Expected: ${calculatedFillRate}%, Got: ${metrics.fillRate}%`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: All metrics match calculated values within tolerance
- ❌ Invalid: stockEff=90% but calculated=75% (> 1% diff)
- ❌ Invalid: turnover=8.5 but calculated=6.2 (> 0.1 diff)

---

## Security Validations

### VAL-INV-OVW-301: Location-Based Access Control
**Rule**: Users can only access data for locations in their availableLocations array, unless System Administrator.

**Layer**: Server
**Error Message**: "Access denied. You do not have permission to view data for this location."
**Implementation**:
```typescript
async function validateLocationAccess(
  userId: string,
  requestedLocationIds: string[]
): Promise<void> {
  const user = await getUserContext(userId);

  // System Administrator bypass
  if (user.role === 'System Administrator') {
    return;
  }

  // Extract user's accessible location IDs
  const accessibleLocationIds = user.availableLocations.map(l => l.id);

  // Check if all requested locations are accessible
  const hasAccessToAll = requestedLocationIds.every(
    locId => locId === 'all' || accessibleLocationIds.includes(locId)
  );

  if (!hasAccessToAll) {
    const unauthorized = requestedLocationIds.filter(
      locId => locId !== 'all' && !accessibleLocationIds.includes(locId)
    );

    throw new SecurityError(
      `Access denied. You do not have permission to view data for locations: ${unauthorized.join(', ')}`
    );
  }
}

// Row-Level Security (RLS) policy for database
/*
CREATE POLICY inventory_overview_location_access ON tb_stock_balance
  FOR SELECT
  USING (
    -- System Administrators can see all
    auth.jwt() ->> 'role' = 'System Administrator'
    OR
    -- Others can only see their assigned locations
    location_id IN (
      SELECT unnest(
        (auth.jwt() ->> 'available_locations')::uuid[]
      )
    )
  );
*/
```

**Test Scenarios**:
- ✅ Valid (Admin): Request any location
- ✅ Valid: Request location in user.availableLocations
- ✅ Valid: Request 'all' (aggregated view)
- ❌ Invalid: Request location not in user.availableLocations
- ❌ Invalid: Non-admin requests all-locations data directly

---

### VAL-INV-OVW-302: Permission-Based Feature Access
**Rule**: Users must have specific permissions to access certain features.

**Layer**: Client + Server
**Error Message**: "You do not have permission to perform this action."
**Implementation**:
```typescript
const FEATURE_PERMISSIONS: Record<string, string> = {
  'view_inventory': 'view dashboard and stock overview',
  'manage_stock': 'create transfers and manage alerts',
  'admin_settings': 'modify dashboard settings (System Admin only)'
};

function validateFeatureAccess(
  user: UserContext,
  feature: keyof typeof FEATURE_PERMISSIONS
): void {
  // Check if user has required permission
  if (!user.permissions.includes(feature)) {
    throw new SecurityError(
      `You do not have permission to ${FEATURE_PERMISSIONS[feature]}`
    );
  }
}

// Specific validations
async function validateTransferCreation(userId: string): Promise<void> {
  const user = await getUserContext(userId);

  validateFeatureAccess(user, 'manage_stock');

  // Additional check: User must have access to both source and destination locations
  // This is validated separately in transfer creation workflow
}

async function validateDashboardCustomization(userId: string): Promise<void> {
  // All users can customize their own dashboard
  // No special permission required
  return;
}

async function validateAlertAcknowledgement(
  userId: string,
  alertLocationId: string
): Promise<void> {
  const user = await getUserContext(userId);

  // Must have manage_stock permission
  validateFeatureAccess(user, 'manage_stock');

  // Must have access to alert's location
  await validateLocationAccess(userId, [alertLocationId]);
}
```

**Permission Matrix**:

| Action | Required Permission | Role Requirements |
|--------|-------------------|-------------------|
| View Dashboard | view_inventory | All roles |
| Customize Dashboard | (none) | All roles |
| View Stock Overview | view_inventory | All roles |
| Create Transfer | manage_stock | Manager+ |
| Acknowledge Alert | manage_stock | Manager+ |
| Modify Settings | admin_settings | System Admin only |

**Test Scenarios**:
- ✅ Valid: User with 'view_inventory' views dashboard
- ✅ Valid: User with 'manage_stock' creates transfer
- ✅ Valid: System Admin modifies settings
- ❌ Invalid: User without 'manage_stock' creates transfer
- ❌ Invalid: Non-admin modifies system settings

---

### VAL-INV-OVW-303: Data Export Permission Validation
**Rule**: Users can only export data for locations they have access to.

**Layer**: Server
**Error Message**: "Cannot export data for locations you don't have access to."
**Implementation**:
```typescript
async function validateDataExport(
  userId: string,
  exportRequest: ExportRequest
): Promise<void> {
  // Validate location access
  await validateLocationAccess(userId, exportRequest.locationIds);

  // Check export permission
  const user = await getUserContext(userId);
  validateFeatureAccess(user, 'view_inventory');

  // Validate export size limits
  if (exportRequest.recordCount > 100000) {
    throw new ValidationError(
      "Export size exceeds maximum limit of 100,000 records. Please apply filters."
    );
  }

  // Validate sensitive data masking
  if (exportRequest.includeCosts && !user.permissions.includes('view_costs')) {
    throw new SecurityError(
      "You do not have permission to export cost data. Costs will be masked."
    );
  }
}

// Rate limiting for exports
const exportRateLimiter = new RateLimiter({
  maxRequests: 10,  // Max 10 exports
  windowMs: 3600000 // Per hour
});

async function validateExportRateLimit(userId: string): Promise<void> {
  const allowed = await exportRateLimiter.checkLimit(userId);

  if (!allowed) {
    throw new ValidationError(
      "Export rate limit exceeded. Please try again in an hour."
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: Export for accessible locations only
- ✅ Valid: Export within record limit
- ✅ Valid: User with view_costs exports cost data
- ❌ Invalid: Export includes unauthorized locations
- ❌ Invalid: Export > 100,000 records without filters
- ❌ Invalid: User without view_costs exports cost data
- ❌ Invalid: 11th export within 1 hour (rate limit)

---

## Data Integrity Validations

### VAL-INV-OVW-401: Stock Balance Non-Negativity
**Rule**: Stock quantities and values must never be negative.

**Layer**: Database
**Error Message**: "Stock balance cannot be negative."
**Implementation**:
```sql
-- Database check constraints
ALTER TABLE tb_stock_balance
  ADD CONSTRAINT chk_quantity_nonnegative
  CHECK (
    quantity_on_hand >= 0 AND
    quantity_reserved >= 0 AND
    quantity_available >= 0
  );

ALTER TABLE tb_stock_balance
  ADD CONSTRAINT chk_value_nonnegative
  CHECK (
    average_cost >= 0 AND
    total_value >= 0
  );

-- Available = On Hand - Reserved
ALTER TABLE tb_stock_balance
  ADD CONSTRAINT chk_available_calculation
  CHECK (quantity_available = quantity_on_hand - quantity_reserved);
```

**Test Scenarios**:
- ✅ Valid: qty_on_hand=100, reserved=30, available=70
- ❌ Invalid: qty_on_hand=-10
- ❌ Invalid: available=100 but on_hand=80, reserved=30 (incorrect calculation)

---

### VAL-INV-OVW-402: Alert Deduplication
**Rule**: Only one active alert per alert type, item, and location combination.

**Layer**: Server
**Error Message**: "Duplicate alert detected."
**Implementation**:
```typescript
async function validateUniqueAlert(
  alertType: AlertType,
  itemId: string,
  locationId: string
): Promise<void> {
  const existingAlert = await database.query(`
    SELECT id FROM tb_inventory_alert
    WHERE alert_type = $1
      AND item_id = $2
      AND location_id = $3
      AND is_active = true
    LIMIT 1
  `, [alertType, itemId, locationId]);

  if (existingAlert.rows.length > 0) {
    throw new ValidationError(
      `Active ${alertType} alert already exists for this item at this location`
    );
  }
}

// Database unique index
/*
CREATE UNIQUE INDEX idx_alert_unique_active
  ON tb_inventory_alert(alert_type, item_id, location_id)
  WHERE is_active = true;
*/
```

**Test Scenarios**:
- ✅ Valid: First LOW_STOCK alert for item X at location Y
- ✅ Valid: LOW_STOCK alert after previous one was resolved
- ❌ Invalid: Second LOW_STOCK alert for same item/location while first is active

---

### VAL-INV-OVW-403: Transfer Suggestion Expiration
**Rule**: Expired transfer suggestions must be automatically deactivated.

**Layer**: Server (Background Job)
**Error Message**: "Transfer suggestion has expired."
**Implementation**:
```typescript
// Validation when attempting to create transfer from suggestion
async function validateSuggestionActive(
  suggestionId: string
): Promise<void> {
  const suggestion = await database.query(`
    SELECT id, is_active, expires_at
    FROM tb_transfer_suggestion
    WHERE id = $1
  `, [suggestionId]);

  if (suggestion.rows.length === 0) {
    throw new ValidationError("Transfer suggestion not found");
  }

  const row = suggestion.rows[0];

  if (!row.is_active) {
    throw new ValidationError(
      "Transfer suggestion is no longer active"
    );
  }

  if (new Date(row.expires_at) < new Date()) {
    throw new ValidationError(
      "Transfer suggestion has expired. Please refresh suggestions."
    );
  }
}

// Background job to deactivate expired suggestions
async function deactivateExpiredSuggestions(): Promise<void> {
  await database.query(`
    UPDATE tb_transfer_suggestion
    SET is_active = false
    WHERE expires_at <= NOW()
      AND is_active = true
  `);
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', deactivateExpiredSuggestions);
```

**Test Scenarios**:
- ✅ Valid: Suggestion created < 7 days ago, is_active=true
- ❌ Invalid: Suggestion expires_at < now()
- ❌ Invalid: Suggestion is_active=false

---

## Performance Validations

### VAL-INV-OVW-501: Chart Data Size Limits
**Rule**: Chart data must not exceed reasonable size limits to prevent performance issues.

**Layer**: Client + Server
**Error Message**: "Chart data exceeds maximum size. Please apply filters."
**Implementation**:
```typescript
const CHART_DATA_LIMITS = {
  barChart: 50,     // Max 50 categories
  lineChart: 365,   // Max 365 data points (1 year daily)
  pieChart: 20,     // Max 20 slices
  table: 1000       // Max 1000 rows per page
};

function validateChartDataSize(
  chartType: keyof typeof CHART_DATA_LIMITS,
  dataSize: number
): void {
  const limit = CHART_DATA_LIMITS[chartType];

  if (dataSize > limit) {
    throw new ValidationError(
      `${chartType} data size (${dataSize}) exceeds maximum (${limit}). Please apply filters.`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: barChart with 20 categories
- ✅ Valid: lineChart with 180 data points (6 months)
- ❌ Invalid: pieChart with 50 slices (> 20 limit)
- ❌ Invalid: table with 5000 rows without pagination

---

### VAL-INV-OVW-502: Auto-Refresh Rate Limiting
**Rule**: Auto-refresh interval must not be less than 1 minute to prevent server overload.

**Layer**: Client
**Error Message**: "Auto-refresh interval must be at least 1 minute."
**Implementation**:
```typescript
const MIN_REFRESH_INTERVAL = 60 * 1000; // 1 minute in ms
const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function validateRefreshInterval(intervalMs: number): void {
  if (intervalMs < MIN_REFRESH_INTERVAL) {
    throw new ValidationError(
      `Auto-refresh interval must be at least ${MIN_REFRESH_INTERVAL / 1000} seconds. Using default of ${DEFAULT_REFRESH_INTERVAL / 1000} seconds.`
    );
  }

  if (intervalMs > 60 * 60 * 1000) { // Max 1 hour
    throw new ValidationError(
      "Auto-refresh interval cannot exceed 1 hour"
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: interval=60000 (1 minute)
- ✅ Valid: interval=300000 (5 minutes - default)
- ❌ Invalid: interval=30000 (30 seconds, < 1 minute)
- ❌ Invalid: interval=7200000 (2 hours, > 1 hour)

---

## Validation Error Handling

### Error Response Format
```typescript
interface ValidationErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    value?: any;
    validationRule: string;
  };
}

// Example error responses
const examples = {
  fieldError: {
    success: false,
    error: {
      code: "VAL-INV-OVW-001",
      message: "Selected location is not accessible",
      field: "locationId",
      value: "invalid-location-uuid",
      validationRule: "Location Selection Validity"
    }
  },

  businessRuleError: {
    success: false,
    error: {
      code: "VAL-INV-OVW-101",
      message: "Stock efficiency cannot exceed 100%",
      field: "stockEfficiency",
      value: 105,
      validationRule: "Performance Classification Threshold"
    }
  },

  securityError: {
    success: false,
    error: {
      code: "VAL-INV-OVW-301",
      message: "Access denied. You do not have permission to view this location",
      field: "locationId",
      value: "loc-restricted-uuid",
      validationRule: "Location-Based Access Control"
    }
  }
};
```

### Client-Side Error Display
```typescript
function handleValidationError(error: ValidationErrorResponse): void {
  // Show toast notification
  toast.error(error.error.message, {
    duration: 5000,
    position: 'top-right'
  });

  // Highlight invalid field if present
  if (error.error.field) {
    const element = document.getElementById(error.error.field);
    element?.classList.add('border-red-500');
    element?.focus();
  }

  // Log for debugging
  console.error('[Validation Error]', {
    code: error.error.code,
    rule: error.error.validationRule,
    field: error.error.field,
    value: error.error.value
  });
}
```

---

## Validation Summary

### Coverage Matrix

| Layer | Field-Level | Business Rules | Cross-Field | Security | Performance |
|-------|-------------|----------------|-------------|----------|-------------|
| Client | 5 rules | - | 3 rules | 1 rule | 2 rules |
| Server | 3 rules | 4 rules | 3 rules | 3 rules | - |
| Database | 2 rules | - | - | 1 rule (RLS) | - |

### Critical Validations

**Must-Have** (Blocking):
- VAL-INV-OVW-001: Location Selection Validity
- VAL-INV-OVW-301: Location-Based Access Control
- VAL-INV-OVW-101: Performance Classification Threshold
- VAL-INV-OVW-401: Stock Balance Non-Negativity

**Important** (Warning):
- VAL-INV-OVW-102: Transfer Suggestion Validity
- VAL-INV-OVW-103: Alert Threshold Validation
- VAL-INV-OVW-203: Performance Metrics Consistency

**Nice-to-Have** (Informational):
- VAL-INV-OVW-501: Chart Data Size Limits
- VAL-INV-OVW-502: Auto-Refresh Rate Limiting

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-10 | Development Team | Initial validation rules based on business requirements and technical specifications |
