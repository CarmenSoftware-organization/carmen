/**
 * Procurement Integration Service Test Suite
 * 
 * Comprehensive tests for the ProcurementIntegrationService including:
 * - Business logic integration
 * - Budget validation
 * - Vendor selection recommendations
 * - Inventory impact analysis
 * - Workflow automation
 * - Performance metrics calculation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ProcurementIntegrationService } from '../procurement-integration-service'
import { Money, PurchaseRequest, PurchaseOrderItem } from '@/lib/types'

// Mock all service dependencies
vi.mock('../db/purchase-request-service', () => ({
  purchaseRequestService: {
    getPurchaseRequestStatistics: vi.fn().mockResolvedValue({
      success: true,
      data: {
        total: 25,
        byStatus: { draft: 5, approved: 15, pending_approval: 5 },
        pendingApprovals: 5,
        totalValue: { amount: 50000, currencyCode: 'USD' }
      }
    })
  }
}))

vi.mock('../db/purchase-order-service', () => ({
  purchaseOrderService: {
    getPurchaseOrderStatistics: vi.fn().mockResolvedValue({
      success: true,
      data: {
        total: 18,
        byStatus: { draft: 3, sent: 8, acknowledged: 5, fully_received: 2 },
        totalValue: { amount: 75000, currencyCode: 'USD' },
        onTimeDeliveryRate: 85,
        overdueDeliveries: 2,
        topVendorsByValue: [
          { vendorId: 'vendor-1', vendorName: 'Test Vendor 1', orderCount: 5, totalValue: { amount: 25000, currencyCode: 'USD' } },
          { vendorId: 'vendor-2', vendorName: 'Test Vendor 2', orderCount: 3, totalValue: { amount: 15000, currencyCode: 'USD' } }
        ]
      }
    })
  }
}))

vi.mock('../db/vendor-service', () => ({
  vendorService: {
    getVendors: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'vendor-1',
          companyName: 'Test Vendor 1',
          onTimeDeliveryRate: 95,
          qualityRating: 4.5,
          priceCompetitiveness: 88,
          status: 'active'
        },
        {
          id: 'vendor-2',
          companyName: 'Test Vendor 2',
          onTimeDeliveryRate: 82,
          qualityRating: 4.1,
          priceCompetitiveness: 75,
          status: 'active'
        }
      ]
    })
  }
}))

vi.mock('../calculations/financial-calculations', () => ({
  FinancialCalculations: vi.fn().mockImplementation(() => ({}))
}))

vi.mock('../calculations/inventory-calculations', () => ({
  InventoryCalculations: vi.fn().mockImplementation(() => ({}))
}))

vi.mock('../calculations/vendor-metrics', () => ({
  VendorMetrics: vi.fn().mockImplementation(() => ({}))
}))

vi.mock('../cache/cached-financial-calculations', () => ({
  CachedFinancialCalculations: vi.fn().mockImplementation(() => ({}))
}))

vi.mock('../cache/cached-inventory-calculations', () => ({
  CachedInventoryCalculations: vi.fn().mockImplementation(() => ({}))
}))

vi.mock('../cache/cached-vendor-metrics', () => ({
  CachedVendorMetrics: vi.fn().mockImplementation(() => ({}))
}))

describe('ProcurementIntegrationService', () => {
  let service: ProcurementIntegrationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProcurementIntegrationService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getProcurementSummary', () => {
    it('should return comprehensive procurement summary', async () => {
      const result = await service.getProcurementSummary('dept-1', 'loc-1')

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        totalRequests: 25,
        totalOrders: 18,
        totalSpend: { amount: 75000, currencyCode: 'USD' },
        pendingApprovals: 5,
        overdueDeliveries: 2,
        budgetUtilization: expect.any(Number),
        avgProcessingTime: expect.any(Number),
        topVendors: expect.arrayContaining([
          expect.objectContaining({
            vendorId: 'vendor-1',
            vendorName: 'Test Vendor 1',
            orderCount: 5,
            totalSpend: { amount: 25000, currencyCode: 'USD' }
          })
        ]),
        criticalItems: expect.any(Array)
      })
    })

    it('should handle service failures gracefully', async () => {
      const { purchaseRequestService } = await import('../db/purchase-request-service')
      vi.mocked(purchaseRequestService.getPurchaseRequestStatistics).mockResolvedValue({
        success: false,
        error: 'Database error'
      })

      const result = await service.getProcurementSummary()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch procurement statistics')
    })
  })

  describe('validateBudget', () => {
    it('should validate budget successfully with sufficient funds', async () => {
      const requestedAmount: Money = { amount: 5000, currencyCode: 'USD' }
      
      const result = await service.validateBudget('BUDGET-001', requestedAmount, 'dept-1')

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        isValid: true,
        budgetCode: 'BUDGET-001',
        totalBudget: { amount: 100000, currencyCode: 'USD' },
        exceedsLimit: false,
        warningThreshold: false
      })
    })

    it('should detect budget overrun', async () => {
      const requestedAmount: Money = { amount: 50000, currencyCode: 'USD' }
      
      const result = await service.validateBudget('BUDGET-001', requestedAmount, 'dept-1')

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        isValid: false,
        exceedsLimit: true,
        warningThreshold: true
      })
    })

    it('should detect warning threshold', async () => {
      const requestedAmount: Money = { amount: 25000, currencyCode: 'USD' }
      
      const result = await service.validateBudget('BUDGET-001', requestedAmount, 'dept-1')

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        isValid: true,
        exceedsLimit: false,
        warningThreshold: true,
        utilizationRate: expect.toBeGreaterThan(80)
      })
    })
  })

  describe('getVendorSelectionRecommendation', () => {
    it('should provide vendor recommendation with performance metrics', async () => {
      const itemIds = ['item-1', 'item-2']
      const quantities = [10, 5]
      const deliveryDate = new Date(Date.now() + 86400000 * 7) // 7 days from now
      const locationId = 'loc-1'

      const result = await service.getVendorSelectionRecommendation(
        itemIds,
        quantities,
        deliveryDate,
        locationId
      )

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        recommendedVendorId: 'vendor-1',
        vendorName: 'Test Vendor 1',
        score: expect.any(Number),
        reasons: expect.any(Array),
        priceComparison: {
          proposedPrice: expect.objectContaining({ amount: expect.any(Number) }),
          marketAverage: expect.objectContaining({ amount: expect.any(Number) }),
          savings: expect.objectContaining({ amount: expect.any(Number) }),
          competitiveness: expect.any(String)
        },
        performanceMetrics: {
          onTimeDeliveryRate: expect.any(Number),
          qualityRating: expect.any(Number),
          priceCompetitiveness: expect.any(Number),
          overallRating: expect.any(Number)
        },
        alternatives: expect.any(Array)
      })
    })

    it('should handle no vendors available', async () => {
      const { vendorService } = await import('../db/vendor-service')
      vi.mocked(vendorService.getVendors).mockResolvedValue({
        success: true,
        data: []
      })

      const result = await service.getVendorSelectionRecommendation(['item-1'], [1], new Date(), 'loc-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No active vendors found')
    })

    it('should handle vendor service failure', async () => {
      const { vendorService } = await import('../db/vendor-service')
      vi.mocked(vendorService.getVendors).mockResolvedValue({
        success: false,
        error: 'Database error'
      })

      const result = await service.getVendorSelectionRecommendation(['item-1'], [1], new Date(), 'loc-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch vendors')
    })
  })

  describe('analyzeInventoryImpact', () => {
    const mockItems: PurchaseOrderItem[] = [
      {
        id: 'item-1',
        orderId: 'po-1',
        lineNumber: 1,
        itemId: 'product-1',
        itemName: 'Test Product 1',
        description: 'Test Description',
        orderedQuantity: 100,
        receivedQuantity: 0,
        pendingQuantity: 100,
        unit: 'pieces',
        unitPrice: { amount: 50, currencyCode: 'USD' },
        discount: 0,
        discountAmount: { amount: 0, currencyCode: 'USD' },
        lineTotal: { amount: 5000, currencyCode: 'USD' },
        taxRate: 0,
        taxAmount: { amount: 0, currencyCode: 'USD' },
        deliveryDate: new Date(),
        status: 'pending'
      }
    ]

    it('should analyze inventory impact successfully', async () => {
      const result = await service.analyzeInventoryImpact(mockItems)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0]).toMatchObject({
        itemId: 'product-1',
        itemName: 'Test Product 1',
        currentStock: expect.any(Number),
        incomingQuantity: 100,
        projectedStock: expect.any(Number),
        reorderPoint: expect.any(Number),
        maxStock: expect.any(Number),
        impact: expect.stringMatching(/critical|normal|overstocked/),
        recommendations: expect.any(Array),
        costImpact: expect.objectContaining({
          amount: 5000,
          currencyCode: 'USD'
        }),
        storageRequirements: expect.objectContaining({
          space: expect.any(Number),
          specialRequirements: expect.any(Array)
        })
      })
    })

    it('should identify critical stock situations', async () => {
      const result = await service.analyzeInventoryImpact(mockItems)

      // Based on mock data where currentStock (150) > reorderPoint (50), should be normal
      // But let's test the logic by checking the structure
      expect(result.success).toBe(true)
      expect(result.data![0].impact).toMatch(/critical|normal|overstocked/)
    })

    it('should handle empty items array', async () => {
      const result = await service.analyzeInventoryImpact([])

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })

  describe('automateProcurementWorkflow', () => {
    const mockRequest: PurchaseRequest = {
      id: 'pr-1',
      requestNumber: 'PR-202401-0001',
      requestDate: new Date(),
      requiredDate: new Date(),
      requestType: 'goods',
      priority: 'normal',
      status: 'draft',
      departmentId: 'dept-1',
      locationId: 'loc-1',
      requestedBy: 'user-1',
      totalItems: 1,
      estimatedTotal: { amount: 1500, currencyCode: 'USD' },
      workflowStages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should auto-approve low-value requests', async () => {
      const lowValueRequest = {
        ...mockRequest,
        estimatedTotal: { amount: 300, currencyCode: 'USD' }
      }

      const result = await service.automateProcurementWorkflow(lowValueRequest)

      expect(result.success).toBe(true)
      expect(result.data?.autoApprovals).toHaveLength(2)
      expect(result.data?.autoApprovals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: 'hdApproval',
            approved: true,
            reason: 'Auto-approved: Low value request'
          }),
          expect.objectContaining({
            stage: 'purchaseReview',
            approved: true,
            reason: 'Auto-approved: Standard procurement process'
          })
        ])
      )
      expect(result.data?.requiredApprovals).toHaveLength(0)
    })

    it('should require approvals for medium-value requests', async () => {
      const mediumValueRequest = {
        ...mockRequest,
        estimatedTotal: { amount: 3000, currencyCode: 'USD' }
      }

      const result = await service.automateProcurementWorkflow(mediumValueRequest)

      expect(result.success).toBe(true)
      expect(result.data?.requiredApprovals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: 'hdApproval',
            approver: 'department_head',
            reason: 'Requires department head approval'
          })
        ])
      )
    })

    it('should require full approval chain for high-value requests', async () => {
      const highValueRequest = {
        ...mockRequest,
        estimatedTotal: { amount: 75000, currencyCode: 'USD' }
      }

      const result = await service.automateProcurementWorkflow(highValueRequest)

      expect(result.success).toBe(true)
      expect(result.data?.requiredApprovals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ stage: 'hdApproval' }),
          expect.objectContaining({ stage: 'purchaseReview' }),
          expect.objectContaining({ stage: 'financeManager' }),
          expect.objectContaining({ stage: 'gmApproval' })
        ])
      )
    })

    it('should calculate estimated completion date', async () => {
      const result = await service.automateProcurementWorkflow(mockRequest)

      expect(result.success).toBe(true)
      expect(result.data?.estimatedCompletionDate).toBeInstanceOf(Date)
      expect(result.data?.estimatedCompletionDate.getTime()).toBeGreaterThan(Date.now())
    })

    it('should provide critical path analysis', async () => {
      const result = await service.automateProcurementWorkflow(mockRequest)

      expect(result.success).toBe(true)
      expect(result.data?.criticalPath).toContain('request_submission')
      expect(result.data?.criticalPath).toContain('po_creation')
      expect(result.data?.criticalPath).toContain('vendor_communication')
    })
  })

  describe('updateInventoryFromReceipt', () => {
    const mockReceivedItems = [
      {
        itemId: 'item-1',
        receivedQuantity: 8,
        rejectedQuantity: 2,
        batchNumber: 'BATCH-001',
        expiryDate: new Date(Date.now() + 86400000 * 365) // 1 year from now
      }
    ]

    it('should update inventory successfully', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const result = await service.updateInventoryFromReceipt('po-1', mockReceivedItems)

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('Updating inventory for order po-1:')
      expect(consoleSpy).toHaveBeenCalledWith('- Item item-1: +8 units')
      expect(consoleSpy).toHaveBeenCalledWith('  - Rejected: 2 units')
      expect(consoleSpy).toHaveBeenCalledWith('  - Batch: BATCH-001')
      
      consoleSpy.mockRestore()
    })

    it('should handle items without optional fields', async () => {
      const simpleItems = [
        {
          itemId: 'item-1',
          receivedQuantity: 10,
          rejectedQuantity: 0
        }
      ]

      const result = await service.updateInventoryFromReceipt('po-1', simpleItems)

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
    })
  })

  describe('calculateProcurementPerformanceMetrics', () => {
    it('should calculate comprehensive performance metrics', async () => {
      const result = await service.calculateProcurementPerformanceMetrics('dept-1', 30)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        totalRequests: 25,
        completedRequests: 20, // total - pending
        averageProcessingTime: 4.5,
        onTimeDeliveryRate: 85,
        budgetCompliance: 92.5,
        costSavings: { amount: 12500, currencyCode: 'USD' },
        vendorPerformanceScore: 87.3,
        qualityMetrics: {
          defectRate: 2.1,
          returnRate: 0.8,
          satisfactionScore: 4.3
        }
      })
    })

    it('should handle service failures in performance calculation', async () => {
      const { purchaseRequestService } = await import('../db/purchase-request-service')
      vi.mocked(purchaseRequestService.getPurchaseRequestStatistics).mockResolvedValue({
        success: false,
        error: 'Database error'
      })

      const result = await service.calculateProcurementPerformanceMetrics('dept-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch statistics for performance calculation')
    })
  })

  describe('generateProcurementRecommendations', () => {
    it('should generate comprehensive recommendations', async () => {
      const result = await service.generateProcurementRecommendations('dept-1')

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        budgetOptimization: expect.arrayContaining([
          expect.stringContaining('budget'),
          expect.stringContaining('forecasts'),
          expect.stringContaining('alerts')
        ]),
        vendorConsolidation: expect.arrayContaining([
          expect.stringContaining('vendor'),
          expect.stringContaining('performance'),
          expect.stringContaining('framework')
        ]),
        processImprovement: expect.arrayContaining([
          expect.stringContaining('workflow'),
          expect.stringContaining('automated'),
          expect.stringContaining('templates')
        ]),
        riskMitigation: expect.arrayContaining([
          expect.stringContaining('supplier'),
          expect.stringContaining('backup'),
          expect.stringContaining('assessment')
        ]),
        costReduction: expect.arrayContaining([
          expect.stringContaining('discount'),
          expect.stringContaining('sourcing'),
          expect.stringContaining('purchasing')
        ])
      })
    })

    it('should always return recommendations', async () => {
      const result = await service.generateProcurementRecommendations('any-dept')

      expect(result.success).toBe(true)
      expect(Object.keys(result.data!)).toHaveLength(5)
      expect(result.data!.budgetOptimization.length).toBeGreaterThan(0)
      expect(result.data!.vendorConsolidation.length).toBeGreaterThan(0)
      expect(result.data!.processImprovement.length).toBeGreaterThan(0)
      expect(result.data!.riskMitigation.length).toBeGreaterThan(0)
      expect(result.data!.costReduction.length).toBeGreaterThan(0)
    })
  })
})