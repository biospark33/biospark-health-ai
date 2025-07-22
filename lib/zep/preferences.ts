
/**
 * Zep User Preferences & Learning
 * Phase 2B - AI-Powered Learning from User Interactions
 */

import { zepClient, withZepErrorHandling } from './client';
import { UserPreferences, HealthGoal, ZepOperationResult } from './types';

/**
 * Store user health preferences
 */
export async function storePreferences(
  userId: string,
  sessionId: string,
  preferences: UserPreferences
): Promise<ZepOperationResult<boolean>> {
  if (!zepClient) {
    return { success: false, error: { code: 'CLIENT_NOT_AVAILABLE', message: 'Zep client not initialized', timestamp: new Date() } };
  }

  return withZepErrorHandling(async () => {
    try {
      await zepClient.memory.add(sessionId, {
        messages: [{
          role: 'system',
          content: JSON.stringify(preferences),
          metadata: {
            userId,
            type: 'preferences',
            timestamp: new Date().toISOString(),
            version: '2.0'
          }
        }]
      });

      return { success: true, data: true };
    } catch (error) {
      throw new Error(`Failed to store preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<boolean>>;
}

/**
 * Retrieve user preferences
 */
export async function getPreferences(
  userId: string,
  sessionId: string
): Promise<ZepOperationResult<UserPreferences | null>> {
  if (!zepClient) {
    return { success: true, data: null };
  }

  return withZepErrorHandling(async () => {
    try {
      const searchResults = await zepClient.memory.search(sessionId, {
        text: 'user preferences health goals',
        limit: 1,
        metadata: {
          userId,
          type: 'preferences'
        }
      });

      if (searchResults.length === 0) {
        return { success: true, data: null };
      }

      const preferencesData = JSON.parse(searchResults[0].message?.content || '{}');
      return { success: true, data: preferencesData };
    } catch (error) {
      console.warn('Failed to parse preferences from memory:', error);
      return { success: true, data: null };
    }
  }) as Promise<ZepOperationResult<UserPreferences | null>>;
}

/**
 * Learn preferences implicitly from user interactions
 */
export async function implicitLearn(
  userId: string,
  sessionId: string,
  interaction: {
    action: string;
    context: string;
    response: 'positive' | 'negative' | 'neutral';
    metadata?: Record<string, any>;
  }
): Promise<ZepOperationResult<boolean>> {
  return withZepErrorHandling(async () => {
    try {
      // Store the interaction for learning
      await zepClient?.memory.add(sessionId, {
        messages: [{
          role: 'system',
          content: `User interaction: ${interaction.action} - ${interaction.response}`,
          metadata: {
            userId,
            type: 'implicit_learning',
            action: interaction.action,
            context: interaction.context,
            response: interaction.response,
            timestamp: new Date().toISOString(),
            ...interaction.metadata
          }
        }]
      });

      // Update preferences based on learning (simplified for Phase 2B)
      const currentPrefs = await getPreferences(userId, sessionId);
      if (currentPrefs.success && currentPrefs.data) {
        const updatedPrefs = { ...currentPrefs.data };
        
        // Simple learning: adjust focus areas based on positive interactions
        if (interaction.response === 'positive') {
          if (!updatedPrefs.focusAreas) updatedPrefs.focusAreas = [];
          if (interaction.context && !updatedPrefs.focusAreas.includes(interaction.context)) {
            updatedPrefs.focusAreas.push(interaction.context);
          }
        }

        await storePreferences(userId, sessionId, updatedPrefs);
      }

      return { success: true, data: true };
    } catch (error) {
      throw new Error(`Implicit learning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<boolean>>;
}

/**
 * Update health goals
 */
export async function updateHealthGoals(
  userId: string,
  sessionId: string,
  goals: HealthGoal[]
): Promise<ZepOperationResult<boolean>> {
  return withZepErrorHandling(async () => {
    try {
      await zepClient?.memory.add(sessionId, {
        messages: [{
          role: 'system',
          content: JSON.stringify({ healthGoals: goals }),
          metadata: {
            userId,
            type: 'goals',
            timestamp: new Date().toISOString(),
            goalCount: goals.length
          }
        }]
      });

      return { success: true, data: true };
    } catch (error) {
      throw new Error(`Failed to update health goals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<boolean>>;
}

/**
 * Get personalized recommendations based on preferences and history
 */
export async function getPersonalizedRecommendations(
  userId: string,
  sessionId: string,
  currentContext?: string
): Promise<ZepOperationResult<string[]>> {
  return withZepErrorHandling(async () => {
    // Get user preferences
    const prefsResult = await getPreferences(userId, sessionId);
    const preferences = prefsResult.data;

    // Get recent positive interactions
    const learningResults = await zepClient?.memory.search(sessionId, {
      text: 'positive interaction',
      limit: 10,
      metadata: {
        userId,
        type: 'implicit_learning',
        response: 'positive'
      }
    });

    const recommendations: string[] = [];

    // Generate recommendations based on preferences
    if (preferences?.focusAreas) {
      preferences.focusAreas.forEach(area => {
        recommendations.push(`Continue focusing on ${area} based on your preferences`);
      });
    }

    // Add recommendations based on positive interactions
    if (learningResults && learningResults.length > 0) {
      const positiveContexts = learningResults
        .map(r => r.message?.metadata?.context)
        .filter(Boolean)
        .slice(0, 3);

      positiveContexts.forEach(context => {
        recommendations.push(`Explore more about ${context} - you've shown interest in this area`);
      });
    }

    // Default recommendations if none found
    if (recommendations.length === 0) {
      recommendations.push(
        'Set up your health goals to get personalized recommendations',
        'Complete a comprehensive analysis to establish your baseline',
        'Track your progress regularly for better insights'
      );
    }

    return { success: true, data: recommendations };
  }) as Promise<ZepOperationResult<string[]>>;
}
