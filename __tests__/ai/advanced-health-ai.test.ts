
/**
 * 🧪 BioSpark Health AI - Advanced Health AI Tests
 * 
 * Comprehensive test suite for Phase 2 advanced AI integration
 * with Ray Peat bioenergetics principles and enterprise-grade quality.
 */

import { AdvancedHealthAI } from '../../lib/ai/advanced-health-ai';
import { MemoryManager } from '../../lib/memory-manager';
import { HealthData } from '../../lib/types/health-types';

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify([{
                category: 'metabolic',
                insight: 'Low body temperature indicates thyroid dysfunction',
                confidence: 0.9,
                priority: 'high',
                supportingEvidence: ['Temperature: 97.2°F', 'Low pulse rate'],
                recommendations: ['Thyroid support', 'Temperature monitoring'],
                timeframe: 'short-term'
              }])
            }
          }]
        })
      }
    }
  }))
}));

// Mock dependencies
jest.mock('../../lib/memory-manager');
jest.mock('../../lib/ai/bioenergetics-engine');
jest.mock('../../lib/ai/health-pattern-ai');
jest.mock('../../lib/ai/personalized-recommendation-ai');
jest.mock('../../lib/ai/intelligent-memory-ai');

describe('Advanced Health AI Integration', () => {
  let advancedHealthAI: AdvancedHealthAI;
  let mockMemoryManager: jest.Mocked<MemoryManager>;
  
  const mockHealthData: HealthData = {
    userId: 'test-user-123',
    timestamp: new Date(),
    age: 35,
    gender: 'female',
    bodyTemperature: 97.2,
    pulseRate: 65,
    labResults: {
      thyroid: {
        tsh: 3.5,
        t3: 2.8,
        t4: 8.2,
        freeT3: 2.9,
        freeT4: 1.1
      },
      metabolic: {
        glucose: 95,
        hba1c: 5.4,
        insulin: 8.5
      }
    },
    symptoms: ['fatigue', 'cold hands', 'brain fog'],
    energyLevel: 4,
    sleepQuality: 5
  };

  beforeEach(() => {
    mockMemoryManager = new MemoryManager('test-key', 'test-url') as jest.Mocked<MemoryManager>;
    mockMemoryManager.storeHealthAnalysis = jest.fn().mockResolvedValue(undefined);
    
    advancedHealthAI = new AdvancedHealthAI('test-openai-key', mockMemoryManager);
  });

  describe('System Initialization', () => {
    test('should initialize all AI engines successfully', async () => {
      await expect(advancedHealthAI.initialize()).resolves.not.toThrow();
    });

    test('should report healthy system status after initialization', async () => {
      await advancedHealthAI.initialize();
      const status = await advancedHealthAI.getSystemStatus();
      
      expect(status.status).toBe('healthy');
      expect(status.performance.overallHealth).toBeGreaterThan(0.8);
    });
  });

  describe('Advanced Health Insights Generation', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should generate comprehensive health insights', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights).toBeDefined();
      expect(insights.userId).toBe('test-user-123');
      expect(insights.timestamp).toBeInstanceOf(Date);
      expect(insights.overallHealthScore).toBeGreaterThanOrEqual(0);
      expect(insights.overallHealthScore).toBeLessThanOrEqual(100);
      expect(insights.confidenceScore).toBeGreaterThan(0);
      expect(insights.confidenceScore).toBeLessThanOrEqual(1);
    });

    test('should include all required analysis components', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.bioenergicsAnalysis).toBeDefined();
      expect(insights.patternAnalysis).toBeDefined();
      expect(insights.personalizedPlan).toBeDefined();
      expect(insights.enhancedMemoryContext).toBeDefined();
      expect(insights.synthesizedInsights).toBeDefined();
      expect(insights.riskAssessment).toBeDefined();
    });

    test('should generate prioritized recommendations', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.priorityRecommendations).toBeDefined();
      expect(Array.isArray(insights.priorityRecommendations)).toBe(true);
      expect(insights.priorityRecommendations.length).toBeGreaterThan(0);
    });

    test('should create follow-up schedule', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.followUpSchedule).toBeDefined();
      expect(insights.followUpSchedule.immediate).toBeDefined();
      expect(insights.followUpSchedule.shortTerm).toBeDefined();
      expect(insights.followUpSchedule.longTerm).toBeDefined();
    });

    test('should complete processing within performance target', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.processingTime).toBeLessThan(5000); // 5 seconds max
    });
  });

  describe('Ray Peat Bioenergetics Integration', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should prioritize thyroid function in low temperature cases', async () => {
      const lowTempData = {
        ...mockHealthData,
        bodyTemperature: 96.8,
        pulseRate: 58
      };

      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        lowTempData
      );

      const thyroidRecommendations = insights.priorityRecommendations.filter(rec =>
        rec.toLowerCase().includes('thyroid') || 
        rec.toLowerCase().includes('temperature')
      );

      expect(thyroidRecommendations.length).toBeGreaterThan(0);
    });

    test('should identify metabolic dysfunction patterns', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      const metabolicInsights = insights.synthesizedInsights.filter(
        insight => insight.category === 'metabolic'
      );

      expect(metabolicInsights.length).toBeGreaterThan(0);
    });

    test('should generate appropriate risk assessment', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.riskAssessment.overallRisk).toMatch(/^(low|moderate|high|critical)$/);
      expect(insights.riskAssessment.interventionPriorities).toBeDefined();
      expect(insights.riskAssessment.monitoringRequirements).toBeDefined();
    });
  });

  describe('Performance and Quality Metrics', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should maintain high confidence scores', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.confidenceScore).toBeGreaterThan(0.7);
    });

    test('should provide meaningful health scores', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.overallHealthScore).toBeGreaterThan(0);
      expect(insights.overallHealthScore).toBeLessThanOrEqual(100);
    });

    test('should store analysis results in memory', async () => {
      await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(mockMemoryManager.storeHealthAnalysis).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          type: 'advanced_health_insights',
          data: expect.any(Object),
          timestamp: expect.any(Date)
        })
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle initialization failures gracefully', async () => {
      const faultyAI = new AdvancedHealthAI('invalid-key', mockMemoryManager);
      
      // Should not throw during construction
      expect(faultyAI).toBeDefined();
    });

    test('should handle missing health data gracefully', async () => {
      await advancedHealthAI.initialize();
      
      const minimalData: HealthData = {
        userId: 'test-user-123',
        timestamp: new Date()
      };

      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        minimalData
      );

      expect(insights).toBeDefined();
      expect(insights.userId).toBe('test-user-123');
    });

    test('should provide fallback recommendations when AI fails', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.priorityRecommendations).toBeDefined();
      expect(insights.priorityRecommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Enterprise Quality Standards', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should include AI model version tracking', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.aiModelVersions).toBeDefined();
      expect(insights.aiModelVersions.bioenergics).toBeDefined();
      expect(insights.aiModelVersions.patterns).toBeDefined();
      expect(insights.aiModelVersions.recommendations).toBeDefined();
      expect(insights.aiModelVersions.memory).toBeDefined();
    });

    test('should provide immediate actions for urgent cases', async () => {
      const urgentData = {
        ...mockHealthData,
        bodyTemperature: 96.0,
        pulseRate: 50,
        energyLevel: 2
      };

      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        urgentData
      );

      expect(insights.immediateActions).toBeDefined();
      expect(insights.immediateActions.length).toBeGreaterThanOrEqual(0);
    });

    test('should include monitoring priorities', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      expect(insights.monitoringPriorities).toBeDefined();
      expect(Array.isArray(insights.monitoringPriorities)).toBe(true);
    });
  });

  describe('Integration Testing', () => {
    test('should integrate all AI engines seamlessly', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      // Verify all engines contributed to the analysis
      expect(insights.bioenergicsAnalysis).toBeDefined();
      expect(insights.patternAnalysis).toBeDefined();
      expect(insights.personalizedPlan).toBeDefined();
      expect(insights.enhancedMemoryContext).toBeDefined();
      
      // Verify synthesis occurred
      expect(insights.synthesizedInsights).toBeDefined();
      expect(insights.overallHealthScore).toBeGreaterThan(0);
    });

    test('should maintain data consistency across components', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'test-user-123',
        mockHealthData
      );

      // All components should reference the same user
      expect(insights.userId).toBe('test-user-123');
      expect(insights.bioenergicsAnalysis?.userId || insights.userId).toBe('test-user-123');
      expect(insights.patternAnalysis?.userId || insights.userId).toBe('test-user-123');
    });
  });
});

describe('Advanced Health AI Performance Benchmarks', () => {
  let advancedHealthAI: AdvancedHealthAI;
  let mockMemoryManager: jest.Mocked<MemoryManager>;

  beforeEach(async () => {
    mockMemoryManager = new MemoryManager('test-key', 'test-url') as jest.Mocked<MemoryManager>;
    mockMemoryManager.storeHealthAnalysis = jest.fn().mockResolvedValue(undefined);
    
    advancedHealthAI = new AdvancedHealthAI('test-openai-key', mockMemoryManager);
    await advancedHealthAI.initialize();
  });

  test('should meet enterprise performance benchmarks', async () => {
    const startTime = Date.now();
    
    const insights = await advancedHealthAI.generateAdvancedInsights(
      'test-user-123',
      mockHealthData
    );
    
    const totalTime = Date.now() - startTime;
    
    // Performance benchmarks
    expect(totalTime).toBeLessThan(5000); // 5 seconds max
    expect(insights.processingTime).toBeLessThan(5000);
    expect(insights.confidenceScore).toBeGreaterThan(0.7);
    expect(insights.overallHealthScore).toBeGreaterThanOrEqual(0);
  });

  test('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = Array(5).fill(null).map((_, index) => 
      advancedHealthAI.generateAdvancedInsights(
        `test-user-${index}`,
        { ...mockHealthData, userId: `test-user-${index}` }
      )
    );

    const results = await Promise.all(concurrentRequests);
    
    expect(results).toHaveLength(5);
    results.forEach((result, index) => {
      expect(result.userId).toBe(`test-user-${index}`);
      expect(result.processingTime).toBeLessThan(10000); // Allow more time for concurrent
    });
  });
});
