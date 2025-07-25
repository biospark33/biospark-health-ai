
/**
 * Memory Context API Route
 * Phase 2B - Get Relevant Context for Current Conversation
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getHealthContext } from '@/lib/zep/memory';
import { auditLog } from '@/lib/compliance/audit';
import { validateHIPAACompliance } from '@/lib/compliance/hipaa';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // HIPAA compliance validation
    const complianceCheck = await validateHIPAACompliance(session.user.id, 'memory_access');
    if (!complianceCheck.isCompliant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const sessionId = searchParams.get('sessionId') || `session_${session.user.id}_${Date.now()}`;

    // Retrieve intelligent context
    const startTime = Date.now();
    const contextResult = await getHealthContext(session.user.id, sessionId, query);
    const responseTime = Date.now() - startTime;

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'memory_context_accessed',
      resource: 'health_context',
      metadata: { query, responseTime, hasContext: !!contextResult.data },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    if (!contextResult.success) {
      return NextResponse.json(
        { error: 'Failed to retrieve context', details: contextResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contextResult.data,
      metadata: {
        responseTime,
        cached: responseTime < 50,
        contextItems: contextResult.data?.relevantHistory?.length || 0
      }
    });

  } catch (error) {
    console.error('Memory context API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
