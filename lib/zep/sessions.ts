
/**
 * Zep Session Management
 * Phase 2A Foundation - User Session Linking and Management
 */

import { zepClient, withZepErrorHandling } from './client';
import { ZepSessionMetadata, ZepOperationResult } from './types';

// Generate unique session ID for user
export function generateSessionId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `health_session_${userId}_${timestamp}_${random}`;
}

// Create or get existing Zep session for user
export async function createUserSession(
  userId: string,
  metadata: Partial<ZepSessionMetadata> = {}
): Promise<ZepOperationResult<string>> {
  if (!zepClient) {
    console.warn('Zep client not available, generating session ID only');
    const sessionId = generateSessionId(userId);
    return { success: true, data: sessionId };
  }

  return withZepErrorHandling(async () => {
    const sessionId = generateSessionId(userId);
    
    // TODO: Implement actual Zep session creation once SDK documentation is clarified
    console.log('Creating user session:', {
      userId,
      sessionId,
      metadata
    });

    return { success: true, data: sessionId };
  }) as Promise<ZepOperationResult<string>>;
}

// Get existing session for user
export async function getUserSession(
  userId: string
): Promise<ZepOperationResult<string | null>> {
  return withZepErrorHandling(async () => {
    // Search for existing sessions for this user
    const sessions = await zepClient.memory.getSessions({
      limit: 1
    });

    // Filter by userId in metadata (simplified approach)
    const userSession = sessions?.find((s: any) => 
      s.metadata?.userId === userId
    );

    if (userSession) {
      return { success: true, data: userSession.sessionId };
    }

    return { success: true, data: null };
  }) as Promise<ZepOperationResult<string | null>>;
}

// Get or create session for user (convenience function)
export async function getOrCreateUserSession(
  userId: string,
  metadata: Partial<ZepSessionMetadata> = {}
): Promise<ZepOperationResult<string>> {
  // First try to get existing session
  const existingSession = await getUserSession(userId);
  
  if (existingSession.success && existingSession.data) {
    return { success: true, data: existingSession.data };
  }

  // Create new session if none exists
  return await createUserSession(userId, metadata);
}

// Update session metadata
export async function updateSessionMetadata(
  sessionId: string,
  metadata: Partial<ZepSessionMetadata>
): Promise<ZepOperationResult<boolean>> {
  return withZepErrorHandling(async () => {
    await zepClient.memory.updateSession(sessionId, {
      metadata: metadata as Record<string, unknown>
    });

    return { success: true, data: true };
  }) as Promise<ZepOperationResult<boolean>>;
}

// Delete session (for user privacy control)
export async function deleteUserSession(
  sessionId: string
): Promise<ZepOperationResult<boolean>> {
  return withZepErrorHandling(async () => {
    await zepClient.memory.deleteSession(sessionId);
    return { success: true, data: true };
  }) as Promise<ZepOperationResult<boolean>>;
}

// List user sessions (for management)
export async function listUserSessions(
  userId: string,
  limit: number = 10
): Promise<ZepOperationResult<any[]>> {
  return withZepErrorHandling(async () => {
    const sessions = await zepClient.memory.getSessions({
      limit
    });

    return { success: true, data: sessions || [] };
  }) as Promise<ZepOperationResult<any[]>>;
}

// Session cleanup for expired sessions
export async function cleanupExpiredSessions(
  userId: string
): Promise<ZepOperationResult<number>> {
  return withZepErrorHandling(async () => {
    const retentionDays = parseInt(process.env.ZEP_MEMORY_RETENTION_DAYS || '90');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const sessions = await listUserSessions(userId, 100);
    if (!sessions.success || !sessions.data) {
      return { success: true, data: 0 };
    }

    let deletedCount = 0;
    for (const session of sessions.data) {
      const sessionDate = new Date(session.created_at);
      if (sessionDate < cutoffDate) {
        const deleteResult = await deleteUserSession(session.sessionId);
        if (deleteResult.success) {
          deletedCount++;
        }
      }
    }

    return { success: true, data: deletedCount };
  }) as Promise<ZepOperationResult<number>>;
}

// TODO: Implement additional session management for Phase 2B
// - Session persistence across page reloads
// - Session analytics and usage tracking
// - Advanced session search and filtering
// - Session backup and recovery
