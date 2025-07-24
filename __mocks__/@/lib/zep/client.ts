
// Mock for zep client
export const mockZepClient = {
  memory: {
    search: jest.fn().mockResolvedValue([
      {
        message: {
          uuid: 'msg-1',
          content: 'Mock health analysis',
          metadata: { type: 'health_analysis', userId: 'test-user' },
          created_at: '2024-01-01T00:00:00Z'
        },
        score: 0.95
      }
    ]),
    add: jest.fn().mockResolvedValue({ success: true }),
    getSummary: jest.fn().mockResolvedValue({ content: 'Mock summary' })
  },
  searchMemory: jest.fn().mockResolvedValue([
    {
      uuid: 'memory-1',
      message: {
        uuid: 'msg-1',
        content: 'Mock memory content',
        role: 'assistant',
        metadata: { type: 'health_analysis' }
      },
      metadata: { type: 'health_analysis' },
      score: 0.9,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ]),
  addMemory: jest.fn().mockResolvedValue(true),
  getSession: jest.fn().mockResolvedValue({
    sessionId: 'mock-session',
    userId: 'mock-user'
  }),
  deleteSession: jest.fn().mockResolvedValue(true)
};

// Ensure zepClient is always truthy in tests
export const zepClient = mockZepClient;

export const withZepErrorHandling = jest.fn(async (fn, fallback) => {
  try {
    return await fn();
  } catch (error) {
    return fallback || { success: false, error };
  }
});
