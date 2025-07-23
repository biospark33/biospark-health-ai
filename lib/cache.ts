
// Redis Caching Layer for Performance Optimization
// Enhanced with robust error handling and fallback mechanisms

import Redis from 'ioredis';

class CacheManager {
  private redis: Redis | null = null;
  private isConnected: boolean = false;
  private connectionAttempted: boolean = false;

  constructor() {
    // Don't initialize Redis immediately to prevent build-time errors
    // Initialize only when first used
  }

  private async initializeRedis() {
    if (this.connectionAttempted) {
      return;
    }

    this.connectionAttempted = true;

    try {
      // Validate Redis URL before attempting connection
      const redisUrl = process.env.REDIS_URL;
      
      if (!redisUrl || redisUrl.includes('hostname') || redisUrl.includes('username:password')) {
        console.warn('⚠️ Redis URL not configured or contains placeholder values. Caching disabled.');
        return;
      }

      // Use local Redis for development, Redis Cloud for production
      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
        // Graceful error handling
        retryDelayOnClusterDown: 300,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.warn('⚠️ Redis connection error (caching disabled):', err.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.warn('⚠️ Redis connection closed');
        this.isConnected = false;
      });

      // Attempt connection with timeout
      await Promise.race([
        this.redis.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);

    } catch (error) {
      console.warn('⚠️ Failed to initialize Redis (caching disabled):', error instanceof Error ? error.message : 'Unknown error');
      this.redis = null;
      this.isConnected = false;
    }
  }

  private async ensureConnection(): Promise<boolean> {
    if (!this.connectionAttempted) {
      await this.initializeRedis();
    }
    return this.isConnected && this.redis !== null;
  }

  async setUserData(userId: string, userData: any, ttl: number = 3600): Promise<boolean> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      console.warn('⚠️ Redis not available, skipping cache set for user data');
      return false;
    }

    try {
      const key = `user:${userId}`;
      await this.redis.setex(key, ttl, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache user data:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getUserData(userId: string): Promise<any | null> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      return null;
    }

    try {
      const key = `user:${userId}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached user data:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async setAnalysisResult(analysisId: string, analysis: any, ttl: number = 7200): Promise<boolean> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      console.warn('⚠️ Redis not available, skipping cache set for analysis');
      return false;
    }

    try {
      const key = `analysis:${analysisId}`;
      await this.redis.setex(key, ttl, JSON.stringify(analysis));
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache analysis result:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getAnalysisResult(analysisId: string): Promise<any | null> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      return null;
    }

    try {
      const key = `analysis:${analysisId}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached analysis:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async setUserPermissions(userId: string, permissions: any, ttl: number = 1800): Promise<boolean> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      console.warn('⚠️ Redis not available, skipping cache set for permissions');
      return false;
    }

    try {
      const key = `permissions:${userId}`;
      await this.redis.setex(key, ttl, JSON.stringify(permissions));
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache user permissions:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getUserPermissions(userId: string): Promise<any | null> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      return null;
    }

    try {
      const key = `permissions:${userId}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached permissions:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async setAssessmentData(assessmentId: string, assessment: any, ttl: number = 3600): Promise<boolean> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      console.warn('⚠️ Redis not available, skipping cache set for assessment');
      return false;
    }

    try {
      const key = `assessment:${assessmentId}`;
      await this.redis.setex(key, ttl, JSON.stringify(assessment));
      return true;
    } catch (error) {
      console.warn('⚠️ Failed to cache assessment data:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getAssessmentData(assessmentId: string): Promise<any | null> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      return null;
    }

    try {
      const key = `assessment:${assessmentId}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached assessment:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async invalidateUserCache(userId: string): Promise<boolean> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      return false;
    }

    try {
      const patterns = [
        `user:${userId}`,
        `permissions:${userId}`,
        `analysis:${userId}:*`,
        `assessment:${userId}:*`
      ];

      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Failed to invalidate user cache:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async getStats(): Promise<any | null> {
    const isConnected = await this.ensureConnection();
    if (!isConnected || !this.redis) {
      return null;
    }

    try {
      const info = await this.redis.info('stats');
      return {
        connected: this.isConnected,
        info: info
      };
    } catch (error) {
      console.warn('⚠️ Failed to get Redis stats:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
        console.log('✅ Redis connection closed gracefully');
      } catch (error) {
        console.warn('⚠️ Error during Redis disconnect:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
export default cacheManager;
