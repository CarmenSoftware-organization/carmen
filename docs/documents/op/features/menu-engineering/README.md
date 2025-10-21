# Menu Engineering

> **Feature:** Operational Planning > Menu Engineering
> **Pages:** 4
> **Status:** ✅ Production Ready

---

## Overview

Menu Engineering is a strategic analysis tool that classifies menu items based on their popularity and profitability using the classic menu engineering matrix. This feature enables data-driven menu optimization decisions by categorizing items into Stars, Plow Horses, Puzzles, and Dogs, with actionable recommendations for each category.

### Key Capabilities

1. **Performance Matrix** - Interactive scatter plot of popularity vs profitability
2. **Portfolio Analysis** - Menu composition breakdown and top performers
3. **Cost Alerts** - Automated monitoring and threshold management
4. **Sales Data Import** - POS integration and manual data upload
5. **Recipe Metrics** - Individual recipe performance deep-dive
6. **Classification System** - Automated categorization with visual indicators

---

## Page Structure

### Main Route
**Route:** `/operational-planning/menu-engineering`

### Tab Navigation

#### 1. Performance Matrix Tab
Interactive scatter chart plotting menu items by popularity (x-axis) vs profitability (y-axis).

**Features:**
- **Quadrant Classification**:
  - **Stars** (Upper Right): High popularity + High profitability
  - **Plow Horses** (Upper Left): High popularity + Low profitability
  - **Puzzles** (Lower Right): Low popularity + High profitability
  - **Dogs** (Lower Left): Low popularity + Low profitability

- **Interactive Elements**:
  - Click on data points to view recipe details
  - Tooltip shows recipe name, category, metrics
  - Color-coded by classification
  - Visual quadrant dividers

- **Filters**:
  - Date range selector (calendar picker)
  - Category filter dropdown
  - Location filter dropdown
  - Quick action buttons

- **Key Metrics Cards**:
  - Total menu items count
  - Total revenue with trend
  - Average contribution margin
  - Active alerts count
  - Portfolio health score (0-100%)

#### 2. Portfolio Analysis Tab
Comprehensive breakdown of menu composition and performance.

**Features:**
- **Portfolio Composition**:
  - Pie chart showing distribution by classification
  - Percentage and count per category
  - Visual legend with color coding

- **Top Performers**:
  - Ranked list of highest contribution items
  - Unit contribution amounts
  - Classification badges
  - Click-through to recipe details

- **Distribution Insights**:
  - Ideal portfolio balance recommendations
  - Current vs target composition
  - Action items for rebalancing

#### 3. Recipe Details Tab
Detailed performance metrics for individual recipes.

**Features:**
- Recipe performance over time
- Sales trend charts
- Profit trend analysis
- Comparison to category averages
- Historical performance data
- Seasonality analysis

**Component:** `RecipePerformanceMetrics`

#### 4. Cost Alerts Tab
Proactive cost monitoring and alert management.

**Features:**
- Alert configuration
- Threshold setting
- Alert history
- Critical alerts highlighting
- Bulk alert actions
- Alert statistics dashboard

**Component:** `CostAlertManagement`

#### 5. Data Import Tab
Sales data integration and upload interface.

**Features:**
- POS data import
- Manual CSV/Excel upload
- Field mapping interface
- Data validation
- Import history
- Error reporting

**Component:** `SalesDataImport`

---

## Data Model

```typescript
interface MenuItemPerformance {
  // Identity
  recipeId: string;
  recipeName: string;
  category: string;

  // Sales Metrics
  totalSales: number; // Units sold
  totalRevenue: Money;
  grossProfit: Money;
  grossMarginPercentage: number;

  // Performance Scores
  popularityScore: number; // 0-100, relative to all items
  profitabilityScore: number; // 0-100, relative to average margin

  // Classification
  classification: 'star' | 'plow_horse' | 'puzzle' | 'dog';

  // Trends
  salesTrend: number; // Percentage change
  profitTrend: number; // Percentage change

  // Contribution
  unitContribution: Money; // Profit per unit sold
}

interface MenuEngineeringClassification {
  // Classification Thresholds
  popularityThreshold: number; // Default: 50% (median)
  profitabilityThreshold: number; // Default: 50% (median)

  // Portfolio Targets
  targetStarPercentage: number; // Recommended: 25%
  targetPlowHorsePercentage: number; // Recommended: 25%
  targetPuzzlePercentage: number; // Recommended: 25%
  targetDogPercentage: number; // Recommended: 25%
}

interface CostAlert {
  id: string;
  recipeId: string;
  recipeName: string;
  alertType: 'ingredient_price_increase' | 'margin_below_target' | 'cost_variance' | 'wastage_high';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'dismissed';
  threshold: number;
  currentValue: number;
  message: string;
  createdAt: string;
  resolvedAt?: string;
  actions: string[]; // Recommended actions
}

interface SalesDataImport {
  id: string;
  importDate: string;
  source: 'pos' | 'manual' | 'api';
  fileName?: string;
  recordCount: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  validationErrors: string[];
  mappings: FieldMapping[];
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
}
```

---

## Menu Engineering Methodology

### Classification Algorithm

#### Step 1: Calculate Popularity Score
```typescript
function calculatePopularityScore(item: MenuItem, allItems: MenuItem[]): number {
  const totalSales = allItems.reduce((sum, i) => sum + i.totalSales, 0);
  const itemPopularity = (item.totalSales / totalSales) * 100;

  // Score relative to median (50th percentile)
  const allPopularities = allItems.map(i => (i.totalSales / totalSales) * 100);
  const median = calculateMedian(allPopularities);

  return (itemPopularity / median) * 50; // Normalized to 0-100 scale
}
```

#### Step 2: Calculate Profitability Score
```typescript
function calculateProfitabilityScore(item: MenuItem, allItems: MenuItem[]): number {
  const averageMargin = allItems.reduce((sum, i) =>
    sum + i.grossMarginPercentage, 0) / allItems.length;

  // Score relative to average
  return (item.grossMarginPercentage / averageMargin) * 50; // Normalized to 0-100 scale
}
```

#### Step 3: Classify Item
```typescript
function classifyMenuItem(
  popularityScore: number,
  profitabilityScore: number
): Classification {
  const popularityThreshold = 50;
  const profitabilityThreshold = 50;

  if (popularityScore >= popularityThreshold &&
      profitabilityScore >= profitabilityThreshold) {
    return 'star'; // High-High
  } else if (popularityScore >= popularityThreshold &&
             profitabilityScore < profitabilityThreshold) {
    return 'plow_horse'; // High-Low
  } else if (popularityScore < popularityThreshold &&
             profitabilityScore >= profitabilityThreshold) {
    return 'puzzle'; // Low-High
  } else {
    return 'dog'; // Low-Low
  }
}
```

### Portfolio Health Score
```typescript
function calculatePortfolioHealth(items: MenuItem[]): number {
  const distribution = calculateDistribution(items);
  const ideal = { star: 0.25, plow_horse: 0.25, puzzle: 0.25, dog: 0.25 };

  // Calculate deviation from ideal
  let totalDeviation = 0;
  for (const category in ideal) {
    const deviation = Math.abs(distribution[category] - ideal[category]);
    totalDeviation += deviation;
  }

  // Convert to 0-100 score (lower deviation = higher score)
  return Math.max(0, 100 - (totalDeviation * 100));
}
```

---

## Strategic Recommendations

### Classification Matrix & Actions

| Classification | Characteristics | Strategic Actions | Priority |
|---------------|----------------|-------------------|----------|
| **Stars** 🌟 | High popularity + High profitability | • Maintain quality<br>• Promote prominently<br>• Monitor carefully<br>• Keep recipe consistent | **Critical** |
| **Plow Horses** 🐴 | High popularity + Low profitability | • Increase price gradually<br>• Reduce portion size<br>• Substitute cheaper ingredients<br>• Reposition menu placement | **High** |
| **Puzzles** 🧩 | Low popularity + High profitability | • Increase marketing<br>• Reduce price<br>• Reposition on menu<br>• Enhance presentation | **Medium** |
| **Dogs** 🐕 | Low popularity + Low profitability | • Remove from menu<br>• Reformulate recipe<br>• Replace entirely<br>• Offer as special only | **Low** |

### Ideal Portfolio Composition

**Target Distribution:**
- **25% Stars**: Core menu drivers
- **25% Plow Horses**: Volume generators
- **25% Puzzles**: Profit opportunities
- **25% Dogs**: Candidates for removal

**Warning Thresholds:**
- Stars < 15%: Menu lacks strong performers
- Plow Horses > 40%: Profitability issues
- Puzzles > 35%: Low customer appeal
- Dogs > 30%: Menu needs cleanup

---

## Cost Alert System

### Alert Types

#### 1. Ingredient Price Increase
**Trigger:** Supplier cost increase >10%
**Severity:** Medium to Critical (based on %)
**Actions:**
- Review supplier alternatives
- Adjust recipe pricing
- Substitute ingredients
- Negotiate with supplier

#### 2. Margin Below Target
**Trigger:** Gross margin <25%
**Severity:** High
**Actions:**
- Increase selling price
- Reduce portion size
- Optimize ingredient usage
- Review labor costs

#### 3. Cost Variance
**Trigger:** Actual cost vs theoretical >5%
**Severity:** Medium to High
**Actions:**
- Investigate wastage
- Audit inventory
- Check recipe adherence
- Train kitchen staff

#### 4. High Wastage
**Trigger:** Wastage rate >expected by 20%
**Severity:** Medium
**Actions:**
- Review prep procedures
- Adjust par levels
- Improve storage
- Update forecasting

### Alert Configuration

```typescript
interface AlertThreshold {
  alertType: AlertType;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  notificationChannels: ('email' | 'sms' | 'dashboard' | 'mobile')[];
  assignees: string[]; // User IDs
  autoResolve: boolean;
  escalationRules: EscalationRule[];
}
```

---

## Sales Data Integration

### POS Integration Flow

1. **Connect POS System**
   - API configuration
   - Authentication setup
   - Sync schedule

2. **Data Mapping**
   - Map POS menu items to recipes
   - Configure field mappings
   - Set transformation rules

3. **Automatic Sync**
   - Scheduled imports (hourly/daily)
   - Real-time sync (if supported)
   - Error handling and retry

4. **Validation**
   - Data quality checks
   - Missing field detection
   - Duplicate prevention

5. **Processing**
   - Calculate metrics
   - Update performance scores
   - Generate alerts

### Manual Import Process

1. **Upload File**
   - Supported formats: CSV, Excel, JSON
   - Template download available
   - Drag-and-drop interface

2. **Map Fields**
   - Recipe ID/Name mapping
   - Sales quantity field
   - Revenue field
   - Date field
   - Category field (optional)

3. **Validate Data**
   - Required field check
   - Data type validation
   - Range validation
   - Duplicate detection

4. **Review & Import**
   - Preview mapped data
   - Validation summary
   - Confirm import

5. **Process Results**
   - Import success/failure notification
   - Error report download
   - Data integration confirmation

### Required Fields

```typescript
interface SalesDataRow {
  // Required
  recipeId: string; // OR recipeName
  salesQuantity: number;
  revenue: number;
  saleDate: string; // ISO format

  // Optional
  cost?: number;
  category?: string;
  location?: string;
  customerId?: string;
  transactionId?: string;
}
```

---

## API Endpoints

```http
# Menu Engineering Analysis
GET /api/menu-engineering/performance
GET /api/menu-engineering/portfolio
GET /api/menu-engineering/classification

# Individual Recipe Performance
GET /api/menu-engineering/recipes/:id/performance
GET /api/menu-engineering/recipes/:id/trends

# Cost Alerts
GET /api/menu-engineering/alerts
POST /api/menu-engineering/alerts
PUT /api/menu-engineering/alerts/:id
DELETE /api/menu-engineering/alerts/:id
GET /api/menu-engineering/alerts/stats

# Sales Data Import
POST /api/menu-engineering/import/sales
GET /api/menu-engineering/import/history
GET /api/menu-engineering/import/:id/status
POST /api/menu-engineering/import/validate

# Configuration
GET /api/menu-engineering/config
PUT /api/menu-engineering/config/thresholds
PUT /api/menu-engineering/config/targets
```

---

## Business Rules

### Performance Analysis
1. **Minimum Data**: Requires 30 days sales data for accurate classification
2. **Update Frequency**: Metrics recalculated daily at midnight
3. **Seasonal Adjustment**: Option to exclude seasonal items from comparisons
4. **New Item Grace Period**: Items <30 days excluded from Dog classification

### Alert Rules
1. **Alert Threshold**: Configurable per alert type
2. **Escalation**: Auto-escalate critical alerts after 24 hours
3. **Auto-Resolve**: Alerts auto-resolve when conditions normalized
4. **Notification Limits**: Max 3 alerts per recipe per day

### Data Import
1. **Historical Limit**: Import data up to 2 years historical
2. **Duplicate Prevention**: Same date range prevents re-import
3. **Data Quality**: Requires >80% valid records to process
4. **Reconciliation**: Daily reconciliation with POS systems

---

## Integration Points

### Recipe Management
- Real-time cost data
- Recipe changes trigger recalculation
- Ingredient cost updates
- Margin impact analysis

### POS Systems
- Sales data synchronization
- Menu item mapping
- Transaction details
- Customer preferences

### Inventory Management
- Cost tracking
- Wastage reporting
- Stock availability
- Par level optimization

### Finance
- Revenue reporting
- Profitability analysis
- Cost accounting
- Budget variance

---

## User Guide

### Analyzing Menu Performance

1. Navigate to Menu Engineering dashboard
2. Select date range for analysis
3. Apply category/location filters
4. Review performance matrix:
   - Identify items in each quadrant
   - Click on data points for details
5. Check portfolio composition
6. Review top performers
7. Take strategic actions based on classification

### Setting Up Cost Alerts

1. Go to Cost Alerts tab
2. Click "Create Alert"
3. Select alert type
4. Set threshold value
5. Choose severity level
6. Add notification recipients
7. Save alert configuration

### Importing Sales Data

1. Go to Data Import tab
2. Click "Upload File" or "Connect POS"
3. Select file or configure API
4. Map fields to system fields
5. Preview and validate data
6. Confirm and process import
7. Review import results

---

## Troubleshooting

### Issue: Items Not Classified
**Cause**: Insufficient sales data
**Solution**: Ensure minimum 30 days of sales data imported

### Issue: Portfolio Health Score Low
**Cause**: Imbalanced menu composition
**Solution**: Review Dogs and Plow Horses for optimization opportunities

### Issue: Import Fails
**Cause**: Field mapping errors or data format issues
**Solution**: Download template, verify data format, check field mappings

### Issue: Cost Alerts Not Triggering
**Cause**: Threshold too high or data not syncing
**Solution**: Verify alert configuration and data import status

---

## Performance Optimization

**Best Practices:**
- Cache performance calculations (24hr TTL)
- Pre-calculate scores during nightly batch
- Index sales data by date and recipe
- Paginate large datasets
- Lazy load charts and visualizations

**Data Volume Handling:**
- Archive data >2 years old
- Aggregate daily sales to weekly/monthly
- Limit concurrent imports to 3
- Process imports in background jobs

---

## Reports & Analytics

### Available Reports

1. **Menu Performance Summary**
   - Classification breakdown
   - Top/bottom performers
   - Trend analysis
   - Recommendations

2. **Profitability Report**
   - Margin analysis by category
   - Contribution ranking
   - Cost variance tracking
   - Pricing recommendations

3. **Portfolio Health Report**
   - Current vs ideal composition
   - Rebalancing recommendations
   - Historical trends
   - Action items

4. **Alert Summary Report**
   - Active alerts by type
   - Resolution metrics
   - Cost impact analysis
   - Trend analysis

### Export Options
- PDF (formatted reports)
- Excel (raw data)
- CSV (data export)
- JSON (API integration)

---

## Future Enhancements

**Planned Features:**
- Machine learning predictions
- Seasonal trend analysis
- Competitor benchmarking
- Customer sentiment integration
- Dynamic pricing recommendations
- A/B testing framework
- Menu optimization simulator
- Mobile app for alerts

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
