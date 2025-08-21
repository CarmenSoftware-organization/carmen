/**
 * Enhanced Consumption Tracking Service
 * 
 * Advanced consumption tracking system that handles fractional sales with comprehensive
 * analytics, variance tracking, and real-time monitoring capabilities.
 */

import {
  ConsumptionPeriod,
  FractionalSalesTransaction,
  IngredientConsumptionRecord,
  RecipeConsumptionSummary,
  LocationConsumptionAnalytics,
  ConsumptionCalculationContext,
  RealTimeConsumptionMetrics,
  ConsumptionVarianceAnalysis,
  FractionalSalesEfficiencyReport,
  FractionalInventoryDeduction
} from '@/lib/types/enhanced-consumption-tracking'

import { Recipe, RecipeYieldVariant, Ingredient } from '@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes'
import { RecipeMapping } from '@/app/(main)/system-administration/system-integrations/pos/mapping/recipes/types'
import { FractionalStockDeductionService, POSTransaction } from './fractional-stock-deduction-service'

export class EnhancedConsumptionTrackingService {
  private fractionalStockService: FractionalStockDeductionService

  constructor() {
    this.fractionalStockService = new FractionalStockDeductionService()
  }

  /**
   * Calculate comprehensive consumption metrics for a given period
   */
  async calculatePeriodConsumption(
    context: ConsumptionCalculationContext
  ): Promise<{
    ingredientRecords: IngredientConsumptionRecord[]
    recipeSummaries: RecipeConsumptionSummary[]
    locationAnalytics: LocationConsumptionAnalytics
    varianceAnalysis: ConsumptionVarianceAnalysis
    efficiencyReport: FractionalSalesEfficiencyReport
  }> {
    
    // Step 1: Process all POS transactions for the period
    const processedTransactions = await this.processPOSTransactions(
      context.posTransactions,
      context.recipeMappings,
      context.recipeData
    )

    // Step 2: Calculate ingredient consumption records
    const ingredientRecords = await this.calculateIngredientConsumption(
      processedTransactions,
      context
    )

    // Step 3: Generate recipe consumption summaries
    const recipeSummaries = await this.generateRecipeSummaries(
      processedTransactions,
      ingredientRecords,
      context
    )

    // Step 4: Create location analytics
    const locationAnalytics = await this.generateLocationAnalytics(
      processedTransactions,
      ingredientRecords,
      recipeSummaries,
      context
    )

    // Step 5: Perform variance analysis
    const varianceAnalysis = await this.performVarianceAnalysis(
      ingredientRecords,
      recipeSummaries,
      context
    )

    // Step 6: Generate efficiency report
    const efficiencyReport = await this.generateEfficiencyReport(
      processedTransactions,
      recipeSummaries,
      context
    )

    return {
      ingredientRecords,
      recipeSummaries,
      locationAnalytics,
      varianceAnalysis,
      efficiencyReport
    }
  }

  /**
   * Process POS transactions and calculate detailed consumption data
   */
  private async processPOSTransactions(
    transactions: FractionalSalesTransaction[],
    mappings: RecipeMapping[],
    recipes: Recipe[]
  ): Promise<{
    processedTransactions: FractionalSalesTransaction[]
    deductionResults: any[]
    totalCost: number
    totalRevenue: number
  }> {
    
    const mappingLookup = new Map(mappings.map(m => [m.posItemCode, m]))
    const recipeLookup = new Map(recipes.map(r => [r.id, r]))
    
    const processedTransactions: FractionalSalesTransaction[] = []
    const deductionResults: any[] = []
    let totalCost = 0
    let totalRevenue = 0

    for (const transaction of transactions) {
      const mapping = mappingLookup.get(transaction.posItemCode)
      if (!mapping) continue

      const recipe = recipeLookup.get(mapping.recipeCode)
      if (!recipe) continue

      // Calculate cost using recipe data
      const variant = recipe.yieldVariants.find(v => v.id === transaction.variantId)
      if (!variant) continue

      // Enhance transaction with calculated data
      const enhancedTransaction: FractionalSalesTransaction = {
        ...transaction,
        baseRecipeId: recipe.id,
        baseRecipeName: recipe.name,
        conversionRate: variant.conversionRate,
        costPrice: variant.costPerUnit * transaction.quantitySold,
        grossProfit: transaction.salePrice - (variant.costPerUnit * transaction.quantitySold)
      }

      processedTransactions.push(enhancedTransaction)
      totalRevenue += transaction.salePrice
      totalCost += enhancedTransaction.costPrice
    }

    return {
      processedTransactions,
      deductionResults,
      totalCost,
      totalRevenue
    }
  }

  /**
   * Calculate detailed ingredient consumption records
   */
  private async calculateIngredientConsumption(
    transactions: FractionalSalesTransaction[],
    context: ConsumptionCalculationContext
  ): Promise<IngredientConsumptionRecord[]> {
    
    const ingredientConsumption = new Map<string, {
      ingredient: Ingredient
      theoretical: number
      actual: number
      transactions: string[]
      fractionalContribution: number
      wholeContribution: number
    }>()

    const recipeLookup = new Map(context.recipeData.map(r => [r.id, r]))

    // Process each transaction
    for (const transaction of transactions) {
      const recipe = recipeLookup.get(transaction.baseRecipeId)
      if (!recipe) continue

      const variant = recipe.yieldVariants.find(v => v.id === transaction.variantId)
      if (!variant) continue

      const baseRecipeQuantity = transaction.quantitySold * transaction.conversionRate

      // Process each ingredient in the recipe
      for (const ingredient of recipe.ingredients) {
        const key = ingredient.id
        const existing = ingredientConsumption.get(key) || {
          ingredient,
          theoretical: 0,
          actual: 0,
          transactions: [],
          fractionalContribution: 0,
          wholeContribution: 0
        }

        const ingredientTheoretical = ingredient.quantity * baseRecipeQuantity
        const ingredientActual = ingredientTheoretical * (1 + (ingredient.wastage || 0) / 100)
        
        existing.theoretical += ingredientTheoretical
        existing.actual += ingredientActual
        existing.transactions.push(transaction.id)
        
        // Track fractional vs whole contribution
        if (transaction.fractionalSalesType && transaction.conversionRate < 1.0) {
          existing.fractionalContribution += ingredientActual
        } else {
          existing.wholeContribution += ingredientActual
        }

        ingredientConsumption.set(key, existing)
      }
    }

    // Convert to IngredientConsumptionRecord format
    const records: IngredientConsumptionRecord[] = []
    
    for (const [ingredientId, data] of ingredientConsumption) {
      const quantityVariance = data.actual - data.theoretical
      const costVariance = quantityVariance * data.ingredient.costPerUnit
      const variancePercentage = data.theoretical > 0 ? 
        (quantityVariance / data.theoretical) * 100 : 0

      records.push({
        id: `${ingredientId}-${context.period.id}`,
        ingredientId,
        ingredientName: data.ingredient.name,
        ingredientType: data.ingredient.type,
        theoreticalQuantity: data.theoretical,
        theoreticalCost: data.theoretical * data.ingredient.costPerUnit,
        actualQuantity: data.actual,
        actualCost: data.actual * data.ingredient.costPerUnit,
        quantityVariance,
        costVariance,
        variancePercentage,
        recipeConsumption: data.actual,
        directConsumption: 0,
        wastage: quantityVariance > 0 ? quantityVariance : 0,
        spillage: 0,
        adjustment: 0,
        unit: data.ingredient.unit,
        location: context.location,
        period: context.period.id,
        calculatedAt: new Date(),
        fractionalContribution: data.fractionalContribution,
        wholeItemContribution: data.wholeContribution,
        transactionIds: data.transactions
      })
    }

    return records
  }

  /**
   * Generate recipe consumption summaries
   */
  private async generateRecipeSummaries(
    transactions: FractionalSalesTransaction[],
    ingredientRecords: IngredientConsumptionRecord[],
    context: ConsumptionCalculationContext
  ): Promise<RecipeConsumptionSummary[]> {
    
    const recipeSummaries = new Map<string, {
      recipe: Recipe
      transactions: FractionalSalesTransaction[]
      totalProduced: number
      variantSales: Map<string, {
        variant: RecipeYieldVariant
        transactions: FractionalSalesTransaction[]
      }>
    }>()

    const recipeLookup = new Map(context.recipeData.map(r => [r.id, r]))

    // Group transactions by recipe
    for (const transaction of transactions) {
      const recipe = recipeLookup.get(transaction.baseRecipeId)
      if (!recipe) continue

      const existing = recipeSummaries.get(recipe.id) || {
        recipe,
        transactions: [],
        totalProduced: 0,
        variantSales: new Map()
      }

      existing.transactions.push(transaction)
      existing.totalProduced += transaction.quantitySold * transaction.conversionRate

      // Group by variant
      const variant = recipe.yieldVariants.find(v => v.id === transaction.variantId)
      if (variant) {
        const variantData = existing.variantSales.get(variant.id) || {
          variant,
          transactions: []
        }
        variantData.transactions.push(transaction)
        existing.variantSales.set(variant.id, variantData)
      }

      recipeSummaries.set(recipe.id, existing)
    }

    // Convert to RecipeConsumptionSummary format
    const summaries: RecipeConsumptionSummary[] = []

    for (const [recipeId, data] of recipeSummaries) {
      const totalSold = data.transactions.reduce((sum, t) => sum + t.quantitySold, 0)
      const totalRevenue = data.transactions.reduce((sum, t) => sum + t.salePrice, 0)
      const totalCost = data.transactions.reduce((sum, t) => sum + t.costPrice, 0)

      // Calculate variant breakdown
      const variantSales = Array.from(data.variantSales.values()).map(variant => {
        const variantRevenue = variant.transactions.reduce((sum, t) => sum + t.salePrice, 0)
        const quantitySold = variant.transactions.reduce((sum, t) => sum + t.quantitySold, 0)
        const contributionToBase = quantitySold * variant.variant.conversionRate

        return {
          variantId: variant.variant.id,
          variantName: variant.variant.name,
          quantitySold,
          revenueGenerated: variantRevenue,
          conversionRate: variant.variant.conversionRate,
          contributionToBase
        }
      })

      // Calculate ingredient costs for this recipe
      const recipeIngredientCost = ingredientRecords
        .filter(record => 
          data.transactions.some(t => record.transactionIds.includes(t.id))
        )
        .reduce((sum, record) => sum + record.actualCost, 0)

      const fractionalSalesRevenue = data.transactions
        .filter(t => t.conversionRate < 1.0)
        .reduce((sum, t) => sum + t.salePrice, 0)

      const wholeSalesRevenue = totalRevenue - fractionalSalesRevenue
      const fractionalSalesPercentage = totalRevenue > 0 ? 
        (fractionalSalesRevenue / totalRevenue) * 100 : 0

      summaries.push({
        id: `${recipeId}-${context.period.id}`,
        recipeId,
        recipeName: data.recipe.name,
        totalProduced: data.totalProduced,
        totalSold,
        remainingInventory: 0, // Would need real inventory data
        variantSales,
        totalIngredientCost: recipeIngredientCost,
        totalLaborCost: recipeIngredientCost * (data.recipe.laborCostPercentage / 100),
        totalOverheadCost: recipeIngredientCost * (data.recipe.overheadPercentage / 100),
        totalCost,
        totalRevenue,
        grossProfit: totalRevenue - totalCost,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
        theoreticalIngredientCost: recipeIngredientCost, // Simplified
        actualIngredientCost: recipeIngredientCost,
        ingredientVariance: 0,
        wastageRate: 0, // Would calculate from ingredient records
        period: context.period.id,
        location: context.location,
        calculatedAt: new Date(),
        fractionalSalesRevenue,
        wholeSalesRevenue,
        fractionalSalesPercentage,
        yieldEfficiency: 100, // Would calculate based on actual vs expected
        conversionEfficiency: 100, // Would calculate based on successful conversions
        wasteReductionOpportunity: 0 // Would calculate based on waste analysis
      })
    }

    return summaries
  }

  /**
   * Generate location analytics
   */
  private async generateLocationAnalytics(
    transactions: FractionalSalesTransaction[],
    ingredientRecords: IngredientConsumptionRecord[],
    recipeSummaries: RecipeConsumptionSummary[],
    context: ConsumptionCalculationContext
  ): Promise<LocationConsumptionAnalytics> {
    
    const totalSales = transactions.reduce((sum, t) => sum + t.salePrice, 0)
    const totalCosts = transactions.reduce((sum, t) => sum + t.costPrice, 0)
    const grossProfit = totalSales - totalCosts
    const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0

    const totalIngredientConsumption = ingredientRecords.reduce((sum, r) => sum + r.actualCost, 0)
    const theoreticalConsumption = ingredientRecords.reduce((sum, r) => sum + r.theoreticalCost, 0)
    const consumptionVariance = totalIngredientConsumption - theoreticalConsumption
    const consumptionVariancePercentage = theoreticalConsumption > 0 ? 
      (consumptionVariance / theoreticalConsumption) * 100 : 0

    // Fractional sales metrics
    const fractionalTransactions = transactions.filter(t => t.conversionRate < 1.0)
    const fractionalRevenue = fractionalTransactions.reduce((sum, t) => sum + t.salePrice, 0)
    const fractionalATValue = fractionalTransactions.length > 0 ? 
      fractionalRevenue / fractionalTransactions.length : 0

    // Group variants by sales
    const variantSales = new Map<string, { name: string; quantity: number; revenue: number }>()
    fractionalTransactions.forEach(t => {
      const existing = variantSales.get(t.variantId) || { name: t.variantName, quantity: 0, revenue: 0 }
      existing.quantity += t.quantitySold
      existing.revenue += t.salePrice
      variantSales.set(t.variantId, existing)
    })

    const topSellingVariants = Array.from(variantSales.entries())
      .map(([variantId, data]) => ({
        variantId,
        variantName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate conversion rates by type
    const conversionRates = Array.from(
      transactions.reduce((acc, t) => {
        if (!t.fractionalSalesType) return acc
        const existing = acc.get(t.fractionalSalesType) || { total: 0, sum: 0 }
        existing.total += 1
        existing.sum += t.conversionRate
        acc.set(t.fractionalSalesType, existing)
        return acc
      }, new Map<string, { total: number; sum: number }>())
    ).map(([type, data]) => ({
      fractionalSalesType: type,
      averageConversionRate: data.sum / data.total,
      efficiency: (data.sum / data.total) * 100
    }))

    return {
      locationId: context.location,
      locationName: context.location,
      period: context.period.id,
      totalSales,
      totalCosts,
      grossProfit,
      profitMargin,
      totalIngredientConsumption,
      theoreticalConsumption,
      consumptionVariance,
      consumptionVariancePercentage,
      fractionalSalesMetrics: {
        totalTransactions: fractionalTransactions.length,
        totalRevenue: fractionalRevenue,
        averageTransactionValue: fractionalATValue,
        topSellingVariants,
        conversionRates
      },
      categoryPerformance: [], // Would implement based on ingredient categories
      trends: {
        consumptionTrend: 'stable',
        wasteTrend: 'stable', 
        profitabilityTrend: 'stable',
        fractionalSalesTrend: 'stable'
      },
      calculatedAt: new Date()
    }
  }

  /**
   * Perform comprehensive variance analysis
   */
  private async performVarianceAnalysis(
    ingredientRecords: IngredientConsumptionRecord[],
    recipeSummaries: RecipeConsumptionSummary[],
    context: ConsumptionCalculationContext
  ): Promise<ConsumptionVarianceAnalysis> {
    
    const totalTheoreticalCost = ingredientRecords.reduce((sum, r) => sum + r.theoreticalCost, 0)
    const totalActualCost = ingredientRecords.reduce((sum, r) => sum + r.actualCost, 0)
    const totalVariance = totalActualCost - totalTheoreticalCost
    const totalVariancePercentage = totalTheoreticalCost > 0 ? 
      (totalVariance / totalTheoreticalCost) * 100 : 0

    // Category variance analysis (simplified - would need category mapping)
    const categoryVariances = [{
      categoryName: 'All Ingredients',
      theoreticalCost: totalTheoreticalCost,
      actualCost: totalActualCost,
      variance: totalVariance,
      variancePercentage: totalVariancePercentage,
      contributionToTotal: 100,
      trend: 'stable' as const
    }]

    // Recipe variance analysis
    const recipeVariances = recipeSummaries.map(recipe => ({
      recipeId: recipe.recipeId,
      recipeName: recipe.recipeName,
      theoreticalCost: recipe.theoreticalIngredientCost,
      actualCost: recipe.actualIngredientCost,
      variance: recipe.ingredientVariance,
      variancePercentage: recipe.theoreticalIngredientCost > 0 ? 
        (recipe.ingredientVariance / recipe.theoreticalIngredientCost) * 100 : 0,
      productionCount: recipe.totalProduced,
      averageVariancePerUnit: recipe.totalProduced > 0 ? 
        recipe.ingredientVariance / recipe.totalProduced : 0
    }))

    // Variance drivers analysis
    const varianceDrivers = [{
      driver: 'wastage' as const,
      impact: totalVariance * 0.6, // Simplified assumption
      impactPercentage: 60,
      affectedItems: ingredientRecords.filter(r => r.wastage > 0).map(r => r.ingredientName),
      recommendedActions: [
        'Review portion control procedures',
        'Improve storage conditions',
        'Train staff on waste reduction'
      ]
    }]

    // Statistical analysis
    const variances = ingredientRecords.map(r => r.variancePercentage)
    const meanVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length
    const sortedVariances = [...variances].sort((a, b) => a - b)
    const medianVariance = sortedVariances[Math.floor(sortedVariances.length / 2)]
    const variance = variances.reduce((sum, v) => sum + Math.pow(v - meanVariance, 2), 0) / variances.length
    const standardDeviation = Math.sqrt(variance)

    const outliers = ingredientRecords
      .filter(r => Math.abs(r.variancePercentage - meanVariance) > standardDeviation * 2)
      .map(r => ({
        ingredientId: r.ingredientId,
        ingredientName: r.ingredientName,
        variance: r.variancePercentage,
        standardDeviations: Math.abs(r.variancePercentage - meanVariance) / standardDeviation
      }))

    return {
      period: context.period.id,
      location: context.location,
      analysisType: 'custom',
      totalTheoreticalCost,
      totalActualCost,
      totalVariance,
      totalVariancePercentage,
      categoryVariances,
      recipeVariances,
      varianceDrivers,
      statistics: {
        meanVariance,
        medianVariance,
        standardDeviation,
        confidenceInterval: {
          lower: meanVariance - 1.96 * standardDeviation,
          upper: meanVariance + 1.96 * standardDeviation,
          confidence: 95
        },
        outliers
      },
      calculatedAt: new Date()
    }
  }

  /**
   * Generate fractional sales efficiency report
   */
  private async generateEfficiencyReport(
    transactions: FractionalSalesTransaction[],
    recipeSummaries: RecipeConsumptionSummary[],
    context: ConsumptionCalculationContext
  ): Promise<FractionalSalesEfficiencyReport> {
    
    const fractionalTransactions = transactions.filter(t => t.conversionRate < 1.0)
    const totalFractionalRevenue = fractionalTransactions.reduce((sum, t) => sum + t.salePrice, 0)
    const averageFractionalTransactionValue = fractionalTransactions.length > 0 ? 
      totalFractionalRevenue / fractionalTransactions.length : 0

    // Group by fractional sales type
    const typeGroups = fractionalTransactions.reduce((acc, t) => {
      if (!t.fractionalSalesType) return acc
      
      const existing = acc.get(t.fractionalSalesType) || []
      existing.push(t)
      acc.set(t.fractionalSalesType, existing)
      return acc
    }, new Map<string, FractionalSalesTransaction[]>())

    const typeEfficiency = Array.from(typeGroups.entries()).map(([type, transactions]) => {
      const totalRevenue = transactions.reduce((sum, t) => sum + t.salePrice, 0)
      const totalCost = transactions.reduce((sum, t) => sum + t.costPrice, 0)
      const averageConversionRate = transactions.reduce((sum, t) => sum + t.conversionRate, 0) / transactions.length
      const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0

      // Group by recipe within type
      const recipeGroups = transactions.reduce((acc, t) => {
        const existing = acc.get(t.baseRecipeId) || []
        existing.push(t)
        acc.set(t.baseRecipeId, existing)
        return acc
      }, new Map<string, FractionalSalesTransaction[]>())

      const itemPerformance = Array.from(recipeGroups.entries()).map(([recipeId, recipeTransactions]) => {
        const recipe = context.recipeData.find(r => r.id === recipeId)
        if (!recipe) return null

        const variantGroups = recipeTransactions.reduce((acc, t) => {
          const existing = acc.get(t.variantId) || []
          existing.push(t)
          acc.set(t.variantId, existing)
          return acc
        }, new Map<string, FractionalSalesTransaction[]>())

        const variantsSold = Array.from(variantGroups.entries()).map(([variantId, variantTransactions]) => {
          const revenue = variantTransactions.reduce((sum, t) => sum + t.salePrice, 0)
          const cost = variantTransactions.reduce((sum, t) => sum + t.costPrice, 0)
          const quantity = variantTransactions.reduce((sum, t) => sum + t.quantitySold, 0)

          return {
            variantId,
            variantName: variantTransactions[0].variantName,
            quantitySold: quantity,
            revenue,
            costEfficiency: revenue > 0 ? cost / revenue : 0
          }
        })

        const totalBaseRecipesConsumed = recipeTransactions.reduce(
          (sum, t) => sum + (t.quantitySold * t.conversionRate), 0
        )
        const recipeRevenue = recipeTransactions.reduce((sum, t) => sum + t.salePrice, 0)

        return {
          recipeId,
          recipeName: recipe.name,
          variantsSold,
          totalBaseRecipesConsumed,
          revenuePerBaseRecipe: totalBaseRecipesConsumed > 0 ? recipeRevenue / totalBaseRecipesConsumed : 0,
          wastePerBaseRecipe: 0 // Would calculate based on waste data
        }
      }).filter(Boolean) as any[]

      return {
        fractionalSalesType: type as any,
        totalTransactions: transactions.length,
        totalRevenue,
        averageConversionRate,
        wasteRate: 0, // Would calculate based on waste data
        profitMargin,
        efficiency: averageConversionRate * profitMargin,
        itemPerformance
      }
    })

    // Optimization opportunities
    const optimizationOpportunities = [
      {
        opportunity: 'reduce_waste' as const,
        potentialImpact: totalFractionalRevenue * 0.05, // 5% potential improvement
        affectedItems: [...new Set(fractionalTransactions.map(t => t.itemName))],
        currentMetric: 5, // Current waste percentage
        targetMetric: 3, // Target waste percentage
        implementationComplexity: 'medium' as const,
        estimatedTimeToValue: '2-3 months'
      }
    ]

    // Trend analysis (simplified - would need historical data)
    const trends = [{
      period: context.period.id,
      fractionalSalesVolume: fractionalTransactions.length,
      fractionalSalesRevenue: totalFractionalRevenue,
      averageTransactionValue: averageFractionalTransactionValue,
      conversionEfficiency: 85, // Would calculate
      wasteRate: 5 // Would calculate
    }]

    return {
      period: context.period.id,
      location: context.location,
      totalFractionalTransactions: fractionalTransactions.length,
      totalFractionalRevenue,
      averageFractionalTransactionValue,
      fractionalSalesGrowthRate: 0, // Would calculate with historical data
      typeEfficiency,
      optimizationOpportunities,
      trends,
      calculatedAt: new Date()
    }
  }

  /**
   * Generate real-time consumption metrics
   */
  async generateRealTimeMetrics(
    location: string,
    currentInventory: Map<string, { quantity: number; unitCost: number }>
  ): Promise<RealTimeConsumptionMetrics> {
    
    const timestamp = new Date()
    
    // Mock real-time data - in production this would come from various sources
    const liveIngredientLevels = Array.from(currentInventory.entries()).map(([ingredientId, data]) => {
      const criticalLevel = 10 // Would be configurable per ingredient
      const reorderPoint = 25 // Would be configurable per ingredient
      
      let status: 'adequate' | 'low' | 'critical' | 'out_of_stock' = 'adequate'
      if (data.quantity === 0) status = 'out_of_stock'
      else if (data.quantity <= criticalLevel) status = 'critical'
      else if (data.quantity <= reorderPoint) status = 'low'

      // Estimate depletion date based on average consumption (simplified)
      const averageDailyConsumption = 5 // Would calculate from historical data
      const daysRemaining = data.quantity / averageDailyConsumption
      const projectedDepletion = daysRemaining > 0 ? 
        new Date(timestamp.getTime() + daysRemaining * 24 * 60 * 60 * 1000) : null

      return {
        ingredientId,
        ingredientName: `Ingredient ${ingredientId}`,
        currentLevel: data.quantity,
        projectedDepletion,
        reorderPoint,
        status
      }
    })

    // Generate alerts based on current conditions
    const alerts = liveIngredientLevels
      .filter(ingredient => ingredient.status !== 'adequate')
      .map(ingredient => ({
        type: ingredient.status === 'out_of_stock' ? 'stock_low' : 
              ingredient.status === 'critical' ? 'stock_low' : 'waste_warning',
        severity: ingredient.status === 'out_of_stock' ? 'critical' : 
                 ingredient.status === 'critical' ? 'warning' : 'info',
        message: `${ingredient.ingredientName} is ${ingredient.status}`,
        ingredientId: ingredient.ingredientId,
        currentValue: ingredient.currentLevel,
        threshold: ingredient.reorderPoint,
        recommendedAction: ingredient.status === 'out_of_stock' ? 
          'Order immediately' : 'Schedule reorder'
      })) as any[]

    return {
      timestamp,
      location,
      currentPeriodSales: 12500, // Would calculate from current period data
      currentPeriodCosts: 4200,
      currentPeriodProfit: 8300,
      todayTransactionCount: 145,
      todayFractionalSales: 89,
      todayWholeSales: 56,
      todayWastage: 125,
      liveIngredientLevels,
      kpis: {
        foodCostPercentage: 33.6,
        wastePercentage: 4.2,
        fractionalSalesConversionRate: 0.125,
        averageTransactionValue: 86.21,
        profitMargin: 66.4,
        yieldEfficiency: 94.5
      },
      alerts
    }
  }

  /**
   * Process fractional inventory deduction for a single transaction
   */
  async processFractionalDeduction(
    transaction: FractionalSalesTransaction,
    recipe: Recipe,
    mapping: RecipeMapping,
    currentInventory: Map<string, number>
  ): Promise<FractionalInventoryDeduction> {
    
    const variant = recipe.yieldVariants.find(v => v.id === transaction.variantId)
    if (!variant) {
      throw new Error(`Variant ${transaction.variantId} not found in recipe ${recipe.id}`)
    }

    const baseRecipeQuantityUsed = transaction.quantitySold * transaction.conversionRate
    const baseRecipeCost = baseRecipeQuantityUsed * recipe.costPerPortion

    // Calculate ingredient deductions
    const ingredientDeductions = recipe.ingredients.map(ingredient => {
      const theoreticalQuantity = ingredient.quantity * baseRecipeQuantityUsed
      const wastageQuantity = theoreticalQuantity * ((ingredient.wastage || 0) / 100)
      const actualQuantityDeducted = theoreticalQuantity + wastageQuantity
      const costImpact = actualQuantityDeducted * ingredient.costPerUnit
      
      const currentLevel = currentInventory.get(ingredient.id) || 0
      const newInventoryLevel = Math.max(0, currentLevel - actualQuantityDeducted)
      
      let stockStatus: 'adequate' | 'low' | 'critical' = 'adequate'
      if (newInventoryLevel <= 10) stockStatus = 'critical'
      else if (newInventoryLevel <= 25) stockStatus = 'low'

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        theoreticalQuantity,
        actualQuantityDeducted,
        wastageQuantity,
        costImpact,
        newInventoryLevel,
        stockStatus
      }
    })

    // For prepared items (simplified - would need prepared item inventory)
    const preparedItemDeductions = [{
      preparedItemId: `${recipe.id}-prepared`,
      quantityUsed: transaction.conversionRate,
      remainingQuantity: 1 - transaction.conversionRate,
      shelfLifeRemaining: variant.shelfLife || 24,
      disposalRisk: (1 - transaction.conversionRate) * 0.1 // Simplified risk calculation
    }]

    return {
      deductionId: `deduction-${transaction.id}`,
      transactionId: transaction.id,
      recipeId: recipe.id,
      variantId: transaction.variantId,
      baseRecipeQuantityUsed,
      baseRecipeCost,
      ingredientDeductions,
      preparedItemDeductions,
      timestamp: new Date(),
      location: transaction.location,
      processedBy: 'system',
      validationStatus: 'validated'
    }
  }
}

export { EnhancedConsumptionTrackingService }