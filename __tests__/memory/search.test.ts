

// Zep Search Operations Tests
// Phase 4 Final Optimization - Enhanced Search Testing
// Tests semantic search functionality with proper mocking

import { semanticSearch, searchHealthAnalyses, findRelevantContext, setZepClient } from '@/lib/zep/search';
import { LabInsightZepClient } from '@/lib/zep-client';

// Mock the Zep client
const mockSearch = jest.fn();
const mockZepClient = {
  searchMemory: mockSearch,
  isInitialized: true
} as any;

// Set up the mock client
setZepClient(mockZepClient);

describe('Zep Search Operations', () => {
  const mockUserId = 'test-user-123';
  const mockSessionId = 'test-session-456';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockSearch.mockResolvedValue([
      {
        uuid: 'memory-1',
        message: {
          content: 'Test health analysis result',
          role: 'assistant'
        },
        metadata: {
          type: 'health_analysis',
          userId: mockUserId
        },
        score: 0.95
      }
    ]);
  });

  describe('semanticSearch', () => {
    it('should perform semantic search successfully', async () => {
      const result = await semanticSearch(
        mockUserId,
        mockSessionId,
        'blood pressure analysis',
        5
      );

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results![0]).toHaveProperty('uuid');
      expect(mockSearch).toHaveBeenCalledWith(
        mockSessionId,
        'blood pressure analysis',
        { limit: 5 }
      );
    });

    it('should handle search errors gracefully', async () => {
      // Mock search to throw an error
      mockSearch.mockRejectedValue(new Error('Network error'));

      const result = await semanticSearch(
        mockUserId,
        mockSessionId,
        'test query',
        5
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SEARCH_FAILED');
      expect(result.error?.message).toContain('Semantic search failed');
    });

    it('should handle missing Zep client', async () => {
      // Temporarily remove the client
      setZepClient(null as any);

      const result = await semanticSearch(
        mockUserId,
        mockSessionId,
        'test query',
        5
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CLIENT_NOT_AVAILABLE');
      
      // Restore the client
      setZepClient(mockZepClient);
    });
  });

  describe('searchHealthAnalyses', () => {
    it('should search for specific analysis types', async () => {
      const result = await searchHealthAnalyses(
        mockUserId,
        mockSessionId,
        'comprehensive',
        10
      );

      expect(result.success).toBe(true);
      expect(mockSearch).toHaveBeenCalledWith(
        mockSessionId,
        'health analysis biomarkers recommendations',
        expect.objectContaining({
          limit: 10,
          metadata: expect.objectContaining({
            type: 'health_analysis',
            analysisType: 'comprehensive',
            userId: mockUserId
          })
        })
      );
    });
  });

  describe('findRelevantContext', () => {
    it('should find context for current query', async () => {
      const result = await findRelevantContext(
        mockUserId,
        mockSessionId,
        'blood pressure concerns',
        5
      );

      expect(result.success).toBe(true);
      expect(mockSearch).toHaveBeenCalledWith(
        mockSessionId,
        'blood pressure concerns',
        expect.objectContaining({
          limit: 5,
          metadata: expect.objectContaining({
            type: {
              $in: ['health_analysis', 'preferences', 'goals']
            },
            userId: mockUserId
          })
        })
      );
    });
  });
});
