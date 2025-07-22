
/**
 * Zep Search Operations Tests
 * Phase 2B - Testing Semantic Search and Context Retrieval
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { semanticSearch, searchHealthAnalyses, findRelevantContext } from '@/lib/zep/search';

// Mock Zep client
jest.mock('@/lib/zep/client', () => ({
  zepClient: {
    memory: {
      search: jest.fn()
    }
  },
  withZepErrorHandling: jest.fn((fn) => fn())
}));

describe('Zep Search Operations', () => {
  const mockUserId = 'test-user-123';
  const mockSessionId = 'test-session-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('semanticSearch', () => {
    it('should perform semantic search successfully', async () => {
      const mockSearchResults = [
        {
          message: {
            uuid: 'msg-1',
            content: 'Health analysis showing improved biomarkers',
            metadata: { type: 'health_analysis', userId: mockUserId },
            created_at: '2024-01-01T00:00:00Z'
          },
          score: 0.95
        }
      ];

      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.search.mockResolvedValue(mockSearchResults);

      const result = await semanticSearch(
        mockUserId,
        mockSessionId,
        'health analysis biomarkers',
        5
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].content).toBe('Health analysis showing improved biomarkers');
      expect(result.data[0].score).toBe(0.95);
    });

    it('should handle search errors gracefully', async () => {
      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.search.mockRejectedValue(new Error('Search failed'));

      const result = await semanticSearch(
        mockUserId,
        mockSessionId,
        'test query',
        5
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Semantic search failed');
    });

    it('should handle missing Zep client', async () => {
      // Mock missing client
      jest.doMock('@/lib/zep/client', () => ({
        zepClient: null,
        withZepErrorHandling: jest.fn((fn) => fn())
      }));

      const { semanticSearch: searchWithoutClient } = require('@/lib/zep/search');
      const result = await searchWithoutClient(mockUserId, mockSessionId, 'test', 5);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CLIENT_NOT_AVAILABLE');
    });
  });

  describe('searchHealthAnalyses', () => {
    it('should search for specific analysis types', async () => {
      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.search.mockResolvedValue([]);

      const result = await searchHealthAnalyses(
        mockUserId,
        mockSessionId,
        'comprehensive',
        { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
        10
      );

      expect(zepClient.memory.search).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({
          text: 'health analysis biomarkers recommendations',
          limit: 10,
          metadata: expect.objectContaining({
            userId: mockUserId,
            type: 'health_analysis',
            analysisType: 'comprehensive'
          })
        })
      );
    });
  });

  describe('findRelevantContext', () => {
    it('should find context for current query', async () => {
      const mockResults = [
        {
          message: {
            uuid: 'ctx-1',
            content: 'Previous health discussion',
            metadata: { type: 'health_analysis' },
            created_at: '2024-01-01T00:00:00Z'
          },
          score: 0.8
        }
      ];

      const { zepClient } = require('@/lib/zep/client');
      zepClient.memory.search.mockResolvedValue(mockResults);

      const result = await findRelevantContext(
        mockUserId,
        mockSessionId,
        'blood pressure concerns'
      );

      expect(result.success).toBe(true);
      expect(zepClient.memory.search).toHaveBeenCalledWith(
        mockSessionId,
        expect.objectContaining({
          text: 'blood pressure concerns',
          limit: 5,
          metadata: expect.objectContaining({
            type: { $in: ['health_analysis', 'preferences', 'goals'] }
          })
        })
      );
    });
  });
});
