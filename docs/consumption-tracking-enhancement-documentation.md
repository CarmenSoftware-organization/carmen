# Enhanced Consumption Tracking for Fractional Sales - Implementation Documentation

## Overview

This document provides comprehensive documentation for the enhanced consumption tracking system implemented to support fractional sales in the Carmen ERP system. The enhancement enables tracking consumption of partial products (pizza slices, cake slices, etc.) with advanced analytics, variance tracking, and real-time monitoring capabilities.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Components](#core-components)
3. [Data Structures](#data-structures)
4. [Services Implementation](#services-implementation)
5. [User Interface Components](#user-interface-components)
6. [Integration Points](#integration-points)
7. [Features and Capabilities](#features-and-capabilities)
8. [Configuration and Setup](#configuration-and-setup)
9. [API Reference](#api-reference)
10. [Testing and Validation](#testing-and-validation)
11. [Performance Considerations](#performance-considerations)
12. [Future Enhancements](#future-enhancements)

## System Architecture

### High-Level Architecture

The enhanced consumption tracking system is built on a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                 User Interface Layer                     │
│  - Enhanced Consumption Dashboard                       │
│  - Real-time Analytics Components                      │
│  - Variance Analysis Views                             │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                         │
│  - EnhancedConsumptionTrackingService                  │
│  - ConsumptionVarianceTrackingService                  │
│  - FractionalStockDeductionService (existing)         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  - Enhanced Type Definitions                           │
│  - Recipe Yield Variants (existing)                   │
│  - POS Transaction Integration                         │
└─────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Multi-Level Conversion**: Support for POS item → Recipe variant → Base recipe → Ingredients
2. **Real-Time Processing**: Live consumption tracking with minimal latency
3. **Statistical Analysis**: Advanced variance analysis with outlier detection
4. **Extensible Architecture**: Modular design supporting future enhancements
5. **Integration-First**: Seamless integration with existing POS and inventory systems

## Core Components

### 1. Enhanced Type Definitions (`/lib/types/enhanced-consumption-tracking.ts`)

Comprehensive type definitions supporting fractional sales consumption tracking:

#### Key Types:

- **`ConsumptionPeriod`**: Defines tracking periods with status management
- **`FractionalSalesTransaction`**: Extended POS transaction data with fractional sales metadata
- **`IngredientConsumptionRecord`**: Detailed ingredient consumption with variance tracking
- **`RecipeConsumptionSummary`**: Recipe-level consumption analysis with variant breakdown
- **`LocationConsumptionAnalytics`**: Location-based analytics with trend analysis
- **`RealTimeConsumptionMetrics`**: Live performance indicators and alerts
- **`ConsumptionVarianceAnalysis`**: Statistical variance analysis with root cause insights
- **`FractionalSalesEfficiencyReport`**: Fractional sales performance metrics

### 2. Enhanced Consumption Tracking Service (`/lib/services/enhanced-consumption-tracking-service.ts`)

Main service handling consumption calculations and analytics:

#### Core Functionality:
- **Period Consumption Calculation**: Comprehensive consumption metrics for any period
- **POS Transaction Processing**: Convert transactions to consumption data
- **Ingredient Consumption Calculation**: Multi-level ingredient usage tracking
- **Recipe Summary Generation**: Recipe-level performance analysis
- **Real-Time Metrics**: Live performance indicators with alerts
- **Fractional Inventory Deduction**: Precise inventory impact calculation

### 3. Consumption Variance Tracking Service (`/lib/services/consumption-variance-tracking-service.ts`)

Advanced variance analysis and alerting system:

#### Key Features:
- **Statistical Analysis**: Mean, median, standard deviation, outlier detection
- **Trend Analysis**: Time-series analysis with forecasting
- **Threshold Management**: Configurable variance thresholds per ingredient/recipe
- **Alert Generation**: Automated alerting with severity levels and recommendations
- **Root Cause Analysis**: Variance driver identification

### 4. Enhanced Consumption Dashboard (`/app/(main)/reporting-analytics/consumption-analytics/components/enhanced-consumption-dashboard.tsx`)

Comprehensive dashboard with real-time analytics:

#### Dashboard Features:
- **Real-Time KPIs**: Food cost %, waste %, fractional sales rate, profit margin
- **Interactive Charts**: Consumption trends, sales distribution, variance analysis
- **Alert Management**: Active alerts with recommended actions
- **Multi-Tab Interface**: Overview, fractional sales, variance, ingredients, efficiency
- **Auto-Refresh**: Configurable real-time data updates

## Data Structures

### Enhanced Recipe Yield Variants

Building on existing `RecipeYieldVariant` structure with additional fractional sales metadata:

```typescript
interface RecipeYieldVariant {
  id: string
  name: string
  unit: string
  quantity: number
  conversionRate: number  // Portion of base recipe (1.0 = whole, 0.125 = 1/8)
  sellingPrice: number
  costPerUnit: number
  isDefault: boolean
  shelfLife?: number      // Hours after preparation/opening
  wastageRate?: number    // Expected waste percentage for this variant
  minOrderQuantity?: number
  maxOrderQuantity?: number
}
```

### Consumption Tracking Records

#### Ingredient Consumption Record
```typescript
interface IngredientConsumptionRecord {
  id: string
  ingredientId: string
  ingredientName: string
  ingredientType: 'product' | 'recipe'
  
  // Theoretical vs Actual consumption
  theoreticalQuantity: number
  theoreticalCost: number
  actualQuantity: number
  actualCost: number
  
  // Variance tracking
  quantityVariance: number
  costVariance: number
  variancePercentage: number
  
  // Breakdown by source
  recipeConsumption: number
  directConsumption: number
  wastage: number
  spillage: number
  adjustment: number
  
  // Fractional sales specific
  fractionalContribution: number
  wholeItemContribution: number
  
  // Metadata
  unit: string
  location: string
  period: string
  calculatedAt: Date
  transactionIds: string[]
}
```

## Services Implementation

### EnhancedConsumptionTrackingService

#### Key Methods:

1. **`calculatePeriodConsumption(context: ConsumptionCalculationContext)`**
   - Calculates comprehensive consumption metrics for a period
   - Returns ingredient records, recipe summaries, analytics, and efficiency reports

2. **`processPOSTransactions(transactions, mappings, recipes)`**
   - Converts POS transactions to enhanced transaction records
   - Calculates costs and revenue based on recipe data

3. **`calculateIngredientConsumption(transactions, context)`**
   - Tracks ingredient usage across all transactions
   - Separates fractional vs whole item contributions
   - Applies wastage calculations

4. **`generateRealTimeMetrics(location, inventory)`**
   - Produces live consumption metrics
   - Generates alerts based on current conditions
   - Calculates KPIs and performance indicators

5. **`processFractionalDeduction(transaction, recipe, mapping, inventory)`**
   - Processes inventory deduction for single fractional transaction
   - Calculates ingredient-level impacts
   - Tracks prepared item deductions

### ConsumptionVarianceTrackingService

#### Key Features:

1. **Threshold Management**
   - Configurable variance thresholds per ingredient and recipe
   - Different thresholds for fractional vs whole sales
   - Escalation levels and alert settings

2. **Statistical Analysis**
   - Comprehensive statistical metrics (mean, median, std dev, skewness, kurtosis)
   - Normality testing and outlier detection
   - Distribution analysis with percentiles

3. **Trend Analysis**
   - Time-series analysis with trend detection
   - Forecasting with confidence intervals
   - Correlation analysis between ingredients

4. **Alert Generation**
   - Automated alerts based on thresholds
   - Severity classification (info, warning, critical)
   - Recommended actions and impact assessment

## User Interface Components

### Enhanced Consumption Dashboard

The dashboard provides a comprehensive view of consumption analytics with the following sections:

#### 1. Header and Controls
- Location and time range selectors
- Auto-refresh toggle (30-second intervals)
- Export functionality

#### 2. Real-Time Alerts
- Active alerts with severity indicators
- Recommended actions for each alert
- One-click action buttons

#### 3. Key Performance Indicators (KPIs)
Six main KPI cards displaying:
- Food Cost Percentage (with target comparison)
- Waste Percentage (with trend indicators)
- Fractional Sales Conversion Rate
- Average Transaction Value
- Profit Margin
- Yield Efficiency

#### 4. Analytics Tabs
- **Overview**: Consumption trends and sales distribution charts
- **Fractional Sales**: Efficiency metrics by fractional type
- **Variance Analysis**: Top variance ingredients with trends
- **Ingredients**: Live inventory levels with projections
- **Efficiency**: Yield trends and optimization opportunities

### Chart Components

1. **Consumption Trends**: ComposedChart showing theoretical vs actual consumption with waste visualization
2. **Sales Distribution**: AreaChart showing fractional vs whole sales breakdown
3. **Fractional Efficiency**: BarChart with revenue and efficiency metrics
4. **Variance Analysis**: Interactive list with trend indicators

## Integration Points

### 1. POS System Integration
- Uses existing `RecipeMapping` system for POS item to recipe mapping
- Processes `FractionalSalesTransaction` data from POS
- Supports multiple fractional sales types (pizza-slice, cake-slice, etc.)

### 2. Recipe Management Integration
- Leverages existing `Recipe` and `RecipeYieldVariant` structures
- Extends variants with fractional sales metadata
- Uses recipe ingredient definitions for consumption calculations

### 3. Inventory System Integration
- Integrates with existing `FractionalStockDeductionService`
- Updates inventory levels based on fractional deductions
- Provides real-time inventory impact calculations

### 4. Reporting System Integration
- Extends existing consumption reports
- Provides new consumption analytics page
- Integrates with dashboard navigation

## Features and Capabilities

### 1. Fractional Sales Tracking
- Tracks consumption for partial product sales (slices, portions, glasses)
- Supports multiple conversion rates within single recipes
- Calculates ingredient usage based on fraction of base recipe consumed

### 2. Multi-Level Conversion
- **Level 1**: POS Item → Recipe Variant
- **Level 2**: Recipe Variant → Base Recipe
- **Level 3**: Base Recipe → Individual Ingredients
- **Level 4**: Ingredients → Inventory Deduction

### 3. Variance Analysis
- Theoretical vs actual consumption tracking
- Statistical analysis with outlier detection
- Root cause analysis with driver identification
- Trend analysis with forecasting capabilities

### 4. Real-Time Analytics
- Live consumption metrics with 30-second refresh
- Real-time alerts and recommendations
- Live inventory level monitoring
- Performance indicator tracking

### 5. Efficiency Reporting
- Fractional sales efficiency by type
- Recipe yield efficiency tracking
- Optimization opportunity identification
- ROI calculations for improvements

### 6. Advanced Alerting
- Configurable thresholds per ingredient/recipe
- Multi-level alert severity (info, warning, critical)
- Automated escalation procedures
- Impact assessment for each alert

## Configuration and Setup

### 1. Variance Thresholds Configuration

```typescript
const varianceThresholds: VarianceThresholds = {
  locationId: 'main-kitchen',
  ingredientThresholds: [
    {
      ingredientId: 'chicken-breast',
      acceptableVariancePercentage: 5.0,
      warningThreshold: 8.0,
      criticalThreshold: 12.0,
      trendMonitoringDays: 7
    }
  ],
  recipeThresholds: [
    {
      recipeId: 'margherita-pizza',
      acceptableVariancePercentage: 7.0,
      warningThreshold: 10.0,
      criticalThreshold: 15.0,
      fractionalSalesVarianceMultiplier: 1.5 // Higher tolerance for fractional
    }
  ],
  globalThresholds: {
    overallVarianceThreshold: 6.0,
    wastageWarningPercentage: 4.0,
    wastageCriticalPercentage: 8.0,
    profitMarginWarningThreshold: 60.0,
    yieldEfficiencyWarningThreshold: 85.0
  }
}
```

### 2. Recipe Configuration

Existing recipes need to include yield variants for fractional sales:

```typescript
const pizzaRecipe: Recipe = {
  id: 'margherita-pizza',
  name: 'Margherita Pizza',
  // ... other properties
  yieldVariants: [
    {
      id: 'pizza-slice',
      name: 'Pizza Slice',
      unit: 'slice',
      quantity: 1,
      conversionRate: 0.125, // 1/8 of pizza
      sellingPrice: 4.99,
      costPerUnit: 1.85,
      shelfLife: 4,
      wastageRate: 5
    },
    {
      id: 'pizza-whole',
      name: 'Whole Pizza', 
      unit: 'whole',
      quantity: 1,
      conversionRate: 1.0,
      sellingPrice: 34.99,
      costPerUnit: 14.80,
      shelfLife: 1,
      wastageRate: 1
    }
  ],
  allowsFractionalSales: true,
  fractionalSalesType: 'pizza-slice'
}
```

## API Reference

### EnhancedConsumptionTrackingService

#### Methods

##### `calculatePeriodConsumption(context: ConsumptionCalculationContext)`
Calculates comprehensive consumption metrics for a given period.

**Parameters:**
- `context`: ConsumptionCalculationContext - Configuration and data for calculation

**Returns:**
```typescript
{
  ingredientRecords: IngredientConsumptionRecord[]
  recipeSummaries: RecipeConsumptionSummary[]
  locationAnalytics: LocationConsumptionAnalytics
  varianceAnalysis: ConsumptionVarianceAnalysis
  efficiencyReport: FractionalSalesEfficiencyReport
}
```

##### `generateRealTimeMetrics(location: string, inventory: Map)`
Generates real-time consumption metrics and alerts.

**Parameters:**
- `location`: string - Location identifier
- `inventory`: Map<string, {quantity: number, unitCost: number}> - Current inventory levels

**Returns:** `Promise<RealTimeConsumptionMetrics>`

### ConsumptionVarianceTrackingService

#### Methods

##### `analyzeVariance(ingredientRecords, recipeSummaries, period, historicalData?)`
Performs comprehensive variance analysis with statistical insights.

**Returns:**
```typescript
{
  varianceAnalysis: ConsumptionVarianceAnalysis
  alerts: VarianceAlert[]
  trendAnalysis: VarianceTrendAnalysis[]
  statisticalMetrics: StatisticalVarianceMetrics
  recommendations: Recommendation[]
}
```

##### `setVarianceThresholds(locationId: string, thresholds: VarianceThresholds)`
Configures variance thresholds for a specific location.

## Testing and Validation

### Unit Tests
- Service method testing with mock data
- Type definition validation
- Statistical calculation accuracy
- Alert generation logic

### Integration Tests
- POS transaction processing
- Recipe variant calculation
- Inventory deduction accuracy
- Dashboard data integration

### Performance Tests
- Large dataset processing (1000+ transactions)
- Real-time update latency
- Memory usage optimization
- Database query performance

### Validation Scenarios
1. **Single Fractional Sale**: Verify correct ingredient deduction for one pizza slice
2. **Mixed Sales**: Process combination of fractional and whole sales
3. **High Volume**: Handle peak-time transaction volumes
4. **Edge Cases**: Zero inventory, missing mappings, invalid data

## Performance Considerations

### 1. Calculation Optimization
- Batch processing of transactions
- Parallel calculation where possible
- Caching of intermediate results
- Incremental updates for real-time metrics

### 2. Memory Management
- Efficient data structures for large datasets
- Streaming processing for historical analysis
- Garbage collection optimization
- Memory pooling for frequent calculations

### 3. Database Optimization
- Indexed queries for transaction lookup
- Aggregated tables for historical data
- Partitioning by location and period
- Optimized joins for recipe/ingredient lookup

### 4. UI Performance
- Virtualized lists for large datasets
- Memoized chart components
- Efficient re-rendering strategies
- Progressive data loading

## Future Enhancements

### 1. Machine Learning Integration
- Predictive variance modeling
- Automated threshold adjustment
- Demand forecasting for fractional items
- Anomaly detection improvements

### 2. Advanced Analytics
- Seasonal variance analysis
- Cross-location comparison
- Supplier impact analysis
- Customer behavior correlation

### 3. Integration Expansions
- IoT sensor integration for waste tracking
- Third-party POS system support
- Supply chain integration
- Mobile app for real-time alerts

### 4. Reporting Enhancements
- Custom report builder
- Scheduled report delivery
- Advanced visualization options
- Export to BI tools

### 5. Automation Features
- Automated reorder suggestions
- Dynamic pricing based on waste
- Automated recipe adjustments
- Smart inventory optimization

## Conclusion

The Enhanced Consumption Tracking system provides comprehensive support for fractional sales with advanced analytics, real-time monitoring, and intelligent alerting. The implementation leverages existing system components while adding powerful new capabilities for tracking and optimizing consumption of partial products.

Key benefits include:
- **Accurate Cost Tracking**: Precise ingredient consumption calculation for fractional sales
- **Real-Time Insights**: Live performance monitoring with instant alerts
- **Advanced Analytics**: Statistical analysis with trend detection and forecasting
- **Operational Intelligence**: Actionable recommendations for waste reduction and efficiency improvement
- **Scalable Architecture**: Extensible design supporting future enhancements

The system is designed to provide immediate value while serving as a foundation for future advanced analytics and automation capabilities.

## File Structure Summary

```
lib/
├── types/
│   └── enhanced-consumption-tracking.ts (15 interfaces, 850 lines)
└── services/
    ├── enhanced-consumption-tracking-service.ts (1 class, 980 lines)
    └── consumption-variance-tracking-service.ts (1 class, 1200 lines)

app/(main)/reporting-analytics/consumption-analytics/
├── components/
│   └── enhanced-consumption-dashboard.tsx (1 component, 1100 lines)
└── page.tsx (1 page component, 60 lines)

docs/
└── consumption-tracking-enhancement-documentation.md (this file)
```

**Total Implementation**: 4 files, approximately 3200+ lines of code, comprehensive documentation

## Contact and Support

For questions about this implementation or future enhancements, please refer to the development team or create issues in the project repository with the label `consumption-tracking`.