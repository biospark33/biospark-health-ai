
// Centralized Mock Factory for @getzep/zep-cloud
// Phase 1 Foundation Fix - Unified Mock Architecture

export interface ISession {
  sessionId: string;
  userId: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMemory {
  uuid: string;
  message?: {
    uuid: string;
    content: string;
    role: string;
    metadata?: any;
  };
  metadata?: any;
  score?: number;
  createdAt?: string;
}

export interface IMessage {
  role: string;
  content: string;
  metadata?: any;
}

// Mock data store for consistent test behavior
const mockSessions = new Map<string, ISession>();
const mockMemories = new Map<string, IMemory[]>();

// Reset function for test isolation
export const resetMockData = () => {
  mockSessions.clear();
  mockMemories.clear();
};

// Enhanced mock client with proper lifecycle management
const createMockMemoryClient = () => ({
  addSession: jest.fn().mockImplementation(async ({ sessionId, userId, metadata = {} }) => {
    const session: ISession = {
      sessionId,
      userId,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockSessions.set(sessionId, session);
    return session;
  }),

  addMemory: jest.fn().mockImplementation(async (sessionId: string, { messages, metadata = {} }) => {
    if (!mockMemories.has(sessionId)) {
      mockMemories.set(sessionId, []);
    }
    
    const memories = mockMemories.get(sessionId)!;
    messages.forEach((message: IMessage, index: number) => {
      const memory: IMemory = {
        uuid: `memory-${sessionId}-${Date.now()}-${index}`,
        message: {
          uuid: `message-${sessionId}-${Date.now()}-${index}`,
          content: message.content,
          role: message.role,
          metadata: message.metadata
        },
        metadata,
        score: 0.95,
        createdAt: new Date().toISOString()
      };
      memories.push(memory);
    });
    
    return true;
  }),

  searchMemory: jest.fn().mockImplementation(async (sessionId: string, query: string, options = {}) => {
    const memories = mockMemories.get(sessionId) || [];
    return memories.filter(memory => 
      memory.message?.content?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, options.limit || 10);
  }),

  getMemory: jest.fn().mockImplementation(async (sessionId: string, limit = 50) => {
    const memories = mockMemories.get(sessionId) || [];
    return memories.slice(0, limit);
  }),

  getSession: jest.fn().mockImplementation(async (sessionId: string) => {
    return mockSessions.get(sessionId) || null;
  }),

  deleteSession: jest.fn().mockImplementation(async (sessionId: string) => {
    const deleted = mockSessions.delete(sessionId);
    mockMemories.delete(sessionId);
    return deleted;
  })
});

// Mock ZepClient class with proper initialization
export class ZepClient {
  public memory: ReturnType<typeof createMockMemoryClient>;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.memory = createMockMemoryClient();
  }

  static async init(baseUrl: string, apiKey: string): Promise<ZepClient> {
    return new ZepClient(apiKey);
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    return true;
  }
}

// Export reset function for test setup
export { resetMockData };

// Default export for compatibility
export default ZepClient;
