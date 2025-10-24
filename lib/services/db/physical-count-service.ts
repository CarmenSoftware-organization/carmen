/**
 * Physical Count Service
 * 
 * Handles physical inventory counts, cycle counts, spot checks,
 * and variance analysis with comprehensive audit trails.
 */

import { prisma } from '@/lib/db'
import type { PrismaClient } from '@/lib/db/prisma'
import { inventoryService } from './inventory-service'
import type {
  PhysicalCount,
  PhysicalCountItem,
  PhysicalCountStatus,
  SpotCheck,
  SpotCheckItem
} from '@/lib/types/inventory'
import { TransactionType } from '@/lib/types/inventory'
import type { Money } from '@/lib/types/common'

/**
 * Physical count creation input
 */
export interface CreatePhysicalCountInput {
  countNumber?: string
  countDate: Date
  countType: 'full' | 'cycle' | 'spot'
  locationId: string
  departmentId?: string
  countedBy: string[]
  supervisedBy?: string
  notes?: string
  itemIds?: string[] // For cycle counts - specific items to count
  createdBy: string
}

/**
 * Physical count item update input
 */
export interface UpdatePhysicalCountItemInput {
  countedQuantity: number
  comments?: string
  countedBy: string
}

/**
 * Spot check creation input
 */
export interface CreateSpotCheckInput {
  checkNumber?: string
  checkDate: Date
  locationId: string
  checkType: 'random' | 'targeted' | 'investigative'
  reason: string
  assignedTo: string
  itemIds: string[] // Items to check
  notes?: string
  createdBy: string
}

/**
 * Spot check item update input
 */
export interface UpdateSpotCheckItemInput {
  actualQuantity: number
  notes?: string
  checkedBy: string
}

/**
 * Physical count filters
 */
export interface PhysicalCountFilters {
  countType?: ('full' | 'cycle' | 'spot')[]
  status?: PhysicalCountStatus[]
  locationIds?: string[]
  departmentIds?: string[]
  countedBy?: string[]
  dateFrom?: Date
  dateTo?: Date
  hasDiscrepancies?: boolean
  isFinalized?: boolean
  search?: string
}

/**
 * Spot check filters
 */
export interface SpotCheckFilters {
  checkType?: ('random' | 'targeted' | 'investigative')[]
  status?: ('active' | 'completed' | 'cancelled')[]
  locationIds?: string[]
  assignedTo?: string[]
  dateFrom?: Date
  dateTo?: Date
  hasDiscrepancies?: boolean
  search?: string
}

/**
 * Variance analysis result
 */
export interface VarianceAnalysis {
  itemId: string
  itemName: string
  itemCode: string
  expectedQuantity: number
  countedQuantity: number
  variance: number
  variancePercentage: number
  varianceValue: Money
  varianceType: 'positive' | 'negative' | 'none'
  possibleCauses: string[]
  recommendations: string[]
}

/**
 * Count statistics
 */
export interface CountStatistics {
  totalCounts: number
  completedCounts: number
  pendingCounts: number
  totalVariance: Money
  averageAccuracy: number
  topVarianceItems: VarianceAnalysis[]
  countsByLocation: Record<string, number>
  countsByType: Record<string, number>
}

/**
 * Service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class PhysicalCountService {
  private db: any

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
  }

  /**
   * Create new physical count
   */
  async createPhysicalCount(input: CreatePhysicalCountInput): Promise<ServiceResult<PhysicalCount>> {
    try {
      const countNumber = input.countNumber || await this.generateCountNumber(input.countType)
      
      // Get items to count based on type and filters
      let itemsToCount: string[] = []
      
      if (input.countType === 'full') {
        // Get all active items in the location
        const itemBalances = await (this.db as any).stock_balances.findMany({
          where: {
            location_id: input.locationId,
            quantity_on_hand: { gt: 0 }
          },
          select: { item_id: true }
        })
        itemsToCount = itemBalances.map((b: any) => b.item_id)
      } else if (input.countType === 'cycle' && input.itemIds) {
        // Use specified items for cycle count
        itemsToCount = input.itemIds
      } else if (input.countType === 'spot') {
        // Random selection for spot count
        const itemBalances = await (this.db as any).stock_balances.findMany({
          where: {
            location_id: input.locationId,
            quantity_on_hand: { gt: 0 }
          },
          select: { item_id: true },
          take: 20 // Random sample
        })
        itemsToCount = itemBalances.map((b: any) => b.item_id)
      }

      const dbCount = await (this.db as any).physical_counts.create({
        data: {
          count_number: countNumber,
          count_date: input.countDate,
          count_type: input.countType,
          status: 'planning',
          location_id: input.locationId,
          department_id: input.departmentId,
          counted_by: input.countedBy,
          supervised_by: input.supervisedBy,
          start_time: null,
          end_time: null,
          total_items: itemsToCount.length,
          items_counted: 0,
          discrepancies_found: 0,
          total_variance_value_amount: 0,
          total_variance_value_currency: 'USD',
          notes: input.notes,
          is_finalized: false,
          created_by: input.createdBy
        }
      })

      // Create count items
      const countItems = await Promise.all(
        itemsToCount.map(async (itemId, index) => {
          // Get expected quantity from stock balance
          const balance = await inventoryService.getStockBalance(itemId, input.locationId)
          const expectedQuantity = balance.data?.quantityOnHand || 0

          return (this.db as any).physical_count_items.create({
            data: {
              id: `pci-${dbCount.id}-${index}`,
              count_id: dbCount.id,
              item_id: itemId,
              expected_quantity: expectedQuantity,
              variance: 0,
              variance_value_amount: 0,
              variance_value_currency: 'USD',
              is_recounted: false,
              status: 'pending'
            }
          })
        })
      )

      const count = await this.transformDbCountToPhysicalCount({
        ...dbCount,
        physical_count_items: countItems
      })

      return {
        success: true,
        data: count
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create physical count: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Start physical count
   */
  async startPhysicalCount(countId: string, startedBy: string): Promise<ServiceResult<PhysicalCount>> {
    try {
      const dbCount = await (this.db as any).physical_counts.findUnique({
        where: { id: countId },
        include: { physical_count_items: true }
      })

      if (!dbCount) {
        return {
          success: false,
          error: 'Physical count not found'
        }
      }

      if (dbCount.status !== 'planning') {
        return {
          success: false,
          error: `Cannot start count with status: ${dbCount.status}`
        }
      }

      const updatedCount = await (this.db as any).physical_counts.update({
        where: { id: countId },
        data: {
          status: 'in_progress',
          start_time: new Date(),
          updated_by: startedBy,
          updated_at: new Date()
        },
        include: { physical_count_items: true }
      })

      const count = await this.transformDbCountToPhysicalCount(updatedCount)

      return {
        success: true,
        data: count
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to start physical count: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update count item with actual count
   */
  async updateCountItem(
    countId: string, 
    itemId: string, 
    input: UpdatePhysicalCountItemInput
  ): Promise<ServiceResult<PhysicalCountItem>> {
    try {
      const countItem = await (this.db as any).physical_count_items.findFirst({
        where: {
          count_id: countId,
          item_id: itemId
        }
      })

      if (!countItem) {
        return {
          success: false,
          error: 'Count item not found'
        }
      }

      // Calculate variance
      const variance = input.countedQuantity - countItem.expected_quantity
      const varianceValue = Math.abs(variance) * 10 // Simplified - should use actual unit cost

      // Determine status based on variance
      const status = variance === 0 ? 'counted' : 'variance'

      const updatedItem = await (this.db as any).physical_count_items.update({
        where: { id: countItem.id },
        data: {
          counted_quantity: input.countedQuantity,
          variance,
          variance_value_amount: varianceValue,
          variance_value_currency: 'USD',
          comments: input.comments,
          counted_by: input.countedBy,
          counted_at: new Date(),
          status
        }
      })

      // Update count statistics
      await this.updateCountStatistics(countId)

      const transformedItem = this.transformDbItemToPhysicalCountItem(updatedItem)

      return {
        success: true,
        data: transformedItem
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update count item: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Complete physical count
   */
  async completePhysicalCount(countId: string, completedBy: string): Promise<ServiceResult<PhysicalCount>> {
    try {
      const dbCount = await (this.db as any).physical_counts.findUnique({
        where: { id: countId },
        include: { physical_count_items: true }
      })

      if (!dbCount) {
        return {
          success: false,
          error: 'Physical count not found'
        }
      }

      if (dbCount.status !== 'in_progress') {
        return {
          success: false,
          error: `Cannot complete count with status: ${dbCount.status}`
        }
      }

      // Check if all items are counted
      const pendingItems = dbCount.physical_count_items.filter((item: any) =>
        item.status === 'pending'
      )

      if (pendingItems.length > 0) {
        return {
          success: false,
          error: `Cannot complete count. ${pendingItems.length} items still pending.`
        }
      }

      const updatedCount = await (this.db as any).physical_counts.update({
        where: { id: countId },
        data: {
          status: 'completed',
          end_time: new Date(),
          updated_by: completedBy,
          updated_at: new Date()
        },
        include: { physical_count_items: true }
      })

      const count = await this.transformDbCountToPhysicalCount(updatedCount)

      return {
        success: true,
        data: count
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to complete physical count: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Finalize physical count (post adjustments)
   */
  async finalizePhysicalCount(countId: string, finalizedBy: string): Promise<ServiceResult<PhysicalCount>> {
    try {
      const dbCount = await (this.db as any).physical_counts.findUnique({
        where: { id: countId },
        include: { physical_count_items: true }
      })

      if (!dbCount) {
        return {
          success: false,
          error: 'Physical count not found'
        }
      }

      if (dbCount.status !== 'completed') {
        return {
          success: false,
          error: `Cannot finalize count with status: ${dbCount.status}`
        }
      }

      // Create adjustment transactions for variances
      for (const item of dbCount.physical_count_items) {
        if (item.variance !== 0) {
          const transactionType = item.variance > 0 
            ? TransactionType.ADJUST_UP 
            : TransactionType.ADJUST_DOWN

          await inventoryService.recordInventoryTransaction({
            itemId: item.item_id,
            locationId: dbCount.location_id,
            transactionType,
            quantity: Math.abs(item.variance),
            unitCost: { amount: 10, currency: 'USD' }, // Simplified - should use actual cost
            referenceNo: dbCount.count_number,
            referenceType: 'PHYSICAL_COUNT',
            notes: `Physical count variance adjustment: ${item.comments || ''}`,
            userId: finalizedBy
          })
        }
      }

      const updatedCount = await (this.db as any).physical_counts.update({
        where: { id: countId },
        data: {
          status: 'finalized',
          is_finalized: true,
          finalized_by: finalizedBy,
          finalized_at: new Date(),
          updated_by: finalizedBy,
          updated_at: new Date()
        },
        include: { physical_count_items: true }
      })

      const count = await this.transformDbCountToPhysicalCount(updatedCount)

      return {
        success: true,
        data: count
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
  async createSpotCheck(input: CreateSpotCheckInput): Promise<ServiceResult<SpotCheck>> {
    try {
      const checkNumber = input.checkNumber || await this.generateSpotCheckNumber()

      const dbSpotCheck = await (this.db as any).spot_checks.create({
        data: {
          check_number: checkNumber,
          check_date: input.checkDate,
          location_id: input.locationId,
          check_type: input.checkType,
          reason: input.reason,
          status: 'active',
          assigned_to: input.assignedTo,
          start_time: null,
          end_time: null,
          items_to_check: input.itemIds.length,
          items_checked: 0,
          discrepancies: 0,
          notes: input.notes,
          created_by: input.createdBy
        }
      })

      // Create spot check items
      const spotCheckItems = await Promise.all(
        input.itemIds.map(async (itemId, index) => {
          // Get expected quantity
          const balance = await inventoryService.getStockBalance(itemId, input.locationId)
          const expectedQuantity = balance.data?.quantityOnHand || 0

          return (this.db as any).spot_check_items.create({
            data: {
              id: `sci-${dbSpotCheck.id}-${index}`,
              spot_check_id: dbSpotCheck.id,
              item_id: itemId,
              expected_quantity: expectedQuantity,
              variance: 0,
              status: 'pending'
            }
          })
        })
      )

      const spotCheck = await this.transformDbSpotCheckToSpotCheck({
        ...dbSpotCheck,
        spot_check_items: spotCheckItems
      })

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
   * Update spot check item
   */
  async updateSpotCheckItem(
    spotCheckId: string,
    itemId: string,
    input: UpdateSpotCheckItemInput
  ): Promise<ServiceResult<SpotCheckItem>> {
    try {
      const spotCheckItem = await (this.db as any).spot_check_items.findFirst({
        where: {
          spot_check_id: spotCheckId,
          item_id: itemId
        }
      })

      if (!spotCheckItem) {
        return {
          success: false,
          error: 'Spot check item not found'
        }
      }

      const variance = input.actualQuantity - spotCheckItem.expected_quantity
      const status = variance === 0 ? 'checked' : 'discrepancy'

      const updatedItem = await (this.db as any).spot_check_items.update({
        where: { id: spotCheckItem.id },
        data: {
          actual_quantity: input.actualQuantity,
          variance,
          status,
          checked_by: input.checkedBy,
          checked_at: new Date(),
          notes: input.notes
        }
      })

      // Update spot check statistics
      await this.updateSpotCheckStatistics(spotCheckId)

      const transformedItem = this.transformDbItemToSpotCheckItem(updatedItem)

      return {
        success: true,
        data: transformedItem
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update spot check item: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate variance analysis
   */
  async generateVarianceAnalysis(countId: string): Promise<ServiceResult<VarianceAnalysis[]>> {
    try {
      const count = await (this.db as any).physical_counts.findUnique({
        where: { id: countId },
        include: {
          physical_count_items: {
            include: {
              inventory_items: true
            }
          }
        }
      })

      if (!count) {
        return {
          success: false,
          error: 'Physical count not found'
        }
      }

      const analysis: VarianceAnalysis[] = count.physical_count_items
        .filter((item: any) => item.variance !== 0)
        .map((item: any) => {
          const variancePercentage = item.expected_quantity === 0 
            ? 100 
            : Math.abs(item.variance / item.expected_quantity) * 100

          const varianceType: 'positive' | 'negative' | 'none' = 
            item.variance > 0 ? 'positive' : 
            item.variance < 0 ? 'negative' : 'none'

          // Generate possible causes based on variance pattern
          const possibleCauses: string[] = []
          const recommendations: string[] = []

          if (varianceType === 'negative') {
            possibleCauses.push('Shrinkage/theft', 'Recording errors', 'Unrecorded issues')
            recommendations.push('Review security measures', 'Audit transaction records')
          } else if (varianceType === 'positive') {
            possibleCauses.push('Unrecorded receipts', 'Data entry errors', 'Returns not processed')
            recommendations.push('Review receiving procedures', 'Audit recent transactions')
          }

          if (variancePercentage > 20) {
            possibleCauses.push('System error', 'Major process breakdown')
            recommendations.push('Immediate investigation required', 'Process review')
          }

          return {
            itemId: item.item_id,
            itemName: item.inventory_items?.item_name || 'Unknown',
            itemCode: item.inventory_items?.item_code || 'Unknown',
            expectedQuantity: item.expected_quantity,
            countedQuantity: item.counted_quantity || 0,
            variance: item.variance,
            variancePercentage: Math.round(variancePercentage * 100) / 100,
            varianceValue: {
              amount: item.variance_value_amount,
              currency: item.variance_value_currency
            },
            varianceType,
            possibleCauses,
            recommendations
          }
        })
        .sort((a: VarianceAnalysis, b: VarianceAnalysis) => Math.abs(b.varianceValue.amount) - Math.abs(a.varianceValue.amount))

      return {
        success: true,
        data: analysis
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate variance analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get count statistics
   */
  async getCountStatistics(dateFrom?: Date, dateTo?: Date): Promise<ServiceResult<CountStatistics>> {
    try {
      const whereClause: any = {}
      if (dateFrom || dateTo) {
        whereClause.count_date = {}
        if (dateFrom) whereClause.count_date.gte = dateFrom
        if (dateTo) whereClause.count_date.lte = dateTo
      }

      const [counts, statusCounts, locationCounts, typeCounts] = await Promise.all([
        (this.db as any).physical_counts.findMany({
          where: whereClause,
          include: { physical_count_items: true }
        }),
        (this.db as any).physical_counts.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true }
        }),
        (this.db as any).physical_counts.groupBy({
          by: ['location_id'],
          where: whereClause,
          _count: { location_id: true }
        }),
        (this.db as any).physical_counts.groupBy({
          by: ['count_type'],
          where: whereClause,
          _count: { count_type: true }
        })
      ])

      const totalCounts = counts.length
      const completedCounts = statusCounts.find((s: any) => s.status === 'completed')?._count.status || 0
      const pendingCounts = statusCounts.find((s: any) => s.status === 'planning')?._count.status || 0

      const totalVarianceValue = counts.reduce((sum: number, count: any) =>
        sum + count.total_variance_value_amount, 0
      )

      const totalVariance: Money = {
        amount: totalVarianceValue,
        currency: 'USD'
      }

      // Calculate accuracy
      const totalItemsExpected = counts.reduce((sum: number, count: any) => sum + count.total_items, 0)
      const totalItemsAccurate = counts.reduce((sum: number, count: any) =>
        sum + (count.total_items - count.discrepancies_found), 0
      )
      const averageAccuracy = totalItemsExpected > 0 
        ? (totalItemsAccurate / totalItemsExpected) * 100 
        : 0

      const countsByLocation = locationCounts.reduce((acc: Record<string, number>, item: any) => {
        acc[item.location_id] = item._count.location_id
        return acc
      }, {} as Record<string, number>)

      const countsByType = typeCounts.reduce((acc: Record<string, number>, item: any) => {
        acc[item.count_type] = item._count.count_type
        return acc
      }, {} as Record<string, number>)

      const stats: CountStatistics = {
        totalCounts,
        completedCounts,
        pendingCounts,
        totalVariance,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        topVarianceItems: [], // Would need more complex query
        countsByLocation,
        countsByType
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get count statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update count statistics
   */
  private async updateCountStatistics(countId: string): Promise<void> {
    const items = await (this.db as any).physical_count_items.findMany({
      where: { count_id: countId }
    })

    const itemsCounted = items.filter((item: any) => item.status !== 'pending').length
    const discrepancies = items.filter((item: any) => item.status === 'variance').length
    const totalVariance = items.reduce((sum: number, item: any) => sum + Math.abs(item.variance_value_amount), 0)

    await (this.db as any).physical_counts.update({
      where: { id: countId },
      data: {
        items_counted: itemsCounted,
        discrepancies_found: discrepancies,
        total_variance_value_amount: totalVariance,
        updated_at: new Date()
      }
    })
  }

  /**
   * Update spot check statistics
   */
  private async updateSpotCheckStatistics(spotCheckId: string): Promise<void> {
    const items = await (this.db as any).spot_check_items.findMany({
      where: { spot_check_id: spotCheckId }
    })

    const itemsChecked = items.filter((item: any) => item.status !== 'pending').length
    const discrepancies = items.filter((item: any) => item.status === 'discrepancy').length

    await (this.db as any).spot_checks.update({
      where: { id: spotCheckId },
      data: {
        items_checked: itemsChecked,
        discrepancies,
        updated_at: new Date()
      }
    })
  }

  /**
   * Generate count number
   */
  private async generateCountNumber(countType: string): Promise<string> {
    const typePrefix = {
      full: 'FC',
      cycle: 'CC',
      spot: 'SC'
    }[countType] || 'PC'

    const timestamp = Date.now().toString().slice(-6)
    return `${typePrefix}${timestamp}`
  }

  /**
   * Generate spot check number
   */
  private async generateSpotCheckNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6)
    return `SPT${timestamp}`
  }

  /**
   * Transform database count to physical count
   */
  private async transformDbCountToPhysicalCount(dbCount: any): Promise<PhysicalCount> {
    const items: PhysicalCountItem[] = (dbCount.physical_count_items || []).map((item: any) => 
      this.transformDbItemToPhysicalCountItem(item)
    )

    return {
      id: dbCount.id,
      countNumber: dbCount.count_number,
      countDate: dbCount.count_date,
      countType: dbCount.count_type,
      status: dbCount.status as PhysicalCountStatus,
      locationId: dbCount.location_id,
      departmentId: dbCount.department_id || undefined,
      countedBy: dbCount.counted_by,
      supervisedBy: dbCount.supervised_by || undefined,
      startTime: dbCount.start_time || undefined,
      endTime: dbCount.end_time || undefined,
      totalItems: dbCount.total_items,
      itemsCounted: dbCount.items_counted,
      discrepanciesFound: dbCount.discrepancies_found,
      totalVarianceValue: {
        amount: dbCount.total_variance_value_amount,
        currency: dbCount.total_variance_value_currency
      },
      notes: dbCount.notes || undefined,
      isFinalized: dbCount.is_finalized,
      finalizedBy: dbCount.finalized_by || undefined,
      finalizedAt: dbCount.finalized_at || undefined,
      items,
      createdAt: dbCount.created_at,
      updatedAt: dbCount.updated_at,
      createdBy: dbCount.created_by,
      updatedBy: dbCount.updated_by || undefined
    }
  }

  /**
   * Transform database item to physical count item
   */
  private transformDbItemToPhysicalCountItem(dbItem: any): PhysicalCountItem {
    return {
      id: dbItem.id,
      countId: dbItem.count_id,
      itemId: dbItem.item_id,
      expectedQuantity: dbItem.expected_quantity,
      countedQuantity: dbItem.counted_quantity || undefined,
      variance: dbItem.variance,
      varianceValue: {
        amount: dbItem.variance_value_amount,
        currency: dbItem.variance_value_currency
      },
      reasonCode: dbItem.reason_code || undefined,
      comments: dbItem.comments || undefined,
      countedBy: dbItem.counted_by || undefined,
      countedAt: dbItem.counted_at || undefined,
      isRecounted: dbItem.is_recounted,
      recountQuantity: dbItem.recount_quantity || undefined,
      recountedBy: dbItem.recounted_by || undefined,
      recountedAt: dbItem.recounted_at || undefined,
      status: dbItem.status
    }
  }

  /**
   * Transform database spot check to spot check
   */
  private async transformDbSpotCheckToSpotCheck(dbSpotCheck: any): Promise<SpotCheck> {
    const items: SpotCheckItem[] = (dbSpotCheck.spot_check_items || []).map((item: any) => 
      this.transformDbItemToSpotCheckItem(item)
    )

    return {
      id: dbSpotCheck.id,
      checkNumber: dbSpotCheck.check_number,
      checkDate: dbSpotCheck.check_date,
      locationId: dbSpotCheck.location_id,
      checkType: dbSpotCheck.check_type,
      reason: dbSpotCheck.reason,
      status: dbSpotCheck.status,
      assignedTo: dbSpotCheck.assigned_to,
      completedBy: dbSpotCheck.completed_by || undefined,
      startTime: dbSpotCheck.start_time || undefined,
      endTime: dbSpotCheck.end_time || undefined,
      itemsToCheck: dbSpotCheck.items_to_check,
      itemsChecked: dbSpotCheck.items_checked,
      discrepancies: dbSpotCheck.discrepancies,
      notes: dbSpotCheck.notes || undefined,
      items,
      createdAt: dbSpotCheck.created_at,
      updatedAt: dbSpotCheck.updated_at,
      createdBy: dbSpotCheck.created_by,
      updatedBy: dbSpotCheck.updated_by || undefined
    }
  }

  /**
   * Transform database item to spot check item
   */
  private transformDbItemToSpotCheckItem(dbItem: any): SpotCheckItem {
    return {
      id: dbItem.id,
      spotCheckId: dbItem.spot_check_id,
      itemId: dbItem.item_id,
      expectedQuantity: dbItem.expected_quantity,
      actualQuantity: dbItem.actual_quantity || undefined,
      variance: dbItem.variance,
      status: dbItem.status,
      checkedBy: dbItem.checked_by || undefined,
      checkedAt: dbItem.checked_at || undefined,
      notes: dbItem.notes || undefined
    }
  }
}

// Export singleton instance
export const physicalCountService = new PhysicalCountService()