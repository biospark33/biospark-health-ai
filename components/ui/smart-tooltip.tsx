
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartTooltipProps } from '@/lib/types';

export function SmartTooltip({ 
  term, 
  definition, 
  rayPeatContext, 
  children, 
  className 
}: SmartTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'relative cursor-help border-b border-dotted border-blue-500 text-blue-600 hover:text-blue-700 transition-colors',
          className
        )}
      >
        {children}
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 max-w-sm"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {term}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {definition}
                  </p>
                  {rayPeatContext && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-1 mb-1">
                        <BookOpen className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          Ray Peat Context
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        {rayPeatContext}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
