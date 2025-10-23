/**
 * Inventory Database Service
 * 
 * Complete inventory service layer that integrates database operations 
 * with calculation services for comprehensive inventory management.
 * Handles stock levels, movements, valuations, and physical counts.
 */

import { prisma, type PrismaClient } from '@/lib/db'
import { InventoryCalculations } from '../calculations/inventory-calculations'
import { CachedInventoryCalculations } from '../cache/cached-inventory-calculations'
import { EnhancedCacheLayer } from '../cache/enhanced-cache-layer'
import type {
  InventoryItem,
  StockBalance,
  InventoryTransaction,
  TransactionType,
  PhysicalCount,
  PhysicalCountItem,
  PhysicalCountStatus,
  SpotCheck,
  SpotCheckItem,
  InventoryAdjustment,
  InventoryAdjustmentItem,
  AdjustmentReason,
  StockMovement,
  StockMovementItem,
  StockCard,
  StockCardMovement,
  InventoryAlert,
  InventoryAlertType,
  InventoryAging,
  SlowMovingInventory
} from '@/lib/types/inventory'
import { CostingMethod } from '@/lib/types/inventory'
import type { Money, DocumentStatus } from '@/lib/types/common'

/**
 * Database inventory item representation
 */
export interface DbInventoryItem {
  id: string
  item_code: string
  item_name: string
  description?: string | null
  category_id: string
  base_unit_id: string
  costing_method: 'FIFO' | 'LIFO' | 'MOVING_AVERAGE' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST'
  is_active: boolean
  is_serialized: boolean
  minimum_quantity?: number | null
  maximum_quantity?: number | null
  reorder_point?: number | null
  reorder_quantity?: number | null
  lead_time_days?: number | null
  last_purchase_date?: Date | null
  last_purchase_price_amount?: number | null
  last_purchase_price_currency?: string | null
  last_sale_date?: Date | null
  last_sale_price_amount?: number | null
  last_sale_price_currency?: string | null
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by?: string | null
}

/**
 * Inventory item creation input
 */
export interface CreateInventoryItemInput {
  itemCode?: string // Auto-generated if not provided
  itemName: string
  description?: string
  categoryId: string
  baseUnitId: string
  costingMethod?: CostingMethod
  isActive?: boolean
  isSerialized?: boolean
  minimumQuantity?: number
  maximumQuantity?: number
  reorderPoint?: number
  reorderQuantity?: number
  leadTimeDays?: number
  createdBy: string
}

/**
 * Inventory item update input
 */
export interface UpdateInventoryItemInput {
  itemName?: string
  description?: string
  categoryId?: string
  baseUnitId?: string
  costingMethod?: CostingMethod
  isActive?: boolean
  isSerialized?: boolean
  minimumQuantity?: number
  maximumQuantity?: number
  reorderPoint?: number
  reorderQuantity?: number
  leadTimeDays?: number
  updatedBy: string
}

/**
 * Stock balance creation input
 */
export interface CreateStockBalanceInput {
  itemId: string
  locationId: string
  quantityOnHand: number
  quantityReserved?: number
  averageCost: Money
  lastMovementDate?: Date
  lastCountDate?: Date
  createdBy: string
}

/**
 * Stock transaction input
 */
export interface CreateInventoryTransactionInput {
  itemId: string
  locationId: string
  transactionType: TransactionType
  quantity: number
  unitCost: Money
  transactionDate?: Date
  referenceNo?: string
  referenceType?: string
  batchNo?: string
  lotNo?: string
  expiryDate?: Date
  notes?: string
  userId: string
}

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
  createdBy: string
}

/**
 * Inventory filters
 */
export interface InventoryFilters {
  categoryIds?: string[]
  locationIds?: string[]
  itemCodes?: string[]
  search?: string
  isActive?: boolean
  hasStock?: boolean
  isLowStock?: boolean
  isOutOfStock?: boolean
  costingMethod?: CostingMethod[]
  lastMovementAfter?: Date
  lastMovementBefore?: Date
  lastCountAfter?: Date
  lastCountBefore?: Date
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
  sortBy?: 'item_name' | 'item_code' | 'quantity_on_hand' | 'last_movement_date' | 'last_count_date'
  sortOrder?: 'asc' | 'desc'
}

export class InventoryService {
  private db: any
  private inventoryCalculations: InventoryCalculations
  private cachedCalculations: CachedInventoryCalculations
  private cacheLayer: EnhancedCacheLayer

  constructor(prismaClient?: any) {
    this.db = prismaClient || prisma
    this.inventoryCalculations = new InventoryCalculations()
    this.cacheLayer = new EnhancedCacheLayer({
      redis: {
        enabled: false,
        fallbackToMemory: true,
        connectionTimeout: 5000
      },
      memory: {
        maxMemoryMB: 50,
        maxEntries: 1000
      },
      ttl: {
        financial: 300,
        inventory: 600,
        vendor: 900,
        default: 300
      },
      invalidation: {
        enabled: true,
        batchSize: 100,
        maxDependencies: 50
      },
      monitoring: {
        enabled: false,
        metricsInterval: 60000
      }
    })
    this.cachedCalculations = new CachedInventoryCalculations(this.cacheLayer)
  }

  /**
   * Get all inventory items with stock information
   */
  async getInventoryItems(
    filters: InventoryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<InventoryItem[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'item_name',
        sortOrder = 'asc'
      } = pagination

      const offset = (page - 1) * limit

      // Build where clause
      const whereClause: any = {}

      if (filters.categoryIds && filters.categoryIds.length > 0) {
        whereClause.category_id = {
          in: filters.categoryIds
        }
      }

      if (filters.itemCodes && filters.itemCodes.length > 0) {
        whereClause.item_code = {
          in: filters.itemCodes
        }
      }

      if (filters.search) {
        whereClause.OR = [
          { item_name: { contains: filters.search, mode: 'insensitive' } },
          { item_code: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      if (filters.isActive !== undefined) {
        whereClause.is_active = filters.isActive
      }

      if (filters.costingMethod && filters.costingMethod.length > 0) {
        whereClause.costing_method = {
          in: filters.costingMethod
        }
      }

      if (filters.lastMovementAfter || filters.lastMovementBefore) {
        whereClause.last_purchase_date = {}
        if (filters.lastMovementAfter) {
          whereClause.last_purchase_date.gte = filters.lastMovementAfter
        }
        if (filters.lastMovementBefore) {
          whereClause.last_purchase_date.lte = filters.lastMovementBefore
        }
      }

      // Execute queries
      const [items, total] = await Promise.all([
        this.db.inventory_items.findMany({
          where: whereClause,
          include: {
            stock_balances: filters.locationIds ? {
              where: {
                location_id: { in: filters.locationIds }
              }
            } : true,
            categories: true
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip: offset,
          take: limit
        }),
        this.db.inventory_items.count({
          where: whereClause
        })
      ])

      // Transform to application format
      const transformedItems = await Promise.all(
        items.map(async (dbItem: any) => await this.transformDbItemToInventoryItem(dbItem))
      )

      // Apply stock-based filters
      let filteredItems = transformedItems
      if (filters.hasStock !== undefined) {
        filteredItems = filteredItems.filter((item: InventoryItem) => {
          const hasStock = this.getTotalStockQuantity(item) > 0
          return filters.hasStock ? hasStock : !hasStock
        })
      }

      if (filters.isLowStock) {
        filteredItems = filteredItems.filter((item: InventoryItem) => {
          const totalStock = this.getTotalStockQuantity(item)
          return item.reorderPoint ? totalStock <= item.reorderPoint : false
        })
      }

      if (filters.isOutOfStock) {
        filteredItems = filteredItems.filter((item: InventoryItem) => this.getTotalStockQuantity(item) === 0)
      }

      return {
        success: true,
        data: filteredItems,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch inventory items: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get inventory item by ID with stock information
   */
  async getInventoryItemById(id: string): Promise<ServiceResult<InventoryItem>> {
    try {
      const dbItem = await this.db.inventory_items.findUnique({
        where: { id },
        include: {
          stock_balances: true,
          categories: true,
          inventory_transactions: {
            orderBy: { transaction_date: 'desc' },
            take: 10 // Last 10 transactions
          }
        }
      })

      if (!dbItem) {
        return {
          success: false,
          error: 'Inventory item not found'
        }
      }

      const item = await this.transformDbItemToInventoryItem(dbItem)

      return {
        success: true,
        data: item
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create new inventory item
   */
  async createInventoryItem(input: CreateInventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    try {
      // Generate item code if not provided
      const itemCode = input.itemCode || await this.generateItemCode(input.categoryId)

      // Check for existing item with same code
      const existingItem = await this.db.inventory_items.findFirst({
        where: { item_code: itemCode }
      })

      if (existingItem) {
        return {
          success: false,
          error: 'Inventory item with this code already exists'
        }
      }

      const dbItem = await this.db.inventory_items.create({
        data: {
          item_code: itemCode,
          item_name: input.itemName,
          description: input.description,
          category_id: input.categoryId,
          base_unit_id: input.baseUnitId,
          costing_method: input.costingMethod || CostingMethod.WEIGHTED_AVERAGE,
          is_active: input.isActive ?? true,
          is_serialized: input.isSerialized ?? false,
          minimum_quantity: input.minimumQuantity,
          maximum_quantity: input.maximumQuantity,
          reorder_point: input.reorderPoint,
          reorder_quantity: input.reorderQuantity,
          lead_time_days: input.leadTimeDays,
          created_by: input.createdBy
        },
        include: {
          stock_balances: true,
          categories: true
        }
      })

      const item = await this.transformDbItemToInventoryItem(dbItem)

      return {
        success: true,
        data: item
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id: string, input: UpdateInventoryItemInput): Promise<ServiceResult<InventoryItem>> {
    try {
      const existingItem = await this.db.inventory_items.findUnique({
        where: { id }
      })

      if (!existingItem) {
        return {
          success: false,
          error: 'Inventory item not found'
        }
      }

      const updateData: any = {}

      if (input.itemName) updateData.item_name = input.itemName
      if (input.description !== undefined) updateData.description = input.description
      if (input.categoryId) updateData.category_id = input.categoryId
      if (input.baseUnitId) updateData.base_unit_id = input.baseUnitId
      if (input.costingMethod) updateData.costing_method = input.costingMethod
      if (input.isActive !== undefined) updateData.is_active = input.isActive
      if (input.isSerialized !== undefined) updateData.is_serialized = input.isSerialized
      if (input.minimumQuantity !== undefined) updateData.minimum_quantity = input.minimumQuantity
      if (input.maximumQuantity !== undefined) updateData.maximum_quantity = input.maximumQuantity
      if (input.reorderPoint !== undefined) updateData.reorder_point = input.reorderPoint
      if (input.reorderQuantity !== undefined) updateData.reorder_quantity = input.reorderQuantity
      if (input.leadTimeDays !== undefined) updateData.lead_time_days = input.leadTimeDays
      if (input.updatedBy) updateData.updated_by = input.updatedBy

      const dbItem = await this.db.inventory_items.update({
        where: { id },
        data: updateData,
        include: {
          stock_balances: true,
          categories: true
        }
      })

      const item = await this.transformDbItemToInventoryItem(dbItem)

      return {
        success: true,
        data: item
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get stock balance for specific item and location
   */
  async getStockBalance(itemId: string, locationId: string): Promise<ServiceResult<StockBalance | null>> {
    try {
      const dbBalance = await this.db.stock_balances.findFirst({
        where: {
          item_id: itemId,
          location_id: locationId
        }
      })

      if (!dbBalance) {
        return {
          success: true,
          data: null
        }
      }

      const balance = this.transformDbBalanceToStockBalance(dbBalance)

      return {
        success: true,
        data: balance
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch stock balance: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create or update stock balance
   */
  async upsertStockBalance(input: CreateStockBalanceInput): Promise<ServiceResult<StockBalance>> {
    try {
      const quantityAvailable = Math.max(0, input.quantityOnHand - (input.quantityReserved || 0))
      const totalValue = {
        amount: input.quantityOnHand * input.averageCost.amount,
        currency: input.averageCost.currency
      }

      const dbBalance = await this.db.stock_balances.upsert({
        where: {
          item_id_location_id: {
            item_id: input.itemId,
            location_id: input.locationId
          }
        },
        create: {
          item_id: input.itemId,
          location_id: input.locationId,
          quantity_on_hand: input.quantityOnHand,
          quantity_reserved: input.quantityReserved || 0,
          quantity_available: quantityAvailable,
          average_cost_amount: input.averageCost.amount,
          average_cost_currency: input.averageCost.currency,
          total_value_amount: totalValue.amount,
          total_value_currency: totalValue.currency,
          last_movement_date: input.lastMovementDate,
          last_count_date: input.lastCountDate,
          created_by: input.createdBy
        },
        update: {
          quantity_on_hand: input.quantityOnHand,
          quantity_reserved: input.quantityReserved || 0,
          quantity_available: quantityAvailable,
          average_cost_amount: input.averageCost.amount,
          average_cost_currency: input.averageCost.currency,
          total_value_amount: totalValue.amount,
          total_value_currency: totalValue.currency,
          last_movement_date: input.lastMovementDate,
          last_count_date: input.lastCountDate,
          updated_by: input.createdBy,
          updated_at: new Date()
        }
      })

      const balance = this.transformDbBalanceToStockBalance(dbBalance)

      return {
        success: true,
        data: balance
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to upsert stock balance: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Record inventory transaction and update stock balance
   */
  async recordInventoryTransaction(input: CreateInventoryTransactionInput): Promise<ServiceResult<{
    transaction: InventoryTransaction
    newBalance: StockBalance
  }>> {
    try {
      const transactionDate = input.transactionDate || new Date()
      const transactionId = `TXN-${Date.now()}`
      const totalCost = {
        amount: input.quantity * input.unitCost.amount,
        currency: input.unitCost.currency
      }

      // Get current stock balance
      const currentBalanceResult = await this.getStockBalance(input.itemId, input.locationId)
      let currentBalance = currentBalanceResult.data
      
      if (!currentBalance) {
        // Create initial balance if doesn't exist
        currentBalance = {
          id: `bal-${Date.now()}`,
          itemId: input.itemId,
          locationId: input.locationId,
          quantityOnHand: 0,
          quantityReserved: 0,
          quantityAvailable: 0,
          averageCost: input.unitCost,
          totalValue: { amount: 0, currency: input.unitCost.currency }
        }
      }

      // Calculate new balance
      let newQuantity = currentBalance?.quantityOnHand || 0
      
      if (['RECEIVE', 'ADJUST_UP', 'TRANSFER_IN'].includes(input.transactionType)) {
        newQuantity += input.quantity
      } else {
        newQuantity = Math.max(0, newQuantity - input.quantity)
      }

      // Record transaction
      const dbTransaction = await this.db.inventory_transactions.create({
        data: {
          transaction_id: transactionId,
          item_id: input.itemId,
          location_id: input.locationId,
          transaction_type: input.transactionType,
          quantity: input.quantity,
          unit_cost_amount: input.unitCost.amount,
          unit_cost_currency: input.unitCost.currency,
          total_cost_amount: totalCost.amount,
          total_cost_currency: totalCost.currency,
          balance_after: newQuantity,
          transaction_date: transactionDate,
          reference_no: input.referenceNo,
          reference_type: input.referenceType,
          batch_no: input.batchNo,
          lot_no: input.lotNo,
          expiry_date: input.expiryDate,
          user_id: input.userId,
          notes: input.notes,
          created_by: input.userId
        }
      })

      // Update stock balance
      const newAverageCost = await this.calculateNewAverageCost(
        currentBalance!,
        input.transactionType,
        input.quantity,
        input.unitCost
      )

      const updatedBalanceResult = await this.upsertStockBalance({
        itemId: input.itemId,
        locationId: input.locationId,
        quantityOnHand: newQuantity,
        quantityReserved: currentBalance?.quantityReserved || 0,
        averageCost: newAverageCost,
        lastMovementDate: transactionDate,
        createdBy: input.userId
      })

      if (!updatedBalanceResult.success || !updatedBalanceResult.data) {
        throw new Error('Failed to update stock balance')
      }

      const transaction = this.transformDbTransactionToInventoryTransaction(dbTransaction)

      return {
        success: true,
        data: {
          transaction,
          newBalance: updatedBalanceResult.data
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to record inventory transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStatistics(): Promise<ServiceResult<{
    totalItems: number
    totalLocations: number
    totalValue: Money
    lowStockItems: number
    outOfStockItems: number
    overstockItems: number
    activeItems: number
    inactiveItems: number
  }>> {
    try {
      const [itemCounts, balanceStats] = await Promise.all([
        this.db.inventory_items.groupBy({
          by: ['is_active'],
          _count: { is_active: true }
        }),
        this.db.stock_balances.aggregate({
          _sum: {
            total_value_amount: true
          },
          _count: {
            location_id: true
          }
        })
      ])

      // Get low stock and out of stock counts
      const lowStockItems = await this.db.inventory_items.count({
        where: {
          stock_balances: {
            some: {
              quantity_on_hand: {
                lte: this.db.raw('reorder_point')
              }
            }
          }
        }
      })

      const outOfStockItems = await this.db.inventory_items.count({
        where: {
          stock_balances: {
            every: {
              quantity_on_hand: 0
            }
          }
        }
      })

      const stats = {
        totalItems: itemCounts.reduce((sum: number, group: any) => sum + group._count.is_active, 0),
        activeItems: itemCounts.find((g: any) => g.is_active)?._count.is_active || 0,
        inactiveItems: itemCounts.find((g: any) => !g.is_active)?._count.is_active || 0,
        totalLocations: await this.db.stock_balances.findMany({
          select: { location_id: true },
          distinct: ['location_id']
        }).then((locations: any[]) => locations.length),
        totalValue: {
          amount: balanceStats._sum.total_value_amount || 0,
          currency: 'USD'
        },
        lowStockItems,
        outOfStockItems,
        overstockItems: 0 // Would need business logic to determine overstock
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get inventory statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate inventory item code
   */
  private async generateItemCode(categoryId: string): Promise<string> {
    const category = await this.db.categories.findUnique({
      where: { id: categoryId },
      select: { name: true }
    })

    const categoryPrefix = category?.name.substring(0, 3).toUpperCase() || 'GEN'
    const timestamp = Date.now().toString().slice(-6)
    
    return `INV${categoryPrefix}${timestamp}`
  }

  /**
   * Calculate new average cost based on costing method
   */
  private async calculateNewAverageCost(
    currentBalance: StockBalance,
    transactionType: TransactionType,
    quantity: number,
    unitCost: Money
  ): Promise<Money> {
    // For receiving transactions, calculate weighted average
    if (['RECEIVE', 'ADJUST_UP', 'TRANSFER_IN'].includes(transactionType)) {
      const currentValue = currentBalance.quantityOnHand * currentBalance.averageCost.amount
      const newValue = quantity * unitCost.amount
      const totalValue = currentValue + newValue
      const totalQuantity = currentBalance.quantityOnHand + quantity
      
      if (totalQuantity > 0) {
        return {
          amount: totalValue / totalQuantity,
          currency: unitCost.currency
        }
      }
    }

    // For other transactions, keep current average cost
    return currentBalance.averageCost
  }

  /**
   * Get total stock quantity for an item across all locations
   */
  private getTotalStockQuantity(item: InventoryItem): number {
    // This would be calculated from stock_balances if available
    // For now, return 0 as placeholder
    return 0
  }

  /**
   * Transform database item to inventory item
   */
  private async transformDbItemToInventoryItem(dbItem: any): Promise<InventoryItem> {
    return {
      id: dbItem.id,
      itemCode: dbItem.item_code,
      itemName: dbItem.item_name,
      description: dbItem.description || undefined,
      categoryId: dbItem.category_id,
      baseUnitId: dbItem.base_unit_id,
      costingMethod: dbItem.costing_method as CostingMethod,
      isActive: dbItem.is_active,
      isSerialized: dbItem.is_serialized,
      minimumQuantity: dbItem.minimum_quantity || undefined,
      maximumQuantity: dbItem.maximum_quantity || undefined,
      reorderPoint: dbItem.reorder_point || undefined,
      reorderQuantity: dbItem.reorder_quantity || undefined,
      leadTime: dbItem.lead_time_days || undefined,
      lastPurchaseDate: dbItem.last_purchase_date || undefined,
      lastPurchasePrice: dbItem.last_purchase_price_amount && dbItem.last_purchase_price_currency
        ? { amount: dbItem.last_purchase_price_amount, currency: dbItem.last_purchase_price_currency }
        : undefined,
      lastSaleDate: dbItem.last_sale_date || undefined,
      lastSalePrice: dbItem.last_sale_price_amount && dbItem.last_sale_price_currency
        ? { amount: dbItem.last_sale_price_amount, currency: dbItem.last_sale_price_currency }
        : undefined
    }
  }

  /**
   * Transform database balance to stock balance
   */
  private transformDbBalanceToStockBalance(dbBalance: any): StockBalance {
    return {
      id: dbBalance.id,
      itemId: dbBalance.item_id,
      locationId: dbBalance.location_id,
      quantityOnHand: dbBalance.quantity_on_hand,
      quantityReserved: dbBalance.quantity_reserved,
      quantityAvailable: dbBalance.quantity_available,
      averageCost: {
        amount: dbBalance.average_cost_amount,
        currency: dbBalance.average_cost_currency
      },
      totalValue: {
        amount: dbBalance.total_value_amount,
        currency: dbBalance.total_value_currency
      },
      lastMovementDate: dbBalance.last_movement_date || undefined,
      lastCountDate: dbBalance.last_count_date || undefined
    }
  }

  /**
   * Transform database transaction to inventory transaction
   */
  private transformDbTransactionToInventoryTransaction(dbTransaction: any): InventoryTransaction {
    return {
      id: dbTransaction.id,
      transactionId: dbTransaction.transaction_id,
      itemId: dbTransaction.item_id,
      locationId: dbTransaction.location_id,
      transactionType: dbTransaction.transaction_type as TransactionType,
      quantity: dbTransaction.quantity,
      unitCost: {
        amount: dbTransaction.unit_cost_amount,
        currency: dbTransaction.unit_cost_currency
      },
      totalCost: {
        amount: dbTransaction.total_cost_amount,
        currency: dbTransaction.total_cost_currency
      },
      balanceAfter: dbTransaction.balance_after,
      transactionDate: dbTransaction.transaction_date,
      referenceNo: dbTransaction.reference_no || undefined,
      referenceType: dbTransaction.reference_type || undefined,
      batchNo: dbTransaction.batch_no || undefined,
      lotNo: dbTransaction.lot_no || undefined,
      expiryDate: dbTransaction.expiry_date || undefined,
      userId: dbTransaction.user_id,
      notes: dbTransaction.notes || undefined
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService()