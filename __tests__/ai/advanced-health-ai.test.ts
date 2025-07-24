

/**
 * 🧪 BioSpark Health AI - Advanced Health AI Tests
 * 
 * Comprehensive test suite for the Advanced Health AI system with
 * Ray Peat bioenergetics principles and enterprise-grade quality.
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
                insight: 'Comprehensive health analysis indicates optimization opportunities',
                confidence: 0.85,
                priority: 'high',
                supportingEvidence: ['Multi-engine analysis'],
                recommendations: ['Follow personalized plan'],
                timeframe: 'short-term'
              }])
            }
          }]
        })
      }
    }
  }))
}));

// Mock all AI engines
jest.mock('../../lib/ai/bioenergetics-engine', () => ({
  BioenergicsEngine: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    analyzeMetabolicHealth: jest.fn().mockResolvedValue({
      userId: 'test-user',
      timestamp: new Date(),
      metabolicScore: 75,
      thyroidFunction: {
        t3Level: 3.2,
        t4Level: 8.5,
        tshLevel: 2.1,
        reverseT3: 15,
        bodyTemperature: 98.6,
        pulseRate: 75,
        metabolicRate: 0.85,
        recommendations: ['Optimize thyroid function']
      },
      glucoseMetabolism: {
        fastingGlucose: 90,
        postprandialGlucose: 120,
        hba1c: 5.2,
        insulinSensitivity: 0.9,
        glucoseVariability: 0.2,
        recommendations: ['Maintain stable blood sugar']
      },
      mitochondrialFunction: {
        energyProduction: 0.8,
        oxidativeStress: 0.3,
        respiratoryCapacity: 0.85,
        lactateLevel: 1.0,
        co2Level: 40,
        recommendations: ['Support mitochondrial function']
      },
      hormonalBalance: {
        cortisol: 15,
        progesterone: 12,
        estrogen: 50,
        testosterone: 30,
        prolactin: 10,
        recommendations: ['Balance hormones']
      },
      recommendations: ['Pro-metabolic nutrition', 'Thyroid support'],
      interventions: ['Nutritional intervention', 'Lifestyle modifications'],
      monitoringPlan: { frequency: 'weekly', metrics: ['temperature', 'pulse'] },
      processingTime: 120
    })
  }))
}));

jest.mock('../../lib/ai/health-pattern-ai', () => ({
  HealthPatternAI: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    identifyHealthPatterns: jest.fn().mockResolvedValue({
      userId: 'test-user',
      timestamp: new Date(),
      identifiedPatterns: [{
        id: 'pattern-1',
        type: 'metabolic',
        pattern: 'Optimal metabolic function',
        confidence: 0.9,
        significance: 'high',
        timeframe: '3 months',
        recommendations: ['Continue current approach']
      }],
      healthAnomalies: [],
      progressTrends: [{
        id: 'trend-1',
        metric: 'energy_level',
        direction: 'improving',
        rate: 0.8,
        confidence: 0.85,
        timeframe: '3 months',
        projectedOutcome: 'Continued improvement'
      }],
      riskAssessment: {
        overallRisk: 'low',
        riskFactors: [],
        protectiveFactors: ['Good metabolic health'],
        recommendations: ['Maintain current approach'],
        monitoringPriority: ['Energy levels']
      },
      insights: [{
        id: 'insight-1',
        title: 'Optimal Health Pattern',
        description: 'Health metrics indicate optimal function',
        category: 'metabolic',
        priority: 'medium',
        actionable: true,
        recommendations: ['Continue current approach']
      }],
      processingTime: 100
    })
  }))
}));

jest.mock('../../lib/ai/personalized-recommendation-ai', () => ({
  PersonalizedRecommendationAI: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    generatePersonalizedPlan: jest.fn().mockResolvedValue({
      userId: 'test-user',
      timestamp: new Date(),
      nutritionalPlan: {
        macronutrientTargets: {
          carbohydrates: { grams: 200, percentage: 50, sources: ['fruit', 'honey'] },
          proteins: { grams: 80, percentage: 20, sources: ['eggs', 'dairy'] },
          fats: { grams: 60, percentage: 30, sources: ['coconut oil', 'butter'] }
        },
        mealTiming: {
          frequency: 3,
          timing: ['8:00 AM', '1:00 PM', '7:00 PM'],
          recommendations: ['Regular meal timing']
        },
        specificFoods: {
          recommended: ['Orange juice', 'Milk', 'Eggs'],
          avoid: ['PUFA oils', 'Raw vegetables'],
          therapeutic: ['Thyroid-supporting foods']
        }
      },
      lifestyleRecommendations: {
        sleepOptimization: {
          bedtime: '10:00 PM',
          wakeTime: '6:00 AM',
          duration: 8,
          environment: ['Dark room', 'Cool temperature']
        },
        stressManagement: {
          techniques: ['Deep breathing', 'Meditation'],
          frequency: 'daily',
          duration: 30
        },
        exerciseProtocol: {
          type: 'gentle',
          frequency: 3,
          duration: 30,
          activities: ['Walking', 'Swimming']
        },
        lightTherapy: {
          morningLight: true,
          duration: 30,
          timing: 'upon waking',
          type: 'natural sunlight'
        }
      },
      supplementProtocol: {
        coreSupplements: [
          { name: 'Vitamin D3', dosage: '2000 IU', timing: 'morning', purpose: 'Hormone support' }
        ],
        conditionalSupplements: [],
        timing: 'With meals',
        interactions: 'No known interactions'
      },
      monitoringSchedule: {
        daily: ['Body temperature', 'Energy level'],
        weekly: ['Weight', 'Sleep quality'],
        monthly: ['Thyroid panel'],
        quarterly: ['Full health assessment']
      },
      progressMilestones: {
        shortTerm: [
          { milestone: 'Improved energy', timeframe: '2 weeks', measurable: true }
        ],
        mediumTerm: [
          { milestone: 'Stable health markers', timeframe: '3 months', measurable: true }
        ],
        longTerm: [
          { milestone: 'Optimal health', timeframe: '6 months', measurable: true }
        ]
      },
      personalizationFactors: ['Age considerations', 'Health goals'],
      confidenceScore: 0.9,
      processingTime: 150
    })
  }))
}));

jest.mock('../../lib/ai/intelligent-memory-ai', () => ({
  IntelligentMemoryAI: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getIntelligentContext: jest.fn().mockResolvedValue({
      userId: 'test-user',
      contextSummary: 'User has optimal health with good energy levels',
      relevantHistory: [{
        id: 'history-1',
        content: 'Previous assessment showed good health',
        timestamp: new Date(),
        type: 'assessment',
        importance: 'medium',
        tags: ['health', 'assessment'],
        relevanceScore: 0.8
      }],
      predictiveInsights: [{
        insight: 'Health trajectory looks positive',
        confidence: 0.85,
        timeframe: '6 months',
        category: 'general'
      }],
      userPreferences: {
        healthGoals: ['maintain energy', 'optimize health'],
        focusAreas: ['metabolic health'],
        communicationStyle: 'detailed',
        treatmentPreferences: ['natural approaches']
      },
      adaptiveLearning: {
        personalizedFactors: ['Prefers natural approaches'],
        learningAdjustments: ['Emphasize nutrition'],
        confidenceLevel: 0.85
      },
      processingTime: 80
    })
  }))
}));

jest.mock('../../lib/memory-manager');

describe('Advanced Health AI Integration', () => {
  let advancedHealthAI: AdvancedHealthAI;
  let mockMemoryManager: jest.Mocked<MemoryManager>;

  const testHealthData: HealthData = {
    userId: 'test-user',
    timestamp: new Date(),
    age: 30,
    gender: 'female',
    height: 165,
    weight: 65,
    bodyTemperature: 98.6,
    pulseRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80 },
    labResults: {
      thyroid: {
        tsh: 2.1,
        t3: 3.2,
        t4: 8.5,
        reverseT3: 15,
        freeT3: 3.1,
        freeT4: 1.2
      },
      metabolic: {
        glucose: 90,
        hba1c: 5.2,
        insulin: 6.0,
        cholesterol: 180,
        triglycerides: 100
      },
      hormonal: {
        cortisol: 15,
        progesterone: 12,
        estrogen: 50,
        testosterone: 30,
        prolactin: 10
      }
    },
    symptoms: ['good energy', 'stable mood'],
    lifestyle: {
      diet: ['balanced nutrition', 'pro-metabolic foods'],
      exercise: ['regular walking', 'strength training'],
      sleep: { duration: 8, quality: 'good', bedtime: '10:00 PM' },
      stress: { level: 3, sources: ['work'] }
    }
  };

  beforeEach(() => {
    mockMemoryManager = new MemoryManager('test-key', 'test-url') as jest.Mocked<MemoryManager>;
    mockMemoryManager.storeHealthAnalysis = jest.fn().mockResolvedValue(undefined);
    mockMemoryManager.getRelevantContext = jest.fn().mockResolvedValue({
      userId: 'test-user',
      sessionId: 'test-session',
      relevantHistory: [],
      userPreferences: {
        healthGoals: ['maintain energy'],
        focusAreas: ['metabolic health'],
        communicationStyle: 'detailed',
        treatmentPreferences: ['natural approaches']
      },
      healthGoals: ['maintain optimal health'],
      conversationSummary: 'User has good health'
    });
    
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
    test('should generate comprehensive health insights', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      expect(insights).toBeDefined();
      expect(insights.userId).toBe('test-user');
      expect(insights.timestamp).toBeInstanceOf(Date);
      expect(insights.overallHealthScore).toBeGreaterThanOrEqual(0);
      expect(insights.overallHealthScore).toBeLessThanOrEqual(100);
    });

    test('should include all required analysis components', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      expect(insights.bioenergicsAnalysis).toBeDefined();
      expect(insights.patternAnalysis).toBeDefined();
      expect(insights.personalizedPlan).toBeDefined();
      expect(insights.enhancedMemoryContext).toBeDefined();
      expect(insights.synthesizedInsights).toBeDefined();
    });

    test('should generate prioritized recommendations', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      expect(insights.priorityRecommendations).toBeDefined();
      expect(Array.isArray(insights.priorityRecommendations)).toBe(true);
      expect(insights.priorityRecommendations.length).toBeGreaterThan(0);
    });

    test('should create follow-up schedule', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      expect(insights.followUpSchedule).toBeDefined();
      expect(insights.followUpSchedule.immediate).toBeDefined();
      expect(insights.followUpSchedule.shortTerm).toBeDefined();
      expect(insights.followUpSchedule.longTerm).toBeDefined();
    });

    test('should complete processing within performance target', async () => {
      await advancedHealthAI.initialize();
      
      const startTime = Date.now();
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      const totalTime = Date.now() - startTime;
      
      expect(totalTime).toBeLessThan(5000); // 5 seconds max
      expect(insights.processingTime).toBeLessThan(5000);
    });
  });

  describe('Ray Peat Bioenergetics Integration', () => {
    test('should prioritize bioenergetics principles', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      expect(insights.bioenergicsAnalysis.thyroidFunction).toBeDefined();
      expect(insights.bioenergicsAnalysis.glucoseMetabolism).toBeDefined();
      expect(insights.bioenergicsAnalysis.mitochondrialFunction).toBeDefined();
    });

    test('should include pro-metabolic recommendations', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      const hasProMetabolicRecs = insights.priorityRecommendations.some(rec =>
        rec.toLowerCase().includes('pro-metabolic') ||
        rec.toLowerCase().includes('thyroid') ||
        rec.toLowerCase().includes('metabolic')
      );
      
      expect(hasProMetabolicRecs).toBe(true);
    });
  });

  describe('Performance and Quality', () => {
    test('should maintain high confidence scores', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      expect(insights.confidenceScore).toBeGreaterThan(0.7);
      expect(insights.confidenceScore).toBeLessThanOrEqual(1.0);
    });

    test('should provide AI model version tracking', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights('test-user', testHealthData);
      
      expect(insights.aiModelVersions).toBeDefined();
      expect(insights.aiModelVersions.bioenergics).toBeDefined();
      expect(insights.aiModelVersions.patterns).toBeDefined();
      expect(insights.aiModelVersions.recommendations).toBeDefined();
      expect(insights.aiModelVersions.memory).toBeDefined();
    });
  });
});
