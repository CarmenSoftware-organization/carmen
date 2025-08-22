// Fractional Inventory Smart Alerts and Recommendations Engine
// AI-powered alert system with predictive analytics

import {
  FractionalStock,
  FractionalItem,
  InventoryAlert,
  ConversionRecommendation,
  FractionalInventoryMetrics
} from '@/lib/types/fractional-inventory'

interface AlertRule {
  id: string
  name: string
  type: InventoryAlert['type']
  severity: InventoryAlert['severity']
  condition: (stock: FractionalStock, item: FractionalItem, metrics?: FractionalInventoryMetrics) => boolean
  message: (stock: FractionalStock, item: FractionalItem) => string
  actions: (stock: FractionalStock, item: FractionalItem) => InventoryAlert['recommendedActions']
  priority: number
  isActive: boolean
}

interface DemandPattern {
  itemId: string
  hourlyDemand: number[]        // 24 hours
  weeklyPattern: number[]       // 7 days
  seasonalMultiplier: number
  trendDirection: 'up' | 'down' | 'stable'
  confidence: number            // 0-1 scale
}

interface QualityPrediction {
  stockId: string
  currentGrade: string
  predictedGrade: string
  degradationRate: number       // Per hour
  timeToNextGrade: number       // Hours
  confidence: number
}

export class FractionalAlertsEngine {
  private static instance: FractionalAlertsEngine
  private alertRules: AlertRule[] = []
  private demandPatterns: Map<string, DemandPattern> = new Map()
  private qualityPredictions: Map<string, QualityPrediction> = new Map()
  private alertHistory: InventoryAlert[] = []

  public static getInstance(): FractionalAlertsEngine {
    if (!FractionalAlertsEngine.instance) {
      FractionalAlertsEngine.instance = new FractionalAlertsEngine()
      FractionalAlertsEngine.instance.initializeAlertRules()
    }
    return FractionalAlertsEngine.instance
  }

  private initializeAlertRules(): void {
    this.alertRules = [
      // Portion Availability Alerts
      {
        id: 'low-portions',
        name: 'Low Portion Availability',
        type: 'PORTION_LOW',
        severity: 'HIGH',
        condition: (stock, item) => {
          const demandPattern = this.demandPatterns.get(item.id)
          const expectedHourlyDemand = demandPattern?.hourlyDemand[new Date().getHours()] || 5
          const hoursOfStock = stock.totalPortionsAvailable / expectedHourlyDemand
          return hoursOfStock < 2 && stock.totalPortionsAvailable > 0
        },
        message: (stock, item) => {
          const demandPattern = this.demandPatterns.get(item.id)
          const expectedHourlyDemand = demandPattern?.hourlyDemand[new Date().getHours()] || 5
          const hoursOfStock = Math.floor(stock.totalPortionsAvailable / expectedHourlyDemand)
          return `Only ${stock.totalPortionsAvailable} portions remaining. At current demand (${expectedHourlyDemand}/hr), will last ${hoursOfStock} hours`
        },
        actions: (stock, item) => [
          {
            action: 'CONVERT',
            priority: 1,
            description: 'Convert whole units to portions immediately',
            estimatedImpact: `+${this.estimatePortionsFromConversion(stock, item)} portions`
          },
          {
            action: 'REORDER',
            priority: 2,
            description: 'Emergency reorder of raw materials'
          }
        ],
        priority: 8,
        isActive: true
      },

      // Critical Portion Shortage
      {
        id: 'critical-portions',
        name: 'Critical Portion Shortage',
        type: 'PORTION_LOW',
        severity: 'CRITICAL',
        condition: (stock, item) => stock.totalPortionsAvailable === 0 && stock.reservedPortions > 0,
        message: (stock, item) => 
          `CRITICAL: No portions available but ${stock.reservedPortions} portions are reserved for orders`,
        actions: (stock, item) => [
          {
            action: 'CONVERT',
            priority: 1,
            description: 'URGENT: Convert whole units immediately',
            estimatedImpact: 'Prevent order fulfillment issues'
          }
        ],
        priority: 10,
        isActive: true
      },

      // Quality Degradation Alerts
      {
        id: 'quality-degrading',
        name: 'Quality Degradation Detected',
        type: 'QUALITY_DEGRADING',
        severity: 'MEDIUM',
        condition: (stock, item) => {
          const prediction = this.qualityPredictions.get(stock.id)
          return prediction ? prediction.timeToNextGrade < 4 && prediction.currentGrade !== 'POOR' : false
        },
        message: (stock, item) => {
          const prediction = this.qualityPredictions.get(stock.id)
          return `Quality will degrade from ${prediction?.currentGrade} to ${prediction?.predictedGrade} in ${Math.round(prediction?.timeToNextGrade || 0)} hours`
        },
        actions: (stock, item) => [
          {
            action: 'QUALITY_CHECK',
            priority: 1,
            description: 'Perform immediate quality assessment'
          },
          {
            action: 'CONVERT',
            priority: 2,
            description: 'Use before quality degrades further'
          }
        ],
        priority: 6,
        isActive: true
      },

      // Optimal Conversion Time
      {
        id: 'optimal-conversion',
        name: 'Optimal Conversion Window',
        type: 'OPTIMAL_CONVERSION_TIME',
        severity: 'LOW',
        condition: (stock, item) => {
          const demandPattern = this.demandPatterns.get(item.id)
          if (!demandPattern) return false
          
          const currentHour = new Date().getHours()
          const nextHourDemand = demandPattern.hourlyDemand[currentHour + 1] || 0
          const currentDemand = demandPattern.hourlyDemand[currentHour] || 0
          
          // Alert when demand is about to increase significantly
          return nextHourDemand > currentDemand * 1.5 && stock.wholeUnitsAvailable > 0
        },
        message: (stock, item) => {
          const demandPattern = this.demandPatterns.get(item.id)
          const nextHourDemand = demandPattern?.hourlyDemand[new Date().getHours() + 1] || 0
          return `Demand will increase to ${nextHourDemand}/hr in the next hour. Consider converting now to avoid rush`
        },
        actions: (stock, item) => [
          {
            action: 'CONVERT',
            priority: 1,
            description: 'Convert whole units before demand peak',
            estimatedImpact: 'Avoid conversion delays during busy periods'
          }
        ],
        priority: 3,
        isActive: true
      },

      // Waste Management Alerts
      {
        id: 'high-waste',
        name: 'High Waste Generation',
        type: 'WASTE_HIGH',
        severity: 'MEDIUM',
        condition: (stock, item, metrics) => {
          const conversionCount = stock.conversionsApplied.length
          if (conversionCount === 0) return false
          
          const averageWaste = stock.totalWasteGenerated / conversionCount
          const expectedWaste = item.wastePercentage / 100
          
          return averageWaste > expectedWaste * 1.3 // 30% higher than expected
        },
        message: (stock, item) => {
          const conversionCount = stock.conversionsApplied.length
          const averageWaste = stock.totalWasteGenerated / conversionCount
          const wastePercentage = (averageWaste / stock.originalWholeUnits) * 100
          return `Waste generation is ${wastePercentage.toFixed(1)}% (${(wastePercentage / (item.wastePercentage) * 100).toFixed(0)}% above expected)`
        },
        actions: (stock, item) => [
          {
            action: 'QUALITY_CHECK',
            priority: 1,
            description: 'Review conversion processes to identify waste sources'
          }
        ],
        priority: 4,
        isActive: true
      },

      // Expiry Alerts
      {
        id: 'expiring-soon',
        name: 'Item Expiring Soon',
        type: 'EXPIRING_SOON',
        severity: 'HIGH',
        condition: (stock, item) => {
          if (!stock.expiresAt) return false
          const hoursToExpiry = (new Date(stock.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
          return hoursToExpiry > 0 && hoursToExpiry < 4
        },
        message: (stock, item) => {
          const hoursToExpiry = Math.round((new Date(stock.expiresAt!).getTime() - Date.now()) / (1000 * 60 * 60))
          return `${item.itemName} expires in ${hoursToExpiry} hours with ${stock.totalPortionsAvailable} portions remaining`
        },
        actions: (stock, item) => [
          {
            action: 'CONVERT',
            priority: 1,
            description: 'Use immediately or convert to extend shelf life',
            estimatedImpact: 'Prevent waste from expiration'
          },
          {
            action: 'MARK_WASTE',
            priority: 2,
            description: 'Mark as waste if quality is too poor'
          }
        ],
        priority: 9,
        isActive: true
      },

      // Conversion Opportunity Alerts
      {
        id: 'conversion-opportunity',
        name: 'Conversion Opportunity',
        type: 'CONVERSION_RECOMMENDED',
        severity: 'LOW',
        condition: (stock, item) => {
          const demandPattern = this.demandPatterns.get(item.id)
          if (!demandPattern) return false
          
          // Check if we have whole units but low portions, and demand trend is up
          return stock.wholeUnitsAvailable >= 2 && 
                 stock.totalPortionsAvailable < 20 && 
                 demandPattern.trendDirection === 'up'
        },
        message: (stock, item) => 
          `Demand trending upward. Consider converting ${Math.min(stock.wholeUnitsAvailable, 3)} whole units to portions`,
        actions: (stock, item) => [
          {
            action: 'CONVERT',
            priority: 1,
            description: `Convert 2-3 whole units to meet increasing demand`,
            estimatedImpact: `+${this.estimatePortionsFromConversion(stock, item, 3)} portions`
          }
        ],
        priority: 2,
        isActive: true
      }
    ]
  }

  // ====== MAIN ALERT PROCESSING ======

  /**
   * Processes all stocks and generates appropriate alerts
   */
  async processAlertsForStocks(
    stocks: FractionalStock[], 
    items: FractionalItem[],
    metrics?: FractionalInventoryMetrics
  ): Promise<InventoryAlert[]> {
    const alerts: InventoryAlert[] = []
    
    // Update demand patterns and quality predictions
    await this.updateDemandPatterns(stocks, items)
    await this.updateQualityPredictions(stocks, items)

    for (const stock of stocks) {
      const item = items.find(i => i.id === stock.itemId)
      if (!item) continue

      const stockAlerts = await this.evaluateStockAlerts(stock, item, metrics)
      alerts.push(...stockAlerts)
    }

    // Sort alerts by priority (highest first) and severity
    return alerts.sort((a, b) => {
      const priorityA = this.getAlertPriority(a)
      const priorityB = this.getAlertPriority(b)
      if (priorityA !== priorityB) return priorityB - priorityA
      
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  /**
   * Generates conversion recommendations based on predictive analytics
   */
  async generateConversionRecommendations(
    stocks: FractionalStock[],
    items: FractionalItem[]
  ): Promise<ConversionRecommendation[]> {
    const recommendations: ConversionRecommendation[] = []

    for (const stock of stocks) {
      const item = items.find(i => i.id === stock.itemId)
      if (!item) continue

      const stockRecommendations = await this.evaluateConversionOpportunities(stock, item)
      recommendations.push(...stockRecommendations)
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // ====== PREDICTIVE ANALYTICS ======

  /**
   * Updates demand patterns using machine learning-like analysis
   */
  private async updateDemandPatterns(stocks: FractionalStock[], items: FractionalItem[]): Promise<void> {
    for (const item of items) {
      const itemStocks = stocks.filter(s => s.itemId === item.id)
      
      // Simulate demand pattern analysis
      // In real implementation, this would analyze historical transaction data
      const mockDemandPattern: DemandPattern = {
        itemId: item.id,
        hourlyDemand: this.generateHourlyDemandPattern(item),
        weeklyPattern: [0.8, 1.2, 1.1, 1.0, 1.3, 1.5, 0.9], // Mon-Sun multipliers
        seasonalMultiplier: 1.0,
        trendDirection: this.analyzeTrendDirection(itemStocks),
        confidence: 0.75
      }
      
      this.demandPatterns.set(item.id, mockDemandPattern)
    }
  }

  /**
   * Predicts quality degradation for each stock
   */
  private async updateQualityPredictions(stocks: FractionalStock[], items: FractionalItem[]): Promise<void> {
    for (const stock of stocks) {
      const item = items.find(i => i.id === stock.itemId)
      if (!item) continue

      const prediction = this.predictQualityDegradation(stock, item)
      this.qualityPredictions.set(stock.id, prediction)
    }
  }

  private predictQualityDegradation(stock: FractionalStock, item: FractionalItem): QualityPrediction {
    const qualityScores = { 'EXCELLENT': 5, 'GOOD': 4, 'FAIR': 3, 'POOR': 2, 'EXPIRED': 1 }
    const currentScore = qualityScores[stock.qualityGrade] || 3
    
    // Calculate degradation rate based on item properties and time
    let degradationRate = 0.1 // Base rate per hour
    
    if (item.maxQualityHours) {
      const timeSincePrepared = stock.preparedAt ? 
        (Date.now() - new Date(stock.preparedAt).getTime()) / (1000 * 60 * 60) : 0
      degradationRate = Math.max(0.05, timeSincePrepared / item.maxQualityHours)
    }

    // Predict next grade and time
    const nextScore = currentScore - 1
    const nextGrade = Object.keys(qualityScores).find(k => qualityScores[k as keyof typeof qualityScores] === nextScore) || 'POOR'
    const timeToNextGrade = Math.max(0.5, 1 / degradationRate)

    return {
      stockId: stock.id,
      currentGrade: stock.qualityGrade,
      predictedGrade: nextGrade,
      degradationRate,
      timeToNextGrade,
      confidence: 0.8
    }
  }

  // ====== ALERT EVALUATION ======

  private async evaluateStockAlerts(
    stock: FractionalStock, 
    item: FractionalItem,
    metrics?: FractionalInventoryMetrics
  ): Promise<InventoryAlert[]> {
    const alerts: InventoryAlert[] = []

    for (const rule of this.alertRules) {
      if (!rule.isActive) continue
      
      try {
        if (rule.condition(stock, item, metrics)) {
          const alert: InventoryAlert = {
            id: this.generateAlertId(),
            type: rule.type,
            severity: rule.severity,
            itemId: item.id,
            stockId: stock.id,
            locationId: stock.locationId,
            title: rule.name,
            message: rule.message(stock, item),
            triggeredAt: new Date().toISOString(),
            triggeredBy: 'SYSTEM',
            recommendedActions: rule.actions(stock, item),
            isActive: true
          }
          
          alerts.push(alert)
        }
      } catch (error) {
        console.error(`Error evaluating alert rule ${rule.id}:`, error)
      }
    }

    return alerts
  }

  private async evaluateConversionOpportunities(
    stock: FractionalStock,
    item: FractionalItem
  ): Promise<ConversionRecommendation[]> {
    const recommendations: ConversionRecommendation[] = []
    const demandPattern = this.demandPatterns.get(item.id)
    
    if (!demandPattern) return recommendations

    // Opportunity 1: Demand-based splitting
    if (stock.wholeUnitsAvailable >= 2 && stock.totalPortionsAvailable < 15) {
      const currentHour = new Date().getHours()
      const upcomingDemand = demandPattern.hourlyDemand.slice(currentHour, currentHour + 4).reduce((a, b) => a + b, 0)
      
      if (upcomingDemand > stock.totalPortionsAvailable) {
        recommendations.push({
          id: this.generateRecommendationId(),
          itemId: item.id,
          stockId: stock.id,
          recommendationType: 'DEMAND_BASED',
          priority: 'HIGH',
          fromState: stock.currentState,
          toState: 'PORTIONED',
          recommendedWholeUnits: Math.min(3, stock.wholeUnitsAvailable),
          recommendedPortions: 0,
          reason: `Upcoming 4-hour demand (${upcomingDemand} portions) exceeds available portions`,
          expectedBenefits: [
            'Meet upcoming demand without delays',
            'Improve customer satisfaction',
            'Optimize revenue potential'
          ],
          potentialRisks: [
            'Increased waste if demand does not materialize',
            'Quality degradation over time'
          ],
          estimatedWaste: Math.min(3, stock.wholeUnitsAvailable) * (item.wastePercentage / 100),
          estimatedCost: Math.min(3, stock.wholeUnitsAvailable) * (item.conversionCostPerUnit || 0),
          estimatedRevenue: upcomingDemand * (item.baseCostPerUnit / 8) * 1.3, // Assuming 30% markup
          recommendedBy: 'DEMAND_PREDICTOR',
          recommendedAt: new Date().toISOString(),
          optimalExecutionTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          status: 'PENDING'
        })
      }
    }

    // Opportunity 2: Quality-based conversions
    const qualityPrediction = this.qualityPredictions.get(stock.id)
    if (qualityPrediction && qualityPrediction.timeToNextGrade < 6 && stock.wholeUnitsAvailable > 0) {
      recommendations.push({
        id: this.generateRecommendationId(),
        itemId: item.id,
        stockId: stock.id,
        recommendationType: 'IMMEDIATE',
        priority: 'MEDIUM',
        fromState: stock.currentState,
        toState: 'PORTIONED',
        recommendedWholeUnits: Math.min(2, stock.wholeUnitsAvailable),
        recommendedPortions: 0,
        reason: `Quality will degrade to ${qualityPrediction.predictedGrade} in ${Math.round(qualityPrediction.timeToNextGrade)} hours`,
        expectedBenefits: [
          'Preserve current quality level',
          'Avoid waste from quality degradation',
          'Maintain product standards'
        ],
        potentialRisks: [
          'Conversion costs',
          'Limited shelf life after portioning'
        ],
        estimatedWaste: Math.min(2, stock.wholeUnitsAvailable) * (item.wastePercentage / 100),
        estimatedCost: Math.min(2, stock.wholeUnitsAvailable) * (item.conversionCostPerUnit || 0),
        qualityImpact: 0.1, // Slight quality impact from conversion
        recommendedBy: 'QUALITY_PREDICTOR',
        recommendedAt: new Date().toISOString(),
        optimalExecutionTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        expirationTime: new Date(Date.now() + qualityPrediction.timeToNextGrade * 60 * 60 * 1000).toISOString(),
        status: 'PENDING'
      })
    }

    return recommendations
  }

  // ====== UTILITY METHODS ======

  private generateHourlyDemandPattern(item: FractionalItem): number[] {
    // Generate realistic hourly demand pattern based on item type
    const basePattern = [
      2, 1, 1, 1, 2, 3,     // 12am-5am: Low demand
      5, 8, 10, 12, 15, 18, // 6am-11am: Building to lunch
      25, 30, 28, 20, 15,   // 12pm-4pm: Lunch peak
      12, 15, 20, 22, 18,   // 5pm-9pm: Dinner rush
      10, 8, 5             // 10pm-11pm: Winding down
    ]

    // Adjust based on item category
    const multiplier = item.category === 'Food' ? 1.2 : 
                      item.category === 'Dessert' ? 0.8 : 1.0

    return basePattern.map(val => Math.round(val * multiplier))
  }

  private analyzeTrendDirection(stocks: FractionalStock[]): 'up' | 'down' | 'stable' {
    // Simulate trend analysis based on stock movements
    // In real implementation, this would analyze historical consumption data
    const totalConsumption = stocks.reduce((sum, stock) => 
      sum + (stock.originalTotalPortions - stock.totalPortionsAvailable), 0)
    
    const averageConsumption = totalConsumption / stocks.length
    
    if (averageConsumption > 50) return 'up'
    if (averageConsumption < 20) return 'down'
    return 'stable'
  }

  private estimatePortionsFromConversion(stock: FractionalStock, item: FractionalItem, units?: number): number {
    const unitsToConvert = units || Math.min(stock.wholeUnitsAvailable, 2)
    const defaultPortion = item.availablePortions.find(p => p.id === item.defaultPortionId) || 
                          item.availablePortions[0]
    
    if (!defaultPortion) return 0
    
    const potentialPortions = unitsToConvert * defaultPortion.portionsPerWhole
    return Math.floor(potentialPortions * (1 - item.wastePercentage / 100))
  }

  private getAlertPriority(alert: InventoryAlert): number {
    const rule = this.alertRules.find(r => r.type === alert.type)
    return rule?.priority || 1
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateRecommendationId(): string {
    return `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // ====== PUBLIC CONFIGURATION METHODS ======

  /**
   * Add custom alert rule
   */
  public addCustomAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule)
  }

  /**
   * Update existing alert rule
   */
  public updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const index = this.alertRules.findIndex(r => r.id === ruleId)
    if (index !== -1) {
      this.alertRules[index] = { ...this.alertRules[index], ...updates }
    }
  }

  /**
   * Get all alert rules
   */
  public getAlertRules(): AlertRule[] {
    return [...this.alertRules]
  }

  /**
   * Get demand pattern for item
   */
  public getDemandPattern(itemId: string): DemandPattern | undefined {
    return this.demandPatterns.get(itemId)
  }

  /**
   * Get quality prediction for stock
   */
  public getQualityPrediction(stockId: string): QualityPrediction | undefined {
    return this.qualityPredictions.get(stockId)
  }
}

export const fractionalAlertsEngine = FractionalAlertsEngine.getInstance()