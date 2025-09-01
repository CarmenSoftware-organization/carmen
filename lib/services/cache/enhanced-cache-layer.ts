/**
 * Enhanced Cache Layer
 * 
 * Provides intelligent caching with Redis primary and in-memory fallback,
 * comprehensive invalidation strategies, and performance monitoring.
 */

import { CalculationResult } from '../calculations/base-calculator';
import { CacheProvider, RedisCacheProvider, createRedisCacheProvider } from './redis-cache-provider';
import { CacheManager } from '../utils/cache-manager';
import { createHash } from 'crypto';

/**
 * Cache configuration for different calculation types
 */
export interface CacheLayerConfig {
  redis: {
    enabled: boolean;
    fallbackToMemory: boolean;
    connectionTimeout: number;
  };
  memory: {
    maxMemoryMB: number;
    maxEntries: number;
  };
  ttl: {
    financial: number;        // Financial calculations (tax, currency)
    inventory: number;        // Inventory calculations  
    vendor: number;          // Vendor metrics
    default: number;         // Default TTL
  };
  invalidation: {
    enabled: boolean;
    batchSize: number;
    maxDependencies: number;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
  };
}

/**
 * Cache dependency tracking
 */
export interface CacheDependency {
  type: 'entity' | 'table' | 'field' | 'external';
  identifier: string;
  version?: string | number;
}

/**
 * Cache invalidation event
 */
export interface InvalidationEvent {
  dependencies: CacheDependency[];
  reason: string;
  timestamp: Date;
  userId?: string;
}

/**
 * Cache metrics
 */
export interface CacheMetrics {
  redis: {
    connected: boolean;
    hitCount: number;
    missCount: number;
    errorCount: number;
    hitRate: number;
    memoryUsage?: number;
    keyCount?: number;
  };
  memory: {
    hitCount: number;
    missCount: number;
    hitRate: number;
    totalEntries: number;
    memoryUsage: number;
  };
  combined: {
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
    averageResponseTime: number;
  };
  invalidation: {
    totalInvalidations: number;
    keysInvalidated: number;
    lastInvalidation?: Date;
  };
}

/**
 * Enhanced cache layer with Redis and in-memory support
 */
export class EnhancedCacheLayer {
  private redisProvider?: CacheProvider;
  private memoryProvider: CacheManager;
  private dependencyGraph: Map<string, Set<CacheDependency>> = new Map();
  private keyDependencies: Map<string, Set<string>> = new Map();
  private metrics: CacheMetrics;
  private metricsInterval?: NodeJS.Timeout;

  constructor(private config: CacheLayerConfig) {
    // Initialize memory cache
    this.memoryProvider = new CacheManager({
      maxMemoryMB: config.memory.maxMemoryMB,
      maxEntries: config.memory.maxEntries,
      defaultTtlSeconds: config.ttl.default,
      cleanupIntervalMs: 60000,
      evictionStrategy: 'lru'
    });

    // Initialize Redis if enabled
    if (config.redis.enabled) {
      try {
        this.redisProvider = createRedisCacheProvider({
          connectTimeout: config.redis.connectionTimeout
        });
      } catch (error) {
        console.error('[EnhancedCacheLayer] Failed to initialize Redis:', error);
        if (!config.redis.fallbackToMemory) {
          throw error;
        }
      }
    }

    // Initialize metrics
    this.metrics = this.initializeMetrics();

    // Start monitoring if enabled
    if (config.monitoring.enabled) {
      this.startMetricsCollection();
    }
  }

  /**
   * Get calculation result with comprehensive caching
   */
  async getOrCompute<T>(
    serviceClass: string,
    method: string,
    inputs: Record<string, any>,
    computeFn: () => Promise<CalculationResult<T>>,
    dependencies: CacheDependency[] = [],
    userId?: string
  ): Promise<CalculationResult<T>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(serviceClass, method, inputs);
    const ttl = this.getTTLForCalculationType(serviceClass);

    try {
      // Try Redis first
      let result = await this.getFromRedis<CalculationResult<T>>(cacheKey);
      if (result) {
        this.updateMetrics('redis', 'hit', Date.now() - startTime);
        return result;
      }

      // Try memory cache
      result = this.getFromMemory<CalculationResult<T>>(cacheKey);
      if (result) {
        // Also populate Redis for next time
        if (this.redisProvider) {
          await this.setInRedis(cacheKey, result, ttl, this.generateTags(dependencies));
        }
        this.updateMetrics('memory', 'hit', Date.now() - startTime);
        return result;
      }

      // Cache miss - compute result
      this.updateMetrics('combined', 'miss', 0);
      result = await computeFn();

      // Cache the result in both layers
      await Promise.all([
        this.setInRedis(cacheKey, result, ttl, this.generateTags(dependencies)),
        this.setInMemory(cacheKey, result, ttl, this.generateTags(dependencies))
      ]);

      // Track dependencies
      if (dependencies.length > 0) {
        this.trackDependencies(cacheKey, dependencies);
      }

      const responseTime = Date.now() - startTime;
      this.updateMetrics('combined', 'computed', responseTime);

      return result;
    } catch (error) {
      console.error('[EnhancedCacheLayer] Error in getOrCompute:', error);
      this.updateMetrics('combined', 'error', Date.now() - startTime);
      
      // Fallback to direct computation
      return await computeFn();
    }
  }

  /**
   * Invalidate cache entries based on dependencies
   */
  async invalidateByDependencies(event: InvalidationEvent): Promise<number> {
    const startTime = Date.now();
    let totalInvalidated = 0;

    try {
      const keysToInvalidate = new Set<string>();

      // Find all cache keys affected by these dependencies
      for (const dependency of event.dependencies) {
        const dependentKeys = this.findKeysByDependency(dependency);
        dependentKeys.forEach(key => keysToInvalidate.add(key));
      }

      // Invalidate in batches
      const keys = Array.from(keysToInvalidate);
      const batchSize = this.config.invalidation.batchSize;

      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        
        // Invalidate in both Redis and memory
        await Promise.all([
          this.invalidateKeysInRedis(batch),
          this.invalidateKeysInMemory(batch)
        ]);
        
        totalInvalidated += batch.length;
      }

      // Clean up dependency tracking
      this.cleanupDependencies(Array.from(keysToInvalidate));

      // Update metrics
      this.metrics.invalidation.totalInvalidations++;
      this.metrics.invalidation.keysInvalidated += totalInvalidated;
      this.metrics.invalidation.lastInvalidation = event.timestamp;

      console.log(`[EnhancedCacheLayer] Invalidated ${totalInvalidated} keys in ${Date.now() - startTime}ms`);
      
      return totalInvalidated;
    } catch (error) {
      console.error('[EnhancedCacheLayer] Error during invalidation:', error);
      return totalInvalidated;
    }
  }

  /**
   * Warm cache with frequently accessed calculations
   */
  async warmCache(
    warmingTasks: Array<{
      serviceClass: string;
      method: string;
      inputs: Record<string, any>;
      computeFn: () => Promise<CalculationResult<any>>;
      dependencies?: CacheDependency[];
      priority?: number;
    }>
  ): Promise<{ warmed: number; failed: number }> {
    const sortedTasks = warmingTasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    let warmed = 0;
    let failed = 0;

    console.log(`[EnhancedCacheLayer] Starting cache warming with ${warmingTasks.length} tasks`);

    // Process tasks in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < sortedTasks.length; i += batchSize) {
      const batch = sortedTasks.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (task) => {
        try {
          await this.getOrCompute(
            task.serviceClass,
            task.method,
            task.inputs,
            task.computeFn,
            task.dependencies || []
          );
          warmed++;
        } catch (error) {
          console.error(`[EnhancedCacheLayer] Failed to warm cache for ${task.serviceClass}.${task.method}:`, error);
          failed++;
        }
      }));
    }

    console.log(`[EnhancedCacheLayer] Cache warming completed: ${warmed} warmed, ${failed} failed`);
    return { warmed, failed };
  }

  /**
   * Get comprehensive cache metrics
   */
  async getMetrics(): Promise<CacheMetrics> {
    // Update Redis metrics if available
    if (this.redisProvider) {
      const redisStats = await this.redisProvider.getStats();
      this.metrics.redis = {
        connected: redisStats.connected,
        hitCount: redisStats.hitCount || 0,
        missCount: redisStats.missCount || 0,
        errorCount: redisStats.errorCount || 0,
        hitRate: this.calculateHitRate(redisStats.hitCount || 0, redisStats.missCount || 0),
        memoryUsage: redisStats.memoryUsage,
        keyCount: redisStats.keyCount
      };
    }

    // Update memory metrics
    const memoryStats = this.memoryProvider.getStats();
    this.metrics.memory = {
      hitCount: memoryStats.hitCount,
      missCount: memoryStats.missCount,
      hitRate: memoryStats.hitRate,
      totalEntries: memoryStats.totalEntries,
      memoryUsage: memoryStats.totalMemoryUsage
    };

    // Update combined metrics
    const totalHits = this.metrics.redis.hitCount + this.metrics.memory.hitCount;
    const totalMisses = this.metrics.redis.missCount + this.metrics.memory.missCount;
    
    this.metrics.combined = {
      totalHits,
      totalMisses,
      overallHitRate: this.calculateHitRate(totalHits, totalMisses),
      averageResponseTime: this.metrics.combined.averageResponseTime || 0
    };

    return { ...this.metrics };
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<boolean> {
    try {
      await Promise.all([
        this.redisProvider?.clear(),
        Promise.resolve(this.memoryProvider.clear())
      ]);

      // Clear dependency tracking
      this.dependencyGraph.clear();
      this.keyDependencies.clear();

      // Reset metrics
      this.metrics = this.initializeMetrics();

      return true;
    } catch (error) {
      console.error('[EnhancedCacheLayer] Error clearing caches:', error);
      return false;
    }
  }

  /**
   * Shutdown cache layer
   */
  async shutdown(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    if (this.redisProvider) {
      await this.redisProvider.disconnect();
    }

    this.memoryProvider.destroy();
  }

  /**
   * Generate cache key with comprehensive hashing
   */
  private generateCacheKey(serviceClass: string, method: string, inputs: Record<string, any>): string {
    // Sort inputs to ensure consistent key generation
    const sortedInputs = this.sortObjectRecursively(inputs);
    const inputsHash = createHash('sha256')
      .update(JSON.stringify(sortedInputs))
      .digest('hex')
      .substring(0, 16);

    return `${serviceClass}:${method}:${inputsHash}`;
  }

  /**
   * Sort object recursively for consistent hashing
   */
  private sortObjectRecursively(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectRecursively(item));
    }

    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: Record<string, any> = {};
    
    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectRecursively(obj[key]);
    }

    return sortedObj;
  }

  /**
   * Get TTL based on calculation type
   */
  private getTTLForCalculationType(serviceClass: string): number {
    const lowerClass = serviceClass.toLowerCase();
    
    if (lowerClass.includes('financial')) {
      return this.config.ttl.financial;
    }
    
    if (lowerClass.includes('inventory')) {
      return this.config.ttl.inventory;
    }
    
    if (lowerClass.includes('vendor')) {
      return this.config.ttl.vendor;
    }

    return this.config.ttl.default;
  }

  /**
   * Generate cache tags from dependencies
   */
  private generateTags(dependencies: CacheDependency[]): string[] {
    return dependencies.map(dep => `${dep.type}:${dep.identifier}`);
  }

  /**
   * Track dependencies for cache invalidation
   */
  private trackDependencies(cacheKey: string, dependencies: CacheDependency[]): void {
    if (!this.config.invalidation.enabled || dependencies.length === 0) {
      return;
    }

    // Limit dependency tracking to prevent memory bloat
    if (dependencies.length > this.config.invalidation.maxDependencies) {
      dependencies = dependencies.slice(0, this.config.invalidation.maxDependencies);
    }

    // Track dependencies for this key
    this.dependencyGraph.set(cacheKey, new Set(dependencies));

    // Build reverse index for fast lookup
    for (const dependency of dependencies) {
      const depKey = `${dependency.type}:${dependency.identifier}`;
      if (!this.keyDependencies.has(depKey)) {
        this.keyDependencies.set(depKey, new Set());
      }
      this.keyDependencies.get(depKey)!.add(cacheKey);
    }
  }

  /**
   * Find cache keys affected by a dependency
   */
  private findKeysByDependency(dependency: CacheDependency): Set<string> {
    const depKey = `${dependency.type}:${dependency.identifier}`;
    return this.keyDependencies.get(depKey) || new Set();
  }

  /**
   * Clean up dependency tracking after invalidation
   */
  private cleanupDependencies(invalidatedKeys: string[]): void {
    for (const key of invalidatedKeys) {
      const dependencies = this.dependencyGraph.get(key);
      if (dependencies) {
        // Remove from reverse index
        for (const dependency of dependencies) {
          const depKey = `${dependency.type}:${dependency.identifier}`;
          const keySet = this.keyDependencies.get(depKey);
          if (keySet) {
            keySet.delete(key);
            if (keySet.size === 0) {
              this.keyDependencies.delete(depKey);
            }
          }
        }
        
        // Remove from main dependency graph
        this.dependencyGraph.delete(key);
      }
    }
  }

  /**
   * Redis operations with error handling
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redisProvider) return null;
    try {
      return await this.redisProvider.get<T>(key);
    } catch (error) {
      console.error('[EnhancedCacheLayer] Redis get error:', error);
      return null;
    }
  }

  private async setInRedis<T>(key: string, value: T, ttl: number, tags: string[] = []): Promise<void> {
    if (!this.redisProvider) return;
    try {
      if (this.redisProvider instanceof RedisCacheProvider) {
        await this.redisProvider.setWithTags(key, value, ttl, tags);
      } else {
        await this.redisProvider.set(key, value, ttl);
      }
    } catch (error) {
      console.error('[EnhancedCacheLayer] Redis set error:', error);
    }
  }

  private async invalidateKeysInRedis(keys: string[]): Promise<void> {
    if (!this.redisProvider) return;
    try {
      await Promise.all(keys.map(key => this.redisProvider!.delete(key)));
    } catch (error) {
      console.error('[EnhancedCacheLayer] Redis invalidation error:', error);
    }
  }

  /**
   * Memory operations
   */
  private getFromMemory<T>(key: string): T | null {
    return this.memoryProvider.get<T>(key);
  }

  private setInMemory<T>(key: string, value: T, ttl: number, tags: string[] = []): void {
    this.memoryProvider.set(key, value, ttl, tags);
  }

  private invalidateKeysInMemory(keys: string[]): void {
    keys.forEach(key => this.memoryProvider.delete(key));
  }

  /**
   * Metrics and monitoring
   */
  private initializeMetrics(): CacheMetrics {
    return {
      redis: {
        connected: false,
        hitCount: 0,
        missCount: 0,
        errorCount: 0,
        hitRate: 0
      },
      memory: {
        hitCount: 0,
        missCount: 0,
        hitRate: 0,
        totalEntries: 0,
        memoryUsage: 0
      },
      combined: {
        totalHits: 0,
        totalMisses: 0,
        overallHitRate: 0,
        averageResponseTime: 0
      },
      invalidation: {
        totalInvalidations: 0,
        keysInvalidated: 0
      }
    };
  }

  private calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? Math.round((hits / total) * 100 * 100) / 100 : 0;
  }

  private updateMetrics(layer: 'redis' | 'memory' | 'combined', type: 'hit' | 'miss' | 'error' | 'computed', responseTime: number): void {
    // Implementation would update internal metrics tracking
    // This is a simplified version
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.getMetrics();
        console.log('[EnhancedCacheLayer] Metrics:', {
          redis: `${metrics.redis.hitRate}% hit rate`,
          memory: `${metrics.memory.hitRate}% hit rate`,
          overall: `${metrics.combined.overallHitRate}% hit rate`,
          invalidations: metrics.invalidation.totalInvalidations
        });
      } catch (error) {
        console.error('[EnhancedCacheLayer] Metrics collection error:', error);
      }
    }, this.config.monitoring.metricsInterval);
  }
}

/**
 * Create enhanced cache layer with default configuration
 */
export function createEnhancedCacheLayer(config?: Partial<CacheLayerConfig>): EnhancedCacheLayer {
  const defaultConfig: CacheLayerConfig = {
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      fallbackToMemory: true,
      connectionTimeout: 5000
    },
    memory: {
      maxMemoryMB: 100,
      maxEntries: 5000
    },
    ttl: {
      financial: 300,    // 5 minutes
      inventory: 600,    // 10 minutes  
      vendor: 1800,      // 30 minutes
      default: 300       // 5 minutes
    },
    invalidation: {
      enabled: true,
      batchSize: 100,
      maxDependencies: 50
    },
    monitoring: {
      enabled: process.env.NODE_ENV === 'production',
      metricsInterval: 60000 // 1 minute
    }
  };

  return new EnhancedCacheLayer({ ...defaultConfig, ...config });
}