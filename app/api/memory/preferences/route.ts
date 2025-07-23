
/**
 * Memory Preferences API Route
 * Phase 2B - Update User Health Preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { authOptions } from '../../auth/[...nextauth]/route';
import { storePreferences, getPreferences } from '@/lib/zep/preferences';
import { auditLog } from '@/lib/compliance/audit';
import { validateHIPAACompliance } from '@/lib/compliance/hipaa';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || `session_${session.user.id}_${Date.now()}`;

    const preferencesResult = await getPreferences(session.user.id, sessionId);

    return NextResponse.json({
      success: true,
      data: preferencesResult.data || null
    });

  } catch (error) {
    console.error('Get preferences API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // HIPAA compliance validation
    const complianceCheck = await validateHIPAACompliance(session.user.id, 'memory_write');
    if (!complianceCheck.isCompliant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { preferences, sessionId } = body;

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences data required' }, { status: 400 });
    }

    const finalSessionId = sessionId || `session_${session.user.id}_${Date.now()}`;

    // Store preferences
    const startTime = Date.now();
    const storeResult = await storePreferences(session.user.id, finalSessionId, preferences);
    const responseTime = Date.now() - startTime;

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'preferences_updated',
      resource: 'user_preferences',
      metadata: { 
        responseTime, 
        preferencesKeys: Object.keys(preferences),
        sessionId: finalSessionId
      },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    if (!storeResult.success) {
      return NextResponse.json(
        { error: 'Failed to store preferences', details: storeResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { stored: true },
      metadata: { responseTime }
    });

  } catch (error) {
    console.error('Store preferences API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
