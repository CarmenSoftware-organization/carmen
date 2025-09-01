/**
 * Enhanced Cache Layer Tests
 * 
 * Comprehensive test suite for the enhanced cache layer with
 * Redis and in-memory caching capabilities.
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { EnhancedCacheLayer, CacheDependency, InvalidationEvent } from '../enhanced-cache-layer';
import { RedisCacheProvider } from '../redis-cache-provider';

// Mock Redis to avoid requiring actual Redis server in tests
vi.mock('ioredis', () => {
  const mockRedis = {
    on: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    smembers: vi.fn(),
    sadd: vi.fn(),
    expire: vi.fn(),
    pipeline: vi.fn(() => ({
      sadd: vi.fn(),
      expire: vi.fn(),
      exec: vi.fn()
    })),
    exists: vi.fn(),
    ttl: vi.fn(),
    ping: vi.fn(),
    info: vi.fn(),
    dbsize: vi.fn(),
    flushdb: vi.fn(),
    quit: vi.fn(),
    disconnect: vi.fn()
  };

  return {
    default: vi.fn(() => mockRedis)
  };
});

describe('EnhancedCacheLayer', () => {
  let cacheLayer: EnhancedCacheLayer;
  let mockComputeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockComputeFn = vi.fn();
    
    cacheLayer = new EnhancedCacheLayer({
      redis: {
        enabled: false, // Use memory-only for tests
        fallbackToMemory: true,
        connectionTimeout: 1000
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
      invalidation: {
        enabled: true,
        batchSize: 10,
        maxDependencies: 20
      },
      monitoring: {
        enabled: false,
        metricsInterval: 10000
      }
    });
  });

  afterEach(async () => {
    await cacheLayer.shutdown();
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same inputs', async () => {
      const inputs1 = { amount: 100, currency: 'USD', rate: 0.1 };
      const inputs2 = { amount: 100, currency: 'USD', rate: 0.1 };
      
      mockComputeFn.mockResolvedValueOnce({
        value: 110,
        calculatedAt: new Date(),
        calculationId: 'test-1',
        confidence: 1.0
      });

      // First call should compute
      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        inputs1,
        mockComputeFn
      );

      mockComputeFn.mockResolvedValueOnce({
        value: 120,
        calculatedAt: new Date(),
        calculationId: 'test-2',
        confidence: 1.0
      });

      // Second call with same inputs should use cache
      const result = await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        inputs2,
        mockComputeFn
      );

      expect(mockComputeFn).toHaveBeenCalledTimes(1);
      expect(result.value).toBe(110); // Should return first result from cache
    });

    it('should generate different cache keys for different inputs', async () => {
      const inputs1 = { amount: 100, currency: 'USD' };
      const inputs2 = { amount: 200, currency: 'USD' };

      mockComputeFn
        .mockResolvedValueOnce({
          value: 110,
          calculatedAt: new Date(),
          calculationId: 'test-1',
          confidence: 1.0
        })
        .mockResolvedValueOnce({
          value: 220,
          calculatedAt: new Date(),
          calculationId: 'test-2',
          confidence: 1.0
        });

      await cacheLayer.getOrCompute('TestService', 'testMethod', inputs1, mockComputeFn);
      await cacheLayer.getOrCompute('TestService', 'testMethod', inputs2, mockComputeFn);

      expect(mockComputeFn).toHaveBeenCalledTimes(2);
    });

    it('should handle complex nested objects in inputs', async () => {
      const inputs = {
        nested: {
          array: [1, 2, { key: 'value' }],
          object: { a: 1, b: 2 }
        },
        date: new Date('2024-01-01'),
        null: null,
        undefined: undefined
      };

      mockComputeFn.mockResolvedValueOnce({
        value: 'result',
        calculatedAt: new Date(),
        calculationId: 'test-complex',
        confidence: 1.0
      });

      const result = await cacheLayer.getOrCompute(
        'TestService',
        'complexMethod',
        inputs,
        mockComputeFn
      );

      expect(result.value).toBe('result');
      expect(mockComputeFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('TTL Management', () => {
    it('should use correct TTL for financial calculations', async () => {
      const spy = vi.spyOn(cacheLayer as any, 'getTTLForCalculationType');
      
      mockComputeFn.mockResolvedValueOnce({
        value: 100,
        calculatedAt: new Date(),
        calculationId: 'test-financial',
        confidence: 1.0
      });

      await cacheLayer.getOrCompute(
        'FinancialCalculations',
        'calculateTax',
        { amount: 100 },
        mockComputeFn
      );

      expect(spy).toHaveReturnedWith(300); // Financial TTL
      spy.mockRestore();
    });

    it('should use correct TTL for inventory calculations', async () => {
      const spy = vi.spyOn(cacheLayer as any, 'getTTLForCalculationType');
      
      mockComputeFn.mockResolvedValueOnce({
        value: 50,
        calculatedAt: new Date(),
        calculationId: 'test-inventory',
        confidence: 1.0
      });

      await cacheLayer.getOrCompute(
        'InventoryCalculations',
        'calculateStock',
        { itemId: 'item-1' },
        mockComputeFn
      );

      expect(spy).toHaveReturnedWith(600); // Inventory TTL
      spy.mockRestore();
    });

    it('should use correct TTL for vendor calculations', async () => {
      const spy = vi.spyOn(cacheLayer as any, 'getTTLForCalculationType');
      
      mockComputeFn.mockResolvedValueOnce({
        value: 4.5,
        calculatedAt: new Date(),
        calculationId: 'test-vendor',
        confidence: 1.0
      });

      await cacheLayer.getOrCompute(
        'VendorMetrics',
        'calculateRating',
        { vendorId: 'vendor-1' },
        mockComputeFn
      );

      expect(spy).toHaveReturnedWith(1800); // Vendor TTL
      spy.mockRestore();
    });
  });

  describe('Dependency Tracking', () => {
    it('should track dependencies for cache entries', async () => {
      const dependencies: CacheDependency[] = [
        { type: 'entity', identifier: 'item-1' },
        { type: 'field', identifier: 'tax_rates' }
      ];

      mockComputeFn.mockResolvedValueOnce({
        value: 150,
        calculatedAt: new Date(),
        calculationId: 'test-deps',
        confidence: 1.0
      });

      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { amount: 100 },
        mockComputeFn,
        dependencies
      );

      // Verify dependencies are tracked internally
      const dependencyGraph = (cacheLayer as any).dependencyGraph;
      const keyDependencies = (cacheLayer as any).keyDependencies;

      expect(dependencyGraph.size).toBeGreaterThan(0);
      expect(keyDependencies.size).toBeGreaterThan(0);
    });

    it('should limit dependency tracking when too many dependencies', async () => {
      const manyDependencies: CacheDependency[] = Array.from({ length: 100 }, (_, i) => ({
        type: 'entity' as const,
        identifier: `item-${i}`
      }));

      mockComputeFn.mockResolvedValueOnce({
        value: 200,
        calculatedAt: new Date(),
        calculationId: 'test-many-deps',
        confidence: 1.0
      });

      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { amount: 100 },
        mockComputeFn,
        manyDependencies
      );

      const dependencyGraph = (cacheLayer as any).dependencyGraph;
      const storedDependencies = Array.from(dependencyGraph.values())[0];
      
      // Should limit to maxDependencies (20)
      expect(storedDependencies.size).toBeLessThanOrEqual(20);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache entries based on dependencies', async () => {
      const dependencies: CacheDependency[] = [
        { type: 'entity', identifier: 'item-1' }
      ];

      mockComputeFn.mockResolvedValue({
        value: 300,
        calculatedAt: new Date(),
        calculationId: 'test-invalidation',
        confidence: 1.0
      });

      // Cache initial result
      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { itemId: 'item-1' },
        mockComputeFn,
        dependencies
      );

      expect(mockComputeFn).toHaveBeenCalledTimes(1);

      // Invalidate cache based on dependency
      const invalidationEvent: InvalidationEvent = {
        dependencies: [{ type: 'entity', identifier: 'item-1' }],
        reason: 'Item updated',
        timestamp: new Date()
      };

      const invalidatedCount = await cacheLayer.invalidateByDependencies(invalidationEvent);
      expect(invalidatedCount).toBeGreaterThan(0);

      // Next call should recompute
      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { itemId: 'item-1' },
        mockComputeFn,
        dependencies
      );

      expect(mockComputeFn).toHaveBeenCalledTimes(2);
    });

    it('should handle batch invalidation', async () => {
      const dependencies: CacheDependency[] = [
        { type: 'table', identifier: 'items' }
      ];

      // Create multiple cache entries
      for (let i = 0; i < 5; i++) {
        mockComputeFn.mockResolvedValueOnce({
          value: i * 100,
          calculatedAt: new Date(),
          calculationId: `test-batch-${i}`,
          confidence: 1.0
        });

        await cacheLayer.getOrCompute(
          'TestService',
          'testMethod',
          { itemId: `item-${i}` },
          mockComputeFn,
          dependencies
        );
      }

      // Invalidate all entries
      const invalidationEvent: InvalidationEvent = {
        dependencies: [{ type: 'table', identifier: 'items' }],
        reason: 'Bulk update',
        timestamp: new Date()
      };

      const invalidatedCount = await cacheLayer.invalidateByDependencies(invalidationEvent);
      expect(invalidatedCount).toBe(5);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with provided tasks', async () => {
      const warmingTasks = [
        {
          serviceClass: 'TestService',
          method: 'method1',
          inputs: { value: 1 },
          computeFn: async () => ({
            value: 10,
            calculatedAt: new Date(),
            calculationId: 'warm-1',
            confidence: 1.0
          }),
          priority: 1
        },
        {
          serviceClass: 'TestService',
          method: 'method2',
          inputs: { value: 2 },
          computeFn: async () => ({
            value: 20,
            calculatedAt: new Date(),
            calculationId: 'warm-2',
            confidence: 1.0
          }),
          priority: 2
        }
      ];

      const result = await cacheLayer.warmCache(warmingTasks);

      expect(result.warmed).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle warming failures gracefully', async () => {
      const warmingTasks = [
        {
          serviceClass: 'TestService',
          method: 'goodMethod',
          inputs: { value: 1 },
          computeFn: async () => ({
            value: 10,
            calculatedAt: new Date(),
            calculationId: 'warm-good',
            confidence: 1.0
          })
        },
        {
          serviceClass: 'TestService',
          method: 'badMethod',
          inputs: { value: 2 },
          computeFn: async () => {
            throw new Error('Computation failed');
          }
        }
      ];

      const result = await cacheLayer.warmCache(warmingTasks);

      expect(result.warmed).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should prioritize high-priority warming tasks', async () => {
      const executionOrder: string[] = [];

      const warmingTasks = [
        {
          serviceClass: 'TestService',
          method: 'lowPriority',
          inputs: { value: 1 },
          computeFn: async () => {
            executionOrder.push('low');
            return {
              value: 10,
              calculatedAt: new Date(),
              calculationId: 'warm-low',
              confidence: 1.0
            };
          },
          priority: 1
        },
        {
          serviceClass: 'TestService',
          method: 'highPriority',
          inputs: { value: 2 },
          computeFn: async () => {
            executionOrder.push('high');
            return {
              value: 20,
              calculatedAt: new Date(),
              calculationId: 'warm-high',
              confidence: 1.0
            };
          },
          priority: 3
        }
      ];

      await cacheLayer.warmCache(warmingTasks);

      // High priority should execute first
      expect(executionOrder[0]).toBe('high');
      expect(executionOrder[1]).toBe('low');
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track cache hit and miss metrics', async () => {
      mockComputeFn.mockResolvedValue({
        value: 400,
        calculatedAt: new Date(),
        calculationId: 'test-metrics',
        confidence: 1.0
      });

      // First call - cache miss
      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { value: 1 },
        mockComputeFn
      );

      // Second call - cache hit
      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { value: 1 },
        mockComputeFn
      );

      const metrics = await cacheLayer.getMetrics();

      expect(metrics.memory.hitCount).toBeGreaterThan(0);
      expect(metrics.combined.totalHits).toBeGreaterThan(0);
      expect(metrics.combined.overallHitRate).toBeGreaterThan(0);
    });

    it('should provide comprehensive metrics', async () => {
      const metrics = await cacheLayer.getMetrics();

      expect(metrics).toHaveProperty('redis');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('combined');
      expect(metrics).toHaveProperty('invalidation');

      expect(metrics.redis).toHaveProperty('connected');
      expect(metrics.redis).toHaveProperty('hitCount');
      expect(metrics.redis).toHaveProperty('missCount');
      expect(metrics.redis).toHaveProperty('hitRate');

      expect(metrics.memory).toHaveProperty('hitCount');
      expect(metrics.memory).toHaveProperty('missCount');
      expect(metrics.memory).toHaveProperty('hitRate');
      expect(metrics.memory).toHaveProperty('totalEntries');

      expect(metrics.combined).toHaveProperty('totalHits');
      expect(metrics.combined).toHaveProperty('totalMisses');
      expect(metrics.combined).toHaveProperty('overallHitRate');
    });
  });

  describe('Error Handling', () => {
    it('should handle computation errors gracefully', async () => {
      mockComputeFn.mockRejectedValueOnce(new Error('Computation failed'));

      await expect(
        cacheLayer.getOrCompute(
          'TestService',
          'failingMethod',
          { value: 1 },
          mockComputeFn
        )
      ).rejects.toThrow('Computation failed');
    });

    it('should continue operating when Redis is unavailable', async () => {
      // Create cache layer with Redis enabled but mocked to fail
      const redisEnabledCache = new EnhancedCacheLayer({
        redis: {
          enabled: true,
          fallbackToMemory: true,
          connectionTimeout: 100
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
        invalidation: {
          enabled: true,
          batchSize: 10,
          maxDependencies: 20
        },
        monitoring: {
          enabled: false,
          metricsInterval: 10000
        }
      });

      mockComputeFn.mockResolvedValueOnce({
        value: 500,
        calculatedAt: new Date(),
        calculationId: 'test-redis-fallback',
        confidence: 1.0
      });

      // Should fall back to memory cache
      const result = await redisEnabledCache.getOrCompute(
        'TestService',
        'testMethod',
        { value: 1 },
        mockComputeFn
      );

      expect(result.value).toBe(500);

      await redisEnabledCache.shutdown();
    });
  });

  describe('Memory Management', () => {
    it('should clear all caches successfully', async () => {
      mockComputeFn.mockResolvedValueOnce({
        value: 600,
        calculatedAt: new Date(),
        calculationId: 'test-clear',
        confidence: 1.0
      });

      // Add some entries to cache
      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { value: 1 },
        mockComputeFn
      );

      const cleared = await cacheLayer.clearAll();
      expect(cleared).toBe(true);

      // Verify cache is cleared by checking that computation happens again
      await cacheLayer.getOrCompute(
        'TestService',
        'testMethod',
        { value: 1 },
        mockComputeFn
      );

      expect(mockComputeFn).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Enhanced Cache Layer Integration', () => {
  let cacheLayer: EnhancedCacheLayer;

  beforeEach(() => {
    cacheLayer = new EnhancedCacheLayer({
      redis: {
        enabled: false,
        fallbackToMemory: true,
        connectionTimeout: 1000
      },
      memory: {
        maxMemoryMB: 10,
        maxEntries: 50
      },
      ttl: {
        financial: 60,
        inventory: 120,
        vendor: 300,
        default: 60
      },
      invalidation: {
        enabled: true,
        batchSize: 5,
        maxDependencies: 10
      },
      monitoring: {
        enabled: false,
        metricsInterval: 5000
      }
    });
  });

  afterEach(async () => {
    await cacheLayer.shutdown();
  });

  it('should handle realistic calculation service workflow', async () => {
    const taxCalculation = vi.fn().mockResolvedValue({
      value: {
        subtotal: { amount: 100, currencyCode: 'USD' },
        taxAmount: { amount: 10, currencyCode: 'USD' },
        totalAmount: { amount: 110, currencyCode: 'USD' },
        taxRate: 10,
        taxIncluded: false
      },
      calculatedAt: new Date(),
      calculationId: 'tax-calc-1',
      confidence: 1.0
    });

    const dependencies: CacheDependency[] = [
      { type: 'field', identifier: 'tax_rates', version: '10' },
      { type: 'field', identifier: 'currency_rates', version: 'USD' }
    ];

    // Initial calculation
    const result1 = await cacheLayer.getOrCompute(
      'FinancialCalculations',
      'calculateTax',
      { 
        subtotal: { amount: 100, currencyCode: 'USD' },
        taxRate: 10,
        taxIncluded: false
      },
      taxCalculation,
      dependencies,
      'user-123'
    );

    expect(result1.value.totalAmount.amount).toBe(110);
    expect(taxCalculation).toHaveBeenCalledTimes(1);

    // Cached retrieval
    const result2 = await cacheLayer.getOrCompute(
      'FinancialCalculations',
      'calculateTax',
      { 
        subtotal: { amount: 100, currencyCode: 'USD' },
        taxRate: 10,
        taxIncluded: false
      },
      taxCalculation,
      dependencies,
      'user-456'
    );

    expect(result2.value.totalAmount.amount).toBe(110);
    expect(taxCalculation).toHaveBeenCalledTimes(1); // Should be cached

    // Invalidate due to tax rate change
    await cacheLayer.invalidateByDependencies({
      dependencies: [{ type: 'field', identifier: 'tax_rates' }],
      reason: 'Tax rates updated',
      timestamp: new Date(),
      userId: 'admin-user'
    });

    // Next calculation should recompute
    taxCalculation.mockResolvedValue({
      value: {
        subtotal: { amount: 100, currencyCode: 'USD' },
        taxAmount: { amount: 15, currencyCode: 'USD' },
        totalAmount: { amount: 115, currencyCode: 'USD' },
        taxRate: 15,
        taxIncluded: false
      },
      calculatedAt: new Date(),
      calculationId: 'tax-calc-2',
      confidence: 1.0
    });

    const result3 = await cacheLayer.getOrCompute(
      'FinancialCalculations',
      'calculateTax',
      { 
        subtotal: { amount: 100, currencyCode: 'USD' },
        taxRate: 15, // Changed tax rate
        taxIncluded: false
      },
      taxCalculation,
      [
        { type: 'field', identifier: 'tax_rates', version: '15' },
        { type: 'field', identifier: 'currency_rates', version: 'USD' }
      ],
      'user-789'
    );

    expect(result3.value.totalAmount.amount).toBe(115);
    expect(taxCalculation).toHaveBeenCalledTimes(2); // Should recompute
  });
});