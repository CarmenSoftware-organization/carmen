// Fractional Inventory Operations Engine
// Handles complex inventory operations for fractional items

import {
  FractionalStock,
  FractionalItem,
  ConversionRecord,
  ConversionType,
  FractionalItemState,
  FractionalInventoryOperation,
  PortionSize
} from '@/lib/types/fractional-inventory'

interface OperationContext {
  performedBy: string
  reason?: string
  orderId?: string
  notes?: string
  forceOperation?: boolean
}

interface ConversionPlan {
  sourceStocks: { stockId: string; quantity: number }[]
  targetState: FractionalItemState
  estimatedOutput: number
  estimatedWaste: number
  estimatedCost: number
  qualityImpact: number
  timeRequiredMinutes: number
  risks: string[]
  recommendations: string[]
}

export class FractionalInventoryOperations {
  private static instance: FractionalInventoryOperations

  public static getInstance(): FractionalInventoryOperations {
    if (!FractionalInventoryOperations.instance) {
      FractionalInventoryOperations.instance = new FractionalInventoryOperations()
    }
    return FractionalInventoryOperations.instance
  }

  // ====== ADVANCED SPLITTING OPERATIONS ======

  /**
   * Advanced item splitting with portion size optimization
   */
  async optimizedSplitOperation(
    stockId: string,
    targetPortions: number,
    context: OperationContext
  ): Promise<{ success: boolean; conversions: ConversionRecord[]; plan: ConversionPlan }> {
    const stock = await this.getStockById(stockId)
    const item = await this.getFractionalItemById(stock.itemId)
    
    if (!stock || !item) {
      throw new Error('Stock or item not found')
    }

    // Create conversion plan
    const plan = await this.createOptimalSplitPlan(stock, item, targetPortions)
    
    if (plan.risks.length > 0 && !context.forceOperation) {
      return {
        success: false,
        conversions: [],
        plan
      }
    }

    const conversions: ConversionRecord[] = []
    
    // Execute split operations according to plan
    for (const source of plan.sourceStocks) {
      const conversion = await this.executeSingleSplit(
        source.stockId,
        source.quantity,
        item.availablePortions[0].id, // Use optimal portion size
        context
      )
      conversions.push(conversion)
    }

    // Update stock states
    await this.updateStockStatesAfterOperation(stockId, conversions)
    
    // Log comprehensive operation
    await this.logComplexOperation('OPTIMIZED_SPLIT', stockId, conversions, context)

    return {
      success: true,
      conversions,
      plan
    }
  }

  /**
   * Batch splitting operation for multiple items
   */
  async batchSplitOperation(
    operations: Array<{
      stockId: string
      targetPortions: number
      portionSizeId: string
      priority: number
    }>,
    context: OperationContext
  ): Promise<{ 
    successful: ConversionRecord[]
    failed: Array<{ stockId: string; error: string }>
    metrics: {
      totalProcessed: number
      totalWaste: number
      totalCost: number
      averageEfficiency: number
    }
  }> {
    const successful: ConversionRecord[] = []
    const failed: Array<{ stockId: string; error: string }> = []
    let totalWaste = 0
    let totalCost = 0
    let totalInput = 0

    // Sort by priority (highest first)
    const sortedOperations = operations.sort((a, b) => b.priority - a.priority)

    for (const operation of sortedOperations) {
      try {
        const result = await this.optimizedSplitOperation(
          operation.stockId,
          operation.targetPortions,
          context
        )

        if (result.success) {
          successful.push(...result.conversions)
          totalWaste += result.plan.estimatedWaste
          totalCost += result.plan.estimatedCost
          totalInput += result.conversions.reduce((sum, c) => sum + c.beforeWholeUnits, 0)
        } else {
          failed.push({
            stockId: operation.stockId,
            error: `Operation failed: ${result.plan.risks.join(', ')}`
          })
        }
      } catch (error) {
        failed.push({
          stockId: operation.stockId,
          error: error.message
        })
      }
    }

    const averageEfficiency = totalInput > 0 ? (totalInput - totalWaste) / totalInput : 0

    return {
      successful,
      failed,
      metrics: {
        totalProcessed: successful.length,
        totalWaste,
        totalCost,
        averageEfficiency
      }
    }
  }

  // ====== ADVANCED COMBINING OPERATIONS ======

  /**
   * Smart combining operation that optimizes portion usage
   */
  async smartCombineOperation(
    stockIds: string[],
    targetWholeUnits: number,
    context: OperationContext
  ): Promise<{
    success: boolean
    conversions: ConversionRecord[]
    optimization: {
      portionsUsed: number
      portionsRemaining: number
      efficiencyScore: number
      qualityImpact: number
    }
  }> {
    const stocks = await this.getStocksByIds(stockIds)
    const items = await this.getFractionalItemsByIds(stocks.map(s => s.itemId))
    
    if (stocks.length === 0 || items.length === 0) {
      throw new Error('Invalid stocks or items')
    }

    // Validate all stocks are the same item type
    const itemId = stocks[0].itemId
    if (!stocks.every(s => s.itemId === itemId)) {
      throw new Error('All stocks must be the same item type for combining')
    }

    const item = items[0]
    const combinePlan = await this.createOptimalCombinePlan(stocks, item, targetWholeUnits)
    
    const conversions: ConversionRecord[] = []
    
    // Execute combines in optimal order (worst quality first)
    const sortedStocks = stocks.sort((a, b) => 
      this.getQualityScore(a.qualityGrade) - this.getQualityScore(b.qualityGrade)
    )

    let remainingTarget = targetWholeUnits
    
    for (const stock of sortedStocks) {
      if (remainingTarget <= 0) break
      
      const maxFromThisStock = Math.floor(stock.totalPortionsAvailable / this.getDefaultPortionsPerWhole(item))
      const toUseFromThisStock = Math.min(remainingTarget, maxFromThisStock)
      
      if (toUseFromThisStock > 0) {
        const conversion = await this.executeSingleCombine(
          stock.id,
          toUseFromThisStock * this.getDefaultPortionsPerWhole(item),
          context
        )
        conversions.push(conversion)
        remainingTarget -= toUseFromThisStock
      }
    }

    // Calculate optimization metrics
    const totalPortionsUsed = conversions.reduce((sum, c) => 
      sum + (c.beforeTotalPortions - c.afterTotalPortions), 0
    )
    const totalPortionsRemaining = stocks.reduce((sum, s) => sum + s.totalPortionsAvailable, 0) - totalPortionsUsed
    const efficiencyScore = totalPortionsUsed > 0 ? 
      (targetWholeUnits * this.getDefaultPortionsPerWhole(item)) / totalPortionsUsed : 0
    const qualityImpact = this.calculateQualityImpact(stocks, conversions)

    return {
      success: remainingTarget === 0,
      conversions,
      optimization: {
        portionsUsed: totalPortionsUsed,
        portionsRemaining: totalPortionsRemaining,
        efficiencyScore,
        qualityImpact
      }
    }
  }

  /**
   * Cross-location combining operation
   */
  async crossLocationCombine(
    sourceLocations: Array<{ locationId: string; stockIds: string[] }>,
    targetLocationId: string,
    targetWholeUnits: number,
    context: OperationContext
  ): Promise<{
    success: boolean
    transfers: Array<{ from: string; to: string; quantity: number; cost: number }>
    conversions: ConversionRecord[]
    totalTransferCost: number
  }> {
    const transfers: Array<{ from: string; to: string; quantity: number; cost: number }> = []
    const conversions: ConversionRecord[] = []
    let totalTransferCost = 0

    // Evaluate transfer costs and benefits
    for (const location of sourceLocations) {
      const stocks = await this.getStocksByIds(location.stockIds)
      const transferCost = await this.calculateTransferCost(
        location.locationId,
        targetLocationId,
        stocks
      )

      if (transferCost.feasible) {
        // Execute transfer
        const transferResult = await this.executeStockTransfer(
          location.stockIds,
          location.locationId,
          targetLocationId,
          context
        )

        transfers.push({
          from: location.locationId,
          to: targetLocationId,
          quantity: transferResult.quantityTransferred,
          cost: transferResult.cost
        })

        totalTransferCost += transferResult.cost

        // Then execute combine at target location
        const combineResult = await this.smartCombineOperation(
          transferResult.newStockIds,
          Math.min(targetWholeUnits, transferResult.quantityTransferred),
          context
        )

        if (combineResult.success) {
          conversions.push(...combineResult.conversions)
        }
      }
    }

    return {
      success: conversions.length > 0,
      transfers,
      conversions,
      totalTransferCost
    }
  }

  // ====== STATE TRANSITION OPERATIONS ======

  /**
   * Mass state transition operation
   */
  async massStateTransition(
    stockIds: string[],
    targetState: FractionalItemState,
    context: OperationContext
  ): Promise<{
    successful: string[]
    failed: Array<{ stockId: string; error: string }>
    conversions: ConversionRecord[]
  }> {
    const successful: string[] = []
    const failed: Array<{ stockId: string; error: string }> = []
    const conversions: ConversionRecord[] = []

    for (const stockId of stockIds) {
      try {
        const conversion = await this.executeStateTransition(stockId, targetState, context)
        conversions.push(conversion)
        successful.push(stockId)
      } catch (error) {
        failed.push({
          stockId,
          error: error.message
        })
      }
    }

    return { successful, failed, conversions }
  }

  /**
   * Conditional state transition based on rules
   */
  async conditionalStateTransition(
    stockIds: string[],
    conditions: {
      maxAge?: number         // Maximum age in hours
      minQuality?: string     // Minimum quality grade
      minQuantity?: number    // Minimum quantity threshold
      targetState: FractionalItemState
    },
    context: OperationContext
  ): Promise<{
    eligible: string[]
    transitions: ConversionRecord[]
    rejected: Array<{ stockId: string; reason: string }>
  }> {
    const eligible: string[] = []
    const rejected: Array<{ stockId: string; reason: string }> = []
    const transitions: ConversionRecord[] = []

    const stocks = await this.getStocksByIds(stockIds)

    for (const stock of stocks) {
      const eligibilityCheck = this.checkTransitionEligibility(stock, conditions)
      
      if (eligibilityCheck.eligible) {
        eligible.push(stock.id)
        const transition = await this.executeStateTransition(
          stock.id, 
          conditions.targetState, 
          context
        )
        transitions.push(transition)
      } else {
        rejected.push({
          stockId: stock.id,
          reason: eligibilityCheck.reason
        })
      }
    }

    return { eligible, transitions, rejected }
  }

  // ====== WASTE MANAGEMENT OPERATIONS ======

  /**
   * Waste optimization operation
   */
  async optimizeWasteOperation(
    stockIds: string[],
    context: OperationContext
  ): Promise<{
    wasteReduced: number
    conversionsOptimized: ConversionRecord[]
    recommendations: Array<{
      stockId: string
      recommendation: string
      potentialSavings: number
    }>
  }> {
    const stocks = await this.getStocksByIds(stockIds)
    const conversionsOptimized: ConversionRecord[] = []
    const recommendations: Array<{
      stockId: string
      recommendation: string
      potentialSavings: number
    }> = []

    let totalWasteReduced = 0

    for (const stock of stocks) {
      const item = await this.getFractionalItemById(stock.itemId)
      if (!item) continue

      // Analyze waste patterns
      const wasteAnalysis = this.analyzeWastePatterns(stock, item)
      
      if (wasteAnalysis.optimizable) {
        // Execute waste reduction conversion
        const optimizedConversion = await this.executeWasteOptimizedConversion(
          stock.id,
          wasteAnalysis.recommendedConversion,
          context
        )
        
        conversionsOptimized.push(optimizedConversion)
        totalWasteReduced += wasteAnalysis.wasteReduction

        recommendations.push({
          stockId: stock.id,
          recommendation: wasteAnalysis.recommendation,
          potentialSavings: wasteAnalysis.potentialSavings
        })
      }
    }

    return {
      wasteReduced: totalWasteReduced,
      conversionsOptimized,
      recommendations
    }
  }

  // ====== UTILITY METHODS ======

  private async createOptimalSplitPlan(
    stock: FractionalStock,
    item: FractionalItem,
    targetPortions: number
  ): Promise<ConversionPlan> {
    const bestPortionSize = this.findOptimalPortionSize(item, targetPortions)
    const wholeUnitsNeeded = Math.ceil(targetPortions / bestPortionSize.portionsPerWhole)
    
    if (stock.wholeUnitsAvailable < wholeUnitsNeeded) {
      return {
        sourceStocks: [{ stockId: stock.id, quantity: stock.wholeUnitsAvailable }],
        targetState: 'PORTIONED',
        estimatedOutput: stock.wholeUnitsAvailable * bestPortionSize.portionsPerWhole,
        estimatedWaste: wholeUnitsNeeded * (item.wastePercentage / 100),
        estimatedCost: wholeUnitsNeeded * (item.conversionCostPerUnit || 0),
        qualityImpact: 0,
        timeRequiredMinutes: wholeUnitsNeeded * 5, // Estimate 5 minutes per unit
        risks: ['Insufficient whole units available'],
        recommendations: ['Consider combining portions from other stocks', 'Reorder raw materials']
      }
    }

    return {
      sourceStocks: [{ stockId: stock.id, quantity: wholeUnitsNeeded }],
      targetState: 'PORTIONED',
      estimatedOutput: targetPortions,
      estimatedWaste: wholeUnitsNeeded * (item.wastePercentage / 100),
      estimatedCost: wholeUnitsNeeded * (item.conversionCostPerUnit || 0),
      qualityImpact: 0,
      timeRequiredMinutes: wholeUnitsNeeded * 5,
      risks: [],
      recommendations: ['Optimal conversion plan']
    }
  }

  private async createOptimalCombinePlan(
    stocks: FractionalStock[],
    item: FractionalItem,
    targetWholeUnits: number
  ): Promise<ConversionPlan> {
    const totalPortionsAvailable = stocks.reduce((sum, s) => sum + s.totalPortionsAvailable, 0)
    const portionsNeeded = targetWholeUnits * this.getDefaultPortionsPerWhole(item)
    
    if (totalPortionsAvailable < portionsNeeded) {
      return {
        sourceStocks: stocks.map(s => ({ stockId: s.id, quantity: s.totalPortionsAvailable })),
        targetState: 'RAW',
        estimatedOutput: Math.floor(totalPortionsAvailable / this.getDefaultPortionsPerWhole(item)),
        estimatedWaste: targetWholeUnits * (item.wastePercentage / 100),
        estimatedCost: targetWholeUnits * (item.conversionCostPerUnit || 0),
        qualityImpact: this.calculateQualityImpact(stocks, []),
        timeRequiredMinutes: targetWholeUnits * 3, // Estimate 3 minutes per unit for combining
        risks: ['Insufficient portions available'],
        recommendations: ['Use available portions only', 'Consider partial combine operation']
      }
    }

    return {
      sourceStocks: stocks.map(s => ({ stockId: s.id, quantity: Math.min(s.totalPortionsAvailable, portionsNeeded) })),
      targetState: 'RAW',
      estimatedOutput: targetWholeUnits,
      estimatedWaste: targetWholeUnits * (item.wastePercentage / 100),
      estimatedCost: targetWholeUnits * (item.conversionCostPerUnit || 0),
      qualityImpact: this.calculateQualityImpact(stocks, []),
      timeRequiredMinutes: targetWholeUnits * 3,
      risks: [],
      recommendations: ['Optimal combining plan']
    }
  }

  private findOptimalPortionSize(item: FractionalItem, targetPortions: number): PortionSize {
    // Find the portion size that minimizes waste for the target quantity
    return item.availablePortions.reduce((best, current) => {
      const currentWaste = targetPortions % current.portionsPerWhole
      const bestWaste = targetPortions % best.portionsPerWhole
      return currentWaste < bestWaste ? current : best
    })
  }

  private checkTransitionEligibility(
    stock: FractionalStock,
    conditions: any
  ): { eligible: boolean; reason?: string } {
    if (conditions.maxAge) {
      const age = this.calculateStockAge(stock)
      if (age > conditions.maxAge) {
        return { eligible: false, reason: 'Stock exceeds maximum age' }
      }
    }

    if (conditions.minQuality) {
      if (this.getQualityScore(stock.qualityGrade) < this.getQualityScore(conditions.minQuality)) {
        return { eligible: false, reason: 'Quality below minimum threshold' }
      }
    }

    if (conditions.minQuantity) {
      if (stock.totalPortionsAvailable < conditions.minQuantity) {
        return { eligible: false, reason: 'Quantity below minimum threshold' }
      }
    }

    return { eligible: true }
  }

  private analyzeWastePatterns(stock: FractionalStock, item: FractionalItem) {
    // Analyze historical waste patterns and suggest optimizations
    const averageWaste = stock.totalWasteGenerated / Math.max(stock.conversionsApplied.length, 1)
    const expectedWaste = item.wastePercentage / 100
    
    return {
      optimizable: averageWaste > expectedWaste * 1.2, // 20% higher than expected
      recommendedConversion: 'PREPARE' as ConversionType,
      wasteReduction: averageWaste - expectedWaste,
      recommendation: 'Optimize preparation process to reduce waste',
      potentialSavings: (averageWaste - expectedWaste) * item.baseCostPerUnit
    }
  }

  private calculateQualityImpact(stocks: FractionalStock[], conversions: ConversionRecord[]): number {
    const averageQuality = stocks.reduce((sum, s) => sum + this.getQualityScore(s.qualityGrade), 0) / stocks.length
    return averageQuality / 5 // Normalize to 0-1 scale
  }

  private calculateStockAge(stock: FractionalStock): number {
    const now = Date.now()
    const created = new Date(stock.createdAt).getTime()
    return (now - created) / (1000 * 60 * 60) // Age in hours
  }

  private getQualityScore(grade: string): number {
    const scores = { 'EXCELLENT': 5, 'GOOD': 4, 'FAIR': 3, 'POOR': 2, 'EXPIRED': 1 }
    return scores[grade] || 0
  }

  private getDefaultPortionsPerWhole(item: FractionalItem): number {
    const defaultPortion = item.availablePortions.find(p => p.id === item.defaultPortionId) ||
                          item.availablePortions[0]
    return defaultPortion?.portionsPerWhole || 1
  }

  // Placeholder methods that would be implemented with actual database operations
  private async getStockById(stockId: string): Promise<FractionalStock | null> { return null }
  private async getFractionalItemById(itemId: string): Promise<FractionalItem | null> { return null }
  private async getStocksByIds(stockIds: string[]): Promise<FractionalStock[]> { return [] }
  private async getFractionalItemsByIds(itemIds: string[]): Promise<FractionalItem[]> { return [] }
  private async executeSingleSplit(stockId: string, quantity: number, portionSizeId: string, context: OperationContext): Promise<ConversionRecord> { return {} as ConversionRecord }
  private async executeSingleCombine(stockId: string, portions: number, context: OperationContext): Promise<ConversionRecord> { return {} as ConversionRecord }
  private async executeStateTransition(stockId: string, targetState: FractionalItemState, context: OperationContext): Promise<ConversionRecord> { return {} as ConversionRecord }
  private async executeWasteOptimizedConversion(stockId: string, conversionType: ConversionType, context: OperationContext): Promise<ConversionRecord> { return {} as ConversionRecord }
  private async updateStockStatesAfterOperation(stockId: string, conversions: ConversionRecord[]): Promise<void> {}
  private async logComplexOperation(type: string, stockId: string, conversions: ConversionRecord[], context: OperationContext): Promise<void> {}
  private async calculateTransferCost(fromLocation: string, toLocation: string, stocks: FractionalStock[]): Promise<{ feasible: boolean; cost: number }> { return { feasible: true, cost: 0 } }
  private async executeStockTransfer(stockIds: string[], fromLocation: string, toLocation: string, context: OperationContext): Promise<{ quantityTransferred: number; cost: number; newStockIds: string[] }> { return { quantityTransferred: 0, cost: 0, newStockIds: [] } }
}

export const fractionalInventoryOperations = FractionalInventoryOperations.getInstance()