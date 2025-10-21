'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ValidationError } from '@/lib/courseValidation';

interface ValidationIndicatorProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  step: number;
  className?: string;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  errors,
  warnings,
  step,
  className = ''
}) => {
  const stepErrors = errors.filter(e => e.step === step);
  const stepWarnings = warnings.filter(w => w.step === step);

  if (stepErrors.length === 0 && stepWarnings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 text-[#0CF2A0] ${className}`}
      >
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Step completed</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-2 ${className}`}
    >
      {/* Errors */}
      {stepErrors.map((error, index) => (
        <motion.div
          key={`error-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-2 text-red-400"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error.message}</span>
        </motion.div>
      ))}

      {/* Warnings */}
      {stepWarnings.map((warning, index) => (
        <motion.div
          key={`warning-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (stepErrors.length + index) * 0.1 }}
          className="flex items-start gap-2 text-yellow-400"
        >
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{warning.message}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  completionPercentage,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Step Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-[#0CF2A0]">
          {completionPercentage}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-[#0CF2A0] to-[#00D4AA] h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              index + 1 < currentStep
                ? 'bg-[#0CF2A0] text-black'
                : index + 1 === currentStep
                ? 'bg-[#0CF2A0]/20 text-[#0CF2A0] border-2 border-[#0CF2A0]'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {index + 1 < currentStep ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface CompletionTipsProps {
  step: number;
  className?: string;
}

export const CompletionTips: React.FC<CompletionTipsProps> = ({
  step,
  className = ''
}) => {
  const tips = {
    1: [
      "Use a clear, descriptive title that includes your main topic",
      "Write a compelling description that explains what students will learn",
      "Choose the right category to help students find your course",
      "Set the appropriate difficulty level for your target audience"
    ],
    2: [
      "Organize content into logical modules",
      "Each lesson should have a clear learning objective",
      "Include engaging video content with good audio quality",
      "Add supplementary resources like PDFs or code files"
    ],
    3: [
      "Research similar courses to set competitive pricing",
      "Offer free preview lessons to increase conversions",
      "Consider your target audience's budget",
      "Test different price points to optimize revenue"
    ],
    4: [
      "Review all content for accuracy and clarity",
      "Test the course flow from a student's perspective",
      "Ensure all videos play correctly",
      "Double-check pricing and course details"
    ]
  };

  const currentTips = tips[step as keyof typeof tips] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#1a1a1a]/50 border border-gray-700 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-[#0CF2A0]" />
        <span className="text-sm font-medium text-white">Pro Tips</span>
      </div>
      <ul className="space-y-2">
        {currentTips.map((tip, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-sm text-gray-300 flex items-start gap-2"
          >
            <span className="text-[#0CF2A0] mt-1">•</span>
            <span>{tip}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

