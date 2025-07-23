// Jest setup for LabInsight AI memory tests

// Add fetch polyfill for Node.js environment
require('whatwg-fetch')

// Mock environment variables
process.env.ZEP_API_KEY = 'test-zep-key'
process.env.LLM_API_URL = 'https://test-llm-api.com'
process.env.LLM_API_KEY = 'test-llm-key'
process.env.LLM_MODEL = 'gpt-4'

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

// Global test timeout
jest.setTimeout(10000)
