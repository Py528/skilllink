'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  className = '',
  showLabel = false 
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            {Math.round(percentage)}% Complete
          </span>
        </div>
      )}
      <div className="w-full bg-[#111111] rounded-full h-2 border border-gray-800/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="bg-[#0CF2A0] h-full rounded-full shadow-sm shadow-[#0CF2A0]/20"
        />
      </div>
    </div>
  );
}; 