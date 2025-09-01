/**
 * Redis Cache Provider Tests
 * 
 * Test suite for Redis cache provider with error handling,
 * connection management, and fallback capabilities.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RedisCacheProvider, type RedisConfig } from '../redis-cache-provider';

// Mock ioredis
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
    exec: vi.fn().mockResolvedValue([])
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

vi.mock('ioredis', () => ({
  default: vi.fn(() => mockRedis)
}));

describe('RedisCacheProvider', () => {
  let provider: RedisCacheProvider;
  let config: RedisConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    config = {
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 0,
      keyPrefix: 'test:',
      maxRetryAttempts: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 2000,
      maxRetriesPerRequest: 2
    };

    provider = new RedisCacheProvider(config);
  });

  afterEach(async () => {
    await provider.disconnect();
  });

  describe('Connection Management', () => {
    it('should initialize Redis client with correct configuration', () => {
      expect(mockRedis.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
    });

    it('should handle connection events', () => {
      // Simulate connection event
      const connectHandler = mockRedis.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      connectHandler?.();

      expect(provider.connected).toBe(true);
    });

    it('should handle error events', () => {
      const error = new Error('Connection failed');
      const errorHandler = mockRedis.on.mock.calls.find(call => call[0] === 'error')?.[1];
      errorHandler?.(error);

      expect(provider.connected).toBe(false);
    });

    it('should handle close events', () => {
      const closeHandler = mockRedis.on.mock.calls.find(call => call[0] === 'close')?.[1];
      closeHandler?.();

      expect(provider.connected).toBe(false);
    });

    it('should handle reconnecting events', () => {
      const reconnectingHandler = mockRedis.on.mock.calls.find(call => call[0] === 'reconnecting')?.[1];
      reconnectingHandler?.(1000);

      // Should log reconnection attempt (tested through console output)
    });
  });

  describe('Basic Operations', () => {
    beforeEach(() => {
      // Simulate connected state
      const connectHandler = mockRedis.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      connectHandler?.();
    });

    describe('get', () => {
      it('should retrieve value from Redis', async () => {
        const testValue = { data: 'test' };
        mockRedis.get.mockResolvedValueOnce(JSON.stringify(testValue));

        const result = await provider.get('test-key');

        expect(mockRedis.get).toHaveBeenCalledWith('test-key');
        expect(result).toEqual(testValue);
      });

      it('should return null for non-existent key', async () => {
        mockRedis.get.mockResolvedValueOnce(null);

        const result = await provider.get('non-existent');

        expect(result).toBeNull();
      });

      it('should handle get errors gracefully', async () => {
        mockRedis.get.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.get('error-key');

        expect(result).toBeNull();
      });

      it('should handle malformed JSON gracefully', async () => {
        mockRedis.get.mockResolvedValueOnce('invalid-json{');

        const result = await provider.get('malformed-key');

        expect(result).toBeNull();
      });
    });

    describe('set', () => {
      it('should store value in Redis without TTL', async () => {
        mockRedis.set.mockResolvedValueOnce('OK');

        const result = await provider.set('test-key', { data: 'test' });

        expect(mockRedis.set).toHaveBeenCalledWith('test-key', JSON.stringify({ data: 'test' }));
        expect(result).toBe(true);
      });

      it('should store value in Redis with TTL', async () => {
        mockRedis.setex.mockResolvedValueOnce('OK');

        const result = await provider.set('test-key', { data: 'test' }, 300);

        expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 300, JSON.stringify({ data: 'test' }));
        expect(result).toBe(true);
      });

      it('should handle set errors gracefully', async () => {
        mockRedis.set.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.set('error-key', { data: 'test' });

        expect(result).toBe(false);
      });

      it('should return false for non-OK response', async () => {
        mockRedis.set.mockResolvedValueOnce('ERROR');

        const result = await provider.set('test-key', { data: 'test' });

        expect(result).toBe(false);
      });
    });

    describe('delete', () => {
      it('should delete existing key', async () => {
        mockRedis.del.mockResolvedValueOnce(1);

        const result = await provider.delete('test-key');

        expect(mockRedis.del).toHaveBeenCalledWith('test-key');
        expect(result).toBe(true);
      });

      it('should return false for non-existent key', async () => {
        mockRedis.del.mockResolvedValueOnce(0);

        const result = await provider.delete('non-existent');

        expect(result).toBe(false);
      });

      it('should handle delete errors gracefully', async () => {
        mockRedis.del.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.delete('error-key');

        expect(result).toBe(false);
      });
    });

    describe('exists', () => {
      it('should return true for existing key', async () => {
        mockRedis.exists.mockResolvedValueOnce(1);

        const result = await provider.exists('test-key');

        expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
        expect(result).toBe(true);
      });

      it('should return false for non-existent key', async () => {
        mockRedis.exists.mockResolvedValueOnce(0);

        const result = await provider.exists('non-existent');

        expect(result).toBe(false);
      });

      it('should handle exists errors gracefully', async () => {
        mockRedis.exists.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.exists('error-key');

        expect(result).toBe(false);
      });
    });

    describe('ttl', () => {
      it('should return TTL for key', async () => {
        mockRedis.ttl.mockResolvedValueOnce(300);

        const result = await provider.ttl('test-key');

        expect(mockRedis.ttl).toHaveBeenCalledWith('test-key');
        expect(result).toBe(300);
      });

      it('should handle ttl errors gracefully', async () => {
        mockRedis.ttl.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.ttl('error-key');

        expect(result).toBe(-1);
      });
    });

    describe('ping', () => {
      it('should return true for successful ping', async () => {
        mockRedis.ping.mockResolvedValueOnce('PONG');

        const result = await provider.ping();

        expect(mockRedis.ping).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should return false for failed ping', async () => {
        mockRedis.ping.mockRejectedValueOnce(new Error('Connection error'));

        const result = await provider.ping();

        expect(result).toBe(false);
      });
    });
  });

  describe('Advanced Operations', () => {
    beforeEach(() => {
      // Simulate connected state
      const connectHandler = mockRedis.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      connectHandler?.();
    });

    describe('deleteByPattern', () => {
      it('should delete keys matching pattern', async () => {
        mockRedis.keys.mockResolvedValueOnce(['key1', 'key2', 'key3']);
        mockRedis.del.mockResolvedValueOnce(3);

        const result = await provider.deleteByPattern('pattern:*');

        expect(mockRedis.keys).toHaveBeenCalledWith('pattern:*');
        expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
        expect(result).toBe(3);
      });

      it('should return 0 when no keys match pattern', async () => {
        mockRedis.keys.mockResolvedValueOnce([]);

        const result = await provider.deleteByPattern('nonexistent:*');

        expect(result).toBe(0);
        expect(mockRedis.del).not.toHaveBeenCalled();
      });

      it('should handle pattern delete errors gracefully', async () => {
        mockRedis.keys.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.deleteByPattern('pattern:*');

        expect(result).toBe(0);
      });
    });

    describe('deleteByTags', () => {
      it('should delete keys by tags', async () => {
        mockRedis.smembers.mockResolvedValueOnce(['key1', 'key2']);
        mockRedis.del
          .mockResolvedValueOnce(2) // Delete keys
          .mockResolvedValueOnce(1); // Delete tag set

        const result = await provider.deleteByTags(['tag1']);

        expect(mockRedis.smembers).toHaveBeenCalledWith('tags:tag1');
        expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
        expect(mockRedis.del).toHaveBeenCalledWith('tags:tag1');
        expect(result).toBe(2);
      });

      it('should handle multiple tags', async () => {
        mockRedis.smembers
          .mockResolvedValueOnce(['key1', 'key2']) // tag1
          .mockResolvedValueOnce(['key3']); // tag2
        
        mockRedis.del
          .mockResolvedValueOnce(2) // Delete keys for tag1
          .mockResolvedValueOnce(1) // Delete tag1 set
          .mockResolvedValueOnce(1) // Delete keys for tag2
          .mockResolvedValueOnce(1); // Delete tag2 set

        const result = await provider.deleteByTags(['tag1', 'tag2']);

        expect(result).toBe(3);
      });

      it('should handle empty tag sets', async () => {
        mockRedis.smembers.mockResolvedValueOnce([]);

        const result = await provider.deleteByTags(['empty-tag']);

        expect(result).toBe(0);
      });
    });

    describe('setWithTags', () => {
      it('should store value with tags', async () => {
        mockRedis.set.mockResolvedValueOnce('OK');
        const mockPipeline = {
          sadd: vi.fn(),
          expire: vi.fn(),
          exec: vi.fn().mockResolvedValue([])
        };
        mockRedis.pipeline.mockReturnValueOnce(mockPipeline);

        const result = await provider.setWithTags('test-key', { data: 'test' }, 300, ['tag1', 'tag2']);

        expect(mockRedis.set).toHaveBeenCalled();
        expect(mockRedis.pipeline).toHaveBeenCalled();
        expect(mockPipeline.sadd).toHaveBeenCalledWith('tags:tag1', 'test-key');
        expect(mockPipeline.sadd).toHaveBeenCalledWith('tags:tag2', 'test-key');
        expect(mockPipeline.expire).toHaveBeenCalledWith('tags:tag1', 600); // TTL + 300
        expect(mockPipeline.expire).toHaveBeenCalledWith('tags:tag2', 600);
        expect(result).toBe(true);
      });

      it('should store value without tags when no tags provided', async () => {
        mockRedis.set.mockResolvedValueOnce('OK');

        const result = await provider.setWithTags('test-key', { data: 'test' }, 300, []);

        expect(mockRedis.set).toHaveBeenCalled();
        expect(mockRedis.pipeline).not.toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should handle setWithTags errors gracefully', async () => {
        mockRedis.set.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.setWithTags('test-key', { data: 'test' }, 300, ['tag1']);

        expect(result).toBe(false);
      });
    });
  });

  describe('Statistics and Monitoring', () => {
    beforeEach(() => {
      // Simulate connected state
      const connectHandler = mockRedis.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      connectHandler?.();
    });

    describe('getStats', () => {
      it('should return comprehensive statistics', async () => {
        mockRedis.info.mockResolvedValueOnce('used_memory:1048576\nother_info:value');
        mockRedis.dbsize.mockResolvedValueOnce(150);

        const stats = await provider.getStats();

        expect(stats.connected).toBe(true);
        expect(stats.memoryUsage).toBe(1048576);
        expect(stats.keyCount).toBe(150);
        expect(stats.hitCount).toBe(0); // Initial state
        expect(stats.missCount).toBe(0); // Initial state
      });

      it('should handle stats errors gracefully', async () => {
        mockRedis.info.mockRejectedValueOnce(new Error('Redis error'));

        const stats = await provider.getStats();

        expect(stats.connected).toBe(true);
        expect(stats.memoryUsage).toBeUndefined();
        expect(stats.keyCount).toBeUndefined();
      });

      it('should track hit and miss counts', async () => {
        // Simulate some operations that affect counters
        mockRedis.get.mockResolvedValueOnce(JSON.stringify({ data: 'test' })); // hit
        await provider.get('test-key');

        mockRedis.get.mockResolvedValueOnce(null); // miss
        await provider.get('missing-key');

        mockRedis.info.mockResolvedValueOnce('used_memory:1048576');
        mockRedis.dbsize.mockResolvedValueOnce(100);

        const stats = await provider.getStats();

        expect(stats.hitCount).toBe(1);
        expect(stats.missCount).toBe(1);
      });
    });

    it('should track error counts', async () => {
      // Cause some errors
      mockRedis.get.mockRejectedValueOnce(new Error('Redis error'));
      await provider.get('error-key');

      mockRedis.set.mockRejectedValueOnce(new Error('Another error'));
      await provider.set('error-key', { data: 'test' });

      mockRedis.info.mockResolvedValueOnce('used_memory:1048576');
      mockRedis.dbsize.mockResolvedValueOnce(100);

      const stats = await provider.getStats();

      expect(stats.errorCount).toBe(2);
      expect(stats.lastError).toContain('Redis error');
    });
  });

  describe('Utility Operations', () => {
    beforeEach(() => {
      // Simulate connected state
      const connectHandler = mockRedis.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      connectHandler?.();
    });

    describe('clear', () => {
      it('should clear all keys in database', async () => {
        mockRedis.flushdb.mockResolvedValueOnce('OK');

        const result = await provider.clear();

        expect(mockRedis.flushdb).toHaveBeenCalled();
        expect(result).toBe(true);
      });

      it('should handle clear errors gracefully', async () => {
        mockRedis.flushdb.mockRejectedValueOnce(new Error('Redis error'));

        const result = await provider.clear();

        expect(result).toBe(false);
      });
    });

    describe('disconnect', () => {
      it('should disconnect gracefully', async () => {
        mockRedis.quit.mockResolvedValueOnce('OK');

        await provider.disconnect();

        expect(mockRedis.quit).toHaveBeenCalled();
        expect(provider.connected).toBe(false);
      });

      it('should force disconnect on error', async () => {
        mockRedis.quit.mockRejectedValueOnce(new Error('Quit failed'));

        await provider.disconnect();

        expect(mockRedis.disconnect).toHaveBeenCalled();
      });
    });
  });

  describe('Error Resilience', () => {
    it('should continue operating after Redis errors', async () => {
      // Simulate connection
      const connectHandler = mockRedis.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      connectHandler?.();

      // First operation fails
      mockRedis.get.mockRejectedValueOnce(new Error('Redis timeout'));
      const result1 = await provider.get('key1');
      expect(result1).toBeNull();

      // Second operation succeeds
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ data: 'success' }));
      const result2 = await provider.get('key2');
      expect(result2).toEqual({ data: 'success' });
    });

    it('should handle connection loss gracefully', async () => {
      // Simulate connection then disconnection
      const connectHandler = mockRedis.on.mock.calls.find(call => call[0] === 'connect')?.[1];
      const closeHandler = mockRedis.on.mock.calls.find(call => call[0] === 'close')?.[1];
      
      connectHandler?.();
      expect(provider.connected).toBe(true);

      closeHandler?.();
      expect(provider.connected).toBe(false);

      // Operations should still work (return safe defaults)
      mockRedis.get.mockRejectedValueOnce(new Error('Connection lost'));
      const result = await provider.get('test-key');
      expect(result).toBeNull();
    });
  });
});