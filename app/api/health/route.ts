
// Optimized Health Check API with Performance Monitoring
// Phase 1D: Fast health check endpoint

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-optimized';
import { cacheManager } from '@/lib/cache';
import { PerformanceMonitor } from '@/middleware/performance';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Quick health checks
    const [dbHealth, cacheHealth] = await Promise.all([
      checkDatabaseHealth(),
      cacheManager.getCacheStats()
    ]);
    
    const responseTime = Date.now() - startTime;
    PerformanceMonitor.recordResponseTime('/api/health', responseTime);
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        cache: cacheHealth ? 'connected' : 'disconnected',
        api: 'operational'
      },
      performance: {
        responseTime: `${responseTime}ms`,
        uptime: process.uptime()
      }
    };
    
    const response = NextResponse.json(healthStatus);
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    PerformanceMonitor.recordResponseTime('/api/health', responseTime);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      },
      { status: 503 }
    );
  }
}
