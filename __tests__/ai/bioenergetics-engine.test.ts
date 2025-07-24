

/**
 * 🧪 BioSpark Health AI - Bioenergetics Engine Tests
 * 
 * Comprehensive test suite for Ray Peat bioenergetics analysis engine
 * with advanced metabolic health assessment capabilities.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import BioenergicsAIEngine from '../../lib/ai/bioenergetics-engine';
import { MemoryManager } from '../../lib/memory-manager';

// Mock OpenAI
const mockOpenAI = {
  models: {
    list: jest.fn().mockResolvedValue({ data: [] })
  },
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: `
            Thyroid Analysis:
            - T3 Level: 3.2 pg/mL
            - T4 Level: 1.1 ng/dL
            - TSH Level: 2.1 mIU/L
            - Reverse T3: 12 ng/dL
            - Body Temperature: 98.6°F
            - Pulse Rate: 75 bpm
            - Metabolic Rate: Optimal
            
            Recommendations:
            1. Continue monitoring thyroid function
            2. Maintain adequate iodine intake
            3. Support T4 to T3 conversion
            4. Optimize selenium levels
            `
          }
        }]
      })
    }
  }
};

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockOpenAI)
  };
});

// Mock MemoryManager
const mockMemoryManager = {
  getRelevantContext: jest.fn().mockResolvedValue({
    previousAnalyses: [],
    userPreferences: { focusAreas: ['thyroid', 'energy'] },
    healthGoals: ['Improve energy levels', 'Optimize thyroid function']
  }),
  storeAnalysis: jest.fn().mockResolvedValue({ success: true }),
  updateUserPreferences: jest.fn().mockResolvedValue({ success: true })
} as unknown as MemoryManager;

describe('Bioenergetics AI Engine', () => {
  let bioenergicsEngine: BioenergicsAIEngine;

  // Add missing mockHealthData declaration at the top of describe block
  const mockHealthData = {
    userId: 'test-user-123',
    pulseRate: 55,
    bodyTemperature: 98.6,
    symptoms: ['fatigue', 'cold hands'],
    medications: [],
    labResults: {},
    timestamp: new Date().toISOString()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    bioenergicsEngine = new BioenergicsAIEngine('test-openai-key', mockMemoryManager);
  });

  describe('Initialization', () => {
    test('should initialize successfully with valid API key', async () => {
      await expect(bioenergicsEngine.initialize()).resolves.not.toThrow();
    });

    test('should load Ray Peat bioenergetics knowledge base', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bioenergicsEngine.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('📚 Loading Ray Peat bioenergetics knowledge base...');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Bioenergetics AI Engine initialized successfully');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Ray Peat Bioenergetics Principles', () => {
    beforeEach(async () => {
      await bioenergicsEngine.initialize();
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

      expect(analysis.thyroidFunction).toBeDefined();
      expect(analysis.glucoseMetabolism).toBeDefined();
      expect(analysis.mitochondrialHealth).toBeDefined();
      expect(analysis.hormonalBalance).toBeDefined();
      expect(analysis.metabolicScore).toBeGreaterThan(0);
    });

    test('should prioritize thyroid optimization', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      const thyroidRecommendations = analysis.recommendations.filter(rec =>
        rec.toLowerCase().includes('thyroid') || 
        rec.toLowerCase().includes('t3') ||
        rec.toLowerCase().includes('temperature')
      );

      expect(thyroidRecommendations.length).toBeGreaterThan(0);
    });

    test('should assess body temperature significance', async () => {
      const lowTempData = {
        ...mockHealthData,
        bodyTemperature: 97.2
      };

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        lowTempData
      );

      expect(analysis.thyroidFunction.bodyTemperature).toBe(97.2);
      expect(analysis.metabolicScore).toBeLessThan(80); // Low temperature should impact score
    });

    test('should evaluate glucose metabolism efficiency', async () => {
      const diabeticData = {
        ...mockHealthData,
        labResults: {
          fastingGlucose: 125,
          hba1c: 6.2
        }
      };

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        diabeticData
      );

      expect(analysis.glucoseMetabolism.fastingGlucose).toBeGreaterThan(100);
      expect(analysis.metabolicScore).toBeLessThan(70);
    });

    test('should assess mitochondrial function', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.mitochondrialHealth.energyProduction).toBeDefined();
      expect(analysis.mitochondrialHealth.oxidativeStress).toBeDefined();
      expect(analysis.mitochondrialHealth.recommendations.length).toBeGreaterThan(0);
    });

    test('should evaluate hormonal balance', async () => {
      const hormonalData = {
        ...mockHealthData,
        labResults: {
          cortisol: 25,
          estrogen: 180,
          progesterone: 8
        }
      };

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        hormonalData
      );

      expect(analysis.hormonalBalance.cortisol).toBeDefined();
      expect(analysis.hormonalBalance.estrogen).toBeDefined();
      expect(analysis.hormonalBalance.progesterone).toBeDefined();
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
        timestamp: new Date().toISOString()
        // Missing other required fields
      };

      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        malformedData
      );

      expect(analysis).toBeDefined();
      expect(analysis.thyroidFunction.pulseRate).toBe(0); // Should handle missing data
      expect(analysis.thyroidFunction.bodyTemperature).toBe(0);
    });

    test('should handle memory manager failures', async () => {
      const failingMemoryManager = {
        getRelevantContext: jest.fn().mockRejectedValue(new Error('Memory failure')),
        storeAnalysis: jest.fn().mockResolvedValue({ success: true }),
        updateUserPreferences: jest.fn().mockResolvedValue({ success: true })
      } as unknown as MemoryManager;

      const engineWithFailingMemory = new BioenergicsAIEngine('test-key', failingMemoryManager);
      await engineWithFailingMemory.initialize();

      // Should still work even if memory fails
      await expect(
        engineWithFailingMemory.analyzeMetabolicHealth('test-user', mockHealthData)
      ).resolves.toBeDefined();
    });
  });

  describe('Recommendations Generation', () => {
    beforeEach(async () => {
      await bioenergicsEngine.initialize();
    });

    test('should generate prioritized recommendations', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.recommendations).toBeDefined();
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      
      // Should prioritize thyroid support based on Ray Peat principles
      const firstRec = analysis.recommendations[0].toLowerCase();
      expect(
        firstRec.includes('thyroid') || 
        firstRec.includes('pufa') || 
        firstRec.includes('glucose')
      ).toBe(true);
    });

    test('should create comprehensive monitoring plan', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.monitoringPlan).toBeDefined();
      expect(analysis.monitoringPlan.daily).toContain('Body temperature');
      expect(analysis.monitoringPlan.daily).toContain('Pulse rate');
      expect(analysis.monitoringPlan.monthly).toContain('Thyroid panel');
    });

    test('should calculate confidence scores', async () => {
      const analysis = await bioenergicsEngine.analyzeMetabolicHealth(
        'test-user-123',
        mockHealthData
      );

      expect(analysis.confidence).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('Bioenergetics Engine Integration', () => {
  let bioenergicsEngine: BioenergicsAIEngine;

  // Add missing mockHealthData declaration at the top of describe block
  const mockHealthData = {
    userId: 'test-user-123',
    pulseRate: 55,
    bodyTemperature: 98.6,
    symptoms: ['fatigue', 'cold hands'],
    medications: [],
    labResults: {},
    timestamp: new Date().toISOString()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
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
