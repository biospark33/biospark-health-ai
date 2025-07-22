
/**
 * Zep Memory Operations
 * Phase 2B Enhanced - Advanced Health Analysis Memory Management
 */

import { zepClient, withZepErrorHandling } from './client';
import { semanticSearch } from './search';
import { getIntelligentContext, updateConversationContext } from './context';
import { summarizeMemory } from './summarize';
import { storePreferences, getPreferences, implicitLearn } from './preferences';
import { analyzeHealthTrends, generateProgressInsights } from './analytics';
import { memoryCache, withCache, getCachedSearchKey } from '../cache/memory-cache';
import {
  HealthMemory,
  AnalysisSummary,
  UserPreferences,
  MemorySearchQuery,
  MemorySearchResult,
  ZepOperationResult,
  HealthContext
} from './types';

// Store health analysis results in memory with enhanced features
export async function storeHealthAnalysis(
  userId: string,
  sessionId: string,
  analysis: AnalysisSummary
): Promise<ZepOperationResult<boolean>> {
  if (!zepClient) {
    console.warn('Zep client not available, skipping memory storage');
    return { success: false, error: { code: 'CLIENT_NOT_AVAILABLE', message: 'Zep client not initialized', timestamp: new Date() } };
  }

  return withZepErrorHandling(async () => {
    try {
      // Store the analysis with rich metadata for future retrieval
      await zepClient.memory.add(sessionId, {
        messages: [{
          role: 'system',
          content: `Health Analysis: ${analysis.summary || 'Comprehensive health analysis completed'}`,
          metadata: {
            userId,
            type: 'health_analysis',
            analysisId: analysis.id,
            severity: analysis.severity,
            timestamp: new Date().toISOString(),
            analysisData: JSON.stringify(analysis),
            biomarkers: analysis.labResults?.keyFindings || [],
            recommendations: analysis.labResults?.recommendations || [],
            riskFactors: analysis.labResults?.riskFactors || []
          }
        }]
      });

      // Clear relevant caches
      const searchKey = getCachedSearchKey(userId, 'health analysis');
      memoryCache.delete(searchKey);

      console.log('✅ Health analysis stored in Zep memory:', {
        userId,
        sessionId,
        analysisId: analysis.id,
        severity: analysis.severity
      });

      return { success: true, data: true };
    } catch (error) {
      throw new Error(`Failed to store health analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<boolean>>;
}

// Store user preferences in memory (delegated to preferences service)
export async function storeUserPreferences(
  userId: string,
  sessionId: string,
  preferences: UserPreferences
): Promise<ZepOperationResult<boolean>> {
  return storePreferences(userId, sessionId, preferences);
}

// Enhanced health context retrieval with caching
export async function getHealthContext(
  userId: string,
  sessionId: string,
  query?: string
): Promise<ZepOperationResult<HealthContext>> {
  const cacheKey = `context:${userId}:${sessionId}:${query || 'default'}`;
  
  return withCache(cacheKey, async () => {
    return getIntelligentContext(userId, sessionId, query || 'health analysis recommendations', {
      includeHistory: true,
      includePreferences: true,
      includeGoals: true,
      maxContextLength: 2000
    });
  }, 2 * 60 * 1000); // 2 minute cache
}

// Get user's analysis history with enhanced search
export async function getUserAnalysisHistory(
  userId: string,
  sessionId: string,
  limit: number = 5
): Promise<ZepOperationResult<AnalysisSummary[]>> {
  const cacheKey = getCachedSearchKey(userId, 'analysis_history', { limit });
  
  return withCache(cacheKey, async () => {
    const searchResult = await semanticSearch(
      userId,
      sessionId,
      'health analysis biomarkers lab results',
      limit,
      { userId, type: 'health_analysis' }
    );

    if (!searchResult.success) {
      return searchResult as ZepOperationResult<AnalysisSummary[]>;
    }

    // Convert search results to AnalysisSummary format
    const analyses: AnalysisSummary[] = (searchResult.data || []).map(result => {
      try {
        const analysisData = JSON.parse(result.metadata.analysisData || '{}');
        return {
          id: result.id,
          timestamp: result.timestamp,
          summary: result.content,
          severity: result.metadata.severity || 'medium',
          labResults: analysisData.labResults || {
            testType: 'comprehensive',
            keyFindings: result.metadata.biomarkers || [],
            recommendations: result.metadata.recommendations || [],
            riskFactors: result.metadata.riskFactors || []
          },
          bioenergetic: analysisData.bioenergetic || {},
          recommendations: result.metadata.recommendations || []
        };
      } catch (e) {
        // Fallback for parsing errors
        return {
          id: result.id,
          timestamp: result.timestamp,
          summary: result.content,
          severity: 'medium',
          labResults: {
            testType: 'comprehensive',
            keyFindings: [],
            recommendations: [],
            riskFactors: []
          },
          bioenergetic: {},
          recommendations: []
        };
      }
    });

    return { success: true, data: analyses };
  }, 5 * 60 * 1000); // 5 minute cache
}

// Enhanced conversation context storage
export async function storeConversationContext(
  userId: string,
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
  context?: Record<string, any>
): Promise<ZepOperationResult<boolean>> {
  // Use the enhanced context service
  const result = await updateConversationContext(
    userId,
    sessionId,
    userMessage,
    assistantResponse,
    context
  );

  // Learn from the interaction
  if (result.success && context?.userFeedback) {
    await implicitLearn(userId, sessionId, {
      action: 'conversation',
      context: userMessage,
      response: context.userFeedback,
      metadata: context
    });
  }

  return result;
}

// Phase 2B Enhanced Memory Operations

/**
 * Get comprehensive health insights with memory integration
 */
export async function getComprehensiveHealthInsights(
  userId: string,
  sessionId: string,
  currentAnalysis?: any
): Promise<ZepOperationResult<{
  context: HealthContext;
  trends: any[];
  insights: string;
  recommendations: string[];
}>> {
  return withZepErrorHandling(async () => {
    // Get intelligent context
    const contextResult = await getIntelligentContext(userId, sessionId, 'comprehensive health insights');
    
    // Get health trends
    const trendsResult = await analyzeHealthTrends(userId, sessionId, 'month');
    
    // Generate progress insights
    const insightsResult = await generateProgressInsights(userId, sessionId);
    
    // Get personalized recommendations
    const preferencesResult = await getPreferences(userId, sessionId);
    const recommendations: string[] = [];
    
    if (preferencesResult.success && preferencesResult.data) {
      // Add preference-based recommendations
      const prefs = preferencesResult.data;
      if (prefs.focusAreas) {
        prefs.focusAreas.forEach(area => {
          recommendations.push(`Continue monitoring ${area} based on your health goals`);
        });
      }
    }

    return {
      success: true,
      data: {
        context: contextResult.success ? contextResult.data! : {
          userId,
          sessionId,
          relevantHistory: [],
          userPreferences: {},
          healthGoals: [],
          conversationSummary: '',
          lastAnalysis: null,
          trends: [],
          timestamp: new Date()
        },
        trends: trendsResult.success ? trendsResult.data || [] : [],
        insights: insightsResult.success ? insightsResult.data || '' : '',
        recommendations
      }
    };
  }) as Promise<ZepOperationResult<{
    context: HealthContext;
    trends: any[];
    insights: string;
    recommendations: string[];
  }>>;
}

/**
 * Smart greeting based on user history and context
 */
export async function getPersonalizedGreeting(
  userId: string,
  sessionId: string
): Promise<ZepOperationResult<string>> {
  return withZepErrorHandling(async () => {
    // Get user's recent activity
    const recentActivity = await semanticSearch(
      userId,
      sessionId,
      'health analysis conversation',
      3,
      { userId }
    );

    // Get user preferences
    const preferencesResult = await getPreferences(userId, sessionId);
    
    let greeting = 'Welcome back to LabInsight AI! ';

    if (recentActivity.success && recentActivity.data && recentActivity.data.length > 0) {
      const lastActivity = recentActivity.data[0];
      const daysSinceLastActivity = Math.floor(
        (Date.now() - lastActivity.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity === 0) {
        greeting += "Great to see you again today! ";
      } else if (daysSinceLastActivity === 1) {
        greeting += "Welcome back! It's been a day since your last visit. ";
      } else if (daysSinceLastActivity <= 7) {
        greeting += `Welcome back! It's been ${daysSinceLastActivity} days since your last analysis. `;
      } else {
        greeting += "Welcome back! It's been a while since your last visit. ";
      }
    } else {
      greeting += "I'm excited to help you with your health analysis today! ";
    }

    // Add personalized touch based on preferences
    if (preferencesResult.success && preferencesResult.data?.focusAreas) {
      const focusArea = preferencesResult.data.focusAreas[0];
      greeting += `Ready to continue focusing on your ${focusArea}?`;
    } else {
      greeting += "What would you like to explore about your health today?";
    }

    return { success: true, data: greeting };
  }) as Promise<ZepOperationResult<string>>;
}

/**
 * Memory cleanup and retention management
 */
export async function cleanupMemory(
  userId: string,
  sessionId: string,
  retentionDays: number = 90
): Promise<ZepOperationResult<{ deletedCount: number; retainedCount: number }>> {
  return withZepErrorHandling(async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // This would typically involve Zep's memory management APIs
    // For Phase 2B, we'll implement a basic cleanup strategy
    console.log(`Memory cleanup initiated for user ${userId}, retaining ${retentionDays} days`);

    // Clear local caches
    memoryCache.clear();

    return {
      success: true,
      data: {
        deletedCount: 0, // Would be actual count from Zep
        retainedCount: 0  // Would be actual count from Zep
      }
    };
  }) as Promise<ZepOperationResult<{ deletedCount: number; retainedCount: number }>>;
}

// Get or create user session for memory operations
export async function getOrCreateUserSession(
  userId: string,
  sessionId?: string
): Promise<ZepOperationResult<string>> {
  return withZepErrorHandling(async () => {
    if (!zepClient) {
      throw new Error('Zep client not initialized');
    }

    const finalSessionId = sessionId || `session_${userId}_${Date.now()}`;
    
    try {
      // Try to get existing session
      await zepClient.memory.getSession(finalSessionId);
      return finalSessionId;
    } catch (error) {
      // Session doesn't exist, create new one
      await zepClient.memory.addSession({
        sessionId: finalSessionId,
        userId: userId,
        metadata: {
          created_at: new Date().toISOString(),
          user_id: userId
        }
      });
      return finalSessionId;
    }
  });
}

// Re-export enhanced services for easy access
export {
  semanticSearch,
  getIntelligentContext,
  summarizeMemory,
  storePreferences,
  getPreferences,
  implicitLearn,
  analyzeHealthTrends,
  generateProgressInsights
};
