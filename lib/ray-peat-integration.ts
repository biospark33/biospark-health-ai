/**
 * Ray Peat RAG Integration Module
 * Enhances LabInsight AI analysis with Ray Peat bioenergetic insights
 * Phase 2B Production Integration
 */

import { BiomarkerData, AnalysisResults } from './types';

// Configuration
const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:8001';
const RAG_TIMEOUT = parseInt(process.env.RAG_TIMEOUT || '5000');
const RAG_ENABLED = process.env.RAG_ENABLED !== 'false';

export interface RayPeatInsight {
  query: string;
  relevantConcepts: string[];
  bioenergetic_explanation: string;
  contraindications: string[];
  safety_alerts: string[];
  confidence_score: number;
  source_documents: string[];
}

export interface EnhancedAnalysisResults extends AnalysisResults {
  rayPeatInsights?: {
    thyroidInsights?: RayPeatInsight;
    metabolicInsights?: RayPeatInsight;
    nutritionalInsights?: RayPeatInsight;
    hormonalInsights?: RayPeatInsight;
    generalInsights?: RayPeatInsight;
  };
  enhancementStatus: 'success' | 'partial' | 'failed' | 'disabled';
  enhancementTimestamp: string;
}

/**
 * Query Ray Peat RAG system for bioenergetic insights
 */
async function queryRayPeatRAG(query: string, maxResults: number = 5): Promise<RayPeatInsight | null> {
  if (!RAG_ENABLED) {
    console.log('Ray Peat RAG integration disabled');
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RAG_TIMEOUT);

    const response = await fetch(`${RAG_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        include_metadata: true
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`RAG API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.warn(`No RAG results for query: ${query}`);
      return null;
    }

    // Transform RAG response to RayPeatInsight format
    const insight: RayPeatInsight = {
      query,
      relevantConcepts: data.results.map((r: any) => r.metadata?.concept || 'General').slice(0, 5),
      bioenergetic_explanation: data.results.map((r: any) => r.content).join('\n\n').substring(0, 1000),
      contraindications: extractContraindications(data.results),
      safety_alerts: extractSafetyAlerts(data.results),
      confidence_score: data.confidence_score || 0.8,
      source_documents: data.results.map((r: any) => r.metadata?.source || 'Unknown').slice(0, 3)
    };

    return insight;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('RAG query timeout');
    } else {
      console.error('RAG query error:', error);
    }
    return null;
  }
}

/**
 * Extract contraindications from RAG results
 */
function extractContraindications(results: any[]): string[] {
  const contraindications: string[] = [];
  
  for (const result of results) {
    const content = result.content.toLowerCase();
    
    // Look for contraindication keywords
    if (content.includes('contraindicated') || 
        content.includes('avoid') || 
        content.includes('not recommended') ||
        content.includes('dangerous') ||
        content.includes('harmful')) {
      
      // Extract the sentence containing the contraindication
      const sentences = result.content.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes('contraindicated') ||
            sentence.toLowerCase().includes('avoid') ||
            sentence.toLowerCase().includes('not recommended')) {
          contraindications.push(sentence.trim());
          break;
        }
      }
    }
  }
  
  return contraindications.slice(0, 3); // Limit to top 3
}

/**
 * Extract safety alerts from RAG results
 */
function extractSafetyAlerts(results: any[]): string[] {
  const alerts: string[] = [];
  
  for (const result of results) {
    const content = result.content.toLowerCase();
    
    // Look for safety alert keywords
    if (content.includes('caution') || 
        content.includes('warning') || 
        content.includes('monitor') ||
        content.includes('supervision') ||
        content.includes('medical attention')) {
      
      const sentences = result.content.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes('caution') ||
            sentence.toLowerCase().includes('warning') ||
            sentence.toLowerCase().includes('monitor')) {
          alerts.push(sentence.trim());
          break;
        }
      }
    }
  }
  
  return alerts.slice(0, 3); // Limit to top 3
}

/**
 * Generate targeted queries based on biomarker analysis
 */
function generateTargetedQueries(analysisResults: AnalysisResults): string[] {
  const queries: string[] = [];
  
  // Thyroid-specific queries
  if (analysisResults.thyroidScore < 80) {
    queries.push("Ray Peat's approach to thyroid optimization and T3 therapy");
    queries.push("Bioenergetic view of hypothyroidism and cellular energy production");
  }
  
  // Metabolic queries
  if (analysisResults.metabolicScore < 80) {
    queries.push("Ray Peat on glucose metabolism and insulin sensitivity");
    queries.push("Bioenergetic approach to metabolic dysfunction and sugar metabolism");
  }
  
  // Inflammation queries
  if (analysisResults.inflammation && analysisResults.inflammation.score < 80) {
    queries.push("Ray Peat's view on chronic inflammation and anti-inflammatory approaches");
    queries.push("Bioenergetic perspective on inflammatory markers and cellular stress");
  }
  
  // Nutritional queries
  if (analysisResults.nutrients && analysisResults.nutrients.score < 80) {
    queries.push("Ray Peat on essential nutrients for optimal cellular function");
    queries.push("Bioenergetic nutrition principles and micronutrient optimization");
  }
  
  // General bioenergetic query
  queries.push("Ray Peat bioenergetic principles for optimal health and longevity");
  
  return queries;
}

/**
 * Main function to enhance analysis with Ray Peat insights
 */
export async function enhanceAnalysisWithRayPeat(
  analysisResults: AnalysisResults
): Promise<EnhancedAnalysisResults> {
  
  const enhancedResults: EnhancedAnalysisResults = {
    ...analysisResults,
    enhancementStatus: 'disabled',
    enhancementTimestamp: new Date().toISOString()
  };

  if (!RAG_ENABLED) {
    console.log('Ray Peat enhancement disabled');
    return enhancedResults;
  }

  try {
    console.log('Starting Ray Peat RAG enhancement...');
    
    const queries = generateTargetedQueries(analysisResults);
    const insights: { [key: string]: RayPeatInsight | null } = {};
    
    // Execute queries in parallel with timeout protection
    const queryPromises = [
      queryRayPeatRAG(queries[0] || "thyroid function optimization"),
      queryRayPeatRAG(queries[1] || "metabolic health bioenergetics"),
      queryRayPeatRAG(queries[2] || "nutritional optimization"),
      queryRayPeatRAG(queries[3] || "hormonal balance"),
      queryRayPeatRAG(queries[4] || "Ray Peat bioenergetic principles")
    ];

    const results = await Promise.allSettled(queryPromises);
    
    // Process results
    insights.thyroidInsights = results[0].status === 'fulfilled' ? results[0].value : null;
    insights.metabolicInsights = results[1].status === 'fulfilled' ? results[1].value : null;
    insights.nutritionalInsights = results[2].status === 'fulfilled' ? results[2].value : null;
    insights.hormonalInsights = results[3].status === 'fulfilled' ? results[3].value : null;
    insights.generalInsights = results[4].status === 'fulfilled' ? results[4].value : null;

    // Filter out null insights
    const validInsights = Object.fromEntries(
      Object.entries(insights).filter(([_, insight]) => insight !== null)
    );

    if (Object.keys(validInsights).length > 0) {
      enhancedResults.rayPeatInsights = validInsights as any;
      enhancedResults.enhancementStatus = Object.keys(validInsights).length === 5 ? 'success' : 'partial';
      console.log(`Ray Peat enhancement completed: ${enhancedResults.enhancementStatus}`);
    } else {
      enhancedResults.enhancementStatus = 'failed';
      console.warn('Ray Peat enhancement failed - no valid insights generated');
    }

  } catch (error) {
    console.error('Ray Peat enhancement error:', error);
    enhancedResults.enhancementStatus = 'failed';
  }

  return enhancedResults;
}

/**
 * Health check for Ray Peat RAG system
 */
export async function checkRayPeatRAGHealth(): Promise<boolean> {
  if (!RAG_ENABLED) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${RAG_API_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;

  } catch (error) {
    console.error('RAG health check failed:', error);
    return false;
  }
}

/**
 * Get Ray Peat RAG system status
 */
export async function getRayPeatRAGStatus() {
  const isHealthy = await checkRayPeatRAGHealth();
  
  return {
    enabled: RAG_ENABLED,
    healthy: isHealthy,
    url: RAG_API_URL,
    timeout: RAG_TIMEOUT,
    timestamp: new Date().toISOString()
  };
}
