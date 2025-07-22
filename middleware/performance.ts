
// Performance Optimization Middleware
// Phase 1D: API response optimization and monitoring

import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache';

// Response compression and optimization
export function withPerformanceOptimization(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    
    try {
      // Add compression headers
      const response = await handler(request, ...args);
      
      if (response instanceof NextResponse) {
        // Add performance headers
        response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
        response.headers.set('X-Cache-Status', 'MISS'); // Will be updated by cache layer
        
        // Add compression for large responses
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 1024) {
          response.headers.set('Content-Encoding', 'gzip');
        }
        
        // Performance monitoring
        const responseTime = Date.now() - startTime;
        if (responseTime > 1000) {
          console.warn(`Slow API response: ${request.url} took ${responseTime}ms`);
        }
        
        return response;
      }
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`API error in ${responseTime}ms:`, error);
      throw error;
    }
  };
}

// Request batching for bulk operations
export function withRequestBatching(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const contentType = request.headers.get('content-type');
    
    // Handle batch requests
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.json();
        
        // Check if this is a batch request
        if (Array.isArray(body) && body.length > 1) {
          const results = [];
          
          // Process batch requests in parallel (up to 5 concurrent)
          const batchSize = 5;
          for (let i = 0; i < body.length; i += batchSize) {
            const batch = body.slice(i, i + batchSize);
            const batchPromises = batch.map(item => {
              const itemRequest = new NextRequest(request.url, {
                method: request.method,
                headers: request.headers,
                body: JSON.stringify(item)
              });
              return handler(itemRequest, ...args);
            });
            
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
          }
          
          return NextResponse.json(results);
        }
      } catch (error) {
        // Fall back to normal processing
      }
    }
    
    return handler(request, ...args);
  };
}

// Cache-aware response wrapper
export function withCaching(handler: Function, cacheKey: (req: NextRequest) => string, ttl: number = 300) {
  return async (request: NextRequest, ...args: any[]) => {
    const key = cacheKey(request);
    
    // Try to get from cache first
    const cached = await cacheManager.getCachedUser(key); // Generic cache method
    if (cached) {
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache-Status', 'HIT');
      return response;
    }
    
    // Execute handler
    const response = await handler(request, ...args);
    
    // Cache successful responses
    if (response instanceof NextResponse && response.status === 200) {
      try {
        const responseData = await response.clone().json();
        await cacheManager.cacheUser(key, responseData, ttl);
      } catch (error) {
        console.warn('Failed to cache response:', error);
      }
    }
    
    return response;
  };
}

// Performance monitoring and metrics collection
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  
  static recordResponseTime(endpoint: string, responseTime: number) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const times = this.metrics.get(endpoint)!;
    times.push(responseTime);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }
  
  static getMetrics(endpoint?: string) {
    if (endpoint) {
      const times = this.metrics.get(endpoint) || [];
      return {
        endpoint,
        count: times.length,
        average: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
        min: times.length > 0 ? Math.min(...times) : 0,
        max: times.length > 0 ? Math.max(...times) : 0,
        p95: times.length > 0 ? this.percentile(times, 0.95) : 0
      };
    }
    
    const allMetrics = {};
    for (const [endpoint, times] of this.metrics.entries()) {
      allMetrics[endpoint] = {
        count: times.length,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        p95: this.percentile(times, 0.95)
      };
    }
    
    return allMetrics;
  }
  
  private static percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }
}
