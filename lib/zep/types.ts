
/**
 * Zep Memory Integration Types
 * Phase 2A Foundation - TypeScript Interfaces for Health Memory
 */

// Core health analysis memory structure
export interface HealthMemory {
  userId: string;
  sessionId: string;
  analysisHistory: AnalysisSummary[];
  userPreferences: UserPreferences;
  conversationContext: ConversationContext;
  progressTracking: ProgressMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

// Health analysis summary for memory storage
export interface AnalysisSummary {
  id: string;
  timestamp: Date;
  labResults: {
    testType: string;
    keyFindings: string[];
    recommendations: string[];
    riskFactors: string[];
  };
  bioenergetic: {
    metabolicHealth: string;
    energyLevel: string;
    cellularFunction: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary?: string;
  recommendations: string[];
}

// Enhanced context structure for Phase 2B
export interface HealthContext {
  userId: string;
  sessionId: string;
  relevantHistory: MemorySearchResult[];
  userPreferences: Record<string, any>;
  healthGoals: string[];
  conversationSummary: string;
  lastAnalysis: AnalysisSummary | null;
  trends: HealthTrend[];
  timestamp: Date;
}

// Health trend analysis
export interface HealthTrend {
  biomarker: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  percentChange: number;
  dataPoints: number;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  significance: 'low' | 'medium' | 'high';
}

// Progress milestone tracking
export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: Date;
  category: 'biomarker' | 'lifestyle' | 'goal' | 'general';
  impact: 'low' | 'medium' | 'high';
}

// Health goals structure
export interface HealthGoal {
  id: string;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
}

// Enhanced bioenergetic analysis structure
export interface BioenergeticAnalysis {
  metabolicHealth: string;
  energyLevel: string;
  cellularFunction: string;
  thyroidFunction: string;
  stressMarkers: string;
  nutritionalStatus: string;
}

// Ray Peat insights structure
export interface RayPeatInsights {
  principles: string[];
  recommendations: string[];
  warnings: string[];
}

// User preferences for personalized experience
export interface UserPreferences {
  healthGoals: string[];
  focusAreas: string[];
  communicationStyle: 'detailed' | 'concise' | 'technical';
  reminderFrequency: 'daily' | 'weekly' | 'monthly' | 'none';
  privacyLevel: 'minimal' | 'standard' | 'comprehensive';
  rayPeatFocus: boolean;
  bioenergetic: boolean;
}

// Conversation context for continuity
export interface ConversationContext {
  lastInteraction: Date;
  currentTopic: string;
  discussionHistory: string[];
  pendingQuestions: string[];
  userMood: 'concerned' | 'curious' | 'optimistic' | 'neutral';
  sessionGoals: string[];
}

// Progress tracking for health journey
export interface ProgressMilestone {
  id: string;
  date: Date;
  type: 'lab_improvement' | 'goal_achieved' | 'habit_formed' | 'knowledge_gained';
  description: string;
  metrics: Record<string, number>;
  notes: string;
}

// Zep session metadata
export interface ZepSessionMetadata {
  userId: string;
  userEmail?: string;
  sessionType: 'health_analysis' | 'consultation' | 'follow_up';
  hipaaCompliant: boolean;
  encryptionLevel: 'standard' | 'enhanced';
  retentionDays: number;
}

// Memory search and retrieval types
export interface MemorySearchQuery {
  userId: string;
  query: string;
  limit?: number;
  timeRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
}

export interface MemorySearchResult {
  content: string;
  relevanceScore: number;
  timestamp: Date;
  category: string;
  metadata: Record<string, any>;
}

// Error handling types
export interface ZepError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ZepOperationResult<T> {
  success: boolean;
  data?: T;
  error?: ZepError;
}
