/**
 * Cache Manager for Calculation Services
 * 
 * Provides intelligent caching for expensive calculations with 
 * TTL, invalidation, and memory management features.
 */

import { CalculationResult } from '../calculations/base-calculator'

/**
 * Cache entry structure
 */
interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
  tags: string[];
  size: number; // Estimated memory size in bytes
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalMemoryUsage: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  maxMemoryMB: number;
  defaultTtlSeconds: number;
  maxEntries: number;
  cleanupIntervalMs: number;
  evictionStrategy: 'lru' | 'lfu' | 'fifo';
}

/**
 * Cache manager class with intelligent eviction and statistics
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private cleanupTimer?: NodeJS.Timeout;

  private readonly config: CacheConfig = {
    maxMemoryMB: 100,
    defaultTtlSeconds: 300, // 5 minutes
    maxEntries: 10000,
    cleanupIntervalMs: 60000, // 1 minute
    evictionStrategy: 'lru'
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessedAt = new Date();
    this.hitCount++;

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(
    key: string, 
    value: T, 
    ttlSeconds?: number, 
    tags: string[] = []
  ): boolean {
    const ttl = ttlSeconds || this.config.defaultTtlSeconds;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl * 1000));
    const size = this.estimateSize(value);

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      accessCount: 0,
      lastAccessedAt: now,
      tags,
      size
    };

    // Check if we need to make space
    if (!this.canFitEntry(entry)) {
      this.evictEntries(entry.size);
    }

    // Still can't fit after eviction
    if (!this.canFitEntry(entry)) {
      return false;
    }

    this.cache.set(key, entry);
    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys with specific tag
   */
  deleteByTag(tag: string): number {
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalMemoryUsage = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    const creationDates = entries.map(entry => entry.createdAt);
    const oldestEntry = creationDates.length > 0 ? new Date(Math.min(...creationDates.map(d => d.getTime()))) : undefined;
    const newestEntry = creationDates.length > 0 ? new Date(Math.max(...creationDates.map(d => d.getTime()))) : undefined;

    return {
      totalEntries: this.cache.size,
      totalMemoryUsage,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      evictionCount: this.evictionCount,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Get calculation result with caching
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<CalculationResult<T>>,
    ttlSeconds?: number,
    tags: string[] = []
  ): Promise<CalculationResult<T>> {
    // Try to get from cache first
    const cached = this.get<CalculationResult<T>>(key);
    if (cached) {
      return cached;
    }

    // Compute the result
    const result = await computeFn();

    // Cache the result if it's cacheable
    if (result.calculatedAt) {
      this.set(key, result, ttlSeconds, tags);
    }

    return result;
  }

  /**
   * Preload data into cache
   */
  async preload<T>(
    keys: Array<{
      key: string;
      computeFn: () => Promise<T>;
      ttlSeconds?: number;
      tags?: string[];
    }>
  ): Promise<{ loaded: number; failed: number }> {
    let loaded = 0;
    let failed = 0;

    for (const { key, computeFn, ttlSeconds, tags } of keys) {
      try {
        const value = await computeFn();
        if (this.set(key, value, ttlSeconds, tags || [])) {
          loaded++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { loaded, failed };
  }

  /**
   * Estimate memory size of an object
   */
  private estimateSize(obj: any): number {
    if (obj === null || obj === undefined) {
      return 8; // pointer size
    }

    if (typeof obj === 'string') {
      return obj.length * 2; // UTF-16 encoding
    }

    if (typeof obj === 'number') {
      return 8; // 64-bit number
    }

    if (typeof obj === 'boolean') {
      return 4;
    }

    if (obj instanceof Date) {
      return 16;
    }

    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.estimateSize(item), 24); // Array overhead
    }

    if (typeof obj === 'object') {
      let size = 32; // Object overhead
      for (const [key, value] of Object.entries(obj)) {
        size += this.estimateSize(key) + this.estimateSize(value);
      }
      return size;
    }

    return 16; // Default estimate
  }

  /**
   * Check if entry can fit in cache
   */
  private canFitEntry(entry: CacheEntry): boolean {
    const currentMemory = this.getTotalMemoryUsage();
    const maxMemoryBytes = this.config.maxMemoryMB * 1024 * 1024;
    
    return (
      this.cache.size < this.config.maxEntries &&
      (currentMemory + entry.size) <= maxMemoryBytes
    );
  }

  /**
   * Get total memory usage in bytes
   */
  private getTotalMemoryUsage(): number {
    return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
  }

  /**
   * Evict entries to make space
   */
  private evictEntries(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by eviction strategy
    let sortedEntries: Array<[string, CacheEntry]>;
    
    switch (this.config.evictionStrategy) {
      case 'lru':
        sortedEntries = entries.sort((a, b) => 
          a[1].lastAccessedAt.getTime() - b[1].lastAccessedAt.getTime()
        );
        break;
        
      case 'lfu':
        sortedEntries = entries.sort((a, b) => 
          a[1].accessCount - b[1].accessCount
        );
        break;
        
      case 'fifo':
      default:
        sortedEntries = entries.sort((a, b) => 
          a[1].createdAt.getTime() - b[1].createdAt.getTime()
        );
        break;
    }

    let freedSpace = 0;
    const maxMemoryBytes = this.config.maxMemoryMB * 1024 * 1024;
    const currentMemory = this.getTotalMemoryUsage();
    const targetFreeSpace = Math.max(requiredSpace, maxMemoryBytes * 0.1); // Free at least 10%

    for (const [key, entry] of sortedEntries) {
      if (freedSpace >= targetFreeSpace && (currentMemory - freedSpace + requiredSpace) <= maxMemoryBytes) {
        break;
      }

      this.cache.delete(key);
      freedSpace += entry.size;
      this.evictionCount++;
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpired(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`[CacheManager] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Stop cleanup timer (for cleanup/testing)
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }
}

// Global cache instance
export const globalCacheManager = new CacheManager({
  maxMemoryMB: 50,
  defaultTtlSeconds: 300,
  maxEntries: 5000,
  cleanupIntervalMs: 60000,
  evictionStrategy: 'lru'
});

/**
 * Decorator for caching method results
 */
export function Cacheable(ttlSeconds?: number, tags?: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      return await globalCacheManager.getOrCompute(
        cacheKey,
        async () => await method.apply(this, args),
        ttlSeconds,
        tags
      );
    };

    return descriptor;
  };
}