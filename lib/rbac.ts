
// HIPAA-Compliant Role-Based Access Control (RBAC)
// Comprehensive permission system for health data protection

// Define enums locally to avoid Prisma client dependency issues
export enum UserRole {
  PATIENT = 'PATIENT',
  HEALTHCARE_PROVIDER = 'HEALTHCARE_PROVIDER',
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
  RESEARCHER = 'RESEARCHER'
}

export enum Permission {
  READ_OWN_DATA = 'READ_OWN_DATA',
  READ_ALL_DATA = 'READ_ALL_DATA',
  WRITE_OWN_DATA = 'WRITE_OWN_DATA',
  WRITE_ALL_DATA = 'WRITE_ALL_DATA',
  DELETE_OWN_DATA = 'DELETE_OWN_DATA',
  DELETE_ALL_DATA = 'DELETE_ALL_DATA',
  EXPORT_DATA = 'EXPORT_DATA',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

// Role hierarchy and default permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PATIENT: [
    Permission.READ_OWN_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.DELETE_OWN_DATA
  ],
  HEALTHCARE_PROVIDER: [
    Permission.READ_OWN_DATA,
    Permission.READ_ALL_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.WRITE_ALL_DATA,
    Permission.EXPORT_DATA
  ],
  ADMIN: [
    Permission.READ_OWN_DATA,
    Permission.READ_ALL_DATA,
    Permission.WRITE_OWN_DATA,
    Permission.WRITE_ALL_DATA,
    Permission.DELETE_OWN_DATA,
    Permission.DELETE_ALL_DATA,
    Permission.EXPORT_DATA,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS
  ],
  AUDITOR: [
    Permission.READ_ALL_DATA,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_DATA
  ],
  RESEARCHER: [
    Permission.READ_ALL_DATA,
    Permission.EXPORT_DATA
  ]
}

// Resource access patterns
export const RESOURCE_PERMISSIONS = {
  'health_assessment': {
    read: [Permission.READ_OWN_DATA, Permission.READ_ALL_DATA],
    write: [Permission.WRITE_OWN_DATA, Permission.WRITE_ALL_DATA],
    delete: [Permission.DELETE_OWN_DATA, Permission.DELETE_ALL_DATA]
  },
  'biomarker': {
    read: [Permission.READ_OWN_DATA, Permission.READ_ALL_DATA],
    write: [Permission.WRITE_OWN_DATA, Permission.WRITE_ALL_DATA],
    delete: [Permission.DELETE_OWN_DATA, Permission.DELETE_ALL_DATA]
  },
  'analysis': {
    read: [Permission.READ_OWN_DATA, Permission.READ_ALL_DATA],
    write: [Permission.WRITE_OWN_DATA, Permission.WRITE_ALL_DATA],
    delete: [Permission.DELETE_OWN_DATA, Permission.DELETE_ALL_DATA]
  },
  'user_profile': {
    read: [Permission.READ_OWN_DATA, Permission.READ_ALL_DATA],
    write: [Permission.WRITE_OWN_DATA, Permission.WRITE_ALL_DATA],
    delete: [Permission.DELETE_OWN_DATA, Permission.DELETE_ALL_DATA]
  },
  'audit_logs': {
    read: [Permission.VIEW_AUDIT_LOGS]
  },
  'system_admin': {
    read: [Permission.SYSTEM_ADMIN],
    write: [Permission.SYSTEM_ADMIN],
    delete: [Permission.SYSTEM_ADMIN]
  }
}

export interface UserContext {
  userId: string
  roles: UserRole[]
  permissions: Permission[]
  sessionId?: string
}

export class RBACManager {
  /**
   * Check if user has specific permission
   */
  static hasPermission(userContext: UserContext, permission: Permission): boolean {
    return userContext.permissions.includes(permission)
  }

  /**
   * Check if user can access resource with specific action
   */
  static canAccessResource(
    userContext: UserContext, 
    resource: string, 
    action: 'read' | 'write' | 'delete',
    resourceOwnerId?: string
  ): boolean {
    const resourcePerms = RESOURCE_PERMISSIONS[resource]
    if (!resourcePerms || !resourcePerms[action]) {
      return false
    }

    const requiredPermissions = resourcePerms[action]
    
    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(perm => 
      userContext.permissions.includes(perm)
    )

    if (!hasPermission) {
      return false
    }

    // For "own data" permissions, verify ownership
    if (resourceOwnerId && userContext.permissions.includes(Permission.READ_OWN_DATA)) {
      const hasOwnDataPerm = requiredPermissions.some(perm => 
        perm.toString().includes('OWN_DATA')
      )
      
      if (hasOwnDataPerm && resourceOwnerId !== userContext.userId) {
        // Check if user also has "all data" permission
        const hasAllDataPerm = requiredPermissions.some(perm => 
          perm.toString().includes('ALL_DATA') && userContext.permissions.includes(perm)
        )
        return hasAllDataPerm
      }
    }

    return true
  }

  /**
   * Get user permissions from roles
   */
  static getPermissionsFromRoles(roles: UserRole[]): Permission[] {
    const permissions = new Set<Permission>()
    
    roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || []
      rolePermissions.forEach(perm => permissions.add(perm))
    })
    
    return Array.from(permissions)
  }

  /**
   * Check if user has administrative privileges
   */
  static isAdmin(userContext: UserContext): boolean {
    return userContext.roles.includes(UserRole.ADMIN) ||
           userContext.permissions.includes(Permission.SYSTEM_ADMIN)
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(userContext: UserContext): boolean {
    return userContext.permissions.includes(Permission.MANAGE_USERS)
  }

  /**
   * Check if user can view audit logs
   */
  static canViewAuditLogs(userContext: UserContext): boolean {
    return userContext.permissions.includes(Permission.VIEW_AUDIT_LOGS)
  }

  /**
   * Filter data based on user permissions
   */
  static filterDataByPermissions<T extends { userId?: string }>(
    userContext: UserContext,
    data: T[],
    resource: string
  ): T[] {
    if (this.canAccessResource(userContext, resource, 'read')) {
      // If user has READ_ALL_DATA permission, return all data
      if (userContext.permissions.includes(Permission.READ_ALL_DATA)) {
        return data
      }
      
      // If user has READ_OWN_DATA permission, filter to own data
      if (userContext.permissions.includes(Permission.READ_OWN_DATA)) {
        return data.filter(item => item.userId === userContext.userId)
      }
    }
    
    return []
  }

  /**
   * Create RBAC middleware for API routes
   */
  static createMiddleware(requiredPermission: Permission, resource?: string) {
    return (userContext: UserContext, resourceOwnerId?: string) => {
      if (!this.hasPermission(userContext, requiredPermission)) {
        throw new Error(`Access denied: Missing permission ${requiredPermission}`)
      }

      if (resource && resourceOwnerId) {
        const action = this.getActionFromPermission(requiredPermission)
        if (!this.canAccessResource(userContext, resource, action, resourceOwnerId)) {
          throw new Error(`Access denied: Cannot ${action} ${resource}`)
        }
      }

      return true
    }
  }

  /**
   * Extract action from permission
   */
  private static getActionFromPermission(permission: Permission): 'read' | 'write' | 'delete' {
    if (permission.toString().includes('READ')) return 'read'
    if (permission.toString().includes('DELETE')) return 'delete'
    return 'write'
  }

  /**
   * Validate role assignment
   */
  static canAssignRole(assignerContext: UserContext, targetRole: UserRole): boolean {
    // Only admins can assign roles
    if (!this.isAdmin(assignerContext)) {
      return false
    }

    // System admin can assign any role
    if (assignerContext.permissions.includes(Permission.SYSTEM_ADMIN)) {
      return true
    }

    // Regular admin cannot assign admin or system roles
    const restrictedRoles = [UserRole.ADMIN, UserRole.AUDITOR]
    return !restrictedRoles.includes(targetRole)
  }
}

// Utility functions for common RBAC operations
export const hasPermission = (userContext: UserContext, permission: Permission) =>
  RBACManager.hasPermission(userContext, permission)

export const canAccessResource = (
  userContext: UserContext, 
  resource: string, 
  action: 'read' | 'write' | 'delete',
  resourceOwnerId?: string
) => RBACManager.canAccessResource(userContext, resource, action, resourceOwnerId)

export const isAdmin = (userContext: UserContext) => RBACManager.isAdmin(userContext)

export const filterByPermissions = <T extends { userId?: string }>(
  userContext: UserContext,
  data: T[],
  resource: string
) => RBACManager.filterDataByPermissions(userContext, data, resource)
