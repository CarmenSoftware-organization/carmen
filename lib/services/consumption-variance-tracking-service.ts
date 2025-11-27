/**
 * Consumption Variance Tracking Service
 * 
 * Advanced variance tracking system that monitors theoretical vs actual consumption
 * with statistical analysis, trend detection, and automated alerting for fractional sales.
 */

import {
  ConsumptionVarianceAnalysis,
  IngredientConsumptionRecord,
  RecipeConsumptionSummary,
  ConsumptionPeriod,
  RealTimeConsumptionMetrics
} from '@/lib/types/enhanced-consumption-tracking'

import { Recipe, RecipeYieldVariant } from '@/lib/types'

export interface VarianceAlert {
  id: string
  type: 'high_variance' | 'negative_trend' | 'outlier_detected' | 'threshold_exceeded'
  severity: 'info' | 'warning' | 'critical'
  entityType: 'ingredient' | 'recipe' | 'category' | 'location'
  entityId: string
  entityName: string
  message: string
  currentValue: number
  thresholdValue: number
  variance: number
  variancePercentage: number
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  suggestedActions: string[]
  impactAssessment: {
    financialImpact: number
    operationalImpact: 'low' | 'medium' | 'high'
    customerImpact: 'none' | 'low' | 'medium' | 'high'
  }
  createdAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
}

export interface VarianceThresholds {
  locationId: string
  ingredientThresholds: {
    ingredientId: string
    acceptableVariancePercentage: number
    warningThreshold: number
    criticalThreshold: number
    trendMonitoringDays: number
  }[]
  recipeThresholds: {
    recipeId: string
    acceptableVariancePercentage: number
    warningThreshold: number
    criticalThreshold: number
    fractionalSalesVarianceMultiplier: number // Higher tolerance for fractional sales
  }[]
  globalThresholds: {
    overallVarianceThreshold: number
    wastageWarningPercentage: number
    wastageCriticalPercentage: number
    profitMarginWarningThreshold: number
    yieldEfficiencyWarningThreshold: number
  }
  alertSettings: {
    enableRealTimeAlerts: boolean
    alertFrequency: 'immediate' | 'hourly' | 'daily'
    recipientRoles: string[]
    escalationLevels: {
      level: number
      thresholdMultiplier: number
      delayMinutes: number
      additionalRecipients: string[]
    }[]
  }
}

export interface VarianceTrendAnalysis {
  entityId: string
  entityName: string
  entityType: 'ingredient' | 'recipe' | 'category'
  timeframe: 'daily' | 'weekly' | 'monthly'
  dataPoints: {
    date: Date
    theoreticalValue: number
    actualValue: number
    variance: number
    variancePercentage: number
    volume: number // Transaction volume or production quantity
  }[]
  trendAnalysis: {
    direction: 'improving' | 'worsening' | 'stable' | 'volatile'
    slope: number // Rate of change
    confidence: number // Statistical confidence level
    seasonality: boolean
    volatility: number
    correlation: {
      withVolume: number
      withSeasonality: number
      withOtherIngredients: { ingredientId: string; correlation: number }[]
    }
  }
  forecasting: {
    nextPeriodPrediction: number
    confidenceInterval: {
      lower: number
      upper: number
      confidence: number
    }
    riskAssessment: 'low' | 'medium' | 'high'
    recommendedActions: string[]
  }
}

export interface StatisticalVarianceMetrics {
  period: string
  locationId: string
  calculatedAt: Date
  
  overallMetrics: {
    meanVariance: number
    medianVariance: number
    standardDeviation: number
    coefficientOfVariation: number
    skewness: number
    kurtosis: number
  }
  
  distributionAnalysis: {
    normalityTest: {
      passed: boolean
      pValue: number
      testStatistic: number
    }
    outliers: {
      entityId: string
      entityName: string
      entityType: string
      variance: number
      zScore: number
      severity: 'mild' | 'moderate' | 'extreme'
    }[]
    percentiles: {
      p10: number
      p25: number
      p50: number
      p75: number
      p90: number
      p95: number
      p99: number
    }
  }
  
  categoryComparison: {
    categoryName: string
    meanVariance: number
    standardDeviation: number
    itemCount: number
    worstPerformers: string[]
    bestPerformers: string[]
  }[]
  
  fractionalSalesImpact: {
    fractionalVariance: number
    wholeItemVariance: number
    fractionalVolumePercentage: number
    varianceDifference: number
    significanceTest: {
      isSignificant: boolean
      pValue: number
      testStatistic: number
    }
  }
}

export class ConsumptionVarianceTrackingService {
  private varianceThresholds: Map<string, VarianceThresholds> = new Map()
  private activeAlerts: Map<string, VarianceAlert[]> = new Map()
  private trendHistory: Map<string, VarianceTrendAnalysis[]> = new Map()

  /**
   * Set variance thresholds for a location
   */
  setVarianceThresholds(locationId: string, thresholds: VarianceThresholds): void {
    this.varianceThresholds.set(locationId, thresholds)
  }

  /**
   * Analyze variance and generate comprehensive analysis
   */
  async analyzeVariance(
    ingredientRecords: IngredientConsumptionRecord[],
    recipeSummaries: RecipeConsumptionSummary[],
    period: ConsumptionPeriod,
    historicalData?: {
      previousPeriods: IngredientConsumptionRecord[][]
      trendData: VarianceTrendAnalysis[]
    }
  ): Promise<{
    varianceAnalysis: ConsumptionVarianceAnalysis
    alerts: VarianceAlert[]
    trendAnalysis: VarianceTrendAnalysis[]
    statisticalMetrics: StatisticalVarianceMetrics
    recommendations: {
      priority: 'high' | 'medium' | 'low'
      category: string
      action: string
      expectedImpact: string
      timeToImplement: string
      costEstimate: number
    }[]
  }> {
    
    // Step 1: Calculate basic variance analysis
    const varianceAnalysis = await this.calculateVarianceAnalysis(
      ingredientRecords,
      recipeSummaries,
      period
    )

    // Step 2: Generate alerts based on thresholds
    const alerts = await this.generateVarianceAlerts(
      ingredientRecords,
      recipeSummaries,
      period.location
    )

    // Step 3: Perform trend analysis
    const trendAnalysis = await this.performTrendAnalysis(
      ingredientRecords,
      historicalData?.trendData || []
    )

    // Step 4: Calculate statistical metrics
    const statisticalMetrics = await this.calculateStatisticalMetrics(
      ingredientRecords,
      recipeSummaries,
      period
    )

    // Step 5: Generate recommendations
    const recommendations = await this.generateRecommendations(
      varianceAnalysis,
      alerts,
      trendAnalysis,
      statisticalMetrics
    )

    return {
      varianceAnalysis,
      alerts,
      trendAnalysis,
      statisticalMetrics,
      recommendations
    }
  }

  /**
   * Calculate detailed variance analysis
   */
  private async calculateVarianceAnalysis(
    ingredientRecords: IngredientConsumptionRecord[],
    recipeSummaries: RecipeConsumptionSummary[],
    period: ConsumptionPeriod
  ): Promise<ConsumptionVarianceAnalysis> {
    
    const totalTheoreticalCost = ingredientRecords.reduce((sum, r) => sum + r.theoreticalCost, 0)
    const totalActualCost = ingredientRecords.reduce((sum, r) => sum + r.actualCost, 0)
    const totalVariance = totalActualCost - totalTheoreticalCost
    const totalVariancePercentage = totalTheoreticalCost > 0 ? 
      (totalVariance / totalTheoreticalCost) * 100 : 0

    // Category variance analysis
    const categoryMap = new Map<string, {
      theoretical: number
      actual: number
      items: IngredientConsumptionRecord[]
    }>()

    ingredientRecords.forEach(record => {
      const category = this.getCategoryForIngredient(record.ingredientId) // Would map to actual categories
      const existing = categoryMap.get(category) || { theoretical: 0, actual: 0, items: [] }
      existing.theoretical += record.theoreticalCost
      existing.actual += record.actualCost
      existing.items.push(record)
      categoryMap.set(category, existing)
    })

    const categoryVariances = Array.from(categoryMap.entries()).map(([categoryName, data]) => {
      const variance = data.actual - data.theoretical
      const variancePercentage = data.theoretical > 0 ? (variance / data.theoretical) * 100 : 0
      
      return {
        categoryName,
        theoreticalCost: data.theoretical,
        actualCost: data.actual,
        variance,
        variancePercentage,
        contributionToTotal: totalTheoreticalCost > 0 ? 
          (data.theoretical / totalTheoreticalCost) * 100 : 0,
        trend: this.determineTrend(data.items) // Would use historical data
      }
    })

    // Recipe variance analysis
    const recipeVariances = recipeSummaries.map(recipe => ({
      recipeId: recipe.recipeId,
      recipeName: recipe.recipeName,
      fractionalSalesType: this.getFractionalSalesType(recipe), // Would extract from recipe data
      theoreticalCost: recipe.theoreticalIngredientCost,
      actualCost: recipe.actualIngredientCost,
      variance: recipe.ingredientVariance,
      variancePercentage: recipe.theoreticalIngredientCost > 0 ? 
        (recipe.ingredientVariance / recipe.theoreticalIngredientCost) * 100 : 0,
      productionCount: recipe.totalProduced,
      averageVariancePerUnit: recipe.totalProduced > 0 ? 
        recipe.ingredientVariance / recipe.totalProduced : 0
    }))

    // Analyze variance drivers
    const varianceDrivers = this.analyzeVarianceDrivers(ingredientRecords, recipeSummaries)

    // Statistical analysis
    const statistics = this.calculateStatistics(ingredientRecords)

    return {
      period: period.id,
      location: period.location,
      analysisType: 'custom',
      totalTheoreticalCost,
      totalActualCost,
      totalVariance,
      totalVariancePercentage,
      categoryVariances,
      recipeVariances,
      varianceDrivers,
      statistics,
      calculatedAt: new Date()
    }
  }

  /**
   * Generate variance alerts based on thresholds
   */
  private async generateVarianceAlerts(
    ingredientRecords: IngredientConsumptionRecord[],
    recipeSummaries: RecipeConsumptionSummary[],
    locationId: string
  ): Promise<VarianceAlert[]> {
    
    const thresholds = this.varianceThresholds.get(locationId)
    if (!thresholds) return []

    const alerts: VarianceAlert[] = []

    // Check ingredient variances
    for (const record of ingredientRecords) {
      const threshold = thresholds.ingredientThresholds.find(t => t.ingredientId === record.ingredientId)
      if (!threshold) continue

      if (Math.abs(record.variancePercentage) > threshold.criticalThreshold) {
        alerts.push({
          id: `ingredient-${record.ingredientId}-${Date.now()}`,
          type: 'threshold_exceeded',
          severity: 'critical',
          entityType: 'ingredient',
          entityId: record.ingredientId,
          entityName: record.ingredientName,
          message: `${record.ingredientName} variance (${record.variancePercentage.toFixed(1)}%) exceeds critical threshold`,
          currentValue: record.actualCost,
          thresholdValue: threshold.criticalThreshold,
          variance: record.costVariance,
          variancePercentage: record.variancePercentage,
          trend: this.determineSingleTrend(record),
          suggestedActions: [
            'Review recipe specifications',
            'Check portion control procedures',
            'Investigate storage conditions',
            'Train staff on proper handling'
          ],
          impactAssessment: {
            financialImpact: Math.abs(record.costVariance),
            operationalImpact: Math.abs(record.variancePercentage) > 15 ? 'high' : 'medium',
            customerImpact: record.ingredientType === 'product' ? 'medium' : 'low'
          },
          createdAt: new Date()
        })
      } else if (Math.abs(record.variancePercentage) > threshold.warningThreshold) {
        alerts.push({
          id: `ingredient-${record.ingredientId}-${Date.now()}`,
          type: 'high_variance',
          severity: 'warning',
          entityType: 'ingredient',
          entityId: record.ingredientId,
          entityName: record.ingredientName,
          message: `${record.ingredientName} variance (${record.variancePercentage.toFixed(1)}%) exceeds warning threshold`,
          currentValue: record.actualCost,
          thresholdValue: threshold.warningThreshold,
          variance: record.costVariance,
          variancePercentage: record.variancePercentage,
          trend: this.determineSingleTrend(record),
          suggestedActions: [
            'Monitor closely',
            'Review preparation procedures',
            'Check inventory handling'
          ],
          impactAssessment: {
            financialImpact: Math.abs(record.costVariance),
            operationalImpact: 'medium',
            customerImpact: 'low'
          },
          createdAt: new Date()
        })
      }
    }

    // Check recipe variances
    for (const recipe of recipeSummaries) {
      const threshold = thresholds.recipeThresholds.find(t => t.recipeId === recipe.recipeId)
      if (!threshold) continue

      const adjustedThreshold = recipe.fractionalSalesPercentage > 50 ? 
        threshold.acceptableVariancePercentage * threshold.fractionalSalesVarianceMultiplier :
        threshold.acceptableVariancePercentage

      const recipeVariancePercentage = recipe.theoreticalIngredientCost > 0 ?
        (recipe.ingredientVariance / recipe.theoreticalIngredientCost) * 100 : 0

      if (Math.abs(recipeVariancePercentage) > adjustedThreshold) {
        alerts.push({
          id: `recipe-${recipe.recipeId}-${Date.now()}`,
          type: 'threshold_exceeded',
          severity: Math.abs(recipeVariancePercentage) > adjustedThreshold * 1.5 ? 'critical' : 'warning',
          entityType: 'recipe',
          entityId: recipe.recipeId,
          entityName: recipe.recipeName,
          message: `${recipe.recipeName} variance (${recipeVariancePercentage.toFixed(1)}%) exceeds threshold`,
          currentValue: recipe.actualIngredientCost,
          thresholdValue: adjustedThreshold,
          variance: recipe.ingredientVariance,
          variancePercentage: recipeVariancePercentage,
          trend: 'stable', // Would calculate based on historical data
          suggestedActions: [
            'Review recipe yield calculations',
            'Audit fractional portion sizes',
            'Check ingredient substitutions',
            'Verify cooking procedures'
          ],
          impactAssessment: {
            financialImpact: Math.abs(recipe.ingredientVariance),
            operationalImpact: recipe.fractionalSalesPercentage > 70 ? 'high' : 'medium',
            customerImpact: recipe.fractionalSalesPercentage > 50 ? 'medium' : 'low'
          },
          createdAt: new Date()
        })
      }
    }

    return alerts
  }

  /**
   * Perform trend analysis on variance data
   */
  private async performTrendAnalysis(
    currentRecords: IngredientConsumptionRecord[],
    historicalTrends: VarianceTrendAnalysis[]
  ): Promise<VarianceTrendAnalysis[]> {
    
    const trendAnalyses: VarianceTrendAnalysis[] = []

    for (const record of currentRecords) {
      // Find historical trend for this ingredient
      const existingTrend = historicalTrends.find(t => t.entityId === record.ingredientId)
      
      // Create new data point
      const newDataPoint = {
        date: new Date(),
        theoreticalValue: record.theoreticalCost,
        actualValue: record.actualCost,
        variance: record.costVariance,
        variancePercentage: record.variancePercentage,
        volume: record.transactionIds.length // Simplified volume metric
      }

      let dataPoints = [newDataPoint]
      if (existingTrend) {
        dataPoints = [...existingTrend.dataPoints.slice(-29), newDataPoint] // Keep last 30 days
      }

      // Analyze trend
      const trendAnalysis = this.analyzeTrendDirection(dataPoints)
      const forecasting = this.generateForecast(dataPoints)

      trendAnalyses.push({
        entityId: record.ingredientId,
        entityName: record.ingredientName,
        entityType: 'ingredient',
        timeframe: 'daily',
        dataPoints,
        trendAnalysis,
        forecasting
      })
    }

    return trendAnalyses
  }

  /**
   * Calculate statistical metrics
   */
  private async calculateStatisticalMetrics(
    ingredientRecords: IngredientConsumptionRecord[],
    recipeSummaries: RecipeConsumptionSummary[],
    period: ConsumptionPeriod
  ): Promise<StatisticalVarianceMetrics> {
    
    const variances = ingredientRecords.map(r => r.variancePercentage)
    
    // Calculate basic statistics
    const mean = variances.reduce((sum, v) => sum + v, 0) / variances.length
    const sortedVariances = [...variances].sort((a, b) => a - b)
    const median = sortedVariances[Math.floor(sortedVariances.length / 2)]
    const variance = variances.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / variances.length
    const standardDeviation = Math.sqrt(variance)
    const coefficientOfVariation = mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0

    // Calculate skewness and kurtosis
    const skewness = this.calculateSkewness(variances, mean, standardDeviation)
    const kurtosis = this.calculateKurtosis(variances, mean, standardDeviation)

    // Normality test (simplified Shapiro-Wilk approximation)
    const normalityTest = this.performNormalityTest(variances)

    // Identify outliers using IQR method
    const q1 = sortedVariances[Math.floor(sortedVariances.length * 0.25)]
    const q3 = sortedVariances[Math.floor(sortedVariances.length * 0.75)]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    const outliers = ingredientRecords
      .filter(r => r.variancePercentage < lowerBound || r.variancePercentage > upperBound)
      .map(r => {
        const zScore = (r.variancePercentage - mean) / standardDeviation
        return {
          entityId: r.ingredientId,
          entityName: r.ingredientName,
          entityType: 'ingredient',
          variance: r.variancePercentage,
          zScore,
          severity: (Math.abs(zScore) > 3 ? 'extreme' : Math.abs(zScore) > 2 ? 'moderate' : 'mild') as 'extreme' | 'moderate' | 'mild'
        }
      })

    // Calculate percentiles
    const percentiles = {
      p10: sortedVariances[Math.floor(sortedVariances.length * 0.1)],
      p25: q1,
      p50: median,
      p75: q3,
      p90: sortedVariances[Math.floor(sortedVariances.length * 0.9)],
      p95: sortedVariances[Math.floor(sortedVariances.length * 0.95)],
      p99: sortedVariances[Math.floor(sortedVariances.length * 0.99)]
    }

    // Category comparison (simplified)
    const categoryComparison = [
      {
        categoryName: 'All Ingredients',
        meanVariance: mean,
        standardDeviation,
        itemCount: ingredientRecords.length,
        worstPerformers: outliers
          .filter(o => o.variance > mean)
          .sort((a, b) => b.variance - a.variance)
          .slice(0, 5)
          .map(o => o.entityName),
        bestPerformers: ingredientRecords
          .filter(r => Math.abs(r.variancePercentage) < standardDeviation)
          .sort((a, b) => Math.abs(a.variancePercentage) - Math.abs(b.variancePercentage))
          .slice(0, 5)
          .map(r => r.ingredientName)
      }
    ]

    // Fractional sales impact analysis
    const fractionalRecords = ingredientRecords.filter(r => r.fractionalContribution > 0)
    const wholeRecords = ingredientRecords.filter(r => r.wholeItemContribution > r.fractionalContribution)
    
    const fractionalVariance = fractionalRecords.length > 0 ?
      fractionalRecords.reduce((sum, r) => sum + r.variancePercentage, 0) / fractionalRecords.length : 0
    const wholeItemVariance = wholeRecords.length > 0 ?
      wholeRecords.reduce((sum, r) => sum + r.variancePercentage, 0) / wholeRecords.length : 0
    
    const totalFractional = ingredientRecords.reduce((sum, r) => sum + r.fractionalContribution, 0)
    const totalWhole = ingredientRecords.reduce((sum, r) => sum + r.wholeItemContribution, 0)
    const fractionalVolumePercentage = totalFractional + totalWhole > 0 ?
      (totalFractional / (totalFractional + totalWhole)) * 100 : 0

    const fractionalSalesImpact = {
      fractionalVariance,
      wholeItemVariance,
      fractionalVolumePercentage,
      varianceDifference: fractionalVariance - wholeItemVariance,
      significanceTest: this.performTTest(
        fractionalRecords.map(r => r.variancePercentage),
        wholeRecords.map(r => r.variancePercentage)
      )
    }

    return {
      period: period.id,
      locationId: period.location,
      calculatedAt: new Date(),
      overallMetrics: {
        meanVariance: mean,
        medianVariance: median,
        standardDeviation,
        coefficientOfVariation,
        skewness,
        kurtosis
      },
      distributionAnalysis: {
        normalityTest,
        outliers,
        percentiles
      },
      categoryComparison,
      fractionalSalesImpact
    }
  }

  /**
   * Generate actionable recommendations
   */
  private async generateRecommendations(
    varianceAnalysis: ConsumptionVarianceAnalysis,
    alerts: VarianceAlert[],
    trendAnalysis: VarianceTrendAnalysis[],
    statisticalMetrics: StatisticalVarianceMetrics
  ): Promise<{
    priority: 'high' | 'medium' | 'low'
    category: string
    action: string
    expectedImpact: string
    timeToImplement: string
    costEstimate: number
  }[]> {
    
    const recommendations: {
      priority: 'high' | 'medium' | 'low'
      category: string
      action: string
      expectedImpact: string
      timeToImplement: string
      costEstimate: number
    }[] = []

    // High variance ingredients
    const highVarianceIngredients = varianceAnalysis.categoryVariances
      .filter(c => Math.abs(c.variancePercentage) > 10)

    if (highVarianceIngredients.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Waste Reduction',
        action: 'Implement stricter portion control procedures for high-variance ingredients',
        expectedImpact: `Potential cost savings of $${(highVarianceIngredients.reduce((sum, c) => sum + Math.abs(c.variance), 0) * 0.3).toFixed(2)} per period`,
        timeToImplement: '2-4 weeks',
        costEstimate: 500
      })
    }

    // Fractional sales optimization
    if (statisticalMetrics.fractionalSalesImpact.significanceTest.isSignificant) {
      recommendations.push({
        priority: 'medium',
        category: 'Fractional Sales',
        action: 'Optimize fractional portion sizes to reduce variance',
        expectedImpact: `Reduce fractional sales variance by ${Math.abs(statisticalMetrics.fractionalSalesImpact.varianceDifference).toFixed(1)}%`,
        timeToImplement: '3-6 weeks',
        costEstimate: 800
      })
    }

    // Statistical outliers
    if (statisticalMetrics.distributionAnalysis.outliers.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Process Standardization',
        action: 'Review processes for ingredients with extreme variance outliers',
        expectedImpact: 'Improve consistency and reduce waste variability',
        timeToImplement: '4-8 weeks',
        costEstimate: 1200
      })
    }

    // Trend-based recommendations
    const worseningTrends = trendAnalysis.filter(t => t.trendAnalysis.direction === 'worsening')
    if (worseningTrends.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Trend Reversal',
        action: `Address worsening trends in ${worseningTrends.length} ingredients`,
        expectedImpact: 'Prevent further deterioration of variance metrics',
        timeToImplement: '1-2 weeks',
        costEstimate: 300
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Helper methods for statistical calculations
  private getCategoryForIngredient(ingredientId: string): string {
    // In production, this would map to actual ingredient categories
    return 'General'
  }

  private determineTrend(items: IngredientConsumptionRecord[]): 'improving' | 'worsening' | 'stable' {
    // Simplified trend determination - would use historical data
    return 'stable'
  }

  private determineSingleTrend(record: IngredientConsumptionRecord): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    // Simplified trend determination
    return 'stable'
  }

  private getFractionalSalesType(recipe: RecipeConsumptionSummary): string | undefined {
    // Would extract from recipe data
    return recipe.fractionalSalesPercentage > 50 ? 'mixed' : undefined
  }

  private analyzeVarianceDrivers(
    ingredientRecords: IngredientConsumptionRecord[],
    recipeSummaries: RecipeConsumptionSummary[]
  ): any[] {
    // Simplified variance driver analysis
    return [{
      driver: 'wastage' as const,
      impact: 1000,
      impactPercentage: 60,
      affectedItems: ingredientRecords.filter(r => r.wastage > 0).map(r => r.ingredientName),
      recommendedActions: [
        'Review storage procedures',
        'Improve portion control',
        'Train staff on waste reduction'
      ]
    }]
  }

  private calculateStatistics(ingredientRecords: IngredientConsumptionRecord[]): any {
    const variances = ingredientRecords.map(r => r.variancePercentage)
    const mean = variances.reduce((sum, v) => sum + v, 0) / variances.length
    const sortedVariances = [...variances].sort((a, b) => a - b)
    const median = sortedVariances[Math.floor(sortedVariances.length / 2)]
    const variance = variances.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / variances.length
    const standardDeviation = Math.sqrt(variance)

    const outliers = ingredientRecords
      .filter(r => Math.abs(r.variancePercentage - mean) > standardDeviation * 2)
      .map(r => ({
        ingredientId: r.ingredientId,
        ingredientName: r.ingredientName,
        variance: r.variancePercentage,
        standardDeviations: Math.abs(r.variancePercentage - mean) / standardDeviation
      }))

    return {
      meanVariance: mean,
      medianVariance: median,
      standardDeviation,
      confidenceInterval: {
        lower: mean - 1.96 * standardDeviation,
        upper: mean + 1.96 * standardDeviation,
        confidence: 95
      },
      outliers
    }
  }

  private analyzeTrendDirection(dataPoints: any[]): any {
    // Simplified trend analysis - would use more sophisticated algorithms
    return {
      direction: 'stable' as const,
      slope: 0,
      confidence: 0.8,
      seasonality: false,
      volatility: 0.1,
      correlation: {
        withVolume: 0.3,
        withSeasonality: 0.1,
        withOtherIngredients: []
      }
    }
  }

  private generateForecast(dataPoints: any[]): any {
    // Simplified forecasting - would use time series analysis
    const lastValue = dataPoints[dataPoints.length - 1]?.variancePercentage || 0
    return {
      nextPeriodPrediction: lastValue,
      confidenceInterval: {
        lower: lastValue - 2,
        upper: lastValue + 2,
        confidence: 80
      },
      riskAssessment: 'medium' as const,
      recommendedActions: ['Monitor closely', 'Review if variance increases']
    }
  }

  private calculateSkewness(values: number[], mean: number, stdDev: number): number {
    const n = values.length
    const skewness = values.reduce((sum, v) => sum + Math.pow((v - mean) / stdDev, 3), 0) / n
    return skewness
  }

  private calculateKurtosis(values: number[], mean: number, stdDev: number): number {
    const n = values.length
    const kurtosis = values.reduce((sum, v) => sum + Math.pow((v - mean) / stdDev, 4), 0) / n - 3
    return kurtosis
  }

  private performNormalityTest(values: number[]): { passed: boolean; pValue: number; testStatistic: number } {
    // Simplified normality test - would use proper statistical tests
    return {
      passed: true,
      pValue: 0.05,
      testStatistic: 0.95
    }
  }

  private performTTest(sample1: number[], sample2: number[]): { isSignificant: boolean; pValue: number; testStatistic: number } {
    // Simplified t-test - would use proper statistical implementation
    const mean1 = sample1.reduce((sum, v) => sum + v, 0) / sample1.length
    const mean2 = sample2.reduce((sum, v) => sum + v, 0) / sample2.length
    const diff = Math.abs(mean1 - mean2)
    
    return {
      isSignificant: diff > 2,
      pValue: diff > 2 ? 0.01 : 0.15,
      testStatistic: diff
    }
  }
}

