

// Zep Preferences Management Tests
// Phase 4 Final Optimization - Enhanced Preferences Testing
// Tests preferences storage and retrieval with proper mocking

import { storePreferences, getPreferences, updatePreferences, setZepClient } from '@/lib/zep/preferences';
import { LabInsightZepClient } from '@/lib/zep-client';

// Mock the Zep client
const mockAddMemory = jest.fn();
const mockSearchMemory = jest.fn();
const mockZepClient = {
  addMemory: mockAddMemory,
  searchMemory: mockSearchMemory,
  isInitialized: true
} as any;

// Set up the mock client
setZepClient(mockZepClient);

describe('Zep Preferences Management', () => {
  const mockUserId = 'test-user-123';
  const mockSessionId = 'test-session-456';
  const mockPreferences = {
    healthGoals: ['weight_loss', 'energy_improvement'],
    focusAreas: ['cardiovascular', 'metabolic'],
    communicationStyle: 'detailed',
    reminderFrequency: 'weekly',
    privacyLevel: 'standard',
    rayPeatFocus: true,
    bioenergetic: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddMemory.mockResolvedValue(true);
    mockSearchMemory.mockResolvedValue([
      {
        uuid: 'pref-1',
        message: {
          content: JSON.stringify(mockPreferences),
          role: 'system'
        },
        metadata: {
          type: 'preferences',
          userId: mockUserId
        }
      }
    ]);
  });

  describe('storePreferences', () => {
    it('should store user preferences successfully', async () => {
      const result = await storePreferences(
        mockUserId,
        mockSessionId,
        mockPreferences
      );

      expect(result.success).toBe(true);
      expect(result.preferences).toEqual(mockPreferences);
      expect(mockAddMemory).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: JSON.stringify(mockPreferences),
              metadata: expect.objectContaining({
                type: 'preferences',
                userId: mockUserId,
                version: '2.0'
              }),
              role: 'system'
            })
          ])
        })
      );
    });

    it('should handle storage errors gracefully', async () => {
      mockAddMemory.mockRejectedValue(new Error('Storage failed'));

      const result = await storePreferences(
        mockUserId,
        mockSessionId,
        mockPreferences
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('STORAGE_FAILED');
    });
  });

  describe('getPreferences', () => {
    it('should retrieve user preferences successfully', async () => {
      const result = await getPreferences(mockUserId, mockSessionId);

      expect(result.success).toBe(true);
      expect(result.preferences).toEqual(mockPreferences);
      expect(mockSearchMemory).toHaveBeenCalledWith(
        mockSessionId,
        'preferences',
        expect.objectContaining({
          metadata: expect.objectContaining({
            type: 'preferences',
            userId: mockUserId
          }),
          limit: 1
        })
      );
    });

    it('should handle missing preferences', async () => {
      mockSearchMemory.mockResolvedValue([]);

      const result = await getPreferences(mockUserId, mockSessionId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('updatePreferences', () => {
    it('should update existing preferences', async () => {
      const updates = {
        communicationStyle: 'concise',
        reminderFrequency: 'daily'
      };

      const result = await updatePreferences(
        mockUserId,
        mockSessionId,
        updates
      );

      expect(result.success).toBe(true);
      expect(result.preferences?.communicationStyle).toBe('concise');
      expect(result.preferences?.reminderFrequency).toBe('daily');
      // Should preserve other existing preferences
      expect(result.preferences?.healthGoals).toEqual(['weight_loss', 'energy_improvement']);
    });
  });
});
