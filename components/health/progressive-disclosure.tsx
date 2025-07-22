
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, Share2 } from 'lucide-react';
import { HealthSnapshot } from './health-snapshot';
import { DetailedInsights } from './detailed-insights';
import { ComprehensiveAnalysis } from './comprehensive-analysis';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { ProgressiveDisclosureProps, HealthSnapshot as HealthSnapshotType } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProgressiveDisclosure({ 
  assessment, 
  onLayerChange, 
  onTimeSpentUpdate 
}: ProgressiveDisclosureProps) {
  const [currentLayer, setCurrentLayer] = useState<1 | 2 | 3>(1);
  const [completedLayers, setCompletedLayers] = useState<number[]>([]);
  const [layerStartTime, setLayerStartTime] = useState<Date>(new Date());
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Track time spent on each layer
    const interval = setInterval(() => {
      const timeSpent = Date.now() - layerStartTime.getTime();
      setTotalTimeSpent(prev => prev + 1); // Increment by 1 second
      onTimeSpentUpdate?.(timeSpent);
    }, 1000);

    return () => clearInterval(interval);
  }, [layerStartTime, onTimeSpentUpdate]);

  useEffect(() => {
    // Check for achievements
    if (totalTimeSpent >= 180 && !achievements.includes('engaged')) {
      setAchievements(prev => [...prev, 'engaged']);
    }
    if (completedLayers.length >= 2 && !achievements.includes('explorer')) {
      setAchievements(prev => [...prev, 'explorer']);
    }
    if (completedLayers.length === 3 && !achievements.includes('deep_diver')) {
      setAchievements(prev => [...prev, 'deep_diver']);
    }
  }, [totalTimeSpent, completedLayers, achievements]);

  const handleLayerChange = (layer: 1 | 2 | 3) => {
    // Mark current layer as completed if moving forward
    if (layer > currentLayer && !completedLayers.includes(currentLayer)) {
      setCompletedLayers(prev => [...prev, currentLayer]);
    }
    
    setCurrentLayer(layer);
    setLayerStartTime(new Date());
    onLayerChange?.(layer);
    
    // Smooth scroll to top
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
    // In a real app, this would generate and download a PDF
    console.log('Downloading PDF report...');
    if (!achievements.includes('pdf_downloaded')) {
      setAchievements(prev => [...prev, 'pdf_downloaded']);
    }
  };

  const handleBookConsultation = () => {
    // In a real app, this would open a booking modal
    console.log('Opening consultation booking...');
    if (!achievements.includes('consultation_booked')) {
      setAchievements(prev => [...prev, 'consultation_booked']);
    }
  };

  const handleActionClick = (action: any) => {
    console.log('Action clicked:', action);
    // In a real app, this would handle the specific action
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Transform assessment data to HealthSnapshot format
  const healthSnapshot: HealthSnapshotType = {
    overallScore: assessment.overallScore,
    keyFindings: assessment.keyFindings,
    immediateActions: assessment.immediateActions,
    quickStats: [
      {
        label: 'Energy Level',
        value: `${Math.round(assessment.energyLevel)}/100`,
        status: assessment.energyLevel >= 80 ? 'optimal' : 
                assessment.energyLevel >= 60 ? 'good' : 
                assessment.energyLevel >= 40 ? 'concerning' : 'critical',
        icon: 'zap',
        trend: assessment.energyLevel >= 75 ? 'up' : 
               assessment.energyLevel >= 50 ? 'stable' : 'down'
      },
      {
        label: 'Metabolic Health',
        value: `${Math.round(assessment.metabolicHealth)}/100`,
        status: assessment.metabolicHealth >= 80 ? 'optimal' : 
                assessment.metabolicHealth >= 60 ? 'good' : 
                assessment.metabolicHealth >= 40 ? 'concerning' : 'critical',
        icon: 'activity',
        trend: assessment.metabolicHealth >= 75 ? 'up' : 
               assessment.metabolicHealth >= 50 ? 'stable' : 'down'
      },
      {
        label: 'Stress Level',
        value: `${Math.round(assessment.stressLevel)}/100`,
        status: assessment.stressLevel <= 20 ? 'optimal' : 
                assessment.stressLevel <= 40 ? 'good' : 
                assessment.stressLevel <= 60 ? 'concerning' : 'critical',
        icon: 'brain',
        trend: assessment.stressLevel <= 30 ? 'down' : 
               assessment.stressLevel <= 50 ? 'stable' : 'up'
      },
      {
        label: 'Thyroid Function',
        value: `${Math.round(assessment.thyroidFunction)}/100`,
        status: assessment.thyroidFunction >= 80 ? 'optimal' : 
                assessment.thyroidFunction >= 60 ? 'good' : 
                assessment.thyroidFunction >= 40 ? 'concerning' : 'critical',
        icon: 'heart',
        trend: assessment.thyroidFunction >= 75 ? 'up' : 
               assessment.thyroidFunction >= 50 ? 'stable' : 'down'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Progress Indicator */}
              <ProgressIndicator
                currentLayer={currentLayer}
                completedLayers={completedLayers}
                onLayerClick={handleLayerChange}
              />
              
              {/* Session Stats */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Session Stats</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Spent</span>
                    <div className="flex items-center space-x-1">
                      <Timer className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatTime(totalTimeSpent)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Layers Explored</span>
                    <span className="text-sm font-medium text-gray-900">
                      {completedLayers.length + 1} / 3
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Achievements</span>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {achievements.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Achievements</h3>
                  <div className="space-y-2">
                    {achievements.map(achievement => (
                      <motion.div
                        key={achievement}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="text-gray-700 capitalize">
                          {achievement.replace('_', ' ')}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div ref={containerRef} className="space-y-6">
              {/* Layer Navigation */}
              {currentLayer > 1 && (
                <motion.button
                  onClick={handleBackToSnapshot}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Health Snapshot</span>
                </motion.button>
              )}
              
              {/* Layer Content */}
              <AnimatePresence mode="wait">
                {currentLayer === 1 && (
                  <motion.div
                    key="snapshot"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HealthSnapshot
                      snapshot={healthSnapshot}
                      onActionClick={handleActionClick}
                      onDetailsClick={handleExploreInsights}
                    />
                  </motion.div>
                )}
                
                {currentLayer === 2 && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DetailedInsights
                      insights={assessment.detailedInsights}
                      onComprehensiveClick={handleViewComprehensive}
                    />
                  </motion.div>
                )}
                
                {currentLayer === 3 && (
                  <motion.div
                    key="comprehensive"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ComprehensiveAnalysis
                      comprehensiveData={assessment.comprehensiveData}
                      onDownloadPDF={handleDownloadPDF}
                      onBookConsultation={handleBookConsultation}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
