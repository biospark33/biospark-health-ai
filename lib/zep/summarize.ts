
/**
 * Zep Memory Summarization
 * Phase 2B - Automatic Summarization of Health Analysis Histories
 */

import { zepClient, withZepErrorHandling } from './client';
import { MemorySearchResult, ZepOperationResult } from './types';

/**
 * Summarize memory content for long conversation histories
 */
export async function summarizeMemory(
  userId: string,
  sessionId: string,
  memoryResults: MemorySearchResult[],
  maxLength: number = 500
): Promise<ZepOperationResult<string>> {
  if (!zepClient) {
    return { success: false, error: { code: 'CLIENT_NOT_AVAILABLE', message: 'Zep client not initialized', timestamp: new Date() } };
  }

  return withZepErrorHandling(async () => {
    if (memoryResults.length === 0) {
      return { success: true, data: '' };
    }

    try {
      // Combine all memory content
      const combinedContent = memoryResults
        .map(result => result.content)
        .join('\n\n');

      // If content is already short enough, return as-is
      if (combinedContent.length <= maxLength) {
        return { success: true, data: combinedContent };
      }

      // Use Zep's summarization if available, otherwise create a simple summary
      try {
        const summary = await zepClient.memory.getSummary(sessionId);
        if (summary?.content) {
          return { success: true, data: summary.content };
        }
      } catch (e) {
        console.warn('Zep summarization not available, using fallback');
      }

      // Fallback: Create a structured summary
      const healthAnalyses = memoryResults.filter(r => r.type === 'health_analysis');
      const conversations = memoryResults.filter(r => r.type === 'conversation');
      
      let summary = '';
      
      if (healthAnalyses.length > 0) {
        summary += `Recent Health Analyses (${healthAnalyses.length}): `;
        summary += healthAnalyses
          .slice(0, 3)
          .map(a => a.content.substring(0, 100) + '...')
          .join('; ');
        summary += '\n\n';
      }

      if (conversations.length > 0) {
        summary += `Key Conversation Points: `;
        summary += conversations
          .slice(0, 2)
          .map(c => c.content.substring(0, 150) + '...')
          .join('; ');
      }

      return { success: true, data: summary.substring(0, maxLength) };
    } catch (error) {
      throw new Error(`Memory summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<string>>;
}

/**
 * Summarize health analysis trends over time
 */
export async function summarizeHealthTrends(
  userId: string,
  sessionId: string,
  timeframe: 'week' | 'month' | 'quarter' = 'month'
): Promise<ZepOperationResult<string>> {
  return withZepErrorHandling(async () => {
    // Get health analyses from the specified timeframe
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
    }

    // Search for health analyses in timeframe
    const searchResult = await zepClient?.memory.search(sessionId, {
      text: 'health analysis biomarkers trends',
      limit: 20,
      metadata: {
        userId,
        type: 'health_analysis',
        timestamp: { $gte: startDate.toISOString() }
      }
    });

    if (!searchResult || searchResult.length === 0) {
      return { success: true, data: `No health analyses found in the last ${timeframe}.` };
    }

    // Analyze trends
    const analyses = searchResult.map(r => ({
      content: r.message?.content || '',
      timestamp: new Date(r.message?.created_at || ''),
      metadata: r.message?.metadata || {}
    }));

    // Create trend summary
    let trendSummary = `Health Trends (Last ${timeframe}):\n`;
    trendSummary += `• Total analyses: ${analyses.length}\n`;
    
    // Extract key patterns (simplified for Phase 2B)
    const keyTerms = ['improved', 'elevated', 'normal', 'concerning', 'optimal'];
    const termCounts = keyTerms.reduce((acc, term) => {
      acc[term] = analyses.filter(a => a.content.toLowerCase().includes(term)).length;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(termCounts).forEach(([term, count]) => {
      if (count > 0) {
        trendSummary += `• ${term}: ${count} mentions\n`;
      }
    });

    return { success: true, data: trendSummary };
  }) as Promise<ZepOperationResult<string>>;
}

/**
 * Create personalized health insights summary
 */
export async function createPersonalizedInsights(
  userId: string,
  sessionId: string,
  currentAnalysis?: any
): Promise<ZepOperationResult<string>> {
  return withZepErrorHandling(async () => {
    // Get recent context and trends
    const trendsResult = await summarizeHealthTrends(userId, sessionId, 'month');
    const trends = trendsResult.success ? trendsResult.data : '';

    // Get user preferences
    const preferencesSearch = await zepClient?.memory.search(sessionId, {
      text: 'user preferences health goals',
      limit: 3,
      metadata: { userId, type: 'preferences' }
    });

    let insights = 'Personalized Health Insights:\n\n';
    
    if (trends) {
      insights += `Trends: ${trends}\n\n`;
    }

    if (currentAnalysis) {
      insights += `Current Analysis: Based on your latest results, `;
      insights += `we've identified key areas for focus.\n\n`;
    }

    if (preferencesSearch && preferencesSearch.length > 0) {
      insights += `Your Goals: Continuing to track progress toward your health objectives.\n`;
    }

    insights += `Recommendations: Maintain consistent monitoring and follow personalized guidance.`;

    return { success: true, data: insights };
  }) as Promise<ZepOperationResult<string>>;
}
