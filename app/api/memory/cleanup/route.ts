
/**
 * Memory Cleanup API Route
 * Phase 2B - Allow Users to Manage Their Memory Data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { cleanupMemory } from '@/lib/zep/memory';
import { auditLog } from '@/lib/compliance/audit';
import { validateHIPAACompliance } from '@/lib/compliance/hipaa';

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // HIPAA compliance validation - require explicit consent for data deletion
    const complianceCheck = await validateHIPAACompliance(session.user.id, 'memory_delete');
    if (!complianceCheck.isCompliant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { sessionId, retentionDays = 90, confirmDeletion } = body;

    if (!confirmDeletion) {
      return NextResponse.json(
        { error: 'Deletion confirmation required' },
        { status: 400 }
      );
    }

    const finalSessionId = sessionId || `session_${session.user.id}_${Date.now()}`;

    // Perform memory cleanup
    const startTime = Date.now();
    const cleanupResult = await cleanupMemory(session.user.id, finalSessionId, retentionDays);
    const responseTime = Date.now() - startTime;

    // Audit log - critical for HIPAA compliance
    await auditLog({
      userId: session.user.id,
      action: 'memory_cleanup_performed',
      resource: 'user_memory_data',
      metadata: { 
        retentionDays, 
        responseTime,
        deletedCount: cleanupResult.data?.deletedCount || 0,
        retainedCount: cleanupResult.data?.retainedCount || 0
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      severity: 'high' // High severity for data deletion operations
    });

    if (!cleanupResult.success) {
      return NextResponse.json(
        { error: 'Failed to cleanup memory', details: cleanupResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cleanupResult.data,
      metadata: {
        responseTime,
        retentionDays
      }
    });

  } catch (error) {
    console.error('Memory cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
