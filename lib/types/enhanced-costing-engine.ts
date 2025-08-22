/**
 * Enhanced Costing Engine Types for Portion-Based Pricing
 * 
 * Supports advanced costing algorithms for fractional sales, dynamic pricing,
 * variant-specific cost allocation, and profitability optimization.
 */

import { Recipe, RecipeYieldVariant, Ingredient } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"
import { FractionalSalesTransaction, ConsumptionPeriod } from "./enhanced-consumption-tracking"

// Core Costing Interfaces

export interface PortionCostingContext {
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

export interface IngredientCostDetail {
  ingredientId: string
  ingredientName: string
  type: 'product' | 'recipe'
  baseQuantity: number
  unit: string
  
  // Cost breakdown
  unitCost: number
  totalCost: number
  
  // Quality and sourcing factors
  qualityGrade: 'premium' | 'standard' | 'economy'
  sourceType: 'local' | 'regional' | 'imported'
  seasonalityFactor: number // 0.5 - 2.0 multiplier
  
  // Volatility and risk
  priceVolatility: number // Standard deviation of price changes
  supplyRisk: 'low' | 'medium' | 'high'
  substitutionOptions: number // Number of substitute ingredients available
  
  // Waste and yield factors
  preparationWaste: number // Percentage lost in prep
  cookingWaste: number // Percentage lost during cooking
  servingWaste: number // Percentage lost during service
  totalWastePercentage: number
  
  // Time-sensitive factors
  shelfLife: number // Days before expiration
  shelfLifeRemaining?: number
  spoilageRisk: number // Percentage likely to spoil
}

export interface OverheadCostFactors {
  // Labor costs
  preparationLaborRate: number // Cost per minute
  cookingLaborRate: number // Cost per minute
  serviceLaborRate: number // Cost per minute
  skillLevelMultiplier: number // Based on chef skill requirement
  
  // Utility costs
  energyCostPerMinute: number // Cooking equipment energy cost
  waterCostPerUnit: number // Water usage cost
  gasCostPerUnit: number // Gas usage cost
  
  // Equipment and facility costs
  equipmentDepreciation: number // Cost per use
  facilityOverhead: number // Square footage cost allocation
  cleaningAndSanitization: number // Cleaning cost per recipe
  
  // Packaging and presentation
  packagingCost: number // Per serving packaging cost
  presentationCost: number // Garnish, plating costs
  disposableCost: number // Disposable serviceware cost
  
  // Business overhead
  managementOverhead: number // Administrative cost allocation
  marketingAllocation: number // Marketing cost per item
  insuranceAllocation: number // Insurance cost per item
}

export interface DemandAnalytics {
  recipeId: string
  period: string
  
  // Sales volume metrics
  totalSalesVolume: number
  averageDailySales: number
  peakDayVolume: number
  lowDayVolume: number
  salesVariability: number // Coefficient of variation
  
  // Variant-specific demand
  variantDemand: {
    variantId: string
    variantName: string
    salesVolume: number
    demandShare: number // Percentage of total recipe demand
    priceElasticity: number // Demand sensitivity to price changes
    crossElasticity: number // Demand impact on other variants
    seasonalPattern: {
      season: 'spring' | 'summer' | 'fall' | 'winter'
      demandMultiplier: number
    }[]
    timeOfDayPattern: {
      hour: number
      demandMultiplier: number
    }[]
    dayOfWeekPattern: {
      day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
      demandMultiplier: number
    }[]
  }[]
  
  // Market context
  competitorPricing: {
    competitorName: string
    productName: string
    price: number
    portionSize: string
    qualityRating: number
  }[]
  
  // Demand forecasting
  forecastAccuracy: number // Historical forecast accuracy percentage
  demandTrend: 'increasing' | 'stable' | 'decreasing'
  trendStrength: number // Rate of change
  cyclicalPatterns: boolean
  externalFactors: {
    factor: string
    impact: number // -1 to 1 scale
    confidence: number // 0 to 1 scale
  }[]
}

export interface WasteAnalytics {
  recipeId: string
  period: string
  
  // Overall waste metrics
  totalWastePercentage: number
  wasteValueAmount: number
  wasteReductionOpportunity: number
  
  // Waste by category
  wasteBreakdown: {
    category: 'preparation' | 'cooking' | 'service' | 'storage' | 'presentation'
    wastePercentage: number
    wasteValue: number
    primaryCauses: string[]
    reductionPotential: number
    implementationDifficulty: 'low' | 'medium' | 'high'
  }[]
  
  // Waste by variant
  variantWaste: {
    variantId: string
    variantName: string
    wastePercentage: number
    wasteValue: number
    wasteDrivers: {
      driver: string
      impact: number
      frequency: number
    }[]
  }[]
  
  // Waste patterns
  timeBasedWaste: {
    timeOfDay: number
    wastePercentage: number
  }[]
  volumeBasedWaste: {
    volumeRange: string
    wastePercentage: number
  }[]
  
  // Waste reduction initiatives
  wasteReductionOptions: {
    initiative: string
    potentialReduction: number
    implementationCost: number
    paybackPeriod: number // Months
    feasibilityScore: number // 0 to 1 scale
  }[]
}

// Pricing Optimization Interfaces

export interface PricingOptimizationRequest {
  recipeId: string
  variantId?: string // If null, optimize all variants
  objectives: PricingObjective[]
  constraints: PricingConstraint[]
  timeHorizon: 'immediate' | 'short_term' | 'long_term' // days, weeks, months
  marketConditions: MarketCondition[]
  competitiveContext: CompetitiveAnalysis
}

export interface PricingObjective {
  type: 'maximize_profit' | 'maximize_revenue' | 'maximize_market_share' | 'minimize_waste' | 'maintain_quality_perception'
  weight: number // 0 to 1, weights must sum to 1
  target?: number // Optional target value
  priority: 'high' | 'medium' | 'low'
}

export interface PricingConstraint {
  type: 'min_margin_percentage' | 'max_price_point' | 'min_price_point' | 'competitor_relative' | 'volume_threshold'
  value: number
  description: string
  flexibility: 'strict' | 'preferred' | 'guideline'
}

export interface MarketCondition {
  factor: 'economic_climate' | 'seasonal_demand' | 'competitor_activity' | 'supply_chain' | 'local_events'
  impact: number // -1 to 1 scale
  confidence: number // 0 to 1 confidence in assessment
  duration: 'temporary' | 'seasonal' | 'permanent'
  description: string
}

export interface CompetitiveAnalysis {
  directCompetitors: {
    name: string
    productName: string
    price: number
    portionSize: string
    qualityScore: number
    marketPosition: 'premium' | 'mid_market' | 'value'
    uniqueSellingPoints: string[]
  }[]
  indirectCompetitors: {
    name: string
    category: string
    averagePrice: number
    substitutionThreat: number // 0 to 1 scale
  }[]
  marketGap: {
    pricePoint: number
    description: string
    opportunityScore: number
  }[]
}

// Cost Calculation Results

export interface PortionCostBreakdown {
  recipeId: string
  recipeName: string
  variantId: string
  variantName: string
  portionSize: string
  calculatedAt: Date
  
  // Base costs
  ingredientCost: number
  ingredientCostPerGram: number
  
  // Labor costs
  preparationLaborCost: number
  cookingLaborCost: number
  serviceLaborCost: number
  totalLaborCost: number
  
  // Overhead costs
  utilitiesCost: number
  equipmentCost: number
  facilityCost: number
  packagingCost: number
  totalOverheadCost: number
  
  // Waste and loss
  wasteCost: number
  spillageCost: number
  spoilageCost: number
  totalLossCost: number
  
  // Total costs
  directCost: number // Ingredients + Direct Labor
  indirectCost: number // Overhead + Waste
  totalCost: number
  
  // Cost per base recipe unit
  baseRecipeUnitsUsed: number // How many base recipes this portion represents
  costPerBaseUnit: number
  
  // Quality metrics
  costAccuracy: number // Confidence in cost calculation (0-1)
  lastUpdated: Date
  priceValidUntil?: Date // When ingredient prices expire
}

export interface DynamicPricingResult {
  recipeId: string
  variantId: string
  optimizationId: string
  calculatedAt: Date
  
  // Current vs optimized pricing
  currentPrice: number
  recommendedPrice: number
  priceChange: number
  priceChangePercentage: number
  
  // Financial projections
  projectedMargin: number
  projectedMarginPercentage: number
  projectedRevenue: number
  projectedProfit: number
  
  // Volume impact analysis
  currentVolume: number
  projectedVolume: number
  volumeChange: number
  volumeChangePercentage: number
  
  // Market positioning
  competitivePosition: 'premium' | 'mid_market' | 'value'
  pricePerceptile: number // Where this price ranks vs competitors (0-100)
  
  // Risk assessment
  riskFactors: {
    factor: string
    probability: number // 0 to 1
    impact: number // -1 to 1
    mitigation: string
  }[]
  
  // Implementation guidance
  implementationPriority: 'immediate' | 'within_week' | 'within_month' | 'future_consideration'
  implementationComplexity: 'simple' | 'moderate' | 'complex'
  expectedPaybackPeriod: number // Days
  
  // Alternative pricing scenarios
  alternativeScenarios: {
    scenario: string
    price: number
    projectedOutcome: {
      margin: number
      volume: number
      revenue: number
      riskScore: number
    }
  }[]
}

// Profitability Analysis

export interface VariantProfitabilityAnalysis {
  recipeId: string
  recipeName: string
  analysisDate: Date
  analysisPeriod: string
  
  // Overall recipe performance
  totalRevenue: number
  totalCost: number
  totalProfit: number
  averageMarginPercentage: number
  
  // Variant-level analysis
  variantPerformance: {
    variantId: string
    variantName: string
    portionSize: string
    
    // Volume metrics
    unitsSold: number
    salesFrequency: number
    marketShareWithinRecipe: number
    
    // Financial metrics
    sellingPrice: number
    totalCost: number
    unitProfit: number
    marginPercentage: number
    totalRevenue: number
    totalProfitContribution: number
    
    // Efficiency metrics
    revenuePerMinute: number // Revenue per minute of preparation time
    profitPerGramIngredient: number
    costEfficiencyRank: number // Rank among all variants
    
    // Strategic metrics
    strategicValue: number // Long-term value score
    customerSatisfactionImpact: number
    brandImageImpact: number
    crossSellingPotential: number
    
    // Performance indicators
    performanceRating: 'star' | 'solid' | 'question' | 'dog' // BCG matrix style
    recommendedAction: 'promote' | 'optimize' | 'maintain' | 'consider_removal'
    optimizationOpportunities: {
      opportunity: string
      potentialImpact: number
      implementationCost: number
      timeToRealize: number
    }[]
  }[]
  
  // Cross-variant analysis
  cannibalizedSales: {
    fromVariantId: string
    toVariantId: string
    impactPercentage: number
  }[]
  
  complementaryEffects: {
    variantId1: string
    variantId2: string
    synergyEffect: number // Positive indicates complementary
  }[]
}

export interface CostVarianceAlert {
  alertId: string
  recipeId: string
  recipeName: string
  variantId?: string
  variantName?: string
  location: string
  
  // Alert details
  alertType: 'cost_increase' | 'margin_decrease' | 'waste_increase' | 'efficiency_drop' | 'competitive_threat'
  severity: 'low' | 'medium' | 'high' | 'critical'
  triggeredAt: Date
  
  // Variance details
  currentValue: number
  expectedValue: number
  variance: number
  variancePercentage: number
  threshold: number
  
  // Context
  triggerCause: string
  impactAssessment: string
  businessImpact: 'minimal' | 'moderate' | 'significant' | 'critical'
  
  // Recommendations
  immediateActions: string[]
  strategicRecommendations: string[]
  estimatedResolutionTime: string
  
  // Tracking
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'false_positive'
  assignedTo?: string
  resolvedAt?: Date
  resolutionNotes?: string
}

// Reporting and Analytics

export interface CostingDashboardMetrics {
  location: string
  period: string
  generatedAt: Date
  
  // Overall performance
  totalRecipes: number
  totalVariants: number
  averageFoodCostPercentage: number
  overallProfitMargin: number
  
  // Cost trends
  costTrends: {
    period: string
    averageCost: number
    averageRevenue: number
    averageMargin: number
  }[]
  
  // Top performers
  topProfitableVariants: {
    recipeId: string
    recipeName: string
    variantId: string
    variantName: string
    profitMargin: number
    revenue: number
  }[]
  
  // Cost variance
  costVarianceAlerts: CostVarianceAlert[]
  
  // Waste analysis
  totalWasteValue: number
  wasteReductionOpportunity: number
  topWasteItems: {
    ingredientName: string
    wasteValue: number
    wastePercentage: number
  }[]
  
  // Pricing optimization
  pricingOpportunities: {
    recipeId: string
    variantId: string
    currentMargin: number
    optimizedMargin: number
    revenueImpact: number
  }[]
  
  // Market intelligence
  competitiveAlerts: {
    competitorName: string
    productName: string
    priceChange: number
    impactAssessment: string
  }[]
}

// All types are already exported individually above