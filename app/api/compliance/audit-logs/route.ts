
// HIPAA Compliance Audit Logs API
// Secure endpoint for compliance monitoring and reporting

import { NextRequest, NextResponse } from 'next/server'
import { requireAuditAccess } from '../../../../middleware/rbac'
import { auditLogger } from '../../../../lib/audit'

interface AuditLogQuery {
  userId?: string
  eventType?: string
  resource?: string
  startDate?: string
  endDate?: string
  riskLevel?: string
  page?: number
  limit?: number
}

async function handleGetAuditLogs(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const query: AuditLogQuery = {
      userId: searchParams.get('userId') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      resource: searchParams.get('resource') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      riskLevel: searchParams.get('riskLevel') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    }

    // Convert date strings to Date objects
    const filters = {
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      offset: ((query.page || 1) - 1) * (query.limit || 50)
    }

    // Query audit logs
    const logs = await auditLogger.queryAuditLogs(filters)
    
    // Calculate pagination info
    const totalCount = logs.length // In production, get actual count from database
    const totalPages = Math.ceil(totalCount / (query.limit || 50))

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: query.page || 1,
          limit: query.limit || 50,
          totalCount,
          totalPages,
          hasNext: (query.page || 1) < totalPages,
          hasPrev: (query.page || 1) > 1
        }
      }
    })

  } catch (error) {
    console.error('Audit logs query failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit logs' },
      { status: 500 }
    )
  }
}

async function handleGetComplianceReport(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date()

    const report = await auditLogger.generateComplianceReport(startDate, endDate)

    return NextResponse.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('Compliance report generation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate compliance report' },
      { status: 500 }
    )
  }
}

// Apply RBAC middleware
export const GET = requireAuditAccess(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const reportType = searchParams.get('type')

  if (reportType === 'report') {
    return handleGetComplianceReport(req)
  } else {
    return handleGetAuditLogs(req)
  }
})

// Export compliance data (requires additional permissions)
export const POST = requireAuditAccess(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { exportType, filters, format = 'json' } = body

    // Validate export request
    if (!exportType || !['audit_logs', 'compliance_report'].includes(exportType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid export type' },
        { status: 400 }
      )
    }

    let data: any
    
    if (exportType === 'audit_logs') {
      data = await auditLogger.queryAuditLogs(filters)
    } else {
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date()
      data = await auditLogger.generateComplianceReport(startDate, endDate)
    }

    // Log the export operation
    const userContext = (req as any).userContext
    await auditLogger.logDataExport(
      userContext.userId,
      exportType,
      ['compliance_data'],
      req,
      true
    )

    // Format response based on requested format
    if (format === 'csv') {
      // In production, convert to CSV format
      const csvData = JSON.stringify(data) // Simplified for now
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${exportType}_${Date.now()}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      data,
      exportInfo: {
        type: exportType,
        format,
        timestamp: new Date().toISOString(),
        recordCount: Array.isArray(data) ? data.length : 1
      }
    })

  } catch (error) {
    console.error('Compliance data export failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export compliance data' },
      { status: 500 }
    )
  }
})
