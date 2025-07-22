
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentLayer: 1 | 2 | 3;
  completedLayers: number[];
  onLayerClick: (layer: 1 | 2 | 3) => void;
  className?: string;
}

export function ProgressIndicator({ 
  currentLayer, 
  completedLayers, 
  onLayerClick, 
  className 
}: ProgressIndicatorProps) {
  const layers = [
    { id: 1, label: 'Health Snapshot', description: 'Key findings & actions' },
    { id: 2, label: 'Detailed Insights', description: 'Contextual analysis' },
    { id: 3, label: 'Comprehensive', description: 'Full technical details' }
  ];

  const getLayerStatus = (layerId: number) => {
    if (completedLayers.includes(layerId)) return 'completed';
    if (layerId === currentLayer) return 'current';
    return 'upcoming';
  };

  const getLayerIcon = (layerId: number) => {
    const status = getLayerStatus(layerId);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLayerStyles = (layerId: number) => {
    const status = getLayerStatus(layerId);
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'current':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-gray-900">Your Journey</h3>
      <div className="space-y-2">
        {layers.map((layer, index) => (
          <motion.button
            key={layer.id}
            onClick={() => onLayerClick(layer.id as 1 | 2 | 3)}
            className={cn(
              'w-full p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left',
              getLayerStyles(layer.id)
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ minHeight: '44px' }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {getLayerIcon(layer.id)}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {layer.label}
                  </h4>
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    Layer {layer.id}
                  </span>
                </div>
                <p className="text-xs opacity-75 mt-1">
                  {layer.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
