
/**
 * HIPAA Compliance Audit System
 * Tracks all PHI access and system events for compliance
 */

import { getSupabaseClient } from '@/lib/supabase';

export interface AuditEvent {
  id?: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  phi_accessed?: boolean;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  details?: Record<string, any>;
}

export class AuditLogger {
  private supabase;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async logEvent(event: AuditEvent): Promise<void> {
    try {
      if (!this.supabase) {
        console.warn('Supabase not available - audit logging skipped');
        return;
      }

      const auditRecord = {
        ...event,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('hipaa_audit_log')
        .insert([auditRecord]);

      if (error) {
        console.error('Audit logging failed:', error);
        // In production, this should trigger alerts
      }
    } catch (error) {
      console.error('Audit system error:', error);
    }
  }

  async logPHIAccess(userId: string, resourceType: string, resourceId: string, details?: any): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: 'PHI_ACCESS',
      resource_type: resourceType,
      resource_id: resourceId,
      phi_accessed: true,
      details
    });
  }

  async logUserAction(userId: string, action: string, details?: any): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action,
      resource_type: 'USER_ACTION',
      details
    });
  }

  async logSystemEvent(action: string, details?: any): Promise<void> {
    await this.logEvent({
      user_id: 'SYSTEM',
      action,
      resource_type: 'SYSTEM_EVENT',
      details
    });
  }
}

export const auditLogger = new AuditLogger();

// Legacy export for backward compatibility
export const auditLog = auditLogger;
