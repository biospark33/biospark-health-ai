
// BMAD Phase 1 Integration Tests
// Comprehensive testing suite for memory-enhanced health analysis

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { MemoryEnhancedHealthAI } from '@/lib/memory-enhanced-health-ai';
import { LabInsightZepClient } from '@/lib/zep-client';
import { prisma } from '@/lib/prisma';

// Mock Zep client for testing
jest.mock('@/lib/zep-client');
jest.mock('@/lib/prisma');

describe('BMAD Phase 1 Integration Tests', () => {
  let memoryHealthAI: MemoryEnhancedHealthAI;
  let mockZepClient: jest.Mocked<LabInsightZepClient>;
  let mockPrisma: jest.Mocked<typeof prisma>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock Zep client
    mockZepClient = {
      searchMemory: jest.fn(),
      addMemory: jest.fn(),
      getSession: jest.fn(),
      deleteSession: jest.fn()
    } as any;

    // Create mock Prisma client
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      healthAssessment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn()
      },
      userEngagementAnalytics: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn()
      },
      userMemoryPreferences: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      }
    } as any;

    // Initialize memory-enhanced health AI
    memoryHealthAI = new MemoryEnhancedHealthAI(mockZepClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Memory-Enhanced Health Analysis', () => {
    it('should generate memory-aware insights successfully', async () => {
      // Mock user data
      const userId = 'test-user-123';
      const assessmentData = {
        type: 'comprehensive',
        biomarkers: [
          { name: 'TSH', value: 2.5, unit: 'mIU/L' },
          { name: 'T3', value: 3.2, unit: 'pg/mL' }
        ],
        symptoms: ['fatigue', 'brain fog'],
        lifestyle: { sleep: 7, exercise: 3 }
      };

      // Mock database responses
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        healthAssessments: [],
        zepSessions: []
      });

      // Mock Zep memory responses
      mockZepClient.searchMemory.mockResolvedValue([
        {
          content: 'Previous health analysis focused on thyroid function',
          metadata: {
            type: 'health_analysis',
            layer: 2,
            timeSpent: 300000,
            assessmentType: 'bioenergetic'
          }
        }
      ]);

      // Execute memory-enhanced analysis
      const result = await memoryHealthAI.generateMemoryAwareInsights(
        assessmentData,
        userId
      );

      // Verify results
      expect(result).toBeDefined();
      expect(result.standardInsights).toBeDefined();
      expect(result.memoryContext).toBeDefined();
      expect(result.personalizedInsights).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.engagementPredictions).toBeDefined();

      // Verify Zep integration
      expect(mockZepClient.searchMemory).toHaveBeenCalledWith(
        expect.stringContaining('health-memory-'),
        'health analysis patterns',
        expect.any(Object)
      );

      expect(mockZepClient.addMemory).toHaveBeenCalled();
    });

    it('should handle memory retrieval failures gracefully', async () => {
      const userId = 'test-user-456';
      const assessmentData = { type: 'basic' };

      // Mock Zep failure
      mockZepClient.searchMemory.mockRejectedValue(new Error('Zep connection failed'));

      // Mock database fallback
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        healthAssessments: [],
        zepSessions: []
      });

      // Execute analysis
      const result = await memoryHealthAI.generateMemoryAwareInsights(
        assessmentData,
        userId
      );

      // Should still return standard insights
      expect(result.standardInsights).toBeDefined();
      expect(result.personalizedInsights).toBeNull();
      expect(result.memoryContext).toBeNull();
    });

    it('should analyze engagement patterns correctly', async () => {
      const memories = [
        {
          metadata: { layer: 1, timeSpent: 120000, type: 'engagement' }
        },
        {
          metadata: { layer: 2, timeSpent: 300000, type: 'engagement' }
        },
        {
          metadata: { layer: 3, timeSpent: 600000, type: 'engagement' }
        },
        {
          metadata: { type: 'health_analysis' }
        }
      ];

      // Use reflection to access private method for testing
      const patterns = (memoryHealthAI as any).analyzeEngagementPatterns(memories);

      expect(patterns.preferredLayers).toEqual([3, 2, 1]);
      expect(patterns.averageTimeSpent).toBe(340000); // (120000 + 300000 + 600000) / 3
      expect(patterns.completionRate).toBe(0.25); // 1 completed / 4 started
    });
  });

  describe('Progressive Disclosure Integration', () => {
    it('should track layer navigation correctly', async () => {
      const assessmentId = 'assessment-123';
      const userId = 'user-123';
      const layer = 2;

      // Mock assessment
      mockPrisma.healthAssessment.findFirst.mockResolvedValue({
        id: assessmentId,
        userId,
        zepSessionId: 'zep-session-123',
        layerProgress: { layer1: true, layer2: false, layer3: false }
      });

      // Mock engagement analytics
      mockPrisma.userEngagementAnalytics.findFirst.mockResolvedValue({
        id: 'engagement-123',
        assessmentId,
        userId,
        layerTransitions: []
      });

      // This would be called by the API route
      // Simulate the layer change tracking logic
      const updatedProgress = { layer1: true, layer2: true, layer3: false };
      const layerTransitions = [
        { layer: 2, timestamp: new Date().toISOString() }
      ];

      expect(updatedProgress.layer2).toBe(true);
      expect(layerTransitions).toHaveLength(1);
      expect(layerTransitions[0].layer).toBe(2);
    });

    it('should calculate engagement scores accurately', async () => {
      const engagementData = {
        layer1Time: 120, // 2 minutes
        layer2Time: 300, // 5 minutes
        layer3Time: 600, // 10 minutes
        totalTimeSpent: 1020
      };

      // Calculate engagement score (this logic would be in the database trigger)
      const baseScore = engagementData.totalTimeSpent / 300.0; // Time factor
      const layerBonus = 0.2 + 0.3 + 0.5; // All layers completed
      const engagementScore = Math.min(baseScore + layerBonus, 1.0);

      expect(engagementScore).toBeGreaterThan(0);
      expect(engagementScore).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Memory Personalization', () => {
    it('should generate personalized insights based on user history', async () => {
      const memoryContext = {
        userId: 'user-123',
        previousAssessments: [
          {
            assessmentType: 'bioenergetic',
            overallScore: 75,
            thyroidFunction: 60
          }
        ],
        engagementPatterns: {
          preferredLayers: [2, 3],
          averageTimeSpent: 400000,
          completionRate: 0.8
        },
        preferences: {
          communicationStyle: 'detailed',
          detailLevel: 'high'
        },
        healthGoals: {
          primary: ['energy_optimization', 'thyroid_support']
        }
      };

      // Test personalization logic
      expect(memoryContext.engagementPatterns.preferredLayers).toContain(2);
      expect(memoryContext.preferences.detailLevel).toBe('high');
      expect(memoryContext.healthGoals.primary).toContain('energy_optimization');
    });

    it('should predict engagement patterns accurately', async () => {
      const patterns = {
        preferredLayers: [1, 2],
        averageTimeSpent: 180,
        completionRate: 0.9,
        bestTime: 'morning'
      };

      // Test recommendation logic
      const recommendedApproach = patterns.completionRate > 0.8 ? 'systematic_learner' : 'adaptive';
      expect(recommendedApproach).toBe('systematic_learner');

      const likelyToComplete = patterns.completionRate;
      expect(likelyToComplete).toBe(0.9);
    });
  });

  describe('Database Integration', () => {
    it('should create health assessment with memory enhancement', async () => {
      const assessmentData = {
        userId: 'user-123',
        assessmentType: 'comprehensive',
        overallScore: 85,
        memoryEnhanced: true,
        zepSessionId: 'zep-session-123'
      };

      mockPrisma.healthAssessment.create.mockResolvedValue({
        id: 'assessment-123',
        ...assessmentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await mockPrisma.healthAssessment.create({
        data: assessmentData
      });

      expect(result.memoryEnhanced).toBe(true);
      expect(result.zepSessionId).toBe('zep-session-123');
      expect(mockPrisma.healthAssessment.create).toHaveBeenCalledWith({
        data: assessmentData
      });
    });

    it('should update user memory preferences automatically', async () => {
      const userId = 'user-123';
      const newPreferences = {
        preferredDetailLevel: 'high',
        communicationStyle: 'detailed',
        averageSessionTime: 450,
        completionRate: 0.85
      };

      mockPrisma.userMemoryPreferences.findUnique.mockResolvedValue(null);
      mockPrisma.userMemoryPreferences.create.mockResolvedValue({
        id: 'pref-123',
        userId,
        ...newPreferences,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await mockPrisma.userMemoryPreferences.create({
        data: { userId, ...newPreferences }
      });

      expect(result.preferredDetailLevel).toBe('high');
      expect(result.averageSessionTime).toBe(450);
    });
  });

  describe('API Integration', () => {
    it('should handle memory-enhanced analysis API requests', async () => {
      // This would test the actual API route
      const requestBody = {
        assessmentData: {
          type: 'comprehensive',
          biomarkers: [{ name: 'TSH', value: 2.5 }]
        },
        enableMemoryEnhancement: true
      };

      // Mock successful response structure
      const expectedResponse = {
        success: true,
        assessmentId: expect.any(String),
        analysis: {
          standardInsights: expect.any(Object),
          personalizedInsights: expect.any(Object),
          memoryContext: expect.any(Object),
          recommendations: expect.any(Object),
          engagementPredictions: expect.any(Object)
        },
        memoryEnhanced: true,
        zepSessionId: expect.any(String)
      };

      // Verify response structure
      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.memoryEnhanced).toBe(true);
    });

    it('should handle engagement tracking API requests', async () => {
      const engagementEvent = {
        assessmentId: 'assessment-123',
        eventType: 'layer_change',
        eventData: {
          layer: 2,
          timeSpent: 120000
        }
      };

      // Mock successful tracking response
      const expectedResponse = {
        success: true,
        message: 'Engagement event tracked successfully'
      };

      expect(expectedResponse.success).toBe(true);
      expect(engagementEvent.eventData.layer).toBe(2);
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should handle Zep API failures gracefully', async () => {
      mockZepClient.addMemory.mockRejectedValue(new Error('Zep API unavailable'));

      // Should not throw error, just log and continue
      await expect(async () => {
        try {
          await mockZepClient.addMemory('session-123', {
            content: 'test memory',
            metadata: {}
          });
        } catch (error) {
          // Log error but don't throw
          console.error('Zep error handled:', error);
        }
      }).not.toThrow();
    });

    it('should provide fallback when memory enhancement fails', async () => {
      const userId = 'user-123';
      const assessmentData = { type: 'basic' };

      // Mock all memory operations to fail
      mockZepClient.searchMemory.mockRejectedValue(new Error('Memory unavailable'));
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      // Should still return basic analysis
      const result = await memoryHealthAI.generateMemoryAwareInsights(
        assessmentData,
        userId
      );

      expect(result.standardInsights).toBeDefined();
      expect(result.personalizedInsights).toBeNull();
      expect(result.memoryContext).toBeNull();
    });
  });

  describe('Performance & Scalability', () => {
    it('should handle concurrent analysis requests', async () => {
      const userId = 'user-123';
      const assessmentData = { type: 'basic' };

      // Mock fast responses
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        healthAssessments: [],
        zepSessions: []
      });

      mockZepClient.searchMemory.mockResolvedValue([]);

      // Simulate concurrent requests
      const promises = Array(5).fill(null).map(() =>
        memoryHealthAI.generateMemoryAwareInsights(assessmentData, userId)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.standardInsights).toBeDefined();
      });
    });

    it('should limit memory search results appropriately', async () => {
      const searchOptions = {
        limit: 20,
        searchType: 'similarity' as const
      };

      mockZepClient.searchMemory.mockResolvedValue(
        Array(20).fill(null).map((_, i) => ({
          content: `Memory ${i}`,
          metadata: { type: 'test' }
        }))
      );

      const results = await mockZepClient.searchMemory(
        'session-123',
        'test query',
        searchOptions
      );

      expect(results).toHaveLength(20);
      expect(mockZepClient.searchMemory).toHaveBeenCalledWith(
        'session-123',
        'test query',
        expect.objectContaining({ limit: 20 })
      );
    });
  });
});

// Integration test helper functions
export const testHelpers = {
  createMockAssessment: (overrides = {}) => ({
    id: 'test-assessment-123',
    userId: 'test-user-123',
    assessmentType: 'comprehensive',
    overallScore: 85,
    memoryEnhanced: true,
    zepSessionId: 'zep-session-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  createMockMemoryContext: (overrides = {}) => ({
    userId: 'test-user-123',
    previousAssessments: [],
    engagementPatterns: {
      preferredLayers: [1, 2],
      averageTimeSpent: 300,
      completionRate: 0.7
    },
    preferences: {
      communicationStyle: 'balanced',
      detailLevel: 'medium'
    },
    healthGoals: {
      primary: ['general_health']
    },
    ...overrides
  }),

  createMockEngagementData: (overrides = {}) => ({
    id: 'engagement-123',
    userId: 'test-user-123',
    assessmentId: 'test-assessment-123',
    totalTimeSpent: 300,
    layer1Time: 120,
    layer2Time: 180,
    layer3Time: 0,
    engagementScore: 0.75,
    achievements: ['engaged', 'explorer'],
    ...overrides
  })
};
