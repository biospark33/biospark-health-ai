
/**
 * Zep Memory Analytics
 * Phase 2B - Progress Analytics and Health Journey Insights
 */

import { zepClient, withZepErrorHandling } from './client';
import { ZepOperationResult, HealthTrend, ProgressMilestone } from './types';

/**
 * Analyze health trends over time
 */
export async function analyzeHealthTrends(
  userId: string,
  sessionId: string,
  timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<ZepOperationResult<HealthTrend[]>> {
  return withZepErrorHandling(async () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Search for health analyses in timeframe
    const searchResults = await zepClient?.memory.search(sessionId, {
      text: 'health analysis biomarkers lab results',
      limit: 50,
      metadata: {
        userId,
        type: 'health_analysis',
        timestamp: { $gte: startDate.toISOString() }
      }
    });

    if (!searchResults || searchResults.length === 0) {
      return { success: true, data: [] };
    }

    // Analyze trends from search results
    const trends: HealthTrend[] = [];
    
    // Group by biomarker types and analyze trends
    const biomarkerData = new Map<string, Array<{ value: number; date: Date }>>();
    
    searchResults.forEach(result => {
      try {
        const analysisData = JSON.parse(result.message?.metadata?.analysisData || '{}');
        const timestamp = new Date(result.message?.created_at || '');
        
        // Extract biomarker values (simplified for Phase 2B)
        Object.entries(analysisData).forEach(([key, value]) => {
          if (typeof value === 'number') {
            if (!biomarkerData.has(key)) {
              biomarkerData.set(key, []);
            }
            biomarkerData.get(key)?.push({ value, date: timestamp });
          }
        });
      } catch (e) {
        console.warn('Failed to parse analysis data for trends');
      }
    });

    // Calculate trends for each biomarker
    biomarkerData.forEach((values, biomarker) => {
      if (values.length >= 2) {
        // Sort by date
        values.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const firstValue = values[0].value;
        const lastValue = values[values.length - 1].value;
        const change = lastValue - firstValue;
        const percentChange = (change / firstValue) * 100;
        
        trends.push({
          biomarker,
          direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
          percentChange,
          dataPoints: values.length,
          timeframe,
          significance: Math.abs(percentChange) > 10 ? 'high' : Math.abs(percentChange) > 5 ? 'medium' : 'low'
        });
      }
    });

    return { success: true, data: trends };
  }) as Promise<ZepOperationResult<HealthTrend[]>>;
}

/**
 * Track progress milestones
 */
export async function trackProgressMilestones(
  userId: string,
  sessionId: string
): Promise<ZepOperationResult<ProgressMilestone[]>> {
  return withZepErrorHandling(async () => {
    // Search for milestone-related memories
    const milestoneResults = await zepClient?.memory.search(sessionId, {
      text: 'milestone achievement goal progress improvement',
      limit: 20,
      metadata: {
        userId,
        type: { $in: ['milestone', 'achievement', 'goal_progress'] }
      }
    });

    const milestones: ProgressMilestone[] = [];

    if (milestoneResults) {
      milestoneResults.forEach(result => {
        try {
          const milestoneData = JSON.parse(result.message?.content || '{}');
          milestones.push({
            id: result.message?.uuid || '',
            title: milestoneData.title || 'Health Progress',
            description: milestoneData.description || result.message?.content || '',
            achievedAt: new Date(result.message?.created_at || ''),
            category: milestoneData.category || 'general',
            impact: milestoneData.impact || 'medium'
          });
        } catch (e) {
          // Create milestone from content
          milestones.push({
            id: result.message?.uuid || '',
            title: 'Health Progress',
            description: result.message?.content || '',
            achievedAt: new Date(result.message?.created_at || ''),
            category: 'general',
            impact: 'medium'
          });
        }
      });
    }

    return { success: true, data: milestones };
  }) as Promise<ZepOperationResult<ProgressMilestone[]>>;
}

/**
 * Generate progress insights
 */
export async function generateProgressInsights(
  userId: string,
  sessionId: string
): Promise<ZepOperationResult<string>> {
  return withZepErrorHandling(async () => {
    // Get trends and milestones
    const trendsResult = await analyzeHealthTrends(userId, sessionId, 'month');
    const milestonesResult = await trackProgressMilestones(userId, sessionId);

    const trends = trendsResult.data || [];
    const milestones = milestonesResult.data || [];

    let insights = 'Your Health Progress Insights:\n\n';

    // Analyze trends
    if (trends.length > 0) {
      const improvingTrends = trends.filter(t => t.direction === 'increasing' && t.significance !== 'low');
      const decliningTrends = trends.filter(t => t.direction === 'decreasing' && t.significance !== 'low');

      if (improvingTrends.length > 0) {
        insights += `✅ Positive Trends: ${improvingTrends.map(t => t.biomarker).join(', ')} showing improvement\n`;
      }

      if (decliningTrends.length > 0) {
        insights += `⚠️ Areas for Attention: ${decliningTrends.map(t => t.biomarker).join(', ')} need focus\n`;
      }

      insights += '\n';
    }

    // Recent milestones
    if (milestones.length > 0) {
      const recentMilestones = milestones
        .sort((a, b) => b.achievedAt.getTime() - a.achievedAt.getTime())
        .slice(0, 3);

      insights += `🎯 Recent Achievements:\n`;
      recentMilestones.forEach(milestone => {
        insights += `• ${milestone.title}: ${milestone.description}\n`;
      });
      insights += '\n';
    }

    // Overall assessment
    const positiveCount = trends.filter(t => t.direction === 'increasing').length;
    const totalTrends = trends.length;
    
    if (totalTrends > 0) {
      const positiveRatio = positiveCount / totalTrends;
      if (positiveRatio > 0.6) {
        insights += `🌟 Overall: You're making excellent progress! ${Math.round(positiveRatio * 100)}% of tracked metrics are improving.`;
      } else if (positiveRatio > 0.4) {
        insights += `📈 Overall: Good progress with room for improvement. Focus on the areas needing attention.`;
      } else {
        insights += `💪 Overall: Let's work together to improve your health metrics. Consider adjusting your approach.`;
      }
    }

    return { success: true, data: insights };
  }) as Promise<ZepOperationResult<string>>;
}
