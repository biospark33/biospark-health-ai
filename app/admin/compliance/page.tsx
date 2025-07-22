
'use client'

// HIPAA Compliance Monitoring Dashboard
// Real-time compliance metrics and audit log visualization

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  RefreshCw,
  Eye,
  Lock,
  Users,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react'

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

interface AuditLog {
  id: string
  userId?: string
  eventType: string
  resource: string
  action: string
  timestamp: string
  success: boolean
  riskLevel: string
  ipAddress?: string
  errorMessage?: string
}

interface ComplianceAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      setLoading(true)
      
      // Load current metrics
      const metricsResponse = await fetch('/api/compliance/metrics?type=current')
      const metricsData = await metricsResponse.json()
      if (metricsData.success) {
        setMetrics(metricsData.data)
      }

      // Load recent audit logs
      const logsResponse = await fetch('/api/compliance/audit-logs?limit=20')
      const logsData = await logsResponse.json()
      if (logsData.success) {
        setAuditLogs(logsData.data.logs)
      }

      // Load alerts
      const alertsResponse = await fetch('/api/compliance/metrics?type=alerts')
      const alertsData = await alertsResponse.json()
      if (alertsData.success) {
        setAlerts(alertsData.data)
      }

      // Load trends
      const trendsResponse = await fetch('/api/compliance/metrics?type=trends&days=7')
      const trendsData = await trendsResponse.json()
      if (trendsData.success) {
        setTrends(trendsData.data)
      }

    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadComplianceData()
    setRefreshing(false)
  }

  const exportComplianceReport = async () => {
    try {
      const response = await fetch('/api/compliance/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportType: 'compliance_report',
          format: 'json',
          filters: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compliance_report_${Date.now()}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export compliance report:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'violation':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'violation': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading compliance dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            HIPAA Compliance Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of HIPAA compliance metrics and audit trails
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportComplianceReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Alert key={alert.id} className={alert.type === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Compliance Overview */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(metrics.status)}
              Overall Compliance Status
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{metrics.overallScore}%</div>
                <Badge className={getStatusColor(metrics.status)}>
                  {metrics.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Audit Coverage</span>
                  <span className="font-semibold">{metrics.auditCoverage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Encryption Rate</span>
                  <span className="font-semibold">{metrics.encryptionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Consent Rate</span>
                  <span className="font-semibold">{metrics.consentRate}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Data Retention</span>
                  <span className="font-semibold">{metrics.dataRetentionCompliance}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Access Control</span>
                  <span className="font-semibold">{metrics.accessControlCompliance}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Incidents</span>
                  <span className="font-semibold text-red-600">{metrics.incidentCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="audit-logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Audit Logs
              </CardTitle>
              <CardDescription>
                Latest system access and data operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getRiskLevelColor(log.riskLevel)}>
                        {log.riskLevel}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {log.eventType} - {log.resource}
                        </div>
                        <div className="text-sm text-gray-600">
                          {log.action} by {log.userId || 'anonymous'} from {log.ipAddress}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                      {!log.success && (
                        <div className="text-xs text-red-600">
                          {log.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Audit Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics?.auditCoverage}%</div>
                <p className="text-sm text-gray-600">
                  Percentage of operations with audit trails
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Encryption Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics?.encryptionRate}%</div>
                <p className="text-sm text-gray-600">
                  Percentage of PHI data encrypted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Consent Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics?.consentRate}%</div>
                <p className="text-sm text-gray-600">
                  Users with valid consent records
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Trends
              </CardTitle>
              <CardDescription>
                7-day compliance score history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{trend.date}</div>
                      <Badge className={getStatusColor(trend.status)}>
                        {trend.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{trend.overallScore}%</div>
                      <div className="text-sm text-gray-600">
                        {trend.incidentCount} incidents
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts
              </CardTitle>
              <CardDescription>
                Recent security events and compliance violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No active alerts. System is operating normally.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <Alert key={alert.id} className={alert.type === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        {alert.title}
                        <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <div>{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
