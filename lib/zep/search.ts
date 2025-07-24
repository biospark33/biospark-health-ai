

// Zep Search Operations
// Phase 4 Final Optimization - Enhanced Search Functionality
// Provides semantic search capabilities for health memory

import { LabInsightZepClient } from '../zep-client';

export interface SearchResult {
  success: boolean;
  results?: any[];
  error?: {
    code: string;
    message: string;
  };
}

export interface SearchOptions {
  limit?: number;
  metadata?: any;
  text?: string;
}

// Global client instance for search operations
let globalZepClient: LabInsightZepClient | null = null;

export function setZepClient(client: LabInsightZepClient) {
  globalZepClient = client;
}

export async function semanticSearch(
  userId: string,
  sessionId: string,
  query: string,
  limit: number = 10
): Promise<SearchResult> {
  try {
    // Check if client is available
    if (!globalZepClient) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_AVAILABLE',
          message: 'Zep client not initialized'
        }
      };
    }

    // Perform semantic search using the Zep client
    const results = await globalZepClient.searchMemory(sessionId, query, { limit });

    return {
      success: true,
      results: results || []
    };
  } catch (error) {
    console.error('Semantic search failed:', error);
    return {
      success: false,
      error: {
        code: 'SEARCH_FAILED',
        message: `Semantic search failed: ${error}`
      }
    };
  }
}

export async function searchHealthAnalyses(
  userId: string,
  sessionId: string,
  analysisType: string = 'comprehensive',
  limit: number = 10
): Promise<SearchResult> {
  try {
    if (!globalZepClient) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_AVAILABLE',
          message: 'Zep client not initialized'
        }
      };
    }

    // Search for health analyses with specific metadata
    const searchOptions = {
      text: 'health analysis biomarkers recommendations',
      metadata: {
        type: 'health_analysis',
        analysisType,
        userId
      },
      limit
    };

    const results = await globalZepClient.searchMemory(sessionId, searchOptions.text, searchOptions);

    return {
      success: true,
      results: results || []
    };
  } catch (error) {
    console.error('Health analysis search failed:', error);
    return {
      success: false,
      error: {
        code: 'SEARCH_FAILED',
        message: `Health analysis search failed: ${error}`
      }
    };
  }
}

export async function findRelevantContext(
  userId: string,
  sessionId: string,
  currentQuery: string,
  limit: number = 5
): Promise<SearchResult> {
  try {
    if (!globalZepClient) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_AVAILABLE',
          message: 'Zep client not initialized'
        }
      };
    }

    // Search for relevant context across multiple types
    const searchOptions = {
      text: currentQuery,
      metadata: {
        type: {
          $in: ['health_analysis', 'preferences', 'goals']
        },
        userId
      },
      limit
    };

    const results = await globalZepClient.searchMemory(sessionId, searchOptions.text, searchOptions);

    return {
      success: true,
      results: results || []
    };
  } catch (error) {
    console.error('Context search failed:', error);
    return {
      success: false,
      error: {
        code: 'SEARCH_FAILED',
        message: `Context search failed: ${error}`
      }
    };
  }
}

// Enhanced search with filtering capabilities
export async function advancedSearch(
  userId: string,
  sessionId: string,
  options: SearchOptions
): Promise<SearchResult> {
  try {
    if (!globalZepClient) {
      return {
        success: false,
        error: {
          code: 'CLIENT_NOT_AVAILABLE',
          message: 'Zep client not initialized'
        }
      };
    }

    const searchQuery = options.text || '';
    const searchOptions = {
      limit: options.limit || 10,
      metadata: {
        ...options.metadata,
        userId
      }
    };

    const results = await globalZepClient.searchMemory(sessionId, searchQuery, searchOptions);

    return {
      success: true,
      results: results || []
    };
  } catch (error) {
    console.error('Advanced search failed:', error);
    return {
      success: false,
      error: {
        code: 'SEARCH_FAILED',
        message: `Advanced search failed: ${error}`
      }
    };
  }
}
