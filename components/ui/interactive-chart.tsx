
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { InteractiveChartProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function InteractiveChart({ 
  data, 
  type, 
  title, 
  xKey, 
  yKey, 
  className,
  onDataPointClick 
}: InteractiveChartProps) {
  const [activePoint, setActivePoint] = useState<any>(null);

  const handleDataPointClick = (data: any) => {
    setActivePoint(data);
    onDataPointClick?.(data);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 60 },
      onClick: handleDataPointClick,
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <XAxis 
              dataKey={xKey} 
              tickLine={false}
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              label={{ 
                value: xKey, 
                position: 'insideBottom', 
                offset: -15, 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <YAxis 
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{ 
                value: yKey, 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke="#60B5FF" 
              strokeWidth={2}
              dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#FF9149' }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <XAxis 
              dataKey={xKey} 
              tickLine={false}
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              label={{ 
                value: xKey, 
                position: 'insideBottom', 
                offset: -15, 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <YAxis 
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{ 
                value: yKey, 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={yKey} 
              fill="#60B5FF" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <XAxis 
              dataKey={xKey} 
              tickLine={false}
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              label={{ 
                value: xKey, 
                position: 'insideBottom', 
                offset: -15, 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <YAxis 
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{ 
                value: yKey, 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke="#60B5FF" 
              fill="#60B5FF" 
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <XAxis 
              dataKey={xKey} 
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{ 
                value: xKey, 
                position: 'insideBottom', 
                offset: -15, 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <YAxis 
              dataKey={yKey} 
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{ 
                value: yKey, 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              dataKey={yKey} 
              fill="#60B5FF"
            />
          </ScatterChart>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Chart type not supported</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm p-4',
        className
      )}
    >
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {activePoint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 rounded-lg"
        >
          <p className="text-sm font-medium text-blue-900">
            Selected: {activePoint[xKey]} - {activePoint[yKey]}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
