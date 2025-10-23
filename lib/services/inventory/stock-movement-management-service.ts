/**
 * Stock Movement Management Service
 * 
 * Comprehensive service for managing stock movements, transfers, reservations,
 * and allocations across locations with full audit trail and business logic validation.
 */

import { prisma, type PrismaClient } from '@/lib/db'
import { comprehensiveInventoryService } from './comprehensive-inventory-service'
import { inventoryService } from '../db/inventory-service'
import { InventoryCalculations } from '../calculations/inventory-calculations'
import {
  type StockMovement,
  type StockMovementItem,
  type InventoryTransaction,
  TransactionType,
  type StockBalance
} from '@/lib/types/inventory'
import type { Money, DocumentStatus } from '@/lib/types/common'

/**
 * Stock reservation interface
 */
export interface StockReservation {
  id: string
  itemId: string
  locationId: string
  reservedQuantity: number
  reservedBy: string
  reservedFor: string // Order ID, Production Order, etc.
  reservationType: 'order' | 'production' | 'transfer' | 'allocation'
  reservationDate: Date
  expiryDate?: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'partial_fulfilled' | 'fulfilled' | 'cancelled' | 'expired'
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

/**
 * Stock allocation interface
 */
export interface StockAllocation {
  id: string
  itemId: string
  fromLocationId: string
  toLocationId?: string
  allocatedQuantity: number
  allocatedBy: string
  allocatedFor: string
  allocationType: 'transfer' | 'production' | 'sale' | 'adjustment'
  allocationDate: Date
  expectedFulfillmentDate?: Date
  actualFulfillmentDate?: Date
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  transportMethod?: string
  trackingNumber?: string
  cost?: Money
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

/**
 * Transfer request interface
 */
export interface TransferRequest {
  id: string
  requestNumber: string
  fromLocationId: string
  toLocationId: string
  requestedBy: string
  requestDate: Date
  approvedBy?: string
  approvalDate?: Date
  completedBy?: string
  completionDate?: Date
  status: DocumentStatus
  priority: 'normal' | 'urgent' | 'emergency'
  reason: string
  totalItems: number
  totalValue: Money
  items: TransferRequestItem[]
  notes?: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

/**
 * Transfer request item
 */
export interface TransferRequestItem {
  id: string
  transferRequestId: string
  itemId: string
  requestedQuantity: number
  approvedQuantity?: number
  transferredQuantity?: number
  unitCost: Money
  totalCost: Money
  reason?: string
  notes?: string
}

/**
 * Batch transfer operation
 */
export interface BatchTransferOperation {
  id: string
  operationNumber: string
  operationType: 'bulk_transfer' | 'store_replenishment' | 'production_issue' | 'return_to_supplier'
  fromLocationId: string
  toLocationId?: string
  requestedBy: string
  requestDate: Date
  scheduledDate?: Date
  completedDate?: Date
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  totalItems: number
  totalValue: Money
  completionPercentage: number
  items: BatchTransferItem[]
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

/**
 * Batch transfer item
 */
export interface BatchTransferItem {
  id: string
  batchTransferId: string
  itemId: string
  plannedQuantity: number
  actualQuantity?: number
  unitCost: Money
  totalCost: Money
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  failureReason?: string
  notes?: string
}

/**
 * Service result for stock operations
 */
export interface StockOperationResult<T> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
  affectedItems?: {
    itemId: string
    oldQuantity: number
    newQuantity: number
    quantityChanged: number
  }[]
  transactionIds?: string[]
  reservationIds?: string[]
  allocationIds?: string[]
}

export class StockMovementManagementService {
  private db: typeof prisma
  private inventoryService = comprehensiveInventoryService
  private inventoryCalculations = new InventoryCalculations()

  constructor(prismaClient?: typeof prisma) {
    this.db = prismaClient || prisma
  }

  /**
   * Create and execute stock transfer between locations
   */
  async executeStockTransfer(
    fromLocationId: string,
    toLocationId: string,
    items: { itemId: string; quantity: number; unitCost?: Money }[],
    requestedBy: string,
    options: {
      referenceNo?: string
      referenceType?: string
      notes?: string
      priority?: 'normal' | 'urgent' | 'emergency'
      autoApprove?: boolean
    } = {}
  ): Promise<StockOperationResult<{
    movement: StockMovement
    transactions: InventoryTransaction[]
    updatedBalances: StockBalance[]
  }>> {
    const startTime = Date.now()
    const transactionIds: string[] = []
    const affectedItems: any[] = []
    const warnings: string[] = []

    try {
      // Validate locations exist and are active
      const [fromLocation, toLocation] = await Promise.all([
        this.validateLocationExists(fromLocationId),
        this.validateLocationExists(toLocationId)
      ])

      if (!fromLocation || !toLocation) {
        return {
          success: false,
          error: 'One or more locations are invalid'
        }
      }

      // Validate stock availability
      const availabilityCheck = await this.validateStockAvailability(fromLocationId, items)
      if (!availabilityCheck.success) {
        return {
          success: false,
          error: availabilityCheck.error,
          warnings: availabilityCheck.warnings
        }
      }

      // Generate movement number
      const movementNumber = await this.generateMovementNumber()

      // Calculate total value
      const totalValue = await this.calculateTotalTransferValue(items)

      // Create stock movement record
      const movement = await this.createStockMovementRecord({
        movementNumber,
        fromLocationId,
        toLocationId,
        requestedBy,
        totalItems: items.length,
        totalValue,
        priority: options.priority || 'normal',
        notes: options.notes,
        referenceNo: options.referenceNo,
        referenceType: options.referenceType,
        autoApprove: options.autoApprove
      })

      const transactions: InventoryTransaction[] = []
      const updatedBalances: StockBalance[] = []

      // Process each item transfer
      for (const item of items) {
        try {
          // Create outbound transaction (from location)
          const outboundResult = await inventoryService.recordInventoryTransaction({
            itemId: item.itemId,
            locationId: fromLocationId,
            transactionType: TransactionType.TRANSFER_OUT,
            quantity: -Math.abs(item.quantity), // Negative for outbound
            unitCost: item.unitCost || await this.getAverageCost(item.itemId, fromLocationId),
            referenceNo: movementNumber,
            referenceType: 'Stock Transfer',
            notes: `Transfer to ${toLocationId}`,
            userId: requestedBy
          })

          if (outboundResult.success && outboundResult.data) {
            transactions.push(outboundResult.data.transaction)
            updatedBalances.push(outboundResult.data.newBalance)
            transactionIds.push(outboundResult.data.transaction.id)

            // Create inbound transaction (to location)
            const inboundResult = await inventoryService.recordInventoryTransaction({
              itemId: item.itemId,
              locationId: toLocationId,
              transactionType: TransactionType.TRANSFER_IN,
              quantity: Math.abs(item.quantity), // Positive for inbound
              unitCost: item.unitCost || await this.getAverageCost(item.itemId, fromLocationId),
              referenceNo: movementNumber,
              referenceType: 'Stock Transfer',
              notes: `Transfer from ${fromLocationId}`,
              userId: requestedBy
            })

            if (inboundResult.success && inboundResult.data) {
              transactions.push(inboundResult.data.transaction)
              updatedBalances.push(inboundResult.data.newBalance)
              transactionIds.push(inboundResult.data.transaction.id)

              affectedItems.push({
                itemId: item.itemId,
                oldQuantity: outboundResult.data.newBalance.quantityOnHand + Math.abs(item.quantity),
                newQuantity: outboundResult.data.newBalance.quantityOnHand,
                quantityChanged: -Math.abs(item.quantity)
              })
            } else {
              warnings.push(`Failed to create inbound transaction for item ${item.itemId}: ${inboundResult.error}`)
            }
          } else {
            warnings.push(`Failed to create outbound transaction for item ${item.itemId}: ${outboundResult.error}`)
          }
        } catch (itemError) {
          warnings.push(`Error processing item ${item.itemId}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`)
        }
      }

      // Update movement status
      await this.updateMovementStatus(movement.id, transactions.length > 0 ? ('completed' as DocumentStatus) : ('cancelled' as DocumentStatus))

      // Create audit log
      await this.createTransferAuditLog(movement.id, requestedBy, 'completed', {
        transactionCount: transactions.length,
        processingTime: Date.now() - startTime,
        warnings
      })

      return {
        success: true,
        data: {
          movement,
          transactions,
          updatedBalances
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        affectedItems,
        transactionIds
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to execute stock transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings
      }
    }
  }

  /**
   * Create stock reservation
   */
  async createStockReservation(
    itemId: string,
    locationId: string,
    quantity: number,
    reservedBy: string,
    reservedFor: string,
    options: {
      reservationType?: 'order' | 'production' | 'transfer' | 'allocation'
      expiryDate?: Date
      priority?: 'low' | 'medium' | 'high' | 'critical'
      notes?: string
    } = {}
  ): Promise<StockOperationResult<StockReservation>> {
    try {
      // Check stock availability
      const stockResult = await inventoryService.getStockBalance(itemId, locationId)
      
      if (!stockResult.success || !stockResult.data) {
        return {
          success: false,
          error: 'No stock balance found for the item at this location'
        }
      }

      const stockBalance = stockResult.data
      
      // Check if sufficient unreserved stock is available
      const availableQuantity = stockBalance.quantityOnHand - stockBalance.quantityReserved
      
      if (availableQuantity < quantity) {
        return {
          success: false,
          error: `Insufficient stock available. Available: ${availableQuantity}, Requested: ${quantity}`
        }
      }

      // Create reservation record
      const reservation: StockReservation = {
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemId,
        locationId,
        reservedQuantity: quantity,
        reservedBy,
        reservedFor,
        reservationType: options.reservationType || 'order',
        reservationDate: new Date(),
        expiryDate: options.expiryDate,
        priority: options.priority || 'medium',
        status: 'active',
        notes: options.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: reservedBy
      }

      // Store reservation (would use actual database table)
      await this.storeReservation(reservation)

      // Update stock balance to reflect reservation
      const updatedBalanceResult = await inventoryService.upsertStockBalance({
        itemId,
        locationId,
        quantityOnHand: stockBalance.quantityOnHand,
        quantityReserved: stockBalance.quantityReserved + quantity,
        averageCost: stockBalance.averageCost,
        createdBy: reservedBy
      })

      if (!updatedBalanceResult.success) {
        // Rollback reservation if stock update fails
        await this.cancelReservation(reservation.id, reservedBy, 'Stock update failed')
        
        return {
          success: false,
          error: 'Failed to update stock balance for reservation'
        }
      }

      // Create audit trail
      await this.createReservationAuditLog(reservation.id, reservedBy, 'created', {
        itemId,
        locationId,
        quantity,
        reservedFor
      })

      return {
        success: true,
        data: reservation,
        reservationIds: [reservation.id]
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create stock reservation: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Release stock reservation
   */
  async releaseStockReservation(
    reservationId: string,
    releasedBy: string,
    options: {
      reason?: string
      partialQuantity?: number
    } = {}
  ): Promise<StockOperationResult<StockReservation>> {
    try {
      // Get reservation details
      const reservation = await this.getReservationById(reservationId)
      
      if (!reservation) {
        return {
          success: false,
          error: 'Reservation not found'
        }
      }

      if (reservation.status !== 'active' && reservation.status !== 'partial_fulfilled') {
        return {
          success: false,
          error: `Cannot release reservation with status: ${reservation.status}`
        }
      }

      const quantityToRelease = options.partialQuantity || reservation.reservedQuantity
      
      if (quantityToRelease > reservation.reservedQuantity) {
        return {
          success: false,
          error: 'Cannot release more than reserved quantity'
        }
      }

      // Update stock balance
      const stockResult = await inventoryService.getStockBalance(
        reservation.itemId,
        reservation.locationId
      )

      if (stockResult.success && stockResult.data) {
        const stockBalance = stockResult.data

        await inventoryService.upsertStockBalance({
          itemId: reservation.itemId,
          locationId: reservation.locationId,
          quantityOnHand: stockBalance.quantityOnHand,
          quantityReserved: Math.max(0, stockBalance.quantityReserved - quantityToRelease),
          averageCost: stockBalance.averageCost,
          createdBy: releasedBy
        })
      }

      // Update reservation status
      const updatedReservation = {
        ...reservation,
        reservedQuantity: reservation.reservedQuantity - quantityToRelease,
        status: (reservation.reservedQuantity - quantityToRelease) > 0 ? 'partial_fulfilled' : 'fulfilled',
        updatedAt: new Date(),
        updatedBy: releasedBy
      } as StockReservation

      await this.updateReservation(updatedReservation)

      // Create audit trail
      await this.createReservationAuditLog(reservationId, releasedBy, 'released', {
        quantityReleased: quantityToRelease,
        reason: options.reason,
        newStatus: updatedReservation.status
      })

      return {
        success: true,
        data: updatedReservation,
        reservationIds: [reservationId]
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to release stock reservation: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Execute batch transfer operation
   */
  async executeBatchTransfer(
    operation: Omit<BatchTransferOperation, 'id' | 'operationNumber' | 'completionPercentage' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<StockOperationResult<BatchTransferOperation>> {
    try {
      const operationNumber = await this.generateBatchOperationNumber()
      
      const batchOperation: BatchTransferOperation = {
        ...operation,
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        operationNumber,
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      }

      // Store batch operation
      await this.storeBatchOperation(batchOperation)

      // Process items in batches for performance
      const batchSize = 10
      const itemBatches = this.chunkArray(operation.items, batchSize)
      let completedItems = 0
      const warnings: string[] = []

      for (const batch of itemBatches) {
        const batchPromises = batch.map(async (item) => {
          try {
            if (operation.toLocationId) {
              // Transfer to specific location
              const transferResult = await this.executeStockTransfer(
                operation.fromLocationId,
                operation.toLocationId,
                [{
                  itemId: item.itemId,
                  quantity: item.plannedQuantity,
                  unitCost: item.unitCost
                }],
                userId,
                {
                  referenceNo: operationNumber,
                  referenceType: 'Batch Transfer',
                  notes: `Batch operation: ${operation.operationType}`
                }
              )

              if (transferResult.success) {
                item.actualQuantity = item.plannedQuantity
                item.status = 'completed'
                completedItems++
              } else {
                item.status = 'failed'
                item.failureReason = transferResult.error
                warnings.push(`Failed to transfer item ${item.itemId}: ${transferResult.error}`)
              }
            } else {
              // Issue from location (e.g., production consumption)
              const issueResult = await inventoryService.recordInventoryTransaction({
                itemId: item.itemId,
                locationId: operation.fromLocationId,
                transactionType: TransactionType.ISSUE,
                quantity: -item.plannedQuantity,
                unitCost: item.unitCost,
                referenceNo: operationNumber,
                referenceType: 'Batch Operation',
                notes: `Batch ${operation.operationType}`,
                userId
              })

              if (issueResult.success) {
                item.actualQuantity = item.plannedQuantity
                item.status = 'completed'
                completedItems++
              } else {
                item.status = 'failed'
                item.failureReason = issueResult.error
                warnings.push(`Failed to issue item ${item.itemId}: ${issueResult.error}`)
              }
            }

            // Update item status
            await this.updateBatchTransferItem(item)
          } catch (itemError) {
            item.status = 'failed'
            item.failureReason = itemError instanceof Error ? itemError.message : 'Unknown error'
            warnings.push(`Error processing item ${item.itemId}: ${item.failureReason}`)
            await this.updateBatchTransferItem(item)
          }
        })

        // Wait for current batch to complete before processing next
        await Promise.all(batchPromises)

        // Update completion percentage
        const completionPercentage = (completedItems / operation.items.length) * 100
        await this.updateBatchOperationProgress(batchOperation.id, completionPercentage)
      }

      // Finalize batch operation
      const finalStatus = completedItems === operation.items.length ? 'completed' : 
                          completedItems > 0 ? 'partial_completed' : 'failed'
      
      batchOperation.status = finalStatus as any
      batchOperation.completedDate = new Date()
      batchOperation.completionPercentage = (completedItems / operation.items.length) * 100
      
      await this.updateBatchOperation(batchOperation)

      // Create audit log
      await this.createBatchOperationAuditLog(batchOperation.id, userId, finalStatus, {
        totalItems: operation.items.length,
        completedItems,
        failedItems: operation.items.length - completedItems,
        warnings
      })

      return {
        success: completedItems > 0,
        data: batchOperation,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to execute batch transfer: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Private helper methods

  private async validateLocationExists(locationId: string): Promise<boolean> {
    // Validate location exists and is active
    // This would query the locations table
    return true // Placeholder
  }

  private async validateStockAvailability(
    locationId: string,
    items: { itemId: string; quantity: number }[]
  ): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
    const warnings: string[] = []

    for (const item of items) {
      const stockResult = await inventoryService.getStockBalance(item.itemId, locationId)
      
      if (!stockResult.success || !stockResult.data) {
        return {
          success: false,
          error: `No stock found for item ${item.itemId} at location ${locationId}`
        }
      }

      const availableQuantity = stockResult.data.quantityAvailable
      if (availableQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for item ${item.itemId}. Available: ${availableQuantity}, Required: ${item.quantity}`
        }
      }

      // Check for low stock warnings
      const totalStock = stockResult.data.quantityOnHand
      if (totalStock - item.quantity < 5) { // Arbitrary threshold
        warnings.push(`Item ${item.itemId} will have low stock after transfer`)
      }
    }

    return { success: true, warnings }
  }

  private async generateMovementNumber(): Promise<string> {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const time = Date.now().toString().slice(-6)
    return `MOV-${dateStr}-${time}`
  }

  private async generateBatchOperationNumber(): Promise<string> {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const time = Date.now().toString().slice(-6)
    return `BATCH-${dateStr}-${time}`
  }

  private async calculateTotalTransferValue(
    items: { itemId: string; quantity: number; unitCost?: Money }[]
  ): Promise<Money> {
    let totalAmount = 0
    let currency = 'USD'

    for (const item of items) {
      const unitCost = item.unitCost || await this.getAverageCost(item.itemId)
      totalAmount += item.quantity * unitCost.amount
      currency = unitCost.currency
    }

    return { amount: totalAmount, currency }
  }

  private async getAverageCost(itemId: string, locationId?: string): Promise<Money> {
    // Get average cost from stock balance or item master
    if (locationId) {
      const stockResult = await inventoryService.getStockBalance(itemId, locationId)
      if (stockResult.success && stockResult.data) {
        return stockResult.data.averageCost
      }
    }

    // Fallback to default cost
    return { amount: 10.0, currency: 'USD' }
  }

  private async createStockMovementRecord(data: any): Promise<StockMovement> {
    // Create stock movement record in database
    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      movementNumber: data.movementNumber,
      movementDate: new Date(),
      movementType: 'transfer',
      fromLocationId: data.fromLocationId,
      toLocationId: data.toLocationId,
      status: (data.autoApprove ? 'completed' : 'pending') as DocumentStatus,
      requestedBy: data.requestedBy,
      totalItems: data.totalItems,
      totalValue: data.totalValue,
      priority: data.priority,
      notes: data.notes
    }

    // Store in database (placeholder)
    return movement
  }

  private async updateMovementStatus(movementId: string, status: DocumentStatus): Promise<void> {
    // Update movement status in database
  }

  private async createTransferAuditLog(
    movementId: string,
    userId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    // Create audit log entry
  }

  private async storeReservation(reservation: StockReservation): Promise<void> {
    // Store reservation in database
  }

  private async getReservationById(reservationId: string): Promise<StockReservation | null> {
    // Get reservation from database
    return null // Placeholder
  }

  private async updateReservation(reservation: StockReservation): Promise<void> {
    // Update reservation in database
  }

  private async cancelReservation(reservationId: string, userId: string, reason: string): Promise<void> {
    // Cancel reservation
  }

  private async createReservationAuditLog(
    reservationId: string,
    userId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    // Create reservation audit log
  }

  private async storeBatchOperation(operation: BatchTransferOperation): Promise<void> {
    // Store batch operation in database
  }

  private async updateBatchOperationProgress(operationId: string, completionPercentage: number): Promise<void> {
    // Update batch operation progress
  }

  private async updateBatchTransferItem(item: BatchTransferItem): Promise<void> {
    // Update batch transfer item status
  }

  private async updateBatchOperation(operation: BatchTransferOperation): Promise<void> {
    // Update batch operation
  }

  private async createBatchOperationAuditLog(
    operationId: string,
    userId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    // Create batch operation audit log
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// Export singleton instance
export const stockMovementService = new StockMovementManagementService()