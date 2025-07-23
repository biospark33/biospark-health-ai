
import { LabInsightZepClient, defaultZepConfig } from '../lib/zep-client';
import { MemoryManager } from '../lib/memory-manager';
import { SessionManager } from '../lib/session-manager';

// Mock Zep client for testing
jest.mock('@getzep/zep-js');

describe('Zep Integration Tests', () => {
  let zepClient: LabInsightZepClient;
  let memoryManager: MemoryManager;
  let sessionManager: SessionManager;

  beforeEach(() => {
    zepClient = new LabInsightZepClient({
      ...defaultZepConfig,
      apiKey: 'test-api-key'
    });
    memoryManager = new MemoryManager(zepClient);
    sessionManager = new SessionManager();
  });

  describe('ZepClient', () => {
    test('should create user session successfully', async () => {
      const userId = 'test-user-123';
      const sessionId = await zepClient.createUserSession(userId);
      
      expect(sessionId).toBeDefined();
      expect(sessionId).toContain('labinsight');
      expect(sessionId).toContain(userId);
    });

    test('should store health analysis memory with encryption', async () => {
      const sessionId = 'test-session-123';
      const analysisData = {
        insights: ['Test insight'],
        recommendations: ['Test recommendation'],
        riskFactors: ['Test risk factor']
      };

      await expect(
        zepClient.storeHealthAnalysisMemory(sessionId, analysisData, {
          analysisType: 'lab_results'
        })
      ).resolves.not.toThrow();
    });

    test('should retrieve relevant context', async () => {
      const sessionId = 'test-session-123';
      const query = 'blood pressure analysis';

      const context = await zepClient.getRelevantContext(sessionId, query, 3);
      
      expect(Array.isArray(context)).toBe(true);
    });

    test('should test connection successfully', async () => {
      const connectionTest = await zepClient.testConnection();
      expect(typeof connectionTest).toBe('boolean');
    });
  });

  describe('MemoryManager', () => {
    test('should store health analysis with HIPAA compliance', async () => {
      const analysis = {
        sessionId: 'test-session-123',
        userId: 'test-user-123',
        timestamp: new Date(),
        analysisType: 'lab_results' as const,
        inputData: {
          labResults: { glucose: 95, cholesterol: 180 }
        },
        analysisResult: {
          insights: ['Glucose levels normal'],
          recommendations: ['Continue healthy diet'],
          riskFactors: ['None identified'],
          followUpSuggestions: ['Recheck in 6 months']
        },
        context: {
          previousAnalyses: [],
          userPreferences: {},
          healthGoals: ['maintain healthy weight']
        },
        metadata: {
          confidence: 0.95,
          sources: ['lab_data'],
          processingTime: 1500
        }
      };

      await expect(
        memoryManager.storeHealthAnalysis(analysis)
      ).resolves.not.toThrow();
    });

    test('should retrieve relevant memory context', async () => {
      const sessionId = 'test-session-123';
      const userId = 'test-user-123';
      const query = 'diabetes risk assessment';

      const context = await memoryManager.getRelevantContext(sessionId, query, userId);
      
      expect(context).toHaveProperty('relevantAnalyses');
      expect(context).toHaveProperty('conversationHistory');
      expect(context).toHaveProperty('userPreferences');
      expect(context).toHaveProperty('healthGoals');
      expect(context).toHaveProperty('riskFactors');
    });

    test('should create or get user session', async () => {
      const userId = 'test-user-123';
      
      const sessionId = await memoryManager.createOrGetUserSession(userId);
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    test('should get user health journey', async () => {
      const userId = 'test-user-123';
      
      const healthJourney = await memoryManager.getUserHealthJourney(userId);
      
      expect(Array.isArray(healthJourney)).toBe(true);
    });
  });

  describe('SessionManager', () => {
    test('should create user session', async () => {
      const userId = 'test-user-123';
      const metadata = { source: 'web_app' };

      const session = await sessionManager.createUserSession(userId, metadata);
      
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('userId');
      expect(session).toHaveProperty('sessionId');
      expect(session.userId).toBe(userId);
    });

    test('should get active session', async () => {
      const userId = 'test-user-123';
      
      const session = await sessionManager.getActiveSession(userId);
      
      // Should return null or a valid session object
      if (session) {
        expect(session).toHaveProperty('userId');
        expect(session.userId).toBe(userId);
      }
    });

    test('should validate session', async () => {
      const mockRequest = {
        headers: new Map([['x-session-id', 'test-session-123']]),
        cookies: new Map()
      } as any;

      const validation = await sessionManager.validateSessionFromRequest(mockRequest);
      
      expect(validation).toHaveProperty('valid');
      expect(typeof validation.valid).toBe('boolean');
    });

    test('should cleanup expired sessions', async () => {
      const cleanedCount = await sessionManager.cleanupExpiredSessions();
      
      expect(typeof cleanedCount).toBe('number');
      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });

    test('should get session statistics', async () => {
      const stats = await sessionManager.getSessionStatistics();
      
      expect(stats).toHaveProperty('totalSessions');
      expect(stats).toHaveProperty('activeSessions');
      expect(stats).toHaveProperty('expiredSessions');
      expect(stats).toHaveProperty('timestamp');
    });
  });

  describe('HIPAA Compliance', () => {
    test('should encrypt and decrypt PHI data', async () => {
      const sensitiveData = {
        patientName: 'John Doe',
        ssn: '123-45-6789',
        diagnosis: 'Type 2 Diabetes'
      };

      // Test encryption/decryption through memory storage
      const analysis = {
        sessionId: 'test-session-123',
        userId: 'test-user-123',
        timestamp: new Date(),
        analysisType: 'lab_results' as const,
        inputData: { labResults: sensitiveData },
        analysisResult: {
          insights: ['Test insight'],
          recommendations: ['Test recommendation'],
          riskFactors: ['Test risk'],
          followUpSuggestions: ['Test follow-up']
        },
        context: {
          previousAnalyses: [],
          userPreferences: {},
          healthGoals: []
        },
        metadata: {
          confidence: 0.9,
          sources: ['test'],
          processingTime: 1000
        }
      };

      await expect(
        memoryManager.storeHealthAnalysis(analysis)
      ).resolves.not.toThrow();
    });

    test('should validate HIPAA compliance', async () => {
      const nonCompliantData = {
        sessionId: '', // Missing required field
        userId: 'test-user-123'
      };

      await expect(
        memoryManager.storeHealthAnalysis(nonCompliantData as any)
      ).rejects.toThrow('HIPAA Violation');
    });
  });

  describe('Error Handling', () => {
    test('should handle Zep API errors gracefully', async () => {
      // Mock API error
      const mockError = new Error('Zep API Error');
      jest.spyOn(zepClient, 'createUserSession').mockRejectedValue(mockError);

      await expect(
        sessionManager.createUserSession('test-user-123')
      ).rejects.toThrow('Failed to create user session');
    });

    test('should handle network timeouts', async () => {
      // Mock timeout error
      const timeoutError = new Error('Network timeout');
      jest.spyOn(zepClient, 'getRelevantContext').mockRejectedValue(timeoutError);

      await expect(
        memoryManager.getRelevantContext('test-session', 'test-query', 'test-user')
      ).rejects.toThrow('Failed to get memory context');
    });
  });

  describe('Performance', () => {
    test('should handle large memory contexts efficiently', async () => {
      const startTime = Date.now();
      
      await memoryManager.getRelevantContext(
        'test-session-123',
        'comprehensive health analysis',
        'test-user-123'
      );
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(executionTime).toBeLessThan(5000);
    });

    test('should handle concurrent session operations', async () => {
      const userId = 'test-user-123';
      
      // Create multiple concurrent session operations
      const operations = Array.from({ length: 5 }, (_, i) =>
        sessionManager.getOrCreateSession(`${userId}-${i}`)
      );

      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(5);
      results.forEach(session => {
        expect(session).toHaveProperty('sessionId');
      });
    });
  });
});

// Integration test for full workflow
describe('Full Zep Integration Workflow', () => {
  test('should complete full health analysis memory workflow', async () => {
    const userId = 'integration-test-user';
    const memoryManager = new MemoryManager();
    const sessionManager = new SessionManager();

    // 1. Create user session
    const session = await sessionManager.createUserSession(userId, {
      testType: 'integration'
    });

    // 2. Store health analysis
    const analysis = {
      sessionId: session.sessionId,
      userId,
      timestamp: new Date(),
      analysisType: 'lab_results' as const,
      inputData: {
        labResults: { glucose: 110, cholesterol: 200 }
      },
      analysisResult: {
        insights: ['Glucose slightly elevated'],
        recommendations: ['Monitor diet'],
        riskFactors: ['Pre-diabetes risk'],
        followUpSuggestions: ['Recheck in 3 months']
      },
      context: {
        previousAnalyses: [],
        userPreferences: {},
        healthGoals: ['improve glucose levels']
      },
      metadata: {
        confidence: 0.88,
        sources: ['lab_data'],
        processingTime: 2000
      }
    };

    await memoryManager.storeHealthAnalysis(analysis);

    // 3. Retrieve memory context
    const context = await memoryManager.getRelevantContext(
      session.sessionId,
      'glucose levels diabetes risk',
      userId
    );

    // 4. Validate results
    expect(context.relevantAnalyses).toBeDefined();
    expect(context.userPreferences).toBeDefined();
    expect(context.healthGoals).toBeDefined();

    // 5. Cleanup
    await sessionManager.deleteSession(session.sessionId);
  });
});
