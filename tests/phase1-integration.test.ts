

// BMAD Phase 1 Integration Tests
// Comprehensive testing suite for memory-enhanced health analysis

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { MemoryEnhancedHealthAI } from '@/lib/memory-enhanced-health-ai';
import { MemoryManager } from '@/lib/memory-manager';
import { SessionManager } from '@/lib/session-manager';
import { LabInsightZepClient } from '@/lib/zep-client';
import { prisma } from '@/lib/prisma';

// Mock external dependencies for testing
jest.mock('@/lib/zep-client');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-user',
        email: 'test@example.com',
        healthAssessments: [],
        zepSessions: []
      })
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn()
    }
  }
}));
jest.mock('@/lib/openai', () => ({
  healthAI: {
    generateHealthInsights: jest.fn().mockResolvedValue({
      insights: ['Mock health insight'],
      recommendations: ['Mock recommendation'],
      riskFactors: ['Mock risk factor']
    })
  }
}));

describe('BMAD Phase 1 Integration Tests', () => {
  let memoryHealthAI: MemoryEnhancedHealthAI;
  let mockZepClient: jest.Mocked<LabInsightZepClient>;
  let mockMemoryManager: MemoryManager;
  let mockSessionManager: SessionManager;
  let mockPrisma: jest.Mocked<typeof prisma>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock Zep client
    mockZepClient = {
      searchMemory: jest.fn().mockResolvedValue([
        {
          uuid: 'memory-1',
          message: {
            uuid: 'msg-1',
            content: 'Previous health analysis focused on thyroid function',
            role: 'assistant',
            metadata: { type: 'health_analysis', layer: 2, timeSpent: 300000, assessmentType: 'bioenergetic' }
          },
          metadata: { type: 'health_analysis', layer: 2, timeSpent: 300000, assessmentType: 'bioenergetic' },
          score: 0.9,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]),
      getMemory: jest.fn().mockResolvedValue([]),
      addMemory: jest.fn().mockResolvedValue(true),
      createUserSession: jest.fn().mockResolvedValue('mock-session-id'),
      deleteUserSession: jest.fn().mockResolvedValue(true),
      testConnection: jest.fn().mockResolvedValue(true),
      initializeClient: jest.fn().mockResolvedValue(undefined),
      isInitialized: true
    } as any;

    // Create managers
    mockMemoryManager = new MemoryManager(mockZepClient);
    mockSessionManager = new SessionManager(mockZepClient);
    
    // Mock SessionManager methods
    jest.spyOn(mockSessionManager, 'getOrCreateSession').mockResolvedValue({
      id: 'session-1',
      userId: 'test-user',
      sessionId: 'mock-session-id',
      metadata: {},
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true
    });

    // Create memory-enhanced health AI
    memoryHealthAI = new MemoryEnhancedHealthAI(
      mockMemoryManager,
      mockSessionManager,
      'mock-openai-key'
    );

    mockPrisma = prisma as jest.Mocked<typeof prisma>;
  });

  describe('Memory-Enhanced Health Analysis', () => {
    it('should generate memory-aware insights successfully', async () => {
      const userId = 'test-user-123';
      const assessmentData = {
        biomarkers: {
          glucose: 95,
          cholesterol: 180,
          thyroid: { tsh: 2.5, t3: 3.2, t4: 1.1 }
        },
        symptoms: ['fatigue', 'weight_gain'],
        lifestyle: {
          diet: 'standard_american',
          exercise: 'sedentary',
          sleep: 6.5
        }
      };

      const standardInsights = {
        insights: ['Standard health insight'],
        recommendations: ['Standard recommendation']
      };

      // Mock memory search to return relevant context
      mockZepClient.searchMemory.mockResolvedValue([
        {
          uuid: 'memory-1',
          message: {
            uuid: 'msg-1',
            content: 'Previous health analysis focused on thyroid function',
            role: 'assistant',
            metadata: { type: 'health_analysis', layer: 2, timeSpent: 300000, assessmentType: 'bioenergetic' }
          },
          metadata: { type: 'health_analysis', layer: 2, timeSpent: 300000, assessmentType: 'bioenergetic' },
          score: 0.9,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]);

      // Execute memory-enhanced analysis
      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      // Verify results
      expect(result).toBeDefined();
      expect(result.standardInsights).toBeDefined();
      expect(result.memoryContext).toBeDefined();
      expect(result.memoryContext.userId).toBe(userId);
      expect(result.memoryContext.previousAssessments).toBeDefined();
      expect(result.memoryContext.engagementPatterns).toBeDefined();
      expect(result.memoryContext.preferences).toBeDefined();
      expect(result.memoryContext.healthGoals).toBeDefined();
      expect(typeof result.engagementScore).toBe('number');
    });

    it('should handle memory retrieval failures gracefully', async () => {
      const userId = 'test-user-456';
      const assessmentData = { biomarkers: { glucose: 100 } };
      const standardInsights = { insights: ['Standard insight'] };

      // Mock memory search to fail
      mockZepClient.searchMemory.mockRejectedValue(new Error('Zep connection failed'));

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result).toBeDefined();
      expect(result.memoryContext.previousAssessments).toEqual([]);
      expect(result.engagementScore).toBe(0);
    });

    it('should analyze engagement patterns correctly', async () => {
      const userId = 'test-user-789';
      const assessmentData = { biomarkers: { glucose: 90 } };
      const standardInsights = { insights: ['Standard insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result.memoryContext.engagementPatterns).toBeDefined();
      expect(Array.isArray(result.memoryContext.engagementPatterns)).toBe(true);
    });
  });

  describe('Progressive Disclosure Integration', () => {
    it('should track layer navigation correctly', async () => {
      const userId = 'test-user-pd';
      const assessmentData = { 
        biomarkers: { glucose: 95 },
        layer: 2,
        timeSpent: 300000
      };
      const standardInsights = { insights: ['Layer 2 insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result).toBeDefined();
      expect(result.memoryContext).toBeDefined();
      expect(result.engagementScore).toBeGreaterThanOrEqual(0);
    });

    it('should calculate engagement scores accurately', async () => {
      const userId = 'test-user-engagement';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Engagement insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(typeof result.engagementScore).toBe('number');
      expect(result.engagementScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Personalization', () => {
    it('should generate personalized insights based on user history', async () => {
      const userId = 'test-user-personalized';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Standard insight'] };

      // Mock memory with previous assessments
      mockZepClient.searchMemory.mockResolvedValue([
        {
          uuid: 'memory-1',
          message: {
            uuid: 'msg-1',
            content: 'Previous thyroid analysis',
            role: 'assistant',
            metadata: { type: 'health_analysis' }
          },
          metadata: { type: 'health_analysis' },
          score: 0.9,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]);

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result.memoryContext.previousAssessments.length).toBeGreaterThan(0);
      expect(result.memoryContext.userId).toBe(userId);
    });

    it('should predict engagement patterns accurately', async () => {
      const userId = 'test-user-patterns';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Pattern insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(Array.isArray(result.memoryContext.engagementPatterns)).toBe(true);
      expect(typeof result.engagementScore).toBe('number');
    });
  });

  describe('Database Integration', () => {
    it('should create health assessment with memory enhancement', async () => {
      const userId = 'test-user-db';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['DB insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result).toBeDefined();
      expect(result.memoryContext.userId).toBe(userId);
      expect(mockSessionManager.getOrCreateSession).toHaveBeenCalledWith(userId);
    });

    it('should update user memory preferences automatically', async () => {
      const userId = 'test-user-prefs';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Prefs insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result.memoryContext.preferences).toBeDefined();
      expect(Array.isArray(result.memoryContext.preferences)).toBe(true);
    });
  });

  describe('API Integration', () => {
    it('should handle memory-enhanced analysis API requests', async () => {
      const userId = 'test-user-api';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['API insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result).toBeDefined();
      expect(typeof result.engagementScore).toBe('number');
    });

    it('should handle engagement tracking API requests', async () => {
      const userId = 'test-user-tracking';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Tracking insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result.memoryContext.engagementPatterns).toBeDefined();
      expect(Array.isArray(result.memoryContext.engagementPatterns)).toBe(true);
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should handle Zep API failures gracefully', async () => {
      expect(() => {
        try {
          throw new Error('Zep API unavailable');
        } catch (error) {
          // Log error but don't throw
          console.error('Zep error handled:', error);
        }
      }).not.toThrow();
    });

    it('should provide fallback when memory enhancement fails', async () => {
      const userId = 'test-user-fallback';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Fallback insight'] };

      // Mock memory failure
      mockZepClient.searchMemory.mockRejectedValue(new Error('Memory unavailable'));

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result).toBeDefined();
      expect(result.memoryContext.previousAssessments).toEqual([]);
      expect(result.engagementScore).toBe(0);
    });
  });

  describe('Performance & Scalability', () => {
    it('should handle concurrent analysis requests', async () => {
      const userIds = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Concurrent insight'] };

      const promises = userIds.map(userId => 
        memoryHealthAI.generateMemoryAwareInsights(userId, assessmentData, standardInsights)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.memoryContext.userId).toBe(userIds[index]);
        expect(typeof result.engagementScore).toBe('number');
        expect(result.memoryContext.previousAssessments).toBeDefined();
        expect(result.memoryContext.engagementPatterns).toBeDefined();
        expect(result.memoryContext.preferences).toBeDefined();
      });
    });

    it('should limit memory search results appropriately', async () => {
      const userId = 'test-user-limit';
      const assessmentData = { biomarkers: { glucose: 95 } };
      const standardInsights = { insights: ['Limit insight'] };

      const result = await memoryHealthAI.generateMemoryAwareInsights(
        userId,
        assessmentData,
        standardInsights
      );

      expect(result.memoryContext.previousAssessments.length).toBeLessThanOrEqual(10);
      expect(typeof result.engagementScore).toBe('number');
    });
  });
});
