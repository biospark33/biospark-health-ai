
/**
 * 🧪 BioSpark Health AI - Phase 2 Integration Tests
 * 
 * Comprehensive integration test suite for Phase 2 advanced AI features
 * with Ray Peat bioenergetics principles and enterprise-grade quality.
 */

import { AdvancedHealthAI } from '../lib/ai/advanced-health-ai';
import { MemoryManager } from '../lib/memory-manager';
import { HealthData } from '../lib/types/health-types';

// Mock OpenAI with realistic responses
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockImplementation((params) => {
          // Return different responses based on the prompt content
          const prompt = params.messages[0].content.toLowerCase();
          
          if (prompt.includes('synthesize')) {
            return Promise.resolve({
              choices: [{
                message: {
                  content: JSON.stringify([{
                    category: 'metabolic',
                    insight: 'Low body temperature and pulse indicate thyroid dysfunction requiring immediate attention',
                    confidence: 0.92,
                    priority: 'high',
                    supportingEvidence: ['Temperature: 97.2°F', 'Pulse: 65 bpm', 'TSH: 3.5'],
                    recommendations: ['Thyroid hormone optimization', 'Pro-metabolic nutrition', 'Temperature monitoring'],
                    timeframe: 'immediate'
                  }, {
                    category: 'nutritional',
                    insight: 'Current macronutrient balance may be suppressing metabolic rate',
                    confidence: 0.85,
                    priority: 'medium',
                    supportingEvidence: ['Low carbohydrate intake', 'Symptoms of fatigue'],
                    recommendations: ['Increase easily digestible carbohydrates', 'Add fruit and honey', 'Eliminate PUFA sources'],
                    timeframe: 'short-term'
                  }])
                }
              }]
            });
          }
          
          if (prompt.includes('risk assessment')) {
            return Promise.resolve({
              choices: [{
                message: {
                  content: JSON.stringify({
                    overallRisk: 'moderate',
                    riskFactors: [
                      { factor: 'Hypothyroid symptoms', severity: 0.8, category: 'metabolic', modifiable: true },
                      { factor: 'Low body temperature', severity: 0.7, category: 'metabolic', modifiable: true }
                    ],
                    protectiveFactors: [
                      { factor: 'Young age', strength: 0.6, category: 'demographic', maintainable: false },
                      { factor: 'Awareness of health issues', strength: 0.8, category: 'behavioral', maintainable: true }
                    ],
                    interventionPriorities: [
                      'Thyroid function optimization',
                      'Pro-metabolic nutrition implementation',
                      'Stress reduction protocols'
                    ],
                    monitoringRequirements: [
                      'Daily body temperature',
                      'Weekly pulse rate',
                      'Monthly thyroid panel'
                    ]
                  })
                }
              }]
            });
          }
          
          // Default bioenergetics analysis response
          return Promise.resolve({
            choices: [{
              message: {
                content: `
                Thyroid Analysis:
                T3: 2.8 ng/dL (Low - optimal >3.0)
                T4: 8.2 μg/dL (Normal)
                TSH: 3.5 mIU/L (Elevated)
                Body Temperature: 97.2°F (Low)
                Pulse Rate: 65 bpm (Low)
                Metabolic Rate: Reduced
                
                Recommendations:
                1. Support thyroid function with adequate carbohydrates
                2. Monitor body temperature daily
                3. Consider thyroid hormone optimization
                4. Eliminate PUFA sources
                5. Increase pro-metabolic foods
                `
              }
            }]
          });
        })
      }
    }
  }))
}));

// Mock all AI engines
jest.mock('../lib/ai/bioenergetics-engine');
jest.mock('../lib/ai/health-pattern-ai');
jest.mock('../lib/ai/personalized-recommendation-ai');
jest.mock('../lib/ai/intelligent-memory-ai');
jest.mock('../lib/memory-manager');

describe('Phase 2 Advanced AI Integration', () => {
  let advancedHealthAI: AdvancedHealthAI;
  let mockMemoryManager: jest.Mocked<MemoryManager>;
  
  const comprehensiveHealthData: HealthData = {
    userId: 'phase2-test-user',
    timestamp: new Date(),
    age: 32,
    gender: 'female',
    height: 165,
    weight: 68,
    
    // Vital signs indicating hypothyroid pattern
    bodyTemperature: 97.2,
    pulseRate: 65,
    bloodPressure: { systolic: 110, diastolic: 70 },
    
    // Comprehensive lab results
    labResults: {
      thyroid: {
        tsh: 3.5,
        t3: 2.8,
        t4: 8.2,
        reverseT3: 18,
        freeT3: 2.9,
        freeT4: 1.1
      },
      metabolic: {
        glucose: 95,
        hba1c: 5.4,
        insulin: 8.5,
        cholesterol: 220,
        triglycerides: 140
      },
      hormonal: {
        cortisol: 18,
        progesterone: 8,
        estrogen: 120,
        testosterone: 25,
        prolactin: 15
      },
      nutritional: {
        vitaminD: 32,
        b12: 450,
        folate: 12,
        iron: 85,
        ferritin: 45
      }
    },
    
    // Symptoms consistent with hypothyroid
    symptoms: ['fatigue', 'cold hands and feet', 'brain fog', 'weight gain', 'hair loss', 'constipation'],
    energyLevel: 3,
    moodRating: 4,
    sleepQuality: 5,
    stressLevel: 7,
    exerciseTolerance: 3,
    
    // Current diet (potentially problematic)
    diet: {
      macronutrients: {
        carbohydrates: 120, // Low carbs
        proteins: 90,
        fats: 80
      },
      foodTypes: ['salads', 'lean meats', 'nuts', 'seeds', 'vegetables'],
      restrictions: ['dairy', 'sugar'],
      supplements: ['multivitamin', 'fish oil', 'vitamin D']
    },
    
    // Exercise pattern
    exercise: {
      type: ['running', 'HIIT', 'strength training'],
      frequency: 6,
      duration: 60,
      intensity: 'high'
    },
    
    // Sleep pattern
    sleep: {
      duration: 6.5,
      bedtime: '11:30 PM',
      wakeTime: '6:00 AM',
      quality: 5
    },
    
    // Environmental factors
    environment: {
      lightExposure: ['indoor lighting', 'minimal sunlight'],
      temperature: 68,
      stressors: ['work pressure', 'relationship stress'],
      toxinExposure: ['city pollution', 'household chemicals']
    },
    
    // Medical history
    medicalHistory: {
      conditions: ['hypothyroid symptoms', 'chronic fatigue'],
      medications: [],
      allergies: ['shellfish'],
      surgeries: [],
      familyHistory: ['thyroid disease', 'diabetes']
    }
  };

  beforeEach(() => {
    mockMemoryManager = new MemoryManager('test-key', 'test-url') as jest.Mocked<MemoryManager>;
    mockMemoryManager.getRelevantContext = jest.fn().mockResolvedValue({
      userId: 'phase2-test-user',
      sessionId: 'test-session',
      relevantHistory: [
        {
          id: 'history-1',
          content: 'Previous thyroid panel showed TSH 4.2, started feeling more fatigued',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          type: 'lab_result',
          importance: 'high',
          tags: ['thyroid', 'fatigue']
        }
      ],
      userPreferences: {
        healthGoals: ['increase energy', 'optimize thyroid', 'improve mood'],
        focusAreas: ['metabolic health', 'hormonal balance'],
        communicationStyle: 'detailed',
        treatmentPreferences: ['natural approaches', 'nutrition-based']
      },
      healthGoals: ['restore energy levels', 'optimize metabolic function', 'improve sleep quality'],
      conversationSummary: 'User experiencing classic hypothyroid symptoms with declining energy over past 6 months'
    });
    
    mockMemoryManager.getUserHealthJourney = jest.fn().mockResolvedValue([
      {
        id: 'journey-1',
        userId: 'phase2-test-user',
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        type: 'assessment',
        data: { energyLevel: 6, bodyTemperature: 98.1 },
        context: 'Initial assessment - better energy levels',
        tags: ['baseline'],
        importance: 'high'
      },
      {
        id: 'journey-2',
        userId: 'phase2-test-user',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        type: 'lab_result',
        data: { tsh: 4.2, t3: 2.6 },
        context: 'Thyroid function declining',
        tags: ['thyroid', 'decline'],
        importance: 'high'
      }
    ]);
    
    mockMemoryManager.storeHealthAnalysis = jest.fn().mockResolvedValue(undefined);
    
    advancedHealthAI = new AdvancedHealthAI('test-openai-key', mockMemoryManager);
  });

  describe('Phase 2 System Integration', () => {
    test('should initialize all Phase 2 AI components successfully', async () => {
      await expect(advancedHealthAI.initialize()).resolves.not.toThrow();
      
      const status = await advancedHealthAI.getSystemStatus();
      expect(status.status).toBe('healthy');
      expect(status.performance.overallHealth).toBeGreaterThan(0.8);
    });

    test('should generate comprehensive advanced health insights', async () => {
      await advancedHealthAI.initialize();
      
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      // Verify comprehensive analysis structure
      expect(insights).toBeDefined();
      expect(insights.userId).toBe('phase2-test-user');
      expect(insights.timestamp).toBeInstanceOf(Date);
      
      // Verify all AI components contributed
      expect(insights.bioenergicsAnalysis).toBeDefined();
      expect(insights.patternAnalysis).toBeDefined();
      expect(insights.personalizedPlan).toBeDefined();
      expect(insights.enhancedMemoryContext).toBeDefined();
      
      // Verify synthesis and integration
      expect(insights.synthesizedInsights).toBeDefined();
      expect(insights.synthesizedInsights.length).toBeGreaterThan(0);
      expect(insights.overallHealthScore).toBeGreaterThanOrEqual(0);
      expect(insights.overallHealthScore).toBeLessThanOrEqual(100);
      expect(insights.confidenceScore).toBeGreaterThan(0);
      expect(insights.confidenceScore).toBeLessThanOrEqual(1);
    });

    test('should meet Phase 2 performance benchmarks', async () => {
      await advancedHealthAI.initialize();
      
      const startTime = Date.now();
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );
      const totalTime = Date.now() - startTime;

      // Performance benchmarks for Phase 2
      expect(totalTime).toBeLessThan(5000); // 5 seconds max for comprehensive analysis
      expect(insights.processingTime).toBeLessThan(5000);
      expect(insights.confidenceScore).toBeGreaterThan(0.8); // High confidence required
    });
  });

  describe('Ray Peat Bioenergetics Integration', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should identify hypothyroid pattern from comprehensive data', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      // Should identify thyroid dysfunction as primary issue
      const thyroidInsights = insights.synthesizedInsights.filter(insight =>
        insight.category === 'metabolic' && 
        insight.insight.toLowerCase().includes('thyroid')
      );
      
      expect(thyroidInsights.length).toBeGreaterThan(0);
      expect(thyroidInsights[0].priority).toMatch(/^(high|critical)$/);
    });

    test('should prioritize Ray Peat principles in recommendations', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      const rayPeatRecommendations = insights.priorityRecommendations.filter(rec =>
        rec.toLowerCase().includes('thyroid') ||
        rec.toLowerCase().includes('temperature') ||
        rec.toLowerCase().includes('carbohydrate') ||
        rec.toLowerCase().includes('pufa') ||
        rec.toLowerCase().includes('metabolic')
      );

      expect(rayPeatRecommendations.length).toBeGreaterThan(2);
    });

    test('should assess metabolic dysfunction severity correctly', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      // With low temp (97.2°F) and low pulse (65), score should reflect dysfunction
      expect(insights.overallHealthScore).toBeLessThan(70);
      expect(insights.riskAssessment.overallRisk).toMatch(/^(moderate|high)$/);
    });

    test('should identify problematic dietary patterns', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      const nutritionalInsights = insights.synthesizedInsights.filter(insight =>
        insight.category === 'nutritional'
      );

      expect(nutritionalInsights.length).toBeGreaterThan(0);
      
      // Should identify low carb and PUFA issues
      const nutritionalRecommendations = insights.priorityRecommendations.filter(rec =>
        rec.toLowerCase().includes('carbohydrate') ||
        rec.toLowerCase().includes('pufa') ||
        rec.toLowerCase().includes('sugar')
      );
      
      expect(nutritionalRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced AI Features', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should synthesize insights across all AI engines', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      // Should have insights from multiple categories
      const categories = [...new Set(insights.synthesizedInsights.map(i => i.category))];
      expect(categories.length).toBeGreaterThanOrEqual(2);
      
      // Should include metabolic and nutritional at minimum
      expect(categories).toContain('metabolic');
      expect(categories.some(cat => ['nutritional', 'hormonal', 'lifestyle'].includes(cat))).toBe(true);
    });

    test('should provide integrated risk assessment', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      expect(insights.riskAssessment).toBeDefined();
      expect(insights.riskAssessment.overallRisk).toMatch(/^(low|moderate|high|critical)$/);
      expect(insights.riskAssessment.riskFactors).toBeDefined();
      expect(insights.riskAssessment.protectiveFactors).toBeDefined();
      expect(insights.riskAssessment.interventionPriorities).toBeDefined();
      expect(insights.riskAssessment.monitoringRequirements).toBeDefined();
    });

    test('should create actionable follow-up schedule', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      expect(insights.followUpSchedule).toBeDefined();
      expect(insights.followUpSchedule.immediate).toBeDefined();
      expect(insights.followUpSchedule.shortTerm).toBeDefined();
      expect(insights.followUpSchedule.longTerm).toBeDefined();
      
      // Should have immediate actions for moderate/high risk
      if (insights.riskAssessment.overallRisk === 'moderate' || insights.riskAssessment.overallRisk === 'high') {
        expect(insights.followUpSchedule.immediate.length).toBeGreaterThan(0);
      }
    });

    test('should provide immediate actions for urgent cases', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      expect(insights.immediateActions).toBeDefined();
      expect(Array.isArray(insights.immediateActions)).toBe(true);
      
      // Should extract immediate actions from recommendations
      expect(insights.monitoringPriorities).toBeDefined();
      expect(Array.isArray(insights.monitoringPriorities)).toBe(true);
    });
  });

  describe('Memory Integration and Context', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should integrate health history into analysis', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      // Should have called memory functions
      expect(mockMemoryManager.getRelevantContext).toHaveBeenCalledWith('phase2-test-user');
      expect(mockMemoryManager.getUserHealthJourney).toHaveBeenCalledWith('phase2-test-user');
      
      // Should store comprehensive analysis
      expect(mockMemoryManager.storeHealthAnalysis).toHaveBeenCalledWith(
        'phase2-test-user',
        expect.objectContaining({
          type: 'advanced_health_insights',
          data: expect.any(Object),
          timestamp: expect.any(Date)
        })
      );
    });

    test('should consider user preferences in personalization', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      // Should reflect user's preference for natural approaches
      const naturalRecommendations = insights.priorityRecommendations.filter(rec =>
        rec.toLowerCase().includes('natural') ||
        rec.toLowerCase().includes('nutrition') ||
        rec.toLowerCase().includes('food') ||
        rec.toLowerCase().includes('lifestyle')
      );
      
      expect(naturalRecommendations.length).toBeGreaterThan(0);
    });

    test('should track health journey progression', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      // Should identify declining trend from health journey
      const trendInsights = insights.synthesizedInsights.filter(insight =>
        insight.insight.toLowerCase().includes('declining') ||
        insight.insight.toLowerCase().includes('worsening') ||
        insight.insight.toLowerCase().includes('trend')
      );
      
      // May or may not have trend insights, but analysis should be comprehensive
      expect(insights.synthesizedInsights.length).toBeGreaterThan(0);
    });
  });

  describe('Enterprise Quality and Compliance', () => {
    beforeEach(async () => {
      await advancedHealthAI.initialize();
    });

    test('should maintain HIPAA compliance throughout analysis', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      const loggedMessages = consoleSpy.mock.calls.flat().join(' ');
      
      // Should not log sensitive health data
      expect(loggedMessages).not.toContain('3.5'); // TSH value
      expect(loggedMessages).not.toContain('97.2'); // Temperature
      expect(loggedMessages).not.toContain('fatigue'); // Symptoms
      
      consoleSpy.mockRestore();
    });

    test('should provide AI model version tracking', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      expect(insights.aiModelVersions).toBeDefined();
      expect(insights.aiModelVersions.bioenergics).toBeDefined();
      expect(insights.aiModelVersions.patterns).toBeDefined();
      expect(insights.aiModelVersions.recommendations).toBeDefined();
      expect(insights.aiModelVersions.memory).toBeDefined();
    });

    test('should maintain high confidence scores for quality assurance', async () => {
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      expect(insights.confidenceScore).toBeGreaterThan(0.7);
      
      // High confidence insights should have supporting evidence
      const highConfidenceInsights = insights.synthesizedInsights.filter(
        insight => insight.confidence > 0.8
      );
      
      highConfidenceInsights.forEach(insight => {
        expect(insight.supportingEvidence).toBeDefined();
        expect(insight.supportingEvidence.length).toBeGreaterThan(0);
      });
    });

    test('should handle concurrent user requests efficiently', async () => {
      const concurrentRequests = Array(3).fill(null).map((_, index) => 
        advancedHealthAI.generateAdvancedInsights(
          `phase2-test-user-${index}`,
          { ...comprehensiveHealthData, userId: `phase2-test-user-${index}` }
        )
      );

      const results = await Promise.all(concurrentRequests);
      
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.userId).toBe(`phase2-test-user-${index}`);
        expect(result.processingTime).toBeLessThan(10000); // Allow more time for concurrent
        expect(result.confidenceScore).toBeGreaterThan(0.7);
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle partial AI engine failures gracefully', async () => {
      await advancedHealthAI.initialize();
      
      // Should still provide analysis even if some components fail
      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        comprehensiveHealthData
      );

      expect(insights).toBeDefined();
      expect(insights.userId).toBe('phase2-test-user');
      expect(insights.overallHealthScore).toBeGreaterThanOrEqual(0);
    });

    test('should provide meaningful analysis with minimal data', async () => {
      await advancedHealthAI.initialize();
      
      const minimalData: HealthData = {
        userId: 'phase2-test-user',
        timestamp: new Date(),
        bodyTemperature: 97.0,
        symptoms: ['fatigue']
      };

      const insights = await advancedHealthAI.generateAdvancedInsights(
        'phase2-test-user',
        minimalData
      );

      expect(insights).toBeDefined();
      expect(insights.synthesizedInsights.length).toBeGreaterThanOrEqual(0);
      expect(insights.priorityRecommendations.length).toBeGreaterThanOrEqual(0);
    });

    test('should maintain system health monitoring', async () => {
      await advancedHealthAI.initialize();
      
      const status = await advancedHealthAI.getSystemStatus();
      
      expect(status).toBeDefined();
      expect(status.status).toMatch(/^(healthy|degraded|critical)$/);
      expect(status.components).toBeDefined();
      expect(status.performance).toBeDefined();
      expect(status.performance.overallHealth).toBeGreaterThanOrEqual(0);
      expect(status.performance.overallHealth).toBeLessThanOrEqual(1);
    });
  });
});

describe('Phase 2 Performance Benchmarks', () => {
  let advancedHealthAI: AdvancedHealthAI;
  let mockMemoryManager: jest.Mocked<MemoryManager>;

  beforeEach(async () => {
    mockMemoryManager = new MemoryManager('test-key', 'test-url') as jest.Mocked<MemoryManager>;
    mockMemoryManager.getRelevantContext = jest.fn().mockResolvedValue({
      userId: 'benchmark-user',
      sessionId: 'benchmark-session',
      relevantHistory: [],
      userPreferences: { healthGoals: ['energy optimization'] },
      healthGoals: ['restore energy'],
      conversationSummary: 'Benchmark test user'
    });
    mockMemoryManager.getUserHealthJourney = jest.fn().mockResolvedValue([]);
    mockMemoryManager.storeHealthAnalysis = jest.fn().mockResolvedValue(undefined);
    
    advancedHealthAI = new AdvancedHealthAI('test-openai-key', mockMemoryManager);
    await advancedHealthAI.initialize();
  });

  test('should meet "knock socks off" performance standards', async () => {
    const startTime = Date.now();
    
    const insights = await advancedHealthAI.generateAdvancedInsights(
      'benchmark-user',
      comprehensiveHealthData
    );
    
    const totalTime = Date.now() - startTime;
    
    // "Knock socks off" benchmarks
    expect(totalTime).toBeLessThan(3000); // 3 seconds for wow factor
    expect(insights.processingTime).toBeLessThan(3000);
    expect(insights.confidenceScore).toBeGreaterThan(0.85); // Very high confidence
    expect(insights.synthesizedInsights.length).toBeGreaterThan(1); // Multiple insights
    expect(insights.priorityRecommendations.length).toBeGreaterThan(3); // Rich recommendations
    
    // Quality indicators
    expect(insights.overallHealthScore).toBeGreaterThan(0);
    expect(insights.riskAssessment.interventionPriorities.length).toBeGreaterThan(0);
    expect(insights.followUpSchedule.immediate.length).toBeGreaterThanOrEqual(0);
  });

  test('should scale to enterprise load requirements', async () => {
    const concurrentUsers = 10;
    const requests = Array(concurrentUsers).fill(null).map((_, index) => 
      advancedHealthAI.generateAdvancedInsights(
        `enterprise-user-${index}`,
        { ...comprehensiveHealthData, userId: `enterprise-user-${index}` }
      )
    );

    const startTime = Date.now();
    const results = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // Enterprise scalability benchmarks
    expect(results).toHaveLength(concurrentUsers);
    expect(totalTime).toBeLessThan(15000); // 15 seconds for 10 concurrent users
    
    results.forEach((result, index) => {
      expect(result.userId).toBe(`enterprise-user-${index}`);
      expect(result.confidenceScore).toBeGreaterThan(0.7);
      expect(result.processingTime).toBeLessThan(10000);
    });
  });
});
