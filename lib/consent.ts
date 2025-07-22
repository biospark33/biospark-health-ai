
// HIPAA Consent Management System
// User consent tracking and privacy controls

export interface ConsentRecord {
  id: string
  userId: string
  consentType: 'data_processing' | 'analysis' | 'research' | 'marketing' | 'sharing'
  granted: boolean
  version: string
  consentText: string
  grantedAt?: Date
  revokedAt?: Date
  expiresAt?: Date
  ipAddress?: string
  userAgent?: string
}

export interface PrivacySettings {
  dataRetentionPeriod: number // days
  allowResearch: boolean
  allowMarketing: boolean
  allowDataSharing: boolean
  allowAnalytics: boolean
  minimumDataCollection: boolean
}

export const CONSENT_TYPES = {
  DATA_PROCESSING: {
    type: 'data_processing',
    title: 'Health Data Processing',
    description: 'Allow processing of your health data for analysis and insights',
    required: true,
    version: '1.0'
  },
  ANALYSIS: {
    type: 'analysis',
    title: 'Health Analysis',
    description: 'Allow AI-powered analysis of your health data and biomarkers',
    required: true,
    version: '1.0'
  },
  RESEARCH: {
    type: 'research',
    title: 'Research Participation',
    description: 'Allow anonymized use of your data for health research (optional)',
    required: false,
    version: '1.0'
  },
  MARKETING: {
    type: 'marketing',
    title: 'Marketing Communications',
    description: 'Receive health tips and product recommendations (optional)',
    required: false,
    version: '1.0'
  },
  SHARING: {
    type: 'sharing',
    title: 'Data Sharing',
    description: 'Share data with healthcare providers you authorize (optional)',
    required: false,
    version: '1.0'
  }
} as const

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataRetentionPeriod: 2555, // 7 years (HIPAA requirement)
  allowResearch: false,
  allowMarketing: false,
  allowDataSharing: false,
  allowAnalytics: true,
  minimumDataCollection: true
}

class ConsentManager {
  /**
   * Record user consent
   */
  async recordConsent(
    userId: string,
    consentType: string,
    granted: boolean,
    request: any,
    consentText?: string
  ): Promise<ConsentRecord> {
    const consent: ConsentRecord = {
      id: this.generateConsentId(),
      userId,
      consentType: consentType as any,
      granted,
      version: CONSENT_TYPES[consentType.toUpperCase()]?.version || '1.0',
      consentText: consentText || this.getConsentText(consentType),
      grantedAt: granted ? new Date() : undefined,
      revokedAt: !granted ? new Date() : undefined,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers?.['user-agent']
    }

    // In production, save to database
    console.log(`[CONSENT] Recorded consent: ${JSON.stringify(consent)}`)
    
    return consent
  }

  /**
   * Check if user has valid consent for operation
   */
  async hasValidConsent(userId: string, consentType: string): Promise<boolean> {
    // In production, query database for latest consent record
    // For now, assume consent exists
    return true
  }

  /**
   * Get user's current consent status
   */
  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    // In production, query database
    return []
  }

  /**
   * Revoke consent
   */
  async revokeConsent(
    userId: string,
    consentType: string,
    request: any
  ): Promise<void> {
    await this.recordConsent(userId, consentType, false, request)
    
    // Trigger data deletion if required
    if (consentType === 'data_processing') {
      await this.scheduleDataDeletion(userId)
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: Partial<PrivacySettings>,
    request: any
  ): Promise<PrivacySettings> {
    const currentSettings = await this.getPrivacySettings(userId)
    const updatedSettings = { ...currentSettings, ...settings }

    // Validate settings
    this.validatePrivacySettings(updatedSettings)

    // In production, save to database
    console.log(`[PRIVACY] Updated settings for user ${userId}:`, updatedSettings)

    // Log the privacy settings change
    await this.logPrivacyChange(userId, settings, request)

    return updatedSettings
  }

  /**
   * Get user's privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    // In production, query database
    return DEFAULT_PRIVACY_SETTINGS
  }

  /**
   * Schedule data deletion based on retention policy
   */
  async scheduleDataDeletion(userId: string): Promise<void> {
    const settings = await this.getPrivacySettings(userId)
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + settings.dataRetentionPeriod)

    // In production, create data retention record
    console.log(`[DATA_RETENTION] Scheduled deletion for user ${userId} on ${deletionDate}`)
  }

  /**
   * Process data deletion request (Right to be Forgotten)
   */
  async processDataDeletion(userId: string, request: any): Promise<void> {
    // Verify user identity and consent
    const hasConsent = await this.hasValidConsent(userId, 'data_processing')
    
    if (hasConsent) {
      throw new Error('Cannot delete data while processing consent is active')
    }

    // Log deletion request
    console.log(`[DATA_DELETION] Processing deletion request for user ${userId}`)

    // In production:
    // 1. Mark all user data for deletion
    // 2. Anonymize audit logs
    // 3. Remove PHI while preserving audit trail
    // 4. Update data retention records
  }

  /**
   * Generate consent form for user
   */
  generateConsentForm(consentTypes: string[]): any {
    return consentTypes.map(type => {
      const consentInfo = CONSENT_TYPES[type.toUpperCase()]
      if (!consentInfo) {
        throw new Error(`Unknown consent type: ${type}`)
      }

      return {
        type: consentInfo.type,
        title: consentInfo.title,
        description: consentInfo.description,
        required: consentInfo.required,
        version: consentInfo.version,
        consentText: this.getConsentText(type)
      }
    })
  }

  /**
   * Validate consent requirements for operation
   */
  async validateConsentForOperation(
    userId: string,
    operation: 'analysis' | 'export' | 'sharing' | 'research'
  ): Promise<boolean> {
    const requiredConsents = this.getRequiredConsentsForOperation(operation)
    
    for (const consentType of requiredConsents) {
      const hasConsent = await this.hasValidConsent(userId, consentType)
      if (!hasConsent) {
        return false
      }
    }

    return true
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getConsentText(consentType: string): string {
    const templates = {
      data_processing: 'I consent to the processing of my health data for the purpose of health analysis and insights generation.',
      analysis: 'I consent to AI-powered analysis of my health data and biomarkers to provide personalized health insights.',
      research: 'I consent to the use of my anonymized health data for research purposes to advance health science.',
      marketing: 'I consent to receiving marketing communications about health products and services.',
      sharing: 'I consent to sharing my health data with authorized healthcare providers.'
    }

    return templates[consentType] || 'I provide my consent for this data processing activity.'
  }

  private getRequiredConsentsForOperation(operation: string): string[] {
    const requirements = {
      analysis: ['data_processing', 'analysis'],
      export: ['data_processing'],
      sharing: ['data_processing', 'sharing'],
      research: ['data_processing', 'research']
    }

    return requirements[operation] || ['data_processing']
  }

  private validatePrivacySettings(settings: PrivacySettings): void {
    if (settings.dataRetentionPeriod < 1) {
      throw new Error('Data retention period must be at least 1 day')
    }

    if (settings.dataRetentionPeriod > 3650) { // 10 years max
      throw new Error('Data retention period cannot exceed 10 years')
    }
  }

  private async logPrivacyChange(
    userId: string,
    changes: Partial<PrivacySettings>,
    request: any
  ): Promise<void> {
    // Log privacy settings changes for audit
    console.log(`[PRIVACY_AUDIT] User ${userId} updated privacy settings:`, changes)
  }

  private getClientIP(request: any): string {
    return request.headers?.['x-forwarded-for']?.split(',')[0] ||
           request.headers?.['x-real-ip'] ||
           'unknown'
  }
}

// Singleton instance
export const consentManager = new ConsentManager()

// Convenience functions
export const recordConsent = (userId: string, consentType: string, granted: boolean, request: any, consentText?: string) =>
  consentManager.recordConsent(userId, consentType, granted, request, consentText)

export const hasValidConsent = (userId: string, consentType: string) =>
  consentManager.hasValidConsent(userId, consentType)

export const validateConsentForOperation = (userId: string, operation: 'analysis' | 'export' | 'sharing' | 'research') =>
  consentManager.validateConsentForOperation(userId, operation)

export const updatePrivacySettings = (userId: string, settings: Partial<PrivacySettings>, request: any) =>
  consentManager.updatePrivacySettings(userId, settings, request)

export const processDataDeletion = (userId: string, request: any) =>
  consentManager.processDataDeletion(userId, request)
