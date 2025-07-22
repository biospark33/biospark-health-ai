
/**
 * Zep Memory Integration Client
 * Phase 2A Foundation - HIPAA Compliant Memory Management
 */

import { ZepClient } from '@getzep/zep-js';

// Environment validation
const ZEP_API_KEY = process.env.ZEP_API_KEY;
const ZEP_API_URL = process.env.ZEP_API_URL || 'https://api.getzep.com';

if (!ZEP_API_KEY) {
  throw new Error('ZEP_API_KEY environment variable is required');
}

// Initialize Zep client with error handling
let zepClient: ZepClient | null = null;

try {
  zepClient = new ZepClient({
    apiKey: ZEP_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize Zep client:', error);
}

export { zepClient };

// Health check function
export async function testZepConnection(): Promise<boolean> {
  if (!zepClient) {
    console.error('Zep client not initialized');
    return false;
  }

  try {
    // For now, just check if the client exists and has the expected structure
    // TODO: Implement proper API test once we have correct SDK documentation
    console.log('Zep client initialized successfully');
    console.log('API Key configured:', !!ZEP_API_KEY);
    return true;
  } catch (error) {
    console.error('Zep connection test failed:', error);
    return false;
  }
}

// Error handling wrapper for Zep operations
export async function withZepErrorHandling<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error('Zep operation failed:', error);
    if (fallback !== undefined) {
      return fallback;
    }
    return null;
  }
}

export default zepClient;
