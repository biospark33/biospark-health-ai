
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Heart, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Calendar
} from 'lucide-react';
import { ExpandableCard } from '@/components/ui/expandable-card';
import { SmartTooltip } from '@/components/ui/smart-tooltip';
import { HealthSnapshot as HealthSnapshotType, KeyFinding, ImmediateAction, QuickStat } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HealthSnapshotProps {
  snapshot: HealthSnapshotType;
  onActionClick?: (action: ImmediateAction) => void;
  onDetailsClick?: () => void;
  className?: string;
}

export function HealthSnapshot({ 
  snapshot, 
  onActionClick, 
  onDetailsClick, 
  className 
}: HealthSnapshotProps) {
  const [viewStartTime] = useState(new Date());
  const [curiosityTimer, setCuriosityTimer] = useState(0);

  useEffect(() => {
    // Start curiosity timer after 30 seconds
    const timer = setTimeout(() => {
      setCuriosityTimer(30);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable' | 'improving' | 'declining') => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatIcon = (icon: string) => {
    switch (icon) {
      case 'activity':
        return <Activity className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'heart':
        return <Heart className="w-5 h-5" />;
      case 'brain':
        return <Brain className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActionIcon = (icon: string) => {
    switch (icon) {
      case 'clock':
        return <Clock className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
      case 'check':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityStyles = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-200"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - snapshot.overallScore / 100)}`}
                className={getScoreColor(snapshot.overallScore)}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - snapshot.overallScore / 100) }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span className={cn('text-2xl font-bold', getScoreColor(snapshot.overallScore))}>
                {Math.round(snapshot.overallScore)}
              </span>
            </motion.div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Overall Health Score
            </h2>
            <p className={cn('text-lg font-medium', getScoreColor(snapshot.overallScore))}>
              {getScoreDescription(snapshot.overallScore)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {snapshot.quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn(
              'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
              stat.status === 'optimal' ? 'bg-green-50 border-green-200' :
              stat.status === 'good' ? 'bg-blue-50 border-blue-200' :
              stat.status === 'concerning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatIcon(stat.icon)}
                <span className="text-sm font-medium text-gray-700">
                  {stat.label}
                </span>
              </div>
              {getTrendIcon(stat.trend)}
            </div>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Key Findings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Key Findings
          </h3>
          <span className="text-sm text-gray-500">
            {snapshot.keyFindings.length} insights
          </span>
        </div>
        
        {snapshot.keyFindings.map((finding, index) => (
          <ExpandableCard
            key={finding.id}
            title={finding.title}
            severity={finding.severity}
            icon={finding.icon}
            summary={finding.summary}
            className="transition-all duration-300 hover:transform hover:scale-[1.01]"
          >
            <div className="space-y-3">
              {finding.value && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Current Value
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {finding.value} {finding.unit}
                  </span>
                </div>
              )}
              
              {finding.trend && (
                <div className="flex items-center space-x-2">
                  {getTrendIcon(finding.trend)}
                  <span className="text-sm text-gray-600 capitalize">
                    {finding.trend} trend
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <SmartTooltip
                  term="Bioenergetic Analysis"
                  definition="Assessment based on Ray Peat's principles of cellular energy production and metabolic efficiency"
                  rayPeatContext="Focuses on mitochondrial function, thyroid health, and hormonal balance as key indicators of optimal metabolism"
                >
                  <span className="text-sm text-blue-600 cursor-help">
                    View bioenergetic context
                  </span>
                </SmartTooltip>
              </div>
            </div>
          </ExpandableCard>
        ))}
      </div>

      {/* Immediate Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Immediate Actions
          </h3>
          <span className="text-sm text-gray-500">
            {snapshot.immediateActions.length} actions
          </span>
        </div>
        
        <div className="space-y-3">
          {snapshot.immediateActions.map((action, index) => (
            <motion.button
              key={action.id}
              onClick={() => onActionClick?.(action)}
              className={cn(
                'w-full p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left',
                getPriorityStyles(action.priority)
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ minHeight: '44px' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                {getActionIcon(action.icon)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">
                      {action.action}
                    </h4>
                    <span className="text-xs bg-white px-2 py-1 rounded-full capitalize">
                      {action.priority}
                    </span>
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {action.timeframe} • {action.category}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Curiosity Gap & Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Want to understand the <span className="text-purple-600">why</span> behind these findings?
            </h3>
          </div>
          
          <p className="text-sm text-gray-600">
            Discover the deeper metabolic patterns and Ray Peat-based insights that led to these recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onDetailsClick}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              style={{ minHeight: '44px' }}
            >
              <Brain className="w-4 h-4" />
              <span>Explore Detailed Insights</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              <Download className="w-4 h-4" />
              <span>Download Summary</span>
            </button>
          </div>
          
          {curiosityTimer > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center space-x-2 text-xs text-purple-600"
            >
              <Clock className="w-4 h-4" />
              <span>
                You've been here for {curiosityTimer} seconds. Ready to dive deeper?
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
