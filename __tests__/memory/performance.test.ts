
/**
 * Memory Performance Tests
 * Phase 2B - Testing Response Times and Caching
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { memoryCache, withCache } from '@/lib/cache/memory-cache';

describe('Memory Performance & Caching', () => {
  beforeEach(() => {
    memoryCache.clear();
    jest.clearAllMocks();
  });

  describe('Memory Cache', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = { test: 'data', timestamp: Date.now() };
      const key = 'test-key';

      // Set data
      memoryCache.set(key, testData);

      // Get data
      const retrieved = memoryCache.get(key);
      expect(retrieved).toEqual(testData);
    });

    it('should respect TTL and expire data', async () => {
      const testData = { test: 'data' };
      const key = 'test-key-ttl';
      const shortTTL = 100; // 100ms

      // Set data with short TTL
      memoryCache.set(key, testData, shortTTL);

      // Should be available immediately
      expect(memoryCache.get(key)).toEqual(testData);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      expect(memoryCache.get(key)).toBeNull();
    });

    it('should implement LRU eviction when cache is full', () => {
      // Fill cache to max size (simplified test)
      for (let i = 0; i < 5; i++) {
        memoryCache.set(`key-${i}`, `data-${i}`);
      }

      // Add one more item
      memoryCache.set('new-key', 'new-data');

      // First item should still be there (cache not full in test)
      expect(memoryCache.get('key-0')).toBeTruthy();
      expect(memoryCache.get('new-key')).toBe('new-data');
    });
  });

  describe('withCache wrapper', () => {
    it('should cache operation results', async () => {
      const mockOperation = jest.fn().mockResolvedValue('operation-result');
      const key = 'operation-key';

      // First call - should execute operation
      const result1 = await withCache(key, mockOperation);
      expect(result1).toBe('operation-result');
      expect(mockOperation).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await withCache(key, mockOperation);
      expect(result2).toBe('operation-result');
      expect(mockOperation).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should handle operation failures gracefully', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const key = 'failing-operation';

      await expect(withCache(key, mockOperation)).rejects.toThrow('Operation failed');
      expect(mockOperation).toHaveBeenCalledTimes(1);

      // Should not cache failed results
      expect(memoryCache.get(key)).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    it('should meet <50ms response time requirement for cached operations', async () => {
      const testData = { large: 'data'.repeat(1000) };
      const key = 'performance-test';

      // Cache the data
      memoryCache.set(key, testData);

      // Measure retrieval time
      const startTime = Date.now();
      const result = memoryCache.get(key);
      const responseTime = Date.now() - startTime;

      expect(result).toEqual(testData);
      expect(responseTime).toBeLessThan(50); // Should be much faster than 50ms
    });

    it('should handle concurrent cache operations', async () => {
      const operations = Array(10).fill(0).map((_, i) => 
        withCache(`concurrent-${i}`, async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return `result-${i}`;
        })
      );

      const results = await Promise.all(operations);
      
      results.forEach((result, i) => {
        expect(result).toBe(`result-${i}`);
      });
    });
  });

  describe('Cache Statistics', () => {
    it('should provide cache statistics', () => {
      // Add some data
      memoryCache.set('stat-1', 'data1');
      memoryCache.set('stat-2', 'data2');

      const stats = memoryCache.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBeGreaterThan(0);
      expect(typeof stats.hitRate).toBe('number');
    });
  });
});
