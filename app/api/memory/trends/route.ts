
/**
 * Memory Trends API Route
 * Phase 2B - Analyze Trends in User's Health Journey
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '../../auth/[...nextauth]/route';
import { analyzeHealthTrends, generateProgressInsights } from '@/lib/zep/analytics';
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
    const sessionId = searchParams.get('sessionId') || `session_${session.user.id}_${Date.now()}`;
    const timeframe = (searchParams.get('timeframe') as 'week' | 'month' | 'quarter' | 'year') || 'month';
    const includeInsights = searchParams.get('includeInsights') === 'true';

    // Analyze health trends
    const startTime = Date.now();
    const trendsResult = await analyzeHealthTrends(session.user.id, sessionId, timeframe);
    
    let insightsResult = null;
    if (includeInsights) {
      insightsResult = await generateProgressInsights(session.user.id, sessionId);
    }
    
    const responseTime = Date.now() - startTime;

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'memory_trends_accessed',
      resource: 'health_trends',
      metadata: { 
        timeframe, 
        includeInsights, 
        responseTime, 
        trendCount: trendsResult.data?.length || 0 
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    if (!trendsResult.success) {
      return NextResponse.json(
        { error: 'Failed to analyze trends', details: trendsResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        trends: trendsResult.data,
        insights: insightsResult?.success ? insightsResult.data : null,
        timeframe
      },
      metadata: {
        responseTime,
        trendCount: trendsResult.data?.length || 0,
        cached: responseTime < 50
      }
    });

  } catch (error) {
    console.error('Memory trends API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
