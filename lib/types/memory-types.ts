
/**
 * 🧠 BioSpark Health AI - Memory Data Types
 * 
 * Comprehensive type definitions for intelligent memory enhancement,
 * context understanding, and AI-powered memory operations.
 * 
 * Enterprise-grade TypeScript definitions with HIPAA compliance.
 */

// Core Memory Types
export interface MemoryData {
  conversations: ConversationMemory[];
  healthHistory: HealthMemoryItem[];
  preferences: UserPreferences;
  patterns: MemoryPattern[];
  query?: string;
}

export interface ConversationMemory {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  context: string;
  summary?: string;
  topics: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface HealthMemoryItem {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'assessment' | 'symptom' | 'treatment' | 'lab_result' | 'lifestyle' | 'goal';
  data: any;
  context: string;
  tags: string[];
  importance: 'high' | 'medium' | 'low';
}

export interface UserPreferences {
  healthGoals: string[];
  focusAreas: string[];
  communicationStyle: 'detailed' | 'concise' | 'visual';
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  privacyLevel: 'high' | 'medium' | 'low';
  treatmentPreferences: string[];
  avoidances: string[];
}

export interface MemoryPattern {
  id: string;
  type: 'behavioral' | 'health' | 'response' | 'temporal';
  pattern: string;
  frequency: number;
  confidence: number;
  timeframe: string;
  examples: string[];
}

// Enhanced Memory Context Types
export interface EnhancedMemoryContext {
  userId: string;
  timestamp: Date;
  contextualInsights: ContextualInsight[];
  predictiveAnalysis: PredictiveAnalysis;
  personalizedContext: PersonalizedContext;
  intelligentSummary: IntelligentSummary;
  processingTime: number;
}

export interface ContextualInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'trend' | 'anomaly' | 'prediction';
  insight: string;
  confidence: number;
  relevance: number;
  timeframe: string;
  supporting_data: string[];
}

export interface PredictiveAnalysis {
  predictions: Array<{
    outcome: string;
    probability: number;
    timeframe: string;
    factors: string[];
    confidence: number;
  }>;
  risk_factors: string[];
  protective_factors: string[];
  recommendations: string[];
}

export interface PersonalizedContext {
  user_profile: {
    health_patterns: string[];
    preferences: Record<string, any>;
    goals: string[];
    concerns: string[];
  };
  contextual_relevance: {
    current_focus: string[];
    priority_areas: string[];
    emerging_patterns: string[];
  };
  adaptive_learning: {
    user_responses: string[];
    effectiveness_scores: Record<string, number>;
    optimization_suggestions: string[];
  };
}

export interface IntelligentSummary {
  key_insights: string[];
  progress_summary: string;
  current_status: string;
  future_directions: string[];
  actionable_intelligence: string[];
}

// Memory Operations Types
export interface MemoryQuery {
  userId: string;
  query: string;
  filters?: {
    timeRange?: {
      start: Date;
      end: Date;
    };
    types?: string[];
    importance?: string[];
    tags?: string[];
  };
  limit?: number;
  includeContext?: boolean;
}

export interface MemorySearchResult {
  items: MemoryItem[];
  totalCount: number;
  hasMore: boolean;
  relevanceScores: Record<string, number>;
  contextualSummary?: string;
}

export interface MemoryItem {
  id: string;
  userId: string;
  sessionId: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  type: string;
  importance: 'high' | 'medium' | 'low';
  tags: string[];
  context?: string;
}

// Memory Analytics Types
export interface MemoryAnalytics {
  userId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  statistics: {
    totalMemories: number;
    memoryTypes: Record<string, number>;
    averageImportance: number;
    topTags: Array<{ tag: string; count: number }>;
    activityTrends: Array<{ date: Date; count: number }>;
  };
  insights: {
    patterns: string[];
    trends: string[];
    recommendations: string[];
  };
}

// Memory Context Types
export interface MemoryContext {
  userId: string;
  sessionId: string;
  relevantHistory: MemoryItem[];
  userPreferences: UserPreferences;
  healthGoals: string[];
  conversationSummary?: string;
  contextualFactors: string[];
}

export interface MemoryContextRequest {
  userId: string;
  sessionId?: string;
  query?: string;
  maxItems?: number;
  includePreferences?: boolean;
  includeGoals?: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

// Memory Storage Types
export interface MemoryStorageRequest {
  userId: string;
  sessionId: string;
  content: string;
  type: string;
  metadata?: Record<string, any>;
  importance?: 'high' | 'medium' | 'low';
  tags?: string[];
  context?: string;
}

export interface MemoryUpdateRequest {
  memoryId: string;
  updates: {
    content?: string;
    metadata?: Record<string, any>;
    importance?: 'high' | 'medium' | 'low';
    tags?: string[];
    context?: string;
  };
}

// Memory Intelligence Types
export interface MemoryIntelligence {
  userId: string;
  timestamp: Date;
  intelligenceLevel: number; // 0-1 scale
  capabilities: {
    patternRecognition: number;
    predictiveAnalysis: number;
    contextualUnderstanding: number;
    personalization: number;
  };
  learningProgress: {
    dataPoints: number;
    patterns_identified: number;
    predictions_made: number;
    accuracy_score: number;
  };
  recommendations: string[];
}

// Memory Performance Types
export interface MemoryPerformance {
  userId: string;
  timestamp: Date;
  metrics: {
    retrievalTime: number; // ms
    relevanceScore: number; // 0-1
    contextAccuracy: number; // 0-1
    userSatisfaction: number; // 0-1
  };
  optimizations: {
    cacheHitRate: number;
    indexEfficiency: number;
    queryOptimization: number;
  };
  recommendations: string[];
}

// Memory Security Types
export interface MemorySecurityContext {
  userId: string;
  accessLevel: 'full' | 'limited' | 'restricted';
  encryptionStatus: 'encrypted' | 'partial' | 'none';
  auditTrail: Array<{
    action: string;
    timestamp: Date;
    userId: string;
    details: string;
  }>;
  complianceStatus: {
    hipaa: boolean;
    gdpr: boolean;
    lastAudit: Date;
  };
}

// Export all memory types
export type {
  // All types already exported above
};
