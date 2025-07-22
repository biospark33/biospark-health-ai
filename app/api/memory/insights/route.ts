
/**
 * Memory Insights API Route
 * Phase 2B - Get Personalized Insights Based on Memory
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getComprehensiveHealthInsights, getPersonalizedGreeting } from '@/lib/zep/memory';
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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || `session_${session.user.id}_${Date.now()}`;
    const type = searchParams.get('type') || 'comprehensive';

    const startTime = Date.now();
    let result;

    if (type === 'greeting') {
      result = await getPersonalizedGreeting(session.user.id, sessionId);
    } else {
      result = await getComprehensiveHealthInsights(session.user.id, sessionId);
    }

    const responseTime = Date.now() - startTime;

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'memory_insights_accessed',
      resource: 'personalized_insights',
      metadata: { type, responseTime, sessionId },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to generate insights', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        type,
        responseTime,
        cached: responseTime < 50
      }
    });

  } catch (error) {
    console.error('Memory insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
