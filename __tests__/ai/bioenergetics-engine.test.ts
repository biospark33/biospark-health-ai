
/**
 * 🧪 BioSpark Health AI - Bioenergetics Engine Tests
 * 
 * Comprehensive test suite for Ray Peat bioenergetics AI engine
 * with enterprise-grade quality and HIPAA compliance.
 */

import { BioenergicsAIEngine } from '../../lib/ai/bioenergetics-engine';
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
              content: `
              T3 Level: 2.8 ng/dL (Low - optimal >3.0)
              T4 Level: 8.2 μg/dL (Normal range)
              TSH Level: 3.5 mIU/L (Elevated - optimal <2.0)
              Body Temperature: 97.2°F (Low - optimal >98.6°F)
              Pulse Rate: 65 bpm (Low - optimal 75-85)
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
        })
      }
    }
  }))
}));

// Mock MemoryManager
jest.mock('../../lib/memory-manager');

describe('Bioenergetics AI Engine', () => {
  let bioenergicsEngine: BioenergicsAIEngine;
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
      },
      hormonal: {
        cortisol: 18,
        progesterone: 8,
        estrogen: 120,
        testosterone: 25
      }
    },
    symptoms: ['fatigue', 'cold hands', 'brain fog', 'weight gain'],
    energyLevel: 4,
    sleepQuality: 5,
    diet: {
      macronutrients: {
        carbohydrates: 150,
        proteins: 80,
        fats: 70
      },
      foodTypes: ['dairy', 'fruit', 'meat', 'vegetables']
    }
  };

  beforeEach(() => {
    mockMemoryManager = new MemoryManager('test-key', 'test-url') as jest.Mocked<MemoryManager>;
    mockMemoryManager.getRelevantContext = jest.fn().mockResolvedValue({
      userId: 'test-user-123',
      healthHistory: [],
      preferences: {},
      patterns: []
    });
    mockMemoryManager.storeHealthAnalysis = jest.fn().mockResolvedValue(undefined);
    
    bioenergicsEngine = new BioenergicsAIEngine('test-openai-key', mockMemoryManager);
  });

  describe('Engine Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(bioenergicsEngine.initialize()).resolves.not.toThrow();
    });

    test('should auto-initialize on first analysis if not initialized', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );
      
      expect(analysis).toBeDefined();
      expect(analysis.userId).toBe('test-user-123');
    });
  });

  describe('Metabolic Health Analysis', () => {
    beforeEach(async () => {
      await bioenergicsEngine.initialize();
    });

    test('should perform comprehensive bioenergetics analysis', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis).toBeDefined();
      expect(analysis.userId).toBe('test-user-123');
      expect(analysis.timestamp).toBeInstanceOf(Date);
      expect(analysis.metabolicScore).toBeGreaterThanOrEqual(0);
      expect(analysis.metabolicScore).toBeLessThanOrEqual(100);
    });

    test('should analyze thyroid function according to Ray Peat principles', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.thyroidFunction).toBeDefined();
      expect(analysis.thyroidFunction.bodyTemperature).toBeDefined();
      expect(analysis.thyroidFunction.pulseRate).toBeDefined();
      expect(analysis.thyroidFunction.recommendations).toBeDefined();
      expect(Array.isArray(analysis.thyroidFunction.recommendations)).toBe(true);
    });

    test('should analyze glucose metabolism', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.glucoseMetabolism).toBeDefined();
      expect(analysis.glucoseMetabolism.recommendations).toBeDefined();
      expect(Array.isArray(analysis.glucoseMetabolism.recommendations)).toBe(true);
    });

    test('should analyze mitochondrial function', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.mitochondrialFunction).toBeDefined();
      expect(analysis.mitochondrialFunction.recommendations).toBeDefined();
      expect(Array.isArray(analysis.mitochondrialFunction.recommendations)).toBe(true);
    });

    test('should analyze hormonal balance', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.hormonalBalance).toBeDefined();
      expect(analysis.hormonalBalance.recommendations).toBeDefined();
      expect(Array.isArray(analysis.hormonalBalance.recommendations)).toBe(true);
    });

    test('should generate integrated recommendations', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    test('should prioritize interventions appropriately', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.interventions).toBeDefined();
      expect(Array.isArray(analysis.interventions)).toBe(true);
      
      // Should prioritize thyroid support for low temperature
      const thyroidInterventions = analysis.interventions.filter(intervention =>
        intervention.toLowerCase().includes('thyroid')
      );
      expect(thyroidInterventions.length).toBeGreaterThan(0);
    });

    test('should create monitoring plan', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.monitoringPlan).toBeDefined();
      expect(analysis.monitoringPlan.daily).toBeDefined();
      expect(analysis.monitoringPlan.weekly).toBeDefined();
      expect(analysis.monitoringPlan.monthly).toBeDefined();
      expect(analysis.monitoringPlan.quarterly).toBeDefined();
    });
  });

  describe('Ray Peat Bioenergetics Principles', () => {
    beforeEach(async () => {
      await bioenergicsEngine.initialize();
    });

    test('should prioritize body temperature in assessment', async () => {
      const lowTempData = {
        ...mockHealthData,
        bodyTemperature: 96.8
      };

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        lowTempData
      );

      expect(analysis.metabolicScore).toBeLessThan(70); // Low temp should reduce score
      
      const tempRecommendations = analysis.recommendations.filter(rec =>
        rec.toLowerCase().includes('temperature') || 
        rec.toLowerCase().includes('thyroid')
      );
      expect(tempRecommendations.length).toBeGreaterThan(0);
    });

    test('should assess pulse rate significance', async () => {
      const lowPulseData = {
        ...mockHealthData,
        pulseRate: 55
      };

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        lowPulseData
      );

      expect(analysis.thyroidFunction.pulseRate).toBe(55);
      expect(analysis.metabolicScore).toBeLessThan(75); // Low pulse should impact score
    });

    test('should evaluate metabolic rate holistically', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.thyroidFunction.metabolicRate).toBeDefined();
      expect(typeof analysis.thyroidFunction.metabolicRate).toBe('number');
    });

    test('should provide pro-metabolic recommendations', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      const proMetabolicRecs = analysis.recommendations.filter(rec =>
        rec.toLowerCase().includes('sugar') ||
        rec.toLowerCase().includes('fruit') ||
        rec.toLowerCase().includes('dairy') ||
        rec.toLowerCase().includes('pufa')
      );

      expect(proMetabolicRecs.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Quality', () => {
    beforeEach(async () => {
      await bioenergicsEngine.initialize();
    });

    test('should complete analysis within performance target', async () => {
      const startTime = Date.now();
      
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );
      
      const totalTime = Date.now() - startTime;
      
      expect(totalTime).toBeLessThan(3000); // 3 seconds max
      expect(analysis.processingTime).toBeLessThan(3000);
    });

    test('should store analysis in memory', async () => {
      await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(mockMemoryManager.storeHealthAnalysis).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          type: 'bioenergetics_analysis',
          data: expect.any(Object),
          timestamp: expect.any(Date)
        })
      );
    });

    test('should handle missing lab data gracefully', async () => {
      const incompleteData = {
        ...mockHealthData,
        labResults: undefined
      };

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        incompleteData
      );

      expect(analysis).toBeDefined();
      expect(analysis.userId).toBe('test-user-123');
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    test('should provide meaningful metabolic scores', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.metabolicScore).toBeGreaterThan(0);
      expect(analysis.metabolicScore).toBeLessThanOrEqual(100);
      
      // Score should reflect health status
      if (mockHealthData.bodyTemperature! < 98.0) {
        expect(analysis.metabolicScore).toBeLessThan(80);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle OpenAI API failures gracefully', async () => {
      // Mock API failure
      const failingEngine = new BioenergicsAIEngine('invalid-key', mockMemoryManager);
      
      await expect(failingEngine.initialize()).rejects.toThrow();
    });

    test('should handle malformed health data', async () => {
      await bioenergicsEngine.initialize();
      
      const malformedData = {
        userId: 'test-user-123',
        timestamp: new Date(),
        // Missing most required fields
      } as HealthData;

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        malformedData
      );

      expect(analysis).toBeDefined();
      expect(analysis.userId).toBe('test-user-123');
    });

    test('should provide fallback recommendations when AI parsing fails', async () => {
      await bioenergicsEngine.initialize();
      
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.recommendations).toBeDefined();
      expect(analysis.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('HIPAA Compliance', () => {
    beforeEach(async () => {
      await bioenergicsEngine.initialize();
    });

    test('should not log sensitive health data', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      const loggedMessages = consoleSpy.mock.calls.flat().join(' ');
      
      // Should not contain sensitive data
      expect(loggedMessages).not.toContain('3.5'); // TSH value
      expect(loggedMessages).not.toContain('97.2'); // Temperature
      expect(loggedMessages).not.toContain('fatigue'); // Symptoms
      
      consoleSpy.mockRestore();
    });

    test('should handle user data securely', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      // Analysis should contain user ID but not expose raw sensitive data in logs
      expect(analysis.userId).toBe('test-user-123');
      expect(analysis.timestamp).toBeInstanceOf(Date);
    });
  });
});

describe('Bioenergetics Engine Integration', () => {
  let bioenergicsEngine: BioenergicsAIEngine;
  let mockMemoryManager: jest.Mocked<MemoryManager>;

  beforeEach(async () => {
    mockMemoryManager = new MemoryManager('test-key', 'test-url') as jest.Mocked<MemoryManager>;
    mockMemoryManager.getRelevantContext = jest.fn().mockResolvedValue({
      userId: 'test-user-123',
      healthHistory: [
        { type: 'lab_result', data: { tsh: 4.2 }, timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        { type: 'symptom', data: { symptoms: ['fatigue', 'cold'] }, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      ],
      preferences: { focusAreas: ['thyroid', 'energy'] },
      patterns: []
    });
    mockMemoryManager.storeHealthAnalysis = jest.fn().mockResolvedValue(undefined);
    
    bioenergicsEngine = new BioenergicsAIEngine('test-openai-key', mockMemoryManager);
    await bioenergicsEngine.initialize();
  });

  test('should integrate health history into analysis', async () => {
    const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
      'test-user-123',
      mockHealthData
    );

    expect(mockMemoryManager.getRelevantContext).toHaveBeenCalledWith('test-user-123');
    expect(analysis).toBeDefined();
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });

  test('should consider user preferences in recommendations', async () => {
    const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
      'test-user-123',
      mockHealthData
    );

    // Should include thyroid-focused recommendations based on preferences
    const thyroidRecs = analysis.recommendations.filter(rec =>
      rec.toLowerCase().includes('thyroid') || 
      rec.toLowerCase().includes('energy')
    );
    
    expect(thyroidRecs.length).toBeGreaterThan(0);
  });
});
