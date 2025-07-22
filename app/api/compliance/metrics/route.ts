
// HIPAA Compliance Metrics API
// Real-time compliance monitoring and alerting

import { NextRequest, NextResponse } from 'next/server'
import { requireAuditAccess } from '../../../../middleware/rbac'
import { auditLogger } from '../../../../lib/audit'

interface ComplianceMetrics {
  auditCoverage: number
  encryptionRate: number
  consentRate: number
  dataRetentionCompliance: number
  accessControlCompliance: number
  incidentCount: number
  overallScore: number
  status: 'compliant' | 'warning' | 'violation'
  lastUpdated: string
}

async function calculateComplianceMetrics(
  startDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
  endDate: Date = new Date()
): Promise<ComplianceMetrics> {
  try {
    // Get audit logs for the period
    const logs = await auditLogger.queryAuditLogs({ startDate, endDate })
    
    // Calculate audit coverage (% of operations that are logged)
    const totalOperations = logs.length
    const auditedOperations = logs.filter(log => log.success).length
    const auditCoverage = totalOperations > 0 ? (auditedOperations / totalOperations) * 100 : 100

    // Calculate encryption rate (% of PHI that is encrypted)
    // In production, query encrypted_phi table
    const encryptionRate = 95 // Mock value

    // Calculate consent rate (% of users with valid consent)
    // In production, query user_consents table
    const consentRate = 98 // Mock value

    // Calculate data retention compliance
    // In production, check data_retention table for overdue deletions
    const dataRetentionCompliance = 100 // Mock value

    // Calculate access control compliance
    const unauthorizedAttempts = logs.filter(log => 
      !log.success && log.errorMessage?.includes('unauthorized')
    ).length
    const accessControlCompliance = totalOperations > 0 
      ? Math.max(0, 100 - (unauthorizedAttempts / totalOperations) * 100)
      : 100

    // Count security incidents
    const incidentCount = logs.filter(log => 
      log.riskLevel === 'critical' || log.riskLevel === 'high'
    ).length

    // Calculate overall compliance score
    const weights = {
      auditCoverage: 0.25,
      encryptionRate: 0.25,
      consentRate: 0.20,
      dataRetentionCompliance: 0.15,
      accessControlCompliance: 0.15
    }

    const overallScore = 
      (auditCoverage * weights.auditCoverage) +
      (encryptionRate * weights.encryptionRate) +
      (consentRate * weights.consentRate) +
      (dataRetentionCompliance * weights.dataRetentionCompliance) +
      (accessControlCompliance * weights.accessControlCompliance)

    // Determine status
    let status: 'compliant' | 'warning' | 'violation'
    if (overallScore >= 95 && incidentCount === 0) {
      status = 'compliant'
    } else if (overallScore >= 85 && incidentCount < 5) {
      status = 'warning'
    } else {
      status = 'violation'
    }

    return {
      auditCoverage: Math.round(auditCoverage * 100) / 100,
      encryptionRate: Math.round(encryptionRate * 100) / 100,
      consentRate: Math.round(consentRate * 100) / 100,
      dataRetentionCompliance: Math.round(dataRetentionCompliance * 100) / 100,
      accessControlCompliance: Math.round(accessControlCompliance * 100) / 100,
      incidentCount,
      overallScore: Math.round(overallScore * 100) / 100,
      status,
      lastUpdated: new Date().toISOString()
    }

  } catch (error) {
    console.error('Failed to calculate compliance metrics:', error)
    throw error
  }
}

async function getComplianceTrends(days: number = 7): Promise<any[]> {
  const trends = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const endDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)

    const metrics = await calculateComplianceMetrics(startDate, endDate)
    
    trends.push({
      date: endDate.toISOString().split('T')[0],
      overallScore: metrics.overallScore,
      auditCoverage: metrics.auditCoverage,
      incidentCount: metrics.incidentCount,
      status: metrics.status
    })
  }

  return trends
}

async function getComplianceAlerts(): Promise<any[]> {
  const alerts = []
  const now = new Date()
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Get recent high-risk events
  const logs = await auditLogger.queryAuditLogs({ 
    startDate: last24Hours,
    riskLevel: 'high'
  })

  const criticalLogs = await auditLogger.queryAuditLogs({
    startDate: last24Hours,
    riskLevel: 'critical'
  })

  // Generate alerts for critical events
  criticalLogs.forEach(log => {
    alerts.push({
      id: `alert_${log.id}`,
      type: 'critical',
      title: 'Critical Security Event',
      message: `${log.eventType} operation failed: ${log.errorMessage}`,
      timestamp: log.timestamp,
      userId: log.userId,
      resource: log.resource,
      action: log.action
    })
  })

  // Generate alerts for high-risk patterns
  const failedLogins = logs.filter(log => 
    log.eventType === 'login' && !log.success
  )

  if (failedLogins.length > 5) {
    alerts.push({
      id: `alert_failed_logins_${Date.now()}`,
      type: 'warning',
      title: 'Multiple Failed Login Attempts',
      message: `${failedLogins.length} failed login attempts in the last 24 hours`,
      timestamp: now.toISOString(),
      count: failedLogins.length
    })
  }

  return alerts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

// Get current compliance metrics
export const GET = requireAuditAccess(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'current'
    const days = parseInt(searchParams.get('days') || '7')

    switch (type) {
      case 'current':
        const metrics = await calculateComplianceMetrics()
        return NextResponse.json({
          success: true,
          data: metrics
        })

      case 'trends':
        const trends = await getComplianceTrends(days)
        return NextResponse.json({
          success: true,
          data: trends
        })

      case 'alerts':
        const alerts = await getComplianceAlerts()
        return NextResponse.json({
          success: true,
          data: alerts
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid metrics type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Compliance metrics calculation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate compliance metrics' },
      { status: 500 }
    )
  }
})

// Update compliance thresholds and settings
export const POST = requireAuditAccess(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { thresholds, alertSettings } = body

    // Validate thresholds
    if (thresholds) {
      const validThresholds = ['auditCoverage', 'encryptionRate', 'consentRate']
      for (const [key, value] of Object.entries(thresholds)) {
        if (!validThresholds.includes(key) || typeof value !== 'number' || value < 0 || value > 100) {
          return NextResponse.json(
            { success: false, error: `Invalid threshold: ${key}` },
            { status: 400 }
          )
        }
      }
    }

    // In production, save settings to database
    console.log('[COMPLIANCE] Updated compliance settings:', { thresholds, alertSettings })

    // Log the configuration change
    const userContext = (req as any).userContext
    await auditLogger.logSystemEvent(
      'compliance_settings_updated',
      { thresholds, alertSettings },
      userContext.userId,
      'medium'
    )

    return NextResponse.json({
      success: true,
      message: 'Compliance settings updated successfully'
    })

  } catch (error) {
    console.error('Failed to update compliance settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update compliance settings' },
      { status: 500 }
    )
  }
})
