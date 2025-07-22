
// Performance Metrics API
// Phase 1D: Real-time performance monitoring

import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/middleware/performance';
import { cacheManager } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');
    
    // Get performance metrics
    const metrics = PerformanceMonitor.getMetrics(endpoint || undefined);
    
    // Get cache statistics
    const cacheStats = await cacheManager.getCacheStats();
    
    const responseTime = Date.now() - startTime;
    
    const performanceData = {
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      apiMetrics: metrics,
      cacheStats: cacheStats,
      systemMetrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };
    
    const response = NextResponse.json(performanceData);
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics', details: error.message },
      { status: 500 }
    );
  }
}
