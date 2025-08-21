# Enhanced Costing Engine for Portion-Based Pricing

## Overview

The Enhanced Costing Engine is a sophisticated system designed to handle portion-based pricing for fractional sales in the Carmen ERP system. It provides advanced cost calculation algorithms, dynamic pricing optimization, and comprehensive profitability analysis for items like pizza slices, cake portions, and other fractional products.

## Key Features

### 1. Portion-Based Cost Calculations
- **Multi-layer costing** with ingredient, labor, overhead, and waste factors
- **Variant-specific calculations** for different portion sizes and yield variants
- **Real-time cost accuracy** with ingredient price integration and waste tracking
- **Quality and seasonal adjustments** for ingredient costs

### 2. Dynamic Pricing Optimization
- **AI-powered pricing recommendations** using multi-objective optimization
- **Competitive analysis integration** with market positioning insights
- **Demand elasticity modeling** for volume impact prediction
- **Risk assessment and mitigation** strategies for pricing decisions

### 3. Comprehensive Profitability Analysis
- **BCG Matrix analysis** for variant performance categorization
- **Strategic value calculation** with customer satisfaction and brand impact
- **Cross-variant effects** including cannibalization and complementary analysis
- **Optimization opportunity identification** with ROI calculations

## System Architecture

### Core Services

#### 1. Enhanced Costing Engine Service
```typescript
import { enhancedCostingEngine } from '@/lib/services/enhanced-costing-engine'

// Calculate comprehensive cost breakdown
const costBreakdown = await enhancedCostingEngine.calculatePortionCost(
  recipe,
  variant,
  costingContext
)

// Generate dynamic pricing recommendations
const pricingResult = await enhancedCostingEngine.generateDynamicPricing(
  recipe,
  variant,
  costBreakdown,
  pricingRequest
)

// Analyze variant profitability
const profitabilityAnalysis = await enhancedCostingEngine.analyzeVariantProfitability(
  recipe,
  salesTransactions,
  period
)
```

#### 2. Dynamic Pricing Optimization Service
```typescript
import { dynamicPricingOptimizationService } from '@/lib/services/dynamic-pricing-optimization-service'

// Optimize pricing with multiple objectives
const optimizedPricing = await dynamicPricingOptimizationService.optimizePrice(
  costBreakdown,
  pricingRequest
)
```

#### 3. Profitability Analysis Service
```typescript
import { profitabilityAnalysisService } from '@/lib/services/profitability-analysis-service'

// Analyze recipe profitability across all variants
const profitabilityAnalysis = await profitabilityAnalysisService.analyzeRecipeProfitability(
  recipe,
  salesTransactions,
  costBreakdowns,
  period
)

// Segment variants by performance
const segmentation = await profitabilityAnalysisService.segmentVariantPerformance(
  variantPerformance
)
```

### UI Components

#### 1. Enhanced Costing Dashboard
```typescript
import EnhancedCostingDashboard from '@/components/costing/enhanced-costing-dashboard'

<EnhancedCostingDashboard
  location="Main Kitchen"
  period="2024-08"
  onRefresh={() => console.log('Refreshing data...')}
/>
```

#### 2. Costing Analytics Panel
```typescript
import CostingAnalyticsPanel from '@/components/costing/costing-analytics-panel'

<CostingAnalyticsPanel
  recipeId="pizza-1"
  variantId="slice"
  timeRange="last_30_days"
  onExport={() => console.log('Exporting analytics...')}
/>
```

#### 3. Pricing Recommendation Panel
```typescript
import PricingRecommendationPanel from '@/components/costing/pricing-recommendation-panel'

<PricingRecommendationPanel
  recipeId="pizza-1"
  variantId="slice"
  currentCost={7.65}
  currentPrice={12.50}
  onApplyPricing={(newPrice) => console.log('Applying price:', newPrice)}
/>
```

#### 4. Profitability Analysis Dashboard
```typescript
import ProfitabilityAnalysisDashboard from '@/components/costing/profitability-analysis-dashboard'

<ProfitabilityAnalysisDashboard
  recipeId="pizza-1"
  period="2024-08"
  onVariantSelect={(variantId) => console.log('Selected variant:', variantId)}
/>
```

## Data Models

### Core Types

#### PortionCostingContext
```typescript
interface PortionCostingContext {
  recipeId: string
  recipeName: string
  baseRecipeCost: number
  variants: RecipeYieldVariant[]
  ingredientCosts: IngredientCostDetail[]
  overheadFactors: OverheadCostFactors
  demandMetrics: DemandAnalytics
  wastePatterns: WasteAnalytics
  location: string
  period: string
  calculatedAt: Date
}
```

#### PortionCostBreakdown
```typescript
interface PortionCostBreakdown {
  recipeId: string
  recipeName: string
  variantId: string
  variantName: string
  portionSize: string
  
  // Cost components
  ingredientCost: number
  totalLaborCost: number
  totalOverheadCost: number
  totalLossCost: number
  totalCost: number
  
  // Base recipe metrics
  baseRecipeUnitsUsed: number
  costPerBaseUnit: number
  
  // Quality metrics
  costAccuracy: number
  calculatedAt: Date
}
```

#### DynamicPricingResult
```typescript
interface DynamicPricingResult {
  recipeId: string
  variantId: string
  
  // Pricing recommendations
  currentPrice: number
  recommendedPrice: number
  priceChange: number
  priceChangePercentage: number
  
  // Financial projections
  projectedMargin: number
  projectedMarginPercentage: number
  projectedRevenue: number
  projectedProfit: number
  
  // Volume impact
  currentVolume: number
  projectedVolume: number
  volumeChange: number
  volumeChangePercentage: number
  
  // Market analysis
  competitivePosition: 'premium' | 'mid_market' | 'value'
  pricePerceptile: number
  
  // Risk assessment
  riskFactors: RiskFactor[]
  implementationPriority: string
  expectedPaybackPeriod: number
  
  // Alternative scenarios
  alternativeScenarios: PricingScenario[]
}
```

## Implementation Guide

### 1. Setting Up the Costing Engine

#### Installation
```bash
# The costing engine is part of the Carmen ERP system
# No additional installation required
```

#### Configuration
```typescript
// Configure overhead factors for your location
const overheadFactors: OverheadCostFactors = {
  preparationLaborRate: 0.25, // $0.25 per minute
  cookingLaborRate: 0.30,     // $0.30 per minute
  serviceLaborRate: 0.20,     // $0.20 per minute
  skillLevelMultiplier: 1.2,  // 20% premium for skilled labor
  
  energyCostPerMinute: 0.05,  // Energy cost per cooking minute
  waterCostPerUnit: 0.02,     // Water cost per unit
  gasCostPerUnit: 0.03,       // Gas cost per unit
  
  equipmentDepreciation: 0.15, // Equipment cost per use
  facilityOverhead: 0.08,      // Facility cost allocation
  packagingCost: 0.25,         // Per serving packaging
  
  managementOverhead: 0.10,    // Administrative allocation
  marketingAllocation: 0.05,   // Marketing cost per item
  insuranceAllocation: 0.02    // Insurance cost per item
}
```

### 2. Cost Calculation Workflow

#### Step 1: Prepare Costing Context
```typescript
const costingContext: PortionCostingContext = {
  recipeId: recipe.id,
  recipeName: recipe.name,
  baseRecipeCost: calculateBaseRecipeCost(recipe),
  variants: recipe.yieldVariants,
  ingredientCosts: await getIngredientCosts(recipe.ingredients),
  overheadFactors: getLocationOverheadFactors(location),
  demandMetrics: await getDemandAnalytics(recipe.id, period),
  wastePatterns: await getWasteAnalytics(recipe.id, period),
  location: location,
  period: period,
  calculatedAt: new Date()
}
```

#### Step 2: Calculate Portion Costs
```typescript
const costBreakdowns = []

for (const variant of recipe.yieldVariants) {
  const costBreakdown = await enhancedCostingEngine.calculatePortionCost(
    recipe,
    variant,
    costingContext
  )
  costBreakdowns.push(costBreakdown)
}
```

#### Step 3: Generate Pricing Recommendations
```typescript
const pricingRequest: PricingOptimizationRequest = {
  recipeId: recipe.id,
  variantId: variant.id,
  objectives: [
    { type: 'maximize_profit', weight: 0.4, priority: 'high' },
    { type: 'maximize_revenue', weight: 0.3, priority: 'medium' },
    { type: 'maintain_quality_perception', weight: 0.3, priority: 'medium' }
  ],
  constraints: [
    { type: 'min_margin_percentage', value: 30, description: 'Minimum 30% margin', flexibility: 'strict' },
    { type: 'max_price_point', value: 20, description: 'Maximum $20 price', flexibility: 'preferred' }
  ],
  timeHorizon: 'short_term',
  marketConditions: await getMarketConditions(),
  competitiveContext: await getCompetitiveAnalysis(recipe.id)
}

const pricingResult = await enhancedCostingEngine.generateDynamicPricing(
  recipe,
  variant,
  costBreakdown,
  pricingRequest
)
```

### 3. Profitability Analysis Workflow

#### Step 1: Collect Sales Data
```typescript
const salesTransactions = await getFractionalSalesTransactions(
  recipe.id,
  period
)
```

#### Step 2: Analyze Profitability
```typescript
const profitabilityAnalysis = await profitabilityAnalysisService.analyzeRecipeProfitability(
  recipe,
  salesTransactions,
  costBreakdowns,
  period
)
```

#### Step 3: Generate Strategic Recommendations
```typescript
const segmentation = await profitabilityAnalysisService.segmentVariantPerformance(
  profitabilityAnalysis.variantPerformance
)

const recommendations = await profitabilityAnalysisService.generateStrategicRecommendations(
  profitabilityAnalysis,
  segmentation
)
```

## Best Practices

### 1. Cost Calculation
- **Update ingredient costs regularly** to maintain accuracy
- **Monitor waste patterns** and adjust calculations accordingly
- **Review overhead factors quarterly** to reflect changing costs
- **Use real-time inventory data** for better cost accuracy

### 2. Pricing Optimization
- **Set clear objectives** with appropriate weights
- **Define realistic constraints** based on business requirements
- **Monitor competitive landscape** regularly
- **Test pricing changes** in limited markets first

### 3. Profitability Analysis
- **Analyze performance regularly** (weekly/monthly)
- **Act on strategic recommendations** promptly
- **Monitor cross-variant effects** to avoid unintended consequences
- **Track optimization implementation** and measure results

### 4. Performance Monitoring
- **Set up automated alerts** for cost variance
- **Review profitability metrics** regularly
- **Track pricing recommendation accuracy** over time
- **Monitor customer response** to pricing changes

## Troubleshooting

### Common Issues

#### 1. Inaccurate Cost Calculations
- **Check ingredient cost data** for freshness and accuracy
- **Verify waste percentages** against actual measurements
- **Review overhead allocation** for correctness
- **Validate recipe yield calculations**

#### 2. Poor Pricing Recommendations
- **Review objective weights** for business alignment
- **Check competitive data** for accuracy
- **Verify demand elasticity estimates**
- **Assess market conditions** impact

#### 3. Performance Issues
- **Optimize database queries** for large datasets
- **Implement caching** for frequently accessed data
- **Use pagination** for large result sets
- **Monitor system resources** during calculations

### Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const costBreakdown = await enhancedCostingEngine.calculatePortionCost(
    recipe,
    variant,
    costingContext
  )
} catch (error) {
  if (error instanceof CostCalculationError) {
    // Handle cost calculation specific errors
    console.error('Cost calculation failed:', error.message)
  } else {
    // Handle general errors
    console.error('Unexpected error:', error)
  }
}
```

## Integration Points

### 1. Inventory Management
- **Real-time ingredient costs** from inventory system
- **Stock level monitoring** for availability
- **Purchase order integration** for cost predictions

### 2. POS System
- **Sales transaction data** for profitability analysis
- **Real-time pricing updates** to POS terminals
- **Menu management integration** for variant pricing

### 3. Recipe Management
- **Recipe data synchronization** for cost calculations
- **Yield variant management** for portion-based pricing
- **Ingredient specification updates** for cost accuracy

### 4. Reporting System
- **Automated cost reports** generation
- **Profitability dashboards** integration
- **Alert notifications** for stakeholders

## Future Enhancements

### 1. Machine Learning Integration
- **Predictive cost modeling** using historical data
- **Demand forecasting** for pricing optimization
- **Automated anomaly detection** for cost variance

### 2. Advanced Analytics
- **Customer segment analysis** for targeted pricing
- **Seasonal adjustment modeling** for ingredients
- **Supply chain impact analysis** for cost prediction

### 3. Integration Expansions
- **External market data** for competitive analysis
- **Weather data integration** for demand prediction
- **Economic indicators** for pricing adjustments

## Support and Maintenance

### Regular Maintenance Tasks
- **Monthly cost data review** and cleanup
- **Quarterly overhead factor updates**
- **Annual pricing strategy review**
- **System performance monitoring**

### Performance Metrics
- **Cost calculation accuracy**: Target >95%
- **Pricing recommendation acceptance**: Target >80%
- **System response time**: Target <2 seconds
- **Profitability improvement**: Target >10% annually

For additional support, refer to the Carmen ERP documentation or contact the development team.