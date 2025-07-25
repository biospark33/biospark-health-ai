
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Brain, 
  TrendingUp, 
  Clock, 
  FileText, 
  Users, 
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface AnalysisSession {
  id: string;
  timestamp: string;
  type: 'memory-enhanced' | 'comprehensive' | 'file-upload';
  status: 'completed' | 'processing' | 'failed';
  biomarkers_count: number;
  insights_generated: number;
}

interface HealthTrend {
  biomarker: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend_direction: 'up' | 'down' | 'stable';
  interpretation: string;
}

interface MemoryStats {
  total_sessions: number;
  health_journey_entries: number;
  memory_entries: number;
  contextual_insights_generated: number;
  last_analysis: string;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState('user-demo-001');
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load memory stats
      const memoryResponse = await fetch(`/api/memory/insights?user_id=${userId}`);
      if (memoryResponse.ok) {
        const memoryData = await memoryResponse.json();
        setMemoryStats(memoryData);
      }

      // Load health trends
      const trendsResponse = await fetch(`/api/memory/trends?user_id=${userId}&days=30`);
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setHealthTrends(trendsData.trends || []);
      }

      // Load session history
      const historyResponse = await fetch(`/api/memory/history?user_id=${userId}&limit=10`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setSessions(historyData.sessions || []);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Health Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Your personalized Ray Peat health journey and analysis history
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Upload Data
            </Button>
          </Link>
          <Link href="/assessment">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {memoryStats?.total_sessions || 0}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Journey Entries</p>
                <p className="text-3xl font-bold text-gray-900">
                  {memoryStats?.health_journey_entries || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Entries</p>
                <p className="text-3xl font-bold text-gray-900">
                  {memoryStats?.memory_entries || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights Generated</p>
                <p className="text-3xl font-bold text-gray-900">
                  {memoryStats?.contextual_insights_generated || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="insights">Memory Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Biomarker Trends (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthTrends.length > 0 ? (
                <div className="space-y-4">
                  {healthTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(trend.trend_direction)}
                        <div>
                          <h3 className="font-semibold">{trend.biomarker}</h3>
                          <p className="text-sm text-gray-600">{trend.interpretation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {trend.current_value} 
                          <span className="text-sm text-gray-500 ml-1">
                            (was {trend.previous_value})
                          </span>
                        </div>
                        <div className={`text-sm ${
                          trend.change_percentage > 0 ? 'text-green-600' : 
                          trend.change_percentage < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No health trends available yet.</p>
                  <p className="text-sm">Complete more analyses to see your biomarker trends.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Recent Analysis Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {session.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Analysis
                            </span>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>{session.biomarkers_count} biomarkers</div>
                        <div>{session.insights_generated} insights</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analysis sessions yet.</p>
                  <p className="text-sm">Start your first analysis to see your session history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Memory & Context Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memoryStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Memory System Status</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Memory Entries:</span>
                          <span className="font-medium">{memoryStats.memory_entries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Health Journey Entries:</span>
                          <span className="font-medium">{memoryStats.health_journey_entries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contextual Insights:</span>
                          <span className="font-medium">{memoryStats.contextual_insights_generated}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Analysis Activity</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Sessions:</span>
                          <span className="font-medium">{memoryStats.total_sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Analysis:</span>
                          <span className="font-medium">
                            {memoryStats.last_analysis ? 
                              formatDate(memoryStats.last_analysis) : 
                              'Never'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Memory Enhancement Benefits</h3>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Personalized analysis based on your health history</li>
                      <li>• Contextual insights that improve over time</li>
                      <li>• Pattern recognition across multiple analyses</li>
                      <li>• Tailored Ray Peat recommendations</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No memory insights available yet.</p>
                  <p className="text-sm">Complete your first analysis to start building your health memory.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/upload">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                Upload Lab Report
              </Button>
            </Link>
            <Link href="/assessment">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Activity className="h-6 w-6" />
                New Assessment
              </Button>
            </Link>
            <Link href="/memory">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Brain className="h-6 w-6" />
                Memory Chat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
