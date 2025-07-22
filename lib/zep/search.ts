
/**
 * Zep Advanced Search Operations
 * Phase 2B - Semantic Search for Health Analysis History
 */

import { zepClient, withZepErrorHandling } from './client';
import { MemorySearchQuery, MemorySearchResult, ZepOperationResult } from './types';

/**
 * Semantic search for health analysis history
 * Uses Zep's vector search capabilities to find relevant past analyses
 */
export async function semanticSearch(
  userId: string,
  sessionId: string,
  query: string,
  limit: number = 5,
  filters?: Record<string, any>
): Promise<ZepOperationResult<MemorySearchResult[]>> {
  if (!zepClient) {
    return { success: false, error: { code: 'CLIENT_NOT_AVAILABLE', message: 'Zep client not initialized', timestamp: new Date() } };
  }

  return withZepErrorHandling(async () => {
    try {
      // Use Zep's search API for semantic search
      const searchResults = await zepClient.memory.search(sessionId, {
        text: query,
        limit,
        metadata: filters
      });

      const results: MemorySearchResult[] = searchResults.map(result => ({
        id: result.message?.uuid || '',
        content: result.message?.content || '',
        metadata: result.message?.metadata || {},
        score: result.score || 0,
        timestamp: result.message?.created_at ? new Date(result.message.created_at) : new Date(),
        type: result.message?.metadata?.type || 'conversation'
      }));

      return { success: true, data: results };
    } catch (error) {
      throw new Error(`Semantic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }) as Promise<ZepOperationResult<MemorySearchResult[]>>;
}

/**
 * Search for specific health analysis types
 */
export async function searchHealthAnalyses(
  userId: string,
  sessionId: string,
  analysisType?: string,
  dateRange?: { start: Date; end: Date },
  limit: number = 10
): Promise<ZepOperationResult<MemorySearchResult[]>> {
  const filters: Record<string, any> = {
    userId,
    type: 'health_analysis'
  };

  if (analysisType) {
    filters.analysisType = analysisType;
  }

  if (dateRange) {
    filters.dateRange = dateRange;
  }

  return semanticSearch(userId, sessionId, 'health analysis biomarkers recommendations', limit, filters);
}

/**
 * Find relevant context for current health query
 */
export async function findRelevantContext(
  userId: string,
  sessionId: string,
  currentQuery: string,
  contextTypes: string[] = ['health_analysis', 'preferences', 'goals']
): Promise<ZepOperationResult<MemorySearchResult[]>> {
  const filters = {
    userId,
    type: { $in: contextTypes }
  };

  return semanticSearch(userId, sessionId, currentQuery, 5, filters);
}
