
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  ExternalLink,
  MessageCircle,
  Star,
  Clock,
  Users,
  CheckCircle
} from 'lucide-react';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { SmartTooltip } from '@/components/ui/smart-tooltip';
import { ComprehensiveData, ResearchReference, TechnicalDetail, BiomarkerCorrelation } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ComprehensiveAnalysisProps {
  comprehensiveData: ComprehensiveData;
  onDownloadPDF?: () => void;
  onBookConsultation?: () => void;
  className?: string;
}

export function ComprehensiveAnalysis({ 
  comprehensiveData, 
  onDownloadPDF, 
  onBookConsultation, 
  className 
}: ComprehensiveAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'research' | 'technical' | 'correlations' | 'trends'>('analysis');
  const [selectedReference, setSelectedReference] = useState<ResearchReference | null>(null);

  const tabs = [
    { id: 'analysis', label: 'Full Analysis', icon: FileText },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'technical', label: 'Technical', icon: TrendingUp },
    { id: 'correlations', label: 'Correlations', icon: Users },
    { id: 'trends', label: 'Trends', icon: Clock }
  ];

  const mockCorrelationData = comprehensiveData.biomarkerCorrelations.map(corr => ({
    biomarker: corr.biomarker1,
    correlation: corr.correlation,
    significance: corr.significance
  }));

  const mockTrendData = comprehensiveData.historicalTrends.map(trend => ({
    date: trend.date.toISOString().split('T')[0],
    value: trend.value,
    metric: trend.metric
  }));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'text-red-600';
    if (abs >= 0.5) return 'text-orange-600';
    if (abs >= 0.3) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Comprehensive Health Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Professional-grade insights with research backing and technical details
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ minHeight: '44px' }}
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onBookConsultation}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-lg border border-gray-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              style={{ minHeight: '44px' }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Full Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Complete Analysis Report
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {comprehensiveData.fullAnalysis.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Research References
              </h3>
              <span className="text-sm text-gray-500">
                {comprehensiveData.researchReferences.length} studies
              </span>
            </div>
            
            <div className="grid gap-4">
              {comprehensiveData.researchReferences.map((ref, index) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {ref.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {ref.author} • {ref.year}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {ref.relevance}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-500">
                          High relevance
                        </span>
                      </div>
                    </div>
                    {ref.url && (
                      <button className="ml-4 p-2 text-blue-600 hover:text-blue-700 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Tab */}
        {activeTab === 'technical' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Technical Details
              </h3>
              <span className="text-sm text-gray-500">
                {comprehensiveData.technicalDetails.length} parameters
              </span>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parameter
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Methodology
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comprehensiveData.technicalDetails.map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <SmartTooltip
                            term={detail.parameter}
                            definition={`Technical parameter used in bioenergetic analysis`}
                          >
                            {detail.parameter}
                          </SmartTooltip>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {detail.value} {detail.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {detail.methodology}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={cn('font-medium', getConfidenceColor(detail.confidence))}>
                            {detail.confidence}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Correlations Tab */}
        {activeTab === 'correlations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Biomarker Correlations
              </h3>
              <span className="text-sm text-gray-500">
                {comprehensiveData.biomarkerCorrelations.length} correlations
              </span>
            </div>
            
            <InteractiveChart
              data={mockCorrelationData}
              type="scatter"
              title="Biomarker Correlation Matrix"
              xKey="biomarker"
              yKey="correlation"
              className="bg-white"
            />
            
            <div className="grid gap-4">
              {comprehensiveData.biomarkerCorrelations.map((corr, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {corr.biomarker1} ↔ {corr.biomarker2}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {corr.significance}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-lg font-semibold', getCorrelationColor(corr.correlation))}>
                        {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.abs(corr.correlation) >= 0.7 ? 'Strong' : 
                         Math.abs(corr.correlation) >= 0.5 ? 'Moderate' : 
                         Math.abs(corr.correlation) >= 0.3 ? 'Weak' : 'Minimal'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Historical Trends
              </h3>
              <span className="text-sm text-gray-500">
                {comprehensiveData.historicalTrends.length} data points
              </span>
            </div>
            
            <InteractiveChart
              data={mockTrendData}
              type="line"
              title="Health Metrics Over Time"
              xKey="date"
              yKey="value"
              className="bg-white"
            />
            
            <div className="grid gap-4">
              {comprehensiveData.historicalTrends.map((trend, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {trend.metric}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {trend.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {trend.value} {trend.unit}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Achievement Unlock */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              🎉 Achievement Unlocked: Deep Diver
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You&apos;ve explored all layers of your health analysis. You&apos;re committed to understanding your health!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Next Steps
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">
              Schedule a consultation to discuss your results
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">
              Download your comprehensive report
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">
              Share insights with your healthcare provider
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
