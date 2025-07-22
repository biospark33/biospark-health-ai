/**
 * Enhanced Biomarker Analysis with Ray Peat RAG Integration
 * Phase 2B Production - AI-Enhanced Deterministic Logic
 */

import { BiomarkerData, AnalysisResults } from './types';
import { analyzeBiomarker, OPTIMAL_RANGES, SCORING_WEIGHTS } from './biomarker-analysis';
import { enhanceAnalysisWithRayPeat, EnhancedAnalysisResults } from './ray-peat-integration';

/**
 * Enhanced analysis that combines deterministic logic with Ray Peat insights
 */
export async function performEnhancedBiomarkerAnalysis(
  biomarkerData: BiomarkerData
): Promise<EnhancedAnalysisResults> {
  
  console.log('Starting enhanced biomarker analysis with Ray Peat integration...');
  
  // Step 1: Perform standard deterministic analysis (primary)
  const standardResults = await performStandardAnalysis(biomarkerData);
  
  // Step 2: Enhance with Ray Peat bioenergetic insights (secondary)
  const enhancedResults = await enhanceAnalysisWithRayPeat(standardResults);
  
  // Step 3: Integrate insights into recommendations
  const finalResults = integrateRayPeatInsights(enhancedResults);
  
  console.log(`Enhanced analysis completed with status: ${finalResults.enhancementStatus}`);
  
  return finalResults;
}

/**
 * Perform standard deterministic biomarker analysis
 */
async function performStandardAnalysis(biomarkerData: BiomarkerData): Promise<AnalysisResults> {
  const biomarkerAnalyses: any = {};
  const criticalFindings: any[] = [];
  const recommendations: string[] = [];
  
  // Analyze each biomarker
  for (const [biomarker, value] of Object.entries(biomarkerData)) {
    if (typeof value === 'number' && OPTIMAL_RANGES[biomarker]) {
      const analysis = analyzeBiomarker(biomarker, value);
      biomarkerAnalyses[biomarker] = analysis;
      
      // Collect critical findings
      if (analysis.severity === 'critical' || analysis.severity === 'high') {
        criticalFindings.push({
          biomarker,
          value: analysis.value,
          status: analysis.status,
          severity: analysis.severity,
          impact: analysis.impact,
          description: analysis.optimal.description
        });
      }
      
      // Collect recommendations
      recommendations.push(...analysis.recommendations);
    }
  }
  
  // Calculate category scores
  const thyroidScore = calculateThyroidScore(biomarkerAnalyses);
  const metabolicScore = calculateMetabolicScore(biomarkerAnalyses);
  const inflammationScore = calculateInflammationScore(biomarkerAnalyses);
  const nutrientScore = calculateNutrientScore(biomarkerAnalyses);
  
  // Calculate overall metabolic score
  const overallScore = (
    thyroidScore * SCORING_WEIGHTS.thyroid +
    metabolicScore * SCORING_WEIGHTS.metabolic +
    inflammationScore * SCORING_WEIGHTS.inflammation +
    nutrientScore * SCORING_WEIGHTS.nutrients
  );
  
  // Detect metabolic patterns
  const patterns = detectMetabolicPatterns(biomarkerAnalyses);
  
  return {
    metabolicScore: Math.round(overallScore),
    thyroidScore: Math.round(thyroidScore),
    metabolicHealth: {
      score: Math.round(metabolicScore),
      glucose: biomarkerAnalyses.fastingGlucose,
      insulin: biomarkerAnalyses.fastingInsulin,
      hba1c: biomarkerAnalyses.hba1c
    },
    inflammation: {
      score: Math.round(inflammationScore),
      hsCRP: biomarkerAnalyses.hsCRP
    },
    nutrients: {
      score: Math.round(nutrientScore),
      vitaminD: biomarkerAnalyses.vitaminD,
      vitaminB12: biomarkerAnalyses.vitaminB12,
      folate: biomarkerAnalyses.folate,
      ferritin: biomarkerAnalyses.ferritin,
      magnesium: biomarkerAnalyses.magnesium,
      zinc: biomarkerAnalyses.zinc
    },
    biomarkers: biomarkerAnalyses,
    patterns,
    criticalFindings,
    recommendations: {
      immediate: recommendations.filter(r => r.includes('immediate') || r.includes('urgent')),
      shortTerm: recommendations.filter(r => !r.includes('immediate') && !r.includes('urgent')),
      lifestyle: recommendations.filter(r => r.includes('lifestyle') || r.includes('diet')),
      supplements: recommendations.filter(r => r.includes('supplement') || r.includes('vitamin')),
      monitoring: recommendations.filter(r => r.includes('monitor') || r.includes('retest'))
    }
  };
}

/**
 * Calculate thyroid function score
 */
function calculateThyroidScore(analyses: any): number {
  const thyroidBiomarkers = ['tsh', 'freeT4', 'freeT3', 'reverseT3'];
  let totalScore = 0;
  let count = 0;
  
  for (const biomarker of thyroidBiomarkers) {
    if (analyses[biomarker]) {
      const score = 100 - analyses[biomarker].impact;
      totalScore += score;
      count++;
    }
  }
  
  return count > 0 ? totalScore / count : 100;
}

/**
 * Calculate metabolic health score
 */
function calculateMetabolicScore(analyses: any): number {
  const metabolicBiomarkers = ['fastingGlucose', 'fastingInsulin', 'hba1c', 'triglycerides'];
  let totalScore = 0;
  let count = 0;
  
  for (const biomarker of metabolicBiomarkers) {
    if (analyses[biomarker]) {
      const score = 100 - analyses[biomarker].impact;
      totalScore += score;
      count++;
    }
  }
  
  return count > 0 ? totalScore / count : 100;
}

/**
 * Calculate inflammation score
 */
function calculateInflammationScore(analyses: any): number {
  const inflammationBiomarkers = ['hsCRP'];
  let totalScore = 0;
  let count = 0;
  
  for (const biomarker of inflammationBiomarkers) {
    if (analyses[biomarker]) {
      const score = 100 - analyses[biomarker].impact;
      totalScore += score;
      count++;
    }
  }
  
  return count > 0 ? totalScore / count : 100;
}

/**
 * Calculate nutrient status score
 */
function calculateNutrientScore(analyses: any): number {
  const nutrientBiomarkers = ['vitaminD', 'vitaminB12', 'folate', 'ferritin', 'magnesium', 'zinc'];
  let totalScore = 0;
  let count = 0;
  
  for (const biomarker of nutrientBiomarkers) {
    if (analyses[biomarker]) {
      const score = 100 - analyses[biomarker].impact;
      totalScore += score;
      count++;
    }
  }
  
  return count > 0 ? totalScore / count : 100;
}

/**
 * Detect metabolic patterns
 */
function detectMetabolicPatterns(analyses: any): string[] {
  const patterns: string[] = [];
  
  // Hypothyroid pattern
  if (analyses.tsh?.status === 'excessive' && analyses.freeT3?.status === 'deficient') {
    patterns.push('Hypothyroid Pattern');
  }
  
  // Insulin resistance pattern
  if (analyses.fastingInsulin?.status === 'excessive' && analyses.fastingGlucose?.status === 'excessive') {
    patterns.push('Insulin Resistance Pattern');
  }
  
  // Chronic inflammation pattern
  if (analyses.hsCRP?.status === 'excessive') {
    patterns.push('Chronic Inflammation Pattern');
  }
  
  // Nutrient deficiency pattern
  const deficientNutrients = ['vitaminD', 'vitaminB12', 'folate', 'ferritin', 'magnesium', 'zinc']
    .filter(nutrient => analyses[nutrient]?.status === 'deficient');
  
  if (deficientNutrients.length >= 3) {
    patterns.push('Multiple Nutrient Deficiency Pattern');
  }
  
  return patterns;
}

/**
 * Integrate Ray Peat insights into the final analysis
 */
function integrateRayPeatInsights(enhancedResults: EnhancedAnalysisResults): EnhancedAnalysisResults {
  if (!enhancedResults.rayPeatInsights || enhancedResults.enhancementStatus === 'failed') {
    return enhancedResults;
  }
  
  // Add Ray Peat insights to recommendations
  const rayPeatRecommendations: string[] = [];
  const rayPeatContraindications: string[] = [];
  const rayPeatSafetyAlerts: string[] = [];
  
  // Extract insights from each category
  Object.values(enhancedResults.rayPeatInsights).forEach(insight => {
    if (insight) {
      // Add bioenergetic explanations as educational content
      if (insight.bioenergetic_explanation) {
        rayPeatRecommendations.push(`Bioenergetic Insight: ${insight.bioenergetic_explanation.substring(0, 200)}...`);
      }
      
      // Collect contraindications
      rayPeatContraindications.push(...insight.contraindications);
      
      // Collect safety alerts
      rayPeatSafetyAlerts.push(...insight.safety_alerts);
    }
  });
  
  // Enhance existing recommendations with Ray Peat insights
  const enhancedRecommendations = {
    ...enhancedResults.recommendations,
    bioenergetic: rayPeatRecommendations,
    contraindications: rayPeatContraindications,
    safetyAlerts: rayPeatSafetyAlerts
  };
  
  return {
    ...enhancedResults,
    recommendations: enhancedRecommendations
  };
}

/**
 * Get analysis summary with Ray Peat enhancement status
 */
export function getAnalysisSummary(results: EnhancedAnalysisResults): string {
  const baseScore = results.metabolicScore;
  const enhancementStatus = results.enhancementStatus;
  
  let summary = `Overall Metabolic Score: ${baseScore}/100`;
  
  if (enhancementStatus === 'success') {
    summary += ' (Enhanced with Ray Peat bioenergetic insights)';
  } else if (enhancementStatus === 'partial') {
    summary += ' (Partially enhanced with Ray Peat insights)';
  } else if (enhancementStatus === 'failed') {
    summary += ' (Ray Peat enhancement unavailable)';
  }
  
  return summary;
}
