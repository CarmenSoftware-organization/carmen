/**
 * Stock Movement Management Service Tests
 * 
 * Unit tests for stock movement, reservation, and transfer operations
 * with comprehensive validation and error handling scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { StockMovementManagementService } from '../stock-movement-management-service'
import { TransactionType } from '@/lib/types/inventory'
import type { Money } from '@/lib/types/common'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    inventory_items: {
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    stock_balances: {
      findFirst: vi.fn(),
      upsert: vi.fn()
    },
    inventory_transactions: {
      create: vi.fn()
    }
  }
}))

vi.mock('../comprehensive-inventory-service', () => ({
  comprehensiveInventoryService: {
    getStockBalance: vi.fn(),
    upsertStockBalance: vi.fn(),
    recordInventoryTransaction: vi.fn()
  }
}))

describe('StockMovementManagementService', () => {
  let service: StockMovementManagementService
  let mockInventoryService: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new StockMovementManagementService()
    mockInventoryService = require('../comprehensive-inventory-service').comprehensiveInventoryService
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('executeStockTransfer', () => {
    it('should successfully transfer stock between locations', async () => {
      // Arrange
      const fromLocationId = 'warehouse'
      const toLocationId = 'store'
      const items = [
        {
          itemId: 'item-001',
          quantity: 10,
          unitCost: { amount: 5.00, currencyCode: 'USD' } as Money
        }
      ]
      const requestedBy = 'user-001'

      // Mock successful stock balance check
      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: {
          itemId: 'item-001',
          locationId: 'warehouse',
          quantityOnHand: 50,
          quantityReserved: 5,
          quantityAvailable: 45,
          averageCost: { amount: 5.00, currencyCode: 'USD' }
        }
      })

      // Mock successful transaction creation
      mockInventoryService.recordInventoryTransaction
        .mockResolvedValueOnce({
          success: true,
          data: {
            transaction: {
              id: 'txn-out-001',
              transactionType: TransactionType.TRANSFER_OUT,
              quantity: -10
            },
            newBalance: {
              quantityOnHand: 40,
              quantityAvailable: 35
            }
          }
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            transaction: {
              id: 'txn-in-001',
              transactionType: TransactionType.TRANSFER_IN,
              quantity: 10
            },
            newBalance: {
              quantityOnHand: 10,
              quantityAvailable: 10
            }
          }
        })

      // Act
      const result = await service.executeStockTransfer(
        fromLocationId,
        toLocationId,
        items,
        requestedBy
      )

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.transactions).toHaveLength(2)
      expect(result.data?.updatedBalances).toHaveLength(2)
      expect(result.affectedItems).toHaveLength(1)
      expect(result.affectedItems![0].quantityChanged).toBe(-10)
      
      // Verify transaction calls
      expect(mockInventoryService.recordInventoryTransaction).toHaveBeenCalledTimes(2)
    })

    it('should fail when insufficient stock available', async () => {
      // Arrange
      const items = [
        {
          itemId: 'item-001',
          quantity: 100, // More than available
          unitCost: { amount: 5.00, currencyCode: 'USD' } as Money
        }
      ]

      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: {
          quantityOnHand: 50,
          quantityAvailable: 45 // Less than requested
        }
      })

      // Act
      const result = await service.executeStockTransfer(
        'warehouse',
        'store',
        items,
        'user-001'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Insufficient stock')
    })

    it('should handle partial transaction failures gracefully', async () => {
      // Arrange
      const items = [
        { itemId: 'item-001', quantity: 10, unitCost: { amount: 5.00, currencyCode: 'USD' } },
        { itemId: 'item-002', quantity: 5, unitCost: { amount: 3.00, currencyCode: 'USD' } }
      ]

      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: { quantityAvailable: 50 }
      })

      // First item succeeds, second fails
      mockInventoryService.recordInventoryTransaction
        .mockResolvedValueOnce({
          success: true,
          data: { transaction: { id: 'txn-1' }, newBalance: {} }
        })
        .mockResolvedValueOnce({
          success: true,
          data: { transaction: { id: 'txn-2' }, newBalance: {} }
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Transaction failed'
        })

      // Act
      const result = await service.executeStockTransfer(
        'warehouse',
        'store',
        items,
        'user-001'
      )

      // Assert
      expect(result.success).toBe(true) // Overall success since some items transferred
      expect(result.warnings).toBeDefined()
      expect(result.warnings![0]).toContain('Failed to create inbound transaction')
    })
  })

  describe('createStockReservation', () => {
    it('should successfully create stock reservation', async () => {
      // Arrange
      const itemId = 'item-001'
      const locationId = 'warehouse'
      const quantity = 15
      const reservedBy = 'user-001'
      const reservedFor = 'order-123'

      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: {
          itemId,
          locationId,
          quantityOnHand: 50,
          quantityReserved: 5,
          quantityAvailable: 45, // Sufficient for reservation
          averageCost: { amount: 10.00, currencyCode: 'USD' }
        }
      })

      mockInventoryService.upsertStockBalance.mockResolvedValue({
        success: true,
        data: {
          quantityReserved: 20 // 5 + 15
        }
      })

      // Act
      const result = await service.createStockReservation(
        itemId,
        locationId,
        quantity,
        reservedBy,
        reservedFor
      )

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.reservedQuantity).toBe(quantity)
      expect(result.data?.reservedFor).toBe(reservedFor)
      expect(result.data?.status).toBe('active')
      expect(result.reservationIds).toHaveLength(1)
    })

    it('should fail when insufficient available stock', async () => {
      // Arrange
      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: {
          quantityOnHand: 20,
          quantityReserved: 15,
          quantityAvailable: 5 // Less than requested 10
        }
      })

      // Act
      const result = await service.createStockReservation(
        'item-001',
        'warehouse',
        10,
        'user-001',
        'order-123'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Insufficient stock available')
    })

    it('should handle stock balance update failure', async () => {
      // Arrange
      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: { quantityAvailable: 50 }
      })

      mockInventoryService.upsertStockBalance.mockResolvedValue({
        success: false,
        error: 'Database update failed'
      })

      // Act
      const result = await service.createStockReservation(
        'item-001',
        'warehouse',
        10,
        'user-001',
        'order-123'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to update stock balance')
    })
  })

  describe('releaseStockReservation', () => {
    it('should successfully release full reservation', async () => {
      // Arrange
      const reservationId = 'res-001'
      const releasedBy = 'user-001'

      // Mock getting reservation
      const mockGetReservation = vi.spyOn(service as any, 'getReservationById')
      mockGetReservation.mockResolvedValue({
        id: reservationId,
        itemId: 'item-001',
        locationId: 'warehouse',
        reservedQuantity: 10,
        status: 'active'
      })

      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: {
          quantityReserved: 15 // Current reserved amount
        }
      })

      mockInventoryService.upsertStockBalance.mockResolvedValue({
        success: true
      })

      const mockUpdateReservation = vi.spyOn(service as any, 'updateReservation')
      mockUpdateReservation.mockResolvedValue(undefined)

      // Act
      const result = await service.releaseStockReservation(reservationId, releasedBy)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('fulfilled')
      expect(result.data?.reservedQuantity).toBe(0)
    })

    it('should support partial reservation release', async () => {
      // Arrange
      const reservationId = 'res-001'
      const partialQuantity = 5

      const mockGetReservation = vi.spyOn(service as any, 'getReservationById')
      mockGetReservation.mockResolvedValue({
        id: reservationId,
        reservedQuantity: 10,
        status: 'active'
      })

      mockInventoryService.getStockBalance.mockResolvedValue({
        success: true,
        data: { quantityReserved: 10 }
      })

      mockInventoryService.upsertStockBalance.mockResolvedValue({
        success: true
      })

      const mockUpdateReservation = vi.spyOn(service as any, 'updateReservation')
      mockUpdateReservation.mockResolvedValue(undefined)

      // Act
      const result = await service.releaseStockReservation(
        reservationId,
        'user-001',
        { partialQuantity }
      )

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.reservedQuantity).toBe(5) // 10 - 5
      expect(result.data?.status).toBe('partial_fulfilled')
    })

    it('should fail for non-existent reservation', async () => {
      // Arrange
      const mockGetReservation = vi.spyOn(service as any, 'getReservationById')
      mockGetReservation.mockResolvedValue(null)

      // Act
      const result = await service.releaseStockReservation('invalid-id', 'user-001')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Reservation not found')
    })
  })

  describe('executeBatchTransfer', () => {
    it('should successfully execute batch transfer operation', async () => {
      // Arrange
      const batchOperation = {
        operationType: 'bulk_transfer' as const,
        fromLocationId: 'warehouse',
        toLocationId: 'store',
        requestedBy: 'user-001',
        requestDate: new Date(),
        status: 'planned' as const,
        totalItems: 2,
        totalValue: { amount: 100, currencyCode: 'USD' },
        items: [
          {
            id: 'item-1',
            batchTransferId: '',
            itemId: 'item-001',
            plannedQuantity: 10,
            unitCost: { amount: 5, currencyCode: 'USD' },
            totalCost: { amount: 50, currencyCode: 'USD' },
            status: 'pending' as const
          },
          {
            id: 'item-2',
            batchTransferId: '',
            itemId: 'item-002',
            plannedQuantity: 5,
            unitCost: { amount: 10, currencyCode: 'USD' },
            totalCost: { amount: 50, currencyCode: 'USD' },
            status: 'pending' as const
          }
        ]
      }

      // Mock successful transfers
      const mockExecuteStockTransfer = vi.spyOn(service, 'executeStockTransfer')
      mockExecuteStockTransfer.mockResolvedValue({
        success: true,
        data: {
          movement: {} as any,
          transactions: [],
          updatedBalances: []
        }
      })

      const mockStoreBatchOperation = vi.spyOn(service as any, 'storeBatchOperation')
      mockStoreBatchOperation.mockResolvedValue(undefined)

      const mockUpdateBatchTransferItem = vi.spyOn(service as any, 'updateBatchTransferItem')
      mockUpdateBatchTransferItem.mockResolvedValue(undefined)

      const mockUpdateBatchOperationProgress = vi.spyOn(service as any, 'updateBatchOperationProgress')
      mockUpdateBatchOperationProgress.mockResolvedValue(undefined)

      const mockUpdateBatchOperation = vi.spyOn(service as any, 'updateBatchOperation')
      mockUpdateBatchOperation.mockResolvedValue(undefined)

      // Act
      const result = await service.executeBatchTransfer(batchOperation, 'user-001')

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('completed')
      expect(result.data?.completionPercentage).toBe(100)
      expect(mockExecuteStockTransfer).toHaveBeenCalledTimes(2)
    })

    it('should handle mixed success/failure in batch items', async () => {
      // Arrange
      const batchOperation = {
        operationType: 'bulk_transfer' as const,
        fromLocationId: 'warehouse',
        toLocationId: 'store',
        requestedBy: 'user-001',
        requestDate: new Date(),
        status: 'planned' as const,
        totalItems: 2,
        totalValue: { amount: 100, currencyCode: 'USD' },
        items: [
          {
            id: 'item-1',
            batchTransferId: '',
            itemId: 'item-001',
            plannedQuantity: 10,
            unitCost: { amount: 5, currencyCode: 'USD' },
            totalCost: { amount: 50, currencyCode: 'USD' },
            status: 'pending' as const
          },
          {
            id: 'item-2',
            batchTransferId: '',
            itemId: 'item-002',
            plannedQuantity: 5,
            unitCost: { amount: 10, currencyCode: 'USD' },
            totalCost: { amount: 50, currencyCode: 'USD' },
            status: 'pending' as const
          }
        ]
      }

      // Mock mixed results
      const mockExecuteStockTransfer = vi.spyOn(service, 'executeStockTransfer')
      mockExecuteStockTransfer
        .mockResolvedValueOnce({ success: true, data: {} as any })
        .mockResolvedValueOnce({ success: false, error: 'Transfer failed' })

      const mockStoreBatchOperation = vi.spyOn(service as any, 'storeBatchOperation')
      mockStoreBatchOperation.mockResolvedValue(undefined)

      // Mock other required methods
      vi.spyOn(service as any, 'updateBatchTransferItem').mockResolvedValue(undefined)
      vi.spyOn(service as any, 'updateBatchOperationProgress').mockResolvedValue(undefined)
      vi.spyOn(service as any, 'updateBatchOperation').mockResolvedValue(undefined)

      // Act
      const result = await service.executeBatchTransfer(batchOperation, 'user-001')

      // Assert
      expect(result.success).toBe(true) // Still success because some items completed
      expect(result.warnings).toBeDefined()
      expect(result.warnings![0]).toContain('Failed to transfer item item-002')
      expect(result.data?.completionPercentage).toBe(50) // 1 out of 2 completed
    })
  })

  describe('Error Handling', () => {
    it('should handle service unavailability gracefully', async () => {
      // Arrange
      mockInventoryService.getStockBalance.mockRejectedValue(new Error('Service unavailable'))

      // Act
      const result = await service.createStockReservation(
        'item-001',
        'warehouse',
        10,
        'user-001',
        'order-123'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to create stock reservation')
    })

    it('should validate input parameters', async () => {
      // Act
      const result = await service.executeStockTransfer(
        '', // Invalid empty location
        'store',
        [],
        'user-001'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('invalid')
    })
  })

  describe('Performance', () => {
    it('should process batch operations efficiently', async () => {
      // Arrange
      const largeItems = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        batchTransferId: '',
        itemId: `item-${i}`,
        plannedQuantity: 1,
        unitCost: { amount: 1, currencyCode: 'USD' },
        totalCost: { amount: 1, currencyCode: 'USD' },
        status: 'pending' as const
      }))

      const largeBatchOperation = {
        operationType: 'bulk_transfer' as const,
        fromLocationId: 'warehouse',
        toLocationId: 'store',
        requestedBy: 'user-001',
        requestDate: new Date(),
        status: 'planned' as const,
        totalItems: 50,
        totalValue: { amount: 50, currencyCode: 'USD' },
        items: largeItems
      }

      // Mock successful transfers
      const mockExecuteStockTransfer = vi.spyOn(service, 'executeStockTransfer')
      mockExecuteStockTransfer.mockResolvedValue({
        success: true,
        data: {} as any
      })

      // Mock storage operations
      vi.spyOn(service as any, 'storeBatchOperation').mockResolvedValue(undefined)
      vi.spyOn(service as any, 'updateBatchTransferItem').mockResolvedValue(undefined)
      vi.spyOn(service as any, 'updateBatchOperationProgress').mockResolvedValue(undefined)
      vi.spyOn(service as any, 'updateBatchOperation').mockResolvedValue(undefined)

      // Act
      const startTime = Date.now()
      const result = await service.executeBatchTransfer(largeBatchOperation, 'user-001')
      const endTime = Date.now()

      // Assert
      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(10000) // Should complete within 10 seconds
      expect(mockExecuteStockTransfer).toHaveBeenCalledTimes(50)
    })
  })
})