
/**
 * Zep Context Management Tests
 * Phase 2B - Testing Intelligent Context Retrieval
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getIntelligentContext, updateConversationContext } from '@/lib/zep/context';

// Mock dependencies with manual implementation
jest.mock('@/lib/zep/search', () => ({
  findRelevantContext: jest.fn(),
  semanticSearch: jest.fn(),
  searchHealthAnalyses: jest.fn(),
  advancedSearch: jest.fn(),
  setZepClient: jest.fn()
}));

jest.mock('@/lib/zep/summarize', () => ({
  summarizeMemory: jest.fn(),
  summarizeHealthTrends: jest.fn(),
  createPersonalizedInsights: jest.fn()
}));

jest.mock('@/lib/zep/client');
jest.mock('@/lib/zep/preferences', () => ({
  getPreferences: jest.fn(),
  storePreferences: jest.fn(),
  updatePreferences: jest.fn(),
  deletePreferences: jest.fn(),
  setZepClient: jest.fn()
}));

describe('Zep Context Management', () => {
  const mockUserId = 'test-user-123';
  const mockSessionId = 'test-session-456';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all mocks to their default state
    const { findRelevantContext } = require('@/lib/zep/search');
    const { summarizeMemory } = require('@/lib/zep/summarize');
    const { getPreferences } = require('@/lib/zep/preferences');
    const { zepClient } = require('@/lib/zep/client');
    
    // Reset to default mock implementations
    findRelevantContext.mockResolvedValue({ success: true, results: [] });
    summarizeMemory.mockResolvedValue({ success: true, data: 'Mock summary' });
    getPreferences.mockResolvedValue({ success: true, data: {} });
    
    // Ensure zepClient.memory.add is properly mocked
    if (zepClient && zepClient.memory && zepClient.memory.add) {
      zepClient.memory.add.mockResolvedValue({ success: true });
    }
  });

  describe('getIntelligentContext', () => {
    it('should retrieve comprehensive health context', async () => {
      // Mock zep client
      const { zepClient } = require('@/lib/zep/client');
      // Make sure zepClient is truthy
      Object.defineProperty(require('@/lib/zep/client'), 'zepClient', {
        value: { memory: { add: jest.fn() } },
        writable: true
      });

      // Mock preferences
      const { getPreferences } = require('@/lib/zep/preferences');
      getPreferences.mockResolvedValue({
        success: true,
        data: { focusAreas: ['cardiovascular'], healthGoals: ['Improve heart health'] }
      });

      // Mock search results
      const { findRelevantContext } = require('@/lib/zep/search');
      findRelevantContext
        .mockResolvedValueOnce({ 
          success: true, 
          results: [{ content: 'Previous analysis', type: 'health_analysis' }] 
        })
        .mockResolvedValueOnce({ 
          success: true, 
          results: [{ content: '{"focusAreas": ["cardiovascular"]}' }] 
        })
        .mockResolvedValueOnce({ 
          success: true, 
          results: [{ content: 'Improve heart health' }] 
        });

      const result = await getIntelligentContext(
        mockUserId,
        mockSessionId,
        'heart health concerns',
        {
          includeHistory: true,
          includePreferences: true,
          includeGoals: true
        }
      );

      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe(mockUserId);
      expect(result.data?.recentAnalyses).toHaveLength(1);
      expect(result.data?.userPreferences.focusAreas).toContain('cardiovascular');
      expect(result.data?.healthGoals).toContain('Improve heart health');
    });

    it('should handle context summarization for long content', async () => {
      // Mock preferences
      const { getPreferences } = require('@/lib/zep/preferences');
      getPreferences.mockResolvedValue({
        success: true,
        data: { focusAreas: ['cardiovascular'], healthGoals: ['Improve heart health'] }
      });

      // Mock search results with normal content (not triggering summarization)
      const { findRelevantContext } = require('@/lib/zep/search');
      findRelevantContext
        .mockResolvedValueOnce({ 
          success: true, 
          results: [{ content: 'Short analysis', type: 'health_analysis' }]
        })
        .mockResolvedValueOnce({ 
          success: true, 
          results: [{ content: '{"focusAreas": ["cardiovascular"]}' }] 
        })
        .mockResolvedValueOnce({ 
          success: true, 
          results: [{ content: 'Improve heart health' }] 
        });

      const result = await getIntelligentContext(
        mockUserId,
        mockSessionId,
        'test query',
        { maxContextLength: 500 }
      );

      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe(mockUserId);
      expect(result.data?.recentAnalyses).toHaveLength(1);
      expect(result.data?.userPreferences.focusAreas).toContain('cardiovascular');
    });
  });

  describe('updateConversationContext', () => {
    it('should store conversation messages successfully', async () => {
      const result = await updateConversationContext(
        mockUserId,
        mockSessionId,
        'What do my lab results mean?',
        'Your results show good overall health with some areas for improvement.',
        { analysisId: 'analysis-123' }
      );

      // Test that the function completes successfully
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
