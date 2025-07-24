
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, Share2, Brain, History, Target } from 'lucide-react';
import { HealthSnapshot } from './health-snapshot';
import { DetailedInsights } from './detailed-insights';
import { ComprehensiveAnalysis } from './comprehensive-analysis';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { ProgressiveDisclosureProps, HealthSnapshot as HealthSnapshotType } from '@/lib/types';
import { LabInsightZepClient } from '@/lib/zep-client';
import { cn } from '@/lib/utils';

interface MemoryEnhancedProgressiveDisclosureProps extends ProgressiveDisclosureProps {
  userId: string;
  zepClient?: LabInsightZepClient;
  enableMemoryPersonalization?: boolean;
}

export function MemoryEnhancedProgressiveDisclosure({ 
  assessment, 
  userId,
  zepClient,
  enableMemoryPersonalization = true,
  onLayerChange, 
  onTimeSpentUpdate 
}: MemoryEnhancedProgressiveDisclosureProps) {
  const [currentLayer, setCurrentLayer] = useState<1 | 2 | 3>(1);
  const [completedLayers, setCompletedLayers] = useState<number[]>([]);
  const [layerStartTime, setLayerStartTime] = useState<Date>(new Date());
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [memoryContext, setMemoryContext] = useState<any>(null);
  const [personalizedInsights, setPersonalizedInsights] = useState<string[]>([]);
  const [userJourney, setUserJourney] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memory-enhanced initialization
  useEffect(() => {
    if (enableMemoryPersonalization && zepClient) {
      initializeMemoryContext();
    }
  }, [userId, zepClient, enableMemoryPersonalization]);

  // Enhanced time tracking with memory storage
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Date.now() - layerStartTime.getTime();
      setTotalTimeSpent(prev => prev + 1);
      onTimeSpentUpdate?.(timeSpent);
      
      // Store engagement data in memory
      if (enableMemoryPersonalization && zepClient) {
        storeEngagementData(currentLayer, timeSpent);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [layerStartTime, currentLayer, onTimeSpentUpdate, enableMemoryPersonalization, zepClient]);

  // Memory-aware achievement system
  useEffect(() => {
    checkMemoryEnhancedAchievements();
  }, [totalTimeSpent, completedLayers, achievements, memoryContext]);

  const initializeMemoryContext = async () => {
    if (!zepClient) return;

    try {
      // Retrieve user's historical engagement patterns
      const sessionId = `health-analysis-${userId}-${Date.now()}`;
      const memories = await zepClient.searchMemory(sessionId, 'health analysis engagement', {
        limit: 10,
        searchType: 'similarity'
      });

      if (memories && memories.length > 0) {
        const context = {
          previousEngagement: memories,
          preferredLayers: extractPreferredLayers(memories),
          averageTimeSpent: calculateAverageTimeSpent(memories),
          commonInterests: extractCommonInterests(memories)
        };
        
        setMemoryContext(context);
        generatePersonalizedInsights(context);
      }
    } catch (error) {
      console.error('Failed to initialize memory context:', error);
    }
  };

  const storeEngagementData = async (layer: number, timeSpent: number) => {
    if (!zepClient) return;

    try {
      const sessionId = `health-analysis-${userId}-${Date.now()}`;
      const engagementData = {
        layer,
        timeSpent,
        timestamp: new Date().toISOString(),
        assessmentId: assessment.id,
        userId
      };

      await zepClient.addMemory(sessionId, {
        content: `User spent ${timeSpent}ms on layer ${layer} of health analysis`,
        metadata: {
          type: 'engagement',
          layer,
          timeSpent,
          assessmentType: assessment.assessmentType,
          hipaaCompliant: true,
          confidentialityLevel: 'medium'
        }
      });
    } catch (error) {
      console.error('Failed to store engagement data:', error);
    }
  };

  const extractPreferredLayers = (memories: any[]): number[] => {
    const layerCounts = memories.reduce((acc, memory) => {
      if (memory.metadata?.layer) {
        acc[memory.metadata.layer] = (acc[memory.metadata.layer] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(layerCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([layer]) => parseInt(layer));
  };

  const calculateAverageTimeSpent = (memories: any[]): number => {
    const timeSpentValues = memories
      .filter(m => m.metadata?.timeSpent)
      .map(m => m.metadata.timeSpent);
    
    return timeSpentValues.length > 0 
      ? timeSpentValues.reduce((a, b) => a + b, 0) / timeSpentValues.length 
      : 0;
  };

  const extractCommonInterests = (memories: any[]): string[] => {
    const interests = memories
      .filter(m => m.metadata?.assessmentType)
      .map(m => m.metadata.assessmentType);
    
    return [...new Set(interests)];
  };

  const generatePersonalizedInsights = (context: any) => {
    const insights = [];
    
    if (context.preferredLayers?.includes(3)) {
      insights.push("You typically enjoy deep technical analysis - Layer 3 has comprehensive details waiting for you!");
    }
    
    if (context.averageTimeSpent > 300000) { // 5 minutes
      insights.push("Based on your engagement history, you appreciate thorough health insights.");
    }
    
    if (context.commonInterests?.includes('bioenergetic')) {
      insights.push("Your interest in bioenergetic medicine suggests you'll find the Ray Peat methodology insights particularly valuable.");
    }

    setPersonalizedInsights(insights);
  };

  const checkMemoryEnhancedAchievements = () => {
    // Standard achievements
    if (totalTimeSpent >= 180 && !achievements.includes('engaged')) {
      setAchievements(prev => [...prev, 'engaged']);
    }
    if (completedLayers.length >= 2 && !achievements.includes('explorer')) {
      setAchievements(prev => [...prev, 'explorer']);
    }
    if (completedLayers.length === 3 && !achievements.includes('deep_diver')) {
      setAchievements(prev => [...prev, 'deep_diver']);
    }

    // Memory-enhanced achievements
    if (memoryContext?.averageTimeSpent && totalTimeSpent > memoryContext.averageTimeSpent * 1.5) {
      if (!achievements.includes('super_engaged')) {
        setAchievements(prev => [...prev, 'super_engaged']);
      }
    }

    if (memoryContext?.preferredLayers?.length > 0 && completedLayers.includes(memoryContext.preferredLayers[0])) {
      if (!achievements.includes('pattern_follower')) {
        setAchievements(prev => [...prev, 'pattern_follower']);
      }
    }
  };

  const handleLayerChange = async (layer: 1 | 2 | 3) => {
    // Mark current layer as completed if moving forward
    if (layer > currentLayer && !completedLayers.includes(currentLayer)) {
      setCompletedLayers(prev => [...prev, currentLayer]);
    }
    
    setCurrentLayer(layer);
    setLayerStartTime(new Date());
    onLayerChange?.(layer);
    
    // Store layer navigation in memory
    if (enableMemoryPersonalization && zepClient) {
      await storeLayerNavigation(layer);
    }
    
    // Smooth scroll to top
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const storeLayerNavigation = async (layer: number) => {
    if (!zepClient) return;

    try {
      const sessionId = `health-analysis-${userId}-${Date.now()}`;
      await zepClient.addMemory(sessionId, {
        content: `User navigated to layer ${layer} of health analysis`,
        metadata: {
          type: 'navigation',
          layer,
          timestamp: new Date().toISOString(),
          assessmentId: assessment.id,
          hipaaCompliant: true,
          confidentialityLevel: 'low'
        }
      });
    } catch (error) {
      console.error('Failed to store layer navigation:', error);
    }
  };

  const handleBackToSnapshot = () => {
    handleLayerChange(1);
  };

  const handleExploreInsights = () => {
    handleLayerChange(2);
  };

  const handleViewComprehensive = () => {
    handleLayerChange(3);
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF report...');
    if (!achievements.includes('pdf_downloaded')) {
      setAchievements(prev => [...prev, 'pdf_downloaded']);
    }
  };

  const handleBookConsultation = () => {
    console.log('Opening consultation booking...');
    if (!achievements.includes('consultation_booked')) {
      setAchievements(prev => [...prev, 'consultation_booked']);
    }
  };

  const handleActionClick = (action: any) => {
    console.log('Action clicked:', action);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-6')} ref={containerRef}>
      {/* Memory-Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Memory-Enhanced Health Analysis</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Personalized insights based on your engagement history
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Timer className="w-4 h-4" />
              <span>{formatTime(totalTimeSpent)}</span>
            </div>
            {achievements.length > 0 && (
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">
                  {achievements.length} achievement{achievements.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Personalized Insights */}
        {personalizedInsights.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Personalized for You</span>
            </h3>
            <div className="space-y-2">
              {personalizedInsights.map((insight, index) => (
                <p key={index} className="text-sm text-blue-700">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Progress Indicator */}
      <ProgressIndicator 
        currentLayer={currentLayer} 
        completedLayers={completedLayers}
        memoryContext={memoryContext}
        className="mb-6"
      />

      {/* Layer Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLayer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentLayer === 1 && (
            <HealthSnapshot 
              snapshot={assessment.keyFindings as HealthSnapshotType}
              onExploreInsights={handleExploreInsights}
              onActionClick={handleActionClick}
              memoryContext={memoryContext}
            />
          )}
          
          {currentLayer === 2 && (
            <DetailedInsights 
              insights={assessment.detailedInsights}
              onBackToSnapshot={handleBackToSnapshot}
              onViewComprehensive={handleViewComprehensive}
              memoryContext={memoryContext}
            />
          )}
          
          {currentLayer === 3 && (
            <ComprehensiveAnalysis 
              comprehensiveData={assessment.comprehensiveData}
              onDownloadPDF={handleDownloadPDF}
              onBookConsultation={handleBookConsultation}
              memoryContext={memoryContext}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Memory Context Debug (Development Only) */}
      {process.env.NODE_ENV === 'development' && memoryContext && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Memory Context (Dev Only)</span>
          </h3>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(memoryContext, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
