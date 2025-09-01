/**
 * Calculation Cache Service
 * 
 * Central service that manages caching for all calculation services,
 * provides unified access, monitoring, and cache warming capabilities.
 */

import { EnhancedCacheLayer, createEnhancedCacheLayer, CacheMetrics } from './enhanced-cache-layer';
import { CachedFinancialCalculations } from './cached-financial-calculations';
import { CachedInventoryCalculations } from './cached-inventory-calculations';
import { CachedVendorMetrics } from './cached-vendor-metrics';

/**
 * Cache service configuration
 */
export interface CacheServiceConfig {
  redis: {
    enabled: boolean;
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    fallbackToMemory?: boolean;
  };
  memory: {
    maxMemoryMB: number;
    maxEntries: number;
  };
  ttl: {
    financial: number;
    inventory: number;
    vendor: number;
    default: number;
  };
  warming: {
    enabled: boolean;
    onStartup: boolean;
    scheduleIntervalHours: number;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    logLevel: 'none' | 'basic' | 'detailed';
  };
}

/**
 * Cache warming configuration
 */
export interface CacheWarmingConfig {
  financial: {
    commonCurrencies: string[];
    taxRates: number[];
    discountRates: number[];
  };
  inventory: {
    topItemIds?: string[];
    commonQuantities: number[];
    usageRates: number[];
    leadTimes: number[];
  };
  vendor: {
    topVendorIds?: string[];
    analysisTimeframes: number[];
  };
}

/**
 * Cache service health status
 */
export interface CacheServiceHealth {
  status: 'healthy' | 'degraded' | 'error';
  redis: {
    connected: boolean;
    errorCount: number;
    lastError?: string;
  };
  memory: {
    usage: number;
    maxUsage: number;
    entryCount: number;
  };
  performance: {
    hitRate: number;
    averageResponseTime: number;
    cacheWarmingStatus: 'completed' | 'in_progress' | 'failed' | 'not_started';
  };
}

/**
 * Central calculation cache service
 */
export class CalculationCacheService {
  private cacheLayer: EnhancedCacheLayer;
  private financialCalculations: CachedFinancialCalculations;
  private inventoryCalculations: CachedInventoryCalculations;
  private vendorMetrics: CachedVendorMetrics;
  private warmingInProgress: boolean = false;
  private warmingSchedule?: NodeJS.Timeout;

  constructor(private config: CacheServiceConfig) {
    // Initialize enhanced cache layer
    this.cacheLayer = createEnhancedCacheLayer({
      redis: {
        enabled: config.redis.enabled,
        fallbackToMemory: config.redis.fallbackToMemory ?? true,
        connectionTimeout: 5000
      },
      memory: {
        maxMemoryMB: config.memory.maxMemoryMB,
        maxEntries: config.memory.maxEntries
      },
      ttl: {
        financial: config.ttl.financial,
        inventory: config.ttl.inventory,
        vendor: config.ttl.vendor,
        default: config.ttl.default
      },
      invalidation: {
        enabled: true,
        batchSize: 100,
        maxDependencies: 50
      },
      monitoring: {
        enabled: config.monitoring.enabled,
        metricsInterval: config.monitoring.metricsInterval
      }
    });

    // Initialize cached calculation services
    this.financialCalculations = new CachedFinancialCalculations(this.cacheLayer);
    this.inventoryCalculations = new CachedInventoryCalculations(this.cacheLayer);
    this.vendorMetrics = new CachedVendorMetrics(this.cacheLayer);

    // Setup cache warming if enabled
    if (config.warming.enabled) {
      if (config.warming.onStartup) {
        this.warmCacheOnStartup();
      }
      
      if (config.warming.scheduleIntervalHours > 0) {
        this.schedulePeriodicWarming();
      }
    }
  }

  /**
   * Get cached financial calculations service
   */
  get financial(): CachedFinancialCalculations {
    return this.financialCalculations;
  }

  /**
   * Get cached inventory calculations service
   */
  get inventory(): CachedInventoryCalculations {
    return this.inventoryCalculations;
  }

  /**
   * Get cached vendor metrics service
   */
  get vendor(): CachedVendorMetrics {
    return this.vendorMetrics;
  }

  /**
   * Warm all caches with common calculations
   */
  async warmAllCaches(warmingConfig?: CacheWarmingConfig): Promise<{
    financial: { warmed: number; failed: number };
    inventory: { warmed: number; failed: number };
    vendor: { warmed: number; failed: number };
    totalWarmed: number;
    totalFailed: number;
  }> {
    if (this.warmingInProgress) {
      throw new Error('Cache warming is already in progress');
    }

    this.warmingInProgress = true;
    const startTime = Date.now();

    try {
      console.log('[CalculationCacheService] Starting comprehensive cache warming...');

      // Warm financial cache
      const financialResult = await this.financialCalculations.warmFinancialCache();
      
      // Warm inventory cache
      const inventoryResult = await this.inventoryCalculations.warmInventoryCache(
        warmingConfig?.inventory.topItemIds
      );
      
      // Warm vendor cache
      const vendorResult = await this.vendorMetrics.warmVendorCache(
        warmingConfig?.vendor.topVendorIds
      );

      const totalWarmed = financialResult.warmed + inventoryResult.warmed + vendorResult.warmed;
      const totalFailed = financialResult.failed + inventoryResult.failed + vendorResult.failed;
      const duration = Date.now() - startTime;

      console.log(`[CalculationCacheService] Cache warming completed in ${duration}ms:`, {
        financial: financialResult,
        inventory: inventoryResult,
        vendor: vendorResult,
        totals: { warmed: totalWarmed, failed: totalFailed }
      });

      return {
        financial: financialResult,
        inventory: inventoryResult,
        vendor: vendorResult,
        totalWarmed,
        totalFailed
      };
    } finally {
      this.warmingInProgress = false;
    }
  }

  /**
   * Invalidate caches based on data changes
   */
  async invalidateCaches(changes: {
    financial?: { reason: string; userId?: string };
    inventory?: { reason: string; itemIds?: string[]; userId?: string };
    vendor?: { reason: string; vendorIds?: string[]; userId?: string };
  }): Promise<{ totalInvalidated: number; results: Record<string, number> }> {
    const results: Record<string, number> = {};
    let totalInvalidated = 0;

    if (changes.financial) {
      const count = await this.financialCalculations.invalidateFinancialCaches(
        changes.financial.reason,
        changes.financial.userId
      );
      results.financial = count;
      totalInvalidated += count;
    }

    if (changes.inventory) {
      const count = await this.inventoryCalculations.invalidateInventoryCaches(
        changes.inventory.reason,
        changes.inventory.itemIds,
        changes.inventory.userId
      );
      results.inventory = count;
      totalInvalidated += count;
    }

    if (changes.vendor) {
      const count = await this.vendorMetrics.invalidateVendorCaches(
        changes.vendor.reason,
        changes.vendor.vendorIds,
        changes.vendor.userId
      );
      results.vendor = count;
      totalInvalidated += count;
    }

    console.log(`[CalculationCacheService] Invalidated ${totalInvalidated} cache entries:`, results);

    return { totalInvalidated, results };
  }

  /**
   * Get comprehensive cache metrics
   */
  async getMetrics(): Promise<CacheMetrics> {
    return await this.cacheLayer.getMetrics();
  }

  /**
   * Get cache service health status
   */
  async getHealthStatus(): Promise<CacheServiceHealth> {
    const metrics = await this.getMetrics();

    const status = this.determineHealthStatus(metrics);

    return {
      status,
      redis: {
        connected: metrics.redis.connected,
        errorCount: metrics.redis.errorCount,
        lastError: undefined // Would need to be tracked separately
      },
      memory: {
        usage: metrics.memory.memoryUsage,
        maxUsage: this.config.memory.maxMemoryMB * 1024 * 1024,
        entryCount: metrics.memory.totalEntries
      },
      performance: {
        hitRate: metrics.combined.overallHitRate,
        averageResponseTime: metrics.combined.averageResponseTime,
        cacheWarmingStatus: this.warmingInProgress ? 'in_progress' : 'completed'
      }
    };
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<boolean> {
    console.log('[CalculationCacheService] Clearing all caches...');
    return await this.cacheLayer.clearAll();
  }

  /**
   * Shutdown cache service
   */
  async shutdown(): Promise<void> {
    console.log('[CalculationCacheService] Shutting down cache service...');
    
    if (this.warmingSchedule) {
      clearInterval(this.warmingSchedule);
    }

    await this.cacheLayer.shutdown();
  }

  /**
   * Warm cache on service startup
   */
  private async warmCacheOnStartup(): Promise<void> {
    // Delay startup warming to allow system to stabilize
    setTimeout(async () => {
      try {
        await this.warmAllCaches();
      } catch (error) {
        console.error('[CalculationCacheService] Startup cache warming failed:', error);
      }
    }, 5000);
  }

  /**
   * Schedule periodic cache warming
   */
  private schedulePeriodicWarming(): void {
    const intervalMs = this.config.warming.scheduleIntervalHours * 60 * 60 * 1000;
    
    this.warmingSchedule = setInterval(async () => {
      try {
        console.log('[CalculationCacheService] Starting scheduled cache warming...');
        await this.warmAllCaches();
      } catch (error) {
        console.error('[CalculationCacheService] Scheduled cache warming failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Determine overall health status from metrics
   */
  private determineHealthStatus(metrics: CacheMetrics): 'healthy' | 'degraded' | 'error' {
    // Error conditions
    if (metrics.redis.errorCount > 10 || !metrics.redis.connected) {
      return 'error';
    }

    // Degraded conditions
    if (metrics.combined.overallHitRate < 50 || metrics.combined.averageResponseTime > 1000) {
      return 'degraded';
    }

    return 'healthy';
  }
}

/**
 * Create calculation cache service with default configuration
 */
export function createCalculationCacheService(config?: Partial<CacheServiceConfig>): CalculationCacheService {
  const defaultConfig: CacheServiceConfig = {
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      fallbackToMemory: true
    },
    memory: {
      maxMemoryMB: 100,
      maxEntries: 5000
    },
    ttl: {
      financial: 300,     // 5 minutes - frequently changing data
      inventory: 900,     // 15 minutes - moderately stable
      vendor: 1800,       // 30 minutes - relatively stable
      default: 600        // 10 minutes
    },
    warming: {
      enabled: process.env.NODE_ENV === 'production',
      onStartup: true,
      scheduleIntervalHours: 24 // Daily cache warming
    },
    monitoring: {
      enabled: process.env.NODE_ENV === 'production',
      metricsInterval: 300000, // 5 minutes
      logLevel: 'basic'
    }
  };

  return new CalculationCacheService({ ...defaultConfig, ...config });
}

// Global cache service instance
let globalCacheService: CalculationCacheService;

/**
 * Get or create global calculation cache service
 */
export function getCalculationCacheService(config?: Partial<CacheServiceConfig>): CalculationCacheService {
  if (!globalCacheService) {
    globalCacheService = createCalculationCacheService(config);
  }
  return globalCacheService;
}