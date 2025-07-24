
// Engagement Tracking API Route
// BMAD Phase 1 - Progressive Disclosure Analytics

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LabInsightZepClient } from '@/lib/zep-client';
import { z } from 'zod';

// Engagement event schema
const EngagementEventSchema = z.object({
  assessmentId: z.string(),
  eventType: z.enum(['layer_change', 'time_spent', 'achievement', 'action_click']),
  eventData: z.object({
    layer: z.number().min(1).max(3).optional(),
    timeSpent: z.number().optional(),
    achievement: z.string().optional(),
    action: z.string().optional(),
    metadata: z.object({}).optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = EngagementEventSchema.parse(body);
    const { assessmentId, eventType, eventData } = validatedData;

    // Verify assessment ownership
    const assessment = await prisma.healthAssessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get or create engagement analytics record
    let engagement = await prisma.userEngagementAnalytics.findFirst({
      where: { assessmentId }
    });

    if (!engagement) {
      engagement = await prisma.userEngagementAnalytics.create({
        data: {
          userId: session.user.id,
          assessmentId,
          zepSessionId: assessment.zepSessionId
        }
      });
    }

    // Process different event types
    switch (eventType) {
      case 'layer_change':
        if (eventData.layer) {
          // Update layer progress
          const currentProgress = assessment.layerProgress as any || {};
          currentProgress[`layer${eventData.layer}`] = true;
          
          await prisma.healthAssessment.update({
            where: { id: assessmentId },
            data: { layerProgress: currentProgress }
          });

          // Update engagement analytics
          const layerTransitions = engagement.layerTransitions as any[] || [];
          layerTransitions.push({
            layer: eventData.layer,
            timestamp: new Date().toISOString()
          });

          await prisma.userEngagementAnalytics.update({
            where: { id: engagement.id },
            data: { layerTransitions }
          });

          // Store in Zep memory
          if (assessment.zepSessionId) {
            const zepClient = new LabInsightZepClient({
              apiKey: process.env.ZEP_API_KEY || '',
              userId: session.user.id
            });

            await zepClient.addMemory(assessment.zepSessionId, {
              content: `User navigated to layer ${eventData.layer}`,
              metadata: {
                type: 'layer_navigation',
                layer: eventData.layer,
                assessmentId,
                timestamp: new Date().toISOString()
              }
            });
          }
        }
        break;

      case 'time_spent':
        if (eventData.timeSpent && eventData.layer) {
          // Update time spent on specific layer
          const updateData: any = {
            totalTimeSpent: engagement.totalTimeSpent + eventData.timeSpent
          };

          if (eventData.layer === 1) updateData.layer1Time = (engagement.layer1Time || 0) + eventData.timeSpent;
          if (eventData.layer === 2) updateData.layer2Time = (engagement.layer2Time || 0) + eventData.timeSpent;
          if (eventData.layer === 3) updateData.layer3Time = (engagement.layer3Time || 0) + eventData.timeSpent;

          await prisma.userEngagementAnalytics.update({
            where: { id: engagement.id },
            data: updateData
          });

          // Update assessment engagement metrics
          const currentMetrics = assessment.engagementMetrics as any || {};
          currentMetrics.timeSpent = (currentMetrics.timeSpent || 0) + eventData.timeSpent;

          await prisma.healthAssessment.update({
            where: { id: assessmentId },
            data: { engagementMetrics: currentMetrics }
          });
        }
        break;

      case 'achievement':
        if (eventData.achievement) {
          // Add achievement
          const currentAchievements = engagement.achievements as string[] || [];
          if (!currentAchievements.includes(eventData.achievement)) {
            currentAchievements.push(eventData.achievement);

            await prisma.userEngagementAnalytics.update({
              where: { id: engagement.id },
              data: { achievements: currentAchievements }
            });

            // Update assessment achievements
            const assessmentMetrics = assessment.engagementMetrics as any || {};
            assessmentMetrics.achievements = currentAchievements;

            await prisma.healthAssessment.update({
              where: { id: assessmentId },
              data: { engagementMetrics: assessmentMetrics }
            });
          }
        }
        break;

      case 'action_click':
        if (eventData.action) {
          // Track action clicks for analytics
          const zepClient = new LabInsightZepClient({
            apiKey: process.env.ZEP_API_KEY || '',
            userId: session.user.id
          });

          if (assessment.zepSessionId) {
            await zepClient.addMemory(assessment.zepSessionId, {
              content: `User clicked action: ${eventData.action}`,
              metadata: {
                type: 'action_click',
                action: eventData.action,
                assessmentId,
                timestamp: new Date().toISOString(),
                ...eventData.metadata
              }
            });
          }
        }
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Engagement event tracked successfully'
    });

  } catch (error) {
    console.error('Failed to track engagement event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track engagement',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const timeframe = searchParams.get('timeframe') || '30'; // days

    if (assessmentId) {
      // Get specific assessment engagement
      const engagement = await prisma.userEngagementAnalytics.findFirst({
        where: {
          assessmentId,
          userId: session.user.id
        }
      });

      return NextResponse.json({ engagement });
    } else {
      // Get user's engagement analytics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - parseInt(timeframe));

      const engagementData = await prisma.userEngagementAnalytics.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: thirtyDaysAgo }
        },
        include: {
          assessment: {
            select: {
              id: true,
              assessmentType: true,
              overallScore: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate summary statistics
      const totalSessions = engagementData.length;
      const averageTimeSpent = engagementData.reduce((sum, e) => sum + (e.totalTimeSpent || 0), 0) / totalSessions || 0;
      const averageEngagementScore = engagementData.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / totalSessions || 0;
      const totalAchievements = engagementData.reduce((sum, e) => sum + (e.achievements as string[] || []).length, 0);

      // Layer completion rates
      const layer1Completions = engagementData.filter(e => (e.layer1Time || 0) > 0).length;
      const layer2Completions = engagementData.filter(e => (e.layer2Time || 0) > 0).length;
      const layer3Completions = engagementData.filter(e => (e.layer3Time || 0) > 0).length;

      return NextResponse.json({
        summary: {
          totalSessions,
          averageTimeSpent: Math.round(averageTimeSpent),
          averageEngagementScore: Math.round(averageEngagementScore * 100) / 100,
          totalAchievements,
          layerCompletionRates: {
            layer1: totalSessions > 0 ? Math.round((layer1Completions / totalSessions) * 100) : 0,
            layer2: totalSessions > 0 ? Math.round((layer2Completions / totalSessions) * 100) : 0,
            layer3: totalSessions > 0 ? Math.round((layer3Completions / totalSessions) * 100) : 0
          }
        },
        engagementData: engagementData.slice(0, 10) // Return latest 10 sessions
      });
    }

  } catch (error) {
    console.error('Failed to retrieve engagement data:', error);
    return NextResponse.json({
      error: 'Failed to retrieve engagement data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
