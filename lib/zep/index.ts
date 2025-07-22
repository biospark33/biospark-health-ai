
/**
 * Zep Memory Integration - Main Export
 * Phase 2A Foundation - Centralized Exports
 */

// Client and core functionality
export { zepClient, testZepConnection, withZepErrorHandling } from './client';

// Session management
export {
  generateSessionId,
  createUserSession,
  getUserSession,
  updateSessionMetadata,
  deleteUserSession,
  listUserSessions,
  cleanupExpiredSessions
} from './sessions';

// Memory operations
export {
  storeHealthAnalysis,
  storeUserPreferences,
  getHealthContext,
  getUserAnalysisHistory,
  storeConversationContext,
  getComprehensiveHealthInsights,
  getPersonalizedGreeting,
  getOrCreateUserSession
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
