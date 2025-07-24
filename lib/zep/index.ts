

/**
 * Zep Memory Integration - Main Export
 * Phase 2A Foundation - Centralized Exports
 */

// Client and core functionality
export { zepClient, testZepConnection, withZepErrorHandling } from './client';

// Session management - FIXED EXPORTS
export {
  generateSessionId,
  createUserSession,
  getUserSession,
  getOrCreateUserSession,
  updateSessionMetadata,
  deleteUserSession,
  listUserSessions,
  cleanupExpiredSessions
} from './sessions';

// Memory operations - FIXED EXPORTS
export {
  storeHealthAnalysis,
  getHealthAnalysis,
  getHealthContext,
  storeUserPreferences,
  getUserAnalysisHistory,
  storeConversationContext,
  getComprehensiveHealthInsights,
  getPersonalizedGreeting,
  cleanupMemory
} from './memory';

// Utilities
export {
  sanitizePHIForMemory,
  validateHIPAACompliance,
  formatMemoryContent,
  parseMemoryContent,
  createErrorResult,
  createSuccessResult,
  zepRateLimiter,
  withRetry
} from './utils';

// Types
export type {
  HealthMemory,
  AnalysisSummary,
  UserPreferences,
  ConversationContext,
  ProgressMilestone,
  ZepSessionMetadata,
  MemorySearchQuery,
  MemorySearchResult,
  ZepError,
  ZepOperationResult
} from './types';

