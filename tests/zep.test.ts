
/**
 * Zep Memory Integration Tests
 * Phase 2A Foundation - Connectivity and Basic Operations Testing
 */

import { testZepConnection } from '../lib/zep/client';
import { createUserSession, getOrCreateUserSession } from '../lib/zep/sessions';
import { storeHealthAnalysis, getHealthContext } from '../lib/zep/memory';
import { AnalysisSummary } from '../lib/zep/types';

describe('Zep Memory Integration', () => {
  const testUserId = 'test_user_' + Date.now();
  let testSessionId: string;

  beforeAll(async () => {
    // Ensure we have a test session
    const sessionResult = await createUserSession(testUserId, {
      sessionType: 'health_analysis',
      userEmail: 'test@example.com'
    });
    
    if (sessionResult.success && sessionResult.data) {
      testSessionId = sessionResult.data;
    }
  });

  test('Zep API connectivity', async () => {
    const isConnected = await testZepConnection();
    expect(isConnected).toBe(true);
  }, 10000);

  test('Create user session', async () => {
    const result = await createUserSession(testUserId + '_new');
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(typeof result.data).toBe('string');
  }, 10000);

  test('Get or create user session', async () => {
    const result = await getOrCreateUserSession(testUserId);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  }, 10000);

  test('Store health analysis in memory', async () => {
    const mockAnalysis: AnalysisSummary = {
      id: 'test_analysis_' + Date.now(),
      timestamp: new Date(),
      labResults: {
        testType: 'Comprehensive Metabolic Panel',
        keyFindings: ['Elevated glucose', 'Low vitamin D'],
        recommendations: ['Reduce sugar intake', 'Increase sun exposure'],
        riskFactors: ['Pre-diabetes risk']
      },
      bioenergetic: {
        metabolicHealth: 'Moderate concerns with glucose regulation',
        thyroidFunction: 'Within normal range',
        stressMarkers: 'Elevated cortisol patterns',
        nutritionalStatus: 'Vitamin D deficiency noted'
      },
      rayPeatInsights: {
        principles: ['Focus on metabolic rate optimization'],
        recommendations: ['Increase carbohydrate quality', 'Support thyroid function'],
        warnings: ['Avoid excessive PUFA intake']
      },
      severity: 'moderate',
      followUpRequired: true
    };

    if (testSessionId) {
      const result = await storeHealthAnalysis(testUserId, testSessionId, mockAnalysis);
      expect(result.success).toBe(true);
    }
  }, 15000);

  test('Retrieve health context from memory', async () => {
    if (testSessionId) {
      const result = await getHealthContext(testUserId, testSessionId, 'glucose diabetes');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(testUserId);
      expect(result.data?.sessionId).toBe(testSessionId);
      expect(Array.isArray(result.data?.relevantHistory)).toBe(true);
    }
  }, 10000);

  afterAll(async () => {
    // Cleanup test data if needed
    console.log('Test cleanup completed');
  });
});
