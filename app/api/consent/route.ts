
// HIPAA Consent Management API
// User consent tracking and privacy controls

import { NextRequest, NextResponse } from 'next/server'
import { consentManager, CONSENT_TYPES } from '../../../lib/consent'
import { auditLogger } from '../../../lib/audit'

// Get user's consent status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get current consent records
    const consents = await consentManager.getUserConsents(userId)
    
    // Get privacy settings
    const privacySettings = await consentManager.getPrivacySettings(userId)

    // Generate consent form for missing consents
    const allConsentTypes = Object.keys(CONSENT_TYPES).map(key => 
      CONSENT_TYPES[key].type
    )
    const existingConsentTypes = consents.map(c => c.consentType)
    const missingConsentTypes = allConsentTypes.filter(type => 
      !existingConsentTypes.includes(type)
    )

    const consentForm = missingConsentTypes.length > 0 
      ? consentManager.generateConsentForm(missingConsentTypes)
      : []

    return NextResponse.json({
      success: true,
      data: {
        consents,
        privacySettings,
        consentForm,
        consentTypes: CONSENT_TYPES
      }
    })

  } catch (error) {
    console.error('Failed to get consent data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve consent data' },
      { status: 500 }
    )
  }
}

// Record or update consent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, consentType, granted, consentText } = body

    if (!userId || !consentType || typeof granted !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate consent type
    const validConsentTypes = Object.values(CONSENT_TYPES).map(c => c.type)
    if (!validConsentTypes.includes(consentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid consent type' },
        { status: 400 }
      )
    }

    // Record consent
    const consentRecord = await consentManager.recordConsent(
      userId,
      consentType,
      granted,
      req,
      consentText
    )

    // Log consent action
    await auditLogger.logEvent({
      userId,
      eventType: 'data_access',
      resource: 'user_profile',
      action: 'update',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      endpoint: '/api/consent',
      method: 'POST',
      dataAccessed: { 
        consentType, 
        granted,
        action: granted ? 'consent_granted' : 'consent_revoked'
      },
      success: true,
      riskLevel: granted ? 'low' : 'medium'
    })

    return NextResponse.json({
      success: true,
      data: consentRecord,
      message: `Consent ${granted ? 'granted' : 'revoked'} successfully`
    })

  } catch (error) {
    console.error('Failed to record consent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record consent' },
      { status: 500 }
    )
  }
}

// Update privacy settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, privacySettings } = body

    if (!userId || !privacySettings) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update privacy settings
    const updatedSettings = await consentManager.updatePrivacySettings(
      userId,
      privacySettings,
      req
    )

    // Log privacy settings change
    await auditLogger.logEvent({
      userId,
      eventType: 'data_access',
      resource: 'user_profile',
      action: 'update',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      endpoint: '/api/consent',
      method: 'PUT',
      dataAccessed: { privacySettingsUpdated: Object.keys(privacySettings) },
      changes: { before: {}, after: privacySettings }, // In production, get before state
      success: true,
      riskLevel: 'low'
    })

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Privacy settings updated successfully'
    })

  } catch (error) {
    console.error('Failed to update privacy settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update privacy settings' },
      { status: 500 }
    )
  }
}

// Request data deletion (Right to be Forgotten)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Process data deletion request
    await consentManager.processDataDeletion(userId, req)

    // Log data deletion request
    await auditLogger.logEvent({
      userId,
      eventType: 'delete',
      resource: 'user_profile',
      action: 'delete',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      endpoint: '/api/consent',
      method: 'DELETE',
      dataAccessed: { action: 'data_deletion_requested' },
      success: true,
      riskLevel: 'high'
    })

    return NextResponse.json({
      success: true,
      message: 'Data deletion request processed successfully'
    })

  } catch (error) {
    console.error('Failed to process data deletion:', error)
    
    // Log failed deletion attempt
    await auditLogger.logEvent({
      userId: req.nextUrl.searchParams.get('userId') || undefined,
      eventType: 'delete',
      resource: 'user_profile',
      action: 'delete',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      endpoint: '/api/consent',
      method: 'DELETE',
      success: false,
      errorMessage: error.message,
      riskLevel: 'critical'
    })

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
