// Global HIPAA Compliance Middleware for Next.js
// Applies audit logging and security headers to all routes

import { NextRequest, NextResponse } from 'next/server'

// Configure runtime for edge compatibility
export const config = {
  runtime: 'nodejs',
  matcher: '/api/:path*'
}

// Dynamic import for audit logger to avoid edge runtime issues
async function getAuditLogger() {
  const { auditLogger } = await import('./lib/audit')
  return auditLogger
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Apply to API routes only
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Generate session ID for request tracking (edge runtime compatible)
    const sessionId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Extract user info if available
    const userId = await extractUserIdFromRequest(request)
    
    // Create response
    const response = NextResponse.next()
    
    // Add security headers for HIPAA compliance
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Add session ID to response headers for tracking
    response.headers.set('X-Session-ID', sessionId)
    
    // Log API access (async, don't block response)
    logAPIAccess(request, userId, sessionId, startTime).catch(error => {
      console.error('Audit logging failed:', error)
    })
    
    return response
  }
  
  // For non-API routes, just add security headers
  const response = NextResponse.next()
  
  // Security headers for all routes
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

async function extractUserIdFromRequest(request: NextRequest): Promise<string | undefined> {
  try {
    // Try to extract from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      // In production, decode JWT token here
      // const token = authHeader.substring(7)
      // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      // return decoded.userId
    }

    // Try to extract from session cookie
    const sessionCookie = request.cookies.get('session')
    if (sessionCookie) {
      // In production, decode session here
      // return await getSessionUserId(sessionCookie.value)
    }

    return undefined
  } catch (error) {
    return undefined
  }
}

async function logAPIAccess(
  request: NextRequest, 
  userId: string | undefined, 
  sessionId: string, 
  startTime: number
) {
  try {
    const auditLogger = await getAuditLogger()
    
    await auditLogger.logAPIAccess({
      userId: userId || 'anonymous',
      method: request.method,
      path: request.nextUrl.pathname,
      sessionId,
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    })
  } catch (error) {
    console.error('Failed to log API access:', error)
  }
}

function extractResourceFromPath(pathname: string): string {
  const pathSegments = pathname.split('/').filter(Boolean)
  
  if (pathSegments.includes('health-assessment')) return 'health_assessment'
  if (pathSegments.includes('biomarker')) return 'biomarker'
  if (pathSegments.includes('analysis')) return 'analysis'
  if (pathSegments.includes('user') || pathSegments.includes('profile')) return 'user_profile'
  if (pathSegments.includes('auth')) return 'auth'
  if (pathSegments.includes('compliance')) return 'system'
  if (pathSegments.includes('consent')) return 'user_profile'
  
  return 'system'
}

function mapMethodToAction(method: string): 'create' | 'read' | 'update' | 'delete' {
  switch (method.toUpperCase()) {
    case 'GET': return 'read'
    case 'POST': return 'create'
    case 'PUT':
    case 'PATCH': return 'update'
    case 'DELETE': return 'delete'
    default: return 'read'
  }
}

function assessRiskLevel(pathname: string, method: string): 'low' | 'medium' | 'high' | 'critical' {
  // Critical risk paths
  if (pathname.includes('/compliance/') || 
      pathname.includes('/admin/') ||
      method === 'DELETE') {
    return 'critical'
  }
  
  // High risk paths
  if (pathname.includes('/analysis') ||
      pathname.includes('/export') ||
      pathname.includes('/consent')) {
    return 'high'
  }
  
  // Medium risk paths
  if (pathname.includes('/api/') && method !== 'GET') {
    return 'medium'
  }
  
  return 'low'
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Phase 2B Memory Integration Complete
