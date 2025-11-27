/**
 * Enhanced Costing Engine Service
 * 
 * Provides sophisticated cost calculation algorithms for portion-based pricing,
 * dynamic pricing optimization, and profitability analysis for fractional sales.
 */

import { Recipe, RecipeYieldVariant, Ingredient } from "@/lib/types"
import { 
  FractionalSalesTransaction, 
  ConsumptionPeriod, 
  RealTimeConsumptionMetrics 
} from "@/lib/types/enhanced-consumption-tracking"
import {
  PortionCostingContext,
  IngredientCostDetail,
  OverheadCostFactors,
  PortionCostBreakdown,
  DynamicPricingResult,
  PricingOptimizationRequest,
  VariantProfitabilityAnalysis,
  CostVarianceAlert,
  DemandAnalytics,
  WasteAnalytics
} from "@/lib/types/enhanced-costing-engine"

export class EnhancedCostingEngine {
  
  /**
   * Calculate comprehensive cost breakdown for a recipe variant
   */
  async calculatePortionCost(
    recipe: Recipe,
    variant: RecipeYieldVariant,
    context: PortionCostingContext
  ): Promise<PortionCostBreakdown> {
    
    // Calculate ingredient costs with waste factors
    const ingredientCostDetails = await this.calculateIngredientCosts(
      recipe.ingredients,
      variant,
      context
    )
    
    // Calculate labor costs based on preparation complexity
    const laborCosts = await this.calculateLaborCosts(
      recipe,
      variant,
      context.overheadFactors
    )
    
    // Calculate overhead allocation
    const overheadCosts = await this.calculateOverheadCosts(
      variant,
      context.overheadFactors,
      ingredientCostDetails.totalIngredientCost
    )
    
    // Calculate waste and loss costs
    const wasteCosts = await this.calculateWasteCosts(
      variant,
      context.wastePatterns,
      ingredientCostDetails.totalIngredientCost
    )
    
    // Calculate base recipe conversion
    const baseRecipeUnitsUsed = variant.conversionRate || (variant.quantity / recipe.yield)
    
    const breakdown: PortionCostBreakdown = {
      recipeId: recipe.id,
      recipeName: recipe.name,
      variantId: variant.id,
      variantName: variant.name,
      portionSize: `${variant.quantity} ${variant.unit}`,
      calculatedAt: new Date(),
      
      // Ingredient costs
      ingredientCost: ingredientCostDetails.totalIngredientCost,
      ingredientCostPerGram: ingredientCostDetails.costPerGram,
      
      // Labor costs
      preparationLaborCost: laborCosts.preparationCost,
      cookingLaborCost: laborCosts.cookingCost,
      serviceLaborCost: laborCosts.serviceCost,
      totalLaborCost: laborCosts.totalLaborCost,
      
      // Overhead costs
      utilitiesCost: overheadCosts.utilitiesCost,
      equipmentCost: overheadCosts.equipmentCost,
      facilityCost: overheadCosts.facilityCost,
      packagingCost: overheadCosts.packagingCost,
      totalOverheadCost: overheadCosts.totalOverheadCost,
      
      // Waste and loss
      wasteCost: wasteCosts.wasteCost,
      spillageCost: wasteCosts.spillageCost,
      spoilageCost: wasteCosts.spoilageCost,
      totalLossCost: wasteCosts.totalLossCost,
      
      // Total calculations
      directCost: ingredientCostDetails.totalIngredientCost + laborCosts.totalLaborCost,
      indirectCost: overheadCosts.totalOverheadCost + wasteCosts.totalLossCost,
      totalCost: 0, // Will be calculated below
      
      // Base recipe metrics
      baseRecipeUnitsUsed,
      costPerBaseUnit: 0, // Will be calculated below
      
      // Quality metrics
      costAccuracy: this.calculateCostAccuracy(ingredientCostDetails, context),
      lastUpdated: new Date(),
      priceValidUntil: this.calculatePriceValidityDate(ingredientCostDetails)
    }
    
    // Calculate totals
    breakdown.totalCost = breakdown.directCost + breakdown.indirectCost
    breakdown.costPerBaseUnit = breakdown.totalCost / baseRecipeUnitsUsed
    
    return breakdown
  }
  
  /**
   * Calculate detailed ingredient costs with quality and seasonal factors
   */
  private async calculateIngredientCosts(
    ingredients: Ingredient[],
    variant: RecipeYieldVariant,
    context: PortionCostingContext
  ): Promise<{ totalIngredientCost: number, costPerGram: number, details: any[] }> {
    
    let totalCost = 0
    let totalWeight = 0
    const details = []
    
    for (const ingredient of ingredients) {
      // Find cost detail from context
      const costDetail = context.ingredientCosts.find(ic => ic.ingredientId === ingredient.id)
      if (!costDetail) {
        continue
      }
      
      // Calculate adjusted quantity for variant
      const variantQuantity = ingredient.quantity * (variant.conversionRate || 1)
      
      // Apply quality and seasonal factors
      let adjustedUnitCost = costDetail.unitCost
      adjustedUnitCost *= costDetail.seasonalityFactor
      
      // Apply quality grade premium/discount
      const qualityMultiplier = this.getQualityMultiplier(costDetail.qualityGrade)
      adjustedUnitCost *= qualityMultiplier
      
      // Calculate waste-adjusted quantity
      const wasteAdjustedQuantity = variantQuantity * (1 + costDetail.totalWastePercentage / 100)
      
      // Calculate total ingredient cost
      const ingredientTotalCost = wasteAdjustedQuantity * adjustedUnitCost
      
      totalCost += ingredientTotalCost
      totalWeight += wasteAdjustedQuantity // Assuming all ingredients measured in same unit
      
      details.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        baseQuantity: ingredient.quantity,
        variantQuantity,
        wasteAdjustedQuantity,
        unitCost: adjustedUnitCost,
        totalCost: ingredientTotalCost,
        qualityImpact: qualityMultiplier - 1,
        seasonalImpact: costDetail.seasonalityFactor - 1,
        wasteImpact: costDetail.totalWastePercentage
      })
    }
    
    return {
      totalIngredientCost: totalCost,
      costPerGram: totalWeight > 0 ? totalCost / totalWeight : 0,
      details
    }
  }
  
  /**
   * Calculate labor costs based on recipe complexity and variant requirements
   */
  private async calculateLaborCosts(
    recipe: Recipe,
    variant: RecipeYieldVariant,
    overheadFactors: OverheadCostFactors
  ): Promise<{
    preparationCost: number
    cookingCost: number
    serviceCost: number
    totalLaborCost: number
  }> {
    
    // Base time estimates (in minutes)
    const basePreparationTime = recipe.prepTime || 30
    const baseCookingTime = recipe.cookTime || 45
    const baseServiceTime = 3 // Average service time per portion
    
    // Apply variant-specific time adjustments
    const variantTimeMultiplier = 1 // Default complexity multiplier
    const variantPreparationTime = basePreparationTime * variantTimeMultiplier
    const variantCookingTime = baseCookingTime * variantTimeMultiplier
    const variantServiceTime = baseServiceTime
    
    // Calculate portion-specific time (for fractional servings)
    const portionMultiplier = variant.conversionRate || 1
    const portionPreparationTime = variantPreparationTime * portionMultiplier
    const portionCookingTime = variantCookingTime * portionMultiplier
    const portionServiceTime = variantServiceTime * portionMultiplier
    
    // Apply skill level multiplier
    const skillMultiplier = overheadFactors.skillLevelMultiplier
    
    // Calculate costs
    const preparationCost = portionPreparationTime * overheadFactors.preparationLaborRate * skillMultiplier
    const cookingCost = portionCookingTime * overheadFactors.cookingLaborRate * skillMultiplier
    const serviceCost = portionServiceTime * overheadFactors.serviceLaborRate
    
    return {
      preparationCost,
      cookingCost,
      serviceCost,
      totalLaborCost: preparationCost + cookingCost + serviceCost
    }
  }
  
  /**
   * Calculate overhead costs allocated to this portion
   */
  private async calculateOverheadCosts(
    variant: RecipeYieldVariant,
    overheadFactors: OverheadCostFactors,
    ingredientCost: number
  ): Promise<{
    utilitiesCost: number
    equipmentCost: number
    facilityCost: number
    packagingCost: number
    totalOverheadCost: number
  }> {
    
    const portionMultiplier = variant.conversionRate || 1
    const complexityMultiplier = 1 // Default complexity multiplier
    
    // Calculate utility costs  
    const cookingTime = 45 * complexityMultiplier // Default cooking time
    const utilitiesCost = (
      cookingTime * overheadFactors.energyCostPerMinute +
      overheadFactors.waterCostPerUnit * portionMultiplier +
      overheadFactors.gasCostPerUnit * portionMultiplier
    )
    
    // Equipment and facility costs
    const equipmentCost = overheadFactors.equipmentDepreciation * complexityMultiplier
    const facilityCost = overheadFactors.facilityOverhead * portionMultiplier
    
    // Packaging and presentation
    const packagingCost = (
      overheadFactors.packagingCost +
      overheadFactors.presentationCost +
      overheadFactors.disposableCost
    ) * portionMultiplier
    
    // Business overhead (percentage of ingredient cost)
    const businessOverheadRate = 0.15 // 15% of ingredient cost
    const businessOverheadCost = ingredientCost * businessOverheadRate
    
    const totalOverheadCost = utilitiesCost + equipmentCost + facilityCost + 
                              packagingCost + businessOverheadCost
    
    return {
      utilitiesCost,
      equipmentCost,
      facilityCost,
      packagingCost,
      totalOverheadCost
    }
  }
  
  /**
   * Calculate waste and loss costs
   */
  private async calculateWasteCosts(
    variant: RecipeYieldVariant,
    wastePatterns: WasteAnalytics,
    ingredientCost: number
  ): Promise<{
    wasteCost: number
    spillageCost: number
    spoilageCost: number
    totalLossCost: number
  }> {
    
    // Get variant-specific waste data
    const variantWaste = wastePatterns.variantWaste.find(vw => vw.variantId === variant.id)
    const wastePercentage = variantWaste ? variantWaste.wastePercentage : wastePatterns.totalWastePercentage
    
    // Calculate different types of waste costs
    const wasteCost = ingredientCost * (wastePercentage / 100)
    
    // Spillage is typically 1-2% of ingredient cost
    const spillageRate = 0.015 // 1.5%
    const spillageCost = ingredientCost * spillageRate
    
    // Spoilage varies by ingredient shelf life (calculated from ingredient cost details)
    const spoilageRate = 0.005 // 0.5%
    const spoilageCost = ingredientCost * spoilageRate
    
    return {
      wasteCost,
      spillageCost,
      spoilageCost,
      totalLossCost: wasteCost + spillageCost + spoilageCost
    }
  }
  
  /**
   * Generate dynamic pricing recommendations based on multiple factors
   */
  async generateDynamicPricing(
    recipe: Recipe,
    variant: RecipeYieldVariant,
    costBreakdown: PortionCostBreakdown,
    pricingRequest: PricingOptimizationRequest
  ): Promise<DynamicPricingResult> {
    
    // Get current market conditions
    const demandElasticity = await this.calculateDemandElasticity(recipe.id, variant.id)
    const competitivePressure = await this.analyzeCompetitivePressure(pricingRequest.competitiveContext)
    
    // Calculate optimal price based on objectives
    const optimalPrice = await this.optimizePrice(
      costBreakdown,
      pricingRequest,
      demandElasticity,
      competitivePressure
    )
    
    // Analyze volume impact
    const volumeImpact = await this.predictVolumeImpact(
      variant.sellingPrice?.amount || 0,
      optimalPrice.recommendedPrice,
      demandElasticity
    )
    
    // Calculate risk factors
    const riskFactors = await this.assessPricingRisks(
      optimalPrice.recommendedPrice,
      costBreakdown,
      pricingRequest
    )
    
    return {
      recipeId: recipe.id,
      variantId: variant.id,
      optimizationId: `opt_${Date.now()}`,
      calculatedAt: new Date(),
      
      currentPrice: variant.sellingPrice?.amount || 0,
      recommendedPrice: optimalPrice.recommendedPrice,
      priceChange: optimalPrice.recommendedPrice - (variant.sellingPrice?.amount || 0),
      priceChangePercentage: variant.sellingPrice?.amount ?
        ((optimalPrice.recommendedPrice - variant.sellingPrice.amount) / variant.sellingPrice.amount) * 100 : 0,
      
      projectedMargin: optimalPrice.recommendedPrice - costBreakdown.totalCost,
      projectedMarginPercentage: ((optimalPrice.recommendedPrice - costBreakdown.totalCost) / optimalPrice.recommendedPrice) * 100,
      projectedRevenue: volumeImpact.projectedVolume * optimalPrice.recommendedPrice,
      projectedProfit: volumeImpact.projectedVolume * (optimalPrice.recommendedPrice - costBreakdown.totalCost),
      
      currentVolume: volumeImpact.currentVolume,
      projectedVolume: volumeImpact.projectedVolume,
      volumeChange: volumeImpact.projectedVolume - volumeImpact.currentVolume,
      volumeChangePercentage: volumeImpact.currentVolume ? 
        ((volumeImpact.projectedVolume - volumeImpact.currentVolume) / volumeImpact.currentVolume) * 100 : 0,
      
      competitivePosition: this.determineCompetitivePosition(optimalPrice.recommendedPrice, pricingRequest.competitiveContext),
      pricePerceptile: this.calculatePricePercentile(optimalPrice.recommendedPrice, pricingRequest.competitiveContext),
      
      riskFactors,
      
      implementationPriority: this.determineImplementationPriority(optimalPrice, riskFactors),
      implementationComplexity: 'moderate',
      expectedPaybackPeriod: this.calculatePaybackPeriod(optimalPrice, volumeImpact),
      
      alternativeScenarios: await this.generateAlternativeScenarios(
        costBreakdown,
        optimalPrice.recommendedPrice,
        demandElasticity
      )
    }
  }
  
  /**
   * Perform comprehensive profitability analysis across all variants
   */
  async analyzeVariantProfitability(
    recipe: Recipe,
    salesTransactions: FractionalSalesTransaction[],
    period: string
  ): Promise<VariantProfitabilityAnalysis> {
    
    // Filter transactions for this recipe and period
    const recipeTransactions = salesTransactions.filter(t => t.baseRecipeId === recipe.id)
    
    // Calculate overall metrics
    const totalRevenue = recipeTransactions.reduce((sum, t) => sum + t.salePrice, 0)
    const totalCost = recipeTransactions.reduce((sum, t) => sum + t.costPrice, 0)
    const totalProfit = totalRevenue - totalCost
    const averageMarginPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    
    // Analyze each variant
    const variantPerformance = []
    
    for (const variant of recipe.yieldVariants) {
      const variantTransactions = recipeTransactions.filter(t => t.variantId === variant.id)
      
      if (variantTransactions.length === 0) {
        continue
      }
      
      // Calculate variant metrics
      const variantRevenue = variantTransactions.reduce((sum, t) => sum + t.salePrice, 0)
      const variantCost = variantTransactions.reduce((sum, t) => sum + t.costPrice, 0)
      const variantProfit = variantRevenue - variantCost
      const variantMargin = variantRevenue > 0 ? (variantProfit / variantRevenue) * 100 : 0
      
      // Calculate efficiency metrics
      const preparationTime = recipe.prepTime || 30
      const revenuePerMinute = variantRevenue / preparationTime
      
      // Calculate strategic value
      const strategicValue = await this.calculateStrategicValue(variant, variantTransactions)
      
      // Determine performance rating and recommendations
      const performanceRating = this.categorizeVariantPerformance(
        variantMargin,
        variantTransactions.length,
        strategicValue
      )
      
      variantPerformance.push({
        variantId: variant.id,
        variantName: variant.name,
        portionSize: `${variant.quantity} ${variant.unit}`,
        
        unitsSold: variantTransactions.length,
        salesFrequency: variantTransactions.length / 30, // Assuming 30-day period
        marketShareWithinRecipe: totalRevenue > 0 ? (variantRevenue / totalRevenue) * 100 : 0,
        
        sellingPrice: variantTransactions.length > 0 ? 
          variantRevenue / variantTransactions.length : 0,
        totalCost: variantCost / variantTransactions.length,
        unitProfit: (variantRevenue - variantCost) / variantTransactions.length,
        marginPercentage: variantMargin,
        totalRevenue: variantRevenue,
        totalProfitContribution: variantProfit,
        
        revenuePerMinute,
        profitPerGramIngredient: 0, // Would calculate based on ingredient weights
        costEfficiencyRank: 0, // Would rank against other variants
        
        strategicValue,
        customerSatisfactionImpact: this.estimateCustomerSatisfactionImpact(variant),
        brandImageImpact: this.estimateBrandImageImpact(variant, variantMargin),
        crossSellingPotential: this.estimateCrossSellingPotential(variant),
        
        performanceRating,
        recommendedAction: this.getRecommendedAction(performanceRating, variantMargin),
        optimizationOpportunities: await this.identifyOptimizationOpportunities(variant, variantTransactions)
      })
    }
    
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      analysisDate: new Date(),
      analysisPeriod: period,
      
      totalRevenue,
      totalCost,
      totalProfit,
      averageMarginPercentage,
      
      variantPerformance,
      
      // Cross-variant analysis would be implemented here
      cannibalizedSales: [],
      complementaryEffects: []
    }
  }
  
  /**
   * Generate cost variance alerts based on thresholds and patterns
   */
  async generateCostVarianceAlerts(
    costBreakdowns: PortionCostBreakdown[],
    historicalData: any[],
    thresholds: any
  ): Promise<CostVarianceAlert[]> {
    
    const alerts: CostVarianceAlert[] = []
    
    for (const breakdown of costBreakdowns) {
      // Check for cost increases
      const historicalCost = this.getHistoricalAverageCost(breakdown.recipeId, breakdown.variantId, historicalData)
      
      if (historicalCost && breakdown.totalCost > historicalCost * (1 + thresholds.costIncreaseThreshold)) {
        alerts.push({
          alertId: `cost_inc_${breakdown.recipeId}_${breakdown.variantId}_${Date.now()}`,
          recipeId: breakdown.recipeId,
          recipeName: breakdown.recipeName,
          variantId: breakdown.variantId,
          variantName: breakdown.variantName,
          location: 'default',
          
          alertType: 'cost_increase',
          severity: this.calculateAlertSeverity(breakdown.totalCost, historicalCost, thresholds.costIncreaseThreshold),
          triggeredAt: new Date(),
          
          currentValue: breakdown.totalCost,
          expectedValue: historicalCost,
          variance: breakdown.totalCost - historicalCost,
          variancePercentage: ((breakdown.totalCost - historicalCost) / historicalCost) * 100,
          threshold: thresholds.costIncreaseThreshold * 100,
          
          triggerCause: 'Cost increase detected above threshold',
          impactAssessment: this.assessCostImpact(breakdown.totalCost - historicalCost),
          businessImpact: this.categorizeBusinessImpact(breakdown.totalCost - historicalCost),
          
          immediateActions: [
            'Review ingredient pricing',
            'Check waste percentages',
            'Validate labor cost calculations'
          ],
          strategicRecommendations: [
            'Consider recipe optimization',
            'Evaluate supplier alternatives',
            'Review portion sizes'
          ],
          estimatedResolutionTime: '2-5 business days',
          
          status: 'new'
        })
      }
    }
    
    return alerts
  }
  
  // Helper methods
  
  private getQualityMultiplier(grade: string): number {
    switch (grade) {
      case 'premium': return 1.3
      case 'standard': return 1.0
      case 'economy': return 0.8
      default: return 1.0
    }
  }
  
  private calculateCostAccuracy(ingredientDetails: any, context: PortionCostingContext): number {
    // Factor in data freshness, price volatility, and waste estimation accuracy
    let accuracy = 0.95 // Base accuracy
    
    // Reduce accuracy based on price volatility
    const avgVolatility = context.ingredientCosts.reduce((sum, ic) => sum + ic.priceVolatility, 0) / 
                         context.ingredientCosts.length
    accuracy -= avgVolatility * 0.1
    
    // Factor in waste estimation confidence
    const wasteConfidence = 0.85 // Assume 85% confidence in waste estimates
    accuracy = accuracy * wasteConfidence
    
    return Math.max(0.5, Math.min(1.0, accuracy))
  }
  
  private calculatePriceValidityDate(ingredientDetails: any): Date {
    // Price valid until the earliest ingredient price expires
    const validityDate = new Date()
    validityDate.setDate(validityDate.getDate() + 7) // Default 7 days
    return validityDate
  }
  
  private async calculateDemandElasticity(recipeId: string, variantId: string): Promise<number> {
    // Mock implementation - would analyze historical sales data
    return -1.2 // Typical food service elasticity
  }
  
  private async analyzeCompetitivePressure(competitiveContext: any): Promise<number> {
    // Analyze competitive pricing pressure
    return 0.7 // Scale of 0-1, where 1 is high pressure
  }
  
  private async optimizePrice(
    costBreakdown: PortionCostBreakdown,
    pricingRequest: PricingOptimizationRequest,
    demandElasticity: number,
    competitivePressure: number
  ): Promise<{ recommendedPrice: number }> {
    
    // Start with cost-plus pricing
    const minMarginConstraint = pricingRequest.constraints.find(c => c.type === 'min_margin_percentage')
    const minMargin = minMarginConstraint ? minMarginConstraint.value / 100 : 0.3 // 30% default
    
    let recommendedPrice = costBreakdown.totalCost / (1 - minMargin)
    
    // Adjust for competitive pressure
    if (competitivePressure > 0.7) {
      recommendedPrice *= 0.95 // Reduce price in high competition
    }
    
    // Apply constraints
    for (const constraint of pricingRequest.constraints) {
      switch (constraint.type) {
        case 'max_price_point':
          recommendedPrice = Math.min(recommendedPrice, constraint.value)
          break
        case 'min_price_point':
          recommendedPrice = Math.max(recommendedPrice, constraint.value)
          break
      }
    }
    
    return { recommendedPrice }
  }
  
  private async predictVolumeImpact(
    currentPrice: number,
    newPrice: number,
    demandElasticity: number
  ): Promise<{ currentVolume: number, projectedVolume: number }> {
    
    // Mock current volume
    const currentVolume = 100
    
    if (currentPrice <= 0) {
      return { currentVolume, projectedVolume: currentVolume }
    }
    
    // Calculate volume change using elasticity
    const priceChangePercentage = (newPrice - currentPrice) / currentPrice
    const volumeChangePercentage = demandElasticity * priceChangePercentage
    const projectedVolume = currentVolume * (1 + volumeChangePercentage)
    
    return {
      currentVolume,
      projectedVolume: Math.max(0, projectedVolume)
    }
  }
  
  private async assessPricingRisks(
    recommendedPrice: number,
    costBreakdown: PortionCostBreakdown,
    pricingRequest: PricingOptimizationRequest
  ): Promise<any[]> {
    
    const risks = []
    
    // Margin risk
    const margin = (recommendedPrice - costBreakdown.totalCost) / recommendedPrice
    if (margin < 0.2) {
      risks.push({
        factor: 'Low margin risk',
        probability: 0.7,
        impact: -0.5,
        mitigation: 'Monitor costs closely and consider portion size adjustment'
      })
    }
    
    // Competitive risk
    const competitivePrices = pricingRequest.competitiveContext.directCompetitors.map(c => c.price)
    const avgCompetitorPrice = competitivePrices.reduce((a, b) => a + b, 0) / competitivePrices.length
    
    if (recommendedPrice > avgCompetitorPrice * 1.15) {
      risks.push({
        factor: 'Premium pricing risk',
        probability: 0.5,
        impact: -0.3,
        mitigation: 'Emphasize quality and unique value proposition'
      })
    }
    
    return risks
  }
  
  private determineCompetitivePosition(price: number, competitiveContext: any): 'premium' | 'mid_market' | 'value' {
    const competitorPrices = competitiveContext.directCompetitors.map((c: any) => c.price)
    const avgPrice = competitorPrices.reduce((a: number, b: number) => a + b, 0) / competitorPrices.length
    
    if (price > avgPrice * 1.2) return 'premium'
    if (price < avgPrice * 0.8) return 'value'
    return 'mid_market'
  }
  
  private calculatePricePercentile(price: number, competitiveContext: any): number {
    const competitorPrices = competitiveContext.directCompetitors.map((c: any) => c.price).sort((a: number, b: number) => a - b)
    const position = competitorPrices.findIndex((p: number) => p >= price)
    return position >= 0 ? (position / competitorPrices.length) * 100 : 100
  }
  
  private determineImplementationPriority(optimalPrice: any, riskFactors: any[]): 'immediate' | 'within_week' | 'within_month' | 'future_consideration' {
    const highRiskCount = riskFactors.filter(r => Math.abs(r.impact) > 0.5).length
    
    if (highRiskCount > 2) return 'future_consideration'
    if (highRiskCount > 1) return 'within_month'
    if (Math.abs(optimalPrice.priceChangePercentage) > 10) return 'within_week'
    return 'immediate'
  }
  
  private calculatePaybackPeriod(optimalPrice: any, volumeImpact: any): number {
    // Simple payback calculation in days
    return 30 // Mock implementation
  }
  
  private async generateAlternativeScenarios(
    costBreakdown: PortionCostBreakdown,
    recommendedPrice: number,
    demandElasticity: number
  ): Promise<any[]> {
    
    const scenarios = []
    
    // Conservative scenario (5% price increase)
    const conservativePrice = recommendedPrice * 0.95
    scenarios.push({
      scenario: 'Conservative',
      price: conservativePrice,
      projectedOutcome: {
        margin: (conservativePrice - costBreakdown.totalCost) / conservativePrice * 100,
        volume: 100, // Mock
        revenue: 100 * conservativePrice,
        riskScore: 0.2
      }
    })
    
    // Aggressive scenario (10% price increase)
    const aggressivePrice = recommendedPrice * 1.1
    scenarios.push({
      scenario: 'Aggressive',
      price: aggressivePrice,
      projectedOutcome: {
        margin: (aggressivePrice - costBreakdown.totalCost) / aggressivePrice * 100,
        volume: 85, // Mock - reduced due to higher price
        revenue: 85 * aggressivePrice,
        riskScore: 0.6
      }
    })
    
    return scenarios
  }
  
  private async calculateStrategicValue(variant: RecipeYieldVariant, transactions: any[]): Promise<number> {
    // Mock strategic value calculation based on multiple factors
    let value = 0.5 // Base value
    
    // Factor in sales consistency
    const salesConsistency = this.calculateSalesConsistency(transactions)
    value += salesConsistency * 0.3
    
    // Factor in profit margin
    const avgProfit = transactions.reduce((sum, t) => sum + (t.salePrice - t.costPrice), 0) / transactions.length
    if (avgProfit > 0) {
      value += Math.min(0.3, avgProfit / 10) // Normalize profit impact
    }
    
    return Math.min(1.0, value)
  }
  
  private calculateSalesConsistency(transactions: any[]): number {
    if (transactions.length < 2) return 0
    
    // Calculate coefficient of variation for sales
    const sales = transactions.map((t: any) => t.quantitySold)
    const mean = sales.reduce((a: number, b: number) => a + b, 0) / sales.length
    const variance = sales.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / sales.length
    const stdDev = Math.sqrt(variance)
    const cv = stdDev / mean
    
    // Lower CV means higher consistency
    return Math.max(0, 1 - cv)
  }
  
  private categorizeVariantPerformance(
    margin: number,
    salesVolume: number,
    strategicValue: number
  ): 'star' | 'solid' | 'question' | 'dog' {
    
    if (margin > 30 && salesVolume > 50) return 'star'
    if (margin > 20 && salesVolume > 30) return 'solid'
    if (strategicValue > 0.7 || margin > 25) return 'question'
    return 'dog'
  }
  
  private estimateCustomerSatisfactionImpact(variant: RecipeYieldVariant): number {
    // Mock calculation based on portion size, quality, etc.
    return 0.7 // 70% positive impact
  }
  
  private estimateBrandImageImpact(variant: RecipeYieldVariant, margin: number): number {
    // Higher margin items often contribute more to brand image
    return Math.min(1.0, margin / 50) // Normalize to 50% margin
  }
  
  private estimateCrossSellingPotential(variant: RecipeYieldVariant): number {
    // Mock calculation based on variant characteristics
    return 0.5
  }
  
  private getRecommendedAction(
    performance: 'star' | 'solid' | 'question' | 'dog',
    margin: number
  ): 'promote' | 'optimize' | 'maintain' | 'consider_removal' {
    
    switch (performance) {
      case 'star': return 'promote'
      case 'solid': return 'maintain'
      case 'question': return margin > 20 ? 'optimize' : 'consider_removal'
      case 'dog': return 'consider_removal'
    }
  }
  
  private async identifyOptimizationOpportunities(variant: RecipeYieldVariant, transactions: any[]): Promise<any[]> {
    const opportunities = []
    
    // Cost reduction opportunity
    opportunities.push({
      opportunity: 'Ingredient cost optimization',
      potentialImpact: 0.15, // 15% cost reduction potential
      implementationCost: 500,
      timeToRealize: 30 // days
    })
    
    // Portion size optimization
    opportunities.push({
      opportunity: 'Portion size adjustment',
      potentialImpact: 0.10, // 10% margin improvement
      implementationCost: 200,
      timeToRealize: 14 // days
    })
    
    return opportunities
  }
  
  private getHistoricalAverageCost(recipeId: string, variantId: string, historicalData: any[]): number | null {
    // Mock implementation - would query historical cost data
    return 8.50 // Mock historical average cost
  }
  
  private calculateAlertSeverity(currentCost: number, historicalCost: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const increasePercentage = ((currentCost - historicalCost) / historicalCost)
    
    if (increasePercentage > threshold * 2) return 'critical'
    if (increasePercentage > threshold * 1.5) return 'high'
    if (increasePercentage > threshold) return 'medium'
    return 'low'
  }
  
  private assessCostImpact(costIncrease: number): string {
    if (costIncrease > 2) return 'Significant cost increase affecting profitability'
    if (costIncrease > 1) return 'Moderate cost increase requiring attention'
    return 'Minor cost increase within acceptable range'
  }
  
  private categorizeBusinessImpact(costIncrease: number): 'minimal' | 'moderate' | 'significant' | 'critical' {
    if (costIncrease > 3) return 'critical'
    if (costIncrease > 2) return 'significant'
    if (costIncrease > 1) return 'moderate'
    return 'minimal'
  }
}

export const enhancedCostingEngine = new EnhancedCostingEngine()