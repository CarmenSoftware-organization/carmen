/**
 * Calculation Cache Service Tests
 * 
 * Test suite for the central calculation cache service that manages
 * all cached calculation services.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CalculationCacheService } from '../calculation-cache-service';
import { Money } from '@/lib/types';

// Mock the enhanced cache layer and cached services
vi.mock('../enhanced-cache-layer');
vi.mock('../cached-financial-calculations');
vi.mock('../cached-inventory-calculations');
vi.mock('../cached-vendor-metrics');
vi.mock('ioredis', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    ping: vi.fn(),
    info: vi.fn(),
    dbsize: vi.fn(),
    quit: vi.fn(),
    disconnect: vi.fn()
  }))
}));

describe('CalculationCacheService', () => {
  let cacheService: CalculationCacheService;

  beforeEach(() => {
    cacheService = new CalculationCacheService({
      redis: {
        enabled: false,
        fallbackToMemory: true
      },
      memory: {
        maxMemoryMB: 10,
        maxEntries: 100
      },
      ttl: {
        financial: 300,
        inventory: 600,
        vendor: 1800,
        default: 300
      },
      warming: {
        enabled: false,
        onStartup: false,
        scheduleIntervalHours: 0
      },
      monitoring: {
        enabled: false,
        metricsInterval: 10000,
        logLevel: 'none'
      }
    });
  });

  afterEach(async () => {
    await cacheService.shutdown();
  });

  describe('Service Access', () => {
    it('should provide access to cached financial calculations', () => {
      const financial = cacheService.financial;
      expect(financial).toBeDefined();
      expect(financial.constructor.name).toBe('CachedFinancialCalculations');
    });

    it('should provide access to cached inventory calculations', () => {
      const inventory = cacheService.inventory;
      expect(inventory).toBeDefined();
      expect(inventory.constructor.name).toBe('CachedInventoryCalculations');
    });

    it('should provide access to cached vendor metrics', () => {
      const vendor = cacheService.vendor;
      expect(vendor).toBeDefined();
      expect(vendor.constructor.name).toBe('CachedVendorMetrics');
    });
  });

  describe('Cache Warming', () => {
    it('should warm all caches successfully', async () => {
      // Mock the warming methods
      const mockFinancialWarm = vi.spyOn(cacheService.financial, 'warmFinancialCache')
        .mockResolvedValue({ warmed: 10, failed: 0 });
      
      const mockInventoryWarm = vi.spyOn(cacheService.inventory, 'warmInventoryCache')
        .mockResolvedValue({ warmed: 15, failed: 1 });
      
      const mockVendorWarm = vi.spyOn(cacheService.vendor, 'warmVendorCache')
        .mockResolvedValue({ warmed: 5, failed: 0 });

      const result = await cacheService.warmAllCaches();

      expect(result.financial.warmed).toBe(10);
      expect(result.financial.failed).toBe(0);
      expect(result.inventory.warmed).toBe(15);
      expect(result.inventory.failed).toBe(1);
      expect(result.vendor.warmed).toBe(5);
      expect(result.vendor.failed).toBe(0);
      expect(result.totalWarmed).toBe(30);
      expect(result.totalFailed).toBe(1);

      expect(mockFinancialWarm).toHaveBeenCalledOnce();
      expect(mockInventoryWarm).toHaveBeenCalledOnce();
      expect(mockVendorWarm).toHaveBeenCalledOnce();
    });

    it('should prevent concurrent cache warming', async () => {
      const mockWarm = vi.spyOn(cacheService.financial, 'warmFinancialCache')
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ warmed: 5, failed: 0 }), 100)));
      
      vi.spyOn(cacheService.inventory, 'warmInventoryCache')
        .mockResolvedValue({ warmed: 5, failed: 0 });
      
      vi.spyOn(cacheService.vendor, 'warmVendorCache')
        .mockResolvedValue({ warmed: 5, failed: 0 });

      // Start first warming
      const warming1 = cacheService.warmAllCaches();

      // Try to start second warming - should reject
      await expect(cacheService.warmAllCaches()).rejects.toThrow('Cache warming is already in progress');

      // Wait for first warming to complete
      await warming1;
    });

    it('should handle warming failures gracefully', async () => {
      vi.spyOn(cacheService.financial, 'warmFinancialCache')
        .mockRejectedValue(new Error('Financial warming failed'));
      
      vi.spyOn(cacheService.inventory, 'warmInventoryCache')
        .mockResolvedValue({ warmed: 10, failed: 0 });
      
      vi.spyOn(cacheService.vendor, 'warmVendorCache')
        .mockResolvedValue({ warmed: 5, failed: 0 });

      await expect(cacheService.warmAllCaches()).rejects.toThrow('Financial warming failed');
    });

    it('should use warming configuration when provided', async () => {
      const mockInventoryWarm = vi.spyOn(cacheService.inventory, 'warmInventoryCache')
        .mockResolvedValue({ warmed: 5, failed: 0 });
      
      const mockVendorWarm = vi.spyOn(cacheService.vendor, 'warmVendorCache')
        .mockResolvedValue({ warmed: 3, failed: 0 });

      vi.spyOn(cacheService.financial, 'warmFinancialCache')
        .mockResolvedValue({ warmed: 8, failed: 0 });

      const warmingConfig = {
        inventory: {
          topItemIds: ['item-1', 'item-2', 'item-3'],
          commonQuantities: [10, 50, 100],
          usageRates: [5, 15, 25],
          leadTimes: [7, 14]
        },
        vendor: {
          topVendorIds: ['vendor-1', 'vendor-2'],
          analysisTimeframes: [30, 90, 180]
        },
        financial: {
          commonCurrencies: ['USD', 'EUR'],
          taxRates: [5, 10, 15],
          discountRates: [5, 10, 20]
        }
      };

      await cacheService.warmAllCaches(warmingConfig);

      expect(mockInventoryWarm).toHaveBeenCalledWith(['item-1', 'item-2', 'item-3']);
      expect(mockVendorWarm).toHaveBeenCalledWith(['vendor-1', 'vendor-2']);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate financial caches', async () => {
      const mockInvalidate = vi.spyOn(cacheService.financial, 'invalidateFinancialCaches')
        .mockResolvedValue(25);

      const result = await cacheService.invalidateCaches({
        financial: {
          reason: 'Tax rates updated',
          userId: 'admin-123'
        }
      });

      expect(result.totalInvalidated).toBe(25);
      expect(result.results.financial).toBe(25);
      expect(mockInvalidate).toHaveBeenCalledWith('Tax rates updated', 'admin-123');
    });

    it('should invalidate inventory caches with item IDs', async () => {
      const mockInvalidate = vi.spyOn(cacheService.inventory, 'invalidateInventoryCaches')
        .mockResolvedValue(15);

      const result = await cacheService.invalidateCaches({
        inventory: {
          reason: 'Stock levels updated',
          itemIds: ['item-1', 'item-2'],
          userId: 'stock-manager'
        }
      });

      expect(result.totalInvalidated).toBe(15);
      expect(result.results.inventory).toBe(15);
      expect(mockInvalidate).toHaveBeenCalledWith(
        'Stock levels updated',
        ['item-1', 'item-2'],
        'stock-manager'
      );
    });

    it('should invalidate vendor caches with vendor IDs', async () => {
      const mockInvalidate = vi.spyOn(cacheService.vendor, 'invalidateVendorCaches')
        .mockResolvedValue(8);

      const result = await cacheService.invalidateCaches({
        vendor: {
          reason: 'Vendor ratings updated',
          vendorIds: ['vendor-1'],
          userId: 'procurement-mgr'
        }
      });

      expect(result.totalInvalidated).toBe(8);
      expect(result.results.vendor).toBe(8);
      expect(mockInvalidate).toHaveBeenCalledWith(
        'Vendor ratings updated',
        ['vendor-1'],
        'procurement-mgr'
      );
    });

    it('should invalidate multiple cache types simultaneously', async () => {
      vi.spyOn(cacheService.financial, 'invalidateFinancialCaches')
        .mockResolvedValue(20);
      
      vi.spyOn(cacheService.inventory, 'invalidateInventoryCaches')
        .mockResolvedValue(30);
      
      vi.spyOn(cacheService.vendor, 'invalidateVendorCaches')
        .mockResolvedValue(10);

      const result = await cacheService.invalidateCaches({
        financial: { reason: 'Currency rates changed' },
        inventory: { reason: 'Bulk stock update', itemIds: ['item-1'] },
        vendor: { reason: 'Performance review completed', vendorIds: ['vendor-1', 'vendor-2'] }
      });

      expect(result.totalInvalidated).toBe(60);
      expect(result.results).toEqual({
        financial: 20,
        inventory: 30,
        vendor: 10
      });
    });

    it('should handle partial invalidation failures', async () => {
      vi.spyOn(cacheService.financial, 'invalidateFinancialCaches')
        .mockRejectedValue(new Error('Financial invalidation failed'));
      
      vi.spyOn(cacheService.inventory, 'invalidateInventoryCaches')
        .mockResolvedValue(15);

      await expect(cacheService.invalidateCaches({
        financial: { reason: 'Test failure' },
        inventory: { reason: 'Test success' }
      })).rejects.toThrow('Financial invalidation failed');
    });
  });

  describe('Health and Metrics', () => {
    it('should return cache metrics', async () => {
      const mockMetrics = {
        redis: {
          connected: false,
          hitCount: 100,
          missCount: 20,
          errorCount: 0,
          hitRate: 83.33,
          memoryUsage: 1024000,
          keyCount: 150
        },
        memory: {
          hitCount: 80,
          missCount: 15,
          hitRate: 84.21,
          totalEntries: 95,
          memoryUsage: 512000
        },
        combined: {
          totalHits: 180,
          totalMisses: 35,
          overallHitRate: 83.72,
          averageResponseTime: 25
        },
        invalidation: {
          totalInvalidations: 5,
          keysInvalidated: 45,
          lastInvalidation: new Date()
        }
      };

      // Mock the cache layer's getMetrics method
      const mockGetMetrics = vi.spyOn(cacheService['cacheLayer'], 'getMetrics')
        .mockResolvedValue(mockMetrics);

      const metrics = await cacheService.getMetrics();

      expect(metrics).toEqual(mockMetrics);
      expect(mockGetMetrics).toHaveBeenCalledOnce();
    });

    it('should return health status', async () => {
      const mockMetrics = {
        redis: { connected: true, hitCount: 100, missCount: 10, errorCount: 1, hitRate: 90.91 },
        memory: { hitCount: 50, missCount: 5, hitRate: 90.91, totalEntries: 75, memoryUsage: 1024000 },
        combined: { totalHits: 150, totalMisses: 15, overallHitRate: 90.91, averageResponseTime: 50 },
        invalidation: { totalInvalidations: 2, keysInvalidated: 20 }
      };

      vi.spyOn(cacheService['cacheLayer'], 'getMetrics').mockResolvedValue(mockMetrics);

      const health = await cacheService.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.redis.connected).toBe(true);
      expect(health.redis.errorCount).toBe(1);
      expect(health.memory.usage).toBe(1024000);
      expect(health.memory.maxUsage).toBe(10 * 1024 * 1024); // 10MB config
      expect(health.memory.entryCount).toBe(75);
      expect(health.performance.hitRate).toBe(90.91);
      expect(health.performance.averageResponseTime).toBe(50);
    });

    it('should detect degraded health status', async () => {
      const mockMetrics = {
        redis: { connected: true, hitCount: 30, missCount: 70, errorCount: 2, hitRate: 30 },
        memory: { hitCount: 20, missCount: 30, hitRate: 40, totalEntries: 50, memoryUsage: 512000 },
        combined: { totalHits: 50, totalMisses: 100, overallHitRate: 33.33, averageResponseTime: 1500 },
        invalidation: { totalInvalidations: 1, keysInvalidated: 10 }
      };

      vi.spyOn(cacheService['cacheLayer'], 'getMetrics').mockResolvedValue(mockMetrics);

      const health = await cacheService.getHealthStatus();

      expect(health.status).toBe('degraded'); // Low hit rate and high response time
    });

    it('should detect error health status', async () => {
      const mockMetrics = {
        redis: { connected: false, hitCount: 10, missCount: 20, errorCount: 15, hitRate: 33.33 },
        memory: { hitCount: 25, missCount: 15, hitRate: 62.5, totalEntries: 30, memoryUsage: 256000 },
        combined: { totalHits: 35, totalMisses: 35, overallHitRate: 50, averageResponseTime: 200 },
        invalidation: { totalInvalidations: 0, keysInvalidated: 0 }
      };

      vi.spyOn(cacheService['cacheLayer'], 'getMetrics').mockResolvedValue(mockMetrics);

      const health = await cacheService.getHealthStatus();

      expect(health.status).toBe('error'); // Redis not connected and high error count
    });
  });

  describe('Cache Management', () => {
    it('should clear all caches', async () => {
      const mockClearAll = vi.spyOn(cacheService['cacheLayer'], 'clearAll')
        .mockResolvedValue(true);

      const result = await cacheService.clearAllCaches();

      expect(result).toBe(true);
      expect(mockClearAll).toHaveBeenCalledOnce();
    });

    it('should handle clear all failure', async () => {
      vi.spyOn(cacheService['cacheLayer'], 'clearAll')
        .mockResolvedValue(false);

      const result = await cacheService.clearAllCaches();

      expect(result).toBe(false);
    });

    it('should shutdown gracefully', async () => {
      const mockShutdown = vi.spyOn(cacheService['cacheLayer'], 'shutdown')
        .mockResolvedValue();

      await cacheService.shutdown();

      expect(mockShutdown).toHaveBeenCalledOnce();
    });
  });

  describe('Service Integration', () => {
    it('should work with cached financial calculations', async () => {
      const mockTaxResult = {
        value: {
          subtotal: { amount: 100, currencyCode: 'USD' },
          taxAmount: { amount: 10, currencyCode: 'USD' },
          totalAmount: { amount: 110, currencyCode: 'USD' },
          taxRate: 10,
          taxIncluded: false
        },
        calculatedAt: new Date(),
        calculationId: 'tax-1',
        confidence: 1.0
      };

      const mockCalculateTax = vi.spyOn(cacheService.financial, 'calculateTax')
        .mockResolvedValue(mockTaxResult);

      const result = await cacheService.financial.calculateTax({
        subtotal: { amount: 100, currencyCode: 'USD' },
        taxRate: 10,
        taxIncluded: false
      });

      expect(result).toEqual(mockTaxResult);
      expect(mockCalculateTax).toHaveBeenCalledOnce();
    });

    it('should work with cached inventory calculations', async () => {
      const mockStockResult = {
        value: {
          itemId: 'item-1',
          quantityOnHand: 100,
          unitCost: { amount: 25, currencyCode: 'USD' },
          totalValue: { amount: 2500, currencyCode: 'USD' },
          costingMethod: 'FIFO' as const,
          lastCostUpdate: new Date()
        },
        calculatedAt: new Date(),
        calculationId: 'stock-1',
        confidence: 1.0
      };

      const mockCalculateStock = vi.spyOn(cacheService.inventory, 'calculateStockValuation')
        .mockResolvedValue(mockStockResult);

      const result = await cacheService.inventory.calculateStockValuation({
        itemId: 'item-1',
        quantityOnHand: 100,
        costingMethod: 'FIFO'
      });

      expect(result).toEqual(mockStockResult);
      expect(mockCalculateStock).toHaveBeenCalledOnce();
    });

    it('should work with cached vendor metrics', async () => {
      const mockPerformanceResult = {
        value: {
          vendorId: 'vendor-1',
          calculationPeriod: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            orderCount: 25
          },
          deliveryMetrics: {
            onTimeDeliveryRate: 95,
            averageDaysLate: 0.8,
            deliveryReliabilityScore: 4.5,
            completedOrders: 24,
            pendingOrders: 1,
            cancelledOrders: 0
          },
          qualityMetrics: {
            qualityRating: 4.2,
            defectRate: 1.5,
            rejectionRate: 0.5,
            qualityConsistency: 4.0,
            qualityTrend: 'stable' as const
          },
          reliabilityMetrics: {
            orderFulfillmentRate: 98.5,
            communicationScore: 4.3,
            issueResolutionTime: 2.1
          },
          financialMetrics: {
            priceCompetitiveness: 4.1,
            paymentTermsScore: 4.0,
            costStability: 4.2,
            totalSpend: { amount: 125000, currencyCode: 'USD' }
          },
          overallRating: 4.3,
          riskScore: 15.2,
          recommendations: ['Continue partnership', 'Monitor delivery times']
        },
        calculatedAt: new Date(),
        calculationId: 'vendor-perf-1',
        confidence: 1.0
      };

      const mockCalculatePerformance = vi.spyOn(cacheService.vendor, 'calculateVendorPerformance')
        .mockResolvedValue(mockPerformanceResult);

      const result = await cacheService.vendor.calculateVendorPerformance({
        vendorId: 'vendor-1',
        orders: [],
        timeframeDays: 365
      });

      expect(result).toEqual(mockPerformanceResult);
      expect(mockCalculatePerformance).toHaveBeenCalledOnce();
    });
  });
});