/**
 * Profitability Analysis Service
 * 
 * Advanced profitability analysis for portion-based pricing with
 * cross-variant analysis, strategic recommendations, and performance optimization.
 */

import {
  Recipe,
  RecipeYieldVariant
} from "@/lib/types"
import {
  FractionalSalesTransaction,
  ConsumptionPeriod,
  RecipeConsumptionSummary
} from "@/lib/types/enhanced-consumption-tracking"
import {
  VariantProfitabilityAnalysis,
  PortionCostBreakdown,
  DynamicPricingResult
} from "@/lib/types/enhanced-costing-engine"

interface ProfitabilityMetrics {
  grossMargin: number
  contributionMargin: number
  operatingMargin: number
  netMargin: number
  returnOnInvestment: number
  paybackPeriod: number
}

interface StrategicRecommendation {
  type: 'promote' | 'optimize' | 'maintain' | 'discontinue' | 'reposition'
  priority: 'high' | 'medium' | 'low'
  description: string
  expectedImpact: number
  implementationCost: number
  timeframe: string
  riskLevel: 'low' | 'medium' | 'high'
}

interface CrossVariantAnalysis {
  cannibalizedSales: {
    fromVariantId: string
    toVariantId: string
    impactPercentage: number
    revenueImpact: number
  }[]
  complementaryEffects: {
    variantId1: string
    variantId2: string
    synergyEffect: number
    combinedOrderFrequency: number
  }[]
  substitutionPatterns: {
    primaryVariant: string
    substituteVariant: string
    substitutionRate: number
    priceElasticity: number
  }[]
}

interface PerformanceSegmentation {
  stars: string[] // High margin, high volume
  cashCows: string[] // High margin, stable volume
  questionMarks: string[] // Low margin, high potential
  dogs: string[] // Low margin, low volume
}

export class ProfitabilityAnalysisService {
  
  /**
   * Perform comprehensive profitability analysis for all recipe variants
   */
  async analyzeRecipeProfitability(
    recipe: Recipe,
    salesTransactions: FractionalSalesTransaction[],
    costBreakdowns: PortionCostBreakdown[],
    period: string
  ): Promise<VariantProfitabilityAnalysis> {
    
    // Filter transactions for this recipe
    const recipeTransactions = salesTransactions.filter(t => t.baseRecipeId === recipe.id)
    
    // Calculate overall recipe performance
    const totalRevenue = recipeTransactions.reduce((sum, t) => sum + t.salePrice, 0)
    const totalCost = recipeTransactions.reduce((sum, t) => sum + t.costPrice, 0)
    const totalProfit = totalRevenue - totalCost
    const averageMarginPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    
    // Analyze each variant
    const variantPerformance = []
    
    for (const variant of recipe.yieldVariants) {
      const variantAnalysis = await this.analyzeVariantPerformance(
        recipe,
        variant,
        recipeTransactions,
        costBreakdowns,
        period
      )
      
      if (variantAnalysis) {
        variantPerformance.push(variantAnalysis)
      }
    }
    
    // Perform cross-variant analysis
    const crossVariantAnalysis = await this.analyzeCrossVariantEffects(
      recipe,
      recipeTransactions,
      variantPerformance
    )
    
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
      
      cannibalizedSales: crossVariantAnalysis.cannibalizedSales,
      complementaryEffects: crossVariantAnalysis.complementaryEffects
    }
  }
  
  /**
   * Analyze individual variant performance with strategic insights
   */
  private async analyzeVariantPerformance(
    recipe: Recipe,
    variant: RecipeYieldVariant,
    recipeTransactions: FractionalSalesTransaction[],
    costBreakdowns: PortionCostBreakdown[],
    period: string
  ) {
    
    // Filter transactions for this variant
    const variantTransactions = recipeTransactions.filter(t => t.variantId === variant.id)
    
    if (variantTransactions.length === 0) {
      return null
    }
    
    // Get cost breakdown for this variant
    const costBreakdown = costBreakdowns.find(cb => 
      cb.recipeId === recipe.id && cb.variantId === variant.id
    )
    
    if (!costBreakdown) {
      return null
    }
    
    // Calculate basic financial metrics
    const variantRevenue = variantTransactions.reduce((sum, t) => sum + t.salePrice, 0)
    const variantCost = variantTransactions.reduce((sum, t) => sum + t.costPrice, 0)
    const variantProfit = variantRevenue - variantCost
    const marginPercentage = variantRevenue > 0 ? (variantProfit / variantRevenue) * 100 : 0
    
    // Calculate volume metrics
    const unitsSold = variantTransactions.length
    const averageSellingPrice = variantRevenue / unitsSold
    const unitProfit = variantProfit / unitsSold
    
    // Calculate efficiency metrics
    const preparationTime = recipe.prepTime || 30
    const revenuePerMinute = variantRevenue / preparationTime
    const profitPerMinute = variantProfit / preparationTime
    
    // Calculate market share within recipe
    const totalRecipeRevenue = recipeTransactions.reduce((sum, t) => sum + t.salePrice, 0)
    const marketShareWithinRecipe = totalRecipeRevenue > 0 ? (variantRevenue / totalRecipeRevenue) * 100 : 0
    
    // Calculate advanced profitability metrics
    const profitabilityMetrics = await this.calculateProfitabilityMetrics(
      variant,
      variantTransactions,
      costBreakdown
    )
    
    // Calculate strategic value
    const strategicValue = await this.calculateStrategicValue(
      variant,
      variantTransactions,
      profitabilityMetrics
    )
    
    // Determine performance rating (BCG Matrix style)
    const performanceRating = this.categorizeVariantPerformance(
      marginPercentage,
      unitsSold,
      strategicValue,
      marketShareWithinRecipe
    )
    
    // Generate optimization opportunities
    const optimizationOpportunities = await this.identifyOptimizationOpportunities(
      variant,
      variantTransactions,
      costBreakdown,
      profitabilityMetrics
    )
    
    // Generate strategic recommendations
    const recommendedAction = this.getStrategicRecommendation(
      performanceRating,
      marginPercentage,
      strategicValue,
      profitabilityMetrics
    )
    
    return {
      variantId: variant.id,
      variantName: variant.name,
      portionSize: `${variant.quantity} ${variant.unit}`,
      
      // Volume metrics
      unitsSold,
      salesFrequency: unitsSold / 30, // Assuming 30-day period
      marketShareWithinRecipe,
      
      // Financial metrics
      sellingPrice: averageSellingPrice,
      totalCost: costBreakdown.totalCost,
      unitProfit,
      marginPercentage,
      totalRevenue: variantRevenue,
      totalProfitContribution: variantProfit,
      
      // Efficiency metrics
      revenuePerMinute,
      profitPerGramIngredient: this.calculateProfitPerGram(variantProfit, costBreakdown),
      costEfficiencyRank: 0, // Will be calculated when comparing all variants
      
      // Strategic metrics
      strategicValue,
      customerSatisfactionImpact: await this.estimateCustomerSatisfactionImpact(variant, variantTransactions),
      brandImageImpact: await this.estimateBrandImageImpact(variant, marginPercentage),
      crossSellingPotential: await this.estimateCrossSellingPotential(variant, variantTransactions),
      
      // Performance indicators
      performanceRating,
      recommendedAction,
      optimizationOpportunities
    }
  }
  
  /**
   * Calculate comprehensive profitability metrics
   */
  private async calculateProfitabilityMetrics(
    variant: RecipeYieldVariant,
    transactions: FractionalSalesTransaction[],
    costBreakdown: PortionCostBreakdown
  ): Promise<ProfitabilityMetrics> {
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.salePrice, 0)
    const totalCost = transactions.reduce((sum, t) => sum + t.costPrice, 0)
    const grossProfit = totalRevenue - costBreakdown.ingredientCost * transactions.length
    const contributionProfit = totalRevenue - costBreakdown.directCost * transactions.length
    const operatingProfit = totalRevenue - totalCost
    
    // Calculate margins
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const contributionMargin = totalRevenue > 0 ? (contributionProfit / totalRevenue) * 100 : 0
    const operatingMargin = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0
    const netMargin = operatingMargin // Simplified - would include taxes, interest, etc.
    
    // Calculate investment metrics
    const initialInvestment = this.estimateInitialInvestment(variant)
    const returnOnInvestment = initialInvestment > 0 ? (operatingProfit / initialInvestment) * 100 : 0
    const paybackPeriod = operatingProfit > 0 ? initialInvestment / (operatingProfit / 30) : Infinity // Days
    
    return {
      grossMargin,
      contributionMargin,
      operatingMargin,
      netMargin,
      returnOnInvestment,
      paybackPeriod: Math.min(paybackPeriod, 365) // Cap at 1 year
    }
  }
  
  /**
   * Analyze cross-variant effects like cannibalization and complementarity
   */
  private async analyzeCrossVariantEffects(
    recipe: Recipe,
    transactions: FractionalSalesTransaction[],
    variantPerformance: any[]
  ): Promise<CrossVariantAnalysis> {
    
    const cannibalizedSales: {
      fromVariantId: string
      toVariantId: string
      impactPercentage: number
      revenueImpact: number
    }[] = []
    const complementaryEffects: {
      variantId1: string
      variantId2: string
      synergyEffect: number
      combinedOrderFrequency: number
    }[] = []
    const substitutionPatterns: {
      primaryVariant: string
      substituteVariant: string
      substitutionRate: number
      priceElasticity: number
    }[] = []
    
    // Analyze cannibalization between variants
    for (let i = 0; i < variantPerformance.length; i++) {
      for (let j = i + 1; j < variantPerformance.length; j++) {
        const variant1 = variantPerformance[i]
        const variant2 = variantPerformance[j]
        
        // Calculate potential cannibalization
        const cannibalization = await this.calculateCannibalizationEffect(
          variant1,
          variant2,
          transactions
        )
        
        if (cannibalization.impactPercentage > 5) { // >5% impact threshold
          cannibalizedSales.push(cannibalization)
        }
        
        // Calculate complementary effects
        const complementarity = await this.calculateComplementaryEffect(
          variant1,
          variant2,
          transactions
        )
        
        if (complementarity.synergyEffect > 0.1) { // >10% synergy threshold
          complementaryEffects.push(complementarity)
        }
      }
    }
    
    return {
      cannibalizedSales,
      complementaryEffects,
      substitutionPatterns
    }
  }
  
  /**
   * Segment variants into performance categories (BCG Matrix)
   */
  async segmentVariantPerformance(
    variantPerformance: any[]
  ): Promise<PerformanceSegmentation> {
    
    // Calculate thresholds
    const avgMargin = variantPerformance.reduce((sum, v) => sum + v.marginPercentage, 0) / variantPerformance.length
    const avgVolume = variantPerformance.reduce((sum, v) => sum + v.unitsSold, 0) / variantPerformance.length
    
    const stars = []
    const cashCows = []
    const questionMarks = []
    const dogs = []
    
    for (const variant of variantPerformance) {
      const highMargin = variant.marginPercentage > avgMargin
      const highVolume = variant.unitsSold > avgVolume
      const highStrategic = variant.strategicValue > 0.7
      
      if (highMargin && highVolume) {
        stars.push(variant.variantId)
      } else if (highMargin && !highVolume) {
        cashCows.push(variant.variantId)
      } else if (!highMargin && (highVolume || highStrategic)) {
        questionMarks.push(variant.variantId)
      } else {
        dogs.push(variant.variantId)
      }
    }
    
    return {
      stars,
      cashCows,
      questionMarks,
      dogs
    }
  }
  
  /**
   * Generate strategic recommendations for variant portfolio
   */
  async generateStrategicRecommendations(
    analysis: VariantProfitabilityAnalysis,
    segmentation: PerformanceSegmentation
  ): Promise<StrategicRecommendation[]> {
    
    const recommendations: StrategicRecommendation[] = []
    
    // Recommendations for Stars
    for (const starId of segmentation.stars) {
      const variant = analysis.variantPerformance.find(v => v.variantId === starId)
      if (variant) {
        recommendations.push({
          type: 'promote',
          priority: 'high',
          description: `Invest in marketing and capacity for ${variant.variantName} - high margin and volume performer`,
          expectedImpact: variant.totalProfitContribution * 0.2, // 20% increase potential
          implementationCost: 1000,
          timeframe: '1-2 months',
          riskLevel: 'low'
        })
      }
    }
    
    // Recommendations for Question Marks
    for (const questionId of segmentation.questionMarks) {
      const variant = analysis.variantPerformance.find(v => v.variantId === questionId)
      if (variant) {
        recommendations.push({
          type: 'optimize',
          priority: 'medium',
          description: `Optimize pricing and positioning for ${variant.variantName} to improve profitability`,
          expectedImpact: variant.totalRevenue * 0.15, // 15% margin improvement potential
          implementationCost: 500,
          timeframe: '2-4 weeks',
          riskLevel: 'medium'
        })
      }
    }
    
    // Recommendations for Dogs
    for (const dogId of segmentation.dogs) {
      const variant = analysis.variantPerformance.find(v => v.variantId === dogId)
      if (variant && variant.strategicValue < 0.3) {
        recommendations.push({
          type: 'discontinue',
          priority: 'medium',
          description: `Consider discontinuing ${variant.variantName} due to poor performance`,
          expectedImpact: -variant.totalCost, // Cost savings
          implementationCost: 200,
          timeframe: '1-2 weeks',
          riskLevel: 'low'
        })
      }
    }
    
    return recommendations
  }
  
  // Helper methods
  
  private calculateStrategicValue(
    variant: RecipeYieldVariant,
    transactions: FractionalSalesTransaction[],
    metrics: ProfitabilityMetrics
  ): Promise<number> {
    // Strategic value based on multiple factors
    let value = 0.5 // Base value
    
    // Factor in profitability
    if (metrics.operatingMargin > 40) value += 0.2
    else if (metrics.operatingMargin > 25) value += 0.1
    
    // Factor in growth potential
    const salesConsistency = this.calculateSalesConsistency(transactions)
    value += salesConsistency * 0.2
    
    // Factor in uniqueness/differentiation
    const uniquenessFactor = this.assessUniqueness(variant)
    value += uniquenessFactor * 0.1
    
    return Promise.resolve(Math.min(1.0, Math.max(0, value)))
  }
  
  private calculateSalesConsistency(transactions: FractionalSalesTransaction[]): number {
    if (transactions.length < 3) return 0.5
    
    // Calculate coefficient of variation for daily sales
    const dailySales = new Map<string, number>()
    
    transactions.forEach(t => {
      const date = t.timestamp.toDateString()
      dailySales.set(date, (dailySales.get(date) || 0) + 1)
    })
    
    const sales = Array.from(dailySales.values())
    const mean = sales.reduce((a, b) => a + b, 0) / sales.length
    const variance = sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length
    const stdDev = Math.sqrt(variance)
    const cv = stdDev / mean
    
    // Lower coefficient of variation = higher consistency
    return Math.max(0, Math.min(1, 1 - cv))
  }
  
  private assessUniqueness(variant: RecipeYieldVariant): number {
    // Mock assessment - in real implementation would analyze market data
    // Factors: unique ingredients, preparation method, presentation, etc.
    return 0.6 // 60% uniqueness
  }
  
  private categorizeVariantPerformance(
    margin: number,
    volume: number,
    strategicValue: number,
    marketShare: number
  ): 'star' | 'solid' | 'question' | 'dog' {
    
    if (margin > 40 && volume > 50 && marketShare > 20) return 'star'
    if (margin > 30 && (volume > 30 || strategicValue > 0.7)) return 'solid'
    if (strategicValue > 0.6 || margin > 35 || volume > 40) return 'question'
    return 'dog'
  }
  
  private async identifyOptimizationOpportunities(
    variant: RecipeYieldVariant,
    transactions: FractionalSalesTransaction[],
    costBreakdown: PortionCostBreakdown,
    metrics: ProfitabilityMetrics
  ): Promise<any[]> {
    
    const opportunities = []
    
    // Cost optimization opportunity
    if (costBreakdown.totalLossCost > costBreakdown.totalCost * 0.1) {
      opportunities.push({
        opportunity: 'Waste reduction program',
        potentialImpact: costBreakdown.totalLossCost * 0.5, // 50% waste reduction
        implementationCost: 500,
        timeToRealize: 60 // days
      })
    }
    
    // Pricing optimization opportunity
    if (metrics.operatingMargin < 35) {
      opportunities.push({
        opportunity: 'Price optimization',
        potentialImpact: transactions.reduce((sum, t) => sum + t.salePrice, 0) * 0.1, // 10% revenue increase
        implementationCost: 200,
        timeToRealize: 14 // days
      })
    }
    
    // Portion size optimization
    if (variant.quantity && variant.conversionRate) {
      opportunities.push({
        opportunity: 'Portion size adjustment',
        potentialImpact: costBreakdown.ingredientCost * 0.05, // 5% ingredient savings
        implementationCost: 100,
        timeToRealize: 7 // days
      })
    }
    
    return opportunities
  }
  
  private getStrategicRecommendation(
    performance: 'star' | 'solid' | 'question' | 'dog',
    margin: number,
    strategicValue: number,
    metrics: ProfitabilityMetrics
  ): 'promote' | 'optimize' | 'maintain' | 'consider_removal' {
    
    switch (performance) {
      case 'star':
        return 'promote'
      case 'solid':
        return 'maintain'
      case 'question':
        return margin > 20 || strategicValue > 0.6 ? 'optimize' : 'consider_removal'
      case 'dog':
        return strategicValue > 0.5 ? 'optimize' : 'consider_removal'
    }
  }
  
  private calculateProfitPerGram(profit: number, costBreakdown: PortionCostBreakdown): number {
    // Estimate weight from ingredient cost (rough approximation)
    const estimatedWeight = costBreakdown.ingredientCost / costBreakdown.ingredientCostPerGram
    return estimatedWeight > 0 ? profit / estimatedWeight : 0
  }
  
  private async estimateCustomerSatisfactionImpact(
    variant: RecipeYieldVariant,
    transactions: FractionalSalesTransaction[]
  ): Promise<number> {
    // Mock calculation - in real implementation would integrate with customer feedback
    const avgSalesPerDay = transactions.length / 30
    const repeatCustomerRate = 0.7 // Mock 70% repeat rate
    
    // Higher sales and repeat rates indicate higher satisfaction
    return Math.min(1.0, (avgSalesPerDay * repeatCustomerRate) / 10)
  }
  
  private async estimateBrandImageImpact(
    variant: RecipeYieldVariant,
    margin: number
  ): Promise<number> {
    // Higher margin items often contribute more to brand image
    const marginFactor = Math.min(1.0, margin / 50) // Normalize to 50% margin
    
    // Premium variants typically have higher brand impact
    const premiumFactor = variant.name.toLowerCase().includes('premium') ? 1.2 : 1.0
    
    return Math.min(1.0, marginFactor * premiumFactor)
  }
  
  private async estimateCrossSellingPotential(
    variant: RecipeYieldVariant,
    transactions: FractionalSalesTransaction[]
  ): Promise<number> {
    // Mock calculation based on transaction patterns
    // Would analyze actual cross-selling data in real implementation
    const portionSize = variant.name || ''
    
    // Smaller portions typically have higher cross-selling potential
    if (portionSize.toLowerCase().includes('slice') || portionSize.toLowerCase().includes('half')) {
      return 0.8
    } else if (portionSize.toLowerCase().includes('full') || portionSize.toLowerCase().includes('whole')) {
      return 0.3
    }
    
    return 0.5 // Default
  }
  
  private async calculateCannibalizationEffect(
    variant1: any,
    variant2: any,
    transactions: FractionalSalesTransaction[]
  ): Promise<any> {
    // Analyze if variants compete for same customers
    // Mock implementation - would analyze actual customer ordering patterns
    
    const sizeDiff = this.comparePortionSizes(variant1.portionSize, variant2.portionSize)
    const priceDiff = Math.abs(variant1.sellingPrice - variant2.sellingPrice)
    
    // Higher cannibalization if similar size and price
    let impactPercentage = 0
    if (sizeDiff < 0.3 && priceDiff < 2.0) {
      impactPercentage = 15 // 15% cannibalization
    }
    
    return {
      fromVariantId: variant1.variantId,
      toVariantId: variant2.variantId,
      impactPercentage,
      revenueImpact: variant1.totalRevenue * (impactPercentage / 100)
    }
  }
  
  private async calculateComplementaryEffect(
    variant1: any,
    variant2: any,
    transactions: FractionalSalesTransaction[]
  ): Promise<any> {
    // Analyze if variants are often ordered together
    // Mock implementation - would analyze actual order combinations
    
    const sizeDiff = this.comparePortionSizes(variant1.portionSize, variant2.portionSize)
    
    // Complementary if different sizes (e.g., main + side, large + small)
    let synergyEffect = 0
    if (sizeDiff > 0.5) {
      synergyEffect = 0.2 // 20% positive synergy
    }
    
    return {
      variantId1: variant1.variantId,
      variantId2: variant2.variantId,
      synergyEffect,
      combinedOrderFrequency: synergyEffect * 50 // Mock frequency
    }
  }
  
  private comparePortionSizes(size1: string, size2: string): number {
    // Mock comparison - would implement actual size comparison logic
    const sizeMap = {
      'slice': 0.125,
      'half': 0.5,
      'full': 1.0,
      'large': 1.2,
      'small': 0.8
    }
    
    const value1 = this.extractSizeValue(size1, sizeMap)
    const value2 = this.extractSizeValue(size2, sizeMap)
    
    return Math.abs(value1 - value2)
  }
  
  private extractSizeValue(sizeString: string, sizeMap: any): number {
    const lowerSize = sizeString.toLowerCase()
    
    for (const [key, value] of Object.entries(sizeMap)) {
      if (lowerSize.includes(key)) {
        return value as number
      }
    }
    
    return 1.0 // Default
  }
  
  private estimateInitialInvestment(variant: RecipeYieldVariant): number {
    // Mock calculation for recipe development and setup costs
    const baseInvestment = 2000 // Base recipe development cost
    // Infer complexity from conversion rate - smaller portions may need more setup
    const complexityMultiplier = variant.conversionRate < 0.5 ? 1.5 : 1.0
    
    return baseInvestment * complexityMultiplier
  }
}

export const profitabilityAnalysisService = new ProfitabilityAnalysisService()