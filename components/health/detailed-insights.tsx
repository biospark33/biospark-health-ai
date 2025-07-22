
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Link2,
  ChevronRight,
  Clock,
  Calendar,
  Download,
  MessageCircle
} from 'lucide-react';
import { ExpandableCard } from '@/components/ui/expandable-card';
import { SmartTooltip } from '@/components/ui/smart-tooltip';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { DetailedInsight } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DetailedInsightsProps {
  insights: DetailedInsight[];
  onInsightExpand?: (insightId: string) => void;
  onComprehensiveClick?: () => void;
  className?: string;
}

export function DetailedInsights({ 
  insights, 
  onInsightExpand, 
  onComprehensiveClick, 
  className 
}: DetailedInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedInsights, setExpandedInsights] = useState<string[]>([]);

  const categories = ['all', ...new Set(insights.map(insight => insight.category))];

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const handleInsightExpand = (insightId: string) => {
    setExpandedInsights(prev => 
      prev.includes(insightId) 
        ? prev.filter(id => id !== insightId)
        : [...prev, insightId]
    );
    onInsightExpand?.(insightId);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'metabolic': 'bg-blue-50 border-blue-200 text-blue-800',
      'hormonal': 'bg-purple-50 border-purple-200 text-purple-800',
      'inflammatory': 'bg-red-50 border-red-200 text-red-800',
      'nutritional': 'bg-green-50 border-green-200 text-green-800',
      'cellular': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'all': 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.all;
  };

  const mockBiomarkerData = [
    { date: 'Jan', value: 75 },
    { date: 'Feb', value: 78 },
    { date: 'Mar', value: 82 },
    { date: 'Apr', value: 85 },
    { date: 'May', value: 88 },
    { date: 'Jun', value: 91 }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
            style={{ minHeight: '44px' }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Detailed Analysis
          </h3>
          <span className="text-sm text-gray-500">
            {filteredInsights.length} insights
          </span>
        </div>

        {filteredInsights.map((insight, index) => (
          <ExpandableCard
            key={insight.id}
            title={insight.title}
            severity="good"
            icon="analysis"
            summary={insight.description}
            onExpand={() => handleInsightExpand(insight.id)}
            className="transition-all duration-300 hover:transform hover:scale-[1.01]"
          >
            <div className="space-y-6">
              {/* Category Badge */}
              <div className="flex items-center space-x-2">
                <span className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                  getCategoryColor(insight.category)
                )}>
                  {insight.category}
                </span>
              </div>

              {/* Ray Peat Context */}
              {insight.rayPeatContext && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-green-800">
                      Ray Peat Context
                    </h4>
                  </div>
                  <p className="text-sm text-green-700">
                    {insight.rayPeatContext}
                  </p>
                </div>
              )}

              {/* Significance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-blue-800">
                    Clinical Significance
                  </h4>
                </div>
                <p className="text-sm text-blue-700">
                  {insight.significance}
                </p>
              </div>

              {/* Related Biomarkers */}
              {insight.relatedBiomarkers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Link2 className="w-4 h-4 text-gray-600" />
                    <h4 className="font-medium text-gray-800">
                      Related Biomarkers
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insight.relatedBiomarkers.map(biomarker => (
                      <SmartTooltip
                        key={biomarker}
                        term={biomarker}
                        definition={`Key biomarker in ${insight.category} analysis`}
                        rayPeatContext="Part of the bioenergetic assessment framework"
                      >
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-help">
                          {biomarker}
                        </span>
                      </SmartTooltip>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Chart */}
              <div className="mt-4">
                <InteractiveChart
                  data={mockBiomarkerData}
                  type="line"
                  title={`${insight.title} - Trend Analysis`}
                  xKey="date"
                  yKey="value"
                  className="bg-white"
                />
              </div>

              {/* Action Items */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium text-gray-800">
                    Action Items
                  </h4>
                </div>
                <ul className="space-y-2">
                  {insight.actionItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curiosity Gap */}
              {insight.curiosityGap && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-purple-800">
                      Did You Know?
                    </h4>
                  </div>
                  <p className="text-sm text-purple-700">
                    {insight.curiosityGap}
                  </p>
                </div>
              )}
            </div>
          </ExpandableCard>
        ))}
      </div>

      {/* Comprehensive Analysis CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200"
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Ready for the <span className="text-indigo-600">complete picture</span>?
            </h3>
          </div>
          
          <p className="text-sm text-gray-600">
            Access full technical analysis, research references, and professional-grade insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onComprehensiveClick}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              style={{ minHeight: '44px' }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>View Comprehensive Analysis</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Research References</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Historical Trends</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>Technical Details</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
