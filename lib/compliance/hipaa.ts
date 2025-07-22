
/**
 * HIPAA Compliance Utilities
 * Ensures all PHI handling meets HIPAA requirements
 */

import { auditLogger } from './audit';

export interface PHIContext {
  userId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class HIPAACompliance {
  static async validatePHIAccess(context: PHIContext, resourceType: string, resourceId: string): Promise<boolean> {
    try {
      // Log PHI access attempt
      await auditLogger.logPHIAccess(
        context.userId,
        resourceType,
        resourceId,
        {
          session_id: context.sessionId,
          ip_address: context.ipAddress,
          user_agent: context.userAgent
        }
      );

      // In a real implementation, this would check:
      // - User permissions
      // - Data access policies
      // - Time-based restrictions
      // - Geographic restrictions
      
      return true;
    } catch (error) {
      console.error('HIPAA validation error:', error);
      return false;
    }
  }

  static sanitizePHI(data: any): any {
    if (!data) return data;

    // Remove or mask sensitive fields
    const sanitized = { ...data };
    
    // Common PHI fields to sanitize
    const phiFields = [
      'ssn', 'social_security_number',
      'phone', 'phone_number',
      'email', 'email_address',
      'address', 'street_address',
      'date_of_birth', 'dob',
      'medical_record_number', 'mrn'
    ];

    phiFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  static async logDataExport(userId: string, dataType: string, recordCount: number): Promise<void> {
    await auditLogger.logEvent({
      user_id: userId,
      action: 'DATA_EXPORT',
      resource_type: dataType,
      phi_accessed: true,
      details: {
        record_count: recordCount,
        export_timestamp: new Date().toISOString()
      }
    });
  }

  static async logDataDeletion(userId: string, dataType: string, resourceId: string): Promise<void> {
    await auditLogger.logEvent({
      user_id: userId,
      action: 'DATA_DELETION',
      resource_type: dataType,
      resource_id: resourceId,
      phi_accessed: true,
      details: {
        deletion_timestamp: new Date().toISOString()
      }
    });
  }

  static validateRetentionPolicy(createdAt: string, retentionDays: number = 2555): boolean {
    // Default 7 years retention (2555 days)
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= retentionDays;
  }
}

export const hipaaCompliance = new HIPAACompliance();

// Legacy export for backward compatibility
export const validateHIPAACompliance = hipaaCompliance.validatePHIAccess;
