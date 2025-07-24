
// Mock for zep summarize operations
export const summarizeMemory = jest.fn();
export const summarizeHealthTrends = jest.fn();
export const createPersonalizedInsights = jest.fn();

// Default mock implementations
summarizeMemory.mockResolvedValue({
  success: true,
  data: 'Mock summary'
});

summarizeHealthTrends.mockResolvedValue({
  success: true,
  data: 'Mock health trends'
});

createPersonalizedInsights.mockResolvedValue({
  success: true,
  data: 'Mock personalized insights'
});
