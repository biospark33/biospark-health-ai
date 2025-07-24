
/**
 * 🏥 BioSpark Health AI - Health Data Types
 * 
 * Comprehensive type definitions for health data, AI analysis,
 * and Ray Peat bioenergetics integration.
 * 
 * Enterprise-grade TypeScript definitions with HIPAA compliance.
 */

// Core Health Data Types
export interface HealthData {
  userId: string;
  timestamp: Date;
  
  // Basic Demographics
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  
  // Vital Signs
  bodyTemperature?: number; // Fahrenheit
  pulseRate?: number; // bpm
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  respiratoryRate?: number;
  
  // Lab Results
  labResults?: {
    thyroid?: {
      tsh?: number;
      t3?: number;
      t4?: number;
      reverseT3?: number;
      freeT3?: number;
      freeT4?: number;
    };
    metabolic?: {
      glucose?: number;
      hba1c?: number;
      insulin?: number;
      cholesterol?: number;
      triglycerides?: number;
    };
    hormonal?: {
      cortisol?: number;
      progesterone?: number;
      estrogen?: number;
      testosterone?: number;
      prolactin?: number;
    };
    nutritional?: {
      vitaminD?: number;
      b12?: number;
      folate?: number;
      iron?: number;
      ferritin?: number;
    };
  };
  
  // Symptoms and Subjective Data
  symptoms?: string[];
  energyLevel?: number; // 1-10 scale
  moodRating?: number; // 1-10 scale
  sleepQuality?: number; // 1-10 scale
  stressLevel?: number; // 1-10 scale
  exerciseTolerance?: number; // 1-10 scale
  
  // Lifestyle Data
  diet?: {
    macronutrients?: {
      carbohydrates?: number;
      proteins?: number;
      fats?: number;
    };
    foodTypes?: string[];
    restrictions?: string[];
    supplements?: string[];
  };
  
  exercise?: {
    type?: string[];
    frequency?: number; // per week
    duration?: number; // minutes
    intensity?: 'low' | 'moderate' | 'high';
  };
  
  sleep?: {
    duration?: number; // hours
    bedtime?: string;
    wakeTime?: string;
    quality?: number; // 1-10 scale
  };
  
  // Environmental Factors
  environment?: {
    lightExposure?: string[];
    temperature?: number;
    stressors?: string[];
    toxinExposure?: string[];
  };
  
  // Medical History
  medicalHistory?: {
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    surgeries?: string[];
    familyHistory?: string[];
  };
}

// Bioenergetics Analysis Types
export interface BioenergicsAnalysis {
  userId: string;
  timestamp: Date;
  metabolicScore: number; // 0-100
  
  thyroidFunction: {
    t3Level: number;
    t4Level: number;
    tshLevel: number;
    reverseT3: number;
    bodyTemperature: number;
    pulseRate: number;
    metabolicRate: number;
    recommendations: string[];
  };
  
  glucoseMetabolism: {
    fastingGlucose: number;
    postprandialGlucose: number;
    hba1c: number;
    insulinSensitivity: number;
    glucoseVariability: number;
    recommendations: string[];
  };
  
  mitochondrialFunction: {
    energyProduction: number;
    oxidativeStress: number;
    respiratoryCapacity: number;
    lactateLevel: number;
    co2Level: number;
    recommendations: string[];
  };
  
  hormonalBalance: {
    cortisol: number;
    progesterone: number;
    estrogen: number;
    testosterone: number;
    prolactin: number;
    recommendations: string[];
  };
  
  recommendations: string[];
  interventions: string[];
  monitoringPlan: any;
  processingTime: number;
}

// Health Pattern Analysis Types
export interface HealthPatternAnalysis {
  userId: string;
  timestamp: Date;
  identifiedPatterns: HealthPattern[];
  healthAnomalies: HealthAnomaly[];
  progressTrends: HealthTrend[];
  riskAssessment: RiskAssessment;
  insights: PatternInsight[];
  processingTime: number;
}

export interface HealthPattern {
  id: string;
  type: 'metabolic' | 'hormonal' | 'nutritional' | 'environmental' | 'lifestyle';
  pattern: string;
  confidence: number;
  significance: 'high' | 'medium' | 'low';
  timeframe: string;
  recommendations: string[];
}

export interface HealthAnomaly {
  id: string;
  type: 'lab_value' | 'symptom' | 'trend' | 'correlation';
  description: string;
  severity: 'critical' | 'moderate' | 'mild';
  confidence: number;
  recommendations: string[];
}

export interface HealthTrend {
  id: string;
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  rate: number;
  confidence: number;
  timeframe: string;
  projectedOutcome: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  monitoringPriority: string[];
}

export interface PatternInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
}

// Personalized Health Plan Types
export interface PersonalizedHealthPlan {
  userId: string;
  timestamp: Date;
  nutritionalPlan: NutritionalPlan;
  lifestyleRecommendations: LifestyleRecommendations;
  supplementProtocol: SupplementProtocol;
  monitoringSchedule: MonitoringSchedule;
  progressMilestones: ProgressMilestones;
  personalizationFactors: string[];
  confidenceScore: number;
  processingTime: number;
}

export interface NutritionalPlan {
  macronutrientTargets: {
    carbohydrates: { grams: number; percentage: number; sources: string[] };
    proteins: { grams: number; percentage: number; sources: string[] };
    fats: { grams: number; percentage: number; sources: string[] };
  };
  mealTiming: {
    frequency: number;
    timing: string[];
    recommendations: string[];
  };
  specificFoods: {
    recommended: string[];
    avoid: string[];
    prioritize: string[];
  };
  hydration: {
    dailyTarget: number;
    sources: string[];
    timing: string[];
  };
}

export interface LifestyleRecommendations {
  sleep: {
    targetHours: number;
    bedtime: string;
    wakeTime: string;
    optimizations: string[];
  };
  exercise: {
    type: string[];
    frequency: number;
    duration: number;
    intensity: string;
    recommendations: string[];
  };
  stressManagement: {
    techniques: string[];
    frequency: string;
    duration: number;
    priorities: string[];
  };
  environment: {
    lightTherapy: string[];
    temperature: string[];
    airQuality: string[];
    toxinAvoidance: string[];
  };
}

export interface SupplementProtocol {
  core: Array<{
    name: string;
    dosage: string;
    timing: string;
    purpose: string;
    duration: string;
  }>;
  conditional: Array<{
    name: string;
    dosage: string;
    timing: string;
    purpose: string;
    condition: string;
  }>;
  monitoring: string[];
  interactions: string[];
}

export interface MonitoringSchedule {
  daily: Array<{
    metric: string;
    method: string;
    target: string;
    notes: string;
  }>;
  weekly: Array<{
    metric: string;
    method: string;
    target: string;
    notes: string;
  }>;
  monthly: Array<{
    metric: string;
    method: string;
    target: string;
    notes: string;
  }>;
  quarterly: Array<{
    metric: string;
    method: string;
    target: string;
    notes: string;
  }>;
}

export interface ProgressMilestones {
  shortTerm: Array<{
    milestone: string;
    timeframe: string;
    metrics: string[];
    success_criteria: string;
  }>;
  mediumTerm: Array<{
    milestone: string;
    timeframe: string;
    metrics: string[];
    success_criteria: string;
  }>;
  longTerm: Array<{
    milestone: string;
    timeframe: string;
    metrics: string[];
    success_criteria: string;
  }>;
}

// User Profile Types
export interface UserProfile {
  userId: string;
  age: number;
  gender: string;
  healthGoals: string[];
  preferences: Record<string, any>;
  restrictions: string[];
  currentMedications: string[];
  allergies: string[];
  lifestyle: Record<string, any>;
}

// Health Assessment Types
export interface HealthAssessment {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'initial' | 'follow_up' | 'comprehensive' | 'targeted';
  data: HealthData;
  analysis: BioenergicsAnalysis;
  recommendations: string[];
  followUpDate?: Date;
}

// Health Insights Types
export interface HealthInsights {
  userId: string;
  timestamp: Date;
  insights: Array<{
    category: string;
    insight: string;
    confidence: number;
    actionable: boolean;
    recommendations: string[];
  }>;
  overallScore: number;
  keyFindings: string[];
  nextSteps: string[];
}

// Advanced AI Types
export interface AIProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  confidence: number;
  recommendations: string[];
}

export interface MetabolicProfile {
  userId: string;
  timestamp: Date;
  metabolicRate: number;
  thyroidFunction: number;
  glucoseMetabolism: number;
  mitochondrialHealth: number;
  hormonalBalance: number;
  overallScore: number;
  recommendations: string[];
}

// Export all types
export type {
  // Core types already exported above
};
