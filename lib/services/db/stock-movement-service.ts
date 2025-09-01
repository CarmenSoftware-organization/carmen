/**
 * Stock Movement Service
 * 
 * Handles stock transfers, adjustments, and movements between locations.
 * Provides comprehensive tracking and validation for inventory movements.
 */

import { prisma, type PrismaClient } from '@/lib/db'
import { inventoryService } from './inventory-service'
import type { 
  StockMovement,
  StockMovementItem,
  InventoryAdjustment,
  InventoryAdjustmentItem,
  AdjustmentReason,
  TransactionType
} from '@/lib/types/inventory'
import type { Money, DocumentStatus } from '@/lib/types/common'

/**
 * Stock movement creation input
 */
export interface CreateStockMovementInput {
  movementNumber?: string
  movementDate: Date
  movementType: 'transfer' | 'return' | 'allocation'
  fromLocationId: string
  toLocationId: string
  priority?: 'normal' | 'urgent' | 'emergency'
  notes?: string
  requestedBy: string
  items: CreateStockMovementItemInput[]
}

/**
 * Stock movement item input
 */
export interface CreateStockMovementItemInput {
  itemId: string
  requestedQuantity: number
  unitCost: Money
  batchNo?: string
  lotNo?: string
  expiryDate?: Date
  notes?: string
}

/**
 * Stock adjustment creation input
 */
export interface CreateInventoryAdjustmentInput {
  adjustmentNumber?: string
  adjustmentDate: Date
  adjustmentType: 'increase' | 'decrease'
  reason: AdjustmentReason
  locationId: string
  description?: string
  requestedBy: string
  items: CreateInventoryAdjustmentItemInput[]
  attachments?: string[]
}

/**
 * Stock adjustment item input
 */
export interface CreateInventoryAdjustmentItemInput {
  itemId: string
  currentQuantity: number
  adjustmentQuantity: number
  unitCost: Money
  reason?: string
  batchNo?: string
  lotNo?: string
  expiryDate?: Date
  notes?: string
}

/**
 * Stock movement filters
 */
export interface StockMovementFilters {
  movementType?: ('transfer' | 'return' | 'allocation')[]
  status?: DocumentStatus[]
  fromLocationIds?: string[]
  toLocationIds?: string[]
  priority?: ('normal' | 'urgent' | 'emergency')[]
  dateFrom?: Date
  dateTo?: Date
  requestedBy?: string[]
  search?: string
}

/**
 * Stock adjustment filters
 */
export interface InventoryAdjustmentFilters {
  adjustmentType?: ('increase' | 'decrease')[]
  reason?: AdjustmentReason[]
  status?: DocumentStatus[]
  locationIds?: string[]
  dateFrom?: Date
  dateTo?: Date
  requestedBy?: string[]
  search?: string
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

export class StockMovementService {
  private db: PrismaClient

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
  }

  /**
   * Create stock movement (transfer between locations)
   */
  async createStockMovement(input: CreateStockMovementInput): Promise<ServiceResult<StockMovement>> {
    try {
      const movementNumber = input.movementNumber || await this.generateMovementNumber(input.movementType)
      
      // Validate locations exist and are different
      if (input.fromLocationId === input.toLocationId) {
        return {
          success: false,
          error: 'Source and destination locations must be different'
        }
      }

      // Validate stock availability for all items
      for (const item of input.items) {
        const balanceResult = await inventoryService.getStockBalance(item.itemId, input.fromLocationId)
        if (!balanceResult.success) {
          return {
            success: false,
            error: `Failed to check stock balance for item ${item.itemId}`
          }
        }

        const balance = balanceResult.data
        if (!balance || balance.quantityAvailable < item.requestedQuantity) {
          return {
            success: false,
            error: `Insufficient stock for item ${item.itemId}. Available: ${balance?.quantityAvailable || 0}, Requested: ${item.requestedQuantity}`
          }
        }
      }

      // Calculate total value
      const totalValue = input.items.reduce((sum, item) => 
        sum + (item.requestedQuantity * item.unitCost.amount), 0
      )

      const dbMovement = await this.db.stock_movements.create({
        data: {
          movement_number: movementNumber,
          movement_date: input.movementDate,
          movement_type: input.movementType,
          from_location_id: input.fromLocationId,
          to_location_id: input.toLocationId,
          status: 'pending',
          requested_by: input.requestedBy,
          total_items: input.items.length,
          total_value_amount: totalValue,
          total_value_currency: input.items[0]?.unitCost.currencyCode || 'USD',
          priority: input.priority || 'normal',
          notes: input.notes,
          created_by: input.requestedBy
        },
        include: {
          stock_movement_items: true
        }
      })

      // Create movement items
      const movementItems = await Promise.all(
        input.items.map(async (item, index) => {
          return this.db.stock_movement_items.create({
            data: {
              id: `smi-${dbMovement.id}-${index}`,
              movement_id: dbMovement.id,
              item_id: item.itemId,
              requested_quantity: item.requestedQuantity,
              unit_cost_amount: item.unitCost.amount,
              unit_cost_currency: item.unitCost.currencyCode,
              total_value_amount: item.requestedQuantity * item.unitCost.amount,
              total_value_currency: item.unitCost.currencyCode,
              batch_no: item.batchNo,
              lot_no: item.lotNo,
              expiry_date: item.expiryDate,
              notes: item.notes
            }
          })
        })
      )

      const movement = await this.transformDbMovementToStockMovement({
        ...dbMovement,
        stock_movement_items: movementItems
      })

      return {
        success: true,
        data: movement
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create stock movement: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Execute stock movement (perform the actual transfer)
   */
  async executeStockMovement(movementId: string, executedBy: string): Promise<ServiceResult<StockMovement>> {
    try {
      const dbMovement = await this.db.stock_movements.findUnique({
        where: { id: movementId },
        include: {
          stock_movement_items: true
        }
      })

      if (!dbMovement) {
        return {
          success: false,
          error: 'Stock movement not found'
        }
      }

      if (dbMovement.status !== 'pending') {
        return {
          success: false,
          error: `Cannot execute movement with status: ${dbMovement.status}`
        }
      }

      // Process each item
      for (const item of dbMovement.stock_movement_items) {
        // Record outbound transaction from source location
        await inventoryService.recordInventoryTransaction({
          itemId: item.item_id,
          locationId: dbMovement.from_location_id,
          transactionType: TransactionType.TRANSFER_OUT,
          quantity: item.requested_quantity,
          unitCost: {
            amount: item.unit_cost_amount,
            currencyCode: item.unit_cost_currency
          },
          referenceNo: dbMovement.movement_number,
          referenceType: 'STOCK_MOVEMENT',
          batchNo: item.batch_no || undefined,
          lotNo: item.lot_no || undefined,
          expiryDate: item.expiry_date || undefined,
          notes: `Transfer out to ${dbMovement.to_location_id}`,
          userId: executedBy
        })

        // Record inbound transaction to destination location
        await inventoryService.recordInventoryTransaction({
          itemId: item.item_id,
          locationId: dbMovement.to_location_id,
          transactionType: TransactionType.TRANSFER_IN,
          quantity: item.requested_quantity,
          unitCost: {
            amount: item.unit_cost_amount,
            currencyCode: item.unit_cost_currency
          },
          referenceNo: dbMovement.movement_number,
          referenceType: 'STOCK_MOVEMENT',
          batchNo: item.batch_no || undefined,
          lotNo: item.lot_no || undefined,
          expiryDate: item.expiry_date || undefined,
          notes: `Transfer in from ${dbMovement.from_location_id}`,
          userId: executedBy
        })

        // Update movement item
        await this.db.stock_movement_items.update({
          where: { id: item.id },
          data: {
            transferred_quantity: item.requested_quantity,
            received_quantity: item.requested_quantity
          }
        })
      }

      // Update movement status
      const updatedMovement = await this.db.stock_movements.update({
        where: { id: movementId },
        data: {
          status: 'completed',
          completed_by: executedBy,
          updated_by: executedBy,
          updated_at: new Date()
        },
        include: {
          stock_movement_items: true
        }
      })

      const movement = await this.transformDbMovementToStockMovement(updatedMovement)

      return {
        success: true,
        data: movement
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to execute stock movement: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create inventory adjustment
   */
  async createInventoryAdjustment(input: CreateInventoryAdjustmentInput): Promise<ServiceResult<InventoryAdjustment>> {
    try {
      const adjustmentNumber = input.adjustmentNumber || await this.generateAdjustmentNumber()
      
      // Calculate total value
      const totalValue = input.items.reduce((sum, item) => 
        sum + Math.abs(item.adjustmentQuantity * item.unitCost.amount), 0
      )

      const dbAdjustment = await this.db.inventory_adjustments.create({
        data: {
          adjustment_number: adjustmentNumber,
          adjustment_date: input.adjustmentDate,
          adjustment_type: input.adjustmentType,
          reason: input.reason,
          location_id: input.locationId,
          status: 'draft',
          requested_by: input.requestedBy,
          total_items: input.items.length,
          total_value_amount: totalValue,
          total_value_currency: input.items[0]?.unitCost.currencyCode || 'USD',
          description: input.description,
          attachments: input.attachments,
          created_by: input.requestedBy
        }
      })

      // Create adjustment items
      const adjustmentItems = await Promise.all(
        input.items.map(async (item, index) => {
          const newQuantity = input.adjustmentType === 'increase' 
            ? item.currentQuantity + item.adjustmentQuantity
            : Math.max(0, item.currentQuantity - item.adjustmentQuantity)

          return this.db.inventory_adjustment_items.create({
            data: {
              id: `iai-${dbAdjustment.id}-${index}`,
              adjustment_id: dbAdjustment.id,
              item_id: item.itemId,
              current_quantity: item.currentQuantity,
              adjustment_quantity: item.adjustmentQuantity,
              new_quantity: newQuantity,
              unit_cost_amount: item.unitCost.amount,
              unit_cost_currency: item.unitCost.currencyCode,
              total_value_amount: Math.abs(item.adjustmentQuantity) * item.unitCost.amount,
              total_value_currency: item.unitCost.currencyCode,
              reason: item.reason,
              batch_no: item.batchNo,
              lot_no: item.lotNo,
              expiry_date: item.expiryDate,
              notes: item.notes
            }
          })
        })
      )

      const adjustment = await this.transformDbAdjustmentToInventoryAdjustment({
        ...dbAdjustment,
        inventory_adjustment_items: adjustmentItems
      })

      return {
        success: true,
        data: adjustment
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create inventory adjustment: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Approve and execute inventory adjustment
   */
  async approveInventoryAdjustment(adjustmentId: string, approvedBy: string): Promise<ServiceResult<InventoryAdjustment>> {
    try {
      const dbAdjustment = await this.db.inventory_adjustments.findUnique({
        where: { id: adjustmentId },
        include: {
          inventory_adjustment_items: true
        }
      })

      if (!dbAdjustment) {
        return {
          success: false,
          error: 'Inventory adjustment not found'
        }
      }

      if (dbAdjustment.status !== 'draft') {
        return {
          success: false,
          error: `Cannot approve adjustment with status: ${dbAdjustment.status}`
        }
      }

      // Process each adjustment item
      for (const item of dbAdjustment.inventory_adjustment_items) {
        const transactionType = dbAdjustment.adjustment_type === 'increase' 
          ? TransactionType.ADJUST_UP 
          : TransactionType.ADJUST_DOWN

        // Record adjustment transaction
        await inventoryService.recordInventoryTransaction({
          itemId: item.item_id,
          locationId: dbAdjustment.location_id,
          transactionType,
          quantity: Math.abs(item.adjustment_quantity),
          unitCost: {
            amount: item.unit_cost_amount,
            currencyCode: item.unit_cost_currency
          },
          referenceNo: dbAdjustment.adjustment_number,
          referenceType: 'INVENTORY_ADJUSTMENT',
          batchNo: item.batch_no || undefined,
          lotNo: item.lot_no || undefined,
          expiryDate: item.expiry_date || undefined,
          notes: `${dbAdjustment.reason}: ${item.notes || ''}`,
          userId: approvedBy
        })
      }

      // Update adjustment status
      const updatedAdjustment = await this.db.inventory_adjustments.update({
        where: { id: adjustmentId },
        data: {
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date(),
          updated_by: approvedBy,
          updated_at: new Date()
        },
        include: {
          inventory_adjustment_items: true
        }
      })

      const adjustment = await this.transformDbAdjustmentToInventoryAdjustment(updatedAdjustment)

      return {
        success: true,
        data: adjustment
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to approve inventory adjustment: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get stock movements with filtering and pagination
   */
  async getStockMovements(
    filters: StockMovementFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<StockMovement[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'movement_date',
        sortOrder = 'desc'
      } = pagination

      const offset = (page - 1) * limit

      // Build where clause
      const whereClause: any = {}

      if (filters.movementType && filters.movementType.length > 0) {
        whereClause.movement_type = { in: filters.movementType }
      }

      if (filters.status && filters.status.length > 0) {
        whereClause.status = { in: filters.status }
      }

      if (filters.fromLocationIds && filters.fromLocationIds.length > 0) {
        whereClause.from_location_id = { in: filters.fromLocationIds }
      }

      if (filters.toLocationIds && filters.toLocationIds.length > 0) {
        whereClause.to_location_id = { in: filters.toLocationIds }
      }

      if (filters.priority && filters.priority.length > 0) {
        whereClause.priority = { in: filters.priority }
      }

      if (filters.requestedBy && filters.requestedBy.length > 0) {
        whereClause.requested_by = { in: filters.requestedBy }
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.movement_date = {}
        if (filters.dateFrom) whereClause.movement_date.gte = filters.dateFrom
        if (filters.dateTo) whereClause.movement_date.lte = filters.dateTo
      }

      if (filters.search) {
        whereClause.OR = [
          { movement_number: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      const [movements, total] = await Promise.all([
        this.db.stock_movements.findMany({
          where: whereClause,
          include: {
            stock_movement_items: true
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip: offset,
          take: limit
        }),
        this.db.stock_movements.count({
          where: whereClause
        })
      ])

      const transformedMovements = await Promise.all(
        movements.map(async (movement) => await this.transformDbMovementToStockMovement(movement))
      )

      return {
        success: true,
        data: transformedMovements,
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
        error: `Failed to fetch stock movements: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get inventory adjustments with filtering and pagination
   */
  async getInventoryAdjustments(
    filters: InventoryAdjustmentFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<InventoryAdjustment[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'adjustment_date',
        sortOrder = 'desc'
      } = pagination

      const offset = (page - 1) * limit

      // Build where clause
      const whereClause: any = {}

      if (filters.adjustmentType && filters.adjustmentType.length > 0) {
        whereClause.adjustment_type = { in: filters.adjustmentType }
      }

      if (filters.reason && filters.reason.length > 0) {
        whereClause.reason = { in: filters.reason }
      }

      if (filters.status && filters.status.length > 0) {
        whereClause.status = { in: filters.status }
      }

      if (filters.locationIds && filters.locationIds.length > 0) {
        whereClause.location_id = { in: filters.locationIds }
      }

      if (filters.requestedBy && filters.requestedBy.length > 0) {
        whereClause.requested_by = { in: filters.requestedBy }
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.adjustment_date = {}
        if (filters.dateFrom) whereClause.adjustment_date.gte = filters.dateFrom
        if (filters.dateTo) whereClause.adjustment_date.lte = filters.dateTo
      }

      if (filters.search) {
        whereClause.OR = [
          { adjustment_number: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      const [adjustments, total] = await Promise.all([
        this.db.inventory_adjustments.findMany({
          where: whereClause,
          include: {
            inventory_adjustment_items: true
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip: offset,
          take: limit
        }),
        this.db.inventory_adjustments.count({
          where: whereClause
        })
      ])

      const transformedAdjustments = await Promise.all(
        adjustments.map(async (adjustment) => await this.transformDbAdjustmentToInventoryAdjustment(adjustment))
      )

      return {
        success: true,
        data: transformedAdjustments,
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
        error: `Failed to fetch inventory adjustments: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate movement number
   */
  private async generateMovementNumber(movementType: string): Promise<string> {
    const typePrefix = {
      transfer: 'TRF',
      return: 'RTN',
      allocation: 'ALO'
    }[movementType] || 'MOV'

    const timestamp = Date.now().toString().slice(-6)
    return `${typePrefix}${timestamp}`
  }

  /**
   * Generate adjustment number
   */
  private async generateAdjustmentNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6)
    return `ADJ${timestamp}`
  }

  /**
   * Transform database movement to stock movement
   */
  private async transformDbMovementToStockMovement(dbMovement: any): Promise<StockMovement> {
    const items: StockMovementItem[] = (dbMovement.stock_movement_items || []).map((item: any) => ({
      id: item.id,
      movementId: item.movement_id,
      itemId: item.item_id,
      requestedQuantity: item.requested_quantity,
      transferredQuantity: item.transferred_quantity || undefined,
      receivedQuantity: item.received_quantity || undefined,
      unitCost: {
        amount: item.unit_cost_amount,
        currencyCode: item.unit_cost_currency
      },
      totalValue: {
        amount: item.total_value_amount,
        currencyCode: item.total_value_currency
      },
      batchNo: item.batch_no || undefined,
      lotNo: item.lot_no || undefined,
      expiryDate: item.expiry_date || undefined,
      notes: item.notes || undefined
    }))

    return {
      id: dbMovement.id,
      movementNumber: dbMovement.movement_number,
      movementDate: dbMovement.movement_date,
      movementType: dbMovement.movement_type,
      fromLocationId: dbMovement.from_location_id,
      toLocationId: dbMovement.to_location_id,
      status: dbMovement.status as DocumentStatus,
      requestedBy: dbMovement.requested_by,
      authorizedBy: dbMovement.authorized_by || undefined,
      completedBy: dbMovement.completed_by || undefined,
      totalItems: dbMovement.total_items,
      totalValue: {
        amount: dbMovement.total_value_amount,
        currencyCode: dbMovement.total_value_currency
      },
      priority: dbMovement.priority,
      notes: dbMovement.notes || undefined,
      items,
      createdAt: dbMovement.created_at,
      updatedAt: dbMovement.updated_at,
      createdBy: dbMovement.created_by,
      updatedBy: dbMovement.updated_by || undefined
    }
  }

  /**
   * Transform database adjustment to inventory adjustment
   */
  private async transformDbAdjustmentToInventoryAdjustment(dbAdjustment: any): Promise<InventoryAdjustment> {
    const items: InventoryAdjustmentItem[] = (dbAdjustment.inventory_adjustment_items || []).map((item: any) => ({
      id: item.id,
      adjustmentId: item.adjustment_id,
      itemId: item.item_id,
      currentQuantity: item.current_quantity,
      adjustmentQuantity: item.adjustment_quantity,
      newQuantity: item.new_quantity,
      unitCost: {
        amount: item.unit_cost_amount,
        currencyCode: item.unit_cost_currency
      },
      totalValue: {
        amount: item.total_value_amount,
        currencyCode: item.total_value_currency
      },
      reason: item.reason || undefined,
      batchNo: item.batch_no || undefined,
      lotNo: item.lot_no || undefined,
      expiryDate: item.expiry_date || undefined,
      notes: item.notes || undefined
    }))

    return {
      id: dbAdjustment.id,
      adjustmentNumber: dbAdjustment.adjustment_number,
      adjustmentDate: dbAdjustment.adjustment_date,
      adjustmentType: dbAdjustment.adjustment_type,
      reason: dbAdjustment.reason as AdjustmentReason,
      locationId: dbAdjustment.location_id,
      status: dbAdjustment.status as DocumentStatus,
      requestedBy: dbAdjustment.requested_by,
      approvedBy: dbAdjustment.approved_by || undefined,
      approvedAt: dbAdjustment.approved_at || undefined,
      totalItems: dbAdjustment.total_items,
      totalValue: {
        amount: dbAdjustment.total_value_amount,
        currencyCode: dbAdjustment.total_value_currency
      },
      description: dbAdjustment.description || undefined,
      attachments: dbAdjustment.attachments || [],
      items,
      createdAt: dbAdjustment.created_at,
      updatedAt: dbAdjustment.updated_at,
      createdBy: dbAdjustment.created_by,
      updatedBy: dbAdjustment.updated_by || undefined
    }
  }
}

// Export singleton instance
export const stockMovementService = new StockMovementService()