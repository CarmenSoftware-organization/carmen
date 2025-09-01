/**
 * Purchase Request Service Test Suite
 * 
 * Comprehensive tests for the PurchaseRequestService including:
 * - CRUD operations
 * - Workflow management
 * - Approval processes
 * - Budget validation
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PurchaseRequestService, CreatePurchaseRequestInput } from '../purchase-request-service'
import { PurchaseRequestPriority, PurchaseRequestType, Money } from '@/lib/types'

// Mock Prisma client
const mockPrisma = {
  purchase_requests: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn()
  },
  purchase_request_items: {
    create: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn()
  },
  purchase_request_workflow_stages: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn()
  },
  $transaction: vi.fn()
} as any

describe('PurchaseRequestService', () => {
  let service: PurchaseRequestService
  
  beforeEach(() => {
    vi.clearAllMocks()
    service = new PurchaseRequestService(mockPrisma as PrismaClient)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getPurchaseRequests', () => {
    it('should fetch purchase requests with default pagination', async () => {
      const mockData = [
        {
          id: 'pr-1',
          request_number: 'PR-202401-0001',
          request_date: new Date(),
          required_date: new Date(),
          request_type: 'goods',
          priority: 'normal',
          status: 'draft',
          department_id: 'dept-1',
          location_id: 'loc-1',
          requested_by: 'user-1',
          total_items: 1,
          estimated_total_amount: 1500,
          estimated_total_currency: 'USD',
          created_at: new Date(),
          updated_at: new Date(),
          items: [],
          workflow_stages: []
        }
      ]

      mockPrisma.purchase_requests.findMany.mockResolvedValue(mockData)
      mockPrisma.purchase_requests.count.mockResolvedValue(1)

      const result = await service.getPurchaseRequests()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.metadata?.total).toBe(1)
      expect(mockPrisma.purchase_requests.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          items: { include: { product: true } },
          workflow_stages: true
        },
        orderBy: { request_date: 'desc' },
        skip: 0,
        take: 50
      })
    })

    it('should apply filters correctly', async () => {
      mockPrisma.purchase_requests.findMany.mockResolvedValue([])
      mockPrisma.purchase_requests.count.mockResolvedValue(0)

      const filters = {
        status: ['draft', 'pending_approval'] as any[],
        priority: ['high'] as PurchaseRequestPriority[],
        departmentId: 'dept-1',
        search: 'test search'
      }

      await service.getPurchaseRequests(filters)

      expect(mockPrisma.purchase_requests.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['draft', 'pending_approval'] },
          priority: { in: ['high'] },
          department_id: 'dept-1',
          OR: [
            { request_number: { contains: 'test search', mode: 'insensitive' } },
            { justification: { contains: 'test search', mode: 'insensitive' } },
            { notes: { contains: 'test search', mode: 'insensitive' } }
          ]
        },
        include: {
          items: { include: { product: true } },
          workflow_stages: true
        },
        orderBy: { request_date: 'desc' },
        skip: 0,
        take: 50
      })
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.purchase_requests.findMany.mockRejectedValue(new Error('Database error'))

      const result = await service.getPurchaseRequests()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to fetch purchase requests')
    })
  })

  describe('getPurchaseRequestById', () => {
    it('should fetch a purchase request by ID', async () => {
      const mockData = {
        id: 'pr-1',
        request_number: 'PR-202401-0001',
        request_date: new Date(),
        required_date: new Date(),
        request_type: 'goods',
        priority: 'normal',
        status: 'draft',
        department_id: 'dept-1',
        location_id: 'loc-1',
        requested_by: 'user-1',
        total_items: 1,
        estimated_total_amount: 1500,
        estimated_total_currency: 'USD',
        created_at: new Date(),
        updated_at: new Date(),
        items: [],
        workflow_stages: []
      }

      mockPrisma.purchase_requests.findUnique.mockResolvedValue(mockData)

      const result = await service.getPurchaseRequestById('pr-1')

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('pr-1')
      expect(mockPrisma.purchase_requests.findUnique).toHaveBeenCalledWith({
        where: { id: 'pr-1' },
        include: {
          items: {
            include: { product: true },
            orderBy: { line_number: 'asc' }
          },
          workflow_stages: {
            orderBy: { created_at: 'asc' }
          }
        }
      })
    })

    it('should return error if purchase request not found', async () => {
      mockPrisma.purchase_requests.findUnique.mockResolvedValue(null)

      const result = await service.getPurchaseRequestById('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Purchase request not found')
    })
  })

  describe('createPurchaseRequest', () => {
    const mockInput: CreatePurchaseRequestInput = {
      requestDate: new Date(),
      requiredDate: new Date(Date.now() + 86400000), // Tomorrow
      requestType: 'goods' as PurchaseRequestType,
      priority: 'normal' as PurchaseRequestPriority,
      departmentId: 'dept-1',
      locationId: 'loc-1',
      requestedBy: 'user-1',
      justification: 'Test justification',
      items: [
        {
          itemName: 'Test Item',
          description: 'Test Description',
          requestedQuantity: 10,
          unit: 'pieces',
          estimatedUnitPrice: { amount: 100, currencyCode: 'USD' } as Money,
          deliveryLocationId: 'loc-1',
          requiredDate: new Date(Date.now() + 86400000),
          priority: 'normal' as PurchaseRequestPriority
        }
      ]
    }

    it('should create a purchase request successfully', async () => {
      const mockDbRequest = {
        id: 'pr-1',
        request_number: 'PR-202401-0001',
        request_date: mockInput.requestDate,
        required_date: mockInput.requiredDate,
        request_type: mockInput.requestType,
        priority: mockInput.priority,
        status: 'draft',
        department_id: mockInput.departmentId,
        location_id: mockInput.locationId,
        requested_by: mockInput.requestedBy,
        total_items: 1,
        estimated_total_amount: 1000,
        estimated_total_currency: 'USD',
        justification: mockInput.justification,
        created_at: new Date(),
        updated_at: new Date()
      }

      const mockDbItem = {
        id: 'item-1',
        request_id: 'pr-1',
        line_number: 1,
        item_name: 'Test Item',
        description: 'Test Description',
        requested_quantity: 10,
        unit: 'pieces',
        estimated_unit_price_amount: 100,
        estimated_unit_price_currency: 'USD',
        estimated_total_amount: 1000,
        estimated_total_currency: 'USD',
        delivery_location_id: 'loc-1',
        required_date: mockInput.items[0].requiredDate,
        priority: 'normal',
        status: 'draft',
        converted_to_po: false
      }

      // Mock the transaction
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          purchase_requests: {
            create: vi.fn().mockResolvedValue(mockDbRequest)
          },
          purchase_request_items: {
            create: vi.fn().mockResolvedValue(mockDbItem)
          },
          purchase_request_workflow_stages: {
            create: vi.fn().mockResolvedValue({})
          }
        }
        return callback(tx)
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_requests.findUnique.mockResolvedValue({
        ...mockDbRequest,
        items: [mockDbItem],
        workflow_stages: []
      })

      const result = await service.createPurchaseRequest(mockInput)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('pr-1')
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should validate required date is not in the past', async () => {
      const invalidInput = {
        ...mockInput,
        requiredDate: new Date(Date.now() - 86400000) // Yesterday
      }

      const result = await service.createPurchaseRequest(invalidInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Required date cannot be in the past')
    })

    it('should handle database errors during creation', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))

      const result = await service.createPurchaseRequest(mockInput)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to create purchase request')
    })
  })

  describe('submitPurchaseRequest', () => {
    it('should submit a draft purchase request', async () => {
      const mockRequest = {
        id: 'pr-1',
        status: 'draft',
        estimated_total_amount: 1500,
        department_id: 'dept-1',
        items: [{ id: 'item-1' }]
      }

      mockPrisma.purchase_requests.findUnique.mockResolvedValue(mockRequest)
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          purchase_requests: {
            update: vi.fn().mockResolvedValue({})
          },
          purchase_request_items: {
            updateMany: vi.fn().mockResolvedValue({})
          },
          purchase_request_workflow_stages: {
            create: vi.fn().mockResolvedValue({})
          }
        }
        return callback(tx)
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_requests.findUnique.mockResolvedValue({
        ...mockRequest,
        status: 'pending_approval',
        current_stage: 'hdApproval'
      })

      const result = await service.submitPurchaseRequest('pr-1', 'user-1')

      expect(result.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should not allow submission of non-draft requests', async () => {
      mockPrisma.purchase_requests.findUnique.mockResolvedValue({
        id: 'pr-1',
        status: 'approved',
        items: []
      })

      const result = await service.submitPurchaseRequest('pr-1', 'user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Only draft requests can be submitted')
    })

    it('should not allow submission without items', async () => {
      mockPrisma.purchase_requests.findUnique.mockResolvedValue({
        id: 'pr-1',
        status: 'draft',
        items: []
      })

      const result = await service.submitPurchaseRequest('pr-1', 'user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot submit request without items')
    })
  })

  describe('processApproval', () => {
    const mockRequest = {
      id: 'pr-1',
      status: 'pending_approval',
      current_stage: 'hdApproval',
      department_id: 'dept-1',
      workflow_stages: [
        {
          id: 'stage-1',
          stage_name: 'hdApproval',
          status: 'pending',
          stage_order: 1
        }
      ],
      items: []
    }

    it('should approve a request successfully', async () => {
      mockPrisma.purchase_requests.findUnique.mockResolvedValue(mockRequest)
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          purchase_request_workflow_stages: {
            update: vi.fn().mockResolvedValue({})
          },
          purchase_requests: {
            update: vi.fn().mockResolvedValue({})
          },
          purchase_request_items: {
            updateMany: vi.fn().mockResolvedValue({})
          }
        }
        return callback(tx)
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_requests.findUnique.mockResolvedValue({
        ...mockRequest,
        status: 'approved',
        approved_by: 'user-1'
      })

      const approvalInput = {
        userId: 'user-1',
        action: 'approve' as const,
        comments: 'Approved'
      }

      const result = await service.processApproval('pr-1', approvalInput)

      expect(result.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should reject a request successfully', async () => {
      mockPrisma.purchase_requests.findUnique.mockResolvedValue(mockRequest)
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          purchase_request_workflow_stages: {
            update: vi.fn().mockResolvedValue({})
          },
          purchase_requests: {
            update: vi.fn().mockResolvedValue({})
          },
          purchase_request_items: {
            updateMany: vi.fn().mockResolvedValue({})
          }
        }
        return callback(tx)
      })

      // Mock the subsequent fetch
      mockPrisma.purchase_requests.findUnique.mockResolvedValue({
        ...mockRequest,
        status: 'rejected',
        rejected_by: 'user-1'
      })

      const approvalInput = {
        userId: 'user-1',
        action: 'reject' as const,
        comments: 'Insufficient justification'
      }

      const result = await service.processApproval('pr-1', approvalInput)

      expect(result.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should not allow approval of non-pending requests', async () => {
      mockPrisma.purchase_requests.findUnique.mockResolvedValue({
        ...mockRequest,
        status: 'approved'
      })

      const approvalInput = {
        userId: 'user-1',
        action: 'approve' as const
      }

      const result = await service.processApproval('pr-1', approvalInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Request is not pending approval')
    })
  })

  describe('getPurchaseRequestStatistics', () => {
    it('should return comprehensive statistics', async () => {
      mockPrisma.purchase_requests.groupBy
        .mockResolvedValueOnce([
          { status: 'draft', _count: { status: 5 } },
          { status: 'approved', _count: { status: 15 } }
        ])
        .mockResolvedValueOnce([
          { priority: 'normal', _count: { priority: 10 } },
          { priority: 'high', _count: { priority: 8 } }
        ])
        .mockResolvedValueOnce([
          { request_type: 'goods', _count: { request_type: 12 } },
          { request_type: 'services', _count: { request_type: 8 } }
        ])

      mockPrisma.purchase_requests.aggregate.mockResolvedValue({
        _count: { id: 20 },
        _sum: { estimated_total_amount: 50000 },
        _avg: { estimated_total_amount: 2500 }
      })

      mockPrisma.purchase_requests.count.mockResolvedValue(3)

      const result = await service.getPurchaseRequestStatistics()

      expect(result.success).toBe(true)
      expect(result.data?.total).toBe(20)
      expect(result.data?.byStatus).toEqual({
        draft: 5,
        approved: 15
      })
      expect(result.data?.totalValue).toEqual({
        amount: 50000,
        currencyCode: 'USD'
      })
      expect(result.data?.pendingApprovals).toBe(3)
    })
  })
})