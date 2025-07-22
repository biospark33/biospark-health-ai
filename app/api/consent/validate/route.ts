
// Consent Validation API
// Validate user consent for specific operations

import { NextRequest, NextResponse } from 'next/server'
import { consentManager } from '../../../../lib/consent'
import { auditLogger } from '../../../../lib/audit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, operation, additionalContext } = body

    if (!userId || !operation) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate operation type
    const validOperations = ['analysis', 'export', 'sharing', 'research']
    if (!validOperations.includes(operation)) {
      return NextResponse.json(
        { success: false, error: 'Invalid operation type' },
        { status: 400 }
      )
    }

    // Check consent for operation
    const hasValidConsent = await consentManager.validateConsentForOperation(
      userId,
      operation
    )

    // Log consent validation
    await auditLogger.logEvent({
      userId,
      eventType: 'data_access',
      resource: 'user_profile',
      action: 'read',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      endpoint: '/api/consent/validate',
      method: 'POST',
      dataAccessed: { 
        operation, 
        consentValid: hasValidConsent,
        additionalContext 
      },
      success: true,
      riskLevel: hasValidConsent ? 'low' : 'medium'
    })

    if (!hasValidConsent) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient consent for operation',
        data: {
          operation,
          consentRequired: true,
          message: `User consent required for ${operation} operation`
        }
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        operation,
        consentValid: true,
        message: 'User has valid consent for operation'
      }
    })

  } catch (error) {
    console.error('Consent validation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate consent' },
      { status: 500 }
    )
  }
}
