
// HIPAA Audit Middleware for Next.js API Routes
// Automatic audit logging for all health data operations

import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '../lib/audit'
import { generateSecureToken } from '../lib/crypto'

export interface AuditContext {
  userId?: string
  sessionId: string
  startTime: number
}

/**
 * HIPAA Audit Middleware for API Routes
 */
export function withHIPAAAudit(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    const sessionId = generateSecureToken(16)
    
    // Extract user context from request
    const userId = await extractUserIdFromRequest(req)
    
    // Create audit context
    const auditContext: AuditContext = {
      userId,
      sessionId,
      startTime
    }

    // Add audit context to request
    (req as any).auditContext = auditContext

    let response: NextResponse
    let success = true
    let errorMessage: string | undefined

    try {
      // Execute the original handler
      response = await handler(req, ...args)
      
      // Check if response indicates an error
      if (response.status >= 400) {
        success = false
        errorMessage = `HTTP ${response.status}`
      }

    } catch (error) {
      success = false
      errorMessage = error.message
      
      // Create error response
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Log the API call
    try {
      await auditLogger.logEvent({
        userId,
        sessionId,
        eventType: 'data_access',
        resource: extractResourceFromPath(req.nextUrl.pathname),
        action: mapMethodToAction(req.method),
        ipAddress: getClientIP(req),
        userAgent: req.headers.get('user-agent') || undefined,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        success,
        errorMessage,
        dataAccessed: {
          responseTime: Date.now() - startTime,
          statusCode: response.status
        }
      })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
      // In production, this should trigger an alert
    }

    return response
  }
}

/**
 * Extract user ID from request (from session, JWT, etc.)
 */
async function extractUserIdFromRequest(req: NextRequest): Promise<string | undefined> {
  try {
    // Try to get from Authorization header
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      // In production, decode JWT token here
      // const token = authHeader.substring(7)
      // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      // return decoded.userId
    }

    // Try to get from session cookie
    const sessionCookie = req.cookies.get('session')
    if (sessionCookie) {
      // In production, decode session here
      // return await getSessionUserId(sessionCookie.value)
    }

    return undefined
  } catch (error) {
    console.error('Failed to extract user ID:', error)
    return undefined
  }
}

/**
 * Extract resource type from API path
 */
function extractResourceFromPath(pathname: string): string {
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Map API paths to resources
  if (pathSegments.includes('health-assessment')) return 'health_assessment'
  if (pathSegments.includes('biomarker')) return 'biomarker'
  if (pathSegments.includes('analysis')) return 'analysis'
  if (pathSegments.includes('user') || pathSegments.includes('profile')) return 'user_profile'
  if (pathSegments.includes('auth')) return 'auth'
  if (pathSegments.includes('admin')) return 'system'
  
  return 'system'
}

/**
 * Map HTTP method to audit action
 */
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

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Middleware for specific health data operations
 */
export const auditHealthDataAccess = (
  resource: string,
  resourceId: string,
  action: 'read' | 'write' | 'delete',
  dataAccessed?: any,
  changes?: any
) => {
  return async (req: NextRequest) => {
    const auditContext = (req as any).auditContext as AuditContext
    
    if (auditContext?.userId) {
      await auditLogger.logDataAccess(
        auditContext.userId,
        resource,
        resourceId,
        action,
        req,
        dataAccessed,
        changes
      )
    }
  }
}

/**
 * Middleware for analysis requests
 */
export const auditAnalysisRequest = (analysisType: string) => {
  return async (req: NextRequest, success: boolean = true, error?: string) => {
    const auditContext = (req as any).auditContext as AuditContext
    
    if (auditContext?.userId) {
      await auditLogger.logAnalysisRequest(
        auditContext.userId,
        analysisType,
        req,
        success,
        error
      )
    }
  }
}

/**
 * Middleware for data exports
 */
export const auditDataExport = (exportType: string, resourceIds: string[]) => {
  return async (req: NextRequest, success: boolean = true) => {
    const auditContext = (req as any).auditContext as AuditContext
    
    if (auditContext?.userId) {
      await auditLogger.logDataExport(
        auditContext.userId,
        exportType,
        resourceIds,
        req,
        success
      )
    }
  }
}

// Export middleware wrapper
export default withHIPAAAudit
