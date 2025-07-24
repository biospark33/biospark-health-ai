// Jest setup for LabInsight AI memory tests

// Add fetch polyfill for Node.js environment
require('whatwg-fetch')

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.ZEP_API_KEY = 'test-zep-key'
process.env.ZEP_API_URL = 'https://api.getzep.com'
process.env.ZEP_ENCRYPTION_KEY = 'test-encryption-key-32-chars-long-for-security-testing'
process.env.OPENAI_API_KEY = 'sk-test-key-for-testing-purposes-only'
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

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    healthAnalysis: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}))

// Mock Zep Client
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
    }
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

// Mock Zep Search functions
jest.mock('@/lib/zep/search', () => ({
  semanticSearch: jest.fn().mockResolvedValue({
    success: true,
    data: [{
      content: 'Health analysis showing improved biomarkers',
      score: 0.95,
      metadata: { type: 'health_analysis', userId: 'test-user' }
    }]
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

// Mock Zep Summarize functions
jest.mock('@/lib/zep/summarize', () => ({
  summarizeMemory: jest.fn().mockResolvedValue({
    success: true,
    data: 'Summarized health context'
  })
}))

// Global test timeout
jest.setTimeout(10000)
