/**
 * Purchase Order Service Test Suite
 * 
 * Comprehensive tests for the PurchaseOrderService including:
 * - CRUD operations
 * - Lifecycle management
 * - Vendor integration
 * - Receiving workflows
 * - Financial calculations
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PurchaseOrderService, CreatePurchaseOrderInput } from '../purchase-order-service'
import { Money } from '@/lib/types'

// Mock dependencies
vi.mock('../vendor-service', () => ({
  VendorService: vi.fn().mockImplementation(() => ({
    getVendorById: vi.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'vendor-1',
        companyName: 'Test Vendor',
        preferredCurrency: 'USD',
        preferredPaymentTerms: '30 days',
        addresses: [{ isPrimary: true, street: '123 Main St', city: 'Test City' }],
        contacts: [{ isPrimary: true, name: 'John Doe', email: 'john@test.com', phone: '123-456-7890' }]
      }
    })
  }))
}))

vi.mock('../product-service', () => ({
  ProductService: vi.fn().mockImplementation(() => ({}))
}))

vi.mock('../purchase-request-service', () => ({
  PurchaseRequestService: vi.fn().mockImplementation(() => ({}))
}))

// Mock Prisma client
const mockPrisma = {
  purchase_orders: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn()
  },
  purchase_order_items: {
    create: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn()
  },
  purchase_order_receipts: {
    create: vi.fn()
  },
  $transaction: vi.fn()
} as any

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PurchaseOrderService(mockPrisma as PrismaClient)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getPurchaseOrders', () => {
    it('should fetch purchase orders with default pagination', async () => {
      const mockData = [
        {
          id: 'po-1',
          order_number: 'PO-202401-0001',
          order_date: new Date(),
          vendor_id: 'vendor-1',
          vendor_name: 'Test Vendor',
          status: 'draft',
          currency: 'USD',
          exchange_rate: 1,
          subtotal: 1500,
          tax_amount: 150,
          discount_amount: 0,
          total_amount: 1650,
          delivery_location_id: 'loc-1',
          expected_delivery_date: new Date(),
          payment_terms: '30 days',
          approved_by: 'user-1',
          approved_at: new Date(),
          total_items: 1,
          received_items: 0,
          pending_items: 1,
          created_at: new Date(),
          updated_at: new Date(),
          items: [],
          vendor: {}
        }
      ]

      mockPrisma.purchase_orders.findMany.mockResolvedValue(mockData)
      mockPrisma.purchase_orders.count.mockResolvedValue(1)

      const result = await service.getPurchaseOrders()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.metadata?.total).toBe(1)
      expect(mockPrisma.purchase_orders.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          items: { include: { product: true } },
          vendor: true
        },
        orderBy: { order_date: 'desc' },
        skip: 0,
        take: 50
      })
    })

    it('should apply filters correctly', async () => {
      mockPrisma.purchase_orders.findMany.mockResolvedValue([])
      mockPrisma.purchase_orders.count.mockResolvedValue(0)

      const filters = {
        status: ['draft', 'sent'] as any[],
        vendorId: 'vendor-1',
        currency: ['USD'],
        search: 'test search'
      }

      await service.getPurchaseOrders(filters)

      expect(mockPrisma.purchase_orders.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['draft', 'sent'] },
          vendor_id: 'vendor-1',
          currency: { in: ['USD'] },
          OR: [
            { order_number: { contains: 'test search', mode: 'insensitive' } },
            { vendor_name: { contains: 'test search', mode: 'insensitive' } },
            { notes: { contains: 'test search', mode: 'insensitive' } }
          ]
        },
        include: {
          items: { include: { product: true } },
          vendor: true
        },
        orderBy: { order_date: 'desc' },
        skip: 0,
        take: 50
      })
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.purchase_orders.findMany.mockRejectedValue(new Error('Database error'))

      const result = await service.getPurchaseOrders()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to fetch purchase orders')
    })
  })

  describe('getPurchaseOrderById', () => {
    it('should fetch a purchase order by ID', async () => {
      const mockData = {
        id: 'po-1',
        order_number: 'PO-202401-0001',
        order_date: new Date(),
        vendor_id: 'vendor-1',
        vendor_name: 'Test Vendor',
        status: 'draft',
        currency: 'USD',
        exchange_rate: 1,
        subtotal: 1500,
        tax_amount: 150,
        discount_amount: 0,
        total_amount: 1650,
        delivery_location_id: 'loc-1',
        expected_delivery_date: new Date(),
        payment_terms: '30 days',
        approved_by: 'user-1',
        approved_at: new Date(),
        total_items: 1,
        received_items: 0,
        pending_items: 1,
        created_at: new Date(),
        updated_at: new Date(),
        items: [],
        vendor: {}
      }

      mockPrisma.purchase_orders.findUnique.mockResolvedValue(mockData)

      const result = await service.getPurchaseOrderById('po-1')

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('po-1')
      expect(mockPrisma.purchase_orders.findUnique).toHaveBeenCalledWith({
        where: { id: 'po-1' },
        include: {
          items: {
            include: { product: true },
            orderBy: { line_number: 'asc' }
          },
          vendor: true
        }
      })
    })

    it('should return error if purchase order not found', async () => {
      mockPrisma.purchase_orders.findUnique.mockResolvedValue(null)

      const result = await service.getPurchaseOrderById('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Purchase order not found')
    })
  })

  describe('createPurchaseOrder', () => {
    const mockInput: CreatePurchaseOrderInput = {
      vendorId: 'vendor-1',
      currency: 'USD',
      exchangeRate: 1,
      deliveryLocationId: 'loc-1',
      expectedDeliveryDate: new Date(Date.now() + 86400000), // Tomorrow
      paymentTerms: '30 days',
      terms: {
        paymentTerms: '30 days',
        deliveryTerms: 'FOB Destination',
        warrantyPeriod: 365,
        returnPolicy: 'Standard return policy'
      },
      approvedBy: 'user-1',
      notes: 'Test order',
      items: [
        {
          itemName: 'Test Item',
          description: 'Test Description',
          orderedQuantity: 10,
          unit: 'pieces',
          unitPrice: { amount: 100, currencyCode: 'USD' } as Money,
          deliveryDate: new Date(Date.now() + 86400000)
        }
      ]
    }

    it('should create a purchase order successfully', async () => {
      const mockDbOrder = {
        id: 'po-1',
        order_number: 'PO-202401-0001',
        order_date: new Date(),
        vendor_id: mockInput.vendorId,
        vendor_name: 'Test Vendor',
        status: 'draft',
        currency: mockInput.currency,
        exchange_rate: mockInput.exchangeRate,
        subtotal: 1000,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: 1000,
        delivery_location_id: mockInput.deliveryLocationId,
        expected_delivery_date: mockInput.expectedDeliveryDate,
        payment_terms: mockInput.paymentTerms,
        approved_by: mockInput.approvedBy,
        approved_at: new Date(),
        total_items: 1,
        received_items: 0,
        pending_items: 1,
        notes: mockInput.notes,
        created_at: new Date(),
        updated_at: new Date()
      }

      const mockDbItem = {
        id: 'item-1',
        order_id: 'po-1',
        line_number: 1,
        item_name: 'Test Item',
        description: 'Test Description',
        ordered_quantity: 10,
        received_quantity: 0,
        pending_quantity: 10,
        unit: 'pieces',
        unit_price: 100,
        discount: 0,
        discount_amount: 0,
        line_total: 1000,
        tax_rate: 0,
        tax_amount: 0,
        delivery_date: mockInput.items[0].deliveryDate,
        status: 'pending'
      }

      // Mock the transaction
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          purchase_orders: {
            create: vi.fn().mockResolvedValue(mockDbOrder)
          },
          purchase_order_items: {
            create: vi.fn().mockResolvedValue(mockDbItem)
          }
        }
        return callback(tx)
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        ...mockDbOrder,
        items: [mockDbItem],
        vendor: {}
      })

      const result = await service.createPurchaseOrder(mockInput)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('po-1')
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should validate vendor exists', async () => {
      // Mock vendor service to return failure
      const mockVendorService = service['vendorService']
      vi.spyOn(mockVendorService, 'getVendorById').mockResolvedValue({
        success: false,
        error: 'Vendor not found'
      })

      const result = await service.createPurchaseOrder(mockInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid vendor')
    })

    it('should handle database errors during creation', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))

      const result = await service.createPurchaseOrder(mockInput)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to create purchase order')
    })
  })

  describe('sendPurchaseOrder', () => {
    it('should send a draft purchase order', async () => {
      const mockOrder = {
        id: 'po-1',
        status: 'draft',
        items: [{ id: 'item-1' }]
      }

      mockPrisma.purchase_orders.findUnique.mockResolvedValue(mockOrder)
      mockPrisma.purchase_orders.update.mockResolvedValue({
        ...mockOrder,
        status: 'sent',
        sent_by: 'user-1',
        sent_at: new Date()
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'sent'
      })

      const result = await service.sendPurchaseOrder('po-1', 'user-1')

      expect(result.success).toBe(true)
      expect(mockPrisma.purchase_orders.update).toHaveBeenCalledWith({
        where: { id: 'po-1' },
        data: {
          status: 'sent',
          sent_by: 'user-1',
          sent_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      })
    })

    it('should not allow sending non-draft orders', async () => {
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        id: 'po-1',
        status: 'sent',
        items: []
      })

      const result = await service.sendPurchaseOrder('po-1', 'user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Only draft orders can be sent')
    })

    it('should not allow sending orders without items', async () => {
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        id: 'po-1',
        status: 'draft',
        items: []
      })

      const result = await service.sendPurchaseOrder('po-1', 'user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot send order without items')
    })
  })

  describe('receivePurchaseOrder', () => {
    const mockOrder = {
      id: 'po-1',
      status: 'acknowledged',
      items: [
        {
          id: 'item-1',
          ordered_quantity: 10,
          received_quantity: 0
        }
      ]
    }

    const mockReceiveInput = {
      receivedBy: 'user-1',
      receivedDate: new Date(),
      items: [
        {
          itemId: 'item-1',
          receivedQuantity: 8,
          rejectedQuantity: 2,
          qualityStatus: 'passed' as const
        }
      ]
    }

    it('should receive purchase order items successfully', async () => {
      mockPrisma.purchase_orders.findUnique.mockResolvedValue(mockOrder)
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          purchase_order_items: {
            update: vi.fn().mockResolvedValue({})
          },
          purchase_order_receipts: {
            create: vi.fn().mockResolvedValue({})
          },
          purchase_orders: {
            update: vi.fn().mockResolvedValue({})
          }
        }
        return callback(tx)
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'partial_received',
        received_items: 1,
        pending_items: 0
      })

      const result = await service.receivePurchaseOrder('po-1', mockReceiveInput)

      expect(result.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should not allow receiving non-acknowledged orders', async () => {
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'draft'
      })

      const result = await service.receivePurchaseOrder('po-1', mockReceiveInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Order must be acknowledged before receiving')
    })
  })

  describe('closePurchaseOrder', () => {
    it('should close a purchase order successfully', async () => {
      const mockOrder = {
        id: 'po-1',
        status: 'fully_received'
      }

      mockPrisma.purchase_orders.findUnique.mockResolvedValue(mockOrder)
      mockPrisma.purchase_orders.update.mockResolvedValue({
        ...mockOrder,
        status: 'closed',
        closed_by: 'user-1',
        closed_at: new Date()
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'closed'
      })

      const result = await service.closePurchaseOrder('po-1', 'user-1', 'Order completed')

      expect(result.success).toBe(true)
      expect(mockPrisma.purchase_orders.update).toHaveBeenCalledWith({
        where: { id: 'po-1' },
        data: {
          status: 'closed',
          closed_by: 'user-1',
          closed_at: expect.any(Date),
          closure_reason: 'Order completed',
          updated_at: expect.any(Date)
        }
      })
    })

    it('should not allow closing already closed orders', async () => {
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        id: 'po-1',
        status: 'closed'
      })

      const result = await service.closePurchaseOrder('po-1', 'user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Purchase order is already closed')
    })
  })

  describe('cancelPurchaseOrder', () => {
    it('should cancel a purchase order successfully', async () => {
      const mockOrder = {
        id: 'po-1',
        status: 'sent'
      }

      mockPrisma.purchase_orders.findUnique.mockResolvedValue(mockOrder)
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          purchase_orders: {
            update: vi.fn().mockResolvedValue({})
          },
          purchase_order_items: {
            updateMany: vi.fn().mockResolvedValue({})
          }
        }
        return callback(tx)
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'cancelled'
      })

      const result = await service.cancelPurchaseOrder('po-1', 'user-1', 'No longer needed')

      expect(result.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should not allow cancelling fully received orders', async () => {
      mockPrisma.purchase_orders.findUnique.mockResolvedValue({
        id: 'po-1',
        status: 'fully_received'
      })

      const result = await service.cancelPurchaseOrder('po-1', 'user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot cancel order in current status')
    })
  })

  describe('getPurchaseOrderStatistics', () => {
    it('should return comprehensive statistics', async () => {
      mockPrisma.purchase_orders.groupBy
        .mockResolvedValueOnce([
          { status: 'draft', _count: { status: 5 } },
          { status: 'sent', _count: { status: 10 } }
        ])
        .mockResolvedValueOnce([
          { currency: 'USD', _count: { currency: 12 }, _sum: { total_amount: 25000 } },
          { currency: 'EUR', _count: { currency: 3 }, _sum: { total_amount: 7500 } }
        ])

      mockPrisma.purchase_orders.aggregate.mockResolvedValue({
        _count: { id: 15 },
        _sum: { total_amount: 32500 },
        _avg: { total_amount: 2167 }
      })

      // Mock delivery stats
      mockPrisma.purchase_orders.count
        .mockResolvedValueOnce(8) // pending deliveries
        .mockResolvedValueOnce(2) // overdue deliveries
        .mockResolvedValueOnce(12) // on-time deliveries
        .mockResolvedValueOnce(15) // total delivered

      const result = await service.getPurchaseOrderStatistics()

      expect(result.success).toBe(true)
      expect(result.data?.total).toBe(15)
      expect(result.data?.byStatus).toEqual({
        draft: 5,
        sent: 10
      })
      expect(result.data?.byCurrency).toEqual({
        USD: 12,
        EUR: 3
      })
      expect(result.data?.totalValue).toEqual({
        amount: 32500,
        currencyCode: 'USD'
      })
      expect(result.data?.onTimeDeliveryRate).toBe(80) // 12/15 * 100
      expect(result.data?.pendingDeliveries).toBe(8)
      expect(result.data?.overdueDeliveries).toBe(2)
    })
  })
})