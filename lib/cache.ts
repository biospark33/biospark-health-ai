
/**
 * Simple In-Memory Cache Manager
 * Lightweight caching without external dependencies
 * Replaces Redis-based caching with memory-based solution
 */

interface CacheItem {
  data: any;
  expiry: number;
}

class InMemoryCacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval to remove expired items
    this.startCleanup();
  }

  private startCleanup(): void {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiry;
  }

  async setUserData(userId: string, userData: any, ttl: number = 3600): Promise<boolean> {
    try {
      const key = `user:${userId}`;
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { data: userData, expiry });
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache user data:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getUserData(userId: string): Promise<any | null> {
    try {
      const key = `user:${userId}`;
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }
      
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached user data:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async setAnalysisResult(analysisId: string, analysis: any, ttl: number = 7200): Promise<boolean> {
    try {
      const key = `analysis:${analysisId}`;
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { data: analysis, expiry });
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache analysis result:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getAnalysisResult(analysisId: string): Promise<any | null> {
    try {
      const key = `analysis:${analysisId}`;
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }
      
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached analysis:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async setUserPermissions(userId: string, permissions: any, ttl: number = 1800): Promise<boolean> {
    try {
      const key = `permissions:${userId}`;
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { data: permissions, expiry });
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache user permissions:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getUserPermissions(userId: string): Promise<any | null> {
    try {
      const key = `permissions:${userId}`;
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }
      
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached permissions:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async setAssessmentData(assessmentId: string, assessment: any, ttl: number = 3600): Promise<boolean> {
    try {
      const key = `assessment:${assessmentId}`;
      const expiry = Date.now() + (ttl * 1000);
      this.cache.set(key, { data: assessment, expiry });
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache assessment data:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getAssessmentData(assessmentId: string): Promise<any | null> {
    try {
      const key = `assessment:${assessmentId}`;
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }
      
      if (this.isExpired(item)) {
        this.cache.delete(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached assessment:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async invalidateUserCache(userId: string): Promise<boolean> {
    try {
      const patterns = [
        `user:${userId}`,
        `permissions:${userId}`,
        `analysis:${userId}:`,
        `assessment:${userId}:`
      ];

      for (const [key] of this.cache.entries()) {
        for (const pattern of patterns) {
          if (key.startsWith(pattern)) {
            this.cache.delete(key);
          }
        }
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Failed to invalidate user cache:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getStats(): Promise<any | null> {
    try {
      return {
        connected: true,
        type: 'in-memory',
        size: this.cache.size,
        info: `In-memory cache with ${this.cache.size} items`
      };
    } catch (error) {
      console.warn('⚠️ Failed to get cache stats:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    console.log('✅ In-memory cache cleared');
  }
}

// Export singleton instance
export const cacheManager = new InMemoryCacheManager();
export default cacheManager;
