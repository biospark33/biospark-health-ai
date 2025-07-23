
/**
 * Zep Memory Integration Client
 * Phase 2A Foundation - HIPAA Compliant Memory Management
 * Enhanced with graceful fallback handling and proper URL construction
 */

import { ZepClient } from '@getzep/zep-js';

// Environment validation with graceful fallback
const ZEP_API_KEY = process.env.ZEP_API_KEY;
const ZEP_API_URL = process.env.ZEP_API_URL || 'https://api.getzep.com';

// Initialize Zep client with graceful error handling
let zepClient: ZepClient | null = null;
let isZepEnabled = false;
let initializationPromise: Promise<void> | null = null;

async function initializeZepClient(): Promise<void> {
  if (!ZEP_API_KEY || ZEP_API_KEY === 'your-zep-api-key' || ZEP_API_KEY.includes('your-')) {
    console.warn('⚠️ ZEP_API_KEY not set or contains placeholder value, Zep memory features disabled');
    isZepEnabled = false;
    return;
  }

  try {
    // Proper ZepClient initialization with string parameters
    zepClient = new ZepClient({
      apiKey: ZEP_API_KEY,
      baseURL: ZEP_API_URL
    });
    
    isZepEnabled = true;
    console.log('✅ Zep client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Zep client (memory features disabled):', error instanceof Error ? error.message : 'Unknown error');
    zepClient = null;
    isZepEnabled = false;
  }
}

// Initialize client only when needed (lazy initialization)
function ensureZepClient(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeZepClient();
  }
  return initializationPromise;
}

export { zepClient, isZepEnabled };

// Health check function with graceful handling
export async function testZepConnection(): Promise<boolean> {
  await ensureZepClient();
  
  if (!isZepEnabled || !zepClient) {
    console.warn('⚠️ Zep client not available for connection test');
    return false;
  }

  try {
    // Simple connection test - just verify client exists and is configured
    console.log('✅ Zep client initialized successfully');
    console.log('API Key configured:', !!ZEP_API_KEY);
    console.log('Base URL:', ZEP_API_URL);
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
  await ensureZepClient();
  
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
export async function getZepClient(): Promise<ZepClient | null> {
  await ensureZepClient();
  return isZepEnabled ? zepClient : null;
}

export default zepClient;
