
// Memory-Enhanced Health Analysis API Route
// BMAD Phase 1 Implementation - Real Agent Integration

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { memoryEnhancedHealthAI } from '@/lib/memory-enhanced-health-ai';
import { LabInsightZepClient } from '@/lib/zep-client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Request validation schema
const AnalysisRequestSchema = z.object({
  assessmentData: z.object({
    type: z.string(),
    biomarkers: z.array(z.any()).optional(),
    symptoms: z.array(z.string()).optional(),
    lifestyle: z.object({}).optional(),
    goals: z.array(z.string()).optional()
  }),
  enableMemoryEnhancement: z.boolean().default(true),
  layerPreference: z.number().min(1).max(3).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = AnalysisRequestSchema.parse(body);
    const { assessmentData, enableMemoryEnhancement, layerPreference } = validatedData;

    // Initialize Zep client for memory enhancement
    const zepClient = new LabInsightZepClient({
      apiKey: process.env.ZEP_API_KEY || '',
      userId: session.user.id
    });

    // Generate memory-enhanced analysis
    const analysis = await memoryEnhancedHealthAI.generateMemoryAwareInsights(
      assessmentData,
      session.user.id
    );

    // Create health assessment record
    const healthAssessment = await prisma.healthAssessment.create({
      data: {
        userId: session.user.id,
        assessmentType: assessmentData.type || 'comprehensive',
        overallScore: analysis.standardInsights?.overallScore || 0,
        energyLevel: analysis.standardInsights?.energyLevel || 0,
        metabolicHealth: analysis.standardInsights?.metabolicHealth || 0,
        stressLevel: analysis.standardInsights?.stressLevel || 0,
        thyroidFunction: analysis.standardInsights?.thyroidFunction || 0,
        mitochondrialHealth: analysis.standardInsights?.mitochondrialHealth || 0,
        hormonalBalance: analysis.standardInsights?.hormonalBalance || 0,
        inflammationLevel: analysis.standardInsights?.inflammationLevel || 0,
        keyFindings: analysis.standardInsights?.keyFindings || {},
        detailedInsights: analysis.personalizedInsights || analysis.standardInsights?.detailedInsights || {},
        comprehensiveData: analysis.standardInsights?.comprehensiveData || {},
        immediateActions: analysis.recommendations?.immediate || [],
        recommendations: analysis.recommendations?.detailed || [],
        layerProgress: { layer1: false, layer2: false, layer3: false },
        engagementMetrics: { timeSpent: 0, layerTransitions: [], achievements: [] },
        memoryContext: analysis.memoryContext || {},
        personalizationData: analysis.personalizedInsights || {},
        memoryEnhanced: enableMemoryEnhancement,
        zepSessionId: `health-analysis-${session.user.id}-${Date.now()}`
      }
    });

    // Create engagement analytics record
    await prisma.userEngagementAnalytics.create({
      data: {
        userId: session.user.id,
        assessmentId: healthAssessment.id,
        zepSessionId: healthAssessment.zepSessionId,
        memoryContextUsed: enableMemoryEnhancement,
        personalizedInsightsShown: !!analysis.personalizedInsights
      }
    });

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      assessmentId: healthAssessment.id,
      analysis: {
        standardInsights: analysis.standardInsights,
        personalizedInsights: analysis.personalizedInsights,
        memoryContext: analysis.memoryContext,
        recommendations: analysis.recommendations,
        engagementPredictions: analysis.engagementPredictions
      },
      memoryEnhanced: enableMemoryEnhancement,
      zepSessionId: healthAssessment.zepSessionId
    });

  } catch (error) {
    console.error('Memory-enhanced analysis failed:', error);
    
    // Return error response with fallback
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallbackAvailable: true
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const includeMemoryContext = searchParams.get('includeMemoryContext') === 'true';

    if (assessmentId) {
      // Get specific assessment
      const assessment = await prisma.healthAssessment.findFirst({
        where: {
          id: assessmentId,
          userId: session.user.id
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      if (!assessment) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }

      // Get engagement analytics
      const engagement = await prisma.userEngagementAnalytics.findFirst({
        where: { assessmentId: assessment.id }
      });

      return NextResponse.json({
        assessment,
        engagement,
        memoryContext: includeMemoryContext ? assessment.memoryContext : null
      });
    } else {
      // Get user's assessment history
      const assessments = await prisma.healthAssessment.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          assessmentType: true,
          overallScore: true,
          memoryEnhanced: true,
          createdAt: true,
          layerProgress: true,
          engagementMetrics: true
        }
      });

      // Get user memory preferences
      const memoryPreferences = await prisma.userMemoryPreferences.findUnique({
        where: { userId: session.user.id }
      });

      return NextResponse.json({
        assessments,
        memoryPreferences,
        totalAssessments: assessments.length,
        memoryEnhancedCount: assessments.filter(a => a.memoryEnhanced).length
      });
    }

  } catch (error) {
    console.error('Failed to retrieve assessment data:', error);
    return NextResponse.json({
      error: 'Failed to retrieve data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
