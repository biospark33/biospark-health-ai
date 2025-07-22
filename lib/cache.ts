
// Redis Caching Layer for Performance Optimization
// Phase 1D: Implement caching for frequent operations

import Redis from 'ioredis';

class CacheManager {
  private redis: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Use local Redis for development, Redis Cloud for production
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.isConnected = false;
      });

      await this.redis.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  // Cache user data for frequent lookups
  async cacheUser(userId: string, userData: any, ttl: number = 3600) {
    if (!this.redis || !this.isConnected) return false;
    
    try {
      const key = `user:${userId}`;
      await this.redis.setex(key, ttl, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async getCachedUser(userId: string) {
    if (!this.redis || !this.isConnected) return null;
    
    try {
      const key = `user:${userId}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Cache biomarker analysis results
  async cacheBiomarkerAnalysis(userId: string, biomarkerHash: string, analysis: any, ttl: number = 7200) {
    if (!this.redis || !this.isConnected) return false;
    
    try {
      const key = `analysis:${userId}:${biomarkerHash}`;
      await this.redis.setex(key, ttl, JSON.stringify(analysis));
      return true;
    } catch (error) {
      console.error('Cache analysis error:', error);
      return false;
    }
  }

  async getCachedBiomarkerAnalysis(userId: string, biomarkerHash: string) {
    if (!this.redis || !this.isConnected) return null;
    
    try {
      const key = `analysis:${userId}:${biomarkerHash}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get analysis error:', error);
      return null;
    }
  }

  // Cache user permissions for RBAC
  async cacheUserPermissions(userId: string, permissions: any, ttl: number = 1800) {
    if (!this.redis || !this.isConnected) return false;
    
    try {
      const key = `permissions:${userId}`;
      await this.redis.setex(key, ttl, JSON.stringify(permissions));
      return true;
    } catch (error) {
      console.error('Cache permissions error:', error);
      return false;
    }
  }

  async getCachedUserPermissions(userId: string) {
    if (!this.redis || !this.isConnected) return null;
    
    try {
      const key = `permissions:${userId}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get permissions error:', error);
      return null;
    }
  }

  // Cache health assessment results
  async cacheHealthAssessment(assessmentId: string, assessment: any, ttl: number = 3600) {
    if (!this.redis || !this.isConnected) return false;
    
    try {
      const key = `assessment:${assessmentId}`;
      await this.redis.setex(key, ttl, JSON.stringify(assessment));
      return true;
    } catch (error) {
      console.error('Cache assessment error:', error);
      return false;
    }
  }

  async getCachedHealthAssessment(assessmentId: string) {
    if (!this.redis || !this.isConnected) return null;
    
    try {
      const key = `assessment:${assessmentId}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get assessment error:', error);
      return null;
    }
  }

  // Invalidate cache patterns
  async invalidateUserCache(userId: string) {
    if (!this.redis || !this.isConnected) return false;
    
    try {
      const patterns = [
        `user:${userId}`,
        `analysis:${userId}:*`,
        `permissions:${userId}`,
        `assessment:*:${userId}`
      ];
      
      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  // Performance monitoring
  async getCacheStats() {
    if (!this.redis || !this.isConnected) return null;
    
    try {
      const info = await this.redis.info('stats');
      return {
        connected: this.isConnected,
        info: info
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
}

export const cacheManager = new CacheManager();
