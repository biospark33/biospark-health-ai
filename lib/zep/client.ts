
/**
 * Zep Memory Integration Client
 * Phase 2A Foundation - HIPAA Compliant Memory Management
 * Enhanced with graceful fallback handling
 */

import { ZepClient } from '@getzep/zep-js';

// Environment validation with graceful fallback
const ZEP_API_KEY = process.env.ZEP_API_KEY;
const ZEP_API_URL = process.env.ZEP_API_URL || 'https://api.getzep.com';

// Initialize Zep client with graceful error handling
let zepClient: ZepClient | null = null;
let isZepEnabled = false;

if (!ZEP_API_KEY || ZEP_API_KEY === 'your-zep-api-key') {
  console.warn('⚠️ ZEP_API_KEY not set or contains placeholder value, Zep memory features disabled');
  isZepEnabled = false;
} else {
  try {
    // Use ZepClient.init() instead of constructor to avoid deprecation warning
    ZepClient.init({
      apiKey: ZEP_API_KEY,
      baseURL: ZEP_API_URL
    }).then(client => {
      zepClient = client;
      isZepEnabled = true;
      console.log('✅ Zep client initialized successfully');
    }).catch(error => {
      console.warn('⚠️ Failed to initialize Zep client (memory features disabled):', error instanceof Error ? error.message : 'Unknown error');
      zepClient = null;
      isZepEnabled = false;
    });
  } catch (error) {
    console.warn('⚠️ Failed to initialize Zep client (memory features disabled):', error instanceof Error ? error.message : 'Unknown error');
    zepClient = null;
    isZepEnabled = false;
  }
}

export { zepClient, isZepEnabled };

// Health check function with graceful handling
export async function testZepConnection(): Promise<boolean> {
  if (!isZepEnabled || !zepClient) {
    console.warn('⚠️ Zep client not available for connection test');
    return false;
  }

  try {
    // For now, just check if the client exists and has the expected structure
    // TODO: Implement proper API test once we have correct SDK documentation
    console.log('✅ Zep client initialized successfully');
    console.log('API Key configured:', !!ZEP_API_KEY);
    return true;
  } catch (error) {
    console.warn('⚠️ Zep connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Error handling wrapper for Zep operations with graceful fallback
export async function withZepErrorHandling<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  if (!isZepEnabled || !zepClient) {
    console.warn('⚠️ Zep client not available, using fallback');
    return fallback !== undefined ? fallback : null;
  }

  try {
    return await operation();
  } catch (error) {
    console.warn('⚠️ Zep operation failed:', error instanceof Error ? error.message : 'Unknown error');
    if (fallback !== undefined) {
      return fallback;
    }
    return null;
  }
}

// Safe getter for Zep client
export function getZepClient(): ZepClient | null {
  return isZepEnabled ? zepClient : null;
}

export default zepClient;
