
/**
 * HIPAA Compliance Audit System
 * Tracks all PHI access and system events for compliance
 * Enhanced with graceful fallback handling
 */

import { createClient } from '@supabase/supabase-js';

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
  private supabase: any = null;
  private isEnabled: boolean = false;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if Supabase is properly configured
    if (!supabaseUrl || 
        !supabaseServiceKey || 
        supabaseUrl.includes('your-supabase-url') ||
        supabaseServiceKey.includes('your-service-role-key')) {
      console.warn('⚠️ Supabase not configured for audit logging, using console fallback');
      this.isEnabled = false;
      
      // Create mock client for graceful degradation
      this.supabase = {
        from: () => ({
          insert: () => Promise.resolve({ error: null })
        })
      };
    } else {
      try {
        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
        this.isEnabled = true;
        console.log('✅ Audit logger initialized with Supabase');
      } catch (error) {
        console.warn('⚠️ Failed to initialize audit logger:', error instanceof Error ? error.message : 'Unknown error');
        this.isEnabled = false;
        
        // Create mock client for graceful degradation
        this.supabase = {
          from: () => ({
            insert: () => Promise.resolve({ error: null })
          })
        };
      }
    }
  }

  async logEvent(event: AuditEvent): Promise<void> {
    try {
      const auditRecord = {
        ...event,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      if (!this.isEnabled) {
        // Fallback to console logging when Supabase is not available
        console.log('📋 AUDIT LOG:', JSON.stringify(auditRecord, null, 2));
        return;
      }

      const { error } = await this.supabase
        .from('hipaa_audit_log')
        .insert([auditRecord]);

      if (error) {
        console.warn('⚠️ Audit logging failed, falling back to console:', error.message);
        console.log('📋 AUDIT LOG (FALLBACK):', JSON.stringify(auditRecord, null, 2));
        // In production, this should trigger alerts
      }
    } catch (error) {
      console.warn('⚠️ Audit system error, falling back to console:', error instanceof Error ? error.message : 'Unknown error');
      console.log('📋 AUDIT LOG (ERROR FALLBACK):', JSON.stringify(event, null, 2));
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
