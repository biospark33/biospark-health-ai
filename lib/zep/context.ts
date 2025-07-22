
/**
 * Zep Context Management
 * Phase 2B - Intelligent Context Retrieval and Management
 */

import { zepClient, withZepErrorHandling } from './client';
import { semanticSearch, findRelevantContext } from './search';
import { summarizeMemory } from './summarize';
import { ZepOperationResult, ConversationContext, HealthContext } from './types';

/**
 * Get intelligent context for current conversation
 * Orchestrates search, summarization, and caching
 */
export async function getIntelligentContext(
  userId: string,
  sessionId: string,
  currentQuery: string,
  options: {
    includeHistory?: boolean;
    includePreferences?: boolean;
    includeGoals?: boolean;
    maxContextLength?: number;
  } = {}
): Promise<ZepOperationResult<HealthContext>> {
  const {
    includeHistory = true,
    includePreferences = true,
    includeGoals = true,
    maxContextLength = 2000
  } = options;

  return withZepErrorHandling(async () => {
    const context: HealthContext = {
      userId,
      sessionId,
      relevantHistory: [],
      userPreferences: {},
      healthGoals: [],
      conversationSummary: '',
      lastAnalysis: null,
      trends: [],
      timestamp: new Date()
    };

    // Get relevant historical context
    if (includeHistory) {
      const historyResult = await findRelevantContext(userId, sessionId, currentQuery, ['health_analysis']);
      if (historyResult.success) {
        context.relevantHistory = historyResult.data || [];
      }
    }

    // Get user preferences
    if (includePreferences) {
      const preferencesResult = await findRelevantContext(userId, sessionId, 'user preferences health goals', ['preferences']);
      if (preferencesResult.success && preferencesResult.data && preferencesResult.data.length > 0) {
        try {
          context.userPreferences = JSON.parse(preferencesResult.data[0].content);
        } catch (e) {
          console.warn('Failed to parse user preferences from memory');
        }
      }
    }

    // Get health goals
    if (includeGoals) {
      const goalsResult = await findRelevantContext(userId, sessionId, 'health goals objectives targets', ['goals']);
      if (goalsResult.success && goalsResult.data) {
        context.healthGoals = goalsResult.data.map(result => result.content);
      }
    }

    // Summarize if context is too long
    const totalContextLength = JSON.stringify(context).length;
    if (totalContextLength > maxContextLength) {
      const summaryResult = await summarizeMemory(userId, sessionId, context.relevantHistory);
      if (summaryResult.success) {
        context.conversationSummary = summaryResult.data || '';
        // Keep only most relevant items
        context.relevantHistory = context.relevantHistory.slice(0, 3);
      }
    }

    return { success: true, data: context };
  }) as Promise<ZepOperationResult<HealthContext>>;
}

/**
 * Update conversation context with new interaction
 */
export async function updateConversationContext(
  userId: string,
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
  analysisData?: any
): Promise<ZepOperationResult<boolean>> {
  if (!zepClient) {
    return { success: false, error: { code: 'CLIENT_NOT_AVAILABLE', message: 'Zep client not initialized', timestamp: new Date() } };
  }

  return withZepErrorHandling(async () => {
    try {
      // Store user message
      await zepClient.memory.add(sessionId, {
        messages: [
          {
            role: 'user',
            content: userMessage,
            metadata: {
              userId,
              type: 'user_message',
              timestamp: new Date().toISOString(),
              hasAnalysisData: !!analysisData
            }
          },
          {
            role: 'assistant',
            content: assistantResponse,
            metadata: {
              userId,
              type: 'assistant_response',
              timestamp: new Date().toISOString(),
              analysisData: analysisData ? JSON.stringify(analysisData) : undefined
            }
          }
        ]
      });

      return { success: true, data: true };
    } catch (error) {
      throw new Error(`Failed to update conversation context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<boolean>>;
}

/**
 * Get conversation summary for session
 */
export async function getConversationSummary(
  userId: string,
  sessionId: string
): Promise<ZepOperationResult<string>> {
  if (!zepClient) {
    return { success: false, error: { code: 'CLIENT_NOT_AVAILABLE', message: 'Zep client not initialized', timestamp: new Date() } };
  }

  return withZepErrorHandling(async () => {
    try {
      const summary = await zepClient.memory.getSummary(sessionId);
      return { success: true, data: summary?.content || '' };
    } catch (error) {
      throw new Error(`Failed to get conversation summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<string>>;
}
