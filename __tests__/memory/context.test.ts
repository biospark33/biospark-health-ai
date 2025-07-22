
/**
 * Zep Context Management Tests
 * Phase 2B - Testing Intelligent Context Retrieval
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getIntelligentContext, updateConversationContext } from '@/lib/zep/context';

// Mock dependencies
jest.mock('@/lib/zep/search');
jest.mock('@/lib/zep/summarize');
jest.mock('@/lib/zep/client');

describe('Zep Context Management', () => {
  const mockUserId = 'test-user-123';
  const mockSessionId = 'test-session-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIntelligentContext', () => {
    it('should retrieve comprehensive health context', async () => {
      // Mock search results
      const { findRelevantContext } = require('@/lib/zep/search');
      findRelevantContext
        .mockResolvedValueOnce({ 
          success: true, 
          data: [{ content: 'Previous analysis', type: 'health_analysis' }] 
        })
        .mockResolvedValueOnce({ 
          success: true, 
          data: [{ content: '{"focusAreas": ["cardiovascular"]}' }] 
        })
        .mockResolvedValueOnce({ 
          success: true, 
          data: [{ content: 'Improve heart health' }] 
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
      expect(result.data?.relevantHistory).toHaveLength(1);
      expect(result.data?.userPreferences.focusAreas).toContain('cardiovascular');
      expect(result.data?.healthGoals).toContain('Improve heart health');
    });

    it('should handle context summarization for long content', async () => {
      const longHistory = Array(10).fill(0).map((_, i) => ({
        content: `Long analysis content ${i}`.repeat(100),
        type: 'health_analysis'
      }));

      const { findRelevantContext } = require('@/lib/zep/search');
      const { summarizeMemory } = require('@/lib/zep/summarize');
      
      findRelevantContext.mockResolvedValue({ success: true, data: longHistory });
      summarizeMemory.mockResolvedValue({ success: true, data: 'Summarized content' });

      const result = await getIntelligentContext(
        mockUserId,
        mockSessionId,
        'test query',
        { maxContextLength: 500 }
      );

      expect(summarizeMemory).toHaveBeenCalled();
      expect(result.data?.conversationSummary).toBe('Summarized content');
    });
  });

  describe('updateConversationContext', () => {
    it('should store conversation messages successfully', async () => {
      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.add = jest.fn().mockResolvedValue(true);

      const result = await updateConversationContext(
        mockUserId,
        mockSessionId,
        'What do my lab results mean?',
        'Your results show good overall health with some areas for improvement.',
        { analysisId: 'analysis-123' }
      );

      expect(result.success).toBe(true);
      expect(zepClient.memory.add).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: 'What do my lab results mean?'
            }),
            expect.objectContaining({
              role: 'assistant',
              content: 'Your results show good overall health with some areas for improvement.'
            })
          ])
        })
      );
    });
  });
});
