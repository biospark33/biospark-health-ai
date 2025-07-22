
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Clock, User, Activity, Lightbulb } from 'lucide-react';

interface LabData {
  [key: string]: number | string;
}

interface MemoryContext {
  health_journey_entries: number;
  memory_entries: number;
  contextual_insights: boolean;
}

interface HealthTrend {
  value: number;
  interpretation: string;
  recommendations: string;
  timestamp: string;
  metadata: any;
}

interface MemoryEnhancedResponse {
  analysis: string;
  sources: Array<{
    content: string;
    metadata: any;
  }>;
  context_used: MemoryContext;
  personalized: boolean;
  session_id: string;
  recommendations: string[];
  health_trends?: { [key: string]: HealthTrend[] };
}

interface HealthJourney {
  user_id: string;
  period_days: number;
  trends: { [key: string]: HealthTrend[] };
  generated_at: string;
}

export default function MemoryEnhancedAnalysis() {
  const [userId, setUserId] = useState('user-demo-001');
  const [sessionId, setSessionId] = useState('');
  const [query, setQuery] = useState('');
  const [labData, setLabData] = useState<LabData>({});
  const [labDataInput, setLabDataInput] = useState('');
  const [response, setResponse] = useState<MemoryEnhancedResponse | null>(null);
  const [healthJourney, setHealthJourney] = useState<HealthJourney | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Create a session on component mount
    createSession();
  }, []);

  const createSession = async () => {
    try {
      const res = await fetch('/api/memory/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session_id);
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const parseLabData = (input: string): LabData => {
    const data: LabData = {};
    const lines = input.split('\n');
    
    for (const line of lines) {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        const numValue = parseFloat(value);
        data[key] = isNaN(numValue) ? value : numValue;
      }
    }
    
    return data;
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const parsedLabData = parseLabData(labDataInput);
      setLabData(parsedLabData);

      const res = await fetch('/api/memory/analyze-with-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          query,
          lab_data: parsedLabData,
          include_context: true
        })
      });

      if (!res.ok) {
        throw new Error(`Analysis failed: ${res.statusText}`);
      }

      const data: MemoryEnhancedResponse = await res.json();
      setResponse(data);

      // Update session ID if it changed
      if (data.session_id !== sessionId) {
        setSessionId(data.session_id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthJourney = async () => {
    try {
      const res = await fetch(`/api/memory/health-journey/${userId}?days=30`);
      if (res.ok) {
        const data: HealthJourney = await res.json();
        setHealthJourney(data);
      }
    } catch (err) {
      console.error('Failed to load health journey:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Memory-Enhanced Ray Peat Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Contextual health analysis with personal history and Ray Peat bioenergetic insights
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">User ID</label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Session ID</label>
              <Input
                value={sessionId}
                readOnly
                placeholder="Auto-generated"
                className="bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Query</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your health data with Ray Peat context..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Lab Data (key: value format, one per line)
            </label>
            <Textarea
              value={labDataInput}
              onChange={(e) => setLabDataInput(e.target.value)}
              placeholder="TSH: 2.5&#10;T3: 3.2&#10;T4: 8.1&#10;Glucose: 95"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={loading} className="flex-1">
              {loading ? 'Analyzing...' : 'Analyze with Memory'}
            </Button>
            <Button onClick={loadHealthJourney} variant="outline">
              Load Health Journey
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {response && (
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="context">Context Used</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Ray Peat Analysis
                  {response.personalized && (
                    <Badge variant="secondary" className="ml-2">
                      <User className="h-3 w-3 mr-1" />
                      Personalized
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                    {response.analysis}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="context">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Context Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {response.context_used.health_journey_entries}
                    </div>
                    <div className="text-sm text-gray-600">Health Journey Entries</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {response.context_used.memory_entries}
                    </div>
                    <div className="text-sm text-gray-600">Memory Entries</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {response.context_used.contextual_insights ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-gray-600">Contextual Insights</div>
                  </div>
                </div>

                {response.health_trends && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Health Trends Used
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(response.health_trends).map(([biomarker, trends]) => (
                        <div key={biomarker} className="border rounded-lg p-3">
                          <h4 className="font-medium">{biomarker}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {trends.length} measurements, latest: {trends[trends.length - 1]?.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response.recommendations.length > 0 ? (
                  <div className="space-y-2">
                    {response.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
                        {rec}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specific recommendations extracted.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Ray Peat Knowledge Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {response.sources.length > 0 ? (
                  <div className="space-y-3">
                    {response.sources.map((source, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-2">
                          Source {index + 1}
                        </div>
                        <div className="text-sm">
                          {source.content.substring(0, 200)}...
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No sources available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {healthJourney && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Health Journey ({healthJourney.period_days} days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(healthJourney.trends).map(([biomarker, trends]) => (
                <div key={biomarker} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{biomarker}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {trends.length} measurements
                  </div>
                  {trends.length > 0 && (
                    <div className="mt-2">
                      <div className="text-lg font-bold">
                        {trends[trends.length - 1].value}
                      </div>
                      <div className="text-xs text-gray-500">
                        Latest: {formatTimestamp(trends[trends.length - 1].timestamp)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
