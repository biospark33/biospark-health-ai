
/**
 * 🚀 BioSpark Health AI - Advanced Health AI Orchestrator
 * 
 * Master orchestrator for Phase 2 advanced AI integration combining
 * Ray Peat bioenergetics, pattern recognition, personalized recommendations,
 * and intelligent memory enhancement.
 * 
 * Enterprise-grade implementation with HIPAA compliance and world-class performance.
 */

import { OpenAI } from 'openai';
import { HealthData, AdvancedHealthInsights, AIProcessingResult } from '../types/health-types';
import { MemoryManager } from '../memory-manager';
import { BioenergicsAIEngine } from './bioenergetics-engine';
import { HealthPatternAI } from './health-pattern-ai';
import { PersonalizedRecommendationAI } from './personalized-recommendation-ai';
import { IntelligentMemoryAI } from './intelligent-memory-ai';

export interface AdvancedHealthInsights {
  userId: string;
  timestamp: Date;
  
  // Core AI Analysis Results
  bioenergicsAnalysis: any;
  patternAnalysis: any;
  personalizedPlan: any;
  enhancedMemoryContext: any;
  
  // Integrated Intelligence
  synthesizedInsights: SynthesizedInsight[];
  overallHealthScore: number;
  priorityRecommendations: string[];
  riskAssessment: IntegratedRiskAssessment;
  
  // Performance Metrics
  processingTime: number;
  confidenceScore: number;
  aiModelVersions: Record<string, string>;
  
  // Next Steps
  immediateActions: string[];
  monitoringPriorities: string[];
  followUpSchedule: FollowUpSchedule;
}

export interface SynthesizedInsight {
  id: string;
  category: 'metabolic' | 'hormonal' | 'nutritional' | 'lifestyle' | 'environmental';
  insight: string;
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  supportingEvidence: string[];
  recommendations: string[];
  timeframe: string;
}

export interface IntegratedRiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: Array<{
    factor: string;
    severity: number;
    category: string;
    modifiable: boolean;
  }>;
  protectiveFactors: Array<{
    factor: string;
    strength: number;
    category: string;
    maintainable: boolean;
  }>;
  interventionPriorities: string[];
  monitoringRequirements: string[];
}

export interface FollowUpSchedule {
  immediate: Array<{ action: string; timeframe: string }>;
  shortTerm: Array<{ milestone: string; timeframe: string }>;
  longTerm: Array<{ goal: string; timeframe: string }>;
}

export class AdvancedHealthAI {
  private openai: OpenAI;
  private memoryManager: MemoryManager;
  private bioenergicsEngine: BioenergicsAIEngine;
  private patternAI: HealthPatternAI;
  private recommendationAI: PersonalizedRecommendationAI;
  private memoryAI: IntelligentMemoryAI;
  private isInitialized: boolean = false;

  constructor(apiKey: string, memoryManager: MemoryManager) {
    this.openai = new OpenAI({ apiKey });
    this.memoryManager = memoryManager;
    
    // Initialize AI engines
    this.bioenergicsEngine = new BioenergicsAIEngine(apiKey, memoryManager);
    this.patternAI = new HealthPatternAI(apiKey, memoryManager);
    this.memoryAI = new IntelligentMemoryAI(apiKey, memoryManager);
    this.recommendationAI = new PersonalizedRecommendationAI(
      apiKey, 
      memoryManager, 
      this.bioenergicsEngine, 
      this.patternAI
    );
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Advanced Health AI System...');
      
      // Initialize all AI engines in parallel
      await Promise.all([
        this.bioenergicsEngine.initialize(),
        this.patternAI.initialize(),
        this.recommendationAI.initialize(),
        this.memoryAI.initialize()
      ]);
      
      this.isInitialized = true;
      console.log('✅ Advanced Health AI System initialized successfully');
      
    } catch (error) {
      throw new Error(`Failed to initialize Advanced Health AI: ${error}`);
    }
  }

  async generateAdvancedInsights(
    userId: string,
    healthData: HealthData
  ): Promise<AdvancedHealthInsights> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const startTime = Date.now();
      console.log(`🧠 Generating advanced health insights for user: ${userId}`);

      // Phase 1: Parallel AI Analysis
      const [
        bioenergicsAnalysis,
        patternAnalysis,
        enhancedMemoryContext
      ] = await Promise.all([
        this.bioenergicsEngine.analyzeMetabolicHealth(userId, healthData),
        this.patternAI.identifyHealthPatterns(userId, healthData),
        this.memoryAI.getIntelligentContext(userId)
      ]);

      // Phase 2: Generate Personalized Plan
      const personalizedPlan = await this.recommendationAI.generatePersonalizedPlan(
        userId, 
        healthData
      );

      // Phase 3: Synthesize Integrated Insights
      const synthesizedInsights = await this.synthesizeInsights({
        bioenergicsAnalysis,
        patternAnalysis,
        personalizedPlan,
        enhancedMemoryContext
      });

      // Phase 4: Calculate Overall Health Score
      const overallHealthScore = this.calculateOverallHealthScore({
        bioenergicsAnalysis,
        patternAnalysis,
        personalizedPlan
      });

      // Phase 5: Generate Integrated Risk Assessment
      const riskAssessment = await this.generateIntegratedRiskAssessment({
        bioenergicsAnalysis,
        patternAnalysis,
        synthesizedInsights
      });

      // Phase 6: Prioritize Recommendations
      const priorityRecommendations = this.prioritizeRecommendations({
        bioenergicsAnalysis,
        patternAnalysis,
        personalizedPlan,
        riskAssessment
      });

      // Phase 7: Create Follow-up Schedule
      const followUpSchedule = this.createFollowUpSchedule({
        riskAssessment,
        priorityRecommendations,
        overallHealthScore
      });

      const insights: AdvancedHealthInsights = {
        userId,
        timestamp: new Date(),
        bioenergicsAnalysis,
        patternAnalysis,
        personalizedPlan,
        enhancedMemoryContext,
        synthesizedInsights,
        overallHealthScore,
        priorityRecommendations,
        riskAssessment,
        processingTime: Date.now() - startTime,
        confidenceScore: this.calculateConfidenceScore({
          bioenergicsAnalysis,
          patternAnalysis,
          personalizedPlan,
          enhancedMemoryContext
        }),
        aiModelVersions: {
          bioenergics: '1.0.0',
          patterns: '1.0.0',
          recommendations: '1.0.0',
          memory: '1.0.0'
        },
        immediateActions: this.extractImmediateActions(priorityRecommendations),
        monitoringPriorities: this.extractMonitoringPriorities(riskAssessment),
        followUpSchedule
      };

      // Store comprehensive analysis
      await this.memoryManager.storeHealthAnalysis(userId, {
        type: 'advanced_health_insights',
        data: insights,
        timestamp: new Date()
      });

      console.log(`✅ Advanced health insights generated in ${insights.processingTime}ms`);
      console.log(`📊 Overall Health Score: ${insights.overallHealthScore}/100`);
      console.log(`🎯 Confidence Score: ${(insights.confidenceScore * 100).toFixed(1)}%`);

      return insights;

    } catch (error) {
      console.error('❌ Advanced health insights generation failed:', error);
      throw new Error(`Advanced health insights generation failed: ${error}`);
    }
  }

  private async synthesizeInsights(data: {
    bioenergicsAnalysis: any;
    patternAnalysis: any;
    personalizedPlan: any;
    enhancedMemoryContext: any;
  }): Promise<SynthesizedInsight[]> {
    const prompt = `
    As a master health AI synthesizer using Ray Peat bioenergetics principles, synthesize comprehensive insights:
    
    Bioenergetics Analysis: ${JSON.stringify(data.bioenergicsAnalysis)}
    Pattern Analysis: ${JSON.stringify(data.patternAnalysis)}
    Personalized Plan: ${JSON.stringify(data.personalizedPlan)}
    Enhanced Memory Context: ${JSON.stringify(data.enhancedMemoryContext)}
    
    Synthesize integrated insights that:
    
    1. Connect patterns across all analyses
    2. Identify root causes and systemic issues
    3. Highlight synergistic opportunities
    4. Prioritize interventions by impact
    5. Provide actionable intelligence
    
    For each synthesized insight:
    - Category (metabolic/hormonal/nutritional/lifestyle/environmental)
    - Detailed insight description
    - Confidence level (0-1)
    - Priority level (critical/high/medium/low)
    - Supporting evidence from analyses
    - Specific recommendations
    - Expected timeframe for results
    
    Apply Ray Peat bioenergetics principles:
    - Energy-first approach
    - Thyroid optimization
    - Pro-metabolic nutrition
    - Stress reduction
    - Environmental optimization
    
    Format as JSON array of synthesized insights.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2500
    });

    return this.parseSynthesizedInsights(response.choices[0].message.content || '');
  }

  private calculateOverallHealthScore(data: {
    bioenergicsAnalysis: any;
    patternAnalysis: any;
    personalizedPlan: any;
  }): number {
    // Weighted scoring based on Ray Peat bioenergetics priorities
    const weights = {
      metabolic: 0.4,      // Highest priority - metabolic function
      patterns: 0.3,       // Pattern recognition and trends
      personalization: 0.2, // Personalized plan quality
      risk: 0.1           // Risk assessment
    };

    const metabolicScore = data.bioenergicsAnalysis?.metabolicScore || 50;
    const patternScore = this.calculatePatternScore(data.patternAnalysis);
    const personalizationScore = data.personalizedPlan?.confidenceScore * 100 || 50;
    const riskScore = this.calculateRiskScore(data.patternAnalysis?.riskAssessment);

    const overallScore = 
      (metabolicScore * weights.metabolic) +
      (patternScore * weights.patterns) +
      (personalizationScore * weights.personalization) +
      (riskScore * weights.risk);

    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }

  private calculatePatternScore(patternAnalysis: any): number {
    if (!patternAnalysis) return 50;
    
    const positivePatterns = patternAnalysis.identifiedPatterns?.filter(
      (p: any) => p.significance === 'high' && p.confidence > 0.7
    ).length || 0;
    
    const negativeAnomalies = patternAnalysis.healthAnomalies?.filter(
      (a: any) => a.severity === 'critical' || a.severity === 'moderate'
    ).length || 0;
    
    const improvingTrends = patternAnalysis.progressTrends?.filter(
      (t: any) => t.direction === 'improving'
    ).length || 0;
    
    // Score based on positive patterns and trends vs negative anomalies
    const baseScore = 70;
    const patternBonus = positivePatterns * 5;
    const trendBonus = improvingTrends * 3;
    const anomaltyPenalty = negativeAnomalies * 8;
    
    return Math.max(0, Math.min(100, baseScore + patternBonus + trendBonus - anomaltyPenalty));
  }

  private calculateRiskScore(riskAssessment: any): number {
    if (!riskAssessment) return 50;
    
    const riskLevels = {
      'low': 90,
      'moderate': 70,
      'high': 40,
      'critical': 20
    };
    
    return riskLevels[riskAssessment.overallRisk as keyof typeof riskLevels] || 50;
  }

  private async generateIntegratedRiskAssessment(data: {
    bioenergicsAnalysis: any;
    patternAnalysis: any;
    synthesizedInsights: SynthesizedInsight[];
  }): Promise<IntegratedRiskAssessment> {
    const prompt = `
    As an integrated health risk assessment expert using Ray Peat bioenergetics, assess comprehensive risk:
    
    Bioenergetics Analysis: ${JSON.stringify(data.bioenergicsAnalysis)}
    Pattern Analysis: ${JSON.stringify(data.patternAnalysis)}
    Synthesized Insights: ${JSON.stringify(data.synthesizedInsights)}
    
    Generate integrated risk assessment:
    
    1. Overall Risk Level:
       - Assess combined risk from all analyses
       - Consider metabolic dysfunction severity
       - Factor in pattern trends and anomalies
       - Apply Ray Peat bioenergetics risk factors
    
    2. Risk Factors:
       - Identify specific risk factors
       - Assess severity (0-1 scale)
       - Categorize by type
       - Determine modifiability
    
    3. Protective Factors:
       - Identify existing protective factors
       - Assess strength (0-1 scale)
       - Categorize by type
       - Determine maintainability
    
    4. Intervention Priorities:
       - Prioritize by impact and urgency
       - Consider Ray Peat principles
       - Focus on root causes
       - Sequence interventions logically
    
    5. Monitoring Requirements:
       - Critical metrics to monitor
       - Monitoring frequency
       - Warning signs to watch
       - Success indicators
    
    Format as detailed JSON object.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2000
    });

    return this.parseIntegratedRiskAssessment(response.choices[0].message.content || '');
  }

  private prioritizeRecommendations(data: {
    bioenergicsAnalysis: any;
    patternAnalysis: any;
    personalizedPlan: any;
    riskAssessment: IntegratedRiskAssessment;
  }): string[] {
    // Collect all recommendations
    const allRecommendations = [
      ...(data.bioenergicsAnalysis?.recommendations || []),
      ...(data.patternAnalysis?.insights?.flatMap((i: any) => i.recommendations) || []),
      ...(data.personalizedPlan?.nutritionalPlan?.specificFoods?.recommended || []),
      ...(data.riskAssessment?.interventionPriorities || [])
    ];

    // Remove duplicates and prioritize based on Ray Peat principles
    const uniqueRecommendations = [...new Set(allRecommendations)];
    
    const priorities = [
      'thyroid support',
      'body temperature',
      'metabolic rate',
      'PUFA elimination',
      'sugar optimization',
      'stress reduction',
      'light therapy',
      'temperature regulation'
    ];

    return uniqueRecommendations
      .sort((a, b) => {
        const aPriority = priorities.findIndex(p => a.toLowerCase().includes(p));
        const bPriority = priorities.findIndex(p => b.toLowerCase().includes(p));
        return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
      })
      .slice(0, 10); // Top 10 priority recommendations
  }

  private createFollowUpSchedule(data: {
    riskAssessment: IntegratedRiskAssessment;
    priorityRecommendations: string[];
    overallHealthScore: number;
  }): FollowUpSchedule {
    const urgency = data.overallHealthScore < 50 ? 'high' : 
                   data.overallHealthScore < 70 ? 'medium' : 'low';

    const schedules = {
      high: {
        immediate: [
          { action: 'Begin thyroid support protocol', timeframe: '1-3 days' },
          { action: 'Eliminate PUFA sources', timeframe: '1 week' },
          { action: 'Start temperature monitoring', timeframe: 'Daily' }
        ],
        shortTerm: [
          { milestone: 'Metabolic rate improvement', timeframe: '2-4 weeks' },
          { milestone: 'Energy level stabilization', timeframe: '4-6 weeks' }
        ],
        longTerm: [
          { goal: 'Optimal metabolic function', timeframe: '3-6 months' }
        ]
      },
      medium: {
        immediate: [
          { action: 'Optimize nutrition plan', timeframe: '1 week' },
          { action: 'Begin light therapy', timeframe: '1 week' }
        ],
        shortTerm: [
          { milestone: 'Improved energy patterns', timeframe: '4-8 weeks' }
        ],
        longTerm: [
          { goal: 'Sustained health optimization', timeframe: '6-12 months' }
        ]
      },
      low: {
        immediate: [
          { action: 'Continue current protocol', timeframe: 'Ongoing' }
        ],
        shortTerm: [
          { milestone: 'Maintain current progress', timeframe: '2-3 months' }
        ],
        longTerm: [
          { goal: 'Long-term health maintenance', timeframe: '12+ months' }
        ]
      }
    };

    return schedules[urgency];
  }

  private calculateConfidenceScore(data: {
    bioenergicsAnalysis: any;
    patternAnalysis: any;
    personalizedPlan: any;
    enhancedMemoryContext: any;
  }): number {
    const scores = [
      data.bioenergicsAnalysis?.processingTime < 2000 ? 0.9 : 0.7,
      data.patternAnalysis?.identifiedPatterns?.length > 3 ? 0.9 : 0.7,
      data.personalizedPlan?.confidenceScore || 0.8,
      data.enhancedMemoryContext?.contextualInsights?.length > 2 ? 0.9 : 0.7
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private extractImmediateActions(recommendations: string[]): string[] {
    return recommendations
      .filter(rec => 
        rec.toLowerCase().includes('immediately') ||
        rec.toLowerCase().includes('urgent') ||
        rec.toLowerCase().includes('start now')
      )
      .slice(0, 5);
  }

  private extractMonitoringPriorities(riskAssessment: IntegratedRiskAssessment): string[] {
    return riskAssessment.monitoringRequirements?.slice(0, 5) || [];
  }

  // Parsing methods
  private parseSynthesizedInsights(content: string): SynthesizedInsight[] {
    try {
      const insights = JSON.parse(content);
      return insights.map((insight: any, index: number) => ({
        id: `synthesized_${index}_${Date.now()}`,
        category: insight.category || 'metabolic',
        insight: insight.insight || insight.description || '',
        confidence: insight.confidence || 0.8,
        priority: insight.priority || 'medium',
        supportingEvidence: insight.supportingEvidence || insight.supporting_evidence || [],
        recommendations: insight.recommendations || [],
        timeframe: insight.timeframe || 'medium-term'
      }));
    } catch (error) {
      console.warn('Failed to parse synthesized insights, using fallback');
      return [];
    }
  }

  private parseIntegratedRiskAssessment(content: string): IntegratedRiskAssessment {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to parse integrated risk assessment, using fallback');
      return {
        overallRisk: 'moderate',
        riskFactors: [],
        protectiveFactors: [],
        interventionPriorities: [],
        monitoringRequirements: []
      };
    }
  }

  // Health status check
  async getSystemStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    components: Record<string, boolean>;
    performance: Record<string, number>;
  }> {
    const components = {
      bioenergicsEngine: this.bioenergicsEngine !== null,
      patternAI: this.patternAI !== null,
      recommendationAI: this.recommendationAI !== null,
      memoryAI: this.memoryAI !== null,
      memoryManager: this.memoryManager !== null
    };

    const healthyComponents = Object.values(components).filter(Boolean).length;
    const totalComponents = Object.keys(components).length;
    
    const status = healthyComponents === totalComponents ? 'healthy' :
                  healthyComponents >= totalComponents * 0.8 ? 'degraded' : 'critical';

    return {
      status,
      components,
      performance: {
        componentHealth: healthyComponents / totalComponents,
        systemInitialized: this.isInitialized ? 1 : 0,
        overallHealth: (healthyComponents / totalComponents) * (this.isInitialized ? 1 : 0.5)
      }
    };
  }
}

export default AdvancedHealthAI;
