
/**
 * Memory History API Route
 * Phase 2B - Retrieve User's Health Analysis History
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getUserAnalysisHistory } from '@/lib/zep/memory';
import { auditLog } from '@/lib/compliance/audit';
import { validateHIPAACompliance } from '@/lib/compliance/hipaa';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // HIPAA compliance validation
    const complianceCheck = await validateHIPAACompliance(session.user.id, 'memory_access');
    if (!complianceCheck.isCompliant) {
      await auditLog({
        userId: session.user.id,
        action: 'memory_access_denied',
        resource: 'history',
        reason: complianceCheck.reason,
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sessionId = searchParams.get('sessionId') || `session_${session.user.id}_${Date.now()}`;

    // Retrieve analysis history
    const startTime = Date.now();
    const historyResult = await getUserAnalysisHistory(session.user.id, sessionId, limit);
    const responseTime = Date.now() - startTime;

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'memory_history_accessed',
      resource: 'analysis_history',
      metadata: { limit, responseTime, resultCount: historyResult.data?.length || 0 },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    if (!historyResult.success) {
      return NextResponse.json(
        { error: 'Failed to retrieve history', details: historyResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: historyResult.data,
      metadata: {
        count: historyResult.data?.length || 0,
        responseTime,
        cached: responseTime < 50 // Likely cached if very fast
      }
    });

  } catch (error) {
    console.error('Memory history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
