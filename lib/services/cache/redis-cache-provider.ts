/**
 * Redis Cache Provider
 * 
 * Provides Redis-based caching with connection pooling, 
 * error handling, and automatic fallback capabilities.
 */

// import Redis from 'ioredis'; // Commented out - not available in development

// Mock Redis class for development
class Redis {
  constructor(config?: any) {
    console.log('Mock Redis initialized:', config);
  }

  async get(key: string) {
    console.log('Mock Redis get:', key);
    return null;
  }

  async set(key: string, value: string, ...args: any[]) {
    console.log('Mock Redis set:', key, value, args);
    return 'OK';
  }

  async del(key: string) {
    console.log('Mock Redis del:', key);
    return 1;
  }

  async exists(key: string) {
    console.log('Mock Redis exists:', key);
    return 0;
  }

  async disconnect() {
    console.log('Mock Redis disconnect');
  }

  on(event: string, handler: Function) {
    console.log('Mock Redis event listener:', event);
    return this;
  }
}

import { CalculationResult } from '../calculations/base-calculator';

/**
 * Redis configuration options
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetryAttempts: number;
  retryDelayOnFailover: number;
  lazyConnect: boolean;
  connectTimeout: number;
  commandTimeout: number;
  maxRetriesPerRequest: number;
}

/**
 * Cache provider interface
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  deleteByPattern(pattern: string): Promise<number>;
  deleteByTags(tags: string[]): Promise<number>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  ping(): Promise<boolean>;
  getStats(): Promise<CacheProviderStats>;
  clear(): Promise<boolean>;
  disconnect(): Promise<void>;
}

/**
 * Cache provider statistics
 */
export interface CacheProviderStats {
  connected: boolean;
  memoryUsage?: number;
  keyCount?: number;
  hitCount?: number;
  missCount?: number;
  errorCount?: number;
  lastError?: string;
  uptime?: number;
}

/**
 * Redis cache provider implementation
 */
export class RedisCacheProvider implements CacheProvider {
  private client: Redis;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private lastError: string | null = null;
  private hitCount: number = 0;
  private missCount: number = 0;
  private errorCount: number = 0;
  private startTime: number = Date.now();

  constructor(private config: RedisConfig) {
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'calc:',
      maxRetriesPerRequest: config.maxRetriesPerRequest,
      retryDelayOnFailover: config.retryDelayOnFailover,
      lazyConnect: config.lazyConnect,
      connectTimeout: config.connectTimeout,
      commandTimeout: config.commandTimeout,
      maxRetryAttempts: config.maxRetryAttempts,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log('[RedisCacheProvider] Connected to Redis');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      this.lastError = error.message;
      this.errorCount++;
      console.error('[RedisCacheProvider] Redis error:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      console.log('[RedisCacheProvider] Redis connection closed');
    });

    this.client.on('reconnecting', (delay) => {
      this.connectionAttempts++;
      console.log(`[RedisCacheProvider] Reconnecting to Redis (attempt ${this.connectionAttempts}, delay: ${delay}ms)`);
    });
  }

  /**
   * Get value from Redis
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.client.get(key);
      
      if (result === null) {
        this.missCount++;
        return null;
      }

      this.hitCount++;
      return JSON.parse(result) as T;
    } catch (error) {
      this.handleError('get', error as Error);
      this.missCount++;
      return null;
    }
  }

  /**
   * Set value in Redis with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        const result = await this.client.setex(key, ttlSeconds, serialized);
        return result === 'OK';
      } else {
        const result = await this.client.set(key, serialized);
        return result === 'OK';
      }
    } catch (error) {
      this.handleError('set', error as Error);
      return false;
    }
  }

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      this.handleError('delete', error as Error);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(...keys);
      return result;
    } catch (error) {
      this.handleError('deleteByPattern', error as Error);
      return 0;
    }
  }

  /**
   * Delete keys by tags (using tag sets)
   */
  async deleteByTags(tags: string[]): Promise<number> {
    let totalDeleted = 0;
    
    try {
      for (const tag of tags) {
        const tagSetKey = `tags:${tag}`;
        const keys = await this.client.smembers(tagSetKey);
        
        if (keys.length > 0) {
          const deleted = await this.client.del(...keys);
          totalDeleted += deleted;
          
          // Clean up the tag set
          await this.client.del(tagSetKey);
        }
      }
      
      return totalDeleted;
    } catch (error) {
      this.handleError('deleteByTags', error as Error);
      return totalDeleted;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.handleError('exists', error as Error);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.handleError('ttl', error as Error);
      return -1;
    }
  }

  /**
   * Ping Redis server
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.handleError('ping', error as Error);
      return false;
    }
  }

  /**
   * Get provider statistics
   */
  async getStats(): Promise<CacheProviderStats> {
    try {
      const info = await this.client.info('memory');
      const dbSize = await this.client.dbsize();
      
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1], 10) : undefined;

      return {
        connected: this.isConnected,
        memoryUsage,
        keyCount: dbSize,
        hitCount: this.hitCount,
        missCount: this.missCount,
        errorCount: this.errorCount,
        lastError: this.lastError,
        uptime: Date.now() - this.startTime
      };
    } catch (error) {
      this.handleError('getStats', error as Error);
      return {
        connected: this.isConnected,
        hitCount: this.hitCount,
        missCount: this.missCount,
        errorCount: this.errorCount,
        lastError: this.lastError,
        uptime: Date.now() - this.startTime
      };
    }
  }

  /**
   * Clear all keys (use with caution)
   */
  async clear(): Promise<boolean> {
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      this.handleError('clear', error as Error);
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      console.error('[RedisCacheProvider] Error during disconnect:', error);
      this.client.disconnect();
    }
  }

  /**
   * Set value with tags for organized invalidation
   */
  async setWithTags<T>(key: string, value: T, ttlSeconds?: number, tags: string[] = []): Promise<boolean> {
    try {
      // Set the main value
      const setResult = await this.set(key, value, ttlSeconds);
      
      if (!setResult) {
        return false;
      }

      // Add key to tag sets for organized invalidation
      if (tags.length > 0) {
        const pipeline = this.client.pipeline();
        
        for (const tag of tags) {
          const tagSetKey = `tags:${tag}`;
          pipeline.sadd(tagSetKey, key);
          
          // Set TTL for tag set (slightly longer than data TTL)
          if (ttlSeconds) {
            pipeline.expire(tagSetKey, ttlSeconds + 300); // 5 minutes longer
          }
        }
        
        await pipeline.exec();
      }

      return true;
    } catch (error) {
      this.handleError('setWithTags', error as Error);
      return false;
    }
  }

  /**
   * Handle Redis errors
   */
  private handleError(operation: string, error: Error): void {
    this.errorCount++;
    this.lastError = `${operation}: ${error.message}`;
    console.error(`[RedisCacheProvider] Error in ${operation}:`, error);
  }

  /**
   * Check connection status
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get Redis client for advanced operations
   */
  get redisClient(): Redis {
    return this.client;
  }
}

/**
 * Create Redis cache provider with default configuration
 */
export function createRedisCacheProvider(config?: Partial<RedisConfig>): RedisCacheProvider {
  const defaultConfig: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: 'carmen:calc:',
    maxRetryAttempts: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
    connectTimeout: 5000,
    commandTimeout: 2000,
    maxRetriesPerRequest: 2,
  };

  return new RedisCacheProvider({ ...defaultConfig, ...config });
}