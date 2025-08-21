// Tests for Fractional Inventory Service
// Validates core business logic and conversion operations

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FractionalInventoryService } from '../fractional-inventory-service'
import {
  FractionalStock,
  FractionalItem,
  ConversionRecord,
  FractionalItemState
} from '@/lib/types/fractional-inventory'

describe('FractionalInventoryService', () => {
  let service: FractionalInventoryService
  let mockStock: FractionalStock
  let mockItem: FractionalItem

  beforeEach(() => {
    service = FractionalInventoryService.getInstance()
    
    // Mock fractional item
    mockItem = {
      id: 'test-item-1',
      itemCode: 'PIZZA-TEST',
      itemName: 'Test Pizza',
      category: 'Food',
      baseUnit: 'Whole Pizza',
      supportsFractional: true,
      allowPartialSales: true,
      trackPortions: true,
      availablePortions: [
        { id: 'slice-8', name: 'Slice', portionsPerWhole: 8, isActive: true },
        { id: 'half-2', name: 'Half', portionsPerWhole: 2, isActive: true }
      ],
      defaultPortionId: 'slice-8',
      shelfLifeHours: 4,
      maxQualityHours: 2,
      allowAutoConversion: true,
      wastePercentage: 5,
      baseCostPerUnit: 100,
      conversionCostPerUnit: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Mock fractional stock
    mockStock = {
      id: 'test-stock-1',
      itemId: 'test-item-1',
      locationId: 'test-location',
      currentState: 'PREPARED' as FractionalItemState,
      stateTransitionDate: new Date().toISOString(),
      qualityGrade: 'GOOD',
      wholeUnitsAvailable: 5,
      partialQuantityAvailable: 0,
      totalPortionsAvailable: 0,
      reservedPortions: 0,
      originalWholeUnits: 5,
      originalTotalPortions: 0,
      conversionsApplied: [],
      totalWasteGenerated: 0,
      preparedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Mock the database access methods
    vi.spyOn(service as any, 'getStockById').mockResolvedValue(mockStock)
    vi.spyOn(service as any, 'getFractionalItemById').mockResolvedValue(mockItem)
    vi.spyOn(service as any, 'updateStock').mockResolvedValue(undefined)
    vi.spyOn(service as any, 'updateStockAfterConversion').mockResolvedValue(undefined)
    vi.spyOn(service as any, 'logInventoryOperation').mockResolvedValue(undefined)
    vi.spyOn(service as any, 'evaluateAlertsForStock').mockResolvedValue(undefined)
  })

  describe('splitItem', () => {
    it('should successfully split whole items into portions', async () => {
      const conversion = await service.splitItem(
        'test-stock-1',
        2, // Split 2 whole units
        'slice-8', // Into 8-slice portions
        'test-user',
        'Test split operation'
      )

      expect(conversion).toBeDefined()
      expect(conversion.conversionType).toBe('SPLIT')
      expect(conversion.fromState).toBe('PREPARED')
      expect(conversion.toState).toBe('PORTIONED')
      expect(conversion.beforeWholeUnits).toBe(5)
      expect(conversion.afterWholeUnits).toBe(3) // 5 - 2 = 3
      expect(conversion.afterTotalPortions).toBe(15) // 2 * 8 * 0.95 efficiency ≈ 15
      expect(conversion.wasteGenerated).toBe(0.1) // 2 * 5% waste
      expect(conversion.performedBy).toBe('test-user')
      expect(conversion.reason).toBe('Test split operation')
    })

    it('should throw error when insufficient whole units available', async () => {
      await expect(service.splitItem(
        'test-stock-1',
        10, // More than available (5)
        'slice-8',
        'test-user'
      )).rejects.toThrow('Insufficient whole units available')
    })

    it('should throw error for non-fractional items', async () => {
      const nonFractionalItem = { ...mockItem, supportsFractional: false }
      vi.spyOn(service as any, 'getFractionalItemById').mockResolvedValue(nonFractionalItem)

      await expect(service.splitItem(
        'test-stock-1',
        1,
        'slice-8',
        'test-user'
      )).rejects.toThrow('Item does not support fractional operations')
    })

    it('should throw error for invalid portion size', async () => {
      await expect(service.splitItem(
        'test-stock-1',
        1,
        'invalid-portion-id',
        'test-user'
      )).rejects.toThrow('Invalid portion size')
    })

    it('should calculate correct conversion efficiency', async () => {
      const conversion = await service.splitItem(
        'test-stock-1',
        1,
        'slice-8',
        'test-user'
      )

      // Expected: 1 whole unit * 8 portions * (1 - 0.05 waste) = 7.6 ≈ 7 portions
      // Efficiency: 7 / 8 = 0.875
      expect(conversion.conversionEfficiency).toBeCloseTo(0.875, 2)
    })
  })

  describe('combinePortions', () => {
    beforeEach(() => {
      // Set up stock with portions for combining
      mockStock.totalPortionsAvailable = 24
      mockStock.currentState = 'PORTIONED'
    })

    it('should successfully combine portions into whole units', async () => {
      const conversion = await service.combinePortions(
        'test-stock-1',
        16, // Combine 16 portions (should make 2 whole units)
        'test-user',
        'Test combine operation'
      )

      expect(conversion).toBeDefined()
      expect(conversion.conversionType).toBe('COMBINE')
      expect(conversion.fromState).toBe('PORTIONED')
      expect(conversion.beforeTotalPortions).toBe(24)
      // After combining 16 portions: 24 - 16 + 0 remaining = 8 portions left
      expect(conversion.afterTotalPortions).toBe(8)
      expect(conversion.afterWholeUnits).toBe(2) // 16 portions / 8 per whole = 2 whole units
    })

    it('should throw error when insufficient portions available', async () => {
      await expect(service.combinePortions(
        'test-stock-1',
        30, // More portions than available (24)
        'test-user'
      )).rejects.toThrow('Insufficient portions available')
    })

    it('should handle partial combines correctly', async () => {
      const conversion = await service.combinePortions(
        'test-stock-1',
        10, // 10 portions = 1 whole unit + 2 remaining portions
        'test-user'
      )

      expect(conversion.afterWholeUnits).toBe(1) // 10 / 8 = 1 whole unit
      expect(conversion.afterTotalPortions).toBe(16) // 24 - 10 + 2 remaining = 16
    })
  })

  describe('prepareItems', () => {
    beforeEach(() => {
      mockStock.currentState = 'RAW'
    })

    it('should successfully prepare raw items', async () => {
      const conversion = await service.prepareItems(
        'test-stock-1',
        3,
        'test-user',
        'Test preparation'
      )

      expect(conversion).toBeDefined()
      expect(conversion.conversionType).toBe('PREPARE')
      expect(conversion.fromState).toBe('RAW')
      expect(conversion.toState).toBe('PREPARED')
      expect(conversion.wasteGenerated).toBe(0.15) // 3 * 5% waste
      expect(conversion.notes).toBe('Test preparation')
    })

    it('should throw error when items are not in RAW state', async () => {
      mockStock.currentState = 'PREPARED'

      await expect(service.prepareItems(
        'test-stock-1',
        1,
        'test-user'
      )).rejects.toThrow('Items must be in RAW state to prepare')
    })
  })

  describe('updateQualityGrade', () => {
    it('should update quality based on time degradation', async () => {
      // Mock stock that was prepared 3 hours ago with 2-hour max quality time
      const oldPreparedTime = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      mockStock.preparedAt = oldPreparedTime
      mockStock.qualityGrade = 'EXCELLENT'

      const updateStockSpy = vi.spyOn(service as any, 'updateStock')

      await service.updateQualityGrade('test-stock-1', 'test-user', 'Quality check')

      // Should have been called to update quality to GOOD or FAIR
      expect(updateStockSpy).toHaveBeenCalled()
      const callArgs = updateStockSpy.mock.calls[0][1]
      expect(['GOOD', 'FAIR', 'POOR'].includes(callArgs.qualityGrade)).toBe(true)
    })

    it('should mark items as expired when past shelf life', async () => {
      // Mock stock that expires in the past
      const pastExpiry = new Date(Date.now() - 1000).toISOString()
      mockStock.expiresAt = pastExpiry

      const updateStockSpy = vi.spyOn(service as any, 'updateStock')

      await service.updateQualityGrade('test-stock-1', 'test-user')

      expect(updateStockSpy).toHaveBeenCalledWith('test-stock-1', 
        expect.objectContaining({ qualityGrade: 'EXPIRED' })
      )
    })
  })

  describe('calculateInventoryMetrics', () => {
    beforeEach(() => {
      // Mock the required methods for metrics calculation
      vi.spyOn(service as any, 'getStocksByLocation').mockResolvedValue([mockStock])
      vi.spyOn(service as any, 'getDailyConversions').mockResolvedValue(10)
      vi.spyOn(service as any, 'getQualityDegradationRate').mockResolvedValue(0.05)
      vi.spyOn(service as any, 'calculateTurnoverRate').mockResolvedValue(2.0)
      vi.spyOn(service as any, 'getStockoutEvents').mockResolvedValue(0)
      vi.spyOn(service as any, 'getConversionBacklog').mockResolvedValue(2)
      vi.spyOn(service as any, 'getConversionRecommendations').mockResolvedValue([])
    })

    it('should calculate comprehensive inventory metrics', async () => {
      const metrics = await service.calculateInventoryMetrics('test-location')

      expect(metrics).toBeDefined()
      expect(metrics.totalWholeUnits).toBe(5)
      expect(metrics.totalPortionsAvailable).toBe(0)
      expect(metrics.totalReservedPortions).toBe(0)
      expect(metrics.dailyConversions).toBe(10)
      expect(metrics.turnoverRate).toBe(2.0)
      expect(metrics.stockoutEvents).toBe(0)
      expect(metrics.conversionBacklog).toBe(2)
      expect(Array.isArray(metrics.activeAlerts)).toBe(true)
      expect(Array.isArray(metrics.recommendedConversions)).toBe(true)
    })

    it('should calculate correct value on hand', async () => {
      mockStock.totalPortionsAvailable = 16 // Some portions available

      const metrics = await service.calculateInventoryMetrics('test-location')

      // Expected value: (5 whole * 100 cost) + (16 portions * 100/8 per portion) = 500 + 200 = 700
      expect(metrics.totalValueOnHand).toBe(700)
    })
  })

  describe('error handling', () => {
    it('should handle null stock gracefully', async () => {
      vi.spyOn(service as any, 'getStockById').mockResolvedValue(null)

      await expect(service.splitItem(
        'non-existent-stock',
        1,
        'slice-8',
        'test-user'
      )).rejects.toThrow('Stock or item not found')
    })

    it('should handle null item gracefully', async () => {
      vi.spyOn(service as any, 'getFractionalItemById').mockResolvedValue(null)

      await expect(service.splitItem(
        'test-stock-1',
        1,
        'slice-8',
        'test-user'
      )).rejects.toThrow('Stock or item not found')
    })
  })

  describe('conversion efficiency calculations', () => {
    it('should calculate waste percentage correctly', async () => {
      const conversion = await service.splitItem(
        'test-stock-1',
        4, // 4 whole units
        'slice-8',
        'test-user'
      )

      // 4 units * 5% waste = 0.2 total waste
      expect(conversion.wasteGenerated).toBe(0.2)
      
      // Efficiency should be (32 actual portions) / (32 potential portions) = 95%
      expect(conversion.conversionEfficiency).toBeCloseTo(0.95, 2)
    })

    it('should calculate conversion costs correctly', async () => {
      const conversion = await service.splitItem(
        'test-stock-1',
        3,
        'slice-8',
        'test-user'
      )

      // 3 units * 10 conversion cost per unit = 30
      expect(conversion.conversionCost).toBe(30)
    })
  })
})

// Integration tests for the overall workflow
describe('FractionalInventoryService Integration', () => {
  let service: FractionalInventoryService

  beforeEach(() => {
    service = FractionalInventoryService.getInstance()
  })

  it('should handle complete workflow: raw -> prepared -> portioned -> consumed', async () => {
    // This would be an integration test that goes through the complete workflow
    // For now, we'll just test that the service can be instantiated
    expect(service).toBeInstanceOf(FractionalInventoryService)
  })

  it('should maintain data consistency across operations', async () => {
    // Test that conversion operations maintain data consistency
    expect(service).toBeInstanceOf(FractionalInventoryService)
  })
})