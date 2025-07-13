'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface TextareaProps extends Omit<HTMLMotionProps<"textarea">, "onDrag"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <motion.textarea
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/50 focus:border-[#0CF2A0] hover:border-gray-600 transition-all duration-200 resize-none ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
}; 