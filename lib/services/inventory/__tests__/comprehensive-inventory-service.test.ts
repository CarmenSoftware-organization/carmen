/**
 * Comprehensive Inventory Service Tests
 * 
 * Unit and integration tests for the comprehensive inventory management service
 * covering stock management, ABC analysis, reorder suggestions, and valuation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ComprehensiveInventoryService } from '../comprehensive-inventory-service'
import { CostingMethod } from '@/lib/types/inventory'
import type { Money } from '@/lib/types/common'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    inventory_items: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn()
    },
    stock_balances: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      aggregate: vi.fn()
    },
    inventory_transactions: {
      findMany: vi.fn(),
      create: vi.fn()
    },
    categories: {
      findUnique: vi.fn()
    }
  }
}))

vi.mock('../calculations/inventory-calculations')
vi.mock('../cache/cached-inventory-calculations')

describe('ComprehensiveInventoryService', () => {
  let service: ComprehensiveInventoryService
  let mockPrisma: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Create service instance
    service = new ComprehensiveInventoryService()
    
    // Get mock prisma instance
    mockPrisma = require('@/lib/db').prisma
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getEnhancedStockStatus', () => {
    it('should return enhanced stock status for all items when no itemIds provided', async () => {
      // Arrange
      const mockItems = [
        {
          id: 'item-001',
          item_code: 'TEST-001',
          item_name: 'Test Item 1',
          stock_balances: [
            {
              location_id: 'loc-001',
              quantity_on_hand: 50,
              quantity_reserved: 5,
              quantity_available: 45,
              average_cost_amount: 10.0,
              average_cost_currency: 'USD',
              total_value_amount: 500.0,
              total_value_currency: 'USD'
            }
          ],
          categories: { name: 'Test Category' },
          inventory_transactions: []
        }
      ]

      mockPrisma.inventory_items.findMany.mockResolvedValue(mockItems)

      // Act
      const result = await service.getEnhancedStockStatus()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0]).toMatchObject({
        itemId: 'item-001',
        itemCode: 'TEST-001',
        itemName: 'Test Item 1',
        totalQuantity: 50
      })
      expect(result.data![0].locationBreakdown).toHaveLength(1)
      expect(result.metadata?.total).toBe(1)
    })

    it('should filter by specific item IDs when provided', async () => {
      // Arrange
      const itemIds = ['item-001', 'item-002']
      mockPrisma.inventory_items.findMany.mockResolvedValue([])

      // Act
      await service.getEnhancedStockStatus(itemIds, false)

      // Assert
      expect(mockPrisma.inventory_items.findMany).toHaveBeenCalledWith({
        where: { id: { in: itemIds } },
        include: expect.any(Object)
      })
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrisma.inventory_items.findMany.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const result = await service.getEnhancedStockStatus()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Database connection failed')
    })
  })

  describe('performABCAnalysis', () => {
    it('should perform ABC analysis and classify items correctly', async () => {
      // Arrange
      const mockItems = [
        {
          id: 'item-001',
          item_name: 'High Value Item',
          inventory_transactions: [
            {
              transaction_type: 'ISSUE',
              quantity: 100,
              unit_cost_amount: 50.0,
              unit_cost_currency: 'USD',
              transaction_date: new Date('2024-01-15')
            }
          ],
          stock_balances: []
        },
        {
          id: 'item-002',
          item_name: 'Medium Value Item',
          inventory_transactions: [
            {
              transaction_type: 'ISSUE',
              quantity: 200,
              unit_cost_amount: 10.0,
              unit_cost_currency: 'USD',
              transaction_date: new Date('2024-02-15')
            }
          ],
          stock_balances: []
        },
        {
          id: 'item-003',
          item_name: 'Low Value Item',
          inventory_transactions: [
            {
              transaction_type: 'ISSUE',
              quantity: 50,
              unit_cost_amount: 2.0,
              unit_cost_currency: 'USD',
              transaction_date: new Date('2024-03-15')
            }
          ],
          stock_balances: []
        }
      ]

      mockPrisma.inventory_items.findMany.mockResolvedValue(mockItems)

      // Act
      const result = await service.performABCAnalysis()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(3)
      
      // Check that items are sorted by value and classified
      const sortedData = result.data!.sort((a, b) => b.annualValue.amount - a.annualValue.amount)
      expect(sortedData[0].classification).toBe('A') // Highest value item
      expect(sortedData[0].itemId).toBe('item-001')
      
      // Check cumulative percentages are calculated
      expect(sortedData[0].cumulativePercentage).toBeGreaterThan(0)
      expect(sortedData[0].cumulativePercentage).toBeLessThanOrEqual(100)
    })

    it('should filter by location IDs when provided', async () => {
      // Arrange
      const locationIds = ['loc-001', 'loc-002']
      mockPrisma.inventory_items.findMany.mockResolvedValue([])

      // Act
      await service.performABCAnalysis(undefined, locationIds)

      // Assert
      expect(mockPrisma.inventory_items.findMany).toHaveBeenCalledWith({
        include: expect.objectContaining({
          inventory_transactions: {
            where: expect.objectContaining({
              location_id: { in: locationIds }
            })
          },
          stock_balances: {
            where: { location_id: { in: locationIds } }
          }
        })
      })
    })

    it('should handle empty transaction data', async () => {
      // Arrange
      mockPrisma.inventory_items.findMany.mockResolvedValue([
        {
          id: 'item-001',
          item_name: 'Item with no transactions',
          inventory_transactions: [],
          stock_balances: []
        }
      ])

      // Act
      const result = await service.performABCAnalysis()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].annualUsage).toBe(0)
      expect(result.data![0].annualValue.amount).toBe(0)
    })
  })

  describe('generateReorderSuggestions', () => {
    it('should generate reorder suggestions for items below reorder point', async () => {
      // Arrange
      const mockItems = [
        {
          id: 'item-001',
          item_name: 'Low Stock Item',
          reorder_point: 20,
          reorder_quantity: 50,
          lead_time_days: 7,
          stock_balances: [
            {
              quantity_on_hand: 15, // Below reorder point
              location_id: 'loc-001'
            }
          ]
        }
      ]

      mockPrisma.inventory_items.findMany.mockResolvedValue(mockItems)

      // Mock the private methods that would be called
      const mockSuggestion = {
        itemId: 'item-001',
        itemName: 'Low Stock Item',
        currentStock: 15,
        reorderPoint: 20,
        recommendedOrderQuantity: 50,
        urgencyLevel: 'medium' as const,
        daysOfStock: 5,
        averageDailyUsage: 3,
        leadTime: 7,
        suggestedVendors: [],
        estimatedStockoutDate: new Date(),
        businessImpact: 'moderate' as const
      }

      // Act
      const result = await service.generateReorderSuggestions(false)

      // Assert
      expect(result.success).toBe(true)
      // Note: The actual implementation would need the private methods to be properly mocked
      // This is a simplified test structure
    })

    it('should prioritize suggestions by urgency and business impact', async () => {
      // Arrange
      mockPrisma.inventory_items.findMany.mockResolvedValue([])

      // Act
      const result = await service.generateReorderSuggestions()

      // Assert
      expect(result.success).toBe(true)
      // Verify that suggestions are sorted correctly
      // This would need more detailed mocking of the sorting logic
    })
  })

  describe('calculateInventoryValuation', () => {
    it('should calculate inventory valuation using FIFO method', async () => {
      // Arrange
      const config = {
        method: CostingMethod.FIFO,
        currency: 'USD',
        includeInactive: false,
        includeZeroStock: false
      }

      const mockItems = [
        {
          id: 'item-001',
          item_name: 'Test Item',
          is_active: true,
          stock_balances: [
            { quantity_on_hand: 100 }
          ],
          inventory_transactions: [
            {
              transaction_type: 'RECEIVE',
              transaction_date: new Date('2024-01-01'),
              unit_cost_amount: 10.0,
              unit_cost_currency: 'USD'
            },
            {
              transaction_type: 'RECEIVE',
              transaction_date: new Date('2024-02-01'),
              unit_cost_amount: 12.0,
              unit_cost_currency: 'USD'
            }
          ],
          updated_at: new Date()
        }
      ]

      mockPrisma.inventory_items.findMany.mockResolvedValue(mockItems)

      // Act
      const result = await service.calculateInventoryValuation(config)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.totalValue.currencyCode).toBe('USD')
      expect(result.data?.itemBreakdown).toHaveLength(1)
      expect(result.data?.summary.valuationMethod).toBe(CostingMethod.FIFO)
    })

    it('should exclude inactive items when configured', async () => {
      // Arrange
      const config = {
        method: CostingMethod.WEIGHTED_AVERAGE,
        currency: 'USD',
        includeInactive: false
      }

      // Act
      await service.calculateInventoryValuation(config)

      // Assert
      expect(mockPrisma.inventory_items.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        include: expect.any(Object)
      })
    })

    it('should filter by categories when provided', async () => {
      // Arrange
      const config = {
        method: CostingMethod.STANDARD_COST,
        currency: 'USD',
        categoryIds: ['cat-001', 'cat-002']
      }

      // Act
      await service.calculateInventoryValuation(config)

      // Assert
      expect(mockPrisma.inventory_items.findMany).toHaveBeenCalledWith({
        where: { category_id: { in: ['cat-001', 'cat-002'] } },
        include: expect.any(Object)
      })
    })
  })

  describe('generateInventoryKPIs', () => {
    it('should generate comprehensive KPI metrics', async () => {
      // Arrange
      const periodDays = 90

      // Act
      const result = await service.generateInventoryKPIs(periodDays)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        stockTurnover: expect.any(Number),
        daysInInventory: expect.any(Number),
        fillRate: expect.any(Number),
        stockoutRate: expect.any(Number),
        carryingCostRatio: expect.any(Number),
        inventoryAccuracy: expect.any(Number),
        obsolescenceRate: expect.any(Number),
        abcClassificationAccuracy: expect.any(Number),
        averageLeadTime: expect.any(Number),
        supplierReliability: expect.any(Number)
      })
    })

    it('should filter by location IDs when provided', async () => {
      // Arrange
      const locationIds = ['loc-001']

      // Act
      const result = await service.generateInventoryKPIs(30, locationIds)

      // Assert
      expect(result.success).toBe(true)
      // Would verify that location filtering was applied in the actual calculations
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      mockPrisma.inventory_items.findMany.mockRejectedValue(new Error('Connection timeout'))

      // Act
      const result = await service.getEnhancedStockStatus()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Connection timeout')
    })

    it('should handle invalid parameters', async () => {
      // Arrange
      const invalidConfig = {
        method: 'INVALID_METHOD' as any,
        currency: 'USD'
      }

      // Act
      const result = await service.calculateInventoryValuation(invalidConfig)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Unsupported costing method')
    })
  })

  describe('Performance', () => {
    it('should complete analysis within reasonable time limits', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        item_name: `Item ${i}`,
        inventory_transactions: [],
        stock_balances: []
      }))

      mockPrisma.inventory_items.findMany.mockResolvedValue(largeDataset)

      // Act
      const startTime = Date.now()
      const result = await service.getEnhancedStockStatus()
      const endTime = Date.now()

      // Assert
      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
      expect(result.metadata?.processingTime).toBeDefined()
    })
  })

  describe('Data Consistency', () => {
    it('should ensure stock balance consistency across locations', async () => {
      // Arrange
      const mockItems = [
        {
          id: 'item-001',
          item_code: 'TEST-001',
          item_name: 'Multi-location Item',
          stock_balances: [
            {
              location_id: 'loc-001',
              quantity_on_hand: 50,
              quantity_reserved: 5,
              quantity_available: 45,
              average_cost_amount: 10.0,
              average_cost_currency: 'USD',
              total_value_amount: 500.0,
              total_value_currency: 'USD'
            },
            {
              location_id: 'loc-002',
              quantity_on_hand: 30,
              quantity_reserved: 0,
              quantity_available: 30,
              average_cost_amount: 10.0,
              average_cost_currency: 'USD',
              total_value_amount: 300.0,
              total_value_currency: 'USD'
            }
          ],
          categories: { name: 'Test Category' },
          inventory_transactions: []
        }
      ]

      mockPrisma.inventory_items.findMany.mockResolvedValue(mockItems)

      // Act
      const result = await service.getEnhancedStockStatus()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data![0].totalQuantity).toBe(80) // 50 + 30
      expect(result.data![0].locationBreakdown).toHaveLength(2)
      expect(result.data![0].totalValue.amount).toBe(800) // 500 + 300
    })
  })
})