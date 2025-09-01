/**
 * Physical Count Management Service
 * 
 * Comprehensive service for managing physical inventory counts, cycle counts,
 * spot checks, and inventory adjustments with full audit trail and variance analysis.
 */

import { prisma, type PrismaClient } from '@/lib/db'
import { comprehensiveInventoryService } from './comprehensive-inventory-service'
import type {
  PhysicalCount,
  PhysicalCountItem,
  PhysicalCountStatus,
  SpotCheck,
  SpotCheckItem,
  InventoryAdjustment,
  InventoryAdjustmentItem,
  AdjustmentReason,
  TransactionType
} from '@/lib/types/inventory'
import type { Money, DocumentStatus } from '@/lib/types/common'

/**
 * Count planning interface
 */
export interface CountPlan {
  id: string
  planName: string
  planType: 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'custom'
  locationIds: string[]
  categoryIds?: string[]
  itemIds?: string[]
  frequency: number // days between counts
  planStatus: 'active' | 'inactive' | 'completed'
  nextCountDate: Date
  countCriteria: {
    abcClassification?: ('A' | 'B' | 'C')[]
    valueThreshold?: Money
    velocityThreshold?: number
    lastCountDaysThreshold?: number
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

/**
 * Count scheduling interface
 */
export interface CountSchedule {
  id: string
  planId?: string
  scheduledDate: Date
  countType: 'full' | 'cycle' | 'spot'
  locationId: string
  departmentId?: string
  assignedTo: string[]
  supervisorId?: string
  estimatedDuration: number // minutes
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  itemSelectionCriteria: {
    totalItems?: number
    randomSampling?: boolean
    focusItems?: string[]
    excludeItems?: string[]
  }
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

/**
 * Count variance analysis
 */
export interface VarianceAnalysis {
  countId: string
  totalItemsCounted: number
  itemsWithVariance: number
  varianceRate: number
  totalVarianceValue: Money
  varianceBreakdown: {
    positive: { items: number; value: Money }
    negative: { items: number; value: Money }
  }
  significantVariances: {
    itemId: string
    itemName: string
    expectedQuantity: number
    countedQuantity: number
    variance: number
    variancePercentage: number
    varianceValue: Money
    reasonCode?: string
    investigationRequired: boolean
  }[]
  rootCauseAnalysis: {
    systemErrors: number
    processingErrors: number
    damagedGoods: number
    theft: number
    countingErrors: number
    other: number
  }
  recommendations: string[]
}

/**
 * Count accuracy metrics
 */
export interface CountAccuracyMetrics {
  locationId: string
  periodStart: Date
  periodEnd: Date
  totalCountsCompleted: number
  totalItemsCounted: number
  overallAccuracy: number
  accuracyByCategory: {
    categoryId: string
    categoryName: string
    accuracy: number
    itemsCounted: number
  }[]
  accuracyTrend: {
    date: Date
    accuracy: number
  }[]
  topVarianceItems: {
    itemId: string
    itemName: string
    totalVariances: number
    averageVariance: number
    lastVarianceDate: Date
  }[]
  countEfficiency: {
    averageTimePerItem: number
    completionRate: number
    reworkRate: number
  }
}

/**
 * Service result for count operations
 */
export interface CountOperationResult<T> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
  validationIssues?: {
    field: string
    message: string
    severity: 'warning' | 'error'
  }[]
}

export class PhysicalCountService {
  private db: PrismaClient
  private inventoryService = comprehensiveInventoryService

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
  }

  /**
   * Create a new physical count
   */
  async createPhysicalCount(
    locationId: string,
    countType: 'full' | 'cycle' | 'spot',
    countedBy: string[],
    userId: string,
    options: {
      scheduledDate?: Date
      departmentId?: string
      supervisedBy?: string
      itemIds?: string[]
      categoryIds?: string[]
      countCriteria?: any
      notes?: string
    } = {}
  ): Promise<CountOperationResult<PhysicalCount>> {
    try {
      // Generate count number
      const countNumber = await this.generateCountNumber(countType)

      // Determine items to count
      const itemsToCount = await this.determineItemsToCount(
        locationId,
        countType,
        options.itemIds,
        options.categoryIds,
        options.countCriteria
      )

      if (itemsToCount.length === 0) {
        return {
          success: false,
          error: 'No items found to count based on the specified criteria'
        }
      }

      // Validate counters and supervisor
      const validationResult = await this.validateCountPersonnel(countedBy, options.supervisedBy)
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error,
          validationIssues: validationResult.validationIssues
        }
      }

      // Create physical count record
      const physicalCount: PhysicalCount = {
        id: `count-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        countNumber,
        countDate: options.scheduledDate || new Date(),
        countType,
        status: 'planning',
        locationId,
        departmentId: options.departmentId,
        countedBy,
        supervisedBy: options.supervisedBy,
        totalItems: itemsToCount.length,
        itemsCounted: 0,
        discrepanciesFound: 0,
        totalVarianceValue: { amount: 0, currencyCode: 'USD' },
        notes: options.notes,
        isFinalized: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      }

      // Store physical count
      await this.storePhysicalCount(physicalCount)

      // Create count items
      const countItems = await this.createCountItems(physicalCount.id, itemsToCount)

      // Update count with items created
      physicalCount.totalItems = countItems.length

      return {
        success: true,
        data: physicalCount
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create physical count: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update count item with actual quantity
   */
  async updateCountItem(
    countItemId: string,
    countedQuantity: number,
    countedBy: string,
    options: {
      reasonCode?: string
      comments?: string
      requireRecount?: boolean
    } = {}
  ): Promise<CountOperationResult<PhysicalCountItem>> {
    try {
      // Get count item
      const countItem = await this.getCountItemById(countItemId)
      if (!countItem) {
        return {
          success: false,
          error: 'Count item not found'
        }
      }

      // Calculate variance
      const variance = countedQuantity - countItem.expectedQuantity
      const variancePercentage = countItem.expectedQuantity > 0 
        ? (variance / countItem.expectedQuantity) * 100 
        : 0

      // Get item cost for variance value calculation
      const itemCost = await this.getItemCost(countItem.itemId)
      const varianceValue: Money = {
        amount: Math.abs(variance) * itemCost.amount,
        currencyCode: itemCost.currencyCode
      }

      // Update count item
      const updatedCountItem: PhysicalCountItem = {
        ...countItem,
        countedQuantity,
        variance,
        varianceValue,
        reasonCode: options.reasonCode,
        comments: options.comments,
        countedBy,
        countedAt: new Date(),
        isRecounted: false,
        status: Math.abs(variancePercentage) > 5 ? 'variance' : 'counted' // 5% tolerance
      }

      // Check if recount is required
      if (options.requireRecount || Math.abs(variancePercentage) > 10) { // 10% significant variance
        updatedCountItem.status = 'variance'
        // Could trigger automatic recount scheduling here
      }

      // Store updated count item
      await this.updateCountItemRecord(updatedCountItem)

      // Update parent count statistics
      await this.updateCountStatistics(countItem.countId)

      // Check for investigation triggers
      if (Math.abs(variancePercentage) > 20) { // 20% critical variance
        await this.triggerVarianceInvestigation(updatedCountItem)
      }

      return {
        success: true,
        data: updatedCountItem,
        warnings: variancePercentage > 10 ? [`Significant variance detected: ${variancePercentage.toFixed(1)}%`] : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update count item: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Finalize physical count and create adjustments
   */
  async finalizePhysicalCount(
    countId: string,
    finalizedBy: string,
    options: {
      autoApproveVariances?: boolean
      varianceThreshold?: number // percentage
      createAdjustments?: boolean
      notes?: string
    } = {}
  ): Promise<CountOperationResult<{
    count: PhysicalCount
    varianceAnalysis: VarianceAnalysis
    adjustmentsCreated: InventoryAdjustment[]
  }>> {
    try {
      // Get physical count with items
      const physicalCount = await this.getPhysicalCountWithItems(countId)
      if (!physicalCount) {
        return {
          success: false,
          error: 'Physical count not found'
        }
      }

      if (physicalCount.isFinalized) {
        return {
          success: false,
          error: 'Physical count is already finalized'
        }
      }

      // Validate all items are counted
      const uncountedItems = physicalCount.items?.filter(item => item.countedQuantity === undefined) || []
      if (uncountedItems.length > 0) {
        return {
          success: false,
          error: `${uncountedItems.length} items have not been counted yet`,
          validationIssues: uncountedItems.map(item => ({
            field: `item-${item.itemId}`,
            message: 'Item not counted',
            severity: 'error' as const
          }))
        }
      }

      // Perform variance analysis
      const varianceAnalysis = await this.performVarianceAnalysis(physicalCount)

      // Create adjustments if requested and variances exist
      const adjustmentsCreated: InventoryAdjustment[] = []
      if (options.createAdjustments && varianceAnalysis.itemsWithVariance > 0) {
        const varianceItems = (physicalCount.items || []).filter(item => item.variance !== 0)
        
        if (varianceItems.length > 0) {
          const adjustmentResult = await this.createVarianceAdjustment(
            physicalCount,
            varianceItems,
            finalizedBy,
            options.autoApproveVariances
          )
          
          if (adjustmentResult.success && adjustmentResult.data) {
            adjustmentsCreated.push(adjustmentResult.data)
          }
        }
      }

      // Finalize the count
      const finalizedCount: PhysicalCount = {
        ...physicalCount,
        status: 'finalized',
        isFinalized: true,
        finalizedBy,
        finalizedAt: new Date(),
        endTime: new Date(),
        discrepanciesFound: varianceAnalysis.itemsWithVariance,
        totalVarianceValue: varianceAnalysis.totalVarianceValue,
        updatedAt: new Date(),
        updatedBy: finalizedBy
      }

      // Store finalized count
      await this.updatePhysicalCountRecord(finalizedCount)

      // Create audit trail
      await this.createCountAuditLog(countId, finalizedBy, 'finalized', {
        varianceItems: varianceAnalysis.itemsWithVariance,
        totalVarianceValue: varianceAnalysis.totalVarianceValue,
        adjustmentsCreated: adjustmentsCreated.length
      })

      // Update inventory accuracy metrics
      await this.updateInventoryAccuracyMetrics(physicalCount.locationId, varianceAnalysis)

      return {
        success: true,
        data: {
          count: finalizedCount,
          varianceAnalysis,
          adjustmentsCreated
        },
        warnings: varianceAnalysis.itemsWithVariance > 0 ? 
          [`${varianceAnalysis.itemsWithVariance} items have variances`] : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to finalize physical count: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create spot check
   */
  async createSpotCheck(
    locationId: string,
    reason: string,
    assignedTo: string,
    userId: string,
    options: {
      checkType?: 'random' | 'targeted' | 'investigative'
      itemIds?: string[]
      sampleSize?: number
      priority?: 'low' | 'medium' | 'high' | 'critical'
      notes?: string
    } = {}
  ): Promise<CountOperationResult<SpotCheck>> {
    try {
      const checkNumber = await this.generateSpotCheckNumber()
      
      // Determine items to check
      let itemsToCheck: string[]
      if (options.itemIds && options.itemIds.length > 0) {
        itemsToCheck = options.itemIds
      } else {
        // Select random items or high-value items
        itemsToCheck = await this.selectSpotCheckItems(
          locationId,
          options.sampleSize || 10,
          options.checkType === 'random'
        )
      }

      const spotCheck: SpotCheck = {
        id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        checkNumber,
        checkDate: new Date(),
        locationId,
        checkType: options.checkType || 'targeted',
        reason,
        status: 'active',
        assignedTo: assignedTo,
        itemsToCheck: itemsToCheck.length,
        itemsChecked: 0,
        discrepancies: 0,
        notes: options.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      }

      // Store spot check
      await this.storeSpotCheck(spotCheck)

      // Create spot check items
      await this.createSpotCheckItems(spotCheck.id, itemsToCheck)

      return {
        success: true,
        data: spotCheck
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create spot check: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate count schedule based on planning criteria
   */
  async generateCountSchedule(
    planId: string,
    schedulePeriodDays = 30
  ): Promise<CountOperationResult<CountSchedule[]>> {
    try {
      const plan = await this.getCountPlanById(planId)
      if (!plan) {
        return {
          success: false,
          error: 'Count plan not found'
        }
      }

      const schedules: CountSchedule[] = []
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + (schedulePeriodDays * 24 * 60 * 60 * 1000))

      // Generate schedules based on plan frequency
      let currentDate = new Date(plan.nextCountDate)
      
      while (currentDate <= endDate) {
        for (const locationId of plan.locationIds) {
          const schedule: CountSchedule = {
            id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            planId,
            scheduledDate: new Date(currentDate),
            countType: 'cycle', // Default for planned counts
            locationId,
            assignedTo: [], // Would be assigned based on availability
            estimatedDuration: this.estimateCountDuration(plan),
            priority: 'medium',
            status: 'scheduled',
            itemSelectionCriteria: {
              totalItems: this.calculatePlannedItemCount(plan)
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system'
          }

          schedules.push(schedule)
        }

        // Move to next count date
        currentDate.setDate(currentDate.getDate() + plan.frequency)
      }

      // Store schedules
      for (const schedule of schedules) {
        await this.storeCountSchedule(schedule)
      }

      return {
        success: true,
        data: schedules
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate count schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Private helper methods

  private async generateCountNumber(countType: string): Promise<string> {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const typePrefix = countType.charAt(0).toUpperCase()
    const sequence = Date.now().toString().slice(-4)
    return `${typePrefix}C-${dateStr}-${sequence}`
  }

  private async generateSpotCheckNumber(): Promise<string> {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const sequence = Date.now().toString().slice(-4)
    return `SC-${dateStr}-${sequence}`
  }

  private async determineItemsToCount(
    locationId: string,
    countType: 'full' | 'cycle' | 'spot',
    itemIds?: string[],
    categoryIds?: string[],
    countCriteria?: any
  ): Promise<string[]> {
    // Implementation would determine items based on criteria
    // For now, return placeholder
    return itemIds || ['item-001', 'item-002', 'item-003']
  }

  private async validateCountPersonnel(countedBy: string[], supervisedBy?: string): Promise<CountOperationResult<boolean>> {
    // Validate that counters exist and are authorized
    // This would check user permissions and availability
    return { success: true, data: true }
  }

  private async getItemCost(itemId: string): Promise<Money> {
    // Get current item cost from inventory or cost tables
    return { amount: 10.0, currencyCode: 'USD' }
  }

  private async performVarianceAnalysis(physicalCount: PhysicalCount): Promise<VarianceAnalysis> {
    const items = physicalCount.items || []
    const itemsWithVariance = items.filter(item => item.variance !== 0)
    
    const totalVarianceValue = itemsWithVariance.reduce((sum, item) => {
      return sum + Math.abs(item.varianceValue?.amount || 0)
    }, 0)

    const positiveVariances = items.filter(item => item.variance > 0)
    const negativeVariances = items.filter(item => item.variance < 0)

    const significantVariances = itemsWithVariance
      .filter(item => {
        const variancePercentage = item.expectedQuantity > 0 
          ? Math.abs(item.variance / item.expectedQuantity) * 100 
          : 0
        return variancePercentage > 10 // 10% threshold
      })
      .map(item => ({
        itemId: item.itemId,
        itemName: 'Item Name', // Would fetch from database
        expectedQuantity: item.expectedQuantity,
        countedQuantity: item.countedQuantity || 0,
        variance: item.variance,
        variancePercentage: item.expectedQuantity > 0 
          ? (item.variance / item.expectedQuantity) * 100 
          : 0,
        varianceValue: item.varianceValue || { amount: 0, currencyCode: 'USD' },
        reasonCode: item.reasonCode,
        investigationRequired: Math.abs(item.variance / item.expectedQuantity) > 0.2
      }))

    return {
      countId: physicalCount.id,
      totalItemsCounted: items.length,
      itemsWithVariance: itemsWithVariance.length,
      varianceRate: items.length > 0 ? (itemsWithVariance.length / items.length) * 100 : 0,
      totalVarianceValue: { amount: totalVarianceValue, currencyCode: 'USD' },
      varianceBreakdown: {
        positive: {
          items: positiveVariances.length,
          value: {
            amount: positiveVariances.reduce((sum, item) => sum + (item.varianceValue?.amount || 0), 0),
            currencyCode: 'USD'
          }
        },
        negative: {
          items: negativeVariances.length,
          value: {
            amount: negativeVariances.reduce((sum, item) => sum + Math.abs(item.varianceValue?.amount || 0), 0),
            currencyCode: 'USD'
          }
        }
      },
      significantVariances,
      rootCauseAnalysis: {
        systemErrors: 0,
        processingErrors: 0,
        damagedGoods: 0,
        theft: 0,
        countingErrors: 0,
        other: 0
      },
      recommendations: []
    }
  }

  private async createVarianceAdjustment(
    physicalCount: PhysicalCount,
    varianceItems: PhysicalCountItem[],
    userId: string,
    autoApprove = false
  ): Promise<CountOperationResult<InventoryAdjustment>> {
    try {
      const adjustmentNumber = await this.generateAdjustmentNumber()
      
      const totalValue = varianceItems.reduce((sum, item) => 
        sum + Math.abs(item.varianceValue?.amount || 0), 0
      )

      const adjustment: InventoryAdjustment = {
        id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        adjustmentNumber,
        adjustmentDate: new Date(),
        adjustmentType: 'decrease', // Would be determined by net variance
        reason: AdjustmentReason.COUNT_VARIANCE,
        locationId: physicalCount.locationId,
        status: autoApprove ? 'approved' : 'pending',
        requestedBy: userId,
        approvedBy: autoApprove ? userId : undefined,
        approvedAt: autoApprove ? new Date() : undefined,
        totalItems: varianceItems.length,
        totalValue: { amount: totalValue, currencyCode: 'USD' },
        description: `Adjustment from physical count ${physicalCount.countNumber}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      }

      // Store adjustment (would create actual database record)
      
      // Create inventory transactions for each variance
      for (const item of varianceItems) {
        if (item.variance !== 0) {
          await this.inventoryService.recordInventoryTransaction({
            itemId: item.itemId,
            locationId: physicalCount.locationId,
            transactionType: item.variance > 0 ? TransactionType.ADJUST_UP : TransactionType.ADJUST_DOWN,
            quantity: Math.abs(item.variance),
            unitCost: await this.getItemCost(item.itemId),
            referenceNo: adjustment.adjustmentNumber,
            referenceType: 'Physical Count Adjustment',
            notes: `Count variance adjustment: ${item.comments || ''}`,
            userId
          })
        }
      }

      return {
        success: true,
        data: adjustment
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create variance adjustment: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async generateAdjustmentNumber(): Promise<string> {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const sequence = Date.now().toString().slice(-4)
    return `ADJ-${dateStr}-${sequence}`
  }

  // Additional placeholder methods for database operations
  private async storePhysicalCount(count: PhysicalCount): Promise<void> {}
  private async createCountItems(countId: string, itemIds: string[]): Promise<PhysicalCountItem[]> { return [] }
  private async getCountItemById(id: string): Promise<PhysicalCountItem | null> { return null }
  private async updateCountItemRecord(item: PhysicalCountItem): Promise<void> {}
  private async updateCountStatistics(countId: string): Promise<void> {}
  private async triggerVarianceInvestigation(item: PhysicalCountItem): Promise<void> {}
  private async getPhysicalCountWithItems(id: string): Promise<PhysicalCount | null> { return null }
  private async updatePhysicalCountRecord(count: PhysicalCount): Promise<void> {}
  private async createCountAuditLog(countId: string, userId: string, action: string, metadata: any): Promise<void> {}
  private async updateInventoryAccuracyMetrics(locationId: string, analysis: VarianceAnalysis): Promise<void> {}
  private async storeSpotCheck(spotCheck: SpotCheck): Promise<void> {}
  private async createSpotCheckItems(spotCheckId: string, itemIds: string[]): Promise<void> {}
  private async selectSpotCheckItems(locationId: string, sampleSize: number, random: boolean): Promise<string[]> { return [] }
  private async getCountPlanById(id: string): Promise<CountPlan | null> { return null }
  private async storeCountSchedule(schedule: CountSchedule): Promise<void> {}
  
  private estimateCountDuration(plan: CountPlan): number {
    return 120 // minutes
  }
  
  private calculatePlannedItemCount(plan: CountPlan): number {
    return 50 // items
  }
}

// Export singleton instance
export const physicalCountService = new PhysicalCountService()