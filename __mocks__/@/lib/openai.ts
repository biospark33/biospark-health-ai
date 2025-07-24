
// Mock for OpenAI health AI
export const healthAI = {
  generateHealthInsights: jest.fn().mockResolvedValue({
    insights: ['Mock health insight'],
    recommendations: ['Mock recommendation'],
    riskFactors: ['Mock risk factor']
  }),
  generateRecommendations: jest.fn().mockResolvedValue({
    recommendations: ['Mock personalized recommendation'],
    actionItems: ['Mock action item']
  })
};
