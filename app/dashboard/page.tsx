
'use client';

import { Suspense } from 'react';
import { ProgressiveDisclosure } from '@/components/health/progressive-disclosure';
import { HealthAssessment } from '@/lib/types';
import { Activity, Zap, Heart, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

// Mock data for demonstration
const mockAssessment: HealthAssessment = {
  id: 'assessment-1',
  userId: 'user-1',
  assessmentType: 'bioenergetic',
  status: 'active',
  overallScore: 78,
  energyLevel: 85,
  metabolicHealth: 72,
  stressLevel: 35,
  thyroidFunction: 88,
  mitochondrialHealth: 75,
  hormonalBalance: 70,
  inflammationLevel: 40,
  keyFindings: [
    {
      id: 'finding-1',
      title: 'Optimal Thyroid Function',
      severity: 'optimal',
      icon: '✨',
      summary: 'Your thyroid markers indicate excellent metabolic efficiency and energy production capacity.',
      value: 88,
      unit: '%',
      trend: 'improving'
    },
    {
      id: 'finding-2',
      title: 'Elevated Stress Markers',
      severity: 'concerning',
      icon: '⚠️',
      summary: 'Cortisol levels suggest chronic stress response. This may be impacting your sleep quality and recovery.',
      value: 35,
      unit: 'ng/mL',
      trend: 'stable'
    },
    {
      id: 'finding-3',
      title: 'Strong Metabolic Flexibility',
      severity: 'good',
      icon: '🔥',
      summary: 'Your body efficiently switches between glucose and fat metabolism, indicating good mitochondrial health.',
      value: 72,
      unit: '%',
      trend: 'improving'
    }
  ],
  detailedInsights: [
    {
      id: 'insight-1',
      category: 'metabolic',
      title: 'Mitochondrial Energy Production',
      description: 'Your cellular energy production is functioning well, with strong ATP synthesis capacity. This indicates healthy mitochondrial function and efficient nutrient utilization.',
      rayPeatContext: 'According to Ray Peat, optimal mitochondrial function requires adequate thyroid hormones, B vitamins, and magnesium. Your results suggest these systems are well-balanced.',
      significance: 'Strong mitochondrial function correlates with longevity, mental clarity, and physical resilience. This is a key indicator of overall health.',
      relatedBiomarkers: ['ATP synthesis', 'Oxygen consumption', 'Lactate levels'],
      actionItems: [
        'Continue current nutrition and exercise routine',
        'Consider adding CoQ10 supplementation',
        'Monitor sleep quality for optimal recovery'
      ],
      curiosityGap: 'Did you know that mitochondria contain their own DNA and can multiply when energy demands increase?'
    },
    {
      id: 'insight-2',
      category: 'hormonal',
      title: 'Thyroid Hormone Optimization',
      description: 'Your thyroid function shows excellent T3/T4 conversion rates and proper hormone utilization at the cellular level.',
      rayPeatContext: 'Ray Peat emphasized that optimal thyroid function requires not just adequate hormone production, but proper conversion of T4 to T3 and cellular uptake.',
      significance: 'Optimal thyroid function is the foundation of metabolic health, affecting everything from body temperature to cognitive function.',
      relatedBiomarkers: ['TSH', 'Free T3', 'Free T4', 'Reverse T3'],
      actionItems: [
        'Maintain adequate selenium intake',
        'Continue stress management practices',
        'Monitor body temperature trends'
      ]
    },
    {
      id: 'insight-3',
      category: 'inflammatory',
      title: 'Inflammatory Balance',
      description: 'Your inflammatory markers show moderate elevation, suggesting the need for targeted anti-inflammatory interventions.',
      significance: 'Chronic low-grade inflammation can impact energy production and accelerate aging processes.',
      relatedBiomarkers: ['CRP', 'IL-6', 'TNF-alpha'],
      actionItems: [
        'Increase omega-3 fatty acid intake',
        'Consider curcumin supplementation',
        'Evaluate sleep quality and duration'
      ],
      curiosityGap: 'Inflammation can actually be beneficial in small doses - it\'s how your body repairs and adapts to stress!'
    }
  ],
  comprehensiveData: {
    fullAnalysis: `Your bioenergetic assessment reveals a metabolically healthy individual with excellent thyroid function and strong mitochondrial capacity. The key area for optimization is stress management, which appears to be creating a cascade of inflammatory responses that could impact long-term health outcomes.

Your thyroid function is exceptional, with optimal T3/T4 conversion rates indicating efficient metabolic processes. This is particularly important as thyroid hormones are the master regulators of cellular metabolism and energy production.

The mitochondrial health markers suggest your cells are efficiently producing ATP and managing oxidative stress. This is crucial for maintaining energy levels and supporting cellular repair processes.

However, the elevated stress markers indicate that your hypothalamic-pituitary-adrenal (HPA) axis is under chronic activation. This can lead to disrupted sleep patterns, impaired recovery, and increased inflammation over time.

The inflammatory markers show moderate elevation, which is consistent with chronic stress exposure. This suggests that while your metabolic machinery is functioning well, the stress response is creating downstream effects that could impact optimal health.

Recommendations focus on stress management techniques, sleep optimization, and targeted nutritional interventions to support your already strong metabolic foundation.`,
    researchReferences: [
      {
        id: 'ref-1',
        title: 'Thyroid Hormone Action on Mitochondria',
        author: 'Harper ME, Seifert EL',
        year: 2008,
        url: 'https://example.com/thyroid-mitochondria',
        relevance: 'Demonstrates the direct relationship between thyroid hormones and mitochondrial biogenesis'
      },
      {
        id: 'ref-2',
        title: 'Stress-Induced Inflammation and Metabolic Dysfunction',
        author: 'Rohleder N',
        year: 2014,
        url: 'https://example.com/stress-inflammation',
        relevance: 'Shows how chronic stress leads to inflammatory responses and metabolic disruption'
      },
      {
        id: 'ref-3',
        title: 'Bioenergetic Health Index and Longevity',
        author: 'Gonzalez-Freire M, et al.',
        year: 2018,
        url: 'https://example.com/bioenergetic-longevity',
        relevance: 'Establishes the connection between mitochondrial function and healthy aging'
      }
    ],
    technicalDetails: [
      {
        parameter: 'ATP/ADP Ratio',
        value: 2.8,
        unit: 'ratio',
        methodology: 'HPLC analysis of cellular nucleotides',
        confidence: 92
      },
      {
        parameter: 'Mitochondrial Membrane Potential',
        value: 145,
        unit: 'mV',
        methodology: 'Fluorescence-based measurement',
        confidence: 88
      },
      {
        parameter: 'Oxygen Consumption Rate',
        value: 82,
        unit: 'pmol/min/µg',
        methodology: 'Seahorse XF analyzer',
        confidence: 95
      },
      {
        parameter: 'Cortisol Awakening Response',
        value: 18.5,
        unit: 'nmol/L',
        methodology: 'Saliva cortisol immunoassay',
        confidence: 90
      }
    ],
    biomarkerCorrelations: [
      {
        biomarker1: 'T3',
        biomarker2: 'ATP Production',
        correlation: 0.78,
        significance: 'Strong positive correlation indicating efficient thyroid-mediated energy production'
      },
      {
        biomarker1: 'Cortisol',
        biomarker2: 'Inflammatory Markers',
        correlation: 0.65,
        significance: 'Moderate positive correlation showing stress-induced inflammation'
      },
      {
        biomarker1: 'Mitochondrial Function',
        biomarker2: 'Energy Levels',
        correlation: 0.82,
        significance: 'Very strong correlation between cellular energy production and subjective energy'
      }
    ],
    historicalTrends: [
      {
        date: new Date('2024-01-01'),
        metric: 'Overall Health Score',
        value: 72,
        unit: '%'
      },
      {
        date: new Date('2024-02-01'),
        metric: 'Overall Health Score',
        value: 75,
        unit: '%'
      },
      {
        date: new Date('2024-03-01'),
        metric: 'Overall Health Score',
        value: 78,
        unit: '%'
      }
    ]
  },
  immediateActions: [
    {
      id: 'action-1',
      priority: 'high',
      action: 'Implement stress management routine',
      timeframe: 'This week',
      category: 'lifestyle',
      icon: 'alert'
    },
    {
      id: 'action-2',
      priority: 'medium',
      action: 'Optimize sleep schedule',
      timeframe: 'Next 2 weeks',
      category: 'recovery',
      icon: 'clock'
    },
    {
      id: 'action-3',
      priority: 'low',
      action: 'Consider magnesium supplementation',
      timeframe: 'This month',
      category: 'nutrition',
      icon: 'check'
    }
  ],
  recommendations: [
    {
      id: 'rec-1',
      category: 'stress',
      title: 'Stress Management Protocol',
      description: 'Implement daily meditation, breathing exercises, and regular stress-reduction activities',
      evidence: 'Multiple studies show that consistent stress management can reduce cortisol levels by 20-30%',
      difficulty: 'moderate',
      timeline: '2-4 weeks',
      expectedOutcome: 'Reduced inflammation markers and improved energy levels'
    }
  ],
  viewCount: 0,
  timeSpent: 0,
  layerProgress: {
    layer1Viewed: false,
    layer2Viewed: false,
    layer3Viewed: false,
    layer1TimeSpent: 0,
    layer2TimeSpent: 0,
    layer3TimeSpent: 0,
    expandedCards: [],
    downloadedPDF: false,
    bookedConsultation: false
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15')
};

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Loading your health assessment...</p>
      </div>
    </div>
  );
}

function DashboardContent() {
  const handleLayerChange = (layer: 1 | 2 | 3) => {
    console.log(`Layer changed to: ${layer}`);
  };

  const handleTimeSpentUpdate = (timeSpent: number) => {
    console.log(`Time spent: ${timeSpent}ms`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Health AI Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Your personalized bioenergetic assessment
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Assessment Complete
                </p>
                <p className="text-xs text-gray-500">
                  {mockAssessment.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <ProgressiveDisclosure
          assessment={mockAssessment}
          onLayerChange={handleLayerChange}
          onTimeSpentUpdate={handleTimeSpentUpdate}
        />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}
