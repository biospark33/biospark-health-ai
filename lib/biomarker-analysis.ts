
import { BiomarkerData, BiomarkerAnalysis, OptimalRange, MetabolicPattern, CriticalFinding, AnalysisResults } from './types';

// Optimal ranges based on Ray Peat principles and functional medicine
export const OPTIMAL_RANGES: Record<string, OptimalRange> = {
  // Thyroid Function
  tsh: { min: 0.5, max: 2.0, unit: 'µIU/mL', description: 'Thyroid Stimulating Hormone' },
  freeT4: { min: 1.3, max: 1.8, unit: 'ng/dL', description: 'Free Thyroxine' },
  freeT3: { min: 3.2, max: 4.4, unit: 'pg/mL', description: 'Free Triiodothyronine' },
  reverseT3: { min: 9, max: 24, unit: 'ng/dL', description: 'Reverse T3' },
  
  // Metabolic Health
  fastingGlucose: { min: 72, max: 85, unit: 'mg/dL', description: 'Fasting Glucose' },
  fastingInsulin: { min: 2, max: 5, unit: 'µIU/mL', description: 'Fasting Insulin' },
  hba1c: { min: 4.8, max: 5.2, unit: '%', description: 'Hemoglobin A1c' },
  
  // Lipid Profile
  totalCholesterol: { min: 180, max: 250, unit: 'mg/dL', description: 'Total Cholesterol' },
  hdl: { min: 50, max: 100, unit: 'mg/dL', description: 'HDL Cholesterol' },
  ldl: { min: 70, max: 150, unit: 'mg/dL', description: 'LDL Cholesterol' },
  triglycerides: { min: 50, max: 80, unit: 'mg/dL', description: 'Triglycerides' },
  
  // Inflammation
  hsCRP: { min: 0.0, max: 0.5, unit: 'mg/L', description: 'High-Sensitivity C-Reactive Protein' },
  
  // Vitamins and Minerals
  vitaminD: { min: 50, max: 80, unit: 'ng/mL', description: 'Vitamin D 25-OH' },
  vitaminB12: { min: 500, max: 1300, unit: 'pg/mL', description: 'Vitamin B12' },
  folate: { min: 10, max: 24, unit: 'ng/mL', description: 'Folate' },
  ferritin: { min: 30, max: 150, unit: 'ng/mL', description: 'Ferritin' },
  iron: { min: 85, max: 160, unit: 'µg/dL', description: 'Iron' },
  transferrin: { min: 250, max: 380, unit: 'mg/dL', description: 'Transferrin' },
  magnesium: { min: 2.0, max: 2.6, unit: 'mg/dL', description: 'Magnesium' },
  zinc: { min: 90, max: 140, unit: 'µg/dL', description: 'Zinc' },
  
  // Liver Function
  alt: { min: 10, max: 30, unit: 'U/L', description: 'Alanine Aminotransferase' },
  ast: { min: 10, max: 30, unit: 'U/L', description: 'Aspartate Aminotransferase' },
  alkalinePhosphatase: { min: 70, max: 120, unit: 'U/L', description: 'Alkaline Phosphatase' },
  
  // Kidney Function
  creatinine: { min: 0.7, max: 1.2, unit: 'mg/dL', description: 'Creatinine' },
  bun: { min: 10, max: 20, unit: 'mg/dL', description: 'Blood Urea Nitrogen' },
  
  // Complete Blood Count
  wbc: { min: 4.5, max: 11.0, unit: '10³/µL', description: 'White Blood Cells' },
  rbc: { min: 4.2, max: 5.4, unit: '10⁶/µL', description: 'Red Blood Cells' },
  hemoglobin: { min: 13.5, max: 17.5, unit: 'g/dL', description: 'Hemoglobin' },
  hematocrit: { min: 40, max: 52, unit: '%', description: 'Hematocrit' },
  platelets: { min: 150, max: 450, unit: '10³/µL', description: 'Platelets' },
};

// Scoring weights based on physiological importance
export const SCORING_WEIGHTS = {
  thyroid: 0.4,      // 40% - Master metabolic regulator
  metabolic: 0.3,    // 30% - Glucose/insulin/lipid metabolism
  inflammation: 0.15, // 15% - Chronic inflammation impact
  nutrients: 0.15    // 15% - Micronutrient foundation
};

export function analyzeBiomarker(biomarker: string, value: number): BiomarkerAnalysis {
  const optimal = OPTIMAL_RANGES[biomarker];
  if (!optimal) {
    throw new Error(`Unknown biomarker: ${biomarker}`);
  }

  let status: 'optimal' | 'suboptimal' | 'deficient' | 'excessive';
  let severity: 'low' | 'medium' | 'high' | 'critical';
  let impact: number;

  // Determine status
  if (value >= optimal.min && value <= optimal.max) {
    status = 'optimal';
    severity = 'low';
    impact = 0;
  } else if (value < optimal.min) {
    const deviation = ((optimal.min - value) / optimal.min) * 100;
    status = 'deficient';
    if (deviation > 50) {
      severity = 'critical';
      impact = 90;
    } else if (deviation > 25) {
      severity = 'high';
      impact = 70;
    } else if (deviation > 10) {
      severity = 'medium';
      impact = 40;
    } else {
      severity = 'low';
      impact = 15;
    }
  } else {
    const deviation = ((value - optimal.max) / optimal.max) * 100;
    status = 'excessive';
    if (deviation > 50) {
      severity = 'critical';
      impact = 90;
    } else if (deviation > 25) {
      severity = 'high';
      impact = 70;
    } else if (deviation > 10) {
      severity = 'medium';
      impact = 40;
    } else {
      severity = 'low';
      impact = 15;
    }
  }

  // Generate recommendations
  const recommendations = generateRecommendations(biomarker, status, severity);

  return {
    value,
    optimal,
    status,
    severity,
    impact,
    recommendations
  };
}

function generateRecommendations(biomarker: string, status: string, severity: string): string[] {
  const recommendations: string[] = [];

  switch (biomarker) {
    case 'tsh':
      if (status === 'excessive') {
        recommendations.push('Consider thyroid support with natural desiccated thyroid');
        recommendations.push('Optimize iodine and tyrosine intake');
        recommendations.push('Reduce stress and support adrenal function');
      }
      break;
    case 'freeT3':
      if (status === 'deficient') {
        recommendations.push('Support T4 to T3 conversion with selenium and zinc');
        recommendations.push('Reduce reverse T3 with stress management');
        recommendations.push('Consider T3 supplementation if needed');
      }
      break;
    case 'fastingInsulin':
      if (status === 'excessive') {
        recommendations.push('Reduce refined carbohydrates and increase protein');
        recommendations.push('Incorporate intermittent fasting');
        recommendations.push('Add chromium and magnesium supplementation');
      }
      break;
    case 'hsCRP':
      if (status === 'excessive') {
        recommendations.push('Identify and eliminate inflammatory triggers');
        recommendations.push('Increase omega-3 fatty acids and antioxidants');
        recommendations.push('Support gut health with probiotics');
      }
      break;
    case 'vitaminD':
      if (status === 'deficient') {
        recommendations.push('Increase sun exposure and vitamin D3 supplementation');
        recommendations.push('Optimize magnesium and vitamin K2 cofactors');
        recommendations.push('Consider high-dose vitamin D3 with monitoring');
      }
      break;
    // Add more biomarker-specific recommendations
  }

  return recommendations;
}

export function detectMetabolicPatterns(biomarkers: Record<string, BiomarkerAnalysis>): MetabolicPattern[] {
  const patterns: MetabolicPattern[] = [];

  // Hypothyroid Pattern
  const hypothyroidIndicators = [];
  if (biomarkers.tsh?.status === 'excessive') hypothyroidIndicators.push('Elevated TSH');
  if (biomarkers.freeT3?.status === 'deficient') hypothyroidIndicators.push('Low Free T3');
  if (biomarkers.reverseT3?.status === 'excessive') hypothyroidIndicators.push('Elevated Reverse T3');

  if (hypothyroidIndicators.length >= 2) {
    patterns.push({
      type: 'hypothyroid',
      severity: hypothyroidIndicators.length >= 3 ? 'severe' : 'moderate',
      confidence: hypothyroidIndicators.length / 3,
      indicators: hypothyroidIndicators,
      description: 'Hypothyroid pattern detected with compromised metabolic function',
      recommendations: [
        'Comprehensive thyroid evaluation with full panel',
        'Consider natural desiccated thyroid or T3 supplementation',
        'Support thyroid with iodine, selenium, and tyrosine',
        'Address stress and adrenal function'
      ],
      priority: 'high'
    });
  }

  // Insulin Resistance Pattern
  const insulinResistanceIndicators = [];
  if (biomarkers.fastingInsulin?.status === 'excessive') insulinResistanceIndicators.push('Elevated Fasting Insulin');
  if (biomarkers.fastingGlucose?.status === 'excessive') insulinResistanceIndicators.push('Elevated Fasting Glucose');
  if (biomarkers.hba1c?.status === 'excessive') insulinResistanceIndicators.push('Elevated HbA1c');
  if (biomarkers.triglycerides?.status === 'excessive') insulinResistanceIndicators.push('Elevated Triglycerides');

  if (insulinResistanceIndicators.length >= 2) {
    patterns.push({
      type: 'insulin_resistance',
      severity: insulinResistanceIndicators.length >= 3 ? 'severe' : 'moderate',
      confidence: insulinResistanceIndicators.length / 4,
      indicators: insulinResistanceIndicators,
      description: 'Insulin resistance pattern with metabolic dysfunction',
      recommendations: [
        'Reduce refined carbohydrates and increase protein intake',
        'Incorporate intermittent fasting and time-restricted eating',
        'Add chromium, magnesium, and alpha-lipoic acid supplementation',
        'Increase physical activity and strength training'
      ],
      priority: 'high'
    });
  }

  // Inflammation Pattern
  const inflammationIndicators = [];
  if (biomarkers.hsCRP?.status === 'excessive') inflammationIndicators.push('Elevated hs-CRP');
  if (biomarkers.ferritin?.status === 'excessive') inflammationIndicators.push('Elevated Ferritin');

  if (inflammationIndicators.length >= 1) {
    patterns.push({
      type: 'inflammation',
      severity: biomarkers.hsCRP?.impact > 70 ? 'severe' : 'moderate',
      confidence: 0.8,
      indicators: inflammationIndicators,
      description: 'Chronic inflammation pattern detected',
      recommendations: [
        'Identify and eliminate inflammatory triggers',
        'Increase omega-3 fatty acids and antioxidants',
        'Support gut health with probiotics and prebiotics',
        'Consider anti-inflammatory herbs like turmeric and ginger'
      ],
      priority: 'medium'
    });
  }

  return patterns;
}

export function identifyCriticalFindings(biomarkers: Record<string, BiomarkerAnalysis>): CriticalFinding[] {
  const findings: CriticalFinding[] = [];

  // Sort biomarkers by impact
  const sortedBiomarkers = Object.entries(biomarkers)
    .sort(([,a], [,b]) => b.impact - a.impact)
    .slice(0, 10); // Top 10 most impactful

  sortedBiomarkers.forEach(([name, analysis], index) => {
    if (analysis.impact > 60) {
      findings.push({
        type: 'critical',
        title: `${OPTIMAL_RANGES[name]?.description || name} Dysfunction`,
        description: `${name} is ${analysis.status} with ${analysis.impact}% impact on metabolic health`,
        impact: analysis.impact,
        severity: analysis.severity,
        recommendations: analysis.recommendations,
        biomarkers: [name],
        priority: index + 1
      });
    } else if (analysis.impact > 30) {
      findings.push({
        type: 'important',
        title: `${OPTIMAL_RANGES[name]?.description || name} Suboptimal`,
        description: `${name} needs attention with ${analysis.impact}% impact on metabolic health`,
        impact: analysis.impact,
        severity: analysis.severity,
        recommendations: analysis.recommendations,
        biomarkers: [name],
        priority: index + 1
      });
    } else if (analysis.status === 'optimal') {
      findings.push({
        type: 'strength',
        title: `${OPTIMAL_RANGES[name]?.description || name} Optimal`,
        description: `${name} is in optimal range, supporting metabolic health`,
        impact: 0,
        severity: 'low',
        recommendations: ['Continue current approach'],
        biomarkers: [name],
        priority: index + 1
      });
    }
  });

  return findings.slice(0, 8); // Return top 8 findings
}

export function calculateMetabolicScore(biomarkers: Record<string, BiomarkerAnalysis>): {
  overall: number;
  thyroid: number;
  metabolic: number;
  inflammation: number;
  nutrients: number;
} {
  // Thyroid Score
  const thyroidMarkers = ['tsh', 'freeT4', 'freeT3', 'reverseT3'];
  const thyroidScore = calculateCategoryScore(biomarkers, thyroidMarkers);

  // Metabolic Score
  const metabolicMarkers = ['fastingGlucose', 'fastingInsulin', 'hba1c', 'triglycerides', 'hdl'];
  const metabolicScore = calculateCategoryScore(biomarkers, metabolicMarkers);

  // Inflammation Score
  const inflammationMarkers = ['hsCRP', 'ferritin'];
  const inflammationScore = calculateCategoryScore(biomarkers, inflammationMarkers);

  // Nutrients Score
  const nutrientMarkers = ['vitaminD', 'vitaminB12', 'folate', 'magnesium', 'zinc'];
  const nutrientsScore = calculateCategoryScore(biomarkers, nutrientMarkers);

  // Overall Score (weighted)
  const overallScore = Math.round(
    thyroidScore * SCORING_WEIGHTS.thyroid +
    metabolicScore * SCORING_WEIGHTS.metabolic +
    inflammationScore * SCORING_WEIGHTS.inflammation +
    nutrientsScore * SCORING_WEIGHTS.nutrients
  );

  return {
    overall: overallScore,
    thyroid: thyroidScore,
    metabolic: metabolicScore,
    inflammation: inflammationScore,
    nutrients: nutrientsScore
  };
}

function calculateCategoryScore(biomarkers: Record<string, BiomarkerAnalysis>, markers: string[]): number {
  const availableMarkers = markers.filter(marker => biomarkers[marker]);
  if (availableMarkers.length === 0) return 100; // Default if no markers available

  const totalScore = availableMarkers.reduce((sum, marker) => {
    const analysis = biomarkers[marker];
    const score = 100 - analysis.impact; // Higher impact = lower score
    return sum + score;
  }, 0);

  return Math.round(totalScore / availableMarkers.length);
}

export function generateComprehensiveAnalysis(biomarkerData: BiomarkerData): AnalysisResults {
  // Analyze each biomarker
  const biomarkers: Record<string, BiomarkerAnalysis> = {};
  Object.entries(biomarkerData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      biomarkers[key] = analyzeBiomarker(key, value);
    }
  });

  // Calculate scores
  const scores = calculateMetabolicScore(biomarkers);

  // Detect patterns
  const patterns = detectMetabolicPatterns(biomarkers);

  // Identify critical findings
  const criticalFindings = identifyCriticalFindings(biomarkers);

  // Generate recommendations
  const recommendations = generateComprehensiveRecommendations(biomarkers, patterns, criticalFindings);

  // Generate insights
  const insights = generateInsights(biomarkers, patterns, criticalFindings);

  return {
    metabolicScore: scores.overall,
    thyroidScore: scores.thyroid,
    metabolicHealth: scores.metabolic,
    inflammation: scores.inflammation,
    nutrients: scores.nutrients,
    biomarkers,
    patterns,
    criticalFindings,
    recommendations,
    summary: generateSummary(scores, patterns, criticalFindings),
    optimization: generateOptimization(biomarkers, patterns, criticalFindings)
  };
}

function generateComprehensiveRecommendations(
  biomarkers: Record<string, BiomarkerAnalysis>,
  patterns: MetabolicPattern[],
  criticalFindings: CriticalFinding[]
) {
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];

  // Immediate actions from critical findings
  criticalFindings
    .filter(f => f.type === 'critical')
    .forEach(finding => {
      if (finding.recommendations) {
        immediate.push(...finding.recommendations.slice(0, 1));
      }
    });

  // Short-term actions from patterns
  patterns.forEach(pattern => {
    shortTerm.push(...pattern.recommendations.slice(0, 2));
  });

  // Long-term strategies
  longTerm.push('Regular monitoring and follow-up testing');
  longTerm.push('Comprehensive lifestyle optimization');
  longTerm.push('Working with healthcare practitioner for personalized protocol');

  return {
    immediate: [...new Set(immediate)].slice(0, 5),
    shortTerm: [...new Set(shortTerm)].slice(0, 5),
    longTerm: [...new Set(longTerm)].slice(0, 5)
  };
}

function generateInsights(
  biomarkers: Record<string, BiomarkerAnalysis>,
  patterns: MetabolicPattern[],
  criticalFindings: CriticalFinding[]
) {
  const keyStrengths = criticalFindings
    .filter(f => f.type === 'strength')
    .map(f => f.title)
    .slice(0, 3);

  const areasForImprovement = criticalFindings
    .filter(f => f.type === 'critical' || f.type === 'important')
    .map(f => f.title)
    .slice(0, 3);

  const riskFactors = patterns
    .filter(p => p.priority === 'high')
    .map(p => p.description)
    .slice(0, 3);

  return {
    keyStrengths,
    areasForImprovement,
    riskFactors
  };
}

function generateSummary(
  scores: { overall: number; thyroid: number; metabolic: number; inflammation: number; nutrients: number },
  patterns: MetabolicPattern[],
  criticalFindings: CriticalFinding[]
): string {
  const overallLevel = scores.overall >= 80 ? 'excellent' : scores.overall >= 60 ? 'good' : scores.overall >= 40 ? 'fair' : 'needs improvement';
  const criticalCount = criticalFindings.filter(f => f.type === 'critical').length;
  const patternCount = patterns.length;

  return `Your metabolic health score is ${scores.overall}/100 (${overallLevel}). ${criticalCount > 0 ? `${criticalCount} critical areas need immediate attention. ` : ''}${patternCount > 0 ? `${patternCount} metabolic patterns detected. ` : ''}Focus on the highest priority recommendations for optimal results.`;
}

function generateOptimization(
  biomarkers: Record<string, BiomarkerAnalysis>,
  patterns: MetabolicPattern[],
  criticalFindings: CriticalFinding[]
) {
  const priority = criticalFindings
    .filter(f => f.type === 'critical')
    .map(f => f.title)
    .slice(0, 3);

  const lifestyle = [
    'Optimize sleep quality and duration',
    'Manage stress through meditation or yoga',
    'Regular moderate exercise and strength training'
  ];

  const nutrition = [
    'Focus on whole foods and eliminate processed foods',
    'Optimize protein intake and meal timing',
    'Include anti-inflammatory foods and omega-3s'
  ];

  const supplementation: string[] = [];
  Object.entries(biomarkers).forEach(([name, analysis]) => {
    if (analysis.status === 'deficient' && analysis.impact > 40) {
      supplementation.push(`Consider ${name} supplementation with proper cofactors`);
    }
  });

  return {
    priority,
    lifestyle,
    nutrition,
    supplementation: supplementation.slice(0, 3)
  };
}
