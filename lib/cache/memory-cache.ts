
/**
 * Memory Caching System
 * Phase 2B - Performance Optimization for Memory Operations
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }

  /**
   * Generate cache key for memory operations
   */
  static generateKey(userId: string, operation: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `memory:${userId}:${operation}:${Buffer.from(paramString).toString('base64')}`;
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

/**
 * Cache wrapper for memory operations
 */
export async function withCache<T>(
  key: string,
  operation: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = memoryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute operation and cache result
  const result = await operation();
  memoryCache.set(key, result, ttl);
  
  return result;
}

/**
 * Cached memory search
 */
export function getCachedSearchKey(userId: string, query: string, filters?: Record<string, any>): string {
  return MemoryCache.generateKey(userId, 'search', { query, filters });
}

/**
 * Cached context retrieval
 */
export function getCachedContextKey(userId: string, sessionId: string, query: string): string {
  return MemoryCache.generateKey(userId, 'context', { sessionId, query });
}

/**
 * Cached preferences
 */
export function getCachedPreferencesKey(userId: string): string {
  return MemoryCache.generateKey(userId, 'preferences');
}
