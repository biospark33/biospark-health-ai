
'use client'

// HIPAA Consent Management Component
// User interface for consent and privacy controls

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { 
  Shield, 
  Lock, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface ConsentRecord {
  id: string
  consentType: string
  granted: boolean
  version: string
  grantedAt?: string
  revokedAt?: string
}

interface PrivacySettings {
  dataRetentionPeriod: number
  allowResearch: boolean
  allowMarketing: boolean
  allowDataSharing: boolean
  allowAnalytics: boolean
  minimumDataCollection: boolean
}

interface ConsentFormItem {
  type: string
  title: string
  description: string
  required: boolean
  version: string
  consentText: string
}

interface ConsentManagerProps {
  userId: string
  onConsentChange?: (consentType: string, granted: boolean) => void
}

export default function ConsentManager({ userId, onConsentChange }: ConsentManagerProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null)
  const [consentForm, setConsentForm] = useState<ConsentFormItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false)

  useEffect(() => {
    loadConsentData()
  }, [userId])

  const loadConsentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/consent?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setConsents(data.data.consents)
        setPrivacySettings(data.data.privacySettings)
        setConsentForm(data.data.consentForm)
      }
    } catch (error) {
      console.error('Failed to load consent data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConsentChange = async (consentType: string, granted: boolean) => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          consentType,
          granted
        })
      })

      const data = await response.json()

      if (data.success) {
        await loadConsentData() // Refresh data
        onConsentChange?.(consentType, granted)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to update consent:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePrivacySettingsChange = async (settings: Partial<PrivacySettings>) => {
    if (!privacySettings) return

    try {
      setSaving(true)
      
      const updatedSettings = { ...privacySettings, ...settings }
      
      const response = await fetch('/api/consent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          privacySettings: settings
        })
      })

      const data = await response.json()

      if (data.success) {
        setPrivacySettings(updatedSettings)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDataDeletion = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/consent?userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setShowDeletionConfirm(false)
        // In production, redirect user or show confirmation
        alert('Data deletion request submitted successfully')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Failed to request data deletion:', error)
      alert('Failed to submit data deletion request')
    } finally {
      setSaving(false)
    }
  }

  const getConsentStatus = (consentType: string) => {
    const consent = consents.find(c => c.consentType === consentType)
    return consent?.granted || false
  }

  const getConsentIcon = (granted: boolean) => {
    return granted 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading consent preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Privacy & Consent Management
        </h2>
        <p className="text-gray-600 mt-2">
          Manage your data privacy preferences and consent settings
        </p>
      </div>

      {/* Current Consents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Current Consent Status
          </CardTitle>
          <CardDescription>
            Your current consent preferences for data processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(consentForm).map((item) => {
            const granted = getConsentStatus(item.type)
            return (
              <div key={item.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getConsentIcon(granted)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.required && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={granted}
                  onCheckedChange={(checked) => handleConsentChange(item.type, checked)}
                  disabled={saving || (item.required && granted)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      {privacySettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control how your data is used and stored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-research">Research Participation</Label>
                  <p className="text-sm text-gray-600">
                    Allow anonymized use of your data for health research
                  </p>
                </div>
                <Switch
                  id="allow-research"
                  checked={privacySettings.allowResearch}
                  onCheckedChange={(checked) => 
                    handlePrivacySettingsChange({ allowResearch: checked })
                  }
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-marketing">Marketing Communications</Label>
                  <p className="text-sm text-gray-600">
                    Receive health tips and product recommendations
                  </p>
                </div>
                <Switch
                  id="allow-marketing"
                  checked={privacySettings.allowMarketing}
                  onCheckedChange={(checked) => 
                    handlePrivacySettingsChange({ allowMarketing: checked })
                  }
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-sharing">Data Sharing</Label>
                  <p className="text-sm text-gray-600">
                    Share data with authorized healthcare providers
                  </p>
                </div>
                <Switch
                  id="allow-sharing"
                  checked={privacySettings.allowDataSharing}
                  onCheckedChange={(checked) => 
                    handlePrivacySettingsChange({ allowDataSharing: checked })
                  }
                  disabled={saving}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="minimum-collection">Minimum Data Collection</Label>
                  <p className="text-sm text-gray-600">
                    Collect only essential data for analysis
                  </p>
                </div>
                <Switch
                  id="minimum-collection"
                  checked={privacySettings.minimumDataCollection}
                  onCheckedChange={(checked) => 
                    handlePrivacySettingsChange({ minimumDataCollection: checked })
                  }
                  disabled={saving}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Retention Period</Label>
                  <p className="text-sm text-gray-600">
                    {privacySettings.dataRetentionPeriod} days
                  </p>
                </div>
                <Badge variant="outline">
                  {Math.round(privacySettings.dataRetentionPeriod / 365 * 10) / 10} years
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Your Data Rights
          </CardTitle>
          <CardDescription>
            Exercise your rights under HIPAA and privacy regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download My Data
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Eye className="h-4 w-4 mr-2" />
              View Audit Log
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Right to be Forgotten:</strong> You can request deletion of all your personal data. 
                This action is irreversible and will permanently remove your account and all associated health data.
              </AlertDescription>
            </Alert>

            {!showDeletionConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeletionConfirm(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Request Data Deletion
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert className="border-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Confirm Data Deletion:</strong> This will permanently delete all your data. 
                    This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={handleDataDeletion}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Processing...' : 'Confirm Deletion'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeletionConfirm(false)}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
