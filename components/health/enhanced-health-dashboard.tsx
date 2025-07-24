
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Target, 
  Activity,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { MemoryEnhancedProgressiveDisclosure } from './memory-enhanced-progressive-disclosure';
import { LabInsightZepClient } from '@/lib/zep-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EnhancedHealthDashboardProps {
  userId: string;
  initialAssessment?: any;
  className?: string;
}

export function EnhancedHealthDashboard({ 
  userId, 
  initialAssessment,
  className 
}: EnhancedHealthDashboardProps) {
  const [currentAssessment, setCurrentAssessment] = useState(initialAssessment);
  const [engagementData, setEngagementData] = useState<any>(null);
  const [memoryPreferences, setMemoryPreferences] = useState<any>(null);
  const [zepClient, setZepClient] = useState<LabInsightZepClient | null>(null);
  const [loading, setLoading] = useState(!initialAssessment);
  const [error, setError] = useState<string | null>(null);

  // Initialize Zep client
  useEffect(() => {
    const client = new LabInsightZepClient({
      apiKey: process.env.NEXT_PUBLIC_ZEP_API_KEY || '',
      userId
    });
    setZepClient(client);
  }, [userId]);

  // Load user data
  useEffect(() => {
    if (!initialAssessment) {
      loadUserData();
    }
    loadEngagementData();
  }, [userId, initialAssessment]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health/memory-enhanced-analysis');
      const data = await response.json();
      
      if (data.assessments && data.assessments.length > 0) {
        // Get the latest assessment details
        const latestAssessmentId = data.assessments[0].id;
        const assessmentResponse = await fetch(
          `/api/health/memory-enhanced-analysis?assessmentId=${latestAssessmentId}&includeMemoryContext=true`
        );
        const assessmentData = await assessmentResponse.json();
        setCurrentAssessment(assessmentData.assessment);
      }
      
      setMemoryPreferences(data.memoryPreferences);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const loadEngagementData = async () => {
    try {
      const response = await fetch('/api/health/engagement-tracking');
      const data = await response.json();
      setEngagementData(data);
    } catch (error) {
      console.error('Failed to load engagement data:', error);
    }
  };

  const handleLayerChange = async (layer: number) => {
    if (!currentAssessment) return;

    try {
      await fetch('/api/health/engagement-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: currentAssessment.id,
          eventType: 'layer_change',
          eventData: { layer }
        })
      });
    } catch (error) {
      console.error('Failed to track layer change:', error);
    }
  };

  const handleTimeSpentUpdate = async (timeSpent: number, layer: number = 1) => {
    if (!currentAssessment) return;

    try {
      await fetch('/api/health/engagement-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: currentAssessment.id,
          eventType: 'time_spent',
          eventData: { timeSpent, layer }
        })
      });
    } catch (error) {
      console.error('Failed to track time spent:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized health insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <button 
          onClick={loadUserData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentAssessment) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Health Assessment Found
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first memory-enhanced health analysis to get started.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start Health Analysis
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <span>Memory-Enhanced Health Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Personalized insights powered by your engagement history
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              BMAD Phase 1
            </Badge>
            {currentAssessment.memoryEnhanced && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Memory Enhanced
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {engagementData?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-xl font-semibold">{engagementData.summary.totalSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg. Time</p>
                    <p className="text-xl font-semibold">
                      {Math.floor(engagementData.summary.averageTimeSpent / 60)}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Achievements</p>
                    <p className="text-xl font-semibold">{engagementData.summary.totalAchievements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Engagement</p>
                    <p className="text-xl font-semibold">
                      {Math.round(engagementData.summary.averageEngagementScore * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Layer Completion Progress */}
      {engagementData?.summary?.layerCompletionRates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Progressive Disclosure Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Layer 1 (Health Snapshot)</span>
                  <span>{engagementData.summary.layerCompletionRates.layer1}%</span>
                </div>
                <Progress value={engagementData.summary.layerCompletionRates.layer1} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Layer 2 (Detailed Insights)</span>
                  <span>{engagementData.summary.layerCompletionRates.layer2}%</span>
                </div>
                <Progress value={engagementData.summary.layerCompletionRates.layer2} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Layer 3 (Comprehensive Analysis)</span>
                  <span>{engagementData.summary.layerCompletionRates.layer3}%</span>
                </div>
                <Progress value={engagementData.summary.layerCompletionRates.layer3} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory-Enhanced Progressive Disclosure */}
      <Card>
        <CardContent className="p-0">
          <MemoryEnhancedProgressiveDisclosure
            assessment={currentAssessment}
            userId={userId}
            zepClient={zepClient}
            enableMemoryPersonalization={true}
            onLayerChange={handleLayerChange}
            onTimeSpentUpdate={handleTimeSpentUpdate}
          />
        </CardContent>
      </Card>

      {/* Memory Preferences */}
      {memoryPreferences && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Your Learning Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Detail Level</p>
                <p className="font-semibold capitalize">{memoryPreferences.preferredDetailLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Communication Style</p>
                <p className="font-semibold capitalize">{memoryPreferences.communicationStyle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Session Time</p>
                <p className="font-semibold">
                  {Math.floor((memoryPreferences.averageSessionTime || 0) / 60)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
