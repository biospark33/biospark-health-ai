// Health AI System Types
export interface HealthAssessment {
  id: string;
  userId: string;
  assessmentType: string;
  status: string;
  overallScore: number;
  energyLevel: number;
  metabolicHealth: number;
  stressLevel: number;
  thyroidFunction: number;
  mitochondrialHealth: number;
  hormonalBalance: number;
  inflammationLevel: number;
  keyFindings: KeyFinding[];
  detailedInsights: DetailedInsight[];
  comprehensiveData: ComprehensiveData;
  immediateActions: ImmediateAction[];
  recommendations: Recommendation[];
  viewCount: number;
  timeSpent: number;
  layerProgress: LayerProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyFinding {
  id: string;
  title: string;
  severity: 'optimal' | 'good' | 'concerning' | 'critical';
  icon: string;
  summary: string;
  value?: number;
  unit?: string;
  trend?: 'improving' | 'stable' | 'declining';
}

export interface DetailedInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  rayPeatContext?: string;
  significance: string;
  relatedBiomarkers: string[];
  actionItems: string[];
  curiosityGap?: string;
}

export interface ComprehensiveData {
  fullAnalysis: string;
  researchReferences: ResearchReference[];
  technicalDetails: TechnicalDetail[];
  biomarkerCorrelations: BiomarkerCorrelation[];
  historicalTrends: HistoricalTrend[];
}

export interface ResearchReference {
  id: string;
  title: string;
  author: string;
  year: number;
  url?: string;
  relevance: string;
}

export interface TechnicalDetail {
  parameter: string;
  value: number;
  unit: string;
  methodology: string;
  confidence: number;
}

export interface BiomarkerCorrelation {
  biomarker1: string;
  biomarker2: string;
  correlation: number;
  significance: string;
}

export interface HistoricalTrend {
  date: Date;
  metric: string;
  value: number;
  unit: string;
}

export interface ImmediateAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  timeframe: string;
  category: string;
  icon: string;
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  evidence: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  timeline: string;
  expectedOutcome: string;
}

export interface LayerProgress {
  layer1Viewed: boolean;
  layer2Viewed: boolean;
  layer3Viewed: boolean;
  layer1TimeSpent: number;
  layer2TimeSpent: number;
  layer3TimeSpent: number;
  expandedCards: string[];
  downloadedPDF: boolean;
  bookedConsultation: boolean;
}

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  status: 'optimal' | 'suboptimal' | 'concerning' | 'critical';
  trend?: 'improving' | 'stable' | 'declining';
  optimalMin?: number;
  optimalMax?: number;
  normalMin?: number;
  normalMax?: number;
  rayPeatContext?: string;
  significance?: string;
  testDate: Date;
  labProvider?: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  category: string;
  points: number;
  earnedAt?: Date;
}

export interface Consultation {
  id: string;
  type: string;
  status: string;
  requestedDate?: Date;
  scheduledDate?: Date;
  duration: number;
  concerns?: string;
  priority: string;
  notes?: string;
  recommendations?: string;
}

// Progressive Disclosure Layer Types
export interface HealthSnapshot {
  overallScore: number;
  keyFindings: KeyFinding[];
  immediateActions: ImmediateAction[];
  quickStats: QuickStat[];
}

export interface QuickStat {
  label: string;
  value: string;
  status: 'optimal' | 'good' | 'concerning' | 'critical';
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

// UI Component Types
export interface ExpandableCardProps {
  title: string;
  severity: 'optimal' | 'good' | 'concerning' | 'critical';
  icon: string;
  summary: string;
  children: React.ReactNode;
  onExpand?: () => void;
  className?: string;
}

export interface SmartTooltipProps {
  term: string;
  definition: string;
  rayPeatContext?: string;
  children: React.ReactNode;
  className?: string;
}

export interface InteractiveChartProps {
  data: any[];
  type: 'line' | 'bar' | 'area' | 'scatter';
  title: string;
  xKey: string;
  yKey: string;
  className?: string;
  onDataPointClick?: (data: any) => void;
}

export interface ProgressiveDisclosureProps {
  assessment: HealthAssessment;
  onLayerChange?: (layer: 1 | 2 | 3) => void;
  onTimeSpentUpdate?: (timeSpent: number) => void;
}

// Biomarker Analysis Types
export interface BiomarkerData {
  [key: string]: number;
}

export interface OptimalRange {
  min: number;
  max: number;
  unit: string;
  description: string;
}

export interface BiomarkerAnalysis {
  value: number;
  status: 'optimal' | 'suboptimal' | 'concerning' | 'critical' | 'deficient' | 'excessive';
  deviation?: number;
  interpretation?: string;
  recommendations: string[];
  rayPeatContext?: string;
  impact: number;
  severity: 'low' | 'moderate' | 'high' | 'critical' | 'medium';
  optimal: OptimalRange;
}

export interface MetabolicPattern {
  name?: string;
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  confidence: number;
  indicators: string[];
  biomarkers?: string[];
  description: string;
  recommendations: string[];
  priority?: string;
}

export interface CriticalFinding {
  biomarker?: string;
  value?: number;
  severity: 'high' | 'critical' | 'low' | 'moderate' | 'medium';
  description: string;
  immediateAction?: string;
  type?: string;
  title?: string;
  impact?: number;
  recommendations?: string[];
  priority?: number;
  biomarkers?: string[];
}

export interface AnalysisResults {
  metabolicScore: number;
  thyroidScore: number;
  metabolicHealth: string | number;
  inflammation: string | number;
  nutrients: string | number;
  biomarkers: Record<string, BiomarkerAnalysis>;
  patterns: MetabolicPattern[];
  criticalFindings: CriticalFinding[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  summary?: string;
  optimization?: any;
}