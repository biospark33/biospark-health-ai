
// RBAC Middleware for Next.js API Routes
// Role-based access control with HIPAA compliance

import { NextRequest, NextResponse } from 'next/server'
import { RBACManager, UserContext, UserRole, Permission } from '../lib/rbac'
import { auditLogger } from '../lib/audit'

export interface RBACOptions {
  requiredPermission?: Permission
  requiredRole?: UserRole
  resource?: string
  allowOwnerAccess?: boolean
  skipAudit?: boolean
}

/**
 * RBAC Middleware for API Route Protection
 */
export function withRBAC(options: RBACOptions) {
  return function(handler: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        // Extract user context from request
        const userContext = await extractUserContext(req)
        
        if (!userContext) {
          await logUnauthorizedAccess(req, 'No user context')
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Check role requirement
        if (options.requiredRole && !userContext.roles.includes(options.requiredRole)) {
          await logUnauthorizedAccess(req, `Missing required role: ${options.requiredRole}`, userContext.userId)
          return NextResponse.json(
            { error: 'Insufficient privileges' },
            { status: 403 }
          )
        }

        // Check permission requirement
        if (options.requiredPermission && !RBACManager.hasPermission(userContext, options.requiredPermission)) {
          await logUnauthorizedAccess(req, `Missing required permission: ${options.requiredPermission}`, userContext.userId)
          return NextResponse.json(
            { error: 'Insufficient privileges' },
            { status: 403 }
          )
        }

        // Check resource access if specified
        if (options.resource) {
          const resourceOwnerId = extractResourceOwnerId(req, args)
          const action = getActionFromMethod(req.method)
          
          if (!RBACManager.canAccessResource(userContext, options.resource, action, resourceOwnerId)) {
            await logUnauthorizedAccess(req, `Cannot ${action} ${options.resource}`, userContext.userId)
            return NextResponse.json(
              { error: 'Access denied to resource' },
              { status: 403 }
            )
          }
        }

        // Add user context to request for handler use
        (req as any).userContext = userContext

        // Execute handler
        const response = await handler(req, ...args)

        // Log successful access if not skipped
        if (!options.skipAudit) {
          await auditLogger.logEvent({
            userId: userContext.userId,
            sessionId: userContext.sessionId,
            eventType: 'data_access',
            resource: (options.resource as any) || 'system',
            action: getActionFromMethod(req.method),
            ipAddress: getClientIP(req),
            userAgent: req.headers.get('user-agent') || undefined,
            endpoint: req.nextUrl.pathname,
            method: req.method,
            success: true,
            riskLevel: 'low'
          })
        }

        return response

      } catch (error) {
        console.error('RBAC middleware error:', error)
        
        await auditLogger.logEvent({
          eventType: 'data_access',
          resource: 'system',
          action: 'read',
          ipAddress: getClientIP(req),
          endpoint: req.nextUrl.pathname,
          method: req.method,
          success: false,
          errorMessage: error.message,
          riskLevel: 'critical'
        })

        return NextResponse.json(
          { error: 'Access control error' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Extract user context from request
 */
async function extractUserContext(req: NextRequest): Promise<UserContext | null> {
  try {
    // In production, this would:
    // 1. Verify JWT token or session
    // 2. Query database for user roles and permissions
    // 3. Return complete user context

    // Mock implementation for development
    const authHeader = req.headers.get('authorization')
    const sessionCookie = req.cookies.get('session')
    
    if (!authHeader && !sessionCookie) {
      return null
    }

    // Mock user context - in production, extract from token/session
    return {
      userId: 'user-123', // Extract from token
      roles: [UserRole.PATIENT], // Query from database
      permissions: [Permission.READ_OWN_DATA, Permission.WRITE_OWN_DATA], // Derive from roles
      sessionId: 'session-123' // Extract from session
    }
  } catch (error) {
    console.error('Failed to extract user context:', error)
    return null
  }
}

/**
 * Extract resource owner ID from request
 */
function extractResourceOwnerId(req: NextRequest, args: any[]): string | undefined {
  // Try to get from URL parameters
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  
  // Look for userId in path or query parameters
  const userIdFromPath = pathSegments.find(segment => segment.startsWith('user-'))
  if (userIdFromPath) {
    return userIdFromPath
  }

  const userIdFromQuery = url.searchParams.get('userId')
  if (userIdFromQuery) {
    return userIdFromQuery
  }

  // Try to get from request body for POST/PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    // In production, parse request body to extract userId
    // const body = await req.json()
    // return body.userId
  }

  return undefined
}

/**
 * Map HTTP method to action
 */
function getActionFromMethod(method: string): 'read' | 'write' | 'delete' {
  switch (method.toUpperCase()) {
    case 'GET': return 'read'
    case 'POST': return 'write'
    case 'PUT':
    case 'PATCH': return 'write'
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
 * Log unauthorized access attempts
 */
async function logUnauthorizedAccess(req: NextRequest, reason: string, userId?: string): Promise<void> {
  await auditLogger.logEvent({
    userId,
    eventType: 'data_access',
    resource: 'system',
    action: 'read',
    ipAddress: getClientIP(req),
    userAgent: req.headers.get('user-agent') || undefined,
    endpoint: req.nextUrl.pathname,
    method: req.method,
    success: false,
    errorMessage: `Unauthorized access: ${reason}`,
    riskLevel: 'high'
  })
}

// Convenience functions for common RBAC patterns
export const requireAdmin = withRBAC({ requiredRole: UserRole.ADMIN })
export const requireHealthcareProvider = withRBAC({ requiredRole: UserRole.HEALTHCARE_PROVIDER })
export const requireAuditor = withRBAC({ requiredRole: UserRole.AUDITOR })

export const requirePermission = (permission: Permission) => 
  withRBAC({ requiredPermission: permission })

export const requireResourceAccess = (resource: string, allowOwnerAccess: boolean = true) =>
  withRBAC({ resource, allowOwnerAccess })

export const requireHealthDataAccess = withRBAC({
  resource: 'health_assessment',
  requiredPermission: Permission.READ_OWN_DATA,
  allowOwnerAccess: true
})

export const requireAnalysisAccess = withRBAC({
  resource: 'analysis',
  requiredPermission: Permission.READ_OWN_DATA,
  allowOwnerAccess: true
})

export const requireAuditAccess = withRBAC({
  requiredPermission: Permission.VIEW_AUDIT_LOGS,
  resource: 'audit_logs'
})
