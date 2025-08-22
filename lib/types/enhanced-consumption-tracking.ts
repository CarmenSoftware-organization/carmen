/**
 * Enhanced Consumption Tracking Types for Fractional Sales
 * 
 * Supports comprehensive tracking of consumption for fractional items like pizza slices,
 * cake slices, and other partial products with multi-yield recipes and POS integration.
 */

import { Recipe, RecipeYieldVariant } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"
import { RecipeMapping } from "@/app/(main)/system-administration/system-integrations/pos/mapping/recipes/types"

// Core Consumption Tracking Interfaces

export interface ConsumptionPeriod {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: 'active' | 'closed' | 'archived'
  location: string
  createdAt: Date
  closedAt?: Date
}

export interface FractionalSalesTransaction {
  id: string
  transactionId: string // POS transaction reference
  posItemCode: string
  itemName: string
  variantId: string
  variantName: string
  baseRecipeId: string
  baseRecipeName: string
  fractionalSalesType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  quantitySold: number
  conversionRate: number // How much of base recipe this sale represents
  salePrice: number
  costPrice: number
  grossProfit: number
  location: string
  cashier: string
  timestamp: Date
  shiftId?: string
  orderNumber?: string
}

export interface IngredientConsumptionRecord {
  id: string
  ingredientId: string
  ingredientName: string
  ingredientType: 'product' | 'recipe'
  
  // Theoretical consumption (based on recipes)
  theoreticalQuantity: number
  theoreticalCost: number
  
  // Actual consumption (including wastage, spillage, etc.)
  actualQuantity: number
  actualCost: number
  
  // Variance tracking
  quantityVariance: number // actual - theoretical
  costVariance: number // actual - theoretical
  variancePercentage: number // (variance / theoretical) * 100
  
  // Breakdown by source
  recipeConsumption: number // Consumed through recipes
  directConsumption: number // Direct usage (prep, seasoning, etc.)
  wastage: number // Identified waste
  spillage: number // Accidental loss
  adjustment: number // Manual adjustments
  
  unit: string
  location: string
  period: string // ConsumptionPeriod.id
  calculatedAt: Date
  
  // Fractional sales specific
  fractionalContribution: number // Portion consumed via fractional sales
  wholeItemContribution: number // Portion consumed via whole item sales
  
  // Associated transactions
  transactionIds: string[] // Related FractionalSalesTransaction.ids
}

export interface RecipeConsumptionSummary {
  id: string
  recipeId: string
  recipeName: string
  
  // Production metrics
  totalProduced: number // Base recipe units produced
  totalSold: number // Total units sold (all variants)
  remainingInventory: number // Unsold prepared items
  
  // Variant breakdown
  variantSales: {
    variantId: string
    variantName: string
    quantitySold: number
    revenueGenerated: number
    conversionRate: number
    contributionToBase: number // How many base recipes this represents
  }[]
  
  // Cost analysis
  totalIngredientCost: number
  totalLaborCost: number
  totalOverheadCost: number
  totalCost: number
  totalRevenue: number
  grossProfit: number
  profitMargin: number
  
  // Consumption efficiency
  theoreticalIngredientCost: number
  actualIngredientCost: number
  ingredientVariance: number
  wastageRate: number
  
  // Time tracking
  period: string // ConsumptionPeriod.id
  location: string
  calculatedAt: Date
  
  // Fractional sales metrics
  fractionalSalesRevenue: number // Revenue from fractional sales
  wholeSalesRevenue: number // Revenue from whole item sales
  fractionalSalesPercentage: number // % of revenue from fractional sales
  
  // Efficiency metrics
  yieldEfficiency: number // Actual yield / Expected yield
  conversionEfficiency: number // Successfully converted fractional sales rate
  wasteReductionOpportunity: number // Potential savings from waste reduction
}

export interface LocationConsumptionAnalytics {
  locationId: string
  locationName: string
  period: string // ConsumptionPeriod.id
  
  // Overall metrics
  totalSales: number
  totalCosts: number
  grossProfit: number
  profitMargin: number
  
  // Consumption breakdown
  totalIngredientConsumption: number
  theoreticalConsumption: number
  consumptionVariance: number
  consumptionVariancePercentage: number
  
  // Fractional vs whole sales analysis
  fractionalSalesMetrics: {
    totalTransactions: number
    totalRevenue: number
    averageTransactionValue: number
    topSellingVariants: {
      variantId: string
      variantName: string
      quantitySold: number
      revenue: number
    }[]
    conversionRates: {
      fractionalSalesType: string
      averageConversionRate: number
      efficiency: number
    }[]
  }
  
  // Category performance
  categoryPerformance: {
    categoryName: string
    theoreticalCost: number
    actualCost: number
    variance: number
    variancePercentage: number
    wasteAmount: number
    topWasteItems: {
      itemName: string
      wasteAmount: number
      wastePercentage: number
    }[]
  }[]
  
  // Trend analysis
  trends: {
    consumptionTrend: 'increasing' | 'decreasing' | 'stable'
    wasteTrend: 'increasing' | 'decreasing' | 'stable'
    profitabilityTrend: 'increasing' | 'decreasing' | 'stable'
    fractionalSalesTrend: 'increasing' | 'decreasing' | 'stable'
  }
  
  calculatedAt: Date
}

// Enhanced Calculation Context

export interface ConsumptionCalculationContext {
  period: ConsumptionPeriod
  location: string
  calculations: {
    includeWastage: boolean
    includeSpillage: boolean
    includeLaborCosts: boolean
    includeOverheadCosts: boolean
    useRealTimeInventory: boolean
    applySeasonalAdjustments: boolean
  }
  
  // Data sources
  posTransactions: FractionalSalesTransaction[]
  recipeData: Recipe[]
  recipeMappings: RecipeMapping[]
  inventorySnapshots: {
    timestamp: Date
    itemId: string
    quantity: number
    unitCost: number
  }[]
  
  // Variance thresholds
  thresholds: {
    acceptableVariancePercentage: number
    criticalVariancePercentage: number
    wasteWarningThreshold: number
    profitMarginWarningThreshold: number
  }
}

// Real-time Analytics Interfaces

export interface RealTimeConsumptionMetrics {
  timestamp: Date
  location: string
  
  // Current period metrics
  currentPeriodSales: number
  currentPeriodCosts: number
  currentPeriodProfit: number
  
  // Today's metrics
  todayTransactionCount: number
  todayFractionalSales: number
  todayWholeSales: number
  todayWastage: number
  
  // Live inventory impact
  liveIngredientLevels: {
    ingredientId: string
    ingredientName: string
    currentLevel: number
    projectedDepletion: Date | null
    reorderPoint: number
    status: 'adequate' | 'low' | 'critical' | 'out_of_stock'
  }[]
  
  // Performance indicators
  kpis: {
    foodCostPercentage: number
    wastePercentage: number
    fractionalSalesConversionRate: number
    averageTransactionValue: number
    profitMargin: number
    yieldEfficiency: number
  }
  
  // Alerts and recommendations
  alerts: {
    type: 'waste_warning' | 'stock_low' | 'variance_high' | 'efficiency_low'
    severity: 'info' | 'warning' | 'critical'
    message: string
    ingredientId?: string
    recipeId?: string
    variantId?: string
    threshold?: number
    currentValue?: number
    recommendedAction?: string
  }[]
}

// Advanced Analytics Interfaces

export interface ConsumptionVarianceAnalysis {
  period: string
  location: string
  analysisType: 'daily' | 'weekly' | 'monthly' | 'custom'
  
  // Overall variance
  totalTheoreticalCost: number
  totalActualCost: number
  totalVariance: number
  totalVariancePercentage: number
  
  // Variance by category
  categoryVariances: {
    categoryName: string
    theoreticalCost: number
    actualCost: number
    variance: number
    variancePercentage: number
    contributionToTotal: number
    trend: 'improving' | 'worsening' | 'stable'
  }[]
  
  // Variance by recipe
  recipeVariances: {
    recipeId: string
    recipeName: string
    fractionalSalesType?: string
    theoreticalCost: number
    actualCost: number
    variance: number
    variancePercentage: number
    productionCount: number
    averageVariancePerUnit: number
  }[]
  
  // Root cause analysis
  varianceDrivers: {
    driver: 'wastage' | 'over_portioning' | 'ingredient_cost_change' | 'recipe_deviation' | 'spillage' | 'theft'
    impact: number
    impactPercentage: number
    affectedItems: string[]
    recommendedActions: string[]
  }[]
  
  // Statistical analysis
  statistics: {
    meanVariance: number
    medianVariance: number
    standardDeviation: number
    confidenceInterval: {
      lower: number
      upper: number
      confidence: number
    }
    outliers: {
      ingredientId: string
      ingredientName: string
      variance: number
      standardDeviations: number
    }[]
  }
  
  calculatedAt: Date
}

export interface FractionalSalesEfficiencyReport {
  period: string
  location: string
  
  // Overall efficiency metrics
  totalFractionalTransactions: number
  totalFractionalRevenue: number
  averageFractionalTransactionValue: number
  fractionalSalesGrowthRate: number
  
  // Conversion efficiency by type
  typeEfficiency: {
    fractionalSalesType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
    totalTransactions: number
    totalRevenue: number
    averageConversionRate: number
    wasteRate: number
    profitMargin: number
    efficiency: number // Revenue per base recipe unit
    
    // Item performance within type
    itemPerformance: {
      recipeId: string
      recipeName: string
      variantsSold: {
        variantId: string
        variantName: string
        quantitySold: number
        revenue: number
        costEfficiency: number
      }[]
      totalBaseRecipesConsumed: number
      revenuePerBaseRecipe: number
      wastePerBaseRecipe: number
    }[]
  }[]
  
  // Optimization opportunities
  optimizationOpportunities: {
    opportunity: 'reduce_waste' | 'improve_portioning' | 'adjust_pricing' | 'optimize_variants' | 'improve_yield'
    potentialImpact: number
    affectedItems: string[]
    currentMetric: number
    targetMetric: number
    implementationComplexity: 'low' | 'medium' | 'high'
    estimatedTimeToValue: string
  }[]
  
  // Trend analysis
  trends: {
    period: string
    fractionalSalesVolume: number
    fractionalSalesRevenue: number
    averageTransactionValue: number
    conversionEfficiency: number
    wasteRate: number
  }[]
  
  calculatedAt: Date
}

// Inventory Integration Interfaces

export interface FractionalInventoryDeduction {
  deductionId: string
  transactionId: string
  recipeId: string
  variantId: string
  
  // Base recipe impact
  baseRecipeQuantityUsed: number
  baseRecipeCost: number
  
  // Ingredient-level deductions
  ingredientDeductions: {
    ingredientId: string
    ingredientName: string
    theoreticalQuantity: number
    actualQuantityDeducted: number
    wastageQuantity: number
    costImpact: number
    newInventoryLevel: number
    stockStatus: 'adequate' | 'low' | 'critical'
  }[]
  
  // Prepared item impact
  preparedItemDeductions: {
    preparedItemId: string // Could be whole pizza, whole cake, etc.
    quantityUsed: number // Fraction of prepared item used
    remainingQuantity: number
    shelfLifeRemaining: number // Hours
    disposalRisk: number // Risk of having to dispose due to shelf life
  }[]
  
  timestamp: Date
  location: string
  processedBy: string
  validationStatus: 'pending' | 'validated' | 'disputed'
}

// All interfaces are already exported individually above