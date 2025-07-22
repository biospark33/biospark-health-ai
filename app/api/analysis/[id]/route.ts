
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedAnalysis = {
      id: analysis.id,
      metabolicScore: analysis.metabolicScore,
      thyroidScore: analysis.thyroidScore,
      metabolicHealth: analysis.metabolicHealth,
      inflammation: analysis.inflammation,
      nutrients: analysis.nutrients,
      biomarkers: analysis.biomarkers,
      patterns: analysis.patterns,
      criticalFindings: analysis.criticalFindings,
      recommendations: analysis.recommendations,
      aiInsights: (analysis.recommendations as any)?.aiInsights || null,
      analysisType: analysis.analysisType,
      createdAt: analysis.createdAt.toISOString(),
      email: analysis.email,
      initials: analysis.initials,
      age: analysis.age,
      city: analysis.city,
      user: analysis.user,
    };

    return NextResponse.json(transformedAnalysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
