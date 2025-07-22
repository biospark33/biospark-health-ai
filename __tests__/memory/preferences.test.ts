
/**
 * Zep Preferences Tests
 * Phase 2B - Testing User Preference Learning
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { 
  storePreferences, 
  getPreferences, 
  implicitLearn,
  getPersonalizedRecommendations 
} from '@/lib/zep/preferences';

// Mock Zep client
jest.mock('@/lib/zep/client', () => ({
  zepClient: {
    memory: {
      add: jest.fn(),
      search: jest.fn()
    }
  },
  withZepErrorHandling: jest.fn((fn) => fn())
}));

describe('Zep Preferences Management', () => {
  const mockUserId = 'test-user-123';
  const mockSessionId = 'test-session-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storePreferences', () => {
    it('should store user preferences successfully', async () => {
      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.add.mockResolvedValue(true);

      const preferences = {
        healthGoals: ['weight_loss', 'energy_improvement'],
        focusAreas: ['cardiovascular', 'metabolic'],
        communicationStyle: 'detailed',
        reminderFrequency: 'weekly',
        privacyLevel: 'standard',
        rayPeatFocus: true,
        bioenergetic: true
      };

      const result = await storePreferences(mockUserId, mockSessionId, preferences);

      expect(result.success).toBe(true);
      expect(zepClient.memory.add).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: JSON.stringify(preferences),
              metadata: expect.objectContaining({
                userId: mockUserId,
                type: 'preferences',
                version: '2.0'
              })
            })
          ])
        })
      );
    });
  });

  describe('getPreferences', () => {
    it('should retrieve user preferences successfully', async () => {
      const mockPreferences = {
        healthGoals: ['energy_improvement'],
        focusAreas: ['thyroid'],
        communicationStyle: 'concise'
      };

      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.search.mockResolvedValue([
        {
          message: {
            content: JSON.stringify(mockPreferences)
          }
        }
      ]);

      const result = await getPreferences(mockUserId, mockSessionId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPreferences);
    });

    it('should return null when no preferences found', async () => {
      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.search.mockResolvedValue([]);

      const result = await getPreferences(mockUserId, mockSessionId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('implicitLearn', () => {
    it('should learn from positive user interactions', async () => {
      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.add.mockResolvedValue(true);
      zepClient.memory.search.mockResolvedValue([
        {
          message: {
            content: JSON.stringify({ focusAreas: ['cardiovascular'] })
          }
        }
      ]);

      const interaction = {
        action: 'view_analysis',
        context: 'thyroid_function',
        response: 'positive',
        metadata: { duration: 120 }
      };

      const result = await implicitLearn(mockUserId, mockSessionId, interaction);

      expect(result.success).toBe(true);
      expect(zepClient.memory.add).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              metadata: expect.objectContaining({
                type: 'implicit_learning',
                action: 'view_analysis',
                response: 'positive'
              })
            })
          ])
        })
      );
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should generate recommendations based on preferences and learning', async () => {
      const { zepClient } = require('@/lib/zep/client');
      
      // Mock preferences
      zepClient.memory.search
        .mockResolvedValueOnce([
          {
            message: {
              content: JSON.stringify({ focusAreas: ['thyroid', 'metabolic'] })
            }
          }
        ])
        // Mock positive interactions
        .mockResolvedValueOnce([
          {
            message: {
              metadata: { context: 'vitamin_d_analysis' }
            }
          }
        ]);

      const result = await getPersonalizedRecommendations(mockUserId, mockSessionId);

      expect(result.success).toBe(true);
      expect(result.data).toContain('Continue focusing on thyroid based on your preferences');
      expect(result.data).toContain('Continue focusing on metabolic based on your preferences');
    });

    it('should provide default recommendations when no data available', async () => {
      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.search.mockResolvedValue([]);

      const result = await getPersonalizedRecommendations(mockUserId, mockSessionId);

      expect(result.success).toBe(true);
      expect(result.data).toContain('Set up your health goals');
      expect(result.data).toContain('Complete a comprehensive analysis');
    });
  });
});
