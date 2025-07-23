
// In-Memory Caching Layer for Performance Optimization
// Phase 1D: Lightweight caching without external dependencies

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiry;
  }

  // Cache user data for frequent lookups
  async cacheUser(userId: string, userData: any, ttl: number = 3600): Promise<boolean> {
    try {
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(`user:${userId}`, { data: userData, expiry });
      return true;
    } catch (error) {
      console.error('Failed to cache user data:', error);
      return false;
    }
  }

  async getUser(userId: string): Promise<any | null> {
    try {
      const item = this.cache.get(`user:${userId}`);
      if (!item || this.isExpired(item)) {
        this.cache.delete(`user:${userId}`);
        return null;
      }
      return item.data;
    } catch (error) {
      console.error('Failed to get cached user:', error);
      return null;
    }
  }

  // Cache analysis results
  async cacheAnalysis(analysisId: string, analysis: any, ttl: number = 1800): Promise<boolean> {
    try {
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(`analysis:${analysisId}`, { data: analysis, expiry });
      return true;
    } catch (error) {
      console.error('Failed to cache analysis:', error);
      return false;
    }
  }

  async getAnalysis(analysisId: string): Promise<any | null> {
    try {
      const item = this.cache.get(`analysis:${analysisId}`);
      if (!item || this.isExpired(item)) {
        this.cache.delete(`analysis:${analysisId}`);
        return null;
      }
      return item.data;
    } catch (error) {
      console.error('Failed to get cached analysis:', error);
      return null;
    }
  }

  // Cache user permissions
  async cachePermissions(userId: string, permissions: any, ttl: number = 3600): Promise<boolean> {
    try {
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(`permissions:${userId}`, { data: permissions, expiry });
      return true;
    } catch (error) {
      console.error('Failed to cache permissions:', error);
      return false;
    }
  }

  async getPermissions(userId: string): Promise<any | null> {
    try {
      const item = this.cache.get(`permissions:${userId}`);
      if (!item || this.isExpired(item)) {
        this.cache.delete(`permissions:${userId}`);
        return null;
      }
      return item.data;
    } catch (error) {
      console.error('Failed to get cached permissions:', error);
      return null;
    }
  }

  // Cache health assessments
  async cacheAssessment(assessmentId: string, assessment: any, ttl: number = 7200): Promise<boolean> {
    try {
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(`assessment:${assessmentId}`, { data: assessment, expiry });
      return true;
    } catch (error) {
      console.error('Failed to cache assessment:', error);
      return false;
    }
  }

  async getAssessment(assessmentId: string): Promise<any | null> {
    try {
      const item = this.cache.get(`assessment:${assessmentId}`);
      if (!item || this.isExpired(item)) {
        this.cache.delete(`assessment:${assessmentId}`);
        return null;
      }
      return item.data;
    } catch (error) {
      console.error('Failed to get cached assessment:', error);
      return null;
    }
  }

  // Clear cache by pattern
  async clearCache(pattern: string): Promise<boolean> {
    try {
      const keysToDelete: string[] = [];
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        this.cache.delete(key);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<any | null> {
    try {
      const now = Date.now();
      let activeItems = 0;
      let expiredItems = 0;
      
      for (const item of this.cache.values()) {
        if (now > item.expiry) {
          expiredItems++;
        } else {
          activeItems++;
        }
      }
      
      return {
        totalItems: this.cache.size,
        activeItems,
        expiredItems,
        memoryUsage: process.memoryUsage()
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  // Cleanup method for graceful shutdown
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Graceful shutdown cleanup
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    cacheManager.destroy();
  });
  
  process.on('SIGINT', () => {
    cacheManager.destroy();
  });
}
