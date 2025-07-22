
/**
 * Zep Memory Integration Utilities
 * Phase 2A Foundation - Helper Functions and Utilities
 */

import { ZepError, ZepOperationResult } from './types';

// Sanitize PHI data for memory storage
export function sanitizePHIForMemory(data: any): any {
  // Remove or encrypt sensitive personal information
  const sanitized = { ...data };
  
  // Remove direct identifiers
  delete sanitized.ssn;
  delete sanitized.phoneNumber;
  delete sanitized.address;
  delete sanitized.fullName;
  
  // Hash email if present
  if (sanitized.email) {
    sanitized.emailHash = hashString(sanitized.email);
    delete sanitized.email;
  }
  
  // Encrypt lab values if needed
  if (sanitized.labValues) {
    sanitized.labValues = encryptLabValues(sanitized.labValues);
  }
  
  return sanitized;
}

// Simple hash function for non-sensitive data
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

// Encrypt lab values for storage
function encryptLabValues(labValues: Record<string, any>): Record<string, any> {
  // TODO: Implement proper encryption using PHI_ENCRYPTION_KEY
  // For now, return as-is (will be implemented in Phase 2B)
  return labValues;
}

// Validate memory content for HIPAA compliance
export function validateHIPAACompliance(content: any): boolean {
  const contentStr = JSON.stringify(content).toLowerCase();
  
  // Check for common PHI patterns
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
    /\b\d{3}-\d{3}-\d{4}\b/, // Phone pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
  ];
  
  for (const pattern of phiPatterns) {
    if (pattern.test(contentStr)) {
      console.warn('Potential PHI detected in memory content');
      return false;
    }
  }
  
  return true;
}

// Format memory content for storage
export function formatMemoryContent(
  type: string,
  data: any,
  userId: string
): any {
  return {
    type,
    data: sanitizePHIForMemory(data),
    userId,
    timestamp: new Date().toISOString(),
    version: '1.0',
    hipaaCompliant: validateHIPAACompliance(data)
  };
}

// Parse memory content from storage
export function parseMemoryContent(content: string): any {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse memory content:', error);
    return null;
  }
}

// Create error response
export function createErrorResult<T>(
  code: string,
  message: string,
  details?: any
): ZepOperationResult<T> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date()
    }
  };
}

// Create success response
export function createSuccessResult<T>(data: T): ZepOperationResult<T> {
  return {
    success: true,
    data
  };
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Global rate limiter instance
export const zepRateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '1') * 60000
);

// Retry logic for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError!;
}

// TODO: Implement additional utilities for Phase 2B
// - Advanced encryption/decryption functions
// - Memory compression for large datasets
// - Audit logging for HIPAA compliance
// - Performance monitoring and metrics
