// Mock for zep sessions
export interface ZepOperationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface SessionData {
  sessionId: string;
  userId: string;
  metadata?: any;
}

export const createSession = jest.fn();
export const getSession = jest.fn();
export const deleteSession = jest.fn();

// Default mock implementations
createSession.mockResolvedValue({
  success: true,
  data: { sessionId: 'mock-session', userId: 'mock-user' }
});

getSession.mockResolvedValue({
  success: true,
  data: { sessionId: 'mock-session', userId: 'mock-user' }
});

deleteSession.mockResolvedValue({
  success: true
});
