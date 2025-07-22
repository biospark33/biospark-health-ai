
'use client'

// Role-Based Access Control UI Component
// Conditionally render components based on user roles and permissions

import React from 'react'
import { UserRole, Permission } from '../../lib/rbac'

interface UserContext {
  userId: string
  roles: UserRole[]
  permissions: Permission[]
}

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: Permission
  requiredRoles?: UserRole[]
  requiredPermissions?: Permission[]
  fallback?: React.ReactNode
  userContext?: UserContext
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
  userContext
}: RoleGuardProps) {
  // Mock user context for development - in production, get from auth context
  const mockUserContext: UserContext = userContext || {
    userId: 'user-123',
    roles: [UserRole.PATIENT],
    permissions: [Permission.READ_OWN_DATA, Permission.WRITE_OWN_DATA]
  }

  // Check single role requirement
  if (requiredRole && !mockUserContext.roles.includes(requiredRole)) {
    return <>{fallback}</>
  }

  // Check single permission requirement
  if (requiredPermission && !mockUserContext.permissions.includes(requiredPermission)) {
    return <>{fallback}</>
  }

  // Check multiple roles (user must have at least one)
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      mockUserContext.roles.includes(role)
    )
    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  // Check multiple permissions (user must have at least one)
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      mockUserContext.permissions.includes(permission)
    )
    if (!hasRequiredPermission) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRole={UserRole.ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function HealthcareProviderOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRole={UserRole.HEALTHCARE_PROVIDER} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AuditorOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <RoleGuard requiredRole={UserRole.AUDITOR} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function RequirePermission({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: Permission, 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) {
  return (
    <RoleGuard requiredPermission={permission} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

// Hook for accessing user context in components
export function useUserContext(): UserContext {
  // In production, this would get user context from auth provider
  return {
    userId: 'user-123',
    roles: [UserRole.PATIENT],
    permissions: [Permission.READ_OWN_DATA, Permission.WRITE_OWN_DATA]
  }
}

// Utility functions for role checking
export function hasRole(userContext: UserContext, role: UserRole): boolean {
  return userContext.roles.includes(role)
}

export function hasPermission(userContext: UserContext, permission: Permission): boolean {
  return userContext.permissions.includes(permission)
}

export function hasAnyRole(userContext: UserContext, roles: UserRole[]): boolean {
  return roles.some(role => userContext.roles.includes(role))
}

export function hasAnyPermission(userContext: UserContext, permissions: Permission[]): boolean {
  return permissions.some(permission => userContext.permissions.includes(permission))
}

export function isAdmin(userContext: UserContext): boolean {
  return hasRole(userContext, UserRole.ADMIN) || 
         hasPermission(userContext, Permission.SYSTEM_ADMIN)
}

export function canViewAuditLogs(userContext: UserContext): boolean {
  return hasPermission(userContext, Permission.VIEW_AUDIT_LOGS)
}

export function canManageUsers(userContext: UserContext): boolean {
  return hasPermission(userContext, Permission.MANAGE_USERS)
}
