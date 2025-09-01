/**
 * Cache Services Index
 * 
 * Exports all caching-related services and utilities for
 * calculation services with Redis and in-memory caching.
 */

// Enhanced cache layer
export { 
  EnhancedCacheLayer,
  createEnhancedCacheLayer,
  type CacheLayerConfig,
  type CacheDependency,
  type InvalidationEvent,
  type CacheMetrics
} from './enhanced-cache-layer';

// Redis cache provider
export {
  RedisCacheProvider,
  createRedisCacheProvider,
  type CacheProvider,
  type CacheProviderStats,
  type RedisConfig
} from './redis-cache-provider';

// Cached calculation services
export {
  CachedFinancialCalculations
} from './cached-financial-calculations';

export {
  CachedInventoryCalculations
} from './cached-inventory-calculations';

export {
  CachedVendorMetrics
} from './cached-vendor-metrics';

// Central cache service
export {
  CalculationCacheService,
  createCalculationCacheService,
  getCalculationCacheService,
  type CacheServiceConfig,
  type CacheWarmingConfig,
  type CacheServiceHealth
} from './calculation-cache-service';

// Re-export existing cache manager for compatibility
export {
  CacheManager,
  globalCacheManager,
  Cacheable,
  type CacheConfig,
  type CacheStats
} from '../utils/cache-manager';