// Fractional Inventory Management Service
// Core business logic for fractional sales inventory operations

import {
  FractionalItem,
  FractionalStock,
  FractionalItemState,
  ConversionRecord,
  ConversionType,
  ConversionRule,
  InventoryAlert,
  FractionalInventoryOperation,
  FractionalInventoryMetrics,
  ConversionRecommendation,
  FractionalInventoryFilter,
  PortionSize
} from '@/lib/types/fractional-inventory'

export class FractionalInventoryService {
  private static instance: FractionalInventoryService
  private conversionRules: ConversionRule[] = []
  private activeAlerts: InventoryAlert[] = []

  public static getInstance(): FractionalInventoryService {
    if (!FractionalInventoryService.instance) {
      FractionalInventoryService.instance = new FractionalInventoryService()
    }
    return FractionalInventoryService.instance
  }

  // ====== CORE INVENTORY OPERATIONS ======

  /**
   * Splits a whole item into multiple portions
   */
  async splitItem(
    stockId: string,
    wholeUnitsToSplit: number,
    targetPortionSizeId: string,
    performedBy: string,
    reason?: string
  ): Promise<ConversionRecord> {
    const stock = await this.getStockById(stockId)
    const item = await this.getFractionalItemById(stock.itemId)
    
    if (!stock || !item) {
      throw new Error('Stock or item not found')
    }

    if (!item.supportsFractional) {
      throw new Error('Item does not support fractional operations')
    }

    if (stock.wholeUnitsAvailable < wholeUnitsToSplit) {
      throw new Error('Insufficient whole units available')
    }

    const portionSize = item.availablePortions.find(p => p.id === targetPortionSizeId)
    if (!portionSize) {
      throw new Error('Invalid portion size')
    }

    // Calculate conversion
    const totalPortionsCreated = wholeUnitsToSplit * portionSize.portionsPerWhole
    const wasteGenerated = wholeUnitsToSplit * (item.wastePercentage / 100)
    const actualPortionsCreated = Math.floor(totalPortionsCreated * (1 - (item.wastePercentage / 100)))

    // Create conversion record
    const conversionRecord: ConversionRecord = {
      id: this.generateId(),
      conversionType: 'SPLIT',
      fromState: stock.currentState,
      toState: 'PORTIONED',
      
      beforeWholeUnits: stock.wholeUnitsAvailable,
      beforePartialQuantity: stock.partialQuantityAvailable,
      beforeTotalPortions: stock.totalPortionsAvailable,
      
      afterWholeUnits: stock.wholeUnitsAvailable - wholeUnitsToSplit,
      afterPartialQuantity: stock.partialQuantityAvailable,
      afterTotalPortions: stock.totalPortionsAvailable + actualPortionsCreated,
      
      wasteGenerated,
      conversionEfficiency: actualPortionsCreated / totalPortionsCreated,
      conversionCost: wholeUnitsToSplit * (item.conversionCostPerUnit || 0),
      
      performedBy,
      performedAt: new Date().toISOString(),
      reason,
      sourceStockIds: [stockId],
      targetStockIds: [stockId]
    }

    // Update stock
    await this.updateStockAfterConversion(stockId, conversionRecord)
    
    // Log operation
    await this.logInventoryOperation('CONVERSION', stockId, conversionRecord)
    
    // Check for new alerts
    await this.evaluateAlertsForStock(stockId)

    return conversionRecord
  }

  /**
   * Combines multiple portions back into bulk items
   */
  async combinePortions(
    stockId: string,
    portionsTocombine: number,
    performedBy: string,
    reason?: string
  ): Promise<ConversionRecord> {
    const stock = await this.getStockById(stockId)
    const item = await this.getFractionalItemById(stock.itemId)
    
    if (!stock || !item) {
      throw new Error('Stock or item not found')
    }

    if (stock.totalPortionsAvailable < portionsToRcombine) {
      throw new Error('Insufficient portions available')
    }

    // Find the portion size that was used (assuming default or most common)
    const defaultPortion = item.availablePortions.find(p => p.id === item.defaultPortionId) ||
                          item.availablePortions[0]
    
    if (!defaultPortion) {
      throw new Error('No portion size configuration found')
    }

    // Calculate conversion
    const wholeUnitsCreated = Math.floor(portionsToRombine / defaultPortion.portionsPerWhole)
    const remainingPortions = portionsToombine % defaultPortion.portionsPerWhole
    const wasteGenerated = portionsToombine * (item.wastePercentage / 100)

    const conversionRecord: ConversionRecord = {
      id: this.generateId(),
      conversionType: 'COMBINE',
      fromState: stock.currentState,
      toState: wholeUnitsCreated > 0 ? 'RAW' : 'PORTIONED',
      
      beforeWholeUnits: stock.wholeUnitsAvailable,
      beforePartialQuantity: stock.partialQuantityAvailable,
      beforeTotalPortions: stock.totalPortionsAvailable,
      
      afterWholeUnits: stock.wholeUnitsAvailable + wholeUnitsCreated,
      afterPartialQuantity: stock.partialQuantityAvailable,
      afterTotalPortions: stock.totalPortionsAvailable - portionsToombine + remainingPortions,
      
      wasteGenerated,
      conversionEfficiency: (wholeUnitsCreated * defaultPortion.portionsPerWhole + remainingPortions) / portionsToombine,
      conversionCost: wholeUnitsCreated * (item.conversionCostPerUnit || 0),
      
      performedBy,
      performedAt: new Date().toISOString(),
      reason,
      sourceStockIds: [stockId],
      targetStockIds: [stockId]
    }

    await this.updateStockAfterConversion(stockId, conversionRecord)
    await this.logInventoryOperation('CONVERSION', stockId, conversionRecord)
    await this.evaluateAlertsForStock(stockId)

    return conversionRecord
  }

  /**
   * Prepares raw items for portioning
   */
  async prepareItems(
    stockId: string,
    wholeUnitsToPrepare: number,
    performedBy: string,
    preparationNotes?: string
  ): Promise<ConversionRecord> {
    const stock = await this.getStockById(stockId)
    const item = await this.getFractionalItemById(stock.itemId)
    
    if (!stock || !item) {
      throw new Error('Stock or item not found')
    }

    if (stock.currentState !== 'RAW') {
      throw new Error('Items must be in RAW state to prepare')
    }

    const wasteGenerated = wholeUnitsToPrepare * (item.wastePercentage / 100)
    const preparedUnits = wholeUnitsToPrepare - wasteGenerated

    const conversionRecord: ConversionRecord = {
      id: this.generateId(),
      conversionType: 'PREPARE',
      fromState: 'RAW',
      toState: 'PREPARED',
      
      beforeWholeUnits: stock.wholeUnitsAvailable,
      beforePartialQuantity: stock.partialQuantityAvailable,
      beforeTotalPortions: stock.totalPortionsAvailable,
      
      afterWholeUnits: stock.wholeUnitsAvailable - wholeUnitsToPrepare + preparedUnits,
      afterPartialQuantity: stock.partialQuantityAvailable,
      afterTotalPortions: stock.totalPortionsAvailable,
      
      wasteGenerated,
      conversionEfficiency: preparedUnits / wholeUnitsToPrepare,
      conversionCost: wholeUnitsToPrepare * (item.conversionCostPerUnit || 0),
      
      performedBy,
      performedAt: new Date().toISOString(),
      notes: preparationNotes,
      sourceStockIds: [stockId],
      targetStockIds: [stockId]
    }

    // Update stock state
    const updatedStock: Partial<FractionalStock> = {
      currentState: 'PREPARED',
      stateTransitionDate: new Date().toISOString(),
      preparedAt: new Date().toISOString(),
      expiresAt: item.shelfLifeHours ? 
        new Date(Date.now() + item.shelfLifeHours * 60 * 60 * 1000).toISOString() : 
        undefined
    }

    await this.updateStock(stockId, updatedStock)
    await this.updateStockAfterConversion(stockId, conversionRecord)
    await this.logInventoryOperation('CONVERSION', stockId, conversionRecord)

    return conversionRecord
  }

  // ====== QUALITY AND STATE MANAGEMENT ======

  /**
   * Updates quality grade based on time and conditions
   */
  async updateQualityGrade(
    stockId: string,
    performedBy: string,
    notes?: string
  ): Promise<void> {
    const stock = await this.getStockById(stockId)
    const item = await this.getFractionalItemById(stock.itemId)
    
    if (!stock || !item) return

    let newQualityGrade = stock.qualityGrade

    // Calculate quality degradation based on time
    const now = Date.now()
    const preparedTime = stock.preparedAt ? new Date(stock.preparedAt).getTime() : now
    const hoursSincePrepared = (now - preparedTime) / (1000 * 60 * 60)

    if (item.shelfLifeHours && hoursSincePrepared > item.shelfLifeHours) {
      newQualityGrade = 'EXPIRED'
    } else if (item.maxQualityHours && hoursSincePrepared > item.maxQualityHours) {
      // Quality degradation based on time
      const degradationPercentage = hoursSincePrepared / item.maxQualityHours
      if (degradationPercentage > 0.8) newQualityGrade = 'POOR'
      else if (degradationPercentage > 0.6) newQualityGrade = 'FAIR'
      else if (degradationPercentage > 0.3) newQualityGrade = 'GOOD'
    }

    if (newQualityGrade !== stock.qualityGrade) {
      await this.updateStock(stockId, {
        qualityGrade: newQualityGrade,
        lastQualityCheck: new Date().toISOString(),
        qualityNotes: notes
      })

      // Generate alert if quality is degrading
      if (newQualityGrade === 'POOR' || newQualityGrade === 'EXPIRED') {
        await this.createQualityAlert(stockId, newQualityGrade)
      }
    }
  }

  /**
   * Handles state transitions with automatic rules
   */
  async processAutomaticStateTransitions(): Promise<void> {
    const activeStocks = await this.getAllActiveStocks()
    
    for (const stock of activeStocks) {
      const applicableRules = this.conversionRules.filter(rule => 
        rule.autoTrigger && this.isRuleApplicable(rule, stock)
      )

      for (const rule of applicableRules) {
        if (this.shouldTriggerConversion(rule, stock)) {
          await this.executeAutomaticConversion(rule, stock)
        }
      }
    }
  }

  // ====== ANALYTICS AND METRICS ======

  /**
   * Calculates comprehensive inventory metrics
   */
  async calculateInventoryMetrics(locationId?: string): Promise<FractionalInventoryMetrics> {
    const stocks = await this.getStocksByLocation(locationId)
    
    let totalWholeUnits = 0
    let totalPortionsAvailable = 0
    let totalReservedPortions = 0
    let totalValueOnHand = 0
    let totalWaste = 0
    let totalConversions = 0
    let totalConversionInput = 0
    let qualitySum = 0
    let itemsNearExpiry = 0

    for (const stock of stocks) {
      totalWholeUnits += stock.wholeUnitsAvailable
      totalPortionsAvailable += stock.totalPortionsAvailable
      totalReservedPortions += stock.reservedPortions
      
      const item = await this.getFractionalItemById(stock.itemId)
      if (item) {
        totalValueOnHand += (stock.wholeUnitsAvailable * item.baseCostPerUnit) +
                           (stock.totalPortionsAvailable * (item.baseCostPerUnit / this.getAveragePortionsPerWhole(item)))
      }

      totalWaste += stock.totalWasteGenerated
      totalConversions += stock.conversionsApplied.length
      
      // Quality metrics
      const qualityScore = this.getQualityScore(stock.qualityGrade)
      qualitySum += qualityScore

      // Check expiry
      if (stock.expiresAt && new Date(stock.expiresAt).getTime() < Date.now() + (24 * 60 * 60 * 1000)) {
        itemsNearExpiry++
      }
    }

    const conversionEfficiency = totalConversionInput > 0 ? 
      (totalConversionInput - totalWaste) / totalConversionInput : 1
    
    const wastePercentage = totalConversionInput > 0 ? 
      (totalWaste / totalConversionInput) * 100 : 0

    return {
      totalWholeUnits,
      totalPortionsAvailable,
      totalReservedPortions,
      totalValueOnHand,
      
      dailyConversions: await this.getDailyConversions(),
      conversionEfficiency,
      wastePercentage,
      
      averageQualityGrade: stocks.length > 0 ? qualitySum / stocks.length : 0,
      itemsNearExpiry,
      qualityDegradationRate: await this.getQualityDegradationRate(),
      
      turnoverRate: await this.calculateTurnoverRate(locationId),
      stockoutEvents: await this.getStockoutEvents(locationId),
      conversionBacklog: await this.getConversionBacklog(locationId),
      
      activeAlerts: this.activeAlerts.filter(alert => 
        !locationId || alert.locationId === locationId
      ),
      recommendedConversions: await this.getConversionRecommendations(locationId)
    }
  }

  // ====== ALERTS AND RECOMMENDATIONS ======

  /**
   * Evaluates and creates alerts for a specific stock
   */
  async evaluateAlertsForStock(stockId: string): Promise<void> {
    const stock = await this.getStockById(stockId)
    const item = await this.getFractionalItemById(stock.itemId)
    
    if (!stock || !item) return

    // Clear existing alerts for this stock
    this.activeAlerts = this.activeAlerts.filter(alert => alert.stockId !== stockId)

    // Check portion levels
    if (stock.totalPortionsAvailable < 10) { // Configurable threshold
      await this.createAlert({
        type: 'PORTION_LOW',
        severity: stock.totalPortionsAvailable === 0 ? 'CRITICAL' : 'HIGH',
        stockId,
        title: 'Low Portion Availability',
        message: `Only ${stock.totalPortionsAvailable} portions remaining for ${item.itemName}`,
        recommendedActions: [
          {
            action: 'CONVERT',
            priority: 1,
            description: 'Convert whole units to portions',
            estimatedImpact: `+${this.estimatePortionsFromConversion(stock, item)} portions`
          },
          {
            action: 'REORDER',
            priority: 2,
            description: 'Reorder raw materials'
          }
        ]
      })
    }

    // Check quality degradation
    if (stock.qualityGrade === 'FAIR' || stock.qualityGrade === 'POOR') {
      await this.createAlert({
        type: 'QUALITY_DEGRADING',
        severity: stock.qualityGrade === 'POOR' ? 'HIGH' : 'MEDIUM',
        stockId,
        title: 'Quality Degradation Detected',
        message: `${item.itemName} quality has degraded to ${stock.qualityGrade}`,
        recommendedActions: [
          {
            action: 'QUALITY_CHECK',
            priority: 1,
            description: 'Perform detailed quality inspection'
          }
        ]
      })
    }

    // Check expiry
    if (stock.expiresAt) {
      const hoursToExpiry = (new Date(stock.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursToExpiry < 24) {
        await this.createAlert({
          type: 'EXPIRING_SOON',
          severity: hoursToExpiry < 4 ? 'CRITICAL' : 'HIGH',
          stockId,
          title: 'Item Expiring Soon',
          message: `${item.itemName} expires in ${Math.round(hoursToExpiry)} hours`,
          recommendedActions: [
            {
              action: 'CONVERT',
              priority: 1,
              description: 'Use immediately or convert to longer-lasting form'
            }
          ]
        })
      }
    }

    // Check conversion recommendations
    const conversionRecommendation = await this.evaluateConversionOpportunity(stock, item)
    if (conversionRecommendation) {
      await this.createAlert({
        type: 'CONVERSION_RECOMMENDED',
        severity: 'MEDIUM',
        stockId,
        title: 'Conversion Opportunity',
        message: conversionRecommendation.reason,
        recommendedActions: [
          {
            action: 'CONVERT',
            priority: 1,
            description: `Convert ${conversionRecommendation.fromState} to ${conversionRecommendation.toState}`,
            estimatedImpact: `Revenue: +${conversionRecommendation.estimatedRevenue || 0}`
          }
        ]
      })
    }
  }

  // ====== UTILITY METHODS ======

  private async getStockById(stockId: string): Promise<FractionalStock | null> {
    // Implementation would fetch from database
    // For now, returning mock data
    return null
  }

  private async getFractionalItemById(itemId: string): Promise<FractionalItem | null> {
    // Implementation would fetch from database
    return null
  }

  private async updateStock(stockId: string, updates: Partial<FractionalStock>): Promise<void> {
    // Implementation would update database
  }

  private async updateStockAfterConversion(stockId: string, conversion: ConversionRecord): Promise<void> {
    const updates: Partial<FractionalStock> = {
      wholeUnitsAvailable: conversion.afterWholeUnits,
      partialQuantityAvailable: conversion.afterPartialQuantity,
      totalPortionsAvailable: conversion.afterTotalPortions,
      currentState: conversion.toState,
      stateTransitionDate: conversion.performedAt,
      totalWasteGenerated: (await this.getStockById(stockId))?.totalWasteGenerated || 0 + conversion.wasteGenerated,
      updatedAt: new Date().toISOString()
    }

    await this.updateStock(stockId, updates)
  }

  private async logInventoryOperation(
    type: string,
    stockId: string,
    conversion: ConversionRecord
  ): Promise<void> {
    // Implementation would log to database
  }

  private async createAlert(alertData: Partial<InventoryAlert>): Promise<void> {
    const alert: InventoryAlert = {
      id: this.generateId(),
      isActive: true,
      triggeredAt: new Date().toISOString(),
      triggeredBy: 'SYSTEM',
      ...alertData
    } as InventoryAlert

    this.activeAlerts.push(alert)
  }

  private async createQualityAlert(stockId: string, qualityGrade: string): Promise<void> {
    // Implementation for quality-specific alerts
  }

  private isRuleApplicable(rule: ConversionRule, stock: FractionalStock): boolean {
    if (rule.sourceState !== stock.currentState) return false
    if (rule.itemIds && !rule.itemIds.includes(stock.itemId)) return false
    // Additional rule checking logic
    return true
  }

  private shouldTriggerConversion(rule: ConversionRule, stock: FractionalStock): boolean {
    // Implementation of trigger condition logic
    return false
  }

  private async executeAutomaticConversion(rule: ConversionRule, stock: FractionalStock): Promise<void> {
    // Implementation of automatic conversion execution
  }

  private getQualityScore(grade: string): number {
    const scores = { 'EXCELLENT': 5, 'GOOD': 4, 'FAIR': 3, 'POOR': 2, 'EXPIRED': 1 }
    return scores[grade] || 0
  }

  private getAveragePortionsPerWhole(item: FractionalItem): number {
    const totalPortions = item.availablePortions.reduce((sum, p) => sum + p.portionsPerWhole, 0)
    return totalPortions / item.availablePortions.length
  }

  private estimatePortionsFromConversion(stock: FractionalStock, item: FractionalItem): number {
    const averagePortionsPerWhole = this.getAveragePortionsPerWhole(item)
    return Math.floor(stock.wholeUnitsAvailable * averagePortionsPerWhole * (1 - item.wastePercentage / 100))
  }

  private async evaluateConversionOpportunity(
    stock: FractionalStock, 
    item: FractionalItem
  ): Promise<ConversionRecommendation | null> {
    // Implementation of conversion opportunity evaluation
    return null
  }

  private async getAllActiveStocks(): Promise<FractionalStock[]> {
    // Implementation would fetch from database
    return []
  }

  private async getStocksByLocation(locationId?: string): Promise<FractionalStock[]> {
    // Implementation would fetch from database
    return []
  }

  private async getDailyConversions(): Promise<number> {
    // Implementation would calculate daily conversions
    return 0
  }

  private async getQualityDegradationRate(): Promise<number> {
    // Implementation would calculate quality degradation rate
    return 0
  }

  private async calculateTurnoverRate(locationId?: string): Promise<number> {
    // Implementation would calculate turnover rate
    return 0
  }

  private async getStockoutEvents(locationId?: string): Promise<number> {
    // Implementation would get stockout events
    return 0
  }

  private async getConversionBacklog(locationId?: string): Promise<number> {
    // Implementation would get conversion backlog
    return 0
  }

  private async getConversionRecommendations(locationId?: string): Promise<ConversionRecommendation[]> {
    // Implementation would get conversion recommendations
    return []
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`
  }
}

export const fractionalInventoryService = FractionalInventoryService.getInstance()