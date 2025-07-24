

// Zep Preferences Management
// Phase 4 Final Optimization - Enhanced Preferences Handling
// Manages user preferences storage and retrieval in Zep memory

import { LabInsightZepClient } from '../zep-client';

export interface UserPreferences {
  healthGoals: string[];
  focusAreas: string[];
  communicationStyle: string;
  reminderFrequency: string;
  privacyLevel: string;
  rayPeatFocus?: boolean;
  bioenergetic?: boolean;
}

export interface PreferencesResult {
  success: boolean;
  preferences?: UserPreferences;
  error?: {
    code: string;
    message: string;
  };
}

// Global client instance for preferences operations
let globalZepClient: LabInsightZepClient | null = null;

export function setZepClient(client: LabInsightZepClient) {
  globalZepClient = client;
}

export async function storePreferences(
  userId: string,
  sessionId: string,
  preferences: UserPreferences
): Promise<PreferencesResult> {
  try {
    if (!globalZepClient) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_AVAILABLE',
          message: 'Zep client not initialized'
        }
      };
    }

    // Store preferences as memory with proper metadata
    const memoryData = {
      messages: [{
        role: 'system',
        content: JSON.stringify(preferences),
        metadata: {
          type: 'preferences',
          userId,
          version: '2.0',
          timestamp: new Date().toISOString()
        }
      }]
    };

    await globalZepClient.addMemory(sessionId, memoryData);

    return {
      success: true,
      preferences
    };
  } catch (error) {
    console.error('Failed to store preferences:', error);
    return {
      success: false,
      error: {
        code: 'STORAGE_FAILED',
        message: `Failed to store preferences: ${error}`
      }
    };
  }
}

export async function getPreferences(
  userId: string,
  sessionId: string
): Promise<PreferencesResult> {
  try {
    if (!globalZepClient) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_AVAILABLE',
          message: 'Zep client not initialized'
        }
      };
    }

    // Search for user preferences
    const results = await globalZepClient.searchMemory(sessionId, 'preferences', {
      metadata: {
        type: 'preferences',
        userId
      },
      limit: 1
    });

    if (!results || results.length === 0) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No preferences found for user'
        }
      };
    }

    const preferencesData = results[0];
    const preferences = JSON.parse(preferencesData.message?.content || '{}');

    return {
      success: true,
      preferences
    };
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return {
      success: false,
      error: {
        code: 'RETRIEVAL_FAILED',
        message: `Failed to get preferences: ${error}`
      }
    };
  }
}

export async function updatePreferences(
  userId: string,
  sessionId: string,
  updates: Partial<UserPreferences>
): Promise<PreferencesResult> {
  try {
    // Get existing preferences
    const existingResult = await getPreferences(userId, sessionId);
    
    let currentPreferences: UserPreferences;
    if (existingResult.success && existingResult.preferences) {
      currentPreferences = existingResult.preferences;
    } else {
      // Default preferences if none exist
      currentPreferences = {
        healthGoals: [],
        focusAreas: [],
        communicationStyle: 'balanced',
        reminderFrequency: 'weekly',
        privacyLevel: 'standard'
      };
    }

    // Merge updates with existing preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...updates
    };

    // Store updated preferences
    return await storePreferences(userId, sessionId, updatedPreferences);
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: `Failed to update preferences: ${error}`
      }
    };
  }
}

export async function deletePreferences(
  userId: string,
  sessionId: string
): Promise<PreferencesResult> {
  try {
    if (!globalZepClient) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_AVAILABLE',
          message: 'Zep client not initialized'
        }
      };
    }

    // Note: Zep doesn't have direct delete memory functionality
    // We'll mark preferences as deleted by storing a deletion marker
    const deletionMarker = {
      messages: [{
        role: 'system',
        content: JSON.stringify({ deleted: true, deletedAt: new Date().toISOString() }),
        metadata: {
          type: 'preferences_deleted',
          userId,
          version: '2.0',
          timestamp: new Date().toISOString()
        }
      }]
    };

    await globalZepClient.addMemory(sessionId, deletionMarker);

    return {
      success: true
    };
  } catch (error) {
    console.error('Failed to delete preferences:', error);
    return {
      success: false,
      error: {
        code: 'DELETION_FAILED',
        message: `Failed to delete preferences: ${error}`
      }
    };
  }
}
