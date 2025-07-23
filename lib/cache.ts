
// Redis Caching Layer for Performance Optimization
// BMAD Optimized: Enhanced Redis client with improved error handling

import { getRedisClient, safeRedisGet, safeRedisSet, safeRedisDel, checkRedisHealth } from './redis-optimized';

class CacheManager {
  private redis: any = null;
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.redis = getRedisClient();
      this.isConnected = await checkRedisHealth();
      
      if (this.isConnected) {
        console.log('✅ Cache Manager: Redis connected successfully');
      } else {
        console.warn('⚠️ Cache Manager: Redis connection failed, operating in fallback mode');
      }
    } catch (error) {
      console.error('❌ Cache Manager: Failed to initialize Redis:', error);
      this.redis = null;
      this.isConnected = false;
    }
  }

  // Cache user data for frequent lookups
  async cacheUser(userId: string, userData: any, ttl: number = 3600) {
    const key = `user:${userId}`;
    const success = await safeRedisSet(key, JSON.stringify(userData), ttl);
    return success;
  }

  async getCachedUser(userId: string) {
    const key = `user:${userId}`;
    const cached = await safeRedisGet(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache biomarker analysis results
  async cacheBiomarkerAnalysis(userId: string, biomarkerHash: string, analysis: any, ttl: number = 7200) {
    const key = `analysis:${userId}:${biomarkerHash}`;
    const success = await safeRedisSet(key, JSON.stringify(analysis), ttl);
    return success;
  }

  async getCachedBiomarkerAnalysis(userId: string, biomarkerHash: string) {
    const key = `analysis:${userId}:${biomarkerHash}`;
    const cached = await safeRedisGet(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache user permissions for RBAC
  async cacheUserPermissions(userId: string, permissions: any, ttl: number = 1800) {
    const key = `permissions:${userId}`;
    const success = await safeRedisSet(key, JSON.stringify(permissions), ttl);
    return success;
  }

  async getCachedUserPermissions(userId: string) {
    const key = `permissions:${userId}`;
    const cached = await safeRedisGet(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache health assessment results
  async cacheHealthAssessment(assessmentId: string, assessment: any, ttl: number = 3600) {
    const key = `assessment:${assessmentId}`;
    const success = await safeRedisSet(key, JSON.stringify(assessment), ttl);
    return success;
  }

  async getCachedHealthAssessment(assessmentId: string) {
    const key = `assessment:${assessmentId}`;
    const cached = await safeRedisGet(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Invalidate cache patterns
  async invalidateUserCache(userId: string) {
    try {
      const keys = [
        `user:${userId}`,
        `permissions:${userId}`
      ];
      
      for (const key of keys) {
        await safeRedisDel(key);
      }
      
      // Note: Pattern matching for analysis keys would require direct Redis access
      // This is a simplified version for the optimized client
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  // Performance monitoring
  async getCacheStats() {
    const isHealthy = await checkRedisHealth();
    return {
      connected: isHealthy,
      redis_optimized: true,
      cache_manager_version: "BMAD_Optimized_v1.0"
    };
  }
}

export const cacheManager = new CacheManager();
