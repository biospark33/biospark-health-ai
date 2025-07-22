
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExpandableCardProps } from '@/lib/types';

export function ExpandableCard({ 
  title, 
  severity, 
  icon, 
  summary, 
  children, 
  onExpand,
  className 
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (newExpanded) {
      setStartTime(new Date());
      onExpand?.();
    } else if (startTime) {
      // Track time spent in expanded state
      const timeSpent = Date.now() - startTime.getTime();
      console.log(`Time spent in ${title}: ${timeSpent}ms`);
    }
  };

  const getSeverityStyles = () => {
    switch (severity) {
      case 'optimal':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'good':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      case 'concerning':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
      case 'critical':
        return 'border-red-200 bg-red-50 hover:bg-red-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'optimal':
        return '🟢';
      case 'good':
        return '🔵';
      case 'concerning':
        return '🟡';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md',
        getSeverityStyles(),
        className
      )}
    >
      <button
        onClick={handleExpand}
        className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        style={{ minHeight: '44px' }} // Mobile-first touch target
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <span className="text-xl flex-shrink-0 mt-0.5">
              {getSeverityIcon()}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {title}
                </h3>
                <span className="text-sm text-gray-500 capitalize">
                  {severity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {summary}
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
