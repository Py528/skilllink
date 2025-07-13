'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends Omit<HTMLMotionProps<"select">, "onDrag"> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder = 'Select an option',
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
      <div className="relative">
        <motion.select
          whileFocus={{ scale: 1.02 }}
          className={`w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/50 focus:border-[#0CF2A0] transition-all duration-200 ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </motion.select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 