
// Memory-Enhanced Health AI Integration
// Combines OpenAI health analysis with Zep memory for personalized insights

import { healthAI } from './openai';
import { LabInsightZepClient } from './zep-client';
import { prisma } from './prisma';

export interface MemoryEnhancedHealthAnalysis {
  standardInsights: any;
  personalizedInsights: any;
  memoryContext: any;
  recommendations: any;
  engagementPredictions: any;
}

export interface UserHealthMemory {
  userId: string;
  previousAssessments: any[];
  engagementPatterns: any;
  preferences: any;
  healthGoals: any;
}

export class MemoryEnhancedHealthAI {
  private zepClient: LabInsightZepClient;
  
  constructor(zepClient: LabInsightZepClient) {
    this.zepClient = zepClient;
  }

  async generateMemoryAwareInsights(
    assessmentData: any, 
    userId: string
  ): Promise<MemoryEnhancedHealthAnalysis> {
    try {
      // 1. Generate standard health insights
      const standardInsights = await healthAI.generateHealthInsights(assessmentData);

      // 2. Retrieve user's health memory context
      const memoryContext = await this.getUserHealthMemory(userId);

      // 3. Generate personalized insights based on memory
      const personalizedInsights = await this.generatePersonalizedInsights(
        assessmentData, 
        standardInsights, 
        memoryContext
      );

      // 4. Create memory-aware recommendations
      const recommendations = await this.generateMemoryAwareRecommendations(
        assessmentData,
        memoryContext,
        personalizedInsights
      );

      // 5. Predict user engagement patterns
      const engagementPredictions = await this.predictEngagementPatterns(
        userId,
        memoryContext
      );

      // 6. Store this analysis in memory for future reference
      await this.storeAnalysisInMemory(userId, {
        assessmentData,
        standardInsights,
        personalizedInsights,
        recommendations
      });

      return {
        standardInsights,
        personalizedInsights,
        memoryContext,
        recommendations,
        engagementPredictions
      };
    } catch (error) {
      console.error('Memory-enhanced analysis failed:', error);
      // Fallback to standard analysis
      const standardInsights = await healthAI.generateHealthInsights(assessmentData);
      return {
        standardInsights,
        personalizedInsights: null,
        memoryContext: null,
        recommendations: null,
        engagementPredictions: null
      };
    }
  }

  private async getUserHealthMemory(userId: string): Promise<UserHealthMemory> {
    try {
      // Retrieve from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          healthAssessments: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          zepSessions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Retrieve from Zep memory
      const sessionId = `health-memory-${userId}`;
      const memories = await this.zepClient.searchMemory(sessionId, 'health analysis patterns', {
        limit: 20,
        searchType: 'similarity'
      });

      // Process engagement patterns
      const engagementPatterns = this.analyzeEngagementPatterns(memories);
      const preferences = this.extractUserPreferences(memories);
      const healthGoals = this.extractHealthGoals(memories);

      return {
        userId,
        previousAssessments: user.healthAssessments,
        engagementPatterns,
        preferences,
        healthGoals
      };
    } catch (error) {
      console.error('Failed to retrieve user health memory:', error);
      return {
        userId,
        previousAssessments: [],
        engagementPatterns: {},
        preferences: {},
        healthGoals: {}
      };
    }
  }

  private async generatePersonalizedInsights(
    assessmentData: any,
    standardInsights: any,
    memoryContext: UserHealthMemory
  ): Promise<any> {
    try {
      const personalizationPrompt = `
        Based on the user's health history and engagement patterns, personalize these health insights:

        Current Assessment: ${JSON.stringify(assessmentData, null, 2)}
        Standard Insights: ${JSON.stringify(standardInsights, null, 2)}
        User History: ${JSON.stringify(memoryContext.previousAssessments.slice(0, 3), null, 2)}
        User Preferences: ${JSON.stringify(memoryContext.preferences, null, 2)}
        Health Goals: ${JSON.stringify(memoryContext.healthGoals, null, 2)}

        Please provide:
        1. Personalized explanations that reference their health journey
        2. Comparisons with their previous assessments
        3. Progress indicators based on their goals
        4. Customized recommendations based on their preferences
        5. Motivational insights based on their engagement patterns

        Format as structured JSON with clear personalization markers.
      `;

      const completion = await healthAI.generateHealthInsights({
        prompt: personalizationPrompt,
        context: 'personalization'
      });

      return completion;
    } catch (error) {
      console.error('Failed to generate personalized insights:', error);
      return null;
    }
  }

  private async generateMemoryAwareRecommendations(
    assessmentData: any,
    memoryContext: UserHealthMemory,
    personalizedInsights: any
  ): Promise<any> {
    try {
      const recommendationPrompt = `
        Generate memory-aware recommendations based on:

        Current Health Data: ${JSON.stringify(assessmentData, null, 2)}
        User's Health Journey: ${JSON.stringify(memoryContext.previousAssessments.slice(0, 2), null, 2)}
        Personalized Insights: ${JSON.stringify(personalizedInsights, null, 2)}
        User Preferences: ${JSON.stringify(memoryContext.preferences, null, 2)}

        Consider:
        1. What has worked for them before
        2. What they've struggled with
        3. Their preferred communication style
        4. Their engagement patterns
        5. Their stated health goals

        Provide actionable, personalized recommendations with memory context.
      `;

      const recommendations = await healthAI.generateRecommendations(
        memoryContext,
        { prompt: recommendationPrompt }
      );

      return recommendations;
    } catch (error) {
      console.error('Failed to generate memory-aware recommendations:', error);
      return null;
    }
  }

  private async predictEngagementPatterns(
    userId: string,
    memoryContext: UserHealthMemory
  ): Promise<any> {
    try {
      const patterns = memoryContext.engagementPatterns;
      
      return {
        preferredLayers: patterns.preferredLayers || [1],
        averageTimeSpent: patterns.averageTimeSpent || 120,
        likelyToComplete: patterns.completionRate || 0.7,
        bestEngagementTime: patterns.bestTime || 'morning',
        recommendedApproach: this.getRecommendedApproach(patterns)
      };
    } catch (error) {
      console.error('Failed to predict engagement patterns:', error);
      return null;
    }
  }

  private getRecommendedApproach(patterns: any): string {
    if (patterns.averageTimeSpent > 300) {
      return 'detailed_explorer';
    } else if (patterns.preferredLayers?.includes(1)) {
      return 'quick_overview';
    } else if (patterns.completionRate > 0.8) {
      return 'systematic_learner';
    }
    return 'adaptive';
  }

  private async storeAnalysisInMemory(userId: string, analysisData: any): Promise<void> {
    try {
      const sessionId = `health-analysis-${userId}-${Date.now()}`;
      
      await this.zepClient.addMemory(sessionId, {
        content: `Health analysis completed with personalized insights`,
        metadata: {
          type: 'health_analysis',
          userId,
          timestamp: new Date().toISOString(),
          assessmentType: analysisData.assessmentData.type,
          insightsGenerated: true,
          personalized: true,
          hipaaCompliant: true,
          confidentialityLevel: 'high'
        }
      });

      // Store key patterns for future reference
      await this.zepClient.addMemory(sessionId, {
        content: `User engagement patterns and preferences updated`,
        metadata: {
          type: 'engagement_pattern',
          userId,
          patterns: analysisData.engagementPredictions,
          hipaaCompliant: true,
          confidentialityLevel: 'medium'
        }
      });
    } catch (error) {
      console.error('Failed to store analysis in memory:', error);
    }
  }

  private analyzeEngagementPatterns(memories: any[]): any {
    const patterns = {
      preferredLayers: [],
      averageTimeSpent: 0,
      completionRate: 0,
      bestTime: 'morning',
      commonInterests: []
    };

    if (!memories || memories.length === 0) {
      return patterns;
    }

    // Analyze layer preferences
    const layerCounts = memories
      .filter(m => m.metadata?.layer)
      .reduce((acc, m) => {
        acc[m.metadata.layer] = (acc[m.metadata.layer] || 0) + 1;
        return acc;
      }, {});

    patterns.preferredLayers = Object.entries(layerCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([layer]) => parseInt(layer));

    // Calculate average time spent
    const timeSpentValues = memories
      .filter(m => m.metadata?.timeSpent)
      .map(m => m.metadata.timeSpent);
    
    if (timeSpentValues.length > 0) {
      patterns.averageTimeSpent = timeSpentValues.reduce((a, b) => a + b, 0) / timeSpentValues.length;
    }

    // Calculate completion rate
    const completedAnalyses = memories.filter(m => m.metadata?.type === 'health_analysis').length;
    const startedAnalyses = memories.filter(m => m.metadata?.type === 'engagement').length;
    
    if (startedAnalyses > 0) {
      patterns.completionRate = completedAnalyses / startedAnalyses;
    }

    return patterns;
  }

  private extractUserPreferences(memories: any[]): any {
    const preferences = {
      communicationStyle: 'balanced',
      detailLevel: 'medium',
      focusAreas: [],
      avoidanceTopics: []
    };

    // Analyze communication preferences from memory
    const detailEngagement = memories.filter(m => 
      m.metadata?.layer === 3 || m.content?.includes('technical')
    ).length;

    const quickEngagement = memories.filter(m => 
      m.metadata?.layer === 1 || m.content?.includes('summary')
    ).length;

    if (detailEngagement > quickEngagement * 2) {
      preferences.communicationStyle = 'detailed';
      preferences.detailLevel = 'high';
    } else if (quickEngagement > detailEngagement * 2) {
      preferences.communicationStyle = 'concise';
      preferences.detailLevel = 'low';
    }

    return preferences;
  }

  private extractHealthGoals(memories: any[]): any {
    const goals = {
      primary: [],
      secondary: [],
      timeline: 'medium_term',
      focus: 'general_health'
    };

    // Extract goals from memory content and metadata
    memories.forEach(memory => {
      if (memory.content?.includes('goal') || memory.metadata?.type === 'goal_setting') {
        // Extract goal information
        if (memory.content?.includes('weight')) goals.primary.push('weight_management');
        if (memory.content?.includes('energy')) goals.primary.push('energy_optimization');
        if (memory.content?.includes('sleep')) goals.primary.push('sleep_improvement');
        if (memory.content?.includes('stress')) goals.primary.push('stress_reduction');
      }
    });

    return goals;
  }
}

// Export singleton instance
export const memoryEnhancedHealthAI = new MemoryEnhancedHealthAI(
  new LabInsightZepClient({
    apiKey: process.env.ZEP_API_KEY || '',
    userId: 'system'
  })
);
