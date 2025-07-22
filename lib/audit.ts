
// HIPAA-Compliant Audit Logging System
// Comprehensive audit trail for all health data operations

import crypto from 'crypto'
import { hashForAudit } from './crypto'

export interface AuditEvent {
  userId?: string
  sessionId?: string
  eventType: 'login' | 'logout' | 'data_access' | 'analysis_request' | 'export' | 'delete' | 'create' | 'update'
  resource: 'health_assessment' | 'biomarker' | 'analysis' | 'user_profile' | 'system' | 'auth'
  resourceId?: string
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'logout'
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  dataAccessed?: any
  changes?: any
  success?: boolean
  errorMessage?: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditLogEntry extends AuditEvent {
  id: string
  timestamp: Date
  contentHash: string
  createdAt: Date
}

class AuditLogger {
  private generateContentHash(event: AuditEvent): string {
    const content = JSON.stringify({
      userId: event.userId,
      eventType: event.eventType,
      resource: event.resource,
      resourceId: event.resourceId,
      action: event.action,
      timestamp: new Date().toISOString(),
      success: event.success ?? true
    })
    
    return hashForAudit(content)
  }

  private assessRiskLevel(event: AuditEvent): 'low' | 'medium' | 'high' | 'critical' {
    // Critical risk events
    if (event.eventType === 'delete' || 
        event.action === 'delete' ||
        event.errorMessage?.includes('unauthorized') ||
        event.errorMessage?.includes('breach')) {
      return 'critical'
    }

    // High risk events
    if (event.eventType === 'export' ||
        event.resource === 'system' ||
        event.action === 'update' && event.resource === 'user_profile') {
      return 'high'
    }

    // Medium risk events
    if (event.eventType === 'data_access' ||
        event.action === 'read' && event.resource !== 'user_profile') {
      return 'medium'
    }

    // Low risk events (login, basic operations)
    return 'low'
  }

  private sanitizeDataForLogging(data: any): any {
    if (!data) return null

    // Remove sensitive fields but keep structure for audit
    const sanitized = { ...data }
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'ssn', 'dob']
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj
      
      const result = Array.isArray(obj) ? [] : {}
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]'
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value)
        } else {
          result[key] = value
        }
      }
      
      return result
    }

    return sanitizeObject(sanitized)
  }

  /**
   * Log audit event to database
   */
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      const riskLevel = event.riskLevel || this.assessRiskLevel(event)
      const contentHash = this.generateContentHash(event)
      const timestamp = new Date()

      const auditEntry: Omit<AuditLogEntry, 'id' | 'createdAt'> = {
        ...event,
        timestamp,
        contentHash,
        riskLevel,
        success: event.success ?? true,
        dataAccessed: this.sanitizeDataForLogging(event.dataAccessed),
        changes: this.sanitizeDataForLogging(event.changes)
      }

      // In a real implementation, this would save to database
      // For now, we'll log to console and file system
      console.log(`[AUDIT] ${JSON.stringify(auditEntry)}`)
      
      // Also write to audit log file for backup
      const logLine = `${timestamp.toISOString()} | ${event.eventType} | ${event.resource} | ${event.action} | ${event.userId || 'anonymous'} | ${riskLevel}\n`
      
      // Note: In production, this should be written to a secure, append-only log file
      // require('fs').appendFileSync('/var/log/hipaa-audit.log', logLine)
      
    } catch (error) {
      console.error('Audit logging failed:', error)
      // Critical: Audit logging failure should be escalated
      throw new Error(`Audit logging failure: ${error.message}`)
    }
  }

  /**
   * Log user authentication events
   */
  async logAuth(userId: string, action: 'login' | 'logout', request: any, success: boolean = true, error?: string): Promise<void> {
    await this.logEvent({
      userId,
      sessionId: request.sessionId,
      eventType: action,
      resource: 'auth',
      action,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers?.['user-agent'],
      endpoint: request.url,
      method: request.method,
      success,
      errorMessage: error,
      riskLevel: success ? 'low' : 'high'
    })
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    userId: string, 
    resource: string, 
    resourceId: string, 
    action: 'read' | 'write' | 'delete',
    request: any,
    dataAccessed?: any,
    changes?: any
  ): Promise<void> {
    await this.logEvent({
      userId,
      sessionId: request.sessionId,
      eventType: 'data_access',
      resource: resource as any,
      resourceId,
      action,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers?.['user-agent'],
      endpoint: request.url,
      method: request.method,
      dataAccessed,
      changes
    })
  }

  /**
   * Log health analysis requests
   */
  async logAnalysisRequest(
    userId: string,
    analysisType: string,
    request: any,
    success: boolean = true,
    error?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      sessionId: request.sessionId,
      eventType: 'analysis_request',
      resource: 'analysis',
      action: 'create',
      ipAddress: this.getClientIP(request),
      userAgent: request.headers?.['user-agent'],
      endpoint: request.url,
      method: request.method,
      dataAccessed: { analysisType },
      success,
      errorMessage: error,
      riskLevel: success ? 'medium' : 'high'
    })
  }

  /**
   * Log data export events
   */
  async logDataExport(
    userId: string,
    exportType: string,
    resourceIds: string[],
    request: any,
    success: boolean = true
  ): Promise<void> {
    await this.logEvent({
      userId,
      sessionId: request.sessionId,
      eventType: 'export',
      resource: 'analysis',
      action: 'export',
      ipAddress: this.getClientIP(request),
      userAgent: request.headers?.['user-agent'],
      endpoint: request.url,
      method: request.method,
      dataAccessed: { exportType, resourceCount: resourceIds.length },
      success,
      riskLevel: 'high'
    })
  }

  /**
   * Log system events
   */
  async logSystemEvent(
    eventType: string,
    details: any,
    userId?: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'data_access',
      resource: 'system',
      action: 'read',
      dataAccessed: { eventType, details },
      riskLevel
    })
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(request: any): string {
    return request.headers?.['x-forwarded-for']?.split(',')[0] ||
           request.headers?.['x-real-ip'] ||
           request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           'unknown'
  }

  /**
   * Query audit logs with filters
   */
  async queryAuditLogs(filters: {
    userId?: string
    eventType?: string
    resource?: string
    startDate?: Date
    endDate?: Date
    riskLevel?: string
    limit?: number
    offset?: number
  }): Promise<AuditLogEntry[]> {
    // In production, this would query the database
    // For now, return mock data structure
    return []
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const logs = await this.queryAuditLogs({ startDate, endDate })
    
    return {
      period: { startDate, endDate },
      totalEvents: logs.length,
      eventsByType: this.groupBy(logs, 'eventType'),
      eventsByRisk: this.groupBy(logs, 'riskLevel'),
      uniqueUsers: new Set(logs.map(log => log.userId)).size,
      complianceScore: this.calculateComplianceScore(logs),
      recommendations: this.generateRecommendations(logs)
    }
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = item[key] || 'unknown'
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }

  private calculateComplianceScore(logs: AuditLogEntry[]): number {
    if (logs.length === 0) return 100

    const criticalEvents = logs.filter(log => log.riskLevel === 'critical').length
    const highRiskEvents = logs.filter(log => log.riskLevel === 'high').length
    const failedEvents = logs.filter(log => !log.success).length

    const penalties = (criticalEvents * 10) + (highRiskEvents * 5) + (failedEvents * 3)
    const score = Math.max(0, 100 - (penalties / logs.length * 100))

    return Math.round(score * 100) / 100
  }

  private generateRecommendations(logs: AuditLogEntry[]): string[] {
    const recommendations: string[] = []
    
    const criticalEvents = logs.filter(log => log.riskLevel === 'critical')
    if (criticalEvents.length > 0) {
      recommendations.push('Review and investigate critical risk events')
    }

    const failedLogins = logs.filter(log => 
      log.eventType === 'login' && !log.success
    )
    if (failedLogins.length > 10) {
      recommendations.push('Implement additional login security measures')
    }

    const dataExports = logs.filter(log => log.eventType === 'export')
    if (dataExports.length > 50) {
      recommendations.push('Review data export patterns for compliance')
    }

    return recommendations
  }
}

// Singleton instance
export const auditLogger = new AuditLogger()

// Convenience functions
export const logAuth = (userId: string, action: 'login' | 'logout', request: any, success?: boolean, error?: string) =>
  auditLogger.logAuth(userId, action, request, success, error)

export const logDataAccess = (userId: string, resource: string, resourceId: string, action: 'read' | 'write' | 'delete', request: any, dataAccessed?: any, changes?: any) =>
  auditLogger.logDataAccess(userId, resource, resourceId, action, request, dataAccessed, changes)

export const logAnalysisRequest = (userId: string, analysisType: string, request: any, success?: boolean, error?: string) =>
  auditLogger.logAnalysisRequest(userId, analysisType, request, success, error)

export const logDataExport = (userId: string, exportType: string, resourceIds: string[], request: any, success?: boolean) =>
  auditLogger.logDataExport(userId, exportType, resourceIds, request, success)

export const logSystemEvent = (eventType: string, details: any, userId?: string, riskLevel?: 'low' | 'medium' | 'high' | 'critical') =>
  auditLogger.logSystemEvent(eventType, details, userId, riskLevel)
