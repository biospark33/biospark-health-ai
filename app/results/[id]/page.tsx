
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Share2, 
  TrendingUp, 
  Activity, 
  Brain,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AnalysisResult {
  id: string;
  timestamp: string;
  type: 'comprehensive' | 'memory-enhanced' | 'file-upload';
  status: 'completed' | 'processing' | 'failed';
  user_info: {
    email: string;
    initials: string;
    age: number;
    city: string;
  };
  analysis: {
    summary: string;
    detailed_analysis: string;
    ray_peat_insights: string;
    recommendations: string[];
    risk_factors: string[];
    positive_indicators: string[];
  };
  biomarkers: Array<{
    name: string;
    value: number;
    unit: string;
    reference_range: string;
    status: 'normal' | 'high' | 'low' | 'optimal';
    ray_peat_interpretation: string;
  }>;
  memory_context?: {
    sessions_used: number;
    historical_data_points: number;
    personalization_level: string;
  };
  next_steps: string[];
}

export default function ResultsPage() {
  const params = useParams();
  const analysisId = params.id as string;
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (analysisId) {
      loadAnalysisResult();
    }
  }, [analysisId]);

  const loadAnalysisResult = async () => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}`);
      
      if (!response.ok) {
        throw new Error('Analysis not found');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'optimal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'high':
      case 'low':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const reportContent = `
HEALTH ANALYSIS REPORT
Generated: ${new Date(result.timestamp).toLocaleDateString()}
Analysis ID: ${result.id}

PATIENT INFORMATION
Name: ${result.user_info.initials}
Age: ${result.user_info.age}
Location: ${result.user_info.city}
Email: ${result.user_info.email}

ANALYSIS SUMMARY
${result.analysis.summary}

DETAILED ANALYSIS
${result.analysis.detailed_analysis}

RAY PEAT INSIGHTS
${result.analysis.ray_peat_insights}

BIOMARKERS
${result.biomarkers.map(b => 
  `${b.name}: ${b.value} ${b.unit} (${b.status.toUpperCase()}) - ${b.ray_peat_interpretation}`
).join('\n')}

RECOMMENDATIONS
${result.analysis.recommendations.map(r => `• ${r}`).join('\n')}

NEXT STEPS
${result.next_steps.map(s => `• ${s}`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-analysis-${result.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'Health Analysis Results',
          text: `My health analysis results from ${new Date(result.timestamp).toLocaleDateString()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested analysis could not be found.'}</p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analysis Results
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(result.timestamp).toLocaleDateString()}
            </span>
            <Badge variant="outline">
              {result.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge className={getStatusColor(result.status)}>
              {result.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed">{result.analysis.summary}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Positive Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.analysis.positive_indicators.map((indicator, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.analysis.risk_factors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="biomarkers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Biomarker Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.biomarkers.map((biomarker, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(biomarker.status)}
                        <h3 className="font-semibold text-lg">{biomarker.name}</h3>
                        <Badge className={getStatusColor(biomarker.status)}>
                          {biomarker.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {biomarker.value} {biomarker.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Ref: {biomarker.reference_range}
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-1">Ray Peat Interpretation:</h4>
                      <p className="text-sm text-blue-800">{biomarker.ray_peat_interpretation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {result.analysis.detailed_analysis}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  Ray Peat Bioenergetic Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-purple-50 p-4 rounded-md">
                    {result.analysis.ray_peat_insights}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Immediate Actions:</h3>
                <div className="space-y-3">
                  {result.analysis.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-green-50 border-l-4 border-green-400 rounded-r-md">
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Next Steps:</h3>
                <div className="space-y-3">
                  {result.next_steps.map((step, index) => (
                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Analysis Context & Memory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {result.user_info.initials}
                  </div>
                  <div className="text-sm text-gray-600">Patient</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {result.user_info.age}
                  </div>
                  <div className="text-sm text-gray-600">Age</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {result.user_info.city}
                  </div>
                  <div className="text-sm text-gray-600">Location</div>
                </div>
              </div>

              {result.memory_context && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-3">Memory Enhancement Details:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Sessions Used:</span>
                      <div className="text-lg font-bold text-purple-700">
                        {result.memory_context.sessions_used}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Historical Data Points:</span>
                      <div className="text-lg font-bold text-purple-700">
                        {result.memory_context.historical_data_points}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Personalization Level:</span>
                      <div className="text-lg font-bold text-purple-700">
                        {result.memory_context.personalization_level}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Analysis Metadata:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>Analysis ID: {result.id}</div>
                  <div>Generated: {new Date(result.timestamp).toLocaleString()}</div>
                  <div>Type: {result.type}</div>
                  <div>Biomarkers Analyzed: {result.biomarkers.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Link href="/dashboard">
          <Button variant="outline" className="mr-4">
            Return to Dashboard
          </Button>
        </Link>
        <Link href="/assessment">
          <Button>
            New Analysis
          </Button>
        </Link>
      </div>
    </div>
  );
}
