
// Jest setup for LabInsight AI memory tests
// Phase 4 Final Optimization - Enhanced Mock Lifecycle Management

// Add fetch polyfill for Node.js environment
require('whatwg-fetch')

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.ZEP_API_KEY = 'test-zep-api-key-for-testing-only'
process.env.ZEP_API_URL = 'https://api.getzep.com'
process.env.ZEP_ENCRYPTION_KEY = 'test-encryption-key-32-chars-long-for-security-testing'
process.env.OPENAI_API_KEY = 'test-openai-api-key-for-testing-only'
process.env.LLM_API_URL = 'https://test-llm-api.com'
process.env.LLM_API_KEY = 'test-llm-key'
process.env.LLM_MODEL = 'gpt-4'
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long'
process.env.JWT_SECRET = 'test-jwt-secret-for-testing'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock fetch for Zep client
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ status: 'healthy' }),
    text: () => Promise.resolve('OK'),
  })
)

// Enhanced mock lifecycle management
beforeEach(() => {
  // Reset mock data before each test
  const { resetMockData } = require('@getzep/zep-cloud');
  if (resetMockData) {
    resetMockData();
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});

// Mock OpenAI module globally
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                insights: ['Mock health insight'],
                recommendations: ['Mock recommendation'],
                riskFactors: ['Mock risk factor']
              })
            }
          }]
        })
      }
    }
  }))
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Enhanced Prisma Client Mock with error simulation
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-user-123',
        email: 'test@example.com'
      }),
      create: jest.fn().mockResolvedValue({
        id: 'test-user-123',
        email: 'test@example.com'
      }),
      update: jest.fn().mockResolvedValue({
        id: 'test-user-123',
        email: 'test@example.com'
      }),
    },
    healthAnalysis: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({
        id: 'test-analysis-123',
        userId: 'test-user-123'
      }),
    },
    session: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((data) => {
        // Simulate Prisma error for specific test scenarios
        if (data.data?.userId === 'failing-user') {
          return Promise.reject(new Error('Database connection failed'));
        }
        
        const session = {
          id: `session-${data.data.userId}-${Date.now()}`,
          sessionId: data.data.sessionId,
          userId: data.data.userId,
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: data.data.metadata || {}
        };
        return Promise.resolve(session);
      }),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}))

// Enhanced Zep Client Mock
jest.mock('@/lib/zep/client', () => ({
  zepClient: {
    memory: {
      add: jest.fn().mockResolvedValue(true),
      search: jest.fn().mockResolvedValue([{
        content: 'Health analysis showing improved biomarkers',
        score: 0.95,
        metadata: { type: 'health_analysis' }
      }]),
      get: jest.fn().mockResolvedValue([]),
      getSessions: jest.fn().mockResolvedValue([{
        sessionId: 'test-session-123',
        metadata: { userId: 'test_user_1753374838985' }
      }]),
    },
    user: {
      add: jest.fn().mockResolvedValue({ session_id: 'test-session-123' }),
      get: jest.fn().mockResolvedValue({ session_id: 'test-session-123' }),
    },
    isHealthy: jest.fn().mockResolvedValue(true)
  },
  testZepConnection: jest.fn().mockResolvedValue(true),
  withZepErrorHandling: jest.fn().mockImplementation(async (operation, fallback) => {
    try {
      return await operation();
    } catch (error) {
      return fallback || null;
    }
  }),
}))

// Mock Zep Search functions with enhanced error handling
jest.mock('@/lib/zep/search', () => ({
  semanticSearch: jest.fn().mockImplementation(async (sessionId, query, options = {}) => {
    // Simulate different behaviors based on test context
    if (query.includes('error')) {
      return { success: false, error: { code: 'SEARCH_ERROR', message: 'Search failed' } };
    }
    
    return {
      success: true,
      data: [{
        content: 'Health analysis showing improved biomarkers',
        score: 0.95,
        metadata: { type: 'health_analysis', userId: 'test-user' }
      }]
    };
  }),
  findRelevantContext: jest.fn().mockResolvedValue({
    success: true,
    data: [{
      content: 'Previous health analysis context',
      score: 0.9,
      metadata: { type: 'health_analysis' }
    }]
  }),
  searchHealthAnalyses: jest.fn().mockResolvedValue({
    success: true,
    data: []
  })
}))

// Mock Zep Preferences functions
jest.mock('@/lib/zep/preferences', () => ({
  storePreferences: jest.fn().mockResolvedValue({ success: true, data: true }),
  getPreferences: jest.fn().mockImplementation(async (userId, sessionId) => {
    // Return null for specific test scenarios
    if (sessionId.includes('no-preferences') || sessionId === 'test-session-no-prefs') {
      return { success: true, data: null };
    }
    
    return {
      success: true,
      data: {
        healthGoals: ['energy_improvement'],
        focusAreas: ['thyroid'],
        communicationStyle: 'concise'
      }
    };
  }),
  implicitLearn: jest.fn().mockResolvedValue({ success: true, data: true }),
  getPersonalizedRecommendations: jest.fn().mockResolvedValue({
    success: true,
    data: [
      'Continue focusing on thyroid based on your preferences',
      'Continue focusing on metabolic based on your preferences',
      'Set up your health goals to get personalized recommendations'
    ]
  })
}))

// Mock Zep Context functions
jest.mock('@/lib/zep/context', () => ({
  getIntelligentContext: jest.fn().mockResolvedValue({
    success: true,
    data: {
      userId: 'test-user-123',
      userPreferences: {
        focusAreas: ['cardiovascular'],
        healthGoals: ['Improve heart health']
      },
      recentAnalyses: [{
        content: 'Recent health analysis',
        metadata: { type: 'health_analysis' }
      }],
      conversationHistory: [],
      relevantInsights: [],
      healthGoals: ['Improve heart health']
    }
  }),
  updateConversationContext: jest.fn().mockResolvedValue({ success: true, data: true })
}))

// Mock Zep Memory functions
jest.mock('@/lib/zep/memory', () => ({
  storeHealthAnalysis: jest.fn().mockResolvedValue({ success: true, data: true }),
  getHealthAnalysis: jest.fn().mockResolvedValue({
    success: true,
    data: [{
      content: 'Health analysis showing improved biomarkers',
      score: 0.95,
      metadata: { type: 'health_analysis', userId: 'test-user' }
    }]
  }),
  getHealthContext: jest.fn().mockResolvedValue({
    success: true,
    data: {
      userId: 'test-user-123',
      sessionId: 'test-session-123',
      healthAnalyses: [],
      preferences: {},
      conversationHistory: []
    }
  })
}))

// Mock Zep Sessions functions
jest.mock('@/lib/zep/sessions', () => ({
  createUserSession: jest.fn().mockResolvedValue({ success: true, data: 'test-session-123' }),
  getUserSession: jest.fn().mockResolvedValue(null),
  getOrCreateUserSession: jest.fn().mockResolvedValue({ success: true, data: 'test-session-123' })
}))

// Mock Zep Summarize functions
jest.mock('@/lib/zep/summarize', () => ({
  summarizeMemory: jest.fn().mockResolvedValue({
    success: true,
    data: 'Summarized health context'
  })
}))

// Global test timeout
jest.setTimeout(15000)
