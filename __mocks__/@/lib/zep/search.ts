
// Mock for zep search operations
export const findRelevantContext = jest.fn();
export const semanticSearch = jest.fn();
export const searchHealthAnalyses = jest.fn();
export const advancedSearch = jest.fn();
export const setZepClient = jest.fn();

// Default mock implementations
findRelevantContext.mockResolvedValue({
  success: true,
  results: []
});

semanticSearch.mockResolvedValue({
  success: true,
  results: []
});

searchHealthAnalyses.mockResolvedValue({
  success: true,
  results: []
});

advancedSearch.mockResolvedValue({
  success: true,
  results: []
});
